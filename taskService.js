// taskService.js
// This file contains services related to task data and operations.
// It relies on utility functions from utils.js and state from store.js.

/**
 * Determines the CSS class string for a given task priority.
 * @param {string} priority - The priority of the task (e.g., 'high', 'medium', 'low').
 * @returns {string} Tailwind CSS classes for the priority.
 */
function getPriorityClass(priority) {
    // This function is used for displaying task priority badges.
    switch (priority) {
        case 'high': return 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100';
        case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-yellow-100';
        case 'low': return 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100';
        default: return 'bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-200';
    }
}

/**
 * Parses a date from a task's text description using natural language.
 * Relies on getTodayDateString and getDateString from utils.js.
 * @param {string} text - The text to parse for a date.
 * @returns {{parsedDate: string|null, remainingText: string}} An object containing the parsed date
 * (in 'YYYY-MM-DD' format or null) and the text with the date phrase removed.
 */
function parseDateFromText(text) {
    // Ensure utils.js is loaded, providing getTodayDateString and getDateString
    if (typeof getTodayDateString !== 'function' || typeof getDateString !== 'function') {
        console.error("[TaskService] Date utility functions (getTodayDateString, getDateString) not found. Ensure utils.js is loaded.");
        return { parsedDate: null, remainingText: text };
    }

    let parsedDate = null;
    let remainingText = text;
    // Use UTC for date comparisons to avoid timezone issues with date-only strings
    const today = new Date(getTodayDateString() + 'T00:00:00Z');

    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const shortDaysOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

    // Order patterns from more specific/longer to more general to avoid premature matching.
    // Keywords like "on", "due", "by" are optional in the regex to make them more flexible.
    const patterns = [
        // Specific phrases like "next week", "next month", "next year"
        { regex: /\b(next week)\b/i, handler: () => {
            const nextWeek = new Date(today);
            const currentDay = today.getUTCDay(); // 0 (Sun) - 6 (Sat)
            const daysToMonday = currentDay === 0 ? 1 : (8 - currentDay); // Days to next Monday
            nextWeek.setUTCDate(today.getUTCDate() + daysToMonday + 6); // End of next week (Sunday) or specific day
            // Let's aim for Monday of next week for "next week"
            nextWeek.setUTCDate(today.getUTCDate() + (7 - today.getUTCDay() + 1) % 7 + (today.getUTCDay() === 0 ? 1:0) ); // Simplified: next Monday
             if (nextWeek <= today) nextWeek.setUTCDate(nextWeek.getUTCDate() + 7); // ensure it's in the future
            return getDateString(nextWeek);
        }},
        { regex: /\b(next month)\b/i, handler: () => {
            const nextMonthDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));
            return getDateString(nextMonthDate);
        }},
        { regex: /\b(next year)\b/i, handler: () => {
            const nextYearDate = new Date(Date.UTC(today.getUTCFullYear() + 1, 0, 1));
            return getDateString(nextYearDate);
        }},
        // Keywords with full dates: "on YYYY-MM-DD", "due MM/DD/YYYY"
        { regex: /\b(?:on|due|by)\s+(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})\b/i, handler: (match) => { // YYYY-MM-DD or YYYY/MM/DD
            const dateStr = match[1].replace(/\//g, '-');
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const year = parseInt(parts[0]);
                const month = parseInt(parts[1]);
                const day = parseInt(parts[2]);
                if (month < 1 || month > 12 || day < 1 || day > 31) return null;
                return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
            return null;
        }},
        { regex: /\b(?:on|due|by)\s+(\d{1,2}[-\/]\d{1,2}[-\/](\d{2,4}))\b/i, handler: (match) => { // MM/DD/YYYY or MM-DD-YY etc.
            const dateStr = match[1];
            const yearStr = match[2];
            const parts = dateStr.replace(/-/g, '/').split('/');
            let year = parseInt(yearStr);
            let month, day;
            if (parts.length === 3) { // Format is MM/DD/YYYY or DD/MM/YYYY
                 // Heuristic: if first part > 12, assume DD/MM
                if (parseInt(parts[0]) > 12 && parseInt(parts[1]) <= 12) { // DD/MM/YYYY
                    day = parseInt(parts[0]);
                    month = parseInt(parts[1]);
                } else { // Assume MM/DD/YYYY
                    month = parseInt(parts[0]);
                    day = parseInt(parts[1]);
                }
            } else { return null; }

            if (year < 100) year += 2000;
            if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) return null;
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }},
        // Days of the week: "next Monday", "Friday"
        { regex: new RegExp(`\\b(next\\s+)?(${daysOfWeek.join('|')}|${shortDaysOfWeek.join('|')})\\b`, 'i'), handler: (match) => {
            const dayName = match[2].toLowerCase();
            let targetDayIndex = daysOfWeek.indexOf(dayName);
            if (targetDayIndex === -1) targetDayIndex = shortDaysOfWeek.indexOf(dayName);
            if (targetDayIndex === -1) return null;

            const currentDayIndex = today.getUTCDay(); // 0 for Sunday, 1 for Monday, ...
            let daysToAdd = targetDayIndex - currentDayIndex;

            if (match[1] || daysToAdd <= 0) { // If "next" is specified, or if the day has passed or is today
                daysToAdd += 7;
            }
             // If it's today and "next" is not specified, make it next week.
            if (!match[1] && daysToAdd === 0) {
                daysToAdd = 7;
            }


            const targetDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + daysToAdd));
            return getDateString(targetDate);
        }},
        // Relative dates: "today", "tomorrow"
        { regex: /\b(today)\b/i, handler: () => getDateString(today) },
        { regex: /\b(tomorrow)\b/i, handler: () => {
            const tomorrow = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1));
            return getDateString(tomorrow);
        }},
        // Standalone dates (without keywords, try to match last)
        // YYYY-MM-DD or YYYY/MM/DD
        { regex: /\b(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})\b/i, handler: (match) => {
            const dateStr = match[1].replace(/\//g, '-');
             const parts = dateStr.split('-');
            if (parts.length === 3) {
                const year = parseInt(parts[0]);
                const month = parseInt(parts[1]);
                const day = parseInt(parts[2]);
                if (month < 1 || month > 12 || day < 1 || day > 31) return null;
                return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
            return null;
        }},
        // MM/DD/YYYY or MM/DD/YY (or DD/MM/...) - this is ambiguous, best effort
        { regex: /\b(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\b/i, handler: (match) => {
            const dateStr = match[1];
            const parts = dateStr.replace(/-/g, '/').split('/');
            let year, month, day;
            if (parts.length === 3) {
                year = parseInt(parts[2]);
                if (year < 100) year += 2000;
                // Ambiguity: MM/DD vs DD/MM. Common US is MM/DD.
                // If first part > 12, likely DD/MM.
                if (parseInt(parts[0]) > 12 && parseInt(parts[1]) <= 12) { // DD/MM/YYYY
                    day = parseInt(parts[0]);
                    month = parseInt(parts[1]);
                } else if (parseInt(parts[0]) <=12 && parseInt(parts[1]) <=31) { // Assume MM/DD/YYYY
                    month = parseInt(parts[0]);
                    day = parseInt(parts[1]);
                } else {
                    return null; // Unclear
                }
            } else { return null; }
            if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) return null;
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }},
        // MM/DD or M/D (assumes current year)
        { regex: /\b(\d{1,2}[-\/]\d{1,2})\b/i, handler: (match) => {
            const dateStr = match[1];
            const parts = dateStr.replace(/-/g, '/').split('/');
            let month, day;
            if (parts.length === 2) {
                 if (parseInt(parts[0]) > 12 && parseInt(parts[1]) <= 12) { // D/M
                    day = parseInt(parts[0]);
                    month = parseInt(parts[1]);
                } else if (parseInt(parts[0]) <=12 && parseInt(parts[1]) <=31) { // M/D
                    month = parseInt(parts[0]);
                    day = parseInt(parts[1]);
                } else {
                    return null;
                }
            } else { return null; }
            const year = today.getUTCFullYear();
            if (isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) return null;
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }}
    ];

    for (const pattern of patterns) {
        const regex = new RegExp(pattern.regex.source, pattern.regex.flags.replace('g', ''));
        let matchResult;
        let searchIndex = 0;

        // Create a version of the regex that includes optional leading/trailing spaces for boundary check
        const boundaryRegex = new RegExp(`(^|\\s)(${pattern.regex.source})(\\s|$)`, pattern.regex.flags.replace('g', ''));


        // Iterate through all matches in the string
        while((matchResult = regex.exec(remainingText.substring(searchIndex))) !== null) {
            const actualMatchIndexInSubstring = matchResult.index;
            const actualMatchIndexInFullText = actualMatchIndexInSubstring + searchIndex;
            const matchedString = matchResult[0];

            // Check boundary conditions more carefully
            const precedingChar = actualMatchIndexInFullText > 0 ? remainingText[actualMatchIndexInFullText - 1] : ' ';
            const followingCharIndex = actualMatchIndexInFullText + matchedString.length;
            const followingChar = followingCharIndex < remainingText.length ? remainingText[followingCharIndex] : ' ';

            // Ensure it's a whole word/phrase match (surrounded by spaces or start/end of string, or punctuation)
            const isProperBoundary = (precedingChar === ' ' || actualMatchIndexInFullText === 0 || /[,\.\?!;:]/.test(precedingChar)) &&
                                     (followingChar === ' ' || followingCharIndex === remainingText.length || /[,\.\?!;:]/.test(followingChar));

            if (isProperBoundary) {
                const potentialDate = pattern.handler(matchResult);
                if (potentialDate) {
                    const testDate = new Date(potentialDate + "T00:00:00Z"); // Test validity with UTC context
                    if (!isNaN(testDate.getTime())) {
                        parsedDate = potentialDate;
                        // Remove the matched phrase and associated keywords like "on", "due", "by"
                        // This part is tricky to get perfect without more advanced NLP.
                        // A simpler removal:
                        let prefixRegexStr = `(?:on|due|by|at|for)\\s+${matchedString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`;
                        let suffixRegexStr = `${matchedString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+(?:on|due|by|at|for)`; // less common
                        let standaloneRegexStr = matchedString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                        let tempRemainingText = remainingText;
                        // Try to remove with keyword first
                        let removed = false;
                        const keywordAndDateRegex = new RegExp(`\\b(?:on|due|by|at|for)\\s+${standaloneRegexStr}\\b`, 'i');
                        if (keywordAndDateRegex.test(tempRemainingText)) {
                            tempRemainingText = tempRemainingText.replace(keywordAndDateRegex, '');
                            removed = true;
                        }

                        if (!removed) { // If not removed with keyword, try standalone
                             const standaloneDateRegex = new RegExp(`\\b${standaloneRegexStr}\\b`, 'i');
                             if(standaloneDateRegex.test(tempRemainingText)){
                                tempRemainingText = tempRemainingText.replace(standaloneDateRegex, '');
                             }
                        }

                        remainingText = tempRemainingText.replace(/\s\s+/g, ' ').trim();
                        return { parsedDate, remainingText };
                    }
                }
            }
            searchIndex = actualMatchIndexInFullText + 1; // Move search past the current attempt
        }
    }
    return { parsedDate, remainingText };
}


// --- Placeholder for future Task specific CRUD operations ---
// Example:
// function addTask(taskData) {
//     // Logic to create a new task object
//     // tasks.unshift(newTask); // (tasks would be from store.js)
//     // saveTasks(); // (from store.js)
//     // return newTask;
// }

// function updateTask(taskId, taskUpdateData) {
//     // tasks = tasks.map(task => task.id === taskId ? { ...task, ...taskUpdateData } : task);
//     // saveTasks();
// }

// function deleteTask(taskId) {
//     // tasks = tasks.filter(task => task.id !== taskId);
//     // saveTasks();
// }

// If using ES6 modules later, export functions:
// export { getPriorityClass, parseDateFromText, addTask, updateTask, deleteTask };
