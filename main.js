// main.js
// This file serves as the main entry point for the application,
// orchestrating the initialization sequence after the DOM is loaded.

// Dependencies:
// - store.js (loads data and feature flags via its IIFE and FeatureFlagService)
// - ui_rendering.js (for initializeDOMElements, styleInitialSmartViewButtons, setSidebarMinimized, updateSortButtonStates, updateClearCompletedButtonState, refreshTaskView)
// - ui_event_handlers.js (for applyActiveFeatures, setFilter, setupEventListeners)
// - Feature modules (window.AppFeatures.*.initialize from feature_*.js files)
// - Services (FeatureFlagService, ViewManager - assumed globally available)

document.addEventListener('DOMContentLoaded', async () => {
    console.log("[Main] DOMContentLoaded event fired. Starting application initialization...");

    // 1. Initialize DOM Element References
    // This needs to happen early so other modules can access DOM elements.
    if (typeof initializeDOMElements === 'function') {
        initializeDOMElements();
        console.log("[Main] DOM elements initialized.");
    } else {
        console.error("[Main] CRITICAL: initializeDOMElements function is not defined! Check script load order for ui_rendering.js.");
        return; // Stop initialization if critical functions are missing
    }

    // 2. Load Feature Flags and Initial Data (Handled by store.js and featureFlagService.js upon their script execution)
    // We need to ensure these asynchronous operations (especially flag loading) are complete
    // before proceeding with logic that depends on them.
    // FeatureFlagService.loadFeatureFlags() is async and updates window.featureFlags.
    // store.js's IIFE also awaits FeatureFlagService.loadFeatureFlags().
    // A more robust system might use promises or an event to signal readiness.
    // For now, we assume that by the time DOMContentLoaded fires, these scripts have executed
    // and their async operations inside IIFEs have progressed significantly or completed.
    // A brief timeout can be a simple, albeit not ideal, way to allow async operations to settle.
    // await new Promise(resolve => setTimeout(resolve, 100)); // Small delay if needed for async flag/store loading

    console.log("[Main] Assuming FeatureFlagService and store.js have loaded initial data and flags.");


    // 3. Initialize Feature Modules
    // This should happen after feature flags are loaded so modules initialize correctly based on their status.
    if (typeof FeatureFlagService !== 'undefined' && typeof window.AppFeatures !== 'undefined') {
        console.log("[Main] Initializing feature modules...");
        // Iterate over AppFeatures and call initialize if it exists
        for (const featureName in window.AppFeatures) {
            if (window.AppFeatures.hasOwnProperty(featureName) && 
                window.AppFeatures[featureName] && 
                typeof window.AppFeatures[featureName].initialize === 'function') {
                
                // Some features might only initialize if their flag is true.
                // This specific logic might be better inside each feature's initialize method
                // or handled by a more generic feature registration system.
                // For now, we'll call initialize for all, and they can internally check their flags.
                // Example:
                // if (FeatureFlagService.isFeatureEnabled(featureName.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`))) { // Convert camelCase to snake_case for flag name
                try {
                    console.log(`[Main] Initializing ${featureName}...`);
                    window.AppFeatures[featureName].initialize();
                } catch (e) {
                    console.error(`[Main] Error initializing feature ${featureName}:`, e);
                }
                // }
            }
        }
        console.log("[Main] Feature modules initialization process completed.");
    } else {
        console.warn("[Main] FeatureFlagService or AppFeatures not fully available for feature module initialization.");
    }
    

    // 4. Apply Active Features to the UI
    // This function reads feature flags and toggles UI elements accordingly.
    // It also calls refreshTaskView internally.
    if (typeof applyActiveFeatures === 'function') {
        applyActiveFeatures();
        console.log("[Main] Active features applied to UI.");
    } else {
        console.error("[Main] applyActiveFeatures function not found (expected in ui_event_handlers.js).");
        // Fallback to refreshTaskView if applyActiveFeatures is missing, though this is not ideal.
        if (typeof refreshTaskView === 'function') {
            refreshTaskView();
        }
    }

    // 5. Style Initial UI Elements
    if (typeof styleInitialSmartViewButtons === 'function') {
        styleInitialSmartViewButtons();
        console.log("[Main] Initial smart view buttons styled.");
    } else {
        console.warn("[Main] styleInitialSmartViewButtons function not found (expected in ui_rendering.js).");
    }

    // 6. Set Initial Sidebar State
    const savedSidebarState = localStorage.getItem('sidebarState');
    if (typeof setSidebarMinimized === 'function') {
        setSidebarMinimized(savedSidebarState === 'minimized'); // true if 'minimized', false otherwise
        console.log(`[Main] Sidebar state set to: ${savedSidebarState || 'expanded'}.`);
    } else {
        console.warn("[Main] setSidebarMinimized function not found (expected in ui_rendering.js).");
    }

    // 7. Populate Project-Specific UI (if feature enabled)
    // This should happen after projects are loaded by store.js and flags are available.
    if (typeof FeatureFlagService !== 'undefined' && FeatureFlagService.isFeatureEnabled('projectFeature') && window.AppFeatures?.Projects) {
        if(window.AppFeatures.Projects.populateProjectFilterList) {
            window.AppFeatures.Projects.populateProjectFilterList();
            console.log("[Main] Project filter list populated.");
        }
        if(window.AppFeatures.Projects.populateProjectDropdowns) {
            window.AppFeatures.Projects.populateProjectDropdowns();
            console.log("[Main] Project dropdowns populated.");
        }
    }

    // 8. Set Initial Filter and Render View
    // refreshTaskView (called by applyActiveFeatures) should handle the initial rendering
    // based on the default filter from ViewManager (which gets it from store.js).
    // We ensure the filter UI (active buttons) is correctly set.
    if (typeof ViewManager !== 'undefined' && typeof setFilter === 'function') {
        setFilter(ViewManager.getCurrentFilter()); // from ui_event_handlers.js, ensures UI consistency
        console.log(`[Main] Initial filter set to: ${ViewManager.getCurrentFilter()}. Task view refreshed via applyActiveFeatures.`);
    } else {
        console.warn("[Main] ViewManager or setFilter not available for initial filter application.");
        // If applyActiveFeatures didn't run or didn't refresh, do a manual refresh.
        if (typeof refreshTaskView === 'function' && typeof applyActiveFeatures !== 'function') {
            refreshTaskView();
        }
    }

    // 9. Update Button States
    if (typeof updateSortButtonStates === 'function') updateSortButtonStates();
    if (typeof updateClearCompletedButtonState === 'function') updateClearCompletedButtonState();
    console.log("[Main] Initial button states updated.");

    // 10. Setup All Other Event Listeners
    // This should be one of the last steps, ensuring all UI is ready and services are initialized.
    if (typeof setupEventListeners === 'function') {
        setupEventListeners(); // from ui_event_handlers.js
        console.log("[Main] Global event listeners set up.");
    } else {
        console.error("[Main] setupEventListeners function not found (expected in ui_event_handlers.js).");
    }

    console.log("[Main] Todo App Initialized successfully via main.js.");
});
