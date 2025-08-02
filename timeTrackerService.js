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
        .where('s').aboveOrEqual(today) // Use new index 's'
        .toArray();

    // Calculate duration on the fly, supporting both old and new formats
    return todaysEntries.reduce((total, entry) => {
        const startTime = new Date(entry.s || entry.startTime).getTime();
        const endTime = new Date(entry.e || entry.endTime).getTime();
        return total + (endTime - startTime);
    }, 0);
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
        // Save in the new compact format
        const newLogEntry = {
            a: timerToStop.activityId,
            s: timerToStop.startTime,
            e: endTime,
            n: timerToStop.notes || '',
            m: false,
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
    // Save in the new compact format
    const newLog = {
        a: parseInt(logData.activityId),
        s: new Date(logData.startTime),
        e: new Date(logData.endTime),
        n: logData.notes || '',
        m: true
    };
    await db.time_log_entries.add(newLog);
    const allEntries = await db.time_log_entries.toArray();
    await AppStore.setTimeLogEntries(allEntries);
}

async function updateLogEntry(logId, updatedData) {
    const updatePayload = {
        a: parseInt(updatedData.activityId),
        n: updatedData.notes || '',
        s: new Date(updatedData.startTime),
        e: new Date(updatedData.endTime)
    };
    
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

// Modify getLogEntries to transform data back to the old format for compatibility
function getLogEntries() {
    if (!AppStore) return [];
    return AppStore.getTimeLogEntries().map(entry => {
        // If it's already in the old format, just return it
        if (entry.startTime) return entry;
        // Otherwise, transform the new format to the old one for the UI
        return {
            id: entry.id,
            activityId: entry.a,
            startTime: entry.s,
            endTime: entry.e,
            notes: entry.n,
            manuallyAdded: entry.m,
            durationMs: new Date(entry.e).getTime() - new Date(entry.s).getTime()
        };
    });
}

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
    addActivity,
    deleteActivity,
    getTodaysTotalTrackedMs,
};

export default TimeTrackerService;