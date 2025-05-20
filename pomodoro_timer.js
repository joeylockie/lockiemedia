// pomodoro_timer.js
// Manages the Pomodoro Timer Hybrid feature, including its state, logic, and UI rendering for its dedicated page.
// Now an ES6 module.

import { isFeatureEnabled } from './featureFlagService.js';
import AppStore from './store.js';
import ViewManager from './viewManager.js';
import EventBus from './eventBus.js';
import { formatMillisecondsToHMS } from './utils.js'; // Assuming formatDuration is not used here, but formatMillisecondsToHMS is.

// DOM Element References (populated in initialize or renderPomodoroPage)
let pomodoroPageContainer;
let timerDisplayOnPage;
let pomodoroStateDisplayOnPage;
let startPauseButtonOnPage;
let stopButtonOnPage;
let resetButtonOnPage;
let skipButtonOnPage;
let pomodoroTaskSelectOnPage;

// Sidebar display elements (references obtained in updateSidebarPomodoroDisplay)
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

// showMessage is currently a global function from ui_rendering.js.
// It will be properly imported when ui_rendering.js becomes a module.

function _publishStateUpdate() {
    if (EventBus && typeof EventBus.publish === 'function') {
        EventBus.publish('pomodoroStateUpdated', {
            isActive: _isActive,
            state: _currentState,
            timeRemaining: _timeRemaining,
            currentTaskId: _currentTaskId,
            sessionsCompleted: _sessionsCompleted
        });
    }
}

function formatPomodoroDisplayTime(totalSeconds) { // Renamed to avoid conflict with utils.formatTime
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateDisplayOnPage() {
    if (!ViewManager || ViewManager.getCurrentTaskViewMode() !== 'pomodoro') return;

    if (timerDisplayOnPage) timerDisplayOnPage.textContent = formatPomodoroDisplayTime(_timeRemaining);
    if (pomodoroStateDisplayOnPage) {
        let stateText = _currentState.charAt(0).toUpperCase() + _currentState.slice(1);
        if (stateText.includes('Break')) stateText = stateText.replace('Break', ' Break');
        pomodoroStateDisplayOnPage.textContent = stateText;
    }
    if (startPauseButtonOnPage) {
        startPauseButtonOnPage.textContent = _isActive && _currentTimerInterval ? 'Pause' : 'Start';
    }
}

function updateSidebarDisplay() {
    if (!sidebarPomodoroDisplayEl) sidebarPomodoroDisplayEl = document.getElementById('sidebarPomodoroTimerDisplay');
    if (!sidebarPomodoroStateTextEl) sidebarPomodoroStateTextEl = document.getElementById('sidebarPomodoroState');
    if (!sidebarPomodoroTimeTextEl) sidebarPomodoroTimeTextEl = document.getElementById('sidebarPomodoroTime');
    if (!sidebarPomodoroTaskTextEl) sidebarPomodoroTaskTextEl = document.getElementById('sidebarPomodoroTask');

    if (!sidebarPomodoroDisplayEl || !isFeatureEnabled || !ViewManager || !AppStore) {
        if(sidebarPomodoroDisplayEl) sidebarPomodoroDisplayEl.classList.add('hidden');
        return;
    }

    const isSidebarMaximized = !document.getElementById('taskSidebar')?.classList.contains('sidebar-minimized');

    if (isFeatureEnabled('pomodoroTimerHybridFeature') && _isActive && isSidebarMaximized && ViewManager.getCurrentTaskViewMode() !== 'pomodoro') {
        sidebarPomodoroDisplayEl.classList.remove('hidden');
        if (sidebarPomodoroStateTextEl) {
             let stateText = _currentState.charAt(0).toUpperCase() + _currentState.slice(1);
             if (stateText.includes('Break')) stateText = stateText.replace('Break', ' Break');
             sidebarPomodoroStateTextEl.textContent = stateText;
        }
        if (sidebarPomodoroTimeTextEl) sidebarPomodoroTimeTextEl.textContent = formatPomodoroDisplayTime(_timeRemaining);
        if (sidebarPomodoroTaskTextEl) {
            const linkedTask = _currentTaskId ? AppStore.getTasks().find(t => t.id === _currentTaskId) : null;
            sidebarPomodoroTaskTextEl.textContent = linkedTask ? `Task: ${linkedTask.text.substring(0, 25)}${linkedTask.text.length > 25 ? '...' : ''}` : 'No task linked';
        }
    } else {
        sidebarPomodoroDisplayEl.classList.add('hidden');
    }
}

function startSession() {
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

function pauseSession() {
    clearInterval(_currentTimerInterval);
    _currentTimerInterval = null;
    // _isActive should remain true if paused, to distinguish from stopped.
    // Let's adjust this: _isActive reflects if the timer *should* be running if not paused.
    // A new variable like _isPaused might be better, or just check _currentTimerInterval === null while _isActive is true.
    // For simplicity, let's say pausing means _isActive becomes false for the interval, but state is preserved.
    // No, _isActive should reflect the conceptual state. If paused, it's still an "active" (but paused) pomodoro.
    // The key is _currentTimerInterval.
    console.log("[Pomodoro] Session paused.");
    _publishStateUpdate(); // Reflect that interval is cleared but state is same
}

function stopSession() {
    clearInterval(_currentTimerInterval);
    _currentTimerInterval = null;
    _isActive = false;
    _currentState = 'work';
    _timeRemaining = SETTINGS.workDuration;
    _currentTaskId = null; 
    _sessionsCompleted = 0;
    if (pomodoroTaskSelectOnPage) pomodoroTaskSelectOnPage.value = ""; // Reset dropdown
    updateDisplayOnPage();
    _publishStateUpdate(); 
    console.log("[Pomodoro] Session stopped and reset.");
}

function resetCurrent() {
    clearInterval(_currentTimerInterval);
    _currentTimerInterval = null;
    // _isActive remains conceptually true if it was, user just resets the current phase time
    switch (_currentState) {
        case 'work': _timeRemaining = SETTINGS.workDuration; break;
        case 'shortBreak': _timeRemaining = SETTINGS.shortBreakDuration; break;
        case 'longBreak': _timeRemaining = SETTINGS.longBreakDuration; break;
        default: _timeRemaining = SETTINGS.workDuration;
    }
    updateDisplayOnPage();
    _publishStateUpdate();
    console.log(`[Pomodoro] Current session (${_currentState}) reset.`);
    // If it was paused, user might want to press start again.
    if (startPauseButtonOnPage) startPauseButtonOnPage.textContent = 'Start';
}

function handleSessionEnd() {
    let endedSessionType = _currentState.charAt(0).toUpperCase() + _currentState.slice(1).replace('B', ' B');
    if(typeof window.showMessage === 'function') window.showMessage(`Pomodoro: ${endedSessionType} session ended!`, 'info');
    console.log(`[Pomodoro] Session ended: ${_currentState}`);

    if (_currentState === 'work') {
        _sessionsCompleted++;
        if (_currentTaskId) {
            console.log(`[Pomodoro] Work session for task ID ${_currentTaskId} completed.`);
            // Future: Mark task as having one pomodoro session completed, or log time.
        }
        if (_sessionsCompleted % SETTINGS.sessionsBeforeLongBreak === 0) {
            _currentState = 'longBreak';
            _timeRemaining = SETTINGS.longBreakDuration;
        } else {
            _currentState = 'shortBreak';
            _timeRemaining = SETTINGS.shortBreakDuration;
        }
    } else { // Was a break
        _currentState = 'work';
        _timeRemaining = SETTINGS.workDuration;
    }
    _currentTaskId = null; 
    if (pomodoroTaskSelectOnPage) pomodoroTaskSelectOnPage.value = "";
    
    _isActive = false; // Session ended, timer is not active until started again
    if (_currentTimerInterval) clearInterval(_currentTimerInterval);
    _currentTimerInterval = null;

    updateDisplayOnPage();
    _publishStateUpdate();
    // Future: Option to auto-start next session or wait for user input.
    if (startPauseButtonOnPage) startPauseButtonOnPage.textContent = 'Start';
}

function skipSession() {
    clearInterval(_currentTimerInterval);
    _currentTimerInterval = null;
    _isActive = false; // Mark as inactive before handling end
    handleSessionEnd(); // This will transition to the next state
    console.log("[Pomodoro] Current session skipped.");
}

function renderPage() {
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

    if (startPauseButtonOnPage) startPauseButtonOnPage.addEventListener('click', () => { if (_isActive && _currentTimerInterval) { pauseSession(); } else { if (_timeRemaining === 0 && !_isActive) { handleSessionEnd(); /* Auto-transition if timer was at 0 and not active */ } startSession(); }});
    if (stopButtonOnPage) stopButtonOnPage.addEventListener('click', stopSession);
    if (resetButtonOnPage) resetButtonOnPage.addEventListener('click', resetCurrent);
    if (skipButtonOnPage) skipButtonOnPage.addEventListener('click', skipSession);
    if (pomodoroTaskSelectOnPage) { populatePomodoroTaskSelector(); pomodoroTaskSelectOnPage.addEventListener('change', (e) => { _currentTaskId = e.target.value ? parseInt(e.target.value) : null; console.log("[Pomodoro] Task linked: ", _currentTaskId); _publishStateUpdate(); }); }
    
    updateDisplayOnPage();
    console.log("[Pomodoro] Page rendered and event listeners attached.");
}

function populatePomodoroTaskSelector() {
    if (!pomodoroTaskSelectOnPage || !AppStore || typeof AppStore.getTasks !== 'function') return;
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

function initializeFeature() {
    console.log('[Pomodoro] Initializing Pomodoro Timer Hybrid Feature...');
    pomodoroPageContainer = document.getElementById('pomodoroTimerPageContainer');
    
    // Initialize internal state
    _isActive = false;
    _currentState = 'work';
    _timeRemaining = SETTINGS.workDuration;
    _currentTaskId = null;
    _sessionsCompleted = 0;
    
    _publishStateUpdate(); 
    console.log('[Pomodoro] Feature Initialized with state:', { _isActive, _currentState, _timeRemaining });
}

function updateVisibility() {
    if (!isFeatureEnabled || !ViewManager) { console.error("[Pomodoro] Core services not available for UI visibility update."); return; }
    const isActuallyEnabled = isFeatureEnabled('pomodoroTimerHybridFeature');
    const elements = document.querySelectorAll('.pomodoro-timer-hybrid-feature-element');
    elements.forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));
    if (!isActuallyEnabled) {
        if (ViewManager.getCurrentTaskViewMode() === 'pomodoro') { ViewManager.setTaskViewMode('list'); }
        if (_isActive) stopSession(); 
        if(sidebarPomodoroDisplayEl) sidebarPomodoroDisplayEl.classList.add('hidden');
    } else {
        updateSidebarDisplay();
    }
    console.log(`[Pomodoro] UI Visibility set to: ${isActuallyEnabled}`);
}

function handleViewChange(newViewMode) {
    if (newViewMode === 'pomodoro') {
        renderPage();
        if(sidebarPomodoroDisplayEl) sidebarPomodoroDisplayEl.classList.add('hidden');
    } else {
        if (pomodoroPageContainer) pomodoroPageContainer.classList.add('hidden');
        updateSidebarDisplay(); 
    }
}

export const PomodoroTimerHybridFeature = {
    initialize: initializeFeature, 
    updateUIVisibility: updateVisibility, 
    renderPomodoroPage: renderPage, 
    updateSidebarDisplay: updateSidebarDisplay, 
    handleViewChange,
    start: startSession, 
    pause: pauseSession, 
    stop: stopSession,
    skip: skipSession, 
    reset: resetCurrent,
    getCurrentState: () => ({ isActive: _isActive, state: _currentState, timeRemaining: _timeRemaining, taskId: _currentTaskId })
};

console.log("pomodoro_timer.js loaded as ES6 module.");
