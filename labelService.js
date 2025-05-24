// labelService.js
// This service handles logic related to managing labels.

import AppStore from './store.js';
import EventBus from './eventBus.js'; //
// NEW: Import LoggingService
import LoggingService from './loggingService.js';
// showMessage is currently a global function from ui_rendering.js.
// It will be properly imported when ui_rendering.js becomes a module.

/**
 * Deletes a label from all tasks that use it and triggers an update of the unique labels list.
 * @param {string} labelNameToDelete - The name of the label to delete.
 * @returns {boolean} True if any tasks were updated, false otherwise.
 */
export function deleteLabelUsageFromTasks(labelNameToDelete) {
    const functionName = 'deleteLabelUsageFromTasks'; // For logging context
    if (!AppStore || typeof AppStore.getTasks !== 'function' || typeof AppStore.setTasks !== 'function') { //
        // MODIFIED: Use LoggingService
        LoggingService.error("[LabelService] AppStore API not available.", new Error("AppStoreMissing"), { functionName, labelName: labelNameToDelete });
        if (typeof showMessage === 'function') showMessage('Error processing label deletion: core data missing.', 'error'); //
        return false; //
    }
    if (!labelNameToDelete || typeof labelNameToDelete !== 'string') { //
        // MODIFIED: Use LoggingService
        LoggingService.warn("[LabelService] Invalid label name provided for deletion.", { functionName, receivedName: labelNameToDelete });
        // No showMessage here as this is more of an internal validation.
        return false; //
    }

    let currentTasks = AppStore.getTasks(); //
    let tasksModified = false; //
    const updatedTasks = currentTasks.map(task => { //
        if (task.label && task.label.toLowerCase() === labelNameToDelete.toLowerCase()) { //
            tasksModified = true; //
            return { ...task, label: '' }; // Remove the label from the task
        }
        return task; //
    });

    if (tasksModified) { //
        AppStore.setTasks(updatedTasks); // This will persist changes and trigger events via AppStore
        // MODIFIED: Use LoggingService
        LoggingService.info(`[LabelService] Label "${labelNameToDelete}" removed from tasks.`, { functionName, labelName: labelNameToDelete });
        return true; //
    } else {
        // MODIFIED: Use LoggingService
        LoggingService.info(`[LabelService] Label "${labelNameToDelete}" not found on any tasks.`, { functionName, labelName: labelNameToDelete });
        // showMessage is not called here as the original didn't for this case, indicating it's not necessarily a user-facing "error".
        return false; //
    }
}

/**
 * Conceptually adds a label to the system.
 * @param {string} labelName - The name of the label to add.
 * @returns {boolean} True if the label was new and conceptually added, false if it already exists or invalid.
 */
export function addConceptualLabel(labelName) {
    const functionName = 'addConceptualLabel'; // For logging context
    if (!AppStore || typeof AppStore.getUniqueLabels !== 'function' || !EventBus || typeof showMessage !== 'function') { //
        // MODIFIED: Use LoggingService
        LoggingService.error("[LabelService] Core dependencies not available.", new Error("CoreDependenciesMissing"), {
            functionName,
            appStoreAvailable: !!AppStore,
            getUniqueLabelsAvailable: typeof AppStore?.getUniqueLabels === 'function',
            eventBusAvailable: !!EventBus,
            showMessageAvailable: typeof showMessage === 'function'
        });
        // showMessage('Error: Label service is not properly configured.', 'error'); // This might be too generic if showMessage itself is the missing part.
        return false; //
    }
    const trimmedLabelName = labelName.trim(); //
    if (trimmedLabelName === '') { //
        // MODIFIED: Log this attempt
        LoggingService.info("[LabelService] Attempted to add empty label name.", { functionName });
        showMessage('Label name cannot be empty.', 'error'); //
        return false; //
    }
    
    let currentUniqueLabels = AppStore.getUniqueLabels(); //
    if (currentUniqueLabels.some(l => l.toLowerCase() === trimmedLabelName.toLowerCase())) { //
        // MODIFIED: Log this info
        LoggingService.info(`[LabelService] Label "${trimmedLabelName}" already conceptually exists or is in use.`, { functionName, labelName: trimmedLabelName });
        showMessage(`Label "${trimmedLabelName}" already conceptually exists or is in use.`, 'info'); //
        return false; //
    }
    
    // MODIFIED: Use LoggingService
    LoggingService.info(`[LabelService] Label "${trimmedLabelName}" conceptually added. Assign it to a task to persist it in the unique labels list.`, { functionName, labelName: trimmedLabelName });
    return true; //
}

// MODIFIED: Use LoggingService
LoggingService.debug("labelService.js loaded as ES6 module.", { module: 'labelService' });