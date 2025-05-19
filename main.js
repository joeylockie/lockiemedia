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

    // 3. Initialize FeatureFlagService (its IIFE might have run, but ensure loadFeatureFlags is called if needed)
    // and then initialize the AppStore which depends on flags.
    if (window.FeatureFlagService && typeof window.FeatureFlagService.loadFeatureFlags === 'function') {
        await window.FeatureFlagService.loadFeatureFlags(); // Ensures flags are loaded
        console.log("[Main] Feature flags loading process initiated/completed by FeatureFlagService.");
        // FeatureFlagService calls AppStore.setFeatureFlags internally via window.store.setFeatureFlags
    } else {
        console.error("[Main] CRITICAL: FeatureFlagService.loadFeatureFlags is not available!");
    }

    // 4. Initialize Store (loads data, uses feature flags)
    if (window.AppStore && typeof window.AppStore.initializeStore === 'function') {
        await window.AppStore.initializeStore(); // Now explicitly calling store initialization
        console.log("[Main] AppStore initialized.");
    } else {
        console.error("[Main] CRITICAL: AppStore.initializeStore is not available!");
        return;
    }

    // 5. Initialize UI Rendering Event Subscriptions
    if (typeof initializeUiRenderingSubscriptions === 'function') { // From ui_rendering.js
        initializeUiRenderingSubscriptions();
        console.log("[Main] UI Rendering event subscriptions initialized.");
    } else {
        console.error("[Main] initializeUiRenderingSubscriptions function not found!");
    }

    // 6. Initialize Feature Modules
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
    if (typeof applyActiveFeatures === 'function') { // From ui_event_handlers.js
        applyActiveFeatures(); 
        console.log("[Main] Active features applied to UI (initial).");
    } else {
        console.error("[Main] applyActiveFeatures function not found!");
        if(typeof refreshTaskView === 'function') refreshTaskView();
    }

    // 8. Style Initial UI Elements
    if (typeof styleInitialSmartViewButtons === 'function') { // From ui_rendering.js
        styleInitialSmartViewButtons();
    }

    // 9. Set Initial Sidebar State
    const savedSidebarState = localStorage.getItem('sidebarState');
    if (typeof setSidebarMinimized === 'function') { // From ui_rendering.js
        setSidebarMinimized(savedSidebarState === 'minimized');
    }

    // 10. Populate Project-Specific UI (if feature enabled)
    if (typeof FeatureFlagService !== 'undefined' && FeatureFlagService.isFeatureEnabled('projectFeature') && window.AppFeatures?.Projects) {
        if(window.AppFeatures.Projects.populateProjectFilterList) window.AppFeatures.Projects.populateProjectFilterList();
        if(window.AppFeatures.Projects.populateProjectDropdowns) window.AppFeatures.Projects.populateProjectDropdowns();
    }
    
    // 11. Set Initial Filter UI (active buttons)
    if (typeof ViewManager !== 'undefined' && typeof setFilter === 'function') { // setFilter from ui_event_handlers.js
        setFilter(ViewManager.getCurrentFilter());
    }

    // 12. Update other initial button states
    if (typeof updateSortButtonStates === 'function') updateSortButtonStates();
    if (typeof updateClearCompletedButtonState === 'function') updateClearCompletedButtonState();

    // 13. Setup All Global Event Listeners
    if (typeof setupEventListeners === 'function') { // From ui_event_handlers.js
        setupEventListeners();
        console.log("[Main] Global event listeners set up.");
    } else {
        console.error("[Main] setupEventListeners function not found!");
    }

    console.log("[Main] Todo App Initialized successfully via main.js.");
});
