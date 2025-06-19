// store.js
// Manages application data state internally and exposes an API (AppStore) for access and modification.
// Publishes events via EventBus when state changes.
// REFACTORED FOR SELF-HOSTED BACKEND (using SQLite)

import EventBus from './eventBus.js';
import LoggingService from './loggingService.js';

// The API URL is now the single source of truth for the backend endpoint.
const API_URL = '/api/data';

// --- Internal State Variables (scoped to this module) ---
let _tasks = [];
let _projects = [];
let _uniqueLabels = [];
let _uniqueProjects = [];
let _userPreferences = {};
let _userProfile = {};
// Removed _kanbanColumns as it's no longer a primary data entity managed here.

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
    
    // Assemble the complete data payload that the server expects.
    const dataToSave = {
        tasks: _tasks,
        projects: _projects,
        userPreferences: _userPreferences,
        userProfile: _userProfile
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
    // KanbanColumns are no longer managed here.
    getKanbanColumns: () => [], 
    getUniqueLabels: () => [..._uniqueLabels],
    getUniqueProjects: () => [..._uniqueProjects],
    getUserPreferences: () => JSON.parse(JSON.stringify(_userPreferences)),
    getUserProfile: () => JSON.parse(JSON.stringify(_userProfile)),

    // The 'set' methods now update local state and then trigger a save of the entire state.
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
    // setKanbanColumns is removed as it's no longer managed data.
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

    initializeStore: async () => {
        const functionName = 'initializeStore (AppStore)';
        LoggingService.info('[AppStore] Initializing store from self-hosted backend...', { module: 'store', functionName });

        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Server responded with ${response.status}: ${errorBody}`);
            }
            const data = await response.json();
            
            // The server now provides data in the correct format, so no frontend conversion is needed.
            _tasks = data.tasks || [];
            _projects = data.projects || [];
            _userPreferences = data.userPreferences || {};
            _userProfile = data.userProfile || { displayName: 'User', role: 'admin' };
            
            _updateUniqueLabelsInternal();
            _updateUniqueProjectsInternal();
            
            LoggingService.info("[AppStore] Store initialized with data from backend server.", { module: 'store', functionName });
            _publish('storeInitialized');
            _publish('tasksChanged', [..._tasks]);
            _publish('projectsChanged', [..._projects]);
            _publish('userProfileChanged', { ..._userProfile });
            _publish('userPreferencesChanged', { ..._userPreferences });

        } catch (error) {
            LoggingService.critical('[AppStore] Could not load data from backend server. The app may not function correctly.', error, { functionName });
            EventBus.publish('displayUserMessage', { text: 'Fatal: Cannot connect to server to load data. Please ensure the server is running.', type: 'error' });
        }
    }
};

export default AppStore;
