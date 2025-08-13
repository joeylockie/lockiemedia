// tasks_ui_rendering.js
// Handles all direct DOM manipulation for rendering UI components and task lists for the Task Manager.

import AppStore from './store.js';
import ViewManager from './viewManager.js';
// import { getAppVersionString } from './versionService.js'; // REMOVED
import ModalStateService from './modalStateService.js';
import EventBus from './eventBus.js';
import { formatDate, formatTime, formatDuration, formatMillisecondsToHMS } from './utils.js';
import LoggingService from './loggingService.js';

// Import functions from other UI modules
import {
    populateManageLabelsList
} from './tasks_modal_interactions.js';

// Import the newly created rendering functions
import { renderTaskListView, renderBulkActionControls } from './tasks_list_view.js';

// DOM Elements (declared with let, will be module-scoped)
// These are initialized by initializeDOMElements()
// We need to export the ones needed by renderTaskListView.js
export let taskSidebar, sidebarToggleBtn, sidebarToggleIcon, sidebarTextElements, sidebarIconOnlyButtons;
export let sortByDueDateBtn, sortByPriorityBtn, sortByLabelBtn, taskSearchInput, taskList, emptyState, noMatchingTasks;
export let smartViewButtonsContainer, smartViewButtons, messageBox;
export let addTaskModal, modalDialogAdd, openAddModalButton, closeAddModalBtn, cancelAddModalBtn, modalTodoFormAdd;
export let modalTaskInputAdd, modalDueDateInputAdd, modalTimeInputAdd;
export let modalPriorityInputAdd, modalLabelInputAdd, existingLabelsDatalist, modalNotesInputAdd;
export let modalRemindMeAddContainer, modalRemindMeAdd, reminderOptionsAdd, modalReminderDateAdd, modalReminderTimeAdd, modalReminderEmailAdd;
export let viewEditTaskModal, modalDialogViewEdit, closeViewEditModalBtn, cancelViewEditModalBtn, modalTodoFormViewEdit;
export let modalViewEditTaskId, modalTaskInputViewEdit, modalDueDateInputViewEdit, modalTimeInputViewEdit;
export let modalPriorityInputViewEdit, modalLabelInputViewEdit;
export let existingLabelsEditDatalist, modalNotesInputViewEdit, modalRemindMeViewEditContainer, modalRemindMeViewEdit;
export let reminderOptionsViewEdit, modalReminderDateViewEdit, modalReminderTimeViewEdit, modalReminderEmailViewEdit;
export let viewTaskDetailsModal, modalDialogViewDetails, closeViewDetailsModalBtn, closeViewDetailsSecondaryBtn;
export let editFromViewModalBtn, deleteFromViewModalBtn, viewTaskText, viewTaskDueDate, viewTaskTime;
export let viewTaskPriority, viewTaskStatus, viewTaskLabel, viewTaskNotes, viewTaskReminderSection, viewTaskReminderStatus;
export let viewTaskReminderDetails, viewTaskReminderDate, viewTaskReminderTime, viewTaskReminderEmail;
export let manageLabelsModal, modalDialogManageLabels, closeManageLabelsModalBtn, closeManageLabelsSecondaryBtn;
export let addNewLabelForm, newLabelInput, existingLabelsList;
export let settingsModal, modalDialogSettings, openSettingsModalButton, closeSettingsModalBtn, closeSettingsSecondaryBtn;
export let settingsClearCompletedBtn, settingsManageLabelsBtn, settingsManageRemindersBtn;
export let featureFlagsListContainer;
export let yourTasksHeading, mainContentArea;
// REMOVED project-related element declarations
export let criticalErrorDisplay, criticalErrorMessage, criticalErrorId, closeCriticalErrorBtn;
export let appVersionFooterEl;
export let appVersionAboutUsDisplayEl;


export function initializeDOMElements() {
    LoggingService.debug('[DOM Init] Attempting to initialize DOM elements...', { module: 'tasks_ui_rendering' });
    mainContentArea = document.querySelector('main');
    smartViewButtonsContainer = document.getElementById('smartViewButtonsContainer');
    taskSidebar = document.getElementById('taskSidebar');
    sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    sidebarToggleIcon = document.getElementById('sidebarToggleIcon');
    sidebarTextElements = taskSidebar ? taskSidebar.querySelectorAll('.sidebar-text-content') : [];
    sidebarIconOnlyButtons = taskSidebar ? taskSidebar.querySelectorAll('.sidebar-button-icon-only') : [];
    sortByDueDateBtn = document.getElementById('sortByDueDateBtn');
    sortByPriorityBtn = document.getElementById('sortByPriorityBtn');
    sortByLabelBtn = document.getElementById('sortByLabelBtn');
    taskSearchInput = document.getElementById('taskSearchInput');
    taskList = document.getElementById('taskList');
    emptyState = document.getElementById('emptyState');
    noMatchingTasks = document.getElementById('noMatchingTasks');
    messageBox = document.getElementById('messageBox');
    addTaskModal = document.getElementById('addTaskModal');
    modalDialogAdd = document.getElementById('modalDialogAdd');
    openAddModalButton = document.getElementById('openAddModalButton');
    closeAddModalBtn = document.getElementById('closeAddModalBtn');
    cancelAddModalBtn = document.getElementById('cancelAddModalBtn');
    modalTodoFormAdd = document.getElementById('modalTodoFormAdd');
    modalTaskInputAdd = document.getElementById('modalTaskInputAdd');
    modalDueDateInputAdd = document.getElementById('modalDueDateInputAdd');
    modalTimeInputAdd = document.getElementById('modalTimeInputAdd');
    modalPriorityInputAdd = document.getElementById('modalPriorityInputAdd');
    modalLabelInputAdd = document.getElementById('modalLabelInputAdd');
    existingLabelsDatalist = document.getElementById('existingLabels');
    modalNotesInputAdd = document.getElementById('modalNotesInputAdd');
    modalRemindMeAddContainer = document.getElementById('modalRemindMeAddContainer');
    modalRemindMeAdd = document.getElementById('modalRemindMeAdd');
    reminderOptionsAdd = document.getElementById('reminderOptionsAdd');
    modalReminderDateAdd = document.getElementById('modalReminderDateAdd');
    modalReminderTimeAdd = document.getElementById('modalReminderTimeAdd');
    modalReminderEmailAdd = document.getElementById('modalReminderEmailAdd');
    viewEditTaskModal = document.getElementById('viewEditTaskModal');
    modalDialogViewEdit = document.getElementById('modalDialogViewEdit');
    closeViewEditModalBtn = document.getElementById('closeViewEditModalBtn');
    cancelViewEditModalBtn = document.getElementById('cancelViewEditModalBtn');
    modalTodoFormViewEdit = document.getElementById('modalTodoFormViewEdit');
    modalViewEditTaskId = document.getElementById('modalViewEditTaskId');
    modalTaskInputViewEdit = document.getElementById('modalTaskInputViewEdit');
    modalDueDateInputViewEdit = document.getElementById('modalDueDateInputViewEdit');
    modalTimeInputViewEdit = document.getElementById('modalTimeInputViewEdit');
    modalPriorityInputViewEdit = document.getElementById('modalPriorityInputViewEdit');
    modalLabelInputViewEdit = document.getElementById('modalLabelInputViewEdit');
    existingLabelsEditDatalist = document.getElementById('existingLabelsEdit');
    modalNotesInputViewEdit = document.getElementById('modalNotesInputViewEdit');
    modalRemindMeViewEditContainer = document.getElementById('modalRemindMeViewEditContainer');
    modalRemindMeViewEdit = document.getElementById('modalRemindMeViewEdit');
    reminderOptionsViewEdit = document.getElementById('reminderOptionsViewEdit');
    modalReminderDateViewEdit = document.getElementById('modalReminderDateViewEdit');
    modalReminderTimeViewEdit = document.getElementById('modalReminderTimeViewEdit');
    modalReminderEmailViewEdit = document.getElementById('modalReminderEmailViewEdit');
    viewTaskDetailsModal = document.getElementById('viewTaskDetailsModal');
    modalDialogViewDetails = document.getElementById('modalDialogViewDetails');
    closeViewDetailsModalBtn = document.getElementById('closeViewDetailsModalBtn');
    closeViewDetailsSecondaryBtn = document.getElementById('closeViewDetailsSecondaryBtn');
    editFromViewModalBtn = document.getElementById('editFromViewModalBtn');
    deleteFromViewModalBtn = document.getElementById('deleteFromViewModalBtn');
    viewTaskText = document.getElementById('viewTaskText');
    viewTaskDueDate = document.getElementById('viewTaskDueDate');
    viewTaskTime = document.getElementById('viewTaskTime');
    viewTaskPriority = document.getElementById('viewTaskPriority');
    viewTaskStatus = document.getElementById('viewTaskStatus');
    viewTaskLabel = document.getElementById('viewTaskLabel');
    viewTaskNotes = document.getElementById('viewTaskNotes');
    viewTaskReminderSection = document.getElementById('viewTaskReminderSection');
    viewTaskReminderStatus = document.getElementById('viewTaskReminderStatus');
    viewTaskReminderDetails = document.getElementById('viewTaskReminderDetails');
    viewTaskReminderDate = document.getElementById('viewTaskReminderDate');
    viewTaskReminderTime = document.getElementById('viewTaskReminderTime');
    viewTaskReminderEmail = document.getElementById('viewTaskReminderEmail');
    manageLabelsModal = document.getElementById('manageLabelsModal');
    modalDialogManageLabels = document.getElementById('modalDialogManageLabels');
    closeManageLabelsModalBtn = document.getElementById('closeManageLabelsModalBtn');
    closeManageLabelsSecondaryBtn = document.getElementById('closeManageLabelsSecondaryBtn');
    addNewLabelForm = document.getElementById('addNewLabelForm');
    newLabelInput = document.getElementById('newLabelInput');
    existingLabelsList = document.getElementById('existingLabelsList');
    settingsModal = document.getElementById('settingsModal');
    modalDialogSettings = document.getElementById('modalDialogSettings');
    openSettingsModalButton = document.getElementById('openSettingsModalButton');
    closeSettingsModalBtn = document.getElementById('closeSettingsModalBtn');
    closeSettingsSecondaryBtn = document.getElementById('closeSettingsSecondaryBtn');
    settingsClearCompletedBtn = document.getElementById('settingsClearCompletedBtn');
    settingsManageLabelsBtn = document.getElementById('settingsManageLabelsBtn');
    settingsManageRemindersBtn = document.getElementById('settingsManageRemindersBtn');
    featureFlagsListContainer = document.getElementById('featureFlagsListContainer');
    yourTasksHeading = document.getElementById('yourTasksHeading');
    criticalErrorDisplay = document.getElementById('criticalErrorDisplay');
    criticalErrorMessage = document.getElementById('criticalErrorMessage');
    criticalErrorId = document.getElementById('criticalErrorId');
    closeCriticalErrorBtn = document.getElementById('closeCriticalErrorBtn');
    appVersionFooterEl = document.getElementById('appVersionFooter');
    appVersionAboutUsDisplayEl = document.getElementById('appVersionAboutUsDisplay');

    if (closeCriticalErrorBtn) {
        closeCriticalErrorBtn.addEventListener('click', hideCriticalError);
    }
    LoggingService.debug('[DOM Init] Finished initializing DOM elements.', { module: 'tasks_ui_rendering' });
}

// --- UI Helper Functions ---

export function renderAppVersion() {
    const versionString = '';
    if (appVersionFooterEl) {
        appVersionFooterEl.textContent = versionString;
    }
    if (appVersionAboutUsDisplayEl) {
        appVersionAboutUsDisplayEl.textContent = versionString;
    }
}

export function showCriticalError(message, errorId) {
    if (criticalErrorDisplay && criticalErrorMessage && criticalErrorId) {
        criticalErrorMessage.textContent = message || 'An critical, unexpected error occurred. Please try refreshing the page or contact support if the issue persists.';
        criticalErrorId.textContent = errorId ? `Error ID: ${errorId}` : '';
        criticalErrorDisplay.classList.remove('hidden', 'translate-y-full');
        criticalErrorDisplay.classList.add('translate-y-0');
        LoggingService.error(`[UI Critical Error] Displayed: ${message}, ID: ${errorId}`, null, {module: 'tasks_ui_rendering'});
    } else {
        LoggingService.error(`[UI Critical Error] Fallback: ${message}, ID: ${errorId}`, null, {module: 'tasks_ui_rendering'});
        alert(`CRITICAL ERROR: ${message}\nID: ${errorId}\n(UI element for error display not found)`);
    }
}

export function hideCriticalError() {
    if (criticalErrorDisplay) {
        criticalErrorDisplay.classList.add('translate-y-full');
        criticalErrorDisplay.classList.remove('translate-y-0');
        setTimeout(() => {
            criticalErrorDisplay.classList.add('hidden');
        }, 300);
    }
}

function _displayMessage(messageText, type = 'success') {
    if (!messageBox) return;
    messageBox.textContent = messageText;
    messageBox.className = `message-box ${type === 'error' ? 'bg-red-500' : type === 'warn' ? 'bg-yellow-500' : 'bg-green-500'} text-white p-3 rounded-md shadow-lg fixed top-5 left-1/2 transform -translate-x-1/2 z-[200] transition-opacity duration-300`;
    messageBox.style.display = 'block';
    messageBox.style.opacity = '1';
    setTimeout(() => {
        messageBox.style.opacity = '0';
        setTimeout(() => { messageBox.style.display = 'none'; }, 300);
    }, 3000);
}

export function populateDatalist(datalistElement) {
    if (!datalistElement || !AppStore || typeof AppStore.getUniqueLabels !== 'function') return;
    const currentUniqueLabels = AppStore.getUniqueLabels();
    datalistElement.innerHTML = '';
    currentUniqueLabels.forEach(label => { const option = document.createElement('option'); option.value = label; datalistElement.appendChild(option); });
}

export function setSidebarMinimized(minimize) {
    if (!taskSidebar) {
        LoggingService.error("[UI Rendering] setSidebarMinimized: taskSidebar element not initialized. Aborting.", null, {module: 'tasks_ui_rendering'});
        return;
    }
    taskSidebar.classList.toggle('sidebar-minimized', minimize);
    LoggingService.debug(`[UI Rendering] taskSidebar classList after toggle: ${taskSidebar.classList}`, {module: 'tasks_ui_rendering'});


    if (sidebarToggleIcon) {
        sidebarToggleIcon.className = `fas ${minimize ? 'fa-chevron-right' : 'fa-chevron-left'} text-white`;
    } else {
        LoggingService.warn("[UI Rendering] setSidebarMinimized: sidebarToggleIcon element not initialized.", {module: 'tasks_ui_rendering'});
    }

    const taskSearchInputContainerEl = document.getElementById('taskSearchInputContainer');
    if (taskSearchInputContainerEl) {
        taskSearchInputContainerEl.classList.toggle('hidden', minimize);
    }
    
    const allTextElements = taskSidebar.querySelectorAll('.sidebar-text-content');
    allTextElements.forEach(el => {
        el.classList.toggle('hidden', minimize);
    });

    const iconOnlyButtons = taskSidebar.querySelectorAll('.sidebar-button-icon-only');
    iconOnlyButtons.forEach(btn => {
        btn.classList.toggle('justify-center', minimize);
        const icon = btn.querySelector('i');
        if (icon) {
            if (minimize) {
                icon.classList.remove('md:mr-2', 'md:mr-2.5', 'ml-2');
            } else {
                icon.classList.remove('mr-0');
                icon.classList.add('md:mr-2.5');
            }
        }
    });

    LoggingService.debug(`[UI Rendering] Sidebar minimized state set to: ${minimize}. CSS should now apply relevant styles.`, {module: 'tasks_ui_rendering'});
}

// --- Task Rendering ---
export function refreshTaskView() {
    if (!document.getElementById('taskList')) {
        LoggingService.debug('[UI Rendering] Not on the main task page. Skipping refreshTaskView.', {module: 'tasks_ui_rendering'});
        return;
    }

    if (!mainContentArea || !ViewManager || typeof window.isFeatureEnabled !== 'function') { LoggingService.error("[RefreshTaskView] Core dependencies not found.", null, {module: 'tasks_ui_rendering'}); return; } 
    updateViewToggleButtonsState();
    updateYourTasksHeading();
    styleSmartViewButtons();
    updateSortButtonStates();

    ViewManager.setTaskViewMode('list');
    renderTaskListView();
    
    updateClearCompletedButtonState();
    renderBulkActionControls();
    LoggingService.debug(`[UI Rendering] Task view refreshed for mode: list`, {module: 'tasks_ui_rendering'});
}

export function styleSmartViewButtons() {
    if (!ViewManager) return;
    const currentFilter = ViewManager.getCurrentFilter();
    const allSmartButtons = document.querySelectorAll('.smart-view-btn');

    allSmartButtons.forEach(btn => {
        const isActive = btn.dataset.filter === currentFilter;
        btn.classList.toggle('bg-sky-500', isActive);
        btn.classList.toggle('text-white', isActive);
        btn.classList.toggle('dark:bg-sky-600', isActive);
        btn.classList.toggle('font-semibold', isActive);

        btn.classList.toggle('bg-slate-200', !isActive);
        btn.classList.toggle('text-slate-700', !isActive);
        btn.classList.toggle('hover:bg-slate-300', !isActive);
        btn.classList.toggle('dark:bg-slate-700', !isActive);
        btn.classList.toggle('dark:text-slate-300', !isActive);
        btn.classList.toggle('dark:hover:bg-slate-600', !isActive);
        btn.classList.toggle('font-medium', !isActive && !btn.classList.contains('font-semibold'));

        const icon = btn.querySelector('i');
        if (icon) {
            icon.classList.toggle('text-white', isActive);
            icon.classList.toggle('dark:text-sky-300', isActive);

            icon.classList.toggle('text-slate-500', !isActive);
            icon.classList.toggle('dark:text-slate-400', !isActive);
        }
    });
}


export function updateSortButtonStates() {
    if (!ViewManager || !sortByDueDateBtn || !sortByPriorityBtn || !sortByLabelBtn) return;
    const currentSort = ViewManager.getCurrentSort();
    const buttons = [
        { el: sortByDueDateBtn, type: 'dueDate' },
        { el: sortByPriorityBtn, type: 'priority' },
        { el: sortByLabelBtn, type: 'label' }
    ];
    buttons.forEach(item => {
        const isActive = item.type === currentSort;
        item.el.classList.toggle('sort-btn-active', isActive);
        item.el.classList.toggle('bg-slate-200', !isActive);
        item.el.classList.toggle('hover:bg-slate-300', !isActive);
        item.el.classList.toggle('dark:bg-slate-700', !isActive);
        item.el.classList.toggle('dark:hover:bg-slate-600', !isActive);
        item.el.classList.toggle('text-slate-700', !isActive);
        item.el.classList.toggle('dark:text-slate-200', !isActive);
    });
}
export function updateClearCompletedButtonState() {
    if (!settingsClearCompletedBtn || !AppStore) return;
    const tasks = AppStore.getTasks();
    const hasCompleted = tasks.some(task => task.completed);
    settingsClearCompletedBtn.disabled = !hasCompleted;
    settingsClearCompletedBtn.classList.toggle('opacity-50', !hasCompleted);
    settingsClearCompletedBtn.classList.toggle('cursor-not-allowed', !hasCompleted);
}
export function updateViewToggleButtonsState() {
    // This function can be removed or left empty as the buttons are gone.
}
export function updateYourTasksHeading() {
    if (!yourTasksHeading || !ViewManager) return;
    const currentFilter = ViewManager.getCurrentFilter();
    let title = "Your Items";

    if (currentFilter === 'inbox') title = "Inbox";
    else if (currentFilter === 'today') title = "Today's Items";
    else if (currentFilter === 'upcoming') title = "Upcoming Items";
    else if (currentFilter === 'completed') title = "Completed Items";
    else if (currentFilter === 'shopping_list') title = "Shopping List";
    else {
        title = `Label: ${currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)}`;
    }
    yourTasksHeading.textContent = title;
}

export function initializeUiRenderingSubscriptions() {
    if (!EventBus || !ViewManager || typeof window.isFeatureEnabled !== 'function') { LoggingService.error("[UI Rendering] Core dependencies for subscriptions not available.", null, {module: 'tasks_ui_rendering'}); return; } 

    EventBus.subscribe('displayUserMessage', (data) => {
        if (data && data.text) {
            _displayMessage(data.text, data.type || 'success');
        }
    });

    EventBus.subscribe('appVersionLoaded', (versionData) => {
        LoggingService.debug("[UI Rendering] Event received: appVersionLoaded. Re-rendering app version.", { versionData, module: 'tasks_ui_rendering' });
        renderAppVersion();
    });

    EventBus.subscribe('tasksChanged', (updatedTasks) => { LoggingService.debug("[UI Rendering] Event received: tasksChanged. Refreshing view.", {module: 'tasks_ui_rendering'}); refreshTaskView(); updateClearCompletedButtonState(); });
    
    EventBus.subscribe('filterChanged', (eventData) => {
        LoggingService.debug("[UI Rendering] Event received: filterChanged. Refreshing view, heading, and button styles.", {module: 'tasks_ui_rendering'});
        refreshTaskView();
        updateYourTasksHeading();
        updateSortButtonStates();
        styleSmartViewButtons();
    });

    EventBus.subscribe('sortChanged', (newSort) => { LoggingService.debug("[UI Rendering] Event received: sortChanged. Refreshing view and sort buttons.", {module: 'tasks_ui_rendering'}); refreshTaskView(); updateSortButtonStates(); });
    EventBus.subscribe('searchTermChanged', (newSearchTerm) => { LoggingService.debug("[UI Rendering] Event received: searchTermChanged. Refreshing view.", {module: 'tasks_ui_rendering'}); refreshTaskView(); });
    EventBus.subscribe('viewModeChanged', (newViewMode) => { LoggingService.debug("[UI Rendering] Event received: viewModeChanged. Refreshing view and UI states.", {module: 'tasks_ui_rendering'}); refreshTaskView();  });
    EventBus.subscribe('featureFlagsUpdated', (updateData) => { LoggingService.debug("[UI Rendering] Event received: featureFlagsUpdated. Certain UI states might need refresh.", {module: 'tasks_ui_rendering'}); refreshTaskView();  });
    EventBus.subscribe('labelsChanged', (newLabels) => {
        LoggingService.debug("[UI Rendering] Event received: labelsChanged. Populating datalists.", {module: 'tasks_ui_rendering'});
        if(existingLabelsDatalist) populateDatalist(existingLabelsDatalist);
        if(existingLabelsEditDatalist) populateDatalist(existingLabelsEditDatalist);
        if (manageLabelsModal && !manageLabelsModal.classList.contains('hidden')) {
            populateManageLabelsList();
        }
    });
    LoggingService.debug("[UI Rendering] Event subscriptions initialized.", {module: 'tasks_ui_rendering'});
}

LoggingService.debug("tasks_ui_rendering.js loaded, using imported services and functions.", { module: 'tasks_ui_rendering' });