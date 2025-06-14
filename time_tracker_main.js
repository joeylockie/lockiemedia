// time_tracker_main.js
// Main entry point for the Time Tracker page.

import LoggingService from './loggingService.js';
import { TimeTrackerFeature } from './feature_time_tracker.js';

document.addEventListener('DOMContentLoaded', () => {
    const functionName = 'DOMContentLoaded (TimeTrackerMain)';
    LoggingService.info('[TimeTrackerMain] DOMContentLoaded. Initializing Time Tracker page...', { functionName });

    try {
        // Initialize the feature module, which in turn initializes its dependencies like the service.
        if (TimeTrackerFeature && typeof TimeTrackerFeature.initialize === 'function') {
            TimeTrackerFeature.initialize();
        } else {
            LoggingService.error('[TimeTrackerMain] TimeTrackerFeature or its initialize function is not available.', null, { functionName });
        }
    } catch (error) {
        LoggingService.critical('[TimeTrackerMain] A critical error occurred during Time Tracker initialization.', error, { functionName });
        // Optionally, display an error message in the UI
        const container = document.querySelector('main');
        if (container) {
            container.innerHTML = '<p class="text-red-500 text-center p-8">Could not load the Time Tracker. Please check the console for errors and try refreshing the page.</p>';
        }
    }

    LoggingService.info('[TimeTrackerMain] Time Tracker page initialization complete.', { functionName });
});