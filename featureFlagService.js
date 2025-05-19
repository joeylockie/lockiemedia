// featureFlagService.js
// This service is responsible for loading, managing, and providing access to feature flags.

// Default feature flags structure. This will be overridden by features.json and then by localStorage.
let _featureFlags = {
    testButtonFeature: false,
    reminderFeature: false,
    taskTimerSystem: false,
    advancedRecurrence: false,
    fileAttachments: false,
    integrationsServices: false,
    userAccounts: false,
    collaborationSharing: false,
    crossDeviceSync: false,
    tooltipsGuide: false,
    subTasksFeature: false,
    kanbanBoardFeature: false,
    projectFeature: false,
    exportDataFeature: false,
    calendarViewFeature: false,
    taskDependenciesFeature: false,
    smarterSearchFeature: false,
    bulkActionsFeature: false,
    pomodoroTimerHybridFeature: false
};

/**
 * Asynchronously loads feature flags from features.json and localStorage.
 * This function should be called once during application startup.
 * It updates the internal _featureFlags object.
 * @async
 */
async function loadFeatureFlags() {
    console.log('[FeatureFlagService] Initial default flags:', JSON.parse(JSON.stringify(_featureFlags)));
    const baseFlags = { ..._featureFlags }; // Start with a copy of defaults

    try {
        const response = await fetch('features.json?cachebust=' + new Date().getTime());
        if (!response.ok) {
            console.warn('[FeatureFlagService] Failed to load features.json, using default flags. Status:', response.status);
        } else {
            const fetchedFlagsFromFile = await response.json();
            console.log('[FeatureFlagService] Flags loaded from features.json:', fetchedFlagsFromFile);
            // Merge, giving precedence to fetchedFlagsFromFile over defaults
            Object.assign(baseFlags, fetchedFlagsFromFile);
            console.log('[FeatureFlagService] Flags after merging features.json:', JSON.parse(JSON.stringify(baseFlags)));
        }
    } catch (error) {
        console.error('[FeatureFlagService] Error loading or parsing features.json:', error);
    }

    const userFlagsString = localStorage.getItem('userFeatureFlags');
    if (userFlagsString) {
        try {
            const userFlagsFromStorage = JSON.parse(userFlagsString);
            console.log('[FeatureFlagService] User flags found in localStorage:', userFlagsFromStorage);
            // Merge, giving precedence to userFlagsFromStorage over current baseFlags
            Object.assign(baseFlags, userFlagsFromStorage);
            console.log('[FeatureFlagService] Flags after merging localStorage:', JSON.parse(JSON.stringify(baseFlags)));
        } catch (e) {
            console.error('[FeatureFlagService] Error parsing userFeatureFlags from localStorage:', e);
        }
    } else {
        console.log('[FeatureFlagService] No userFeatureFlags found in localStorage.');
    }

    // Ensure all known flags (from the initial default structure) are boolean
    // and that no unknown flags from localStorage/JSON have polluted the structure.
    const finalFlags = {};
    const allKnownFlagKeys = Object.keys(_featureFlags); // Use initial default keys as the source of truth for structure

    allKnownFlagKeys.forEach(key => {
        if (typeof baseFlags[key] === 'boolean') {
            finalFlags[key] = baseFlags[key];
        } else {
            console.warn(`[FeatureFlagService] Flag "${key}" was not a boolean or was missing after loading. Defaulting to initial default: ${_featureFlags[key]}.`);
            finalFlags[key] = _featureFlags[key]; // Revert to initial default if type is wrong or missing
        }
    });

    _featureFlags = finalFlags; // Update the service's internal state

    console.log('[FeatureFlagService] Final feature flags loaded and validated:', JSON.parse(JSON.stringify(_featureFlags)));
    
    // Make the loaded flags available globally for other modules (e.g., store.js)
    // This is a temporary measure. Ideally, modules would import this service.
    // Or, the store.js would explicitly call getFeatureFlags() after load.
    if (window.store && typeof window.store.setFeatureFlags === 'function') {
        window.store.setFeatureFlags(_featureFlags);
    } else if (window.featureFlags) { // Fallback for direct global access if store not ready
        Object.assign(window.featureFlags, _featureFlags);
    }
}

/**
 * Checks if a specific feature is enabled.
 * @param {string} featureName - The name of the feature flag (e.g., 'projectFeature').
 * @returns {boolean} True if the feature is enabled, false otherwise.
 */
function isFeatureEnabled(featureName) {
    if (typeof _featureFlags[featureName] === 'boolean') {
        return _featureFlags[featureName];
    }
    // console.warn(`[FeatureFlagService] Attempted to check unknown feature flag: ${featureName}. Returning false.`);
    return false; // Default to false for unknown flags
}

/**
 * Returns a copy of all current feature flags.
 * @returns {Object} A copy of the feature flags object.
 */
function getAllFeatureFlags() {
    return { ..._featureFlags };
}

/**
 * Allows setting a feature flag dynamically, primarily for user overrides.
 * Also saves the updated flags to localStorage.
 * @param {string} flagName - The name of the feature flag.
 * @param {boolean} value - The new boolean value for the flag.
 */
function setFeatureFlag(flagName, value) {
    if (typeof value !== 'boolean') {
        console.error(`[FeatureFlagService] Invalid value for feature flag "${flagName}". Must be boolean.`);
        return;
    }
    if (_featureFlags.hasOwnProperty(flagName)) {
        _featureFlags[flagName] = value;
        console.log(`[FeatureFlagService] Feature flag "${flagName}" set to ${value}.`);
        
        // Save all current flags (including user overrides) to localStorage
        const userOverriddenFlags = {};
        const defaultFlagsForComparison = { // Re-fetch initial defaults for comparison
            testButtonFeature: false, reminderFeature: false, taskTimerSystem: false, advancedRecurrence: false,
            fileAttachments: false, integrationsServices: false, userAccounts: false, collaborationSharing: false,
            crossDeviceSync: false, tooltipsGuide: false, subTasksFeature: false, kanbanBoardFeature: false,
            projectFeature: false, exportDataFeature: false, calendarViewFeature: false, taskDependenciesFeature: false,
            smarterSearchFeature: false, bulkActionsFeature: false, pomodoroTimerHybridFeature: false
        };

        // Only save flags to localStorage that differ from the hardcoded defaults or were not in defaults (new flags from JSON)
        // This is a bit complex. A simpler approach is to just save all current _featureFlags.
        // For now, let's save all current flags to ensure user preferences are kept.
        localStorage.setItem('userFeatureFlags', JSON.stringify(_featureFlags));

        // Notify other parts of the application if necessary (e.g., via an event bus or callbacks)
        // For example, trigger applyActiveFeatures() if it's globally available
        if (typeof applyActiveFeatures === 'function') {
            applyActiveFeatures();
        }
         // Also update the global featureFlags object if it's being used directly by other modules
        if (window.featureFlags) {
            window.featureFlags[flagName] = value;
        }


    } else {
        console.warn(`[FeatureFlagService] Attempted to set unknown feature flag: ${flagName}.`);
    }
}


// Expose public interface (globally for now, ideally through module exports later)
// The loadFeatureFlags should be called early in the application lifecycle.
// The (async () => await loadFeatureFlags())() pattern in store.js will handle this.

window.FeatureFlagService = {
    loadFeatureFlags,
    isFeatureEnabled,
    getAllFeatureFlags,
    setFeatureFlag // For UI toggles to interact with
};

// console.log("featureFlagService.js loaded");
