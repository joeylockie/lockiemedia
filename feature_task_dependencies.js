// feature_task_dependencies.js
// Manages logic for task dependencies.
// Now an ES6 module.

import { isFeatureEnabled } from './featureFlagService.js';
import AppStore from './store.js';
// showMessage is currently a global function from ui_rendering.js.

/**
 * Initializes the Task Dependencies feature.
 */
function initialize() {
    console.log('[TaskDependenciesFeature] Initialized (Placeholder).');
}

/**
 * Updates the visibility of UI elements related to the Task Dependencies feature.
 * @param {boolean} isEnabledParam - (Not used directly, uses imported isFeatureEnabled)
 */
function updateUIVisibility(isEnabledParam) {
    if (typeof isFeatureEnabled !== 'function') {
        console.error("[TaskDependenciesFeature] isFeatureEnabled function not available.");
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('taskDependenciesFeature');
    document.querySelectorAll('.task-dependencies-feature-element').forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));
    console.log(`[TaskDependenciesFeature] UI Visibility set based on flag: ${isActuallyEnabled}`);
}

/**
 * Populates UI elements for choosing task dependencies.
 * @param {object|null} currentTask - The task being edited (null if adding a new task).
 * @param {string} modalType - 'Add' or 'ViewEdit'.
 */
function populateDependencyPickers(currentTask, modalType) {
    if (!isFeatureEnabled('taskDependenciesFeature')) return;
    console.log(`[TaskDependenciesFeature] Placeholder: populateDependencyPickers for modal: ${modalType}`, currentTask);
    const dependsOnContainerId = modalType === 'Add' ? 'dependsOnContainerAdd' : 'dependsOnContainerViewEdit';
    const blocksTasksContainerId = modalType === 'Add' ? 'blocksTasksContainerAdd' : 'blocksTasksContainerViewEdit';
    const dependsOnContainer = document.getElementById(dependsOnContainerId);
    const blocksTasksContainer = document.getElementById(blocksTasksContainerId);
    if (dependsOnContainer) dependsOnContainer.innerHTML = '<p class="text-sm text-slate-500 dark:text-slate-400">Dependency selection UI (Coming Soon).</p>';
    if (blocksTasksContainer) blocksTasksContainer.innerHTML = '<p class="text-sm text-slate-500 dark:text-slate-400">Blocked tasks selection UI (Coming Soon).</p>';
}

/**
 * Adds a dependency: taskA depends on taskB.
 * @param {number} taskAId - The ID of the task that will depend on another.
 * @param {number} taskBId - The ID of the task that taskA will depend on (prerequisite).
 * @returns {boolean} True if the dependency was added successfully, false otherwise.
 */
function addDependency(taskAId, taskBId) {
    if (!isFeatureEnabled('taskDependenciesFeature') || !AppStore) {
        console.error("[TaskDependenciesFeature] Feature disabled or AppStore not available for addDependency.");
        if (typeof window.showMessage === 'function') window.showMessage('Dependency feature error.', 'error');
        return false;
    }
    if (taskAId === taskBId) {
        if (typeof window.showMessage === 'function') window.showMessage('A task cannot depend on itself.', 'error');
        return false;
    }
    let currentTasks = AppStore.getTasks();
    const taskAIndex = currentTasks.findIndex(t => t.id === taskAId);
    const taskBIndex = currentTasks.findIndex(t => t.id === taskBId);

    if (taskAIndex === -1 || taskBIndex === -1) {
        if (typeof window.showMessage === 'function') window.showMessage('One or both tasks not found for dependency.', 'error');
        return false;
    }
    const taskA = currentTasks[taskAIndex];
    const taskB = currentTasks[taskBIndex];

    if (taskB.dependsOn && taskB.dependsOn.includes(taskAId)) {
        if (typeof window.showMessage === 'function') window.showMessage(`Circular dependency: Task "${taskB.text}" already depends on "${taskA.text}".`, 'error');
        return false;
    }
    if (!taskA.dependsOn) taskA.dependsOn = [];
    if (!taskB.blocksTasks) taskB.blocksTasks = [];
    if (taskA.dependsOn.includes(taskBId)) return true; 

    taskA.dependsOn.push(taskBId);
    taskB.blocksTasks.push(taskAId);
    AppStore.setTasks(currentTasks); 
    console.log(`[TaskDependenciesFeature] Dependency added: Task ${taskAId} now depends on Task ${taskBId}`);
    return true;
}

/**
 * Removes a dependency: taskA no longer depends on taskB.
 * @param {number} taskAId - The ID of the task whose dependency is to be removed.
 * @param {number} taskBId - The ID of the prerequisite task.
 */
function removeDependency(taskAId, taskBId) {
    if (!isFeatureEnabled('taskDependenciesFeature') || !AppStore) return;
    let currentTasks = AppStore.getTasks();
    const taskA = currentTasks.find(t => t.id === taskAId);
    const taskB = currentTasks.find(t => t.id === taskBId);
    let changed = false;
    if (taskA && taskA.dependsOn) {
        const initialLength = taskA.dependsOn.length;
        taskA.dependsOn = taskA.dependsOn.filter(id => id !== taskBId);
        if (taskA.dependsOn.length < initialLength) changed = true;
    }
    if (taskB && taskB.blocksTasks) {
        const initialLength = taskB.blocksTasks.length;
        taskB.blocksTasks = taskB.blocksTasks.filter(id => id !== taskAId);
        if (taskB.blocksTasks.length < initialLength) changed = true;
    }
    if (changed) {
        AppStore.setTasks(currentTasks);
        console.log(`[TaskDependenciesFeature] Dependency removed: Task ${taskAId} no longer depends on Task ${taskBId}`);
    }
}

/**
 * Checks if a task can be marked as complete based on its dependencies.
 * @param {number} taskId - The ID of the task to check.
 * @returns {boolean} True if the task can be completed, false otherwise.
 */
function canCompleteTask(taskId) {
    if (!isFeatureEnabled('taskDependenciesFeature') || !AppStore) return true;
    const currentTasks = AppStore.getTasks();
    const task = currentTasks.find(t => t.id === taskId);
    if (!task || !task.dependsOn || task.dependsOn.length === 0) return true;
    return task.dependsOn.every(depId => {
        const dependentTask = currentTasks.find(t => t.id === depId);
        return dependentTask && dependentTask.completed;
    });
}

export const TaskDependenciesFeature = {
    initialize,
    updateUIVisibility,
    populateDependencyPickers,
    addDependency,
    removeDependency,
    canCompleteTask
};

console.log("feature_task_dependencies.js loaded as ES6 module.");