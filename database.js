// This file defines the database schema using Dexie.js.

// The 'Dexie' object is available globally because we added it in index.html
const db = new Dexie('LockieMediaDatabase');

// Define the database schema and versioning.
// This is where we declare our "tables" (object stores) and their "indexes".
db.version(1).stores({
    // '++id' means auto-incrementing primary key.
    // Other fields listed are indexes for fast lookups.
    tasks: '++id, dueDate, projectId, label',
    projects: '++id, name',
    notebooks: '++id, name',
    notes: '++id, notebookId, updatedAt',
    time_activities: '++id, name',
    time_log_entries: '++id, activityId, startTime',
    calendar_events: '++id, start',
    habits: '++id, name',
    habit_completions: '++id, habit_id, completedAt',
    // We also need a simple key-value store for user profile and preferences.
    app_state: 'key' // A simple table with a 'key' as the primary key.
});

// We are exporting the 'db' object so other files can use it to
// interact with the database.
export default db;