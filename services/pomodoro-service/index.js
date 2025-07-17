require('dotenv').config({ path: '../../.env' }); // Load environment variables from root
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
app.use(cors());
app.use(express.json());

// Use a specific port for this service, defined in your .env or default to 3009
const PORT = process.env.POMODORO_SERVICE_PORT || 3009;
const dbPath = process.env.DB_FILE_PATH || '../../lockiedb.sqlite';

// Connect to the database
const db = new Database(dbPath, { fileMustExist: true });
console.log(`[Pomodoro Service] Connected to database at ${dbPath}`);


// --- NEW: API Endpoints for Data Sync ---

/**
 * GET /api/pomodoro-data
 * Fetches all pomodoro session data from the database.
 */
app.get('/api/pomodoro-data', (req, res) => {
    console.log('[Pomodoro Service] GET /api/pomodoro-data received.');
    try {
        const pomodoro_sessions = db.prepare('SELECT * FROM pomodoro_sessions').all();
        res.json({
            pomodoro_sessions
        });
    } catch (error) {
        console.error('[Pomodoro Service] Error fetching pomodoro data:', error.message);
        res.status(500).json({ error: 'Failed to retrieve pomodoro data.' });
    }
});

/**
 * POST /api/pomodoro-data
 * Receives a full snapshot of pomodoro data and replaces the existing data.
 */
app.post('/api/pomodoro-data', (req, res) => {
    console.log('[Pomodoro Service] POST /api/pomodoro-data received.');
    const { pomodoro_sessions } = req.body;

    if (!pomodoro_sessions) {
        return res.status(400).json({ error: 'Missing pomodoro_sessions data in request.' });
    }

    const transaction = db.transaction(() => {
        try {
            db.prepare('DELETE FROM pomodoro_sessions').run();
            const insertSession = db.prepare(
                'INSERT INTO pomodoro_sessions (id, startTime, endTime, duration, type, status, createdAt) VALUES (@id, @startTime, @endTime, @duration, @type, @status, @createdAt)'
            );
            for (const session of pomodoro_sessions) {
                insertSession.run(session);
            }
        } catch (error) {
            console.error('[Pomodoro Service] Transaction failed:', error.message);
            throw error;
        }
    });

    try {
        transaction();
        res.status(200).json({ message: 'Pomodoro data successfully synchronized.' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred during data synchronization.' });
    }
});


// --- OLD: Original Fine-Grained Endpoints ---
// (These are being kept for now but are not used by the gateway's data sync)

app.get('/sessions', (req, res) => {
    try {
        const sessions = db.prepare('SELECT * FROM pomodoro_sessions ORDER BY createdAt DESC').all();
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pomodoro sessions' });
    }
});

app.post('/sessions', (req, res) => {
    const { startTime, endTime, duration, type, status } = req.body;
    if (!startTime || !duration || !type) {
        return res.status(400).json({ error: 'Missing required session data' });
    }
    try {
        const stmt = db.prepare(
            'INSERT INTO pomodoro_sessions (startTime, endTime, duration, type, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)'
        );
        const info = stmt.run(startTime, endTime, duration, type, status || 'completed', Date.now());
        const newSession = db.prepare('SELECT * FROM pomodoro_sessions WHERE id = ?').get(info.lastInsertRowid);
        res.status(201).json(newSession);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create pomodoro session' });
    }
});

app.delete('/sessions/:id', (req, res) => {
    const { id } = req.params;
    try {
        const stmt = db.prepare('DELETE FROM pomodoro_sessions WHERE id = ?');
        const info = stmt.run(id);
        if (info.changes > 0) res.status(200).json({ message: 'Session deleted' });
        else res.status(404).json({ error: 'Session not found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete session' });
    }
});


app.listen(PORT, () => {
    console.log(`[Pomodoro Service] running on http://localhost:${PORT}`);
});