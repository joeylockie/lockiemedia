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

let currentLogLevel = LOG_LEVELS.INFO; // Default log level
let _firestoreDBInstance = null; // To store the Firestore instance
let _isFirestoreLoggingInitialized = false;

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
    const functionName = 'initializeLogLevel (LoggingService)';
    try {
        // Check if featureFlagService is loaded and isFeatureEnabled is available
        // This is a common pattern, but featureFlagService itself uses LoggingService,
        // so direct check here might be tricky during initial load order.
        // We'll rely on a global or a passed-in flag if available, or a default.
        if (typeof window.isFeatureEnabled === 'function' && window.isFeatureEnabled('debugMode')) {
            currentLogLevel = LOG_LEVELS.DEBUG;
            console.log(`[${new Date().toISOString()}] [LoggingService:INFO] Log level set to DEBUG by feature flag.`);
        } else {
            // Attempt to read from localStorage as a fallback if feature flags aren't ready
            const storedPrefs = localStorage.getItem('userPreferences_v1');
            if (storedPrefs) {
                const prefs = JSON.parse(storedPrefs);
                if (prefs && prefs.debugSettings && prefs.debugSettings.logLevel) {
                    const levelKey = String(prefs.debugSettings.logLevel).toUpperCase();
                    if (LOG_LEVELS.hasOwnProperty(levelKey)) {
                        currentLogLevel = LOG_LEVELS[levelKey];
                        console.log(`[${new Date().toISOString()}] [LoggingService:INFO] Log level set to ${levelKey} from localStorage.`);
                    }
                } else if (prefs && typeof prefs.debugMode === 'boolean' && prefs.debugMode) {
                    currentLogLevel = LOG_LEVELS.DEBUG;
                     console.log(`[${new Date().toISOString()}] [LoggingService:INFO] Log level set to DEBUG from localStorage 'debugMode' preference.`);
                }
            }
             else {
                console.log(`[${new Date().toISOString()}] [LoggingService:INFO] Log level defaulted to INFO. Feature flags or localStorage settings not available or not set for logging.`);
            }
        }
    } catch (e) {
        console.warn('[LoggingService] Could not check debugMode feature flag during log level initialization. Defaulting log level to INFO.', e);
        currentLogLevel = LOG_LEVELS.INFO; // Ensure it defaults if there's an error
    }
}
initializeLogLevel(); // Initialize on load

/**
 * Initializes the Firestore logging capability.
 * This should be called after Firebase Firestore has been initialized elsewhere.
 * @param {object} dbInstance - The initialized Firebase Firestore instance.
 */
export function initializeFirestoreLogging(dbInstance) {
    const functionName = "initializeFirestoreLogging (LoggingService)";
    if (dbInstance) {
        _firestoreDBInstance = dbInstance;
        _isFirestoreLoggingInitialized = true;
        console.info(`[${new Date().toISOString()}] [LoggingService:INFO] Firestore logging successfully initialized.`);
    } else {
        _isFirestoreLoggingInitialized = false;
        console.warn(`[${new Date().toISOString()}] [LoggingService:WARN] Firestore instance not provided for logging initialization. Firestore logging disabled.`);
    }
}

async function sendLogToFirestore(logEntryData) {
    if (!_isFirestoreLoggingInitialized || !_firestoreDBInstance) {
        // console.warn('[LoggingService] Firestore instance not available for LoggingService. Log not sent to Firestore.', logEntryData);
        return;
    }

    const enrichedLogEntry = {
        ...logEntryData, // Contains level, message, context, error, url, userAgent
        userId: getCurrentAuthUID() || 'unknown',
        userEmail: getCurrentUserEmail() || 'anonymous',
        clientTimestamp: new Date().toISOString(), // Client-side timestamp for immediate reference
        serverTimestamp: firebase.firestore.FieldValue.serverTimestamp() // Server-side timestamp for accurate ordering
    };

    // Remove potentially very large or problematic fields before sending to Firestore
    if (enrichedLogEntry.context?.event && typeof enrichedLogEntry.context.event === 'object') {
        // Avoid logging full event objects which can be huge and circular
        enrichedLogEntry.context.event = `Event type: ${enrichedLogEntry.context.event.type || 'unknown'}`;
    }
    if (enrichedLogEntry.context?.element && typeof enrichedLogEntry.context.element === 'object') {
        enrichedLogEntry.context.element = `Element: ${enrichedLogEntry.context.element.tagName || 'unknown'}${enrichedLogEntry.context.element.id ? '#' + enrichedLogEntry.context.element.id : ''}`;
    }


    try {
        await _firestoreDBInstance.collection('app_errors').add(enrichedLogEntry);
        // console.log(`[${new Date().toISOString()}] [LoggingService:DEBUG] Log successfully sent to Firestore. Message: ${enrichedLogEntry.message}`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] [LoggingService:ERROR] Error sending log to Firestore:`, error, enrichedLogEntry);
    }
}

function _log(level, message, errorObject, context = {}) {
    if (level < currentLogLevel) {
        return;
    }

    const timestamp = new Date().toISOString();
    const levelName = Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level) || 'UNKNOWN';

    const logOutputParts = [`[${timestamp}]`, `[APP:${levelName}]`, message];

    // Prepare a clean context for console logging, avoiding circular references or overly large objects
    let consoleContext = {};
    if (typeof context === 'object' && context !== null) {
        try {
            // Simple way to clone and avoid circular issues for console display
            consoleContext = JSON.parse(JSON.stringify(context));
        } catch (e) {
            // If stringify fails, create a simpler representation
            consoleContext.originalContextError = "Could not stringify context";
            Object.keys(context).forEach(key => {
                if (typeof context[key] !== 'object' || context[key] === null) {
                    consoleContext[key] = context[key];
                } else {
                    consoleContext[key] = `[Object ${context[key].constructor ? context[key].constructor.name : ''}]`;
                }
            });
        }
    } else if (context !== null && typeof context !== 'undefined') {
        consoleContext = { value: context };
    }


    const consoleMethod = levelName.toLowerCase();
    if (console[consoleMethod]) {
        if (errorObject) {
            console[consoleMethod](...logOutputParts, consoleContext, errorObject);
        } else {
            console[consoleMethod](...logOutputParts, consoleContext);
        }
    } else { // Fallback for unknown levels
        if (errorObject) {
            console.log(...logOutputParts, consoleContext, errorObject);
        } else {
            console.log(...logOutputParts, consoleContext);
        }
    }

    // Prepare log entry for Firestore (for ERROR and CRITICAL levels)
    if (level >= LOG_LEVELS.ERROR) {
        const firestoreLogEntry = {
            level: levelName,
            message: String(message), // Ensure message is a string
            context: {}, // Initialize context
            url: typeof window !== 'undefined' ? window.location.href : 'N/A',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
        };

        // Process context: Ensure it's an object and not overly complex for Firestore
        if (typeof context === 'object' && context !== null) {
            Object.entries(context).forEach(([key, value]) => {
                if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null) {
                    firestoreLogEntry.context[key] = value;
                } else if (typeof value === 'function') {
                    firestoreLogEntry.context[key] = `[Function: ${value.name || 'anonymous'}]`;
                } else {
                    // For other objects, try to stringify or provide a type placeholder
                    try {
                        // Limit depth or size if necessary, or just take top-level properties
                        firestoreLogEntry.context[key] = JSON.parse(JSON.stringify(value, (k, v) => {
                            if (v instanceof Event) return `[Event: ${v.type}]`; // Handle DOM events
                            if (v instanceof HTMLElement) return `[HTMLElement: ${v.tagName}${v.id ? '#'+v.id : ''}]`; // Handle HTML elements
                            return v;
                        }));
                    } catch (e) {
                        firestoreLogEntry.context[key] = `[UnserializableObject: ${Object.prototype.toString.call(value)}]`;
                    }
                }
            });
        } else if (context !== undefined && context !== null) {
            firestoreLogEntry.context.value = String(context);
        }


        if (errorObject instanceof Error) {
            firestoreLogEntry.error = {
                name: errorObject.name || 'Error',
                message: errorObject.message || 'No message',
                stack: errorObject.stack || 'No stack trace'
            };
        } else if (errorObject !== null && typeof errorObject !== 'undefined') {
            // If errorObject is not an Error instance but contains info, add it to context
            firestoreLogEntry.context.nonErrorObject = String(errorObject);
        }

        if (_isFirestoreLoggingInitialized) {
            sendLogToFirestore(firestoreLogEntry);
        } else {
            console.warn(`[${timestamp}] [LoggingService:WARN] Firestore logging not initialized. Error/Critical log for "${message}" NOT sent to Firestore. Details:`, firestoreLogEntry);
        }
    }
}

const LoggingService = {
    debug: (message, context) => _log(LOG_LEVELS.DEBUG, message, null, context),
    info: (message, context) => _log(LOG_LEVELS.INFO, message, null, context),
    warn: (message, contextOrError, potentialContext) => {
        if (contextOrError instanceof Error) {
            _log(LOG_LEVELS.WARN, message, contextOrError, potentialContext);
        } else {
            _log(LOG_LEVELS.WARN, message, null, contextOrError);
        }
    },
    error: (message, errorObject, context) => _log(LOG_LEVELS.ERROR, message, errorObject, context),
    critical: (message, errorObject, context) => _log(LOG_LEVELS.CRITICAL, message, errorObject, context),
    setLevel: (levelNameInput) => {
        const levelName = String(levelNameInput).toUpperCase();
        if (LOG_LEVELS.hasOwnProperty(levelName)) {
            currentLogLevel = LOG_LEVELS[levelName];
            console.info(`[${new Date().toISOString()}] [LoggingService:INFO] Log level set to: ${levelName}`);
        } else {
            console.warn(`[${new Date().toISOString()}] [LoggingService:WARN] Invalid log level provided: ${levelNameInput}. Current level (${LoggingService.getCurrentLevelName()}) maintained.`);
        }
    },
    getCurrentLevelName: () => {
        return Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === currentLogLevel) || 'UNKNOWN';
    },
    LOG_LEVELS, // Expose LOG_LEVELS for external use if needed
    initializeLogLevel, // Expose for re-initialization if feature flags load late
    initializeFirestoreLogging // Expose the new initializer
};

export default LoggingService;

// Initial console log to confirm script load without relying on its own service yet
console.log(`[${new Date().toISOString()}] [LoggingService:LOAD] loggingService.js module parsed. Initial log level: ${LoggingService.getCurrentLevelName()}. Firestore logging pending initialization.`);