// --- Application State ---
let tasks = JSON.parse(localStorage.getItem('todos_v3')) || [];
let currentFilter = 'inbox';
let currentSort = 'default';
let currentSearchTerm = '';
let editingTaskId = null;
let currentViewTaskId = null; // Also used by UI, but primarily managed by logic flow
let uniqueLabels = [];
// Default feature flags, will be overridden by the JSON file if successfully loaded
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
    subTasksFeature: false
};
let currentTaskTimerInterval = null;
let tooltipTimeout = null;

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
    try {
        const response = await fetch('features.json?cachebust=' + new Date().getTime());
        if (!response.ok) {
            console.warn('Failed to load features.json, using default flags. Status:', response.status);
            // Ensure all flags have a default, especially new ones
            if (typeof featureFlags.subTasksFeature === 'undefined') {
                featureFlags.subTasksFeature = false;
            }
            // Add similar checks for other feature flags if necessary
            return;
        }
        const fetchedFlags = await response.json();
        featureFlags = { ...featureFlags, ...fetchedFlags }; // Merge defaults with fetched
        console.log('Feature flags loaded successfully:', featureFlags);
    } catch (error) {
        console.error('Error loading or parsing features.json, using default flags:', error);
        // Ensure default on error
        if (typeof featureFlags.subTasksFeature === 'undefined') {
            featureFlags.subTasksFeature = false;
        }
        // Add similar checks for other feature flags if necessary
    }
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
    const date = new Date(Date.UTC(year, month, day)); // Use UTC to avoid timezone issues with date parts
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}
function formatTime(timeString) {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHours = h % 12 || 12; // Converts 0 or 12 to 12
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
    return parts.join(' ') || 'Not set'; // Fallback if somehow parts is empty
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
        // Reminder fields are part of the core task data structure.
        // The feature_reminder.js file handles UI interaction for these fields.
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
        subTasks: task.subTasks || []
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
    // The actual population of datalists is handled in ui_interactions.js
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
            if (parts.length === 2) { year = today.getFullYear(); month = parseInt(parts[0]); day = parseInt(parts[1]); }
            else { year = parseInt(parts[2]); if (year < 100) year += 2000; month = parseInt(parts[0]); day = parseInt(parts[1]); }
            if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }},
        { regex: /\b(today)\b/i, handler: () => getDateString(today) },
        { regex: /\b(tomorrow)\b/i, handler: () => { const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1); return getDateString(tomorrow); }},
        { regex: new RegExp(`\\b(next\\s+)?(${daysOfWeek.join('|')}|${shortDaysOfWeek.join('|')})\\b`, 'i'), handler: (match) => {
            const dayName = match[2].toLowerCase();
            let targetDayIndex = daysOfWeek.indexOf(dayName);
            if (targetDayIndex === -1) targetDayIndex = shortDaysOfWeek.indexOf(dayName);
            if (targetDayIndex === -1) return null;
            const currentDayIndex = today.getDay();
            let daysToAdd = targetDayIndex - currentDayIndex;
            if (match[1]) { daysToAdd = (daysToAdd <= 0 ? daysToAdd + 7 : daysToAdd); }
            else { if (daysToAdd < 0) daysToAdd += 7; }
            const targetDate = new Date(today); targetDate.setDate(today.getDate() + daysToAdd); return getDateString(targetDate);
        }},
        { regex: /\b(next week)\b/i, handler: () => { const nextWeek = new Date(today); const dayOffset = (today.getDay() === 0 ? -6 : 1); nextWeek.setDate(today.getDate() - today.getDay() + dayOffset + 7); return getDateString(nextWeek); }},
        { regex: /\b(next month)\b/i, handler: () => { const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1); return getDateString(nextMonthDate); }},
        { regex: /\b(next year)\b/i, handler: () => { const nextYearDate = new Date(today.getFullYear() + 1, 0, 1); return getDateString(nextYearDate); }},
        { regex: /\b(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})\b/g, handler: (match) => { const pd = match[0].replace(/\//g, '-'); if (!isNaN(new Date(pd).getTime())) return pd; return null; }},
        { regex: /\b(\d{1,2}[-\/]\d{1,2}(?:[-\/]\d{2,4})?)\b/g, handler: (match) => {
            const ds = match[0]; const pts = ds.replace(/-/g, '/').split('/');
            let y, m, d;
            if (pts.length === 2) { y = today.getFullYear(); m = parseInt(pts[0]); d = parseInt(pts[1]); }
            else { y = parseInt(pts[2]); if (y < 100) y += 2000; m = parseInt(pts[0]); d = parseInt(pts[1]); }
            if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
            const pd = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            if (!isNaN(new Date(pd).getTime())) return pd; return null;
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

// --- Sub-task Logic ---
function addSubTaskLogic(parentId, subTaskText) {
    if (!featureFlags.subTasksFeature || !parentId || !subTaskText.trim()) return false;
    const parentTaskIndex = tasks.findIndex(t => t.id === parentId);
    if (parentTaskIndex === -1) return false;
    const newSubTask = { id: Date.now() + Math.random(), text: subTaskText.trim(), completed: false, creationDate: Date.now() };
    tasks[parentTaskIndex].subTasks.push(newSubTask);
    saveTasks();
    return true;
}

function editSubTaskLogic(parentId, subTaskId, newText) {
    if (!featureFlags.subTasksFeature || !parentId || !subTaskId || !newText.trim()) return false;
    const parentTaskIndex = tasks.findIndex(t => t.id === parentId);
    if (parentTaskIndex === -1) return false;
    const subTaskIndex = tasks[parentTaskIndex].subTasks.findIndex(st => st.id === subTaskId);
    if (subTaskIndex === -1) return false;
    tasks[parentTaskIndex].subTasks[subTaskIndex].text = newText.trim();
    saveTasks();
    return true;
}

function toggleSubTaskCompleteLogic(parentId, subTaskId) {
    if (!featureFlags.subTasksFeature || !parentId || !subTaskId) return false;
    const parentTaskIndex = tasks.findIndex(t => t.id === parentId);
    if (parentTaskIndex === -1) return false;
    const subTaskIndex = tasks[parentTaskIndex].subTasks.findIndex(st => st.id === subTaskId);
    if (subTaskIndex === -1) return false;
    tasks[parentTaskIndex].subTasks[subTaskIndex].completed = !tasks[parentTaskIndex].subTasks[subTaskIndex].completed;
    saveTasks();
    return true;
}

function deleteSubTaskLogic(parentId, subTaskId) {
    if (!featureFlags.subTasksFeature || !parentId || !subTaskId) return false;
    const parentTaskIndex = tasks.findIndex(t => t.id === parentId);
    if (parentTaskIndex === -1) return false;
    tasks[parentTaskIndex].subTasks = tasks[parentTaskIndex].subTasks.filter(st => st.id !== subTaskId);
    saveTasks();
    return true;
}

// --- Timer Logic ---
function updateLiveTimerDisplay(taskId) {
    if (!featureFlags.taskTimerSystem) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.timerIsRunning || task.completed) {
        if (currentTaskTimerInterval) clearInterval(currentTaskTimerInterval);
        currentTaskTimerInterval = null;
        return;
    }
}

function startTimerLogic(taskId) {
    if (!featureFlags.taskTimerSystem || !taskId) return false;
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return false;
    const task = tasks[taskIndex];
    if (task.completed || (task.actualDurationMs && task.actualDurationMs > 0 && !task.timerIsPaused && !task.timerIsRunning)) return false;
    task.timerIsRunning = true;
    task.timerIsPaused = false;
    task.timerStartTime = Date.now();
    saveTasks();
    return true;
}

function pauseTimerLogic(taskId) {
    if (!featureFlags.taskTimerSystem || !taskId) return false;
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1 || !tasks[taskIndex].timerIsRunning) return false;
    const task = tasks[taskIndex];
    const elapsed = Date.now() - (task.timerStartTime || Date.now());
    task.timerAccumulatedTime = (task.timerAccumulatedTime || 0) + elapsed;
    task.timerIsRunning = false;
    task.timerIsPaused = true;
    task.timerStartTime = null;
    saveTasks();
    return true;
}

function stopTimerLogic(taskId) {
    if (!featureFlags.taskTimerSystem || !taskId) return false;
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return false;
    const task = tasks[taskIndex];
    if (task.timerIsRunning) {
        const elapsed = Date.now() - (task.timerStartTime || Date.now());
        task.timerAccumulatedTime = (task.timerAccumulatedTime || 0) + elapsed;
    }
    if (task.timerAccumulatedTime > 0) {
        task.actualDurationMs = task.timerAccumulatedTime;
    }
    task.timerIsRunning = false;
    task.timerIsPaused = false;
    task.timerStartTime = null;
    saveTasks();
    return true;
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
