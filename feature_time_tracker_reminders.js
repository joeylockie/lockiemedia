// public/feature_time_tracker_reminders.js (DEBUGGING VERSION)

import LoggingService from './loggingService.js';
import AppStore from './store.js';
import TimeTrackerService from './timeTrackerService.js';
import NotificationService from './notificationService.js';
import { formatTime } from './utils.js';

// --- DOM Element References ---
let modalEl, dialogEl, closeBtn, doneBtn, manageRemindersBtn,
    remindersListContainerEl, addReminderBtnEl, testReminderBtnEl, enableAllToggle;

// --- NEW: Editor Modal DOM References ---
let editorModalEl, editorDialogEl, editorTitleEl, editorFormEl, editingReminderIdInput,
    reminderTypeSelect, cancelReminderEditBtn, reminderMessageInput, reminderDaysContainer;

// --- Internal State & Constants ---
let _checkInterval = null;
const CHECK_INTERVAL_MS = 60 * 1000;
const defaultSettings = {
    enabled: false,
    reminders: [
        {
            id: 'rem_default_1',
            type: 'no_timer_running',
            time: '09:30',
            days: ['mon', 'tue', 'wed', 'thu', 'fri'],
            message: 'Time to start the day! Don\'t forget to track your time.',
            enabled: true
        },
        {
            id: 'rem_default_2',
            type: 'long_timer',
            duration: 120,
            days: [],
            message: 'Your timer has been running for over 2 hours. Time for a break?',
            enabled: true
        }
    ]
};
let currentSettings = { ...defaultSettings };

// --- Private Helper Functions ---

function _loadSettings() {
    const functionName = '_loadSettings (TimeReminderFeature)';
    if (!AppStore || typeof AppStore.getUserPreferences !== 'function') {
        LoggingService.warn('[TimeReminderFeature] AppStore not available. Using default settings.', { functionName });
        currentSettings = { ...defaultSettings };
        return;
    }
    const prefs = AppStore.getUserPreferences();
    if (prefs && prefs.timeTrackerReminders) {
        if (prefs.timeTrackerReminders.noTimerReminder || prefs.timeTrackerReminders.longTimerReminder) {
             LoggingService.info('[TimeReminderFeature] Old settings format detected. Migrating to new structure.', { functionName });
             currentSettings = { ...defaultSettings };
        } else {
             currentSettings = {
                ...defaultSettings,
                ...prefs.timeTrackerReminders,
                reminders: prefs.timeTrackerReminders.reminders || []
            };
        }
        LoggingService.info('[TimeReminderFeature] Loaded settings from AppStore.', { functionName, loaded: currentSettings });
    } else {
        currentSettings = { ...defaultSettings };
        LoggingService.info('[TimeReminderFeature] No settings in AppStore. Using defaults.', { functionName });
    }
}

async function _saveSettings() {
    const functionName = '_saveSettings (TimeReminderFeature)';
    if (!AppStore || typeof AppStore.setUserPreferences !== 'function') {
        LoggingService.error('[TimeReminderFeature] AppStore not available. Cannot save settings.', null, { functionName });
        return;
    }
    await AppStore.setUserPreferences({ timeTrackerReminders: currentSettings }, functionName);
    _renderReminderList();
    LoggingService.info('[TimeReminderFeature] Settings saved & UI refreshed.', { functionName, saved: currentSettings });
}

function _renderReminderList() {
    if (!remindersListContainerEl) return;

    remindersListContainerEl.innerHTML = '';

    if (!currentSettings.reminders || currentSettings.reminders.length === 0) {
        remindersListContainerEl.innerHTML = `<p class="text-center text-slate-400 p-4">No custom reminders yet. Click "Add New Reminder" to create one.</p>`;
        return;
    }

    currentSettings.reminders.forEach(reminder => {
        const item = document.createElement('div');
        item.className = 'p-3 rounded-lg bg-slate-900/50 flex flex-col sm:flex-row justify-between sm:items-center gap-3';

        let title = 'Custom Reminder';
        let description = 'A custom reminder.';
        const days = reminder.days && reminder.days.length > 0 ? reminder.days.join(', ').toUpperCase() : 'Every day';

        if (reminder.type === 'no_timer_running') {
            title = 'Start Timer Reminder';
            description = `At ${formatTime(reminder.time)}. Active on: ${days}.`;
        } else if (reminder.type === 'long_timer') {
            title = 'Long-Running Timer';
            description = `After ${reminder.duration} minutes. Active on: ${days}.`;
        }

        item.innerHTML = `
            <div class="flex-grow">
                <p class="font-medium text-slate-200">${title}</p>
                <p class="text-xs text-slate-400">${description}</p>
            </div>
            <div class="flex items-center gap-4 flex-shrink-0">
                <input type="checkbox" data-reminder-id="${reminder.id}" class="toggle-checkbox reminder-toggle" ${reminder.enabled ? 'checked' : ''} />
                <label for="toggle-${reminder.id}" class="toggle-label"></label>
                <button title="Edit Reminder" data-reminder-id="${reminder.id}" class="edit-reminder-btn text-slate-400 hover:text-sky-400 transition-colors"><i class="fas fa-pencil-alt"></i></button>
                <button title="Delete Reminder" data-reminder-id="${reminder.id}" class="delete-reminder-btn text-slate-400 hover:text-red-500 transition-colors"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;

        const toggle = item.querySelector('.reminder-toggle');
        toggle.id = `toggle-${reminder.id}`;
        toggle.nextElementSibling.setAttribute('for', toggle.id);
        toggle.addEventListener('change', (e) => {
            _updateReminder(reminder.id, { enabled: e.target.checked });
        });
        
        const deleteBtn = item.querySelector('.delete-reminder-btn');
        deleteBtn.addEventListener('click', () => {
             if (confirm('Are you sure you want to delete this reminder?')) {
                _deleteReminder(reminder.id);
            }
        });

        const editBtn = item.querySelector('.edit-reminder-btn');
        editBtn.addEventListener('click', () => _openReminderEditorModal(reminder.id));

        remindersListContainerEl.appendChild(item);
    });
}

function _addReminder(reminderData) {
    const newReminder = {
        id: `rem_${Date.now()}`,
        enabled: true,
        ...reminderData,
    };
    currentSettings.reminders.push(newReminder);
    _saveSettings();
}

function _updateReminder(reminderId, updateData) {
    const reminderIndex = currentSettings.reminders.findIndex(r => r.id === reminderId);
    if (reminderIndex > -1) {
        currentSettings.reminders[reminderIndex] = { ...currentSettings.reminders[reminderIndex], ...updateData };
        _saveSettings();
    }
}

function _deleteReminder(reminderId) {
    currentSettings.reminders = currentSettings.reminders.filter(r => r.id !== reminderId);
    _saveSettings();
}

function _fireTestReminder() {
    const functionName = '_fireTestReminder (TimeReminderFeature)';
    LoggingService.info('[TimeReminderFeature] Firing test reminder.', { functionName });
    NotificationService.showNotification('Test Reminder', {
        body: 'This is a test notification from the Time Tracker.',
        icon: './icon-32x32.png'
    });
    alert('Test notification has been sent! Check your system notifications.');
}

function _runChecks() {
    const functionName = '_runChecks (TimeReminderFeature)';
    if (!currentSettings.enabled || !NotificationService.isSupported() || NotificationService.getPermissionStatus() !== 'granted') {
        return;
    }
    
    const now = new Date();
    const activeTimer = TimeTrackerService.getActiveTimer();
    const todayStr = now.toISOString().split('T')[0];
    const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][now.getDay()];

    (currentSettings.reminders || []).forEach(reminder => {
        if (!reminder.enabled || (reminder.days && reminder.days.length > 0 && !reminder.days.includes(dayOfWeek))) {
            return;
        }

        const notifiedKey = `notified_${reminder.id}_${todayStr}`;

        switch (reminder.type) {
            case 'no_timer_running':
                if (!activeTimer) {
                    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                    if (currentTime === reminder.time && !localStorage.getItem(notifiedKey)) {
                        LoggingService.info(`[TimeReminderFeature] Firing "${reminder.type}" notification.`, { functionName, reminderId: reminder.id });
                        NotificationService.showNotification('Time to Get Tracking!', {
                            body: reminder.message || `It's ${formatTime(reminder.time)}. Don't forget to start a timer!`,
                            icon: './icon-32x32.png'
                        });
                        localStorage.setItem(notifiedKey, 'true');
                    }
                }
                break;

            case 'long_timer':
                if (activeTimer) {
                    const durationMinutes = (now.getTime() - new Date(activeTimer.startTime).getTime()) / 60000;
                    const reminderMinutes = reminder.duration || 120;
                    const longTimerNotifiedKey = `notified_${reminder.id}_${activeTimer.startTime}`;

                    if (durationMinutes >= reminderMinutes && !localStorage.getItem(longTimerNotifiedKey)) {
                        const activity = TimeTrackerService.getActivities().find(a => a.id === activeTimer.activityId);
                        const activityName = activity ? activity.name : 'your current task';
                        LoggingService.info(`[TimeReminderFeature] Firing "${reminder.type}" notification for ${activityName}.`, { functionName, reminderId: reminder.id });
                        NotificationService.showNotification('Still Working On This?', {
                            body: reminder.message || `Your timer for "${activityName}" has been running for over ${reminderMinutes} minutes.`,
                            icon: './icon-32x32.png',
                            tag: `long_timer_${activeTimer.startTime}`
                        });
                        localStorage.setItem(longTimerNotifiedKey, 'true');
                    }
                }
                break;
        }
    });
}

function _manageReminderChecks() {
    if (_checkInterval) {
        clearInterval(_checkInterval);
        _checkInterval = null;
    }
    if (currentSettings.enabled && NotificationService.isSupported() && NotificationService.getPermissionStatus() === 'granted') {
        _checkInterval = setInterval(_runChecks, CHECK_INTERVAL_MS);
        LoggingService.info('[TimeReminderFeature] Reminder check interval started.', { functionName: '_manageReminderChecks' });
        _runChecks();
    }
}

function openReminderSettingsModal() {
    if (!modalEl || !dialogEl) {
        LoggingService.error(`[TimeReminderFeature] Aborting modal open because a key element is missing.`);
        return;
    }
    _loadSettings();
    if (enableAllToggle) enableAllToggle.checked = currentSettings.enabled;
    _renderReminderList();
    modalEl.classList.remove('hidden');
    requestAnimationFrame(() => {
        modalEl.classList.remove('opacity-0');
        dialogEl.classList.remove('scale-95', 'opacity-0');
    });
}

function closeReminderSettingsModal() {
    if (!modalEl || !dialogEl) return;
    modalEl.classList.add('opacity-0');
    dialogEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modalEl.classList.add('hidden');
    }, 300);
}


// --- NEW: Reminder Editor Modal Logic ---

function _updateEditorOptionsVisibility() {
    const selectedType = reminderTypeSelect.value;
    document.querySelectorAll('.reminder-options-container').forEach(container => {
        container.classList.toggle('hidden', container.id !== `options_${selectedType}`);
    });
}

function _openReminderEditorModal(reminderId = null) {
    editorFormEl.reset();
    if (reminderId) {
        const reminder = currentSettings.reminders.find(r => r.id === reminderId);
        if (!reminder) return;
        editorTitleEl.textContent = 'Edit Reminder';
        editingReminderIdInput.value = reminder.id;
        reminderTypeSelect.value = reminder.type;
        reminderMessageInput.value = reminder.message || '';
        document.getElementById('reminderTimeInput').value = reminder.time || '09:00';
        document.getElementById('reminderDurationInput').value = reminder.duration || 60;
        
        const dayCheckboxes = reminderDaysContainer.querySelectorAll('input[type="checkbox"]');
        dayCheckboxes.forEach(cb => {
            cb.checked = reminder.days && reminder.days.includes(cb.value);
        });

    } else {
        editorTitleEl.textContent = 'Add New Reminder';
        editingReminderIdInput.value = '';
    }

    _updateEditorOptionsVisibility();
    editorModalEl.classList.remove('hidden');
    requestAnimationFrame(() => {
        editorModalEl.classList.remove('opacity-0');
        editorDialogEl.classList.remove('scale-95', 'opacity-0');
    });
}

function _closeReminderEditorModal() {
    if (!editorModalEl) return;
    editorModalEl.classList.add('opacity-0');
    editorDialogEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        editorModalEl.classList.add('hidden');
    }, 300);
}

function _handleReminderFormSubmit(event) {
    event.preventDefault();
    const id = editingReminderIdInput.value;
    const type = reminderTypeSelect.value;
    const selectedDays = Array.from(reminderDaysContainer.querySelectorAll('input:checked')).map(cb => cb.value);

    const reminderData = {
        type: type,
        message: reminderMessageInput.value.trim(),
        days: selectedDays
    };

    if (type === 'no_timer_running') {
        reminderData.time = document.getElementById('reminderTimeInput').value;
    } else if (type === 'long_timer') {
        reminderData.duration = parseInt(document.getElementById('reminderDurationInput').value) || 60;
    }

    if (id) {
        _updateReminder(id, reminderData);
    } else {
        _addReminder(reminderData);
    }
    _closeReminderEditorModal();
}

function initialize() {
    const functionName = 'initialize (TimeReminderFeature)';
    if (!document.getElementById('timeTrackerHeader')) {
        LoggingService.debug('[TimeReminderFeature] Not on time-tracker page. Skipping initialization.', { functionName });
        return;
    }

    // Main modal
    modalEl = document.getElementById('timeReminderSettingsModal');
    dialogEl = document.getElementById('timeReminderSettingsDialog');
    closeBtn = document.getElementById('closeTimeReminderSettingsModalBtn');
    doneBtn = document.getElementById('timeReminderSettingsDoneBtn');
    manageRemindersBtn = document.getElementById('manageRemindersBtn');
    enableAllToggle = document.getElementById('enableAllRemindersToggle');
    remindersListContainerEl = document.getElementById('remindersListContainer');
    addReminderBtnEl = document.getElementById('addReminderBtn');
    testReminderBtnEl = document.getElementById('testReminderBtn');

    // Editor modal
    editorModalEl = document.getElementById('reminderEditorModal');
    editorDialogEl = document.getElementById('reminderEditorDialog');
    editorTitleEl = document.getElementById('reminderEditorTitle');
    editorFormEl = document.getElementById('reminderEditorForm');
    editingReminderIdInput = document.getElementById('editingReminderId');
    reminderTypeSelect = document.getElementById('reminderTypeSelect');
    cancelReminderEditBtn = document.getElementById('cancelReminderEditBtn');
    reminderMessageInput = document.getElementById('reminderMessageInput');
    reminderDaysContainer = document.getElementById('reminderDaysContainer');
    
    if (!manageRemindersBtn) {
        LoggingService.error(`[TimeReminderFeature] 'Manage Reminders' button not found! Cannot attach listener.`, null, {functionName});
        return;
    }

    // Main modal listeners
    manageRemindersBtn.addEventListener('click', openReminderSettingsModal);
    if(closeBtn) closeBtn.addEventListener('click', closeReminderSettingsModal);
    if(doneBtn) doneBtn.addEventListener('click', closeReminderSettingsModal);
    if(testReminderBtnEl) testReminderBtnEl.addEventListener('click', _fireTestReminder);
    if(addReminderBtnEl) addReminderBtnEl.addEventListener('click', () => _openReminderEditorModal());

    if (enableAllToggle) {
        enableAllToggle.addEventListener('change', async (e) => {
             if (e.target.checked && NotificationService.getPermissionStatus() === 'default') {
                    await NotificationService.requestPermission();
                }
            currentSettings.enabled = e.target.checked;
            await _saveSettings();
            _manageReminderChecks();
        });
    }

    // Editor modal listeners
    if (editorFormEl) editorFormEl.addEventListener('submit', _handleReminderFormSubmit);
    if (cancelReminderEditBtn) cancelReminderEditBtn.addEventListener('click', _closeReminderEditorModal);
    if (reminderTypeSelect) reminderTypeSelect.addEventListener('change', _updateEditorOptionsVisibility);

    _loadSettings();
    _manageReminderChecks();
    LoggingService.info(`[TimeReminderFeature] Initialization complete.`);
}

export const TimeTrackerRemindersFeature = {
    initialize
};