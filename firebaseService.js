// firebaseService.js
// Handles all direct interactions with Firebase Firestore.

import LoggingService from './loggingService.js';
import { getFirestoreInstance } from './feature_user_accounts.js'; // To get the initialized DB instance

const USERS_COLLECTION = 'users';
const TASKS_SUBCOLLECTION = 'tasks';
const PROJECTS_SUBCOLLECTION = 'projects';
const KANBAN_SUBCOLLECTION = 'kanbanColumns'; // Changed from 'kanbanColumns' to 'kanbanLayout' for example
const APP_DATA_DOC = 'appData'; // A single document to hold collections for tasks, projects etc.

/**
 * Saves the user's application data (tasks, projects, kanban columns) to Firestore.
 * Data is stored in a single document 'appData' within a user-specific document.
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

    LoggingService.info(`[FirebaseService] Attempting to save data for user ${userId}.`, { functionName, userId, dataKeys: Object.keys(data) });

    try {
        const userDocRef = db.collection(USERS_COLLECTION).doc(userId);
        // We will store tasks, projects, and kanbanColumns as simple arrays within the 'appData' document.
        // Firestore is schema-less, so we can directly set these.
        // For more complex scenarios or larger collections, subcollections for each might be better,
        // but for a to-do app, storing them as arrays in one doc per user is often sufficient to start.

        const appDataToSave = {
            tasks: data.tasks || [],
            projects: data.projects || [],
            kanbanColumns: data.kanbanColumns || [],
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp() // Use server timestamp
        };

        await userDocRef.collection(APP_DATA_DOC).doc('userSpecificData').set(appDataToSave);

        LoggingService.info(`[FirebaseService] User data saved successfully for user ${userId}.`, { functionName, userId });
    } catch (error) {
        LoggingService.error(`[FirebaseService] Error saving user data for ${userId}:`, error, { functionName, userId });
        // Potentially re-throw or handle more gracefully
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
        const appDataDoc = await userDocRef.collection(APP_DATA_DOC).doc('userSpecificData').get();

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
                // Ensure all expected parts of your store are here or handled with defaults in store.js
            };
        } else {
            LoggingService.info(`[FirebaseService] No data found for user ${userId}. Returning empty structure.`, { functionName, userId });
            // Return a default structure if no data exists, so the app can initialize correctly.
            return {
                tasks: [],
                projects: [], // Ensure a default "No Project" might be added by store.js later
                kanbanColumns: [] // Default columns might be set by store.js if this is empty
            };
        }
    } catch (error) {
        LoggingService.error(`[FirebaseService] Error loading user data for ${userId}:`, error, { functionName, userId });
        return null; // Or re-throw
    }
}


// Placeholder for deleting all user data if needed, e.g., on account deletion.
// This is a more complex operation due to subcollections if you choose that path.
// For the current structure (one doc with arrays), it's simpler:
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
        await db.collection(USERS_COLLECTION).doc(userId).collection(APP_DATA_DOC).doc('userSpecificData').delete();
        LoggingService.info(`[FirebaseService] All app data deleted for user ${userId}.`, { functionName, userId });
    } catch (error) {
        LoggingService.error(`[FirebaseService] Error deleting app data for user ${userId}:`, error, { functionName, userId });
        throw error;
    }
}


LoggingService.debug("firebaseService.js loaded.", { module: 'firebaseService' });