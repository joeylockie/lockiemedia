// modal_interactions.js

// This file contains functions for managing modal dialogs.
// It relies on:
// - DOM elements from ui_rendering.js (initializeDOMElements).
// - Services: FeatureFlagService, ModalStateService, AppStore (for tasks, projects).
// - Utility functions from utils.js.
// - Rendering functions from ui_rendering.js.
// - AppFeatures for feature-specific logic.

// --- Add Task Modal UI Functions ---
function openAddModal() {
    // ... (implementation remains the same, ensuring it uses FeatureFlagService and AppFeatures.Projects.populateProjectDropdowns correctly)
    if (!addTaskModal || !modalDialogAdd || !modalTaskInputAdd || !modalTodoFormAdd || !modalPriorityInputAdd) { console.error("[OpenAddModal] Core modal elements not found."); return; }
    addTaskModal.classList.remove('hidden');
    setTimeout(() => { modalDialogAdd.classList.remove('scale-95', 'opacity-0'); modalDialogAdd.classList.add('scale-100', 'opacity-100'); }, 10);
    modalTaskInputAdd.focus(); modalTodoFormAdd.reset(); modalPriorityInputAdd.value = 'medium';
    if (typeof populateDatalist === 'function' && existingLabelsDatalist) populateDatalist(existingLabelsDatalist);
    if (FeatureFlagService.isFeatureEnabled('projectFeature') && window.AppFeatures?.Projects?.populateProjectDropdowns) { window.AppFeatures.Projects.populateProjectDropdowns(); if (modalProjectSelectAdd) { modalProjectSelectAdd.value = "0"; } }
    if (FeatureFlagService.isFeatureEnabled('taskTimerSystem')) { if(modalEstHoursAdd) modalEstHoursAdd.value = ''; if(modalEstMinutesAdd) modalEstMinutesAdd.value = ''; }
    if (modalRemindMeAdd) modalRemindMeAdd.checked = false; if (modalReminderDateAdd) modalReminderDateAdd.value = ''; if (modalReminderTimeAdd) modalReminderTimeAdd.value = ''; if (modalReminderEmailAdd) modalReminderEmailAdd.value = ''; if (reminderOptionsAdd) reminderOptionsAdd.classList.add('hidden');
    const today = new Date(); const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`; if (modalDueDateInputAdd) modalDueDateInputAdd.min = todayStr; if (modalReminderDateAdd) modalReminderDateAdd.min = todayStr;
    tempSubTasksForAddModal = []; // tempSubTasksForAddModal from ui_event_handlers.js
    if (FeatureFlagService.isFeatureEnabled('subTasksFeature') && modalSubTasksListAdd && typeof renderTempSubTasksForAddModal === 'function') { renderTempSubTasksForAddModal(); if(modalSubTaskInputAdd) modalSubTaskInputAdd.value = ''; }
    if (taskDependenciesSectionAdd) { taskDependenciesSectionAdd.classList.toggle('hidden', !FeatureFlagService.isFeatureEnabled('taskDependenciesFeature')); }
}

function closeAddModal() {
    // ... (implementation remains the same)
    if (!modalDialogAdd || !addTaskModal) return;
    modalDialogAdd.classList.add('scale-95', 'opacity-0');
    modalDialogAdd.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        addTaskModal.classList.add('hidden');
        tempSubTasksForAddModal = []; // tempSubTasksForAddModal from ui_event_handlers.js
        if(modalSubTasksListAdd) modalSubTasksListAdd.innerHTML = '';
    }, 200);
}

// --- View/Edit Task Modal UI Functions ---
function openViewEditModal(taskId) {
    if (typeof AppStore === 'undefined' || typeof AppStore.getTasks !== 'function' || typeof ModalStateService === 'undefined') {
        console.error("[OpenViewEditModal] Core dependencies (AppStore, ModalStateService) not available.");
        return;
    }
    const currentTasks = AppStore.getTasks();
    const task = currentTasks.find(t => t.id === taskId);
    if (!task) {
        console.error(`[OpenViewEditModal] Task with ID ${taskId} not found.`);
        return;
    }
    ModalStateService.setEditingTaskId(taskId); // Use ModalStateService

    if (modalViewEditTaskId) modalViewEditTaskId.value = task.id;
    // ... (rest of the modal population logic remains the same, using FeatureFlagService, AppStore.getProjects, etc.)
    if (modalTaskInputViewEdit) modalTaskInputViewEdit.value = task.text;
    if (modalDueDateInputViewEdit) modalDueDateInputViewEdit.value = task.dueDate || '';
    if (modalTimeInputViewEdit) modalTimeInputViewEdit.value = task.time || '';
    if (FeatureFlagService.isFeatureEnabled('taskTimerSystem')) { if (modalEstHoursViewEdit) modalEstHoursViewEdit.value = task.estimatedHours || ''; if (modalEstMinutesViewEdit) modalEstMinutesViewEdit.value = task.estimatedMinutes || ''; }
    if (modalPriorityInputViewEdit) modalPriorityInputViewEdit.value = task.priority;
    if (modalLabelInputViewEdit) modalLabelInputViewEdit.value = task.label || '';
    if (typeof populateDatalist === 'function' && existingLabelsEditDatalist) populateDatalist(existingLabelsEditDatalist);
    if (FeatureFlagService.isFeatureEnabled('projectFeature') && window.AppFeatures?.Projects?.populateProjectDropdowns) { window.AppFeatures.Projects.populateProjectDropdowns(); if (modalProjectSelectViewEdit) { modalProjectSelectViewEdit.value = task.projectId || "0"; } }
    if (modalNotesInputViewEdit) modalNotesInputViewEdit.value = task.notes || '';
    if (FeatureFlagService.isFeatureEnabled('fileAttachments') && existingAttachmentsViewEdit) { existingAttachmentsViewEdit.textContent = task.attachments && task.attachments.length > 0 ? `${task.attachments.length} file(s) attached (management UI coming soon)` : 'No files attached yet.'; }
    if (FeatureFlagService.isFeatureEnabled('reminderFeature') && modalRemindMeViewEdit) { modalRemindMeViewEdit.checked = task.isReminderSet || false; if (reminderOptionsViewEdit) reminderOptionsViewEdit.classList.toggle('hidden', !modalRemindMeViewEdit.checked); if (modalRemindMeViewEdit.checked) { if (modalReminderDateViewEdit) modalReminderDateViewEdit.value = task.reminderDate || ''; if (modalReminderTimeViewEdit) modalReminderTimeViewEdit.value = task.reminderTime || ''; if (modalReminderEmailViewEdit) modalReminderEmailViewEdit.value = task.reminderEmail || ''; } else { if (modalReminderDateViewEdit) modalReminderDateViewEdit.value = ''; if (modalReminderTimeViewEdit) modalReminderTimeViewEdit.value = ''; if (modalReminderEmailViewEdit) modalReminderEmailViewEdit.value = ''; } } else if (reminderOptionsViewEdit) { if (modalRemindMeViewEdit) modalRemindMeViewEdit.checked = false; reminderOptionsViewEdit.classList.add('hidden'); }
    const today = new Date(); const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`; if(modalDueDateInputViewEdit) modalDueDateInputViewEdit.min = todayStr; if (modalReminderDateViewEdit) modalReminderDateViewEdit.min = todayStr;
    if (FeatureFlagService.isFeatureEnabled('subTasksFeature') && modalSubTasksListViewEdit && typeof renderSubTasksForEditModal === 'function') { renderSubTasksForEditModal(taskId, modalSubTasksListViewEdit); if(modalSubTaskInputViewEdit) modalSubTaskInputViewEdit.value = ''; }
    if (taskDependenciesSectionViewEdit) { taskDependenciesSectionViewEdit.classList.toggle('hidden', !FeatureFlagService.isFeatureEnabled('taskDependenciesFeature')); }

    if (!viewEditTaskModal || !modalDialogViewEdit) { console.error("[OpenViewEditModal] Core view/edit modal elements not found."); return; }
    viewEditTaskModal.classList.remove('hidden');
    setTimeout(() => { modalDialogViewEdit.classList.remove('scale-95', 'opacity-0'); modalDialogViewEdit.classList.add('scale-100', 'opacity-100'); }, 10);
    if(modalTaskInputViewEdit) modalTaskInputViewEdit.focus();
}

function closeViewEditModal() {
    if (!modalDialogViewEdit || !viewEditTaskModal) return;
    modalDialogViewEdit.classList.add('scale-95', 'opacity-0');
    modalDialogViewEdit.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        viewEditTaskModal.classList.add('hidden');
        if (typeof ModalStateService !== 'undefined') ModalStateService.setEditingTaskId(null); // Use ModalStateService
    }, 200);
}

// --- View Task Details Modal UI Functions ---
function openViewTaskDetailsModal(taskId) {
    if (typeof AppStore === 'undefined' || typeof AppStore.getTasks !== 'function' || typeof ModalStateService === 'undefined') {
        console.error("[OpenViewDetailsModal] Core dependencies (AppStore, ModalStateService) not available.");
        return;
    }
    const currentTasks = AppStore.getTasks();
    const task = currentTasks.find(t => t.id === taskId);
    if (!task) {
        console.error(`[OpenViewDetailsModal] Task with ID ${taskId} not found.`);
        return;
    }
    ModalStateService.setCurrentViewTaskId(taskId); // Use ModalStateService

    // ... (rest of the modal population logic remains the same, using FeatureFlagService, AppStore.getProjects, utils.js functions, etc.)
    if(viewTaskText) viewTaskText.textContent = task.text;
    if(viewTaskDueDate && typeof formatDate === 'function') viewTaskDueDate.textContent = task.dueDate ? formatDate(task.dueDate) : 'Not set';
    if(viewTaskTime && typeof formatTime === 'function') viewTaskTime.textContent = task.time ? formatTime(task.time) : 'Not set';
    if (FeatureFlagService.isFeatureEnabled('taskTimerSystem') && window.AppFeatures?.TaskTimerSystem?.setupTimerForModal) { window.AppFeatures.TaskTimerSystem.setupTimerForModal(task); } else { if(viewTaskEstDuration && typeof formatDuration === 'function') viewTaskEstDuration.textContent = formatDuration(task.estimatedHours, task.estimatedMinutes); if(taskTimerSection) taskTimerSection.classList.add('hidden'); }
    if (FeatureFlagService.isFeatureEnabled('fileAttachments') && viewTaskAttachmentsList) { viewTaskAttachmentsList.textContent = task.attachments && task.attachments.length > 0 ? `Contains ${task.attachments.length} attachment(s) (viewing UI coming soon).` : 'No attachments.'; if(viewTaskAttachmentsSection) viewTaskAttachmentsSection.classList.remove('hidden'); } else if (viewTaskAttachmentsSection) { viewTaskAttachmentsSection.classList.add('hidden'); }
    if(viewTaskPriority) viewTaskPriority.textContent = task.priority || 'Not set'; if(viewTaskStatus) viewTaskStatus.textContent = task.completed ? 'Completed' : 'Active'; if(viewTaskLabel) viewTaskLabel.textContent = task.label || 'None';
    const projectSectionInView = viewTaskProject ? viewTaskProject.closest('.project-feature-element') : null; if (FeatureFlagService.isFeatureEnabled('projectFeature') && viewTaskProject) { const currentProjects = AppStore.getProjects(); const project = currentProjects.find(p => p.id === task.projectId); viewTaskProject.textContent = project && project.id !== 0 ? project.name : 'None'; if (projectSectionInView) projectSectionInView.classList.remove('hidden'); } else if (projectSectionInView) { projectSectionInView.classList.add('hidden'); }
    if(viewTaskNotes) viewTaskNotes.textContent = task.notes || 'No notes added.';
    if (FeatureFlagService.isFeatureEnabled('reminderFeature') && viewTaskReminderSection) { viewTaskReminderSection.classList.remove('hidden'); if (task.isReminderSet) { if(viewTaskReminderStatus) viewTaskReminderStatus.textContent = 'Active'; if (viewTaskReminderDate && typeof formatDate === 'function') viewTaskReminderDate.textContent = task.reminderDate ? formatDate(task.reminderDate) : 'Not set'; if (viewTaskReminderTime && typeof formatTime === 'function') viewTaskReminderTime.textContent = task.reminderTime ? formatTime(task.reminderTime) : 'Not set'; if (viewTaskReminderEmail) viewTaskReminderEmail.textContent = task.reminderEmail || 'Not set'; if (viewTaskReminderDetails) viewTaskReminderDetails.classList.remove('hidden'); } else { if(viewTaskReminderStatus) viewTaskReminderStatus.textContent = 'Not set'; if (viewTaskReminderDetails) viewTaskReminderDetails.classList.add('hidden'); } } else if (viewTaskReminderSection) { viewTaskReminderSection.classList.add('hidden'); }
    if (FeatureFlagService.isFeatureEnabled('subTasksFeature') && modalSubTasksListViewDetails && viewSubTaskProgress && noSubTasksMessageViewDetails && typeof renderSubTasksForViewModal === 'function') { if (subTasksSectionViewDetails) subTasksSectionViewDetails.classList.remove('hidden'); renderSubTasksForViewModal(taskId, modalSubTasksListViewDetails, viewSubTaskProgress, noSubTasksMessageViewDetails); } else if (subTasksSectionViewDetails) { subTasksSectionViewDetails.classList.add('hidden'); }
    if (FeatureFlagService.isFeatureEnabled('taskDependenciesFeature') && typeof renderTaskDependenciesForViewModal === 'function') { if(viewTaskDependenciesSection) viewTaskDependenciesSection.classList.remove('hidden'); renderTaskDependenciesForViewModal(task); } else if (viewTaskDependenciesSection) { viewTaskDependenciesSection.classList.add('hidden'); }

    if (!viewTaskDetailsModal || !modalDialogViewDetails) { console.error("[OpenViewDetailsModal] Core view details modal elements not found."); return; }
    viewTaskDetailsModal.classList.remove('hidden');
    setTimeout(() => { modalDialogViewDetails.classList.remove('scale-95', 'opacity-0'); modalDialogViewDetails.classList.add('scale-100', 'opacity-100'); }, 10);
}

function closeViewTaskDetailsModal() {
    if (!modalDialogViewDetails || !viewTaskDetailsModal) return;
    modalDialogViewDetails.classList.add('scale-95', 'opacity-0');
    modalDialogViewDetails.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        viewTaskDetailsModal.classList.add('hidden');
        if (FeatureFlagService.isFeatureEnabled('taskTimerSystem') && window.AppFeatures?.TaskTimerSystem?.clearTimerOnModalClose) {
            window.AppFeatures.TaskTimerSystem.clearTimerOnModalClose();
        }
        if (typeof ModalStateService !== 'undefined') ModalStateService.setCurrentViewTaskId(null); // Use ModalStateService
    }, 200);
}

// --- Manage Labels Modal UI Functions ---
// ... (openManageLabelsModal, closeManageLabelsModal, populateManageLabelsList remain the same,
//      they don't directly use editingTaskId or currentViewTaskId)
function openManageLabelsModal() { if (!manageLabelsModal || !modalDialogManageLabels || !newLabelInput) { console.error("[OpenManageLabelsModal] Core manage labels modal elements not found."); return; } populateManageLabelsList(); manageLabelsModal.classList.remove('hidden'); setTimeout(() => { modalDialogManageLabels.classList.remove('scale-95', 'opacity-0'); modalDialogManageLabels.classList.add('scale-100', 'opacity-100'); }, 10); newLabelInput.focus(); }
function closeManageLabelsModal() { if (!modalDialogManageLabels || !manageLabelsModal) return; modalDialogManageLabels.classList.add('scale-95', 'opacity-0'); modalDialogManageLabels.classList.remove('scale-100', 'opacity-100'); setTimeout(() => { manageLabelsModal.classList.add('hidden'); }, 200); }
function populateManageLabelsList() { if (!existingLabelsList || typeof AppStore === 'undefined' || typeof AppStore.getUniqueLabels !== 'function') return; const currentUniqueLabels = AppStore.getUniqueLabels(); existingLabelsList.innerHTML = ''; currentUniqueLabels.forEach(label => { const li = document.createElement('li'); li.className = 'flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700 rounded-md'; const span = document.createElement('span'); span.textContent = label.charAt(0).toUpperCase() + label.slice(1); span.className = 'text-slate-700 dark:text-slate-200'; li.appendChild(span); const deleteBtn = document.createElement('button'); deleteBtn.innerHTML = '<i class="fas fa-trash-alt text-red-500 hover:text-red-700"></i>'; deleteBtn.className = 'p-1'; deleteBtn.title = `Delete label "${label}"`; if (typeof handleDeleteLabel === 'function') { deleteBtn.addEventListener('click', () => handleDeleteLabel(label)); } li.appendChild(deleteBtn); existingLabelsList.appendChild(li); }); if (currentUniqueLabels.length === 0) { existingLabelsList.innerHTML = '<li class="text-slate-500 dark:text-slate-400 text-center">No labels created yet.</li>'; }}

// --- Settings Modal UI Functions ---
// ... (openSettingsModal, closeSettingsModal remain the same)
function openSettingsModal() { if (!settingsModal || !modalDialogSettings) { console.error("[OpenSettingsModal] Core settings modal elements not found."); return; } settingsModal.classList.remove('hidden'); setTimeout(() => { modalDialogSettings.classList.remove('scale-95', 'opacity-0'); modalDialogSettings.classList.add('scale-100', 'opacity-100'); }, 10); if (typeof updateClearCompletedButtonState === 'function') updateClearCompletedButtonState(); }
function closeSettingsModal() { if (!modalDialogSettings || !settingsModal) return; modalDialogSettings.classList.add('scale-95', 'opacity-0'); modalDialogSettings.classList.remove('scale-100', 'opacity-100'); setTimeout(() => { settingsModal.classList.add('hidden'); }, 200); }

// --- Task Review Modal UI Functions ---
// ... (openTaskReviewModal, closeTaskReviewModal, populateTaskReviewModal remain the same)
function openTaskReviewModal() { if (!FeatureFlagService.isFeatureEnabled('taskTimerSystem')) { if(typeof showMessage === 'function') showMessage("Task Timer System feature is currently disabled.", "error"); return; } if (!taskReviewModal || !modalDialogTaskReview) { console.error("[OpenTaskReviewModal] Core task review modal elements not found."); return; } if (typeof populateTaskReviewModal === 'function') populateTaskReviewModal(); taskReviewModal.classList.remove('hidden'); setTimeout(() => { modalDialogTaskReview.classList.remove('scale-95', 'opacity-0'); modalDialogTaskReview.classList.add('scale-100', 'opacity-100'); }, 10); }
function closeTaskReviewModal() { if (!modalDialogTaskReview || !taskReviewModal) return; modalDialogTaskReview.classList.add('scale-95', 'opacity-0'); modalDialogTaskReview.classList.remove('scale-100', 'opacity-100'); setTimeout(() => { taskReviewModal.classList.add('hidden'); }, 200); }
function populateTaskReviewModal() { if (!taskReviewContent || typeof AppStore === 'undefined' || typeof AppStore.getTasks !== 'function') return; taskReviewContent.innerHTML = ''; const currentTasks = AppStore.getTasks(); const completedTasksWithTime = currentTasks.filter(task => task.completed && ((task.estimatedHours && task.estimatedHours > 0) || (task.estimatedMinutes && task.estimatedMinutes > 0) || (task.actualDurationMs && task.actualDurationMs > 0))).sort((a,b) => (b.completedDate || 0) - (a.completedDate || 0)); if (completedTasksWithTime.length === 0) { taskReviewContent.innerHTML = '<p class="text-slate-500 dark:text-slate-400 text-center">No completed tasks with time data.</p>'; return; } completedTasksWithTime.forEach(task => { const itemDiv = document.createElement('div'); itemDiv.className = 'p-3 bg-slate-50 dark:bg-slate-700 rounded-lg shadow'; const taskName = document.createElement('h4'); taskName.className = 'text-md font-semibold text-slate-800 dark:text-slate-100 mb-1 truncate'; taskName.textContent = task.text; itemDiv.appendChild(taskName); if (typeof formatDuration === 'function') { const estimatedP = document.createElement('p'); estimatedP.className = 'text-sm text-slate-600 dark:text-slate-300'; estimatedP.innerHTML = `<strong>Estimated:</strong> ${formatDuration(task.estimatedHours, task.estimatedMinutes)}`; itemDiv.appendChild(estimatedP); } if (typeof formatMillisecondsToHMS === 'function') { const actualP = document.createElement('p'); actualP.className = 'text-sm text-slate-600 dark:text-slate-300'; actualP.innerHTML = `<strong>Actual:</strong> ${task.actualDurationMs > 0 ? formatMillisecondsToHMS(task.actualDurationMs) : 'Not recorded'}`; itemDiv.appendChild(actualP); } if (task.completedDate && typeof formatDate === 'function') { const completedOnP = document.createElement('p'); completedOnP.className = 'text-xs text-slate-400 dark:text-slate-500 mt-1'; completedOnP.textContent = `Completed on: ${formatDate(new Date(task.completedDate))}`; itemDiv.appendChild(completedOnP); } taskReviewContent.appendChild(itemDiv); }); }

// --- Tooltips Guide Modal UI Functions ---
// ... (openTooltipsGuideModal, closeTooltipsGuideModal remain the same)
function openTooltipsGuideModal() { if (!FeatureFlagService.isFeatureEnabled('tooltipsGuide')) { if(typeof showMessage === 'function') showMessage("Tooltips Guide feature is disabled.", "error"); return; } if (!tooltipsGuideModal || !modalDialogTooltipsGuide) { console.error("[OpenTooltipsGuideModal] Core tooltips modal elements not found."); return; } tooltipsGuideModal.classList.remove('hidden'); setTimeout(() => { modalDialogTooltipsGuide.classList.remove('scale-95', 'opacity-0'); modalDialogTooltipsGuide.classList.add('scale-100', 'opacity-100'); }, 10); }
function closeTooltipsGuideModal() { if (!modalDialogTooltipsGuide || !tooltipsGuideModal) return; modalDialogTooltipsGuide.classList.add('scale-95', 'opacity-0'); modalDialogTooltipsGuide.classList.remove('scale-100', 'opacity-100'); setTimeout(() => { tooltipsGuideModal.classList.add('hidden'); }, 200); }

// console.log("modal_interactions.js loaded");
