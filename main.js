// main.js
// Main entry point for the application.

import EventBus from './eventBus.js';
import AppStore from './store.js';
import { loadFeatureFlags, isFeatureEnabled as isFeatureEnabledFromService, getAllFeatureFlags, setFeatureFlag as setFeatureFlagInService } from './featureFlagService.js'; // Added getAllFeatureFlags, setFeatureFlagInService
import { loadAppVersion, getAppVersionString, startUpdateChecker } from './versionService.js'; // Removed checkForUpdates as it's called by startUpdateChecker
import * as TaskService from './taskService.js';
import * as ProjectServiceModule from './projectService.js';
import { ProjectsFeature } from './feature_projects.js';
import * as LabelServiceModule from './labelService.js';
import { setupEventListeners, applyActiveFeatures, setFilter } from './ui_event_handlers.js';
import ViewManager from './viewManager.js';
import * as BulkActionServiceModule from './bulkActionService.js';
import ModalStateService from './modalStateService.js';
import TooltipService from './tooltipService.js';
import { TestButtonFeature } from './feature_test_button.js';
import { ReminderFeature } from './feature_reminder.js';
import { AdvancedRecurrenceFeature } from './feature_advanced_recurrence.js';
import { FileAttachmentsFeature } from './feature_file_attachments.js';
import { IntegrationsServicesFeature } from './feature_integrations_services.js';
import { UserAccountsFeature } from './feature_user_accounts.js';
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
import LoggingService, { LOG_LEVELS } from './loggingService.js'; // LOG_LEVELS needed if we set level directly here
import * as firebaseService from './firebaseService.js';
import NotificationService from './notificationService.js';
import { DesktopNotificationsFeature } from './feature_desktop_notifications.js';

// This will be dynamically imported
let uiRendering;

// Fallback critical error display until uiRendering is loaded
let showCriticalErrorImported = (message, errorId) => {
    const fallbackErrorMsg = `CRITICAL ERROR (display): ${message}, ID: ${errorId}. UI for errors not yet loaded.`;
    console.error(fallbackErrorMsg);
    alert(fallbackErrorMsg); // Simple alert as a last resort
};

// Global variable to store the update notification element
let updateNotificationElement = null;

// --- App Update Notification Banner ---
function showUpdateNotificationBar(data) {
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
        localStorage.removeItem(dismissedKey); // Allow re-showing if not updated for some reason
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


// --- Global Error Handlers ---
window.onerror = function(message, source, lineno, colno, error) {
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    // Ensure LoggingService is used, error object is properly passed
    LoggingService.critical(String(message), error || new Error(String(message)), {
        source,
        lineno,
        colno,
        errorId,
        type: 'window.onerror'
    });
    showCriticalErrorImported(`An unexpected error occurred. Please report ID: ${errorId}`, errorId);
    return true; // Prevent default handling
};

window.onunhandledrejection = function(event) {
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    let errorReason = event.reason;
    if (!(errorReason instanceof Error)) {
        // Try to get more info if it's an object, otherwise stringify
        const reasonString = (typeof errorReason === 'object' && errorReason !== null) ?
                             JSON.stringify(errorReason) :
                             String(errorReason || 'Unknown promise rejection reason');
        errorReason = new Error(reasonString);
    }
    LoggingService.critical('Global unhandled promise rejection:', errorReason, {
        errorId,
        type: 'window.onunhandledrejection'
    });
    showCriticalErrorImported(`An operation failed unexpectedly. Please report ID: ${errorId}`, errorId);
    event.preventDefault(); // Prevent default handling
};


document.addEventListener('DOMContentLoaded', async () => {
    // Logging starts with default level (INFO or DEBUG if debugMode was true initially in LoggingService)
    LoggingService.info("[Main] DOMContentLoaded event fired. Starting application initialization...");

    try {
        uiRendering = await import('./ui_rendering.js');
        if (uiRendering.showCriticalError) {
            showCriticalErrorImported = uiRendering.showCriticalError;
            LoggingService.info("[Main] showCriticalError function imported from ui_rendering.");
        } else {
            LoggingService.warn("[Main] showCriticalError function not found in ui_rendering.js. Using fallback.");
        }

        if (uiRendering.initializeDOMElements) {
            uiRendering.initializeDOMElements(); // This also calls renderAppVersion
            LoggingService.info("[Main] DOM elements initialized and initial version rendered.");
        } else {
            throw new Error("initializeDOMElements not found in ui_rendering.js");
        }
    } catch (e) {
        LoggingService.critical("[Main] CRITICAL: Error importing or initializing ui_rendering.js or its DOM elements!", e, { step: "uiRenderingImportInit" });
        showCriticalErrorImported("CRITICAL: UI Initialization Failed. Please refresh. " + e.message, "UI_INIT_FAIL");
        return; // Stop further execution
    }


    // Expose essential services and features globally under AppFeatures namespace
    // This helps avoid circular dependencies and makes them accessible for event handlers or console debugging.
    if (typeof window.AppFeatures === 'undefined') window.AppFeatures = {};
    window.AppFeatures.LoggingService = LoggingService;
    window.AppFeatures.EventBus = EventBus;
    window.AppFeatures.AppStore = AppStore;
    window.AppFeatures.ViewManager = ViewManager;
    window.AppFeatures.ModalInteractions = ModalInteractions;
    window.AppFeatures.TaskService = TaskService; // Expose all of TaskService
    window.AppFeatures.isFeatureEnabled = isFeatureEnabledFromService; // Expose the checker
    window.AppFeatures.getAllFeatureFlags = getAllFeatureFlags; // For debugging/feature flag modal
    window.AppFeatures.setFeatureFlag = setFeatureFlagInService; // For feature flag modal to call

    // Assign all imported feature modules to window.AppFeatures
    window.AppFeatures.UserAccountsFeature = UserAccountsFeature;
    window.AppFeatures.TestButtonFeature = TestButtonFeature;
    window.AppFeatures.ReminderFeature = ReminderFeature;
    window.AppFeatures.AdvancedRecurrenceFeature = AdvancedRecurrenceFeature;
    window.AppFeatures.FileAttachmentsFeature = FileAttachmentsFeature;
    window.AppFeatures.IntegrationsServicesFeature = IntegrationsServicesFeature;
    window.AppFeatures.CollaborationSharingFeature = CollaborationSharingFeature;
    window.AppFeatures.CrossDeviceSyncFeature = CrossDeviceSyncFeature;
    window.AppFeatures.TaskDependenciesFeature = TaskDependenciesFeature;
    window.AppFeatures.SmarterSearchFeature = SmarterSearchFeature;
    window.AppFeatures.DataManagementFeature = DataManagementFeature;
    window.AppFeatures.CalendarViewFeature = CalendarViewFeature;
    window.AppFeatures.TaskTimerSystemFeature = TaskTimerSystemFeature;
    window.AppFeatures.KanbanBoardFeature = KanbanBoardFeature;
    window.AppFeatures.PomodoroTimerHybridFeature = PomodoroTimerHybridFeature;
    window.AppFeatures.ProjectsFeature = ProjectsFeature;
    window.AppFeatures.TooltipsGuideFeature = TooltipsGuideFeature;
    window.AppFeatures.SubTasksFeature = SubTasksFeature;
    window.AppFeatures.BackgroundFeature = BackgroundFeature;
    window.AppFeatures.ContactUsFeature = ContactUsFeature;
    window.AppFeatures.SocialMediaLinksFeature = SocialMediaLinksFeature;
    window.AppFeatures.AboutUsFeature = AboutUsFeature;
    window.AppFeatures.DataVersioningFeature = DataVersioningFeature;
    window.AppFeatures.DesktopNotificationsFeature = DesktopNotificationsFeature;


    if (window.AppFeatures.UserAccountsFeature && typeof window.AppFeatures.UserAccountsFeature.initialize === 'function') {
        try {
            LoggingService.info("[Main] Initializing UserAccountsFeature (includes Firebase SDK setup)...");
            window.AppFeatures.UserAccountsFeature.initialize();
            LoggingService.info("[Main] UserAccountsFeature initialization complete.");
        } catch (e) {
            LoggingService.critical('[Main] CRITICAL: Error initializing UserAccountsFeature (Firebase).', e, { step: "userAccountsInit" });
            showCriticalErrorImported("Failed to initialize core user services. Please refresh.", "AUTH_INIT_FAIL");
            return; // Stop if Firebase auth fails critically
        }
    } else {
        LoggingService.warn('[Main] UserAccountsFeature or its initialize function is not available.');
    }

    // Now that Firebase is initialized, load feature flags
    try {
        await loadFeatureFlags(); // Load flags from Firestore/JSON/localStorage
        LoggingService.info("[Main] Feature flags loading process completed.");

        // Now that flags are loaded, initialize log level based on 'debugMode' flag
        LoggingService.initializeLogLevel(); // This will re-check and set the level
        LoggingService.info(`[Main] Log level set to: ${LoggingService.getCurrentLevelName()} after feature flag load.`);

    } catch (e) {
        LoggingService.critical("[Main] CRITICAL: Error loading feature flags!", e, { step: "loadFeatureFlags" });
        showCriticalErrorImported("Failed to load application configuration. Please try again later.", "CONFIG_LOAD_FAIL");
        return; // Stop further execution if flags can't load
    }


    try {
        await loadAppVersion();
        LoggingService.info(`[Main] Application Version: ${getAppVersionString()} successfully loaded.`);
    } catch (e) {
        LoggingService.error("[Main] Error loading application version. Default will be used.", e);
    }

    // Initialize Store
    if (AppStore && typeof AppStore.initializeStore === 'function') {
        try {
            await AppStore.initializeStore(); // This will load from localStorage first
            LoggingService.info("[Main] AppStore initialized (localStorage).");
            // Note: Firestore data loading/streaming is typically triggered by auth state change in UserAccountsFeature
        } catch (e) {
             LoggingService.error('[Main] Error initializing AppStore.', e, { step: "appStoreInit" });
             showCriticalErrorImported("Failed to load application data store. Please refresh.", "STORE_INIT_FAIL");
            return;
        }
    } else {
        LoggingService.critical('[Main] CRITICAL: AppStore or its initializeStore function is not available.', null, { step: "appStoreInitMissing" });
        showCriticalErrorImported("Core data system unavailable. Please refresh.", "STORE_MISSING");
        return;
    }

    // Start the app update checker if the feature is enabled
    if (isFeatureEnabledFromService('appUpdateNotificationFeature')) {
        if (typeof startUpdateChecker === 'function') {
            LoggingService.info("[Main] Starting application update checker.", { functionName: "DOMContentLoaded" });
            startUpdateChecker();
        } else {
            LoggingService.error('[Main] startUpdateChecker function from versionService is not available.', new Error("FunctionMissing"), { service: "versionService" });
        }
    } else {
        LoggingService.info("[Main] Application update checker is disabled by feature flag 'appUpdateNotificationFeature'.", { functionName: "DOMContentLoaded" });
    }

    // Subscribe to new version event for UI banner
    if (EventBus && typeof EventBus.subscribe === 'function') {
        EventBus.subscribe('newVersionAvailable', (data) => {
            if (isFeatureEnabledFromService('appUpdateNotificationFeature') && data && data.newVersion) {
                showUpdateNotificationBar(data);
            } else if (!isFeatureEnabledFromService('appUpdateNotificationFeature')) {
                LoggingService.debug("[Main] 'newVersionAvailable' event received, but feature 'appUpdateNotificationFeature' is disabled. Notification suppressed.", { functionName: "newVersionAvailable_Subscription" });
            }
        });
        LoggingService.info("[Main] Subscribed to 'newVersionAvailable' event.", { functionName: "DOMContentLoaded" });
    } else {
        LoggingService.warn('[Main] EventBus not available for newVersionAvailable subscription.');
    }

    // Initialize UI Rendering Subscriptions
    if (uiRendering && uiRendering.initializeUiRenderingSubscriptions) {
        uiRendering.initializeUiRenderingSubscriptions();
        LoggingService.info("[Main] UI Rendering event subscriptions initialized.");
    } else {
        LoggingService.error('[Main] uiRendering.initializeUiRenderingSubscriptions function is not available.');
    }

    // Initialize other feature modules based on their flags
    if (typeof isFeatureEnabledFromService === 'function' && typeof window.AppFeatures !== 'undefined') {
        LoggingService.info("[Main] Initializing other feature modules based on flags...");
        for (const featureKey in window.AppFeatures) {
            // Skip already initialized core services/features or non-feature objects
            const nonFeatureKeys = ['LoggingService', 'EventBus', 'AppStore', 'ViewManager', 'ModalInteractions', 'TaskService', 'isFeatureEnabled', 'getAllFeatureFlags', 'setFeatureFlag', 'UserAccountsFeature'];
            if (nonFeatureKeys.includes(featureKey)) continue;

            if (window.AppFeatures.hasOwnProperty(featureKey) &&
                window.AppFeatures[featureKey] &&
                typeof window.AppFeatures[featureKey].initialize === 'function') {

                // Derive the flag name (e.g., TestButtonFeature -> testButtonFeature)
                let flagName = featureKey.charAt(0).toLowerCase() + featureKey.slice(1);
                if (flagName.endsWith('Feature')) {
                    flagName = flagName.slice(0, -'Feature'.length);
                }
                // Special cases for flag names if they don't perfectly match the object key
                if (featureKey === "TaskTimerSystemFeature") flagName = "taskTimerSystem";
                if (featureKey === "SubTasksFeature") flagName = "subTasksFeature"; // Example if it was different


                if (isFeatureEnabledFromService(flagName)) {
                     try {
                        LoggingService.debug(`[Main] Initializing ${featureKey} (flag: ${flagName})...`);
                        window.AppFeatures[featureKey].initialize();
                    } catch (e) {
                        LoggingService.error(`[Main] Error initializing feature ${featureKey}:`, e);
                    }
                } else {
                     LoggingService.info(`[Main] Skipping initialization of ${featureKey} as its flag ('${flagName}') is disabled.`);
                }
            }
        }
        LoggingService.info("[Main] Other feature modules initialization process completed.");
    }

    applyActiveFeatures(); // This will call updateUIVisibility for all features
    LoggingService.info("[Main] Active features applied to UI (initial pass after all inits).");

    // Initial UI setup that depends on ViewManager or AppStore being ready
    if (ViewManager && typeof setFilter === 'function') {
        setFilter(ViewManager.getCurrentFilter()); // Apply initial filter styles
        LoggingService.info("[Main] Initial filter styles applied.");
    } else {
        LoggingService.error('[Main] ViewManager or setFilter function is not available for initial filter styles.');
    }

    const savedSidebarState = localStorage.getItem('sidebarState');
    if (uiRendering && uiRendering.setSidebarMinimized) {
        uiRendering.setSidebarMinimized(savedSidebarState === 'minimized');
        LoggingService.info(`[Main] Sidebar state restored to: ${savedSidebarState || 'expanded (default)'}.`);
    } else {
        LoggingService.error('[Main] uiRendering.setSidebarMinimized function is not available for sidebar state.');
    }

    // Populate dynamic UI parts that might depend on feature flags or store data
    if (isFeatureEnabledFromService('projectFeature') && window.AppFeatures?.ProjectsFeature) {
        if(window.AppFeatures.ProjectsFeature.populateProjectFilterList) window.AppFeatures.ProjectsFeature.populateProjectFilterList();
        if(window.AppFeatures.ProjectsFeature.populateProjectDropdowns) window.AppFeatures.ProjectsFeature.populateProjectDropdowns();
        LoggingService.debug("[Main] Project UI elements populated.");
    }

    if (uiRendering && uiRendering.updateSortButtonStates) {
        uiRendering.updateSortButtonStates();
        LoggingService.debug("[Main] Initial sort button states updated.");
    } else {
        LoggingService.error('[Main] uiRendering.updateSortButtonStates function is not available.');
    }

    setupEventListeners(); // Setup global (non-modal, non-form specific) event listeners
    LoggingService.info("[Main] Global event listeners set up.");

    LoggingService.info("---------------------------------------------------------");
    LoggingService.info("         Todo App Initialization Complete &#x2705;");
    LoggingService.info("---------------------------------------------------------");
});

// Legacy global assignments for simpler access in older parts or HTML event attributes (try to minimize use)
// These are now mostly assigned under window.AppFeatures
if (typeof window.isFeatureEnabled === 'undefined') window.isFeatureEnabled = isFeatureEnabledFromService;
if (typeof window.getAllFeatureFlags === 'undefined') window.getAllFeatureFlags = getAllFeatureFlags;
if (typeof window.setFeatureFlag === 'undefined') window.setFeatureFlag = setFeatureFlagInService;
if (typeof window.LoggingService === 'undefined') window.LoggingService = LoggingService;