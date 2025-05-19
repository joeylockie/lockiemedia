// modalStateService.js
// Manages state related to which task is currently being interacted with in modals.

import EventBus from './eventBus.js'; // Assuming EventBus is an ES6 module

// --- Internal State (scoped to this module) ---
let _editingTaskId = null;
let _currentViewTaskId = null;

function _publish(eventName, data) {
    if (EventBus && typeof EventBus.publish === 'function') {
        EventBus.publish(eventName, data);
    } else {
        console.warn(`[ModalStateService] EventBus not available to publish event: ${eventName}`);
    }
}

/**
 * Sets the ID of the task currently being edited.
 * @param {number|null} taskId - The ID of the task, or null if no task is being edited.
 */
function setEditingTaskId(taskId) {
    if (_editingTaskId !== taskId) {
        _editingTaskId = taskId;
        console.log(`[ModalStateService] Editing Task ID set to: ${_editingTaskId}`);
        _publish('editingTaskChanged', _editingTaskId); // Optional: if other modules need to react
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
    if (_currentViewTaskId !== taskId) {
        _currentViewTaskId = taskId;
        console.log(`[ModalStateService] Current View Task ID set to: ${_currentViewTaskId}`);
        _publish('viewingTaskChanged', _currentViewTaskId); // Optional: if other modules need to react
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

console.log("modalStateService.js loaded as ES6 module.");
