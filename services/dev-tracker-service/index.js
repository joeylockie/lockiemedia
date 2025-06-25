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

// --- Helper Functions to record history ---
function recordHistory(ticketId, field, oldValue, newValue, author = 'System') {
    const stmt = db.prepare('INSERT INTO dev_ticket_history (ticketId, field, oldValue, newValue, changedAt) VALUES (?, ?, ?, ?, ?)');
    stmt.run(ticketId, field, oldValue, newValue, Date.now());
}


app.get('/api/dev-data', (req, res) => {
  console.log('[Dev Tracker Service] GET /api/dev-data request received');
  try {
    const dev_epics = db.prepare('SELECT * FROM dev_epics').all();
    const dev_tickets = db.prepare('SELECT * FROM dev_tickets').all();
    const dev_release_versions = db.prepare('SELECT * FROM dev_release_versions ORDER BY createdAt DESC').all();
    
    // For simplicity, we'll fetch all comments and history and let the frontend map them.
    // For a larger application, you might fetch these on a per-ticket basis.
    const dev_ticket_history = db.prepare('SELECT * FROM dev_ticket_history ORDER BY changedAt ASC').all();
    const dev_ticket_comments = db.prepare('SELECT * FROM dev_ticket_comments ORDER BY createdAt ASC').all();

    res.json({ dev_epics, dev_tickets, dev_release_versions, dev_ticket_history, dev_ticket_comments });
  } catch (error) {
    console.error('[Dev Tracker Service] Error in GET /api/dev-data:', error);
    res.status(500).json({ error: 'Failed to retrieve dev tracker data.' });
  }
});

app.post('/api/dev-data', (req, res) => {
    console.log('[Dev Tracker Service] POST /api/dev-data request received');
    const incomingData = req.body;

    console.log('[Dev Tracker Service] Data received for saving:');
    console.log('Epics Count:', incomingData.dev_epics ? incomingData.dev_epics.length : 0);
    console.log('Tickets Count:', incomingData.dev_tickets ? incomingData.dev_tickets.length : 0);
    console.log('Versions Count:', incomingData.dev_release_versions ? incomingData.dev_release_versions.length : 0);

    if (!incomingData || typeof incomingData.dev_epics === 'undefined' || typeof incomingData.dev_tickets === 'undefined' || typeof incomingData.dev_release_versions === 'undefined') {
        return res.status(400).json({ error: 'Invalid data format. Must include epics, tickets, and release versions.' });
    }

    const transaction = db.transaction(() => {
        // Clear all dev-related tables before saving
        db.prepare('DELETE FROM dev_ticket_comments').run();
        db.prepare('DELETE FROM dev_ticket_history').run();
        db.prepare('DELETE FROM dev_tickets').run();
        db.prepare('DELETE FROM dev_epics').run();
        db.prepare('DELETE FROM dev_release_versions').run();

        const insertEpic = db.prepare('INSERT INTO dev_epics (id, key, title, description, status, priority, releaseVersion, ticketCounter, createdAt) VALUES (@id, @key, @title, @description, @status, @priority, @releaseVersion, @ticketCounter, @createdAt)');
        const insertTicket = db.prepare('INSERT INTO dev_tickets (id, fullKey, epicId, title, description, status, priority, type, component, releaseVersion, affectedVersion, createdAt) VALUES (@id, @fullKey, @epicId, @title, @description, @status, @priority, @type, @component, @releaseVersion, @affectedVersion, @createdAt)');
        const insertVersion = db.prepare('INSERT INTO dev_release_versions (id, version, createdAt) VALUES (@id, @version, @createdAt)');
        // We will handle history and comments via dedicated endpoints, so no inserts here.

        if (incomingData.dev_release_versions) for (const version of incomingData.dev_release_versions) insertVersion.run(version);
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

// --- NEW Endpoints for managing specific resources ---

// Add a new release version
app.post('/api/dev-release-versions', (req, res) => {
    const { version } = req.body;
    if (!version || !version.trim()) {
        return res.status(400).json({ error: 'Version name cannot be empty.' });
    }
    try {
        const stmt = db.prepare('INSERT INTO dev_release_versions (version, createdAt) VALUES (?, ?)');
        const result = stmt.run(version.trim(), Date.now());
        res.status(201).json({ id: result.lastInsertRowid, version: version.trim() });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ error: 'This version name already exists.' });
        }
        console.error('[Dev Tracker Service] Error adding release version:', error);
        res.status(500).json({ error: 'Failed to add release version.' });
    }
});

// Add a comment to a ticket
app.post('/api/tickets/:ticketId/comments', (req, res) => {
    const { ticketId } = req.params;
    const { comment, author } = req.body;

    if (!comment || !comment.trim()) {
        return res.status(400).json({ error: 'Comment cannot be empty.' });
    }

    try {
        const stmt = db.prepare('INSERT INTO dev_ticket_comments (ticketId, comment, author, createdAt) VALUES (?, ?, ?, ?)');
        const result = stmt.run(ticketId, comment, author || 'User', Date.now());
        res.status(201).json({ id: result.lastInsertRowid, ticketId, comment, author: author || 'User' });
    } catch (error) {
        console.error(`[Dev Tracker Service] Error adding comment to ticket ${ticketId}:`, error);
        res.status(500).json({ error: 'Failed to add comment.' });
    }
});

// Update a ticket's status and record history
app.patch('/api/tickets/:ticketId/status', (req, res) => {
    const { ticketId } = req.params;
    const { status, author } = req.body;

    if (!status) {
        return res.status(400).json({ error: 'New status is required.' });
    }

    try {
        const ticket = db.prepare('SELECT * FROM dev_tickets WHERE id = ?').get(ticketId);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found.' });
        }

        if (ticket.status !== status) {
            db.prepare('UPDATE dev_tickets SET status = ? WHERE id = ?').run(status, ticketId);
            recordHistory(ticketId, 'status', ticket.status, status, author);
        }

        res.status(200).json({ message: 'Status updated successfully.' });
    } catch (error) {
        console.error(`[Dev Tracker Service] Error updating status for ticket ${ticketId}:`, error);
        res.status(500).json({ error: 'Failed to update status.' });
    }
});


app.listen(PORT, () => {
    console.log(`[Dev Tracker Service] Listening on port ${PORT}`);
});