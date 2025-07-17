require('dotenv').config({ path: '../../.env' });
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3010;
const dbPath = process.env.DB_FILE_PATH || '../../lockiedb.sqlite';

const db = new Database(dbPath, { fileMustExist: true });
console.log(`[Habit Service] Connected to database at ${dbPath}`);

app.get('/api/habits-data', (req, res) => {
    try {
        const habits = db.prepare('SELECT * FROM habits').all();
        const habit_completions = db.prepare('SELECT * FROM habit_completions').all();
        res.json({ habits, habit_completions });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve habits data.' });
    }
});

app.post('/api/habits-data', (req, res) => {
    const { habits, habit_completions } = req.body;
    if (!habits || !habit_completions) {
        return res.status(400).json({ error: 'Missing data.' });
    }

    const transaction = db.transaction(() => {
        db.prepare('DELETE FROM habit_completions').run();
        db.prepare('DELETE FROM habits').run();
        const insertHabit = db.prepare('INSERT INTO habits (id, name, description, createdAt) VALUES (@id, @name, @description, @createdAt)');
        const insertCompletion = db.prepare('INSERT INTO habit_completions (id, habit_id, completedAt) VALUES (@id, @habit_id, @completedAt)');
        for (const habit of habits) {
            insertHabit.run({
                id: habit.id,
                name: habit.name,
                description: habit.description,
                createdAt: habit.createdAt
            });
        }
        for (const completion of habit_completions) {
            insertCompletion.run(completion);
        }
    });

    try {
        transaction();
        res.status(200).json({ message: 'Habits data synchronized.' });
    } catch (error) {
        console.error('[Habit Service] Transaction failed:', error.message);
        res.status(500).json({ error: 'Synchronization failed.' });
    }
});

app.listen(PORT, () => {
    console.log(`[Habit Service] Listening on http://localhost:${PORT}`);
});