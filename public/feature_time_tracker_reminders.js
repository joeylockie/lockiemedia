// public/feature_time_tracker_reminders.js (DEBUGGING VERSION)

import LoggingService from './loggingService.js';
import AppStore from './store.js';
import TimeTrackerService from './timeTrackerService.js';
import NotificationService from './notificationService.js';

// --- DOM Element References ---
let modalEl, dialogEl, closeBtn, doneBtn, manageRemindersBtn,
    enableAllToggle, settingsContainer,
    noTimerToggle, noTimerTimeInput,
    longTimerToggle, longTimerMinutesInput;

// --- Internal State & Constants ---
let _checkInterval = null;
const CHECK_INTERVAL_MS = 60 * 1000; // Check every minute
const defaultSettings = {
    enabled: false,
    noTimerReminder: {
        enabled: false,
        time: '09:00', // Default to 9:00 AM
    },
    longTimerReminder: {
        enabled: false,
        minutes: 120, // Default to 2 hours
    },
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
        currentSettings = {
            ...defaultSettings,
            ...prefs.timeTrackerReminders,
            noTimerReminder: { ...defaultSettings.noTimerReminder, ...prefs.timeTrackerReminders.noTimerReminder },
            longTimerReminder: { ...defaultSettings.longTimerReminder, ...prefs.timeTrackerReminders.longTimerReminder }
        };
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
    LoggingService.info('[TimeReminderFeature] Settings saved.', { functionName, saved: currentSettings });
}

function _updateSettingsUI() {
    if (!modalEl) return;
    enableAllToggle.checked = currentSettings.enabled;
    noTimerToggle.checked = currentSettings.noTimerReminder.enabled;
    noTimerTimeInput.value = currentSettings.noTimerReminder.time;
    longTimerToggle.checked = currentSettings.longTimerReminder.enabled;
    longTimerMinutesInput.value = currentSettings.longTimerReminder.minutes;
    const isMasterEnabled = currentSettings.enabled;
    settingsContainer.style.opacity = isMasterEnabled ? '1' : '0.5';
    settingsContainer.style.pointerEvents = isMasterEnabled ? 'auto' : 'none';
}

function _runChecks() {
    const functionName = '_runChecks (TimeReminderFeature)';
    if (!currentSettings.enabled || !NotificationService.isSupported() || NotificationService.getPermissionStatus() !== 'granted') {
        return;
    }
    const now = new Date();
    const activeTimer = TimeTrackerService.getActiveTimer();
    const todayStr = now.toISOString().split('T')[0];
    if (currentSettings.noTimerReminder.enabled && !activeTimer) {
        const reminderTime = currentSettings.noTimerReminder.time;
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const notifiedKey = `notified_start_timer_${todayStr}`;
        if (currentTime === reminderTime && !localStorage.getItem(notifiedKey)) {
            LoggingService.info('[TimeReminderFeature] Firing "start timer" notification.', { functionName });
            NotificationService.showNotification('Time to Get Tracking!', {
                body: `It's ${reminderTime}. Don't forget to start a timer for your work!`,
                icon: './icon-32x32.png'
            });
            localStorage.setItem(notifiedKey, 'true');
        }
    }
    if (currentSettings.longTimerReminder.enabled && activeTimer) {
        const durationMinutes = (now.getTime() - new Date(activeTimer.startTime).getTime()) / 60000;
        const reminderMinutes = currentSettings.longTimerReminder.minutes;
        const notifiedKey = `notified_long_timer_${activeTimer.startTime}`;
        if (durationMinutes >= reminderMinutes && !localStorage.getItem(notifiedKey)) {
            const activity = TimeTrackerService.getActivities().find(a => a.id === activeTimer.activityId);
            const activityName = activity ? activity.name : 'your current task';
            LoggingService.info(`[TimeReminderFeature] Firing "long-running timer" notification for ${activityName}.`, { functionName });
            NotificationService.showNotification('Still Working On This?', {
                body: `Your timer for "${activityName}" has been running for over ${reminderMinutes} minutes. Time for a break?`,
                icon: './icon-32x32.png',
                tag: `long_timer_${activeTimer.startTime}`
            });
            localStorage.setItem(notifiedKey, 'true');
        }
    }
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
    } else {
         LoggingService.info('[TimeReminderFeature] Reminder checks are disabled or permissions not granted.', { 
             functionName: '_manageReminderChecks', 
             settingsEnabled: currentSettings.enabled,
             permission: NotificationService.getPermissionStatus() 
        });
    }
}

// --- Modal Management ---

function openReminderSettingsModal() {
    const functionName = 'openReminderSettingsModal (DEBUG)';
    LoggingService.info(`[DEBUG] 1. Entered ${functionName}.`);
    
    if (!modalEl) LoggingService.error(`[DEBUG] 2. FAILED: modalEl is null or undefined.`);
    else LoggingService.info(`[DEBUG] 2. SUCCESS: modalEl found.`);
    
    if (!dialogEl) LoggingService.error(`[DEBUG] 3. FAILED: dialogEl is null or undefined.`);
    else LoggingService.info(`[DEBUG] 3. SUCCESS: dialogEl found.`);

    if (!modalEl || !dialogEl) {
        LoggingService.error(`[DEBUG] 4. Aborting modal open because a key element is missing.`);
        return;
    }

    LoggingService.info(`[DEBUG] 5. Calling _loadSettings() and _updateSettingsUI().`);
    _loadSettings();
    _updateSettingsUI();

    LoggingService.info(`[DEBUG] 6. Removing 'hidden' class from modalEl.`);
    modalEl.classList.remove('hidden');

    requestAnimationFrame(() => {
        LoggingService.info(`[DEBUG] 7. In requestAnimationFrame. Removing animation classes.`);
        modalEl.classList.remove('opacity-0');
        dialogEl.classList.remove('scale-95', 'opacity-0');
        LoggingService.info(`[DEBUG] 8. Modal should now be visible.`);
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


function initialize() {
    const functionName = 'initialize (TimeReminderFeature)';
    LoggingService.info(`[DEBUG] Initializing ${functionName}...`);
    
    if (!document.getElementById('timeTrackerHeader')) {
        LoggingService.debug('[TimeReminderFeature] Not on time-tracker page. Skipping initialization.', { functionName });
        return;
    }

    modalEl = document.getElementById('timeReminderSettingsModal');
    dialogEl = document.getElementById('timeReminderSettingsDialog');
    closeBtn = document.getElementById('closeTimeReminderSettingsModalBtn');
    doneBtn = document.getElementById('timeReminderSettingsDoneBtn');
    manageRemindersBtn = document.getElementById('manageRemindersBtn');
    enableAllToggle = document.getElementById('enableAllRemindersToggle');
    settingsContainer = document.getElementById('reminderSettingsContainer');
    noTimerToggle = document.getElementById('noTimerReminderToggle');
    noTimerTimeInput = document.getElementById('noTimerReminderTime');
    longTimerToggle = document.getElementById('longTimerReminderToggle');
    longTimerMinutesInput = document.getElementById('longTimerReminderMinutes');

    if (!manageRemindersBtn) {
        LoggingService.error(`[DEBUG] CRITICAL FAILURE in ${functionName}: 'Manage Reminders' button not found! Cannot attach listener.`, null, {functionName});
        return;
    }
    LoggingService.info(`[DEBUG] 'Manage Reminders' button was found. Attaching click listener...`);

    manageRemindersBtn.addEventListener('click', openReminderSettingsModal);
    closeBtn.addEventListener('click', closeReminderSettingsModal);
    doneBtn.addEventListener('click', closeReminderSettingsModal);

    const inputs = [enableAllToggle, noTimerToggle, noTimerTimeInput, longTimerToggle, longTimerMinutesInput];
    inputs.forEach(input => {
        if(input) {
            input.addEventListener('change', async () => {
                if (enableAllToggle.checked && NotificationService.getPermissionStatus() === 'default') {
                    await NotificationService.requestPermission();
                }
                currentSettings.enabled = enableAllToggle.checked;
                currentSettings.noTimerReminder.enabled = noTimerToggle.checked;
                currentSettings.noTimerReminder.time = noTimerTimeInput.value;
                currentSettings.longTimerReminder.enabled = longTimerToggle.checked;
                currentSettings.longTimerReminder.minutes = parseInt(longTimerMinutesInput.value, 10) || 60;
                _updateSettingsUI();
                await _saveSettings();
                _manageReminderChecks();
            });
        }
    });

    _loadSettings();
    _manageReminderChecks();
    LoggingService.info(`[DEBUG] Finished ${functionName}.`);
}

export const TimeTrackerRemindersFeature = {
    initialize
};