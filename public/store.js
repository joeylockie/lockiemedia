import EventBus from './eventBus.js';
import LoggingService from './loggingService.js';

// --- Centralized LocalStorage Key ---
const LOCAL_STORAGE_KEY = 'lockieMediaUserData';

// --- Internal State Variables ---
// These will hold the application's data in memory.
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
let _calendar_events = [];
let _habits = [];
let _habit_completions = [];
// Pomodoro sessions have been removed.

// --- Private Helper Functions ---

/**
 * Publishes an event to the EventBus.
 * @param {string} eventName - The name of the event.
 * @param {*} data - The data to send with the event.
 */
function _publish(eventName, data) {
    if (EventBus && typeof EventBus.publish === 'function') {
        EventBus.publish(eventName, data);
    } else {
        LoggingService.warn(`[Store] EventBus not available to publish event: ${eventName}`, { module: 'store', functionName: '_publish' });
    }
}

/**
 * Updates the derived list of unique labels from the tasks list.
 */
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

/**
 * Updates the derived list of unique projects from the projects list.
 */
function _updateUniqueProjectsInternal() {
    const oldUniqueProjectsJSON = JSON.stringify(_uniqueProjects);
    _uniqueProjects = _projects
        .filter(project => project.id !== 0) // Exclude "No Project"
        .map(project => ({ id: project.id, name: project.name }))
        .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

    if (JSON.stringify(_uniqueProjects) !== oldUniqueProjectsJSON) {
        LoggingService.debug('[Store] Unique projects updated for UI.', { newUniqueProjects: _uniqueProjects, module: 'store', functionName: '_updateUniqueProjectsInternal' });
        _publish('uniqueProjectsChanged', [..._uniqueProjects]);
    }
}

/**
 * Saves the entire application state to the browser's localStorage.
 * This is the new "backend".
 * @param {string} source - The function that triggered the save.
 */
function _saveAllData(source = 'unknown') {
    const functionName = '_saveAllData (Store)';
    LoggingService.debug(`[Store] Saving all data to localStorage. Source: ${source}.`, { functionName, source });

    // Ensure derived data is up-to-date before saving
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
        calendar_events: _calendar_events,
        habits: _habits,
        habit_completions: _habit_completions,
        // No pomodoro_sessions
    };

    try {
        // localStorage can only store strings, so we serialize the object to JSON.
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
        LoggingService.info(`[Store] Data successfully saved to localStorage.`, { functionName });
    } catch (error) {
        LoggingService.error('[Store] Failed to save data to localStorage.', error, { functionName, source });
        _publish('displayUserMessage', { text: 'Error: Could not save data to browser storage.', type: 'error' });
    }
}

// --- Public Store API ---
const AppStore = {
    // --- GETTERS ---
    // Getters return a deep copy to prevent direct modification of the store's state.
    getTasks: () => JSON.parse(JSON.stringify(_tasks)),
    getProjects: () => JSON.parse(JSON.stringify(_projects)),
    getKanbanColumns: () => [], // This seems unused but left for compatibility
    getUniqueLabels: () => [..._uniqueLabels],
    getUniqueProjects: () => [..._uniqueProjects],
    getUserPreferences: () => JSON.parse(JSON.stringify(_userPreferences)),
    getUserProfile: () => JSON.parse(JSON.stringify(_userProfile)),
    getNotebooks: () => JSON.parse(JSON.stringify(_notebooks)),
    getNotes: () => JSON.parse(JSON.stringify(_notes)),
    getTimeActivities: () => JSON.parse(JSON.stringify(_time_activities)),
    getTimeLogEntries: () => JSON.parse(JSON.stringify(_time_log_entries)),
    getCalendarEvents: () => JSON.parse(JSON.stringify(_calendar_events)),
    getHabits: () => JSON.parse(JSON.stringify(_habits)),
    getHabitCompletions: () => JSON.parse(JSON.stringify(_habit_completions)),

    // --- SETTERS ---
    // Setters update the state, save everything to localStorage, and publish changes.
    setTasks: (newTasksArray, source = 'setTasks') => {
        _tasks = JSON.parse(JSON.stringify(newTasksArray));
        _saveAllData(source);
        _publish('tasksChanged', [..._tasks]);
    },
    setProjects: (newProjectsArray, source = 'setProjects') => {
        const noProjectEntry = { id: 0, name: "No Project" };
        const filteredProjects = newProjectsArray.filter(p => p.id !== 0);
        _projects = [noProjectEntry, ...JSON.parse(JSON.stringify(filteredProjects))];
        _saveAllData(source);
        _publish('projectsChanged', [..._projects]);
    },
    setUserPreferences: (newPreferences, source = 'setUserPreferences') => {
        _userPreferences = { ..._userPreferences, ...JSON.parse(JSON.stringify(newPreferences)) };
        _saveAllData(source);
        _publish('userPreferencesChanged', { ..._userPreferences });
    },
    setUserProfile: (newProfile, source = 'setUserProfile') => {
       _userProfile = { ..._userProfile, ...JSON.parse(JSON.stringify(newProfile)) };
       _saveAllData(source);
       _publish('userProfileChanged', { ..._userProfile });
    },
    setNotebooks: (newNotebooksArray, source = 'setNotebooks') => {
        _notebooks = JSON.parse(JSON.stringify(newNotebooksArray));
        _saveAllData(source);
        _publish('notebooksChanged', [..._notebooks]);
    },
    setNotes: (newNotesArray, source = 'setNotes') => {
        _notes = JSON.parse(JSON.stringify(newNotesArray));
        _saveAllData(source);
        _publish('notesChanged', [..._notes]);
    },
    setTimeActivities: (newActivitiesArray, source = 'setTimeActivities') => {
        _time_activities = JSON.parse(JSON.stringify(newActivitiesArray));
        _saveAllData(source);
        _publish('timeActivitiesChanged', [..._time_activities]);
    },
    setTimeLogEntries: (newLogEntriesArray, source = 'setTimeLogEntries') => {
        _time_log_entries = JSON.parse(JSON.stringify(newLogEntriesArray));
        _saveAllData(source);
        _publish('timeLogEntriesChanged', [..._time_log_entries]);
    },
    setCalendarEvents: (newEventsArray, source = 'setCalendarEvents') => {
        _calendar_events = JSON.parse(JSON.stringify(newEventsArray));
        _saveAllData(source);
        _publish('calendarEventsChanged', [..._calendar_events]);
    },
    setHabits: (newHabitsArray, source = 'setHabits') => {
        _habits = JSON.parse(JSON.stringify(newHabitsArray));
        _saveAllData(source);
        _publish('habitsChanged', [..._habits]);
    },
    setHabitCompletions: (newCompletionsArray, source = 'setHabitCompletions') => {
        _habit_completions = JSON.parse(JSON.stringify(newCompletionsArray));
        _saveAllData(source);
        _publish('habitCompletionsChanged', [..._habit_completions]);
    },
    // Pomodoro setter removed.

    /**
     * Deletes a time activity and its associated log entries.
     */
    deleteTimeActivity: (activityId, source = 'deleteTimeActivity') => {
        const initialActivityCount = _time_activities.length;
        _time_activities = _time_activities.filter(a => a.id !== activityId);
        if (_time_activities.length < initialActivityCount) {
            // Also remove associated time log entries
            _time_log_entries = _time_log_entries.filter(log => log.activityId !== activityId);
            _saveAllData(source); // Save changes
            _publish('timeActivitiesChanged', [..._time_activities]);
            _publish('timeLogEntriesChanged', [..._time_log_entries]);
        }
    },

    /**
     * Initializes the store by loading data from localStorage.
     * If no data is found, it sets up a default empty state.
     */
    initializeStore: () => {
        const functionName = 'initializeStore (AppStore)';
        LoggingService.info('[AppStore] Initializing store from localStorage...', { module: 'store', functionName });

        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);

        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                // Assign data from localStorage to our in-memory variables
                _tasks = data.tasks || [];
                _projects = data.projects || [];
                _userPreferences = data.userPreferences || {};
                _userProfile = data.userProfile || { displayName: 'User', email: null, role: 'admin' };
                _notebooks = data.notebooks || [];
                _notes = data.notes || [];
                _time_activities = data.time_activities || [];
                // Ensure dates are converted back to Date objects
                _time_log_entries = data.time_log_entries ? data.time_log_entries.map(entry => ({...entry, startTime: new Date(entry.startTime), endTime: new Date(entry.endTime)})) : [];
                _calendar_events = data.calendar_events || [];
                _habits = data.habits || [];
                _habit_completions = data.habit_completions || [];
                // No pomodoro sessions to load

                LoggingService.info("[AppStore] Store initialized with data from localStorage.", { module: 'store', functionName });
            } catch (error) {
                LoggingService.critical('[AppStore] Could not parse data from localStorage. Data might be corrupt.', error, { functionName });
                _publish('displayUserMessage', { text: 'Fatal: Could not load data. It may be corrupt. Check browser console.', type: 'error' });
                // If data is corrupt, we could clear it or leave it for manual inspection.
                // For now, we will proceed with an empty state.
            }
        } else {
            LoggingService.info("[AppStore] No data found in localStorage. Initializing with default empty state.", { module: 'store', functionName });
            // Set default empty values if no saved data exists
            _userProfile = { displayName: 'User', email: null, role: 'admin' };
            _projects = [{ id: 0, name: "No Project" }];
        }

        // Update derived data and publish initial state to all components
        _updateUniqueLabelsInternal();
        _updateUniqueProjectsInternal();

        _publish('storeInitialized');
        _publish('tasksChanged', [..._tasks]);
        _publish('projectsChanged', [..._projects]);
        _publish('userProfileChanged', { ..._userProfile });
        _publish('userPreferencesChanged', { ..._userPreferences });
        _publish('notebooksChanged', [..._notebooks]);
        _publish('notesChanged', [..._notes]);
        _publish('timeActivitiesChanged', [..._time_activities]);
        _publish('timeLogEntriesChanged', [..._time_log_entries]);
        _publish('calendarEventsChanged', [..._calendar_events]);
        _publish('habitsChanged', [..._habits]);
        _publish('habitCompletionsChanged', [..._habit_completions]);
    }
};

export default AppStore;