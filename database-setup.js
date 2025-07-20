// database-setup.js

import Database from 'better-sqlite3';

// Define the name of the database file.
const dbFile = process.env.DB_FILE_PATH || 'lockiedb.sqlite';

// Create a new database connection.
const db = new Database(dbFile, { verbose: console.log });

console.log(`Connected to database ${dbFile}`);

/**
 * --- DATABASE SCHEMA ---
 * This function defines the structure of our database.
 * It's designed to only run if the tables don't already exist.
 */
function setupDatabase() {
  console.log('Running database setup...');

  // --- Projects Table ---
  const createProjectsTable = `
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    creationDate INTEGER
  );`;
  db.exec(createProjectsTable);

  // --- Tasks Table ---
  const createTasksTable = `
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    text TEXT NOT NULL,
    notes TEXT,
    completed BOOLEAN NOT NULL DEFAULT 0,
    creationDate INTEGER,
    completedDate INTEGER,
    dueDate TEXT,
    time TEXT,
    priority TEXT DEFAULT 'medium',
    label TEXT,
    projectId INTEGER,
    isReminderSet BOOLEAN DEFAULT 0,
    reminderDate TEXT,
    reminderTime TEXT,
    reminderEmail TEXT,
    recurrence TEXT,
    FOREIGN KEY (projectId) REFERENCES projects (id)
  );`;
  db.exec(createTasksTable);

  // --- User Profile Table ---
  const createUserProfileTable = `
  CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    displayName TEXT,
    email TEXT,
    role TEXT
  );`;
  db.exec(createUserProfileTable);

  // --- User Preferences Table ---
  const createUserPreferencesTable = `
  CREATE TABLE IF NOT EXISTS user_preferences (
    key TEXT PRIMARY KEY,
    value TEXT
  );`;
  db.exec(createUserPreferencesTable);

  // --- Notebooks Table ---
  const createNotebooksTable = `
  CREATE TABLE IF NOT EXISTS notebooks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );`;
  db.exec(createNotebooksTable);

  // --- Notes Table ---
  const createNotesTable = `
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    notebookId TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    isMarkdown BOOLEAN DEFAULT 0,
    FOREIGN KEY (notebookId) REFERENCES notebooks (id)
  );`;
  db.exec(createNotesTable);

  // --- Time Tracking Activities Table ---
  const createTimeActivitiesTable = `
  CREATE TABLE IF NOT EXISTS time_activities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    createdAt TEXT NOT NULL
  );`;
  db.exec(createTimeActivitiesTable);

  // --- Time Log Entries Table ---
  const createTimeLogEntriesTable = `
  CREATE TABLE IF NOT EXISTS time_log_entries (
    id TEXT PRIMARY KEY,
    activityId TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    durationMs INTEGER NOT NULL,
    notes TEXT,
    manuallyAdded BOOLEAN DEFAULT 0,
    FOREIGN KEY (activityId) REFERENCES time_activities (id) ON DELETE CASCADE
  );`;
  db.exec(createTimeLogEntriesTable);

  // --- Habit Tables ---
  const createHabitsTable = `
  CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      target_count INTEGER DEFAULT 1, -- The goal for completions per day
      createdAt INTEGER
  );`;
  db.exec(createHabitsTable);

  const createHabitCompletionsTable = `
  CREATE TABLE IF NOT EXISTS habit_completions (
      id INTEGER PRIMARY KEY,
      habit_id INTEGER NOT NULL,
      completedAt TEXT NOT NULL, -- Storing date as YYYY-MM-DD string
      completion_count INTEGER NOT NULL DEFAULT 1, -- How many times it was completed
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
      UNIQUE(habit_id, completedAt) -- Ensures only one entry per habit per day
  );`;
  db.exec(createHabitCompletionsTable);

  // --- Pomodoro Tables ---
  const createPomodoroSessionsTable = `
  CREATE TABLE IF NOT EXISTS pomodoro_sessions (
      id INTEGER PRIMARY KEY,
      startTime INTEGER NOT NULL,
      endTime INTEGER,
      duration INTEGER NOT NULL, -- in minutes
      type TEXT NOT NULL, -- 'work', 'short_break', 'long_break'
      status TEXT DEFAULT 'completed', -- 'completed', 'interrupted'
      createdAt INTEGER
  );`;
  db.exec(createPomodoroSessionsTable);

  // --- Calendar Events Table ---
  const createCalendarEventsTable = `
  CREATE TABLE IF NOT EXISTS calendar_events (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      isAllDay BOOLEAN NOT NULL DEFAULT 0,
      color TEXT DEFAULT 'blue',
      createdAt INTEGER,
      updatedAt INTEGER
  );`;
  db.exec(createCalendarEventsTable);


  // --- Insert Default Data ---
  const insertDefaultProject = db.prepare('INSERT OR IGNORE INTO projects (id, name, creationDate) VALUES (?, ?, ?)');
  insertDefaultProject.run(0, 'No Project', Date.now());

  const insertDefaultProfile = db.prepare('INSERT OR IGNORE INTO user_profile (id, displayName, role) VALUES (?, ?, ?)');
  insertDefaultProfile.run(1, 'User', 'admin');

  const defaultActivities = [
    { id: 'activity_1', name: 'Development', icon: 'fas fa-code', color: 'sky', createdAt: new Date().toISOString() },
    { id: 'activity_2', name: 'Meeting', icon: 'fas fa-users', color: 'purple', createdAt: new Date().toISOString() },
    { id: 'activity_3', name: 'Design', icon: 'fas fa-paint-brush', color: 'pink', createdAt: new Date().toISOString() },
    { id: 'activity_4', name: 'Learning', icon: 'fas fa-book-open', color: 'yellow', createdAt: new Date().toISOString() }
  ];
  const insertActivity = db.prepare('INSERT OR IGNORE INTO time_activities (id, name, icon, color, createdAt) VALUES (@id, @name, @icon, @color, @createdAt)');
  for (const activity of defaultActivities) {
    insertActivity.run(activity);
  }

  console.log('Database setup complete.');
}

// Execute the main function.
try {
  setupDatabase();
} catch (err) {
  console.error('Error during database setup:', err);
} finally {
  db.close();
  console.log('Database connection closed.');
}