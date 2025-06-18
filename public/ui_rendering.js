// ui_rendering.js
// Handles all direct DOM manipulation for rendering UI components and task lists.
// Now an ES6 module.

import AppStore from './store.js';
import ViewManager from './viewManager.js';
import { getAppVersionString } from './versionService.js';
import ModalStateService from './modalStateService.js';
import EventBus from './eventBus.js';
import { formatDate, formatTime, formatDuration, formatMillisecondsToHMS } from './utils.js';
import LoggingService from './loggingService.js'; 

// Import functions from other UI modules
import {
    populateManageLabelsList
} from './modal_interactions.js';

// Import Feature Modules needed for direct calls
import { ProjectsFeature } from './feature_projects.js';
import { SubTasksFeature } from './feature_sub_tasks.js';

// Import the newly created rendering functions
import { renderTaskListView, renderBulkActionControls } from './renderTaskListView.js';

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
export let existingAttachmentsViewEdit;
export let viewTaskDetailsModal, modalDialogViewDetails, closeViewDetailsModalBtn, closeViewDetailsSecondaryBtn;
export let editFromViewModalBtn, deleteFromViewModalBtn, viewTaskText, viewTaskDueDate, viewTaskTime;
export let viewTaskPriority, viewTaskStatus, viewTaskLabel, viewTaskNotes, viewTaskReminderSection, viewTaskReminderStatus;
export let viewTaskReminderDetails, viewTaskReminderDate, viewTaskReminderTime, viewTaskReminderEmail;
export let viewTaskAttachmentsSection, viewTaskAttachmentsList;
export let manageLabelsModal, modalDialogManageLabels, closeManageLabelsModalBtn, closeManageLabelsSecondaryBtn;
export let addNewLabelForm, newLabelInput, existingLabelsList;
export let settingsModal, modalDialogSettings, openSettingsModalButton, closeSettingsModalBtn, closeSettingsSecondaryBtn;
export let settingsClearCompletedBtn, settingsManageLabelsBtn, settingsManageRemindersBtn;
export let subTasksSectionViewEdit, modalSubTaskInputViewEdit, modalAddSubTaskBtnViewEdit, modalSubTasksListViewEdit;
export let subTasksSectionViewDetails, viewSubTaskProgress, modalSubTasksListViewDetails, noSubTasksMessageViewDetails;
export let subTasksSectionAdd, modalSubTaskInputAdd, modalAddSubTaskBtnAdd, modalSubTasksListAdd;
export let featureFlagsListContainer;
export let yourTasksHeading, mainContentArea;
export let settingsManageProjectsBtn;
export let manageProjectsModal, modalDialogManageProjects, closeManageProjectsModalBtn, closeManageProjectsSecondaryBtn;
export let modalProjectSelectAdd, modalProjectSelectViewEdit;
export let projectFilterContainer;
export let viewTaskProject;
export let taskDependenciesSectionAdd, dependsOnContainerAdd, blocksTasksContainerAdd;
export let taskDependenciesSectionViewEdit, dependsOnContainerViewEdit, blocksTasksContainerViewEdit;
export let viewTaskDependenciesSection, viewTaskDependsOnList, viewTaskBlocksTasksList;
export let bulkActionControlsContainer, selectAllTasksCheckbox, bulkCompleteBtn, bulkDeleteBtn; // These are needed by renderTaskListView.js
export let bulkAssignProjectDropdown, bulkChangePriorityDropdown, bulkChangeLabelInput; // Needed by renderTaskListView.js
export let criticalErrorDisplay, criticalErrorMessage, criticalErrorId, closeCriticalErrorBtn;
export let settingsVersionHistoryBtn;
export let dataVersionHistoryModal, modalDialogDataVersionHistory, closeDataVersionHistoryModalBtn, closeDataVersionHistorySecondaryBtn;
export let dataVersionHistoryContent;
export let appVersionFooterEl;
export let appVersionAboutUsDisplayEl;


export function initializeDOMElements() {
    LoggingService.debug('[DOM Init] Attempting to initialize DOM elements...', { module: 'ui_rendering' }); // Changed console.log
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
    taskList = document.getElementById('taskList'); // Exported
    emptyState = document.getElementById('emptyState'); // Exported
    noMatchingTasks = document.getElementById('noMatchingTasks'); // Exported
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
    existingAttachmentsViewEdit = document.getElementById('existingAttachmentsViewEdit');
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
    viewTaskAttachmentsSection = document.getElementById('viewTaskAttachmentsSection');
    viewTaskAttachmentsList = document.getElementById('viewTaskAttachmentsList');
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
    subTasksSectionViewEdit = document.getElementById('subTasksSectionViewEdit');
    modalSubTaskInputViewEdit = document.getElementById('modalSubTaskInputViewEdit');
    modalAddSubTaskBtnViewEdit = document.getElementById('modalAddSubTaskBtnViewEdit');
    modalSubTasksListViewEdit = document.getElementById('modalSubTasksListViewEdit');
    subTasksSectionViewDetails = document.getElementById('subTasksSectionViewDetails');
    viewSubTaskProgress = document.getElementById('viewSubTaskProgress');
    modalSubTasksListViewDetails = document.getElementById('modalSubTasksListViewDetails');
    noSubTasksMessageViewDetails = document.getElementById('noSubTasksMessageViewDetails');
    subTasksSectionAdd = document.getElementById('subTasksSectionAdd');
    modalSubTaskInputAdd = document.getElementById('modalSubTaskInputAdd');
    modalAddSubTaskBtnAdd = document.getElementById('modalAddSubTaskBtnAdd');
    modalSubTasksListAdd = document.getElementById('modalSubTasksListAdd');
    featureFlagsListContainer = document.getElementById('featureFlagsListContainer');
    yourTasksHeading = document.getElementById('yourTasksHeading');
    settingsManageProjectsBtn = document.getElementById('settingsManageProjectsBtn');
    manageProjectsModal = document.getElementById('manageProjectsModal');
    modalDialogManageProjects = document.getElementById('modalDialogManageProjects');
    closeManageProjectsModalBtn = document.getElementById('closeManageProjectsModalBtn');
    closeManageProjectsSecondaryBtn = document.getElementById('closeManageProjectsSecondaryBtn');
    modalProjectSelectAdd = document.getElementById('modalProjectSelectAdd');
    modalProjectSelectViewEdit = document.getElementById('modalProjectSelectViewEdit');
    projectFilterContainer = document.getElementById('projectFilterContainer');
    viewTaskProject = document.getElementById('viewTaskProject');
    taskDependenciesSectionAdd = document.getElementById('taskDependenciesSectionAdd');
    dependsOnContainerAdd = document.getElementById('dependsOnContainerAdd');
    blocksTasksContainerAdd = document.getElementById('blocksTasksContainerAdd');
    taskDependenciesSectionViewEdit = document.getElementById('taskDependenciesSectionViewEdit');
    dependsOnContainerViewEdit = document.getElementById('dependsOnContainerViewEdit');
    blocksTasksContainerViewEdit = document.getElementById('blocksTasksContainerViewEdit');
    viewTaskDependenciesSection = document.getElementById('viewTaskDependenciesSection');
    viewTaskDependsOnList = document.getElementById('viewTaskDependsOnList');
    viewTaskBlocksTasksList = document.getElementById('viewTaskBlocksTasksList');
    bulkActionControlsContainer = document.getElementById('bulkActionControlsContainer'); // Exported
    selectAllTasksCheckbox = document.getElementById('selectAllTasksCheckbox'); // Exported
    bulkCompleteBtn = document.getElementById('bulkCompleteBtn'); // Exported
    bulkDeleteBtn = document.getElementById('bulkDeleteBtn'); // Exported
    bulkAssignProjectDropdown = document.getElementById('bulkAssignProjectDropdown'); // Exported
    bulkChangePriorityDropdown = document.getElementById('bulkChangePriorityDropdown'); // Exported
    bulkChangeLabelInput = document.getElementById('bulkChangeLabelInput'); // Exported
    criticalErrorDisplay = document.getElementById('criticalErrorDisplay');
    criticalErrorMessage = document.getElementById('criticalErrorMessage');
    criticalErrorId = document.getElementById('criticalErrorId');
    closeCriticalErrorBtn = document.getElementById('closeCriticalErrorBtn');
    settingsVersionHistoryBtn = document.getElementById('settingsVersionHistoryBtn');
    dataVersionHistoryModal = document.getElementById('dataVersionHistoryModal');
    modalDialogDataVersionHistory = document.getElementById('modalDialogDataVersionHistory');
    closeDataVersionHistoryModalBtn = document.getElementById('closeDataVersionHistoryModalBtn');
    closeDataVersionHistorySecondaryBtn = document.getElementById('closeDataVersionHistorySecondaryBtn');
    dataVersionHistoryContent = document.getElementById('dataVersionHistoryContent');
    appVersionFooterEl = document.getElementById('appVersionFooter');
    appVersionAboutUsDisplayEl = document.getElementById('appVersionAboutUsDisplay');

    if (closeCriticalErrorBtn) {
        closeCriticalErrorBtn.addEventListener('click', hideCriticalError);
    }
    LoggingService.debug('[DOM Init] Finished initializing DOM elements.', { module: 'ui_rendering' }); // Changed console.log
}

// --- UI Helper Functions ---

export function renderAppVersion() {
    const versionString = getAppVersionString();
    if (appVersionFooterEl) {
        appVersionFooterEl.textContent = versionString;
    }
    if (appVersionAboutUsDisplayEl) {
        appVersionAboutUsDisplayEl.textContent = versionString;
    }
    LoggingService.debug(`[UI Rendering] App version rendered in UI: ${versionString}`, {module: 'ui_rendering'});
}

export function showCriticalError(message, errorId) {
    if (criticalErrorDisplay && criticalErrorMessage && criticalErrorId) {
        criticalErrorMessage.textContent = message || 'An critical, unexpected error occurred. Please try refreshing the page or contact support if the issue persists.';
        criticalErrorId.textContent = errorId ? `Error ID: ${errorId}` : '';
        criticalErrorDisplay.classList.remove('hidden', 'translate-y-full');
        criticalErrorDisplay.classList.add('translate-y-0');
        LoggingService.error(`[UI Critical Error] Displayed: ${message}, ID: ${errorId}`, null, {module: 'ui_rendering'});
    } else {
        LoggingService.error(`[UI Critical Error] Fallback: ${message}, ID: ${errorId}`, null, {module: 'ui_rendering'});
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

export function populateDatalist(datalistElement) { // Exported for renderTaskListView.js
    if (!datalistElement || !AppStore || typeof AppStore.getUniqueLabels !== 'function') return;
    const currentUniqueLabels = AppStore.getUniqueLabels();
    datalistElement.innerHTML = '';
    currentUniqueLabels.forEach(label => { const option = document.createElement('option'); option.value = label; datalistElement.appendChild(option); });
}

export function setSidebarMinimized(minimize) {
    if (!taskSidebar) {
        LoggingService.error("[UI Rendering] setSidebarMinimized: taskSidebar element not initialized. Aborting.", null, {module: 'ui_rendering'});
        return;
    }
    taskSidebar.classList.toggle('sidebar-minimized', minimize);
    LoggingService.debug(`[UI Rendering] taskSidebar classList after toggle: ${taskSidebar.classList}`, {module: 'ui_rendering'});


    if (sidebarToggleIcon) {
        sidebarToggleIcon.className = `fas ${minimize ? 'fa-chevron-right' : 'fa-chevron-left'}`;
    } else {
        LoggingService.warn("[UI Rendering] setSidebarMinimized: sidebarToggleIcon element not initialized.", {module: 'ui_rendering'});
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

    if (window.isFeatureEnabled('projectFeature') && ProjectsFeature?.populateProjectFilterList) { 
        ProjectsFeature.populateProjectFilterList();
    }
    LoggingService.debug(`[UI Rendering] Sidebar minimized state set to: ${minimize}. CSS should now apply relevant styles.`, {module: 'ui_rendering'});
}

// --- Task Rendering ---
export function refreshTaskView() {
    if (!document.getElementById('taskList')) {
        LoggingService.debug('[UI Rendering] Not on the main task page. Skipping refreshTaskView.', {module: 'ui_rendering'});
        return;
    }

    if (!mainContentArea || !ViewManager || typeof window.isFeatureEnabled !== 'function') { LoggingService.error("[RefreshTaskView] Core dependencies not found.", null, {module: 'ui_rendering'}); return; } 
    updateViewToggleButtonsState();
    updateYourTasksHeading();
    styleSmartViewButtons();

    // Default to list view as other views are removed
    ViewManager.setTaskViewMode('list');
    renderTaskListView();
    
    updateClearCompletedButtonState();
    renderBulkActionControls();
    LoggingService.debug(`[UI Rendering] Task view refreshed for mode: list`, {module: 'ui_rendering'});
}

export function renderTaskDependenciesForViewModal(task) {
    const viewTaskDependsOnListEl = document.getElementById('viewTaskDependsOnList');
    const viewTaskBlocksTasksListEl = document.getElementById('viewTaskBlocksTasksList');

    if (!viewTaskDependsOnListEl || !viewTaskBlocksTasksListEl || !AppStore) return;
    const allTasks = AppStore.getTasks();
    viewTaskDependsOnListEl.innerHTML = ''; viewTaskBlocksTasksListEl.innerHTML = '';

    if (task.dependsOn && task.dependsOn.length > 0) {
        task.dependsOn.forEach(depId => {
            const depTask = allTasks.find(t => t.id === depId);
            const li = document.createElement('li');
            li.textContent = depTask ? `${depTask.text} (${depTask.completed ? 'Done' : 'Pending'})` : `Task ID: ${depId} (Not found)`;
            if (depTask && depTask.completed) li.classList.add('text-green-600', 'dark:text-green-400');
            else if (depTask) li.classList.add('text-amber-600', 'dark:text-amber-400');
            viewTaskDependsOnListEl.appendChild(li);
        });
    } else {
        viewTaskDependsOnListEl.innerHTML = '<li class="italic">None</li>';
    }

    if (task.blocksTasks && task.blocksTasks.length > 0) {
        task.blocksTasks.forEach(blockedId => {
            const blockedTask = allTasks.find(t => t.id === blockedId);
            const li = document.createElement('li');
            li.textContent = blockedTask ? blockedTask.text : `Task ID: ${blockedId} (Not found)`;
            viewTaskBlocksTasksListEl.appendChild(li);
        });
    } else {
        viewTaskBlocksTasksListEl.innerHTML = '<li class="italic">None</li>';
    }
}
export function renderTempSubTasksForAddModal(tempSubTasks, listElement) {
    if (!listElement) return;
    listElement.innerHTML = '';
    if (!tempSubTasks || tempSubTasks.length === 0) {
        listElement.innerHTML = '<li class="text-xs text-slate-400 dark:text-slate-500">No sub-tasks added yet.</li>';
        return;
    }
    tempSubTasks.forEach((st, index) => {
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between text-sm bg-slate-100 dark:bg-slate-600 p-1.5 rounded';
        const span = document.createElement('span');
        span.textContent = st.text;
        span.className = "dark:text-slate-200";
        li.appendChild(span);
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.innerHTML = '<i class="fas fa-times text-red-500 hover:text-red-700 text-xs"></i>';
        removeBtn.onclick = () => {
            tempSubTasks.splice(index, 1);
            renderTempSubTasksForAddModal(tempSubTasks, listElement);
        };
        li.appendChild(removeBtn);
        listElement.appendChild(li);
    });
}
export function renderSubTasksForEditModal(parentId, subTasksListElement) {
    if (!AppStore || !subTasksListElement || !ModalStateService) return;
    const actualParentId = parentId || ModalStateService.getEditingTaskId();
    if (!actualParentId) {
        LoggingService.error("[RenderSubTasksEdit] Parent ID missing.", null, {module: 'ui_rendering'});
        subTasksListElement.innerHTML = '<li class="text-xs text-red-500 dark:text-red-400">Error: Parent task ID not found.</li>';
        return;
    }

    const parentTask = AppStore.getTasks().find(t => t.id === actualParentId);
    subTasksListElement.innerHTML = '';

    if (!parentTask || !parentTask.subTasks || parentTask.subTasks.length === 0) {
        subTasksListElement.innerHTML = '<li class="text-xs text-slate-400 dark:text-slate-500">No sub-tasks added yet.</li>';
        return;
    }

    parentTask.subTasks.forEach(st => {
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between text-sm bg-slate-100 dark:bg-slate-600 p-1.5 rounded';

        const textSpan = document.createElement('span');
        textSpan.textContent = st.text;
        textSpan.className = `dark:text-slate-200 ${st.completed ? 'line-through text-slate-500 dark:text-slate-400' : ''}`;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = st.completed;
        checkbox.className = 'form-checkbox h-4 w-4 text-sky-500 rounded border-slate-300 dark:border-slate-500 focus:ring-sky-400 mr-2';
        checkbox.onchange = () => {
            if (SubTasksFeature && SubTasksFeature.toggleComplete) {
                if (SubTasksFeature.toggleComplete(actualParentId, st.id)) {
                    renderSubTasksForEditModal(actualParentId, subTasksListElement);
                } else {
                    _displayMessage('Failed to toggle sub-task.', 'error');
                }
            } else {
                 LoggingService.warn("SubTasksFeature.toggleComplete not available.", {module: 'ui_rendering'});
            }
        };

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.innerHTML = '<i class="fas fa-pencil-alt text-sky-500 hover:text-sky-700 text-xs mx-1"></i>';
        editBtn.title = 'Edit sub-task';
        editBtn.onclick = () => {
            const newText = prompt('Edit sub-task:', st.text);
            if (newText !== null && newText.trim() !== '') {
                if (SubTasksFeature && SubTasksFeature.edit) {
                    if (SubTasksFeature.edit(actualParentId, st.id, newText.trim())) {
                        renderSubTasksForEditModal(actualParentId, subTasksListElement);
                    } else {
                        _displayMessage('Failed to edit sub-task.', 'error');
                    }
                } else {
                     LoggingService.warn("SubTasksFeature.edit not available.", {module: 'ui_rendering'});
                }
            }
        };

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.innerHTML = '<i class="fas fa-times text-red-500 hover:text-red-700 text-xs"></i>';
        removeBtn.title = 'Delete sub-task';
        removeBtn.onclick = () => {
            if (confirm('Delete this sub-task?')) {
                if (SubTasksFeature && SubTasksFeature.delete) {
                    if (SubTasksFeature.delete(actualParentId, st.id)) {
                        renderSubTasksForEditModal(actualParentId, subTasksListElement);
                    } else {
                        _displayMessage('Failed to delete sub-task.', 'error');
                    }
                } else {
                    LoggingService.warn("SubTasksFeature.delete not available.", {module: 'ui_rendering'});
                }
            }
        };

        const controlsDiv = document.createElement('div');
        controlsDiv.appendChild(editBtn);
        controlsDiv.appendChild(removeBtn);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'flex items-center flex-grow';
        contentDiv.appendChild(checkbox);
        contentDiv.appendChild(textSpan);

        li.appendChild(contentDiv);
        li.appendChild(controlsDiv);

        subTasksListElement.appendChild(li);
    });
}
export function renderSubTasksForViewModal(parentId, subTasksListElement, progressElement, noSubTasksMessageElement) {
     if (!AppStore || !subTasksListElement || !progressElement || !noSubTasksMessageElement) return;
    const parentTask = AppStore.getTasks().find(t => t.id === parentId);
    subTasksListElement.innerHTML = '';
    if (!parentTask || !parentTask.subTasks || parentTask.subTasks.length === 0) {
        noSubTasksMessageElement.classList.remove('hidden');
        progressElement.textContent = '';
        return;
    }
    noSubTasksMessageElement.classList.add('hidden');
    let completedCount = 0;
    parentTask.subTasks.forEach(st => {
        const li = document.createElement('li');
        li.className = 'flex items-center text-slate-600 dark:text-slate-300';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = st.completed;
        checkbox.className = 'form-checkbox h-4 w-4 text-sky-500 rounded border-slate-400 dark:border-slate-500 focus:ring-sky-400 mr-2 cursor-not-allowed';
        checkbox.disabled = true;
        if (st.completed) completedCount++;
        const span = document.createElement('span');
        span.textContent = st.text;
        if (st.completed) span.classList.add('line-through', 'text-slate-400', 'dark:text-slate-500');
        li.appendChild(checkbox);
        li.appendChild(span);
        subTasksListElement.appendChild(li);
    });
    progressElement.textContent = `${completedCount} / ${parentTask.subTasks.length} completed`;
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
    // Leaving it empty prevents errors if it's called from somewhere else.
}
export function updateYourTasksHeading() {
    if (!yourTasksHeading || !ViewManager) return;
    const currentFilter = ViewManager.getCurrentFilter();
    let title = "Your Items"; // More generic title

    if (currentFilter === 'inbox') title = "Inbox";
    else if (currentFilter === 'today') title = "Today's Items";
    else if (currentFilter === 'upcoming') title = "Upcoming Items";
    else if (currentFilter === 'completed') title = "Completed Items";
    else if (currentFilter === 'shopping_list') title = "Shopping List";
    else if (currentFilter.startsWith('project_')) {
        if (window.isFeatureEnabled('projectFeature') && AppStore) { 
            const projectId = parseInt(currentFilter.split('_')[1]);
            const project = AppStore.getProjects().find(p => p.id === projectId);
            title = project ? `Project: ${project.name}` : "Project Items";
        } else {
            title = "Project Items";
        }
    } else {
        title = `Label: ${currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)}`;
    }
    yourTasksHeading.textContent = title;
}

export function renderVersionHistoryList(versions) {
    if (!dataVersionHistoryContent) {
        LoggingService.error("[UI Rendering] Data version history content element not found.", null, {module: 'ui_rendering'});
        return;
    }
    dataVersionHistoryContent.innerHTML = '';

    if (!versions || versions.length === 0) {
        dataVersionHistoryContent.innerHTML = '<p class="text-slate-500 dark:text-slate-400 text-center p-4">No version history available.</p>';
        return;
    }

    const ul = document.createElement('ul');
    ul.className = 'space-y-2';

    versions.forEach(version => {
        const li = document.createElement('li');
        li.className = 'p-3 bg-slate-100 dark:bg-slate-700 rounded-md shadow-sm flex justify-between items-center';

        const infoDiv = document.createElement('div');
        const timeSpan = document.createElement('span');
        timeSpan.className = 'font-semibold text-slate-800 dark:text-slate-200 block text-sm';
        timeSpan.textContent = new Date(version.timestamp).toLocaleString();

        const descSpan = document.createElement('span');
        descSpan.className = 'text-xs text-slate-600 dark:text-slate-400 block';
        descSpan.textContent = version.description || 'No description';

        infoDiv.appendChild(timeSpan);
        infoDiv.appendChild(descSpan);

        const restoreButton = document.createElement('button');
        restoreButton.textContent = 'Restore';
        restoreButton.className = 'px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-md shadow-sm';
        restoreButton.title = `Restore to version from ${new Date(version.timestamp).toLocaleString()}`;
        restoreButton.onclick = async () => {
            if (confirm(`Are you sure you want to restore data to the version from ${new Date(version.timestamp).toLocaleString()}? This will overwrite your current data.`)) {
                try {
                    const { DataVersioningFeature } = await import('./feature_data_versioning.js');
                    if (DataVersioningFeature && DataVersioningFeature.restoreVersion) {
                        const success = DataVersioningFeature.restoreVersion(version.timestamp);
                        if (success) {
                            const { closeDataVersionHistoryModal } = await import('./modal_interactions.js');
                            if (closeDataVersionHistoryModal) closeDataVersionHistoryModal();
                        }
                    } else {
                        _displayMessage('Error: Restore function not available.', 'error');
                    }
                } catch (e) {
                    LoggingService.error("Error importing DataVersioningFeature for restore:", e, {module: 'ui_rendering'});
                    _displayMessage('Error trying to restore version.', 'error');
                }
            }
        };

        li.appendChild(infoDiv);
        li.appendChild(restoreButton);
        ul.appendChild(li);
    });
    dataVersionHistoryContent.appendChild(ul);
}


export function initializeUiRenderingSubscriptions() {
    if (!EventBus || !ViewManager || typeof window.isFeatureEnabled !== 'function') { LoggingService.error("[UI Rendering] Core dependencies for subscriptions not available.", null, {module: 'ui_rendering'}); return; } 

    EventBus.subscribe('displayUserMessage', (data) => {
        if (data && data.text) {
            _displayMessage(data.text, data.type || 'success');
        }
    });

    EventBus.subscribe('appVersionLoaded', (versionData) => {
        LoggingService.debug("[UI Rendering] Event received: appVersionLoaded. Re-rendering app version.", { versionData, module: 'ui_rendering' });
        renderAppVersion();
    });

    EventBus.subscribe('tasksChanged', (updatedTasks) => { LoggingService.debug("[UI Rendering] Event received: tasksChanged. Refreshing view.", {module: 'ui_rendering'}); refreshTaskView(); updateClearCompletedButtonState(); });
    EventBus.subscribe('projectsChanged', (updatedProjects) => {
        LoggingService.debug("[UI Rendering] Event received: projectsChanged. Refreshing view and project UI.", {module: 'ui_rendering'});
        refreshTaskView();
        if (window.isFeatureEnabled('projectFeature') && ProjectsFeature?.populateProjectFilterList) ProjectsFeature.populateProjectFilterList(); 
        if (window.isFeatureEnabled('projectFeature') && ProjectsFeature?.populateProjectDropdowns) ProjectsFeature.populateProjectDropdowns(); 
        styleSmartViewButtons();
    });
    EventBus.subscribe('uniqueProjectsChanged', (newUniqueProjects) => {
        LoggingService.debug("[UI Rendering] Event received: uniqueProjectsChanged. Repopulating project UI.", {module: 'ui_rendering'});
        if (window.isFeatureEnabled('projectFeature') && ProjectsFeature?.populateProjectFilterList) ProjectsFeature.populateProjectFilterList(); 
        if (window.isFeatureEnabled('projectFeature') && ProjectsFeature?.populateProjectDropdowns) ProjectsFeature.populateProjectDropdowns(); 
        styleSmartViewButtons();
    });
    
    EventBus.subscribe('filterChanged', (eventData) => {
        LoggingService.debug("[UI Rendering] Event received: filterChanged. Refreshing view, heading, and button styles.", {module: 'ui_rendering'});
        refreshTaskView();
        updateYourTasksHeading();
        updateSortButtonStates();
        styleSmartViewButtons();
    });

    EventBus.subscribe('sortChanged', (newSort) => { LoggingService.debug("[UI Rendering] Event received: sortChanged. Refreshing view and sort buttons.", {module: 'ui_rendering'}); refreshTaskView(); updateSortButtonStates(); });
    EventBus.subscribe('searchTermChanged', (newSearchTerm) => { LoggingService.debug("[UI Rendering] Event received: searchTermChanged. Refreshing view.", {module: 'ui_rendering'}); refreshTaskView(); });
    EventBus.subscribe('viewModeChanged', (newViewMode) => { LoggingService.debug("[UI Rendering] Event received: viewModeChanged. Refreshing view and UI states.", {module: 'ui_rendering'}); refreshTaskView();  });
    EventBus.subscribe('featureFlagsUpdated', (updateData) => { LoggingService.debug("[UI Rendering] Event received: featureFlagsUpdated. Certain UI states might need refresh.", {module: 'ui_rendering'}); refreshTaskView();  });
    EventBus.subscribe('labelsChanged', (newLabels) => {
        LoggingService.debug("[UI Rendering] Event received: labelsChanged. Populating datalists.", {module: 'ui_rendering'});
        if(existingLabelsDatalist) populateDatalist(existingLabelsDatalist);
        if(existingLabelsEditDatalist) populateDatalist(existingLabelsEditDatalist);
        if (manageLabelsModal && !manageLabelsModal.classList.contains('hidden')) {
            populateManageLabelsList();
        }
    });
    EventBus.subscribe('bulkSelectionChanged', (selectedIds) => { LoggingService.debug("[UI Rendering] Event received: bulkSelectionChanged. Rendering controls.", {module: 'ui_rendering'}); renderBulkActionControls(); }); 
    LoggingService.debug("[UI Rendering] Event subscriptions initialized.", {module: 'ui_rendering'});
}

LoggingService.debug("ui_rendering.js loaded, using imported services and functions.", { module: 'ui_rendering' });