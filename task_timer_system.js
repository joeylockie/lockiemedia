// task_timer_system.js
// Manages task estimation and time tracking.
// Now an ES6 module.

import { isFeatureEnabled } from './featureFlagService.js';
import AppStore from './store.js';
import ModalStateService from './modalStateService.js';
import { formatMillisecondsToHMS, formatDuration } from './utils.js';

// NEW: Import LoggingService
import LoggingService from './loggingService.js';

// DOM Element References (populated in initialize)
let modalEstHoursAdd, modalEstMinutesAdd, modalEstHoursViewEdit, modalEstMinutesViewEdit; //
let taskTimerSection, viewTaskTimerDisplay, viewTaskStartTimerBtn, //
    viewTaskPauseTimerBtn, viewTaskStopTimerBtn, viewTaskActualDuration, timerButtonsContainer; //
let settingsTaskReviewBtn; //

// Feature-Specific State
let currentModuleTaskTimerInterval = null; //

// --- Private Logic Functions ---
function startTimerLogic(taskId) {
    const functionName = 'startTimerLogic';
    if (!isFeatureEnabled('taskTimerSystem') || !taskId) { //
        LoggingService.debug(`[TaskTimerSystem] Timer start prerequisites not met. Feature enabled: ${isFeatureEnabled('taskTimerSystem')}, TaskID: ${taskId}`, { functionName, taskId });
        return false;
    }
    if (!AppStore) { //
        LoggingService.error("[TaskTimerSystem] AppStore not available.", new Error("AppStoreMissing"), { functionName, taskId });
        return false; //
    }

    let currentTasks = AppStore.getTasks(); //
    const taskIndex = currentTasks.findIndex(t => t.id === taskId); //
    if (taskIndex === -1) { //
        LoggingService.warn(`[TaskTimerSystem] Task ID ${taskId} not found for starting timer.`, { functionName, taskId });
        return false;
    }
    
    const task = currentTasks[taskIndex]; //
    // If timer was previously stopped and recorded, or task completed, reset before re-timing
    if (task.completed || (task.actualDurationMs && task.actualDurationMs > 0 && !task.timerIsPaused && !task.timerIsRunning)) { //
        LoggingService.debug(`[TaskTimerSystem] Resetting timer for task ID ${taskId} before re-timing.`, { functionName, taskId, taskCompleted: task.completed, actualDurationMs: task.actualDurationMs });
        task.timerAccumulatedTime = 0; //
        task.actualDurationMs = 0;  //
    }
    task.timerIsRunning = true; //
    task.timerIsPaused = false; //
    task.timerStartTime = Date.now(); //
    AppStore.setTasks(currentTasks); // Save and publish //
    LoggingService.info(`[TaskTimerSystem] Timer started for task ID: ${taskId}.`, { functionName, taskId });
    return true; //
}

function pauseTimerLogic(taskId) {
    const functionName = 'pauseTimerLogic';
    if (!isFeatureEnabled('taskTimerSystem') || !taskId) { //
        LoggingService.debug(`[TaskTimerSystem] Timer pause prerequisites not met. Feature enabled: ${isFeatureEnabled('taskTimerSystem')}, TaskID: ${taskId}`, { functionName, taskId });
        return false;
    }
    if (!AppStore) { //
        LoggingService.error("[TaskTimerSystem] AppStore not available.", new Error("AppStoreMissing"), { functionName, taskId });
        return false; //
    }

    let currentTasks = AppStore.getTasks(); //
    const taskIndex = currentTasks.findIndex(t => t.id === taskId); //
    if (taskIndex === -1 || !currentTasks[taskIndex].timerIsRunning) { //
        LoggingService.warn(`[TaskTimerSystem] Task ID ${taskId} not found or timer not running for pausing.`, { functionName, taskId, timerIsRunning: currentTasks[taskIndex]?.timerIsRunning });
        return false;
    }
    
    const task = currentTasks[taskIndex]; //
    const elapsed = Date.now() - (task.timerStartTime || Date.now()); // Ensure timerStartTime is not null //
    task.timerAccumulatedTime = (task.timerAccumulatedTime || 0) + elapsed; //
    task.timerIsRunning = false; //
    task.timerIsPaused = true; //
    task.timerStartTime = null; // Important to nullify start time when paused //
    AppStore.setTasks(currentTasks); //
    LoggingService.info(`[TaskTimerSystem] Timer paused for task ID: ${taskId}. Accumulated time: ${task.timerAccumulatedTime}ms.`, { functionName, taskId, accumulatedTime: task.timerAccumulatedTime });
    return true; //
}

function stopTimerLogic(taskId) {
    const functionName = 'stopTimerLogic';
    if (!isFeatureEnabled('taskTimerSystem') || !taskId) { //
        LoggingService.debug(`[TaskTimerSystem] Timer stop prerequisites not met. Feature enabled: ${isFeatureEnabled('taskTimerSystem')}, TaskID: ${taskId}`, { functionName, taskId });
        return false;
    }
    if (!AppStore) { //
        LoggingService.error("[TaskTimerSystem] AppStore not available.", new Error("AppStoreMissing"), { functionName, taskId });
        return false; //
    }

    let currentTasks = AppStore.getTasks(); //
    const taskIndex = currentTasks.findIndex(t => t.id === taskId); //
    if (taskIndex === -1) { //
        LoggingService.warn(`[TaskTimerSystem] Task ID ${taskId} not found for stopping timer.`, { functionName, taskId });
        return false;
    }

    const task = currentTasks[taskIndex]; //
    if (task.timerIsRunning) { //
        const elapsed = Date.now() - (task.timerStartTime || Date.now()); //
        task.timerAccumulatedTime = (task.timerAccumulatedTime || 0) + elapsed; //
    }
    if (task.timerAccumulatedTime > 0) { //
        task.actualDurationMs = task.timerAccumulatedTime; //
    }
    task.timerIsRunning = false; //
    task.timerIsPaused = false; //
    task.timerStartTime = null; //
    AppStore.setTasks(currentTasks); //
    LoggingService.info(`[TaskTimerSystem] Timer stopped for task ID: ${taskId}. Actual duration: ${task.actualDurationMs}ms.`, { functionName, taskId, actualDurationMs: task.actualDurationMs });
    return true; //
}

// --- UI Update Functions (Internal to this module's scope when called) ---
function updateLiveTimerDisplayUI(taskId) {
    // This function updates UI directly, logging might be too noisy for every second.
    // Logging can be added if specific issues with UI updates are being debugged.
    if (!AppStore || !ModalStateService || !viewTaskTimerDisplay) return; //
    const currentTasks = AppStore.getTasks(); //
    const task = currentTasks.find(t => t.id === taskId); //
    if (!task || ModalStateService.getCurrentViewTaskId() !== taskId) return;  //

    if (task.timerIsRunning && task.timerStartTime) { //
        const now = Date.now(); //
        const elapsedSinceStart = now - task.timerStartTime; //
        const currentDisplayTime = (task.timerAccumulatedTime || 0) + elapsedSinceStart; //
        viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(currentDisplayTime); //
    } else if (task.timerIsPaused) { //
        viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(task.timerAccumulatedTime || 0); //
    } else if (task.actualDurationMs > 0) {  //
        viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(task.actualDurationMs); //
    } else {  //
        viewTaskTimerDisplay.textContent = "00:00:00"; //
    }
}

function updateTimerControlsUI(task) {
    const functionName = 'updateTimerControlsUI';
    if (!isFeatureEnabled('taskTimerSystem') || !task || !viewTaskStartTimerBtn || !viewTaskPauseTimerBtn || !viewTaskStopTimerBtn || !viewTaskActualDuration || !timerButtonsContainer || !ModalStateService) { //
        LoggingService.debug(`[TaskTimerSystem] Prerequisites for updating timer controls UI not met for task ID: ${task?.id}.`, {
            functionName,
            taskId: task?.id,
            featureEnabled: isFeatureEnabled('taskTimerSystem'),
            elementsFound: !!(viewTaskStartTimerBtn && viewTaskPauseTimerBtn && viewTaskStopTimerBtn && viewTaskActualDuration && timerButtonsContainer),
            modalStateServiceAvailable: !!ModalStateService
        });
        return; //
    }
    const viewTaskDetailsModalEl = document.getElementById('viewTaskDetailsModal'); //
    const isModalOpenForThisTask = ModalStateService.getCurrentViewTaskId() === task.id && viewTaskDetailsModalEl && !viewTaskDetailsModalEl.classList.contains('hidden'); //
    if (!isModalOpenForThisTask) { //
        LoggingService.debug(`[TaskTimerSystem] Timer controls UI update skipped: Modal not open for task ID ${task.id}.`, { functionName, taskId: task.id });
        return;
    }
    LoggingService.debug(`[TaskTimerSystem] Updating timer controls UI for task ID: ${task.id}.`, { functionName, taskId: task.id, taskState: { completed: task.completed, actualDurationMs: task.actualDurationMs, timerIsRunning: task.timerIsRunning, timerIsPaused: task.timerIsPaused } });

    if (task.completed) { //
        timerButtonsContainer.classList.add('hidden'); //
        viewTaskActualDuration.textContent = task.actualDurationMs > 0 ? `Recorded: ${formatMillisecondsToHMS(task.actualDurationMs)}` : "Not recorded (completed)."; //
        if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = task.actualDurationMs > 0 ? formatMillisecondsToHMS(task.actualDurationMs) : "00:00:00"; //
        return; //
    }
    timerButtonsContainer.classList.remove('hidden'); //

    if (task.actualDurationMs > 0 && !task.timerIsRunning && !task.timerIsPaused) { //
        viewTaskStartTimerBtn.classList.remove('hidden'); viewTaskStartTimerBtn.textContent = 'Re-time'; //
        viewTaskPauseTimerBtn.classList.add('hidden'); viewTaskStopTimerBtn.classList.add('hidden'); //
        if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(task.actualDurationMs); //
        viewTaskActualDuration.textContent = `Recorded: ${formatMillisecondsToHMS(task.actualDurationMs)}`; //
    } else if (task.timerIsRunning) { //
        viewTaskStartTimerBtn.classList.add('hidden'); viewTaskPauseTimerBtn.classList.remove('hidden'); viewTaskStopTimerBtn.classList.remove('hidden'); //
        viewTaskActualDuration.textContent = "Timer running..."; //
    } else if (task.timerIsPaused) { //
        viewTaskStartTimerBtn.classList.remove('hidden'); viewTaskStartTimerBtn.textContent = 'Resume'; //
        viewTaskPauseTimerBtn.classList.add('hidden'); viewTaskStopTimerBtn.classList.remove('hidden'); //
        viewTaskActualDuration.textContent = "Timer paused."; //
        if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(task.timerAccumulatedTime || 0); //
    } else { // Not started, or reset after being stopped. //
        viewTaskStartTimerBtn.classList.remove('hidden'); viewTaskStartTimerBtn.textContent = 'Start'; //
        viewTaskPauseTimerBtn.classList.add('hidden'); viewTaskStopTimerBtn.classList.add('hidden'); //
        viewTaskActualDuration.textContent = "Not yet recorded."; //
        if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = "00:00:00"; //
    }
}

// --- Event Handlers for Timer Buttons ---
function handleTimerStart() {
    const functionName = 'handleTimerStart';
    const currentViewingTaskId = ModalStateService.getCurrentViewTaskId(); //
    LoggingService.debug(`[TaskTimerSystem] Handle timer start for task ID: ${currentViewingTaskId}.`, { functionName, currentViewingTaskId });
    if (!currentViewingTaskId || !AppStore) { //
        LoggingService.warn(`[TaskTimerSystem] Cannot start timer: No viewing task ID or AppStore unavailable.`, { functionName, currentViewingTaskId, appStoreAvailable: !!AppStore });
        return;
    }
    if (startTimerLogic(currentViewingTaskId)) { //
        if (currentModuleTaskTimerInterval) clearInterval(currentModuleTaskTimerInterval); //
        currentModuleTaskTimerInterval = setInterval(() => updateLiveTimerDisplayUI(currentViewingTaskId), 1000); //
        updateLiveTimerDisplayUI(currentViewingTaskId); // Immediate update //
        const task = AppStore.getTasks().find(t => t.id === currentViewingTaskId); //
        if (task) updateTimerControlsUI(task); //
    }
}
function handleTimerPause() {
    const functionName = 'handleTimerPause';
    const currentViewingTaskId = ModalStateService.getCurrentViewTaskId(); //
    LoggingService.debug(`[TaskTimerSystem] Handle timer pause for task ID: ${currentViewingTaskId}.`, { functionName, currentViewingTaskId });
    if (!currentViewingTaskId || !AppStore) { //
        LoggingService.warn(`[TaskTimerSystem] Cannot pause timer: No viewing task ID or AppStore unavailable.`, { functionName, currentViewingTaskId, appStoreAvailable: !!AppStore });
        return;
    }
    if (pauseTimerLogic(currentViewingTaskId)) { //
        if (currentModuleTaskTimerInterval) clearInterval(currentModuleTaskTimerInterval); //
        currentModuleTaskTimerInterval = null; //
        const task = AppStore.getTasks().find(t => t.id === currentViewingTaskId); //
        if (task) { updateLiveTimerDisplayUI(currentViewingTaskId); updateTimerControlsUI(task); } //
    }
}
function handleTimerStop() {
    const functionName = 'handleTimerStop';
    const currentViewingTaskId = ModalStateService.getCurrentViewTaskId(); //
    LoggingService.debug(`[TaskTimerSystem] Handle timer stop for task ID: ${currentViewingTaskId}.`, { functionName, currentViewingTaskId });
    if (!currentViewingTaskId || !AppStore) { //
        LoggingService.warn(`[TaskTimerSystem] Cannot stop timer: No viewing task ID or AppStore unavailable.`, { functionName, currentViewingTaskId, appStoreAvailable: !!AppStore });
        return;
    }
    if (stopTimerLogic(currentViewingTaskId)) { //
        if (currentModuleTaskTimerInterval) clearInterval(currentModuleTaskTimerInterval); //
        currentModuleTaskTimerInterval = null; //
        const task = AppStore.getTasks().find(t => t.id === currentViewingTaskId);  //
        if (task) { updateLiveTimerDisplayUI(currentViewingTaskId); updateTimerControlsUI(task); } //
    }
}

// --- Public Interface Functions ---
function initialize() {
    const functionName = 'initialize (TaskTimerSystem)';
    LoggingService.info('[TaskTimerSystem] Initializing feature...', { functionName });
    modalEstHoursAdd = document.getElementById('modalEstHoursAdd'); //
    modalEstMinutesAdd = document.getElementById('modalEstMinutesAdd'); //
    modalEstHoursViewEdit = document.getElementById('modalEstHoursViewEdit'); //
    modalEstMinutesViewEdit = document.getElementById('modalEstMinutesViewEdit'); //
    taskTimerSection = document.getElementById('taskTimerSection'); //
    viewTaskTimerDisplay = document.getElementById('viewTaskTimerDisplay'); //
    viewTaskStartTimerBtn = document.getElementById('viewTaskStartTimerBtn'); //
    viewTaskPauseTimerBtn = document.getElementById('viewTaskPauseTimerBtn'); //
    viewTaskStopTimerBtn = document.getElementById('viewTaskStopTimerBtn'); //
    viewTaskActualDuration = document.getElementById('viewTaskActualDuration'); //
    timerButtonsContainer = document.getElementById('timerButtonsContainer'); //
    settingsTaskReviewBtn = document.getElementById('settingsTaskReviewBtn'); //

    if (viewTaskStartTimerBtn) viewTaskStartTimerBtn.addEventListener('click', handleTimerStart); else LoggingService.warn('[TaskTimerSystem] viewTaskStartTimerBtn not found.', {functionName}); //
    if (viewTaskPauseTimerBtn) viewTaskPauseTimerBtn.addEventListener('click', handleTimerPause); else LoggingService.warn('[TaskTimerSystem] viewTaskPauseTimerBtn not found.', {functionName}); //
    if (viewTaskStopTimerBtn) viewTaskStopTimerBtn.addEventListener('click', handleTimerStop); else LoggingService.warn('[TaskTimerSystem] viewTaskStopTimerBtn not found.', {functionName}); //
    LoggingService.info('[TaskTimerSystem] Feature Initialized and event listeners attached (if elements found).', { functionName });
}

function updateUIVisibility(isEnabledParam) { // isEnabledParam is for consistency //
    const functionName = 'updateUIVisibility (TaskTimerSystem)';
    const actualIsEnabled = isFeatureEnabled('taskTimerSystem'); //
    const elements = document.querySelectorAll('.task-timer-system-element'); //
    elements.forEach(el => el.classList.toggle('hidden', !actualIsEnabled)); //
    if (settingsTaskReviewBtn) settingsTaskReviewBtn.classList.toggle('hidden', !actualIsEnabled); //
    LoggingService.info(`[TaskTimerSystem] UI Visibility set to: ${actualIsEnabled}`, { functionName, isEnabled: actualIsEnabled });
}

function setupTimerForModal(task) {
    const functionName = 'setupTimerForModal';
    if (!isFeatureEnabled('taskTimerSystem') || !task || !AppStore || !ModalStateService) { //
        LoggingService.debug(`[TaskTimerSystem] Prerequisites for setting up timer in modal not met for task ID: ${task?.id}.`, {
            functionName,
            taskId: task?.id,
            featureEnabled: isFeatureEnabled('taskTimerSystem'),
            taskAvailable: !!task,
            appStoreAvailable: !!AppStore,
            modalStateServiceAvailable: !!ModalStateService
        });
        return;
    }
    LoggingService.debug(`[TaskTimerSystem] Setting up timer for modal for task ID: ${task.id}.`, { functionName, taskId: task.id, taskEstHours: task.estimatedHours, taskEstMinutes: task.estimatedMinutes });
    const viewTaskEstDurationEl = document.getElementById('viewTaskEstDuration'); //
    if (viewTaskEstDurationEl) viewTaskEstDurationEl.textContent = formatDuration(task.estimatedHours, task.estimatedMinutes); //
    
    updateTimerControlsUI(task); // This will set button visibility and timer display based on task state //

    if (task.timerIsRunning && !task.completed && task.timerStartTime) { //
        if (currentModuleTaskTimerInterval) clearInterval(currentModuleTaskTimerInterval); //
        currentModuleTaskTimerInterval = setInterval(() => updateLiveTimerDisplayUI(task.id), 1000); //
        updateLiveTimerDisplayUI(task.id); // Initial display for running timer //
    } else {
         updateLiveTimerDisplayUI(task.id); // Display paused or stopped time //
    }
}

function clearTimerOnModalClose() {
    const functionName = 'clearTimerOnModalClose';
    if (currentModuleTaskTimerInterval) { //
        clearInterval(currentModuleTaskTimerInterval); //
        currentModuleTaskTimerInterval = null; //
        LoggingService.debug('[TaskTimerSystem] Live timer interval cleared on modal close.', { functionName });
    }
}

function handleTaskCompletion(taskId, isCompleted) {
    const functionName = 'handleTaskCompletion (TaskTimerSystem)';
    LoggingService.debug(`[TaskTimerSystem] Handling task completion event. Task ID: ${taskId}, IsCompleted: ${isCompleted}.`, { functionName, taskId, isCompleted });
    if (!isFeatureEnabled('taskTimerSystem') || !AppStore || !ModalStateService) { //
        LoggingService.warn(`[TaskTimerSystem] Cannot handle task completion: Core services missing or feature disabled.`, { functionName, taskId });
        return;
    }
    const currentTasks = AppStore.getTasks();  //
    const task = currentTasks.find(t => t.id === taskId); //
    if (task && isCompleted && (task.timerIsRunning || task.timerIsPaused)) { //
        LoggingService.info(`[TaskTimerSystem] Task ${taskId} completed while timer was active/paused. Stopping timer.`, { functionName, taskId });
        stopTimerLogic(taskId); // This calls AppStore.setTasks //
        if (ModalStateService.getCurrentViewTaskId() === taskId) { //
            const updatedTaskAfterStop = AppStore.getTasks().find(t => t.id === taskId); // Re-fetch for UI update //
            if (updatedTaskAfterStop) { //
                 updateTimerControlsUI(updatedTaskAfterStop); //
                 updateLiveTimerDisplayUI(taskId);  //
            }
        }
    }
}

function getEstimatesFromAddModal() { //
    if (!isFeatureEnabled('taskTimerSystem') || !modalEstHoursAdd || !modalEstMinutesAdd) return { estHours: 0, estMinutes: 0 }; //
    return { estHours: parseInt(modalEstHoursAdd.value) || 0, estMinutes: parseInt(modalEstMinutesAdd.value) || 0 }; //
}

function getEstimatesFromEditModal() { //
    const functionName = 'getEstimatesFromEditModal';
    if (!isFeatureEnabled('taskTimerSystem') || !modalEstHoursViewEdit || !modalEstMinutesViewEdit || !AppStore || !ModalStateService) { //
        const currentEditingTaskId = ModalStateService ? ModalStateService.getEditingTaskId() : null; //
        const task = currentEditingTaskId && AppStore ? AppStore.getTasks().find(t => t.id === currentEditingTaskId) : null; //
        LoggingService.debug(`[TaskTimerSystem] Getting estimates from edit modal, falling back to stored task values due to missing elements/services.`, { functionName, currentEditingTaskId, taskFound: !!task });
        return { estHours: task ? task.estimatedHours : 0, estMinutes: task ? task.estimatedMinutes : 0 }; //
    }
    return { estHours: parseInt(modalEstHoursViewEdit.value) || 0, estMinutes: parseInt(modalEstMinutesViewEdit.value) || 0 }; //
}

export const TaskTimerSystemFeature = { //
    initialize, //
    updateUIVisibility, //
    setupTimerForModal, //
    clearTimerOnModalClose, //
    handleTaskCompletion, //
    getEstimatesFromAddModal, //
    getEstimatesFromEditModal //
};

// MODIFIED: Use LoggingService
LoggingService.debug("task_timer_system.js loaded as ES6 module.", { module: 'task_timer_system' });