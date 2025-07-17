import AppStore from './store.js';
import LoggingService from './loggingService.js';

const PomodoroService = {
    // --- State Variables ---
    timerInterval: null,
    timeLeft: 25 * 60, // Time in seconds
    isRunning: false,
    currentSession: 'work', // 'work', 'short_break', 'long_break'
    sessionCount: 0, // Number of work sessions completed

    // --- Configuration ---
    settings: {
        workMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        longBreakInterval: 4, // A long break occurs after this many work sessions
    },

    // --- Callbacks for UI updates ---
    onUpdate: () => {},
    onEnd: () => {},
    onSessionChange: () => {},

    /**
     * Initializes the service with default values.
     * @param {object} callbacks - Functions to call for UI updates.
     */
    initialize(callbacks) {
        this.onUpdate = callbacks.onUpdate;
        this.onEnd = callbacks.onEnd;
        this.onSessionChange = callbacks.onSessionChange;
        this.resetTimer();
        LoggingService.info('[PomodoroService] Initialized.');
    },

    /**
     * Starts or resumes the timer.
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        // The interval function runs every second
        this.timerInterval = setInterval(() => this._countdown(), 1000);
    },

    /**
     * Pauses the timer.
     */
    pause() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
    },

    /**
     * The main countdown logic, called every second.
     * @private
     */
    _countdown() {
        this.timeLeft--;
        this.onUpdate(this.timeLeft); // Update the UI

        if (this.timeLeft < 0) {
            this.pause();
            this.onEnd(); // Notify UI that timer ended
            this.saveCurrentSession();
            this.switchToNextSession();
        }
    },

    /**
     * Resets the timer to the current session's default time.
     */
    resetTimer() {
        this.pause();
        let newTime;
        switch (this.currentSession) {
            case 'short_break':
                newTime = this.settings.shortBreakMinutes;
                break;
            case 'long_break':
                newTime = this.settings.longBreakMinutes;
                break;
            case 'work':
            default:
                newTime = this.settings.workMinutes;
                break;
        }
        this.timeLeft = newTime * 60;
        this.onUpdate(this.timeLeft); // Update UI with the new reset time
    },

    /**
     * Switches to the next logical session (e.g., from work to break).
     */
    switchToNextSession() {
        if (this.currentSession === 'work') {
            this.sessionCount++;
            if (this.sessionCount % this.settings.longBreakInterval === 0) {
                this.switchSession('long_break');
            } else {
                this.switchSession('short_break');
            }
        } else {
            // After any break, we go back to work
            this.switchSession('work');
        }
    },

    /**
     * Switches the timer to a specific session type.
     * @param {string} sessionType - 'work', 'short_break', or 'long_break'
     */
    switchSession(sessionType) {
        this.currentSession = sessionType;
        this.resetTimer();
        this.onSessionChange(this.currentSession, this.sessionCount); // Notify UI of the change
    },

    /**
     * Saves the completed session to the AppStore.
     */
    async saveCurrentSession() {
        const sessionDuration = this.settings[this.currentSession + 'Minutes'];
        const newSession = {
            id: Date.now(),
            startTime: Date.now() - (sessionDuration * 60 * 1000),
            endTime: Date.now(),
            duration: sessionDuration,
            type: this.currentSession,
            status: 'completed',
            createdAt: Date.now(),
        };

        const currentSessions = AppStore.getPomodoroSessions ? AppStore.getPomodoroSessions() : [];
        const updatedSessions = [...currentSessions, newSession];

        if (AppStore.setPomodoroSessions) {
            await AppStore.setPomodoroSessions(updatedSessions, 'PomodoroService.saveSession');
            LoggingService.info(`[PomodoroService] Saved session: ${this.currentSession}`);
        }
    },
};

export default PomodoroService;