// time_history_main.js
// Main entry point for the Time Tracker History & Reports page.
// REFACTORED FOR SELF-HOSTED BACKEND

import LoggingService from './loggingService.js';
import { TimeHistoryFeature } from './feature_time_history.js';
// REMOVED: protectPage and UserAccountsFeature imports

document.addEventListener('DOMContentLoaded', async () => {
    const functionName = 'DOMContentLoaded (TimeHistoryMain)';
    
    // Make the page visible immediately since there's no auth check
    document.body.style.visibility = 'visible';

    try {
        LoggingService.info('[TimeHistoryMain] Auth Guard passed. Initializing History & Reports page...', { functionName });

        // Initialize the feature module, which will handle all UI logic for this page.
        if (TimeHistoryFeature && typeof TimeHistoryFeature.initialize === 'function') {
            TimeHistoryFeature.initialize();
        } else {
            LoggingService.error('[TimeHistoryMain] TimeHistoryFeature or its initialize function is not available.', null, { functionName });
        }
        
        LoggingService.info('[TimeHistoryMain] History & Reports page initialization complete.', { functionName });

    } catch (error) {
        LoggingService.critical('[TimeHistoryMain] A critical error occurred during History page initialization.', error, { functionName });
        // Optionally, display an error message in the UI
        const container = document.querySelector('main');
        if (container) {
            container.innerHTML = '<p class="text-red-500 text-center p-8">Could not load the reporting dashboard. Please check the console for errors and try refreshing the page.</p>';
        }
    }
});