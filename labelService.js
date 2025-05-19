// labelService.js
// This service handles logic related to managing labels,
// particularly their removal from tasks and the impact on the unique labels list.

// Dependencies (assumed to be globally available for now):
// - From store.js: tasks, uniqueLabels, saveTasks (which calls updateUniqueLabels)
// - From ui_rendering.js: showMessage (if used directly for feedback)

(function() {

    /**
     * Deletes a label from all tasks that use it and triggers an update of the unique labels list.
     * @param {string} labelNameToDelete - The name of the label to delete.
     * @returns {boolean} True if any tasks were updated, false otherwise.
     */
    function deleteLabelUsageFromTasks(labelNameToDelete) {
        if (typeof tasks === 'undefined' || typeof saveTasks !== 'function') {
            console.error("[LabelService] 'tasks' array or 'saveTasks' function not available (expected from store.js).");
            if (typeof showMessage === 'function') showMessage('Error processing label deletion: core data missing.', 'error');
            return false;
        }
        if (!labelNameToDelete || typeof labelNameToDelete !== 'string') {
            console.warn("[LabelService] Invalid label name provided for deletion.");
            return false;
        }

        let tasksModified = false;
        tasks.forEach(task => {
            if (task.label && task.label.toLowerCase() === labelNameToDelete.toLowerCase()) {
                task.label = ''; // Remove the label from the task
                tasksModified = true;
            }
        });

        if (tasksModified) {
            saveTasks(); // This will persist changes and trigger updateUniqueLabels in store.js,
                         // which in turn publishes 'labelsChanged' and 'tasksChanged'.
            console.log(`[LabelService] Label "${labelNameToDelete}" removed from tasks.`);
            return true;
        } else {
            console.log(`[LabelService] Label "${labelNameToDelete}" not found on any tasks.`);
            return false; // No tasks were actually modified
        }
    }

    /**
     * Conceptually adds a label to the system.
     * In the current model, uniqueLabels is derived from tasks. So, "adding" a label
     * via the manage labels modal primarily means it will be available in the datalist
     * for future use. The label only truly "exists" in uniqueLabels if a task uses it.
     * This function can ensure the label is temporarily added to the uniqueLabels list
     * for immediate UI feedback in datalists, anticipating saveTasks will confirm it.
     * @param {string} labelName - The name of the label to add.
     * @returns {boolean} True if the label was new and conceptually added, false if it already exists or invalid.
     */
    function addConceptualLabel(labelName) {
        if (typeof uniqueLabels === 'undefined' || typeof EventBus === 'undefined' || typeof showMessage !== 'function') {
            console.error("[LabelService] 'uniqueLabels' or 'EventBus' or 'showMessage' not available.");
            return false;
        }
        const trimmedLabelName = labelName.trim();
        if (trimmedLabelName === '') {
            showMessage('Label name cannot be empty.', 'error');
            return false;
        }
        if (uniqueLabels.some(l => l.toLowerCase() === trimmedLabelName.toLowerCase())) {
            showMessage(`Label "${trimmedLabelName}" already conceptually exists or is in use.`, 'info');
            return false; // Or true if "already exists" is considered success for this context
        }

        // Temporarily add to uniqueLabels for immediate UI feedback in datalists.
        // The actual persistence of this label in uniqueLabels list depends on a task using it
        // and saveTasks() being called, which then calls updateUniqueLabels().
        // This is a bit of a UI-driven addition.
        uniqueLabels.push(trimmedLabelName);
        uniqueLabels.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        EventBus.publish('labelsChanged', [...uniqueLabels]); // Notify UI to update datalists

        console.log(`[LabelService] Label "${trimmedLabelName}" conceptually added. It will be persisted in uniqueLabels if a task uses it.`);
        return true;
    }


    // Expose public interface
    window.LabelService = {
        deleteLabelUsageFromTasks,
        addConceptualLabel
    };

    // console.log("labelService.js loaded");
})();
