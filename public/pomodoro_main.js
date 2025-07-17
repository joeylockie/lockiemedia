import PomodoroService from './pomodoroService.js';
import LoggingService from './loggingService.js';

class PomodoroMain {
    constructor() {
        // DOM Elements
        this.timerDisplay = document.getElementById('timer-display');
        this.startPauseButton = document.getElementById('start-pause-button');
        this.resetButton = document.getElementById('reset-button');
        this.workBtn = document.getElementById('work-btn');
        this.shortBreakBtn = document.getElementById('short-break-btn');
        this.longBreakBtn = document.getElementById('long-break-btn');
        this.sessionInfo = document.getElementById('session-count');
        this.container = document.getElementById('pomodoro-container');

        // Audio for notification
        this.alarmSound = new Audio('/sounds/notification.mp3'); // Ensure you have this sound file

        this.initialize();
    }

    initialize() {
        this.bindEventListeners();
        PomodoroService.initialize({
            onUpdate: (timeLeft) => this.updateTimerDisplay(timeLeft),
            onEnd: () => this.handleTimerEnd(),
            onSessionChange: (sessionType, sessionCount) => this.updateSessionUI(sessionType, sessionCount),
        });
        this.updateSessionUI('work', 0); // Set initial UI state
        LoggingService.info('[PomodoroMain] Initialized.');
    }

    bindEventListeners() {
        this.startPauseButton.addEventListener('click', () => this.toggleTimer());
        this.resetButton.addEventListener('click', () => PomodoroService.resetTimer());

        this.workBtn.addEventListener('click', () => PomodoroService.switchSession('work'));
        this.shortBreakBtn.addEventListener('click', () => PomodoroService.switchSession('short_break'));
        this.longBreakBtn.addEventListener('click', () => PomodoroService.switchSession('long_break'));
    }

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
        this.timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        document.title = `${this.timerDisplay.textContent} - Pomodoro`;
    }

    handleTimerEnd() {
        this.startPauseButton.textContent = 'START';
        this.alarmSound.play();
    }

    updateSessionUI(sessionType, sessionCount) {
        // Update active tab
        document.querySelectorAll('.pomodoro-tab').forEach(tab => tab.classList.remove('active'));
        document.getElementById(`${sessionType.replace('_', '-')}-btn`).classList.add('active');

        // Update background color
        this.container.classList.remove('bg-red-900', 'bg-blue-900');
        if (sessionType === 'work') {
            this.container.classList.add('bg-slate-800');
        } else {
            this.container.classList.add('bg-blue-900');
        }

        // Update session count display
        this.sessionInfo.textContent = `Session ${sessionCount + 1} of ${PomodoroService.settings.longBreakInterval}`;
    }
}

// Ensure the DOM is fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('pomodoro-container')) {
        new PomodoroMain();
    }
});