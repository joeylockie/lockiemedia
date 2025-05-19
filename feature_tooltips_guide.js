// feature_tooltips_guide.js

// Self-invoking function to encapsulate the feature's code
(function() {
    // Dependencies (assumed to be globally available for now):
    // - Services: FeatureFlagService
    // - DOM elements for the guide modal are handled by modal_interactions.js
    // - Actual tooltip display logic is in ui_rendering.js and ui_event_handlers.js

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
     * @param {boolean} isEnabledParam - Parameter for consistency, actual check uses FeatureFlagService.
     */
    function updateTooltipsGuideUIVisibility(isEnabledParam) {
        if (typeof FeatureFlagService === 'undefined') {
            console.error("[TooltipsGuideFeature] FeatureFlagService not available.");
            return;
        }
        const isActuallyEnabled = FeatureFlagService.isFeatureEnabled('tooltipsGuide');

        console.log(`[TooltipsGuideFeature] Tooltips Guide functionality is now ${isActuallyEnabled ? 'enabled' : 'disabled'}.`);

        // If the feature is disabled, we might want to ensure any currently visible guide modal is closed.
        // However, modal closing is typically handled by user interaction or when its trigger button is hidden.
        // The showTooltip function in ui_rendering.js should internally check
        // FeatureFlagService.isFeatureEnabled('tooltipsGuide') before displaying any tooltip.
    }

    // Expose functions to the global scope via AppFeatures
    if (typeof window.AppFeatures === 'undefined') {
        window.AppFeatures = {};
    }
    // Ensure a specific namespace for this feature if it doesn't exist
    if (typeof window.AppFeatures.TooltipsGuide === 'undefined') {
        window.AppFeatures.TooltipsGuide = {};
    }

    window.AppFeatures.TooltipsGuide.initialize = initializeTooltipsGuideFeature;
    // Renaming updateBehavior to updateUIVisibility for consistency with other feature modules.
    window.AppFeatures.TooltipsGuide.updateUIVisibility = updateTooltipsGuideUIVisibility;

    // The actual functions to show/hide individual tooltips (showTooltip, hideTooltip)
    // are located in ui_rendering.js and are called by ui_event_handlers.js.
    // Those functions should be modified to check FeatureFlagService.isFeatureEnabled('tooltipsGuide').

    // console.log("feature_tooltips_guide.js loaded");
})();
