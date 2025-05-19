// ui_event_handlers.js

// This file handles event listeners, user interaction handlers (forms, buttons),
// applying feature flags to UI.
// It now uses TaskService for task data manipulations and ModalStateService for modal-specific task IDs.

// ... (tempSubTasksForAddModal, populateFeatureFlagsModal, applyActiveFeatures, task CRUD handlers using TaskService, setFilter, clearCompletedTasks, label handlers using LabelService - all remain the same as the previous version) ...
let tempSubTasksForAddModal = [];

function populateFeatureFlagsModal() {
    const currentFFListContainer = featureFlagsListContainer || document.getElementById('featureFlagsListContainer');
    if (!currentFFListContainer || typeof FeatureFlagService === 'undefined') {
        console.warn("Feature flags list container or FeatureFlagService not found for populateFeatureFlagsModal.");
        return;
    }
    currentFFListContainer.innerHTML = '';
    const currentFlags = FeatureFlagService.getAllFeatureFlags(); 
    const friendlyNames = { 
        testButtonFeature: "Test Button", reminderFeature: "Task Reminders", taskTimerSystem: "Task Timer & Review", advancedRecurrence: "Advanced Recurrence (Soon)", fileAttachments: "File Attachments (Soon)", integrationsServices: "Integrations (Soon)", userAccounts: "User Accounts (Soon)", collaborationSharing: "Collaboration (Soon)", crossDeviceSync: "Cross-Device Sync (Soon)", tooltipsGuide: "Tooltips & Shortcuts Guide", subTasksFeature: "Sub-tasks", kanbanBoardFeature: "Kanban Board View", projectFeature: "Projects Feature", exportDataFeature: "Export Data Feature", calendarViewFeature: "Calendar View", taskDependenciesFeature: "Task Dependencies (Soon)", smarterSearchFeature: "Smarter Search (Soon)", bulkActionsFeature: "Bulk Task Actions", pomodoroTimerHybridFeature: "Pomodoro Timer Hybrid"
    };
    const featureOrder = Object.keys(currentFlags); 

    featureOrder.forEach(key => {
        if (currentFlags.hasOwnProperty(key)) {
            const flagItem = document.createElement('div'); flagItem.className = 'feature-flag-item';
            const label = document.createElement('span'); label.textContent = friendlyNames[key] || key; label.className = 'feature-flag-label'; flagItem.appendChild(label);
            const toggleContainer = document.createElement('div'); toggleContainer.className = 'relative';
            const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.id = `toggle-${key}`; checkbox.className = 'toggle-checkbox'; checkbox.checked = currentFlags[key]; 
            checkbox.addEventListener('change', () => {
                FeatureFlagService.setFeatureFlag(key, checkbox.checked); 
            });
            const toggleLabel = document.createElement('label'); toggleLabel.htmlFor = `toggle-${key}`; toggleLabel.className = 'toggle-label';
            toggleContainer.appendChild(checkbox); toggleContainer.appendChild(toggleLabel);
            flagItem.appendChild(toggleContainer); currentFFListContainer.appendChild(flagItem);
        }
    });
}

function applyActiveFeatures() {
    if (typeof FeatureFlagService === 'undefined') {
        console.error("[ApplyFeatures] FeatureFlagService not available.");
        return;
    }
    console.log('[ApplyFeatures] Applying active features based on current flags.');
    const toggleElements = (selector, isEnabled) => { document.querySelectorAll(selector).forEach(el => el.classList.toggle('hidden', !isEnabled)); };
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
    if (window.AppFeatures?.DataManagement?.updateUIVisibility) { window.AppFeatures.DataManagement.updateUIVisibility(FeatureFlagService.isFeatureEnabled('exportDataFeature'));} else { toggleElements('.export-data-feature-element', FeatureFlagService.isFeatureEnabled('exportDataFeature'));}
    const calendarViewToggleBtnLocal = document.getElementById('calendarViewToggleBtn');
    if (calendarViewToggleBtnLocal) calendarViewToggleBtnLocal.classList.toggle('hidden', !FeatureFlagService.isFeatureEnabled('calendarViewFeature'));
    toggleElements('.calendar-view-feature-element', FeatureFlagService.isFeatureEnabled('calendarViewFeature'));
    toggleElements('.task-dependencies-feature-element', FeatureFlagService.isFeatureEnabled('taskDependenciesFeature'));
    toggleElements('.smarter-search-feature-element', FeatureFlagService.isFeatureEnabled('smarterSearchFeature'));
    toggleElements('.bulk-actions-feature-element', FeatureFlagService.isFeatureEnabled('bulkActionsFeature'));
    if (!FeatureFlagService.isFeatureEnabled('bulkActionsFeature')) { if (typeof BulkActionService !== 'undefined' && BulkActionService.clearSelections) { BulkActionService.clearSelections(); } const bulkActionControls = document.getElementById('bulkActionControlsContainer'); if (bulkActionControls) bulkActionControls.classList.add('hidden'); }
    if (window.AppFeatures?.PomodoroTimerHybrid?.updateUIVisibility) { window.AppFeatures.PomodoroTimerHybrid.updateUIVisibility(FeatureFlagService.isFeatureEnabled('pomodoroTimerHybridFeature')); } else { toggleElements('.pomodoro-timer-hybrid-feature-element', FeatureFlagService.isFeatureEnabled('pomodoroTimerHybridFeature')); }
    if(typeof refreshTaskView === 'function') refreshTaskView();
    const featureFlagsModalElement = document.getElementById('featureFlagsModal');
    if (featureFlagsModalElement && !featureFlagsModalElement.classList.contains('hidden') && typeof populateFeatureFlagsModal === 'function') {
        populateFeatureFlagsModal();
    }
    console.log('[ApplyFeatures] Finished applying active features.');
}

function handleAddTask(event) {
    event.preventDefault();
    const rawTaskText = modalTaskInputAdd.value.trim();
    if (rawTaskText === '') { if(typeof showMessage === 'function') showMessage('Task description cannot be empty!', 'error'); modalTaskInputAdd.focus(); return; }
    const explicitDueDate = modalDueDateInputAdd.value; const time = modalTimeInputAdd.value; const priority = modalPriorityInputAdd.value; const label = modalLabelInputAdd.value.trim(); const notes = modalNotesInputAdd.value.trim(); let projectId = 0; if (FeatureFlagService.isFeatureEnabled('projectFeature') && modalProjectSelectAdd) { projectId = parseInt(modalProjectSelectAdd.value) || 0;} let estHours = 0, estMinutes = 0; if (FeatureFlagService.isFeatureEnabled('taskTimerSystem') && window.AppFeatures?.TaskTimerSystem?.getEstimatesFromAddModal) { const estimates = window.AppFeatures.TaskTimerSystem.getEstimatesFromAddModal(); estHours = estimates.estHours; estMinutes = estimates.estMinutes;} let isReminderSet = false, reminderDate = null, reminderTime = null, reminderEmail = null; if (FeatureFlagService.isFeatureEnabled('reminderFeature') && modalRemindMeAdd) { isReminderSet = modalRemindMeAdd.checked; if (isReminderSet) { reminderDate = modalReminderDateAdd.value; reminderTime = modalReminderTimeAdd.value; reminderEmail = modalReminderEmailAdd.value.trim(); if (!reminderDate || !reminderTime || !reminderEmail || !/^\S+@\S+\.\S+$/.test(reminderEmail)) { if(typeof showMessage === 'function') showMessage('Please provide valid reminder details.', 'error'); return;}}}
    let finalDueDate = explicitDueDate; let finalTaskText = rawTaskText;
    if (!explicitDueDate && typeof TaskService !== 'undefined' && typeof TaskService.parseDateFromText === 'function') { const { parsedDate: dateFromDesc, remainingText: textAfterDate } = TaskService.parseDateFromText(rawTaskText); if (dateFromDesc) { finalDueDate = dateFromDesc; finalTaskText = textAfterDate.trim() || rawTaskText; }}
    const subTasksToSave = FeatureFlagService.isFeatureEnabled('subTasksFeature') ? tempSubTasksForAddModal.map(st => ({ id: Date.now() + Math.random(), text: st.text, completed: st.completed, creationDate: Date.now() })) : [];
    const taskData = { text: finalTaskText, dueDate: finalDueDate || null, time: time || null, priority: priority, label: label || '', notes: notes || '', projectId: projectId, isReminderSet, reminderDate, reminderTime, reminderEmail, estimatedHours: estHours, estimatedMinutes: estMinutes, subTasks: subTasksToSave };
    if (typeof TaskService !== 'undefined' && typeof TaskService.addTask === 'function') { const newTask = TaskService.addTask(taskData); if (newTask) { const currentFilterVal = ViewManager.getCurrentFilter(); if (currentFilterVal === 'completed' || (currentFilterVal.startsWith('project_') && projectId !== parseInt(currentFilterVal.split('_')[1]))) { ViewManager.setCurrentFilter('inbox'); } if(typeof closeAddModal === 'function') closeAddModal(); if(typeof showMessage === 'function') showMessage('Task added successfully!', 'success'); tempSubTasksForAddModal = []; } else { if(typeof showMessage === 'function') showMessage('Failed to add task.', 'error'); }
    } else { console.error("[HandleAddTask] TaskService.addTask is not available."); if(typeof showMessage === 'function') showMessage('Error adding task. Service not available.', 'error'); }
}

function handleEditTask(event) {
    event.preventDefault();
    const taskId = parseInt(modalViewEditTaskId.value); // This ID is set when modal opens, using ModalStateService.setEditingTaskId()
    const taskUpdateData = { text: modalTaskInputViewEdit.value.trim(), dueDate: modalDueDateInputViewEdit.value || null, time: modalTimeInputViewEdit.value || null, priority: modalPriorityInputViewEdit.value, label: modalLabelInputViewEdit.value.trim() || '', notes: modalNotesInputViewEdit.value.trim() || '' };
    if (taskUpdateData.text === '') { if(typeof showMessage === 'function') showMessage('Task description cannot be empty!', 'error'); modalTaskInputViewEdit.focus(); return; }
    if (FeatureFlagService.isFeatureEnabled('projectFeature') && modalProjectSelectViewEdit) { taskUpdateData.projectId = parseInt(modalProjectSelectViewEdit.value) || 0; }
    if (FeatureFlagService.isFeatureEnabled('taskTimerSystem') && window.AppFeatures?.TaskTimerSystem?.getEstimatesFromEditModal) { const estimates = window.AppFeatures.TaskTimerSystem.getEstimatesFromEditModal(); taskUpdateData.estimatedHours = estimates.estHours; taskUpdateData.estimatedMinutes = estimates.estMinutes; }
    if (FeatureFlagService.isFeatureEnabled('reminderFeature') && modalRemindMeViewEdit) { taskUpdateData.isReminderSet = modalRemindMeViewEdit.checked; if (taskUpdateData.isReminderSet) { taskUpdateData.reminderDate = modalReminderDateViewEdit.value; taskUpdateData.reminderTime = modalReminderTimeViewEdit.value; taskUpdateData.reminderEmail = modalReminderEmailViewEdit.value.trim(); if (!taskUpdateData.reminderDate || !taskUpdateData.reminderTime || !taskUpdateData.reminderEmail || !/^\S+@\S+\.\S+$/.test(taskUpdateData.reminderEmail)) { if(typeof showMessage === 'function') showMessage('Please provide valid reminder details.', 'error'); return; } } else { taskUpdateData.reminderDate = null; taskUpdateData.reminderTime = null; taskUpdateData.reminderEmail = null; } }
    
    if (typeof TaskService !== 'undefined' && typeof TaskService.updateTask === 'function') {
        const updatedTask = TaskService.updateTask(taskId, taskUpdateData);
        if (updatedTask) {
            if(typeof closeViewEditModal === 'function') closeViewEditModal();
            if(typeof showMessage === 'function') showMessage('Task updated successfully!', 'success');
            // Use ModalStateService.getEditingTaskId() which should be same as taskId here
            if (FeatureFlagService.isFeatureEnabled('taskTimerSystem') && window.AppFeatures?.TaskTimerSystem?.setupTimerForModal &&
                typeof ModalStateService !== 'undefined' && ModalStateService.getEditingTaskId() === taskId) { 
                window.AppFeatures.TaskTimerSystem.setupTimerForModal(updatedTask);
            }
        } else { if(typeof showMessage === 'function') showMessage('Failed to update task.', 'error'); }
    } else { console.error("[HandleEditTask] TaskService.updateTask is not available."); if(typeof showMessage === 'function') showMessage('Error updating task. Service not available.', 'error'); }
}

function toggleComplete(taskId) {
    if (typeof TaskService !== 'undefined' && typeof TaskService.toggleTaskComplete === 'function' && typeof ModalStateService !== 'undefined') {
        const result = TaskService.toggleTaskComplete(taskId); 
        if (result && result._blocked) { 
            const taskToToggle = AppStore.getTasks().find(t => t.id === taskId); // AppStore for reading current tasks
            const depTaskNames = taskToToggle.dependsOn.map(depId => AppStore.getTasks().find(t => t.id === depId)?.text).filter(name => name).join(', '); 
            if(typeof showMessage === 'function') showMessage(`Cannot complete task. Depends on: ${depTaskNames}.`, 'error');
        } else if (!result) { 
            if(typeof showMessage === 'function') showMessage('Failed to update task completion status.', 'error'); 
        }
        
        if (FeatureFlagService.isFeatureEnabled('taskTimerSystem') && window.AppFeatures?.TaskTimerSystem?.setupTimerForModal &&
            ModalStateService.getCurrentViewTaskId() === taskId && result && !result._blocked) {
            const task = AppStore.getTasks().find(t => t.id === taskId); // Get updated task from AppStore
            if(task) window.AppFeatures.TaskTimerSystem.setupTimerForModal(task);
        }
    } else { console.error("[ToggleComplete] TaskService or ModalStateService not available."); if(typeof showMessage === 'function') showMessage('Error toggling task. Service not available.', 'error'); }
}

function deleteTask(taskId) {
    if (typeof TaskService !== 'undefined' && typeof TaskService.deleteTaskById === 'function' && typeof ModalStateService !== 'undefined') {
        if (FeatureFlagService.isFeatureEnabled('taskTimerSystem') && window.AppFeatures?.TaskTimerSystem?.clearTimerOnModalClose &&
            ModalStateService.getCurrentViewTaskId() === taskId) {
            window.AppFeatures.TaskTimerSystem.clearTimerOnModalClose();
        }
        if (TaskService.deleteTaskById(taskId)) { 
            if(typeof showMessage === 'function') showMessage('Task deleted.', 'error'); 
        } else { 
            if(typeof showMessage === 'function') showMessage('Failed to delete task.', 'error'); 
        }
    } else { console.error("[DeleteTask] TaskService or ModalStateService not available."); if(typeof showMessage === 'function') showMessage('Error deleting task. Service not available.', 'error'); }
}

function setFilter(filter) { /* ... same as before, uses ViewManager ... */ 
    if (typeof ViewManager === 'undefined' || typeof ViewManager.setCurrentFilter !== 'function') { console.error("[SetFilter] ViewManager or ViewManager.setCurrentFilter is not available."); if (typeof currentFilter !== 'undefined' && typeof currentSort !== 'undefined') { currentFilter = filter; currentSort = 'default'; if(typeof refreshTaskView === 'function') refreshTaskView(); } return; } ViewManager.setCurrentFilter(filter); if(typeof updateSortButtonStates === 'function') updateSortButtonStates(); if (smartViewButtons) { smartViewButtons.forEach(button => { const isActive = button.dataset.filter === filter; const baseInactiveClasses = ['bg-slate-200', 'text-slate-700', 'hover:bg-slate-300', 'dark:bg-slate-700', 'dark:text-slate-300', 'dark:hover:bg-slate-600']; const iconInactiveClasses = ['text-slate-500', 'dark:text-slate-400']; const activeClasses = ['bg-sky-500', 'text-white', 'font-semibold', 'dark:bg-sky-600', 'dark:text-sky-50']; const iconActiveClasses = ['text-sky-100', 'dark:text-sky-200']; button.classList.remove(...baseInactiveClasses, ...activeClasses); button.querySelector('i')?.classList.remove(...iconInactiveClasses, ...iconActiveClasses); if (isActive) { button.classList.add(...activeClasses); button.querySelector('i')?.classList.add(...iconActiveClasses); } else { button.classList.add(...baseInactiveClasses); button.querySelector('i')?.classList.add(...iconInactiveClasses); }}); } if (FeatureFlagService.isFeatureEnabled('projectFeature') && window.AppFeatures?.Projects) { const projectFilterButtons = document.querySelectorAll('#projectFilterContainer .smart-view-btn'); projectFilterButtons.forEach(button => { const isActive = button.dataset.filter === filter; const baseInactiveClasses = ['bg-slate-200', 'text-slate-700', 'hover:bg-slate-300', 'dark:bg-slate-700', 'dark:text-slate-300', 'dark:hover:bg-slate-600']; const iconInactiveClasses = ['text-slate-500', 'dark:text-slate-400']; const activeClasses = ['bg-purple-500', 'text-white', 'font-semibold', 'dark:bg-purple-600', 'dark:text-purple-50']; const iconActiveClasses = ['text-purple-100', 'dark:text-purple-200']; button.classList.remove(...baseInactiveClasses, ...activeClasses); button.querySelector('i')?.classList.remove(...iconInactiveClasses, ...iconActiveClasses); if (isActive) { button.classList.add(...activeClasses); button.querySelector('i')?.classList.add(...iconActiveClasses); } else { button.classList.add(...baseInactiveClasses); button.querySelector('i')?.classList.add(...iconInactiveClasses); } }); }
}
function clearCompletedTasks() { /* ... same as before, uses TaskService.deleteTaskById ... */ 
    if (typeof AppStore === 'undefined' || typeof AppStore.getTasks !== 'function' || typeof TaskService === 'undefined' || typeof TaskService.deleteTaskById !== 'function') { console.error("[ClearCompletedTasks] Core dependencies not available."); if(typeof showMessage === 'function') showMessage('Error clearing tasks. Service not available.', 'error'); return; } const currentTasks = AppStore.getTasks(); const completedTasks = currentTasks.filter(task => task.completed); if (completedTasks.length === 0) { if(typeof showMessage === 'function') showMessage('No completed tasks to clear.', 'info'); return; } let clearedCount = 0; completedTasks.forEach(task => { if (TaskService.deleteTaskById(task.id)) { clearedCount++; } }); if (clearedCount > 0) { if(typeof showMessage === 'function') showMessage(`${clearedCount} completed task${clearedCount > 1 ? 's' : ''} cleared.`, 'success'); } else { if(typeof showMessage === 'function') showMessage('Could not clear completed tasks.', 'error'); } if(typeof closeSettingsModal === 'function') closeSettingsModal();
}
function handleAddNewLabel(event) { /* ... same as before, uses LabelService ... */ 
    event.preventDefault(); if (!newLabelInput || typeof LabelService === 'undefined' || typeof LabelService.addConceptualLabel !== 'function') { console.error("[HandleAddNewLabel] Dependencies not available."); return; } const labelName = newLabelInput.value.trim(); if (LabelService.addConceptualLabel(labelName)) { newLabelInput.value = ''; }
}
function handleDeleteLabel(labelNameToDelete) { /* ... same as before, uses LabelService ... */ 
    if (typeof LabelService === 'undefined' || typeof LabelService.deleteLabelUsageFromTasks !== 'function' || typeof showMessage !== 'function') { console.error("[HandleDeleteLabel] LabelService not available."); return; } if (confirm(`Are you sure you want to delete the label "${labelNameToDelete}" from all tasks? This cannot be undone.`)) { if (LabelService.deleteLabelUsageFromTasks(labelNameToDelete)) { showMessage(`Label "${labelNameToDelete}" removed from all tasks.`, 'success'); } }
}

function handleAddSubTaskViewEdit() {
    // Use ModalStateService.getEditingTaskId()
    const currentEditingTaskId = (typeof ModalStateService !== 'undefined') ? ModalStateService.getEditingTaskId() : null;
    if (!FeatureFlagService.isFeatureEnabled('subTasksFeature') || !currentEditingTaskId || !modalSubTaskInputViewEdit) return;
    const subTaskText = modalSubTaskInputViewEdit.value.trim();
    if (subTaskText === '') {
        if(typeof showMessage === 'function') showMessage('Sub-task description cannot be empty.', 'error');
        modalSubTaskInputViewEdit.focus();
        return;
    }
    if (window.AppFeatures?.SubTasks?.add(currentEditingTaskId, subTaskText)) { 
        if(typeof renderSubTasksForEditModal === 'function') renderSubTasksForEditModal(currentEditingTaskId, modalSubTasksListViewEdit); 
        modalSubTaskInputViewEdit.value = '';
        if(typeof showMessage === 'function') showMessage('Sub-task added.', 'success');
        
        const currentViewingTaskId = ModalStateService.getCurrentViewTaskId();
        if (currentViewingTaskId === currentEditingTaskId && typeof viewTaskDetailsModal !== 'undefined' && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden') && typeof renderSubTasksForViewModal === 'function') {
            renderSubTasksForViewModal(currentEditingTaskId, modalSubTasksListViewDetails, viewSubTaskProgress, noSubTasksMessageViewDetails); 
        }
    } else { if(typeof showMessage === 'function') showMessage('Failed to add sub-task.', 'error'); }
}
function handleAddTempSubTaskForAddModal() { /* ... same as before ... */ 
    if (!FeatureFlagService.isFeatureEnabled('subTasksFeature') || !modalSubTaskInputAdd) return; const subTaskText = modalSubTaskInputAdd.value.trim(); if (subTaskText === '') { if(typeof showMessage === 'function') showMessage('Sub-task description cannot be empty.', 'error'); modalSubTaskInputAdd.focus(); return; } tempSubTasksForAddModal.push({ text: subTaskText, completed: false }); if(typeof renderTempSubTasksForAddModal === 'function') renderTempSubTasksForAddModal(); modalSubTaskInputAdd.value = '';
}

function setupEventListeners() {
    // ... (Most event listeners remain the same)
    // Key changes for editFromViewModalBtn and deleteFromViewModalBtn:
    if (editFromViewModalBtn) {
        editFromViewModalBtn.addEventListener('click', () => {
            const taskIdToEdit = ModalStateService.getCurrentViewTaskId(); // Use ModalStateService
            if (taskIdToEdit !== null) {
                if(typeof closeViewTaskDetailsModal === 'function') closeViewTaskDetailsModal();
                if(typeof openViewEditModal === 'function') openViewEditModal(taskIdToEdit); // openViewEditModal uses ModalStateService.setEditingTaskId
                if (FeatureFlagService.isFeatureEnabled('projectFeature') && window.AppFeatures?.Projects) {
                    window.AppFeatures.Projects.populateProjectDropdowns();
                    const task = AppStore.getTasks().find(t => t.id === taskIdToEdit); // AppStore for reading task data
                    if (task && modalProjectSelectViewEdit) modalProjectSelectViewEdit.value = task.projectId || "0";
                }
            }
        });
    }
    if(deleteFromViewModalBtn) {
        deleteFromViewModalBtn.addEventListener('click', () => {
            const taskIdToDelete = ModalStateService.getCurrentViewTaskId(); // Use ModalStateService
            if (taskIdToDelete !== null) {
                deleteTask(taskIdToDelete); // deleteTask now uses TaskService
                if(typeof closeViewTaskDetailsModal === 'function') closeViewTaskDetailsModal();
            }
        });
    }
    // ... (rest of setupEventListeners, ensuring ViewManager is used for filter/sort/search/view mode changes)
    if (taskSearchInput) taskSearchInput.addEventListener('input', (event) => { ViewManager.setCurrentSearchTerm(event.target.value.trim()); });
    if (sidebarToggleBtn) { sidebarToggleBtn.addEventListener('click', () => { const isCurrentlyMinimized = taskSidebar.classList.contains('sidebar-minimized'); if(typeof setSidebarMinimized === 'function') setSidebarMinimized(!isCurrentlyMinimized); if (FeatureFlagService.isFeatureEnabled('pomodoroTimerHybridFeature') && window.AppFeatures?.PomodoroTimerHybrid?.updateSidebarDisplay) { window.AppFeatures.PomodoroTimerHybrid.updateSidebarDisplay(); } }); }
    if (sidebarIconOnlyButtons) { sidebarIconOnlyButtons.forEach(button => { button.addEventListener('mouseenter', (event) => { if (!taskSidebar || !taskSidebar.classList.contains('sidebar-minimized')) return; if(typeof AppStore !== 'undefined' && AppStore.getTooltipTimeout && AppStore.clearTooltipTimeout) { const currentTimeout = AppStore.getTooltipTimeout(); if(currentTimeout) clearTimeout(currentTimeout); AppStore.clearTooltipTimeout(); AppStore.setTooltipTimeout(setTimeout(() => { const tooltipText = button.title || button.querySelector('.sidebar-text-content')?.textContent.trim(); if (tooltipText && typeof showTooltip === 'function') showTooltip(event.currentTarget, tooltipText); }, 500));} }); button.addEventListener('mouseleave', () => { if(typeof hideTooltip === 'function') hideTooltip(); }); }); }
    if (sortByDueDateBtn) sortByDueDateBtn.addEventListener('click', () => { ViewManager.setCurrentSort(ViewManager.getCurrentSort() === 'dueDate' ? 'default' : 'dueDate'); });
    if (sortByPriorityBtn) sortByPriorityBtn.addEventListener('click', () => { ViewManager.setCurrentSort(ViewManager.getCurrentSort() === 'priority' ? 'default' : 'priority'); });
    if (sortByLabelBtn) sortByLabelBtn.addEventListener('click', () => { ViewManager.setCurrentSort(ViewManager.getCurrentSort() === 'label' ? 'default' : 'label'); });
    if (kanbanViewToggleBtn) kanbanViewToggleBtn.addEventListener('click', () => { if (!FeatureFlagService.isFeatureEnabled('kanbanBoardFeature')) return; ViewManager.setTaskViewMode(ViewManager.getCurrentTaskViewMode() === 'kanban' ? 'list' : 'kanban'); if (window.AppFeatures?.PomodoroTimerHybrid?.handleViewChange) window.AppFeatures.PomodoroTimerHybrid.handleViewChange(ViewManager.getCurrentTaskViewMode()); });
    const calendarViewToggleBtnLocal = document.getElementById('calendarViewToggleBtn'); if (calendarViewToggleBtnLocal) { calendarViewToggleBtnLocal.addEventListener('click', () => { if (!FeatureFlagService.isFeatureEnabled('calendarViewFeature')) return; ViewManager.setTaskViewMode(ViewManager.getCurrentTaskViewMode() === 'calendar' ? 'list' : 'calendar'); if (window.AppFeatures?.PomodoroTimerHybrid?.handleViewChange) window.AppFeatures.PomodoroTimerHybrid.handleViewChange(ViewManager.getCurrentTaskViewMode()); }); }
    if (pomodoroViewToggleBtn) { pomodoroViewToggleBtn.addEventListener('click', () => { if (!FeatureFlagService.isFeatureEnabled('pomodoroTimerHybridFeature')) { if(typeof showMessage === 'function') showMessage('Pomodoro Timer feature is disabled.', 'error'); return; } ViewManager.setTaskViewMode(ViewManager.getCurrentTaskViewMode() === 'pomodoro' ? 'list' : 'pomodoro'); if (window.AppFeatures?.PomodoroTimerHybrid?.handleViewChange) { window.AppFeatures.PomodoroTimerHybrid.handleViewChange(ViewManager.getCurrentTaskViewMode()); } }); }
    if (openAddModalButton) openAddModalButton.addEventListener('click', () => { openAddModal(); if (FeatureFlagService.isFeatureEnabled('projectFeature') && window.AppFeatures?.Projects) window.AppFeatures.Projects.populateProjectDropdowns(); });
    if (closeAddModalBtn) closeAddModalBtn.addEventListener('click', closeAddModal); if (cancelAddModalBtn) cancelAddModalBtn.addEventListener('click', closeAddModal); if (modalTodoFormAdd) modalTodoFormAdd.addEventListener('submit', handleAddTask); if (addTaskModal) addTaskModal.addEventListener('click', (event) => { if (event.target === addTaskModal) closeAddModal(); });
    if (closeViewEditModalBtn) closeViewEditModalBtn.addEventListener('click', closeViewEditModal); if (cancelViewEditModalBtn) cancelViewEditModalBtn.addEventListener('click', closeViewEditModal); if (modalTodoFormViewEdit) modalTodoFormViewEdit.addEventListener('submit', handleEditTask); if (viewEditTaskModal) viewEditTaskModal.addEventListener('click', (event) => { if (event.target === viewEditTaskModal) closeViewEditModal(); });
    if (closeViewDetailsModalBtn) closeViewDetailsModalBtn.addEventListener('click', closeViewTaskDetailsModal); if (closeViewDetailsSecondaryBtn) closeViewDetailsSecondaryBtn.addEventListener('click', closeViewTaskDetailsModal); /* editFromViewModalBtn and deleteFromViewModalBtn handled above */ if (viewTaskDetailsModal) viewTaskDetailsModal.addEventListener('click', (event) => { if (event.target === viewTaskDetailsModal) closeViewTaskDetailsModal(); });
    if (closeManageLabelsModalBtn) closeManageLabelsModalBtn.addEventListener('click', closeManageLabelsModal); if (closeManageLabelsSecondaryBtn) closeManageLabelsSecondaryBtn.addEventListener('click', closeManageLabelsModal); if (addNewLabelForm) addNewLabelForm.addEventListener('submit', handleAddNewLabel); if (manageLabelsModal) manageLabelsModal.addEventListener('click', (event) => { if (event.target === manageLabelsModal) closeManageLabelsModal(); });
    if (openSettingsModalButton) openSettingsModalButton.addEventListener('click', openSettingsModal); if (closeSettingsModalBtn) closeSettingsModalBtn.addEventListener('click', closeSettingsModal); if (closeSettingsSecondaryBtn) closeSettingsSecondaryBtn.addEventListener('click', closeSettingsModal); if (settingsModal) settingsModal.addEventListener('click', (event) => { if (event.target === settingsModal) closeSettingsModal(); });
    if (settingsClearCompletedBtn) settingsClearCompletedBtn.addEventListener('click', clearCompletedTasks); if (settingsManageLabelsBtn) settingsManageLabelsBtn.addEventListener('click', () => { closeSettingsModal(); openManageLabelsModal(); }); const settingsManageProjectsBtnLocal = document.getElementById('settingsManageProjectsBtn'); if (settingsManageProjectsBtnLocal) settingsManageProjectsBtnLocal.addEventListener('click', () => { if (FeatureFlagService.isFeatureEnabled('projectFeature') && window.AppFeatures?.Projects) { closeSettingsModal(); window.AppFeatures.Projects.openManageProjectsModal(); } else { showMessage('Enable Project Feature in Feature Flags.', 'error'); } }); if (settingsManageRemindersBtn) { settingsManageRemindersBtn.addEventListener('click', () => { if(FeatureFlagService.isFeatureEnabled('reminderFeature')) { showMessage('Manage Reminders - Coming soon!', 'info'); } else { showMessage('Enable Reminder System in Feature Flags.', 'error'); }});} if (settingsTaskReviewBtn) { settingsTaskReviewBtn.addEventListener('click', () => { closeSettingsModal(); openTaskReviewModal(); });} if (settingsTooltipsGuideBtn) { settingsTooltipsGuideBtn.addEventListener('click', () => {closeSettingsModal(); openTooltipsGuideModal(); }); } const nonFunctionalFeatureMessageHandler = (featureName) => { showMessage(`${featureName} feature is not yet implemented. Coming soon!`, 'info'); }; if (settingsIntegrationsBtn) settingsIntegrationsBtn.addEventListener('click', () => nonFunctionalFeatureMessageHandler('Integrations')); if (settingsUserAccountsBtn) settingsUserAccountsBtn.addEventListener('click', () => nonFunctionalFeatureMessageHandler('User Accounts')); if (settingsCollaborationBtn) settingsCollaborationBtn.addEventListener('click', () => nonFunctionalFeatureMessageHandler('Collaboration')); if (settingsSyncBackupBtn) settingsSyncBackupBtn.addEventListener('click', () => nonFunctionalFeatureMessageHandler('Sync & Backup'));
    if (closeTaskReviewModalBtn) closeTaskReviewModalBtn.addEventListener('click', closeTaskReviewModal); if (closeTaskReviewSecondaryBtn) closeTaskReviewSecondaryBtn.addEventListener('click', closeTaskReviewModal); if (taskReviewModal) taskReviewModal.addEventListener('click', (event) => { if (event.target === taskReviewModal) closeTaskReviewModal(); });
    if (closeTooltipsGuideModalBtn) closeTooltipsGuideModalBtn.addEventListener('click', closeTooltipsGuideModal); if (closeTooltipsGuideSecondaryBtn) closeTooltipsGuideSecondaryBtn.addEventListener('click', closeTooltipsGuideModal); if (tooltipsGuideModal) tooltipsGuideModal.addEventListener('click', (event) => { if (event.target === tooltipsGuideModal) closeTooltipsGuideModal(); });
    const featureFlagsModalElement = document.getElementById('featureFlagsModal'); const closeFeatureFlagsModalBtn = document.getElementById('closeFeatureFlagsModalBtn'); const closeFeatureFlagsSecondaryBtn = document.getElementById('closeFeatureFlagsSecondaryBtn'); if (closeFeatureFlagsModalBtn) closeFeatureFlagsModalBtn.addEventListener('click', () => { document.getElementById('modalDialogFeatureFlags').classList.add('scale-95', 'opacity-0'); setTimeout(() => { if (featureFlagsModalElement) featureFlagsModalElement.classList.add('hidden'); }, 200); }); if (closeFeatureFlagsSecondaryBtn) closeFeatureFlagsSecondaryBtn.addEventListener('click', () => { document.getElementById('modalDialogFeatureFlags').classList.add('scale-95', 'opacity-0'); setTimeout(() => { if (featureFlagsModalElement) featureFlagsModalElement.classList.add('hidden'); }, 200); }); if (featureFlagsModalElement) featureFlagsModalElement.addEventListener('click', (event) => { if (event.target === featureFlagsModalElement) { document.getElementById('modalDialogFeatureFlags').classList.add('scale-95', 'opacity-0'); setTimeout(() => featureFlagsModalElement.classList.add('hidden'), 200); } });
    if (modalRemindMeAdd) modalRemindMeAdd.addEventListener('change', () => { if(FeatureFlagService.isFeatureEnabled('reminderFeature') && reminderOptionsAdd) { reminderOptionsAdd.classList.toggle('hidden', !modalRemindMeAdd.checked); if (modalRemindMeAdd.checked) { if (modalDueDateInputAdd.value && !modalReminderDateAdd.value) modalReminderDateAdd.value = modalDueDateInputAdd.value; if (modalTimeInputAdd.value && !modalReminderTimeAdd.value) modalReminderTimeAdd.value = modalTimeInputAdd.value; const today = new Date().toISOString().split('T')[0]; modalReminderDateAdd.min = today; } } else if (reminderOptionsAdd) reminderOptionsAdd.classList.add('hidden'); });
    if (modalRemindMeViewEdit) modalRemindMeViewEdit.addEventListener('change', () => { if(FeatureFlagService.isFeatureEnabled('reminderFeature') && reminderOptionsViewEdit) { reminderOptionsViewEdit.classList.toggle('hidden', !modalRemindMeViewEdit.checked); if (modalRemindMeViewEdit.checked) { const today = new Date().toISOString().split('T')[0]; modalReminderDateViewEdit.min = today; } } else if (reminderOptionsViewEdit) reminderOptionsViewEdit.classList.add('hidden'); });
    if (smartViewButtonsContainer) smartViewButtonsContainer.addEventListener('click', (event) => { const button = event.target.closest('.smart-view-btn'); if (button && button.dataset.filter && !button.dataset.filter.startsWith('project_')) setFilter(button.dataset.filter); }); const projectFilterContainerLocal = document.getElementById('projectFilterContainer'); if (projectFilterContainerLocal) projectFilterContainerLocal.addEventListener('click', (event) => { const button = event.target.closest('.smart-view-btn'); if (button && button.dataset.filter && button.dataset.filter.startsWith('project_')) setFilter(button.dataset.filter); });
    if (modalAddSubTaskBtnViewEdit) modalAddSubTaskBtnViewEdit.addEventListener('click', handleAddSubTaskViewEdit); if (modalSubTaskInputViewEdit) modalSubTaskInputViewEdit.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); handleAddSubTaskViewEdit(); } }); if (modalAddSubTaskBtnAdd) modalAddSubTaskBtnAdd.addEventListener('click', handleAddTempSubTaskForAddModal); if (modalSubTaskInputAdd) modalSubTaskInputAdd.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); handleAddTempSubTaskForAddModal(); } });
    document.addEventListener('keydown', (event) => { const isAddModalOpen = addTaskModal && !addTaskModal.classList.contains('hidden'); const isViewEditModalOpen = viewEditTaskModal && !viewEditTaskModal.classList.contains('hidden'); const isViewDetailsModalOpen = viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden'); const isManageLabelsModalOpen = manageLabelsModal && !manageLabelsModal.classList.contains('hidden'); const isSettingsModalOpen = settingsModal && !settingsModal.classList.contains('hidden'); const isTaskReviewModalOpen = taskReviewModal && !taskReviewModal.classList.contains('hidden'); const isTooltipsGuideModalOpen = tooltipsGuideModal && !tooltipsGuideModal.classList.contains('hidden'); const currentFeatureFlagsModalElement = document.getElementById('featureFlagsModal'); const isFeatureFlagsModalOpen = currentFeatureFlagsModalElement && !currentFeatureFlagsModalElement.classList.contains('hidden'); const manageProjectsModalElement = document.getElementById('manageProjectsModal'); const isManageProjectsModalOpen = manageProjectsModalElement && !manageProjectsModalElement.classList.contains('hidden'); const isAnyModalOpen = isAddModalOpen || isViewEditModalOpen || isViewDetailsModalOpen || isManageLabelsModalOpen || isSettingsModalOpen || isTaskReviewModalOpen || isTooltipsGuideModalOpen || isFeatureFlagsModalOpen || isManageProjectsModalOpen; const isInputFocused = document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT' || document.activeElement.tagName === 'TEXTAREA'; const isSubTaskInputFocused = document.activeElement === modalSubTaskInputViewEdit || document.activeElement === modalSubTaskInputAdd; if ((event.key === '+' || event.key === '=') && !isAnyModalOpen && !isInputFocused && !isSubTaskInputFocused) { event.preventDefault(); if(typeof openAddModal === 'function') openAddModal(); if (FeatureFlagService.isFeatureEnabled('projectFeature') && window.AppFeatures?.Projects) window.AppFeatures.Projects.populateProjectDropdowns(); } if (event.key === 'Escape') { if (isAddModalOpen && typeof closeAddModal === 'function') closeAddModal(); else if (isViewEditModalOpen && typeof closeViewEditModal === 'function') closeViewEditModal(); else if (isViewDetailsModalOpen && typeof closeViewTaskDetailsModal === 'function') closeViewTaskDetailsModal(); else if (isManageLabelsModalOpen && typeof closeManageLabelsModal === 'function') closeManageLabelsModal(); else if (isManageProjectsModalOpen && window.AppFeatures?.Projects && typeof window.AppFeatures.Projects.closeManageProjectsModal === 'function') { window.AppFeatures.Projects.closeManageProjectsModal(); } else if (isSettingsModalOpen && typeof closeSettingsModal === 'function') closeSettingsModal(); else if (isTaskReviewModalOpen && typeof closeTaskReviewModal === 'function') closeTaskReviewModal(); else if (isTooltipsGuideModalOpen && typeof closeTooltipsGuideModal === 'function') closeTooltipsGuideModal(); else if (isFeatureFlagsModalOpen) { const currentCloseFeatureFlagsModalBtn = document.getElementById('closeFeatureFlagsModalBtn'); if(currentCloseFeatureFlagsModalBtn) currentCloseFeatureFlagsModalBtn.click(); } } });
    console.log("[Event Handlers] All event listeners set up.");
}

// Subscribe to 'featureFlagsUpdated' to re-apply UI rules
if (typeof EventBus !== 'undefined' && typeof applyActiveFeatures === 'function') {
    EventBus.subscribe('featureFlagsUpdated', (data) => {
        console.log("[Event Handlers] Event received: featureFlagsUpdated. Re-applying active features.", data);
        applyActiveFeatures();
        const featureFlagsModalElement = document.getElementById('featureFlagsModal');
        if (featureFlagsModalElement && !featureFlagsModalElement.classList.contains('hidden') && typeof populateFeatureFlagsModal === 'function') {
            populateFeatureFlagsModal();
        }
    });
} else {
    console.warn("[Event Handlers] EventBus or applyActiveFeatures not available for 'featureFlagsUpdated' subscription.");
}
