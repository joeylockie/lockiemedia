// pomodoro_timer.js

// Self-invoking function to encapsulate the Pomodoro Timer Hybrid feature's code.
(function() {
    // --- DOM Element References (populated in initialize or renderPomodoroPage) ---
    let pomodoroPageContainer;
    let timerDisplay;
    let pomodoroStateDisplay;
    let startPauseButton;
    let stopButton;
    let resetButton;
    let skipButton;
    let pomodoroTaskSelect;

    // Sidebar display elements (references obtained in updateSidebarPomodoroDisplay)
    let sidebarPomodoroDisplay;
    let sidebarPomodoroStateText;
    let sidebarPomodoroTimeText;
    let sidebarPomodoroTaskText;

    // --- Feature-Specific State (managed globally in store.js for now) ---
    // isPomodoroActive, currentPomodoroState, pomodoroTimeRemaining, pomodoroCurrentTaskId
    // tasks, currentTaskViewMode (from store.js)
    // FeatureFlagService (global)
    // ViewManager (global)
    // utils.js functions (formatTime, etc. - global)
    // ui_rendering.js functions (showMessage - global)


    // Default settings for Pomodoro timer (can be made configurable later)
    const settings = {
        workDuration: 25 * 60, // seconds
        shortBreakDuration: 5 * 60, // seconds
        longBreakDuration: 15 * 60, // seconds
        sessionsBeforeLongBreak: 4
    };
    let sessionsCompleted = 0; // This state is local to this module for now
    let currentTimerInterval = null; // Interval ID for the timer

    /**
     * Formats total seconds into MM:SS string.
     * Relies on formatTime from utils.js if available, otherwise local fallback.
     * @param {number} totalSeconds - The total seconds to format.
     * @returns {string} Formatted time string.
     */
    function formatPomodoroTime(totalSeconds) {
        if (typeof formatTime === 'function') { // Prefer utils.js version if available
            // utils.formatTime expects HH:MM, so we need to adapt or use a different util
            // For MM:SS, a direct implementation is simpler here.
        }
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    /**
     * Updates the timer display on the Pomodoro page and sidebar.
     */
    function updateDisplay() {
        // Assumes currentTaskViewMode, pomodoroTimeRemaining, currentPomodoroState are global from store.js
        // Assumes ViewManager is global
        if (typeof ViewManager === 'undefined' || typeof pomodoroTimeRemaining === 'undefined' || typeof currentPomodoroState === 'undefined') {
            console.warn("[Pomodoro] ViewManager or Pomodoro state not available for display update.");
            return;
        }

        if (ViewManager.getCurrentTaskViewMode() === 'pomodoro' && timerDisplay) {
            timerDisplay.textContent = formatPomodoroTime(pomodoroTimeRemaining);
            if (pomodoroStateDisplay) {
                let stateText = currentPomodoroState.charAt(0).toUpperCase() + currentPomodoroState.slice(1);
                if (stateText.includes('Break')) stateText = stateText.replace('Break', ' Break');
                pomodoroStateDisplay.textContent = stateText;
            }
        }
        updateSidebarPomodoroDisplay(); // Always update sidebar if active
    }

    /**
     * Starts the Pomodoro timer for the current session.
     */
    function startPomodoroSession() {
        // Assumes isPomodoroActive, pomodoroTimeRemaining are global from store.js
        if (typeof isPomodoroActive === 'undefined' || typeof pomodoroTimeRemaining === 'undefined') {
            console.error("[Pomodoro] Pomodoro state variables not defined for startPomodoroSession.");
            return;
        }

        if (currentTimerInterval) clearInterval(currentTimerInterval);
        isPomodoroActive = true; // Update global state

        currentTimerInterval = setInterval(() => {
            pomodoroTimeRemaining--; // Update global state
            if (pomodoroTimeRemaining < 0) {
                clearInterval(currentTimerInterval);
                isPomodoroActive = false; // Update global state
                handleSessionEnd();
            } else {
                updateDisplay();
            }
        }, 1000);

        if(startPauseButton) startPauseButton.textContent = 'Pause';
        updateDisplay();
        console.log(`[Pomodoro] Session started: ${currentPomodoroState}`);
    }

    /**
     * Pauses the currently active Pomodoro timer.
     */
    function pausePomodoroSession() {
        // Assumes isPomodoroActive is global from store.js
        if (typeof isPomodoroActive === 'undefined') {
            console.error("[Pomodoro] 'isPomodoroActive' not defined for pausePomodoroSession.");
            return;
        }
        clearInterval(currentTimerInterval);
        currentTimerInterval = null;
        isPomodoroActive = false; // Update global state (or use a specific 'isPaused' state)
        if(startPauseButton) startPauseButton.textContent = 'Resume';
        console.log("[Pomodoro] Session paused.");
    }

    /**
     * Stops the Pomodoro timer completely and resets to a work session.
     */
    function stopPomodoroSession() {
        // Assumes isPomodoroActive, currentPomodoroState, pomodoroTimeRemaining, pomodoroCurrentTaskId are global from store.js
        if (typeof isPomodoroActive === 'undefined' || typeof currentPomodoroState === 'undefined' ||
            typeof pomodoroTimeRemaining === 'undefined' || typeof pomodoroCurrentTaskId === 'undefined') {
            console.error("[Pomodoro] Pomodoro state variables not defined for stopPomodoroSession.");
            return;
        }
        clearInterval(currentTimerInterval);
        currentTimerInterval = null;
        isPomodoroActive = false;
        currentPomodoroState = 'work';
        pomodoroTimeRemaining = settings.workDuration;
        if(startPauseButton) startPauseButton.textContent = 'Start';
        pomodoroCurrentTaskId = null; // Unlink task
        sessionsCompleted = 0; // Reset session count
        updateDisplay();
        updateSidebarPomodoroDisplay();
        console.log("[Pomodoro] Session stopped and reset.");
    }

    /**
     * Resets the timer for the current session type (work or break).
     */
    function resetCurrentSession() {
        // Assumes isPomodoroActive, currentPomodoroState, pomodoroTimeRemaining are global from store.js
        if (typeof isPomodoroActive === 'undefined' || typeof currentPomodoroState === 'undefined' || typeof pomodoroTimeRemaining === 'undefined') {
            console.error("[Pomodoro] Pomodoro state variables not defined for resetCurrentSession.");
            return;
        }
        clearInterval(currentTimerInterval);
        isPomodoroActive = false;
        switch (currentPomodoroState) {
            case 'work': pomodoroTimeRemaining = settings.workDuration; break;
            case 'shortBreak': pomodoroTimeRemaining = settings.shortBreakDuration; break;
            case 'longBreak': pomodoroTimeRemaining = settings.longBreakDuration; break;
            default: pomodoroTimeRemaining = settings.workDuration; // Fallback
        }
        if(startPauseButton) startPauseButton.textContent = 'Start';
        updateDisplay();
        console.log(`[Pomodoro] Current session (${currentPomodoroState}) reset.`);
    }

    /**
     * Handles the end of a Pomodoro session (work or break) and transitions to the next.
     */
    function handleSessionEnd() {
        // Assumes currentPomodoroState, pomodoroTimeRemaining, pomodoroCurrentTaskId are global from store.js
        // Assumes showMessage is global from ui_rendering.js
        if (typeof currentPomodoroState === 'undefined' || typeof pomodoroTimeRemaining === 'undefined' ||
            typeof pomodoroCurrentTaskId === 'undefined' || typeof showMessage !== 'function') {
            console.error("[Pomodoro] Dependencies for handleSessionEnd not met.");
            return;
        }

        let endedSessionType = currentPomodoroState.charAt(0).toUpperCase() + currentPomodoroState.slice(1).replace('B', ' B');
        showMessage(`Pomodoro: ${endedSessionType} session ended!`, 'info');
        console.log(`[Pomodoro] Session ended: ${currentPomodoroState}`);

        if (currentPomodoroState === 'work') {
            sessionsCompleted++;
            if (pomodoroCurrentTaskId) {
                console.log(`[Pomodoro] Work session for task ID ${pomodoroCurrentTaskId} completed.`);
                // Future: Mark task progress or log work session
            }
            if (sessionsCompleted % settings.sessionsBeforeLongBreak === 0) {
                currentPomodoroState = 'longBreak';
                pomodoroTimeRemaining = settings.longBreakDuration;
            } else {
                currentPomodoroState = 'shortBreak';
                pomodoroTimeRemaining = settings.shortBreakDuration;
            }
        } else { // End of a break
            currentPomodoroState = 'work';
            pomodoroTimeRemaining = settings.workDuration;
        }
        pomodoroCurrentTaskId = null; // Clear linked task for the next session
        if (pomodoroTaskSelect) pomodoroTaskSelect.value = ""; // Reset dropdown
        if(startPauseButton) startPauseButton.textContent = 'Start';
        updateDisplay();
        // Future: Option to auto-start next session or wait for user input.
    }

    /**
     * Skips the current Pomodoro session and moves to the next one.
     */
    function skipCurrentSession() {
        clearInterval(currentTimerInterval);
        isPomodoroActive = false; // Assumes global from store.js
        handleSessionEnd(); // Transitions to the next state and updates display
        // Optionally, auto-start the next session:
        // startPomodoroSession();
        console.log("[Pomodoro] Current session skipped.");
    }

    /**
     * Renders the main Pomodoro timer page UI.
     */
    function renderPomodoroPage() {
        // Assumes pomodoroPageContainer is an initialized DOM element
        // Assumes currentPomodoroState, pomodoroTimeRemaining, isPomodoroActive are global from store.js
        if (!pomodoroPageContainer) {
            console.warn("[Pomodoro] Page container not found for rendering.");
            return;
        }
        pomodoroPageContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-xl text-center">
                <h2 id="pomodoroStateDisplayP" class="text-3xl font-bold text-slate-700 dark:text-slate-200 mb-4">
                    ${currentPomodoroState.charAt(0).toUpperCase() + currentPomodoroState.slice(1).replace('B', ' B')}
                </h2>
                <div id="pomodoroTimerDisplayP" class="text-7xl font-mono font-bold text-rose-500 dark:text-rose-400 mb-6">
                    ${formatPomodoroTime(pomodoroTimeRemaining)}
                </div>
                <div class="flex gap-4 mb-6">
                    <button id="pomodoroStartPauseBtnP" class="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-semibold text-lg transition-colors">
                        ${isPomodoroActive && currentTimerInterval ? 'Pause' : 'Start'}
                    </button>
                    <button id="pomodoroStopBtnP" class="px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-semibold text-lg transition-colors">Stop</button>
                </div>
                <div class="flex gap-4">
                     <button id="pomodoroResetBtnP" class="px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200 rounded-lg text-sm">Reset</button>
                     <button id="pomodoroSkipBtnP" class="px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200 rounded-lg text-sm">Skip</button>
                </div>
                <div class="mt-8 w-full max-w-xs">
                    <label for="pomodoroTaskSelectP" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Link to Task (optional):</label>
                    <select id="pomodoroTaskSelectP" class="w-full p-2 border-2 bg-white text-slate-900 border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600">
                        <option value="">-- Select a Task --</option>
                    </select>
                </div>
            </div>
        `;
        // Get fresh references to the newly created elements within the Pomodoro page
        timerDisplay = document.getElementById('pomodoroTimerDisplayP');
        pomodoroStateDisplay = document.getElementById('pomodoroStateDisplayP');
        startPauseButton = document.getElementById('pomodoroStartPauseBtnP');
        stopButton = document.getElementById('pomodoroStopBtnP');
        resetButton = document.getElementById('pomodoroResetBtnP');
        skipButton = document.getElementById('pomodoroSkipBtnP');
        pomodoroTaskSelect = document.getElementById('pomodoroTaskSelectP');

        // Add event listeners
        if (startPauseButton) {
            startPauseButton.addEventListener('click', () => {
                if (isPomodoroActive && currentTimerInterval) {
                    pausePomodoroSession();
                } else {
                    if (pomodoroTimeRemaining === 0 && !isPomodoroActive) {
                        handleSessionEnd(); // Prepare next session if timer ended
                    }
                    startPomodoroSession();
                }
            });
        }
        if (stopButton) stopButton.addEventListener('click', stopPomodoroSession);
        if (resetButton) resetButton.addEventListener('click', resetCurrentSession);
        if (skipButton) skipButton.addEventListener('click', skipCurrentSession);
        if (pomodoroTaskSelect) {
            populatePomodoroTaskSelector();
            pomodoroTaskSelect.addEventListener('change', (e) => {
                pomodoroCurrentTaskId = e.target.value ? parseInt(e.target.value) : null; // Update global state
                console.log("[Pomodoro] Task linked: ", pomodoroCurrentTaskId);
                updateSidebarPomodoroDisplay(); // Update sidebar if task changes
            });
        }
        console.log("[Pomodoro] Page rendered and event listeners attached.");
    }

    /**
     * Populates the task selector dropdown on the Pomodoro page.
     */
    function populatePomodoroTaskSelector() {
        // Assumes pomodoroTaskSelect is an initialized DOM element
        // Assumes tasks, pomodoroCurrentTaskId are global from store.js
        if (!pomodoroTaskSelect || typeof tasks === 'undefined' || typeof pomodoroCurrentTaskId === 'undefined') return;

        pomodoroTaskSelect.innerHTML = '<option value="">-- Select a Task --</option>';
        tasks.filter(task => !task.completed).forEach(task => {
            const option = document.createElement('option');
            option.value = task.id;
            option.textContent = task.text;
            if (task.id === pomodoroCurrentTaskId) {
                option.selected = true;
            }
            pomodoroTaskSelect.appendChild(option);
        });
    }

    /**
     * Updates the Pomodoro timer display in the sidebar.
     */
    function updateSidebarPomodoroDisplay() {
        // Assumes DOM elements (sidebarPomodoroDisplay, etc.) are initialized globally or via initializeDOMElements
        // Assumes FeatureFlagService, ViewManager are global
        // Assumes Pomodoro state variables (isPomodoroActive, etc.) are global from store.js
        if (!sidebarPomodoroDisplay) sidebarPomodoroDisplay = document.getElementById('sidebarPomodoroTimerDisplay');
        if (!sidebarPomodoroStateText) sidebarPomodoroStateText = document.getElementById('sidebarPomodoroState');
        if (!sidebarPomodoroTimeText) sidebarPomodoroTimeText = document.getElementById('sidebarPomodoroTime');
        if (!sidebarPomodoroTaskText) sidebarPomodoroTaskText = document.getElementById('sidebarPomodoroTask');

        if (!sidebarPomodoroDisplay || typeof FeatureFlagService === 'undefined' || typeof ViewManager === 'undefined' ||
            typeof isPomodoroActive === 'undefined' || typeof currentPomodoroState === 'undefined' ||
            typeof pomodoroTimeRemaining === 'undefined' || typeof tasks === 'undefined') {
            // console.warn("[PomodoroSidebar] Dependencies for update not met.");
            if(sidebarPomodoroDisplay) sidebarPomodoroDisplay.classList.add('hidden'); // Ensure it's hidden if dependencies fail
            return;
        }

        const isSidebarMaximized = !document.getElementById('taskSidebar')?.classList.contains('sidebar-minimized');

        if (FeatureFlagService.isFeatureEnabled('pomodoroTimerHybridFeature') && isPomodoroActive && isSidebarMaximized && ViewManager.getCurrentTaskViewMode() !== 'pomodoro') {
            sidebarPomodoroDisplay.classList.remove('hidden');
            if (sidebarPomodoroStateText) {
                 let stateText = currentPomodoroState.charAt(0).toUpperCase() + currentPomodoroState.slice(1);
                 if (stateText.includes('Break')) stateText = stateText.replace('Break', ' Break');
                 sidebarPomodoroStateText.textContent = stateText;
            }
            if (sidebarPomodoroTimeText) sidebarPomodoroTimeText.textContent = formatPomodoroTime(pomodoroTimeRemaining);
            if (sidebarPomodoroTaskText) {
                const linkedTask = pomodoroCurrentTaskId ? tasks.find(t => t.id === pomodoroCurrentTaskId) : null;
                sidebarPomodoroTaskText.textContent = linkedTask ? `Task: ${linkedTask.text.substring(0, 25)}${linkedTask.text.length > 25 ? '...' : ''}` : 'No task linked';
            }
        } else {
            sidebarPomodoroDisplay.classList.add('hidden');
        }
    }

    /**
     * Initializes the Pomodoro Timer Hybrid Feature.
     */
    function initialize() {
        console.log('[Pomodoro] Initializing Pomodoro Timer Hybrid Feature...');
        pomodoroPageContainer = document.getElementById('pomodoroTimerPageContainer');
        // Sidebar elements are fetched dynamically in updateSidebarPomodoroDisplay

        // Initialize Pomodoro state if not already set (e.g., from store.js defaults)
        // This ensures that if the script loads and these aren't set, they get a default.
        if (typeof isPomodoroActive === 'undefined') isPomodoroActive = false;
        if (typeof currentPomodoroState === 'undefined') currentPomodoroState = 'work';
        if (typeof pomodoroTimeRemaining === 'undefined' || (pomodoroTimeRemaining === 0 && !isPomodoroActive)) {
             pomodoroTimeRemaining = settings.workDuration;
        }
        if (typeof pomodoroCurrentTaskId === 'undefined') pomodoroCurrentTaskId = null;

        console.log('[Pomodoro] Feature Initialized.');
    }

    /**
     * Updates the visibility of UI elements related to this feature.
     * @param {boolean} isEnabledParam - Parameter for consistency, actual check uses FeatureFlagService.
     */
    function updateUIVisibility(isEnabledParam) {
        // Assumes FeatureFlagService, ViewManager are global
        if (typeof FeatureFlagService === 'undefined' || typeof ViewManager === 'undefined') {
            console.error("[Pomodoro] FeatureFlagService or ViewManager not available for UI visibility update.");
            return;
        }
        const isActuallyEnabled = FeatureFlagService.isFeatureEnabled('pomodoroTimerHybridFeature');

        const elements = document.querySelectorAll('.pomodoro-timer-hybrid-feature-element');
        elements.forEach(el => {
            el.classList.toggle('hidden', !isActuallyEnabled);
        });

        if (!isActuallyEnabled) {
            if (ViewManager.getCurrentTaskViewMode() === 'pomodoro') {
                ViewManager.setTaskViewMode('list'); // Switch view if Pomodoro was active
                if(typeof refreshTaskView === 'function') refreshTaskView();
            }
            if (isPomodoroActive) stopPomodoroSession(); // Stop timer if feature is disabled
            if(sidebarPomodoroDisplay) sidebarPomodoroDisplay.classList.add('hidden');
        } else {
            updateSidebarPomodoroDisplay(); // Update sidebar display if enabling
        }
        console.log(`[Pomodoro] UI Visibility set to: ${isActuallyEnabled}`);
    }

    /**
     * Handles changes in the main application view mode.
     * @param {string} newViewMode - The new view mode (e.g., 'list', 'pomodoro').
     */
    function handleViewChange(newViewMode) {
        // Assumes pomodoroPageContainer is initialized
        if (newViewMode === 'pomodoro') {
            renderPomodoroPage();
            if(sidebarPomodoroDisplay) sidebarPomodoroDisplay.classList.add('hidden');
        } else {
            if (pomodoroPageContainer) pomodoroPageContainer.classList.add('hidden');
            updateSidebarPomodoroDisplay();
        }
    }

    // Expose Public Interface
    if (typeof window.AppFeatures === 'undefined') {
        window.AppFeatures = {};
    }
    window.AppFeatures.PomodoroTimerHybrid = {
        initialize: initialize,
        updateUIVisibility: updateUIVisibility,
        renderPomodoroPage: renderPomodoroPage,
        updateSidebarDisplay: updateSidebarPomodoroDisplay,
        handleViewChange: handleViewChange,
        start: startPomodoroSession,
        pause: pausePomodoroSession,
        stop: stopPomodoroSession,
        skip: skipCurrentSession,
        reset: resetCurrentSession
    };

    // console.log("pomodoro_timer.js loaded");
})();
