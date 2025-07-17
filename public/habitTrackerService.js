import AppStore from './store.js';
import LoggingService from './loggingService.js';

const HabitTrackerService = {
    /**
     * Creates a new habit object and saves it to the store.
     * @param {object} habitData - Contains name, description, and frequency.
     * @returns {object} The newly created habit.
     */
    async createHabit({ name, description, frequency }) {
        const newHabit = {
            id: Date.now(), // Simple unique ID for now
            name,
            description,
            frequency,
            createdAt: Date.now()
        };

        const currentHabits = AppStore.getHabits();
        const updatedHabits = [...currentHabits, newHabit];
        
        await AppStore.setHabits(updatedHabits, 'HabitTrackerService.createHabit');
        LoggingService.info(`[HabitService] Created new habit: ${name}`, { habit: newHabit });
        
        return newHabit;
    },

    /**
     * Updates an existing habit's properties.
     * @param {object} habitData - The complete habit object with updated fields.
     */
    async updateHabit(habitData) {
        const currentHabits = AppStore.getHabits();
        const habitIndex = currentHabits.findIndex(h => h.id === habitData.id);

        if (habitIndex > -1) {
            currentHabits[habitIndex] = habitData;
            await AppStore.setHabits(currentHabits, 'HabitTrackerService.updateHabit');
            LoggingService.info(`[HabitService] Updated habit: ${habitData.name}`, { habit: habitData });
        } else {
            LoggingService.error(`[HabitService] Could not find habit to update with ID: ${habitData.id}`);
        }
    },

    /**
     * Deletes a habit and all its associated completions.
     * @param {number} habitId - The ID of the habit to delete.
     */
    async deleteHabit(habitId) {
        let currentHabits = AppStore.getHabits();
        let currentCompletions = AppStore.getHabitCompletions();

        const updatedHabits = currentHabits.filter(h => h.id !== habitId);
        const updatedCompletions = currentCompletions.filter(c => c.habit_id !== habitId);

        // We need to update both lists. AppStore.setHabits will save everything.
        await AppStore.setHabits(updatedHabits, 'HabitTrackerService.deleteHabit');
        await AppStore.setHabitCompletions(updatedCompletions, 'HabitTrackerService.deleteHabit');

        LoggingService.info(`[HabitService] Deleted habit with ID: ${habitId}`);
    },

    /**
     * Toggles a habit's completion status for a specific date.
     * @param {number} habitId - The ID of the habit.
     * @param {string} dateString - The date in 'YYYY-MM-DD' format.
     */
    async toggleCompletion(habitId, dateString) {
        const currentCompletions = AppStore.getHabitCompletions();
        
        // Find if a completion for this habit on this date already exists.
        const completionIndex = currentCompletions.findIndex(c => 
            c.habit_id === habitId && this.getYYYYMMDD(new Date(c.completedAt)) === dateString
        );

        if (completionIndex > -1) {
            // It exists, so remove it (un-check the box).
            currentCompletions.splice(completionIndex, 1);
        } else {
            // It doesn't exist, so add it (check the box).
            // We set the time to noon to avoid timezone issues.
            const completionDate = new Date(`${dateString}T12:00:00`);
            const newCompletion = {
                id: Date.now(),
                habit_id: habitId,
                completedAt: completionDate.getTime()
            };
            currentCompletions.push(newCompletion);
        }

        await AppStore.setHabitCompletions(currentCompletions, 'HabitTrackerService.toggleCompletion');
    },

    /**
     * A helper to get a date in YYYY-MM-DD format, ignoring timezones.
     * @param {Date} date - The date object.
     * @returns {string} The formatted date string.
     */
    getYYYYMMDD(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
};

export default HabitTrackerService;