// ui_event_handlers.js

// This file handles event listeners, user interaction handlers (forms, buttons),
// applying feature flags to UI, and the main application initialization sequence.
// It depends on:
// - DOM elements defined in ui_rendering.js (assumed to be globally available AFTER initializeDOMElements is called).
// - Rendering functions from ui_rendering.js (e.g., refreshTaskView, showMessage, initializeDOMElements, styleInitialSmartViewButtons).
// - Modal interaction functions from modal_interactions.js (e.g., openAddModal, closeAddModal).
// - Core logic functions from app_logic.js (e.g., saveTasks, tasks array, featureFlags, setTaskViewMode, projects array, uniqueProjects).
// - Feature-specific modules (e.g., window.AppFeatures.TaskTimerSystem, window.AppFeatures.KanbanBoard, window.AppFeatures.Projects, window.AppFeatures.DataManagement).

// --- Temporary State for UI Interactions (scoped to this file) ---
let tempSubTasksForAddModal = [];


// --- Function Definitions MOVED UP ---

/**
 * Populates the Feature Flags modal with toggles for each feature.
 * Assumes 'featureFlags' (from app_logic.js) and 'featureFlagsListContainer' (DOM element from ui_rendering.js) are available.
 */
function populateFeatureFlagsModal() {
    const currentFFListContainer = featureFlagsListContainer || document.getElementById('featureFlagsListContainer');
    if (!currentFFListContainer) {
        console.warn("Feature flags list container not found for populateFeatureFlagsModal.");
        return;
    }
    currentFFListContainer.innerHTML = '';

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
        kanbanBoardFeature: "Kanban Board View",
        projectFeature: "Projects Feature",
        exportDataFeature: "Export Data Feature",
        calendarViewFeature: "Calendar View",
        taskDependenciesFeature: "Task Dependencies (Soon)" // New: Task Dependencies friendly name
    };
    const featureOrder = [
        'projectFeature', 'kanbanBoardFeature', 'calendarViewFeature',
        'subTasksFeature', 'taskDependenciesFeature', // New: Added taskDependenciesFeature to the order
        'taskTimerSystem', 'reminderFeature',
        'tooltipsGuide', 'exportDataFeature',
        'testButtonFeature', 'advancedRecurrence', 'fileAttachments',
        'integrationsServices', 'userAccounts', 'collaborationSharing', 'crossDeviceSync'
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
                console.log(`Feature ${key} toggled to ${featureFlags[key]}`);
                localStorage.setItem('userFeatureFlags', JSON.stringify(featureFlags));
                applyActiveFeatures(); // This will handle UI updates including view mode changes

                // Specific logic for view-changing features when they are disabled
                if (key === 'kanbanBoardFeature' && !featureFlags.kanbanBoardFeature && currentTaskViewMode === 'kanban') {
                    setTaskViewMode('list'); // Switch to list if Kanban is disabled while active
                }
                if (key === 'calendarViewFeature' && !featureFlags.calendarViewFeature && currentTaskViewMode === 'calendar') {
                    setTaskViewMode('list'); // Switch to list if Calendar is disabled while active
                }
                if (key === 'projectFeature' && !featureFlags.projectFeature && currentFilter.startsWith('project_')) {
                    setFilter('inbox'); // Reset filter if project feature is disabled
                }
                refreshTaskView(); // Refresh the view after any potential mode/filter change
            });
            const toggleLabel = document.createElement('label');
            toggleLabel.htmlFor = `toggle-${key}`;
            toggleLabel.className = 'toggle-label';
            toggleContainer.appendChild(checkbox);
            toggleContainer.appendChild(toggleLabel);
            flagItem.appendChild(toggleContainer);
            currentFFListContainer.appendChild(flagItem);
        }
    });
}

/**
 * Updates UI visibility based on featureFlags.
 * Calls feature-specific UI update functions if available, otherwise directly manipulates DOM.
 */
function applyActiveFeatures() {
    console.log('[ApplyFeatures] Starting applyActiveFeatures. Calendar Flag:', featureFlags.calendarViewFeature);
    const toggleElements = (selector, isEnabled) => {
        document.querySelectorAll(selector).forEach(el => el.classList.toggle('hidden', !isEnabled));
    };

    // Existing feature toggles
    if (window.AppFeatures?.updateTestButtonUIVisibility) window.AppFeatures.updateTestButtonUIVisibility(featureFlags.testButtonFeature); else if (testFeatureButtonContainer) testFeatureButtonContainer.classList.toggle('hidden', !featureFlags.testButtonFeature);
    if (window.AppFeatures?.TaskTimerSystem?.updateUIVisibility) window.AppFeatures.TaskTimerSystem.updateUIVisibility(featureFlags.taskTimerSystem); else { toggleElements('.task-timer-system-element', featureFlags.taskTimerSystem); if (settingsTaskReviewBtn) settingsTaskReviewBtn.classList.toggle('hidden', !featureFlags.taskTimerSystem); }
    if (window.AppFeatures?.updateReminderUIVisibility) window.AppFeatures.updateReminderUIVisibility(featureFlags.reminderFeature); else toggleElements('.reminder-feature-element', featureFlags.reminderFeature);
    toggleElements('.advanced-recurrence-element', featureFlags.advancedRecurrence);
    toggleElements('.file-attachments-element', featureFlags.fileAttachments);
    toggleElements('.integrations-services-element', featureFlags.integrationsServices);
    toggleElements('.user-accounts-element', featureFlags.userAccounts);
    toggleElements('.collaboration-sharing-element', featureFlags.collaborationSharing);
    toggleElements('.cross-device-sync-element', featureFlags.crossDeviceSync);
    toggleElements('.tooltips-guide-element', featureFlags.tooltipsGuide);
    toggleElements('.sub-tasks-feature-element', featureFlags.subTasksFeature);
    if (settingsTooltipsGuideBtn) settingsTooltipsGuideBtn.classList.toggle('hidden', !featureFlags.tooltipsGuide);

    // Kanban Board UI
    if (kanbanViewToggleBtn) kanbanViewToggleBtn.classList.toggle('hidden', !featureFlags.kanbanBoardFeature);
    if (window.AppFeatures?.KanbanBoard?.updateUIVisibility) window.AppFeatures.KanbanBoard.updateUIVisibility(featureFlags.kanbanBoardFeature);
    if (!featureFlags.kanbanBoardFeature && currentTaskViewMode === 'kanban') setTaskViewMode('list');

    // Project Feature UI
    if (window.AppFeatures?.Projects?.updateUIVisibility) window.AppFeatures.Projects.updateUIVisibility(featureFlags.projectFeature); else toggleElements('.project-feature-element', featureFlags.projectFeature);
    if (!featureFlags.projectFeature && currentFilter.startsWith('project_')) setFilter('inbox');

    // Data Management Feature UI
    if (window.AppFeatures?.DataManagement?.updateUIVisibility) {
        window.AppFeatures.DataManagement.updateUIVisibility(featureFlags.exportDataFeature);
    } else {
        toggleElements('.export-data-feature-element', featureFlags.exportDataFeature);
    }

    // Calendar View Feature UI
    const calendarViewToggleBtn = document.getElementById('calendarViewToggleBtn');
    if (calendarViewToggleBtn) calendarViewToggleBtn.classList.toggle('hidden', !featureFlags.calendarViewFeature);
    toggleElements('.calendar-view-feature-element', featureFlags.calendarViewFeature);
    if (!featureFlags.calendarViewFeature && currentTaskViewMode === 'calendar') {
        setTaskViewMode('list');
    }

    // New: Task Dependencies Feature UI
    // Add a class like '.task-dependencies-feature-element' to HTML elements related to this feature.
    toggleElements('.task-dependencies-feature-element', featureFlags.taskDependenciesFeature);
    // If a dedicated TaskDependencies module exists, call its UI update function:
    // if (window.AppFeatures?.TaskDependencies?.updateUIVisibility) window.AppFeatures.TaskDependencies.updateUIVisibility(featureFlags.taskDependenciesFeature);


    refreshTaskView(); // This should handle rendering the correct view (list, kanban, or eventually calendar)
    if (currentViewTaskId && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) openViewTaskDetailsModal(currentViewTaskId); // Re-open view modal if it was open
    const featureFlagsModalElement = document.getElementById('featureFlagsModal');
    if (featureFlagsModalElement && !featureFlagsModalElement.classList.contains('hidden')) populateFeatureFlagsModal(); // Refresh feature flags modal if open
    console.log('[ApplyFeatures] Finished applyActiveFeatures.');
}

// --- Event Handlers (handleAddTask, handleEditTask, etc. remain unchanged for this feature) ---

function handleAddTask(event) {
    event.preventDefault();
    const rawTaskText = modalTaskInputAdd.value.trim();
    const explicitDueDate = modalDueDateInputAdd.value;
    const time = modalTimeInputAdd.value;
    const priority = modalPriorityInputAdd.value;
    const label = modalLabelInputAdd.value.trim();
    const notes = modalNotesInputAdd.value.trim();
    let projectId = 0;
    if (featureFlags.projectFeature && modalProjectSelectAdd) {
        projectId = parseInt(modalProjectSelectAdd.value) || 0;
    }
    let estHours = 0, estMinutes = 0;
    if (featureFlags.taskTimerSystem && window.AppFeatures?.TaskTimerSystem) {
        const estimates = window.AppFeatures.TaskTimerSystem.getEstimatesFromAddModal();
        estHours = estimates.estHours;
        estMinutes = estimates.estMinutes;
    }
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
    const subTasksToSave = featureFlags.subTasksFeature ? tempSubTasksForAddModal.map(st => ({ id: Date.now() + Math.random(), text: st.text, completed: st.completed, creationDate: Date.now() })) : [];
    const defaultKanbanColumn = kanbanColumns[0]?.id || 'todo';
    const newTask = {
        id: Date.now(), text: finalTaskText, completed: false, creationDate: Date.now(), dueDate: finalDueDate || null, time: time || null, priority: priority, label: label || '', notes: notes || '', projectId: projectId, isReminderSet, reminderDate, reminderTime, reminderEmail, estimatedHours: estHours, estimatedMinutes: estMinutes, timerStartTime: null, timerAccumulatedTime: 0, timerIsRunning: false, timerIsPaused: false, actualDurationMs: 0, attachments: [], completedDate: null, subTasks: subTasksToSave, recurrenceRule: null, recurrenceEndDate: null, nextDueDate: finalDueDate || null, kanbanColumnId: defaultKanbanColumn,
        dependsOn: [], // New: Initialize for task dependencies
        blocksTasks: [] // New: Initialize for task dependencies
    };
    tasks.unshift(newTask);
    saveTasks();
    if (currentFilter === 'completed' || (currentFilter.startsWith('project_') && projectId !== parseInt(currentFilter.split('_')[1]))) {
        setFilter('inbox');
    } else {
        refreshTaskView();
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
    const priority = modalPriorityInputViewEdit.value;
    const label = modalLabelInputViewEdit.value.trim();
    const notes = modalNotesInputViewEdit.value.trim();
    let projectId = 0;
    const originalTaskForProject = tasks.find(t => t.id === taskId);
    if (featureFlags.projectFeature && modalProjectSelectViewEdit) {
        projectId = parseInt(modalProjectSelectViewEdit.value) || 0;
    } else if (originalTaskForProject) {
        projectId = originalTaskForProject.projectId || 0;
    }
    let estHours = 0, estMinutes = 0;
    const originalTask = tasks.find(t => t.id === taskId);
    if (featureFlags.taskTimerSystem && window.AppFeatures?.TaskTimerSystem) {
        const estimates = window.AppFeatures.TaskTimerSystem.getEstimatesFromEditModal();
        estHours = estimates.estHours;
        estMinutes = estimates.estMinutes;
    } else if (originalTask) {
        estHours = originalTask.estimatedHours;
        estMinutes = originalTask.estimatedMinutes;
    }
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
    tasks = tasks.map(task => task.id === taskId ? { ...task, text: taskText, dueDate: dueDate || null, time: time || null, priority: priority, label: label || '', notes: notes || '', projectId: projectId, isReminderSet, reminderDate, reminderTime, reminderEmail, estimatedHours: estHours, estimatedMinutes: estMinutes, attachments: task.attachments || [],
        // Preserve existing dependencies, UI for editing these will be added later
        dependsOn: task.dependsOn || [],
        blocksTasks: task.blocksTasks || []
    } : task);
    saveTasks();
    refreshTaskView();
    closeViewEditModal();
    showMessage('Task updated successfully!', 'success');
    if (featureFlags.taskTimerSystem && window.AppFeatures?.TaskTimerSystem && currentViewTaskId === taskId) {
        const updatedTask = tasks.find(t => t.id === taskId);
        if (updatedTask && window.AppFeatures.TaskTimerSystem.setupTimerForModal) {
             window.AppFeatures.TaskTimerSystem.setupTimerForModal(updatedTask);
        }
    }
}

function toggleComplete(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const taskToToggle = tasks[taskIndex];

    // Check for dependencies if the feature is enabled and we are marking as incomplete
    if (featureFlags.taskDependenciesFeature && !taskToToggle.completed) {
        // If we are trying to mark a task as NOT completed,
        // and it blocks other tasks that are not yet completed, this is usually fine.
        // However, if this task DEPENDS ON other tasks that are NOT completed,
        // it shouldn't have been completable in the first place.
        // For now, we allow toggling, but more complex logic might be needed.
    }

    // Check if completing this task is allowed (if it depends on incomplete tasks)
    if (featureFlags.taskDependenciesFeature && !taskToToggle.completed) { // Trying to complete it
        if (taskToToggle.dependsOn && taskToToggle.dependsOn.length > 0) {
            const incompleteDependencies = taskToToggle.dependsOn.some(depId => {
                const dependentTask = tasks.find(t => t.id === depId);
                return dependentTask && !dependentTask.completed;
            });
            if (incompleteDependencies) {
                const depTaskNames = taskToToggle.dependsOn
                    .map(depId => tasks.find(t => t.id === depId)?.text)
                    .filter(name => name)
                    .join(', ');
                showMessage(`Cannot complete this task. It depends on incomplete task(s): ${depTaskNames}.`, 'error');
                refreshTaskView(); // Re-render to ensure checkbox state is correct
                return; // Prevent completion
            }
        }
    }


    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    tasks[taskIndex].completedDate = tasks[taskIndex].completed ? Date.now() : null;

    if (tasks[taskIndex].completed && featureFlags.kanbanBoardFeature) {
        const doneColumn = kanbanColumns.find(col => col.id === 'done');
        if (doneColumn) tasks[taskIndex].kanbanColumnId = doneColumn.id;
    } else if (!tasks[taskIndex].completed && featureFlags.kanbanBoardFeature && tasks[taskIndex].kanbanColumnId === 'done') {
         const defaultColumn = kanbanColumns[0]?.id || 'todo';
         tasks[taskIndex].kanbanColumnId = defaultColumn;
    }
    if (featureFlags.taskTimerSystem && window.AppFeatures?.TaskTimerSystem) {
        window.AppFeatures.TaskTimerSystem.handleTaskCompletion(taskId, tasks[taskIndex].completed);
    }
    saveTasks();
    refreshTaskView();
    if (featureFlags.taskTimerSystem && window.AppFeatures?.TaskTimerSystem && currentViewTaskId === taskId) {
         const task = tasks.find(t => t.id === taskId);
         if(task && window.AppFeatures.TaskTimerSystem.setupTimerForModal) window.AppFeatures.TaskTimerSystem.setupTimerForModal(task);
    }

    // New: If a task is completed, check tasks that depend on it.
    // This is a simple check; more complex UI updates (e.g., notifications) could be added.
    if (featureFlags.taskDependenciesFeature && tasks[taskIndex].completed) {
        tasks.forEach(potentialDependentTask => {
            if (potentialDependentTask.dependsOn.includes(taskId)) {
                // Check if all dependencies for potentialDependentTask are now met
                const allDependenciesMet = potentialDependentTask.dependsOn.every(depId => {
                    const depTask = tasks.find(t => t.id === depId);
                    return depTask && depTask.completed;
                });
                if (allDependenciesMet) {
                    console.log(`Task "${potentialDependentTask.text}" can now be started as its dependency "${tasks[taskIndex].text}" is complete.`);
                    // Optionally, trigger a notification or UI highlight for potentialDependentTask
                }
            }
        });
    }
}

function deleteTask(taskId) {
    if (featureFlags.taskTimerSystem && window.AppFeatures?.TaskTimerSystem && currentViewTaskId === taskId) {
        window.AppFeatures.TaskTimerSystem.clearTimerOnModalClose();
    }
    tasks = tasks.filter(task => task.id !== taskId);

    // New: Update dependencies if a task is deleted
    if (featureFlags.taskDependenciesFeature) {
        tasks.forEach(task => {
            // Remove the deleted task from 'dependsOn' arrays
            if (task.dependsOn.includes(taskId)) {
                task.dependsOn = task.dependsOn.filter(id => id !== taskId);
            }
            // Remove the deleted task from 'blocksTasks' arrays (less critical as the blocker is gone)
             if (task.blocksTasks.includes(taskId)) {
                task.blocksTasks = task.blocksTasks.filter(id => id !== taskId);
            }
        });
    }

    saveTasks();
    refreshTaskView();
    showMessage('Task deleted.', 'error');
}

function setFilter(filter) {
    setAppCurrentFilter(filter);
    updateSortButtonStates();
    if (smartViewButtons) {
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
    }
    if (featureFlags.projectFeature && window.AppFeatures?.Projects) {
        const projectFilterButtons = document.querySelectorAll('#projectFilterContainer .smart-view-btn');
        projectFilterButtons.forEach(button => {
            const isActive = button.dataset.filter === filter;
            const baseInactiveClasses = ['bg-slate-200', 'text-slate-700', 'hover:bg-slate-300', 'dark:bg-slate-700', 'dark:text-slate-300', 'dark:hover:bg-slate-600'];
            const iconInactiveClasses = ['text-slate-500', 'dark:text-slate-400'];
            const activeClasses = ['bg-purple-500', 'text-white', 'font-semibold', 'dark:bg-purple-600', 'dark:text-purple-50'];
            const iconActiveClasses = ['text-purple-100', 'dark:text-purple-200'];
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
    }
    refreshTaskView();
}

function clearCompletedTasks() {
    const completedCount = tasks.filter(task => task.completed).length;
    if (completedCount === 0) {
        showMessage('No completed tasks to clear.', 'error');
        return;
    }
    const tasksToKeep = tasks.filter(task => !task.completed);
    const clearedTaskIds = tasks.filter(task => task.completed).map(task => task.id);

    tasks = tasksToKeep;

    // New: Update dependencies if completed tasks are cleared
    if (featureFlags.taskDependenciesFeature) {
        tasks.forEach(task => {
            // Remove cleared tasks from 'dependsOn' arrays
            task.dependsOn = task.dependsOn.filter(id => !clearedTaskIds.includes(id));
            // Remove cleared tasks from 'blocksTasks' arrays
            task.blocksTasks = task.blocksTasks.filter(id => !clearedTaskIds.includes(id));
        });
    }

    saveTasks();
    refreshTaskView();
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
    saveTasks(); // This calls updateUniqueLabels
    populateDatalist(existingLabelsDatalist);
    populateDatalist(existingLabelsEditDatalist);
    populateManageLabelsList();
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
    saveTasks(); // This calls updateUniqueLabels
    populateManageLabelsList(); // Re-renders the list in the manage labels modal
    populateDatalist(existingLabelsDatalist); // Update datalists in add/edit modals
    populateDatalist(existingLabelsEditDatalist);
    refreshTaskView(); // Update the main task display
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
    // Assuming addSubTaskLogic is globally available or part of AppFeatures.SubTasks
    if (window.AppFeatures?.SubTasks?.addSubTaskLogic(editingTaskId, subTaskText)) {
        renderSubTasksForEditModal(editingTaskId, modalSubTasksListViewEdit);
        modalSubTaskInputViewEdit.value = '';
        showMessage('Sub-task added.', 'success');
        if (currentViewTaskId === editingTaskId && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) {
            renderSubTasksForViewModal(editingTaskId, modalSubTasksListViewDetails, viewSubTaskProgress, noSubTasksMessageViewDetails);
        }
        refreshTaskView(); // To update main list if subtask count is shown there
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
    // Modal Open/Close Listeners
    if (openAddModalButton) openAddModalButton.addEventListener('click', () => { openAddModal(); if (featureFlags.projectFeature && window.AppFeatures?.Projects) window.AppFeatures.Projects.populateProjectDropdowns(); });
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
    if (editFromViewModalBtn) editFromViewModalBtn.addEventListener('click', () => { if (currentViewTaskId !== null) { closeViewTaskDetailsModal(); openViewEditModal(currentViewTaskId); if (featureFlags.projectFeature && window.AppFeatures?.Projects) { window.AppFeatures.Projects.populateProjectDropdowns(); const task = tasks.find(t => t.id === currentViewTaskId); if (task && modalProjectSelectViewEdit) modalProjectSelectViewEdit.value = task.projectId || "0"; } } });
    if(deleteFromViewModalBtn) deleteFromViewModalBtn.addEventListener('click', () => { if (currentViewTaskId !== null) { deleteTask(currentViewTaskId); closeViewTaskDetailsModal(); } });
    if (viewTaskDetailsModal) viewTaskDetailsModal.addEventListener('click', (event) => { if (event.target === viewTaskDetailsModal) closeViewTaskDetailsModal(); });

    if (closeManageLabelsModalBtn) closeManageLabelsModalBtn.addEventListener('click', closeManageLabelsModal);
    if (closeManageLabelsSecondaryBtn) closeManageLabelsSecondaryBtn.addEventListener('click', closeManageLabelsModal);
    if (addNewLabelForm) addNewLabelForm.addEventListener('submit', handleAddNewLabel);
    if (manageLabelsModal) manageLabelsModal.addEventListener('click', (event) => { if (event.target === manageLabelsModal) closeManageLabelsModal(); });

    if (openSettingsModalButton) openSettingsModalButton.addEventListener('click', openSettingsModal);
    if (closeSettingsModalBtn) closeSettingsModalBtn.addEventListener('click', closeSettingsModal);
    if (closeSettingsSecondaryBtn) closeSettingsSecondaryBtn.addEventListener('click', closeSettingsModal);
    if (settingsModal) settingsModal.addEventListener('click', (event) => { if (event.target === settingsModal) closeSettingsModal(); });

    // Settings Modal Buttons
    if (settingsClearCompletedBtn) settingsClearCompletedBtn.addEventListener('click', clearCompletedTasks);
    if (settingsManageLabelsBtn) settingsManageLabelsBtn.addEventListener('click', () => { closeSettingsModal(); openManageLabelsModal(); });
    const settingsManageProjectsBtn = document.getElementById('settingsManageProjectsBtn');
    if (settingsManageProjectsBtn) settingsManageProjectsBtn.addEventListener('click', () => { if (featureFlags.projectFeature && window.AppFeatures?.Projects) { closeSettingsModal(); window.AppFeatures.Projects.openManageProjectsModal(); } else { showMessage('Enable Project Feature in Feature Flags.', 'error'); } });
    if (settingsManageRemindersBtn) { settingsManageRemindersBtn.addEventListener('click', () => { if(featureFlags.reminderFeature) { showMessage('Manage Reminders - Coming soon!', 'info'); } else { showMessage('Enable Reminder System in Feature Flags.', 'error'); }});}
    if (settingsTaskReviewBtn) { settingsTaskReviewBtn.addEventListener('click', () => { closeSettingsModal(); openTaskReviewModal(); });}
    if (settingsTooltipsGuideBtn) { settingsTooltipsGuideBtn.addEventListener('click', () => {closeSettingsModal(); openTooltipsGuideModal(); }); }
    const nonFunctionalFeatureMessageHandler = (featureName) => { showMessage(`${featureName} feature is not yet implemented. Coming soon!`, 'info'); };
    if (settingsIntegrationsBtn) settingsIntegrationsBtn.addEventListener('click', () => nonFunctionalFeatureMessageHandler('Integrations'));
    if (settingsUserAccountsBtn) settingsUserAccountsBtn.addEventListener('click', () => nonFunctionalFeatureMessageHandler('User Accounts'));
    if (settingsCollaborationBtn) settingsCollaborationBtn.addEventListener('click', () => nonFunctionalFeatureMessageHandler('Collaboration'));
    if (settingsSyncBackupBtn) settingsSyncBackupBtn.addEventListener('click', () => nonFunctionalFeatureMessageHandler('Sync & Backup'));

    // Task Review Modal
    if (closeTaskReviewModalBtn) closeTaskReviewModalBtn.addEventListener('click', closeTaskReviewModal);
    if (closeTaskReviewSecondaryBtn) closeTaskReviewSecondaryBtn.addEventListener('click', closeTaskReviewModal);
    if (taskReviewModal) taskReviewModal.addEventListener('click', (event) => { if (event.target === taskReviewModal) closeTaskReviewModal(); });

    // Tooltips Guide Modal
    if (closeTooltipsGuideModalBtn) closeTooltipsGuideModalBtn.addEventListener('click', closeTooltipsGuideModal);
    if (closeTooltipsGuideSecondaryBtn) closeTooltipsGuideSecondaryBtn.addEventListener('click', closeTooltipsGuideModal);
    if (tooltipsGuideModal) tooltipsGuideModal.addEventListener('click', (event) => { if (event.target === tooltipsGuideModal) closeTooltipsGuideModal(); });

    // Feature Flags Modal
    const featureFlagsModalElement = document.getElementById('featureFlagsModal');
    const closeFeatureFlagsModalBtn = document.getElementById('closeFeatureFlagsModalBtn');
    const closeFeatureFlagsSecondaryBtn = document.getElementById('closeFeatureFlagsSecondaryBtn');
    if (closeFeatureFlagsModalBtn) closeFeatureFlagsModalBtn.addEventListener('click', () => { document.getElementById('modalDialogFeatureFlags').classList.add('scale-95', 'opacity-0'); setTimeout(() => { if (featureFlagsModalElement) featureFlagsModalElement.classList.add('hidden'); }, 200); });
    if (closeFeatureFlagsSecondaryBtn) closeFeatureFlagsSecondaryBtn.addEventListener('click', () => { document.getElementById('modalDialogFeatureFlags').classList.add('scale-95', 'opacity-0'); setTimeout(() => { if (featureFlagsModalElement) featureFlagsModalElement.classList.add('hidden'); }, 200); });
    if (featureFlagsModalElement) featureFlagsModalElement.addEventListener('click', (event) => { if (event.target === featureFlagsModalElement) { document.getElementById('modalDialogFeatureFlags').classList.add('scale-95', 'opacity-0'); setTimeout(() => featureFlagsModalElement.classList.add('hidden'), 200); } });

    // Reminder Toggles in Modals
    if (modalRemindMeAdd) modalRemindMeAdd.addEventListener('change', () => { if(featureFlags.reminderFeature && reminderOptionsAdd) { reminderOptionsAdd.classList.toggle('hidden', !modalRemindMeAdd.checked); if (modalRemindMeAdd.checked) { if (modalDueDateInputAdd.value && !modalReminderDateAdd.value) modalReminderDateAdd.value = modalDueDateInputAdd.value; if (modalTimeInputAdd.value && !modalReminderTimeAdd.value) modalReminderTimeAdd.value = modalTimeInputAdd.value; const today = new Date().toISOString().split('T')[0]; modalReminderDateAdd.min = today; } } else if (reminderOptionsAdd) reminderOptionsAdd.classList.add('hidden'); });
    if (modalRemindMeViewEdit) modalRemindMeViewEdit.addEventListener('change', () => { if(featureFlags.reminderFeature && reminderOptionsViewEdit) { reminderOptionsViewEdit.classList.toggle('hidden', !modalRemindMeViewEdit.checked); if (modalRemindMeViewEdit.checked) { const today = new Date().toISOString().split('T')[0]; modalReminderDateViewEdit.min = today; } } else if (reminderOptionsViewEdit) reminderOptionsViewEdit.classList.add('hidden'); });

    // Smart View & Project Filters
    if (smartViewButtonsContainer) smartViewButtonsContainer.addEventListener('click', (event) => { const button = event.target.closest('.smart-view-btn'); if (button && button.dataset.filter && !button.dataset.filter.startsWith('project_')) setFilter(button.dataset.filter); });
    const projectFilterContainer = document.getElementById('projectFilterContainer');
    if (projectFilterContainer) projectFilterContainer.addEventListener('click', (event) => { const button = event.target.closest('.smart-view-btn'); if (button && button.dataset.filter && button.dataset.filter.startsWith('project_')) setFilter(button.dataset.filter); });

    // Search, Sidebar, Sort
    if (taskSearchInput) taskSearchInput.addEventListener('input', (event) => { setAppSearchTerm(event.target.value.trim().toLowerCase()); refreshTaskView(); });
    if (sidebarToggleBtn) sidebarToggleBtn.addEventListener('click', () => { const isCurrentlyMinimized = taskSidebar.classList.contains('sidebar-minimized'); setSidebarMinimized(!isCurrentlyMinimized); });
    if (sidebarIconOnlyButtons) sidebarIconOnlyButtons.forEach(button => { button.addEventListener('mouseenter', (event) => { if (!taskSidebar || !taskSidebar.classList.contains('sidebar-minimized')) return; clearTimeout(tooltipTimeout); tooltipTimeout = setTimeout(() => { const tooltipText = button.title || button.querySelector('.sidebar-text-content')?.textContent.trim(); if (tooltipText) showTooltip(event.currentTarget, tooltipText); }, 500); }); button.addEventListener('mouseleave', () => { hideTooltip(); }); });
    if (sortByDueDateBtn) sortByDueDateBtn.addEventListener('click', () => { setAppCurrentSort(currentSort === 'dueDate' ? 'default' : 'dueDate'); updateSortButtonStates(); refreshTaskView(); });
    if (sortByPriorityBtn) sortByPriorityBtn.addEventListener('click', () => { setAppCurrentSort(currentSort === 'priority' ? 'default' : 'priority'); updateSortButtonStates(); refreshTaskView(); });
    if (sortByLabelBtn) sortByLabelBtn.addEventListener('click', () => { setAppCurrentSort(currentSort === 'label' ? 'default' : 'label'); updateSortButtonStates(); refreshTaskView(); });

    // Sub-task Add Buttons
    if (modalAddSubTaskBtnViewEdit) modalAddSubTaskBtnViewEdit.addEventListener('click', handleAddSubTaskViewEdit);
    if (modalSubTaskInputViewEdit) modalSubTaskInputViewEdit.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); handleAddSubTaskViewEdit(); } });
    if (modalAddSubTaskBtnAdd) modalAddSubTaskBtnAdd.addEventListener('click', handleAddTempSubTaskForAddModal);
    if (modalSubTaskInputAdd) modalSubTaskInputAdd.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); handleAddTempSubTaskForAddModal(); } });

    // View Toggle Buttons (Kanban, Calendar)
    if (kanbanViewToggleBtn) kanbanViewToggleBtn.addEventListener('click', () => { if (!featureFlags.kanbanBoardFeature) return; if (currentTaskViewMode === 'list') setTaskViewMode('kanban'); else setTaskViewMode('list'); refreshTaskView(); });
    const calendarViewToggleBtn = document.getElementById('calendarViewToggleBtn');
    if (calendarViewToggleBtn) {
        calendarViewToggleBtn.addEventListener('click', () => {
            if (!featureFlags.calendarViewFeature) return;
            if (currentTaskViewMode !== 'calendar') {
                setTaskViewMode('calendar');
            } else {
                setTaskViewMode('list');
            }
            refreshTaskView();
        });
    }


    // Keyboard Shortcuts
    document.addEventListener('keydown', (event) => {
        const isAddModalOpen = addTaskModal && !addTaskModal.classList.contains('hidden');
        const isViewEditModalOpen = viewEditTaskModal && !viewEditTaskModal.classList.contains('hidden');
        const isViewDetailsModalOpen = viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden');
        const isManageLabelsModalOpen = manageLabelsModal && !manageLabelsModal.classList.contains('hidden');
        const isSettingsModalOpen = settingsModal && !settingsModal.classList.contains('hidden');
        const isTaskReviewModalOpen = taskReviewModal && !taskReviewModal.classList.contains('hidden');
        const isTooltipsGuideModalOpen = tooltipsGuideModal && !tooltipsGuideModal.classList.contains('hidden');
        const currentFeatureFlagsModalElement = document.getElementById('featureFlagsModal');
        const isFeatureFlagsModalOpen = currentFeatureFlagsModalElement && !currentFeatureFlagsModalElement.classList.contains('hidden');
        const manageProjectsModalElement = document.getElementById('manageProjectsModal');
        const isManageProjectsModalOpen = manageProjectsModalElement && !manageProjectsModalElement.classList.contains('hidden');
        const isAnyModalOpen = isAddModalOpen || isViewEditModalOpen || isViewDetailsModalOpen || isManageLabelsModalOpen || isSettingsModalOpen || isTaskReviewModalOpen || isTooltipsGuideModalOpen || isFeatureFlagsModalOpen || isManageProjectsModalOpen;
        const isInputFocused = document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT' || document.activeElement.tagName === 'TEXTAREA';
        const isSubTaskInputFocused = document.activeElement === modalSubTaskInputViewEdit || document.activeElement === modalSubTaskInputAdd;
        if ((event.key === '+' || event.key === '=') && !isAnyModalOpen && !isInputFocused && !isSubTaskInputFocused) { event.preventDefault(); openAddModal(); if (featureFlags.projectFeature && window.AppFeatures?.Projects) window.AppFeatures.Projects.populateProjectDropdowns(); }
        if (event.key === 'Escape') { if (isAddModalOpen) closeAddModal(); else if (isViewEditModalOpen) closeViewEditModal(); else if (isViewDetailsModalOpen) closeViewTaskDetailsModal(); else if (isManageLabelsModalOpen) closeManageLabelsModal(); else if (isManageProjectsModalOpen && window.AppFeatures?.Projects) { const currentCloseProjectsModalBtn = document.getElementById('closeManageProjectsModalBtn'); if(currentCloseProjectsModalBtn) currentCloseProjectsModalBtn.click(); } else if (isSettingsModalOpen) closeSettingsModal(); else if (isTaskReviewModalOpen) closeTaskReviewModal(); else if (isTooltipsGuideModalOpen) closeTooltipsGuideModal(); else if (isFeatureFlagsModalOpen) { const currentCloseFeatureFlagsModalBtn = document.getElementById('closeFeatureFlagsModalBtn'); if(currentCloseFeatureFlagsModalBtn) currentCloseFeatureFlagsModalBtn.click(); } }
    });
}

// --- Global Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOMContentLoaded event fired in ui_event_handlers.js");

    if (typeof initializeDOMElements === 'function') initializeDOMElements(); else console.error("initializeDOMElements function is not defined! Check script load order and ui_rendering.js.");

    await loadFeatureFlags(); 
    initializeTasks();    
    updateUniqueLabels(); 
    loadKanbanColumns();  
    if (typeof loadProjects === 'function') loadProjects(); else console.error("loadProjects function is not defined in app_logic.js!");

    populateDatalist(existingLabelsDatalist);    
    populateDatalist(existingLabelsEditDatalist); 

    if (window.AppFeatures) {
        if (window.AppFeatures.initializeTestButtonFeature) window.AppFeatures.initializeTestButtonFeature();
        if (window.AppFeatures.TaskTimerSystem?.initialize) window.AppFeatures.TaskTimerSystem.initialize();
        if (window.AppFeatures.initializeReminderFeature) window.AppFeatures.initializeReminderFeature();
        if (window.AppFeatures.KanbanBoard?.initialize) window.AppFeatures.KanbanBoard.initialize();
        if (window.AppFeatures.Projects?.initialize) { console.log("[OnInit] Initializing Project Feature Module..."); window.AppFeatures.Projects.initialize(); }
        if (window.AppFeatures.DataManagement?.initialize) { console.log("[OnInit] Initializing Data Management Feature Module..."); window.AppFeatures.DataManagement.initialize(); }
        // New: Initialize Task Dependencies Feature (placeholder for now)
        // if (window.AppFeatures.TaskDependencies?.initialize) {
        //     console.log("[OnInit] Initializing Task Dependencies Feature Module...");
        //     window.AppFeatures.TaskDependencies.initialize();
        // }
    }

    applyActiveFeatures(); 

    if (typeof styleInitialSmartViewButtons === 'function') styleInitialSmartViewButtons(); else console.warn("styleInitialSmartViewButtons function not found in ui_rendering.js");

    const savedSidebarState = localStorage.getItem('sidebarState');
    if (savedSidebarState === 'minimized') setSidebarMinimized(true); else setSidebarMinimized(false);

    if (featureFlags.projectFeature && window.AppFeatures?.Projects?.populateProjectFilterList) window.AppFeatures.Projects.populateProjectFilterList();
    if (featureFlags.projectFeature && window.AppFeatures?.Projects?.populateProjectDropdowns) window.AppFeatures.Projects.populateProjectDropdowns();

    if (typeof setFilter === 'function') setFilter(currentFilter); else { console.error("setFilter function is not defined when called!"); refreshTaskView(); }

    updateSortButtonStates();
    updateClearCompletedButtonState();

    setupEventListeners(); 
    console.log("Todo App Initialized (after DOMContentLoaded).");
});
