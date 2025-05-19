// feature_task_dependencies.js

// Self-invoking function to encapsulate the Task Dependencies feature's code.
(function() {
    // Dependencies (assumed to be globally available for now):
    // - Services: FeatureFlagService
    // - From store.js: tasks, saveTasks
    // - From ui_rendering.js: showMessage (if used directly)
    // - DOM elements for dependency pickers in modals (e.g., dependsOnContainerAdd) are managed by ui_rendering.js

    /**
     * Initializes the Task Dependencies feature.
     * Placeholder for any setup specific to task dependencies.
     */
    function initializeTaskDependenciesFeature() {
        console.log('[TaskDependenciesFeature] Initialized (Placeholder).');
        // Future: Initialize UI components for selecting dependencies if they are complex,
        // or set up global listeners related to dependency checks.
    }

    /**
     * Updates the visibility of UI elements related to the Task Dependencies feature.
     * The primary show/hide logic for sections in modals or task items is handled by
     * 'applyActiveFeatures' in ui_event_handlers.js using the '.task-dependencies-feature-element' class.
     * This function can be used for more complex UI updates if needed.
     * @param {boolean} isEnabledParam - Parameter for consistency, actual check uses FeatureFlagService.
     */
    function updateTaskDependenciesUIVisibility(isEnabledParam) {
        if (typeof FeatureFlagService === 'undefined') {
            console.error("[TaskDependenciesFeature] FeatureFlagService not available.");
            return;
        }
        const isActuallyEnabled = FeatureFlagService.isFeatureEnabled('taskDependenciesFeature');

        console.log(`[TaskDependenciesFeature] UI Visibility (handled by applyActiveFeatures) set based on flag: ${isActuallyEnabled}`);
        // Example: If there were specific controls outside the '.task-dependencies-feature-element' scope:
        // const dependencyGraphButton = document.getElementById('dependencyGraphButton');
        // if (dependencyGraphButton) {
        //     dependencyGraphButton.classList.toggle('hidden', !isActuallyEnabled);
        // }
    }

    /**
     * Populates UI elements (e.g., select dropdowns) for choosing task dependencies.
     * This is a placeholder; actual implementation would involve dynamic UI generation.
     * @param {object|null} currentTask - The task being edited (null if adding a new task).
     * @param {string} modalType - 'Add' or 'ViewEdit' to identify which modal's pickers to populate.
     */
    function populateDependencyPickers(currentTask, modalType) {
        if (typeof FeatureFlagService === 'undefined' || !FeatureFlagService.isFeatureEnabled('taskDependenciesFeature')) {
            return; // Do nothing if feature is off
        }
        console.log(`[TaskDependenciesFeature] Placeholder: populateDependencyPickers for modal: ${modalType}`, currentTask);

        // Example DOM element IDs (these are defined in ui_rendering.js)
        const dependsOnContainerId = modalType === 'Add' ? 'dependsOnContainerAdd' : 'dependsOnContainerViewEdit';
        const blocksTasksContainerId = modalType === 'Add' ? 'blocksTasksContainerAdd' : 'blocksTasksContainerViewEdit';

        const dependsOnContainer = document.getElementById(dependsOnContainerId);
        const blocksTasksContainer = document.getElementById(blocksTasksContainerId);

        if (dependsOnContainer) {
            dependsOnContainer.innerHTML = '<p class="text-sm text-slate-500 dark:text-slate-400">Dependency selection UI (Coming Soon).</p>';
        }
        if (blocksTasksContainer) {
            blocksTasksContainer.innerHTML = '<p class="text-sm text-slate-500 dark:text-slate-400">Blocked tasks selection UI (Coming Soon).</p>';
        }
        // Future: Populate with actual task lists, excluding currentTask and avoiding circular dependencies.
    }

    /**
     * Adds a dependency: taskA depends on taskB.
     * @param {number} taskAId - The ID of the task that will depend on another.
     * @param {number} taskBId - The ID of the task that taskA will depend on (prerequisite).
     * @returns {boolean} True if the dependency was added successfully, false otherwise.
     */
    function addDependency(taskAId, taskBId) {
        if (typeof FeatureFlagService === 'undefined' || !FeatureFlagService.isFeatureEnabled('taskDependenciesFeature') ||
            typeof tasks === 'undefined' || typeof saveTasks !== 'function' || typeof showMessage !== 'function') {
            console.error("[TaskDependenciesFeature] Core dependencies not available for addDependency.");
            return false;
        }

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

        // Simplified circular dependency check (direct only)
        if (taskB.dependsOn && taskB.dependsOn.includes(taskAId)) {
            showMessage(`Cannot add dependency: Task "${taskB.text}" already depends on "${taskA.text}". This would create a circular dependency.`, 'error');
            return false;
        }

        if (!taskA.dependsOn) taskA.dependsOn = [];
        if (!taskB.blocksTasks) taskB.blocksTasks = [];

        if (taskA.dependsOn.includes(taskBId)) {
            // showMessage(`Task "${taskA.text}" already depends on "${taskB.text}".`, 'info'); // Optional: notify if already exists
            return true; // Consider it success if already exists
        }

        taskA.dependsOn.push(taskBId);
        taskB.blocksTasks.push(taskAId);

        console.log(`[TaskDependenciesFeature] Dependency added: Task ${taskAId} now depends on Task ${taskBId}`);
        saveTasks(); // Global from store.js
        return true;
    }

    /**
     * Removes a dependency: taskA no longer depends on taskB.
     * @param {number} taskAId - The ID of the task whose dependency is to be removed.
     * @param {number} taskBId - The ID of the prerequisite task.
     */
    function removeDependency(taskAId, taskBId) {
        if (typeof FeatureFlagService === 'undefined' || !FeatureFlagService.isFeatureEnabled('taskDependenciesFeature') ||
            typeof tasks === 'undefined' || typeof saveTasks !== 'function') {
            console.error("[TaskDependenciesFeature] Core dependencies not available for removeDependency.");
            return;
        }

        const taskA = tasks.find(t => t.id === taskAId);
        const taskB = tasks.find(t => t.id === taskBId);

        if (taskA && taskA.dependsOn) {
            taskA.dependsOn = taskA.dependsOn.filter(id => id !== taskBId);
        }
        if (taskB && taskB.blocksTasks) {
            taskB.blocksTasks = taskB.blocksTasks.filter(id => id !== taskAId);
        }
        console.log(`[TaskDependenciesFeature] Dependency removed: Task ${taskAId} no longer depends on Task ${taskBId}`);
        saveTasks();
    }

    /**
     * Checks if a task can be marked as complete based on its dependencies.
     * @param {number} taskId - The ID of the task to check.
     * @returns {boolean} True if the task can be completed, false otherwise.
     */
    function canCompleteTask(taskId) {
        if (typeof FeatureFlagService === 'undefined' || !FeatureFlagService.isFeatureEnabled('taskDependenciesFeature') ||
            typeof tasks === 'undefined') {
            // If feature is off or tasks array not available, assume it can be completed (or handle error)
            return true;
        }

        const task = tasks.find(t => t.id === taskId);
        if (!task || !task.dependsOn || task.dependsOn.length === 0) {
            return true; // No dependencies, or task not found
        }
        return task.dependsOn.every(depId => {
            const dependentTask = tasks.find(t => t.id === depId);
            return dependentTask && dependentTask.completed;
        });
    }

    // Expose Public Interface
    if (typeof window.AppFeatures === 'undefined') {
        window.AppFeatures = {};
    }
    if (typeof window.AppFeatures.TaskDependencies === 'undefined') {
        window.AppFeatures.TaskDependencies = {};
    }

    window.AppFeatures.TaskDependencies.initialize = initializeTaskDependenciesFeature;
    window.AppFeatures.TaskDependencies.updateUIVisibility = updateTaskDependenciesUIVisibility;
    window.AppFeatures.TaskDependencies.populateDependencyPickers = populateDependencyPickers;
    window.AppFeatures.TaskDependencies.addDependency = addDependency;
    window.AppFeatures.TaskDependencies.removeDependency = removeDependency;
    window.AppFeatures.TaskDependencies.canCompleteTask = canCompleteTask;
    // getPrerequisiteTasks and getBlockedTasks from original file were not used, can be added if needed.

    // console.log("feature_task_dependencies.js loaded");
})();
