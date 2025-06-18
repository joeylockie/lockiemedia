// feature_collaboration_sharing.js
// Placeholder for Collaboration & Sharing Feature.
// Now an ES6 module.

// import { isFeatureEnabled } from './featureFlagService.js'; // REMOVED

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
    if (typeof window.isFeatureEnabled !== 'function') { // MODIFIED to check window
        console.error("[CollaborationSharingFeature] isFeatureEnabled function not available from FeatureFlagService.");
        return;
    }
    const isActuallyEnabled = window.isFeatureEnabled('collaborationSharing'); // MODIFIED to use window
    document.querySelectorAll('.collaboration-sharing-element').forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));
    console.log(`[CollaborationSharingFeature] UI Visibility set based on flag: ${isActuallyEnabled}`);
}

export const CollaborationSharingFeature = {
    initialize,
    updateUIVisibility
};

console.log("feature_collaboration_sharing.js loaded as ES6 module.");