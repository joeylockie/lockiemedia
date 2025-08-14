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

// --- Version 4 (Time Log Optimization) ---
// This version migrates time log entries to a more compact format to save space.
db.version(4).stores({
    time_log_entries: '++id, a, s' // New, shorter index names for activityId and startTime
}).upgrade(tx => {
    // This upgrade function will run for every user once.
    // It will transform the existing data to the new format.
    return tx.table('time_log_entries').toCollection().modify(entry => {
        // 1. Rename properties to shorter versions
        entry.s = entry.startTime;
        entry.e = entry.endTime;
        entry.a = entry.activityId;
        entry.n = entry.notes;
        entry.m = entry.manuallyAdded;

        // 2. Delete the old, long property names
        delete entry.startTime;
        delete entry.endTime;
        delete entry.activityId;
        delete entry.notes;
        delete entry.manuallyAdded;

        // 3. Delete the redundant durationMs property
        delete entry.durationMs;
    });
});

// --- Version 5 (Remove Notes Feature) ---
// This version removes the 'notes' and 'notebooks' tables.
db.version(5).stores({
    notebooks: null,
    notes: null
});

// --- Version 6 (Remove Projects Feature) ---
// This version removes the 'projects' table and the 'projectId' index from tasks.
db.version(6).stores({
    tasks: '++id, dueDate, label', // Removed projectId from the schema
    projects: null // This deletes the projects table
}).upgrade(tx => {
    // This upgrade function will remove the projectId property from all existing tasks.
    return tx.table('tasks').toCollection().modify(task => {
        delete task.projectId;
    });
});


// We are exporting the 'db' object so other files can use it to
// interact with the database.
export default db;