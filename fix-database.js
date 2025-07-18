// fix-database.js
// A one-time script to update the database schema for the new habit tracker features.

import Database from 'better-sqlite3';

const dbFile = process.env.DB_FILE_PATH || './lockiedb.sqlite';
const db = new Database(dbFile);

console.log(`Connected to database ${dbFile} to apply schema changes.`);

try {
    // --- Step 1: Add the 'target_count' column to the 'habits' table ---
    console.log("Attempting to add 'target_count' to habits table...");
    try {
        db.exec("ALTER TABLE habits ADD COLUMN target_count INTEGER DEFAULT 1");
        console.log("SUCCESS: 'target_count' column added to habits table.");
    } catch (e) {
        if (e.message.includes("duplicate column name")) {
            console.log("INFO: 'target_count' column already exists in habits table.");
        } else {
            throw e; // Re-throw other errors
        }
    }

    // --- Step 2: Drop the old 'habit_completions' table ---
    console.log("Dropping old 'habit_completions' table (if it exists)...");
    db.exec("DROP TABLE IF EXISTS habit_completions");
    console.log("SUCCESS: Old 'habit_completions' table dropped.");

    // --- Step 3: Re-create the 'habit_completions' table with the correct new structure ---
    console.log("Re-creating 'habit_completions' table with new schema...");
    const createHabitCompletionsTable = `
    CREATE TABLE habit_completions (
        id INTEGER PRIMARY KEY,
        habit_id INTEGER NOT NULL,
        completedAt TEXT NOT NULL,
        completion_count INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
        UNIQUE(habit_id, completedAt)
    );`;
    db.exec(createHabitCompletionsTable);
    console.log("SUCCESS: 'habit_completions' table created with the new, correct schema.");

    console.log("\nDatabase schema update complete!");

} catch (err) {
    console.error('\nERROR during database schema update:', err);
} finally {
    db.close();
    console.log('Database connection closed.');
}