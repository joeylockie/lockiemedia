// store.js
// Manages application data state internally and exposes an API (AppStore) for access and modification.
// Publishes events via EventBus when state changes.

import EventBus from './eventBus.js';
import LoggingService from './loggingService.js';
// NEW: Import Firebase service functions
import { saveUserDataToFirestore, loadUserDataFromFirestore } from './firebaseService.js';
// REMOVE all 'firebase/compat/...' imports if they were added at the top of this file previously

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

// Helper to get current user UID
function getCurrentUserUID() {
    // Access auth via the global firebase object provided by the compat script
    // Ensure firebase and firebase.auth() are available
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
        .filter(project => project.id !== 0) // Exclude "No Project"
        .map(project => ({ id: project.id, name: project.name }))
        .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    if (JSON.stringify(_uniqueProjects) !== oldUniqueProjectsJSON) {
        LoggingService.debug('[Store] Unique projects updated for UI.', { newUniqueProjects: _uniqueProjects, module: 'store', functionName: '_updateUniqueProjectsInternal' });
        _publish('uniqueProjectsChanged', [..._uniqueProjects]);
    }
}

// --- Internal Data Update and Persistence Functions ---
async function _saveAllData() {
    const functionName = '_saveAllData (Store)';
    LoggingService.debug(`[Store] Initiating save for all data. Tasks: ${_tasks.length}, Projects: ${_projects.length}`, { functionName });

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
            functionName
        });
    } catch (e) {
        LoggingService.error('[Store] Failed to save data to localStorage.', e, { module: 'store', functionName });
        if (typeof window.showMessage === 'function') {
            window.showMessage('Error: Could not save data locally. Changes might not persist offline.', 'error');
        }
    }

    const userId = getCurrentUserUID();
    if (userId) {
        LoggingService.debug(`[Store] User ${userId} is logged in. Attempting to save to Firestore.`, { functionName, userId });
        try {
            const dataToSave = {
                tasks: _tasks,
                projects: _projects,
                kanbanColumns: _kanbanColumns
                // lastUpdated will be set by firebaseService using serverTimestamp
            };
            // Ensure firebaseService.saveUserDataToFirestore is correctly imported and available
            if (typeof saveUserDataToFirestore === 'function') {
                 await saveUserDataToFirestore(userId, dataToSave);
                 LoggingService.info(`[Store] All data successfully saved to Firestore for user ${userId}.`, { functionName, userId });
            } else {
                LoggingService.error('[Store] saveUserDataToFirestore function is not available.', new Error('FunctionNotAvailable'), { functionName, userId });
            }
        } catch (error) {
            LoggingService.error(`[Store] Failed to save data to Firestore for user ${userId}.`, error, { functionName, userId });
            if (typeof window.showMessage === 'function') {
                window.showMessage('Error: Could not save data to cloud. Check your connection.', 'error');
            }
        }
    } else {
        LoggingService.debug('[Store] No user logged in, skipping Firestore save.', { functionName });
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

    setTasks: async (newTasksArray) => {
        _tasks = JSON.parse(JSON.stringify(newTasksArray));
        await _saveAllData();
        _publish('tasksChanged', [..._tasks]);
    },
    setProjects: async (newProjectsArray) => {
        const noProjectEntry = { id: 0, name: "No Project", creationDate: Date.now() - 100000 };
        const filteredProjects = newProjectsArray.filter(p => p.id !== 0);
        _projects = [noProjectEntry, ...JSON.parse(JSON.stringify(filteredProjects))];
        await _saveAllData();
        _publish('projectsChanged', [..._projects]);
    },
    setKanbanColumns: async (newColumnsArray) => {
        _kanbanColumns = JSON.parse(JSON.stringify(newColumnsArray));
        await _saveAllData();
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

    loadDataFromFirestore: async (userId) => {
        const functionName = 'loadDataFromFirestore (AppStore)';
        LoggingService.info(`[AppStore] Attempting to load data from Firestore for user ${userId}.`, { functionName, userId });
        try {
            // Ensure firebaseService.loadUserDataFromFirestore is correctly imported and available
            if (typeof loadUserDataFromFirestore !== 'function') {
                 LoggingService.error('[AppStore] loadUserDataFromFirestore function is not available.', new Error('FunctionNotAvailable'), { functionName, userId });
                 if (typeof window.showMessage === 'function') window.showMessage('Error: Data loading service unavailable.', 'error');
                 return; // Stop if the service function isn't there
            }

            const loadedData = await loadUserDataFromFirestore(userId);
            if (loadedData) {
                LoggingService.debug(`[AppStore] Data received from Firestore for user ${userId}.`, { functionName, userId, hasTasks: !!loadedData.tasks, hasProjects: !!loadedData.projects });

                _tasks = loadedData.tasks || [];

                const noProjectEntry = { id: 0, name: "No Project", creationDate: Date.now() - 100000 };
                const projectsFromFirestore = loadedData.projects || [];
                const filteredProjects = projectsFromFirestore.filter(p => p.id !== 0);
                _projects = [noProjectEntry, ...filteredProjects];

                _kanbanColumns = loadedData.kanbanColumns && loadedData.kanbanColumns.length > 0 ? loadedData.kanbanColumns : [
                    { id: 'todo', title: 'To Do' },
                    { id: 'inprogress', title: 'In Progress' },
                    { id: 'done', title: 'Done' }
                ];

                await _saveAllData(); 

                _publish('tasksChanged', [..._tasks]);
                _publish('projectsChanged', [..._projects]);
                _publish('kanbanColumnsChanged', [..._kanbanColumns]);
                _publish('storeDataLoadedFromFirebase'); 

                LoggingService.info(`[AppStore] Data successfully loaded from Firestore and applied for user ${userId}.`, { functionName, userId });
            } else {
                LoggingService.warn(`[AppStore] No data returned from Firestore for user ${userId}. Setting defaults and saving to establish cloud presence.`, { functionName, userId });
                _tasks = [];
                _projects = [{ id: 0, name: "No Project", creationDate: Date.now() - 100000 }];
                _kanbanColumns = [
                    { id: 'todo', title: 'To Do' },
                    { id: 'inprogress', title: 'In Progress' },
                    { id: 'done', title: 'Done' }
                ];
                await _saveAllData(); 

                _publish('tasksChanged', [..._tasks]);
                _publish('projectsChanged', [..._projects]);
                _publish('kanbanColumnsChanged', [..._kanbanColumns]);
                _publish('storeDataLoadedFromFirebase');
            }
        } catch (error) {
            LoggingService.error(`[AppStore] Error loading data from Firestore for user ${userId}.`, error, { functionName, userId });
            if (typeof window.showMessage === 'function') {
                window.showMessage('Error loading your data from the cloud. Using local data if available.', 'error');
            }
        }
    },

    clearLocalStoreAndReloadDefaults: async () => {
        const functionName = 'clearLocalStoreAndReloadDefaults (AppStore)';
        LoggingService.info(`[AppStore] Clearing local store and reloading default data.`, { functionName });

        _tasks = [];
        _projects = [{ id: 0, name: "No Project", creationDate: Date.now() - 100000 }];
        _kanbanColumns = [
            { id: 'todo', title: 'To Do' },
            { id: 'inprogress', title: 'In Progress' },
            { id: 'done', title: 'Done' }
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
        
        localStorage.setItem('todos_v3', JSON.stringify(_tasks));
        localStorage.setItem('projects_v1', JSON.stringify(_projects));
        localStorage.setItem('kanbanColumns_v1', JSON.stringify(_kanbanColumns));

        _publish('tasksChanged', [..._tasks]);
        _publish('projectsChanged', [..._projects]);
        _publish('kanbanColumnsChanged', [..._kanbanColumns]);
        _publish('storeDataCleared');

        LoggingService.info(`[AppStore] Local store cleared and defaults applied.`, { functionName });
    },


    initializeStore: async () => {
        const functionName = 'initializeStore (AppStore)';
        LoggingService.info('[AppStore] Initializing store from localStorage (default behavior)...', { module: 'store', functionName });

        const storedKanbanCols = localStorage.getItem('kanbanColumns_v1');
        const defaultKanbanCols = [
            { id: 'todo', title: 'To Do' },
            { id: 'inprogress', title: 'In Progress' },
            { id: 'done', title: 'Done' }
        ];
        if (storedKanbanCols) {
            try {
                const parsed = JSON.parse(storedKanbanCols);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(col => col.id && col.title)) {
                     _kanbanColumns = parsed;
                } else {
                    _kanbanColumns = defaultKanbanCols;
                    LoggingService.warn('[AppStore Init] Stored Kanban columns invalid. Using defaults.', {functionName});
                }
            } catch (e) {
                _kanbanColumns = defaultKanbanCols;
                LoggingService.error('[AppStore Init] Error parsing stored Kanban columns. Using defaults.', e, { item: 'kanbanColumns_v1' });
            }
        } else {
            _kanbanColumns = defaultKanbanCols;
        }

        const storedProjects = localStorage.getItem('projects_v1');
        let tempProjects = [];
        if (storedProjects) {
            try {
                const parsed = JSON.parse(storedProjects);
                if (Array.isArray(parsed)) {
                    tempProjects = parsed.filter(p => p && typeof p.id === 'number' && typeof p.name === 'string');
                }
            } catch (e) {
                LoggingService.error("[AppStore Init] Error parsing stored projects. Using empty array.", e, { item: 'projects_v1' });
            }
        }
        const noProjectEntry = { id: 0, name: "No Project", creationDate: Date.now() - 100000 };
        _projects = tempProjects.filter(p => p.id !== 0);
        _projects.unshift(noProjectEntry);


        let storedTasks = [];
        try {
            const tasksString = localStorage.getItem('todos_v3');
            if (tasksString) {
                storedTasks = JSON.parse(tasksString) || [];
            }
        } catch (e) {
            LoggingService.error('[AppStore Init] Error parsing stored tasks. Initializing with empty tasks array.', e, { item: 'todos_v3' });
            storedTasks = [];
        }

        const defaultKanbanColId = _kanbanColumns[0]?.id || 'todo';
        _tasks = storedTasks.map(task => ({
            id: task.id || Date.now() + Math.random(),
            text: task.text || '',
            completed: task.completed || false,
            creationDate: task.creationDate || task.id,
            dueDate: task.dueDate || null,
            time: task.time || null,
            priority: task.priority || 'medium',
            label: task.label || '',
            notes: task.notes || '',
            isReminderSet: task.isReminderSet || false,
            reminderDate: task.reminderDate || null,
            reminderTime: task.reminderTime || null,
            reminderEmail: task.reminderEmail || null,
            estimatedHours: task.estimatedHours || 0,
            estimatedMinutes: task.estimatedMinutes || 0,
            timerStartTime: null, timerAccumulatedTime: 0, timerIsRunning: false, timerIsPaused: false, actualDurationMs: 0,
            attachments: task.attachments || [],
            completedDate: task.completedDate || null, 
            subTasks: task.subTasks || [],
            recurrenceRule: null, recurrenceEndDate: null, nextDueDate: task.nextDueDate || task.dueDate,
            sharedWith: task.sharedWith || [], owner: null, lastSynced: null, syncVersion: 0,
            kanbanColumnId: task.kanbanColumnId || defaultKanbanColId,
            projectId: typeof task.projectId === 'number' ? task.projectId : 0,
            dependsOn: task.dependsOn || [],
            blocksTasks: task.blocksTasks || []
        }));

        _updateUniqueLabelsInternal();
        _updateUniqueProjectsInternal();
        
        LoggingService.info("[AppStore] Store initialized with persisted or default data from localStorage.", { module: 'store', functionName });
        _publish('storeInitialized');
    }
};

export default AppStore;

LoggingService.debug("store.js loaded as ES6 module, AppStore API created.", { module: 'store' });