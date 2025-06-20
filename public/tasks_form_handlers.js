// tasks_form_handlers.js
// Handles form submission logic for various forms in the Task Manager.

import AppStore from './store.js';
import ViewManager from './viewManager.js';
import * as TaskService from './taskService.js';
import * as LabelService from './labelService.js';
import EventBus from './eventBus.js';
import LoggingService from './loggingService.js';
import { clearTempSubTasksForAddModal, tempSubTasksForAddModal } from './tasks_ui_event_handlers.js';

// Import UI and Modal functions from their new tasks-specific locations
import {
    closeAddModal,
    closeViewEditModal
} from './tasks_modal_interactions.js';
import { refreshTaskView } from './tasks_ui_rendering.js';

// A local helper function to use, since the global one is in main.js
function isFeatureEnabled(featureName) {
    return window.isFeatureEnabled(featureName);
}

export async function handleAddTaskFormSubmit(event) {
    const functionName = 'handleAddTaskFormSubmit';
    event.preventDefault();
    LoggingService.info('[TasksFormHandlers] Attempting to add task.', { functionName });

    const modalTaskInputAddEl = document.getElementById('modalTaskInputAdd');
    const modalDueDateInputAddEl = document.getElementById('modalDueDateInputAdd');
    const modalTimeInputAddEl = document.getElementById('modalTimeInputAdd');
    const modalPriorityInputAddEl = document.getElementById('modalPriorityInputAdd');
    const modalLabelInputAddEl = document.getElementById('modalLabelInputAdd');
    const modalNotesInputAddEl = document.getElementById('modalNotesInputAdd');
    const modalProjectSelectAddEl = document.getElementById('modalProjectSelectAdd');
    const modalRemindMeAddEl = document.getElementById('modalRemindMeAdd');
    const modalReminderDateAddEl = document.getElementById('modalReminderDateAdd');
    const modalReminderTimeAddEl = document.getElementById('modalReminderTimeAdd');
    const modalReminderEmailAddEl = document.getElementById('modalReminderEmailAdd');
    const modalRecurrenceAddEl = document.getElementById('modalRecurrenceAdd');

    const taskText = modalTaskInputAddEl.value.trim();
    const dueDate = modalDueDateInputAddEl.value;
    const time = modalTimeInputAddEl.value;
    const priority = modalPriorityInputAddEl.value;
    const label = modalLabelInputAddEl.value.trim();
    const notes = modalNotesInputAddEl.value.trim();
    const projectId = isFeatureEnabled('projectFeature') && modalProjectSelectAddEl ? parseInt(modalProjectSelectAddEl.value) : 0;
    
    let recurrence = null;
    if (isFeatureEnabled('advancedRecurrence') && modalRecurrenceAddEl && modalRecurrenceAddEl.value !== 'none') {
        const recurrenceIntervalAddEl = document.getElementById('recurrenceIntervalAdd');
        const weeklyRecurrenceOptionsAddEl = document.getElementById('weeklyRecurrenceOptionsAdd');
        const recurrenceEndDateAddEl = document.getElementById('recurrenceEndDateAdd');
        
        recurrence = { 
            frequency: modalRecurrenceAddEl.value,
            interval: parseInt(recurrenceIntervalAddEl.value) || 1
        };

        if (recurrence.frequency === 'weekly') {
            const checkedDays = weeklyRecurrenceOptionsAddEl.querySelectorAll('input[type="checkbox"]:checked');
            recurrence.daysOfWeek = Array.from(checkedDays).map(cb => cb.value);
            if (recurrence.daysOfWeek.length === 0) {
                EventBus.publish('displayUserMessage', { text: 'Please select at least one day for weekly recurrence.', type: 'error' });
                return;
            }
        }

        if (recurrenceEndDateAddEl && recurrenceEndDateAddEl.value) {
            recurrence.endDate = recurrenceEndDateAddEl.value;
        }
    }

    let isReminderSet = false, reminderDate = null, reminderTime = null, reminderEmail = null;
    if (isFeatureEnabled('reminderFeature') && modalRemindMeAddEl && modalRemindMeAddEl.checked) {
        isReminderSet = true;
        reminderDate = modalReminderDateAddEl.value;
        reminderTime = modalReminderTimeAddEl.value;
        reminderEmail = modalReminderEmailAddEl.value.trim();
        if (!reminderDate || !reminderTime || !reminderEmail) {
            LoggingService.warn('[TasksFormHandlers] Reminder fields not completely filled for new task.', { functionName, reminderDate, reminderTime, reminderEmail });
            EventBus.publish('displayUserMessage', { text: 'Please fill all reminder fields or disable the reminder.', type: 'error' });
            return;
        }
    }

    if (taskText) {
        let parsedResult = { parsedDate: dueDate, remainingText: taskText };
        if (!dueDate && TaskService.parseDateFromText) {
            parsedResult = TaskService.parseDateFromText(taskText);
        }

        const subTasksToAdd = isFeatureEnabled('subTasksFeature') ? [...tempSubTasksForAddModal] : [];

        await TaskService.addTask({
            text: parsedResult.remainingText,
            dueDate: parsedResult.parsedDate || dueDate,
            time, priority, label, notes, projectId,
            isReminderSet, reminderDate, reminderTime, reminderEmail,
            subTasks: subTasksToAdd,
            recurrence
        });
        EventBus.publish('displayUserMessage', { text: 'Task added successfully!', type: 'success' });
        closeAddModal();
        clearTempSubTasksForAddModal();
        
        if (ViewManager.getCurrentFilter() !== 'inbox') {
            ViewManager.setCurrentFilter('inbox');
        } else {
             refreshTaskView();
        }
    } else {
        EventBus.publish('displayUserMessage', { text: 'Task description cannot be empty.', type: 'error' });
    }
}

export async function handleEditTaskFormSubmit(event) {
    const functionName = 'handleEditTaskFormSubmit';
    event.preventDefault();
    const modalViewEditTaskIdEl = document.getElementById('modalViewEditTaskId');
    const taskId = parseInt(modalViewEditTaskIdEl.value);
    LoggingService.info(`[TasksFormHandlers] Attempting to edit task ID: ${taskId}.`, { functionName, taskId });

    const modalTaskInputViewEditEl = document.getElementById('modalTaskInputViewEdit');
    const modalDueDateInputViewEditEl = document.getElementById('modalDueDateInputViewEdit');
    const modalTimeInputViewEditEl = document.getElementById('modalTimeInputViewEdit');
    const modalPriorityInputViewEditEl = document.getElementById('modalPriorityInputViewEdit');
    const modalLabelInputViewEditEl = document.getElementById('modalLabelInputViewEdit');
    const modalNotesInputViewEditEl = document.getElementById('modalNotesInputViewEdit');
    const modalProjectSelectViewEditEl = document.getElementById('modalProjectSelectViewEdit');
    const modalRemindMeViewEditEl = document.getElementById('modalRemindMeViewEdit');
    const modalReminderDateViewEditEl = document.getElementById('modalReminderDateViewEdit');
    const modalReminderTimeViewEditEl = document.getElementById('modalReminderTimeViewEdit');
    const modalReminderEmailViewEditEl = document.getElementById('modalReminderEmailViewEdit');
    const modalRecurrenceViewEditEl = document.getElementById('modalRecurrenceViewEdit');

    const taskText = modalTaskInputViewEditEl.value.trim();
    const dueDate = modalDueDateInputViewEditEl.value;
    const time = modalTimeInputViewEditEl.value;
    const priority = modalPriorityInputViewEditEl.value;
    const label = modalLabelInputViewEditEl.value.trim();
    const notes = modalNotesInputViewEditEl.value.trim();
    const projectId = isFeatureEnabled('projectFeature') && modalProjectSelectViewEditEl ? parseInt(modalProjectSelectViewEditEl.value) : 0;

    let recurrence = null;
    if (isFeatureEnabled('advancedRecurrence') && modalRecurrenceViewEditEl) {
        if (modalRecurrenceViewEditEl.value !== 'none') {
            const recurrenceIntervalViewEditEl = document.getElementById('recurrenceIntervalViewEdit');
            const weeklyRecurrenceOptionsViewEditEl = document.getElementById('weeklyRecurrenceOptionsViewEdit');
            const recurrenceEndDateViewEditEl = document.getElementById('recurrenceEndDateViewEdit');
            
            recurrence = {
                frequency: modalRecurrenceViewEditEl.value,
                interval: parseInt(recurrenceIntervalViewEditEl.value) || 1
            };

            if (recurrence.frequency === 'weekly') {
                const checkedDays = weeklyRecurrenceOptionsViewEditEl.querySelectorAll('input[type="checkbox"]:checked');
                recurrence.daysOfWeek = Array.from(checkedDays).map(cb => cb.value);
                if (recurrence.daysOfWeek.length === 0) {
                    EventBus.publish('displayUserMessage', { text: 'Please select at least one day for weekly recurrence.', type: 'error' });
                    return;
                }
            }

            if (recurrenceEndDateViewEditEl && recurrenceEndDateViewEditEl.value) {
                recurrence.endDate = recurrenceEndDateViewEditEl.value;
            }
        }
    }

    let isReminderSet = false, reminderDate = null, reminderTime = null, reminderEmail = null;
    if (isFeatureEnabled('reminderFeature') && modalRemindMeViewEditEl && modalRemindMeViewEditEl.checked) {
        isReminderSet = true;
        reminderDate = modalReminderDateViewEditEl.value;
        reminderTime = modalReminderTimeViewEditEl.value;
        reminderEmail = modalReminderEmailViewEditEl.value.trim();
        if (!reminderDate || !reminderTime || !reminderEmail) {
            EventBus.publish('displayUserMessage', { text: 'Please fill all reminder fields or disable the reminder for edit.', type: 'error' });
            return;
        }
    }

    if (taskText && taskId) {
        const taskUpdateData = {
            text: taskText, dueDate, time, priority, label, notes, projectId,
            isReminderSet, reminderDate, reminderTime, reminderEmail,
            recurrence
        };

        await TaskService.updateTask(taskId, taskUpdateData);
        EventBus.publish('displayUserMessage', { text: 'Task updated successfully!', type: 'success' });
        closeViewEditModal();
    } else {
        EventBus.publish('displayUserMessage', { text: 'Task description cannot be empty.', type: 'error' });
    }
}


export async function handleAddNewLabelFormSubmit(event) {
    const functionName = 'handleAddNewLabelFormSubmit';
    event.preventDefault();
    const newLabelInputEl = document.getElementById('newLabelInput');
    const labelName = newLabelInputEl.value.trim();
    LoggingService.info(`[TasksFormHandlers] Attempting to add new label: "${labelName}".`, { functionName, labelName });

    if (LabelService.addConceptualLabel(labelName)) {
        newLabelInputEl.value = '';
        const { populateManageLabelsList } = await import('./tasks_modal_interactions.js');
        const manageLabelsModalEl = document.getElementById('manageLabelsModal');
        if (manageLabelsModalEl && !manageLabelsModalEl.classList.contains('hidden')) {
             populateManageLabelsList();
        }
    }
}