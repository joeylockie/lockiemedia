import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';

// -- Setup --
const app = express();
const PORT = 3004;

// --- Database Connection ---
const dbFile = '/root/lockiemedia/lockiedb.sqlite';
const db = new Database(dbFile, { verbose: console.log });
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
console.log(`[Task Service] Connected to SQLite database at ${dbFile}`);

// -- Middleware --
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// -- Helper Functions --
const parseTask = (task) => ({
  ...task,
  completed: task.completed === 1,
  isReminderSet: task.isReminderSet === 1,
  recurrence: task.recurrence ? JSON.parse(task.recurrence) : null,
});

const stringifyTask = (task) => ({
    ...task,
    completed: task.completed ? 1 : 0,
    isReminderSet: task.isReminderSet ? 1 : 0,
    recurrence: JSON.stringify(task.recurrence || null),
});

// -- API Routes --

// GET /api/core-data (Remains the same for fetching all initial data)
app.get('/api/core-data', (req, res) => {
  console.log('[Task Service] GET /api/core-data request received');
  try {
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY creationDate DESC').all().map(parseTask);
    const projects = db.prepare('SELECT * FROM projects').all();
    const userProfile = db.prepare('SELECT * FROM user_profile WHERE id = 1').get();
    const prefsArray = db.prepare('SELECT * FROM user_preferences').all();
    const userPreferences = prefsArray.reduce((acc, pref) => {
        try {
            if (pref.value.startsWith('{') || pref.value.startsWith('[')) {
                acc[pref.key] = JSON.parse(pref.value);
            } else {
                acc[pref.key] = pref.value;
            }
        } catch (e) {
            acc[pref.key] = pref.value;
        }
        return acc;
    }, {});

    res.json({ tasks, projects, userProfile, userPreferences });
  } catch (error) {
    console.error('[Task Service] Error in GET /api/core-data:', error);
    res.status(500).json({ error: 'Failed to retrieve core data.' });
  }
});

// NEW: Add a single task
app.post('/api/tasks', (req, res) => {
    console.log('[Task Service] POST /api/tasks request received');
    try {
        const taskData = req.body;
        const stmt = db.prepare('INSERT INTO tasks (id, text, notes, completed, creationDate, completedDate, dueDate, time, priority, label, projectId, isReminderSet, reminderDate, reminderTime, reminderEmail, recurrence) VALUES (@id, @text, @notes, @completed, @creationDate, @completedDate, @dueDate, @time, @priority, @label, @projectId, @isReminderSet, @reminderDate, @reminderTime, @reminderEmail, @recurrence)');
        const result = stmt.run(stringifyTask(taskData));
        res.status(201).json({ id: result.lastInsertRowid, ...taskData });
    } catch (error) {
        console.error('[Task Service] Error in POST /api/tasks:', error);
        res.status(500).json({ error: 'Failed to add task.' });
    }
});

// NEW: Update a single task
app.patch('/api/tasks/:id', (req, res) => {
    console.log(`[Task Service] PATCH /api/tasks/${req.params.id} request received`);
    try {
        const taskId = parseInt(req.params.id, 10);
        const taskUpdateData = req.body;

        const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
        if (!existingTask) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        const updatedTask = { ...parseTask(existingTask), ...taskUpdateData };

        const stmt = db.prepare('UPDATE tasks SET text=@text, notes=@notes, completed=@completed, completedDate=@completedDate, dueDate=@dueDate, time=@time, priority=@priority, label=@label, projectId=@projectId, isReminderSet=@isReminderSet, reminderDate=@reminderDate, reminderTime=@reminderTime, reminderEmail=@reminderEmail, recurrence=@recurrence WHERE id = @id');
        stmt.run(stringifyTask({ ...updatedTask, id: taskId }));

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error(`[Task Service] Error in PATCH /api/tasks/${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to update task.' });
    }
});

// NEW: Delete a single task
app.delete('/api/tasks/:id', (req, res) => {
    console.log(`[Task Service] DELETE /api/tasks/${req.params.id} request received`);
    try {
        const taskId = parseInt(req.params.id, 10);
        const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
        const result = stmt.run(taskId);

        if (result.changes > 0) {
            res.status(200).json({ message: 'Task deleted successfully.' });
        } else {
            res.status(404).json({ error: 'Task not found.' });
        }
    } catch (error) {
        console.error(`[Task Service] Error in DELETE /api/tasks/${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to delete task.' });
    }
});


// DEPRECATED: We are removing the old, destructive way of saving data.
// The '/api/core-data' POST endpoint is intentionally removed.


// -- Start Server --
app.listen(PORT, () => {
  console.log(`[Task Service] Listening on port ${PORT}`);
});
