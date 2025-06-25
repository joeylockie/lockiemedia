import express from 'express';
import cors from 'cors';
import axios from 'axios';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Configuration ---
const PORT = 3000;
const serviceTargets = {
    notesService: 'http://localhost:3002',
    taskService: 'http://localhost:3004',
    timeTrackerService: 'http://localhost:3005',
    devTrackerService: 'http://localhost:3006',
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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// --- API Routes (MUST be defined before static file serving) ---
app.use('/api', authenticateKey);

app.get('/api/data', async (req, res) => {
    console.log('[API Gateway] GET /api/data received. Composing response from services...');
    try {
        const [taskServiceResponse, notesResponse, timeTrackerResponse, devTrackerResponse] = await Promise.all([
            axios.get(`${serviceTargets.taskService}/api/core-data`),
            axios.get(`${serviceTargets.notesService}/api/notes-data`),
            axios.get(`${serviceTargets.timeTrackerService}/api/time-data`),
            axios.get(`${serviceTargets.devTrackerService}/api/dev-data`)
        ]);

        const combinedData = {
            ...taskServiceResponse.data,
            ...notesResponse.data,
            ...timeTrackerResponse.data,
            ...devTrackerResponse.data
        };
        res.json(combinedData);
        console.log('[API Gateway] Successfully composed and sent response for GET /api/data.');
    } catch (error) {
        console.error('[API Gateway] Error composing GET /api/data.');
        if (error.response) {
            console.error('Error Data:', error.response.data);
            console.error('Error Status:', error.response.status);
            console.error('Error Headers:', error.response.headers);
        } else if (error.request) {
            console.error('Error Request:', error.request);
        } else {
            console.error('Error Message:', error.message);
        }
        console.error('Full Error Config:', error.config);
        res.status(500).json({ error: 'Failed to retrieve data from backend services.' });
    }
});

app.post('/api/data', async (req, res) => {
    console.log('[API Gateway] POST /api/data received. Distributing data to services...');
    const incomingData = req.body;
    try {
        const notesPayload = {
            notes: incomingData.notes,
            notebooks: incomingData.notebooks
        };
        const taskServicePayload = {
            tasks: incomingData.tasks,
            projects: incomingData.projects,
            userProfile: incomingData.userProfile,
            userPreferences: incomingData.userPreferences,
        };
        const timeTrackerPayload = {
            time_activities: incomingData.time_activities,
            time_log_entries: incomingData.time_log_entries
        };
        const devTrackerPayload = {
            dev_epics: incomingData.dev_epics,
            dev_tickets: incomingData.dev_tickets,
            dev_release_versions: incomingData.dev_release_versions,
            dev_ticket_history: incomingData.dev_ticket_history,
            dev_ticket_comments: incomingData.dev_ticket_comments,
        };

        await Promise.all([
            axios.post(`${serviceTargets.taskService}/api/core-data`, taskServicePayload),
            axios.post(`${serviceTargets.notesService}/api/notes-data`, notesPayload),
            axios.post(`${serviceTargets.timeTrackerService}/api/time-data`, timeTrackerPayload),
            axios.post(`${serviceTargets.devTrackerService}/api/dev-data`, devTrackerPayload)
        ]);
        res.status(200).json({ message: 'Data saved successfully across all services!' });
        console.log('[API Gateway] Successfully distributed POST /api/data to all services.');
    } catch (error) {
        console.error('[API Gateway] Error distributing POST /api/data.');
        if (error.response) {
            console.error('Error Data:', error.response.data);
            console.error('Error Status:', error.response.status);
        } else if (error.request) {
            console.error('Error Request:', error.request);
        } else {
            console.error('Error Message:', error.message);
        }
        res.status(500).json({ error: 'Failed to save data to backend services.' });
    }
});

app.post('/api/dev-release-versions', async (req, res) => {
    console.log('[API Gateway] POST /api/dev-release-versions received. Forwarding to dev-tracker-service...');
    try {
        const response = await axios.post(`${serviceTargets.devTrackerService}/api/dev-release-versions`, req.body);
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('[API Gateway] Error forwarding POST /api/dev-release-versions.');
        const status = error.response ? error.response.status : 500;
        const data = error.response ? error.response.data : { error: 'Internal gateway error' };
        res.status(status).json(data);
    }
});

// --- THIS IS THE FIX ---
// Add route handlers for ticket-specific actions.
app.post('/api/tickets/:ticketId/comments', async (req, res) => {
    const { ticketId } = req.params;
    console.log(`[API Gateway] POST /api/tickets/${ticketId}/comments received. Forwarding...`);
    try {
        const response = await axios.post(`${serviceTargets.devTrackerService}/api/tickets/${ticketId}/comments`, req.body);
        res.status(response.status).json(response.data);
    } catch (error) {
        const status = error.response ? error.response.status : 500;
        const data = error.response ? error.response.data : { error: 'Internal gateway error' };
        res.status(status).json(data);
    }
});

app.patch('/api/tickets/:ticketId/status', async (req, res) => {
    const { ticketId } = req.params;
    console.log(`[API Gateway] PATCH /api/tickets/${ticketId}/status received. Forwarding...`);
    try {
        const response = await axios.patch(`${serviceTargets.devTrackerService}/api/tickets/${ticketId}/status`, req.body);
        res.status(response.status).json(response.data);
    } catch (error) {
        const status = error.response ? error.response.status : 500;
        const data = error.response ? error.response.data : { error: 'Internal gateway error' };
        res.status(status).json(data);
    }
});


// --- Static File Serving ---
// This must come *after* all API routes.
app.use(express.static(path.join(__dirname, '../../public')));


// -- Start HTTP Server --
app.listen(PORT, () => {
    console.log(`[HTTP API Gateway] Listening on port ${PORT}`);
});