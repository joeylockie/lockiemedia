// store.js
// This file is responsible for managing the application's state
// and its persistence to localStorage.

// --- Application State Variables ---
// These are defined in the global scope for now to maintain compatibility
// with other files that expect them. This will be refactored later.
var tasks = [];
var projects = []; // For projects
var currentFilter = 'inbox';
var currentSort = 'default';
var currentSearchTerm = '';
var editingTaskId = null;
var currentViewTaskId = null;
var uniqueLabels = [];
var uniqueProjects = []; // For project names in dropdowns etc.
var tooltipTimeout = null; // This might be better in a UI state manager later
var currentTaskViewMode = 'list'; // 'list', 'kanban', 'calendar', or 'pomodoro'
var selectedTaskIdsForBulkAction = [];

// Pomodoro Timer State (These might move to a dedicated Pomodoro service/store later)
var isPomodoroActive = false;
var currentPomodoroState = 'work'; // 'work', 'shortBreak', 'longBreak'
var pomodoroTimeRemaining = 0; // in seconds
var pomodoroCurrentTaskId = null; // Task ID associated with the current Pomodoro session

var kanbanColumns = [
    { id: 'todo', title: 'To Do' },
    { id: 'inprogress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
];

// Default feature flags, will be overridden by features.json and then by localStorage
var featureFlags = {
    testButtonFeature: false,
    reminderFeature: false,
    taskTimerSystem: false,
    advancedRecurrence: false,
    fileAttachments: false,
    integrationsServices: false,
    userAccounts: false,
    collaborationSharing: false,
    crossDeviceSync: false,
    tooltipsGuide: false,
    subTasksFeature: false,
    kanbanBoardFeature: false,
    projectFeature: false,
    exportDataFeature: false,
    calendarViewFeature: false,
    taskDependenciesFeature: false,
    smarterSearchFeature: false,
    bulkActionsFeature: false,
    pomodoroTimerHybridFeature: false
};

// --- Data Persistence and Initialization Functions ---

// --- Feature Flag Management ---
async function loadFeatureFlags() {
    console.log('[Flags - Store] Initial default flags:', JSON.parse(JSON.stringify(featureFlags)));
    try {
        const response = await fetch('features.json?cachebust=' + new Date().getTime());
        if (!response.ok) {
            console.warn('[Flags - Store] Failed to load features.json, using default flags. Status:', response.status);
        } else {
            const fetchedFlagsFromFile = await response.json();
            console.log('[Flags - Store] Flags loaded from features.json:', fetchedFlagsFromFile);
            // Merge, giving precedence to fetchedFlagsFromFile over defaults
            featureFlags = { ...featureFlags, ...fetchedFlagsFromFile };
            console.log('[Flags - Store] Flags after merging features.json:', JSON.parse(JSON.stringify(featureFlags)));
        }
    } catch (error) {
        console.error('[Flags - Store] Error loading or parsing features.json:', error);
    }

    const userFlagsString = localStorage.getItem('userFeatureFlags');
    if (userFlagsString) {
        try {
            const userFlagsFromStorage = JSON.parse(userFlagsString);
            console.log('[Flags - Store] User flags found in localStorage:', userFlagsFromStorage);
            // Merge, giving precedence to userFlagsFromStorage over current featureFlags
            featureFlags = { ...featureFlags, ...userFlagsFromStorage };
            console.log('[Flags - Store] Flags after merging localStorage:', JSON.parse(JSON.stringify(featureFlags)));
        } catch (e) {
            console.error('[Flags - Store] Error parsing userFeatureFlags from localStorage:', e);
        }
    } else {
        console.log('[Flags - Store] No userFeatureFlags found in localStorage.');
    }

    // Ensure all known flags are boolean
    const allKnownFlagKeys = Object.keys(window.featureFlags); // Use initial keys as reference
    allKnownFlagKeys.forEach(key => {
        if (typeof featureFlags[key] !== 'boolean') {
            console.warn(`[Flags - Store] Flag "${key}" was not a boolean after loading. Defaulting to false.`);
            featureFlags[key] = false; // Default to false if type is incorrect
        }
    });

    console.log('[Flags - Store] Final feature flags loaded:', JSON.parse(JSON.stringify(featureFlags)));
}


// --- Task Data Functions ---
function saveTasks() {
    localStorage.setItem('todos_v3', JSON.stringify(tasks));
    updateUniqueLabels(); // This function should now be part of store.js
    console.log('[Store] Tasks saved to localStorage.');
}

function initializeTasks() {
    const storedTasks = JSON.parse(localStorage.getItem('todos_v3')) || [];
    const defaultKanbanCol = kanbanColumns[0]?.id || 'todo'; // Use loaded kanbanColumns

    tasks = storedTasks.map(task => ({
        id: task.id || Date.now() + Math.random(), // Ensure unique ID
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
        projectId: typeof task.projectId === 'number' ? task.projectId : 0, // Default to 0 ("No Project")
        dependsOn: task.dependsOn || [],
        blocksTasks: task.blocksTasks || []
    }));
    updateUniqueLabels(); // Initialize uniqueLabels based on loaded tasks
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
    updateUniqueProjects(); // This function should now be part of store.js
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

    // Ensure "No Project" (id: 0) exists and is first
    const noProjectEntry = { id: 0, name: "No Project", creationDate: Date.now() - 100000 }; // Ensure it's older
    let finalProjects = tempProjects.filter(p => p.id !== 0); // Remove any existing "No Project"
    finalProjects.unshift(noProjectEntry); // Add our controlled "No Project" at the beginning

    projects = finalProjects;
    updateUniqueProjects();
    console.log('[Store] Projects loaded/initialized:', projects);
}

function updateUniqueProjects() {
    uniqueProjects = projects
        .filter(project => project.id !== 0) // Exclude "No Project" from the filterable list
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
    const defaultColumns = [ // Define default structure here for clarity
        { id: 'todo', title: 'To Do' },
        { id: 'inprogress', title: 'In Progress' },
        { id: 'done', title: 'Done' }
    ];

    if (storedColumns) {
        try {
            const parsedColumns = JSON.parse(storedColumns);
            if (Array.isArray(parsedColumns) && parsedColumns.length === defaultColumns.length && parsedColumns.every(col => col && typeof col.id === 'string' && typeof col.title === 'string')) {
                // Basic validation passed, check if IDs match defaults to preserve order/structure
                const storedIds = parsedColumns.map(c => c.id);
                const defaultIds = defaultColumns.map(c => c.id);
                if (JSON.stringify(storedIds) === JSON.stringify(defaultIds)) {
                    kanbanColumns = parsedColumns.map(sc => ({
                        id: sc.id,
                        title: sc.title // Use stored title
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
        saveKanbanColumns();
    }
    console.log('[Store] Kanban columns loaded/initialized:', kanbanColumns);
}


// --- Initial Data Loading on Script Load ---
// Order is important: flags, then columns/projects (as tasks might depend on them), then tasks.
(async () => {
    await loadFeatureFlags(); // Load feature flags first
    loadKanbanColumns();  // Load Kanban columns structure
    loadProjects();       // Load projects
    initializeTasks();    // Load tasks (depends on projects and kanban columns for defaults)
    console.log("[Store] Initial data loaded.");
})();

// Later, these state variables and functions will be encapsulated further,
// and access will be through dedicated getter/setter methods or a more formal state management pattern.
