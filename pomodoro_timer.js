// pomodoro_timer.js

// Self-invoking function to encapsulate the Pomodoro Timer Hybrid feature's code.
(function() {
    // --- DOM Element References (populated in initialize or renderPomodoroPage) ---
    let pomodoroPageContainer;
    let timerDisplayOnPage; 
    let pomodoroStateDisplayOnPage; 
    let startPauseButtonOnPage; 
    let stopButtonOnPage; 
    let resetButtonOnPage; 
    let skipButtonOnPage; 
    let pomodoroTaskSelectOnPage; 

    // Sidebar display elements
    let sidebarPomodoroDisplayEl; 
    let sidebarPomodoroStateTextEl; 
    let sidebarPomodoroTimeTextEl; 
    let sidebarPomodoroTaskTextEl; 

    // --- Internal Pomodoro State (Owned by this module) ---
    let _isActive = false;
    let _currentState = 'work'; // 'work', 'shortBreak', 'longBreak'
    let _timeRemaining = 25 * 60; 
    let _currentTaskId = null; 
    let _sessionsCompleted = 0;
    let _currentTimerInterval = null;

    const SETTINGS = {
        workDuration: 25 * 60,
        shortBreakDuration: 5 * 60,
        longBreakDuration: 15 * 60,
        sessionsBeforeLongBreak: 4
    };

    // Dependencies: FeatureFlagService, ViewManager, AppStore (for tasks), EventBus, utils.js, ui_rendering.js (showMessage)

    function _publishStateUpdate() {
        if (window.EventBus && typeof window.EventBus.publish === 'function') {
            EventBus.publish('pomodoroStateUpdated', {
                isActive: _isActive,
                state: _currentState,
                timeRemaining: _timeRemaining,
                currentTaskId: _currentTaskId,
                sessionsCompleted: _sessionsCompleted
            });
        }
    }

    function formatPomodoroTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function updateDisplayOnPage() {
        if (typeof ViewManager === 'undefined' || ViewManager.getCurrentTaskViewMode() !== 'pomodoro') return;

        if (timerDisplayOnPage) timerDisplayOnPage.textContent = formatPomodoroTime(_timeRemaining);
        if (pomodoroStateDisplayOnPage) {
            let stateText = _currentState.charAt(0).toUpperCase() + _currentState.slice(1);
            if (stateText.includes('Break')) stateText = stateText.replace('Break', ' Break');
            pomodoroStateDisplayOnPage.textContent = stateText;
        }
        if (startPauseButtonOnPage) {
            startPauseButtonOnPage.textContent = _isActive && _currentTimerInterval ? 'Pause' : 'Start';
        }
    }
    
    function updateSidebarPomodoroDisplay() {
        if (!sidebarPomodoroDisplayEl) sidebarPomodoroDisplayEl = document.getElementById('sidebarPomodoroTimerDisplay');
        if (!sidebarPomodoroStateTextEl) sidebarPomodoroStateTextEl = document.getElementById('sidebarPomodoroState');
        if (!sidebarPomodoroTimeTextEl) sidebarPomodoroTimeTextEl = document.getElementById('sidebarPomodoroTime');
        if (!sidebarPomodoroTaskTextEl) sidebarPomodoroTaskTextEl = document.getElementById('sidebarPomodoroTask');

        if (!sidebarPomodoroDisplayEl || typeof FeatureFlagService === 'undefined' || typeof ViewManager === 'undefined' || typeof AppStore === 'undefined') {
            if(sidebarPomodoroDisplayEl) sidebarPomodoroDisplayEl.classList.add('hidden');
            return;
        }

        const isSidebarMaximized = !document.getElementById('taskSidebar')?.classList.contains('sidebar-minimized');

        if (FeatureFlagService.isFeatureEnabled('pomodoroTimerHybridFeature') && _isActive && isSidebarMaximized && ViewManager.getCurrentTaskViewMode() !== 'pomodoro') {
            sidebarPomodoroDisplayEl.classList.remove('hidden');
            if (sidebarPomodoroStateTextEl) {
                 let stateText = _currentState.charAt(0).toUpperCase() + _currentState.slice(1);
                 if (stateText.includes('Break')) stateText = stateText.replace('Break', ' Break');
                 sidebarPomodoroStateTextEl.textContent = stateText;
            }
            if (sidebarPomodoroTimeTextEl) sidebarPomodoroTimeTextEl.textContent = formatPomodoroTime(_timeRemaining);
            if (sidebarPomodoroTaskTextEl) {
                const linkedTask = _currentTaskId ? AppStore.getTasks().find(t => t.id === _currentTaskId) : null;
                sidebarPomodoroTaskTextEl.textContent = linkedTask ? `Task: ${linkedTask.text.substring(0, 25)}${linkedTask.text.length > 25 ? '...' : ''}` : 'No task linked';
            }
        } else {
            sidebarPomodoroDisplayEl.classList.add('hidden');
        }
    }

    function startPomodoroSession() {
        if (_currentTimerInterval) clearInterval(_currentTimerInterval);
        _isActive = true;

        _currentTimerInterval = setInterval(() => {
            _timeRemaining--;
            if (_timeRemaining < 0) {
                clearInterval(_currentTimerInterval);
                _isActive = false;
                handleSessionEnd();
            } else {
                updateDisplayOnPage();
                _publishStateUpdate(); 
            }
        }, 1000);

        updateDisplayOnPage();
        _publishStateUpdate();
        console.log(`[Pomodoro] Session started: ${_currentState}`);
    }

    function pausePomodoroSession() {
        clearInterval(_currentTimerInterval);
        _currentTimerInterval = null;
        _isActive = false; 
        updateDisplayOnPage();
        _publishStateUpdate();
        console.log("[Pomodoro] Session paused.");
    }

    function stopPomodoroSession() {
        clearInterval(_currentTimerInterval);
        _currentTimerInterval = null;
        _isActive = false;
        _currentState = 'work';
        _timeRemaining = SETTINGS.workDuration;
        _currentTaskId = null; 
        _sessionsCompleted = 0;
        updateDisplayOnPage();
        _publishStateUpdate(); 
        console.log("[Pomodoro] Session stopped and reset.");
    }

    function resetCurrentSession() {
        clearInterval(_currentTimerInterval);
        _isActive = false;
        switch (_currentState) {
            case 'work': _timeRemaining = SETTINGS.workDuration; break;
            case 'shortBreak': _timeRemaining = SETTINGS.shortBreakDuration; break;
            case 'longBreak': _timeRemaining = SETTINGS.longBreakDuration; break;
            default: _timeRemaining = SETTINGS.workDuration;
        }
        updateDisplayOnPage();
        _publishStateUpdate();
        console.log(`[Pomodoro] Current session (${_currentState}) reset.`);
    }

    function handleSessionEnd() {
        let endedSessionType = _currentState.charAt(0).toUpperCase() + _currentState.slice(1).replace('B', ' B');
        if(typeof showMessage === 'function') showMessage(`Pomodoro: ${endedSessionType} session ended!`, 'info');
        console.log(`[Pomodoro] Session ended: ${_currentState}`);

        if (_currentState === 'work') {
            _sessionsCompleted++;
            if (_currentTaskId) {
                console.log(`[Pomodoro] Work session for task ID ${_currentTaskId} completed.`);
            }
            if (_sessionsCompleted % SETTINGS.sessionsBeforeLongBreak === 0) {
                _currentState = 'longBreak';
                _timeRemaining = SETTINGS.longBreakDuration;
            } else {
                _currentState = 'shortBreak';
                _timeRemaining = SETTINGS.shortBreakDuration;
            }
        } else { 
            _currentState = 'work';
            _timeRemaining = SETTINGS.workDuration;
        }
        _currentTaskId = null; 
        if (pomodoroTaskSelectOnPage) pomodoroTaskSelectOnPage.value = "";
        
        updateDisplayOnPage();
        _publishStateUpdate();
    }

    function skipCurrentSession() {
        clearInterval(_currentTimerInterval);
        _isActive = false;
        handleSessionEnd(); 
        console.log("[Pomodoro] Current session skipped.");
    }

    function renderPomodoroPage() {
        if (!pomodoroPageContainer) {
            console.warn("[Pomodoro] Page container not found for rendering.");
            return;
        }
        pomodoroPageContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-xl text-center">
                <h2 id="pomodoroStateDisplayP" class="text-3xl font-bold text-slate-700 dark:text-slate-200 mb-4">Work</h2>
                <div id="pomodoroTimerDisplayP" class="text-7xl font-mono font-bold text-rose-500 dark:text-rose-400 mb-6">25:00</div>
                <div class="flex gap-4 mb-6">
                    <button id="pomodoroStartPauseBtnP" class="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-semibold text-lg transition-colors">Start</button>
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
        timerDisplayOnPage = document.getElementById('pomodoroTimerDisplayP');
        pomodoroStateDisplayOnPage = document.getElementById('pomodoroStateDisplayP');
        startPauseButtonOnPage = document.getElementById('pomodoroStartPauseBtnP');
        stopButtonOnPage = document.getElementById('pomodoroStopBtnP');
        resetButtonOnPage = document.getElementById('pomodoroResetBtnP');
        skipButtonOnPage = document.getElementById('pomodoroSkipBtnP');
        pomodoroTaskSelectOnPage = document.getElementById('pomodoroTaskSelectP');

        if (startPauseButtonOnPage) startPauseButtonOnPage.addEventListener('click', () => { if (_isActive && _currentTimerInterval) { pausePomodoroSession(); } else { if (_timeRemaining === 0 && !_isActive) { handleSessionEnd(); } startPomodoroSession(); }});
        if (stopButtonOnPage) stopButtonOnPage.addEventListener('click', stopPomodoroSession);
        if (resetButtonOnPage) resetButtonOnPage.addEventListener('click', resetCurrentSession);
        if (skipButtonOnPage) skipButtonOnPage.addEventListener('click', skipCurrentSession);
        if (pomodoroTaskSelectOnPage) { populatePomodoroTaskSelector(); pomodoroTaskSelectOnPage.addEventListener('change', (e) => { _currentTaskId = e.target.value ? parseInt(e.target.value) : null; console.log("[Pomodoro] Task linked: ", _currentTaskId); _publishStateUpdate(); }); }
        
        updateDisplayOnPage();
        console.log("[Pomodoro] Page rendered and event listeners attached.");
    }

    function populatePomodoroTaskSelector() {
        if (!pomodoroTaskSelectOnPage || typeof AppStore === 'undefined' || typeof AppStore.getTasks !== 'function') return;
        const currentTasks = AppStore.getTasks();
        pomodoroTaskSelectOnPage.innerHTML = '<option value="">-- Select a Task --</option>';
        currentTasks.filter(task => !task.completed).forEach(task => {
            const option = document.createElement('option');
            option.value = task.id;
            option.textContent = task.text;
            if (task.id === _currentTaskId) option.selected = true;
            pomodoroTaskSelectOnPage.appendChild(option);
        });
    }

    function initialize() {
        console.log('[Pomodoro] Initializing Pomodoro Timer Hybrid Feature...');
        pomodoroPageContainer = document.getElementById('pomodoroTimerPageContainer');
        
        // Initialize internal state (could load from localStorage in future)
        _isActive = false;
        _currentState = 'work';
        _timeRemaining = SETTINGS.workDuration;
        _currentTaskId = null;
        _sessionsCompleted = 0;
        
        _publishStateUpdate(); // Publish initial state
        console.log('[Pomodoro] Feature Initialized with state:', { _isActive, _currentState, _timeRemaining });
    }

    function updateUIVisibility(isEnabledParam) {
        if (typeof FeatureFlagService === 'undefined' || typeof ViewManager === 'undefined') { console.error("[Pomodoro] FeatureFlagService or ViewManager not available."); return; }
        const isActuallyEnabled = FeatureFlagService.isFeatureEnabled('pomodoroTimerHybridFeature');
        const elements = document.querySelectorAll('.pomodoro-timer-hybrid-feature-element');
        elements.forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));
        if (!isActuallyEnabled) {
            if (ViewManager.getCurrentTaskViewMode() === 'pomodoro') { ViewManager.setTaskViewMode('list'); }
            if (_isActive) stopPomodoroSession(); 
            if(sidebarPomodoroDisplayEl) sidebarPomodoroDisplayEl.classList.add('hidden');
        } else {
            updateSidebarPomodoroDisplay();
        }
        console.log(`[Pomodoro] UI Visibility set to: ${isActuallyEnabled}`);
    }

    function handleViewChange(newViewMode) {
        if (newViewMode === 'pomodoro') {
            renderPomodoroPage();
            if(sidebarPomodoroDisplayEl) sidebarPomodoroDisplayEl.classList.add('hidden'); 
        } else {
            if (pomodoroPageContainer) pomodoroPageContainer.classList.add('hidden');
            updateSidebarPomodoroDisplay(); 
        }
    }

    if (typeof window.AppFeatures === 'undefined') window.AppFeatures = {};
    window.AppFeatures.PomodoroTimerHybrid = {
        initialize, updateUIVisibility, renderPomodoroPage, 
        updateSidebarDisplay: updateSidebarPomodoroDisplay, 
        handleViewChange,
        start: startPomodoroSession, pause: pausePomodoroSession, stop: stopPomodoroSession,
        skip: skipCurrentSession, reset: resetCurrentSession,
        getCurrentState: () => ({ isActive: _isActive, state: _currentState, timeRemaining: _timeRemaining, taskId: _currentTaskId })
    };
})();
