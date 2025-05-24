// main.js
// Main entry point for the application.

import EventBus from './eventBus.js';
import AppStore from './store.js';
import { loadFeatureFlags, isFeatureEnabled as isFeatureEnabledFromService } from './featureFlagService.js';
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
import { ContactUsFeature } from './feature_contact_us.js'; // Added new feature import

// NEW: Import LoggingService and LOG_LEVELS
import LoggingService, { LOG_LEVELS } from './loggingService.js';

// Placeholder for showCriticalError - this function would be in ui_rendering.js
// For now, we'll define a simple global fallback if it's not imported,
// but ideally, ui_rendering.js should export it.
let showCriticalErrorImported = (message, errorId) => {
    console.error(`CRITICAL ERROR (display): ${message}, ID: ${errorId}`);
    // In a real scenario, this would update a dedicated UI element.
    // Fallback alert for demonstration if the UI element isn't ready:
    // alert(`Critical Error: ${message}\nError ID: ${errorId}\nSee console for more details.`);
};

// Make services/features globally available for non-module scripts during transition (gradually remove these)
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
// NEW: Make LoggingService globally available (optional, but can be useful for debugging from console)
if (typeof window.LoggingService === 'undefined') window.LoggingService = LoggingService;


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
    // Use the imported or placeholder function for displaying the error
    showCriticalErrorImported(`An unexpected error occurred. Please report ID: ${errorId}`, errorId);
    return true; // Prevents the default browser error handling
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
    // Use the imported or placeholder function for displaying the error
    showCriticalErrorImported(`An operation failed unexpectedly. Please report ID: ${errorId}`, errorId);
    event.preventDefault(); // Prevents default browser handling
};


document.addEventListener('DOMContentLoaded', async () => {
    LoggingService.info("[Main] DOMContentLoaded event fired. Starting application initialization..."); // MODIFIED

    // 1. Initialize DOM Element References
    let uiRendering;
    try {
        uiRendering = await import('./ui_rendering.js');
        if (uiRendering.initializeDOMElements) {
            uiRendering.initializeDOMElements();
            LoggingService.info("[Main] DOM elements initialized via import."); // MODIFIED
        } else {
            throw new Error("initializeDOMElements not found in ui_rendering.js");
        }
        // Attempt to import showCriticalError properly
        if (uiRendering.showCriticalError) {
            showCriticalErrorImported = uiRendering.showCriticalError;
            LoggingService.info("[Main] showCriticalError function imported from ui_rendering."); // MODIFIED
        } else {
            LoggingService.warn("[Main] showCriticalError function not found in ui_rendering.js. Using fallback."); // MODIFIED
        }
    } catch (e) {
        LoggingService.critical("[Main] CRITICAL: Error importing or calling initializeDOMElements from ui_rendering.js!", e); // MODIFIED
        if (typeof initializeDOMElements === 'function') {
             initializeDOMElements();
             LoggingService.info("[Main] DOM elements initialized via assumed global (fallback)."); // MODIFIED
        } else {
            LoggingService.critical("[Main] Application cannot start: DOM initialization failed."); // MODIFIED
            return;
        }
    }

    // 2. Initialize FeatureFlagService and load flags.
    try {
        await loadFeatureFlags(); //
        LoggingService.info("[Main] Feature flags loading process initiated/completed by FeatureFlagService."); // MODIFIED
        // NEW: Set LoggingService level based on 'debugMode' feature flag
        if (isFeatureEnabledFromService('debugMode')) { // Assuming 'debugMode' is a flag you might add to features.json
            LoggingService.setLevel('DEBUG');
        } else {
            LoggingService.setLevel('INFO'); // Default production level
        }
    }
    catch (e) {
        LoggingService.critical("[Main] CRITICAL: Error loading feature flags!", e); // MODIFIED
        return;
    }

    // 3. Initialize Store
    if (AppStore && typeof AppStore.initializeStore === 'function') {
        await AppStore.initializeStore(); //
        LoggingService.info("[Main] AppStore initialized."); // MODIFIED
    }
    else {
        LoggingService.critical("[Main] CRITICAL: AppStore.initializeStore is not available!"); // MODIFIED
        return;
    }

    // 4. Initialize UI Rendering Event Subscriptions
    if (uiRendering && uiRendering.initializeUiRenderingSubscriptions) {
        uiRendering.initializeUiRenderingSubscriptions(); //
        LoggingService.info("[Main] UI Rendering event subscriptions initialized via import."); // MODIFIED
    } else if (typeof initializeUiRenderingSubscriptions === 'function') { // Fallback
        initializeUiRenderingSubscriptions();
        LoggingService.info("[Main] UI Rendering event subscriptions initialized via assumed global."); // MODIFIED
    } else {
        LoggingService.error("[Main] initializeUiRenderingSubscriptions function not found!"); // MODIFIED
    }

    // 5. Initialize Feature Modules
    if (typeof window.AppFeatures === 'undefined') window.AppFeatures = {}; //
    window.AppFeatures.ProjectsFeature = ProjectsFeature; //
    window.AppFeatures.TestButtonFeature = TestButtonFeature; //
    window.AppFeatures.ReminderFeature = ReminderFeature; //
    window.AppFeatures.AdvancedRecurrenceFeature = AdvancedRecurrenceFeature; //
    window.AppFeatures.FileAttachmentsFeature = FileAttachmentsFeature; //
    window.AppFeatures.IntegrationsServicesFeature = IntegrationsServicesFeature; //
    window.AppFeatures.UserAccountsFeature = UserAccountsFeature; //
    window.AppFeatures.CollaborationSharingFeature = CollaborationSharingFeature; //
    window.AppFeatures.CrossDeviceSyncFeature = CrossDeviceSyncFeature; //
    window.AppFeatures.TaskDependenciesFeature = TaskDependenciesFeature; //
    window.AppFeatures.SmarterSearchFeature = SmarterSearchFeature; //
    window.AppFeatures.DataManagementFeature = DataManagementFeature; //
    window.AppFeatures.CalendarViewFeature = CalendarViewFeature; //
    window.AppFeatures.TaskTimerSystemFeature = TaskTimerSystemFeature; //
    window.AppFeatures.KanbanBoardFeature = KanbanBoardFeature; //
    window.AppFeatures.PomodoroTimerHybridFeature = PomodoroTimerHybridFeature; //
    window.AppFeatures.TooltipsGuideFeature = TooltipsGuideFeature; //
    window.AppFeatures.SubTasksFeature = SubTasksFeature; //
    window.AppFeatures.BackgroundFeature = BackgroundFeature; //
    window.AppFeatures.ContactUsFeature = ContactUsFeature; // Added new feature module


    if (typeof isFeatureEnabledFromService !== 'undefined' && typeof window.AppFeatures !== 'undefined') { //
        LoggingService.info("[Main] Initializing feature modules..."); // MODIFIED
        for (const featureName in window.AppFeatures) { //
            if (window.AppFeatures.hasOwnProperty(featureName) &&
                window.AppFeatures[featureName] &&
                typeof window.AppFeatures[featureName].initialize === 'function') { //
                let flagKey = featureName.replace(/Feature$/, '').replace(/([A-Z])/g, (match, p1, offset) => (offset > 0 ? "-" : "") + p1.toLowerCase()); //
                const flagMappings = { //
                    "test-button": "testButtonFeature", "reminder": "reminderFeature", "task-timer-system": "taskTimerSystem", //
                    "advanced-recurrence": "advancedRecurrence", "file-attachments": "fileAttachments", //
                    "integrations-services": "integrationsServices", "user-accounts": "userAccounts", //
                    "collaboration-sharing": "collaborationSharing", "cross-device-sync": "crossDeviceSync", //
                    "tooltips-guide": "tooltipsGuide", "sub-tasks": "subTasksFeature", "kanban-board": "kanbanBoardFeature", //
                    "projects": "projectFeature", "export-data": "exportDataFeature", "calendar-view": "calendarViewFeature", //
                    "task-dependencies": "taskDependenciesFeature", "smarter-search": "smarterSearchFeature", //
                    "bulk-actions": "bulkActionsFeature", "pomodoro-timer-hybrid": "pomodoroTimerHybridFeature", //
                    "background": "backgroundFeature", "contact-us": "contactUsFeature" // Added mapping
                };
                const effectiveFlagKey = flagMappings[flagKey] || flagKey; //
                if (isFeatureEnabledFromService(effectiveFlagKey) || !Object.keys(AppStore.getFeatureFlags()).includes(effectiveFlagKey) ) { //
                    try {
                        LoggingService.debug(`[Main] Initializing ${featureName} (flag key used for check: ${effectiveFlagKey}, enabled: ${isFeatureEnabledFromService(effectiveFlagKey)})...`); // MODIFIED
                        window.AppFeatures[featureName].initialize(); //
                    } catch (e) {
                        LoggingService.error(`[Main] Error initializing feature ${featureName}:`, e); // MODIFIED
                    }
                } else {
                    LoggingService.info(`[Main] Skipping initialization of ${featureName} as its flag (${effectiveFlagKey}) is disabled.`); // MODIFIED
                }
            }
        }
        LoggingService.info("[Main] Feature modules initialization process completed."); // MODIFIED
    }

    // 6. Apply Active Features to the UI (initial setup)
    applyActiveFeatures(); //
    LoggingService.info("[Main] Active features applied to UI (initial)."); // MODIFIED

    // 7. Style Initial UI Elements for Filters
    if (ViewManager && typeof setFilter === 'function') { //
        setFilter(ViewManager.getCurrentFilter()); //
        LoggingService.info("[Main] Initial filter styles applied."); // MODIFIED
    } else {
        if (uiRendering && uiRendering.styleInitialSmartViewButtons) { //
             uiRendering.styleInitialSmartViewButtons(); //
        }
        LoggingService.warn("[Main] ViewManager or setFilter not fully available for initial styling."); // MODIFIED
    }


    // 8. Set Initial Sidebar State
    const savedSidebarState = localStorage.getItem('sidebarState'); //
    if (uiRendering && uiRendering.setSidebarMinimized) { //
        uiRendering.setSidebarMinimized(savedSidebarState === 'minimized'); //
    } else if (typeof setSidebarMinimized === 'function') { // Fallback
        setSidebarMinimized(savedSidebarState === 'minimized'); //
    }


    // 9. Populate Project-Specific UI (if feature enabled)
    if (isFeatureEnabledFromService('projectFeature') && window.AppFeatures?.ProjectsFeature) { //
        if(window.AppFeatures.ProjectsFeature.populateProjectFilterList) window.AppFeatures.ProjectsFeature.populateProjectFilterList(); //
        if(window.AppFeatures.ProjectsFeature.populateProjectDropdowns) window.AppFeatures.ProjectsFeature.populateProjectDropdowns(); //
    }

    // 10. Set Initial Filter UI (active buttons) - This is now covered by step 7 using imported setFilter

    // 11. Update other initial button states (e.g., sort buttons)
    if (uiRendering && uiRendering.updateSortButtonStates) { //
        uiRendering.updateSortButtonStates(); //
    } else if (typeof updateSortButtonStates === 'function') { // Fallback
        updateSortButtonStates(); //
    }

    // 12. Setup All Global Event Listeners
    setupEventListeners(); //
    LoggingService.info("[Main] Global event listeners set up."); // MODIFIED

    LoggingService.info("[Main] Application initialization complete."); // NEW
});