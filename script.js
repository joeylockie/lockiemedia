// --- DOM Elements ---
// Sidebar elements
const taskSidebar = document.getElementById('taskSidebar');
const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
const sidebarToggleIcon = document.getElementById('sidebarToggleIcon');
const sidebarTextElements = taskSidebar.querySelectorAll('.sidebar-text-content');
const sidebarIconOnlyButtons = taskSidebar.querySelectorAll('.sidebar-button-icon-only');
const iconTooltip = document.getElementById('iconTooltip');

// Main content elements
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

// Add Task Modal elements
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

// View/Edit Task Modal elements
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

// View Task Details Modal elements
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

// Timer elements in View Task Details Modal
const taskTimerSection = document.getElementById('taskTimerSection');
const viewTaskTimerDisplay = document.getElementById('viewTaskTimerDisplay');
const viewTaskStartTimerBtn = document.getElementById('viewTaskStartTimerBtn');
const viewTaskPauseTimerBtn = document.getElementById('viewTaskPauseTimerBtn');
const viewTaskStopTimerBtn = document.getElementById('viewTaskStopTimerBtn');
const viewTaskActualDuration = document.getElementById('viewTaskActualDuration');
const timerButtonsContainer = document.getElementById('timerButtonsContainer');

// Manage Labels Modal elements
const manageLabelsModal = document.getElementById('manageLabelsModal');
const modalDialogManageLabels = document.getElementById('modalDialogManageLabels');
const closeManageLabelsModalBtn = document.getElementById('closeManageLabelsModalBtn');
const closeManageLabelsSecondaryBtn = document.getElementById('closeManageLabelsSecondaryBtn');
const addNewLabelForm = document.getElementById('addNewLabelForm');
const newLabelInput = document.getElementById('newLabelInput');
const existingLabelsList = document.getElementById('existingLabelsList');

// Settings Modal elements
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

// Task Review Modal elements
const taskReviewModal = document.getElementById('taskReviewModal');
const modalDialogTaskReview = document.getElementById('modalDialogTaskReview');
const closeTaskReviewModalBtn = document.getElementById('closeTaskReviewModalBtn');
const closeTaskReviewSecondaryBtn = document.getElementById('closeTaskReviewSecondaryBtn');
const taskReviewContent = document.getElementById('taskReviewContent');

// Tooltips Guide Modal elements
const tooltipsGuideModal = document.getElementById('tooltipsGuideModal');
const modalDialogTooltipsGuide = document.getElementById('modalDialogTooltipsGuide');
const closeTooltipsGuideModalBtn = document.getElementById('closeTooltipsGuideModalBtn');
const closeTooltipsGuideSecondaryBtn = document.getElementById('closeTooltipsGuideSecondaryBtn');
const tooltipsGuideContent = document.getElementById('tooltipsGuideContent'); // Note: This ID was duplicated, ensure it's correct or rename if needed.

// Test Feature Button elements
const testFeatureButtonContainer = document.getElementById('testFeatureButtonContainer');
const testFeatureButton = document.getElementById('testFeatureButton');

// Feature Flags Modal (assuming it will be used from JS, though not explicitly shown in current HTML structure provided to me previously for flags modal itself)
// const featureFlagsModal = document.getElementById('featureFlagsModal');
// const modalDialogFeatureFlags = document.getElementById('modalDialogFeatureFlags');
// const closeFeatureFlagsModalBtn = document.getElementById('closeFeatureFlagsModalBtn');
// const closeFeatureFlagsSecondaryBtn = document.getElementById('closeFeatureFlagsSecondaryBtn');
// const featureFlagsListContainer = document.getElementById('featureFlagsListContainer');


// --- Application State ---
let tasks = JSON.parse(localStorage.getItem('todos_v3')) || [];
let currentFilter = 'inbox';
let currentSort = 'default';
let currentSearchTerm = '';
let editingTaskId = null;
let currentViewTaskId = null;
let tooltipTimeout = null;
let uniqueLabels = [];
// Default feature flags, will be overridden by the JSON file if successfully loaded
let featureFlags = {
    testButtonFeature: false,
    reminderFeature: false,
    taskTimerSystem: false,
    advancedRecurrence: false,
    fileAttachments: false,
    integrationsServices: false,
    userAccounts: false,
    collaborationSharing: false,
    crossDeviceSync: false,
    tooltipsGuide: false
};
let currentTaskTimerInterval = null;


// --- Theme Management ---
// This function should be called early, ideally from the <head> or at the very top of this script if moved from head.
function applyInitialTheme() {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}
// Call it if you move it from <head>
// applyInitialTheme(); // Uncomment if you remove the script from <head>

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (localStorage.getItem('theme') !== (event.matches ? 'dark' : 'light')) { // Only change if not manually overridden
        if (event.matches) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }
});

// --- Sidebar Toggle Functionality ---
function setSidebarMinimized(minimize) {
    hideTooltip();
    if (minimize) {
        taskSidebar.classList.remove('md:w-72', 'lg:w-80', 'w-full', 'p-5', 'sm:p-6', 'md:p-5', 'sm:p-4');
        taskSidebar.classList.add('w-16', 'p-3', 'sidebar-minimized');
        sidebarToggleIcon.classList.remove('fa-chevron-left');
        sidebarToggleIcon.classList.add('fa-chevron-right');
        sidebarTextElements.forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.sidebar-section-title, #taskSearchInputContainer, #testFeatureButtonContainer .sidebar-text-content').forEach(el => el.classList.add('hidden'));
        sidebarIconOnlyButtons.forEach(btn => {
            btn.classList.add('justify-center');
            const icon = btn.querySelector('i');
            if(icon) icon.classList.remove('md:mr-2', 'md:mr-2.5', 'ml-2');
        });
        if (testFeatureButton) testFeatureButton.querySelector('.sidebar-text-content')?.classList.add('hidden');
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
            if(icon && textSpan && !textSpan.classList.contains('hidden')) {
                if (btn.id === 'openAddModalButton' || btn.id === 'openSettingsModalButton' || (testFeatureButton && btn.id === testFeatureButton.id)) {
                    icon.classList.add('md:mr-2');
                } else {
                    icon.classList.add('md:mr-2.5');
                }
                textSpan.classList.add('ml-2');
            }
        });
        if (testFeatureButton) testFeatureButton.querySelector('.sidebar-text-content')?.classList.remove('hidden');
        localStorage.setItem('sidebarState', 'expanded');
    }
    applyActiveFeatures(); // Ensures features are correctly displayed after sidebar state change
}

// --- Tooltip Functions ---
function showTooltip(element, text) {
    if (!taskSidebar.classList.contains('sidebar-minimized')) return;
    iconTooltip.textContent = text;
    const rect = element.getBoundingClientRect();
    iconTooltip.style.left = `${rect.right + 10}px`;
    iconTooltip.style.top = `${rect.top + (rect.height / 2) - (iconTooltip.offsetHeight / 2)}px`;
    iconTooltip.style.display = 'block';
}

function hideTooltip() {
    clearTimeout(tooltipTimeout);
    iconTooltip.style.display = 'none';
}

sidebarIconOnlyButtons.forEach(button => {
    button.addEventListener('mouseenter', (event) => {
        if (!taskSidebar.classList.contains('sidebar-minimized')) return;
        clearTimeout(tooltipTimeout);
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


// --- Modal Functions (Add Task) ---
function openAddModal() {
    if (document.activeElement.tagName === 'INPUT' ||
        document.activeElement.tagName === 'SELECT' ||
        document.activeElement.tagName === 'TEXTAREA') {
        // Do not open if an input is already focused, to prevent issues with keyboard shortcuts
        // or if add modal is already open
        if (!addTaskModal.classList.contains('hidden')) return;
    }
    addTaskModal.classList.remove('hidden');
    setTimeout(() => {
        modalDialogAdd.classList.remove('scale-95', 'opacity-0');
        modalDialogAdd.classList.add('scale-100', 'opacity-100');
    }, 10);
    modalTaskInputAdd.focus();
    modalTodoFormAdd.reset();
    modalPriorityInputAdd.value = 'medium';
    populateDatalist(existingLabelsDatalist);

    modalEstHoursAdd.value = '';
    modalEstMinutesAdd.value = '';

    modalRemindMeAdd.checked = false;
    modalReminderDateAdd.value = '';
    modalReminderTimeAdd.value = '';
    modalReminderEmailAdd.value = '';
    if (reminderOptionsAdd) reminderOptionsAdd.classList.add('hidden');

    const today = new Date();
    const year = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${mm}-${dd}`;
    modalDueDateInputAdd.min = todayStr;
    if (modalReminderDateAdd) modalReminderDateAdd.min = todayStr;

    applyActiveFeatures();
}

function closeAddModal() {
    modalDialogAdd.classList.add('scale-95', 'opacity-0');
    modalDialogAdd.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        addTaskModal.classList.add('hidden');
    }, 200);
}

// --- Modal Functions (View/Edit Task) ---
function openViewEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    editingTaskId = taskId;

    modalViewEditTaskId.value = task.id;
    modalTaskInputViewEdit.value = task.text;
    modalDueDateInputViewEdit.value = task.dueDate || '';
    modalTimeInputViewEdit.value = task.time || '';
    if (modalEstHoursViewEdit) modalEstHoursViewEdit.value = task.estimatedHours || '';
    if (modalEstMinutesViewEdit) modalEstMinutesViewEdit.value = task.estimatedMinutes || '';
    modalPriorityInputViewEdit.value = task.priority;
    modalLabelInputViewEdit.value = task.label || '';
    populateDatalist(existingLabelsEditDatalist);
    modalNotesInputViewEdit.value = task.notes || '';
    if (featureFlags.fileAttachments && existingAttachmentsViewEdit) {
        existingAttachmentsViewEdit.textContent = task.attachments && task.attachments.length > 0 ? `${task.attachments.length} file(s) attached (management UI coming soon)` : 'No files attached yet.';
    }

    if (featureFlags.reminderFeature && modalRemindMeViewEdit) {
        modalRemindMeViewEdit.checked = task.isReminderSet || false;
        if (reminderOptionsViewEdit) reminderOptionsViewEdit.classList.toggle('hidden', !modalRemindMeViewEdit.checked);
        if (modalRemindMeViewEdit.checked) {
            if (modalReminderDateViewEdit) modalReminderDateViewEdit.value = task.reminderDate || '';
            if (modalReminderTimeViewEdit) modalReminderTimeViewEdit.value = task.reminderTime || '';
            if (modalReminderEmailViewEdit) modalReminderEmailViewEdit.value = task.reminderEmail || '';
        } else {
            if (modalReminderDateViewEdit) modalReminderDateViewEdit.value = '';
            if (modalReminderTimeViewEdit) modalReminderTimeViewEdit.value = '';
            if (modalReminderEmailViewEdit) modalReminderEmailViewEdit.value = '';
        }
    } else {
        if (modalRemindMeViewEdit) modalRemindMeViewEdit.checked = false;
        if (reminderOptionsViewEdit) reminderOptionsViewEdit.classList.add('hidden');
    }

    const today = new Date();
    const year = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${mm}-${dd}`;
    modalDueDateInputViewEdit.min = todayStr;
    if (modalReminderDateViewEdit) modalReminderDateViewEdit.min = todayStr;

    viewEditTaskModal.classList.remove('hidden');
    setTimeout(() => {
        modalDialogViewEdit.classList.remove('scale-95', 'opacity-0');
        modalDialogViewEdit.classList.add('scale-100', 'opacity-100');
    }, 10);
    modalTaskInputViewEdit.focus();
    applyActiveFeatures();
}

function closeViewEditModal() {
    modalDialogViewEdit.classList.add('scale-95', 'opacity-0');
    modalDialogViewEdit.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        viewEditTaskModal.classList.add('hidden');
        editingTaskId = null;
    }, 200);
}

// --- Helper function to format duration (e.g., "1 hr 30 mins") ---
function formatDuration(hours, minutes) {
    hours = parseInt(hours) || 0;
    minutes = parseInt(minutes) || 0;
    if (hours === 0 && minutes === 0) {
        return 'Not set';
    }
    let parts = [];
    if (hours > 0) {
        parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
    }
    if (minutes > 0) {
        parts.push(`${minutes} min${minutes > 1 ? 's' : ''}`);
    }
    return parts.join(' ') || 'Not set';
}

// --- Milliseconds to HH:MM:SS formatter ---
function formatMillisecondsToHMS(ms) {
    if (ms === null || typeof ms === 'undefined' || ms < 0) return "00:00:00";
    let totalSeconds = Math.floor(ms / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// --- Modal Functions (View Task Details) ---
function openViewTaskDetailsModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    currentViewTaskId = taskId;

    viewTaskText.textContent = task.text;
    viewTaskDueDate.textContent = task.dueDate ? formatDate(task.dueDate) : 'Not set';
    viewTaskTime.textContent = task.time ? formatTime(task.time) : 'Not set';

    if (featureFlags.taskTimerSystem) {
        if (viewTaskEstDuration) viewTaskEstDuration.textContent = formatDuration(task.estimatedHours, task.estimatedMinutes);
        updateTimerControlsUI(task); // This will also update viewTaskTimerDisplay
        if (task.timerIsRunning && !task.completed) {
            if (currentTaskTimerInterval) clearInterval(currentTaskTimerInterval);
            currentTaskTimerInterval = setInterval(() => updateLiveTimerDisplay(task.id), 1000);
            updateLiveTimerDisplay(task.id); // Initial call
        } else if (task.timerIsPaused) {
            if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(task.timerAccumulatedTime || 0);
        } else if (task.actualDurationMs > 0) {
            if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(task.actualDurationMs);
        } else {
            if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = "00:00:00";
        }
    }

    if (featureFlags.fileAttachments && viewTaskAttachmentsList) {
        viewTaskAttachmentsList.textContent = task.attachments && task.attachments.length > 0 ? `Contains ${task.attachments.length} attachment(s) (viewing UI coming soon).` : 'No attachments.';
    }

    viewTaskPriority.textContent = task.priority || 'Not set';
    viewTaskStatus.textContent = task.completed ? 'Completed' : 'Active';
    viewTaskLabel.textContent = task.label || 'None';
    viewTaskNotes.textContent = task.notes || 'No notes added.';

    if (featureFlags.reminderFeature && viewTaskReminderSection) {
        if (task.isReminderSet) {
            viewTaskReminderStatus.textContent = 'Active';
            if (viewTaskReminderDate) viewTaskReminderDate.textContent = task.reminderDate ? formatDate(task.reminderDate) : 'Not set';
            if (viewTaskReminderTime) viewTaskReminderTime.textContent = task.reminderTime ? formatTime(task.reminderTime) : 'Not set';
            if (viewTaskReminderEmail) viewTaskReminderEmail.textContent = task.reminderEmail || 'Not set';
            if (viewTaskReminderDetails) viewTaskReminderDetails.classList.remove('hidden');
        } else {
            viewTaskReminderStatus.textContent = 'Not set';
            if (viewTaskReminderDetails) viewTaskReminderDetails.classList.add('hidden');
        }
        viewTaskReminderSection.classList.remove('hidden'); // Show section if feature enabled
    } else if (viewTaskReminderSection) {
        viewTaskReminderSection.classList.add('hidden'); // Hide if feature disabled
    }


    viewTaskDetailsModal.classList.remove('hidden');
    setTimeout(() => {
        modalDialogViewDetails.classList.remove('scale-95', 'opacity-0');
        modalDialogViewDetails.classList.add('scale-100', 'opacity-100');
    }, 10);
    applyActiveFeatures();
}

function closeViewTaskDetailsModal() {
    modalDialogViewDetails.classList.add('scale-95', 'opacity-0');
    modalDialogViewDetails.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        viewTaskDetailsModal.classList.add('hidden');
        if (featureFlags.taskTimerSystem && currentTaskTimerInterval) {
            clearInterval(currentTaskTimerInterval);
            currentTaskTimerInterval = null;
        }
        currentViewTaskId = null;
    }, 200);
}

// --- Timer Control Functions ---
function updateLiveTimerDisplay(taskId) {
    if (!featureFlags.taskTimerSystem) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.timerIsRunning || task.completed) {
        if (currentTaskTimerInterval) clearInterval(currentTaskTimerInterval);
        currentTaskTimerInterval = null;
        if (task && task.completed && task.actualDurationMs && viewTaskTimerDisplay && currentViewTaskId === taskId) {
            viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(task.actualDurationMs);
        }
        return;
    }
    const now = Date.now();
    const elapsedSinceStart = now - (task.timerStartTime || now);
    const currentDisplayTime = (task.timerAccumulatedTime || 0) + elapsedSinceStart;
    if (viewTaskTimerDisplay && currentViewTaskId === taskId) { // Check if modal is still open for this task
        viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(currentDisplayTime);
    }
}

function handleStartTimer() {
    if (!featureFlags.taskTimerSystem || !currentViewTaskId) return;
    const taskIndex = tasks.findIndex(t => t.id === currentViewTaskId);
    if (taskIndex === -1) return;
    const task = tasks[taskIndex];
    if (task.completed || (task.actualDurationMs && task.actualDurationMs > 0 && !task.timerIsPaused && !task.timerIsRunning)) return; // Prevent starting if already recorded unless paused

    task.timerIsRunning = true;
    task.timerIsPaused = false;
    task.timerStartTime = Date.now(); // Always set/reset start time when starting/resuming
    if (currentTaskTimerInterval) clearInterval(currentTaskTimerInterval);
    currentTaskTimerInterval = setInterval(() => updateLiveTimerDisplay(task.id), 1000);
    updateLiveTimerDisplay(task.id); // Initial call
    saveTasks();
    updateTimerControlsUI(task);
}

function handlePauseTimer() {
    if (!featureFlags.taskTimerSystem || !currentViewTaskId) return;
    const taskIndex = tasks.findIndex(t => t.id === currentViewTaskId);
    if (taskIndex === -1 || !tasks[taskIndex].timerIsRunning) return;
    const task = tasks[taskIndex];

    if (currentTaskTimerInterval) clearInterval(currentTaskTimerInterval);
    currentTaskTimerInterval = null;

    const elapsed = Date.now() - (task.timerStartTime || Date.now());
    task.timerAccumulatedTime = (task.timerAccumulatedTime || 0) + elapsed;
    task.timerIsRunning = false;
    task.timerIsPaused = true;
    task.timerStartTime = null; // Clear start time as it's paused
    if (viewTaskTimerDisplay && currentViewTaskId === task.id) viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(task.timerAccumulatedTime);
    saveTasks();
    updateTimerControlsUI(task);
}

function handleStopTimer(taskIdToStop) {
    if (!featureFlags.taskTimerSystem) return;
    const id = taskIdToStop || currentViewTaskId;
    if (!id) return;

    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;
    const task = tasks[taskIndex];

    if (currentTaskTimerInterval) clearInterval(currentTaskTimerInterval);
    currentTaskTimerInterval = null;

    if (task.timerIsRunning) { // If it was running, add the last bit of time
        const elapsed = Date.now() - (task.timerStartTime || Date.now());
        task.timerAccumulatedTime = (task.timerAccumulatedTime || 0) + elapsed;
    }
    // If it was paused, timerAccumulatedTime is already correct
    // If it was neither running nor paused but has actualDurationMs, it means it was already stopped.

    if (task.timerAccumulatedTime > 0) { // Only set actualDurationMs if some time was accumulated
        task.actualDurationMs = task.timerAccumulatedTime;
    }

    task.timerIsRunning = false;
    task.timerIsPaused = false;
    task.timerStartTime = null;
    // task.timerAccumulatedTime = 0; // Reset for future potential re-timing if needed, or keep for historical reference. For now, let's reset.
                                  // Decided to keep timerAccumulatedTime so if user "un-stops" it's there, but actualDurationMs is the final one.
                                  // For a "hard stop", timerAccumulatedTime could be cleared.

    if (viewTaskTimerDisplay && currentViewTaskId === id) viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(task.actualDurationMs);
    saveTasks();
    if (currentViewTaskId === id && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) {
        updateTimerControlsUI(task);
    }
     // If task is completed upon stop, re-render.
    if (task.completed) renderTasks();
}


function updateTimerControlsUI(task) {
    if (!featureFlags.taskTimerSystem || !task || !viewTaskStartTimerBtn || !viewTaskPauseTimerBtn || !viewTaskStopTimerBtn || !viewTaskActualDuration || !timerButtonsContainer) return;

    const isModalOpenForThisTask = currentViewTaskId === task.id && !viewTaskDetailsModal.classList.contains('hidden');
    if (!isModalOpenForThisTask) return; // Don't update UI if modal not for this task or closed

    if (task.completed) {
        timerButtonsContainer.classList.add('hidden');
        viewTaskActualDuration.textContent = task.actualDurationMs > 0 ? `Recorded: ${formatMillisecondsToHMS(task.actualDurationMs)}` : "Not recorded (completed).";
        if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = task.actualDurationMs > 0 ? formatMillisecondsToHMS(task.actualDurationMs) : "00:00:00";
        return;
    }
    timerButtonsContainer.classList.remove('hidden');

    // If there's a final recorded duration and the timer is not active (running or paused)
    if (task.actualDurationMs > 0 && !task.timerIsRunning && !task.timerIsPaused) {
        viewTaskStartTimerBtn.classList.remove('hidden'); // Show "Re-time" or "Start Over"
        viewTaskStartTimerBtn.textContent = 'Re-time'; // Or "Start New Session"
        viewTaskPauseTimerBtn.classList.add('hidden');
        viewTaskStopTimerBtn.classList.add('hidden'); // Stop should only appear if running or paused
        if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(task.actualDurationMs);
        viewTaskActualDuration.textContent = `Recorded: ${formatMillisecondsToHMS(task.actualDurationMs)}`;
    } else if (task.timerIsRunning) {
        viewTaskStartTimerBtn.classList.add('hidden');
        viewTaskPauseTimerBtn.classList.remove('hidden');
        viewTaskStopTimerBtn.classList.remove('hidden');
        viewTaskActualDuration.textContent = "Timer running...";
    } else if (task.timerIsPaused) {
        viewTaskStartTimerBtn.classList.remove('hidden');
        viewTaskStartTimerBtn.textContent = 'Resume';
        viewTaskPauseTimerBtn.classList.add('hidden');
        viewTaskStopTimerBtn.classList.remove('hidden');
        viewTaskActualDuration.textContent = "Timer paused.";
        if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(task.timerAccumulatedTime || 0);
    } else { // Timer has not been started yet, or was reset.
        viewTaskStartTimerBtn.classList.remove('hidden');
        viewTaskStartTimerBtn.textContent = 'Start';
        viewTaskPauseTimerBtn.classList.add('hidden');
        viewTaskStopTimerBtn.classList.add('hidden');
        viewTaskActualDuration.textContent = "Not yet recorded.";
        if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = "00:00:00";
    }
}


// --- Modal Functions (Manage Labels) ---
function openManageLabelsModal() {
    populateManageLabelsList();
    manageLabelsModal.classList.remove('hidden');
    setTimeout(() => {
        modalDialogManageLabels.classList.remove('scale-95', 'opacity-0');
        modalDialogManageLabels.classList.add('scale-100', 'opacity-100');
    }, 10);
    newLabelInput.focus();
}

function closeManageLabelsModal() {
    modalDialogManageLabels.classList.add('scale-95', 'opacity-0');
    modalDialogManageLabels.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        manageLabelsModal.classList.add('hidden');
    }, 200);
}

function populateManageLabelsList() {
    existingLabelsList.innerHTML = '';
    uniqueLabels.forEach(label => {
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700 rounded-md';
        const span = document.createElement('span');
        span.textContent = label.charAt(0).toUpperCase() + label.slice(1); // Capitalize
        span.className = 'text-slate-700 dark:text-slate-200';
        li.appendChild(span);
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt text-red-500 hover:text-red-700"></i>';
        deleteBtn.className = 'p-1';
        deleteBtn.title = `Delete label "${label}"`;
        deleteBtn.addEventListener('click', () => handleDeleteLabel(label));
        li.appendChild(deleteBtn);
        existingLabelsList.appendChild(li);
    });
    if (uniqueLabels.length === 0) {
        existingLabelsList.innerHTML = '<li class="text-slate-500 dark:text-slate-400 text-center">No labels created yet.</li>';
    }
}

function handleAddNewLabel(event) {
    event.preventDefault();
    const labelName = newLabelInput.value.trim(); // Keep original casing for display, but compare lowercase
    if (labelName === '') { showMessage('Label name cannot be empty.', 'error'); return; }
    if (uniqueLabels.some(l => l.toLowerCase() === labelName.toLowerCase())) {
        showMessage(`Label "${labelName}" already exists.`, 'error'); return;
    }
    uniqueLabels.push(labelName); // Add with original casing
    uniqueLabels.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())); // Sort case-insensitively
    saveTasks(); // This also calls updateUniqueLabels which will re-populate datalists
    populateManageLabelsList();
    newLabelInput.value = '';
    showMessage(`Label "${labelName}" added.`, 'success');
}

function handleDeleteLabel(labelToDelete) {
    const tasksUpdated = tasks.map(task => {
        if (task.label && task.label.toLowerCase() === labelToDelete.toLowerCase()) {
            return { ...task, label: '' }; // Remove label from tasks
        }
        return task;
    });
    tasks = tasksUpdated;
    // uniqueLabels is updated via saveTasks -> updateUniqueLabels
    saveTasks();
    populateManageLabelsList(); // Refresh the list in the modal
    renderTasks(); // Re-render tasks in the main view
    showMessage(`Label "${labelToDelete}" deleted and removed from tasks.`, 'success');
}

// --- Modal Functions (Settings) ---
function openSettingsModal() {
    settingsModal.classList.remove('hidden');
    setTimeout(() => {
        modalDialogSettings.classList.remove('scale-95', 'opacity-0');
        modalDialogSettings.classList.add('scale-100', 'opacity-100');
    }, 10);
    applyActiveFeatures(); // Ensure buttons visibility based on features
    updateClearCompletedButtonState();
}

function closeSettingsModal() {
    modalDialogSettings.classList.add('scale-95', 'opacity-0');
    modalDialogSettings.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        settingsModal.classList.add('hidden');
    }, 200);
}

// --- Modal Functions (Task Review) ---
function openTaskReviewModal() {
    if (!featureFlags.taskTimerSystem) {
        showMessage("Task Timer System feature is currently disabled. Enable it in Feature Flags to use Task Review.", "error");
        return;
    }
    populateTaskReviewModal();
    taskReviewModal.classList.remove('hidden');
    setTimeout(() => {
        modalDialogTaskReview.classList.remove('scale-95', 'opacity-0');
        modalDialogTaskReview.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function closeTaskReviewModal() {
    modalDialogTaskReview.classList.add('scale-95', 'opacity-0');
    modalDialogTaskReview.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        taskReviewModal.classList.add('hidden');
    }, 200);
}

function populateTaskReviewModal() {
    taskReviewContent.innerHTML = '';
    const completedTasksWithTime = tasks.filter(task =>
        task.completed &&
        ( (task.estimatedHours && task.estimatedHours > 0) ||
          (task.estimatedMinutes && task.estimatedMinutes > 0) ||
          (task.actualDurationMs && task.actualDurationMs > 0) )
    ).sort((a,b) => (b.completedDate || 0) - (a.completedDate || 0)); // Show most recently completed first

    if (completedTasksWithTime.length === 0) {
        taskReviewContent.innerHTML = '<p class="text-slate-500 dark:text-slate-400 text-center">No completed tasks with time estimates or recordings to review.</p>';
        return;
    }
    completedTasksWithTime.forEach(task => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'p-3 bg-slate-50 dark:bg-slate-700 rounded-lg shadow';

        const taskName = document.createElement('h4');
        taskName.className = 'text-md font-semibold text-slate-800 dark:text-slate-100 mb-1 truncate';
        taskName.textContent = task.text;
        itemDiv.appendChild(taskName);

        const estimatedTimeText = formatDuration(task.estimatedHours, task.estimatedMinutes);
        const estimatedP = document.createElement('p');
        estimatedP.className = 'text-sm text-slate-600 dark:text-slate-300';
        estimatedP.innerHTML = `<strong>Estimated:</strong> ${estimatedTimeText}`;
        itemDiv.appendChild(estimatedP);

        const actualTimeText = task.actualDurationMs > 0 ? formatMillisecondsToHMS(task.actualDurationMs) : 'Not recorded';
        const actualP = document.createElement('p');
        actualP.className = 'text-sm text-slate-600 dark:text-slate-300';
        actualP.innerHTML = `<strong>Actual:</strong> ${actualTimeText}`;
        itemDiv.appendChild(actualP);

        if (task.dueDate) {
            const completedOnP = document.createElement('p');
            completedOnP.className = 'text-xs text-slate-400 dark:text-slate-500 mt-1';
            completedOnP.textContent = `Completed on: ${formatDate(task.completedDate || task.dueDate)}`; // Assuming completedDate is stored
            itemDiv.appendChild(completedOnP);
        }
        taskReviewContent.appendChild(itemDiv);
    });
}

// --- Modal Functions (Tooltips Guide) ---
function openTooltipsGuideModal() {
    if (!featureFlags.tooltipsGuide) {
         showMessage("Tooltips Guide feature is currently disabled. Enable it in Feature Flags.", "error");
        return;
    }
    tooltipsGuideModal.classList.remove('hidden');
    setTimeout(() => {
        modalDialogTooltipsGuide.classList.remove('scale-95', 'opacity-0');
        modalDialogTooltipsGuide.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function closeTooltipsGuideModal() {
    modalDialogTooltipsGuide.classList.add('scale-95', 'opacity-0');
    modalDialogTooltipsGuide.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        tooltipsGuideModal.classList.add('hidden');
    }, 200);
}

// --- Feature Flag Management ---
async function loadFeatureFlags() {
    try {
        const response = await fetch('features.json?cachebust=' + new Date().getTime());
        if (!response.ok) {
            console.warn('Failed to load features.json, using default flags. Status:', response.status);
            // Proceed with default featureFlags object
            return;
        }
        const fetchedFlags = await response.json();
        featureFlags = { ...featureFlags, ...fetchedFlags }; // Merge, fetched overrides defaults
        console.log('Feature flags loaded successfully:', featureFlags);
    } catch (error) {
        console.error('Error loading or parsing features.json, using default flags:', error);
        // Proceed with default featureFlags object
    }
}

function applyActiveFeatures() {
    const toggleElements = (selector, isEnabled) => {
        document.querySelectorAll(selector).forEach(el => el.classList.toggle('hidden', !isEnabled));
    };

    if (testFeatureButtonContainer) testFeatureButtonContainer.classList.toggle('hidden', !featureFlags.testButtonFeature);
    toggleElements('.reminder-feature-element', featureFlags.reminderFeature);
    toggleElements('.task-timer-system-element', featureFlags.taskTimerSystem);
    toggleElements('.advanced-recurrence-element', featureFlags.advancedRecurrence);
    toggleElements('.file-attachments-element', featureFlags.fileAttachments);
    toggleElements('.integrations-services-element', featureFlags.integrationsServices);
    toggleElements('.user-accounts-element', featureFlags.userAccounts);
    toggleElements('.collaboration-sharing-element', featureFlags.collaborationSharing);
    toggleElements('.cross-device-sync-element', featureFlags.crossDeviceSync);
    toggleElements('.tooltips-guide-element', featureFlags.tooltipsGuide);

    // Specific handling for reminder options visibility within modals
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

    if (settingsTaskReviewBtn) settingsTaskReviewBtn.classList.toggle('hidden', !featureFlags.taskTimerSystem);
    if (settingsTooltipsGuideBtn) settingsTooltipsGuideBtn.classList.toggle('hidden', !featureFlags.tooltipsGuide);

    // Disable buttons for features not yet implemented (could be done via CSS class as well)
    const soonButtons = [
        settingsIntegrationsBtn, settingsUserAccountsBtn, settingsCollaborationBtn, settingsSyncBackupBtn
    ];
    soonButtons.forEach(btn => {
        if (btn) {
            const featureKey = btn.id.replace('settings', '').replace('Btn','').toLowerCase();
            // A bit of a loose match, assumes IDs like 'settingsIntegrationsBtn' maps to a potential 'integrations' feature flag
            // For now, these are hardcoded as "Coming Soon" in HTML and this JS mainly hides them based on their own flags.
            // If you had flags like 'integrationsEnabled: false', you'd use that.
            // The class 'disabled-feature-button' could be added if they are visible but non-functional.
        }
    });


    renderTasks(); // Re-render tasks as feature flags might affect display
    // If a view modal was open, refresh its content based on new feature states
    if (currentViewTaskId && !viewTaskDetailsModal.classList.contains('hidden')) {
        openViewTaskDetailsModal(currentViewTaskId); // Re-opens to refresh content
    }
}


// --- Date & Time Helper Functions ---
function getTodayDateString() { return new Date().toISOString().split('T')[0]; }
function getDateString(date) { // Assumes date is a Date object
    return date.toISOString().split('T')[0];
}
function formatDate(dateString) {
    if (!dateString) return '';
    // Dates from input type="date" are already YYYY-MM-DD.
    // We need to parse them as UTC to avoid timezone shifts when displaying.
    const dateParts = dateString.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed in JS Date
    const day = parseInt(dateParts[2]);
    const date = new Date(Date.UTC(year, month, day));
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}
function formatTime(timeString) {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHours = h % 12 || 12; // Converts 0 or 12 to 12
    return `${String(formattedHours).padStart(2, '0')}:${minutes} ${ampm}`;
}

// --- Core Functions ---
function showMessage(message, type = 'success') {
    messageBox.textContent = message;
    messageBox.className = 'message-box'; // Reset classes
    if (type === 'success') {
        messageBox.classList.add('bg-green-100', 'text-green-800', 'dark:bg-green-700', 'dark:text-green-100');
    } else if (type === 'error') {
        messageBox.classList.add('bg-red-100', 'text-red-800', 'dark:bg-red-700', 'dark:text-red-100');
    } else { // Neutral / Info
        messageBox.classList.add('bg-sky-100', 'text-sky-800', 'dark:bg-sky-700', 'dark:text-sky-100');
    }
    messageBox.style.display = 'block';
    messageBox.style.zIndex = '200'; // Ensure it's on top
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 3000);
}

function saveTasks() {
    localStorage.setItem('todos_v3', JSON.stringify(tasks));
    updateUniqueLabels(); // This should also update datalists
}

function getPriorityClass(priority) {
    switch (priority) {
        case 'high': return 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100';
        case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-yellow-100';
        case 'low': return 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100';
        default: return 'bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-200';
    }
}

function updateUniqueLabels() {
    const labels = new Set();
    tasks.forEach(task => {
        if (task.label && task.label.trim() !== '') {
            labels.add(task.label.trim()); // Store with original casing
        }
    });
    uniqueLabels = Array.from(labels).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    populateDatalist(existingLabelsDatalist);
    populateDatalist(existingLabelsEditDatalist);
}

function populateDatalist(datalistElement) {
    if (!datalistElement) return;
    datalistElement.innerHTML = ''; // Clear existing options
    uniqueLabels.forEach(label => {
        const option = document.createElement('option');
        option.value = label; // Use the stored casing
        datalistElement.appendChild(option);
    });
}

function renderTasks() {
    taskList.innerHTML = '';
    let filteredTasks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to midnight for date comparisons

    // Filter tasks based on currentFilter
    if (currentFilter === 'inbox') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'today') {
        filteredTasks = tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const taskDueDate = new Date(Date.UTC(
                parseInt(task.dueDate.substring(0,4)),
                parseInt(task.dueDate.substring(5,7))-1,
                parseInt(task.dueDate.substring(8,10))
            ));
            return taskDueDate.getTime() === today.getTime();
        });
    } else if (currentFilter === 'upcoming') {
        filteredTasks = tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const taskDueDate = new Date(Date.UTC(
                parseInt(task.dueDate.substring(0,4)),
                parseInt(task.dueDate.substring(5,7))-1,
                parseInt(task.dueDate.substring(8,10))
            ));
            return taskDueDate.getTime() > today.getTime();
        });
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    } else { // If filter is a label
        filteredTasks = tasks.filter(task => task.label && task.label.toLowerCase() === currentFilter.toLowerCase() && !task.completed);
    }


    if (currentSearchTerm) {
        filteredTasks = filteredTasks.filter(task =>
            task.text.toLowerCase().includes(currentSearchTerm) ||
            (task.label && task.label.toLowerCase().includes(currentSearchTerm)) ||
            (task.notes && task.notes.toLowerCase().includes(currentSearchTerm))
        );
    }

    // Sort tasks
    const priorityOrder = { high: 1, medium: 2, low: 3, default: 4 };
    if (currentSort === 'dueDate') {
        filteredTasks.sort((a, b) => {
            const dateA = a.dueDate ? new Date(a.dueDate + (a.time ? `T${a.time}` : 'T00:00:00Z')) : null; // Assume Z for UTC if not specified
            const dateB = b.dueDate ? new Date(b.dueDate + (b.time ? `T${b.time}` : 'T00:00:00Z')) : null;
            if (dateA === null && dateB === null) return 0;
            if (dateA === null) return 1; // Tasks without due date last
            if (dateB === null) return -1;
            return dateA - dateB;
        });
    } else if (currentSort === 'priority') {
        filteredTasks.sort((a, b) => (priorityOrder[a.priority] || priorityOrder.default) - (priorityOrder[b.priority] || priorityOrder.default) || (a.dueDate && b.dueDate ? new Date(a.dueDate) - new Date(b.dueDate) : 0));
    } else if (currentSort === 'label') {
        filteredTasks.sort((a,b) => {
            const labelA = (a.label || '').toLowerCase();
            const labelB = (b.label || '').toLowerCase();
            if (labelA < labelB) return -1;
            if (labelA > labelB) return 1;
            // Secondary sort by due date
            const dateA = a.dueDate ? new Date(a.dueDate + (a.time ? `T${a.time}` : 'T00:00:00Z')) : null;
            const dateB = b.dueDate ? new Date(b.dueDate + (b.time ? `T${b.time}` : 'T00:00:00Z')) : null;
            if (dateA === null && dateB === null) return 0;
            if (dateA === null) return 1;
            if (dateB === null) return -1;
            return dateA - dateB;
        });
    }
     // Default sort for 'inbox' is often by creation date (which is task.id descending if numeric)
    else if (currentFilter === 'inbox' && currentSort === 'default') {
        // Assuming newer tasks have higher IDs if tasks are unshifted.
        // If IDs are timestamps, this works. Otherwise, add a creationTimestamp field.
        filteredTasks.sort((a, b) => b.id - a.id);
    }


    emptyState.classList.toggle('hidden', tasks.length !== 0);
    noMatchingTasks.classList.toggle('hidden', !(tasks.length > 0 && filteredTasks.length === 0));

    filteredTasks.forEach((task) => {
        const li = document.createElement('li');
        li.className = `task-item flex items-start justify-between bg-slate-100 dark:bg-slate-700 p-3 sm:p-3.5 rounded-lg shadow hover:shadow-md transition-shadow duration-300 ${task.completed ? 'opacity-60' : ''} overflow-hidden`;
        li.dataset.taskId = task.id;

        const mainContentClickableArea = document.createElement('div');
        mainContentClickableArea.className = 'task-item-clickable-area flex items-start flex-grow min-w-0 mr-2 rounded-l-lg'; // min-w-0 prevents overflow issues
        mainContentClickableArea.addEventListener('click', (event) => {
            // Ensure click is not on checkbox or action buttons
            if (event.target.type === 'checkbox' || event.target.closest('.task-actions')) {
                return;
            }
            openViewTaskDetailsModal(task.id);
        });

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.className = 'form-checkbox h-5 w-5 text-sky-500 rounded border-slate-400 dark:border-slate-500 focus:ring-sky-400 dark:focus:ring-sky-500 mt-0.5 mr-2 sm:mr-3 cursor-pointer flex-shrink-0';
        checkbox.addEventListener('change', () => toggleComplete(task.id));

        const textDetailsDiv = document.createElement('div');
        textDetailsDiv.className = 'flex flex-col flex-grow min-w-0'; // flex-grow and min-w-0 for text content

        const span = document.createElement('span');
        span.textContent = task.text;
        let textColorClass = task.completed ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200';
        span.className = `text-sm sm:text-base break-words ${textColorClass} ${task.completed ? 'completed-text' : ''}`; // break-words for long text

        textDetailsDiv.appendChild(span);

        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'flex items-center flex-wrap gap-x-2 gap-y-1 mt-1 sm:mt-1.5 text-xs';

        if (task.priority) {
            const priorityBadge = document.createElement('span');
            priorityBadge.textContent = task.priority;
            priorityBadge.className = `priority-badge ${getPriorityClass(task.priority)}`;
            detailsContainer.appendChild(priorityBadge);
        }
        if (task.label) {
            const labelBadge = document.createElement('span');
            labelBadge.textContent = task.label;
            labelBadge.className = 'label-badge'; // Assumes CSS handles dark/light for this
            detailsContainer.appendChild(labelBadge);
        }
        if (task.dueDate) {
            const dueDateSpan = document.createElement('span');
            dueDateSpan.className = 'text-slate-500 dark:text-slate-400 flex items-center';
            let dateDisplay = formatDate(task.dueDate);
            if (task.time) { dateDisplay += ` ${formatTime(task.time)}`; }
            dueDateSpan.innerHTML = `<i class="far fa-calendar-alt mr-1"></i> ${dateDisplay}`;
            detailsContainer.appendChild(dueDateSpan);
        }
        if (featureFlags.fileAttachments && task.attachments && task.attachments.length > 0) {
            const attachmentSpan = document.createElement('span');
            attachmentSpan.className = 'text-slate-500 dark:text-slate-400 flex items-center file-attachments-element';
            attachmentSpan.innerHTML = `<i class="fas fa-paperclip mr-1"></i> ${task.attachments.length}`;
            detailsContainer.appendChild(attachmentSpan);
        }

        if (detailsContainer.hasChildNodes()) {
            textDetailsDiv.appendChild(detailsContainer);
        }

        mainContentClickableArea.appendChild(checkbox);
        mainContentClickableArea.appendChild(textDetailsDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions flex-shrink-0 self-start'; // self-start aligns to top

        const editButton = document.createElement('button');
        editButton.className = 'task-action-btn text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-500';
        editButton.innerHTML = '<i class="fas fa-pencil-alt"></i>';
        editButton.setAttribute('aria-label', 'Edit task');
        editButton.title = 'Edit task';
        editButton.addEventListener('click', () => openViewEditModal(task.id));
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


function parseDateFromText(text) {
    let parsedDate = null;
    let remainingText = text;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const shortDaysOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

    // More specific patterns first
    const patterns = [
        // Specific dates with "on" or "due" e.g. "on 2025-12-25", "due 12/25"
        {
            regex: /\b(on|due|by)\s+(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})\b/i, // YYYY-MM-DD or YYYY/MM/DD
            handler: (match) => match[2].replace(/\//g, '-')
        },
        {
            regex: /\b(on|due|by)\s+(\d{1,2}[-\/]\d{1,2}(?:[-\/]\d{2,4})?)\b/i, // MM/DD or MM/DD/YYYY or M/D/YY
            handler: (match) => {
                const dateStr = match[2];
                const parts = dateStr.replace(/-/g, '/').split('/');
                let year, month, day;
                if (parts.length === 2) { // MM/DD
                    year = today.getFullYear();
                    month = parseInt(parts[0]);
                    day = parseInt(parts[1]);
                } else { // MM/DD/YYYY or M/D/YY
                    year = parseInt(parts[2]);
                    if (year < 100) year += 2000; // Assume 2-digit year is 20xx
                    month = parseInt(parts[0]);
                    day = parseInt(parts[1]);
                }
                if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
                return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
        },
        // Relative dates: today, tomorrow, next Monday, next week
        { regex: /\b(today)\b/i, handler: () => getDateString(today) },
        {
            regex: /\b(tomorrow)\b/i,
            handler: () => {
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                return getDateString(tomorrow);
            }
        },
        { // "next Monday", "next sun", "Monday" (implies next occurrence or today if it's Monday)
            regex: new RegExp(`\\b(next\\s+)?(${daysOfWeek.join('|')}|${shortDaysOfWeek.join('|')})\\b`, 'i'),
            handler: (match) => {
                const dayName = match[2].toLowerCase();
                let targetDayIndex = daysOfWeek.indexOf(dayName);
                if (targetDayIndex === -1) targetDayIndex = shortDaysOfWeek.indexOf(dayName);
                if (targetDayIndex === -1) return null;

                const currentDayIndex = today.getDay();
                let daysToAdd = targetDayIndex - currentDayIndex;

                if (match[1]) { // "next" is present
                    daysToAdd = (daysToAdd <= 0 ? daysToAdd + 7 : daysToAdd); // Ensure it's in the future if "next"
                } else { // "next" is not present
                    if (daysToAdd < 0) daysToAdd += 7; // If past in current week, go to next week
                    // If daysToAdd is 0 (e.g. "Monday" on a Monday), it refers to today.
                }
                const targetDate = new Date(today);
                targetDate.setDate(today.getDate() + daysToAdd);
                return getDateString(targetDate);
            }
        },
        {
            regex: /\b(next week)\b/i,
            handler: () => {
                const nextWeek = new Date(today);
                // Go to Monday of next week (ISO 8601 week start is Monday)
                const dayOffset = (today.getDay() === 0 ? -6 : 1); // Sunday is 0, Monday is 1
                nextWeek.setDate(today.getDate() - today.getDay() + dayOffset + 7);
                return getDateString(nextWeek);
            }
        },
         {
            regex: /\b(next month)\b/i,
            handler: () => {
                const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
                return getDateString(nextMonthDate);
            }
        },
        {
            regex: /\b(next year)\b/i,
            handler: () => {
                const nextYearDate = new Date(today.getFullYear() + 1, 0, 1); // Jan 1st of next year
                return getDateString(nextYearDate);
            }
        },
        // General date patterns (less specific, try last)
        { // YYYY-MM-DD or YYYY/MM/DD (without "on", "due")
            regex: /\b(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})\b/g,
            handler: (match) => {
                const potentialDate = match[0].replace(/\//g, '-');
                // Validate if it's a real date and not part of something else (e.g. version number)
                if (!isNaN(new Date(potentialDate).getTime())) return potentialDate;
                return null;
            }
        },
        { // MM/DD or MM/DD/YYYY (without "on", "due")
            regex: /\b(\d{1,2}[-\/]\d{1,2}(?:[-\/]\d{2,4})?)\b/g,
            handler: (match) => {
                const dateStr = match[0];
                const parts = dateStr.replace(/-/g, '/').split('/');
                let year, month, day;
                if (parts.length === 2) {
                    year = today.getFullYear(); month = parseInt(parts[0]); day = parseInt(parts[1]);
                } else {
                    year = parseInt(parts[2]); if (year < 100) year += 2000;
                    month = parseInt(parts[0]); day = parseInt(parts[1]);
                }
                if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
                const potentialDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                 if (!isNaN(new Date(potentialDate).getTime())) return potentialDate;
                return null;
            }
        }
    ];

    for (const pattern of patterns) {
        const match = pattern.regex.exec(remainingText);
        if (match) {
            const potentialDate = pattern.handler(match);
            if (potentialDate && !isNaN(new Date(potentialDate).getTime())) { // Ensure it's a valid date
                // Check if this date is not already part of a more specific match (e.g., "on date")
                // This is tricky. A simpler approach is to remove the matched string.
                const matchedString = match[0];
                const tempRemainingText = remainingText.replace(new RegExp(matchedString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*', 'i'), '').trim();

                // A simple check: if the date is at the end of the string or followed by common delimiters
                const afterMatchIndex = match.index + matchedString.length;
                const charAfterMatch = remainingText[afterMatchIndex];
                if (afterMatchIndex === remainingText.length || /[\s,.?!]/.test(charAfterMatch || '')) {
                    parsedDate = potentialDate;
                    remainingText = tempRemainingText.replace(/\s\s+/g, ' ').trim(); // Clean up multiple spaces
                    break;
                }
            }
        }
    }
    return { parsedDate, remainingText };
}


function handleAddTask(event) {
    event.preventDefault();
    const rawTaskText = modalTaskInputAdd.value.trim();
    const explicitDueDate = modalDueDateInputAdd.value;
    const time = modalTimeInputAdd.value;
    let estHours = 0, estMinutes = 0;
    if (featureFlags.taskTimerSystem) {
        estHours = parseInt(modalEstHoursAdd.value) || 0;
        estMinutes = parseInt(modalEstMinutesAdd.value) || 0;
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
            if (!reminderDate) { showMessage('Please select a reminder date.', 'error'); modalReminderDateAdd.focus(); return; }
            if (!reminderTime) { showMessage('Please select a reminder time.', 'error'); modalReminderTimeAdd.focus(); return; }
            if (!reminderEmail) { showMessage('Please enter an email for the reminder.', 'error'); modalReminderEmailAdd.focus(); return; }
            if (!/^\S+@\S+\.\S+$/.test(reminderEmail)) { showMessage('Please enter a valid email address.', 'error'); modalReminderEmailAdd.focus(); return; }
        }
    }

    if (rawTaskText === '') { showMessage('Task description cannot be empty!', 'error'); modalTaskInputAdd.focus(); return; }

    let finalDueDate = explicitDueDate;
    let finalTaskText = rawTaskText;

    if (!explicitDueDate) { // Only parse from text if no explicit date is set
        const { parsedDate: dateFromDescription, remainingText: textAfterDateRemoval } = parseDateFromText(rawTaskText);
        if (dateFromDescription) {
            finalDueDate = dateFromDescription;
            finalTaskText = textAfterDateRemoval.trim() || rawTaskText; // Use remaining text or original if empty
        }
    }

    const newTask = {
        id: Date.now(), text: finalTaskText, completed: false, creationDate: Date.now(),
        dueDate: finalDueDate || null, time: time || null,
        estimatedHours: featureFlags.taskTimerSystem ? estHours : 0,
        estimatedMinutes: featureFlags.taskTimerSystem ? estMinutes : 0,
        priority: priority, label: label || '', notes: notes || '',
        isReminderSet: featureFlags.reminderFeature ? isReminderSet : false,
        reminderDate: featureFlags.reminderFeature && isReminderSet ? reminderDate : null,
        reminderTime: featureFlags.reminderFeature && isReminderSet ? reminderTime : null,
        reminderEmail: featureFlags.reminderFeature && isReminderSet ? reminderEmail : null,
        timerStartTime: null, timerAccumulatedTime: 0, timerIsRunning: false, timerIsPaused: false, actualDurationMs: 0,
        attachments: [], // Initialize attachments
        completedDate: null
    };
    tasks.unshift(newTask);
    saveTasks();
    if (currentFilter === 'completed') { setFilter('inbox'); }
    else { renderTasks(); }
    closeAddModal();
    showMessage('Task added successfully!', 'success');
}

function handleEditTask(event) {
    event.preventDefault();
    const taskId = parseInt(modalViewEditTaskId.value);
    const taskText = modalTaskInputViewEdit.value.trim();
    const dueDate = modalDueDateInputViewEdit.value;
    const time = modalTimeInputViewEdit.value;
    let estHours = 0, estMinutes = 0;
    if (featureFlags.taskTimerSystem && modalEstHoursViewEdit && modalEstMinutesViewEdit) {
        estHours = parseInt(modalEstHoursViewEdit.value) || 0;
        estMinutes = parseInt(modalEstMinutesViewEdit.value) || 0;
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
            if (!reminderDate) { showMessage('Please select a reminder date.', 'error'); modalReminderDateViewEdit.focus(); return; }
            if (!reminderTime) { showMessage('Please select a reminder time.', 'error'); modalReminderTimeViewEdit.focus(); return; }
            if (!reminderEmail) { showMessage('Please enter an email for the reminder.', 'error'); modalReminderEmailViewEdit.focus(); return; }
            if (!/^\S+@\S+\.\S+$/.test(reminderEmail)) { showMessage('Please enter a valid email address.', 'error'); modalReminderEmailViewEdit.focus(); return; }
        }
    }

    if (taskText === '') { showMessage('Task description cannot be empty!', 'error'); modalTaskInputViewEdit.focus(); return; }

    tasks = tasks.map(task => task.id === taskId ? {
        ...task, text: taskText, dueDate: dueDate || null, time: time || null,
        estimatedHours: featureFlags.taskTimerSystem ? estHours : task.estimatedHours, // Keep old if feature off
        estimatedMinutes: featureFlags.taskTimerSystem ? estMinutes : task.estimatedMinutes, // Keep old if feature off
        priority: priority, label: label || '', notes: notes || '',
        isReminderSet: featureFlags.reminderFeature ? isReminderSet : task.isReminderSet, // Keep old if feature off
        reminderDate: featureFlags.reminderFeature && isReminderSet ? reminderDate : (featureFlags.reminderFeature ? null : task.reminderDate),
        reminderTime: featureFlags.reminderFeature && isReminderSet ? reminderTime : (featureFlags.reminderFeature ? null : task.reminderTime),
        reminderEmail: featureFlags.reminderFeature && isReminderSet ? reminderEmail : (featureFlags.reminderFeature ? null : task.reminderEmail),
        attachments: task.attachments || [] // Ensure attachments array exists
    } : task );
    saveTasks();
    renderTasks();
    closeViewEditModal();
    showMessage('Task updated successfully!', 'success');
}

function toggleComplete(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    tasks[taskIndex].completedDate = tasks[taskIndex].completed ? Date.now() : null; // Store completion timestamp

    if (featureFlags.taskTimerSystem && tasks[taskIndex].completed && (tasks[taskIndex].timerIsRunning || tasks[taskIndex].timerIsPaused)) {
        handleStopTimer(taskId); // This will also save tasks
    } else {
        saveTasks();
    }
    renderTasks();
    // If the task details modal is open for this task, update its timer controls
    if (featureFlags.taskTimerSystem && currentViewTaskId === taskId && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) {
        updateTimerControlsUI(tasks[taskIndex]);
    }
}

function deleteTask(taskId) {
    // If a timer is running for the task being deleted in the view modal, clear it
    if (featureFlags.taskTimerSystem && currentViewTaskId === taskId && currentTaskTimerInterval) {
        clearInterval(currentTaskTimerInterval);
        currentTaskTimerInterval = null;
    }
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
    showMessage('Task deleted.', 'error');
}

function setFilter(filter) {
    currentFilter = filter;
    currentSort = 'default'; // Reset sort when changing filter
    updateSortButtonStates(); // Update sort button active states
    smartViewButtons.forEach(button => {
        const isActive = button.dataset.filter === filter;
        // Update button styling for active/inactive state
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


function updateClearCompletedButtonState() {
    const hasCompleted = tasks.some(task => task.completed);
    if (settingsClearCompletedBtn) {
        settingsClearCompletedBtn.disabled = !hasCompleted;
        settingsClearCompletedBtn.classList.toggle('opacity-50', !hasCompleted);
        settingsClearCompletedBtn.classList.toggle('cursor-not-allowed', !hasCompleted);

        const activeClasses = ['bg-red-50', 'hover:bg-red-100', 'text-red-700', 'dark:bg-red-900/50', 'dark:hover:bg-red-800/70', 'dark:text-red-300'];
        const disabledClasses = ['bg-slate-100', 'text-slate-400', 'dark:bg-slate-700', 'dark:text-slate-500'];

        if (hasCompleted) {
            settingsClearCompletedBtn.classList.remove(...disabledClasses);
            settingsClearCompletedBtn.classList.add(...activeClasses);
        } else {
            settingsClearCompletedBtn.classList.remove(...activeClasses);
            settingsClearCompletedBtn.classList.add(...disabledClasses);
        }
    }
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
    closeSettingsModal(); // Close settings modal after action
}

function updateSortButtonStates() {
    [sortByDueDateBtn, sortByPriorityBtn, sortByLabelBtn].forEach(btn => {
        if (btn) { // Check if button exists
            let sortType = '';
            if (btn === sortByDueDateBtn) sortType = 'dueDate';
            else if (btn === sortByPriorityBtn) sortType = 'priority';
            else if (btn === sortByLabelBtn) sortType = 'label';

            btn.classList.toggle('sort-btn-active', currentSort === sortType);
        }
    });
}

// --- Event Listeners ---
if (openAddModalButton) openAddModalButton.addEventListener('click', openAddModal);
if (closeAddModalBtn) closeAddModalBtn.addEventListener('click', closeAddModal);
if (cancelAddModalBtn) cancelAddModalBtn.addEventListener('click', closeAddModal);
if (modalTodoFormAdd) modalTodoFormAdd.addEventListener('submit', handleAddTask);
if (addTaskModal) addTaskModal.addEventListener('click', (event) => { if (event.target === addTaskModal) closeAddModal(); });

if (modalRemindMeAdd) {
    modalRemindMeAdd.addEventListener('change', () => {
        if(featureFlags.reminderFeature && reminderOptionsAdd) {
            reminderOptionsAdd.classList.toggle('hidden', !modalRemindMeAdd.checked);
            if (modalRemindMeAdd.checked) {
                // Pre-fill reminder date/time from task due date/time if available
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
                // Set min date for reminder date picker
                const today = new Date();
                modalReminderDateViewEdit.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            }
        } else if (reminderOptionsViewEdit) {
            reminderOptionsViewEdit.classList.add('hidden');
        }
    });
}

if (closeViewEditModalBtn) closeViewEditModalBtn.addEventListener('click', closeViewEditModal);
if (cancelViewEditModalBtn) cancelViewEditModalBtn.addEventListener('click', closeViewEditModal);
if (modalTodoFormViewEdit) modalTodoFormViewEdit.addEventListener('submit', handleEditTask);
if (viewEditTaskModal) viewEditTaskModal.addEventListener('click', (event) => { if (event.target === viewEditTaskModal) closeViewEditModal(); });

if (closeViewDetailsModalBtn) closeViewDetailsModalBtn.addEventListener('click', closeViewTaskDetailsModal);
if (closeViewDetailsSecondaryBtn) closeViewDetailsSecondaryBtn.addEventListener('click', closeViewTaskDetailsModal);
if (editFromViewModalBtn) editFromViewModalBtn.addEventListener('click', () => { if (currentViewTaskId !== null) { closeViewTaskDetailsModal(); openViewEditModal(currentViewTaskId); } });
if(deleteFromViewModalBtn) {
    deleteFromViewModalBtn.addEventListener('click', () => {
        if (currentViewTaskId !== null) {
            deleteTask(currentViewTaskId);
            closeViewTaskDetailsModal();
        }
    });
}
if (viewTaskDetailsModal) viewTaskDetailsModal.addEventListener('click', (event) => { if (event.target === viewTaskDetailsModal) closeViewTaskDetailsModal(); });

if(viewTaskStartTimerBtn) viewTaskStartTimerBtn.addEventListener('click', () => { if(featureFlags.taskTimerSystem) handleStartTimer(); });
if(viewTaskPauseTimerBtn) viewTaskPauseTimerBtn.addEventListener('click', () => { if(featureFlags.taskTimerSystem) handlePauseTimer(); });
if(viewTaskStopTimerBtn) viewTaskStopTimerBtn.addEventListener('click', () => { if(featureFlags.taskTimerSystem) handleStopTimer(); });


if (closeManageLabelsModalBtn) closeManageLabelsModalBtn.addEventListener('click', closeManageLabelsModal);
if (closeManageLabelsSecondaryBtn) closeManageLabelsSecondaryBtn.addEventListener('click', closeManageLabelsModal);
if (addNewLabelForm) addNewLabelForm.addEventListener('submit', handleAddNewLabel);
if (manageLabelsModal) manageLabelsModal.addEventListener('click', (event) => { if (event.target === manageLabelsModal) closeManageLabelsModal(); });

if (openSettingsModalButton) openSettingsModalButton.addEventListener('click', openSettingsModal);
if (closeSettingsModalBtn) closeSettingsModalBtn.addEventListener('click', closeSettingsModal);
if (closeSettingsSecondaryBtn) closeSettingsSecondaryBtn.addEventListener('click', closeSettingsModal);
if (settingsModal) settingsModal.addEventListener('click', (event) => { if (event.target === settingsModal) closeSettingsModal(); });
if (settingsClearCompletedBtn) settingsClearCompletedBtn.addEventListener('click', clearCompletedTasks);
if (settingsManageLabelsBtn) { settingsManageLabelsBtn.addEventListener('click', () => { closeSettingsModal(); openManageLabelsModal(); }); }
if (settingsManageRemindersBtn) {
    settingsManageRemindersBtn.addEventListener('click', () => {
        if(featureFlags.reminderFeature) {
            showMessage('Manage Reminders - Coming soon!', 'info');
        } else {
            showMessage('Enable Reminder System in Feature Flags to manage reminders.', 'error');
        }
    });
}
if (settingsTaskReviewBtn) { settingsTaskReviewBtn.addEventListener('click', () => { closeSettingsModal(); openTaskReviewModal(); });}
if (settingsTooltipsGuideBtn) { settingsTooltipsGuideBtn.addEventListener('click', () => {closeSettingsModal(); openTooltipsGuideModal(); }); }

const nonFunctionalFeatureMessageHandler = (featureName) => {
    showMessage(`${featureName} feature is not yet implemented. Coming soon!`, 'info');
};

if (settingsIntegrationsBtn) settingsIntegrationsBtn.addEventListener('click', () => nonFunctionalFeatureMessageHandler('Integrations'));
if (settingsUserAccountsBtn) settingsUserAccountsBtn.addEventListener('click', () => nonFunctionalFeatureMessageHandler('User Accounts'));
if (settingsCollaborationBtn) settingsCollaborationBtn.addEventListener('click', () => nonFunctionalFeatureMessageHandler('Collaboration'));
if (settingsSyncBackupBtn) settingsSyncBackupBtn.addEventListener('click', () => nonFunctionalFeatureMessageHandler('Sync & Backup'));


if (closeTaskReviewModalBtn) closeTaskReviewModalBtn.addEventListener('click', closeTaskReviewModal);
if (closeTaskReviewSecondaryBtn) closeTaskReviewSecondaryBtn.addEventListener('click', closeTaskReviewModal);
if (taskReviewModal) taskReviewModal.addEventListener('click', (event) => { if (event.target === taskReviewModal) closeTaskReviewModal(); });

if (closeTooltipsGuideModalBtn) closeTooltipsGuideModalBtn.addEventListener('click', closeTooltipsGuideModal);
if (closeTooltipsGuideSecondaryBtn) closeTooltipsGuideSecondaryBtn.addEventListener('click', closeTooltipsGuideModal);
if (tooltipsGuideModal) tooltipsGuideModal.addEventListener('click', (event) => { if (event.target === tooltipsGuideModal) closeTooltipsGuideModal(); });

if (testFeatureButton) { testFeatureButton.addEventListener('click', () => { console.log('Test Button Clicked!'); showMessage('Test Button Clicked! Check console.', 'success'); }); }

if (smartViewButtonsContainer) {
    smartViewButtonsContainer.addEventListener('click', (event) => {
        const button = event.target.closest('.smart-view-btn');
        if (button && button.dataset.filter) {
            setFilter(button.dataset.filter);
        }
    });
}

if (taskSearchInput) { taskSearchInput.addEventListener('input', (event) => { currentSearchTerm = event.target.value.trim().toLowerCase(); renderTasks(); }); }
if (sidebarToggleBtn) { sidebarToggleBtn.addEventListener('click', () => { const isCurrentlyMinimized = taskSidebar.classList.contains('sidebar-minimized'); setSidebarMinimized(!isCurrentlyMinimized); }); }
if (sortByDueDateBtn) sortByDueDateBtn.addEventListener('click', () => { currentSort = currentSort === 'dueDate' ? 'default' : 'dueDate'; updateSortButtonStates(); renderTasks(); });
if (sortByPriorityBtn) sortByPriorityBtn.addEventListener('click', () => { currentSort = currentSort === 'priority' ? 'default' : 'priority'; updateSortButtonStates(); renderTasks(); });
if (sortByLabelBtn) sortByLabelBtn.addEventListener('click', () => { currentSort = currentSort === 'label' ? 'default' : 'label'; updateSortButtonStates(); renderTasks(); });

document.addEventListener('keydown', (event) => {
    const isAddModalOpen = addTaskModal && !addTaskModal.classList.contains('hidden');
    const isViewEditModalOpen = viewEditTaskModal && !viewEditTaskModal.classList.contains('hidden');
    const isViewDetailsModalOpen = viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden');
    const isManageLabelsModalOpen = manageLabelsModal && !manageLabelsModal.classList.contains('hidden');
    const isSettingsModalOpen = settingsModal && !settingsModal.classList.contains('hidden');
    const isTaskReviewModalOpen = taskReviewModal && !taskReviewModal.classList.contains('hidden');
    const isTooltipsGuideModalOpen = tooltipsGuideModal && !tooltipsGuideModal.classList.contains('hidden');
    // const isFeatureFlagsModalOpen = featureFlagsModal && !featureFlagsModal.classList.contains('hidden');


    const isAnyModalOpen = isAddModalOpen || isViewEditModalOpen || isViewDetailsModalOpen || isManageLabelsModalOpen || isSettingsModalOpen  || isTaskReviewModalOpen || isTooltipsGuideModalOpen;
    const isInputFocused = document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT' || document.activeElement.tagName === 'TEXTAREA';

    if ((event.key === '+' || event.key === '=') && !isAnyModalOpen && !isInputFocused) { event.preventDefault(); openAddModal(); }
    if (event.key === 'Escape') {
        if (isAddModalOpen) closeAddModal();
        else if (isViewEditModalOpen) closeViewEditModal();
        else if (isViewDetailsModalOpen) closeViewTaskDetailsModal();
        else if (isManageLabelsModalOpen) closeManageLabelsModal();
        else if (isSettingsModalOpen) closeSettingsModal();
        // else if (isFeatureFlagsModalOpen) closeFeatureFlagsModal(); // If you implement this modal
        else if (isTaskReviewModalOpen) closeTaskReviewModal();
        else if (isTooltipsGuideModalOpen) closeTooltipsGuideModal();
    }
});

// --- Initial Setup ---
function initializeTasks() {
    // Ensure all tasks have all expected properties, providing defaults if missing.
    // This helps with backwards compatibility if new properties are added later.
    tasks = tasks.map(task => ({
        id: task.id || Date.now(), // Should always have an ID from creation
        text: task.text || '',
        completed: task.completed || false,
        creationDate: task.creationDate || task.id, // Fallback to id if creationDate missing
        dueDate: task.dueDate || null,
        time: task.time || null,
        priority: task.priority || 'medium',
        label: task.label || '',
        notes: task.notes || '',
        isReminderSet: task.isReminderSet || false,
        reminderDate: task.reminderDate || null,
        reminderTime: task.reminderTime || null,
        reminderEmail: task.reminderEmail || null,
        estimatedHours: task.estimatedHours || 0,
        estimatedMinutes: task.estimatedMinutes || 0,
        timerStartTime: task.timerStartTime || null,
        timerAccumulatedTime: task.timerAccumulatedTime || 0,
        timerIsRunning: task.timerIsRunning || false,
        timerIsPaused: task.timerIsPaused || false,
        actualDurationMs: task.actualDurationMs || 0,
        attachments: task.attachments || [],
        completedDate: task.completedDate || null
    }));
}

// --- Global Initialization ---
window.onload = async () => {
    // Apply initial theme as the very first step to avoid FOUC
    applyInitialTheme(); // Call the function defined earlier

    await loadFeatureFlags(); // Load feature flags first

    initializeTasks();
    updateUniqueLabels(); // Depends on tasks
    applyActiveFeatures(); // Depends on feature flags and DOM elements

    // Initialize Smart View button styles
    smartViewButtons.forEach(button => {
        // Default inactive style (will be overridden by setFilter)
        button.classList.add('bg-slate-200', 'text-slate-700', 'hover:bg-slate-300', 'dark:bg-slate-700', 'dark:text-slate-300', 'dark:hover:bg-slate-600');
        button.querySelector('i')?.classList.add('text-slate-500', 'dark:text-slate-400');
    });

    const savedSidebarState = localStorage.getItem('sidebarState');
    if (savedSidebarState === 'minimized') {
        setSidebarMinimized(true);
    } else {
        setSidebarMinimized(false); // Default to expanded
    }

    setFilter(currentFilter); // This will also call renderTasks
    updateSortButtonStates();
    updateClearCompletedButtonState(); // Depends on tasks
};
