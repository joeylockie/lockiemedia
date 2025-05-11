// --- DOM Elements ---
// (All const declarations for DOM elements go here)
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
// Add Task Modal Elements
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
// View/Edit Task Modal Elements
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
// View Task Details Modal Elements
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
// Timer Elements
const taskTimerSection = document.getElementById('taskTimerSection');
const viewTaskTimerDisplay = document.getElementById('viewTaskTimerDisplay');
const viewTaskStartTimerBtn = document.getElementById('viewTaskStartTimerBtn');
const viewTaskPauseTimerBtn = document.getElementById('viewTaskPauseTimerBtn');
const viewTaskStopTimerBtn = document.getElementById('viewTaskStopTimerBtn');
const viewTaskActualDuration = document.getElementById('viewTaskActualDuration');
const timerButtonsContainer = document.getElementById('timerButtonsContainer');
// Manage Labels Modal Elements
const manageLabelsModal = document.getElementById('manageLabelsModal');
const modalDialogManageLabels = document.getElementById('modalDialogManageLabels');
const closeManageLabelsModalBtn = document.getElementById('closeManageLabelsModalBtn');
const closeManageLabelsSecondaryBtn = document.getElementById('closeManageLabelsSecondaryBtn');
const addNewLabelForm = document.getElementById('addNewLabelForm');
const newLabelInput = document.getElementById('newLabelInput');
const existingLabelsList = document.getElementById('existingLabelsList');
// Settings Modal Elements
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
// Task Review Modal Elements
const taskReviewModal = document.getElementById('taskReviewModal');
const modalDialogTaskReview = document.getElementById('modalDialogTaskReview');
const closeTaskReviewModalBtn = document.getElementById('closeTaskReviewModalBtn');
const closeTaskReviewSecondaryBtn = document.getElementById('closeTaskReviewSecondaryBtn');
const taskReviewContent = document.getElementById('taskReviewContent');
// Tooltips Guide Modal Elements
const tooltipsGuideModal = document.getElementById('tooltipsGuideModal');
const modalDialogTooltipsGuide = document.getElementById('modalDialogTooltipsGuide');
const closeTooltipsGuideModalBtn = document.getElementById('closeTooltipsGuideModalBtn');
const closeTooltipsGuideSecondaryBtn = document.getElementById('closeTooltipsGuideSecondaryBtn');
const tooltipsGuideContent = document.getElementById('tooltipsGuideContent'); // Assuming this exists
// Test Feature Button
const testFeatureButtonContainer = document.getElementById('testFeatureButtonContainer');
const testFeatureButton = document.getElementById('testFeatureButton');
// Sub-task Elements
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
let tempSubTasksForAddModal = [];


// --- UI Helper Functions ---
function showMessage(message, type = 'success') {
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
    uniqueLabels.forEach(label => {
        const option = document.createElement('option');
        option.value = label;
        datalistElement.appendChild(option);
    });
}

// --- Sidebar UI ---
function setSidebarMinimized(minimize) {
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
                // Specific handling for buttons like "Add New Task" vs "Smart View" buttons
                if (btn.id === 'openAddModalButton' || btn.id === 'openSettingsModalButton' || (testFeatureButton && btn.id === testFeatureButton.id)) {
                    icon.classList.add('md:mr-2');
                } else {
                    icon.classList.add('md:mr-2.5');
                }
                textSpan.classList.add('ml-2'); // Ensure text has left margin from icon
            }
        });
        localStorage.setItem('sidebarState', 'expanded');
    }
}
function showTooltip(element, text) {
    if (!taskSidebar.classList.contains('sidebar-minimized')) return; // Only show if minimized
    iconTooltip.textContent = text;
    const rect = element.getBoundingClientRect();
    iconTooltip.style.left = `${rect.right + 10}px`; // Position to the right of the icon
    iconTooltip.style.top = `${rect.top + (rect.height / 2) - (iconTooltip.offsetHeight / 2)}px`; // Vertically centered
    iconTooltip.style.display = 'block';
}
function hideTooltip() { clearTimeout(tooltipTimeout); iconTooltip.style.display = 'none'; }

// --- Modal UI Functions ---
function openAddModal() {
    // Prevent opening if an input field in the modal is already focused (avoid double open)
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT' || document.activeElement.tagName === 'TEXTAREA') {
        if (!addTaskModal.classList.contains('hidden')) return; // Modal already open
    }

    addTaskModal.classList.remove('hidden');
    setTimeout(() => { // For transition
        modalDialogAdd.classList.remove('scale-95', 'opacity-0');
        modalDialogAdd.classList.add('scale-100', 'opacity-100');
    }, 10);
    modalTaskInputAdd.focus();
    modalTodoFormAdd.reset(); // Clear form fields
    modalPriorityInputAdd.value = 'medium'; // Default priority
    populateDatalist(existingLabelsDatalist);

    // Reset estimate fields if the feature is enabled
    if (featureFlags.taskTimerSystem) {
        if(modalEstHoursAdd) modalEstHoursAdd.value = '';
        if(modalEstMinutesAdd) modalEstMinutesAdd.value = '';
    }

    // Reset reminder fields
    modalRemindMeAdd.checked = false;
    modalReminderDateAdd.value = '';
    modalReminderTimeAdd.value = '';
    modalReminderEmailAdd.value = '';
    if (reminderOptionsAdd) reminderOptionsAdd.classList.add('hidden'); // Hide options

    // Set min date for due date and reminder date to today
    const today = new Date();
    const year = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${mm}-${dd}`;
    modalDueDateInputAdd.min = todayStr;
    if (modalReminderDateAdd) modalReminderDateAdd.min = todayStr;

    // Reset temporary sub-tasks for the Add modal
    tempSubTasksForAddModal = [];
    if (featureFlags.subTasksFeature && modalSubTasksListAdd) {
        renderTempSubTasksForAddModal(); // Clear and display "no sub-tasks" message
        if(modalSubTaskInputAdd) modalSubTaskInputAdd.value = '';
    }
}
function closeAddModal() {
    modalDialogAdd.classList.add('scale-95', 'opacity-0');
    modalDialogAdd.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        addTaskModal.classList.add('hidden');
        tempSubTasksForAddModal = []; // Clear temp sub-tasks
        if(modalSubTasksListAdd) modalSubTasksListAdd.innerHTML = ''; // Clear UI
    }, 200); // Match transition duration
}

function openViewEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    editingTaskId = taskId;

    modalViewEditTaskId.value = task.id;
    modalTaskInputViewEdit.value = task.text;
    modalDueDateInputViewEdit.value = task.dueDate || '';
    modalTimeInputViewEdit.value = task.time || '';

    // Populate estimate fields if the feature is enabled
    if (featureFlags.taskTimerSystem) {
        if (modalEstHoursViewEdit) modalEstHoursViewEdit.value = task.estimatedHours || '';
        if (modalEstMinutesViewEdit) modalEstMinutesViewEdit.value = task.estimatedMinutes || '';
    }

    modalPriorityInputViewEdit.value = task.priority;
    modalLabelInputViewEdit.value = task.label || '';
    populateDatalist(existingLabelsEditDatalist);
    modalNotesInputViewEdit.value = task.notes || '';

    // File Attachments (Placeholder)
    if (featureFlags.fileAttachments && existingAttachmentsViewEdit) {
        existingAttachmentsViewEdit.textContent = task.attachments && task.attachments.length > 0 ?
            `${task.attachments.length} file(s) attached (management UI coming soon)` :
            'No files attached yet.';
    }

    // Reminder fields
    if (featureFlags.reminderFeature && modalRemindMeViewEdit) {
        modalRemindMeViewEdit.checked = task.isReminderSet || false;
        if (reminderOptionsViewEdit) reminderOptionsViewEdit.classList.toggle('hidden', !modalRemindMeViewEdit.checked);
        if (modalRemindMeViewEdit.checked) {
            if (modalReminderDateViewEdit) modalReminderDateViewEdit.value = task.reminderDate || '';
            if (modalReminderTimeViewEdit) modalReminderTimeViewEdit.value = task.reminderTime || '';
            if (modalReminderEmailViewEdit) modalReminderEmailViewEdit.value = task.reminderEmail || '';
        } else { // Clear fields if reminder is not set or unchecked
            if (modalReminderDateViewEdit) modalReminderDateViewEdit.value = '';
            if (modalReminderTimeViewEdit) modalReminderTimeViewEdit.value = '';
            if (modalReminderEmailViewEdit) modalReminderEmailViewEdit.value = '';
        }
    } else { // Feature disabled
        if (modalRemindMeViewEdit) modalRemindMeViewEdit.checked = false;
        if (reminderOptionsViewEdit) reminderOptionsViewEdit.classList.add('hidden');
    }
    // Set min date for due date and reminder date to today
    const today = new Date();
    const year = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${mm}-${dd}`;
    modalDueDateInputViewEdit.min = todayStr;
    if (modalReminderDateViewEdit) modalReminderDateViewEdit.min = todayStr;

    // Sub-tasks
    if (featureFlags.subTasksFeature && modalSubTasksListViewEdit) {
        renderSubTasksForEditModal(taskId, modalSubTasksListViewEdit);
        if(modalSubTaskInputViewEdit) modalSubTaskInputViewEdit.value = '';
    }

    viewEditTaskModal.classList.remove('hidden');
    setTimeout(() => { // For transition
        modalDialogViewEdit.classList.remove('scale-95', 'opacity-0');
        modalDialogViewEdit.classList.add('scale-100', 'opacity-100');
    }, 10);
    modalTaskInputViewEdit.focus();
}
function closeViewEditModal() {
    modalDialogViewEdit.classList.add('scale-95', 'opacity-0');
    modalDialogViewEdit.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        viewEditTaskModal.classList.add('hidden');
        editingTaskId = null; // Clear editing state
    }, 200);
}

function openViewTaskDetailsModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    currentViewTaskId = taskId;

    viewTaskText.textContent = task.text;
    viewTaskDueDate.textContent = task.dueDate ? formatDate(task.dueDate) : 'Not set';
    viewTaskTime.textContent = task.time ? formatTime(task.time) : 'Not set';

    // Task Timer System integration
    if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem) {
        window.AppFeatures.TaskTimerSystem.setupTimerForModal(task);
    } else { // Fallback or hide if feature/module not available
        if(viewTaskEstDuration) viewTaskEstDuration.textContent = formatDuration(task.estimatedHours, task.estimatedMinutes); // Still show estimate
        if(taskTimerSection) taskTimerSection.classList.add('hidden'); // Hide timer controls
    }

    // File Attachments (Placeholder)
    if (featureFlags.fileAttachments && viewTaskAttachmentsList) {
        viewTaskAttachmentsList.textContent = task.attachments && task.attachments.length > 0 ?
            `Contains ${task.attachments.length} attachment(s) (viewing UI coming soon).` :
            'No attachments.';
    }

    viewTaskPriority.textContent = task.priority || 'Not set';
    viewTaskStatus.textContent = task.completed ? 'Completed' : 'Active';
    viewTaskLabel.textContent = task.label || 'None';
    viewTaskNotes.textContent = task.notes || 'No notes added.';

    // Reminder details
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
    }

    // Sub-tasks
    if (featureFlags.subTasksFeature && modalSubTasksListViewDetails && viewSubTaskProgress && noSubTasksMessageViewDetails) {
        renderSubTasksForViewModal(taskId, modalSubTasksListViewDetails, viewSubTaskProgress, noSubTasksMessageViewDetails);
    }


    viewTaskDetailsModal.classList.remove('hidden');
    setTimeout(() => { // For transition
        modalDialogViewDetails.classList.remove('scale-95', 'opacity-0');
        modalDialogViewDetails.classList.add('scale-100', 'opacity-100');
    }, 10);
}
function closeViewTaskDetailsModal() {
    modalDialogViewDetails.classList.add('scale-95', 'opacity-0');
    modalDialogViewDetails.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        viewTaskDetailsModal.classList.add('hidden');
        // Clear timer interval if Task Timer System is active
        if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem) {
            window.AppFeatures.TaskTimerSystem.clearTimerOnModalClose();
        }
        currentViewTaskId = null; // Clear viewing state
    }, 200);
}

function openManageLabelsModal() {
    populateManageLabelsList();
    manageLabelsModal.classList.remove('hidden');
    setTimeout(() => { // For transition
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
    existingLabelsList.innerHTML = ''; // Clear current list
    uniqueLabels.forEach(label => {
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700 rounded-md';
        const span = document.createElement('span');
        span.textContent = label.charAt(0).toUpperCase() + label.slice(1); // Capitalize
        span.className = 'text-slate-700 dark:text-slate-200';
        li.appendChild(span);
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt text-red-500 hover:text-red-700"></i>';
        deleteBtn.className = 'p-1'; // For easier clicking
        deleteBtn.title = `Delete label "${label}"`;
        deleteBtn.addEventListener('click', () => handleDeleteLabel(label));
        li.appendChild(deleteBtn);
        existingLabelsList.appendChild(li);
    });
    if (uniqueLabels.length === 0) {
        existingLabelsList.innerHTML = '<li class="text-slate-500 dark:text-slate-400 text-center">No labels created yet.</li>';
    }
}

function openSettingsModal() {
    settingsModal.classList.remove('hidden');
    setTimeout(() => { // For transition
        modalDialogSettings.classList.remove('scale-95', 'opacity-0');
        modalDialogSettings.classList.add('scale-100', 'opacity-100');
    }, 10);
    updateClearCompletedButtonState();
}
function closeSettingsModal() {
    modalDialogSettings.classList.add('scale-95', 'opacity-0');
    modalDialogSettings.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        settingsModal.classList.add('hidden');
    }, 200);
}

function openTaskReviewModal() {
    if (!featureFlags.taskTimerSystem) {
        showMessage("Task Timer System feature is currently disabled.", "error");
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
    setTimeout(() => { taskReviewModal.classList.add('hidden'); }, 200);
}
function populateTaskReviewModal() {
    taskReviewContent.innerHTML = ''; // Clear previous content
    const completedTasksWithTime = tasks.filter(task =>
        task.completed &&
        ((task.estimatedHours && task.estimatedHours > 0) ||
         (task.estimatedMinutes && task.estimatedMinutes > 0) ||
         (task.actualDurationMs && task.actualDurationMs > 0))
    ).sort((a,b) => (b.completedDate || 0) - (a.completedDate || 0)); // Sort by most recently completed

    if (completedTasksWithTime.length === 0) {
        taskReviewContent.innerHTML = '<p class="text-slate-500 dark:text-slate-400 text-center">No completed tasks with time data.</p>';
        return;
    }

    completedTasksWithTime.forEach(task => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'p-3 bg-slate-50 dark:bg-slate-700 rounded-lg shadow';

        const taskName = document.createElement('h4');
        taskName.className = 'text-md font-semibold text-slate-800 dark:text-slate-100 mb-1 truncate';
        taskName.textContent = task.text;
        itemDiv.appendChild(taskName);

        const estimatedP = document.createElement('p');
        estimatedP.className = 'text-sm text-slate-600 dark:text-slate-300';
        estimatedP.innerHTML = `<strong>Estimated:</strong> ${formatDuration(task.estimatedHours, task.estimatedMinutes)}`;
        itemDiv.appendChild(estimatedP);

        const actualP = document.createElement('p');
        actualP.className = 'text-sm text-slate-600 dark:text-slate-300';
        actualP.innerHTML = `<strong>Actual:</strong> ${task.actualDurationMs > 0 ? formatMillisecondsToHMS(task.actualDurationMs) : 'Not recorded'}`;
        itemDiv.appendChild(actualP);

        if (task.completedDate) {
            const completedOnP = document.createElement('p');
            completedOnP.className = 'text-xs text-slate-400 dark:text-slate-500 mt-1';
            completedOnP.textContent = `Completed on: ${formatDate(task.completedDate)}`;
            itemDiv.appendChild(completedOnP);
        }
        taskReviewContent.appendChild(itemDiv);
    });
}

function openTooltipsGuideModal() {
    if (!featureFlags.tooltipsGuide) {
        showMessage("Tooltips Guide feature is disabled.", "error");
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
    setTimeout(() => { tooltipsGuideModal.classList.add('hidden'); }, 200);
}


// --- Apply Active Features (UI part) ---
function applyActiveFeatures() {
    const toggleElements = (selector, isEnabled) => {
        document.querySelectorAll(selector).forEach(el => el.classList.toggle('hidden', !isEnabled));
    };

    // Test Button Feature
    if (window.AppFeatures && typeof window.AppFeatures.updateTestButtonUIVisibility === 'function') {
        window.AppFeatures.updateTestButtonUIVisibility(featureFlags.testButtonFeature);
    } else { // Fallback
        if (testFeatureButtonContainer) testFeatureButtonContainer.classList.toggle('hidden', !featureFlags.testButtonFeature);
    }

    // Task Timer System Feature
    if (window.AppFeatures && window.AppFeatures.TaskTimerSystem && typeof window.AppFeatures.TaskTimerSystem.updateUIVisibility === 'function') {
        window.AppFeatures.TaskTimerSystem.updateUIVisibility(featureFlags.taskTimerSystem);
    } else { // Fallback
        toggleElements('.task-timer-system-element', featureFlags.taskTimerSystem);
        if (settingsTaskReviewBtn) settingsTaskReviewBtn.classList.toggle('hidden', !featureFlags.taskTimerSystem);
    }

    // Reminder Feature
    if (window.AppFeatures && typeof window.AppFeatures.updateReminderUIVisibility === 'function') {
        window.AppFeatures.updateReminderUIVisibility(featureFlags.reminderFeature);
    } else { // Fallback
        toggleElements('.reminder-feature-element', featureFlags.reminderFeature);
    }
    // Ensure reminder options visibility is also updated based on checkbox state if feature is on
    if (featureFlags.reminderFeature) {
        if (modalRemindMeAdd && addTaskModal && !addTaskModal.classList.contains('hidden')) { // Check if add modal is open
            if(reminderOptionsAdd) reminderOptionsAdd.classList.toggle('hidden', !modalRemindMeAdd.checked);
        }
        if (modalRemindMeViewEdit && viewEditTaskModal && !viewEditTaskModal.classList.contains('hidden')) { // Check if edit modal is open
            if(reminderOptionsViewEdit) reminderOptionsViewEdit.classList.toggle('hidden', !modalRemindMeViewEdit.checked);
        }
    } else { // If feature is off, ensure options are hidden
        if (reminderOptionsAdd) reminderOptionsAdd.classList.add('hidden');
        if (reminderOptionsViewEdit) reminderOptionsViewEdit.classList.add('hidden');
    }


    // Advanced Recurrence Feature
    if (window.AppFeatures && typeof window.AppFeatures.updateAdvancedRecurrenceUIVisibility === 'function') {
        window.AppFeatures.updateAdvancedRecurrenceUIVisibility(featureFlags.advancedRecurrence);
    } else { // Fallback
        toggleElements('.advanced-recurrence-element', featureFlags.advancedRecurrence);
    }

    // Other features (using direct toggle for now, can be modularized later)
    toggleElements('.file-attachments-element', featureFlags.fileAttachments);
    toggleElements('.integrations-services-element', featureFlags.integrationsServices);
    toggleElements('.user-accounts-element', featureFlags.userAccounts);
    toggleElements('.collaboration-sharing-element', featureFlags.collaborationSharing);
    toggleElements('.cross-device-sync-element', featureFlags.crossDeviceSync);
    toggleElements('.tooltips-guide-element', featureFlags.tooltipsGuide);
    toggleElements('.sub-tasks-feature-element', featureFlags.subTasksFeature);


    // Update visibility of settings buttons tied to features
    // settingsTaskReviewBtn is handled by TaskTimerSystem.updateUIVisibility
    if (settingsTooltipsGuideBtn) settingsTooltipsGuideBtn.classList.toggle('hidden', !featureFlags.tooltipsGuide);
    // settingsManageRemindersBtn is part of '.reminder-feature-element' so its visibility is already handled.

    renderTasks(); // Re-render tasks to reflect any UI changes related to features (e.g., icons)

    // If a task is being viewed, refresh its details modal to reflect feature changes
    if (currentViewTaskId && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) {
        const task = tasks.find(t => t.id === currentViewTaskId);
        if (task) openViewTaskDetailsModal(currentViewTaskId); // This will re-run setupTimerForModal if needed
    }
}


// --- Task Rendering ---
function renderTasks() {
    taskList.innerHTML = ''; // Clear existing tasks
    let filteredTasks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date

    // Apply current filter
    if (currentFilter === 'inbox') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'today') {
        filteredTasks = tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const tdd = new Date(Date.UTC(parseInt(task.dueDate.substring(0,4)), parseInt(task.dueDate.substring(5,7))-1, parseInt(task.dueDate.substring(8,10)))); // Use UTC for date part comparison
            return tdd.getTime() === today.getTime();
        });
    } else if (currentFilter === 'upcoming') {
        filteredTasks = tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const tdd = new Date(Date.UTC(parseInt(task.dueDate.substring(0,4)), parseInt(task.dueDate.substring(5,7))-1, parseInt(task.dueDate.substring(8,10)))); // Use UTC
            return tdd.getTime() > today.getTime();
        });
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    } else { // Label filter
        filteredTasks = tasks.filter(task => task.label && task.label.toLowerCase() === currentFilter.toLowerCase() && !task.completed);
    }

    // Apply search term
    if (currentSearchTerm) {
        filteredTasks = filteredTasks.filter(task =>
            task.text.toLowerCase().includes(currentSearchTerm) ||
            (task.label && task.label.toLowerCase().includes(currentSearchTerm)) ||
            (task.notes && task.notes.toLowerCase().includes(currentSearchTerm))
        );
    }

    // Apply sorting
    const priorityOrder = { high: 1, medium: 2, low: 3, default: 4 };
    if (currentSort === 'dueDate') {
        filteredTasks.sort((a, b) => {
            const dA = a.dueDate ? new Date(a.dueDate + (a.time ? `T${a.time}` : 'T00:00:00Z')) : null; // Combine date and time for sorting
            const dB = b.dueDate ? new Date(b.dueDate + (b.time ? `T${b.time}` : 'T00:00:00Z')) : null;
            if (dA === null && dB === null) return 0;
            if (dA === null) return 1; // Tasks without due dates go to the end
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
    // else: default sort (usually by creation/ID or as fetched) for other views if not specified

    // Update empty/no-match states
    emptyState.classList.toggle('hidden', tasks.length !== 0);
    noMatchingTasks.classList.toggle('hidden', !(tasks.length > 0 && filteredTasks.length === 0));

    // Render each task
    filteredTasks.forEach((task) => {
        const li = document.createElement('li');
        li.className = `task-item flex items-start justify-between bg-slate-100 dark:bg-slate-700 p-3 sm:p-3.5 rounded-lg shadow hover:shadow-md transition-shadow duration-300 ${task.completed ? 'opacity-60' : ''} overflow-hidden`;
        li.dataset.taskId = task.id;

        const mainContentClickableArea = document.createElement('div');
        mainContentClickableArea.className = 'task-item-clickable-area flex items-start flex-grow min-w-0 mr-2 rounded-l-lg'; // Ensure it's clickable
        mainContentClickableArea.addEventListener('click', (event) => {
            // Prevent opening details if checkbox or action button was clicked
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
        textDetailsDiv.className = 'flex flex-col flex-grow min-w-0'; // For text wrapping

        const span = document.createElement('span');
        span.textContent = task.text;
        let textColorClass = task.completed ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200';
        span.className = `text-sm sm:text-base break-words ${textColorClass} ${task.completed ? 'completed-text' : ''}`;
        textDetailsDiv.appendChild(span);

        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'flex items-center flex-wrap gap-x-2 gap-y-1 mt-1 sm:mt-1.5 text-xs'; // For badges and date

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
        // File attachment icon (if feature enabled and attachments exist)
        if (featureFlags.fileAttachments && task.attachments && task.attachments.length > 0) {
            const aS = document.createElement('span');
            aS.className = 'text-slate-500 dark:text-slate-400 flex items-center file-attachments-element'; // Class for feature toggle
            aS.innerHTML = `<i class="fas fa-paperclip mr-1"></i> ${task.attachments.length}`;
            detailsContainer.appendChild(aS);
        }
        // Sub-task icon (if feature enabled and sub-tasks exist)
        if (featureFlags.subTasksFeature && task.subTasks && task.subTasks.length > 0) {
            const subTaskIcon = document.createElement('span');
            subTaskIcon.className = 'text-slate-400 dark:text-slate-500 flex items-center sub-tasks-feature-element'; // Class for feature toggle
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
        actionsDiv.className = 'task-actions flex-shrink-0 self-start'; // Shown on hover

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


// --- Sub-task Rendering Functions ---
function renderTempSubTasksForAddModal() {
    if (!featureFlags.subTasksFeature || !modalSubTasksListAdd) return;
    modalSubTasksListAdd.innerHTML = ''; // Clear previous

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
            renderTempSubTasksForAddModal(); // Re-render to reflect change
        });

        const textSpan = document.createElement('span');
        textSpan.textContent = subTask.text;
        textSpan.className = `flex-grow break-all ${subTask.completed ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200'}`;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'ml-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200';

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button'; // Important for forms
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"></i>';
        deleteBtn.className = 'p-1';
        deleteBtn.title = 'Remove sub-task';
        deleteBtn.addEventListener('click', () => {
            tempSubTasksForAddModal.splice(index, 1);
            renderTempSubTasksForAddModal(); // Re-render
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
    subTasksListElement.innerHTML = ''; // Clear previous
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
            toggleSubTaskCompleteLogic(parentId, subTask.id);
            renderSubTasksForEditModal(parentId, subTasksListElement); // Re-render this modal's list
            // If view details modal is also open for this task, update it too
            if (currentViewTaskId === parentId && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) {
                renderSubTasksForViewModal(parentId, modalSubTasksListViewDetails, viewSubTaskProgress, noSubTasksMessageViewDetails);
            }
            renderTasks(); // Re-render main task list for icons
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
                if (editSubTaskLogic(parentId, subTask.id, newText.trim())) {
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
                if (deleteSubTaskLogic(parentId, subTask.id)) {
                    renderSubTasksForEditModal(parentId, subTasksListElement);
                    if (currentViewTaskId === parentId && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) {
                        renderSubTasksForViewModal(parentId, modalSubTasksListViewDetails, viewSubTaskProgress, noSubTasksMessageViewDetails);
                    }
                    showMessage('Sub-task deleted.', 'success');
                    renderTasks(); // Re-render main task list for icons
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
    subTasksListElement.innerHTML = ''; // Clear previous
    const parentTask = tasks.find(t => t.id === parentId);

    if (!parentTask || !parentTask.subTasks || parentTask.subTasks.length === 0) {
        progressElement.textContent = ''; // No progress to show
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
        li.className = 'flex items-center text-sm group'; // Group for potential future hover effects
        li.dataset.subTaskId = subTask.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = subTask.completed;
        checkbox.className = 'form-checkbox h-4 w-4 text-sky-500 rounded border-slate-400 dark:border-slate-500 focus:ring-sky-400 mr-2 cursor-pointer';
        checkbox.addEventListener('change', () => {
            toggleSubTaskCompleteLogic(parentId, subTask.id);
            renderSubTasksForViewModal(parentId, subTasksListElement, progressElement, noSubTasksMessageElement); // Re-render this modal's list
            // If edit modal is also open for this task, update it too
            if (editingTaskId === parentId && viewEditTaskModal && !viewEditTaskModal.classList.contains('hidden')) {
                renderSubTasksForEditModal(parentId, modalSubTasksListViewEdit);
            }
            renderTasks(); // Re-render main task list for icons
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
            btn.classList.toggle('sort-btn-active', currentSort === sortType);
        }
    });
}
function updateClearCompletedButtonState() {
    const hasCompleted = tasks.some(task => task.completed);
    if (settingsClearCompletedBtn) {
        settingsClearCompletedBtn.disabled = !hasCompleted;
        settingsClearCompletedBtn.classList.toggle('opacity-50', !hasCompleted);
        settingsClearCompletedBtn.classList.toggle('cursor-not-allowed', !hasCompleted);

        // More explicit class management for better visual feedback
        const activeClasses = ['bg-red-50', 'hover:bg-red-100', 'text-red-700', 'dark:bg-red-900/50', 'dark:hover:bg-red-800/70', 'dark:text-red-300'];
        const disabledClasses = ['bg-slate-100', 'text-slate-400', 'dark:bg-slate-700', 'dark:text-slate-500', 'hover:bg-slate-100', 'dark:hover:bg-slate-700']; // Ensure hover state is also neutral when disabled

        if (hasCompleted) {
            settingsClearCompletedBtn.classList.remove(...disabledClasses);
            settingsClearCompletedBtn.classList.add(...activeClasses);
        } else {
            settingsClearCompletedBtn.classList.remove(...activeClasses);
            settingsClearCompletedBtn.classList.add(...disabledClasses);
        }
    }
}

// --- Event Handlers ---
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
    // Parse date from description if no explicit due date is set
    if (!explicitDueDate) {
        const { parsedDate: dateFromDesc, remainingText: textAfterDate } = parseDateFromText(rawTaskText);
        if (dateFromDesc) {
            finalDueDate = dateFromDesc;
            finalTaskText = textAfterDate.trim() || rawTaskText; // Use remaining text or original if empty
        }
    }

    const subTasksToSave = featureFlags.subTasksFeature ? tempSubTasksForAddModal.map(st => ({
        id: Date.now() + Math.random(), // Unique ID for subtask
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
        attachments: [], // Placeholder for file attachments feature
        completedDate: null,
        subTasks: subTasksToSave, // Add sub-tasks
        // Recurrence fields (will be populated by recurrence UI when implemented)
        recurrenceRule: null,
        recurrenceEndDate: null,
        nextDueDate: finalDueDate || null // Initially, next due date is the main due date
    };

    tasks.unshift(newTask); // Add to the beginning of the array
    saveTasks();

    if (currentFilter === 'completed') { // If viewing completed, switch to inbox to see the new task
        setFilter('inbox');
    } else {
        renderTasks();
    }
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
    const originalTask = tasks.find(t => t.id === taskId); // Get original for fallback
    if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem) {
        const estimates = window.AppFeatures.TaskTimerSystem.getEstimatesFromEditModal();
        estHours = estimates.estHours;
        estMinutes = estimates.estMinutes;
    } else if (originalTask) { // Fallback if feature is off or module not loaded
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

    tasks = tasks.map(task =>
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
            attachments: task.attachments || [] // Preserve existing attachments
            // Sub-tasks are edited separately via their own controls within the modal
            // Recurrence fields would also be updated here if the UI was present
        } : task
    );
    saveTasks();
    renderTasks();
    closeViewEditModal();
    showMessage('Task updated successfully!', 'success');

    // If the task being edited is currently in the view details modal, refresh its timer display
    if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem && currentViewTaskId === taskId) {
        const updatedTask = tasks.find(t => t.id === taskId);
        if (updatedTask) {
             window.AppFeatures.TaskTimerSystem.setupTimerForModal(updatedTask); // Re-setup timer display
        }
    }
}

function toggleComplete(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    tasks[taskIndex].completedDate = tasks[taskIndex].completed ? Date.now() : null;

    // Handle timer implications if the Task Timer System is active
    if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem) {
        window.AppFeatures.TaskTimerSystem.handleTaskCompletion(taskId, tasks[taskIndex].completed);
        // saveTasks() is called within handleTaskCompletion (via stopTimerLogic) if timer was running/paused
    }
    // If timer wasn't running/paused, handleTaskCompletion might not save.
    // Or if the feature is off. So, ensure saveTasks() is called.
    saveTasks();
    renderTasks();

    // If the completed task is the one in the view modal, update its timer controls
    if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem && currentViewTaskId === taskId) {
         const task = tasks.find(t => t.id === taskId);
         if(task) window.AppFeatures.TaskTimerSystem.setupTimerForModal(task); // Re-setup to reflect completion
    }
}

function deleteTask(taskId) {
    // If the task being deleted is the one in the view modal, clear its timer
    if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem && currentViewTaskId === taskId) {
        window.AppFeatures.TaskTimerSystem.clearTimerOnModalClose();
    }
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
    showMessage('Task deleted.', 'error'); // Using 'error' for red color, though it's a success action
}

function setFilter(filter) {
    setAppCurrentFilter(filter); // Calls a function in app_logic.js to set global state
    updateSortButtonStates(); // Reset sort buttons visually

    smartViewButtons.forEach(button => {
        const isActive = button.dataset.filter === filter;
        // Define classes for active and inactive states for clarity
        const baseInactiveClasses = ['bg-slate-200', 'text-slate-700', 'hover:bg-slate-300', 'dark:bg-slate-700', 'dark:text-slate-300', 'dark:hover:bg-slate-600'];
        const iconInactiveClasses = ['text-slate-500', 'dark:text-slate-400'];
        const activeClasses = ['bg-sky-500', 'text-white', 'font-semibold', 'dark:bg-sky-600', 'dark:text-sky-50'];
        const iconActiveClasses = ['text-sky-100', 'dark:text-sky-200']; // Lighter icon color for active state

        // Remove all possible state classes first
        button.classList.remove(...baseInactiveClasses, ...activeClasses);
        button.querySelector('i')?.classList.remove(...iconInactiveClasses, ...iconActiveClasses);

        // Apply classes for the current state
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
        showMessage('No completed tasks to clear.', 'error'); // Or 'info'
        return;
    }
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
    showMessage(`${completedCount} completed task${completedCount > 1 ? 's' : ''} cleared.`, 'success');
    closeSettingsModal(); // Close settings after action
}

function handleAddNewLabel(event) {
    event.preventDefault();
    const labelName = newLabelInput.value.trim();
    if (labelName === '') {
        showMessage('Label name cannot be empty.', 'error');
        return;
    }
    if (uniqueLabels.some(l => l.toLowerCase() === labelName.toLowerCase())) {
        showMessage(`Label "${labelName}" already exists.`, 'error');
        return;
    }
    uniqueLabels.push(labelName);
    uniqueLabels.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())); // Keep sorted
    saveTasks(); // Save tasks because labels might be implicitly stored or used by tasks
    populateManageLabelsList(); // Refresh list in modal
    newLabelInput.value = ''; // Clear input
    showMessage(`Label "${labelName}" added.`, 'success');
}

function handleDeleteLabel(labelToDelete) {
    // Remove the label from all tasks that use it
    tasks = tasks.map(task => {
        if (task.label && task.label.toLowerCase() === labelToDelete.toLowerCase()) {
            return { ...task, label: '' }; // Clear the label
        }
        return task;
    });
    saveTasks(); // Save changes to tasks
    populateManageLabelsList(); // Refresh the list in the modal
    renderTasks(); // Re-render tasks in the main view
    showMessage(`Label "${labelToDelete}" deleted. Tasks using it have been unlabelled.`, 'success');
}


function handleAddSubTaskViewEdit() {
    if (!featureFlags.subTasksFeature || !editingTaskId || !modalSubTaskInputViewEdit) return;
    const subTaskText = modalSubTaskInputViewEdit.value.trim();
    if (subTaskText === '') {
        showMessage('Sub-task description cannot be empty.', 'error');
        modalSubTaskInputViewEdit.focus();
        return;
    }
    if (addSubTaskLogic(editingTaskId, subTaskText)) {
        renderSubTasksForEditModal(editingTaskId, modalSubTasksListViewEdit);
        modalSubTaskInputViewEdit.value = ''; // Clear input
        showMessage('Sub-task added.', 'success');
        // If view details modal is also open for this task, update it too
        if (currentViewTaskId === editingTaskId && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) {
            renderSubTasksForViewModal(editingTaskId, modalSubTasksListViewDetails, viewSubTaskProgress, noSubTasksMessageViewDetails);
        }
        renderTasks(); // Re-render main task list for icons
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
    modalSubTaskInputAdd.value = ''; // Clear input
}


// --- Event Listeners Setup ---
function setupEventListeners() {
    // Add Task Modal
    if (openAddModalButton) openAddModalButton.addEventListener('click', openAddModal);
    if (closeAddModalBtn) closeAddModalBtn.addEventListener('click', closeAddModal);
    if (cancelAddModalBtn) cancelAddModalBtn.addEventListener('click', closeAddModal);
    if (modalTodoFormAdd) modalTodoFormAdd.addEventListener('submit', handleAddTask);
    if (addTaskModal) addTaskModal.addEventListener('click', (event) => { if (event.target === addTaskModal) closeAddModal(); }); // Close on backdrop click

    // Reminder toggles in Modals
    if (modalRemindMeAdd) {
        modalRemindMeAdd.addEventListener('change', () => {
            if(featureFlags.reminderFeature && reminderOptionsAdd) {
                reminderOptionsAdd.classList.toggle('hidden', !modalRemindMeAdd.checked);
                if (modalRemindMeAdd.checked) { // Pre-fill if due date/time available
                    if (modalDueDateInputAdd.value && !modalReminderDateAdd.value) modalReminderDateAdd.value = modalDueDateInputAdd.value;
                    if (modalTimeInputAdd.value && !modalReminderTimeAdd.value) modalReminderTimeAdd.value = modalTimeInputAdd.value;
                    const today = new Date(); // Ensure min date is set
                    modalReminderDateAdd.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                }
            } else if (reminderOptionsAdd) { // Ensure hidden if feature off
                reminderOptionsAdd.classList.add('hidden');
            }
        });
    }
    if (modalRemindMeViewEdit) {
        modalRemindMeViewEdit.addEventListener('change', () => {
            if(featureFlags.reminderFeature && reminderOptionsViewEdit) {
                reminderOptionsViewEdit.classList.toggle('hidden', !modalRemindMeViewEdit.checked);
                if (modalRemindMeViewEdit.checked) { // Ensure min date is set
                     const today = new Date();
                     modalReminderDateViewEdit.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                }
            } else if (reminderOptionsViewEdit) { // Ensure hidden if feature off
                reminderOptionsViewEdit.classList.add('hidden');
            }
        });
    }

    // View/Edit Task Modal
    if (closeViewEditModalBtn) closeViewEditModalBtn.addEventListener('click', closeViewEditModal);
    if (cancelViewEditModalBtn) cancelViewEditModalBtn.addEventListener('click', closeViewEditModal);
    if (modalTodoFormViewEdit) modalTodoFormViewEdit.addEventListener('submit', handleEditTask);
    if (viewEditTaskModal) viewEditTaskModal.addEventListener('click', (event) => { if (event.target === viewEditTaskModal) closeViewEditModal(); });

    // View Task Details Modal
    if (closeViewDetailsModalBtn) closeViewDetailsModalBtn.addEventListener('click', closeViewTaskDetailsModal);
    if (closeViewDetailsSecondaryBtn) closeViewDetailsSecondaryBtn.addEventListener('click', closeViewTaskDetailsModal);
    if (editFromViewModalBtn) editFromViewModalBtn.addEventListener('click', () => { if (currentViewTaskId !== null) { closeViewTaskDetailsModal(); openViewEditModal(currentViewTaskId); } });
    if(deleteFromViewModalBtn) { deleteFromViewModalBtn.addEventListener('click', () => { if (currentViewTaskId !== null) { deleteTask(currentViewTaskId); closeViewTaskDetailsModal(); } }); }
    if (viewTaskDetailsModal) viewTaskDetailsModal.addEventListener('click', (event) => { if (event.target === viewTaskDetailsModal) closeViewTaskDetailsModal(); });

    // Manage Labels Modal
    if (closeManageLabelsModalBtn) closeManageLabelsModalBtn.addEventListener('click', closeManageLabelsModal);
    if (closeManageLabelsSecondaryBtn) closeManageLabelsSecondaryBtn.addEventListener('click', closeManageLabelsModal);
    if (addNewLabelForm) addNewLabelForm.addEventListener('submit', handleAddNewLabel);
    if (manageLabelsModal) manageLabelsModal.addEventListener('click', (event) => { if (event.target === manageLabelsModal) closeManageLabelsModal(); });

    // Settings Modal
    if (openSettingsModalButton) openSettingsModalButton.addEventListener('click', openSettingsModal);
    if (closeSettingsModalBtn) closeSettingsModalBtn.addEventListener('click', closeSettingsModal);
    if (closeSettingsSecondaryBtn) closeSettingsSecondaryBtn.addEventListener('click', closeSettingsModal);
    if (settingsModal) settingsModal.addEventListener('click', (event) => { if (event.target === settingsModal) closeSettingsModal(); });
    if (settingsClearCompletedBtn) settingsClearCompletedBtn.addEventListener('click', clearCompletedTasks);
    if (settingsManageLabelsBtn) { settingsManageLabelsBtn.addEventListener('click', () => { closeSettingsModal(); openManageLabelsModal(); }); }
    if (settingsManageRemindersBtn) { settingsManageRemindersBtn.addEventListener('click', () => { if(featureFlags.reminderFeature) { showMessage('Manage Reminders - Coming soon!', 'info'); } else { showMessage('Enable Reminder System in Feature Flags.', 'error'); }});}
    if (settingsTaskReviewBtn) { settingsTaskReviewBtn.addEventListener('click', () => { closeSettingsModal(); openTaskReviewModal(); });}
    if (settingsTooltipsGuideBtn) { settingsTooltipsGuideBtn.addEventListener('click', () => {closeSettingsModal(); openTooltipsGuideModal(); }); }
    // Placeholder handlers for upcoming features in settings
    const nonFunctionalFeatureMessageHandler = (featureName) => { showMessage(`${featureName} feature is not yet implemented. Coming soon!`, 'info'); };
    if (settingsIntegrationsBtn) settingsIntegrationsBtn.addEventListener('click', () => nonFunctionalFeatureMessageHandler('Integrations'));
    if (settingsUserAccountsBtn) settingsUserAccountsBtn.addEventListener('click', () => nonFunctionalFeatureMessageHandler('User Accounts'));
    if (settingsCollaborationBtn) settingsCollaborationBtn.addEventListener('click', () => nonFunctionalFeatureMessageHandler('Collaboration'));
    if (settingsSyncBackupBtn) settingsSyncBackupBtn.addEventListener('click', () => nonFunctionalFeatureMessageHandler('Sync & Backup'));


    // Task Review Modal
    if (closeTaskReviewModalBtn) closeTaskReviewModalBtn.addEventListener('click', closeTaskReviewModal);
    if (closeTaskReviewSecondaryBtn) closeTaskReviewSecondaryBtn.addEventListener('click', closeTaskReviewModal);
    if (taskReviewModal) taskReviewModal.addEventListener('click', (event) => { if (event.target === taskReviewModal) closeTaskReviewModal(); });

    // Tooltips Guide Modal
    if (closeTooltipsGuideModalBtn) closeTooltipsGuideModalBtn.addEventListener('click', closeTooltipsGuideModal);
    if (closeTooltipsGuideSecondaryBtn) closeTooltipsGuideSecondaryBtn.addEventListener('click', closeTooltipsGuideModal);
    if (tooltipsGuideModal) tooltipsGuideModal.addEventListener('click', (event) => { if (event.target === tooltipsGuideModal) closeTooltipsGuideModal(); });


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
            setAppSearchTerm(event.target.value.trim().toLowerCase()); // Update global search term
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
    // Sidebar icon tooltips
    sidebarIconOnlyButtons.forEach(button => {
        button.addEventListener('mouseenter', (event) => {
            if (!taskSidebar.classList.contains('sidebar-minimized')) return; // Only if minimized
            clearTimeout(tooltipTimeout); // Clear any existing timeout
            tooltipTimeout = setTimeout(() => { // Show after a short delay
                const tooltipText = button.title || button.querySelector('.sidebar-text-content')?.textContent.trim();
                if (tooltipText) {
                    showTooltip(event.currentTarget, tooltipText);
                }
            }, 500); // 500ms delay
        });
        button.addEventListener('mouseleave', () => {
            hideTooltip();
        });
    });


    // Sort Buttons
    if (sortByDueDateBtn) sortByDueDateBtn.addEventListener('click', () => { setAppCurrentSort(currentSort === 'dueDate' ? 'default' : 'dueDate'); updateSortButtonStates(); renderTasks(); });
    if (sortByPriorityBtn) sortByPriorityBtn.addEventListener('click', () => { setAppCurrentSort(currentSort === 'priority' ? 'default' : 'priority'); updateSortButtonStates(); renderTasks(); });
    if (sortByLabelBtn) sortByLabelBtn.addEventListener('click', () => { setAppCurrentSort(currentSort === 'label' ? 'default' : 'label'); updateSortButtonStates(); renderTasks(); });


    // Sub-task input and add buttons
    if (modalAddSubTaskBtnViewEdit) { modalAddSubTaskBtnViewEdit.addEventListener('click', handleAddSubTaskViewEdit); }
    if (modalSubTaskInputViewEdit) { modalSubTaskInputViewEdit.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); handleAddSubTaskViewEdit(); } }); }
    if (modalAddSubTaskBtnAdd) { modalAddSubTaskBtnAdd.addEventListener('click', handleAddTempSubTaskForAddModal); }
    if (modalSubTaskInputAdd) { modalSubTaskInputAdd.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); handleAddTempSubTaskForAddModal(); } }); }


    // Global Keydown Listener (for shortcuts like '+' and 'Esc')
    document.addEventListener('keydown', (event) => {
        const isAddModalOpen = addTaskModal && !addTaskModal.classList.contains('hidden');
        const isViewEditModalOpen = viewEditTaskModal && !viewEditTaskModal.classList.contains('hidden');
        const isViewDetailsModalOpen = viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden');
        const isManageLabelsModalOpen = manageLabelsModal && !manageLabelsModal.classList.contains('hidden');
        const isSettingsModalOpen = settingsModal && !settingsModal.classList.contains('hidden');
        const isTaskReviewModalOpen = taskReviewModal && !taskReviewModal.classList.contains('hidden');
        const isTooltipsGuideModalOpen = tooltipsGuideModal && !tooltipsGuideModal.classList.contains('hidden');
        const isFeatureFlagsModalOpen = document.getElementById('featureFlagsModal') && !document.getElementById('featureFlagsModal').classList.contains('hidden'); // Check if feature flags modal is open

        const isAnyModalOpen = isAddModalOpen || isViewEditModalOpen || isViewDetailsModalOpen ||
                               isManageLabelsModalOpen || isSettingsModalOpen  || isTaskReviewModalOpen ||
                               isTooltipsGuideModalOpen || isFeatureFlagsModalOpen;

        const isInputFocused = document.activeElement.tagName === 'INPUT' ||
                               document.activeElement.tagName === 'SELECT' ||
                               document.activeElement.tagName === 'TEXTAREA';
        // Specifically check if the focused input is one of the sub-task inputs
        const isSubTaskInputFocused = document.activeElement === modalSubTaskInputViewEdit || document.activeElement === modalSubTaskInputAdd;


        if ((event.key === '+' || event.key === '=') && !isAnyModalOpen && !isInputFocused && !isSubTaskInputFocused) {
            event.preventDefault();
            openAddModal();
        }
        if (event.key === 'Escape') {
            if (isAddModalOpen) closeAddModal();
            else if (isViewEditModalOpen) closeViewEditModal();
            else if (isViewDetailsModalOpen) closeViewTaskDetailsModal();
            else if (isManageLabelsModalOpen) closeManageLabelsModal();
            else if (isSettingsModalOpen) closeSettingsModal();
            else if (isTaskReviewModalOpen) closeTaskReviewModal();
            else if (isTooltipsGuideModalOpen) closeTooltipsGuideModal();
            else if (isFeatureFlagsModalOpen) { // Close feature flags modal if open
                const closeBtn = document.getElementById('closeFeatureFlagsModalBtn');
                if (closeBtn) closeBtn.click(); // Simulate click on its close button
            }
        }
    });
}

// --- Global Initialization ---
window.onload = async () => {
    console.log("window.onload in ui_interactions.js starting");
    await loadFeatureFlags(); // Loads featureFlags globally from features.json
    initializeTasks();    // Initializes tasks array globally from localStorage
    updateUniqueLabels(); // Updates uniqueLabels globally based on tasks
    populateDatalist(existingLabelsDatalist); // Populate for Add Modal
    populateDatalist(existingLabelsEditDatalist); // Populate for Edit Modal

    // Initialize feature modules AFTER featureFlags are loaded
    if (window.AppFeatures) {
        // Test Button Feature
        if (window.AppFeatures.initializeTestButtonFeature) {
            window.AppFeatures.initializeTestButtonFeature();
        }
        // Task Timer System Feature
        if (window.AppFeatures.TaskTimerSystem && typeof window.AppFeatures.TaskTimerSystem.initialize === 'function') {
            window.AppFeatures.TaskTimerSystem.initialize();
        }
        // Reminder Feature
        if (window.AppFeatures.initializeReminderFeature) {
            window.AppFeatures.initializeReminderFeature();
        }
        // Advanced Recurrence Feature
        if (window.AppFeatures.initializeAdvancedRecurrenceFeature) {
            window.AppFeatures.initializeAdvancedRecurrenceFeature();
        }
        // ... initialize other feature modules here in the future
    }

    applyActiveFeatures(); // Applies UI changes based on loaded featureFlags

    // Set initial state for smart view buttons (cosmetic)
    smartViewButtons.forEach(button => {
        // Default inactive state classes
        button.classList.add('bg-slate-200', 'text-slate-700', 'hover:bg-slate-300', 'dark:bg-slate-700', 'dark:text-slate-300', 'dark:hover:bg-slate-600');
        button.querySelector('i')?.classList.add('text-slate-500', 'dark:text-slate-400');
    });

    // Restore sidebar state
    const savedSidebarState = localStorage.getItem('sidebarState');
    if (savedSidebarState === 'minimized') {
        setSidebarMinimized(true);
    } else {
        setSidebarMinimized(false); // Default to expanded
    }

    // Set initial filter and render tasks
    if (typeof setFilter === 'function') { // Ensure setFilter is defined
        setFilter(currentFilter); // currentFilter is global from app_logic.js
    } else {
        console.error("setFilter function is not defined when called in window.onload!");
    }
    updateSortButtonStates();
    updateClearCompletedButtonState(); // Set initial state of the clear button
    setupEventListeners(); // Sets up general event listeners for UI elements
};
