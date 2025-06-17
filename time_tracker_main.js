// time_tracker_main.js
// Main entry point for the Time Tracker page.

import protectPage from './authGuard.js'; // <-- ADDED
import LoggingService from './loggingService.js';
import { TimeTrackerFeature } from './feature_time_tracker.js';
import { UserAccountsFeature } from './feature_user_accounts.js'; // <-- ADDED

document.addEventListener('DOMContentLoaded', async () => { // <-- MODIFIED: Made async
    const functionName = 'DOMContentLoaded (TimeTrackerMain)';
    
    try {
        // --- MODIFIED START: Initialize Firebase first, then protect the page ---
        if (UserAccountsFeature && UserAccountsFeature.initialize) {
            UserAccountsFeature.initialize();
        } else {
            LoggingService.critical('[TimeTrackerMain] UserAccountsFeature is not available to initialize Firebase.', new Error('DependencyMissing'), { functionName });
            return;
        }

        await protectPage();
        // --- MODIFIED END ---

        // ** THIS IS THE FIX **
        // After the user is confirmed to be authenticated, make the page visible.
        document.body.style.visibility = 'visible';

        LoggingService.info('[TimeTrackerMain] Auth Guard passed. Initializing Time Tracker page...', { functionName });

        // Initialize the feature module, which in turn initializes its dependencies like the service.
        if (TimeTrackerFeature && typeof TimeTrackerFeature.initialize === 'function') {
            TimeTrackerFeature.initialize();
        } else {
            LoggingService.error('[TimeTrackerMain] TimeTrackerFeature or its initialize function is not available.', null, { functionName });
        }
        
        LoggingService.info('[TimeTrackerMain] Time Tracker page initialization complete.', { functionName });

    } catch (error) {
        LoggingService.critical('[TimeTrackerMain] A critical error occurred during Time Tracker initialization or auth.', error, { functionName });
        // Optionally, display an error message in the UI
        const container = document.querySelector('main');
        if (container) {
            container.innerHTML = '<p class="text-red-500 text-center p-8">Could not load the Time Tracker. Please check the console for errors and try refreshing the page.</p>';
        }
    }
});