// time_tracker_main.js
// Main entry point for the Time Tracker page.
// REFACTORED FOR SELF-HOSTED BACKEND

import LoggingService from './loggingService.js';
import { TimeTrackerFeature } from './feature_time_tracker.js';
// REMOVED: protectPage and UserAccountsFeature imports

document.addEventListener('DOMContentLoaded', async () => {
    const functionName = 'DOMContentLoaded (TimeTrackerMain)';
    
    // Make the page visible immediately since there's no auth check
    document.body.style.visibility = 'visible';

    try {
        LoggingService.info('[TimeTrackerMain] Initializing Time Tracker page...', { functionName });

        // The timeTrackerService relies on a Firestore instance, which we are no longer using in this simplified version.
        // We will need to refactor TimeTrackerService and its feature file next to use AppStore or another local mechanism.
        // For now, this will likely cause errors, but we are refactoring step-by-step.
        
        // Initialize the feature module, which in turn initializes its dependencies like the service.
        if (TimeTrackerFeature && typeof TimeTrackerFeature.initialize === 'function') {
            TimeTrackerFeature.initialize();
        } else {
            LoggingService.error('[TimeTrackerMain] TimeTrackerFeature or its initialize function is not available.', null, { functionName });
        }
        
        LoggingService.info('[TimeTrackerMain] Time Tracker page initialization complete.', { functionName });

    } catch (error) {
        LoggingService.critical('[TimeTrackerMain] A critical error occurred during Time Tracker initialization.', error, { functionName });
        // Optionally, display an error message in the UI
        const container = document.querySelector('main');
        if (container) {
            container.innerHTML = '<p class="text-red-500 text-center p-8">Could not load the Time Tracker. Please check the console for errors and try refreshing the page.</p>';
        }
    }
});