// viewManager.js
// Manages UI presentation state (current view mode, active filters, sort order, search terms)
// and publishes events when these states change.

import EventBus from './eventBus.js';
import AppStore from './store.js'; // Import AppStore to access tasks
// import { isFeatureEnabled } from './featureFlagService.js'; // REMOVED
// NEW: Import LoggingService
import LoggingService from './loggingService.js';

// --- Internal State Variables (scoped to this module) ---
let _currentFilter = 'inbox'; //
let _currentSort = 'default'; //
let _currentSearchTerm = ''; //
let _currentTaskViewMode = 'list'; //

function _publish(eventName, data) {
    if (EventBus && typeof EventBus.publish === 'function') { //
        EventBus.publish(eventName, data); //
    } else {
        // MODIFIED: Use LoggingService
        LoggingService.warn(`[ViewManager] EventBus not available to publish event: ${eventName}`, { eventName, data, functionName: '_publish' });
    }
}

function setTaskViewMode(mode) {
    const functionName = 'setTaskViewMode'; // For logging context
    if (['list', 'kanban', 'calendar', 'pomodoro'].includes(mode)) { //
        if (_currentTaskViewMode !== mode) { //
            _currentTaskViewMode = mode; //
            // MODIFIED: Use LoggingService
            LoggingService.info(`[ViewManager] Task view mode changed to: ${_currentTaskViewMode}`, { newMode: _currentTaskViewMode, functionName });
            _publish('viewModeChanged', _currentTaskViewMode); //
        }
    } else {
        // MODIFIED: Use LoggingService
        LoggingService.warn(`[ViewManager] Attempted to set invalid task view mode: ${mode}`, { attemptedMode: mode, functionName });
    }
}

function getCurrentTaskViewMode() { //
    return _currentTaskViewMode; //
}

function setCurrentFilter(filter) {
    const functionName = 'setCurrentFilter'; // For logging context
    if (_currentFilter !== filter) { //
        _currentFilter = filter; //
        _currentSort = 'default'; // Reset sort when filter changes //
        // MODIFIED: Use LoggingService
        LoggingService.info(`[ViewManager] Current filter set to: ${_currentFilter}, sort reset to 'default'.`, { newFilter: _currentFilter, newSort: _currentSort, functionName });
        _publish('filterChanged', { filter: _currentFilter, sort: _currentSort }); //
    }
}

function getCurrentFilter() { //
    return _currentFilter; //
}

function setCurrentSort(sortType) {
    const functionName = 'setCurrentSort'; // For logging context
    if (_currentSort !== sortType) { //
        _currentSort = sortType; //
        // MODIFIED: Use LoggingService
        LoggingService.info(`[ViewManager] Current sort set to: ${_currentSort}`, { newSort: _currentSort, functionName });
        _publish('sortChanged', _currentSort); //
    }
}

function getCurrentSort() { //
    return _currentSort; //
}

function setCurrentSearchTerm(term) {
    const functionName = 'setCurrentSearchTerm'; // For logging context
    const newTerm = term.toLowerCase(); //
    if (_currentSearchTerm !== newTerm) { //
        _currentSearchTerm = newTerm; //
        // MODIFIED: Use LoggingService
        LoggingService.info(`[ViewManager] Current search term set to: "${_currentSearchTerm}"`, { newSearchTerm: _currentSearchTerm, functionName });
        _publish('searchTermChanged', _currentSearchTerm); //
    }
}

function getCurrentSearchTerm() { //
    return _currentSearchTerm; //
}

/**
 * Gets the tasks that are currently visible based on active filters and search terms.
 * This is used by the "Select All" bulk action functionality.
 * @returns {Array<Object>} An array of task objects.
 */
function getFilteredTasksForBulkAction() {
    const functionName = 'getFilteredTasksForBulkAction'; // For logging context
    if (!AppStore || typeof AppStore.getTasks !== 'function') { //
        // MODIFIED: Use LoggingService
        LoggingService.error("[ViewManager] AppStore not available to get tasks for filtering.", new Error("AppStoreMissing"), { functionName });
        return []; //
    }
    const currentTasks = AppStore.getTasks(); //
    const currentProjects = AppStore.getProjects ? AppStore.getProjects() : []; // Handle if getProjects isn't there //
    if (!AppStore.getProjects) {
        LoggingService.debug("[ViewManager] AppStore.getProjects function not available.", { functionName });
    }

    let filteredTasks = []; //
    const today = new Date(); //
    today.setHours(0, 0, 0, 0); //
    const shoppingLabels = ['shopping', 'buy', 'store'];

    // Apply filters (similar to renderTaskListView logic)
    if (_currentFilter === 'inbox') { //
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
    } else if (_currentFilter === 'today') { //
        filteredTasks = currentTasks.filter(task => { //
            if (!task.dueDate || task.completed) return false; //
            const taskDueDate = new Date(task.dueDate + 'T00:00:00'); // Ensure time part doesn't affect date comparison //
            return taskDueDate.getTime() === today.getTime(); //
        });
    } else if (_currentFilter === 'upcoming') { //
        filteredTasks = currentTasks.filter(task => { //
            if (!task.dueDate || task.completed) return false; //
            const taskDueDate = new Date(task.dueDate + 'T00:00:00'); //
            return taskDueDate.getTime() > today.getTime(); //
        });
    } else if (_currentFilter === 'completed') { //
        filteredTasks = currentTasks.filter(task => task.completed); //
    } else if (_currentFilter.startsWith('project_')) { //
        const projectIdToFilter = parseInt(_currentFilter.split('_')[1]); // Renamed for clarity
        if (!isNaN(projectIdToFilter)) { //
            filteredTasks = currentTasks.filter(task => task.projectId === projectIdToFilter && !task.completed); //
        } else { // This might handle a "No Project" filter if its value is project_0 or similar //
             // Assuming "No Project" tasks have projectId as 0 or undefined/null
            filteredTasks = currentTasks.filter(task => (task.projectId === 0 || !task.projectId) && !task.completed);
        }
    } else { // Assume label filter //
        filteredTasks = currentTasks.filter(task => task.label && task.label.toLowerCase() === _currentFilter.toLowerCase() && !task.completed); //
    }

    // Apply search term
    if (_currentSearchTerm) { //
        const searchTermLower = _currentSearchTerm.toLowerCase(); //
        filteredTasks = filteredTasks.filter(task => //
            task.text.toLowerCase().includes(searchTermLower) || //
            (task.label && task.label.toLowerCase().includes(searchTermLower)) || //
            (task.notes && task.notes.toLowerCase().includes(searchTermLower)) || //
            (window.isFeatureEnabled('projectFeature') && task.projectId && currentProjects.find(p => p.id === task.projectId)?.name.toLowerCase().includes(searchTermLower)) // MODIFIED to use window
        );
    }
    // Note: This function does not apply sorting, as "Select All" typically applies to the filtered set regardless of sort order.
    // MODIFIED: Log the result (debug level might be appropriate if called frequently)
    LoggingService.debug(`[ViewManager] Filtered tasks for bulk action count: ${filteredTasks.length}`, {
        functionName,
        filter: _currentFilter,
        searchTerm: _currentSearchTerm,
        taskCount: filteredTasks.length
    });
    return filteredTasks; //
}


// Export the public methods as a default object
const ViewManager = { //
    setTaskViewMode, //
    getCurrentTaskViewMode, //
    setCurrentFilter, //
    getCurrentFilter, //
    setCurrentSort, //
    getCurrentSort, //
    setCurrentSearchTerm, //
    getCurrentSearchTerm, //
    getFilteredTasksForBulkAction // Export the new function //
};

export default ViewManager; //

// REMOVED: LoggingService.debug("viewManager.js loaded as ES6 module, owns its UI state.", { module: 'viewManager' });
// console.log("viewManager.js module parsed and ViewManager object is now defined."); // Optional