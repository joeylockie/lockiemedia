// task_timer_system.js

// Self-invoking function to encapsulate the Task Timer System feature's code.
(function() {
    // --- DOM Element References (initialized in this module's initialize function) ---
    let modalEstHoursAdd, modalEstMinutesAdd, modalEstHoursViewEdit, modalEstMinutesViewEdit;
    let taskTimerSection, viewTaskTimerDisplay, viewTaskStartTimerBtn,
        viewTaskPauseTimerBtn, viewTaskStopTimerBtn, viewTaskActualDuration, timerButtonsContainer;
    let settingsTaskReviewBtn;

    // --- Feature-Specific State ---
    let currentModuleTaskTimerInterval = null; // Interval ID for the live timer display

    // Dependencies (assumed to be globally available for now):
    // - From store.js: tasks, saveTasks, featureFlags (via FeatureFlagService), currentViewTaskId, editingTaskId
    // - From utils.js: formatMillisecondsToHMS, formatDuration
    // - From services: FeatureFlagService
    // - From ui_rendering.js: showMessage (potentially)

    /**
     * Starts or resumes the timer for a given task.
     * @param {number} taskId - The ID of the task to start the timer for.
     * @returns {boolean} True if the timer was started/resumed, false otherwise.
     */
    function startTimerLogic(taskId) {
        if (typeof FeatureFlagService === 'undefined' || !FeatureFlagService.isFeatureEnabled('taskTimerSystem') || !taskId) {
            return false;
        }
        if (typeof tasks === 'undefined' || typeof saveTasks !== 'function') {
            console.error("[TaskTimer] 'tasks' array or 'saveTasks' function not found (expected from store.js).");
            return false;
        }

        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return false;
        const task = tasks[taskIndex];

        if (task.completed || (task.actualDurationMs && task.actualDurationMs > 0 && !task.timerIsPaused && !task.timerIsRunning)) {
            if (task.actualDurationMs > 0) {
                task.timerAccumulatedTime = 0;
                task.actualDurationMs = 0;
            }
        }

        task.timerIsRunning = true;
        task.timerIsPaused = false;
        task.timerStartTime = Date.now();
        saveTasks();
        return true;
    }

    /**
     * Pauses the timer for a given task.
     * @param {number} taskId - The ID of the task to pause the timer for.
     * @returns {boolean} True if the timer was paused, false otherwise.
     */
    function pauseTimerLogic(taskId) {
        if (typeof FeatureFlagService === 'undefined' || !FeatureFlagService.isFeatureEnabled('taskTimerSystem') || !taskId) {
            return false;
        }
        if (typeof tasks === 'undefined' || typeof saveTasks !== 'function') {
            console.error("[TaskTimer] 'tasks' array or 'saveTasks' function not found.");
            return false;
        }

        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1 || !tasks[taskIndex].timerIsRunning) return false;
        const task = tasks[taskIndex];

        const elapsed = Date.now() - (task.timerStartTime || Date.now());
        task.timerAccumulatedTime = (task.timerAccumulatedTime || 0) + elapsed;
        task.timerIsRunning = false;
        task.timerIsPaused = true;
        task.timerStartTime = null;
        saveTasks();
        return true;
    }

    /**
     * Stops the timer for a given task and records the duration.
     * @param {number} taskId - The ID of the task to stop the timer for.
     * @returns {boolean} True if the timer was stopped, false otherwise.
     */
    function stopTimerLogic(taskId) {
        if (typeof FeatureFlagService === 'undefined' || !FeatureFlagService.isFeatureEnabled('taskTimerSystem') || !taskId) {
            return false;
        }
        if (typeof tasks === 'undefined' || typeof saveTasks !== 'function') {
            console.error("[TaskTimer] 'tasks' array or 'saveTasks' function not found.");
            return false;
        }

        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return false;
        const task = tasks[taskIndex];

        if (task.timerIsRunning) {
            const elapsed = Date.now() - (task.timerStartTime || Date.now());
            task.timerAccumulatedTime = (task.timerAccumulatedTime || 0) + elapsed;
        }

        if (task.timerAccumulatedTime > 0) {
            task.actualDurationMs = task.timerAccumulatedTime;
        }
        task.timerIsRunning = false;
        task.timerIsPaused = false;
        task.timerStartTime = null;
        saveTasks();
        return true;
    }

    /**
     * Updates the live timer display in the View Task Details modal.
     * @param {number} taskId - The ID of the task whose timer is being displayed.
     */
    function updateLiveTimerDisplayUI(taskId) {
        // Assumes tasks, currentViewTaskId are global from store.js
        // Assumes formatMillisecondsToHMS is global from utils.js
        // Assumes viewTaskTimerDisplay is an initialized DOM element
        if (typeof tasks === 'undefined' || typeof currentViewTaskId === 'undefined' || typeof formatMillisecondsToHMS !== 'function' || !viewTaskTimerDisplay) {
            // console.warn("[TaskTimerUI] Dependencies for updateLiveTimerDisplayUI not met.");
            return;
        }

        const task = tasks.find(t => t.id === taskId);
        if (!task || currentViewTaskId !== taskId) return; // Only update if the modal for this task is open

        if (task.timerIsRunning) {
            const now = Date.now();
            const elapsedSinceStart = now - (task.timerStartTime || now);
            const currentDisplayTime = (task.timerAccumulatedTime || 0) + elapsedSinceStart;
            viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(currentDisplayTime);
        } else if (task.timerIsPaused) {
            viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(task.timerAccumulatedTime || 0);
        } else if (task.actualDurationMs > 0) { // Timer stopped, show recorded time
            viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(task.actualDurationMs);
        } else { // Not started or reset
            viewTaskTimerDisplay.textContent = "00:00:00";
        }
    }

    /**
     * Updates the timer control buttons (Start, Pause, Stop) and recorded duration display.
     * @param {object} task - The task object.
     */
    function updateTimerControlsUI(task) {
        // Assumes FeatureFlagService, currentViewTaskId, formatMillisecondsToHMS are global
        // Assumes DOM elements (viewTaskStartTimerBtn, etc.) are initialized
        if (typeof FeatureFlagService === 'undefined' || !FeatureFlagService.isFeatureEnabled('taskTimerSystem') || !task ||
            !viewTaskStartTimerBtn || !viewTaskPauseTimerBtn || !viewTaskStopTimerBtn ||
            !viewTaskActualDuration || !timerButtonsContainer || typeof currentViewTaskId === 'undefined' ||
            typeof formatMillisecondsToHMS !== 'function') {
            // console.warn("[TaskTimerUI] Dependencies for updateTimerControlsUI not met.");
            return;
        }

        const viewTaskDetailsModalEl = document.getElementById('viewTaskDetailsModal');
        const isModalOpenForThisTask = currentViewTaskId === task.id && viewTaskDetailsModalEl && !viewTaskDetailsModalEl.classList.contains('hidden');
        if (!isModalOpenForThisTask) return;

        if (task.completed) {
            timerButtonsContainer.classList.add('hidden');
            viewTaskActualDuration.textContent = task.actualDurationMs > 0 ? `Recorded: ${formatMillisecondsToHMS(task.actualDurationMs)}` : "Not recorded (completed).";
            if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = task.actualDurationMs > 0 ? formatMillisecondsToHMS(task.actualDurationMs) : "00:00:00";
            return;
        }
        timerButtonsContainer.classList.remove('hidden');

        if (task.actualDurationMs > 0 && !task.timerIsRunning && !task.timerIsPaused) {
            viewTaskStartTimerBtn.classList.remove('hidden');
            viewTaskStartTimerBtn.textContent = 'Re-time';
            viewTaskPauseTimerBtn.classList.add('hidden');
            viewTaskStopTimerBtn.classList.add('hidden');
            if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(task.actualDurationMs);
            viewTaskActualDuration.textContent = `Recorded: ${formatMillisecondsToHMS(task.actualDurationMs)}`;
        } else if (task.timerIsRunning) {
            viewTaskStartTimerBtn.classList.add('hidden');
            viewTaskPauseTimerBtn.classList.remove('hidden');
            viewTaskStopTimerBtn.classList.remove('hidden');
            viewTaskActualDuration.textContent = "Timer running...";
        } else if (task.timerIsPaused) {
            viewTaskStartTimerBtn.classList.remove('hidden');
            viewTaskStartTimerBtn.textContent = 'Resume';
            viewTaskPauseTimerBtn.classList.add('hidden');
            viewTaskStopTimerBtn.classList.remove('hidden');
            viewTaskActualDuration.textContent = "Timer paused.";
            if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(task.timerAccumulatedTime || 0);
        } else {
            viewTaskStartTimerBtn.classList.remove('hidden');
            viewTaskStartTimerBtn.textContent = 'Start';
            viewTaskPauseTimerBtn.classList.add('hidden');
            viewTaskStopTimerBtn.classList.add('hidden');
            viewTaskActualDuration.textContent = "Not yet recorded.";
            if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = "00:00:00";
        }
    }

    // --- Event Handlers for Timer Buttons (called from listeners set in initialize) ---
    function handleTimerStart() {
        if (typeof currentViewTaskId === 'undefined' || typeof tasks === 'undefined') return;
        if (startTimerLogic(currentViewTaskId)) {
            if (currentModuleTaskTimerInterval) clearInterval(currentModuleTaskTimerInterval);
            currentModuleTaskTimerInterval = setInterval(() => updateLiveTimerDisplayUI(currentViewTaskId), 1000);
            updateLiveTimerDisplayUI(currentViewTaskId);
            const task = tasks.find(t => t.id === currentViewTaskId);
            if (task) updateTimerControlsUI(task);
        }
    }

    function handleTimerPause() {
        if (typeof currentViewTaskId === 'undefined' || typeof tasks === 'undefined') return;
        if (pauseTimerLogic(currentViewTaskId)) {
            if (currentModuleTaskTimerInterval) clearInterval(currentModuleTaskTimerInterval);
            currentModuleTaskTimerInterval = null;
            const task = tasks.find(t => t.id === currentViewTaskId);
            if (task) {
                updateLiveTimerDisplayUI(currentViewTaskId);
                updateTimerControlsUI(task);
            }
        }
    }

    function handleTimerStop() {
        if (typeof currentViewTaskId === 'undefined' || typeof tasks === 'undefined') return;
        if (stopTimerLogic(currentViewTaskId)) {
            if (currentModuleTaskTimerInterval) clearInterval(currentModuleTaskTimerInterval);
            currentModuleTaskTimerInterval = null;
            const task = tasks.find(t => t.id === currentViewTaskId);
            if (task) {
                updateLiveTimerDisplayUI(currentViewTaskId);
                updateTimerControlsUI(task);
            }
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

    function updateUIVisibility(isEnabled) {
        // Assumes FeatureFlagService is global
        if (typeof FeatureFlagService === 'undefined') {
            console.error("[TaskTimerSystem] FeatureFlagService not available for UI visibility update.");
            return;
        }
        const actualIsEnabled = FeatureFlagService.isFeatureEnabled('taskTimerSystem');

        const elements = document.querySelectorAll('.task-timer-system-element');
        elements.forEach(el => {
            el.classList.toggle('hidden', !actualIsEnabled);
        });
        if (settingsTaskReviewBtn) {
            settingsTaskReviewBtn.classList.toggle('hidden', !actualIsEnabled);
        }
        console.log(`[TaskTimerSystem] UI Visibility set to: ${actualIsEnabled}`);
    }

    function setupTimerForModal(task) {
        // Assumes FeatureFlagService, formatDuration, formatMillisecondsToHMS are global
        // Assumes tasks, currentViewTaskId are global from store.js
        if (typeof FeatureFlagService === 'undefined' || !FeatureFlagService.isFeatureEnabled('taskTimerSystem') || !task ||
            typeof formatDuration !== 'function' || typeof formatMillisecondsToHMS !== 'function' ||
            typeof tasks === 'undefined' || typeof currentViewTaskId === 'undefined') {
            // console.warn("[TaskTimerSystem] Dependencies for setupTimerForModal not met.");
            return;
        }

        const viewTaskEstDurationEl = document.getElementById('viewTaskEstDuration');
        if (viewTaskEstDurationEl) {
            viewTaskEstDurationEl.textContent = formatDuration(task.estimatedHours, task.estimatedMinutes);
        }

        updateTimerControlsUI(task);

        if (task.timerIsRunning && !task.completed) {
            if (currentModuleTaskTimerInterval) clearInterval(currentModuleTaskTimerInterval);
            currentModuleTaskTimerInterval = setInterval(() => updateLiveTimerDisplayUI(task.id), 1000);
            updateLiveTimerDisplayUI(task.id);
        } else if (task.timerIsPaused) {
            if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(task.timerAccumulatedTime || 0);
        } else if (task.actualDurationMs > 0) {
            if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(task.actualDurationMs);
        } else {
            if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = "00:00:00";
        }
    }

    function clearTimerOnModalClose() {
        if (currentModuleTaskTimerInterval) {
            clearInterval(currentModuleTaskTimerInterval);
            currentModuleTaskTimerInterval = null;
        }
    }

    function handleTaskCompletion(taskId, isCompleted) {
        // Assumes FeatureFlagService, tasks, currentViewTaskId are global
        if (typeof FeatureFlagService === 'undefined' || !FeatureFlagService.isFeatureEnabled('taskTimerSystem') ||
            typeof tasks === 'undefined' || typeof currentViewTaskId === 'undefined') {
            return;
        }
        const task = tasks.find(t => t.id === taskId);
        if (task && isCompleted && (task.timerIsRunning || task.timerIsPaused)) {
            stopTimerLogic(taskId);
            if (currentViewTaskId === taskId) { // If the completed task is in the view modal
                updateTimerControlsUI(task);
                updateLiveTimerDisplayUI(taskId);
            }
        }
    }

    function getEstimatesFromAddModal() {
        if (typeof FeatureFlagService === 'undefined' || !FeatureFlagService.isFeatureEnabled('taskTimerSystem') || !modalEstHoursAdd || !modalEstMinutesAdd) {
            return { estHours: 0, estMinutes: 0 };
        }
        return {
            estHours: parseInt(modalEstHoursAdd.value) || 0,
            estMinutes: parseInt(modalEstMinutesAdd.value) || 0
        };
    }

    function getEstimatesFromEditModal() {
        // Assumes editingTaskId, tasks are global from store.js
        if (typeof FeatureFlagService === 'undefined' || !FeatureFlagService.isFeatureEnabled('taskTimerSystem') ||
            !modalEstHoursViewEdit || !modalEstMinutesViewEdit || typeof editingTaskId === 'undefined' || typeof tasks === 'undefined') {
            const task = (typeof editingTaskId !== 'undefined' && typeof tasks !== 'undefined') ? tasks.find(t => t.id === editingTaskId) : null;
            return {
                estHours: task ? task.estimatedHours : 0,
                estMinutes: task ? task.estimatedMinutes : 0
            };
        }
        return {
            estHours: parseInt(modalEstHoursViewEdit.value) || 0,
            estMinutes: parseInt(modalEstMinutesViewEdit.value) || 0
        };
    }

    // Expose Public Interface
    if (typeof window.AppFeatures === 'undefined') {
        window.AppFeatures = {};
    }
    window.AppFeatures.TaskTimerSystem = {
        initialize: initialize,
        updateUIVisibility: updateUIVisibility,
        setupTimerForModal: setupTimerForModal,
        clearTimerOnModalClose: clearTimerOnModalClose,
        handleTaskCompletion: handleTaskCompletion,
        getEstimatesFromAddModal: getEstimatesFromAddModal,
        getEstimatesFromEditModal: getEstimatesFromEditModal
        // Internal logic functions (startTimerLogic, etc.) are not exposed directly.
    };

    // console.log("task_timer_system.js loaded");
})();
