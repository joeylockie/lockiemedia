// formEventHandlers.js
// Handles form submission logic for various forms in the application.

import AppStore from './store.js';
import ViewManager from './viewManager.js';
import { isFeatureEnabled } from './featureFlagService.js';
import * as TaskService from './taskService.js';
import * as LabelService from './labelService.js';
import EventBus from './eventBus.js';
import LoggingService from './loggingService.js';
import { UserAccountsFeature } from './feature_user_accounts.js'; // For sign-up/sign-in
import { TaskTimerSystemFeature } from './task_timer_system.js'; // For task estimates

// Assuming clearTempSubTasksForAddModal is made available, e.g., from a subTaskHandlers.js or ui_event_handlers.js
// For now, we'll assume it's imported if ui_event_handlers.js exports it or it's moved.
// If it's small and specific to add task, it could even be a local helper here, but better to keep it with other subtask logic.
import { clearTempSubTasksForAddModal, tempSubTasksForAddModal } from './ui_event_handlers.js'; // Temporary import path

import {
    closeAddModal,
    closeViewEditModal
    // closeProfileModal // This will be needed by handleProfileFormSubmit if it closes the modal
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
    const modalEstHoursAddEl = document.getElementById('modalEstHoursAdd');
    const modalEstMinutesAddEl = document.getElementById('modalEstMinutesAdd');
    const modalRemindMeAddEl = document.getElementById('modalRemindMeAdd');
    const modalReminderDateAddEl = document.getElementById('modalReminderDateAdd');
    const modalReminderTimeAddEl = document.getElementById('modalReminderTimeAdd');
    const modalReminderEmailAddEl = document.getElementById('modalReminderEmailAdd');

    const taskText = modalTaskInputAddEl.value.trim();
    const dueDate = modalDueDateInputAddEl.value;
    const time = modalTimeInputAddEl.value;
    const priority = modalPriorityInputAddEl.value;
    const label = modalLabelInputAddEl.value.trim();
    const notes = modalNotesInputAddEl.value.trim();
    const projectId = isFeatureEnabled('projectFeature') && modalProjectSelectAddEl ? parseInt(modalProjectSelectAddEl.value) : 0;

    let estHours = 0, estMinutes = 0;
    if (isFeatureEnabled('taskTimerSystem') && TaskTimerSystemFeature?.getEstimatesFromAddModal) {
        const estimates = TaskTimerSystemFeature.getEstimatesFromAddModal(); // This needs to be available
        estHours = estimates.estHours;
        estMinutes = estimates.estMinutes;
    } else if (isFeatureEnabled('taskTimerSystem') && modalEstHoursAddEl && modalEstMinutesAddEl) { // Fallback
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
        // Date parsing from text is typically done if dueDate is not explicitly set
        if (!dueDate && TaskService.parseDateFromText) {
            parsedResult = TaskService.parseDateFromText(taskText);
        }

        // Accessing tempSubTasksForAddModal directly from ui_event_handlers for now
        const subTasksToAdd = isFeatureEnabled('subTasksFeature') ? [...tempSubTasksForAddModal] : [];


        TaskService.addTask({
            text: parsedResult.remainingText,
            dueDate: parsedResult.parsedDate || dueDate, // Prioritize explicit date if both exist
            time, priority, label, notes, projectId,
            isReminderSet, reminderDate, reminderTime, reminderEmail,
            estimatedHours: estHours, estimatedMinutes: estMinutes,
            subTasks: subTasksToAdd
        });
        LoggingService.info(`[FormEventHandlers] Task added via form: "${parsedResult.remainingText.substring(0, 30)}..."`, { functionName, taskLength: parsedResult.remainingText.length });
        EventBus.publish('displayUserMessage', { text: 'Task added successfully!', type: 'success' });
        closeAddModal();
        clearTempSubTasksForAddModal(); // Clear after successful add
        if (ViewManager.getCurrentFilter() !== 'inbox') {
            ViewManager.setCurrentFilter('inbox');
        } else {
            // If already in inbox, tasksChanged event will refresh the view.
            LoggingService.debug('[FormEventHandlers] Task added while in inbox. Relying on tasksChanged event for view refresh.', { functionName });
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
        TaskService.updateTask(taskId, {
            text: taskText, dueDate, time, priority, label, notes, projectId,
            isReminderSet, reminderDate, reminderTime, reminderEmail,
            estimatedHours: estHours, estimatedMinutes: estMinutes
            // Sub-tasks are managed separately via their own interactions within the edit modal
        });
        LoggingService.info(`[FormEventHandlers] Task ID ${taskId} updated successfully.`, { functionName, taskId });
        EventBus.publish('displayUserMessage', { text: 'Task updated successfully!', type: 'success' });
        closeViewEditModal();
    } else {
        LoggingService.warn('[FormEventHandlers] Task description empty or task ID missing for edit.', { functionName, taskId, taskTextIsEmpty: !taskText });
        EventBus.publish('displayUserMessage', { text: 'Task description cannot be empty.', type: 'error' });
    }
}

export async function handleProfileFormSubmit(event) { // Added async here as UserAccountsFeature.handleSaveProfile might be async
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
            // Assuming handleSaveProfile in UserAccountsFeature calls AppStore.setUserProfile
            // and then modal_interactions.closeProfileModal is called from there or via event.
            // If not, you might need to call closeProfileModal here.
        } catch (err) {
            LoggingService.error('[FormEventHandlers] Error during profile save process (delegated to UserAccountsFeature).', err, {functionName});
            // UserAccountsFeature should publish its own error message to the user.
        }
    } else {
        LoggingService.error('[FormEventHandlers] UserAccountsFeature.handleSaveProfile not available.', new Error("DependencyMissing"), { functionName });
        EventBus.publish('displayUserMessage', { text: 'Error saving profile: System component missing.', type: 'error' });
    }
}


export async function handleAddNewLabelFormSubmit(event) { // Added async here
    const functionName = 'handleAddNewLabelFormSubmit';
    event.preventDefault();
    const newLabelInputEl = document.getElementById('newLabelInput');
    const labelName = newLabelInputEl.value.trim();
    LoggingService.info(`[FormEventHandlers] Attempting to add new label: "${labelName}".`, { functionName, labelName });

    if (LabelService.addConceptualLabel(labelName)) { // addConceptualLabel handles its own user messages
        newLabelInputEl.value = '';
        // Repopulating manage labels list is handled by EventBus subscription to 'labelsChanged'
        // or directly by modal_interactions if modal is open.
        // For this specific form, if the modal is open, its populate function should be called.
        // We can ensure this by having modal_interactions.populateManageLabelsList
        // called after a successful add, if the modal is open.
        // Or, LabelService could publish a generic "labelsUpdated" event that ManageLabelsModal listens to.
        // The original code calls populateManageLabelsList directly. Let's assume that's still desired here.
        const { populateManageLabelsList } = await import('./modal_interactions.js'); // Dynamic import for this specific case
        const manageLabelsModalEl = document.getElementById('manageLabelsModal');
        if (manageLabelsModalEl && !manageLabelsModalEl.classList.contains('hidden')) {
             populateManageLabelsList();
        }
    }
}

// --- Auth Form Handlers ---
// These were originally anonymous functions inside setupEventListeners
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
