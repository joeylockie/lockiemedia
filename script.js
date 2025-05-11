// --- DOM Elements ---
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
document.getElementById('currentYear').textContent = new Date().getFullYear();

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
const modalEstHoursAdd = document.getElementById('modalEstHoursAdd'); // New
const modalEstMinutesAdd = document.getElementById('modalEstMinutesAdd'); // New
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
const modalEstHoursViewEdit = document.getElementById('modalEstHoursViewEdit'); // New
const modalEstMinutesViewEdit = document.getElementById('modalEstMinutesViewEdit'); // New
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

// View Task Details Modal elements
const viewTaskDetailsModal = document.getElementById('viewTaskDetailsModal');
const modalDialogViewDetails = document.getElementById('modalDialogViewDetails');
const closeViewDetailsModalBtn = document.getElementById('closeViewDetailsModalBtn');
const closeViewDetailsSecondaryBtn = document.getElementById('closeViewDetailsSecondaryBtn');
const editFromViewModalBtn = document.getElementById('editFromViewModalBtn');
const viewTaskText = document.getElementById('viewTaskText');
const viewTaskDueDate = document.getElementById('viewTaskDueDate');
const viewTaskTime = document.getElementById('viewTaskTime');
const viewTaskEstDuration = document.getElementById('viewTaskEstDuration'); // New
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
const settingsFeatureFlagsBtn = document.getElementById('settingsFeatureFlagsBtn');

// Feature Flags Modal elements
const featureFlagsModal = document.getElementById('featureFlagsModal');
const modalDialogFeatureFlags = document.getElementById('modalDialogFeatureFlags');
const closeFeatureFlagsModalBtn = document.getElementById('closeFeatureFlagsModalBtn');
const closeFeatureFlagsSecondaryBtn = document.getElementById('closeFeatureFlagsSecondaryBtn');
const featureFlagsListContainer = document.getElementById('featureFlagsListContainer');

// Test Feature Button elements
const testFeatureButtonContainer = document.getElementById('testFeatureButtonContainer');
const testFeatureButton = document.getElementById('testFeatureButton');


// --- Application State ---
let tasks = JSON.parse(localStorage.getItem('todos_v3')) || [];
let currentFilter = 'inbox';
let currentSort = 'default';
let currentSearchTerm = '';
let editingTaskId = null;
let currentViewTaskId = null;
let tooltipTimeout = null;
let uniqueLabels = [];
let featureFlags = JSON.parse(localStorage.getItem('featureFlags_v1')) || {
    testButtonFeature: false,
    reminderFeature: false
};


// --- Theme Management ---
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (event.matches) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
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
                if (btn.id === 'openAddModalButton' || btn.id === 'openSettingsModalButton' || btn.id === 'testFeatureButton') {
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
        applyActiveFeatures();
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
    if (!addTaskModal.classList.contains('hidden') ||
        document.activeElement.tagName === 'INPUT' ||
        document.activeElement.tagName === 'SELECT' ||
        document.activeElement.tagName === 'TEXTAREA') {
        return;
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

    // Reset duration fields
    modalEstHoursAdd.value = '';
    modalEstMinutesAdd.value = '';

    modalRemindMeAdd.checked = false;
    modalReminderDateAdd.value = '';
    modalReminderTimeAdd.value = '';
    modalReminderEmailAdd.value = '';

    if (featureFlags.reminderFeature && modalRemindMeAdd.checked) {
        reminderOptionsAdd.classList.remove('hidden');
    } else {
        reminderOptionsAdd.classList.add('hidden');
    }

    const today = new Date();
    const year = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${mm}-${dd}`;
    modalDueDateInputAdd.min = todayStr;
    modalReminderDateAdd.min = todayStr;
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
    modalEstHoursViewEdit.value = task.estimatedHours || ''; // Populate duration
    modalEstMinutesViewEdit.value = task.estimatedMinutes || ''; // Populate duration
    modalPriorityInputViewEdit.value = task.priority;
    modalLabelInputViewEdit.value = task.label || '';
    populateDatalist(existingLabelsEditDatalist);
    modalNotesInputViewEdit.value = task.notes || '';

    if (featureFlags.reminderFeature) {
        modalRemindMeViewEdit.checked = task.isReminderSet || false;
        reminderOptionsViewEdit.classList.toggle('hidden', !modalRemindMeViewEdit.checked);
        if (modalRemindMeViewEdit.checked) {
            modalReminderDateViewEdit.value = task.reminderDate || '';
            modalReminderTimeViewEdit.value = task.reminderTime || '';
            modalReminderEmailViewEdit.value = task.reminderEmail || '';
        } else {
            modalReminderDateViewEdit.value = '';
            modalReminderTimeViewEdit.value = '';
            modalReminderEmailViewEdit.value = '';
        }
    } else {
            modalRemindMeViewEdit.checked = false;
            reminderOptionsViewEdit.classList.add('hidden');
    }

    const today = new Date();
    const year = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${mm}-${dd}`;
    modalDueDateInputViewEdit.min = todayStr;
    modalReminderDateViewEdit.min = todayStr;

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

// --- Helper function to format duration ---
function formatDuration(hours, minutes) {
    if ((!hours || hours === 0) && (!minutes || minutes === 0)) {
        return 'Not set';
    }
    let parts = [];
    if (hours && hours > 0) {
        parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
    }
    if (minutes && minutes > 0) {
        parts.push(`${minutes} min${minutes > 1 ? 's' : ''}`);
    }
    return parts.join(' ');
}

// --- Modal Functions (View Task Details) ---
function openViewTaskDetailsModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    currentViewTaskId = taskId;

    viewTaskText.textContent = task.text;
    viewTaskDueDate.textContent = task.dueDate ? formatDate(task.dueDate) : 'Not set';
    viewTaskTime.textContent = task.time ? formatTime(task.time) : 'Not set';
    viewTaskEstDuration.textContent = formatDuration(task.estimatedHours, task.estimatedMinutes); // Display formatted duration
    viewTaskPriority.textContent = task.priority || 'Not set';
    viewTaskStatus.textContent = task.completed ? 'Completed' : 'Active';
    viewTaskLabel.textContent = task.label || 'None';
    viewTaskNotes.textContent = task.notes || 'No notes added.';

    if (featureFlags.reminderFeature && task.isReminderSet) {
        viewTaskReminderStatus.textContent = 'Active';
        viewTaskReminderDate.textContent = task.reminderDate ? formatDate(task.reminderDate) : 'Not set';
        viewTaskReminderTime.textContent = task.reminderTime ? formatTime(task.reminderTime) : 'Not set';
        viewTaskReminderEmail.textContent = task.reminderEmail || 'Not set';
        viewTaskReminderDetails.classList.remove('hidden');
        viewTaskReminderSection.classList.remove('hidden');
    } else {
        viewTaskReminderStatus.textContent = 'Not set';
        viewTaskReminderDetails.classList.add('hidden');
        if (featureFlags.reminderFeature) {
                viewTaskReminderSection.classList.remove('hidden');
        } else {
                viewTaskReminderSection.classList.add('hidden');
        }
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
        currentViewTaskId = null;
    }, 200);
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
        span.textContent = label;
        span.className = 'text-slate-700 dark:text-slate-200 capitalize';
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
    const labelName = newLabelInput.value.trim().toLowerCase();
    if (labelName === '') {
        showMessage('Label name cannot be empty.', 'error');
        return;
    }
    if (uniqueLabels.includes(labelName)) {
        showMessage(`Label "${labelName}" already exists.`, 'error');
        return;
    }
    uniqueLabels.push(labelName);
    uniqueLabels.sort();
    saveTasks();
    populateManageLabelsList();
    populateDatalist(existingLabelsDatalist);
    populateDatalist(existingLabelsEditDatalist);
    newLabelInput.value = '';
    showMessage(`Label "${labelName}" added.`, 'success');
}

function handleDeleteLabel(labelToDelete) {
    const normalizedLabelToDelete = labelToDelete.toLowerCase();
    tasks = tasks.map(task => {
        if (task.label && task.label.toLowerCase() === normalizedLabelToDelete) {
            return { ...task, label: '' };
        }
        return task;
    });
    saveTasks();
    populateManageLabelsList();
    renderTasks();
    showMessage(`Label "${labelToDelete}" deleted and removed from tasks.`, 'success');
}

// --- Modal Functions (Settings) ---
function openSettingsModal() {
    settingsModal.classList.remove('hidden');
    setTimeout(() => {
        modalDialogSettings.classList.remove('scale-95', 'opacity-0');
        modalDialogSettings.classList.add('scale-100', 'opacity-100');
    }, 10);
    applyActiveFeatures();
}

function closeSettingsModal() {
    modalDialogSettings.classList.add('scale-95', 'opacity-0');
    modalDialogSettings.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        settingsModal.classList.add('hidden');
    }, 200);
}

// --- Modal Functions (Feature Flags) ---
function openFeatureFlagsModal() {
    renderFeatureFlags();
    featureFlagsModal.classList.remove('hidden');
    setTimeout(() => {
        modalDialogFeatureFlags.classList.remove('scale-95', 'opacity-0');
        modalDialogFeatureFlags.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function closeFeatureFlagsModal() {
    modalDialogFeatureFlags.classList.add('scale-95', 'opacity-0');
    modalDialogFeatureFlags.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        featureFlagsModal.classList.add('hidden');
    }, 200);
}

function renderFeatureFlags() {
    featureFlagsListContainer.innerHTML = '';
    Object.keys(featureFlags).forEach(flagKey => {
        const flagItem = document.createElement('div');
        flagItem.className = 'feature-flag-item';

        const label = document.createElement('label');
        label.htmlFor = `flag-${flagKey}`;
        const displayName = flagKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        label.textContent = displayName;
        label.className = 'feature-flag-label mr-4';

        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'relative';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `flag-${flagKey}`;
        checkbox.name = flagKey;
        checkbox.checked = featureFlags[flagKey];
        checkbox.className = 'toggle-checkbox';

        const toggleTrack = document.createElement('label');
        toggleTrack.htmlFor = `flag-${flagKey}`;
        toggleTrack.className = 'toggle-label';

        toggleContainer.appendChild(checkbox);
        toggleContainer.appendChild(toggleTrack);

        checkbox.addEventListener('change', (event) => {
            toggleFeatureFlag(flagKey, event.target.checked);
        });

        flagItem.appendChild(label);
        flagItem.appendChild(toggleContainer);
        featureFlagsListContainer.appendChild(flagItem);
    });
}


function toggleFeatureFlag(flagName, isEnabled) {
    featureFlags[flagName] = isEnabled;
    saveFeatureFlags();
    applyActiveFeatures();
    showMessage(`Feature "${flagName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}" ${isEnabled ? 'enabled' : 'disabled'}.`, 'success');
}

function saveFeatureFlags() {
    localStorage.setItem('featureFlags_v1', JSON.stringify(featureFlags));
}

function loadFeatureFlags() {
    const storedFlags = localStorage.getItem('featureFlags_v1');
    let updated = false;
    if (storedFlags) {
        featureFlags = JSON.parse(storedFlags);
    }
    if (typeof featureFlags.testButtonFeature === 'undefined') {
        featureFlags.testButtonFeature = false;
        updated = true;
    }
    if (typeof featureFlags.reminderFeature === 'undefined') {
        featureFlags.reminderFeature = false;
        updated = true;
    }
    if (updated) {
        saveFeatureFlags();
    }
}

function applyActiveFeatures() {
    // Test Button Feature
    if (testFeatureButtonContainer && testFeatureButton) {
        testFeatureButtonContainer.classList.toggle('hidden', !featureFlags.testButtonFeature);
        const textSpan = testFeatureButton.querySelector('.sidebar-text-content');
        if (textSpan) {
            textSpan.classList.toggle('hidden', taskSidebar.classList.contains('sidebar-minimized') && featureFlags.testButtonFeature);
        }
    }

    const reminderFeatureElements = document.querySelectorAll('.reminder-feature-element');
    reminderFeatureElements.forEach(el => {
        el.classList.toggle('hidden', !featureFlags.reminderFeature);
    });

    if (!featureFlags.reminderFeature) {
        if (reminderOptionsAdd) reminderOptionsAdd.classList.add('hidden');
        if (reminderOptionsViewEdit) reminderOptionsViewEdit.classList.add('hidden');
    } else {
        if (modalRemindMeAdd && addTaskModal && !addTaskModal.classList.contains('hidden')) {
                reminderOptionsAdd.classList.toggle('hidden', !modalRemindMeAdd.checked);
        }
        if (modalRemindMeViewEdit && viewEditTaskModal && !viewEditTaskModal.classList.contains('hidden')) {
            reminderOptionsViewEdit.classList.toggle('hidden', !modalRemindMeViewEdit.checked);
        }
    }
}


// --- Date & Time Helper Functions ---
function getTodayDateString() { return new Date().toISOString().split('T')[0]; }
function getDateString(date) { return date.toISOString().split('T')[0]; }
function formatDate(dateString) { if (!dateString) return ''; const date = new Date(dateString); const userTimezoneOffset = date.getTimezoneOffset() * 60000; const correctedDate = new Date(date.getTime() + userTimezoneOffset); return correctedDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
function formatTime(timeString) { if (!timeString) return ''; const [hours, minutes] = timeString.split(':'); const h = parseInt(hours, 10); const ampm = h >= 12 ? 'PM' : 'AM'; const formattedHours = h % 12 || 12; return `${formattedHours}:${minutes} ${ampm}`; }

// --- Core Functions ---
function showMessage(message, type = 'success') { messageBox.textContent = message; messageBox.className = 'message-box'; if (type === 'success') { messageBox.classList.add('bg-green-100', 'text-green-800', 'dark:bg-green-700', 'dark:text-green-100'); } else { messageBox.classList.add('bg-red-100', 'text-red-800', 'dark:bg-red-700', 'dark:text-red-100'); } messageBox.style.display = 'block'; messageBox.style.zIndex = '200'; setTimeout(() => { messageBox.style.display = 'none'; }, 3000); }
function saveTasks() { localStorage.setItem('todos_v3', JSON.stringify(tasks)); updateUniqueLabels(); }
function getPriorityClass(priority) { switch (priority) { case 'high': return 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100'; case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-yellow-100'; case 'low': return 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100'; default: return 'bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-200'; } }

function updateUniqueLabels() {
    const labels = new Set();
    tasks.forEach(task => {
        if (task.label && task.label.trim() !== '') {
            labels.add(task.label.trim().toLowerCase());
        }
    });
    uniqueLabels = Array.from(labels).sort();
    populateDatalist(existingLabelsDatalist);
    populateDatalist(existingLabelsEditDatalist);
}

function populateDatalist(datalistElement) {
    if (!datalistElement) return;
    datalistElement.innerHTML = '';
    uniqueLabels.forEach(label => {
        const option = document.createElement('option');
        option.value = label.charAt(0).toUpperCase() + label.slice(1);
        datalistElement.appendChild(option);
    });
}

function renderTasks() {
    taskList.innerHTML = '';
    let filteredTasks = [];
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const todayStr = getDateString(todayDate);

    if (currentFilter === 'inbox') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'today') {
        filteredTasks = tasks.filter(task => task.dueDate === todayStr && !task.completed);
    } else if (currentFilter === 'upcoming') {
        filteredTasks = tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const taskDueDate = new Date(task.dueDate);
            const userTimezoneOffset = taskDueDate.getTimezoneOffset() * 60000;
            const correctedTaskDueDate = new Date(taskDueDate.getTime() + userTimezoneOffset);
            correctedTaskDueDate.setHours(0,0,0,0);
            return correctedTaskDueDate > todayDate;
        });
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    if (currentSearchTerm) {
        filteredTasks = filteredTasks.filter(task => task.text.toLowerCase().includes(currentSearchTerm));
    }

    const priorityOrder = { high: 1, medium: 2, low: 3 };
    if (currentSort === 'dueDate') {
        filteredTasks.sort((a, b) => {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            const dateA = new Date(a.dueDate + (a.time ? `T${a.time}` : 'T00:00:00'));
            const dateB = new Date(b.dueDate + (b.time ? `T${b.time}` : 'T00:00:00'));
            return dateA - dateB;
        });
    } else if (currentSort === 'priority') {
        filteredTasks.sort((a, b) => {
            const priorityDiff = (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
            if (priorityDiff !== 0) return priorityDiff;
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            const dateA = new Date(a.dueDate + (a.time ? `T${a.time}` : 'T00:00:00'));
            const dateB = new Date(b.dueDate + (b.time ? `T${b.time}` : 'T00:00:00'));
            return dateA - dateB;
        });
    } else if (currentSort === 'label') {
        filteredTasks.sort((a,b) => {
            const labelA = (a.label || '').toLowerCase();
            const labelB = (b.label || '').toLowerCase();
            if (labelA < labelB) return -1;
            if (labelA > labelB) return 1;
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            const dateA = new Date(a.dueDate + (a.time ? `T${a.time}` : 'T00:00:00'));
            const dateB = new Date(b.dueDate + (b.time ? `T${b.time}` : 'T00:00:00'));
            return dateA - dateB;
        });
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
            if (event.target.type === 'checkbox' || event.target.closest('.task-actions')) { return; }
            openViewTaskDetailsModal(task.id);
        });

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.className = 'form-checkbox h-5 w-5 text-sky-500 rounded border-slate-400 dark:border-slate-500 focus:ring-sky-400 dark:focus:ring-sky-500 mt-0.5 mr-2 sm:mr-3 cursor-pointer flex-shrink-0';
        checkbox.addEventListener('change', () => toggleComplete(task.id));

        const textDetailsDiv = document.createElement('div');
        textDetailsDiv.className = 'flex flex-col';

        const span = document.createElement('span');
        span.textContent = task.text;
        let textColorClass = task.completed ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200';
        span.className = `text-sm sm:text-base break-all ${textColorClass} ${task.completed ? 'completed-text' : ''}`;
        textDetailsDiv.appendChild(span);

        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'flex items-center flex-wrap gap-x-2 gap-y-1 mt-1 sm:mt-1.5 text-xs';
        if (task.priority) { const priorityBadge = document.createElement('span'); priorityBadge.textContent = task.priority; priorityBadge.className = `priority-badge ${getPriorityClass(task.priority)}`; detailsContainer.appendChild(priorityBadge); }
        if (task.label) { const labelBadge = document.createElement('span'); labelBadge.textContent = task.label; labelBadge.className = 'label-badge'; detailsContainer.appendChild(labelBadge); }
        if (task.dueDate) { const dueDateSpan = document.createElement('span'); dueDateSpan.className = 'text-slate-500 dark:text-slate-400 flex items-center'; let dateDisplay = formatDate(task.dueDate); if (task.time) { dateDisplay += ` ${formatTime(task.time)}`; } dueDateSpan.innerHTML = `<i class="far fa-calendar-alt mr-1"></i> ${dateDisplay}`; detailsContainer.appendChild(dueDateSpan); }
        // Optionally display estimated duration on task item - for now, keeping it in details view only
        // if (task.estimatedHours || task.estimatedMinutes) {
        // const estDurationSpan = document.createElement('span');
        // estDurationSpan.className = 'text-slate-500 dark:text-slate-400 flex items-center';
        // estDurationSpan.innerHTML = `<i class="far fa-clock mr-1"></i> ${formatDuration(task.estimatedHours, task.estimatedMinutes)}`;
        // detailsContainer.appendChild(estDurationSpan);
        // }
        if (detailsContainer.hasChildNodes()) { textDetailsDiv.appendChild(detailsContainer); }


        mainContentClickableArea.appendChild(checkbox);
        mainContentClickableArea.appendChild(textDetailsDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions flex-shrink-0 self-start';

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

    const patterns = [
        { regex: /\b(today)\b/i, handler: () => getTodayDateString() },
        { regex: /\b(tomorrow)\b/i, handler: () => { const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1); return tomorrow.toISOString().split('T')[0]; }},
        { regex: /\b(next week)\b/i, handler: () => { const nextWeek = new Date(today); nextWeek.setDate(today.getDate() - today.getDay() + 1 + 7); return nextWeek.toISOString().split('T')[0]; }},
        { regex: /\b(next month)\b/i, handler: () => { const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1); return nextMonth.toISOString().split('T')[0]; }},
        { regex: /\b(next year)\b/i, handler: () => { const nextYear = new Date(today.getFullYear() + 1, 0, 1); return nextYear.toISOString().split('T')[0]; }},
        { regex: new RegExp(`\\b(on\\s+)?(next\\s+)?(${daysOfWeek.join('|')}|${shortDaysOfWeek.join('|')})\\b`, 'i'),
            handler: (match) => {
                const dayName = match[3].toLowerCase();
                let targetDayIndex = daysOfWeek.indexOf(dayName);
                if (targetDayIndex === -1) targetDayIndex = shortDaysOfWeek.indexOf(dayName);
                if (targetDayIndex === -1) return null;

                const currentDayIndex = today.getDay();
                let daysToAdd = targetDayIndex - currentDayIndex;

                if (match[2] || daysToAdd < 0 || (daysToAdd === 0 && new Date().getHours() > 0 )) daysToAdd += 7;
                if (targetDayIndex === currentDayIndex && !match[2] && daysToAdd !== 7) daysToAdd = 0;

                const targetDate = new Date(today);
                targetDate.setDate(today.getDate() + daysToAdd);
                return targetDate.toISOString().split('T')[0];
            }
        },
        { regex: /(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/g, handler: (match) => match[0].replace(/\//g, '-') },
        { regex: /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/g, handler: (match) => {
            const parts = match[0].replace(/-/g, '/').split('/');
            const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
            const month = parts[0].padStart(2, '0');
            const day = parts[1].padStart(2, '0');
            return `${year}-${month}-${day}`;
        }}
    ];

    for (const pattern of patterns) {
        const match = pattern.regex.exec(remainingText);
        if (match) {
            const potentialDate = pattern.handler(match);
            if (potentialDate && !isNaN(new Date(potentialDate).getTime())) {
                parsedDate = potentialDate;
                const matchedString = match[0];
                remainingText = remainingText.replace(new RegExp(`\\b(for|on|by|due)?\\s*${matchedString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i'), '').replace(/\s\s+/g, ' ').trim();
                break;
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
    const estHours = parseInt(modalEstHoursAdd.value) || 0; // New
    const estMinutes = parseInt(modalEstMinutesAdd.value) || 0; // New
    const priority = modalPriorityInputAdd.value;
    const label = modalLabelInputAdd.value.trim();
    const notes = modalNotesInputAdd.value.trim();

    let isReminderSet = false;
    let reminderDate = null;
    let reminderTime = null;
    let reminderEmail = null;

    if (featureFlags.reminderFeature) {
        isReminderSet = modalRemindMeAdd.checked;
        reminderDate = modalReminderDateAdd.value;
        reminderTime = modalReminderTimeAdd.value;
        reminderEmail = modalReminderEmailAdd.value.trim();
        if (isReminderSet) {
            if (!reminderDate) { showMessage('Please select a reminder date.', 'error'); modalReminderDateAdd.focus(); return; }
            if (!reminderTime) { showMessage('Please select a reminder time.', 'error'); modalReminderTimeAdd.focus(); return; }
            if (!reminderEmail) { showMessage('Please enter an email for the reminder.', 'error'); modalReminderEmailAdd.focus(); return; }
            if (!/^\S+@\S+\.\S+$/.test(reminderEmail)) { showMessage('Please enter a valid email address.', 'error'); modalReminderEmailAdd.focus(); return; }
        }
    }

    if (rawTaskText === '') { showMessage('Task description cannot be empty!', 'error'); modalTaskInputAdd.focus(); return; }

    let finalDueDate = null;
    let finalTaskText = rawTaskText;
    if (!explicitDueDate) {
        const { parsedDate: dateFromDescription, remainingText: textAfterDateRemoval } = parseDateFromText(rawTaskText);
        if (dateFromDescription) {
            finalDueDate = dateFromDescription;
            finalTaskText = textAfterDateRemoval || rawTaskText;
        }
    } else {
        finalDueDate = explicitDueDate;
    }
    const newTask = {
        id: Date.now(), text: finalTaskText, completed: false,
        dueDate: finalDueDate, time: time || null,
        estimatedHours: estHours, estimatedMinutes: estMinutes, // New
        priority: priority, label: label || '', notes: notes || '',
        isReminderSet: featureFlags.reminderFeature ? isReminderSet : false,
        reminderDate: featureFlags.reminderFeature && isReminderSet ? reminderDate : null,
        reminderTime: featureFlags.reminderFeature && isReminderSet ? reminderTime : null,
        reminderEmail: featureFlags.reminderFeature && isReminderSet ? reminderEmail : null
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
    const estHours = parseInt(modalEstHoursViewEdit.value) || 0; // New
    const estMinutes = parseInt(modalEstMinutesViewEdit.value) || 0; // New
    const priority = modalPriorityInputViewEdit.value;
    const label = modalLabelInputViewEdit.value.trim();
    const notes = modalNotesInputViewEdit.value.trim();

    let isReminderSet = false;
    let reminderDate = null;
    let reminderTime = null;
    let reminderEmail = null;

    if (featureFlags.reminderFeature) {
        isReminderSet = modalRemindMeViewEdit.checked;
        reminderDate = modalReminderDateViewEdit.value;
        reminderTime = modalReminderTimeViewEdit.value;
        reminderEmail = modalReminderEmailViewEdit.value.trim();
            if (isReminderSet) {
            if (!reminderDate) { showMessage('Please select a reminder date.', 'error'); modalReminderDateViewEdit.focus(); return; }
            if (!reminderTime) { showMessage('Please select a reminder time.', 'error'); modalReminderTimeViewEdit.focus(); return; }
            if (!reminderEmail) { showMessage('Please enter an email for the reminder.', 'error'); modalReminderEmailViewEdit.focus(); return; }
            if (!/^\S+@\S+\.\S+$/.test(reminderEmail)) { showMessage('Please enter a valid email address.', 'error'); modalReminderEmailViewEdit.focus(); return; }
        }
    }

    if (taskText === '') { showMessage('Task description cannot be empty!', 'error'); modalTaskInputViewEdit.focus(); return; }

    tasks = tasks.map(task => task.id === taskId ? {
        ...task, text: taskText, dueDate: dueDate || null, time: time || null,
        estimatedHours: estHours, estimatedMinutes: estMinutes, // New
        priority: priority, label: label || '', notes: notes || '',
        isReminderSet: featureFlags.reminderFeature ? isReminderSet : false,
        reminderDate: featureFlags.reminderFeature && isReminderSet ? reminderDate : null,
        reminderTime: featureFlags.reminderFeature && isReminderSet ? reminderTime : null,
        reminderEmail: featureFlags.reminderFeature && isReminderSet ? reminderEmail : null
    } : task );
    saveTasks();
    renderTasks();
    closeViewEditModal();
    showMessage('Task updated successfully!', 'success');
}

function toggleComplete(taskId) { tasks = tasks.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task); saveTasks(); renderTasks(); }
function deleteTask(taskId) { tasks = tasks.filter(task => task.id !== taskId); saveTasks(); renderTasks(); showMessage('Task deleted.', 'error'); }
function setFilter(filter) { currentFilter = filter; currentSort = 'default'; updateSortButtonStates(); smartViewButtons.forEach(button => { const isActive = button.dataset.filter === filter; button.setAttribute('data-active', isActive.toString()); const baseInactive = ['bg-slate-200', 'text-slate-700', 'hover:bg-slate-300', 'dark:bg-slate-700', 'dark:text-slate-300', 'dark:hover:bg-slate-600']; const iconInactive = ['text-slate-500', 'dark:text-slate-400']; const active = ['bg-sky-500', 'text-white', 'font-semibold']; const iconActive = ['text-sky-100']; button.classList.remove(...baseInactive, ...active); button.querySelector('i')?.classList.remove(...iconInactive, ...iconActive); if (isActive) { button.classList.add(...active); button.querySelector('i')?.classList.add(...iconActive); } else { button.classList.add(...baseInactive); button.querySelector('i')?.classList.add(...iconInactive); } }); renderTasks(); }

function updateClearCompletedButtonState() {
    const hasCompleted = tasks.some(task => task.completed);
    settingsClearCompletedBtn.disabled = !hasCompleted;
    if (hasCompleted) {
        settingsClearCompletedBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-slate-100', 'text-slate-400', 'dark:bg-slate-700', 'dark:text-slate-500');
        settingsClearCompletedBtn.classList.add('bg-red-50', 'hover:bg-red-100', 'text-red-700', 'dark:bg-red-900/50', 'dark:hover:bg-red-800/70', 'dark:text-red-300');
    } else {
        settingsClearCompletedBtn.classList.add('opacity-50', 'cursor-not-allowed');
            settingsClearCompletedBtn.classList.remove('bg-red-50', 'hover:bg-red-100', 'text-red-700', 'dark:bg-red-900/50', 'dark:hover:bg-red-800/70', 'dark:text-red-300');
            settingsClearCompletedBtn.classList.add('bg-slate-100', 'text-slate-400', 'dark:bg-slate-700', 'dark:text-slate-500');
    }
}

function clearCompletedTasks() { const completedCount = tasks.filter(task => task.completed).length; if (completedCount === 0) { showMessage('No completed tasks to clear.', 'error'); return; } tasks = tasks.filter(task => !task.completed); saveTasks(); renderTasks(); showMessage(`${completedCount} completed task(s) cleared.`, 'success'); closeSettingsModal(); }
function updateSortButtonStates() { sortByDueDateBtn.classList.toggle('sort-btn-active', currentSort === 'dueDate'); sortByPriorityBtn.classList.toggle('sort-btn-active', currentSort === 'priority'); sortByLabelBtn.classList.toggle('sort-btn-active', currentSort === 'label'); }

// --- Event Listeners ---
openAddModalButton.addEventListener('click', openAddModal);
closeAddModalBtn.addEventListener('click', closeAddModal);
cancelAddModalBtn.addEventListener('click', closeAddModal);
modalTodoFormAdd.addEventListener('submit', handleAddTask);
addTaskModal.addEventListener('click', (event) => { if (event.target === addTaskModal) closeAddModal(); });

if (modalRemindMeAdd) {
    modalRemindMeAdd.addEventListener('change', () => {
        if(featureFlags.reminderFeature) {
            reminderOptionsAdd.classList.toggle('hidden', !modalRemindMeAdd.checked);
            if (modalRemindMeAdd.checked) {
                if (modalDueDateInputAdd.value && !modalReminderDateAdd.value) modalReminderDateAdd.value = modalDueDateInputAdd.value;
                if (modalTimeInputAdd.value && !modalReminderTimeAdd.value) modalReminderTimeAdd.value = modalTimeInputAdd.value;
                const today = new Date();
                modalReminderDateAdd.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            }
        } else {
            reminderOptionsAdd.classList.add('hidden');
        }
    });
}
if (modalRemindMeViewEdit) {
    modalRemindMeViewEdit.addEventListener('change', () => {
        if(featureFlags.reminderFeature) {
            reminderOptionsViewEdit.classList.toggle('hidden', !modalRemindMeViewEdit.checked);
            if (modalRemindMeViewEdit.checked) {
                const today = new Date();
                modalReminderDateViewEdit.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            }
        } else {
            reminderOptionsViewEdit.classList.add('hidden');
        }
    });
}
closeViewEditModalBtn.addEventListener('click', closeViewEditModal);
cancelViewEditModalBtn.addEventListener('click', closeViewEditModal);
modalTodoFormViewEdit.addEventListener('submit', handleEditTask);
viewEditTaskModal.addEventListener('click', (event) => { if (event.target === viewEditTaskModal) closeViewEditModal(); });
closeViewDetailsModalBtn.addEventListener('click', closeViewTaskDetailsModal);
closeViewDetailsSecondaryBtn.addEventListener('click', closeViewTaskDetailsModal);
editFromViewModalBtn.addEventListener('click', () => { if (currentViewTaskId !== null) { closeViewTaskDetailsModal(); openViewEditModal(currentViewTaskId); } });
viewTaskDetailsModal.addEventListener('click', (event) => { if (event.target === viewTaskDetailsModal) closeViewTaskDetailsModal(); });
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
if (settingsManageRemindersBtn) { settingsManageRemindersBtn.addEventListener('click', () => { if(featureFlags.reminderFeature) showMessage('Reminders feature coming soon!', 'success'); }); }

if (settingsFeatureFlagsBtn) { settingsFeatureFlagsBtn.addEventListener('click', () => { closeSettingsModal(); openFeatureFlagsModal(); }); }
if (closeFeatureFlagsModalBtn) closeFeatureFlagsModalBtn.addEventListener('click', closeFeatureFlagsModal);
if (closeFeatureFlagsSecondaryBtn) closeFeatureFlagsSecondaryBtn.addEventListener('click', closeFeatureFlagsModal);
if (featureFlagsModal) featureFlagsModal.addEventListener('click', (event) => { if (event.target === featureFlagsModal) closeFeatureFlagsModal(); });
if (testFeatureButton) { testFeatureButton.addEventListener('click', () => { console.log('Test Button Clicked!'); showMessage('Test Button Clicked! Check console.', 'success'); }); }

smartViewButtons.forEach(button => button.addEventListener('click', () => setFilter(button.dataset.filter)));
if (taskSearchInput) { taskSearchInput.addEventListener('input', (event) => { currentSearchTerm = event.target.value.trim().toLowerCase(); renderTasks(); }); }
if (sidebarToggleBtn) { sidebarToggleBtn.addEventListener('click', () => { const isCurrentlyMinimized = taskSidebar.classList.contains('sidebar-minimized'); setSidebarMinimized(!isCurrentlyMinimized); }); }
sortByDueDateBtn.addEventListener('click', () => { currentSort = currentSort === 'dueDate' ? 'default' : 'dueDate'; updateSortButtonStates(); renderTasks(); });
sortByPriorityBtn.addEventListener('click', () => { currentSort = currentSort === 'priority' ? 'default' : 'priority'; updateSortButtonStates(); renderTasks(); });
sortByLabelBtn.addEventListener('click', () => { currentSort = currentSort === 'label' ? 'default' : 'label'; updateSortButtonStates(); renderTasks(); });

document.addEventListener('keydown', (event) => {
    const isAddModalOpen = !addTaskModal.classList.contains('hidden');
    const isViewEditModalOpen = !viewEditTaskModal.classList.contains('hidden');
    const isViewDetailsModalOpen = !viewTaskDetailsModal.classList.contains('hidden');
    const isManageLabelsModalOpen = manageLabelsModal && !manageLabelsModal.classList.contains('hidden');
    const isSettingsModalOpen = settingsModal && !settingsModal.classList.contains('hidden');
    const isFeatureFlagsModalOpen = featureFlagsModal && !featureFlagsModal.classList.contains('hidden');
    const isAnyModalOpen = isAddModalOpen || isViewEditModalOpen || isViewDetailsModalOpen || isManageLabelsModalOpen || isSettingsModalOpen || isFeatureFlagsModalOpen;
    const isInputFocused = document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT' || document.activeElement.tagName === 'TEXTAREA';

    if ((event.key === '+' || event.key === '=') && !isAnyModalOpen && !isInputFocused) { event.preventDefault(); openAddModal(); }
    if (event.key === 'Escape') {
        if (isAddModalOpen) closeAddModal();
        if (isViewEditModalOpen) closeViewEditModal();
        if (isViewDetailsModalOpen) closeViewTaskDetailsModal();
        if (isManageLabelsModalOpen) closeManageLabelsModal();
        if (isSettingsModalOpen) closeSettingsModal();
        if (isFeatureFlagsModalOpen) closeFeatureFlagsModal();
    }
});

// --- Initial Setup ---
loadFeatureFlags();
updateUniqueLabels();
smartViewButtons.forEach(button => { button.classList.add('bg-slate-200', 'text-slate-700', 'hover:bg-slate-300', 'dark:bg-slate-700', 'dark:text-slate-300', 'dark:hover:bg-slate-600'); button.querySelector('i')?.classList.add('text-slate-500', 'dark:text-slate-400'); });

const savedSidebarState = localStorage.getItem('sidebarState');
if (savedSidebarState === 'minimized') {
    setSidebarMinimized(true);
} else {
    setSidebarMinimized(false);
}

setFilter(currentFilter);
window.onload = () => {
    loadFeatureFlags();
    applyActiveFeatures();
    setFilter(currentFilter);
    if (localStorage.getItem('sidebarState') === 'minimized') {
        setSidebarMinimized(true);
    } else {
        setSidebarMinimized(false);
    }
    updateSortButtonStates();
    updateClearCompletedButtonState();
};
