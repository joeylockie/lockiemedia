// featureFlagService.js
// This service is responsible for loading, managing, and providing access to feature flags.

import AppStore from './store.js'; // Import the AppStore API
import EventBus from './eventBus.js'; // Import EventBus

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
 * This function should be called once during application startup (e.g., by main.js).
 * It updates the internal _featureFlags object and sets them in the AppStore.
 * @async
 */
export async function loadFeatureFlags() {
    console.log('[FeatureFlagService] Initial default flags:', JSON.parse(JSON.stringify(_featureFlags)));
    const baseFlags = { ..._featureFlags }; // Start with a copy of defaults

    try {
        const response = await fetch('features.json?cachebust=' + new Date().getTime());
        if (!response.ok) {
            console.warn('[FeatureFlagService] Failed to load features.json, using default flags. Status:', response.status);
        } else {
            const fetchedFlagsFromFile = await response.json();
            console.log('[FeatureFlagService] Flags loaded from features.json:', fetchedFlagsFromFile);
            Object.assign(baseFlags, fetchedFlagsFromFile); // Merge, features.json overrides defaults
        }
    } catch (error) {
        console.error('[FeatureFlagService] Error loading or parsing features.json:', error);
    }

    const userFlagsString = localStorage.getItem('userFeatureFlags');
    if (userFlagsString) {
        try {
            const userFlagsFromStorage = JSON.parse(userFlagsString);
            console.log('[FeatureFlagService] User flags found in localStorage:', userFlagsFromStorage);
            Object.assign(baseFlags, userFlagsFromStorage); // Merge, localStorage overrides current baseFlags
        } catch (e) {
            console.error('[FeatureFlagService] Error parsing userFeatureFlags from localStorage:', e);
        }
    } else {
        console.log('[FeatureFlagService] No userFeatureFlags found in localStorage.');
    }

    const finalFlags = {};
    const allKnownFlagKeys = Object.keys(_featureFlags); 

    allKnownFlagKeys.forEach(key => {
        if (typeof baseFlags[key] === 'boolean') {
            finalFlags[key] = baseFlags[key];
        } else {
            console.warn(`[FeatureFlagService] Flag "${key}" was not a boolean or was missing after loading. Defaulting to initial default: ${_featureFlags[key]}.`);
            finalFlags[key] = _featureFlags[key]; 
        }
    });
    _featureFlags = finalFlags;

    console.log('[FeatureFlagService] Final feature flags loaded and validated:', JSON.parse(JSON.stringify(_featureFlags)));
    
    // Set the loaded flags in the AppStore
    if (AppStore && typeof AppStore.setFeatureFlags === 'function') {
        AppStore.setFeatureFlags(_featureFlags); // This will publish 'featureFlagsInitialized' from AppStore
    } else {
        console.error("[FeatureFlagService] AppStore.setFeatureFlags is not available!");
        // Fallback if AppStore is not ready, though it should be if script order is correct.
        // This path might indicate a deeper loading issue.
        if (window.featureFlags) Object.assign(window.featureFlags, _featureFlags); // Legacy fallback
        if (EventBus && !AppStore?.setFeatureFlags) EventBus.publish('featureFlagsInitialized', _featureFlags);
    }
}

/**
 * Checks if a specific feature is enabled.
 * @param {string} featureName - The name of the feature flag (e.g., 'projectFeature').
 * @returns {boolean} True if the feature is enabled, false otherwise.
 */
export function isFeatureEnabled(featureName) {
    if (typeof _featureFlags[featureName] === 'boolean') {
        return _featureFlags[featureName];
    }
    return false; 
}

/**
 * Returns a copy of all current feature flags.
 * @returns {Object} A copy of the feature flags object.
 */
export function getAllFeatureFlags() {
    return { ..._featureFlags };
}

/**
 * Allows setting a feature flag dynamically, primarily for user overrides.
 * Also saves the updated flags to localStorage and publishes an event.
 * @param {string} flagName - The name of the feature flag.
 * @param {boolean} value - The new boolean value for the flag.
 */
export function setFeatureFlag(flagName, value) {
    if (typeof value !== 'boolean') {
        console.error(`[FeatureFlagService] Invalid value for feature flag "${flagName}". Must be boolean.`);
        return;
    }
    if (_featureFlags.hasOwnProperty(flagName)) {
        _featureFlags[flagName] = value;
        console.log(`[FeatureFlagService] Feature flag "${flagName}" set to ${value}.`);
        localStorage.setItem('userFeatureFlags', JSON.stringify(_featureFlags));

        // Update the featureFlags in AppStore as well
        if (AppStore && typeof AppStore.setFeatureFlags === 'function') {
            // AppStore.setFeatureFlags might be too broad if it re-publishes 'featureFlagsInitialized'.
            // For a single flag change, it's better to update the AppStore's copy directly if possible,
            // or have a more granular AppStore.updateSingleFeatureFlag method.
            // For now, let's assume AppStore's _featureFlags is updated by the global window.featureFlags
            // or we rely on the next loadFeatureFlags call.
            // A cleaner way:
            if (AppStore.getFeatureFlags()[flagName] !== value) { // Check if different from store's current
                 AppStore.setFeatureFlags({ ..._featureFlags }); // Update the whole object in store
            }
        } else if (window.featureFlags) { // Legacy global fallback
             window.featureFlags[flagName] = value;
        }
        
        if (EventBus) {
            EventBus.publish('featureFlagsUpdated', { flagName, value, allFlags: { ..._featureFlags } });
        }
        // The 'featureFlagsUpdated' event will be handled by ui_event_handlers.js to call applyActiveFeatures.
    } else {
        console.warn(`[FeatureFlagService] Attempted to set unknown feature flag: ${flagName}.`);
    }
}

console.log("featureFlagService.js loaded as ES6 module.");

// The initial loadFeatureFlags() should be orchestrated by main.js
// after all essential modules like EventBus and AppStore are available.
