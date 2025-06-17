// time_history_main.js
// Main entry point for the Time Tracker History & Reports page.

import protectPage from './authGuard.js';
import LoggingService from './loggingService.js';
import { UserAccountsFeature } from './feature_user_accounts.js';
import { TimeHistoryFeature } from './feature_time_history.js';

document.addEventListener('DOMContentLoaded', async () => {
    const functionName = 'DOMContentLoaded (TimeHistoryMain)';
    
    try {
        // Initialize Firebase services first, as the auth guard depends on them.
        if (UserAccountsFeature && UserAccountsFeature.initialize) {
            UserAccountsFeature.initialize();
        } else {
            LoggingService.critical('[TimeHistoryMain] UserAccountsFeature is not available to initialize Firebase.', new Error('DependencyMissing'), { functionName });
            return;
        }

        // Ensure the user is authenticated before proceeding.
        await protectPage();
        
        // After the user is confirmed to be authenticated, make the page visible.
        document.body.style.visibility = 'visible';

        LoggingService.info('[TimeHistoryMain] Auth Guard passed. Initializing History & Reports page...', { functionName });

        // Initialize the feature module, which will handle all UI logic for this page.
        if (TimeHistoryFeature && typeof TimeHistoryFeature.initialize === 'function') {
            TimeHistoryFeature.initialize();
        } else {
            LoggingService.error('[TimeHistoryMain] TimeHistoryFeature or its initialize function is not available.', null, { functionName });
        }
        
        LoggingService.info('[TimeHistoryMain] History & Reports page initialization complete.', { functionName });

    } catch (error) {
        LoggingService.critical('[TimeHistoryMain] A critical error occurred during History page initialization or auth.', error, { functionName });
        // Optionally, display an error message in the UI
        const container = document.querySelector('main');
        if (container) {
            container.innerHTML = '<p class="text-red-500 text-center p-8">Could not load the reporting dashboard. Please check the console for errors and try refreshing the page.</p>';
        }
    }
});