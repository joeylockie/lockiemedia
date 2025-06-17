// ui_event_handlers.js
// Handles non-form, non-modal UI event listeners,
// applying feature flags to UI, and general UI interaction logic.

import AppStore from './store.js';
import ViewManager from './viewManager.js';
import { isFeatureEnabled, setFeatureFlag, getAllFeatureFlags } from './featureFlagService.js';
import * as TaskService from './taskService.js';
import * as LabelService from './labelService.js';
import ModalStateService from './modalStateService.js';
import TooltipService from './tooltipService.js';
import EventBus from './eventBus.js';
import * as BulkActionService from './bulkActionService.js';

import LoggingService from './loggingService.js';

// Import UI rendering functions needed by handlers still in this file
import {
    showTooltip,
    hideTooltip,
    setSidebarMinimized,
} from './ui_rendering.js';

// Import modal interaction functions (still needed for some direct calls like populateManageLabelsList)
import {
    populateManageLabelsList,
    // Modal open/close functions are now primarily called by modalEventHandlers
    // but some might be needed by other handlers if they directly manipulate modals.
    // For now, keeping them if any remaining handler needs them.
    openAddModal, // For '+' key shortcut
    closeViewTaskDetailsModal, // for deleteTask
    closeViewEditModal, // for deleteTask
    closeSettingsModal // for clearCompletedTasks
} from './modal_interactions.js';

// Import form event handlers (still needed for attaching to forms)
import {
    handleAddTaskFormSubmit,
    handleEditTaskFormSubmit,
    handleProfileFormSubmit,
    handleAddNewLabelFormSubmit,
    handleUserSignUpFormSubmit,
    handleUserSignInFormSubmit
} from './formEventHandlers.js';

// Import the new modal event handlers setup function
import { setupModalEventListeners } from './modalEventHandlers.js';


// Import Feature Modules (some might be used by handlers still in this file)
import { ProjectsFeature } from './feature_projects.js';
import { PomodoroTimerHybridFeature } from './pomodoro_timer.js';
import { SubTasksFeature } from './feature_sub_tasks.js';
import { UserAccountsFeature } from './feature_user_accounts.js'; // For '+' key shortcut check

// This state is temporarily exported for formEventHandlers.js
// It should ideally move to a subTaskEventHandlers.js or ModalStateService
export let tempSubTasksForAddModal = [];

export function clearTempSubTasksForAddModal() {
    const functionName = 'clearTempSubTasksForAddModal (ui_event_handlers)';
    LoggingService.debug('[UIEventHandlers] Temporary sub-tasks for add modal cleared.', { functionName, count: tempSubTasksForAddModal.length });
    tempSubTasksForAddModal = [];
}

// populateFeatureFlagsModal is now part of modalEventHandlers.js (within openFeatureFlagsModal)

export function applyActiveFeatures() {
    const functionName = 'applyActiveFeatures';
    LoggingService.info('[UIEventHandlers] Applying active features based on current flags.', { functionName });

    if (window.AppFeatures) {
        for (const featureKey in window.AppFeatures) {
            if (window.AppFeatures[featureKey] && typeof window.AppFeatures[featureKey].updateUIVisibility === 'function') {
                // UserAccountsFeature visibility is handled internally.
                // Modal-related features' UI (like buttons to open them) are also handled by their own updateUIVisibility
                // or by the generic class toggling.
                if (featureKey !== 'UserAccountsFeature') {
                    window.AppFeatures[featureKey].updateUIVisibility();
                }
            }
        }
        // Ensure UserAccountsFeature UI (like sign-out button) is also updated
        if (window.AppFeatures.UserAccountsFeature && typeof window.AppFeatures.UserAccountsFeature.updateUIVisibility === 'function') {
            window.AppFeatures.UserAccountsFeature.updateUIVisibility();
        }
    }

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

    // NEW: Logic for admin-only elements
    if (AppStore && typeof AppStore.getUserProfile === 'function') {
        const userProfile = AppStore.getUserProfile();
        const isAdmin = userProfile && userProfile.role === 'admin';
        document.querySelectorAll('.admin-only-feature-element').forEach(el => {
            el.classList.toggle('hidden', !isAdmin);
        });
        LoggingService.debug(`[UIEventHandlers] Admin-only elements visibility set. IsAdmin: ${isAdmin}`, { functionName, isAdmin });
    }
    // END NEW

    EventBus.publish('requestViewRefresh'); // Triggers UI refresh which includes task list, headings etc.

    // If feature flags modal is open, re-populate it (handled by modalEventHandlers.js if it's open)
    // const featureFlagsModalElement = document.getElementById('featureFlagsModal');
    // if (featureFlagsModalElement && !featureFlagsModalElement.classList.contains('hidden')) {
    //     populateFeatureFlagsModal(); // This function is now within modalEventHandlers
    // }
    LoggingService.info('[UIEventHandlers] Finished applying active features.', { functionName });
}


// Task action handlers (toggleComplete, deleteTask)
function toggleComplete(taskId) {
    const functionName = 'toggleComplete (Internal Handler in ui_event_handlers)';
    LoggingService.debug(`[UIEventHandlers] Handling request to toggle completion for task ID: ${taskId}.`, { functionName, taskId });
    const updatedTask = TaskService.toggleTaskComplete(taskId);
    if (updatedTask && updatedTask._blocked) {
        LoggingService.info(`[UIEventHandlers] Task ${taskId} completion blocked by prerequisites.`, { functionName, taskId });
        EventBus.publish('displayUserMessage', { text: 'Cannot complete task: It has incomplete prerequisite tasks.', type: 'warn' });
    } else if (updatedTask) {
        LoggingService.info(`[UIEventHandlers] Task ${taskId} completion status toggled to ${updatedTask.completed} via service.`, { functionName, taskId, newStatus: updatedTask.completed });
        const viewTaskStatusEl = document.getElementById('viewTaskStatus');
        if (ModalStateService.getCurrentViewTaskId() === taskId && viewTaskStatusEl) {
            viewTaskStatusEl.textContent = updatedTask.completed ? 'Completed' : 'Active';
        }
    } else {
        LoggingService.error(`[UIEventHandlers] Error toggling task completion for task ID: ${taskId} via service.`, new Error("ToggleCompleteFailed"), { functionName, taskId });
        EventBus.publish('displayUserMessage', { text: 'Error toggling task completion.', type: 'error' });
    }
}

function deleteTask(taskId) {
    const functionName = 'deleteTask (Internal Handler in ui_event_handlers)';
    LoggingService.info(`[UIEventHandlers] Handling request to delete task ID: ${taskId}.`, { functionName, taskId });
    if (confirm('Are you sure you want to delete this task?')) {
        if (TaskService.deleteTaskById(taskId)) {
            LoggingService.info(`[UIEventHandlers] Task ID ${taskId} deleted successfully via service.`, { functionName, taskId });
            EventBus.publish('displayUserMessage', { text: 'Task deleted successfully!', type: 'success' });
            const currentViewingId = ModalStateService.getCurrentViewTaskId();
            const currentEditingId = ModalStateService.getEditingTaskId();

            if (currentViewingId === taskId) closeViewTaskDetailsModal();
            if (currentEditingId === taskId) closeViewEditModal();
        } else {
            LoggingService.error(`[UIEventHandlers] Error deleting task ID: ${taskId} via service.`, new Error("DeleteTaskFailed"), { functionName, taskId });
            EventBus.publish('displayUserMessage', { text: 'Error deleting task.', type: 'error' });
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
        if (deletedCount > 0) {
            EventBus.publish('displayUserMessage', { text: `${deletedCount} completed task(s) cleared.`, type: 'success' });
        }
        else {
            EventBus.publish('displayUserMessage', { text: 'No completed tasks to clear.', type: 'info' });
        }
        closeSettingsModal();
    } else {
        LoggingService.debug('[UIEventHandlers] Clear completed tasks cancelled by user.', { functionName });
    }
}

export function handleDeleteLabel(labelNameToDelete) {
    const functionName = 'handleDeleteLabel';
    LoggingService.info(`[UIEventHandlers] User initiated delete for label: "${labelNameToDelete}".`, { functionName, labelNameToDelete });
    if (confirm(`Are you sure you want to delete the label "${labelNameToDelete}" from all tasks? This will remove the label from any task currently using it. This action cannot be undone.`)) {
        if (LabelService.deleteLabelUsageFromTasks(labelNameToDelete)) {
            LoggingService.info(`[UIEventHandlers] Label "${labelNameToDelete}" removed from tasks.`, { functionName, labelNameToDelete });
            EventBus.publish('displayUserMessage', { text: `Label "${labelNameToDelete}" removed from all tasks.`, type: 'success' });
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

// Sub-task handlers (still here for now, to be moved)
async function handleAddSubTaskViewEdit() {
    const functionName = 'handleAddSubTaskViewEdit';
    const modalSubTaskInputViewEditEl = document.getElementById('modalSubTaskInputViewEdit');
    const modalSubTasksListViewEditEl = document.getElementById('modalSubTasksListViewEdit');

    const parentId = ModalStateService.getEditingTaskId();
    const subTaskText = modalSubTaskInputViewEditEl.value.trim();
    LoggingService.info(`[UIEventHandlers] Attempting to add sub-task to parent ID ${parentId}: "${subTaskText.substring(0,20)}..."`, { functionName, parentId, subTaskTextLength: subTaskText.length });

    if (!parentId || !subTaskText) {
        LoggingService.warn('[UIEventHandlers] Parent task ID or sub-task text is missing for adding sub-task in edit modal.', { functionName, parentId, hasSubTaskText: !!subTaskText });
        EventBus.publish('displayUserMessage', { text: 'Parent task ID or sub-task text is missing.', type: 'error' });
        return;
    }

    if (SubTasksFeature?.add(parentId, subTaskText)) {
        LoggingService.info(`[UIEventHandlers] Sub-task added to parent ID ${parentId}.`, { functionName, parentId });
        EventBus.publish('displayUserMessage', { text: 'Sub-task added.', type: 'success' });
        modalSubTaskInputViewEditEl.value = '';
        try {
            const { renderSubTasksForEditModal } = await import('./ui_rendering.js');
            if (renderSubTasksForEditModal) {
                renderSubTasksForEditModal(parentId, modalSubTasksListViewEditEl);
            }
        } catch (e) {
            LoggingService.error("[UIEventHandlers] Failed to load ui_rendering for sub-task update in edit modal.", e, { functionName, parentId });
        }
    } else {
        LoggingService.error(`[UIEventHandlers] Failed to add sub-task to parent ID ${parentId}.`, new Error("AddSubTaskFailed"), { functionName, parentId });
        EventBus.publish('displayUserMessage', { text: 'Failed to add sub-task.', type: 'error' });
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
        EventBus.publish('displayUserMessage', { text: 'Sub-task text cannot be empty.', type: 'error' });
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

    // --- Page-Specific Guard ---
    // Only set up listeners for the main task application on the correct page.
    const mainAppContainer = document.getElementById('taskSidebar'); // A key element of todo.html
    if (!mainAppContainer) {
        LoggingService.debug('[UIEventHandlers] Not on the main task page. Skipping main event listener setup.', { functionName });
        // Global listeners that should apply everywhere can still be set up here if needed.
        return; // Exit the function to prevent errors on other pages like notes.html
    }
    // --- End Page-Specific Guard ---

    // Setup modal related event listeners
    setupModalEventListeners(); // Imported from modalEventHandlers.js

    // EventBus subscriptions for task actions (toggleComplete, deleteTask)
    if (EventBus) {
        EventBus.subscribe('uiRequestToggleComplete', (data) => {
            if (data && data.taskId) {
                toggleComplete(data.taskId);
            }
        });
        EventBus.subscribe('uiRequestDeleteTask', (data) => {
            if (data && data.taskId) {
                deleteTask(data.taskId);
            }
        });
        LoggingService.debug('[UIEventHandlers] Subscribed to uiRequestToggleComplete and uiRequestDeleteTask.', { functionName });
    } else {
        LoggingService.error('[UIEventHandlers] EventBus not available for subscribing to custom UI events.', new Error("EventBusMissing"), { functionName });
    }

    // Helper to attach other listeners
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

    // Edit and Delete from View Details Modal Buttons
    const editFromViewModalBtnEl = document.getElementById('editFromViewModalBtn');
    if (editFromViewModalBtnEl) {
        editFromViewModalBtnEl.addEventListener('click', async () => { // MADE ASYNC
            const handlerName = 'editFromViewModalHandler';
            const taskId = ModalStateService.getCurrentViewTaskId();
            LoggingService.debug(`[UIEventHandlers] Edit from View Modal button clicked for task ID: ${taskId}.`, { functionName: handlerName, taskId });
            if (taskId) {
                closeViewTaskDetailsModal();
                const { openViewEditModal } = await import('./modal_interactions.js'); // Dynamic import
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

    // Form Submissions - Now use imported handlers
    attachListener('modalTodoFormAdd', 'submit', handleAddTaskFormSubmit, 'handleAddTaskFormSubmit');
    attachListener('modalTodoFormViewEdit', 'submit', handleEditTaskFormSubmit, 'handleEditTaskFormSubmit');
    attachListener('addNewLabelForm', 'submit', handleAddNewLabelFormSubmit, 'handleAddNewLabelFormSubmit');
    attachListener('profileForm', 'submit', handleProfileFormSubmit, 'handleProfileFormSubmit');

    // User Accounts Form Submissions & Sign Out
    if (UserAccountsFeature) {
        attachListener('signUpForm', 'submit', handleUserSignUpFormSubmit, 'handleUserSignUpFormSubmit');
        attachListener('signInForm', 'submit', handleUserSignInFormSubmit, 'handleUserSignInFormSubmit');
        attachListener('settingsSignOutBtn', 'click', () => {
            if (UserAccountsFeature.handleSignOut) {
                 UserAccountsFeature.handleSignOut();
            } else {
                LoggingService.error('[UIEventHandlers] UserAccountsFeature.handleSignOut not found.', new Error("MethodMissing"), {functionName:'settingsSignOutHandler'});
            }
        }, 'handleUserSignOutFromSettings');
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
                    const { updateSortButtonStates } = await import('./ui_rendering.js');
                    if (updateSortButtonStates) {
                        updateSortButtonStates();
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

    // Global keydown for "+" add task shortcut (not modal escape, that's in modalEventHandlers.js)
    document.addEventListener('keydown', (event) => {
        const keydownHandlerName = 'documentKeydownHandler (ui_event_handlers for +)';
        if ((event.key === '+' || event.key === '=') &&
            !event.altKey && !event.ctrlKey && !event.metaKey &&
            !['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName.toUpperCase()) &&
            document.querySelectorAll('.fixed.inset-0:not(.hidden)').length === 0) { // Check no modal is open
            LoggingService.debug('[UIEventHandlers] Add task shortcut key pressed.', { functionName: keydownHandlerName, key: event.key });
            event.preventDefault();
            openAddModal(); // from modal_interactions.js
        }
    });
    LoggingService.debug(`[UIEventHandlers] Document keydown listener for '+' attached.`, { functionName });


    // Sub-task add buttons (still here for now)
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

    LoggingService.info("[UIEventHandlers] All non-modal, non-form event listeners setup process completed.", { functionName });
}

// EventBus subscription for feature flag updates
if (EventBus && typeof applyActiveFeatures === 'function') {
    EventBus.subscribe('featureFlagsUpdated', (data) => {
        LoggingService.info("[UIEventHandlers] Event received: featureFlagsUpdated. Re-applying active features.", { functionName: 'featureFlagsUpdatedHandler (subscription)', eventData: data });
        applyActiveFeatures();
        // Populate feature flags modal if open (now handled by modalEventHandlers.js)
        // const featureFlagsModalElement = document.getElementById('featureFlagsModal');
        // if (featureFlagsModalElement && !featureFlagsModalElement.classList.contains('hidden')) {
        //     populateFeatureFlagsModal();
        // }
    });
} else {
    LoggingService.warn("[UIEventHandlers] EventBus or applyActiveFeatures not available for featureFlagsUpdated subscription.", { functionName: 'featureFlagsUpdatedSubscriptionSetup' });
}

LoggingService.debug("ui_event_handlers.js loaded as ES6 module (further modified).", { module: 'ui_event_handlers' });