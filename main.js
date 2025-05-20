// main.js
// Main entry point for the application.

import EventBus from './eventBus.js';
import AppStore from './store.js';
import { loadFeatureFlags, isFeatureEnabled as isFeatureEnabledFromService } from './featureFlagService.js';
import * as TaskService from './taskService.js';
import * as ProjectServiceModule from './projectService.js'; // Renamed to avoid conflict with ProjectsFeature variable
import { ProjectsFeature } from './feature_projects.js';
import * as LabelServiceModule from './labelService.js'; // Renamed
import { setupEventListeners, applyActiveFeatures, setFilter } from './ui_event_handlers.js'; // ADDED setFilter import
import ViewManager from './viewManager.js';
import * as BulkActionServiceModule from './bulkActionService.js'; // Renamed
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
import * as ModalInteractions from './modal_interactions.js'; // Keep for now, but its window assignment will be removed
import { TooltipsGuideFeature } from './feature_tooltips_guide.js';
import { SubTasksFeature } from './feature_sub_tasks.js'; // Added import

// Make services/features globally available for non-module scripts during transition (gradually remove these)
if (typeof window.isFeatureEnabled === 'undefined') window.isFeatureEnabled = isFeatureEnabledFromService;
if (typeof window.AppStore === 'undefined') window.AppStore = AppStore;
if (typeof window.EventBus === 'undefined') window.EventBus = EventBus;
if (typeof window.TaskService === 'undefined') window.TaskService = TaskService;
if (typeof window.ProjectService === 'undefined') window.ProjectService = ProjectServiceModule; // Use renamed import
if (typeof window.LabelService === 'undefined') window.LabelService = LabelServiceModule; // Use renamed import
if (typeof window.ViewManager === 'undefined') window.ViewManager = ViewManager;
if (typeof window.BulkActionService === 'undefined') window.BulkActionService = BulkActionServiceModule; // Use renamed import
if (typeof window.ModalStateService === 'undefined') window.ModalStateService = ModalStateService;
if (typeof window.TooltipService === 'undefined') window.TooltipService = TooltipService;

// REMOVED the loop that made ModalInteractions global, as consumers should import them directly.
// for (const key in ModalInteractions) {
//     if (typeof window[key] === 'undefined' && typeof ModalInteractions[key] === 'function') {
//         window[key] = ModalInteractions[key];
//     }
// }


document.addEventListener('DOMContentLoaded', async () => {
    console.log("[Main] DOMContentLoaded event fired. Starting application initialization...");

    // 1. Initialize DOM Element References (Assumes ui_rendering.js exports initializeDOMElements and it's imported OR made global temporarily)
    // For now, main.js expects initializeDOMElements, initializeUiRenderingSubscriptions, styleInitialSmartViewButtons, setSidebarMinimized
    // to be globally available, which means ui_rendering.js should ensure this OR main.js should import them.
    // Let's assume they are made global by ui_rendering.js for this phase if not explicitly imported.
    // To make this cleaner, ui_rendering.js should export them and main.js import them.
    // For now, we proceed assuming they are accessible.
    let uiRendering;
    try {
        uiRendering = await import('./ui_rendering.js');
        if (uiRendering.initializeDOMElements) {
            uiRendering.initializeDOMElements();
            console.log("[Main] DOM elements initialized via import.");
        } else { throw new Error("initializeDOMElements not found in ui_rendering.js"); }
    } catch (e) {
        console.error("[Main] CRITICAL: Error importing or calling initializeDOMElements from ui_rendering.js!", e);
        // Fallback if direct global was intended by user for these (not recommended)
        if (typeof initializeDOMElements === 'function') { initializeDOMElements(); console.log("[Main] DOM elements initialized via assumed global."); }
        else return; // Critical failure
    }


    // 2. Initialize FeatureFlagService and load flags.
    try { await loadFeatureFlags(); console.log("[Main] Feature flags loading process initiated/completed by FeatureFlagService."); }
    catch (e) { console.error("[Main] CRITICAL: Error loading feature flags!", e); return; }

    // 3. Initialize Store
    if (AppStore && typeof AppStore.initializeStore === 'function') { await AppStore.initializeStore(); console.log("[Main] AppStore initialized."); }
    else { console.error("[Main] CRITICAL: AppStore.initializeStore is not available!"); return; }

    // 4. Initialize UI Rendering Event Subscriptions
    if (uiRendering && uiRendering.initializeUiRenderingSubscriptions) {
        uiRendering.initializeUiRenderingSubscriptions();
        console.log("[Main] UI Rendering event subscriptions initialized via import.");
    } else if (typeof initializeUiRenderingSubscriptions === 'function') { // Fallback
        initializeUiRenderingSubscriptions();
        console.log("[Main] UI Rendering event subscriptions initialized via assumed global.");
    } else {
        console.error("[Main] initializeUiRenderingSubscriptions function not found!");
    }

    // 5. Initialize Feature Modules (Assigning to window.AppFeatures for ui_event_handlers.js applyActiveFeatures)
    if (typeof window.AppFeatures === 'undefined') window.AppFeatures = {};
    window.AppFeatures.ProjectsFeature = ProjectsFeature;
    window.AppFeatures.TestButtonFeature = TestButtonFeature;
    window.AppFeatures.ReminderFeature = ReminderFeature;
    window.AppFeatures.AdvancedRecurrenceFeature = AdvancedRecurrenceFeature;
    window.AppFeatures.FileAttachmentsFeature = FileAttachmentsFeature;
    window.AppFeatures.IntegrationsServicesFeature = IntegrationsServicesFeature;
    window.AppFeatures.UserAccountsFeature = UserAccountsFeature;
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
    window.AppFeatures.SubTasksFeature = SubTasksFeature; // Added SubTasksFeature


    if (typeof isFeatureEnabledFromService !== 'undefined' && typeof window.AppFeatures !== 'undefined') {
        console.log("[Main] Initializing feature modules...");
        for (const featureName in window.AppFeatures) {
            if (window.AppFeatures.hasOwnProperty(featureName) &&
                window.AppFeatures[featureName] &&
                typeof window.AppFeatures[featureName].initialize === 'function') {
                // ... (Feature initialization loop as before, using flagMappings and effectiveFlagKey)
                // This loop depends on window.AppFeatures being populated above.
                let flagKey = featureName.replace(/Feature$/, '').replace(/([A-Z])/g, (match, p1, offset) => (offset > 0 ? "-" : "") + p1.toLowerCase());
                const flagMappings = { /* ... as before ... */
                    "test-button": "testButtonFeature", "reminder": "reminderFeature", "task-timer-system": "taskTimerSystem",
                    "advanced-recurrence": "advancedRecurrence", "file-attachments": "fileAttachments",
                    "integrations-services": "integrationsServices", "user-accounts": "userAccounts",
                    "collaboration-sharing": "collaborationSharing", "cross-device-sync": "crossDeviceSync",
                    "tooltips-guide": "tooltipsGuide", "sub-tasks": "subTasksFeature", "kanban-board": "kanbanBoardFeature",
                    "projects": "projectFeature", "export-data": "exportDataFeature", "calendar-view": "calendarViewFeature",
                    "task-dependencies": "taskDependenciesFeature", "smarter-search": "smarterSearchFeature",
                    "bulk-actions": "bulkActionsFeature", "pomodoro-timer-hybrid": "pomodoroTimerHybridFeature"
                };
                const effectiveFlagKey = flagMappings[flagKey] || flagKey;
                if (isFeatureEnabledFromService(effectiveFlagKey) || !Object.keys(AppStore.getFeatureFlags()).includes(effectiveFlagKey) ) {
                    try {
                        console.log(`[Main] Initializing ${featureName} (flag key used for check: ${effectiveFlagKey}, enabled: ${isFeatureEnabledFromService(effectiveFlagKey)})...`);
                        window.AppFeatures[featureName].initialize();
                    } catch (e) { console.error(`[Main] Error initializing feature ${featureName}:`, e); }
                } else { console.log(`[Main] Skipping initialization of ${featureName} as its flag (${effectiveFlagKey}) is disabled.`);}
            }
        }
        console.log("[Main] Feature modules initialization process completed.");
    }

    // 6. Apply Active Features to the UI (initial setup)
    applyActiveFeatures(); // Imported from ui_event_handlers.js
    console.log("[Main] Active features applied to UI (initial).");

    // 7. Style Initial UI Elements for Filters
    if (ViewManager && typeof setFilter === 'function') { // Use imported setFilter
        setFilter(ViewManager.getCurrentFilter());
        console.log("[Main] Initial filter styles applied.");
    } else {
        // Fallback or log if ViewManager or setFilter is not available
        // The original styleInitialSmartViewButtons might have done more, review ui_rendering.js if needed
        if (uiRendering && uiRendering.styleInitialSmartViewButtons) {
             uiRendering.styleInitialSmartViewButtons(); // If it does something beyond what setFilter(currentFilter) does
        }
        console.warn("[Main] ViewManager or setFilter not fully available for initial styling.");
    }


    // 8. Set Initial Sidebar State
    const savedSidebarState = localStorage.getItem('sidebarState');
    if (uiRendering && uiRendering.setSidebarMinimized) {
        uiRendering.setSidebarMinimized(savedSidebarState === 'minimized');
    } else if (typeof setSidebarMinimized === 'function') { // Fallback
        setSidebarMinimized(savedSidebarState === 'minimized');
    }


    // 9. Populate Project-Specific UI (if feature enabled)
    // ProjectsFeature is already on window.AppFeatures, and its initialize would have run.
    // If specific population needs to happen after everything else, it can be called here.
    // The event subscriptions in feature_projects.js should handle population when data changes.
    if (isFeatureEnabledFromService('projectFeature') && window.AppFeatures?.ProjectsFeature) {
        if(window.AppFeatures.ProjectsFeature.populateProjectFilterList) window.AppFeatures.ProjectsFeature.populateProjectFilterList();
        if(window.AppFeatures.ProjectsFeature.populateProjectDropdowns) window.AppFeatures.ProjectsFeature.populateProjectDropdowns();
    }

    // 10. Set Initial Filter UI (active buttons) - This is now covered by step 7 using imported setFilter

    // 11. Update other initial button states (e.g., sort buttons)
    if (uiRendering && uiRendering.updateSortButtonStates) {
        uiRendering.updateSortButtonStates();
    } else if (typeof updateSortButtonStates === 'function') { // Fallback
        updateSortButtonStates();
    }
    // updateClearCompletedButtonState is usually based on task data, will be updated by events.

    // 12. Setup All Global Event Listeners
    setupEventListeners(); // Imported from ui_event_handlers.js
    console.log("[Main] Global event listeners set up.");
});