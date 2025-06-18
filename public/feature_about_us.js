// feature_about_us.js
// Manages the About Us Feature.

// import { isFeatureEnabled } from './featureFlagService.js'; // REMOVED
import LoggingService from './loggingService.js';
// Import modal interaction functions if needed for more complex interactions
// For now, open/close is handled by ui_event_handlers.js calling modal_interactions.js
import { closeAboutUsModal } from './modal_interactions.js';


// DOM Element References (can be populated in initialize if needed for more direct control)
let settingsAboutUsBtnEl;
let aboutUsModalEl; // Only needed if updateUIVisibility directly closes it

/**
 * Initializes the About Us Feature.
 */
function initialize() {
    const functionName = 'initialize (AboutUsFeature)';
    LoggingService.info('[AboutUsFeature] Initializing...', { functionName });

    settingsAboutUsBtnEl = document.getElementById('settingsAboutUsBtn');
    aboutUsModalEl = document.getElementById('aboutUsModal'); // Get a reference if we need to check its state

    if (!settingsAboutUsBtnEl) {
        LoggingService.warn('[AboutUsFeature] settingsAboutUsBtnEl not found during initialization. This is expected if the feature is disabled and the HTML is not rendered or element ID is incorrect.', { functionName });
    }
    // The button's event listener is set up in ui_event_handlers.js

    LoggingService.info('[AboutUsFeature] Initialized.', { functionName });
}

/**
 * Updates the visibility of UI elements related to the About Us feature
 * based on the feature flag.
 */
function updateUIVisibility() {
    const functionName = 'updateUIVisibility (AboutUsFeature)';
    if (typeof window.isFeatureEnabled !== 'function') { // MODIFIED to check window
        LoggingService.error("[AboutUsFeature] isFeatureEnabled function not available from FeatureFlagService.", new Error("DependencyMissing"), { functionName });
        return;
    }
    const isActuallyEnabled = window.isFeatureEnabled('aboutUsFeature'); // MODIFIED to use window
    LoggingService.debug(`[AboutUsFeature] Updating UI visibility. Feature enabled: ${isActuallyEnabled}.`, { functionName, isActuallyEnabled });

    // The button visibility is handled by the '.about-us-feature-element' class
    // in applyActiveFeatures (ui_event_handlers.js).
    // This function can ensure specific behavior if needed, like closing an open modal.

    if (!settingsAboutUsBtnEl) {
        settingsAboutUsBtnEl = document.getElementById('settingsAboutUsBtn');
    }
     if (settingsAboutUsBtnEl) {
        settingsAboutUsBtnEl.classList.toggle('hidden', !isActuallyEnabled);
    }


    if (!isActuallyEnabled) {
        if (!aboutUsModalEl) { // Attempt to get it if not already available
            aboutUsModalEl = document.getElementById('aboutUsModal');
        }
        // If the feature is disabled and the modal is currently open, close it.
        if (aboutUsModalEl && !aboutUsModalEl.classList.contains('hidden')) {
            closeAboutUsModal(); // Use the imported function
            LoggingService.info('[AboutUsFeature] Feature disabled, closing About Us modal.', { functionName });
        }
    }
    
    // General class toggling for other potential elements specific to this feature
    document.querySelectorAll('.about-us-feature-element').forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));

    LoggingService.info(`[AboutUsFeature] UI Visibility set based on flag: ${isActuallyEnabled}`, { functionName, isEnabled: isActuallyEnabled });
}


export const AboutUsFeature = {
    initialize,
    updateUIVisibility
};

LoggingService.debug("feature_about_us.js loaded as ES6 module.", { module: 'feature_about_us' });