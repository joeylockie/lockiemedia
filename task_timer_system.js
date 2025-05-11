// task_timer_system.js

// Self-invoking function to encapsulate the Task Timer System feature's code.
(function() {
    // --- DOM Element References ---
    // These will be assigned in the initialize function.
    let modalEstHoursAdd, modalEstMinutesAdd, modalEstHoursViewEdit, modalEstMinutesViewEdit;
    let taskTimerSection, viewTaskTimerDisplay, viewTaskStartTimerBtn,
        viewTaskPauseTimerBtn, viewTaskStopTimerBtn, viewTaskActualDuration, timerButtonsContainer;
    let settingsTaskReviewBtn; // For settings modal

    // --- Feature-Specific State ---
    let currentModuleTaskTimerInterval = null;

    // --- Core Logic Functions (Moved from app_logic.js) ---

    /**
     * Starts or resumes the timer for a given task.
     * @param {number} taskId - The ID of the task to start the timer for.
     * @returns {boolean} True if the timer was started/resumed, false otherwise.
     */
    function startTimerLogic(taskId) {
        // Assumes global 'tasks', 'saveTasks', 'featureFlags' are available from app_logic.js
        if (!featureFlags.taskTimerSystem || !taskId) return false;
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return false;
        const task = tasks[taskIndex];

        // Prevent starting if already completed, or if it has actual time and is not paused/running (meaning it was stopped)
        if (task.completed || (task.actualDurationMs && task.actualDurationMs > 0 && !task.timerIsPaused && !task.timerIsRunning)) {
            // If re-timing, reset accumulated time if it was from a previous "stop"
            if (task.actualDurationMs > 0) {
                task.timerAccumulatedTime = 0;
                task.actualDurationMs = 0; // Clear previous actual duration if re-starting
            }
        }


        task.timerIsRunning = true;
        task.timerIsPaused = false;
        task.timerStartTime = Date.now(); // Always set/reset start time when timer (re)starts
        saveTasks();
        return true;
    }

    /**
     * Pauses the timer for a given task.
     * @param {number} taskId - The ID of the task to pause the timer for.
     * @returns {boolean} True if the timer was paused, false otherwise.
     */
    function pauseTimerLogic(taskId) {
        // Assumes global 'tasks', 'saveTasks', 'featureFlags' are available
        if (!featureFlags.taskTimerSystem || !taskId) return false;
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1 || !tasks[taskIndex].timerIsRunning) return false;
        const task = tasks[taskIndex];

        const elapsed = Date.now() - (task.timerStartTime || Date.now());
        task.timerAccumulatedTime = (task.timerAccumulatedTime || 0) + elapsed;
        task.timerIsRunning = false;
        task.timerIsPaused = true;
        task.timerStartTime = null; // Clear start time as it's paused
        saveTasks();
        return true;
    }

    /**
     * Stops the timer for a given task and records the duration.
     * @param {number} taskId - The ID of the task to stop the timer for.
     * @returns {boolean} True if the timer was stopped, false otherwise.
     */
    function stopTimerLogic(taskId) {
        // Assumes global 'tasks', 'saveTasks', 'featureFlags' are available
        if (!featureFlags.taskTimerSystem || !taskId) return false;
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
        // Do not reset timerAccumulatedTime here when stopping, so it can be reviewed.
        // It will be reset if the timer is started again after being stopped.
        saveTasks();
        return true;
    }

    // --- UI Update Functions (Moved and adapted from ui_interactions.js) ---

    /**
     * Updates the live timer display in the View Task Details modal.
     * @param {number} taskId - The ID of the task whose timer is being displayed.
     */
    function updateLiveTimerDisplayUI(taskId) {
        // Assumes global 'tasks', 'currentViewTaskId', 'formatMillisecondsToHMS' are available
        const task = tasks.find(t => t.id === taskId);
        if (!task || !viewTaskTimerDisplay || currentViewTaskId !== taskId) return;

        if (task.timerIsRunning) {
            const now = Date.now();
            const elapsedSinceStart = now - (task.timerStartTime || now);
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

    /**
     * Updates the timer control buttons (Start, Pause, Stop) and recorded duration display.
     * @param {object} task - The task object.
     */
    function updateTimerControlsUI(task) {
        // Assumes global 'featureFlags', 'currentViewTaskId', 'formatMillisecondsToHMS' are available
        // Also assumes DOM elements like viewTaskStartTimerBtn, etc., are assigned.
        if (!featureFlags.taskTimerSystem || !task || !viewTaskStartTimerBtn || !viewTaskPauseTimerBtn || !viewTaskStopTimerBtn || !viewTaskActualDuration || !timerButtonsContainer) return;

        // Ensure this UI update is only for the task currently in the view modal
        const viewTaskDetailsModal = document.getElementById('viewTaskDetailsModal'); // Check if modal is open
        const isModalOpenForThisTask = currentViewTaskId === task.id && viewTaskDetailsModal && !viewTaskDetailsModal.classList.contains('hidden');
        if (!isModalOpenForThisTask) return;

        if (task.completed) {
            timerButtonsContainer.classList.add('hidden');
            viewTaskActualDuration.textContent = task.actualDurationMs > 0 ? `Recorded: ${formatMillisecondsToHMS(task.actualDurationMs)}` : "Not recorded (completed).";
            if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = task.actualDurationMs > 0 ? formatMillisecondsToHMS(task.actualDurationMs) : "00:00:00";
            return;
        }
        timerButtonsContainer.classList.remove('hidden');

        if (task.actualDurationMs > 0 && !task.timerIsRunning && !task.timerIsPaused) { // Timer was stopped, has a recorded duration
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
        } else { // Timer has not been run or was reset
            viewTaskStartTimerBtn.classList.remove('hidden');
            viewTaskStartTimerBtn.textContent = 'Start';
            viewTaskPauseTimerBtn.classList.add('hidden');
            viewTaskStopTimerBtn.classList.add('hidden');
            viewTaskActualDuration.textContent = "Not yet recorded.";
            if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = "00:00:00";
        }
    }

    // --- Event Handlers for Timer Buttons ---

    function handleTimerStart() {
        // Assumes global 'currentViewTaskId' is available
        if (startTimerLogic(currentViewTaskId)) {
            if (currentModuleTaskTimerInterval) clearInterval(currentModuleTaskTimerInterval);
            currentModuleTaskTimerInterval = setInterval(() => updateLiveTimerDisplayUI(currentViewTaskId), 1000);
            updateLiveTimerDisplayUI(currentViewTaskId); // Immediate update
            const task = tasks.find(t => t.id === currentViewTaskId);
            if (task) updateTimerControlsUI(task);
        }
    }

    function handleTimerPause() {
        // Assumes global 'currentViewTaskId' and 'tasks' are available
        if (pauseTimerLogic(currentViewTaskId)) {
            if (currentModuleTaskTimerInterval) clearInterval(currentModuleTaskTimerInterval);
            currentModuleTaskTimerInterval = null;
            const task = tasks.find(t => t.id === currentViewTaskId);
            if (task) {
                updateLiveTimerDisplayUI(currentViewTaskId); // Update display to show accumulated time
                updateTimerControlsUI(task);
            }
        }
    }

    function handleTimerStop() {
        // Assumes global 'currentViewTaskId', 'tasks', and 'renderTasks' (if task completion status changes UI elsewhere)
        if (stopTimerLogic(currentViewTaskId)) {
            if (currentModuleTaskTimerInterval) clearInterval(currentModuleTaskTimerInterval);
            currentModuleTaskTimerInterval = null;
            const task = tasks.find(t => t.id === currentViewTaskId);
            if (task) {
                updateLiveTimerDisplayUI(currentViewTaskId); // Update display to show final recorded time
                updateTimerControlsUI(task);
                // If stopping the timer also completes the task, that logic would be elsewhere or called from here.
                // For now, renderTasks() is not called here unless task completion is tied to stopping.
            }
        }
    }

    // --- Public Interface Functions ---

    /**
     * Initializes the Task Timer System feature.
     * This function should be called once when the application loads.
     * It gets references to DOM elements and sets up event listeners for timer controls.
     */
    function initialize() {
        // Get DOM elements related to task timer inputs in modals
        modalEstHoursAdd = document.getElementById('modalEstHoursAdd');
        modalEstMinutesAdd = document.getElementById('modalEstMinutesAdd');
        modalEstHoursViewEdit = document.getElementById('modalEstHoursViewEdit');
        modalEstMinutesViewEdit = document.getElementById('modalEstMinutesViewEdit');

        // Get DOM elements for the timer in the View Task Details modal
        taskTimerSection = document.getElementById('taskTimerSection');
        viewTaskTimerDisplay = document.getElementById('viewTaskTimerDisplay');
        viewTaskStartTimerBtn = document.getElementById('viewTaskStartTimerBtn');
        viewTaskPauseTimerBtn = document.getElementById('viewTaskPauseTimerBtn');
        viewTaskStopTimerBtn = document.getElementById('viewTaskStopTimerBtn');
        viewTaskActualDuration = document.getElementById('viewTaskActualDuration');
        timerButtonsContainer = document.getElementById('timerButtonsContainer');
        settingsTaskReviewBtn = document.getElementById('settingsTaskReviewBtn');


        // Add event listeners for timer buttons
        if (viewTaskStartTimerBtn) viewTaskStartTimerBtn.addEventListener('click', handleTimerStart);
        if (viewTaskPauseTimerBtn) viewTaskPauseTimerBtn.addEventListener('click', handleTimerPause);
        if (viewTaskStopTimerBtn) viewTaskStopTimerBtn.addEventListener('click', handleTimerStop);

        console.log('Task Timer System Feature Initialized.');
    }

    /**
     * Updates the visibility of UI elements related to the Task Timer System.
     * @param {boolean} isEnabled - True if the feature is enabled, false otherwise.
     */
    function updateUIVisibility(isEnabled) {
        // Assumes global 'document' is available
        const elements = document.querySelectorAll('.task-timer-system-element');
        elements.forEach(el => {
            el.classList.toggle('hidden', !isEnabled);
        });

        // Also handle visibility of the "Task Review" button in settings
        if (settingsTaskReviewBtn) {
            settingsTaskReviewBtn.classList.toggle('hidden', !isEnabled);
        }
        console.log(`Task Timer System UI Visibility set to: ${isEnabled}`);
    }

    /**
     * Sets up the timer display and controls when the View Task Details modal is opened for a task.
     * @param {object} task - The task object being viewed.
     */
    function setupTimerForModal(task) {
        // Assumes global 'featureFlags', 'formatDuration' are available
        if (!featureFlags.taskTimerSystem || !task) return;

        const viewTaskEstDuration = document.getElementById('viewTaskEstDuration'); // Get it here as it's specific to this modal
        if (viewTaskEstDuration) {
            viewTaskEstDuration.textContent = formatDuration(task.estimatedHours, task.estimatedMinutes);
        }

        updateTimerControlsUI(task); // Set up buttons and recorded time

        if (task.timerIsRunning && !task.completed) {
            if (currentModuleTaskTimerInterval) clearInterval(currentModuleTaskTimerInterval);
            currentModuleTaskTimerInterval = setInterval(() => updateLiveTimerDisplayUI(task.id), 1000);
            updateLiveTimerDisplayUI(task.id); // Initial display
        } else if (task.timerIsPaused) {
            if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(task.timerAccumulatedTime || 0);
        } else if (task.actualDurationMs > 0) {
            if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = formatMillisecondsToHMS(task.actualDurationMs);
        } else {
            if (viewTaskTimerDisplay) viewTaskTimerDisplay.textContent = "00:00:00";
        }
    }

    /**
     * Clears any active timer interval when the View Task Details modal is closed.
     */
    function clearTimerOnModalClose() {
        if (currentModuleTaskTimerInterval) {
            clearInterval(currentModuleTaskTimerInterval);
            currentModuleTaskTimerInterval = null;
        }
    }

    /**
     * Handles logic when a task's completion status changes, specifically to stop timers.
     * @param {number} taskId - The ID of the task.
     * @param {boolean} isCompleted - The new completion status of the task.
     */
    function handleTaskCompletion(taskId, isCompleted) {
         // Assumes global 'tasks' is available
        if (!featureFlags.taskTimerSystem) return;
        const task = tasks.find(t => t.id === taskId);
        if (task && isCompleted && (task.timerIsRunning || task.timerIsPaused)) {
            stopTimerLogic(taskId); // This already calls saveTasks()
            // If the completed task is currently in the view modal, update its UI
            if (currentViewTaskId === taskId) {
                updateTimerControlsUI(task);
                updateLiveTimerDisplayUI(taskId); // Ensure display reflects stopped state
            }
        }
    }
    
    /**
     * Retrieves estimated hours and minutes from the add task modal.
     * @returns {{estHours: number, estMinutes: number}}
     */
    function getEstimatesFromAddModal() {
        if (!featureFlags.taskTimerSystem || !modalEstHoursAdd || !modalEstMinutesAdd) {
            return { estHours: 0, estMinutes: 0 };
        }
        return {
            estHours: parseInt(modalEstHoursAdd.value) || 0,
            estMinutes: parseInt(modalEstMinutesAdd.value) || 0
        };
    }

    /**
     * Retrieves estimated hours and minutes from the edit task modal.
     * @returns {{estHours: number, estMinutes: number}}
     */
    function getEstimatesFromEditModal() {
        if (!featureFlags.taskTimerSystem || !modalEstHoursViewEdit || !modalEstMinutesViewEdit) {
            // Fallback to current task values if elements aren't there, though they should be if feature is on
            const task = editingTaskId ? tasks.find(t => t.id === editingTaskId) : null;
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


    // --- Expose Public Interface ---
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
        getEstimatesFromEditModal: getEstimatesFromEditModal,
        // Exposing these for potential direct use if absolutely necessary, but prefer encapsulated calls
        _startTimerLogic: startTimerLogic,
        _pauseTimerLogic: pauseTimerLogic,
        _stopTimerLogic: stopTimerLogic,
        _updateTimerControlsUI: updateTimerControlsUI // Useful for ui_interactions to call after task edit
    };

})();
