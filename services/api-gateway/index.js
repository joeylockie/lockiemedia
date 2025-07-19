import express from 'express';
import axios from 'axios';
import cors from 'cors';
import morgan from 'morgan';

// --- CONFIGURATION ---
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || "THeYYjPRRvQ6CjJFPL0T6cpAyfWbIMFm9U0Lo4d+saQ=";

// --- Service URLs ---
// These URLs point to your other microservices.
// They should be managed in your PM2 ecosystem file.
const SERVICES = {
    notes: process.env.NOTES_SERVICE_URL || 'http://localhost:3002',
    tasks: process.env.TASK_SERVICE_URL || 'http://localhost:3004',
    timeTracker: process.env.TIME_TRACKER_SERVICE_URL || 'http://localhost:3005',
    calendar: process.env.CALENDAR_SERVICE_URL || 'http://localhost:3008',
    habitTracker: process.env.HABIT_TRACKER_SERVICE_URL || 'http://localhost:3010',
    pomodoro: process.env.POMODORO_SERVICE_URL || 'http://localhost:3011',
};

// --- INITIALIZE EXPRESS APP ---
const app = express();

// --- MIDDLEWARE ---
// Enable Cross-Origin Resource Sharing so your frontend can talk to this gateway
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());
// Log HTTP requests for debugging
app.use(morgan('dev'));

// --- API KEY SECURITY MIDDLEWARE ---
// This function checks every incoming request for the correct API key.
const apiKeyMiddleware = (req, res, next) => {
    const providedApiKey = req.get('X-API-Key');
    if (!providedApiKey || providedApiKey !== API_KEY) {
        console.error('[API Gateway] ERROR: Invalid or missing API Key.');
        return res.status(401).send({ error: 'Unauthorized: Invalid API Key' });
    }
    next(); // If the key is valid, proceed to the next function.
};

// Apply the security middleware to all routes starting with /api
app.use('/api', apiKeyMiddleware);


// --- CORE API ROUTES ---

// GET /api/data - Fetches all data from all microservices
app.get('/api/data', async (req, res) => {
    console.log('[API Gateway] GET /api/data: Fetching data from all services.');
    try {
        const requests = Object.entries(SERVICES).map(([serviceName, baseUrl]) => {
            // Each service should have a GET / endpoint to return its data
            return axios.get(`${baseUrl}/`, { headers: { 'X-API-Key': API_KEY } })
                .then(response => ({ [serviceName]: response.data }))
                .catch(err => {
                    console.error(`[API Gateway] Error fetching from ${serviceName}:`, err.message);
                    return { [serviceName]: {} }; // Return empty object on error
                });
        });

        const results = await Promise.all(requests);
        const combinedData = results.reduce((acc, current) => ({ ...acc, ...current }), {});

        res.json(combinedData);
    } catch (error) {
        console.error('[API Gateway] CRITICAL: Error in GET /api/data:', error);
        res.status(500).json({ error: 'Failed to fetch data from microservices.' });
    }
});


// POST /api/data - Receives a full data payload and syncs it to all microservices
app.post('/api/data', async (req, res) => {
    console.log('[API Gateway] POST /api/data: Receiving data to sync with all services.');
    const fullData = req.body;

    try {
        const requests = Object.entries(SERVICES).map(([serviceName, baseUrl]) => {
            // Find the corresponding data block for the service
            // e.g., for 'notes' service, look for 'notes' key in the payload
            const serviceDataKey = Object.keys(fullData).find(key => key.toLowerCase().includes(serviceName.toLowerCase()));
            const dataForService = serviceDataKey ? fullData[serviceDataKey] : null;

            if (dataForService) {
                // Each service should have a POST / endpoint to receive its data
                 return axios.post(`${baseUrl}/`, dataForService, { headers: { 'X-API-Key': API_KEY } })
                    .catch(err => {
                        console.error(`[API Gateway] Error posting to ${serviceName}:`, err.message);
                        // We don't stop the whole process if one service fails
                    });
            }
            return Promise.resolve(); // If no data for this service, do nothing.
        });

        await Promise.all(requests);

        res.status(200).json({ message: 'Data sync initiated with all services.' });
    } catch (error) {
        console.error('[API Gateway] CRITICAL: Error in POST /api/data:', error);
        res.status(500).json({ error: 'Failed to sync data with microservices.' });
    }
});

// --- Database Backup Route ---
app.get('/api/database/backup', (req, res) => {
    console.log('[API Gateway] GET /api/database/backup: Initiating database backup download.');
    // The database path should ideally come from an environment variable for security.
    const dbPath = process.env.DB_PATH || '/root/lockiemedia-dev/lockiedb.sqlite';
    res.download(dbPath, 'lockiedb.sqlite', (err) => {
        if (err) {
            console.error("[API Gateway] Error sending database file:", err);
            res.status(500).send({ error: "Could not download the database file." });
        }
    });
});

// --- GENERIC PROXY ---
// This handles other specific requests not covered by the main data routes
app.use('/api/:serviceName/*', async (req, res) => {
    const { serviceName } = req.params;
    const serviceUrl = SERVICES[serviceName];

    if (!serviceUrl) {
        return res.status(404).json({ error: `Service '${serviceName}' not found.` });
    }

    const path = req.originalUrl.replace(`/api/${serviceName}`, '');
    const targetUrl = `${serviceUrl}${path}`;

    console.log(`[API Gateway] Proxying request for ${serviceName}: ${req.method} ${targetUrl}`);

    try {
        const response = await axios({
            method: req.method,
            url: targetUrl,
            data: req.body,
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY,
            }
        });
        res.status(response.status).send(response.data);
    } catch (error) {
        const status = error.response ? error.response.status : 500;
        const data = error.response ? error.response.data : { error: 'Proxying failed' };
        console.error(`[API Gateway] Error proxying to ${serviceName}:`, error.message);
        res.status(status).send(data);
    }
});


// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`[API Gateway] Gateway is running on http://localhost:${PORT}`);
    console.log(`[API Gateway] Loaded API Key: ${API_KEY ? "Yes" : "No"}`);
});