import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

// -- Setup --
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3004;

// --- Database Connection (CORRECTED PATH) ---
const dbFile = '/root/lockiemedia-dev/lockiedb.sqlite';
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

const sanitizeTaskForDB = (task) => {
    return {
        id: task.id,
        text: task.text,
        notes: task.notes,
        completed: task.completed,
        creationDate: task.creationDate,
        completedDate: task.completedDate,
        dueDate: task.dueDate,
        time: task.time,
        priority: task.priority,
        label: task.label,
        projectId: task.projectId,
        isReminderSet: task.isReminderSet,
        reminderDate: task.reminderDate,
        reminderTime: task.reminderTime,
        reminderEmail: task.reminderEmail,
        recurrence: task.recurrence,
    };
};


// -- API Routes --
app.get('/api/core-data', (req, res) => {
  console.log('[Task Service] GET /api/core-data request received');
  try {
    const tasks = db.prepare('SELECT * FROM tasks').all().map(parseTask);
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

    const responseData = {
      tasks,
      projects,
      userProfile,
      userPreferences,
      kanbanColumns: [],
    };
    res.json(responseData);
  } catch (error) {
    console.error('[Task Service] Error in GET /api/core-data:', error);
    res.status(500).json({ error: 'Failed to retrieve core data.' });
  }
});

app.post('/api/core-data', (req, res) => {
  console.log('[Task Service] POST /api/core-data request received');
  const incomingData = req.body;

  if (typeof incomingData !== 'object' || incomingData === null) {
    return res.status(400).json({ error: 'Invalid data format.' });
  }

  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM tasks').run();
    db.prepare('DELETE FROM projects WHERE id != 0').run();
    db.prepare('DELETE FROM user_preferences').run();

    const insertTask = db.prepare('INSERT INTO tasks (id, text, notes, completed, creationDate, completedDate, dueDate, time, priority, label, projectId, isReminderSet, reminderDate, reminderTime, reminderEmail, recurrence) VALUES (@id, @text, @notes, @completed, @creationDate, @completedDate, @dueDate, @time, @priority, @label, @projectId, @isReminderSet, @reminderDate, @reminderTime, @reminderEmail, @recurrence)');
    const insertProject = db.prepare('INSERT INTO projects (id, name, creationDate) VALUES (@id, @name, @creationDate)');
    const insertPreference = db.prepare('INSERT INTO user_preferences (key, value) VALUES (@key, @value)');
    const updateUserProfile = db.prepare('UPDATE user_profile SET displayName = @displayName, email = @email, role = @role WHERE id = 1');

    if (incomingData.tasks) {
        for (const task of incomingData.tasks) {
            const sanitizedTask = sanitizeTaskForDB(task);
            insertTask.run(stringifyTask(sanitizedTask));
        }
    }

    if (incomingData.projects) for (const project of incomingData.projects) { if (project.id !== 0) insertProject.run(project); }
    
    if (incomingData.userPreferences) {
        for (const [key, value] of Object.entries(incomingData.userPreferences)) {
            const valueToInsert = typeof value === 'object' && value !== null ? JSON.stringify(value) : value;
            insertPreference.run({ key: key, value: valueToInsert });
        }
    }

    if (incomingData.userProfile) {
        const existingProfile = db.prepare('SELECT * FROM user_profile WHERE id = 1').get();
        const updatedProfile = { ...existingProfile, ...incomingData.userProfile };
        updateUserProfile.run(updatedProfile);
    }
  });

  try {
    transaction();
    res.status(200).json({ message: 'Core data saved successfully!' });
  } catch (error) {
    console.error('[Task Service] Error in POST /api/core-data transaction:', error);
    res.status(500).json({ error: 'Failed to save core data.' });
  }
});

// -- Start Server --
app.listen(PORT, () => {
  console.log(`[Task Service] Listening on port ${PORT}`);
});