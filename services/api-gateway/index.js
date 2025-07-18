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
    calendarService: 'http://127.0.0.1:3008',
    habitTrackerService: 'http://127.0.0.1:3010', // NEW
    pomodoroService: 'http://127.0.0.1:3011',   // NEW
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


// --- API Routes ---
app.use('/api', authenticateKey);

const fetchServiceDataWithRetry = async (serviceName, serviceUrl, retries = 3, delay = 1000) => {
    try {
        let endpoint = '';
        if (serviceName === 'taskService') endpoint = '/api/core-data';
        else if (serviceName === 'notesService') endpoint = '/api/notes-data';
        else if (serviceName === 'timeTrackerService') endpoint = '/api/time-data';
        else if (serviceName === 'devTrackerService') endpoint = '/api/dev-data';
        else if (serviceName === 'calendarService') endpoint = '/api/calendar-data';
        else if (serviceName === 'habitTrackerService') endpoint = '/api/habits-data'; // NEW
        else if (serviceName === 'pomodoroService') endpoint = '/api/pomodoro-data'; // NEW
        else return {};

        const response = await axios.get(`${serviceUrl}${endpoint}`);
        console.log(`[API Gateway] Successfully fetched data from ${serviceName}.`);
        return response.data;
    } catch (error) {
        if (retries > 0) {
            console.warn(`[API Gateway] Could not fetch from ${serviceName}, retrying in ${delay}ms... (${retries} retries left)`);
            await new Promise(res => setTimeout(res, delay));
            return fetchServiceDataWithRetry(serviceName, serviceUrl, retries - 1, delay * 2);
        }
        console.error(`[API Gateway] CRITICAL: Could not fetch data from ${serviceName} after multiple retries. Error: ${error.message}`);
        return { [`${serviceName}_error`]: error.message };
    }
};


app.get('/api/data', async (req, res) => {
    console.log('[API Gateway] GET /api/data received. Composing response from services...');

    const servicePromises = Object.entries(serviceTargets).map(([name, url]) => fetchServiceDataWithRetry(name, url));

    try {
        const results = await Promise.all(servicePromises);
        const combinedData = results.reduce((acc, data) => ({ ...acc, ...data }), {});
        res.json(combinedData);
        console.log('[API Gateway] Successfully composed and sent response for GET /api/data.');
    } catch (error) {
        console.error('[API Gateway] Critical error during GET request composition.', error.message);
        res.status(500).json({ error: 'A critical error occurred while composing data from backend services.' });
    }
});


app.post('/api/data', async (req, res) => {
    console.log('[API Gateway] POST /api/data received. Distributing data to services...');
    const incomingData = req.body;

    const servicePayloads = {
        taskService: { data: { tasks: incomingData.tasks, projects: incomingData.projects, userProfile: incomingData.userProfile, userPreferences: incomingData.userPreferences }, endpoint: '/api/core-data' },
        notesService: { data: { notes: incomingData.notes, notebooks: incomingData.notebooks }, endpoint: '/api/notes-data' },
        timeTrackerService: { data: { time_activities: incomingData.time_activities, time_log_entries: incomingData.time_log_entries }, endpoint: '/api/time-data' },
        devTrackerService: { data: { dev_epics: incomingData.dev_epics, dev_tickets: incomingData.dev_tickets, dev_release_versions: incomingData.dev_release_versions, dev_ticket_history: incomingData.dev_ticket_history, dev_ticket_comments: incomingData.dev_ticket_comments }, endpoint: '/api/dev-data' },
        calendarService: { data: { calendar_events: incomingData.calendar_events }, endpoint: '/api/calendar-data' },
        habitTrackerService: { data: { habits: incomingData.habits, habit_completions: incomingData.habit_completions }, endpoint: '/api/habits-data' }, // NEW
        pomodoroService: { data: { pomodoro_sessions: incomingData.pomodoro_sessions }, endpoint: '/api/pomodoro-data' } // NEW
    };

    const postPromises = [];
    for (const [serviceName, { data, endpoint }] of Object.entries(servicePayloads)) {
        if (Object.values(data).some(d => d !== undefined)) {
            const requestPromise = axios.post(`${serviceTargets[serviceName]}${endpoint}`, data)
                .then(() => console.log(`[API Gateway] Successfully sent data to ${serviceName}.`))
                .catch(error => console.error(`[API Gateway] WARN: Could not send data to ${serviceName}. Service may be down. Error: ${error.message}`));
            postPromises.push(requestPromise);
        }
    }

    await Promise.allSettled(postPromises);
    res.status(200).json({ message: 'Data distribution attempted for all services.' });
});

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

app.post('/api/dev-release-versions', (req, res) => proxyRequest(req, res, serviceTargets.devTrackerService));
app.post('/api/tickets/:ticketId/comments', (req, res) => proxyRequest(req, res, serviceTargets.devTrackerService));
app.delete('/api/tickets/:ticketId/comments/:commentId', (req, res) => proxyRequest(req, res, serviceTargets.devTrackerService));
app.patch('/api/tickets/:ticketId/status', (req, res) => proxyRequest(req, res, serviceTargets.devTrackerService));


// --- Static File Serving ---
app.use(express.static(path.join(__dirname, '../../public')));


// -- Start HTTP Server --
app.listen(PORT, () => {
    console.log(`[HTTP API Gateway] Listening on port ${PORT}`);
});