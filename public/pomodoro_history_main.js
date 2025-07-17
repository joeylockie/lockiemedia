import AppStore from './store.js';
import EventBus from './eventBus.js';

class PomodoroHistoryMain {
    constructor() {
        this.tableBody = document.getElementById('history-table-body');
        
        // Listen for the event that signals the data store is ready
        EventBus.subscribe('storeInitialized', () => this.render());
        
        // Initialize the store to fetch data from the backend
        AppStore.initializeStore();
    }

    render() {
        if (!this.tableBody) return;

        const sessions = AppStore.getPomodoroSessions();
        
        // Clear the "Loading..." message
        this.tableBody.innerHTML = '';

        if (sessions.length === 0) {
            this.tableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center text-gray-400">No completed sessions yet.</td>
                </tr>
            `;
            return;
        }

        // Sort sessions from most recent to oldest
        sessions.sort((a, b) => b.createdAt - a.createdAt);

        sessions.forEach(session => {
            const row = document.createElement('tr');
            
            const date = new Date(session.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
            
            // Capitalize the session type (e.g., "Work", "Short break")
            const sessionType = session.type.charAt(0).toUpperCase() + session.type.slice(1);
            
            row.innerHTML = `
                <td>${date}</td>
                <td>${sessionType}</td>
                <td>${session.duration} minutes</td>
            `;
            
            this.tableBody.appendChild(row);
        });
    }
}

// Ensure the DOM is fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('history-table-body')) {
        new PomodoroHistoryMain();
    }
});