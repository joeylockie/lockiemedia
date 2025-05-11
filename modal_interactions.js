// modal_interactions.js

// This file contains functions for managing modal dialogs (Add, Edit, View, Settings, etc.)
// It assumes that relevant DOM elements and global variables (like 'tasks', 'featureFlags', 'editingTaskId', 'currentViewTaskId', 'uniqueLabels')
// are defined and managed in other JavaScript files (e.g., app_logic.js and the main ui_interactions.js or a new dom_elements.js).
// Helper functions like 'formatDate', 'formatTime', 'formatDuration', 'showMessage', 'populateDatalist',
// 'renderSubTasksForEditModal', 'renderSubTasksForViewModal', 'renderTempSubTasksForAddModal', 'handleDeleteLabel'
// are also assumed to be globally available or imported if using a module system.

// --- Add Task Modal UI Functions ---
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
    if (modalRemindMeAdd) modalRemindMeAdd.checked = false;
    if (modalReminderDateAdd) modalReminderDateAdd.value = '';
    if (modalReminderTimeAdd) modalReminderTimeAdd.value = '';
    if (modalReminderEmailAdd) modalReminderEmailAdd.value = '';
    if (reminderOptionsAdd) reminderOptionsAdd.classList.add('hidden'); // Hide options

    // Set min date for due date and reminder date to today
    const today = new Date();
    const year = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${mm}-${dd}`;
    if (modalDueDateInputAdd) modalDueDateInputAdd.min = todayStr;
    if (modalReminderDateAdd) modalReminderDateAdd.min = todayStr;

    // Reset temporary sub-tasks for the Add modal
    tempSubTasksForAddModal = []; // Assumes tempSubTasksForAddModal is a global or accessible variable
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

// --- View/Edit Task Modal UI Functions ---
function openViewEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    editingTaskId = taskId; // Assumes editingTaskId is a global or accessible variable

    if (modalViewEditTaskId) modalViewEditTaskId.value = task.id;
    if (modalTaskInputViewEdit) modalTaskInputViewEdit.value = task.text;
    if (modalDueDateInputViewEdit) modalDueDateInputViewEdit.value = task.dueDate || '';
    if (modalTimeInputViewEdit) modalTimeInputViewEdit.value = task.time || '';

    // Populate estimate fields if the feature is enabled
    if (featureFlags.taskTimerSystem) {
        if (modalEstHoursViewEdit) modalEstHoursViewEdit.value = task.estimatedHours || '';
        if (modalEstMinutesViewEdit) modalEstMinutesViewEdit.value = task.estimatedMinutes || '';
    }

    if (modalPriorityInputViewEdit) modalPriorityInputViewEdit.value = task.priority;
    if (modalLabelInputViewEdit) modalLabelInputViewEdit.value = task.label || '';
    populateDatalist(existingLabelsEditDatalist); // Assumes existingLabelsEditDatalist is a global DOM element
    if (modalNotesInputViewEdit) modalNotesInputViewEdit.value = task.notes || '';

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
    if(modalDueDateInputViewEdit) modalDueDateInputViewEdit.min = todayStr;
    if (modalReminderDateViewEdit) modalReminderDateViewEdit.min = todayStr;

    // Sub-tasks
    if (featureFlags.subTasksFeature && modalSubTasksListViewEdit) {
        renderSubTasksForEditModal(taskId, modalSubTasksListViewEdit); // Assumes renderSubTasksForEditModal is available
        if(modalSubTaskInputViewEdit) modalSubTaskInputViewEdit.value = '';
    }

    viewEditTaskModal.classList.remove('hidden');
    setTimeout(() => { // For transition
        modalDialogViewEdit.classList.remove('scale-95', 'opacity-0');
        modalDialogViewEdit.classList.add('scale-100', 'opacity-100');
    }, 10);
    if(modalTaskInputViewEdit) modalTaskInputViewEdit.focus();
}

function closeViewEditModal() {
    modalDialogViewEdit.classList.add('scale-95', 'opacity-0');
    modalDialogViewEdit.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        viewEditTaskModal.classList.add('hidden');
        editingTaskId = null; // Clear editing state
    }, 200);
}

// --- View Task Details Modal UI Functions ---
function openViewTaskDetailsModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    currentViewTaskId = taskId; // Assumes currentViewTaskId is a global or accessible variable

    if(viewTaskText) viewTaskText.textContent = task.text;
    if(viewTaskDueDate) viewTaskDueDate.textContent = task.dueDate ? formatDate(task.dueDate) : 'Not set';
    if(viewTaskTime) viewTaskTime.textContent = task.time ? formatTime(task.time) : 'Not set';

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

    if(viewTaskPriority) viewTaskPriority.textContent = task.priority || 'Not set';
    if(viewTaskStatus) viewTaskStatus.textContent = task.completed ? 'Completed' : 'Active';
    if(viewTaskLabel) viewTaskLabel.textContent = task.label || 'None';
    if(viewTaskNotes) viewTaskNotes.textContent = task.notes || 'No notes added.';

    // Reminder details
    if (featureFlags.reminderFeature && viewTaskReminderSection) {
        if (task.isReminderSet) {
            if(viewTaskReminderStatus) viewTaskReminderStatus.textContent = 'Active';
            if (viewTaskReminderDate) viewTaskReminderDate.textContent = task.reminderDate ? formatDate(task.reminderDate) : 'Not set';
            if (viewTaskReminderTime) viewTaskReminderTime.textContent = task.reminderTime ? formatTime(task.reminderTime) : 'Not set';
            if (viewTaskReminderEmail) viewTaskReminderEmail.textContent = task.reminderEmail || 'Not set';
            if (viewTaskReminderDetails) viewTaskReminderDetails.classList.remove('hidden');
        } else {
            if(viewTaskReminderStatus) viewTaskReminderStatus.textContent = 'Not set';
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

// --- Manage Labels Modal UI Functions ---
function openManageLabelsModal() {
    populateManageLabelsList(); // Assumes populateManageLabelsList is available
    manageLabelsModal.classList.remove('hidden');
    setTimeout(() => { // For transition
        modalDialogManageLabels.classList.remove('scale-95', 'opacity-0');
        modalDialogManageLabels.classList.add('scale-100', 'opacity-100');
    }, 10);
    if(newLabelInput) newLabelInput.focus();
}

function closeManageLabelsModal() {
    modalDialogManageLabels.classList.add('scale-95', 'opacity-0');
    modalDialogManageLabels.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        manageLabelsModal.classList.add('hidden');
    }, 200);
}

function populateManageLabelsList() {
    if (!existingLabelsList) return;
    existingLabelsList.innerHTML = ''; // Clear current list
    uniqueLabels.forEach(label => { // Assumes uniqueLabels is global or accessible
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
        deleteBtn.addEventListener('click', () => handleDeleteLabel(label)); // Assumes handleDeleteLabel is available
        li.appendChild(deleteBtn);
        existingLabelsList.appendChild(li);
    });
    if (uniqueLabels.length === 0) {
        existingLabelsList.innerHTML = '<li class="text-slate-500 dark:text-slate-400 text-center">No labels created yet.</li>';
    }
}

// --- Settings Modal UI Functions ---
function openSettingsModal() {
    settingsModal.classList.remove('hidden');
    setTimeout(() => { // For transition
        modalDialogSettings.classList.remove('scale-95', 'opacity-0');
        modalDialogSettings.classList.add('scale-100', 'opacity-100');
    }, 10);
    updateClearCompletedButtonState(); // Assumes updateClearCompletedButtonState is available
}

function closeSettingsModal() {
    modalDialogSettings.classList.add('scale-95', 'opacity-0');
    modalDialogSettings.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        settingsModal.classList.add('hidden');
    }, 200);
}

// --- Task Review Modal UI Functions ---
function openTaskReviewModal() {
    if (!featureFlags.taskTimerSystem) {
        showMessage("Task Timer System feature is currently disabled.", "error"); // Assumes showMessage is available
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
    if (!taskReviewContent) return;
    taskReviewContent.innerHTML = ''; // Clear previous content
    const completedTasksWithTime = tasks.filter(task => // Assumes tasks is global or accessible
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
        estimatedP.innerHTML = `<strong>Estimated:</strong> ${formatDuration(task.estimatedHours, task.estimatedMinutes)}`; // Assumes formatDuration is available
        itemDiv.appendChild(estimatedP);

        const actualP = document.createElement('p');
        actualP.className = 'text-sm text-slate-600 dark:text-slate-300';
        actualP.innerHTML = `<strong>Actual:</strong> ${task.actualDurationMs > 0 ? formatMillisecondsToHMS(task.actualDurationMs) : 'Not recorded'}`; // Assumes formatMillisecondsToHMS is available
        itemDiv.appendChild(actualP);

        if (task.completedDate) {
            const completedOnP = document.createElement('p');
            completedOnP.className = 'text-xs text-slate-400 dark:text-slate-500 mt-1';
            completedOnP.textContent = `Completed on: ${formatDate(task.completedDate)}`; // Assumes formatDate is available
            itemDiv.appendChild(completedOnP);
        }
        taskReviewContent.appendChild(itemDiv);
    });
}

// --- Tooltips Guide Modal UI Functions ---
function openTooltipsGuideModal() {
    if (!featureFlags.tooltipsGuide) { // Assumes featureFlags is global or accessible
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
