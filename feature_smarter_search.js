// feature_smarter_search.js
// Placeholder for Smarter Search Feature.
// Now an ES6 module.

import { isFeatureEnabled } from './featureFlagService.js';
// DOM elements with '.smarter-search-feature-element' are handled by applyActiveFeatures in ui_event_handlers.js

/**
 * Initializes the Smarter Search feature.
 * Placeholder for future initialization logic.
 */
function initialize() {
    console.log('[SmarterSearchFeature] Initialized (Placeholder).');
    // Future: Setup event listeners for advanced search UI, parse complex queries,
    // potentially integrate with a search indexing mechanism.
}

/**
 * Updates the visibility of UI elements related to the Smarter Search System.
 * @param {boolean} isEnabledParam - (Not used directly, uses imported isFeatureEnabled)
 */
function updateUIVisibility(isEnabledParam) {
    if (typeof isFeatureEnabled !== 'function') {
        console.error("[SmarterSearchFeature] isFeatureEnabled function not available from FeatureFlagService.");
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('smarterSearchFeature');
    document.querySelectorAll('.smarter-search-feature-element').forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));
    console.log(`[SmarterSearchFeature] UI Visibility set based on flag: ${isActuallyEnabled}`);
}

export const SmarterSearchFeature = {
    initialize,
    updateUIVisibility
};

console.log("feature_smarter_search.js loaded as ES6 module.");