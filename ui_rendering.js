// ui_rendering.js
// Handles all direct DOM manipulation for rendering UI components and task lists.
// Now an ES6 module.

import AppStore from './store.js';
import ViewManager from './viewManager.js';
import { isFeatureEnabled } from './featureFlagService.js';
import * as TaskService from './taskService.js'; // Import all as TaskService
import * as BulkActionService from './bulkActionService.js'; // Import all as BulkActionService
import ModalStateService from './modalStateService.js';
import TooltipService from './tooltipService.js';
import EventBus from './eventBus.js';
import { formatDate, formatTime, formatDuration, formatMillisecondsToHMS } from './utils.js';

// DOM Elements (declared with let, will be module-scoped)
// These are initialized by initializeDOMElements()
let taskSidebar, sidebarToggleBtn, sidebarToggleIcon, sidebarTextElements, sidebarIconOnlyButtons, iconTooltip;
let sortByDueDateBtn, sortByPriorityBtn, sortByLabelBtn, taskSearchInput, taskList, emptyState, noMatchingTasks;
let smartViewButtonsContainer, smartViewButtons, messageBox;
let addTaskModal, modalDialogAdd, openAddModalButton, closeAddModalBtn, cancelAddModalBtn, modalTodoFormAdd;
let modalTaskInputAdd, modalDueDateInputAdd, modalTimeInputAdd, modalEstHoursAdd, modalEstMinutesAdd;
let modalPriorityInputAdd, modalLabelInputAdd, existingLabelsDatalist, modalNotesInputAdd;
let modalRemindMeAddContainer, modalRemindMeAdd, reminderOptionsAdd, modalReminderDateAdd, modalReminderTimeAdd, modalReminderEmailAdd;
let viewEditTaskModal, modalDialogViewEdit, closeViewEditModalBtn, cancelViewEditModalBtn, modalTodoFormViewEdit;
let modalViewEditTaskId, modalTaskInputViewEdit, modalDueDateInputViewEdit, modalTimeInputViewEdit;
let modalEstHoursViewEdit, modalEstMinutesViewEdit, modalPriorityInputViewEdit, modalLabelInputViewEdit;
let existingLabelsEditDatalist, modalNotesInputViewEdit, modalRemindMeViewEditContainer, modalRemindMeViewEdit;
let reminderOptionsViewEdit, modalReminderDateViewEdit, modalReminderTimeViewEdit, modalReminderEmailViewEdit;
let existingAttachmentsViewEdit;
let viewTaskDetailsModal, modalDialogViewDetails, closeViewDetailsModalBtn, closeViewDetailsSecondaryBtn;
let editFromViewModalBtn, deleteFromViewModalBtn, viewTaskText, viewTaskDueDate, viewTaskTime, viewTaskEstDuration;
let viewTaskPriority, viewTaskStatus, viewTaskLabel, viewTaskNotes, viewTaskReminderSection, viewTaskReminderStatus;
let viewTaskReminderDetails, viewTaskReminderDate, viewTaskReminderTime, viewTaskReminderEmail;
let viewTaskAttachmentsSection, viewTaskAttachmentsList;
let taskTimerSection, viewTaskTimerDisplay, viewTaskStartTimerBtn, viewTaskPauseTimerBtn, viewTaskStopTimerBtn;
let viewTaskActualDuration, timerButtonsContainer;
let manageLabelsModal, modalDialogManageLabels, closeManageLabelsModalBtn, closeManageLabelsSecondaryBtn;
let addNewLabelForm, newLabelInput, existingLabelsList;
let settingsModal, modalDialogSettings, openSettingsModalButton, closeSettingsModalBtn, closeSettingsSecondaryBtn;
let settingsClearCompletedBtn, settingsManageLabelsBtn, settingsManageRemindersBtn, settingsTaskReviewBtn;
let settingsTooltipsGuideBtn, settingsIntegrationsBtn, settingsUserAccountsBtn, settingsCollaborationBtn, settingsSyncBackupBtn;
let taskReviewModal, modalDialogTaskReview, closeTaskReviewModalBtn, closeTaskReviewSecondaryBtn, taskReviewContent;
let tooltipsGuideModal, modalDialogTooltipsGuide, closeTooltipsGuideModalBtn, closeTooltipsGuideSecondaryBtn, tooltipsGuideContent;
let testFeatureButtonContainer, testFeatureButton;
let subTasksSectionViewEdit, modalSubTaskInputViewEdit, modalAddSubTaskBtnViewEdit, modalSubTasksListViewEdit;
let subTasksSectionViewDetails, viewSubTaskProgress, modalSubTasksListViewDetails, noSubTasksMessageViewDetails;
let subTasksSectionAdd, modalSubTaskInputAdd, modalAddSubTaskBtnAdd, modalSubTasksListAdd;
let featureFlagsListContainer;
let kanbanViewToggleBtn, kanbanViewToggleBtnText, yourTasksHeading, mainContentArea;
let kanbanBoardContainer; 
let calendarViewContainer;
let pomodoroTimerPageContainer; 
let settingsManageProjectsBtn;
let manageProjectsModal, modalDialogManageProjects, closeManageProjectsModalBtn, closeManageProjectsSecondaryBtn;
let addNewProjectForm, newProjectInput, existingProjectsList;
let modalProjectSelectAdd, modalProjectSelectViewEdit;
let projectFilterContainer;
let viewTaskProject;
let taskDependenciesSectionAdd, dependsOnContainerAdd, blocksTasksContainerAdd;
let taskDependenciesSectionViewEdit, dependsOnContainerViewEdit, blocksTasksContainerViewEdit;
let viewTaskDependenciesSection, viewTaskDependsOnList, viewTaskBlocksTasksList;
let smarterSearchContainer, smarterSearchAdvancedToggleBtn, smarterSearchOptionsDiv;
let bulkActionControlsContainer, selectAllTasksCheckbox, bulkCompleteBtn, bulkDeleteBtn;
let bulkAssignProjectDropdown, bulkChangePriorityDropdown, bulkChangeLabelInput;
let pomodoroViewToggleBtnText;
let sidebarPomodoroDisplay, sidebarPomodoroState, sidebarPomodoroTime, sidebarPomodoroTask;


export function initializeDOMElements() {
    // This function is long, so keeping the content as before.
    // It assigns to the `let` variables declared above.
    console.log('[DOM Init] Attempting to initialize DOM elements...');
    mainContentArea = document.querySelector('main'); kanbanViewToggleBtn = document.getElementById('kanbanViewToggleBtn'); kanbanViewToggleBtnText = document.getElementById('kanbanViewToggleBtnText'); smartViewButtonsContainer = document.getElementById('smartViewButtonsContainer'); taskSidebar = document.getElementById('taskSidebar'); sidebarToggleBtn = document.getElementById('sidebarToggleBtn'); sidebarToggleIcon = document.getElementById('sidebarToggleIcon'); sidebarTextElements = taskSidebar ? taskSidebar.querySelectorAll('.sidebar-text-content') : []; sidebarIconOnlyButtons = taskSidebar ? taskSidebar.querySelectorAll('.sidebar-button-icon-only') : []; iconTooltip = document.getElementById('iconTooltip'); sortByDueDateBtn = document.getElementById('sortByDueDateBtn'); sortByPriorityBtn = document.getElementById('sortByPriorityBtn'); sortByLabelBtn = document.getElementById('sortByLabelBtn'); taskSearchInput = document.getElementById('taskSearchInput'); taskList = document.getElementById('taskList'); emptyState = document.getElementById('emptyState'); noMatchingTasks = document.getElementById('noMatchingTasks'); smartViewButtons = smartViewButtonsContainer ? smartViewButtonsContainer.querySelectorAll('.smart-view-btn') : []; messageBox = document.getElementById('messageBox'); addTaskModal = document.getElementById('addTaskModal'); modalDialogAdd = document.getElementById('modalDialogAdd'); openAddModalButton = document.getElementById('openAddModalButton'); closeAddModalBtn = document.getElementById('closeAddModalBtn'); cancelAddModalBtn = document.getElementById('cancelAddModalBtn'); modalTodoFormAdd = document.getElementById('modalTodoFormAdd'); modalTaskInputAdd = document.getElementById('modalTaskInputAdd'); modalDueDateInputAdd = document.getElementById('modalDueDateInputAdd'); modalTimeInputAdd = document.getElementById('modalTimeInputAdd'); modalEstHoursAdd = document.getElementById('modalEstHoursAdd'); modalEstMinutesAdd = document.getElementById('modalEstMinutesAdd'); modalPriorityInputAdd = document.getElementById('modalPriorityInputAdd'); modalLabelInputAdd = document.getElementById('modalLabelInputAdd'); existingLabelsDatalist = document.getElementById('existingLabels'); modalNotesInputAdd = document.getElementById('modalNotesInputAdd'); modalRemindMeAddContainer = document.getElementById('modalRemindMeAddContainer'); modalRemindMeAdd = document.getElementById('modalRemindMeAdd'); reminderOptionsAdd = document.getElementById('reminderOptionsAdd'); modalReminderDateAdd = document.getElementById('modalReminderDateAdd'); modalReminderTimeAdd = document.getElementById('modalReminderTimeAdd'); modalReminderEmailAdd = document.getElementById('modalReminderEmailAdd'); viewEditTaskModal = document.getElementById('viewEditTaskModal'); modalDialogViewEdit = document.getElementById('modalDialogViewEdit'); closeViewEditModalBtn = document.getElementById('closeViewEditModalBtn'); cancelViewEditModalBtn = document.getElementById('cancelViewEditModalBtn'); modalTodoFormViewEdit = document.getElementById('modalTodoFormViewEdit'); modalViewEditTaskId = document.getElementById('modalViewEditTaskId'); modalTaskInputViewEdit = document.getElementById('modalTaskInputViewEdit'); modalDueDateInputViewEdit = document.getElementById('modalDueDateInputViewEdit'); modalTimeInputViewEdit = document.getElementById('modalTimeInputViewEdit'); modalEstHoursViewEdit = document.getElementById('modalEstHoursViewEdit'); modalEstMinutesViewEdit = document.getElementById('modalEstMinutesViewEdit'); modalPriorityInputViewEdit = document.getElementById('modalPriorityInputViewEdit'); modalLabelInputViewEdit = document.getElementById('modalLabelInputViewEdit'); existingLabelsEditDatalist = document.getElementById('existingLabelsEdit'); modalNotesInputViewEdit = document.getElementById('modalNotesInputViewEdit'); modalRemindMeViewEditContainer = document.getElementById('modalRemindMeViewEditContainer'); modalRemindMeViewEdit = document.getElementById('modalRemindMeViewEdit'); reminderOptionsViewEdit = document.getElementById('reminderOptionsViewEdit'); modalReminderDateViewEdit = document.getElementById('modalReminderDateViewEdit'); modalReminderTimeViewEdit = document.getElementById('modalReminderTimeViewEdit'); modalReminderEmailViewEdit = document.getElementById('modalReminderEmailViewEdit'); existingAttachmentsViewEdit = document.getElementById('existingAttachmentsViewEdit'); viewTaskDetailsModal = document.getElementById('viewTaskDetailsModal'); modalDialogViewDetails = document.getElementById('modalDialogViewDetails'); closeViewDetailsModalBtn = document.getElementById('closeViewDetailsModalBtn'); closeViewDetailsSecondaryBtn = document.getElementById('closeViewDetailsSecondaryBtn'); editFromViewModalBtn = document.getElementById('editFromViewModalBtn'); deleteFromViewModalBtn = document.getElementById('deleteFromViewModalBtn'); viewTaskText = document.getElementById('viewTaskText'); viewTaskDueDate = document.getElementById('viewTaskDueDate'); viewTaskTime = document.getElementById('viewTaskTime'); viewTaskEstDuration = document.getElementById('viewTaskEstDuration'); viewTaskPriority = document.getElementById('viewTaskPriority'); viewTaskStatus = document.getElementById('viewTaskStatus'); viewTaskLabel = document.getElementById('viewTaskLabel'); viewTaskNotes = document.getElementById('viewTaskNotes'); viewTaskReminderSection = document.getElementById('viewTaskReminderSection'); viewTaskReminderStatus = document.getElementById('viewTaskReminderStatus'); viewTaskReminderDetails = document.getElementById('viewTaskReminderDetails'); viewTaskReminderDate = document.getElementById('viewTaskReminderDate'); viewTaskReminderTime = document.getElementById('viewTaskReminderTime'); viewTaskReminderEmail = document.getElementById('viewTaskReminderEmail'); viewTaskAttachmentsSection = document.getElementById('viewTaskAttachmentsSection'); viewTaskAttachmentsList = document.getElementById('viewTaskAttachmentsList'); taskTimerSection = document.getElementById('taskTimerSection'); viewTaskTimerDisplay = document.getElementById('viewTaskTimerDisplay'); viewTaskStartTimerBtn = document.getElementById('viewTaskStartTimerBtn'); viewTaskPauseTimerBtn = document.getElementById('viewTaskPauseTimerBtn'); viewTaskStopTimerBtn = document.getElementById('viewTaskStopTimerBtn'); viewTaskActualDuration = document.getElementById('viewTaskActualDuration'); timerButtonsContainer = document.getElementById('timerButtonsContainer'); manageLabelsModal = document.getElementById('manageLabelsModal'); modalDialogManageLabels = document.getElementById('modalDialogManageLabels'); closeManageLabelsModalBtn = document.getElementById('closeManageLabelsModalBtn'); closeManageLabelsSecondaryBtn = document.getElementById('closeManageLabelsSecondaryBtn'); addNewLabelForm = document.getElementById('addNewLabelForm'); newLabelInput = document.getElementById('newLabelInput'); existingLabelsList = document.getElementById('existingLabelsList'); settingsModal = document.getElementById('settingsModal'); modalDialogSettings = document.getElementById('modalDialogSettings'); openSettingsModalButton = document.getElementById('openSettingsModalButton'); closeSettingsModalBtn = document.getElementById('closeSettingsModalBtn'); closeSettingsSecondaryBtn = document.getElementById('closeSettingsSecondaryBtn'); settingsClearCompletedBtn = document.getElementById('settingsClearCompletedBtn'); settingsManageLabelsBtn = document.getElementById('settingsManageLabelsBtn'); settingsManageRemindersBtn = document.getElementById('settingsManageRemindersBtn'); settingsTaskReviewBtn = document.getElementById('settingsTaskReviewBtn'); settingsTooltipsGuideBtn = document.getElementById('settingsTooltipsGuideBtn'); settingsIntegrationsBtn = document.getElementById('settingsIntegrationsBtn'); settingsUserAccountsBtn = document.getElementById('settingsUserAccountsBtn'); settingsCollaborationBtn = document.getElementById('settingsCollaborationBtn'); settingsSyncBackupBtn = document.getElementById('settingsSyncBackupBtn'); taskReviewModal = document.getElementById('taskReviewModal'); modalDialogTaskReview = document.getElementById('modalDialogTaskReview'); closeTaskReviewModalBtn = document.getElementById('closeTaskReviewModalBtn'); closeTaskReviewSecondaryBtn = document.getElementById('closeTaskReviewSecondaryBtn'); taskReviewContent = document.getElementById('taskReviewContent'); tooltipsGuideModal = document.getElementById('tooltipsGuideModal'); modalDialogTooltipsGuide = document.getElementById('modalDialogTooltipsGuide'); closeTooltipsGuideModalBtn = document.getElementById('closeTooltipsGuideModalBtn'); closeTooltipsGuideSecondaryBtn = document.getElementById('closeTooltipsGuideSecondaryBtn'); tooltipsGuideContent = document.getElementById('tooltipsGuideContent'); testFeatureButtonContainer = document.getElementById('testFeatureButtonContainer'); testFeatureButton = document.getElementById('testFeatureButton'); subTasksSectionViewEdit = document.getElementById('subTasksSectionViewEdit'); modalSubTaskInputViewEdit = document.getElementById('modalSubTaskInputViewEdit'); modalAddSubTaskBtnViewEdit = document.getElementById('modalAddSubTaskBtnViewEdit'); modalSubTasksListViewEdit = document.getElementById('modalSubTasksListViewEdit'); subTasksSectionViewDetails = document.getElementById('subTasksSectionViewDetails'); viewSubTaskProgress = document.getElementById('viewSubTaskProgress'); modalSubTasksListViewDetails = document.getElementById('modalSubTasksListViewDetails'); noSubTasksMessageViewDetails = document.getElementById('noSubTasksMessageViewDetails'); subTasksSectionAdd = document.getElementById('subTasksSectionAdd'); modalSubTaskInputAdd = document.getElementById('modalSubTaskInputAdd'); modalAddSubTaskBtnAdd = document.getElementById('modalAddSubTaskBtnAdd'); modalSubTasksListAdd = document.getElementById('modalSubTasksListAdd'); featureFlagsListContainer = document.getElementById('featureFlagsListContainer'); yourTasksHeading = document.getElementById('yourTasksHeading'); kanbanBoardContainer = document.getElementById('kanbanBoardContainer'); calendarViewContainer = document.getElementById('calendarViewContainer'); pomodoroTimerPageContainer = document.getElementById('pomodoroTimerPageContainer'); settingsManageProjectsBtn = document.getElementById('settingsManageProjectsBtn'); manageProjectsModal = document.getElementById('manageProjectsModal'); modalDialogManageProjects = document.getElementById('modalDialogManageProjects'); closeManageProjectsModalBtn = document.getElementById('closeManageProjectsModalBtn'); closeManageProjectsSecondaryBtn = document.getElementById('closeManageProjectsSecondaryBtn'); addNewProjectForm = document.getElementById('addNewProjectForm'); newProjectInput = document.getElementById('newProjectInput'); existingProjectsList = document.getElementById('existingProjectsList'); modalProjectSelectAdd = document.getElementById('modalProjectSelectAdd'); modalProjectSelectViewEdit = document.getElementById('modalProjectSelectViewEdit'); projectFilterContainer = document.getElementById('projectFilterContainer'); viewTaskProject = document.getElementById('viewTaskProject'); calendarViewToggleBtn = document.getElementById('calendarViewToggleBtn'); calendarViewToggleBtnText = document.getElementById('calendarViewToggleBtnText'); taskDependenciesSectionAdd = document.getElementById('taskDependenciesSectionAdd'); dependsOnContainerAdd = document.getElementById('dependsOnContainerAdd'); blocksTasksContainerAdd = document.getElementById('blocksTasksContainerAdd'); taskDependenciesSectionViewEdit = document.getElementById('taskDependenciesSectionViewEdit'); dependsOnContainerViewEdit = document.getElementById('dependsOnContainerViewEdit'); blocksTasksContainerViewEdit = document.getElementById('blocksTasksContainerViewEdit'); viewTaskDependenciesSection = document.getElementById('viewTaskDependenciesSection'); viewTaskDependsOnList = document.getElementById('viewTaskDependsOnList'); viewTaskBlocksTasksList = document.getElementById('viewTaskBlocksTasksList'); smarterSearchContainer = document.getElementById('smarterSearchContainer'); smarterSearchAdvancedToggleBtn = document.getElementById('smarterSearchAdvancedToggleBtn'); smarterSearchOptionsDiv = document.getElementById('smarterSearchOptionsDiv'); bulkActionControlsContainer = document.getElementById('bulkActionControlsContainer'); selectAllTasksCheckbox = document.getElementById('selectAllTasksCheckbox'); bulkCompleteBtn = document.getElementById('bulkCompleteBtn'); bulkDeleteBtn = document.getElementById('bulkDeleteBtn'); bulkAssignProjectDropdown = document.getElementById('bulkAssignProjectDropdown'); bulkChangePriorityDropdown = document.getElementById('bulkChangePriorityDropdown'); bulkChangeLabelInput = document.getElementById('bulkChangeLabelInput'); pomodoroViewToggleBtn = document.getElementById('pomodoroViewToggleBtn'); pomodoroViewToggleBtnText = document.getElementById('pomodoroViewToggleBtnText'); sidebarPomodoroDisplay = document.getElementById('sidebarPomodoroTimerDisplay'); sidebarPomodoroState = document.getElementById('sidebarPomodoroState'); sidebarPomodoroTime = document.getElementById('sidebarPomodoroTime'); sidebarPomodoroTask = document.getElementById('sidebarPomodoroTask');
    console.log('[DOM Init] Finished initializing DOM elements.');
}

// --- UI Helper Functions ---
export function showMessage(message, type = 'success') { /* ... same as before ... */ }
export function populateDatalist(datalistElement) {
    if (!datalistElement || !AppStore || typeof AppStore.getUniqueLabels !== 'function') return;
    const currentUniqueLabels = AppStore.getUniqueLabels();
    datalistElement.innerHTML = '';
    currentUniqueLabels.forEach(label => { const option = document.createElement('option'); option.value = label; datalistElement.appendChild(option); });
}
export function setSidebarMinimized(minimize) { /* ... same as before, uses global DOM elements ... */ }
export function showTooltip(element, text) {
    if (!isFeatureEnabled('tooltipsGuide') || !taskSidebar || !iconTooltip || !taskSidebar.classList.contains('sidebar-minimized')) {
        if (iconTooltip && iconTooltip.style.display === 'block') hideTooltip();
        return;
    }
    iconTooltip.textContent = text;
    const rect = element.getBoundingClientRect();
    iconTooltip.style.left = `${rect.right + 10}px`;
    iconTooltip.style.top = `${rect.top + (rect.height / 2) - (iconTooltip.offsetHeight / 2)}px`;
    iconTooltip.style.display = 'block';
}
export function hideTooltip() {
    if (!iconTooltip) return;
    if (TooltipService) TooltipService.clearTooltipTimeout();
    iconTooltip.style.display = 'none';
}

// --- Task Rendering ---
export function refreshTaskView() {
    if (!mainContentArea || !ViewManager || !isFeatureEnabled) { console.error("[RefreshTaskView] Core dependencies not found."); return; }
    const currentView = ViewManager.getCurrentTaskViewMode();
    updateViewToggleButtonsState(); updateYourTasksHeading();
    if (taskList) taskList.classList.add('hidden');
    if (kanbanBoardContainer) kanbanBoardContainer.classList.add('hidden');
    if (calendarViewContainer) calendarViewContainer.classList.add('hidden');
    if (pomodoroTimerPageContainer) pomodoroTimerPageContainer.classList.add('hidden');

    if (isFeatureEnabled('pomodoroTimerHybridFeature') && currentView === 'pomodoro') {
        if (window.AppFeatures?.PomodoroTimerHybridFeature?.renderPomodoroPage) { // Access via AppFeatures for now
            if(pomodoroTimerPageContainer) pomodoroTimerPageContainer.classList.remove('hidden');
            window.AppFeatures.PomodoroTimerHybridFeature.renderPomodoroPage();
        } else { ViewManager.setTaskViewMode('list'); renderTaskListView(); }
    } else if (isFeatureEnabled('calendarViewFeature') && currentView === 'calendar') {
        if (window.AppFeatures?.CalendarViewFeature?.renderFullCalendar) { // Access via AppFeatures
            if(calendarViewContainer) calendarViewContainer.classList.remove('hidden');
            window.AppFeatures.CalendarViewFeature.renderFullCalendar(calendarViewContainer, AppStore.getTasks());
        } else { ViewManager.setTaskViewMode('list'); renderTaskListView(); }
    } else if (isFeatureEnabled('kanbanBoardFeature') && currentView === 'kanban') {
        if (window.AppFeatures?.KanbanBoardFeature?.renderKanbanView) { // Access via AppFeatures
            window.AppFeatures.KanbanBoardFeature.renderKanbanView();
        } else { ViewManager.setTaskViewMode('list'); renderTaskListView(); }
    } else { 
        if (currentView !== 'list') ViewManager.setTaskViewMode('list'); 
        renderTaskListView();
    }
    updateClearCompletedButtonState(); renderBulkActionControls();
    if (isFeatureEnabled('pomodoroTimerHybridFeature') && window.AppFeatures?.PomodoroTimerHybridFeature?.updateSidebarDisplay) {
        window.AppFeatures.PomodoroTimerHybridFeature.updateSidebarDisplay();
    }
    console.log("[UI] Task view refreshed for mode:", currentView);
}

export function renderTaskListView() {
    if (!taskList || !ViewManager || !AppStore || !isFeatureEnabled || !TaskService || !BulkActionService) { console.error("renderTaskListView: Core dependencies not found."); return; }
    // ... (rest of implementation uses imported services/AppStore getters)
    // e.g., ViewManager.getCurrentFilter(), AppStore.getTasks(), TaskService.getPriorityClass(), BulkActionService.getSelectedIds()
    // Calls to openViewTaskDetailsModal, openViewEditModal, deleteTask, toggleComplete will remain global for now
    taskList.classList.remove('hidden'); if (kanbanBoardContainer) kanbanBoardContainer.classList.add('hidden'); if (calendarViewContainer) calendarViewContainer.classList.add('hidden'); if (pomodoroTimerPageContainer) pomodoroTimerPageContainer.classList.add('hidden');
    taskList.innerHTML = ''; 
    const currentFilterVal = ViewManager.getCurrentFilter(); const currentSortVal = ViewManager.getCurrentSort(); const currentSearchTermVal = ViewManager.getCurrentSearchTerm();
    const currentTasks = AppStore.getTasks(); const currentProjects = AppStore.getProjects();
    let filteredTasks = []; const today = new Date(); today.setHours(0, 0, 0, 0);
    if (currentFilterVal === 'inbox') { filteredTasks = currentTasks.filter(task => !task.completed); }
    else if (currentFilterVal === 'today') { filteredTasks = currentTasks.filter(task => { if (!task.dueDate || task.completed) return false; const taskDueDate = new Date(task.dueDate + 'T00:00:00'); return taskDueDate.getTime() === today.getTime(); }); }
    else if (currentFilterVal === 'upcoming') { filteredTasks = currentTasks.filter(task => { if (!task.dueDate || task.completed) return false; const taskDueDate = new Date(task.dueDate + 'T00:00:00'); return taskDueDate.getTime() > today.getTime(); });}
    else if (currentFilterVal === 'completed') { filteredTasks = currentTasks.filter(task => task.completed); }
    else if (currentFilterVal.startsWith('project_')) { const projectId = parseInt(currentFilterVal.split('_')[1]); if (!isNaN(projectId)) { filteredTasks = currentTasks.filter(task => task.projectId === projectId && !task.completed); } else { filteredTasks = currentTasks.filter(task => !task.projectId && !task.completed); }}
    else { filteredTasks = currentTasks.filter(task => task.label && task.label.toLowerCase() === currentFilterVal.toLowerCase() && !task.completed); }
    if (currentSearchTermVal) { filteredTasks = filteredTasks.filter(task => task.text.toLowerCase().includes(currentSearchTermVal) || (task.label && task.label.toLowerCase().includes(currentSearchTermVal)) || (task.notes && task.notes.toLowerCase().includes(currentSearchTermVal)) || (isFeatureEnabled('projectFeature') && task.projectId && currentProjects.find(p => p.id === task.projectId)?.name.toLowerCase().includes(currentSearchTermVal)));}
    const priorityOrder = { high: 1, medium: 2, low: 3, default: 4 };
    if (currentSortVal === 'dueDate') { filteredTasks.sort((a, b) => { const dA = a.dueDate ? new Date(a.dueDate + (a.time ? `T${a.time}` : 'T00:00:00Z')) : null; const dB = b.dueDate ? new Date(b.dueDate + (b.time ? `T${b.time}` : 'T00:00:00Z')) : null; if (dA === null && dB === null) return 0; if (dA === null) return 1; if (dB === null) return -1; return dA - dB; });}
    else if (currentSortVal === 'priority') { filteredTasks.sort((a, b) => (priorityOrder[a.priority] || priorityOrder.default) - (priorityOrder[b.priority] || priorityOrder.default) || (a.dueDate && b.dueDate ? new Date(a.dueDate) - new Date(b.dueDate) : 0));}
    else if (currentSortVal === 'label') { filteredTasks.sort((a,b) => { const lA = (a.label || '').toLowerCase(); const lB = (b.label || '').toLowerCase(); if (lA < lB) return -1; if (lA > lB) return 1; const dA = a.dueDate ? new Date(a.dueDate + (a.time ? `T${a.time}` : 'T00:00:00Z')) : null; const dB = b.dueDate ? new Date(b.dueDate + (b.time ? `T${b.time}` : 'T00:00:00Z')) : null; if (dA === null && dB === null) return 0; if (dA === null) return 1; if (dB === null) return -1; return dA - dB; });}
    else if (currentFilterVal === 'inbox' && currentSortVal === 'default') { filteredTasks.sort((a, b) => (b.creationDate || b.id) - (a.creationDate || a.id));}
    if (emptyState) emptyState.classList.toggle('hidden', currentTasks.length !== 0);
    if (noMatchingTasks) noMatchingTasks.classList.toggle('hidden', !(currentTasks.length > 0 && filteredTasks.length === 0));
    if (taskList) taskList.classList.toggle('hidden', filteredTasks.length === 0 && currentTasks.length > 0);
    filteredTasks.forEach((task) => { 
        const li = document.createElement('li'); li.className = `task-item flex items-start justify-between bg-slate-100 dark:bg-slate-700 p-3 sm:p-3.5 rounded-lg shadow hover:shadow-md transition-shadow duration-300 ${task.completed ? 'opacity-60' : ''} overflow-hidden`; li.dataset.taskId = task.id;
        const hasOpenPrerequisites = isFeatureEnabled('taskDependenciesFeature') && task.dependsOn && task.dependsOn.some(depId => { const dependentTask = AppStore.getTasks().find(t => t.id === depId); return dependentTask && !dependentTask.completed; });
        if (hasOpenPrerequisites) { li.classList.add('border-l-4', 'border-amber-500'); }
        const mainContentClickableArea = document.createElement('div'); mainContentClickableArea.className = 'task-item-clickable-area flex items-start flex-grow min-w-0 mr-2 rounded-l-lg'; mainContentClickableArea.addEventListener('click', (event) => { if (event.target.type === 'checkbox' || event.target.closest('.task-actions') || event.target.closest('.bulk-select-checkbox-container')) return; if(typeof window.openViewTaskDetailsModal === 'function') window.openViewTaskDetailsModal(task.id); });
        const bulkSelectCheckboxContainer = document.createElement('div'); bulkSelectCheckboxContainer.className = 'bulk-select-checkbox-container flex-shrink-0 mr-2 sm:mr-3 bulk-actions-feature-element'; if (isFeatureEnabled('bulkActionsFeature')) { const bulkCheckbox = document.createElement('input'); bulkCheckbox.type = 'checkbox'; bulkCheckbox.className = 'form-checkbox h-5 w-5 text-blue-500 rounded border-slate-400 dark:border-slate-500 focus:ring-blue-400 dark:focus:ring-blue-500 mt-0.5 cursor-pointer'; bulkCheckbox.checked = BulkActionService.getSelectedIds().includes(task.id); bulkCheckbox.title = "Select for bulk action"; bulkCheckbox.addEventListener('change', () => { BulkActionService.toggleTaskSelection(task.id); }); bulkSelectCheckboxContainer.appendChild(bulkCheckbox); } else { bulkSelectCheckboxContainer.classList.add('hidden'); }
        const completeCheckbox = document.createElement('input'); completeCheckbox.type = 'checkbox'; completeCheckbox.checked = task.completed; completeCheckbox.className = 'form-checkbox h-5 w-5 text-sky-500 rounded border-slate-400 dark:border-slate-500 focus:ring-sky-400 dark:focus:ring-sky-500 mt-0.5 mr-2 sm:mr-3 cursor-pointer flex-shrink-0'; if (typeof window.toggleComplete === 'function') completeCheckbox.addEventListener('change', () => window.toggleComplete(task.id)); if (hasOpenPrerequisites) { completeCheckbox.disabled = true; completeCheckbox.title = "This task is blocked by incomplete prerequisites."; completeCheckbox.classList.add('opacity-50', 'cursor-not-allowed'); }
        const textDetailsDiv = document.createElement('div'); textDetailsDiv.className = 'flex flex-col flex-grow min-w-0'; const span = document.createElement('span'); span.textContent = task.text; let textColorClass = task.completed ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200'; span.className = `text-sm sm:text-base break-words ${textColorClass} ${task.completed ? 'completed-text' : ''}`; textDetailsDiv.appendChild(span);
        const detailsContainer = document.createElement('div'); detailsContainer.className = 'flex items-center flex-wrap gap-x-2 gap-y-1 mt-1 sm:mt-1.5 text-xs';
        if (isFeatureEnabled('projectFeature') && task.projectId && task.projectId !== 0) { const project = AppStore.getProjects().find(p => p.id === task.projectId); if (project) { const projSpan = document.createElement('span'); projSpan.className = 'text-purple-600 dark:text-purple-400 flex items-center project-feature-element'; projSpan.innerHTML = `<i class="fas fa-folder mr-1"></i> ${project.name}`; detailsContainer.appendChild(projSpan); }}
        if (task.priority && typeof TaskService.getPriorityClass === 'function') { const pB = document.createElement('span'); pB.textContent = task.priority; pB.className = `priority-badge ${TaskService.getPriorityClass(task.priority)}`; detailsContainer.appendChild(pB); }
        if (task.label) { const lB = document.createElement('span'); lB.textContent = task.label; lB.className = 'label-badge'; detailsContainer.appendChild(lB); }
        if (task.dueDate && typeof formatDate === 'function') { const dDS = document.createElement('span'); dDS.className = 'text-slate-500 dark:text-slate-400 flex items-center'; let dD = formatDate(task.dueDate); if (task.time && typeof formatTime === 'function') { dD += ` ${formatTime(task.time)}`; } dDS.innerHTML = `<i class="far fa-calendar-alt mr-1"></i> ${dD}`; detailsContainer.appendChild(dDS); }
        if (isFeatureEnabled('fileAttachments') && task.attachments && task.attachments.length > 0) { const aS = document.createElement('span'); aS.className = 'text-slate-500 dark:text-slate-400 flex items-center file-attachments-element'; aS.innerHTML = `<i class="fas fa-paperclip mr-1"></i> ${task.attachments.length}`; detailsContainer.appendChild(aS); }
        if (isFeatureEnabled('subTasksFeature') && task.subTasks && task.subTasks.length > 0) { const subTaskIcon = document.createElement('span'); subTaskIcon.className = 'text-slate-400 dark:text-slate-500 flex items-center sub-tasks-feature-element'; const completedSubTasks = task.subTasks.filter(st => st.completed).length; subTaskIcon.innerHTML = `<i class="fas fa-tasks mr-1" title="${completedSubTasks}/${task.subTasks.length} sub-tasks completed"></i>`; detailsContainer.appendChild(subTaskIcon); }
        if (isFeatureEnabled('taskDependenciesFeature') && ((task.dependsOn && task.dependsOn.length > 0) || (task.blocksTasks && task.blocksTasks.length > 0))) { const depIcon = document.createElement('span'); depIcon.className = 'text-slate-400 dark:text-slate-500 flex items-center task-dependencies-feature-element'; let depTitle = ''; if (task.dependsOn && task.dependsOn.length > 0) depTitle += `Depends on ${task.dependsOn.length} task(s). `; if (task.blocksTasks && task.blocksTasks.length > 0) depTitle += `Blocks ${task.blocksTasks.length} task(s).`; depIcon.innerHTML = `<i class="fas fa-link mr-1" title="${depTitle.trim()}"></i>`; detailsContainer.appendChild(depIcon); }
        if (detailsContainer.hasChildNodes()) { textDetailsDiv.appendChild(detailsContainer); }
        mainContentClickableArea.appendChild(bulkSelectCheckboxContainer); mainContentClickableArea.appendChild(completeCheckbox); mainContentClickableArea.appendChild(textDetailsDiv); 
        const actionsDiv = document.createElement('div'); actionsDiv.className = 'task-actions flex-shrink-0 self-start';
        const editButton = document.createElement('button'); editButton.className = 'task-action-btn text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-500'; editButton.innerHTML = '<i class="fas fa-pencil-alt"></i>'; editButton.setAttribute('aria-label', 'Edit task'); editButton.title = 'Edit task'; if (typeof window.openViewEditModal === 'function') editButton.addEventListener('click', () => { window.openViewEditModal(task.id); if (isFeatureEnabled('projectFeature') && window.AppFeatures?.Projects) { window.AppFeatures.Projects.populateProjectDropdowns(); if (modalProjectSelectViewEdit) { modalProjectSelectViewEdit.value = task.projectId || "0"; } } }); actionsDiv.appendChild(editButton);
        const deleteButton = document.createElement('button'); deleteButton.className = 'task-action-btn text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500'; deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'; deleteButton.setAttribute('aria-label', 'Delete task'); deleteButton.title = 'Delete task'; if (typeof window.deleteTask === 'function') deleteButton.addEventListener('click', () => window.deleteTask(task.id)); actionsDiv.appendChild(deleteButton);
        li.appendChild(mainContentClickableArea); li.appendChild(actionsDiv);
        if (taskList) { taskList.appendChild(li); }
    });
}
export function renderBulkActionControls() { /* ... same as before ... */ }
export function renderTaskDependenciesForViewModal(task) { /* ... same as before ... */ }
export function renderTempSubTasksForAddModal() { /* ... same as before ... */ }
export function renderSubTasksForEditModal(parentId, subTasksListElement) { /* ... same as before, uses ModalStateService.getEditingTaskId() ... */ }
export function renderSubTasksForViewModal(parentId, subTasksListElement, progressElement, noSubTasksMessageElement) { /* ... same as before, uses ModalStateService.getCurrentViewTaskId() ... */ }
export function updateSortButtonStates() { /* ... same as before, uses ViewManager.getCurrentSort() ... */ }
export function updateClearCompletedButtonState() { /* ... same as before, uses AppStore.getTasks() ... */ }
export function updateViewToggleButtonsState() { /* ... same as before, uses ViewManager.getCurrentTaskViewMode() and FeatureFlagService ... */ }
export function updateYourTasksHeading() { /* ... same as before, uses ViewManager, FeatureFlagService, AppStore.getProjects() ... */ }
export function styleInitialSmartViewButtons() { /* ... same as before, uses ViewManager.getCurrentFilter() ... */ }

export function initializeUiRenderingSubscriptions() {
    if (!EventBus || !ViewManager || !isFeatureEnabled) { console.error("[UI Rendering] Core dependencies for subscriptions not available."); return; }
    // ... (all subscriptions remain the same as in ui_rendering_js_refactor_05_pomodoro_event)
    EventBus.subscribe('tasksChanged', (updatedTasks) => { console.log("[UI Rendering] Event received: tasksChanged. Refreshing view."); refreshTaskView(); updateClearCompletedButtonState(); });
    EventBus.subscribe('projectsChanged', (updatedProjects) => { console.log("[UI Rendering] Event received: projectsChanged. Refreshing view."); refreshTaskView(); });
    EventBus.subscribe('uniqueProjectsChanged', (newUniqueProjects) => { console.log("[UI Rendering] Event received: uniqueProjectsChanged. Repopulating project UI."); if (window.AppFeatures?.Projects?.populateProjectFilterList) window.AppFeatures.Projects.populateProjectFilterList(); if (window.AppFeatures?.Projects?.populateProjectDropdowns) window.AppFeatures.Projects.populateProjectDropdowns(); });
    EventBus.subscribe('kanbanColumnsChanged', (updatedColumns) => { console.log("[UI Rendering] Event received: kanbanColumnsChanged."); if (ViewManager.getCurrentTaskViewMode() === 'kanban' && isFeatureEnabled('kanbanBoardFeature')) { refreshTaskView(); } });
    EventBus.subscribe('filterChanged', (eventData) => { console.log("[UI Rendering] Event received: filterChanged. Refreshing view and heading."); refreshTaskView(); updateYourTasksHeading(); updateSortButtonStates(); });
    EventBus.subscribe('sortChanged', (newSort) => { console.log("[UI Rendering] Event received: sortChanged. Refreshing view and sort buttons."); refreshTaskView(); updateSortButtonStates(); });
    EventBus.subscribe('searchTermChanged', (newSearchTerm) => { console.log("[UI Rendering] Event received: searchTermChanged. Refreshing view."); refreshTaskView(); });
    EventBus.subscribe('viewModeChanged', (newViewMode) => { console.log("[UI Rendering] Event received: viewModeChanged. Refreshing view and UI states."); refreshTaskView(); updateViewToggleButtonsState(); updateYourTasksHeading(); });
    EventBus.subscribe('featureFlagsUpdated', (updateData) => { console.log("[UI Rendering] Event received: featureFlagsUpdated. Certain UI states might need refresh."); updateViewToggleButtonsState(); });
    EventBus.subscribe('labelsChanged', (newLabels) => { console.log("[UI Rendering] Event received: labelsChanged. Populating datalists."); if(existingLabelsDatalist) populateDatalist(existingLabelsDatalist); if(existingLabelsEditDatalist) populateDatalist(existingLabelsEditDatalist); if (manageLabelsModal && !manageLabelsModal.classList.contains('hidden') && typeof populateManageLabelsList === 'function') { populateManageLabelsList(); } }); // populateManageLabelsList is global
    EventBus.subscribe('bulkSelectionChanged', (selectedIds) => { console.log("[UI Rendering] Event received: bulkSelectionChanged. Rendering controls."); renderBulkActionControls(); });
    EventBus.subscribe('pomodoroStateUpdated', (pomodoroData) => { console.log("[UI Rendering] Event received: pomodoroStateUpdated.", pomodoroData); if (window.AppFeatures?.PomodoroTimerHybridFeature?.updateSidebarDisplay) { window.AppFeatures.PomodoroTimerHybridFeature.updateSidebarDisplay(); } }); // PomodoroTimerHybridFeature is global
    console.log("[UI Rendering] Event subscriptions initialized.");
}

console.log("ui_rendering.js loaded, using imported services.");
