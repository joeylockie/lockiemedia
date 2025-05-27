// main.js
// Main entry point for the application.

import EventBus from './eventBus.js';
import AppStore from './store.js';
import { loadFeatureFlags, isFeatureEnabled as isFeatureEnabledFromService } from './featureFlagService.js';
import { loadAppVersion, getAppVersionString } from './versionService.js';
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
// NEW: Import firebaseService (though it's not directly initialized here, ensure it's part of the build/load order)
import * as firebaseService from './firebaseService.js';


let uiRendering;

let showCriticalErrorImported = (message, errorId) => {
    console.error(`CRITICAL ERROR (display): ${message}, ID: ${errorId}`);
};

// Make services/features globally available
if (typeof window.isFeatureEnabled === 'undefined') window.isFeatureEnabled = isFeatureEnabledFromService;
if (typeof window.AppStore === 'undefined') window.AppStore = AppStore;
if (typeof window.EventBus === 'undefined') window.EventBus = EventBus;
if (typeof window.TaskService === 'undefined') window.TaskService = TaskService;
if (typeof window.ProjectService === 'undefined') window.ProjectService = ProjectServiceModule;
if (typeof window.LabelService === 'undefined') window.LabelService = LabelServiceModule;
if (typeof window.ViewManager === 'undefined') window.ViewManager = ViewManager;
if (typeof window.BulkActionService === 'undefined') window.BulkActionService = BulkActionServiceModule;
if (typeof window.ModalStateService === 'undefined') window.ModalStateService = ModalStateService;
if (typeof window.TooltipService === 'undefined') window.TooltipService = TooltipService;
if (typeof window.LoggingService === 'undefined') window.LoggingService = LoggingService;
// NEW: Make firebaseService globally available if needed by other modules directly (optional)
if (typeof window.firebaseService === 'undefined') window.firebaseService = firebaseService;


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
        if (typeof initializeDOMElements === 'function') { 
             initializeDOMElements();
             LoggingService.info("[Main] DOM elements initialized via assumed global (fallback).");
        } else {
            showCriticalErrorImported("Failed to initialize UI components. Please try again later.", "UI_INIT_FAIL");
            LoggingService.critical("[Main] Application cannot start: DOM/UI initialization failed.");
            return;
        }
    }
    
    // Initialize UserAccountsFeature (which initializes Firebase App, Auth, Firestore)
    // This needs to happen BEFORE AppStore.initializeStore if initializeStore might try to access Firebase user state
    // or if onAuthStateChanged is expected to fire and load data immediately.
    if (typeof window.AppFeatures === 'undefined') window.AppFeatures = {}; 
    window.AppFeatures.UserAccountsFeature = UserAccountsFeature; 
    // Only initialize if the feature is enabled (or always initialize to set up auth listeners?)
    // For now, let's initialize it if the module exists, its internal `initialize` will check the flag for UI.
    // The key is that Firebase SDKs are initialized for other services like `store.js` to use `firebase.auth()`.
    if (window.AppFeatures.UserAccountsFeature && typeof window.AppFeatures.UserAccountsFeature.initialize === 'function') {
        try {
            LoggingService.info("[Main] Initializing UserAccountsFeature (which includes Firebase SDK setup)...");
            window.AppFeatures.UserAccountsFeature.initialize();
            LoggingService.info("[Main] UserAccountsFeature initialization complete.");
        } catch (e) {
            LoggingService.critical("[Main] CRITICAL: Error initializing UserAccountsFeature!", e);
            showCriticalErrorImported("Failed to initialize user authentication system.", "AUTH_INIT_FAIL");
            return; // Potentially stop if auth is critical
        }
    } else {
        LoggingService.warn("[Main] UserAccountsFeature or its initialize function not found. Firebase dependent features might not work.");
    }

    // Initialize Store
    // AppStore.initializeStore is now async
    if (AppStore && typeof AppStore.initializeStore === 'function') {
        await AppStore.initializeStore(); // Now awaits, which is good as it might do async work
        LoggingService.info("[Main] AppStore initialized.");
    }
    else {
        LoggingService.critical("[Main] CRITICAL: AppStore.initializeStore is not available!");
        showCriticalErrorImported("Failed to load application data. Please try again later.", "STORE_INIT_FAIL");
        return;
    }

    if (uiRendering && uiRendering.initializeUiRenderingSubscriptions) {
        uiRendering.initializeUiRenderingSubscriptions();
        LoggingService.info("[Main] UI Rendering event subscriptions initialized.");
    } else if (typeof initializeUiRenderingSubscriptions === 'function') {
        initializeUiRenderingSubscriptions();
        LoggingService.info("[Main] UI Rendering event subscriptions initialized via assumed global.");
    } else {
        LoggingService.error("[Main] initializeUiRenderingSubscriptions function not found!");
    }

    // Initialize other Feature Modules
    window.AppFeatures.ProjectsFeature = ProjectsFeature; 
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
    window.AppFeatures.TooltipsGuideFeature = TooltipsGuideFeature; 
    window.AppFeatures.SubTasksFeature = SubTasksFeature; 
    window.AppFeatures.BackgroundFeature = BackgroundFeature; 
    window.AppFeatures.ContactUsFeature = ContactUsFeature; 
    window.AppFeatures.SocialMediaLinksFeature = SocialMediaLinksFeature; 
    window.AppFeatures.AboutUsFeature = AboutUsFeature; 
    window.AppFeatures.DataVersioningFeature = DataVersioningFeature;

    if (typeof isFeatureEnabledFromService !== 'undefined' && typeof window.AppFeatures !== 'undefined') { 
        LoggingService.info("[Main] Initializing other feature modules..."); 
        for (const featureName in window.AppFeatures) { 
            if (featureName === 'UserAccountsFeature') continue; // Already initialized

            if (window.AppFeatures.hasOwnProperty(featureName) &&
                window.AppFeatures[featureName] &&
                typeof window.AppFeatures[featureName].initialize === 'function') { 
                let flagKey = featureName.replace(/Feature$/, '').replace(/([A-Z])/g, (match, p1, offset) => (offset > 0 ? "-" : "") + p1.toLowerCase()); 
                const flagMappings = { 
                    "test-button": "testButtonFeature", "reminder": "reminderFeature", "task-timer-system": "taskTimerSystem", 
                    "advanced-recurrence": "advancedRecurrence", "file-attachments": "fileAttachments", 
                    "integrations-services": "integrationsServices", "user-accounts": "userAccounts",
                    "collaboration-sharing": "collaborationSharing", "cross-device-sync": "crossDeviceSync", 
                    "tooltips-guide": "tooltipsGuide", "sub-tasks": "subTasksFeature", "kanban-board": "kanbanBoardFeature", 
                    "projects": "projectFeature", "export-data": "exportDataFeature", "calendar-view": "calendarViewFeature", 
                    "task-dependencies": "taskDependenciesFeature", "smarter-search": "smarterSearchFeature", 
                    "bulk-actions": "bulkActionsFeature", "pomodoro-timer-hybrid": "pomodoroTimerHybridFeature", 
                    "background": "backgroundFeature", "contact-us": "contactUsFeature", 
                    "social-media-links": "socialMediaLinksFeature", "about-us": "aboutUsFeature", 
                    "data-versioning": "dataVersioningFeature"
                };
                const effectiveFlagKey = flagMappings[flagKey] || flagKey; 
                if (isFeatureEnabledFromService(effectiveFlagKey) || !Object.keys(AppStore.getFeatureFlags()).includes(effectiveFlagKey) ) { 
                    try {
                        LoggingService.debug(`[Main] Initializing ${featureName} (flag key used for check: ${effectiveFlagKey}, enabled: ${isFeatureEnabledFromService(effectiveFlagKey)})...`); 
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
    } else {
        if (uiRendering && uiRendering.styleInitialSmartViewButtons) { 
             uiRendering.styleInitialSmartViewButtons(); 
        }
        LoggingService.warn("[Main] ViewManager or setFilter not fully available for initial styling."); 
    }

    const savedSidebarState = localStorage.getItem('sidebarState'); 
    if (uiRendering && uiRendering.setSidebarMinimized) { 
        uiRendering.setSidebarMinimized(savedSidebarState === 'minimized'); 
    } else if (typeof setSidebarMinimized === 'function') { 
        setSidebarMinimized(savedSidebarState === 'minimized'); 
    }

    if (isFeatureEnabledFromService('projectFeature') && window.AppFeatures?.ProjectsFeature) { 
        if(window.AppFeatures.ProjectsFeature.populateProjectFilterList) window.AppFeatures.ProjectsFeature.populateProjectFilterList(); 
        if(window.AppFeatures.ProjectsFeature.populateProjectDropdowns) window.AppFeatures.ProjectsFeature.populateProjectDropdowns(); 
    }

    if (uiRendering && uiRendering.updateSortButtonStates) { 
        uiRendering.updateSortButtonStates(); 
    } else if (typeof updateSortButtonStates === 'function') { 
        updateSortButtonStates(); 
    }

    setupEventListeners(); 
    LoggingService.info("[Main] Global event listeners set up."); 

    LoggingService.info("[Main] Application initialization complete."); 
});