// modal_interactions.js
// Manages modal dialogs (Add, Edit, View, Settings, etc.)

import AppStore from './store.js';
import { isFeatureEnabled } from './featureFlagService.js';
import ModalStateService from './modalStateService.js';
import { formatDate, formatTime, formatDuration, getTodayDateString, formatMillisecondsToHMS } from './utils.js';

// NEW: Import LoggingService
import LoggingService from './loggingService.js';

// Import functions from ui_rendering.js
import {
    populateDatalist,
    renderTempSubTasksForAddModal,
    renderSubTasksForEditModal,
    renderSubTasksForViewModal,
    renderTaskDependenciesForViewModal,
    showMessage // Assuming showMessage is exported from ui_rendering and handled by main.js if global
} from './ui_rendering.js';

// Import functions/objects from other modules
import { handleDeleteLabel, clearTempSubTasksForAddModal } from './ui_event_handlers.js';
import { ProjectsFeature } from './feature_projects.js';
import { TaskTimerSystemFeature } from './task_timer_system.js';
// ContactUsFeature is not directly needed here, but its elements are.
// AboutUsFeature is not directly needed here if modal open/close is generic enough.

export function openAddModal() {
    const functionName = 'openAddModal';
    LoggingService.debug(`[ModalInteractions] Attempting to open Add Task Modal.`, { functionName });

    const addTaskModalEl = document.getElementById('addTaskModal');
    const modalDialogAddEl = document.getElementById('modalDialogAdd');
    const modalTaskInputAddEl = document.getElementById('modalTaskInputAdd');
    const modalTodoFormAddEl = document.getElementById('modalTodoFormAdd');
    const modalPriorityInputAddEl = document.getElementById('modalPriorityInputAdd');
    // ... (other element gets remain the same)
    const existingLabelsDatalistEl = document.getElementById('existingLabels'); //
    const modalProjectSelectAddEl = document.getElementById('modalProjectSelectAdd'); //
    const modalEstHoursAddEl = document.getElementById('modalEstHoursAdd'); //
    const modalEstMinutesAddEl = document.getElementById('modalEstMinutesAdd'); //
    const modalRemindMeAddEl = document.getElementById('modalRemindMeAdd'); //
    const modalReminderDateAddEl = document.getElementById('modalReminderDateAdd'); //
    const modalReminderTimeAddEl = document.getElementById('modalReminderTimeAdd'); //
    const modalReminderEmailAddEl = document.getElementById('modalReminderEmailAdd'); //
    const reminderOptionsAddEl = document.getElementById('reminderOptionsAdd'); //
    const modalDueDateInputAddEl = document.getElementById('modalDueDateInputAdd'); //
    const modalSubTasksListAddEl = document.getElementById('modalSubTasksListAdd'); //
    const modalSubTaskInputAddEl = document.getElementById('modalSubTaskInputAdd'); //
    const taskDependenciesSectionAddEl = document.getElementById('taskDependenciesSectionAdd'); //


    if (!addTaskModalEl || !modalDialogAddEl || !modalTaskInputAddEl || !modalTodoFormAddEl || !modalPriorityInputAddEl) { //
        LoggingService.error("[ModalInteractions] Core Add Task modal elements not found in DOM.", new Error("DOMElementMissing"), { functionName });
        return; //
    }
    addTaskModalEl.classList.remove('hidden'); //
    setTimeout(() => { modalDialogAddEl.classList.remove('scale-95', 'opacity-0'); modalDialogAddEl.classList.add('scale-100', 'opacity-100'); }, 10); //
    modalTaskInputAddEl.focus(); //
    modalTodoFormAddEl.reset(); //
    modalPriorityInputAddEl.value = 'medium'; //

    if (existingLabelsDatalistEl) populateDatalist(existingLabelsDatalistEl); //

    if (isFeatureEnabled('projectFeature') && ProjectsFeature?.populateProjectDropdowns) { //
        ProjectsFeature.populateProjectDropdowns(); //
        if (modalProjectSelectAddEl) modalProjectSelectAddEl.value = "0"; //
    }
    if (isFeatureEnabled('taskTimerSystem')) { //
        if(modalEstHoursAddEl) modalEstHoursAddEl.value = ''; //
        if(modalEstMinutesAddEl) modalEstMinutesAddEl.value = ''; //
    }
    if (modalRemindMeAddEl) modalRemindMeAddEl.checked = false; //
    if (modalReminderDateAddEl) modalReminderDateAddEl.value = ''; //
    if (modalReminderTimeAddEl) modalReminderTimeAddEl.value = ''; //
    if (modalReminderEmailAddEl) modalReminderEmailAddEl.value = ''; //
    if (reminderOptionsAddEl) reminderOptionsAddEl.classList.add('hidden'); //

    const todayStr = getTodayDateString(); //
    if (modalDueDateInputAddEl) modalDueDateInputAddEl.min = todayStr; //
    if (modalReminderDateAddEl) modalReminderDateAddEl.min = todayStr; //

    clearTempSubTasksForAddModal(); //

    if (isFeatureEnabled('subTasksFeature') && modalSubTasksListAddEl) { //
        renderTempSubTasksForAddModal([], modalSubTasksListAddEl); //
        if(modalSubTaskInputAddEl) modalSubTaskInputAddEl.value = ''; //
    }
    if (taskDependenciesSectionAddEl) taskDependenciesSectionAddEl.classList.toggle('hidden', !isFeatureEnabled('taskDependenciesFeature')); //
    LoggingService.info(`[ModalInteractions] Add Task Modal opened.`, { functionName });
}

export function closeAddModal() {
    const functionName = 'closeAddModal';
    LoggingService.debug(`[ModalInteractions] Attempting to close Add Task Modal.`, { functionName });
    const addTaskModalEl = document.getElementById('addTaskModal'); //
    const modalDialogAddEl = document.getElementById('modalDialogAdd'); //
    const modalSubTasksListAddEl = document.getElementById('modalSubTasksListAdd'); //

    if (!modalDialogAddEl || !addTaskModalEl) { //
        LoggingService.warn(`[ModalInteractions] Add Task Modal elements not found for closing.`, { functionName });
        return;
    }
    modalDialogAddEl.classList.add('scale-95', 'opacity-0'); //
    setTimeout(() => { //
        addTaskModalEl.classList.add('hidden'); //
        clearTempSubTasksForAddModal(); //

        if(modalSubTasksListAddEl) modalSubTasksListAddEl.innerHTML = ''; //
        LoggingService.info(`[ModalInteractions] Add Task Modal closed.`, { functionName });
    }, 200); //
}

export function openViewEditModal(taskId) {
    const functionName = 'openViewEditModal';
    LoggingService.debug(`[ModalInteractions] Attempting to open View/Edit Modal for task ID: ${taskId}.`, { functionName, taskId });

    const viewEditTaskModalEl = document.getElementById('viewEditTaskModal'); //
    // ... (all other getElementById calls for this modal)
    const modalDialogViewEditEl = document.getElementById('modalDialogViewEdit'); //
    const modalViewEditTaskIdEl = document.getElementById('modalViewEditTaskId'); //
    const modalTaskInputViewEditEl = document.getElementById('modalTaskInputViewEdit'); //
    const modalDueDateInputViewEditEl = document.getElementById('modalDueDateInputViewEdit'); //
    const modalTimeInputViewEditEl = document.getElementById('modalTimeInputViewEdit'); //
    const modalEstHoursViewEditEl = document.getElementById('modalEstHoursViewEdit'); //
    const modalEstMinutesViewEditEl = document.getElementById('modalEstMinutesViewEdit'); //
    const modalPriorityInputViewEditEl = document.getElementById('modalPriorityInputViewEdit'); //
    const modalLabelInputViewEditEl = document.getElementById('modalLabelInputViewEdit'); //
    const existingLabelsEditDatalistEl = document.getElementById('existingLabelsEdit'); //
    const modalProjectSelectViewEditEl = document.getElementById('modalProjectSelectViewEdit'); //
    const modalNotesInputViewEditEl = document.getElementById('modalNotesInputViewEdit'); //
    const existingAttachmentsViewEditEl = document.getElementById('existingAttachmentsViewEdit'); //
    const modalRemindMeViewEditEl = document.getElementById('modalRemindMeViewEdit'); //
    const reminderOptionsViewEditEl = document.getElementById('reminderOptionsViewEdit'); //
    const modalReminderDateViewEditEl = document.getElementById('modalReminderDateViewEdit'); //
    const modalReminderTimeViewEditEl = document.getElementById('modalReminderTimeViewEdit'); //
    const modalReminderEmailViewEditEl = document.getElementById('modalReminderEmailViewEdit'); //
    const modalSubTasksListViewEditEl = document.getElementById('modalSubTasksListViewEdit'); //
    const modalSubTaskInputViewEditEl = document.getElementById('modalSubTaskInputViewEdit'); //
    const taskDependenciesSectionViewEditEl = document.getElementById('taskDependenciesSectionViewEdit'); //


    if (!AppStore || typeof AppStore.getTasks !== 'function' || !ModalStateService) { //
        LoggingService.error("[ModalInteractions] Core dependencies (AppStore, ModalStateService) not available.", new Error("CoreDependenciesMissing"), { functionName, taskId });
        return; //
    }
    const currentTasks = AppStore.getTasks(); //
    const task = currentTasks.find(t => t.id === taskId); //
    if (!task) { //
        LoggingService.error(`[ModalInteractions] Task with ID ${taskId} not found for View/Edit Modal.`, new Error("TaskNotFound"), { functionName, taskId });
        return;
    }

    ModalStateService.setEditingTaskId(taskId); //

    // ... (rest of the field population logic - keep as is, but you can add debug logs if a field is unexpectedly not set)
    if (modalViewEditTaskIdEl) modalViewEditTaskIdEl.value = task.id; //
    if (modalTaskInputViewEditEl) modalTaskInputViewEditEl.value = task.text; //
    if (modalDueDateInputViewEditEl) modalDueDateInputViewEditEl.value = task.dueDate || ''; //
    if (modalTimeInputViewEditEl) modalTimeInputViewEditEl.value = task.time || ''; //

    if (isFeatureEnabled('taskTimerSystem')) { //
        if (modalEstHoursViewEditEl) modalEstHoursViewEditEl.value = task.estimatedHours || ''; //
        if (modalEstMinutesViewEditEl) modalEstMinutesViewEditEl.value = task.estimatedMinutes || ''; //
    }

    if (modalPriorityInputViewEditEl) modalPriorityInputViewEditEl.value = task.priority; //
    if (modalLabelInputViewEditEl) modalLabelInputViewEditEl.value = task.label || ''; //
    if (existingLabelsEditDatalistEl) populateDatalist(existingLabelsEditDatalistEl); //

    if (isFeatureEnabled('projectFeature') && ProjectsFeature?.populateProjectDropdowns) { //
        ProjectsFeature.populateProjectDropdowns(); //
        if (modalProjectSelectViewEditEl) modalProjectSelectViewEditEl.value = task.projectId || "0"; //
    }

    if (modalNotesInputViewEditEl) modalNotesInputViewEditEl.value = task.notes || ''; //

    if (isFeatureEnabled('fileAttachments') && existingAttachmentsViewEditEl) { //
        existingAttachmentsViewEditEl.textContent = task.attachments && task.attachments.length > 0 ? `${task.attachments.length} file(s) attached (management UI coming soon)` : 'No files attached yet.'; //
    }

    if (isFeatureEnabled('reminderFeature') && modalRemindMeViewEditEl) { //
        modalRemindMeViewEditEl.checked = task.isReminderSet || false; //
        if (reminderOptionsViewEditEl) reminderOptionsViewEditEl.classList.toggle('hidden', !modalRemindMeViewEditEl.checked); //
        if (modalRemindMeViewEditEl.checked) { //
            if (modalReminderDateViewEditEl) modalReminderDateViewEditEl.value = task.reminderDate || ''; //
            if (modalReminderTimeViewEditEl) modalReminderTimeViewEditEl.value = task.reminderTime || ''; //
            if (modalReminderEmailViewEditEl) modalReminderEmailViewEditEl.value = task.reminderEmail || ''; //
        } else { //
            if (modalReminderDateViewEditEl) modalReminderDateViewEditEl.value = ''; //
            if (modalReminderTimeViewEditEl) modalReminderTimeViewEditEl.value = ''; //
            if (modalReminderEmailViewEditEl) modalReminderEmailViewEditEl.value = ''; //
        }
    } else if (reminderOptionsViewEditEl) { //
        if (modalRemindMeViewEditEl) modalRemindMeViewEditEl.checked = false; //
        reminderOptionsViewEditEl.classList.add('hidden'); //
    }

    const todayStr = getTodayDateString(); //
    if(modalDueDateInputViewEditEl) modalDueDateInputViewEditEl.min = todayStr; //
    if (modalReminderDateViewEditEl) modalReminderDateViewEditEl.min = todayStr; //

    if (isFeatureEnabled('subTasksFeature') && modalSubTasksListViewEditEl) { //
        renderSubTasksForEditModal(taskId, modalSubTasksListViewEditEl); //
        if(modalSubTaskInputViewEditEl) modalSubTaskInputViewEditEl.value = ''; //
    }
    if (taskDependenciesSectionViewEditEl) taskDependenciesSectionViewEditEl.classList.toggle('hidden', !isFeatureEnabled('taskDependenciesFeature')); //


    if (!viewEditTaskModalEl || !modalDialogViewEditEl) { //
        LoggingService.error("[ModalInteractions] Core View/Edit modal DOM elements not found.", new Error("DOMElementMissing"), { functionName, taskId });
        return;
    }
    viewEditTaskModalEl.classList.remove('hidden'); //
    setTimeout(() => { modalDialogViewEditEl.classList.remove('scale-95', 'opacity-0'); modalDialogViewEditEl.classList.add('scale-100', 'opacity-100'); }, 10); //
    if(modalTaskInputViewEditEl) modalTaskInputViewEditEl.focus(); //
    LoggingService.info(`[ModalInteractions] View/Edit Modal opened for task ID: ${taskId}.`, { functionName, taskId });
}

export function closeViewEditModal() {
    const functionName = 'closeViewEditModal';
    LoggingService.debug(`[ModalInteractions] Attempting to close View/Edit Modal.`, { functionName, editingTaskId: ModalStateService.getEditingTaskId() });
    const viewEditTaskModalEl = document.getElementById('viewEditTaskModal'); //
    const modalDialogViewEditEl = document.getElementById('modalDialogViewEdit'); //
    if (!modalDialogViewEditEl || !viewEditTaskModalEl) { //
        LoggingService.warn(`[ModalInteractions] View/Edit Modal elements not found for closing.`, { functionName });
        return;
    }
    modalDialogViewEditEl.classList.add('scale-95', 'opacity-0'); //
    setTimeout(() => { //
        viewEditTaskModalEl.classList.add('hidden'); //
        if (ModalStateService) ModalStateService.setEditingTaskId(null); //
        LoggingService.info(`[ModalInteractions] View/Edit Modal closed.`, { functionName });
    }, 200); //
}

export function openViewTaskDetailsModal(taskId) {
    const functionName = 'openViewTaskDetailsModal';
    LoggingService.debug(`[ModalInteractions] Attempting to open View Task Details Modal for task ID: ${taskId}.`, { functionName, taskId });

    const viewTaskDetailsModalEl = document.getElementById('viewTaskDetailsModal'); 
    const modalDialogViewDetailsEl = document.getElementById('modalDialogViewDetails'); 
    const viewTaskTextEl = document.getElementById('viewTaskText'); 
    const viewTaskDueDateEl = document.getElementById('viewTaskDueDate');
    const viewTaskTimeEl = document.getElementById('viewTaskTime');
    const viewTaskEstDurationEl = document.getElementById('viewTaskEstDuration');
    const viewTaskPriorityEl = document.getElementById('viewTaskPriority');
    const viewTaskStatusEl = document.getElementById('viewTaskStatus');
    const viewTaskLabelEl = document.getElementById('viewTaskLabel');
    const viewTaskProjectEl = document.getElementById('viewTaskProject');
    const viewTaskNotesEl = document.getElementById('viewTaskNotes');
    const viewTaskReminderSectionEl = document.getElementById('viewTaskReminderSection');
    const viewTaskReminderStatusEl = document.getElementById('viewTaskReminderStatus');
    const viewTaskReminderDetailsEl = document.getElementById('viewTaskReminderDetails');
    const viewTaskReminderDateEl = document.getElementById('viewTaskReminderDate');
    const viewTaskReminderTimeEl = document.getElementById('viewTaskReminderTime');
    const viewTaskReminderEmailEl = document.getElementById('viewTaskReminderEmail');
    const viewTaskAttachmentsSectionEl = document.getElementById('viewTaskAttachmentsSection');
    const viewTaskAttachmentsListEl = document.getElementById('viewTaskAttachmentsList');
    const taskTimerSectionEl = document.getElementById('taskTimerSection');
    const subTasksSectionViewDetailsEl = document.getElementById('subTasksSectionViewDetails');
    const modalSubTasksListViewDetailsEl = document.getElementById('modalSubTasksListViewDetails');
    const viewSubTaskProgressEl = document.getElementById('viewSubTaskProgress');
    const noSubTasksMessageViewDetailsEl = document.getElementById('noSubTasksMessageViewDetails');
    const viewTaskDependenciesSectionEl = document.getElementById('viewTaskDependenciesSection');
    const viewTaskDependsOnListEl = document.getElementById('viewTaskDependsOnList');
    const viewTaskBlocksTasksListEl = document.getElementById('viewTaskBlocksTasksList');


    if (!AppStore || typeof AppStore.getTasks !== 'function' || !ModalStateService) { 
        LoggingService.error("[ModalInteractions] Core dependencies not available for View Task Details.", new Error("CoreDependenciesMissing"), { functionName, taskId });
        return;
    }
    const currentTasks = AppStore.getTasks(); 
    const task = currentTasks.find(t => t.id === taskId); 
    if (!task) { 
        LoggingService.error(`[ModalInteractions] Task with ID ${taskId} not found for View Task Details Modal.`, new Error("TaskNotFound"), { functionName, taskId });
        return;
    }
    ModalStateService.setCurrentViewTaskId(taskId); 

    if(viewTaskTextEl) viewTaskTextEl.textContent = task.text; else LoggingService.warn(`[${functionName}] viewTaskTextEl not found.`, {taskId});
    if(viewTaskDueDateEl) viewTaskDueDateEl.textContent = task.dueDate ? formatDate(task.dueDate) : 'Not set';
    if(viewTaskTimeEl) viewTaskTimeEl.textContent = task.time ? formatTime(task.time) : 'Not set';
    
    if (isFeatureEnabled('taskTimerSystem') && viewTaskEstDurationEl) {
        viewTaskEstDurationEl.textContent = formatDuration(task.estimatedHours, task.estimatedMinutes);
        if(taskTimerSectionEl) taskTimerSectionEl.classList.remove('hidden');
        if (TaskTimerSystemFeature?.setupTimerForModal) TaskTimerSystemFeature.setupTimerForModal(task);
    } else if (taskTimerSectionEl) {
        taskTimerSectionEl.classList.add('hidden');
    }

    if(viewTaskPriorityEl) viewTaskPriorityEl.textContent = task.priority || 'Not set';
    if(viewTaskStatusEl) viewTaskStatusEl.textContent = task.completed ? 'Completed' : 'Active';
    if(viewTaskLabelEl) viewTaskLabelEl.textContent = task.label || 'None';

    if (isFeatureEnabled('projectFeature') && viewTaskProjectEl) {
        const project = AppStore.getProjects().find(p => p.id === task.projectId);
        viewTaskProjectEl.textContent = project ? project.name : 'No Project';
        viewTaskProjectEl.closest('div.project-feature-element')?.classList.remove('hidden');
    } else if (viewTaskProjectEl) {
         viewTaskProjectEl.closest('div.project-feature-element')?.classList.add('hidden');
    }
    
    if(viewTaskNotesEl) viewTaskNotesEl.textContent = task.notes || 'No notes added.';

    if (isFeatureEnabled('reminderFeature') && viewTaskReminderSectionEl) {
        viewTaskReminderSectionEl.classList.remove('hidden');
        if(viewTaskReminderStatusEl) viewTaskReminderStatusEl.textContent = task.isReminderSet ? 'Set' : 'Not set';
        if (viewTaskReminderDetailsEl) viewTaskReminderDetailsEl.classList.toggle('hidden', !task.isReminderSet);
        if (task.isReminderSet) {
            if(viewTaskReminderDateEl) viewTaskReminderDateEl.textContent = task.reminderDate ? formatDate(task.reminderDate) : 'N/A';
            if(viewTaskReminderTimeEl) viewTaskReminderTimeEl.textContent = task.reminderTime ? formatTime(task.reminderTime) : 'N/A';
            if(viewTaskReminderEmailEl) viewTaskReminderEmailEl.textContent = task.reminderEmail || 'N/A';
        }
    } else if (viewTaskReminderSectionEl) {
        viewTaskReminderSectionEl.classList.add('hidden');
    }

    if(isFeatureEnabled('fileAttachments') && viewTaskAttachmentsSectionEl) {
        viewTaskAttachmentsSectionEl.classList.remove('hidden');
        if(viewTaskAttachmentsListEl) viewTaskAttachmentsListEl.textContent = task.attachments && task.attachments.length > 0 ? `(${task.attachments.length}) files (UI coming soon)` : 'No attachments.';
    } else if (viewTaskAttachmentsSectionEl) {
        viewTaskAttachmentsSectionEl.classList.add('hidden');
    }
    
    if (isFeatureEnabled('subTasksFeature') && subTasksSectionViewDetailsEl) {
        subTasksSectionViewDetailsEl.classList.remove('hidden');
        renderSubTasksForViewModal(taskId, modalSubTasksListViewDetailsEl, viewSubTaskProgressEl, noSubTasksMessageViewDetailsEl);
    } else if (subTasksSectionViewDetailsEl) {
        subTasksSectionViewDetailsEl.classList.add('hidden');
    }

    if (isFeatureEnabled('taskDependenciesFeature') && viewTaskDependenciesSectionEl) {
        viewTaskDependenciesSectionEl.classList.remove('hidden');
        renderTaskDependenciesForViewModal(task);
    } else if (viewTaskDependenciesSectionEl) {
         viewTaskDependenciesSectionEl.classList.add('hidden');
    }

    if (!viewTaskDetailsModalEl || !modalDialogViewDetailsEl) { 
        LoggingService.error("[ModalInteractions] Core View Task Details modal DOM elements not found.", new Error("DOMElementMissing"), { functionName, taskId });
        return;
    }
    viewTaskDetailsModalEl.classList.remove('hidden'); 
    setTimeout(() => { modalDialogViewDetailsEl.classList.remove('scale-95', 'opacity-0'); modalDialogViewDetailsEl.classList.add('scale-100', 'opacity-100'); }, 10); 
    LoggingService.info(`[ModalInteractions] View Task Details Modal opened for task ID: ${taskId}.`, { functionName, taskId });
}

export function closeViewTaskDetailsModal() {
    const functionName = 'closeViewTaskDetailsModal';
    LoggingService.debug(`[ModalInteractions] Attempting to close View Task Details Modal.`, { functionName, viewingTaskId: ModalStateService.getCurrentViewTaskId() });
    const viewTaskDetailsModalEl = document.getElementById('viewTaskDetailsModal'); //
    const modalDialogViewDetailsEl = document.getElementById('modalDialogViewDetails'); //
    if (!modalDialogViewDetailsEl || !viewTaskDetailsModalEl) { //
        LoggingService.warn(`[ModalInteractions] View Task Details Modal elements not found for closing.`, { functionName });
        return;
    }
    modalDialogViewDetailsEl.classList.add('scale-95', 'opacity-0'); //
    setTimeout(() => { //
        viewTaskDetailsModalEl.classList.add('hidden'); //
        if (isFeatureEnabled('taskTimerSystem') && TaskTimerSystemFeature?.clearTimerOnModalClose) { //
            TaskTimerSystemFeature.clearTimerOnModalClose(); //
        }
        if (ModalStateService) ModalStateService.setCurrentViewTaskId(null); //
        LoggingService.info(`[ModalInteractions] View Task Details Modal closed.`, { functionName });
    }, 200); //
}

export function openManageLabelsModal() {
    const functionName = 'openManageLabelsModal';
    LoggingService.debug(`[ModalInteractions] Attempting to open Manage Labels Modal.`, { functionName });
    const manageLabelsModalEl = document.getElementById('manageLabelsModal'); //
    const modalDialogManageLabelsEl = document.getElementById('modalDialogManageLabels'); //
    const newLabelInputEl = document.getElementById('newLabelInput'); //
    if (!manageLabelsModalEl || !modalDialogManageLabelsEl || !newLabelInputEl) { //
        LoggingService.error("[ModalInteractions] Core Manage Labels modal DOM elements not found.", new Error("DOMElementMissing"), { functionName });
        return;
    }
    populateManageLabelsList(); //
    manageLabelsModalEl.classList.remove('hidden'); //
    setTimeout(() => { modalDialogManageLabelsEl.classList.remove('scale-95', 'opacity-0'); modalDialogManageLabelsEl.classList.add('scale-100', 'opacity-100'); }, 10); //
    newLabelInputEl.focus(); //
    LoggingService.info(`[ModalInteractions] Manage Labels Modal opened.`, { functionName });
}

export function closeManageLabelsModal() {
    const functionName = 'closeManageLabelsModal';
    LoggingService.debug(`[ModalInteractions] Attempting to close Manage Labels Modal.`, { functionName });
    const manageLabelsModalEl = document.getElementById('manageLabelsModal'); //
    const modalDialogManageLabelsEl = document.getElementById('modalDialogManageLabels'); //
    if (!modalDialogManageLabelsEl || !manageLabelsModalEl) { //
        LoggingService.warn(`[ModalInteractions] Manage Labels Modal elements not found for closing.`, { functionName });
        return;
    }
    modalDialogManageLabelsEl.classList.add('scale-95', 'opacity-0'); //
    setTimeout(() => { manageLabelsModalEl.classList.add('hidden'); LoggingService.info(`[ModalInteractions] Manage Labels Modal closed.`, { functionName }); }, 200); //
}

export function populateManageLabelsList() {
    const functionName = 'populateManageLabelsList';
    const existingLabelsListEl = document.getElementById('existingLabelsList'); //
    if (!existingLabelsListEl || !AppStore || typeof AppStore.getUniqueLabels !== 'function') { //
        LoggingService.error("[ModalInteractions] Cannot populate manage labels list. Dependencies missing.", new Error("CoreDependenciesMissing"), { functionName, existingLabelsListElFound: !!existingLabelsListEl, AppStoreAvailable: !!AppStore });
         if(existingLabelsListEl) existingLabelsListEl.innerHTML = '<li class="text-slate-500 dark:text-slate-400 text-center">Error loading labels.</li>'; //
        return; //
    }
    const currentUniqueLabels = AppStore.getUniqueLabels(); //
    existingLabelsListEl.innerHTML = ''; //
    currentUniqueLabels.forEach(label => { //
        const li = document.createElement('li'); //
        li.className = 'flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700 rounded-md'; //
        const span = document.createElement('span'); //
        span.textContent = label.charAt(0).toUpperCase() + label.slice(1); //
        span.className = 'text-slate-700 dark:text-slate-200'; //
        li.appendChild(span); //
        const deleteBtn = document.createElement('button'); //
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt text-red-500 hover:text-red-700"></i>'; //
        deleteBtn.className = 'p-1'; //
        deleteBtn.title = `Delete label "${label}"`; //
        deleteBtn.addEventListener('click', () => handleDeleteLabel(label)); // Uses imported handleDeleteLabel
        li.appendChild(deleteBtn); //
        existingLabelsListEl.appendChild(li); //
    });
    if (currentUniqueLabels.length === 0) { //
        existingLabelsListEl.innerHTML = '<li class="text-slate-500 dark:text-slate-400 text-center">No labels created yet.</li>'; //
    }
    LoggingService.debug(`[ModalInteractions] Manage Labels list populated with ${currentUniqueLabels.length} labels.`, { functionName, labelCount: currentUniqueLabels.length });
}

export function openSettingsModal() {
    const functionName = 'openSettingsModal';
    LoggingService.debug(`[ModalInteractions] Attempting to open Settings Modal.`, { functionName });
    const settingsModalEl = document.getElementById('settingsModal'); //
    const modalDialogSettingsEl = document.getElementById('modalDialogSettings'); //

    if (!settingsModalEl || !modalDialogSettingsEl) { //
        LoggingService.error("[ModalInteractions] Core Settings modal DOM elements not found.", new Error("DOMElementMissing"), { functionName });
        return;
    }
    settingsModalEl.classList.remove('hidden'); //
    setTimeout(() => { modalDialogSettingsEl.classList.remove('scale-95', 'opacity-0'); modalDialogSettingsEl.classList.add('scale-100', 'opacity-100'); }, 10); //
    LoggingService.info(`[ModalInteractions] Settings Modal opened.`, { functionName });
    // updateClearCompletedButtonState is called via event in ui_rendering.js
}

export function closeSettingsModal() {
    const functionName = 'closeSettingsModal';
    LoggingService.debug(`[ModalInteractions] Attempting to close Settings Modal.`, { functionName });
    const settingsModalEl = document.getElementById('settingsModal'); //
    const modalDialogSettingsEl = document.getElementById('modalDialogSettings'); //
    if (!modalDialogSettingsEl || !settingsModalEl) { //
        LoggingService.warn(`[ModalInteractions] Settings Modal elements not found for closing.`, { functionName });
        return;
    }
    modalDialogSettingsEl.classList.add('scale-95', 'opacity-0'); //
    setTimeout(() => { settingsModalEl.classList.add('hidden'); LoggingService.info(`[ModalInteractions] Settings Modal closed.`, { functionName }); }, 200); //
}

export function openTaskReviewModal() {
    const functionName = 'openTaskReviewModal';
    LoggingService.debug(`[ModalInteractions] Attempting to open Task Review Modal.`, { functionName });
    const taskReviewModalEl = document.getElementById('taskReviewModal'); //
    const modalDialogTaskReviewEl = document.getElementById('modalDialogTaskReview'); //
    if (!isFeatureEnabled('taskTimerSystem')) { //
        LoggingService.warn(`[ModalInteractions] Task Timer System feature is disabled. Cannot open Task Review Modal.`, { functionName });
        showMessage("Task Timer System feature is currently disabled.", "error"); //
        return; //
    }
    if (!taskReviewModalEl || !modalDialogTaskReviewEl) { //
        LoggingService.error("[ModalInteractions] Core Task Review modal DOM elements not found.", new Error("DOMElementMissing"), { functionName });
        return;
    }
    populateTaskReviewModal(); // Call local helper //
    taskReviewModalEl.classList.remove('hidden'); //
    setTimeout(() => { modalDialogTaskReviewEl.classList.remove('scale-95', 'opacity-0'); modalDialogTaskReviewEl.classList.add('scale-100', 'opacity-100'); }, 10); //
    LoggingService.info(`[ModalInteractions] Task Review Modal opened.`, { functionName });
}

export function closeTaskReviewModal() {
    const functionName = 'closeTaskReviewModal';
    LoggingService.debug(`[ModalInteractions] Attempting to close Task Review Modal.`, { functionName });
    const taskReviewModalEl = document.getElementById('taskReviewModal'); //
    const modalDialogTaskReviewEl = document.getElementById('modalDialogTaskReview'); //
    if (!modalDialogTaskReviewEl || !taskReviewModalEl) { //
        LoggingService.warn(`[ModalInteractions] Task Review Modal elements not found for closing.`, { functionName });
        return;
    }
    modalDialogTaskReviewEl.classList.add('scale-95', 'opacity-0'); //
    setTimeout(() => { taskReviewModalEl.classList.add('hidden'); LoggingService.info(`[ModalInteractions] Task Review Modal closed.`, { functionName }); }, 200); //
}

function populateTaskReviewModal() {
    const functionName = 'populateTaskReviewModal';
    const taskReviewContentEl = document.getElementById('taskReviewContent'); //
    if (!taskReviewContentEl || !AppStore || typeof AppStore.getTasks !== 'function') { //
        LoggingService.error("[ModalInteractions] Cannot populate task review modal. Dependencies missing.", new Error("CoreDependenciesMissing"), { functionName, taskReviewContentElFound: !!taskReviewContentEl, AppStoreAvailable: !!AppStore });
        if(taskReviewContentEl) taskReviewContentEl.innerHTML = '<p class="text-slate-500 dark:text-slate-400 text-center">Error loading task review data.</p>';
        return;
    }
    taskReviewContentEl.innerHTML = ''; //
    const currentTasks = AppStore.getTasks(); //
    const completedTasksWithTime = currentTasks.filter(task => task.completed && ((task.estimatedHours && task.estimatedHours > 0) || (task.estimatedMinutes && task.estimatedMinutes > 0) || (task.actualDurationMs && task.actualDurationMs > 0))).sort((a,b) => (b.completedDate || 0) - (a.completedDate || 0)); //
    
    if (completedTasksWithTime.length === 0) { //
        taskReviewContentEl.innerHTML = '<p class="text-slate-500 dark:text-slate-400 text-center">No completed tasks with time data.</p>'; //
        LoggingService.debug(`[ModalInteractions] Task Review populated: No completed tasks with time data.`, { functionName });
        return; //
    }
    completedTasksWithTime.forEach(task => { //
        const itemDiv = document.createElement('div'); //
        itemDiv.className = 'p-3 bg-slate-50 dark:bg-slate-700 rounded-lg shadow'; //
        const taskName = document.createElement('h4'); //
        taskName.className = 'text-md font-semibold text-slate-800 dark:text-slate-100 mb-1 truncate'; //
        taskName.textContent = task.text; //
        itemDiv.appendChild(taskName); //
        if (typeof formatDuration === 'function') { //
            const estimatedP = document.createElement('p'); //
            estimatedP.className = 'text-sm text-slate-600 dark:text-slate-300'; //
            estimatedP.innerHTML = `<strong>Estimated:</strong> ${formatDuration(task.estimatedHours, task.estimatedMinutes)}`; //
            itemDiv.appendChild(estimatedP); //
        }
        if (typeof formatMillisecondsToHMS === 'function') { //
            const actualP = document.createElement('p'); //
            actualP.className = 'text-sm text-slate-600 dark:text-slate-300'; //
            actualP.innerHTML = `<strong>Actual:</strong> ${task.actualDurationMs > 0 ? formatMillisecondsToHMS(task.actualDurationMs) : 'Not recorded'}`; //
            itemDiv.appendChild(actualP); //
        }
        if (task.completedDate && typeof formatDate === 'function') { //
            const completedOnP = document.createElement('p'); //
            completedOnP.className = 'text-xs text-slate-400 dark:text-slate-500 mt-1'; //
            completedOnP.textContent = `Completed on: ${formatDate(new Date(task.completedDate))}`; // formatDate expects Date object or string //
            itemDiv.appendChild(completedOnP); //
        }
        taskReviewContentEl.appendChild(itemDiv); //
    });
    LoggingService.debug(`[ModalInteractions] Task Review populated with ${completedTasksWithTime.length} tasks.`, { functionName, taskCount: completedTasksWithTime.length });
}

export function openTooltipsGuideModal() {
    const functionName = 'openTooltipsGuideModal';
    LoggingService.debug(`[ModalInteractions] Attempting to open Tooltips Guide Modal.`, { functionName });
    const tooltipsGuideModalEl = document.getElementById('tooltipsGuideModal'); //
    const modalDialogTooltipsGuideEl = document.getElementById('modalDialogTooltipsGuide'); //
    if (!isFeatureEnabled('tooltipsGuide')) { //
        LoggingService.warn(`[ModalInteractions] Tooltips Guide feature is disabled. Cannot open modal.`, { functionName });
        showMessage("Tooltips Guide feature is disabled.", "error"); //
        return; //
    }
    if (!tooltipsGuideModalEl || !modalDialogTooltipsGuideEl) { //
        LoggingService.error("[ModalInteractions] Core Tooltips Guide modal DOM elements not found.", new Error("DOMElementMissing"), { functionName });
        return;
    }
    tooltipsGuideModalEl.classList.remove('hidden'); //
    setTimeout(() => { modalDialogTooltipsGuideEl.classList.remove('scale-95', 'opacity-0'); modalDialogTooltipsGuideEl.classList.add('scale-100', 'opacity-100'); }, 10); //
    LoggingService.info(`[ModalInteractions] Tooltips Guide Modal opened.`, { functionName });
}

export function closeTooltipsGuideModal() {
    const functionName = 'closeTooltipsGuideModal';
    LoggingService.debug(`[ModalInteractions] Attempting to close Tooltips Guide Modal.`, { functionName });
    const tooltipsGuideModalEl = document.getElementById('tooltipsGuideModal'); //
    const modalDialogTooltipsGuideEl = document.getElementById('modalDialogTooltipsGuide'); //
    if (!modalDialogTooltipsGuideEl || !tooltipsGuideModalEl) { //
        LoggingService.warn(`[ModalInteractions] Tooltips Guide Modal elements not found for closing.`, { functionName });
        return;
    }
    modalDialogTooltipsGuideEl.classList.add('scale-95', 'opacity-0'); //
    setTimeout(() => { tooltipsGuideModalEl.classList.add('hidden'); LoggingService.info(`[ModalInteractions] Tooltips Guide Modal closed.`, { functionName }); }, 200); //
}

// --- New Contact Us Modal Interactions ---
export function openContactUsModal() {
    const functionName = 'openContactUsModal (ModalInteractions)';
    LoggingService.debug(`[ModalInteractions] Attempting to open Contact Us Modal.`, { functionName });

    const contactUsModalEl = document.getElementById('contactUsModal');
    const modalDialogContactUsEl = document.getElementById('modalDialogContactUs');
    const contactNameInputEl = document.getElementById('contactNameInput'); // Assuming this ID for the name input

    if (!isFeatureEnabled('contactUsFeature')) {
        LoggingService.warn('[ModalInteractions] Contact Us feature is disabled. Cannot open modal.', { functionName });
        showMessage("Contact Us feature is currently disabled.", "info");
        return;
    }
    if (!contactUsModalEl || !modalDialogContactUsEl) {
        LoggingService.error("[ModalInteractions] Core Contact Us modal DOM elements not found.", new Error("DOMElementMissing"), { functionName });
        return;
    }
    contactUsModalEl.classList.remove('hidden');
    setTimeout(() => {
        modalDialogContactUsEl.classList.remove('scale-95', 'opacity-0');
        modalDialogContactUsEl.classList.add('scale-100', 'opacity-100');
    }, 10);
    if (contactNameInputEl) {
        contactNameInputEl.focus();
    }
    LoggingService.info(`[ModalInteractions] Contact Us Modal opened.`, { functionName });
}

export function closeContactUsModal() {
    const functionName = 'closeContactUsModal (ModalInteractions)';
    LoggingService.debug(`[ModalInteractions] Attempting to close Contact Us Modal.`, { functionName });

    const contactUsModalEl = document.getElementById('contactUsModal');
    const modalDialogContactUsEl = document.getElementById('modalDialogContactUs');
    const contactUsFormEl = document.getElementById('contactUsForm');

    if (!contactUsModalEl || !modalDialogContactUsEl) {
        LoggingService.warn("[ModalInteractions] Contact Us Modal DOM elements not found for closing.", { functionName });
        return;
    }
    modalDialogContactUsEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        contactUsModalEl.classList.add('hidden');
        if (contactUsFormEl) {
            contactUsFormEl.reset(); // Reset the form on close
        }
        LoggingService.info(`[ModalInteractions] Contact Us Modal closed.`, { functionName });
    }, 200);
}

// --- ADDED: About Us Modal Interactions ---
export function openAboutUsModal() {
    const functionName = 'openAboutUsModal (ModalInteractions)';
    LoggingService.debug(`[ModalInteractions] Attempting to open About Us Modal.`, { functionName });

    const aboutUsModalEl = document.getElementById('aboutUsModal');
    const modalDialogAboutUsEl = document.getElementById('modalDialogAboutUs');
    // Optional: focus an element inside, but for a static modal, it might not be necessary.

    if (!isFeatureEnabled('aboutUsFeature')) {
        LoggingService.warn('[ModalInteractions] About Us feature is disabled. Cannot open modal.', { functionName });
        if (typeof showMessage === 'function') showMessage("About Us feature is currently disabled.", "info");
        return;
    }
    if (!aboutUsModalEl || !modalDialogAboutUsEl) {
        LoggingService.error("[ModalInteractions] Core About Us modal DOM elements not found.", new Error("DOMElementMissing"), { functionName });
        return;
    }
    aboutUsModalEl.classList.remove('hidden');
    setTimeout(() => {
        modalDialogAboutUsEl.classList.remove('scale-95', 'opacity-0');
        modalDialogAboutUsEl.classList.add('scale-100', 'opacity-100');
    }, 10);
    LoggingService.info(`[ModalInteractions] About Us Modal opened.`, { functionName });
}

export function closeAboutUsModal() {
    const functionName = 'closeAboutUsModal (ModalInteractions)';
    LoggingService.debug(`[ModalInteractions] Attempting to close About Us Modal.`, { functionName });

    const aboutUsModalEl = document.getElementById('aboutUsModal');
    const modalDialogAboutUsEl = document.getElementById('modalDialogAboutUs');

    if (!aboutUsModalEl || !modalDialogAboutUsEl) {
        LoggingService.warn("[ModalInteractions] About Us Modal DOM elements not found for closing.", { functionName });
        return;
    }
    modalDialogAboutUsEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        aboutUsModalEl.classList.add('hidden');
        LoggingService.info(`[ModalInteractions] About Us Modal closed.`, { functionName });
    }, 200);
}


// MODIFIED: Use LoggingService
LoggingService.debug("modal_interactions.js loaded, uses getElementById, imports, and new tempSubTask clearing.", { module: 'modal_interactions' });