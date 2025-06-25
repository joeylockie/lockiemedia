// public/dev_tracker_main.js
// Main entry point for the Dev Tracker page.

import LoggingService from './loggingService.js';
import AppStore from './store.js';
import { DevTrackerUI } from './dev_tracker_ui.js';

document.addEventListener('DOMContentLoaded', async () => {
    const functionName = 'DOMContentLoaded (DevTrackerMain)';
    
    // Make the page visible immediately
    document.body.style.visibility = 'visible';

    try {
        LoggingService.info('[DevTrackerMain] Initializing Dev Tracker page...', { functionName });

        // Initialize the AppStore to load all data from the backend.
        await AppStore.initializeStore();
        
        // Initialize the main UI feature module
        if (DevTrackerUI && typeof DevTrackerUI.initialize === 'function') {
            DevTrackerUI.initialize();
        } else {
            LoggingService.error('[DevTrackerMain] DevTrackerUI or its initialize function is not available.', null, { functionName });
        }
        
        LoggingService.info('[DevTrackerMain] Dev Tracker page initialization complete.', { functionName });

    } catch (error) {
        LoggingService.critical('[DevTrackerMain] A critical error occurred during Dev Tracker initialization.', error, { functionName });
        const container = document.querySelector('main');
        if (container) {
            container.innerHTML = '<p class="text-red-500 text-center p-8">Could not load the Dev Tracker. Please check the console for errors and try refreshing the page.</p>';
        }
    }
});