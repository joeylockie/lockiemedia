// habit_tracker_main.js
// Main entry point for the Habit Tracker page.

import LoggingService from './loggingService.js';
import { HabitTrackerFeature } from './feature_habit_tracker.js';

document.addEventListener('DOMContentLoaded', () => {
    const functionName = 'DOMContentLoaded (HabitTrackerMain)';
    LoggingService.info('[HabitTrackerMain] DOMContentLoaded. Initializing Habit Tracker page...', { functionName });

    try {
        // Initialize the feature module, which will handle the rest.
        if (HabitTrackerFeature && typeof HabitTrackerFeature.initialize === 'function') {
            HabitTrackerFeature.initialize();
        } else {
            LoggingService.error('[HabitTrackerMain] HabitTrackerFeature or its initialize function is not available.', null, { functionName });
        }
    } catch (error) {
        LoggingService.critical('[HabitTrackerMain] A critical error occurred during Habit Tracker initialization.', error, { functionName });
        const container = document.querySelector('main');
        if (container) {
            container.innerHTML = '<p class="text-red-500 text-center p-8">Could not load the Habit Tracker. Please check the console for errors and try refreshing the page.</p>';
        }
    }

    LoggingService.info('[HabitTrackerMain] Habit Tracker page initialization complete.', { functionName });
});