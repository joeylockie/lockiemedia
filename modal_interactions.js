// modal_interactions.js
// Manages modal dialogs (Add, Edit, View, Settings, etc.)
// Now an ES6 module.

import AppStore from './store.js';
import { isFeatureEnabled } from './featureFlagService.js';
import ModalStateService from './modalStateService.js';
import { formatDate, formatTime, formatDuration, getTodayDateString } from './utils.js'; // Import needed utils

// Assumes DOM elements are globally available (initialized by ui_rendering.js -> initializeDOMElements)
// Assumes ui_rendering.js functions like populateDatalist, renderSubTasks... are global for now.
// Assumes ui_event_handlers.js functions like handleDeleteLabel are global for now.
// Assumes tempSubTasksForAddModal is global from ui_event_handlers.js for now.

export function openAddModal() {
    if (!addTaskModal || !modalDialogAdd || !modalTaskInputAdd || !modalTodoFormAdd || !modalPriorityInputAdd) {
        console.error("[OpenAddModal] Core modal elements not found.");
        return;
    }
    addTaskModal.classList.remove('hidden');
    setTimeout(() => { modalDialogAdd.classList.remove('scale-95', 'opacity-0'); modalDialogAdd.classList.add('scale-100', 'opacity-100'); }, 10);
    modalTaskInputAdd.focus(); modalTodoFormAdd.reset(); modalPriorityInputAdd.value = 'medium';
    
    if (typeof populateDatalist === 'function' && existingLabelsDatalist) populateDatalist(existingLabelsDatalist);

    if (isFeatureEnabled('projectFeature') && window.AppFeatures?.Projects?.populateProjectDropdowns) {
        window.AppFeatures.Projects.populateProjectDropdowns();
        if (modalProjectSelectAdd) modalProjectSelectAdd.value = "0";
    }
    if (isFeatureEnabled('taskTimerSystem')) {
        if(modalEstHoursAdd) modalEstHoursAdd.value = '';
        if(modalEstMinutesAdd) modalEstMinutesAdd.value = '';
    }
    if (modalRemindMeAdd) modalRemindMeAdd.checked = false;
    if (modalReminderDateAdd) modalReminderDateAdd.value = '';
    if (modalReminderTimeAdd) modalReminderTimeAdd.value = '';
    if (modalReminderEmailAdd) modalReminderEmailAdd.value = '';
    if (reminderOptionsAdd) reminderOptionsAdd.classList.add('hidden');
    
    const todayStr = getTodayDateString(); // Use imported util
    if (modalDueDateInputAdd) modalDueDateInputAdd.min = todayStr;
    if (modalReminderDateAdd) modalReminderDateAdd.min = todayStr;

    window.tempSubTasksForAddModal = []; // Access/reset global temp state
    if (isFeatureEnabled('subTasksFeature') && modalSubTasksListAdd && typeof renderTempSubTasksForAddModal === 'function') {
        renderTempSubTasksForAddModal();
        if(modalSubTaskInputAdd) modalSubTaskInputAdd.value = '';
    }
    if (taskDependenciesSectionAdd) taskDependenciesSectionAdd.classList.toggle('hidden', !isFeatureEnabled('taskDependenciesFeature'));
}

export function closeAddModal() {
    if (!modalDialogAdd || !addTaskModal) return;
    modalDialogAdd.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        addTaskModal.classList.add('hidden');
        window.tempSubTasksForAddModal = []; // Reset global temp state
        if(modalSubTasksListAdd) modalSubTasksListAdd.innerHTML = '';
    }, 200);
}

export function openViewEditModal(taskId) {
    if (!AppStore || typeof AppStore.getTasks !== 'function' || !ModalStateService) {
        console.error("[OpenViewEditModal] Core dependencies (AppStore, ModalStateService) not available.");
        return;
    }
    const currentTasks = AppStore.getTasks();
    const task = currentTasks.find(t => t.id === taskId);
    if (!task) { console.error(`[OpenViewEditModal] Task with ID ${taskId} not found.`); return; }
    
    ModalStateService.setEditingTaskId(taskId);

    if (modalViewEditTaskId) modalViewEditTaskId.value = task.id;
    if (modalTaskInputViewEdit) modalTaskInputViewEdit.value = task.text;
    if (modalDueDateInputViewEdit) modalDueDateInputViewEdit.value = task.dueDate || '';
    if (modalTimeInputViewEdit) modalTimeInputViewEdit.value = task.time || '';
    if (isFeatureEnabled('taskTimerSystem')) { if (modalEstHoursViewEdit) modalEstHoursViewEdit.value = task.estimatedHours || ''; if (modalEstMinutesViewEdit) modalEstMinutesViewEdit.value = task.estimatedMinutes || ''; }
    if (modalPriorityInputViewEdit) modalPriorityInputViewEdit.value = task.priority;
    if (modalLabelInputViewEdit) modalLabelInputViewEdit.value = task.label || '';
    if (typeof populateDatalist === 'function' && existingLabelsEditDatalist) populateDatalist(existingLabelsEditDatalist);
    if (isFeatureEnabled('projectFeature') && window.AppFeatures?.Projects?.populateProjectDropdowns) { window.AppFeatures.Projects.populateProjectDropdowns(); if (modalProjectSelectViewEdit) { modalProjectSelectViewEdit.value = task.projectId || "0"; } }
    if (modalNotesInputViewEdit) modalNotesInputViewEdit.value = task.notes || '';
    if (isFeatureEnabled('fileAttachments') && existingAttachmentsViewEdit) { existingAttachmentsViewEdit.textContent = task.attachments && task.attachments.length > 0 ? `${task.attachments.length} file(s) attached (management UI coming soon)` : 'No files attached yet.'; }
    if (isFeatureEnabled('reminderFeature') && modalRemindMeViewEdit) { modalRemindMeViewEdit.checked = task.isReminderSet || false; if (reminderOptionsViewEdit) reminderOptionsViewEdit.classList.toggle('hidden', !modalRemindMeViewEdit.checked); if (modalRemindMeViewEdit.checked) { if (modalReminderDateViewEdit) modalReminderDateViewEdit.value = task.reminderDate || ''; if (modalReminderTimeViewEdit) modalReminderTimeViewEdit.value = task.reminderTime || ''; if (modalReminderEmailViewEdit) modalReminderEmailViewEdit.value = task.reminderEmail || ''; } else { if (modalReminderDateViewEdit) modalReminderDateViewEdit.value = ''; if (modalReminderTimeViewEdit) modalReminderTimeViewEdit.value = ''; if (modalReminderEmailViewEdit) modalReminderEmailViewEdit.value = ''; } } else if (reminderOptionsViewEdit) { if (modalRemindMeViewEdit) modalRemindMeViewEdit.checked = false; reminderOptionsViewEdit.classList.add('hidden'); }
    const todayStr = getTodayDateString(); if(modalDueDateInputViewEdit) modalDueDateInputViewEdit.min = todayStr; if (modalReminderDateViewEdit) modalReminderDateViewEdit.min = todayStr;
    if (isFeatureEnabled('subTasksFeature') && modalSubTasksListViewEdit && typeof renderSubTasksForEditModal === 'function') { renderSubTasksForEditModal(taskId, modalSubTasksListViewEdit); if(modalSubTaskInputViewEdit) modalSubTaskInputViewEdit.value = ''; }
    if (taskDependenciesSectionViewEdit) taskDependenciesSectionViewEdit.classList.toggle('hidden', !isFeatureEnabled('taskDependenciesFeature'));

    if (!viewEditTaskModal || !modalDialogViewEdit) { console.error("[OpenViewEditModal] Core view/edit modal elements not found."); return; }
    viewEditTaskModal.classList.remove('hidden');
    setTimeout(() => { modalDialogViewEdit.classList.remove('scale-95', 'opacity-0'); modalDialogViewEdit.classList.add('scale-100', 'opacity-100'); }, 10);
    if(modalTaskInputViewEdit) modalTaskInputViewEdit.focus();
}

export function closeViewEditModal() {
    if (!modalDialogViewEdit || !viewEditTaskModal) return;
    modalDialogViewEdit.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        viewEditTaskModal.classList.add('hidden');
        if (ModalStateService) ModalStateService.setEditingTaskId(null);
    }, 200);
}

export function openViewTaskDetailsModal(taskId) {
    if (!AppStore || typeof AppStore.getTasks !== 'function' || !ModalStateService) { console.error("[OpenViewDetailsModal] Core dependencies not available."); return; }
    const currentTasks = AppStore.getTasks();
    const task = currentTasks.find(t => t.id === taskId);
    if (!task) { console.error(`[OpenViewDetailsModal] Task with ID ${taskId} not found.`); return; }
    ModalStateService.setCurrentViewTaskId(taskId);

    if(viewTaskText) viewTaskText.textContent = task.text;
    if(viewTaskDueDate && typeof formatDate === 'function') viewTaskDueDate.textContent = task.dueDate ? formatDate(task.dueDate) : 'Not set';
    if(viewTaskTime && typeof formatTime === 'function') viewTaskTime.textContent = task.time ? formatTime(task.time) : 'Not set';
    if (isFeatureEnabled('taskTimerSystem') && window.AppFeatures?.TaskTimerSystem?.setupTimerForModal) { window.AppFeatures.TaskTimerSystem.setupTimerForModal(task); } else { if(viewTaskEstDuration && typeof formatDuration === 'function') viewTaskEstDuration.textContent = formatDuration(task.estimatedHours, task.estimatedMinutes); if(taskTimerSection) taskTimerSection.classList.add('hidden'); }
    if (isFeatureEnabled('fileAttachments') && viewTaskAttachmentsList) { viewTaskAttachmentsList.textContent = task.attachments && task.attachments.length > 0 ? `Contains ${task.attachments.length} attachment(s).` : 'No attachments.'; if(viewTaskAttachmentsSection) viewTaskAttachmentsSection.classList.remove('hidden'); } else if (viewTaskAttachmentsSection) { viewTaskAttachmentsSection.classList.add('hidden'); }
    if(viewTaskPriority) viewTaskPriority.textContent = task.priority || 'Not set'; if(viewTaskStatus) viewTaskStatus.textContent = task.completed ? 'Completed' : 'Active'; if(viewTaskLabel) viewTaskLabel.textContent = task.label || 'None';
    const projectSectionInView = viewTaskProject ? viewTaskProject.closest('.project-feature-element') : null; if (isFeatureEnabled('projectFeature') && viewTaskProject) { const currentProjects = AppStore.getProjects(); const project = currentProjects.find(p => p.id === task.projectId); viewTaskProject.textContent = project && project.id !== 0 ? project.name : 'None'; if (projectSectionInView) projectSectionInView.classList.remove('hidden'); } else if (projectSectionInView) { projectSectionInView.classList.add('hidden'); }
    if(viewTaskNotes) viewTaskNotes.textContent = task.notes || 'No notes added.';
    if (isFeatureEnabled('reminderFeature') && viewTaskReminderSection) { viewTaskReminderSection.classList.remove('hidden'); if (task.isReminderSet) { if(viewTaskReminderStatus) viewTaskReminderStatus.textContent = 'Active'; if (viewTaskReminderDate && typeof formatDate === 'function') viewTaskReminderDate.textContent = task.reminderDate ? formatDate(task.reminderDate) : 'Not set'; if (viewTaskReminderTime && typeof formatTime === 'function') viewTaskReminderTime.textContent = task.reminderTime ? formatTime(task.reminderTime) : 'Not set'; if (viewTaskReminderEmail) viewTaskReminderEmail.textContent = task.reminderEmail || 'Not set'; if (viewTaskReminderDetails) viewTaskReminderDetails.classList.remove('hidden'); } else { if(viewTaskReminderStatus) viewTaskReminderStatus.textContent = 'Not set'; if (viewTaskReminderDetails) viewTaskReminderDetails.classList.add('hidden'); } } else if (viewTaskReminderSection) { viewTaskReminderSection.classList.add('hidden'); }
    if (isFeatureEnabled('subTasksFeature') && modalSubTasksListViewDetails && viewSubTaskProgress && noSubTasksMessageViewDetails && typeof renderSubTasksForViewModal === 'function') { if (subTasksSectionViewDetails) subTasksSectionViewDetails.classList.remove('hidden'); renderSubTasksForViewModal(taskId, modalSubTasksListViewDetails, viewSubTaskProgress, noSubTasksMessageViewDetails); } else if (subTasksSectionViewDetails) { subTasksSectionViewDetails.classList.add('hidden'); }
    if (isFeatureEnabled('taskDependenciesFeature') && typeof renderTaskDependenciesForViewModal === 'function') { if(viewTaskDependenciesSection) viewTaskDependenciesSection.classList.remove('hidden'); renderTaskDependenciesForViewModal(task); } else if (viewTaskDependenciesSection) { viewTaskDependenciesSection.classList.add('hidden'); }

    if (!viewTaskDetailsModal || !modalDialogViewDetails) { console.error("[OpenViewDetailsModal] Core view details modal elements not found."); return; }
    viewTaskDetailsModal.classList.remove('hidden');
    setTimeout(() => { modalDialogViewDetails.classList.remove('scale-95', 'opacity-0'); modalDialogViewDetails.classList.add('scale-100', 'opacity-100'); }, 10);
}

export function closeViewTaskDetailsModal() {
    if (!modalDialogViewDetails || !viewTaskDetailsModal) return;
    modalDialogViewDetails.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        viewTaskDetailsModal.classList.add('hidden');
        if (isFeatureEnabled('taskTimerSystem') && window.AppFeatures?.TaskTimerSystem?.clearTimerOnModalClose) {
            window.AppFeatures.TaskTimerSystem.clearTimerOnModalClose();
        }
        if (ModalStateService) ModalStateService.setCurrentViewTaskId(null);
    }, 200);
}

export function openManageLabelsModal() { /* ... same as before ... */ 
    if (!manageLabelsModal || !modalDialogManageLabels || !newLabelInput) { console.error("[OpenManageLabelsModal] Core manage labels modal elements not found."); return; } populateManageLabelsList(); manageLabelsModal.classList.remove('hidden'); setTimeout(() => { modalDialogManageLabels.classList.remove('scale-95', 'opacity-0'); modalDialogManageLabels.classList.add('scale-100', 'opacity-100'); }, 10); newLabelInput.focus();
}
export function closeManageLabelsModal() { /* ... same as before ... */ 
    if (!modalDialogManageLabels || !manageLabelsModal) return; modalDialogManageLabels.classList.add('scale-95', 'opacity-0'); setTimeout(() => { manageLabelsModal.classList.add('hidden'); }, 200);
}
export function populateManageLabelsList() { /* ... same as before, uses AppStore.getUniqueLabels() and global handleDeleteLabel ... */ 
    if (!existingLabelsList || !AppStore || typeof AppStore.getUniqueLabels !== 'function') return; const currentUniqueLabels = AppStore.getUniqueLabels(); existingLabelsList.innerHTML = ''; currentUniqueLabels.forEach(label => { const li = document.createElement('li'); li.className = 'flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700 rounded-md'; const span = document.createElement('span'); span.textContent = label.charAt(0).toUpperCase() + label.slice(1); span.className = 'text-slate-700 dark:text-slate-200'; li.appendChild(span); const deleteBtn = document.createElement('button'); deleteBtn.innerHTML = '<i class="fas fa-trash-alt text-red-500 hover:text-red-700"></i>'; deleteBtn.className = 'p-1'; deleteBtn.title = `Delete label "${label}"`; if (typeof handleDeleteLabel === 'function') { deleteBtn.addEventListener('click', () => handleDeleteLabel(label)); } li.appendChild(deleteBtn); existingLabelsList.appendChild(li); }); if (currentUniqueLabels.length === 0) { existingLabelsList.innerHTML = '<li class="text-slate-500 dark:text-slate-400 text-center">No labels created yet.</li>'; }
}
export function openSettingsModal() { /* ... same as before, uses global updateClearCompletedButtonState ... */ 
    if (!settingsModal || !modalDialogSettings) { console.error("[OpenSettingsModal] Core settings modal elements not found."); return; } settingsModal.classList.remove('hidden'); setTimeout(() => { modalDialogSettings.classList.remove('scale-95', 'opacity-0'); modalDialogSettings.classList.add('scale-100', 'opacity-100'); }, 10); if (typeof updateClearCompletedButtonState === 'function') updateClearCompletedButtonState();
}
export function closeSettingsModal() { /* ... same as before ... */ 
    if (!modalDialogSettings || !settingsModal) return; modalDialogSettings.classList.add('scale-95', 'opacity-0'); setTimeout(() => { settingsModal.classList.add('hidden'); }, 200);
}
export function openTaskReviewModal() { /* ... same as before, uses FeatureFlagService, showMessage, populateTaskReviewModal ... */ 
    if (!isFeatureEnabled('taskTimerSystem')) { if(typeof showMessage === 'function') showMessage("Task Timer System feature is currently disabled.", "error"); return; } if (!taskReviewModal || !modalDialogTaskReview) { console.error("[OpenTaskReviewModal] Core task review modal elements not found."); return; } if (typeof populateTaskReviewModal === 'function') populateTaskReviewModal(); taskReviewModal.classList.remove('hidden'); setTimeout(() => { modalDialogTaskReview.classList.remove('scale-95', 'opacity-0'); modalDialogTaskReview.classList.add('scale-100', 'opacity-100'); }, 10);
}
export function closeTaskReviewModal() { /* ... same as before ... */ 
    if (!modalDialogTaskReview || !taskReviewModal) return; modalDialogTaskReview.classList.add('scale-95', 'opacity-0'); setTimeout(() => { taskReviewModal.classList.add('hidden'); }, 200);
}
export function populateTaskReviewModal() { /* ... same as before, uses AppStore.getTasks(), formatDuration, formatMillisecondsToHMS, formatDate ... */ 
    if (!taskReviewContent || !AppStore || typeof AppStore.getTasks !== 'function') return; taskReviewContent.innerHTML = ''; const currentTasks = AppStore.getTasks(); const completedTasksWithTime = currentTasks.filter(task => task.completed && ((task.estimatedHours && task.estimatedHours > 0) || (task.estimatedMinutes && task.estimatedMinutes > 0) || (task.actualDurationMs && task.actualDurationMs > 0))).sort((a,b) => (b.completedDate || 0) - (a.completedDate || 0)); if (completedTasksWithTime.length === 0) { taskReviewContent.innerHTML = '<p class="text-slate-500 dark:text-slate-400 text-center">No completed tasks with time data.</p>'; return; } completedTasksWithTime.forEach(task => { const itemDiv = document.createElement('div'); itemDiv.className = 'p-3 bg-slate-50 dark:bg-slate-700 rounded-lg shadow'; const taskName = document.createElement('h4'); taskName.className = 'text-md font-semibold text-slate-800 dark:text-slate-100 mb-1 truncate'; taskName.textContent = task.text; itemDiv.appendChild(taskName); if (typeof formatDuration === 'function') { const estimatedP = document.createElement('p'); estimatedP.className = 'text-sm text-slate-600 dark:text-slate-300'; estimatedP.innerHTML = `<strong>Estimated:</strong> ${formatDuration(task.estimatedHours, task.estimatedMinutes)}`; itemDiv.appendChild(estimatedP); } if (typeof formatMillisecondsToHMS === 'function') { const actualP = document.createElement('p'); actualP.className = 'text-sm text-slate-600 dark:text-slate-300'; actualP.innerHTML = `<strong>Actual:</strong> ${task.actualDurationMs > 0 ? formatMillisecondsToHMS(task.actualDurationMs) : 'Not recorded'}`; itemDiv.appendChild(actualP); } if (task.completedDate && typeof formatDate === 'function') { const completedOnP = document.createElement('p'); completedOnP.className = 'text-xs text-slate-400 dark:text-slate-500 mt-1'; completedOnP.textContent = `Completed on: ${formatDate(new Date(task.completedDate))}`; itemDiv.appendChild(completedOnP); } taskReviewContent.appendChild(itemDiv); });
}
export function openTooltipsGuideModal() { /* ... same as before, uses FeatureFlagService, showMessage ... */ 
    if (!isFeatureEnabled('tooltipsGuide')) { if(typeof showMessage === 'function') showMessage("Tooltips Guide feature is disabled.", "error"); return; } if (!tooltipsGuideModal || !modalDialogTooltipsGuide) { console.error("[OpenTooltipsGuideModal] Core tooltips modal elements not found."); return; } tooltipsGuideModal.classList.remove('hidden'); setTimeout(() => { modalDialogTooltipsGuide.classList.remove('scale-95', 'opacity-0'); modalDialogTooltipsGuide.classList.add('scale-100', 'opacity-100'); }, 10);
}
export function closeTooltipsGuideModal() { /* ... same as before ... */ 
    if (!modalDialogTooltipsGuide || !tooltipsGuideModal) return; modalDialogTooltipsGuide.classList.add('scale-95', 'opacity-0'); setTimeout(() => { tooltipsGuideModal.classList.add('hidden'); }, 200);
}

console.log("modal_interactions.js loaded as ES6 module.");
