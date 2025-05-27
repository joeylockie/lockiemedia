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

    // Ensure global firebase and its firestore FieldValue are available for serverTimestamp
    if (typeof firebase === 'undefined' || typeof firebase.firestore === 'undefined' || typeof firebase.firestore.FieldValue === 'undefined') {
        LoggingService.error('[FirebaseService] firebase.firestore.FieldValue not available for server timestamp.', new Error('FirebaseGlobalMissing'), { functionName, userId });
        // Fallback or throw error, for now logging and proceeding without timestamp if it fails
        // This shouldn't happen if todo.html includes firebase-firestore-compat.js correctly.
    }

    LoggingService.info(`[FirebaseService] Attempting to save data for user ${userId}.`, { functionName, userId, dataKeys: Object.keys(data) });

    try {
        const userDocRef = db.collection(USERS_COLLECTION).doc(userId);
        const appDataToSave = {
            tasks: data.tasks || [],
            projects: data.projects || [],
            kanbanColumns: data.kanbanColumns || [],
            // Use global firebase for FieldValue
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
 * Loads the user's application data from Firestore.
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

    LoggingService.info(`[FirebaseService] Attempting to load data for user ${userId}.`, { functionName, userId });

    try {
        const userDocRef = db.collection(USERS_COLLECTION).doc(userId);
        const appDataDoc = await userDocRef.collection(APP_DATA_DOC).doc(USER_SPECIFIC_DATA_DOC).get();

        if (appDataDoc.exists) {
            const data = appDataDoc.data();
            LoggingService.info(`[FirebaseService] User data loaded successfully for user ${userId}.`, {
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
            LoggingService.info(`[FirebaseService] No data found for user ${userId}. Returning empty structure.`, { functionName, userId });
            return {
                tasks: [],
                projects: [],
                kanbanColumns: []
            };
        }
    } catch (error) {
        LoggingService.error(`[FirebaseService] Error loading user data for ${userId}:`, error, { functionName, userId });
        return null;
    }
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