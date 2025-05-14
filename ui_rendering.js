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
let kanbanBoardContainer; // Defined here for clarity, managed by KanbanBoard feature

// New: Project Feature DOM Elements
let settingsManageProjectsBtn;
let manageProjectsModal, modalDialogManageProjects, closeManageProjectsModalBtn, closeManageProjectsSecondaryBtn;
let addNewProjectForm, newProjectInput, existingProjectsList;
let modalProjectSelectAdd, modalProjectSelectViewEdit;
let projectFilterContainer;
let viewTaskProject;

// New: Calendar View DOM Elements
let calendarViewToggleBtn, calendarViewToggleBtnText, calendarViewContainer;


/**
 * Initializes all DOM element constants.
 * This function should be called once the DOM is fully loaded.
 */
function initializeDOMElements() {
    console.log('[DOM Init] Attempting to initialize DOM elements...');

    mainContentArea = document.querySelector('main');
    kanbanViewToggleBtn = document.getElementById('kanbanViewToggleBtn');
    kanbanViewToggleBtnText = document.getElementById('kanbanViewToggleBtnText'); // Text span for Kanban button
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
    taskList = document.getElementById('taskList'); // The UL for task list view
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
    kanbanBoardContainer = document.getElementById('kanbanBoardContainer'); // This might be dynamically added by Kanban feature

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

    // New: Initialize Calendar View Elements
    calendarViewToggleBtn = document.getElementById('calendarViewToggleBtn');
    calendarViewToggleBtnText = document.getElementById('calendarViewToggleBtnText');
    calendarViewContainer = document.getElementById('calendarViewContainer');


    // Add checks for newly added elements
    if (!settingsManageProjectsBtn) console.warn('[DOM Init Warning] Element "settingsManageProjectsBtn" not found.');
    if (!manageProjectsModal) console.warn('[DOM Init Warning] Element "manageProjectsModal" not found.');
    if (!modalProjectSelectAdd) console.warn('[DOM Init Warning] Element "modalProjectSelectAdd" not found.');
    if (!modalProjectSelectViewEdit) console.warn('[DOM Init Warning] Element "modalProjectSelectViewEdit" not found.');
    if (!projectFilterContainer) console.warn('[DOM Init Warning] Element "projectFilterContainer" not found.');
    if (!viewTaskProject) console.warn('[DOM Init Warning] Element "viewTaskProject" not found.');
    if (!calendarViewToggleBtn) console.warn('[DOM Init Warning] Element "calendarViewToggleBtn" not found.');
    if (!calendarViewToggleBtnText) console.warn('[DOM Init Warning] Element "calendarViewToggleBtnText" not found.');
    if (!calendarViewContainer) console.warn('[DOM Init Warning] Element "calendarViewContainer" not found.');


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
    messageBox.style.zIndex = '200'; // Ensure it's above other content
    setTimeout(() => {
        if(messageBox) messageBox.style.display = 'none';
    }, 3000);
}

function populateDatalist(datalistElement) {
    if (!datalistElement) return;
    datalistElement.innerHTML = ''; // Clear existing options
    uniqueLabels.forEach(label => { // uniqueLabels from app_logic.js
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
        // Also hide project filter text content and other specific text elements
        document.querySelectorAll('.sidebar-section-title, #taskSearchInputContainer, #testFeatureButtonContainer .sidebar-text-content, #projectFilterContainer .sidebar-text-content').forEach(el => el.classList.add('hidden'));
        if(sidebarIconOnlyButtons) sidebarIconOnlyButtons.forEach(btn => {
            btn.classList.add('justify-center');
            const icon = btn.querySelector('i');
            if(icon) icon.classList.remove('md:mr-2', 'md:mr-2.5', 'ml-2'); // Remove specific margins
        });
         // Apply to dynamically added project buttons too
        if (projectFilterContainer) {
            projectFilterContainer.querySelectorAll('.sidebar-button-icon-only').forEach(btn => {
                btn.classList.add('justify-center');
                const icon = btn.querySelector('i');
                if(icon) icon.classList.remove('md:mr-2', 'md:mr-2.5', 'ml-2');
            });
        }
        localStorage.setItem('sidebarState', 'minimized');
    } else { // Expand sidebar
        taskSidebar.classList.remove('w-16', 'p-3', 'sidebar-minimized');
        taskSidebar.classList.add('w-full', 'md:w-72', 'lg:w-80', 'p-3', 'sm:p-4', 'md:p-5'); // Restore original padding and width
        sidebarToggleIcon.classList.remove('fa-chevron-right');
        sidebarToggleIcon.classList.add('fa-chevron-left');
        if(sidebarTextElements) sidebarTextElements.forEach(el => el.classList.remove('hidden'));
        // Show project filter text content and other specific text elements
        document.querySelectorAll('.sidebar-section-title, #taskSearchInputContainer, #testFeatureButtonContainer .sidebar-text-content, #projectFilterContainer .sidebar-text-content').forEach(el => el.classList.remove('hidden'));

        if(sidebarIconOnlyButtons) sidebarIconOnlyButtons.forEach(btn => {
            btn.classList.remove('justify-center');
            const icon = btn.querySelector('i');
            const textSpan = btn.querySelector('.sidebar-text-content');
            if(icon && textSpan && !textSpan.classList.contains('hidden')) { // Check if text is visible
                 // Adjust margin based on button type (original logic)
                 if (btn.id === 'openAddModalButton' || btn.id === 'openSettingsModalButton' || (testFeatureButton && btn.id === testFeatureButton.id)) {
                    icon.classList.add('md:mr-2');
                } else { // For smart view buttons etc.
                    icon.classList.add('md:mr-2.5');
                }
                textSpan.classList.add('ml-2'); // Ensure text has margin from icon
            }
        });
        // Apply to dynamically added project buttons too
        if (projectFilterContainer) {
             projectFilterContainer.querySelectorAll('.sidebar-button-icon-only').forEach(btn => {
                btn.classList.remove('justify-center');
                const icon = btn.querySelector('i');
                const textSpan = btn.querySelector('.sidebar-text-content');
                 if(icon && textSpan && !textSpan.classList.contains('hidden')) {
                    icon.classList.add('md:mr-2.5'); // Assuming project buttons follow this spacing
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
    iconTooltip.style.left = `${rect.right + 10}px`; // Position to the right of the icon
    iconTooltip.style.top = `${rect.top + (rect.height / 2) - (iconTooltip.offsetHeight / 2)}px`; // Vertically center
    iconTooltip.style.display = 'block';
}

function hideTooltip() {
    if (!iconTooltip) return;
    clearTimeout(tooltipTimeout); // tooltipTimeout from app_logic.js
    iconTooltip.style.display = 'none';
}

// --- Task Rendering ---
function refreshTaskView() {
    if (!mainContentArea) {
        console.error("[RefreshTaskView] Main content area not found. Cannot refresh task view. Attempting to re-initialize DOM elements.");
        initializeDOMElements(); // Try to re-initialize if mainContentArea is missing
        if (!mainContentArea) {
            console.error("[RefreshTaskView] Re-initialization failed. mainContentArea still not found.");
            return;
        }
    }

    updateViewToggleButtonsState(); // Update active state of view buttons (List, Board, Calendar)
    updateYourTasksHeading();     // Update the main heading based on current view/filter

    // Hide all view containers initially
    if (taskList) taskList.classList.add('hidden');
    if (kanbanBoardContainer) kanbanBoardContainer.classList.add('hidden'); // Kanban container might be managed by its module
    else { // If kanbanBoardContainer is not yet in DOM (e.g. first load, feature off)
        const kbc = document.getElementById('kanbanBoardContainer');
        if (kbc) kbc.classList.add('hidden');
    }
    if (calendarViewContainer) calendarViewContainer.classList.add('hidden');


    // Show the correct view container based on currentTaskViewMode and feature flags
    if (featureFlags.calendarViewFeature && currentTaskViewMode === 'calendar') {
        renderCalendarView();
    } else if (featureFlags.kanbanBoardFeature && currentTaskViewMode === 'kanban') {
        if (window.AppFeatures && window.AppFeatures.KanbanBoard && typeof window.AppFeatures.KanbanBoard.renderKanbanView === 'function') {
            // Kanban feature handles showing its own container
            window.AppFeatures.KanbanBoard.renderKanbanView();
        } else {
            console.warn("KanbanBoard feature or renderKanbanView function not available. Defaulting to list view.");
            setTaskViewMode('list'); // Fallback
            renderTaskListView();
        }
    } else { // Default to list view
        if (currentTaskViewMode !== 'list') setTaskViewMode('list'); // Ensure mode is correct if falling back
        renderTaskListView();
    }
    updateClearCompletedButtonState(); // Update "Clear Completed" button state in settings
}

function renderTaskListView() {
    if (!mainContentArea) {
        console.error("renderTaskListView: mainContentArea is not defined.");
        return;
    }
    // Ensure taskList element exists, if not (e.g. after switching from another view that removed it), recreate it.
    // However, the HTML structure now has persistent taskList and calendarViewContainer.
    // So, we just need to ensure it's visible and clear its content.
    if (!taskList) {
        console.error("renderTaskListView: taskList element is not found. This should not happen with persistent containers.");
        // As a fallback, try to get it again, but ideally, it should always be there.
        taskList = document.getElementById('taskList');
        if (!taskList) {
             console.error("renderTaskListView: Critical error - taskList element cannot be found or created.");
             return;
        }
    }

    taskList.innerHTML = ''; // Clear previous tasks
    taskList.classList.remove('hidden'); // Make sure it's visible

    // Hide other main view containers
    if (kanbanBoardContainer) kanbanBoardContainer.classList.add('hidden');
    else { const kbc = document.getElementById('kanbanBoardContainer'); if (kbc) kbc.classList.add('hidden');}
    if (calendarViewContainer) calendarViewContainer.classList.add('hidden');


    // --- Filtering Logic ---
    let filteredTasks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date

    if (currentFilter === 'inbox') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'today') {
        filteredTasks = tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            // Ensure dueDate is parsed correctly as local date for comparison
            const taskDueDate = new Date(task.dueDate + 'T00:00:00'); // Assume dueDate is YYYY-MM-DD
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
        } else { // Should ideally not happen if projects are managed correctly
            filteredTasks = tasks.filter(task => !task.projectId && !task.completed);
        }
    } else { // Assume label filter if not any of the above
        filteredTasks = tasks.filter(task => task.label && task.label.toLowerCase() === currentFilter.toLowerCase() && !task.completed);
    }

    // Apply search term if any
    if (currentSearchTerm) {
        filteredTasks = filteredTasks.filter(task =>
            task.text.toLowerCase().includes(currentSearchTerm) ||
            (task.label && task.label.toLowerCase().includes(currentSearchTerm)) ||
            (task.notes && task.notes.toLowerCase().includes(currentSearchTerm)) ||
            (featureFlags.projectFeature && task.projectId && projects.find(p => p.id === task.projectId)?.name.toLowerCase().includes(currentSearchTerm))
        );
    }

    // --- Sorting Logic ---
    const priorityOrder = { high: 1, medium: 2, low: 3, default: 4 };
    if (currentSort === 'dueDate') {
        filteredTasks.sort((a, b) => {
            const dA = a.dueDate ? new Date(a.dueDate + (a.time ? `T${a.time}` : 'T00:00:00Z')) : null;
            const dB = b.dueDate ? new Date(b.dueDate + (b.time ? `T${b.time}` : 'T00:00:00Z')) : null;
            if (dA === null && dB === null) return 0;
            if (dA === null) return 1; // Tasks without due date go to the end
            if (dB === null) return -1;
            return dA - dB;
        });
    } else if (currentSort === 'priority') {
        filteredTasks.sort((a, b) =>
            (priorityOrder[a.priority] || priorityOrder.default) - (priorityOrder[b.priority] || priorityOrder.default) ||
            // Secondary sort by due date if priorities are the same
            (a.dueDate && b.dueDate ? new Date(a.dueDate) - new Date(b.dueDate) : 0)
        );
    } else if (currentSort === 'label') {
        filteredTasks.sort((a,b) => {
            const lA = (a.label || '').toLowerCase();
            const lB = (b.label || '').toLowerCase();
            if (lA < lB) return -1;
            if (lA > lB) return 1;
            // Secondary sort by due date if labels are the same
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
    // Add other default sort logic if needed for other filters

    // --- Update Empty State Messages ---
    if (emptyState) emptyState.classList.toggle('hidden', tasks.length !== 0);
    if (noMatchingTasks) noMatchingTasks.classList.toggle('hidden', !(tasks.length > 0 && filteredTasks.length === 0));
    if (taskList) taskList.classList.toggle('hidden', filteredTasks.length === 0 && tasks.length > 0);


    // --- Render Task Items ---
    filteredTasks.forEach((task) => {
        const li = document.createElement('li');
        li.className = `task-item flex items-start justify-between bg-slate-100 dark:bg-slate-700 p-3 sm:p-3.5 rounded-lg shadow hover:shadow-md transition-shadow duration-300 ${task.completed ? 'opacity-60' : ''} overflow-hidden`;
        li.dataset.taskId = task.id;

        const mainContentClickableArea = document.createElement('div');
        mainContentClickableArea.className = 'task-item-clickable-area flex items-start flex-grow min-w-0 mr-2 rounded-l-lg'; // Ensure it's clickable
        mainContentClickableArea.addEventListener('click', (event) => {
            // Prevent opening view modal if checkbox or action buttons are clicked
            if (event.target.type === 'checkbox' || event.target.closest('.task-actions')) {
                return;
            }
            openViewTaskDetailsModal(task.id); // from modal_interactions.js
        });

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.className = 'form-checkbox h-5 w-5 text-sky-500 rounded border-slate-400 dark:border-slate-500 focus:ring-sky-400 dark:focus:ring-sky-500 mt-0.5 mr-2 sm:mr-3 cursor-pointer flex-shrink-0';
        checkbox.addEventListener('change', () => toggleComplete(task.id)); // from ui_event_handlers.js

        const textDetailsDiv = document.createElement('div');
        textDetailsDiv.className = 'flex flex-col flex-grow min-w-0'; // For text wrapping

        const span = document.createElement('span');
        span.textContent = task.text;
        let textColorClass = task.completed ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200';
        span.className = `text-sm sm:text-base break-words ${textColorClass} ${task.completed ? 'completed-text' : ''}`;
        textDetailsDiv.appendChild(span);

        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'flex items-center flex-wrap gap-x-2 gap-y-1 mt-1 sm:mt-1.5 text-xs';

        // Project Indicator
        if (featureFlags.projectFeature && task.projectId && task.projectId !== 0) {
            const project = projects.find(p => p.id === task.projectId); // projects from app_logic.js
            if (project) {
                const projSpan = document.createElement('span');
                projSpan.className = 'text-purple-600 dark:text-purple-400 flex items-center project-feature-element'; // Ensure class for hiding if feature off
                projSpan.innerHTML = `<i class="fas fa-folder mr-1"></i> ${project.name}`;
                detailsContainer.appendChild(projSpan);
            }
        }

        // Priority Badge
        if (task.priority) {
            const pB = document.createElement('span');
            pB.textContent = task.priority;
            pB.className = `priority-badge ${getPriorityClass(task.priority)}`; // getPriorityClass from app_logic.js
            detailsContainer.appendChild(pB);
        }
        // Label Badge
        if (task.label) {
            const lB = document.createElement('span');
            lB.textContent = task.label;
            lB.className = 'label-badge';
            detailsContainer.appendChild(lB);
        }
        // Due Date & Time
        if (task.dueDate) {
            const dDS = document.createElement('span');
            dDS.className = 'text-slate-500 dark:text-slate-400 flex items-center';
            let dD = formatDate(task.dueDate); // formatDate from app_logic.js
            if (task.time) { dD += ` ${formatTime(task.time)}`; } // formatTime from app_logic.js
            dDS.innerHTML = `<i class="far fa-calendar-alt mr-1"></i> ${dD}`;
            detailsContainer.appendChild(dDS);
        }
        // Attachments Indicator
        if (featureFlags.fileAttachments && task.attachments && task.attachments.length > 0) {
            const aS = document.createElement('span');
            aS.className = 'text-slate-500 dark:text-slate-400 flex items-center file-attachments-element'; // Ensure class for hiding
            aS.innerHTML = `<i class="fas fa-paperclip mr-1"></i> ${task.attachments.length}`;
            detailsContainer.appendChild(aS);
        }
        // Sub-tasks Indicator
        if (featureFlags.subTasksFeature && task.subTasks && task.subTasks.length > 0) {
            const subTaskIcon = document.createElement('span');
            subTaskIcon.className = 'text-slate-400 dark:text-slate-500 flex items-center sub-tasks-feature-element'; // Ensure class for hiding
            const completedSubTasks = task.subTasks.filter(st => st.completed).length;
            subTaskIcon.innerHTML = `<i class="fas fa-tasks mr-1" title="${completedSubTasks}/${task.subTasks.length} sub-tasks completed"></i>`;
            // Optionally add text: ` ${completedSubTasks}/${task.subTasks.length}`
            detailsContainer.appendChild(subTaskIcon);
        }


        if (detailsContainer.hasChildNodes()) {
            textDetailsDiv.appendChild(detailsContainer);
        }

        mainContentClickableArea.appendChild(checkbox);
        mainContentClickableArea.appendChild(textDetailsDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions flex-shrink-0 self-start'; // Actions aligned to the right

        const editButton = document.createElement('button');
        editButton.className = 'task-action-btn text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-500';
        editButton.innerHTML = '<i class="fas fa-pencil-alt"></i>';
        editButton.setAttribute('aria-label', 'Edit task');
        editButton.title = 'Edit task';
        editButton.addEventListener('click', () => {
            openViewEditModal(task.id); // from modal_interactions.js
            if (featureFlags.projectFeature && window.AppFeatures && window.AppFeatures.Projects) {
                 window.AppFeatures.Projects.populateProjectDropdowns();
                 if (modalProjectSelectViewEdit) { // modalProjectSelectViewEdit from this file's globals
                     modalProjectSelectViewEdit.value = task.projectId || "0"; // Default to "No Project" if undefined
                 }
            }
        });
        actionsDiv.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'task-action-btn text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500';
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteButton.setAttribute('aria-label', 'Delete task');
        deleteButton.title = 'Delete task';
        deleteButton.addEventListener('click', () => deleteTask(task.id)); // from ui_event_handlers.js
        actionsDiv.appendChild(deleteButton);

        li.appendChild(mainContentClickableArea);
        li.appendChild(actionsDiv);
        if (taskList) { // Final check
             taskList.appendChild(li);
        }
    });
}

// New: Placeholder function for rendering the Calendar View
function renderCalendarView() {
    if (!calendarViewContainer || !taskList) {
        console.error("renderCalendarView: Calendar container or taskList not found.");
        return;
    }
    console.log("Rendering Calendar View (placeholder)...");
    taskList.classList.add('hidden'); // Hide task list
    const kbc = document.getElementById('kanbanBoardContainer'); // Kanban container might be added/removed by its module
    if (kbc) kbc.classList.add('hidden'); // Hide Kanban board if it exists
    calendarViewContainer.classList.remove('hidden'); // Show calendar container

    // The actual calendar rendering logic will go into feature_calendar_view.js
    // For now, the "Coming Soon!" message from todo.html will be displayed.
    // If a dedicated calendar rendering function exists in a feature module:
    // if (window.AppFeatures?.CalendarView?.renderFullCalendar) {
    //     window.AppFeatures.CalendarView.renderFullCalendar(calendarViewContainer, tasks);
    // }
}


function renderTempSubTasksForAddModal() {
    if (!featureFlags.subTasksFeature || !modalSubTasksListAdd) return;
    modalSubTasksListAdd.innerHTML = ''; // Clear existing

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
            renderTempSubTasksForAddModal(); // Re-render this modal's list
        });

        const textSpan = document.createElement('span');
        textSpan.textContent = subTask.text;
        textSpan.className = `flex-grow break-all ${subTask.completed ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200'}`;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'ml-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200';

        // No edit for temp sub-tasks, only delete
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
    subTasksListElement.innerHTML = ''; // Clear existing
    const parentTask = tasks.find(t => t.id === parentId); // tasks from app_logic.js

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
            // Assumes toggleSubTaskCompleteLogic is globally available or part of AppFeatures.SubTasks
            if (window.AppFeatures?.SubTasks?.toggleSubTaskCompleteLogic(parentId, subTask.id)) {
                renderSubTasksForEditModal(parentId, subTasksListElement); // Re-render this modal
                // If view details modal is open for the same task, update it too
                if (currentViewTaskId === parentId && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) {
                    renderSubTasksForViewModal(parentId, modalSubTasksListViewDetails, viewSubTaskProgress, noSubTasksMessageViewDetails);
                }
                refreshTaskView(); // Update main task list if subtask progress is shown there
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
                // Assumes editSubTaskLogic is globally available or part of AppFeatures.SubTasks
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
                // Assumes deleteSubTaskLogic is globally available or part of AppFeatures.SubTasks
                if (window.AppFeatures?.SubTasks?.deleteSubTaskLogic(parentId, subTask.id)) {
                    renderSubTasksForEditModal(parentId, subTasksListElement);
                    if (currentViewTaskId === parentId && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) {
                        renderSubTasksForViewModal(parentId, modalSubTasksListViewDetails, viewSubTaskProgress, noSubTasksMessageViewDetails);
                    }
                    showMessage('Sub-task deleted.', 'success');
                    refreshTaskView(); // Update main task list
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
    subTasksListElement.innerHTML = ''; // Clear existing
    const parentTask = tasks.find(t => t.id === parentId); // tasks from app_logic.js

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
        li.className = 'flex items-center text-sm group'; // Removed justify-between to allow text to take full width after checkbox
        li.dataset.subTaskId = subTask.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = subTask.completed;
        checkbox.className = 'form-checkbox h-4 w-4 text-sky-500 rounded border-slate-400 dark:border-slate-500 focus:ring-sky-400 mr-2 cursor-pointer flex-shrink-0';
        checkbox.addEventListener('change', () => {
            // Assumes toggleSubTaskCompleteLogic is available
            if (window.AppFeatures?.SubTasks?.toggleSubTaskCompleteLogic(parentId, subTask.id)) {
                renderSubTasksForViewModal(parentId, subTasksListElement, progressElement, noSubTasksMessageElement);
                // If edit modal is open for the same task, update it too
                if (editingTaskId === parentId && viewEditTaskModal && !viewEditTaskModal.classList.contains('hidden')) {
                    renderSubTasksForEditModal(parentId, modalSubTasksListViewEdit);
                }
                refreshTaskView(); // Update main task list if subtask progress is shown there
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
            // currentSort from app_logic.js
            btn.classList.toggle('sort-btn-active', currentSort === sortType);
        }
    });
}

function updateClearCompletedButtonState() {
    if (!settingsClearCompletedBtn) return;
    const hasCompleted = tasks.some(task => task.completed); // tasks from app_logic.js
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

// Renamed from updateKanbanViewToggleButtonState
function updateViewToggleButtonsState() {
    const isKanbanActive = featureFlags.kanbanBoardFeature && currentTaskViewMode === 'kanban';
    const isCalendarActive = featureFlags.calendarViewFeature && currentTaskViewMode === 'calendar';
    const isListActive = !isKanbanActive && !isCalendarActive; // List is the default

    // Kanban Button
    if (kanbanViewToggleBtn && kanbanViewToggleBtnText) {
        const icon = kanbanViewToggleBtn.querySelector('i');
        kanbanViewToggleBtn.classList.toggle('hidden', !featureFlags.kanbanBoardFeature); // Show only if feature is on
        if (featureFlags.kanbanBoardFeature) {
            kanbanViewToggleBtnText.textContent = isKanbanActive ? 'List' : 'Board';
            kanbanViewToggleBtn.title = isKanbanActive ? 'Switch to List View' : 'Switch to Board View';
            if (icon) {
                icon.classList.toggle('fa-columns', !isKanbanActive);
                icon.classList.toggle('fa-list-ul', isKanbanActive);
            }
            kanbanViewToggleBtn.classList.toggle('bg-purple-500', isKanbanActive); // Active style
            kanbanViewToggleBtn.classList.toggle('text-white', isKanbanActive);
            kanbanViewToggleBtn.classList.toggle('dark:bg-purple-600', isKanbanActive);
        }
    }

    // Calendar Button
    if (calendarViewToggleBtn && calendarViewToggleBtnText) {
        const icon = calendarViewToggleBtn.querySelector('i');
        calendarViewToggleBtn.classList.toggle('hidden', !featureFlags.calendarViewFeature); // Show only if feature is on
        if (featureFlags.calendarViewFeature) {
            calendarViewToggleBtnText.textContent = isCalendarActive ? 'List' : 'Calendar';
            calendarViewToggleBtn.title = isCalendarActive ? 'Switch to List View' : 'Switch to Calendar View';
            if (icon) {
                icon.classList.toggle('fa-calendar-week', !isCalendarActive);
                icon.classList.toggle('fa-list-ul', isCalendarActive);
            }
            calendarViewToggleBtn.classList.toggle('bg-teal-500', isCalendarActive); // Active style
            calendarViewToggleBtn.classList.toggle('text-white', isCalendarActive);
            calendarViewToggleBtn.classList.toggle('dark:bg-teal-600', isCalendarActive);
        }
    }
    
    // Show/Hide Sort Buttons based on view
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
    // currentTaskViewMode and currentFilter from app_logic.js
    if (featureFlags.calendarViewFeature && currentTaskViewMode === 'calendar') {
        yourTasksHeading.textContent = 'Calendar';
    } else if (featureFlags.kanbanBoardFeature && currentTaskViewMode === 'kanban') {
        yourTasksHeading.textContent = 'Kanban Board';
    } else if (currentFilter.startsWith('project_')) {
         const projectId = parseInt(currentFilter.split('_')[1]);
         const project = projects.find(p => p.id === projectId); // projects from app_logic.js
         yourTasksHeading.textContent = project ? `Project: ${project.name}` : 'Unknown Project Tasks';
    } else {
        const filterText = currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1);
        yourTasksHeading.textContent = `${filterText} Tasks`;
    }
}


function styleInitialSmartViewButtons() {
    if (smartViewButtons && smartViewButtons.length > 0) {
        smartViewButtons.forEach(button => {
            // Default inactive style
            button.classList.add('bg-slate-200', 'text-slate-700', 'hover:bg-slate-300', 'dark:bg-slate-700', 'dark:text-slate-300', 'dark:hover:bg-slate-600');
            button.querySelector('i')?.classList.add('text-slate-500', 'dark:text-slate-400'); // Icon color
        });
        // Style the initially active button (e.g., 'inbox')
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
