// feature_tooltips_guide.js
// Manages the Tooltips Guide Feature.

import { isFeatureEnabled } from './featureFlagService.js';

// DOM elements for the guide modal are handled by modal_interactions.js
// Actual tooltip display logic (showTooltip, hideTooltip) is in ui_rendering.js
// and ui_event_handlers.js. Those functions should also import and use
// isFeatureEnabled('tooltipsGuide') to determine if they should show tooltips.

/**
 * Initializes the Tooltips Guide Feature.
 * For this feature, initialization might not involve much beyond logging,
 * as the main UI elements (like the button in settings) are handled by
 * the general applyActiveFeatures mechanism.
 */
function initializeTooltipsGuideFeature() {
    console.log('[TooltipsGuideFeature] Initialized.');
    // If there were global tooltip configurations to set up when the feature is active,
    // they would go here. For example, setting a default tooltip delay or style.
}

/**
 * Updates the behavior of the Tooltips Guide feature based on its flag.
 * The primary effect of this feature flag is:
 * 1. Visibility of the "Tooltips & Shortcuts Guide" button in settings (handled by applyActiveFeatures).
 * 2. Enabling/disabling the display of individual tooltips throughout the app (logic within
 * showTooltip function in ui_rendering.js should check this flag).
 * @param {boolean} [isEnabledParam] - Parameter for consistency, actual check uses imported isFeatureEnabled.
 * This parameter is not directly used as the function now relies on the imported service.
 */
function updateTooltipsGuideUIVisibility(isEnabledParam) {
    // The isEnabledParam is kept for structural consistency if other features use it,
    // but for this specific function, we directly use the imported service.
    const isActuallyEnabled = isFeatureEnabled('tooltipsGuide');

    console.log(`[TooltipsGuideFeature] Tooltips Guide functionality is now ${isActuallyEnabled ? 'enabled' : 'disabled'}.`);

    // If the feature is disabled, we might want to ensure any currently visible guide modal is closed.
    // However, modal closing is typically handled by user interaction or when its trigger button is hidden.
    // The showTooltip function in ui_rendering.js should internally check
    // isFeatureEnabled('tooltipsGuide') before displaying any tooltip.
}

export const TooltipsGuideFeature = {
    initialize: initializeTooltipsGuideFeature,
    updateUIVisibility: updateTooltipsGuideUIVisibility
};

console.log("feature_tooltips_guide.js loaded as ES6 module.");