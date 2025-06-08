// featureFlagService.js
// This service is responsible for loading, managing, and providing access to feature flags.

import AppStore from './store.js';
import EventBus from './eventBus.js';
import LoggingService from './loggingService.js';
// Import Firestore instance getter
import { getFirestoreInstance } from './feature_user_accounts.js';

// Default feature flags structure. This will be overridden.
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
    pomodoroTimerHybridFeature: false,
    backgroundFeature: false,
    contactUsFeature: false,
    socialMediaLinksFeature: false,
    aboutUsFeature: false,
    dataVersioningFeature: false,
    desktopNotificationsFeature: false,
    appUpdateNotificationFeature: false,
    shoppingListFeature: false,
    debugMode: false,
    userRoleFeature: false
};

const FIRESTORE_CONFIG_PATH = 'app_config/feature_flags';

/**
 * Fetches feature flags from Firestore.
 * @returns {Promise<Object|null>} Flags from Firestore or null if error/not found.
 */
async function _fetchFlagsFromFirestore() {
    const functionName = '_fetchFlagsFromFirestore (FeatureFlagService)';

    // **** ADD USER CHECK ****
    if (typeof firebase === 'undefined' || !firebase.auth || !firebase.auth().currentUser) {
        LoggingService.info('[FeatureFlagService] No authenticated user found. Skipping Firestore flag fetch.', { functionName });
        return null;
    }
    // **** END OF USER CHECK ****

    const db = getFirestoreInstance(); // This should still be called after checking for user
    if (!db) {
        LoggingService.warn('[FeatureFlagService] Firestore instance not available for fetching flags.', { functionName });
        return null;
    }
    // ... rest of the function remains the same
    try {
        LoggingService.debug('[FeatureFlagService] Attempting to fetch feature flags from Firestore path:', { path: FIRESTORE_CONFIG_PATH, functionName });
        const docRef = db.doc(FIRESTORE_CONFIG_PATH);
        const docSnap = await docRef.get();

        if (docSnap.exists) { // For compat SDK, .exists is a property
            const firestoreFlags = docSnap.data();
            LoggingService.info('[FeatureFlagService] Feature flags successfully fetched from Firestore.', { functionName, flags: firestoreFlags });
            return firestoreFlags;
        } else {
            LoggingService.info('[FeatureFlagService] Feature flags document does not exist in Firestore. No flags loaded from Firestore.', { functionName, path: FIRESTORE_CONFIG_PATH });
            return null;
        }
    } catch (error) {
        LoggingService.error('[FeatureFlagService] Error fetching feature flags from Firestore.', error, { functionName, path: FIRESTORE_CONFIG_PATH });
        return null;
    }
}



/**
 * Asynchronously loads feature flags from Firestore, then features.json, and finally localStorage.
 * This function should be called once during application startup.
 * It updates the internal _featureFlags object and sets them in the AppStore.
 * @async
 */
export async function loadFeatureFlags() {
    LoggingService.info('[FeatureFlagService] Initializing feature flags...', { initialDefaults: JSON.parse(JSON.stringify(_featureFlags)) });
    let baseFlags = { ..._featureFlags }; // Start with a copy of defaults

    // 1. Attempt to load from Firestore
    const firestoreFlags = await _fetchFlagsFromFirestore();
    if (firestoreFlags) {
        LoggingService.debug('[FeatureFlagService] Applying flags from Firestore.', { flags: firestoreFlags });
        Object.assign(baseFlags, firestoreFlags); // Firestore overrides defaults
    } else {
        LoggingService.debug('[FeatureFlagService] No flags from Firestore, will try features.json.');
        // 2. Fallback to features.json if Firestore fails or returns no flags
        try {
            const response = await fetch('features.json?cachebust=' + new Date().getTime());
            if (!response.ok) {
                LoggingService.warn(`[FeatureFlagService] Failed to load features.json, using current base flags (defaults or Firestore partial). Status: ${response.status}`, { url: 'features.json', status: response.status });
            } else {
                const fetchedFlagsFromFile = await response.json();
                LoggingService.debug('[FeatureFlagService] Flags loaded from features.json:', { fetchedFlags: fetchedFlagsFromFile });
                Object.assign(baseFlags, fetchedFlagsFromFile); // features.json overrides whatever is in baseFlags
            }
        } catch (error) {
            LoggingService.error('[FeatureFlagService] Error loading or parsing features.json. Using current base flags.', error, { url: 'features.json' });
        }
    }

    // 3. Apply localStorage overrides
    const userFlagsString = localStorage.getItem('userFeatureFlags');
    if (userFlagsString) {
        try {
            const userFlagsFromStorage = JSON.parse(userFlagsString);
            LoggingService.debug('[FeatureFlagService] User flags found in localStorage:', { userFlags: userFlagsFromStorage });
            Object.assign(baseFlags, userFlagsFromStorage); // localStorage overrides current baseFlags
        } catch (e) {
            LoggingService.error('[FeatureFlagService] Error parsing userFeatureFlags from localStorage. These flags will be ignored.', e, { item: 'userFeatureFlags' });
        }
    } else {
        LoggingService.debug('[FeatureFlagService] No userFeatureFlags found in localStorage.');
    }

    // Validate and finalize flags based on initial known keys
    const finalFlags = {};
    const allKnownFlagKeys = Object.keys(_featureFlags); // Use original _featureFlags for known keys

    allKnownFlagKeys.forEach(key => {
        if (typeof baseFlags[key] === 'boolean') {
            finalFlags[key] = baseFlags[key];
        } else {
            LoggingService.warn(`[FeatureFlagService] Flag "${key}" was not a boolean or was missing after loading all sources. Defaulting to initial default: ${_featureFlags[key]}.`, { key, loadedValue: baseFlags[key], defaultValue: _featureFlags[key] });
            finalFlags[key] = _featureFlags[key]; // Fallback to original default
        }
    });
    _featureFlags = finalFlags;

    LoggingService.info('[FeatureFlagService] Final feature flags loaded and validated.', { finalFlags: JSON.parse(JSON.stringify(_featureFlags)) });

    if (AppStore && typeof AppStore.setFeatureFlags === 'function') {
        AppStore.setFeatureFlags(_featureFlags);
    } else {
        LoggingService.error("[FeatureFlagService] AppStore.setFeatureFlags is not available! Cannot set flags in store.", new Error("AppStoreUnavailable"));
        if (window.featureFlags) Object.assign(window.featureFlags, _featureFlags);
        if (EventBus && !AppStore?.setFeatureFlags) EventBus.publish('featureFlagsInitialized', _featureFlags);
    }
}

/**
 * Checks if a specific feature is enabled.
 * @param {string} featureName - The name of the feature flag (e.g., 'projectFeature' or 'project').
 * @returns {boolean} True if the feature is enabled, false otherwise.
 */
export function isFeatureEnabled(featureName) {
    // First, check for the exact featureName
    if (typeof _featureFlags[featureName] === 'boolean') {
        return _featureFlags[featureName];
    }

    // If not found, try appending "Feature" to the featureName and check again
    const featureNameWithSuffix = featureName + 'Feature';
    if (typeof _featureFlags[featureNameWithSuffix] === 'boolean') {
        return _featureFlags[featureNameWithSuffix];
    }

    LoggingService.debug(`[FeatureFlagService] Unknown feature flag checked: "${featureName}" (and also tried "${featureNameWithSuffix}"). Defaulting to false.`, { featureName, attemptedSuffix: featureNameWithSuffix });
    return false;
}

// **** ADD THIS FUNCTION BACK ****
/**
 * Returns a copy of all current feature flags.
 * @returns {Object} A copy of the feature flags object.
 */
export function getAllFeatureFlags() {
    return { ..._featureFlags };
}
// **** END OF ADDED FUNCTION ****

/**
 * Allows setting a feature flag dynamically, primarily for user overrides in localStorage.
 * Publishes an event and updates AppStore.
 * If the user is an admin, this function could be extended to write to Firestore.
 * @param {string} flagName - The name of the feature flag.
 * @param {boolean} value - The new boolean value for the flag.
 */
export async function setFeatureFlag(flagName, value) {
    const functionName = 'setFeatureFlag (FeatureFlagService)';
    if (typeof value !== 'boolean') {
        LoggingService.error(`[FeatureFlagService] Invalid value for feature flag "${flagName}". Must be boolean.`, new TypeError("Invalid flag value type"), { functionName, flagName, receivedValue: value });
        return;
    }
    if (!_featureFlags.hasOwnProperty(flagName)) {
         LoggingService.warn(`[FeatureFlagService] Attempted to set unknown feature flag: ${flagName}. Add it to defaults if it's a new persistent flag.`, { functionName, flagName });
        // return; // Uncomment if you want to strictly prevent setting unknown flags
    }

    _featureFlags[flagName] = value;
    LoggingService.info(`[FeatureFlagService] Feature flag "${flagName}" set locally to ${value}.`, { functionName, flagName, newValue: value });

    try {
        localStorage.setItem('userFeatureFlags', JSON.stringify(_featureFlags));
        LoggingService.debug(`[FeatureFlagService] User feature flags saved to localStorage.`, { functionName });
    } catch (e) {
        LoggingService.error(`[FeatureFlagService] Failed to save userFeatureFlags to localStorage after setting "${flagName}".`, e, { functionName, item: 'userFeatureFlags' });
    }

    if (AppStore && typeof AppStore.setFeatureFlags === 'function') {
        if (AppStore.getFeatureFlags()[flagName] !== value || !AppStore.getFeatureFlags().hasOwnProperty(flagName) ) {
             AppStore.setFeatureFlags({ ..._featureFlags });
        }
    } else if (window.featureFlags) {
         window.featureFlags[flagName] = value;
    }

    if (EventBus) {
        EventBus.publish('featureFlagsUpdated', { flagName, value, allFlags: { ..._featureFlags } });
    }

    const userProfile = AppStore ? AppStore.getUserProfile() : null;
    if (userProfile && userProfile.role === 'admin' && isFeatureEnabled('userRoleFeature')) {
        const db = getFirestoreInstance();
        if (db) {
            try {
                LoggingService.info(`[FeatureFlagService] Admin user detected. Attempting to save flag "${flagName}" to Firestore.`, { functionName, flagName, value });
                await db.doc(FIRESTORE_CONFIG_PATH).set(_featureFlags, { merge: true });
                LoggingService.info(`[FeatureFlagService] Feature flags successfully saved to Firestore by admin.`, { functionName });
            } catch (error) {
                LoggingService.error('[FeatureFlagService] Error saving feature flags to Firestore by admin.', error, { functionName });
                EventBus.publish('displayUserMessage', { text: `Error saving flag ${flagName} to cloud.`, type: 'error' });
            }
        } else {
             LoggingService.warn('[FeatureFlagService] Firestore instance not available for admin to save flags to Firestore.', { functionName, flagName });
        }
    }
}

// REMOVED: LoggingService.debug("featureFlagService.js loaded as ES6 module.", { module: 'featureFlagService' });
// console.log("featureFlagService.js module parsed and functions defined."); // Optional