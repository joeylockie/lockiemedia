// timeTrackerService.js
// Manages logic for the time tracker feature, using IndexedDB for core data
// and localStorage for the transient active timer state. Now supports multiple timers.

import LoggingService from './loggingService.js';
import AppStore from './store.js';
import db from './database.js'; // Import the database connection
import EventBus from './eventBus.js'; // Import EventBus

const ACTIVE_TIMERS_KEY = 'timeTracker_active_timers_v2'; // Renamed key for new array structure

// --- Internal State ---
let _activeTimers = []; // Now an array

// --- Private Helper Functions (for active timer) ---
function _loadActiveTimers() {
    try {
        // --- MIGRATION LOGIC ---
        // Check for the old single-timer key and migrate it if it exists.
        const oldTimerKey = 'timeTracker_active_timer_v1';
        const oldTimerData = localStorage.getItem(oldTimerKey);
        if (oldTimerData) {
            const oldTimer = JSON.parse(oldTimerData);
            if (oldTimer && oldTimer.activityId) {
                // If the old timer exists, put it in the new array structure
                _activeTimers = [oldTimer];
                localStorage.setItem(ACTIVE_TIMERS_KEY, JSON.stringify(_activeTimers));
                localStorage.removeItem(oldTimerKey); // Clean up the old key
                LoggingService.info('[TimeTrackerService] Migrated old active timer to new multi-timer format.');
            }
        }
        // --- END MIGRATION LOGIC ---

        const storedTimers = localStorage.getItem(ACTIVE_TIMERS_KEY);
        _activeTimers = storedTimers ? JSON.parse(storedTimers) : [];
        _activeTimers.forEach(timer => {
            if (timer.startTime) timer.startTime = new Date(timer.startTime);
            if (timer.pauseTime) timer.pauseTime = new Date(timer.pauseTime);
        });
    } catch (error) {
        LoggingService.error('[TimeTrackerService] Error loading active timers from localStorage.', error);
        _activeTimers = [];
    }
}

function _saveActiveTimers() {
    try {
        localStorage.setItem(ACTIVE_TIMERS_KEY, JSON.stringify(_activeTimers));
    } catch (error) {
        LoggingService.error('[TimeTrackerService] Error saving active timers to localStorage.', error);
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

async function stopTracking(activityId) {
    const timerIndex = _activeTimers.findIndex(t => t.activityId === activityId);
    if (timerIndex === -1) return;

    const timerToStop = _activeTimers[timerIndex];
    try {
        const endTime = timerToStop.isPaused ? timerToStop.pauseTime : new Date();
        const newLogEntry = {
            activityId: timerToStop.activityId,
            startTime: timerToStop.startTime,
            endTime: endTime,
            notes: timerToStop.notes || '',
            manuallyAdded: false,
            durationMs: endTime.getTime() - timerToStop.startTime.getTime()
        };

        await db.time_log_entries.add(newLogEntry);

        _activeTimers.splice(timerIndex, 1); // Remove from the list
        _saveActiveTimers();
        EventBus.publish('activeTimerChanged', getActiveTimers());

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
function getActiveTimers() { return [..._activeTimers]; } // Return a copy of the array

async function startTracking(activityId) {
    const existingTimer = _activeTimers.find(t => t.activityId === activityId);
    if (existingTimer) {
        if (existingTimer.isPaused) {
            resumeTracking(activityId);
        }
        return; // Already running, do nothing
    }

    const activity = await db.time_activities.get(activityId);
    if (!activity) {
        LoggingService.warn('[TimeTrackerService] Attempted to start tracking for non-existent activity ID:', { activityId });
        return;
    }

    _activeTimers.push({
        activityId: activityId,
        startTime: new Date(),
        isPaused: false,
        pauseTime: null,
        totalPausedMs: 0
    });
    _saveActiveTimers();
    EventBus.publish('activeTimerChanged', getActiveTimers());
}

function pauseTracking(activityId) {
    const timer = _activeTimers.find(t => t.activityId === activityId);
    if (!timer || timer.isPaused) return;
    timer.isPaused = true;
    timer.pauseTime = new Date();
    _saveActiveTimers();
    EventBus.publish('activeTimerChanged', getActiveTimers());
}

function resumeTracking(activityId) {
    const timer = _activeTimers.find(t => t.activityId === activityId);
    if (!timer || !timer.isPaused) return;
    const pausedMs = new Date().getTime() - timer.pauseTime.getTime();
    timer.totalPausedMs += pausedMs;
    timer.startTime = new Date(timer.startTime.getTime() + pausedMs);
    timer.isPaused = false;
    timer.pauseTime = null;
    _saveActiveTimers();
    EventBus.publish('activeTimerChanged', getActiveTimers());
}

function initialize() {
    _loadActiveTimers();
    LoggingService.info('[TimeTrackerService] Initialized.');
}

const TimeTrackerService = {
    initialize,
    getActivities,
    getLogEntries,
    getActiveTimers, // Renamed from getActiveTimer
    startTracking,
    stopTracking,
    pauseTracking,
    resumeTracking,
    addLogEntry,
    updateLogEntry,
    deleteLogEntry,
};

export default TimeTrackerService;