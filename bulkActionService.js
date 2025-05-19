// bulkActionService.js
// This service manages the state and logic for bulk task actions.
// It relies on the 'selectedTaskIdsForBulkAction' array from store.js and EventBus.

function toggleTaskSelectionForBulkAction(taskId) {
    if (typeof selectedTaskIdsForBulkAction === 'undefined' || typeof EventBus === 'undefined') {
        console.error("[BulkActionService] 'selectedTaskIdsForBulkAction' or 'EventBus' not defined.");
        return;
    }

    const index = selectedTaskIdsForBulkAction.indexOf(taskId);
    if (index > -1) {
        selectedTaskIdsForBulkAction.splice(index, 1);
    } else {
        selectedTaskIdsForBulkAction.push(taskId);
    }
    console.log("[BulkActionService] Selected tasks for bulk action:", selectedTaskIdsForBulkAction);
    EventBus.publish('bulkSelectionChanged', [...selectedTaskIdsForBulkAction]);

    // UI update for controls is now handled by subscriber to 'bulkSelectionChanged' (e.g., in ui_rendering.js)
    // if (typeof renderBulkActionControls === 'function') {
    //     renderBulkActionControls();
    // }
}

function clearBulkActionSelections() {
    if (typeof selectedTaskIdsForBulkAction === 'undefined' || typeof EventBus === 'undefined') {
        console.error("[BulkActionService] 'selectedTaskIdsForBulkAction' or 'EventBus' not defined.");
        return;
    }
    if (selectedTaskIdsForBulkAction.length > 0) { // Only publish if there was a change
        selectedTaskIdsForBulkAction = [];
        window.selectedTaskIdsForBulkAction = []; // Ensure global in store.js is updated
        console.log("[BulkActionService] Bulk action selections cleared.");
        EventBus.publish('bulkSelectionChanged', []);
    }
    // UI update for controls is now handled by subscriber
    // if (typeof renderBulkActionControls === 'function') {
    //     renderBulkActionControls();
    // }
}

function getSelectedTaskIdsForBulkAction() {
    if (typeof selectedTaskIdsForBulkAction === 'undefined') {
        return [];
    }
    return [...selectedTaskIdsForBulkAction];
}

window.BulkActionService = {
    toggleTaskSelection: toggleTaskSelectionForBulkAction,
    clearSelections: clearBulkActionSelections,
    getSelectedIds: getSelectedTaskIdsForBulkAction
};

// console.log("bulkActionService.js loaded");
