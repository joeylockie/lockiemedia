// feature_test_button.js
// ES6 Module for the Test Button Feature.

import { isFeatureEnabled } from './featureFlagService.js';
// showMessage is currently a global function from ui_rendering.js
// testFeatureButton, testFeatureButtonContainer are DOM elements.

/**
 * Initializes the Test Button Feature.
 * Sets up its event listener if the button exists and feature is enabled.
 */
function initialize() {
    const testButtonEl = document.getElementById('testFeatureButton');
    if (testButtonEl) {
        testButtonEl.addEventListener('click', () => {
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
function updateUIVisibility(isEnabledParam) { 
    if (typeof isFeatureEnabled !== 'function') {
        console.error("[TestButtonFeature] isFeatureEnabled function not available from FeatureFlagService.");
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('testButtonFeature');
    
    // **FIX APPLIED HERE**
    const container = document.getElementById('testFeatureButtonContainer');
    if (container) {
        container.classList.toggle('hidden', !isActuallyEnabled);
    }
    // **END OF FIX**
    console.log(`[TestButtonFeature] UI Visibility set based on flag: ${isActuallyEnabled}`);
}

export const TestButtonFeature = {
    initialize,
    updateUIVisibility
};

console.log("feature_test_button.js loaded as ES6 module.");