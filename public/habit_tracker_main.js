// habit_tracker_main.js
// Main entry point for the Habit Tracker page.
// REFACTORED FOR SELF-HOSTED BACKEND

import LoggingService from './loggingService.js';
import { HabitTrackerFeature } from './feature_habit_tracker.js';
// REMOVED: protectPage and UserAccountsFeature imports

document.addEventListener('DOMContentLoaded', async () => {
    const functionName = 'DOMContentLoaded (HabitTrackerMain)';
    
    // Make the page visible immediately since there's no auth check
    document.body.style.visibility = 'visible';

    try {
        LoggingService.info('[HabitTrackerMain] Initializing Habit Tracker page...', { functionName });

        // Initialize the feature module, which will handle the rest.
        if (HabitTrackerFeature && typeof HabitTrackerFeature.initialize === 'function') {
            HabitTrackerFeature.initialize();
        } else {
            LoggingService.error('[HabitTrackerFeature] HabitTrackerFeature or its initialize function is not available.', null, { functionName });
        }
        
        LoggingService.info('[HabitTrackerMain] Habit Tracker page initialization complete.', { functionName });

    } catch (error) {
        LoggingService.critical('[HabitTrackerMain] A critical error occurred during Habit Tracker initialization.', error, { functionName });
        const container = document.querySelector('main');
        if (container) {
            container.innerHTML = '<p class="text-red-500 text-center p-8">Could not load the Habit Tracker. Please check the console for errors and try refreshing the page.</p>';
        }
    }
});