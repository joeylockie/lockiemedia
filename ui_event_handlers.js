// ui_event_handlers.js

// This file handles event listeners, user interaction handlers (forms, buttons),
// applying feature flags to UI, and the main application initialization sequence (window.onload).
// It depends on:
// - DOM elements defined in ui_rendering.js (assumed to be globally available).
// - Rendering functions from ui_rendering.js (e.g., refreshTaskView, showMessage).
// - Modal interaction functions from modal_interactions.js (e.g., openAddModal, closeAddModal).
// - Core logic functions from app_logic.js (e.g., saveTasks, tasks array, featureFlags, setTaskViewMode).
// - Feature-specific modules (e.g., window.AppFeatures.TaskTimerSystem, window.AppFeatures.KanbanBoard).

// --- Temporary State for UI Interactions (scoped to this file) ---
let tempSubTasksForAddModal = [];

// --- Feature Flag Modal Population ---
/**
 * Populates the Feature Flags modal with toggles for each feature.
 * Assumes 'featureFlags' (from app_logic.js) and 'featureFlagsListContainer' (DOM element) are available.
 */
function populateFeatureFlagsModal() {
    if (!featureFlagsListContainer) return;
    featureFlagsListContainer.innerHTML = ''; // Clear existing items

    const friendlyNames = {
        testButtonFeature: "Test Button",
        reminderFeature: "Task Reminders",
        taskTimerSystem: "Task Timer & Review",
        advancedRecurrence: "Advanced Recurrence (Soon)",
        fileAttachments: "File Attachments (Soon)",
        integrationsServices: "Integrations (Soon)",
        userAccounts: "User Accounts (Soon)",
        collaborationSharing: "Collaboration (Soon)",
        crossDeviceSync: "Cross-Device Sync (Soon)",
        tooltipsGuide: "Tooltips & Shortcuts Guide",
        subTasksFeature: "Sub-tasks",
        kanbanBoardFeature: "Kanban Board View" // Added Kanban
    };

    // Define the order of feature flags in the modal
    const featureOrder = [
        'kanbanBoardFeature',
        'subTasksFeature',
        'taskTimerSystem',
        'reminderFeature',
        'tooltipsGuide',
        'testButtonFeature',
        'advancedRecurrence',
        'fileAttachments',
        'integrationsServices',
        'userAccounts',
        'collaborationSharing',
        'crossDeviceSync'
    ];

    featureOrder.forEach(key => {
        if (featureFlags.hasOwnProperty(key)) {
            const flagItem = document.createElement('div');
            flagItem.className = 'feature-flag-item';

            const label = document.createElement('span');
            label.textContent = friendlyNames[key] || key;
            label.className = 'feature-flag-label';
            flagItem.appendChild(label);

            const toggleContainer = document.createElement('div');
            toggleContainer.className = 'relative';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `toggle-${key}`;
            checkbox.className = 'toggle-checkbox';
            checkbox.checked = featureFlags[key];
            checkbox.addEventListener('change', () => {
                featureFlags[key] = checkbox.checked;
                // Note: Persisting feature flag changes to features.json requires server-side logic
                // or a more complex client-side storage mechanism if features.json is just a default.
                // For now, this updates the in-memory flags and re-applies UI.
                console.log(`Feature ${key} toggled to ${featureFlags[key]}`);
                applyActiveFeatures(); // Re-apply features to update UI immediately
                // If Kanban feature is toggled, ensure the view mode is consistent
                if (key === 'kanbanBoardFeature') {
                    if (!featureFlags.kanbanBoardFeature && currentTaskViewMode === 'kanban') {
                        setTaskViewMode('list'); // from app_logic.js
                    }
                    refreshTaskView(); // from ui_rendering.js
                }
            });

            const toggleLabel = document.createElement('label');
            toggleLabel.htmlFor = `toggle-${key}`;
            toggleLabel.className = 'toggle-label';

            toggleContainer.appendChild(checkbox);
            toggleContainer.appendChild(toggleLabel);
            flagItem.appendChild(toggleContainer);
            featureFlagsListContainer.appendChild(flagItem);
        }
    });
}


// --- Apply Active Features (UI part) ---
/**
 * Updates UI visibility based on featureFlags.
 * Calls feature-specific UI update functions if available, otherwise directly manipulates DOM.
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
    toggleElements('.advanced-recurrence-element', featureFlags.advancedRecurrence);
    // File Attachments Feature
    toggleElements('.file-attachments-element', featureFlags.fileAttachments);
    // Other features
    toggleElements('.integrations-services-element', featureFlags.integrationsServices);
    toggleElements('.user-accounts-element', featureFlags.userAccounts);
    toggleElements('.collaboration-sharing-element', featureFlags.collaborationSharing);
    toggleElements('.cross-device-sync-element', featureFlags.crossDeviceSync);
    toggleElements('.tooltips-guide-element', featureFlags.tooltipsGuide);
    toggleElements('.sub-tasks-feature-element', featureFlags.subTasksFeature);

    if (settingsTooltipsGuideBtn) settingsTooltipsGuideBtn.classList.toggle('hidden', !featureFlags.tooltipsGuide);

    // Kanban Board Feature
    if (kanbanViewToggleBtn) { // Ensure button exists
        kanbanViewToggleBtn.classList.toggle('hidden', !featureFlags.kanbanBoardFeature);
    }
    if (window.AppFeatures && window.AppFeatures.KanbanBoard && typeof window.AppFeatures.KanbanBoard.updateUIVisibility === 'function') {
        window.AppFeatures.KanbanBoard.updateUIVisibility(featureFlags.kanbanBoardFeature);
    }
    // If Kanban feature is disabled, ensure view mode is list
    if (!featureFlags.kanbanBoardFeature && currentTaskViewMode === 'kanban') {
        setTaskViewMode('list'); // from app_logic.js
    }

    refreshTaskView(); // Re-render tasks/kanban to reflect any UI changes (from ui_rendering.js)

    // If a task is being viewed, refresh its details modal
    if (currentViewTaskId && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) {
        openViewTaskDetailsModal(currentViewTaskId); // from modal_interactions.js
    }
    // Update feature flags modal if it's open
    const featureFlagsModalElement = document.getElementById('featureFlagsModal');
    if (featureFlagsModalElement && !featureFlagsModalElement.classList.contains('hidden')) {
        populateFeatureFlagsModal();
    }
}

// --- Event Handlers ---
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
        showMessage('Task description cannot be empty!', 'error');
        modalTaskInputAdd.focus();
        return;
    }

    let finalDueDate = explicitDueDate;
    let finalTaskText = rawTaskText;
    if (!explicitDueDate) {
        const { parsedDate: dateFromDesc, remainingText: textAfterDate } = parseDateFromText(rawTaskText);
        if (dateFromDesc) {
            finalDueDate = dateFromDesc;
            finalTaskText = textAfterDate.trim() || rawTaskText;
        }
    }

    const subTasksToSave = featureFlags.subTasksFeature ? tempSubTasksForAddModal.map(st => ({
        id: Date.now() + Math.random(),
        text: st.text,
        completed: st.completed,
        creationDate: Date.now()
    })) : [];

    const defaultKanbanColumn = kanbanColumns[0]?.id || 'todo'; // From app_logic.js
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
        attachments: [],
        completedDate: null,
        subTasks: subTasksToSave,
        recurrenceRule: null,
        recurrenceEndDate: null,
        nextDueDate: finalDueDate || null,
        kanbanColumnId: defaultKanbanColumn // Assign to default Kanban column
    };

    tasks.unshift(newTask);
    saveTasks();

    if (currentFilter === 'completed') {
        setFilter('inbox');
    } else {
        refreshTaskView(); // Use refreshTaskView
    }
    closeAddModal();
    showMessage('Task added successfully!', 'success');
    tempSubTasksForAddModal = [];
}

function handleEditTask(event) {
    event.preventDefault();
    const taskId = parseInt(modalViewEditTaskId.value);
    const taskText = modalTaskInputViewEdit.value.trim();
    const dueDate = modalDueDateInputViewEdit.value;
    const time = modalTimeInputViewEdit.value;

    let estHours = 0, estMinutes = 0;
    const originalTask = tasks.find(t => t.id === taskId);
    if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem) {
        const estimates = window.AppFeatures.TaskTimerSystem.getEstimatesFromEditModal();
        estHours = estimates.estHours;
        estMinutes = estimates.estMinutes;
    } else if (originalTask) {
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
            attachments: task.attachments || []
            // kanbanColumnId is preserved
        } : task
    );
    saveTasks();
    refreshTaskView(); // Use refreshTaskView
    closeViewEditModal();
    showMessage('Task updated successfully!', 'success');

    if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem && currentViewTaskId === taskId) {
        const updatedTask = tasks.find(t => t.id === taskId);
        if (updatedTask && typeof window.AppFeatures.TaskTimerSystem.setupTimerForModal === 'function') {
             window.AppFeatures.TaskTimerSystem.setupTimerForModal(updatedTask);
        }
    }
}

function toggleComplete(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    tasks[taskIndex].completedDate = tasks[taskIndex].completed ? Date.now() : null;

    // If task is completed and Kanban is active, move to "Done" column
    if (tasks[taskIndex].completed && featureFlags.kanbanBoardFeature) {
        const doneColumn = kanbanColumns.find(col => col.id === 'done');
        if (doneColumn) {
            tasks[taskIndex].kanbanColumnId = doneColumn.id;
        }
    } else if (!tasks[taskIndex].completed && featureFlags.kanbanBoardFeature && tasks[taskIndex].kanbanColumnId === 'done') {
        // If uncompleted from "Done" column, move to default "To Do" column
         const defaultColumn = kanbanColumns[0]?.id || 'todo';
         tasks[taskIndex].kanbanColumnId = defaultColumn;
    }


    if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem) {
        window.AppFeatures.TaskTimerSystem.handleTaskCompletion(taskId, tasks[taskIndex].completed);
    }
    saveTasks();
    refreshTaskView(); // Use refreshTaskView

    if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem && currentViewTaskId === taskId) {
         const task = tasks.find(t => t.id === taskId);
         if(task && window.AppFeatures.TaskTimerSystem.setupTimerForModal) {
            window.AppFeatures.TaskTimerSystem.setupTimerForModal(task);
         }
    }
}

function deleteTask(taskId) {
    if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem && currentViewTaskId === taskId) {
        window.AppFeatures.TaskTimerSystem.clearTimerOnModalClose();
    }
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    refreshTaskView(); // Use refreshTaskView
    showMessage('Task deleted.', 'error');
}

function setFilter(filter) {
    setAppCurrentFilter(filter);
    updateSortButtonStates();

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
    refreshTaskView(); // Use refreshTaskView
}

function clearCompletedTasks() {
    const completedCount = tasks.filter(task => task.completed).length;
    if (completedCount === 0) {
        showMessage('No completed tasks to clear.', 'error');
        return;
    }
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    refreshTaskView(); // Use refreshTaskView
    showMessage(`${completedCount} completed task${completedCount > 1 ? 's' : ''} cleared.`, 'success');
    closeSettingsModal();
}

function handleAddNewLabel(event) {
    event.preventDefault();
    const labelName = newLabelInput.value.trim();
    if (labelName === '') {
        showMessage('Label name cannot be empty.', 'error');
        return;
    }
    if (uniqueLabels.some(l => l.toLowerCase() === labelName.toLowerCase())) {
        showMessage(`Label "${labelName}" already exists.`, 'error');
        return;
    }
    uniqueLabels.push(labelName);
    uniqueLabels.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    updateUniqueLabels();
    populateManageLabelsList();
    populateDatalist(existingLabelsDatalist);
    populateDatalist(existingLabelsEditDatalist);
    newLabelInput.value = '';
    showMessage(`Label "${labelName}" added.`, 'success');
}

function handleDeleteLabel(labelToDelete) {
    tasks = tasks.map(task => {
        if (task.label && task.label.toLowerCase() === labelToDelete.toLowerCase()) {
            return { ...task, label: '' };
        }
        return task;
    });
    saveTasks();
    populateManageLabelsList();
    populateDatalist(existingLabelsDatalist);
    populateDatalist(existingLabelsEditDatalist);
    refreshTaskView(); // Use refreshTaskView
    showMessage(`Label "${labelToDelete}" deleted. Tasks using it have been unlabelled.`, 'success');
}

function handleAddSubTaskViewEdit() {
    if (!featureFlags.subTasksFeature || !editingTaskId || !modalSubTaskInputViewEdit) return;
    const subTaskText = modalSubTaskInputViewEdit.value.trim();
    if (subTaskText === '') {
        showMessage('Sub-task description cannot be empty.', 'error');
        modalSubTaskInputViewEdit.focus();
        return;
    }
    if (addSubTaskLogic(editingTaskId, subTaskText)) { // addSubTaskLogic from app_logic.js
        renderSubTasksForEditModal(editingTaskId, modalSubTasksListViewEdit);
        modalSubTaskInputViewEdit.value = '';
        showMessage('Sub-task added.', 'success');
        if (currentViewTaskId === editingTaskId && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) {
            renderSubTasksForViewModal(editingTaskId, modalSubTasksListViewDetails, viewSubTaskProgress, noSubTasksMessageViewDetails);
        }
        refreshTaskView(); // Use refreshTaskView
    } else {
        showMessage('Failed to add sub-task.', 'error');
    }
}

function handleAddTempSubTaskForAddModal() {
    if (!featureFlags.subTasksFeature || !modalSubTaskInputAdd) return;
    const subTaskText = modalSubTaskInputAdd.value.trim();
    if (subTaskText === '') {
        showMessage('Sub-task description cannot be empty.', 'error');
        modalSubTaskInputAdd.focus();
        return;
    }
    tempSubTasksForAddModal.push({ text: subTaskText, completed: false });
    renderTempSubTasksForAddModal();
    modalSubTaskInputAdd.value = '';
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    // Modal Openers and Form Submissions
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

    // Feature Flags Modal
    const openFeatureFlagsModalBtn = document.getElementById('openFeatureFlagsModalBtn'); // Assuming you add this button
    const featureFlagsModalElement = document.getElementById('featureFlagsModal');
    const closeFeatureFlagsModalBtn = document.getElementById('closeFeatureFlagsModalBtn');
    const closeFeatureFlagsSecondaryBtn = document.getElementById('closeFeatureFlagsSecondaryBtn');

    // Example: Add a button to open feature flags modal, perhaps in settings or a debug area
    // For now, let's assume it's opened from settings or a dedicated button.
    // If you add a button with id="openFeatureFlagsModalBtn" somewhere:
    // if (openFeatureFlagsModalBtn) openFeatureFlagsModalBtn.addEventListener('click', () => {
    //     populateFeatureFlagsModal(); // Populate before opening
    //     featureFlagsModalElement.classList.remove('hidden');
    //     // Add modal open transition if needed
    // });
    if (settingsModal) { // Add a button inside settings to open feature flags
        const ffButton = document.createElement('button');
        ffButton.id = 'settingsOpenFeatureFlagsBtn';
        ffButton.type = 'button';
        ffButton.className = 'settings-modal-button bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:hover:bg-purple-800/70 dark:text-purple-300';
        ffButton.innerHTML = '<i class="fas fa-cogs"></i> Manage Feature Flags'; // Or a more appropriate icon
        ffButton.addEventListener('click', () => {
            closeSettingsModal();
            populateFeatureFlagsModal();
            featureFlagsModalElement.classList.remove('hidden');
            setTimeout(() => {
                 document.getElementById('modalDialogFeatureFlags').classList.remove('scale-95', 'opacity-0');
                 document.getElementById('modalDialogFeatureFlags').classList.add('scale-100', 'opacity-100');
            },10);
        });
        // Add this button to the settings modal's content area
        const settingsModalContent = modalDialogSettings.querySelector('.space-y-3');
        if(settingsModalContent) settingsModalContent.appendChild(ffButton);

    }


    if (closeFeatureFlagsModalBtn) closeFeatureFlagsModalBtn.addEventListener('click', () => {
        document.getElementById('modalDialogFeatureFlags').classList.add('scale-95', 'opacity-0');
        setTimeout(() => featureFlagsModalElement.classList.add('hidden'), 200);
    });
    if (closeFeatureFlagsSecondaryBtn) closeFeatureFlagsSecondaryBtn.addEventListener('click', () => {
        document.getElementById('modalDialogFeatureFlags').classList.add('scale-95', 'opacity-0');
        setTimeout(() => featureFlagsModalElement.classList.add('hidden'), 200);
    });
    if (featureFlagsModalElement) featureFlagsModalElement.addEventListener('click', (event) => {
        if (event.target === featureFlagsModalElement) {
            document.getElementById('modalDialogFeatureFlags').classList.add('scale-95', 'opacity-0');
            setTimeout(() => featureFlagsModalElement.classList.add('hidden'), 200);
        }
    });


    // Reminder toggles
    if (modalRemindMeAdd) {
        modalRemindMeAdd.addEventListener('change', () => {
            if(featureFlags.reminderFeature && reminderOptionsAdd) {
                reminderOptionsAdd.classList.toggle('hidden', !modalRemindMeAdd.checked);
                if (modalRemindMeAdd.checked) {
                    if (modalDueDateInputAdd.value && !modalReminderDateAdd.value) modalReminderDateAdd.value = modalDueDateInputAdd.value;
                    if (modalTimeInputAdd.value && !modalReminderTimeAdd.value) modalReminderTimeAdd.value = modalTimeInputAdd.value;
                    const today = new Date().toISOString().split('T')[0];
                    modalReminderDateAdd.min = today;
                }
            } else if (reminderOptionsAdd) {
                reminderOptionsAdd.classList.add('hidden');
            }
        });
    }
    if (modalRemindMeViewEdit) {
        modalRemindMeViewEdit.addEventListener('change', () => {
            if(featureFlags.reminderFeature && reminderOptionsViewEdit) {
                reminderOptionsViewEdit.classList.toggle('hidden', !modalRemindMeViewEdit.checked);
                 if (modalRemindMeViewEdit.checked) {
                     const today = new Date().toISOString().split('T')[0];
                     modalReminderDateViewEdit.min = today;
                 }
            } else if (reminderOptionsViewEdit) {
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
            setAppSearchTerm(event.target.value.trim().toLowerCase());
            refreshTaskView(); // Use refreshTaskView
        });
    }

    // Sidebar
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', () => {
            const isCurrentlyMinimized = taskSidebar.classList.contains('sidebar-minimized');
            setSidebarMinimized(!isCurrentlyMinimized);
        });
    }
    sidebarIconOnlyButtons.forEach(button => {
        button.addEventListener('mouseenter', (event) => {
            if (!taskSidebar.classList.contains('sidebar-minimized')) return;
            clearTimeout(tooltipTimeout);
            tooltipTimeout = setTimeout(() => {
                const tooltipText = button.title || button.querySelector('.sidebar-text-content')?.textContent.trim();
                if (tooltipText) {
                    showTooltip(event.currentTarget, tooltipText);
                }
            }, 500);
        });
        button.addEventListener('mouseleave', () => {
            hideTooltip();
        });
    });

    // Sort Buttons
    if (sortByDueDateBtn) sortByDueDateBtn.addEventListener('click', () => { setAppCurrentSort(currentSort === 'dueDate' ? 'default' : 'dueDate'); updateSortButtonStates(); refreshTaskView(); });
    if (sortByPriorityBtn) sortByPriorityBtn.addEventListener('click', () => { setAppCurrentSort(currentSort === 'priority' ? 'default' : 'priority'); updateSortButtonStates(); refreshTaskView(); });
    if (sortByLabelBtn) sortByLabelBtn.addEventListener('click', () => { setAppCurrentSort(currentSort === 'label' ? 'default' : 'label'); updateSortButtonStates(); refreshTaskView(); });

    // Sub-task input and add buttons
    if (modalAddSubTaskBtnViewEdit) { modalAddSubTaskBtnViewEdit.addEventListener('click', handleAddSubTaskViewEdit); }
    if (modalSubTaskInputViewEdit) { modalSubTaskInputViewEdit.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); handleAddSubTaskViewEdit(); } }); }
    if (modalAddSubTaskBtnAdd) { modalAddSubTaskBtnAdd.addEventListener('click', handleAddTempSubTaskForAddModal); }
    if (modalSubTaskInputAdd) { modalSubTaskInputAdd.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); handleAddTempSubTaskForAddModal(); } }); }

    // --- Kanban View Toggle Button Event Listener (New) ---
    if (kanbanViewToggleBtn) {
        kanbanViewToggleBtn.addEventListener('click', () => {
            if (!featureFlags.kanbanBoardFeature) return; // Should not be clickable if feature is off

            if (currentTaskViewMode === 'list') {
                setTaskViewMode('kanban'); // from app_logic.js
            } else {
                setTaskViewMode('list'); // from app_logic.js
            }
            refreshTaskView(); // This will call the correct render function and update button/heading
        });
    }


    // Global Keydown Listener
    document.addEventListener('keydown', (event) => {
        const isAddModalOpen = addTaskModal && !addTaskModal.classList.contains('hidden');
        const isViewEditModalOpen = viewEditTaskModal && !viewEditTaskModal.classList.contains('hidden');
        const isViewDetailsModalOpen = viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden');
        const isManageLabelsModalOpen = manageLabelsModal && !manageLabelsModal.classList.contains('hidden');
        const isSettingsModalOpen = settingsModal && !settingsModal.classList.contains('hidden');
        const isTaskReviewModalOpen = taskReviewModal && !taskReviewModal.classList.contains('hidden');
        const isTooltipsGuideModalOpen = tooltipsGuideModal && !tooltipsGuideModal.classList.contains('hidden');
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
            openAddModal();
        }

        if (event.key === 'Escape') {
            if (isAddModalOpen) closeAddModal();
            else if (isViewEditModalOpen) closeViewEditModal();
            else if (isViewDetailsModalOpen) closeViewTaskDetailsModal();
            else if (isManageLabelsModalOpen) closeManageLabelsModal();
            else if (isSettingsModalOpen) closeSettingsModal();
            else if (isTaskReviewModalOpen) closeTaskReviewModal();
            else if (isTooltipsGuideModalOpen) closeTooltipsGuideModal();
            else if (isFeatureFlagsModalOpen && closeFeatureFlagsModalBtn) {
                closeFeatureFlagsModalBtn.click();
            }
        }
    });
}

// --- Global Initialization ---
window.onload = async () => {
    console.log("window.onload in ui_event_handlers.js starting");
    await loadFeatureFlags();
    initializeTasks();
    updateUniqueLabels();
    loadKanbanColumns(); // Load Kanban column preferences from app_logic.js

    populateDatalist(existingLabelsDatalist);
    populateDatalist(existingLabelsEditDatalist);

    // Initialize feature modules
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
        // Kanban Board Initialization (New)
        if (featureFlags.kanbanBoardFeature && window.AppFeatures && window.AppFeatures.KanbanBoard && typeof window.AppFeatures.KanbanBoard.initialize === 'function') {
            window.AppFeatures.KanbanBoard.initialize();
        }
        // Add other feature initializations
    }

    applyActiveFeatures(); // Applies visibility based on loaded flags, including Kanban button

    smartViewButtons.forEach(button => {
        button.classList.add('bg-slate-200', 'text-slate-700', 'hover:bg-slate-300', 'dark:bg-slate-700', 'dark:text-slate-300', 'dark:hover:bg-slate-600');
        button.querySelector('i')?.classList.add('text-slate-500', 'dark:text-slate-400');
    });

    const savedSidebarState = localStorage.getItem('sidebarState');
    if (savedSidebarState === 'minimized') {
        setSidebarMinimized(true);
    } else {
        setSidebarMinimized(false);
    }

    if (typeof setFilter === 'function') {
        setFilter(currentFilter); // This will also call refreshTaskView
    } else {
        console.error("setFilter function is not defined when called in window.onload!");
        refreshTaskView(); // Call refreshTaskView directly if setFilter is somehow not ready
    }

    updateSortButtonStates();
    updateClearCompletedButtonState();
    // Initial state for Kanban toggle button and heading is handled by refreshTaskView via applyActiveFeatures/setFilter

    setupEventListeners();
    console.log("Todo App Initialized.");
};
