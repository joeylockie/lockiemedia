import express from 'express';
import cors from 'cors';
import axios from 'axios';

// --- Configuration ---
const PORT = 3000;
const serviceTargets = {
    notesService: 'http://localhost:3002',
    taskService: 'http://localhost:3004',
    timeTrackerService: 'http://localhost:3005',
};

// --- Security Configuration ---
const VALID_API_KEYS = new Set([
    "THeYYjPRRvQ6CjJFPL0T6cpAyfWbIMFm9U0Lo4d+saQ="
]);

// --- Authentication Middleware ---
const authenticateKey = (req, res, next) => {
    // --- NEW: Handle browser pre-flight requests ---
    // If the request method is OPTIONS, it's a pre-flight check.
    // We let it pass without checking for a key.
    if (req.method === 'OPTIONS') {
        return next();
    }
    // --- End of new code ---

    const apiKey = req.get('X-API-Key')?.trim();
    console.log(`[API Gateway] Authenticating request...`);

    if (apiKey && VALID_API_KEYS.has(apiKey)) {
        console.log(`[API Gateway] API Key validated successfully.`);
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
app.use(express.static('public')); 

// --- API Routes ---
app.use('/api', authenticateKey);

app.get('/api/data', async (req, res) => {
    console.log('[API Gateway] GET /api/data received. Composing response from services...');
    try {
        const [taskServiceResponse, notesResponse, timeTrackerResponse] = await Promise.all([
            axios.get(`${serviceTargets.taskService}/api/core-data`),
            axios.get(`${serviceTargets.notesService}/api/notes-data`),
            axios.get(`${serviceTargets.timeTrackerService}/api/time-data`)
        ]);

        const combinedData = { ...taskServiceResponse.data, ...notesResponse.data, ...timeTrackerResponse.data };
        res.json(combinedData);
        console.log('[API Gateway] Successfully composed and sent response for GET /api/data.');
    } catch (error) {
        console.error('[API Gateway] Error composing GET /api/data:', error.message);
        res.status(500).json({ error: 'Failed to retrieve data from backend services.' });
    }
});

app.post('/api/data', async (req, res) => {
    console.log('[API Gateway] POST /api/data received. Distributing data to services...');
    const incomingData = req.body;
    try {
        const notesPayload = { notes: incomingData.notes, notebooks: incomingData.notebooks };
        const taskServicePayload = incomingData;
        const timeTrackerPayload = { time_activities: incomingData.time_activities, time_log_entries: incomingData.time_log_entries };
        await Promise.all([
            axios.post(`${serviceTargets.taskService}/api/core-data`, taskServicePayload),
            axios.post(`${serviceTargets.notesService}/api/notes-data`, notesPayload),
            axios.post(`${serviceTargets.timeTrackerService}/api/time-data`, timeTrackerPayload)
        ]);
        res.status(200).json({ message: 'Data saved successfully across all services!' });
        console.log('[API Gateway] Successfully distributed POST /api/data to all services.');
    } catch (error) {
        console.error('[API Gateway] Error distributing POST /api/data:', error.message);
        res.status(500).json({ error: 'Failed to save data to backend services.' });
    }
});

// -- Start Server --
app.listen(PORT, () => {
    console.log(`[API Gateway] Listening on port ${PORT}`);
});