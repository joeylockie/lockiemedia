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

const proxyRequest = async (req, res, serviceUrl) => {
    try {
        const response = await axios({
            method: req.method,
            // --- THIS IS THE FINAL FIX ---
            // The URL forwarded to the service must NOT include the '/api' prefix,
            // as the service itself does not expect it.
            url: `${serviceUrl}${req.originalUrl.replace('/api', '')}`,
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

// --- START: DEV TRACKER PROXY ROUTES ---
// These routes explicitly forward all matching requests to the dev tracker service.
app.use('/api/epics', (req, res) => proxyRequest(req, res, serviceTargets.devTrackerService));
app.use('/api/tickets', (req, res) => proxyRequest(req, res, serviceTargets.devTrackerService));
app.use('/api/subtasks', (req, res) => proxyRequest(req, res, serviceTargets.devTrackerService));
app.use('/api/dev-release-versions', (req, res) => proxyRequest(req, res, serviceTargets.devTrackerService));
// --- END: DEV TRACKER PROXY ROUTES ---

// --- General Data Sync Routes (Unchanged) ---
const fetchServiceDataWithRetry = async (serviceName, serviceUrl) => {
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
};

app.get('/api/data', async (req, res) => {
    const servicePromises = Object.entries(serviceTargets).map(([name, url]) => fetchServiceDataWithRetry(name, url));
    try {
        const results = await Promise.all(servicePromises);
        const combinedData = results.reduce((acc, data) => ({ ...acc, ...data }), {});
        res.json(combinedData);
    } catch (error) {
        res.status(500).json({ error: 'A critical error occurred while composing data.' });
    }
});

app.post('/api/data', async (req, res) => {
    // This function remains unchanged
    const incomingData = req.body;
    const servicePayloads = {
        taskService: { data: { tasks: incomingData.tasks, projects: incomingData.projects, userProfile: incomingData.userProfile, userPreferences: incomingData.userPreferences }, endpoint: '/api/core-data' },
        notesService: { data: { notes: incomingData.notes, notebooks: incomingData.notebooks }, endpoint: '/api/notes-data' },
        timeTrackerService: { data: { time_activities: incomingData.time_activities, time_log_entries: incomingData.time_log_entries }, endpoint: '/api/time-data' },
        devTrackerService: { data: { dev_epics: incomingData.dev_epics, dev_tickets: incomingData.dev_tickets, dev_release_versions: incomingData.dev_release_versions, dev_ticket_history: incomingData.dev_ticket_history, dev_ticket_comments: incomingData.dev_ticket_comments }, endpoint: '/api/dev-data' },
        calendarService: { data: { calendar_events: incomingData.calendar_events }, endpoint: '/api/calendar-data' },
        habitTrackerService: { data: { habits: incomingData.habits, habit_completions: incomingData.habit_completions }, endpoint: '/api/habits-data' },
        pomodoroService: { data: { pomodoro_sessions: incomingData.pomodoro_sessions }, endpoint: '/api/pomodoro-data' }
    };
    const postPromises = [];
    for (const [serviceName, { data, endpoint }] of Object.entries(servicePayloads)) {
        if (Object.values(data).some(d => d !== undefined)) {
            const requestPromise = axios.post(`${serviceTargets[serviceName]}${endpoint}`, data).catch(error => console.error(`[API Gateway] WARN: Could not send data to ${serviceName}. Error: ${error.message}`));
            postPromises.push(requestPromise);
        }
    }
    await Promise.allSettled(postPromises);
    res.status(200).json({ message: 'Data distribution attempted.' });
});

app.get('/api/database/backup', (req, res) => {
    const dbPath = process.env.DB_FILE_PATH || path.resolve(__dirname, '../../lockiedb.sqlite');
    if (fs.existsSync(dbPath)) {
        const dateString = new Date().toISOString().split('T')[0];
        const filename = `lockiemedia_backup_${dateString}.sqlite`;
        res.download(dbPath, filename);
    } else {
        res.status(404).json({ error: 'Database file not found.' });
    }
});

app.use(express.static(path.join(__dirname, '../../public')));

app.listen(PORT, () => {
    console.log(`[HTTP API Gateway] Listening on port ${PORT}`);
});