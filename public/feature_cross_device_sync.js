// feature_cross_device_sync.js
// Placeholder for Cross-Device Sync Feature.
// Now an ES6 module.

import { isFeatureEnabled } from './featureFlagService.js';
// DOM elements with '.cross-device-sync-element' are handled by applyActiveFeatures

/**
 * Initializes the Cross-Device Sync Feature.
 * Placeholder for future initialization logic.
 */
function initialize() {
    console.log('[CrossDeviceSyncFeature] Initialized (Placeholder).');
    // Future: Setup for connecting to a sync service, handling data conflicts, etc.
}

/**
 * Updates the visibility of Cross-Device Sync UI elements based on the feature flag.
 * @param {boolean} isEnabledParam - (Not used directly, uses imported isFeatureEnabled)
 */
function updateUIVisibility(isEnabledParam) {
    if (typeof isFeatureEnabled !== 'function') {
        console.error("[CrossDeviceSyncFeature] isFeatureEnabled function not available from FeatureFlagService.");
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('crossDeviceSync');
    document.querySelectorAll('.cross-device-sync-element').forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));
    console.log(`[CrossDeviceSyncFeature] UI Visibility set based on flag: ${isActuallyEnabled}`);
}

export const CrossDeviceSyncFeature = {
    initialize,
    updateUIVisibility
};

console.log("feature_cross_device_sync.js loaded as ES6 module.");