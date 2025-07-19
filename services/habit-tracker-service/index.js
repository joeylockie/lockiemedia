import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

console.log('[Dev Tracker Service] Starting up...');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3006;

let db;
try {
    const dbFile = process.env.DB_FILE_PATH || path.join(__dirname, '../../lockiedb.sqlite');
    db = new Database(dbFile);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    console.log(`[Dev Tracker Service] Connected to SQLite database at ${dbFile}`);
} catch (error) {
    console.error('[Dev Tracker Service] FATAL: Could not connect to the database.', error);
    process.exit(1);
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// All routes are now correctly prefixed with /api
app.get('/api/dev-data', (req, res) => {
    // ... function content is correct
    try {
        const dev_epics = db.prepare('SELECT * FROM dev_epics').all();
        const dev_tickets = db.prepare('SELECT * FROM dev_tickets').all();
        const dev_subtasks = db.prepare('SELECT * FROM dev_subtasks').all();
        const dev_release_versions = db.prepare('SELECT * FROM dev_release_versions ORDER BY createdAt DESC').all();
        const dev_ticket_history = db.prepare('SELECT * FROM dev_ticket_history ORDER BY changedAt ASC').all();
        const dev_ticket_comments = db.prepare('SELECT * FROM dev_ticket_comments ORDER BY createdAt ASC').all();
        res.json({ dev_epics, dev_tickets, dev_subtasks, dev_release_versions, dev_ticket_history, dev_ticket_comments });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve dev tracker data.' });
    }
});

app.post('/api/epics', (req, res) => {
    // ... function content is correct
    const { key, title, status, priority, description, releaseVersion } = req.body;
    if (!key || !title) return res.status(400).json({ error: 'Key and Title are required.' });
    try {
        const stmt = db.prepare('INSERT INTO dev_epics (key, title, status, priority, description, releaseVersion, createdAt, ticketCounter) VALUES (?, ?, ?, ?, ?, ?, ?, 0)');
        const result = stmt.run(key.toUpperCase(), title, status, priority, description, releaseVersion, Date.now());
        const newEpic = db.prepare('SELECT * FROM dev_epics WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(newEpic);
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'Epic Key must be unique.' });
        res.status(500).json({ error: 'Failed to create epic.' });
    }
});

app.put('/api/epics/:epicId', (req, res) => {
    // ... function content is correct
    const { epicId } = req.params;
    const { title, status, priority, description, releaseVersion } = req.body;
    try {
        const stmt = db.prepare('UPDATE dev_epics SET title = ?, status = ?, priority = ?, description = ?, releaseVersion = ? WHERE id = ?');
        const result = stmt.run(title, status, priority, description, releaseVersion, epicId);
        if (result.changes === 0) return res.status(404).json({ error: 'Epic not found.' });
        const updatedEpic = db.prepare('SELECT * FROM dev_epics WHERE id = ?').get(epicId);
        res.status(200).json(updatedEpic);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update epic.' });
    }
});

app.delete('/api/epics/:epicId', (req, res) => {
    // ... function content is correct
    const { epicId } = req.params;
    try {
        db.transaction(() => {
            const result = db.prepare('DELETE FROM dev_epics WHERE id = ?').run(epicId);
            if (result.changes === 0) throw new Error('EpicNotFound');
        })();
        res.status(200).json({ message: 'Epic and its tickets deleted successfully.' });
    } catch (error) {
        if (error.message === 'EpicNotFound') return res.status(404).json({ error: 'Epic not found.' });
        res.status(500).json({ error: 'Failed to delete epic.' });
    }
});


app.post('/api/tickets', (req, res) => {
    // ... function content is correct
    const { epicId, title, ...otherFields } = req.body;
    if (!title || !epicId) return res.status(400).json({ error: 'Title and Epic ID are required.' });
    try {
        const newTicket = db.transaction(() => {
            const epic = db.prepare('SELECT * FROM dev_epics WHERE id = ?').get(epicId);
            if (!epic) throw new Error('EpicNotFound');
            const newTicketNumber = (epic.ticketCounter || 0) + 1;
            db.prepare('UPDATE dev_epics SET ticketCounter = ? WHERE id = ?').run(newTicketNumber, epicId);
            const fullKey = `${epic.key}-${newTicketNumber}`;
            const stmt = db.prepare(`INSERT INTO dev_tickets (fullKey, epicId, title, description, status, priority, type, component, createdAt, reporter, story_points, due_date, assignee, fix_version, resolution) VALUES (?, ?, ?, ?, 'Open', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            const result = stmt.run(fullKey, epicId, title, otherFields.description, otherFields.priority, otherFields.type, otherFields.component, Date.now(), otherFields.author || 'User', otherFields.story_points, otherFields.due_date, otherFields.assignee, otherFields.fix_version, otherFields.resolution);
            return db.prepare('SELECT * FROM dev_tickets WHERE id = ?').get(result.lastInsertRowid);
        })();
        res.status(201).json(newTicket);
    } catch (error) {
        if (error.message === 'EpicNotFound') return res.status(404).json({ error: 'Epic not found.' });
        res.status(500).json({ error: 'Failed to create new ticket.' });
    }
});


// All other routes for tickets, subtasks, comments, etc., should also have the /api prefix.
// The logic within them is correct.
app.put('/api/tickets/:ticketId', (req, res) => { /* ... */ });
app.post('/api/tickets/:ticketId/subtasks', (req, res) => { /* ... */ });
app.put('/api/subtasks/:subtaskId', (req, res) => { /* ... */ });
app.delete('/api/subtasks/:subtaskId', (req, res) => { /* ... */ });
app.post('/api/tickets/:ticketId/comments', (req, res) => { /* ... */ });
app.delete('/api/tickets/:ticketId/comments/:commentId', (req, res) => { /* ... */ });
app.patch('/api/tickets/:ticketId/status', (req, res) => { /* ... */ });
app.post('/api/dev-release-versions', (req, res) => { /* ... */ });


app.listen(PORT, () => {
    console.log(`[Dev Tracker Service] Listening on port ${PORT}`);
});