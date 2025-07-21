import AppStore from './store.js';
import LoggingService from './loggingService.js';
import db from './database.js'; // Import the database connection

const HabitTrackerService = {
    /**
     * Converts a Date object to a 'YYYY-MM-DD' string.
     */
    getYYYYMMDD(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * Creates a new habit and saves it to the database.
     */
    async createHabit({ name, description, target_count }) {
        const functionName = 'createHabit (HabitTrackerService)';
        try {
            const newHabit = {
                name,
                description,
                target_count,
                created_at: new Date().toISOString()
            };
            await db.habits.add(newHabit);
            LoggingService.info('[HabitService] New habit added to DB.', { newHabit });

            // Refresh the store to update UI
            const allHabits = await db.habits.toArray();
            await AppStore.setHabits(allHabits);

        } catch (error) {
            LoggingService.error('[HabitService] Error creating habit:', error, { functionName });
        }
    },

    /**
     * Updates an existing habit in the database.
     */
    async updateHabit(habitData) {
        const functionName = 'updateHabit (HabitTrackerService)';
        try {
            // Dexie's 'update' method finds the item by its primary key (id)
            // and applies the changes.
            await db.habits.update(habitData.id, habitData);
            LoggingService.info(`[HabitService] Habit with ID ${habitData.id} updated in DB.`);

            // Refresh the store to update UI
            const allHabits = await db.habits.toArray();
            await AppStore.setHabits(allHabits);

        } catch (error) {
            LoggingService.error(`[HabitService] Could not update habit with ID: ${habitData.id}`, error, { functionName });
        }
    },

    /**
     * Deletes a habit and all its completions from the database.
     */
    async deleteHabit(habitId) {
        const functionName = 'deleteHabit (HabitTrackerService)';
        try {
            // Use a transaction to safely delete both the habit and its completions
            await db.transaction('rw', db.habits, db.habit_completions, async () => {
                await db.habits.delete(habitId);
                await db.habit_completions.where('habit_id').equals(habitId).delete();
            });

            LoggingService.info(`[HabitService] Habit with ID ${habitId} and its completions deleted from DB.`);

            // Refresh the store to update UI
            const allHabits = await db.habits.toArray();
            const allCompletions = await db.habit_completions.toArray();
            await AppStore.setHabits(allHabits);
            await AppStore.setHabitCompletions(allCompletions);

        } catch (error) {
            LoggingService.error(`[HabitService] Error deleting habit with ID: ${habitId}`, error, { functionName });
        }
    },

    /**
     * Logs or updates a completion for a habit on a specific date.
     */
    async logCompletion(habitId, dateString, count) {
        const functionName = 'logCompletion (HabitTrackerService)';
        try {
            // Find if a completion for this habit on this day already exists.
            const existing = await db.habit_completions
                .where({
                    habit_id: habitId,
                    completedAt: dateString
                })
                .first();

            if (existing) {
                // If it exists, update its count
                await db.habit_completions.update(existing.id, { completion_count: count });
            } else {
                // If it doesn't exist, create a new one
                const newCompletion = {
                    habit_id: habitId,
                    completedAt: dateString,
                    completion_count: count
                };
                await db.habit_completions.add(newCompletion);
            }

            LoggingService.info(`[HabitService] Logged completion for habit ID ${habitId} on ${dateString}.`);

            // Refresh the store to update UI
            const allCompletions = await db.habit_completions.toArray();
            await AppStore.setHabitCompletions(allCompletions);

        } catch (error) {
            LoggingService.error(`[HabitService] Error logging completion for habit ID ${habitId} on ${dateString}`, error, { functionName });
        }
    }
};

export default HabitTrackerService;