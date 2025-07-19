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
    // Use the environment variable for the database path, but have a fallback for standalone development
    const dbFile = process.env.DB_FILE_PATH || path.join(__dirname, '../../../lockiedb.sqlite');
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
    // Only record history if the value has actually changed
    if (String(oldValue ?? '') !== String(newValue ?? '')) {
        const stmt = db.prepare('INSERT INTO dev_ticket_history (ticketId, field, oldValue, newValue, changedAt) VALUES (?, ?, ?, ?, ?)');
        stmt.run(ticketId, field, String(oldValue ?? ''), String(newValue ?? ''), Date.now());
    }
}


// --- MODIFICATION: Fetch all dev data, now including subtasks ---
app.get('/api/dev-data', (req, res) => {
    console.log('[Dev Tracker Service] GET /api/dev-data request received');
    try {
        const dev_epics = db.prepare('SELECT * FROM dev_epics').all();
        const dev_tickets = db.prepare('SELECT * FROM dev_tickets').all();
        const dev_subtasks = db.prepare('SELECT * FROM dev_subtasks').all(); // NEW
        const dev_release_versions = db.prepare('SELECT * FROM dev_release_versions ORDER BY createdAt DESC').all();
        const dev_ticket_history = db.prepare('SELECT * FROM dev_ticket_history ORDER BY changedAt ASC').all();
        const dev_ticket_comments = db.prepare('SELECT * FROM dev_ticket_comments ORDER BY createdAt ASC').all();

        res.json({ dev_epics, dev_tickets, dev_subtasks, dev_release_versions, dev_ticket_history, dev_ticket_comments });
    } catch (error) {
        console.error('[Dev Tracker Service] Error in GET /api/dev-data:', error);
        res.status(500).json({ error: 'Failed to retrieve dev tracker data.' });
    }
});


// --- NEW ENDPOINT: Create a new ticket ---
app.post('/api/tickets', (req, res) => {
    console.log('[Dev Tracker Service] POST /api/tickets request received');
    const { epicId, title, description, priority, type, component, author } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Title is required.' });
    }

    // --- THIS IS THE CRITICAL FIX ---
    // We must validate that epicId is a valid number before using it.
    if (!epicId || typeof epicId !== 'number') {
        console.error(`[Dev Tracker Service] Invalid or missing epicId received: ${epicId}`);
        return res.status(404).json({ error: 'Epic not found.' });
    }
    // --- END OF FIX ---

    try {
        const epic = db.prepare('SELECT * FROM dev_epics WHERE id = ?').get(epicId);
        if (!epic) {
            console.error(`[Dev Tracker Service] No epic found in database with ID: ${epicId}`);
            return res.status(404).json({ error: 'Epic not found.' });
        }

        // Increment the ticket counter for the epic
        db.prepare('UPDATE dev_epics SET ticketCounter = ticketCounter + 1 WHERE id = ?').run(epicId);
        const newTicketNumber = epic.ticketCounter + 1;
        const fullKey = `${epic.key}-${newTicketNumber}`;
        const createdAt = Date.now();

        const stmt = db.prepare(`
            INSERT INTO dev_tickets (fullKey, epicId, title, description, status, priority, type, component, createdAt, reporter)
            VALUES (?, ?, ?, ?, 'Open', ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(fullKey, epicId, title, description, priority, type, component, createdAt, author || 'User');
        const newTicketId = result.lastInsertRowid;

        // Record creation history
        recordHistory(newTicketId, 'ticket', 'Created', title, author);

        const newTicket = db.prepare('SELECT * FROM dev_tickets WHERE id = ?').get(newTicketId);
        res.status(201).json(newTicket);

    } catch (error) {
        console.error('[Dev Tracker Service] Error creating new ticket:', error);
        res.status(500).json({ error: 'Failed to create new ticket.' });
    }
});

// --- NEW ENDPOINT: Update a ticket with all new fields ---
app.put('/api/tickets/:ticketId', (req, res) => {
    console.log(`[Dev Tracker Service] PUT /api/tickets/${req.params.ticketId} request received`);
    const { ticketId } = req.params;
    const updates = req.body;

    const transaction = db.transaction(() => {
        const existingTicket = db.prepare('SELECT * FROM dev_tickets WHERE id = ?').get(ticketId);
        if (!existingTicket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // --- Fields that can be updated ---
        const fields = [
            'title', 'description', 'status', 'priority', 'type', 'component',
            'story_points', 'due_date', 'reporter', 'assignee', 'fix_version', 'resolution'
        ];

        let sql = 'UPDATE dev_tickets SET ';
        const params = [];
        const historyChanges = [];

        fields.forEach(field => {
            if (updates.hasOwnProperty(field)) {
                sql += `${field} = ?, `;
                params.push(updates[field]);
                // Check if the value is different before recording history
                if (existingTicket[field] != updates[field]) {
                    historyChanges.push({ field, oldValue: existingTicket[field], newValue: updates[field] });
                }
            }
        });

        // If no valid fields were provided for update
        if (params.length === 0) {
            return res.status(400).json({ error: 'No updatable fields provided.' });
        }

        sql = sql.slice(0, -2); // Remove trailing comma and space
        sql += ' WHERE id = ?';
        params.push(ticketId);

        // Execute the update
        db.prepare(sql).run(...params);

        // Record all changes in history
        historyChanges.forEach(change => {
            recordHistory(ticketId, change.field, change.oldValue, change.newValue, updates.author || 'User');
        });

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


// --- NEW ENDPOINTS for Sub-tasks ---

// Add a subtask to a ticket
app.post('/api/tickets/:ticketId/subtasks', (req, res) => {
    const { ticketId } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Subtask text cannot be empty.' });
    }
    try {
        const stmt = db.prepare('INSERT INTO dev_subtasks (ticketId, text, completed, createdAt) VALUES (?, ?, 0, ?)');
        const result = stmt.run(ticketId, text.trim(), Date.now());
        const newSubtask = db.prepare('SELECT * FROM dev_subtasks WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(newSubtask);
    } catch (error) {
        console.error(`[Dev Tracker Service] Error adding subtask to ticket ${ticketId}:`, error);
        res.status(500).json({ error: 'Failed to add subtask.' });
    }
});

// Update a subtask (e.g., check/uncheck, edit text)
app.put('/api/subtasks/:subtaskId', (req, res) => {
    const { subtaskId } = req.params;
    const { text, completed } = req.body;

    try {
        const existing = db.prepare('SELECT * FROM dev_subtasks WHERE id = ?').get(subtaskId);
        if (!existing) {
            return res.status(404).json({ error: 'Subtask not found.' });
        }

        const newText = text !== undefined ? text : existing.text;
        const newCompleted = completed !== undefined ? (Boolean(completed) ? 1 : 0) : existing.completed;

        const stmt = db.prepare('UPDATE dev_subtasks SET text = ?, completed = ? WHERE id = ?');
        stmt.run(newText, newCompleted, subtaskId);
        const updatedSubtask = db.prepare('SELECT * FROM dev_subtasks WHERE id = ?').get(subtaskId);
        res.status(200).json(updatedSubtask);
    } catch (error) {
        console.error(`[Dev Tracker Service] Error updating subtask ${subtaskId}:`, error);
        res.status(500).json({ error: 'Failed to update subtask.' });
    }
});

// Delete a subtask
app.delete('/api/subtasks/:subtaskId', (req, res) => {
    const { subtaskId } = req.params;
    try {
        const result = db.prepare('DELETE FROM dev_subtasks WHERE id = ?').run(subtaskId);
        if (result.changes > 0) {
            res.status(200).json({ message: 'Subtask deleted successfully.' });
        } else {
            res.status(404).json({ error: 'Subtask not found.' });
        }
    } catch (error) {
        console.error(`[Dev Tracker Service] Error deleting subtask ${subtaskId}:`, error);
        res.status(500).json({ error: 'Failed to delete subtask.' });
    }
});


// --- EXISTING AND DEPRECATED ENDPOINTS ---

app.post('/api/dev-data', (req, res) => {
    console.warn('[Dev Tracker Service] WARNING: The POST /api/dev-data endpoint is deprecated and should not be used for new features. Use specific REST endpoints instead.');
    const incomingData = req.body;
    if (!incomingData) {
        return res.status(400).json({ error: 'Invalid data format. No data received.' });
    }
    // ... (rest of old logic for backward compatibility)
});


// --- Other existing endpoints remain unchanged ---
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

app.post('/api/tickets/:ticketId/comments', (req, res) => {
    const { ticketId } = req.params;
    const { comment, author } = req.body;
    if (!comment || !comment.trim()) {
        return res.status(400).json({ error: 'Comment cannot be empty.' });
    }
    try {
        const createdAt = Date.now();
        const stmt = db.prepare('INSERT INTO dev_ticket_comments (ticketId, comment, author, createdAt) VALUES (?, ?, ?, ?)');
        const result = stmt.run(ticketId, comment, author || 'User', createdAt);
        res.status(201).json({ id: result.lastInsertRowid, ticketId: Number(ticketId), comment, author: author || 'User', createdAt });
    } catch (error) {
        console.error(`[Dev Tracker Service] Error adding comment to ticket ${ticketId}:`, error);
        res.status(500).json({ error: 'Failed to add comment.' });
    }
});

app.delete('/api/tickets/:ticketId/comments/:commentId', (req, res) => {
    const { commentId } = req.params;
    try {
        const stmt = db.prepare('DELETE FROM dev_ticket_comments WHERE id = ?');
        const result = stmt.run(commentId);
        if (result.changes > 0) {
            res.status(200).json({ message: 'Comment deleted successfully.' });
        } else {
            res.status(404).json({ error: 'Comment not found.' });
        }
    } catch (error) {
        console.error(`[Dev Tracker Service] Error deleting comment ${commentId}:`, error);
        res.status(500).json({ error: 'Failed to delete comment.' });
    }
});

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