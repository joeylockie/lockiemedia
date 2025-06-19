import LoggingService from './loggingService.js';
import AppStore from './store.js';
import { NotesFeature } from './feature_notes.js';
import EventBus from './eventBus.js';

document.addEventListener('DOMContentLoaded', async () => {
    const functionName = 'DOMContentLoaded (NotesMain)';
    LoggingService.info('[NotesMain] Initializing Notes page...', { functionName });

    try {
        // Initialize the AppStore to load all data from the backend
        await AppStore.initializeStore();

        // Initialize the Notes feature UI, which will attach event listeners
        if (NotesFeature && typeof NotesFeature.initialize === 'function') {
            NotesFeature.initialize();
        } else {
            LoggingService.error('[NotesMain] NotesFeature or its initialize function is not available.', null, { functionName });
        }
        
        // Listen for changes and re-render the UI
        EventBus.subscribe('notesChanged', NotesFeature.initialize);
        EventBus.subscribe('notebooksChanged', NotesFeature.initialize);

        LoggingService.info('[NotesMain] Notes page initialization complete.', { functionName });

    } catch (error) {
        LoggingService.critical('[NotesMain] A critical error occurred during Notes page initialization.', error, { functionName });
        // You can add a UI error message here if you want
        const editor = document.getElementById('noteEditor');
        if (editor) {
            editor.innerHTML = '<p class="text-red-500 text-center p-8">Could not load the Notes app. Please check the console for errors and try refreshing the page.</p>';
            editor.classList.remove('hidden');
        }
    }
});