import express from 'express';
import cors from 'cors';
import axios from 'axios';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Configuration ---
const PORT = 3000;
const serviceTargets = {
    notesService: 'http://127.0.0.1:3002',
    taskService: 'http://127.0.0.1:3004',
    timeTrackerService: 'http://127.0.0.1:3005',
    devTrackerService: 'http://127.0.0.1:3006',
    calendarService: 'http://127.0.0.1:3003',
};

// --- Security Configuration ---
const VALID_API_KEYS = new Set([
    "THeYYjPRRvQ6CjJFPL0T6cpAyfWbIMFm9U0Lo4d+saQ="
]);

// --- Authentication Middleware ---
const authenticateKey = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    const apiKey = req.get('X-API-Key')?.trim();
    if (apiKey && VALID_API_KEYS.has(apiKey)) {
        next();
    } else {
        console.error(`[API Gateway] Authentication failed. Invalid or missing API Key.`);
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// --- Express App Setup ---
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// --- API Routes (MUST be defined before static file serving) ---
app.use('/api', authenticateKey);

app.get('/api/data', async (req, res) => {
    console.log('[API Gateway] GET /api/data received...');
    try {
        const [taskData, notesData, timeData, devData, calendarData] = await Promise.all([
            axios.get(`${serviceTargets.taskService}/api/core-data`).catch(e => { console.error("Task service failed:", e.message); return { data: {} }; }),
            axios.get(`${serviceTargets.notesService}/api/notes-data`).catch(e => { console.error("Notes service failed:", e.message); return { data: {} }; }),
            axios.get(`${serviceTargets.timeTrackerService}/api/time-data`).catch(e => { console.error("Time service failed:", e.message); return { data: {} }; }),
            axios.get(`${serviceTargets.devTrackerService}/api/dev-data`).catch(e => { console.error("Dev service failed:", e.message); return { data: {} }; }),
            axios.get(`${serviceTargets.calendarService}/api/calendar-data`).catch(e => { console.error("Calendar service failed:", e.message); return { data: {} }; })
        ]);

        const combinedData = {
            ...taskData.data,
            ...notesData.data,
            ...timeData.data,
            ...devData.data,
            ...calendarData.data,
        };
        res.json(combinedData);
        console.log('[API Gateway] Successfully composed response for GET /api/data.');
    } catch (error) {
        console.error('[API Gateway] Critical error during GET request composition.', error.message);
        res.status(500).json({ error: 'Failed to retrieve data from one or more services.' });
    }
});

// --- Static File Serving ---
// This must come *after* all API routes. All other specific routes have been removed for now to ensure this works.
app.use(express.static(path.join(__dirname, '../../public')));


// -- Start HTTP Server --
app.listen(PORT, () => {
    console.log(`[HTTP API Gateway] Listening on port ${PORT}`);
});