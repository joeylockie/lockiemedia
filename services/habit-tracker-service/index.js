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
    console.log('[Habit Service] GET /api/habits-data received.');
    try {
        const habits = db.prepare('SELECT * FROM habits').all();
        const habit_completions = db.prepare('SELECT * FROM habit_completions').all();
        res.json({ habits, habit_completions });
    } catch (error) {
        console.error('[Habit Service] Error fetching habits data:', error.message);
        res.status(500).json({ error: 'Failed to retrieve habits data.' });
    }
});

app.post('/api/habits-data', (req, res) => {
    console.log('[Habit Service] POST /api/habits-data received.');
    const { habits, habit_completions } = req.body;

    if (!habits || !habit_completions) {
        return res.status(400).json({ error: 'Missing data in request.' });
    }

    const transaction = db.transaction(() => {
        try {
            db.prepare('DELETE FROM habit_completions').run();
            db.prepare('DELETE FROM habits').run();

            // This INSERT statement now expects 'frequency' again.
            const insertHabit = db.prepare('INSERT INTO habits (id, name, description, frequency, createdAt) VALUES (@id, @name, @description, @frequency, @createdAt)');
            const insertCompletion = db.prepare('INSERT INTO habit_completions (id, habit_id, completedAt) VALUES (@id, @habit_id, @completedAt)');

            for (const habit of habits) {
                // This is the key fix: We ensure a 'frequency' property always exists.
                const habitToInsert = {
                    id: habit.id,
                    name: habit.name,
                    description: habit.description,
                    createdAt: habit.createdAt,
                    frequency: habit.frequency || 'daily' // Add a default value
                };
                insertHabit.run(habitToInsert);
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

app.listen(PORT, () => {
    console.log(`[Habit Service] Listening on http://localhost:${PORT}`);
});