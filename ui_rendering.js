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
let kanbanBoardContainer; // This will be the direct child of mainContentArea for Kanban view

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

// Bulk Actions DOM Elements
let bulkActionControlsContainer, selectAllTasksCheckbox, bulkCompleteBtn, bulkDeleteBtn;
let bulkAssignProjectDropdown, bulkChangePriorityDropdown, bulkChangeLabelInput;

// Pomodoro Timer Hybrid Feature DOM Elements
let pomodoroViewToggleBtn, pomodoroViewToggleBtnText;
let pomodoroTimerPageContainer; // Main container for Pomodoro page view
let sidebarPomodoroTimerDisplay, sidebarPomodoroState, sidebarPomodoroTime, sidebarPomodoroTask;


/**
 * Initializes all DOM element constants.
 * This function should be called once the DOM is fully loaded.
 */
function initializeDOMElements() {
    console.log('[DOM Init] Attempting to initialize DOM elements...');

    mainContentArea = document.querySelector('main'); // Key element for view switching
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
    taskList = document.getElementById('taskList'); // This is the UL for list view
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
    yourTasksHeading = document.getElementById('yourTasksHeading'); // Main heading for the current view
    kanbanBoardContainer = document.getElementById('kanbanBoardContainer'); // For Kanban view specifically
    calendarViewContainer = document.getElementById('calendarViewContainer'); // For Calendar view
    pomodoroTimerPageContainer = document.getElementById('pomodoroTimerPageContainer'); // For Pomodoro view

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
    // calendarViewContainer is already initialized above

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

    // Initialize Bulk Actions DOM Elements
    bulkActionControlsContainer = document.getElementById('bulkActionControlsContainer');
    selectAllTasksCheckbox = document.getElementById('selectAllTasksCheckbox');
    bulkCompleteBtn = document.getElementById('bulkCompleteBtn');
    bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    bulkAssignProjectDropdown = document.getElementById('bulkAssignProjectDropdown');
    bulkChangePriorityDropdown = document.getElementById('bulkChangePriorityDropdown');
    bulkChangeLabelInput = document.getElementById('bulkChangeLabelInput');

    // Initialize Pomodoro Timer Hybrid Feature DOM Elements
    pomodoroViewToggleBtn = document.getElementById('pomodoroViewToggleBtn');
    pomodoroViewToggleBtnText = document.getElementById('pomodoroViewToggleBtnText');
    // pomodoroTimerPageContainer is already initialized above
    sidebarPomodoroTimerDisplay = document.getElementById('sidebarPomodoroTimerDisplay');
    sidebarPomodoroState = document.getElementById('sidebarPomodoroState');
    sidebarPomodoroTime = document.getElementById('sidebarPomodoroTime');
    sidebarPomodoroTask = document.getElementById('sidebarPomodoroTask');

    console.log('[DOM Init] Finished initializing DOM elements.');
}

// --- UI Helper Functions ---
function showMessage(message, type = 'success') {
    if (!messageBox) { console.warn("showMessage: messageBox not initialized."); return; }
    messageBox.textContent = message;
    messageBox.className = 'message-box'; // Reset classes
    if (type === 'success') {
        messageBox.classList.add('bg-green-100', 'text-green-800', 'dark:bg-green-700', 'dark:text-green-100');
    } else if (type === 'error') {
        messageBox.classList.add('bg-red-100', 'text-red-800', 'dark:bg-red-700', 'dark:text-red-100');
    } else { // 'info' or default
        messageBox.classList.add('bg-sky-100', 'text-sky-800', 'dark:bg-sky-700', 'dark:text-sky-100');
    }
    messageBox.style.display = 'block';
    messageBox.style.zIndex = '200'; // Ensure it's on top
    setTimeout(() => {
        if(messageBox) messageBox.style.display = 'none';
    }, 3000);
}

function populateDatalist(datalistElement) {
    // Assumes 'uniqueLabels' is globally available from store.js
    if (!datalistElement || typeof uniqueLabels === 'undefined') return;
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
    hideTooltip(); // Hide any active tooltip
    if (minimize) {
        taskSidebar.classList.remove('md:w-72', 'lg:w-80', 'w-full', 'p-5', 'sm:p-6', 'md:p-5', 'sm:p-4');
        taskSidebar.classList.add('w-16', 'p-3', 'sidebar-minimized');
        sidebarToggleIcon.classList.remove('fa-chevron-left');
        sidebarToggleIcon.classList.add('fa-chevron-right');
        if(sidebarTextElements) sidebarTextElements.forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.sidebar-section-title, #taskSearchInputContainer, #testFeatureButtonContainer .sidebar-text-content, #projectFilterContainer .sidebar-text-content, #sidebarPomodoroTimerDisplay .sidebar-text-content').forEach(el => el.classList.add('hidden'));
        if(sidebarIconOnlyButtons) sidebarIconOnlyButtons.forEach(btn => {
            btn.classList.add('justify-center');
            const icon = btn.querySelector('i');
            if(icon) icon.classList.remove('md:mr-2', 'md:mr-2.5', 'ml-2'); // Standardize icon margin removal
        });
        if (projectFilterContainer) { // Ensure project filter buttons also adapt
            projectFilterContainer.querySelectorAll('.sidebar-button-icon-only').forEach(btn => {
                btn.classList.add('justify-center');
                const icon = btn.querySelector('i');
                if(icon) icon.classList.remove('md:mr-2', 'md:mr-2.5', 'ml-2');
            });
        }
        if (sidebarPomodoroTimerDisplay) { // Explicitly hide Pomodoro display when minimized
            sidebarPomodoroTimerDisplay.classList.add('hidden');
        }
        localStorage.setItem('sidebarState', 'minimized');
    } else { // Expanding sidebar
        taskSidebar.classList.remove('w-16', 'p-3', 'sidebar-minimized');
        taskSidebar.classList.add('w-full', 'md:w-72', 'lg:w-80', 'p-3', 'sm:p-4', 'md:p-5'); // Restore original padding
        sidebarToggleIcon.classList.remove('fa-chevron-right');
        sidebarToggleIcon.classList.add('fa-chevron-left');
        if(sidebarTextElements) sidebarTextElements.forEach(el => el.classList.remove('hidden'));
        document.querySelectorAll('.sidebar-section-title, #taskSearchInputContainer, #testFeatureButtonContainer .sidebar-text-content, #projectFilterContainer .sidebar-text-content').forEach(el => el.classList.remove('hidden'));
        // Pomodoro text content visibility is handled by its own updateSidebarDisplay logic
        if(sidebarIconOnlyButtons) sidebarIconOnlyButtons.forEach(btn => {
            btn.classList.remove('justify-center');
            const icon = btn.querySelector('i');
            const textSpan = btn.querySelector('.sidebar-text-content');
            if(icon && textSpan && !textSpan.classList.contains('hidden')) { // Only add margin if text is visible
                 icon.classList.add('md:mr-2'); // Standardize icon margin
                 textSpan.classList.add('ml-2'); // Ensure text has left margin
            }
        });
        if (projectFilterContainer) {
             projectFilterContainer.querySelectorAll('.sidebar-button-icon-only').forEach(btn => {
                btn.classList.remove('justify-center');
                const icon = btn.querySelector('i');
                const textSpan = btn.querySelector('.sidebar-text-content');
                 if(icon && textSpan && !textSpan.classList.contains('hidden')) {
                    icon.classList.add('md:mr-2');
                    textSpan.classList.add('ml-2');
                }
            });
        }
        localStorage.setItem('sidebarState', 'expanded');
        // Update Pomodoro sidebar display according to its state and if feature is enabled
        if (FeatureFlagService.isFeatureEnabled('pomodoroTimerHybridFeature') && window.AppFeatures && window.AppFeatures.PomodoroTimerHybrid && typeof window.AppFeatures.PomodoroTimerHybrid.updateSidebarDisplay === 'function') {
            window.AppFeatures.PomodoroTimerHybrid.updateSidebarDisplay();
        }
    }
}


function showTooltip(element, text) {
    // ADD THIS CHECK: Only show tooltips if the feature is enabled and sidebar is minimized
    if (typeof FeatureFlagService === 'undefined' || !FeatureFlagService.isFeatureEnabled('tooltipsGuide') || 
        !taskSidebar || !iconTooltip || !taskSidebar.classList.contains('sidebar-minimized')) {
        if (iconTooltip && iconTooltip.style.display === 'block') { // Ensure it's hidden if conditions aren't met
            hideTooltip();
        }
        return;
    }

    iconTooltip.textContent = text;
    const rect = element.getBoundingClientRect();
    iconTooltip.style.left = `${rect.right + 10}px`;
    iconTooltip.style.top = `${rect.top + (rect.height / 2) - (iconTooltip.offsetHeight / 2)}px`;
    iconTooltip.style.display = 'block';
}

function hideTooltip() {
    if (!iconTooltip) return;
    // tooltipTimeout is a global variable from store.js, used by sidebar hover in ui_event_handlers.js
    if (typeof tooltipTimeout !== 'undefined' && tooltipTimeout !== null) {
      clearTimeout(tooltipTimeout);
    }
    iconTooltip.style.display = 'none';
}

// --- Task Rendering ---
function refreshTaskView() {
    if (!mainContentArea) {
        console.error("[RefreshTaskView] Main content area not found. Attempting re-init.");
        initializeDOMElements(); // Try to re-initialize
        if (!mainContentArea) {
            console.error("[RefreshTaskView] Critical: Main content area still not found after re-init.");
            return;
        }
    }

    const currentView = ViewManager.getCurrentTaskViewMode(); // Use ViewManager

    updateViewToggleButtonsState(); // Update based on current view from ViewManager
    updateYourTasksHeading();     // Update based on current filter/view from ViewManager

    // Hide all main view containers initially
    if (taskList) taskList.classList.add('hidden');
    if (kanbanBoardContainer) kanbanBoardContainer.classList.add('hidden');
    if (calendarViewContainer) calendarViewContainer.classList.add('hidden');
    if (pomodoroTimerPageContainer) pomodoroTimerPageContainer.classList.add('hidden');

    // Show the correct view container based on currentTaskViewMode
    if (FeatureFlagService.isFeatureEnabled('pomodoroTimerHybridFeature') && currentView === 'pomodoro') {
        if (window.AppFeatures?.PomodoroTimerHybrid?.renderPomodoroPage) {
            if(pomodoroTimerPageContainer) pomodoroTimerPageContainer.classList.remove('hidden');
            window.AppFeatures.PomodoroTimerHybrid.renderPomodoroPage();
        } else {
            console.warn("PomodoroTimerHybrid feature or renderPomodoroPage function not available. Defaulting to list view.");
            ViewManager.setTaskViewMode('list'); // Fallback via ViewManager
            renderTaskListView();
        }
    } else if (FeatureFlagService.isFeatureEnabled('calendarViewFeature') && currentView === 'calendar') {
        if (window.AppFeatures?.CalendarView?.renderFullCalendar) {
            if(calendarViewContainer) calendarViewContainer.classList.remove('hidden');
            // Calendar rendering might need tasks, pass them if necessary
            window.AppFeatures.CalendarView.renderFullCalendar(calendarViewContainer, tasks);
        } else {
             console.warn("CalendarView feature or renderFullCalendar function not available. Defaulting to list view.");
             ViewManager.setTaskViewMode('list');
             renderTaskListView();
        }
    } else if (FeatureFlagService.isFeatureEnabled('kanbanBoardFeature') && currentView === 'kanban') {
        if (window.AppFeatures?.KanbanBoard?.renderKanbanView) {
            // Kanban container is handled internally by its render function
            window.AppFeatures.KanbanBoard.renderKanbanView();
        } else {
            console.warn("KanbanBoard feature or renderKanbanView function not available. Defaulting to list view.");
            ViewManager.setTaskViewMode('list');
            renderTaskListView();
        }
    } else { // Default to list view
        if (currentView !== 'list') ViewManager.setTaskViewMode('list'); // Ensure mode is correct
        renderTaskListView();
    }

    updateClearCompletedButtonState();
    renderBulkActionControls();

    // Update Pomodoro sidebar display after main view refresh
    if (FeatureFlagService.isFeatureEnabled('pomodoroTimerHybridFeature') && window.AppFeatures?.PomodoroTimerHybrid?.updateSidebarDisplay) {
        window.AppFeatures.PomodoroTimerHybrid.updateSidebarDisplay();
    }
}


function renderTaskListView() {
    if (!taskList) {
        console.error("renderTaskListView: taskList element is not found.");
        return;
    }
    // Ensure list view container is visible, and others are hidden
    taskList.classList.remove('hidden');
    if (kanbanBoardContainer) kanbanBoardContainer.classList.add('hidden');
    if (calendarViewContainer) calendarViewContainer.classList.add('hidden');
    if (pomodoroTimerPageContainer) pomodoroTimerPageContainer.classList.add('hidden');

    taskList.innerHTML = ''; // Clear previous tasks

    // Get current filter, sort, and search term using ViewManager
    const currentFilter = ViewManager.getCurrentFilter();
    const currentSort = ViewManager.getCurrentSort();
    const currentSearchTerm = ViewManager.getCurrentSearchTerm();

    // Assumes 'tasks' and 'projects' are globally available from store.js
    // Assumes 'FeatureFlagService' is globally available
    if (typeof tasks === 'undefined' || typeof projects === 'undefined' || typeof FeatureFlagService === 'undefined') {
        console.error("[RenderTaskList] Core data (tasks, projects, FeatureFlagService) not available.");
        return;
    }

    let filteredTasks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (currentFilter === 'inbox') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'today') {
        filteredTasks = tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const taskDueDate = new Date(task.dueDate + 'T00:00:00'); // Ensure consistent date comparison
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
        } else { // Should ideally not happen if project IDs are managed well
            filteredTasks = tasks.filter(task => !task.projectId && !task.completed); // Tasks with no project
        }
    } else { // Label filter
        filteredTasks = tasks.filter(task => task.label && task.label.toLowerCase() === currentFilter.toLowerCase() && !task.completed);
    }

    if (currentSearchTerm) {
        filteredTasks = filteredTasks.filter(task =>
            task.text.toLowerCase().includes(currentSearchTerm) ||
            (task.label && task.label.toLowerCase().includes(currentSearchTerm)) ||
            (task.notes && task.notes.toLowerCase().includes(currentSearchTerm)) ||
            (FeatureFlagService.isFeatureEnabled('projectFeature') && task.projectId && projects.find(p => p.id === task.projectId)?.name.toLowerCase().includes(currentSearchTerm))
        );
    }

    const priorityOrder = { high: 1, medium: 2, low: 3, default: 4 };
    if (currentSort === 'dueDate') {
        filteredTasks.sort((a, b) => {
            const dA = a.dueDate ? new Date(a.dueDate + (a.time ? `T${a.time}` : 'T00:00:00Z')) : null;
            const dB = b.dueDate ? new Date(b.dueDate + (b.time ? `T${b.time}` : 'T00:00:00Z')) : null;
            if (dA === null && dB === null) return 0;
            if (dA === null) return 1; // Tasks without due dates last
            if (dB === null) return -1;
            return dA - dB;
        });
    } else if (currentSort === 'priority') {
        filteredTasks.sort((a, b) =>
            (priorityOrder[a.priority] || priorityOrder.default) - (priorityOrder[b.priority] || priorityOrder.default) ||
            (a.dueDate && b.dueDate ? new Date(a.dueDate) - new Date(b.dueDate) : 0) // Secondary sort by due date
        );
    } else if (currentSort === 'label') {
        filteredTasks.sort((a,b) => {
            const lA = (a.label || '').toLowerCase();
            const lB = (b.label || '').toLowerCase();
            if (lA < lB) return -1;
            if (lA > lB) return 1;
            // Secondary sort by due date if labels are same
            const dA = a.dueDate ? new Date(a.dueDate + (a.time ? `T${a.time}` : 'T00:00:00Z')) : null;
            const dB = b.dueDate ? new Date(b.dueDate + (b.time ? `T${b.time}` : 'T00:00:00Z')) : null;
            if (dA === null && dB === null) return 0;
            if (dA === null) return 1;
            if (dB === null) return -1;
            return dA - dB;
        });
    } else if (currentFilter === 'inbox' && currentSort === 'default') { // Default sort for inbox: newest first
        filteredTasks.sort((a, b) => (b.creationDate || b.id) - (a.creationDate || a.id));
    }

    if (emptyState) emptyState.classList.toggle('hidden', tasks.length !== 0);
    if (noMatchingTasks) noMatchingTasks.classList.toggle('hidden', !(tasks.length > 0 && filteredTasks.length === 0));
    if (taskList) taskList.classList.toggle('hidden', filteredTasks.length === 0 && tasks.length > 0);


    filteredTasks.forEach((task) => {
        const li = document.createElement('li');
        li.className = `task-item flex items-start justify-between bg-slate-100 dark:bg-slate-700 p-3 sm:p-3.5 rounded-lg shadow hover:shadow-md transition-shadow duration-300 ${task.completed ? 'opacity-60' : ''} overflow-hidden`;
        li.dataset.taskId = task.id;

        const hasOpenPrerequisites = FeatureFlagService.isFeatureEnabled('taskDependenciesFeature') && task.dependsOn && task.dependsOn.some(depId => {
            const dependentTask = tasks.find(t => t.id === depId);
            return dependentTask && !dependentTask.completed;
        });

        if (hasOpenPrerequisites) {
            li.classList.add('border-l-4', 'border-amber-500'); // Visual cue for blocked task
        }

        const mainContentClickableArea = document.createElement('div');
        mainContentClickableArea.className = 'task-item-clickable-area flex items-start flex-grow min-w-0 mr-2 rounded-l-lg'; // Ensure clickable area is distinct
        mainContentClickableArea.addEventListener('click', (event) => {
            if (event.target.type === 'checkbox' || event.target.closest('.task-actions') || event.target.closest('.bulk-select-checkbox-container')) {
                return; // Don't open modal if clicking checkbox or action buttons
            }
            openViewTaskDetailsModal(task.id); // Assumes openViewTaskDetailsModal is global
        });

        const bulkSelectCheckboxContainer = document.createElement('div');
        bulkSelectCheckboxContainer.className = 'bulk-select-checkbox-container flex-shrink-0 mr-2 sm:mr-3 bulk-actions-feature-element';
        if (FeatureFlagService.isFeatureEnabled('bulkActionsFeature')) {
            const bulkCheckbox = document.createElement('input');
            bulkCheckbox.type = 'checkbox';
            bulkCheckbox.className = 'form-checkbox h-5 w-5 text-blue-500 rounded border-slate-400 dark:border-slate-500 focus:ring-blue-400 dark:focus:ring-blue-500 mt-0.5 cursor-pointer';
            // Use BulkActionService to get selected IDs
            bulkCheckbox.checked = BulkActionService.getSelectedIds().includes(task.id);
            bulkCheckbox.title = "Select for bulk action";
            bulkCheckbox.addEventListener('change', () => {
                // Use BulkActionService to toggle selection
                BulkActionService.toggleTaskSelection(task.id);
                renderBulkActionControls(); // Update controls UI
            });
            bulkSelectCheckboxContainer.appendChild(bulkCheckbox);
        } else {
            bulkSelectCheckboxContainer.classList.add('hidden');
        }


        const completeCheckbox = document.createElement('input');
        completeCheckbox.type = 'checkbox';
        completeCheckbox.checked = task.completed;
        completeCheckbox.className = 'form-checkbox h-5 w-5 text-sky-500 rounded border-slate-400 dark:border-slate-500 focus:ring-sky-400 dark:focus:ring-sky-500 mt-0.5 mr-2 sm:mr-3 cursor-pointer flex-shrink-0';
        completeCheckbox.addEventListener('change', () => toggleComplete(task.id)); // Assumes toggleComplete is global

        if (hasOpenPrerequisites) {
            completeCheckbox.disabled = true;
            completeCheckbox.title = "This task is blocked by incomplete prerequisites.";
            completeCheckbox.classList.add('opacity-50', 'cursor-not-allowed');
        }


        const textDetailsDiv = document.createElement('div');
        textDetailsDiv.className = 'flex flex-col flex-grow min-w-0'; // Ensure text can wrap

        const span = document.createElement('span');
        span.textContent = task.text;
        let textColorClass = task.completed ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200';
        span.className = `text-sm sm:text-base break-words ${textColorClass} ${task.completed ? 'completed-text' : ''}`;
        textDetailsDiv.appendChild(span);

        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'flex items-center flex-wrap gap-x-2 gap-y-1 mt-1 sm:mt-1.5 text-xs';

        if (FeatureFlagService.isFeatureEnabled('projectFeature') && task.projectId && task.projectId !== 0) {
            const project = projects.find(p => p.id === task.projectId);
            if (project) {
                const projSpan = document.createElement('span');
                projSpan.className = 'text-purple-600 dark:text-purple-400 flex items-center project-feature-element';
                projSpan.innerHTML = `<i class="fas fa-folder mr-1"></i> ${project.name}`;
                detailsContainer.appendChild(projSpan);
            }
        }

        // Assumes getPriorityClass is available (now from taskService.js, but globally accessible)
        if (task.priority && typeof getPriorityClass === 'function') {
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
        // Assumes formatDate and formatTime are available (from utils.js, globally accessible)
        if (task.dueDate && typeof formatDate === 'function') {
            const dDS = document.createElement('span');
            dDS.className = 'text-slate-500 dark:text-slate-400 flex items-center';
            let dD = formatDate(task.dueDate);
            if (task.time && typeof formatTime === 'function') { dD += ` ${formatTime(task.time)}`; }
            dDS.innerHTML = `<i class="far fa-calendar-alt mr-1"></i> ${dD}`;
            detailsContainer.appendChild(dDS);
        }
        if (FeatureFlagService.isFeatureEnabled('fileAttachments') && task.attachments && task.attachments.length > 0) {
            const aS = document.createElement('span');
            aS.className = 'text-slate-500 dark:text-slate-400 flex items-center file-attachments-element';
            aS.innerHTML = `<i class="fas fa-paperclip mr-1"></i> ${task.attachments.length}`;
            detailsContainer.appendChild(aS);
        }
        if (FeatureFlagService.isFeatureEnabled('subTasksFeature') && task.subTasks && task.subTasks.length > 0) {
            const subTaskIcon = document.createElement('span');
            subTaskIcon.className = 'text-slate-400 dark:text-slate-500 flex items-center sub-tasks-feature-element';
            const completedSubTasks = task.subTasks.filter(st => st.completed).length;
            subTaskIcon.innerHTML = `<i class="fas fa-tasks mr-1" title="${completedSubTasks}/${task.subTasks.length} sub-tasks completed"></i>`;
            detailsContainer.appendChild(subTaskIcon);
        }
        if (FeatureFlagService.isFeatureEnabled('taskDependenciesFeature') && ((task.dependsOn && task.dependsOn.length > 0) || (task.blocksTasks && task.blocksTasks.length > 0))) {
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
        
        mainContentClickableArea.appendChild(bulkSelectCheckboxContainer); 
        mainContentClickableArea.appendChild(completeCheckbox); 
        mainContentClickableArea.appendChild(textDetailsDiv); 

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions flex-shrink-0 self-start'; // Actions align to top

        const editButton = document.createElement('button');
        editButton.className = 'task-action-btn text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-500';
        editButton.innerHTML = '<i class="fas fa-pencil-alt"></i>';
        editButton.setAttribute('aria-label', 'Edit task');
        editButton.title = 'Edit task';
        editButton.addEventListener('click', () => {
            openViewEditModal(task.id); // Assumes openViewEditModal is global
            // Project dropdown population logic is within openViewEditModal or its callers
        });
        actionsDiv.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'task-action-btn text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500';
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteButton.setAttribute('aria-label', 'Delete task');
        deleteButton.title = 'Delete task';
        deleteButton.addEventListener('click', () => deleteTask(task.id)); // Assumes deleteTask is global
        actionsDiv.appendChild(deleteButton);

        li.appendChild(mainContentClickableArea);
        li.appendChild(actionsDiv);
        if (taskList) {
             taskList.appendChild(li);
        }
    });
}

function renderBulkActionControls() {
    if (!bulkActionControlsContainer) {
        bulkActionControlsContainer = document.getElementById('bulkActionControlsContainer');
        if (!bulkActionControlsContainer) return;
    }

    if (!FeatureFlagService.isFeatureEnabled('bulkActionsFeature')) {
        bulkActionControlsContainer.classList.add('hidden');
        return;
    }

    // Use BulkActionService to get selected IDs
    const selectedIds = BulkActionService.getSelectedIds();
    const hasSelection = selectedIds.length > 0;

    bulkActionControlsContainer.classList.toggle('hidden', !hasSelection);
    bulkActionControlsContainer.classList.add('bulk-actions-feature-element');

    if (hasSelection) {
        const selectionCountSpan = bulkActionControlsContainer.querySelector('#bulkActionSelectionCount');
        if (selectionCountSpan) {
            selectionCountSpan.textContent = `${selectedIds.length} selected`;
        }
        if (bulkCompleteBtn) bulkCompleteBtn.disabled = !hasSelection;
        if (bulkDeleteBtn) bulkDeleteBtn.disabled = !hasSelection;
        // Logic for enabling/disabling other bulk action dropdowns/inputs can be added here
        if (bulkAssignProjectDropdown) bulkAssignProjectDropdown.disabled = !hasSelection;
        if (bulkChangePriorityDropdown) bulkChangePriorityDropdown.disabled = !hasSelection;
        if (bulkChangeLabelInput) bulkChangeLabelInput.disabled = !hasSelection;
    }

    if (selectAllTasksCheckbox) {
        const currentTaskListEl = taskList || document.getElementById('taskList');
        const visibleTasksOnPage = currentTaskListEl ? Array.from(currentTaskListEl.querySelectorAll('.task-item:not(.hidden)'))
                                       .map(item => parseInt(item.dataset.taskId)) : [];
        const allVisibleSelected = visibleTasksOnPage.length > 0 && visibleTasksOnPage.every(id => selectedIds.includes(id));

        selectAllTasksCheckbox.checked = allVisibleSelected;
        selectAllTasksCheckbox.indeterminate = !allVisibleSelected && selectedIds.some(id => visibleTasksOnPage.includes(id));
        selectAllTasksCheckbox.classList.toggle('hidden', !FeatureFlagService.isFeatureEnabled('bulkActionsFeature') || visibleTasksOnPage.length === 0);
    }
}


function renderTaskDependenciesForViewModal(task) {
    // Assumes viewTaskDependsOnList, viewTaskBlocksTasksList, viewTaskDependenciesSection are global DOM elements
    // Assumes 'tasks' array is global from store.js
    // Assumes FeatureFlagService is global
    if (!FeatureFlagService.isFeatureEnabled('taskDependenciesFeature') || !viewTaskDependsOnList || !viewTaskBlocksTasksList) {
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
        viewTaskDependsOnList.innerHTML = '<li class="italic text-slate-500 dark:text-slate-400">None</li>';
    }

    if (task.blocksTasks && task.blocksTasks.length > 0) {
        task.blocksTasks.forEach(blockedId => {
            const blockedTask = tasks.find(t => t.id === blockedId);
            const li = document.createElement('li');
            li.textContent = blockedTask ? blockedTask.text : `Task ID: ${blockedId} (Not found)`;
            viewTaskBlocksTasksList.appendChild(li);
        });
    } else {
        viewTaskBlocksTasksList.innerHTML = '<li class="italic text-slate-500 dark:text-slate-400">None</li>';
    }
}

// renderCalendarView and renderPomodoroPage will be largely delegated to their feature modules.
// This file might just ensure their containers are visible/hidden.

function renderTempSubTasksForAddModal() {
    // Assumes modalSubTasksListAdd is global DOM element
    // Assumes tempSubTasksForAddModal is global (from ui_event_handlers.js for now)
    // Assumes FeatureFlagService is global
    if (!FeatureFlagService.isFeatureEnabled('subTasksFeature') || !modalSubTasksListAdd) return;
    modalSubTasksListAdd.innerHTML = '';

    if (tempSubTasksForAddModal.length === 0) {
        modalSubTasksListAdd.innerHTML = '<li class="text-slate-500 dark:text-slate-400 text-xs text-center py-2">No sub-tasks added yet.</li>';
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
            renderTempSubTasksForAddModal(); // Re-render this specific list
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
    // Assumes FeatureFlagService, tasks array are global
    // Assumes showMessage is global
    if (!FeatureFlagService.isFeatureEnabled('subTasksFeature') || !subTasksListElement) return;
    subTasksListElement.innerHTML = '';
    const parentTask = tasks.find(t => t.id === parentId);

    if (!parentTask || !parentTask.subTasks || parentTask.subTasks.length === 0) {
        subTasksListElement.innerHTML = '<li class="text-slate-500 dark:text-slate-400 text-xs text-center py-2">No sub-tasks yet. Add one above!</li>';
        return;
    }

    parentTask.subTasks.forEach(subTask => {
        const li = document.createElement('li');
        // ... (rest of the sub-task rendering, ensuring it calls AppFeatures.SubTasks for logic)
        // Example for checkbox change:
        // checkbox.addEventListener('change', () => {
        //     if (window.AppFeatures?.SubTasks?.toggleComplete(parentId, subTask.id)) { // Call service
        //         renderSubTasksForEditModal(parentId, subTasksListElement); // Re-render this list
        //         // Potentially update view modal if open
        //         if (ViewManager.getCurrentViewTaskId() === parentId && ...) {
        //            renderSubTasksForViewModal(...);
        //         }
        //         refreshTaskView(); // Refresh main task list if sub-task completion affects parent display
        //     }
        // });
        // For now, keeping the existing structure but noting where service calls should go.
        li.className = 'flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md text-sm group';
        li.dataset.subTaskId = subTask.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = subTask.completed;
        checkbox.className = 'form-checkbox h-4 w-4 text-sky-500 rounded border-slate-400 dark:border-slate-500 focus:ring-sky-400 mr-2 cursor-pointer';
        checkbox.addEventListener('change', () => {
            if (window.AppFeatures?.SubTasks?.toggleComplete(parentId, subTask.id)) {
                renderSubTasksForEditModal(parentId, subTasksListElement);
                if (currentViewTaskId === parentId && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) { // currentViewTaskId from store.js
                    renderSubTasksForViewModal(parentId, modalSubTasksListViewDetails, viewSubTaskProgress, noSubTasksMessageViewDetails);
                }
                showMessage('Sub-task status updated.', 'info'); // Provide feedback
                refreshTaskView(); // Refresh main view if subtask status affects parent task display
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
                if (window.AppFeatures?.SubTasks?.edit(parentId, subTask.id, newText.trim())) {
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
                if (window.AppFeatures?.SubTasks?.delete(parentId, subTask.id)) {
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
    // Similar to renderSubTasksForEditModal, ensure FeatureFlagService and AppFeatures.SubTasks are used
    if (!FeatureFlagService.isFeatureEnabled('subTasksFeature') || !subTasksListElement || !progressElement || !noSubTasksMessageElement) return;
    subTasksListElement.innerHTML = '';
    const parentTask = tasks.find(t => t.id === parentId); // tasks from store.js

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
        li.className = 'flex items-center text-sm group py-1'; // Added py-1 for spacing
        li.dataset.subTaskId = subTask.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = subTask.completed;
        checkbox.className = 'form-checkbox h-4 w-4 text-sky-500 rounded border-slate-400 dark:border-slate-500 focus:ring-sky-400 mr-2 cursor-pointer flex-shrink-0';
        checkbox.addEventListener('change', () => {
            if (window.AppFeatures?.SubTasks?.toggleComplete(parentId, subTask.id)) {
                renderSubTasksForViewModal(parentId, subTasksListElement, progressElement, noSubTasksMessageElement);
                // If edit modal is also open for this task, update its sub-task list
                if (editingTaskId === parentId && viewEditTaskModal && !viewEditTaskModal.classList.contains('hidden')) { // editingTaskId from store.js
                    renderSubTasksForEditModal(parentId, modalSubTasksListViewEdit);
                }
                showMessage('Sub-task status updated.', 'info');
                refreshTaskView(); // Refresh main view
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
    // Use ViewManager to get currentSort
    const currentSort = ViewManager.getCurrentSort();
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
    // Assumes 'tasks' is global from store.js
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
    // Use ViewManager and FeatureFlagService
    const currentView = ViewManager.getCurrentTaskViewMode();
    const isKanbanEnabled = FeatureFlagService.isFeatureEnabled('kanbanBoardFeature');
    const isCalendarEnabled = FeatureFlagService.isFeatureEnabled('calendarViewFeature');
    const isPomodoroEnabled = FeatureFlagService.isFeatureEnabled('pomodoroTimerHybridFeature');

    const isKanbanActive = isKanbanEnabled && currentView === 'kanban';
    const isCalendarActive = isCalendarEnabled && currentView === 'calendar';
    const isPomodoroActive = isPomodoroEnabled && currentView === 'pomodoro';
    // const isListActive = !isKanbanActive && !isCalendarActive && !isPomodoroActive; // List is the fallback

    if (kanbanViewToggleBtn && kanbanViewToggleBtnText) {
        kanbanViewToggleBtn.classList.toggle('hidden', !isKanbanEnabled);
        if (isKanbanEnabled) {
            const icon = kanbanViewToggleBtn.querySelector('i');
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
        calendarViewToggleBtn.classList.toggle('hidden', !isCalendarEnabled);
        if (isCalendarEnabled) {
            const icon = calendarViewToggleBtn.querySelector('i');
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
    
    if (pomodoroViewToggleBtn && pomodoroViewToggleBtnText) {
        pomodoroViewToggleBtn.classList.toggle('hidden', !isPomodoroEnabled);
        if (isPomodoroEnabled) {
            const icon = pomodoroViewToggleBtn.querySelector('i');
            pomodoroViewToggleBtnText.textContent = isPomodoroActive ? 'List' : 'Pomodoro';
            pomodoroViewToggleBtn.title = isPomodoroActive ? 'Switch to List View' : 'Switch to Pomodoro View';
            if (icon) {
                icon.classList.toggle('fa-stopwatch', !isPomodoroActive);
                icon.classList.toggle('fa-list-ul', isPomodoroActive);
            }
            pomodoroViewToggleBtn.classList.toggle('bg-rose-500', isPomodoroActive);
            pomodoroViewToggleBtn.classList.toggle('text-white', isPomodoroActive);
            pomodoroViewToggleBtn.classList.toggle('dark:bg-rose-600', isPomodoroActive);
        }
    }

    // Sort buttons are only relevant for list view
    const sortButtonsVisible = currentView === 'list';
    if (sortByDueDateBtn) sortByDueDateBtn.classList.toggle('hidden', !sortButtonsVisible);
    if (sortByPriorityBtn) sortByPriorityBtn.classList.toggle('hidden', !sortButtonsVisible);
    if (sortByLabelBtn) sortByLabelBtn.classList.toggle('hidden', !sortButtonsVisible);
}


function updateYourTasksHeading() {
    if (!yourTasksHeading) {
        console.warn("updateYourTasksHeading: Heading element not found.");
        return;
    }
    // Use ViewManager and FeatureFlagService
    const currentView = ViewManager.getCurrentTaskViewMode();
    const currentFilter = ViewManager.getCurrentFilter(); // Get filter from ViewManager

    if (FeatureFlagService.isFeatureEnabled('pomodoroTimerHybridFeature') && currentView === 'pomodoro') {
        yourTasksHeading.textContent = 'Pomodoro Timer';
    } else if (FeatureFlagService.isFeatureEnabled('calendarViewFeature') && currentView === 'calendar') {
        yourTasksHeading.textContent = 'Calendar';
    } else if (FeatureFlagService.isFeatureEnabled('kanbanBoardFeature') && currentView === 'kanban') {
        yourTasksHeading.textContent = 'Kanban Board';
    } else if (currentFilter.startsWith('project_')) {
         const projectId = parseInt(currentFilter.split('_')[1]);
         // Assumes 'projects' is global from store.js
         const project = projects.find(p => p.id === projectId);
         yourTasksHeading.textContent = project ? `Project: ${project.name}` : 'Unknown Project Tasks';
    } else { // List view with standard filters
        const filterText = currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1);
        yourTasksHeading.textContent = `${filterText} Tasks`;
    }
}


function styleInitialSmartViewButtons() {
    // Use ViewManager
    const currentFilter = ViewManager.getCurrentFilter();
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

// console.log("ui_rendering.js parsed. initializeDOMElements is now defined.");
