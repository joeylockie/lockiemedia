import AppStore from './store.js';
import HabitTrackerService from './habitTrackerService.js';
import LoggingService from './loggingService.js';
import EventBus from './eventBus.js';

class HabitTrackerMain {
    constructor() {
        this.container = document.getElementById('habit-cards-container');
        this.addNewHabitBtn = document.getElementById('add-new-habit-btn');
        this.homeBtn = document.getElementById('home-btn');
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
        // This event tells us the data has been loaded from the server
        EventBus.subscribe('storeInitialized', () => this.render());
    }

 // Verify this function in habit_tracker_main.js
bindEventListeners() {
    if (this.addNewHabitBtn) this.addNewHabitBtn.addEventListener('click', () => this.openModal());
    if (this.homeBtn) this.homeBtn.addEventListener('click', () => window.location.href = 'index.html');
    this.closeButton.addEventListener('click', () => this.closeModal());
    this.habitForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    this.deleteHabitBtn.addEventListener('click', () => this.handleDelete());
    
    this.container.addEventListener('click', (e) => {
        const square = e.target.closest('.commit-square');
        const editBtn = e.target.closest('.habit-edit-btn'); 

        if (square && square.dataset.date) {
            HabitTrackerService.toggleCompletion(parseInt(square.dataset.habitId, 10), square.dataset.date);
        } else if (editBtn) {
            this.openModal(parseInt(editBtn.dataset.habitId, 10));
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
        this.modal.style.display = 'flex';
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
        this.container.innerHTML = '';

        const habits = HabitTrackerService.getHabits();
        if (habits.length === 0) {
            this.container.innerHTML = `<p class="text-center text-gray-400">No habits yet. Click "+ New Habit" to start.</p>`;
            return;
        }

        habits.forEach(habit => {
            const card = this.createHabitCard(habit);
            this.container.appendChild(card);
        });
    }

// Verify this function in habit_tracker_main.js
createHabitCard(habit) {
    const card = document.createElement('div');
    card.className = 'habit-card';
    const habitCompletions = AppStore.getHabitCompletions().filter(c => c.habit_id === habit.id);
    const percentage = Math.round((habitCompletions.length / 365) * 100);
    const icons = {'water': 'fas fa-tint', 'wake': 'fas fa-sun', 'read': 'fas fa-book', 'steps': 'fas fa-walking'};
    let iconClass = 'fas fa-check-circle';
    for (const key in icons) {
        if (habit.name.toLowerCase().includes(key)) {
            iconClass = icons[key];
            break;
        }
    }
    card.innerHTML = `
        <div class="habit-card-header">
            <div class="habit-title-section">
                <i class="${iconClass} habit-icon"></i>
                <div>
                    <div class="habit-name">${habit.name}</div>
                    <div class="habit-target">${habit.description || 'Target: Everyday'}</div>
                </div>
            </div>
            <div class="habit-percentage">${percentage}%</div>
            
            <button class="habit-edit-btn" data-habit-id="${habit.id}" title="Edit Habit">
                <i class="fas fa-pencil-alt"></i>
            </button>
        </div>
        <div class="commit-grid-wrapper">
            ${this.createCommitGrid(habit.id, habitCompletions)}
        </div>`;
    return card;
}

    createCommitGrid(habitId, completions) {
        let gridHtml = '<div class="commit-grid">';
        const year = new Date().getFullYear();
        const firstDayOfYear = new Date(year, 0, 1);
        const todayString = HabitTrackerService.getYYYYMMDD(new Date());
        for (let i = 0; i < firstDayOfYear.getDay(); i++) {
            gridHtml += `<div class="commit-square filler"></div>`;
        }
        for (let i = 0; i < 365; i++) {
            const currentDate = new Date(year, 0, i + 1);
            if (currentDate.getFullYear() !== year) continue;
            const dateString = HabitTrackerService.getYYYYMMDD(currentDate);
            const isCompleted = completions.some(c => HabitTrackerService.getYYYYMMDD(new Date(c.completedAt)) === dateString);
            const level = isCompleted ? 'level-4' : 'level-0';
            const isToday = (dateString === todayString) ? 'today' : '';
            gridHtml += `<div class="commit-square ${level} ${isToday}" data-habit-id="${habitId}" data-date="${dateString}"></div>`;
        }
        gridHtml += '</div>';
        return gridHtml;
    }
}

// This is the final, corrected startup logic.
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('habit-cards-container')) {
        // First, create an instance of the class
        const habitTrackerApp = new HabitTrackerMain();
        // Then, tell the store to load the data.
        // The 'storeInitialized' event will trigger the first real render.
        AppStore.initializeStore();
    }
});