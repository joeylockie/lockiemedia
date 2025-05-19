// store.js
// This file is responsible for managing the application's state
// and its persistence to localStorage. Feature flags are sourced from FeatureFlagService.
// It now publishes events when state changes.

// --- Application State Variables ---
var tasks = [];
var projects = [];
var currentFilter = 'inbox';
var currentSort = 'default';
var currentSearchTerm = '';
var editingTaskId = null;
var currentViewTaskId = null;
var uniqueLabels = [];
var uniqueProjects = [];
var tooltipTimeout = null;
var currentTaskViewMode = 'list';
var selectedTaskIdsForBulkAction = [];

var isPomodoroActive = false;
var currentPomodoroState = 'work';
var pomodoroTimeRemaining = 0;
var pomodoroCurrentTaskId = null;

var kanbanColumns = [
    { id: 'todo', title: 'To Do' },
    { id: 'inprogress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
];

var featureFlags = {}; // Populated by FeatureFlagService via setStoreFeatureFlags

// --- Data Persistence and Initialization Functions ---

// --- Task Data Functions ---
function saveTasks() {
    localStorage.setItem('todos_v3', JSON.stringify(tasks));
    updateUniqueLabels(); // This will publish 'labelsChanged'
    console.log('[Store] Tasks saved to localStorage.');
    if (window.EventBus) EventBus.publish('tasksChanged', tasks);
}

function initializeTasks() {
    const storedTasks = JSON.parse(localStorage.getItem('todos_v3')) || [];
    const defaultKanbanCol = kanbanColumns[0]?.id || 'todo';

    tasks = storedTasks.map(task => ({
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
        timerStartTime: task.timerStartTime || null,
        timerAccumulatedTime: task.timerAccumulatedTime || 0,
        timerIsRunning: task.timerIsRunning || false,
        timerIsPaused: task.timerIsPaused || false,
        actualDurationMs: task.actualDurationMs || 0,
        attachments: task.attachments || [],
        completedDate: task.completedDate || null,
        subTasks: task.subTasks || [],
        recurrenceRule: task.recurrenceRule || null,
        recurrenceEndDate: task.recurrenceEndDate || null,
        nextDueDate: task.nextDueDate || task.dueDate,
        sharedWith: task.sharedWith || [],
        owner: task.owner || null,
        lastSynced: task.lastSynced || null,
        syncVersion: task.syncVersion || 0,
        kanbanColumnId: task.kanbanColumnId || defaultKanbanCol,
        projectId: typeof task.projectId === 'number' ? task.projectId : 0,
        dependsOn: task.dependsOn || [],
        blocksTasks: task.blocksTasks || []
    }));
    updateUniqueLabels(); // This will publish 'labelsChanged'
    console.log('[Store] Tasks initialized/loaded.');
    // Event for tasks being initialized can be part of 'storeInitialized' or a specific 'tasksInitialized'
}

function updateUniqueLabels() {
    const labels = new Set();
    tasks.forEach(task => {
        if (task.label && task.label.trim() !== '') {
            labels.add(task.label.trim());
        }
    });
    const oldLabels = JSON.stringify(uniqueLabels);
    uniqueLabels = Array.from(labels).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    if (JSON.stringify(uniqueLabels) !== oldLabels) { // Publish only if changed
        console.log('[Store] Unique labels updated:', uniqueLabels);
        if (window.EventBus) EventBus.publish('labelsChanged', uniqueLabels);
    }
}

// --- Project Data Functions ---
function saveProjects() {
    localStorage.setItem('projects_v1', JSON.stringify(projects));
    updateUniqueProjects(); // This will publish 'uniqueProjectsChanged'
    console.log('[Store] Projects saved to localStorage.');
    if (window.EventBus) EventBus.publish('projectsChanged', projects);
}

function loadProjects() {
    const storedProjects = localStorage.getItem('projects_v1');
    let tempProjects = [];
    if (storedProjects) {
        try {
            const parsedProjects = JSON.parse(storedProjects);
            if (Array.isArray(parsedProjects) && parsedProjects.every(p => p && typeof p.id === 'number' && typeof p.name === 'string')) {
                tempProjects = parsedProjects;
            } else {
                console.warn("[Store] Stored projects data is invalid. Initializing with default.");
            }
        } catch (e) {
            console.error("[Store] Error parsing stored projects. Initializing with default.", e);
        }
    }

    const noProjectEntry = { id: 0, name: "No Project", creationDate: Date.now() - 100000 };
    let finalProjects = tempProjects.filter(p => p.id !== 0);
    finalProjects.unshift(noProjectEntry);

    projects = finalProjects;
    updateUniqueProjects(); // This will publish 'uniqueProjectsChanged'
    console.log('[Store] Projects loaded/initialized.');
}

function updateUniqueProjects() {
    const oldUniqueProjects = JSON.stringify(uniqueProjects);
    uniqueProjects = projects
        .filter(project => project.id !== 0)
        .map(project => ({ id: project.id, name: project.name }))
        .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    if (JSON.stringify(uniqueProjects) !== oldUniqueProjects) { // Publish only if changed
        console.log('[Store] Unique projects updated for UI:', uniqueProjects);
        if (window.EventBus) EventBus.publish('uniqueProjectsChanged', uniqueProjects);
    }
}

// --- Kanban Column Data Functions ---
function saveKanbanColumns() {
    localStorage.setItem('kanbanColumns_v1', JSON.stringify(kanbanColumns));
    console.log('[Store] Kanban columns saved to localStorage.');
    if (window.EventBus) EventBus.publish('kanbanColumnsChanged', kanbanColumns);
}

function loadKanbanColumns() {
    const storedColumns = localStorage.getItem('kanbanColumns_v1');
    const defaultColumns = [
        { id: 'todo', title: 'To Do' },
        { id: 'inprogress', title: 'In Progress' },
        { id: 'done', title: 'Done' }
    ];

    if (storedColumns) {
        try {
            const parsedColumns = JSON.parse(storedColumns);
            if (Array.isArray(parsedColumns) && parsedColumns.length === defaultColumns.length && parsedColumns.every(col => col && typeof col.id === 'string' && typeof col.title === 'string')) {
                const storedIds = parsedColumns.map(c => c.id);
                const defaultIds = defaultColumns.map(c => c.id);
                if (JSON.stringify(storedIds) === JSON.stringify(defaultIds)) {
                    kanbanColumns = parsedColumns.map(sc => ({
                        id: sc.id,
                        title: sc.title
                    }));
                } else {
                    console.warn("[Store] Stored Kanban column IDs don't match defaults. Resetting to defaults.");
                    kanbanColumns = defaultColumns;
                    saveKanbanColumns(); // Save the corrected default structure
                }
            } else {
                 console.warn("[Store] Stored Kanban columns are invalid or structure changed. Resetting to defaults.");
                 kanbanColumns = defaultColumns;
                 saveKanbanColumns();
            }
        } catch (e) {
            console.error("[Store] Error parsing stored Kanban columns. Resetting to defaults.", e);
            kanbanColumns = defaultColumns;
            saveKanbanColumns();
        }
    } else {
        console.log('[Store] No stored Kanban columns found. Using defaults and saving.');
        kanbanColumns = defaultColumns;
        saveKanbanColumns(); // This will also publish 'kanbanColumnsChanged'
    }
    console.log('[Store] Kanban columns loaded/initialized.');
}

/**
 * Public method for FeatureFlagService to set the flags after loading.
 * @param {Object} loadedFlags - The feature flags object from FeatureFlagService.
 */
function setStoreFeatureFlags(loadedFlags) {
    if (loadedFlags && typeof loadedFlags === 'object') {
        Object.assign(featureFlags, loadedFlags);
        window.featureFlags = featureFlags; // Ensure global access for now
        console.log('[Store] Feature flags updated in store from FeatureFlagService:', featureFlags);
        if (window.EventBus) EventBus.publish('featureFlagsInitialized', featureFlags); // Publish event
    } else {
        console.error('[Store] Invalid flags received from FeatureFlagService.');
    }
}

window.store = window.store || {};
window.store.setFeatureFlags = setStoreFeatureFlags;


// --- Initial Data Loading on Script Load ---
(async () => {
    // FeatureFlagService.loadFeatureFlags() is called by its own IIFE when featureFlagService.js loads.
    // It will then call store.setFeatureFlags, which publishes 'featureFlagsInitialized'.
    // So, we just need to ensure FeatureFlagService is loaded before this script.

    // Wait for flags to be potentially loaded and set by FeatureFlagService
    // A more robust way would be to subscribe to 'featureFlagsInitialized' if needed,
    // or have FeatureFlagService return a promise. For now, a small delay or direct call.
    if (window.FeatureFlagService && typeof window.FeatureFlagService.loadFeatureFlags === 'function' && !Object.keys(featureFlags).some(key => featureFlags[key])) {
        // If flags haven't been populated yet by an earlier call (e.g. from main.js), ensure they are.
        // This is a bit defensive; ideally, main.js orchestrates this.
        // await window.FeatureFlagService.loadFeatureFlags();
        // The above line is problematic if FeatureFlagService already ran its IIFE.
        // The current setup relies on FeatureFlagService's IIFE and its call to setStoreFeatureFlags.
    }

    loadKanbanColumns();  // Publishes 'kanbanColumnsChanged' if saved for the first time
    loadProjects();       // Publishes 'projectsChanged' and 'uniqueProjectsChanged'
    initializeTasks();    // Publishes 'labelsChanged' (and 'tasksChanged' if saveTasks was called, which it isn't here directly)
    
    console.log("[Store] Initial data (tasks, projects, columns) loading process completed.");
    if (window.EventBus) EventBus.publish('storeInitialized'); // Signal that initial store setup is done
})();
