import EventBus from './eventBus.js';
import LoggingService from './loggingService.js';
import db from './database.js'; // Import our new database connection

// --- Internal State Variables ---
// These act as a fast, in-memory cache of the database content.
let _tasks = [];
let _projects = [];
let _userPreferences = {};
let _userProfile = {};
let _time_activities = [];
let _time_log_entries = [];
let _calendar_events = [];
let _habits = [];
let _habit_completions = [];
let _uniqueLabels = [];

// --- Private Helper Functions ---

function _publish(eventName, data) {
    if (EventBus && typeof EventBus.publish === 'function') {
        EventBus.publish(eventName, data);
    }
}

function _updateUniqueLabels() {
    const labels = new Set();
    _tasks.forEach(task => {
        if (task.label && task.label.trim() !== '') {
            labels.add(task.label.trim());
        }
    });
    _uniqueLabels = Array.from(labels).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    _publish('labelsChanged', [..._uniqueLabels]);
}


async function _migrateFromLocalStorage() {
    const functionName = '_migrateFromLocalStorage (Store)';
    const oldStorageKey = 'lockieMediaUserData';
    const migrationFlag = 'lockieMediaMigrationV1Complete';

    if (localStorage.getItem(migrationFlag)) {
        return; // Migration already done
    }

    const savedData = localStorage.getItem(oldStorageKey);
    if (!savedData) {
        localStorage.setItem(migrationFlag, 'true');
        return; // Nothing to migrate
    }

    try {
        LoggingService.info('[Store] Starting data migration from localStorage to IndexedDB...', { functionName });
        const data = JSON.parse(savedData);

        await db.transaction('rw', db.tables, async () => {
            if (data.tasks) await db.tasks.bulkAdd(data.tasks);
            if (data.projects) await db.projects.bulkAdd(data.projects);
            if (data.time_activities) await db.time_activities.bulkAdd(data.time_activities);
            if (data.time_log_entries) await db.time_log_entries.bulkAdd(data.time_log_entries);
            if (data.calendar_events) await db.calendar_events.bulkAdd(data.calendar_events);
            if (data.habits) await db.habits.bulkAdd(data.habits);
            if (data.habit_completions) await db.habit_completions.bulkAdd(data.habit_completions);
            if (data.userProfile) await db.app_state.put({ key: 'userProfile', value: data.userProfile });
            if (data.userPreferences) await db.app_state.put({ key: 'userPreferences', value: data.userPreferences });
        });

        LoggingService.info('[Store] Data migration successful!', { functionName });
        localStorage.setItem(migrationFlag, 'true');
        localStorage.removeItem(oldStorageKey);

    } catch (error) {
        LoggingService.critical('[Store] Data migration FAILED.', error, { functionName });
    }
}

const AppStore = {
    // --- GETTERS ---
    getTasks: () => [..._tasks],
    getProjects: () => [..._projects],
    getUniqueLabels: () => [..._uniqueLabels],
    getUserPreferences: () => ({ ..._userPreferences }),
    getUserProfile: () => ({ ..._userProfile }),
    getTimeActivities: () => [..._time_activities],
    getTimeLogEntries: () => [..._time_log_entries],
    getCalendarEvents: () => [..._calendar_events],
    getHabits: () => [..._habits],
    getHabitCompletions: () => [..._habit_completions],

    // --- SETTERS ---
    setTasks: async (newTasksArray) => {
        _tasks = newTasksArray;
        _updateUniqueLabels(); // Update labels whenever tasks change
        _publish('tasksChanged', [..._tasks]);
    },
    setProjects: async (newProjectsArray) => {
        _projects = newProjectsArray;
        _publish('projectsChanged', [..._projects]);
    },
    setUserPreferences: async (newPreferences) => {
        await db.app_state.put({ key: 'userPreferences', value: newPreferences });
        _userPreferences = newPreferences;
        _publish('userPreferencesChanged', { ..._userPreferences });
    },
    setUserProfile: async (newProfile) => {
       await db.app_state.put({ key: 'userProfile', value: newProfile });
       _userProfile = newProfile;
       _publish('userProfileChanged', { ..._userProfile });
    },
    setTimeActivities: async (newActivitiesArray) => {
        _time_activities = newActivitiesArray;
        _publish('timeActivitiesChanged', [..._time_activities]);
    },
    setTimeLogEntries: async (newLogEntriesArray) => {
        _time_log_entries = newLogEntriesArray;
        _publish('timeLogEntriesChanged', [..._time_log_entries]);
    },
    setCalendarEvents: async (newEventsArray) => {
        _calendar_events = newEventsArray;
        _publish('calendarEventsChanged', [..._calendar_events]);
    },
    setHabits: async (newHabitsArray) => {
        _habits = newHabitsArray;
        _publish('habitsChanged', [..._habits]);
    },
    setHabitCompletions: async (newCompletionsArray) => {
        _habit_completions = newCompletionsArray;
        _publish('habitCompletionsChanged', [..._habit_completions]);
    },

    deleteTimeActivity: async (activityId) => {
        await db.transaction('rw', db.time_activities, db.time_log_entries, async () => {
            await db.time_activities.delete(activityId);
            await db.time_log_entries.where('activityId').equals(activityId).delete();
        });
        // Refresh cache and publish changes
        _time_activities = await db.time_activities.toArray();
        _time_log_entries = await db.time_log_entries.toArray();
        _publish('timeActivitiesChanged', [..._time_activities]);
        _publish('timeLogEntriesChanged', [..._time_log_entries]);
    },

    initializeStore: async () => {
        const functionName = 'initializeStore (AppStore)';
        LoggingService.info('[AppStore] Initializing store from IndexedDB...', { functionName });

        try {
            await _migrateFromLocalStorage();

            const [tasks, projects, timeActivities, timeLogs, calendarEvents, habits, habitCompletions, userProfile, userPreferences] = await Promise.all([
                db.tasks.toArray(),
                db.projects.toArray(),
                db.time_activities.toArray(),
                db.time_log_entries.toArray(),
                db.calendar_events.toArray(),
                db.habits.toArray(),
                db.habit_completions.toArray(),
                db.app_state.get('userProfile'),
                db.app_state.get('userPreferences')
            ]);

            _tasks = tasks;
            _updateUniqueLabels(); // Initial update of labels
            _projects = projects;
            _time_activities = timeActivities;
            _time_log_entries = timeLogs;
            _calendar_events = calendarEvents;
            _habits = habits;
            _habit_completions = habitCompletions;
            _userProfile = userProfile ? userProfile.value : { displayName: 'User' };
            _userPreferences = userPreferences ? userPreferences.value : {};

            LoggingService.info("[AppStore] Store initialized with data from IndexedDB.", { functionName });

            _publish('storeInitialized');
            _publish('tasksChanged', [..._tasks]);
            _publish('projectsChanged', [..._projects]);
            _publish('userProfileChanged', { ..._userProfile });
            _publish('userPreferencesChanged', { ..._userPreferences });
            _publish('timeActivitiesChanged', [..._time_activities]);
            _publish('timeLogEntriesChanged', [..._time_log_entries]);
            _publish('calendarEventsChanged', [..._calendar_events]);
            _publish('habitsChanged', [..._habits]);
            _publish('habitCompletionsChanged', [..._habit_completions]);

        } catch (error) {
            LoggingService.critical('[AppStore] Could not load data from IndexedDB.', error, { functionName });
            _publish('displayUserMessage', { text: 'Fatal: Cannot load application database. Check browser console.', type: 'error' });
        }
    }
};

export default AppStore;