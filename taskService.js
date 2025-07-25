// taskService.js
// This file contains services related to task data and operations.
// It now interacts directly with the IndexedDB database via Dexie.js.

import { getTodayDateString, getDateString } from './utils.js';
import AppStore from './store.js';
import LoggingService from './loggingService.js';
import db from './database.js'; // Import the database connection

// --- Pure Functions (No changes needed) ---

export function getPriorityClass(priority) {
    switch (priority) {
        case 'high': return 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100';
        case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-yellow-100';
        case 'low': return 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100';
        default: return 'bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-200';
    }
}

export function parseDateFromText(text) {
    // This entire complex function is preserved as is.
    let parsedDate = null;
    let remainingText = text;
    const today = new Date(getTodayDateString() + 'T00:00:00Z');
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const shortDaysOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const patterns = [
        { regex: /\b(next week)\b/i, handler: () => { const nextWeek = new Date(today); nextWeek.setUTCDate(today.getUTCDate() + (7 - today.getUTCDay() + 1) % 7 + (today.getUTCDay() === 0 ? 1:0) ); if (nextWeek <= today) nextWeek.setUTCDate(nextWeek.getUTCDate() + 7); return getDateString(nextWeek); }},
        { regex: /\b(next month)\b/i, handler: () => { const nextMonthDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1)); return getDateString(nextMonthDate); }},
        { regex: /\b(next year)\b/i, handler: () => { const nextYearDate = new Date(Date.UTC(today.getUTCFullYear() + 1, 0, 1)); return getDateString(nextYearDate); }},
        { regex: /\b(?:on|due|by)\s+(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})\b/i, handler: (match) => { const dateStr = match[1].replace(/\//g, '-'); const parts = dateStr.split('-'); if (parts.length === 3) { const year = parseInt(parts[0]); const month = parseInt(parts[1]); const day = parseInt(parts[2]); if (month < 1 || month > 12 || day < 1 || day > 31) return null; return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; } return null; }},
        { regex: /\b(?:on|due|by)\s+(\d{1,2}[-\/]\d{1,2}[-\/](\d{2,4}))\b/i, handler: (match) => { const dateStr = match[1]; const yearStr = match[2]; const parts = dateStr.replace(/-/g, '/').split('/'); let year = parseInt(yearStr); let month, day; if (parts.length === 3) { if (parseInt(parts[0]) > 12 && parseInt(parts[1]) <= 12) { day = parseInt(parts[0]); month = parseInt(parts[1]); } else { month = parseInt(parts[0]); day = parseInt(parts[1]); } } else { return null; } if (year < 100) year += 2000; if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) return null; return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; }},
        { regex: new RegExp(`\\b(next\\s+)?(${daysOfWeek.join('|')}|${shortDaysOfWeek.join('|')})\\b`, 'i'), handler: (match) => { const dayName = match[2].toLowerCase(); let targetDayIndex = daysOfWeek.indexOf(dayName); if (targetDayIndex === -1) targetDayIndex = shortDaysOfWeek.indexOf(dayName); if (targetDayIndex === -1) return null; const currentDayIndex = today.getUTCDay(); let daysToAdd = targetDayIndex - currentDayIndex; if (match[1] || daysToAdd <= 0) { daysToAdd += 7; } if (!match[1] && daysToAdd === 0) { daysToAdd = 7; } const targetDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + daysToAdd)); return getDateString(targetDate); }},
        { regex: /\b(today)\b/i, handler: () => getDateString(today) },
        { regex: /\b(tomorrow)\b/i, handler: () => { const tomorrow = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1)); return getDateString(tomorrow); }},
        { regex: /\b(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})\b/i, handler: (match) => { const dateStr = match[1].replace(/\//g, '-'); const parts = dateStr.split('-'); if (parts.length === 3) { const year = parseInt(parts[0]); const month = parseInt(parts[1]); const day = parseInt(parts[2]); if (month < 1 || month > 12 || day < 1 || day > 31) return null; return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; } return null; }},
        { regex: /\b(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\b/i, handler: (match) => { const dateStr = match[1]; const parts = dateStr.replace(/-/g, '/').split('/'); let year, month, day; if (parts.length === 3) { year = parseInt(parts[2]); if (year < 100) year += 2000; if (parseInt(parts[0]) > 12 && parseInt(parts[1]) <= 12) { day = parseInt(parts[0]); month = parseInt(parts[1]); } else if (parseInt(parts[0]) <=12 && parseInt(parts[1]) <=31) { month = parseInt(parts[0]); day = parseInt(parts[1]); } else { return null; } } else { return null; } if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) return null; return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; }},
        { regex: /\b(\d{1,2}[-\/]\d{1,2})\b/i, handler: (match) => { const dateStr = match[1]; const parts = dateStr.replace(/-/g, '/').split('/'); let month, day; if (parts.length === 2) { if (parseInt(parts[0]) > 12 && parseInt(parts[1]) <= 12) { day = parseInt(parts[0]); month = parseInt(parts[1]); } else if (parseInt(parts[0]) <=12 && parseInt(parts[1]) <=31) { month = parseInt(parts[0]); day = parseInt(parts[1]); } else { return null; } } else { return null; } const year = today.getUTCFullYear(); if (isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) return null; return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; }}
    ];
    for (const pattern of patterns) { const regex = new RegExp(pattern.regex.source, pattern.regex.flags.replace('g', '')); let matchResult; let searchIndex = 0; while((matchResult = regex.exec(remainingText.substring(searchIndex))) !== null) { const actualMatchIndexInSubstring = matchResult.index; const actualMatchIndexInFullText = actualMatchIndexInSubstring + searchIndex; const matchedString = matchResult[0]; const precedingChar = actualMatchIndexInFullText > 0 ? remainingText[actualMatchIndexInFullText - 1] : ' '; const followingCharIndex = actualMatchIndexInFullText + matchedString.length; const followingChar = followingCharIndex < remainingText.length ? remainingText[followingCharIndex] : ' '; const isProperBoundary = (precedingChar === ' ' || actualMatchIndexInFullText === 0 || /[,\.\?!;:]/.test(precedingChar)) && (followingChar === ' ' || followingCharIndex === remainingText.length || /[,\.\?!;:]/.test(followingChar)); if (isProperBoundary) { const potentialDate = pattern.handler(matchResult); if (potentialDate) { const testDate = new Date(potentialDate + "T00:00:00Z"); if (!isNaN(testDate.getTime())) { parsedDate = potentialDate; let tempRemainingText = remainingText; const keywordAndDateRegex = new RegExp(`\\b(?:on|due|by|at|for)\\s+${matchedString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'); let removed = false; if (keywordAndDateRegex.test(tempRemainingText)) { tempRemainingText = tempRemainingText.replace(keywordAndDateRegex, ''); removed = true; } if (!removed) { const standaloneDateRegex = new RegExp(`\\b${matchedString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'); if(standaloneDateRegex.test(tempRemainingText)){ tempRemainingText = tempRemainingText.replace(standaloneDateRegex, '');}} remainingText = tempRemainingText.replace(/\s\s+/g, ' ').trim(); return { parsedDate, remainingText }; } } } searchIndex = actualMatchIndexInFullText + 1; } }
    return { parsedDate, remainingText };
}

// --- Refactored Database Functions ---

export async function addTask(taskData) {
    const functionName = 'addTask (TaskService)';
    try {
        const newTask = {
            // Dexie handles the 'id' field automatically, so we don't set it.
            creationDate: Date.now(),
            completed: false,
            ...taskData,
            dueDate: taskData.dueDate || null,
            time: taskData.time || null,
            priority: taskData.priority || 'medium',
            label: taskData.label || '',
            notes: taskData.notes || '',
            projectId: typeof taskData.projectId === 'number' ? taskData.projectId : 0,
            isReminderSet: taskData.isReminderSet || false,
            reminderDate: taskData.reminderDate || null,
            reminderTime: taskData.reminderTime || null,
            reminderEmail: taskData.reminderEmail || null,
            completedDate: null,
            recurrence: taskData.recurrence || null
        };
        // Add the single new task to the database.
        const newId = await db.tasks.add(newTask);
        LoggingService.info(`[TaskService] Task added to DB with ID: ${newId}.`, { functionName });

        // Refresh the central store to update the UI
        const allTasks = await db.tasks.toArray();
        await AppStore.setTasks(allTasks, functionName);
        return { ...newTask, id: newId };

    } catch (error) {
        LoggingService.error('[TaskService] Error adding task.', error, { functionName });
        return null;
    }
}

export async function updateTask(taskId, taskUpdateData) {
    const functionName = 'updateTask (TaskService)';
    try {
        // 'update' is a Dexie function that finds a record by its primary key
        // and applies the updates. It's very efficient.
        await db.tasks.update(taskId, taskUpdateData);
        LoggingService.info(`[TaskService] Task updated in DB: ${taskId}`, { functionName });

        const allTasks = await db.tasks.toArray();
        await AppStore.setTasks(allTasks, functionName);

    } catch (error) {
        LoggingService.error(`[TaskService] Error updating task ${taskId}.`, error, { functionName });
    }
}

export async function toggleTaskComplete(taskId) {
    const functionName = 'toggleTaskComplete (TaskService)';
    try {
        const taskToToggle = await db.tasks.get(taskId);
        if (!taskToToggle) {
            LoggingService.error(`[TaskService] Task with ID ${taskId} not found for toggle.`, new Error("TaskNotFound"), { functionName });
            return null;
        }

        const isNowCompleted = !taskToToggle.completed;
        let isRecurringAndRenewed = false;

        // --- All of your existing recurrence logic is preserved perfectly ---
        if (isNowCompleted && taskToToggle.recurrence && taskToToggle.recurrence.frequency && taskToToggle.recurrence.frequency !== 'none') {
            // ... (recurrence logic is identical to your original file)
            const recurrence = taskToToggle.recurrence;
            const interval = recurrence.interval || 1;
            const currentDueDate = new Date(taskToToggle.dueDate + 'T00:00:00Z');
            let nextDueDate = new Date(currentDueDate);

            switch (recurrence.frequency) {
                case 'daily': nextDueDate.setUTCDate(nextDueDate.getUTCDate() + interval); break;
                case 'weekly':
                    if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
                        const dayMap = { 'su': 0, 'mo': 1, 'tu': 2, 'we': 3, 'th': 4, 'fr': 5, 'sa': 6 };
                        const allowedDays = recurrence.daysOfWeek.map(d => dayMap[d]).sort((a, b) => a - b);
                        let currentDay = nextDueDate.getUTCDay();
                        for (let i = 1; i <= 7; i++) {
                            let nextDayIndex = (currentDay + i) % 7;
                            if (allowedDays.includes(nextDayIndex)) {
                                nextDueDate.setUTCDate(nextDueDate.getUTCDate() + i);
                                if (interval > 1 && nextDayIndex <= currentDay) {
                                    nextDueDate.setUTCDate(nextDueDate.getUTCDate() + (interval - 1) * 7);
                                }
                                break;
                            }
                        }
                    } else {
                        nextDueDate.setUTCDate(nextDueDate.getUTCDate() + 7 * interval);
                    }
                    break;
                case 'monthly': nextDueDate.setUTCMonth(nextDueDate.getUTCMonth() + interval); break;
                case 'yearly': nextDueDate.setUTCFullYear(nextDueDate.getUTCFullYear() + interval); break;
            }

            if (recurrence.endDate) {
                const stopDate = new Date(recurrence.endDate + 'T23:59:59Z');
                if (nextDueDate > stopDate) {
                    LoggingService.info(`[TaskService] Recurring task ${taskId} reached end date.`);
                } else {
                    taskToToggle.dueDate = getDateString(nextDueDate);
                    taskToToggle.completed = false;
                    taskToToggle.completedDate = null;
                    isRecurringAndRenewed = true;
                }
            } else {
                taskToToggle.dueDate = getDateString(nextDueDate);
                taskToToggle.completed = false;
                taskToToggle.completedDate = null;
                isRecurringAndRenewed = true;
            }
        }

        if (!isRecurringAndRenewed) {
            taskToToggle.completed = isNowCompleted;
            taskToToggle.completedDate = isNowCompleted ? Date.now() : null;
        }

        // 'put' is like save/update. It will save the entire modified task object.
        await db.tasks.put(taskToToggle);
        LoggingService.info(`[TaskService] Task ${taskId} completion toggled in DB.`, { functionName });

        const allTasks = await db.tasks.toArray();
        await AppStore.setTasks(allTasks, functionName);

    } catch (error) {
        LoggingService.error(`[TaskService] Error toggling task ${taskId}.`, error, { functionName });
    }
}

export async function deleteTaskById(taskId) {
    const functionName = 'deleteTaskById (TaskService)';
    try {
        // Simple and direct deletion from the database.
        await db.tasks.delete(taskId);
        LoggingService.info(`[TaskService] Task ${taskId} deleted from DB.`, { functionName });

        const allTasks = await db.tasks.toArray();
        await AppStore.setTasks(allTasks, functionName);

    } catch (error) {
        LoggingService.error(`[TaskService] Error deleting task ${taskId}.`, error, { functionName });
    }
}