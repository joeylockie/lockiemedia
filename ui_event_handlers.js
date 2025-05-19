// ui_event_handlers.js

// This file handles event listeners (setup via setupEventListeners)
// and user interaction handlers (forms, buttons).
// The main application initialization sequence (DOMContentLoaded) has been moved to main.js.

// Dependencies:
// - DOM elements from ui_rendering.js (initialized via initializeDOMElements).
// - Rendering functions from ui_rendering.js.
// - Modal interaction functions from modal_interactions.js.
// - State variables from store.js (tasks, projects, etc., currently global).
// - Services: ViewManager, FeatureFlagService, BulkActionService.
// - Core task logic functions (addTask, editTask, etc., currently global, will move to taskService).
// - Feature-specific modules (window.AppFeatures...).

let tempSubTasksForAddModal = []; // For collecting sub-tasks in the Add Task modal

/**
 * Populates the Feature Flags modal with toggles for each feature.
 * Uses FeatureFlagService to get and set flags.
 */
function populateFeatureFlagsModal() {
    // ... (function implementation remains the same as in your last version of ui_event_handlers.js)
    // Ensure it uses FeatureFlagService.getAllFeatureFlags() and FeatureFlagService.setFeatureFlag()
    const currentFFListContainer = featureFlagsListContainer || document.getElementById('featureFlagsListContainer');
    if (!currentFFListContainer || typeof FeatureFlagService === 'undefined') {
        console.warn("Feature flags list container or FeatureFlagService not found for populateFeatureFlagsModal.");
        return;
    }
    currentFFListContainer.innerHTML = '';

    const currentFlags = FeatureFlagService.getAllFeatureFlags(); 

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
    const featureOrder = Object.keys(currentFlags); 

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
            checkbox.checked = currentFlags[key]; 
            checkbox.addEventListener('change', () => {
                FeatureFlagService.setFeatureFlag(key, checkbox.checked); 
                // applyActiveFeatures is now called by FeatureFlagService.setFeatureFlag (if it's global)
                // or should be triggered by an event if we implement an event bus.
                // For now, assuming FeatureFlagService.setFeatureFlag handles re-applying.
                // If not, call applyActiveFeatures() here.
                // applyActiveFeatures(); // This is safe to call again

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
                    ViewManager.setCurrentFilter('inbox');
                }
                if (key === 'bulkActionsFeature' && !FeatureFlagService.isFeatureEnabled(key)) {
                    if (typeof BulkActionService !== 'undefined' && BulkActionService.clearSelections) {
                        BulkActionService.clearSelections();
                    }
                    const bulkActionControls = document.getElementById('bulkActionControlsContainer');
                    if (bulkActionControls) bulkActionControls.classList.add('hidden');
                }
                if(typeof refreshTaskView === 'function') refreshTaskView();
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
 * This function is called by main.js during initialization and when flags change.
 */
function applyActiveFeatures() {
    // ... (function implementation remains the same as in your last version of ui_event_handlers.js)
    // Ensure it uses FeatureFlagService.isFeatureEnabled() for all checks.
    if (typeof FeatureFlagService === 'undefined') {
        console.error("[ApplyFeatures] FeatureFlagService not available.");
        return;
    }
    console.log('[ApplyFeatures] Starting applyActiveFeatures. Pomodoro Flag:', FeatureFlagService.isFeatureEnabled('pomodoroTimerHybridFeature'));
    const toggleElements = (selector, isEnabled) => {
        document.querySelectorAll(selector).forEach(el => el.classList.toggle('hidden', !isEnabled));
    };

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

    if (window.AppFeatures?.Projects?.updateUIVisibility) window.AppFeatures.Projects.updateUIVisibility(FeatureFlagService.isFeatureEnabled('projectFeature')); else toggleElements('.project-feature-element', FeatureFlagService.isFeatureEnabled('projectFeature'));

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

    if(typeof refreshTaskView === 'function') refreshTaskView(); // Critical: refresh view after applying flags
    
    // The following checks are for modals that might be open when flags change.
    // If a modal's content depends on a feature now disabled, it should be re-evaluated or closed.
    // This is a complex area; for now, we ensure the main view is refreshed.
    // Detailed modal updates based on flag changes while open might need more specific handling.
    if (typeof currentViewTaskId !== 'undefined' && currentViewTaskId && typeof viewTaskDetailsModal !== 'undefined' && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden') && typeof openViewTaskDetailsModal === 'function') {
        // Re-open to refresh its content based on new flags, or implement a dedicated refresh function for it.
        // openViewTaskDetailsModal(currentViewTaskId); // This might be too disruptive.
        // A better approach would be a specific refresh function for the open modal.
    }
    const featureFlagsModalElement = document.getElementById('featureFlagsModal');
    if (featureFlagsModalElement && !featureFlagsModalElement.classList.contains('hidden') && typeof populateFeatureFlagsModal === 'function') {
        populateFeatureFlagsModal(); // Refresh the feature flags modal itself if it's open
    }
    console.log('[ApplyFeatures] Finished applyActiveFeatures.');
}


// --- Event Handlers ---
// handleAddTask, handleEditTask, toggleComplete, deleteTask, setFilter,
// clearCompletedTasks, handleAddNewLabel, handleDeleteLabel,
// handleAddSubTaskViewEdit, handleAddTempSubTaskForAddModal
// ... (These function implementations remain the same as in your last version of ui_event_handlers.js)
// They should continue to use FeatureFlagService for checks and ViewManager for UI state.

function handleAddTask(event) {
    event.preventDefault();
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
                if(typeof showMessage === 'function') showMessage('Please provide valid reminder details (date, time, and a valid email).', 'error');
                return;
            }
        }
    }
    if (rawTaskText === '') {
        if(typeof showMessage === 'function') showMessage('Task description cannot be empty!', 'error');
        modalTaskInputAdd.focus();
        return;
    }
    let finalDueDate = explicitDueDate;
    let finalTaskText = rawTaskText;

    if (!explicitDueDate && typeof parseDateFromText === 'function') { // parseDateFromText from taskService.js
        const { parsedDate: dateFromDesc, remainingText: textAfterDate } = parseDateFromText(rawTaskText);
        if (dateFromDesc) {
            finalDueDate = dateFromDesc;
            finalTaskText = textAfterDate.trim() || rawTaskText; 
        }
    }

    const subTasksToSave = FeatureFlagService.isFeatureEnabled('subTasksFeature') ? tempSubTasksForAddModal.map(st => ({ id: Date.now() + Math.random(), text: st.text, completed: st.completed, creationDate: Date.now() })) : [];
    const defaultKanbanColumn = (typeof kanbanColumns !== 'undefined' && kanbanColumns[0]?.id) || 'todo'; // kanbanColumns from store.js

    const newTask = {
        id: Date.now(), text: finalTaskText, completed: false, creationDate: Date.now(), dueDate: finalDueDate || null, time: time || null, priority: priority, label: label || '', notes: notes || '', projectId: projectId, isReminderSet, reminderDate, reminderTime, reminderEmail, estimatedHours: estHours, estimatedMinutes: estMinutes, timerStartTime: null, timerAccumulatedTime: 0, timerIsRunning: false, timerIsPaused: false, actualDurationMs: 0, attachments: [], completedDate: null, subTasks: subTasksToSave, recurrenceRule: null, recurrenceEndDate: null, nextDueDate: finalDueDate || null, kanbanColumnId: defaultKanbanColumn,
        dependsOn: [],
        blocksTasks: []
    };
    if(typeof tasks !== 'undefined' && typeof saveTasks === 'function') { // tasks & saveTasks from store.js
        tasks.unshift(newTask); 
        saveTasks(); 
    } else {
        console.error("[HandleAddTask] 'tasks' or 'saveTasks' not available from store.");
        if(typeof showMessage === 'function') showMessage('Error saving task. Store not available.', 'error');
        return;
    }
    

    if (ViewManager.getCurrentFilter() === 'completed' || (ViewManager.getCurrentFilter().startsWith('project_') && projectId !== parseInt(ViewManager.getCurrentFilter().split('_')[1]))) {
        ViewManager.setCurrentFilter('inbox');
    }
    // refreshTaskView is called by setFilter if it's properly set up, or explicitly if needed.
    // For now, setFilter itself calls refreshTaskView.
    if(typeof refreshTaskView === 'function') refreshTaskView();


    if(typeof closeAddModal === 'function') closeAddModal();
    if(typeof showMessage === 'function') showMessage('Task added successfully!', 'success');
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
                if(typeof showMessage === 'function') showMessage('Please provide valid reminder details (date, time, and a valid email).', 'error');
                return;
            }
        }
    }
    if (taskText === '') {
        if(typeof showMessage === 'function') showMessage('Task description cannot be empty!', 'error');
        modalTaskInputViewEdit.focus();
        return;
    }
    
    if(typeof tasks !== 'undefined' && typeof saveTasks === 'function') {
        tasks = tasks.map(task => task.id === taskId ? { ...task, text: taskText, dueDate: dueDate || null, time: time || null, priority: priority, label: label || '', notes: notes || '', projectId: projectId, isReminderSet, reminderDate, reminderTime, reminderEmail, estimatedHours: estHours, estimatedMinutes: estMinutes, attachments: task.attachments || [], dependsOn: task.dependsOn || [], blocksTasks: task.blocksTasks || [] } : task);
        saveTasks();
    } else {
        console.error("[HandleEditTask] 'tasks' or 'saveTasks' not available from store.");
        if(typeof showMessage === 'function') showMessage('Error saving task. Store not available.', 'error');
        return;
    }

    if(typeof refreshTaskView === 'function') refreshTaskView();
    if(typeof closeViewEditModal === 'function') closeViewEditModal();
    if(typeof showMessage === 'function') showMessage('Task updated successfully!', 'success');

    if (FeatureFlagService.isFeatureEnabled('taskTimerSystem') && window.AppFeatures?.TaskTimerSystem && typeof currentViewTaskId !== 'undefined' && currentViewTaskId === taskId) {
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
                if(typeof showMessage === 'function') showMessage(`Cannot complete this task. It depends on incomplete task(s): ${depTaskNames}.`, 'error');
                if(typeof refreshTaskView === 'function') refreshTaskView();
                return;
            }
        }
    }

    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    tasks[taskIndex].completedDate = tasks[taskIndex].completed ? Date.now() : null;

    if (tasks[taskIndex].completed && FeatureFlagService.isFeatureEnabled('kanbanBoardFeature')) {
        const doneColumn = (typeof kanbanColumns !== 'undefined') ? kanbanColumns.find(col => col.id === 'done') : null;
        if (doneColumn) tasks[taskIndex].kanbanColumnId = doneColumn.id;
    } else if (!tasks[taskIndex].completed && FeatureFlagService.isFeatureEnabled('kanbanBoardFeature') && tasks[taskIndex].kanbanColumnId === 'done') {
         const defaultColumn = (typeof kanbanColumns !== 'undefined' && kanbanColumns[0]?.id) || 'todo';
         tasks[taskIndex].kanbanColumnId = defaultColumn;
    }
    if (FeatureFlagService.isFeatureEnabled('taskTimerSystem') && window.AppFeatures?.TaskTimerSystem) {
        window.AppFeatures.TaskTimerSystem.handleTaskCompletion(taskId, tasks[taskIndex].completed);
    }
    if(typeof saveTasks === 'function') saveTasks();
    if(typeof refreshTaskView === 'function') refreshTaskView();
    
    if (FeatureFlagService.isFeatureEnabled('taskTimerSystem') && window.AppFeatures?.TaskTimerSystem && typeof currentViewTaskId !== 'undefined' && currentViewTaskId === taskId) {
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
                }
            }
        });
    }
}

function deleteTask(taskId) {
    if (FeatureFlagService.isFeatureEnabled('taskTimerSystem') && window.AppFeatures?.TaskTimerSystem && typeof currentViewTaskId !== 'undefined' && currentViewTaskId === taskId) {
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

    if(typeof saveTasks === 'function') saveTasks();
    if(typeof refreshTaskView === 'function') refreshTaskView();
    if(typeof showMessage === 'function') showMessage('Task deleted.', 'error');
}

function setFilter(filter) {
    if (typeof ViewManager === 'undefined' || typeof ViewManager.setCurrentFilter !== 'function') {
        console.error("[SetFilter] ViewManager or ViewManager.setCurrentFilter is not available.");
        if (typeof currentFilter !== 'undefined' && typeof currentSort !== 'undefined') { // Fallback to direct global mutation
            currentFilter = filter;
            currentSort = 'default';
        }
    } else {
        ViewManager.setCurrentFilter(filter);
    }

    if(typeof updateSortButtonStates === 'function') updateSortButtonStates(); 

    if (smartViewButtons) { 
        smartViewButtons.forEach(button => {
            const isActive = button.dataset.filter === filter;
            // ... (rest of class toggling logic remains the same)
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
    if (FeatureFlagService.isFeatureEnabled('projectFeature') && window.AppFeatures?.Projects) {
        const projectFilterButtons = document.querySelectorAll('#projectFilterContainer .smart-view-btn');
        projectFilterButtons.forEach(button => {
            const isActive = button.dataset.filter === filter;
             // ... (rest of class toggling logic for project buttons remains the same)
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
    if(typeof refreshTaskView === 'function') refreshTaskView();
}

function clearCompletedTasks() {
    const completedCount = tasks.filter(task => task.completed).length;
    if (completedCount === 0) {
        if(typeof showMessage === 'function') showMessage('No completed tasks to clear.', 'error');
        return;
    }
    const tasksToKeep = tasks.filter(task => !task.completed);
    const clearedTaskIds = tasks.filter(task => task.completed).map(task => task.id);

    tasks = tasksToKeep; 

    if (FeatureFlagService.isFeatureEnabled('taskDependenciesFeature')) {
        tasks.forEach(task => {
            task.dependsOn = task.dependsOn ? task.dependsOn.filter(id => !clearedTaskIds.includes(id)) : [];
            task.blocksTasks = task.blocksTasks ? task.blocksTasks.filter(id => !clearedTaskIds.includes(id)) : [];
        });
    }

    if(typeof saveTasks === 'function') saveTasks();
    if(typeof refreshTaskView === 'function') refreshTaskView();
    if(typeof showMessage === 'function') showMessage(`${completedCount} completed task${completedCount > 1 ? 's' : ''} cleared.`, 'success');
    if(typeof closeSettingsModal === 'function') closeSettingsModal();
}

function handleAddNewLabel(event) {
    event.preventDefault();
    const labelName = newLabelInput.value.trim();
    if (labelName === '') {
        if(typeof showMessage === 'function') showMessage('Label name cannot be empty.', 'error');
        return;
    }
    if (typeof uniqueLabels !== 'undefined' && uniqueLabels.some(l => l.toLowerCase() === labelName.toLowerCase())) {
        if(typeof showMessage === 'function') showMessage(`Label "${labelName}" already exists.`, 'error');
        return;
    }
    if(typeof uniqueLabels !== 'undefined') uniqueLabels.push(labelName); 
    if(typeof uniqueLabels !== 'undefined') uniqueLabels.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    
    if(typeof saveTasks === 'function') saveTasks(); 
    if(typeof populateDatalist === 'function') {
        populateDatalist(existingLabelsDatalist); 
        populateDatalist(existingLabelsEditDatalist);
    }
    if(typeof populateManageLabelsList === 'function') populateManageLabelsList(); 
    newLabelInput.value = '';
    if(typeof showMessage === 'function') showMessage(`Label "${labelName}" added.`, 'success');
}

function handleDeleteLabel(labelToDelete) {
    if(typeof tasks !== 'undefined') {
        tasks = tasks.map(task => { 
            if (task.label && task.label.toLowerCase() === labelToDelete.toLowerCase()) {
                return { ...task, label: '' };
            }
            return task;
        });
    }
    if(typeof saveTasks === 'function') saveTasks(); 
    if(typeof populateManageLabelsList === 'function') populateManageLabelsList(); 
    if(typeof populateDatalist === 'function') {
        populateDatalist(existingLabelsDatalist); 
        populateDatalist(existingLabelsEditDatalist);
    }
    if(typeof refreshTaskView === 'function') refreshTaskView(); 
    if(typeof showMessage === 'function') showMessage(`Label "${labelToDelete}" deleted. Tasks using it have been unlabelled.`, 'success');
}

function handleAddSubTaskViewEdit() {
    if (!FeatureFlagService.isFeatureEnabled('subTasksFeature') || typeof editingTaskId === 'undefined' || !editingTaskId || !modalSubTaskInputViewEdit) return;
    const subTaskText = modalSubTaskInputViewEdit.value.trim();
    if (subTaskText === '') {
        if(typeof showMessage === 'function') showMessage('Sub-task description cannot be empty.', 'error');
        modalSubTaskInputViewEdit.focus();
        return;
    }
    if (window.AppFeatures?.SubTasks?.add(editingTaskId, subTaskText)) { 
        if(typeof renderSubTasksForEditModal === 'function') renderSubTasksForEditModal(editingTaskId, modalSubTasksListViewEdit); 
        modalSubTaskInputViewEdit.value = '';
        if(typeof showMessage === 'function') showMessage('Sub-task added.', 'success');
        if (typeof currentViewTaskId !== 'undefined' && currentViewTaskId === editingTaskId && typeof viewTaskDetailsModal !== 'undefined' && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) {
            if(typeof renderSubTasksForViewModal === 'function') renderSubTasksForViewModal(editingTaskId, modalSubTasksListViewDetails, viewSubTaskProgress, noSubTasksMessageViewDetails); 
        }
        if(typeof refreshTaskView === 'function') refreshTaskView(); 
    } else {
        if(typeof showMessage === 'function') showMessage('Failed to add sub-task.', 'error');
    }
}

function handleAddTempSubTaskForAddModal() {
    if (!FeatureFlagService.isFeatureEnabled('subTasksFeature') || !modalSubTaskInputAdd) return;
    const subTaskText = modalSubTaskInputAdd.value.trim();
    if (subTaskText === '') {
        if(typeof showMessage === 'function') showMessage('Sub-task description cannot be empty.', 'error');
        modalSubTaskInputAdd.focus();
        return;
    }
    tempSubTasksForAddModal.push({ text: subTaskText, completed: false });
    if(typeof renderTempSubTasksForAddModal === 'function') renderTempSubTasksForAddModal(); 
    modalSubTaskInputAdd.value = '';
}


// --- Event Listeners Setup (called by main.js) ---
function setupEventListeners() {
    // ... (event listener setup code remains the same as in your last version)
    // Ensure it uses FeatureFlagService and ViewManager where appropriate for conditional logic or state changes.
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

    if (closeTaskReviewModalBtn) closeTaskReviewModalBtn.addEventListener('click', closeTaskReviewModal);
    if (closeTaskReviewSecondaryBtn) closeTaskReviewSecondaryBtn.addEventListener('click', closeTaskReviewModal);
    if (taskReviewModal) taskReviewModal.addEventListener('click', (event) => { if (event.target === taskReviewModal) closeTaskReviewModal(); });

    if (closeTooltipsGuideModalBtn) closeTooltipsGuideModalBtn.addEventListener('click', closeTooltipsGuideModal);
    if (closeTooltipsGuideSecondaryBtn) closeTooltipsGuideSecondaryBtn.addEventListener('click', closeTooltipsGuideModal);
    if (tooltipsGuideModal) tooltipsGuideModal.addEventListener('click', (event) => { if (event.target === tooltipsGuideModal) closeTooltipsGuideModal(); });

    const featureFlagsModalElement = document.getElementById('featureFlagsModal');
    const closeFeatureFlagsModalBtn = document.getElementById('closeFeatureFlagsModalBtn');
    const closeFeatureFlagsSecondaryBtn = document.getElementById('closeFeatureFlagsSecondaryBtn');
    if (closeFeatureFlagsModalBtn) closeFeatureFlagsModalBtn.addEventListener('click', () => { document.getElementById('modalDialogFeatureFlags').classList.add('scale-95', 'opacity-0'); setTimeout(() => { if (featureFlagsModalElement) featureFlagsModalElement.classList.add('hidden'); }, 200); });
    if (closeFeatureFlagsSecondaryBtn) closeFeatureFlagsSecondaryBtn.addEventListener('click', () => { document.getElementById('modalDialogFeatureFlags').classList.add('scale-95', 'opacity-0'); setTimeout(() => { if (featureFlagsModalElement) featureFlagsModalElement.classList.add('hidden'); }, 200); });
    if (featureFlagsModalElement) featureFlagsModalElement.addEventListener('click', (event) => { if (event.target === featureFlagsModalElement) { document.getElementById('modalDialogFeatureFlags').classList.add('scale-95', 'opacity-0'); setTimeout(() => featureFlagsModalElement.classList.add('hidden'), 200); } });

    if (modalRemindMeAdd) modalRemindMeAdd.addEventListener('change', () => { if(FeatureFlagService.isFeatureEnabled('reminderFeature') && reminderOptionsAdd) { reminderOptionsAdd.classList.toggle('hidden', !modalRemindMeAdd.checked); if (modalRemindMeAdd.checked) { if (modalDueDateInputAdd.value && !modalReminderDateAdd.value) modalReminderDateAdd.value = modalDueDateInputAdd.value; if (modalTimeInputAdd.value && !modalReminderTimeAdd.value) modalReminderTimeAdd.value = modalTimeInputAdd.value; const today = new Date().toISOString().split('T')[0]; modalReminderDateAdd.min = today; } } else if (reminderOptionsAdd) reminderOptionsAdd.classList.add('hidden'); });
    if (modalRemindMeViewEdit) modalRemindMeViewEdit.addEventListener('change', () => { if(FeatureFlagService.isFeatureEnabled('reminderFeature') && reminderOptionsViewEdit) { reminderOptionsViewEdit.classList.toggle('hidden', !modalRemindMeViewEdit.checked); if (modalRemindMeViewEdit.checked) { const today = new Date().toISOString().split('T')[0]; modalReminderDateViewEdit.min = today; } } else if (reminderOptionsViewEdit) reminderOptionsViewEdit.classList.add('hidden'); });

    if (smartViewButtonsContainer) smartViewButtonsContainer.addEventListener('click', (event) => { const button = event.target.closest('.smart-view-btn'); if (button && button.dataset.filter && !button.dataset.filter.startsWith('project_')) setFilter(button.dataset.filter); });
    const projectFilterContainerLocal = document.getElementById('projectFilterContainer');
    if (projectFilterContainerLocal) projectFilterContainerLocal.addEventListener('click', (event) => { const button = event.target.closest('.smart-view-btn'); if (button && button.dataset.filter && button.dataset.filter.startsWith('project_')) setFilter(button.dataset.filter); });

    if (taskSearchInput) taskSearchInput.addEventListener('input', (event) => { ViewManager.setCurrentSearchTerm(event.target.value.trim()); refreshTaskView(); });
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', () => {
            const isCurrentlyMinimized = taskSidebar.classList.contains('sidebar-minimized');
            if(typeof setSidebarMinimized === 'function') setSidebarMinimized(!isCurrentlyMinimized); 
            if (FeatureFlagService.isFeatureEnabled('pomodoroTimerHybridFeature') && window.AppFeatures?.PomodoroTimerHybrid?.updateSidebarDisplay) {
                window.AppFeatures.PomodoroTimerHybrid.updateSidebarDisplay();
            }
        });
    }
    if (sidebarIconOnlyButtons) sidebarIconOnlyButtons.forEach(button => { button.addEventListener('mouseenter', (event) => { if (!taskSidebar || !taskSidebar.classList.contains('sidebar-minimized')) return; if(typeof tooltipTimeout !== 'undefined') clearTimeout(tooltipTimeout); tooltipTimeout = setTimeout(() => { const tooltipText = button.title || button.querySelector('.sidebar-text-content')?.textContent.trim(); if (tooltipText && typeof showTooltip === 'function') showTooltip(event.currentTarget, tooltipText); }, 500); }); button.addEventListener('mouseleave', () => { if(typeof hideTooltip === 'function') hideTooltip(); }); }); 

    if (sortByDueDateBtn) sortByDueDateBtn.addEventListener('click', () => { ViewManager.setCurrentSort(ViewManager.getCurrentSort() === 'dueDate' ? 'default' : 'dueDate'); if(typeof updateSortButtonStates === 'function') updateSortButtonStates(); if(typeof refreshTaskView === 'function') refreshTaskView(); });
    if (sortByPriorityBtn) sortByPriorityBtn.addEventListener('click', () => { ViewManager.setCurrentSort(ViewManager.getCurrentSort() === 'priority' ? 'default' : 'priority'); if(typeof updateSortButtonStates === 'function') updateSortButtonStates(); if(typeof refreshTaskView === 'function') refreshTaskView(); });
    if (sortByLabelBtn) sortByLabelBtn.addEventListener('click', () => { ViewManager.setCurrentSort(ViewManager.getCurrentSort() === 'label' ? 'default' : 'label'); if(typeof updateSortButtonStates === 'function') updateSortButtonStates(); if(typeof refreshTaskView === 'function') refreshTaskView(); });

    if (modalAddSubTaskBtnViewEdit) modalAddSubTaskBtnViewEdit.addEventListener('click', handleAddSubTaskViewEdit);
    if (modalSubTaskInputViewEdit) modalSubTaskInputViewEdit.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); handleAddSubTaskViewEdit(); } });
    if (modalAddSubTaskBtnAdd) modalAddSubTaskBtnAdd.addEventListener('click', handleAddTempSubTaskForAddModal);
    if (modalSubTaskInputAdd) modalSubTaskInputAdd.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); handleAddTempSubTaskForAddModal(); } });

    if (kanbanViewToggleBtn) kanbanViewToggleBtn.addEventListener('click', () => { if (!FeatureFlagService.isFeatureEnabled('kanbanBoardFeature')) return; ViewManager.setTaskViewMode(ViewManager.getCurrentTaskViewMode() === 'kanban' ? 'list' : 'kanban'); if(typeof refreshTaskView === 'function') refreshTaskView(); if (window.AppFeatures?.PomodoroTimerHybrid?.handleViewChange) window.AppFeatures.PomodoroTimerHybrid.handleViewChange(ViewManager.getCurrentTaskViewMode()); });
    const calendarViewToggleBtnLocal = document.getElementById('calendarViewToggleBtn');
    if (calendarViewToggleBtnLocal) { calendarViewToggleBtnLocal.addEventListener('click', () => { if (!FeatureFlagService.isFeatureEnabled('calendarViewFeature')) return; ViewManager.setTaskViewMode(ViewManager.getCurrentTaskViewMode() === 'calendar' ? 'list' : 'calendar'); if(typeof refreshTaskView === 'function') refreshTaskView(); if (window.AppFeatures?.PomodoroTimerHybrid?.handleViewChange) window.AppFeatures.PomodoroTimerHybrid.handleViewChange(ViewManager.getCurrentTaskViewMode()); }); }
    if (pomodoroViewToggleBtn) { pomodoroViewToggleBtn.addEventListener('click', () => { if (!FeatureFlagService.isFeatureEnabled('pomodoroTimerHybridFeature')) { if(typeof showMessage === 'function') showMessage('Pomodoro Timer feature is disabled.', 'error'); return; } ViewManager.setTaskViewMode(ViewManager.getCurrentTaskViewMode() === 'pomodoro' ? 'list' : 'pomodoro'); if(typeof refreshTaskView === 'function') refreshTaskView(); if (window.AppFeatures?.PomodoroTimerHybrid?.handleViewChange) { window.AppFeatures.PomodoroTimerHybrid.handleViewChange(ViewManager.getCurrentTaskViewMode()); } }); }

    document.addEventListener('keydown', (event) => {
        // ... (keyboard shortcut logic remains the same)
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
        if ((event.key === '+' || event.key === '=') && !isAnyModalOpen && !isInputFocused && !isSubTaskInputFocused) { event.preventDefault(); if(typeof openAddModal === 'function') openAddModal(); if (FeatureFlagService.isFeatureEnabled('projectFeature') && window.AppFeatures?.Projects) window.AppFeatures.Projects.populateProjectDropdowns(); }
        if (event.key === 'Escape') { if (isAddModalOpen && typeof closeAddModal === 'function') closeAddModal(); else if (isViewEditModalOpen && typeof closeViewEditModal === 'function') closeViewEditModal(); else if (isViewDetailsModalOpen && typeof closeViewTaskDetailsModal === 'function') closeViewTaskDetailsModal(); else if (isManageLabelsModalOpen && typeof closeManageLabelsModal === 'function') closeManageLabelsModal(); else if (isManageProjectsModalOpen && window.AppFeatures?.Projects && typeof window.AppFeatures.Projects.closeManageProjectsModal === 'function') { window.AppFeatures.Projects.closeManageProjectsModal(); } else if (isSettingsModalOpen && typeof closeSettingsModal === 'function') closeSettingsModal(); else if (isTaskReviewModalOpen && typeof closeTaskReviewModal === 'function') closeTaskReviewModal(); else if (isTooltipsGuideModalOpen && typeof closeTooltipsGuideModal === 'function') closeTooltipsGuideModal(); else if (isFeatureFlagsModalOpen) { const currentCloseFeatureFlagsModalBtn = document.getElementById('closeFeatureFlagsModalBtn'); if(currentCloseFeatureFlagsModalBtn) currentCloseFeatureFlagsModalBtn.click(); } }
    });
    console.log("[Event Handlers] All event listeners set up.");
}

// The DOMContentLoaded listener has been moved to main.js
// console.log("ui_event_handlers.js loaded");
