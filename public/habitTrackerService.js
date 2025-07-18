import AppStore from './store.js';
import LoggingService from './loggingService.js';

// The base URL for the habit tracker microservice.
const API_BASE_URL = 'http://localhost:3010/api/habits'; // CORRECTED PORT

const HabitTrackerService = {
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
    },

    /**
     * Creates a new habit by sending a request to the backend.
     * @param {object} habitData - Contains name, description, target_count.
     */
    async createHabit({ name, description, target_count }) {
        try {
            const response = await fetch(`${API_BASE_URL}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, target_count })
            });
            if (!response.ok) throw new Error('Failed to create habit on the server.');
            // Reload all data from the server to ensure consistency
            await AppStore.fetchHabitsData();
        } catch (error) {
            LoggingService.error('[HabitService] Error creating habit:', error);
        }
    },

    /**
     * Updates an existing habit on the backend.
     * @param {object} habitData - The complete habit object with updated fields.
     */
    async updateHabit(habitData) {
        try {
            const response = await fetch(`${API_BASE_URL}/${habitData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(habitData)
            });
            if (!response.ok) throw new Error('Failed to update habit on the server.');
            await AppStore.fetchHabitsData();
        } catch (error) {
            LoggingService.error(`[HabitService] Could not update habit with ID: ${habitData.id}`, error);
        }
    },

    /**
     * Deletes a habit from the backend.
     * @param {number} habitId - The ID of the habit to delete.
     */
    async deleteHabit(habitId) {
        try {
            const response = await fetch(`${API_BASE_URL}/${habitId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete habit on the server.');
            await AppStore.fetchHabitsData();
        } catch (error) {
            LoggingService.error(`[HabitService] Error deleting habit with ID: ${habitId}`, error);
        }
    },

    /**
     * Logs a completion or updates its count for a specific date via the backend.
     * @param {number} habitId - The ID of the habit.
     * @param {string} dateString - The date in 'YYYY-MM-DD' format.
     * @param {number} count - The new completion count for the day.
     */
    async logCompletion(habitId, dateString, count) {
        try {
            const response = await fetch(`${API_BASE_URL}/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    habit_id: habitId,
                    completedAt: dateString,
                    completion_count: count
                })
            });
            if (!response.ok) throw new Error('Failed to log completion on the server.');
            // We fetch again to get the updated state from the single source of truth (the DB)
            await AppStore.fetchHabitsData();
        } catch (error) {
            LoggingService.error(`[HabitService] Error logging completion for habit ID ${habitId} on ${dateString}`, error);
        }
    }
};

export default HabitTrackerService;