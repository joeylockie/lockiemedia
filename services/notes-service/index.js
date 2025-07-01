import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

// -- Setup --
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3002;

// --- Database Connection (CORRECTED PATH) ---
const dbFile = process.env.DB_FILE_PATH; // CHANGED THIS LINE
const db = new Database(dbFile, { verbose: console.log });
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
console.log(`[Notes Service] Connected to SQLite database at ${dbFile}`);

// -- Middleware --
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// -- API Routes --

// A new, dedicated endpoint to get all data related to notes.
app.get('/api/notes-data', (req, res) => {
  console.log('[Notes Service] GET /api/notes-data request received');
  try {
    const notebooks = db.prepare('SELECT * FROM notebooks').all();
    const notes = db.prepare('SELECT * FROM notes').all();

    res.json({ notebooks, notes });
  } catch (error) {
    console.error('[Notes Service] Error in GET /api/notes-data:', error);
    res.status(500).json({ error: 'Failed to retrieve notes data.' });
  }
});

// A new, dedicated endpoint to save all data related to notes.
app.post('/api/notes-data', (req, res) => {
    console.log('[Notes Service] POST /api/notes-data request received');
    const incomingData = req.body;

    if (!incomingData || typeof incomingData.notes === 'undefined' || typeof incomingData.notebooks === 'undefined') {
        return res.status(400).json({ error: 'Invalid data format. Expected an object with notes and notebooks arrays.' });
    }

    const transaction = db.transaction(() => {
        db.prepare('DELETE FROM notes').run();
        db.prepare('DELETE FROM notebooks').run();

        const insertNotebook = db.prepare('INSERT INTO notebooks (id, name, createdAt) VALUES (@id, @name, @createdAt)');
        const insertNote = db.prepare('INSERT INTO notes (id, title, content, notebookId, createdAt, updatedAt) VALUES (@id, @title, @content, @notebookId, @createdAt, @updatedAt)');

        if (incomingData.notebooks) for (const notebook of incomingData.notebooks) insertNotebook.run(notebook);
        if (incomingData.notes) for (const note of incomingData.notes) insertNote.run(note);
    });

    try {
        transaction();
        res.status(200).json({ message: 'Notes data saved successfully!' });
    } catch (error) {
        console.error('[Notes Service] Error in POST /api/notes-data transaction:', error);
        res.status(500).json({ error: 'Failed to save notes data.' });
    }
});

// -- Start Server --
app.listen(PORT, () => {
    console.log(`[Notes Service] Listening on port ${PORT}`);
});