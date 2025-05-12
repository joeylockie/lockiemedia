// app_logic.js

// --- Application State ---
let tasks = JSON.parse(localStorage.getItem('todos_v3')) || [];
let currentFilter = 'inbox';
let currentSort = 'default';
let currentSearchTerm = '';
let editingTaskId = null;
let currentViewTaskId = null;
let uniqueLabels = [];
let tooltipTimeout = null;
let currentTaskViewMode = 'list'; // 'list' or 'kanban'

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
    kanbanBoardFeature: false
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
            // Merge file flags over defaults. This ensures all flags from the default object are present.
            featureFlags = { ...featureFlags, ...fetchedFlagsFromFile };
            console.log('[Flags] Flags after merging features.json:', JSON.parse(JSON.stringify(featureFlags)));
        }
    } catch (error) {
        console.error('[Flags] Error loading or parsing features.json, using flags potentially modified by defaults only:', error);
    }

    // Load user-specific overrides from localStorage
    const userFlagsString = localStorage.getItem('userFeatureFlags');
    if (userFlagsString) {
        try {
            const userFlagsFromStorage = JSON.parse(userFlagsString);
            console.log('[Flags] User flags found in localStorage:', userFlagsFromStorage);
            // Merge localStorage flags over the current flags (which are defaults or defaults+file)
            featureFlags = { ...featureFlags, ...userFlagsFromStorage };
            console.log('[Flags] Flags after merging localStorage:', JSON.parse(JSON.stringify(featureFlags)));
        } catch (e) {
            console.error('[Flags] Error parsing userFeatureFlags from localStorage:', e);
        }
    } else {
        console.log('[Flags] No userFeatureFlags found in localStorage.');
    }

    // Ensure all expected flags have a boolean value after all merges, defaulting to false if undefined
    const allKnownFlagKeys = [
        'testButtonFeature', 'reminderFeature', 'taskTimerSystem', 'advancedRecurrence',
        'fileAttachments', 'integrationsServices', 'userAccounts', 'collaborationSharing',
        'crossDeviceSync', 'tooltipsGuide', 'subTasksFeature', 'kanbanBoardFeature'
    ];
    allKnownFlagKeys.forEach(key => {
        if (typeof featureFlags[key] !== 'boolean') {
            console.warn(`[Flags] Flag "${key}" was not a boolean after loading. Defaulting to false.`);
            featureFlags[key] = false;
        }
    });

    console.log('[Flags] Final feature flags loaded:', JSON.parse(JSON.stringify(featureFlags)));
    console.log(`[Flags] Kanban Board Feature is: ${featureFlags.kanbanBoardFeature}`);
}


// --- Date & Time Helper Functions ---
function getTodayDateString() { return new Date().toISOString().split('T')[0]; }
function getDateString(date) { return date.toISOString().split('T')[0]; }
function formatDate(dateString) {
    if (!dateString) return '';
    const dateParts = dateString.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1;
    const day = parseInt(dateParts[2]);
    const date = new Date(Date.UTC(year, month, day));
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}
function formatTime(timeString) {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHours = h % 12 || 12;
    return `${String(formattedHours).padStart(2, '0')}:${minutes} ${ampm}`;
}
function formatDuration(hours, minutes) {
    hours = parseInt(hours) || 0;
    minutes = parseInt(minutes) || 0;
    if (hours === 0 && minutes === 0) {
        return 'Not set';
    }
    let parts = [];
    if (hours > 0) { parts.push(`${hours} hr${hours > 1 ? 's' : ''}`); }
    if (minutes > 0) { parts.push(`${minutes} min${minutes > 1 ? 's' : ''}`); }
    return parts.join(' ') || 'Not set';
}
function formatMillisecondsToHMS(ms) {
    if (ms === null || typeof ms === 'undefined' || ms < 0) return "00:00:00";
    let totalSeconds = Math.floor(ms / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}


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
        kanbanColumnId: task.kanbanColumnId || defaultKanbanColumn
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

function parseDateFromText(text) {
    let parsedDate = null;
    let remainingText = text;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
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

            if (match[1]) { 
                daysToAdd = (daysToAdd <= 0 ? daysToAdd + 7 : daysToAdd);
            } else { 
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
            const pd = match[0].replace(/\//g, '-');
            if (!isNaN(new Date(pd).getTime())) return pd;
            return null;
        }},
        { regex: /\b(\d{1,2}[-\/]\d{1,2}(?:[-\/]\d{2,4})?)\b/g, handler: (match) => {
            const ds = match[0]; const pts = ds.replace(/-/g, '/').split('/');
            let y, m, d;
            if (pts.length === 2) { y = today.getFullYear(); m = parseInt(pts[0]); d = parseInt(pts[1]); }
            else { y = parseInt(pts[2]); if (y < 100) y += 2000; m = parseInt(pts[0]); d = parseInt(pts[1]); }
            if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
            const pd = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            if (!isNaN(new Date(pd).getTime())) return pd;
            return null;
        }}
    ];

    for (const pattern of patterns) {
        const regex = new RegExp(pattern.regex.source, pattern.regex.flags.replace('g', '')); 
        const match = regex.exec(remainingText);
        if (match) {
            const potentialDate = pattern.handler(match);
            if (potentialDate && !isNaN(new Date(potentialDate).getTime())) {
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
    if (mode === 'list' || mode === 'kanban') {
        currentTaskViewMode = mode;
        console.log(`Task view mode changed to: ${currentTaskViewMode}`);
        // The actual rendering is triggered by refreshTaskView() in ui_rendering.js
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
                 // Re-render the specific column header or the whole board if simpler
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
                 const newKanbanColumns = defaultColumnIds.map(defaultId => {
                    const foundStored = parsedColumns.find(sc => sc.id === defaultId);
                    const defaultColumn = kanbanColumns.find(dc => dc.id === defaultId) || { id: defaultId, title: defaultId.charAt(0).toUpperCase() + defaultId.slice(1) }; // Ensure defaultColumn is defined
                    return {
                        id: defaultId,
                        title: foundStored ? foundStored.title : defaultColumn.title
                    };
                 });
                kanbanColumns = newKanbanColumns;
                console.log('[Kanban] Loaded column titles from localStorage:', kanbanColumns);
            } else {
                 console.warn("[Kanban] Stored Kanban columns are invalid. Using defaults and saving them.");
                 saveKanbanColumns(); // Save defaults if stored is bad
            }
        } catch (e) {
            console.error("[Kanban] Error parsing stored Kanban columns. Using defaults and saving them.", e);
            saveKanbanColumns(); // Save defaults if parsing fails
        }
    } else {
        console.log('[Kanban] No stored Kanban columns found. Saving defaults.');
        saveKanbanColumns();
    }
}

// --- Placeholder for other feature logic sections (Sub-tasks, etc.) ---
// ... (Reminder, Task Timer, Test Button, etc. logic remains here)
