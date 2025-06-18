// formEventHandlers.js
// Handles form submission logic for various forms in the application.

import AppStore from './store.js';
import ViewManager from './viewManager.js';
import { isFeatureEnabled } from './featureFlagService.js';
import * as TaskService from './taskService.js';
import * as LabelService from './labelService.js';
import EventBus from './eventBus.js';
import LoggingService from './loggingService.js';
import { UserAccountsFeature } from './feature_user_accounts.js';
import { TaskTimerSystemFeature } from './task_timer_system.js';
import { clearTempSubTasksForAddModal, tempSubTasksForAddModal } from './ui_event_handlers.js';

// Import UI and Modal functions
import {
    closeAddModal,
    closeViewEditModal
} from './modal_interactions.js';
import { refreshTaskView } from './ui_rendering.js';


export async function handleAddTaskFormSubmit(event) {
    const functionName = 'handleAddTaskFormSubmit';
    event.preventDefault();
    LoggingService.info('[FormEventHandlers] Attempting to add task.', { functionName });

    const modalTaskInputAddEl = document.getElementById('modalTaskInputAdd');
    const modalDueDateInputAddEl = document.getElementById('modalDueDateInputAdd');
    const modalTimeInputAddEl = document.getElementById('modalTimeInputAdd');
    const modalPriorityInputAddEl = document.getElementById('modalPriorityInputAdd');
    const modalLabelInputAddEl = document.getElementById('modalLabelInputAdd');
    const modalNotesInputAddEl = document.getElementById('modalNotesInputAdd');
    const modalProjectSelectAddEl = document.getElementById('modalProjectSelectAdd');
    const modalEstHoursAddEl = document.getElementById('modalEstHoursAdd');
    const modalEstMinutesAddEl = document.getElementById('modalEstMinutesAdd');
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

    let estHours = 0, estMinutes = 0;
    if (isFeatureEnabled('taskTimerSystem') && TaskTimerSystemFeature?.getEstimatesFromAddModal) {
        const estimates = TaskTimerSystemFeature.getEstimatesFromAddModal();
        estHours = estimates.estHours;
        estMinutes = estimates.estMinutes;
    } else if (isFeatureEnabled('taskTimerSystem') && modalEstHoursAddEl && modalEstMinutesAddEl) {
        estHours = parseInt(modalEstHoursAddEl.value) || 0;
        estMinutes = parseInt(modalEstMinutesAddEl.value) || 0;
    }


    let isReminderSet = false, reminderDate = null, reminderTime = null, reminderEmail = null;
    if (isFeatureEnabled('reminderFeature') && modalRemindMeAddEl && modalRemindMeAddEl.checked) {
        isReminderSet = true;
        reminderDate = modalReminderDateAddEl.value;
        reminderTime = modalReminderTimeAddEl.value;
        reminderEmail = modalReminderEmailAddEl.value.trim();
        if (!reminderDate || !reminderTime || !reminderEmail) {
            LoggingService.warn('[FormEventHandlers] Reminder fields not completely filled for new task.', { functionName, reminderDate, reminderTime, reminderEmail });
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
            estimatedHours: estHours, estimatedMinutes: estMinutes,
            subTasks: subTasksToAdd,
            recurrence
        });
        LoggingService.info(`[FormEventHandlers] Task added via form: "${parsedResult.remainingText.substring(0, 30)}..."`, { functionName, taskLength: parsedResult.remainingText.length });
        EventBus.publish('displayUserMessage', { text: 'Task added successfully!', type: 'success' });
        closeAddModal();
        clearTempSubTasksForAddModal();
        
        refreshTaskView();

        if (ViewManager.getCurrentFilter() !== 'inbox') {
            ViewManager.setCurrentFilter('inbox');
        }
    } else {
        LoggingService.warn('[FormEventHandlers] Task description was empty on add attempt.', { functionName });
        EventBus.publish('displayUserMessage', { text: 'Task description cannot be empty.', type: 'error' });
    }
}

export async function handleEditTaskFormSubmit(event) {
    const functionName = 'handleEditTaskFormSubmit';
    event.preventDefault();
    const modalViewEditTaskIdEl = document.getElementById('modalViewEditTaskId');
    const taskId = parseInt(modalViewEditTaskIdEl.value);
    LoggingService.info(`[FormEventHandlers] Attempting to edit task ID: ${taskId}.`, { functionName, taskId });

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

    let estHours = 0, estMinutes = 0;
    if (isFeatureEnabled('taskTimerSystem') && TaskTimerSystemFeature?.getEstimatesFromEditModal) {
        const estimates = TaskTimerSystemFeature.getEstimatesFromEditModal();
        estHours = estimates.estHours;
        estMinutes = estimates.estMinutes;
    }

    let isReminderSet = false, reminderDate = null, reminderTime = null, reminderEmail = null;
    if (isFeatureEnabled('reminderFeature') && modalRemindMeViewEditEl && modalRemindMeViewEditEl.checked) {
        isReminderSet = true;
        reminderDate = modalReminderDateViewEditEl.value;
        reminderTime = modalReminderTimeViewEditEl.value;
        reminderEmail = modalReminderEmailViewEditEl.value.trim();
        if (!reminderDate || !reminderTime || !reminderEmail) {
            LoggingService.warn(`[FormEventHandlers] Reminder fields not completely filled for editing task ID: ${taskId}.`, { functionName, taskId, reminderDate, reminderTime, reminderEmail });
            EventBus.publish('displayUserMessage', { text: 'Please fill all reminder fields or disable the reminder for edit.', type: 'error' });
            return;
        }
    }

    if (taskText && taskId) {
        const taskUpdateData = {
            text: taskText, dueDate, time, priority, label, notes, projectId,
            isReminderSet, reminderDate, reminderTime, reminderEmail,
            estimatedHours: estHours, estimatedMinutes: estMinutes,
            recurrence
        };

        await TaskService.updateTask(taskId, taskUpdateData);
        LoggingService.info(`[FormEventHandlers] Task ID ${taskId} updated successfully.`, { functionName, taskId });
        EventBus.publish('displayUserMessage', { text: 'Task updated successfully!', type: 'success' });
        closeViewEditModal();
        refreshTaskView();
    } else {
        LoggingService.warn('[FormEventHandlers] Task description empty or task ID missing for edit.', { functionName, taskId, taskTextIsEmpty: !taskText });
        EventBus.publish('displayUserMessage', { text: 'Task description cannot be empty.', type: 'error' });
    }
}

export async function handleProfileFormSubmit(event) {
    const functionName = 'handleProfileFormSubmit';
    event.preventDefault();
    LoggingService.info('[FormEventHandlers] Attempting to save profile.', { functionName });

    const profileDisplayNameInputEl = document.getElementById('profileDisplayName');
    const displayName = profileDisplayNameInputEl.value.trim();

    if (!displayName) {
        LoggingService.warn('[FormEventHandlers] Display name cannot be empty.', { functionName });
        EventBus.publish('displayUserMessage', { text: 'Display name cannot be empty.', type: 'error' });
        return;
    }

    const profileData = {
        displayName: displayName,
    };

    if (UserAccountsFeature && UserAccountsFeature.handleSaveProfile) {
        try {
            await UserAccountsFeature.handleSaveProfile(profileData);
        } catch (err) {
            LoggingService.error('[FormEventHandlers] Error during profile save process (delegated to UserAccountsFeature).', err, {functionName});
        }
    } else {
        LoggingService.error('[FormEventHandlers] UserAccountsFeature.handleSaveProfile not available.', new Error("DependencyMissing"), { functionName });
        EventBus.publish('displayUserMessage', { text: 'Error saving profile: System component missing.', type: 'error' });
    }
}


export async function handleAddNewLabelFormSubmit(event) {
    const functionName = 'handleAddNewLabelFormSubmit';
    event.preventDefault();
    const newLabelInputEl = document.getElementById('newLabelInput');
    const labelName = newLabelInputEl.value.trim();
    LoggingService.info(`[FormEventHandlers] Attempting to add new label: "${labelName}".`, { functionName, labelName });

    if (LabelService.addConceptualLabel(labelName)) {
        newLabelInputEl.value = '';
        const { populateManageLabelsList } = await import('./modal_interactions.js');
        const manageLabelsModalEl = document.getElementById('manageLabelsModal');
        if (manageLabelsModalEl && !manageLabelsModalEl.classList.contains('hidden')) {
             populateManageLabelsList();
        }
    }
}

export function handleUserSignUpFormSubmit(event) {
    const functionName = "handleUserSignUpFormSubmit";
    event.preventDefault();
    LoggingService.debug(`[FormEventHandlers] Sign-up form submitted.`, {functionName});
    const emailEl = document.getElementById('signUpEmail');
    const passwordEl = document.getElementById('signUpPassword');
    if (emailEl && passwordEl && UserAccountsFeature?.handleSignUp) {
        UserAccountsFeature.handleSignUp(emailEl.value, passwordEl.value);
    } else {
        LoggingService.warn('[FormEventHandlers] Sign up form elements or UserAccountsFeature.handleSignUp not found.', {
            functionName,
            emailElFound: !!emailEl,
            passwordElFound: !!passwordEl,
            signUpHandlerAvailable: !!UserAccountsFeature?.handleSignUp
        });
        EventBus.publish('displayUserMessage', { text: 'Sign up service unavailable.', type: 'error' });
    }
}

export function handleUserSignInFormSubmit(event) {
    const functionName = "handleUserSignInFormSubmit";
    event.preventDefault();
    LoggingService.debug(`[FormEventHandlers] Sign-in form submitted.`, {functionName});
    const emailEl = document.getElementById('signInEmail');
    const passwordEl = document.getElementById('signInPassword');
     if (emailEl && passwordEl && UserAccountsFeature?.handleSignIn) {
        UserAccountsFeature.handleSignIn(emailEl.value, passwordEl.value);
    } else {
        LoggingService.warn('[FormEventHandlers] Sign in form elements or UserAccountsFeature.handleSignIn not found.', {
            functionName,
            emailElFound: !!emailEl,
            passwordElFound: !!passwordEl,
            signInHandlerAvailable: !!UserAccountsFeature?.handleSignIn
        });
        EventBus.publish('displayUserMessage', { text: 'Sign in service unavailable.', type: 'error' });
    }
}

console.log("formEventHandlers.js loaded (corrected).");