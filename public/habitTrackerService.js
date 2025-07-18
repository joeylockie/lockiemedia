import AppStore from './store.js';
import LoggingService from './loggingService.js';

const IP_ADDRESS = 'YOUR_CONTAINER_IP'; // Make sure this is your container's IP
const API_BASE_URL = 'http://192.168.2.201:3010/api/habits'; // CORRECTED PORT

const HabitTrackerService = {
    getYYYYMMDD(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    async createHabit({ name, description, target_count }) {
        try {
            const response = await fetch(`${API_BASE_URL}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, target_count })
            });
            if (!response.ok) throw new Error('Failed to create habit on the server.');
            // --- FIX: Call the correct function ---
            await AppStore.initializeStore();
        } catch (error) {
            LoggingService.error('[HabitService] Error creating habit:', error);
        }
    },

    async updateHabit(habitData) {
        try {
            const response = await fetch(`${API_BASE_URL}/${habitData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(habitData)
            });
            if (!response.ok) throw new Error('Failed to update habit on the server.');
            // --- FIX: Call the correct function ---
            await AppStore.initializeStore();
        } catch (error) {
            LoggingService.error(`[HabitService] Could not update habit with ID: ${habitData.id}`, error);
        }
    },

    async deleteHabit(habitId) {
        try {
            const response = await fetch(`${API_BASE_URL}/${habitId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete habit on the server.');
            // --- FIX: Call the correct function ---
            await AppStore.initializeStore();
        } catch (error) {
            LoggingService.error(`[HabitService] Error deleting habit with ID: ${habitId}`, error);
        }
    },

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
            // --- FIX: Call the correct function ---
            await AppStore.initializeStore();
        } catch (error) {
            LoggingService.error(`[HabitService] Error logging completion for habit ID ${habitId} on ${dateString}`, error);
        }
    }
};

export default HabitTrackerService;