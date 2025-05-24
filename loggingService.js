// loggingService.js

/**
 * Defines the available log levels.
 * Lower numbers indicate higher verbosity.
 */
export const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    CRITICAL: 4,
    NONE: 5 // To disable all logging
};

// Default log level. This can be changed dynamically.
// For a client-side app, this could be set via localStorage or a feature flag for easier debugging.
let currentLogLevel = LOG_LEVELS.INFO;

// Check for a debug mode feature flag to set a more verbose log level initially.
// This assumes featureFlagService.js and its isFeatureEnabled are loaded and available globally or correctly imported if this runs later.
// For simplicity in this standalone module, we'll keep it like this, but in main.js, you might set this after flags are loaded.
try {
    if (typeof window.isFeatureEnabled === 'function' && window.isFeatureEnabled('debugMode')) { // Example 'debugMode' flag
        currentLogLevel = LOG_LEVELS.DEBUG;
    }
} catch (e) {
    // If isFeatureEnabled is not ready, we'll stick to the default.
    console.warn('[LoggingService] Could not check debugMode feature flag at initialization. Defaulting log level.', e);
}


/**
 * Internal log function.
 * @param {number} level - The log level of the message.
 * @param {string} message - The main log message.
 * @param {Error} [errorObject] - An optional Error object associated with the log.
 * @param {object} [context={}] - Additional context as an object.
 */
function _log(level, message, errorObject, context = {}) {
    if (level < currentLogLevel) {
        return; // Don't log messages below the current level
    }

    const timestamp = new Date().toISOString();
    const levelName = Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level) || 'UNKNOWN';

    const logEntry = {
        timestamp,
        level: levelName,
        message,
        context: { ...context } // Shallow copy context
    };

    if (errorObject instanceof Error) {
        logEntry.error = {
            name: errorObject.name,
            message: errorObject.message,
            stack: errorObject.stack
        };
    }

    // Output to console
    const consoleMethod = levelName.toLowerCase();
    if (console[consoleMethod]) {
        console[consoleMethod](`[${timestamp}] [${levelName}] ${message}`, errorObject || '', context);
    } else {
        console.log(`[${timestamp}] [${levelName}] ${message}`, errorObject || '', context);
    }

    // Future extension: Send to remote logging service
    // if (level >= LOG_LEVELS.ERROR) {
    //     sendToRemoteLoggingService(logEntry);
    // }
}

/**
 * Public logging methods.
 */
const LoggingService = {
    debug: (message, context) => _log(LOG_LEVELS.DEBUG, message, null, context),
    info: (message, context) => _log(LOG_LEVELS.INFO, message, null, context),
    warn: (message, context) => _log(LOG_LEVELS.WARN, message, null, context),
    error: (message, errorObject, context) => _log(LOG_LEVELS.ERROR, message, errorObject, context),
    critical: (message, errorObject, context) => _log(LOG_LEVELS.CRITICAL, message, errorObject, context),

    /**
     * Sets the current logging level.
     * @param {string} levelName - The name of the log level (e.g., 'DEBUG', 'INFO').
     */
    setLevel: (levelName) => {
        const newLevel = LOG_LEVELS[levelName.toUpperCase()];
        if (typeof newLevel === 'number') {
            currentLogLevel = newLevel;
            // Use console.info directly here to ensure this message always appears, regardless of currentLogLevel.
            console.info(`[LoggingService] Log level set to: ${levelName.toUpperCase()}`);
        } else {
            // Use console.warn for invalid level setting.
            console.warn(`[LoggingService] Invalid log level provided: ${levelName}`);
        }
    },

    /**
     * Gets the current logging level name.
     * @returns {string}
     */
    getCurrentLevelName: () => {
        return Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === currentLogLevel) || 'UNKNOWN';
    }
};

export default LoggingService;

console.log("loggingService.js loaded as ES6 module.");