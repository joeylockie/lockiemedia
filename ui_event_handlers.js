// ui_event_handlers.js

// This file handles event listeners, user interaction handlers (forms, buttons),
// applying feature flags to UI, and the main application initialization sequence.
// It depends on:
// - DOM elements from ui_rendering.js (initialized via initializeDOMElements).
// - Rendering functions from ui_rendering.js.
// - Modal interaction functions from modal_interactions.js.
// - State variables from store.js (tasks, projects, etc., currently global).
// - Services: ViewManager, FeatureFlagService, BulkActionService.
// - Core task logic functions (addTask, editTask, etc., currently global, will move to taskService).
// - Feature-specific modules (window.AppFeatures...).

// --- Temporary State for UI Interactions (scoped to this file) ---
let tempSubTasksForAddModal = []; // For collecting sub-tasks in the Add Task modal

/**
 * Populates the Feature Flags modal with toggles for each feature.
 * Uses FeatureFlagService to get and set flags.
 */
function populateFeatureFlagsModal() {
    const currentFFListContainer = featureFlagsListContainer || document.getElementById('featureFlagsListContainer');
    if (!currentFFListContainer || typeof FeatureFlagService === 'undefined') {
        console.warn("Feature flags list container or FeatureFlagService not found for populateFeatureFlagsModal.");
        return;
    }
    currentFFListContainer.innerHTML = '';

    const currentFlags = FeatureFlagService.getAllFeatureFlags(); // Get flags from the service

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
        taskDependenciesFeature: "Task Dependencies (Soon)",
        smarterSearchFeature: "Smarter Search (Soon)",
        bulkActionsFeature: "Bulk Task Actions",
        pomodoroTimerHybridFeature: "Pomodoro Timer Hybrid"
    };
    const featureOrder = Object.keys(currentFlags); // Use keys from the service's flags

    featureOrder.forEach(key => {
        if (currentFlags.hasOwnProperty(key)) {
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
            checkbox.checked = currentFlags[key]; // Use current value from service
            checkbox.addEventListener('change', () => {
                FeatureFlagService.setFeatureFlag(key, checkbox.checked); // Set flag via service
                // applyActiveFeatures will be called by setFeatureFlag if needed, or we can call it explicitly
                applyActiveFeatures();

                // Specific view adjustments if a feature affecting the current view is disabled
                const currentView = ViewManager.getCurrentTaskViewMode();
                if (key === 'kanbanBoardFeature' && !FeatureFlagService.isFeatureEnabled(key) && currentView === 'kanban') {
                    ViewManager.setTaskViewMode('list');
                }
                if (key === 'calendarViewFeature' && !FeatureFlagService.isFeatureEnabled(key) && currentView === 'calendar') {
                    ViewManager.setTaskViewMode('list');
                }
                if (key === 'pomodoroTimerHybridFeature' && !FeatureFlagService.isFeatureEnabled(key) && currentView === 'pomodoro') {
                    ViewManager.setTaskViewMode('list');
                     if (window.AppFeatures?.PomodoroTimerHybrid?.stop) {
                        window.AppFeatures.PomodoroTimerHybrid.stop();
                    }
                }
                if (key === 'projectFeature' && !FeatureFlagService.isFeatureEnabled(key) && ViewManager.getCurrentFilter().startsWith('project_')) {
                    ViewManager.setCurrentFilter('inbox'); // Use ViewManager
                }
                if (key === 'bulkActionsFeature' && !FeatureFlagService.isFeatureEnabled(key)) {
                    if (typeof BulkActionService !== 'undefined' && BulkActionService.clearSelections) {
                        BulkActionService.clearSelections();
                    }
                    const bulkActionControls = document.getElementById('bulkActionControlsContainer');
                    if (bulkActionControls) bulkActionControls.classList.add('hidden');
                }
                refreshTaskView();
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
 * Updates UI visibility based on featureFlags from FeatureFlagService.
 */
function applyActiveFeatures() {
    if (typeof FeatureFlagService === 'undefined') {
        console.error("[ApplyFeatures] FeatureFlagService not available.");
        return;
    }
    console.log('[ApplyFeatures] Starting applyActiveFeatures. Pomodoro Flag:', FeatureFlagService.isFeatureEnabled('pomodoroTimerHybridFeature'));
    const toggleElements = (selector, isEnabled) => {
        document.querySelectorAll(selector).forEach(el => el.classList.toggle('hidden', !isEnabled));
    };

    // Use FeatureFlagService.isFeatureEnabled() for all checks
    if (window.AppFeatures?.updateTestButtonUIVisibility) window.AppFeatures.updateTestButtonUIVisibility(FeatureFlagService.isFeatureEnabled('testButtonFeature')); else if (testFeatureButtonContainer) testFeatureButtonContainer.classList.toggle('hidden', !FeatureFlagService.isFeatureEnabled('testButtonFeature'));
    if (window.AppFeatures?.TaskTimerSystem?.updateUIVisibility) window.AppFeatures.TaskTimerSystem.updateUIVisibility(FeatureFlagService.isFeatureEnabled('taskTimerSystem')); else { toggleElements('.task-timer-system-element', FeatureFlagService.isFeatureEnabled('taskTimerSystem')); if (settingsTaskReviewBtn) settingsTaskReviewBtn.classList.toggle('hidden', !FeatureFlagService.isFeatureEnabled('taskTimerSystem')); }
    if (window.AppFeatures?.updateReminderUIVisibility) window.AppFeatures.updateReminderUIVisibility(FeatureFlagService.isFeatureEnabled('reminderFeature')); else toggleElements('.reminder-feature-element', FeatureFlagService.isFeatureEnabled('reminderFeature'));
    toggleElements('.advanced-recurrence-element', FeatureFlagService.isFeatureEnabled('advancedRecurrence'));
    toggleElements('.file-attachments-element', FeatureFlagService.isFeatureEnabled('fileAttachments'));
    toggleElements('.integrations-services-element', FeatureFlagService.isFeatureEnabled('integrationsServices'));
    toggleElements('.user-accounts-element', FeatureFlagService.isFeatureEnabled('userAccounts'));
    toggleElements('.collaboration-sharing-element', FeatureFlagService.isFeatureEnabled('collaborationSharing'));
    toggleElements('.cross-device-sync-element', FeatureFlagService.isFeatureEnabled('crossDeviceSync'));
    toggleElements('.tooltips-guide-element', FeatureFlagService.isFeatureEnabled('tooltipsGuide'));
    toggleElements('.sub-tasks-feature-element', FeatureFlagService.isFeatureEnabled('subTasksFeature'));
    if (settingsTooltipsGuideBtn) settingsTooltipsGuideBtn.classList.toggle('hidden', !FeatureFlagService.isFeatureEnabled('tooltipsGuide'));

    if (kanbanViewToggleBtn) kanbanViewToggleBtn.classList.toggle('hidden', !FeatureFlagService.isFeatureEnabled('kanbanBoardFeature'));
    if (window.AppFeatures?.KanbanBoard?.updateUIVisibility) window.AppFeatures.KanbanBoard.updateUIVisibility(FeatureFlagService.isFeatureEnabled('kanbanBoardFeature'));
    // View mode adjustment is handled in populateFeatureFlagsModal and refreshTaskView

    if (window.AppFeatures?.Projects?.updateUIVisibility) window.AppFeatures.Projects.updateUIVisibility(FeatureFlagService.isFeatureEnabled('projectFeature')); else toggleElements('.project-feature-element', FeatureFlagService.isFeatureEnabled('projectFeature'));
    // Filter adjustment is handled in populateFeatureFlagsModal

    if (window.AppFeatures?.DataManagement?.updateUIVisibility) {
        window.AppFeatures.DataManagement.updateUIVisibility(FeatureFlagService.isFeatureEnabled('exportDataFeature'));
    } else {
        toggleElements('.export-data-feature-element', FeatureFlagService.isFeatureEnabled('exportDataFeature'));
    }

    const calendarViewToggleBtnLocal = document.getElementById('calendarViewToggleBtn');
    if (calendarViewToggleBtnLocal) calendarViewToggleBtnLocal.classList.toggle('hidden', !FeatureFlagService.isFeatureEnabled('calendarViewFeature'));
    toggleElements('.calendar-view-feature-element', FeatureFlagService.isFeatureEnabled('calendarViewFeature'));

    toggleElements('.task-dependencies-feature-element', FeatureFlagService.isFeatureEnabled('taskDependenciesFeature'));
    toggleElements('.smarter-search-feature-element', FeatureFlagService.isFeatureEnabled('smarterSearchFeature'));
    toggleElements('.bulk-actions-feature-element', FeatureFlagService.isFeatureEnabled('bulkActionsFeature'));
    if (!FeatureFlagService.isFeatureEnabled('bulkActionsFeature')) {
        if (typeof BulkActionService !== 'undefined' && BulkActionService.clearSelections) {
            BulkActionService.clearSelections();
        }
        const bulkActionControls = document.getElementById('bulkActionControlsContainer');
        if (bulkActionControls) bulkActionControls.classList.add('hidden');
    }

    if (window.AppFeatures?.PomodoroTimerHybrid?.updateUIVisibility) {
        window.AppFeatures.PomodoroTimerHybrid.updateUIVisibility(FeatureFlagService.isFeatureEnabled('pomodoroTimerHybridFeature'));
    } else {
        toggleElements('.pomodoro-timer-hybrid-feature-element', FeatureFlagService.isFeatureEnabled('pomodoroTimerHybridFeature'));
    }

    refreshTaskView();
    if (typeof currentViewTaskId !== 'undefined' && currentViewTaskId && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) openViewTaskDetailsModal(currentViewTaskId);
    const featureFlagsModalElement = document.getElementById('featureFlagsModal');
    if (featureFlagsModalElement && !featureFlagsModalElement.classList.contains('hidden')) populateFeatureFlagsModal();
    console.log('[ApplyFeatures] Finished applyActiveFeatures.');
}


// --- Event Handlers ---
// These handlers (handleAddTask, handleEditTask, etc.) will still call global functions
// like addTask, editTask, deleteTask, toggleComplete for now. These global functions
// currently manipulate state in store.js. Later, these handlers will call methods
// on a dedicated taskService.

function handleAddTask(event) {
    event.preventDefault();
    // Assumes featureFlags is available (from store.js, populated by FeatureFlagService)
    // Assumes tasks, projects are available (from store.js)
    // Assumes saveTasks, showMessage, closeAddModal, parseDateFromText (taskService), formatTime (utils) are global
    // Assumes modal elements are global

    const rawTaskText = modalTaskInputAdd.value.trim();
    const explicitDueDate = modalDueDateInputAdd.value;
    const time = modalTimeInputAdd.value;
    const priority = modalPriorityInputAdd.value;
    const label = modalLabelInputAdd.value.trim();
    const notes = modalNotesInputAdd.value.trim();
    let projectId = 0;
    if (FeatureFlagService.isFeatureEnabled('projectFeature') && modalProjectSelectAdd) {
        projectId = parseInt(modalProjectSelectAdd.value) || 0;
    }
    let estHours = 0, estMinutes = 0;
    if (FeatureFlagService.isFeatureEnabled('taskTimerSystem') && window.AppFeatures?.TaskTimerSystem) {
        const estimates = window.AppFeatures.TaskTimerSystem.getEstimatesFromAddModal();
        estHours = estimates.estHours;
        estMinutes = estimates.estMinutes;
    }
    let isReminderSet = false, reminderDate = null, reminderTime = null, reminderEmail = null;
    if (FeatureFlagService.isFeatureEnabled('reminderFeature') && modalRemindMeAdd) {
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

    // Use parseDateFromText from taskService (globally available for now)
    if (!explicitDueDate && typeof parseDateFromText === 'function') {
        const { parsedDate: dateFromDesc, remainingText: textAfterDate } = parseDateFromText(rawTaskText);
        if (dateFromDesc) {
            finalDueDate = dateFromDesc;
            finalTaskText = textAfterDate.trim() || rawTaskText; // Use remaining text or original if empty
        }
    }

    const subTasksToSave = FeatureFlagService.isFeatureEnabled('subTasksFeature') ? tempSubTasksForAddModal.map(st => ({ id: Date.now() + Math.random(), text: st.text, completed: st.completed, creationDate: Date.now() })) : [];
    const defaultKanbanColumn = (typeof kanbanColumns !== 'undefined' && kanbanColumns[0]?.id) || 'todo';

    const newTask = {
        id: Date.now(), text: finalTaskText, completed: false, creationDate: Date.now(), dueDate: finalDueDate || null, time: time || null, priority: priority, label: label || '', notes: notes || '', projectId: projectId, isReminderSet, reminderDate, reminderTime, reminderEmail, estimatedHours: estHours, estimatedMinutes: estMinutes, timerStartTime: null, timerAccumulatedTime: 0, timerIsRunning: false, timerIsPaused: false, actualDurationMs: 0, attachments: [], completedDate: null, subTasks: subTasksToSave, recurrenceRule: null, recurrenceEndDate: null, nextDueDate: finalDueDate || null, kanbanColumnId: defaultKanbanColumn,
        dependsOn: [],
        blocksTasks: []
    };
    tasks.unshift(newTask); // Directly modifies global tasks from store.js
    saveTasks(); // Global from store.js

    // Use ViewManager for filter state
    if (ViewManager.getCurrentFilter() === 'completed' || (ViewManager.getCurrentFilter().startsWith('project_') && projectId !== parseInt(ViewManager.getCurrentFilter().split('_')[1]))) {
        ViewManager.setCurrentFilter('inbox');
    } else {
        refreshTaskView();
    }
    closeAddModal();
    showMessage('Task added successfully!', 'success');
    tempSubTasksForAddModal = []; // Reset temp state
}

function handleEditTask(event) {
    event.preventDefault();
    // Similar assumptions as handleAddTask regarding global availability of state/functions
    // and FeatureFlagService

    const taskId = parseInt(modalViewEditTaskId.value);
    const taskText = modalTaskInputViewEdit.value.trim();
    const dueDate = modalDueDateInputViewEdit.value;
    const time = modalTimeInputViewEdit.value;
    const priority = modalPriorityInputViewEdit.value;
    const label = modalLabelInputViewEdit.value.trim();
    const notes = modalNotesInputViewEdit.value.trim();
    let projectId = 0;
    const originalTaskForProject = tasks.find(t => t.id === taskId); // tasks from store.js
    if (FeatureFlagService.isFeatureEnabled('projectFeature') && modalProjectSelectViewEdit) {
        projectId = parseInt(modalProjectSelectViewEdit.value) || 0;
    } else if (originalTaskForProject) {
        projectId = originalTaskForProject.projectId || 0;
    }
    let estHours = 0, estMinutes = 0;
    const originalTask = tasks.find(t => t.id === taskId);
    if (FeatureFlagService.isFeatureEnabled('taskTimerSystem') && window.AppFeatures?.TaskTimerSystem) {
        const estimates = window.AppFeatures.TaskTimerSystem.getEstimatesFromEditModal();
        estHours = estimates.estHours;
        estMinutes = estimates.estMinutes;
    } else if (originalTask) {
        estHours = originalTask.estimatedHours;
        estMinutes = originalTask.estimatedMinutes;
    }
    let isReminderSet = false, reminderDate = null, reminderTime = null, reminderEmail = null;
    if (FeatureFlagService.isFeatureEnabled('reminderFeature') && modalRemindMeViewEdit) {
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
    // tasks from store.js, saveTasks from store.js
    tasks = tasks.map(task => task.id === taskId ? { ...task, text: taskText, dueDate: dueDate || null, time: time || null, priority: priority, label: label || '', notes: notes || '', projectId: projectId, isReminderSet, reminderDate, reminderTime, reminderEmail, estimatedHours: estHours, estimatedMinutes: estMinutes, attachments: task.attachments || [], dependsOn: task.dependsOn || [], blocksTasks: task.blocksTasks || [] } : task);
    saveTasks();
    refreshTaskView();
    closeViewEditModal();
    showMessage('Task updated successfully!', 'success');

    // currentViewTaskId from store.js
    if (FeatureFlagService.isFeatureEnabled('taskTimerSystem') && window.AppFeatures?.TaskTimerSystem && currentViewTaskId === taskId) {
        const updatedTask = tasks.find(t => t.id === taskId);
        if (updatedTask && window.AppFeatures.TaskTimerSystem.setupTimerForModal) {
             window.AppFeatures.TaskTimerSystem.setupTimerForModal(updatedTask);
        }
    }
}

function toggleComplete(taskId) {
    // tasks, saveTasks from store.js
    // FeatureFlagService for feature checks
    // showMessage, refreshTaskView are global
    // currentViewTaskId from store.js
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const taskToToggle = tasks[taskIndex];

    if (FeatureFlagService.isFeatureEnabled('taskDependenciesFeature') && !taskToToggle.completed) {
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
                refreshTaskView();
                return;
            }
        }
    }

    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    tasks[taskIndex].completedDate = tasks[taskIndex].completed ? Date.now() : null;

    if (tasks[taskIndex].completed && FeatureFlagService.isFeatureEnabled('kanbanBoardFeature')) {
        const doneColumn = (typeof kanbanColumns !== 'undefined') ? kanbanColumns.find(col => col.id === 'done') : null; // kanbanColumns from store.js
        if (doneColumn) tasks[taskIndex].kanbanColumnId = doneColumn.id;
    } else if (!tasks[taskIndex].completed && FeatureFlagService.isFeatureEnabled('kanbanBoardFeature') && tasks[taskIndex].kanbanColumnId === 'done') {
         const defaultColumn = (typeof kanbanColumns !== 'undefined' && kanbanColumns[0]?.id) || 'todo';
         tasks[taskIndex].kanbanColumnId = defaultColumn;
    }
    if (FeatureFlagService.isFeatureEnabled('taskTimerSystem') && window.AppFeatures?.TaskTimerSystem) {
        window.AppFeatures.TaskTimerSystem.handleTaskCompletion(taskId, tasks[taskIndex].completed);
    }
    saveTasks();
    refreshTaskView();
    if (FeatureFlagService.isFeatureEnabled('taskTimerSystem') && window.AppFeatures?.TaskTimerSystem && currentViewTaskId === taskId) {
         const task = tasks.find(t => t.id === taskId);
         if(task && window.AppFeatures.TaskTimerSystem.setupTimerForModal) window.AppFeatures.TaskTimerSystem.setupTimerForModal(task);
    }

    if (FeatureFlagService.isFeatureEnabled('taskDependenciesFeature') && tasks[taskIndex].completed) {
        tasks.forEach(potentialDependentTask => {
            if (potentialDependentTask.dependsOn && potentialDependentTask.dependsOn.includes(taskId)) {
                const allDependenciesMet = potentialDependentTask.dependsOn.every(depId => {
                    const depTask = tasks.find(t => t.id === depId);
                    return depTask && depTask.completed;
                });
                if (allDependenciesMet) {
                    console.log(`Task "${potentialDependentTask.text}" can now be started as its dependency "${tasks[taskIndex].text}" is complete.`);
                    // Potentially add a visual cue or notification here
                }
            }
        });
    }
}

function deleteTask(taskId) {
    // tasks, saveTasks from store.js
    // FeatureFlagService for feature checks
    // showMessage, refreshTaskView are global
    // currentViewTaskId from store.js
    if (FeatureFlagService.isFeatureEnabled('taskTimerSystem') && window.AppFeatures?.TaskTimerSystem && currentViewTaskId === taskId) {
        window.AppFeatures.TaskTimerSystem.clearTimerOnModalClose();
    }
    tasks = tasks.filter(task => task.id !== taskId);

    if (FeatureFlagService.isFeatureEnabled('taskDependenciesFeature')) {
        tasks.forEach(task => {
            if (task.dependsOn && task.dependsOn.includes(taskId)) {
                task.dependsOn = task.dependsOn.filter(id => id !== taskId);
            }
             if (task.blocksTasks && task.blocksTasks.includes(taskId)) {
                task.blocksTasks = task.blocksTasks.filter(id => id !== taskId);
            }
        });
    }

    saveTasks();
    refreshTaskView();
    showMessage('Task deleted.', 'error');
}

/**
 * Sets the current filter and updates UI.
 * Uses ViewManager to set the filter state.
 * @param {string} filter - The filter to apply.
 */
function setFilter(filter) {
    if (typeof ViewManager === 'undefined' || typeof ViewManager.setCurrentFilter !== 'function') {
        console.error("[SetFilter] ViewManager or ViewManager.setCurrentFilter is not available.");
        // Fallback to old global modification if ViewManager not ready (should not happen with correct script order)
        if (typeof currentFilter !== 'undefined' && typeof currentSort !== 'undefined') {
            currentFilter = filter;
            currentSort = 'default';
        }
        return;
    }

    ViewManager.setCurrentFilter(filter); // Use ViewManager
    updateSortButtonStates(); // Assumes this is global from ui_rendering.js

    // Update smart view button active states
    if (smartViewButtons) { // smartViewButtons from ui_rendering.js (global)
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
    // Update project filter button active states (if project feature is on)
    if (FeatureFlagService.isFeatureEnabled('projectFeature') && window.AppFeatures?.Projects) {
        const projectFilterButtons = document.querySelectorAll('#projectFilterContainer .smart-view-btn');
        projectFilterButtons.forEach(button => {
            const isActive = button.dataset.filter === filter;
            const baseInactiveClasses = ['bg-slate-200', 'text-slate-700', 'hover:bg-slate-300', 'dark:bg-slate-700', 'dark:text-slate-300', 'dark:hover:bg-slate-600'];
            const iconInactiveClasses = ['text-slate-500', 'dark:text-slate-400'];
            // Use purple for active project filters
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
    refreshTaskView(); // Assumes this is global from ui_rendering.js
}


function clearCompletedTasks() {
    // tasks, saveTasks from store.js
    // FeatureFlagService for feature checks
    // showMessage, refreshTaskView, closeSettingsModal are global
    const completedCount = tasks.filter(task => task.completed).length;
    if (completedCount === 0) {
        showMessage('No completed tasks to clear.', 'error');
        return;
    }
    const tasksToKeep = tasks.filter(task => !task.completed);
    const clearedTaskIds = tasks.filter(task => task.completed).map(task => task.id);

    tasks = tasksToKeep; // Directly modifies global tasks from store.js

    if (FeatureFlagService.isFeatureEnabled('taskDependenciesFeature')) {
        tasks.forEach(task => {
            task.dependsOn = task.dependsOn ? task.dependsOn.filter(id => !clearedTaskIds.includes(id)) : [];
            task.blocksTasks = task.blocksTasks ? task.blocksTasks.filter(id => !clearedTaskIds.includes(id)) : [];
        });
    }

    saveTasks();
    refreshTaskView();
    showMessage(`${completedCount} completed task${completedCount > 1 ? 's' : ''} cleared.`, 'success');
    closeSettingsModal();
}

function handleAddNewLabel(event) {
    event.preventDefault();
    // newLabelInput from ui_rendering.js (global)
    // uniqueLabels, saveTasks from store.js
    // showMessage, populateDatalist, populateManageLabelsList are global
    const labelName = newLabelInput.value.trim();
    if (labelName === '') {
        showMessage('Label name cannot be empty.', 'error');
        return;
    }
    if (uniqueLabels.some(l => l.toLowerCase() === labelName.toLowerCase())) {
        showMessage(`Label "${labelName}" already exists.`, 'error');
        return;
    }
    uniqueLabels.push(labelName); // Directly modifies global uniqueLabels from store.js
    uniqueLabels.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    // Note: saveTasks() also calls updateUniqueLabels() in store.js, which re-populates uniqueLabels
    // So, technically, modifying uniqueLabels here and then calling saveTasks which also modifies it is redundant.
    // Better: A dedicated addLabel function in a labelService or store.js that handles both.
    // For now, this will work due to the sequence.
    saveTasks(); // This will call updateUniqueLabels in store.js
    populateDatalist(existingLabelsDatalist); // existingLabelsDatalist from ui_rendering.js
    populateDatalist(existingLabelsEditDatalist); // existingLabelsEditDatalist from ui_rendering.js
    populateManageLabelsList(); // from modal_interactions.js
    newLabelInput.value = '';
    showMessage(`Label "${labelName}" added.`, 'success');
}

function handleDeleteLabel(labelToDelete) {
    // tasks, saveTasks from store.js
    // showMessage, populateDatalist, populateManageLabelsList, refreshTaskView are global
    tasks = tasks.map(task => { // Directly modifies global tasks from store.js
        if (task.label && task.label.toLowerCase() === labelToDelete.toLowerCase()) {
            return { ...task, label: '' };
        }
        return task;
    });
    saveTasks(); // This will call updateUniqueLabels in store.js
    populateManageLabelsList(); // from modal_interactions.js
    populateDatalist(existingLabelsDatalist); // existingLabelsDatalist from ui_rendering.js
    populateDatalist(existingLabelsEditDatalist); // existingLabelsEditDatalist from ui_rendering.js
    refreshTaskView();
    showMessage(`Label "${labelToDelete}" deleted. Tasks using it have been unlabelled.`, 'success');
}

function handleAddSubTaskViewEdit() {
    // FeatureFlagService for feature checks
    // editingTaskId, currentViewTaskId from store.js
    // modalSubTaskInputViewEdit, modalSubTasksListViewEdit, viewTaskDetailsModal, modalSubTasksListViewDetails, viewSubTaskProgress, noSubTasksMessageViewDetails from ui_rendering.js
    // showMessage, refreshTaskView are global
    if (!FeatureFlagService.isFeatureEnabled('subTasksFeature') || !editingTaskId || !modalSubTaskInputViewEdit) return;
    const subTaskText = modalSubTaskInputViewEdit.value.trim();
    if (subTaskText === '') {
        showMessage('Sub-task description cannot be empty.', 'error');
        modalSubTaskInputViewEdit.focus();
        return;
    }
    if (window.AppFeatures?.SubTasks?.add(editingTaskId, subTaskText)) { // Call sub-task service
        renderSubTasksForEditModal(editingTaskId, modalSubTasksListViewEdit); // from ui_rendering.js
        modalSubTaskInputViewEdit.value = '';
        showMessage('Sub-task added.', 'success');
        if (currentViewTaskId === editingTaskId && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) {
            renderSubTasksForViewModal(editingTaskId, modalSubTasksListViewDetails, viewSubTaskProgress, noSubTasksMessageViewDetails); // from ui_rendering.js
        }
        refreshTaskView();
    } else {
        showMessage('Failed to add sub-task.', 'error');
    }
}

function handleAddTempSubTaskForAddModal() {
    // FeatureFlagService for feature checks
    // modalSubTaskInputAdd from ui_rendering.js
    // tempSubTasksForAddModal is local to this file
    // showMessage, renderTempSubTasksForAddModal are global
    if (!FeatureFlagService.isFeatureEnabled('subTasksFeature') || !modalSubTaskInputAdd) return;
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
function setupEventListeners() {
    // Assumes all DOM elements are globally available from ui_rendering.js (via initializeDOMElements)
    // Assumes modal interaction functions (open/close) are global from modal_interactions.js
    // Assumes FeatureFlagService and ViewManager are global

    // Modal Open/Close Listeners
    if (openAddModalButton) openAddModalButton.addEventListener('click', () => { openAddModal(); if (FeatureFlagService.isFeatureEnabled('projectFeature') && window.AppFeatures?.Projects) window.AppFeatures.Projects.populateProjectDropdowns(); });
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
    if (editFromViewModalBtn) editFromViewModalBtn.addEventListener('click', () => { if (currentViewTaskId !== null) { closeViewTaskDetailsModal(); openViewEditModal(currentViewTaskId); if (FeatureFlagService.isFeatureEnabled('projectFeature') && window.AppFeatures?.Projects) { window.AppFeatures.Projects.populateProjectDropdowns(); const task = tasks.find(t => t.id === currentViewTaskId); if (task && modalProjectSelectViewEdit) modalProjectSelectViewEdit.value = task.projectId || "0"; } } });
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
    const settingsManageProjectsBtnLocal = document.getElementById('settingsManageProjectsBtn');
    if (settingsManageProjectsBtnLocal) settingsManageProjectsBtnLocal.addEventListener('click', () => { if (FeatureFlagService.isFeatureEnabled('projectFeature') && window.AppFeatures?.Projects) { closeSettingsModal(); window.AppFeatures.Projects.openManageProjectsModal(); } else { showMessage('Enable Project Feature in Feature Flags.', 'error'); } });
    if (settingsManageRemindersBtn) { settingsManageRemindersBtn.addEventListener('click', () => { if(FeatureFlagService.isFeatureEnabled('reminderFeature')) { showMessage('Manage Reminders - Coming soon!', 'info'); } else { showMessage('Enable Reminder System in Feature Flags.', 'error'); }});}
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
    if (modalRemindMeAdd) modalRemindMeAdd.addEventListener('change', () => { if(FeatureFlagService.isFeatureEnabled('reminderFeature') && reminderOptionsAdd) { reminderOptionsAdd.classList.toggle('hidden', !modalRemindMeAdd.checked); if (modalRemindMeAdd.checked) { if (modalDueDateInputAdd.value && !modalReminderDateAdd.value) modalReminderDateAdd.value = modalDueDateInputAdd.value; if (modalTimeInputAdd.value && !modalReminderTimeAdd.value) modalReminderTimeAdd.value = modalTimeInputAdd.value; const today = new Date().toISOString().split('T')[0]; modalReminderDateAdd.min = today; } } else if (reminderOptionsAdd) reminderOptionsAdd.classList.add('hidden'); });
    if (modalRemindMeViewEdit) modalRemindMeViewEdit.addEventListener('change', () => { if(FeatureFlagService.isFeatureEnabled('reminderFeature') && reminderOptionsViewEdit) { reminderOptionsViewEdit.classList.toggle('hidden', !modalRemindMeViewEdit.checked); if (modalRemindMeViewEdit.checked) { const today = new Date().toISOString().split('T')[0]; modalReminderDateViewEdit.min = today; } } else if (reminderOptionsViewEdit) reminderOptionsViewEdit.classList.add('hidden'); });

    // Smart View & Project Filters
    if (smartViewButtonsContainer) smartViewButtonsContainer.addEventListener('click', (event) => { const button = event.target.closest('.smart-view-btn'); if (button && button.dataset.filter && !button.dataset.filter.startsWith('project_')) setFilter(button.dataset.filter); });
    const projectFilterContainerLocal = document.getElementById('projectFilterContainer');
    if (projectFilterContainerLocal) projectFilterContainerLocal.addEventListener('click', (event) => { const button = event.target.closest('.smart-view-btn'); if (button && button.dataset.filter && button.dataset.filter.startsWith('project_')) setFilter(button.dataset.filter); });

    // Search, Sidebar, Sort
    if (taskSearchInput) taskSearchInput.addEventListener('input', (event) => { ViewManager.setCurrentSearchTerm(event.target.value.trim()); refreshTaskView(); });
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', () => {
            const isCurrentlyMinimized = taskSidebar.classList.contains('sidebar-minimized');
            setSidebarMinimized(!isCurrentlyMinimized); // from ui_rendering.js
            if (FeatureFlagService.isFeatureEnabled('pomodoroTimerHybridFeature') && window.AppFeatures?.PomodoroTimerHybrid?.updateSidebarDisplay) {
                window.AppFeatures.PomodoroTimerHybrid.updateSidebarDisplay();
            }
        });
    }
    if (sidebarIconOnlyButtons) sidebarIconOnlyButtons.forEach(button => { button.addEventListener('mouseenter', (event) => { if (!taskSidebar || !taskSidebar.classList.contains('sidebar-minimized')) return; clearTimeout(tooltipTimeout); tooltipTimeout = setTimeout(() => { const tooltipText = button.title || button.querySelector('.sidebar-text-content')?.textContent.trim(); if (tooltipText) showTooltip(event.currentTarget, tooltipText); }, 500); }); button.addEventListener('mouseleave', () => { hideTooltip(); }); }); // tooltipTimeout from store.js, showTooltip/hideTooltip from ui_rendering.js

    // Sort buttons now use ViewManager to set sort state
    if (sortByDueDateBtn) sortByDueDateBtn.addEventListener('click', () => { ViewManager.setCurrentSort(ViewManager.getCurrentSort() === 'dueDate' ? 'default' : 'dueDate'); updateSortButtonStates(); refreshTaskView(); });
    if (sortByPriorityBtn) sortByPriorityBtn.addEventListener('click', () => { ViewManager.setCurrentSort(ViewManager.getCurrentSort() === 'priority' ? 'default' : 'priority'); updateSortButtonStates(); refreshTaskView(); });
    if (sortByLabelBtn) sortByLabelBtn.addEventListener('click', () => { ViewManager.setCurrentSort(ViewManager.getCurrentSort() === 'label' ? 'default' : 'label'); updateSortButtonStates(); refreshTaskView(); });

    // Sub-task Add Buttons
    if (modalAddSubTaskBtnViewEdit) modalAddSubTaskBtnViewEdit.addEventListener('click', handleAddSubTaskViewEdit);
    if (modalSubTaskInputViewEdit) modalSubTaskInputViewEdit.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); handleAddSubTaskViewEdit(); } });
    if (modalAddSubTaskBtnAdd) modalAddSubTaskBtnAdd.addEventListener('click', handleAddTempSubTaskForAddModal);
    if (modalSubTaskInputAdd) modalSubTaskInputAdd.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); handleAddTempSubTaskForAddModal(); } });

    // View Toggle Buttons (Kanban, Calendar, Pomodoro) - Use ViewManager to set mode
    if (kanbanViewToggleBtn) kanbanViewToggleBtn.addEventListener('click', () => { if (!FeatureFlagService.isFeatureEnabled('kanbanBoardFeature')) return; ViewManager.setTaskViewMode(ViewManager.getCurrentTaskViewMode() === 'kanban' ? 'list' : 'kanban'); refreshTaskView(); if (window.AppFeatures?.PomodoroTimerHybrid?.handleViewChange) window.AppFeatures.PomodoroTimerHybrid.handleViewChange(ViewManager.getCurrentTaskViewMode()); });
    const calendarViewToggleBtnLocal = document.getElementById('calendarViewToggleBtn');
    if (calendarViewToggleBtnLocal) { calendarViewToggleBtnLocal.addEventListener('click', () => { if (!FeatureFlagService.isFeatureEnabled('calendarViewFeature')) return; ViewManager.setTaskViewMode(ViewManager.getCurrentTaskViewMode() === 'calendar' ? 'list' : 'calendar'); refreshTaskView(); if (window.AppFeatures?.PomodoroTimerHybrid?.handleViewChange) window.AppFeatures.PomodoroTimerHybrid.handleViewChange(ViewManager.getCurrentTaskViewMode()); }); }
    if (pomodoroViewToggleBtn) { pomodoroViewToggleBtn.addEventListener('click', () => { if (!FeatureFlagService.isFeatureEnabled('pomodoroTimerHybridFeature')) { showMessage('Pomodoro Timer feature is disabled.', 'error'); return; } ViewManager.setTaskViewMode(ViewManager.getCurrentTaskViewMode() === 'pomodoro' ? 'list' : 'pomodoro'); refreshTaskView(); if (window.AppFeatures?.PomodoroTimerHybrid?.handleViewChange) { window.AppFeatures.PomodoroTimerHybrid.handleViewChange(ViewManager.getCurrentTaskViewMode()); } }); }


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
        if ((event.key === '+' || event.key === '=') && !isAnyModalOpen && !isInputFocused && !isSubTaskInputFocused) { event.preventDefault(); openAddModal(); if (FeatureFlagService.isFeatureEnabled('projectFeature') && window.AppFeatures?.Projects) window.AppFeatures.Projects.populateProjectDropdowns(); }
        if (event.key === 'Escape') { if (isAddModalOpen) closeAddModal(); else if (isViewEditModalOpen) closeViewEditModal(); else if (isViewDetailsModalOpen) closeViewTaskDetailsModal(); else if (isManageLabelsModalOpen) closeManageLabelsModal(); else if (isManageProjectsModalOpen && window.AppFeatures?.Projects) { const currentCloseProjectsModalBtn = document.getElementById('closeManageProjectsModalBtn'); if(currentCloseProjectsModalBtn) currentCloseProjectsModalBtn.click(); } else if (isSettingsModalOpen) closeSettingsModal(); else if (isTaskReviewModalOpen) closeTaskReviewModal(); else if (isTooltipsGuideModalOpen) closeTooltipsGuideModal(); else if (isFeatureFlagsModalOpen) { const currentCloseFeatureFlagsModalBtn = document.getElementById('closeFeatureFlagsModalBtn'); if(currentCloseFeatureFlagsModalBtn) currentCloseFeatureFlagsModalBtn.click(); } }
    });
    console.log("[Event Handlers] All event listeners set up.");
}

// --- Global Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOMContentLoaded event fired in ui_event_handlers.js");

    // Initialize DOM elements first
    if (typeof initializeDOMElements === 'function') initializeDOMElements(); else console.error("initializeDOMElements function is not defined! Check script load order and ui_rendering.js.");

    // FeatureFlagService and store.js handle their own async loading internally when their scripts are parsed.
    // We need to ensure they have completed before proceeding with logic that depends on them.
    // A simple way for now is to wait a brief moment, or ideally, have them provide a promise or callback.
    // For now, we'll assume they are ready due to script order and their internal IIFEs.
    // A more robust solution would involve an explicit initialization sequence manager.

    // Initialize feature modules that might have their own setup
    // This relies on FeatureFlagService being ready.
    if (typeof FeatureFlagService !== 'undefined' && typeof window.AppFeatures !== 'undefined') {
        if (FeatureFlagService.isFeatureEnabled('testButtonFeature') && window.AppFeatures.initializeTestButtonFeature) window.AppFeatures.initializeTestButtonFeature();
        if (FeatureFlagService.isFeatureEnabled('taskTimerSystem') && window.AppFeatures.TaskTimerSystem?.initialize) window.AppFeatures.TaskTimerSystem.initialize();
        if (FeatureFlagService.isFeatureEnabled('reminderFeature') && window.AppFeatures.initializeReminderFeature) window.AppFeatures.initializeReminderFeature();
        if (FeatureFlagService.isFeatureEnabled('kanbanBoardFeature') && window.AppFeatures.KanbanBoard?.initialize) window.AppFeatures.KanbanBoard.initialize();
        if (FeatureFlagService.isFeatureEnabled('projectFeature') && window.AppFeatures.Projects?.initialize) { console.log("[OnInit] Initializing Project Feature Module..."); window.AppFeatures.Projects.initialize(); }
        if (FeatureFlagService.isFeatureEnabled('exportDataFeature') && window.AppFeatures.DataManagement?.initialize) { console.log("[OnInit] Initializing Data Management Feature Module..."); window.AppFeatures.DataManagement.initialize(); }
        if (FeatureFlagService.isFeatureEnabled('pomodoroTimerHybridFeature') && window.AppFeatures.PomodoroTimerHybrid?.initialize) { console.log("[OnInit] Initializing Pomodoro Timer Hybrid Feature Module..."); window.AppFeatures.PomodoroTimerHybrid.initialize(); }
        // Initialize other feature modules similarly
    } else {
        console.warn("[OnInit] FeatureFlagService or AppFeatures not fully available for feature module initialization.");
    }


    // Apply active features to the UI (this also calls refreshTaskView)
    applyActiveFeatures();

    // Style initial smart view buttons based on current filter from ViewManager
    if (typeof styleInitialSmartViewButtons === 'function') styleInitialSmartViewButtons(); else console.warn("styleInitialSmartViewButtons function not found in ui_rendering.js");

    // Set initial sidebar state
    const savedSidebarState = localStorage.getItem('sidebarState');
    if (typeof setSidebarMinimized === 'function') { // from ui_rendering.js
        if (savedSidebarState === 'minimized') setSidebarMinimized(true); else setSidebarMinimized(false);
    }


    // Populate project filters and dropdowns if feature is enabled
    if (FeatureFlagService.isFeatureEnabled('projectFeature') && window.AppFeatures?.Projects) {
        if(window.AppFeatures.Projects.populateProjectFilterList) window.AppFeatures.Projects.populateProjectFilterList();
        if(window.AppFeatures.Projects.populateProjectDropdowns) window.AppFeatures.Projects.populateProjectDropdowns();
    }

    // Set initial filter and render (refreshTaskView is called by applyActiveFeatures already)
    // If setFilter was not called by applyActiveFeatures (e.g. no feature changes), call it here.
    // However, applyActiveFeatures -> refreshTaskView -> renderXYZView should handle initial render.
    // We might ensure the filter is applied once if not done by applyActiveFeatures.
    if (typeof ViewManager !== 'undefined' && typeof setFilter === 'function') {
        setFilter(ViewManager.getCurrentFilter()); // Ensure active filter UI is set
    } else {
        console.warn("[OnInit] ViewManager or setFilter not available for initial filter application.");
        if(typeof refreshTaskView === 'function') refreshTaskView(); // Fallback to just refresh
    }


    updateSortButtonStates(); // from ui_rendering.js
    updateClearCompletedButtonState(); // from ui_rendering.js

    // Setup all other event listeners
    setupEventListeners();
    console.log("Todo App Initialized (after DOMContentLoaded in ui_event_handlers.js).");
});
