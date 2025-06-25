import EventBus from './eventBus.js';
import LoggingService from './loggingService.js';

// The API URL for the gateway. Now points to the UNSECURE HTTP endpoint.
const API_URL = 'http://192.168.2.200:3000/api/data';

// --- Security Configuration ---
// This MUST be the exact same key as in the api-gateway file, with no extra spaces.
const API_KEY = "THeYYjPRRvQ6CjJFPL0T6cpAyfWbIMFm9U0Lo4d+saQ=";

// --- Centralized Headers ---
const API_HEADERS = {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
};

// --- Internal State Variables ---
let _tasks = [];
let _projects = [];
let _uniqueLabels = [];
let _uniqueProjects = [];
let _userPreferences = {};
let _userProfile = {};
let _notebooks = [];
let _notes = [];
let _time_activities = [];
let _time_log_entries = [];
let _dev_epics = [];
let _dev_tickets = [];
let _dev_release_versions = []; // NEW
let _dev_ticket_history = []; // NEW
let _dev_ticket_comments = []; // NEW


// --- Private Helper Functions ---
function _publish(eventName, data) {
    if (EventBus && typeof EventBus.publish === 'function') {
        EventBus.publish(eventName, data);
    } else {
        LoggingService.warn(`[Store] EventBus not available to publish event: ${eventName}`, { module: 'store', functionName: '_publish' });
    }
}

function _updateUniqueLabelsInternal() {
    const labels = new Set();
    _tasks.forEach(task => {
        if (task.label && task.label.trim() !== '') {
            labels.add(task.label.trim());
        }
    });
    const oldLabelsJSON = JSON.stringify(_uniqueLabels);
    _uniqueLabels = Array.from(labels).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    if (JSON.stringify(_uniqueLabels) !== oldLabelsJSON) {
        LoggingService.debug('[Store] Unique labels updated.', { newLabels: _uniqueLabels, module: 'store', functionName: '_updateUniqueLabelsInternal' });
        _publish('labelsChanged', [..._uniqueLabels]);
    }
}

function _updateUniqueProjectsInternal() {
    const oldUniqueProjectsJSON = JSON.stringify(_uniqueProjects);
    _uniqueProjects = _projects
        .filter(project => project.id !== 0)
        .map(project => ({ id: project.id, name: project.name }))
        .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    if (JSON.stringify(_uniqueProjects) !== oldUniqueProjectsJSON) {
        LoggingService.debug('[Store] Unique projects updated for UI.', { newUniqueProjects: _uniqueProjects, module: 'store', functionName: '_updateUniqueProjectsInternal' });
        _publish('uniqueProjectsChanged', [..._uniqueProjects]);
    }
}

async function _saveAllData(source = 'unknown') {
    const functionName = '_saveAllData (Store)';
    LoggingService.debug(`[Store] Initiating save for all data to backend. Source: ${source}.`, { functionName, source });

    _updateUniqueLabelsInternal();
    _updateUniqueProjectsInternal();

    const dataToSave = {
        tasks: _tasks,
        projects: _projects,
        userPreferences: _userPreferences,
        userProfile: _userProfile,
        notebooks: _notebooks,
        notes: _notes,
        time_activities: _time_activities,
        time_log_entries: _time_log_entries,
        dev_epics: _dev_epics,
        dev_tickets: _dev_tickets,
        dev_release_versions: _dev_release_versions, // NEW
        // History and comments are saved via dedicated endpoints, not in this bulk save
        // to avoid race conditions and ensure atomicity. We still send them if needed
        // by the backend on initial setup, but our app logic will use specific APIs.
        dev_ticket_history: _dev_ticket_history,     // NEW
        dev_ticket_comments: _dev_ticket_comments,   // NEW
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: API_HEADERS,
            body: JSON.stringify(dataToSave),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Server responded with ${response.status}: ${errorBody}`);
        }

        const result = await response.json();
        LoggingService.info(`[Store] Data successfully saved to backend. Server says: ${result.message}`, { functionName });

    } catch (error) {
        LoggingService.error('[Store] Failed to save data to backend server.', error, { functionName, source });
        if (EventBus && EventBus.publish) {
            EventBus.publish('displayUserMessage', { text: 'Error: Could not save data to server. Check connection.', type: 'error' });
        }
    }
}

const AppStore = {
    getTasks: () => JSON.parse(JSON.stringify(_tasks)),
    getProjects: () => JSON.parse(JSON.stringify(_projects)),
    getKanbanColumns: () => [], 
    getUniqueLabels: () => [..._uniqueLabels],
    getUniqueProjects: () => [..._uniqueProjects],
    getUserPreferences: () => JSON.parse(JSON.stringify(_userPreferences)),
    getUserProfile: () => JSON.parse(JSON.stringify(_userProfile)),
    getNotebooks: () => JSON.parse(JSON.stringify(_notebooks)),
    getNotes: () => JSON.parse(JSON.stringify(_notes)),
    getTimeActivities: () => JSON.parse(JSON.stringify(_time_activities)),
    getTimeLogEntries: () => JSON.parse(JSON.stringify(_time_log_entries)),
    getDevEpics: () => JSON.parse(JSON.stringify(_dev_epics)),
    getDevTickets: () => JSON.parse(JSON.stringify(_dev_tickets)),
    getDevReleaseVersions: () => JSON.parse(JSON.stringify(_dev_release_versions)), // NEW
    getDevTicketHistory: () => JSON.parse(JSON.stringify(_dev_ticket_history)),     // NEW
    getDevTicketComments: () => JSON.parse(JSON.stringify(_dev_ticket_comments)),    // NEW

    setTasks: async (newTasksArray, source = 'setTasks') => {
        _tasks = JSON.parse(JSON.stringify(newTasksArray));
        await _saveAllData(source);
        _publish('tasksChanged', [..._tasks]);
    },
    setProjects: async (newProjectsArray, source = 'setProjects') => {
        const noProjectEntry = { id: 0, name: "No Project" };
        const filteredProjects = newProjectsArray.filter(p => p.id !== 0);
        _projects = [noProjectEntry, ...JSON.parse(JSON.stringify(filteredProjects))];
        await _saveAllData(source);
        _publish('projectsChanged', [..._projects]);
    },
    setUserPreferences: async (newPreferences, source = 'setUserPreferences') => {
        _userPreferences = { ..._userPreferences, ...JSON.parse(JSON.stringify(newPreferences)) };
        await _saveAllData(source);
        _publish('userPreferencesChanged', { ..._userPreferences });
    },
    setUserProfile: async (newProfile, source = 'setUserProfile') => {
       _userProfile = { ..._userProfile, ...JSON.parse(JSON.stringify(newProfile)) };
       await _saveAllData(source);
       _publish('userProfileChanged', { ..._userProfile });
    },
    setNotebooks: async (newNotebooksArray, source = 'setNotebooks') => {
        _notebooks = JSON.parse(JSON.stringify(newNotebooksArray));
        await _saveAllData(source);
        _publish('notebooksChanged', [..._notebooks]);
    },
    setNotes: async (newNotesArray, source = 'setNotes') => {
        _notes = JSON.parse(JSON.stringify(newNotesArray));
        await _saveAllData(source);
        _publish('notesChanged', [..._notes]);
    },
    setTimeActivities: async (newActivitiesArray, source = 'setTimeActivities') => {
        _time_activities = JSON.parse(JSON.stringify(newActivitiesArray));
        await _saveAllData(source);
        _publish('timeActivitiesChanged', [..._time_activities]);
    },
    setTimeLogEntries: async (newLogEntriesArray, source = 'setTimeLogEntries') => {
        _time_log_entries = JSON.parse(JSON.stringify(newLogEntriesArray));
        await _saveAllData(source);
        _publish('timeLogEntriesChanged', [..._time_log_entries]);
    },
    setDevEpics: async (newEpicsArray, source = 'setDevEpics') => {
        _dev_epics = JSON.parse(JSON.stringify(newEpicsArray));
        await _saveAllData(source);
        _publish('devEpicsChanged', [..._dev_epics]);
    },
    setDevTickets: async (newTicketsArray, source = 'setDevTickets') => {
        _dev_tickets = JSON.parse(JSON.stringify(newTicketsArray));
        await _saveAllData(source);
        _publish('devTicketsChanged', [..._dev_tickets]);
    },
    setDevReleaseVersions: async (newVersionsArray, source = 'setDevReleaseVersions') => { // NEW
        _dev_release_versions = JSON.parse(JSON.stringify(newVersionsArray));
        await _saveAllData(source);
        _publish('devReleaseVersionsChanged', [..._dev_release_versions]);
    },
    setDevTicketHistory: async (newHistoryArray, source = 'setDevTicketHistory') => { // NEW
        _dev_ticket_history = JSON.parse(JSON.stringify(newHistoryArray));
        await _saveAllData(source);
        _publish('devTicketHistoryChanged', [..._dev_ticket_history]);
    },
    setDevTicketComments: async (newCommentsArray, source = 'setDevTicketComments') => { // NEW
        _dev_ticket_comments = JSON.parse(JSON.stringify(newCommentsArray));
        await _saveAllData(source);
        _publish('devTicketCommentsChanged', [..._dev_ticket_comments]);
    },


    deleteTimeActivity: async (activityId, source = 'deleteTimeActivity') => {
        const initialActivityCount = _time_activities.length;
        _time_activities = _time_activities.filter(a => a.id !== activityId);
        if (_time_activities.length < initialActivityCount) {
            _time_log_entries = _time_log_entries.filter(log => log.activityId !== activityId);
            await _saveAllData(source);
            _publish('timeActivitiesChanged', [..._time_activities]);
            _publish('timeLogEntriesChanged', [..._time_log_entries]);
        }
    },

    initializeStore: async () => {
        const functionName = 'initializeStore (AppStore)';
        LoggingService.info('[AppStore] Initializing store from self-hosted backend...', { module: 'store', functionName });

        try {
            const response = await fetch(API_URL, {
                headers: API_HEADERS,
            });

            if (!response.ok) {
                const errorBody = await response.text();
                if (response.status === 401) {
                    EventBus.publish('displayUserMessage', { text: 'FATAL: Invalid API Key. The application cannot load data.', type: 'error' });
                    throw new Error('Invalid API Key');
                }
                throw new Error(`Server responded with ${response.status}: ${errorBody}`);
            }
            const data = await response.json();

            _tasks = data.tasks || [];
            _projects = data.projects || [];
            _userPreferences = data.userPreferences || {};
            _userProfile = data.userProfile || { displayName: 'User', email: null, role: 'admin' };
            _notebooks = data.notebooks || [];
            _notes = data.notes || [];
            _time_activities = data.time_activities || [];
            _time_log_entries = data.time_log_entries ? data.time_log_entries.map(entry => ({...entry, startTime: new Date(entry.startTime), endTime: new Date(entry.endTime)})) : [];
            _dev_epics = data.dev_epics || [];
            _dev_tickets = data.dev_tickets || [];
            _dev_release_versions = data.dev_release_versions || []; // NEW
            _dev_ticket_history = data.dev_ticket_history || []; // NEW
            _dev_ticket_comments = data.dev_ticket_comments || []; // NEW

            _updateUniqueLabelsInternal();
            _updateUniqueProjectsInternal();

            LoggingService.info("[AppStore] Store initialized with data from backend server.", { module: 'store', functionName });

            _publish('storeInitialized');
            _publish('tasksChanged', [..._tasks]);
            _publish('projectsChanged', [..._projects]);
            _publish('userProfileChanged', { ..._userProfile });
            _publish('userPreferencesChanged', { ..._userPreferences });
            _publish('notebooksChanged', [..._notebooks]);
            _publish('notesChanged', [..._notes]);
            _publish('timeActivitiesChanged', [..._time_activities]);
            _publish('timeLogEntriesChanged', [..._time_log_entries]);
            _publish('devEpicsChanged', [..._dev_epics]);
            _publish('devTicketsChanged', [..._dev_tickets]);
            _publish('devReleaseVersionsChanged', [..._dev_release_versions]); // NEW
            _publish('devTicketHistoryChanged', [..._dev_ticket_history]);   // NEW
            _publish('devTicketCommentsChanged', [..._dev_ticket_comments]);    // NEW

        } catch (error) {
            LoggingService.critical('[AppStore] Could not load data from backend server. The app may not function correctly.', error, { functionName });
            EventBus.publish('displayUserMessage', { text: 'Fatal: Cannot connect to server to load data. Please ensure the server is running and the API Key is correct.', type: 'error' });
        }
    }
};

export default AppStore;