// notes_event_handlers.js
// This file is responsible for handling all user-driven events for the Notes UI.

import LoggingService from './loggingService.js';
import * as NoteService from './noteService.js';
import { setActiveNote, setActiveNotebook, renderAll } from './feature_notes.js';

// --- DOM Element References ---
// We'll get these elements within the setup function to ensure they exist.
let newNoteBtn, newNotebookBtn, noteTitleInput, noteContentTextarea, deleteNoteBtn;

// --- Event Handler Functions ---

function handleNewNote() {
    // The active notebook is managed in feature_notes.js, so we need to get it from there.
    // This is a temporary coupling we can improve later if needed.
    const activeNotebookId = window.NotesApp.getActiveNotebookId(); 
    const newNote = NoteService.addNote({ 
        title: 'New Note', 
        content: '', 
        notebookId: activeNotebookId === 'all' ? null : activeNotebookId 
    });

    if (newNote) {
        setActiveNote(newNote.id);
        if(noteTitleInput) noteTitleInput.focus();
    }
}

function handleNewNotebook() {
    const name = prompt("Enter new notebook name:");
    if (name) {
        const newNotebook = NoteService.addNotebook(name);
        if (newNotebook) {
            setActiveNotebook(newNotebook.id);
        }
    }
}

function handleNoteUpdate() {
    const activeNoteId = window.NotesApp.getActiveNoteId();
    if (!activeNoteId) return;

    const title = noteTitleInput ? noteTitleInput.value : '';
    const content = noteContentTextarea ? noteContentTextarea.value : '';

    NoteService.updateNote(activeNoteId, { title, content });
    
    // We only need to re-render the notes list to update the timestamp/snippet,
    // not the whole UI, which is more efficient.
    window.NotesApp.renderNotesList();
}

function handleDeleteNote() {
    const activeNoteId = window.NotesApp.getActiveNoteId();
    if (!activeNoteId) return;

    if (confirm(`Are you sure you want to delete this note?`)) {
        NoteService.deleteNote(activeNoteId);
        // Setting activeNoteId to null is handled by setActiveNote
        setActiveNote(null);
    }
}

/**
 * Attaches all the necessary event listeners to the DOM elements.
 */
export function setupEventListeners() {
    const functionName = 'setupEventListeners (NotesEventHandlers)';
    LoggingService.info('[NotesEventHandlers] Setting up event listeners...', { functionName });

    newNoteBtn = document.getElementById('newNoteBtn');
    newNotebookBtn = document.getElementById('newNotebookBtn');
    noteTitleInput = document.getElementById('noteTitleInput');
    noteContentTextarea = document.getElementById('noteContentTextarea');
    deleteNoteBtn = document.getElementById('deleteNoteBtn');

    if (newNoteBtn) newNoteBtn.addEventListener('click', handleNewNote);
    if (newNotebookBtn) newNotebookBtn.addEventListener('click', handleNewNotebook);
    if (noteTitleInput) noteTitleInput.addEventListener('blur', handleNoteUpdate);
    if (noteContentTextarea) noteContentTextarea.addEventListener('blur', handleNoteUpdate);
    if (deleteNoteBtn) deleteNoteBtn.addEventListener('click', handleDeleteNote);
    
    LoggingService.info('[NotesEventHandlers] Event listeners setup complete.', { functionName });
}