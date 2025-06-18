// timeTrackerService.js
// Manages all logic for the time tracker feature using localStorage.

import LoggingService from './loggingService.js';

const ACTIVITIES_KEY = 'timeTracker_activities_v1';
const LOG_ENTRIES_KEY = 'timeTracker_log_entries_v1';
const ACTIVE_TIMER_KEY = 'timeTracker_active_timer_v1';

// --- Internal State ---
let _activities = [];
let _logEntries = [];
let _activeTimer = null;

// --- Private Helper Functions ---
function _loadData() {
    try {
        const storedActivities = localStorage.getItem(ACTIVITIES_KEY);
        _activities = storedActivities ? JSON.parse(storedActivities) : [
             // Default activities
            { id: 'activity_1', name: 'Development', icon: 'fas fa-code', color: 'sky' },
            { id: 'activity_2', name: 'Meeting', icon: 'fas fa-users', color: 'purple' },
            { id: 'activity_3', name: 'Design', icon: 'fas fa-paint-brush', color: 'pink' },
            { id: 'activity_4', name: 'Learning', icon: 'fas fa-book-open', color: 'yellow' },
        ];

        const storedLogs = localStorage.getItem(LOG_ENTRIES_KEY);
        _logEntries = storedLogs ? JSON.parse(storedLogs).map(log => ({
            ...log,
            startTime: new Date(log.startTime),
            endTime: new Date(log.endTime)
        })) : [];

        const storedTimer = localStorage.getItem(ACTIVE_TIMER_KEY);
        _activeTimer = storedTimer ? JSON.parse(storedTimer) : null;
        if (_activeTimer) {
            _activeTimer.startTime = new Date(_activeTimer.startTime);
        }

    } catch (error) {
        LoggingService.error('[TimeTrackerService] Error loading data from localStorage.', error);
        _activities = [];
        _logEntries = [];
        _activeTimer = null;
    }
}

function _saveActivities() {
    try {
        localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(_activities));
    } catch (error) {
        LoggingService.error('[TimeTrackerService] Error saving activities to localStorage.', error);
    }
}

function _saveLogEntries() {
     try {
        localStorage.setItem(LOG_ENTRIES_KEY, JSON.stringify(_logEntries));
    } catch (error) {
        LoggingService.error('[TimeTrackerService] Error saving log entries to localStorage.', error);
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return _logEntries.filter(entry => new Date(entry.startTime) >= today);
}

// --- Public API ---

function streamActivities(onUpdate) {
    if (typeof onUpdate === 'function') {
        onUpdate([..._activities]);
    }
    // This is a placeholder for a real-time stream.
    // In a localStorage model, we might use a custom event or just rely on direct calls.
}

function streamLogEntries(startDate, onUpdate) {
     if (typeof onUpdate === 'function') {
        const entries = _logEntries.filter(entry => new Date(entry.startTime) >= startDate);
        onUpdate(entries);
    }
}

function getTodaysTotalTrackedMs() {
    return _getTodaysEntries().reduce((total, entry) => total + entry.durationMs, 0);
}

async function fetchLogEntriesForDateRange(startDate, endDate) {
    return Promise.resolve(_logEntries.filter(entry => {
        const entryDate = new Date(entry.startTime);
        return entryDate >= startDate && entryDate <= endDate;
    }));
}

function stopAllStreams() {
    // No-op for localStorage implementation
}

async function addActivity(activityData) {
    const newActivity = {
        id: `activity_${Date.now()}`,
        ...activityData,
        createdAt: new Date().toISOString()
    };
    _activities.push(newActivity);
    _saveActivities();
    // In a real streaming scenario, this would trigger the onUpdate callback.
    // For now, the UI needs to be manually refreshed.
    return Promise.resolve();
}

async function deleteActivity(activityId) {
    _activities = _activities.filter(a => a.id !== activityId);
    _saveActivities();
     return Promise.resolve();
}

async function stopTracking() {
    if (!_activeTimer) return;

    const newLogEntry = {
        id: `log_${Date.now()}`,
        activityId: _activeTimer.activityId,
        startTime: _activeTimer.startTime,
        endTime: new Date(),
        notes: _activeTimer.notes || ''
    };
    newLogEntry.durationMs = newLogEntry.endTime.getTime() - newLogEntry.startTime.getTime();
    _logEntries.unshift(newLogEntry);
    _saveLogEntries();

    _activeTimer = null;
    _saveActiveTimer();
     return Promise.resolve();
}

async function addLogEntry(logData) {
    const newLog = {
        id: `log_${Date.now()}`,
        activityId: logData.activityId,
        startTime: new Date(logData.startTime),
        endTime: new Date(logData.endTime),
        notes: logData.notes || '',
        durationMs: new Date(logData.endTime).getTime() - new Date(logData.startTime).getTime(),
        manuallyAdded: true
    };
    _logEntries.unshift(newLog);
    _logEntries.sort((a,b) => b.startTime - a.startTime); // Keep sorted
    _saveLogEntries();
    return Promise.resolve();
}

async function updateLogEntry(logId, updatedData) {
    const logIndex = _logEntries.findIndex(log => log.id === logId);
    if (logIndex === -1) throw new Error("Log entry not found");

    const existingLog = _logEntries[logIndex];
    const newStartTime = updatedData.startTime ? new Date(updatedData.startTime) : existingLog.startTime;
    const newEndTime = updatedData.endTime ? new Date(updatedData.endTime) : existingLog.endTime;

    _logEntries[logIndex] = {
        ...existingLog,
        ...updatedData,
        startTime: newStartTime,
        endTime: newEndTime,
        durationMs: newEndTime.getTime() - newStartTime.getTime()
    };
    _saveLogEntries();
    return Promise.resolve();
}

async function deleteLogEntry(logId) {
    _logEntries = _logEntries.filter(log => log.id !== logId);
    _saveLogEntries();
    return Promise.resolve();
}

function getActivities() { return [..._activities]; }
function getLogEntries() { return [..._logEntries]; }
function getActiveTimer() { return _activeTimer ? { ..._activeTimer } : null; }

function startTracking(activityId) {
    if (_activeTimer) {
        if (_activeTimer.activityId === activityId) return;
        stopTracking();
    }
    const activity = _activities.find(a => a.id === activityId);
    if (!activity) {
        LoggingService.warn('[TimeTrackerService] Attempted to start tracking for non-existent activity ID:', { activityId });
        return;
    }
    _activeTimer = {
        activityId: activityId,
        startTime: new Date()
    };
    _saveActiveTimer();
    LoggingService.info(`[TimeTrackerService] Started tracking activity: ${activity.name}`, { activeTimer: _activeTimer });
    return getActiveTimer();
}

function initialize() {
    _loadData();
    LoggingService.info('[TimeTrackerService] Initialized and data loaded from localStorage.', {
        activityCount: _activities.length,
        logCount: _logEntries.length
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