// main.js
// Main entry point for the application.

import EventBus from './eventBus.js';
import AppStore from './store.js';
import { loadFeatureFlags, isFeatureEnabled as isFeatureEnabledFromService, getAllFeatureFlags, setFeatureFlag as setFeatureFlagInService } from './featureFlagService.js';
import { loadAppVersion, getAppVersionString, startUpdateChecker } from './versionService.js';
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
import LoggingService, { LOG_LEVELS } from './loggingService.js';
import * as firebaseService from './firebaseService.js';
import NotificationService from './notificationService.js';
import { DesktopNotificationsFeature } from './feature_desktop_notifications.js';
import * as uiRendering from './ui_rendering.js';


let showCriticalErrorImported = (message, errorId) => {
    const fallbackErrorMsg = `CRITICAL ERROR (display): ${message}, ID: ${errorId}. UI for errors not yet loaded.`;
    console.error(fallbackErrorMsg);
    alert(fallbackErrorMsg);
};

let updateNotificationElement = null;

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

document.addEventListener('DOMContentLoaded', async () => {
    LoggingService.info("[Main] DOMContentLoaded event fired. Starting application initialization...");

    if (uiRendering && uiRendering.showCriticalError) {
        showCriticalErrorImported = uiRendering.showCriticalError;
        LoggingService.info("[Main] showCriticalError function assigned from imported ui_rendering.");
    } else {
        LoggingService.warn("[Main] showCriticalError function not found in imported ui_rendering.js. Using fallback.");
    }

    if (uiRendering && uiRendering.initializeDOMElements) {
        uiRendering.initializeDOMElements();
        LoggingService.info("[Main] DOM elements initialized."); // Note: Removed "initial version rendered" to avoid confusion
    } else {
        const initError = new Error("initializeDOMElements not found in ui_rendering.js");
        LoggingService.critical("[Main] CRITICAL: Error initializing ui_rendering.js or its DOM elements!", initError, { step: "uiRenderingInit" });
        showCriticalErrorImported("CRITICAL: UI Initialization Failed. Please refresh. " + initError.message, "UI_INIT_FAIL");
        return;
    }

    if (typeof window.AppFeatures === 'undefined') window.AppFeatures = {};
    window.AppFeatures.LoggingService = LoggingService;
    window.AppFeatures.EventBus = EventBus;
    window.AppFeatures.AppStore = AppStore;
    window.AppFeatures.ViewManager = ViewManager;
    window.AppFeatures.ModalInteractions = ModalInteractions;
    window.AppFeatures.TaskService = TaskService;
    window.AppFeatures.isFeatureEnabled = isFeatureEnabledFromService;
    window.AppFeatures.getAllFeatureFlags = getAllFeatureFlags;
    window.AppFeatures.setFeatureFlag = setFeatureFlagInService;
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
            return;
        }
    } else {
        LoggingService.warn('[Main] UserAccountsFeature or its initialize function is not available.');
    }

    try {
        await loadFeatureFlags();
        LoggingService.info("[Main] Feature flags loading process completed.");
        LoggingService.initializeLogLevel();
        LoggingService.info(`[Main] Log level set to: ${LoggingService.getCurrentLevelName()} after feature flag load.`);
    } catch (e) {
        LoggingService.critical("[Main] CRITICAL: Error loading feature flags!", e, { step: "loadFeatureFlags" });
        showCriticalErrorImported("Failed to load application configuration. Please try again later.", "CONFIG_LOAD_FAIL");
        return;
    }

    // **** MODIFIED SECTION FOR VERSION RENDERING ****
    try {
        await loadAppVersion(); // Wait for version to be loaded
        LoggingService.info(`[Main] Application Version: ${getAppVersionString()} successfully loaded and available.`);
        // NOW that version is loaded, explicitly call renderAppVersion from uiRendering
        if (uiRendering && uiRendering.renderAppVersion) {
            LoggingService.debug("[Main] Explicitly calling renderAppVersion after loadAppVersion completion.");
            uiRendering.renderAppVersion(); // This will use the now-loaded version string
        } else {
            LoggingService.warn("[Main] uiRendering.renderAppVersion not available for explicit call after version load.");
        }
    } catch (e) {
        LoggingService.error("[Main] Error loading application version. Default will be used if displayed elsewhere before this.", e);
    }
    // **** END OF MODIFIED SECTION ****

    if (AppStore && typeof AppStore.initializeStore === 'function') {
        try {
            await AppStore.initializeStore();
            LoggingService.info("[Main] AppStore initialized (localStorage).");
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

    if (EventBus && typeof EventBus.subscribe === 'function') {
        EventBus.subscribe('newVersionAvailable', (data) => {
            if (isFeatureEnabledFromService('appUpdateNotificationFeature') && data && data.newVersion) {
                showUpdateNotificationBar(data);
            } else if (!isFeatureEnabledFromService('appUpdateNotificationFeature')) {
                LoggingService.debug("[Main] 'newVersionAvailable' event received, but feature 'appUpdateNotificationFeature' is disabled. Notification suppressed.", { functionName: "newVersionAvailable_Subscription" });
            }
        });
        // The 'appVersionLoaded' subscription is now primarily in ui_rendering.js
        // Keeping it there ensures ui_rendering itself handles its update based on the event.
        LoggingService.info("[Main] Subscribed to 'newVersionAvailable' event.", { functionName: "DOMContentLoaded" });
    } else {
        LoggingService.warn('[Main] EventBus not available for newVersionAvailable subscription.');
    }

    if (uiRendering && uiRendering.initializeUiRenderingSubscriptions) {
        uiRendering.initializeUiRenderingSubscriptions(); // This will set up the appVersionLoaded subscription among others
        LoggingService.info("[Main] UI Rendering event subscriptions initialized.");
    } else {
        LoggingService.error('[Main] uiRendering.initializeUiRenderingSubscriptions function is not available.');
    }

    if (typeof isFeatureEnabledFromService === 'function' && typeof window.AppFeatures !== 'undefined') {
        LoggingService.info("[Main] Initializing other feature modules based on flags...");
        for (const featureKey in window.AppFeatures) {
            const nonFeatureKeys = ['LoggingService', 'EventBus', 'AppStore', 'ViewManager', 'ModalInteractions', 'TaskService', 'isFeatureEnabled', 'getAllFeatureFlags', 'setFeatureFlag', 'UserAccountsFeature'];
            if (nonFeatureKeys.includes(featureKey)) continue;
            if (window.AppFeatures.hasOwnProperty(featureKey) &&
                window.AppFeatures[featureKey] &&
                typeof window.AppFeatures[featureKey].initialize === 'function') {
                let flagName = featureKey.charAt(0).toLowerCase() + featureKey.slice(1);
                if (flagName.endsWith('Feature')) {
                    flagName = flagName.slice(0, -'Feature'.length);
                }
                if (featureKey === "TaskTimerSystemFeature") flagName = "taskTimerSystem";
                if (featureKey === "SubTasksFeature") flagName = "subTasksFeature";
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

    applyActiveFeatures();
    LoggingService.info("[Main] Active features applied to UI (initial pass after all inits).");

    if (ViewManager && typeof setFilter === 'function') {
        setFilter(ViewManager.getCurrentFilter());
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

    setupEventListeners();
    LoggingService.info("[Main] Global event listeners set up.");

    if (uiRendering && uiRendering.styleSmartViewButtons) {
        LoggingService.debug("[Main] Explicitly calling styleSmartViewButtons after initial setup.");
        uiRendering.styleSmartViewButtons();
    } else {
        LoggingService.warn("[Main] uiRendering.styleSmartViewButtons not available for explicit call.");
    }

    LoggingService.info("---------------------------------------------------------");
    LoggingService.info("         Todo App Initialization Complete &#x2705;");
    LoggingService.info("---------------------------------------------------------");
});

if (typeof window.isFeatureEnabled === 'undefined') window.isFeatureEnabled = isFeatureEnabledFromService;
if (typeof window.getAllFeatureFlags === 'undefined') window.getAllFeatureFlags = getAllFeatureFlags;
if (typeof window.setFeatureFlag === 'undefined') window.setFeatureFlag = setFeatureFlagInService;
if (typeof window.LoggingService === 'undefined') window.LoggingService = LoggingService;