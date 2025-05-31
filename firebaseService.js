// firebaseService.js
// Handles all direct interactions with Firebase Firestore.

import LoggingService from './loggingService.js';
import { getFirestoreInstance } from './feature_user_accounts.js'; // To get the initialized DB instance
// REMOVE any 'firebase/compat/...' imports if they were added here.
// We will rely on the global 'firebase' object for 'firebase.firestore.FieldValue.serverTimestamp()'.

const USERS_COLLECTION = 'users';
const APP_DATA_DOC = 'appData'; // A subcollection to hold user-specific data documents
const USER_SPECIFIC_DATA_DOC = 'userSpecificData'; // The document within APP_DATA_DOC

/**
 * Saves the user's application data (tasks, projects, kanban columns) to Firestore.
 * @param {string} userId - The UID of the user.
 * @param {object} data - An object containing tasks, projects, and kanbanColumns arrays.
 * @returns {Promise<void>}
 */
export async function saveUserDataToFirestore(userId, data) {
    const functionName = 'saveUserDataToFirestore (firebaseService)';
    if (!userId) {
        LoggingService.error('[FirebaseService] User ID is required to save data.', new Error('MissingUserId'), { functionName });
        return;
    }
    if (!data || typeof data !== 'object') {
        LoggingService.error('[FirebaseService] Data is required to save.', new Error('MissingData'), { functionName, userId });
        return;
    }

    const db = getFirestoreInstance();
    if (!db) {
        LoggingService.error('[FirebaseService] Firestore instance not available.', new Error('FirestoreUnavailable'), { functionName, userId });
        return;
    }

    if (typeof firebase === 'undefined' || typeof firebase.firestore === 'undefined' || typeof firebase.firestore.FieldValue === 'undefined') {
        LoggingService.error('[FirebaseService] firebase.firestore.FieldValue not available for server timestamp.', new Error('FirebaseGlobalMissing'), { functionName, userId });
    }

    LoggingService.info(`[FirebaseService] Attempting to save data for user ${userId}.`, { functionName, userId, dataKeys: Object.keys(data) });

    try {
        const userDocRef = db.collection(USERS_COLLECTION).doc(userId);
        const appDataToSave = {
            tasks: data.tasks || [],
            projects: data.projects || [],
            kanbanColumns: data.kanbanColumns || [],
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        };

        await userDocRef.collection(APP_DATA_DOC).doc(USER_SPECIFIC_DATA_DOC).set(appDataToSave);

        LoggingService.info(`[FirebaseService] User data saved successfully for user ${userId}.`, { functionName, userId });
    } catch (error) {
        LoggingService.error(`[FirebaseService] Error saving user data for ${userId}:`, error, { functionName, userId });
        throw error;
    }
}

/**
 * Loads the user's application data from Firestore ONCE.
 * @param {string} userId - The UID of the user.
 * @returns {Promise<object|null>} An object containing tasks, projects, and kanbanColumns, or null if not found/error.
 */
export async function loadUserDataFromFirestore(userId) {
    const functionName = 'loadUserDataFromFirestore (firebaseService)';
    if (!userId) {
        LoggingService.error('[FirebaseService] User ID is required to load data.', new Error('MissingUserId'), { functionName });
        return null;
    }

    const db = getFirestoreInstance();
    if (!db) {
        LoggingService.error('[FirebaseService] Firestore instance not available.', new Error('FirestoreUnavailable'), { functionName, userId });
        return null;
    }

    LoggingService.info(`[FirebaseService] Attempting to load data ONCE for user ${userId}.`, { functionName, userId });

    try {
        const userDocRef = db.collection(USERS_COLLECTION).doc(userId);
        const appDataDoc = await userDocRef.collection(APP_DATA_DOC).doc(USER_SPECIFIC_DATA_DOC).get();

        if (appDataDoc.exists) {
            const data = appDataDoc.data();
            LoggingService.info(`[FirebaseService] User data loaded successfully (once) for user ${userId}.`, {
                functionName,
                userId,
                tasksCount: data.tasks?.length || 0,
                projectsCount: data.projects?.length || 0
            });
            return {
                tasks: data.tasks || [],
                projects: data.projects || [],
                kanbanColumns: data.kanbanColumns || []
            };
        } else {
            LoggingService.info(`[FirebaseService] No data found for user ${userId} (load once). Returning empty structure.`, { functionName, userId });
            return {
                tasks: [],
                projects: [],
                kanbanColumns: []
            };
        }
    } catch (error) {
        LoggingService.error(`[FirebaseService] Error loading user data (once) for ${userId}:`, error, { functionName, userId });
        return null;
    }
}

/**
 * Sets up a real-time stream for user's application data from Firestore.
 * @param {string} userId - The UID of the user.
 * @param {function} callback - Function to call with the data snapshot. Receives (data, error).
 * @returns {function} Unsubscribe function to detach the listener, or null if setup failed.
 */
export function streamUserDataFromFirestore(userId, callback) {
    const functionName = 'streamUserDataFromFirestore (firebaseService)';
    if (!userId) {
        LoggingService.error('[FirebaseService] User ID is required to stream data.', new Error('MissingUserId'), { functionName });
        if (callback) callback(null, new Error('MissingUserIde'));
        return null;
    }
    if (typeof callback !== 'function') {
        LoggingService.error('[FirebaseService] Callback function is required to stream data.', new Error('MissingCallback'), { functionName, userId });
        return null;
    }

    const db = getFirestoreInstance();
    if (!db) {
        LoggingService.error('[FirebaseService] Firestore instance not available for streaming.', new Error('FirestoreUnavailable'), { functionName, userId });
        if (callback) callback(null, new Error('FirestoreUnavailable'));
        return null;
    }

    LoggingService.info(`[FirebaseService] Setting up real-time stream for user ${userId}.`, { functionName, userId });

    const userDocRef = db.collection(USERS_COLLECTION).doc(userId)
                         .collection(APP_DATA_DOC).doc(USER_SPECIFIC_DATA_DOC);

    const unsubscribe = userDocRef.onSnapshot(docSnapshot => {
        LoggingService.debug(`[FirebaseService] Snapshot received for user ${userId}.`, { functionName, userId, docExists: docSnapshot.exists });
        if (docSnapshot.exists) {
            const data = docSnapshot.data();
            callback({
                tasks: data.tasks || [],
                projects: data.projects || [],
                kanbanColumns: data.kanbanColumns || []
            }, null);
        } else {
            LoggingService.info(`[FirebaseService] No data document found for user ${userId} in stream. Providing empty structure.`, { functionName, userId });
            // Call back with empty structure so the app can reset or show "no data" state
            callback({
                tasks: [],
                projects: [],
                kanbanColumns: []
            }, null);
        }
    }, error => {
        LoggingService.error(`[FirebaseService] Error in real-time stream for user ${userId}:`, error, { functionName, userId });
        callback(null, error);
    });

    return unsubscribe; // Return the unsubscribe function
}


/**
 * Deletes all application data for a specific user from Firestore.
 * @param {string} userId - The UID of the user whose data is to be deleted.
 * @returns {Promise<void>}
 */
export async function deleteUserDataFromFirestore(userId) {
    const functionName = 'deleteUserDataFromFirestore (firebaseService)';
    if (!userId) {
        LoggingService.error('[FirebaseService] User ID is required to delete data.', new Error('MissingUserId'), { functionName });
        return;
    }
    const db = getFirestoreInstance();
    if (!db) {
        LoggingService.error('[FirebaseService] Firestore instance not available for deleting data.', new Error('FirestoreUnavailable'), { functionName });
        return;
    }
    try {
        await db.collection(USERS_COLLECTION).doc(userId).collection(APP_DATA_DOC).doc(USER_SPECIFIC_DATA_DOC).delete();
        LoggingService.info(`[FirebaseService] All app data deleted for user ${userId}.`, { functionName, userId });
    } catch (error) {
        LoggingService.error(`[FirebaseService] Error deleting app data for user ${userId}:`, error, { functionName, userId });
        throw error;
    }
}

LoggingService.debug("firebaseService.js loaded.", { module: 'firebaseService' });