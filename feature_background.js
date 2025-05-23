// feature_background.js
// Manages the Background Feature.
// Now an ES6 module.

import { isFeatureEnabled } from './featureFlagService.js';

/**
 * Initializes the Background Feature.
 * Placeholder for future initialization logic.
 */
function initialize() {
    console.log('[BackgroundFeature] Initialized (Placeholder).');
    // Future: Setup logic for changing backgrounds, etc.
}

/**
 * Updates the visibility of UI elements related to the Background feature.
 * Or, applies background changes based on the feature flag.
 * @param {boolean} [isEnabledParam] - Not used directly, uses imported isFeatureEnabled.
 */
function updateUIVisibility() { // Renamed from updateUIVisibility for clarity if it does more than hide/show
    if (typeof isFeatureEnabled !== 'function') {
        console.error("[BackgroundFeature] isFeatureEnabled function not available from FeatureFlagService.");
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('backgroundFeature');

    // Example: If you had specific elements to show/hide based on this feature:
    // document.querySelectorAll('.background-feature-element').forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));

    if (isActuallyEnabled) {
        // Add logic to apply background changes
        console.log('[BackgroundFeature] Feature is enabled. Applying background logic (Placeholder).');
        // e.g., document.body.classList.add('custom-background-active');
    } else {
        // Add logic to revert background changes if the feature is disabled
        console.log('[BackgroundFeature] Feature is disabled. Reverting background logic (Placeholder).');
        // e.g., document.body.classList.remove('custom-background-active');
    }
    console.log(`[BackgroundFeature] UI/Behavior updated based on flag: ${isActuallyEnabled}`);
}

export const BackgroundFeature = {
    initialize,
    updateUIVisibility // Or a more descriptive name if it does more
};

console.log("feature_background.js loaded as ES6 module.");