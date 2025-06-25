import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

console.log('[Dev Tracker Service] Starting up...');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3006;

let db;
try {
    const dbFile = path.resolve(__dirname, '../../lockiedb.sqlite');
    db = new Database(dbFile, { verbose: console.log });
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    console.log(`[Dev Tracker Service] Connected to SQLite database at ${dbFile}`);
} catch (error) {
    console.error('[Dev Tracker Service] FATAL: Could not connect to the database.');
    console.error(error);
    process.exit(1);
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));

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

app.post('/api/dev-data', (req, res) => {
    console.log('[Dev Tracker Service] POST /api/dev-data request received');
    const incomingData = req.body;

    // --- NEW: Detailed logging of incoming data ---
    console.log('[Dev Tracker Service] Data received for saving:');
    console.log('Epics Count:', incomingData.dev_epics ? incomingData.dev_epics.length : 0);
    console.log('Tickets Count:', incomingData.dev_tickets ? incomingData.dev_tickets.length : 0);
    if (incomingData.dev_tickets && incomingData.dev_tickets.length > 0) {
        console.log('Sample Ticket Data:', JSON.stringify(incomingData.dev_tickets[0], null, 2));
    }
    // --- End of new logging ---

    if (!incomingData || typeof incomingData.dev_epics === 'undefined' || typeof incomingData.dev_tickets === 'undefined') {
        return res.status(400).json({ error: 'Invalid data format. Expected an object with dev_epics and dev_tickets arrays.' });
    }

    const transaction = db.transaction(() => {
        db.prepare('DELETE FROM dev_tickets').run();
        db.prepare('DELETE FROM dev_epics').run();

        const insertEpic = db.prepare('INSERT INTO dev_epics (id, title, description, status, priority, createdAt) VALUES (@id, @title, @description, @status, @priority, @createdAt)');
        const insertTicket = db.prepare('INSERT INTO dev_tickets (id, epicId, title, description, status, priority, type, component, createdAt) VALUES (@id, @epicId, @title, @description, @status, @priority, @type, @component, @createdAt)');

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

app.listen(PORT, () => {
    console.log(`[Dev Tracker Service] Listening on port ${PORT}`);
});