// viewManager.js
// Manages UI presentation state (current view mode, active filters, sort order, search terms)
// and publishes events when these states change.

(function() {
    // --- Internal State Variables (scoped to this IIFE) ---
    let _currentFilter = 'inbox';
    let _currentSort = 'default';
    let _currentSearchTerm = '';
    let _currentTaskViewMode = 'list';

    // Assumes EventBus is global from eventBus.js
    function _publish(eventName, data) {
        if (window.EventBus && typeof window.EventBus.publish === 'function') {
            EventBus.publish(eventName, data);
        } else {
            console.warn(`[ViewManager] EventBus not available to publish event: ${eventName}`);
        }
    }

    /**
     * Sets the current task view mode (e.g., 'list', 'kanban').
     * @param {string} mode - The view mode to set.
     */
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

    /**
     * Gets the current task view mode.
     * @returns {string} The current task view mode.
     */
    function getCurrentTaskViewMode() {
        return _currentTaskViewMode;
    }

    /**
     * Sets the current filter for displaying tasks.
     * Also resets the sort order to 'default' when the filter changes.
     * @param {string} filter - The filter to apply (e.g., 'inbox', 'today', 'project_123').
     */
    function setCurrentFilter(filter) {
        if (_currentFilter !== filter) {
            _currentFilter = filter;
            _currentSort = 'default'; // Reset sort when filter changes
            console.log(`[ViewManager] Current filter set to: ${_currentFilter}, sort reset to 'default'.`);
            _publish('filterChanged', { filter: _currentFilter, sort: _currentSort });
        }
    }

    /**
     * Gets the current active filter.
     * @returns {string} The current filter.
     */
    function getCurrentFilter() {
        return _currentFilter;
    }

    /**
     * Sets the current sort order for tasks.
     * @param {string} sortType - The sort type (e.g., 'dueDate', 'priority', 'default').
     */
    function setCurrentSort(sortType) {
        if (_currentSort !== sortType) {
            _currentSort = sortType;
            console.log(`[ViewManager] Current sort set to: ${_currentSort}`);
            _publish('sortChanged', _currentSort);
        }
    }

    /**
     * Gets the current sort order.
     * @returns {string} The current sort type.
     */
    function getCurrentSort() {
        return _currentSort;
    }

    /**
     * Sets the current search term.
     * @param {string} term - The search term.
     */
    function setCurrentSearchTerm(term) {
        const newTerm = term.toLowerCase();
        if (_currentSearchTerm !== newTerm) {
            _currentSearchTerm = newTerm;
            console.log(`[ViewManager] Current search term set to: "${_currentSearchTerm}"`);
            _publish('searchTermChanged', _currentSearchTerm);
        }
    }

    /**
     * Gets the current search term.
     * @returns {string} The current search term.
     */
    function getCurrentSearchTerm() {
        return _currentSearchTerm;
    }

    // Expose public interface
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

    console.log("viewManager.js loaded, now owns its UI state.");
})();
