// timeTrackerService.js
// Manages all logic for the time tracker feature using Firebase Firestore.

import LoggingService from './loggingService.js';
import { getFirestoreInstance } from './feature_user_accounts.js'; 

const TIME_ACTIVITIES_COLLECTION = 'time_activities';
const TIME_LOG_ENTRIES_COLLECTION = 'time_log_entries';

// --- Internal State ---
let _activities = [];
let _logEntries = [];
let _activeTimer = null; 

// --- Firestore Listeners (to be managed by the feature module) ---
let _activitiesUnsubscribe = null;
let _logEntriesUnsubscribe = null;

// --- Private Helper Functions ---

function _getCurrentUserId() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        return firebase.auth().currentUser ? firebase.auth().currentUser.uid : null;
    }
    return null;
}

// --- Public API ---

/**
 * Streams the user's activities from Firestore in real-time.
 * @param {function} onUpdate - Callback function that receives the activities array.
 */
function streamActivities(onUpdate) {
    const functionName = 'streamActivities';
    const userId = _getCurrentUserId();
    if (!userId) {
        LoggingService.warn('[TimeTrackerService] No user ID available. Cannot stream activities.', { functionName });
        return;
    }

    if (_activitiesUnsubscribe) _activitiesUnsubscribe();

    const db = getFirestoreInstance();
    // CORRECTED PATH: Access the sub-collection within the user's document.
    const q = db.collection('users').doc(userId).collection(TIME_ACTIVITIES_COLLECTION)
                .orderBy('createdAt', 'asc');

    _activitiesUnsubscribe = q.onSnapshot(querySnapshot => {
        _activities = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        LoggingService.info(`[TimeTrackerService] Activity stream updated. Found ${_activities.length} activities.`, { functionName, count: _activities.length });
        if (typeof onUpdate === 'function') {
            onUpdate([..._activities]);
        }
    }, error => {
        LoggingService.error('[TimeTrackerService] Error in activity stream.', error, { functionName });
    });
}

/**
 * Streams the user's time log entries for a given date range from Firestore.
 * @param {Date} startDate - The start of the date range.
 * @param {function} onUpdate - Callback function that receives the log entries array.
 */
function streamLogEntries(startDate, onUpdate) {
    const functionName = 'streamLogEntries';
    const userId = _getCurrentUserId();
    if (!userId) {
        LoggingService.warn('[TimeTrackerService] No user ID available. Cannot stream log entries.', { functionName });
        return;
    }
     if (_logEntriesUnsubscribe) _logEntriesUnsubscribe();

    const db = getFirestoreInstance();
    // CORRECTED PATH: Access the sub-collection within the user's document.
    const q = db.collection('users').doc(userId).collection(TIME_LOG_ENTRIES_COLLECTION)
                .where('startTime', '>=', startDate)
                .orderBy('startTime', 'desc');

    _logEntriesUnsubscribe = q.onSnapshot(querySnapshot => {
        _logEntries = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Ensure startTime and endTime are converted to Date objects
                startTime: data.startTime?.toDate ? data.startTime.toDate() : new Date(data.startTime),
                endTime: data.endTime?.toDate ? data.endTime.toDate() : new Date(data.endTime)
            };
        });
         LoggingService.info(`[TimeTrackerService] Log entry stream updated. Found ${_logEntries.length} entries.`, { functionName, count: _logEntries.length });
        if (typeof onUpdate === 'function') {
            onUpdate([..._logEntries]);
        }
    }, error => {
        LoggingService.error('[TimeTrackerService] Error in log entry stream.', error, { functionName });
    });
}

/**
 * Fetches log entries for a specific date range for reporting.
 * @param {Date} startDate The start date of the range.
 * @param {Date} endDate The end date of the range.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of log entries.
 */
async function fetchLogEntriesForDateRange(startDate, endDate) {
    const functionName = 'fetchLogEntriesForDateRange';
    const userId = _getCurrentUserId();
    if (!userId) {
        LoggingService.error('[TimeTrackerService] User not logged in. Cannot fetch history.', new Error('UserNotLoggedIn'), { functionName });
        return [];
    }
    const db = getFirestoreInstance();
    try {
        // CORRECTED PATH: Access the sub-collection within the user's document.
        const querySnapshot = await db.collection('users').doc(userId).collection(TIME_LOG_ENTRIES_COLLECTION)
            .where('startTime', '>=', startDate)
            .where('startTime', '<=', endDate)
            .orderBy('startTime', 'desc')
            .get();

        const entries = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                startTime: data.startTime.toDate(),
                endTime: data.endTime.toDate()
            };
        });
        LoggingService.info(`[TimeTrackerService] Fetched ${entries.length} log entries for date range.`, { functionName, count: entries.length });
        return entries;
    } catch (error) {
        LoggingService.error('[TimeTrackerService] Error fetching log entries for date range.', error, { functionName });
        throw error;
    }
}

/**
 * Stops all active data streams.
 */
function stopAllStreams() {
    if (_activitiesUnsubscribe) _activitiesUnsubscribe();
    if (_logEntriesUnsubscribe) _logEntriesUnsubscribe();
    LoggingService.info('[TimeTrackerService] All Firestore streams stopped.', { functionName: 'stopAllStreams' });
}

/**
 * Adds a new activity for the current user to Firestore.
 * @param {object} activityData - Should contain { name, icon, color }.
 */
async function addActivity(activityData) {
    const functionName = 'addActivity';
    const userId = _getCurrentUserId();
    if (!userId) throw new Error('UserNotLoggedIn');
    
    const db = getFirestoreInstance();
    try {
        // CORRECTED PATH: Access the sub-collection within the user's document.
        await db.collection('users').doc(userId).collection(TIME_ACTIVITIES_COLLECTION).add({
            ...activityData,
            userId: userId, // Keep for potential rule changes or backend queries
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        LoggingService.info(`[TimeTrackerService] Added new activity: ${activityData.name}`, { functionName, activityData });
    } catch (error) {
        LoggingService.error('[TimeTrackerService] Error adding activity to Firestore.', error, { functionName });
        throw error;
    }
}

/**
 * Deletes an activity from Firestore.
 * @param {string} activityId - The ID of the activity to delete.
 */
async function deleteActivity(activityId) {
    const functionName = 'deleteActivity';
    const userId = _getCurrentUserId();
    if (!userId) throw new Error('UserNotLoggedIn');

    const db = getFirestoreInstance();
    try {
        // CORRECTED PATH: Access the sub-collection within the user's document.
        await db.collection('users').doc(userId).collection(TIME_ACTIVITIES_COLLECTION).doc(activityId).delete();
        LoggingService.info(`[TimeTrackerService] Deleted activity with ID: ${activityId}`, { functionName, activityId });
    } catch (error) {
        LoggingService.error(`[TimeTrackerService] Error deleting activity ${activityId}.`, error, { functionName });
        throw error;
    }
}

async function stopTracking() {
    if (!_activeTimer) return;

    const functionName = 'stopTracking';
    const userId = _getCurrentUserId();
    if (!userId) {
        LoggingService.error('[TimeTrackerService] Cannot stop tracking and save log, no user ID.', new Error('UserNotLoggedIn'), { functionName });
        _activeTimer = null; 
        return;
    }

    const db = getFirestoreInstance();
    const newLogEntry = {
        userId: userId,
        activityId: _activeTimer.activityId,
        startTime: _activeTimer.startTime, 
        endTime: new Date(),
        notes: '' // Add notes field
    };
    newLogEntry.durationMs = newLogEntry.endTime.getTime() - newLogEntry.startTime.getTime();

    try {
        await db.collection('users').doc(userId).collection(TIME_LOG_ENTRIES_COLLECTION).add(newLogEntry);
        LoggingService.info(`[TimeTrackerService] Stopped tracking. Logged entry to Firestore.`, { functionName, newLogEntry });
    } catch (error) {
        LoggingService.error('[TimeTrackerService] Error saving log entry to Firestore.', error, { functionName });
    } finally {
        _activeTimer = null; 
    }
}

/**
 * Adds a manual time log entry to Firestore.
 * @param {object} logData - Object containing { activityId, startTime, endTime, notes }
 * @returns {Promise<void>}
 */
async function addLogEntry(logData) {
    const functionName = 'addLogEntry';
    const userId = _getCurrentUserId();
    if (!userId) throw new Error('User not logged in');

    const db = getFirestoreInstance();
    const newLog = {
        userId,
        activityId: logData.activityId,
        startTime: new Date(logData.startTime),
        endTime: new Date(logData.endTime),
        notes: logData.notes || '',
        durationMs: new Date(logData.endTime).getTime() - new Date(logData.startTime).getTime(),
        manuallyAdded: true
    };

    try {
        await db.collection('users').doc(userId).collection(TIME_LOG_ENTRIES_COLLECTION).add(newLog);
        LoggingService.info('[TimeTrackerService] Manually added new time log.', { functionName, newLog });
    } catch (error) {
        LoggingService.error('[TimeTrackerService] Error manually adding time log.', error, { functionName });
        throw error;
    }
}

/**
 * Updates an existing time log entry in Firestore.
 * @param {string} logId The ID of the log entry to update.
 * @param {object} updatedData The data to update, e.g., { startTime, endTime, notes, activityId }.
 * @returns {Promise<void>}
 */
async function updateLogEntry(logId, updatedData) {
    const functionName = 'updateLogEntry';
    const userId = _getCurrentUserId();
    if (!userId) throw new Error('User not logged in');
    if (!logId) throw new Error('Log ID is required for update');

    const db = getFirestoreInstance();
    const logRef = db.collection('users').doc(userId).collection(TIME_LOG_ENTRIES_COLLECTION).doc(logId);

    // Recalculate duration if start/end times are changed
    if (updatedData.startTime || updatedData.endTime) {
        const doc = await logRef.get();
        const existingData = doc.data();
        const newStartTime = updatedData.startTime ? new Date(updatedData.startTime) : existingData.startTime.toDate();
        const newEndTime = updatedData.endTime ? new Date(updatedData.endTime) : existingData.endTime.toDate();
        updatedData.durationMs = newEndTime.getTime() - newStartTime.getTime();

        // Convert dates back to Firestore Timestamps if they are date objects
        if (updatedData.startTime) updatedData.startTime = firebase.firestore.Timestamp.fromDate(newStartTime);
        if (updatedData.endTime) updatedData.endTime = firebase.firestore.Timestamp.fromDate(newEndTime);
    }
    
    try {
        await logRef.update(updatedData);
        LoggingService.info(`[TimeTrackerService] Updated time log entry: ${logId}`, { functionName, logId, updatedData });
    } catch (error) {
        LoggingService.error(`[TimeTrackerService] Error updating time log entry: ${logId}`, error, { functionName });
        throw error;
    }
}

/**
 * Deletes a time log entry from Firestore.
 * @param {string} logId The ID of the log entry to delete.
 * @returns {Promise<void>}
 */
async function deleteLogEntry(logId) {
    const functionName = 'deleteLogEntry';
    const userId = _getCurrentUserId();
    if (!userId) throw new Error('User not logged in');
    if (!logId) throw new Error('Log ID is required for deletion');

    const db = getFirestoreInstance();
    try {
        await db.collection('users').doc(userId).collection(TIME_LOG_ENTRIES_COLLECTION).doc(logId).delete();
        LoggingService.info(`[TimeTrackerService] Deleted time log entry: ${logId}`, { functionName, logId });
    } catch (error) {
        LoggingService.error(`[TimeTrackerService] Error deleting time log entry: ${logId}`, error, { functionName });
        throw error;
    }
}


// --- Unchanged Functions ---
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
    LoggingService.info(`[TimeTrackerService] Started tracking activity: ${activity.name}`, { activeTimer: _activeTimer });
    return getActiveTimer();
}
function initialize() {
    const functionName = 'initialize (TimeTrackerService)';
    LoggingService.info('[TimeTrackerService] Initializing...', { functionName });
    LoggingService.info('[TimeTrackerService] Service Initialized. Ready for streams.', { functionName });
}


const TimeTrackerService = {
    initialize,
    streamActivities,
    streamLogEntries,
    fetchLogEntriesForDateRange, 
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