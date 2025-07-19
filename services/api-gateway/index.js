import express from 'express';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// --- Static File Serving ---
// This is the crucial part that was missing. It serves your frontend.
// It needs to be defined BEFORE your API routes.
const publicPath = path.join(__dirname, '..', '..', 'public');
app.use(express.static(publicPath));

// --- Service Registry ---
const services = {
    notesService: 'http://localhost:3002',
    taskService: 'http://localhost:3004',
    timeTrackerService: 'http://localhost:3005',
    devTrackerService: 'http://localhost:3006',
    calendarService: 'http://localhost:3008',
    habitTrackerService: 'http://localhost:3010',
    pomodoroService: 'http://localhost:3011',
};

// --- API Key Authorization ---
const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(401).json({ error: 'Unauthorized: API Key is required.' });
    }
    next();
};

// Apply the API Key auth to all /api routes
app.use('/api', apiKeyAuth);

// --- Generic Proxy Middleware ---
const proxyRequest = (serviceName) => {
    return async (req, res) => {
        try {
            const serviceUrl = services[serviceName];
            if (!serviceUrl) {
                return res.status(502).json({ error: 'Service not found' });
            }

            const url = `${serviceUrl}${req.originalUrl}`;
            console.log(`[API Gateway] Proxying ${req.method} request to: ${url}`);

            const response = await axios({
                method: req.method,
                url: url,
                data: req.body,
                headers: { 'Content-Type': 'application/json' }
            });

            res.status(response.status).json(response.data);
        } catch (error) {
            console.error(`[API Gateway] Error proxying to ${serviceName}:`, error.message);
            if (error.response) {
                res.status(error.response.status).json(error.response.data);
            } else {
                res.status(500).json({ error: 'Internal gateway error' });
            }
        }
    };
};

// --- Aggregated Data Endpoints ---
app.get('/api/all-data', async (req, res) => {
    try {
        const servicesToFetch = [
            { name: 'taskService', url: `${services.taskService}/api/core-data` },
            { name: 'notesService', url: `${services.notesService}/api/notes-data` },
            { name: 'timeTrackerService', url: `${services.timeTrackerService}/api/time-data` },
            { name: 'devTrackerService', url: `${services.devTrackerService}/api/dev-data` },
            { name: 'habitTrackerService', url: `${services.habitTrackerService}/api/habits-data` },
            { name: 'pomodoroService', url: `${services.pomodoroService}/api/pomodoro-data` },
            { name: 'calendarService', url: `${services.calendarService}/api/calendar-data` },
        ];

        const requests = servicesToFetch.map(service =>
            axios.get(service.url, { headers: { 'x-api-key': req.headers['x-api-key'] }})
                 .catch(error => ({ status: 'error', service: service.name, reason: error.message }))
        );

        const responses = await Promise.all(requests);
        const allData = {};
        responses.forEach((response, index) => {
            const service = servicesToFetch[index];
            const key = service.name.replace('Service', 'Data'); // e.g., taskService -> taskData
            if (response.status === 'error') {
                console.error(`[API Gateway] CRITICAL: Could not fetch data from ${service.name}.`, response.reason);
                allData[key] = { error: `Failed to load data from ${service.name}.` };
            } else {
                allData[key] = response.data;
            }
        });

        res.json(allData);
    } catch (error) {
        console.error('[API Gateway] FATAL: An unexpected error occurred during data aggregation.', error);
        res.status(500).json({ error: 'A fatal error occurred on the server.' });
    }
});


// --- Database Backup Endpoint ---
app.get('/api/database/backup', (req, res) => {
    const backupDbPath = path.join(__dirname, '..', '..', 'lockiedb.sqlite');
    res.download(backupDbPath, 'lockiedb.sqlite', (err) => {
        if (err) {
            console.error("[API Gateway] Error sending database file:", err);
            res.status(500).send("Could not download the database file.");
        }
    });
});

// --- Dynamic API Routing Rules ---
app.use('/api/notes', proxyRequest('notesService'));
app.use('/api/notebooks', proxyRequest('notesService'));
app.use('/api/tasks', proxyRequest('taskService'));
app.use('/api/projects', proxyRequest('taskService'));
app.use('/api/labels', proxyRequest('taskService'));
app.use('/api/user-profile', proxyRequest('taskService'));
app.use('/api/user-preferences', proxyRequest('taskService'));
app.use('/api/time-activities', proxyRequest('timeTrackerService'));
app.use('/api/time-log-entries', proxyRequest('timeTrackerService'));
app.use('/api/epics', proxyRequest('devTrackerService'));
app.use('/api/tickets', proxyRequest('devTrackerService'));
app.use('/api/calendar-events', proxyRequest('calendarService'));
app.use('/api/habits', proxyRequest('habitTrackerService'));
app.use('/api/habit-completions', proxyRequest('habitTrackerService'));
app.use('/api/pomodoro-sessions', proxyRequest('pomodoroService'));

// --- Fallback for Frontend Routing ---
// This ensures that if you refresh a page like /tasks, the gateway still sends index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});


// --- Server Initialization ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[HTTP API Gateway] Listening on port ${PORT}`);
});