// feature_habit_tracker.js
// Manages the UI and logic for the Habit Tracker feature page.

import LoggingService from './loggingService.js';
import HabitTrackerService from './habitTrackerService.js';

// --- DOM Element References ---
let mainContainer; // The <main> element holding all habit cards
let newHabitBtn;

// --- Rendering Functions ---

/**
 * Renders all habit cards and their corresponding grids into the main container.
 */
function renderAllHabits() {
    if (!mainContainer) {
        LoggingService.warn('[HabitTrackerFeature] Main container not found. Cannot render habits.');
        return;
    }

    const habits = HabitTrackerService.getHabits();
    const completions = HabitTrackerService.getCompletionsForYear(new Date().getFullYear());
    
    mainContainer.innerHTML = ''; // Clear existing content

    if (habits.length === 0) {
        mainContainer.innerHTML = '<p class="text-slate-400 italic text-center">No habits created yet. Click "New Habit" to start.</p>';
        return;
    }

    habits.forEach(habit => {
        const habitCompletions = completions.filter(c => c.habitId === habit.id).map(c => c.date);
        const card = createHabitCard(habit, habitCompletions);
        mainContainer.appendChild(card);
    });
}

/**
 * Creates the HTML element for a single habit card, including the grid.
 * @param {object} habit - The habit object from the service.
 * @param {Array<string>} completions - An array of 'YYYY-MM-DD' date strings for this habit's completions.
 * @returns {HTMLElement}
 */
function createHabitCard(habit, completions) {
    const card = document.createElement('div');
    card.className = 'habit-card';

    const header = document.createElement('div');
    header.className = 'flex justify-between items-center mb-3';

    const titleDiv = document.createElement('div');
    const title = document.createElement('h2');
    title.className = 'text-xl font-semibold text-white';
    title.innerHTML = `<i class="${habit.icon} text-${habit.color} mr-2"></i> ${habit.name}`;
    const description = document.createElement('p');
    description.className = 'text-sm text-gray-400';
    description.textContent = habit.description;
    titleDiv.appendChild(title);
    titleDiv.appendChild(description);

    const percentage = document.createElement('span');
    percentage.className = 'text-lg font-bold text-gray-300';
    // Calculate percentage based on days passed so far
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const today = new Date();
    const dayOfYear = Math.floor((today - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
    const completionPercentage = dayOfYear > 0 ? Math.round((completions.length / dayOfYear) * 100) : 0;
    percentage.textContent = `${completionPercentage}%`;

    header.appendChild(titleDiv);
    header.appendChild(percentage);

    const grid = createCompletionGrid(habit.id, completions);

    card.appendChild(header);
    card.appendChild(grid);

    return card;
}

/**
 * Creates the 52x7 grid of day squares for a habit.
 * @param {string} habitId - The ID of the habit.
 * @param {Array<string>} completions - An array of 'YYYY-MM-DD' date strings for this habit.
 * @returns {HTMLElement}
 */
function createCompletionGrid(habitId, completions) {
    const grid = document.createElement('div');
    grid.className = 'habit-grid';

    const year = new Date().getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const dayOfWeekOfFirstDay = firstDayOfYear.getDay(); // 0=Sun, 1=Mon...

    // Add empty squares for padding at the beginning of the year
    for (let i = 0; i < dayOfWeekOfFirstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'habit-day opacity-20';
        grid.appendChild(emptyDay);
    }

    // Add squares for each day of the year
    for (let i = 0; i < 365; i++) {
        const currentDate = new Date(year, 0, i + 1);
        const dateString = currentDate.toISOString().split('T')[0];

        const daySquare = document.createElement('div');
        daySquare.className = 'habit-day cursor-pointer transition-transform hover:scale-125';
        daySquare.title = dateString;

        if (completions.includes(dateString)) {
            // Level 1 is the default for a completion
            daySquare.classList.add('completed-level-1');
        }

        daySquare.addEventListener('click', () => {
            HabitTrackerService.toggleCompletion(habitId, dateString);
            // Re-render all habits to update the grid and percentage
            renderAllHabits();
        });

        grid.appendChild(daySquare);
    }
    return grid;
}

// --- Main Feature Functions ---

function initialize() {
    const functionName = 'initialize (HabitTrackerFeature)';

    // Simple check for a unique element on habits.html
    if (!document.querySelector('.header-title')) {
        LoggingService.debug('[HabitTrackerFeature] Not on habits page. Skipping initialization.', { functionName });
        return;
    }
    LoggingService.info('[HabitTrackerFeature] Initializing...', { functionName });

    // Initialize the service first
    HabitTrackerService.initialize();

    // Get DOM elements
    mainContainer = document.querySelector('main.space-y-6');
    newHabitBtn = document.querySelector('button.text-white.bg-indigo-500'); // A bit fragile, an ID would be better

    if (newHabitBtn) {
        newHabitBtn.addEventListener('click', () => {
            const name = prompt("Enter new habit name:");
            if (name) {
                HabitTrackerService.addHabit({ name: name, description: 'New Habit' });
                renderAllHabits(); // Re-render to show the new habit
            }
        });
    }

    // Initial render
    renderAllHabits();
    
    LoggingService.info('[HabitTrackerFeature] Initialized.', { functionName });
}


export const HabitTrackerFeature = {
    initialize,
    updateUIVisibility: () => {} // Placeholder for now
};