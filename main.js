// main.js
// Main entry point for the application.

import EventBus from './eventBus.js';
import AppStore from './store.js';
import { loadFeatureFlags, isFeatureEnabled as isFeatureEnabledFromService } from './featureFlagService.js';
// Updated import for versionService
import { loadAppVersion, getAppVersionString, startUpdateChecker, checkForUpdates } from './versionService.js';
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

// ADDED: AppUpdateNotificationFeature related (placeholder for now if it has its own module)
// For now, the logic will be directly in main.js and versionService.js

let uiRendering;

let showCriticalErrorImported = (message, errorId) => {
    console.error(`CRITICAL ERROR (display): ${message}, ID: ${errorId}`);
};

// Global variable to store the update notification element
let updateNotificationElement = null;
const CHANGELOG_STORAGE_KEY_PREFIX = 'changelogDismissedForVersion_';


// --- App Update Notification Banner ---
function showUpdateNotificationBar(data) {
    const functionName = 'showUpdateNotificationBar (main.js)';
    const newVersionString = data.newVersion;
    const newVersionObject = data.newVersionObject; // Contains major, minor, feature, patch

    LoggingService.info(`[Main] Preparing update notification for version: ${newVersionString}`, { functionName, newVersionString });

    const dismissedKey = `updateNotificationDismissedForVersion_${newVersionString}`;
    if (localStorage.getItem(dismissedKey) === 'true') {
        LoggingService.info(`[Main] Update notification for version ${newVersionString} was previously dismissed by the user. Not showing.`, { functionName });
        return;
    }

    if (updateNotificationElement && updateNotificationElement.parentNode) {
        // If a banner for an *older* update is somehow still showing, remove it.
        if (updateNotificationElement.dataset.version !== newVersionString) {
            updateNotificationElement.parentNode.removeChild(updateNotificationElement);
            updateNotificationElement = null;
        } else {
            // Already showing for current new version, do nothing.
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
    messageP.innerHTML = `� A new version (<strong>v${newVersionString}</strong>) is available! Refresh to get the latest features and improvements.`;

    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'flex-shrink-0 flex flex-col sm:flex-row gap-2 sm:gap-3 items-center mt-2 sm:mt-0';

    
    const refreshButton = document.createElement('button');
    refreshButton.textContent = 'Refresh Now';
    refreshButton.className = 'w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-sky-700 rounded-md hover:bg-sky-100 font-semibold text-xs sm:text-sm shadow-sm';
    refreshButton.onclick = () => {
        LoggingService.info('[Main] User clicked refresh button for update.', { functionName });
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

    messageP.appendChild(document.createElement('br'));
    messageP.appendChild(changelogLink);
    
    buttonsDiv.appendChild(dismissButton);
    buttonsDiv.appendChild(refreshButton);

    containerDiv.appendChild(messageP);
    containerDiv.appendChild(buttonsDiv);
    updateNotificationElement.appendChild(containerDiv);
    document.body.appendChild(updateNotificationElement);

    setTimeout(() => { // Animate in
        if (updateNotificationElement) {
            updateNotificationElement.classList.remove('translate-y-full');
        }
    }, 50);
}


// --- Global Error Handlers ---
window.onerror = function(message, source, lineno, colno, error) {
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    LoggingService.critical('Global uncaught error:', error || new Error(String(message)), {
        source,
        lineno,
        colno,
        errorId,
        type: 'window.onerror'
    });
    showCriticalErrorImported(`An unexpected error occurred. Please report ID: ${errorId}`, errorId);
    return true; 
};

window.onunhandledrejection = function(event) {
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    let errorReason = event.reason;
    if (!(errorReason instanceof Error)) {
        errorReason = new Error(String(errorReason || 'Unknown promise rejection reason'));
    }
    LoggingService.critical('Global unhandled promise rejection:', errorReason, {
        errorId,
        type: 'window.onunhandledrejection'
    });
    showCriticalErrorImported(`An operation failed unexpectedly. Please report ID: ${errorId}`, errorId);
    event.preventDefault(); 
};


document.addEventListener('DOMContentLoaded', async () => {
    LoggingService.info("[Main] DOMContentLoaded event fired. Starting application initialization...");

    try {
        await loadFeatureFlags();
        LoggingService.info("[Main] Feature flags loading process completed.");
        if (isFeatureEnabledFromService('debugMode')) {
            LoggingService.setLevel('DEBUG');
        } else {
            LoggingService.setLevel('INFO');
        }
    }
    catch (e) {
        LoggingService.critical("[Main] CRITICAL: Error loading feature flags!", e);
        showCriticalErrorImported("Failed to load application configuration. Please try again later.", "CONFIG_LOAD_FAIL");
        return; 
    }

    // Load app version *before* potentially starting the update checker
    try {
        await loadAppVersion();
        LoggingService.info(`[Main] Application Version: ${getAppVersionString()} successfully loaded.`);
    } catch (e) {
        LoggingService.error("[Main] Error loading application version. Default will be used.", e);
    }

    try {
        uiRendering = await import('./ui_rendering.js');
        if (uiRendering.showCriticalError) {
            showCriticalErrorImported = uiRendering.showCriticalError;
            LoggingService.info("[Main] showCriticalError function imported from ui_rendering.");
        } else {
            LoggingService.warn("[Main] showCriticalError function not found in ui_rendering.js. Using fallback.");
        }
        if (uiRendering.initializeDOMElements) {
            uiRendering.initializeDOMElements(); 
            LoggingService.info("[Main] DOM elements initialized and initial version rendered.");
        } else {
            throw new Error("initializeDOMElements not found in ui_rendering.js");
        }
    } catch (e) {
        LoggingService.critical("[Main] CRITICAL: Error importing or initializing ui_rendering.js or its DOM elements!", e);
        // Fallback or critical error display logic here if uiRendering.showCriticalErrorImported itself failed
        alert("CRITICAL: UI Initialization Failed. Please refresh. " + e.message);
        return;
    }
    
    // Initialize UserAccountsFeature (Firebase)
    if (typeof window.AppFeatures === 'undefined') window.AppFeatures = {}; 
    window.AppFeatures.UserAccountsFeature = UserAccountsFeature; 
    if (window.AppFeatures.UserAccountsFeature && typeof window.AppFeatures.UserAccountsFeature.initialize === 'function') {
        try {
            LoggingService.info("[Main] Initializing UserAccountsFeature (includes Firebase SDK setup)...");
            window.AppFeatures.UserAccountsFeature.initialize(); // This can now proceed
            LoggingService.info("[Main] UserAccountsFeature initialization complete.");
        } catch (e) { /* ... */ }
    } else { /* ... */ }

    // Initialize Store (after Firebase Auth is ready if store depends on user ID)
    if (AppStore && typeof AppStore.initializeStore === 'function') {
        await AppStore.initializeStore(); 
        LoggingService.info("[Main] AppStore initialized.");
    }
    else { /* ... */ }


    // Start the app update checker if the feature is enabled
    if (isFeatureEnabledFromService('appUpdateNotificationFeature')) {
        if (typeof startUpdateChecker === 'function') {
            LoggingService.info("[Main] Starting application update checker.", { functionName: "DOMContentLoaded" });
            startUpdateChecker(); // from versionService.js
        } else {
            LoggingService.error('[Main] startUpdateChecker function from versionService is not available.', new Error("FunctionMissing"));
        }
    } else {
        LoggingService.info("[Main] Application update checker is disabled by feature flag.", { functionName: "DOMContentLoaded" });
    }

    // Subscribe to new version event
    if (EventBus && typeof EventBus.subscribe === 'function') {
        EventBus.subscribe('newVersionAvailable', (data) => {
            if (isFeatureEnabledFromService('appUpdateNotificationFeature') && data && data.newVersion) {
                showUpdateNotificationBar(data);
            } else if (!isFeatureEnabledFromService('appUpdateNotificationFeature')) {
                LoggingService.debug("[Main] 'newVersionAvailable' event received, but feature is disabled. Notification suppressed.", { functionName: "newVersionAvailable_Subscription" });
            }
        });
        LoggingService.info("[Main] Subscribed to 'newVersionAvailable' event for potential UI updates.", { functionName: "DOMContentLoaded" });
    } else {
        LoggingService.warn('[Main] EventBus not available for newVersionAvailable subscription.');
    }


    if (uiRendering && uiRendering.initializeUiRenderingSubscriptions) {
        uiRendering.initializeUiRenderingSubscriptions();
        LoggingService.info("[Main] UI Rendering event subscriptions initialized.");
    } else { /* ... */ }

    // Initialize other Feature Modules
    window.AppFeatures.ProjectsFeature = ProjectsFeature; 
    // ... (all other AppFeatures assignments) ...
    window.AppFeatures.DataVersioningFeature = DataVersioningFeature;
    window.AppFeatures.DesktopNotificationsFeature = DesktopNotificationsFeature;
    // No specific AppFeature for AppUpdateNotification as its logic is in versionService and main.js

    if (typeof isFeatureEnabledFromService !== 'undefined' && typeof window.AppFeatures !== 'undefined') { 
        LoggingService.info("[Main] Initializing other feature modules..."); 
        for (const featureName in window.AppFeatures) { 
            if (featureName === 'UserAccountsFeature') continue; 

            if (window.AppFeatures.hasOwnProperty(featureName) &&
                window.AppFeatures[featureName] &&
                typeof window.AppFeatures[featureName].initialize === 'function') { 
                let flagKey = featureName.replace(/Feature$/, '').replace(/([A-Z])/g, (match, p1, offset) => (offset > 0 ? "-" : "") + p1.toLowerCase()); 
                const flagMappings = { 
                    "test-button": "testButtonFeature", "reminder": "reminderFeature", /* ... other mappings ... */
                    "desktop-notifications": "desktopNotificationsFeature",
                    // No direct mapping needed for appUpdateNotificationFeature as it's not a standalone module in AppFeatures
                };
                const effectiveFlagKey = flagMappings[flagKey] || flagKey; 
                // Initialize if the feature is explicitly enabled OR if its flag is not in the known list (meaning it's a core/unflagged init)
                // However, for most features, we want to respect the flag.
                if (isFeatureEnabledFromService(effectiveFlagKey) || !Object.keys(AppStore.getFeatureFlags()).includes(effectiveFlagKey) ) { 
                     try {
                        LoggingService.debug(`[Main] Initializing ${featureName} (flag key for check: ${effectiveFlagKey})...`); 
                        window.AppFeatures[featureName].initialize(); 
                    } catch (e) {
                        LoggingService.error(`[Main] Error initializing feature ${featureName}:`, e); 
                    }
                } else {
                     LoggingService.info(`[Main] Skipping initialization of ${featureName} as its flag (${effectiveFlagKey}) is disabled.`);
                }
            }
        }
        LoggingService.info("[Main] Other feature modules initialization process completed."); 
    }

    applyActiveFeatures(); 
    LoggingService.info("[Main] Active features applied to UI (initial)."); 

    if (ViewManager && typeof setFilter === 'function') { 
        setFilter(ViewManager.getCurrentFilter()); 
        LoggingService.info("[Main] Initial filter styles applied."); 
    } else { /* ... */ }

    const savedSidebarState = localStorage.getItem('sidebarState'); 
    if (uiRendering && uiRendering.setSidebarMinimized) { 
        uiRendering.setSidebarMinimized(savedSidebarState === 'minimized'); 
    } else { /* ... */ }

    if (isFeatureEnabledFromService('projectFeature') && window.AppFeatures?.ProjectsFeature) { 
        if(window.AppFeatures.ProjectsFeature.populateProjectFilterList) window.AppFeatures.ProjectsFeature.populateProjectFilterList(); 
        if(window.AppFeatures.ProjectsFeature.populateProjectDropdowns) window.AppFeatures.ProjectsFeature.populateProjectDropdowns(); 
    }

    if (uiRendering && uiRendering.updateSortButtonStates) { 
        uiRendering.updateSortButtonStates(); 
    } else { /* ... */ }

    setupEventListeners(); 
    LoggingService.info("[Main] Global event listeners set up."); 

    LoggingService.info("[Main] Application initialization complete."); 
});

// Ensure global functions are available if not already.
if (typeof window.isFeatureEnabled === 'undefined') window.isFeatureEnabled = isFeatureEnabledFromService;
// ... (other global assignments) ...
if (typeof window.LoggingService === 'undefined') window.LoggingService = LoggingService;