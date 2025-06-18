// modal_interactions.js
// Manages modal dialogs (Add, Edit, View, Settings, etc.)

import AppStore from './store.js';
// import { isFeatureEnabled } from './featureFlagService.js'; // REMOVED
import ModalStateService from './modalStateService.js';
import { formatDate, formatTime, formatDuration, getTodayDateString, formatMillisecondsToHMS } from './utils.js';
import EventBus from './eventBus.js';

import LoggingService from './loggingService.js';

import {
    populateDatalist,
    renderTempSubTasksForAddModal,
    renderSubTasksForEditModal,
    renderSubTasksForViewModal,
    renderTaskDependenciesForViewModal,
    renderVersionHistoryList 
} from './ui_rendering.js';

import { handleDeleteLabel, clearTempSubTasksForAddModal } from './ui_event_handlers.js';
import { ProjectsFeature } from './feature_projects.js';
import { TaskTimerSystemFeature } from './task_timer_system.js';
import { DataVersioningFeature } from './feature_data_versioning.js';
import { DesktopNotificationsFeature } from './feature_desktop_notifications.js';
import { AdvancedRecurrenceFeature } from './feature_advanced_recurrence.js';


export function openAddModal() {
    const functionName = 'openAddModal';
    LoggingService.debug(`[ModalInteractions] Attempting to open Add Task Modal.`, { functionName });

    const addTaskModalEl = document.getElementById('addTaskModal');
    const modalDialogAddEl = document.getElementById('modalDialogAdd');
    const modalTaskInputAddEl = document.getElementById('modalTaskInputAdd');
    const modalTodoFormAddEl = document.getElementById('modalTodoFormAdd');
    const modalPriorityInputAddEl = document.getElementById('modalPriorityInputAdd');
    const existingLabelsDatalistEl = document.getElementById('existingLabels'); 
    const modalProjectSelectAddEl = document.getElementById('modalProjectSelectAdd'); 
    const modalEstHoursAddEl = document.getElementById('modalEstHoursAdd'); 
    const modalEstMinutesAddEl = document.getElementById('modalEstMinutesAdd'); 
    const modalRemindMeAddEl = document.getElementById('modalRemindMeAdd'); 
    const modalReminderDateAddEl = document.getElementById('modalReminderDateAdd'); 
    const modalReminderTimeAddEl = document.getElementById('modalReminderTimeAdd'); 
    const modalReminderEmailAddEl = document.getElementById('modalReminderEmailAdd'); 
    const reminderOptionsAddEl = document.getElementById('reminderOptionsAdd'); 
    const modalDueDateInputAddEl = document.getElementById('modalDueDateInputAdd'); 
    const modalSubTasksListAddEl = document.getElementById('modalSubTasksListAdd'); 
    const modalSubTaskInputAddEl = document.getElementById('modalSubTaskInputAdd'); 
    const taskDependenciesSectionAddEl = document.getElementById('taskDependenciesSectionAdd'); 
    const modalRecurrenceAddEl = document.getElementById('modalRecurrenceAdd');
    const recurrenceOptionsAddEl = document.getElementById('recurrenceOptionsAdd');
    const recurrenceEndDateAddEl = document.getElementById('recurrenceEndDateAdd');


    if (!addTaskModalEl || !modalDialogAddEl || !modalTaskInputAddEl || !modalTodoFormAddEl || !modalPriorityInputAddEl) { 
        LoggingService.error("[ModalInteractions] Core Add Task modal elements not found in DOM.", new Error("DOMElementMissing"), { functionName });
        return; 
    }
    addTaskModalEl.classList.remove('hidden'); 
    setTimeout(() => { modalDialogAddEl.classList.remove('scale-95', 'opacity-0'); modalDialogAddEl.classList.add('scale-100', 'opacity-100'); }, 10); 
    modalTaskInputAddEl.focus(); 
    modalTodoFormAddEl.reset(); 
    modalPriorityInputAddEl.value = 'medium'; 
    if (modalRecurrenceAddEl) modalRecurrenceAddEl.value = 'none';
    if (recurrenceOptionsAddEl) recurrenceOptionsAddEl.classList.add('hidden');

    if (existingLabelsDatalistEl) populateDatalist(existingLabelsDatalistEl); 

    if (window.isFeatureEnabled('projectFeature') && ProjectsFeature?.populateProjectDropdowns) { // MODIFIED to use window
        ProjectsFeature.populateProjectDropdowns(); 
        if (modalProjectSelectAddEl) modalProjectSelectAddEl.value = "0"; 
    }
    if (window.isFeatureEnabled('taskTimerSystem')) { // MODIFIED to use window
        if(modalEstHoursAddEl) modalEstHoursAddEl.value = ''; 
        if(modalEstMinutesAddEl) modalEstMinutesAddEl.value = ''; 
    }
    if (modalRemindMeAddEl) modalRemindMeAddEl.checked = false; 
    if (modalReminderDateAddEl) modalReminderDateAddEl.value = ''; 
    if (modalReminderTimeAddEl) modalReminderTimeAddEl.value = ''; 
    if (modalReminderEmailAddEl) modalReminderEmailAddEl.value = ''; 
    if (reminderOptionsAddEl) reminderOptionsAddEl.classList.add('hidden'); 

    const todayStr = getTodayDateString(); 
    if (modalDueDateInputAddEl) modalDueDateInputAddEl.min = todayStr; 
    if (modalReminderDateAddEl) modalReminderDateAddEl.min = todayStr; 
    if (recurrenceEndDateAddEl) recurrenceEndDateAddEl.min = todayStr;

    clearTempSubTasksForAddModal(); 

    if (window.isFeatureEnabled('subTasksFeature') && modalSubTasksListAddEl) { // MODIFIED to use window
        renderTempSubTasksForAddModal([], modalSubTasksListAddEl); 
        if(modalSubTaskInputAddEl) modalSubTaskInputAddEl.value = ''; 
    }
    if (taskDependenciesSectionAddEl) taskDependenciesSectionAddEl.classList.toggle('hidden', !window.isFeatureEnabled('taskDependenciesFeature')); // MODIFIED to use window
    LoggingService.info(`[ModalInteractions] Add Task Modal opened.`, { functionName });
}

export function closeAddModal() {
    const functionName = 'closeAddModal';
    LoggingService.debug(`[ModalInteractions] Attempting to close Add Task Modal.`, { functionName });
    const addTaskModalEl = document.getElementById('addTaskModal'); 
    const modalDialogAddEl = document.getElementById('modalDialogAdd'); 
    const modalSubTasksListAddEl = document.getElementById('modalSubTasksListAdd'); 

    if (!modalDialogAddEl || !addTaskModalEl) { 
        LoggingService.warn(`[ModalInteractions] Add Task Modal elements not found for closing.`, { functionName });
        return;
    }
    modalDialogAddEl.classList.add('scale-95', 'opacity-0'); 
    setTimeout(() => { 
        addTaskModalEl.classList.add('hidden'); 
        clearTempSubTasksForAddModal(); 

        if(modalSubTasksListAddEl) modalSubTasksListAddEl.innerHTML = ''; 
        LoggingService.info(`[ModalInteractions] Add Task Modal closed.`, { functionName });
    }, 200); 
}

export function openViewEditModal(taskId) {
    const functionName = 'openViewEditModal';
    LoggingService.debug(`[ModalInteractions] Attempting to open View/Edit Modal for task ID: ${taskId}.`, { functionName, taskId });

    const viewEditTaskModalEl = document.getElementById('viewEditTaskModal'); 
    const modalDialogViewEditEl = document.getElementById('modalDialogViewEdit'); 
    const modalViewEditTaskIdEl = document.getElementById('modalViewEditTaskId'); 
    const modalTaskInputViewEditEl = document.getElementById('modalTaskInputViewEdit'); 
    const modalDueDateInputViewEditEl = document.getElementById('modalDueDateInputViewEdit'); 
    const modalTimeInputViewEditEl = document.getElementById('modalTimeInputViewEdit'); 
    const modalEstHoursViewEditEl = document.getElementById('modalEstHoursViewEdit'); 
    const modalEstMinutesViewEditEl = document.getElementById('modalEstMinutesViewEdit'); 
    const modalPriorityInputViewEditEl = document.getElementById('modalPriorityInputViewEdit'); 
    const modalLabelInputViewEditEl = document.getElementById('modalLabelInputViewEdit'); 
    const existingLabelsEditDatalistEl = document.getElementById('existingLabelsEdit'); 
    const modalProjectSelectViewEditEl = document.getElementById('modalProjectSelectViewEdit'); 
    const modalNotesInputViewEditEl = document.getElementById('modalNotesInputViewEdit'); 
    const existingAttachmentsViewEditEl = document.getElementById('existingAttachmentsViewEdit'); 
    const modalRemindMeViewEditEl = document.getElementById('modalRemindMeViewEdit'); 
    const reminderOptionsViewEditEl = document.getElementById('reminderOptionsViewEdit'); 
    const modalReminderDateViewEditEl = document.getElementById('modalReminderDateViewEdit'); 
    const modalReminderTimeViewEditEl = document.getElementById('modalReminderTimeViewEdit'); 
    const modalReminderEmailViewEditEl = document.getElementById('modalReminderEmailViewEdit'); 
    const modalSubTasksListViewEditEl = document.getElementById('modalSubTasksListViewEdit'); 
    const modalSubTaskInputViewEditEl = document.getElementById('modalSubTaskInputViewEdit'); 
    const taskDependenciesSectionViewEditEl = document.getElementById('taskDependenciesSectionViewEdit'); 
    const modalRecurrenceViewEditEl = document.getElementById('modalRecurrenceViewEdit');
    const recurrenceEndDateViewEditEl = document.getElementById('recurrenceEndDateViewEdit');


    if (!AppStore || typeof AppStore.getTasks !== 'function' || !ModalStateService) { 
        LoggingService.error("[ModalInteractions] Core dependencies (AppStore, ModalStateService) not available.", new Error("CoreDependenciesMissing"), { functionName, taskId });
        return; 
    }
    const currentTasks = AppStore.getTasks(); 
    const task = currentTasks.find(t => t.id === taskId); 
    if (!task) { 
        LoggingService.error(`[ModalInteractions] Task with ID ${taskId} not found for View/Edit Modal.`, new Error("TaskNotFound"), { functionName, taskId });
        return;
    }

    ModalStateService.setEditingTaskId(taskId); 

    if (modalViewEditTaskIdEl) modalViewEditTaskIdEl.value = task.id; 
    if (modalTaskInputViewEditEl) modalTaskInputViewEditEl.value = task.text; 
    if (modalDueDateInputViewEditEl) modalDueDateInputViewEditEl.value = task.dueDate || ''; 
    if (modalTimeInputViewEditEl) modalTimeInputViewEditEl.value = task.time || ''; 

    if (window.isFeatureEnabled('taskTimerSystem')) { // MODIFIED to use window
        if (modalEstHoursViewEditEl) modalEstHoursViewEditEl.value = task.estimatedHours || ''; 
        if (modalEstMinutesViewEditEl) modalEstMinutesViewEditEl.value = task.estimatedMinutes || ''; 
    }

    if (modalPriorityInputViewEditEl) modalPriorityInputViewEditEl.value = task.priority; 
    if (modalLabelInputViewEditEl) modalLabelInputViewEditEl.value = task.label || ''; 
    if (existingLabelsEditDatalistEl) populateDatalist(existingLabelsEditDatalistEl); 

    if (window.isFeatureEnabled('projectFeature') && ProjectsFeature?.populateProjectDropdowns) { // MODIFIED to use window
        ProjectsFeature.populateProjectDropdowns(); 
        if (modalProjectSelectViewEditEl) modalProjectSelectViewEditEl.value = task.projectId || "0"; 
    }
    
    if (window.isFeatureEnabled('advancedRecurrence') && modalRecurrenceViewEditEl) { // MODIFIED to use window
        const recurrenceOptionsViewEditEl = document.getElementById('recurrenceOptionsViewEdit');
        const recurrenceIntervalViewEditEl = document.getElementById('recurrenceIntervalViewEdit');
        const weeklyRecurrenceOptionsViewEditEl = document.getElementById('weeklyRecurrenceOptionsViewEdit');

        modalRecurrenceViewEditEl.value = task.recurrence?.frequency || 'none';
        
        if (recurrenceIntervalViewEditEl) {
            recurrenceIntervalViewEditEl.value = task.recurrence?.interval || 1;
        }
        if (weeklyRecurrenceOptionsViewEditEl) {
            const checkboxes = weeklyRecurrenceOptionsViewEditEl.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = task.recurrence?.daysOfWeek?.includes(cb.value) || false;
            });
        }
        if (recurrenceEndDateViewEditEl) {
            recurrenceEndDateViewEditEl.value = task.recurrence?.endDate || '';
            recurrenceEndDateViewEditEl.min = task.dueDate || getTodayDateString();
        }

        if (AdvancedRecurrenceFeature && AdvancedRecurrenceFeature.updateRecurrenceUI) {
            AdvancedRecurrenceFeature.updateRecurrenceUI(
                modalRecurrenceViewEditEl,
                recurrenceOptionsViewEditEl,
                recurrenceIntervalViewEditEl,
                document.getElementById('recurrenceFrequencyTextViewEdit'),
                weeklyRecurrenceOptionsViewEditEl
            );
        }
    }

    if (modalNotesInputViewEditEl) modalNotesInputViewEditEl.value = task.notes || ''; 

    if (window.isFeatureEnabled('fileAttachments') && existingAttachmentsViewEditEl) { // MODIFIED to use window
        existingAttachmentsViewEditEl.textContent = task.attachments && task.attachments.length > 0 ? `${task.attachments.length} file(s) attached (management UI coming soon)` : 'No files attached yet.'; 
    }

    if (window.isFeatureEnabled('reminderFeature') && modalRemindMeViewEditEl) { // MODIFIED to use window
        modalRemindMeViewEditEl.checked = task.isReminderSet || false; 
        if (reminderOptionsViewEditEl) reminderOptionsViewEditEl.classList.toggle('hidden', !modalRemindMeViewEditEl.checked); 
        if (modalRemindMeViewEditEl.checked) { 
            if (modalReminderDateViewEditEl) modalReminderDateViewEditEl.value = task.reminderDate || ''; 
            if (modalReminderTimeViewEditEl) modalReminderTimeViewEditEl.value = task.reminderTime || ''; 
            if (modalReminderEmailViewEditEl) modalReminderEmailViewEditEl.value = task.reminderEmail || ''; 
        } else { 
            if (modalReminderDateViewEditEl) modalReminderDateViewEditEl.value = ''; 
            if (modalReminderTimeViewEditEl) modalReminderTimeViewEditEl.value = ''; 
            if (modalReminderEmailViewEditEl) modalReminderEmailViewEditEl.value = ''; 
        }
    } else if (reminderOptionsViewEditEl) { 
        if (modalRemindMeViewEditEl) modalRemindMeViewEditEl.checked = false; 
        reminderOptionsViewEditEl.classList.add('hidden'); 
    }

    const todayStr = getTodayDateString(); 
    if(modalDueDateInputViewEditEl) modalDueDateInputViewEditEl.min = todayStr; 
    if (modalReminderDateViewEditEl) modalReminderDateViewEditEl.min = todayStr; 

    if (window.isFeatureEnabled('subTasksFeature') && modalSubTasksListViewEditEl) { // MODIFIED to use window
        renderSubTasksForEditModal(taskId, modalSubTasksListViewEditEl); 
        if(modalSubTaskInputViewEditEl) modalSubTaskInputViewEditEl.value = ''; 
    }
    if (taskDependenciesSectionViewEditEl) taskDependenciesSectionViewEditEl.classList.toggle('hidden', !window.isFeatureEnabled('taskDependenciesFeature')); // MODIFIED to use window


    if (!viewEditTaskModalEl || !modalDialogViewEditEl) { 
        LoggingService.error("[ModalInteractions] Core View/Edit modal DOM elements not found.", new Error("DOMElementMissing"), { functionName, taskId });
        return;
    }
    viewEditTaskModalEl.classList.remove('hidden'); 
    setTimeout(() => { modalDialogViewEditEl.classList.remove('scale-95', 'opacity-0'); modalDialogViewEditEl.classList.add('scale-100', 'opacity-100'); }, 10); 
    if(modalTaskInputViewEditEl) modalTaskInputViewEditEl.focus(); 
    LoggingService.info(`[ModalInteractions] View/Edit Modal opened for task ID: ${taskId}.`, { functionName, taskId });
}

export function closeViewEditModal() {
    const functionName = 'closeViewEditModal';
    LoggingService.debug(`[ModalInteractions] Attempting to close View/Edit Modal.`, { functionName, editingTaskId: ModalStateService.getEditingTaskId() });
    const viewEditTaskModalEl = document.getElementById('viewEditTaskModal'); 
    const modalDialogViewEditEl = document.getElementById('modalDialogViewEdit'); 
    if (!modalDialogViewEditEl || !viewEditTaskModalEl) { 
        LoggingService.warn(`[ModalInteractions] View/Edit Modal elements not found for closing.`, { functionName });
        return;
    }
    modalDialogViewEditEl.classList.add('scale-95', 'opacity-0'); 
    setTimeout(() => { 
        viewEditTaskModalEl.classList.add('hidden'); 
        if (ModalStateService) ModalStateService.setEditingTaskId(null); 
        LoggingService.info(`[ModalInteractions] View/Edit Modal closed.`, { functionName });
    }, 200); 
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
    
    if (window.isFeatureEnabled('taskTimerSystem') && viewTaskEstDurationEl) { // MODIFIED to use window
        viewTaskEstDurationEl.textContent = formatDuration(task.estimatedHours, task.estimatedMinutes);
        if(taskTimerSectionEl) taskTimerSectionEl.classList.remove('hidden');
        if (TaskTimerSystemFeature?.setupTimerForModal) TaskTimerSystemFeature.setupTimerForModal(task);
    } else if (taskTimerSectionEl) {
        taskTimerSectionEl.classList.add('hidden');
    }

    if(viewTaskPriorityEl) viewTaskPriorityEl.textContent = task.priority || 'Not set';
    if(viewTaskStatusEl) viewTaskStatusEl.textContent = task.completed ? 'Completed' : 'Active';
    if(viewTaskLabelEl) viewTaskLabelEl.textContent = task.label || 'None';

    if (window.isFeatureEnabled('projectFeature') && viewTaskProjectEl) { // MODIFIED to use window
        const project = AppStore.getProjects().find(p => p.id === task.projectId);
        viewTaskProjectEl.textContent = project ? project.name : 'No Project';
        viewTaskProjectEl.closest('div.project-feature-element')?.classList.remove('hidden');
    } else if (viewTaskProjectEl) {
         viewTaskProjectEl.closest('div.project-feature-element')?.classList.add('hidden');
    }
    
    if(viewTaskNotesEl) viewTaskNotesEl.textContent = task.notes || 'No notes added.';

    if (window.isFeatureEnabled('reminderFeature') && viewTaskReminderSectionEl) { // MODIFIED to use window
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

    if(window.isFeatureEnabled('fileAttachments') && viewTaskAttachmentsSectionEl) { // MODIFIED to use window
        viewTaskAttachmentsSectionEl.classList.remove('hidden');
        if(viewTaskAttachmentsListEl) viewTaskAttachmentsListEl.textContent = task.attachments && task.attachments.length > 0 ? `(${task.attachments.length}) files (UI coming soon)` : 'No attachments.';
    } else if (viewTaskAttachmentsSectionEl) {
        viewTaskAttachmentsSectionEl.classList.add('hidden');
    }
    
    if (window.isFeatureEnabled('subTasksFeature') && subTasksSectionViewDetailsEl) { // MODIFIED to use window
        subTasksSectionViewDetailsEl.classList.remove('hidden');
        renderSubTasksForViewModal(taskId, modalSubTasksListViewDetailsEl, viewSubTaskProgressEl, noSubTasksMessageViewDetailsEl);
    } else if (subTasksSectionViewDetailsEl) {
        subTasksSectionViewDetailsEl.classList.add('hidden');
    }

    if (window.isFeatureEnabled('taskDependenciesFeature') && viewTaskDependenciesSectionEl) { // MODIFIED to use window
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
    const viewTaskDetailsModalEl = document.getElementById('viewTaskDetailsModal'); 
    const modalDialogViewDetailsEl = document.getElementById('modalDialogViewDetails'); 
    if (!modalDialogViewDetailsEl || !viewTaskDetailsModalEl) { 
        LoggingService.warn(`[ModalInteractions] View Task Details Modal elements not found for closing.`, { functionName });
        return;
    }
    modalDialogViewDetailsEl.classList.add('scale-95', 'opacity-0'); 
    setTimeout(() => { 
        viewTaskDetailsModalEl.classList.add('hidden'); 
        if (window.isFeatureEnabled('taskTimerSystem') && TaskTimerSystemFeature?.clearTimerOnModalClose) { // MODIFIED to use window
            TaskTimerSystemFeature.clearTimerOnModalClose(); 
        }
        if (ModalStateService) ModalStateService.setCurrentViewTaskId(null); 
        LoggingService.info(`[ModalInteractions] View Task Details Modal closed.`, { functionName });
    }, 200); 
}

export function openManageLabelsModal() {
    const functionName = 'openManageLabelsModal';
    LoggingService.debug(`[ModalInteractions] Attempting to open Manage Labels Modal.`, { functionName });
    const manageLabelsModalEl = document.getElementById('manageLabelsModal'); 
    const modalDialogManageLabelsEl = document.getElementById('modalDialogManageLabels'); 
    const newLabelInputEl = document.getElementById('newLabelInput'); 
    if (!manageLabelsModalEl || !modalDialogManageLabelsEl || !newLabelInputEl) { 
        LoggingService.error("[ModalInteractions] Core Manage Labels modal DOM elements not found.", new Error("DOMElementMissing"), { functionName });
        return;
    }
    populateManageLabelsList(); 
    manageLabelsModalEl.classList.remove('hidden'); 
    setTimeout(() => { modalDialogManageLabelsEl.classList.remove('scale-95', 'opacity-0'); modalDialogManageLabelsEl.classList.add('scale-100', 'opacity-100'); }, 10); 
    newLabelInputEl.focus(); 
    LoggingService.info(`[ModalInteractions] Manage Labels Modal opened.`, { functionName });
}

export function closeManageLabelsModal() {
    const functionName = 'closeManageLabelsModal';
    LoggingService.debug(`[ModalInteractions] Attempting to close Manage Labels Modal.`, { functionName });
    const manageLabelsModalEl = document.getElementById('manageLabelsModal'); 
    const modalDialogManageLabelsEl = document.getElementById('modalDialogManageLabels'); 
    if (!modalDialogManageLabelsEl || !manageLabelsModalEl) { 
        LoggingService.warn(`[ModalInteractions] Manage Labels Modal elements not found for closing.`, { functionName });
        return;
    }
    modalDialogManageLabelsEl.classList.add('scale-95', 'opacity-0'); 
    setTimeout(() => { manageLabelsModalEl.classList.add('hidden'); LoggingService.info(`[ModalInteractions] Manage Labels Modal closed.`, { functionName }); }, 200); 
}

export function populateManageLabelsList() {
    const functionName = 'populateManageLabelsList';
    const existingLabelsListEl = document.getElementById('existingLabelsList'); 
    if (!existingLabelsListEl || !AppStore || typeof AppStore.getUniqueLabels !== 'function') { 
        LoggingService.error("[ModalInteractions] Cannot populate manage labels list. Dependencies missing.", new Error("CoreDependenciesMissing"), { functionName, existingLabelsListElFound: !!existingLabelsListEl, AppStoreAvailable: !!AppStore });
         if(existingLabelsListEl) existingLabelsListEl.innerHTML = '<li class="text-slate-500 dark:text-slate-400 text-center">Error loading labels.</li>'; 
        return; 
    }
    const currentUniqueLabels = AppStore.getUniqueLabels(); 
    existingLabelsListEl.innerHTML = ''; 
    currentUniqueLabels.forEach(label => { 
        const li = document.createElement('li'); 
        li.className = 'flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700 rounded-md'; 
        const span = document.createElement('span'); 
        span.textContent = label.charAt(0).toUpperCase() + label.slice(1); 
        span.className = 'text-slate-700 dark:text-slate-200'; 
        li.appendChild(span); 
        const deleteBtn = document.createElement('button'); 
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt text-red-500 hover:text-red-700"></i>'; 
        deleteBtn.className = 'p-1'; 
        deleteBtn.title = `Delete label "${label}"`; 
        deleteBtn.addEventListener('click', () => handleDeleteLabel(label)); 
        li.appendChild(deleteBtn); 
        existingLabelsListEl.appendChild(li); 
    });
    if (currentUniqueLabels.length === 0) { 
        existingLabelsListEl.innerHTML = '<li class="text-slate-500 dark:text-slate-400 text-center">No labels created yet.</li>'; 
    }
    LoggingService.debug(`[ModalInteractions] Manage Labels list populated with ${currentUniqueLabels.length} labels.`, { functionName, labelCount: currentUniqueLabels.length });
}

export function openSettingsModal() {
    const functionName = 'openSettingsModal';
    LoggingService.debug(`[ModalInteractions] Attempting to open Settings Modal.`, { functionName });
    const settingsModalEl = document.getElementById('settingsModal'); 
    const modalDialogSettingsEl = document.getElementById('modalDialogSettings'); 

    if (!settingsModalEl || !modalDialogSettingsEl) { 
        LoggingService.error("[ModalInteractions] Core Settings modal DOM elements not found.", new Error("DOMElementMissing"), { functionName });
        return;
    }
    settingsModalEl.classList.remove('hidden'); 
    setTimeout(() => { modalDialogSettingsEl.classList.remove('scale-95', 'opacity-0'); modalDialogSettingsEl.classList.add('scale-100', 'opacity-100'); }, 10); 
    LoggingService.info(`[ModalInteractions] Settings Modal opened.`, { functionName });
}

export function closeSettingsModal() {
    const functionName = 'closeSettingsModal';
    LoggingService.debug(`[ModalInteractions] Attempting to close Settings Modal.`, { functionName });
    const settingsModalEl = document.getElementById('settingsModal'); 
    const modalDialogSettingsEl = document.getElementById('modalDialogSettings'); 
    if (!modalDialogSettingsEl || !settingsModalEl) { 
        LoggingService.warn(`[ModalInteractions] Settings Modal elements not found for closing.`, { functionName });
        return;
    }
    modalDialogSettingsEl.classList.add('scale-95', 'opacity-0'); 
    setTimeout(() => { settingsModalEl.classList.add('hidden'); LoggingService.info(`[ModalInteractions] Settings Modal closed.`, { functionName }); }, 200); 
}

export function openTaskReviewModal() {
    const functionName = 'openTaskReviewModal';
    LoggingService.debug(`[ModalInteractions] Attempting to open Task Review Modal.`, { functionName });
    const taskReviewModalEl = document.getElementById('taskReviewModal'); 
    const modalDialogTaskReviewEl = document.getElementById('modalDialogTaskReview'); 
    if (!window.isFeatureEnabled('taskTimerSystem')) { // MODIFIED to use window
        LoggingService.warn(`[ModalInteractions] Task Timer System feature is disabled. Cannot open Task Review Modal.`, { functionName });
        EventBus.publish('displayUserMessage', { text: "Task Timer System feature is currently disabled.", type: "error" });
        return; 
    }
    if (!taskReviewModalEl || !modalDialogTaskReviewEl) { 
        LoggingService.error("[ModalInteractions] Core Task Review modal DOM elements not found.", new Error("DOMElementMissing"), { functionName });
        return;
    }
    populateTaskReviewModal(); 
    taskReviewModalEl.classList.remove('hidden'); 
    setTimeout(() => { modalDialogTaskReviewEl.classList.remove('scale-95', 'opacity-0'); modalDialogTaskReviewEl.classList.add('scale-100', 'opacity-100'); }, 10); 
    LoggingService.info(`[ModalInteractions] Task Review Modal opened.`, { functionName });
}

export function closeTaskReviewModal() {
    const functionName = 'closeTaskReviewModal';
    LoggingService.debug(`[ModalInteractions] Attempting to close Task Review Modal.`, { functionName });
    const taskReviewModalEl = document.getElementById('taskReviewModal'); 
    const modalDialogTaskReviewEl = document.getElementById('modalDialogTaskReview'); 
    if (!modalDialogTaskReviewEl || !taskReviewModalEl) { 
        LoggingService.warn(`[ModalInteractions] Task Review Modal elements not found for closing.`, { functionName });
        return;
    }
    modalDialogTaskReviewEl.classList.add('scale-95', 'opacity-0'); 
    setTimeout(() => { taskReviewModalEl.classList.add('hidden'); LoggingService.info(`[ModalInteractions] Task Review Modal closed.`, { functionName }); }, 200); 
}

function populateTaskReviewModal() {
    const functionName = 'populateTaskReviewModal';
    const taskReviewContentEl = document.getElementById('taskReviewContent'); 
    if (!taskReviewContentEl || !AppStore || typeof AppStore.getTasks !== 'function') { 
        LoggingService.error("[ModalInteractions] Cannot populate task review modal. Dependencies missing.", new Error("CoreDependenciesMissing"), { functionName, taskReviewContentElFound: !!taskReviewContentEl, AppStoreAvailable: !!AppStore });
        if(taskReviewContentEl) taskReviewContentEl.innerHTML = '<p class="text-slate-500 dark:text-slate-400 text-center">Error loading task review data.</p>';
        return;
    }
    taskReviewContentEl.innerHTML = ''; 
    const currentTasks = AppStore.getTasks(); 
    const completedTasksWithTime = currentTasks.filter(task => task.completed && ((task.estimatedHours && task.estimatedHours > 0) || (task.estimatedMinutes && task.estimatedMinutes > 0) || (task.actualDurationMs && task.actualDurationMs > 0))).sort((a,b) => (b.completedDate || 0) - (a.completedDate || 0)); 
    
    if (completedTasksWithTime.length === 0) { 
        taskReviewContentEl.innerHTML = '<p class="text-slate-500 dark:text-slate-400 text-center">No completed tasks with time data.</p>'; 
        LoggingService.debug(`[ModalInteractions] Task Review populated: No completed tasks with time data.`, { functionName });
        return; 
    }
    completedTasksWithTime.forEach(task => { 
        const itemDiv = document.createElement('div'); 
        itemDiv.className = 'p-3 bg-slate-50 dark:bg-slate-700 rounded-lg shadow'; 
        const taskName = document.createElement('h4'); 
        taskName.className = 'text-md font-semibold text-slate-800 dark:text-slate-100 mb-1 truncate'; 
        taskName.textContent = task.text; 
        itemDiv.appendChild(taskName); 
        if (typeof formatDuration === 'function') { 
            const estimatedP = document.createElement('p'); 
            estimatedP.className = 'text-sm text-slate-600 dark:text-slate-300'; 
            estimatedP.innerHTML = `<strong>Estimated:</strong> ${formatDuration(task.estimatedHours, task.estimatedMinutes)}`; 
            itemDiv.appendChild(estimatedP); 
        }
        if (typeof formatMillisecondsToHMS === 'function') { 
            const actualP = document.createElement('p'); 
            actualP.className = 'text-sm text-slate-600 dark:text-slate-300'; 
            actualP.innerHTML = `<strong>Actual:</strong> ${task.actualDurationMs > 0 ? formatMillisecondsToHMS(task.actualDurationMs) : 'Not recorded'}`; 
            itemDiv.appendChild(actualP); 
        }
        if (task.completedDate && typeof formatDate === 'function') { 
            const completedOnP = document.createElement('p'); 
            completedOnP.className = 'text-xs text-slate-400 dark:text-slate-500 mt-1'; 
            completedOnP.textContent = `Completed on: ${formatDate(new Date(task.completedDate))}`; 
            itemDiv.appendChild(completedOnP); 
        }
        taskReviewContentEl.appendChild(itemDiv); 
    });
    LoggingService.debug(`[ModalInteractions] Task Review populated with ${completedTasksWithTime.length} tasks.`, { functionName, taskCount: completedTasksWithTime.length });
}

export function openTooltipsGuideModal() {
    const functionName = 'openTooltipsGuideModal';
    LoggingService.debug(`[ModalInteractions] Attempting to open Tooltips Guide Modal.`, { functionName });
    const tooltipsGuideModalEl = document.getElementById('tooltipsGuideModal'); 
    const modalDialogTooltipsGuideEl = document.getElementById('modalDialogTooltipsGuide'); 
    if (!window.isFeatureEnabled('tooltipsGuide')) { // MODIFIED to use window
        LoggingService.warn(`[ModalInteractions] Tooltips Guide feature is disabled. Cannot open modal.`, { functionName });
        EventBus.publish('displayUserMessage', { text: "Tooltips Guide feature is disabled.", type: "error" });
        return; 
    }
    if (!tooltipsGuideModalEl || !modalDialogTooltipsGuideEl) { 
        LoggingService.error("[ModalInteractions] Core Tooltips Guide modal DOM elements not found.", new Error("DOMElementMissing"), { functionName });
        return;
    }
    tooltipsGuideModalEl.classList.remove('hidden'); 
    setTimeout(() => { modalDialogTooltipsGuideEl.classList.remove('scale-95', 'opacity-0'); modalDialogTooltipsGuideEl.classList.add('scale-100', 'opacity-100'); }, 10); 
    LoggingService.info(`[ModalInteractions] Tooltips Guide Modal opened.`, { functionName });
}

export function closeTooltipsGuideModal() {
    const functionName = 'closeTooltipsGuideModal';
    LoggingService.debug(`[ModalInteractions] Attempting to close Tooltips Guide Modal.`, { functionName });
    const tooltipsGuideModalEl = document.getElementById('tooltipsGuideModal'); 
    const modalDialogTooltipsGuideEl = document.getElementById('modalDialogTooltipsGuide'); 
    if (!modalDialogTooltipsGuideEl || !tooltipsGuideModalEl) { 
        LoggingService.warn(`[ModalInteractions] Tooltips Guide Modal elements not found for closing.`, { functionName });
        return;
    }
    modalDialogTooltipsGuideEl.classList.add('scale-95', 'opacity-0'); 
    setTimeout(() => { tooltipsGuideModalEl.classList.add('hidden'); LoggingService.info(`[ModalInteractions] Tooltips Guide Modal closed.`, { functionName }); }, 200); 
}

export function openContactUsModal() {
    const functionName = 'openContactUsModal (ModalInteractions)';
    LoggingService.debug(`[ModalInteractions] Attempting to open Contact Us Modal.`, { functionName });

    const contactUsModalEl = document.getElementById('contactUsModal');
    const modalDialogContactUsEl = document.getElementById('modalDialogContactUs');
    const contactNameInputEl = document.getElementById('contactNameInput'); 

    if (!window.isFeatureEnabled('contactUsFeature')) { // MODIFIED to use window
        LoggingService.warn('[ModalInteractions] Contact Us feature is disabled. Cannot open modal.', { functionName });
        if (EventBus && EventBus.publish) EventBus.publish('displayUserMessage', { text: "Contact Us feature is currently disabled.", type: "info" });
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
            contactUsFormEl.reset(); 
        }
        LoggingService.info(`[ModalInteractions] Contact Us Modal closed.`, { functionName });
    }, 200);
}

export function openAboutUsModal() {
    const functionName = 'openAboutUsModal (ModalInteractions)';
    LoggingService.debug(`[ModalInteractions] Attempting to open About Us Modal.`, { functionName });

    const aboutUsModalEl = document.getElementById('aboutUsModal');
    const modalDialogAboutUsEl = document.getElementById('modalDialogAboutUs');

    if (!window.isFeatureEnabled('aboutUsFeature')) { // MODIFIED to use window
        LoggingService.warn('[ModalInteractions] About Us feature is disabled. Cannot open modal.', { functionName });
        if (EventBus && EventBus.publish) EventBus.publish('displayUserMessage', { text: "About Us feature is currently disabled.", type: "info" });
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

export function openDataVersionHistoryModal() {
    const functionName = 'openDataVersionHistoryModal';
    LoggingService.debug(`[ModalInteractions] Attempting to open Data Version History Modal.`, { functionName });

    const dataVersionHistoryModalEl = document.getElementById('dataVersionHistoryModal');
    const modalDialogDataVersionHistoryEl = document.getElementById('modalDialogDataVersionHistory');

    if (!window.isFeatureEnabled('dataVersioningFeature')) { // MODIFIED to use window
        LoggingService.warn('[ModalInteractions] Data Versioning feature is disabled. Cannot open history modal.', { functionName });
        if (EventBus && EventBus.publish) EventBus.publish('displayUserMessage', { text: "Data Versioning feature is currently disabled.", type: "info" });
        return;
    }

    if (!dataVersionHistoryModalEl || !modalDialogDataVersionHistoryEl) {
        LoggingService.error("[ModalInteractions] Core Data Version History modal DOM elements not found.", new Error("DOMElementMissing"), { functionName });
        return;
    }

    if (typeof DataVersioningFeature === 'undefined' || typeof DataVersioningFeature.getVersionHistory !== 'function') {
        LoggingService.error("[ModalInteractions] DataVersioningFeature or getVersionHistory function is not available.", new Error("FeatureUnavailable"), { functionName });
        if (EventBus && EventBus.publish) EventBus.publish('displayUserMessage', { text: "Error: Could not load version history.", type: "error" });
        const contentArea = document.getElementById('dataVersionHistoryContent');
        if (contentArea) contentArea.innerHTML = '<p class="text-slate-500 dark:text-slate-400 text-center p-4">Error loading version history service.</p>';
        return;
    }
    
    const versions = DataVersioningFeature.getVersionHistory();
    if (typeof renderVersionHistoryList === 'function') {
        renderVersionHistoryList(versions); 
    } else {
        LoggingService.error("[ModalInteractions] renderVersionHistoryList function not available from ui_rendering.", new Error("FunctionMissing"), { functionName });
        const contentArea = document.getElementById('dataVersionHistoryContent');
        if (contentArea) contentArea.innerHTML = '<p class="text-slate-500 dark:text-slate-400 text-center p-4">Error displaying version history.</p>';
    }

    dataVersionHistoryModalEl.classList.remove('hidden');
    setTimeout(() => {
        modalDialogDataVersionHistoryEl.classList.remove('scale-95', 'opacity-0');
        modalDialogDataVersionHistoryEl.classList.add('scale-100', 'opacity-100');
    }, 10);
    LoggingService.info(`[ModalInteractions] Data Version History Modal opened. Displaying ${versions.length} versions.`, { functionName, versionCount: versions.length });
}

export function closeDataVersionHistoryModal() {
    const functionName = 'closeDataVersionHistoryModal';
    LoggingService.debug(`[ModalInteractions] Attempting to close Data Version History Modal.`, { functionName });

    const dataVersionHistoryModalEl = document.getElementById('dataVersionHistoryModal');
    const modalDialogDataVersionHistoryEl = document.getElementById('modalDialogDataVersionHistory');

    if (!dataVersionHistoryModalEl || !modalDialogDataVersionHistoryEl) {
        LoggingService.warn("[ModalInteractions] Data Version History Modal DOM elements not found for closing.", { functionName });
        return;
    }
    modalDialogDataVersionHistoryEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        dataVersionHistoryModalEl.classList.add('hidden');
        LoggingService.info(`[ModalInteractions] Data Version History Modal closed.`, { functionName });
    }, 200);
}

export function openDesktopNotificationsSettingsModal() {
    const functionName = 'openDesktopNotificationsSettingsModal';
    LoggingService.debug(`[ModalInteractions] Attempting to open Desktop Notifications Settings Modal.`, { functionName });

    if (!window.isFeatureEnabled('desktopNotificationsFeature')) { // MODIFIED to use window
        LoggingService.warn('[ModalInteractions] Desktop Notifications feature is disabled. Cannot open settings modal.', { functionName });
        EventBus.publish('displayUserMessage', { text: "Desktop Notifications feature is currently disabled.", type: "info" });
        return;
    }

    const modalEl = document.getElementById('desktopNotificationsSettingsModal');
    const dialogEl = document.getElementById('modalDialogDesktopNotificationsSettings');

    if (!modalEl || !dialogEl) {
        LoggingService.error("[ModalInteractions] Core Desktop Notifications Settings modal DOM elements not found.", new Error("DOMElementMissing"), { functionName });
        return;
    }

    modalEl.classList.remove('hidden');
    setTimeout(() => {
        dialogEl.classList.remove('scale-95', 'opacity-0');
        dialogEl.classList.add('scale-100', 'opacity-100');
        if (DesktopNotificationsFeature && typeof DesktopNotificationsFeature.refreshSettingsUIDisplay === 'function') {
            DesktopNotificationsFeature.refreshSettingsUIDisplay();
        } else {
            LoggingService.warn('[ModalInteractions] DesktopNotificationsFeature.refreshSettingsUIDisplay is not available.', { functionName });
        }
    }, 10);
    LoggingService.info(`[ModalInteractions] Desktop Notifications Settings Modal opened.`, { functionName });
}

export function closeDesktopNotificationsSettingsModal() {
    const functionName = 'closeDesktopNotificationsSettingsModal';
    LoggingService.debug(`[ModalInteractions] Attempting to close Desktop Notifications Settings Modal.`, { functionName });

    const modalEl = document.getElementById('desktopNotificationsSettingsModal');
    const dialogEl = document.getElementById('modalDialogDesktopNotificationsSettings');

    if (!modalEl || !dialogEl) {
        LoggingService.warn("[ModalInteractions] Desktop Notifications Settings modal DOM elements not found for closing.", { functionName });
        return;
    }

    dialogEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modalEl.classList.add('hidden');
        LoggingService.info(`[ModalInteractions] Desktop Notifications Settings Modal closed.`, { functionName });
    }, 200);
}

// --- NEW Profile Modal Functions ---
export function openProfileModal() {
    const functionName = 'openProfileModal (ModalInteractions)';
    LoggingService.debug(`[ModalInteractions] Attempting to open Profile Modal.`, { functionName });

    const profileModalEl = document.getElementById('profileModal');
    const modalDialogProfileEl = document.getElementById('modalDialogProfile');
    const profileDisplayNameInputEl = document.getElementById('profileDisplayName');
    const profileEmailInputEl = document.getElementById('profileEmail');
    const profileFormEl = document.getElementById('profileForm');

    if (!profileModalEl || !modalDialogProfileEl || !profileDisplayNameInputEl || !profileEmailInputEl || !profileFormEl) {
        LoggingService.error("[ModalInteractions] Core Profile Modal DOM elements not found.", new Error("DOMElementMissing"), { functionName });
        EventBus.publish('displayUserMessage', { text: 'Could not open profile editor.', type: 'error' });
        return;
    }

    // Since we are not using Firebase auth, we'll use the profile from the store.
    const userProfile = AppStore.getUserProfile();
    profileDisplayNameInputEl.value = userProfile.displayName || '';
    profileEmailInputEl.value = userProfile.email || 'local@user.com'; // Placeholder email

    profileModalEl.classList.remove('hidden');
    setTimeout(() => {
        modalDialogProfileEl.classList.remove('scale-95', 'opacity-0');
        modalDialogProfileEl.classList.add('scale-100', 'opacity-100');
        profileDisplayNameInputEl.focus();
    }, 10);
    LoggingService.info(`[ModalInteractions] Profile Modal opened.`, { functionName });
}

export function closeProfileModal() {
    const functionName = 'closeProfileModal (ModalInteractions)';
    LoggingService.debug(`[ModalInteractions] Attempting to close Profile Modal.`, { functionName });

    const profileModalEl = document.getElementById('profileModal');
    const modalDialogProfileEl = document.getElementById('modalDialogProfile');
    const profileFormEl = document.getElementById('profileForm');

    if (!profileModalEl || !modalDialogProfileEl) {
        LoggingService.warn("[ModalInteractions] Profile Modal DOM elements not found for closing.", { functionName });
        return;
    }

    modalDialogProfileEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        profileModalEl.classList.add('hidden');
        if (profileFormEl) {
            profileFormEl.reset(); // Optional: reset form on close
        }
        LoggingService.info(`[ModalInteractions] Profile Modal closed.`, { functionName });
    }, 200);
}


LoggingService.debug("modal_interactions.js loaded, uses getElementById, imports, and new tempSubTask clearing.", { module: 'modal_interactions' });