import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

// -- Setup --
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3000;

// -- Database Setup (lowdb) --
// This configures lowdb to use our db.json file for storage
const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const defaultData = {
  tasks: [],
  projects: [],
  kanbanColumns: [],
  userPreferences: {},
  userProfile: {}
};
const db = new Low(adapter, defaultData);
await db.read(); // Read the initial data from db.json

// -- Middleware --
// These functions run on every request
app.use(cors()); // Allows your frontend to talk to this backend
app.use(express.json({ limit: '10mb' })); // Parses incoming JSON data from the frontend
app.use(express.static('public')); // This serves all your HTML, CSS, and JS files

// -- API Routes --
// The frontend will use these endpoints to get and save data

// GET endpoint to retrieve all data
app.get('/api/data', async (req, res) => {
  await db.read(); // Make sure we have the latest data
  res.json(db.data);
});

// POST endpoint to save all data
app.post('/api/data', async (req, res) => {
  const incomingData = req.body;
  
  // Basic validation to make sure we're receiving an object
  if (typeof incomingData !== 'object' || incomingData === null) {
    return res.status(400).json({ error: 'Invalid data format. Expected an object.' });
  }

  db.data = incomingData; // Replace the entire database with the new data
  await db.write();
  res.status(200).json({ message: 'Data saved successfully!' });
});

// -- Start Server --
app.listen(PORT, () => {
  console.log(`LockieMedia server is running at http://localhost:${PORT}`);
});