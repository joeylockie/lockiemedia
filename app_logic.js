// app_logic.js
// This file now contains core application logic, event handlers,
// and functions that interact with the state managed in store.js
// and utility functions from utils.js and services like taskService.js and viewManager.js.

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
// - currentTaskViewMode (variable in store.js, mutated by ViewManager.setTaskViewMode)
// - setTaskViewMode(mode) (function in viewManager.js)
// - currentFilter (variable in store.js, mutated by ViewManager.setCurrentFilter)
// - setCurrentFilter(filter) (function in viewManager.js)
// - currentSort (variable in store.js, mutated by ViewManager.setCurrentSort)
// - setCurrentSort(sortType) (function in viewManager.js)
// - currentSearchTerm (variable in store.js, mutated by ViewManager.setCurrentSearchTerm)
// - setCurrentSearchTerm(term) (function in viewManager.js)


// --- Kanban Board Logic ---
// updateKanbanColumnTitle(columnId, newTitle) has been moved to feature_kanban_board.js


// --- Data Management Functions (Export/Import) ---
function prepareDataForExport() {
    // tasks, projects, kanbanColumns, featureFlags are now global from store.js
    return {
        version: "1.0.0",
        exportDate: new Date().toISOString(),
        data: {
            tasks: tasks,
            projects: projects,
            kanbanColumns: kanbanColumns,
            featureFlags: featureFlags
        }
    };
}

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

// app_logic.js continues to become leaner.
