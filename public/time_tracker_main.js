// public/time_tracker_main.js
// Main entry point for the Time Tracker page.

import LoggingService from './loggingService.js';
import { TimeTrackerFeature } from './feature_time_tracker.js';
import { TimeTrackerRemindersFeature } from './feature_time_tracker_reminders.js'; // Import the new feature
import AppStore from './store.js';
import EventBus from './eventBus.js';

document.addEventListener('DOMContentLoaded', async () => {
    const functionName = 'DOMContentLoaded (TimeTrackerMain)';
    
    // Make the page visible immediately
    document.body.style.visibility = 'visible';

    try {
        LoggingService.info('[TimeTrackerMain] Initializing Time Tracker page...', { functionName });

        // Initialize the AppStore to load all data from the backend. This is the critical step.
        await AppStore.initializeStore();
        
        // Initialize the main time tracker feature module
        if (TimeTrackerFeature && typeof TimeTrackerFeature.initialize === 'function') {
            TimeTrackerFeature.initialize();
        } else {
            LoggingService.error('[TimeTrackerMain] TimeTrackerFeature or its initialize function is not available.', null, { functionName });
        }

        // Initialize our new reminder feature
        if (TimeTrackerRemindersFeature && typeof TimeTrackerRemindersFeature.initialize === 'function') {
            TimeTrackerRemindersFeature.initialize();
        } else {
            LoggingService.error('[TimeTrackerMain] TimeTrackerRemindersFeature or its initialize function is not available.', null, { functionName });
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