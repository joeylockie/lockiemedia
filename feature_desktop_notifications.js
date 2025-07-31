// feature_desktop_notifications.js
// Manages the Desktop Notifications Feature, including settings.
// The logic for triggering notifications has been moved to centralNotificationService.js.

import NotificationService from './notificationService.js';
import LoggingService from './loggingService.js';
import EventBus from './eventBus.js';
import AppStore from './store.js';

// --- DOM Element References ---
let settingsDesktopNotificationsBtnEl;
let enableNotificationsToggleEl;
let notifyOnTaskDueToggleEl;
let notifyMinutesBeforeDueEl;
let testNotificationBtnEl;
let notificationPermissionStatusTextEl;

// --- Default Settings ---
const defaultDesktopNotificationSettings = {
    notificationsEnabled: false,
    notifyOnTaskDue: true,
    notifyMinutesBeforeDue: 5,
};

// --- Internal State ---
let currentSettings = { ...defaultDesktopNotificationSettings };

// --- Private Helper Functions ---

function _loadSettings() {
    const functionName = '_loadSettings (DesktopNotificationsFeature)';
    if (!AppStore || typeof AppStore.getUserPreferences !== 'function') {
        LoggingService.warn('[DesktopNotificationsFeature] AppStore or getUserPreferences not available. Using default settings.', { functionName });
        currentSettings = { ...defaultDesktopNotificationSettings };
        return;
    }
    try {
        const allUserPreferences = AppStore.getUserPreferences();
        // MODIFICATION: Read from 'taskNotifications' instead of 'desktopNotifications'
        const storedNotificationSettings = allUserPreferences.taskNotifications;

        if (storedNotificationSettings && typeof storedNotificationSettings === 'object') {
            currentSettings = { ...defaultDesktopNotificationSettings, ...storedNotificationSettings };
            LoggingService.info('[DesktopNotificationsFeature] Loaded settings from AppStore.', { functionName, loadedSettings: currentSettings });
        } else {
            currentSettings = { ...defaultDesktopNotificationSettings };
            LoggingService.info('[DesktopNotificationsFeature] No task notification settings found in AppStore. Using defaults.', { functionName });
        }
    } catch (error) {
        currentSettings = { ...defaultDesktopNotificationSettings };
        LoggingService.error('[DesktopNotificationsFeature] Error loading settings from AppStore. Using defaults.', error, { functionName });
    }
}

async function _saveSettings() {
    const functionName = '_saveSettings (DesktopNotificationsFeature)';
    if (!AppStore || typeof AppStore.setUserPreferences !== 'function') {
        LoggingService.error('[DesktopNotificationsFeature] AppStore or setUserPreferences not available. Cannot save settings.', new Error("AppStoreUnavailable"), { functionName });
        EventBus.publish('displayUserMessage', { text: 'Could not save notification settings.', type: 'error' });
        return;
    }
    try {
        // MODIFICATION: Save settings under the 'taskNotifications' key, preserving other preferences.
        const prefs = AppStore.getUserPreferences();
        await AppStore.setUserPreferences({ ...prefs, taskNotifications: { ...currentSettings } }, 'DesktopNotificationsFeature._saveSettings');
        LoggingService.info('[DesktopNotificationsFeature] Settings saved to AppStore.', { functionName, savedSettings: currentSettings });
    } catch (error) {
        LoggingService.error('[DesktopNotificationsFeature] Error saving settings via AppStore.', error, { functionName });
        EventBus.publish('displayUserMessage', { text: 'Could not save notification settings to store.', type: 'error' });
    }
}

function _updateSettingsUI() {
    const functionName = '_updateSettingsUI';
    if (!window.isFeatureEnabled('desktopNotificationsFeature')) return;

    if (!enableNotificationsToggleEl) enableNotificationsToggleEl = document.getElementById('enableNotificationsToggle');
    if (!notifyOnTaskDueToggleEl) notifyOnTaskDueToggleEl = document.getElementById('notifyOnTaskDueToggle');
    if (!notifyMinutesBeforeDueEl) notifyMinutesBeforeDueEl = document.getElementById('notifyMinutesBeforeDue');
    if (!notificationPermissionStatusTextEl) notificationPermissionStatusTextEl = document.getElementById('notificationPermissionStatusText');
    if (!testNotificationBtnEl) testNotificationBtnEl = document.getElementById('testNotificationBtn');

    const permission = NotificationService.getPermissionStatus();
    const canEnableBasedOnPermission = permission === 'granted';

    if (notificationPermissionStatusTextEl) {
        let statusText = 'Unknown';
        let colorClass = 'text-slate-500 dark:text-slate-400';
        if (permission === 'granted') {
            statusText = 'Granted';
            colorClass = 'text-green-600 dark:text-green-400';
        } else if (permission === 'denied') {
            statusText = 'Denied by browser - Please check browser settings.';
            colorClass = 'text-red-600 dark:text-red-400';
        } else if (permission === 'default') {
            statusText = 'Not Granted. Click "Enable" to request.';
            colorClass = 'text-amber-600 dark:text-amber-400';
        }
        notificationPermissionStatusTextEl.innerHTML = `Browser permission: <span class="font-medium ${colorClass}">${statusText}</span>`;
    }

    if (enableNotificationsToggleEl) {
        enableNotificationsToggleEl.checked = currentSettings.notificationsEnabled && canEnableBasedOnPermission;
        enableNotificationsToggleEl.disabled = permission === 'denied';
    }

    const controlsShouldBeDisabled = !currentSettings.notificationsEnabled || !canEnableBasedOnPermission;

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

// REMOVED _checkAndNotifyForDueTasks and _manageDueTaskChecker functions

function initialize() {
    const functionName = 'initialize (DesktopNotificationsFeature)';
    
    if (!document.getElementById('settingsModal')) {
        LoggingService.debug('[DesktopNotificationsFeature] Settings modal not found. Skipping initialization.', { functionName });
        return;
    }
    
    LoggingService.info('[DesktopNotificationsFeature] Initializing...', { functionName });

    _loadSettings();

    settingsDesktopNotificationsBtnEl = document.getElementById('settingsManageNotificationsBtn');
    enableNotificationsToggleEl = document.getElementById('enableNotificationsToggle');
    notifyOnTaskDueToggleEl = document.getElementById('notifyOnTaskDueToggle');
    notifyMinutesBeforeDueEl = document.getElementById('notifyMinutesBeforeDue');
    testNotificationBtnEl = document.getElementById('testNotificationBtn');
    notificationPermissionStatusTextEl = document.getElementById('notificationPermissionStatusText');

    if (enableNotificationsToggleEl) {
        enableNotificationsToggleEl.addEventListener('change', async (event) => {
            const isChecked = event.target.checked;
            let permissionGranted = NotificationService.getPermissionStatus() === 'granted';

            if (isChecked && !permissionGranted) {
                const newPermission = await NotificationService.requestPermission();
                permissionGranted = newPermission === 'granted';
            }

            currentSettings.notificationsEnabled = isChecked && permissionGranted;
            await _saveSettings();
            _updateSettingsUI();
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
            const testButtonFunctionName = 'testNotificationBtnClickHandler';
            LoggingService.debug(`[DesktopNotificationsFeature] Test Notification button clicked.`, {
                functionName: testButtonFunctionName,
                permissionStatus: NotificationService.getPermissionStatus(),
                appNotificationsEnabled: currentSettings.notificationsEnabled,
                currentSettings: JSON.parse(JSON.stringify(currentSettings))
            });

            if (NotificationService.getPermissionStatus() === 'granted' && currentSettings.notificationsEnabled) {
                LoggingService.debug(`[DesktopNotificationsFeature] Conditions met. Attempting to show test notification.`, { functionName: testButtonFunctionName });
                NotificationService.showNotification('Test Notification', {
                    body: 'If you see this, notifications are working!',
                    icon: './icon-32x32.png'
                });
                EventBus.publish('displayUserMessage', {text: 'Test notification sent!', type: 'success'});
            } else if (NotificationService.getPermissionStatus() !== 'granted') {
                LoggingService.warn(`[DesktopNotificationsFeature] Test notification NOT sent: Browser permission not granted.`, { functionName: testButtonFunctionName, permission: NotificationService.getPermissionStatus() });
                EventBus.publish('displayUserMessage', {text: 'Please enable notifications and grant browser permission first.', type: 'warn'});
            } else {
                LoggingService.warn(`[DesktopNotificationsFeature] Test notification NOT sent: In-app notifications not enabled.`, { functionName: testButtonFunctionName, appNotificationsEnabled: currentSettings.notificationsEnabled });
                 EventBus.publish('displayUserMessage', {text: 'Please enable notifications in settings first.', type: 'warn'});
            }
        });
    }

    EventBus.subscribe('notificationPermissionChanged', (data) => {
        LoggingService.info('[DesktopNotificationsFeature] Event: notificationPermissionChanged.', { functionName: 'eventSub_PermChanged', newPermission: data.permission });
        if (data.permission !== 'granted' && currentSettings.notificationsEnabled) {
            currentSettings.notificationsEnabled = false;
            _saveSettings();
        }
        _updateSettingsUI();
    });

    EventBus.subscribe('userPreferencesChanged', (allPreferences) => {
        const funcName = 'eventSub_UserPrefsChanged (DesktopNotificationsFeature)';
        LoggingService.info(`[DesktopNotificationsFeature] Event: userPreferencesChanged received.`, { funcName });
        // MODIFICATION: Check for 'taskNotifications'
        if (allPreferences && allPreferences.taskNotifications) {
            const oldSettingsJSON = JSON.stringify(currentSettings);
            // MODIFICATION: Read from 'taskNotifications'
            currentSettings = { ...defaultDesktopNotificationSettings, ...allPreferences.taskNotifications };
            if (JSON.stringify(currentSettings) !== oldSettingsJSON) {
                LoggingService.info('[DesktopNotificationsFeature] Local notification settings updated from AppStore.', { funcName, newSettings: currentSettings });
                _updateSettingsUI();
            }
        }
    });

    LoggingService.info('[DesktopNotificationsFeature] Initialized.', { functionName });
}

function updateUIVisibility() {
    const functionName = 'updateUIVisibility (DesktopNotificationsFeature)';
    const isActuallyEnabled = window.isFeatureEnabled('desktopNotificationsFeature');
    LoggingService.debug(`[DesktopNotificationsFeature] Updating UI visibility. Feature enabled: ${isActuallyEnabled}.`, { functionName, isActuallyEnabled });

    if (!settingsDesktopNotificationsBtnEl) settingsDesktopNotificationsBtnEl = document.getElementById('settingsManageNotificationsBtn');

    if (settingsDesktopNotificationsBtnEl) {
        settingsDesktopNotificationsBtnEl.classList.toggle('hidden', !isActuallyEnabled);
    } else {
        LoggingService.warn('[DesktopNotificationsFeature] settingsManageNotificationsBtnEl NOT FOUND during updateUIVisibility.', { functionName });
    }

    if (isActuallyEnabled) {
        _loadSettings();
        _updateSettingsUI();
    }
}

function refreshSettingsUIDisplay() {
    const functionName = 'refreshSettingsUIDisplay (DesktopNotificationsFeature)';
    LoggingService.debug('[DesktopNotificationsFeature] Refreshing settings UI display on modal open.', { functionName });
    _loadSettings();
    _updateSettingsUI();
}

export const DesktopNotificationsFeature = {
    initialize,
    updateUIVisibility,
    refreshSettingsUIDisplay
};

LoggingService.debug("feature_desktop_notifications.js loaded as ES6 module.", { module: 'feature_desktop_notifications' });