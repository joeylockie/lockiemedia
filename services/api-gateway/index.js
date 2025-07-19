import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // <--- THIS IS THE CRITICAL ADDITION
app.use(express.urlencoded({ extended: true }));

// --- Service Registry ---
// A simple object to hold the base URLs of your microservices.
// This makes it easy to manage and update service locations.
const services = {
    notesService: 'http://localhost:3002',
    taskService: 'http://localhost:3004',
    timeTrackerService: 'http://localhost:3005',
    devTrackerService: 'http://localhost:3006',
    calendarService: 'http://localhost:3008',
    habitTrackerService: 'http://localhost:3010',
    pomodoroService: 'http://localhost:3011',
};

// --- Dynamic API Key for Authorization ---
// This middleware checks for an API key in the request headers.
const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    // In a real application, you'd compare this to a securely stored key.
    // For this project, we just check for its existence.
    if (!apiKey) {
        return res.status(401).json({ error: 'Unauthorized: API Key is required.' });
    }
    // You could add logic here to validate the key if needed.
    // For now, if a key is present, we allow the request to proceed.
    next();
};

// Apply the API Key authentication to all /api routes
app.use('/api', apiKeyAuth);


// --- Generic Proxy Middleware ---
// This function creates a flexible proxy for any of your services.
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
                data: req.body, // Forward the request body
                headers: {
                    // Forward relevant headers, but exclude host-specific ones
                    'Content-Type': 'application/json',
                    // You can add other headers to forward here if needed
                }
            });

            res.status(response.status).json(response.data);
        } catch (error) {
            console.error(`[API Gateway] Error proxying to ${serviceName}:`, error.message);
            // If the service returns an error, forward that status and message
            if (error.response) {
                res.status(error.response.status).json(error.response.data);
            } else {
                // For network errors or other issues
                res.status(500).json({ error: 'Internal gateway error' });
            }
        }
    };
};

// --- Aggregated Data Endpoints ---
// These endpoints fetch data from multiple services and combine it.

app.get('/api/all-data', async (req, res) => {
    try {
        console.log('[API Gateway] Request received for /api/all-data');
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
                 .catch(error => {
                     console.error(`[API Gateway] CRITICAL: Could not fetch data from ${service.name}.`, error.message);
                     // Return a specific error object for this service
                     return { status: 'error', service: service.name, reason: error.message };
                 })
        );

        const responses = await Promise.all(requests);

        const allData = {
            tasks: responses[0].data,
            notes: responses[1].data,
            timeData: responses[2].data,
            devData: responses[3].data,
            habitData: responses[4].data,
            pomodoroData: responses[5].data,
            calendarData: responses[6].data,
        };

        // Filter out any services that failed
        Object.keys(allData).forEach((key, index) => {
            if (responses[index].status === 'error') {
                allData[key] = { error: `Failed to load data from ${responses[index].service}.` };
            }
        });


        console.log('[API Gateway] Successfully aggregated all data.');
        res.json(allData);

    } catch (error) {
        console.error('[API Gateway] FATAL: An unexpected error occurred during data aggregation.', error);
        res.status(500).json({ error: 'A fatal error occurred on the server.' });
    }
});

// --- Database Backup Endpoint ---
app.get('/api/database/backup', (req, res) => {
    // This provides a direct, secure way for the user to download the database.
    const dbPath = process.env.DB_PATH || path.join(__dirname, '..', '..', 'lockiedb.sqlite');
    console.log(`[API Gateway] Database backup requested. Providing file from: ${dbPath}`);
    res.download(dbPath, 'lockiedb.sqlite', (err) => {
        if (err) {
            console.error("[API Gateway] Error sending database file:", err);
            res.status(500).send("Could not download the database file.");
        }
    });
});


// --- Dynamic Routing Rules ---
// Define which URL patterns should be proxied to which service.
// This setup is clean, scalable, and easy to debug.

// Notes Service Routes
app.use('/api/notes', proxyRequest('notesService'));
app.use('/api/notebooks', proxyRequest('notesService'));

// Task Service Routes
app.use('/api/tasks', proxyRequest('taskService'));
app.use('/api/projects', proxyRequest('taskService'));
app.use('/api/labels', proxyRequest('taskService'));
app.use('/api/user-profile', proxyRequest('taskService'));
app.use('/api/user-preferences', proxyRequest('taskService'));

// Time Tracker Routes
app.use('/api/time-activities', proxyRequest('timeTrackerService'));
app.use('/api/time-log-entries', proxyRequest('timeTrackerService'));

// Dev Tracker Routes
app.use('/api/epics', proxyRequest('devTrackerService'));
app.use('/api/tickets', proxyRequest('devTrackerService'));

// Calendar Routes
app.use('/api/calendar-events', proxyRequest('calendarService'));

// Habit Tracker Routes
app.use('/api/habits', proxyRequest('habitTrackerService'));
app.use('/api/habit-completions', proxyRequest('habitTrackerService'));

// Pomodoro Routes
app.use('/api/pomodoro-sessions', proxyRequest('pomodoroService'));


// --- Server Initialization ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[HTTP API Gateway] Listening on port ${PORT}`);
});