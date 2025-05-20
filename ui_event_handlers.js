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

import {
    showMessage,
    refreshTaskView,
    showTooltip,
    hideTooltip,
    // The following are likely called by main.js or within this module, or ui_rendering
    // updateSortButtonStates, // ui_rendering calls this
    // updateClearCompletedButtonState, // ui_rendering calls this
} from './ui_rendering.js'; // Assuming ui_rendering exports these

import {
    openAddModal,
    closeAddModal,
    openViewEditModal,
    closeViewEditModal,
    populateManageLabelsList,
    closeSettingsModal, // For clearCompletedTasks
    // Modals like viewTaskDetails, manageLabels, settings, taskReview, tooltipsGuide, featureFlags
    // are opened by event listeners in this file, calling their respective open/close from modal_interactions
    openManageLabelsModal,
    openSettingsModal,
    openTaskReviewModal,
    openTooltipsGuideModal,
    closeManageLabelsModal, // For Esc key
    // closeSettingsModal, // For Esc key - already imported
    closeTaskReviewModal, // For Esc key
    closeTooltipsGuideModal, // For Esc key
    closeViewTaskDetailsModal, // For Esc key
} from './modal_interactions.js'; // Assuming modal_interactions exports these

// Import Feature Modules
import { TestButtonFeature } from './feature_test_button.js';
import { TaskTimerSystemFeature } from './task_timer_system.js';
import { ReminderFeature } from './feature_reminder.js';
import { AdvancedRecurrenceFeature } from './feature_advanced_recurrence.js';
import { FileAttachmentsFeature } from './feature_file_attachments.js';
import { IntegrationsServicesFeature } from './feature_integrations_services.js';
import { UserAccountsFeature } from './feature_user_accounts.js';
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
import { SubTasksFeature } from './feature_sub_tasks.js'; // Import for handleAddSubTaskViewEdit

// Module-scoped state for temporary sub-tasks during creation
let tempSubTasksForAddModal = [];

export function clearTempSubTasksForAddModal() {
    tempSubTasksForAddModal = [];
}
// Potentially export getTempSubTasksForAddModal if other modules need to read it before saving
// export function getTempSubTasksForAddModal() {
//     return [...tempSubTasksForAddModal];
// }


function populateFeatureFlagsModal() {
    const currentFFListContainer = document.getElementById('featureFlagsListContainer');
    if (!currentFFListContainer) {
        console.warn("Feature flags list container not found for populateFeatureFlagsModal.");
        return;
    }
    currentFFListContainer.innerHTML = '';
    const currentFlags = getAllFeatureFlags();
    const friendlyNames = {
        testButtonFeature: "Test Button",
        reminderFeature: "Task Reminders",
        taskTimerSystem: "Task Time Tracking",
        advancedRecurrence: "Advanced Recurrence",
        fileAttachments: "File Attachments",
        integrationsServices: "Integrations (e.g., Calendar)",
        userAccounts: "User Accounts & Login",
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
        pomodoroTimerHybridFeature: "Pomodoro Timer"
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
            setFeatureFlag(key, e.target.checked);
            // No need to call applyActiveFeatures here; it's handled by the EventBus subscription
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
    console.log('[ApplyFeatures] Applying active features based on current flags.');
    const toggleElements = (selector, isEnabled) => {
        document.querySelectorAll(selector).forEach(el => el.classList.toggle('hidden', !isEnabled));
    };

    // Use imported feature modules where possible, otherwise direct DOM manipulation as fallback
    if (window.AppFeatures?.TestButtonFeature?.updateUIVisibility) window.AppFeatures.TestButtonFeature.updateUIVisibility(); else { const el = document.getElementById('testFeatureButtonContainer'); if(el) el.classList.toggle('hidden', !isFeatureEnabled('testButtonFeature'));}
    if (window.AppFeatures?.TaskTimerSystemFeature?.updateUIVisibility) window.AppFeatures.TaskTimerSystemFeature.updateUIVisibility(); else { toggleElements('.task-timer-system-element', isFeatureEnabled('taskTimerSystem')); const btn = document.getElementById('settingsTaskReviewBtn'); if(btn) btn.classList.toggle('hidden', !isFeatureEnabled('taskTimerSystem')); }
    if (window.AppFeatures?.ReminderFeature?.updateUIVisibility) window.AppFeatures.ReminderFeature.updateUIVisibility(); else toggleElements('.reminder-feature-element', isFeatureEnabled('reminderFeature'));
    if (window.AppFeatures?.AdvancedRecurrenceFeature?.updateUIVisibility) window.AppFeatures.AdvancedRecurrenceFeature.updateUIVisibility(); else toggleElements('.advanced-recurrence-element', isFeatureEnabled('advancedRecurrence'));
    if (window.AppFeatures?.FileAttachmentsFeature?.updateUIVisibility) window.AppFeatures.FileAttachmentsFeature.updateUIVisibility(); else toggleElements('.file-attachments-element', isFeatureEnabled('fileAttachments'));
    if (window.AppFeatures?.IntegrationsServicesFeature?.updateUIVisibility) window.AppFeatures.IntegrationsServicesFeature.updateUIVisibility(); else toggleElements('.integrations-services-element', isFeatureEnabled('integrationsServices'));
    if (window.AppFeatures?.UserAccountsFeature?.updateUIVisibility) window.AppFeatures.UserAccountsFeature.updateUIVisibility(); else toggleElements('.user-accounts-element', isFeatureEnabled('userAccounts'));
    if (window.AppFeatures?.CollaborationSharingFeature?.updateUIVisibility) window.AppFeatures.CollaborationSharingFeature.updateUIVisibility(); else toggleElements('.collaboration-sharing-element', isFeatureEnabled('collaborationSharing'));
    if (window.AppFeatures?.CrossDeviceSyncFeature?.updateUIVisibility) window.AppFeatures.CrossDeviceSyncFeature.updateUIVisibility(); else toggleElements('.cross-device-sync-element', isFeatureEnabled('crossDeviceSync'));
    if (window.AppFeatures?.TaskDependenciesFeature?.updateUIVisibility) window.AppFeatures.TaskDependenciesFeature.updateUIVisibility(); else toggleElements('.task-dependencies-feature-element', isFeatureEnabled('taskDependenciesFeature'));
    if (window.AppFeatures?.SmarterSearchFeature?.updateUIVisibility) window.AppFeatures.SmarterSearchFeature.updateUIVisibility(); else toggleElements('.smarter-search-feature-element', isFeatureEnabled('smarterSearchFeature'));
    if (window.AppFeatures?.DataManagementFeature?.updateUIVisibility) window.AppFeatures.DataManagementFeature.updateUIVisibility(); else toggleElements('.export-data-feature-element', isFeatureEnabled('exportDataFeature'));
    if (window.AppFeatures?.CalendarViewFeature?.updateUIVisibility) window.AppFeatures.CalendarViewFeature.updateUIVisibility(); else { const cvtb = document.getElementById('calendarViewToggleBtn'); if(cvtb) cvtb.classList.toggle('hidden', !isFeatureEnabled('calendarViewFeature')); toggleElements('.calendar-view-feature-element', isFeatureEnabled('calendarViewFeature'));}
    if (window.AppFeatures?.KanbanBoardFeature?.updateUIVisibility) window.AppFeatures.KanbanBoardFeature.updateUIVisibility(); else { const kbtb = document.getElementById('kanbanViewToggleBtn'); if(kbtb) kbtb.classList.toggle('hidden', !isFeatureEnabled('kanbanBoardFeature'));}
    if (window.AppFeatures?.PomodoroTimerHybridFeature?.updateUIVisibility) window.AppFeatures.PomodoroTimerHybridFeature.updateUIVisibility(); else toggleElements('.pomodoro-timer-hybrid-feature-element', isFeatureEnabled('pomodoroTimerHybridFeature'));
    if (window.AppFeatures?.ProjectsFeature?.updateUIVisibility) window.AppFeatures.ProjectsFeature.updateUIVisibility();
    if (window.AppFeatures?.TooltipsGuideFeature?.updateUIVisibility) window.AppFeatures.TooltipsGuideFeature.updateUIVisibility();
    if (window.AppFeatures?.SubTasksFeature?.updateUIVisibility) window.AppFeatures.SubTasksFeature.updateUIVisibility(); else toggleElements('.sub-tasks-feature-element', isFeatureEnabled('subTasksFeature'));


    const settingsTooltipsGuideBtnEl = document.getElementById('settingsTooltipsGuideBtn');
    if (settingsTooltipsGuideBtnEl) settingsTooltipsGuideBtnEl.classList.toggle('hidden', !isFeatureEnabled('tooltipsGuide'));

    // Handle Bulk Actions UI
    const bulkControls = document.getElementById('bulkActionControlsContainer');
    if (bulkControls) {
        if (!isFeatureEnabled('bulkActionsFeature')) {
            if (BulkActionService && BulkActionService.clearSelections) BulkActionService.clearSelections();
            bulkControls.classList.add('hidden');
        } else {
            // The class 'bulk-actions-feature-element' should be on the container in HTML.
            // applyActiveFeatures will toggle its visibility based on the generic selector.
            // If it was initially hidden due to the flag being off, this call ensures it's shown if the flag is now on.
            // And if it was on and flag is off, it will be hidden.
            // No direct toggle needed here if class is applied, but ensure renderBulkActionControls is called.
            // This element itself has the class `bulk-actions-feature-element` so it is handled by the loop below.
        }
    }
    document.querySelectorAll('.bulk-actions-feature-element').forEach(el => el.classList.toggle('hidden', !isFeatureEnabled('bulkActionsFeature')));


    refreshTaskView(); // This function from ui_rendering will handle rendering based on flags

    const featureFlagsModalElement = document.getElementById('featureFlagsModal');
    if (featureFlagsModalElement && !featureFlagsModalElement.classList.contains('hidden')) {
        populateFeatureFlagsModal();
    }
    console.log('[ApplyFeatures] Finished applying active features.');
}

function handleAddTask(event) {
    event.preventDefault();
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
            showMessage('Please fill all reminder fields or disable the reminder.', 'error');
            return;
        }
    }

    if (taskText) {
        let parsedResult = { parsedDate: dueDate, remainingText: taskText };
        if (!dueDate) { // Only parse if due date isn't explicitly set
            parsedResult = TaskService.parseDateFromText(taskText);
        }

        const subTasksToAdd = isFeatureEnabled('subTasksFeature') ? [...tempSubTasksForAddModal] : [];

        TaskService.addTask({
            text: parsedResult.remainingText,
            dueDate: parsedResult.parsedDate || dueDate, // Use parsed if available and original was empty
            time, priority, label, notes, projectId,
            isReminderSet, reminderDate, reminderTime, reminderEmail,
            estimatedHours: estHours, estimatedMinutes: estMinutes,
            subTasks: subTasksToAdd
        });
        showMessage('Task added successfully!', 'success');
        closeAddModal(); // This function also clears tempSubTasksForAddModal
        if (ViewManager.getCurrentFilter() !== 'inbox') {
            ViewManager.setCurrentFilter('inbox'); // This will trigger refreshTaskView via event
        } else {
            refreshTaskView(); // If already inbox, manually refresh
        }
        // clearTempSubTasksForAddModal(); // Already called by closeAddModal
    } else {
        showMessage('Task description cannot be empty.', 'error');
    }
}
function handleEditTask(event) {
    event.preventDefault();
    const modalViewEditTaskIdEl = document.getElementById('modalViewEditTaskId');
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


    const taskId = parseInt(modalViewEditTaskIdEl.value);
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
            showMessage('Please fill all reminder fields or disable the reminder for edit.', 'error');
            return;
        }
    }

    if (taskText && taskId) {
        TaskService.updateTask(taskId, {
            text: taskText, dueDate, time, priority, label, notes, projectId,
            isReminderSet, reminderDate, reminderTime, reminderEmail,
            estimatedHours: estHours, estimatedMinutes: estMinutes
            // Sub-tasks are handled directly via SubTasksFeature methods in this modal.
        });
        showMessage('Task updated successfully!', 'success');
        closeViewEditModal();
        // refreshTaskView(); // Event 'tasksChanged' from AppStore.setTasks will trigger this
    } else {
        showMessage('Task description cannot be empty.', 'error');
    }
}

export function toggleComplete(taskId) {
    const updatedTask = TaskService.toggleTaskComplete(taskId);
    if (updatedTask && updatedTask._blocked) {
        showMessage('Cannot complete task: It has incomplete prerequisite tasks.', 'warn');
    } else if (updatedTask) {
        // Update UI for view details modal if open for this task
        const viewTaskStatusEl = document.getElementById('viewTaskStatus');
        if (ModalStateService.getCurrentViewTaskId() === taskId && viewTaskStatusEl) {
            viewTaskStatusEl.textContent = updatedTask.completed ? 'Completed' : 'Active';
        }
        // refreshTaskView(); // Handled by 'tasksChanged' event
    } else {
        showMessage('Error toggling task completion.', 'error');
    }
}
// No longer: window.toggleComplete = toggleComplete;

export function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        if (TaskService.deleteTaskById(taskId)) {
            showMessage('Task deleted successfully!', 'success');
            const currentViewingId = ModalStateService.getCurrentViewTaskId();
            const currentEditingId = ModalStateService.getEditingTaskId();

            if (currentViewingId === taskId) closeViewTaskDetailsModal();
            if (currentEditingId === taskId) closeViewEditModal();
            // refreshTaskView(); // Handled by 'tasksChanged' event
        } else {
            showMessage('Error deleting task.', 'error');
        }
    }
}
// No longer: window.deleteTask = deleteTask;

export function setFilter(filter) { // Still exported for feature_projects.js, ui_rendering for smart btns
    if (!ViewManager) { console.error("[SetFilter] ViewManager not available."); return; }
    ViewManager.setCurrentFilter(filter); // This will publish 'filterChanged'

    // Styling of buttons is now primarily handled by ui_rendering.js listening to 'filterChanged'
    // and also by its styleInitialSmartViewButtons function if needed.
    // However, if direct styling is still desired here (e.g., for immediate effect before event propagation completes fully)
    // it can be kept, but ensure it doesn't conflict.
    // For cleaner separation, ui_rendering.js should be the sole source of styling updates based on ViewManager state.

    // Example of how ui_rendering.js would handle styling:
    // EventBus.subscribe('filterChanged', (eventData) => { styleSmartViewButtons(eventData.filter); });
    // styleSmartViewButtons(filter); // Call a local styling function if needed for immediate feedback
    // For now, let's assume the event system is sufficient.
    // No, setFilter still needs to update sort button states and refresh the view.
    refreshTaskView(); // Crucial: refreshTaskView uses the new filter
}
// No longer: window.setFilter = setFilter;

function clearCompletedTasks() {
    if (confirm('Are you sure you want to clear all completed tasks? This action cannot be undone.')) {
        const tasks = AppStore.getTasks();
        let deletedCount = 0;
        const completedTaskIds = tasks.filter(task => task.completed).map(task => task.id);

        if (completedTaskIds.length > 0) {
            // To optimize, could create a new array without completed tasks and set it once.
            // For now, deleting one by one which will trigger multiple 'tasksChanged' events.
            // Consider a BulkActionService.deleteTasks(ids) if it exists and is more efficient.
            completedTaskIds.forEach(taskId => {
                if (TaskService.deleteTaskById(taskId)) {
                    deletedCount++;
                }
            });
        }

        if (deletedCount > 0) { showMessage(`${deletedCount} completed task(s) cleared.`, 'success'); }
        else { showMessage('No completed tasks to clear.', 'info'); }
        closeSettingsModal();
        // refreshTaskView(); // Handled by 'tasksChanged' event from last deleteTaskById
    }
}
function handleAddNewLabel(event) {
    event.preventDefault();
    const newLabelInputEl = document.getElementById('newLabelInput');
    const labelName = newLabelInputEl.value.trim();
    if (LabelService.addConceptualLabel(labelName)) { // LabelService.addConceptualLabel shows its own messages
        newLabelInputEl.value = '';
        // If manage labels modal is open, refresh its list.
        // The 'labelsChanged' event (if a task uses it) or a direct call might be needed.
        // For now, populateManageLabelsList is called directly if modal is open.
        const manageLabelsModalEl = document.getElementById('manageLabelsModal');
        if (manageLabelsModalEl && !manageLabelsModalEl.classList.contains('hidden')) {
             populateManageLabelsList(); // from modal_interactions.js
        }
    }
}
export function handleDeleteLabel(labelNameToDelete) { // Exported for modal_interactions.js
    if (confirm(`Are you sure you want to delete the label "${labelNameToDelete}" from all tasks? This will remove the label from any task currently using it. This action cannot be undone.`)) {
        if (LabelService.deleteLabelUsageFromTasks(labelNameToDelete)) {
            showMessage(`Label "${labelNameToDelete}" removed from all tasks.`, 'success');
            // 'tasksChanged' event will refresh task view.
            // 'labelsChanged' event will refresh datalists and manage labels list.
            const manageLabelsModalEl = document.getElementById('manageLabelsModal');
             if (manageLabelsModalEl && !manageLabelsModalEl.classList.contains('hidden')) {
                 populateManageLabelsList(); // from modal_interactions.js
            }
        } else {
            // showMessage('Failed to delete label or label not in use.', 'error'); // deleteLabelUsageFromTasks shows its own specific messages
        }
    }
}
// No longer: window.handleDeleteLabel = handleDeleteLabel;

// FIX: Make this function async
async function handleAddSubTaskViewEdit() {
    const modalSubTaskInputViewEditEl = document.getElementById('modalSubTaskInputViewEdit');
    const modalSubTasksListViewEditEl = document.getElementById('modalSubTasksListViewEdit');

    const parentId = ModalStateService.getEditingTaskId();
    const subTaskText = modalSubTaskInputViewEditEl.value.trim();
    if (!parentId || !subTaskText) {
        showMessage('Parent task ID or sub-task text is missing.', 'error');
        return;
    }

    if (SubTasksFeature?.add(parentId, subTaskText)) { // SubTasksFeature.add calls AppStore.setTasks
        showMessage('Sub-task added.', 'success');
        modalSubTaskInputViewEditEl.value = '';
        // The 'tasksChanged' event from AppStore.setTasks should trigger refreshTaskView.
        // If the modal UI needs immediate update before that, call renderSubTasksForEditModal.
        try {
            const uiRendering = await import('./ui_rendering.js');
            if (uiRendering.renderSubTasksForEditModal) {
                uiRendering.renderSubTasksForEditModal(parentId, modalSubTasksListViewEditEl);
            }
        } catch (e) {
            console.error("Failed to load ui_rendering for sub-task update", e);
        }
    } else {
        showMessage('Failed to add sub-task.', 'error');
    }
}
function handleAddTempSubTaskForAddModal() {
    const modalSubTaskInputAddEl = document.getElementById('modalSubTaskInputAdd');
    const modalSubTasksListAddEl = document.getElementById('modalSubTasksListAdd');

    const subTaskText = modalSubTaskInputAddEl.value.trim();
    if (!subTaskText) {
        showMessage('Sub-task text cannot be empty.', 'error');
        return;
    }
    // Use a unique enough temp ID, e.g., Date.now() or a counter for the session
    tempSubTasksForAddModal.push({ id: `temp_${Date.now()}_${Math.random()}`, text: subTaskText, completed: false });
    modalSubTaskInputAddEl.value = '';
    // renderTempSubTasksForAddModal is imported from ui_rendering.js
    // It needs `tempSubTasksForAddModal` and `modalSubTasksListAddEl`
    // This direct call is fine as it mutates a module-local array and re-renders its representation.
    const uiRenderingModule = globalThis.uiRenderingModule || (globalThis.uiRenderingModule = import('./ui_rendering.js'));
    uiRenderingModule.then(ui => {
        if (ui.renderTempSubTasksForAddModal) {
            ui.renderTempSubTasksForAddModal(tempSubTasksForAddModal, modalSubTasksListAddEl);
        }
    });
}

export function setupEventListeners() {
    // Sidebar Toggle
    const sidebarToggleBtnEl = document.getElementById('sidebarToggleBtn');
    if (sidebarToggleBtnEl) {
        sidebarToggleBtnEl.addEventListener('click', async () => { // Make async for dynamic import
            const taskSidebarEl = document.getElementById('taskSidebar');
            const sidebarToggleIconEl = document.getElementById('sidebarToggleIcon');
            // These selectors are fine as they are scoped to taskSidebarEl if it exists
            const sidebarTextElementsEls = taskSidebarEl ? taskSidebarEl.querySelectorAll('.sidebar-text-content') : [];
            const sidebarIconOnlyButtonsEls = taskSidebarEl ? taskSidebarEl.querySelectorAll('.sidebar-button-icon-only') : [];

            if (!taskSidebarEl || !sidebarToggleIconEl) return;

            const isMinimized = taskSidebarEl.classList.toggle('sidebar-minimized');
            localStorage.setItem('sidebarState', isMinimized ? 'minimized' : 'expanded');
            sidebarToggleIconEl.className = `fas ${isMinimized ? 'fa-chevron-right' : 'fa-chevron-left'}`;

            sidebarTextElementsEls.forEach(el => el.classList.toggle('hidden', isMinimized));
            sidebarIconOnlyButtonsEls.forEach(btn => {
                btn.classList.toggle('justify-center', isMinimized);
                const icon = btn.querySelector('i');
                const text = btn.querySelector('.sidebar-text-content'); // This will be hidden if isMinimized
                if (icon) {
                    icon.classList.toggle('md:mr-2', !isMinimized); // Reset margin if expanded
                    icon.classList.toggle('md:mr-2.5', !isMinimized);
                    icon.classList.toggle('ml-2', !isMinimized); // For buttons that might have icon after text
                    icon.classList.toggle('mr-0', isMinimized); // Ensure no margin when minimized
                }
                // Text elements are handled by the general .sidebar-text-content toggle
            });

            if (isMinimized) {
                 hideTooltip(); // from ui_rendering
            } else {
                TooltipService.clearTooltipTimeout(); // from tooltipService
            }

            // Refresh project filter list if project feature is enabled
            if (isFeatureEnabled('projectFeature') && ProjectsFeature?.populateProjectFilterList) {
                ProjectsFeature.populateProjectFilterList();
            }
            // Update Pomodoro sidebar display
            if (isFeatureEnabled('pomodoroTimerHybridFeature') && PomodoroTimerHybridFeature?.updateSidebarDisplay) {
                 PomodoroTimerHybridFeature.updateSidebarDisplay();
            }
        });
    }

    // Sidebar icon tooltips
    const taskSidebarElForTooltips = document.getElementById('taskSidebar');
    if (taskSidebarElForTooltips) {
        const sidebarIconOnlyButtonsEls = taskSidebarElForTooltips.querySelectorAll('.sidebar-button-icon-only');
        sidebarIconOnlyButtonsEls.forEach(button => {
            button.addEventListener('mouseenter', () => {
                if (taskSidebarElForTooltips.classList.contains('sidebar-minimized')) {
                    TooltipService.clearTooltipTimeout();
                    const timeoutId = setTimeout(() => showTooltip(button, button.title), 500); // showTooltip from ui_rendering
                    TooltipService.setTooltipTimeout(timeoutId);
                }
            });
            button.addEventListener('mouseleave', () => {
                hideTooltip(); // from ui_rendering
            });
        });
    }

    // Modal Openers (using imported functions from modal_interactions.js)
    const openAddModalButtonEl = document.getElementById('openAddModalButton');
    if (openAddModalButtonEl) openAddModalButtonEl.addEventListener('click', openAddModal);

    const settingsManageLabelsBtnEl = document.getElementById('settingsManageLabelsBtn');
    if (settingsManageLabelsBtnEl) settingsManageLabelsBtnEl.addEventListener('click', openManageLabelsModal);

    const openSettingsModalButtonEl = document.getElementById('openSettingsModalButton');
    if (openSettingsModalButtonEl) openSettingsModalButtonEl.addEventListener('click', openSettingsModal);

    const settingsTaskReviewBtnEl = document.getElementById('settingsTaskReviewBtn');
    if (settingsTaskReviewBtnEl) settingsTaskReviewBtnEl.addEventListener('click', openTaskReviewModal);

    const settingsTooltipsGuideBtnEl = document.getElementById('settingsTooltipsGuideBtn');
    if (settingsTooltipsGuideBtnEl) settingsTooltipsGuideBtnEl.addEventListener('click', openTooltipsGuideModal);

    // Feature Flag Modal opener (assuming it's a hidden button or dev tool)
    // Example: A button with id="openFeatureFlagsModalBtn" could be added to HTML for testing
    const openFeatureFlagsModalBtn = document.getElementById('openFeatureFlagsModalBtn'); // Ensure this ID exists in HTML if used
    if (openFeatureFlagsModalBtn) {
        openFeatureFlagsModalBtn.addEventListener('click', () => {
            const ffModal = document.getElementById('featureFlagsModal');
            const ffDialog = document.getElementById('modalDialogFeatureFlags');
            if (ffModal && ffDialog) {
                populateFeatureFlagsModal();
                ffModal.classList.remove('hidden');
                setTimeout(() => { ffDialog.classList.remove('scale-95', 'opacity-0'); ffDialog.classList.add('scale-100', 'opacity-100'); }, 10);
            }
        });
    }


    if (isFeatureEnabled('projectFeature')) {
        const settingsManageProjectsBtnEl = document.getElementById('settingsManageProjectsBtn');
        if (settingsManageProjectsBtnEl && ProjectsFeature?.openManageProjectsModal) {
            settingsManageProjectsBtnEl.addEventListener('click', ProjectsFeature.openManageProjectsModal);
        }
    }

    // Modal Closers (using imported functions from modal_interactions.js)
    const closeAddModalBtnEl = document.getElementById('closeAddModalBtn');
    if (closeAddModalBtnEl) closeAddModalBtnEl.addEventListener('click', closeAddModal);
    const cancelAddModalBtnEl = document.getElementById('cancelAddModalBtn');
    if (cancelAddModalBtnEl) cancelAddModalBtnEl.addEventListener('click', closeAddModal);
    const addTaskModalEl = document.getElementById('addTaskModal');
    if (addTaskModalEl) addTaskModalEl.addEventListener('click', (event) => { if (event.target === addTaskModalEl) closeAddModal(); });

    const closeViewEditModalBtnEl = document.getElementById('closeViewEditModalBtn');
    if(closeViewEditModalBtnEl) closeViewEditModalBtnEl.addEventListener('click', closeViewEditModal);
    const cancelViewEditModalBtnEl = document.getElementById('cancelViewEditModalBtn');
    if(cancelViewEditModalBtnEl) cancelViewEditModalBtnEl.addEventListener('click', closeViewEditModal);
    const viewEditTaskModalEl = document.getElementById('viewEditTaskModal');
    if(viewEditTaskModalEl) viewEditTaskModalEl.addEventListener('click', (e) => { if(e.target === viewEditTaskModalEl) closeViewEditModal(); });

    const closeViewDetailsModalBtnEl = document.getElementById('closeViewDetailsModalBtn');
    if(closeViewDetailsModalBtnEl) closeViewDetailsModalBtnEl.addEventListener('click', closeViewTaskDetailsModal);
    const closeViewDetailsSecondaryBtnEl = document.getElementById('closeViewDetailsSecondaryBtn');
    if(closeViewDetailsSecondaryBtnEl) closeViewDetailsSecondaryBtnEl.addEventListener('click', closeViewTaskDetailsModal);
    const viewTaskDetailsModalEl = document.getElementById('viewTaskDetailsModal');
    if(viewTaskDetailsModalEl) viewTaskDetailsModalEl.addEventListener('click', (e) => { if(e.target === viewTaskDetailsModalEl) closeViewTaskDetailsModal(); });

    // Edit and Delete from View Details Modal
    const editFromViewModalBtnEl = document.getElementById('editFromViewModalBtn');
    if (editFromViewModalBtnEl) {
        editFromViewModalBtnEl.addEventListener('click', () => {
            const taskId = ModalStateService.getCurrentViewTaskId();
            if (taskId) {
                closeViewTaskDetailsModal(); // Close details modal first
                openViewEditModal(taskId);   // Then open edit modal
            }
        });
    }
    const deleteFromViewModalBtnEl = document.getElementById('deleteFromViewModalBtn');
    if(deleteFromViewModalBtnEl) {
        deleteFromViewModalBtnEl.addEventListener('click', () => {
            const taskId = ModalStateService.getCurrentViewTaskId();
            if(taskId) deleteTask(taskId); // deleteTask will handle closing the modal if needed
        });
    }


    const closeSettingsModalBtnEl = document.getElementById('closeSettingsModalBtn');
    if(closeSettingsModalBtnEl) closeSettingsModalBtnEl.addEventListener('click', closeSettingsModal);
    const closeSettingsSecondaryBtnEl = document.getElementById('closeSettingsSecondaryBtn');
    if(closeSettingsSecondaryBtnEl) closeSettingsSecondaryBtnEl.addEventListener('click', closeSettingsModal);
    const settingsModalEl = document.getElementById('settingsModal');
    if(settingsModalEl) settingsModalEl.addEventListener('click', (e) => { if(e.target === settingsModalEl) closeSettingsModal(); });

    const closeManageLabelsModalBtnEl = document.getElementById('closeManageLabelsModalBtn');
    if(closeManageLabelsModalBtnEl) closeManageLabelsModalBtnEl.addEventListener('click', closeManageLabelsModal);
    const closeManageLabelsSecondaryBtnEl = document.getElementById('closeManageLabelsSecondaryBtn');
    if(closeManageLabelsSecondaryBtnEl) closeManageLabelsSecondaryBtnEl.addEventListener('click', closeManageLabelsModal);
    const manageLabelsModalEl = document.getElementById('manageLabelsModal');
    if(manageLabelsModalEl) manageLabelsModalEl.addEventListener('click', (e) => { if(e.target === manageLabelsModalEl) closeManageLabelsModal(); });

    // Feature Flags Modal Closers
    const closeFeatureFlagsModalBtnEl = document.getElementById('closeFeatureFlagsModalBtn');
    if (closeFeatureFlagsModalBtnEl) {
        closeFeatureFlagsModalBtnEl.addEventListener('click', () => {
            const ffModal = document.getElementById('featureFlagsModal');
            const ffDialog = document.getElementById('modalDialogFeatureFlags');
            if (ffDialog) ffDialog.classList.add('scale-95', 'opacity-0');
            setTimeout(() => { if (ffModal) ffModal.classList.add('hidden'); }, 200);
        });
    }
    const closeFeatureFlagsSecondaryBtnEl = document.getElementById('closeFeatureFlagsSecondaryBtn');
     if (closeFeatureFlagsSecondaryBtnEl) {
        closeFeatureFlagsSecondaryBtnEl.addEventListener('click', () => {
            const ffModal = document.getElementById('featureFlagsModal');
            const ffDialog = document.getElementById('modalDialogFeatureFlags');
            if (ffDialog) ffDialog.classList.add('scale-95', 'opacity-0');
            setTimeout(() => { if (ffModal) ffModal.classList.add('hidden'); }, 200);
        });
    }
    const featureFlagsModalEl = document.getElementById('featureFlagsModal');
    if (featureFlagsModalEl) {
        featureFlagsModalEl.addEventListener('click', (event) => {
            if (event.target === featureFlagsModalEl) {
                 const ffDialog = document.getElementById('modalDialogFeatureFlags');
                 if (ffDialog) ffDialog.classList.add('scale-95', 'opacity-0');
                 setTimeout(() => { featureFlagsModalEl.classList.add('hidden'); }, 200);
            }
        });
    }


    // Form Submissions
    const modalTodoFormAddEl = document.getElementById('modalTodoFormAdd');
    if (modalTodoFormAddEl) modalTodoFormAddEl.addEventListener('submit', handleAddTask);
    const modalTodoFormViewEditEl = document.getElementById('modalTodoFormViewEdit');
    if (modalTodoFormViewEditEl) modalTodoFormViewEditEl.addEventListener('submit', handleEditTask);
    const addNewLabelFormEl = document.getElementById('addNewLabelForm');
    if (addNewLabelFormEl) addNewLabelFormEl.addEventListener('submit', handleAddNewLabel);

    // Filter Buttons (Smart Views)
    const smartViewButtonsContainerEl = document.getElementById('smartViewButtonsContainer');
    if (smartViewButtonsContainerEl) {
        smartViewButtonsContainerEl.addEventListener('click', (event) => {
            const button = event.target.closest('.smart-view-btn');
            if (button && button.dataset.filter) {
                setFilter(button.dataset.filter); // Calls local setFilter which updates ViewManager
            }
        });
    }


    // Sort Buttons
    const sortByDueDateBtnEl = document.getElementById('sortByDueDateBtn');
    const sortByPriorityBtnEl = document.getElementById('sortByPriorityBtn');
    const sortByLabelBtnEl = document.getElementById('sortByLabelBtn');
    const sortButtonConfigs = [
        { el: sortByDueDateBtnEl, type: 'dueDate' },
        { el: sortByPriorityBtnEl, type: 'priority' },
        { el: sortByLabelBtnEl, type: 'label' }
    ];
    sortButtonConfigs.forEach(item => {
        if (item.el) {
            item.el.addEventListener('click', async () => { // Marked async for dynamic import
                ViewManager.setCurrentSort(item.type); // This publishes 'sortChanged'
                // ui_rendering.js listens to 'sortChanged' and calls refreshTaskView and updateSortButtonStates
                // So, direct call to updateSortButtonStates might be redundant if event handling is robust.
                // However, for immediate UI feedback, it can be useful.
                try {
                    const uiRenderingModule = await import('./ui_rendering.js');
                    if (uiRenderingModule.updateSortButtonStates) {
                        uiRenderingModule.updateSortButtonStates();
                    }
                } catch (e) {
                    console.error("Failed to load ui_rendering for sort button update", e);
                    // Fallback if global was intended
                    if (typeof window.updateSortButtonStates === 'function') {
                        window.updateSortButtonStates();
                    }
                }
                // refreshTaskView(); // Also typically handled by event subscription
            });
        }
    });

    // View Toggle Buttons
    const kanbanViewToggleBtnEl = document.getElementById('kanbanViewToggleBtn');
    if (kanbanViewToggleBtnEl) kanbanViewToggleBtnEl.addEventListener('click', () => ViewManager.setTaskViewMode(ViewManager.getCurrentTaskViewMode() === 'kanban' ? 'list' : 'kanban'));

    const calendarViewToggleBtnEl = document.getElementById('calendarViewToggleBtn');
    if(calendarViewToggleBtnEl) calendarViewToggleBtnEl.addEventListener('click', () => ViewManager.setTaskViewMode(ViewManager.getCurrentTaskViewMode() === 'calendar' ? 'list' : 'calendar'));

    const pomodoroViewToggleBtnEl = document.getElementById('pomodoroViewToggleBtn');
    if(pomodoroViewToggleBtnEl) pomodoroViewToggleBtnEl.addEventListener('click', () => ViewManager.setTaskViewMode(ViewManager.getCurrentTaskViewMode() === 'pomodoro' ? 'list' : 'pomodoro'));


    // Search Input
    const taskSearchInputEl = document.getElementById('taskSearchInput');
    if (taskSearchInputEl) taskSearchInputEl.addEventListener('input', (e) => ViewManager.setCurrentSearchTerm(e.target.value)); // Publishes 'searchTermChanged'

    // Settings Actions
    const settingsClearCompletedBtnEl = document.getElementById('settingsClearCompletedBtn');
    if (settingsClearCompletedBtnEl) settingsClearCompletedBtnEl.addEventListener('click', clearCompletedTasks);

    // Keydown listener for Escape and Add Task Shortcut
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            // Check each modal and call its specific close function
            if (document.getElementById('addTaskModal') && !document.getElementById('addTaskModal').classList.contains('hidden')) closeAddModal();
            else if (document.getElementById('viewEditTaskModal') && !document.getElementById('viewEditTaskModal').classList.contains('hidden')) closeViewEditModal();
            else if (document.getElementById('viewTaskDetailsModal') && !document.getElementById('viewTaskDetailsModal').classList.contains('hidden')) closeViewTaskDetailsModal();
            else if (document.getElementById('settingsModal') && !document.getElementById('settingsModal').classList.contains('hidden')) closeSettingsModal();
            else if (document.getElementById('manageLabelsModal') && !document.getElementById('manageLabelsModal').classList.contains('hidden')) closeManageLabelsModal();
            else if (document.getElementById('taskReviewModal') && !document.getElementById('taskReviewModal').classList.contains('hidden')) closeTaskReviewModal(); // Using imported
            else if (document.getElementById('tooltipsGuideModal') && !document.getElementById('tooltipsGuideModal').classList.contains('hidden')) closeTooltipsGuideModal(); // Using imported

            const ffModal = document.getElementById('featureFlagsModal');
            if (ffModal && !ffModal.classList.contains('hidden')) {
                const ffDialog = document.getElementById('modalDialogFeatureFlags');
                if (ffDialog) ffDialog.classList.add('scale-95', 'opacity-0');
                setTimeout(() => { ffModal.classList.add('hidden'); }, 200);
            }
            const projModal = document.getElementById('manageProjectsModal');
            if (projModal && !projModal.classList.contains('hidden') && window.AppFeatures?.ProjectsFeature?.closeManageProjectsModal) {
                 window.AppFeatures.ProjectsFeature.closeManageProjectsModal(); // If ProjectsFeature manages its own close
            } else if (projModal && !projModal.classList.contains('hidden')) { // Fallback if not in ProjectsFeature
                const projDialog = document.getElementById('modalDialogManageProjects');
                if (projDialog) projDialog.classList.add('scale-95', 'opacity-0');
                setTimeout(() => { projModal.classList.add('hidden'); }, 200);
            }


        } else if ((event.key === '+' || event.key === '=') &&
            !event.altKey && !event.ctrlKey && !event.metaKey &&
            !['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName.toUpperCase()) &&
            document.querySelectorAll('.fixed.inset-0:not(.hidden)').length === 0) { // Check no other modal is open
            event.preventDefault();
            openAddModal();
        }
    });

    // Sub-task add buttons
    const modalAddSubTaskBtnAddEl = document.getElementById('modalAddSubTaskBtnAdd');
    if (modalAddSubTaskBtnAddEl) modalAddSubTaskBtnAddEl.addEventListener('click', handleAddTempSubTaskForAddModal);
    const modalAddSubTaskBtnViewEditEl = document.getElementById('modalAddSubTaskBtnViewEdit');
    if (modalAddSubTaskBtnViewEditEl) modalAddSubTaskBtnViewEditEl.addEventListener('click', handleAddSubTaskViewEdit); // This is now async

    // Bulk Action Listeners
    const selectAllTasksCheckboxEl = document.getElementById('selectAllTasksCheckbox');
    if (selectAllTasksCheckboxEl && isFeatureEnabled('bulkActionsFeature')) {
        selectAllTasksCheckboxEl.addEventListener('change', (e) => {
            const tasksToSelect = ViewManager.getFilteredTasksForBulkAction(); // This function needs to be added to ViewManager or use AppStore + current filters
            if (e.target.checked) {
                tasksToSelect.forEach(task => BulkActionService.selectTaskIfNotSelected(task.id)); // selectIfNotSelected needs to be in BulkActionService
            } else {
                tasksToSelect.forEach(task => BulkActionService.deselectTaskIfSelected(task.id)); // deselectTaskIfSelected needs to be in BulkActionService
            }
        });
    }
    // ... other bulk action button listeners (bulkCompleteBtn, bulkDeleteBtn, etc.)


    console.log("[Event Handlers] All event listeners set up.");
}

// EventBus subscription for feature flag updates
if (EventBus && typeof applyActiveFeatures === 'function') {
    EventBus.subscribe('featureFlagsUpdated', (data) => {
        console.log("[Event Handlers] Event received: featureFlagsUpdated. Re-applying active features.", data);
        applyActiveFeatures(); // This will re-evaluate UI based on new flags
        // If feature flags modal is open, refresh it
        const featureFlagsModalElement = document.getElementById('featureFlagsModal');
        if (featureFlagsModalElement && !featureFlagsModalElement.classList.contains('hidden')) {
            populateFeatureFlagsModal();
        }
    });
} else {
    console.warn("[Event Handlers] EventBus or applyActiveFeatures not available for featureFlagsUpdated subscription.");
}

console.log("ui_event_handlers.js loaded as ES6 module.");