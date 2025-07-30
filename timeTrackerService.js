// timeTrackerService.js
// Manages logic for the time tracker feature, using IndexedDB for core data
// and localStorage for the transient active timer state.

import LoggingService from './loggingService.js';
import AppStore from './store.js';
import db from './database.js'; // Import the database connection
import EventBus from './eventBus.js'; // Import EventBus

const ACTIVE_TIMER_KEY = 'timeTracker_active_timer_v1';

// --- Internal State ---
let _activeTimer = null; // This remains managed by localStorage for efficiency.

// --- Private Helper Functions (for active timer) ---
function _loadActiveTimer() {
    try {
        const storedTimer = localStorage.getItem(ACTIVE_TIMER_KEY);
        _activeTimer = storedTimer ? JSON.parse(storedTimer) : null;
        if (_activeTimer) {
            // Make sure dates are actual Date objects
            if (_activeTimer.startTime) _activeTimer.startTime = new Date(_activeTimer.startTime);
            if (_activeTimer.pauseTime) _activeTimer.pauseTime = new Date(_activeTimer.pauseTime);
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
    const todaysEntries = await db.time_log_entries
        .where('startTime').aboveOrEqual(today)
        .toArray();
    return todaysEntries.reduce((total, entry) => total + entry.durationMs, 0);
}

async function addActivity(activityData) {
    const newActivity = { ...activityData, createdAt: new Date().toISOString() };
    await db.time_activities.add(newActivity);
    const allActivities = await db.time_activities.toArray();
    await AppStore.setTimeActivities(allActivities);
}

async function deleteActivity(activityId) {
    await AppStore.deleteTimeActivity(activityId, 'deleteActivity (TimeTrackerService)');
}

async function stopTracking() {
    if (!_activeTimer) return;
    try {
        const endTime = _activeTimer.isPaused ? _activeTimer.pauseTime : new Date();
        const newLogEntry = {
            activityId: _activeTimer.activityId,
            startTime: _activeTimer.startTime,
            endTime: endTime,
            notes: _activeTimer.notes || '',
            manuallyAdded: false,
            durationMs: endTime.getTime() - _activeTimer.startTime.getTime()
        };

        await db.time_log_entries.add(newLogEntry);
        _activeTimer = null;
        _saveActiveTimer();
        EventBus.publish('activeTimerChanged', null);

        const allEntries = await db.time_log_entries.toArray();
        await AppStore.setTimeLogEntries(allEntries);
    } catch (error) {
        LoggingService.error('[TimeTrackerService] Error in stopTracking.', error);
    }
}

async function addLogEntry(logData) {
    const newLog = {
        activityId: parseInt(logData.activityId),
        startTime: new Date(logData.startTime),
        endTime: new Date(logData.endTime),
        notes: logData.notes || '',
        durationMs: new Date(logData.endTime).getTime() - new Date(logData.startTime).getTime(),
        manuallyAdded: true
    };
    await db.time_log_entries.add(newLog);
    const allEntries = await db.time_log_entries.toArray();
    await AppStore.setTimeLogEntries(allEntries);
}

async function updateLogEntry(logId, updatedData) {
    const updatePayload = { ...updatedData, activityId: parseInt(updatedData.activityId) };
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
}

async function deleteLogEntry(logId) {
    await db.time_log_entries.delete(logId);
    const allEntries = await db.time_log_entries.toArray();
    await AppStore.setTimeLogEntries(allEntries);
}

function getActivities() { return AppStore ? AppStore.getTimeActivities() : []; }
function getLogEntries() { return AppStore ? AppStore.getTimeLogEntries() : []; }
function getActiveTimer() { return _activeTimer ? { ..._activeTimer } : null; }

async function startTracking(activityId) {
    if (_activeTimer && _activeTimer.activityId === activityId && !_activeTimer.isPaused) return; // Already running
    if (_activeTimer && _activeTimer.activityId === activityId && _activeTimer.isPaused) {
        return resumeTracking(); // If it's the same activity and paused, resume it.
    }
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
        isPaused: false,
        pauseTime: null,
        totalPausedMs: 0
    };
    _saveActiveTimer();
    EventBus.publish('activeTimerChanged', getActiveTimer());
    return getActiveTimer();
}

function pauseTracking() {
    if (!_activeTimer || _activeTimer.isPaused) return;
    _activeTimer.isPaused = true;
    _activeTimer.pauseTime = new Date();
    _saveActiveTimer();
    EventBus.publish('activeTimerChanged', getActiveTimer());
}

function resumeTracking() {
    if (!_activeTimer || !_activeTimer.isPaused) return;
    const pausedMs = new Date().getTime() - _activeTimer.pauseTime.getTime();
    _activeTimer.totalPausedMs += pausedMs;
    // Adjust start time to effectively remove the paused duration from the total elapsed time.
    _activeTimer.startTime = new Date(_activeTimer.startTime.getTime() + pausedMs);
    _activeTimer.isPaused = false;
    _activeTimer.pauseTime = null;
    _saveActiveTimer();
    EventBus.publish('activeTimerChanged', getActiveTimer());
}


function initialize() {
    _loadActiveTimer();
    LoggingService.info('[TimeTrackerService] Initialized.');
}

const TimeTrackerService = {
    initialize,
    getActivities,
    getLogEntries,
    getActiveTimer,
    startTracking,
    stopTracking,
    pauseTracking,
    resumeTracking,
    addLogEntry,
    updateLogEntry,
    deleteLogEntry,
};

export default TimeTrackerService;