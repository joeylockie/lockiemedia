// tasks_main.js
// Main entry point for the Task Manager application.

import EventBus from './eventBus.js';
import AppStore from './store.js';
// import { loadAppVersion, startUpdateChecker } from './versionService.js'; // REMOVED
import { ProjectsFeature } from './feature_projects.js';
import { setupEventListeners, applyActiveFeatures, setFilter } from './tasks_ui_event_handlers.js';
import ViewManager from './viewManager.js';
import { ReminderFeature } from './feature_reminder.js';
import { AdvancedRecurrenceFeature } from './feature_advanced_recurrence.js';
import { ShoppingListFeature } from './feature_shopping_list.js';
import LoggingService from './loggingService.js';
import { DesktopNotificationsFeature } from './feature_desktop_notifications.js';
import * as uiRendering from './tasks_ui_rendering.js';
// import { logPerformanceMetrics } from './performanceService.js'; // REMOVED
import { refreshTaskView } from './tasks_ui_rendering.js';
import * as ModalInteractions from './tasks_modal_interactions.js';

// --- Feature Handling ---
// This function determines which features are active for the Task Manager.
function isFeatureEnabled(featureName) {
    const features = {
        reminderFeature: true,
        advancedRecurrence: true,
        projectFeature: true,
        bulkActionsFeature: false, // REMOVED
        desktopNotificationsFeature: true,
        appUpdateNotificationFeature: false, // REMOVED
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
// REMOVED: showUpdateNotificationBar function and its element declaration

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
    // await loadAppVersion(); // REMOVED
    
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
    // REMOVED update checker block
    // logPerformanceMetrics(); // REMOVED

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