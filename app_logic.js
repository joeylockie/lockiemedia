// app_logic.js
// This file now contains core application logic, event handlers,
// and functions that interact with the state managed in store.js
// and utility functions from utils.js and services like taskService.js.

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


// --- Task View Mode Management ---
function setTaskViewMode(mode) {
    // currentTaskViewMode is now global from store.js
    if (['list', 'kanban', 'calendar', 'pomodoro'].includes(mode)) {
        currentTaskViewMode = mode;
        console.log(`Task view mode changed to: ${currentTaskViewMode}`);
    } else {
        console.warn(`Attempted to set invalid task view mode: ${mode}`);
    }
}

// --- Filtering and sorting state management ---
function setAppCurrentFilter(filter) {
    // currentFilter and currentSort are now global from store.js
    currentFilter = filter;
    currentSort = 'default'; // Reset sort when filter changes
}

function setAppCurrentSort(sortType) {
    // currentSort is now global from store.js
    currentSort = sortType;
}

function setAppSearchTerm(term) {
    // currentSearchTerm is now global from store.js
    currentSearchTerm = term;
}

// --- Kanban Board Logic ---
function updateKanbanColumnTitle(columnId, newTitle) {
    // kanbanColumns and featureFlags are now global from store.js
    // saveKanbanColumns is also global from store.js
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

// app_logic.js is becoming much leaner.
// Its remaining responsibilities will be further reduced as we introduce more services
// and refine how UI event handlers interact with the application core.
