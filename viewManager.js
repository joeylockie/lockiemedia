// viewManager.js
// Manages UI presentation state (current view mode, active filters, sort order, search terms)
// and publishes events when these states change.

import EventBus from './eventBus.js';

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

// Export the public methods as a default object
const ViewManager = {
    setTaskViewMode,
    getCurrentTaskViewMode,
    setCurrentFilter,
    getCurrentFilter,
    setCurrentSort,
    getCurrentSort,
    setCurrentSearchTerm,
    getCurrentSearchTerm
};

export default ViewManager;

console.log("viewManager.js loaded as ES6 module, owns its UI state.");
