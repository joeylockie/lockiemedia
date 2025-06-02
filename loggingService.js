// loggingService.js

// REMOVED: import { getFirestoreInstance } from './feature_user_accounts.js';

/**
 * Defines the available log levels.
 */
export const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    CRITICAL: 4,
    NONE: 5 // To disable all logging
};

let currentLogLevel = LOG_LEVELS.INFO;
let _firestoreDBInstance = null; // To store the Firestore instance

// Function to get current user ID, simplified
function getCurrentAuthUID() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        const currentUser = firebase.auth().currentUser;
        return currentUser ? currentUser.uid : null;
    }
    return null;
}
function getCurrentUserEmail() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        const currentUser = firebase.auth().currentUser;
        return currentUser ? currentUser.email : 'anonymous';
    }
    return 'anonymous';
}

function initializeLogLevel() {
    try {
        if (typeof window.isFeatureEnabled === 'function' && window.isFeatureEnabled('debugMode')) {
            currentLogLevel = LOG_LEVELS.DEBUG;
        }
    } catch (e) {
        console.warn('[LoggingService] Could not check debugMode feature flag during log level initialization. Defaulting log level.', e);
    }
}
initializeLogLevel();

/**
 * Initializes the Firestore logging capability.
 * This should be called after Firebase Firestore has been initialized elsewhere.
 * @param {object} dbInstance - The initialized Firebase Firestore instance.
 */
export function initializeFirestoreLogging(dbInstance) {
    if (dbInstance) {
        _firestoreDBInstance = dbInstance;
        // console.info('[LoggingService] Firestore logging initialized.'); // Use console to avoid self-call
    } else {
        console.warn('[LoggingService] Firestore instance not provided for logging initialization.');
    }
}

async function sendLogToFirestore(logEntry) {
    if (!_firestoreDBInstance) {
        // console.warn('[LoggingService] Firestore instance not available for LoggingService. Log not sent to Firestore.', logEntry);
        return;
    }

    logEntry.userId = getCurrentAuthUID();
    logEntry.userEmail = getCurrentUserEmail();
    
    // Ensure firebase.firestore.FieldValue is available
    if (typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.FieldValue) {
        logEntry.clientTimestamp = firebase.firestore.FieldValue.serverTimestamp();
    } else {
        // Fallback if serverTimestamp is not available (should not happen if Firebase is loaded)
        logEntry.clientTimestamp = new Date(); 
        console.warn('[LoggingService] firebase.firestore.FieldValue.serverTimestamp() not available. Using client Date for log timestamp.');
    }


    try {
        await _firestoreDBInstance.collection('app_errors').add(logEntry);
    } catch (error) {
        console.error('[LoggingService] Error sending log to Firestore:', error, logEntry);
    }
}

function _log(level, message, errorObject, context = {}) {
    if (level < currentLogLevel) {
        return;
    }

    const timestamp = new Date().toISOString();
    const levelName = Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level) || 'UNKNOWN';

    const logEntry = {
        timestamp,
        level: levelName,
        message,
        context: { ...(typeof context === 'object' && context !== null ? context : {}) },
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };

    if (errorObject instanceof Error) {
        logEntry.error = {
            name: errorObject.name,
            message: errorObject.message,
            stack: errorObject.stack
        };
    } else if (errorObject !== null && typeof errorObject !== 'undefined') {
        logEntry.context.errorObject = errorObject;
    }

    const consoleMethod = levelName.toLowerCase();
    if (console[consoleMethod]) {
        console[consoleMethod](`[${timestamp}] [${levelName}] ${message}`, errorObject || '', logEntry.context);
    } else {
        console.log(`[${timestamp}] [${levelName}] ${message}`, errorObject || '', logEntry.context);
    }

    if (level >= LOG_LEVELS.ERROR && _firestoreDBInstance) { // Check if _firestoreDBInstance is set
        sendLogToFirestore(logEntry);
    } else if (level >= LOG_LEVELS.ERROR && !_firestoreDBInstance) {
        // console.warn(`[LoggingService] Firestore not initialized for error logging. Log for "${message}" not sent to Firestore.`);
    }
}

const LoggingService = {
    debug: (message, context) => _log(LOG_LEVELS.DEBUG, message, null, context),
    info: (message, context) => _log(LOG_LEVELS.INFO, message, null, context),
    warn: (message, context) => _log(LOG_LEVELS.WARN, message, null, context),
    error: (message, errorObject, context) => _log(LOG_LEVELS.ERROR, message, errorObject, context),
    critical: (message, errorObject, context) => _log(LOG_LEVELS.CRITICAL, message, errorObject, context),
    setLevel: (levelName) => {
        const newLevel = LOG_LEVELS[String(levelName).toUpperCase()];
        if (typeof newLevel === 'number') {
            currentLogLevel = newLevel;
            console.info(`[LoggingService] Log level set to: ${String(levelName).toUpperCase()}`);
        } else {
            console.warn(`[LoggingService] Invalid log level provided: ${levelName}`);
        }
    },
    getCurrentLevelName: () => {
        return Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === currentLogLevel) || 'UNKNOWN';
    },
    initializeLogLevel,
    initializeFirestoreLogging // Expose the new initializer
};

export default LoggingService;

// console.log("loggingService.js module parsed. Firestore logging will be enabled upon initializeFirestoreLogging call.");