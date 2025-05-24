// store.js
// Manages application data state internally and exposes an API (AppStore) for access and modification.
// Publishes events via EventBus when state changes.
// UI presentation state is managed by ViewManager.
// Bulk action state is managed by BulkActionService.
// Pomodoro state is managed by PomodoroTimerHybrid feature module.
// Modal-specific task IDs (editing, viewing) are managed by ModalStateService.
// Tooltip timeout is managed by TooltipService.

import EventBus from './eventBus.js';
// NEW: Import LoggingService
import LoggingService from './loggingService.js';
// showMessage is currently a global function from ui_rendering.js.
// If store.js needs to directly trigger user-facing messages for its errors,
// it would typically do so via an event that ui_rendering.js listens to,
// or LoggingService could be enhanced to trigger such events for critical errors.
// For now, we'll focus on logging within store.js.

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
let _featureFlags = {}; // Populated by FeatureFlagService via AppStore.setFeatureFlags

// --- Private Helper Functions ---
function _publish(eventName, data) {
    if (EventBus && typeof EventBus.publish === 'function') { //
        EventBus.publish(eventName, data); //
    } else {
        // MODIFIED: Use LoggingService
        LoggingService.warn(`[Store] EventBus not available to publish event: ${eventName}`, { module: 'store', functionName: '_publish' });
    }
}

// --- Internal Data Update and Persistence Functions ---
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
        // MODIFIED: Use LoggingService
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
        // MODIFIED: Use LoggingService
        LoggingService.debug('[Store] Unique projects updated for UI.', { newUniqueProjects: _uniqueProjects, module: 'store', functionName: '_updateUniqueProjectsInternal' });
        _publish('uniqueProjectsChanged', [..._uniqueProjects]);
    }
}

function _saveTasksInternal() {
    try {
        localStorage.setItem('todos_v3', JSON.stringify(_tasks));
        _updateUniqueLabelsInternal();
        // MODIFIED: Use LoggingService
        LoggingService.info('[Store] Tasks saved to localStorage.', { taskCount: _tasks.length, module: 'store', functionName: '_saveTasksInternal' });
        _publish('tasksChanged', [..._tasks]);
    } catch (e) {
        // NEW: Use LoggingService for error and potentially inform user (indirectly, or directly if showMessage was imported)
        LoggingService.error('[Store] Failed to save tasks to localStorage.', e, { module: 'store', functionName: '_saveTasksInternal' });
        // Consider if a user-facing message is needed here. If localStorage is full, this is a critical issue for data persistence.
        // For now, ui_rendering.showMessage is not directly called here to keep store.js decoupled from direct UI calls.
        // An event could be published, or the global error handler might pick up severe issues.
        if (typeof window.showMessage === 'function') { // Check if global showMessage exists
            window.showMessage('Error: Could not save tasks. Your changes might not persist if you close the application.', 'error');
        }
    }
}

function _saveProjectsInternal() {
    try {
        localStorage.setItem('projects_v1', JSON.stringify(_projects));
        _updateUniqueProjectsInternal();
        // MODIFIED: Use LoggingService
        LoggingService.info('[Store] Projects saved to localStorage.', { projectCount: _projects.length, module: 'store', functionName: '_saveProjectsInternal' });
        _publish('projectsChanged', [..._projects]);
    } catch (e) {
        // NEW: Use LoggingService for error
        LoggingService.error('[Store] Failed to save projects to localStorage.', e, { module: 'store', functionName: '_saveProjectsInternal' });
        if (typeof window.showMessage === 'function') {
            window.showMessage('Error: Could not save project data.', 'error');
        }
    }
}

function _saveKanbanColumnsInternal() {
    try {
        localStorage.setItem('kanbanColumns_v1', JSON.stringify(_kanbanColumns));
        // MODIFIED: Use LoggingService
        LoggingService.info('[Store] Kanban columns saved to localStorage.', { columnCount: _kanbanColumns.length, module: 'store', functionName: '_saveKanbanColumnsInternal' });
        _publish('kanbanColumnsChanged', [..._kanbanColumns]);
    } catch (e) {
        // NEW: Use LoggingService for error
        LoggingService.error('[Store] Failed to save Kanban columns to localStorage.', e, { module: 'store', functionName: '_saveKanbanColumnsInternal' });
        if (typeof window.showMessage === 'function') {
            window.showMessage('Error: Could not save Kanban board settings.', 'error');
        }
    }
}

// --- Public API for AppStore ---
const AppStore = {
    // --- Getters for Data State ---
    getTasks: () => JSON.parse(JSON.stringify(_tasks)), //
    getProjects: () => JSON.parse(JSON.stringify(_projects)), //
    getKanbanColumns: () => JSON.parse(JSON.stringify(_kanbanColumns)), //
    getFeatureFlags: () => ({ ..._featureFlags }), //
    getUniqueLabels: () => [..._uniqueLabels], //
    getUniqueProjects: () => [..._uniqueProjects], //
    
    // --- Actions / Mutators for Data State ---
    setTasks: (newTasksArray) => {  //
        _tasks = JSON.parse(JSON.stringify(newTasksArray));  //
        _saveTasksInternal();  //
    },
    setProjects: (newProjectsArray) => {  //
        _projects = JSON.parse(JSON.stringify(newProjectsArray));  //
        _saveProjectsInternal();  //
    },
    setKanbanColumns: (newColumnsArray) => {  //
        _kanbanColumns = JSON.parse(JSON.stringify(newColumnsArray));  //
        _saveKanbanColumnsInternal();  //
    },
    
    setFeatureFlags: (loadedFlags) => {  //
        if (loadedFlags && typeof loadedFlags === 'object') { //
            _featureFlags = { ..._featureFlags, ...loadedFlags }; //
            // MODIFIED: Use LoggingService
            LoggingService.info('[AppStore] Feature flags updated in store.', { flags: _featureFlags, module: 'store', functionName: 'setFeatureFlags' });
            _publish('featureFlagsInitialized', { ..._featureFlags }); //
        } else {
            // MODIFIED: Use LoggingService
            LoggingService.error('[AppStore] Invalid flags received for setFeatureFlags.', new TypeError('Invalid flags type'), { receivedFlags: loadedFlags, module: 'store', functionName: 'setFeatureFlags' });
        }
    },

    initializeStore: async () => { //
        LoggingService.info('[AppStore] Initializing store...', { module: 'store', functionName: 'initializeStore' });
        const storedKanbanCols = localStorage.getItem('kanbanColumns_v1'); //
        const defaultKanbanCols = [ { id: 'todo', title: 'To Do' }, { id: 'inprogress', title: 'In Progress' }, { id: 'done', title: 'Done' }]; //
        if (storedKanbanCols) { //
            try { //
                const parsed = JSON.parse(storedKanbanCols); //
                if(Array.isArray(parsed) && parsed.length === 3 && parsed.every(col => col.id && col.title)) _kanbanColumns = parsed; else _kanbanColumns = defaultKanbanCols; //
            } catch(e){ //
                _kanbanColumns = defaultKanbanCols; //
                // NEW: Log parsing error
                LoggingService.error('[AppStore] Error parsing stored Kanban columns. Using defaults.', e, { module: 'store', functionName: 'initializeStore', item: 'kanbanColumns_v1' });
            }
        } else { _kanbanColumns = defaultKanbanCols; } //
        _saveKanbanColumnsInternal();  //

        const storedProjects = localStorage.getItem('projects_v1'); //
        let tempProjects = []; //
        if (storedProjects) { //
            try { //
                const parsed = JSON.parse(storedProjects); //
                if (Array.isArray(parsed)) tempProjects = parsed.filter(p => p && typeof p.id === 'number' && typeof p.name === 'string'); //
            } catch (e) { //
                // MODIFIED: Use LoggingService and provide context
                LoggingService.error("[AppStore Init] Error parsing stored projects. Using empty array.", e, { module: 'store', functionName: 'initializeStore', item: 'projects_v1' });
            }
        }
        const noProjectEntry = { id: 0, name: "No Project", creationDate: Date.now() - 100000 }; //
        _projects = [noProjectEntry, ...tempProjects.filter(p => p.id !== 0)]; //
        _saveProjectsInternal();  //

        let storedTasks = [];
        try {
            const tasksString = localStorage.getItem('todos_v3');
            if (tasksString) {
                storedTasks = JSON.parse(tasksString) || [];
            }
        } catch (e) {
            // NEW: Log parsing error
            LoggingService.error('[AppStore] Error parsing stored tasks. Initializing with empty tasks array.', e, { module: 'store', functionName: 'initializeStore', item: 'todos_v3' });
            storedTasks = []; // Ensure it's an empty array on error
        }

        const defaultKanbanColId = _kanbanColumns[0]?.id || 'todo'; //
        _tasks = storedTasks.map(task => ({ //
            id: task.id || Date.now() + Math.random(), text: task.text || '', completed: task.completed || false, creationDate: task.creationDate || task.id, dueDate: task.dueDate || null, time: task.time || null, priority: task.priority || 'medium', label: task.label || '', notes: task.notes || '', isReminderSet: task.isReminderSet || false, reminderDate: task.reminderDate || null, reminderTime: task.reminderTime || null, reminderEmail: task.reminderEmail || null, estimatedHours: task.estimatedHours || 0, estimatedMinutes: task.estimatedMinutes || 0, timerStartTime: null, timerAccumulatedTime: 0, timerIsRunning: false, timerIsPaused: false, actualDurationMs: 0, attachments: task.attachments || [], completedDate: null, subTasks: task.subTasks || [], recurrenceRule: null, recurrenceEndDate: null, nextDueDate: task.nextDueDate || task.dueDate, sharedWith: task.sharedWith || [], owner: null, lastSynced: null, syncVersion: 0, kanbanColumnId: task.kanbanColumnId || defaultKanbanColId, projectId: typeof task.projectId === 'number' ? task.projectId : 0, dependsOn: task.dependsOn || [], blocksTasks: task.blocksTasks || [] //
        })); //
        _saveTasksInternal();  //
        
        // MODIFIED: Use LoggingService
        LoggingService.info("[AppStore] Store initialized with persisted or default data.", { module: 'store', functionName: 'initializeStore' });
        _publish('storeInitialized'); //
    }
};

export default AppStore;

// MODIFIED: Use LoggingService
LoggingService.debug("store.js loaded as ES6 module, AppStore API created.", { module: 'store' });