// feature_reminder.js
// Manages UI interactions for task reminders in modals.
// Now an ES6 module.

import { isFeatureEnabled } from './featureFlagService.js';
// DOM elements (modalRemindMeAdd, etc.) are accessed globally, initialized by ui_rendering.js
// showMessage is also global for now.

/**
 * Initializes the Reminder Feature.
 * Sets up event listeners for reminder-related UI elements in modals.
 */
function initialize() {
    // DOM elements for Add Task Modal
    const modalRemindMeAddEl = document.getElementById('modalRemindMeAdd');
    const reminderOptionsAddEl = document.getElementById('reminderOptionsAdd');
    const modalDueDateInputAddEl = document.getElementById('modalDueDateInputAdd');
    const modalReminderDateAddEl = document.getElementById('modalReminderDateAdd');
    const modalTimeInputAddEl = document.getElementById('modalTimeInputAdd');
    const modalReminderTimeAddEl = document.getElementById('modalReminderTimeAdd');

    // DOM elements for View/Edit Task Modal
    const modalRemindMeViewEditEl = document.getElementById('modalRemindMeViewEdit');
    const reminderOptionsViewEditEl = document.getElementById('reminderOptionsViewEdit');
    const modalReminderDateViewEditEl = document.getElementById('modalReminderDateViewEdit');

    if (modalRemindMeAddEl && reminderOptionsAddEl) {
        modalRemindMeAddEl.addEventListener('change', () => {
            if (!isFeatureEnabled('reminderFeature')) {
                reminderOptionsAddEl.classList.add('hidden');
                return;
            }
            reminderOptionsAddEl.classList.toggle('hidden', !modalRemindMeAddEl.checked);
            if (modalRemindMeAddEl.checked) {
                if (modalDueDateInputAddEl && modalReminderDateAddEl && modalDueDateInputAddEl.value && !modalReminderDateAddEl.value) {
                    modalReminderDateAddEl.value = modalDueDateInputAddEl.value;
                }
                if (modalTimeInputAddEl && modalReminderTimeAddEl && modalTimeInputAddEl.value && !modalReminderTimeAddEl.value) {
                    modalReminderTimeAddEl.value = modalTimeInputAddEl.value;
                }
                if (modalReminderDateAddEl) {
                    const today = new Date().toISOString().split('T')[0];
                    modalReminderDateAddEl.min = today;
                }
            }
        });
    } else {
        console.warn('[ReminderFeature] Reminder elements for Add Modal not found during initialization.');
    }

    if (modalRemindMeViewEditEl && reminderOptionsViewEditEl) {
        modalRemindMeViewEditEl.addEventListener('change', () => {
            if (!isFeatureEnabled('reminderFeature')) {
                reminderOptionsViewEditEl.classList.add('hidden');
                return;
            }
            reminderOptionsViewEditEl.classList.toggle('hidden', !modalRemindMeViewEditEl.checked);
             if (modalRemindMeViewEditEl.checked && modalReminderDateViewEditEl) {
                 const today = new Date().toISOString().split('T')[0];
                 modalReminderDateViewEditEl.min = today;
             }
        });
    } else {
        console.warn('[ReminderFeature] Reminder elements for View/Edit Modal not found during initialization.');
    }

    console.log('[ReminderFeature] Initialized.');
}

/**
 * Updates the visibility of all Reminder UI elements based on the feature flag.
 * @param {boolean} isEnabledParam - (Not used directly, uses imported isFeatureEnabled)
 */
function updateUIVisibility(isEnabledParam) {
    if (typeof isFeatureEnabled !== 'function') {
        console.error("[ReminderFeature] isFeatureEnabled function not available from FeatureFlagService.");
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('reminderFeature');

    const reminderElements = document.querySelectorAll('.reminder-feature-element');
    reminderElements.forEach(el => {
        el.classList.toggle('hidden', !isActuallyEnabled);
    });

    if (!isActuallyEnabled) {
        const reminderOptionsAddEl = document.getElementById('reminderOptionsAdd');
        const reminderOptionsViewEditEl = document.getElementById('reminderOptionsViewEdit');
        const modalRemindMeAddEl = document.getElementById('modalRemindMeAdd');
        const modalRemindMeViewEditEl = document.getElementById('modalRemindMeViewEdit');

        if (reminderOptionsAddEl) reminderOptionsAddEl.classList.add('hidden');
        if (reminderOptionsViewEditEl) reminderOptionsViewEditEl.classList.add('hidden');
        if (modalRemindMeAddEl) modalRemindMeAddEl.checked = false;
        if (modalRemindMeViewEditEl) modalRemindMeViewEditEl.checked = false;
    }
    console.log(`[ReminderFeature] UI Visibility set based on flag: ${isActuallyEnabled}`);
}

export const ReminderFeature = {
    initialize,
    updateUIVisibility
};

console.log("feature_reminder.js loaded as ES6 module.");
