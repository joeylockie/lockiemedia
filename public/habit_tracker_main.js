import AppStore from './store.js';
import HabitTrackerService from './habitTrackerService.js';
import LoggingService from './loggingService.js';
import EventBus from './eventBus.js';

class HabitTrackerMain {
    constructor() {
        // Main UI Elements
        this.container = document.getElementById('habit-cards-container');
        this.addNewHabitBtn = document.getElementById('add-new-habit-btn');
        this.homeBtn = document.getElementById('home-btn');

        // Modal Elements
        this.modal = document.getElementById('habit-modal');
        this.closeButton = this.modal.querySelector('.close-button');
        this.habitForm = document.getElementById('habit-form');
        this.modalTitle = document.getElementById('habit-modal-title');
        this.habitIdInput = document.getElementById('habit-id-input');
        this.habitNameInput = document.getElementById('habit-name');
        this.habitDescriptionInput = document.getElementById('habit-description');
        this.deleteHabitBtn = document.getElementById('delete-habit-btn');

        this.bindEventListeners();
        EventBus.subscribe('habitsChanged', () => this.render());
        EventBus.subscribe('habitCompletionsChanged', () => this.render());

        this.render(); // Initial render
    }

    bindEventListeners() {
        if (this.addNewHabitBtn) {
            this.addNewHabitBtn.addEventListener('click', () => this.openModal());
        }
        if (this.homeBtn) {
            this.homeBtn.addEventListener('click', () => window.location.href = 'index.html');
        }
        this.closeButton.addEventListener('click', () => this.closeModal());
        this.habitForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.deleteHabitBtn.addEventListener('click', () => this.handleDelete());

        // Use event delegation for dynamically created elements
        this.container.addEventListener('click', (e) => {
            const square = e.target.closest('.commit-square');
            const cardHeader = e.target.closest('.habit-card-header');

            if (square) {
                const habitId = parseInt(square.dataset.habitId, 10);
                const date = square.dataset.date;
                if (date) { // Ensure it's not a filler square
                    HabitTrackerService.toggleCompletion(habitId, date);
                }
            } else if (cardHeader) {
                // The header of the card is now the edit button
                const habitId = parseInt(cardHeader.dataset.habitId, 10);
                this.openModal(habitId);
            }
        });
    }

    openModal(habitId = null) {
        this.habitForm.reset();
        this.habitIdInput.value = '';
        this.deleteHabitBtn.style.display = 'none';

        if (habitId) {
            const habit = HabitTrackerService.getHabits().find(h => h.id === habitId);
            if (habit) {
                this.modalTitle.textContent = 'Edit Habit';
                this.habitIdInput.value = habit.id;
                this.habitNameInput.value = habit.name;
                this.habitDescriptionInput.value = habit.description || '';
                this.deleteHabitBtn.style.display = 'block';
            }
        } else {
            this.modalTitle.textContent = 'Add a New Habit';
        }
        this.modal.style.display = 'block';
    }

    closeModal() {
        this.modal.style.display = 'none';
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        const habitData = {
            id: this.habitIdInput.value ? parseInt(this.habitIdInput.value, 10) : null,
            name: this.habitNameInput.value.trim(),
            description: this.habitDescriptionInput.value.trim()
        };

        if (habitData.id) {
            await HabitTrackerService.updateHabit(habitData);
        } else {
            await HabitTrackerService.createHabit(habitData);
        }
        this.closeModal();
    }

    async handleDelete() {
        const habitId = parseInt(this.habitIdInput.value, 10);
        if (habitId && confirm('Are you sure you want to delete this habit?')) {
            await HabitTrackerService.deleteHabit(habitId);
            this.closeModal();
        }
    }

    render() {
        if (!this.container) return;
        this.container.innerHTML = ''; // Clear previous render

        const habits = HabitTrackerService.getHabits();
        const completions = HabitTrackerService.getCompletionsForYear(new Date().getFullYear());

        if (habits.length === 0) {
            this.container.innerHTML = `<p class="text-center text-gray-400">No habits yet. Click "+ New Habit" to start.</p>`;
            return;
        }

        habits.forEach(habit => {
            const card = this.createHabitCard(habit, completions);
            this.container.appendChild(card);
        });
    }

    createHabitCard(habit, allCompletions) {
        const card = document.createElement('div');
        card.className = 'habit-card';

        // Calculate completions for this specific habit
        const habitCompletions = AppStore.getHabitCompletions().filter(c => c.habit_id === habit.id);
        const totalDays = 365;
        const percentage = Math.round((habitCompletions.length / totalDays) * 100);
        
        // Define an icon (can be expanded later)
        const icons = {
            'water': 'fas fa-tint',
            'wake': 'fas fa-sun',
            'read': 'fas fa-book',
            'steps': 'fas fa-walking'
        };
        const habitNameLower = habit.name.toLowerCase();
        let iconClass = 'fas fa-check-circle'; // Default icon
        for (const key in icons) {
            if (habitNameLower.includes(key)) {
                iconClass = icons[key];
                break;
            }
        }

        card.innerHTML = `
            <div class="habit-card-header" data-habit-id="${habit.id}" style="cursor: pointer;">
                <div class="habit-title-section">
                    <i class="${iconClass} habit-icon"></i>
                    <div>
                        <div class="habit-name">${habit.name}</div>
                        <div class="habit-target">${habit.description || 'Target: Everyday'}</div>
                    </div>
                </div>
                <div class="habit-percentage">${percentage}%</div>
            </div>
            <div class="commit-grid-wrapper">
                ${this.createCommitGrid(habit, allCompletions)}
            </div>
        `;
        return card;
    }

    createCommitGrid(habit, allCompletions) {
        const grid = document.createElement('div');
        grid.className = 'commit-grid';

        const year = new Date().getFullYear();
        const firstDayOfYear = new Date(year, 0, 1);
        const today = new Date();
        const todayString = HabitTrackerService.getYYYYMMDD(today);
        
        // Offset for the first day of the year (0=Sun, 1=Mon, etc.)
        let dayOffset = firstDayOfYear.getDay();
        for (let i = 0; i < dayOffset; i++) {
            grid.innerHTML += `<div class="commit-square filler"></div>`;
        }
        
        const habitCompletions = AppStore.getHabitCompletions().filter(c => c.habit_id === habit.id);

        for (let i = 0; i < 365; i++) {
            const currentDate = new Date(year, 0, i + 1);
            if (currentDate.getFullYear() !== year) continue; // Handle leap years gracefully

            const dateString = HabitTrackerService.getYYYYMMDD(currentDate);
            const isCompleted = habitCompletions.some(c => HabitTrackerService.getYYYYMMDD(new Date(c.completedAt)) === dateString);
            
            const level = isCompleted ? 'level-4' : 'level-0';
            const isToday = (dateString === todayString) ? 'today' : '';

            grid.innerHTML += `<div class="commit-square ${level} ${isToday}" data-habit-id="${habit.id}" data-date="${dateString}"></div>`;
        }

        return grid.outerHTML;
    }
}

// Ensure the DOM is fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('habit-cards-container')) {
        new HabitTrackerMain();
    }
});