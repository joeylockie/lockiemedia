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
  // We use TEXT for complex data like subTasks or recurrence rules,
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
    subTasks TEXT,
    dependsOn TEXT,
    blocksTasks TEXT,
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


  // --- Insert Default Data ---
  // Here, we ensure that some essential default data exists.
  // We use INSERT OR IGNORE to prevent errors if the data is already there.

  // Ensure the "No Project" project exists with ID 0.
  const insertDefaultProject = db.prepare('INSERT OR IGNORE INTO projects (id, name, creationDate) VALUES (?, ?, ?)');
  insertDefaultProject.run(0, 'No Project', Date.now());

  // Ensure a default user profile exists.
  const insertDefaultProfile = db.prepare('INSERT OR IGNORE INTO user_profile (id, displayName, role) VALUES (?, ?, ?)');
  insertDefaultProfile.run(1, 'User', 'admin');

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
