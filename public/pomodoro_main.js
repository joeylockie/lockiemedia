import PomodoroService from './pomodoroService.js';
import LoggingService from './loggingService.js';

class PomodoroMain {
    constructor() {
        // Main Timer Elements
        this.timerDisplay = document.getElementById('timer-display');
        this.startPauseButton = document.getElementById('start-pause-button');
        this.resetButton = document.getElementById('reset-button');
        this.workBtn = document.getElementById('work-btn');
        this.shortBreakBtn = document.getElementById('short-break-btn');
        this.longBreakBtn = document.getElementById('long-break-btn');
        this.sessionInfo = document.getElementById('session-count');
        this.container = document.getElementById('pomodoro-container');

        // Settings Modal Elements
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsModal = document.getElementById('pomodoro-settings-modal');
        this.settingsForm = document.getElementById('pomodoro-settings-form');
        this.settingsCloseBtn = this.settingsModal.querySelector('.close-button');
        this.workMinutesInput = document.getElementById('work-minutes');
        this.shortBreakMinutesInput = document.getElementById('short-break-minutes');
        this.longBreakMinutesInput = document.getElementById('long-break-minutes');
        this.longBreakIntervalInput = document.getElementById('long-break-interval');
        
        this.alarmSound = new Audio(); // Sound is disabled as requested

        this.initialize();
    }

    initialize() {
        this.bindEventListeners();
        PomodoroService.initialize({
            onUpdate: (timeLeft) => this.updateTimerDisplay(timeLeft),
            onEnd: () => this.handleTimerEnd(),
            onSessionChange: (sessionType, sessionCount) => this.updateSessionUI(sessionType, sessionCount),
        });
        this.updateSessionUI('work', 0);
        LoggingService.info('[PomodoroMain] Initialized.');
    }

    bindEventListeners() {
        this.startPauseButton.addEventListener('click', () => this.toggleTimer());
        this.resetButton.addEventListener('click', () => PomodoroService.resetTimer());
        this.workBtn.addEventListener('click', () => PomodoroService.switchSession('work'));
        this.shortBreakBtn.addEventListener('click', () => PomodoroService.switchSession('short_break'));
        this.longBreakBtn.addEventListener('click', () => PomodoroService.switchSession('long_break'));

        // Settings Modal Listeners
        this.settingsBtn.addEventListener('click', () => this.openSettingsModal());
        this.settingsCloseBtn.addEventListener('click', () => this.closeSettingsModal());
        this.settingsForm.addEventListener('submit', (e) => this.handleSettingsSave(e));
    }
    
    // --- Main Timer Logic ---

    toggleTimer() {
        if (PomodoroService.isRunning) {
            PomodoroService.pause();
            this.startPauseButton.textContent = 'START';
        } else {
            PomodoroService.start();
            this.startPauseButton.textContent = 'PAUSE';
        }
    }

    updateTimerDisplay(timeLeft) {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        this.timerDisplay.textContent = timeString;
        document.title = `${timeString} - Pomodoro`;
    }

    handleTimerEnd() {
        this.startPauseButton.textContent = 'START';
        // Sound is disabled. Desktop notifications will be added next.
    }

    updateSessionUI(sessionType, sessionCount) {
        document.querySelectorAll('.pomodoro-tab').forEach(tab => tab.classList.remove('active'));
        document.getElementById(`${sessionType.replace('_', '-')}-btn`).classList.add('active');
        this.container.classList.remove('bg-red-900', 'bg-blue-900', 'bg-slate-800');
        if (sessionType === 'work') {
            this.container.classList.add('bg-slate-800');
        } else {
            this.container.classList.add('bg-blue-900');
        }
        this.sessionInfo.textContent = `Session ${sessionCount + 1} of ${PomodoroService.settings.longBreakInterval}`;
    }

    // --- Settings Modal Logic ---

    openSettingsModal() {
        // Populate the form with the current settings from the service
        this.workMinutesInput.value = PomodoroService.settings.workMinutes;
        this.shortBreakMinutesInput.value = PomodoroService.settings.shortBreakMinutes;
        this.longBreakMinutesInput.value = PomodoroService.settings.longBreakMinutes;
        this.longBreakIntervalInput.value = PomodoroService.settings.longBreakInterval;
        this.settingsModal.style.display = 'flex';
    }

    closeSettingsModal() {
        this.settingsModal.style.display = 'none';
    }

    handleSettingsSave(event) {
        event.preventDefault();
        const newSettings = {
            workMinutes: this.workMinutesInput.value,
            shortBreakMinutes: this.shortBreakMinutesInput.value,
            longBreakMinutes: this.longBreakMinutesInput.value,
            longBreakInterval: this.longBreakIntervalInput.value,
        };
        PomodoroService.saveSettings(newSettings);
        this.closeSettingsModal();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('pomodoro-container')) {
        new PomodoroMain();
    }
});