// feature_sub_tasks.js

// Self-invoking function to encapsulate the feature's code
(function() {
    /**
     * Initializes the Sub-tasks Feature.
     * This function can be used for any setup specific to sub-tasks
     * that needs to run when the feature is enabled and the app starts.
     * This function should be called if the 'subTasksFeature' flag is true.
     */
    function initializeSubTasksFeature() {
        // Placeholder for future initialization logic if needed
        // e.g., attaching specific event listeners related to sub-task UI elements
        // that are globally present or need dynamic setup.
        console.log('Sub-tasks Feature Initialized.');
    }

    /**
     * Updates the visibility of any global Sub-tasks UI elements based on the feature flag.
     * This is a placeholder for consistency. Specific sub-task UI elements within
     * task items are typically rendered dynamically based on the flag.
     * @param {boolean} isEnabled - True if the feature is enabled, false otherwise.
     */
    function updateSubTasksUIVisibility(isEnabled) {
        // Example: If there were global UI elements specific to sub-tasks (e.g., a filter button)
        // const subTaskGlobalElements = document.querySelectorAll('.sub-tasks-global-element');
        // subTaskGlobalElements.forEach(el => {
        //     el.classList.toggle('hidden', !isEnabled);
        // });
        console.log(`Sub-tasks UI elements visibility/behavior updated based on feature flag: ${isEnabled}`);
        // Note: Most sub-task UI (like add/view within a task) will be controlled
        // directly in the rendering logic (e.g., in ui_interactions.js populateTaskDetailsModal)
        // by checking `featureFlags.subTasksFeature`.
    }

    /**
     * Adds a new sub-task to a parent task.
     * Relies on global 'tasks' array and 'saveTasks' function from app_logic.js.
     * Relies on global 'featureFlags' from app_logic.js.
     * @param {number|string} parentId - The ID of the parent task.
     * @param {string} subTaskText - The text content of the new sub-task.
     * @returns {boolean} True if the sub-task was added successfully, false otherwise.
     */
    function addSubTask(parentId, subTaskText) {
        // Ensure feature is enabled, parentId and subTaskText are valid
        if (!featureFlags.subTasksFeature || !parentId || !subTaskText || !subTaskText.trim()) {
            console.warn('Sub-task feature disabled or invalid parameters for addSubTask.');
            return false;
        }

        const parentTaskIndex = tasks.findIndex(t => t.id === parentId);
        if (parentTaskIndex === -1) {
            console.error('Parent task not found for adding sub-task.');
            return false;
        }

        // Ensure the subTasks array exists on the parent task
        if (!tasks[parentTaskIndex].subTasks) {
            tasks[parentTaskIndex].subTasks = [];
        }

        const newSubTask = {
            id: Date.now() + Math.random(), // Simple unique ID for subtasks
            text: subTaskText.trim(),
            completed: false,
            creationDate: Date.now()
        };

        tasks[parentTaskIndex].subTasks.push(newSubTask);
        saveTasks(); // Assumes saveTasks is globally available from app_logic.js
        console.log('Sub-task added:', newSubTask, 'to parent:', parentId);
        return true;
    }

    /**
     * Edits the text of an existing sub-task.
     * Relies on global 'tasks' array and 'saveTasks' function from app_logic.js.
     * Relies on global 'featureFlags' from app_logic.js.
     * @param {number|string} parentId - The ID of the parent task.
     * @param {number|string} subTaskId - The ID of the sub-task to edit.
     * @param {string} newText - The new text content for the sub-task.
     * @returns {boolean} True if the sub-task was edited successfully, false otherwise.
     */
    function editSubTask(parentId, subTaskId, newText) {
        if (!featureFlags.subTasksFeature || !parentId || !subTaskId || !newText || !newText.trim()) {
            console.warn('Sub-task feature disabled or invalid parameters for editSubTask.');
            return false;
        }

        const parentTaskIndex = tasks.findIndex(t => t.id === parentId);
        if (parentTaskIndex === -1 || !tasks[parentTaskIndex].subTasks) {
            console.error('Parent task or sub-tasks array not found for editing sub-task.');
            return false;
        }

        const subTaskIndex = tasks[parentTaskIndex].subTasks.findIndex(st => st.id === subTaskId);
        if (subTaskIndex === -1) {
            console.error('Sub-task not found for editing.');
            return false;
        }

        tasks[parentTaskIndex].subTasks[subTaskIndex].text = newText.trim();
        saveTasks();
        console.log('Sub-task edited:', subTaskId, 'in parent:', parentId);
        return true;
    }

    /**
     * Toggles the completion status of a sub-task.
     * Relies on global 'tasks' array and 'saveTasks' function from app_logic.js.
     * Relies on global 'featureFlags' from app_logic.js.
     * @param {number|string} parentId - The ID of the parent task.
     * @param {number|string} subTaskId - The ID of the sub-task to toggle.
     * @returns {boolean} True if the sub-task was toggled successfully, false otherwise.
     */
    function toggleSubTaskComplete(parentId, subTaskId) {
        if (!featureFlags.subTasksFeature || !parentId || !subTaskId) {
            console.warn('Sub-task feature disabled or invalid parameters for toggleSubTaskComplete.');
            return false;
        }

        const parentTaskIndex = tasks.findIndex(t => t.id === parentId);
        if (parentTaskIndex === -1 || !tasks[parentTaskIndex].subTasks) {
            console.error('Parent task or sub-tasks array not found for toggling sub-task.');
            return false;
        }

        const subTaskIndex = tasks[parentTaskIndex].subTasks.findIndex(st => st.id === subTaskId);
        if (subTaskIndex === -1) {
            console.error('Sub-task not found for toggling completion.');
            return false;
        }

        tasks[parentTaskIndex].subTasks[subTaskIndex].completed = !tasks[parentTaskIndex].subTasks[subTaskIndex].completed;
        saveTasks();
        console.log('Sub-task completion toggled:', subTaskId, 'in parent:', parentId);
        return true;
    }

    /**
     * Deletes a sub-task from a parent task.
     * Relies on global 'tasks' array and 'saveTasks' function from app_logic.js.
     * Relies on global 'featureFlags' from app_logic.js.
     * @param {number|string} parentId - The ID of the parent task.
     * @param {number|string} subTaskId - The ID of the sub-task to delete.
     * @returns {boolean} True if the sub-task was deleted successfully, false otherwise.
     */
    function deleteSubTask(parentId, subTaskId) {
        if (!featureFlags.subTasksFeature || !parentId || !subTaskId) {
            console.warn('Sub-task feature disabled or invalid parameters for deleteSubTask.');
            return false;
        }

        const parentTaskIndex = tasks.findIndex(t => t.id === parentId);
        if (parentTaskIndex === -1 || !tasks[parentTaskIndex].subTasks) {
            console.error('Parent task or sub-tasks array not found for deleting sub-task.');
            return false;
        }

        const initialLength = tasks[parentTaskIndex].subTasks.length;
        tasks[parentTaskIndex].subTasks = tasks[parentTaskIndex].subTasks.filter(st => st.id !== subTaskId);

        if (tasks[parentTaskIndex].subTasks.length < initialLength) {
            saveTasks();
            console.log('Sub-task deleted:', subTaskId, 'from parent:', parentId);
            return true;
        } else {
            console.error('Sub-task not found for deletion or already deleted.');
            return false;
        }
    }

    // Expose functions to the global scope via AppFeatures
    if (typeof window.AppFeatures === 'undefined') {
        window.AppFeatures = {};
    }
    // Create a namespace for SubTasks feature
    if (typeof window.AppFeatures.SubTasks === 'undefined') {
        window.AppFeatures.SubTasks = {};
    }

    window.AppFeatures.SubTasks.initialize = initializeSubTasksFeature;
    window.AppFeatures.SubTasks.updateUIVisibility = updateSubTasksUIVisibility;
    window.AppFeatures.SubTasks.add = addSubTask;
    window.AppFeatures.SubTasks.edit = editSubTask;
    window.AppFeatures.SubTasks.toggleComplete = toggleSubTaskComplete;
    window.AppFeatures.SubTasks.delete = deleteSubTask;

})();
