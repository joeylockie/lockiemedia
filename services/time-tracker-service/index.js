import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

// -- Setup --
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3005; // This service runs on port 3005

// --- Database Connection (CORRECTED PATH) ---
const dbFile = '/root/lockiemedia-dev/lockiedb.sqlite';
const db = new Database(dbFile, { verbose: console.log });
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
console.log(`[Time Tracker Service] Connected to SQLite database at ${dbFile}`);

// -- Middleware --
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// -- Helper Functions --
const parseTimeLogEntry = (entry) => ({
    ...entry,
    manuallyAdded: entry.manuallyAdded === 1,
});

const stringifyTimeLogEntry = (entry) => ({
    ...entry,
    manuallyAdded: entry.manuallyAdded ? 1 : 0,
});

// -- API Routes --

// A new, dedicated endpoint to get all data related to time tracking.
app.get('/api/time-data', (req, res) => {
  console.log('[Time Tracker Service] GET /api/time-data request received');
  try {
    const time_activities = db.prepare('SELECT * FROM time_activities').all();
    const time_log_entries = db.prepare('SELECT * FROM time_log_entries').all().map(parseTimeLogEntry);

    res.json({ time_activities, time_log_entries });
  } catch (error) {
    console.error('[Time Tracker Service] Error in GET /api/time-data:', error);
    res.status(500).json({ error: 'Failed to retrieve time tracking data.' });
  }
});

// A new, dedicated endpoint to save all data related to time tracking.
app.post('/api/time-data', (req, res) => {
    console.log('[Time Tracker Service] POST /api/time-data request received');
    const incomingData = req.body;

    if (!incomingData || typeof incomingData.time_activities === 'undefined' || typeof incomingData.time_log_entries === 'undefined') {
        return res.status(400).json({ error: 'Invalid data format. Expected an object with time_activities and time_log_entries.' });
    }

    const transaction = db.transaction(() => {
        db.prepare('DELETE FROM time_log_entries').run();
        db.prepare('DELETE FROM time_activities').run();

        const insertActivity = db.prepare('INSERT INTO time_activities (id, name, icon, color, createdAt) VALUES (@id, @name, @icon, @color, @createdAt)');
        const insertLogEntry = db.prepare('INSERT INTO time_log_entries (id, activityId, startTime, endTime, durationMs, notes, manuallyAdded) VALUES (@id, @activityId, @startTime, @endTime, @durationMs, @notes, @manuallyAdded)');

        if (incomingData.time_activities) for (const activity of incomingData.time_activities) insertActivity.run(activity);
        if (incomingData.time_log_entries) for (const entry of incomingData.time_log_entries) insertLogEntry.run(stringifyTimeLogEntry(entry));
    });

    try {
        transaction();
        res.status(200).json({ message: 'Time tracking data saved successfully!' });
    } catch (error) {
        console.error('[Time Tracker Service] Error in POST /api/time-data transaction:', error);
        res.status(500).json({ error: 'Failed to save time tracking data.' });
    }
});


// -- Start Server --
app.listen(PORT, () => {
    console.log(`[Time Tracker Service] Listening on port ${PORT}`);
});