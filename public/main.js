// main.js
// Main entry point for the application.
// REFACTORED FOR SELF-HOSTED BACKEND

import EventBus from './eventBus.js';
import AppStore from './store.js';
import { loadAppVersion, startUpdateChecker } from './versionService.js';
import { ProjectsFeature } from './feature_projects.js';
import { setupEventListeners, applyActiveFeatures, setFilter } from './ui_event_handlers.js';
import ViewManager from './viewManager.js';
import { TestButtonFeature } from './feature_test_button.js';
import { ReminderFeature } from './feature_reminder.js';
import { AdvancedRecurrenceFeature } from './feature_advanced_recurrence.js';
import { FileAttachmentsFeature } from './feature_file_attachments.js';
import { IntegrationsServicesFeature } from './feature_integrations_services.js';
import { CollaborationSharingFeature } from './feature_collaboration_sharing.js';
import { CrossDeviceSyncFeature } from './feature_cross_device_sync.js';
import { TaskDependenciesFeature } from './feature_task_dependencies.js';
import { SmarterSearchFeature } from './feature_smarter_search.js';
import { DataManagementFeature } from './feature_data_management.js';
import { CalendarViewFeature } from './feature_calendar_view.js';
import { TaskTimerSystemFeature } from './task_timer_system.js';
import { KanbanBoardFeature } from './feature_kanban_board.js';
import { PomodoroTimerHybridFeature } from './pomodoro_timer.js';
import * as ModalInteractions from './modal_interactions.js';
import { TooltipsGuideFeature } from './feature_tooltips_guide.js';
import { SubTasksFeature } from './feature_sub_tasks.js';
import { BackgroundFeature } from './feature_background.js';
import { ContactUsFeature } from './feature_contact_us.js';
import { SocialMediaLinksFeature } from './feature_social_media_links.js';
import { AboutUsFeature } from './feature_about_us.js';
import { DataVersioningFeature } from './feature_data_versioning.js';
import { ShoppingListFeature } from './feature_shopping_list.js';
import LoggingService from './loggingService.js';
import { DesktopNotificationsFeature } from './feature_desktop_notifications.js';
import * as uiRendering from './ui_rendering.js';
import { logPerformanceMetrics } from './performanceService.js';
import { NotesFeature } from './feature_notes.js';
import { refreshTaskView } from './ui_rendering.js';

// --- Simplified Feature Handling ---
// Since we removed feature flags, we now treat every feature as enabled.
// The `isFeatureEnabled` function is a simple true/false check.
function isFeatureEnabled(featureName) {
    // For now, we enable all features. You can disable one by setting it to false.
    const features = {
        testButtonFeature: true,
        reminderFeature: true,
        taskTimerSystem: true,
        advancedRecurrence: true,
        fileAttachments: true,
        integrationsServices: false, // Keep planned features off
        collaborationSharing: false,
        crossDeviceSync: false,
        tooltipsGuide: true,
        subTasksFeature: true,
        kanbanBoardFeature: true,
        projectFeature: true,
        exportDataFeature: true,
        calendarViewFeature: true,
        taskDependenciesFeature: true,
        smarterSearchFeature: true,
        bulkActionsFeature: true,
        pomodoroTimerHybridFeature: true,
        backgroundFeature: false,
        contactUsFeature: true,
        socialMediaLinksFeature: true,
        aboutUsFeature: true,
        dataVersioningFeature: true,
        desktopNotificationsFeature: true,
        appUpdateNotificationFeature: true,
        shoppingListFeature: true,
        notesFeature: true,
        debugMode: true,
        userRoleFeature: true,
    };
    return features[featureName] || false;
}

let showCriticalErrorImported = (message, errorId) => {
    const fallbackErrorMsg = `CRITICAL ERROR (display): ${message}, ID: ${errorId}. UI for errors not yet loaded.`;
    console.error(fallbackErrorMsg);
    alert(fallbackErrorMsg);
};

// --- Update Notification ---
let updateNotificationElement = null;

function showUpdateNotificationBar(data) {
    // This function remains the same as before
    const functionName = 'showUpdateNotificationBar (main.js)';
    const newVersionString = data.newVersion;
    LoggingService.info(`[Main] Preparing update notification for version: ${newVersionString}`, { functionName, newVersionString });
    const dismissedKey = `updateNotificationDismissedForVersion_${newVersionString}`;
    if (localStorage.getItem(dismissedKey) === 'true') {
        LoggingService.info(`[Main] Update notification for version ${newVersionString} was previously dismissed. Not showing.`, { functionName });
        return;
    }
    if (updateNotificationElement && updateNotificationElement.parentNode) {
        if (updateNotificationElement.dataset.version !== newVersionString) {
            updateNotificationElement.parentNode.removeChild(updateNotificationElement);
            updateNotificationElement = null;
        } else {
            LoggingService.debug(`[Main] Update notification for ${newVersionString} already visible.`, { functionName });
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
        LoggingService.info('[Main] User clicked refresh button for update.', { functionName });
        localStorage.removeItem(dismissedKey);
        window.location.reload();
    };
    const dismissButton = document.createElement('button');
    dismissButton.textContent = 'Dismiss';
    dismissButton.className = 'w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-md border border-sky-400 dark:border-sky-600 text-xs sm:text-sm';
    dismissButton.onclick = () => {
        LoggingService.info(`[Main] User dismissed update notification for version: ${newVersionString}.`, { functionName, newVersion: newVersionString });
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
    // No more authentication check here
    document.body.style.visibility = 'visible';
    LoggingService.info("[Main] Starting application initialization...");

    // Phase 1: Initialize UI elements and core services
    uiRendering.initializeDOMElements();
    if (uiRendering.showCriticalError) {
        showCriticalErrorImported = uiRendering.showCriticalError;
    }
    await loadAppVersion();
    
    // Phase 2: Load data from our new backend
    if (AppStore && AppStore.initializeStore) {
        await AppStore.initializeStore();
        LoggingService.info("[Main] Initial data load from server complete.");
    } else {
        LoggingService.critical('[Main] AppStore.initializeStore is not available. Cannot load data.', new Error('DataLoadFailed'));
        return;
    }

    // Phase 3: Initialize all feature modules now that data is present
    window.AppFeatures = {
        LoggingService, EventBus, AppStore, ViewManager, ModalInteractions,
        TestButtonFeature, ReminderFeature, AdvancedRecurrenceFeature, FileAttachmentsFeature,
        IntegrationsServicesFeature, CollaborationSharingFeature, CrossDeviceSyncFeature,
        TaskDependenciesFeature, SmarterSearchFeature, DataManagementFeature,
        CalendarViewFeature, TaskTimerSystemFeature, KanbanBoardFeature,
        PomodoroTimerHybridFeature, ProjectsFeature, TooltipsGuideFeature,
        SubTasksFeature, BackgroundFeature, ContactUsFeature, SocialMediaLinksFeature,
        AboutUsFeature, DataVersioningFeature, ShoppingListFeature,
        DesktopNotificationsFeature, NotesFeature,
        isFeatureEnabled // Use our local function
    };
    
    uiRendering.initializeUiRenderingSubscriptions();
    setupEventListeners();

    for (const featureKey in window.AppFeatures) {
        if (typeof window.AppFeatures[featureKey]?.initialize === 'function') {
            try {
                LoggingService.debug(`[Main] Initializing feature module: ${featureKey}`);
                window.AppFeatures[featureKey].initialize();
            } catch (e) {
                LoggingService.error(`[Main] Error initializing feature ${featureKey}:`, e);
            }
        }
    }
    
    // Phase 4: Initial Render
    applyActiveFeatures(); // This function now relies on our local isFeatureEnabled
    setFilter(ViewManager.getCurrentFilter());
    uiRendering.setSidebarMinimized(localStorage.getItem('sidebarState') === 'minimized');
    refreshTaskView();
    LoggingService.info("[Main] Initial UI render complete.");
    
    // Phase 5: Start background services
    if (isFeatureEnabled('appUpdateNotificationFeature')) {
        startUpdateChecker();
    }
    // No more user data streaming
    logPerformanceMetrics();

    LoggingService.info("---------------------------------------------------------");
    LoggingService.info("         LockieMedia App Initialization Complete ✓");
    LoggingService.info("---------------------------------------------------------");
});

// Expose our new local isFeatureEnabled globally for any modules that might need it
if (typeof window.isFeatureEnabled === 'undefined') {
    window.isFeatureEnabled = isFeatureEnabled;
}
if (typeof window.LoggingService === 'undefined') {
    window.LoggingService = LoggingService;
}