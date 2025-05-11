// ui_event_handlers.js

// This file handles event listeners, user interaction handlers (forms, buttons),
// applying feature flags to UI, and the main application initialization sequence (window.onload).
// It depends on:
// - DOM elements defined in ui_rendering.js (assumed to be globally available).
// - Rendering functions from ui_rendering.js (e.g., renderTasks, showMessage).
// - Modal interaction functions from modal_interactions.js (e.g., openAddModal, closeAddModal).
// - Core logic functions from app_logic.js (e.g., saveTasks, tasks array, featureFlags).
// - Feature-specific modules (e.g., window.AppFeatures.TaskTimerSystem).

// --- Temporary State for UI Interactions (scoped to this file) ---
let tempSubTasksForAddModal = []; // Used by handleAddTask and handleAddTempSubTaskForAddModal

// --- Apply Active Features (UI part) ---
/**
 * Updates UI visibility based on featureFlags.
 * Calls feature-specific UI update functions if available, otherwise directly manipulates DOM.
 * Assumes 'featureFlags' is global (from app_logic.js).
 * Assumes 'currentViewTaskId' is global (from app_logic.js).
 * Calls rendering functions from ui_rendering.js and modal_interactions.js.
 */
function applyActiveFeatures() {
    const toggleElements = (selector, isEnabled) => {
        document.querySelectorAll(selector).forEach(el => el.classList.toggle('hidden', !isEnabled));
    };

    // Test Button Feature
    if (window.AppFeatures && typeof window.AppFeatures.updateTestButtonUIVisibility === 'function') {
        window.AppFeatures.updateTestButtonUIVisibility(featureFlags.testButtonFeature);
    } else {
        if (testFeatureButtonContainer) testFeatureButtonContainer.classList.toggle('hidden', !featureFlags.testButtonFeature);
    }

    // Task Timer System Feature
    if (window.AppFeatures && window.AppFeatures.TaskTimerSystem && typeof window.AppFeatures.TaskTimerSystem.updateUIVisibility === 'function') {
        window.AppFeatures.TaskTimerSystem.updateUIVisibility(featureFlags.taskTimerSystem);
    } else {
        toggleElements('.task-timer-system-element', featureFlags.taskTimerSystem);
        if (settingsTaskReviewBtn) settingsTaskReviewBtn.classList.toggle('hidden', !featureFlags.taskTimerSystem);
    }

    // Reminder Feature
    if (window.AppFeatures && typeof window.AppFeatures.updateReminderUIVisibility === 'function') {
        window.AppFeatures.updateReminderUIVisibility(featureFlags.reminderFeature);
    } else {
        toggleElements('.reminder-feature-element', featureFlags.reminderFeature);
    }
    // Ensure reminder options visibility is also updated based on checkbox state if feature is on
    if (featureFlags.reminderFeature) {
        if (modalRemindMeAdd && addTaskModal && !addTaskModal.classList.contains('hidden')) {
            if(reminderOptionsAdd) reminderOptionsAdd.classList.toggle('hidden', !modalRemindMeAdd.checked);
        }
        if (modalRemindMeViewEdit && viewEditTaskModal && !viewEditTaskModal.classList.contains('hidden')) {
            if(reminderOptionsViewEdit) reminderOptionsViewEdit.classList.toggle('hidden', !modalRemindMeViewEdit.checked);
        }
    } else {
        if (reminderOptionsAdd) reminderOptionsAdd.classList.add('hidden');
        if (reminderOptionsViewEdit) reminderOptionsViewEdit.classList.add('hidden');
    }

    // Advanced Recurrence Feature
    if (window.AppFeatures && typeof window.AppFeatures.updateAdvancedRecurrenceUIVisibility === 'function') {
        window.AppFeatures.updateAdvancedRecurrenceUIVisibility(featureFlags.advancedRecurrence);
    } else {
        toggleElements('.advanced-recurrence-element', featureFlags.advancedRecurrence);
    }

    // Other features
    toggleElements('.file-attachments-element', featureFlags.fileAttachments);
    toggleElements('.integrations-services-element', featureFlags.integrationsServices);
    toggleElements('.user-accounts-element', featureFlags.userAccounts);
    toggleElements('.collaboration-sharing-element', featureFlags.collaborationSharing);
    toggleElements('.cross-device-sync-element', featureFlags.crossDeviceSync);
    toggleElements('.tooltips-guide-element', featureFlags.tooltipsGuide);
    toggleElements('.sub-tasks-feature-element', featureFlags.subTasksFeature);

    if (settingsTooltipsGuideBtn) settingsTooltipsGuideBtn.classList.toggle('hidden', !featureFlags.tooltipsGuide);

    renderTasks(); // Re-render tasks to reflect any UI changes (from ui_rendering.js)

    // If a task is being viewed, refresh its details modal
    if (currentViewTaskId && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) {
        // openViewTaskDetailsModal (from modal_interactions.js) handles re-rendering the modal content
        openViewTaskDetailsModal(currentViewTaskId);
    }
}

// --- Event Handlers ---
// These functions handle user interactions and call logic/rendering functions.
// They assume global variables like 'tasks', 'featureFlags', 'editingTaskId', 'currentViewTaskId',
// 'currentFilter', 'currentSort' (from app_logic.js).
// They also assume modal functions (from modal_interactions.js) and rendering functions (from ui_rendering.js).

/**
 * Handles adding a new task from the Add Task modal.
 * @param {Event} event - The form submission event.
 */
function handleAddTask(event) {
    event.preventDefault();
    const rawTaskText = modalTaskInputAdd.value.trim();
    const explicitDueDate = modalDueDateInputAdd.value;
    const time = modalTimeInputAdd.value;

    let estHours = 0, estMinutes = 0;
    if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem) {
        const estimates = window.AppFeatures.TaskTimerSystem.getEstimatesFromAddModal();
        estHours = estimates.estHours;
        estMinutes = estimates.estMinutes;
    }

    const priority = modalPriorityInputAdd.value;
    const label = modalLabelInputAdd.value.trim();
    const notes = modalNotesInputAdd.value.trim();

    let isReminderSet = false, reminderDate = null, reminderTime = null, reminderEmail = null;
    if (featureFlags.reminderFeature && modalRemindMeAdd) {
        isReminderSet = modalRemindMeAdd.checked;
        if (isReminderSet) {
            reminderDate = modalReminderDateAdd.value;
            reminderTime = modalReminderTimeAdd.value;
            reminderEmail = modalReminderEmailAdd.value.trim();
            if (!reminderDate || !reminderTime || !reminderEmail || !/^\S+@\S+\.\S+$/.test(reminderEmail)) {
                showMessage('Please provide valid reminder details (date, time, and a valid email).', 'error');
                return;
            }
        }
    }

    if (rawTaskText === '') {
        showMessage('Task description cannot be empty!', 'error'); // showMessage from ui_rendering.js
        modalTaskInputAdd.focus();
        return;
    }

    let finalDueDate = explicitDueDate;
    let finalTaskText = rawTaskText;
    if (!explicitDueDate) {
        const { parsedDate: dateFromDesc, remainingText: textAfterDate } = parseDateFromText(rawTaskText); // parseDateFromText from app_logic.js
        if (dateFromDesc) {
            finalDueDate = dateFromDesc;
            finalTaskText = textAfterDate.trim() || rawTaskText;
        }
    }

    const subTasksToSave = featureFlags.subTasksFeature ? tempSubTasksForAddModal.map(st => ({
        id: Date.now() + Math.random(), // Simple unique ID
        text: st.text,
        completed: st.completed,
        creationDate: Date.now()
    })) : [];

    const newTask = {
        id: Date.now(),
        text: finalTaskText,
        completed: false,
        creationDate: Date.now(),
        dueDate: finalDueDate || null,
        time: time || null,
        estimatedHours: estHours,
        estimatedMinutes: estMinutes,
        priority: priority,
        label: label || '',
        notes: notes || '',
        isReminderSet,
        reminderDate,
        reminderTime,
        reminderEmail,
        timerStartTime: null,
        timerAccumulatedTime: 0,
        timerIsRunning: false,
        timerIsPaused: false,
        actualDurationMs: 0,
        attachments: [], // Placeholder for future
        completedDate: null,
        subTasks: subTasksToSave,
        recurrenceRule: null, // Placeholder
        recurrenceEndDate: null, // Placeholder
        nextDueDate: finalDueDate || null // Placeholder
    };

    tasks.unshift(newTask); // tasks from app_logic.js
    saveTasks(); // saveTasks from app_logic.js

    if (currentFilter === 'completed') { // currentFilter from app_logic.js
        setFilter('inbox'); // Calls setFilter in this file
    } else {
        renderTasks(); // renderTasks from ui_rendering.js
    }
    closeAddModal(); // closeAddModal from modal_interactions.js
    showMessage('Task added successfully!', 'success'); // showMessage from ui_rendering.js
    tempSubTasksForAddModal = []; // Reset temp sub-tasks for next add
}

/**
 * Handles editing an existing task from the View/Edit Task modal.
 * @param {Event} event - The form submission event.
 */
function handleEditTask(event) {
    event.preventDefault();
    const taskId = parseInt(modalViewEditTaskId.value);
    const taskText = modalTaskInputViewEdit.value.trim();
    const dueDate = modalDueDateInputViewEdit.value;
    const time = modalTimeInputViewEdit.value;

    let estHours = 0, estMinutes = 0;
    const originalTask = tasks.find(t => t.id === taskId); // tasks from app_logic.js
    if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem) {
        const estimates = window.AppFeatures.TaskTimerSystem.getEstimatesFromEditModal();
        estHours = estimates.estHours;
        estMinutes = estimates.estMinutes;
    } else if (originalTask) { // Fallback if feature off or module not loaded
        estHours = originalTask.estimatedHours;
        estMinutes = originalTask.estimatedMinutes;
    }


    const priority = modalPriorityInputViewEdit.value;
    const label = modalLabelInputViewEdit.value.trim();
    const notes = modalNotesInputViewEdit.value.trim();

    let isReminderSet = false, reminderDate = null, reminderTime = null, reminderEmail = null;
    if (featureFlags.reminderFeature && modalRemindMeViewEdit) {
        isReminderSet = modalRemindMeViewEdit.checked;
        if (isReminderSet) {
            reminderDate = modalReminderDateViewEdit.value;
            reminderTime = modalReminderTimeViewEdit.value;
            reminderEmail = modalReminderEmailViewEdit.value.trim();
            if (!reminderDate || !reminderTime || !reminderEmail || !/^\S+@\S+\.\S+$/.test(reminderEmail)) {
                showMessage('Please provide valid reminder details (date, time, and a valid email).', 'error');
                return;
            }
        }
    }

    if (taskText === '') {
        showMessage('Task description cannot be empty!', 'error');
        modalTaskInputViewEdit.focus();
        return;
    }

    tasks = tasks.map(task =>
        task.id === taskId ? {
            ...task,
            text: taskText,
            dueDate: dueDate || null,
            time: time || null,
            estimatedHours: estHours,
            estimatedMinutes: estMinutes,
            priority: priority,
            label: label || '',
            notes: notes || '',
            isReminderSet,
            reminderDate,
            reminderTime,
            reminderEmail,
            attachments: task.attachments || [] // Preserve existing attachments
        } : task
    );
    saveTasks();
    renderTasks();
    closeViewEditModal(); // from modal_interactions.js
    showMessage('Task updated successfully!', 'success');

    // If the task being edited was also being viewed in the timer modal, refresh timer display
    if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem && currentViewTaskId === taskId) {
        const updatedTask = tasks.find(t => t.id === taskId);
        if (updatedTask && typeof window.AppFeatures.TaskTimerSystem.setupTimerForModal === 'function') {
             window.AppFeatures.TaskTimerSystem.setupTimerForModal(updatedTask);
        }
    }
}

/**
 * Toggles the completion status of a task.
 * @param {number} taskId - The ID of the task to toggle.
 */
function toggleComplete(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    tasks[taskIndex].completedDate = tasks[taskIndex].completed ? Date.now() : null;

    // If Task Timer System is active, handle timer stop on completion
    if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem) {
        window.AppFeatures.TaskTimerSystem.handleTaskCompletion(taskId, tasks[taskIndex].completed);
    }
    saveTasks();
    renderTasks();

    // If the completed task is currently in the view modal, update its timer UI
    if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem && currentViewTaskId === taskId) {
         const task = tasks.find(t => t.id === taskId);
         if(task && window.AppFeatures.TaskTimerSystem.setupTimerForModal) {
            window.AppFeatures.TaskTimerSystem.setupTimerForModal(task);
         }
    }
}

/**
 * Deletes a task from the list.
 * @param {number} taskId - The ID of the task to delete.
 */
function deleteTask(taskId) {
    // If timer is running for this task in the view modal, clear it
    if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem && currentViewTaskId === taskId) {
        window.AppFeatures.TaskTimerSystem.clearTimerOnModalClose();
    }
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
    showMessage('Task deleted.', 'error'); // Using 'error' style for destructive action feedback
}

/**
 * Sets the current task filter and re-renders the task list.
 * @param {string} filter - The filter to apply (e.g., 'inbox', 'today', or a label name).
 */
function setFilter(filter) {
    setAppCurrentFilter(filter); // setAppCurrentFilter from app_logic.js
    updateSortButtonStates(); // from ui_rendering.js

    // Update active state for smart view buttons
    smartViewButtons.forEach(button => {
        const isActive = button.dataset.filter === filter;
        const baseInactiveClasses = ['bg-slate-200', 'text-slate-700', 'hover:bg-slate-300', 'dark:bg-slate-700', 'dark:text-slate-300', 'dark:hover:bg-slate-600'];
        const iconInactiveClasses = ['text-slate-500', 'dark:text-slate-400'];
        const activeClasses = ['bg-sky-500', 'text-white', 'font-semibold', 'dark:bg-sky-600', 'dark:text-sky-50'];
        const iconActiveClasses = ['text-sky-100', 'dark:text-sky-200'];

        button.classList.remove(...baseInactiveClasses, ...activeClasses);
        button.querySelector('i')?.classList.remove(...iconInactiveClasses, ...iconActiveClasses);

        if (isActive) {
            button.classList.add(...activeClasses);
            button.querySelector('i')?.classList.add(...iconActiveClasses);
        } else {
            button.classList.add(...baseInactiveClasses);
            button.querySelector('i')?.classList.add(...iconInactiveClasses);
        }
    });
    renderTasks();
}

/**
 * Clears all completed tasks from the list.
 */
function clearCompletedTasks() {
    const completedCount = tasks.filter(task => task.completed).length;
    if (completedCount === 0) {
        showMessage('No completed tasks to clear.', 'error');
        return;
    }
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
    showMessage(`${completedCount} completed task${completedCount > 1 ? 's' : ''} cleared.`, 'success');
    closeSettingsModal(); // from modal_interactions.js
}

/**
 * Handles adding a new label from the Manage Labels modal.
 * @param {Event} event - The form submission event.
 */
function handleAddNewLabel(event) {
    event.preventDefault();
    const labelName = newLabelInput.value.trim();
    if (labelName === '') {
        showMessage('Label name cannot be empty.', 'error');
        return;
    }
    if (uniqueLabels.some(l => l.toLowerCase() === labelName.toLowerCase())) { // uniqueLabels from app_logic.js
        showMessage(`Label "${labelName}" already exists.`, 'error');
        return;
    }
    uniqueLabels.push(labelName);
    uniqueLabels.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    // saveTasks() indirectly updates uniqueLabels via updateUniqueLabels() in app_logic.js if tasks were changed.
    // Here, we directly modified uniqueLabels, so we need to ensure app_logic.js's version is also updated.
    // A more robust solution might involve a function in app_logic.js to add a label.
    // For now, calling saveTasks() will trigger updateUniqueLabels(), which re-evaluates from 'tasks'.
    // However, if no tasks use this new label yet, updateUniqueLabels() won't pick it up from 'tasks'.
    // So, we ensure it's in the list, then populateDatalist and populateManageLabelsList will use the updated uniqueLabels.
    // The saveTasks() call is more for persistence if other parts of the app rely on it for label management.
    updateUniqueLabels(); // Call this to ensure the list is correctly rebuilt if app_logic depends on it.
    populateManageLabelsList(); // from modal_interactions.js
    populateDatalist(existingLabelsDatalist); // from ui_rendering.js
    populateDatalist(existingLabelsEditDatalist); // from ui_rendering.js
    newLabelInput.value = '';
    showMessage(`Label "${labelName}" added.`, 'success');
}

/**
 * Handles deleting an existing label and unlabelling tasks.
 * @param {string} labelToDelete - The label name to delete.
 */
function handleDeleteLabel(labelToDelete) {
    tasks = tasks.map(task => {
        if (task.label && task.label.toLowerCase() === labelToDelete.toLowerCase()) {
            return { ...task, label: '' }; // Unlabel tasks
        }
        return task;
    });
    saveTasks(); // This will trigger updateUniqueLabels in app_logic.js
    populateManageLabelsList(); // from modal_interactions.js
    populateDatalist(existingLabelsDatalist); // from ui_rendering.js
    populateDatalist(existingLabelsEditDatalist); // from ui_rendering.js
    renderTasks();
    showMessage(`Label "${labelToDelete}" deleted. Tasks using it have been unlabelled.`, 'success');
}

/**
 * Handles adding a sub-task in the View/Edit Task modal.
 */
function handleAddSubTaskViewEdit() {
    if (!featureFlags.subTasksFeature || !editingTaskId || !modalSubTaskInputViewEdit) return;
    const subTaskText = modalSubTaskInputViewEdit.value.trim();
    if (subTaskText === '') {
        showMessage('Sub-task description cannot be empty.', 'error');
        modalSubTaskInputViewEdit.focus();
        return;
    }
    if (addSubTaskLogic(editingTaskId, subTaskText)) { // addSubTaskLogic from app_logic.js
        renderSubTasksForEditModal(editingTaskId, modalSubTasksListViewEdit); // from ui_rendering.js
        modalSubTaskInputViewEdit.value = '';
        showMessage('Sub-task added.', 'success');
        // If view modal is open for the same task, update it too
        if (currentViewTaskId === editingTaskId && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) {
            renderSubTasksForViewModal(editingTaskId, modalSubTasksListViewDetails, viewSubTaskProgress, noSubTasksMessageViewDetails); // from ui_rendering.js
        }
        renderTasks(); // from ui_rendering.js
    } else {
        showMessage('Failed to add sub-task.', 'error');
    }
}

/**
 * Handles adding a temporary sub-task in the Add Task modal.
 */
function handleAddTempSubTaskForAddModal() {
    if (!featureFlags.subTasksFeature || !modalSubTaskInputAdd) return;
    const subTaskText = modalSubTaskInputAdd.value.trim();
    if (subTaskText === '') {
        showMessage('Sub-task description cannot be empty.', 'error');
        modalSubTaskInputAdd.focus();
        return;
    }
    tempSubTasksForAddModal.push({ text: subTaskText, completed: false });
    renderTempSubTasksForAddModal(); // from ui_rendering.js
    modalSubTaskInputAdd.value = '';
}


// --- Event Listeners Setup ---
/**
 * Sets up all primary event listeners for the application.
 */
function setupEventListeners() {
    // Modal Openers and Form Submissions (using functions from modal_interactions.js for open/close)
    if (openAddModalButton) openAddModalButton.addEventListener('click', openAddModal);
    if (closeAddModalBtn) closeAddModalBtn.addEventListener('click', closeAddModal);
    if (cancelAddModalBtn) cancelAddModalBtn.addEventListener('click', closeAddModal);
    if (modalTodoFormAdd) modalTodoFormAdd.addEventListener('submit', handleAddTask);
    if (addTaskModal) addTaskModal.addEventListener('click', (event) => { if (event.target === addTaskModal) closeAddModal(); });

    if (closeViewEditModalBtn) closeViewEditModalBtn.addEventListener('click', closeViewEditModal);
    if (cancelViewEditModalBtn) cancelViewEditModalBtn.addEventListener('click', closeViewEditModal);
    if (modalTodoFormViewEdit) modalTodoFormViewEdit.addEventListener('submit', handleEditTask);
    if (viewEditTaskModal) viewEditTaskModal.addEventListener('click', (event) => { if (event.target === viewEditTaskModal) closeViewEditModal(); });

    if (closeViewDetailsModalBtn) closeViewDetailsModalBtn.addEventListener('click', closeViewTaskDetailsModal);
    if (closeViewDetailsSecondaryBtn) closeViewDetailsSecondaryBtn.addEventListener('click', closeViewTaskDetailsModal);
    if (editFromViewModalBtn) editFromViewModalBtn.addEventListener('click', () => { if (currentViewTaskId !== null) { closeViewTaskDetailsModal(); openViewEditModal(currentViewTaskId); } });
    if(deleteFromViewModalBtn) { deleteFromViewModalBtn.addEventListener('click', () => { if (currentViewTaskId !== null) { deleteTask(currentViewTaskId); closeViewTaskDetailsModal(); } }); }
    if (viewTaskDetailsModal) viewTaskDetailsModal.addEventListener('click', (event) => { if (event.target === viewTaskDetailsModal) closeViewTaskDetailsModal(); });

    if (closeManageLabelsModalBtn) closeManageLabelsModalBtn.addEventListener('click', closeManageLabelsModal);
    if (closeManageLabelsSecondaryBtn) closeManageLabelsSecondaryBtn.addEventListener('click', closeManageLabelsModal);
    if (addNewLabelForm) addNewLabelForm.addEventListener('submit', handleAddNewLabel);
    if (manageLabelsModal) manageLabelsModal.addEventListener('click', (event) => { if (event.target === manageLabelsModal) closeManageLabelsModal(); });

    if (openSettingsModalButton) openSettingsModalButton.addEventListener('click', openSettingsModal);
    if (closeSettingsModalBtn) closeSettingsModalBtn.addEventListener('click', closeSettingsModal);
    if (closeSettingsSecondaryBtn) closeSettingsSecondaryBtn.addEventListener('click', closeSettingsModal);
    if (settingsModal) settingsModal.addEventListener('click', (event) => { if (event.target === settingsModal) closeSettingsModal(); });
    if (settingsClearCompletedBtn) settingsClearCompletedBtn.addEventListener('click', clearCompletedTasks);
    if (settingsManageLabelsBtn) { settingsManageLabelsBtn.addEventListener('click', () => { closeSettingsModal(); openManageLabelsModal(); }); }
    if (settingsManageRemindersBtn) { settingsManageRemindersBtn.addEventListener('click', () => { if(featureFlags.reminderFeature) { showMessage('Manage Reminders - Coming soon!', 'info'); } else { showMessage('Enable Reminder System in Feature Flags.', 'error'); }});}
    if (settingsTaskReviewBtn) { settingsTaskReviewBtn.addEventListener('click', () => { closeSettingsModal(); openTaskReviewModal(); });}
    if (settingsTooltipsGuideBtn) { settingsTooltipsGuideBtn.addEventListener('click', () => {closeSettingsModal(); openTooltipsGuideModal(); }); }
    const nonFunctionalFeatureMessageHandler = (featureName) => { showMessage(`${featureName} feature is not yet implemented. Coming soon!`, 'info'); };
    if (settingsIntegrationsBtn) settingsIntegrationsBtn.addEventListener('click', () => nonFunctionalFeatureMessageHandler('Integrations'));
    if (settingsUserAccountsBtn) settingsUserAccountsBtn.addEventListener('click', () => nonFunctionalFeatureMessageHandler('User Accounts'));
    if (settingsCollaborationBtn) settingsCollaborationBtn.addEventListener('click', () => nonFunctionalFeatureMessageHandler('Collaboration'));
    if (settingsSyncBackupBtn) settingsSyncBackupBtn.addEventListener('click', () => nonFunctionalFeatureMessageHandler('Sync & Backup'));


    if (closeTaskReviewModalBtn) closeTaskReviewModalBtn.addEventListener('click', closeTaskReviewModal);
    if (closeTaskReviewSecondaryBtn) closeTaskReviewSecondaryBtn.addEventListener('click', closeTaskReviewModal);
    if (taskReviewModal) taskReviewModal.addEventListener('click', (event) => { if (event.target === taskReviewModal) closeTaskReviewModal(); });

    if (closeTooltipsGuideModalBtn) closeTooltipsGuideModalBtn.addEventListener('click', closeTooltipsGuideModal);
    if (closeTooltipsGuideSecondaryBtn) closeTooltipsGuideSecondaryBtn.addEventListener('click', closeTooltipsGuideModal);
    if (tooltipsGuideModal) tooltipsGuideModal.addEventListener('click', (event) => { if (event.target === tooltipsGuideModal) closeTooltipsGuideModal(); });


    // Reminder toggles in Modals (event listeners for checkboxes within modals)
    if (modalRemindMeAdd) {
        modalRemindMeAdd.addEventListener('change', () => {
            if(featureFlags.reminderFeature && reminderOptionsAdd) {
                reminderOptionsAdd.classList.toggle('hidden', !modalRemindMeAdd.checked);
                if (modalRemindMeAdd.checked) { // If enabling reminder
                    // Pre-fill reminder date/time from due date/time if available and reminder fields are empty
                    if (modalDueDateInputAdd.value && !modalReminderDateAdd.value) modalReminderDateAdd.value = modalDueDateInputAdd.value;
                    if (modalTimeInputAdd.value && !modalReminderTimeAdd.value) modalReminderTimeAdd.value = modalTimeInputAdd.value;
                    // Set min date for reminder
                    const today = new Date();
                    modalReminderDateAdd.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                }
            } else if (reminderOptionsAdd) { // Feature disabled, ensure hidden
                reminderOptionsAdd.classList.add('hidden');
            }
        });
    }
    if (modalRemindMeViewEdit) {
        modalRemindMeViewEdit.addEventListener('change', () => {
            if(featureFlags.reminderFeature && reminderOptionsViewEdit) {
                reminderOptionsViewEdit.classList.toggle('hidden', !modalRemindMeViewEdit.checked);
                 if (modalRemindMeViewEdit.checked) { // If enabling reminder
                     // Set min date for reminder
                     const today = new Date();
                     modalReminderDateViewEdit.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                 }
            } else if (reminderOptionsViewEdit) { // Feature disabled, ensure hidden
                reminderOptionsViewEdit.classList.add('hidden');
            }
        });
    }

    // Smart Views & Search
    if (smartViewButtonsContainer) {
        smartViewButtonsContainer.addEventListener('click', (event) => {
            const button = event.target.closest('.smart-view-btn');
            if (button && button.dataset.filter) {
                setFilter(button.dataset.filter);
            }
        });
    }
    if (taskSearchInput) {
        taskSearchInput.addEventListener('input', (event) => {
            setAppSearchTerm(event.target.value.trim().toLowerCase()); // setAppSearchTerm from app_logic.js
            renderTasks();
        });
    }

    // Sidebar
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', () => {
            const isCurrentlyMinimized = taskSidebar.classList.contains('sidebar-minimized');
            setSidebarMinimized(!isCurrentlyMinimized); // from ui_rendering.js
        });
    }
    sidebarIconOnlyButtons.forEach(button => {
        button.addEventListener('mouseenter', (event) => {
            if (!taskSidebar.classList.contains('sidebar-minimized')) return;
            clearTimeout(tooltipTimeout); // tooltipTimeout from app_logic.js
            tooltipTimeout = setTimeout(() => {
                const tooltipText = button.title || button.querySelector('.sidebar-text-content')?.textContent.trim();
                if (tooltipText) {
                    showTooltip(event.currentTarget, tooltipText); // from ui_rendering.js
                }
            }, 500); // Delay before showing tooltip
        });
        button.addEventListener('mouseleave', () => {
            hideTooltip(); // from ui_rendering.js
        });
    });


    // Sort Buttons
    if (sortByDueDateBtn) sortByDueDateBtn.addEventListener('click', () => { setAppCurrentSort(currentSort === 'dueDate' ? 'default' : 'dueDate'); updateSortButtonStates(); renderTasks(); }); // setAppCurrentSort from app_logic.js
    if (sortByPriorityBtn) sortByPriorityBtn.addEventListener('click', () => { setAppCurrentSort(currentSort === 'priority' ? 'default' : 'priority'); updateSortButtonStates(); renderTasks(); });
    if (sortByLabelBtn) sortByLabelBtn.addEventListener('click', () => { setAppCurrentSort(currentSort === 'label' ? 'default' : 'label'); updateSortButtonStates(); renderTasks(); });


    // Sub-task input and add buttons
    if (modalAddSubTaskBtnViewEdit) { modalAddSubTaskBtnViewEdit.addEventListener('click', handleAddSubTaskViewEdit); }
    if (modalSubTaskInputViewEdit) { modalSubTaskInputViewEdit.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); handleAddSubTaskViewEdit(); } }); }

    if (modalAddSubTaskBtnAdd) { modalAddSubTaskBtnAdd.addEventListener('click', handleAddTempSubTaskForAddModal); }
    if (modalSubTaskInputAdd) { modalSubTaskInputAdd.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); handleAddTempSubTaskForAddModal(); } }); }


    // Global Keydown Listener for shortcuts (e.g., '+' for add task, 'Esc' for close modal)
    document.addEventListener('keydown', (event) => {
        const isAddModalOpen = addTaskModal && !addTaskModal.classList.contains('hidden');
        const isViewEditModalOpen = viewEditTaskModal && !viewEditTaskModal.classList.contains('hidden');
        const isViewDetailsModalOpen = viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden');
        const isManageLabelsModalOpen = manageLabelsModal && !manageLabelsModal.classList.contains('hidden');
        const isSettingsModalOpen = settingsModal && !settingsModal.classList.contains('hidden');
        const isTaskReviewModalOpen = taskReviewModal && !taskReviewModal.classList.contains('hidden');
        const isTooltipsGuideModalOpen = tooltipsGuideModal && !tooltipsGuideModal.classList.contains('hidden');
        // Assuming Feature Flags modal has an ID 'featureFlagsModal'
        const featureFlagsModalElement = document.getElementById('featureFlagsModal');
        const isFeatureFlagsModalOpen = featureFlagsModalElement && !featureFlagsModalElement.classList.contains('hidden');


        const isAnyModalOpen = isAddModalOpen || isViewEditModalOpen || isViewDetailsModalOpen ||
                               isManageLabelsModalOpen || isSettingsModalOpen || isTaskReviewModalOpen ||
                               isTooltipsGuideModalOpen || isFeatureFlagsModalOpen;

        const isInputFocused = document.activeElement.tagName === 'INPUT' ||
                               document.activeElement.tagName === 'SELECT' ||
                               document.activeElement.tagName === 'TEXTAREA';
        const isSubTaskInputFocused = document.activeElement === modalSubTaskInputViewEdit || document.activeElement === modalSubTaskInputAdd;


        if ((event.key === '+' || event.key === '=') && !isAnyModalOpen && !isInputFocused && !isSubTaskInputFocused) {
            event.preventDefault();
            openAddModal(); // from modal_interactions.js
        }

        if (event.key === 'Escape') {
            if (isAddModalOpen) closeAddModal();
            else if (isViewEditModalOpen) closeViewEditModal();
            else if (isViewDetailsModalOpen) closeViewTaskDetailsModal();
            else if (isManageLabelsModalOpen) closeManageLabelsModal();
            else if (isSettingsModalOpen) closeSettingsModal();
            else if (isTaskReviewModalOpen) closeTaskReviewModal();
            else if (isTooltipsGuideModalOpen) closeTooltipsGuideModal();
            else if (isFeatureFlagsModalOpen) {
                // Feature flags modal might have its own close function or button
                const closeBtn = document.getElementById('closeFeatureFlagsModalBtn'); // Standardized ID
                if (closeBtn && typeof closeBtn.click === 'function') closeBtn.click();
                // Or if it's managed by a generic modal_interactions.js function:
                // else if (typeof closeFeatureFlagsModal === 'function') closeFeatureFlagsModal();
            }
        }
    });
}

// --- Global Initialization ---
/**
 * Initializes the application on window load.
 * Loads feature flags, initializes tasks, populates UI elements,
 * initializes feature modules, applies active features, sets initial UI states,
 * and sets up event listeners.
 */
window.onload = async () => {
    console.log("window.onload in ui_event_handlers.js starting");
    await loadFeatureFlags(); // loadFeatureFlags from app_logic.js
    initializeTasks();    // initializeTasks from app_logic.js
    updateUniqueLabels(); // updateUniqueLabels from app_logic.js

    // Populate datalists (uses uniqueLabels from app_logic.js, functions from ui_rendering.js)
    populateDatalist(existingLabelsDatalist);
    populateDatalist(existingLabelsEditDatalist);

    // Initialize feature modules (these are self-initializing or have their init functions called)
    // Assumes AppFeatures object is created by feature_*.js files.
    if (window.AppFeatures) {
        if (window.AppFeatures.initializeTestButtonFeature) {
            window.AppFeatures.initializeTestButtonFeature();
        }
        if (window.AppFeatures.TaskTimerSystem && typeof window.AppFeatures.TaskTimerSystem.initialize === 'function') {
            window.AppFeatures.TaskTimerSystem.initialize();
        }
        if (window.AppFeatures.initializeReminderFeature) {
            window.AppFeatures.initializeReminderFeature();
        }
        if (window.AppFeatures.initializeAdvancedRecurrenceFeature) {
            window.AppFeatures.initializeAdvancedRecurrenceFeature();
        }
        // Add other feature initializations here as they are created
    }

    applyActiveFeatures(); // Applies visibility based on loaded flags

    // Set initial state for smart view buttons (styling)
    smartViewButtons.forEach(button => {
        button.classList.add('bg-slate-200', 'text-slate-700', 'hover:bg-slate-300', 'dark:bg-slate-700', 'dark:text-slate-300', 'dark:hover:bg-slate-600');
        button.querySelector('i')?.classList.add('text-slate-500', 'dark:text-slate-400');
    });

    // Restore sidebar state
    const savedSidebarState = localStorage.getItem('sidebarState');
    if (savedSidebarState === 'minimized') {
        setSidebarMinimized(true); // from ui_rendering.js
    } else {
        setSidebarMinimized(false); // from ui_rendering.js
    }

    // Set initial filter and render tasks
    if (typeof setFilter === 'function') {
        setFilter(currentFilter); // currentFilter from app_logic.js
    } else {
        console.error("setFilter function is not defined when called in window.onload!");
    }

    // Update button states
    updateSortButtonStates(); // from ui_rendering.js
    updateClearCompletedButtonState(); // from ui_rendering.js

    // Setup all event listeners
    setupEventListeners();
    console.log("Todo App Initialized.");
};
