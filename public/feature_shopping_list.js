// feature_shopping_list.js
// Manages the Shopping List Feature.

// import { isFeatureEnabled } from './featureFlagService.js'; // REMOVED
import LoggingService from './loggingService.js';

/**
 * Initializes the Shopping List Feature.
 */
function initialize() {
    const functionName = 'initialize (ShoppingListFeature)';
    LoggingService.info('[ShoppingListFeature] Initialized.', { functionName });
    // Future logic for this feature can be added here.
}

/**
 * Updates the visibility of UI elements related to the Shopping List feature
 * based on the feature flag.
 */
function updateUIVisibility() {
    const functionName = 'updateUIVisibility (ShoppingListFeature)';
    if (typeof window.isFeatureEnabled !== 'function') { // MODIFIED to check window
        LoggingService.error("[ShoppingListFeature] isFeatureEnabled function not available.", new Error("DependencyMissing"), { functionName });
        return;
    }
    const isActuallyEnabled = window.isFeatureEnabled('shoppingListFeature'); // MODIFIED to use window
    
    // The button's visibility is controlled by the .shopping-list-feature-element class
    // which is handled by the applyActiveFeatures function.
    // This function can be used for more complex UI logic if needed in the future.
    document.querySelectorAll('.shopping-list-feature-element').forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));

    LoggingService.info(`[ShoppingListFeature] UI Visibility set based on flag: ${isActuallyEnabled}`, { functionName, isEnabled: isActuallyEnabled });
}

export const ShoppingListFeature = {
    initialize,
    updateUIVisibility
};

LoggingService.debug("feature_shopping_list.js loaded as ES6 module.", { module: 'feature_shopping_list' });