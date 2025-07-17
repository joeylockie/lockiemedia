require('dotenv').config({ path: '../../.env' }); // Load environment variables from root
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
app.use(cors());
app.use(express.json());

// Use a specific port for this service, defined in your .env file or default to 3008
const PORT = process.env.HABIT_TRACKER_SERVICE_PORT || 3010;
const dbPath = process.env.DB_FILE_PATH || '../../lockiedb.sqlite';

// Connect to the database. `fileMustExist: true` ensures we don't accidentally create a new empty db.
const db = new Database(dbPath, { fileMustExist: true });
console.log(`[Habit Service] Connected to database at ${dbPath}`);

// --- NEW: API Endpoints for Data Sync ---

/**
 * GET /api/habits-data
 * Fetches all habit and completion data from the database.
 * This is called by the API Gateway to gather data for the frontend.
 */
app.get('/api/habits-data', (req, res) => {
    console.log('[Habit Service] GET /api/habits-data received.');
    try {
        const habits = db.prepare('SELECT * FROM habits').all();
        const habit_completions = db.prepare('SELECT * FROM habit_completions').all();
        
        res.json({
            habits,
            habit_completions
        });
    } catch (error) {
        console.error('[Habit Service] Error fetching habits data:', error.message);
        res.status(500).json({ error: 'Failed to retrieve habits data.' });
    }
});

/**
 * POST /api/habits-data
 * Receives a full snapshot of habit data and replaces the existing data.
 */
app.post('/api/habits-data', (req, res) => {
    console.log('[Habit Service] POST /api/habits-data received.');
    const { habits, habit_completions } = req.body;

    if (!habits || !habit_completions) {
        return res.status(400).json({ error: 'Missing habits or habit_completions data in request.' });
    }

    const transaction = db.transaction(() => {
        try {
            db.prepare('DELETE FROM habit_completions').run();
            db.prepare('DELETE FROM habits').run();

            const insertHabit = db.prepare('INSERT INTO habits (id, name, description, createdAt) VALUES (@id, @name, @description, @createdAt)');
            const insertCompletion = db.prepare('INSERT INTO habit_completions (id, habit_id, completedAt) VALUES (@id, @habit_id, @completedAt)');

            for (const habit of habits) {
                insertHabit.run(habit);
            }
            for (const completion of habit_completions) {
                insertCompletion.run(completion);
            }
        } catch (error) {
            console.error('[Habit Service] Transaction failed:', error.message);
            throw error;
        }
    });

    try {
        transaction();
        res.status(200).json({ message: 'Habits data successfully synchronized.' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred during data synchronization.' });
    }
});


// --- OLD: Original Fine-Grained Endpoints ---
// (These are being kept for now but are not used by the gateway's data sync)

app.get('/habits', (req, res) => {
    try {
        const habits = db.prepare('SELECT * FROM habits ORDER BY createdAt DESC').all();
        const completions = db.prepare('SELECT * FROM habit_completions').all();
        habits.forEach(habit => {
            habit.completions = completions.filter(c => c.habit_id === habit.id);
        });
        res.json(habits);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch habits' });
    }
});

app.post('/habits', (req, res) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Habit name is required' });
    try {
        const stmt = db.prepare('INSERT INTO habits (name, description, createdAt) VALUES (?, ?, ?, ?)');
        const info = stmt.run(name, description, Date.now());
        const newHabit = db.prepare('SELECT * FROM habits WHERE id = ?').get(info.lastInsertRowid);
        res.status(201).json(newHabit);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create habit' });
    }
});

app.delete('/habits/:id', (req, res) => {
    const { id } = req.params;
    try {
        const stmt = db.prepare('DELETE FROM habits WHERE id = ?');
        const info = stmt.run(id);
        if (info.changes > 0) res.status(200).json({ message: 'Habit deleted successfully' });
        else res.status(404).json({ error: 'Habit not found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete habit' });
    }
});

app.post('/habits/:id/complete', (req, res) => {
    const { id } = req.params;
    const { completedAt } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO habit_completions (habit_id, completedAt) VALUES (?, ?)');
        const completionTimestamp = completedAt ? new Date(completedAt).getTime() : Date.now();
        const info = stmt.run(id, completionTimestamp);
        const newCompletion = db.prepare('SELECT * FROM habit_completions WHERE id = ?').get(info.lastInsertRowid);
        res.status(201).json(newCompletion);
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark habit as complete' });
    }
});

app.delete('/completions/:id', (req, res) => {
    const { id } = req.params;
    try {
        const stmt = db.prepare('DELETE FROM habit_completions WHERE id = ?');
        const info = stmt.run(id);
        if (info.changes > 0) res.status(200).json({ message: 'Habit completion undone' });
        else res.status(404).json({ error: 'Completion record not found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to undo habit completion' });
    }
});


app.listen(PORT, () => {
    console.log(`[Habit Service] Listening on http://localhost:${PORT}`);
});