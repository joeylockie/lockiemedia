-- Up Migration: Initial Schema Setup

-- Projects Table: Stores project information.
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  creationDate INTEGER
);

-- Tasks Table: Main table for all task items.
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
);

-- User Profile Table: Stores profile info for the single user.
CREATE TABLE IF NOT EXISTS user_profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  displayName TEXT,
  email TEXT,
  role TEXT
);

-- User Preferences Table: A key-value store for user settings.
CREATE TABLE IF NOT EXISTS user_preferences (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Notebooks Table
CREATE TABLE IF NOT EXISTS notebooks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

-- Notes Table
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  notebookId TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  isMarkdown BOOLEAN DEFAULT 0,
  FOREIGN KEY (notebookId) REFERENCES notebooks (id)
);

-- Time Tracking Activities Table
CREATE TABLE IF NOT EXISTS time_activities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  createdAt TEXT NOT NULL
);

-- Time Log Entries Table
CREATE TABLE IF NOT EXISTS time_log_entries (
  id TEXT PRIMARY KEY,
  activityId TEXT NOT NULL,
  startTime TEXT NOT NULL,
  endTime TEXT NOT NULL,
  durationMs INTEGER NOT NULL,
  notes TEXT,
  manuallyAdded BOOLEAN DEFAULT 0,
  FOREIGN KEY (activityId) REFERENCES time_activities (id) ON DELETE CASCADE
);

-- Dev Tracker Release Versions Table
CREATE TABLE IF NOT EXISTS dev_release_versions (
    id INTEGER PRIMARY KEY,
    version TEXT NOT NULL UNIQUE,
    createdAt INTEGER
);

-- Dev Tracker Epics Table
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
);

-- Dev Tracker Tickets Table
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
);

-- Dev Tracker Ticket History Table
CREATE TABLE IF NOT EXISTS dev_ticket_history (
    id INTEGER PRIMARY KEY,
    ticketId INTEGER NOT NULL,
    field TEXT NOT NULL,
    oldValue TEXT,
    newValue TEXT,
    changedAt INTEGER,
    FOREIGN KEY (ticketId) REFERENCES dev_tickets (id) ON DELETE CASCADE
);

-- Dev Tracker Ticket Comments Table
CREATE TABLE IF NOT EXISTS dev_ticket_comments (
    id INTEGER PRIMARY KEY,
    ticketId INTEGER NOT NULL,
    comment TEXT NOT NULL,
    author TEXT,
    createdAt INTEGER,
    FOREIGN KEY (ticketId) REFERENCES dev_tickets (id) ON DELETE CASCADE
);

-- Calendar Events Table
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
);

-- Insert Default Data

-- Ensure the default "No Project" entry with ID 0 exists.
INSERT OR IGNORE INTO projects (id, name, creationDate) VALUES (0, 'No Project', STRFTIME('%s', 'now'));

-- Ensure the default user profile with ID 1 exists.
INSERT OR IGNORE INTO user_profile (id, displayName, role) VALUES (1, 'User', 'admin');

-- Insert default time tracking activities.
INSERT OR IGNORE INTO time_activities (id, name, icon, color, createdAt) VALUES 
  ('activity_1', 'Development', 'fas fa-code', 'sky', STRFTIME('%s', 'now')),
  ('activity_2', 'Meeting', 'fas fa-users', 'purple', STRFTIME('%s', 'now')),
  ('activity_3', 'Design', 'fas fa-paint-brush', 'pink', STRFTIME('%s', 'now')),
  ('activity_4', 'Learning', 'fas fa-book-open', 'yellow', STRFTIME('%s', 'now'));

-- Insert default dev tracker options.
INSERT OR IGNORE INTO user_preferences (key, value) VALUES ('dev_tracker_options', '{"statuses":["Open","In Progress","In Review","Done"],"priorities":["Low","Medium","High"],"types":["Feature","Bug","Chore"],"components":["Backend","Frontend","Database","UI/UX"]}');

-- Insert Default Data

-- Ensure the default "No Project" entry with ID 0 exists.
INSERT OR IGNORE INTO projects (id, name, creationDate) VALUES (0, 'No Project', STRFTIME('%s', 'now'));

-- Ensure the default user profile with ID 1 exists.
INSERT OR IGNORE INTO user_profile (id, displayName, role) VALUES (1, 'User', 'admin');

-- Insert default time tracking activities.
INSERT OR IGNORE INTO time_activities (id, name, icon, color, createdAt) VALUES
  ('activity_1', 'Development', 'fas fa-code', 'sky', STRFTIME('%s', 'now')),
  ('activity_2', 'Meeting', 'fas fa-users', 'purple', STRFTIME('%s', 'now')),
  ('activity_3', 'Design', 'fas fa-paint-brush', 'pink', STRFTIME('%s', 'now')),
  ('activity_4', 'Learning', 'fas fa-book-open', 'yellow', STRFTIME('%s', 'now'));

-- Insert default dev tracker options.
INSERT OR IGNORE INTO user_preferences (key, value) VALUES ('dev_tracker_options', '{"statuses":["Open","In Progress","In Review","Done"],"priorities":["Low","Medium","High"],"types":["Feature","Bug","Chore"],"components":["Backend","Frontend","Database","UI/UX"]}');
