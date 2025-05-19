// app_logic.js
// This file now contains core application logic, event handlers,
// and functions that interact with the state managed in store.js
// and utility functions from utils.js.

// --- Theme Management ---
// This can remain here as it's a direct DOM manipulation based on localStorage,
// though eventually, it could be part of a dedicated theme service.
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

// --- Core Task Interaction Logic (Examples, to be expanded) ---
// These functions will now rely on state variables (tasks, projects, etc.)
// being globally available from store.js.

function getPriorityClass(priority) {
    // This utility could also move to utils.js if it's purely presentational
    // or stay here if considered part of task-specific display logic.
    // For now, keeping it as an example of a function that might remain.
    switch (priority) {
        case 'high': return 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100';
        case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-yellow-100';
        case 'low': return 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100';
        default: return 'bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-200';
    }
}

function parseDateFromText(text) {
    // This function uses getTodayDateString and getDateString, which are now in utils.js
    // It also relies on the 'today' variable which should be defined using getTodayDateString()
    // The state variables like 'tasks' are now expected to be global from store.js.

    let parsedDate = null;
    let remainingText = text;
    const today = new Date(getTodayDateString() + 'T00:00:00Z'); // Use UTC for date comparisons

    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const shortDaysOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

    const patterns = [
        // DD/MM/YYYY or DD-MM-YYYY (common international format)
        { regex: /\b(on|due|by)?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\b/i, handler: (match) => {
            const dateStr = match[2];
            const parts = dateStr.replace(/-/g, '/').split('/');
            let year, month, day;
            if (parts.length === 3) { // DD/MM/YYYY or DD/MM/YY
                day = parseInt(parts[0]);
                month = parseInt(parts[1]);
                year = parseInt(parts[2]);
                if (year < 100) year += 2000; // Assume 20xx for two-digit years
            } else { return null; } // Invalid format
            if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
            // Basic validation for month and day
            if (month < 1 || month > 12 || day < 1 || day > 31) return null;
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }},
        // YYYY-MM-DD or YYYY/MM/DD (ISO-like, robust)
        { regex: /\b(on|due|by)?\s*(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})\b/i, handler: (match) => {
            const dateStr = match[2].replace(/\//g, '-');
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const year = parseInt(parts[0]);
                const month = parseInt(parts[1]);
                const day = parseInt(parts[2]);
                if (month < 1 || month > 12 || day < 1 || day > 31) return null; // Basic validation
                return dateStr;
            }
            return null;
        }},
        // MM/DD/YYYY or MM-DD-YYYY (common US format)
        // This needs to be carefully placed to avoid conflict if DD/MM/YYYY is also possible
        // For now, let's assume one primary date entry style or use more context.
        // If we prioritize MM/DD:
        { regex: /\b(on|due|by)?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\b/i, handler: (match) => {
            // This pattern is ambiguous with DD/MM/YYYY. We'll assume MM/DD for this example if not YYYY-MM-DD
            // A more robust solution would involve locale settings or more specific keywords.
            const dateStr = match[2];
            const parts = dateStr.replace(/-/g, '/').split('/');
            let year, month, day;
            if (parts.length === 3 && parseInt(parts[2]) > 31) { // Likely YYYY as last part
                 month = parseInt(parts[0]);
                 day = parseInt(parts[1]);
                 year = parseInt(parts[2]);
            } else if (parts.length === 3 && parseInt(parts[2]) <=31 && parseInt(parts[0]) <=12) { // Could be MM/DD/YY or MM/DD/YYYY
                 month = parseInt(parts[0]);
                 day = parseInt(parts[1]);
                 year = parseInt(parts[2]);
                 if (year < 100) year += 2000;
            } else if (parts.length === 2 && parseInt(parts[0]) <=12) { // MM/DD
                month = parseInt(parts[0]);
                day = parseInt(parts[1]);
                year = today.getFullYear();
            }
             else { return null; }
            if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
            if (month < 1 || month > 12 || day < 1 || day > 31) return null;
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }},
        { regex: /\b(today)\b/i, handler: () => getDateString(today) },
        { regex: /\b(tomorrow)\b/i, handler: () => {
            const tomorrow = new Date(today); // today is already UTC start of day
            tomorrow.setUTCDate(today.getUTCDate() + 1);
            return getDateString(tomorrow);
        }},
        { regex: new RegExp(`\\b(next\\s+)?(${daysOfWeek.join('|')}|${shortDaysOfWeek.join('|')})\\b`, 'i'), handler: (match) => {
            const dayName = match[2].toLowerCase();
            let targetDayIndex = daysOfWeek.indexOf(dayName);
            if (targetDayIndex === -1) targetDayIndex = shortDaysOfWeek.indexOf(dayName);
            if (targetDayIndex === -1) return null;

            const currentDayIndex = today.getUTCDay(); // Use UTC day
            let daysToAdd = targetDayIndex - currentDayIndex;

            if (match[1] || daysToAdd <= 0) { // "next Monday" or if "Monday" has passed this week
                daysToAdd += 7;
            }
            // If "Monday" and today is Monday, and "next" is not specified, it means next week's Monday
            if (!match[1] && daysToAdd === 0) {
                 daysToAdd = 7;
            }


            const targetDate = new Date(today);
            targetDate.setUTCDate(today.getUTCDate() + daysToAdd);
            return getDateString(targetDate);
        }},
        { regex: /\b(next week)\b/i, handler: () => {
            const nextWeek = new Date(today);
            // Assuming week starts on Monday (day 1 for getUTCDay() if Sunday is 0)
            // Go to the start of the current week (Monday) and add 7 days
            const currentDay = today.getUTCDay();
            const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay; // days to get to Monday
            nextWeek.setUTCDate(today.getUTCDate() + daysToMonday + 7);
            return getDateString(nextWeek);
        }},
        { regex: /\b(next month)\b/i, handler: () => {
            const nextMonthDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));
            return getDateString(nextMonthDate);
        }},
        { regex: /\b(next year)\b/i, handler: () => {
            const nextYearDate = new Date(Date.UTC(today.getUTCFullYear() + 1, 0, 1)); // Jan 1st of next year
            return getDateString(nextYearDate);
        }}
    ];

    for (const pattern of patterns) {
        const regex = new RegExp(pattern.regex.source, pattern.regex.flags.replace('g', '')); // Ensure non-global for exec
        let matchResult;
        // Need to handle cases where the date string might be part of the task text
        // This loop attempts to find the date pattern and ensure it's a standalone date phrase
        let searchIndex = 0;
        while((matchResult = regex.exec(remainingText.substring(searchIndex))) !== null) {
            const actualMatchIndex = matchResult.index + searchIndex;
            const matchedString = matchResult[0];

            // Check if the match is at a word boundary
            const precedingChar = actualMatchIndex > 0 ? remainingText[actualMatchIndex - 1] : ' ';
            const followingChar = (actualMatchIndex + matchedString.length) < remainingText.length ? remainingText[actualMatchIndex + matchedString.length] : ' ';

            if ((/\s/.test(precedingChar) || precedingChar === '') && (/\s/.test(followingChar) || followingChar === '')) {
                const potentialDate = pattern.handler(matchResult);
                if (potentialDate && !isNaN(new Date(potentialDate + 'T00:00:00Z').getTime())) {
                    parsedDate = potentialDate;
                    // Remove the matched date phrase from the text
                    remainingText = remainingText.substring(0, actualMatchIndex).trim() + " " + remainingText.substring(actualMatchIndex + matchedString.length).trim();
                    remainingText = remainingText.replace(/\s\s+/g, ' ').trim(); // Clean up spaces
                    // If a keyword like "on", "due", "by" was part of the match but not handled by regex, remove it
                    const keywords = ["on ", "due ", "by "];
                    for (const kw of keywords) {
                        if (remainingText.toLowerCase().endsWith(kw.trim())) {
                             remainingText = remainingText.substring(0, remainingText.length - kw.length).trim();
                        }
                    }
                    return { parsedDate, remainingText }; // Found a valid date
                }
            }
            searchIndex = actualMatchIndex + 1; // Continue search after this match attempt
        }
    }
    return { parsedDate, remainingText };
}


// --- Task View Mode Management ---
function setTaskViewMode(mode) {
    // currentTaskViewMode is now global from store.js
    if (['list', 'kanban', 'calendar', 'pomodoro'].includes(mode)) {
        currentTaskViewMode = mode;
        console.log(`Task view mode changed to: ${currentTaskViewMode}`);
    } else {
        console.warn(`Attempted to set invalid task view mode: ${mode}`);
    }
}

// --- Filtering and sorting state management ---
function setAppCurrentFilter(filter) {
    // currentFilter and currentSort are now global from store.js
    currentFilter = filter;
    currentSort = 'default'; // Reset sort when filter changes
}

function setAppCurrentSort(sortType) {
    // currentSort is now global from store.js
    currentSort = sortType;
}

function setAppSearchTerm(term) {
    // currentSearchTerm is now global from store.js
    currentSearchTerm = term;
}

// --- Kanban Board Logic ---
function updateKanbanColumnTitle(columnId, newTitle) {
    // kanbanColumns and featureFlags are now global from store.js
    // saveKanbanColumns is also global from store.js
    const columnIndex = kanbanColumns.findIndex(col => col.id === columnId);
    if (columnIndex !== -1) {
        kanbanColumns[columnIndex].title = newTitle;
        saveKanbanColumns(); // from store.js
        if (currentTaskViewMode === 'kanban' && featureFlags.kanbanBoardFeature) {
            if (window.AppFeatures && window.AppFeatures.KanbanBoard && typeof window.AppFeatures.KanbanBoard.renderKanbanBoard === 'function') {
                 window.AppFeatures.KanbanBoard.renderKanbanBoard();
            }
        }
    }
}


// --- Data Management Functions (Export/Import) ---
function prepareDataForExport() {
    // tasks, projects, kanbanColumns, featureFlags are now global from store.js
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

// --- Bulk Action State Management ---
function toggleTaskSelectionForBulkAction(taskId) {
    // selectedTaskIdsForBulkAction is now global from store.js
    const index = selectedTaskIdsForBulkAction.indexOf(taskId);
    if (index > -1) {
        selectedTaskIdsForBulkAction.splice(index, 1);
    } else {
        selectedTaskIdsForBulkAction.push(taskId);
    }
    console.log("Selected tasks for bulk action:", selectedTaskIdsForBulkAction);
    // UI update for bulk action controls will be handled by ui_rendering.js or a feature module
}

function clearBulkActionSelections() {
    // selectedTaskIdsForBulkAction is now global from store.js
    selectedTaskIdsForBulkAction = [];
    console.log("Bulk action selections cleared.");
    // UI update for bulk action controls will be handled by ui_rendering.js or a feature module
}

function getSelectedTaskIdsForBulkAction() {
    // selectedTaskIdsForBulkAction is now global from store.js
    return [...selectedTaskIdsForBulkAction];
}

// Note: The initial data loading (loadFeatureFlags, initializeTasks, loadProjects, loadKanbanColumns)
// is now handled within store.js itself when it's loaded.
// Other functions that were purely for data manipulation or state definition have been removed.
// This file will shrink further as we extract services (taskService, projectService, etc.).
