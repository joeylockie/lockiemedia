// feature_reminder.js

// Self-invoking function to encapsulate the feature's code
(function() {
    // Dependencies (assumed to be globally available for now):
    // - Services: FeatureFlagService
    // - DOM elements are accessed directly by ID within initializeReminderFeature.

    /**
     * Initializes the Reminder Feature.
     * Sets up event listeners for reminder-related UI elements in modals.
     * This function should be called if the 'reminderFeature' flag is true.
     */
    function initializeReminderFeature() {
        // DOM elements for Add Task Modal
        const modalRemindMeAdd = document.getElementById('modalRemindMeAdd');
        const reminderOptionsAdd = document.getElementById('reminderOptionsAdd');
        const modalDueDateInputAdd = document.getElementById('modalDueDateInputAdd'); // Used to prefill reminder date
        const modalReminderDateAdd = document.getElementById('modalReminderDateAdd');
        const modalTimeInputAdd = document.getElementById('modalTimeInputAdd'); // Used to prefill reminder time
        const modalReminderTimeAdd = document.getElementById('modalReminderTimeAdd');

        // DOM elements for View/Edit Task Modal
        const modalRemindMeViewEdit = document.getElementById('modalRemindMeViewEdit');
        const reminderOptionsViewEdit = document.getElementById('reminderOptionsViewEdit');
        const modalReminderDateViewEdit = document.getElementById('modalReminderDateViewEdit'); // For setting min date

        if (typeof FeatureFlagService === 'undefined') {
            console.error("[ReminderFeature] FeatureFlagService not available for initialization.");
            return;
        }

        if (modalRemindMeAdd && reminderOptionsAdd) {
            modalRemindMeAdd.addEventListener('change', () => {
                // Only proceed if the feature is actually enabled
                if (!FeatureFlagService.isFeatureEnabled('reminderFeature')) {
                    reminderOptionsAdd.classList.add('hidden'); // Ensure hidden if toggled while feature becomes disabled
                    return;
                }
                reminderOptionsAdd.classList.toggle('hidden', !modalRemindMeAdd.checked);
                if (modalRemindMeAdd.checked) {
                    if (modalDueDateInputAdd && modalReminderDateAdd && modalDueDateInputAdd.value && !modalReminderDateAdd.value) {
                        modalReminderDateAdd.value = modalDueDateInputAdd.value;
                    }
                    if (modalTimeInputAdd && modalReminderTimeAdd && modalTimeInputAdd.value && !modalReminderTimeAdd.value) {
                        modalReminderTimeAdd.value = modalTimeInputAdd.value;
                    }
                    if (modalReminderDateAdd) {
                        const today = new Date().toISOString().split('T')[0];
                        modalReminderDateAdd.min = today;
                    }
                }
            });
        } else {
            console.warn('[ReminderFeature] Reminder elements for Add Modal not found during initialization.');
        }

        if (modalRemindMeViewEdit && reminderOptionsViewEdit) {
            modalRemindMeViewEdit.addEventListener('change', () => {
                if (!FeatureFlagService.isFeatureEnabled('reminderFeature')) {
                    reminderOptionsViewEdit.classList.add('hidden');
                    return;
                }
                reminderOptionsViewEdit.classList.toggle('hidden', !modalRemindMeViewEdit.checked);
                 if (modalRemindMeViewEdit.checked && modalReminderDateViewEdit) {
                     const today = new Date().toISOString().split('T')[0];
                     modalReminderDateViewEdit.min = today;
                 }
            });
        } else {
            console.warn('[ReminderFeature] Reminder elements for View/Edit Modal not found during initialization.');
        }

        console.log('[ReminderFeature] Initialized.');
    }

    /**
     * Updates the visibility of all Reminder UI elements based on the feature flag.
     * @param {boolean} isEnabledParam - Parameter for consistency, actual check uses FeatureFlagService.
     */
    function updateReminderUIVisibility(isEnabledParam) {
        if (typeof FeatureFlagService === 'undefined') {
            console.error("[ReminderFeature] FeatureFlagService not available for UI visibility update.");
            return;
        }
        const isActuallyEnabled = FeatureFlagService.isFeatureEnabled('reminderFeature');

        const reminderElements = document.querySelectorAll('.reminder-feature-element');
        reminderElements.forEach(el => {
            el.classList.toggle('hidden', !isActuallyEnabled);
        });

        // If the feature is disabled, ensure reminder option sections within modals are also hidden,
        // and checkboxes are unchecked.
        if (!isActuallyEnabled) {
            const reminderOptionsAdd = document.getElementById('reminderOptionsAdd');
            const reminderOptionsViewEdit = document.getElementById('reminderOptionsViewEdit');
            const modalRemindMeAdd = document.getElementById('modalRemindMeAdd');
            const modalRemindMeViewEdit = document.getElementById('modalRemindMeViewEdit');

            if (reminderOptionsAdd) reminderOptionsAdd.classList.add('hidden');
            if (reminderOptionsViewEdit) reminderOptionsViewEdit.classList.add('hidden');
            if (modalRemindMeAdd) modalRemindMeAdd.checked = false;
            if (modalRemindMeViewEdit) modalRemindMeViewEdit.checked = false;
        }
        // If the feature is enabled, the visibility of options will be controlled by their respective checkboxes
        // and the event listeners set up in initializeReminderFeature.
        console.log(`[ReminderFeature] UI Visibility set to: ${isActuallyEnabled}`);
    }

    // Expose functions to the global scope via AppFeatures
    if (typeof window.AppFeatures === 'undefined') {
        window.AppFeatures = {};
    }
    // The functions are named to avoid conflict if other features have similar named functions.
    window.AppFeatures.initializeReminderFeature = initializeReminderFeature;
    window.AppFeatures.updateReminderUIVisibility = updateReminderUIVisibility; // This will be called by applyActiveFeatures

    // console.log("feature_reminder.js loaded");
})();
