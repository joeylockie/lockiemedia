import express from 'express';
import cors from 'cors';
import axios from 'axios';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const PORT = 3000;
const IP_ADDRESS = '192.168.2.201';

const serviceTargets = {
    notesService: 'http://192.168.2.201:3002',
    taskService: 'http://192.168.2.201:3004',
    timeTrackerService: 'http://192.168.2.201:3005',
    devTrackerService: 'http://192.168.2.201:3006',
    calendarService: 'http://192.168.2.201:3008',
    habitTrackerService: 'http://192.168.2.201:3010',
    pomodoroService: 'http://192.168.2.201:3011',
};

const VALID_API_KEYS = new Set([
    "THeYYjPRRvQ6CjJFPL0T6cpAyfWbIMFm9U0Lo4d+saQ="
]);

const authenticateKey = (req, res, next) => {
    if (req.method === 'OPTIONS') return next();
    const apiKey = req.get('X-API-Key')?.trim();
    if (apiKey && VALID_API_KEYS.has(apiKey)) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/api', authenticateKey);

// Generic proxy function
const proxyRequest = async (req, res, serviceUrl) => {
    try {
        const response = await axios({
            method: req.method,
            url: `${serviceUrl}${req.originalUrl}`,
            data: req.body,
            headers: { 'Content-Type': 'application/json' }
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        const status = error.response ? error.response.status : 500;
        const data = error.response ? error.response.data : { error: 'Internal gateway error' };
        console.error(`[API Gateway] Error proxying request to ${serviceUrl}${req.originalUrl}:`, data);
        res.status(status).json(data);
    }
};

// --- START: ALL DEV TRACKER PROXY ROUTES ---
// These routes must be defined BEFORE the general /api/data routes.
// Epics
app.post('/api/epics', (req, res) => proxyRequest(req, res, serviceTargets.devTrackerService));
app.put('/api/epics/:epicId', (req, res) => proxyRequest(req, res, serviceTargets.devTrackerService));
app.delete('/api/epics/:epicId', (req, res) => proxyRequest(req, res, serviceTargets.devTrackerService));
// Tickets
app.post('/api/tickets', (req, res) => proxyRequest(req, res, serviceTargets.devTrackerService));
app.put('/api/tickets/:ticketId', (req, res) => proxyRequest(req, res, serviceTargets.devTrackerService));
// Subtasks
app.post('/api/tickets/:ticketId/subtasks', (req, res) => proxyRequest(req, res, serviceTargets.devTrackerService));
app.put('/api/subtasks/:subtaskId', (req, res) => proxyRequest(req, res, serviceTargets.devTrackerService));
app.delete('/api/subtasks/:subtaskId', (req, res) => proxyRequest(req, res, serviceTargets.devTrackerService));
// Comments
app.post('/api/tickets/:ticketId/comments', (req, res) => proxyRequest(req, res, serviceTargets.devTrackerService));
app.delete('/api/tickets/:ticketId/comments/:commentId', (req, res) => proxyRequest(req, res, serviceTargets.devTrackerService));
// Status
app.patch('/api/tickets/:ticketId/status', (req, res) => proxyRequest(req, res, serviceTargets.devTrackerService));
// Release Versions
app.post('/api/dev-release-versions', (req, res) => proxyRequest(req, res, serviceTargets.devTrackerService));
// --- END: ALL DEV TRACKER PROXY ROUTES ---

// General data sync routes
app.get('/api/data', async (req, res) => { /* ... unchanged ... */ });
app.post('/api/data', async (req, res) => { /* ... unchanged ... */ });
app.get('/api/database/backup', (req, res) => { /* ... unchanged ... */ });

// Static File Serving
app.use(express.static(path.join(__dirname, '../../public')));

// Start Server
app.listen(PORT, () => {
    console.log(`[HTTP API Gateway] Listening on port ${PORT}`);
});

// Helper function for GET /api/data (unchanged)
async function fetchServiceDataWithRetry(serviceName, serviceUrl) {
    // ... logic is unchanged ...
    try {
        let endpoint = '';
        if (serviceName === 'taskService') endpoint = '/api/core-data';
        else if (serviceName === 'notesService') endpoint = '/api/notes-data';
        else if (serviceName === 'timeTrackerService') endpoint = '/api/time-data';
        else if (serviceName === 'devTrackerService') endpoint = '/api/dev-data';
        else if (serviceName === 'calendarService') endpoint = '/api/calendar-data';
        else if (serviceName === 'habitTrackerService') endpoint = '/api/habits-data';
        else if (serviceName === 'pomodoroService') endpoint = '/api/pomodoro-data';
        else return {};

        const response = await axios.get(`${serviceUrl}${endpoint}`);
        return response.data;
    } catch (error) {
        console.error(`[API Gateway] CRITICAL: Could not fetch data from ${serviceName}. Error: ${error.message}`);
        return { [`${serviceName}_error`]: error.message };
    }
}