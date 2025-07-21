// timeTrackerService.js
// Manages logic for the time tracker feature, using AppStore for core data
// and localStorage for the transient active timer state.

import LoggingService from './loggingService.js';
import AppStore from './store.js';

const ACTIVE_TIMER_KEY = 'timeTracker_active_timer_v1';

// --- Internal State ---
let _activeTimer = null; // This remains managed by localStorage for efficiency.

// --- Private Helper Functions ---

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

function _getTodaysEntries() {
    if (!AppStore) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return AppStore.getTimeLogEntries().filter(entry => new Date(entry.startTime) >= today);
}

// --- Public API ---

function getTodaysTotalTrackedMs() {
    return _getTodaysEntries().reduce((total, entry) => total + entry.durationMs, 0);
}

function fetchLogEntriesForDateRange(startDate, endDate) {
    if (!AppStore) return [];
    // Now synchronous
    return AppStore.getTimeLogEntries().filter(entry => {
        const entryDate = new Date(entry.startTime);
        return entryDate >= startDate && entryDate <= endDate;
    });
}

function addActivity(activityData) {
    const functionName = 'addActivity (TimeTrackerService)';
    if (!AppStore) return;
    const activities = AppStore.getTimeActivities();
    const newActivity = {
        id: `activity_${Date.now()}`,
        ...activityData,
        createdAt: new Date().toISOString()
    };
    activities.push(newActivity);
    AppStore.setTimeActivities(activities, functionName);
}

function deleteActivity(activityId) {
    const functionName = 'deleteActivity (TimeTrackerService)';
    if (!AppStore) return;
    AppStore.deleteTimeActivity(activityId, functionName);
}

function stopTracking() {
    const functionName = 'stopTracking (TimeTrackerService)';
    if (!_activeTimer || !AppStore) return;
    let logEntries = AppStore.getTimeLogEntries();

    const newLogEntry = {
        id: `log_${Date.now()}`,
        activityId: _activeTimer.activityId,
        startTime: _activeTimer.startTime,
        endTime: new Date(),
        notes: _activeTimer.notes || '',
        manuallyAdded: false
    };
    newLogEntry.durationMs = newLogEntry.endTime.getTime() - newLogEntry.startTime.getTime();

    logEntries.unshift(newLogEntry);
    AppStore.setTimeLogEntries(logEntries, functionName);

    _activeTimer = null;
    _saveActiveTimer();
}

function addLogEntry(logData) {
    const functionName = 'addLogEntry (TimeTrackerService)';
    if (!AppStore) return;
    let logEntries = AppStore.getTimeLogEntries();

    const newLog = {
        id: `log_${Date.now()}`,
        activityId: logData.activityId,
        startTime: new Date(logData.startTime),
        endTime: new Date(logData.endTime),
        notes: logData.notes || '',
        durationMs: new Date(logData.endTime).getTime() - new Date(logData.startTime).getTime(),
        manuallyAdded: true
    };
    logEntries.unshift(newLog);
    logEntries.sort((a,b) => new Date(b.startTime) - new Date(a.startTime)); // Keep sorted
    AppStore.setTimeLogEntries(logEntries, functionName);
}

function updateLogEntry(logId, updatedData) {
    const functionName = 'updateLogEntry (TimeTrackerService)';
    if (!AppStore) return;
    let logEntries = AppStore.getTimeLogEntries();
    const logIndex = logEntries.findIndex(log => log.id === logId);
    if (logIndex === -1) {
        LoggingService.error(`Log entry with ID ${logId} not found`, new Error("LogNotFound"), { functionName });
        return;
    }

    const existingLog = logEntries[logIndex];
    const newStartTime = updatedData.startTime ? new Date(updatedData.startTime) : existingLog.startTime;
    const newEndTime = updatedData.endTime ? new Date(updatedData.endTime) : existingLog.endTime;

    logEntries[logIndex] = {
        ...existingLog,
        ...updatedData,
        startTime: newStartTime,
        endTime: newEndTime,
        durationMs: newEndTime.getTime() - newStartTime.getTime()
    };
    AppStore.setTimeLogEntries(logEntries, functionName);
}

function deleteLogEntry(logId) {
    const functionName = 'deleteLogEntry (TimeTrackerService)';
    if (!AppStore) return;
    let logEntries = AppStore.getTimeLogEntries();
    const updatedEntries = logEntries.filter(log => log.id !== logId);
    AppStore.setTimeLogEntries(updatedEntries, functionName);
}

function getActivities() { return AppStore ? AppStore.getTimeActivities() : []; }
function getLogEntries() { return AppStore ? AppStore.getTimeLogEntries() : []; }
function getActiveTimer() { return _activeTimer ? { ..._activeTimer } : null; }

function startTracking(activityId) {
    if (_activeTimer && _activeTimer.activityId === activityId) return;
    if (_activeTimer) {
        // This will save the previous timer before starting a new one
        stopTracking();
    }
    const activity = AppStore.getTimeActivities().find(a => a.id === activityId);
    if (!activity) {
        LoggingService.warn('[TimeTrackerService] Attempted to start tracking for non-existent activity ID:', { activityId });
        return;
    }
    _activeTimer = {
        activityId: activityId,
        startTime: new Date(),
        notes: '' // Reset notes for new timer
    };
    _saveActiveTimer();
    LoggingService.info(`[TimeTrackerService] Started tracking activity: ${activity.name}`, { activeTimer: _activeTimer });
    return getActiveTimer();
}

function initialize() {
    _loadActiveTimer(); // Load transient state from localStorage
    LoggingService.info('[TimeTrackerService] Initialized. Active timer loaded. Core data sourced from AppStore.', {
        functionName: 'initialize (TimeTrackerService)'
    });
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