// app_logic.js

// --- Application State ---
let tasks = JSON.parse(localStorage.getItem('todos_v3')) || [];
let tooltipTimeout = null;
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
    crossDeviceSync: false, // Flag for Cross-Device Sync. Logic will be in feature_cross_device_sync.js
    tooltipsGuide: false,    // Flag for Tooltips Guide. Logic will be in feature_tooltips_guide.js
    subTasksFeature: false   // Flag for Sub-tasks. Logic will be in feature_sub_tasks.js
};

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
            // Ensure all flags have a default
            if (typeof featureFlags.subTasksFeature === 'undefined') { featureFlags.subTasksFeature = false; }
            if (typeof featureFlags.taskTimerSystem === 'undefined') { featureFlags.taskTimerSystem = false; }
            if (typeof featureFlags.advancedRecurrence === 'undefined') { featureFlags.advancedRecurrence = false; }
            if (typeof featureFlags.integrationsServices === 'undefined') { featureFlags.integrationsServices = false; }
            if (typeof featureFlags.userAccounts === 'undefined') { featureFlags.userAccounts = false; }
            if (typeof featureFlags.collaborationSharing === 'undefined') { featureFlags.collaborationSharing = false; }
            if (typeof featureFlags.crossDeviceSync === 'undefined') { featureFlags.crossDeviceSync = false; }
            if (typeof featureFlags.tooltipsGuide === 'undefined') { featureFlags.tooltipsGuide = false; }
            return;
        }
        const fetchedFlags = await response.json();
        featureFlags = { ...featureFlags, ...fetchedFlags }; // Merge defaults with fetched
        console.log('Feature flags loaded successfully:', featureFlags);
    } catch (error) {
        console.error('Error loading or parsing features.json, using default flags:', error);
        // Ensure default on error
        if (typeof featureFlags.subTasksFeature === 'undefined') { featureFlags.subTasksFeature = false; }
        if (typeof featureFlags.taskTimerSystem === 'undefined') { featureFlags.taskTimerSystem = false; }
        if (typeof featureFlags.advancedRecurrence === 'undefined') { featureFlags.advancedRecurrence = false; }
        if (typeof featureFlags.integrationsServices === 'undefined') { featureFlags.integrationsServices = false; }
        if (typeof featureFlags.userAccounts === 'undefined') { featureFlags.userAccounts = false; }
        if (typeof featureFlags.collaborationSharing === 'undefined') { featureFlags.collaborationSharing = false; }
        if (typeof featureFlags.crossDeviceSync === 'undefined') { featureFlags.crossDeviceSync = false; }
        if (typeof featureFlags.tooltipsGuide === 'undefined') { featureFlags.tooltipsGuide = false; }
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
    updateUniqueLabels(); // This should call populateDatalist in ui_interactions.js
}

function initializeTasks() {
    tasks = tasks.map(task => ({
        id: task.id || Date.now(),
        text: task.text || '',
        completed: task.completed || false,
        creationDate: task.creationDate || task.id, // Use task.id as fallback for older tasks
        dueDate: task.dueDate || null,
        time: task.time || null,
        priority: task.priority || 'medium',
        label: task.label || '',
        notes: task.notes || '',
        isReminderSet: task.isReminderSet || false,
        reminderDate: task.reminderDate || null,
        reminderTime: task.reminderTime || null,
        reminderEmail: task.reminderEmail || null,
        // Timer related properties
        estimatedHours: task.estimatedHours || 0,
        estimatedMinutes: task.estimatedMinutes || 0,
        timerStartTime: task.timerStartTime || null,
        timerAccumulatedTime: task.timerAccumulatedTime || 0,
        timerIsRunning: task.timerIsRunning || false,
        timerIsPaused: task.timerIsPaused || false,
        actualDurationMs: task.actualDurationMs || 0,
        attachments: task.attachments || [],
        completedDate: task.completedDate || null,
        subTasks: task.subTasks || [], // Sub-task data structure remains here
        // Advanced Recurrence properties
        recurrenceRule: task.recurrenceRule || null,
        recurrenceEndDate: task.recurrenceEndDate || null,
        nextDueDate: task.nextDueDate || task.dueDate,
        // Collaboration/Sharing properties
        sharedWith: task.sharedWith || [],
        owner: task.owner || null,
        // Cross-Device Sync properties
        lastSynced: task.lastSynced || null,
        syncVersion: task.syncVersion || 0
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
    // The actual population of datalists will be handled in ui_interactions.js
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

// --- Sub-task Logic (Placeholder) ---
// Logic for this feature is primarily managed in feature_sub_tasks.js

// --- Filtering and sorting state management ---
function setAppCurrentFilter(filter) {
    currentFilter = filter;
    currentSort = 'default'; // Reset sort when changing filter
}

function setAppCurrentSort(sortType) {
    currentSort = sortType;
}

function setAppSearchTerm(term) {
    currentSearchTerm = term;
}

// --- Advanced Recurrence Logic (Placeholder) ---
// Logic for this feature is primarily managed in feature_advanced_recurrence.js

// --- Integrations Services Logic (Placeholder) ---
// Logic for this feature is primarily managed in feature_integrations_services.js

// --- File Attachments Logic (Placeholder) ---
// Logic for this feature is primarily managed in feature_file_attachments.js

// --- Reminder Logic (Placeholder) ---
// Logic for this feature is primarily managed in feature_reminder.js

// --- Task Timer System Logic (Placeholder) ---
// Logic for this feature is primarily managed in task_timer_system.js // Assuming you'll create this file

// --- Test Button Feature Logic (Placeholder) ---
// Logic for this feature is primarily managed in feature_test_button.js

// --- User Accounts Logic (Placeholder) ---
// Logic for this feature is primarily managed in feature_user_accounts.js

// --- Collaboration Sharing Logic (Placeholder) ---
// Logic for this feature is primarily managed in feature_collaboration_sharing.js

// --- Cross-Device Sync Logic (Placeholder) ---
// Logic for this feature is primarily managed in feature_cross_device_sync.js

// --- Tooltips Guide Logic (Placeholder) ---
// Logic for this feature is primarily managed in feature_tooltips_guide.js
