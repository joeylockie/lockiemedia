// feature_test_button.js
// ES6 Module for the Test Button Feature.

import { isFeatureEnabled } from './featureFlagService.js';
// showMessage is currently a global function from ui_rendering.js
// testFeatureButton, testFeatureButtonContainer are global DOM elements from ui_rendering.js

/**
 * Initializes the Test Button Feature.
 * Sets up its event listener if the button exists and feature is enabled.
 */
function initialize() {
    // DOM elements are assumed to be initialized by initializeDOMElements in ui_rendering.js
    // and made globally available for now.
    if (typeof window.testFeatureButton !== 'undefined' && window.testFeatureButton) {
        window.testFeatureButton.addEventListener('click', () => {
            console.log('Test Button Clicked! (From feature_test_button.js)');
            if (typeof window.showMessage === 'function') {
                window.showMessage('Test Button Clicked! (From feature_test_button.js)', 'info');
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
 * @param {boolean} isEnabledParam - (Not used directly, uses imported isFeatureEnabled)
 */
function updateUIVisibility(isEnabledParam) { // isEnabledParam is for consistency in AppFeatures pattern
    if (typeof isFeatureEnabled !== 'function') {
        console.error("[TestButtonFeature] isFeatureEnabled function not available from FeatureFlagService.");
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('testButtonFeature');

    if (typeof window.testFeatureButtonContainer !== 'undefined' && window.testFeatureButtonContainer) {
        window.testFeatureButtonContainer.classList.toggle('hidden', !isActuallyEnabled);
    }
    console.log(`[TestButtonFeature] UI Visibility set based on flag: ${isActuallyEnabled}`);
}

export const TestButtonFeature = {
    initialize,
    updateUIVisibility
};

console.log("feature_test_button.js loaded as ES6 module.");
