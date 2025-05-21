// modal_interactions.js
// Manages modal dialogs (Add, Edit, View, Settings, etc.)

import AppStore from './store.js';
import { isFeatureEnabled } from './featureFlagService.js';
import ModalStateService from './modalStateService.js';
import { formatDate, formatTime, formatDuration, getTodayDateString, formatMillisecondsToHMS } from './utils.js'; // Added formatMillisecondsToHMS

// Import functions from ui_rendering.js
import {
    populateDatalist,
    renderTempSubTasksForAddModal,
    renderSubTasksForEditModal,
    renderSubTasksForViewModal,
    renderTaskDependenciesForViewModal,
    showMessage
} from './ui_rendering.js';

// Import functions/objects from other modules
import { handleDeleteLabel, clearTempSubTasksForAddModal } from './ui_event_handlers.js';
import { ProjectsFeature } from './feature_projects.js';
import { TaskTimerSystemFeature } from './task_timer_system.js';

// Note: This module uses document.getElementById for DOM elements.
// It assumes these elements exist in the DOM and their IDs are stable.

export function openAddModal() {
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


    if (!addTaskModalEl || !modalDialogAddEl || !modalTaskInputAddEl || !modalTodoFormAddEl || !modalPriorityInputAddEl) {
        console.error("[OpenAddModal] Core modal elements not found in DOM.");
        return;
    }
    addTaskModalEl.classList.remove('hidden');
    setTimeout(() => { modalDialogAddEl.classList.remove('scale-95', 'opacity-0'); modalDialogAddEl.classList.add('scale-100', 'opacity-100'); }, 10);
    modalTaskInputAddEl.focus();
    modalTodoFormAddEl.reset();
    modalPriorityInputAddEl.value = 'medium';

    if (existingLabelsDatalistEl) populateDatalist(existingLabelsDatalistEl);

    if (isFeatureEnabled('projectFeature') && ProjectsFeature?.populateProjectDropdowns) {
        ProjectsFeature.populateProjectDropdowns();
        if (modalProjectSelectAddEl) modalProjectSelectAddEl.value = "0";
    }
    if (isFeatureEnabled('taskTimerSystem')) {
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

    clearTempSubTasksForAddModal(); // Clear the shared state

    if (isFeatureEnabled('subTasksFeature') && modalSubTasksListAddEl) {
        renderTempSubTasksForAddModal([], modalSubTasksListAddEl); // Pass empty array on fresh modal open
        if(modalSubTaskInputAddEl) modalSubTaskInputAddEl.value = '';
    }
    if (taskDependenciesSectionAddEl) taskDependenciesSectionAddEl.classList.toggle('hidden', !isFeatureEnabled('taskDependenciesFeature'));
}

export function closeAddModal() {
    const addTaskModalEl = document.getElementById('addTaskModal');
    const modalDialogAddEl = document.getElementById('modalDialogAdd');
    const modalSubTasksListAddEl = document.getElementById('modalSubTasksListAdd');

    if (!modalDialogAddEl || !addTaskModalEl) return;
    modalDialogAddEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        addTaskModalEl.classList.add('hidden');
        clearTempSubTasksForAddModal(); // Clear the shared state

        if(modalSubTasksListAddEl) modalSubTasksListAddEl.innerHTML = ''; // Clear the display
    }, 200);
}

export function openViewEditModal(taskId) {
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


    if (!AppStore || typeof AppStore.getTasks !== 'function' || !ModalStateService) {
        console.error("[OpenViewEditModal] Core dependencies (AppStore, ModalStateService) not available.");
        return;
    }
    const currentTasks = AppStore.getTasks();
    const task = currentTasks.find(t => t.id === taskId);
    if (!task) { console.error(`[OpenViewEditModal] Task with ID ${taskId} not found.`); return; }

    ModalStateService.setEditingTaskId(taskId);

    if (modalViewEditTaskIdEl) modalViewEditTaskIdEl.value = task.id;
    if (modalTaskInputViewEditEl) modalTaskInputViewEditEl.value = task.text;
    if (modalDueDateInputViewEditEl) modalDueDateInputViewEditEl.value = task.dueDate || '';
    if (modalTimeInputViewEditEl) modalTimeInputViewEditEl.value = task.time || '';

    if (isFeatureEnabled('taskTimerSystem')) {
        if (modalEstHoursViewEditEl) modalEstHoursViewEditEl.value = task.estimatedHours || '';
        if (modalEstMinutesViewEditEl) modalEstMinutesViewEditEl.value = task.estimatedMinutes || '';
    }

    if (modalPriorityInputViewEditEl) modalPriorityInputViewEditEl.value = task.priority;
    if (modalLabelInputViewEditEl) modalLabelInputViewEditEl.value = task.label || '';
    if (existingLabelsEditDatalistEl) populateDatalist(existingLabelsEditDatalistEl);

    if (isFeatureEnabled('projectFeature') && ProjectsFeature?.populateProjectDropdowns) {
        ProjectsFeature.populateProjectDropdowns();
        if (modalProjectSelectViewEditEl) modalProjectSelectViewEditEl.value = task.projectId || "0";
    }

    if (modalNotesInputViewEditEl) modalNotesInputViewEditEl.value = task.notes || '';

    if (isFeatureEnabled('fileAttachments') && existingAttachmentsViewEditEl) {
        existingAttachmentsViewEditEl.textContent = task.attachments && task.attachments.length > 0 ? `${task.attachments.length} file(s) attached (management UI coming soon)` : 'No files attached yet.';
    }

    if (isFeatureEnabled('reminderFeature') && modalRemindMeViewEditEl) {
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

    if (isFeatureEnabled('subTasksFeature') && modalSubTasksListViewEditEl) {
        renderSubTasksForEditModal(taskId, modalSubTasksListViewEditEl);
        if(modalSubTaskInputViewEditEl) modalSubTaskInputViewEditEl.value = '';
    }
    if (taskDependenciesSectionViewEditEl) taskDependenciesSectionViewEditEl.classList.toggle('hidden', !isFeatureEnabled('taskDependenciesFeature'));

    if (!viewEditTaskModalEl || !modalDialogViewEditEl) { console.error("[OpenViewEditModal] Core view/edit modal DOM elements not found."); return; }
    viewEditTaskModalEl.classList.remove('hidden');
    setTimeout(() => { modalDialogViewEditEl.classList.remove('scale-95', 'opacity-0'); modalDialogViewEditEl.classList.add('scale-100', 'opacity-100'); }, 10);
    if(modalTaskInputViewEditEl) modalTaskInputViewEditEl.focus();
}

export function closeViewEditModal() {
    const viewEditTaskModalEl = document.getElementById('viewEditTaskModal');
    const modalDialogViewEditEl = document.getElementById('modalDialogViewEdit');
    if (!modalDialogViewEditEl || !viewEditTaskModalEl) return;
    modalDialogViewEditEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        viewEditTaskModalEl.classList.add('hidden');
        if (ModalStateService) ModalStateService.setEditingTaskId(null);
    }, 200);
}

export function openViewTaskDetailsModal(taskId) {
    const viewTaskDetailsModalEl = document.getElementById('viewTaskDetailsModal');
    const modalDialogViewDetailsEl = document.getElementById('modalDialogViewDetails');
    const viewTaskTextEl = document.getElementById('viewTaskText');
    const viewTaskDueDateEl = document.getElementById('viewTaskDueDate');
    const viewTaskTimeEl = document.getElementById('viewTaskTime');
    const viewTaskEstDurationEl = document.getElementById('viewTaskEstDuration');
    const taskTimerSectionEl = document.getElementById('taskTimerSection'); // Used for hiding
    const viewTaskAttachmentsListEl = document.getElementById('viewTaskAttachmentsList');
    const viewTaskAttachmentsSectionEl = document.getElementById('viewTaskAttachmentsSection');
    const viewTaskPriorityEl = document.getElementById('viewTaskPriority');
    const viewTaskStatusEl = document.getElementById('viewTaskStatus');
    const viewTaskLabelEl = document.getElementById('viewTaskLabel');
    const viewTaskProjectEl = document.getElementById('viewTaskProject');
    const viewTaskNotesEl = document.getElementById('viewTaskNotes');
    const viewTaskReminderSectionEl = document.getElementById('viewTaskReminderSection');
    const viewTaskReminderStatusEl = document.getElementById('viewTaskReminderStatus');
    const viewTaskReminderDateEl = document.getElementById('viewTaskReminderDate');
    const viewTaskReminderTimeEl = document.getElementById('viewTaskReminderTime');
    const viewTaskReminderEmailEl = document.getElementById('viewTaskReminderEmail');
    const viewTaskReminderDetailsEl = document.getElementById('viewTaskReminderDetails');
    const modalSubTasksListViewDetailsEl = document.getElementById('modalSubTasksListViewDetails');
    const viewSubTaskProgressEl = document.getElementById('viewSubTaskProgress');
    const noSubTasksMessageViewDetailsEl = document.getElementById('noSubTasksMessageViewDetails');
    const subTasksSectionViewDetailsEl = document.getElementById('subTasksSectionViewDetails');
    const viewTaskDependenciesSectionEl = document.getElementById('viewTaskDependenciesSection');


    if (!AppStore || typeof AppStore.getTasks !== 'function' || !ModalStateService) { console.error("[OpenViewDetailsModal] Core dependencies not available."); return; }
    const currentTasks = AppStore.getTasks();
    const task = currentTasks.find(t => t.id === taskId);
    if (!task) { console.error(`[OpenViewDetailsModal] Task with ID ${taskId} not found.`); return; }
    ModalStateService.setCurrentViewTaskId(taskId);

    if(viewTaskTextEl) viewTaskTextEl.textContent = task.text;
    if(viewTaskDueDateEl) viewTaskDueDateEl.textContent = task.dueDate ? formatDate(task.dueDate) : 'Not set';
    if(viewTaskTimeEl) viewTaskTimeEl.textContent = task.time ? formatTime(task.time) : 'Not set';

    if (isFeatureEnabled('taskTimerSystem') && TaskTimerSystemFeature?.setupTimerForModal) {
        TaskTimerSystemFeature.setupTimerForModal(task);
    } else {
        if(viewTaskEstDurationEl) viewTaskEstDurationEl.textContent = formatDuration(task.estimatedHours, task.estimatedMinutes);
        if(taskTimerSectionEl) taskTimerSectionEl.classList.add('hidden');
    }

    if (isFeatureEnabled('fileAttachments') && viewTaskAttachmentsListEl) {
        viewTaskAttachmentsListEl.textContent = task.attachments && task.attachments.length > 0 ? `Contains ${task.attachments.length} attachment(s).` : 'No attachments.';
        if(viewTaskAttachmentsSectionEl) viewTaskAttachmentsSectionEl.classList.remove('hidden');
    } else if (viewTaskAttachmentsSectionEl) {
        viewTaskAttachmentsSectionEl.classList.add('hidden');
    }

    if(viewTaskPriorityEl) viewTaskPriorityEl.textContent = task.priority || 'Not set';
    if(viewTaskStatusEl) viewTaskStatusEl.textContent = task.completed ? 'Completed' : 'Active';
    if(viewTaskLabelEl) viewTaskLabelEl.textContent = task.label || 'None';

    const projectSectionInView = viewTaskProjectEl ? viewTaskProjectEl.closest('.project-feature-element') : null;
    if (isFeatureEnabled('projectFeature') && viewTaskProjectEl) {
        const currentProjects = AppStore.getProjects();
        const project = currentProjects.find(p => p.id === task.projectId);
        viewTaskProjectEl.textContent = project && project.id !== 0 ? project.name : 'None';
        if (projectSectionInView) projectSectionInView.classList.remove('hidden');
    } else if (projectSectionInView) {
        projectSectionInView.classList.add('hidden');
    }

    if(viewTaskNotesEl) viewTaskNotesEl.textContent = task.notes || 'No notes added.';

    if (isFeatureEnabled('reminderFeature') && viewTaskReminderSectionEl) {
        viewTaskReminderSectionEl.classList.remove('hidden');
        if (task.isReminderSet) {
            if(viewTaskReminderStatusEl) viewTaskReminderStatusEl.textContent = 'Active';
            if (viewTaskReminderDateEl) viewTaskReminderDateEl.textContent = task.reminderDate ? formatDate(task.reminderDate) : 'Not set';
            if (viewTaskReminderTimeEl) viewTaskReminderTimeEl.textContent = task.reminderTime ? formatTime(task.reminderTime) : 'Not set';
            if (viewTaskReminderEmailEl) viewTaskReminderEmailEl.textContent = task.reminderEmail || 'Not set';
            if (viewTaskReminderDetailsEl) viewTaskReminderDetailsEl.classList.remove('hidden');
        } else {
            if(viewTaskReminderStatusEl) viewTaskReminderStatusEl.textContent = 'Not set';
            if (viewTaskReminderDetailsEl) viewTaskReminderDetailsEl.classList.add('hidden');
        }
    } else if (viewTaskReminderSectionEl) {
        viewTaskReminderSectionEl.classList.add('hidden');
    }

    if (isFeatureEnabled('subTasksFeature') && modalSubTasksListViewDetailsEl && viewSubTaskProgressEl && noSubTasksMessageViewDetailsEl) {
        if (subTasksSectionViewDetailsEl) subTasksSectionViewDetailsEl.classList.remove('hidden');
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

    if (!viewTaskDetailsModalEl || !modalDialogViewDetailsEl) { console.error("[OpenViewDetailsModal] Core view details modal DOM elements not found."); return; }
    viewTaskDetailsModalEl.classList.remove('hidden');
    setTimeout(() => { modalDialogViewDetailsEl.classList.remove('scale-95', 'opacity-0'); modalDialogViewDetailsEl.classList.add('scale-100', 'opacity-100'); }, 10);
}

export function closeViewTaskDetailsModal() {
    const viewTaskDetailsModalEl = document.getElementById('viewTaskDetailsModal');
    const modalDialogViewDetailsEl = document.getElementById('modalDialogViewDetails');
    if (!modalDialogViewDetailsEl || !viewTaskDetailsModalEl) return;
    modalDialogViewDetailsEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        viewTaskDetailsModalEl.classList.add('hidden');
        if (isFeatureEnabled('taskTimerSystem') && TaskTimerSystemFeature?.clearTimerOnModalClose) {
            TaskTimerSystemFeature.clearTimerOnModalClose();
        }
        if (ModalStateService) ModalStateService.setCurrentViewTaskId(null);
    }, 200);
}

export function openManageLabelsModal() {
    const manageLabelsModalEl = document.getElementById('manageLabelsModal');
    const modalDialogManageLabelsEl = document.getElementById('modalDialogManageLabels');
    const newLabelInputEl = document.getElementById('newLabelInput');
    if (!manageLabelsModalEl || !modalDialogManageLabelsEl || !newLabelInputEl) { console.error("[OpenManageLabelsModal] Core manage labels modal DOM elements not found."); return; }
    populateManageLabelsList();
    manageLabelsModalEl.classList.remove('hidden');
    setTimeout(() => { modalDialogManageLabelsEl.classList.remove('scale-95', 'opacity-0'); modalDialogManageLabelsEl.classList.add('scale-100', 'opacity-100'); }, 10);
    newLabelInputEl.focus();
}

export function closeManageLabelsModal() {
    const manageLabelsModalEl = document.getElementById('manageLabelsModal');
    const modalDialogManageLabelsEl = document.getElementById('modalDialogManageLabels');
    if (!modalDialogManageLabelsEl || !manageLabelsModalEl) return;
    modalDialogManageLabelsEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { manageLabelsModalEl.classList.add('hidden'); }, 200);
}

export function populateManageLabelsList() {
    const existingLabelsListEl = document.getElementById('existingLabelsList');
    if (!existingLabelsListEl || !AppStore || typeof AppStore.getUniqueLabels !== 'function') {
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
        deleteBtn.addEventListener('click', () => handleDeleteLabel(label)); // Uses imported handleDeleteLabel
        li.appendChild(deleteBtn);
        existingLabelsListEl.appendChild(li);
    });
    if (currentUniqueLabels.length === 0) {
        existingLabelsListEl.innerHTML = '<li class="text-slate-500 dark:text-slate-400 text-center">No labels created yet.</li>';
    }
}

export function openSettingsModal() {
    const settingsModalEl = document.getElementById('settingsModal');
    const modalDialogSettingsEl = document.getElementById('modalDialogSettings');
    const settingsClearCompletedBtnEl = document.getElementById('settingsClearCompletedBtn'); // For updateClearCompletedButtonState

    if (!settingsModalEl || !modalDialogSettingsEl) { console.error("[OpenSettingsModal] Core settings modal DOM elements not found."); return; }
    settingsModalEl.classList.remove('hidden');
    setTimeout(() => { modalDialogSettingsEl.classList.remove('scale-95', 'opacity-0'); modalDialogSettingsEl.classList.add('scale-100', 'opacity-100'); }, 10);

    // updateClearCompletedButtonState might be better called via an event or when tasks actually change.
    // For now, if ui_rendering.js exports it and it's needed on modal open:
    // import { updateClearCompletedButtonState } from './ui_rendering.js'; // (add to imports if not already)
    // if (settingsClearCompletedBtnEl) updateClearCompletedButtonState();
    // However, looking at original code, it seems ui_rendering.js updateClearCompletedButtonState
    // directly uses AppStore.getTasks(), so it doesn't strictly need the button element passed.
    // Let's assume ui_rendering's version handles its own DOM interaction if needed.
    // If `ui_rendering.js` exports `updateClearCompletedButtonState` and you want to call it:
    // (async () => {
    //   const uiRendering = await import('./ui_rendering.js');
    //   if (uiRendering.updateClearCompletedButtonState) uiRendering.updateClearCompletedButtonState();
    // })();
}

export function closeSettingsModal() {
    const settingsModalEl = document.getElementById('settingsModal');
    const modalDialogSettingsEl = document.getElementById('modalDialogSettings');
    if (!modalDialogSettingsEl || !settingsModalEl) return;
    modalDialogSettingsEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { settingsModalEl.classList.add('hidden'); }, 200);
}

export function openTaskReviewModal() {
    const taskReviewModalEl = document.getElementById('taskReviewModal');
    const modalDialogTaskReviewEl = document.getElementById('modalDialogTaskReview');
    if (!isFeatureEnabled('taskTimerSystem')) {
        showMessage("Task Timer System feature is currently disabled.", "error"); // showMessage imported
        return;
    }
    if (!taskReviewModalEl || !modalDialogTaskReviewEl) { console.error("[OpenTaskReviewModal] Core task review modal DOM elements not found."); return; }
    populateTaskReviewModal(); // Call local helper
    taskReviewModalEl.classList.remove('hidden');
    setTimeout(() => { modalDialogTaskReviewEl.classList.remove('scale-95', 'opacity-0'); modalDialogTaskReviewEl.classList.add('scale-100', 'opacity-100'); }, 10);
}

export function closeTaskReviewModal() {
    const taskReviewModalEl = document.getElementById('taskReviewModal');
    const modalDialogTaskReviewEl = document.getElementById('modalDialogTaskReview');
    if (!modalDialogTaskReviewEl || !taskReviewModalEl) return;
    modalDialogTaskReviewEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { taskReviewModalEl.classList.add('hidden'); }, 200);
}

// This is a local helper function for openTaskReviewModal
function populateTaskReviewModal() {
    const taskReviewContentEl = document.getElementById('taskReviewContent');
    if (!taskReviewContentEl || !AppStore || typeof AppStore.getTasks !== 'function') return;
    taskReviewContentEl.innerHTML = '';
    const currentTasks = AppStore.getTasks();
    const completedTasksWithTime = currentTasks.filter(task => task.completed && ((task.estimatedHours && task.estimatedHours > 0) || (task.estimatedMinutes && task.estimatedMinutes > 0) || (task.actualDurationMs && task.actualDurationMs > 0))).sort((a,b) => (b.completedDate || 0) - (a.completedDate || 0));
    if (completedTasksWithTime.length === 0) {
        taskReviewContentEl.innerHTML = '<p class="text-slate-500 dark:text-slate-400 text-center">No completed tasks with time data.</p>';
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
        if (typeof formatMillisecondsToHMS === 'function') { // This function is now imported
            const actualP = document.createElement('p');
            actualP.className = 'text-sm text-slate-600 dark:text-slate-300';
            actualP.innerHTML = `<strong>Actual:</strong> ${task.actualDurationMs > 0 ? formatMillisecondsToHMS(task.actualDurationMs) : 'Not recorded'}`;
            itemDiv.appendChild(actualP);
        }
        if (task.completedDate && typeof formatDate === 'function') {
            const completedOnP = document.createElement('p');
            completedOnP.className = 'text-xs text-slate-400 dark:text-slate-500 mt-1';
            completedOnP.textContent = `Completed on: ${formatDate(new Date(task.completedDate))}`; // formatDate expects Date object or string
            itemDiv.appendChild(completedOnP);
        }
        taskReviewContentEl.appendChild(itemDiv);
    });
}

export function openTooltipsGuideModal() {
    const tooltipsGuideModalEl = document.getElementById('tooltipsGuideModal');
    const modalDialogTooltipsGuideEl = document.getElementById('modalDialogTooltipsGuide');
    if (!isFeatureEnabled('tooltipsGuide')) {
        showMessage("Tooltips Guide feature is disabled.", "error"); // showMessage imported
        return;
    }
    if (!tooltipsGuideModalEl || !modalDialogTooltipsGuideEl) { console.error("[OpenTooltipsGuideModal] Core tooltips modal DOM elements not found."); return; }
    tooltipsGuideModalEl.classList.remove('hidden');
    setTimeout(() => { modalDialogTooltipsGuideEl.classList.remove('scale-95', 'opacity-0'); modalDialogTooltipsGuideEl.classList.add('scale-100', 'opacity-100'); }, 10);
}

export function closeTooltipsGuideModal() {
    const tooltipsGuideModalEl = document.getElementById('tooltipsGuideModal');
    const modalDialogTooltipsGuideEl = document.getElementById('modalDialogTooltipsGuide');
    if (!modalDialogTooltipsGuideEl || !tooltipsGuideModalEl) return;
    modalDialogTooltipsGuideEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { tooltipsGuideModalEl.classList.add('hidden'); }, 200);
}

console.log("modal_interactions.js updated: uses getElementById, imports, and new tempSubTask clearing.");