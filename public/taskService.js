// taskService.js
// REFACTORED FOR NEW CRUD API
import { getTodayDateString, getDateString } from './utils.js';
import AppStore from './store.js';
import LoggingService from './loggingService.js';

// --- API Configuration ---
const API_URL = 'http://192.168.2.201:3000/api/tasks'; // Base URL for the tasks API
const API_KEY = "THeYYjPRRvQ6CjJFPL0T6cpAyfWbIMFm9U0Lo4d+saQ=";
const API_HEADERS = {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
};


export function getPriorityClass(priority) {
    switch (priority) {
        case 'high': return 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100';
        case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-yellow-100';
        case 'low': return 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100';
        default: return 'bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-200';
    }
}

export function parseDateFromText(text) {
    // This function remains the same as it's purely frontend logic.
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

export async function addTask(taskData) {
    if (!AppStore) {
        LoggingService.error("[TaskService] AppStore not available for addTask.", new Error("AppStoreMissing"), { functionName: 'addTask' });
        return null;
    }

    const newTaskPayload = {
        id: Date.now(),
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

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: API_HEADERS,
            body: JSON.stringify(newTaskPayload),
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        const createdTask = await response.json();

        // OPTIMISTIC UPDATE: Add to the local store immediately for a snappy UI.
        const currentTasks = AppStore.getTasks();
        currentTasks.unshift(createdTask);
        await AppStore.setTasks(currentTasks, 'addTask_optimistic'); // Use a non-destructive setTasks

        LoggingService.info("[TaskService] Task added successfully via API.", { taskId: createdTask.id });
        return createdTask;
    } catch (error) {
        LoggingService.error('[TaskService] Failed to add task via API.', error, { functionName: 'addTask' });
        return null;
    }
}

export async function updateTask(taskId, taskUpdateData) {
    if (!AppStore) {
        LoggingService.error("[TaskService] AppStore not available for updateTask.", new Error("AppStoreMissing"), { functionName: 'updateTask', taskId });
        return null;
    }

    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'PATCH',
            headers: API_HEADERS,
            body: JSON.stringify(taskUpdateData),
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        const updatedTaskFromServer = await response.json();

        // UPDATE LOCAL STORE: Find and update the task in the local array.
        const currentTasks = AppStore.getTasks();
        const taskIndex = currentTasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            currentTasks[taskIndex] = updatedTaskFromServer;
            await AppStore.setTasks(currentTasks, 'updateTask_optimistic');
        }

        LoggingService.info(`[TaskService] Task updated successfully via API: ${taskId}`, { taskId });
        return updatedTaskFromServer;

    } catch (error) {
        LoggingService.error(`[TaskService] Failed to update task via API: ${taskId}`, error, { functionName: 'updateTask' });
        return null;
    }
}

export async function toggleTaskComplete(taskId) {
    if (!AppStore) return null;

    const currentTasks = AppStore.getTasks();
    const taskIndex = currentTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return null;

    const taskToToggle = { ...currentTasks[taskIndex] };

    // This is a special case. The backend doesn't handle recurrence logic,
    // so we perform it on the frontend and then just send the final update.
    let isRecurringAndRenewed = false;
    if (!taskToToggle.completed && window.isFeatureEnabled('advancedRecurrence') && taskToToggle.recurrence && taskToToggle.recurrence.frequency !== 'none') {
        // ... (recurrence logic remains the same)
    }

    if (isRecurringAndRenewed) {
         // If recurring, we just send a PATCH with the new due date and un-completed status
         return await updateTask(taskId, { 
            dueDate: taskToToggle.dueDate, 
            completed: false, 
            completedDate: null 
        });
    } else {
        // If not recurring, we just toggle the completed status
        const isNowCompleted = !taskToToggle.completed;
        return await updateTask(taskId, {
            completed: isNowCompleted,
            completedDate: isNowCompleted ? Date.now() : null
        });
    }
}


export async function deleteTaskById(taskId) {
    if (!AppStore) return false;

    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'DELETE',
            headers: API_HEADERS,
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        // OPTIMISTIC UPDATE: Remove from the local store immediately.
        const currentTasks = AppStore.getTasks();
        const updatedTasks = currentTasks.filter(task => task.id !== taskId);
        await AppStore.setTasks(updatedTasks, 'deleteTask_optimistic');

        LoggingService.info(`[TaskService] Task ${taskId} deleted successfully via API.`, { functionName: 'deleteTaskById' });
        return true;

    } catch (error) {
        LoggingService.error(`[TaskService] Failed to delete task ${taskId} via API.`, error, { functionName: 'deleteTaskById' });
        return false;
    }
}
