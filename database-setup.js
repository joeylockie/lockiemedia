import Database from 'better-sqlite3';

// Define the name of the database file.
const dbFile = 'lockiedb.sqlite';

// Create a new database connection.
// `verbose: console.log` will print out each SQL statement to the console,
// which is very helpful for seeing what's happening.
const db = new Database(dbFile, { verbose: console.log });

console.log(`Connected to database ${dbFile}`);

/**
 * --- DATABASE SCHEMA ---
 * This function defines the structure of our database. It creates tables
 * to hold tasks, projects, and user profile information.
 * It's designed to only run if the tables don't already exist.
 */
function setupDatabase() {
  console.log('Running database setup...');

  // --- Projects Table ---
  // Stores project information.
  const createProjectsTable = `
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    creationDate INTEGER
  );`;
  db.exec(createProjectsTable);

  // --- Tasks Table ---
  // This is the main table for storing all task items.
  // We use TEXT for complex data like recurrence rules,
  // which will be stored as JSON strings.
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
  // A simple table to store profile info for the single user.
  const createUserProfileTable = `
  CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    displayName TEXT,
    email TEXT,
    role TEXT
  );`;
  db.exec(createUserProfileTable);
  
  // --- User Preferences Table ---
  // A key-value store for user settings.
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
  // --- MODIFICATION: Added isMarkdown column ---
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


  // --- Insert Default Data ---
  // Here, we ensure that some essential default data exists.
  // We use INSERT OR IGNORE to prevent errors if the data is already there.

  // Ensure the "No Project" project exists with ID 0.
  const insertDefaultProject = db.prepare('INSERT OR IGNORE INTO projects (id, name, creationDate) VALUES (?, ?, ?)');
  insertDefaultProject.run(0, 'No Project', Date.now());

  // Ensure a default user profile exists.
  const insertDefaultProfile = db.prepare('INSERT OR IGNORE INTO user_profile (id, displayName, role) VALUES (?, ?, ?)');
  insertDefaultProfile.run(1, 'User', 'admin');

  // Insert default time tracking activities
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
  // Always close the database connection.
  db.close();
  console.log('Database connection closed.');
}