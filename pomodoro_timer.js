// pomodoro_timer.js

(function() {
    // --- DOM Element References (to be populated in initialize and used by rendering functions) ---
    let pomodoroPageContainer; // The main container for the Pomodoro page view
    let timerDisplay; // e.g., 25:00
    let pomodoroStateDisplay; // e.g., "Work", "Short Break", "Long Break"
    let startPauseButton;
    let stopButton;
    let resetButton;
    let skipButton;
    let pomodoroTaskSelect; // Dropdown or input to select/link a task
    let pomodoroSettingsButton; // Button to open Pomodoro specific settings (e.g., work/break durations)

    // Sidebar display elements (references will be set in initialize if needed here, or handled by ui_rendering.js)
    let sidebarPomodoroDisplay; // The container in the sidebar
    let sidebarPomodoroStateText;
    let sidebarPomodoroTimeText;
    let sidebarPomodoroTaskText;

    // --- Feature-Specific State ---
    let currentTimerInterval = null;
    let settings = {
        workDuration: 25 * 60, // seconds
        shortBreakDuration: 5 * 60, // seconds
        longBreakDuration: 15 * 60, // seconds
        sessionsBeforeLongBreak: 4
    };
    let sessionsCompleted = 0;

    // --- Core Logic Functions ---

    function formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function updateDisplay() {
        if (currentTaskViewMode === 'pomodoro' && timerDisplay) {
            timerDisplay.textContent = formatTime(pomodoroTimeRemaining);
            if (pomodoroStateDisplay) pomodoroStateDisplay.textContent = currentPomodoroState.charAt(0).toUpperCase() + currentPomodoroState.slice(1).replace('B', ' B');
        }
        // Update sidebar display (logic to show/hide based on view mode and sidebar state will be elsewhere)
        updateSidebarPomodoroDisplay();
    }

    function startTimer() {
        if (currentTimerInterval) clearInterval(currentTimerInterval);
        isPomodoroActive = true;

        currentTimerInterval = setInterval(() => {
            pomodoroTimeRemaining--;
            if (pomodoroTimeRemaining < 0) {
                clearInterval(currentTimerInterval);
                isPomodoroActive = false;
                handleSessionEnd();
            } else {
                updateDisplay();
            }
        }, 1000);
        if(startPauseButton) startPauseButton.textContent = 'Pause';
        updateDisplay(); // Initial display update
    }

    function pauseTimer() {
        clearInterval(currentTimerInterval);
        currentTimerInterval = null;
        isPomodoroActive = false; // Or a new state like 'isPomodoroPaused'
        if(startPauseButton) startPauseButton.textContent = 'Resume';
    }

    function stopTimer() {
        clearInterval(currentTimerInterval);
        currentTimerInterval = null;
        isPomodoroActive = false;
        // Reset to work session or allow user to choose
        currentPomodoroState = 'work';
        pomodoroTimeRemaining = settings.workDuration;
        if(startPauseButton) startPauseButton.textContent = 'Start';
        pomodoroCurrentTaskId = null; // Unlink task
        updateDisplay();
        updateSidebarPomodoroDisplay(); // Ensure sidebar is cleared or updated
    }
    
    function resetTimer() {
        clearInterval(currentTimerInterval);
        isPomodoroActive = false;
        switch (currentPomodoroState) {
            case 'work':
                pomodoroTimeRemaining = settings.workDuration;
                break;
            case 'shortBreak':
                pomodoroTimeRemaining = settings.shortBreakDuration;
                break;
            case 'longBreak':
                pomodoroTimeRemaining = settings.longBreakDuration;
                break;
        }
        if(startPauseButton) startPauseButton.textContent = 'Start';
        updateDisplay();
    }


    function handleSessionEnd() {
        // Notify user (sound, visual notification) - To be implemented
        showMessage(`Pomodoro: ${currentPomodoroState} session ended!`, 'info');

        if (currentPomodoroState === 'work') {
            sessionsCompleted++;
            if (pomodoroCurrentTaskId) {
                // Potentially mark task progress or log work session - Advanced
                console.log(`Work session for task ID ${pomodoroCurrentTaskId} completed.`);
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
        pomodoroCurrentTaskId = null; // Clear linked task for the next session, user can re-link
        if(startPauseButton) startPauseButton.textContent = 'Start';
        updateDisplay();
        // Potentially auto-start next session or wait for user
    }

    function skipSession() {
        clearInterval(currentTimerInterval);
        isPomodoroActive = false;
        handleSessionEnd(); // This will transition to the next state
        // if needed, call startTimer() here to auto-start next session
    }


    // --- UI Rendering Functions for Pomodoro Page ---
    function renderPomodoroPage() {
        if (!pomodoroPageContainer) {
            console.warn("Pomodoro page container not found for rendering.");
            return;
        }
        // This function will be responsible for drawing the main Pomodoro timer UI
        // For now, it's just a placeholder.
        // We'll get specific element IDs from ui_rendering.js later.
        pomodoroPageContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-xl text-center">
                <h2 id="pomodoroStateDisplay" class="text-3xl font-bold text-slate-700 dark:text-slate-200 mb-4">${currentPomodoroState.charAt(0).toUpperCase() + currentPomodoroState.slice(1).replace('B', ' B')}</h2>
                <div id="pomodoroTimerDisplay" class="text-7xl font-mono font-bold text-rose-500 dark:text-rose-400 mb-6">${formatTime(pomodoroTimeRemaining)}</div>
                <div class="flex gap-4 mb-6">
                    <button id="pomodoroStartPauseBtn" class="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-semibold text-lg transition-colors">
                        ${isPomodoroActive && currentTimerInterval ? 'Pause' : 'Start'}
                    </button>
                    <button id="pomodoroStopBtn" class="px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-semibold text-lg transition-colors">Stop</button>
                </div>
                <div class="flex gap-4">
                     <button id="pomodoroResetBtn" class="px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200 rounded-lg text-sm">Reset</button>
                     <button id="pomodoroSkipBtn" class="px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200 rounded-lg text-sm">Skip</button>
                </div>
                <div class="mt-8 w-full max-w-xs">
                    <label for="pomodoroTaskSelect" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Link to Task (optional):</label>
                    <select id="pomodoroTaskSelect" class="w-full p-2 border-2 bg-white text-slate-900 border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600">
                        <option value="">-- Select a Task --</option>
                        </select>
                </div>
                </div>
        `;
        // After rendering, get fresh references to the newly created elements
        timerDisplay = document.getElementById('pomodoroTimerDisplay');
        pomodoroStateDisplay = document.getElementById('pomodoroStateDisplay');
        startPauseButton = document.getElementById('pomodoroStartPauseBtn');
        stopButton = document.getElementById('pomodoroStopBtn');
        resetButton = document.getElementById('pomodoroResetBtn');
        skipButton = document.getElementById('pomodoroSkipBtn');
        pomodoroTaskSelect = document.getElementById('pomodoroTaskSelect');

        // Add event listeners
        if (startPauseButton) {
            startPauseButton.addEventListener('click', () => {
                if (isPomodoroActive && currentTimerInterval) { // If running, then pause
                    pauseTimer();
                } else { // If paused or stopped, then start/resume
                    if (pomodoroTimeRemaining === 0 && !isPomodoroActive) { // If timer ended naturally, prepare next session before starting
                        handleSessionEnd(); // This sets up next state and time
                    }
                    startTimer();
                }
            });
        }
        if (stopButton) stopButton.addEventListener('click', stopTimer);
        if (resetButton) resetButton.addEventListener('click', resetTimer);
        if (skipButton) skipButton.addEventListener('click', skipSession);
        if (pomodoroTaskSelect) {
            populatePomodoroTaskSelector(); // Populate tasks initially
            pomodoroTaskSelect.addEventListener('change', (e) => {
                pomodoroCurrentTaskId = e.target.value ? parseInt(e.target.value) : null;
                console.log("Pomodoro task linked: ", pomodoroCurrentTaskId);
            });
        }
    }

    function populatePomodoroTaskSelector() {
        if (!pomodoroTaskSelect) return;
        pomodoroTaskSelect.innerHTML = '<option value="">-- Select a Task --</option>'; // Clear existing
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
    
    // --- Sidebar Display Update ---
    function updateSidebarPomodoroDisplay() {
        if (!sidebarPomodoroDisplay) { // Try to get it if not already set
            sidebarPomodoroDisplay = document.getElementById('sidebarPomodoroTimerDisplay');
            sidebarPomodoroStateText = document.getElementById('sidebarPomodoroState');
            sidebarPomodoroTimeText = document.getElementById('sidebarPomodoroTime');
            sidebarPomodoroTaskText = document.getElementById('sidebarPomodoroTask');
        }

        if (!sidebarPomodoroDisplay || !featureFlags.pomodoroTimerHybridFeature) return;

        const isSidebarMaximized = !document.getElementById('taskSidebar')?.classList.contains('sidebar-minimized');

        if (isPomodoroActive && isSidebarMaximized && currentTaskViewMode !== 'pomodoro') {
            sidebarPomodoroDisplay.classList.remove('hidden');
            if (sidebarPomodoroStateText) sidebarPomodoroStateText.textContent = currentPomodoroState.charAt(0).toUpperCase() + currentPomodoroState.slice(1).replace('B', ' B');
            if (sidebarPomodoroTimeText) sidebarPomodoroTimeText.textContent = formatTime(pomodoroTimeRemaining);
            if (sidebarPomodoroTaskText) {
                const linkedTask = pomodoroCurrentTaskId ? tasks.find(t => t.id === pomodoroCurrentTaskId) : null;
                sidebarPomodoroTaskText.textContent = linkedTask ? `Task: ${linkedTask.text}` : 'No task linked';
            }
        } else {
            sidebarPomodoroDisplay.classList.add('hidden');
        }
    }


    // --- Public Interface ---
    function initialize() {
        console.log('Pomodoro Timer Hybrid Feature Initializing...');
        pomodoroPageContainer = document.getElementById('pomodoroTimerPageContainer');
        
        // Sidebar elements (main references are obtained in updateSidebarPomodoroDisplay)
        sidebarPomodoroDisplay = document.getElementById('sidebarPomodoroTimerDisplay');

        // Set initial timer state if not already set (e.g. from page load)
        if (pomodoroTimeRemaining === 0 && !isPomodoroActive) {
             currentPomodoroState = 'work'; // Default start state
             pomodoroTimeRemaining = settings.workDuration;
        }

        console.log('Pomodoro Timer Hybrid Feature Initialized.');
    }

    function updateUIVisibility(isEnabled) {
        const elements = document.querySelectorAll('.pomodoro-timer-hybrid-feature-element');
        elements.forEach(el => {
            el.classList.toggle('hidden', !isEnabled);
        });
        if (!isEnabled) {
            if (currentTaskViewMode === 'pomodoro') setTaskViewMode('list'); // Switch view if Pomodoro was active
            if (isPomodoroActive) stopTimer(); // Stop timer if feature is disabled
            if(sidebarPomodoroDisplay) sidebarPomodoroDisplay.classList.add('hidden');
        }
        console.log(`Pomodoro Timer UI Visibility set to: ${isEnabled}`);
    }
    
    function handleViewChange(newViewMode) {
        // This function can be called by ui_event_handlers when the view mode changes.
        if (newViewMode === 'pomodoro') {
            renderPomodoroPage();
            if(sidebarPomodoroDisplay) sidebarPomodoroDisplay.classList.add('hidden'); // Hide sidebar display when on pomodoro page
        } else {
            if (pomodoroPageContainer) pomodoroPageContainer.classList.add('hidden'); // Hide page content
            updateSidebarPomodoroDisplay(); // Show sidebar display if timer is active and sidebar is maximized
        }
    }


    if (typeof window.AppFeatures === 'undefined') {
        window.AppFeatures = {};
    }

    window.AppFeatures.PomodoroTimerHybrid = {
        initialize: initialize,
        updateUIVisibility: updateUIVisibility,
        renderPomodoroPage: renderPomodoroPage, // Called when switching to Pomodoro view
        updateSidebarDisplay: updateSidebarPomodoroDisplay, // Called on timer ticks or sidebar state change
        handleViewChange: handleViewChange, // Called from ui_event_handlers on view switch
        // Potentially expose other control functions if needed globally, e.g. for global hotkeys
        start: startTimer,
        pause: pauseTimer,
        stop: stopTimer,
        skip: skipSession,
        reset: resetTimer
    };

})();