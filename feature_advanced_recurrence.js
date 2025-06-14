// feature_advanced_recurrence.js
// Manages logic and UI for the advanced recurrence feature.

import { isFeatureEnabled } from './featureFlagService.js';
import LoggingService from './loggingService.js';

// --- Private Helper Function ---

/**
 * Updates the visibility of recurrence option controls based on the selected frequency.
 * @param {HTMLSelectElement} frequencySelectEl - The main <select> for frequency (daily, weekly, etc.).
 * @param {HTMLElement} optionsContainerEl - The <div> containing all advanced options.
 * @param {HTMLElement} intervalInputEl - The <input type="number"> for the interval.
 * @param {HTMLElement} frequencyTextEl - The <span> that displays "days", "weeks", etc.
 * @param {HTMLElement} weeklyOptionsContainerEl - The <div> containing the weekly day checkboxes.
 */
function _updateRecurrenceUI(frequencySelectEl, optionsContainerEl, intervalInputEl, frequencyTextEl, weeklyOptionsContainerEl) {
    const selectedFrequency = frequencySelectEl.value;

    if (selectedFrequency === 'none') {
        optionsContainerEl.classList.add('hidden');
        return;
    }

    optionsContainerEl.classList.remove('hidden');

    // Pluralize frequency text
    let frequencyText = selectedFrequency.slice(0, -2) + 's'; // works for daily -> days, weekly -> weeks
    if (selectedFrequency === 'monthly') frequencyText = 'months';
    if (selectedFrequency === 'yearly') frequencyText = 'years';
    frequencyTextEl.textContent = frequencyText;

    // Show/hide weekly options
    weeklyOptionsContainerEl.classList.toggle('hidden', selectedFrequency !== 'weekly');
}


// --- Public Feature Functions ---

/**
 * Initializes the Advanced Recurrence Feature by setting up event listeners.
 */
function initialize() {
    const functionName = "initialize (AdvancedRecurrenceFeature)";
    
    // --- Page-Specific Guard ---
    // The elements this feature initializes are only on the main todo page.
    if (!document.getElementById('addTaskModal')) {
        LoggingService.debug('[AdvancedRecurrenceFeature] Add/Edit Task modals not found. Skipping initialization.', { functionName });
        return;
    }
    // --- End Page-Specific Guard ---

    LoggingService.info('[AdvancedRecurrenceFeature] Initializing event listeners for UI.', { functionName });

    // --- Get elements for Add Modal ---
    const modalRecurrenceAddEl = document.getElementById('modalRecurrenceAdd');
    const recurrenceOptionsAddEl = document.getElementById('recurrenceOptionsAdd');
    const recurrenceIntervalAddEl = document.getElementById('recurrenceIntervalAdd');
    const recurrenceFrequencyTextAddEl = document.getElementById('recurrenceFrequencyTextAdd');
    const weeklyRecurrenceOptionsAddEl = document.getElementById('weeklyRecurrenceOptionsAdd');

    // --- Get elements for Edit Modal ---
    const modalRecurrenceViewEditEl = document.getElementById('modalRecurrenceViewEdit');
    const recurrenceOptionsViewEditEl = document.getElementById('recurrenceOptionsViewEdit');
    const recurrenceIntervalViewEditEl = document.getElementById('recurrenceIntervalViewEdit');
    const recurrenceFrequencyTextViewEditEl = document.getElementById('recurrenceFrequencyTextViewEdit');
    const weeklyRecurrenceOptionsViewEditEl = document.getElementById('weeklyRecurrenceOptionsViewEdit');

    // --- Attach Listener for Add Modal ---
    if (modalRecurrenceAddEl) {
        modalRecurrenceAddEl.addEventListener('change', () => {
            _updateRecurrenceUI(
                modalRecurrenceAddEl,
                recurrenceOptionsAddEl,
                recurrenceIntervalAddEl,
                recurrenceFrequencyTextAddEl,
                weeklyRecurrenceOptionsAddEl
            );
        });
        LoggingService.debug('[AdvancedRecurrenceFeature] Attached listener to Add Modal recurrence dropdown.', { functionName });
    } else {
        LoggingService.warn('[AdvancedRecurrenceFeature] Add Modal recurrence dropdown not found.', { functionName });
    }

    // --- Attach Listener for Edit Modal ---
    if (modalRecurrenceViewEditEl) {
        modalRecurrenceViewEditEl.addEventListener('change', () => {
            _updateRecurrenceUI(
                modalRecurrenceViewEditEl,
                recurrenceOptionsViewEditEl,
                recurrenceIntervalViewEditEl,
                recurrenceFrequencyTextViewEditEl,
                weeklyRecurrenceOptionsViewEditEl
            );
        });
        LoggingService.debug('[AdvancedRecurrenceFeature] Attached listener to Edit Modal recurrence dropdown.', { functionName });
    } else {
        LoggingService.warn('[AdvancedRecurrenceFeature] Edit Modal recurrence dropdown not found.', { functionName });
    }
}

/**
 * Updates the visibility of all Advanced Recurrence UI elements based on the feature flag.
 * @param {boolean} isEnabledParam - (Not used directly, uses imported isFeatureEnabled)
 */
function updateUIVisibility(isEnabledParam) {
    if (typeof isFeatureEnabled !== 'function') {
        LoggingService.error("[AdvancedRecurrenceFeature] isFeatureEnabled function not available from FeatureFlagService.", new Error("DependencyMissing"));
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('advancedRecurrence');
    document.querySelectorAll('.advanced-recurrence-element').forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));
    
    if (!isActuallyEnabled) {
        // Also hide the advanced option containers if the main feature is disabled
        document.getElementById('recurrenceOptionsAdd')?.classList.add('hidden');
        document.getElementById('recurrenceOptionsViewEdit')?.classList.add('hidden');
    }
    
    LoggingService.info(`[AdvancedRecurrenceFeature] UI Visibility set based on flag: ${isActuallyEnabled}`, { isEnabled: isActuallyEnabled });
}


export const AdvancedRecurrenceFeature = {
    initialize,
    updateUIVisibility,
    // Expose for modal_interactions to use when populating the edit modal
    updateRecurrenceUI: _updateRecurrenceUI 
};

LoggingService.debug("feature_advanced_recurrence.js loaded as ES6 module.", { module: 'feature_advanced_recurrence' });