// tasks_ui_event_handlers.js
// REFACTORED FOR SELF-HOSTED BACKEND & DECOUPLING

import AppStore from './store.js';
import ViewManager from './viewManager.js';
import * as TaskService from './taskService.js';
import * as LabelService from './labelService.js';
import ModalStateService from './modalStateService.js';
import EventBus from './eventBus.js';
// import * as BulkActionService from './bulkActionService.js'; // REMOVED
import LoggingService from './loggingService.js';

// Import UI rendering functions from the new tasks-specific module
import {
    setSidebarMinimized,
} from './tasks_ui_rendering.js';

// Import modal interaction functions
import {
    populateManageLabelsList,
    openAddModal,
    closeViewTaskDetailsModal,
    closeViewEditModal,
    closeSettingsModal
} from './tasks_modal_interactions.js';

// Import form event handlers
import {
    handleAddTaskFormSubmit,
    handleEditTaskFormSubmit,
    handleAddNewLabelFormSubmit
} from './tasks_form_handlers.js';

// Import the new modal event handlers setup function
import { setupModalEventListeners } from './tasks_modal_events.js';

// Import Feature Modules (some might be used by handlers still in this file)
import { ProjectsFeature } from './feature_projects.js';

export let tempSubTasksForAddModal = [];

export function clearTempSubTasksForAddModal() {
    const functionName = 'clearTempSubTasksForAddModal (tasks_ui_event_handlers)';
    LoggingService.debug('[UIEventHandlers] Temporary sub-tasks for add modal cleared.', { functionName, count: tempSubTasksForAddModal.length });
    tempSubTasksForAddModal = [];
}

export function applyActiveFeatures() {
    const functionName = 'applyActiveFeatures';
    LoggingService.info('[UIEventHandlers] Applying active features based on current flags.', { functionName });

    if (typeof window.isFeatureEnabled !== 'function') {
        LoggingService.error('[UIEventHandlers] isFeatureEnabled function not available globally.', null, {functionName});
        return;
    }
    
    if (window.AppFeatures) {
        for (const featureKey in window.AppFeatures) {
            if (window.AppFeatures[featureKey] && typeof window.AppFeatures[featureKey].updateUIVisibility === 'function') {
                window.AppFeatures[featureKey].updateUIVisibility();
            }
        }
    }

    // REMOVED Bulk Actions check
    
    const userProfile = AppStore.getUserProfile();
    const isAdmin = userProfile && userProfile.role === 'admin';
    document.querySelectorAll('.admin-only-feature-element').forEach(el => {
        el.classList.toggle('hidden', !isAdmin);
    });

    EventBus.publish('requestViewRefresh');
    LoggingService.info('[UIEventHandlers] Finished applying active features.', { functionName });
}


// Task action handlers (toggleComplete, deleteTask)
function toggleComplete(taskId) {
    const functionName = 'toggleComplete (Internal Handler in tasks_ui_event_handlers)';
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
    const functionName = 'deleteTask (Internal Handler in tasks_ui_event_handlers)';
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

export function setupEventListeners() {
    const functionName = 'setupEventListeners';
    LoggingService.info('[UIEventHandlers] Setting up event listeners.', { functionName });

    const mainAppContainer = document.getElementById('taskSidebar');
    if (!mainAppContainer) {
        LoggingService.debug('[UIEventHandlers] Not on the main task page. Skipping main event listener setup.', { functionName });
        return;
    }

    setupModalEventListeners();

    if (EventBus) {
        EventBus.subscribe('uiRequestToggleComplete', (data) => { if (data && data.taskId) toggleComplete(data.taskId); });
        EventBus.subscribe('uiRequestDeleteTask', (data) => { if (data && data.taskId) deleteTask(data.taskId); });
        LoggingService.debug('[UIEventHandlers] Subscribed to task action requests.', { functionName });
    }

    const attachListener = (elementId, eventType, handler, handlerName) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(eventType, handler);
        } else {
            LoggingService.warn(`[UIEventHandlers] Element #${elementId} not found for listener for ${handlerName}.`, { functionName: 'attachListener', elementId, eventType });
        }
    };

    // Sidebar Toggle
    const sidebarToggleBtnEl = document.getElementById('sidebarToggleBtn');
    if (sidebarToggleBtnEl) {
        sidebarToggleBtnEl.addEventListener('click', () => {
            const taskSidebarEl = document.getElementById('taskSidebar');
            if (!taskSidebarEl) return;
            const isCurrentlyMinimized = taskSidebarEl.classList.contains('sidebar-minimized');
            const newMinimizedState = !isCurrentlyMinimized;
            localStorage.setItem('sidebarState', newMinimizedState ? 'minimized' : 'expanded');
            setSidebarMinimized(newMinimizedState);
            if (window.isFeatureEnabled('projectFeature') && ProjectsFeature?.populateProjectFilterList) {
                ProjectsFeature.populateProjectFilterList();
            }
        });
    }

    // Modal Buttons
    const editFromViewModalBtnEl = document.getElementById('editFromViewModalBtn');
    if (editFromViewModalBtnEl) {
        editFromViewModalBtnEl.addEventListener('click', async () => {
            const taskId = ModalStateService.getCurrentViewTaskId();
            if (taskId) {
                closeViewTaskDetailsModal();
                const { openViewEditModal } = await import('./tasks_modal_interactions.js');
                openViewEditModal(taskId);
            }
        });
    }
    const deleteFromViewModalBtnEl = document.getElementById('deleteFromViewModalBtn');
    if(deleteFromViewModalBtnEl) {
        deleteFromViewModalBtnEl.addEventListener('click', () => {
            const taskId = ModalStateService.getCurrentViewTaskId();
            if(taskId) deleteTask(taskId);
        });
    }

    // Form Submissions
    attachListener('modalTodoFormAdd', 'submit', handleAddTaskFormSubmit, 'handleAddTaskFormSubmit');
    attachListener('modalTodoFormViewEdit', 'submit', handleEditTaskFormSubmit, 'handleEditTaskFormSubmit');
    attachListener('addNewLabelForm', 'submit', handleAddNewLabelFormSubmit, 'handleAddNewLabelFormSubmit');
    
    // Filter Buttons (Smart Views)
    const smartViewButtonsContainerEl = document.getElementById('smartViewButtonsContainer');
    if (smartViewButtonsContainerEl) {
        smartViewButtonsContainerEl.addEventListener('click', (event) => {
            const button = event.target.closest('.smart-view-btn');
            if (button && button.dataset.filter) {
                setFilter(button.dataset.filter);
            }
        });
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
                ViewManager.setCurrentSort(item.type);
            });
        }
    });
    
    // Search Input
    const taskSearchInputEl = document.getElementById('taskSearchInput');
    if (taskSearchInputEl) {
        taskSearchInputEl.addEventListener('input', (e) => {
            ViewManager.setCurrentSearchTerm(e.target.value)
        });
    }

    // Settings Actions
    attachListener('settingsClearCompletedBtn', 'click', clearCompletedTasks, 'clearCompletedTasks');

    // Global keydown for "+" add task shortcut
    document.addEventListener('keydown', (event) => {
        if ((event.key === '+' || event.key === '=') &&
            !event.altKey && !event.ctrlKey && !event.metaKey &&
            !['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName.toUpperCase()) &&
            document.querySelectorAll('.fixed.inset-0:not(.hidden)').length === 0) {
            event.preventDefault();
            openAddModal();
        }
    });

    // REMOVED Bulk Action Listeners

    LoggingService.info("[UIEventHandlers] All non-modal, non-form event listeners setup process completed.", { functionName });
}

// EventBus subscription for feature flag updates
if (EventBus && typeof applyActiveFeatures === 'function') {
    EventBus.subscribe('featureFlagsUpdated', (data) => {
        LoggingService.info("[UIEventHandlers] Event received: featureFlagsUpdated. Re-applying active features.", { functionName: 'featureFlagsUpdatedHandler (subscription)', eventData: data });
        applyActiveFeatures();
    });
}