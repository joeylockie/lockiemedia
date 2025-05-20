// ui_event_handlers.js
// Handles event listeners, user interaction handlers (forms, buttons),
// applying feature flags to UI. Now an ES6 module.

import AppStore from './store.js';
import ViewManager from './viewManager.js';
import { isFeatureEnabled, setFeatureFlag, getAllFeatureFlags } from './featureFlagService.js';
import * as TaskService from './taskService.js';
import * as LabelService from './labelService.js';
import ModalStateService from './modalStateService.js';
import TooltipService from './tooltipService.js';
import EventBus from './eventBus.js';
import * as BulkActionService from './bulkActionService.js'; // Import for clearSelections

// Import UI rendering and modal interaction functions
import {
    showMessage,
    refreshTaskView,
    // populateManageLabelsList, // This is in modal_interactions.js
    // styleInitialSmartViewButtons, // This is called by main.js
    // setSidebarMinimized, // This is called by main.js
    showTooltip,
    hideTooltip,
    // updateSortButtonStates, // These are called locally or by main.js
    // updateClearCompletedButtonState,
    // initializeDOMElements, // Called by main.js
    // initializeUiRenderingSubscriptions // Called by main.js
} from './ui_rendering.js';

import {
    openAddModal,
    closeAddModal,
    openViewEditModal,
    closeViewEditModal,
    // openViewTaskDetailsModal, // Called by ui_rendering.js dynamically
    // closeViewTaskDetailsModal,
    // openManageLabelsModal,
    // closeManageLabelsModal,
    populateManageLabelsList, // Used by event subscriber
    // openSettingsModal,
    // closeSettingsModal,
    // openTaskReviewModal,
    // closeTaskReviewModal,
    // populateTaskReviewModal,
    // openTooltipsGuideModal,
    // closeTooltipsGuideModal
} from './modal_interactions.js';

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
import { DataManagementFeature } from './feature_data_management.js'; // Corresponds to exportDataFeature flag
import { CalendarViewFeature } from './feature_calendar_view.js';
import { KanbanBoardFeature } from './feature_kanban_board.js';
import { PomodoroTimerHybridFeature } from './pomodoro_timer.js';
import { ProjectsFeature } from './feature_projects.js'; // Assuming projectFeature flag
import { TooltipsGuideFeature } from './feature_tooltips_guide.js';
// Note: SubTasksFeature is used in handleAddSubTaskViewEdit, assuming global window.AppFeatures.SubTasks
// We'll need to import it if we fully remove window.AppFeatures access here.
// For now, handleAddSubTaskViewEdit might still rely on window.AppFeatures.SubTasks.

// DOM elements are still accessed globally for now, initialized by ui_rendering.js's initializeDOMElements()
// Functions like renderSubTasksForEditModal are also global via window from ui_rendering.js for now.

let tempSubTasksForAddModal = []; // This state might be better managed elsewhere or passed around.

// This function is called by applyActiveFeatures and the event subscriber.
// It no longer needs to be on `window`.
function populateFeatureFlagsModal() {
    // Assumes featureFlagsListContainer is globally available from ui_rendering.js
    const currentFFListContainer = window.featureFlagsListContainer || document.getElementById('featureFlagsListContainer');
    if (!currentFFListContainer) {
        console.warn("Feature flags list container not found for populateFeatureFlagsModal.");
        return;
    }
    currentFFListContainer.innerHTML = '';
    const currentFlags = getAllFeatureFlags();
    const friendlyNames = {
        testButtonFeature: "Test Button", reminderFeature: "Task Reminders", taskTimerSystem: "Task Timer & Review", advancedRecurrence: "Advanced Recurrence (Soon)", fileAttachments: "File Attachments (Soon)", integrationsServices: "Integrations (Soon)", userAccounts: "User Accounts (Soon)", collaborationSharing: "Collaboration (Soon)", crossDeviceSync: "Cross-Device Sync (Soon)", tooltipsGuide: "Tooltips & Shortcuts Guide", subTasksFeature: "Sub-tasks", kanbanBoardFeature: "Kanban Board View", projectFeature: "Projects Feature", exportDataFeature: "Export Data Feature", calendarViewFeature: "Calendar View", taskDependenciesFeature: "Task Dependencies (Soon)", smarterSearchFeature: "Smarter Search (Soon)", bulkActionsFeature: "Bulk Task Actions", pomodoroTimerHybridFeature: "Pomodoro Timer Hybrid"
    };
    const featureOrder = Object.keys(currentFlags);

    featureOrder.forEach(key => {
        if (currentFlags.hasOwnProperty(key)) {
            const flagItem = document.createElement('div'); flagItem.className = 'feature-flag-item';
            const label = document.createElement('span'); label.textContent = friendlyNames[key] || key; label.className = 'feature-flag-label'; flagItem.appendChild(label);
            const toggleContainer = document.createElement('div'); toggleContainer.className = 'relative';
            const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.id = `toggle-${key}`; checkbox.className = 'toggle-checkbox'; checkbox.checked = currentFlags[key];
            checkbox.addEventListener('change', () => {
                setFeatureFlag(key, checkbox.checked);
                // Event 'featureFlagsUpdated' is published by setFeatureFlag.
                // applyActiveFeatures (this module) subscribes to it.
            });
            const toggleLabel = document.createElement('label'); toggleLabel.htmlFor = `toggle-${key}`; toggleLabel.className = 'toggle-label';
            toggleContainer.appendChild(checkbox); toggleContainer.appendChild(toggleLabel);
            flagItem.appendChild(toggleContainer); currentFFListContainer.appendChild(flagItem);
        }
    });
}
// No longer making it global: window.populateFeatureFlagsModal = populateFeatureFlagsModal;


export function applyActiveFeatures() {
    console.log('[ApplyFeatures] Applying active features based on current flags.');
    const toggleElements = (selector, isEnabled) => {
        document.querySelectorAll(selector).forEach(el => el.classList.toggle('hidden', !isEnabled));
    };

    // Use imported feature modules
    if (TestButtonFeature?.updateUIVisibility) TestButtonFeature.updateUIVisibility(); else if (window.testFeatureButtonContainer) window.testFeatureButtonContainer.classList.toggle('hidden', !isFeatureEnabled('testButtonFeature'));
    if (TaskTimerSystemFeature?.updateUIVisibility) TaskTimerSystemFeature.updateUIVisibility(); else { toggleElements('.task-timer-system-element', isFeatureEnabled('taskTimerSystem')); if (window.settingsTaskReviewBtn) window.settingsTaskReviewBtn.classList.toggle('hidden', !isFeatureEnabled('taskTimerSystem')); }
    if (ReminderFeature?.updateUIVisibility) ReminderFeature.updateUIVisibility(); else toggleElements('.reminder-feature-element', isFeatureEnabled('reminderFeature'));
    if (AdvancedRecurrenceFeature?.updateUIVisibility) AdvancedRecurrenceFeature.updateUIVisibility(); else toggleElements('.advanced-recurrence-element', isFeatureEnabled('advancedRecurrence'));
    if (FileAttachmentsFeature?.updateUIVisibility) FileAttachmentsFeature.updateUIVisibility(); else toggleElements('.file-attachments-element', isFeatureEnabled('fileAttachments'));
    if (IntegrationsServicesFeature?.updateUIVisibility) IntegrationsServicesFeature.updateUIVisibility(); else toggleElements('.integrations-services-element', isFeatureEnabled('integrationsServices'));
    if (UserAccountsFeature?.updateUIVisibility) UserAccountsFeature.updateUIVisibility(); else toggleElements('.user-accounts-element', isFeatureEnabled('userAccounts'));
    if (CollaborationSharingFeature?.updateUIVisibility) CollaborationSharingFeature.updateUIVisibility(); else toggleElements('.collaboration-sharing-element', isFeatureEnabled('collaborationSharing'));
    if (CrossDeviceSyncFeature?.updateUIVisibility) CrossDeviceSyncFeature.updateUIVisibility(); else toggleElements('.cross-device-sync-element', isFeatureEnabled('crossDeviceSync'));
    if (TaskDependenciesFeature?.updateUIVisibility) TaskDependenciesFeature.updateUIVisibility(); else toggleElements('.task-dependencies-feature-element', isFeatureEnabled('taskDependenciesFeature'));
    if (SmarterSearchFeature?.updateUIVisibility) SmarterSearchFeature.updateUIVisibility(); else toggleElements('.smarter-search-feature-element', isFeatureEnabled('smarterSearchFeature'));
    if (DataManagementFeature?.updateUIVisibility) DataManagementFeature.updateUIVisibility(); else toggleElements('.export-data-feature-element', isFeatureEnabled('exportDataFeature')); // Flag is 'exportDataFeature'
    if (CalendarViewFeature?.updateUIVisibility) CalendarViewFeature.updateUIVisibility(); else { const cvtb = document.getElementById('calendarViewToggleBtn'); if(cvtb) cvtb.classList.toggle('hidden', !isFeatureEnabled('calendarViewFeature')); toggleElements('.calendar-view-feature-element', isFeatureEnabled('calendarViewFeature'));}
    if (KanbanBoardFeature?.updateUIVisibility) KanbanBoardFeature.updateUIVisibility(); else { const kbtb = document.getElementById('kanbanViewToggleBtn'); if(kbtb) kbtb.classList.toggle('hidden', !isFeatureEnabled('kanbanBoardFeature'));}
    if (PomodoroTimerHybridFeature?.updateUIVisibility) PomodoroTimerHybridFeature.updateUIVisibility(); else toggleElements('.pomodoro-timer-hybrid-feature-element', isFeatureEnabled('pomodoroTimerHybridFeature'));
    if (ProjectsFeature?.updateUIVisibility) ProjectsFeature.updateUIVisibility(); // Added for project feature elements
    if (TooltipsGuideFeature?.updateUIVisibility) TooltipsGuideFeature.updateUIVisibility();


    if (window.settingsTooltipsGuideBtn) window.settingsTooltipsGuideBtn.classList.toggle('hidden', !isFeatureEnabled('tooltipsGuide'));

    if (!isFeatureEnabled('bulkActionsFeature')) {
        if (BulkActionService && BulkActionService.clearSelections) BulkActionService.clearSelections();
        const bulkControls = document.getElementById('bulkActionControlsContainer');
        if (bulkControls) bulkControls.classList.add('hidden');
    } else {
        const bulkControls = document.getElementById('bulkActionControlsContainer');
        if (bulkControls) bulkControls.classList.add('bulk-actions-feature-element'); // Ensure class is there if enabled
        // Visibility handled by renderBulkActionControls based on selection (ui_rendering.js)
    }

    // SubTasksFeature UI elements are often part of modals, toggled directly there or by ui_rendering.js
    // For example, .sub-tasks-feature-element is used on sections within modals.
    // Their visibility is often toggled by ui_rendering when rendering the modal content,
    // or within specific feature logic if a dedicated updateUIVisibility is complex.
    // If SubTasksFeature has a general updateUIVisibility, it can be called:
    // if (SubTasksFeature?.updateUIVisibility) SubTasksFeature.updateUIVisibility();
    // For now, relying on '.sub-tasks-feature-element' toggle by ui_rendering.js or applyActiveFeatures above.
    toggleElements('.sub-tasks-feature-element', isFeatureEnabled('subTasksFeature'));


    refreshTaskView(); // Imported from ui_rendering.js

    const featureFlagsModalElement = document.getElementById('featureFlagsModal');
    if (featureFlagsModalElement && !featureFlagsModalElement.classList.contains('hidden')) {
        populateFeatureFlagsModal(); // Call local function
    }
    console.log('[ApplyFeatures] Finished applying active features.');
}

function handleAddTask(event) {
    event.preventDefault();
    // Assumes modal input elements are globally available
    const taskText = window.modalTaskInputAdd.value.trim();
    const dueDate = window.modalDueDateInputAdd.value;
    const time = window.modalTimeInputAdd.value;
    const priority = window.modalPriorityInputAdd.value;
    const label = window.modalLabelInputAdd.value.trim();
    const notes = window.modalNotesInputAdd.value.trim();
    const projectId = isFeatureEnabled('projectFeature') && window.modalProjectSelectAdd ? parseInt(window.modalProjectSelectAdd.value) : 0;

    let estHours = 0, estMinutes = 0;
    if (isFeatureEnabled('taskTimerSystem') && window.modalEstHoursAdd && window.modalEstMinutesAdd) {
        estHours = parseInt(window.modalEstHoursAdd.value) || 0;
        estMinutes = parseInt(window.modalEstMinutesAdd.value) || 0;
    }

    let isReminderSet = false, reminderDate = null, reminderTime = null, reminderEmail = null;
    if (isFeatureEnabled('reminderFeature') && window.modalRemindMeAdd && window.modalRemindMeAdd.checked) {
        isReminderSet = true;
        reminderDate = window.modalReminderDateAdd.value;
        reminderTime = window.modalReminderTimeAdd.value;
        reminderEmail = window.modalReminderEmailAdd.value.trim();
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
            dueDate: parsedResult.parsedDate || dueDate, // Prioritize explicitly set, then parsed
            time, priority, label, notes, projectId,
            isReminderSet, reminderDate, reminderTime, reminderEmail,
            estimatedHours: estHours, estimatedMinutes: estMinutes,
            subTasks: subTasksToAdd
            // Add other fields like attachments, dependencies when their features are fully implemented
        });
        showMessage('Task added successfully!', 'success');
        closeAddModal(); // Imported
        ViewManager.setCurrentFilter('inbox'); // To show the new task
        tempSubTasksForAddModal = []; // Reset temp state
    } else {
        showMessage('Task description cannot be empty.', 'error');
    }
}
function handleEditTask(event) {
    event.preventDefault();
    // Assumes modal input elements are globally available
    const taskId = parseInt(window.modalViewEditTaskId.value);
    const taskText = window.modalTaskInputViewEdit.value.trim();
    const dueDate = window.modalDueDateInputViewEdit.value;
    const time = window.modalTimeInputViewEdit.value;
    const priority = window.modalPriorityInputViewEdit.value;
    const label = window.modalLabelInputViewEdit.value.trim();
    const notes = window.modalNotesInputViewEdit.value.trim();
    const projectId = isFeatureEnabled('projectFeature') && window.modalProjectSelectViewEdit ? parseInt(window.modalProjectSelectViewEdit.value) : 0;

    let estHours = 0, estMinutes = 0;
    if (isFeatureEnabled('taskTimerSystem') && TaskTimerSystemFeature?.getEstimatesFromEditModal) {
        const estimates = TaskTimerSystemFeature.getEstimatesFromEditModal(); // Uses service
        estHours = estimates.estHours;
        estMinutes = estimates.estMinutes;
    }

    let isReminderSet = false, reminderDate = null, reminderTime = null, reminderEmail = null;
    if (isFeatureEnabled('reminderFeature') && window.modalRemindMeViewEdit && window.modalRemindMeViewEdit.checked) {
        isReminderSet = true;
        reminderDate = window.modalReminderDateViewEdit.value;
        reminderTime = window.modalReminderTimeViewEdit.value;
        reminderEmail = window.modalReminderEmailViewEdit.value.trim();
        if (!reminderDate || !reminderTime || !reminderEmail) {
            showMessage('Please fill all reminder fields or disable the reminder for edit.', 'error');
            return;
        }
    }

    if (taskText && taskId) {
        // Sub-tasks are modified directly via SubTasksFeature and saved with the parent task implicitly
        // No need to pass subTasks array here unless we are replacing all of them.
        // The current structure modifies subTasks on the task object in the store directly.
        TaskService.updateTask(taskId, {
            text: taskText, dueDate, time, priority, label, notes, projectId,
            isReminderSet, reminderDate, reminderTime, reminderEmail,
            estimatedHours: estHours, estimatedMinutes: estMinutes
        });
        showMessage('Task updated successfully!', 'success');
        closeViewEditModal(); // Imported
    } else {
        showMessage('Task description cannot be empty.', 'error');
    }
}

// toggleComplete and deleteTask are made global for ui_rendering.js's dynamic elements.
// This will be refactored later.
export function toggleComplete(taskId) { // Exporting so it can be potentially imported if needed elsewhere
    const updatedTask = TaskService.toggleTaskComplete(taskId);
    if (updatedTask && updatedTask._blocked) {
        showMessage('Cannot complete task: It has incomplete prerequisite tasks.', 'warn');
    } else if (updatedTask) {
        // If the "View Details" modal is open for this task, refresh its status display
        if (ModalStateService.getCurrentViewTaskId() === taskId && window.viewTaskStatus) {
            window.viewTaskStatus.textContent = updatedTask.completed ? 'Completed' : 'Active';
            // Potentially refresh other parts of the view details modal too if completion affects them
        }
        // showMessage(updatedTask.completed ? 'Task marked complete!' : 'Task marked active.', 'info');
    } else {
        showMessage('Error toggling task completion.', 'error');
    }
}
window.toggleComplete = toggleComplete; // Still global for now

export function deleteTask(taskId) { // Exporting
    if (confirm('Are you sure you want to delete this task?')) {
        if (TaskService.deleteTaskById(taskId)) {
            showMessage('Task deleted successfully!', 'success');
            // If the "View Details" or "Edit" modal was open for this task, close it
            if (ModalStateService.getCurrentViewTaskId() === taskId) {
                // closeViewTaskDetailsModal(); // This should be imported and called
                // For now, assume its global or handled by other events
            }
            if (ModalStateService.getEditingTaskId() === taskId) {
                // closeViewEditModal(); // This should be imported and called
            }
        } else {
            showMessage('Error deleting task.', 'error');
        }
    }
}
window.deleteTask = deleteTask; // Still global for now

export function setFilter(filter) { // Exporting
    if (!ViewManager) { console.error("[SetFilter] ViewManager not available."); return; }
    ViewManager.setCurrentFilter(filter);
    // UI update for button styles (still uses global window.smartViewButtons)
    if (window.smartViewButtons) {
        window.smartViewButtons.forEach(button => {
            button.classList.toggle('bg-sky-500', button.dataset.filter === filter);
            button.classList.toggle('text-white', button.dataset.filter === filter);
            button.classList.toggle('dark:bg-sky-600', button.dataset.filter === filter);
            button.classList.toggle('bg-slate-200', button.dataset.filter !== filter);
            button.classList.toggle('text-slate-700', button.dataset.filter !== filter);
            button.classList.toggle('hover:bg-slate-300', button.dataset.filter !== filter);
            button.classList.toggle('dark:bg-slate-700', button.dataset.filter !== filter);
            button.classList.toggle('dark:text-slate-300', button.dataset.filter !== filter);
            button.classList.toggle('dark:hover:bg-slate-600', button.dataset.filter !== filter);
        });
    }
    if (isFeatureEnabled('projectFeature') && ProjectsFeature) { // Using imported ProjectsFeature
        const projectFilterButtons = document.querySelectorAll('#projectFilterContainer .smart-view-btn');
        projectFilterButtons.forEach(button => {
            button.classList.toggle('bg-purple-500', button.dataset.filter === filter);
            button.classList.toggle('text-white', button.dataset.filter === filter);
            button.classList.toggle('font-semibold', button.dataset.filter === filter);
            button.classList.toggle('dark:bg-purple-600', button.dataset.filter === filter);
            button.classList.toggle('dark:text-purple-50', button.dataset.filter === filter);
            button.classList.toggle('bg-slate-200', button.dataset.filter !== filter);
            button.classList.toggle('text-slate-700', button.dataset.filter !== filter);
            button.classList.toggle('hover:bg-slate-300', button.dataset.filter !== filter);
            button.classList.toggle('dark:bg-slate-700', button.dataset.filter !== filter);
            button.classList.toggle('dark:text-slate-300', button.dataset.filter !== filter);
            button.classList.toggle('dark:hover:bg-slate-600', button.dataset.filter !== filter);
            const icon = button.querySelector('i');
            if (icon) {
                icon.classList.toggle('text-purple-100', button.dataset.filter === filter);
                icon.classList.toggle('dark:text-purple-200', button.dataset.filter === filter);
                icon.classList.toggle('text-slate-500', button.dataset.filter !== filter);
                icon.classList.toggle('dark:text-slate-400', button.dataset.filter !== filter);
            }
        });
    }
    if (typeof window.updateSortButtonStates === 'function') window.updateSortButtonStates(); // Call global from ui_rendering.js
}
window.setFilter = setFilter; // Still global for now

function clearCompletedTasks() {
    if (confirm('Are you sure you want to clear all completed tasks? This action cannot be undone.')) {
        const tasks = AppStore.getTasks();
        let deletedCount = 0;
        tasks.filter(task => task.completed).forEach(task => {
            if (TaskService.deleteTaskById(task.id)) {
                deletedCount++;
            }
        });
        if (deletedCount > 0) {
            showMessage(`${deletedCount} completed task(s) cleared.`, 'success');
        } else {
            showMessage('No completed tasks to clear.', 'info');
        }
        if (typeof window.closeSettingsModal === 'function') window.closeSettingsModal(); // Call global from modal_interactions.js
    }
}
function handleAddNewLabel(event) {
    event.preventDefault();
    // Assumes newLabelInput is global
    const labelName = window.newLabelInput.value.trim();
    if (LabelService.addConceptualLabel(labelName)) { // This function in LabelService shows its own messages
        window.newLabelInput.value = '';
        // The label list in the modal will update if populateManageLabelsList is called
        // or if the 'labelsChanged' event is handled by ui_rendering for datalists
        // and modal_interactions for the manage labels list.
        // For immediate update of the "Manage Labels" modal list IF IT'S OPEN:
        if (window.manageLabelsModal && !window.manageLabelsModal.classList.contains('hidden')) {
            populateManageLabelsList(); // Imported from modal_interactions.js
        }
    }
}
export function handleDeleteLabel(labelNameToDelete) { // Exporting
    if (confirm(`Are you sure you want to delete the label "${labelNameToDelete}" from all tasks? This will remove the label from tasks, not delete the tasks themselves.`)) {
        if (LabelService.deleteLabelUsageFromTasks(labelNameToDelete)) {
            showMessage(`Label "${labelNameToDelete}" removed from all tasks.`, 'success');
            // The "Manage Labels" modal list needs to be refreshed if it's open
            if (window.manageLabelsModal && !window.manageLabelsModal.classList.contains('hidden')) {
                 populateManageLabelsList(); // Imported
            }
        } else {
            showMessage(`Label "${labelNameToDelete}" was not found on any tasks or an error occurred.`, 'info');
        }
    }
}
window.handleDeleteLabel = handleDeleteLabel; // Still global for now

function handleAddSubTaskViewEdit() {
    // Assumes modalSubTaskInputViewEdit, renderSubTasksForEditModal, renderSubTasksForViewModal are global
    const parentId = ModalStateService.getEditingTaskId();
    const subTaskText = window.modalSubTaskInputViewEdit.value.trim();
    if (!parentId || !subTaskText) {
        showMessage('Sub-task text cannot be empty.', 'error');
        return;
    }
    // Assuming SubTasksFeature is on window.AppFeatures for now. This needs to be imported eventually.
    if (window.AppFeatures?.SubTasksFeature?.add(parentId, subTaskText)) {
        showMessage('Sub-task added.', 'success');
        window.modalSubTaskInputViewEdit.value = '';
        if (typeof window.renderSubTasksForEditModal === 'function') {
            window.renderSubTasksForEditModal(parentId, window.modalSubTasksListViewEdit);
        }
        // If view details modal is also updated in real-time for subtasks, might need:
        // if (typeof window.renderSubTasksForViewModal === 'function' && window.viewTaskDetailsModal && !window.viewTaskDetailsModal.classList.contains('hidden') && ModalStateService.getCurrentViewTaskId() === parentId) {
        //     window.renderSubTasksForViewModal(parentId, window.modalSubTasksListViewDetails, window.viewSubTaskProgress, window.noSubTasksMessageViewDetails);
        // }
    } else {
        showMessage('Failed to add sub-task.', 'error');
    }
}
function handleAddTempSubTaskForAddModal() {
    // Assumes modalSubTaskInputAdd and renderTempSubTasksForAddModal are global
    const subTaskText = window.modalSubTaskInputAdd.value.trim();
    if (!subTaskText) {
        showMessage('Sub-task text cannot be empty.', 'error');
        return;
    }
    tempSubTasksForAddModal.push({ id: Date.now(), text: subTaskText, completed: false });
    window.modalSubTaskInputAdd.value = '';
    if (typeof window.renderTempSubTasksForAddModal === 'function') {
        window.renderTempSubTasksForAddModal(tempSubTasksForAddModal, window.modalSubTasksListAdd);
    }
}

export function setupEventListeners() {
    // Uses ViewManager, FeatureFlagService, TooltipService (all imported)
    // Calls to open/close modal functions are now imported where possible
    // DOM elements are mostly global for now (e.g., window.taskSidebar, window.sidebarToggleBtn)

    // Sidebar Toggle
    if (window.sidebarToggleBtn) {
        window.sidebarToggleBtn.addEventListener('click', () => {
            const isMinimized = window.taskSidebar.classList.toggle('sidebar-minimized');
            // setSidebarMinimized(isMinimized); // This is in ui_rendering.js, called by main.js on load
            localStorage.setItem('sidebarState', isMinimized ? 'minimized' : 'expanded');
            if (window.sidebarToggleIcon) {
                window.sidebarToggleIcon.className = `fas ${isMinimized ? 'fa-chevron-right' : 'fa-chevron-left'}`;
            }
            window.sidebarTextElements.forEach(el => el.classList.toggle('hidden', isMinimized));
            window.sidebarIconOnlyButtons.forEach(btn => {
                btn.classList.toggle('justify-center', isMinimized);
                const icon = btn.querySelector('i');
                const text = btn.querySelector('.sidebar-text-content');
                if (icon) icon.classList.toggle('mr-0', isMinimized);
                if (text) text.classList.toggle('ml-2', !isMinimized);
            });
            if (isMinimized) hideTooltip(); else TooltipService.clearTooltipTimeout(); // Use imported hideTooltip
            if (isFeatureEnabled('projectFeature') && ProjectsFeature?.populateProjectFilterList) { // Use imported ProjectsFeature
                ProjectsFeature.populateProjectFilterList(); // Re-render to adjust text/icons
            }
            if (isFeatureEnabled('pomodoroTimerHybridFeature') && PomodoroTimerHybridFeature?.updateSidebarDisplay) {
                PomodoroTimerHybridFeature.updateSidebarDisplay();
            }
        });
    }

    // Sidebar icon tooltips (uses imported TooltipService and show/hideTooltip)
    if (window.sidebarIconOnlyButtons) {
        window.sidebarIconOnlyButtons.forEach(button => {
            button.addEventListener('mouseenter', (event) => {
                if (!window.taskSidebar || !window.taskSidebar.classList.contains('sidebar-minimized')) return;
                TooltipService.clearTooltipTimeout();
                const tooltipText = button.title || button.querySelector('.sidebar-text-content')?.textContent.trim();
                if (!tooltipText) return;
                const timeoutId = setTimeout(() => {
                    showTooltip(event.currentTarget, tooltipText); // Use imported showTooltip
                }, 500);
                TooltipService.setTooltipTimeout(timeoutId);
            });
            button.addEventListener('mouseleave', () => {
                TooltipService.clearTooltipTimeout();
                hideTooltip(); // Use imported hideTooltip
            });
        });
    }

    // Modal Openers (Using imported functions where possible)
    if (window.openAddModalButton) window.openAddModalButton.addEventListener('click', openAddModal); // Imported
    if (window.settingsManageLabelsBtn) window.settingsManageLabelsBtn.addEventListener('click', () => { if (typeof window.openManageLabelsModal === 'function') window.openManageLabelsModal(); }); // modal_interactions
    if (window.openSettingsModalButton) window.openSettingsModalButton.addEventListener('click', () => { if (typeof window.openSettingsModal === 'function') window.openSettingsModal(); }); // modal_interactions
    if (window.settingsTaskReviewBtn) window.settingsTaskReviewBtn.addEventListener('click', () => { if (typeof window.openTaskReviewModal === 'function') window.openTaskReviewModal(); }); // modal_interactions
    if (window.settingsTooltipsGuideBtn) window.settingsTooltipsGuideBtn.addEventListener('click', () => { if (typeof window.openTooltipsGuideModal === 'function') window.openTooltipsGuideModal(); }); // modal_interactions
    if (isFeatureEnabled('projectFeature') && window.settingsManageProjectsBtn) { // Check feature flag
        window.settingsManageProjectsBtn.addEventListener('click', () => {
            if (ProjectsFeature?.openManageProjectsModal) ProjectsFeature.openManageProjectsModal();
        });
    }


    // Modal Closers (Using imported functions where possible)
    if (window.closeAddModalBtn) window.closeAddModalBtn.addEventListener('click', closeAddModal); // Imported
    if (window.cancelAddModalBtn) window.cancelAddModalBtn.addEventListener('click', closeAddModal); // Imported
    if (window.addTaskModal) window.addTaskModal.addEventListener('click', (event) => { if (event.target === window.addTaskModal) closeAddModal(); }); // Imported

    if (window.closeViewEditModalBtn) window.closeViewEditModalBtn.addEventListener('click', closeViewEditModal); // Imported
    if (window.cancelViewEditModalBtn) window.cancelViewEditModalBtn.addEventListener('click', closeViewEditModal); // Imported
    if (window.viewEditTaskModal) window.viewEditTaskModal.addEventListener('click', (event) => { if (event.target === window.viewEditTaskModal) closeViewEditModal(); }); // Imported

    if (window.closeViewDetailsModalBtn) window.closeViewDetailsModalBtn.addEventListener('click', () => { if (typeof window.closeViewTaskDetailsModal === 'function') window.closeViewTaskDetailsModal();});
    if (window.closeViewDetailsSecondaryBtn) window.closeViewDetailsSecondaryBtn.addEventListener('click', () => { if (typeof window.closeViewTaskDetailsModal === 'function') window.closeViewTaskDetailsModal();});
    if (window.viewTaskDetailsModal) window.viewTaskDetailsModal.addEventListener('click', (event) => { if (event.target === window.viewTaskDetailsModal && typeof window.closeViewTaskDetailsModal === 'function') window.closeViewTaskDetailsModal(); });

    // ... (other modal closers for manageLabels, settings, etc. would follow the same pattern, calling imported functions)
    // Example for settings:
    if (window.closeSettingsModalBtn) window.closeSettingsModalBtn.addEventListener('click', () => { if (typeof window.closeSettingsModal === 'function') window.closeSettingsModal(); });
    if (window.closeSettingsSecondaryBtn) window.closeSettingsSecondaryBtn.addEventListener('click', () => { if (typeof window.closeSettingsModal === 'function') window.closeSettingsModal(); });
    if (window.settingsModal) window.settingsModal.addEventListener('click', (event) => { if (event.target === window.settingsModal && typeof window.closeSettingsModal === 'function') window.closeSettingsModal(); });
    // ... and so on for other modals like manageLabelsModal, taskReviewModal, tooltipsGuideModal, featureFlagsModal


    // Form Submissions
    if (window.modalTodoFormAdd) window.modalTodoFormAdd.addEventListener('submit', handleAddTask);
    if (window.modalTodoFormViewEdit) window.modalTodoFormViewEdit.addEventListener('submit', handleEditTask);
    if (window.addNewLabelForm) window.addNewLabelForm.addEventListener('submit', handleAddNewLabel);

    // Filter Buttons (uses global window.setFilter for now)
    if (window.smartViewButtons) {
        window.smartViewButtons.forEach(button => {
            button.addEventListener('click', () => window.setFilter(button.dataset.filter));
        });
    }

    // Sort Buttons (uses ViewManager and global updateSortButtonStates from ui_rendering.js)
    const sortButtons = [
        { el: window.sortByDueDateBtn, type: 'dueDate' },
        { el: window.sortByPriorityBtn, type: 'priority' },
        { el: window.sortByLabelBtn, type: 'label' }
    ];
    sortButtons.forEach(item => {
        if (item.el) {
            item.el.addEventListener('click', () => {
                ViewManager.setCurrentSort(item.type);
                // updateSortButtonStates is in ui_rendering.js, currently global
                if (typeof window.updateSortButtonStates === 'function') window.updateSortButtonStates();
            });
        }
    });

    // View Toggle Buttons (Kanban, Calendar, Pomodoro)
    // These dispatch to ViewManager which then triggers refreshTaskView via event
    if (window.kanbanViewToggleBtn) {
        window.kanbanViewToggleBtn.addEventListener('click', () => {
            const currentMode = ViewManager.getCurrentTaskViewMode();
            ViewManager.setTaskViewMode(currentMode === 'kanban' ? 'list' : 'kanban');
        });
    }
    if (window.calendarViewToggleBtn) {
        window.calendarViewToggleBtn.addEventListener('click', () => {
            const currentMode = ViewManager.getCurrentTaskViewMode();
            ViewManager.setTaskViewMode(currentMode === 'calendar' ? 'list' : 'calendar');
        });
    }
    if (window.pomodoroViewToggleBtn) {
        window.pomodoroViewToggleBtn.addEventListener('click', () => {
            const currentMode = ViewManager.getCurrentTaskViewMode();
            ViewManager.setTaskViewMode(currentMode === 'pomodoro' ? 'list' : 'pomodoro');
        });
    }


    // Search Input (uses ViewManager)
    if (window.taskSearchInput) {
        window.taskSearchInput.addEventListener('input', (e) => ViewManager.setCurrentSearchTerm(e.target.value));
    }

    // Settings Actions
    if (window.settingsClearCompletedBtn) window.settingsClearCompletedBtn.addEventListener('click', clearCompletedTasks);

    // Keydown listener for Escape key to close modals
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            // Using imported close functions where available
            if (window.addTaskModal && !window.addTaskModal.classList.contains('hidden')) closeAddModal();
            else if (window.viewEditTaskModal && !window.viewEditTaskModal.classList.contains('hidden')) closeViewEditModal();
            else if (window.viewTaskDetailsModal && !window.viewTaskDetailsModal.classList.contains('hidden') && typeof window.closeViewTaskDetailsModal === 'function') window.closeViewTaskDetailsModal();
            else if (window.manageLabelsModal && !window.manageLabelsModal.classList.contains('hidden') && typeof window.closeManageLabelsModal === 'function') window.closeManageLabelsModal();
            else if (window.settingsModal && !window.settingsModal.classList.contains('hidden') && typeof window.closeSettingsModal === 'function') window.closeSettingsModal();
            else if (window.taskReviewModal && !window.taskReviewModal.classList.contains('hidden') && typeof window.closeTaskReviewModal === 'function') window.closeTaskReviewModal();
            else if (window.tooltipsGuideModal && !window.tooltipsGuideModal.classList.contains('hidden') && typeof window.closeTooltipsGuideModal === 'function') window.closeTooltipsGuideModal();
            else if (window.featureFlagsModal && !window.featureFlagsModal.classList.contains('hidden') && typeof window.closeFeatureFlagsModal === 'function') window.closeFeatureFlagsModal();
            else if (window.manageProjectsModal && !window.manageProjectsModal.classList.contains('hidden') && ProjectsFeature?.closeManageProjectsModal) ProjectsFeature.closeManageProjectsModal();
        }
    });

    // Keydown for Add Task Shortcut
    document.addEventListener('keydown', (event) => {
        if ((event.key === '+' || event.key === '=') &&
            !event.altKey && !event.ctrlKey && !event.metaKey &&
            !['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName.toUpperCase()) &&
            document.querySelectorAll('.fixed.inset-0:not(.hidden)').length === 0) { // No other modal open
            event.preventDefault();
            openAddModal(); // Imported
        }
    });

    // Reminder checkbox interactions (handled by ReminderFeature.initialize)

    // Sub-task add buttons
    if (window.modalAddSubTaskBtnAdd) window.modalAddSubTaskBtnAdd.addEventListener('click', handleAddTempSubTaskForAddModal);
    if (window.modalAddSubTaskBtnViewEdit) window.modalAddSubTaskBtnViewEdit.addEventListener('click', handleAddSubTaskViewEdit);

    // Bulk Action Controls (listeners for these are in ui_rendering.js's renderBulkActionControls or should be)
    // For now, we'll assume they are set up where the controls are rendered.
    // This file only clears selections if the feature is disabled (in applyActiveFeatures).

    console.log("[Event Handlers] All event listeners set up.");
}

// Subscription for feature flag changes to re-apply UI rules
if (EventBus && typeof applyActiveFeatures === 'function') {
    EventBus.subscribe('featureFlagsUpdated', (data) => {
        console.log("[Event Handlers] Event received: featureFlagsUpdated. Re-applying active features.", data);
        applyActiveFeatures(); // This is now a module-scoped function
        const featureFlagsModalElement = document.getElementById('featureFlagsModal');
        // Call local populateFeatureFlagsModal
        if (featureFlagsModalElement && !featureFlagsModalElement.classList.contains('hidden')) {
            populateFeatureFlagsModal();
        }
    });
} else {
    console.warn("[Event Handlers] EventBus or applyActiveFeatures not available for 'featureFlagsUpdated' subscription.");
}

console.log("ui_event_handlers.js loaded as ES6 module.");