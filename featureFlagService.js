// featureFlagService.js
// This service is responsible for loading, managing, and providing access to feature flags.

import AppStore from './store.js';
import EventBus from './eventBus.js';
// NEW: Import LoggingService
import LoggingService from './loggingService.js';

// Default feature flags structure. This will be overridden by features.json and then by localStorage.
let _featureFlags = { //
    testButtonFeature: false, //
    reminderFeature: false, //
    taskTimerSystem: false, //
    advancedRecurrence: false, //
    fileAttachments: false, //
    integrationsServices: false, //
    userAccounts: false, //
    collaborationSharing: false, //
    crossDeviceSync: false, //
    tooltipsGuide: false, //
    subTasksFeature: false, //
    kanbanBoardFeature: false, //
    projectFeature: false, //
    exportDataFeature: false, //
    calendarViewFeature: false, //
    taskDependenciesFeature: false, //
    smarterSearchFeature: false, //
    bulkActionsFeature: false, //
    pomodoroTimerHybridFeature: false, //
    backgroundFeature: false, //
    contactUsFeature: false, // Added new feature flag
    // NEW: Add debugMode flag for logging control demonstration
    debugMode: false
};

/**
 * Asynchronously loads feature flags from features.json and localStorage.
 * This function should be called once during application startup (e.g., by main.js).
 * It updates the internal _featureFlags object and sets them in the AppStore.
 * @async
 */
export async function loadFeatureFlags() {
    // MODIFIED: Use LoggingService
    LoggingService.info('[FeatureFlagService] Initializing feature flags...', { initialDefaults: JSON.parse(JSON.stringify(_featureFlags)) });
    const baseFlags = { ..._featureFlags }; // Start with a copy of defaults

    try {
        const response = await fetch('features.json?cachebust=' + new Date().getTime()); //
        if (!response.ok) {
            // MODIFIED: Use LoggingService
            LoggingService.warn(`[FeatureFlagService] Failed to load features.json, using default flags. Status: ${response.status}`, { url: 'features.json', status: response.status });
        } else {
            const fetchedFlagsFromFile = await response.json(); //
            // MODIFIED: Use LoggingService
            LoggingService.debug('[FeatureFlagService] Flags loaded from features.json:', { fetchedFlags: fetchedFlagsFromFile });
            Object.assign(baseFlags, fetchedFlagsFromFile); // Merge, features.json overrides defaults
        }
    } catch (error) {
        // MODIFIED: Use LoggingService
        LoggingService.error('[FeatureFlagService] Error loading or parsing features.json. Using defaults.', error, { url: 'features.json' });
    }

    const userFlagsString = localStorage.getItem('userFeatureFlags'); //
    if (userFlagsString) { //
        try {
            const userFlagsFromStorage = JSON.parse(userFlagsString); //
            // MODIFIED: Use LoggingService
            LoggingService.debug('[FeatureFlagService] User flags found in localStorage:', { userFlags: userFlagsFromStorage });
            Object.assign(baseFlags, userFlagsFromStorage); // Merge, localStorage overrides current baseFlags
        } catch (e) {
            // MODIFIED: Use LoggingService
            LoggingService.error('[FeatureFlagService] Error parsing userFeatureFlags from localStorage. These flags will be ignored.', e, { item: 'userFeatureFlags' });
        }
    } else {
        // MODIFIED: Use LoggingService
        LoggingService.debug('[FeatureFlagService] No userFeatureFlags found in localStorage.');
    }

    const finalFlags = {}; //
    const allKnownFlagKeys = Object.keys(_featureFlags);  //

    allKnownFlagKeys.forEach(key => { //
        if (typeof baseFlags[key] === 'boolean') { //
            finalFlags[key] = baseFlags[key]; //
        } else {
            // MODIFIED: Use LoggingService
            LoggingService.warn(`[FeatureFlagService] Flag "${key}" was not a boolean or was missing after loading. Defaulting to initial default: ${_featureFlags[key]}.`, { key, loadedValue: baseFlags[key], defaultValue: _featureFlags[key] });
            finalFlags[key] = _featureFlags[key];  //
        }
    });
    _featureFlags = finalFlags; //

    // MODIFIED: Use LoggingService
    LoggingService.info('[FeatureFlagService] Final feature flags loaded and validated.', { finalFlags: JSON.parse(JSON.stringify(_featureFlags)) });
    
    if (AppStore && typeof AppStore.setFeatureFlags === 'function') { //
        AppStore.setFeatureFlags(_featureFlags); // This will publish 'featureFlagsInitialized' from AppStore
    } else {
        // MODIFIED: Use LoggingService
        LoggingService.error("[FeatureFlagService] AppStore.setFeatureFlags is not available! Cannot set flags in store.", new Error("AppStoreUnavailable"));
        if (window.featureFlags) Object.assign(window.featureFlags, _featureFlags); // Legacy fallback
        if (EventBus && !AppStore?.setFeatureFlags) EventBus.publish('featureFlagsInitialized', _featureFlags); //
    }
}

/**
 * Checks if a specific feature is enabled.
 * @param {string} featureName - The name of the feature flag (e.g., 'projectFeature').
 * @returns {boolean} True if the feature is enabled, false otherwise.
 */
export function isFeatureEnabled(featureName) { //
    if (typeof _featureFlags[featureName] === 'boolean') { //
        return _featureFlags[featureName]; //
    }
    // MODIFIED: Log a warning for unknown flags, but only once per session perhaps, or at DEBUG level to avoid noise.
    // For now, a simple debug log is fine.
    LoggingService.debug(`[FeatureFlagService] Unknown feature flag checked: "${featureName}". Defaulting to false.`, { featureName });
    return false; 
}

/**
 * Returns a copy of all current feature flags.
 * @returns {Object} A copy of the feature flags object.
 */
export function getAllFeatureFlags() { //
    return { ..._featureFlags }; //
}

/**
 * Allows setting a feature flag dynamically, primarily for user overrides.
 * Also saves the updated flags to localStorage and publishes an event.
 * @param {string} flagName - The name of the feature flag.
 * @param {boolean} value - The new boolean value for the flag.
 */
export function setFeatureFlag(flagName, value) { //
    if (typeof value !== 'boolean') { //
        // MODIFIED: Use LoggingService
        LoggingService.error(`[FeatureFlagService] Invalid value for feature flag "${flagName}". Must be boolean.`, new TypeError("Invalid flag value type"), { flagName, receivedValue: value });
        return; //
    }
    if (_featureFlags.hasOwnProperty(flagName)) { //
        _featureFlags[flagName] = value; //
        // MODIFIED: Use LoggingService
        LoggingService.info(`[FeatureFlagService] Feature flag "${flagName}" set to ${value}.`, { flagName, newValue: value });
        
        try {
            localStorage.setItem('userFeatureFlags', JSON.stringify(_featureFlags)); //
        } catch (e) {
            // NEW: Log localStorage saving error
            LoggingService.error(`[FeatureFlagService] Failed to save userFeatureFlags to localStorage after setting "${flagName}".`, e, { item: 'userFeatureFlags' });
        }

        if (AppStore && typeof AppStore.setFeatureFlags === 'function') { //
            if (AppStore.getFeatureFlags()[flagName] !== value) { //
                 AppStore.setFeatureFlags({ ..._featureFlags }); //
            }
        } else if (window.featureFlags) { // Legacy global fallback
             window.featureFlags[flagName] = value; //
        }
        
        if (EventBus) { //
            EventBus.publish('featureFlagsUpdated', { flagName, value, allFlags: { ..._featureFlags } }); //
        }
    } else {
        // MODIFIED: Use LoggingService
        LoggingService.warn(`[FeatureFlagService] Attempted to set unknown feature flag: ${flagName}.`, { flagName });
    }
}

// MODIFIED: Use LoggingService
LoggingService.debug("featureFlagService.js loaded as ES6 module.", { module: 'featureFlagService' });