// feature_contact_us.js
// Manages the Contact Us Feature.

import { isFeatureEnabled } from './featureFlagService.js';
import LoggingService from './loggingService.js';
// Import modal interaction functions from modal_interactions.js
import { openContactUsModal, closeContactUsModal } from './modal_interactions.js';
// showMessage is still assumed to be globally available or correctly imported by other modules that use it.

// DOM Element References (will be populated in initialize)
let settingsContactUsBtnEl;
// Modal elements will be primarily managed by functions in modal_interactions.js
// but we might still need a reference to the form for reset or specific logic.
let contactUsFormEl; 

/**
 * Initializes the Contact Us Feature.
 * Sets up event listeners for the "Contact Us" button in settings and the modal.
 */
function initialize() {
    const functionName = 'initialize (ContactUsFeature)';
    LoggingService.info('[ContactUsFeature] Initializing...', { functionName });

    settingsContactUsBtnEl = document.getElementById('settingsContactUsBtn');
    // contactUsModalEl, modalDialogContactUsEl, closeContactUsModalBtnEl, closeContactUsSecondaryBtnEl
    // are now primarily handled by modal_interactions.js for opening/closing.
    // We only need direct listeners here if they do something *beyond* just opening/closing.
    
    contactUsFormEl = document.getElementById('contactUsForm');

    if (settingsContactUsBtnEl) {
        // The button in settings will now call the imported openContactUsModal
        settingsContactUsBtnEl.addEventListener('click', openContactUsModal);
        LoggingService.debug('[ContactUsFeature] Attached click listener to settingsContactUsBtnEl (calls imported openContactUsModal).', { functionName });
    } else {
        LoggingService.warn('[ContactUsFeature] settingsContactUsBtnEl not found during initialization.', { functionName });
    }

    // The close buttons (X, Cancel, backdrop) are handled by listeners set up in todo.html
    // calling the respective closeContactUsModal from modal_interactions.js (which will be added to ui_event_handlers.js).
    // Or, if those buttons are uniquely ID'd for ContactUs modal, their listeners
    // would also call the imported closeContactUsModal.
    // For now, assuming standard close button IDs that ui_event_handlers will manage
    // or that todo.html directly calls functions from modal_interactions (less ideal but possible).
    // The `feature_contact_us.js` previously had direct listeners for its close buttons;
    // these will now rely on the centralized handling.

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
    if (typeof isFeatureEnabled !== 'function') {
        LoggingService.error("[ContactUsFeature] isFeatureEnabled function not available from FeatureFlagService.", new Error("DependencyMissing"), { functionName });
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('contactUsFeature');
    LoggingService.debug(`[ContactUsFeature] Updating UI visibility. Feature enabled: ${isActuallyEnabled}.`, { functionName, isActuallyEnabled });

    if (settingsContactUsBtnEl) {
        settingsContactUsBtnEl.classList.toggle('hidden', !isActuallyEnabled);
    }
    
    // If the feature is disabled and the modal is open, close it.
    // This check might be redundant if applyActiveFeatures in ui_event_handlers handles this more globally.
    const contactUsModalEl = document.getElementById('contactUsModal'); // Get reference if needed
    if (!isActuallyEnabled && contactUsModalEl && !contactUsModalEl.classList.contains('hidden')) {
        closeContactUsModal(); // Use imported function
    }
    
    // Generic class toggling is good for elements that don't need specific logic here
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

    // For now, just show a success message and close the modal
    if (typeof window.showMessage === 'function') { 
        window.showMessage('Thank you for your message! We will get back to you soon.', 'success');
    } else {
        alert('Thank you for your message!');
    }
    
    closeContactUsModal(); // Use imported function
}


export const ContactUsFeature = {
    initialize,
    updateUIVisibility
    // openContactUsModal and closeContactUsModal are no longer exported from here
};

LoggingService.debug("feature_contact_us.js loaded as ES6 module, now uses imported modal functions.", { module: 'feature_contact_us' });