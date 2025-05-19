// featureFlagService.js
// This service is responsible for loading, managing, and providing access to feature flags.

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

async function loadFeatureFlags() {
    console.log('[FeatureFlagService] Initial default flags:', JSON.parse(JSON.stringify(_featureFlags)));
    const baseFlags = { ..._featureFlags };

    try {
        const response = await fetch('features.json?cachebust=' + new Date().getTime());
        if (!response.ok) {
            console.warn('[FeatureFlagService] Failed to load features.json, using default flags. Status:', response.status);
        } else {
            const fetchedFlagsFromFile = await response.json();
            console.log('[FeatureFlagService] Flags loaded from features.json:', fetchedFlagsFromFile);
            Object.assign(baseFlags, fetchedFlagsFromFile);
        }
    } catch (error) {
        console.error('[FeatureFlagService] Error loading or parsing features.json:', error);
    }

    const userFlagsString = localStorage.getItem('userFeatureFlags');
    if (userFlagsString) {
        try {
            const userFlagsFromStorage = JSON.parse(userFlagsString);
            Object.assign(baseFlags, userFlagsFromStorage);
        } catch (e) {
            console.error('[FeatureFlagService] Error parsing userFeatureFlags from localStorage:', e);
        }
    }

    const finalFlags = {};
    const allKnownFlagKeys = Object.keys(_featureFlags);
    allKnownFlagKeys.forEach(key => {
        if (typeof baseFlags[key] === 'boolean') {
            finalFlags[key] = baseFlags[key];
        } else {
            finalFlags[key] = _featureFlags[key];
        }
    });
    _featureFlags = finalFlags;

    console.log('[FeatureFlagService] Final feature flags loaded and validated:', JSON.parse(JSON.stringify(_featureFlags)));
    
    if (window.store && typeof window.store.setFeatureFlags === 'function') {
        window.store.setFeatureFlags(_featureFlags); 
    } else if (window.featureFlags) { 
        Object.assign(window.featureFlags, _featureFlags);
        if (window.EventBus && !window.store?.setFeatureFlags) EventBus.publish('featureFlagsInitialized', _featureFlags);
    }
}

function isFeatureEnabled(featureName) {
    if (typeof _featureFlags[featureName] === 'boolean') {
        return _featureFlags[featureName];
    }
    return false;
}

function getAllFeatureFlags() {
    return { ..._featureFlags };
}

function setFeatureFlag(flagName, value) {
    if (typeof value !== 'boolean') {
        console.error(`[FeatureFlagService] Invalid value for feature flag "${flagName}". Must be boolean.`);
        return;
    }
    if (_featureFlags.hasOwnProperty(flagName)) {
        _featureFlags[flagName] = value;
        console.log(`[FeatureFlagService] Feature flag "${flagName}" set to ${value}.`);
        localStorage.setItem('userFeatureFlags', JSON.stringify(_featureFlags));

        if (window.featureFlags) { 
            window.featureFlags[flagName] = value;
        }
        
        if (window.EventBus) {
            EventBus.publish('featureFlagsUpdated', { flagName, value, allFlags: { ..._featureFlags } });
        }
        // REMOVED: Direct call to applyActiveFeatures()
    } else {
        console.warn(`[FeatureFlagService] Attempted to set unknown feature flag: ${flagName}.`);
    }
}

window.FeatureFlagService = {
    loadFeatureFlags,
    isFeatureEnabled,
    getAllFeatureFlags,
    setFeatureFlag
};
