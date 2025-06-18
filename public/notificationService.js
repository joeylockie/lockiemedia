// notificationService.js
// Manages requesting permission and displaying desktop notifications.

import LoggingService from './loggingService.js';
import EventBus from './eventBus.js';

let notificationPermission = Notification.permission;

/**
 * Checks if the browser supports desktop notifications.
 * @returns {boolean} True if supported, false otherwise.
 */
function isSupported() {
    if (!("Notification" in window)) {
        LoggingService.warn('[NotificationService] This browser does not support desktop notifications.', { module: 'notificationService', functionName: 'isSupported' });
        return false;
    }
    return true;
}

/**
 * Gets the current notification permission status.
 * @returns {string} 'granted', 'denied', or 'default'.
 */
function getPermissionStatus() {
    if (!isSupported()) return 'denied'; // Effectively denied if not supported
    return Notification.permission;
}

/**
 * Requests permission to show desktop notifications.
 * Updates the internal permission state and publishes an event.
 * @returns {Promise<string>} A promise that resolves with the permission status ('granted', 'denied', 'default').
 */
async function requestPermission() {
    const functionName = 'requestPermission';
    if (!isSupported()) {
        LoggingService.warn('[NotificationService] Notification API not supported, permission request skipped.', { module: 'notificationService', functionName });
        return Promise.resolve('denied');
    }

    if (notificationPermission === 'granted') {
        LoggingService.debug('[NotificationService] Permission already granted.', { module: 'notificationService', functionName });
        return Promise.resolve('granted');
    }

    LoggingService.info('[NotificationService] Requesting notification permission.', { module: 'notificationService', functionName });
    try {
        const permission = await Notification.requestPermission();
        notificationPermission = permission;
        LoggingService.info(`[NotificationService] Notification permission status: ${permission}`, { module: 'notificationService', functionName, newStatus: permission });
        EventBus.publish('notificationPermissionChanged', { permission });
        return permission;
    } catch (error) {
        LoggingService.error('[NotificationService] Error requesting notification permission.', error, { module: 'notificationService', functionName });
        notificationPermission = 'denied'; // Assume denied on error
        EventBus.publish('notificationPermissionChanged', { permission: 'denied' });
        return 'denied';
    }
}

/**
 * Shows a desktop notification if permission is granted.
 * @param {string} title - The title of the notification.
 * @param {object} options - Options for the notification (e.g., body, icon, tag, data).
 * See https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification
 * @param {Function} [onClick] - Optional callback function to execute when the notification is clicked.
 * @param {Function} [onClose] - Optional callback function to execute when the notification is closed.
 * @param {Function} [onError] - Optional callback function to execute if an error occurs displaying the notification.
 * @returns {Notification|null} The Notification object if shown, otherwise null.
 */
function showNotification(title, options = {}, onClick, onClose, onError) {
    const functionName = 'showNotification';
    if (!isSupported()) {
        LoggingService.warn('[NotificationService] Cannot show notification: API not supported.', { module: 'notificationService', functionName, title });
        return null;
    }
    if (notificationPermission !== 'granted') {
        LoggingService.warn(`[NotificationService] Cannot show notification: Permission not granted (status: ${notificationPermission}). Request permission first.`, { module: 'notificationService', functionName, title, permission: notificationPermission });
        // Optionally, you could try to request permission here if it's 'default'
        // For now, it requires explicit permission grant first.
        return null;
    }

    if (!title) {
        LoggingService.error('[NotificationService] Notification title is required.', new Error('MissingTitle'), { module: 'notificationService', functionName });
        return null;
    }

    LoggingService.info(`[NotificationService] Attempting to show notification: "${title}"`, { module: 'notificationService', functionName, title, options });

    try {
        const notification = new Notification(title, options);

        if (typeof onClick === 'function') {
            notification.onclick = (event) => {
                LoggingService.debug('[NotificationService] Notification clicked.', { module: 'notificationService', functionName: 'notification.onclick', title, eventData: event.notification?.data });
                onClick(event);
                // Standard behavior: focus the window and close notification
                window.focus();
                notification.close();
            };
        } else {
            // Default click behavior
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        }

        if (typeof onClose === 'function') {
            notification.onclose = (event) => {
                LoggingService.debug('[NotificationService] Notification closed.', { module: 'notificationService', functionName: 'notification.onclose', title });
                onClose(event);
            };
        }

        if (typeof onError === 'function') {
            notification.onerror = (event) => {
                LoggingService.error('[NotificationService] Error displaying notification.', event, { module: 'notificationService', functionName: 'notification.onerror', title });
                onError(event);
            };
        } else {
            notification.onerror = (event) => {
                LoggingService.error('[NotificationService] Default error handler: Error displaying notification.', event, { module: 'notificationService', functionName: 'notification.onerror (default)', title });
            };
        }
        LoggingService.debug(`[NotificationService] Notification shown: "${title}"`, { module: 'notificationService', functionName, title });
        return notification;
    } catch (error) {
        LoggingService.error('[NotificationService] Error creating Notification object.', error, { module: 'notificationService', functionName, title });
        if (typeof onError === 'function') onError(error);
        return null;
    }
}


// Initialize permission state on load
if (isSupported()) {
    notificationPermission = Notification.permission;
    LoggingService.info(`[NotificationService] Initial notification permission state: ${notificationPermission}`, { module: 'notificationService', functionName: 'moduleLoad' });
}

const NotificationService = {
    isSupported,
    getPermissionStatus,
    requestPermission,
    showNotification
};

export default NotificationService;

LoggingService.debug("notificationService.js loaded as ES6 module.", { module: 'notificationService' });