// main.js
// Main entry point for the application.

import EventBus from './eventBus.js'; 
import AppStore from './store.js'; 
import { loadFeatureFlags, isFeatureEnabled as isFeatureEnabledFromService } from './featureFlagService.js'; 
import * as TaskService from './taskService.js'; 
import * as ProjectServiceModule from './projectService.js'; 
import { ProjectsFeature } from './feature_projects.js';
import * as LabelServiceModule from './labelService.js';
import ViewManager from './viewManager.js';
import * as BulkActionServiceModule from './bulkActionService.js';
import ModalStateService from './modalStateService.js';
import TooltipService from './tooltipService.js';
import { TestButtonFeature } from './feature_test_button.js';
import { ReminderFeature } from './feature_reminder.js';
import { AdvancedRecurrenceFeature } from './feature_advanced_recurrence.js'; // Import
import * as ModalInteractions from './modal_interactions.js';


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
if (typeof window.TooltipService === 'undefined') window.TooltipService = TooltipService;

for (const key in ModalInteractions) { 
    if (typeof window[key] === 'undefined' && typeof ModalInteractions[key] === 'function') {
        window[key] = ModalInteractions[key];
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    console.log("[Main] DOMContentLoaded event fired. Starting application initialization...");

    // 1. Initialize DOM Element References
    if (typeof initializeDOMElements === 'function') { initializeDOMElements(); console.log("[Main] DOM elements initialized."); } 
    else { console.error("[Main] CRITICAL: initializeDOMElements function is not defined!"); return; }

    // 2. Initialize FeatureFlagService and load flags.
    try { await loadFeatureFlags(); console.log("[Main] Feature flags loading process initiated/completed by FeatureFlagService."); } 
    catch (e) { console.error("[Main] CRITICAL: Error loading feature flags!", e); return; }
    
    // 3. Initialize Store
    if (AppStore && typeof AppStore.initializeStore === 'function') { await AppStore.initializeStore(); console.log("[Main] AppStore initialized."); } 
    else { console.error("[Main] CRITICAL: AppStore.initializeStore is not available!"); return; }

    // 4. Initialize UI Rendering Event Subscriptions
    if (typeof initializeUiRenderingSubscriptions === 'function') { initializeUiRenderingSubscriptions(); console.log("[Main] UI Rendering event subscriptions initialized."); } 
    else { console.error("[Main] initializeUiRenderingSubscriptions function not found!"); }

    // 5. Initialize Feature Modules
    if (typeof window.AppFeatures === 'undefined') window.AppFeatures = {};
    window.AppFeatures.Projects = ProjectsFeature; 
    window.AppFeatures.TestButtonFeature = TestButtonFeature;
    window.AppFeatures.ReminderFeature = ReminderFeature;
    window.AppFeatures.AdvancedRecurrenceFeature = AdvancedRecurrenceFeature; // Assign imported feature

    if (typeof isFeatureEnabledFromService !== 'undefined' && typeof window.AppFeatures !== 'undefined') {
        console.log("[Main] Initializing feature modules...");
        for (const featureName in window.AppFeatures) {
            if (window.AppFeatures.hasOwnProperty(featureName) && window.AppFeatures[featureName] && typeof window.AppFeatures[featureName].initialize === 'function') {
                const flagKey = featureName.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, '').replace(/_feature$/, 'Feature');
                let effectiveFlagKey = flagKey;
                if (flagKey === "reminder_feature") effectiveFlagKey = "reminderFeature";
                if (flagKey === "test_button_feature") effectiveFlagKey = "testButtonFeature";
                if (flagKey === "advanced_recurrence_feature") effectiveFlagKey = "advancedRecurrence"; // Map to correct flag name
                
                if (isFeatureEnabledFromService(effectiveFlagKey) || !Object.keys(AppStore.getFeatureFlags()).includes(effectiveFlagKey) ) { 
                    try {
                        console.log(`[Main] Initializing ${featureName} (flag: ${effectiveFlagKey}, enabled: ${isFeatureEnabledFromService(effectiveFlagKey)})...`);
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
    if (typeof applyActiveFeatures === 'function') { applyActiveFeatures(); console.log("[Main] Active features applied to UI (initial)."); } 
    else { console.error("[Main] applyActiveFeatures function not found!"); if(typeof refreshTaskView === 'function') refreshTaskView(); }

    // 7. Style Initial UI Elements
    if (typeof styleInitialSmartViewButtons === 'function') styleInitialSmartViewButtons();

    // 8. Set Initial Sidebar State
    const savedSidebarState = localStorage.getItem('sidebarState');
    if (typeof setSidebarMinimized === 'function') setSidebarMinimized(savedSidebarState === 'minimized');

    // 9. Populate Project-Specific UI (if feature enabled)
    if (isFeatureEnabledFromService('projectFeature') && window.AppFeatures?.Projects) {
        if(window.AppFeatures.Projects.populateProjectFilterList) window.AppFeatures.Projects.populateProjectFilterList();
        if(window.AppFeatures.Projects.populateProjectDropdowns) window.AppFeatures.Projects.populateProjectDropdowns();
    }
    
    // 10. Set Initial Filter UI (active buttons)
    if (typeof ViewManager !== 'undefined' && typeof setFilter === 'function') { 
        setFilter(ViewManager.getCurrentFilter());
    }

    // 11. Update other initial button states
    if (typeof updateSortButtonStates === 'function') updateSortButtonStates();
    if (typeof updateClearCompletedButtonState === 'function') updateClearCompletedButtonState();

    // 12. Setup All Global Event Listeners
    if (typeof setupEventListeners === 'function') { setupEventListeners(); console.log("[Main] Global event listeners set up."); } 
    else { console.error("[Main] setupEventListeners function not found!"); }

    console.log("[Main] Todo App Initialized successfully via main.js.");
});
