// habitTrackerService.js
// Manages all logic for the habit tracker feature.

import LoggingService from './loggingService.js';

const HABITS_KEY = 'habitTracker_habits_v1';
const COMPLETIONS_KEY = 'habitTracker_completions_v1';

// --- Internal State ---
let _habits = [];
let _completions = []; // Array of { habitId: '...', date: 'YYYY-MM-DD' }

// --- Private Helper Functions ---

function _loadData() {
    try {
        const storedHabits = localStorage.getItem(HABITS_KEY);
        _habits = storedHabits ? JSON.parse(storedHabits) : [
            // Default habits
            { id: 'habit_1', name: 'Drink Water', description: 'Target: 8 cups per day', icon: 'fas fa-tint', color: 'blue-400' },
            { id: 'habit_2', name: 'Wake Up Early', description: 'Target: Everyday', icon: 'fas fa-sun', color: 'yellow-400' },
            { id: 'habit_3', name: 'Read', description: 'Target: 200 pages per week', icon: 'fas fa-book-open', color: 'pink-400' },
            { id: 'habit_4', name: 'Steps', description: 'Target: 10,000 steps per day', icon: 'fas fa-shoe-prints', color: 'green-400' },
        ];

        const storedCompletions = localStorage.getItem(COMPLETIONS_KEY);
        _completions = storedCompletions ? JSON.parse(storedCompletions) : [];

    } catch (error) {
        LoggingService.error('[HabitTrackerService] Error loading data from localStorage.', error);
        _habits = [];
        _completions = [];
    }
}

function _saveHabits() {
    try {
        localStorage.setItem(HABITS_KEY, JSON.stringify(_habits));
    } catch (error) {
        LoggingService.error('[HabitTrackerService] Error saving habits to localStorage.', error);
    }
}

function _saveCompletions() {
    try {
        localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(_completions));
    } catch (error) {
        LoggingService.error('[HabitTrackerService] Error saving completions to localStorage.', error);
    }
}

// --- Public API ---

/**
 * Gets all defined habits.
 * @returns {Array<Object>}
 */
function getHabits() {
    return [..._habits];
}

/**
 * Gets all completion records for a given year.
 * @param {number} year The year to filter completions for.
 * @returns {Array<Object>}
 */
function getCompletionsForYear(year) {
    return _completions.filter(c => c.date.startsWith(year.toString()));
}


/**
 * Adds or removes a completion record for a specific habit on a specific date.
 * @param {string} habitId The ID of the habit.
 * @param {string} dateString The date in 'YYYY-MM-DD' format.
 */
function toggleCompletion(habitId, dateString) {
    const completionIndex = _completions.findIndex(c => c.habitId === habitId && c.date === dateString);

    if (completionIndex > -1) {
        // Completion exists, so remove it
        _completions.splice(completionIndex, 1);
        LoggingService.debug(`[HabitTrackerService] Removed completion for habit ${habitId} on ${dateString}`);
    } else {
        // Completion doesn't exist, so add it
        _completions.push({ habitId, date: dateString });
        LoggingService.debug(`[HabitTrackerService] Added completion for habit ${habitId} on ${dateString}`);
    }
    _saveCompletions();
}

/**
 * Creates a new habit.
 * @param {Object} habitData - Object containing name, description, icon, color.
 * @returns {Object} The new habit object.
 */
function addHabit({ name, description, icon, color }) {
    if (!name || !name.trim()) return null;

    const newHabit = {
        id: `habit_${Date.now()}`,
        name: name.trim(),
        description: description || '',
        icon: icon || 'fas fa-check-circle',
        color: color || 'gray-400',
        createdAt: new Date().toISOString()
    };
    _habits.push(newHabit);
    _saveHabits();
    LoggingService.info(`[HabitTrackerService] Added new habit: ${name}`);
    return newHabit;
}


function initialize() {
    const functionName = 'initialize (HabitTrackerService)';
    LoggingService.info('[HabitTrackerService] Initializing...', { functionName });
    _loadData();
    LoggingService.info('[HabitTrackerService] Initialized and data loaded.', {
        functionName,
        habitCount: _habits.length,
        completionCount: _completions.length
    });
}

const HabitTrackerService = {
    initialize,
    getHabits,
    getCompletionsForYear,
    toggleCompletion,
    addHabit
};

export default HabitTrackerService;