import express from 'express';
import axios from 'axios';
import cors from 'cors';
import morgan from 'morgan';

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || "THeYYjPRRvQ6CjJFPL0T6cpAyfWbIMFm9U0Lo4d+saQ=";

const SERVICES = {
    notes: process.env.NOTES_SERVICE_URL || 'http://localhost:3002',
    tasks: process.env.TASK_SERVICE_URL || 'http://localhost:3004',
    timeTracker: process.env.TIME_TRACKER_SERVICE_URL || 'http://localhost:3005',
    calendar: process.env.CALENDAR_SERVICE_URL || 'http://localhost:3008',
    habitTracker: process.env.HABIT_TRACKER_SERVICE_URL || 'http://localhost:3010',
    pomodoro: process.env.POMODORO_SERVICE_URL || 'http://localhost:3011',
};

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const apiKeyMiddleware = (req, res, next) => {
    const providedApiKey = req.get('X-API-Key');
    if (!providedApiKey || providedApiKey !== API_KEY) {
        console.error('[API Gateway] ERROR: Invalid or missing API Key.');
        return res.status(401).send({ error: 'Unauthorized: Invalid API Key' });
    }
    next();
};

app.use('/api', apiKeyMiddleware);

app.get('/api/data', async (req, res) => {
    console.log('[API Gateway] GET /api/data: Fetching data from all services.');
    try {
        const requests = Object.values(SERVICES).map(baseUrl =>
            axios.get(baseUrl, { headers: { 'X-API-Key': API_KEY } })
        );

        const responses = await Promise.all(requests.map(p => p.catch(e => ({ error: e, data: {} }))));
        const combinedData = responses.reduce((acc, response) => {
            if (response.error) {
                console.error(`[API Gateway] Error fetching from a service:`, response.error.message);
                return acc;
            }
            return { ...acc, ...response.data };
        }, {});

        res.json(combinedData);
    } catch (error) {
        console.error('[API Gateway] CRITICAL: Error in GET /api/data:', error);
        res.status(500).json({ error: 'Failed to fetch data from microservices.' });
    }
});

app.post('/api/data', async (req, res) => {
    console.log('[API Gateway] POST /api/data: Receiving data to sync with all services.');
    const fullData = req.body;
    try {
        const requests = Object.entries(SERVICES).map(([serviceName, baseUrl]) => {
            const serviceDataKeyMap = {
                tasks: ['tasks', 'projects', 'userPreferences', 'userProfile'],
                notes: ['notes', 'notebooks'],
                timeTracker: ['time_activities', 'time_log_entries'],
                calendar: ['calendar_events'],
                habitTracker: ['habits', 'habit_completions'],
                pomodoro: ['pomodoro_sessions']
            };

            const keysForService = serviceDataKeyMap[serviceName];
            if (!keysForService) return Promise.resolve();
            
            const dataForService = {};
            let hasData = false;
            keysForService.forEach(key => {
                if(fullData[key] !== undefined) {
                    dataForService[key] = fullData[key];
                    hasData = true;
                }
            });

            if (hasData) {
                return axios.post(baseUrl, dataForService, { headers: { 'X-API-Key': API_KEY } })
                    .catch(err => console.error(`[API Gateway] Error posting to ${serviceName}:`, err.message));
            }
            return Promise.resolve();
        });

        await Promise.all(requests);
        res.status(200).json({ message: 'Data sync initiated with all services.' });
    } catch (error) {
        console.error('[API Gateway] CRITICAL: Error in POST /api/data:', error);
        res.status(500).json({ error: 'Failed to sync data with microservices.' });
    }
});

app.get('/api/database/backup', (req, res) => {
    const dbPath = process.env.DB_PATH || '/root/lockiemedia-dev/lockiedb.sqlite';
    res.download(dbPath, 'lockiedb.sqlite', (err) => {
        if (err) {
            console.error("[API Gateway] Error sending database file:", err);
            res.status(500).send({ error: "Could not download the database file." });
        }
    });
});

app.listen(PORT, () => {
    console.log(`[API Gateway] Gateway is running on http://localhost:${PORT}`);
});