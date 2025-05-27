// ui_event_handlers.js
// Handles event listeners, user interaction handlers (forms, buttons),
// applying feature flags to UI.

import AppStore from './store.js';
import ViewManager from './viewManager.js';
import { isFeatureEnabled, setFeatureFlag, getAllFeatureFlags } from './featureFlagService.js';
import * as TaskService from './taskService.js';
import * as LabelService from './labelService.js';
import ModalStateService from './modalStateService.js';
import TooltipService from './tooltipService.js';
import EventBus from './eventBus.js';
import * as BulkActionService from './bulkActionService.js';

// NEW: Import LoggingService
import LoggingService from './loggingService.js';

import {
    showMessage,
    refreshTaskView,
    showTooltip,
    hideTooltip,
    setSidebarMinimized,
} from './ui_rendering.js';

import {
    openAddModal,
    closeAddModal,
    openViewEditModal,
    closeViewEditModal,
    populateManageLabelsList,
    closeSettingsModal,
    openManageLabelsModal,
    openSettingsModal,
    openTaskReviewModal,
    openTooltipsGuideModal,
    closeManageLabelsModal,
    closeTaskReviewModal,
    closeTooltipsGuideModal,
    closeViewTaskDetailsModal,
    openContactUsModal, // Import for Contact Us
    closeContactUsModal, // Import for Contact Us
    openAboutUsModal, // ADDED: Import for About Us
    closeAboutUsModal, // ADDED: Import for About Us
    // NEW: Import for Data Version History Modal
    openDataVersionHistoryModal,
    closeDataVersionHistoryModal
} from './modal_interactions.js';

// Import Feature Modules
import { TestButtonFeature } from './feature_test_button.js';
import { TaskTimerSystemFeature } from './task_timer_system.js';
import { ReminderFeature } from './feature_reminder.js';
import { AdvancedRecurrenceFeature } from './feature_advanced_recurrence.js';
import { FileAttachmentsFeature } from './feature_file_attachments.js';
import { IntegrationsServicesFeature } from './feature_integrations_services.js';
// Firebase User Accounts Feature
import { UserAccountsFeature } from './feature_user_accounts.js'; // MODIFIED: Import UserAccountsFeature
import { CollaborationSharingFeature } from './feature_collaboration_sharing.js';
import { CrossDeviceSyncFeature } from './feature_cross_device_sync.js';
import { TaskDependenciesFeature } from './feature_task_dependencies.js';
import { SmarterSearchFeature } from './feature_smarter_search.js';
import { DataManagementFeature } from './feature_data_management.js';
import { CalendarViewFeature } from './feature_calendar_view.js';
import { KanbanBoardFeature } from './feature_kanban_board.js';
import { PomodoroTimerHybridFeature } from './pomodoro_timer.js';
import { ProjectsFeature } from './feature_projects.js';
import { TooltipsGuideFeature } from './feature_tooltips_guide.js';
import { SubTasksFeature } from './feature_sub_tasks.js';
import { BackgroundFeature } from './feature_background.js';
import { ContactUsFeature } from './feature_contact_us.js';
import { SocialMediaLinksFeature } from './feature_social_media_links.js'; // ADDED: Import SocialMediaLinksFeature
import { AboutUsFeature } from './feature_about_us.js'; // ADDED: Import AboutUsFeature
// NEW: Import DataVersioningFeature (its methods are called from modal_interactions or ui_rendering, but good to have it if direct calls were needed)
import { DataVersioningFeature } from './feature_data_versioning.js';


// Module-scoped state for temporary sub-tasks during creation
let tempSubTasksForAddModal = [];

export function clearTempSubTasksForAddModal() {
    const functionName = 'clearTempSubTasksForAddModal';
    LoggingService.debug('[UIEventHandlers] Temporary sub-tasks for add modal cleared.', { functionName, count: tempSubTasksForAddModal.length });
    tempSubTasksForAddModal = [];
}

function populateFeatureFlagsModal() {
    const functionName = 'populateFeatureFlagsModal';
    const currentFFListContainer = document.getElementById('featureFlagsListContainer');
    if (!currentFFListContainer) {
        LoggingService.warn("[UIEventHandlers] Feature flags list container not found.", { functionName, elementId: 'featureFlagsListContainer' });
        return;
    }
    currentFFListContainer.innerHTML = '';
    const currentFlags = getAllFeatureFlags();
    LoggingService.debug('[UIEventHandlers] Populating feature flags modal.', { functionName, flagCount: Object.keys(currentFlags).length });

    const friendlyNames = { //
        testButtonFeature: "Test Button",
        reminderFeature: "Task Reminders",
        taskTimerSystem: "Task Time Tracking",
        advancedRecurrence: "Advanced Recurrence",
        fileAttachments: "File Attachments",
        integrationsServices: "Integrations (e.g., Calendar)",
        userAccounts: "User Accounts & Login", // MODIFIED: Ensure this friendly name exists
        collaborationSharing: "Collaboration & Sharing",
        crossDeviceSync: "Cross-Device Sync",
        tooltipsGuide: "Tooltips & Guide",
        subTasksFeature: "Sub-Tasks",
        kanbanBoardFeature: "Kanban Board View",
        projectFeature: "Projects",
        exportDataFeature: "Export Data",
        calendarViewFeature: "Calendar View",
        taskDependenciesFeature: "Task Dependencies",
        smarterSearchFeature: "Smarter Search",
        bulkActionsFeature: "Bulk Task Actions",
        pomodoroTimerHybridFeature: "Pomodoro Timer",
        backgroundFeature: "Custom Backgrounds",
        contactUsFeature: "Contact Us Form",
        socialMediaLinksFeature: "Social Media Links in Settings",
        aboutUsFeature: "About Us Page in Settings", // ADDED: Friendly name for About Us
        dataVersioningFeature: "Data Versioning & History", // NEW: Friendly name for Data Versioning
        debugMode: "Developer: Debug Mode"
    };
    const featureOrder = Object.keys(currentFlags).sort((a,b) => {
        const nameA = friendlyNames[a] || a;
        const nameB = friendlyNames[b] || b;
        return nameA.localeCompare(nameB);
    });

    featureOrder.forEach(key => {
        const displayName = friendlyNames[key] || key;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'feature-flag-item';

        const label = document.createElement('label');
        label.htmlFor = `toggle-${key}`;
        label.textContent = displayName;
        label.className = 'feature-flag-label flex-grow';

        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'relative';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `toggle-${key}`;
        checkbox.checked = currentFlags[key];
        checkbox.className = 'toggle-checkbox';
        checkbox.addEventListener('change', (e) => {
            LoggingService.info(`[UIEventHandlers] Feature flag '${key}' toggled by user to ${e.target.checked}.`, { functionName, flagKey: key, newValue: e.target.checked });
            setFeatureFlag(key, e.target.checked);
        });

        const toggleLabel = document.createElement('label');
        toggleLabel.htmlFor = `toggle-${key}`;
        toggleLabel.className = 'toggle-label';

        toggleContainer.appendChild(checkbox);
        toggleContainer.appendChild(toggleLabel);
        itemDiv.appendChild(label);
        itemDiv.appendChild(toggleContainer);
        currentFFListContainer.appendChild(itemDiv);
    });
}

export function applyActiveFeatures() {
    const functionName = 'applyActiveFeatures';
    LoggingService.info('[UIEventHandlers] Applying active features based on current flags.', { functionName });
    const toggleElements = (selector, isEnabled) => { //
        document.querySelectorAll(selector).forEach(el => el.classList.toggle('hidden', !isEnabled)); //
    };

    // This loop should handle DataVersioningFeature as well due to the generic AppFeatures structure
    if (window.AppFeatures) {
        for (const featureKey in window.AppFeatures) {
            if (window.AppFeatures[featureKey] && typeof window.AppFeatures[featureKey].updateUIVisibility === 'function') {
                // LoggingService.debug(`[ApplyActiveFeatures] Calling updateUIVisibility for ${featureKey}`, { functionName });
                window.AppFeatures[featureKey].updateUIVisibility();
            }
        }
    }
    
    // Specific overrides or elements not covered by a generic class if any:
    // (Most features are now handled by their own updateUIVisibility methods toggling a specific class like '.feature-name-element')

    const settingsTooltipsGuideBtnEl = document.getElementById('settingsTooltipsGuideBtn'); 
    if (settingsTooltipsGuideBtnEl) settingsTooltipsGuideBtnEl.classList.toggle('hidden', !isFeatureEnabled('tooltipsGuide')); 

    const bulkControls = document.getElementById('bulkActionControlsContainer'); 
    if (bulkControls) { 
        if (!isFeatureEnabled('bulkActionsFeature')) { 
            if (BulkActionService && BulkActionService.clearSelections) BulkActionService.clearSelections(); 
            bulkControls.classList.add('hidden'); 
        }
    }
    document.querySelectorAll('.bulk-actions-feature-element').forEach(el => el.classList.toggle('hidden', !isFeatureEnabled('bulkActionsFeature'))); 

    refreshTaskView();

    const featureFlagsModalElement = document.getElementById('featureFlagsModal');
    if (featureFlagsModalElement && !featureFlagsModalElement.classList.contains('hidden')) {
        populateFeatureFlagsModal();
    }
    LoggingService.info('[UIEventHandlers] Finished applying active features.', { functionName });
}

// ... (handleAddTask, handleEditTask, toggleComplete, deleteTask, setFilter, clearCompletedTasks, handleAddNewLabel, handleDeleteLabel, handleAddSubTaskViewEdit, handleAddTempSubTaskForAddModal remain unchanged) ...
// ... (Copying the rest of the file and adding the changes below)

function handleAddTask(event) {
    const functionName = 'handleAddTask';
    event.preventDefault();
    LoggingService.info('[UIEventHandlers] Attempting to add task.', { functionName });

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
    if (isFeatureEnabled('taskTimerSystem') && modalEstHoursAddEl && modalEstMinutesAddEl) {
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
            LoggingService.warn('[UIEventHandlers] Reminder fields not completely filled for new task.', { functionName, reminderDate, reminderTime, reminderEmail });
            showMessage('Please fill all reminder fields or disable the reminder.', 'error');
            return;
        }
    }

    if (taskText) {
        let parsedResult = { parsedDate: dueDate, remainingText: taskText };
        if (!dueDate) { 
            parsedResult = TaskService.parseDateFromText(taskText);
        }

        const subTasksToAdd = isFeatureEnabled('subTasksFeature') ? [...tempSubTasksForAddModal] : [];

        TaskService.addTask({
            text: parsedResult.remainingText,
            dueDate: parsedResult.parsedDate || dueDate, 
            time, priority, label, notes, projectId,
            isReminderSet, reminderDate, reminderTime, reminderEmail,
            estimatedHours: estHours, estimatedMinutes: estMinutes,
            subTasks: subTasksToAdd
        });
        LoggingService.info(`[UIEventHandlers] Task added via form: "${parsedResult.remainingText.substring(0, 30)}..."`, { functionName, taskLength: parsedResult.remainingText.length });
        showMessage('Task added successfully!', 'success');
        closeAddModal(); 
        if (ViewManager.getCurrentFilter() !== 'inbox') {
            ViewManager.setCurrentFilter('inbox'); 
        } else {
            refreshTaskView();
        }
    } else {
        LoggingService.warn('[UIEventHandlers] Task description was empty on add attempt.', { functionName });
        showMessage('Task description cannot be empty.', 'error');
    }
}

function handleEditTask(event) {
    const functionName = 'handleEditTask';
    event.preventDefault();
    const modalViewEditTaskIdEl = document.getElementById('modalViewEditTaskId');
    const taskId = parseInt(modalViewEditTaskIdEl.value);
    LoggingService.info(`[UIEventHandlers] Attempting to edit task ID: ${taskId}.`, { functionName, taskId });

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
            LoggingService.warn(`[UIEventHandlers] Reminder fields not completely filled for editing task ID: ${taskId}.`, { functionName, taskId, reminderDate, reminderTime, reminderEmail });
            showMessage('Please fill all reminder fields or disable the reminder for edit.', 'error');
            return;
        }
    }

    if (taskText && taskId) {
        TaskService.updateTask(taskId, {
            text: taskText, dueDate, time, priority, label, notes, projectId,
            isReminderSet, reminderDate, reminderTime, reminderEmail,
            estimatedHours: estHours, estimatedMinutes: estMinutes
        });
        LoggingService.info(`[UIEventHandlers] Task ID ${taskId} updated successfully.`, { functionName, taskId });
        showMessage('Task updated successfully!', 'success');
        closeViewEditModal();
    } else {
        LoggingService.warn('[UIEventHandlers] Task description empty or task ID missing for edit.', { functionName, taskId, taskTextIsEmpty: !taskText });
        showMessage('Task description cannot be empty.', 'error');
    }
}

export function toggleComplete(taskId) {
    const functionName = 'toggleComplete';
    LoggingService.debug(`[UIEventHandlers] Toggling completion for task ID: ${taskId}.`, { functionName, taskId });
    const updatedTask = TaskService.toggleTaskComplete(taskId);
    if (updatedTask && updatedTask._blocked) {
        LoggingService.info(`[UIEventHandlers] Task ${taskId} completion blocked by prerequisites.`, { functionName, taskId });
        showMessage('Cannot complete task: It has incomplete prerequisite tasks.', 'warn');
    } else if (updatedTask) {
        LoggingService.info(`[UIEventHandlers] Task ${taskId} completion status toggled to ${updatedTask.completed}.`, { functionName, taskId, newStatus: updatedTask.completed });
        const viewTaskStatusEl = document.getElementById('viewTaskStatus');
        if (ModalStateService.getCurrentViewTaskId() === taskId && viewTaskStatusEl) {
            viewTaskStatusEl.textContent = updatedTask.completed ? 'Completed' : 'Active';
        }
    } else {
        LoggingService.error(`[UIEventHandlers] Error toggling task completion for task ID: ${taskId}.`, new Error("ToggleCompleteFailed"), { functionName, taskId });
        showMessage('Error toggling task completion.', 'error');
    }
}

export function deleteTask(taskId) {
    const functionName = 'deleteTask';
    LoggingService.info(`[UIEventHandlers] User initiated delete for task ID: ${taskId}.`, { functionName, taskId });
    if (confirm('Are you sure you want to delete this task?')) {
        if (TaskService.deleteTaskById(taskId)) {
            LoggingService.info(`[UIEventHandlers] Task ID ${taskId} deleted successfully after confirmation.`, { functionName, taskId });
            showMessage('Task deleted successfully!', 'success');
            const currentViewingId = ModalStateService.getCurrentViewTaskId();
            const currentEditingId = ModalStateService.getEditingTaskId();

            if (currentViewingId === taskId) closeViewTaskDetailsModal();
            if (currentEditingId === taskId) closeViewEditModal();
        } else {
            LoggingService.error(`[UIEventHandlers] Error deleting task ID: ${taskId} after confirmation.`, new Error("DeleteTaskFailed"), { functionName, taskId });
            showMessage('Error deleting task.', 'error');
        }
    } else {
        LoggingService.debug(`[UIEventHandlers] Task deletion cancelled by user for task ID: ${taskId}.`, { functionName, taskId });
    }
}

export function setFilter(filter) {
    const functionName = 'setFilter';
    if (!ViewManager) {
        LoggingService.error("[UIEventHandlers] ViewManager not available for setFilter.", new Error("ViewManagerMissing"), { functionName, filter });
        return;
    }
    LoggingService.info(`[UIEventHandlers] Setting filter to: ${filter}.`, { functionName, filter });
    ViewManager.setCurrentFilter(filter); 
}

function clearCompletedTasks() {
    const functionName = 'clearCompletedTasks';
    LoggingService.info('[UIEventHandlers] User initiated clear completed tasks.', { functionName });
    if (confirm('Are you sure you want to clear all completed tasks? This action cannot be undone.')) {
        const tasks = AppStore.getTasks();
        let deletedCount = 0;
        const completedTaskIds = tasks.filter(task => task.completed).map(task => task.id);

        if (completedTaskIds.length > 0) {
            completedTaskIds.forEach(taskId => {
                if (TaskService.deleteTaskById(taskId)) {
                    deletedCount++;
                }
            });
        }
        LoggingService.info(`[UIEventHandlers] Cleared ${deletedCount} completed task(s).`, { functionName, deletedCount });
        if (deletedCount > 0) { showMessage(`${deletedCount} completed task(s) cleared.`, 'success'); }
        else { showMessage('No completed tasks to clear.', 'info'); }
        closeSettingsModal();
    } else {
        LoggingService.debug('[UIEventHandlers] Clear completed tasks cancelled by user.', { functionName });
    }
}

function handleAddNewLabel(event) {
    const functionName = 'handleAddNewLabel';
    event.preventDefault();
    const newLabelInputEl = document.getElementById('newLabelInput');
    const labelName = newLabelInputEl.value.trim();
    LoggingService.info(`[UIEventHandlers] Attempting to add new label: "${labelName}".`, { functionName, labelName });
    if (LabelService.addConceptualLabel(labelName)) {
        newLabelInputEl.value = '';
        const manageLabelsModalEl = document.getElementById('manageLabelsModal');
        if (manageLabelsModalEl && !manageLabelsModalEl.classList.contains('hidden')) {
             populateManageLabelsList();
        }
    }
}

export function handleDeleteLabel(labelNameToDelete) {
    const functionName = 'handleDeleteLabel';
    LoggingService.info(`[UIEventHandlers] User initiated delete for label: "${labelNameToDelete}".`, { functionName, labelNameToDelete });
    if (confirm(`Are you sure you want to delete the label "${labelNameToDelete}" from all tasks? This will remove the label from any task currently using it. This action cannot be undone.`)) {
        if (LabelService.deleteLabelUsageFromTasks(labelNameToDelete)) {
            LoggingService.info(`[UIEventHandlers] Label "${labelNameToDelete}" removed from tasks.`, { functionName, labelNameToDelete });
            showMessage(`Label "${labelNameToDelete}" removed from all tasks.`, 'success');
            const manageLabelsModalEl = document.getElementById('manageLabelsModal');
             if (manageLabelsModalEl && !manageLabelsModalEl.classList.contains('hidden')) {
                 populateManageLabelsList();
            }
        } else {
            LoggingService.info(`[UIEventHandlers] Deletion of label "${labelNameToDelete}" did not result in changes or failed (see LabelService logs).`, { functionName, labelNameToDelete });
        }
    } else {
        LoggingService.debug(`[UIEventHandlers] Deletion of label "${labelNameToDelete}" cancelled by user.`, { functionName, labelNameToDelete });
    }
}

async function handleAddSubTaskViewEdit() {
    const functionName = 'handleAddSubTaskViewEdit';
    const modalSubTaskInputViewEditEl = document.getElementById('modalSubTaskInputViewEdit');
    const modalSubTasksListViewEditEl = document.getElementById('modalSubTasksListViewEdit');

    const parentId = ModalStateService.getEditingTaskId();
    const subTaskText = modalSubTaskInputViewEditEl.value.trim();
    LoggingService.info(`[UIEventHandlers] Attempting to add sub-task to parent ID ${parentId}: "${subTaskText.substring(0,20)}..."`, { functionName, parentId, subTaskTextLength: subTaskText.length });

    if (!parentId || !subTaskText) {
        LoggingService.warn('[UIEventHandlers] Parent task ID or sub-task text is missing for adding sub-task in edit modal.', { functionName, parentId, hasSubTaskText: !!subTaskText });
        showMessage('Parent task ID or sub-task text is missing.', 'error');
        return;
    }

    if (SubTasksFeature?.add(parentId, subTaskText)) {
        LoggingService.info(`[UIEventHandlers] Sub-task added to parent ID ${parentId}.`, { functionName, parentId });
        showMessage('Sub-task added.', 'success');
        modalSubTaskInputViewEditEl.value = '';
        try {
            const uiRendering = await import('./ui_rendering.js');
            if (uiRendering.renderSubTasksForEditModal) {
                uiRendering.renderSubTasksForEditModal(parentId, modalSubTasksListViewEditEl);
            }
        } catch (e) {
            LoggingService.error("[UIEventHandlers] Failed to load ui_rendering for sub-task update in edit modal.", e, { functionName, parentId });
        }
    } else {
        LoggingService.error(`[UIEventHandlers] Failed to add sub-task to parent ID ${parentId}.`, new Error("AddSubTaskFailed"), { functionName, parentId });
        showMessage('Failed to add sub-task.', 'error');
    }
}

function handleAddTempSubTaskForAddModal() {
    const functionName = 'handleAddTempSubTaskForAddModal';
    const modalSubTaskInputAddEl = document.getElementById('modalSubTaskInputAdd');
    const modalSubTasksListAddEl = document.getElementById('modalSubTasksListAdd');

    const subTaskText = modalSubTaskInputAddEl.value.trim();
    LoggingService.info(`[UIEventHandlers] Attempting to add temporary sub-task: "${subTaskText.substring(0,20)}..."`, { functionName, subTaskTextLength: subTaskText.length });

    if (!subTaskText) {
        LoggingService.warn('[UIEventHandlers] Sub-task text cannot be empty for temporary add.', { functionName });
        showMessage('Sub-task text cannot be empty.', 'error');
        return;
    }
    tempSubTasksForAddModal.push({ id: `temp_${Date.now()}_${Math.random()}`, text: subTaskText, completed: false });
    LoggingService.debug(`[UIEventHandlers] Temporary sub-task added. Current temp count: ${tempSubTasksForAddModal.length}`, { functionName });
    modalSubTaskInputAddEl.value = '';
    
    const uiRenderingModule = globalThis.uiRenderingModule || (globalThis.uiRenderingModule = import('./ui_rendering.js'));
    uiRenderingModule.then(ui => {
        if (ui.renderTempSubTasksForAddModal) {
            ui.renderTempSubTasksForAddModal(tempSubTasksForAddModal, modalSubTasksListAddEl);
        }
    }).catch(e => {
        LoggingService.error('[UIEventHandlers] Failed to load ui_rendering for rendering temp sub-tasks.', e, { functionName });
    });
}

export function setupEventListeners() {
    const functionName = 'setupEventListeners';
    LoggingService.info('[UIEventHandlers] Setting up event listeners.', { functionName });

    const attachListener = (elementId, eventType, handler, handlerName) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(eventType, handler);
            LoggingService.debug(`[UIEventHandlers] Attached '${eventType}' listener to #${elementId} for ${handlerName || handler.name || 'anonymous function'}.`, { functionName: 'attachListener', elementId, eventType });
        } else {
            LoggingService.warn(`[UIEventHandlers] Element #${elementId} not found. Cannot attach ${eventType} listener for ${handlerName || handler.name || 'anonymous function'}.`, { functionName: 'attachListener', elementId, eventType });
        }
    };

    // Sidebar Toggle
    const sidebarToggleBtnEl = document.getElementById('sidebarToggleBtn');
    if (sidebarToggleBtnEl) {
        sidebarToggleBtnEl.addEventListener('click', () => { 
            const sidebarHandlerFuncName = 'sidebarToggleClickHandler';
            const taskSidebarEl = document.getElementById('taskSidebar');
            if (!taskSidebarEl) {
                LoggingService.error("[UIEventHandlers] Sidebar element not found for toggle.", new Error("DOMElementMissing"), { functionName: sidebarHandlerFuncName, elementId: 'taskSidebar' });
                return;
            }
            const isCurrentlyMinimized = taskSidebarEl.classList.contains('sidebar-minimized');
            const newMinimizedState = !isCurrentlyMinimized;
            localStorage.setItem('sidebarState', newMinimizedState ? 'minimized' : 'expanded');
            setSidebarMinimized(newMinimizedState);
            if (newMinimizedState) {
                hideTooltip(); 
            } else {
                TooltipService.clearTooltipTimeout(); 
            }
            if (isFeatureEnabled('projectFeature') && ProjectsFeature?.populateProjectFilterList) {
                ProjectsFeature.populateProjectFilterList();
            }
            if (isFeatureEnabled('pomodoroTimerHybridFeature') && PomodoroTimerHybridFeature?.updateSidebarDisplay) {
                PomodoroTimerHybridFeature.updateSidebarDisplay();
            }
            LoggingService.debug(`[UIEventHandlers] Sidebar toggle clicked. New state: ${newMinimizedState ? 'minimized' : 'expanded'}.`, { functionName: sidebarHandlerFuncName, newMinimizedState });
        });
        LoggingService.debug(`[UIEventHandlers] Sidebar toggle listener attached.`, { functionName, elementId: 'sidebarToggleBtn' });
    } else {
         LoggingService.warn(`[UIEventHandlers] Sidebar toggle button not found.`, { functionName, elementId: 'sidebarToggleBtn' });
    }

    // Sidebar icon tooltips
    const taskSidebarElForTooltips = document.getElementById('taskSidebar');
    if (taskSidebarElForTooltips) {
        const sidebarIconOnlyButtonsEls = taskSidebarElForTooltips.querySelectorAll('.sidebar-button-icon-only');
        sidebarIconOnlyButtonsEls.forEach(button => {
            button.addEventListener('mouseenter', () => {
                if (taskSidebarElForTooltips.classList.contains('sidebar-minimized')) {
                    TooltipService.clearTooltipTimeout();
                    const timeoutId = setTimeout(() => showTooltip(button, button.title), 500);
                    TooltipService.setTooltipTimeout(timeoutId);
                }
            });
            button.addEventListener('mouseleave', () => {
                hideTooltip();
            });
        });
        LoggingService.debug(`[UIEventHandlers] Sidebar icon tooltips listeners attached for ${sidebarIconOnlyButtonsEls.length} buttons.`, { functionName });
    }

    // Modal Openers
    attachListener('openAddModalButton', 'click', openAddModal, 'openAddModal');
    attachListener('settingsManageLabelsBtn', 'click', openManageLabelsModal, 'openManageLabelsModal');
    attachListener('openSettingsModalButton', 'click', openSettingsModal, 'openSettingsModal');
    attachListener('settingsTaskReviewBtn', 'click', openTaskReviewModal, 'openTaskReviewModal');
    attachListener('settingsTooltipsGuideBtn', 'click', openTooltipsGuideModal, 'openTooltipsGuideModal');
    attachListener('settingsAboutUsBtn', 'click', openAboutUsModal, 'openAboutUsModal'); // ADDED: Listener for About Us button
    // The settingsContactUsBtn listener is in feature_contact_us.js, which calls the imported openContactUsModal
    // NEW: Listener for Data Version History button
    attachListener('settingsVersionHistoryBtn', 'click', openDataVersionHistoryModal, 'openDataVersionHistoryModal');


    const openFeatureFlagsModalBtn = document.getElementById('openFeatureFlagsModalBtn');
    if (openFeatureFlagsModalBtn) {
        openFeatureFlagsModalBtn.addEventListener('click', () => {
            LoggingService.debug('[UIEventHandlers] Open Feature Flags Modal button clicked.', {functionName: 'openFeatureFlagsModalHandler'});
            const ffModal = document.getElementById('featureFlagsModal');
            const ffDialog = document.getElementById('modalDialogFeatureFlags');
            if (ffModal && ffDialog) {
                populateFeatureFlagsModal();
                ffModal.classList.remove('hidden');
                setTimeout(() => { ffDialog.classList.remove('scale-95', 'opacity-0'); ffDialog.classList.add('scale-100', 'opacity-100'); }, 10);
            } else {
                LoggingService.warn('[UIEventHandlers] Feature flags modal elements not found for opening.', {functionName: 'openFeatureFlagsModalHandler'});
            }
        });
         LoggingService.debug(`[UIEventHandlers] Feature flags modal opener listener attached.`, { functionName, elementId: 'openFeatureFlagsModalBtn' });
    }


    if (isFeatureEnabled('projectFeature')) {
        const settingsManageProjectsBtnEl = document.getElementById('settingsManageProjectsBtn');
        if (settingsManageProjectsBtnEl && ProjectsFeature?.openManageProjectsModal) {
            settingsManageProjectsBtnEl.addEventListener('click', ProjectsFeature.openManageProjectsModal);
            LoggingService.debug(`[UIEventHandlers] Manage Projects modal opener listener attached.`, { functionName, elementId: 'settingsManageProjectsBtn' });
        }
    }

    // Modal Closers
    const modalCloserListeners = [
        { id: 'closeAddModalBtn', handler: closeAddModal, name: 'closeAddModal (primary)' },
        { id: 'cancelAddModalBtn', handler: closeAddModal, name: 'closeAddModal (cancel)' },
        { id: 'addTaskModal', handler: (event) => { if (event.target.id === 'addTaskModal') closeAddModal(); }, name: 'closeAddModal (backdrop)'},
        { id: 'closeViewEditModalBtn', handler: closeViewEditModal, name: 'closeViewEditModal (primary)' },
        { id: 'cancelViewEditModalBtn', handler: closeViewEditModal, name: 'closeViewEditModal (cancel)' },
        { id: 'viewEditTaskModal', handler: (event) => { if(event.target.id === 'viewEditTaskModal') closeViewEditModal(); }, name: 'closeViewEditModal (backdrop)'},
        { id: 'closeViewDetailsModalBtn', handler: closeViewTaskDetailsModal, name: 'closeViewTaskDetailsModal (primary)' },
        { id: 'closeViewDetailsSecondaryBtn', handler: closeViewTaskDetailsModal, name: 'closeViewTaskDetailsModal (secondary)' },
        { id: 'viewTaskDetailsModal', handler: (event) => { if(event.target.id === 'viewTaskDetailsModal') closeViewTaskDetailsModal(); }, name: 'closeViewTaskDetailsModal (backdrop)'},
        { id: 'closeSettingsModalBtn', handler: closeSettingsModal, name: 'closeSettingsModal (primary)' },
        { id: 'closeSettingsSecondaryBtn', handler: closeSettingsModal, name: 'closeSettingsModal (secondary)' },
        { id: 'settingsModal', handler: (event) => { if(event.target.id === 'settingsModal') closeSettingsModal(); }, name: 'closeSettingsModal (backdrop)'},
        { id: 'closeManageLabelsModalBtn', handler: closeManageLabelsModal, name: 'closeManageLabelsModal (primary)' },
        { id: 'closeManageLabelsSecondaryBtn', handler: closeManageLabelsModal, name: 'closeManageLabelsModal (secondary)' },
        { id: 'manageLabelsModal', handler: (event) => { if(event.target.id === 'manageLabelsModal') closeManageLabelsModal(); }, name: 'closeManageLabelsModal (backdrop)'},
        { id: 'closeTooltipsGuideModalBtn', handler: closeTooltipsGuideModal, name: 'closeTooltipsGuideModal (primary)' },
        { id: 'closeTooltipsGuideSecondaryBtn', handler: closeTooltipsGuideModal, name: 'closeTooltipsGuideModal (secondary)' },
        { id: 'tooltipsGuideModal', handler: (event) => { if (event.target.id === 'tooltipsGuideModal') closeTooltipsGuideModal(); }, name: 'closeTooltipsGuideModal (backdrop)'},
        { id: 'closeTaskReviewModalBtn', handler: closeTaskReviewModal, name: 'closeTaskReviewModal (primary)' },
        { id: 'closeTaskReviewSecondaryBtn', handler: closeTaskReviewModal, name: 'closeTaskReviewModal (secondary)' },
        { id: 'taskReviewModal', handler: (event) => { if(event.target.id === 'taskReviewModal') closeTaskReviewModal(); }, name: 'closeTaskReviewModal (backdrop)'},
        // Add listeners for Contact Us Modal
        { id: 'closeContactUsModalBtn', handler: closeContactUsModal, name: 'closeContactUsModal (primary)' },
        { id: 'closeContactUsSecondaryBtn', handler: closeContactUsModal, name: 'closeContactUsModal (secondary)' },
        { id: 'contactUsModal', handler: (event) => { if (event.target.id === 'contactUsModal') closeContactUsModal(); }, name: 'closeContactUsModal (backdrop)' },
        // ADDED: Listeners for About Us Modal
        { id: 'closeAboutUsModalBtn', handler: closeAboutUsModal, name: 'closeAboutUsModal (primary)' },
        { id: 'closeAboutUsSecondaryBtn', handler: closeAboutUsModal, name: 'closeAboutUsModal (secondary)' },
        { id: 'aboutUsModal', handler: (event) => { if (event.target.id === 'aboutUsModal') closeAboutUsModal(); }, name: 'closeAboutUsModal (backdrop)' },
        // NEW: Listeners for Data Version History Modal
        { id: 'closeDataVersionHistoryModalBtn', handler: closeDataVersionHistoryModal, name: 'closeDataVersionHistoryModal (primary)' },
        { id: 'closeDataVersionHistorySecondaryBtn', handler: closeDataVersionHistoryModal, name: 'closeDataVersionHistoryModal (secondary)' },
        { id: 'dataVersionHistoryModal', handler: (event) => { if (event.target.id === 'dataVersionHistoryModal') closeDataVersionHistoryModal(); }, name: 'closeDataVersionHistoryModal (backdrop)' }
    ];
    modalCloserListeners.forEach(listener => attachListener(listener.id, 'click', listener.handler, listener.name));


    // Edit and Delete from View Details Modal
    const editFromViewModalBtnEl = document.getElementById('editFromViewModalBtn');
    if (editFromViewModalBtnEl) {
        editFromViewModalBtnEl.addEventListener('click', () => {
            const handlerName = 'editFromViewModalHandler';
            const taskId = ModalStateService.getCurrentViewTaskId();
            LoggingService.debug(`[UIEventHandlers] Edit from View Modal button clicked for task ID: ${taskId}.`, { functionName: handlerName, taskId });
            if (taskId) {
                closeViewTaskDetailsModal(); 
                openViewEditModal(taskId);
            } else {
                LoggingService.warn(`[UIEventHandlers] No task ID to edit from View Modal.`, { functionName: handlerName });
            }
        });
         LoggingService.debug(`[UIEventHandlers] Edit From View Modal listener attached.`, { functionName, elementId: 'editFromViewModalBtn' });
    }
    const deleteFromViewModalBtnEl = document.getElementById('deleteFromViewModalBtn');
    if(deleteFromViewModalBtnEl) {
        deleteFromViewModalBtnEl.addEventListener('click', () => {
            const handlerName = 'deleteFromViewModalHandler';
            const taskId = ModalStateService.getCurrentViewTaskId();
            LoggingService.debug(`[UIEventHandlers] Delete from View Modal button clicked for task ID: ${taskId}.`, { functionName: handlerName, taskId });
            if(taskId) deleteTask(taskId); 
            else { LoggingService.warn(`[UIEventHandlers] No task ID to delete from View Modal.`, { functionName: handlerName }); }
        });
        LoggingService.debug(`[UIEventHandlers] Delete From View Modal listener attached.`, { functionName, elementId: 'deleteFromViewModalBtn' });
    }

    // Feature Flags Modal Closers
    const ffModalCloseHandler = () => {
        LoggingService.debug('[UIEventHandlers] Closing Feature Flags Modal.', {functionName: 'ffModalCloseHandler'});
        const ffModal = document.getElementById('featureFlagsModal');
        const ffDialog = document.getElementById('modalDialogFeatureFlags');
        if (ffDialog) ffDialog.classList.add('scale-95', 'opacity-0');
        setTimeout(() => { if (ffModal) ffModal.classList.add('hidden'); }, 200);
    };
    attachListener('closeFeatureFlagsModalBtn', 'click', ffModalCloseHandler, 'ffModalCloseHandler (primary)');
    attachListener('closeFeatureFlagsSecondaryBtn', 'click', ffModalCloseHandler, 'ffModalCloseHandler (secondary)');
    attachListener('featureFlagsModal', 'click', (event) => { if(event.target.id === 'featureFlagsModal') ffModalCloseHandler(); }, 'ffModalCloseHandler (backdrop)');


    // Form Submissions
    attachListener('modalTodoFormAdd', 'submit', handleAddTask, 'handleAddTask');
    attachListener('modalTodoFormViewEdit', 'submit', handleEditTask, 'handleEditTask');
    attachListener('addNewLabelForm', 'submit', handleAddNewLabel, 'handleAddNewLabel');
    // ContactUsForm submission listener is in feature_contact_us.js which calls the imported modal close.

    // MODIFIED: Add User Accounts Form Submissions
    if (isFeatureEnabled('userAccounts') && UserAccountsFeature) {
        attachListener('signUpForm', 'submit', (event) => {
            event.preventDefault();
            const email = document.getElementById('signUpEmail').value;
            const password = document.getElementById('signUpPassword').value;
            UserAccountsFeature.handleSignUp(email, password);
        }, 'handleUserSignUp');

        attachListener('signInForm', 'submit', (event) => {
            event.preventDefault();
            const email = document.getElementById('signInEmail').value;
            const password = document.getElementById('signInPassword').value;
            UserAccountsFeature.handleSignIn(email, password);
        }, 'handleUserSignIn');

        attachListener('signOutBtn', 'click', UserAccountsFeature.handleSignOut, 'handleUserSignOut');
    }


    // Filter Buttons (Smart Views)
    const smartViewButtonsContainerEl = document.getElementById('smartViewButtonsContainer');
    if (smartViewButtonsContainerEl) {
        smartViewButtonsContainerEl.addEventListener('click', (event) => {
            const button = event.target.closest('.smart-view-btn');
            if (button && button.dataset.filter) {
                LoggingService.debug(`[UIEventHandlers] Smart view button clicked: ${button.dataset.filter}`, { functionName: 'smartViewButtonHandler', filter: button.dataset.filter });
                setFilter(button.dataset.filter);
            }
        });
        LoggingService.debug(`[UIEventHandlers] Smart view buttons container listener attached.`, { functionName, elementId: 'smartViewButtonsContainer' });
    }


    // Sort Buttons
    const sortButtonConfigs = [
        { elId: 'sortByDueDateBtn', type: 'dueDate' },
        { elId: 'sortByPriorityBtn', type: 'priority' },
        { elId: 'sortByLabelBtn', type: 'label' }
    ];
    sortButtonConfigs.forEach(item => {
        const element = document.getElementById(item.elId);
        if (element) {
            element.addEventListener('click', async () => {
                LoggingService.debug(`[UIEventHandlers] Sort button clicked: ${item.type}`, { functionName: 'sortButtonHandler', sortType: item.type });
                ViewManager.setCurrentSort(item.type);
                try {
                    const uiRenderingModule = await import('./ui_rendering.js');
                    if (uiRenderingModule.updateSortButtonStates) {
                        uiRenderingModule.updateSortButtonStates();
                    }
                } catch (e) {
                    LoggingService.error("[UIEventHandlers] Failed to load ui_rendering for sort button update", e, { functionName: 'sortButtonHandler', sortType: item.type });
                }
            });
            LoggingService.debug(`[UIEventHandlers] Sort button listener attached for ${item.type}.`, { functionName, elementId: item.elId });
        } else {
            LoggingService.warn(`[UIEventHandlers] Sort button #${item.elId} not found.`, { functionName, elementId: item.elId });
        }
    });

    // View Toggle Buttons
    const viewToggleHandler = (mode, currentViewMode) => {
        const newMode = currentViewMode === mode ? 'list' : mode;
        LoggingService.debug(`[UIEventHandlers] View toggle clicked. Current: ${currentViewMode}, Target: ${mode}, New: ${newMode}`, { functionName: 'viewToggleHandler', currentMode: currentViewMode, targetMode: mode, newMode });
        ViewManager.setTaskViewMode(newMode);
    };
    attachListener('kanbanViewToggleBtn', 'click', () => viewToggleHandler('kanban', ViewManager.getCurrentTaskViewMode()), 'kanbanViewToggle');
    attachListener('calendarViewToggleBtn', 'click', () => viewToggleHandler('calendar', ViewManager.getCurrentTaskViewMode()), 'calendarViewToggle');
    attachListener('pomodoroViewToggleBtn', 'click', () => viewToggleHandler('pomodoro', ViewManager.getCurrentTaskViewMode()), 'pomodoroViewToggle');


    // Search Input
    const taskSearchInputEl = document.getElementById('taskSearchInput');
    if (taskSearchInputEl) {
        taskSearchInputEl.addEventListener('input', (e) => {
            ViewManager.setCurrentSearchTerm(e.target.value)
        });
         LoggingService.debug(`[UIEventHandlers] Task search input listener attached.`, { functionName, elementId: 'taskSearchInput' });
    } else {
        LoggingService.warn(`[UIEventHandlers] Task search input not found.`, { functionName, elementId: 'taskSearchInput' });
    }


    // Settings Actions
    attachListener('settingsClearCompletedBtn', 'click', clearCompletedTasks, 'clearCompletedTasks');

    // Keydown listener for Escape and Add Task Shortcut
    document.addEventListener('keydown', (event) => {
        const keydownHandlerName = 'documentKeydownHandler';
        if (event.key === 'Escape') {
            LoggingService.debug('[UIEventHandlers] Escape key pressed, attempting to close modals.', { functionName: keydownHandlerName, key: event.key });
            const contactUsModalEl = document.getElementById('contactUsModal'); // Get reference
            const aboutUsModalEl = document.getElementById('aboutUsModal'); // ADDED: Get reference for About Us
            const dataVersionHistoryModalEl = document.getElementById('dataVersionHistoryModal'); // NEW: Get reference


            if (document.getElementById('addTaskModal') && !document.getElementById('addTaskModal').classList.contains('hidden')) closeAddModal(); 
            else if (document.getElementById('viewEditTaskModal') && !document.getElementById('viewEditTaskModal').classList.contains('hidden')) closeViewEditModal(); 
            else if (document.getElementById('viewTaskDetailsModal') && !document.getElementById('viewTaskDetailsModal').classList.contains('hidden')) closeViewTaskDetailsModal(); 
            else if (document.getElementById('settingsModal') && !document.getElementById('settingsModal').classList.contains('hidden')) closeSettingsModal(); 
            else if (document.getElementById('manageLabelsModal') && !document.getElementById('manageLabelsModal').classList.contains('hidden')) closeManageLabelsModal(); 
            else if (document.getElementById('taskReviewModal') && !document.getElementById('taskReviewModal').classList.contains('hidden')) closeTaskReviewModal(); 
            else if (document.getElementById('tooltipsGuideModal') && !document.getElementById('tooltipsGuideModal').classList.contains('hidden')) closeTooltipsGuideModal(); 
            else if (contactUsModalEl && !contactUsModalEl.classList.contains('hidden')) closeContactUsModal(); 
            else if (aboutUsModalEl && !aboutUsModalEl.classList.contains('hidden')) closeAboutUsModal();
            // NEW: Close Data Version History Modal on Escape
            else if (dataVersionHistoryModalEl && !dataVersionHistoryModalEl.classList.contains('hidden')) closeDataVersionHistoryModal();


            const ffModal = document.getElementById('featureFlagsModal'); 
            if (ffModal && !ffModal.classList.contains('hidden')) { 
                ffModalCloseHandler(); 
            }
            const projModal = document.getElementById('manageProjectsModal'); 
            if (projModal && !projModal.classList.contains('hidden') && window.AppFeatures?.ProjectsFeature?.closeManageProjectsModal) { 
                 window.AppFeatures.ProjectsFeature.closeManageProjectsModal(); 
            } else if (projModal && !projModal.classList.contains('hidden')) { 
                const projDialog = document.getElementById('modalDialogManageProjects'); 
                if (projDialog) projDialog.classList.add('scale-95', 'opacity-0'); 
                setTimeout(() => { projModal.classList.add('hidden'); }, 200); 
            }


        } else if ((event.key === '+' || event.key === '=') && 
            !event.altKey && !event.ctrlKey && !event.metaKey && 
            !['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName.toUpperCase()) && 
            document.querySelectorAll('.fixed.inset-0:not(.hidden)').length === 0) { 
            LoggingService.debug('[UIEventHandlers] Add task shortcut key pressed.', { functionName: keydownHandlerName, key: event.key });
            event.preventDefault(); 
            openAddModal(); 
        }
    });
    LoggingService.debug(`[UIEventHandlers] Document keydown listener attached.`, { functionName });

    // Sub-task add buttons
    attachListener('modalAddSubTaskBtnAdd', 'click', handleAddTempSubTaskForAddModal, 'handleAddTempSubTaskForAddModal');
    attachListener('modalAddSubTaskBtnViewEdit', 'click', handleAddSubTaskViewEdit, 'handleAddSubTaskViewEdit');

    // Bulk Action Listeners
    const selectAllTasksCheckboxEl = document.getElementById('selectAllTasksCheckbox'); 
    if (selectAllTasksCheckboxEl && isFeatureEnabled('bulkActionsFeature')) { 
        selectAllTasksCheckboxEl.addEventListener('change', (e) => { 
            const handlerName = 'selectAllTasksCheckboxHandler';
            LoggingService.debug(`[UIEventHandlers] Select All Tasks checkbox changed: ${e.target.checked}`, { functionName: handlerName, checked: e.target.checked });
            const tasksToSelect = ViewManager.getFilteredTasksForBulkAction(); 
            if (e.target.checked) { 
                tasksToSelect.forEach(task => BulkActionService.selectTaskIfNotSelected(task.id)); 
            } else { 
                tasksToSelect.forEach(task => BulkActionService.deselectTaskIfSelected(task.id)); 
            }
        });
        LoggingService.debug(`[UIEventHandlers] Select All Tasks checkbox listener attached.`, { functionName, elementId: 'selectAllTasksCheckbox' });
    }

    LoggingService.info("[UIEventHandlers] All event listeners setup process completed.", { functionName });
}

// EventBus subscription for feature flag updates
if (EventBus && typeof applyActiveFeatures === 'function') {
    EventBus.subscribe('featureFlagsUpdated', (data) => {
        LoggingService.info("[UIEventHandlers] Event received: featureFlagsUpdated. Re-applying active features.", { functionName: 'featureFlagsUpdatedHandler (subscription)', eventData: data });
        applyActiveFeatures();
        const featureFlagsModalElement = document.getElementById('featureFlagsModal');
        if (featureFlagsModalElement && !featureFlagsModalElement.classList.contains('hidden')) {
            populateFeatureFlagsModal();
        }
    });
} else {
    LoggingService.warn("[UIEventHandlers] EventBus or applyActiveFeatures not available for featureFlagsUpdated subscription.", { functionName: 'featureFlagsUpdatedSubscriptionSetup' });
}

LoggingService.debug("ui_event_handlers.js loaded as ES6 module.", { module: 'ui_event_handlers' });