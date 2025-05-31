// ui_rendering.js
// Handles all direct DOM manipulation for rendering UI components and task lists.
// Now an ES6 module.

import AppStore from './store.js';
import ViewManager from './viewManager.js';
import { isFeatureEnabled } from './featureFlagService.js';
// NEW: Import getAppVersionString from VersionService
import { getAppVersionString } from './versionService.js';
import * as TaskService from './taskService.js';
import * as BulkActionService from './bulkActionService.js';
import ModalStateService from './modalStateService.js';
import TooltipService from './tooltipService.js';
import EventBus from './eventBus.js'; // EventBus is key for this change
import { formatDate, formatTime, formatDuration, formatMillisecondsToHMS } from './utils.js';

// Import functions from other UI modules
import {
    openViewTaskDetailsModal,
    openViewEditModal,
    populateManageLabelsList
} from './modal_interactions.js';

// REMOVED: toggleComplete and deleteTask imports from ui_event_handlers.js
// import {
//     toggleComplete,
//     deleteTask
// } from './ui_event_handlers.js';

// Import Feature Modules needed for direct calls
import { ProjectsFeature } from './feature_projects.js';
import { KanbanBoardFeature } from './feature_kanban_board.js';
import { CalendarViewFeature } from './feature_calendar_view.js';
import { PomodoroTimerHybridFeature } from './pomodoro_timer.js';
import { SubTasksFeature } from './feature_sub_tasks.js';
// NEW: Import DataVersioningFeature to potentially use its functions if needed here, though likely called from modal_interactions
// For now, we primarily need its output (version history) to render.
// import { DataVersioningFeature } from './feature_data_versioning.js';


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
let kanbanViewToggleBtn, kanbanViewToggleBtnText, calendarViewToggleBtn, calendarViewToggleBtnText, pomodoroViewToggleBtn, pomodoroViewToggleBtnText;
let yourTasksHeading, mainContentArea;
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
let sidebarPomodoroDisplay, sidebarPomodoroState, sidebarPomodoroTime, sidebarPomodoroTask;

// NEW: DOM Elements for Critical Error Display
let criticalErrorDisplay, criticalErrorMessage, criticalErrorId, closeCriticalErrorBtn;

// NEW: DOM Elements for Contact Us Modal
let settingsContactUsBtn; // Button in settings modal
let contactUsModal, modalDialogContactUs, closeContactUsModalBtn, closeContactUsSecondaryBtn, contactUsForm;

// ADDED: DOM Elements for About Us Modal
let settingsAboutUsBtn; // Button in settings modal
let aboutUsModal, modalDialogAboutUs, closeAboutUsModalBtn, closeAboutUsSecondaryBtn, aboutUsContent;

// NEW: DOM Elements for Data Version History Modal
let settingsVersionHistoryBtn; // Button in settings modal
let dataVersionHistoryModal, modalDialogDataVersionHistory, closeDataVersionHistoryModalBtn, closeDataVersionHistorySecondaryBtn;
let dataVersionHistoryContent;

// NEW: DOM element references for app version display
let appVersionFooterEl;
let appVersionAboutUsDisplayEl;


export function initializeDOMElements() {
    // ... (all existing querySelectors from your original file)
    console.log('[DOM Init] Attempting to initialize DOM elements...'); //
    mainContentArea = document.querySelector('main'); kanbanViewToggleBtn = document.getElementById('kanbanViewToggleBtn'); kanbanViewToggleBtnText = document.getElementById('kanbanViewToggleBtnText'); smartViewButtonsContainer = document.getElementById('smartViewButtonsContainer'); taskSidebar = document.getElementById('taskSidebar'); sidebarToggleBtn = document.getElementById('sidebarToggleBtn'); sidebarToggleIcon = document.getElementById('sidebarToggleIcon'); sidebarTextElements = taskSidebar ? taskSidebar.querySelectorAll('.sidebar-text-content') : []; sidebarIconOnlyButtons = taskSidebar ? taskSidebar.querySelectorAll('.sidebar-button-icon-only') : []; iconTooltip = document.getElementById('iconTooltip'); sortByDueDateBtn = document.getElementById('sortByDueDateBtn'); sortByPriorityBtn = document.getElementById('sortByPriorityBtn'); sortByLabelBtn = document.getElementById('sortByLabelBtn'); taskSearchInput = document.getElementById('taskSearchInput'); taskList = document.getElementById('taskList'); emptyState = document.getElementById('emptyState'); noMatchingTasks = document.getElementById('noMatchingTasks'); messageBox = document.getElementById('messageBox'); addTaskModal = document.getElementById('addTaskModal'); modalDialogAdd = document.getElementById('modalDialogAdd'); openAddModalButton = document.getElementById('openAddModalButton'); closeAddModalBtn = document.getElementById('closeAddModalBtn'); cancelAddModalBtn = document.getElementById('cancelAddModalBtn'); modalTodoFormAdd = document.getElementById('modalTodoFormAdd'); modalTaskInputAdd = document.getElementById('modalTaskInputAdd'); modalDueDateInputAdd = document.getElementById('modalDueDateInputAdd'); modalTimeInputAdd = document.getElementById('modalTimeInputAdd'); modalEstHoursAdd = document.getElementById('modalEstHoursAdd'); modalEstMinutesAdd = document.getElementById('modalEstMinutesAdd'); modalPriorityInputAdd = document.getElementById('modalPriorityInputAdd'); modalLabelInputAdd = document.getElementById('modalLabelInputAdd'); existingLabelsDatalist = document.getElementById('existingLabels'); modalNotesInputAdd = document.getElementById('modalNotesInputAdd'); modalRemindMeAddContainer = document.getElementById('modalRemindMeAddContainer'); modalRemindMeAdd = document.getElementById('modalRemindMeAdd'); reminderOptionsAdd = document.getElementById('reminderOptionsAdd'); modalReminderDateAdd = document.getElementById('modalReminderDateAdd'); modalReminderTimeAdd = document.getElementById('modalReminderTimeAdd'); modalReminderEmailAdd = document.getElementById('modalReminderEmailAdd'); viewEditTaskModal = document.getElementById('viewEditTaskModal'); modalDialogViewEdit = document.getElementById('modalDialogViewEdit'); closeViewEditModalBtn = document.getElementById('closeViewEditModalBtn'); cancelViewEditModalBtn = document.getElementById('cancelViewEditModalBtn'); modalTodoFormViewEdit = document.getElementById('modalTodoFormViewEdit'); modalViewEditTaskId = document.getElementById('modalViewEditTaskId'); modalTaskInputViewEdit = document.getElementById('modalTaskInputViewEdit'); modalDueDateInputViewEdit = document.getElementById('modalDueDateInputViewEdit'); modalTimeInputViewEdit = document.getElementById('modalTimeInputViewEdit'); modalEstHoursViewEdit = document.getElementById('modalEstHoursViewEdit'); modalEstMinutesViewEdit = document.getElementById('modalEstMinutesViewEdit'); modalPriorityInputViewEdit = document.getElementById('modalPriorityInputViewEdit'); modalLabelInputViewEdit = document.getElementById('modalLabelInputViewEdit'); existingLabelsEditDatalist = document.getElementById('existingLabelsEdit'); modalNotesInputViewEdit = document.getElementById('modalNotesInputViewEdit'); modalRemindMeViewEditContainer = document.getElementById('modalRemindMeViewEditContainer'); modalRemindMeViewEdit = document.getElementById('modalRemindMeViewEdit'); reminderOptionsViewEdit = document.getElementById('reminderOptionsViewEdit'); modalReminderDateViewEdit = document.getElementById('modalReminderDateViewEdit'); modalReminderTimeViewEdit = document.getElementById('modalReminderTimeViewEdit'); modalReminderEmailViewEdit = document.getElementById('modalReminderEmailViewEdit'); existingAttachmentsViewEdit = document.getElementById('existingAttachmentsViewEdit'); viewTaskDetailsModal = document.getElementById('viewTaskDetailsModal'); modalDialogViewDetails = document.getElementById('modalDialogViewDetails'); closeViewDetailsModalBtn = document.getElementById('closeViewDetailsModalBtn'); closeViewDetailsSecondaryBtn = document.getElementById('closeViewDetailsSecondaryBtn'); editFromViewModalBtn = document.getElementById('editFromViewModalBtn'); deleteFromViewModalBtn = document.getElementById('deleteFromViewModalBtn'); viewTaskText = document.getElementById('viewTaskText'); viewTaskDueDate = document.getElementById('viewTaskDueDate'); viewTaskTime = document.getElementById('viewTaskTime'); viewTaskEstDuration = document.getElementById('viewTaskEstDuration'); viewTaskPriority = document.getElementById('viewTaskPriority'); viewTaskStatus = document.getElementById('viewTaskStatus'); viewTaskLabel = document.getElementById('viewTaskLabel'); viewTaskNotes = document.getElementById('viewTaskNotes'); viewTaskReminderSection = document.getElementById('viewTaskReminderSection'); viewTaskReminderStatus = document.getElementById('viewTaskReminderStatus'); viewTaskReminderDetails = document.getElementById('viewTaskReminderDetails'); viewTaskReminderDate = document.getElementById('viewTaskReminderDate'); viewTaskReminderTime = document.getElementById('viewTaskReminderTime'); viewTaskReminderEmail = document.getElementById('viewTaskReminderEmail'); viewTaskAttachmentsSection = document.getElementById('viewTaskAttachmentsSection'); viewTaskAttachmentsList = document.getElementById('viewTaskAttachmentsList'); taskTimerSection = document.getElementById('taskTimerSection'); viewTaskTimerDisplay = document.getElementById('viewTaskTimerDisplay'); viewTaskStartTimerBtn = document.getElementById('viewTaskStartTimerBtn'); viewTaskPauseTimerBtn = document.getElementById('viewTaskPauseTimerBtn'); viewTaskStopTimerBtn = document.getElementById('viewTaskStopTimerBtn'); viewTaskActualDuration = document.getElementById('viewTaskActualDuration'); timerButtonsContainer = document.getElementById('timerButtonsContainer'); manageLabelsModal = document.getElementById('manageLabelsModal'); modalDialogManageLabels = document.getElementById('modalDialogManageLabels'); closeManageLabelsModalBtn = document.getElementById('closeManageLabelsModalBtn'); closeManageLabelsSecondaryBtn = document.getElementById('closeManageLabelsSecondaryBtn'); addNewLabelForm = document.getElementById('addNewLabelForm'); newLabelInput = document.getElementById('newLabelInput'); existingLabelsList = document.getElementById('existingLabelsList'); settingsModal = document.getElementById('settingsModal'); modalDialogSettings = document.getElementById('modalDialogSettings'); openSettingsModalButton = document.getElementById('openSettingsModalButton'); closeSettingsModalBtn = document.getElementById('closeSettingsModalBtn'); closeSettingsSecondaryBtn = document.getElementById('closeSettingsSecondaryBtn'); settingsClearCompletedBtn = document.getElementById('settingsClearCompletedBtn'); settingsManageLabelsBtn = document.getElementById('settingsManageLabelsBtn'); settingsManageRemindersBtn = document.getElementById('settingsManageRemindersBtn'); settingsTaskReviewBtn = document.getElementById('settingsTaskReviewBtn'); settingsTooltipsGuideBtn = document.getElementById('settingsTooltipsGuideBtn'); settingsIntegrationsBtn = document.getElementById('settingsIntegrationsBtn'); settingsUserAccountsBtn = document.getElementById('settingsUserAccountsBtn'); settingsCollaborationBtn = document.getElementById('settingsCollaborationBtn'); settingsSyncBackupBtn = document.getElementById('settingsSyncBackupBtn'); taskReviewModal = document.getElementById('taskReviewModal'); modalDialogTaskReview = document.getElementById('modalDialogTaskReview'); closeTaskReviewModalBtn = document.getElementById('closeTaskReviewModalBtn'); closeTaskReviewSecondaryBtn = document.getElementById('closeTaskReviewSecondaryBtn'); taskReviewContent = document.getElementById('taskReviewContent'); tooltipsGuideModal = document.getElementById('tooltipsGuideModal'); modalDialogTooltipsGuide = document.getElementById('modalDialogTooltipsGuide'); closeTooltipsGuideModalBtn = document.getElementById('closeTooltipsGuideModalBtn'); closeTooltipsGuideSecondaryBtn = document.getElementById('closeTooltipsGuideSecondaryBtn'); tooltipsGuideContent = document.getElementById('tooltipsGuideContent'); testFeatureButtonContainer = document.getElementById('testFeatureButtonContainer'); testFeatureButton = document.getElementById('testFeatureButton'); subTasksSectionViewEdit = document.getElementById('subTasksSectionViewEdit'); modalSubTaskInputViewEdit = document.getElementById('modalSubTaskInputViewEdit'); modalAddSubTaskBtnViewEdit = document.getElementById('modalAddSubTaskBtnViewEdit'); modalSubTasksListViewEdit = document.getElementById('modalSubTasksListViewEdit'); subTasksSectionViewDetails = document.getElementById('subTasksSectionViewDetails'); viewSubTaskProgress = document.getElementById('viewSubTaskProgress'); modalSubTasksListViewDetails = document.getElementById('modalSubTasksListViewDetails'); noSubTasksMessageViewDetails = document.getElementById('noSubTasksMessageViewDetails'); subTasksSectionAdd = document.getElementById('subTasksSectionAdd'); modalSubTaskInputAdd = document.getElementById('modalSubTaskInputAdd'); modalAddSubTaskBtnAdd = document.getElementById('modalAddSubTaskBtnAdd'); modalSubTasksListAdd = document.getElementById('modalSubTasksListAdd'); featureFlagsListContainer = document.getElementById('featureFlagsListContainer'); yourTasksHeading = document.getElementById('yourTasksHeading'); kanbanBoardContainer = document.getElementById('kanbanBoardContainer'); calendarViewContainer = document.getElementById('calendarViewContainer'); pomodoroTimerPageContainer = document.getElementById('pomodoroTimerPageContainer'); settingsManageProjectsBtn = document.getElementById('settingsManageProjectsBtn'); manageProjectsModal = document.getElementById('manageProjectsModal'); modalDialogManageProjects = document.getElementById('modalDialogManageProjects'); closeManageProjectsModalBtn = document.getElementById('closeManageProjectsModalBtn'); closeManageProjectsSecondaryBtn = document.getElementById('closeManageProjectsSecondaryBtn'); addNewProjectForm = document.getElementById('addNewProjectForm'); newProjectInput = document.getElementById('newProjectInput'); existingProjectsList = document.getElementById('existingProjectsList'); modalProjectSelectAdd = document.getElementById('modalProjectSelectAdd'); modalProjectSelectViewEdit = document.getElementById('modalProjectSelectViewEdit'); projectFilterContainer = document.getElementById('projectFilterContainer'); viewTaskProject = document.getElementById('viewTaskProject'); calendarViewToggleBtn = document.getElementById('calendarViewToggleBtn'); calendarViewToggleBtnText = document.getElementById('calendarViewToggleBtnText'); pomodoroViewToggleBtn = document.getElementById('pomodoroViewToggleBtn'); pomodoroViewToggleBtnText = document.getElementById('pomodoroViewToggleBtnText'); taskDependenciesSectionAdd = document.getElementById('taskDependenciesSectionAdd'); dependsOnContainerAdd = document.getElementById('dependsOnContainerAdd'); blocksTasksContainerAdd = document.getElementById('blocksTasksContainerAdd'); taskDependenciesSectionViewEdit = document.getElementById('taskDependenciesSectionViewEdit'); dependsOnContainerViewEdit = document.getElementById('dependsOnContainerViewEdit'); blocksTasksContainerViewEdit = document.getElementById('blocksTasksContainerViewEdit'); viewTaskDependenciesSection = document.getElementById('viewTaskDependenciesSection'); viewTaskDependsOnList = document.getElementById('viewTaskDependsOnList'); viewTaskBlocksTasksList = document.getElementById('viewTaskBlocksTasksList'); smarterSearchContainer = document.getElementById('smarterSearchContainer'); smarterSearchAdvancedToggleBtn = document.getElementById('smarterSearchAdvancedToggleBtn'); smarterSearchOptionsDiv = document.getElementById('smarterSearchOptionsDiv'); bulkActionControlsContainer = document.getElementById('bulkActionControlsContainer'); selectAllTasksCheckbox = document.getElementById('selectAllTasksCheckbox'); bulkCompleteBtn = document.getElementById('bulkCompleteBtn'); bulkDeleteBtn = document.getElementById('bulkDeleteBtn'); bulkAssignProjectDropdown = document.getElementById('bulkAssignProjectDropdown'); bulkChangePriorityDropdown = document.getElementById('bulkChangePriorityDropdown'); bulkChangeLabelInput = document.getElementById('bulkChangeLabelInput'); sidebarPomodoroDisplay = document.getElementById('sidebarPomodoroTimerDisplay'); sidebarPomodoroState = document.getElementById('sidebarPomodoroState'); sidebarPomodoroTime = document.getElementById('sidebarPomodoroTime'); sidebarPomodoroTask = document.getElementById('sidebarPomodoroTask'); //

    // NEW: Initialize Critical Error Display Elements
    criticalErrorDisplay = document.getElementById('criticalErrorDisplay');
    criticalErrorMessage = document.getElementById('criticalErrorMessage');
    criticalErrorId = document.getElementById('criticalErrorId');
    closeCriticalErrorBtn = document.getElementById('closeCriticalErrorBtn');

    // NEW: Initialize Contact Us Modal Elements
    settingsContactUsBtn = document.getElementById('settingsContactUsBtn');
    contactUsModal = document.getElementById('contactUsModal');
    modalDialogContactUs = document.getElementById('modalDialogContactUs');
    closeContactUsModalBtn = document.getElementById('closeContactUsModalBtn');
    closeContactUsSecondaryBtn = document.getElementById('closeContactUsSecondaryBtn');
    contactUsForm = document.getElementById('contactUsForm');

    // ADDED: Initialize About Us Modal Elements
    settingsAboutUsBtn = document.getElementById('settingsAboutUsBtn');
    aboutUsModal = document.getElementById('aboutUsModal');
    modalDialogAboutUs = document.getElementById('modalDialogAboutUs');
    closeAboutUsModalBtn = document.getElementById('closeAboutUsModalBtn');
    closeAboutUsSecondaryBtn = document.getElementById('closeAboutUsSecondaryBtn');
    aboutUsContent = document.getElementById('aboutUsContent');

    // NEW: Initialize Data Version History Modal Elements
    settingsVersionHistoryBtn = document.getElementById('settingsVersionHistoryBtn');
    dataVersionHistoryModal = document.getElementById('dataVersionHistoryModal');
    modalDialogDataVersionHistory = document.getElementById('modalDialogDataVersionHistory');
    closeDataVersionHistoryModalBtn = document.getElementById('closeDataVersionHistoryModalBtn');
    closeDataVersionHistorySecondaryBtn = document.getElementById('closeDataVersionHistorySecondaryBtn');
    dataVersionHistoryContent = document.getElementById('dataVersionHistoryContent');

    // NEW: Initialize DOM elements for app version display
    appVersionFooterEl = document.getElementById('appVersionFooter');
    appVersionAboutUsDisplayEl = document.getElementById('appVersionAboutUsDisplay');


    // NEW: Add event listener for the close critical error button
    if (closeCriticalErrorBtn) {
        closeCriticalErrorBtn.addEventListener('click', hideCriticalError);
    }

    console.log('[DOM Init] Finished initializing DOM elements.'); //
    renderAppVersion(); // NEW: Call to render app version
}

// --- UI Helper Functions ---

// NEW: Function to render the application version in the UI
export function renderAppVersion() {
    const versionString = getAppVersionString();
    if (appVersionFooterEl) {
        appVersionFooterEl.textContent = versionString;
    }
    if (appVersionAboutUsDisplayEl) {
        appVersionAboutUsDisplayEl.textContent = versionString;
    }
    // If you add more places to display the version, update them here.
}


// NEW: Function to show a critical error message to the user
export function showCriticalError(message, errorId) {
    if (criticalErrorDisplay && criticalErrorMessage && criticalErrorId) {
        criticalErrorMessage.textContent = message || 'An critical, unexpected error occurred. Please try refreshing the page or contact support if the issue persists.';
        criticalErrorId.textContent = errorId ? `Error ID: ${errorId}` : '';
        criticalErrorDisplay.classList.remove('hidden', 'translate-y-full');
        criticalErrorDisplay.classList.add('translate-y-0'); // Slide in
        console.error(`[UI Critical Error] Displayed: ${message}, ID: ${errorId}`);
    } else {
        // Fallback if critical error UI elements are not found (should not happen after initializeDOMElements)
        console.error(`[UI Critical Error] Fallback: ${message}, ID: ${errorId}`);
        alert(`CRITICAL ERROR: ${message}\nID: ${errorId}\n(UI element for error display not found)`);
    }
}

// NEW: Function to hide the critical error message
export function hideCriticalError() {
    if (criticalErrorDisplay) {
        criticalErrorDisplay.classList.add('translate-y-full');
        criticalErrorDisplay.classList.remove('translate-y-0');
        // Optionally, fully hide after transition:
        setTimeout(() => {
            criticalErrorDisplay.classList.add('hidden');
        }, 300); // Match transition duration
    }
}


export function showMessage(message, type = 'success') { //
    if (!messageBox) return; //
    messageBox.textContent = message; //
    messageBox.className = `message-box ${type === 'error' ? 'bg-red-500' : type === 'warn' ? 'bg-yellow-500' : 'bg-green-500'} text-white p-3 rounded-md shadow-lg fixed top-5 left-1/2 transform -translate-x-1/2 z-[200] transition-opacity duration-300`; //
    messageBox.style.display = 'block'; //
    messageBox.style.opacity = '1'; //
    setTimeout(() => { //
        messageBox.style.opacity = '0'; //
        setTimeout(() => { messageBox.style.display = 'none'; }, 300); //
    }, 3000); //
}
export function populateDatalist(datalistElement) { //
    if (!datalistElement || !AppStore || typeof AppStore.getUniqueLabels !== 'function') return; //
    const currentUniqueLabels = AppStore.getUniqueLabels(); //
    datalistElement.innerHTML = ''; //
    currentUniqueLabels.forEach(label => { const option = document.createElement('option'); option.value = label; datalistElement.appendChild(option); }); //
}

export function setSidebarMinimized(minimize) { //
    if (!taskSidebar) { //
        console.error("[UI Rendering] setSidebarMinimized: taskSidebar element not initialized. Aborting."); //
        return; //
    }
    taskSidebar.classList.toggle('sidebar-minimized', minimize); //
    console.log(`[UI Rendering] taskSidebar classList after toggle: ${taskSidebar.classList}`); //


    if (sidebarToggleIcon) { //
        sidebarToggleIcon.className = `fas ${minimize ? 'fa-chevron-right' : 'fa-chevron-left'}`; //
    } else { //
        console.warn("[UI Rendering] setSidebarMinimized: sidebarToggleIcon element not initialized."); //
    }

    const taskSearchInputContainerEl = document.getElementById('taskSearchInputContainer'); //
    if (taskSearchInputContainerEl) { //
        taskSearchInputContainerEl.classList.toggle('hidden', minimize); //
    }

    const testFeatureButtonContainerEl = document.getElementById('testFeatureButtonContainer'); //
    if (testFeatureButtonContainerEl) { //
        const shouldBeHidden = minimize || !isFeatureEnabled('testButtonFeature'); //
        testFeatureButtonContainerEl.classList.toggle('hidden', shouldBeHidden); //
        
        if (!isFeatureEnabled('testButtonFeature')) { //
            testFeatureButtonContainerEl.classList.add('hidden'); //
        }
    }
    
    const allTextElements = taskSidebar.querySelectorAll('.sidebar-text-content'); //
    allTextElements.forEach(el => { //
        el.classList.toggle('hidden', minimize); //
    });

    const iconOnlyButtons = taskSidebar.querySelectorAll('.sidebar-button-icon-only'); //
    iconOnlyButtons.forEach(btn => { //
        btn.classList.toggle('justify-center', minimize);  //
        const icon = btn.querySelector('i'); //
        if (icon) { //
            if (minimize) { //
                icon.classList.remove('md:mr-2', 'md:mr-2.5', 'ml-2'); //
            } else { //
                icon.classList.remove('mr-0');  //
                icon.classList.add('md:mr-2.5');  //
            }
        }
    });
    
    if (isFeatureEnabled('projectFeature') && ProjectsFeature?.populateProjectFilterList) { //
        ProjectsFeature.populateProjectFilterList();  //
    }
    if (isFeatureEnabled('pomodoroTimerHybridFeature') && PomodoroTimerHybridFeature?.updateSidebarDisplay) { //
        PomodoroTimerHybridFeature.updateSidebarDisplay();  //
    }

    if (minimize && iconTooltip && iconTooltip.style.display === 'block') { //
        hideTooltip(); //
    }
    console.log(`[UI Rendering] Sidebar minimized state set to: ${minimize}. CSS should now apply relevant styles.`); //
}


export function showTooltip(element, text) { //
    if (!isFeatureEnabled('tooltipsGuide') || !taskSidebar || !iconTooltip || !taskSidebar.classList.contains('sidebar-minimized')) { //
        if (iconTooltip && iconTooltip.style.display === 'block') hideTooltip(); //
        return; //
    }
    iconTooltip.textContent = text; //
    const rect = element.getBoundingClientRect(); //
    iconTooltip.style.left = `${rect.right + 10}px`; //
    iconTooltip.style.top = `${rect.top + (rect.height / 2) - (iconTooltip.offsetHeight / 2)}px`; //
    iconTooltip.style.display = 'block'; //
}
export function hideTooltip() { //
    if (!iconTooltip) return; //
    if (TooltipService) TooltipService.clearTooltipTimeout(); //
    iconTooltip.style.display = 'none'; //
}

// --- Task Rendering ---
export function refreshTaskView() { //
    if (!mainContentArea || !ViewManager || !isFeatureEnabled) { console.error("[RefreshTaskView] Core dependencies not found."); return; } //
    const currentView = ViewManager.getCurrentTaskViewMode(); //
    updateViewToggleButtonsState();  //
    updateYourTasksHeading(); //
    styleSmartViewButtons();  //

    if (taskList) taskList.classList.add('hidden'); //
    if (kanbanBoardContainer) kanbanBoardContainer.classList.add('hidden'); //
    if (calendarViewContainer) calendarViewContainer.classList.add('hidden'); //
    if (pomodoroTimerPageContainer) pomodoroTimerPageContainer.classList.add('hidden'); //

    if (isFeatureEnabled('pomodoroTimerHybridFeature') && currentView === 'pomodoro') { //
        if (PomodoroTimerHybridFeature?.renderPomodoroPage) {  //
            if(pomodoroTimerPageContainer) pomodoroTimerPageContainer.classList.remove('hidden'); //
            PomodoroTimerHybridFeature.renderPomodoroPage(); //
        } else { ViewManager.setTaskViewMode('list'); renderTaskListView(); }  //
    } else if (isFeatureEnabled('calendarViewFeature') && currentView === 'calendar') { //
        if (CalendarViewFeature?.renderFullCalendar) {  //
            if(calendarViewContainer) calendarViewContainer.classList.remove('hidden'); //
            CalendarViewFeature.renderFullCalendar(calendarViewContainer, AppStore.getTasks()); //
        } else { ViewManager.setTaskViewMode('list'); renderTaskListView(); }  //
    } else if (isFeatureEnabled('kanbanBoardFeature') && currentView === 'kanban') { //
        if (KanbanBoardFeature?.renderKanbanView) {  //
            KanbanBoardFeature.renderKanbanView(); //
        } else { ViewManager.setTaskViewMode('list'); renderTaskListView(); }  //
    } else { //
        if (currentView !== 'list') ViewManager.setTaskViewMode('list');  //
        renderTaskListView();  //
    }
    updateClearCompletedButtonState(); renderBulkActionControls(); //
    if (isFeatureEnabled('pomodoroTimerHybridFeature') && PomodoroTimerHybridFeature?.updateSidebarDisplay) { //
        PomodoroTimerHybridFeature.updateSidebarDisplay(); //
    }
    console.log("[UI] Task view refreshed for mode:", currentView); //
}

export function renderTaskListView() { //
    if (!taskList || !ViewManager || !AppStore || !isFeatureEnabled || !TaskService || !BulkActionService) { console.error("renderTaskListView: Core dependencies not found."); return; } //

    taskList.classList.remove('hidden');  //
    if (kanbanBoardContainer) kanbanBoardContainer.classList.add('hidden'); //
    if (calendarViewContainer) calendarViewContainer.classList.add('hidden'); //
    if (pomodoroTimerPageContainer) pomodoroTimerPageContainer.classList.add('hidden'); //

    taskList.innerHTML = ''; //
    const currentFilterVal = ViewManager.getCurrentFilter(); const currentSortVal = ViewManager.getCurrentSort(); const currentSearchTermVal = ViewManager.getCurrentSearchTerm(); //
    const currentTasks = AppStore.getTasks(); const currentProjects = AppStore.getProjects(); //
    let filteredTasks = []; const today = new Date(); today.setHours(0, 0, 0, 0); //
    if (currentFilterVal === 'inbox') { filteredTasks = currentTasks.filter(task => !task.completed); } //
    else if (currentFilterVal === 'today') { filteredTasks = currentTasks.filter(task => { if (!task.dueDate || task.completed) return false; const taskDueDate = new Date(task.dueDate + 'T00:00:00'); return taskDueDate.getTime() === today.getTime(); }); } //
    else if (currentFilterVal === 'upcoming') { filteredTasks = currentTasks.filter(task => { if (!task.dueDate || task.completed) return false; const taskDueDate = new Date(task.dueDate + 'T00:00:00'); return taskDueDate.getTime() > today.getTime(); });} //
    else if (currentFilterVal === 'completed') { filteredTasks = currentTasks.filter(task => task.completed); } //
    else if (currentFilterVal.startsWith('project_')) { const projectId = parseInt(currentFilterVal.split('_')[1]); if (!isNaN(projectId)) { filteredTasks = currentTasks.filter(task => task.projectId === projectId && !task.completed); } else { filteredTasks = currentTasks.filter(task => !task.projectId && !task.completed); }}  //
    else { filteredTasks = currentTasks.filter(task => task.label && task.label.toLowerCase() === currentFilterVal.toLowerCase() && !task.completed); }  //
    
    if (currentSearchTermVal) { filteredTasks = filteredTasks.filter(task => task.text.toLowerCase().includes(currentSearchTermVal) || (task.label && task.label.toLowerCase().includes(currentSearchTermVal)) || (task.notes && task.notes.toLowerCase().includes(currentSearchTermVal)) || (isFeatureEnabled('projectFeature') && task.projectId && currentProjects.find(p => p.id === task.projectId)?.name.toLowerCase().includes(currentSearchTermVal)));} //
    const priorityOrder = { high: 1, medium: 2, low: 3, default: 4 }; //
    if (currentSortVal === 'dueDate') { filteredTasks.sort((a, b) => { const dA = a.dueDate ? new Date(a.dueDate + (a.time ? `T${a.time}` : 'T00:00:00Z')) : null; const dB = b.dueDate ? new Date(b.dueDate + (b.time ? `T${b.time}` : 'T00:00:00Z')) : null; if (dA === null && dB === null) return 0; if (dA === null) return 1; if (dB === null) return -1; return dA - dB; });} //
    else if (currentSortVal === 'priority') { filteredTasks.sort((a, b) => (priorityOrder[a.priority] || priorityOrder.default) - (priorityOrder[b.priority] || priorityOrder.default) || (a.dueDate && b.dueDate ? new Date(a.dueDate) - new Date(b.dueDate) : 0));} //
    else if (currentSortVal === 'label') { filteredTasks.sort((a,b) => { const lA = (a.label || '').toLowerCase(); const lB = (b.label || '').toLowerCase(); if (lA < lB) return -1; if (lA > lB) return 1; const dA = a.dueDate ? new Date(a.dueDate + (a.time ? `T${a.time}` : 'T00:00:00Z')) : null; const dB = b.dueDate ? new Date(b.dueDate + (b.time ? `T${b.time}` : 'T00:00:00Z')) : null; if (dA === null && dB === null) return 0; if (dA === null) return 1; if (dB === null) return -1; return dA - dB; });} //
    else if (currentFilterVal === 'inbox' && currentSortVal === 'default') { filteredTasks.sort((a, b) => (b.creationDate || b.id) - (a.creationDate || a.id));}  //

    if (emptyState) emptyState.classList.toggle('hidden', currentTasks.length !== 0); //
    if (noMatchingTasks) noMatchingTasks.classList.toggle('hidden', !(currentTasks.length > 0 && filteredTasks.length === 0)); //
    if (taskList) taskList.classList.toggle('hidden', filteredTasks.length === 0 && currentTasks.length > 0);  //

    filteredTasks.forEach((task) => { //
        const li = document.createElement('li'); li.className = `task-item flex items-start justify-between bg-slate-100 dark:bg-slate-700 p-3 sm:p-3.5 rounded-lg shadow hover:shadow-md transition-shadow duration-300 ${task.completed ? 'opacity-60' : ''} overflow-hidden`; li.dataset.taskId = task.id; //
        const hasOpenPrerequisites = isFeatureEnabled('taskDependenciesFeature') && task.dependsOn && task.dependsOn.some(depId => { const dependentTask = AppStore.getTasks().find(t => t.id === depId); return dependentTask && !dependentTask.completed; }); //
        if (hasOpenPrerequisites) { li.classList.add('border-l-4', 'border-amber-500'); } //
        const mainContentClickableArea = document.createElement('div'); mainContentClickableArea.className = 'task-item-clickable-area flex items-start flex-grow min-w-0 mr-2 rounded-l-lg'; //
        mainContentClickableArea.addEventListener('click', (event) => { if (event.target.type === 'checkbox' || event.target.closest('.task-actions') || event.target.closest('.bulk-select-checkbox-container')) return; openViewTaskDetailsModal(task.id); });  //
        const bulkSelectCheckboxContainer = document.createElement('div'); bulkSelectCheckboxContainer.className = 'bulk-select-checkbox-container flex-shrink-0 mr-2 sm:mr-3 bulk-actions-feature-element'; if (isFeatureEnabled('bulkActionsFeature')) { const bulkCheckbox = document.createElement('input'); bulkCheckbox.type = 'checkbox'; bulkCheckbox.className = 'form-checkbox h-5 w-5 text-blue-500 rounded border-slate-400 dark:border-slate-500 focus:ring-blue-400 dark:focus:ring-blue-500 mt-0.5 cursor-pointer'; bulkCheckbox.checked = BulkActionService.getSelectedIds().includes(task.id); bulkCheckbox.title = "Select for bulk action"; bulkCheckbox.addEventListener('change', () => { BulkActionService.toggleTaskSelection(task.id); }); bulkSelectCheckboxContainer.appendChild(bulkCheckbox); } else { bulkSelectCheckboxContainer.classList.add('hidden'); } //
        const completeCheckbox = document.createElement('input'); completeCheckbox.type = 'checkbox'; completeCheckbox.checked = task.completed; completeCheckbox.className = 'form-checkbox h-5 w-5 text-sky-500 rounded border-slate-400 dark:border-slate-500 focus:ring-sky-400 dark:focus:ring-sky-500 mt-0.5 mr-2 sm:mr-3 cursor-pointer flex-shrink-0'; //
        // MODIFIED: Listener now publishes an event
        completeCheckbox.addEventListener('change', () => EventBus.publish('uiRequestToggleComplete', { taskId: task.id }));  //
        if (hasOpenPrerequisites) { completeCheckbox.disabled = true; completeCheckbox.title = "This task is blocked by incomplete prerequisites."; completeCheckbox.classList.add('opacity-50', 'cursor-not-allowed'); } //
        const textDetailsDiv = document.createElement('div'); textDetailsDiv.className = 'flex flex-col flex-grow min-w-0'; const span = document.createElement('span'); span.textContent = task.text; let textColorClass = task.completed ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200'; span.className = `text-sm sm:text-base break-words ${textColorClass} ${task.completed ? 'completed-text' : ''}`; textDetailsDiv.appendChild(span); //
        const detailsContainer = document.createElement('div'); detailsContainer.className = 'flex items-center flex-wrap gap-x-2 gap-y-1 mt-1 sm:mt-1.5 text-xs'; //
        if (isFeatureEnabled('projectFeature') && task.projectId && task.projectId !== 0) { const project = AppStore.getProjects().find(p => p.id === task.projectId); if (project) { const projSpan = document.createElement('span'); projSpan.className = 'text-purple-600 dark:text-purple-400 flex items-center project-feature-element'; projSpan.innerHTML = `<i class="fas fa-folder mr-1"></i> ${project.name}`; detailsContainer.appendChild(projSpan); }} //
        if (task.priority && typeof TaskService.getPriorityClass === 'function') { const pB = document.createElement('span'); pB.textContent = task.priority; pB.className = `priority-badge ${TaskService.getPriorityClass(task.priority)}`; detailsContainer.appendChild(pB); } //
        if (task.label) { const lB = document.createElement('span'); lB.textContent = task.label; lB.className = 'label-badge'; detailsContainer.appendChild(lB); } //
        if (task.dueDate && typeof formatDate === 'function') { const dDS = document.createElement('span'); dDS.className = 'text-slate-500 dark:text-slate-400 flex items-center'; let dD = formatDate(task.dueDate); if (task.time && typeof formatTime === 'function') { dD += ` ${formatTime(task.time)}`; } dDS.innerHTML = `<i class="far fa-calendar-alt mr-1"></i> ${dD}`; detailsContainer.appendChild(dDS); } //
        if (isFeatureEnabled('fileAttachments') && task.attachments && task.attachments.length > 0) { const aS = document.createElement('span'); aS.className = 'text-slate-500 dark:text-slate-400 flex items-center file-attachments-element'; aS.innerHTML = `<i class="fas fa-paperclip mr-1"></i> ${task.attachments.length}`; detailsContainer.appendChild(aS); } //
        if (isFeatureEnabled('subTasksFeature') && task.subTasks && task.subTasks.length > 0) { const subTaskIcon = document.createElement('span'); subTaskIcon.className = 'text-slate-400 dark:text-slate-500 flex items-center sub-tasks-feature-element'; const completedSubTasks = task.subTasks.filter(st => st.completed).length; subTaskIcon.innerHTML = `<i class="fas fa-tasks mr-1" title="${completedSubTasks}/${task.subTasks.length} sub-tasks completed"></i>`; detailsContainer.appendChild(subTaskIcon); } //
        if (isFeatureEnabled('taskDependenciesFeature') && ((task.dependsOn && task.dependsOn.length > 0) || (task.blocksTasks && task.blocksTasks.length > 0))) { const depIcon = document.createElement('span'); depIcon.className = 'text-slate-400 dark:text-slate-500 flex items-center task-dependencies-feature-element'; let depTitle = ''; if (task.dependsOn && task.dependsOn.length > 0) depTitle += `Depends on ${task.dependsOn.length} task(s). `; if (task.blocksTasks && task.blocksTasks.length > 0) depTitle += `Blocks ${task.blocksTasks.length} task(s).`; depIcon.innerHTML = `<i class="fas fa-link mr-1" title="${depTitle.trim()}"></i>`; detailsContainer.appendChild(depIcon); } //
        if (detailsContainer.hasChildNodes()) { textDetailsDiv.appendChild(detailsContainer); } //
        mainContentClickableArea.appendChild(bulkSelectCheckboxContainer); mainContentClickableArea.appendChild(completeCheckbox); mainContentClickableArea.appendChild(textDetailsDiv); //
        const actionsDiv = document.createElement('div'); actionsDiv.className = 'task-actions flex-shrink-0 self-start'; //
        const editButton = document.createElement('button'); editButton.className = 'task-action-btn text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-500'; editButton.innerHTML = '<i class="fas fa-pencil-alt"></i>'; editButton.setAttribute('aria-label', 'Edit task'); editButton.title = 'Edit task'; //
        editButton.addEventListener('click', () => { //
            openViewEditModal(task.id);  //
            if (isFeatureEnabled('projectFeature') && ProjectsFeature?.populateProjectDropdowns) {  //
                ProjectsFeature.populateProjectDropdowns(); //
                if (modalProjectSelectViewEdit) {  //
                    modalProjectSelectViewEdit.value = task.projectId || "0"; //
                }
            }
        }); actionsDiv.appendChild(editButton); //
        const deleteButton = document.createElement('button'); deleteButton.className = 'task-action-btn text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500'; deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'; deleteButton.setAttribute('aria-label', 'Delete task'); deleteButton.title = 'Delete task'; //
        // MODIFIED: Listener now publishes an event
        deleteButton.addEventListener('click', () => EventBus.publish('uiRequestDeleteTask', { taskId: task.id }));  //
        actionsDiv.appendChild(deleteButton); //
        li.appendChild(mainContentClickableArea); li.appendChild(actionsDiv); //
        if (taskList) { taskList.appendChild(li); } //
    }); //
}
export function renderBulkActionControls() { //
    if (!bulkActionControlsContainer || !BulkActionService || !AppStore || !ViewManager) return; //
    const selectedIds = BulkActionService.getSelectedIds(); //
    const isEnabled = isFeatureEnabled('bulkActionsFeature') && selectedIds.length > 0; //
    bulkActionControlsContainer.classList.toggle('hidden', !isEnabled); //

    if (!isEnabled) return; //

    const selectionCountEl = document.getElementById('bulkActionSelectionCount'); //
    if (selectionCountEl) selectionCountEl.textContent = `${selectedIds.length} selected`; //

    if (bulkCompleteBtn) bulkCompleteBtn.disabled = selectedIds.length === 0; //
    if (bulkDeleteBtn) bulkDeleteBtn.disabled = selectedIds.length === 0; //

    if (isFeatureEnabled('projectFeature')) { //
        if (bulkAssignProjectDropdown) { //
            bulkAssignProjectDropdown.disabled = selectedIds.length === 0; //
            if (ProjectsFeature?.populateProjectDropdowns && typeof bulkAssignProjectDropdown.dataset.populated === 'undefined') { //
                const currentProjects = AppStore.getProjects().filter(p=>p.id !==0);  //
                bulkAssignProjectDropdown.innerHTML = '<option value="">Assign Project...</option>';  //
                currentProjects.forEach(project => { //
                    const option = document.createElement('option'); //
                    option.value = project.id; //
                    option.textContent = project.name; //
                    bulkAssignProjectDropdown.appendChild(option); //
                }); //
                bulkAssignProjectDropdown.dataset.populated = "true"; //
            }
        }
    } else { //
        if (bulkAssignProjectDropdown) bulkAssignProjectDropdown.closest('div.relative.project-feature-element')?.classList.add('hidden'); //
    }


    if (bulkChangePriorityDropdown) bulkChangePriorityDropdown.disabled = selectedIds.length === 0; //
    if (bulkChangeLabelInput) { //
        bulkChangeLabelInput.disabled = selectedIds.length === 0; //
        const datalistEl = document.getElementById('existingLabelsBulkAction'); //
        if (datalistEl) populateDatalist(datalistEl);  //
    }
    if (selectAllTasksCheckbox) { //
        const currentFilter = ViewManager.getCurrentFilter(); //
        const currentTasksInView = ViewManager.getFilteredTasksForBulkAction ? ViewManager.getFilteredTasksForBulkAction() : AppStore.getTasks().filter(task => { //
            if (currentFilter === 'inbox') return !task.completed; //
            if (currentFilter === 'today') { const today = new Date(); today.setHours(0,0,0,0); const taskDueDate = new Date(task.dueDate + 'T00:00:00'); return !task.completed && task.dueDate && taskDueDate.getTime() === today.getTime(); } //
            if (currentFilter === 'upcoming') { const today = new Date(); today.setHours(0,0,0,0); const taskDueDate = new Date(task.dueDate + 'T00:00:00'); return !task.completed && task.dueDate && taskDueDate.getTime() > today.getTime(); } //
            if (currentFilter === 'completed') return task.completed; //
            if (currentFilter.startsWith('project_')) { const projectId = parseInt(currentFilter.split('_')[1]); return task.projectId === projectId && !task.completed; } //
            if (task.label && task.label.toLowerCase() === currentFilter.toLowerCase() && !task.completed) return true; //
            return false;  //
        }); //
        const allInViewSelected = currentTasksInView.length > 0 && currentTasksInView.every(task => selectedIds.includes(task.id)); //
        selectAllTasksCheckbox.checked = allInViewSelected; //
    }
}
export function renderTaskDependenciesForViewModal(task) { //
    if (!viewTaskDependsOnList || !viewTaskBlocksTasksList || !AppStore) return; //
    const allTasks = AppStore.getTasks(); //
    viewTaskDependsOnList.innerHTML = ''; viewTaskBlocksTasksList.innerHTML = ''; //

    if (task.dependsOn && task.dependsOn.length > 0) { //
        task.dependsOn.forEach(depId => { //
            const depTask = allTasks.find(t => t.id === depId); //
            const li = document.createElement('li'); //
            li.textContent = depTask ? `${depTask.text} (${depTask.completed ? 'Done' : 'Pending'})` : `Task ID: ${depId} (Not found)`; //
            if (depTask && depTask.completed) li.classList.add('text-green-600', 'dark:text-green-400'); //
            else if (depTask) li.classList.add('text-amber-600', 'dark:text-amber-400'); //
            viewTaskDependsOnList.appendChild(li); //
        }); //
    } else { //
        viewTaskDependsOnList.innerHTML = '<li class="italic">None</li>'; //
    }

    if (task.blocksTasks && task.blocksTasks.length > 0) { //
        task.blocksTasks.forEach(blockedId => { //
            const blockedTask = allTasks.find(t => t.id === blockedId); //
            const li = document.createElement('li'); //
            li.textContent = blockedTask ? blockedTask.text : `Task ID: ${blockedId} (Not found)`; //
            viewTaskBlocksTasksList.appendChild(li); //
        }); //
    } else { //
        viewTaskBlocksTasksList.innerHTML = '<li class="italic">None</li>'; //
    }
}
export function renderTempSubTasksForAddModal(tempSubTasks, listElement) {  //
    if (!listElement) return; //
    listElement.innerHTML = ''; //
    if (!tempSubTasks || tempSubTasks.length === 0) { //
        listElement.innerHTML = '<li class="text-xs text-slate-400 dark:text-slate-500">No sub-tasks added yet.</li>'; //
        return; //
    }
    tempSubTasks.forEach((st, index) => { //
        const li = document.createElement('li'); //
        li.className = 'flex items-center justify-between text-sm bg-slate-100 dark:bg-slate-600 p-1.5 rounded'; //
        const span = document.createElement('span'); //
        span.textContent = st.text; //
        span.className = "dark:text-slate-200"; //
        li.appendChild(span); //
        const removeBtn = document.createElement('button'); //
        removeBtn.type = 'button'; //
        removeBtn.innerHTML = '<i class="fas fa-times text-red-500 hover:text-red-700 text-xs"></i>'; //
        removeBtn.onclick = () => { //
            tempSubTasks.splice(index, 1); //
            renderTempSubTasksForAddModal(tempSubTasks, listElement);  //
        }; //
        li.appendChild(removeBtn); //
        listElement.appendChild(li); //
    }); //
}
export function renderSubTasksForEditModal(parentId, subTasksListElement) { //
    if (!AppStore || !subTasksListElement || !ModalStateService) return;  //
    const actualParentId = parentId || ModalStateService.getEditingTaskId(); //
    if (!actualParentId) { //
        console.error("[RenderSubTasksEdit] Parent ID missing."); //
        subTasksListElement.innerHTML = '<li class="text-xs text-red-500 dark:text-red-400">Error: Parent task ID not found.</li>'; //
        return; //
    }

    const parentTask = AppStore.getTasks().find(t => t.id === actualParentId); //
    subTasksListElement.innerHTML = ''; //

    if (!parentTask || !parentTask.subTasks || parentTask.subTasks.length === 0) { //
        subTasksListElement.innerHTML = '<li class="text-xs text-slate-400 dark:text-slate-500">No sub-tasks added yet.</li>'; //
        return; //
    }

    parentTask.subTasks.forEach(st => {  //
        const li = document.createElement('li'); //
        li.className = 'flex items-center justify-between text-sm bg-slate-100 dark:bg-slate-600 p-1.5 rounded'; //
        
        const textSpan = document.createElement('span'); //
        textSpan.textContent = st.text; //
        textSpan.className = `dark:text-slate-200 ${st.completed ? 'line-through text-slate-500 dark:text-slate-400' : ''}`; //
        
        const checkbox = document.createElement('input'); //
        checkbox.type = 'checkbox'; //
        checkbox.checked = st.completed; //
        checkbox.className = 'form-checkbox h-4 w-4 text-sky-500 rounded border-slate-300 dark:border-slate-500 focus:ring-sky-400 mr-2'; //
        checkbox.onchange = () => { //
            if (SubTasksFeature && SubTasksFeature.toggleComplete) { //
                if (SubTasksFeature.toggleComplete(actualParentId, st.id)) { //
                    renderSubTasksForEditModal(actualParentId, subTasksListElement); // Re-render the list
                } else { //
                    showMessage('Failed to toggle sub-task.', 'error');  //
                }
            } else { //
                 console.warn("SubTasksFeature.toggleComplete not available."); //
            }
        }; //

        const editBtn = document.createElement('button'); //
        editBtn.type = 'button'; //
        editBtn.innerHTML = '<i class="fas fa-pencil-alt text-sky-500 hover:text-sky-700 text-xs mx-1"></i>'; //
        editBtn.title = 'Edit sub-task'; //
        editBtn.onclick = () => { //
            const newText = prompt('Edit sub-task:', st.text); //
            if (newText !== null && newText.trim() !== '') { //
                if (SubTasksFeature && SubTasksFeature.edit) { //
                    if (SubTasksFeature.edit(actualParentId, st.id, newText.trim())) { //
                        renderSubTasksForEditModal(actualParentId, subTasksListElement); // Re-render the list
                    } else { //
                        showMessage('Failed to edit sub-task.', 'error'); //
                    }
                } else { //
                     console.warn("SubTasksFeature.edit not available."); //
                }
            }
        }; //
        
        const removeBtn = document.createElement('button'); //
        removeBtn.type = 'button'; //
        removeBtn.innerHTML = '<i class="fas fa-times text-red-500 hover:text-red-700 text-xs"></i>'; //
        removeBtn.title = 'Delete sub-task'; //
        removeBtn.onclick = () => { //
            if (confirm('Delete this sub-task?')) { //
                if (SubTasksFeature && SubTasksFeature.delete) { //
                    if (SubTasksFeature.delete(actualParentId, st.id)) { //
                        renderSubTasksForEditModal(actualParentId, subTasksListElement); // Re-render the list
                    } else { //
                        showMessage('Failed to delete sub-task.', 'error'); //
                    }
                } else { //
                    console.warn("SubTasksFeature.delete not available."); //
                }
            }
        }; //

        const controlsDiv = document.createElement('div'); //
        controlsDiv.appendChild(editBtn); //
        controlsDiv.appendChild(removeBtn); //

        const contentDiv = document.createElement('div'); //
        contentDiv.className = 'flex items-center flex-grow'; //
        contentDiv.appendChild(checkbox); //
        contentDiv.appendChild(textSpan); //
        
        li.appendChild(contentDiv); //
        li.appendChild(controlsDiv); //

        subTasksListElement.appendChild(li); //
    }); //
}
export function renderSubTasksForViewModal(parentId, subTasksListElement, progressElement, noSubTasksMessageElement) { //
     if (!AppStore || !subTasksListElement || !progressElement || !noSubTasksMessageElement) return; //
    const parentTask = AppStore.getTasks().find(t => t.id === parentId); //
    subTasksListElement.innerHTML = ''; //
    if (!parentTask || !parentTask.subTasks || parentTask.subTasks.length === 0) { //
        noSubTasksMessageElement.classList.remove('hidden'); //
        progressElement.textContent = ''; //
        return; //
    }
    noSubTasksMessageElement.classList.add('hidden'); //
    let completedCount = 0; //
    parentTask.subTasks.forEach(st => { //
        const li = document.createElement('li'); //
        li.className = 'flex items-center text-slate-600 dark:text-slate-300'; //
        const checkbox = document.createElement('input'); //
        checkbox.type = 'checkbox'; //
        checkbox.checked = st.completed; //
        checkbox.className = 'form-checkbox h-4 w-4 text-sky-500 rounded border-slate-400 dark:border-slate-500 focus:ring-sky-400 mr-2 cursor-not-allowed'; //
        checkbox.disabled = true;  //
        if (st.completed) completedCount++; //
        const span = document.createElement('span'); //
        span.textContent = st.text; //
        if (st.completed) span.classList.add('line-through', 'text-slate-400', 'dark:text-slate-500'); //
        li.appendChild(checkbox); //
        li.appendChild(span); //
        subTasksListElement.appendChild(li); //
    }); //
    progressElement.textContent = `${completedCount} / ${parentTask.subTasks.length} completed`; //
}

export function styleSmartViewButtons() { //
    if (!ViewManager) return; //
    const currentFilter = ViewManager.getCurrentFilter(); //
    const allSmartButtons = document.querySelectorAll('.smart-view-btn');  //

    allSmartButtons.forEach(btn => { //
        const isActive = btn.dataset.filter === currentFilter; //
        btn.classList.toggle('bg-sky-500', isActive); //
        btn.classList.toggle('text-white', isActive); //
        btn.classList.toggle('dark:bg-sky-600', isActive); //
        btn.classList.toggle('font-semibold', isActive); //

        btn.classList.toggle('bg-slate-200', !isActive); //
        btn.classList.toggle('text-slate-700', !isActive); //
        btn.classList.toggle('hover:bg-slate-300', !isActive); //
        btn.classList.toggle('dark:bg-slate-700', !isActive); //
        btn.classList.toggle('dark:text-slate-300', !isActive); //
        btn.classList.toggle('dark:hover:bg-slate-600', !isActive); //
        btn.classList.toggle('font-medium', !isActive && !btn.classList.contains('font-semibold'));  //

        const icon = btn.querySelector('i'); //
        if (icon) { //
            icon.classList.toggle('text-white', isActive);  //
            icon.classList.toggle('dark:text-sky-300', isActive);  //
            
            icon.classList.toggle('text-slate-500', !isActive);  //
            icon.classList.toggle('dark:text-slate-400', !isActive); //
        }
    }); //
}


export function updateSortButtonStates() { //
    if (!ViewManager || !sortByDueDateBtn || !sortByPriorityBtn || !sortByLabelBtn) return; //
    const currentSort = ViewManager.getCurrentSort(); //
    const buttons = [ //
        { el: sortByDueDateBtn, type: 'dueDate' }, //
        { el: sortByPriorityBtn, type: 'priority' }, //
        { el: sortByLabelBtn, type: 'label' } //
    ]; //
    buttons.forEach(item => { //
        const isActive = item.type === currentSort; //
        item.el.classList.toggle('sort-btn-active', isActive);  //
        item.el.classList.toggle('bg-slate-200', !isActive); //
        item.el.classList.toggle('hover:bg-slate-300', !isActive); //
        item.el.classList.toggle('dark:bg-slate-700', !isActive); //
        item.el.classList.toggle('dark:hover:bg-slate-600', !isActive); //
        item.el.classList.toggle('text-slate-700', !isActive); //
        item.el.classList.toggle('dark:text-slate-200', !isActive); //
    }); //
}
export function updateClearCompletedButtonState() { //
    if (!settingsClearCompletedBtn || !AppStore) return; //
    const tasks = AppStore.getTasks(); //
    const hasCompleted = tasks.some(task => task.completed); //
    settingsClearCompletedBtn.disabled = !hasCompleted; //
    settingsClearCompletedBtn.classList.toggle('opacity-50', !hasCompleted); //
    settingsClearCompletedBtn.classList.toggle('cursor-not-allowed', !hasCompleted); //
}
export function updateViewToggleButtonsState() { //
    if (!ViewManager || !isFeatureEnabled) return; //
    const currentMode = ViewManager.getCurrentTaskViewMode(); //
    const buttons = [ //
        { el: kanbanViewToggleBtn, mode: 'kanban', feature: 'kanbanBoardFeature' }, //
        { el: calendarViewToggleBtn, mode: 'calendar', feature: 'calendarViewFeature' }, //
        { el: pomodoroViewToggleBtn, mode: 'pomodoro', feature: 'pomodoroTimerHybridFeature' } //
    ]; //

    buttons.forEach(item => { //
        if (item.el) { //
            const featureOn = isFeatureEnabled(item.feature); //
            item.el.classList.toggle('hidden', !featureOn); //
            if (featureOn) { //
                const isActive = currentMode === item.mode; //
                item.el.classList.toggle('bg-sky-500', isActive);  //
                item.el.classList.toggle('text-white', isActive); //
                item.el.classList.toggle('dark:bg-sky-600', isActive); //

                 if (!isActive) { //
                    item.el.classList.remove('bg-sky-500', 'text-white', 'dark:bg-sky-600'); //
                    if (item.el === kanbanViewToggleBtn) { //
                        item.el.classList.add('bg-purple-200', 'hover:bg-purple-300', 'dark:bg-purple-700', 'dark:hover:bg-purple-600', 'text-purple-700', 'dark:text-purple-200'); //
                    } else if (item.el === calendarViewToggleBtn) { //
                         item.el.classList.add('bg-teal-200', 'hover:bg-teal-300', 'dark:bg-teal-700', 'dark:hover:bg-teal-600', 'text-teal-700', 'dark:text-teal-200'); //
                    } else if (item.el === pomodoroViewToggleBtn) { //
                        item.el.classList.add('bg-rose-200', 'hover:bg-rose-300', 'dark:bg-rose-700', 'dark:hover:bg-rose-600', 'text-rose-700', 'dark:text-rose-200'); //
                    }
                }
            }
        }
    }); //
}
export function updateYourTasksHeading() { //
    if (!yourTasksHeading || !ViewManager) return; //
    const currentFilter = ViewManager.getCurrentFilter(); //
    const currentMode = ViewManager.getCurrentTaskViewMode(); //
    let title = "Your Tasks"; //

    if (currentMode === 'kanban') title = "Kanban Board"; //
    else if (currentMode === 'calendar') title = "Calendar View"; //
    else if (currentMode === 'pomodoro') title = "Pomodoro Timer"; //
    else {  //
        if (currentFilter === 'inbox') title = "Inbox"; //
        else if (currentFilter === 'today') title = "Today's Tasks"; //
        else if (currentFilter === 'upcoming') title = "Upcoming Tasks"; //
        else if (currentFilter === 'completed') title = "Completed Tasks"; //
        else if (currentFilter.startsWith('project_')) { //
            if (isFeatureEnabled('projectFeature') && AppStore) { //
                const projectId = parseInt(currentFilter.split('_')[1]); //
                const project = AppStore.getProjects().find(p => p.id === projectId); //
                title = project ? `Project: ${project.name}` : "Project Tasks"; //
            } else { //
                title = "Project Tasks"; //
            }
        } else {  //
            title = `Label: ${currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)}`; //
        }
    }
    yourTasksHeading.textContent = title; //
}

// NEW: Function to render the list of versions in the modal
export function renderVersionHistoryList(versions) {
    if (!dataVersionHistoryContent) {
        console.error("[UI Rendering] Data version history content element not found.");
        return;
    }
    dataVersionHistoryContent.innerHTML = ''; // Clear previous content

    if (!versions || versions.length === 0) {
        dataVersionHistoryContent.innerHTML = '<p class="text-slate-500 dark:text-slate-400 text-center p-4">No version history available.</p>';
        return;
    }

    const ul = document.createElement('ul');
    ul.className = 'space-y-2';

    versions.forEach(version => { // Assuming versions are sorted newest first
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
                // Dynamically import DataVersioningFeature to call restoreVersion
                try {
                    const { DataVersioningFeature } = await import('./feature_data_versioning.js');
                    if (DataVersioningFeature && DataVersioningFeature.restoreVersion) {
                        const success = DataVersioningFeature.restoreVersion(version.timestamp);
                        if (success) {
                            // Optionally close this modal, or refresh its content if needed
                            // For now, user can manually close. UI will refresh due to AppStore events.
                            const { closeDataVersionHistoryModal } = await import('./modal_interactions.js');
                            if (closeDataVersionHistoryModal) closeDataVersionHistoryModal();
                        }
                    } else {
                        showMessage('Error: Restore function not available.', 'error');
                    }
                } catch (e) {
                    console.error("Error importing DataVersioningFeature for restore:", e);
                    showMessage('Error trying to restore version.', 'error');
                }
            }
        };

        li.appendChild(infoDiv);
        li.appendChild(restoreButton);
        ul.appendChild(li);
    });
    dataVersionHistoryContent.appendChild(ul);
}


export function initializeUiRenderingSubscriptions() { //
    if (!EventBus || !ViewManager || !isFeatureEnabled) { console.error("[UI Rendering] Core dependencies for subscriptions not available."); return; } //
    EventBus.subscribe('tasksChanged', (updatedTasks) => { console.log("[UI Rendering] Event received: tasksChanged. Refreshing view."); refreshTaskView(); updateClearCompletedButtonState(); }); //
    EventBus.subscribe('projectsChanged', (updatedProjects) => { //
        console.log("[UI Rendering] Event received: projectsChanged. Refreshing view and project UI."); //
        refreshTaskView();  //
        if (isFeatureEnabled('projectFeature') && ProjectsFeature?.populateProjectFilterList) ProjectsFeature.populateProjectFilterList(); //
        if (isFeatureEnabled('projectFeature') && ProjectsFeature?.populateProjectDropdowns) ProjectsFeature.populateProjectDropdowns(); //
        styleSmartViewButtons();  //
    }); //
    EventBus.subscribe('uniqueProjectsChanged', (newUniqueProjects) => { //
        console.log("[UI Rendering] Event received: uniqueProjectsChanged. Repopulating project UI."); //
        if (isFeatureEnabled('projectFeature') && ProjectsFeature?.populateProjectFilterList) ProjectsFeature.populateProjectFilterList(); //
        if (isFeatureEnabled('projectFeature') && ProjectsFeature?.populateProjectDropdowns) ProjectsFeature.populateProjectDropdowns(); //
        styleSmartViewButtons();  //
    }); //
    EventBus.subscribe('kanbanColumnsChanged', (updatedColumns) => { console.log("[UI Rendering] Event received: kanbanColumnsChanged."); if (ViewManager.getCurrentTaskViewMode() === 'kanban' && isFeatureEnabled('kanbanBoardFeature')) { refreshTaskView(); } }); //
    
    EventBus.subscribe('filterChanged', (eventData) => {  //
        console.log("[UI Rendering] Event received: filterChanged. Refreshing view, heading, and button styles.");  //
        refreshTaskView();  //
        updateYourTasksHeading();  //
        updateSortButtonStates();  //
        styleSmartViewButtons();  //
    }); //

    EventBus.subscribe('sortChanged', (newSort) => { console.log("[UI Rendering] Event received: sortChanged. Refreshing view and sort buttons."); refreshTaskView(); updateSortButtonStates(); }); //
    EventBus.subscribe('searchTermChanged', (newSearchTerm) => { console.log("[UI Rendering] Event received: searchTermChanged. Refreshing view."); refreshTaskView(); }); //
    EventBus.subscribe('viewModeChanged', (newViewMode) => { console.log("[UI Rendering] Event received: viewModeChanged. Refreshing view and UI states."); refreshTaskView();  }); //
    EventBus.subscribe('featureFlagsUpdated', (updateData) => { console.log("[UI Rendering] Event received: featureFlagsUpdated. Certain UI states might need refresh."); refreshTaskView();  }); //
    EventBus.subscribe('labelsChanged', (newLabels) => { //
        console.log("[UI Rendering] Event received: labelsChanged. Populating datalists."); //
        if(existingLabelsDatalist) populateDatalist(existingLabelsDatalist);  //
        if(existingLabelsEditDatalist) populateDatalist(existingLabelsEditDatalist);  //
        if (manageLabelsModal && !manageLabelsModal.classList.contains('hidden')) { //
            populateManageLabelsList(); //
        }
    }); //
    EventBus.subscribe('bulkSelectionChanged', (selectedIds) => { console.log("[UI Rendering] Event received: bulkSelectionChanged. Rendering controls."); renderBulkActionControls(); }); //
    EventBus.subscribe('pomodoroStateUpdated', (pomodoroData) => { //
        console.log("[UI Rendering] Event received: pomodoroStateUpdated.", pomodoroData); //
        if (isFeatureEnabled('pomodoroTimerHybridFeature') && PomodoroTimerHybridFeature?.updateSidebarDisplay) {  //
            PomodoroTimerHybridFeature.updateSidebarDisplay(); //
        }
    }); //
    console.log("[UI Rendering] Event subscriptions initialized."); //
}

console.log("ui_rendering.js loaded, using imported services and functions."); //