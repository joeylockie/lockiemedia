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
    // THIS IS THE CORRECTED PATH
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

function recordHistory(ticketId, field, oldValue, newValue, author = 'System') {
    if (String(oldValue ?? '') !== String(newValue ?? '')) {
        const stmt = db.prepare('INSERT INTO dev_ticket_history (ticketId, field, oldValue, newValue, changedAt) VALUES (?, ?, ?, ?, ?)');
        stmt.run(ticketId, field, String(oldValue ?? ''), String(newValue ?? ''), Date.now());
    }
}

app.get('/api/dev-data', (req, res) => {
    try {
        const dev_epics = db.prepare('SELECT * FROM dev_epics').all();
        const dev_tickets = db.prepare('SELECT * FROM dev_tickets').all();
        const dev_subtasks = db.prepare('SELECT * FROM dev_subtasks').all();
        const dev_release_versions = db.prepare('SELECT * FROM dev_release_versions ORDER BY createdAt DESC').all();
        const dev_ticket_history = db.prepare('SELECT * FROM dev_ticket_history ORDER BY changedAt ASC').all();
        const dev_ticket_comments = db.prepare('SELECT * FROM dev_ticket_comments ORDER BY createdAt ASC').all();
        res.json({ dev_epics, dev_tickets, dev_subtasks, dev_release_versions, dev_ticket_history, dev_ticket_comments });
    } catch (error) {
        console.error('[Dev Tracker Service] Error in GET /api/dev-data:', error);
        res.status(500).json({ error: 'Failed to retrieve dev tracker data.' });
    }
});

app.post('/api/tickets', (req, res) => {
    const { epicId, title, description, priority, type, component, author, ...otherFields } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required.' });
    if (!epicId || typeof epicId !== 'number') return res.status(404).json({ error: 'A valid Epic ID is required.' });

    const createTicketTransaction = db.transaction(() => {
        const epic = db.prepare('SELECT * FROM dev_epics WHERE id = ?').get(epicId);
        if (!epic) {
            throw new Error('EpicNotFound');
        }
        const newTicketNumber = (epic.ticketCounter || 0) + 1;
        const fullKey = `${epic.key}-${newTicketNumber}`;
        const createdAt = Date.now();
        db.prepare('UPDATE dev_epics SET ticketCounter = ? WHERE id = ?').run(newTicketNumber, epicId);
        const stmt = db.prepare(`
            INSERT INTO dev_tickets (
                fullKey, epicId, title, description, status, priority, type, component, createdAt, reporter,
                story_points, due_date, assignee, fix_version, resolution
            ) VALUES (
                ?, ?, ?, ?, 'Open', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )`);
        const result = stmt.run(
            fullKey, epicId, title, description, priority, type, component, createdAt, author || 'User',
            otherFields.story_points, otherFields.due_date, otherFields.assignee, otherFields.fix_version, otherFields.resolution
        );
        const newTicketId = result.lastInsertRowid;
        recordHistory(newTicketId, 'ticket', 'Created', title, author);
        return db.prepare('SELECT * FROM dev_tickets WHERE id = ?').get(newTicketId);
    });

    try {
        const newTicket = createTicketTransaction();
        res.status(201).json(newTicket);
    } catch (error) {
        if (error.message === 'EpicNotFound') {
            return res.status(404).json({ error: 'Epic not found.' });
        }
        console.error('[Dev Tracker Service] A critical error occurred while creating a ticket:', error);
        res.status(500).json({ error: 'Failed to create new ticket due to a server error.' });
    }
});

app.put('/api/tickets/:ticketId', (req, res) => {
    const { ticketId } = req.params;
    const updates = req.body;
    const transaction = db.transaction(() => {
        const existingTicket = db.prepare('SELECT * FROM dev_tickets WHERE id = ?').get(ticketId);
        if (!existingTicket) return { status: 404, body: { error: 'Ticket not found' } };
        const fields = ['title', 'description', 'status', 'priority', 'type', 'component', 'story_points', 'due_date', 'reporter', 'assignee', 'fix_version', 'resolution'];
        let sql = 'UPDATE dev_tickets SET ';
        const params = [];
        fields.forEach(field => {
            if (updates.hasOwnProperty(field)) {
                sql += `${field} = ?, `;
                params.push(updates[field]);
                if (existingTicket[field] != updates[field]) {
                    recordHistory(ticketId, field, existingTicket[field], updates[field], updates.author || 'User');
                }
            }
        });
        if (params.length === 0) return { status: 400, body: { error: 'No updatable fields provided.' } };
        sql = sql.slice(0, -2) + ' WHERE id = ?';
        params.push(ticketId);
        db.prepare(sql).run(...params);
        const updatedTicket = db.prepare('SELECT * FROM dev_tickets WHERE id = ?').get(ticketId);
        return { status: 200, body: updatedTicket };
    });
    try {
        const result = transaction();
        res.status(result.status).json(result.body);
    } catch (error) {
        console.error(`[Dev Tracker Service] Error updating ticket ${ticketId}:`, error);
        res.status(500).json({ error: 'Failed to update ticket.' });
    }
});

app.post('/api/tickets/:ticketId/subtasks', (req, res) => {
    const { ticketId } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Subtask text cannot be empty.' });
    try {
        const result = db.prepare('INSERT INTO dev_subtasks (ticketId, text, completed, createdAt) VALUES (?, ?, 0, ?)').run(ticketId, text.trim(), Date.now());
        const newSubtask = db.prepare('SELECT * FROM dev_subtasks WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(newSubtask);
    } catch (error) { res.status(500).json({ error: 'Failed to add subtask.' }); }
});

app.put('/api/subtasks/:subtaskId', (req, res) => {
    const { subtaskId } = req.params;
    const { text, completed } = req.body;
    try {
        const existing = db.prepare('SELECT * FROM dev_subtasks WHERE id = ?').get(subtaskId);
        if (!existing) return res.status(404).json({ error: 'Subtask not found.' });
        const newText = text !== undefined ? text : existing.text;
        const newCompleted = completed !== undefined ? (Boolean(completed) ? 1 : 0) : existing.completed;
        db.prepare('UPDATE dev_subtasks SET text = ?, completed = ? WHERE id = ?').run(newText, newCompleted, subtaskId);
        const updatedSubtask = db.prepare('SELECT * FROM dev_subtasks WHERE id = ?').get(subtaskId);
        res.status(200).json(updatedSubtask);
    } catch (error) { res.status(500).json({ error: 'Failed to update subtask.' }); }
});

app.delete('/api/subtasks/:subtaskId', (req, res) => {
    const { subtaskId } = req.params;
    try {
        const result = db.prepare('DELETE FROM dev_subtasks WHERE id = ?').run(subtaskId);
        if (result.changes > 0) res.status(200).json({ message: 'Subtask deleted successfully.' });
        else res.status(404).json({ error: 'Subtask not found.' });
    } catch (error) { res.status(500).json({ error: 'Failed to delete subtask.' }); }
});

app.post('/api/dev-release-versions', (req, res) => {
    const { version } = req.body;
    if (!version || !version.trim()) return res.status(400).json({ error: 'Version name cannot be empty.' });
    try {
        const result = db.prepare('INSERT INTO dev_release_versions (version, createdAt) VALUES (?, ?)').run(version.trim(), Date.now());
        res.status(201).json({ id: result.lastInsertRowid, version: version.trim() });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'This version name already exists.' });
        res.status(500).json({ error: 'Failed to add release version.' });
    }
});

app.post('/api/tickets/:ticketId/comments', (req, res) => {
    const { ticketId } = req.params;
    const { comment, author } = req.body;
    if (!comment || !comment.trim()) return res.status(400).json({ error: 'Comment cannot be empty.' });
    try {
        const createdAt = Date.now();
        const result = db.prepare('INSERT INTO dev_ticket_comments (ticketId, comment, author, createdAt) VALUES (?, ?, ?, ?)').run(ticketId, comment, author || 'User', createdAt);
        res.status(201).json({ id: result.lastInsertRowid, ticketId: Number(ticketId), comment, author: author || 'User', createdAt });
    } catch (error) { res.status(500).json({ error: 'Failed to add comment.' }); }
});

app.delete('/api/tickets/:ticketId/comments/:commentId', (req, res) => {
    const { commentId } = req.params;
    try {
        const result = db.prepare('DELETE FROM dev_ticket_comments WHERE id = ?').run(commentId);
        if (result.changes > 0) res.status(200).json({ message: 'Comment deleted successfully.' });
        else res.status(404).json({ error: 'Comment not found.' });
    } catch (error) { res.status(500).json({ error: 'Failed to delete comment.' }); }
});

app.patch('/api/tickets/:ticketId/status', (req, res) => {
    const { ticketId } = req.params;
    const { status, author } = req.body;
    if (!status) return res.status(400).json({ error: 'New status is required.' });
    try {
        const ticket = db.prepare('SELECT * FROM dev_tickets WHERE id = ?').get(ticketId);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
        if (ticket.status !== status) {
            db.prepare('UPDATE dev_tickets SET status = ? WHERE id = ?').run(status, ticketId);
            recordHistory(ticketId, 'status', ticket.status, status, author);
        }
        res.status(200).json({ message: 'Status updated successfully.' });
    } catch (error) { res.status(500).json({ error: 'Failed to update status.' }); }
});

app.listen(PORT, () => {
    console.log(`[Dev Tracker Service] Listening on port ${PORT}`);
});