// feature_task_dependencies.js

// Self-invoking function to encapsulate the Task Dependencies feature's code.
(function() {
    // --- DOM Element References (if any specific to this feature's direct manipulation) ---
    // e.g., let dependencyPickerAddModal;

    // --- Feature-Specific State ---
    // e.g., let selectedDependencies = [];

    /**
     * Initializes the Task Dependencies feature.
     * This function is called once when the application loads.
     * It can be used to set up global event listeners or initial states specific to dependencies.
     */
    function initialize() {
        // TODO: Add any specific initialization logic for the dependency feature.
        // This might include setting up event listeners for dependency UI elements if they are complex.
        console.log('Task Dependencies Feature Initialized (placeholder).');
    }

    /**
     * Updates the visibility of UI elements related to the Task Dependencies feature.
     * @param {boolean} isEnabled - True if the feature is enabled, false otherwise.
     */
    function updateUIVisibility(isEnabled) {
        // The primary show/hide logic is handled by 'applyActiveFeatures' in ui_event_handlers.js
        // using the '.task-dependencies-feature-element' class.
        // This function can be used for more complex UI updates if needed.
        console.log(`Task Dependencies UI Visibility controlled by global class toggling. Feature enabled: ${isEnabled}`);
    }

    /**
     * Populates UI elements (e.g., select dropdowns) for choosing task dependencies.
     * @param {object|null} currentTask - The task being edited (null if adding a new task).
     * @param {string} modalType - 'Add' or 'ViewEdit' to identify which modal's pickers to populate.
     */
    function populateDependencyPickers(currentTask, modalType) {
        // TODO: Implement UI for selecting dependencies.
        // This would involve:
        // 1. Getting references to the select elements (e.g., modalDependsOnSelectAdd, modalBlocksTasksSelectAdd).
        // 2. Clearing existing options.
        // 3. Filtering the global 'tasks' array to get potential candidates (e.g., not the current task, not circular).
        // 4. Creating <option> elements for each candidate.
        // 5. Pre-selecting options if 'currentTask' has existing dependencies.
        console.log(`Placeholder: populateDependencyPickers for modal: ${modalType}`, currentTask);

        const dependsOnContainerId = modalType === 'Add' ? 'dependsOnContainerAdd' : 'dependsOnContainerViewEdit';
        const blocksTasksContainerId = modalType === 'Add' ? 'blocksTasksContainerAdd' : 'blocksTasksContainerViewEdit';

        const dependsOnContainer = document.getElementById(dependsOnContainerId);
        const blocksTasksContainer = document.getElementById(blocksTasksContainerId);

        if (dependsOnContainer) {
            dependsOnContainer.innerHTML = '<p class="text-sm text-slate-500 dark:text-slate-400">Dependency selection UI will be here.</p>';
        }
        if (blocksTasksContainer) {
            blocksTasksContainer.innerHTML = '<p class="text-sm text-slate-500 dark:text-slate-400">Blocked tasks selection UI will be here.</p>';
        }
    }


    /**
     * Adds a dependency: taskA depends on taskB.
     * @param {number} taskAId - The ID of the task that will depend on another.
     * @param {number} taskBId - The ID of the task that taskA will depend on (prerequisite).
     * @returns {boolean} True if the dependency was added successfully, false otherwise (e.g., circular, already exists).
     */
    function addDependency(taskAId, taskBId) {
        if (taskAId === taskBId) {
            showMessage('A task cannot depend on itself.', 'error');
            return false;
        }

        const taskA = tasks.find(t => t.id === taskAId);
        const taskB = tasks.find(t => t.id === taskBId);

        if (!taskA || !taskB) {
            showMessage('One or both tasks not found for dependency.', 'error');
            return false;
        }

        // Check for circular dependencies (simplified check for direct circularity, more complex needed for transitive)
        if (taskB.dependsOn && taskB.dependsOn.includes(taskAId)) {
            showMessage(`Cannot add dependency: Task "${taskB.text}" already depends on "${taskA.text}". This would create a circular dependency.`, 'error');
            return false;
        }
        // A more robust check would trace up taskB's dependencies to see if taskAId is anywhere in that chain.

        if (!taskA.dependsOn) taskA.dependsOn = [];
        if (!taskB.blocksTasks) taskB.blocksTasks = [];

        if (taskA.dependsOn.includes(taskBId)) {
            // showMessage(`Task "${taskA.text}" already depends on "${taskB.text}".`, 'info');
            return true; // Already exists, consider it success
        }

        taskA.dependsOn.push(taskBId);
        taskB.blocksTasks.push(taskAId);

        console.log(`Dependency added: Task ${taskAId} now depends on Task ${taskBId}`);
        saveTasks(); // Assumes saveTasks is global and handles updating localStorage
        return true;
    }

    /**
     * Removes a dependency: taskA no longer depends on taskB.
     * @param {number} taskAId - The ID of the task whose dependency is to be removed.
     * @param {number} taskBId - The ID of the prerequisite task.
     */
    function removeDependency(taskAId, taskBId) {
        const taskA = tasks.find(t => t.id === taskAId);
        const taskB = tasks.find(t => t.id === taskBId);

        if (taskA && taskA.dependsOn) {
            taskA.dependsOn = taskA.dependsOn.filter(id => id !== taskBId);
        }
        if (taskB && taskB.blocksTasks) {
            taskB.blocksTasks = taskB.blocksTasks.filter(id => id !== taskAId);
        }
        console.log(`Dependency removed: Task ${taskAId} no longer depends on Task ${taskBId}`);
        saveTasks();
    }

    /**
     * Checks if a task can be marked as complete based on its dependencies.
     * @param {number} taskId - The ID of the task to check.
     * @returns {boolean} True if the task can be completed, false otherwise.
     */
    function canCompleteTask(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task || !task.dependsOn || task.dependsOn.length === 0) {
            return true; // No dependencies, or task not found (shouldn't happen)
        }
        return task.dependsOn.every(depId => {
            const dependentTask = tasks.find(t => t.id === depId);
            return dependentTask && dependentTask.completed;
        });
    }

    /**
     * Retrieves the IDs and names of tasks that the given task depends on.
     * @param {number} taskId - The ID of the task.
     * @returns {Array<{id: number, text: string, completed: boolean}>} An array of prerequisite task objects.
     */
    function getPrerequisiteTasks(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task || !task.dependsOn) return [];
        return task.dependsOn.map(id => tasks.find(t => t.id === id)).filter(Boolean);
    }

    /**
     * Retrieves the IDs and names of tasks that are blocked by the given task.
     * @param {number} taskId - The ID of the task.
     * @returns {Array<{id: number, text: string, completed: boolean}>} An array of tasks blocked by this one.
     */
    function getBlockedTasks(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task || !task.blocksTasks) return [];
        return task.blocksTasks.map(id => tasks.find(t => t.id === id)).filter(Boolean);
    }


    // --- Expose Public Interface ---
    if (typeof window.AppFeatures === 'undefined') {
        window.AppFeatures = {};
    }

    window.AppFeatures.TaskDependencies = {
        initialize: initialize,
        updateUIVisibility: updateUIVisibility,
        populateDependencyPickers: populateDependencyPickers, // Will be called from modal_interactions.js
        addDependency: addDependency,
        removeDependency: removeDependency,
        canCompleteTask: canCompleteTask,
        getPrerequisiteTasks: getPrerequisiteTasks,
        getBlockedTasks: getBlockedTasks
    };

})();
