// ui_event_handlers.js

// ... (other parts of the file remain the same) ...

// --- Global Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOMContentLoaded event fired in ui_event_handlers.js");
    
    if (typeof initializeDOMElements === 'function') {
        initializeDOMElements(); 
        const directButton = document.getElementById('kanbanViewToggleBtn');
        console.log('[DOMContentLoaded] Direct check for kanbanViewToggleBtn after initializeDOMElements():', directButton);
    } else {
        console.error("initializeDOMElements function is not defined! Check script load order and ui_rendering.js");
        return; 
    }
    
    await loadFeatureFlags();
    initializeTasks();
    updateUniqueLabels();
    loadKanbanColumns();

    populateDatalist(existingLabelsDatalist);
    populateDatalist(existingLabelsEditDatalist);

    // ADDED: Log state of AppFeatures before trying to initialize Kanban
    console.log('[DOMContentLoaded-OnInit] Checking AppFeatures before Kanban init. window.AppFeatures:', window.AppFeatures);
    if (window.AppFeatures) {
        console.log('[DOMContentLoaded-OnInit] window.AppFeatures.KanbanBoard:', window.AppFeatures.KanbanBoard);
        if (window.AppFeatures.KanbanBoard) {
             console.log('[DOMContentLoaded-OnInit] typeof window.AppFeatures.KanbanBoard.initialize:', typeof window.AppFeatures.KanbanBoard.initialize);
        }
    }
    // END ADDED LOG

    if (window.AppFeatures) {
        if (window.AppFeatures.initializeTestButtonFeature) {
            window.AppFeatures.initializeTestButtonFeature();
        }
        if (window.AppFeatures.TaskTimerSystem && typeof window.AppFeatures.TaskTimerSystem.initialize === 'function') {
            window.AppFeatures.TaskTimerSystem.initialize();
        }
        if (window.AppFeatures.initializeReminderFeature) {
            window.AppFeatures.initializeReminderFeature();
        }
        // Condition to initialize Kanban
        if (featureFlags.kanbanBoardFeature && 
            window.AppFeatures && 
            window.AppFeatures.KanbanBoard && 
            typeof window.AppFeatures.KanbanBoard.initialize === 'function') {
            console.log("[OnInit] Initializing Kanban Board Feature Module...");
            window.AppFeatures.KanbanBoard.initialize();
        } else {
            // ADDED: More detailed log if Kanban init condition fails
            console.warn("[OnInit] Kanban Board Feature Module NOT Initialized. Details:");
            console.warn(`  - featureFlags.kanbanBoardFeature: ${featureFlags.kanbanBoardFeature}`);
            console.warn(`  - window.AppFeatures exists: ${!!window.AppFeatures}`);
            if (window.AppFeatures) {
                console.warn(`  - window.AppFeatures.KanbanBoard exists: ${!!window.AppFeatures.KanbanBoard}`);
                if (window.AppFeatures.KanbanBoard) {
                    console.warn(`  - typeof window.AppFeatures.KanbanBoard.initialize: ${typeof window.AppFeatures.KanbanBoard.initialize}`);
                }
            }
            // END ADDED LOG
        }
    }

    applyActiveFeatures(); 

    if (typeof styleInitialSmartViewButtons === 'function') {
        styleInitialSmartViewButtons();
    } else {
        console.warn("styleInitialSmartViewButtons function not found in ui_rendering.js");
    }

    const savedSidebarState = localStorage.getItem('sidebarState');
    if (savedSidebarState === 'minimized') {
        setSidebarMinimized(true);
    } else {
        setSidebarMinimized(false);
    }

    if (typeof setFilter === 'function') {
        setFilter(currentFilter);
    } else {
        console.error("setFilter function is not defined when called!");
        refreshTaskView(); 
    }

    updateSortButtonStates();
    updateClearCompletedButtonState();

    setupEventListeners(); 
    console.log("Todo App Initialized (after DOMContentLoaded).");
});
