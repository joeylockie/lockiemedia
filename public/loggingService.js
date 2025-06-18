// loggingService.js

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

function initializeLogLevel() {
    const functionName = 'initializeLogLevel (LoggingService)';
    try {
        if (typeof window.isFeatureEnabled === 'function' && window.isFeatureEnabled('debugMode')) {
            currentLogLevel = LOG_LEVELS.DEBUG;
            console.log(`[${new Date().toISOString()}] [LoggingService:INFO] Log level set to DEBUG by feature flag.`);
        } else {
             console.log(`[${new Date().toISOString()}] [LoggingService:INFO] Log level defaulted to INFO.`);
        }
    } catch (e) {
        console.warn('[LoggingService] Could not check debugMode feature flag during log level initialization. Defaulting log level to INFO.', e);
        currentLogLevel = LOG_LEVELS.INFO; // Ensure it defaults if there's an error
    }
}
initializeLogLevel(); // Initialize on load

function _log(level, message, errorObject, context = {}) {
    if (level < currentLogLevel) {
        return;
    }

    const timestamp = new Date().toISOString();
    const levelName = Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level) || 'UNKNOWN';

    const logOutputParts = [`[${timestamp}]`, `[APP:${levelName}]`, message];

    let consoleContext = {};
    if (typeof context === 'object' && context !== null) {
        try {
            consoleContext = JSON.parse(JSON.stringify(context));
        } catch (e) {
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
    LOG_LEVELS,
    initializeLogLevel,
    initializeFirestoreLogging: () => {} // Placeholder to prevent errors
};

export default LoggingService;

console.log(`[${new Date().toISOString()}] [LoggingService:LOAD] loggingService.js module parsed. Initial log level: ${LoggingService.getCurrentLevelName()}.`);