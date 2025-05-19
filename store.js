// store.js
// This file is responsible for managing the application's state
// and its persistence to localStorage. Feature flags are sourced from FeatureFlagService.

// --- Application State Variables ---
// These are defined in the global scope for now to maintain compatibility
// with other files that expect them. This will be refactored later.
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

// featureFlags will be populated from FeatureFlagService after it loads.
// We still declare it here so other files that expect `window.featureFlags` don't break immediately.
// Its true source will be FeatureFlagService.
var featureFlags = {};


// --- Data Persistence and Initialization Functions ---

// --- Task Data Functions ---
function saveTasks() {
    localStorage.setItem('todos_v3', JSON.stringify(tasks));
    updateUniqueLabels();
    console.log('[Store] Tasks saved to localStorage.');
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
    updateUniqueLabels();
    console.log('[Store] Tasks initialized/loaded.');
}

function updateUniqueLabels() {
    const labels = new Set();
    tasks.forEach(task => {
        if (task.label && task.label.trim() !== '') {
            labels.add(task.label.trim());
        }
    });
    uniqueLabels = Array.from(labels).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    console.log('[Store] Unique labels updated:', uniqueLabels);
}

// --- Project Data Functions ---
function saveProjects() {
    localStorage.setItem('projects_v1', JSON.stringify(projects));
    updateUniqueProjects();
    console.log('[Store] Projects saved to localStorage.');
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
    updateUniqueProjects();
    console.log('[Store] Projects loaded/initialized:', projects);
}

function updateUniqueProjects() {
    uniqueProjects = projects
        .filter(project => project.id !== 0)
        .map(project => ({ id: project.id, name: project.name }))
        .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    console.log('[Store] Unique projects updated for UI:', uniqueProjects);
}

// --- Kanban Column Data Functions ---
function saveKanbanColumns() {
    localStorage.setItem('kanbanColumns_v1', JSON.stringify(kanbanColumns));
    console.log('[Store] Kanban columns saved to localStorage.');
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
                    saveKanbanColumns();
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
        saveKanbanColumns();
    }
    console.log('[Store] Kanban columns loaded/initialized:', kanbanColumns);
}

/**
 * Public method for FeatureFlagService to set the flags after loading.
 * @param {Object} loadedFlags - The feature flags object from FeatureFlagService.
 */
function setStoreFeatureFlags(loadedFlags) {
    if (loadedFlags && typeof loadedFlags === 'object') {
        Object.assign(featureFlags, loadedFlags); // Update the store's copy
        // Ensure the global window.featureFlags is also updated for any legacy access
        window.featureFlags = featureFlags;
        console.log('[Store] Feature flags updated in store from FeatureFlagService:', featureFlags);
    } else {
        console.error('[Store] Invalid flags received from FeatureFlagService.');
    }
}

// Expose setStoreFeatureFlags to be callable by FeatureFlagService
// This is a bit of a workaround for direct script loading order.
// Ideally, FeatureFlagService would be a dependency injected or imported.
window.store = window.store || {};
window.store.setFeatureFlags = setStoreFeatureFlags;


// --- Initial Data Loading on Script Load ---
// Order is important:
// 1. FeatureFlagService.loadFeatureFlags() must complete first.
// 2. Then other data (columns, projects, tasks).
(async () => {
    // Ensure FeatureFlagService and its loadFeatureFlags method are available
    if (window.FeatureFlagService && typeof window.FeatureFlagService.loadFeatureFlags === 'function') {
        await window.FeatureFlagService.loadFeatureFlags();
        // After flags are loaded by the service, it calls store.setFeatureFlags (if available)
        // which updates the featureFlags variable in this store.
        // So, featureFlags should be populated by now.
    } else {
        console.error("[Store] FeatureFlagService.loadFeatureFlags is not available. Flags may not be loaded correctly.");
        // Fallback or error handling if FeatureFlagService didn't load
    }

    loadKanbanColumns();
    loadProjects();
    initializeTasks();
    console.log("[Store] Initial data (tasks, projects, columns) loaded after flags.");
})();
