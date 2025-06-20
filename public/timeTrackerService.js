// timeTrackerService.js
// Manages logic for the time tracker feature, using AppStore for core data
// and localStorage for the transient active timer state.

import LoggingService from './loggingService.js';
import AppStore from './store.js';
import EventBus from './eventBus.js';

const ACTIVE_TIMER_KEY = 'timeTracker_active_timer_v1';

// --- Internal State ---
let _activeTimer = null; // This remains managed by localStorage for efficiency

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

function streamActivities(onUpdate) {
    if (typeof onUpdate === 'function' && AppStore) {
        onUpdate(AppStore.getTimeActivities());
    }
}

function streamLogEntries(startDate, onUpdate) {
     if (typeof onUpdate === 'function' && AppStore) {
        const entries = AppStore.getTimeLogEntries().filter(entry => new Date(entry.startTime) >= startDate);
        onUpdate(entries);
    }
}

function getTodaysTotalTrackedMs() {
    return _getTodaysEntries().reduce((total, entry) => total + entry.durationMs, 0);
}

async function fetchLogEntriesForDateRange(startDate, endDate) {
    if (!AppStore) return [];
    return Promise.resolve(AppStore.getTimeLogEntries().filter(entry => {
        const entryDate = new Date(entry.startTime);
        return entryDate >= startDate && entryDate <= endDate;
    }));
}

function stopAllStreams() {
    // No-op for this implementation. Event listeners are managed by the feature file.
}

async function addActivity(activityData) {
    const functionName = 'addActivity (TimeTrackerService)';
    if (!AppStore) return;
    const activities = AppStore.getTimeActivities();
    const newActivity = {
        id: `activity_${Date.now()}`,
        ...activityData,
        createdAt: new Date().toISOString()
    };
    activities.push(newActivity);
    await AppStore.setTimeActivities(activities, functionName);
}

async function deleteActivity(activityId) {
    const functionName = 'deleteActivity (TimeTrackerService)';
    if (!AppStore) return;
    // This now calls the new, safe function in the AppStore
    await AppStore.deleteTimeActivity(activityId, functionName);
}

async function stopTracking() {
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
    await AppStore.setTimeLogEntries(logEntries, functionName);

    _activeTimer = null;
    _saveActiveTimer();
}

async function addLogEntry(logData) {
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
    await AppStore.setTimeLogEntries(logEntries, functionName);
}

async function updateLogEntry(logId, updatedData) {
    const functionName = 'updateLogEntry (TimeTrackerService)';
    if (!AppStore) return;
    let logEntries = AppStore.getTimeLogEntries();
    const logIndex = logEntries.findIndex(log => log.id === logId);
    if (logIndex === -1) throw new Error("Log entry not found");

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
    await AppStore.setTimeLogEntries(logEntries, functionName);
}

async function deleteLogEntry(logId) {
    const functionName = 'deleteLogEntry (TimeTrackerService)';
    if (!AppStore) return;
    let logEntries = AppStore.getTimeLogEntries();
    logEntries = logEntries.filter(log => log.id !== logId);
    await AppStore.setTimeLogEntries(logEntries, functionName);
}

function getActivities() { return AppStore ? AppStore.getTimeActivities() : []; }
function getLogEntries() { return AppStore ? AppStore.getTimeLogEntries() : []; }
function getActiveTimer() { return _activeTimer ? { ..._activeTimer } : null; }

function startTracking(activityId) {
    if (_activeTimer && _activeTimer.activityId === activityId) return;
    if (_activeTimer) {
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
    // Core data is loaded by AppStore.initializeStore()
    LoggingService.info('[TimeTrackerService] Initialized. Active timer loaded from localStorage. Core data sourced from AppStore.', {
        functionName: 'initialize (TimeTrackerService)'
    });
}

const TimeTrackerService = {
    initialize,
    streamActivities,
    streamLogEntries,
    fetchLogEntriesForDateRange,
    getTodaysTotalTrackedMs,
    stopAllStreams,
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