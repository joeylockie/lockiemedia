// viewManager.js
// Manages UI state like current view mode, filters, sort order, and search terms.
// Publishes events when these states change.

// Assumes state variables (currentTaskViewMode, currentFilter, etc.) are global from store.js
// Assumes EventBus is global from eventBus.js

function setTaskViewMode(mode) {
    if (typeof currentTaskViewMode === 'undefined' || typeof EventBus === 'undefined') {
        console.error("[ViewManager] 'currentTaskViewMode' or 'EventBus' not defined.");
        return;
    }
    if (['list', 'kanban', 'calendar', 'pomodoro'].includes(mode)) {
        if (currentTaskViewMode !== mode) {
            currentTaskViewMode = mode;
            console.log(`[ViewManager] Task view mode changed to: ${currentTaskViewMode}`);
            EventBus.publish('viewModeChanged', currentTaskViewMode);
        }
    } else {
        console.warn(`[ViewManager] Attempted to set invalid task view mode: ${mode}`);
    }
}

function getCurrentTaskViewMode() {
    if (typeof currentTaskViewMode !== 'undefined') return currentTaskViewMode;
    return 'list'; // Fallback
}

function setCurrentFilter(filter) {
    if (typeof currentFilter === 'undefined' || typeof currentSort === 'undefined' || typeof EventBus === 'undefined') {
        console.error("[ViewManager] 'currentFilter', 'currentSort', or 'EventBus' not defined.");
        return;
    }
    if (currentFilter !== filter) {
        currentFilter = filter;
        currentSort = 'default'; // Reset sort when filter changes
        console.log(`[ViewManager] Current filter set to: ${currentFilter}, sort reset to 'default'.`);
        EventBus.publish('filterChanged', { filter: currentFilter, sort: currentSort });
    }
}

function getCurrentFilter() {
    if (typeof currentFilter !== 'undefined') return currentFilter;
    return 'inbox'; // Fallback
}

function setCurrentSort(sortType) {
    if (typeof currentSort === 'undefined' || typeof EventBus === 'undefined') {
        console.error("[ViewManager] 'currentSort' or 'EventBus' not defined.");
        return;
    }
    if (currentSort !== sortType) {
        currentSort = sortType;
        console.log(`[ViewManager] Current sort set to: ${currentSort}`);
        EventBus.publish('sortChanged', currentSort);
    }
}

function getCurrentSort() {
    if (typeof currentSort !== 'undefined') return currentSort;
    return 'default'; // Fallback
}

function setCurrentSearchTerm(term) {
    if (typeof currentSearchTerm === 'undefined' || typeof EventBus === 'undefined') {
        console.error("[ViewManager] 'currentSearchTerm' or 'EventBus' not defined.");
        return;
    }
    const newTerm = term.toLowerCase();
    if (currentSearchTerm !== newTerm) {
        currentSearchTerm = newTerm;
        console.log(`[ViewManager] Current search term set to: "${currentSearchTerm}"`);
        EventBus.publish('searchTermChanged', currentSearchTerm);
    }
}

function getCurrentSearchTerm() {
    if (typeof currentSearchTerm !== 'undefined') return currentSearchTerm;
    return ''; // Fallback
}

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
