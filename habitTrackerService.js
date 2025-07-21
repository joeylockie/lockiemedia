import AppStore from './store.js';
import LoggingService from './loggingService.js';

const HabitTrackerService = {
    /**
     * Converts a Date object to a 'YYYY-MM-DD' string.
     * @param {Date} date - The date to format.
     * @returns {string} The formatted date string.
     */
    getYYYYMMDD(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * Creates a new habit and saves it to the AppStore.
     * @param {{name: string, description: string, target_count: number}} habitDetails - The details of the new habit.
     */
    createHabit({ name, description, target_count }) {
        try {
            const newHabit = {
                id: Date.now(), // Generate a unique ID using the current timestamp.
                name,
                description,
                target_count,
                created_at: new Date().toISOString()
            };
            const currentHabits = AppStore.getHabits();
            currentHabits.push(newHabit);
            AppStore.setHabits(currentHabits, 'HabitTrackerService.createHabit');
            LoggingService.info('[HabitService] New habit created locally.', { newHabit });
        } catch (error) {
            LoggingService.error('[HabitService] Error creating habit:', error);
        }
    },

    /**
     * Updates an existing habit in the AppStore.
     * @param {{id: number, name: string, description: string, target_count: number}} habitData - The habit data to update.
     */
    updateHabit(habitData) {
        try {
            let currentHabits = AppStore.getHabits();
            const habitIndex = currentHabits.findIndex(h => h.id === habitData.id);

            if (habitIndex === -1) {
                throw new Error(`Habit with ID ${habitData.id} not found.`);
            }

            currentHabits[habitIndex] = { ...currentHabits[habitIndex], ...habitData };
            AppStore.setHabits(currentHabits, 'HabitTrackerService.updateHabit');
            LoggingService.info(`[HabitService] Habit with ID ${habitData.id} updated locally.`);
        } catch (error) {
            LoggingService.error(`[HabitService] Could not update habit with ID: ${habitData.id}`, error);
        }
    },

    /**
     * Deletes a habit and all its completions from the AppStore.
     * @param {number} habitId - The ID of the habit to delete.
     */
    deleteHabit(habitId) {
        try {
            // Remove the habit
            let currentHabits = AppStore.getHabits();
            const updatedHabits = currentHabits.filter(h => h.id !== habitId);
            AppStore.setHabits(updatedHabits, 'HabitTrackerService.deleteHabit');

            // Remove its associated completions
            let currentCompletions = AppStore.getHabitCompletions();
            const updatedCompletions = currentCompletions.filter(c => c.habit_id !== habitId);
            AppStore.setHabitCompletions(updatedCompletions, 'HabitTrackerService.deleteHabit');

            LoggingService.info(`[HabitService] Habit with ID ${habitId} and its completions deleted locally.`);
        } catch (error) {
            LoggingService.error(`[HabitService] Error deleting habit with ID: ${habitId}`, error);
        }
    },

    /**
     * Logs a completion for a habit on a specific date.
     * Updates existing completion or creates a new one.
     * @param {number} habitId - The ID of the habit.
     * @param {string} dateString - The 'YYYY-MM-DD' date of the completion.
     * @param {number} count - The completion count.
     */
    logCompletion(habitId, dateString, count) {
        try {
            let completions = AppStore.getHabitCompletions();
            const existingCompletionIndex = completions.findIndex(c => c.habit_id === habitId && c.completedAt === dateString);

            if (existingCompletionIndex > -1) {
                // Update existing completion
                completions[existingCompletionIndex].completion_count = count;
            } else {
                // Create a new completion log
                const newCompletion = {
                    id: Date.now(), // Unique ID for the completion entry
                    habit_id: habitId,
                    completedAt: dateString,
                    completion_count: count
                };
                completions.push(newCompletion);
            }
            AppStore.setHabitCompletions(completions, 'HabitTrackerService.logCompletion');
            LoggingService.info(`[HabitService] Logged completion for habit ID ${habitId} on ${dateString}.`);
        } catch (error) {
            LoggingService.error(`[HabitService] Error logging completion for habit ID ${habitId} on ${dateString}`, error);
        }
    }
};

export default HabitTrackerService;