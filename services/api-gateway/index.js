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
    calendarService: 'http://localhost:3003',
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
    
    let combinedData = {};
    const serviceRequests = Object.entries(serviceTargets).map(async ([serviceName, serviceUrl]) => {
        try {
            // Map service names to their specific data endpoints
            let endpoint = '';
            if (serviceName === 'taskService') endpoint = '/api/core-data';
            else if (serviceName === 'notesService') endpoint = '/api/notes-data';
            else if (serviceName === 'timeTrackerService') endpoint = '/api/time-data';
            else if (serviceName === 'devTrackerService') endpoint = '/api/dev-data';
            else if (serviceName === 'calendarService') endpoint = '/api/calendar-data';
            else return;

            const response = await axios.get(`${serviceUrl}${endpoint}`);
            combinedData = { ...combinedData, ...response.data };
            console.log(`[API Gateway] Successfully fetched data from ${serviceName}.`);

        } catch (error) {
            console.error(`[API Gateway] WARN: Could not fetch data from ${serviceName}. Service may be down. Error: ${error.message}`);
            // Don't throw an error, just log it. This makes the gateway resilient.
        }
    });

    try {
        await Promise.all(serviceRequests);
        res.json(combinedData);
        console.log('[API Gateway] Successfully composed and sent response for GET /api/data (some services may have been skipped).');
    } catch (error) {
        // This outer catch is for unexpected errors during the Promise.all execution itself.
        console.error('[API Gateway] Critical error during service request composition.', error.message);
        res.status(500).json({ error: 'A critical error occurred while composing data from backend services.' });
    }
});


app.post('/api/data', async (req, res) => {
    console.log('[API Gateway] POST /api/data received. Distributing data to services...');
    const incomingData = req.body;
    
    const servicePayloads = {
        taskService: {
            tasks: incomingData.tasks,
            projects: incomingData.projects,
            userProfile: incomingData.userProfile,
            userPreferences: incomingData.userPreferences,
        },
        notesService: {
            notes: incomingData.notes,
            notebooks: incomingData.notebooks
        },
        timeTrackerService: {
            time_activities: incomingData.time_activities,
            time_log_entries: incomingData.time_log_entries
        },
        devTrackerService: {
            dev_epics: incomingData.dev_epics,
            dev_tickets: incomingData.dev_tickets,
            dev_release_versions: incomingData.dev_release_versions,
            dev_ticket_history: incomingData.dev_ticket_history,
            dev_ticket_comments: incomingData.dev_ticket_comments,
        },
        calendarService: {
            calendar_events: incomingData.calendar_events
        }
    };

    const postRequests = Object.entries(serviceTargets).map(async ([serviceName, serviceUrl]) => {
         try {
            let endpoint = '';
            let payload = {};

            if (serviceName === 'taskService') { endpoint = '/api/core-data'; payload = servicePayloads.taskService; }
            else if (serviceName === 'notesService') { endpoint = '/api/notes-data'; payload = servicePayloads.notesService; }
            else if (serviceName === 'timeTrackerService') { endpoint = '/api/time-data'; payload = servicePayloads.timeTrackerService; }
            else if (serviceName === 'devTrackerService') { endpoint = '/api/dev-data'; payload = servicePayloads.devTrackerService; }
            else if (serviceName === 'calendarService') { endpoint = '/api/calendar-data'; payload = servicePayloads.calendarService; }
            else return;

            // Only send the request if the relevant data exists
            if (Object.values(payload).some(data => data !== undefined)) {
                 await axios.post(`${serviceUrl}${endpoint}`, payload);
                 console.log(`[API Gateway] Successfully sent data to ${serviceName}.`);
            }
        } catch (error) {
             console.error(`[API Gateway] WARN: Could not send data to ${serviceName}. Service may be down. Error: ${error.message}`);
        }
    });

    try {
        await Promise.all(postRequests);
        res.status(200).json({ message: 'Data distribution attempted for all services.' });
        console.log('[API Gateway] Finished distributing POST /api/data to services.');
    } catch (error) {
        console.error('[API Gateway] Critical error during POST service request distribution.', error.message);
        res.status(500).json({ error: 'A critical error occurred while saving data to backend services.' });
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

app.delete('/api/tickets/:ticketId/comments/:commentId', async (req, res) => {
    const { ticketId, commentId } = req.params;
    console.log(`[API Gateway] DELETE /api/tickets/${ticketId}/comments/${commentId} received. Forwarding...`);
    try {
        const response = await axios.delete(`${serviceTargets.devTrackerService}/api/tickets/${ticketId}/comments/${commentId}`);
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