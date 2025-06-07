// taskService.js
// This file contains services related to task data and operations.
// It relies on AppStore for state management, FeatureFlagService, and utils.js.

import { getTodayDateString, getDateString } from './utils.js';
import AppStore from './store.js';
import { isFeatureEnabled } from './featureFlagService.js';
// NEW: Import LoggingService
import LoggingService from './loggingService.js';

export function getPriorityClass(priority) { //
    switch (priority) { //
        case 'high': return 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100'; //
        case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-yellow-100'; //
        case 'low': return 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100'; //
        default: return 'bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-200'; //
    }
}

export function parseDateFromText(text) { //
    let parsedDate = null; //
    let remainingText = text; //
    const today = new Date(getTodayDateString() + 'T00:00:00Z');  //
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]; //
    const shortDaysOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]; //
    const patterns = [  //
        { regex: /\b(next week)\b/i, handler: () => { const nextWeek = new Date(today); nextWeek.setUTCDate(today.getUTCDate() + (7 - today.getUTCDay() + 1) % 7 + (today.getUTCDay() === 0 ? 1:0) ); if (nextWeek <= today) nextWeek.setUTCDate(nextWeek.getUTCDate() + 7); return getDateString(nextWeek); }}, //
        { regex: /\b(next month)\b/i, handler: () => { const nextMonthDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1)); return getDateString(nextMonthDate); }}, //
        { regex: /\b(next year)\b/i, handler: () => { const nextYearDate = new Date(Date.UTC(today.getUTCFullYear() + 1, 0, 1)); return getDateString(nextYearDate); }}, //
        { regex: /\b(?:on|due|by)\s+(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})\b/i, handler: (match) => { const dateStr = match[1].replace(/\//g, '-'); const parts = dateStr.split('-'); if (parts.length === 3) { const year = parseInt(parts[0]); const month = parseInt(parts[1]); const day = parseInt(parts[2]); if (month < 1 || month > 12 || day < 1 || day > 31) return null; return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; } return null; }}, //
        { regex: /\b(?:on|due|by)\s+(\d{1,2}[-\/]\d{1,2}[-\/](\d{2,4}))\b/i, handler: (match) => { const dateStr = match[1]; const yearStr = match[2]; const parts = dateStr.replace(/-/g, '/').split('/'); let year = parseInt(yearStr); let month, day; if (parts.length === 3) { if (parseInt(parts[0]) > 12 && parseInt(parts[1]) <= 12) { day = parseInt(parts[0]); month = parseInt(parts[1]); } else { month = parseInt(parts[0]); day = parseInt(parts[1]); } } else { return null; } if (year < 100) year += 2000; if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) return null; return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; }}, //
        { regex: new RegExp(`\\b(next\\s+)?(${daysOfWeek.join('|')}|${shortDaysOfWeek.join('|')})\\b`, 'i'), handler: (match) => { const dayName = match[2].toLowerCase(); let targetDayIndex = daysOfWeek.indexOf(dayName); if (targetDayIndex === -1) targetDayIndex = shortDaysOfWeek.indexOf(dayName); if (targetDayIndex === -1) return null; const currentDayIndex = today.getUTCDay(); let daysToAdd = targetDayIndex - currentDayIndex; if (match[1] || daysToAdd <= 0) { daysToAdd += 7; } if (!match[1] && daysToAdd === 0) { daysToAdd = 7; } const targetDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + daysToAdd)); return getDateString(targetDate); }}, //
        { regex: /\b(today)\b/i, handler: () => getDateString(today) }, //
        { regex: /\b(tomorrow)\b/i, handler: () => { const tomorrow = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1)); return getDateString(tomorrow); }}, //
        { regex: /\b(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})\b/i, handler: (match) => { const dateStr = match[1].replace(/\//g, '-'); const parts = dateStr.split('-'); if (parts.length === 3) { const year = parseInt(parts[0]); const month = parseInt(parts[1]); const day = parseInt(parts[2]); if (month < 1 || month > 12 || day < 1 || day > 31) return null; return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; } return null; }}, //
        { regex: /\b(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\b/i, handler: (match) => { const dateStr = match[1]; const parts = dateStr.replace(/-/g, '/').split('/'); let year, month, day; if (parts.length === 3) { year = parseInt(parts[2]); if (year < 100) year += 2000; if (parseInt(parts[0]) > 12 && parseInt(parts[1]) <= 12) { day = parseInt(parts[0]); month = parseInt(parts[1]); } else if (parseInt(parts[0]) <=12 && parseInt(parts[1]) <=31) { month = parseInt(parts[0]); day = parseInt(parts[1]); } else { return null; } } else { return null; } if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) return null; return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; }}, //
        { regex: /\b(\d{1,2}[-\/]\d{1,2})\b/i, handler: (match) => { const dateStr = match[1]; const parts = dateStr.replace(/-/g, '/').split('/'); let month, day; if (parts.length === 2) { if (parseInt(parts[0]) > 12 && parseInt(parts[1]) <= 12) { day = parseInt(parts[0]); month = parseInt(parts[1]); } else if (parseInt(parts[0]) <=12 && parseInt(parts[1]) <=31) { month = parseInt(parts[0]); day = parseInt(parts[1]); } else { return null; } } else { return null; } const year = today.getUTCFullYear(); if (isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) return null; return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; }} //
    ]; //
    for (const pattern of patterns) { const regex = new RegExp(pattern.regex.source, pattern.regex.flags.replace('g', '')); let matchResult; let searchIndex = 0; while((matchResult = regex.exec(remainingText.substring(searchIndex))) !== null) { const actualMatchIndexInSubstring = matchResult.index; const actualMatchIndexInFullText = actualMatchIndexInSubstring + searchIndex; const matchedString = matchResult[0]; const precedingChar = actualMatchIndexInFullText > 0 ? remainingText[actualMatchIndexInFullText - 1] : ' '; const followingCharIndex = actualMatchIndexInFullText + matchedString.length; const followingChar = followingCharIndex < remainingText.length ? remainingText[followingCharIndex] : ' '; const isProperBoundary = (precedingChar === ' ' || actualMatchIndexInFullText === 0 || /[,\.\?!;:]/.test(precedingChar)) && (followingChar === ' ' || followingCharIndex === remainingText.length || /[,\.\?!;:]/.test(followingChar)); if (isProperBoundary) { const potentialDate = pattern.handler(matchResult); if (potentialDate) { const testDate = new Date(potentialDate + "T00:00:00Z"); if (!isNaN(testDate.getTime())) { parsedDate = potentialDate; let tempRemainingText = remainingText; const keywordAndDateRegex = new RegExp(`\\b(?:on|due|by|at|for)\\s+${matchedString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'); let removed = false; if (keywordAndDateRegex.test(tempRemainingText)) { tempRemainingText = tempRemainingText.replace(keywordAndDateRegex, ''); removed = true; } if (!removed) { const standaloneDateRegex = new RegExp(`\\b${matchedString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'); if(standaloneDateRegex.test(tempRemainingText)){ tempRemainingText = tempRemainingText.replace(standaloneDateRegex, '');}} remainingText = tempRemainingText.replace(/\s\s+/g, ' ').trim(); return { parsedDate, remainingText }; } } } searchIndex = actualMatchIndexInFullText + 1; } } //
    return { parsedDate, remainingText }; //
}

export function addTask(taskData) {
    // MODIFIED: Use LoggingService for error checks
    if (!AppStore) {
        LoggingService.error("[TaskService] AppStore not available for addTask.", new Error("AppStoreMissing"), { functionName: 'addTask' });
        return null;
    }
    let currentTasks = AppStore.getTasks(); //
    const currentKanbanColumns = AppStore.getKanbanColumns(); //
    const defaultKanbanColumn = currentKanbanColumns[0]?.id || 'todo'; //
    const newTask = { id: Date.now(), creationDate: Date.now(), completed: false, kanbanColumnId: defaultKanbanColumn, ...taskData, dueDate: taskData.dueDate || null, time: taskData.time || null, priority: taskData.priority || 'medium', label: taskData.label || '', notes: taskData.notes || '', projectId: typeof taskData.projectId === 'number' ? taskData.projectId : 0, isReminderSet: taskData.isReminderSet || false, reminderDate: taskData.reminderDate || null, reminderTime: taskData.reminderTime || null, reminderEmail: taskData.reminderEmail || null, estimatedHours: taskData.estimatedHours || 0, estimatedMinutes: taskData.estimatedMinutes || 0, timerStartTime: null, timerAccumulatedTime: 0, timerIsRunning: false, timerIsPaused: false, actualDurationMs: 0, attachments: taskData.attachments || [], completedDate: null, subTasks: taskData.subTasks || [], dependsOn: taskData.dependsOn || [], blocksTasks: taskData.blocksTasks || [] }; //
    currentTasks.unshift(newTask); //
    AppStore.setTasks(currentTasks); //
    // MODIFIED: Use LoggingService
    LoggingService.info("[TaskService] Task added.", { taskId: newTask.id, taskText: newTask.text, functionName: 'addTask' });
    return newTask; //
}

export function updateTask(taskId, taskUpdateData) {
    // MODIFIED: Use LoggingService for error checks
    if (!AppStore) {
        LoggingService.error("[TaskService] AppStore not available for updateTask.", new Error("AppStoreMissing"), { functionName: 'updateTask', taskId });
        return null;
    }
    let currentTasks = AppStore.getTasks(); //
    const taskIndex = currentTasks.findIndex(t => t.id === taskId); //
    if (taskIndex === -1) {
        // MODIFIED: Use LoggingService
        LoggingService.error(`[TaskService] Task with ID ${taskId} not found for update.`, new Error("TaskNotFound"), { functionName: 'updateTask', taskId });
        return null;
    }
    currentTasks[taskIndex] = { ...currentTasks[taskIndex], ...taskUpdateData }; //
    AppStore.setTasks(currentTasks); //
    // MODIFIED: Use LoggingService
    LoggingService.info(`[TaskService] Task updated: ${taskId}`, { taskId, updatedData: taskUpdateData, functionName: 'updateTask' });
    return currentTasks[taskIndex]; //
}

export function toggleTaskComplete(taskId) {
    // MODIFIED: Use LoggingService for error checks
    if (!AppStore || typeof isFeatureEnabled !== 'function') {
        const errorContext = { functionName: 'toggleTaskComplete', taskId };
        if (!AppStore) LoggingService.error("[TaskService] AppStore not available.", new Error("AppStoreMissing"), errorContext);
        if (typeof isFeatureEnabled !== 'function') LoggingService.error("[TaskService] isFeatureEnabled function not available.", new Error("isFeatureEnabledMissing"), errorContext);
        return null;
    }

    let currentTasks = AppStore.getTasks(); //
    const taskIndex = currentTasks.findIndex(t => t.id === taskId); //
    if (taskIndex === -1) {
        // MODIFIED: Use LoggingService
        LoggingService.error(`[TaskService] Task with ID ${taskId} not found for toggle complete.`, new Error("TaskNotFound"), { functionName: 'toggleTaskComplete', taskId });
        return null;
    }
    const taskToToggle = currentTasks[taskIndex]; //
    if (isFeatureEnabled('taskDependenciesFeature') && !taskToToggle.completed) {  //
        if (taskToToggle.dependsOn && taskToToggle.dependsOn.length > 0) { //
            const incompleteDependencies = taskToToggle.dependsOn.some(depId => { //
                const dependentTask = currentTasks.find(t => t.id === depId); //
                return dependentTask && !dependentTask.completed; //
            });
            if (incompleteDependencies) {
                // MODIFIED: Use LoggingService
                LoggingService.warn(`[TaskService] Cannot complete task ${taskId}. It has incomplete dependencies.`, { functionName: 'toggleTaskComplete', taskId, dependencies: taskToToggle.dependsOn });
                return { ...taskToToggle, _blocked: true }; //
            }
        }
    }
    currentTasks[taskIndex].completed = !currentTasks[taskIndex].completed; //
    currentTasks[taskIndex].completedDate = currentTasks[taskIndex].completed ? Date.now() : null; //
    if (isFeatureEnabled('kanbanBoardFeature')) {  //
        const currentKanbanColumns = AppStore.getKanbanColumns(); //
        if (currentTasks[taskIndex].completed) { const doneColumn = currentKanbanColumns.find(col => col.id === 'done'); if (doneColumn) currentTasks[taskIndex].kanbanColumnId = doneColumn.id; //
        } else if (currentTasks[taskIndex].kanbanColumnId === 'done') { const defaultColumn = currentKanbanColumns[0]?.id || 'todo'; currentTasks[taskIndex].kanbanColumnId = defaultColumn; } //
    }
    if (isFeatureEnabled('taskTimerSystem') && window.AppFeatures?.TaskTimerSystem?.handleTaskCompletion) { //
        window.AppFeatures.TaskTimerSystem.handleTaskCompletion(taskId, currentTasks[taskIndex].completed); //
    }
    AppStore.setTasks(currentTasks); //
    // MODIFIED: Use LoggingService
    LoggingService.info(`[TaskService] Task ${taskId} completion toggled to: ${currentTasks[taskIndex].completed}`, { functionName: 'toggleTaskComplete', taskId, newStatus: currentTasks[taskIndex].completed });
    return currentTasks[taskIndex]; //
}

export function deleteTaskById(taskId) {
    // MODIFIED: Use LoggingService for error checks
    if (!AppStore || typeof isFeatureEnabled !== 'function') {
        const errorContext = { functionName: 'deleteTaskById', taskId };
        if (!AppStore) LoggingService.error("[TaskService] AppStore not available.", new Error("AppStoreMissing"), errorContext);
        if (typeof isFeatureEnabled !== 'function') LoggingService.error("[TaskService] isFeatureEnabled function not available.", new Error("isFeatureEnabledMissing"), errorContext);
        return false;
    }

    let currentTasks = AppStore.getTasks(); //
    const initialLength = currentTasks.length; //
    let updatedTasks = currentTasks.filter(task => task.id !== taskId); //

    if (isFeatureEnabled('taskDependenciesFeature')) {  //
        updatedTasks = updatedTasks.map(task => { //
            const newDependsOn = task.dependsOn ? task.dependsOn.filter(id => id !== taskId) : []; //
            const newBlocksTasks = task.blocksTasks ? task.blocksTasks.filter(id => id !== taskId) : []; //
            return { ...task, dependsOn: newDependsOn, blocksTasks: newBlocksTasks }; //
        });
    }

    if (updatedTasks.length < initialLength) { //
        AppStore.setTasks(updatedTasks); //
        // MODIFIED: Use LoggingService
        LoggingService.info(`[TaskService] Task ${taskId} deleted.`, { functionName: 'deleteTaskById', taskId });
        return true; //
    }
    // MODIFIED: Use LoggingService
    LoggingService.warn(`[TaskService] Task ${taskId} not found for deletion.`, { functionName: 'deleteTaskById', taskId });
    return false; //
}

// REMOVED: LoggingService.debug("taskService.js loaded as ES6 module.", { module: 'taskService' });
// console.log("taskService.js module parsed and functions defined."); // Optional