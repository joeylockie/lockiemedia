// feature_test_button.js

// Self-invoking function to encapsulate the feature's code.
(function() {
    // Dependencies (assumed to be globally available for now):
    // - DOM elements: testFeatureButton, testFeatureButtonContainer (from ui_rendering.js)
    // - UI functions: showMessage (from ui_rendering.js)
    // - Services: FeatureFlagService

    /**
     * Initializes the Test Button Feature.
     * Sets up its event listener if the button exists.
     */
    function initializeTestButtonFeature() {
        // testFeatureButton is expected to be initialized by initializeDOMElements in ui_rendering.js
        if (typeof testFeatureButton !== 'undefined' && testFeatureButton) {
            testFeatureButton.addEventListener('click', () => {
                console.log('Test Button Clicked! (From feature_test_button.js)');
                if (typeof showMessage === 'function') {
                    showMessage('Test Button Clicked! (From feature_test_button.js)', 'info'); // Changed to 'info' for less alarm
                } else {
                    alert('Test Button Clicked! (From feature_test_button.js)'); // Fallback
                }
            });
            console.log('[TestButtonFeature] Initialized.');
        } else {
            console.warn('[TestButtonFeature] Test Button element not found during initialization.');
        }
    }

    /**
     * Updates the visibility of the Test Button UI elements based on the feature flag.
     * This function is primarily for consistency in the feature module pattern.
     * The actual toggling is often handled by applyActiveFeatures in ui_event_handlers.js
     * which targets elements by class or specific ID.
     * @param {boolean} isEnabledParam - Parameter for consistency, actual check uses FeatureFlagService.
     */
    function updateTestButtonUIVisibility(isEnabledParam) {
        if (typeof FeatureFlagService === 'undefined') {
            console.error("[TestButtonFeature] FeatureFlagService not available.");
            return;
        }
        const isActuallyEnabled = FeatureFlagService.isFeatureEnabled('testButtonFeature');

        // testFeatureButtonContainer is expected to be initialized by initializeDOMElements
        if (typeof testFeatureButtonContainer !== 'undefined' && testFeatureButtonContainer) {
            testFeatureButtonContainer.classList.toggle('hidden', !isActuallyEnabled);
        } else {
            // This might be okay if applyActiveFeatures in ui_event_handlers.js handles it
            // console.warn("[TestButtonFeature] testFeatureButtonContainer not found for visibility update.");
        }
        console.log(`[TestButtonFeature] UI Visibility set to: ${isActuallyEnabled}`);
    }

    // Expose the initialization and UI update functions.
    if (typeof window.AppFeatures === 'undefined') {
        window.AppFeatures = {};
    }
    // These functions are already exposed in the original file, ensuring consistency.
    window.AppFeatures.initializeTestButtonFeature = initializeTestButtonFeature;
    window.AppFeatures.updateTestButtonUIVisibility = updateTestButtonUIVisibility;

    // console.log("feature_test_button.js loaded");
})();
