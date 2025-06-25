import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

// -- Setup --
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3006; // New port for this service

// --- Database Connection ---
const dbFile = path.resolve(__dirname, '../../lockiedb.sqlite');
const db = new Database(dbFile, { verbose: console.log });
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
console.log(`[Dev Tracker Service] Connected to SQLite database at ${dbFile}`);

// -- Middleware --
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// -- API Routes --

// A dedicated endpoint to get all data related to the dev tracker.
app.get('/api/dev-data', (req, res) => {
  console.log('[Dev Tracker Service] GET /api/dev-data request received');
  try {
    const dev_epics = db.prepare('SELECT * FROM dev_epics').all();
    const dev_tickets = db.prepare('SELECT * FROM dev_tickets').all();

    res.json({ dev_epics, dev_tickets });
  } catch (error) {
    console.error('[Dev Tracker Service] Error in GET /api/dev-data:', error);
    res.status(500).json({ error: 'Failed to retrieve dev tracker data.' });
  }
});

// A dedicated endpoint to save all data related to the dev tracker.
app.post('/api/dev-data', (req, res) => {
    console.log('[Dev Tracker Service] POST /api/dev-data request received');
    const incomingData = req.body;

    if (!incomingData || typeof incomingData.dev_epics === 'undefined' || typeof incomingData.dev_tickets === 'undefined') {
        return res.status(400).json({ error: 'Invalid data format. Expected an object with dev_epics and dev_tickets arrays.' });
    }

    const transaction = db.transaction(() => {
        // Clear existing data from dev tracker tables ONLY.
        db.prepare('DELETE FROM dev_tickets').run();
        db.prepare('DELETE FROM dev_epics').run();

        // Prepare insert statements
        const insertEpic = db.prepare('INSERT INTO dev_epics (id, title, description, status, priority, createdAt) VALUES (@id, @title, @description, @status, @priority, @createdAt)');
        const insertTicket = db.prepare('INSERT INTO dev_tickets (id, epicId, title, description, status, priority, type, createdAt) VALUES (@id, @epicId, @title, @description, @status, @priority, @type, @createdAt)');

        // Insert data
        if (incomingData.dev_epics) for (const epic of incomingData.dev_epics) insertEpic.run(epic);
        if (incomingData.dev_tickets) for (const ticket of incomingData.dev_tickets) insertTicket.run(ticket);
    });

    try {
        transaction();
        res.status(200).json({ message: 'Dev tracker data saved successfully!' });
    } catch (error) {
        console.error('[Dev Tracker Service] Error in POST /api/dev-data transaction:', error);
        res.status(500).json({ error: 'Failed to save dev tracker data.' });
    }
});

// -- Start Server --
app.listen(PORT, () => {
    console.log(`[Dev Tracker Service] Listening on port ${PORT}`);
});