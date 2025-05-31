// feature_desktop_notifications.js
// Manages the Desktop Notifications Feature, including settings and triggering notifications.

import { isFeatureEnabled } from './featureFlagService.js';
import NotificationService from './notificationService.js';
import LoggingService from './loggingService.js';
import EventBus from './eventBus.js';
import AppStore from './store.js'; // To access tasks for due date checks

// --- Constants for LocalStorage ---
const NOTIFICATION_SETTINGS_KEY = 'desktopNotificationSettings_v1';

// --- DOM Element References (will be populated in initialize or when settings UI is rendered) ---
let settingsDesktopNotificationsBtnEl; // Button in main settings to open notification settings
let notificationSettingsSectionEl; // The container for notification settings UI
// Specific settings UI elements:
let enableNotificationsToggleEl;
let notifyOnTaskDueToggleEl;
let notifyMinutesBeforeDueEl;
let testNotificationBtnEl;

// --- Default Settings ---
const defaultSettings = {
    notificationsEnabled: false, // Master switch for this feature's notifications
    notifyOnTaskDue: true,
    notifyMinutesBeforeDue: 5, // 0 means notify exactly when due
    // Add more settings as needed, e.g., sound, specific event notifications
};

// --- Internal State ---
let currentSettings = { ...defaultSettings };
let dueTaskCheckInterval = null;
const DUE_TASK_CHECK_INTERVAL_MS = 60 * 1000; // Check every minute

// --- Private Helper Functions ---

/**
 * Loads notification settings from localStorage.
 */
function _loadSettings() {
    const functionName = '_loadSettings (DesktopNotificationsFeature)';
    try {
        const storedSettings = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
        if (storedSettings) {
            const parsedSettings = JSON.parse(storedSettings);
            // Ensure all keys from defaultSettings are present
            currentSettings = { ...defaultSettings, ...parsedSettings };
            LoggingService.info('[DesktopNotificationsFeature] Loaded settings from localStorage.', { functionName, loadedSettings: currentSettings });
        } else {
            currentSettings = { ...defaultSettings };
            LoggingService.info('[DesktopNotificationsFeature] No settings found in localStorage. Using defaults.', { functionName });
        }
    } catch (error) {
        currentSettings = { ...defaultSettings };
        LoggingService.error('[DesktopNotificationsFeature] Error loading settings from localStorage. Using defaults.', error, { functionName });
    }
}

/**
 * Saves current notification settings to localStorage.
 */
function _saveSettings() {
    const functionName = '_saveSettings (DesktopNotificationsFeature)';
    try {
        localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(currentSettings));
        LoggingService.info('[DesktopNotificationsFeature] Saved settings to localStorage.', { functionName, savedSettings: currentSettings });
        EventBus.publish('notificationSettingsChanged', { ...currentSettings });
    } catch (error) {
        LoggingService.error('[DesktopNotificationsFeature] Error saving settings to localStorage.', error, { functionName });
        EventBus.publish('displayUserMessage', { text: 'Could not save notification settings.', type: 'error' });
    }
}

/**
 * Updates the UI elements in the settings modal to reflect current settings.
 */
function _updateSettingsUI() {
    const functionName = '_updateSettingsUI';
    if (!isFeatureEnabled('desktopNotificationsFeature')) return;

    // Ensure DOM elements are queried if not already available (e.g. if settings modal was just opened)
    if (!enableNotificationsToggleEl) enableNotificationsToggleEl = document.getElementById('enableNotificationsToggle');
    if (!notifyOnTaskDueToggleEl) notifyOnTaskDueToggleEl = document.getElementById('notifyOnTaskDueToggle');
    if (!notifyMinutesBeforeDueEl) notifyMinutesBeforeDueEl = document.getElementById('notifyMinutesBeforeDue');

    if (enableNotificationsToggleEl) {
        enableNotificationsToggleEl.checked = currentSettings.notificationsEnabled && (NotificationService.getPermissionStatus() === 'granted');
        enableNotificationsToggleEl.disabled = NotificationService.getPermissionStatus() !== 'granted';
    }
    if (notifyOnTaskDueToggleEl) {
        notifyOnTaskDueToggleEl.checked = currentSettings.notifyOnTaskDue;
        notifyOnTaskDueToggleEl.disabled = !currentSettings.notificationsEnabled || NotificationService.getPermissionStatus() !== 'granted';
    }
    if (notifyMinutesBeforeDueEl) {
        notifyMinutesBeforeDueEl.value = currentSettings.notifyMinutesBeforeDue;
        notifyMinutesBeforeDueEl.disabled = !currentSettings.notificationsEnabled || !currentSettings.notifyOnTaskDue || NotificationService.getPermissionStatus() !== 'granted';
    }
    LoggingService.debug('[DesktopNotificationsFeature] Settings UI updated.', { functionName, currentSettings, permission: NotificationService.getPermissionStatus() });
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
        // LoggingService.debug('[DesktopNotificationsFeature] Due task check skipped.', {
        //     functionName,
        //     featureEnabled: isFeatureEnabled('desktopNotificationsFeature'),
        //     settingsEnabled: currentSettings.notificationsEnabled,
        //     notifyOnDue: currentSettings.notifyOnTaskDue,
        //     permission: NotificationService.getPermissionStatus()
        // });
        return;
    }

    const tasks = AppStore.getTasks();
    const now = new Date();

    tasks.forEach(task => {
        if (!task.completed && task.dueDate) {
            const dueDateStr = task.dueDate + (task.time ? `T${task.time}` : 'T23:59:59'); // Assume end of day if no time
            const dueDateTime = new Date(dueDateStr);

            if (isNaN(dueDateTime.getTime())) {
                LoggingService.warn(`[DesktopNotificationsFeature] Invalid due date for task ID ${task.id}: ${dueDateStr}`, { functionName, taskId: task.id });
                return;
            }

            const minutesBefore = currentSettings.notifyMinutesBeforeDue || 0;
            const notificationTime = new Date(dueDateTime.getTime() - (minutesBefore * 60000));

            // Check if it's time to notify
            // And ensure we haven't notified for this specific due instance recently (e.g., by using a tag or simple tracking)
            const alreadyNotifiedKey = `notified_${task.id}_${dueDateTime.getTime()}`;

            if (now >= notificationTime && now <= dueDateTime && !localStorage.getItem(alreadyNotifiedKey)) {
                let body = `Task "${task.text}" is due ${minutesBefore > 0 ? `in ${minutesBefore} minutes` : 'now'}!`;
                if (task.time) {
                    body += ` at ${task.time}`;
                }

                NotificationService.showNotification('Task Due!', {
                    body: body,
                    icon: './assets/icons/icon-72x72.png', // Replace with your actual icon path
                    tag: `task_due_${task.id}`, // Tag can help replace/manage notifications
                    data: { taskId: task.id, url: window.location.href } // URL to open on click
                }, (event) => {
                    // Custom click behavior: e.g., open the task details modal
                    LoggingService.info(`[DesktopNotificationsFeature] Due task notification clicked for task ID: ${event.notification.data.taskId}`, { functionName });
                    // If you have a function to open a specific task:
                    // openViewTaskDetailsModal(event.notification.data.taskId);
                    window.focus(); // Bring window to front
                });
                localStorage.setItem(alreadyNotifiedKey, 'true'); // Mark as notified for this instance
                // Consider a cleanup mechanism for these localStorage keys later
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
        _checkAndNotifyForDueTasks(); // Run once immediately
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

    _loadSettings();

    settingsDesktopNotificationsBtnEl = document.getElementById('settingsManageNotificationsBtn'); // Will be added in todo.html
    notificationSettingsSectionEl = document.getElementById('desktopNotificationSettingsSection'); // Will be added in todo.html

    // Query other elements when the settings section is actually shown or here if always present but hidden
    enableNotificationsToggleEl = document.getElementById('enableNotificationsToggle');
    notifyOnTaskDueToggleEl = document.getElementById('notifyOnTaskDueToggle');
    notifyMinutesBeforeDueEl = document.getElementById('notifyMinutesBeforeDue');
    testNotificationBtnEl = document.getElementById('testNotificationBtn');

    if (settingsDesktopNotificationsBtnEl) {
        settingsDesktopNotificationsBtnEl.addEventListener('click', () => {
            // This button's role is to show/hide the notificationSettingsSectionEl
            // The actual rendering of the section is in todo.html
            if (notificationSettingsSectionEl) {
                const isHidden = notificationSettingsSectionEl.classList.contains('hidden');
                notificationSettingsSectionEl.classList.toggle('hidden', !isHidden);
                if (!isHidden) { // If it was just made visible
                    _updateSettingsUI();
                }
                LoggingService.debug(`[DesktopNotificationsFeature] Notification settings section toggled. Visible: ${!isHidden}`, { functionName: 'settingsBtnClick' });
            }
        });
    }

    if (enableNotificationsToggleEl) {
        enableNotificationsToggleEl.addEventListener('change', async (event) => {
            const isChecked = event.target.checked;
            if (isChecked && NotificationService.getPermissionStatus() !== 'granted') {
                await NotificationService.requestPermission();
            }
            // Re-check permission status after request
            if (NotificationService.getPermissionStatus() === 'granted') {
                currentSettings.notificationsEnabled = isChecked;
            } else {
                currentSettings.notificationsEnabled = false; // Force disable if permission denied
                event.target.checked = false; // Uncheck the toggle
                EventBus.publish('displayUserMessage', { text: 'Desktop notifications permission denied.', type: 'warn' });
            }
            _saveSettings();
            _updateSettingsUI();
            _manageDueTaskChecker();
        });
    }

    if (notifyOnTaskDueToggleEl) {
        notifyOnTaskDueToggleEl.addEventListener('change', (event) => {
            currentSettings.notifyOnTaskDue = event.target.checked;
            _saveSettings();
            _updateSettingsUI();
            _manageDueTaskChecker();
        });
    }

    if (notifyMinutesBeforeDueEl) {
        notifyMinutesBeforeDueEl.addEventListener('change', (event) => {
            currentSettings.notifyMinutesBeforeDue = parseInt(event.target.value, 10) || 0;
            _saveSettings();
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
            } else {
                EventBus.publish('displayUserMessage', {text: 'Enable notifications and grant permission first.', type: 'warn'});
            }
        });
    }

    EventBus.subscribe('notificationPermissionChanged', (data) => {
        LoggingService.info('[DesktopNotificationsFeature] Notification permission changed.', { functionName: 'eventSub_PermChanged', newPermission: data.permission });
        // If permission denied after being enabled, update state and UI
        if (data.permission !== 'granted' && currentSettings.notificationsEnabled) {
            currentSettings.notificationsEnabled = false;
            _saveSettings();
        }
        _updateSettingsUI();
        _manageDueTaskChecker();
    });

    EventBus.subscribe('tasksChanged', () => {
        // This could be used to clear specific task notifications if a task is deleted/completed
        // For now, the due task checker will handle new/upcoming tasks.
        LoggingService.debug('[DesktopNotificationsFeature] Tasks changed, re-evaluating notifications if needed.', { functionName: 'eventSub_TasksChanged' });
         _manageDueTaskChecker(); // Re-evaluate immediately or rely on interval
    });

    _manageDueTaskChecker(); // Initial check and interval setup

    LoggingService.info('[DesktopNotificationsFeature] Initialized.', { functionName });
}

function updateUIVisibility() {
    const functionName = 'updateUIVisibility (DesktopNotificationsFeature)';
    const isActuallyEnabled = isFeatureEnabled('desktopNotificationsFeature');
    LoggingService.debug(`[DesktopNotificationsFeature] Updating UI visibility. Feature enabled: ${isActuallyEnabled}.`, { functionName, isActuallyEnabled });

    if (settingsDesktopNotificationsBtnEl) {
        settingsDesktopNotificationsBtnEl.classList.toggle('hidden', !isActuallyEnabled);
    }
    if (notificationSettingsSectionEl) {
        // Hide the settings section if the feature is disabled, regardless of its previous state
        if (!isActuallyEnabled) {
            notificationSettingsSectionEl.classList.add('hidden');
        }
    }
    // Generic class for any other elements
    document.querySelectorAll('.desktop-notifications-feature-element').forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));

    if (!isActuallyEnabled && dueTaskCheckInterval) {
        clearInterval(dueTaskCheckInterval);
        dueTaskCheckInterval = null;
        LoggingService.info('[DesktopNotificationsFeature] Feature disabled, due task checker stopped.', { functionName });
    } else if (isActuallyEnabled) {
        _updateSettingsUI(); // Ensure settings UI reflects true state if feature just enabled
        _manageDueTaskChecker(); // Re-evaluate starting the checker
    }
    LoggingService.info(`[DesktopNotificationsFeature] UI Visibility updated. Actual enabled: ${isActuallyEnabled}`, { functionName });
}

export const DesktopNotificationsFeature = {
    initialize,
    updateUIVisibility,
    // Expose settings if other modules need them (generally not recommended to modify directly)
    // getCurrentSettings: () => ({ ...currentSettings }),
};

LoggingService.debug("feature_desktop_notifications.js loaded as ES6 module.", { module: 'feature_desktop_notifications' });