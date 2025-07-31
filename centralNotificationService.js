// joeylockie/lockiemedia/lockiemedia-dev/centralNotificationService.js
import LoggingService from './loggingService.js';
import AppStore from './store.js';
import NotificationService from './notificationService.js';
import { formatTime } from './utils.js';

// --- Internal State ---
let checkInterval = null;
const CHECK_INTERVAL_MS = 60 * 1000; // Check every minute

/**
 * Checks for any upcoming calendar events that need notifications.
 */
function checkCalendarEvents() {
    const functionName = 'checkCalendarEvents (CentralNotificationService)';
    const prefs = AppStore.getUserPreferences()?.calendarNotifications || {};

    if (!prefs.enabled) return;

    const now = new Date();
    const minutesBefore = parseInt(prefs.notifyMinutesBefore) || 15;
    const notifyFrom = new Date(now.getTime() + minutesBefore * 60000);

    const allEvents = AppStore.getCalendarEvents();
    allEvents.forEach(event => {
        const eventStart = new Date(event.startTime);
        // Check if the event is in the future but within our notification window
        if (!event.isAllDay && eventStart > now && eventStart <= notifyFrom) {
            const notificationId = `event_notification_${event.id}_${event.startTime}`;
            if (!localStorage.getItem(notificationId)) {
                NotificationService.showNotification(event.title, {
                    body: `Starts at ${formatTime(event.startTime)}. Location: ${event.location || 'N/A'}`,
                    tag: notificationId
                });
                localStorage.setItem(notificationId, 'true');
                LoggingService.info(`[CentralNotificationService] Fired calendar event notification for: "${event.title}"`, { functionName });
            }
        }
    });
}

/**
 * Checks for any tasks that are due soon.
 */
function checkTaskDeadlines() {
    const functionName = 'checkTaskDeadlines (CentralNotificationService)';
    const prefs = AppStore.getUserPreferences()?.desktopNotifications || {};

    if (!prefs.notificationsEnabled || !prefs.notifyOnTaskDue) return;

    const tasks = AppStore.getTasks();
    const now = new Date();

    tasks.forEach(task => {
        if (!task.completed && task.dueDate) {
            const dueDateStr = task.dueDate + (task.time ? `T${task.time}` : 'T23:59:59');
            const dueDateTime = new Date(dueDateStr);
            if (isNaN(dueDateTime.getTime())) return;

            const minutesBefore = prefs.notifyMinutesBeforeDue || 0;
            const notificationTime = new Date(dueDateTime.getTime() - (minutesBefore * 60000));
            const alreadyNotifiedKey = `notified_due_${task.id}_${dueDateTime.getTime()}`;

            if (now >= notificationTime && now <= dueDateTime && !localStorage.getItem(alreadyNotifiedKey)) {
                let body = `Task "${task.text}" is due ${minutesBefore > 0 ? `in ${minutesBefore} minutes` : 'now'}!`;
                if (task.time) body += ` at ${formatTime(task.time)}`;

                NotificationService.showNotification('Task Due!', {
                    body: body,
                    icon: './icon-32x32.png',
                    tag: `task_due_${task.id}`
                });
                localStorage.setItem(alreadyNotifiedKey, 'true');
                LoggingService.info(`[CentralNotificationService] Fired task due notification for: "${task.text}"`, { functionName });
            }
        }
    });
}


/**
 * Runs all notification checks.
 */
function runAllChecks() {
    if (NotificationService.getPermissionStatus() !== 'granted') {
        return;
    }
    LoggingService.debug('[CentralNotificationService] Running all notification checks...');
    checkCalendarEvents();
    checkTaskDeadlines();
    // Future checks for other apps can be added here.
}

/**
 * Starts the periodic interval to check for notifications.
 */
function start() {
    if (checkInterval) {
        clearInterval(checkInterval);
    }
    runAllChecks(); // Run once immediately
    checkInterval = setInterval(runAllChecks, CHECK_INTERVAL_MS);
    LoggingService.info('[CentralNotificationService] Notification checker started.', { functionName: 'start' });
}

/**
 * Stops the periodic interval.
 */
function stop() {
    if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
        LoggingService.info('[CentralNotificationService] Notification checker stopped.', { functionName: 'stop' });
    }
}

/**
 * Sends a test notification to confirm the system works.
 */
function fireTestNotification() {
    LoggingService.info('[CentralNotificationService] Firing test notification.');
    if (NotificationService.getPermissionStatus() !== 'granted') {
        alert("Browser notification permission has not been granted. Please enable notifications in the app settings.");
        NotificationService.requestPermission();
        return;
    }
    NotificationService.showNotification('Central Notification Test', {
        body: 'This test notification was triggered from the dashboard. The system is working!',
        icon: './icon-32x32.png'
    });
}

export const CentralNotificationService = {
    initialize: start,
    stop,
    fireTestNotification
};