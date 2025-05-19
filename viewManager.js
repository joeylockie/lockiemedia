// viewManager.js
// This service manages the state related to how data is presented in the UI,
// such as current view mode, active filters, sort order, and search terms.
// It will interact with store.js for the actual state variables.

// For now, these functions will directly modify the global state variables
// defined in store.js. In a more advanced refactor, viewManager.js might
// own these specific state pieces and use an event bus or callbacks
// to notify other parts of the app about changes.

/**
 * Sets the current task view mode (e.g., 'list', 'kanban').
 * @param {string} mode - The view mode to set.
 */
function setTaskViewMode(mode) {
    // Assumes currentTaskViewMode is a global variable from store.js
    if (['list', 'kanban', 'calendar', 'pomodoro'].includes(mode)) {
        if (typeof currentTaskViewMode !== 'undefined') {
            currentTaskViewMode = mode;
            console.log(`[ViewManager] Task view mode changed to: ${currentTaskViewMode}`);
            // Dependent UI updates (like refreshing the main task view)
            // will be triggered by the calling function (e.g., in ui_event_handlers.js)
            // or via an event system later.
        } else {
            console.error("[ViewManager] global 'currentTaskViewMode' is not defined in store.js.");
        }
    } else {
        console.warn(`[ViewManager] Attempted to set invalid task view mode: ${mode}`);
    }
}

/**
 * Gets the current task view mode.
 * @returns {string} The current task view mode.
 */
function getCurrentTaskViewMode() {
    // Assumes currentTaskViewMode is a global variable from store.js
    if (typeof currentTaskViewMode !== 'undefined') {
        return currentTaskViewMode;
    }
    console.error("[ViewManager] global 'currentTaskViewMode' is not defined in store.js. Defaulting to 'list'.");
    return 'list'; // Fallback
}

/**
 * Sets the current filter for displaying tasks.
 * Also resets the sort order to 'default' when the filter changes.
 * @param {string} filter - The filter to apply (e.g., 'inbox', 'today', 'project_123').
 */
function setCurrentFilter(filter) {
    // Assumes currentFilter and currentSort are global variables from store.js
    if (typeof currentFilter !== 'undefined' && typeof currentSort !== 'undefined') {
        currentFilter = filter;
        currentSort = 'default'; // Reset sort when filter changes
        console.log(`[ViewManager] Current filter set to: ${currentFilter}, sort reset to 'default'.`);
    } else {
        console.error("[ViewManager] global 'currentFilter' or 'currentSort' is not defined in store.js.");
    }
}

/**
 * Gets the current active filter.
 * @returns {string} The current filter.
 */
function getCurrentFilter() {
    // Assumes currentFilter is a global variable from store.js
    if (typeof currentFilter !== 'undefined') {
        return currentFilter;
    }
    console.error("[ViewManager] global 'currentFilter' is not defined in store.js. Defaulting to 'inbox'.");
    return 'inbox'; // Fallback
}

/**
 * Sets the current sort order for tasks.
 * @param {string} sortType - The sort type (e.g., 'dueDate', 'priority', 'default').
 */
function setCurrentSort(sortType) {
    // Assumes currentSort is a global variable from store.js
    if (typeof currentSort !== 'undefined') {
        currentSort = sortType;
        console.log(`[ViewManager] Current sort set to: ${currentSort}`);
    } else {
        console.error("[ViewManager] global 'currentSort' is not defined in store.js.");
    }
}

/**
 * Gets the current sort order.
 * @returns {string} The current sort type.
 */
function getCurrentSort() {
    // Assumes currentSort is a global variable from store.js
    if (typeof currentSort !== 'undefined') {
        return currentSort;
    }
    console.error("[ViewManager] global 'currentSort' is not defined in store.js. Defaulting to 'default'.");
    return 'default'; // Fallback
}

/**
 * Sets the current search term.
 * @param {string} term - The search term.
 */
function setCurrentSearchTerm(term) {
    // Assumes currentSearchTerm is a global variable from store.js
    if (typeof currentSearchTerm !== 'undefined') {
        currentSearchTerm = term.toLowerCase(); // Normalize to lowercase
        console.log(`[ViewManager] Current search term set to: "${currentSearchTerm}"`);
    } else {
        console.error("[ViewManager] global 'currentSearchTerm' is not defined in store.js.");
    }
}

/**
 * Gets the current search term.
 * @returns {string} The current search term.
 */
function getCurrentSearchTerm() {
    // Assumes currentSearchTerm is a global variable from store.js
    if (typeof currentSearchTerm !== 'undefined') {
        return currentSearchTerm;
    }
    console.error("[ViewManager] global 'currentSearchTerm' is not defined in store.js. Defaulting to empty string.");
    return ''; // Fallback
}

// Expose public interface (globally for now)
// Later, these could be part of an exported object if using ES6 modules.
window.ViewManager = {
    setTaskViewMode,
    getCurrentTaskViewMode,
    setCurrentFilter,
    getCurrentFilter,
    setCurrentSort,
    getCurrentSort,
    setCurrentSearchTerm,
    getCurrentSearchTerm
};

// console.log("viewManager.js loaded");
