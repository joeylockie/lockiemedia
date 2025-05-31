// labelService.js
// This service handles logic related to managing labels.

import AppStore from './store.js';
import EventBus from './eventBus.js'; // Already imported
// NEW: Import LoggingService
import LoggingService from './loggingService.js';
// MODIFIED: showMessage is no longer assumed to be global or directly called.

/**
 * Deletes a label from all tasks that use it and triggers an update of the unique labels list.
 * @param {string} labelNameToDelete - The name of the label to delete.
 * @returns {boolean} True if any tasks were updated, false otherwise.
 */
export function deleteLabelUsageFromTasks(labelNameToDelete) {
    const functionName = 'deleteLabelUsageFromTasks'; 
    if (!AppStore || typeof AppStore.getTasks !== 'function' || typeof AppStore.setTasks !== 'function') { 
        LoggingService.error("[LabelService] AppStore API not available.", new Error("AppStoreMissing"), { functionName, labelName: labelNameToDelete });
        // MODIFIED: Publish event instead of direct/conditional call
        EventBus.publish('displayUserMessage', { text: 'Error processing label deletion: core data missing.', type: 'error' });
        return false; 
    }
    if (!labelNameToDelete || typeof labelNameToDelete !== 'string') { 
        LoggingService.warn("[LabelService] Invalid label name provided for deletion.", { functionName, receivedName: labelNameToDelete });
        return false; 
    }

    let currentTasks = AppStore.getTasks(); 
    let tasksModified = false; 
    const updatedTasks = currentTasks.map(task => { 
        if (task.label && task.label.toLowerCase() === labelNameToDelete.toLowerCase()) { 
            tasksModified = true; 
            return { ...task, label: '' }; 
        }
        return task; 
    });

    if (tasksModified) { 
        AppStore.setTasks(updatedTasks); 
        LoggingService.info(`[LabelService] Label "${labelNameToDelete}" removed from tasks.`, { functionName, labelName: labelNameToDelete });
        // Note: Success message is typically handled by the calling UI handler (e.g., in ui_event_handlers.js for handleDeleteLabel)
        return true; 
    } else {
        LoggingService.info(`[LabelService] Label "${labelNameToDelete}" not found on any tasks.`, { functionName, labelName: labelNameToDelete });
        return false; 
    }
}

/**
 * Conceptually adds a label to the system.
 * @param {string} labelName - The name of the label to add.
 * @returns {boolean} True if the label was new and conceptually added, false if it already exists or invalid.
 */
export function addConceptualLabel(labelName) {
    const functionName = 'addConceptualLabel'; 
    if (!AppStore || typeof AppStore.getUniqueLabels !== 'function' || !EventBus) { 
        LoggingService.error("[LabelService] Core dependencies not available.", new Error("CoreDependenciesMissing"), {
            functionName,
            appStoreAvailable: !!AppStore,
            getUniqueLabelsAvailable: typeof AppStore?.getUniqueLabels === 'function',
            eventBusAvailable: !!EventBus
        });
        // Cannot publish event if EventBus itself is missing. Fallback or silent fail.
        console.error("Critical: EventBus missing in addConceptualLabel");
        return false; 
    }
    const trimmedLabelName = labelName.trim(); 
    if (trimmedLabelName === '') { 
        LoggingService.info("[LabelService] Attempted to add empty label name.", { functionName });
        // MODIFIED: Publish event instead of direct call
        EventBus.publish('displayUserMessage', { text: 'Label name cannot be empty.', type: 'error' });
        return false; 
    }
    
    let currentUniqueLabels = AppStore.getUniqueLabels(); 
    if (currentUniqueLabels.some(l => l.toLowerCase() === trimmedLabelName.toLowerCase())) { 
        LoggingService.info(`[LabelService] Label "${trimmedLabelName}" already conceptually exists or is in use.`, { functionName, labelName: trimmedLabelName });
        // MODIFIED: Publish event instead of direct call
        EventBus.publish('displayUserMessage', { text: `Label "${trimmedLabelName}" already conceptually exists or is in use.`, type: 'info' });
        return false; 
    }
    
    LoggingService.info(`[LabelService] Label "${trimmedLabelName}" conceptually added. Assign it to a task to persist it in the unique labels list.`, { functionName, labelName: trimmedLabelName });
    // Success message for "conceptual add" is usually not shown directly from service, but by UI handler if needed.
    return true; 
}

LoggingService.debug("labelService.js loaded as ES6 module.", { module: 'labelService' });