// feature_desktop_notifications.js
// Manages the Desktop Notifications Feature, including settings and triggering notifications.

import { isFeatureEnabled } from './featureFlagService.js';
import NotificationService from './notificationService.js';
import LoggingService from './loggingService.js';
import EventBus from './eventBus.js';
import AppStore from './store.js'; // To access tasks and now user preferences

// --- Constants for LocalStorage (Only for non-settings, like alreadyNotifiedKey) ---
// NOTIFICATION_SETTINGS_KEY is removed as AppStore will handle settings persistence

// --- DOM Element References (will be populated in initialize or when settings UI is rendered) ---
let settingsDesktopNotificationsBtnEl;
let notificationSettingsSectionEl;
let enableNotificationsToggleEl;
let notifyOnTaskDueToggleEl;
let notifyMinutesBeforeDueEl;
let testNotificationBtnEl;
let notificationPermissionStatusTextEl; // For displaying permission status

// --- Default Settings ---
const defaultDesktopNotificationSettings = { // Renamed for clarity
    notificationsEnabled: false,
    notifyOnTaskDue: true,
    notifyMinutesBeforeDue: 5,
};

// --- Internal State ---
let currentSettings = { ...defaultDesktopNotificationSettings }; // Holds specific settings for this feature
let dueTaskCheckInterval = null;
const DUE_TASK_CHECK_INTERVAL_MS = 60 * 1000;

// --- Private Helper Functions ---

/**
 * Loads notification settings from AppStore.
 */
function _loadSettings() {
    const functionName = '_loadSettings (DesktopNotificationsFeature)';
    if (!AppStore || typeof AppStore.getUserPreferences !== 'function') {
        LoggingService.warn('[DesktopNotificationsFeature] AppStore or getUserPreferences not available. Using default settings.', { functionName });
        currentSettings = { ...defaultDesktopNotificationSettings };
        return;
    }
    try {
        const allUserPreferences = AppStore.getUserPreferences();
        const storedNotificationSettings = allUserPreferences.desktopNotifications;

        if (storedNotificationSettings && typeof storedNotificationSettings === 'object') {
            currentSettings = { ...defaultDesktopNotificationSettings, ...storedNotificationSettings };
            LoggingService.info('[DesktopNotificationsFeature] Loaded settings from AppStore.', { functionName, loadedSettings: currentSettings });
        } else {
            currentSettings = { ...defaultDesktopNotificationSettings };
            LoggingService.info('[DesktopNotificationsFeature] No desktop notification settings found in AppStore. Using defaults.', { functionName });
        }
    } catch (error) {
        currentSettings = { ...defaultDesktopNotificationSettings };
        LoggingService.error('[DesktopNotificationsFeature] Error loading settings from AppStore. Using defaults.', error, { functionName });
    }
}

/**
 * Saves current notification settings to AppStore.
 */
async function _saveSettings() {
    const functionName = '_saveSettings (DesktopNotificationsFeature)';
    if (!AppStore || typeof AppStore.setUserPreferences !== 'function') {
        LoggingService.error('[DesktopNotificationsFeature] AppStore or setUserPreferences not available. Cannot save settings.', new Error("AppStoreUnavailable"), { functionName });
        EventBus.publish('displayUserMessage', { text: 'Could not save notification settings.', type: 'error' });
        return;
    }
    try {
        // We pass the entire desktopNotifications settings object to be nested under 'desktopNotifications'
        // by AppStore's setUserPreferences (which expects a complete preferences object or a partial one to merge)
        await AppStore.setUserPreferences({ desktopNotifications: { ...currentSettings } }, 'DesktopNotificationsFeature._saveSettings');
        LoggingService.info('[DesktopNotificationsFeature] Settings saved to AppStore.', { functionName, savedSettings: currentSettings });
        // EventBus.publish('notificationSettingsChanged', { ...currentSettings }); // AppStore will publish userPreferencesChanged
    } catch (error) {
        LoggingService.error('[DesktopNotificationsFeature] Error saving settings via AppStore.', error, { functionName });
        EventBus.publish('displayUserMessage', { text: 'Could not save notification settings to store.', type: 'error' });
    }
}

/**
 * Updates the UI elements in the settings modal to reflect current settings and permission status.
 */
function _updateSettingsUI() {
    const functionName = '_updateSettingsUI';
    if (!isFeatureEnabled('desktopNotificationsFeature')) return;

    if (!enableNotificationsToggleEl) enableNotificationsToggleEl = document.getElementById('enableNotificationsToggle');
    if (!notifyOnTaskDueToggleEl) notifyOnTaskDueToggleEl = document.getElementById('notifyOnTaskDueToggle');
    if (!notifyMinutesBeforeDueEl) notifyMinutesBeforeDueEl = document.getElementById('notifyMinutesBeforeDue');
    if (!notificationPermissionStatusTextEl) notificationPermissionStatusTextEl = document.getElementById('notificationPermissionStatusText');
    if (!testNotificationBtnEl) testNotificationBtnEl = document.getElementById('testNotificationBtn');


    const permission = NotificationService.getPermissionStatus();
    const canEnable = permission === 'granted';

    if (notificationPermissionStatusTextEl) {
        let statusText = 'Unknown';
        let colorClass = 'text-slate-500 dark:text-slate-400';
        if (permission === 'granted') {
            statusText = 'Granted';
            colorClass = 'text-green-600 dark:text-green-400';
        } else if (permission === 'denied') {
            statusText = 'Denied by browser';
            colorClass = 'text-red-600 dark:text-red-400';
        } else if (permission === 'default') {
            statusText = 'Not Granted (Click "Enable" to request)';
            colorClass = 'text-amber-600 dark:text-amber-400';
        }
        notificationPermissionStatusTextEl.innerHTML = `Browser permission: <span class="font-medium ${colorClass}">${statusText}</span>.`;
    }

    if (enableNotificationsToggleEl) {
        enableNotificationsToggleEl.checked = currentSettings.notificationsEnabled && canEnable;
        enableNotificationsToggleEl.disabled = !canEnable && permission !== 'default'; // Disabled if denied, enabled if default (to allow request) or granted
    }

    const controlsShouldBeDisabled = !currentSettings.notificationsEnabled || !canEnable;

    if (notifyOnTaskDueToggleEl) {
        notifyOnTaskDueToggleEl.checked = currentSettings.notifyOnTaskDue;
        notifyOnTaskDueToggleEl.disabled = controlsShouldBeDisabled;
    }
    if (notifyMinutesBeforeDueEl) {
        notifyMinutesBeforeDueEl.value = currentSettings.notifyMinutesBeforeDue;
        notifyMinutesBeforeDueEl.disabled = controlsShouldBeDisabled || !currentSettings.notifyOnTaskDue;
    }
    if (testNotificationBtnEl) {
        testNotificationBtnEl.disabled = controlsShouldBeDisabled;
    }

    LoggingService.debug('[DesktopNotificationsFeature] Settings UI updated.', { functionName, currentSettings, permission });
}


/**
 * Checks for tasks that are due or about to be due and triggers notifications.
 */
function _checkAndNotifyForDueTasks() {
    const functionName = '_checkAndNotifyForDueTasks';
    if (!isFeatureEnabled('desktopNotificationsFeature') ||
        !currentSettings.notificationsEnabled ||
        !currentSettings.notifyOnTaskDue ||
        NotificationService.getPermissionStatus() !== 'granted' ||
        !AppStore) {
        return;
    }

    const tasks = AppStore.getTasks();
    const now = new Date();

    tasks.forEach(task => {
        if (!task.completed && task.dueDate) {
            const dueDateStr = task.dueDate + (task.time ? `T${task.time}` : 'T23:59:59');
            const dueDateTime = new Date(dueDateStr);

            if (isNaN(dueDateTime.getTime())) {
                LoggingService.warn(`[DesktopNotificationsFeature] Invalid due date for task ID ${task.id}: ${dueDateStr}`, { functionName, taskId: task.id });
                return;
            }

            const minutesBefore = currentSettings.notifyMinutesBeforeDue || 0;
            const notificationTime = new Date(dueDateTime.getTime() - (minutesBefore * 60000));
            const alreadyNotifiedKey = `notified_due_${task.id}_${dueDateTime.getTime()}`;

            if (now >= notificationTime && now <= dueDateTime && !localStorage.getItem(alreadyNotifiedKey)) {
                let body = `Task "${task.text}" is due ${minutesBefore > 0 ? `in ${minutesBefore} minutes` : 'now'}!`;
                if (task.time) body += ` at ${task.time}`;

                NotificationService.showNotification('Task Due!', {
                    body: body,
                    icon: './assets/icons/icon-72x72.png',
                    tag: `task_due_${task.id}`,
                    data: { taskId: task.id, url: window.location.href }
                }, (event) => {
                    LoggingService.info(`[DesktopNotificationsFeature] Due task notification clicked for task ID: ${event.notification.data.taskId}`, { functionName });
                    window.focus();
                });
                localStorage.setItem(alreadyNotifiedKey, 'true');
                LoggingService.info(`[DesktopNotificationsFeature] Due task notification triggered for task: ${task.text}`, { functionName, taskId: task.id });
            }
        }
    });
}

/**
 * Starts or stops the interval check for due tasks based on settings.
 */
function _manageDueTaskChecker() {
    const functionName = '_manageDueTaskChecker';
    if (dueTaskCheckInterval) {
        clearInterval(dueTaskCheckInterval);
        dueTaskCheckInterval = null;
        LoggingService.debug('[DesktopNotificationsFeature] Due task checker interval cleared.', { functionName });
    }

    if (isFeatureEnabled('desktopNotificationsFeature') &&
        currentSettings.notificationsEnabled &&
        currentSettings.notifyOnTaskDue &&
        NotificationService.getPermissionStatus() === 'granted') {
        dueTaskCheckInterval = setInterval(_checkAndNotifyForDueTasks, DUE_TASK_CHECK_INTERVAL_MS);
        _checkAndNotifyForDueTasks();
        LoggingService.info('[DesktopNotificationsFeature] Due task checker interval started.', { functionName, intervalMs: DUE_TASK_CHECK_INTERVAL_MS });
    } else {
        LoggingService.info('[DesktopNotificationsFeature] Due task checker not started (conditions not met).', {
             functionName,
             featureEnabled: isFeatureEnabled('desktopNotificationsFeature'),
             settingsEnabled: currentSettings.notificationsEnabled,
             notifyOnDue: currentSettings.notifyOnTaskDue,
             permission: NotificationService.getPermissionStatus()
        });
    }
}

// --- Public API / Event Handlers ---

function initialize() {
    const functionName = 'initialize (DesktopNotificationsFeature)';
    LoggingService.info('[DesktopNotificationsFeature] Initializing...', { functionName });

    _loadSettings(); // Load settings from AppStore first

    settingsDesktopNotificationsBtnEl = document.getElementById('settingsManageNotificationsBtn');
    notificationSettingsSectionEl = document.getElementById('desktopNotificationSettingsSection');
    enableNotificationsToggleEl = document.getElementById('enableNotificationsToggle');
    notifyOnTaskDueToggleEl = document.getElementById('notifyOnTaskDueToggle');
    notifyMinutesBeforeDueEl = document.getElementById('notifyMinutesBeforeDue');
    testNotificationBtnEl = document.getElementById('testNotificationBtn');
    notificationPermissionStatusTextEl = document.getElementById('notificationPermissionStatusText');


    if (settingsDesktopNotificationsBtnEl) {
        settingsDesktopNotificationsBtnEl.addEventListener('click', () => {
            if (notificationSettingsSectionEl) {
                const isHidden = notificationSettingsSectionEl.classList.contains('hidden');
                notificationSettingsSectionEl.classList.toggle('hidden', !isHidden);
                if (isHidden) { // If it was just made visible
                    _updateSettingsUI();
                }
                LoggingService.debug(`[DesktopNotificationsFeature] Notification settings section toggled. Visible: ${!notificationSettingsSectionEl.classList.contains('hidden')}`, { functionName: 'settingsBtnClick' });
            }
        });
    }

    if (enableNotificationsToggleEl) {
        enableNotificationsToggleEl.addEventListener('change', async (event) => {
            const isChecked = event.target.checked;
            let permissionGranted = NotificationService.getPermissionStatus() === 'granted';

            if (isChecked && !permissionGranted) {
                const newPermission = await NotificationService.requestPermission();
                permissionGranted = newPermission === 'granted';
            }
            
            currentSettings.notificationsEnabled = isChecked && permissionGranted;
            await _saveSettings(); // Use await as _saveSettings now calls AppStore.setUserPreferences which is async
            _updateSettingsUI();
            _manageDueTaskChecker();
            if (isChecked && !permissionGranted) {
                 EventBus.publish('displayUserMessage', { text: 'Desktop notifications permission denied or not yet granted.', type: 'warn' });
            }
        });
    }

    if (notifyOnTaskDueToggleEl) {
        notifyOnTaskDueToggleEl.addEventListener('change', async (event) => {
            currentSettings.notifyOnTaskDue = event.target.checked;
            await _saveSettings();
            _updateSettingsUI();
            _manageDueTaskChecker();
        });
    }

    if (notifyMinutesBeforeDueEl) {
        notifyMinutesBeforeDueEl.addEventListener('change', async (event) => {
            currentSettings.notifyMinutesBeforeDue = parseInt(event.target.value, 10) || 0;
            await _saveSettings();
            _updateSettingsUI();
        });
    }

    if (testNotificationBtnEl) {
        testNotificationBtnEl.addEventListener('click', () => {
            if (NotificationService.getPermissionStatus() === 'granted' && currentSettings.notificationsEnabled) {
                NotificationService.showNotification('Test Notification', {
                    body: 'If you see this, notifications are working!',
                    icon: './assets/icons/icon-72x72.png'
                });
                EventBus.publish('displayUserMessage', {text: 'Test notification sent!', type: 'success'});
            } else if (NotificationService.getPermissionStatus() !== 'granted') {
                EventBus.publish('displayUserMessage', {text: 'Please enable notifications and grant browser permission first.', type: 'warn'});
            } else {
                 EventBus.publish('displayUserMessage', {text: 'Please enable notifications in settings first.', type: 'warn'});
            }
        });
    }

    EventBus.subscribe('notificationPermissionChanged', (data) => {
        LoggingService.info('[DesktopNotificationsFeature] Event: notificationPermissionChanged.', { functionName: 'eventSub_PermChanged', newPermission: data.permission });
        if (data.permission !== 'granted' && currentSettings.notificationsEnabled) {
            currentSettings.notificationsEnabled = false;
            _saveSettings(); // Save this change
        }
        _updateSettingsUI();
        _manageDueTaskChecker();
    });

    EventBus.subscribe('userPreferencesChanged', (allPreferences) => {
        const functionName = 'eventSub_UserPrefsChanged';
        LoggingService.info('[DesktopNotificationsFeature] Event: userPreferencesChanged received.', { functionName });
        if (allPreferences && allPreferences.desktopNotifications) {
            const oldSettingsJSON = JSON.stringify(currentSettings);
            // Merge to ensure new properties in defaultDesktopNotificationSettings are respected if not in stored prefs
            currentSettings = { ...defaultDesktopNotificationSettings, ...allPreferences.desktopNotifications };
            if (JSON.stringify(currentSettings) !== oldSettingsJSON) {
                LoggingService.info('[DesktopNotificationsFeature] Local notification settings updated from AppStore.', { functionName, newSettings: currentSettings });
                _updateSettingsUI();
                _manageDueTaskChecker();
            }
        }
    });
    
    EventBus.subscribe('tasksChanged', () => {
        LoggingService.debug('[DesktopNotificationsFeature] Event: tasksChanged, re-evaluating notifications.', { functionName: 'eventSub_TasksChanged' });
         _manageDueTaskChecker();
    });

    _updateSettingsUI(); // Initial UI update based on loaded settings and permission
    _manageDueTaskChecker(); // Initial check and interval setup

    LoggingService.info('[DesktopNotificationsFeature] Initialized.', { functionName });
}

function updateUIVisibility() {
    const functionName = 'updateUIVisibility (DesktopNotificationsFeature)';
    const isActuallyEnabled = isFeatureEnabled('desktopNotificationsFeature');
    LoggingService.debug(`[DesktopNotificationsFeature] Updating UI visibility. Feature enabled: ${isActuallyEnabled}.`, { functionName, isActuallyEnabled });

    if (!settingsDesktopNotificationsBtnEl) settingsDesktopNotificationsBtnEl = document.getElementById('settingsManageNotificationsBtn');
    if (!notificationSettingsSectionEl) notificationSettingsSectionEl = document.getElementById('desktopNotificationSettingsSection');


    if (settingsDesktopNotificationsBtnEl) {
        settingsDesktopNotificationsBtnEl.classList.toggle('hidden', !isActuallyEnabled);
    }
    if (notificationSettingsSectionEl) {
        if (!isActuallyEnabled) {
            notificationSettingsSectionEl.classList.add('hidden');
        }
        // If feature is enabled, its visibility is controlled by the settingsDesktopNotificationsBtnEl click
    }
    
    document.querySelectorAll('.desktop-notifications-feature-element').forEach(el => {
        // Special handling for the settings section itself, which might be toggled by user action
        if (el.id === 'desktopNotificationSettingsSection') {
            if(!isActuallyEnabled) el.classList.add('hidden');
        } else {
            el.classList.toggle('hidden', !isActuallyEnabled);
        }
    });

    if (!isActuallyEnabled && dueTaskCheckInterval) {
        clearInterval(dueTaskCheckInterval);
        dueTaskCheckInterval = null;
        LoggingService.info('[DesktopNotificationsFeature] Feature disabled, due task checker stopped.', { functionName });
    } else if (isActuallyEnabled) {
        _loadSettings(); // Re-load settings in case they were cleared or changed while feature was off
        _updateSettingsUI();
        _manageDueTaskChecker();
    }
    LoggingService.info(`[DesktopNotificationsFeature] UI Visibility updated. Actual enabled: ${isActuallyEnabled}`, { functionName });
}

export const DesktopNotificationsFeature = {
    initialize,
    updateUIVisibility,
};

LoggingService.debug("feature_desktop_notifications.js loaded as ES6 module.", { module: 'feature_desktop_notifications' });