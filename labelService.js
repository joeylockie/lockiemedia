// labelService.js
// This service handles logic related to managing labels.

import AppStore from './store.js';
import EventBus from './eventBus.js';
// showMessage is currently a global function from ui_rendering.js.
// It will be properly imported when ui_rendering.js becomes a module.

/**
 * Deletes a label from all tasks that use it and triggers an update of the unique labels list.
 * @param {string} labelNameToDelete - The name of the label to delete.
 * @returns {boolean} True if any tasks were updated, false otherwise.
 */
export function deleteLabelUsageFromTasks(labelNameToDelete) {
    if (!AppStore || typeof AppStore.getTasks !== 'function' || typeof AppStore.setTasks !== 'function') {
        console.error("[LabelService] AppStore API not available for deleteLabelUsageFromTasks.");
        if (typeof showMessage === 'function') showMessage('Error processing label deletion: core data missing.', 'error');
        return false;
    }
    if (!labelNameToDelete || typeof labelNameToDelete !== 'string') {
        console.warn("[LabelService] Invalid label name provided for deletion.");
        return false;
    }

    let currentTasks = AppStore.getTasks();
    let tasksModified = false;
    const updatedTasks = currentTasks.map(task => {
        if (task.label && task.label.toLowerCase() === labelNameToDelete.toLowerCase()) {
            tasksModified = true;
            return { ...task, label: '' }; // Remove the label from the task
        }
        return task;
    });

    if (tasksModified) {
        AppStore.setTasks(updatedTasks); // This will persist changes and trigger events via AppStore
        console.log(`[LabelService] Label "${labelNameToDelete}" removed from tasks.`);
        return true;
    } else {
        console.log(`[LabelService] Label "${labelNameToDelete}" not found on any tasks.`);
        return false; 
    }
}

/**
 * Conceptually adds a label to the system.
 * @param {string} labelName - The name of the label to add.
 * @returns {boolean} True if the label was new and conceptually added, false if it already exists or invalid.
 */
export function addConceptualLabel(labelName) {
    if (!AppStore || typeof AppStore.getUniqueLabels !== 'function' || !EventBus || typeof showMessage !== 'function') {
        console.error("[LabelService] Core dependencies (AppStore, EventBus, showMessage) not available.");
        return false;
    }
    const trimmedLabelName = labelName.trim();
    if (trimmedLabelName === '') {
        showMessage('Label name cannot be empty.', 'error');
        return false;
    }
    
    let currentUniqueLabels = AppStore.getUniqueLabels();
    if (currentUniqueLabels.some(l => l.toLowerCase() === trimmedLabelName.toLowerCase())) {
        showMessage(`Label "${trimmedLabelName}" already conceptually exists or is in use.`, 'info');
        return false; 
    }

    // This function's purpose is primarily for UI feedback for the datalist.
    // The actual uniqueLabels list in AppStore is derived from tasks when AppStore.setTasks is called.
    // To make the new label immediately available in datalists before a task uses it,
    // we can publish an event that ui_rendering.js can listen to, to temporarily update its datalist source.
    // However, a simpler approach for now is to rely on the fact that after adding a task with this new label,
    // saveTasks() -> _updateUniqueLabelsInternal() -> EventBus.publish('labelsChanged', ...) will occur.
    // For the "Manage Labels" modal, if we want it to appear immediately, we might need a direct update
    // or a more specific event.
    
    // For immediate UI update of datalists, we can publish a 'labelAddedToSuggestions' event.
    // Or, the `populateManageLabelsList` in `modal_interactions.js` could be made smarter.
    // Let's assume for now that the "Manage Labels" modal's list will refresh upon next 'labelsChanged' event
    // after a task actually uses this new label.
    // The `addConceptualLabel` is more about validating and giving immediate feedback.
    
    console.log(`[LabelService] Label "${trimmedLabelName}" conceptually added. Assign it to a task to persist it in the unique labels list.`);
    // We can temporarily add it to a local list for datalist population if ui_rendering.js handles that.
    // For now, let's just return true and let the user assign it.
    // The 'labelsChanged' event from store.js (after a task with this label is saved) will refresh datalists.
    return true; 
}

console.log("labelService.js loaded as ES6 module.");
