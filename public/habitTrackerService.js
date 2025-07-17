import AppStore from './store.js';
import LoggingService from './loggingService.js';

const HabitTrackerService = {
    /**
     * Initializes the service.
     */
    initialize() {
        LoggingService.info('[HabitService] Initialized.', { module: 'HabitTrackerService' });
    },

    /**
     * Retrieves all habits from the central store.
     * @returns {Array} An array of habit objects.
     */
    getHabits() {
        return AppStore.getHabits();
    },

    /**
     * Retrieves all habit completions from the central store.
     * @returns {Array} An array of habit completion objects.
     */
    getHabitCompletions() {
        return AppStore.getHabitCompletions();
    },
    
    /**
     * Retrieves all completions for a specific year as an array.
     * @param {number} year - The four-digit year.
     * @returns {Array} An array of completion objects for that year.
     */
    getCompletionsForYear(year) {
        const completions = AppStore.getHabitCompletions();
        return completions.filter(c => new Date(c.completedAt).getFullYear() === year);
    },

    /**
     * Creates a new habit object and saves it to the store.
     * @param {object} habitData - Contains name, description.
     */
    async createHabit({ name, description }) {
        const newHabit = {
            id: Date.now(),
            name,
            description: description || 'Target: Everyday',
            createdAt: Date.now()
        };

        const currentHabits = AppStore.getHabits();
        const updatedHabits = [...currentHabits, newHabit];
        
        await AppStore.setHabits(updatedHabits, 'HabitTrackerService.createHabit');
        LoggingService.info(`[HabitService] Created new habit: ${name}`, { habit: newHabit });
    },

    /**
     * Updates an existing habit's properties.
     * @param {object} habitData - The complete habit object with updated fields.
     */
    async updateHabit(habitData) {
        const currentHabits = AppStore.getHabits();
        const habitIndex = currentHabits.findIndex(h => h.id === habitData.id);

        if (habitIndex > -1) {
            currentHabits[habitIndex].name = habitData.name;
            currentHabits[habitIndex].description = habitData.description;
            await AppStore.setHabits(currentHabits, 'HabitTrackerService.updateHabit');
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
        
        const completionIndex = currentCompletions.findIndex(c => 
            c.habit_id === habitId && this.getYYYYMMDD(new Date(c.completedAt)) === dateString
        );

        if (completionIndex > -1) {
            currentCompletions.splice(completionIndex, 1);
        } else {
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
     * A helper to get a date in YYYY-MM-DD format.
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