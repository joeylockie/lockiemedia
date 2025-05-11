// ui_interactions.js

// This file handles general UI interactions, task rendering, sidebar,
// event listeners (excluding direct modal open/close logic which is in modal_interactions.js),
// and feature-specific UI updates.

// --- DOM Elements ---
// (All const declarations for DOM elements go here - these are assumed to be available globally)
const taskSidebar = document.getElementById('taskSidebar');
const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
const sidebarToggleIcon = document.getElementById('sidebarToggleIcon');
const sidebarTextElements = taskSidebar.querySelectorAll('.sidebar-text-content');
const sidebarIconOnlyButtons = taskSidebar.querySelectorAll('.sidebar-button-icon-only');
const iconTooltip = document.getElementById('iconTooltip');
const sortByDueDateBtn = document.getElementById('sortByDueDateBtn');
const sortByPriorityBtn = document.getElementById('sortByPriorityBtn');
const sortByLabelBtn = document.getElementById('sortByLabelBtn');
const taskSearchInput = document.getElementById('taskSearchInput');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const noMatchingTasks = document.getElementById('noMatchingTasks');
const smartViewButtonsContainer = document.getElementById('smartViewButtonsContainer');
const smartViewButtons = smartViewButtonsContainer.querySelectorAll('.smart-view-btn');
const messageBox = document.getElementById('messageBox');
// Add Task Modal Elements (referenced by event handlers and other functions)
const addTaskModal = document.getElementById('addTaskModal');
const modalDialogAdd = document.getElementById('modalDialogAdd');
const openAddModalButton = document.getElementById('openAddModalButton');
const closeAddModalBtn = document.getElementById('closeAddModalBtn');
const cancelAddModalBtn = document.getElementById('cancelAddModalBtn');
const modalTodoFormAdd = document.getElementById('modalTodoFormAdd');
const modalTaskInputAdd = document.getElementById('modalTaskInputAdd');
const modalDueDateInputAdd = document.getElementById('modalDueDateInputAdd');
const modalTimeInputAdd = document.getElementById('modalTimeInputAdd');
const modalEstHoursAdd = document.getElementById('modalEstHoursAdd');
const modalEstMinutesAdd = document.getElementById('modalEstMinutesAdd');
const modalPriorityInputAdd = document.getElementById('modalPriorityInputAdd');
const modalLabelInputAdd = document.getElementById('modalLabelInputAdd');
const existingLabelsDatalist = document.getElementById('existingLabels');
const modalNotesInputAdd = document.getElementById('modalNotesInputAdd');
const modalRemindMeAddContainer = document.getElementById('modalRemindMeAddContainer');
const modalRemindMeAdd = document.getElementById('modalRemindMeAdd');
const reminderOptionsAdd = document.getElementById('reminderOptionsAdd');
const modalReminderDateAdd = document.getElementById('modalReminderDateAdd');
const modalReminderTimeAdd = document.getElementById('modalReminderTimeAdd');
const modalReminderEmailAdd = document.getElementById('modalReminderEmailAdd');
// View/Edit Task Modal Elements (referenced by event handlers and other functions)
const viewEditTaskModal = document.getElementById('viewEditTaskModal');
const modalDialogViewEdit = document.getElementById('modalDialogViewEdit');
const closeViewEditModalBtn = document.getElementById('closeViewEditModalBtn');
const cancelViewEditModalBtn = document.getElementById('cancelViewEditModalBtn');
const modalTodoFormViewEdit = document.getElementById('modalTodoFormViewEdit');
const modalViewEditTaskId = document.getElementById('modalViewEditTaskId');
const modalTaskInputViewEdit = document.getElementById('modalTaskInputViewEdit');
const modalDueDateInputViewEdit = document.getElementById('modalDueDateInputViewEdit');
const modalTimeInputViewEdit = document.getElementById('modalTimeInputViewEdit');
const modalEstHoursViewEdit = document.getElementById('modalEstHoursViewEdit');
const modalEstMinutesViewEdit = document.getElementById('modalEstMinutesViewEdit');
const modalPriorityInputViewEdit = document.getElementById('modalPriorityInputViewEdit');
const modalLabelInputViewEdit = document.getElementById('modalLabelInputViewEdit');
const existingLabelsEditDatalist = document.getElementById('existingLabelsEdit');
const modalNotesInputViewEdit = document.getElementById('modalNotesInputViewEdit');
const modalRemindMeViewEditContainer = document.getElementById('modalRemindMeViewEditContainer');
const modalRemindMeViewEdit = document.getElementById('modalRemindMeViewEdit');
const reminderOptionsViewEdit = document.getElementById('reminderOptionsViewEdit');
const modalReminderDateViewEdit = document.getElementById('modalReminderDateViewEdit');
const modalReminderTimeViewEdit = document.getElementById('modalReminderTimeViewEdit');
const modalReminderEmailViewEdit = document.getElementById('modalReminderEmailViewEdit');
const existingAttachmentsViewEdit = document.getElementById('existingAttachmentsViewEdit');
// View Task Details Modal Elements (referenced by event handlers and other functions)
const viewTaskDetailsModal = document.getElementById('viewTaskDetailsModal');
const modalDialogViewDetails = document.getElementById('modalDialogViewDetails');
const closeViewDetailsModalBtn = document.getElementById('closeViewDetailsModalBtn');
const closeViewDetailsSecondaryBtn = document.getElementById('closeViewDetailsSecondaryBtn');
const editFromViewModalBtn = document.getElementById('editFromViewModalBtn');
const deleteFromViewModalBtn = document.getElementById('deleteFromViewModalBtn');
const viewTaskText = document.getElementById('viewTaskText');
const viewTaskDueDate = document.getElementById('viewTaskDueDate');
const viewTaskTime = document.getElementById('viewTaskTime');
const viewTaskEstDuration = document.getElementById('viewTaskEstDuration');
const viewTaskPriority = document.getElementById('viewTaskPriority');
const viewTaskStatus = document.getElementById('viewTaskStatus');
const viewTaskLabel = document.getElementById('viewTaskLabel');
const viewTaskNotes = document.getElementById('viewTaskNotes');
const viewTaskReminderSection = document.getElementById('viewTaskReminderSection');
const viewTaskReminderStatus = document.getElementById('viewTaskReminderStatus');
const viewTaskReminderDetails = document.getElementById('viewTaskReminderDetails');
const viewTaskReminderDate = document.getElementById('viewTaskReminderDate');
const viewTaskReminderTime = document.getElementById('viewTaskReminderTime');
const viewTaskReminderEmail = document.getElementById('viewTaskReminderEmail');
const viewTaskAttachmentsSection = document.getElementById('viewTaskAttachmentsSection');
const viewTaskAttachmentsList = document.getElementById('viewTaskAttachmentsList');
// Timer Elements (referenced by feature modules and renderTasks)
const taskTimerSection = document.getElementById('taskTimerSection');
const viewTaskTimerDisplay = document.getElementById('viewTaskTimerDisplay');
const viewTaskStartTimerBtn = document.getElementById('viewTaskStartTimerBtn');
const viewTaskPauseTimerBtn = document.getElementById('viewTaskPauseTimerBtn');
const viewTaskStopTimerBtn = document.getElementById('viewTaskStopTimerBtn');
const viewTaskActualDuration = document.getElementById('viewTaskActualDuration');
const timerButtonsContainer = document.getElementById('timerButtonsContainer');
// Manage Labels Modal Elements (referenced by event handlers)
const manageLabelsModal = document.getElementById('manageLabelsModal');
const modalDialogManageLabels = document.getElementById('modalDialogManageLabels');
const closeManageLabelsModalBtn = document.getElementById('closeManageLabelsModalBtn');
const closeManageLabelsSecondaryBtn = document.getElementById('closeManageLabelsSecondaryBtn');
const addNewLabelForm = document.getElementById('addNewLabelForm');
const newLabelInput = document.getElementById('newLabelInput');
const existingLabelsList = document.getElementById('existingLabelsList');
// Settings Modal Elements (referenced by event handlers)
const settingsModal = document.getElementById('settingsModal');
const modalDialogSettings = document.getElementById('modalDialogSettings');
const openSettingsModalButton = document.getElementById('openSettingsModalButton');
const closeSettingsModalBtn = document.getElementById('closeSettingsModalBtn');
const closeSettingsSecondaryBtn = document.getElementById('closeSettingsSecondaryBtn');
const settingsClearCompletedBtn = document.getElementById('settingsClearCompletedBtn');
const settingsManageLabelsBtn = document.getElementById('settingsManageLabelsBtn');
const settingsManageRemindersBtn = document.getElementById('settingsManageRemindersBtn');
const settingsTaskReviewBtn = document.getElementById('settingsTaskReviewBtn');
const settingsTooltipsGuideBtn = document.getElementById('settingsTooltipsGuideBtn');
const settingsIntegrationsBtn = document.getElementById('settingsIntegrationsBtn');
const settingsUserAccountsBtn = document.getElementById('settingsUserAccountsBtn');
const settingsCollaborationBtn = document.getElementById('settingsCollaborationBtn');
const settingsSyncBackupBtn = document.getElementById('settingsSyncBackupBtn');
// Task Review Modal Elements (referenced by event handlers)
const taskReviewModal = document.getElementById('taskReviewModal');
const modalDialogTaskReview = document.getElementById('modalDialogTaskReview');
const closeTaskReviewModalBtn = document.getElementById('closeTaskReviewModalBtn');
const closeTaskReviewSecondaryBtn = document.getElementById('closeTaskReviewSecondaryBtn');
const taskReviewContent = document.getElementById('taskReviewContent');
// Tooltips Guide Modal Elements (referenced by event handlers)
const tooltipsGuideModal = document.getElementById('tooltipsGuideModal');
const modalDialogTooltipsGuide = document.getElementById('modalDialogTooltipsGuide');
const closeTooltipsGuideModalBtn = document.getElementById('closeTooltipsGuideModalBtn');
const closeTooltipsGuideSecondaryBtn = document.getElementById('closeTooltipsGuideSecondaryBtn');
const tooltipsGuideContent = document.getElementById('tooltipsGuideContent'); // Assuming this exists
// Test Feature Button (referenced by feature module)
const testFeatureButtonContainer = document.getElementById('testFeatureButtonContainer');
const testFeatureButton = document.getElementById('testFeatureButton');
// Sub-task Elements (referenced by event handlers and render functions)
const subTasksSectionViewEdit = document.getElementById('subTasksSectionViewEdit');
const modalSubTaskInputViewEdit = document.getElementById('modalSubTaskInputViewEdit');
const modalAddSubTaskBtnViewEdit = document.getElementById('modalAddSubTaskBtnViewEdit');
const modalSubTasksListViewEdit = document.getElementById('modalSubTasksListViewEdit');
const subTasksSectionViewDetails = document.getElementById('subTasksSectionViewDetails');
const viewSubTaskProgress = document.getElementById('viewSubTaskProgress');
const modalSubTasksListViewDetails = document.getElementById('modalSubTasksListViewDetails');
const noSubTasksMessageViewDetails = document.getElementById('noSubTasksMessageViewDetails');
const subTasksSectionAdd = document.getElementById('subTasksSectionAdd');
const modalSubTaskInputAdd = document.getElementById('modalSubTaskInputAdd');
const modalAddSubTaskBtnAdd = document.getElementById('modalAddSubTaskBtnAdd');
const modalSubTasksListAdd = document.getElementById('modalSubTasksListAdd');

// --- Temporary State for UI Interactions ---
let tempSubTasksForAddModal = []; // Used by handleAddTask and handleAddTempSubTaskForAddModal

// --- UI Helper Functions ---
function showMessage(message, type = 'success') {
    if (!messageBox) return;
    messageBox.textContent = message;
    messageBox.className = 'message-box'; // Reset classes
    if (type === 'success') {
        messageBox.classList.add('bg-green-100', 'text-green-800', 'dark:bg-green-700', 'dark:text-green-100');
    } else if (type === 'error') {
        messageBox.classList.add('bg-red-100', 'text-red-800', 'dark:bg-red-700', 'dark:text-red-100');
    } else { // Default to info/general
        messageBox.classList.add('bg-sky-100', 'text-sky-800', 'dark:bg-sky-700', 'dark:text-sky-100');
    }
    messageBox.style.display = 'block';
    messageBox.style.zIndex = '200'; // Ensure it's above other content
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 3000);
}

function populateDatalist(datalistElement) {
    if (!datalistElement) return;
    datalistElement.innerHTML = ''; // Clear existing options
    uniqueLabels.forEach(label => { // Assumes uniqueLabels is global (from app_logic.js)
        const option = document.createElement('option');
        option.value = label;
        datalistElement.appendChild(option);
    });
}

// --- Sidebar UI ---
function setSidebarMinimized(minimize) {
    if (!taskSidebar || !sidebarToggleIcon || !iconTooltip) return;
    hideTooltip(); // Hide any active tooltip before changing state
    if (minimize) {
        taskSidebar.classList.remove('md:w-72', 'lg:w-80', 'w-full', 'p-5', 'sm:p-6', 'md:p-5', 'sm:p-4');
        taskSidebar.classList.add('w-16', 'p-3', 'sidebar-minimized');
        sidebarToggleIcon.classList.remove('fa-chevron-left');
        sidebarToggleIcon.classList.add('fa-chevron-right');
        sidebarTextElements.forEach(el => el.classList.add('hidden'));
        // Also hide specific containers that only make sense when expanded
        document.querySelectorAll('.sidebar-section-title, #taskSearchInputContainer, #testFeatureButtonContainer .sidebar-text-content').forEach(el => el.classList.add('hidden'));
        sidebarIconOnlyButtons.forEach(btn => {
            btn.classList.add('justify-center');
            const icon = btn.querySelector('i');
            if(icon) icon.classList.remove('md:mr-2', 'md:mr-2.5', 'ml-2'); // Remove margins that assume text
        });
        localStorage.setItem('sidebarState', 'minimized');
    } else {
        taskSidebar.classList.remove('w-16', 'p-3', 'sidebar-minimized');
        taskSidebar.classList.add('w-full', 'md:w-72', 'lg:w-80', 'p-3', 'sm:p-4', 'md:p-5');
        sidebarToggleIcon.classList.remove('fa-chevron-right');
        sidebarToggleIcon.classList.add('fa-chevron-left');
        sidebarTextElements.forEach(el => el.classList.remove('hidden'));
        document.querySelectorAll('.sidebar-section-title, #taskSearchInputContainer, #testFeatureButtonContainer .sidebar-text-content').forEach(el => el.classList.remove('hidden'));
        sidebarIconOnlyButtons.forEach(btn => {
            btn.classList.remove('justify-center');
            const icon = btn.querySelector('i');
            const textSpan = btn.querySelector('.sidebar-text-content');
            // Add back appropriate margins if text is visible
            if(icon && textSpan && !textSpan.classList.contains('hidden')) {
                if (btn.id === 'openAddModalButton' || btn.id === 'openSettingsModalButton' || (testFeatureButton && btn.id === testFeatureButton.id)) {
                    icon.classList.add('md:mr-2');
                } else {
                    icon.classList.add('md:mr-2.5');
                }
                textSpan.classList.add('ml-2');
            }
        });
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
    clearTimeout(tooltipTimeout); // Assumes tooltipTimeout is global (from app_logic.js)
    iconTooltip.style.display = 'none';
}


// --- Apply Active Features (UI part) ---
function applyActiveFeatures() {
    // This function updates UI visibility based on featureFlags (global from app_logic.js)
    // It relies on feature-specific updateUIVisibility functions (e.g., from feature_*.js files)
    // or direct DOM manipulation as a fallback.

    const toggleElements = (selector, isEnabled) => {
        document.querySelectorAll(selector).forEach(el => el.classList.toggle('hidden', !isEnabled));
    };

    // Test Button Feature
    if (window.AppFeatures && typeof window.AppFeatures.updateTestButtonUIVisibility === 'function') {
        window.AppFeatures.updateTestButtonUIVisibility(featureFlags.testButtonFeature);
    } else {
        if (testFeatureButtonContainer) testFeatureButtonContainer.classList.toggle('hidden', !featureFlags.testButtonFeature);
    }

    // Task Timer System Feature
    if (window.AppFeatures && window.AppFeatures.TaskTimerSystem && typeof window.AppFeatures.TaskTimerSystem.updateUIVisibility === 'function') {
        window.AppFeatures.TaskTimerSystem.updateUIVisibility(featureFlags.taskTimerSystem);
    } else {
        toggleElements('.task-timer-system-element', featureFlags.taskTimerSystem);
        if (settingsTaskReviewBtn) settingsTaskReviewBtn.classList.toggle('hidden', !featureFlags.taskTimerSystem);
    }

    // Reminder Feature
    if (window.AppFeatures && typeof window.AppFeatures.updateReminderUIVisibility === 'function') {
        window.AppFeatures.updateReminderUIVisibility(featureFlags.reminderFeature);
    } else {
        toggleElements('.reminder-feature-element', featureFlags.reminderFeature);
    }
    // Ensure reminder options visibility is also updated based on checkbox state if feature is on
    if (featureFlags.reminderFeature) {
        if (modalRemindMeAdd && addTaskModal && !addTaskModal.classList.contains('hidden')) {
            if(reminderOptionsAdd) reminderOptionsAdd.classList.toggle('hidden', !modalRemindMeAdd.checked);
        }
        if (modalRemindMeViewEdit && viewEditTaskModal && !viewEditTaskModal.classList.contains('hidden')) {
            if(reminderOptionsViewEdit) reminderOptionsViewEdit.classList.toggle('hidden', !modalRemindMeViewEdit.checked);
        }
    } else {
        if (reminderOptionsAdd) reminderOptionsAdd.classList.add('hidden');
        if (reminderOptionsViewEdit) reminderOptionsViewEdit.classList.add('hidden');
    }

    // Advanced Recurrence Feature
    if (window.AppFeatures && typeof window.AppFeatures.updateAdvancedRecurrenceUIVisibility === 'function') {
        window.AppFeatures.updateAdvancedRecurrenceUIVisibility(featureFlags.advancedRecurrence);
    } else {
        toggleElements('.advanced-recurrence-element', featureFlags.advancedRecurrence);
    }

    // Other features
    toggleElements('.file-attachments-element', featureFlags.fileAttachments);
    toggleElements('.integrations-services-element', featureFlags.integrationsServices);
    toggleElements('.user-accounts-element', featureFlags.userAccounts);
    toggleElements('.collaboration-sharing-element', featureFlags.collaborationSharing);
    toggleElements('.cross-device-sync-element', featureFlags.crossDeviceSync);
    toggleElements('.tooltips-guide-element', featureFlags.tooltipsGuide);
    toggleElements('.sub-tasks-feature-element', featureFlags.subTasksFeature);

    if (settingsTooltipsGuideBtn) settingsTooltipsGuideBtn.classList.toggle('hidden', !featureFlags.tooltipsGuide);

    renderTasks(); // Re-render tasks to reflect any UI changes

    // If a task is being viewed, refresh its details modal
    if (currentViewTaskId && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) {
        // The openViewTaskDetailsModal function (now in modal_interactions.js) will handle re-rendering the modal content
        // including feature-dependent sections like the timer.
        // We need to ensure it's called if it's already open.
        // For simplicity, we can just re-call it.
        openViewTaskDetailsModal(currentViewTaskId); // This function is now external
    }
}


// --- Task Rendering ---
function renderTasks() {
    if (!taskList || !emptyState || !noMatchingTasks) return;
    taskList.innerHTML = '';
    let filteredTasks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Apply current filter (currentFilter is global from app_logic.js)
    if (currentFilter === 'inbox') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'today') {
        filteredTasks = tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const tdd = new Date(Date.UTC(parseInt(task.dueDate.substring(0,4)), parseInt(task.dueDate.substring(5,7))-1, parseInt(task.dueDate.substring(8,10))));
            return tdd.getTime() === today.getTime();
        });
    } else if (currentFilter === 'upcoming') {
        filteredTasks = tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const tdd = new Date(Date.UTC(parseInt(task.dueDate.substring(0,4)), parseInt(task.dueDate.substring(5,7))-1, parseInt(task.dueDate.substring(8,10))));
            return tdd.getTime() > today.getTime();
        });
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    } else {
        filteredTasks = tasks.filter(task => task.label && task.label.toLowerCase() === currentFilter.toLowerCase() && !task.completed);
    }

    // Apply search term (currentSearchTerm is global from app_logic.js)
    if (currentSearchTerm) {
        filteredTasks = filteredTasks.filter(task =>
            task.text.toLowerCase().includes(currentSearchTerm) ||
            (task.label && task.label.toLowerCase().includes(currentSearchTerm)) ||
            (task.notes && task.notes.toLowerCase().includes(currentSearchTerm))
        );
    }

    // Apply sorting (currentSort is global from app_logic.js)
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

    emptyState.classList.toggle('hidden', tasks.length !== 0);
    noMatchingTasks.classList.toggle('hidden', !(tasks.length > 0 && filteredTasks.length === 0));

    filteredTasks.forEach((task) => {
        const li = document.createElement('li');
        li.className = `task-item flex items-start justify-between bg-slate-100 dark:bg-slate-700 p-3 sm:p-3.5 rounded-lg shadow hover:shadow-md transition-shadow duration-300 ${task.completed ? 'opacity-60' : ''} overflow-hidden`;
        li.dataset.taskId = task.id;

        const mainContentClickableArea = document.createElement('div');
        mainContentClickableArea.className = 'task-item-clickable-area flex items-start flex-grow min-w-0 mr-2 rounded-l-lg';
        mainContentClickableArea.addEventListener('click', (event) => {
            if (event.target.type === 'checkbox' || event.target.closest('.task-actions')) {
                return;
            }
            openViewTaskDetailsModal(task.id); // This function is now external (modal_interactions.js)
        });

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.className = 'form-checkbox h-5 w-5 text-sky-500 rounded border-slate-400 dark:border-slate-500 focus:ring-sky-400 dark:focus:ring-sky-500 mt-0.5 mr-2 sm:mr-3 cursor-pointer flex-shrink-0';
        checkbox.addEventListener('change', () => toggleComplete(task.id));

        const textDetailsDiv = document.createElement('div');
        textDetailsDiv.className = 'flex flex-col flex-grow min-w-0';

        const span = document.createElement('span');
        span.textContent = task.text;
        let textColorClass = task.completed ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200';
        span.className = `text-sm sm:text-base break-words ${textColorClass} ${task.completed ? 'completed-text' : ''}`;
        textDetailsDiv.appendChild(span);

        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'flex items-center flex-wrap gap-x-2 gap-y-1 mt-1 sm:mt-1.5 text-xs';

        if (task.priority) {
            const pB = document.createElement('span');
            pB.textContent = task.priority;
            pB.className = `priority-badge ${getPriorityClass(task.priority)}`; // Assumes getPriorityClass is global (app_logic.js)
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
            let dD = formatDate(task.dueDate); // Assumes formatDate is global (app_logic.js)
            if (task.time) { dD += ` ${formatTime(task.time)}`; } // Assumes formatTime is global (app_logic.js)
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

        if (detailsContainer.hasChildNodes()) {
            textDetailsDiv.appendChild(detailsContainer);
        }

        mainContentClickableArea.appendChild(checkbox);
        mainContentClickableArea.appendChild(textDetailsDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions flex-shrink-0 self-start';

        const editButton = document.createElement('button');
        editButton.className = 'task-action-btn text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-500';
        editButton.innerHTML = '<i class="fas fa-pencil-alt"></i>';
        editButton.setAttribute('aria-label', 'Edit task');
        editButton.title = 'Edit task';
        editButton.addEventListener('click', () => openViewEditModal(task.id)); // This function is now external
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
        taskList.appendChild(li);
    });
    updateClearCompletedButtonState();
}


// --- Sub-task Rendering Functions ---
// These are called by modal functions (now external) or by event handlers within this file.
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
    const parentTask = tasks.find(t => t.id === parentId); // Assumes tasks is global

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
            toggleSubTaskCompleteLogic(parentId, subTask.id); // Assumes toggleSubTaskCompleteLogic is global (app_logic.js)
            renderSubTasksForEditModal(parentId, subTasksListElement);
            if (currentViewTaskId === parentId && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) {
                renderSubTasksForViewModal(parentId, modalSubTasksListViewDetails, viewSubTaskProgress, noSubTasksMessageViewDetails);
            }
            renderTasks();
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
                if (editSubTaskLogic(parentId, subTask.id, newText.trim())) { // Assumes editSubTaskLogic is global (app_logic.js)
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
                if (deleteSubTaskLogic(parentId, subTask.id)) { // Assumes deleteSubTaskLogic is global (app_logic.js)
                    renderSubTasksForEditModal(parentId, subTasksListElement);
                    if (currentViewTaskId === parentId && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) {
                        renderSubTasksForViewModal(parentId, modalSubTasksListViewDetails, viewSubTaskProgress, noSubTasksMessageViewDetails);
                    }
                    showMessage('Sub-task deleted.', 'success');
                    renderTasks();
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
        checkbox.className = 'form-checkbox h-4 w-4 text-sky-500 rounded border-slate-400 dark:border-slate-500 focus:ring-sky-400 mr-2 cursor-pointer';
        checkbox.addEventListener('change', () => {
            toggleSubTaskCompleteLogic(parentId, subTask.id);
            renderSubTasksForViewModal(parentId, subTasksListElement, progressElement, noSubTasksMessageElement);
            if (editingTaskId === parentId && viewEditTaskModal && !viewEditTaskModal.classList.contains('hidden')) {
                renderSubTasksForEditModal(parentId, modalSubTasksListViewEdit);
            }
            renderTasks();
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


// --- UI State Updaters ---
function updateSortButtonStates() {
    [sortByDueDateBtn, sortByPriorityBtn, sortByLabelBtn].forEach(btn => {
        if (btn) {
            let sortType = '';
            if (btn === sortByDueDateBtn) sortType = 'dueDate';
            else if (btn === sortByPriorityBtn) sortType = 'priority';
            else if (btn === sortByLabelBtn) sortType = 'label';
            btn.classList.toggle('sort-btn-active', currentSort === sortType); // currentSort is global
        }
    });
}

function updateClearCompletedButtonState() {
    if (!settingsClearCompletedBtn) return;
    const hasCompleted = tasks.some(task => task.completed); // tasks is global
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

// --- Event Handlers (for actions not directly opening/closing modals) ---
function handleAddTask(event) {
    event.preventDefault();
    const rawTaskText = modalTaskInputAdd.value.trim();
    const explicitDueDate = modalDueDateInputAdd.value;
    const time = modalTimeInputAdd.value;

    let estHours = 0, estMinutes = 0;
    if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem) {
        const estimates = window.AppFeatures.TaskTimerSystem.getEstimatesFromAddModal();
        estHours = estimates.estHours;
        estMinutes = estimates.estMinutes;
    }

    const priority = modalPriorityInputAdd.value;
    const label = modalLabelInputAdd.value.trim();
    const notes = modalNotesInputAdd.value.trim();

    let isReminderSet = false, reminderDate = null, reminderTime = null, reminderEmail = null;
    if (featureFlags.reminderFeature && modalRemindMeAdd) {
        isReminderSet = modalRemindMeAdd.checked;
        if (isReminderSet) {
            reminderDate = modalReminderDateAdd.value;
            reminderTime = modalReminderTimeAdd.value;
            reminderEmail = modalReminderEmailAdd.value.trim();
            if (!reminderDate || !reminderTime || !reminderEmail || !/^\S+@\S+\.\S+$/.test(reminderEmail)) {
                showMessage('Please provide valid reminder details (date, time, and a valid email).', 'error');
                return;
            }
        }
    }

    if (rawTaskText === '') {
        showMessage('Task description cannot be empty!', 'error');
        modalTaskInputAdd.focus();
        return;
    }

    let finalDueDate = explicitDueDate;
    let finalTaskText = rawTaskText;
    if (!explicitDueDate) {
        const { parsedDate: dateFromDesc, remainingText: textAfterDate } = parseDateFromText(rawTaskText); // parseDateFromText from app_logic.js
        if (dateFromDesc) {
            finalDueDate = dateFromDesc;
            finalTaskText = textAfterDate.trim() || rawTaskText;
        }
    }

    const subTasksToSave = featureFlags.subTasksFeature ? tempSubTasksForAddModal.map(st => ({
        id: Date.now() + Math.random(),
        text: st.text,
        completed: st.completed,
        creationDate: Date.now()
    })) : [];

    const newTask = {
        id: Date.now(),
        text: finalTaskText,
        completed: false,
        creationDate: Date.now(),
        dueDate: finalDueDate || null,
        time: time || null,
        estimatedHours: estHours,
        estimatedMinutes: estMinutes,
        priority: priority,
        label: label || '',
        notes: notes || '',
        isReminderSet,
        reminderDate,
        reminderTime,
        reminderEmail,
        timerStartTime: null,
        timerAccumulatedTime: 0,
        timerIsRunning: false,
        timerIsPaused: false,
        actualDurationMs: 0,
        attachments: [],
        completedDate: null,
        subTasks: subTasksToSave,
        recurrenceRule: null,
        recurrenceEndDate: null,
        nextDueDate: finalDueDate || null
    };

    tasks.unshift(newTask); // tasks is global
    saveTasks(); // saveTasks is global (app_logic.js)

    if (currentFilter === 'completed') { // currentFilter is global
        setFilter('inbox');
    } else {
        renderTasks();
    }
    closeAddModal(); // This function is now external (modal_interactions.js)
    showMessage('Task added successfully!', 'success');
}

function handleEditTask(event) {
    event.preventDefault();
    const taskId = parseInt(modalViewEditTaskId.value);
    const taskText = modalTaskInputViewEdit.value.trim();
    const dueDate = modalDueDateInputViewEdit.value;
    const time = modalTimeInputViewEdit.value;

    let estHours = 0, estMinutes = 0;
    const originalTask = tasks.find(t => t.id === taskId);
    if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem) {
        const estimates = window.AppFeatures.TaskTimerSystem.getEstimatesFromEditModal();
        estHours = estimates.estHours;
        estMinutes = estimates.estMinutes;
    } else if (originalTask) {
        estHours = originalTask.estimatedHours;
        estMinutes = originalTask.estimatedMinutes;
    }

    const priority = modalPriorityInputViewEdit.value;
    const label = modalLabelInputViewEdit.value.trim();
    const notes = modalNotesInputViewEdit.value.trim();

    let isReminderSet = false, reminderDate = null, reminderTime = null, reminderEmail = null;
    if (featureFlags.reminderFeature && modalRemindMeViewEdit) {
        isReminderSet = modalRemindMeViewEdit.checked;
        if (isReminderSet) {
            reminderDate = modalReminderDateViewEdit.value;
            reminderTime = modalReminderTimeViewEdit.value;
            reminderEmail = modalReminderEmailViewEdit.value.trim();
            if (!reminderDate || !reminderTime || !reminderEmail || !/^\S+@\S+\.\S+$/.test(reminderEmail)) {
                showMessage('Please provide valid reminder details (date, time, and a valid email).', 'error');
                return;
            }
        }
    }

    if (taskText === '') {
        showMessage('Task description cannot be empty!', 'error');
        modalTaskInputViewEdit.focus();
        return;
    }

    tasks = tasks.map(task => // tasks is global
        task.id === taskId ? {
            ...task,
            text: taskText,
            dueDate: dueDate || null,
            time: time || null,
            estimatedHours: estHours,
            estimatedMinutes: estMinutes,
            priority: priority,
            label: label || '',
            notes: notes || '',
            isReminderSet,
            reminderDate,
            reminderTime,
            reminderEmail,
            attachments: task.attachments || []
        } : task
    );
    saveTasks(); // saveTasks is global
    renderTasks();
    closeViewEditModal(); // This function is now external
    showMessage('Task updated successfully!', 'success');

    if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem && currentViewTaskId === taskId) { // currentViewTaskId is global
        const updatedTask = tasks.find(t => t.id === taskId);
        if (updatedTask) {
             window.AppFeatures.TaskTimerSystem.setupTimerForModal(updatedTask);
        }
    }
}

function toggleComplete(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    tasks[taskIndex].completedDate = tasks[taskIndex].completed ? Date.now() : null;

    if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem) {
        window.AppFeatures.TaskTimerSystem.handleTaskCompletion(taskId, tasks[taskIndex].completed);
    }
    saveTasks();
    renderTasks();

    if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem && currentViewTaskId === taskId) {
         const task = tasks.find(t => t.id === taskId);
         if(task && window.AppFeatures.TaskTimerSystem.setupTimerForModal) window.AppFeatures.TaskTimerSystem.setupTimerForModal(task);
    }
}

function deleteTask(taskId) {
    if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem && currentViewTaskId === taskId) {
        window.AppFeatures.TaskTimerSystem.clearTimerOnModalClose();
    }
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
    showMessage('Task deleted.', 'error');
}

function setFilter(filter) {
    setAppCurrentFilter(filter); // setAppCurrentFilter from app_logic.js
    updateSortButtonStates();

    smartViewButtons.forEach(button => {
        const isActive = button.dataset.filter === filter;
        const baseInactiveClasses = ['bg-slate-200', 'text-slate-700', 'hover:bg-slate-300', 'dark:bg-slate-700', 'dark:text-slate-300', 'dark:hover:bg-slate-600'];
        const iconInactiveClasses = ['text-slate-500', 'dark:text-slate-400'];
        const activeClasses = ['bg-sky-500', 'text-white', 'font-semibold', 'dark:bg-sky-600', 'dark:text-sky-50'];
        const iconActiveClasses = ['text-sky-100', 'dark:text-sky-200'];

        button.classList.remove(...baseInactiveClasses, ...activeClasses);
        button.querySelector('i')?.classList.remove(...iconInactiveClasses, ...iconActiveClasses);

        if (isActive) {
            button.classList.add(...activeClasses);
            button.querySelector('i')?.classList.add(...iconActiveClasses);
        } else {
            button.classList.add(...baseInactiveClasses);
            button.querySelector('i')?.classList.add(...iconInactiveClasses);
        }
    });
    renderTasks();
}

function clearCompletedTasks() {
    const completedCount = tasks.filter(task => task.completed).length;
    if (completedCount === 0) {
        showMessage('No completed tasks to clear.', 'error');
        return;
    }
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
    showMessage(`${completedCount} completed task${completedCount > 1 ? 's' : ''} cleared.`, 'success');
    closeSettingsModal(); // This function is now external
}

function handleAddNewLabel(event) {
    event.preventDefault();
    const labelName = newLabelInput.value.trim();
    if (labelName === '') {
        showMessage('Label name cannot be empty.', 'error');
        return;
    }
    if (uniqueLabels.some(l => l.toLowerCase() === labelName.toLowerCase())) { // uniqueLabels is global
        showMessage(`Label "${labelName}" already exists.`, 'error');
        return;
    }
    uniqueLabels.push(labelName);
    uniqueLabels.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    saveTasks(); // To update uniqueLabels implicitly if needed by app_logic's updateUniqueLabels
    if (typeof populateManageLabelsList === 'function') { // This function is now external
        populateManageLabelsList();
    }
    newLabelInput.value = '';
    showMessage(`Label "${labelName}" added.`, 'success');
}

function handleDeleteLabel(labelToDelete) {
    tasks = tasks.map(task => {
        if (task.label && task.label.toLowerCase() === labelToDelete.toLowerCase()) {
            return { ...task, label: '' };
        }
        return task;
    });
    saveTasks(); // This will trigger updateUniqueLabels in app_logic.js
    if (typeof populateManageLabelsList === 'function') { // This function is now external
        populateManageLabelsList();
    }
    renderTasks();
    showMessage(`Label "${labelToDelete}" deleted. Tasks using it have been unlabelled.`, 'success');
}

function handleAddSubTaskViewEdit() {
    if (!featureFlags.subTasksFeature || !editingTaskId || !modalSubTaskInputViewEdit) return; // editingTaskId is global
    const subTaskText = modalSubTaskInputViewEdit.value.trim();
    if (subTaskText === '') {
        showMessage('Sub-task description cannot be empty.', 'error');
        modalSubTaskInputViewEdit.focus();
        return;
    }
    if (addSubTaskLogic(editingTaskId, subTaskText)) { // addSubTaskLogic from app_logic.js
        renderSubTasksForEditModal(editingTaskId, modalSubTasksListViewEdit);
        modalSubTaskInputViewEdit.value = '';
        showMessage('Sub-task added.', 'success');
        if (currentViewTaskId === editingTaskId && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) {
            renderSubTasksForViewModal(editingTaskId, modalSubTasksListViewDetails, viewSubTaskProgress, noSubTasksMessageViewDetails);
        }
        renderTasks();
    } else {
        showMessage('Failed to add sub-task.', 'error');
    }
}

function handleAddTempSubTaskForAddModal() {
    if (!featureFlags.subTasksFeature || !modalSubTaskInputAdd) return;
    const subTaskText = modalSubTaskInputAdd.value.trim();
    if (subTaskText === '') {
        showMessage('Sub-task description cannot be empty.', 'error');
        modalSubTaskInputAdd.focus();
        return;
    }
    tempSubTasksForAddModal.push({ text: subTaskText, completed: false });
    renderTempSubTasksForAddModal();
    modalSubTaskInputAdd.value = '';
}


// --- Event Listeners Setup ---
function setupEventListeners() {
    // Modal Openers and Form Submissions
    if (openAddModalButton) openAddModalButton.addEventListener('click', openAddModal); // openAddModal is external
    if (closeAddModalBtn) closeAddModalBtn.addEventListener('click', closeAddModal); // closeAddModal is external
    if (cancelAddModalBtn) cancelAddModalBtn.addEventListener('click', closeAddModal); // closeAddModal is external
    if (modalTodoFormAdd) modalTodoFormAdd.addEventListener('submit', handleAddTask);
    if (addTaskModal) addTaskModal.addEventListener('click', (event) => { if (event.target === addTaskModal) closeAddModal(); });

    if (closeViewEditModalBtn) closeViewEditModalBtn.addEventListener('click', closeViewEditModal); // closeViewEditModal is external
    if (cancelViewEditModalBtn) cancelViewEditModalBtn.addEventListener('click', closeViewEditModal); // closeViewEditModal is external
    if (modalTodoFormViewEdit) modalTodoFormViewEdit.addEventListener('submit', handleEditTask);
    if (viewEditTaskModal) viewEditTaskModal.addEventListener('click', (event) => { if (event.target === viewEditTaskModal) closeViewEditModal(); });

    if (closeViewDetailsModalBtn) closeViewDetailsModalBtn.addEventListener('click', closeViewTaskDetailsModal); // external
    if (closeViewDetailsSecondaryBtn) closeViewDetailsSecondaryBtn.addEventListener('click', closeViewTaskDetailsModal); // external
    if (editFromViewModalBtn) editFromViewModalBtn.addEventListener('click', () => { if (currentViewTaskId !== null) { closeViewTaskDetailsModal(); openViewEditModal(currentViewTaskId); } }); // external calls
    if(deleteFromViewModalBtn) { deleteFromViewModalBtn.addEventListener('click', () => { if (currentViewTaskId !== null) { deleteTask(currentViewTaskId); closeViewTaskDetailsModal(); } }); } // external call
    if (viewTaskDetailsModal) viewTaskDetailsModal.addEventListener('click', (event) => { if (event.target === viewTaskDetailsModal) closeViewTaskDetailsModal(); }); // external

    if (closeManageLabelsModalBtn) closeManageLabelsModalBtn.addEventListener('click', closeManageLabelsModal); // external
    if (closeManageLabelsSecondaryBtn) closeManageLabelsSecondaryBtn.addEventListener('click', closeManageLabelsModal); // external
    if (addNewLabelForm) addNewLabelForm.addEventListener('submit', handleAddNewLabel);
    if (manageLabelsModal) manageLabelsModal.addEventListener('click', (event) => { if (event.target === manageLabelsModal) closeManageLabelsModal(); }); // external

    if (openSettingsModalButton) openSettingsModalButton.addEventListener('click', openSettingsModal); // external
    if (closeSettingsModalBtn) closeSettingsModalBtn.addEventListener('click', closeSettingsModal); // external
    if (closeSettingsSecondaryBtn) closeSettingsSecondaryBtn.addEventListener('click', closeSettingsModal); // external
    if (settingsModal) settingsModal.addEventListener('click', (event) => { if (event.target === settingsModal) closeSettingsModal(); }); // external
    if (settingsClearCompletedBtn) settingsClearCompletedBtn.addEventListener('click', clearCompletedTasks);
    if (settingsManageLabelsBtn) { settingsManageLabelsBtn.addEventListener('click', () => { closeSettingsModal(); openManageLabelsModal(); }); } // external calls
    if (settingsManageRemindersBtn) { settingsManageRemindersBtn.addEventListener('click', () => { if(featureFlags.reminderFeature) { showMessage('Manage Reminders - Coming soon!', 'info'); } else { showMessage('Enable Reminder System in Feature Flags.', 'error'); }});}
    if (settingsTaskReviewBtn) { settingsTaskReviewBtn.addEventListener('click', () => { closeSettingsModal(); openTaskReviewModal(); });} // external calls
    if (settingsTooltipsGuideBtn) { settingsTooltipsGuideBtn.addEventListener('click', () => {closeSettingsModal(); openTooltipsGuideModal(); }); } // external calls
    const nonFunctionalFeatureMessageHandler = (featureName) => { showMessage(`${featureName} feature is not yet implemented. Coming soon!`, 'info'); };
    if (settingsIntegrationsBtn) settingsIntegrationsBtn.addEventListener('click', () => nonFunctionalFeatureMessageHandler('Integrations'));
    if (settingsUserAccountsBtn) settingsUserAccountsBtn.addEventListener('click', () => nonFunctionalFeatureMessageHandler('User Accounts'));
    if (settingsCollaborationBtn) settingsCollaborationBtn.addEventListener('click', () => nonFunctionalFeatureMessageHandler('Collaboration'));
    if (settingsSyncBackupBtn) settingsSyncBackupBtn.addEventListener('click', () => nonFunctionalFeatureMessageHandler('Sync & Backup'));

    if (closeTaskReviewModalBtn) closeTaskReviewModalBtn.addEventListener('click', closeTaskReviewModal); // external
    if (closeTaskReviewSecondaryBtn) closeTaskReviewSecondaryBtn.addEventListener('click', closeTaskReviewModal); // external
    if (taskReviewModal) taskReviewModal.addEventListener('click', (event) => { if (event.target === taskReviewModal) closeTaskReviewModal(); }); // external

    if (closeTooltipsGuideModalBtn) closeTooltipsGuideModalBtn.addEventListener('click', closeTooltipsGuideModal); // external
    if (closeTooltipsGuideSecondaryBtn) closeTooltipsGuideSecondaryBtn.addEventListener('click', closeTooltipsGuideModal); // external
    if (tooltipsGuideModal) tooltipsGuideModal.addEventListener('click', (event) => { if (event.target === tooltipsGuideModal) closeTooltipsGuideModal(); }); // external

    // Reminder toggles in Modals (event listeners for checkboxes within modals)
    if (modalRemindMeAdd) {
        modalRemindMeAdd.addEventListener('change', () => {
            if(featureFlags.reminderFeature && reminderOptionsAdd) {
                reminderOptionsAdd.classList.toggle('hidden', !modalRemindMeAdd.checked);
                if (modalRemindMeAdd.checked) {
                    if (modalDueDateInputAdd.value && !modalReminderDateAdd.value) modalReminderDateAdd.value = modalDueDateInputAdd.value;
                    if (modalTimeInputAdd.value && !modalReminderTimeAdd.value) modalReminderTimeAdd.value = modalTimeInputAdd.value;
                    const today = new Date();
                    modalReminderDateAdd.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                }
            } else if (reminderOptionsAdd) {
                reminderOptionsAdd.classList.add('hidden');
            }
        });
    }
    if (modalRemindMeViewEdit) {
        modalRemindMeViewEdit.addEventListener('change', () => {
            if(featureFlags.reminderFeature && reminderOptionsViewEdit) {
                reminderOptionsViewEdit.classList.toggle('hidden', !modalRemindMeViewEdit.checked);
                if (modalRemindMeViewEdit.checked) {
                     const today = new Date();
                     modalReminderDateViewEdit.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                }
            } else if (reminderOptionsViewEdit) {
                reminderOptionsViewEdit.classList.add('hidden');
            }
        });
    }

    // Smart Views & Search
    if (smartViewButtonsContainer) {
        smartViewButtonsContainer.addEventListener('click', (event) => {
            const button = event.target.closest('.smart-view-btn');
            if (button && button.dataset.filter) {
                setFilter(button.dataset.filter);
            }
        });
    }
    if (taskSearchInput) {
        taskSearchInput.addEventListener('input', (event) => {
            setAppSearchTerm(event.target.value.trim().toLowerCase()); // setAppSearchTerm from app_logic.js
            renderTasks();
        });
    }

    // Sidebar
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', () => {
            const isCurrentlyMinimized = taskSidebar.classList.contains('sidebar-minimized');
            setSidebarMinimized(!isCurrentlyMinimized);
        });
    }
    sidebarIconOnlyButtons.forEach(button => {
        button.addEventListener('mouseenter', (event) => {
            if (!taskSidebar.classList.contains('sidebar-minimized')) return;
            clearTimeout(tooltipTimeout); // tooltipTimeout is global
            tooltipTimeout = setTimeout(() => {
                const tooltipText = button.title || button.querySelector('.sidebar-text-content')?.textContent.trim();
                if (tooltipText) {
                    showTooltip(event.currentTarget, tooltipText);
                }
            }, 500);
        });
        button.addEventListener('mouseleave', () => {
            hideTooltip();
        });
    });

    // Sort Buttons
    if (sortByDueDateBtn) sortByDueDateBtn.addEventListener('click', () => { setAppCurrentSort(currentSort === 'dueDate' ? 'default' : 'dueDate'); updateSortButtonStates(); renderTasks(); }); // setAppCurrentSort from app_logic.js
    if (sortByPriorityBtn) sortByPriorityBtn.addEventListener('click', () => { setAppCurrentSort(currentSort === 'priority' ? 'default' : 'priority'); updateSortButtonStates(); renderTasks(); });
    if (sortByLabelBtn) sortByLabelBtn.addEventListener('click', () => { setAppCurrentSort(currentSort === 'label' ? 'default' : 'label'); updateSortButtonStates(); renderTasks(); });

    // Sub-task input and add buttons
    if (modalAddSubTaskBtnViewEdit) { modalAddSubTaskBtnViewEdit.addEventListener('click', handleAddSubTaskViewEdit); }
    if (modalSubTaskInputViewEdit) { modalSubTaskInputViewEdit.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); handleAddSubTaskViewEdit(); } }); }
    if (modalAddSubTaskBtnAdd) { modalAddSubTaskBtnAdd.addEventListener('click', handleAddTempSubTaskForAddModal); }
    if (modalSubTaskInputAdd) { modalSubTaskInputAdd.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); handleAddTempSubTaskForAddModal(); } }); }

    // Global Keydown Listener
    document.addEventListener('keydown', (event) => {
        const isAddModalOpen = addTaskModal && !addTaskModal.classList.contains('hidden');
        const isViewEditModalOpen = viewEditTaskModal && !viewEditTaskModal.classList.contains('hidden');
        const isViewDetailsModalOpen = viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden');
        const isManageLabelsModalOpen = manageLabelsModal && !manageLabelsModal.classList.contains('hidden');
        const isSettingsModalOpen = settingsModal && !settingsModal.classList.contains('hidden');
        const isTaskReviewModalOpen = taskReviewModal && !taskReviewModal.classList.contains('hidden');
        const isTooltipsGuideModalOpen = tooltipsGuideModal && !tooltipsGuideModal.classList.contains('hidden');
        const isFeatureFlagsModalOpen = document.getElementById('featureFlagsModal') && !document.getElementById('featureFlagsModal').classList.contains('hidden');

        const isAnyModalOpen = isAddModalOpen || isViewEditModalOpen || isViewDetailsModalOpen ||
                               isManageLabelsModalOpen || isSettingsModalOpen  || isTaskReviewModalOpen ||
                               isTooltipsGuideModalOpen || isFeatureFlagsModalOpen;

        const isInputFocused = document.activeElement.tagName === 'INPUT' ||
                               document.activeElement.tagName === 'SELECT' ||
                               document.activeElement.tagName === 'TEXTAREA';
        const isSubTaskInputFocused = document.activeElement === modalSubTaskInputViewEdit || document.activeElement === modalSubTaskInputAdd;

        if ((event.key === '+' || event.key === '=') && !isAnyModalOpen && !isInputFocused && !isSubTaskInputFocused) {
            event.preventDefault();
            openAddModal(); // This function is now external
        }
        if (event.key === 'Escape') {
            // All close modal functions are now external
            if (isAddModalOpen && typeof closeAddModal === 'function') closeAddModal();
            else if (isViewEditModalOpen && typeof closeViewEditModal === 'function') closeViewEditModal();
            else if (isViewDetailsModalOpen && typeof closeViewTaskDetailsModal === 'function') closeViewTaskDetailsModal();
            else if (isManageLabelsModalOpen && typeof closeManageLabelsModal === 'function') closeManageLabelsModal();
            else if (isSettingsModalOpen && typeof closeSettingsModal === 'function') closeSettingsModal();
            else if (isTaskReviewModalOpen && typeof closeTaskReviewModal === 'function') closeTaskReviewModal();
            else if (isTooltipsGuideModalOpen && typeof closeTooltipsGuideModal === 'function') closeTooltipsGuideModal();
            else if (isFeatureFlagsModalOpen) {
                const closeBtn = document.getElementById('closeFeatureFlagsModalBtn'); // Assuming Feature Flags modal has its own close logic or button
                if (closeBtn && typeof closeBtn.click === 'function') closeBtn.click();
            }
        }
    });
}

// --- Global Initialization ---
window.onload = async () => {
    console.log("window.onload in ui_interactions.js starting");
    await loadFeatureFlags(); // loadFeatureFlags from app_logic.js
    initializeTasks();    // initializeTasks from app_logic.js
    updateUniqueLabels(); // updateUniqueLabels from app_logic.js
    populateDatalist(existingLabelsDatalist);
    populateDatalist(existingLabelsEditDatalist);

    // Initialize feature modules (these are self-initializing or have their init functions called)
    if (window.AppFeatures) {
        if (window.AppFeatures.initializeTestButtonFeature) {
            window.AppFeatures.initializeTestButtonFeature();
        }
        if (window.AppFeatures.TaskTimerSystem && typeof window.AppFeatures.TaskTimerSystem.initialize === 'function') {
            window.AppFeatures.TaskTimerSystem.initialize();
        }
        if (window.AppFeatures.initializeReminderFeature) {
            window.AppFeatures.initializeReminderFeature();
        }
        if (window.AppFeatures.initializeAdvancedRecurrenceFeature) {
            window.AppFeatures.initializeAdvancedRecurrenceFeature();
        }
    }

    applyActiveFeatures();

    smartViewButtons.forEach(button => {
        button.classList.add('bg-slate-200', 'text-slate-700', 'hover:bg-slate-300', 'dark:bg-slate-700', 'dark:text-slate-300', 'dark:hover:bg-slate-600');
        button.querySelector('i')?.classList.add('text-slate-500', 'dark:text-slate-400');
    });

    const savedSidebarState = localStorage.getItem('sidebarState');
    if (savedSidebarState === 'minimized') {
        setSidebarMinimized(true);
    } else {
        setSidebarMinimized(false);
    }

    if (typeof setFilter === 'function') {
        setFilter(currentFilter); // currentFilter is global
    } else {
        console.error("setFilter function is not defined when called in window.onload!");
    }
    updateSortButtonStates();
    updateClearCompletedButtonState();
    setupEventListeners();
};
