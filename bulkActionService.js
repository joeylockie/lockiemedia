// bulkActionService.js
// This service manages the state and logic for bulk task actions.
// It now owns the selectedTaskIdsForBulkAction state and is an ES6 module.

import EventBus from './eventBus.js';

// --- Internal State (scoped to this module) ---
let _selectedTaskIds = [];

function _publish(eventName, data) {
    if (EventBus && typeof EventBus.publish === 'function') {
        EventBus.publish(eventName, data);
    } else {
        console.warn(`[BulkActionService] EventBus not available to publish event: ${eventName}`);
    }
}

/**
 * Toggles the selection state of a task for bulk actions.
 * @param {number} taskId - The ID of the task to select/deselect.
 */
export function toggleTaskSelection(taskId) {
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
 * Selects a task if it's not already selected.
 * Publishes 'bulkSelectionChanged' if the selection state changes.
 * @param {number} taskId - The ID of the task to select.
 */
export function selectTaskIfNotSelected(taskId) {
    if (!_selectedTaskIds.includes(taskId)) {
        _selectedTaskIds.push(taskId);
        console.log(`[BulkActionService] Task ${taskId} selected for bulk action.`);
        _publish('bulkSelectionChanged', [..._selectedTaskIds]);
    }
}

/**
 * Deselects a task if it's currently selected.
 * Publishes 'bulkSelectionChanged' if the selection state changes.
 * @param {number} taskId - The ID of the task to deselect.
 */
export function deselectTaskIfSelected(taskId) {
    const index = _selectedTaskIds.indexOf(taskId);
    if (index > -1) {
        _selectedTaskIds.splice(index, 1);
        console.log(`[BulkActionService] Task ${taskId} deselected from bulk action.`);
        _publish('bulkSelectionChanged', [..._selectedTaskIds]);
    }
}

/**
 * Clears all selected tasks for bulk actions.
 */
export function clearSelections() {
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
export function getSelectedIds() {
    return [..._selectedTaskIds]; // Return a copy
}

console.log("bulkActionService.js loaded as ES6 module.");