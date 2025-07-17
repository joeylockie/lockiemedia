require('dotenv').config({ path: '../../.env' }); // Load environment variables from root
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
app.use(cors());
app.use(express.json());

// Use a specific port for this service, defined in your .env or default to 3008
const PORT = process.env.POMODORO_SERVICE_PORT || 3008;
const dbPath = process.env.DB_FILE_PATH || '../../lockiedb.sqlite';

// Connect to the database
const db = new Database(dbPath, { fileMustExist: true });
console.log(`Pomodoro service connected to database at ${dbPath}`);

// --- API Endpoints ---

// GET all pomodoro sessions
app.get('/sessions', (req, res) => {
    try {
        const sessions = db.prepare('SELECT * FROM pomodoro_sessions ORDER BY createdAt DESC').all();
        res.json(sessions);
    } catch (error) {
        console.error('Failed to fetch pomodoro sessions:', error);
        res.status(500).json({ error: 'Failed to fetch pomodoro sessions' });
    }
});

// POST a new pomodoro session
app.post('/sessions', (req, res) => {
    const { startTime, endTime, duration, type, status } = req.body;

    if (!startTime || !duration || !type) {
        return res.status(400).json({ error: 'Missing required session data: startTime, duration, and type are required.' });
    }

    try {
        const stmt = db.prepare(
            'INSERT INTO pomodoro_sessions (startTime, endTime, duration, type, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)'
        );
        const info = stmt.run(startTime, endTime, duration, type, status || 'completed', Date.now());
        const newSession = db.prepare('SELECT * FROM pomodoro_sessions WHERE id = ?').get(info.lastInsertRowid);
        res.status(201).json(newSession);
    } catch (error) {
        console.error('Failed to create pomodoro session:', error);
        res.status(500).json({ error: 'Failed to create pomodoro session' });
    }
});

// DELETE a pomodoro session
app.delete('/sessions/:id', (req, res) => {
    const { id } = req.params;
    try {
        const stmt = db.prepare('DELETE FROM pomodoro_sessions WHERE id = ?');
        const info = stmt.run(id);

        if (info.changes > 0) {
            res.status(200).json({ message: 'Session deleted successfully' });
        } else {
            res.status(404).json({ error: 'Session not found' });
        }
    } catch (error) {
        console.error('Failed to delete session:', error);
        res.status(500).json({ error: 'Failed to delete session' });
    }
});


app.listen(PORT, () => {
    console.log(`Pomodoro service running on http://localhost:${PORT}`);
});