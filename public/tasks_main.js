// tasks_main.js
// Main entry point for the Task Manager application.

import EventBus from './eventBus.js';
import AppStore from './store.js';
import { loadAppVersion, startUpdateChecker } from './versionService.js';
import { ProjectsFeature } from './feature_projects.js';
import { setupEventListeners, applyActiveFeatures, setFilter } from './tasks_ui_event_handlers.js';
import ViewManager from './viewManager.js';
import { ReminderFeature } from './feature_reminder.js';
import { AdvancedRecurrenceFeature } from './feature_advanced_recurrence.js';
import { ShoppingListFeature } from './feature_shopping_list.js';
import LoggingService from './loggingService.js';
import { DesktopNotificationsFeature } from './feature_desktop_notifications.js';
import * as uiRendering from './tasks_ui_rendering.js';
import { logPerformanceMetrics } from './performanceService.js';
import { refreshTaskView } from './tasks_ui_rendering.js';
import * as ModalInteractions from './tasks_modal_interactions.js';

// --- Feature Handling ---
// This function determines which features are active for the Task Manager.
function isFeatureEnabled(featureName) {
    const features = {
        reminderFeature: true,
        advancedRecurrence: true,
        projectFeature: true,
        bulkActionsFeature: true,
        desktopNotificationsFeature: true,
        appUpdateNotificationFeature: true,
        shoppingListFeature: true,
        notesFeature: true, // Kept for potential cross-app integrations, but Notes UI is separate
        debugMode: true,
        userRoleFeature: true,

        // Explicitly disabled features from original monolith
        fileAttachments: false,
        subTasksFeature: false,
        exportDataFeature: false,
        taskDependenciesFeature: false,
        dataVersioningFeature: false,
        testButtonFeature: false,
        taskTimerSystem: false,
        integrationsServices: false, 
        collaborationSharing: false,
        crossDeviceSync: false,
        tooltipsGuide: false,
        kanbanBoardFeature: false,
        calendarViewFeature: false,
        smarterSearchFeature: false,
        pomodoroTimerHybridFeature: false, 
        backgroundFeature: false,
        contactUsFeature: false,
        socialMediaLinksFeature: false,
        aboutUsFeature: false,
    };
    return features[featureName] || false;
}

// --- Update Notification ---
let updateNotificationElement = null;

function showUpdateNotificationBar(data) {
    const functionName = 'showUpdateNotificationBar (tasks_main.js)';
    const newVersionString = data.newVersion;
    LoggingService.info(`[TasksMain] Preparing update notification for version: ${newVersionString}`, { functionName, newVersionString });
    const dismissedKey = `updateNotificationDismissedForVersion_${newVersionString}`;
    if (localStorage.getItem(dismissedKey) === 'true') {
        LoggingService.info(`[TasksMain] Update notification for version ${newVersionString} was previously dismissed. Not showing.`, { functionName });
        return;
    }
    if (updateNotificationElement && updateNotificationElement.parentNode) {
        if (updateNotificationElement.dataset.version !== newVersionString) {
            updateNotificationElement.parentNode.removeChild(updateNotificationElement);
            updateNotificationElement = null;
        } else {
            LoggingService.debug(`[TasksMain] Update notification for ${newVersionString} already visible.`, { functionName });
            return;
        }
    }
    updateNotificationElement = document.createElement('div');
    updateNotificationElement.id = 'updateNotificationBanner';
    updateNotificationElement.dataset.version = newVersionString;
    updateNotificationElement.className = 'fixed bottom-0 left-0 right-0 bg-sky-600 dark:bg-sky-700 text-white p-3 sm:p-4 text-center z-[300] shadow-lg transition-transform duration-300 ease-out transform translate-y-full';
    const containerDiv = document.createElement('div');
    containerDiv.className = 'max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4';
    const messageP = document.createElement('p');
    messageP.className = 'text-sm sm:text-base text-left sm:text-center flex-grow';
    messageP.innerHTML = `&#x1F680; A new version (<strong>v${newVersionString}</strong>) is available! Refresh to get the latest features and improvements.`;
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'flex-shrink-0 flex flex-col sm:flex-row gap-2 sm:gap-3 items-center mt-2 sm:mt-0';
    const refreshButton = document.createElement('button');
    refreshButton.textContent = 'Refresh Now';
    refreshButton.className = 'w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-sky-700 rounded-md hover:bg-sky-100 font-semibold text-xs sm:text-sm shadow-sm';
    refreshButton.onclick = () => {
        LoggingService.info('[TasksMain] User clicked refresh button for update.', { functionName });
        localStorage.removeItem(dismissedKey);
        window.location.reload();
    };
    const dismissButton = document.createElement('button');
    dismissButton.textContent = 'Dismiss';
    dismissButton.className = 'w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-md border border-sky-400 dark:border-sky-600 text-xs sm:text-sm';
    dismissButton.onclick = () => {
        LoggingService.info(`[TasksMain] User dismissed update notification for version: ${newVersionString}.`, { functionName, newVersion: newVersionString });
        if (updateNotificationElement && updateNotificationElement.parentNode) {
            updateNotificationElement.classList.add('translate-y-full');
            setTimeout(() => {
                if (updateNotificationElement && updateNotificationElement.parentNode) {
                    updateNotificationElement.parentNode.removeChild(updateNotificationElement);
                }
                updateNotificationElement = null;
            }, 300);
        }
        localStorage.setItem(dismissedKey, 'true');
    };
    buttonsDiv.appendChild(dismissButton);
    buttonsDiv.appendChild(refreshButton);
    containerDiv.appendChild(messageP);
    containerDiv.appendChild(buttonsDiv);
    updateNotificationElement.appendChild(containerDiv);
    document.body.appendChild(updateNotificationElement);
    setTimeout(() => {
        if (updateNotificationElement) {
            updateNotificationElement.classList.remove('translate-y-full');
        }
    }, 50);
}


// --- Global Error Handling ---
let showCriticalErrorImported = (message, errorId) => {
    const fallbackErrorMsg = `CRITICAL ERROR (display): ${message}, ID: ${errorId}. UI for errors not yet loaded.`;
    console.error(fallbackErrorMsg);
    alert(fallbackErrorMsg);
};

window.onerror = function(message, source, lineno, colno, error) {
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    LoggingService.critical(String(message), error || new Error(String(message)), {
        source, lineno, colno, errorId, type: 'window.onerror'
    });
    showCriticalErrorImported(`An unexpected error occurred. Please report ID: ${errorId}`, errorId);
    return true;
};

window.onunhandledrejection = function(event) {
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    let errorReason = event.reason;
    if (!(errorReason instanceof Error)) {
        const reasonString = (typeof errorReason === 'object' && errorReason !== null) ?
                             JSON.stringify(errorReason) :
                             String(errorReason || 'Unknown promise rejection reason');
        errorReason = new Error(reasonString);
    }
    LoggingService.critical('Global unhandled promise rejection:', errorReason, {
        errorId, type: 'window.onunhandledrejection'
    });
    showCriticalErrorImported(`An operation failed unexpectedly. Please report ID: ${errorId}`, errorId);
    event.preventDefault();
};

// --- Main Application Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    document.body.style.visibility = 'visible';
    LoggingService.info("[TasksMain] Starting Task Manager application initialization...");

    // Phase 1: Initialize UI elements and core services
    uiRendering.initializeDOMElements();
    if (uiRendering.showCriticalError) {
        showCriticalErrorImported = uiRendering.showCriticalError;
    }
    await loadAppVersion();
    
    // Phase 2: Load data from the backend
    if (AppStore && AppStore.initializeStore) {
        await AppStore.initializeStore();
        LoggingService.info("[TasksMain] Initial data load from server complete.");
    } else {
        LoggingService.critical('[TasksMain] AppStore.initializeStore is not available. Cannot load data.', new Error('DataLoadFailed'));
        return;
    }

    // Phase 3: Initialize all feature modules relevant to the Task Manager
    window.AppFeatures = {
        LoggingService, EventBus, AppStore, ViewManager, ModalInteractions,
        ReminderFeature, AdvancedRecurrenceFeature,
        ProjectsFeature,
        ShoppingListFeature,
        DesktopNotificationsFeature,
        isFeatureEnabled
    };
    
    uiRendering.initializeUiRenderingSubscriptions();
    setupEventListeners();

    for (const featureKey in window.AppFeatures) {
        if (window.AppFeatures.hasOwnProperty(featureKey) && typeof window.AppFeatures[featureKey]?.initialize === 'function') {
            try {
                LoggingService.debug(`[TasksMain] Initializing feature module: ${featureKey}`);
                window.AppFeatures[featureKey].initialize();
            } catch (e) {
                LoggingService.error(`[TasksMain] Error initializing feature ${featureKey}:`, e);
            }
        }
    }
    
    // Phase 4: Initial Render
    applyActiveFeatures();
    setFilter(ViewManager.getCurrentFilter());
    uiRendering.setSidebarMinimized(localStorage.getItem('sidebarState') === 'minimized');
    refreshTaskView();
    LoggingService.info("[TasksMain] Initial UI render complete.");
    
    // Phase 5: Start background services
    if (isFeatureEnabled('appUpdateNotificationFeature')) {
        startUpdateChecker();
        // Subscribe to the new version event to show the notification bar
        EventBus.subscribe('newVersionAvailable', showUpdateNotificationBar);
    }
    logPerformanceMetrics();

    LoggingService.info("---------------------------------------------------------");
    LoggingService.info("     LockieMedia Task Manager Initialization Complete ✓");
    LoggingService.info("---------------------------------------------------------");
});

// Expose our new local isFeatureEnabled globally for any modules that might need it
if (typeof window.isFeatureEnabled === 'undefined') {
    window.isFeatureEnabled = isFeatureEnabled;
}
if (typeof window.LoggingService === 'undefined') {
    window.LoggingService = LoggingService;
}