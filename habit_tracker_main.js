// habit_tracker_main.js
// Main entry point for the Habit Tracker page.

import protectPage from './authGuard.js';
import LoggingService from './loggingService.js';
import { HabitTrackerFeature } from './feature_habit_tracker.js';
import { UserAccountsFeature } from './feature_user_accounts.js'; // <-- ADDED

document.addEventListener('DOMContentLoaded', async () => { // <-- MODIFIED: Made async
    const functionName = 'DOMContentLoaded (HabitTrackerMain)';
    
    try {
        // --- MODIFIED START: Initialize Firebase first, then protect the page ---
        if (UserAccountsFeature && UserAccountsFeature.initialize) {
            UserAccountsFeature.initialize();
        } else {
            LoggingService.critical('[HabitTrackerMain] UserAccountsFeature is not available to initialize Firebase.', new Error('DependencyMissing'), { functionName });
            return;
        }

        await protectPage();
        // --- MODIFIED END ---

        LoggingService.info('[HabitTrackerMain] Auth Guard passed. Initializing Habit Tracker page...', { functionName });

        // Initialize the feature module, which will handle the rest.
        if (HabitTrackerFeature && typeof HabitTrackerFeature.initialize === 'function') {
            HabitTrackerFeature.initialize();
        } else {
            LoggingService.error('[HabitTrackerMain] HabitTrackerFeature or its initialize function is not available.', null, { functionName });
        }
        
        LoggingService.info('[HabitTrackerMain] Habit Tracker page initialization complete.', { functionName });

    } catch (error) {
        LoggingService.critical('[HabitTrackerMain] A critical error occurred during Habit Tracker initialization or auth.', error, { functionName });
        const container = document.querySelector('main');
        if (container) {
            container.innerHTML = '<p class="text-red-500 text-center p-8">Could not load the Habit Tracker. Please check the console for errors and try refreshing the page.</p>';
        }
    }
});