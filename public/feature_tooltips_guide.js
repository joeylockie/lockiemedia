// feature_tooltips_guide.js
// Manages the Tooltips Guide Feature.

// import { isFeatureEnabled } from './featureFlagService.js'; // REMOVED

/**
 * Initializes the Tooltips Guide Feature.
 */
function initializeTooltipsGuideFeature() {
    console.log('[TooltipsGuideFeature] Initialized.');
}

/**
 * Updates the behavior of the Tooltips Guide feature based on its flag.
 * @param {boolean} [isEnabledParam] - Parameter for consistency, actual check uses imported isFeatureEnabled.
 */
function updateTooltipsGuideUIVisibility(isEnabledParam) {
    if (typeof window.isFeatureEnabled !== 'function') { // MODIFIED to check window
        console.error("[TooltipsGuideFeature] isFeatureEnabled function not available.");
        return;
    }
    const isActuallyEnabled = window.isFeatureEnabled('tooltipsGuide'); // MODIFIED to use window

    // Handle generic elements with the class
    document.querySelectorAll('.tooltips-guide-element').forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));
    
    // Specifically handle the settings button
    const settingsTooltipsGuideBtnEl = document.getElementById('settingsTooltipsGuideBtn');
    if (settingsTooltipsGuideBtnEl) {
        settingsTooltipsGuideBtnEl.classList.toggle('hidden', !isActuallyEnabled);
    }

    console.log(`[TooltipsGuideFeature] Tooltips Guide functionality is now ${isActuallyEnabled ? 'enabled' : 'disabled'}.`);
}

export const TooltipsGuideFeature = {
    initialize: initializeTooltipsGuideFeature,
    updateUIVisibility: updateTooltipsGuideUIVisibility
};

console.log("feature_tooltips_guide.js loaded as ES6 module.");