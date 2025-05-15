// ui_rendering.js

// --- DOM Elements (Declared as let, initialized in initializeDOMElements) ---
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

// Project Feature DOM Elements
let settingsManageProjectsBtn;
let manageProjectsModal, modalDialogManageProjects, closeManageProjectsModalBtn, closeManageProjectsSecondaryBtn;
let addNewProjectForm, newProjectInput, existingProjectsList;
let modalProjectSelectAdd, modalProjectSelectViewEdit;
let projectFilterContainer;
let viewTaskProject;

// Calendar View DOM Elements
let calendarViewToggleBtn, calendarViewToggleBtnText, calendarViewContainer;

// Task Dependencies DOM Elements
let taskDependenciesSectionAdd, dependsOnContainerAdd, blocksTasksContainerAdd;
let taskDependenciesSectionViewEdit, dependsOnContainerViewEdit, blocksTasksContainerViewEdit;
let viewTaskDependenciesSection, viewTaskDependsOnList, viewTaskBlocksTasksList;

// Smarter Search DOM Elements
let smarterSearchContainer, smarterSearchAdvancedToggleBtn, smarterSearchOptionsDiv;

// New: Bulk Actions DOM Elements
let bulkActionControlsContainer, selectAllTasksCheckbox, bulkCompleteBtn, bulkDeleteBtn;
let bulkAssignProjectDropdown, bulkChangePriorityDropdown, bulkChangeLabelInput;


/**
 * Initializes all DOM element constants.
 * This function should be called once the DOM is fully loaded.
 */
function initializeDOMElements() {
    console.log('[DOM Init] Attempting to initialize DOM elements...');

    mainContentArea = document.querySelector('main');
    kanbanViewToggleBtn = document.getElementById('kanbanViewToggleBtn');
    kanbanViewToggleBtnText = document.getElementById('kanbanViewToggleBtnText');
    smartViewButtonsContainer = document.getElementById('smartViewButtonsContainer');
    taskSidebar = document.getElementById('taskSidebar');
    sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    sidebarToggleIcon = document.getElementById('sidebarToggleIcon');
    sidebarTextElements = taskSidebar ? taskSidebar.querySelectorAll('.sidebar-text-content') : [];
    sidebarIconOnlyButtons = taskSidebar ? taskSidebar.querySelectorAll('.sidebar-button-icon-only') : [];
    iconTooltip = document.getElementById('iconTooltip');
    sortByDueDateBtn = document.getElementById('sortByDueDateBtn');
    sortByPriorityBtn = document.getElementById('sortByPriorityBtn');
    sortByLabelBtn = document.getElementById('sortByLabelBtn');
    taskSearchInput = document.getElementById('taskSearchInput');
    taskList = document.getElementById('taskList');
    emptyState = document.getElementById('emptyState');
    noMatchingTasks = document.getElementById('noMatchingTasks');
    smartViewButtons = smartViewButtonsContainer ? smartViewButtonsContainer.querySelectorAll('.smart-view-btn') : [];
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
    modalEstHoursAdd = document.getElementById('modalEstHoursAdd');
    modalEstMinutesAdd = document.getElementById('modalEstMinutesAdd');
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
    modalEstHoursViewEdit = document.getElementById('modalEstHoursViewEdit');
    modalEstMinutesViewEdit = document.getElementById('modalEstMinutesViewEdit');
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
    viewTaskEstDuration = document.getElementById('viewTaskEstDuration');
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
    taskTimerSection = document.getElementById('taskTimerSection');
    viewTaskTimerDisplay = document.getElementById('viewTaskTimerDisplay');
    viewTaskStartTimerBtn = document.getElementById('viewTaskStartTimerBtn');
    viewTaskPauseTimerBtn = document.getElementById('viewTaskPauseTimerBtn');
    viewTaskStopTimerBtn = document.getElementById('viewTaskStopTimerBtn');
    viewTaskActualDuration = document.getElementById('viewTaskActualDuration');
    timerButtonsContainer = document.getElementById('timerButtonsContainer');
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
    settingsTaskReviewBtn = document.getElementById('settingsTaskReviewBtn');
    settingsTooltipsGuideBtn = document.getElementById('settingsTooltipsGuideBtn');
    settingsIntegrationsBtn = document.getElementById('settingsIntegrationsBtn');
    settingsUserAccountsBtn = document.getElementById('settingsUserAccountsBtn');
    settingsCollaborationBtn = document.getElementById('settingsCollaborationBtn');
    settingsSyncBackupBtn = document.getElementById('settingsSyncBackupBtn');
    taskReviewModal = document.getElementById('taskReviewModal');
    modalDialogTaskReview = document.getElementById('modalDialogTaskReview');
    closeTaskReviewModalBtn = document.getElementById('closeTaskReviewModalBtn');
    closeTaskReviewSecondaryBtn = document.getElementById('closeTaskReviewSecondaryBtn');
    taskReviewContent = document.getElementById('taskReviewContent');
    tooltipsGuideModal = document.getElementById('tooltipsGuideModal');
    modalDialogTooltipsGuide = document.getElementById('modalDialogTooltipsGuide');
    closeTooltipsGuideModalBtn = document.getElementById('closeTooltipsGuideModalBtn');
    closeTooltipsGuideSecondaryBtn = document.getElementById('closeTooltipsGuideSecondaryBtn');
    tooltipsGuideContent = document.getElementById('tooltipsGuideContent');
    testFeatureButtonContainer = document.getElementById('testFeatureButtonContainer');
    testFeatureButton = document.getElementById('testFeatureButton');
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
    kanbanBoardContainer = document.getElementById('kanbanBoardContainer');

    // Initialize Project Feature Elements
    settingsManageProjectsBtn = document.getElementById('settingsManageProjectsBtn');
    manageProjectsModal = document.getElementById('manageProjectsModal');
    modalDialogManageProjects = document.getElementById('modalDialogManageProjects');
    closeManageProjectsModalBtn = document.getElementById('closeManageProjectsModalBtn');
    closeManageProjectsSecondaryBtn = document.getElementById('closeManageProjectsSecondaryBtn');
    addNewProjectForm = document.getElementById('addNewProjectForm');
    newProjectInput = document.getElementById('newProjectInput');
    existingProjectsList = document.getElementById('existingProjectsList');
    modalProjectSelectAdd = document.getElementById('modalProjectSelectAdd');
    modalProjectSelectViewEdit = document.getElementById('modalProjectSelectViewEdit');
    projectFilterContainer = document.getElementById('projectFilterContainer');
    viewTaskProject = document.getElementById('viewTaskProject');

    // Initialize Calendar View Elements
    calendarViewToggleBtn = document.getElementById('calendarViewToggleBtn');
    calendarViewToggleBtnText = document.getElementById('calendarViewToggleBtnText');
    calendarViewContainer = document.getElementById('calendarViewContainer');

    // Initialize Task Dependencies Elements
    taskDependenciesSectionAdd = document.getElementById('taskDependenciesSectionAdd');
    dependsOnContainerAdd = document.getElementById('dependsOnContainerAdd');
    blocksTasksContainerAdd = document.getElementById('blocksTasksContainerAdd');
    taskDependenciesSectionViewEdit = document.getElementById('taskDependenciesSectionViewEdit');
    dependsOnContainerViewEdit = document.getElementById('dependsOnContainerViewEdit');
    blocksTasksContainerViewEdit = document.getElementById('blocksTasksContainerViewEdit');
    viewTaskDependenciesSection = document.getElementById('viewTaskDependenciesSection');
    viewTaskDependsOnList = document.getElementById('viewTaskDependsOnList');
    viewTaskBlocksTasksList = document.getElementById('viewTaskBlocksTasksList');

    // Initialize Smarter Search DOM Elements
    smarterSearchContainer = document.getElementById('smarterSearchContainer');
    smarterSearchAdvancedToggleBtn = document.getElementById('smarterSearchAdvancedToggleBtn');
    smarterSearchOptionsDiv = document.getElementById('smarterSearchOptionsDiv');

    // New: Initialize Bulk Actions DOM Elements
    bulkActionControlsContainer = document.getElementById('bulkActionControlsContainer');
    selectAllTasksCheckbox = document.getElementById('selectAllTasksCheckbox');
    bulkCompleteBtn = document.getElementById('bulkCompleteBtn');
    bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    bulkAssignProjectDropdown = document.getElementById('bulkAssignProjectDropdown');
    bulkChangePriorityDropdown = document.getElementById('bulkChangePriorityDropdown');
    bulkChangeLabelInput = document.getElementById('bulkChangeLabelInput');


    // Add checks for newly added elements
    if (!settingsManageProjectsBtn) console.warn('[DOM Init Warning] Element "settingsManageProjectsBtn" not found.');
    // ... (other existing checks) ...
    if (!viewTaskBlocksTasksList) console.warn('[DOM Init Warning] Element "viewTaskBlocksTasksList" not found.');
    if (!smarterSearchContainer) console.warn('[DOM Init Warning] Placeholder element "smarterSearchContainer" not found.');
    if (!smarterSearchAdvancedToggleBtn) console.warn('[DOM Init Warning] Placeholder element "smarterSearchAdvancedToggleBtn" not found.');
    if (!smarterSearchOptionsDiv) console.warn('[DOM Init Warning] Placeholder element "smarterSearchOptionsDiv" not found.');

    // New: Checks for Bulk Action elements
    if (!bulkActionControlsContainer) console.warn('[DOM Init Warning] Element "bulkActionControlsContainer" not found. This is expected if HTML is not yet updated.');
    if (!selectAllTasksCheckbox) console.warn('[DOM Init Warning] Element "selectAllTasksCheckbox" not found. This is expected if HTML is not yet updated.');
    if (!bulkCompleteBtn) console.warn('[DOM Init Warning] Element "bulkCompleteBtn" not found. This is expected if HTML is not yet updated.');
    if (!bulkDeleteBtn) console.warn('[DOM Init Warning] Element "bulkDeleteBtn" not found. This is expected if HTML is not yet updated.');
    if (!bulkAssignProjectDropdown) console.warn('[DOM Init Warning] Element "bulkAssignProjectDropdown" not found. This is expected if HTML is not yet updated.');
    if (!bulkChangePriorityDropdown) console.warn('[DOM Init Warning] Element "bulkChangePriorityDropdown" not found. This is expected if HTML is not yet updated.');
    if (!bulkChangeLabelInput) console.warn('[DOM Init Warning] Element "bulkChangeLabelInput" not found. This is expected if HTML is not yet updated.');


    console.log('[DOM Init] Finished initializing DOM elements.');
}

// --- UI Helper Functions ---
function showMessage(message, type = 'success') {
    if (!messageBox) { console.warn("showMessage: messageBox not initialized."); return; }
    messageBox.textContent = message;
    messageBox.className = 'message-box';
    if (type === 'success') {
        messageBox.classList.add('bg-green-100', 'text-green-800', 'dark:bg-green-700', 'dark:text-green-100');
    } else if (type === 'error') {
        messageBox.classList.add('bg-red-100', 'text-red-800', 'dark:bg-red-700', 'dark:text-red-100');
    } else { // 'info' or default
        messageBox.classList.add('bg-sky-100', 'text-sky-800', 'dark:bg-sky-700', 'dark:text-sky-100');
    }
    messageBox.style.display = 'block';
    messageBox.style.zIndex = '200';
    setTimeout(() => {
        if(messageBox) messageBox.style.display = 'none';
    }, 3000);
}

function populateDatalist(datalistElement) {
    if (!datalistElement) return;
    datalistElement.innerHTML = '';
    uniqueLabels.forEach(label => {
        const option = document.createElement('option');
        option.value = label;
        datalistElement.appendChild(option);
    });
}

// --- Sidebar UI ---
function setSidebarMinimized(minimize) {
    if (!taskSidebar || !sidebarToggleIcon || !iconTooltip) {
        console.warn("setSidebarMinimized: One or more sidebar elements not found.");
        return;
    }
    hideTooltip();
    if (minimize) {
        taskSidebar.classList.remove('md:w-72', 'lg:w-80', 'w-full', 'p-5', 'sm:p-6', 'md:p-5', 'sm:p-4');
        taskSidebar.classList.add('w-16', 'p-3', 'sidebar-minimized');
        sidebarToggleIcon.classList.remove('fa-chevron-left');
        sidebarToggleIcon.classList.add('fa-chevron-right');
        if(sidebarTextElements) sidebarTextElements.forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.sidebar-section-title, #taskSearchInputContainer, #testFeatureButtonContainer .sidebar-text-content, #projectFilterContainer .sidebar-text-content').forEach(el => el.classList.add('hidden'));
        if(sidebarIconOnlyButtons) sidebarIconOnlyButtons.forEach(btn => {
            btn.classList.add('justify-center');
            const icon = btn.querySelector('i');
            if(icon) icon.classList.remove('md:mr-2', 'md:mr-2.5', 'ml-2');
        });
        if (projectFilterContainer) {
            projectFilterContainer.querySelectorAll('.sidebar-button-icon-only').forEach(btn => {
                btn.classList.add('justify-center');
                const icon = btn.querySelector('i');
                if(icon) icon.classList.remove('md:mr-2', 'md:mr-2.5', 'ml-2');
            });
        }
        localStorage.setItem('sidebarState', 'minimized');
    } else {
        taskSidebar.classList.remove('w-16', 'p-3', 'sidebar-minimized');
        taskSidebar.classList.add('w-full', 'md:w-72', 'lg:w-80', 'p-3', 'sm:p-4', 'md:p-5');
        sidebarToggleIcon.classList.remove('fa-chevron-right');
        sidebarToggleIcon.classList.add('fa-chevron-left');
        if(sidebarTextElements) sidebarTextElements.forEach(el => el.classList.remove('hidden'));
        document.querySelectorAll('.sidebar-section-title, #taskSearchInputContainer, #testFeatureButtonContainer .sidebar-text-content, #projectFilterContainer .sidebar-text-content').forEach(el => el.classList.remove('hidden'));

        if(sidebarIconOnlyButtons) sidebarIconOnlyButtons.forEach(btn => {
            btn.classList.remove('justify-center');
            const icon = btn.querySelector('i');
            const textSpan = btn.querySelector('.sidebar-text-content');
            if(icon && textSpan && !textSpan.classList.contains('hidden')) {
                 if (btn.id === 'openAddModalButton' || btn.id === 'openSettingsModalButton' || (testFeatureButton && btn.id === testFeatureButton.id)) {
                    icon.classList.add('md:mr-2');
                } else {
                    icon.classList.add('md:mr-2.5');
                }
                textSpan.classList.add('ml-2');
            }
        });
        if (projectFilterContainer) {
             projectFilterContainer.querySelectorAll('.sidebar-button-icon-only').forEach(btn => {
                btn.classList.remove('justify-center');
                const icon = btn.querySelector('i');
                const textSpan = btn.querySelector('.sidebar-text-content');
                 if(icon && textSpan && !textSpan.classList.contains('hidden')) {
                    icon.classList.add('md:mr-2.5');
                    textSpan.classList.add('ml-2');
                }
            });
        }
        localStorage.setItem('sidebarState', 'expanded');
    }
}


function showTooltip(element, text) {
    if (!taskSidebar || !iconTooltip || !taskSidebar.classList.contains('sidebar-minimized')) return;
    iconTooltip.textContent = text;
    const rect = element.getBoundingClientRect();
    iconTooltip.style.left = `${rect.right + 10}px`;
    iconTooltip.style.top = `${rect.top + (rect.height / 2) - (iconTooltip.offsetHeight / 2)}px`;
    iconTooltip.style.display = 'block';
}

function hideTooltip() {
    if (!iconTooltip) return;
    clearTimeout(tooltipTimeout);
    iconTooltip.style.display = 'none';
}

// --- Task Rendering ---
function refreshTaskView() {
    if (!mainContentArea) {
        console.error("[RefreshTaskView] Main content area not found. Cannot refresh task view. Attempting to re-initialize DOM elements.");
        initializeDOMElements();
        if (!mainContentArea) {
            console.error("[RefreshTaskView] Re-initialization failed. mainContentArea still not found.");
            return;
        }
    }

    updateViewToggleButtonsState();
    updateYourTasksHeading();

    if (taskList) taskList.classList.add('hidden');
    if (kanbanBoardContainer) kanbanBoardContainer.classList.add('hidden');
    else {
        const kbc = document.getElementById('kanbanBoardContainer');
        if (kbc) kbc.classList.add('hidden');
    }
    if (calendarViewContainer) calendarViewContainer.classList.add('hidden');


    if (featureFlags.calendarViewFeature && currentTaskViewMode === 'calendar') {
        renderCalendarView();
    } else if (featureFlags.kanbanBoardFeature && currentTaskViewMode === 'kanban') {
        if (window.AppFeatures && window.AppFeatures.KanbanBoard && typeof window.AppFeatures.KanbanBoard.renderKanbanView === 'function') {
            window.AppFeatures.KanbanBoard.renderKanbanView();
        } else {
            console.warn("KanbanBoard feature or renderKanbanView function not available. Defaulting to list view.");
            setTaskViewMode('list');
            renderTaskListView();
        }
    } else {
        if (currentTaskViewMode !== 'list') setTaskViewMode('list');
        renderTaskListView();
    }
    updateClearCompletedButtonState();
    renderBulkActionControls(); // New: Call to render/update bulk action controls
}

function renderTaskListView() {
    if (!mainContentArea) {
        console.error("renderTaskListView: mainContentArea is not defined.");
        return;
    }
    if (!taskList) {
        console.error("renderTaskListView: taskList element is not found. This should not happen with persistent containers.");
        taskList = document.getElementById('taskList');
        if (!taskList) {
             console.error("renderTaskListView: Critical error - taskList element cannot be found or created.");
             return;
        }
    }

    taskList.innerHTML = '';
    taskList.classList.remove('hidden');

    if (kanbanBoardContainer) kanbanBoardContainer.classList.add('hidden');
    else { const kbc = document.getElementById('kanbanBoardContainer'); if (kbc) kbc.classList.add('hidden');}
    if (calendarViewContainer) calendarViewContainer.classList.add('hidden');


    let filteredTasks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (currentFilter === 'inbox') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'today') {
        filteredTasks = tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const taskDueDate = new Date(task.dueDate + 'T00:00:00');
            return taskDueDate.getTime() === today.getTime();
        });
    } else if (currentFilter === 'upcoming') {
        filteredTasks = tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const taskDueDate = new Date(task.dueDate + 'T00:00:00');
            return taskDueDate.getTime() > today.getTime();
        });
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    } else if (currentFilter.startsWith('project_')) {
        const projectId = parseInt(currentFilter.split('_')[1]);
        if (!isNaN(projectId)) {
            filteredTasks = tasks.filter(task => task.projectId === projectId && !task.completed);
        } else {
            filteredTasks = tasks.filter(task => !task.projectId && !task.completed);
        }
    } else {
        filteredTasks = tasks.filter(task => task.label && task.label.toLowerCase() === currentFilter.toLowerCase() && !task.completed);
    }

    if (currentSearchTerm) {
            filteredTasks = filteredTasks.filter(task =>
                task.text.toLowerCase().includes(currentSearchTerm) ||
                (task.label && task.label.toLowerCase().includes(currentSearchTerm)) ||
                (task.notes && task.notes.toLowerCase().includes(currentSearchTerm)) ||
                (featureFlags.projectFeature && task.projectId && projects.find(p => p.id === task.projectId)?.name.toLowerCase().includes(currentSearchTerm))
            );
    }


    const priorityOrder = { high: 1, medium: 2, low: 3, default: 4 };
    if (currentSort === 'dueDate') {
        filteredTasks.sort((a, b) => {
            const dA = a.dueDate ? new Date(a.dueDate + (a.time ? `T${a.time}` : 'T00:00:00Z')) : null;
            const dB = b.dueDate ? new Date(b.dueDate + (b.time ? `T${b.time}` : 'T00:00:00Z')) : null;
            if (dA === null && dB === null) return 0;
            if (dA === null) return 1;
            if (dB === null) return -1;
            return dA - dB;
        });
    } else if (currentSort === 'priority') {
        filteredTasks.sort((a, b) =>
            (priorityOrder[a.priority] || priorityOrder.default) - (priorityOrder[b.priority] || priorityOrder.default) ||
            (a.dueDate && b.dueDate ? new Date(a.dueDate) - new Date(b.dueDate) : 0)
        );
    } else if (currentSort === 'label') {
        filteredTasks.sort((a,b) => {
            const lA = (a.label || '').toLowerCase();
            const lB = (b.label || '').toLowerCase();
            if (lA < lB) return -1;
            if (lA > lB) return 1;
            const dA = a.dueDate ? new Date(a.dueDate + (a.time ? `T${a.time}` : 'T00:00:00Z')) : null;
            const dB = b.dueDate ? new Date(b.dueDate + (b.time ? `T${b.time}` : 'T00:00:00Z')) : null;
            if (dA === null && dB === null) return 0;
            if (dA === null) return 1;
            if (dB === null) return -1;
            return dA - dB;
        });
    } else if (currentFilter === 'inbox' && currentSort === 'default') {
        filteredTasks.sort((a, b) => (b.creationDate || b.id) - (a.creationDate || a.id));
    }

    if (emptyState) emptyState.classList.toggle('hidden', tasks.length !== 0);
    if (noMatchingTasks) noMatchingTasks.classList.toggle('hidden', !(tasks.length > 0 && filteredTasks.length === 0));
    if (taskList) taskList.classList.toggle('hidden', filteredTasks.length === 0 && tasks.length > 0);


    filteredTasks.forEach((task) => {
        const li = document.createElement('li');
        li.className = `task-item flex items-start justify-between bg-slate-100 dark:bg-slate-700 p-3 sm:p-3.5 rounded-lg shadow hover:shadow-md transition-shadow duration-300 ${task.completed ? 'opacity-60' : ''} overflow-hidden`;
        li.dataset.taskId = task.id;

        const hasOpenPrerequisites = featureFlags.taskDependenciesFeature && task.dependsOn && task.dependsOn.some(depId => {
            const dependentTask = tasks.find(t => t.id === depId);
            return dependentTask && !dependentTask.completed;
        });

        if (hasOpenPrerequisites) {
            li.classList.add('border-l-4', 'border-amber-500');
        }

        const mainContentClickableArea = document.createElement('div');
        mainContentClickableArea.className = 'task-item-clickable-area flex items-start flex-grow min-w-0 mr-2 rounded-l-lg';
        mainContentClickableArea.addEventListener('click', (event) => {
            // Prevent opening view modal if a checkbox or action button within the item was clicked
            if (event.target.type === 'checkbox' || event.target.closest('.task-actions') || event.target.closest('.bulk-select-checkbox-container')) {
                return;
            }
            openViewTaskDetailsModal(task.id);
        });

        // New: Bulk Action Checkbox Container
        const bulkSelectCheckboxContainer = document.createElement('div');
        bulkSelectCheckboxContainer.className = 'bulk-select-checkbox-container flex-shrink-0 mr-2 sm:mr-3 bulk-actions-feature-element';
        if (featureFlags.bulkActionsFeature) {
            const bulkCheckbox = document.createElement('input');
            bulkCheckbox.type = 'checkbox';
            bulkCheckbox.className = 'form-checkbox h-5 w-5 text-blue-500 rounded border-slate-400 dark:border-slate-500 focus:ring-blue-400 dark:focus:ring-blue-500 mt-0.5 cursor-pointer';
            bulkCheckbox.checked = typeof getSelectedTaskIdsForBulkAction === 'function' && getSelectedTaskIdsForBulkAction().includes(task.id);
            bulkCheckbox.title = "Select for bulk action";
            bulkCheckbox.addEventListener('change', () => {
                if (typeof toggleTaskSelectionForBulkAction === 'function') {
                    toggleTaskSelectionForBulkAction(task.id);
                }
                // After toggling, re-render bulk action controls to update their state (e.g., enable/disable buttons)
                renderBulkActionControls();
            });
            bulkSelectCheckboxContainer.appendChild(bulkCheckbox);
        } else {
            bulkSelectCheckboxContainer.classList.add('hidden');
        }


        const completeCheckbox = document.createElement('input');
        completeCheckbox.type = 'checkbox';
        completeCheckbox.checked = task.completed;
        completeCheckbox.className = 'form-checkbox h-5 w-5 text-sky-500 rounded border-slate-400 dark:border-slate-500 focus:ring-sky-400 dark:focus:ring-sky-500 mt-0.5 mr-2 sm:mr-3 cursor-pointer flex-shrink-0';
        completeCheckbox.addEventListener('change', () => toggleComplete(task.id));

        if (hasOpenPrerequisites) {
            completeCheckbox.disabled = true;
            completeCheckbox.title = "This task is blocked by incomplete prerequisites.";
            completeCheckbox.classList.add('opacity-50', 'cursor-not-allowed');
        }


        const textDetailsDiv = document.createElement('div');
        textDetailsDiv.className = 'flex flex-col flex-grow min-w-0';

        const span = document.createElement('span');
        span.textContent = task.text;
        let textColorClass = task.completed ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200';
        span.className = `text-sm sm:text-base break-words ${textColorClass} ${task.completed ? 'completed-text' : ''}`;
        textDetailsDiv.appendChild(span);

        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'flex items-center flex-wrap gap-x-2 gap-y-1 mt-1 sm:mt-1.5 text-xs';

        if (featureFlags.projectFeature && task.projectId && task.projectId !== 0) {
            const project = projects.find(p => p.id === task.projectId);
            if (project) {
                const projSpan = document.createElement('span');
                projSpan.className = 'text-purple-600 dark:text-purple-400 flex items-center project-feature-element';
                projSpan.innerHTML = `<i class="fas fa-folder mr-1"></i> ${project.name}`;
                detailsContainer.appendChild(projSpan);
            }
        }

        if (task.priority) {
            const pB = document.createElement('span');
            pB.textContent = task.priority;
            pB.className = `priority-badge ${getPriorityClass(task.priority)}`;
            detailsContainer.appendChild(pB);
        }
        if (task.label) {
            const lB = document.createElement('span');
            lB.textContent = task.label;
            lB.className = 'label-badge';
            detailsContainer.appendChild(lB);
        }
        if (task.dueDate) {
            const dDS = document.createElement('span');
            dDS.className = 'text-slate-500 dark:text-slate-400 flex items-center';
            let dD = formatDate(task.dueDate);
            if (task.time) { dD += ` ${formatTime(task.time)}`; }
            dDS.innerHTML = `<i class="far fa-calendar-alt mr-1"></i> ${dD}`;
            detailsContainer.appendChild(dDS);
        }
        if (featureFlags.fileAttachments && task.attachments && task.attachments.length > 0) {
            const aS = document.createElement('span');
            aS.className = 'text-slate-500 dark:text-slate-400 flex items-center file-attachments-element';
            aS.innerHTML = `<i class="fas fa-paperclip mr-1"></i> ${task.attachments.length}`;
            detailsContainer.appendChild(aS);
        }
        if (featureFlags.subTasksFeature && task.subTasks && task.subTasks.length > 0) {
            const subTaskIcon = document.createElement('span');
            subTaskIcon.className = 'text-slate-400 dark:text-slate-500 flex items-center sub-tasks-feature-element';
            const completedSubTasks = task.subTasks.filter(st => st.completed).length;
            subTaskIcon.innerHTML = `<i class="fas fa-tasks mr-1" title="${completedSubTasks}/${task.subTasks.length} sub-tasks completed"></i>`;
            detailsContainer.appendChild(subTaskIcon);
        }
        if (featureFlags.taskDependenciesFeature && ((task.dependsOn && task.dependsOn.length > 0) || (task.blocksTasks && task.blocksTasks.length > 0))) {
            const depIcon = document.createElement('span');
            depIcon.className = 'text-slate-400 dark:text-slate-500 flex items-center task-dependencies-feature-element';
            let depTitle = '';
            if (task.dependsOn && task.dependsOn.length > 0) depTitle += `Depends on ${task.dependsOn.length} task(s). `;
            if (task.blocksTasks && task.blocksTasks.length > 0) depTitle += `Blocks ${task.blocksTasks.length} task(s).`;
            depIcon.innerHTML = `<i class="fas fa-link mr-1" title="${depTitle.trim()}"></i>`;
            detailsContainer.appendChild(depIcon);
        }


        if (detailsContainer.hasChildNodes()) {
            textDetailsDiv.appendChild(detailsContainer);
        }
        
        mainContentClickableArea.appendChild(bulkSelectCheckboxContainer); // Add bulk select checkbox
        mainContentClickableArea.appendChild(completeCheckbox); // Then complete checkbox
        mainContentClickableArea.appendChild(textDetailsDiv); // Then task details

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions flex-shrink-0 self-start';

        const editButton = document.createElement('button');
        editButton.className = 'task-action-btn text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-500';
        editButton.innerHTML = '<i class="fas fa-pencil-alt"></i>';
        editButton.setAttribute('aria-label', 'Edit task');
        editButton.title = 'Edit task';
        editButton.addEventListener('click', () => {
            openViewEditModal(task.id);
            if (featureFlags.projectFeature && window.AppFeatures && window.AppFeatures.Projects) {
                 window.AppFeatures.Projects.populateProjectDropdowns();
                 if (modalProjectSelectViewEdit) {
                     modalProjectSelectViewEdit.value = task.projectId || "0";
                 }
            }
        });
        actionsDiv.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'task-action-btn text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500';
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteButton.setAttribute('aria-label', 'Delete task');
        deleteButton.title = 'Delete task';
        deleteButton.addEventListener('click', () => deleteTask(task.id));
        actionsDiv.appendChild(deleteButton);

        li.appendChild(mainContentClickableArea);
        li.appendChild(actionsDiv);
        if (taskList) {
             taskList.appendChild(li);
        }
    });
}

// New: Function to render/update bulk action controls
function renderBulkActionControls() {
    if (!bulkActionControlsContainer) {
        // Attempt to get it again in case it was added to HTML after initial DOM load
        bulkActionControlsContainer = document.getElementById('bulkActionControlsContainer');
        if (!bulkActionControlsContainer) {
            // console.warn("renderBulkActionControls: bulkActionControlsContainer not found.");
            return; // Silently return if not found, as HTML might not be updated yet
        }
    }

    if (!featureFlags.bulkActionsFeature) {
        bulkActionControlsContainer.classList.add('hidden');
        return;
    }

    const selectedIds = (typeof getSelectedTaskIdsForBulkAction === 'function') ? getSelectedTaskIdsForBulkAction() : [];
    const hasSelection = selectedIds.length > 0;

    bulkActionControlsContainer.classList.toggle('hidden', !hasSelection);
    bulkActionControlsContainer.classList.add('bulk-actions-feature-element'); // Ensure it's tagged for feature flag toggling

    if (hasSelection) {
        // Update count or other info in the controls if needed
        const selectionCountSpan = bulkActionControlsContainer.querySelector('#bulkActionSelectionCount');
        if (selectionCountSpan) {
            selectionCountSpan.textContent = `${selectedIds.length} selected`;
        }

        // Enable/disable buttons based on selection (already handled by hiding container if no selection)
        if (bulkCompleteBtn) bulkCompleteBtn.disabled = !hasSelection;
        if (bulkDeleteBtn) bulkDeleteBtn.disabled = !hasSelection;
        // Add similar logic for other bulk action buttons/dropdowns if they exist
    }

    // Update "Select All" checkbox state
    if (selectAllTasksCheckbox) {
        const visibleTasksOnPage = Array.from(taskList.querySelectorAll('.task-item:not(.hidden)')) // Assuming hidden tasks are not selectable
                                       .map(item => parseInt(item.dataset.taskId));
        const allVisibleSelected = visibleTasksOnPage.length > 0 && visibleTasksOnPage.every(id => selectedIds.includes(id));
        selectAllTasksCheckbox.checked = allVisibleSelected;
        selectAllTasksCheckbox.indeterminate = !allVisibleSelected && selectedIds.some(id => visibleTasksOnPage.includes(id));
        selectAllTasksCheckbox.classList.toggle('hidden', !featureFlags.bulkActionsFeature || visibleTasksOnPage.length === 0);
    }
}


// New: Function to render task dependencies in the View Task Details Modal
function renderTaskDependenciesForViewModal(task) {
    if (!featureFlags.taskDependenciesFeature || !viewTaskDependsOnList || !viewTaskBlocksTasksList) {
        if(viewTaskDependenciesSection) viewTaskDependenciesSection.classList.add('hidden');
        return;
    }

    if(viewTaskDependenciesSection) viewTaskDependenciesSection.classList.remove('hidden');

    viewTaskDependsOnList.innerHTML = ''; 
    viewTaskBlocksTasksList.innerHTML = ''; 

    if (task.dependsOn && task.dependsOn.length > 0) {
        task.dependsOn.forEach(depId => {
            const dependentTask = tasks.find(t => t.id === depId);
            const li = document.createElement('li');
            li.textContent = dependentTask ? dependentTask.text : `Task ID: ${depId} (Not found)`;
            if (dependentTask && dependentTask.completed) {
                li.classList.add('line-through', 'text-slate-400', 'dark:text-slate-500');
            } else if (dependentTask) {
                 li.classList.add('text-amber-600', 'dark:text-amber-400'); 
            }
            viewTaskDependsOnList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'None';
        li.className = 'italic text-slate-500 dark:text-slate-400';
        viewTaskDependsOnList.appendChild(li);
    }

    if (task.blocksTasks && task.blocksTasks.length > 0) {
        task.blocksTasks.forEach(blockedId => {
            const blockedTask = tasks.find(t => t.id === blockedId);
            const li = document.createElement('li');
            li.textContent = blockedTask ? blockedTask.text : `Task ID: ${blockedId} (Not found)`;
            viewTaskBlocksTasksList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'None';
        li.className = 'italic text-slate-500 dark:text-slate-400';
        viewTaskBlocksTasksList.appendChild(li);
    }
}


function renderCalendarView() {
    if (!calendarViewContainer || !taskList) {
        console.error("renderCalendarView: Calendar container or taskList not found.");
        return;
    }
    console.log("Rendering Calendar View (placeholder)...");
    taskList.classList.add('hidden');
    const kbc = document.getElementById('kanbanBoardContainer');
    if (kbc) kbc.classList.add('hidden');
    calendarViewContainer.classList.remove('hidden');
}


function renderTempSubTasksForAddModal() {
    if (!featureFlags.subTasksFeature || !modalSubTasksListAdd) return;
    modalSubTasksListAdd.innerHTML = '';

    if (tempSubTasksForAddModal.length === 0) {
        const noSubTasksLi = document.createElement('li');
        noSubTasksLi.textContent = 'No sub-tasks added yet.';
        noSubTasksLi.className = 'text-slate-500 dark:text-slate-400 text-xs text-center py-2';
        modalSubTasksListAdd.appendChild(noSubTasksLi);
        return;
    }

    tempSubTasksForAddModal.forEach((subTask, index) => {
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md text-sm group';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = subTask.completed;
        checkbox.className = 'form-checkbox h-4 w-4 text-sky-500 rounded border-slate-400 dark:border-slate-500 focus:ring-sky-400 mr-2 cursor-pointer';
        checkbox.addEventListener('change', () => {
            tempSubTasksForAddModal[index].completed = !tempSubTasksForAddModal[index].completed;
            renderTempSubTasksForAddModal();
        });

        const textSpan = document.createElement('span');
        textSpan.textContent = subTask.text;
        textSpan.className = `flex-grow break-all ${subTask.completed ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200'}`;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'ml-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200';

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"></i>';
        deleteBtn.className = 'p-1';
        deleteBtn.title = 'Remove sub-task';
        deleteBtn.addEventListener('click', () => {
            tempSubTasksForAddModal.splice(index, 1);
            renderTempSubTasksForAddModal();
        });
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(checkbox);
        li.appendChild(textSpan);
        li.appendChild(actionsDiv);
        modalSubTasksListAdd.appendChild(li);
    });
}

function renderSubTasksForEditModal(parentId, subTasksListElement) {
    if (!featureFlags.subTasksFeature || !subTasksListElement) return;
    subTasksListElement.innerHTML = '';
    const parentTask = tasks.find(t => t.id === parentId);

    if (!parentTask || !parentTask.subTasks || parentTask.subTasks.length === 0) {
        const noSubTasksLi = document.createElement('li');
        noSubTasksLi.textContent = 'No sub-tasks yet. Add one above!';
        noSubTasksLi.className = 'text-slate-500 dark:text-slate-400 text-xs text-center py-2';
        subTasksListElement.appendChild(noSubTasksLi);
        return;
    }

    parentTask.subTasks.forEach(subTask => {
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md text-sm group';
        li.dataset.subTaskId = subTask.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = subTask.completed;
        checkbox.className = 'form-checkbox h-4 w-4 text-sky-500 rounded border-slate-400 dark:border-slate-500 focus:ring-sky-400 mr-2 cursor-pointer';
        checkbox.addEventListener('change', () => {
            if (window.AppFeatures?.SubTasks?.toggleSubTaskCompleteLogic(parentId, subTask.id)) {
                renderSubTasksForEditModal(parentId, subTasksListElement);
                if (currentViewTaskId === parentId && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) {
                    renderSubTasksForViewModal(parentId, modalSubTasksListViewDetails, viewSubTaskProgress, noSubTasksMessageViewDetails);
                }
                refreshTaskView();
            }
        });

        const textSpan = document.createElement('span');
        textSpan.textContent = subTask.text;
        textSpan.className = `flex-grow break-all ${subTask.completed ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200'}`;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'ml-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200';

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.innerHTML = '<i class="fas fa-pencil-alt text-xs text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"></i>';
        editBtn.className = 'p-1';
        editBtn.title = 'Edit sub-task';
        editBtn.addEventListener('click', () => {
            const newText = prompt('Edit sub-task:', subTask.text);
            if (newText !== null && newText.trim() !== '') {
                if (window.AppFeatures?.SubTasks?.editSubTaskLogic(parentId, subTask.id, newText.trim())) {
                    renderSubTasksForEditModal(parentId, subTasksListElement);
                    if (currentViewTaskId === parentId && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) {
                        renderSubTasksForViewModal(parentId, modalSubTasksListViewDetails, viewSubTaskProgress, noSubTasksMessageViewDetails);
                    }
                    showMessage('Sub-task updated.', 'success');
                } else {
                    showMessage('Failed to update sub-task.', 'error');
                }
            }
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"></i>';
        deleteBtn.className = 'p-1';
        deleteBtn.title = 'Delete sub-task';
        deleteBtn.addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete sub-task: "${subTask.text}"?`)) {
                if (window.AppFeatures?.SubTasks?.deleteSubTaskLogic(parentId, subTask.id)) {
                    renderSubTasksForEditModal(parentId, subTasksListElement);
                    if (currentViewTaskId === parentId && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) {
                        renderSubTasksForViewModal(parentId, modalSubTasksListViewDetails, viewSubTaskProgress, noSubTasksMessageViewDetails);
                    }
                    showMessage('Sub-task deleted.', 'success');
                    refreshTaskView();
                } else {
                    showMessage('Failed to delete sub-task.', 'error');
                }
            }
        });

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        li.appendChild(checkbox);
        li.appendChild(textSpan);
        li.appendChild(actionsDiv);
        subTasksListElement.appendChild(li);
    });
}

function renderSubTasksForViewModal(parentId, subTasksListElement, progressElement, noSubTasksMessageElement) {
    if (!featureFlags.subTasksFeature || !subTasksListElement || !progressElement || !noSubTasksMessageElement) return;
    subTasksListElement.innerHTML = '';
    const parentTask = tasks.find(t => t.id === parentId);

    if (!parentTask || !parentTask.subTasks || parentTask.subTasks.length === 0) {
        progressElement.textContent = '';
        noSubTasksMessageElement.classList.remove('hidden');
        subTasksListElement.classList.add('hidden');
        return;
    }

    noSubTasksMessageElement.classList.add('hidden');
    subTasksListElement.classList.remove('hidden');
    let completedCount = 0;

    parentTask.subTasks.forEach(subTask => {
        if (subTask.completed) completedCount++;
        const li = document.createElement('li');
        li.className = 'flex items-center text-sm group';
        li.dataset.subTaskId = subTask.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = subTask.completed;
        checkbox.className = 'form-checkbox h-4 w-4 text-sky-500 rounded border-slate-400 dark:border-slate-500 focus:ring-sky-400 mr-2 cursor-pointer flex-shrink-0';
        checkbox.addEventListener('change', () => {
            if (window.AppFeatures?.SubTasks?.toggleSubTaskCompleteLogic(parentId, subTask.id)) {
                renderSubTasksForViewModal(parentId, subTasksListElement, progressElement, noSubTasksMessageElement);
                if (editingTaskId === parentId && viewEditTaskModal && !viewEditTaskModal.classList.contains('hidden')) {
                    renderSubTasksForEditModal(parentId, modalSubTasksListViewEdit);
                }
                refreshTaskView();
            }
        });

        const textSpan = document.createElement('span');
        textSpan.textContent = subTask.text;
        textSpan.className = `flex-grow break-all ${subTask.completed ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-300'}`;

        li.appendChild(checkbox);
        li.appendChild(textSpan);
        subTasksListElement.appendChild(li);
    });
    progressElement.textContent = `${completedCount}/${parentTask.subTasks.length} completed`;
}

function updateSortButtonStates() {
    [sortByDueDateBtn, sortByPriorityBtn, sortByLabelBtn].forEach(btn => {
        if (btn) {
            let sortType = '';
            if (btn === sortByDueDateBtn) sortType = 'dueDate';
            else if (btn === sortByPriorityBtn) sortType = 'priority';
            else if (btn === sortByLabelBtn) sortType = 'label';
            btn.classList.toggle('sort-btn-active', currentSort === sortType);
        }
    });
}

function updateClearCompletedButtonState() {
    if (!settingsClearCompletedBtn) return;
    const hasCompleted = tasks.some(task => task.completed);
    settingsClearCompletedBtn.disabled = !hasCompleted;
    settingsClearCompletedBtn.classList.toggle('opacity-50', !hasCompleted);
    settingsClearCompletedBtn.classList.toggle('cursor-not-allowed', !hasCompleted);

    const activeClasses = ['bg-red-50', 'hover:bg-red-100', 'text-red-700', 'dark:bg-red-900/50', 'dark:hover:bg-red-800/70', 'dark:text-red-300'];
    const disabledClasses = ['bg-slate-100', 'text-slate-400', 'dark:bg-slate-700', 'dark:text-slate-500', 'hover:bg-slate-100', 'dark:hover:bg-slate-700'];

    if (hasCompleted) {
        settingsClearCompletedBtn.classList.remove(...disabledClasses);
        settingsClearCompletedBtn.classList.add(...activeClasses);
    } else {
        settingsClearCompletedBtn.classList.remove(...activeClasses);
        settingsClearCompletedBtn.classList.add(...disabledClasses);
    }
}

function updateViewToggleButtonsState() {
    const isKanbanActive = featureFlags.kanbanBoardFeature && currentTaskViewMode === 'kanban';
    const isCalendarActive = featureFlags.calendarViewFeature && currentTaskViewMode === 'calendar';
    const isListActive = !isKanbanActive && !isCalendarActive;

    if (kanbanViewToggleBtn && kanbanViewToggleBtnText) {
        const icon = kanbanViewToggleBtn.querySelector('i');
        kanbanViewToggleBtn.classList.toggle('hidden', !featureFlags.kanbanBoardFeature);
        if (featureFlags.kanbanBoardFeature) {
            kanbanViewToggleBtnText.textContent = isKanbanActive ? 'List' : 'Board';
            kanbanViewToggleBtn.title = isKanbanActive ? 'Switch to List View' : 'Switch to Board View';
            if (icon) {
                icon.classList.toggle('fa-columns', !isKanbanActive);
                icon.classList.toggle('fa-list-ul', isKanbanActive);
            }
            kanbanViewToggleBtn.classList.toggle('bg-purple-500', isKanbanActive);
            kanbanViewToggleBtn.classList.toggle('text-white', isKanbanActive);
            kanbanViewToggleBtn.classList.toggle('dark:bg-purple-600', isKanbanActive);
        }
    }

    if (calendarViewToggleBtn && calendarViewToggleBtnText) {
        const icon = calendarViewToggleBtn.querySelector('i');
        calendarViewToggleBtn.classList.toggle('hidden', !featureFlags.calendarViewFeature);
        if (featureFlags.calendarViewFeature) {
            calendarViewToggleBtnText.textContent = isCalendarActive ? 'List' : 'Calendar';
            calendarViewToggleBtn.title = isCalendarActive ? 'Switch to List View' : 'Switch to Calendar View';
            if (icon) {
                icon.classList.toggle('fa-calendar-week', !isCalendarActive);
                icon.classList.toggle('fa-list-ul', isCalendarActive);
            }
            calendarViewToggleBtn.classList.toggle('bg-teal-500', isCalendarActive);
            calendarViewToggleBtn.classList.toggle('text-white', isCalendarActive);
            calendarViewToggleBtn.classList.toggle('dark:bg-teal-600', isCalendarActive);
        }
    }

    const sortButtonsVisible = isListActive;
    if (sortByDueDateBtn) sortByDueDateBtn.classList.toggle('hidden', !sortButtonsVisible);
    if (sortByPriorityBtn) sortByPriorityBtn.classList.toggle('hidden', !sortButtonsVisible);
    if (sortByLabelBtn) sortByLabelBtn.classList.toggle('hidden', !sortButtonsVisible);
}


function updateYourTasksHeading() {
    if (!yourTasksHeading) {
        console.warn("updateYourTasksHeading: Heading element not found.");
        return;
    }
    if (featureFlags.calendarViewFeature && currentTaskViewMode === 'calendar') {
        yourTasksHeading.textContent = 'Calendar';
    } else if (featureFlags.kanbanBoardFeature && currentTaskViewMode === 'kanban') {
        yourTasksHeading.textContent = 'Kanban Board';
    } else if (currentFilter.startsWith('project_')) {
         const projectId = parseInt(currentFilter.split('_')[1]);
         const project = projects.find(p => p.id === projectId);
         yourTasksHeading.textContent = project ? `Project: ${project.name}` : 'Unknown Project Tasks';
    } else {
        const filterText = currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1);
        yourTasksHeading.textContent = `${filterText} Tasks`;
    }
}


function styleInitialSmartViewButtons() {
    if (smartViewButtons && smartViewButtons.length > 0) {
        smartViewButtons.forEach(button => {
            button.classList.add('bg-slate-200', 'text-slate-700', 'hover:bg-slate-300', 'dark:bg-slate-700', 'dark:text-slate-300', 'dark:hover:bg-slate-600');
            button.querySelector('i')?.classList.add('text-slate-500', 'dark:text-slate-400');
        });
        const initialActiveButton = Array.from(smartViewButtons).find(btn => btn.dataset.filter === currentFilter);
        if (initialActiveButton) {
            initialActiveButton.classList.remove('bg-slate-200', 'text-slate-700', 'hover:bg-slate-300', 'dark:bg-slate-700', 'dark:text-slate-300', 'dark:hover:bg-slate-600');
            initialActiveButton.querySelector('i')?.classList.remove('text-slate-500', 'dark:text-slate-400');
            initialActiveButton.classList.add('bg-sky-500', 'text-white', 'font-semibold', 'dark:bg-sky-600', 'dark:text-sky-50');
            initialActiveButton.querySelector('i')?.classList.add('text-sky-100', 'dark:text-sky-200');
        }
    } else {
        console.warn("styleInitialSmartViewButtons: smartViewButtons NodeList is null, empty or not yet initialized.");
    }
}

console.log("ui_rendering.js parsed. initializeDOMElements is now defined.");
