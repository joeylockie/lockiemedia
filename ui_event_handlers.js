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
    const friendlyNames = { /* ... names as before ... */ };
    const featureOrder = Object.keys(currentFlags);

    featureOrder.forEach(key => { /* ... content as before ... */ });
}

export function applyActiveFeatures() {
    console.log('[ApplyFeatures] Applying active features based on current flags.');
    const toggleElements = (selector, isEnabled) => {
        document.querySelectorAll(selector).forEach(el => el.classList.toggle('hidden', !isEnabled));
    };

    // Use imported feature modules
    if (TestButtonFeature?.updateUIVisibility) TestButtonFeature.updateUIVisibility(); else { const el = document.getElementById('testFeatureButtonContainer'); if(el) el.classList.toggle('hidden', !isFeatureEnabled('testButtonFeature'));}
    if (TaskTimerSystemFeature?.updateUIVisibility) TaskTimerSystemFeature.updateUIVisibility(); else { toggleElements('.task-timer-system-element', isFeatureEnabled('taskTimerSystem')); const btn = document.getElementById('settingsTaskReviewBtn'); if(btn) btn.classList.toggle('hidden', !isFeatureEnabled('taskTimerSystem')); }
    if (ReminderFeature?.updateUIVisibility) ReminderFeature.updateUIVisibility(); else toggleElements('.reminder-feature-element', isFeatureEnabled('reminderFeature'));
    if (AdvancedRecurrenceFeature?.updateUIVisibility) AdvancedRecurrenceFeature.updateUIVisibility(); else toggleElements('.advanced-recurrence-element', isFeatureEnabled('advancedRecurrence'));
    if (FileAttachmentsFeature?.updateUIVisibility) FileAttachmentsFeature.updateUIVisibility(); else toggleElements('.file-attachments-element', isFeatureEnabled('fileAttachments'));
    if (IntegrationsServicesFeature?.updateUIVisibility) IntegrationsServicesFeature.updateUIVisibility(); else toggleElements('.integrations-services-element', isFeatureEnabled('integrationsServices'));
    if (UserAccountsFeature?.updateUIVisibility) UserAccountsFeature.updateUIVisibility(); else toggleElements('.user-accounts-element', isFeatureEnabled('userAccounts'));
    if (CollaborationSharingFeature?.updateUIVisibility) CollaborationSharingFeature.updateUIVisibility(); else toggleElements('.collaboration-sharing-element', isFeatureEnabled('collaborationSharing'));
    if (CrossDeviceSyncFeature?.updateUIVisibility) CrossDeviceSyncFeature.updateUIVisibility(); else toggleElements('.cross-device-sync-element', isFeatureEnabled('crossDeviceSync'));
    if (TaskDependenciesFeature?.updateUIVisibility) TaskDependenciesFeature.updateUIVisibility(); else toggleElements('.task-dependencies-feature-element', isFeatureEnabled('taskDependenciesFeature'));
    if (SmarterSearchFeature?.updateUIVisibility) SmarterSearchFeature.updateUIVisibility(); else toggleElements('.smarter-search-feature-element', isFeatureEnabled('smarterSearchFeature'));
    if (DataManagementFeature?.updateUIVisibility) DataManagementFeature.updateUIVisibility(); else toggleElements('.export-data-feature-element', isFeatureEnabled('exportDataFeature'));
    if (CalendarViewFeature?.updateUIVisibility) CalendarViewFeature.updateUIVisibility(); else { const cvtb = document.getElementById('calendarViewToggleBtn'); if(cvtb) cvtb.classList.toggle('hidden', !isFeatureEnabled('calendarViewFeature')); toggleElements('.calendar-view-feature-element', isFeatureEnabled('calendarViewFeature'));}
    if (KanbanBoardFeature?.updateUIVisibility) KanbanBoardFeature.updateUIVisibility(); else { const kbtb = document.getElementById('kanbanViewToggleBtn'); if(kbtb) kbtb.classList.toggle('hidden', !isFeatureEnabled('kanbanBoardFeature'));}
    if (PomodoroTimerHybridFeature?.updateUIVisibility) PomodoroTimerHybridFeature.updateUIVisibility(); else toggleElements('.pomodoro-timer-hybrid-feature-element', isFeatureEnabled('pomodoroTimerHybridFeature'));
    if (ProjectsFeature?.updateUIVisibility) ProjectsFeature.updateUIVisibility();
    if (TooltipsGuideFeature?.updateUIVisibility) TooltipsGuideFeature.updateUIVisibility();
    if (SubTasksFeature?.updateUIVisibility) SubTasksFeature.updateUIVisibility(); else toggleElements('.sub-tasks-feature-element', isFeatureEnabled('subTasksFeature'));


    const settingsTooltipsGuideBtnEl = document.getElementById('settingsTooltipsGuideBtn');
    if (settingsTooltipsGuideBtnEl) settingsTooltipsGuideBtnEl.classList.toggle('hidden', !isFeatureEnabled('tooltipsGuide'));

    if (!isFeatureEnabled('bulkActionsFeature')) {
        if (BulkActionService && BulkActionService.clearSelections) BulkActionService.clearSelections();
        const bulkControls = document.getElementById('bulkActionControlsContainer');
        if (bulkControls) bulkControls.classList.add('hidden');
    } else {
        const bulkControls = document.getElementById('bulkActionControlsContainer');
        if (bulkControls) bulkControls.classList.add('bulk-actions-feature-element');
    }

    refreshTaskView();

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
        showMessage('Task added successfully!', 'success');
        closeAddModal();
        ViewManager.setCurrentFilter('inbox');
        clearTempSubTasksForAddModal(); // Use local function to clear module-scoped array
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
        });
        showMessage('Task updated successfully!', 'success');
        closeViewEditModal();
    } else {
        showMessage('Task description cannot be empty.', 'error');
    }
}

export function toggleComplete(taskId) {
    const updatedTask = TaskService.toggleTaskComplete(taskId);
    if (updatedTask && updatedTask._blocked) {
        showMessage('Cannot complete task: It has incomplete prerequisite tasks.', 'warn');
    } else if (updatedTask) {
        const viewTaskStatusEl = document.getElementById('viewTaskStatus');
        if (ModalStateService.getCurrentViewTaskId() === taskId && viewTaskStatusEl) {
            viewTaskStatusEl.textContent = updatedTask.completed ? 'Completed' : 'Active';
        }
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

        } else {
            showMessage('Error deleting task.', 'error');
        }
    }
}
// No longer: window.deleteTask = deleteTask;

export function setFilter(filter) { // Still exported for feature_projects.js, ui_rendering for smart btns
    if (!ViewManager) { console.error("[SetFilter] ViewManager not available."); return; }
    ViewManager.setCurrentFilter(filter);
    const smartViewButtonsContainerEl = document.getElementById('smartViewButtonsContainer');
    if (smartViewButtonsContainerEl) {
        const smartViewButtonsEls = smartViewButtonsContainerEl.querySelectorAll('.smart-view-btn');
        smartViewButtonsEls.forEach(button => { /* ...styling as before... */ });
    }
    if (isFeatureEnabled('projectFeature') && ProjectsFeature) {
        const projectFilterContainerEl = document.getElementById('projectFilterContainer');
        if (projectFilterContainerEl) {
            const projectFilterButtons = projectFilterContainerEl.querySelectorAll('.smart-view-btn');
            projectFilterButtons.forEach(button => { /* ...styling as before... */});
        }
    }
    const uiRenderingModule = await import('./ui_rendering.js'); // Dynamic import if needed for updateSortButtonStates
    if (uiRenderingModule.updateSortButtonStates) {
        uiRenderingModule.updateSortButtonStates();
    } else if (typeof window.updateSortButtonStates === 'function') { // Fallback for existing global during transition
        window.updateSortButtonStates();
    }
}
// No longer: window.setFilter = setFilter;

function clearCompletedTasks() {
    if (confirm('Are you sure you want to clear all completed tasks? This action cannot be undone.')) {
        const tasks = AppStore.getTasks();
        let deletedCount = 0;
        tasks.filter(task => task.completed).forEach(task => {
            if (TaskService.deleteTaskById(task.id)) {
                deletedCount++;
            }
        });
        if (deletedCount > 0) { showMessage(`${deletedCount} completed task(s) cleared.`, 'success'); }
        else { showMessage('No completed tasks to clear.', 'info'); }
        closeSettingsModal();
    }
}
function handleAddNewLabel(event) {
    event.preventDefault();
    const newLabelInputEl = document.getElementById('newLabelInput');
    const labelName = newLabelInputEl.value.trim();
    if (LabelService.addConceptualLabel(labelName)) {
        newLabelInputEl.value = '';
        const manageLabelsModalEl = document.getElementById('manageLabelsModal');
        if (manageLabelsModalEl && !manageLabelsModalEl.classList.contains('hidden')) {
            populateManageLabelsList();
        }
    }
}
export function handleDeleteLabel(labelNameToDelete) {
    if (confirm(`Are you sure you want to delete the label "${labelNameToDelete}" from all tasks? ...`)) {
        if (LabelService.deleteLabelUsageFromTasks(labelNameToDelete)) {
            showMessage(`Label "${labelNameToDelete}" removed from all tasks.`, 'success');
            const manageLabelsModalEl = document.getElementById('manageLabelsModal');
            if (manageLabelsModalEl && !manageLabelsModalEl.classList.contains('hidden')) {
                 populateManageLabelsList();
            }
        } else { /* ... */ }
    }
}
// No longer: window.handleDeleteLabel = handleDeleteLabel;

function handleAddSubTaskViewEdit() {
    const modalSubTaskInputViewEditEl = document.getElementById('modalSubTaskInputViewEdit');
    const modalSubTasksListViewEditEl = document.getElementById('modalSubTasksListViewEdit');

    const parentId = ModalStateService.getEditingTaskId();
    const subTaskText = modalSubTaskInputViewEditEl.value.trim();
    if (!parentId || !subTaskText) { /* ... */ return; }

    if (SubTasksFeature?.add(parentId, subTaskText)) { // Use imported SubTasksFeature
        showMessage('Sub-task added.', 'success');
        modalSubTaskInputViewEditEl.value = '';
        // Assuming renderSubTasksForEditModal is imported or available from ui_rendering.js
        const uiRendering = await import('./ui_rendering.js');
        if (uiRendering.renderSubTasksForEditModal) {
            uiRendering.renderSubTasksForEditModal(parentId, modalSubTasksListViewEditEl);
        }
    } else { /* ... */ }
}
function handleAddTempSubTaskForAddModal() {
    const modalSubTaskInputAddEl = document.getElementById('modalSubTaskInputAdd');
    const modalSubTasksListAddEl = document.getElementById('modalSubTasksListAdd');

    const subTaskText = modalSubTaskInputAddEl.value.trim();
    if (!subTaskText) { /* ... */ return; }
    tempSubTasksForAddModal.push({ id: Date.now(), text: subTaskText, completed: false });
    modalSubTaskInputAddEl.value = '';
    // Assuming renderTempSubTasksForAddModal is imported from ui_rendering.js
    // (it was updated to take tempSubTasks and listElement as params)
    renderTempSubTasksForAddModal(tempSubTasksForAddModal, modalSubTasksListAddEl);
}

export function setupEventListeners() {
    // Sidebar Toggle
    const sidebarToggleBtnEl = document.getElementById('sidebarToggleBtn');
    if (sidebarToggleBtnEl) {
        sidebarToggleBtnEl.addEventListener('click', () => {
            const taskSidebarEl = document.getElementById('taskSidebar');
            const sidebarToggleIconEl = document.getElementById('sidebarToggleIcon');
            const sidebarTextElementsEls = taskSidebarEl ? taskSidebarEl.querySelectorAll('.sidebar-text-content') : [];
            const sidebarIconOnlyButtonsEls = taskSidebarEl ? taskSidebarEl.querySelectorAll('.sidebar-button-icon-only') : [];

            const isMinimized = taskSidebarEl.classList.toggle('sidebar-minimized');
            localStorage.setItem('sidebarState', isMinimized ? 'minimized' : 'expanded');
            if (sidebarToggleIconEl) sidebarToggleIconEl.className = `fas ${isMinimized ? 'fa-chevron-right' : 'fa-chevron-left'}`;
            sidebarTextElementsEls.forEach(el => el.classList.toggle('hidden', isMinimized));
            sidebarIconOnlyButtonsEls.forEach(btn => { /* ... as before ... */ });
            if (isMinimized) hideTooltip(); else TooltipService.clearTooltipTimeout();
            if (isFeatureEnabled('projectFeature') && ProjectsFeature?.populateProjectFilterList) ProjectsFeature.populateProjectFilterList();
            if (isFeatureEnabled('pomodoroTimerHybridFeature') && PomodoroTimerHybridFeature?.updateSidebarDisplay) PomodoroTimerHybridFeature.updateSidebarDisplay();
        });
    }

    // Sidebar icon tooltips
    const taskSidebarElForTooltips = document.getElementById('taskSidebar');
    if (taskSidebarElForTooltips) {
        const sidebarIconOnlyButtonsEls = taskSidebarElForTooltips.querySelectorAll('.sidebar-button-icon-only');
        sidebarIconOnlyButtonsEls.forEach(button => { /* ... event listeners using imported showTooltip, hideTooltip, TooltipService ... */ });
    }

    // Modal Openers
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

    if (isFeatureEnabled('projectFeature')) {
        const settingsManageProjectsBtnEl = document.getElementById('settingsManageProjectsBtn');
        if (settingsManageProjectsBtnEl && ProjectsFeature?.openManageProjectsModal) {
            settingsManageProjectsBtnEl.addEventListener('click', ProjectsFeature.openManageProjectsModal);
        }
    }

    // Modal Closers (using imported functions from modal_interactions.js)
    // Add Task Modal
    const closeAddModalBtnEl = document.getElementById('closeAddModalBtn');
    if (closeAddModalBtnEl) closeAddModalBtnEl.addEventListener('click', closeAddModal);
    const cancelAddModalBtnEl = document.getElementById('cancelAddModalBtn');
    if (cancelAddModalBtnEl) cancelAddModalBtnEl.addEventListener('click', closeAddModal);
    const addTaskModalEl = document.getElementById('addTaskModal');
    if (addTaskModalEl) addTaskModalEl.addEventListener('click', (event) => { if (event.target === addTaskModalEl) closeAddModal(); });

    // View/Edit Task Modal
    const closeViewEditModalBtnEl = document.getElementById('closeViewEditModalBtn');
    if(closeViewEditModalBtnEl) closeViewEditModalBtnEl.addEventListener('click', closeViewEditModal);
    const cancelViewEditModalBtnEl = document.getElementById('cancelViewEditModalBtn');
    if(cancelViewEditModalBtnEl) cancelViewEditModalBtnEl.addEventListener('click', closeViewEditModal);
    const viewEditTaskModalEl = document.getElementById('viewEditTaskModal');
    if(viewEditTaskModalEl) viewEditTaskModalEl.addEventListener('click', (e) => { if(e.target === viewEditTaskModalEl) closeViewEditModal(); });
    
    // View Details Modal
    const closeViewDetailsModalBtnEl = document.getElementById('closeViewDetailsModalBtn');
    if(closeViewDetailsModalBtnEl) closeViewDetailsModalBtnEl.addEventListener('click', closeViewTaskDetailsModal);
    const closeViewDetailsSecondaryBtnEl = document.getElementById('closeViewDetailsSecondaryBtn');
    if(closeViewDetailsSecondaryBtnEl) closeViewDetailsSecondaryBtnEl.addEventListener('click', closeViewTaskDetailsModal);
    const viewTaskDetailsModalEl = document.getElementById('viewTaskDetailsModal');
    if(viewTaskDetailsModalEl) viewTaskDetailsModalEl.addEventListener('click', (e) => { if(e.target === viewTaskDetailsModalEl) closeViewTaskDetailsModal(); });

    // Settings Modal
    const closeSettingsModalBtnEl = document.getElementById('closeSettingsModalBtn');
    if(closeSettingsModalBtnEl) closeSettingsModalBtnEl.addEventListener('click', closeSettingsModal);
    const closeSettingsSecondaryBtnEl = document.getElementById('closeSettingsSecondaryBtn');
    if(closeSettingsSecondaryBtnEl) closeSettingsSecondaryBtnEl.addEventListener('click', closeSettingsModal);
    const settingsModalEl = document.getElementById('settingsModal');
    if(settingsModalEl) settingsModalEl.addEventListener('click', (e) => { if(e.target === settingsModalEl) closeSettingsModal(); });

    // Manage Labels Modal
    const closeManageLabelsModalBtnEl = document.getElementById('closeManageLabelsModalBtn');
    if(closeManageLabelsModalBtnEl) closeManageLabelsModalBtnEl.addEventListener('click', closeManageLabelsModal);
    const closeManageLabelsSecondaryBtnEl = document.getElementById('closeManageLabelsSecondaryBtn');
    if(closeManageLabelsSecondaryBtnEl) closeManageLabelsSecondaryBtnEl.addEventListener('click', closeManageLabelsModal);
    const manageLabelsModalEl = document.getElementById('manageLabelsModal');
    if(manageLabelsModalEl) manageLabelsModalEl.addEventListener('click', (e) => { if(e.target === manageLabelsModalEl) closeManageLabelsModal(); });
    
    // ... (add closers for taskReviewModal, tooltipsGuideModal, featureFlagsModal, manageProjectsModal similarly)


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
        const smartViewButtonsEls = smartViewButtonsContainerEl.querySelectorAll('.smart-view-btn');
        smartViewButtonsEls.forEach(button => {
            button.addEventListener('click', () => setFilter(button.dataset.filter)); // Calls local setFilter
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
            item.el.addEventListener('click', async () => { // Make async for dynamic import
                ViewManager.setCurrentSort(item.type);
                const uiRenderingModule = await import('./ui_rendering.js');
                if (uiRenderingModule.updateSortButtonStates) {
                    uiRenderingModule.updateSortButtonStates();
                }
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
    if (taskSearchInputEl) taskSearchInputEl.addEventListener('input', (e) => ViewManager.setCurrentSearchTerm(e.target.value));

    // Settings Actions
    const settingsClearCompletedBtnEl = document.getElementById('settingsClearCompletedBtn');
    if (settingsClearCompletedBtnEl) settingsClearCompletedBtnEl.addEventListener('click', clearCompletedTasks);

    // Keydown listener for Escape and Add Task Shortcut
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            // Check each modal and call its specific close function (imported from modal_interactions)
            if (!document.getElementById('addTaskModal').classList.contains('hidden')) closeAddModal();
            else if (!document.getElementById('viewEditTaskModal').classList.contains('hidden')) closeViewEditModal();
            else if (!document.getElementById('viewTaskDetailsModal').classList.contains('hidden')) closeViewTaskDetailsModal();
            else if (!document.getElementById('settingsModal').classList.contains('hidden')) closeSettingsModal();
            else if (!document.getElementById('manageLabelsModal').classList.contains('hidden')) closeManageLabelsModal();
            else if (!document.getElementById('taskReviewModal').classList.contains('hidden')) closeTaskReviewModal();
            else if (!document.getElementById('tooltipsGuideModal').classList.contains('hidden')) closeTooltipsGuideModal();
            // ... (add checks for featureFlagsModal, manageProjectsModal)
            const featureFlagsModalEl = document.getElementById('featureFlagsModal');
            if (featureFlagsModalEl && !featureFlagsModalEl.classList.contains('hidden') && typeof window.closeFeatureFlagsModal === 'function') window.closeFeatureFlagsModal(); // Still might be global

            const manageProjectsModalEl = document.getElementById('manageProjectsModal');
            if (manageProjectsModalEl && !manageProjectsModalEl.classList.contains('hidden') && ProjectsFeature?.closeManageProjectsModal) ProjectsFeature.closeManageProjectsModal();


        } else if ((event.key === '+' || event.key === '=') &&
            !event.altKey && !event.ctrlKey && !event.metaKey &&
            !['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName.toUpperCase()) &&
            document.querySelectorAll('.fixed.inset-0:not(.hidden)').length === 0) {
            event.preventDefault();
            openAddModal();
        }
    });

    // Sub-task add buttons
    const modalAddSubTaskBtnAddEl = document.getElementById('modalAddSubTaskBtnAdd');
    if (modalAddSubTaskBtnAddEl) modalAddSubTaskBtnAddEl.addEventListener('click', handleAddTempSubTaskForAddModal);
    const modalAddSubTaskBtnViewEditEl = document.getElementById('modalAddSubTaskBtnViewEdit');
    if (modalAddSubTaskBtnViewEditEl) modalAddSubTaskBtnViewEditEl.addEventListener('click', handleAddSubTaskViewEdit);

    console.log("[Event Handlers] All event listeners set up.");
}

// EventBus subscription remains the same
if (EventBus && typeof applyActiveFeatures === 'function') {
    EventBus.subscribe('featureFlagsUpdated', (data) => {
        console.log("[Event Handlers] Event received: featureFlagsUpdated. Re-applying active features.", data);
        applyActiveFeatures();
        const featureFlagsModalElement = document.getElementById('featureFlagsModal');
        if (featureFlagsModalElement && !featureFlagsModalElement.classList.contains('hidden')) {
            populateFeatureFlagsModal();
        }
    });
} else { /* ... */ }

console.log("ui_event_handlers.js loaded as ES6 module.");