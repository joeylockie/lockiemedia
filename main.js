// main.js
// Main entry point for the application.

document.addEventListener('DOMContentLoaded', async () => {
    console.log("[Main] DOMContentLoaded event fired. Starting application initialization...");

    // 0. EventBus is loaded via script tag, available globally.
    // 1. Utilities are loaded via script tag, available globally.

    // 2. Initialize DOM Element References
    if (typeof initializeDOMElements === 'function') { // From ui_rendering.js
        initializeDOMElements();
        console.log("[Main] DOM elements initialized.");
    } else {
        console.error("[Main] CRITICAL: initializeDOMElements function is not defined!");
        return;
    }

    // 3. Initialize FeatureFlagService and load flags.
    // FeatureFlagService's IIFE calls loadFeatureFlags if it's not already called.
    // store.js's IIFE also calls loadFeatureFlags.
    // To ensure flags are loaded before other initializations that depend on them:
    if (window.FeatureFlagService && typeof window.FeatureFlagService.loadFeatureFlags === 'function') {
        // Check if flags are already populated (e.g. by FeatureFlagService's own IIFE)
        // This is a bit of a workaround for the current global script loading.
        // A true module system would handle dependencies better.
        let currentFlags = window.FeatureFlagService.getAllFeatureFlags ? window.FeatureFlagService.getAllFeatureFlags() : {};
        if (!Object.keys(currentFlags).length || !Object.values(currentFlags).some(v => v === true || v === false)) { // Simple check if flags seem uninitialized
            console.log("[Main] Explicitly calling FeatureFlagService.loadFeatureFlags()...");
            await window.FeatureFlagService.loadFeatureFlags();
        }
        // store.js's IIFE will also call setStoreFeatureFlags after FeatureFlagService loads.
    } else {
        console.error("[Main] CRITICAL: FeatureFlagService.loadFeatureFlags is not available!");
        // Fallback: try to load flags directly into store's global if service failed
        if (window.featureFlags && typeof loadFeatureFlags_fallback === 'function') { // Assuming a fallback if needed
            // await loadFeatureFlags_fallback(window.featureFlags);
        }
    }
    
    // 4. Initialize Store (loads data, uses feature flags)
    // store.js loads its data via an IIFE which should have run by now,
    // including awaiting feature flags.

    // 5. Initialize UI Rendering Event Subscriptions
    // This should come after EventBus is available and main rendering functions are defined.
    if (typeof initializeUiRenderingSubscriptions === 'function') { // From ui_rendering.js
        initializeUiRenderingSubscriptions();
        console.log("[Main] UI Rendering event subscriptions initialized.");
    } else {
        console.error("[Main] initializeUiRenderingSubscriptions function not found!");
    }

    // 6. Initialize Feature Modules (they might subscribe to events or provide services)
    if (typeof FeatureFlagService !== 'undefined' && typeof window.AppFeatures !== 'undefined') {
        console.log("[Main] Initializing feature modules...");
        for (const featureName in window.AppFeatures) {
            if (window.AppFeatures.hasOwnProperty(featureName) &&
                window.AppFeatures[featureName] &&
                typeof window.AppFeatures[featureName].initialize === 'function') {
                try {
                    console.log(`[Main] Initializing ${featureName}...`);
                    window.AppFeatures[featureName].initialize();
                } catch (e) {
                    console.error(`[Main] Error initializing feature ${featureName}:`, e);
                }
            }
        }
        console.log("[Main] Feature modules initialization process completed.");
    }

    // 7. Apply Active Features to the UI (initial setup)
    // This function reads feature flags and toggles UI elements accordingly.
    // It also calls refreshTaskView internally.
    if (typeof applyActiveFeatures === 'function') { // From ui_event_handlers.js
        applyActiveFeatures(); // This will also trigger the first refreshTaskView
        console.log("[Main] Active features applied to UI (initial).");
    } else {
        console.error("[Main] applyActiveFeatures function not found!");
        if(typeof refreshTaskView === 'function') refreshTaskView(); // Fallback
    }

    // 8. Style Initial UI Elements (like smart view buttons)
    if (typeof styleInitialSmartViewButtons === 'function') { // From ui_rendering.js
        styleInitialSmartViewButtons();
    }

    // 9. Set Initial Sidebar State
    const savedSidebarState = localStorage.getItem('sidebarState');
    if (typeof setSidebarMinimized === 'function') { // From ui_rendering.js
        setSidebarMinimized(savedSidebarState === 'minimized');
    }

    // 10. Populate Project-Specific UI (if feature enabled)
    // This ensures project filters/dropdowns are populated after initial data load & flag checks.
    if (typeof FeatureFlagService !== 'undefined' && FeatureFlagService.isFeatureEnabled('projectFeature') && window.AppFeatures?.Projects) {
        if(window.AppFeatures.Projects.populateProjectFilterList) window.AppFeatures.Projects.populateProjectFilterList();
        if(window.AppFeatures.Projects.populateProjectDropdowns) window.AppFeatures.Projects.populateProjectDropdowns();
    }
    
    // 11. Set Initial Filter UI (active buttons)
    // refreshTaskView called by applyActiveFeatures should handle the data rendering.
    // setFilter here ensures the UI for the filter buttons is correct.
    if (typeof ViewManager !== 'undefined' && typeof setFilter === 'function') { // setFilter from ui_event_handlers.js
        setFilter(ViewManager.getCurrentFilter());
    }

    // 12. Update other initial button states
    if (typeof updateSortButtonStates === 'function') updateSortButtonStates();
    if (typeof updateClearCompletedButtonState === 'function') updateClearCompletedButtonState();

    // 13. Setup All Global Event Listeners (forms, clicks not tied to dynamic content)
    if (typeof setupEventListeners === 'function') { // From ui_event_handlers.js
        setupEventListeners();
        console.log("[Main] Global event listeners set up.");
    } else {
        console.error("[Main] setupEventListeners function not found!");
    }

    console.log("[Main] Todo App Initialized successfully via main.js.");
});
