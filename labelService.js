// labelService.js
// This service handles logic related to managing labels on tasks in IndexedDB.

import AppStore from './store.js';
import EventBus from './eventBus.js';
import LoggingService from './loggingService.js';
import db from './database.js'; // Import the database connection

/**
 * Deletes a label from all tasks that use it by setting their 'label' field to empty.
 * @param {string} labelNameToDelete - The name of the label to delete.
 */
export async function deleteLabelUsageFromTasks(labelNameToDelete) {
    const functionName = 'deleteLabelUsageFromTasks';
    if (!labelNameToDelete || typeof labelNameToDelete !== 'string') {
        LoggingService.warn("[LabelService] Invalid label name provided.", { functionName, receivedName: labelNameToDelete });
        return;
    }

    try {
        // 1. Find the primary keys of all tasks that use this label (case-insensitive).
        const tasksToUpdate = await db.tasks.where('label').equalsIgnoreCase(labelNameToDelete).primaryKeys();

        if (tasksToUpdate.length > 0) {
            // 2. Use bulkUpdate to efficiently change the 'label' field for all found tasks.
            await db.tasks.bulkUpdate(tasksToUpdate.map(id => ({ key: id, changes: { label: '' } })));

            // 3. Refresh the AppStore to update the UI
            const allTasks = await db.tasks.toArray();
            await AppStore.setTasks(allTasks);

            LoggingService.info(`[LabelService] Label "${labelNameToDelete}" removed from ${tasksToUpdate.length} tasks.`, { functionName });
            EventBus.publish('displayUserMessage', { text: `Label "${labelNameToDelete}" removed.`, type: 'success' });
        } else {
            LoggingService.info(`[LabelService] Label "${labelNameToDelete}" not found on any tasks.`, { functionName });
        }
    } catch (error) {
        LoggingService.error(`[LabelService] Error deleting label from tasks.`, error, { functionName });
        EventBus.publish('displayUserMessage', { text: 'Error removing label.', type: 'error' });
    }
}

/**
 * This function is a check, not a database operation. It verifies if a label can be conceptually added.
 * Its logic remains the same as it checks the AppStore cache, which is always up-to-date.
 * @param {string} labelName - The name of the label to check.
 * @returns {boolean} True if the label name is valid and not a duplicate.
 */
export function addConceptualLabel(labelName) {
    const functionName = 'addConceptualLabel';
    const trimmedLabelName = labelName.trim();

    if (trimmedLabelName === '') {
        EventBus.publish('displayUserMessage', { text: 'Label name cannot be empty.', type: 'error' });
        return false;
    }

    // The unique labels list is derived from the tasks in AppStore's cache.
    let currentUniqueLabels = AppStore.getUniqueLabels();
    if (currentUniqueLabels.some(l => l.toLowerCase() === trimmedLabelName.toLowerCase())) {
        EventBus.publish('displayUserMessage', { text: `Label "${trimmedLabelName}" already exists.`, type: 'info' });
        return false;
    }

    LoggingService.info(`[LabelService] Label "${trimmedLabelName}" is valid for creation.`, { functionName });
    return true;
}