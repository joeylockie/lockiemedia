// bulkActionService.js
// This service manages the state and logic for bulk task actions.
// It now owns the selectedTaskIdsForBulkAction state.

(function() {
    // --- Internal State (scoped to this IIFE) ---
    let _selectedTaskIds = [];

    // Assumes EventBus is global from eventBus.js
    function _publish(eventName, data) {
        if (window.EventBus && typeof window.EventBus.publish === 'function') {
            EventBus.publish(eventName, data);
        } else {
            console.warn(`[BulkActionService] EventBus not available to publish event: ${eventName}`);
        }
    }

    /**
     * Toggles the selection state of a task for bulk actions.
     * @param {number} taskId - The ID of the task to select/deselect.
     */
    function toggleTaskSelection(taskId) {
        const index = _selectedTaskIds.indexOf(taskId);
        if (index > -1) {
            _selectedTaskIds.splice(index, 1); // Deselect
        } else {
            _selectedTaskIds.push(taskId); // Select
        }
        console.log("[BulkActionService] Selected tasks for bulk action:", [..._selectedTaskIds]);
        _publish('bulkSelectionChanged', [..._selectedTaskIds]); // Publish a copy
    }

    /**
     * Clears all selected tasks for bulk actions.
     */
    function clearSelections() {
        if (_selectedTaskIds.length > 0) { // Only publish if there was a change
            _selectedTaskIds = [];
            console.log("[BulkActionService] Bulk action selections cleared.");
            _publish('bulkSelectionChanged', []);
        }
    }

    /**
     * Gets a copy of the array of currently selected task IDs for bulk actions.
     * @returns {number[]} An array of task IDs.
     */
    function getSelectedIds() {
        return [..._selectedTaskIds]; // Return a copy
    }

    // Expose public interface
    window.BulkActionService = {
        toggleTaskSelection,
        clearSelections,
        getSelectedIds
    };

    console.log("bulkActionService.js loaded, now owns its selection state.");
})();
