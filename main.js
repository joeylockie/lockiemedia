// main.js
// Main entry point for the application.

import EventBus from './eventBus.js'; // Already a module
import AppStore from './store.js'; // Already a module
import { ProjectsFeature } from './feature_projects.js'; // Import the feature object
import { loadFeatureFlags, isFeatureEnabled as isFeatureEnabledFromService } from './featureFlagService.js'; // Already a module
// We'll import other services as needed by main.js or by other modules that main.js calls.
// For now, ui_rendering and ui_event_handlers are still global-style.

// Make FeatureFlagService.isFeatureEnabled globally available for non-module scripts temporarily
// This is a bridge until all files are modules.
if (typeof window.isFeatureEnabled === 'undefined') {
    window.isFeatureEnabled = isFeatureEnabledFromService;
}
// Similarly for AppStore, if non-module scripts need it directly (should be minimized)
if (typeof window.AppStore === 'undefined') {
    window.AppStore = AppStore;
}
// And EventBus
if (typeof window.EventBus === 'undefined') {
    window.EventBus = EventBus;
}


document.addEventListener('DOMContentLoaded', async () => {
    console.log("[Main] DOMContentLoaded event fired. Starting application initialization...");

    // 1. Initialize DOM Element References (from ui_rendering.js - still global for now)
    if (typeof initializeDOMElements === 'function') {
        initializeDOMElements();
        console.log("[Main] DOM elements initialized.");
    } else {
        console.error("[Main] CRITICAL: initializeDOMElements function is not defined!");
        return; 
    }

    // 2. Initialize FeatureFlagService and load flags.
    try {
        await loadFeatureFlags(); // Use imported function
        console.log("[Main] Feature flags loading process initiated/completed by FeatureFlagService.");
    } catch (e) {
        console.error("[Main] CRITICAL: Error loading feature flags!", e);
        return; // Stop if flags can't load
    }
    
    // 3. Initialize Store (loads data, uses feature flags which are now set in AppStore by loadFeatureFlags)
    if (AppStore && typeof AppStore.initializeStore === 'function') {
        await AppStore.initializeStore();
        console.log("[Main] AppStore initialized.");
    } else {
        console.error("[Main] CRITICAL: AppStore.initializeStore is not available!");
        return;
    }

    // 4. Initialize UI Rendering Event Subscriptions (from ui_rendering.js - still global for now)
    if (typeof initializeUiRenderingSubscriptions === 'function') {
        initializeUiRenderingSubscriptions();
        console.log("[Main] UI Rendering event subscriptions initialized.");
    } else {
        console.error("[Main] initializeUiRenderingSubscriptions function not found!");
    }

   // 5. Initialize Feature Modules
if (typeof window.AppFeatures === 'undefined') {
    window.AppFeatures = {}; // Ensure AppFeatures object exists
}
window.AppFeatures.Projects = ProjectsFeature; // Assign imported feature

if (typeof FeatureFlagService !== 'undefined' /* using imported isFeatureEnabledFromService */ && typeof window.AppFeatures !== 'undefined') {
    console.log("[Main] Initializing feature modules...");
    // Initialize ProjectsFeature explicitly if its initialize function needs to be called
    if (window.AppFeatures.Projects && typeof window.AppFeatures.Projects.initialize === 'function') {
        try {
            console.log("[Main] Initializing ProjectsFeature...");
            window.AppFeatures.Projects.initialize();
        } catch (e) {
            console.error("[Main] Error initializing ProjectsFeature:", e);
        }
    }
    // ... (loop for other AppFeatures, or initialize them explicitly after import) ...
}

    // 6. Apply Active Features to the UI (initial setup) (from ui_event_handlers.js - still global)
    if (typeof applyActiveFeatures === 'function') { 
        applyActiveFeatures(); 
        console.log("[Main] Active features applied to UI (initial).");
    } else {
        console.error("[Main] applyActiveFeatures function not found!");
        if(typeof refreshTaskView === 'function') refreshTaskView();
    }

    // 7. Style Initial UI Elements (from ui_rendering.js - still global)
    if (typeof styleInitialSmartViewButtons === 'function') { 
        styleInitialSmartViewButtons();
    }

    // 8. Set Initial Sidebar State (from ui_rendering.js - still global)
    const savedSidebarState = localStorage.getItem('sidebarState');
    if (typeof setSidebarMinimized === 'function') { 
        setSidebarMinimized(savedSidebarState === 'minimized');
    }

    // 9. Populate Project-Specific UI (if feature enabled)
    // AppFeatures.Projects is still global for now.
    if (isFeatureEnabledFromService('projectFeature') && window.AppFeatures?.Projects) {
        if(window.AppFeatures.Projects.populateProjectFilterList) window.AppFeatures.Projects.populateProjectFilterList();
        if(window.AppFeatures.Projects.populateProjectDropdowns) window.AppFeatures.Projects.populateProjectDropdowns();
    }
    
    // 10. Set Initial Filter UI (active buttons) (setFilter from ui_event_handlers.js - still global)
    // ViewManager is still global for now.
    if (typeof window.ViewManager !== 'undefined' && typeof setFilter === 'function') { 
        setFilter(window.ViewManager.getCurrentFilter());
    }

    // 11. Update other initial button states (from ui_rendering.js - still global)
    if (typeof updateSortButtonStates === 'function') updateSortButtonStates();
    if (typeof updateClearCompletedButtonState === 'function') updateClearCompletedButtonState();

    // 12. Setup All Global Event Listeners (from ui_event_handlers.js - still global)
    if (typeof setupEventListeners === 'function') { 
        setupEventListeners();
        console.log("[Main] Global event listeners set up.");
    } else {
        console.error("[Main] setupEventListeners function not found!");
    }

    console.log("[Main] Todo App Initialized successfully via main.js.");
});
