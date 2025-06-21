// notes_event_handlers.js
// This file is responsible for handling all user-driven events for the Notes UI.

import LoggingService from './loggingService.js';
import * as NoteService from './noteService.js';
// --- MODIFICATION START ---
// Import orchestrator functions from feature_notes
import { setActiveNote, setActiveNotebook, renderAll } from './feature_notes.js';
// Import the specific rendering function we need from notes_rendering
import { renderNoteDetail } from './notes_rendering.js';
// --- MODIFICATION END ---


// --- DOM Element References ---
// We'll get these elements within the setup function to ensure they exist.
let newNoteBtn, newNotebookBtn, noteTitleInput, noteContentTextarea, deleteNoteBtn;
let markdownToggle, markdownViewToggles, editorViewBtn, splitViewBtn, previewViewBtn;
let markdownEditorArea, markdownPreviewArea;


// --- Event Handler Functions ---

function handleNewNote() {
    // The active notebook is managed in feature_notes.js, so we need to get it from there.
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

    const note = NoteService.getNoteById(activeNoteId);
    if (!note) return;
    
    // Determine which text area is active
    const content = note.isMarkdown 
        ? markdownEditorArea.value 
        : noteContentTextarea.value;

    const title = noteTitleInput ? noteTitleInput.value : '';

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

// --- NEW Markdown Editor Handlers ---

function handleMarkdownToggleChange(event) {
    const activeNoteId = window.NotesApp.getActiveNoteId();
    if (!activeNoteId) {
        event.target.checked = !event.target.checked; // Revert the toggle
        return;
    }
    const isMarkdown = event.target.checked;
    NoteService.updateNote(activeNoteId, { isMarkdown });
    // Re-render the detail pane to switch between plain and markdown editors
    renderNoteDetail(activeNoteId); 
}

function handleMarkdownInput() {
    if (!markdownEditorArea || !markdownPreviewArea) return;
    const rawMarkdown = markdownEditorArea.value;
    // Use the libraries we added to notes.html
    const dirtyHtml = marked.parse(rawMarkdown);
    const cleanHtml = DOMPurify.sanitize(dirtyHtml);
    markdownPreviewArea.innerHTML = cleanHtml;
}

function handleViewModeChange(mode) {
    if (!markdownEditorArea || !markdownPreviewArea) return;
    
    const buttons = [editorViewBtn, splitViewBtn, previewViewBtn];
    buttons.forEach(btn => btn.classList.remove('bg-sky-500', 'text-white'));
    
    const editorPane = markdownEditorArea.parentElement;
    const previewPane = markdownPreviewArea.parentElement;

    if (mode === 'editor') {
        editorPane.classList.remove('hidden', 'w-1/2');
        editorPane.classList.add('w-full');
        previewPane.classList.add('hidden');
        editorViewBtn.classList.add('bg-sky-500', 'text-white');
    } else if (mode === 'preview') {
        editorPane.classList.add('hidden');
        previewPane.classList.remove('hidden', 'w-1/2');
        previewPane.classList.add('w-full');
        previewViewBtn.classList.add('bg-sky-500', 'text-white');
    } else { // Split view
        editorPane.classList.remove('hidden', 'w-full');
        editorPane.classList.add('w-1/2');
        previewPane.classList.remove('hidden', 'w-full');
        previewPane.classList.add('w-1/2');
        splitViewBtn.classList.add('bg-sky-500', 'text-white');
    }
}


/**
 * Attaches all the necessary event listeners to the DOM elements.
 */
export function setupEventListeners() {
    const functionName = 'setupEventListeners (NotesEventHandlers)';
    LoggingService.info('[NotesEventHandlers] Setting up event listeners...', { functionName });

    // --- Standard Note Elements ---
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

    // --- NEW Markdown Editor Elements ---
    markdownToggle = document.getElementById('markdownToggle');
    markdownViewToggles = document.getElementById('markdownViewToggles');
    editorViewBtn = document.getElementById('editorViewBtn');
    splitViewBtn = document.getElementById('splitViewBtn');
    previewViewBtn = document.getElementById('previewViewBtn');
    markdownEditorArea = document.getElementById('markdownEditorArea');
    markdownPreviewArea = document.getElementById('markdownPreviewArea');

    if(markdownToggle) markdownToggle.addEventListener('change', handleMarkdownToggleChange);
    if(markdownEditorArea) markdownEditorArea.addEventListener('input', handleMarkdownInput);
    if(editorViewBtn) editorViewBtn.addEventListener('click', () => handleViewModeChange('editor'));
    if(splitViewBtn) splitViewBtn.addEventListener('click', () => handleViewModeChange('split'));
    if(previewViewBtn) previewViewBtn.addEventListener('click', () => handleViewModeChange('preview'));
    
    LoggingService.info('[NotesEventHandlers] Event listeners setup complete.', { functionName });
}