// app_logic.js
// This file now contains core application logic, event handlers,
// and functions that interact with the state managed in store.js
// and utility functions from utils.js and services.

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

// --- Core Task Interaction Logic (Examples, to be expanded) ---
// getPriorityClass(priority) has been moved to taskService.js
// parseDateFromText(text) has been moved to taskService.js


// --- Task View Mode, Filtering, Sorting, and Search Term state management ---
// These are now conceptually managed by viewManager.js


// --- Kanban Board Logic ---
// updateKanbanColumnTitle(columnId, newTitle) has been moved to feature_kanban_board.js


// --- Data Management Functions (Export/Import) ---
// prepareDataForExport() has been moved to feature_data_management.js


// --- Bulk Action State Management ---
function toggleTaskSelectionForBulkAction(taskId) {
    // selectedTaskIdsForBulkAction is now global from store.js
    const index = selectedTaskIdsForBulkAction.indexOf(taskId);
    if (index > -1) {
        selectedTaskIdsForBulkAction.splice(index, 1);
    } else {
        selectedTaskIdsForBulkAction.push(taskId);
    }
    console.log("Selected tasks for bulk action:", selectedTaskIdsForBulkAction);
}

function clearBulkActionSelections() {
    // selectedTaskIdsForBulkAction is now global from store.js
    selectedTaskIdsForBulkAction = [];
    console.log("Bulk action selections cleared.");
}

function getSelectedTaskIdsForBulkAction() {
    // selectedTaskIdsForBulkAction is now global from store.js
    return [...selectedTaskIdsForBulkAction];
}

// app_logic.js is now very lean. The remaining functions are for bulk actions
// and theme management. Bulk actions might also move to a dedicated service later.
// console.log("app_logic.js loaded");
