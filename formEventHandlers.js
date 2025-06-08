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
import { parseRecurrenceFromText } from './recurrenceParsingService.js'; 

// Assuming clearTempSubTasksForAddModal is made available, e.g., from a subTaskHandlers.js or ui_event_handlers.js
import { clearTempSubTasksForAddModal, tempSubTasksForAddModal } from './ui_event_handlers.js'; 

import {
    closeAddModal,
    closeViewEditModal
} from './modal_interactions.js';


export function handleAddTaskFormSubmit(event) {
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
    const modalRecurrenceInputAddEl = document.getElementById('modalRecurrenceInputAdd');
    const modalRemindMeAddEl = document.getElementById('modalRemindMeAdd');
    const modalReminderDateAddEl = document.getElementById('modalReminderDateAdd');
    const modalReminderTimeAddEl = document.getElementById('modalReminderTimeAdd');
    const modalReminderEmailAddEl = document.getElementById('modalReminderEmailAdd');

    let taskText = modalTaskInputAddEl.value.trim();
    let dueDate = modalDueDateInputAddEl.value;
    let time = modalTimeInputAddEl.value;
    const priority = modalPriorityInputAddEl.value;
    const label = modalLabelInputAddEl.value.trim();
    const notes = modalNotesInputAddEl.value.trim();
    const projectId = isFeatureEnabled('projectFeature') && modalProjectSelectAddEl ? parseInt(modalProjectSelectAddEl.value) : 0;
    
    let recurrenceRule = null;
    let recurrenceInputText = '';

    if (isFeatureEnabled('advancedRecurrence') && modalRecurrenceInputAddEl) {
        recurrenceInputText = modalRecurrenceInputAddEl.value.trim();
    }

    if (taskText) {
        // --- Natural Language Processing ---
        // 1. First, try to parse recurrence from the main task text.
        const recurrenceParseResult = parseRecurrenceFromText(taskText);
        if (recurrenceParseResult.rule) {
            recurrenceRule = recurrenceParseResult.rule;
            taskText = recurrenceParseResult.remainingText; // Use the text with the recurrence phrase removed.
        }
        
        // 2. Then, parse the date from the (potentially modified) task text.
        const dateParseResult = TaskService.parseDateFromText(taskText);
        if (dateParseResult.parsedDate) {
            // Natural language in the main text box overrides the date/time inputs.
            dueDate = dateParseResult.parsedDate;
            time = null; 
            taskText = dateParseResult.remainingText;
        }

        // 3. If a recurrence rule was typed in the recurrence input, it overrides any parsed from the main text.
        if (recurrenceInputText) {
            const explicitRecurrenceResult = parseRecurrenceFromText(recurrenceInputText);
            if(explicitRecurrenceResult.rule) {
                recurrenceRule = explicitRecurrenceResult.rule;
            }
        }
        
        // --- End of NLP ---

        // Get estimates if feature is enabled
        let estHours = 0, estMinutes = 0;
        if (isFeatureEnabled('taskTimerSystem') && TaskTimerSystemFeature?.getEstimatesFromAddModal) {
            const estimates = TaskTimerSystemFeature.getEstimatesFromAddModal();
            estHours = estimates.estHours;
            estMinutes = estimates.estMinutes;
        }

        // Get reminder settings if feature is enabled
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
        
        // Accessing tempSubTasksForAddModal directly
        const subTasksToAdd = isFeatureEnabled('subTasksFeature') ? [...tempSubTasksForAddModal] : [];

        TaskService.addTask({
            text: taskText,
            dueDate: dueDate,
            time, priority, label, notes, projectId,
            isReminderSet, reminderDate, reminderTime, reminderEmail,
            estimatedHours: estHours, estimatedMinutes: estMinutes,
            subTasks: subTasksToAdd,
            recurrenceRule: recurrenceRule
        });
        LoggingService.info(`[FormEventHandlers] Task added via form: "${taskText.substring(0, 30)}..."`, { functionName, taskLength: taskText.length });
        EventBus.publish('displayUserMessage', { text: 'Task added successfully!', type: 'success' });
        closeAddModal();
        clearTempSubTasksForAddModal();
        if (ViewManager.getCurrentFilter() !== 'inbox') {
            ViewManager.setCurrentFilter('inbox');
        }
    } else {
        LoggingService.warn('[FormEventHandlers] Task description was empty on add attempt.', { functionName });
        EventBus.publish('displayUserMessage', { text: 'Task description cannot be empty.', type: 'error' });
    }
}

export function handleEditTaskFormSubmit(event) {
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
    const modalRecurrenceInputViewEditEl = document.getElementById('modalRecurrenceInputViewEdit');
    const modalRemindMeViewEditEl = document.getElementById('modalRemindMeViewEdit');
    const modalReminderDateViewEditEl = document.getElementById('modalReminderDateViewEdit');
    const modalReminderTimeViewEditEl = document.getElementById('modalReminderTimeViewEdit');
    const modalReminderEmailViewEditEl = document.getElementById('modalReminderEmailViewEdit');

    const taskText = modalTaskInputViewEditEl.value.trim();
    const dueDate = modalDueDateInputViewEditEl.value;
    const time = modalTimeInputViewEditEl.value;
    const priority = modalPriorityInputViewEditEl.value;
    const label = modalLabelInputViewEditEl.value.trim();
    const notes = modalNotesInputViewEditEl.value.trim();
    const projectId = isFeatureEnabled('projectFeature') && modalProjectSelectViewEditEl ? parseInt(modalProjectSelectViewEditEl.value) : 0;
    
    // *** FIX STARTS HERE ***
    // Get the existing task to compare its recurrence rule
    const existingTask = AppStore.getTasks().find(t => t.id === taskId);
    let taskUpdatePayload = {
        text: taskText, 
        dueDate, 
        time, 
        priority, 
        label, 
        notes, 
        projectId,
    };
    
    // Only update the recurrence rule if the feature is enabled.
    // This prevents accidental erasure of the rule if the feature is turned off.
    if (isFeatureEnabled('advancedRecurrence') && modalRecurrenceInputViewEditEl && existingTask) {
        const recurrenceInputText = modalRecurrenceInputViewEditEl.value.trim();
        // If the input is empty, it means the user wants to remove recurrence.
        if (recurrenceInputText === '') {
            taskUpdatePayload.recurrenceRule = null;
        } else {
            // Otherwise, parse the new rule from the input.
            const { rule } = parseRecurrenceFromText(recurrenceInputText);
            taskUpdatePayload.recurrenceRule = rule;
        }
    }
    // *** FIX ENDS HERE ***


    let estHours = 0, estMinutes = 0;
    if (isFeatureEnabled('taskTimerSystem') && TaskTimerSystemFeature?.getEstimatesFromEditModal) {
        const estimates = TaskTimerSystemFeature.getEstimatesFromEditModal();
        estHours = estimates.estHours;
        estMinutes = estimates.estMinutes;
    }
    taskUpdatePayload.estimatedHours = estHours;
    taskUpdatePayload.estimatedMinutes = estMinutes;


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
    taskUpdatePayload.isReminderSet = isReminderSet;
    taskUpdatePayload.reminderDate = reminderDate;
    taskUpdatePayload.reminderTime = reminderTime;
    taskUpdatePayload.reminderEmail = reminderEmail;


    if (taskText && taskId) {
        TaskService.updateTask(taskId, taskUpdatePayload);
        LoggingService.info(`[FormEventHandlers] Task ID ${taskId} updated successfully.`, { functionName, taskId });
        EventBus.publish('displayUserMessage', { text: 'Task updated successfully!', type: 'success' });
        closeViewEditModal();
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

// --- Auth Form Handlers ---
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