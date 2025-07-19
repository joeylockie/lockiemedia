import express from 'express';
import cors from 'cors';
import path from 'path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

// ES Module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// --- Database Connection ---
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', '..', 'lockiedb.sqlite');
let db;
try {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    console.log(`[Dev Tracker Service] Connected to SQLite database at ${dbPath}`);
} catch (error) {
    console.error('[Dev Tracker Service] CRITICAL: Could not connect to the database.', error);
    process.exit(1);
}

// --- Request Logging Middleware ---
app.use((req, res, next) => {
    console.log(`--- DEV-TRACKER-SERVICE RECEIVED REQUEST --- Method: ${req.method}, URL: ${req.originalUrl}`);
    next();
});

// --- API Routes ---

// GET all dev data (epics and tickets)
app.get('/api/dev-data', (req, res) => {
    try {
        const getEpicsStmt = db.prepare('SELECT * FROM epics ORDER BY created_at DESC');
        const getTicketsStmt = db.prepare('SELECT * FROM tickets ORDER BY created_at DESC');
        const epics = getEpicsStmt.all();
        const tickets = getTicketsStmt.all();
        res.json({ epics, tickets });
    } catch (error) {
        console.error('Error fetching dev data:', error);
        res.status(500).json({ error: 'Failed to fetch dev data from the database.' });
    }
});

// POST a new epic
app.post('/api/epics', (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Epic name is required.' });
        }
        const stmt = db.prepare('INSERT INTO epics (name, description) VALUES (?, ?)');
        const info = stmt.run(name, description || '');
        const newEpic = db.prepare('SELECT * FROM epics WHERE id = ?').get(info.lastInsertRowid);
        res.status(201).json(newEpic);
    } catch (error) {
        console.error('Error creating new epic:', error);
        res.status(500).json({ error: 'Failed to create new epic.' });
    }
});

// POST a new ticket
app.post('/api/tickets', (req, res) => {
    try {
        const { title, description, epic_id, status } = req.body;
        if (!title || !epic_id) {
            return res.status(400).json({ error: 'Ticket title and epic_id are required.' });
        }
        const stmt = db.prepare('INSERT INTO tickets (title, description, epic_id, status) VALUES (?, ?, ?, ?)');
        const info = stmt.run(title, description || '', epic_id, status || 'To Do');
        const newTicket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(info.lastInsertRowid);
        res.status(201).json(newTicket);
    } catch (error) {
        console.error('Error creating new ticket:', error);
        res.status(500).json({ error: 'Failed to create new ticket.' });
    }
});

// PATCH to update an epic
app.patch('/api/epics/:id', (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Epic name is required.' });
        }
        const stmt = db.prepare('UPDATE epics SET name = ?, description = ? WHERE id = ?');
        const info = stmt.run(name, description || '', req.params.id);
        if (info.changes === 0) {
            return res.status(404).json({ error: `Epic with id ${req.params.id} not found.` });
        }
        const updatedEpic = db.prepare('SELECT * FROM epics WHERE id = ?').get(req.params.id);
        res.json(updatedEpic);
    } catch (error) {
        console.error(`Error updating epic ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to update epic.' });
    }
});

// PATCH to update a ticket
app.patch('/api/tickets/:id', (req, res) => {
    try {
        const { title, description, epic_id, status } = req.body;
        if (!title || !epic_id || !status) {
            return res.status(400).json({ error: 'Ticket title, epic_id, and status are required.' });
        }
        const stmt = db.prepare('UPDATE tickets SET title = ?, description = ?, epic_id = ?, status = ? WHERE id = ?');
        const info = stmt.run(title, description || '', epic_id, status, req.params.id);
        if (info.changes === 0) {
            return res.status(404).json({ error: `Ticket with id ${req.params.id} not found.` });
        }
        const updatedTicket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
        res.json(updatedTicket);
    } catch (error) {
        console.error(`Error updating ticket ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to update ticket.' });
    }
});


// DELETE an epic
app.delete('/api/epics/:id', (req, res) => {
    try {
        const deleteEpicAndTickets = db.transaction(() => {
            db.prepare('DELETE FROM tickets WHERE epic_id = ?').run(req.params.id);
            const info = db.prepare('DELETE FROM epics WHERE id = ?').run(req.params.id);
            if (info.changes === 0) {
                throw new Error('EpicNotFound');
            }
        });
        deleteEpicAndTickets();
        res.status(204).send();
    } catch (error) {
        if (error.message === 'EpicNotFound') {
             res.status(404).json({ error: `Epic with id ${req.params.id} not found.` });
        } else {
            console.error(`Error deleting epic ${req.params.id}:`, error);
            res.status(500).json({ error: 'Failed to delete epic.' });
        }
    }
});


// DELETE a ticket
app.delete('/api/tickets/:id', (req, res) => {
    try {
        const stmt = db.prepare('DELETE FROM tickets WHERE id = ?');
        const info = stmt.run(req.params.id);
        if (info.changes === 0) {
            return res.status(404).json({ error: `Ticket with id ${req.params.id} not found.` });
        }
        res.status(204).send();
    } catch (error) {
        console.error(`Error deleting ticket ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to delete ticket.' });
    }
});


// --- Server Start ---
const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
    console.log(`[Dev Tracker Service] Listening on port ${PORT}`);
});

// --- Graceful Shutdown ---
process.on('SIGINT', () => {
    console.log('[Dev Tracker Service] SIGINT signal received: closing HTTP server');
    db.close();
    console.log('[Dev Tracker Service] Database connection closed.');
    process.exit(0);
});