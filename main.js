// main.js
// Main entry point for the application.

import EventBus from './eventBus.js';
import AppStore from './store.js';
import { loadFeatureFlags, isFeatureEnabled as isFeatureEnabledFromService } from './featureFlagService.js';
import * as TaskService from './taskService.js';
import * as ProjectServiceModule from './projectService.js';
import { ProjectsFeature } from './feature_projects.js';
import * as LabelServiceModule from './labelService.js';
import { setupEventListeners, applyActiveFeatures } from './ui_event_handlers.js';
import ViewManager from './viewManager.js';
import * as BulkActionServiceModule from './bulkActionService.js';
import ModalStateService from './modalStateService.js';
import TooltipService from './tooltipService.js'; // Corrected import
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
import { TooltipsGuideFeature } from './feature_tooltips_guide.js'; // <-- ADDED IMPORT

// Make services/features globally available for non-module scripts during transition
if (typeof window.isFeatureEnabled === 'undefined') window.isFeatureEnabled = isFeatureEnabledFromService;
if (typeof window.AppStore === 'undefined') window.AppStore = AppStore;
if (typeof window.EventBus === 'undefined') window.EventBus = EventBus;
if (typeof window.TaskService === 'undefined') window.TaskService = TaskService;
if (typeof window.ProjectService === 'undefined') window.ProjectService = ProjectServiceModule;
if (typeof window.LabelService === 'undefined') window.LabelService = LabelServiceModule;
if (typeof window.ViewManager === 'undefined') window.ViewManager = ViewManager;
if (typeof window.BulkActionService === 'undefined') window.BulkActionService = BulkActionServiceModule;
if (typeof window.ModalStateService === 'undefined') window.ModalStateService = ModalStateService;
if (typeof window.TooltipService === 'undefined') window.TooltipService = TooltipService; // This service is for the timeout, distinct from the guide feature

for (const key in ModalInteractions) {
    if (typeof window[key] === 'undefined' && typeof ModalInteractions[key] === 'function') {
        window[key] = ModalInteractions[key];
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    console.log("[Main] DOMContentLoaded event fired. Starting application initialization...");

    // 1. Initialize DOM Element References (Assumes ui_rendering.js makes initializeDOMElements global)
    if (typeof initializeDOMElements === 'function') { initializeDOMElements(); console.log("[Main] DOM elements initialized."); }
    else { console.error("[Main] CRITICAL: initializeDOMElements function is not defined!"); return; }

    // 2. Initialize FeatureFlagService and load flags.
    try { await loadFeatureFlags(); console.log("[Main] Feature flags loading process initiated/completed by FeatureFlagService."); }
    catch (e) { console.error("[Main] CRITICAL: Error loading feature flags!", e); return; }

    // 3. Initialize Store
    if (AppStore && typeof AppStore.initializeStore === 'function') { await AppStore.initializeStore(); console.log("[Main] AppStore initialized."); }
    else { console.error("[Main] CRITICAL: AppStore.initializeStore is not available!"); return; }

    // 4. Initialize UI Rendering Event Subscriptions (Assumes ui_rendering.js makes initializeUiRenderingSubscriptions global)
    if (typeof initializeUiRenderingSubscriptions === 'function') { initializeUiRenderingSubscriptions(); console.log("[Main] UI Rendering event subscriptions initialized."); }
    else { console.error("[Main] initializeUiRenderingSubscriptions function not found!"); }

    // 5. Initialize Feature Modules
    if (typeof window.AppFeatures === 'undefined') window.AppFeatures = {};
    window.AppFeatures.ProjectsFeature = ProjectsFeature; // Note: Corrected to match export from feature_projects.js
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
    window.AppFeatures.TooltipsGuideFeature = TooltipsGuideFeature; // <-- ASSIGNED THE IMPORTED MODULE

    if (typeof isFeatureEnabledFromService !== 'undefined' && typeof window.AppFeatures !== 'undefined') {
        console.log("[Main] Initializing feature modules...");
        for (const featureName in window.AppFeatures) {
            // Check if the property is directly on AppFeatures and if it's an object with an initialize method
            if (window.AppFeatures.hasOwnProperty(featureName) &&
                window.AppFeatures[featureName] &&
                typeof window.AppFeatures[featureName].initialize === 'function') {

                // Create a kebab-case flag key from the featureName (e.g., TestButtonFeature -> test-button-feature)
                // More robust mapping might be needed if names don't follow a strict pattern.
                let flagKey = featureName
                    .replace(/Feature$/, '') // Remove 'Feature' suffix
                    .replace(/([A-Z])/g, (match, p1, offset) => (offset > 0 ? "-" : "") + p1.toLowerCase()); // Convert to kebab-case

                // Specific mappings if kebab-case isn't the direct flag name
                const flagMappings = {
                    "test-button": "testButtonFeature",
                    "reminder": "reminderFeature",
                    "task-timer-system": "taskTimerSystem",
                    "advanced-recurrence": "advancedRecurrence",
                    "file-attachments": "fileAttachments",
                    "integrations-services": "integrationsServices",
                    "user-accounts": "userAccounts",
                    "collaboration-sharing": "collaborationSharing",
                    "cross-device-sync": "crossDeviceSync",
                    "tooltips-guide": "tooltipsGuide",
                    "sub-tasks": "subTasksFeature", // Assuming feature_sub_tasks.js exports SubTasksFeature
                    "kanban-board": "kanbanBoardFeature",
                    "projects": "projectFeature",
                    "export-data": "exportDataFeature", // Assuming this is the flag for DataManagementFeature
                    "calendar-view": "calendarViewFeature",
                    "task-dependencies": "taskDependenciesFeature",
                    "smarter-search": "smarterSearchFeature",
                    "bulk-actions": "bulkActionsFeature", // Assuming BulkActionService also has an AppFeatures entry
                    "pomodoro-timer-hybrid": "pomodoroTimerHybridFeature"
                };
                // Correct the flagKey based on mappings if it exists, otherwise use the auto-generated one
                const effectiveFlagKey = flagMappings[flagKey] || flagKey;

                // Check if the feature is enabled OR if the flag doesn't exist in the loaded flags (failsafe for new/unlisted flags)
                if (isFeatureEnabledFromService(effectiveFlagKey) || !Object.keys(AppStore.getFeatureFlags()).includes(effectiveFlagKey) ) {
                    try {
                        console.log(`[Main] Initializing ${featureName} (flag key used for check: ${effectiveFlagKey}, enabled: ${isFeatureEnabledFromService(effectiveFlagKey)})...`);
                        window.AppFeatures[featureName].initialize();
                    } catch (e) {
                        console.error(`[Main] Error initializing feature ${featureName}:`, e);
                    }
                } else {
                     console.log(`[Main] Skipping initialization of ${featureName} as its flag (${effectiveFlagKey}) is disabled.`);
                }
            }
        }
        console.log("[Main] Feature modules initialization process completed.");
    }

    // 6. Apply Active Features to the UI (initial setup)
    applyActiveFeatures();
    console.log("[Main] Active features applied to UI (initial).");

    // 7. Style Initial UI Elements (Assumes ui_rendering.js makes styleInitialSmartViewButtons global)
    if (typeof styleInitialSmartViewButtons === 'function') styleInitialSmartViewButtons();

    // 8. Set Initial Sidebar State (Assumes ui_rendering.js makes setSidebarMinimized global)
    const savedSidebarState = localStorage.getItem('sidebarState');
    if (typeof setSidebarMinimized === 'function') setSidebarMinimized(savedSidebarState === 'minimized');

    // 9. Populate Project-Specific UI (if feature enabled)
    if (isFeatureEnabledFromService('projectFeature') && window.AppFeatures?.ProjectsFeature) { // Changed to ProjectsFeature
        if(window.AppFeatures.ProjectsFeature.populateProjectFilterList) window.AppFeatures.ProjectsFeature.populateProjectFilterList();
        if(window.AppFeatures.ProjectsFeature.populateProjectDropdowns) window.AppFeatures.ProjectsFeature.populateProjectDropdowns();
    }

    // 10. Set Initial Filter UI (active buttons) (Assumes ui_event_handlers.js makes setFilter global)
    if (typeof ViewManager !== 'undefined' && typeof setFilter === 'function') {
        setFilter(ViewManager.getCurrentFilter());
    }

    // 11. Update other initial button states (Assumes ui_rendering.js makes these global)
    if (typeof updateSortButtonStates === 'function') updateSortButtonStates();
    if (typeof updateClearCompletedButtonState === 'function') updateClearCompletedButtonState();

    // 12. Setup All Global Event Listeners
    setupEventListeners();
    console.log("[Main] Global event listeners set up.");
});