// feature_notes.js
// Manages the UI state and orchestrates rendering and events for the Notes feature.

import LoggingService from './loggingService.js';
import * as NoteService from './noteService.js';

// Import the new modularized functions
import { initializeDOMElements, renderNotebooks, renderNotesList, renderNoteDetail } from './notes_rendering.js';
import { setupEventListeners } from './notes_event_handlers.js';

// --- Internal State ---
let _activeNotebookId = 'all';
let _activeNoteId = null;

// --- Rendering Orchestration ---

/**
 * Renders the entire UI by calling the specific rendering functions.
 */
export function renderAll() {
    // Pass the handler functions to the rendering module
    renderNotebooks(_activeNotebookId, setActiveNotebook, handleDeleteNotebook);
    renderNotesList(_activeNotebookId, _activeNoteId, setActiveNote);
    renderNoteDetail(_activeNoteId);
}

// --- State Management Functions ---

export function setActiveNotebook(notebookId) {
    if (_activeNotebookId === notebookId) return;
    _activeNotebookId = notebookId;
    _activeNoteId = null; // Deselect active note when changing notebooks
    LoggingService.info(`[NotesFeature] Active notebook set to: ${notebookId}`, { functionName: 'setActiveNotebook' });
    renderAll();
}

export function setActiveNote(noteId) {
    // If the note is already active, do nothing. If noteId is null, deselect.
    if (_activeNoteId === noteId) return;
    
    _activeNoteId = noteId;
    
    if (noteId) {
        LoggingService.info(`[NotesFeature] Active note set to: ${noteId}`, { functionName: 'setActiveNote' });
        // Only re-render the list and detail pane, not the whole UI
        renderNotesList(_activeNotebookId, _activeNoteId, setActiveNote);
        renderNoteDetail(_activeNoteId);
    } else {
        LoggingService.info(`[NotesFeature] Active note deselected.`, { functionName: 'setActiveNote' });
        renderAll(); // Re-render everything to show the "no note selected" state
    }
}

// This is a new handler function that will be passed to the rendering module
function handleDeleteNotebook(notebookId, notebookName) {
    if (!notebookId) return;

    if (confirm(`Are you sure you want to delete the notebook "${notebookName}"?\n\nAll notes within this notebook will also be permanently deleted.`)) {
        const success = NoteService.deleteNotebook(notebookId);
        if (success) {
            if (_activeNotebookId === notebookId) {
                setActiveNotebook('all');
            } else {
                renderAll();
            }
        }
    }
}

// --- Main Initialization ---

async function initialize() { 
    const functionName = 'initialize (NotesFeature)';
    
    if (!document.querySelector('body#notesPage')) {
        LoggingService.debug('[NotesFeature] Not on notes page. Skipping initialization.', { functionName });
        return;
    }
    
    try {
        document.body.style.visibility = 'visible';
        LoggingService.info('[NotesFeature] Initializing...', { functionName });

        // Initialize DOM elements from the rendering module
        initializeDOMElements();
        
        // Setup event listeners from the event handler module
        setupEventListeners();

        // Initial render
        renderAll();
        
        LoggingService.info('[NotesFeature] Initialized.', { functionName });
    } catch (error) {
        LoggingService.critical('[NotesFeature] Error during initialization.', error, { functionName });
    }
}

function updateUIVisibility() {
    // This function can be expanded if there are global UI elements related to Notes
    // on other pages that need to be shown or hidden.
}

// --- Public API for the NotesApp ---
// We export the functions that other modules need to call.
export const NotesFeature = {
    initialize,
    updateUIVisibility,
    // Functions needed by other modules (like event handlers)
    getActiveNotebookId: () => _activeNotebookId,
    getActiveNoteId: () => _activeNoteId,
    setActiveNote,
    setActiveNotebook,
    renderAll,
    renderNotesList, // Expose for more granular updates
};