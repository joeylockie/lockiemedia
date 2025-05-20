// task_timer_system.js
// Manages task estimation and time tracking.
// Now an ES6 module.

import { isFeatureEnabled } from './featureFlagService.js';
import AppStore from './store.js';
import ModalStateService from './modalStateService.js';
import { formatMillisecondsToHMS, formatDuration } from './utils.js';

// DOM Element References (populated in initialize)
let modalEstHoursAdd, modalEstMinutesAdd, modalEstHoursViewEdit, modalEstMinutesViewEdit;
let taskTimerSection, viewTaskTimerDisplay, viewTaskStartTimerBtn,
    viewTaskPauseTimerBtn, viewTaskStopTimerBtn, viewTaskActualDuration, timerButtonsContainer;
let settingsTaskReviewBtn;

// Feature-Specific State
let currentModuleTaskTimerInterval = null;

// --- Private Logic Functions ---
function startTimerLogic(taskId) {
    if (!isFeatureEnabled('taskTimerSystem') || !taskId) return false;
    if (!AppStore) { console.error("[TaskTimer] AppStore not available."); return false; }

    let currentTasks = AppStore.getTasks();
    const taskIndex = currentTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return false;
    
    const task = currentTasks[taskIndex];
    // If timer was previously stopped and recorded, or task completed, reset before re-timing
    if (task.completed || (task.actualDurationMs && task.actualDurationMs > 0 && !task.timerIsPaused && !task.timerIsRunning)) {
        task.timerAccumulatedTime = 0;
        task.actualDurationMs = 0; 
    }
    task.timerIsRunning = true;
    task.timerIsPaused = false;
    task.timerStartTime = Date.now();
    AppStore.setTasks(currentTasks); // Save and publish
    return true;
}

function pauseTimerLogic(taskId) {
    if (!isFeatureEnabled('taskTimerSystem') || !taskId) return false;
    if (!AppStore) { console.error("[TaskTimer] AppStore not available."); return false; }

    let currentTasks = AppStore.getTasks();
    const taskIndex = currentTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1 || !currentTasks[taskIndex].timerIsRunning) return false;
    
    const task = currentTasks[taskIndex];
    const elapsed = Date.now() - (task.timerStartTime || Date.now()); // Ensure timerStartTime is not null
    task.timerAccumulatedTime = (task.timerAccumulatedTime || 0) + elapsed;
    task.timerIsRunning = false;
    task.timerIsPaused = true;
    task.timerStartTime = null; // Important to nullify start time when paused
    AppStore.setTasks(currentTasks);
    return true;
}

function stopTimerLogic(taskId) {
    if (!isFeatureEnabled('taskTimerSystem') || !taskId) return false;
    if (!AppStore) { console.error("[TaskTimer] AppStore not available."); return false; }

    let currentTasks = AppStore.getTasks();
    const taskIndex = currentTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return false;

    const task = currentTasks[taskIndex];
    if (task.timerIsRunning) {
        const elapsed = Date.now() - (task.timerStartTime || Date.now());
        task.timerAccumulatedTime = (task.timerAccumulatedTime || 0) + elapsed;
    }
    // Only set actualDurationMs if there's accumulated time.
    // Avoid setting to 0 if timer was started and immediately stopped without accumulating.
    if (task.timerAccumulatedTime > 0) {
        task.actualDurationMs = task.timerAccumulatedTime;
    }
    task.timerIsRunning = false;
    task.timerIsPaused = false;
    task.timerStartTime = null;
    // Do not reset timerAccumulatedTime here, it's the recorded duration.
    // It will be reset if the timer is started again (in startTimerLogic).
    AppStore.setTasks(currentTasks);
    return true;
}

// --- UI Update Functions (Internal to this module's scope when called) ---
function updateLiveTimerDisplayUI(taskId) {
    if (!AppStore || !ModalStateService || !viewTaskTimerDisplay) return;
    const currentTasks = AppStore.getTasks();
    const task = currentTasks.find(t => t.id === taskId);
    // Only update if the modal for this task is open
    if (!task || ModalStateService.getCurrentViewTaskId() !== taskId) return; 

    if (task.timerIsRunning && task.timerStartTime) { // Added check for timerStartTime
        const now = Date.now();
        const elapsedSinceStart = now - task.timerStartTime;
        const currentDisplayTime = (task.timerAccumulatedTime || 0) + elapsedSinceStart;
        viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(currentDisplayTime);
    } else if (task.timerIsPaused) {
        viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(task.timerAccumulatedTime || 0);
    } else if (task.actualDurationMs > 0) { 
        viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(task.actualDurationMs);
    } else { 
        viewTaskTimerDisplay.textContent = "00:00:00";
    }
}

function updateTimerControlsUI(task) {
    if (!isFeatureEnabled('taskTimerSystem') || !task || !viewTaskStartTimerBtn || !viewTaskPauseTimerBtn || !viewTaskStopTimerBtn || !viewTaskActualDuration || !timerButtonsContainer || !ModalStateService) {
        return;
    }
    const viewTaskDetailsModalEl = document.getElementById('viewTaskDetailsModal');
    const isModalOpenForThisTask = ModalStateService.getCurrentViewTaskId() === task.id && viewTaskDetailsModalEl && !viewTaskDetailsModalEl.classList.contains('hidden');
    if (!isModalOpenForThisTask) return;

    if (task.completed) {
        timerButtonsContainer.classList.add('hidden');
        viewTaskActualDuration.textContent = task.actualDurationMs > 0 ? `Recorded: ${formatMillisecondsToHMS(task.actualDurationMs)}` : "Not recorded (completed).";
        if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = task.actualDurationMs > 0 ? formatMillisecondsToHMS(task.actualDurationMs) : "00:00:00";
        return;
    }
    timerButtonsContainer.classList.remove('hidden');

    if (task.actualDurationMs > 0 && !task.timerIsRunning && !task.timerIsPaused) {
        viewTaskStartTimerBtn.classList.remove('hidden'); viewTaskStartTimerBtn.textContent = 'Re-time';
        viewTaskPauseTimerBtn.classList.add('hidden'); viewTaskStopTimerBtn.classList.add('hidden');
        if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(task.actualDurationMs);
        viewTaskActualDuration.textContent = `Recorded: ${formatMillisecondsToHMS(task.actualDurationMs)}`;
    } else if (task.timerIsRunning) {
        viewTaskStartTimerBtn.classList.add('hidden'); viewTaskPauseTimerBtn.classList.remove('hidden'); viewTaskStopTimerBtn.classList.remove('hidden');
        viewTaskActualDuration.textContent = "Timer running...";
    } else if (task.timerIsPaused) {
        viewTaskStartTimerBtn.classList.remove('hidden'); viewTaskStartTimerBtn.textContent = 'Resume';
        viewTaskPauseTimerBtn.classList.add('hidden'); viewTaskStopTimerBtn.classList.remove('hidden');
        viewTaskActualDuration.textContent = "Timer paused.";
        if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(task.timerAccumulatedTime || 0);
    } else { // Not started, or reset after being stopped.
        viewTaskStartTimerBtn.classList.remove('hidden'); viewTaskStartTimerBtn.textContent = 'Start';
        viewTaskPauseTimerBtn.classList.add('hidden'); viewTaskStopTimerBtn.classList.add('hidden');
        viewTaskActualDuration.textContent = "Not yet recorded.";
        if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = "00:00:00";
    }
}

// --- Event Handlers for Timer Buttons ---
function handleTimerStart() {
    const currentViewingTaskId = ModalStateService.getCurrentViewTaskId();
    if (!currentViewingTaskId || !AppStore) return;
    if (startTimerLogic(currentViewingTaskId)) {
        if (currentModuleTaskTimerInterval) clearInterval(currentModuleTaskTimerInterval);
        currentModuleTaskTimerInterval = setInterval(() => updateLiveTimerDisplayUI(currentViewingTaskId), 1000);
        updateLiveTimerDisplayUI(currentViewingTaskId); // Immediate update
        const task = AppStore.getTasks().find(t => t.id === currentViewingTaskId);
        if (task) updateTimerControlsUI(task);
    }
}
function handleTimerPause() {
    const currentViewingTaskId = ModalStateService.getCurrentViewTaskId();
    if (!currentViewingTaskId || !AppStore) return;
    if (pauseTimerLogic(currentViewingTaskId)) {
        if (currentModuleTaskTimerInterval) clearInterval(currentModuleTaskTimerInterval);
        currentModuleTaskTimerInterval = null;
        const task = AppStore.getTasks().find(t => t.id === currentViewingTaskId);
        if (task) { updateLiveTimerDisplayUI(currentViewingTaskId); updateTimerControlsUI(task); }
    }
}
function handleTimerStop() {
    const currentViewingTaskId = ModalStateService.getCurrentViewTaskId();
    if (!currentViewingTaskId || !AppStore) return;
    if (stopTimerLogic(currentViewingTaskId)) {
        if (currentModuleTaskTimerInterval) clearInterval(currentModuleTaskTimerInterval);
        currentModuleTaskTimerInterval = null;
        // Get the task *after* stopTimerLogic has potentially modified and saved it
        const task = AppStore.getTasks().find(t => t.id === currentViewingTaskId); 
        if (task) { updateLiveTimerDisplayUI(currentViewingTaskId); updateTimerControlsUI(task); }
    }
}

// --- Public Interface Functions ---
function initialize() {
    modalEstHoursAdd = document.getElementById('modalEstHoursAdd');
    modalEstMinutesAdd = document.getElementById('modalEstMinutesAdd');
    modalEstHoursViewEdit = document.getElementById('modalEstHoursViewEdit');
    modalEstMinutesViewEdit = document.getElementById('modalEstMinutesViewEdit');
    taskTimerSection = document.getElementById('taskTimerSection');
    viewTaskTimerDisplay = document.getElementById('viewTaskTimerDisplay');
    viewTaskStartTimerBtn = document.getElementById('viewTaskStartTimerBtn');
    viewTaskPauseTimerBtn = document.getElementById('viewTaskPauseTimerBtn');
    viewTaskStopTimerBtn = document.getElementById('viewTaskStopTimerBtn');
    viewTaskActualDuration = document.getElementById('viewTaskActualDuration');
    timerButtonsContainer = document.getElementById('timerButtonsContainer');
    settingsTaskReviewBtn = document.getElementById('settingsTaskReviewBtn');

    if (viewTaskStartTimerBtn) viewTaskStartTimerBtn.addEventListener('click', handleTimerStart);
    if (viewTaskPauseTimerBtn) viewTaskPauseTimerBtn.addEventListener('click', handleTimerPause);
    if (viewTaskStopTimerBtn) viewTaskStopTimerBtn.addEventListener('click', handleTimerStop);
    console.log('[TaskTimerSystem] Feature Initialized.');
}

function updateUIVisibility(isEnabledParam) { // isEnabledParam is for consistency
    const actualIsEnabled = isFeatureEnabled('taskTimerSystem');
    const elements = document.querySelectorAll('.task-timer-system-element');
    elements.forEach(el => el.classList.toggle('hidden', !actualIsEnabled));
    if (settingsTaskReviewBtn) settingsTaskReviewBtn.classList.toggle('hidden', !actualIsEnabled);
    console.log(`[TaskTimerSystem] UI Visibility set to: ${actualIsEnabled}`);
}

function setupTimerForModal(task) {
    if (!isFeatureEnabled('taskTimerSystem') || !task || !AppStore || !ModalStateService) return;
    const viewTaskEstDurationEl = document.getElementById('viewTaskEstDuration');
    if (viewTaskEstDurationEl) viewTaskEstDurationEl.textContent = formatDuration(task.estimatedHours, task.estimatedMinutes);
    
    updateTimerControlsUI(task); // This will set button visibility and timer display based on task state

    if (task.timerIsRunning && !task.completed && task.timerStartTime) {
        if (currentModuleTaskTimerInterval) clearInterval(currentModuleTaskTimerInterval);
        currentModuleTaskTimerInterval = setInterval(() => updateLiveTimerDisplayUI(task.id), 1000);
        updateLiveTimerDisplayUI(task.id); // Initial display for running timer
    } else {
         updateLiveTimerDisplayUI(task.id); // Display paused or stopped time
    }
}

function clearTimerOnModalClose() {
    if (currentModuleTaskTimerInterval) {
        clearInterval(currentModuleTaskTimerInterval);
        currentModuleTaskTimerInterval = null;
    }
}

function handleTaskCompletion(taskId, isCompleted) {
    if (!isFeatureEnabled('taskTimerSystem') || !AppStore || !ModalStateService) return;
    const currentTasks = AppStore.getTasks(); 
    const task = currentTasks.find(t => t.id === taskId);
    if (task && isCompleted && (task.timerIsRunning || task.timerIsPaused)) {
        stopTimerLogic(taskId); // This calls AppStore.setTasks
        // After stopTimerLogic, the task object in currentTasks might be stale if setTask creates new array.
        // Re-fetch or use the returned task from stopTimerLogic if it returned one.
        // For now, assume stopTimerLogic updates the task in the array that AppStore.setTasks receives.
        if (ModalStateService.getCurrentViewTaskId() === taskId) {
            const updatedTaskAfterStop = AppStore.getTasks().find(t => t.id === taskId); // Re-fetch for UI update
            if (updatedTaskAfterStop) {
                 updateTimerControlsUI(updatedTaskAfterStop);
                 updateLiveTimerDisplayUI(taskId); 
            }
        }
    }
}

function getEstimatesFromAddModal() {
    if (!isFeatureEnabled('taskTimerSystem') || !modalEstHoursAdd || !modalEstMinutesAdd) return { estHours: 0, estMinutes: 0 };
    return { estHours: parseInt(modalEstHoursAdd.value) || 0, estMinutes: parseInt(modalEstMinutesAdd.value) || 0 };
}

function getEstimatesFromEditModal() {
    if (!isFeatureEnabled('taskTimerSystem') || !modalEstHoursViewEdit || !modalEstMinutesViewEdit || !AppStore || !ModalStateService) {
        const currentEditingTaskId = ModalStateService ? ModalStateService.getEditingTaskId() : null;
        const task = currentEditingTaskId && AppStore ? AppStore.getTasks().find(t => t.id === currentEditingTaskId) : null;
        return { estHours: task ? task.estimatedHours : 0, estMinutes: task ? task.estimatedMinutes : 0 };
    }
    return { estHours: parseInt(modalEstHoursViewEdit.value) || 0, estMinutes: parseInt(modalEstMinutesViewEdit.value) || 0 };
}

export const TaskTimerSystemFeature = {
    initialize,
    updateUIVisibility,
    setupTimerForModal,
    clearTimerOnModalClose,
    handleTaskCompletion,
    getEstimatesFromAddModal,
    getEstimatesFromEditModal
};

console.log("task_timer_system.js loaded as ES6 module.");
