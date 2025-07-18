import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3010;
// CORRECTED: The fallback path is now relative to the CWD set in ecosystem.json
const dbPath = process.env.DB_FILE_PATH || './lockiedb.sqlite';

const db = new Database(dbPath, { fileMustExist: true });
console.log(`[Habit Service] Connected to database at ${dbPath}`);

// ... THE REST OF THE FILE REMAINS THE SAME ...
// (You only need to change the dbPath line)

// --- Get All Habit Data ---
// Fetches all habits and their corresponding completions.
app.get('/api/habits-data', (req, res) => {
    console.log('[Habit Service] GET /api/habits-data received.');
    try {
        // Updated to select the new target_count column
        const habits = db.prepare('SELECT id, name, description, target_count, createdAt FROM habits').all();
        // Updated to select the new completion_count column
        const habit_completions = db.prepare('SELECT id, habit_id, completedAt, completion_count FROM habit_completions').all();
        res.json({ habits, habit_completions });
    } catch (error) {
        console.error('[Habit Service] Error fetching habits data:', error.message);
        res.status(500).json({ error: 'Failed to retrieve habits data.' });
    }
});

// --- Create a New Habit ---
app.post('/api/habits', (req, res) => {
    console.log('[Habit Service] POST /api/habits received.');
    const { name, description, target_count } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Habit name is required.' });
    }

    try {
        const stmt = db.prepare('INSERT INTO habits (name, description, target_count, createdAt) VALUES (?, ?, ?, ?)');
        const info = stmt.run(name, description, target_count || 1, Date.now());
        res.status(201).json({ id: info.lastInsertRowid, name, description, target_count: target_count || 1 });
    } catch (error) {
        console.error('[Habit Service] Error creating habit:', error.message);
        res.status(500).json({ error: 'Failed to create habit.' });
    }
});

// --- Update a Habit ---
app.put('/api/habits/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, target_count } = req.body;
    console.log(`[Habit Service] PUT /api/habits/${id} received.`);

    if (!name || !target_count) {
        return res.status(400).json({ error: 'Name and target count are required.' });
    }

    try {
        const stmt = db.prepare('UPDATE habits SET name = ?, description = ?, target_count = ? WHERE id = ?');
        const info = stmt.run(name, description, target_count, id);

        if (info.changes > 0) {
            res.status(200).json({ message: 'Habit updated successfully.' });
        } else {
            res.status(404).json({ error: 'Habit not found.' });
        }
    } catch (error) {
        console.error(`[Habit Service] Error updating habit ${id}:`, error.message);
        res.status(500).json({ error: 'Failed to update habit.' });
    }
});

// --- Delete a Habit ---
app.delete('/api/habits/:id', (req, res) => {
    const { id } = req.params;
    console.log(`[Habit Service] DELETE /api/habits/${id} received.`);
    try {
        const stmt = db.prepare('DELETE FROM habits WHERE id = ?');
        const info = stmt.run(id);

        if (info.changes > 0) {
            // The ON DELETE CASCADE constraint will handle deleting completions
            res.status(200).json({ message: 'Habit deleted successfully.' });
        } else {
            res.status(404).json({ error: 'Habit not found.' });
        }
    } catch (error) {
        console.error(`[Habit Service] Error deleting habit ${id}:`, error.message);
        res.status(500).json({ error: 'Failed to delete habit.' });
    }
});


// --- Log or Update a Habit Completion (Upsert) ---
app.post('/api/habits/completions', (req, res) => {
    console.log('[Habit Service] POST /api/habits/completions received.');
    const { habit_id, completedAt, completion_count } = req.body; // YYYY-MM-DD format for date

    if (!habit_id || !completedAt || completion_count === undefined) {
        return res.status(400).json({ error: 'Missing required completion data.' });
    }

    // If completion_count is 0, we delete the record for that day.
    if (completion_count === 0) {
        try {
            const stmt = db.prepare('DELETE FROM habit_completions WHERE habit_id = ? AND completedAt = ?');
            stmt.run(habit_id, completedAt);
            return res.status(200).json({ message: 'Completion removed.' });
        } catch (error) {
            console.error('[Habit Service] Error deleting completion:', error.message);
            return res.status(500).json({ error: 'Failed to remove completion.' });
        }
    }

    // Otherwise, we "upsert" - insert a new record or update the count of an existing one.
    try {
        const upsertStmt = db.prepare(`
            INSERT INTO habit_completions (habit_id, completedAt, completion_count)
            VALUES (@habit_id, @completedAt, @completion_count)
            ON CONFLICT(habit_id, completedAt) DO UPDATE SET
            completion_count = @completion_count
        `);
        upsertStmt.run({ habit_id, completedAt, completion_count });
        res.status(200).json({ message: 'Completion logged successfully.' });
    } catch (error) {
        console.error('[Habit Service] Error upserting completion:', error.message);
        res.status(500).json({ error: 'Failed to log completion.' });
    }
});


app.listen(PORT, () => {
    console.log(`[Habit Service] Listening on http://localhost:${PORT}`);
});