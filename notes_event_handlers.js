// notes_event_handlers.js
// This file is responsible for handling all user-driven events for the Notes UI.

import LoggingService from './loggingService.js';
import * as NoteService from './noteService.js';
import { setActiveNote, setActiveNotebook } from './feature_notes.js';
import { renderNoteDetail } from './notes_rendering.js';

// --- DOM Element References ---
let newNoteBtn, newNotebookBtn, noteTitleInput, deleteNoteBtn;
let mainSidebar, mainSidebarToggle;
let notesListSidebar, notesListToggle, notesListEl;
let richTextToolbar, noteContentEditable;
let colorPaletteBtn, colorPalette; // New elements for color coding

// --- State for editor focus ---
let savedSelection;

// --- Event Handler Functions ---

function handleNewNote() {
    const activeNotebookId = window.NotesApp.getActiveNotebookId();
    NoteService.addNote({
        title: 'New Note',
        content: '',
        notebookId: activeNotebookId === 'all' ? null : activeNotebookId
    }).then(newNote => {
        if (newNote) {
            setActiveNote(newNote.id);
            if (noteTitleInput) noteTitleInput.focus();
        }
    });
}

function handleNewNotebook() {
    const name = prompt("Enter new notebook name:");
    if (name) {
        NoteService.addNotebook(name).then(newNotebook => {
            if (newNotebook) {
                setActiveNotebook(newNotebook.id);
            }
        });
    }
}

function handleNoteUpdate() {
    const activeNoteId = window.NotesApp.getActiveNoteId();
    if (!activeNoteId) return;

    const note = NoteService.getNoteById(activeNoteId);
    if (!note) return;
    
    const content = noteContentEditable.innerHTML;
    const title = noteTitleInput ? noteTitleInput.value : '';

    NoteService.updateNote(activeNoteId, { title, content });
    
    // We only re-render the list, not the whole UI, to avoid losing focus.
    window.NotesApp.renderNotesList(window.NotesApp.getActiveNotebookId(), activeNoteId, setActiveNote);
}

function handleDeleteNote() {
    const activeNoteId = window.NotesApp.getActiveNoteId();
    if (!activeNoteId) return;

    if (confirm(`Are you sure you want to delete this note?`)) {
        NoteService.deleteNote(activeNoteId);
        setActiveNote(null);
    }
}

function saveSelection() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        savedSelection = selection.getRangeAt(0);
    } else {
        savedSelection = null;
    }
}

function restoreSelection() {
    if (savedSelection) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedSelection);
    }
}

function handleRichTextCommand(command, value = null) {
    if (noteContentEditable.contains(document.activeElement)) {
       restoreSelection();
    } else {
       noteContentEditable.focus();
       restoreSelection();
    }
    
    document.execCommand(command, false, value);
    
    saveSelection();
    updateToolbarState();
}

function updateToolbarState() {
    if (!richTextToolbar) return;
    const commands = ['bold', 'italic', 'underline', 'insertOrderedList', 'insertUnorderedList'];
    commands.forEach(command => {
        const button = richTextToolbar.querySelector(`[data-command="${command}"]`);
        if (button) {
            try {
                const isActive = document.queryCommandState(command);
                button.classList.toggle('active', isActive);
            } catch (e) {
                // Ignore errors
            }
        }
    });
}

function toggleSidebar(sidebarEl, buttonEl, storageKey) {
    if (!sidebarEl || !buttonEl) return;
    const icon = buttonEl.querySelector('i');
    const isNowCollapsed = sidebarEl.classList.toggle('notes-sidebar-collapsed');
    if (icon) icon.classList.toggle('sidebar-toggle-rotated');
    localStorage.setItem(storageKey, isNowCollapsed);
    LoggingService.debug(`[NotesEventHandlers] Toggled sidebar ${storageKey}. Collapsed: ${isNowCollapsed}`);
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
    deleteNoteBtn = document.getElementById('deleteNoteBtn');
    richTextToolbar = document.getElementById('richTextToolbar');
    noteContentEditable = document.getElementById('noteContentEditable');
    mainSidebar = document.getElementById('notesMainSidebar');
    mainSidebarToggle = document.getElementById('mainSidebarToggle');
    notesListSidebar = document.getElementById('notesListSidebar');
    notesListToggle = document.getElementById('notesListToggle');
    notesListEl = document.getElementById('notesList'); // For pin clicks

    // --- New Color Coding Elements ---
    colorPaletteBtn = document.getElementById('colorPaletteBtn');
    colorPalette = document.getElementById('colorPalette');

    if (newNoteBtn) newNoteBtn.addEventListener('click', handleNewNote);
    if (newNotebookBtn) newNotebookBtn.addEventListener('click', handleNewNotebook);
    if (noteTitleInput) noteTitleInput.addEventListener('blur', handleNoteUpdate);
    if (deleteNoteBtn) deleteNoteBtn.addEventListener('click', handleDeleteNote);

    // --- Rich Text Editor Listeners ---
    if (richTextToolbar) {
        richTextToolbar.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Prevents the editor from losing focus
        });

        richTextToolbar.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            if (button.dataset.command) {
                handleRichTextCommand(button.dataset.command);
            }
        });
    }
    
    if (noteContentEditable) {
        noteContentEditable.addEventListener('blur', handleNoteUpdate);
        noteContentEditable.addEventListener('keyup', () => { saveSelection(); updateToolbarState(); });
        noteContentEditable.addEventListener('mouseup', () => { saveSelection(); updateToolbarState(); });
        noteContentEditable.addEventListener('focus', () => { saveSelection(); updateToolbarState(); });
    }

    // --- Pinning Event Listener (delegated to the list) ---
    if (notesListEl) {
        notesListEl.addEventListener('click', (e) => {
            const pinBtn = e.target.closest('.note-pin-btn');
            if (pinBtn) {
                const noteId = parseInt(pinBtn.dataset.noteId, 10);
                const note = NoteService.getNoteById(noteId);
                if (note) {
                    NoteService.updateNote(noteId, { isPinned: !note.isPinned });
                }
            }
        });
    }

    // --- Color Palette Listeners ---
    if (colorPaletteBtn) {
        colorPaletteBtn.addEventListener('click', () => {
            colorPalette.classList.toggle('hidden');
        });
    }
    if (colorPalette) {
        colorPalette.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Prevent editor from losing focus
            const swatch = e.target.closest('.color-swatch');
            if (swatch) {
                const newColor = swatch.dataset.color;
                const activeNoteId = window.NotesApp.getActiveNoteId();
                if (activeNoteId) {
                    NoteService.updateNote(activeNoteId, { color: newColor });
                }
                colorPalette.classList.add('hidden');
            }
        });
    }
    
    // --- Collapsible UI Elements ---
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

    LoggingService.info('[NotesEventHandlers] Event listeners setup complete.', { functionName });
}