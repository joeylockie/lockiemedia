// feature_sub_tasks.js
// Manages sub-task logic and UI interactions.
// Now an ES6 module.

// import { isFeatureEnabled } from './featureFlagService.js'; // REMOVED
import AppStore from './store.js';
// showMessage and other UI rendering functions are still global for now.

/**
 * Initializes the Sub-tasks Feature.
 */
function initialize() {
    console.log('[SubTasksFeature] Initialized.');
}

/**
 * Updates the visibility of any global Sub-tasks UI elements.
 * @param {boolean} isEnabledParam - (Not used directly, uses imported isFeatureEnabled)
 */
function updateUIVisibility(isEnabledParam) {
    if (typeof window.isFeatureEnabled !== 'function') { // MODIFIED to check window
        console.error("[SubTasksFeature] isFeatureEnabled function not available.");
        return;
    }
    const isActuallyEnabled = window.isFeatureEnabled('subTasksFeature'); // MODIFIED to use window
    document.querySelectorAll('.sub-tasks-feature-element').forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));
    console.log(`[SubTasksFeature] UI elements visibility/behavior updated based on feature flag: ${isActuallyEnabled}`);
}

/**
 * Adds a new sub-task to a parent task.
 * @param {number|string} parentId - The ID of the parent task.
 * @param {string} subTaskText - The text content of the new sub-task.
 * @returns {boolean} True if the sub-task was added successfully, false otherwise.
 */
function addSubTaskLogic(parentId, subTaskText) {
    if (!window.isFeatureEnabled('subTasksFeature') || !AppStore) { // MODIFIED to use window
        console.warn('[SubTasksFeature] Feature disabled or AppStore not available for addSubTaskLogic.');
        return false;
    }
    if (!parentId || !subTaskText || !subTaskText.trim()) {
        console.warn('[SubTasksFeature] Invalid parameters for addSubTaskLogic.');
        return false;
    }

    let currentTasks = AppStore.getTasks();
    const parentTaskIndex = currentTasks.findIndex(t => t.id === parentId);
    if (parentTaskIndex === -1) {
        console.error('[SubTasksFeature] Parent task not found for adding sub-task.');
        return false;
    }

    if (!currentTasks[parentTaskIndex].subTasks) {
        currentTasks[parentTaskIndex].subTasks = [];
    }

    const newSubTask = {
        id: Date.now() + Math.random(), 
        text: subTaskText.trim(),
        completed: false,
        creationDate: Date.now()
    };

    currentTasks[parentTaskIndex].subTasks.push(newSubTask);
    AppStore.setTasks(currentTasks); // This will save and publish 'tasksChanged'
    console.log('[SubTasksFeature] Sub-task added:', newSubTask, 'to parent:', parentId);
    return true;
}

/**
 * Edits the text of an existing sub-task.
 * @param {number|string} parentId - The ID of the parent task.
 * @param {number|string} subTaskId - The ID of the sub-task to edit.
 * @param {string} newText - The new text content for the sub-task.
 * @returns {boolean} True if the sub-task was edited successfully, false otherwise.
 */
function editSubTaskLogic(parentId, subTaskId, newText) {
    if (!window.isFeatureEnabled('subTasksFeature') || !AppStore) return false; // MODIFIED to use window
    if (!parentId || !subTaskId || !newText || !newText.trim()) return false;

    let currentTasks = AppStore.getTasks();
    const parentTaskIndex = currentTasks.findIndex(t => t.id === parentId);
    if (parentTaskIndex === -1 || !currentTasks[parentTaskIndex].subTasks) return false;

    const subTaskIndex = currentTasks[parentTaskIndex].subTasks.findIndex(st => st.id === subTaskId);
    if (subTaskIndex === -1) return false;

    currentTasks[parentTaskIndex].subTasks[subTaskIndex].text = newText.trim();
    AppStore.setTasks(currentTasks);
    console.log('[SubTasksFeature] Sub-task edited:', subTaskId, 'in parent:', parentId);
    return true;
}

/**
 * Toggles the completion status of a sub-task.
 * @param {number|string} parentId - The ID of the parent task.
 * @param {number|string} subTaskId - The ID of the sub-task to toggle.
 * @returns {boolean} True if the sub-task was toggled successfully, false otherwise.
 */
function toggleSubTaskCompleteLogic(parentId, subTaskId) {
    if (!window.isFeatureEnabled('subTasksFeature') || !AppStore) return false; // MODIFIED to use window
    if (!parentId || !subTaskId) return false;

    let currentTasks = AppStore.getTasks();
    const parentTaskIndex = currentTasks.findIndex(t => t.id === parentId);
    if (parentTaskIndex === -1 || !currentTasks[parentTaskIndex].subTasks) return false;

    const subTaskIndex = currentTasks[parentTaskIndex].subTasks.findIndex(st => st.id === subTaskId);
    if (subTaskIndex === -1) return false;

    currentTasks[parentTaskIndex].subTasks[subTaskIndex].completed = !currentTasks[parentTaskIndex].subTasks[subTaskIndex].completed;
    AppStore.setTasks(currentTasks);
    console.log('[SubTasksFeature] Sub-task completion toggled:', subTaskId, 'in parent:', parentId);
    return true;
}

/**
 * Deletes a sub-task from a parent task.
 * @param {number|string} parentId - The ID of the parent task.
 * @param {number|string} subTaskId - The ID of the sub-task to delete.
 * @returns {boolean} True if the sub-task was deleted successfully, false otherwise.
 */
function deleteSubTaskLogic(parentId, subTaskId) {
    if (!window.isFeatureEnabled('subTasksFeature') || !AppStore) return false; // MODIFIED to use window
    if (!parentId || !subTaskId) return false;

    let currentTasks = AppStore.getTasks();
    const parentTaskIndex = currentTasks.findIndex(t => t.id === parentId);
    if (parentTaskIndex === -1 || !currentTasks[parentTaskIndex].subTasks) return false;

    const initialLength = currentTasks[parentTaskIndex].subTasks.length;
    currentTasks[parentTaskIndex].subTasks = currentTasks[parentTaskIndex].subTasks.filter(st => st.id !== subTaskId);

    if (currentTasks[parentTaskIndex].subTasks.length < initialLength) {
        AppStore.setTasks(currentTasks);
        console.log('[SubTasksFeature] Sub-task deleted:', subTaskId, 'from parent:', parentId);
        return true;
    }
    return false;
}

export const SubTasksFeature = {
    initialize,
    updateUIVisibility,
    add: addSubTaskLogic,
    edit: editSubTaskLogic,
    toggleComplete: toggleSubTaskCompleteLogic,
    delete: deleteSubTaskLogic
};

console.log("feature_sub_tasks.js loaded as ES6 module.");