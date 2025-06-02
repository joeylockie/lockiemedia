// adminDataService.js - Service for fetching data for the Admin Panel

import LoggingService from './loggingService.js';
// Firebase SDKs are loaded via <script> in admin.html.
// We need a way to get the initialized Firestore instance.
// For consistency, we can import it from where it's initialized (admin_main or feature_user_accounts).
// However, to keep services somewhat independent, admin_main can pass it or this service can get it itself.
// For now, let's assume admin_main will ensure Firebase is initialized.

let firestoreDB; // This will be set by admin_main.js or an init function here.

/**
 * Initializes the AdminDataService with a Firestore instance.
 * @param {object} dbInstance - The initialized Firestore instance.
 */
export function initializeAdminDataService(dbInstance) {
    const functionName = "initializeAdminDataService";
    if (!dbInstance) {
        LoggingService.error("[AdminDataService] Firestore instance not provided during initialization.", new Error("DBInstanceMissing"), { functionName });
        return;
    }
    firestoreDB = dbInstance;
    LoggingService.info("[AdminDataService] Initialized with Firestore instance.", { functionName });
}


/**
 * Fetches error logs from Firestore.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of log objects.
 * @throws {Error} If Firestore is not available or if there's an error during fetching.
 */
export async function fetchErrorLogs() {
    const functionName = 'fetchErrorLogs (AdminDataService)';
    if (!firestoreDB) {
        LoggingService.error('[AdminDataService] FirestoreDB not available for fetching error logs.', new Error("FirestoreInstanceMissing"), { functionName });
        throw new Error('Firestore service is not initialized for AdminDataService.');
    }

    LoggingService.debug('[AdminDataService] Fetching error logs from Firestore.', { functionName });
    try {
        const logsSnapshot = await firestoreDB.collection('app_errors')
                                       .orderBy('clientTimestamp', 'desc') // Order by server-generated timestamp
                                       .limit(100) // Fetch up to 100 recent logs
                                       .get();

        if (logsSnapshot.empty) {
            LoggingService.info('[AdminDataService] No error logs found in Firestore.', { functionName });
            return [];
        }

        const logsData = logsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        LoggingService.info(`[AdminDataService] Successfully fetched ${logsData.length} error logs.`, { functionName, count: logsData.length });
        return logsData;

    } catch (error) {
        LoggingService.error('[AdminDataService] Error fetching error logs from Firestore.', error, { functionName });
        throw error; // Re-throw the error to be handled by the caller
    }
}

/**
 * Fetches a list of users (basic information).
 * This is a placeholder and needs careful implementation regarding data access and privacy.
 * For now, it will just return an empty array.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of user objects.
 */
export async function fetchUserList() {
    const functionName = 'fetchUserList (AdminDataService)';
    LoggingService.info('[AdminDataService] fetchUserList called (placeholder).', { functionName });
    if (!firestoreDB) {
        LoggingService.error('[AdminDataService] FirestoreDB not available for fetching user list.', new Error("FirestoreInstanceMissing"), { functionName });
        // throw new Error('Firestore service is not initialized.');
        return []; // Return empty on error for now
    }
    // TODO: Implement actual user fetching. This requires appropriate Firestore rules
    // for admins to list user documents or a summary collection.
    // Example:
    // const usersSnapshot = await firestoreDB.collection('users').limit(50).get();
    // const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data().profile })); // Assuming profile exists
    // For now, returning an empty array.
    LoggingService.warn('[AdminDataService] User list fetching is not fully implemented. Returning empty array.', { functionName });
    return [];
}

/**
 * Fetches overall application statistics.
 * This is a placeholder.
 * @returns {Promise<object>} A promise that resolves to an object with statistics.
 */
export async function fetchOverviewStats() {
    const functionName = 'fetchOverviewStats (AdminDataService)';
    LoggingService.info('[AdminDataService] fetchOverviewStats called (placeholder).', { functionName });
    // TODO: Implement actual stats fetching (e.g., total users, tasks, projects)
    // This might involve multiple queries or cloud functions for aggregation.
    return {
        totalUsers: 0, // Placeholder
        // errorsToday and activeFeatures are typically derived when their specific data is fetched/displayed
    };
}


LoggingService.info("adminDataService.js loaded.", { module: 'adminDataService' });

const AdminDataService = {
    initializeAdminDataService,
    fetchErrorLogs,
    fetchUserList,
    fetchOverviewStats
};

export default AdminDataService;