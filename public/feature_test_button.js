// feature_test_button.js
// ES6 Module for the Test Button Feature.

// import { isFeatureEnabled } from './featureFlagService.js'; // REMOVED
import EventBus from './eventBus.js'; // MODIFIED: Added EventBus import
import LoggingService from './loggingService.js'; // MODIFIED: Added LoggingService import (was missing in original for consistency)

// MODIFIED: showMessage is no longer assumed to be global.
// testFeatureButton, testFeatureButtonContainer are DOM elements.

/**
 * Initializes the Test Button Feature.
 * Sets up its event listener if the button exists and feature is enabled.
 */
function initialize() {
    const functionName = "initialize (TestButtonFeature)"; // For logging
    const testButtonEl = document.getElementById('testFeatureButton');
    if (testButtonEl) {
        testButtonEl.addEventListener('click', () => {
            LoggingService.debug('Test Button Clicked! (From feature_test_button.js)', { functionName });
            // MODIFIED: Publish event instead of direct/global call
            EventBus.publish('displayUserMessage', { 
                text: 'Test Button Clicked! (From feature_test_button.js)', 
                type: 'info' 
            });
        });
        LoggingService.info('[TestButtonFeature] Initialized.', { functionName });
    } else {
        LoggingService.warn('[TestButtonFeature] Test Button element not found during initialization.', { functionName });
    }
}

/**
 * Updates the visibility of the Test Button UI elements based on the feature flag.
 * @param {boolean} isEnabledParam - (Not used directly, uses imported isFeatureEnabled)
 */
function updateUIVisibility(isEnabledParam) { 
    const functionName = "updateUIVisibility (TestButtonFeature)"; // For logging
    if (typeof window.isFeatureEnabled !== 'function') { // MODIFIED to check window
        LoggingService.error("[TestButtonFeature] isFeatureEnabled function not available from FeatureFlagService.", new Error("DependencyMissing"), { functionName });
        return;
    }
    const isActuallyEnabled = window.isFeatureEnabled('testButtonFeature'); // MODIFIED to use window
    
    const container = document.getElementById('testFeatureButtonContainer');
    if (container) {
        container.classList.toggle('hidden', !isActuallyEnabled);
    }
    LoggingService.info(`[TestButtonFeature] UI Visibility set based on flag: ${isActuallyEnabled}`, { functionName, isEnabled: isActuallyEnabled });
}

export const TestButtonFeature = {
    initialize,
    updateUIVisibility
};

LoggingService.debug("feature_test_button.js loaded as ES6 module.", { module: 'feature_test_button' });