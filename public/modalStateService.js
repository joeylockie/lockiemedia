// modalStateService.js
// Manages state related to which task is currently being interacted with in modals.

import EventBus from './eventBus.js';
// NEW: Import LoggingService
import LoggingService from './loggingService.js';

// --- Internal State (scoped to this module) ---
let _editingTaskId = null;
let _currentViewTaskId = null;

function _publish(eventName, data) {
    if (EventBus && typeof EventBus.publish === 'function') {
        EventBus.publish(eventName, data);
    } else {
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
    if (_editingTaskId !== taskId) {
        const oldId = _editingTaskId; // Capture old ID for logging
        _editingTaskId = taskId;
        LoggingService.info(`[ModalStateService] Editing Task ID set to: ${_editingTaskId}`, {
            functionName,
            newEditingTaskId: _editingTaskId,
            previousEditingTaskId: oldId 
        });
        _publish('editingTaskChanged', _editingTaskId);
    }
}

/**
 * Gets the ID of the task currently being edited.
 * @returns {number|null}
 */
function getEditingTaskId() {
    return _editingTaskId;
}

/**
 * Sets the ID of the task currently being viewed in detail.
 * @param {number|null} taskId - The ID of the task, or null if no task is being viewed.
 */
function setCurrentViewTaskId(taskId) {
    const functionName = 'setCurrentViewTaskId'; // For logging context
    if (_currentViewTaskId !== taskId) {
        const oldViewTaskId = _currentViewTaskId;
        _currentViewTaskId = taskId;
        LoggingService.info(`[ModalStateService] Current View Task ID set to: ${_currentViewTaskId}`, {
            functionName,
            newViewTaskId: _currentViewTaskId,
            previousViewTaskId: oldViewTaskId
        });
        _publish('viewingTaskChanged', _currentViewTaskId);
    }
}

/**
 * Gets the ID of the task currently being viewed in detail.
 * @returns {number|null}
 */
function getCurrentViewTaskId() {
    return _currentViewTaskId;
}

const ModalStateService = {
    setEditingTaskId,
    getEditingTaskId,
    setCurrentViewTaskId,
    getCurrentViewTaskId
};

export default ModalStateService;

// REMOVED: LoggingService.debug("modalStateService.js loaded as ES6 module.", { module: 'modalStateService' });
// console.log("modalStateService.js module parsed and ModalStateService object is now defined."); // Optional