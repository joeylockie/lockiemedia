// notes_event_handlers.js
// This file is responsible for handling all user-driven events for the Notes UI.

import LoggingService from './loggingService.js';
import * as NoteService from './noteService.js';
import { setActiveNote, setActiveNotebook, renderNoteDetail } from './feature_notes.js';

// --- DOM Element References ---
let newNoteBtn, newNotebookBtn, noteTitleInput, noteContentTextarea, deleteNoteBtn;
let markdownToggle, markdownViewToggles, editorViewBtn, splitViewBtn, previewViewBtn;
let markdownEditorArea, markdownPreviewArea;


// --- Event Handler Functions ---

function handleNewNote() {
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
    
    window.NotesApp.renderNotesList();
}

function handleDeleteNote() {
    const activeNoteId = window.NotesApp.getActiveNoteId();
    if (!activeNoteId) return;

    if (confirm(`Are you sure you want to delete this note?`)) {
        NoteService.deleteNote(activeNoteId);
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
    
    if (mode === 'editor') {
        markdownEditorArea.parentElement.classList.remove('w-1/2');
        markdownEditorArea.parentElement.classList.add('w-full');
        markdownPreviewArea.parentElement.classList.add('hidden');
        editorViewBtn.classList.add('bg-sky-500', 'text-white');
    } else if (mode === 'preview') {
        markdownEditorArea.parentElement.classList.add('hidden');
        markdownPreviewArea.parentElement.classList.remove('w-1/2');
        markdownPreviewArea.parentElement.classList.add('w-full');
        markdownPreviewArea.parentElement.classList.remove('hidden');
        previewViewBtn.classList.add('bg-sky-500', 'text-white');
    } else { // Split view
        markdownEditorArea.parentElement.classList.remove('hidden', 'w-full');
        markdownEditorArea.parentElement.classList.add('w-1/2');
        markdownPreviewArea.parentElement.classList.remove('hidden', 'w-full');
        markdownPreviewArea.parentElement.classList.add('w-1/2');
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