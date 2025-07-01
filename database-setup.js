// database-setup.js

import Database from 'better-sqlite3';

// Define the name of the database file.
const dbFile = process.env.DB_FILE_PATH || 'lockiedb.sqlite'; // CHANGED THIS LINE

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

  // --- Dev Tracker Release Versions Table (NEW) ---
  const createDevReleaseVersionsTable = `
  CREATE TABLE IF NOT EXISTS dev_release_versions (
      id INTEGER PRIMARY KEY,
      version TEXT NOT NULL UNIQUE,
      createdAt INTEGER
  );`;
  db.exec(createDevReleaseVersionsTable);

  // --- Dev Tracker Epics Table (MODIFIED) ---
  const createDevEpicsTable = `
  CREATE TABLE IF NOT EXISTS dev_epics (
    id INTEGER PRIMARY KEY,
    key TEXT UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'To Do',
    priority TEXT DEFAULT 'Medium',
    releaseVersion TEXT,
    ticketCounter INTEGER DEFAULT 0,
    createdAt INTEGER
  );`;
  db.exec(createDevEpicsTable);

  // --- Dev Tracker Tickets Table (MODIFIED) ---
  const createDevTicketsTable = `
  CREATE TABLE IF NOT EXISTS dev_tickets (
    id INTEGER PRIMARY KEY,
    fullKey TEXT UNIQUE,
    epicId INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Open',
    priority TEXT DEFAULT 'Medium',
    type TEXT DEFAULT 'Feature',
    component TEXT,
    releaseVersion TEXT,
    affectedVersion TEXT,
    createdAt INTEGER,
    FOREIGN KEY (epicId) REFERENCES dev_epics (id) ON DELETE CASCADE,
    FOREIGN KEY (affectedVersion) REFERENCES dev_release_versions (version) ON DELETE SET NULL
  );`;
  db.exec(createDevTicketsTable);

  // --- Dev Tracker Ticket History Table (NEW) ---
  const createDevTicketHistoryTable = `
  CREATE TABLE IF NOT EXISTS dev_ticket_history (
      id INTEGER PRIMARY KEY,
      ticketId INTEGER NOT NULL,
      field TEXT NOT NULL,
      oldValue TEXT,
      newValue TEXT,
      changedAt INTEGER,
      FOREIGN KEY (ticketId) REFERENCES dev_tickets (id) ON DELETE CASCADE
  );`;
  db.exec(createDevTicketHistoryTable);

  // --- Dev Tracker Ticket Comments Table (NEW) ---
  const createDevTicketCommentsTable = `
  CREATE TABLE IF NOT EXISTS dev_ticket_comments (
      id INTEGER PRIMARY KEY,
      ticketId INTEGER NOT NULL,
      comment TEXT NOT NULL,
      author TEXT,
      createdAt INTEGER,
      FOREIGN KEY (ticketId) REFERENCES dev_tickets (id) ON DELETE CASCADE
  );`;
  db.exec(createDevTicketCommentsTable);

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
  // Here, we ensure that some essential default data exists.
  // We use INSERT OR IGNORE to prevent errors if the data is already there.

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

  const insertPreference = db.prepare('INSERT OR IGNORE INTO user_preferences (key, value) VALUES (?, ?)');
  const devTrackerOptions = {
    statuses: ['Open', 'In Progress', 'In Review', 'Done'],
    priorities: ['Low', 'Medium', 'High'],
    types: ['Feature', 'Bug', 'Chore'],
    components: ['Backend', 'Frontend', 'Database', 'UI/UX']
  };
  insertPreference.run('dev_tracker_options', JSON.stringify(devTrackerOptions));

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