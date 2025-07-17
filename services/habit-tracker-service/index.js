require('dotenv').config({ path: '../../.env' }); // Load environment variables from root
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
app.use(cors());
app.use(express.json());

// Use a specific port for this service, defined in your .env file or default to 3007
const PORT = process.env.HABIT_TRACKER_SERVICE_PORT || 3007; 
const dbPath = process.env.DB_FILE_PATH || '../../lockiedb.sqlite';

// Connect to the database. `fileMustExist: true` ensures we don't accidentally create a new empty db.
const db = new Database(dbPath, { fileMustExist: true });
console.log(`Habit Tracker service connected to database at ${dbPath}`);

// --- API Endpoints ---

// GET all habits and their completion records
app.get('/habits', (req, res) => {
    try {
        // Get all habits
        const habits = db.prepare('SELECT * FROM habits ORDER BY createdAt DESC').all();
        // Get all completions
        const completions = db.prepare('SELECT * FROM habit_completions').all();

        // Attach completions to their respective habits
        habits.forEach(habit => {
            habit.completions = completions.filter(c => c.habit_id === habit.id);
        });

        res.json(habits);
    } catch (error) {
        console.error('Failed to fetch habits:', error);
        res.status(500).json({ error: 'Failed to fetch habits' });
    }
});

// POST a new habit
app.post('/habits', (req, res) => {
    const { name, description, frequency } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Habit name is required' });
    }

    try {
        const stmt = db.prepare('INSERT INTO habits (name, description, frequency, createdAt) VALUES (?, ?, ?, ?)');
        const info = stmt.run(name, description, frequency, Date.now());
        const newHabit = db.prepare('SELECT * FROM habits WHERE id = ?').get(info.lastInsertRowid);
        res.status(201).json(newHabit);
    } catch (error) {
        console.error('Failed to create habit:', error);
        res.status(500).json({ error: 'Failed to create habit' });
    }
});

// DELETE a habit
app.delete('/habits/:id', (req, res) => {
    const { id } = req.params;
    try {
        // The database is set up with ON DELETE CASCADE, so completions will be deleted automatically.
        const stmt = db.prepare('DELETE FROM habits WHERE id = ?');
        const info = stmt.run(id);

        if (info.changes > 0) {
            res.status(200).json({ message: 'Habit deleted successfully' });
        } else {
            res.status(404).json({ error: 'Habit not found' });
        }
    } catch (error) {
        console.error('Failed to delete habit:', error);
        res.status(500).json({ error: 'Failed to delete habit' });
    }
});

// POST a new completion for a habit
app.post('/habits/:id/complete', (req, res) => {
    const { id } = req.params;
    const { completedAt } = req.body; // Allow providing a specific timestamp

    try {
        const stmt = db.prepare('INSERT INTO habit_completions (habit_id, completedAt) VALUES (?, ?)');
        const completionTimestamp = completedAt ? new Date(completedAt).getTime() : Date.now();
        const info = stmt.run(id, completionTimestamp);
        const newCompletion = db.prepare('SELECT * FROM habit_completions WHERE id = ?').get(info.lastInsertRowid);
        res.status(201).json(newCompletion);
    } catch (error) {
        console.error('Failed to mark habit as complete:', error);
        res.status(500).json({ error: 'Failed to mark habit as complete' });
    }
});

// DELETE a specific habit completion (undo)
app.delete('/completions/:id', (req, res) => {
    const { id } = req.params;
    try {
        const stmt = db.prepare('DELETE FROM habit_completions WHERE id = ?');
        const info = stmt.run(id);
        if (info.changes > 0) {
            res.status(200).json({ message: 'Habit completion undone successfully' });
        } else {
            res.status(404).json({ error: 'Completion record not found' });
        }
    } catch (error) {
        console.error('Failed to undo habit completion:', error);
        res.status(500).json({ error: 'Failed to undo habit completion' });
    }
});


app.listen(PORT, () => {
    console.log(`Habit Tracker service running on http://localhost:${PORT}`);
});