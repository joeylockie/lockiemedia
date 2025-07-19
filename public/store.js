import EventBus from './eventBus.js';
import LoggingService from './loggingService.js';

// The API URL for the gateway. Now points to the UNSECURE HTTP endpoint.
const API_URL = 'http://192.168.2.201:3000/api/data';

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
let _dev_subtasks = []; // --- NEW: Add state for subtasks ---
let _dev_release_versions = [];
let _dev_ticket_history = [];
let _dev_ticket_comments = [];
let _calendar_events = [];
let _habits = [];
let _habit_completions = [];
let _pomodoro_sessions = [];


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

// NOTE: This function uses a "full sync" approach which is being replaced for the Dev Tracker
// by more specific API calls (e.g., updateTicket, createSubtask). It is kept for other modules.
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
        // Subtasks are not saved here as they have their own endpoints
        dev_release_versions: _dev_release_versions,
        dev_ticket_history: _dev_ticket_history,
        dev_ticket_comments: _dev_ticket_comments,
        calendar_events: _calendar_events,
        habits: _habits,
        habit_completions: _habit_completions,
        pomodoro_sessions: _pomodoro_sessions,
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
    getDevSubtasks: () => JSON.parse(JSON.stringify(_dev_subtasks)), // --- NEW: Getter for subtasks ---
    getDevReleaseVersions: () => JSON.parse(JSON.stringify(_dev_release_versions)),
    getDevTicketHistory: () => JSON.parse(JSON.stringify(_dev_ticket_history)),
    getDevTicketComments: () => JSON.parse(JSON.stringify(_dev_ticket_comments)),
    getCalendarEvents: () => JSON.parse(JSON.stringify(_calendar_events)),
    getHabits: () => JSON.parse(JSON.stringify(_habits)),
    getHabitCompletions: () => JSON.parse(JSON.stringify(_habit_completions)),
    getPomodoroSessions: () => JSON.parse(JSON.stringify(_pomodoro_sessions)),

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
        // No longer saving all data on every change for dev tracker
        _publish('devEpicsChanged', [..._dev_epics]);
    },
    setDevTickets: async (newTicketsArray, source = 'setDevTickets') => {
        _dev_tickets = JSON.parse(JSON.stringify(newTicketsArray));
        // No longer saving all data on every change for dev tracker
        _publish('devTicketsChanged', [..._dev_tickets]);
    },
    // --- NEW: Setter for subtasks ---
    setDevSubtasks: (newSubtasksArray, source = 'setDevSubtasks') => {
        _dev_subtasks = JSON.parse(JSON.stringify(newSubtasksArray));
        // This does not trigger a save, as subtasks are handled by their own API calls.
        _publish('devSubtasksChanged', [..._dev_subtasks]);
    },
    setDevReleaseVersions: async (newVersionsArray, source = 'setDevReleaseVersions') => {
        _dev_release_versions = JSON.parse(JSON.stringify(newVersionsArray));
        // No longer saving all data on every change for dev tracker
        _publish('devReleaseVersionsChanged', [..._dev_release_versions]);
    },
    setDevTicketHistory: (newHistoryArray, source = 'setDevTicketHistory') => {
        _dev_ticket_history = JSON.parse(JSON.stringify(newHistoryArray));
        _publish('devTicketHistoryChanged', [..._dev_ticket_history]);
    },
    setDevTicketComments: (newCommentsArray, source = 'setDevTicketComments') => {
        _dev_ticket_comments = JSON.parse(JSON.stringify(newCommentsArray));
        _publish('devTicketCommentsChanged', [..._dev_ticket_comments]);
    },
    setCalendarEvents: async (newEventsArray, source = 'setCalendarEvents') => {
        _calendar_events = JSON.parse(JSON.stringify(newEventsArray));
        await _saveAllData(source);
        _publish('calendarEventsChanged', [..._calendar_events]);
    },
    setHabits: async (newHabitsArray, source = 'setHabits') => {
        _habits = JSON.parse(JSON.stringify(newHabitsArray));
        await _saveAllData(source);
        _publish('habitsChanged', [..._habits]);
    },
    setHabitCompletions: async (newCompletionsArray, source = 'setHabitCompletions') => {
        _habit_completions = JSON.parse(JSON.stringify(newCompletionsArray));
        await _saveAllData(source);
        _publish('habitCompletionsChanged', [..._habit_completions]);
    },
    setPomodoroSessions: async (newSessionsArray, source = 'setPomodoroSessions') => {
        _pomodoro_sessions = JSON.parse(JSON.stringify(newSessionsArray));
        await _saveAllData(source);
        _publish('pomodoroSessionsChanged', [..._pomodoro_sessions]);
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
            _dev_subtasks = data.dev_subtasks || []; // --- NEW: Handle subtasks from fetched data ---
            _dev_release_versions = data.dev_release_versions || [];
            _dev_ticket_history = data.dev_ticket_history || [];
            _dev_ticket_comments = data.dev_ticket_comments || [];
            _calendar_events = data.calendar_events || [];
            _habits = data.habits || [];
            _habit_completions = data.habit_completions || [];
            _pomodoro_sessions = data.pomodoro_sessions || [];

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
            _publish('devSubtasksChanged', [..._dev_subtasks]); // --- NEW: Publish subtask data loaded event ---
            _publish('devReleaseVersionsChanged', [..._dev_release_versions]);
            _publish('devTicketHistoryChanged', [..._dev_ticket_history]);
            _publish('devTicketCommentsChanged', [..._dev_ticket_comments]);
            _publish('calendarEventsChanged', [..._calendar_events]);
            _publish('habitsChanged', [..._habits]);
            _publish('habitCompletionsChanged', [..._habit_completions]);
            _publish('pomodoroSessionsChanged', [..._pomodoro_sessions]);

        } catch (error) {
            LoggingService.critical('[AppStore] Could not load data from backend server. The app may not function correctly.', error, { functionName });
            EventBus.publish('displayUserMessage', { text: 'Fatal: Cannot connect to server to load data. Please ensure the server is running and the API Key is correct.', type: 'error' });
        }
    }
};

export default AppStore;