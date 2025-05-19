// feature_sub_tasks.js

// Self-invoking function to encapsulate the feature's code
(function() {
    // Dependencies (assumed to be globally available for now):
    // - From store.js: tasks, saveTasks, featureFlags (via FeatureFlagService)
    // - Services: FeatureFlagService

    /**
     * Initializes the Sub-tasks Feature.
     */
    function initializeSubTasksFeature() {
        // Placeholder for future initialization logic if needed.
        // Most sub-task UI is dynamically rendered and handled within task modals.
        console.log('[SubTasksFeature] Initialized.');
    }

    /**
     * Updates the visibility of any global Sub-tasks UI elements.
     * Specific sub-task UI within modals/task items is handled by rendering logic
     * checking the feature flag.
     * @param {boolean} isEnabledParam - Parameter for consistency, actual check uses FeatureFlagService.
     */
    function updateSubTasksUIVisibility(isEnabledParam) {
        if (typeof FeatureFlagService === 'undefined') {
            console.error("[SubTasksFeature] FeatureFlagService not available for UI visibility update.");
            return;
        }
        const isActuallyEnabled = FeatureFlagService.isFeatureEnabled('subTasksFeature');
        // Example: If there were global UI elements specific to sub-tasks
        // const subTaskGlobalElements = document.querySelectorAll('.sub-tasks-global-element');
        // subTaskGlobalElements.forEach(el => {
        //     el.classList.toggle('hidden', !isActuallyEnabled);
        // });
        console.log(`[SubTasksFeature] UI elements visibility/behavior updated based on feature flag: ${isActuallyEnabled}`);
        // Note: Most sub-task UI elements are class-based '.sub-tasks-feature-element'
        // and handled by applyActiveFeatures in ui_event_handlers.js.
    }

    /**
     * Adds a new sub-task to a parent task.
     * @param {number|string} parentId - The ID of the parent task.
     * @param {string} subTaskText - The text content of the new sub-task.
     * @returns {boolean} True if the sub-task was added successfully, false otherwise.
     */
    function addSubTaskLogic(parentId, subTaskText) {
        if (typeof FeatureFlagService === 'undefined' || typeof tasks === 'undefined' || typeof saveTasks !== 'function') {
            console.error("[SubTasksFeature] Core dependencies (FeatureFlagService, tasks, saveTasks) not available for addSubTaskLogic.");
            return false;
        }

        if (!FeatureFlagService.isFeatureEnabled('subTasksFeature') || !parentId || !subTaskText || !subTaskText.trim()) {
            console.warn('[SubTasksFeature] Feature disabled or invalid parameters for addSubTaskLogic.');
            return false;
        }

        const parentTaskIndex = tasks.findIndex(t => t.id === parentId);
        if (parentTaskIndex === -1) {
            console.error('[SubTasksFeature] Parent task not found for adding sub-task.');
            return false;
        }

        if (!tasks[parentTaskIndex].subTasks) {
            tasks[parentTaskIndex].subTasks = [];
        }

        const newSubTask = {
            id: Date.now() + Math.random(), // Simple unique ID
            text: subTaskText.trim(),
            completed: false,
            creationDate: Date.now()
        };

        tasks[parentTaskIndex].subTasks.push(newSubTask);
        saveTasks(); // Global from store.js
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
        if (typeof FeatureFlagService === 'undefined' || typeof tasks === 'undefined' || typeof saveTasks !== 'function') {
            console.error("[SubTasksFeature] Core dependencies not available for editSubTaskLogic.");
            return false;
        }
        if (!FeatureFlagService.isFeatureEnabled('subTasksFeature') || !parentId || !subTaskId || !newText || !newText.trim()) {
            console.warn('[SubTasksFeature] Feature disabled or invalid parameters for editSubTaskLogic.');
            return false;
        }

        const parentTaskIndex = tasks.findIndex(t => t.id === parentId);
        if (parentTaskIndex === -1 || !tasks[parentTaskIndex].subTasks) {
            console.error('[SubTasksFeature] Parent task or sub-tasks array not found for editing.');
            return false;
        }

        const subTaskIndex = tasks[parentTaskIndex].subTasks.findIndex(st => st.id === subTaskId);
        if (subTaskIndex === -1) {
            console.error('[SubTasksFeature] Sub-task not found for editing.');
            return false;
        }

        tasks[parentTaskIndex].subTasks[subTaskIndex].text = newText.trim();
        saveTasks();
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
        if (typeof FeatureFlagService === 'undefined' || typeof tasks === 'undefined' || typeof saveTasks !== 'function') {
            console.error("[SubTasksFeature] Core dependencies not available for toggleSubTaskCompleteLogic.");
            return false;
        }
        if (!FeatureFlagService.isFeatureEnabled('subTasksFeature') || !parentId || !subTaskId) {
            console.warn('[SubTasksFeature] Feature disabled or invalid parameters for toggleSubTaskCompleteLogic.');
            return false;
        }

        const parentTaskIndex = tasks.findIndex(t => t.id === parentId);
        if (parentTaskIndex === -1 || !tasks[parentTaskIndex].subTasks) {
            console.error('[SubTasksFeature] Parent task or sub-tasks array not found for toggling.');
            return false;
        }

        const subTaskIndex = tasks[parentTaskIndex].subTasks.findIndex(st => st.id === subTaskId);
        if (subTaskIndex === -1) {
            console.error('[SubTasksFeature] Sub-task not found for toggling completion.');
            return false;
        }

        tasks[parentTaskIndex].subTasks[subTaskIndex].completed = !tasks[parentTaskIndex].subTasks[subTaskIndex].completed;
        saveTasks();
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
        if (typeof FeatureFlagService === 'undefined' || typeof tasks === 'undefined' || typeof saveTasks !== 'function') {
            console.error("[SubTasksFeature] Core dependencies not available for deleteSubTaskLogic.");
            return false;
        }
        if (!FeatureFlagService.isFeatureEnabled('subTasksFeature') || !parentId || !subTaskId) {
            console.warn('[SubTasksFeature] Feature disabled or invalid parameters for deleteSubTaskLogic.');
            return false;
        }

        const parentTaskIndex = tasks.findIndex(t => t.id === parentId);
        if (parentTaskIndex === -1 || !tasks[parentTaskIndex].subTasks) {
            console.error('[SubTasksFeature] Parent task or sub-tasks array not found for deleting.');
            return false;
        }

        const initialLength = tasks[parentTaskIndex].subTasks.length;
        tasks[parentTaskIndex].subTasks = tasks[parentTaskIndex].subTasks.filter(st => st.id !== subTaskId);

        if (tasks[parentTaskIndex].subTasks.length < initialLength) {
            saveTasks();
            console.log('[SubTasksFeature] Sub-task deleted:', subTaskId, 'from parent:', parentId);
            return true;
        } else {
            console.error('[SubTasksFeature] Sub-task not found for deletion or already deleted.');
            return false;
        }
    }

    // Expose functions to the global scope via AppFeatures
    if (typeof window.AppFeatures === 'undefined') {
        window.AppFeatures = {};
    }
    if (typeof window.AppFeatures.SubTasks === 'undefined') {
        window.AppFeatures.SubTasks = {};
    }

    window.AppFeatures.SubTasks.initialize = initializeSubTasksFeature;
    window.AppFeatures.SubTasks.updateUIVisibility = updateSubTasksUIVisibility;
    // Exposing the core logic functions for other modules (like ui_event_handlers.js) to call
    window.AppFeatures.SubTasks.add = addSubTaskLogic;
    window.AppFeatures.SubTasks.edit = editSubTaskLogic;
    window.AppFeatures.SubTasks.toggleComplete = toggleSubTaskCompleteLogic;
    window.AppFeatures.SubTasks.delete = deleteSubTaskLogic;

    // console.log("feature_sub_tasks.js loaded");
})();
