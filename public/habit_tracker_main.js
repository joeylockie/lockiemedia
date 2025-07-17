import AppStore from './store.js';
import HabitTrackerService from './habitTrackerService.js';
import LoggingService from './loggingService.js';
import EventBus from './eventBus.js';

class HabitTrackerMain {
    constructor() {
        this.habitModal = document.getElementById('habit-modal');
        this.addHabitBtn = document.getElementById('add-habit-btn');
        this.closeButton = this.habitModal.querySelector('.close-button');
        this.habitForm = document.getElementById('habit-form');
        this.modalTitle = document.getElementById('habit-modal-title');
        this.habitIdInput = document.getElementById('habit-id-input');
        this.habitNameInput = document.getElementById('habit-name');
        this.habitDescriptionInput = document.getElementById('habit-description');
        this.habitFrequencyInput = document.getElementById('habit-frequency');
        this.deleteHabitBtn = document.getElementById('delete-habit-btn');
        this.gridContainer = document.getElementById('habit-grid-container');

        this.bindEventListeners();
        // Listen for data changes to re-render the UI
        EventBus.subscribe('habitsChanged', () => this.render());
        EventBus.subscribe('habitCompletionsChanged', () => this.render());

        // Initial render
        this.render();
    }

    bindEventListeners() {
        this.addHabitBtn.addEventListener('click', () => this.openModal());
        this.closeButton.addEventListener('click', () => this.closeModal());
        this.habitForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.deleteHabitBtn.addEventListener('click', () => this.handleDelete());
        
        // Clicks on the grid for toggling completions or editing habits
        this.gridContainer.addEventListener('click', (e) => {
            const dayCell = e.target.closest('.day-cell');
            const editBtn = e.target.closest('.edit-habit-btn');

            if (dayCell) {
                const habitId = parseInt(dayCell.dataset.habitId, 10);
                const date = dayCell.dataset.date;
                HabitTrackerService.toggleCompletion(habitId, date);
            } else if (editBtn) {
                const habitId = parseInt(editBtn.dataset.habitId, 10);
                this.openModal(habitId);
            }
        });
    }

    openModal(habitId = null) {
        this.habitForm.reset();
        this.habitIdInput.value = '';
        this.deleteHabitBtn.style.display = 'none';

        if (habitId) {
            // Editing existing habit
            const habits = AppStore.getHabits();
            const habit = habits.find(h => h.id === habitId);
            if (habit) {
                this.modalTitle.textContent = 'Edit Habit';
                this.habitIdInput.value = habit.id;
                this.habitNameInput.value = habit.name;
                this.habitDescriptionInput.value = habit.description || '';
                this.habitFrequencyInput.value = habit.frequency;
                this.deleteHabitBtn.style.display = 'block';
            }
        } else {
            // Adding new habit
            this.modalTitle.textContent = 'Add a New Habit';
        }
        this.habitModal.style.display = 'block';
    }

    closeModal() {
        this.habitModal.style.display = 'none';
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        const habitData = {
            id: this.habitIdInput.value ? parseInt(this.habitIdInput.value, 10) : null,
            name: this.habitNameInput.value.trim(),
            description: this.habitDescriptionInput.value.trim(),
            frequency: this.habitFrequencyInput.value
        };

        if (habitData.id) {
            // Update existing habit
            await HabitTrackerService.updateHabit(habitData);
        } else {
            // Create new habit
            await HabitTrackerService.createHabit(habitData);
        }
        this.closeModal();
    }

    async handleDelete() {
        const habitId = parseInt(this.habitIdInput.value, 10);
        if (habitId && confirm('Are you sure you want to delete this habit and all its history?')) {
            await HabitTrackerService.deleteHabit(habitId);
            this.closeModal();
        }
    }

    render() {
        const habits = AppStore.getHabits();
        const completions = AppStore.getHabitCompletions();
        
        if (!this.gridContainer) return;
        this.gridContainer.innerHTML = ''; // Clear previous content

        if (habits.length === 0) {
            this.gridContainer.innerHTML = `
                <div class="habit-card-placeholder">
                    <p>No habits yet. Click "Add New Habit" to get started!</p>
                </div>`;
            return;
        }

        const dates = this.getLast30Days();

        // Create Header Row
        const headerRow = document.createElement('div');
        headerRow.className = 'habit-row header-row';
        headerRow.innerHTML = `<div class="habit-name-header">Habit</div>`;
        dates.forEach(date => {
            const day = date.getDate();
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
            headerRow.innerHTML += `<div class="day-header"><span>${dayName}</span><span>${day}</span></div>`;
        });
        this.gridContainer.appendChild(headerRow);
        
        // Create a row for each habit
        habits.forEach(habit => {
            const habitRow = document.createElement('div');
            habitRow.className = 'habit-row';
            habitRow.innerHTML = `
                <div class="habit-name-cell">
                    <span>${habit.name}</span>
                    <button class="edit-habit-btn" data-habit-id="${habit.id}">⚙️</button>
                </div>
            `;

            dates.forEach(date => {
                const dateString = HabitTrackerService.getYYYYMMDD(date);
                const isCompleted = completions.some(c => 
                    c.habit_id === habit.id && HabitTrackerService.getYYYYMMDD(new Date(c.completedAt)) === dateString
                );
                
                const dayCell = document.createElement('div');
                dayCell.className = `day-cell ${isCompleted ? 'completed' : ''}`;
                dayCell.dataset.habitId = habit.id;
                dayCell.dataset.date = dateString;
                habitRow.appendChild(dayCell);
            });
            this.gridContainer.appendChild(habitRow);
        });
    }

    getLast30Days() {
        const dates = [];
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date);
        }
        return dates.reverse();
    }
}

// Ensure the DOM is fully loaded before initializing the script
document.addEventListener('DOMContentLoaded', () => {
    // A check to make sure we are on the habits page
    if (document.getElementById('habit-grid-container')) {
        new HabitTrackerMain();
    }
});