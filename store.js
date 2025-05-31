// store.js
// Manages application data state internally and exposes an API (AppStore) for access and modification.
// Publishes events via EventBus when state changes.

import EventBus from './eventBus.js';
import LoggingService from './loggingService.js';
// MODIFIED: Import streamUserDataFromFirestore and keep loadUserDataFromFirestore (for initial load if needed or fallback)
import { saveUserDataToFirestore, loadUserDataFromFirestore, streamUserDataFromFirestore } from './firebaseService.js'; // Added streamUserDataFromFirestore

// --- Internal State Variables (scoped to this module) ---
let _tasks = [];
let _projects = [];
let _uniqueLabels = [];
let _uniqueProjects = [];

let _kanbanColumns = [
    { id: 'todo', title: 'To Do' },
    { id: 'inprogress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
];
let _featureFlags = {};
let _firestoreUnsubscribe = null; // To store the unsubscribe function for the real-time listener
let _isDataLoadedFromFirebase = false; // Flag to track if initial data load/stream has occurred for current user

// Helper to get current user UID
function getCurrentUserUID() {
    if (typeof firebase !== 'undefined' && typeof firebase.auth === 'function') {
        const auth = firebase.auth();
        return auth.currentUser ? auth.currentUser.uid : null;
    }
    LoggingService.warn('[Store] firebase.auth() not available for getCurrentUserUID.');
    return null;
}

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

// --- Internal Data Update and Persistence Functions ---
async function _saveAllData(source = 'unknown') { // Added source for better logging
    const functionName = '_saveAllData (Store)';
    LoggingService.debug(`[Store] Initiating save for all data. Source: ${source}. Tasks: ${_tasks.length}, Projects: ${_projects.length}`, { functionName, source });

    _updateUniqueLabelsInternal();
    _updateUniqueProjectsInternal();

    try {
        localStorage.setItem('todos_v3', JSON.stringify(_tasks));
        localStorage.setItem('projects_v1', JSON.stringify(_projects));
        localStorage.setItem('kanbanColumns_v1', JSON.stringify(_kanbanColumns));
        LoggingService.info('[Store] All data saved to localStorage.', {
            taskCount: _tasks.length,
            projectCount: _projects.length,
            columnCount: _kanbanColumns.length,
            module: 'store',
            functionName,
            source
        });
    } catch (e) {
        LoggingService.error('[Store] Failed to save data to localStorage.', e, { module: 'store', functionName, source });
        if (EventBus && EventBus.publish) { // Use EventBus for user messages
            EventBus.publish('displayUserMessage', { text: 'Error: Could not save data locally. Changes might not persist offline.', type: 'error' });
        }
    }

    const userId = getCurrentUserUID();
    if (userId && _isDataLoadedFromFirebase) { // Only save to Firebase if user is logged in AND initial data load from Firebase has occurred
        LoggingService.debug(`[Store] User ${userId} is logged in and data is Firebase-synced. Attempting to save to Firestore. Source: ${source}`, { functionName, userId, source });
        try {
            const dataToSave = {
                tasks: _tasks,
                projects: _projects,
                kanbanColumns: _kanbanColumns
            };
            if (typeof saveUserDataToFirestore === 'function') {
                 await saveUserDataToFirestore(userId, dataToSave);
                 LoggingService.info(`[Store] All data successfully saved to Firestore for user ${userId}. Source: ${source}`, { functionName, userId, source });
            } else {
                LoggingService.error('[Store] saveUserDataToFirestore function is not available.', new Error('FunctionNotAvailable'), { functionName, userId, source });
            }
        } catch (error) {
            LoggingService.error(`[Store] Failed to save data to Firestore for user ${userId}. Source: ${source}`, error, { functionName, userId, source });
            if (EventBus && EventBus.publish) {
                EventBus.publish('displayUserMessage', { text: 'Error: Could not save data to cloud. Check your connection.', type: 'error' });
            }
        }
    } else {
        LoggingService.debug(`[Store] Skipping Firestore save. User ID: ${userId}, IsDataLoadedFromFirebase: ${_isDataLoadedFromFirebase}. Source: ${source}`, { functionName, source });
    }
}


// --- Public API for AppStore ---
const AppStore = {
    getTasks: () => JSON.parse(JSON.stringify(_tasks)),
    getProjects: () => JSON.parse(JSON.stringify(_projects)),
    getKanbanColumns: () => JSON.parse(JSON.stringify(_kanbanColumns)),
    getFeatureFlags: () => ({ ..._featureFlags }),
    getUniqueLabels: () => [..._uniqueLabels],
    getUniqueProjects: () => [..._uniqueProjects],

    setTasks: async (newTasksArray, source = 'setTasks') => { // Add source parameter
        _tasks = JSON.parse(JSON.stringify(newTasksArray));
        await _saveAllData(source); // Pass source
        _publish('tasksChanged', [..._tasks]);
    },
    setProjects: async (newProjectsArray, source = 'setProjects') => { // Add source parameter
        const noProjectEntry = { id: 0, name: "No Project", creationDate: Date.now() - 100000 };
        const filteredProjects = newProjectsArray.filter(p => p.id !== 0);
        _projects = [noProjectEntry, ...JSON.parse(JSON.stringify(filteredProjects))];
        await _saveAllData(source); // Pass source
        _publish('projectsChanged', [..._projects]);
    },
    setKanbanColumns: async (newColumnsArray, source = 'setKanbanColumns') => { // Add source parameter
        _kanbanColumns = JSON.parse(JSON.stringify(newColumnsArray));
        await _saveAllData(source); // Pass source
        _publish('kanbanColumnsChanged', [..._kanbanColumns]);
    },

    setFeatureFlags: (loadedFlags) => {
        if (loadedFlags && typeof loadedFlags === 'object') {
            _featureFlags = { ..._featureFlags, ...loadedFlags };
            LoggingService.info('[AppStore] Feature flags updated in store.', { flags: _featureFlags, module: 'store', functionName: 'setFeatureFlags' });
            _publish('featureFlagsInitialized', { ..._featureFlags });
        } else {
            LoggingService.error('[AppStore] Invalid flags received for setFeatureFlags.', new TypeError('Invalid flags type'), { receivedFlags: loadedFlags, module: 'store', functionName: 'setFeatureFlags' });
        }
    },

    // MODIFIED: To handle real-time updates from Firestore
    _handleFirestoreDataUpdate: (data, error) => {
        const functionName = '_handleFirestoreDataUpdate (AppStore)';
        if (error) {
            LoggingService.error('[AppStore] Error in Firestore data stream:', error, { functionName });
            if (EventBus && EventBus.publish) {
                EventBus.publish('displayUserMessage', { text: 'Connection to cloud data lost or error occurred.', type: 'error' });
            }
            // Optionally, you might want to stop trying to stream or implement a retry logic here.
            // For now, it just logs.
            return;
        }

        if (data) {
            LoggingService.info(`[AppStore] Data received from Firestore stream. Tasks: ${data.tasks?.length}, Projects: ${data.projects?.length}`, { functionName });

            // IMPORTANT: Avoid deep comparison if data is large.
            // A simple check if the stringified version changed can be a pragmatic approach.
            // This is to prevent unnecessary re-renders if Firestore listener sends an echo of a local write
            // that didn't actually change the state from what this client already has.
            const currentDataString = JSON.stringify({ tasks: _tasks, projects: _projects, kanbanColumns: _kanbanColumns });
            const newDataString = JSON.stringify({ tasks: data.tasks, projects: data.projects, kanbanColumns: data.kanbanColumns });

            if (currentDataString === newDataString && _isDataLoadedFromFirebase) {
                LoggingService.debug('[AppStore] Firestore stream update identical to current state. No changes applied.', { functionName });
                return;
            }

            _tasks = data.tasks || [];
            const noProjectEntry = { id: 0, name: "No Project", creationDate: Date.now() - 100000 };
            const projectsFromFirestore = data.projects || [];
            const filteredProjects = projectsFromFirestore.filter(p => p.id !== 0);
            _projects = [noProjectEntry, ...filteredProjects];
            _kanbanColumns = data.kanbanColumns && data.kanbanColumns.length > 0 ? data.kanbanColumns : [
                { id: 'todo', title: 'To Do' }, { id: 'inprogress', title: 'In Progress' }, { id: 'done', title: 'Done' }
            ];

            _isDataLoadedFromFirebase = true; // Mark that data has been loaded from Firebase

            // Save to localStorage to keep it in sync with the cloud truth
            try {
                localStorage.setItem('todos_v3', JSON.stringify(_tasks));
                localStorage.setItem('projects_v1', JSON.stringify(_projects));
                localStorage.setItem('kanbanColumns_v1', JSON.stringify(_kanbanColumns));
                LoggingService.info('[AppStore] Firestore stream data saved to localStorage.', { functionName });
            } catch (e) {
                LoggingService.error('[AppStore] Failed to save Firestore stream data to localStorage.', e, { functionName });
            }

            _updateUniqueLabelsInternal();
            _updateUniqueProjectsInternal();

            _publish('tasksChanged', [..._tasks]);
            _publish('projectsChanged', [..._projects]);
            _publish('kanbanColumnsChanged', [..._kanbanColumns]);
            _publish('storeDataUpdatedFromFirebase'); // New event for real-time updates
            LoggingService.info(`[AppStore] Local store updated from Firestore stream.`, { functionName });
        } else {
            LoggingService.warn(`[AppStore] Null data received from Firestore stream, potentially document deletion.`, { functionName });
             _isDataLoadedFromFirebase = true; // Still mark as "loaded" to handle "no data" state correctly
        }
    },

    startStreamingUserData: (userId) => {
        const functionName = 'startStreamingUserData (AppStore)';
        LoggingService.info(`[AppStore] Attempting to start streaming data from Firestore for user ${userId}.`, { functionName, userId });

        if (_firestoreUnsubscribe) {
            LoggingService.debug('[AppStore] Stopping previous Firestore listener before starting a new one.', { functionName });
            _firestoreUnsubscribe();
            _firestoreUnsubscribe = null;
        }
        _isDataLoadedFromFirebase = false; // Reset flag until data is actually received

        if (typeof streamUserDataFromFirestore === 'function') {
            _firestoreUnsubscribe = streamUserDataFromFirestore(userId, AppStore._handleFirestoreDataUpdate);
            if (_firestoreUnsubscribe) {
                LoggingService.info(`[AppStore] Firestore data streaming started for user ${userId}.`, { functionName, userId });
            } else {
                LoggingService.error(`[AppStore] Failed to start Firestore data streaming for user ${userId}. streamUserDataFromFirestore returned null.`, new Error('StreamingSetupFailed'), { functionName, userId });
            }
        } else {
            LoggingService.error('[AppStore] streamUserDataFromFirestore function is not available.', new Error('FunctionNotAvailable'), { functionName, userId });
            if (EventBus && EventBus.publish) {
                EventBus.publish('displayUserMessage', { text: 'Error: Real-time data sync service unavailable.', type: 'error' });
            }
        }
    },

    stopStreamingUserData: () => {
        const functionName = 'stopStreamingUserData (AppStore)';
        if (_firestoreUnsubscribe) {
            LoggingService.info('[AppStore] Stopping Firestore data streaming.', { functionName });
            _firestoreUnsubscribe();
            _firestoreUnsubscribe = null;
            _isDataLoadedFromFirebase = false; // Reset flag as we are no longer synced
        } else {
            LoggingService.debug('[AppStore] No active Firestore stream to stop.', { functionName });
        }
    },

    // Kept original loadDataFromFirestore in case a one-time load is needed,
    // but streaming should be the primary way for logged-in users.
    // This might be used for an initial load before stream confirmation or if streaming fails.
    loadDataFromFirestore: async (userId) => {
        const functionName = 'loadDataFromFirestore (AppStore - One Time)';
        LoggingService.info(`[AppStore] Attempting a ONE-TIME load from Firestore for user ${userId}. Consider using startStreamingUserData for real-time.`, { functionName, userId });
        try {
            if (typeof loadUserDataFromFirestore !== 'function') {
                 LoggingService.error('[AppStore] loadUserDataFromFirestore function is not available.', new Error('FunctionNotAvailable'), { functionName, userId });
                 if (EventBus && EventBus.publish) EventBus.publish('displayUserMessage', { text: 'Error: Data loading service unavailable.', type: 'error' });
                 return;
            }
            const loadedData = await loadUserDataFromFirestore(userId); // One-time load
            if (loadedData) {
                AppStore._handleFirestoreDataUpdate(loadedData, null); // Use the same handler
                LoggingService.info(`[AppStore] Data successfully loaded (once) and applied for user ${userId}.`, { functionName, userId });
            } else {
                 LoggingService.warn(`[AppStore] No data returned from one-time Firestore load for user ${userId}.`, { functionName, userId });
                 AppStore._handleFirestoreDataUpdate({ tasks: [], projects: [], kanbanColumns: [] }, null); // Handle as no data
            }
        } catch (error) {
            LoggingService.error(`[AppStore] Error in one-time load from Firestore for user ${userId}.`, error, { functionName, userId });
            if (EventBus && EventBus.publish) {
                EventBus.publish('displayUserMessage', { text: 'Error loading your data from the cloud (one-time). Using local data if available.', type: 'error' });
            }
        }
    },

    clearLocalStoreAndReloadDefaults: async () => {
        const functionName = 'clearLocalStoreAndReloadDefaults (AppStore)';
        LoggingService.info(`[AppStore] Clearing local store and reloading default data. Stopping any active stream.`, { functionName });

        AppStore.stopStreamingUserData(); // Stop streaming before clearing
        _isDataLoadedFromFirebase = false;

        _tasks = [];
        _projects = [{ id: 0, name: "No Project", creationDate: Date.now() - 100000 }];
        _kanbanColumns = [
            { id: 'todo', title: 'To Do' }, { id: 'inprogress', title: 'In Progress' }, { id: 'done', title: 'Done' }
        ];
        
        try {
            localStorage.removeItem('todos_v3');
            localStorage.removeItem('projects_v1');
            localStorage.removeItem('kanbanColumns_v1');
            LoggingService.info('[AppStore] localStorage items cleared.', { functionName });
        } catch (e) {
            LoggingService.error('[AppStore] Failed to clear items from localStorage.', e, { functionName });
        }

        _updateUniqueLabelsInternal();
        _updateUniqueProjectsInternal();
        
        // Save defaults to local storage, but DO NOT save to Firebase here.
        // If a user logs back in, their (potentially empty) cloud data will be loaded/streamed.
        // If they use the app logged out, these local defaults are used.
        localStorage.setItem('todos_v3', JSON.stringify(_tasks));
        localStorage.setItem('projects_v1', JSON.stringify(_projects));
        localStorage.setItem('kanbanColumns_v1', JSON.stringify(_kanbanColumns));

        _publish('tasksChanged', [..._tasks]);
        _publish('projectsChanged', [..._projects]);
        _publish('kanbanColumnsChanged', [..._kanbanColumns]);
        _publish('storeDataCleared');

        LoggingService.info(`[AppStore] Local store cleared and defaults applied. Firestore save was SKIPPED.`, { functionName });
    },


    initializeStore: async () => {
        const functionName = 'initializeStore (AppStore)';
        LoggingService.info('[AppStore] Initializing store from localStorage (default behavior)...', { module: 'store', functionName });
        _isDataLoadedFromFirebase = false; // Initially, no data from Firebase

        const storedKanbanCols = localStorage.getItem('kanbanColumns_v1');
        const defaultKanbanCols = [
            { id: 'todo', title: 'To Do' }, { id: 'inprogress', title: 'In Progress' }, { id: 'done', title: 'Done' }
        ];
        if (storedKanbanCols) {
            try {
                const parsed = JSON.parse(storedKanbanCols);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(col => col.id && col.title)) {
                     _kanbanColumns = parsed;
                } else { _kanbanColumns = defaultKanbanCols; LoggingService.warn('[AppStore Init] Stored Kanban columns invalid. Using defaults.', {functionName}); }
            } catch (e) { _kanbanColumns = defaultKanbanCols; LoggingService.error('[AppStore Init] Error parsing stored Kanban columns. Using defaults.', e, { item: 'kanbanColumns_v1' }); }
        } else { _kanbanColumns = defaultKanbanCols; }

        const storedProjects = localStorage.getItem('projects_v1');
        let tempProjects = [];
        if (storedProjects) {
            try {
                const parsed = JSON.parse(storedProjects);
                if (Array.isArray(parsed)) { tempProjects = parsed.filter(p => p && typeof p.id === 'number' && typeof p.name === 'string'); }
            } catch (e) { LoggingService.error("[AppStore Init] Error parsing stored projects. Using empty array.", e, { item: 'projects_v1' }); }
        }
        const noProjectEntry = { id: 0, name: "No Project", creationDate: Date.now() - 100000 };
        _projects = tempProjects.filter(p => p.id !== 0);
        _projects.unshift(noProjectEntry);

        let storedTasks = [];
        try {
            const tasksString = localStorage.getItem('todos_v3');
            if (tasksString) { storedTasks = JSON.parse(tasksString) || []; }
        } catch (e) { LoggingService.error('[AppStore Init] Error parsing stored tasks. Initializing with empty tasks array.', e, { item: 'todos_v3' }); storedTasks = []; }

        const defaultKanbanColId = _kanbanColumns[0]?.id || 'todo';
        _tasks = storedTasks.map(task => ({
            id: task.id || Date.now() + Math.random(), text: task.text || '', completed: task.completed || false, creationDate: task.creationDate || task.id,
            dueDate: task.dueDate || null, time: task.time || null, priority: task.priority || 'medium', label: task.label || '', notes: task.notes || '',
            isReminderSet: task.isReminderSet || false, reminderDate: task.reminderDate || null, reminderTime: task.reminderTime || null, reminderEmail: task.reminderEmail || null,
            estimatedHours: task.estimatedHours || 0, estimatedMinutes: task.estimatedMinutes || 0,
            timerStartTime: null, timerAccumulatedTime: 0, timerIsRunning: false, timerIsPaused: false, actualDurationMs: 0,
            attachments: task.attachments || [], completedDate: task.completedDate || null, subTasks: task.subTasks || [],
            recurrenceRule: null, recurrenceEndDate: null, nextDueDate: task.nextDueDate || task.dueDate,
            sharedWith: task.sharedWith || [], owner: null, lastSynced: null, syncVersion: 0,
            kanbanColumnId: task.kanbanColumnId || defaultKanbanColId, projectId: typeof task.projectId === 'number' ? task.projectId : 0,
            dependsOn: task.dependsOn || [], blocksTasks: task.blocksTasks || []
        }));

        _updateUniqueLabelsInternal();
        _updateUniqueProjectsInternal();
        
        LoggingService.info("[AppStore] Store initialized with persisted or default data from localStorage.", { module: 'store', functionName });
        _publish('storeInitialized'); // Indicates local store is ready
        // Real-time sync for logged-in users will be started by feature_user_accounts.js
    }
};

export default AppStore;

LoggingService.debug("store.js loaded as ES6 module, AppStore API created.", { module: 'store' });