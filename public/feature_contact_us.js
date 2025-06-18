// feature_contact_us.js
// Manages the Contact Us Feature.

// import { isFeatureEnabled } from './featureFlagService.js'; // REMOVED
import LoggingService from './loggingService.js';
import EventBus from './eventBus.js'; // MODIFIED: Added EventBus import
// Import modal interaction functions from modal_interactions.js
import { openContactUsModal, closeContactUsModal } from './modal_interactions.js';
// MODIFIED: showMessage is no longer assumed to be globally available.

// DOM Element References (will be populated in initialize)
let settingsContactUsBtnEl;
let contactUsFormEl; 

/**
 * Initializes the Contact Us Feature.
 * Sets up event listeners for the "Contact Us" button in settings and the modal.
 */
function initialize() {
    const functionName = 'initialize (ContactUsFeature)';
    LoggingService.info('[ContactUsFeature] Initializing...', { functionName });

    settingsContactUsBtnEl = document.getElementById('settingsContactUsBtn');
    contactUsFormEl = document.getElementById('contactUsForm');

    if (settingsContactUsBtnEl) {
        settingsContactUsBtnEl.addEventListener('click', openContactUsModal);
        LoggingService.debug('[ContactUsFeature] Attached click listener to settingsContactUsBtnEl (calls imported openContactUsModal).', { functionName });
    } else {
        LoggingService.warn('[ContactUsFeature] settingsContactUsBtnEl not found during initialization.', { functionName });
    }

    if (contactUsFormEl) {
        contactUsFormEl.addEventListener('submit', handleContactUsFormSubmit);
        LoggingService.debug('[ContactUsFeature] Attached submit listener to contactUsFormEl.', { functionName });
    } else {
        LoggingService.warn('[ContactUsFeature] contactUsFormEl not found during initialization.', { functionName });
    }

    LoggingService.info('[ContactUsFeature] Initialized.', { functionName });
}

/**
 * Updates the visibility of UI elements related to the Contact Us feature
 * based on the feature flag.
 */
function updateUIVisibility() {
    const functionName = 'updateUIVisibility (ContactUsFeature)';
    if (typeof window.isFeatureEnabled !== 'function') { // MODIFIED to check window
        LoggingService.error("[ContactUsFeature] isFeatureEnabled function not available from FeatureFlagService.", new Error("DependencyMissing"), { functionName });
        return;
    }
    const isActuallyEnabled = window.isFeatureEnabled('contactUsFeature'); // MODIFIED to use window
    LoggingService.debug(`[ContactUsFeature] Updating UI visibility. Feature enabled: ${isActuallyEnabled}.`, { functionName, isActuallyEnabled });

    if (!settingsContactUsBtnEl) { // Try to get it again if not found during init
        settingsContactUsBtnEl = document.getElementById('settingsContactUsBtn');
    }
    if (settingsContactUsBtnEl) {
        settingsContactUsBtnEl.classList.toggle('hidden', !isActuallyEnabled);
    }
    
    const contactUsModalEl = document.getElementById('contactUsModal'); 
    if (!isActuallyEnabled && contactUsModalEl && !contactUsModalEl.classList.contains('hidden')) {
        closeContactUsModal(); 
        LoggingService.info('[ContactUsFeature] Feature disabled, closing Contact Us modal.', { functionName });
    }
    
    document.querySelectorAll('.contact-us-feature-element').forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));
    LoggingService.info(`[ContactUsFeature] UI Visibility set based on flag: ${isActuallyEnabled}`, { functionName, isEnabled: isActuallyEnabled });
}

/**
 * Handles the submission of the Contact Us form.
 * @param {Event} event - The form submission event.
 */
function handleContactUsFormSubmit(event) {
    event.preventDefault();
    const functionName = 'handleContactUsFormSubmit';
    LoggingService.info('[ContactUsFeature] Contact Us form submitted.', { functionName });

    const name = document.getElementById('contactNameInput')?.value;
    const email = document.getElementById('contactEmailInput')?.value;
    const message = document.getElementById('contactMessageInput')?.value;

    LoggingService.debug('[ContactUsFeature] Form data:', { functionName, name, email, messageLength: message?.length });

    // MODIFIED: Publish event instead of direct/global call
    EventBus.publish('displayUserMessage', { 
        text: 'Thank you for your message! We will get back to you soon.', 
        type: 'success' 
    });
    
    closeContactUsModal(); 
}


export const ContactUsFeature = {
    initialize,
    updateUIVisibility
};

LoggingService.debug("feature_contact_us.js loaded as ES6 module, now uses imported modal functions and EventBus for messages.", { module: 'feature_contact_us' });