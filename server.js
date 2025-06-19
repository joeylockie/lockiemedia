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
// This creates a permanent connection to our SQLite database file.
// We enable WAL (Write-Ahead Logging) mode, which improves performance and concurrency.
const db = new Database(dbFile, { verbose: console.log });
db.pragma('journal_mode = WAL');
console.log(`Connected to SQLite database at ${dbFile}`);

// -- Middleware --
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support large data posts from the client
app.use(express.static('public'));      // Serve all frontend files

// -- Helper Functions for Data Conversion --
// SQLite doesn't have a boolean type, so we use 1 for true and 0 for false.
// It also doesn't have an array/object type, so we store those as JSON text.
// These functions help convert data between the formats the frontend expects and the formats the database stores.

const parseTask = (task) => ({
  ...task,
  completed: task.completed === 1,
  isReminderSet: task.isReminderSet === 1,
  // Parse JSON strings back into arrays/objects
  subTasks: task.subTasks ? JSON.parse(task.subTasks) : [],
  dependsOn: task.dependsOn ? JSON.parse(task.dependsOn) : [],
  blocksTasks: task.blocksTasks ? JSON.parse(task.blocksTasks) : [],
  // Parse recurrence string back into an object
  recurrence: task.recurrence ? JSON.parse(task.recurrence) : null,
});

const stringifyTask = (task) => ({
    ...task,
    completed: task.completed ? 1 : 0,
    isReminderSet: task.isReminderSet ? 1 : 0,
    // Stringify arrays/objects for storage
    subTasks: JSON.stringify(task.subTasks || []),
    dependsOn: JSON.stringify(task.dependsOn || []),
    blocksTasks: JSON.stringify(task.blocksTasks || []),
    // Stringify recurrence object for storage
    recurrence: JSON.stringify(task.recurrence || null),
});


// -- API Routes --
// These endpoints mimic the old lowdb API to ensure the frontend works without changes.

/**
 * GET /api/data
 * This endpoint reads all data from the various SQLite tables,
 * assembles it into a single JSON object that matches the old db.json structure,
 * and sends it to the frontend.
 */
app.get('/api/data', (req, res) => {
  console.log('GET /api/data request received');
  try {
    const tasksStmt = db.prepare('SELECT * FROM tasks');
    const rawTasks = tasksStmt.all();
    // We must parse each task to convert booleans and JSON strings
    const tasks = rawTasks.map(parseTask);

    const projectsStmt = db.prepare('SELECT * FROM projects');
    const projects = projectsStmt.all();
    
    const userProfileStmt = db.prepare('SELECT * FROM user_profile WHERE id = 1');
    const userProfile = userProfileStmt.get();
    
    const userPreferencesStmt = db.prepare('SELECT * FROM user_preferences');
    const prefsArray = userPreferencesStmt.all();
    const userPreferences = prefsArray.reduce((acc, pref) => {
        acc[pref.key] = pref.value;
        return acc;
    }, {});

    const responseData = {
      tasks,
      projects,
      // We send an empty kanbanColumns for compatibility, as it's no longer used.
      kanbanColumns: [], 
      userPreferences,
      userProfile
    };

    res.json(responseData);
  } catch (error) {
    console.error('Error in GET /api/data:', error);
    res.status(500).json({ error: 'Failed to retrieve data from the database.' });
  }
});

/**
 * POST /api/data
 * This endpoint receives the entire application state from the frontend.
 * It uses a database transaction to safely delete all existing data and
 * insert the new data, ensuring the database remains consistent.
 */
app.post('/api/data', (req, res) => {
  console.log('POST /api/data request received');
  const incomingData = req.body;

  if (typeof incomingData !== 'object' || incomingData === null) {
    return res.status(400).json({ error: 'Invalid data format. Expected an object.' });
  }

  // A transaction ensures that all database operations succeed or none of them do.
  // This prevents the database from being left in a partially updated state if an error occurs.
  const transaction = db.transaction(() => {
    // Clear existing data
    db.prepare('DELETE FROM tasks').run();
    // We don't delete from projects, but rather update or insert. We'll clear non-default ones.
    db.prepare('DELETE FROM projects WHERE id != 0').run();
    db.prepare('DELETE FROM user_preferences').run();
    // Note: We don't clear user_profile as it's a single entry.

    // Prepare statements for inserting new data
    const insertTask = db.prepare(`
      INSERT INTO tasks (id, text, notes, completed, creationDate, completedDate, dueDate, time, priority, label, projectId, isReminderSet, reminderDate, reminderTime, reminderEmail, recurrence, subTasks, dependsOn, blocksTasks)
      VALUES (@id, @text, @notes, @completed, @creationDate, @completedDate, @dueDate, @time, @priority, @label, @projectId, @isReminderSet, @reminderDate, @reminderTime, @reminderEmail, @recurrence, @subTasks, @dependsOn, @blocksTasks)
    `);

    const insertOrReplaceProject = db.prepare(`
        INSERT OR REPLACE INTO projects (id, name, creationDate) 
        VALUES (@id, @name, @creationDate)
    `);

    const insertOrReplacePreference = db.prepare(`
        INSERT OR REPLACE INTO user_preferences (key, value) 
        VALUES (@key, @value)
    `);

    const updateUserProfile = db.prepare(`
        UPDATE user_profile SET displayName = @displayName, email = @email, role = @role WHERE id = 1
    `);


    // Insert new tasks
    if (incomingData.tasks && Array.isArray(incomingData.tasks)) {
      for (const task of incomingData.tasks) {
        // We must stringify the task to convert booleans/objects for the database
        insertTask.run(stringifyTask(task));
      }
    }

    // Insert or replace projects
    if (incomingData.projects && Array.isArray(incomingData.projects)) {
        for (const project of incomingData.projects) {
            if (project.id === 0) continue; // Skip default "No Project"
            insertOrReplaceProject.run(project);
        }
    }
    
    // Update user profile
    if (incomingData.userProfile) {
        updateUserProfile.run(incomingData.userProfile);
    }
    
    // Insert or replace user preferences
    if (incomingData.userPreferences) {
        for (const [key, value] of Object.entries(incomingData.userPreferences)) {
            insertOrReplacePreference.run({ key, value });
        }
    }
  });

  try {
    transaction(); // Execute the transaction
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
