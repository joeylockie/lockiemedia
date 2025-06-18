// feature_task_dependencies.js
// Manages logic for task dependencies.
// Now an ES6 module.

import { isFeatureEnabled } from './featureFlagService.js';
import AppStore from './store.js';
import EventBus from './eventBus.js'; // MODIFIED: Added EventBus import
import LoggingService from './loggingService.js'; // MODIFIED: Added LoggingService import

// MODIFIED: window.showMessage is no longer used.

/**
 * Initializes the Task Dependencies feature.
 */
function initialize() {
    LoggingService.info('[TaskDependenciesFeature] Initialized (Placeholder).', { module: 'feature_task_dependencies', functionName: 'initialize' });
    // Future: Setup UI for managing dependencies in modals.
}

/**
 * Updates the visibility of UI elements related to the Task Dependencies feature.
 * @param {boolean} isEnabledParam - (Not used directly, uses imported isFeatureEnabled)
 */
function updateUIVisibility(isEnabledParam) { // isEnabledParam is for consistency if other features use it
    const functionName = 'updateUIVisibility (TaskDependenciesFeature)';
    if (typeof isFeatureEnabled !== 'function') {
        LoggingService.error("[TaskDependenciesFeature] isFeatureEnabled function not available.", new Error("DependencyMissing"), { functionName });
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('taskDependenciesFeature');
    document.querySelectorAll('.task-dependencies-feature-element').forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));
    LoggingService.info(`[TaskDependenciesFeature] UI Visibility set based on flag: ${isActuallyEnabled}`, { functionName, isEnabled: isActuallyEnabled });
}

/**
 * Populates UI elements for choosing task dependencies.
 * @param {object|null} currentTask - The task being edited (null if adding a new task).
 * @param {string} modalType - 'Add' or 'ViewEdit'.
 */
function populateDependencyPickers(currentTask, modalType) {
    const functionName = 'populateDependencyPickers (TaskDependenciesFeature)';
    if (!isFeatureEnabled('taskDependenciesFeature')) return;
    LoggingService.debug(`[TaskDependenciesFeature] Placeholder: populateDependencyPickers for modal: ${modalType}`, { functionName, currentTask: currentTask ? currentTask.id : null, modalType });
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
    const functionName = 'addDependency (TaskDependenciesFeature)';
    if (!isFeatureEnabled('taskDependenciesFeature') || !AppStore) {
        LoggingService.error("[TaskDependenciesFeature] Feature disabled or AppStore not available for addDependency.", new Error("PrerequisitesMissing"), { functionName });
        // MODIFIED: Publish event instead of direct/conditional call
        EventBus.publish('displayUserMessage', { text: 'Dependency feature error.', type: 'error' });
        return false;
    }
    if (taskAId === taskBId) {
        // MODIFIED: Publish event instead of direct/conditional call
        EventBus.publish('displayUserMessage', { text: 'A task cannot depend on itself.', type: 'error' });
        LoggingService.warn(`[TaskDependenciesFeature] Attempt to make task ${taskAId} depend on itself.`, { functionName, taskAId });
        return false;
    }
    let currentTasks = AppStore.getTasks();
    const taskAIndex = currentTasks.findIndex(t => t.id === taskAId);
    const taskBIndex = currentTasks.findIndex(t => t.id === taskBId);

    if (taskAIndex === -1 || taskBIndex === -1) {
        // MODIFIED: Publish event instead of direct/conditional call
        EventBus.publish('displayUserMessage', { text: 'One or both tasks not found for dependency.', type: 'error' });
        LoggingService.warn(`[TaskDependenciesFeature] One or both tasks not found for dependency. TaskA: ${taskAId}, TaskB: ${taskBId}`, { functionName, taskAId, taskBId });
        return false;
    }
    const taskA = currentTasks[taskAIndex];
    const taskB = currentTasks[taskBIndex];

    if (taskB.dependsOn && taskB.dependsOn.includes(taskAId)) {
        // MODIFIED: Publish event instead of direct/conditional call
        EventBus.publish('displayUserMessage', { text: `Circular dependency: Task "${taskB.text}" already depends on "${taskA.text}".`, type: 'error' });
        LoggingService.warn(`[TaskDependenciesFeature] Circular dependency detected: Task ${taskBId} already depends on ${taskAId}.`, { functionName, taskAId, taskBId });
        return false;
    }
    if (!taskA.dependsOn) taskA.dependsOn = [];
    if (!taskB.blocksTasks) taskB.blocksTasks = [];
    if (taskA.dependsOn.includes(taskBId)) {
        LoggingService.debug(`[TaskDependenciesFeature] Dependency already exists: Task ${taskAId} depends on Task ${taskBId}.`, { functionName, taskAId, taskBId });
        return true; 
    }

    taskA.dependsOn.push(taskBId);
    taskB.blocksTasks.push(taskAId);
    AppStore.setTasks(currentTasks); 
    LoggingService.info(`[TaskDependenciesFeature] Dependency added: Task ${taskAId} now depends on Task ${taskBId}`, { functionName, taskAId, taskBId });
    // Success message (if any) would typically be handled by the UI interaction that called this.
    return true;
}

/**
 * Removes a dependency: taskA no longer depends on taskB.
 * @param {number} taskAId - The ID of the task whose dependency is to be removed.
 * @param {number} taskBId - The ID of the prerequisite task.
 */
function removeDependency(taskAId, taskBId) {
    const functionName = 'removeDependency (TaskDependenciesFeature)';
    if (!isFeatureEnabled('taskDependenciesFeature') || !AppStore) {
        LoggingService.warn(`[TaskDependenciesFeature] Attempted to remove dependency while feature disabled or AppStore unavailable.`, { functionName, taskAId, taskBId });
        return;
    }
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
        LoggingService.info(`[TaskDependenciesFeature] Dependency removed: Task ${taskAId} no longer depends on Task ${taskBId}`, { functionName, taskAId, taskBId });
    } else {
        LoggingService.debug(`[TaskDependenciesFeature] No dependency found to remove between Task ${taskAId} and Task ${taskBId}.`, { functionName, taskAId, taskBId });
    }
}

/**
 * Checks if a task can be marked as complete based on its dependencies.
 * @param {number} taskId - The ID of the task to check.
 * @returns {boolean} True if the task can be completed, false otherwise.
 */
function canCompleteTask(taskId) {
    const functionName = 'canCompleteTask (TaskDependenciesFeature)';
    if (!isFeatureEnabled('taskDependenciesFeature') || !AppStore) return true;
    const currentTasks = AppStore.getTasks();
    const task = currentTasks.find(t => t.id === taskId);
    if (!task || !task.dependsOn || task.dependsOn.length === 0) return true;
    
    const canBeCompleted = task.dependsOn.every(depId => {
        const dependentTask = currentTasks.find(t => t.id === depId);
        return dependentTask && dependentTask.completed;
    });
    LoggingService.debug(`[TaskDependenciesFeature] Check if task ${taskId} can be completed: ${canBeCompleted}`, { functionName, taskId, dependencies: task.dependsOn, canBeCompleted });
    return canBeCompleted;
}

export const TaskDependenciesFeature = {
    initialize,
    updateUIVisibility,
    populateDependencyPickers,
    addDependency,
    removeDependency,
    canCompleteTask
};

LoggingService.debug("feature_task_dependencies.js loaded as ES6 module.", { module: 'feature_task_dependencies' });