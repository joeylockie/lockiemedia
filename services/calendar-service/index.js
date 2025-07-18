import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

// --- Setup ---
console.log('[Calendar Service] Initializing...');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3008; // FIX: Use the new, correct port

// --- Database Connection ---
let db;
try {
    const dbFile = process.env.DB_FILE_PATH; // CHANGED THIS LINE
    console.log(`[Calendar Service] Attempting to connect to database at: ${dbFile}`);
    db = new Database(dbFile, { verbose: console.log });
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    console.log(`[Calendar Service] Database connection successful.`);
} catch (error) {
    console.error('[Calendar Service] FATAL: Could not connect to the database.', error);
    process.exit(1);
}

// -- Middleware --
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// -- Helper Functions --
const parseEvent = (event) => ({
    ...event,
    isAllDay: event.isAllDay === 1,
});

const stringifyEvent = (event) => ({
    ...event,
    isAllDay: event.isAllDay ? 1 : 0,
});


// -- API Routes --

app.get('/api/calendar-data', (req, res) => {
  console.log('[Calendar Service] GET /api/calendar-data request received');
  try {
    const events = db.prepare('SELECT * FROM calendar_events').all().map(parseEvent);
    res.json({ calendar_events: events });
  } catch (error) {
    console.error('[Calendar Service] Error in GET /api/calendar-data:', error);
    res.status(500).json({ error: 'Failed to retrieve calendar data.' });
  }
});

app.post('/api/calendar-data', (req, res) => {
    console.log('[Calendar Service] POST /api/calendar-data request received');
    const { calendar_events } = req.body;

    if (!calendar_events || !Array.isArray(calendar_events)) {
        return res.status(400).json({ error: 'Invalid data format. Expected an object with a calendar_events array.' });
    }

    const transaction = db.transaction(() => {
        db.prepare('DELETE FROM calendar_events').run();
        const insertEvent = db.prepare('INSERT INTO calendar_events (id, title, description, startTime, endTime, isAllDay, color, createdAt, updatedAt) VALUES (@id, @title, @description, @startTime, @endTime, @isAllDay, @color, @createdAt, @updatedAt)');

        for (const event of calendar_events) {
            insertEvent.run(stringifyEvent(event));
        }
    });

    try {
        transaction();
        res.status(200).json({ message: 'Calendar data saved successfully!' });
    } catch (error) {
        console.error('[Calendar Service] Error in POST /api/calendar-data transaction:', error);
        res.status(500).json({ error: 'Failed to save calendar data.' });
    }
});


// -- Start Server --
const server = app.listen(PORT, () => {
    console.log(`[Calendar Service] Server is fully operational and listening on port ${PORT}`);
}).on('error', (err) => {
    console.error('[Calendar Service] FATAL: Failed to start server.', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('[Calendar Service] SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('[Calendar Service] HTTP server closed.');
        db.close();
        console.log('[Calendar Service] Database connection closed.');
    });
});