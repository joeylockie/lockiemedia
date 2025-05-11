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
const tooltipsGuideContent = document.getElementById('tooltipsGuideContent');
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
// NEW: Sub-task elements for Add Modal
const subTasksSectionAdd = document.getElementById('subTasksSectionAdd');
const modalSubTaskInputAdd = document.getElementById('modalSubTaskInputAdd');
const modalAddSubTaskBtnAdd = document.getElementById('modalAddSubTaskBtnAdd');
const modalSubTasksListAdd = document.getElementById('modalSubTasksListAdd');

// --- Temporary State for UI Interactions ---
let tempSubTasksForAddModal = []; // NEW: For holding sub-tasks during new task creation


// --- UI Helper Functions ---
function showMessage(message, type = 'success') {
    messageBox.textContent = message;
    messageBox.className = 'message-box';
    if (type === 'success') { messageBox.classList.add('bg-green-100', 'text-green-800', 'dark:bg-green-700', 'dark:text-green-100'); }
    else if (type === 'error') { messageBox.classList.add('bg-red-100', 'text-red-800', 'dark:bg-red-700', 'dark:text-red-100'); }
    else { messageBox.classList.add('bg-sky-100', 'text-sky-800', 'dark:bg-sky-700', 'dark:text-sky-100'); }
    messageBox.style.display = 'block';
    messageBox.style.zIndex = '200';
    setTimeout(() => { messageBox.style.display = 'none'; }, 3000);
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
    hideTooltip();
    if (minimize) {
        taskSidebar.classList.remove('md:w-72', 'lg:w-80', 'w-full', 'p-5', 'sm:p-6', 'md:p-5', 'sm:p-4');
        taskSidebar.classList.add('w-16', 'p-3', 'sidebar-minimized');
        sidebarToggleIcon.classList.remove('fa-chevron-left'); sidebarToggleIcon.classList.add('fa-chevron-right');
        sidebarTextElements.forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.sidebar-section-title, #taskSearchInputContainer, #testFeatureButtonContainer .sidebar-text-content').forEach(el => el.classList.add('hidden'));
        sidebarIconOnlyButtons.forEach(btn => { btn.classList.add('justify-center'); const icon = btn.querySelector('i'); if(icon) icon.classList.remove('md:mr-2', 'md:mr-2.5', 'ml-2'); });
        if (testFeatureButton) testFeatureButton.querySelector('.sidebar-text-content')?.classList.add('hidden');
        localStorage.setItem('sidebarState', 'minimized');
    } else {
        taskSidebar.classList.remove('w-16', 'p-3', 'sidebar-minimized');
        taskSidebar.classList.add('w-full', 'md:w-72', 'lg:w-80', 'p-3', 'sm:p-4', 'md:p-5');
        sidebarToggleIcon.classList.remove('fa-chevron-right'); sidebarToggleIcon.classList.add('fa-chevron-left');
        sidebarTextElements.forEach(el => el.classList.remove('hidden'));
        document.querySelectorAll('.sidebar-section-title, #taskSearchInputContainer, #testFeatureButtonContainer .sidebar-text-content').forEach(el => el.classList.remove('hidden'));
        sidebarIconOnlyButtons.forEach(btn => { btn.classList.remove('justify-center'); const icon = btn.querySelector('i'); const textSpan = btn.querySelector('.sidebar-text-content');
            if(icon && textSpan && !textSpan.classList.contains('hidden')) {
                if (btn.id === 'openAddModalButton' || btn.id === 'openSettingsModalButton' || (testFeatureButton && btn.id === testFeatureButton.id)) { icon.classList.add('md:mr-2'); }
                else { icon.classList.add('md:mr-2.5'); }
                textSpan.classList.add('ml-2');
            }
        });
        if (testFeatureButton) testFeatureButton.querySelector('.sidebar-text-content')?.classList.remove('hidden');
        localStorage.setItem('sidebarState', 'expanded');
    }
}
function showTooltip(element, text) {
    if (!taskSidebar.classList.contains('sidebar-minimized')) return;
    iconTooltip.textContent = text;
    const rect = element.getBoundingClientRect();
    iconTooltip.style.left = `${rect.right + 10}px`; iconTooltip.style.top = `${rect.top + (rect.height / 2) - (iconTooltip.offsetHeight / 2)}px`;
    iconTooltip.style.display = 'block';
}
function hideTooltip() { clearTimeout(tooltipTimeout); iconTooltip.style.display = 'none'; }

// --- Modal UI Functions ---
function openAddModal() {
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT' || document.activeElement.tagName === 'TEXTAREA') {
        if (!addTaskModal.classList.contains('hidden')) return;
    }
    addTaskModal.classList.remove('hidden');
    setTimeout(() => { modalDialogAdd.classList.remove('scale-95', 'opacity-0'); modalDialogAdd.classList.add('scale-100', 'opacity-100'); }, 10);
    modalTaskInputAdd.focus(); modalTodoFormAdd.reset(); modalPriorityInputAdd.value = 'medium';
    populateDatalist(existingLabelsDatalist);
    modalEstHoursAdd.value = ''; modalEstMinutesAdd.value = '';
    modalRemindMeAdd.checked = false; modalReminderDateAdd.value = ''; modalReminderTimeAdd.value = ''; modalReminderEmailAdd.value = '';
    if (reminderOptionsAdd) reminderOptionsAdd.classList.add('hidden');
    const today = new Date(); const year = today.getFullYear(); const mm = String(today.getMonth() + 1).padStart(2, '0'); const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${mm}-${dd}`; modalDueDateInputAdd.min = todayStr; if (modalReminderDateAdd) modalReminderDateAdd.min = todayStr;
    
    // NEW: Reset and render temporary sub-tasks for Add Modal
    tempSubTasksForAddModal = [];
    if (featureFlags.subTasksFeature && modalSubTasksListAdd) {
        renderTempSubTasksForAddModal();
        if(modalSubTaskInputAdd) modalSubTaskInputAdd.value = '';
    }
}
function closeAddModal() {
    modalDialogAdd.classList.add('scale-95', 'opacity-0');
    modalDialogAdd.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        addTaskModal.classList.add('hidden');
        tempSubTasksForAddModal = []; // Clear temp sub-tasks on close
        if(modalSubTasksListAdd) modalSubTasksListAdd.innerHTML = ''; // Clear UI
    }, 200);
}

function openViewEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId); if (!task) return; editingTaskId = taskId;
    modalViewEditTaskId.value = task.id; modalTaskInputViewEdit.value = task.text; modalDueDateInputViewEdit.value = task.dueDate || ''; modalTimeInputViewEdit.value = task.time || '';
    if (modalEstHoursViewEdit) modalEstHoursViewEdit.value = task.estimatedHours || ''; if (modalEstMinutesViewEdit) modalEstMinutesViewEdit.value = task.estimatedMinutes || '';
    modalPriorityInputViewEdit.value = task.priority; modalLabelInputViewEdit.value = task.label || ''; populateDatalist(existingLabelsEditDatalist); modalNotesInputViewEdit.value = task.notes || '';
    if (featureFlags.fileAttachments && existingAttachmentsViewEdit) { existingAttachmentsViewEdit.textContent = task.attachments && task.attachments.length > 0 ? `${task.attachments.length} file(s) attached (management UI coming soon)` : 'No files attached yet.';}
    if (featureFlags.reminderFeature && modalRemindMeViewEdit) {
        modalRemindMeViewEdit.checked = task.isReminderSet || false;
        if (reminderOptionsViewEdit) reminderOptionsViewEdit.classList.toggle('hidden', !modalRemindMeViewEdit.checked);
        if (modalRemindMeViewEdit.checked) {
            if (modalReminderDateViewEdit) modalReminderDateViewEdit.value = task.reminderDate || ''; if (modalReminderTimeViewEdit) modalReminderTimeViewEdit.value = task.reminderTime || ''; if (modalReminderEmailViewEdit) modalReminderEmailViewEdit.value = task.reminderEmail || '';
        } else {
            if (modalReminderDateViewEdit) modalReminderDateViewEdit.value = ''; if (modalReminderTimeViewEdit) modalReminderTimeViewEdit.value = ''; if (modalReminderEmailViewEdit) modalReminderEmailViewEdit.value = '';
        }
    } else { if (modalRemindMeViewEdit) modalRemindMeViewEdit.checked = false; if (reminderOptionsViewEdit) reminderOptionsViewEdit.classList.add('hidden');}
    const today = new Date(); const year = today.getFullYear(); const mm = String(today.getMonth() + 1).padStart(2, '0'); const dd = String(today.getDate()).padStart(2, '0'); const todayStr = `${year}-${mm}-${dd}`;
    modalDueDateInputViewEdit.min = todayStr; if (modalReminderDateViewEdit) modalReminderDateViewEdit.min = todayStr;
    
    if (featureFlags.subTasksFeature && modalSubTasksListViewEdit) {
        renderSubTasksForEditModal(taskId, modalSubTasksListViewEdit);
        if(modalSubTaskInputViewEdit) modalSubTaskInputViewEdit.value = '';
    }

    viewEditTaskModal.classList.remove('hidden'); setTimeout(() => { modalDialogViewEdit.classList.remove('scale-95', 'opacity-0'); modalDialogViewEdit.classList.add('scale-100', 'opacity-100'); }, 10);
    modalTaskInputViewEdit.focus();
}
function closeViewEditModal() { modalDialogViewEdit.classList.add('scale-95', 'opacity-0'); modalDialogViewEdit.classList.remove('scale-100', 'opacity-100'); setTimeout(() => { viewEditTaskModal.classList.add('hidden'); editingTaskId = null; }, 200);}

function openViewTaskDetailsModal(taskId) {
    const task = tasks.find(t => t.id === taskId); if (!task) return; currentViewTaskId = taskId;
    viewTaskText.textContent = task.text; viewTaskDueDate.textContent = task.dueDate ? formatDate(task.dueDate) : 'Not set'; viewTaskTime.textContent = task.time ? formatTime(task.time) : 'Not set';
    if (featureFlags.taskTimerSystem) {
        if (viewTaskEstDuration) viewTaskEstDuration.textContent = formatDuration(task.estimatedHours, task.estimatedMinutes); updateTimerControlsUI(task);
        if (task.timerIsRunning && !task.completed) { if (currentTaskTimerInterval) clearInterval(currentTaskTimerInterval); currentTaskTimerInterval = setInterval(() => updateLiveTimerDisplayUI(task.id), 1000); updateLiveTimerDisplayUI(task.id); }
        else if (task.timerIsPaused) { if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(task.timerAccumulatedTime || 0); }
        else if (task.actualDurationMs > 0) { if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(task.actualDurationMs); }
        else { if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = "00:00:00"; }
    }
    if (featureFlags.fileAttachments && viewTaskAttachmentsList) { viewTaskAttachmentsList.textContent = task.attachments && task.attachments.length > 0 ? `Contains ${task.attachments.length} attachment(s) (viewing UI coming soon).` : 'No attachments.';}
    viewTaskPriority.textContent = task.priority || 'Not set'; viewTaskStatus.textContent = task.completed ? 'Completed' : 'Active'; viewTaskLabel.textContent = task.label || 'None'; viewTaskNotes.textContent = task.notes || 'No notes added.';
    if (featureFlags.reminderFeature && viewTaskReminderSection) {
        if (task.isReminderSet) { viewTaskReminderStatus.textContent = 'Active'; if (viewTaskReminderDate) viewTaskReminderDate.textContent = task.reminderDate ? formatDate(task.reminderDate) : 'Not set'; if (viewTaskReminderTime) viewTaskReminderTime.textContent = task.reminderTime ? formatTime(task.reminderTime) : 'Not set'; if (viewTaskReminderEmail) viewTaskReminderEmail.textContent = task.reminderEmail || 'Not set'; if (viewTaskReminderDetails) viewTaskReminderDetails.classList.remove('hidden'); }
        else { viewTaskReminderStatus.textContent = 'Not set'; if (viewTaskReminderDetails) viewTaskReminderDetails.classList.add('hidden'); }
    }

    if (featureFlags.subTasksFeature && modalSubTasksListViewDetails && viewSubTaskProgress && noSubTasksMessageViewDetails) {
        renderSubTasksForViewModal(taskId, modalSubTasksListViewDetails, viewSubTaskProgress, noSubTasksMessageViewDetails);
    }

    viewTaskDetailsModal.classList.remove('hidden'); setTimeout(() => { modalDialogViewDetails.classList.remove('scale-95', 'opacity-0'); modalDialogViewDetails.classList.add('scale-100', 'opacity-100'); }, 10);
}
function closeViewTaskDetailsModal() { modalDialogViewDetails.classList.add('scale-95', 'opacity-0'); modalDialogViewDetails.classList.remove('scale-100', 'opacity-100'); setTimeout(() => { viewTaskDetailsModal.classList.add('hidden'); if (featureFlags.taskTimerSystem && currentTaskTimerInterval) { clearInterval(currentTaskTimerInterval); currentTaskTimerInterval = null; } currentViewTaskId = null; }, 200); }

function openManageLabelsModal() { populateManageLabelsList(); manageLabelsModal.classList.remove('hidden'); setTimeout(() => { modalDialogManageLabels.classList.remove('scale-95', 'opacity-0'); modalDialogManageLabels.classList.add('scale-100', 'opacity-100'); }, 10); newLabelInput.focus(); }
function closeManageLabelsModal() { modalDialogManageLabels.classList.add('scale-95', 'opacity-0'); modalDialogManageLabels.classList.remove('scale-100', 'opacity-100'); setTimeout(() => { manageLabelsModal.classList.add('hidden'); }, 200); }
function populateManageLabelsList() {
    existingLabelsList.innerHTML = '';
    uniqueLabels.forEach(label => {
        const li = document.createElement('li'); li.className = 'flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700 rounded-md';
        const span = document.createElement('span'); span.textContent = label.charAt(0).toUpperCase() + label.slice(1); span.className = 'text-slate-700 dark:text-slate-200'; li.appendChild(span);
        const deleteBtn = document.createElement('button'); deleteBtn.innerHTML = '<i class="fas fa-trash-alt text-red-500 hover:text-red-700"></i>'; deleteBtn.className = 'p-1'; deleteBtn.title = `Delete label "${label}"`; deleteBtn.addEventListener('click', () => handleDeleteLabel(label)); li.appendChild(deleteBtn);
        existingLabelsList.appendChild(li);
    });
    if (uniqueLabels.length === 0) { existingLabelsList.innerHTML = '<li class="text-slate-500 dark:text-slate-400 text-center">No labels created yet.</li>'; }
}

function openSettingsModal() { settingsModal.classList.remove('hidden'); setTimeout(() => { modalDialogSettings.classList.remove('scale-95', 'opacity-0'); modalDialogSettings.classList.add('scale-100', 'opacity-100'); }, 10); updateClearCompletedButtonState(); }
function closeSettingsModal() { modalDialogSettings.classList.add('scale-95', 'opacity-0'); modalDialogSettings.classList.remove('scale-100', 'opacity-100'); setTimeout(() => { settingsModal.classList.add('hidden'); }, 200); }

function openTaskReviewModal() { if (!featureFlags.taskTimerSystem) { showMessage("Task Timer System feature is currently disabled.", "error"); return; } populateTaskReviewModal(); taskReviewModal.classList.remove('hidden'); setTimeout(() => { modalDialogTaskReview.classList.remove('scale-95', 'opacity-0'); modalDialogTaskReview.classList.add('scale-100', 'opacity-100'); }, 10); }
function closeTaskReviewModal() { modalDialogTaskReview.classList.add('scale-95', 'opacity-0'); modalDialogTaskReview.classList.remove('scale-100', 'opacity-100'); setTimeout(() => { taskReviewModal.classList.add('hidden'); }, 200); }
function populateTaskReviewModal() {
    taskReviewContent.innerHTML = '';
    const completedTasksWithTime = tasks.filter(task => task.completed && ((task.estimatedHours && task.estimatedHours > 0) || (task.estimatedMinutes && task.estimatedMinutes > 0) || (task.actualDurationMs && task.actualDurationMs > 0))).sort((a,b) => (b.completedDate || 0) - (a.completedDate || 0));
    if (completedTasksWithTime.length === 0) { taskReviewContent.innerHTML = '<p class="text-slate-500 dark:text-slate-400 text-center">No completed tasks with time data.</p>'; return; }
    completedTasksWithTime.forEach(task => { /* ... create DOM ... */ });
}

function openTooltipsGuideModal() { if (!featureFlags.tooltipsGuide) { showMessage("Tooltips Guide feature is disabled.", "error"); return; } tooltipsGuideModal.classList.remove('hidden'); setTimeout(() => { modalDialogTooltipsGuide.classList.remove('scale-95', 'opacity-0'); modalDialogTooltipsGuide.classList.add('scale-100', 'opacity-100'); }, 10); }
function closeTooltipsGuideModal() { modalDialogTooltipsGuide.classList.add('scale-95', 'opacity-0'); modalDialogTooltipsGuide.classList.remove('scale-100', 'opacity-100'); setTimeout(() => { tooltipsGuideModal.classList.add('hidden'); }, 200); }

// --- Apply Active Features (UI part) ---
function applyActiveFeatures() {
    const toggleElements = (selector, isEnabled) => { document.querySelectorAll(selector).forEach(el => el.classList.toggle('hidden', !isEnabled)); };
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
    toggleElements('.sub-tasks-feature-element', featureFlags.subTasksFeature);

    if (featureFlags.reminderFeature) {
        if (modalRemindMeAdd && addTaskModal && !addTaskModal.classList.contains('hidden')) { if(reminderOptionsAdd) reminderOptionsAdd.classList.toggle('hidden', !modalRemindMeAdd.checked); }
        if (modalRemindMeViewEdit && viewEditTaskModal && !viewEditTaskModal.classList.contains('hidden')) { if(reminderOptionsViewEdit) reminderOptionsViewEdit.classList.toggle('hidden', !modalRemindMeViewEdit.checked); }
    } else { if (reminderOptionsAdd) reminderOptionsAdd.classList.add('hidden'); if (reminderOptionsViewEdit) reminderOptionsViewEdit.classList.add('hidden'); }
    if (settingsTaskReviewBtn) settingsTaskReviewBtn.classList.toggle('hidden', !featureFlags.taskTimerSystem);
    if (settingsTooltipsGuideBtn) settingsTooltipsGuideBtn.classList.toggle('hidden', !featureFlags.tooltipsGuide);
    
    renderTasks();
    if (currentViewTaskId && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) {
        openViewTaskDetailsModal(currentViewTaskId);
    }
}

// --- Task Rendering ---
function renderTasks() {
    taskList.innerHTML = ''; let filteredTasks = []; const today = new Date(); today.setHours(0, 0, 0, 0);
    if (currentFilter === 'inbox') { filteredTasks = tasks.filter(task => !task.completed); }
    else if (currentFilter === 'today') { filteredTasks = tasks.filter(task => { if (!task.dueDate || task.completed) return false; const tdd = new Date(Date.UTC(parseInt(task.dueDate.substring(0,4)), parseInt(task.dueDate.substring(5,7))-1, parseInt(task.dueDate.substring(8,10)))); return tdd.getTime() === today.getTime(); }); }
    else if (currentFilter === 'upcoming') { filteredTasks = tasks.filter(task => { if (!task.dueDate || task.completed) return false; const tdd = new Date(Date.UTC(parseInt(task.dueDate.substring(0,4)), parseInt(task.dueDate.substring(5,7))-1, parseInt(task.dueDate.substring(8,10)))); return tdd.getTime() > today.getTime(); }); }
    else if (currentFilter === 'completed') { filteredTasks = tasks.filter(task => task.completed); }
    else { filteredTasks = tasks.filter(task => task.label && task.label.toLowerCase() === currentFilter.toLowerCase() && !task.completed); }
    if (currentSearchTerm) { filteredTasks = filteredTasks.filter(task => task.text.toLowerCase().includes(currentSearchTerm) || (task.label && task.label.toLowerCase().includes(currentSearchTerm)) || (task.notes && task.notes.toLowerCase().includes(currentSearchTerm)));}
    const priorityOrder = { high: 1, medium: 2, low: 3, default: 4 };
    if (currentSort === 'dueDate') { filteredTasks.sort((a, b) => { const dA = a.dueDate ? new Date(a.dueDate + (a.time ? `T${a.time}` : 'T00:00:00Z')) : null; const dB = b.dueDate ? new Date(b.dueDate + (b.time ? `T${b.time}` : 'T00:00:00Z')) : null; if (dA === null && dB === null) return 0; if (dA === null) return 1; if (dB === null) return -1; return dA - dB; }); }
    else if (currentSort === 'priority') { filteredTasks.sort((a, b) => (priorityOrder[a.priority] || priorityOrder.default) - (priorityOrder[b.priority] || priorityOrder.default) || (a.dueDate && b.dueDate ? new Date(a.dueDate) - new Date(b.dueDate) : 0)); }
    else if (currentSort === 'label') { filteredTasks.sort((a,b) => { const lA = (a.label || '').toLowerCase(); const lB = (b.label || '').toLowerCase(); if (lA < lB) return -1; if (lA > lB) return 1; const dA = a.dueDate ? new Date(a.dueDate + (a.time ? `T${a.time}` : 'T00:00:00Z')) : null; const dB = b.dueDate ? new Date(b.dueDate + (b.time ? `T${b.time}` : 'T00:00:00Z')) : null; if (dA === null && dB === null) return 0; if (dA === null) return 1; if (dB === null) return -1; return dA - dB; }); }
    else if (currentFilter === 'inbox' && currentSort === 'default') { filteredTasks.sort((a, b) => (b.creationDate || b.id) - (a.creationDate || a.id));}
    emptyState.classList.toggle('hidden', tasks.length !== 0); noMatchingTasks.classList.toggle('hidden', !(tasks.length > 0 && filteredTasks.length === 0));
    filteredTasks.forEach((task) => { /* ... create and append li for task ... */ });
}


// --- Sub-task Rendering Functions ---
// NEW: Render temporary sub-tasks for the Add New Task modal
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
        // No data-sub-task-id needed as these are temporary and identified by index

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = subTask.completed;
        checkbox.className = 'form-checkbox h-4 w-4 text-sky-500 rounded border-slate-400 dark:border-slate-500 focus:ring-sky-400 mr-2 cursor-pointer';
        checkbox.addEventListener('change', () => {
            tempSubTasksForAddModal[index].completed = !tempSubTasksForAddModal[index].completed;
            renderTempSubTasksForAddModal(); // Re-render this temporary list
        });

        const textSpan = document.createElement('span');
        textSpan.textContent = subTask.text;
        textSpan.className = `flex-grow break-all ${subTask.completed ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200'}`;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'ml-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200';

        // Only a delete button for temporary sub-tasks
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"></i>';
        deleteBtn.className = 'p-1';
        deleteBtn.title = 'Remove sub-task';
        deleteBtn.addEventListener('click', () => {
            tempSubTasksForAddModal.splice(index, 1); // Remove from temporary array
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
            toggleSubTaskCompleteLogic(parentId, subTask.id);
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
        editBtn.addEventListener('click', () => { /* ... existing edit logic ... */ });

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"></i>';
        deleteBtn.className = 'p-1';
        deleteBtn.title = 'Delete sub-task';
        deleteBtn.addEventListener('click', () => { /* ... existing delete logic ... */ });

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
        li.className = 'flex items-center text-sm group'; // Added group for potential hover effects if needed later
        li.dataset.subTaskId = subTask.id; // Add sub-task ID for identification

        // NEW: Make this an interactive checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = subTask.completed;
        checkbox.className = 'form-checkbox h-4 w-4 text-sky-500 rounded border-slate-400 dark:border-slate-500 focus:ring-sky-400 mr-2 cursor-pointer';
        checkbox.addEventListener('change', () => {
            toggleSubTaskCompleteLogic(parentId, subTask.id);
            // Re-render this view modal's sub-tasks
            renderSubTasksForViewModal(parentId, subTasksListElement, progressElement, noSubTasksMessageElement);
            // If edit modal is open for the same task, update its sub-tasks too
            if (editingTaskId === parentId && viewEditTaskModal && !viewEditTaskModal.classList.contains('hidden')) {
                renderSubTasksForEditModal(parentId, modalSubTasksListViewEdit);
            }
            renderTasks(); // Re-render main task list to update sub-task icon
        });
        
        const textSpan = document.createElement('span');
        textSpan.textContent = subTask.text;
        textSpan.className = `flex-grow break-all ${subTask.completed ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-300'}`;
        
        li.appendChild(checkbox); // Use the actual checkbox
        li.appendChild(textSpan);
        subTasksListElement.appendChild(li);
    });
    progressElement.textContent = `${completedCount}/${parentTask.subTasks.length} completed`;
}


// --- Timer UI Update Functions ---
// ... (Timer functions remain the same) ...

// --- UI State Updaters ---
// ... (UI State updaters remain the same) ...

// --- Event Handlers (Call logic functions from app_logic.js) ---
function handleAddTask(event) {
    event.preventDefault();
    // ... (existing code for main task details) ...
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
    // ... (reminder logic) ...

    if (rawTaskText === '') { /* ... error handling ... */ return; }
    let finalDueDate = explicitDueDate; let finalTaskText = rawTaskText;
    if (!explicitDueDate) { const { parsedDate: dateFromDesc, remainingText: textAfterDate } = parseDateFromText(rawTaskText); if (dateFromDesc) { finalDueDate = dateFromDesc; finalTaskText = textAfterDate.trim() || rawTaskText; }}

    // NEW: Prepare sub-tasks from the temporary list
    const subTasksToSave = featureFlags.subTasksFeature ? tempSubTasksForAddModal.map(st => ({
        id: Date.now() + Math.random(), // Ensure unique ID for new sub-tasks
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
        estimatedHours: featureFlags.taskTimerSystem ? estHours : 0,
        estimatedMinutes: featureFlags.taskTimerSystem ? estMinutes : 0,
        priority: priority,
        label: label || '',
        notes: notes || '',
        isReminderSet: featureFlags.reminderFeature ? isReminderSet : false,
        reminderDate: featureFlags.reminderFeature && isReminderSet ? reminderDate : null,
        reminderTime: featureFlags.reminderFeature && isReminderSet ? reminderTime : null,
        reminderEmail: featureFlags.reminderFeature && isReminderSet ? reminderEmail : null,
        timerStartTime: null,
        timerAccumulatedTime: 0,
        timerIsRunning: false,
        timerIsPaused: false,
        actualDurationMs: 0,
        attachments: [],
        completedDate: null,
        subTasks: subTasksToSave // Assign the prepared sub-tasks
    };
    tasks.unshift(newTask); saveTasks();
    if (currentFilter === 'completed') { setFilter('inbox'); } else { renderTasks(); }
    closeAddModal(); // This will also clear tempSubTasksForAddModal
    showMessage('Task added successfully!', 'success');
}

function handleEditTask(event) {
    // ... (This function remains largely the same, as sub-tasks are edited via their own UI in renderSubTasksForEditModal)
    event.preventDefault();
    const taskId = parseInt(modalViewEditTaskId.value); const taskText = modalTaskInputViewEdit.value.trim(); const dueDate = modalDueDateInputViewEdit.value; const time = modalTimeInputViewEdit.value;
    let estHours = 0, estMinutes = 0; if (featureFlags.taskTimerSystem && modalEstHoursViewEdit && modalEstMinutesViewEdit) { estHours = parseInt(modalEstHoursViewEdit.value) || 0; estMinutes = parseInt(modalEstMinutesViewEdit.value) || 0; }
    const priority = modalPriorityInputViewEdit.value; const label = modalLabelInputViewEdit.value.trim(); const notes = modalNotesInputViewEdit.value.trim();
    let isReminderSet = false, reminderDate = null, reminderTime = null, reminderEmail = null;
    if (featureFlags.reminderFeature && modalRemindMeViewEdit) { /* ... reminder logic ... */ }
    if (taskText === '') { /* ... error handling ... */ return; }
    tasks = tasks.map(task => task.id === taskId ? { ...task, text: taskText, dueDate: dueDate || null, time: time || null, estimatedHours: featureFlags.taskTimerSystem ? estHours : task.estimatedHours, estimatedMinutes: featureFlags.taskTimerSystem ? estMinutes : task.estimatedMinutes, priority: priority, label: label || '', notes: notes || '', isReminderSet: featureFlags.reminderFeature ? isReminderSet : task.isReminderSet, reminderDate: featureFlags.reminderFeature && isReminderSet ? reminderDate : (featureFlags.reminderFeature ? null : task.reminderDate), reminderTime: featureFlags.reminderFeature && isReminderSet ? reminderTime : (featureFlags.reminderFeature ? null : task.reminderTime), reminderEmail: featureFlags.reminderFeature && isReminderSet ? reminderEmail : (featureFlags.reminderFeature ? null : task.reminderEmail), attachments: task.attachments || [] } : task );
    saveTasks(); renderTasks(); closeViewEditModal(); showMessage('Task updated successfully!', 'success');
}

// ... (toggleComplete, deleteTask, setFilter, clearCompletedTasks, label handlers, timer handlers remain the same) ...

// --- Sub-task Event Handlers ---
// Handler for adding sub-task in Edit Modal (remains the same)
function handleAddSubTaskViewEdit() {
    if (!featureFlags.subTasksFeature || !editingTaskId || !modalSubTaskInputViewEdit) return;
    const subTaskText = modalSubTaskInputViewEdit.value.trim();
    if (subTaskText === '') { showMessage('Sub-task description cannot be empty.', 'error'); modalSubTaskInputViewEdit.focus(); return; }
    if (addSubTaskLogic(editingTaskId, subTaskText)) {
        renderSubTasksForEditModal(editingTaskId, modalSubTasksListViewEdit);
        modalSubTaskInputViewEdit.value = '';
        showMessage('Sub-task added.', 'success');
        if (currentViewTaskId === editingTaskId && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden')) {
            renderSubTasksForViewModal(editingTaskId, modalSubTasksListViewDetails, viewSubTaskProgress, noSubTasksMessageViewDetails);
        }
        renderTasks();
    } else { showMessage('Failed to add sub-task.', 'error'); }
}

// NEW: Handler for adding temporary sub-task in Add Modal
function handleAddTempSubTaskForAddModal() {
    if (!featureFlags.subTasksFeature || !modalSubTaskInputAdd) return;
    const subTaskText = modalSubTaskInputAdd.value.trim();
    if (subTaskText === '') {
        showMessage('Sub-task description cannot be empty.', 'error');
        modalSubTaskInputAdd.focus();
        return;
    }
    // Add to temporary list (no need for unique ID yet, just text and completed status)
    tempSubTasksForAddModal.push({ text: subTaskText, completed: false });
    renderTempSubTasksForAddModal();
    modalSubTaskInputAdd.value = ''; // Clear input
}


// --- Event Listeners Setup ---
function setupEventListeners() {
    // ... (existing event listeners) ...

    // Sub-task listeners for Edit Modal (remains the same)
    if (modalAddSubTaskBtnViewEdit) {
        modalAddSubTaskBtnViewEdit.addEventListener('click', handleAddSubTaskViewEdit);
    }
    if (modalSubTaskInputViewEdit) {
        modalSubTaskInputViewEdit.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') { event.preventDefault(); handleAddSubTaskViewEdit(); }
        });
    }

    // NEW: Sub-task listeners for Add Modal
    if (modalAddSubTaskBtnAdd) {
        modalAddSubTaskBtnAdd.addEventListener('click', handleAddTempSubTaskForAddModal);
    }
    if (modalSubTaskInputAdd) {
        modalSubTaskInputAdd.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleAddTempSubTaskForAddModal();
            }
        });
    }
    
    // ... (rest of existing event listeners like keydown for ESC, +, etc.)
}

// --- Global Initialization ---
// ... (remains the same)
