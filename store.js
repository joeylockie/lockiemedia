// store.js
// Manages application data state internally and exposes an API (AppStore) for access and modification.
// Publishes events via EventBus when state changes.
// UI presentation state is managed by ViewManager.
// Bulk action state is managed by BulkActionService.
// Pomodoro state is managed by PomodoroTimerHybrid feature module.
// Modal-specific task IDs (editing, viewing) are managed by ModalStateService.
// Tooltip timeout is managed by TooltipService.

import EventBus from './eventBus.js'; // Import EventBus

// --- Internal State Variables (scoped to this module) ---
let _tasks = [];
let _projects = [];
let _uniqueLabels = [];
let _uniqueProjects = [];
// _tooltipTimeout moved to TooltipService.js

let _kanbanColumns = [
    { id: 'todo', title: 'To Do' },
    { id: 'inprogress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
];
let _featureFlags = {}; // Populated by FeatureFlagService via AppStore.setFeatureFlags

// --- Private Helper Functions ---
function _publish(eventName, data) {
    if (EventBus && typeof EventBus.publish === 'function') { // Use imported EventBus
        EventBus.publish(eventName, data);
    } else {
        console.warn(`[Store] EventBus not available to publish event: ${eventName}`);
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
        console.log('[Store] Unique labels updated:', _uniqueLabels);
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
        console.log('[Store] Unique projects updated for UI:', _uniqueProjects);
        _publish('uniqueProjectsChanged', [..._uniqueProjects]);
    }
}

function _saveTasksInternal() {
    localStorage.setItem('todos_v3', JSON.stringify(_tasks));
    _updateUniqueLabelsInternal();
    console.log('[Store] Tasks saved to localStorage.');
    _publish('tasksChanged', [..._tasks]); 
}

function _saveProjectsInternal() {
    localStorage.setItem('projects_v1', JSON.stringify(_projects));
    _updateUniqueProjectsInternal();
    console.log('[Store] Projects saved to localStorage.');
    _publish('projectsChanged', [..._projects]); 
}

function _saveKanbanColumnsInternal() {
    localStorage.setItem('kanbanColumns_v1', JSON.stringify(_kanbanColumns));
    console.log('[Store] Kanban columns saved to localStorage.');
    _publish('kanbanColumnsChanged', [..._kanbanColumns]);
}

// --- Public API for AppStore ---
const AppStore = {
    // --- Getters for Data State ---
    getTasks: () => JSON.parse(JSON.stringify(_tasks)),
    getProjects: () => JSON.parse(JSON.stringify(_projects)),
    getKanbanColumns: () => JSON.parse(JSON.stringify(_kanbanColumns)),
    getFeatureFlags: () => ({ ..._featureFlags }), // Still needed by some modules directly for now
    getUniqueLabels: () => [..._uniqueLabels],
    getUniqueProjects: () => [..._uniqueProjects],
    
    // --- Actions / Mutators for Data State ---
    setTasks: (newTasksArray) => { 
        _tasks = JSON.parse(JSON.stringify(newTasksArray)); 
        _saveTasksInternal(); 
    },
    setProjects: (newProjectsArray) => { 
        _projects = JSON.parse(JSON.stringify(newProjectsArray)); 
        _saveProjectsInternal(); 
    },
    setKanbanColumns: (newColumnsArray) => { 
        _kanbanColumns = JSON.parse(JSON.stringify(newColumnsArray)); 
        _saveKanbanColumnsInternal(); 
    },
    
    // Called by FeatureFlagService
    setFeatureFlags: (loadedFlags) => { 
        if (loadedFlags && typeof loadedFlags === 'object') {
            _featureFlags = { ..._featureFlags, ...loadedFlags };
            // window.featureFlags = _featureFlags; // Keep global for transition if absolutely needed by non-module scripts
            console.log('[AppStore] Feature flags updated in store:', _featureFlags);
            _publish('featureFlagsInitialized', { ..._featureFlags });
        } else {
            console.error('[AppStore] Invalid flags received.');
        }
    },

    initializeStore: async () => {
        // FeatureFlagService.loadFeatureFlags() is called by main.js before this.
        // It then calls AppStore.setFeatureFlags.

        const storedKanbanCols = localStorage.getItem('kanbanColumns_v1');
        const defaultKanbanCols = [ { id: 'todo', title: 'To Do' }, { id: 'inprogress', title: 'In Progress' }, { id: 'done', title: 'Done' }];
        if (storedKanbanCols) { try { const parsed = JSON.parse(storedKanbanCols); if(Array.isArray(parsed) && parsed.length === 3 && parsed.every(col => col.id && col.title)) _kanbanColumns = parsed; else _kanbanColumns = defaultKanbanCols;} catch(e){ _kanbanColumns = defaultKanbanCols;} } else { _kanbanColumns = defaultKanbanCols; }
        _saveKanbanColumnsInternal(); 

        const storedProjects = localStorage.getItem('projects_v1');
        let tempProjects = [];
        if (storedProjects) { try { const parsed = JSON.parse(storedProjects); if (Array.isArray(parsed)) tempProjects = parsed.filter(p => p && typeof p.id === 'number' && typeof p.name === 'string'); } catch (e) { console.error("[Store Init] Error parsing stored projects.", e);}}
        const noProjectEntry = { id: 0, name: "No Project", creationDate: Date.now() - 100000 };
        _projects = [noProjectEntry, ...tempProjects.filter(p => p.id !== 0)];
        _saveProjectsInternal(); 

        const storedTasks = JSON.parse(localStorage.getItem('todos_v3')) || [];
        const defaultKanbanColId = _kanbanColumns[0]?.id || 'todo';
        _tasks = storedTasks.map(task => ({
            id: task.id || Date.now() + Math.random(), text: task.text || '', completed: task.completed || false, creationDate: task.creationDate || task.id, dueDate: task.dueDate || null, time: task.time || null, priority: task.priority || 'medium', label: task.label || '', notes: task.notes || '', isReminderSet: task.isReminderSet || false, reminderDate: task.reminderDate || null, reminderTime: task.reminderTime || null, reminderEmail: task.reminderEmail || null, estimatedHours: task.estimatedHours || 0, estimatedMinutes: task.estimatedMinutes || 0, timerStartTime: null, timerAccumulatedTime: 0, timerIsRunning: false, timerIsPaused: false, actualDurationMs: 0, attachments: task.attachments || [], completedDate: null, subTasks: task.subTasks || [], recurrenceRule: null, recurrenceEndDate: null, nextDueDate: task.nextDueDate || task.dueDate, sharedWith: task.sharedWith || [], owner: null, lastSynced: null, syncVersion: 0, kanbanColumnId: task.kanbanColumnId || defaultKanbanColId, projectId: typeof task.projectId === 'number' ? task.projectId : 0, dependsOn: task.dependsOn || [], blocksTasks: task.blocksTasks || []
        }));
        _saveTasksInternal(); 
        
        console.log("[AppStore] Store initialized with persisted or default data.");
        _publish('storeInitialized');
    }
};

export default AppStore; // Export the AppStore object

console.log("store.js loaded as ES6 module, AppStore API created.");
