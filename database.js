// This file defines the database schema using Dexie.js.

import Dexie from './dexie.mjs';

const db = new Dexie('LockieMediaDatabase');

// --- Version 1 ---
// This is the original schema. We never delete old versions.
db.version(1).stores({
    tasks: '++id, dueDate, projectId, label',
    projects: '++id, name',
    notebooks: '++id, name',
    notes: '++id, notebookId, updatedAt',
    time_activities: '++id, name',
    time_log_entries: '++id, activityId, startTime',
    calendar_events: '++id, start',
    habits: '++id, name',
    habit_completions: '++id, habit_id, completedAt', // The old definition
    app_state: 'key'
});

// --- Version 2 (The Performance Fix) ---
// We create a new version to add the compound index.
db.version(2).stores({
    // We only need to list the table that is changing.
    habit_completions: '++id, [habit_id+completedAt]' // The new, faster index
});

// --- Version 3 (Notes Feature Update) ---
// Add isPinned and color to the notes table for pinning and color-coding.
db.version(3).stores({
    notes: '++id, notebookId, updatedAt, isPinned' // isPinned is indexed for sorting
});


// We are exporting the 'db' object so other files can use it to
// interact with the database.
export default db;