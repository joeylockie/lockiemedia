// timeTrackerService.js
// Manages all logic for the time tracker feature, including activities and time logs.

import LoggingService from './loggingService.js';

const ACTIVITIES_KEY = 'timeTracker_activities_v1';
const LOG_ENTRIES_KEY = 'timeTracker_logEntries_v1';

// --- Internal State ---
let _activities = [];
let _logEntries = [];
let _activeTimer = null; // { activityId, startTime, intervalId }

// --- Private Helper Functions ---

function _loadData() {
    try {
        const storedActivities = localStorage.getItem(ACTIVITIES_KEY);
        _activities = storedActivities ? JSON.parse(storedActivities) : [
            // Default activities
            { id: 'activity_1', name: 'Working', icon: 'fas fa-briefcase', color: 'sky' },
            { id: 'activity_2', name: 'Gaming', icon: 'fas fa-gamepad', color: 'purple' },
            { id: 'activity_3', name: 'Commuting', icon: 'fas fa-car', color: 'yellow' },
            { id: 'activity_4', name: 'Studying', icon: 'fas fa-book-open', color: 'green' }
        ];

        const storedLogEntries = localStorage.getItem(LOG_ENTRIES_KEY);
        _logEntries = storedLogEntries ? JSON.parse(storedLogEntries) : [];

    } catch (error) {
        LoggingService.error('[TimeTrackerService] Error loading data from localStorage.', error);
        _activities = [];
        _logEntries = [];
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

function _findActivityById(activityId) {
    return _activities.find(a => a.id === activityId);
}

// --- Public API ---

function getActivities() {
    return [..._activities];
}

function getLogEntries(filter = 'today') {
    // For now, just return all. Filtering can be added later.
    return [..._logEntries].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
}

function getActiveTimer() {
    return _activeTimer ? { ..._activeTimer } : null;
}

function startTracking(activityId) {
    if (_activeTimer) {
        if (_activeTimer.activityId === activityId) return; // Already tracking this
        stopTracking(); // Stop the current timer before starting a new one
    }

    const activity = _findActivityById(activityId);
    if (!activity) {
        LoggingService.warn('[TimeTrackerService] Attempted to start tracking for non-existent activity ID:', { activityId });
        return;
    }

    _activeTimer = {
        activityId: activityId,
        startTime: new Date().toISOString(),
        intervalId: null // We'll let the UI handle the interval for display updates
    };

    LoggingService.info(`[TimeTrackerService] Started tracking activity: ${activity.name}`, { activeTimer: _activeTimer });
    return getActiveTimer();
}

function stopTracking() {
    if (!_activeTimer) return;

    const endTime = new Date().toISOString();
    const newLogEntry = {
        id: `log_${Date.now()}`,
        activityId: _activeTimer.activityId,
        startTime: _activeTimer.startTime,
        endTime: endTime,
        durationMs: new Date(endTime).getTime() - new Date(_activeTimer.startTime).getTime()
    };

    _logEntries.unshift(newLogEntry);
    _saveLogEntries();

    LoggingService.info(`[TimeTrackerService] Stopped tracking. Logged entry:`, { newLogEntry });

    const stoppedTimer = { ..._activeTimer, endTime };
    _activeTimer = null;
    return stoppedTimer;
}


function initialize() {
    const functionName = 'initialize (TimeTrackerService)';
    LoggingService.info('[TimeTrackerService] Initializing...', { functionName });
    _loadData();

    // Check if there was an active timer that wasn't stopped (e.g., page refresh)
    // For simplicity, we'll just clear it. A more robust solution could prompt the user.
    // This logic would be more complex and is omitted for now.

    LoggingService.info('[TimeTrackerService] Initialized and data loaded.', {
        functionName,
        activityCount: _activities.length,
        logEntryCount: _logEntries.length
    });
}

const TimeTrackerService = {
    initialize,
    getActivities,
    getLogEntries,
    getActiveTimer,
    startTracking,
    stopTracking
};

export default TimeTrackerService;