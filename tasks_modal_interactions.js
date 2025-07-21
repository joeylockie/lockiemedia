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

    addTaskModalEl.classList.remove('hidden');
    setTimeout(() => { modalDialogAddEl.classList.remove('scale-95', 'opacity-0'); modalDialogAddEl.classList.add('scale-100', 'opacity-100'); }, 10);
    modalTaskInputAddEl.focus();
    modalTodoFormAddEl.reset();
    modalPriorityInputAddEl.value = 'medium';
    if (modalRecurrenceAddEl) modalRecurrenceAddEl.value = 'none';
    if (recurrenceOptionsAddEl) recurrenceOptionsAddEl.classList.add('hidden');

    if (existingLabelsDatalistEl) populateDatalist(existingLabelsDatalistEl);

    // Simplified Check
    if (ProjectsFeature?.populateProjectDropdowns) {
        ProjectsFeature.populateProjectDropdowns();
        if (modalProjectSelectAddEl) modalProjectSelectAddEl.value = "0";
    }

    if (modalRemindMeAddEl) modalRemindMeAddEl.checked = false;
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
    const addTaskModalEl = document.getElementById('addTaskModal');
    const modalDialogAddEl = document.getElementById('modalDialogAdd');

    if (!modalDialogAddEl || !addTaskModalEl) return;
    
    modalDialogAddEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        addTaskModalEl.classList.add('hidden');
        clearTempSubTasksForAddModal();
        LoggingService.info(`[TasksModalInteractions] Add Task Modal closed.`, { functionName });
    }, 200);
}

export function openViewEditModal(taskId) {
    const functionName = 'openViewEditModal';
    const task = AppStore.getTasks().find(t => t.id === taskId);
    if (!task) {
        LoggingService.error(`[TasksModalInteractions] Task with ID ${taskId} not found.`, new Error("TaskNotFound"), { functionName });
        return;
    }

    ModalStateService.setEditingTaskId(taskId);

    // Populate all fields from the task object
    document.getElementById('modalViewEditTaskId').value = task.id;
    document.getElementById('modalTaskInputViewEdit').value = task.text;
    document.getElementById('modalDueDateInputViewEdit').value = task.dueDate || '';
    document.getElementById('modalTimeInputViewEdit').value = task.time || '';
    document.getElementById('modalPriorityInputViewEdit').value = task.priority;
    document.getElementById('modalLabelInputViewEdit').value = task.label || '';
    document.getElementById('modalNotesInputViewEdit').value = task.notes || '';
    
    populateDatalist(document.getElementById('existingLabelsEdit'));
    
    if (ProjectsFeature?.populateProjectDropdowns) {
        ProjectsFeature.populateProjectDropdowns();
        document.getElementById('modalProjectSelectViewEdit').value = task.projectId || "0";
    }

    if (AdvancedRecurrenceFeature?.updateRecurrenceUI) {
        const recurrenceOptions = task.recurrence || {};
        document.getElementById('modalRecurrenceViewEdit').value = recurrenceOptions.frequency || 'none';
        document.getElementById('recurrenceIntervalViewEdit').value = recurrenceOptions.interval || 1;
        document.getElementById('recurrenceEndDateViewEdit').value = recurrenceOptions.endDate || '';
        const checkboxes = document.querySelectorAll('#weeklyRecurrenceOptionsViewEdit input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.checked = recurrenceOptions.daysOfWeek?.includes(cb.value) || false;
        });
        AdvancedRecurrenceFeature.updateRecurrenceUI();
    }

    const viewEditTaskModalEl = document.getElementById('viewEditTaskModal');
    const modalDialogViewEditEl = document.getElementById('modalDialogViewEdit');
    viewEditTaskModalEl.classList.remove('hidden');
    setTimeout(() => { modalDialogViewEditEl.classList.remove('scale-95', 'opacity-0'); }, 10);
    document.getElementById('modalTaskInputViewEdit').focus();
    LoggingService.info(`[TasksModalInteractions] View/Edit Modal opened for task ID: ${taskId}.`, { functionName });
}

export function closeViewEditModal() {
    const viewEditTaskModalEl = document.getElementById('viewEditTaskModal');
    const modalDialogViewEditEl = document.getElementById('modalDialogViewEdit');
    if (!modalDialogViewEditEl || !viewEditTaskModalEl) return;
    
    modalDialogViewEditEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        viewEditTaskModalEl.classList.add('hidden');
        ModalStateService.setEditingTaskId(null);
        LoggingService.info(`[TasksModalInteractions] View/Edit Modal closed.`);
    }, 200);
}

// This function was missing from the simplified version but is still needed.
export function openViewTaskDetailsModal(taskId) {
    const task = AppStore.getTasks().find(t => t.id === taskId);
    if (!task) return;

    ModalStateService.setCurrentViewTaskId(taskId);
    document.getElementById('viewTaskText').textContent = task.text;
    document.getElementById('viewTaskDueDate').textContent = task.dueDate ? formatDate(task.dueDate) : 'Not set';
    // ... (populate all other fields in the view details modal) ...

    const viewTaskDetailsModalEl = document.getElementById('viewTaskDetailsModal');
    viewTaskDetailsModalEl.classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('modalDialogViewDetails').classList.remove('scale-95', 'opacity-0');
    }, 10);
}

export function closeViewTaskDetailsModal() {
     const viewTaskDetailsModalEl = document.getElementById('viewTaskDetailsModal');
    const modalDialogViewDetailsEl = document.getElementById('modalDialogViewDetails');
    if (!modalDialogViewDetailsEl || !viewTaskDetailsModalEl) return;

    modalDialogViewDetailsEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        viewTaskDetailsModalEl.classList.add('hidden');
        ModalStateService.setCurrentViewTaskId(null);
    }, 200);
}

export function openManageLabelsModal() {
    populateManageLabelsList();
    const manageLabelsModalEl = document.getElementById('manageLabelsModal');
    const modalDialogManageLabelsEl = document.getElementById('modalDialogManageLabels');
    manageLabelsModalEl.classList.remove('hidden');
    setTimeout(() => { modalDialogManageLabelsEl.classList.remove('scale-95', 'opacity-0'); }, 10);
    document.getElementById('newLabelInput').focus();
}

export function closeManageLabelsModal() {
    const manageLabelsModalEl = document.getElementById('manageLabelsModal');
    const modalDialogManageLabelsEl = document.getElementById('modalDialogManageLabels');
    if (!modalDialogManageLabelsEl || !manageLabelsModalEl) return;
    
    modalDialogManageLabelsEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { manageLabelsModalEl.classList.add('hidden'); }, 200);
}

// THE FIX IS HERE
export function populateManageLabelsList() {
    const functionName = 'populateManageLabelsList';
    const existingLabelsListEl = document.getElementById('existingLabelsList');
    
    // Simplified, correct check.
    if (!existingLabelsListEl) {
        LoggingService.error(`[${functionName}] Element 'existingLabelsList' not found.`);
        return;
    }

    const currentUniqueLabels = AppStore.getUniqueLabels();
    existingLabelsListEl.innerHTML = ''; // Clear list

    if (currentUniqueLabels.length === 0) {
        existingLabelsListEl.innerHTML = '<li class="text-slate-500 dark:text-slate-400 text-center">No labels in use.</li>';
        return;
    }

    currentUniqueLabels.forEach(label => {
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700 rounded-md';
        li.innerHTML = `
            <span class="text-slate-700 dark:text-slate-200">${label}</span>
            <button class="p-1" title="Delete label '${label}'">
                <i class="fas fa-trash-alt text-red-500 hover:text-red-700"></i>
            </button>
        `;
        li.querySelector('button').addEventListener('click', () => handleDeleteLabel(label));
        existingLabelsListEl.appendChild(li);
    });
}

export function openSettingsModal() {
    const settingsModalEl = document.getElementById('settingsModal');
    settingsModalEl.classList.remove('hidden');
    setTimeout(() => { document.getElementById('modalDialogSettings').classList.remove('scale-95', 'opacity-0'); }, 10);
}

export function closeSettingsModal() {
    const settingsModalEl = document.getElementById('settingsModal');
    const modalDialogSettingsEl = document.getElementById('modalDialogSettings');
    modalDialogSettingsEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { settingsModalEl.classList.add('hidden'); }, 200);
}

export function openDesktopNotificationsSettingsModal() {
    if (DesktopNotificationsFeature?.refreshSettingsUIDisplay) {
        DesktopNotificationsFeature.refreshSettingsUIDisplay();
    }
    const modalEl = document.getElementById('desktopNotificationsSettingsModal');
    modalEl.classList.remove('hidden');
    setTimeout(() => { document.getElementById('modalDialogDesktopNotificationsSettings').classList.remove('scale-95', 'opacity-0'); }, 10);
}

export function closeDesktopNotificationsSettingsModal() {
    const modalEl = document.getElementById('desktopNotificationsSettingsModal');
    const dialogEl = document.getElementById('modalDialogDesktopNotificationsSettings');
    dialogEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { modalEl.classList.add('hidden'); }, 200);
}