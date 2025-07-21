// notes_event_handlers.js
// This file is responsible for handling all user-driven events for the Notes UI.

import LoggingService from './loggingService.js';
import * as NoteService from './noteService.js';
import { setActiveNote, setActiveNotebook, renderAll } from './feature_notes.js';
import { renderNoteDetail } from './notes_rendering.js';

// --- DOM Element References ---
let newNoteBtn, newNotebookBtn, noteTitleInput, noteContentTextarea, deleteNoteBtn;
let markdownToggle, editorViewBtn, splitViewBtn, previewViewBtn;
let markdownEditorArea, markdownPreviewArea;
let mainSidebar, mainSidebarToggle;
let notesListSidebar, notesListToggle;
let markdownResizer;


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

function handleMarkdownToggleChange(event) {
    const activeNoteId = window.NotesApp.getActiveNoteId();
    if (!activeNoteId) {
        event.target.checked = !event.target.checked; 
        return;
    }
    const isMarkdown = event.target.checked;
    NoteService.updateNote(activeNoteId, { isMarkdown });
    
    renderNoteDetail(activeNoteId); 
    
    if (isMarkdown) {
        handleViewModeChange('editor');
    }
}

function handleMarkdownInput() {
    if (!markdownEditorArea || !markdownPreviewArea) return;
    const rawMarkdown = markdownEditorArea.value;
    const dirtyHtml = marked.parse(rawMarkdown);
    const cleanHtml = DOMPurify.sanitize(dirtyHtml);
    markdownPreviewArea.innerHTML = cleanHtml;
}

function handleViewModeChange(mode) {
    handleNoteUpdate();

    if (!markdownEditorArea || !markdownPreviewArea || !editorViewBtn || !splitViewBtn || !previewViewBtn) return;
    
    const buttons = [editorViewBtn, splitViewBtn, previewViewBtn];
    buttons.forEach(btn => btn.classList.remove('bg-sky-500', 'text-white'));
    
    const editorPane = markdownEditorArea;
    const previewPane = markdownPreviewArea;
    const resizer = markdownResizer;

    resizer.classList.add('hidden');
    editorPane.classList.remove('hidden', 'w-full', 'w-1/2');
    previewPane.classList.remove('hidden', 'w-full', 'w-1/2');

    if (mode === 'editor') {
        editorPane.classList.add('w-full');
        previewPane.classList.add('hidden');
        editorViewBtn.classList.add('bg-sky-500', 'text-white');
    } else if (mode === 'preview') {
        editorPane.classList.add('hidden');
        previewPane.classList.add('w-full');
        previewViewBtn.classList.add('bg-sky-500', 'text-white');
    } else { // Split view
        editorPane.classList.add('w-1/2');
        previewPane.classList.add('w-1/2');
        resizer.classList.remove('hidden');
        splitViewBtn.classList.add('bg-sky-500', 'text-white');
    }
}

// --- Simplified and Corrected Sidebar Handlers ---

function toggleSidebar(sidebarEl, buttonEl, storageKey) {
    if (!sidebarEl || !buttonEl) return;
    const icon = buttonEl.querySelector('i');
    
    const isNowCollapsed = sidebarEl.classList.toggle('notes-sidebar-collapsed');
    if (icon) icon.classList.toggle('sidebar-toggle-rotated');
    
    localStorage.setItem(storageKey, isNowCollapsed);
    LoggingService.debug(`[NotesEventHandlers] Toggled sidebar ${storageKey}. Collapsed: ${isNowCollapsed}`);
}

function initResizer(resizer, leftPane, rightPane) {
    let x = 0;
    let leftWidth = 0;

    const mouseDownHandler = function (e) {
        x = e.clientX;
        leftWidth = leftPane.getBoundingClientRect().width;

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
        
        document.body.classList.add('is-resizing-notes');
        resizer.classList.add('is-resizing');
    };

    const mouseMoveHandler = function (e) {
        const dx = e.clientX - x;
        const newLeftWidth = leftWidth + dx;
        const totalWidth = leftPane.parentElement.getBoundingClientRect().width;
        
        let newLeftPercent = (newLeftWidth / totalWidth) * 100;
        
        if (newLeftPercent < 10) newLeftPercent = 10;
        if (newLeftPercent > 90) newLeftPercent = 90;

        leftPane.style.width = `${newLeftPercent}%`;
        rightPane.style.width = `${100 - newLeftPercent}%`;
    };

    const mouseUpHandler = function () {
        document.body.classList.remove('is-resizing-notes');
        resizer.classList.remove('is-resizing');
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    };

    resizer.addEventListener('mousedown', mouseDownHandler);
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

    // --- Markdown Editor Elements ---
    markdownToggle = document.getElementById('markdownToggle'); // FIX: Re-added this line
    markdownEditorArea = document.getElementById('markdownEditorArea');
    markdownPreviewArea = document.getElementById('markdownPreviewArea');
    editorViewBtn = document.getElementById('editorViewBtn');
    splitViewBtn = document.getElementById('splitViewBtn');
    previewViewBtn = document.getElementById('previewViewBtn');

    if (markdownToggle) markdownToggle.addEventListener('change', handleMarkdownToggleChange); // FIX: Re-added this line
    if(markdownEditorArea) markdownEditorArea.addEventListener('blur', handleNoteUpdate);
    if(markdownEditorArea) markdownEditorArea.addEventListener('input', handleMarkdownInput);
    if(editorViewBtn) editorViewBtn.addEventListener('click', () => handleViewModeChange('editor'));
    if(splitViewBtn) splitViewBtn.addEventListener('click', () => handleViewModeChange('split'));
    if(previewViewBtn) previewViewBtn.addEventListener('click', () => handleViewModeChange('preview'));
    
    // --- Collapsible and Resizable UI Elements ---
    mainSidebar = document.getElementById('notesMainSidebar');
    mainSidebarToggle = document.getElementById('mainSidebarToggle');
    notesListSidebar = document.getElementById('notesListSidebar');
    notesListToggle = document.getElementById('notesListToggle');
    markdownResizer = document.getElementById('markdownResizer');

    if (mainSidebarToggle && mainSidebar) {
        mainSidebarToggle.addEventListener('click', () => toggleSidebar(mainSidebar, mainSidebarToggle, 'notesMainSidebarCollapsed'));
    }
    if (notesListToggle && notesListSidebar) {
        notesListToggle.addEventListener('click', () => toggleSidebar(notesListSidebar, notesListToggle, 'notesListSidebarCollapsed'));
    }

    if (localStorage.getItem('notesMainSidebarCollapsed') === 'true') {
        toggleSidebar(mainSidebar, mainSidebarToggle, 'notesMainSidebarCollapsed');
    }
    if (localStorage.getItem('notesListSidebarCollapsed') === 'true') {
        toggleSidebar(notesListSidebar, notesListToggle, 'notesListSidebarCollapsed');
    }

    if (markdownResizer && markdownEditorArea && markdownPreviewArea) {
        initResizer(markdownResizer, markdownEditorArea, markdownPreviewArea);
    }

    LoggingService.info('[NotesEventHandlers] Event listeners setup complete.', { functionName });
}