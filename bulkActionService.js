// bulkActionService.js
// This service manages the state and logic for bulk task actions.
// It now owns the selectedTaskIdsForBulkAction state and is an ES6 module.

import EventBus from './eventBus.js';
// NEW: Import LoggingService
import LoggingService from './loggingService.js';

// --- Internal State (scoped to this module) ---
let _selectedTaskIds = []; //

function _publish(eventName, data) {
    const functionName = '_publish (BulkActionService)';
    if (EventBus && typeof EventBus.publish === 'function') { //
        EventBus.publish(eventName, data); //
    } else {
        // MODIFIED: Use LoggingService
        LoggingService.warn(`[BulkActionService] EventBus not available to publish event: ${eventName}`, {
            eventName,
            data,
            functionName
        });
    }
}

/**
 * Toggles the selection state of a task for bulk actions.
 * @param {number} taskId - The ID of the task to select/deselect.
 */
export function toggleTaskSelection(taskId) {
    const functionName = 'toggleTaskSelection';
    const index = _selectedTaskIds.indexOf(taskId); //
    if (index > -1) { //
        _selectedTaskIds.splice(index, 1); // Deselect //
        // MODIFIED: Use LoggingService
        LoggingService.debug(`[BulkActionService] Task ${taskId} deselected for bulk action.`, {
            functionName,
            taskId,
            action: 'deselected',
            currentSelectionCount: _selectedTaskIds.length
        });
    } else {
        _selectedTaskIds.push(taskId); // Select //
        // MODIFIED: Use LoggingService
        LoggingService.debug(`[BulkActionService] Task ${taskId} selected for bulk action.`, {
            functionName,
            taskId,
            action: 'selected',
            currentSelectionCount: _selectedTaskIds.length
        });
    }
    // MODIFIED: Log the publish action
    LoggingService.debug(`[BulkActionService] Publishing bulkSelectionChanged. Selected IDs: ${_selectedTaskIds.join(', ')}`, {
        functionName,
        selectedIds: [..._selectedTaskIds]
    });
    _publish('bulkSelectionChanged', [..._selectedTaskIds]); // Publish a copy //
}

/**
 * Selects a task if it's not already selected.
 * Publishes 'bulkSelectionChanged' if the selection state changes.
 * @param {number} taskId - The ID of the task to select.
 */
export function selectTaskIfNotSelected(taskId) {
    const functionName = 'selectTaskIfNotSelected';
    if (!_selectedTaskIds.includes(taskId)) { //
        _selectedTaskIds.push(taskId); //
        // MODIFIED: Use LoggingService
        LoggingService.debug(`[BulkActionService] Task ${taskId} selected for bulk action (as it was not already selected).`, {
            functionName,
            taskId,
            currentSelectionCount: _selectedTaskIds.length
        });
        _publish('bulkSelectionChanged', [..._selectedTaskIds]); //
    } else {
        LoggingService.debug(`[BulkActionService] Task ${taskId} was already selected. No change made by selectTaskIfNotSelected.`, {
            functionName,
            taskId,
            currentSelectionCount: _selectedTaskIds.length
        });
    }
}

/**
 * Deselects a task if it's currently selected.
 * Publishes 'bulkSelectionChanged' if the selection state changes.
 * @param {number} taskId - The ID of the task to deselect.
 */
export function deselectTaskIfSelected(taskId) {
    const functionName = 'deselectTaskIfSelected';
    const index = _selectedTaskIds.indexOf(taskId); //
    if (index > -1) { //
        _selectedTaskIds.splice(index, 1); //
        // MODIFIED: Use LoggingService
        LoggingService.debug(`[BulkActionService] Task ${taskId} deselected from bulk action (as it was selected).`, {
            functionName,
            taskId,
            currentSelectionCount: _selectedTaskIds.length
        });
        _publish('bulkSelectionChanged', [..._selectedTaskIds]); //
    } else {
        LoggingService.debug(`[BulkActionService] Task ${taskId} was not selected. No change made by deselectTaskIfSelected.`, {
            functionName,
            taskId,
            currentSelectionCount: _selectedTaskIds.length
        });
    }
}

/**
 * Clears all selected tasks for bulk actions.
 */
export function clearSelections() {
    const functionName = 'clearSelections';
    if (_selectedTaskIds.length > 0) { // Only publish if there was a change //
        const previousSelectionCount = _selectedTaskIds.length;
        _selectedTaskIds = []; //
        // MODIFIED: Use LoggingService
        LoggingService.info("[BulkActionService] Bulk action selections cleared.", {
            functionName,
            previousSelectionCount
        });
        _publish('bulkSelectionChanged', []); //
    } else {
        // MODIFIED: Log even if no change, but at debug level
        LoggingService.debug("[BulkActionService] Attempted to clear bulk selections, but none were selected.", { functionName });
    }
}

/**
 * Gets a copy of the array of currently selected task IDs for bulk actions.
 * @returns {number[]} An array of task IDs.
 */
export function getSelectedIds() { //
    return [..._selectedTaskIds]; // Return a copy //
}

// MODIFIED: Use LoggingService
LoggingService.debug("bulkActionService.js loaded as ES6 module.", { module: 'bulkActionService' });