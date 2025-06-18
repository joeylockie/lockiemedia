// pomodoro_timer.js
// Manages the Pomodoro Timer Hybrid feature, including its state, logic, and UI rendering for its dedicated page.
// Now an ES6 module.

// import { isFeatureEnabled } from './featureFlagService.js'; // REMOVED
import AppStore from './store.js';
import ViewManager from './viewManager.js';
import EventBus from './eventBus.js'; // EventBus is already imported
import { formatMillisecondsToHMS } from './utils.js';
// MODIFIED: showMessage import removed
// import { showMessage } from './ui_rendering.js'; 

// NEW: Import LoggingService
import LoggingService from './loggingService.js';

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

function _publishStateUpdate() {
    const functionName = '_publishStateUpdate';
    LoggingService.debug('[PomodoroTimer] Publishing state update.', {
        functionName,
        isActive: _isActive,
        state: _currentState,
        timeRemaining: _timeRemaining,
        currentTaskId: _currentTaskId,
        sessionsCompleted: _sessionsCompleted
    });
    if (EventBus && typeof EventBus.publish === 'function') {
        EventBus.publish('pomodoroStateUpdated', {
            isActive: _isActive,
            state: _currentState,
            timeRemaining: _timeRemaining,
            currentTaskId: _currentTaskId,
            sessionsCompleted: _sessionsCompleted
        });
    } else {
        LoggingService.warn('[PomodoroTimer] EventBus not available for _publishStateUpdate.', { functionName });
    }
}

function formatPomodoroDisplayTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateDisplayOnPage() {
    const functionName = 'updateDisplayOnPage';
    if (!ViewManager || ViewManager.getCurrentTaskViewMode() !== 'pomodoro') {
        return;
    }
    LoggingService.debug('[PomodoroTimer] Updating display on Pomodoro page.', { functionName, timeRemaining: _timeRemaining, currentState: _currentState, isActive: _isActive });

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
    const functionName = 'updateSidebarDisplay';
    if (!sidebarPomodoroDisplayEl) sidebarPomodoroDisplayEl = document.getElementById('sidebarPomodoroTimerDisplay');
    if (!sidebarPomodoroStateTextEl) sidebarPomodoroStateTextEl = document.getElementById('sidebarPomodoroState');
    if (!sidebarPomodoroTimeTextEl) sidebarPomodoroTimeTextEl = document.getElementById('sidebarPomodoroTime');
    if (!sidebarPomodoroTaskTextEl) sidebarPomodoroTaskTextEl = document.getElementById('sidebarPomodoroTask');

    if (!sidebarPomodoroDisplayEl || typeof window.isFeatureEnabled !== 'function' || !ViewManager || !AppStore) { // MODIFIED to check window
        if(sidebarPomodoroDisplayEl) sidebarPomodoroDisplayEl.classList.add('hidden');
        LoggingService.debug('[PomodoroTimer] Skipping sidebar display update due to missing elements or disabled feature.', {
            functionName,
            sidebarDisplayElFound: !!sidebarPomodoroDisplayEl,
            featureEnabled: typeof window.isFeatureEnabled === 'function' ? window.isFeatureEnabled('pomodoroTimerHybridFeature') : 'unknown',
            viewManagerAvailable: !!ViewManager,
            appStoreAvailable: !!AppStore
        });
        return;
    }

    const isSidebarMaximized = !document.getElementById('taskSidebar')?.classList.contains('sidebar-minimized');

    if (window.isFeatureEnabled('pomodoroTimerHybridFeature') && _isActive && isSidebarMaximized && ViewManager.getCurrentTaskViewMode() !== 'pomodoro') { // MODIFIED to use window
        LoggingService.debug('[PomodoroTimer] Updating sidebar Pomodoro display.', { functionName, isActive: _isActive, currentState: _currentState, timeRemaining: _timeRemaining });
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
    const functionName = 'startSession';
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
    LoggingService.info(`[PomodoroTimer] Session started: ${_currentState}. Task ID: ${_currentTaskId || 'None'}`, { functionName, currentState: _currentState, currentTaskId: _currentTaskId, timeRemaining: _timeRemaining });
}

function pauseSession() {
    const functionName = 'pauseSession';
    clearInterval(_currentTimerInterval);
    _currentTimerInterval = null;
    LoggingService.info('[PomodoroTimer] Session paused.', { functionName, currentState: _currentState, timeRemaining: _timeRemaining });
    _publishStateUpdate();
    updateDisplayOnPage();
}

function stopSession() {
    const functionName = 'stopSession';
    clearInterval(_currentTimerInterval);
    _currentTimerInterval = null;
    _isActive = false;
    const previousState = _currentState;
    _currentState = 'work';
    _timeRemaining = SETTINGS.workDuration;
    _currentTaskId = null;
    _sessionsCompleted = 0;
    if (pomodoroTaskSelectOnPage) pomodoroTaskSelectOnPage.value = "";
    updateDisplayOnPage();
    _publishStateUpdate();
    LoggingService.info('[PomodoroTimer] Session stopped and reset.', { functionName, previousState });
}

function resetCurrent() {
    const functionName = 'resetCurrent';
    clearInterval(_currentTimerInterval);
    _currentTimerInterval = null;
    const oldTimeRemaining = _timeRemaining;
    switch (_currentState) {
        case 'work': _timeRemaining = SETTINGS.workDuration; break;
        case 'shortBreak': _timeRemaining = SETTINGS.shortBreakDuration; break;
        case 'longBreak': _timeRemaining = SETTINGS.longBreakDuration; break;
        default: _timeRemaining = SETTINGS.workDuration;
    }
    updateDisplayOnPage();
    _publishStateUpdate();
    LoggingService.info(`[PomodoroTimer] Current session (${_currentState}) reset.`, { functionName, currentState: _currentState, oldTimeRemaining, newTimeRemaining: _timeRemaining });
    if (startPauseButtonOnPage) startPauseButtonOnPage.textContent = 'Start';
}

function handleSessionEnd() {
    const functionName = 'handleSessionEnd';
    let endedSessionType = _currentState.charAt(0).toUpperCase() + _currentState.slice(1).replace('B', ' B');
    EventBus.publish('displayUserMessage', { text: `Pomodoro: ${endedSessionType} session ended!`, type: 'info' });
    LoggingService.info(`[PomodoroTimer] Session ended: ${_currentState}. Sessions completed: ${_sessionsCompleted + (_currentState === 'work' ? 1 : 0)}`, { functionName, endedState: _currentState, sessionsCompleted: _sessionsCompleted, currentTaskId: _currentTaskId });

    if (_currentState === 'work') {
        _sessionsCompleted++;
        if (_currentTaskId) {
            LoggingService.debug(`[PomodoroTimer] Work session for task ID ${_currentTaskId} completed.`, { functionName, currentTaskId: _currentTaskId });
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

    _isActive = false;
    if (_currentTimerInterval) clearInterval(_currentTimerInterval);
    _currentTimerInterval = null;

    updateDisplayOnPage();
    _publishStateUpdate();
    if (startPauseButtonOnPage) startPauseButtonOnPage.textContent = 'Start';
    LoggingService.info(`[PomodoroTimer] Transitioned to new state: ${_currentState}`, { functionName, newState: _currentState, newTime: _timeRemaining });
}

function skipSession() {
    const functionName = 'skipSession';
    clearInterval(_currentTimerInterval);
    _currentTimerInterval = null;
    _isActive = false;
    LoggingService.info(`[PomodoroTimer] Current session (${_currentState}) skipped by user.`, { functionName, skippedState: _currentState });
    handleSessionEnd();
}

function renderPage() {
    const functionName = 'renderPage';
    if (!pomodoroPageContainer) {
        LoggingService.warn("[PomodoroTimer] Page container not found for rendering.", { functionName, elementId: 'pomodoroTimerPageContainer' });
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

    if (startPauseButtonOnPage) startPauseButtonOnPage.addEventListener('click', () => { const actionFuncName = 'startPauseClickHandler'; LoggingService.debug(`[PomodoroTimer] Start/Pause button clicked. isActive: ${_isActive}, interval: ${!!_currentTimerInterval}`, {functionName: actionFuncName}); if (_isActive && _currentTimerInterval) { pauseSession(); } else { if (_timeRemaining === 0 && !_isActive) { handleSessionEnd(); } startSession(); }});
    if (stopButtonOnPage) stopButtonOnPage.addEventListener('click', stopSession);
    if (resetButtonOnPage) resetButtonOnPage.addEventListener('click', resetCurrent);
    if (skipButtonOnPage) skipButtonOnPage.addEventListener('click', skipSession);
    if (pomodoroTaskSelectOnPage) { populatePomodoroTaskSelector(); pomodoroTaskSelectOnPage.addEventListener('change', (e) => { _currentTaskId = e.target.value ? parseInt(e.target.value) : null; LoggingService.debug(`[PomodoroTimer] Task linked via select: ${_currentTaskId}`, {functionName: 'taskSelectChangeHandler', currentTaskId: _currentTaskId}); _publishStateUpdate(); }); }

    updateDisplayOnPage();
    LoggingService.info("[PomodoroTimer] Pomodoro Page rendered and event listeners attached.", { functionName });
}

function populatePomodoroTaskSelector() {
    const functionName = 'populatePomodoroTaskSelector';
    if (!pomodoroTaskSelectOnPage || !AppStore || typeof AppStore.getTasks !== 'function') {
        LoggingService.warn('[PomodoroTimer] Cannot populate task selector. Dependencies missing.', { functionName, pomodoroTaskSelectOnPageFound: !!pomodoroTaskSelectOnPage, appStoreAvailable: !!AppStore });
        return;
    }
    const currentTasks = AppStore.getTasks();
    pomodoroTaskSelectOnPage.innerHTML = '<option value="">-- Select a Task --</option>';
    currentTasks.filter(task => !task.completed).forEach(task => {
        const option = document.createElement('option');
        option.value = task.id;
        option.textContent = task.text;
        if (task.id === _currentTaskId) option.selected = true;
        pomodoroTaskSelectOnPage.appendChild(option);
    });
    LoggingService.debug(`[PomodoroTimer] Pomodoro task selector populated with ${currentTasks.filter(t=>!t.completed).length} tasks.`, { functionName });
}

function initializeFeature() {
    const functionName = 'initializeFeature (Pomodoro)';
    LoggingService.info('[PomodoroTimer] Initializing Pomodoro Timer Hybrid Feature...', { functionName });
    pomodoroPageContainer = document.getElementById('pomodoroTimerPageContainer');

    _isActive = false;
    _currentState = 'work';
    _timeRemaining = SETTINGS.workDuration;
    _currentTaskId = null;
    _sessionsCompleted = 0;

    _publishStateUpdate();
    LoggingService.info('[PomodoroTimer] Feature Initialized.', { functionName, initialState: { isActive: _isActive, currentState: _currentState, timeRemaining: _timeRemaining }});
}

function updateVisibility() {
    const functionName = 'updateVisibility (Pomodoro)';
    if (!window.isFeatureEnabled || !ViewManager) { // MODIFIED to check window
        LoggingService.error("[PomodoroTimer] Core services not available for UI visibility update.", new Error("CoreServicesMissing"), { functionName, isFeatureEnabledAvailable: !!window.isFeatureEnabled, viewManagerAvailable: !!ViewManager });
        return;
    }
    const isActuallyEnabled = window.isFeatureEnabled('pomodoroTimerHybridFeature'); // MODIFIED to use window
    const elements = document.querySelectorAll('.pomodoro-timer-hybrid-feature-element');
    elements.forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));
    if (!isActuallyEnabled) {
        if (ViewManager.getCurrentTaskViewMode() === 'pomodoro') { ViewManager.setTaskViewMode('list'); }
        if (_isActive) stopSession();
        if(sidebarPomodoroDisplayEl) sidebarPomodoroDisplayEl.classList.add('hidden');
    } else {
        updateSidebarDisplay();
    }
    LoggingService.info(`[PomodoroTimer] UI Visibility set to: ${isActuallyEnabled}`, { functionName, isEnabled: isActuallyEnabled });
}

function handleViewChange(newViewMode) {
    const functionName = 'handleViewChange (Pomodoro)';
    LoggingService.debug(`[PomodoroTimer] View change handled. New mode: ${newViewMode}`, { functionName, newViewMode });
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

// REMOVED: LoggingService.debug("pomodoro_timer.js loaded as ES6 module.", { module: 'pomodoro_timer' });
// console.log("pomodoro_timer.js module parsed and PomodoroTimerHybridFeature object is now defined."); // Optional