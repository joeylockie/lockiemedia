// viewManager.js
// Manages UI presentation state (current view mode, active filters, sort order, search terms)
// and publishes events when these states change.

import EventBus from './eventBus.js';
import AppStore from './store.js'; // Import AppStore to access tasks
import { isFeatureEnabled } from './featureFlagService.js'; // Import for project feature check

// --- Internal State Variables (scoped to this module) ---
let _currentFilter = 'inbox';
let _currentSort = 'default';
let _currentSearchTerm = '';
let _currentTaskViewMode = 'list';

function _publish(eventName, data) {
    if (EventBus && typeof EventBus.publish === 'function') {
        EventBus.publish(eventName, data);
    } else {
        console.warn(`[ViewManager] EventBus not available to publish event: ${eventName}`);
    }
}

function setTaskViewMode(mode) {
    if (['list', 'kanban', 'calendar', 'pomodoro'].includes(mode)) {
        if (_currentTaskViewMode !== mode) {
            _currentTaskViewMode = mode;
            console.log(`[ViewManager] Task view mode changed to: ${_currentTaskViewMode}`);
            _publish('viewModeChanged', _currentTaskViewMode);
        }
    } else {
        console.warn(`[ViewManager] Attempted to set invalid task view mode: ${mode}`);
    }
}

function getCurrentTaskViewMode() {
    return _currentTaskViewMode;
}

function setCurrentFilter(filter) {
    if (_currentFilter !== filter) {
        _currentFilter = filter;
        _currentSort = 'default'; // Reset sort when filter changes
        console.log(`[ViewManager] Current filter set to: ${_currentFilter}, sort reset to 'default'.`);
        _publish('filterChanged', { filter: _currentFilter, sort: _currentSort });
    }
}

function getCurrentFilter() {
    return _currentFilter;
}

function setCurrentSort(sortType) {
    if (_currentSort !== sortType) {
        _currentSort = sortType;
        console.log(`[ViewManager] Current sort set to: ${_currentSort}`);
        _publish('sortChanged', _currentSort);
    }
}

function getCurrentSort() {
    return _currentSort;
}

function setCurrentSearchTerm(term) {
    const newTerm = term.toLowerCase();
    if (_currentSearchTerm !== newTerm) {
        _currentSearchTerm = newTerm;
        console.log(`[ViewManager] Current search term set to: "${_currentSearchTerm}"`);
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
    if (!AppStore || typeof AppStore.getTasks !== 'function') {
        console.error("[ViewManager] AppStore not available to get tasks for filtering.");
        return [];
    }
    const currentTasks = AppStore.getTasks();
    const currentProjects = AppStore.getProjects ? AppStore.getProjects() : []; // Handle if getProjects isn't there

    let filteredTasks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Apply filters (similar to renderTaskListView logic)
    if (_currentFilter === 'inbox') {
        filteredTasks = currentTasks.filter(task => !task.completed);
    } else if (_currentFilter === 'today') {
        filteredTasks = currentTasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const taskDueDate = new Date(task.dueDate + 'T00:00:00'); // Ensure time part doesn't affect date comparison
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
    } else if (_currentFilter.startsWith('project_')) {
        const projectId = parseInt(_currentFilter.split('_')[1]);
        if (!isNaN(projectId)) {
            filteredTasks = currentTasks.filter(task => task.projectId === projectId && !task.completed);
        } else { // This might handle a "No Project" filter if its value is project_0 or similar
            filteredTasks = currentTasks.filter(task => !task.projectId && !task.completed);
        }
    } else { // Assume label filter
        filteredTasks = currentTasks.filter(task => task.label && task.label.toLowerCase() === _currentFilter.toLowerCase() && !task.completed);
    }

    // Apply search term
    if (_currentSearchTerm) {
        const searchTermLower = _currentSearchTerm.toLowerCase();
        filteredTasks = filteredTasks.filter(task =>
            task.text.toLowerCase().includes(searchTermLower) ||
            (task.label && task.label.toLowerCase().includes(searchTermLower)) ||
            (task.notes && task.notes.toLowerCase().includes(searchTermLower)) ||
            (isFeatureEnabled('projectFeature') && task.projectId && currentProjects.find(p => p.id === task.projectId)?.name.toLowerCase().includes(searchTermLower))
        );
    }
    // Note: This function does not apply sorting, as "Select All" typically applies to the filtered set regardless of sort order.
    return filteredTasks;
}


// Export the public methods as a default object
const ViewManager = {
    setTaskViewMode,
    getCurrentTaskViewMode,
    setCurrentFilter,
    getCurrentFilter,
    setCurrentSort,
    getCurrentSort,
    setCurrentSearchTerm,
    getCurrentSearchTerm,
    getFilteredTasksForBulkAction // Export the new function
};

export default ViewManager;

console.log("viewManager.js loaded as ES6 module, owns its UI state.");