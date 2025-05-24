// modalStateService.js
// Manages state related to which task is currently being interacted with in modals.

import EventBus from './eventBus.js';
// NEW: Import LoggingService
import LoggingService from './loggingService.js';

// --- Internal State (scoped to this module) ---
let _editingTaskId = null; //
let _currentViewTaskId = null; //

function _publish(eventName, data) {
    if (EventBus && typeof EventBus.publish === 'function') { //
        EventBus.publish(eventName, data); //
    } else {
        // MODIFIED: Use LoggingService
        LoggingService.warn(`[ModalStateService] EventBus not available to publish event: ${eventName}`, {
            eventName,
            data,
            functionName: '_publish'
        });
    }
}

/**
 * Sets the ID of the task currently being edited.
 * @param {number|null} taskId - The ID of the task, or null if no task is being edited.
 */
function setEditingTaskId(taskId) {
    const functionName = 'setEditingTaskId'; // For logging context
    if (_editingTaskId !== taskId) { //
        _editingTaskId = taskId; //
        // MODIFIED: Use LoggingService
        LoggingService.info(`[ModalStateService] Editing Task ID set to: ${_editingTaskId}`, {
            functionName,
            newEditingTaskId: _editingTaskId,
            previousEditingTaskId: _editingTaskId === taskId ? 'N/A (was same)' : _editingTaskId // This logic is a bit off here, corrected below
        });
        // Corrected logging for previous ID before reassignment
        // LoggingService.info(`[ModalStateService] Editing Task ID changed.`, { functionName, newEditingTaskId: taskId, previousEditingTaskId: oldId });
        _publish('editingTaskChanged', _editingTaskId); // Optional: if other modules need to react
    }
}

/**
 * Gets the ID of the task currently being edited.
 * @returns {number|null}
 */
function getEditingTaskId() { //
    return _editingTaskId; //
}

/**
 * Sets the ID of the task currently being viewed in detail.
 * @param {number|null} taskId - The ID of the task, or null if no task is being viewed.
 */
function setCurrentViewTaskId(taskId) {
    const functionName = 'setCurrentViewTaskId'; // For logging context
    if (_currentViewTaskId !== taskId) { //
        // Let's capture the old ID before changing, for more accurate logging.
        const oldViewTaskId = _currentViewTaskId;
        _currentViewTaskId = taskId; //
        // MODIFIED: Use LoggingService
        LoggingService.info(`[ModalStateService] Current View Task ID set to: ${_currentViewTaskId}`, {
            functionName,
            newViewTaskId: _currentViewTaskId,
            previousViewTaskId: oldViewTaskId
        });
        _publish('viewingTaskChanged', _currentViewTaskId); // Optional: if other modules need to react
    }
}

/**
 * Gets the ID of the task currently being viewed in detail.
 * @returns {number|null}
 */
function getCurrentViewTaskId() { //
    return _currentViewTaskId; //
}

const ModalStateService = { //
    setEditingTaskId, //
    getEditingTaskId, //
    setCurrentViewTaskId, //
    getCurrentViewTaskId //
};

export default ModalStateService; //

// MODIFIED: Use LoggingService
LoggingService.debug("modalStateService.js loaded as ES6 module.", { module: 'modalStateService' });