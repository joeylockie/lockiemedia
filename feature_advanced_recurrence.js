// feature_advanced_recurrence.js
// Placeholder for Advanced Recurrence Feature.
// Now an ES6 module.

import { isFeatureEnabled } from './featureFlagService.js';
// DOM elements with '.advanced-recurrence-element' are handled by applyActiveFeatures

/**
 * Initializes the Advanced Recurrence Feature.
 * Placeholder for future initialization logic.
 */
function initialize() {
    console.log('[AdvancedRecurrenceFeature] Initialized (Placeholder).');
    // Future: Setup UI for defining recurrence rules, etc.
}

/**
 * Updates the visibility of Advanced Recurrence UI elements based on the feature flag.
 * @param {boolean} isEnabledParam - (Not used directly, uses imported isFeatureEnabled)
 */
function updateUIVisibility(isEnabledParam) {
    if (typeof isFeatureEnabled !== 'function') {
        console.error("[AdvancedRecurrenceFeature] isFeatureEnabled function not available from FeatureFlagService.");
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('advancedRecurrence');
    document.querySelectorAll('.advanced-recurrence-element').forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));
    console.log(`[AdvancedRecurrenceFeature] UI Visibility set based on flag: ${isActuallyEnabled}`);
}

export const AdvancedRecurrenceFeature = {
    initialize,
    updateUIVisibility
};

console.log("feature_advanced_recurrence.js loaded as ES6 module.");