// bulkActionService.js
// This service manages the state and logic for bulk task actions.
// It relies on the 'selectedTaskIdsForBulkAction' array from store.js.

/**
 * Toggles the selection state of a task for bulk actions.
 * @param {number} taskId - The ID of the task to select/deselect.
 */
function toggleTaskSelectionForBulkAction(taskId) {
    // Assumes selectedTaskIdsForBulkAction is a global array from store.js
    if (typeof selectedTaskIdsForBulkAction === 'undefined') {
        console.error("[BulkActionService] 'selectedTaskIdsForBulkAction' is not defined. Ensure store.js is loaded.");
        return;
    }

    const index = selectedTaskIdsForBulkAction.indexOf(taskId);
    if (index > -1) {
        selectedTaskIdsForBulkAction.splice(index, 1); // Deselect
    } else {
        selectedTaskIdsForBulkAction.push(taskId); // Select
    }
    console.log("[BulkActionService] Selected tasks for bulk action:", selectedTaskIdsForBulkAction);

    // Future: This service might emit an event 'bulkSelectionChanged'
    // or directly call a UI update function for bulk action controls.
    // For now, UI updates are likely triggered elsewhere after this call.
    if (typeof renderBulkActionControls === 'function') { // Check if ui_rendering function is available
        renderBulkActionControls();
    }
}

/**
 * Clears all selected tasks for bulk actions.
 */
function clearBulkActionSelections() {
    // Assumes selectedTaskIdsForBulkAction is a global array from store.js
    if (typeof selectedTaskIdsForBulkAction === 'undefined') {
        console.error("[BulkActionService] 'selectedTaskIdsForBulkAction' is not defined. Ensure store.js is loaded.");
        return;
    }
    selectedTaskIdsForBulkAction = []; // Re-assign to clear
    // Update the global variable in store.js if it's not directly this one
    // For now, we assume this direct modification is okay due to global scope.
    // A better approach would be: store.setSelectedTaskIdsForBulkAction([]);
    window.selectedTaskIdsForBulkAction = []; // Make sure the global in store.js is updated

    console.log("[BulkActionService] Bulk action selections cleared.");

    if (typeof renderBulkActionControls === 'function') {
        renderBulkActionControls();
    }
}

/**
 * Gets a copy of the array of currently selected task IDs for bulk actions.
 * @returns {number[]} An array of task IDs.
 */
function getSelectedTaskIdsForBulkAction() {
    // Assumes selectedTaskIdsForBulkAction is a global array from store.js
    if (typeof selectedTaskIdsForBulkAction === 'undefined') {
        console.error("[BulkActionService] 'selectedTaskIdsForBulkAction' is not defined. Ensure store.js is loaded.");
        return [];
    }
    return [...selectedTaskIdsForBulkAction]; // Return a copy
}

// Expose public interface (globally for now)
window.BulkActionService = {
    toggleTaskSelection: toggleTaskSelectionForBulkAction,
    clearSelections: clearBulkActionSelections,
    getSelectedIds: getSelectedTaskIdsForBulkAction
};

// console.log("bulkActionService.js loaded");
