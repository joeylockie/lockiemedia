// app_logic.js

// --- Application State ---
let tasks = JSON.parse(localStorage.getItem('todos_v3')) || [];
let projects = JSON.parse(localStorage.getItem('projects_v1')) || []; // For projects
let currentFilter = 'inbox';
let currentSort = 'default';
let currentSearchTerm = '';
let editingTaskId = null;
let currentViewTaskId = null;
let uniqueLabels = [];
let uniqueProjects = []; // For project names in dropdowns etc.
let tooltipTimeout = null;
let currentTaskViewMode = 'list'; // 'list', 'kanban', 'calendar', or 'pomodoro'
let selectedTaskIdsForBulkAction = []; // New: For Bulk Actions feature

// Pomodoro Timer State (Placeholders)
let isPomodoroActive = false;
let currentPomodoroState = 'work'; // 'work', 'shortBreak', 'longBreak'
let pomodoroTimeRemaining = 0; // in seconds
let pomodoroCurrentTaskId = null; // Task ID associated with the current Pomodoro session

// Default feature flags, will be overridden by features.json and then by localStorage
let featureFlags = {
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
    bulkActionsFeature: false, // New: Bulk Actions Feature flag
    pomodoroTimerHybridFeature: false // New: Pomodoro Timer Hybrid Feature flag
};

let kanbanColumns = [
    { id: 'todo', title: 'To Do' },
    { id: 'inprogress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
];

// --- Theme Management ---
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (localStorage.getItem('theme') !== (event.matches ? 'dark' : 'light')) {
        if (event.matches) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }
});

// --- Feature Flag Management ---
async function loadFeatureFlags() {
    console.log('[Flags] Initial default flags:', JSON.parse(JSON.stringify(featureFlags)));
    try {
        const response = await fetch('features.json?cachebust=' + new Date().getTime());
        if (!response.ok) {
            console.warn('[Flags] Failed to load features.json, using default flags. Status:', response.status);
        } else {
            const fetchedFlagsFromFile = await response.json();
            console.log('[Flags] Flags loaded from features.json:', fetchedFlagsFromFile);
            featureFlags = { ...featureFlags, ...fetchedFlagsFromFile };
            console.log('[Flags] Flags after merging features.json:', JSON.parse(JSON.stringify(featureFlags)));
        }
    } catch (error) {
        console.error('[Flags] Error loading or parsing features.json, using flags potentially modified by defaults only:', error);
    }

    const userFlagsString = localStorage.getItem('userFeatureFlags');
    if (userFlagsString) {
        try {
            const userFlagsFromStorage = JSON.parse(userFlagsString);
            console.log('[Flags] User flags found in localStorage:', userFlagsFromStorage);
            featureFlags = { ...featureFlags, ...userFlagsFromStorage };
            console.log('[Flags] Flags after merging localStorage:', JSON.parse(JSON.stringify(featureFlags)));
        } catch (e) {
            console.error('[Flags] Error parsing userFeatureFlags from localStorage:', e);
        }
    } else {
        console.log('[Flags] No userFeatureFlags found in localStorage.');
    }

    const allKnownFlagKeys = [
        'testButtonFeature', 'reminderFeature', 'taskTimerSystem', 'advancedRecurrence',
        'fileAttachments', 'integrationsServices', 'userAccounts', 'collaborationSharing',
        'crossDeviceSync', 'tooltipsGuide', 'subTasksFeature', 'kanbanBoardFeature',
        'projectFeature', 'exportDataFeature', 'calendarViewFeature', 'taskDependenciesFeature',
        'smarterSearchFeature', 'bulkActionsFeature', 'pomodoroTimerHybridFeature'
    ];
    allKnownFlagKeys.forEach(key => {
        if (typeof featureFlags[key] !== 'boolean') {
            console.warn(`[Flags] Flag "${key}" was not a boolean after loading. Defaulting to false.`);
            featureFlags[key] = false;
        }
    });

    console.log('[Flags] Final feature flags loaded:', JSON.parse(JSON.stringify(featureFlags)));
    console.log(`[Flags] Project Feature is: ${featureFlags.projectFeature}`);
    console.log(`[Flags] Export Data Feature is: ${featureFlags.exportDataFeature}`);
    console.log(`[Flags] Calendar View Feature is: ${featureFlags.calendarViewFeature}`);
    console.log(`[Flags] Task Dependencies Feature is: ${featureFlags.taskDependenciesFeature}`);
    console.log(`[Flags] Smarter Search Feature is: ${featureFlags.smarterSearchFeature}`);
    console.log(`[Flags] Bulk Actions Feature is: ${featureFlags.bulkActionsFeature}`);
    console.log(`[Flags] Pomodoro Timer Hybrid Feature is: ${featureFlags.pomodoroTimerHybridFeature}`);
}

// --- Date & Time Helper Functions ---
// These functions have been moved to utils.js:
// getTodayDateString()
// getDateString(date)
// formatDate(dateString)
// formatTime(timeString)
// formatDuration(hours, minutes)
// formatMillisecondsToHMS(ms)
// Ensure utils.js is loaded before this script in todo.html

// --- Core Task Data Functions ---
function saveTasks() {
    localStorage.setItem('todos_v3', JSON.stringify(tasks));
    updateUniqueLabels();
}

function initializeTasks() {
    const defaultKanbanColumn = kanbanColumns[0]?.id || 'todo';
    tasks = tasks.map(task => ({
        id: task.id || Date.now(),
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
        kanbanColumnId: task.kanbanColumnId || defaultKanbanColumn,
        projectId: task.projectId || null, // Ensure this is initialized, 0 for "No Project"
        dependsOn: task.dependsOn || [],
        blocksTasks: task.blocksTasks || []
    }));
}

function getPriorityClass(priority) {
    switch (priority) {
        case 'high': return 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100';
        case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-yellow-100';
        case 'low': return 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100';
        default: return 'bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-200';
    }
}

function updateUniqueLabels() {
    const labels = new Set();
    tasks.forEach(task => {
        if (task.label && task.label.trim() !== '') {
            labels.add(task.label.trim());
        }
    });
    uniqueLabels = Array.from(labels).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

// --- Project Data Functions ---
function saveProjects() {
    localStorage.setItem('projects_v1', JSON.stringify(projects));
    updateUniqueProjects();
    console.log('[Projects] Projects saved to localStorage:', projects);
}

function loadProjects() {
    const storedProjects = localStorage.getItem('projects_v1');
    if (storedProjects) {
        try {
            const parsedProjects = JSON.parse(storedProjects);
            if (Array.isArray(parsedProjects) && parsedProjects.every(p => p && typeof p.id === 'number' && typeof p.name === 'string')) {
                projects = parsedProjects;
                console.log('[Projects] Loaded projects from localStorage:', projects);
                // Ensure "No Project" (id: 0) exists and is first
                if (!projects.find(p => p.id === 0)) {
                    projects.unshift({ id: 0, name: "No Project", creationDate: Date.now() -1 });
                } else {
                    const noProjIndex = projects.findIndex(p => p.id === 0);
                    if (noProjIndex > 0) { // If "No Project" is not at the start
                        const noProj = projects.splice(noProjIndex, 1)[0];
                        projects.unshift(noProj);
                    }
                }
            } else {
                console.warn("[Projects] Stored projects data is invalid. Initializing with default.");
                projects = [{ id: 0, name: "No Project", creationDate: Date.now() }];
            }
        } catch (e) {
            console.error("[Projects] Error parsing stored projects. Initializing with default.", e);
            projects = [{ id: 0, name: "No Project", creationDate: Date.now() }];
        }
    } else {
        console.log('[Projects] No stored projects found. Initializing with default "No Project".');
        projects = [{ id: 0, name: "No Project", creationDate: Date.now() }];
    }
    updateUniqueProjects();
}

function updateUniqueProjects() {
    uniqueProjects = projects
        .filter(project => project.id !== 0) // Exclude "No Project" from the filterable list
        .map(project => ({ id: project.id, name: project.name })) // Keep only id and name for dropdowns
        .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    console.log('[Projects] Unique projects updated for UI:', uniqueProjects);
}


function parseDateFromText(text) {
    let parsedDate = null;
    let remainingText = text;
    // Assuming getTodayDateString and getDateString are now globally available from utils.js
    const today = new Date(getTodayDateString() + 'T00:00:00'); // Ensure it's treated as start of day

    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const shortDaysOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

    const patterns = [
        { regex: /\b(on|due|by)\s+(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})\b/i, handler: (match) => match[2].replace(/\//g, '-') },
        { regex: /\b(on|due|by)\s+(\d{1,2}[-\/]\d{1,2}(?:[-\/]\d{2,4})?)\b/i, handler: (match) => {
            const dateStr = match[2];
            const parts = dateStr.replace(/-/g, '/').split('/');
            let year, month, day;
            if (parts.length === 2) {
                year = today.getFullYear();
                month = parseInt(parts[0]);
                day = parseInt(parts[1]);
            } else {
                year = parseInt(parts[2]);
                if (year < 100) year += 2000;
                month = parseInt(parts[0]);
                day = parseInt(parts[1]);
            }
            if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }},
        { regex: /\b(today)\b/i, handler: () => getDateString(today) },
        { regex: /\b(tomorrow)\b/i, handler: () => {
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            return getDateString(tomorrow);
        }},
        { regex: new RegExp(`\\b(next\\s+)?(${daysOfWeek.join('|')}|${shortDaysOfWeek.join('|')})\\b`, 'i'), handler: (match) => {
            const dayName = match[2].toLowerCase();
            let targetDayIndex = daysOfWeek.indexOf(dayName);
            if (targetDayIndex === -1) targetDayIndex = shortDaysOfWeek.indexOf(dayName);
            if (targetDayIndex === -1) return null;

            const currentDayIndex = today.getDay();
            let daysToAdd = targetDayIndex - currentDayIndex;

            if (match[1]) { // "next Monday"
                daysToAdd = (daysToAdd <= 0 ? daysToAdd + 7 : daysToAdd);
            } else { // "Monday"
                if (daysToAdd < 0) daysToAdd += 7;
            }
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + daysToAdd);
            return getDateString(targetDate);
        }},
        { regex: /\b(next week)\b/i, handler: () => {
            const nextWeek = new Date(today);
            const dayOffset = (today.getDay() === 0 ? -6 : 1);
            nextWeek.setDate(today.getDate() - today.getDay() + dayOffset + 7);
            return getDateString(nextWeek);
        }},
        { regex: /\b(next month)\b/i, handler: () => {
            const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
            return getDateString(nextMonthDate);
        }},
        { regex: /\b(next year)\b/i, handler: () => {
            const nextYearDate = new Date(today.getFullYear() + 1, 0, 1);
            return getDateString(nextYearDate);
        }},
        { regex: /\b(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})\b/g, handler: (match) => {
            const potentialDate = match[0].replace(/\//g, '-');
            if (!isNaN(new Date(potentialDate + 'T00:00:00').getTime())) { // Add T00:00:00 for robust parsing
                return potentialDate;
            }
            return null;
        }},
        { regex: /\b(\d{1,2}[-\/]\d{1,2}(?:[-\/]\d{2,4})?)\b/g, handler: (match) => {
            const dateStr = match[0];
            const parts = dateStr.replace(/-/g, '/').split('/');
            let year, month, day;

            if (parts.length === 2) {
                year = today.getFullYear();
                month = parseInt(parts[0]);
                day = parseInt(parts[1]);
            } else {
                year = parseInt(parts[2]);
                if (year < 100) year += 2000;
                month = parseInt(parts[0]);
                day = parseInt(parts[1]);
            }
            if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
            const potentialDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
             if (!isNaN(new Date(potentialDate + 'T00:00:00').getTime())) { // Add T00:00:00
                 return potentialDate;
            }
            return null;
        }}
    ];

    for (const pattern of patterns) {
        const regex = new RegExp(pattern.regex.source, pattern.regex.flags.replace('g', ''));
        const match = regex.exec(remainingText);

        if (match) {
            const potentialDate = pattern.handler(match);
            if (potentialDate && !isNaN(new Date(potentialDate + 'T00:00:00').getTime())) { // Add T00:00:00
                const matchedString = match[0];
                const tempRemainingText = remainingText.replace(new RegExp(matchedString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*', 'i'), '').trim();
                const afterMatchIndex = match.index + matchedString.length;
                const charAfterMatch = remainingText[afterMatchIndex];

                if (afterMatchIndex === remainingText.length || /[\s,.?!]/.test(charAfterMatch || '')) {
                    parsedDate = potentialDate;
                    remainingText = tempRemainingText.replace(/\s\s+/g, ' ').trim();
                    break;
                }
            }
        }
    }
    return { parsedDate, remainingText };
}

// --- Task View Mode Management ---
function setTaskViewMode(mode) {
    if (['list', 'kanban', 'calendar', 'pomodoro'].includes(mode)) {
        currentTaskViewMode = mode;
        console.log(`Task view mode changed to: ${currentTaskViewMode}`);
    } else {
        console.warn(`Attempted to set invalid task view mode: ${mode}`);
    }
}

// --- Filtering and sorting state management ---
function setAppCurrentFilter(filter) {
    currentFilter = filter;
    currentSort = 'default';
}

function setAppCurrentSort(sortType) {
    currentSort = sortType;
}

function setAppSearchTerm(term) {
    currentSearchTerm = term;
}

// --- Kanban Board Logic ---
function updateKanbanColumnTitle(columnId, newTitle) {
    const columnIndex = kanbanColumns.findIndex(col => col.id === columnId);
    if (columnIndex !== -1) {
        kanbanColumns[columnIndex].title = newTitle;
        saveKanbanColumns();
        if (currentTaskViewMode === 'kanban' && featureFlags.kanbanBoardFeature) {
            if (window.AppFeatures && window.AppFeatures.KanbanBoard && typeof window.AppFeatures.KanbanBoard.renderKanbanBoard === 'function') {
                 window.AppFeatures.KanbanBoard.renderKanbanBoard();
            }
        }
    }
}

function saveKanbanColumns() {
    localStorage.setItem('kanbanColumns_v1', JSON.stringify(kanbanColumns));
}

function loadKanbanColumns() {
    const storedColumns = localStorage.getItem('kanbanColumns_v1');
    if (storedColumns) {
        try {
            const parsedColumns = JSON.parse(storedColumns);
            if (Array.isArray(parsedColumns) && parsedColumns.every(col => col && typeof col.id === 'string' && typeof col.title === 'string')) {
                 const defaultColumnIds = ['todo', 'inprogress', 'done'];
                 const defaultTitles = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' }; // Store initial default titles
                 const newKanbanColumns = defaultColumnIds.map(defaultId => {
                    const foundStored = parsedColumns.find(sc => sc.id === defaultId);
                    return {
                        id: defaultId,
                        title: foundStored ? foundStored.title : defaultTitles[defaultId]
                    };
                 });
                kanbanColumns = newKanbanColumns;
                console.log('[Kanban] Loaded column titles from localStorage:', kanbanColumns);
            } else {
                 console.warn("[Kanban] Stored Kanban columns are invalid. Using defaults and saving them.");
                 saveKanbanColumns();
            }
        } catch (e) {
            console.error("[Kanban] Error parsing stored Kanban columns. Using defaults and saving them.", e);
            saveKanbanColumns();
        }
    } else {
        console.log('[Kanban] No stored Kanban columns found. Saving defaults.');
        saveKanbanColumns();
    }
}

// --- Data Management Functions (Export/Import) ---
function prepareDataForExport() {
    return {
        version: "1.0.0",
        exportDate: new Date().toISOString(),
        data: {
            tasks: tasks,
            projects: projects,
            kanbanColumns: kanbanColumns,
            featureFlags: featureFlags
        }
    };
}

// --- Bulk Action State Management (New) ---
function toggleTaskSelectionForBulkAction(taskId) {
    const index = selectedTaskIdsForBulkAction.indexOf(taskId);
    if (index > -1) {
        selectedTaskIdsForBulkAction.splice(index, 1);
    } else {
        selectedTaskIdsForBulkAction.push(taskId);
    }
    console.log("Selected tasks for bulk action:", selectedTaskIdsForBulkAction);
}

function clearBulkActionSelections() {
    selectedTaskIdsForBulkAction = [];
    console.log("Bulk action selections cleared.");
}

function getSelectedTaskIdsForBulkAction() {
    return [...selectedTaskIdsForBulkAction];
}
