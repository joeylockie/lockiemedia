import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

// -- Setup --
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3000;
const dbFile = path.join(__dirname, 'lockiedb.sqlite');

// -- Database Connection (SQLite) --
const db = new Database(dbFile, { verbose: console.log });
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON'); // <-- FIX: This line enables foreign key enforcement.
console.log(`Connected to SQLite database at ${dbFile}`);

// -- Middleware --
app.use(cors());
app.use(express.json({ limit: '10mb' })); 
app.use(express.static('public'));

// -- Helper Functions for Data Conversion --

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

const parseTimeLogEntry = (entry) => ({
    ...entry,
    manuallyAdded: entry.manuallyAdded === 1,
});

const stringifyTimeLogEntry = (entry) => ({
    ...entry,
    manuallyAdded: entry.manuallyAdded ? 1 : 0,
});


// -- API Routes --

/**
 * GET /api/data
 * Reads all data from all tables and sends it to the frontend.
 */
app.get('/api/data', (req, res) => {
  console.log('GET /api/data request received');
  try {
    const tasks = db.prepare('SELECT * FROM tasks').all().map(parseTask);
    const projects = db.prepare('SELECT * FROM projects').all();
    const userProfile = db.prepare('SELECT * FROM user_profile WHERE id = 1').get();
    
    const prefsArray = db.prepare('SELECT * FROM user_preferences').all();
    const userPreferences = prefsArray.reduce((acc, pref) => {
        acc[pref.key] = pref.value;
        return acc;
    }, {});

    const notebooks = db.prepare('SELECT * FROM notebooks').all();
    const notes = db.prepare('SELECT * FROM notes').all();
    const time_activities = db.prepare('SELECT * FROM time_activities').all();
    const time_log_entries = db.prepare('SELECT * FROM time_log_entries').all().map(parseTimeLogEntry);

    const responseData = {
      tasks,
      projects,
      userProfile,
      userPreferences,
      notebooks,
      notes,
      time_activities,
      time_log_entries,
      kanbanColumns: [], // Keep for compatibility
    };

    res.json(responseData);
  } catch (error) {
    console.error('Error in GET /api/data:', error);
    res.status(500).json({ error: 'Failed to retrieve data from the database.' });
  }
});

/**
 * POST /api/data
 * Receives the entire application state and saves it to the database.
 */
app.post('/api/data', (req, res) => {
  console.log('POST /api/data request received');
  const incomingData = req.body;

  if (typeof incomingData !== 'object' || incomingData === null) {
    return res.status(400).json({ error: 'Invalid data format. Expected an object.' });
  }

  const transaction = db.transaction(() => {
    // Clear existing data from all tables (except default project/profile)
    db.prepare('DELETE FROM tasks').run();
    db.prepare('DELETE FROM projects WHERE id != 0').run();
    db.prepare('DELETE FROM user_preferences').run();
    db.prepare('DELETE FROM notes').run();
    db.prepare('DELETE FROM notebooks').run();
    db.prepare('DELETE FROM time_log_entries').run();
    db.prepare('DELETE FROM time_activities').run();

    // Prepare insert statements
    const insertTask = db.prepare('INSERT INTO tasks (id, text, notes, completed, creationDate, completedDate, dueDate, time, priority, label, projectId, isReminderSet, reminderDate, reminderTime, reminderEmail, recurrence) VALUES (@id, @text, @notes, @completed, @creationDate, @completedDate, @dueDate, @time, @priority, @label, @projectId, @isReminderSet, @reminderDate, @reminderTime, @reminderEmail, @recurrence)');
    const insertProject = db.prepare('INSERT INTO projects (id, name, creationDate) VALUES (@id, @name, @creationDate)');
    const insertPreference = db.prepare('INSERT INTO user_preferences (key, value) VALUES (@key, @value)');
    const updateUserProfile = db.prepare('UPDATE user_profile SET displayName = @displayName, email = @email, role = @role WHERE id = 1');
    const insertNotebook = db.prepare('INSERT INTO notebooks (id, name, createdAt) VALUES (@id, @name, @createdAt)');
    const insertNote = db.prepare('INSERT INTO notes (id, title, content, notebookId, createdAt, updatedAt) VALUES (@id, @title, @content, @notebookId, @createdAt, @updatedAt)');
    const insertActivity = db.prepare('INSERT INTO time_activities (id, name, icon, color, createdAt) VALUES (@id, @name, @icon, @color, @createdAt)');
    const insertLogEntry = db.prepare('INSERT INTO time_log_entries (id, activityId, startTime, endTime, durationMs, notes, manuallyAdded) VALUES (@id, @activityId, @startTime, @endTime, @durationMs, @notes, @manuallyAdded)');

    // Insert data
    if (incomingData.tasks) for (const task of incomingData.tasks) insertTask.run(stringifyTask(task));
    if (incomingData.projects) for (const project of incomingData.projects) { if (project.id !== 0) insertProject.run(project); }
    if (incomingData.userPreferences) for (const [key, value] of Object.entries(incomingData.userPreferences)) insertPreference.run({ key, value });
    if (incomingData.userProfile) updateUserProfile.run(incomingData.userProfile);
    if (incomingData.notebooks) for (const notebook of incomingData.notebooks) insertNotebook.run(notebook);
    if (incomingData.notes) for (const note of incomingData.notes) insertNote.run(note);
    if (incomingData.time_activities) for (const activity of incomingData.time_activities) insertActivity.run(activity);
    if (incomingData.time_log_entries) for (const entry of incomingData.time_log_entries) insertLogEntry.run(stringifyTimeLogEntry(entry));
  });

  try {
    transaction();
    res.status(200).json({ message: 'Data saved successfully to SQLite!' });
  } catch (error) {
    console.error('Error in POST /api/data transaction:', error);
    res.status(500).json({ error: 'Failed to save data to the database.' });
  }
});


// -- Start Server --
app.listen(PORT, () => {
  console.log(`LockieMedia server is running at http://localhost:${PORT} and using SQLite.`);
});