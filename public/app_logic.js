// app_logic.js
// This file now primarily contains theme management.
// Other core logic has been moved to services (store.js, utils.js, taskService.js, projectService.js, viewManager.js, bulkActionService.js).

// --- Theme Management ---
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (localStorage.getItem('theme') !== (event.matches ? 'dark' : 'light')) {
        if (event.matches) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }
});

// All other functions previously in app_logic.js have been moved:
// - State variables and data persistence: store.js
// - Utility functions: utils.js
// - Task-specific logic (getPriorityClass, parseDateFromText): taskService.js
// - Project-specific logic placeholders: projectService.js (most project data logic is in store.js or feature_projects.js)
// - Feature flag loading: featureFlagService.js
// - View/Filter/Sort state management: viewManager.js
// - Kanban column title updates: feature_kanban_board.js
// - Data export preparation: feature_data_management.js
// - Bulk action state management: bulkActionService.js

// console.log("app_logic.js loaded - now very lean.");
