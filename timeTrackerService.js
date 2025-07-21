// timeTrackerService.js
// Manages logic for the time tracker feature, using IndexedDB for core data
// and localStorage for the transient active timer state.

import LoggingService from './loggingService.js';
import AppStore from './store.js';
import db from './database.js'; // Import the database connection

const ACTIVE_TIMER_KEY = 'timeTracker_active_timer_v1';

// --- Internal State ---
let _activeTimer = null; // This remains managed by localStorage for efficiency.

// --- Private Helper Functions (for active timer) ---
// This logic for the active timer does not need to change.
function _loadActiveTimer() {
    try {
        const storedTimer = localStorage.getItem(ACTIVE_TIMER_KEY);
        _activeTimer = storedTimer ? JSON.parse(storedTimer) : null;
        if (_activeTimer) {
            _activeTimer.startTime = new Date(_activeTimer.startTime);
        }
    } catch (error) {
        LoggingService.error('[TimeTrackerService] Error loading active timer from localStorage.', error);
        _activeTimer = null;
    }
}

function _saveActiveTimer() {
    try {
        if (_activeTimer) {
            localStorage.setItem(ACTIVE_TIMER_KEY, JSON.stringify(_activeTimer));
        } else {
            localStorage.removeItem(ACTIVE_TIMER_KEY);
        }
    } catch (error) {
        LoggingService.error('[TimeTrackerService] Error saving active timer to localStorage.', error);
    }
}

// --- Public API ---

async function getTodaysTotalTrackedMs() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Query the database for entries greater than or equal to the start of today
    const todaysEntries = await db.time_log_entries
        .where('startTime').aboveOrEqual(today)
        .toArray();

    return todaysEntries.reduce((total, entry) => total + entry.durationMs, 0);
}

async function fetchLogEntriesForDateRange(startDate, endDate) {
    // Query the database directly for the specified range.
    return await db.time_log_entries
        .where('startTime').between(startDate, endDate)
        .toArray();
}

async function addActivity(activityData) {
    const functionName = 'addActivity (TimeTrackerService)';
    try {
        const newActivity = {
            ...activityData,
            createdAt: new Date().toISOString()
        };
        await db.time_activities.add(newActivity);
        const allActivities = await db.time_activities.toArray();
        await AppStore.setTimeActivities(allActivities);
    } catch (error) {
        LoggingService.error(`[${functionName}] Error`, error);
    }
}

async function deleteActivity(activityId) {
    const functionName = 'deleteActivity (TimeTrackerService)';
    try {
        await AppStore.deleteTimeActivity(activityId, functionName); // The logic in store.js is already transactional
    } catch (error) {
        LoggingService.error(`[${functionName}] Error`, error);
    }
}

async function stopTracking() {
    const functionName = 'stopTracking (TimeTrackerService)';
    if (!_activeTimer) return;

    try {
        const newLogEntry = {
            activityId: _activeTimer.activityId,
            startTime: _activeTimer.startTime,
            endTime: new Date(),
            notes: _activeTimer.notes || '',
            manuallyAdded: false
        };
        newLogEntry.durationMs = newLogEntry.endTime.getTime() - newLogEntry.startTime.getTime();

        await db.time_log_entries.add(newLogEntry);

        _activeTimer = null;
        _saveActiveTimer();

        const allEntries = await db.time_log_entries.toArray();
        await AppStore.setTimeLogEntries(allEntries);

    } catch (error) {
        LoggingService.error(`[${functionName}] Error`, error);
    }
}

async function addLogEntry(logData) {
    const functionName = 'addLogEntry (TimeTrackerService)';
    try {
        const newLog = {
            activityId: logData.activityId,
            startTime: new Date(logData.startTime),
            endTime: new Date(logData.endTime),
            notes: logData.notes || '',
            durationMs: new Date(logData.endTime).getTime() - new Date(logData.startTime).getTime(),
            manuallyAdded: true
        };
        await db.time_log_entries.add(newLog);
        const allEntries = await db.time_log_entries.toArray();
        await AppStore.setTimeLogEntries(allEntries);
    } catch (error) {
        LoggingService.error(`[${functionName}] Error`, error);
    }
}

async function updateLogEntry(logId, updatedData) {
    const functionName = 'updateLogEntry (TimeTrackerService)';
    try {
        const updatePayload = { ...updatedData };
        // Recalculate duration if start/end times have changed
        if (updatedData.startTime || updatedData.endTime) {
            const existingLog = await db.time_log_entries.get(logId);
            const newStartTime = updatedData.startTime ? new Date(updatedData.startTime) : existingLog.startTime;
            const newEndTime = updatedData.endTime ? new Date(updatedData.endTime) : existingLog.endTime;
            updatePayload.startTime = newStartTime;
            updatePayload.endTime = newEndTime;
            updatePayload.durationMs = newEndTime.getTime() - newStartTime.getTime();
        }
        await db.time_log_entries.update(logId, updatePayload);
        const allEntries = await db.time_log_entries.toArray();
        await AppStore.setTimeLogEntries(allEntries);
    } catch (error) {
        LoggingService.error(`[${functionName}] Error`, error);
    }
}

async function deleteLogEntry(logId) {
    const functionName = 'deleteLogEntry (TimeTrackerService)';
    try {
        await db.time_log_entries.delete(logId);
        const allEntries = await db.time_log_entries.toArray();
        await AppStore.setTimeLogEntries(allEntries);
    } catch (error) {
        LoggingService.error(`[${functionName}] Error`, error);
    }
}

// Getters for UI still read from the fast cache in AppStore
function getActivities() { return AppStore ? AppStore.getTimeActivities() : []; }
function getLogEntries() { return AppStore ? AppStore.getLogEntries() : []; }
function getActiveTimer() { return _activeTimer ? { ..._activeTimer } : null; }

async function startTracking(activityId) {
    if (_activeTimer && _activeTimer.activityId === activityId) return;
    if (_activeTimer) {
        await stopTracking();
    }
    const activity = await db.time_activities.get(activityId);
    if (!activity) {
        LoggingService.warn('[TimeTrackerService] Attempted to start tracking for non-existent activity ID:', { activityId });
        return;
    }
    _activeTimer = {
        activityId: activityId,
        startTime: new Date(),
        notes: ''
    };
    _saveActiveTimer();
    return getActiveTimer();
}

function initialize() {
    _loadActiveTimer(); // Load transient state from localStorage
    LoggingService.info('[TimeTrackerService] Initialized.');
}

const TimeTrackerService = {
    initialize,
    fetchLogEntriesForDateRange,
    getTodaysTotalTrackedMs,
    addActivity,
    deleteActivity,
    getActivities,
    getLogEntries,
    getActiveTimer,
    startTracking,
    stopTracking,
    addLogEntry,
    updateLogEntry,
    deleteLogEntry
};

export default TimeTrackerService;