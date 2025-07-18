// fix-database-v2.js
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// --- This part creates a reliable, absolute path to the database ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFile = path.resolve(__dirname, 'lockiedb.sqlite');
// ---

const db = new Database(dbFile);
console.log(`[FIX V2] Connected to database at absolute path: ${dbFile}`);

try {
    console.log("[FIX V2] Starting schema update...");

    // --- Step 1: Add 'target_count' to habits table ---
    console.log("[FIX V2] Checking 'habits' table...");
    const habitsInfo = db.prepare("PRAGMA table_info(habits)").all();
    const hasTargetCount = habitsInfo.some(col => col.name === 'target_count');

    if (!hasTargetCount) {
        db.exec("ALTER TABLE habits ADD COLUMN target_count INTEGER DEFAULT 1");
        console.log("   -> SUCCESS: Added 'target_count' column.");
    } else {
        console.log("   -> INFO: 'target_count' column already exists.");
    }

    // --- Step 2: Recreate 'habit_completions' table correctly ---
    console.log("[FIX V2] Rebuilding 'habit_completions' table to ensure correct schema...");
    db.exec("DROP TABLE IF EXISTS habit_completions");
    console.log("   -> SUCCESS: Dropped old 'habit_completions' table.");

    const createCompletionsTableSQL = `
    CREATE TABLE habit_completions (
        id INTEGER PRIMARY KEY,
        habit_id INTEGER NOT NULL,
        completedAt TEXT NOT NULL,
        completion_count INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
        UNIQUE(habit_id, completedAt)
    );`;
    db.exec(createCompletionsTableSQL);
    console.log("   -> SUCCESS: Re-created 'habit_completions' table with correct schema.");

    console.log("\n[FIX V2] Database schema update complete!");

} catch (err) {
    console.error('\n[FIX V2] ERROR during database schema update:', err);
} finally {
    db.close();
    console.log('[FIX V2] Database connection closed.');
}