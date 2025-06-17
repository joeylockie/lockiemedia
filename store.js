// store.js
// Manages application data state internally and exposes an API (AppStore) for access and modification.
// Publishes events via EventBus when state changes.

import EventBus from './eventBus.js';
import LoggingService from './loggingService.js';
import { saveUserDataToFirestore, loadUserDataFromFirestore, streamUserDataFromFirestore } from './firebaseService.js';

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
let _userPreferences = {};
let _userProfile = {}; // This will store { displayName: '...', role: '...' }

let _firestoreUnsubscribe = null;
let _isDataLoadedFromFirebase = false;

// --- LocalStorage Keys ---
const TASKS_KEY = 'todos_v3';
const PROJECTS_KEY = 'projects_v1';
const KANBAN_COLUMNS_KEY = 'kanbanColumns_v1';
const USER_PREFERENCES_KEY = 'userPreferences_v1';
const USER_PROFILE_KEY = 'userProfile_v1';

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

// Deep merge utility for preferences (simple version)
function _deepMerge(target, source) {
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!target[key] || typeof target[key] !== 'object') {
                target[key] = {};
            }
            _deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}


// --- Internal Data Update and Persistence Functions ---
async function _saveAllData(source = 'unknown') {
    const functionName = '_saveAllData (Store)';
    LoggingService.debug(`[Store] Initiating save for all data. Source: ${source}.`, { functionName, source });

    _updateUniqueLabelsInternal();
    _updateUniqueProjectsInternal();

    try {
        localStorage.setItem(TASKS_KEY, JSON.stringify(_tasks));
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(_projects));
        localStorage.setItem(KANBAN_COLUMNS_KEY, JSON.stringify(_kanbanColumns));
        localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(_userPreferences));
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(_userProfile));
        LoggingService.info('[Store] All data saved to localStorage.', {
            taskCount: _tasks.length,
            projectCount: _projects.length,
            columnCount: _kanbanColumns.length,
            preferencesKeys: Object.keys(_userPreferences).length,
            profileKeys: Object.keys(_userProfile).length,
            profileData: _userProfile,
            module: 'store',
            functionName,
            source
        });
    } catch (e) {
        LoggingService.error('[Store] Failed to save data to localStorage.', e, { module: 'store', functionName, source });
        if (EventBus && EventBus.publish) {
            EventBus.publish('displayUserMessage', { text: 'Error: Could not save data locally. Changes might not persist offline.', type: 'error' });
        }
    }

    const userId = getCurrentUserUID();
    if (userId && (_isDataLoadedFromFirebase || source === 'UserAccountsFeature.handleSignUp_defaultProfile')) {
        LoggingService.debug(`[Store] Conditions MET. Attempting to save to Firestore.`, { functionName, userId, source, isDataLoaded: _isDataLoadedFromFirebase });
        try {
            const dataToSave = {
                tasks: _tasks,
                projects: _projects,
                kanbanColumns: _kanbanColumns,
                preferences: _userPreferences,
                profile: _userProfile
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
        LoggingService.debug(`[Store] Conditions NOT MET. Skipping Firestore save. User ID: ${userId}, IsDataLoadedFromFirebase: ${_isDataLoadedFromFirebase}. Source: ${source}`, { functionName, source });
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
    getUserPreferences: () => JSON.parse(JSON.stringify(_userPreferences)),
    getUserProfile: () => JSON.parse(JSON.stringify(_userProfile)),
    // --- NEW FUNCTION TO CHECK DATA LOAD STATUS ---
    isDataLoaded: () => _isDataLoadedFromFirebase,

    setTasks: async (newTasksArray, source = 'setTasks') => {
        _tasks = JSON.parse(JSON.stringify(newTasksArray));
        await _saveAllData(source);
        _publish('tasksChanged', [..._tasks]);
    },
    setProjects: async (newProjectsArray, source = 'setProjects') => {
        const noProjectEntry = { id: 0, name: "No Project", creationDate: Date.now() - 100000 };
        const filteredProjects = newProjectsArray.filter(p => p.id !== 0);
        _projects = [noProjectEntry, ...JSON.parse(JSON.stringify(filteredProjects))];
        await _saveAllData(source);
        _publish('projectsChanged', [..._projects]);
    },
    setKanbanColumns: async (newColumnsArray, source = 'setKanbanColumns') => {
        _kanbanColumns = JSON.parse(JSON.stringify(newColumnsArray));
        await _saveAllData(source);
        _publish('kanbanColumnsChanged', [..._kanbanColumns]);
    },
    setUserPreferences: async (newPreferences, source = 'setUserPreferences') => {
        const functionName = 'setUserPreferences (AppStore)';
        LoggingService.debug(`[AppStore] Setting user preferences. Source: ${source}`, { functionName, newPreferences });
        _userPreferences = _deepMerge({ ..._userPreferences }, JSON.parse(JSON.stringify(newPreferences)));
        await _saveAllData(source);
        _publish('userPreferencesChanged', { ..._userPreferences });
    },
    setUserProfile: async (newProfile, source = 'setUserProfile') => {
        const functionName = 'setUserProfile (AppStore)';
        LoggingService.debug(`[AppStore] Setting user profile. Source: ${source}`, { functionName, newProfileData: newProfile });
        const currentRole = _userProfile.role;
        _userProfile = _deepMerge({ role: currentRole }, JSON.parse(JSON.stringify(newProfile)));
        if (newProfile.hasOwnProperty('role')) {
            _userProfile.role = newProfile.role;
        }
        await _saveAllData(source);
        _publish('userProfileChanged', { ..._userProfile });
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

    _handleFirestoreDataUpdate: (data, error) => {
        const functionName = '_handleFirestoreDataUpdate (AppStore)';
        if (error) {
            LoggingService.error('[AppStore] Error in Firestore data stream:', error, { functionName });
            if (EventBus && EventBus.publish) {
                EventBus.publish('displayUserMessage', { text: 'Connection to cloud data lost or error occurred.', type: 'error' });
            }
            return;
        }

        if (data) {
            LoggingService.info(`[AppStore] Data received from Firestore stream. Processing update.`, { functionName });

            _tasks = data.tasks || [];
            const noProjectEntry = { id: 0, name: "No Project", creationDate: Date.now() - 100000 };
            const projectsFromFirestore = data.projects || [];
            const filteredProjects = projectsFromFirestore.filter(p => p.id !== 0);
            _projects = [noProjectEntry, ...filteredProjects];
            _kanbanColumns = data.kanbanColumns && data.kanbanColumns.length > 0 ? data.kanbanColumns : [
                { id: 'todo', title: 'To Do' }, { id: 'inprogress', title: 'In Progress' }, { id: 'done', title: 'Done' }
            ];
            const incomingPreferences = data.preferences || {};
            _userPreferences = _deepMerge({ ..._userPreferences }, incomingPreferences);
            const incomingProfile = data.profile || { role: 'user' };
            if (!incomingProfile.role) {
                incomingProfile.role = 'user';
            }
            _userProfile = _deepMerge({ ..._userProfile }, incomingProfile);

            _isDataLoadedFromFirebase = true;

            try {
                localStorage.setItem(TASKS_KEY, JSON.stringify(_tasks));
                localStorage.setItem(PROJECTS_KEY, JSON.stringify(_projects));
                localStorage.setItem(KANBAN_COLUMNS_KEY, JSON.stringify(_kanbanColumns));
                localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(_userPreferences));
                localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(_userProfile));
                LoggingService.info('[AppStore] Firestore stream data saved to localStorage.', { functionName, savedProfile: _userProfile });
            } catch (e) {
                LoggingService.error('[AppStore] Failed to save Firestore stream data to localStorage.', e, { functionName });
            }

            _updateUniqueLabelsInternal();
            _updateUniqueProjectsInternal();

            _publish('tasksChanged', [..._tasks]);
            _publish('projectsChanged', [..._projects]);
            _publish('kanbanColumnsChanged', [..._kanbanColumns]);
            _publish('userPreferencesChanged', { ..._userPreferences });
            _publish('userProfileChanged', { ..._userProfile });
            _publish('storeDataUpdatedFromFirebase');
            LoggingService.info(`[AppStore] Local store updated and events published from Firestore stream.`, { functionName });
        } else {
            LoggingService.warn(`[AppStore] Null data received from Firestore stream, potentially document deletion. Ensuring default profile with role.`, { functionName });
             _isDataLoadedFromFirebase = true; 
             _userProfile = { role: 'user' };
             _tasks = [];
             _projects = [{ id: 0, name: "No Project", creationDate: Date.now() - 100000 }];
             _kanbanColumns = [
                { id: 'todo', title: 'To Do' }, { id: 'inprogress', title: 'In Progress' }, { id: 'done', title: 'Done' }
             ];
             _userPreferences = {};
             _publish('userProfileChanged', { ..._userProfile });
             _publish('tasksChanged', [..._tasks]);
             _publish('projectsChanged', [..._projects]);
             _publish('kanbanColumnsChanged', [..._kanbanColumns]);
             _publish('userPreferencesChanged', { ..._userPreferences });
             _publish('storeDataUpdatedFromFirebase'); 
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
        _isDataLoadedFromFirebase = false; 

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
            _isDataLoadedFromFirebase = false; 
        } else {
            LoggingService.debug('[AppStore] No active Firestore stream to stop.', { functionName });
        }
    },

    loadDataFromFirestore: async (userId) => {
        const functionName = 'loadDataFromFirestore (AppStore - One Time)';
        LoggingService.info(`[AppStore] Attempting a ONE-TIME load from Firestore for user ${userId}.`, { functionName, userId });
        try {
            if (typeof loadUserDataFromFirestore !== 'function') {
                 LoggingService.error('[AppStore] loadUserDataFromFirestore function is not available.', new Error('FunctionNotAvailable'), { functionName, userId });
                 if (EventBus && EventBus.publish) EventBus.publish('displayUserMessage', { text: 'Error: Data loading service unavailable.', type: 'error' });
                 return;
            }
            const loadedData = await loadUserDataFromFirestore(userId);
            if (loadedData) {
                AppStore._handleFirestoreDataUpdate(loadedData, null);
                LoggingService.info(`[AppStore] Data successfully loaded (once) and applied for user ${userId}.`, { functionName, userId, loadedProfile: loadedData.profile });
            } else {
                 LoggingService.warn(`[AppStore] No data returned from one-time Firestore load for user ${userId}. Applying default structure.`, { functionName, userId });
                 AppStore._handleFirestoreDataUpdate({ tasks: [], projects: [], kanbanColumns: [], preferences: {}, profile: { role: 'user' } }, null);
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

        AppStore.stopStreamingUserData(); 
        _isDataLoadedFromFirebase = false;

        _tasks = [];
        _projects = [{ id: 0, name: "No Project", creationDate: Date.now() - 100000 }];
        _kanbanColumns = [
            { id: 'todo', title: 'To Do' }, { id: 'inprogress', title: 'In Progress' }, { id: 'done', title: 'Done' }
        ];
        _userPreferences = {};
        _userProfile = { role: 'user' };
        _featureFlags = {}; 
        
        try {
            localStorage.removeItem(TASKS_KEY);
            localStorage.removeItem(PROJECTS_KEY);
            localStorage.removeItem(KANBAN_COLUMNS_KEY);
            localStorage.removeItem(USER_PREFERENCES_KEY);
            localStorage.removeItem(USER_PROFILE_KEY);
            localStorage.removeItem('userFeatureFlags'); 
            LoggingService.info('[AppStore] localStorage items cleared.', { functionName });
        } catch (e) {
            LoggingService.error('[AppStore] Failed to clear items from localStorage.', e, { functionName });
        }

        _updateUniqueLabelsInternal();
        _updateUniqueProjectsInternal();
        
        localStorage.setItem(TASKS_KEY, JSON.stringify(_tasks));
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(_projects));
        localStorage.setItem(KANBAN_COLUMNS_KEY, JSON.stringify(_kanbanColumns));
        localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(_userPreferences));
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(_userProfile));

        _publish('tasksChanged', [..._tasks]);
        _publish('projectsChanged', [..._projects]);
        _publish('kanbanColumnsChanged', [..._kanbanColumns]);
        _publish('userPreferencesChanged', { ..._userPreferences });
        _publish('userProfileChanged', { ..._userProfile });
        _publish('featureFlagsInitialized', { ..._featureFlags }); 
        _publish('storeDataCleared');

        LoggingService.info(`[AppStore] Local store cleared and defaults applied. Firestore save was SKIPPED.`, { functionName, defaultProfile: _userProfile });
    },

    initializeStore: async () => {
        const functionName = 'initializeStore (AppStore)';
        LoggingService.info('[AppStore] Initializing store from localStorage (default behavior)...', { module: 'store', functionName });

        const storedKanbanCols = localStorage.getItem(KANBAN_COLUMNS_KEY);
        const defaultKanbanCols = [
            { id: 'todo', title: 'To Do' }, { id: 'inprogress', title: 'In Progress' }, { id: 'done', title: 'Done' }
        ];
        if (storedKanbanCols) {
            try {
                const parsed = JSON.parse(storedKanbanCols);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(col => col.id && col.title)) {
                     _kanbanColumns = parsed;
                } else { _kanbanColumns = defaultKanbanCols; LoggingService.warn('[AppStore Init] Stored Kanban columns invalid. Using defaults.', {functionName}); }
            } catch (e) { _kanbanColumns = defaultKanbanCols; LoggingService.error('[AppStore Init] Error parsing stored Kanban columns. Using defaults.', e, { item: KANBAN_COLUMNS_KEY }); }
        } else { _kanbanColumns = defaultKanbanCols; }

        const storedProjects = localStorage.getItem(PROJECTS_KEY);
        let tempProjects = [];
        if (storedProjects) {
            try {
                const parsed = JSON.parse(storedProjects);
                if (Array.isArray(parsed)) { tempProjects = parsed.filter(p => p && typeof p.id === 'number' && typeof p.name === 'string'); }
            } catch (e) { LoggingService.error("[AppStore Init] Error parsing stored projects. Using empty array.", e, { item: PROJECTS_KEY }); }
        }
        const noProjectEntry = { id: 0, name: "No Project", creationDate: Date.now() - 100000 };
        _projects = tempProjects.filter(p => p.id !== 0);
        _projects.unshift(noProjectEntry);

        let storedTasks = [];
        try {
            const tasksString = localStorage.getItem(TASKS_KEY);
            if (tasksString) { storedTasks = JSON.parse(tasksString) || []; }
        } catch (e) { LoggingService.error('[AppStore Init] Error parsing stored tasks. Initializing with empty tasks array.', e, { item: TASKS_KEY }); storedTasks = []; }

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

        try {
            const prefsString = localStorage.getItem(USER_PREFERENCES_KEY);
            if (prefsString) {
                _userPreferences = JSON.parse(prefsString) || {};
            } else {
                _userPreferences = {};
            }
        } catch (e) {
            LoggingService.error('[AppStore Init] Error parsing user preferences from localStorage. Initializing with empty object.', e, { item: USER_PREFERENCES_KEY });
            _userPreferences = {};
        }

        try {
            const profileString = localStorage.getItem(USER_PROFILE_KEY);
            if (profileString) {
                _userProfile = JSON.parse(profileString) || { role: 'user' };
                if (!_userProfile.role) {
                    _userProfile.role = 'user';
                }
            } else {
                _userProfile = { role: 'user' };
            }
        } catch (e) {
            LoggingService.error('[AppStore Init] Error parsing user profile from localStorage. Initializing with default "user" role.', e, { item: USER_PROFILE_KEY });
            _userProfile = { role: 'user' };
        }
        
        _updateUniqueLabelsInternal();
        _updateUniqueProjectsInternal();
        
        LoggingService.info("[AppStore] Store initialized with persisted or default data from localStorage.", { module: 'store', functionName, initialProfile: _userProfile });
        _publish('storeInitialized'); 
    }
};

export default AppStore;