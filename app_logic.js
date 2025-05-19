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
// - setAppCurrentFilter(filter) (renamed to ViewManager.setCurrentFilter)
// - currentSort (variable in store.js, mutated by ViewManager.setCurrentSort)
// - setAppCurrentSort(sortType) (renamed to ViewManager.setCurrentSort)
// - currentSearchTerm (variable in store.js, mutated by ViewManager.setCurrentSearchTerm)
// - setAppSearchTerm(term) (renamed to ViewManager.setCurrentSearchTerm)


// --- Kanban Board Logic ---
function updateKanbanColumnTitle(columnId, newTitle) {
    // kanbanColumns and featureFlags are global from store.js
    // saveKanbanColumns is also global from store.js
    // currentTaskViewMode is global from store.js (managed by ViewManager)
    const columnIndex = kanbanColumns.findIndex(col => col.id === columnId);
    if (columnIndex !== -1) {
        kanbanColumns[columnIndex].title = newTitle;
        saveKanbanColumns(); // from store.js
        if (currentTaskViewMode === 'kanban' && featureFlags.kanbanBoardFeature) {
            if (window.AppFeatures && window.AppFeatures.KanbanBoard && typeof window.AppFeatures.KanbanBoard.renderKanbanBoard === 'function') {
                 window.AppFeatures.KanbanBoard.renderKanbanBoard();
            }
        }
    }
}


// --- Data Management Functions (Export/Import) ---
function prepareDataForExport() {
    // tasks, projects, kanbanColumns, featureFlags are global from store.js
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
    // selectedTaskIdsForBulkAction is global from store.js
    const index = selectedTaskIdsForBulkAction.indexOf(taskId);
    if (index > -1) {
        selectedTaskIdsForBulkAction.splice(index, 1);
    } else {
        selectedTaskIdsForBulkAction.push(taskId);
    }
    console.log("Selected tasks for bulk action:", selectedTaskIdsForBulkAction);
}

function clearBulkActionSelections() {
    // selectedTaskIdsForBulkAction is global from store.js
    selectedTaskIdsForBulkAction = [];
    console.log("Bulk action selections cleared.");
}

function getSelectedTaskIdsForBulkAction() {
    // selectedTaskIdsForBulkAction is global from store.js
    return [...selectedTaskIdsForBulkAction];
}

// app_logic.js continues to become leaner.
// The global state variables for UI presentation (currentFilter, currentSort, etc.)
// still reside in store.js but their modification logic is now encapsulated in viewManager.js.
// Next steps will involve updating UI files (ui_event_handlers.js, ui_rendering.js)
// to use ViewManager methods instead of directly calling old app_logic.js functions or mutating globals.
