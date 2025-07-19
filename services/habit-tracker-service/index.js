import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

console.log('[Habit Tracker Service] Starting up...');

// --- CONFIGURATION ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3010; // Default port for habit tracker

// --- DATABASE CONNECTION ---
let db;
try {
    // Use the environment variable for the DB path, or fall back to a relative path
    const dbFile = process.env.DB_FILE_PATH || path.join(__dirname, '../../lockiedb.sqlite');
    db = new Database(dbFile);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    console.log(`[Habit Tracker Service] Connected to SQLite database at ${dbFile}`);
} catch (error) {
    console.error('[Habit Tracker Service] FATAL: Could not connect to the database.', error);
    process.exit(1); // Exit if we can't connect to the DB
}

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// --- API ROUTES ---

// GET / - Get all habit data
// This is used by the API gateway during the initial data load.
app.get('/', (req, res) => {
    try {
        const habits = db.prepare('SELECT * FROM habits ORDER BY display_order').all();
        const habit_completions = db.prepare('SELECT * FROM habit_completions').all();
        res.json({ habits, habit_completions });
    } catch (error) {
        console.error('[Habit Tracker Service] Error fetching all habit data:', error);
        res.status(500).json({ error: 'Failed to retrieve habit data.' });
    }
});

// POST / - Sync all habit data
// This is used by the API gateway to save all data at once.
app.post('/', (req, res) => {
    const { habits, habit_completions } = req.body;
    if (!habits || !habit_completions) {
        return res.status(400).json({ error: 'Invalid data format for habit sync.' });
    }
    try {
        db.transaction(() => {
            // Clear existing data
            db.prepare('DELETE FROM habit_completions').run();
            db.prepare('DELETE FROM habits').run();

            // Insert new data
            const habitStmt = db.prepare('INSERT INTO habits (id, name, icon, color, display_order, target_count) VALUES (?, ?, ?, ?, ?, ?)');
            const completionStmt = db.prepare('INSERT INTO habit_completions (id, habit_id, date, completion_count) VALUES (?, ?, ?, ?)');

            for (const habit of habits) {
                habitStmt.run(habit.id, habit.name, habit.icon, habit.color, habit.display_order, habit.target_count);
            }
            for (const completion of habit_completions) {
                completionStmt.run(completion.id, completion.habit_id, completion.date, completion.completion_count);
            }
        })();
        res.status(200).json({ message: 'Habit data synced successfully.' });
    } catch (error) {
        console.error('[Habit Tracker Service] Error syncing habit data:', error);
        res.status(500).json({ error: 'Failed to sync habit data.' });
    }
});


// --- SERVER ---
app.listen(PORT, () => {
    console.log(`[Habit Tracker Service] Listening on port ${PORT}`);
});

// --- GRACEFUL SHUTDOWN ---
process.on('SIGINT', () => {
    console.log('[Habit Tracker Service] SIGINT signal received: closing HTTP server');
    if (db) {
        db.close();
        console.log('[Habit Tracker Service] Database connection closed.');
    }
    process.exit(0);
});