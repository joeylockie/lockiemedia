// feature_reminders.js

(function() {
    // Helper function to safely get DOM elements.
    // These elements are defined in ui_interactions.js and are expected to be globally available.
    const getElement = (id) => document.getElementById(id);

    // DOM elements related to the Reminder Feature in Add Modal
    let modalRemindMeAdd, reminderOptionsAdd, modalReminderDateAdd, modalReminderTimeAdd, modalReminderEmailAdd, modalDueDateInputAdd_ref, modalTimeInputAdd_ref;

    // DOM elements related to the Reminder Feature in Edit Modal
    let modalRemindMeViewEdit, reminderOptionsViewEdit, modalReminderDateViewEdit, modalReminderTimeViewEdit, modalReminderEmailViewEdit;
    
    // DOM elements related to the Reminder Feature in View Details Modal
    let viewTaskReminderSection_ref, viewTaskReminderStatus_ref, viewTaskReminderDetails_ref, viewTaskReminderDate_ref, viewTaskReminderTime_ref, viewTaskReminderEmail_ref;


    /**
     * Initializes references to DOM elements used by the reminder feature.
     * This should be called once the DOM is ready.
     */
    function cacheReminderDOMElements() {
        // Add Modal
        modalRemindMeAdd = getElement('modalRemindMeAdd');
        reminderOptionsAdd = getElement('reminderOptionsAdd');
        modalReminderDateAdd = getElement('modalReminderDateAdd');
        modalReminderTimeAdd = getElement('modalReminderTimeAdd');
        modalReminderEmailAdd = getElement('modalReminderEmailAdd');
        modalDueDateInputAdd_ref = getElement('modalDueDateInputAdd'); // Reference for pre-filling
        modalTimeInputAdd_ref = getElement('modalTimeInputAdd');     // Reference for pre-filling

        // Edit Modal
        modalRemindMeViewEdit = getElement('modalRemindMeViewEdit');
        reminderOptionsViewEdit = getElement('reminderOptionsViewEdit');
        modalReminderDateViewEdit = getElement('modalReminderDateViewEdit');
        modalReminderTimeViewEdit = getElement('modalReminderTimeViewEdit');
        modalReminderEmailViewEdit = getElement('modalReminderEmailViewEdit');

        // View Details Modal (references for populating, not interaction here)
        viewTaskReminderSection_ref = getElement('viewTaskReminderSection');
        viewTaskReminderStatus_ref = getElement('viewTaskReminderStatus');
        viewTaskReminderDetails_ref = getElement('viewTaskReminderDetails');
        viewTaskReminderDate_ref = getElement('viewTaskReminderDate');
        viewTaskReminderTime_ref = getElement('viewTaskReminderTime');
        viewTaskReminderEmail_ref = getElement('viewTaskReminderEmail');
    }


    /**
     * Handles the change event for the "Remind Me" toggle in the Add Task modal.
     */
    function handleReminderToggleAdd() {
        if (!reminderOptionsAdd || !modalRemindMeAdd) return;
        reminderOptionsAdd.classList.toggle('hidden', !modalRemindMeAdd.checked);
        if (modalRemindMeAdd.checked) {
            // Pre-fill reminder date/time from due date/time if available and reminder fields are empty
            if (modalDueDateInputAdd_ref && modalDueDateInputAdd_ref.value && !modalReminderDateAdd.value) {
                modalReminderDateAdd.value = modalDueDateInputAdd_ref.value;
            }
            if (modalTimeInputAdd_ref && modalTimeInputAdd_ref.value && !modalReminderTimeAdd.value) {
                modalReminderTimeAdd.value = modalTimeInputAdd_ref.value;
            }
            // Set min date for reminder date picker
            const today = new Date();
            modalReminderDateAdd.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        }
    }

    /**
     * Handles the change event for the "Remind Me" toggle in the Edit Task modal.
     */
    function handleReminderToggleEdit() {
        if (!reminderOptionsViewEdit || !modalRemindMeViewEdit) return;
        reminderOptionsViewEdit.classList.toggle('hidden', !modalRemindMeViewEdit.checked);
        if (modalRemindMeViewEdit.checked) {
             // Set min date for reminder date picker
            const today = new Date();
            modalReminderDateViewEdit.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        }
    }

    /**
     * Initializes the Reminder Feature.
     * Sets up event listeners for reminder UI elements.
     */
    function initializeReminderFeature() {
        cacheReminderDOMElements(); // Ensure DOM elements are cached

        if (modalRemindMeAdd) {
            modalRemindMeAdd.addEventListener('change', handleReminderToggleAdd);
        } else {
            console.warn("Reminder toggle for Add Modal not found.");
        }

        if (modalRemindMeViewEdit) {
            modalRemindMeViewEdit.addEventListener('change', handleReminderToggleEdit);
        } else {
            console.warn("Reminder toggle for Edit Modal not found.");
        }
        
        // The "Manage Reminders" button in settings is more of a placeholder for now.
        // Its event listener can remain in ui_interactions.js or be moved here if it gains more complex functionality.
        // For now, its visibility is controlled by applyActiveFeatures.

        console.log('Reminder Feature Initialized.');
    }

    /**
     * Updates the visibility of all reminder-related UI elements based on the feature flag.
     * @param {boolean} isEnabled - True if the feature is enabled, false otherwise.
     */
    function updateReminderUIVisibility(isEnabled) {
        cacheReminderDOMElements(); // Ensure DOM elements are fresh if called before init

        document.querySelectorAll('.reminder-feature-element').forEach(el => {
            el.classList.toggle('hidden', !isEnabled);
        });

        // If the feature is disabled, ensure reminder option sections within modals are also hidden,
        // regardless of checkbox state (which might be persisted from a previous session).
        if (!isEnabled) {
            if (reminderOptionsAdd) reminderOptionsAdd.classList.add('hidden');
            if (reminderOptionsViewEdit) reminderOptionsViewEdit.classList.add('hidden');
        } else {
            // If feature is enabled, re-evaluate visibility based on checkbox state for open modals
            if (modalRemindMeAdd && addTaskModal && !addTaskModal.classList.contains('hidden')) {
                 if(reminderOptionsAdd) reminderOptionsAdd.classList.toggle('hidden', !modalRemindMeAdd.checked);
            }
            if (modalRemindMeViewEdit && viewEditTaskModal && !viewEditTaskModal.classList.contains('hidden')) {
                if(reminderOptionsViewEdit) reminderOptionsViewEdit.classList.toggle('hidden', !modalRemindMeViewEdit.checked);
            }
        }
    }
    
    /**
     * Populates reminder fields in the Add/Edit modal.
     * @param {string} modalType - 'add' or 'edit'.
     * @param {object} [task] - The task object (only for 'edit' and 'viewDetails').
     */
    function populateReminderFields(modalType, task = null) {
        cacheReminderDOMElements();
        if (modalType === 'add') {
            if (modalRemindMeAdd) modalRemindMeAdd.checked = false;
            if (modalReminderDateAdd) modalReminderDateAdd.value = '';
            if (modalReminderTimeAdd) modalReminderTimeAdd.value = '';
            if (modalReminderEmailAdd) modalReminderEmailAdd.value = '';
            if (reminderOptionsAdd) reminderOptionsAdd.classList.add('hidden');
        } else if (modalType === 'edit' && task) {
            if (modalRemindMeViewEdit) modalRemindMeViewEdit.checked = task.isReminderSet || false;
            if (reminderOptionsViewEdit) reminderOptionsViewEdit.classList.toggle('hidden', !(task.isReminderSet || false));
            if (task.isReminderSet) {
                if (modalReminderDateViewEdit) modalReminderDateViewEdit.value = task.reminderDate || '';
                if (modalReminderTimeViewEdit) modalReminderTimeViewEdit.value = task.reminderTime || '';
                if (modalReminderEmailViewEdit) modalReminderEmailViewEdit.value = task.reminderEmail || '';
            } else {
                if (modalReminderDateViewEdit) modalReminderDateViewEdit.value = '';
                if (modalReminderTimeViewEdit) modalReminderTimeViewEdit.value = '';
                if (modalReminderEmailViewEdit) modalReminderEmailViewEdit.value = '';
            }
        } else if (modalType === 'viewDetails' && task) {
            if (!viewTaskReminderSection_ref || !viewTaskReminderStatus_ref || !viewTaskReminderDetails_ref) return;

            if (featureFlags.reminderFeature) {
                 viewTaskReminderSection_ref.classList.remove('hidden');
                if (task.isReminderSet) {
                    viewTaskReminderStatus_ref.textContent = 'Active';
                    if (viewTaskReminderDate_ref) viewTaskReminderDate_ref.textContent = task.reminderDate ? formatDate(task.reminderDate) : 'Not set';
                    if (viewTaskReminderTime_ref) viewTaskReminderTime_ref.textContent = task.reminderTime ? formatTime(task.reminderTime) : 'Not set';
                    if (viewTaskReminderEmail_ref) viewTaskReminderEmail_ref.textContent = task.reminderEmail || 'Not set';
                    viewTaskReminderDetails_ref.classList.remove('hidden');
                } else {
                    viewTaskReminderStatus_ref.textContent = 'Not set';
                    viewTaskReminderDetails_ref.classList.add('hidden');
                }
            } else {
                viewTaskReminderSection_ref.classList.add('hidden');
            }
        }
    }

    /**
     * Gets reminder data from the specified modal's form.
     * @param {string} modalType - 'add' or 'edit'.
     * @returns {object|null} Reminder data or null if feature disabled or data invalid.
     */
    function getReminderDataFromModal(modalType) {
        cacheReminderDOMElements();
        if (!featureFlags.reminderFeature) return null;

        let isReminderSet, reminderDate, reminderTime, reminderEmail, currentModalReminderDate, currentModalReminderTime, currentModalReminderEmail;

        if (modalType === 'add') {
            if (!modalRemindMeAdd) return null;
            isReminderSet = modalRemindMeAdd.checked;
            currentModalReminderDate = modalReminderDateAdd;
            currentModalReminderTime = modalReminderTimeAdd;
            currentModalReminderEmail = modalReminderEmailAdd;
        } else if (modalType === 'edit') {
            if (!modalRemindMeViewEdit) return null;
            isReminderSet = modalRemindMeViewEdit.checked;
            currentModalReminderDate = modalReminderDateViewEdit;
            currentModalReminderTime = modalReminderTimeViewEdit;
            currentModalReminderEmail = modalReminderEmailViewEdit;
        } else {
            return null;
        }

        if (isReminderSet) {
            reminderDate = currentModalReminderDate.value;
            reminderTime = currentModalReminderTime.value;
            reminderEmail = currentModalReminderEmail.value.trim();

            if (!reminderDate) { showMessage('Please select a reminder date.', 'error'); currentModalReminderDate.focus(); return 'invalid'; }
            if (!reminderTime) { showMessage('Please select a reminder time.', 'error'); currentModalReminderTime.focus(); return 'invalid'; }
            if (!reminderEmail) { showMessage('Please enter an email for the reminder.', 'error'); currentModalReminderEmail.focus(); return 'invalid'; }
            if (!/^\S+@\S+\.\S+$/.test(reminderEmail)) { showMessage('Please enter a valid email address.', 'error'); currentModalReminderEmail.focus(); return 'invalid'; }
            
            return { isReminderSet, reminderDate, reminderTime, reminderEmail };
        }
        return { isReminderSet: false, reminderDate: null, reminderTime: null, reminderEmail: null };
    }


    // Expose functions to the global AppFeatures namespace
    if (typeof window.AppFeatures === 'undefined') {
        window.AppFeatures = {};
    }
    window.AppFeatures.initializeReminderFeature = initializeReminderFeature;
    window.AppFeatures.updateReminderUIVisibility = updateReminderUIVisibility;
    window.AppFeatures.populateReminderFields = populateReminderFields;
    window.AppFeatures.getReminderDataFromModal = getReminderDataFromModal;

})();
