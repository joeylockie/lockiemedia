// feature_collaboration_sharing.js
// Placeholder for Collaboration & Sharing Feature.
// Now an ES6 module.

import { isFeatureEnabled } from './featureFlagService.js';
// DOM elements with '.collaboration-sharing-element' are handled by applyActiveFeatures

/**
 * Initializes the Collaboration Sharing Feature.
 * Placeholder for future initialization logic.
 */
function initialize() {
    console.log('[CollaborationSharingFeature] Initialized (Placeholder).');
    // Future: Setup UI for sharing tasks/projects, managing permissions, real-time updates.
}

/**
 * Updates the visibility of UI elements related to the Collaboration Sharing feature.
 * @param {boolean} isEnabledParam - (Not used directly, uses imported isFeatureEnabled)
 */
function updateUIVisibility(isEnabledParam) {
    if (typeof isFeatureEnabled !== 'function') {
        console.error("[CollaborationSharingFeature] isFeatureEnabled function not available from FeatureFlagService.");
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('collaborationSharing');

    // The .collaboration-sharing-element class on UI parts (e.g., button in settings)
    // is toggled by applyActiveFeatures in ui_event_handlers.js.
    console.log(`[CollaborationSharingFeature] UI Visibility (handled by applyActiveFeatures) set based on flag: ${isActuallyEnabled}`);
}

export const CollaborationSharingFeature = {
    initialize,
    updateUIVisibility
};

console.log("feature_collaboration_sharing.js loaded as ES6 module.");
