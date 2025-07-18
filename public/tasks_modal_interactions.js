// tasks_modal_interactions.js
// Manages modal dialogs for the Task Manager (Add, Edit, View, Settings, etc.)

import AppStore from './store.js';
import ModalStateService from './modalStateService.js';
import { formatDate, formatTime, getTodayDateString } from './utils.js';
import EventBus from './eventBus.js';
import LoggingService from './loggingService.js';

import {
    populateDatalist,
} from './tasks_ui_rendering.js';

import { handleDeleteLabel, clearTempSubTasksForAddModal } from './tasks_ui_event_handlers.js';
import { ProjectsFeature } from './feature_projects.js';
import { DesktopNotificationsFeature } from './feature_desktop_notifications.js';
import { AdvancedRecurrenceFeature } from './feature_advanced_recurrence.js';


export function openAddModal() {
    const functionName = 'openAddModal';
    LoggingService.debug(`[TasksModalInteractions] Attempting to open Add Task Modal.`, { functionName });

    const addTaskModalEl = document.getElementById('addTaskModal');
    const modalDialogAddEl = document.getElementById('modalDialogAdd');
    const modalTaskInputAddEl = document.getElementById('modalTaskInputAdd');
    const modalTodoFormAddEl = document.getElementById('modalTodoFormAdd');
    const modalPriorityInputAddEl = document.getElementById('modalPriorityInputAdd');
    const existingLabelsDatalistEl = document.getElementById('existingLabels');
    const modalProjectSelectAddEl = document.getElementById('modalProjectSelectAdd');
    const modalRemindMeAddEl = document.getElementById('modalRemindMeAdd');
    const modalReminderDateAddEl = document.getElementById('modalReminderDateAdd');
    const modalReminderTimeAddEl = document.getElementById('modalReminderTimeAdd');
    const modalReminderEmailAddEl = document.getElementById('modalReminderEmailAdd');
    const reminderOptionsAddEl = document.getElementById('reminderOptionsAdd');
    const modalDueDateInputAddEl = document.getElementById('modalDueDateInputAdd');
    const modalRecurrenceAddEl = document.getElementById('modalRecurrenceAdd');
    const recurrenceOptionsAddEl = document.getElementById('recurrenceOptionsAdd');
    const recurrenceEndDateAddEl = document.getElementById('recurrenceEndDateAdd');


    if (!addTaskModalEl || !modalDialogAddEl || !modalTaskInputAddEl || !modalTodoFormAddEl || !modalPriorityInputAddEl) {
        LoggingService.error("[TasksModalInteractions] Core Add Task modal elements not found in DOM.", new Error("DOMElementMissing"), { functionName });
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

    if (window.isFeatureEnabled('projectFeature') && ProjectsFeature?.populateProjectDropdowns) {
        ProjectsFeature.populateProjectDropdowns();
        if (modalProjectSelectAddEl) modalProjectSelectAddEl.value = "0";
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

    LoggingService.info(`[TasksModalInteractions] Add Task Modal opened.`, { functionName });
}

export function closeAddModal() {
    const functionName = 'closeAddModal';
    LoggingService.debug(`[TasksModalInteractions] Attempting to close Add Task Modal.`, { functionName });
    const addTaskModalEl = document.getElementById('addTaskModal');
    const modalDialogAddEl = document.getElementById('modalDialogAdd');

    if (!modalDialogAddEl || !addTaskModalEl) {
        LoggingService.warn(`[TasksModalInteractions] Add Task Modal elements not found for closing.`, { functionName });
        return;
    }
    modalDialogAddEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        addTaskModalEl.classList.add('hidden');
        clearTempSubTasksForAddModal();
        LoggingService.info(`[TasksModalInteractions] Add Task Modal closed.`, { functionName });
    }, 200);
}

export function openViewEditModal(taskId) {
    const functionName = 'openViewEditModal';
    LoggingService.debug(`[TasksModalInteractions] Attempting to open View/Edit Modal for task ID: ${taskId}.`, { functionName, taskId });

    const viewEditTaskModalEl = document.getElementById('viewEditTaskModal');
    const modalDialogViewEditEl = document.getElementById('modalDialogViewEdit');
    const modalViewEditTaskIdEl = document.getElementById('modalViewEditTaskId');
    const modalTaskInputViewEditEl = document.getElementById('modalTaskInputViewEdit');
    const modalDueDateInputViewEditEl = document.getElementById('modalDueDateInputViewEdit');
    const modalTimeInputViewEditEl = document.getElementById('modalTimeInputViewEdit');
    const modalPriorityInputViewEditEl = document.getElementById('modalPriorityInputViewEdit');
    const modalLabelInputViewEditEl = document.getElementById('modalLabelInputViewEdit');
    const existingLabelsEditDatalistEl = document.getElementById('existingLabelsEdit');
    const modalProjectSelectViewEditEl = document.getElementById('modalProjectSelectViewEdit');
    const modalNotesInputViewEditEl = document.getElementById('modalNotesInputViewEdit');
    const modalRemindMeViewEditEl = document.getElementById('modalRemindMeViewEdit');
    const reminderOptionsViewEditEl = document.getElementById('reminderOptionsViewEdit');
    const modalReminderDateViewEditEl = document.getElementById('modalReminderDateViewEdit');
    const modalReminderTimeViewEditEl = document.getElementById('modalReminderTimeViewEdit');
    const modalReminderEmailViewEditEl = document.getElementById('modalReminderEmailViewEdit');
    const modalRecurrenceViewEditEl = document.getElementById('modalRecurrenceViewEdit');
    const recurrenceEndDateViewEditEl = document.getElementById('recurrenceEndDateViewEdit');


    if (!AppStore || typeof AppStore.getTasks !== 'function' || !ModalStateService) {
        LoggingService.error("[TasksModalInteractions] Core dependencies (AppStore, ModalStateService) not available.", new Error("CoreDependenciesMissing"), { functionName, taskId });
        return;
    }
    const currentTasks = AppStore.getTasks();
    const task = currentTasks.find(t => t.id === taskId);
    if (!task) {
        LoggingService.error(`[TasksModalInteractions] Task with ID ${taskId} not found for View/Edit Modal.`, new Error("TaskNotFound"), { functionName, taskId });
        return;
    }

    ModalStateService.setEditingTaskId(taskId);

    if (modalViewEditTaskIdEl) modalViewEditTaskIdEl.value = task.id;
    if (modalTaskInputViewEditEl) modalTaskInputViewEditEl.value = task.text;
    if (modalDueDateInputViewEditEl) modalDueDateInputViewEditEl.value = task.dueDate || '';
    if (modalTimeInputViewEditEl) modalTimeInputViewEditEl.value = task.time || '';

    if (modalPriorityInputViewEditEl) modalPriorityInputViewEditEl.value = task.priority;
    if (modalLabelInputViewEditEl) modalLabelInputViewEditEl.value = task.label || '';
    if (existingLabelsEditDatalistEl) populateDatalist(existingLabelsEditDatalistEl);

    if (window.isFeatureEnabled('projectFeature') && ProjectsFeature?.populateProjectDropdowns) {
        ProjectsFeature.populateProjectDropdowns();
        if (modalProjectSelectViewEditEl) modalProjectSelectViewEditEl.value = task.projectId || "0";
    }

    if (window.isFeatureEnabled('advancedRecurrence') && modalRecurrenceViewEditEl) {
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

    if (window.isFeatureEnabled('reminderFeature') && modalRemindMeViewEditEl) {
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

    if (!viewEditTaskModalEl || !modalDialogViewEditEl) {
        LoggingService.error("[TasksModalInteractions] Core View/Edit modal DOM elements not found.", new Error("DOMElementMissing"), { functionName, taskId });
        return;
    }
    viewEditTaskModalEl.classList.remove('hidden');
    setTimeout(() => { modalDialogViewEditEl.classList.remove('scale-95', 'opacity-0'); modalDialogViewEditEl.classList.add('scale-100', 'opacity-100'); }, 10);
    if(modalTaskInputViewEditEl) modalTaskInputViewEditEl.focus();
    LoggingService.info(`[TasksModalInteractions] View/Edit Modal opened for task ID: ${taskId}.`, { functionName, taskId });
}

export function closeViewEditModal() {
    const functionName = 'closeViewEditModal';
    LoggingService.debug(`[TasksModalInteractions] Attempting to close View/Edit Modal.`, { functionName, editingTaskId: ModalStateService.getEditingTaskId() });
    const viewEditTaskModalEl = document.getElementById('viewEditTaskModal');
    const modalDialogViewEditEl = document.getElementById('modalDialogViewEdit');
    if (!modalDialogViewEditEl || !viewEditTaskModalEl) {
        LoggingService.warn(`[TasksModalInteractions] View/Edit Modal elements not found for closing.`, { functionName });
        return;
    }
    modalDialogViewEditEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        viewEditTaskModalEl.classList.add('hidden');
        if (ModalStateService) ModalStateService.setEditingTaskId(null);
        LoggingService.info(`[TasksModalInteractions] View/Edit Modal closed.`, { functionName });
    }, 200);
}

export function openViewTaskDetailsModal(taskId) {
    const functionName = 'openViewTaskDetailsModal';
    LoggingService.debug(`[TasksModalInteractions] Attempting to open View Task Details Modal for task ID: ${taskId}.`, { functionName, taskId });

    const viewTaskDetailsModalEl = document.getElementById('viewTaskDetailsModal');
    const modalDialogViewDetailsEl = document.getElementById('modalDialogViewDetails');
    const viewTaskTextEl = document.getElementById('viewTaskText');
    const viewTaskDueDateEl = document.getElementById('viewTaskDueDate');
    const viewTaskTimeEl = document.getElementById('viewTaskTime');
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

    if (!AppStore || typeof AppStore.getTasks !== 'function' || !ModalStateService) {
        LoggingService.error("[TasksModalInteractions] Core dependencies not available for View Task Details.", new Error("CoreDependenciesMissing"), { functionName, taskId });
        return;
    }
    const currentTasks = AppStore.getTasks();
    const task = currentTasks.find(t => t.id === taskId);
    if (!task) {
        LoggingService.error(`[TasksModalInteractions] Task with ID ${taskId} not found for View Task Details Modal.`, new Error("TaskNotFound"), { functionName, taskId });
        return;
    }
    ModalStateService.setCurrentViewTaskId(taskId);

    if(viewTaskTextEl) viewTaskTextEl.textContent = task.text; else LoggingService.warn(`[${functionName}] viewTaskTextEl not found.`, {taskId});
    if(viewTaskDueDateEl) viewTaskDueDateEl.textContent = task.dueDate ? formatDate(task.dueDate) : 'Not set';
    if(viewTaskTimeEl) viewTaskTimeEl.textContent = task.time ? formatTime(task.time) : 'Not set';

    if(viewTaskPriorityEl) viewTaskPriorityEl.textContent = task.priority || 'Not set';
    if(viewTaskStatusEl) viewTaskStatusEl.textContent = task.completed ? 'Completed' : 'Active';
    if(viewTaskLabelEl) viewTaskLabelEl.textContent = task.label || 'None';

    if (window.isFeatureEnabled('projectFeature') && viewTaskProjectEl) {
        const project = AppStore.getProjects().find(p => p.id === task.projectId);
        viewTaskProjectEl.textContent = project ? project.name : 'No Project';
        viewTaskProjectEl.closest('div.project-feature-element')?.classList.remove('hidden');
    } else if (viewTaskProjectEl) {
         viewTaskProjectEl.closest('div.project-feature-element')?.classList.add('hidden');
    }

    if(viewTaskNotesEl) viewTaskNotesEl.textContent = task.notes || 'No notes added.';

    if (window.isFeatureEnabled('reminderFeature') && viewTaskReminderSectionEl) {
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

    if (!viewTaskDetailsModalEl || !modalDialogViewDetailsEl) {
        LoggingService.error("[TasksModalInteractions] Core View Task Details modal DOM elements not found.", new Error("DOMElementMissing"), { functionName, taskId });
        return;
    }
    viewTaskDetailsModalEl.classList.remove('hidden');
    setTimeout(() => { modalDialogViewDetailsEl.classList.remove('scale-95', 'opacity-0'); modalDialogViewDetailsEl.classList.add('scale-100', 'opacity-100'); }, 10);
    LoggingService.info(`[TasksModalInteractions] View Task Details Modal opened for task ID: ${taskId}.`, { functionName, taskId });
}

export function closeViewTaskDetailsModal() {
    const functionName = 'closeViewTaskDetailsModal';
    LoggingService.debug(`[TasksModalInteractions] Attempting to close View Task Details Modal.`, { functionName, viewingTaskId: ModalStateService.getCurrentViewTaskId() });
    const viewTaskDetailsModalEl = document.getElementById('viewTaskDetailsModal');
    const modalDialogViewDetailsEl = document.getElementById('modalDialogViewDetails');
    if (!modalDialogViewDetailsEl || !viewTaskDetailsModalEl) {
        LoggingService.warn(`[TasksModalInteractions] View Task Details Modal elements not found for closing.`, { functionName });
        return;
    }
    modalDialogViewDetailsEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        viewTaskDetailsModalEl.classList.add('hidden');
        if (ModalStateService) ModalStateService.setCurrentViewTaskId(null);
        LoggingService.info(`[TasksModalInteractions] View Task Details Modal closed.`, { functionName });
    }, 200);
}

export function openManageLabelsModal() {
    const functionName = 'openManageLabelsModal';
    LoggingService.debug(`[TasksModalInteractions] Attempting to open Manage Labels Modal.`, { functionName });
    const manageLabelsModalEl = document.getElementById('manageLabelsModal');
    const modalDialogManageLabelsEl = document.getElementById('modalDialogManageLabels');
    const newLabelInputEl = document.getElementById('newLabelInput');
    if (!manageLabelsModalEl || !modalDialogManageLabelsEl || !newLabelInputEl) {
        LoggingService.error("[TasksModalInteractions] Core Manage Labels modal DOM elements not found.", new Error("DOMElementMissing"), { functionName });
        return;
    }
    populateManageLabelsList();
    manageLabelsModalEl.classList.remove('hidden');
    setTimeout(() => { modalDialogManageLabelsEl.classList.remove('scale-95', 'opacity-0'); modalDialogManageLabelsEl.classList.add('scale-100', 'opacity-100'); }, 10);
    newLabelInputEl.focus();
    LoggingService.info(`[TasksModalInteractions] Manage Labels Modal opened.`, { functionName });
}

export function closeManageLabelsModal() {
    const functionName = 'closeManageLabelsModal';
    LoggingService.debug(`[TasksModalInteractions] Attempting to close Manage Labels Modal.`, { functionName });
    const manageLabelsModalEl = document.getElementById('manageLabelsModal');
    const modalDialogManageLabelsEl = document.getElementById('modalDialogManageLabels');
    if (!modalDialogManageLabelsEl || !manageLabelsModalEl) {
        LoggingService.warn(`[TasksModalInteractions] Manage Labels Modal elements not found for closing.`, { functionName });
        return;
    }
    modalDialogManageLabelsEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { manageLabelsModalEl.classList.add('hidden'); LoggingService.info(`[TasksModalInteractions] Manage Labels Modal closed.`, { functionName }); }, 200);
}

export function populateManageLabelsList() {
    const functionName = 'populateManageLabelsList';
    const existingLabelsListEl = document.getElementById('existingLabelsList');
    if (!existingLabelsListEl || !AppStore || typeof AppStore.getUniqueLabels !== 'function') {
        LoggingService.error("[TasksModalInteractions] Cannot populate manage labels list. Dependencies missing.", new Error("CoreDependenciesMissing"), { functionName, existingLabelsListElFound: !!existingLabelsListEl, AppStoreAvailable: !!AppStore });
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
    LoggingService.debug(`[TasksModalInteractions] Manage Labels list populated with ${currentUniqueLabels.length} labels.`, { functionName, labelCount: currentUniqueLabels.length });
}

export function openSettingsModal() {
    const functionName = 'openSettingsModal';
    LoggingService.debug(`[TasksModalInteractions] Attempting to open Settings Modal.`, { functionName });
    const settingsModalEl = document.getElementById('settingsModal');
    const modalDialogSettingsEl = document.getElementById('modalDialogSettings');

    if (!settingsModalEl || !modalDialogSettingsEl) {
        LoggingService.error("[TasksModalInteractions] Core Settings modal DOM elements not found.", new Error("DOMElementMissing"), { functionName });
        return;
    }
    settingsModalEl.classList.remove('hidden');
    setTimeout(() => { modalDialogSettingsEl.classList.remove('scale-95', 'opacity-0'); modalDialogSettingsEl.classList.add('scale-100', 'opacity-100'); }, 10);
    LoggingService.info(`[TasksModalInteractions] Settings Modal opened.`, { functionName });
}

export function closeSettingsModal() {
    const functionName = 'closeSettingsModal';
    LoggingService.debug(`[TasksModalInteractions] Attempting to close Settings Modal.`, { functionName });
    const settingsModalEl = document.getElementById('settingsModal');
    const modalDialogSettingsEl = document.getElementById('modalDialogSettings');
    if (!modalDialogSettingsEl || !settingsModalEl) {
        LoggingService.warn(`[TasksModalInteractions] Settings Modal elements not found for closing.`, { functionName });
        return;
    }
    modalDialogSettingsEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { settingsModalEl.classList.add('hidden'); LoggingService.info(`[TasksModalInteractions] Settings Modal closed.`, { functionName }); }, 200);
}

export function openDesktopNotificationsSettingsModal() {
    const functionName = 'openDesktopNotificationsSettingsModal';
    LoggingService.debug(`[TasksModalInteractions] Attempting to open Desktop Notifications Settings Modal.`, { functionName });

    if (!window.isFeatureEnabled('desktopNotificationsFeature')) {
        LoggingService.warn('[TasksModalInteractions] Desktop Notifications feature is disabled. Cannot open settings modal.', { functionName });
        EventBus.publish('displayUserMessage', { text: "Desktop Notifications feature is currently disabled.", type: "info" });
        return;
    }

    const modalEl = document.getElementById('desktopNotificationsSettingsModal');
    const dialogEl = document.getElementById('modalDialogDesktopNotificationsSettings');

    if (!modalEl || !dialogEl) {
        LoggingService.error("[TasksModalInteractions] Core Desktop Notifications Settings modal DOM elements not found.", new Error("DOMElementMissing"), { functionName });
        return;
    }

    modalEl.classList.remove('hidden');
    setTimeout(() => {
        dialogEl.classList.remove('scale-95', 'opacity-0');
        dialogEl.classList.add('scale-100', 'opacity-100');
        if (DesktopNotificationsFeature && typeof DesktopNotificationsFeature.refreshSettingsUIDisplay === 'function') {
            DesktopNotificationsFeature.refreshSettingsUIDisplay();
        } else {
            LoggingService.warn('[TasksModalInteractions] DesktopNotificationsFeature.refreshSettingsUIDisplay is not available.', { functionName });
        }
    }, 10);
    LoggingService.info(`[TasksModalInteractions] Desktop Notifications Settings Modal opened.`, { functionName });
}

export function closeDesktopNotificationsSettingsModal() {
    const functionName = 'closeDesktopNotificationsSettingsModal';
    LoggingService.debug(`[TasksModalInteractions] Attempting to close Desktop Notifications Settings Modal.`, { functionName });

    const modalEl = document.getElementById('desktopNotificationsSettingsModal');
    const dialogEl = document.getElementById('modalDialogDesktopNotificationsSettings');

    if (!modalEl || !dialogEl) {
        LoggingService.warn("[TasksModalInteractions] Desktop Notifications Settings modal DOM elements not found for closing.", { functionName });
        return;
    }

    dialogEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modalEl.classList.add('hidden');
        LoggingService.info(`[TasksModalInteractions] Desktop Notifications Settings Modal closed.`, { functionName });
    }, 200);
}

LoggingService.debug("tasks_modal_interactions.js loaded", { module: 'tasks_modal_interactions' });