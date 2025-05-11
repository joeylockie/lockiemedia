// feature_reminder.js

// Self-invoking function to encapsulate the feature's code
(function() {
    /**
     * Initializes the Reminder Feature.
     * Sets up event listeners for reminder-related UI elements in modals.
     * This function should be called if the 'reminderFeature' flag is true.
     */
    function initializeReminderFeature() {
        // DOM elements for Add Task Modal
        const modalRemindMeAdd = document.getElementById('modalRemindMeAdd');
        const reminderOptionsAdd = document.getElementById('reminderOptionsAdd');
        const modalDueDateInputAdd = document.getElementById('modalDueDateInputAdd');
        const modalReminderDateAdd = document.getElementById('modalReminderDateAdd');
        const modalTimeInputAdd = document.getElementById('modalTimeInputAdd');
        const modalReminderTimeAdd = document.getElementById('modalReminderTimeAdd');

        // DOM elements for View/Edit Task Modal
        const modalRemindMeViewEdit = document.getElementById('modalRemindMeViewEdit');
        const reminderOptionsViewEdit = document.getElementById('reminderOptionsViewEdit');
        // const modalDueDateInputViewEdit = document.getElementById('modalDueDateInputViewEdit'); // Not directly needed for listener setup here
        // const modalReminderDateViewEdit = document.getElementById('modalReminderDateViewEdit'); // Not directly needed for listener setup here

        if (modalRemindMeAdd && reminderOptionsAdd) {
            modalRemindMeAdd.addEventListener('change', () => {
                reminderOptionsAdd.classList.toggle('hidden', !modalRemindMeAdd.checked);
                if (modalRemindMeAdd.checked) {
                    // Pre-fill reminder date/time from due date/time if available and reminder fields are empty
                    if (modalDueDateInputAdd && modalReminderDateAdd && modalDueDateInputAdd.value && !modalReminderDateAdd.value) {
                        modalReminderDateAdd.value = modalDueDateInputAdd.value;
                    }
                    if (modalTimeInputAdd && modalReminderTimeAdd && modalTimeInputAdd.value && !modalReminderTimeAdd.value) {
                        modalReminderTimeAdd.value = modalTimeInputAdd.value;
                    }
                    // Ensure reminder date has a min attribute set (e.g., today)
                    if (modalReminderDateAdd) {
                        const today = new Date().toISOString().split('T')[0];
                        modalReminderDateAdd.min = today;
                    }
                }
            });
        } else {
            console.warn('Reminder elements for Add Modal not found for initialization.');
        }

        if (modalRemindMeViewEdit && reminderOptionsViewEdit) {
            modalRemindMeViewEdit.addEventListener('change', () => {
                reminderOptionsViewEdit.classList.toggle('hidden', !modalRemindMeViewEdit.checked);
                 if (modalRemindMeViewEdit.checked) {
                    // Ensure reminder date has a min attribute set (e.g., today)
                    const modalReminderDateViewEdit = document.getElementById('modalReminderDateViewEdit');
                    if (modalReminderDateViewEdit) {
                         const today = new Date().toISOString().split('T')[0];
                         modalReminderDateViewEdit.min = today;
                    }
                 }
            });
        } else {
            console.warn('Reminder elements for View/Edit Modal not found for initialization.');
        }

        console.log('Reminder Feature Initialized.');
    }

    /**
     * Updates the visibility of all Reminder UI elements based on the feature flag.
     * @param {boolean} isEnabled - True if the feature is enabled, false otherwise.
     */
    function updateReminderUIVisibility(isEnabled) {
        const reminderElements = document.querySelectorAll('.reminder-feature-element');
        reminderElements.forEach(el => {
            el.classList.toggle('hidden', !isEnabled);
        });

        // If the feature is disabled, ensure reminder option sections within modals are also hidden
        if (!isEnabled) {
            const reminderOptionsAdd = document.getElementById('reminderOptionsAdd');
            const reminderOptionsViewEdit = document.getElementById('reminderOptionsViewEdit');
            if (reminderOptionsAdd) reminderOptionsAdd.classList.add('hidden');
            if (reminderOptionsViewEdit) reminderOptionsViewEdit.classList.add('hidden');
        }
        // If the feature is enabled, the visibility of options will be controlled by their respective checkboxes
    }

    // Expose functions to the global scope via AppFeatures
    if (typeof window.AppFeatures === 'undefined') {
        window.AppFeatures = {};
    }
    window.AppFeatures.initializeReminderFeature = initializeReminderFeature;
    window.AppFeatures.updateReminderUIVisibility = updateReminderUIVisibility;

})();
