// viewManager.js
// Manages UI presentation state (current view mode, active filters, sort order, search terms)
// and publishes events when these states change.

import EventBus from './eventBus.js';
import AppStore from './store.js'; // Import AppStore to access tasks
import LoggingService from './loggingService.js';

// --- Internal State Variables (scoped to this module) ---
let _currentFilter = 'inbox';
let _currentSort = 'default';
let _currentSearchTerm = '';
const _currentTaskViewMode = 'list'; // View mode is now always 'list'

function _publish(eventName, data) {
    if (EventBus && typeof EventBus.publish === 'function') {
        EventBus.publish(eventName, data);
    } else {
        LoggingService.warn(`[ViewManager] EventBus not available to publish event: ${eventName}`, { eventName, data, functionName: '_publish' });
    }
}

function setTaskViewMode(mode) {
    // This function is now a no-op as the view is always 'list'.
    // It's kept for compatibility in case other parts of the code call it.
    const functionName = 'setTaskViewMode';
    if (mode !== 'list') {
        LoggingService.debug(`[ViewManager] Attempted to set view mode to "${mode}", but only "list" is supported. No change made.`, { attemptedMode: mode, functionName });
    }
}

function getCurrentTaskViewMode() {
    return _currentTaskViewMode;
}

function setCurrentFilter(filter) {
    const functionName = 'setCurrentFilter';
    if (_currentFilter !== filter) {
        _currentFilter = filter;
        _currentSort = 'default'; // Reset sort when filter changes
        LoggingService.info(`[ViewManager] Current filter set to: ${_currentFilter}, sort reset to 'default'.`, { newFilter: _currentFilter, newSort: _currentSort, functionName });
        _publish('filterChanged', { filter: _currentFilter, sort: _currentSort });
    }
}

function getCurrentFilter() {
    return _currentFilter;
}

function setCurrentSort(sortType) {
    const functionName = 'setCurrentSort';
    if (_currentSort !== sortType) {
        _currentSort = sortType;
        LoggingService.info(`[ViewManager] Current sort set to: ${_currentSort}`, { newSort: _currentSort, functionName });
        _publish('sortChanged', _currentSort);
    }
}

function getCurrentSort() {
    return _currentSort;
}

function setCurrentSearchTerm(term) {
    const functionName = 'setCurrentSearchTerm';
    const newTerm = term.toLowerCase();
    if (_currentSearchTerm !== newTerm) {
        _currentSearchTerm = newTerm;
        LoggingService.info(`[ViewManager] Current search term set to: "${_currentSearchTerm}"`, { newSearchTerm: _currentSearchTerm, functionName });
        _publish('searchTermChanged', _currentSearchTerm);
    }
}

function getCurrentSearchTerm() {
    return _currentSearchTerm;
}

/**
 * Gets the tasks that are currently visible based on active filters and search terms.
 * This is used by the "Select All" bulk action functionality.
 * @returns {Array<Object>} An array of task objects.
 */
function getFilteredTasksForBulkAction() {
    const functionName = 'getFilteredTasksForBulkAction';
    if (!AppStore || typeof AppStore.getTasks !== 'function') {
        LoggingService.error("[ViewManager] AppStore not available to get tasks for filtering.", new Error("AppStoreMissing"), { functionName });
        return [];
    }
    const currentTasks = AppStore.getTasks();

    let filteredTasks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const shoppingLabels = ['shopping', 'buy', 'store'];

    // Apply filters (similar to renderTaskListView logic)
    if (_currentFilter === 'inbox') {
        filteredTasks = currentTasks.filter(task =>
            !task.completed &&
            (!task.label || !shoppingLabels.includes(task.label.toLowerCase()))
        );
    } else if (_currentFilter === 'shopping_list') {
        filteredTasks = currentTasks.filter(task =>
            !task.completed &&
            task.label &&
            shoppingLabels.includes(task.label.toLowerCase())
        );
    } else if (_currentFilter === 'today') {
        filteredTasks = currentTasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const taskDueDate = new Date(task.dueDate + 'T00:00:00');
            return taskDueDate.getTime() === today.getTime();
        });
    } else if (_currentFilter === 'upcoming') {
        filteredTasks = currentTasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const taskDueDate = new Date(task.dueDate + 'T00:00:00');
            return taskDueDate.getTime() > today.getTime();
        });
    } else if (_currentFilter === 'completed') {
        filteredTasks = currentTasks.filter(task => task.completed);
    } else { // Assume label filter
        filteredTasks = currentTasks.filter(task => task.label && task.label.toLowerCase() === _currentFilter.toLowerCase() && !task.completed);
    }

    // Apply search term
    if (_currentSearchTerm) {
        const searchTermLower = _currentSearchTerm.toLowerCase();
        filteredTasks = filteredTasks.filter(task =>
            task.text.toLowerCase().includes(searchTermLower) ||
            (task.label && task.label.toLowerCase().includes(searchTermLower)) ||
            (task.notes && task.notes.toLowerCase().includes(searchTermLower))
        );
    }
    
    LoggingService.debug(`[ViewManager] Filtered tasks for bulk action count: ${filteredTasks.length}`, {
        functionName,
        filter: _currentFilter,
        searchTerm: _currentSearchTerm,
        taskCount: filteredTasks.length
    });
    return filteredTasks;
}


const ViewManager = {
    setTaskViewMode,
    getCurrentTaskViewMode,
    setCurrentFilter,
    getCurrentFilter,
    setCurrentSort,
    getCurrentSort,
    setCurrentSearchTerm,
    getCurrentSearchTerm,
    getFilteredTasksForBulkAction
};

export default ViewManager;