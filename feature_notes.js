// feature_notes.js
// Manages the UI and logic for the Notes feature.

import { isFeatureEnabled } from './featureFlagService.js';
import LoggingService from './loggingService.js';
import * as NoteService from './noteService.js';

// --- Internal State ---
let _activeNotebookId = 'all'; // 'all' or a notebook ID
let _activeNoteId = null;

// --- DOM Element References (populated in initialize) ---
let notebooksListEl, notesListEl, noteEditorEl;
let newNoteBtn, newNotebookBtn; // Assuming these buttons will exist
let noteTitleInput, noteContentTextarea;
let currentNotebookTitleEl, notesCountEl;
let deleteNoteBtn;

// --- Rendering Functions ---

function renderNotebooks() {
    if (!notebooksListEl) return;

    const notebooks = NoteService.getNotebooks();
    notebooksListEl.innerHTML = ''; // Clear existing list

    // "All Notes" item
    const allNotesItem = document.createElement('li');
    const allNotesLink = document.createElement('a');
    allNotesLink.href = '#';
    allNotesLink.className = `notebook-item flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 hover:bg-slate-700 ${_activeNotebookId === 'all' ? 'active' : ''}`;
    allNotesLink.innerHTML = `<i class="fas fa-book-open w-5 mr-3"></i><span>All Notes</span>`;
    allNotesLink.onclick = (e) => {
        e.preventDefault();
        setActiveNotebook('all');
    };
    allNotesItem.appendChild(allNotesLink);
    notebooksListEl.appendChild(allNotesItem);

    // Render actual notebooks
    notebooks.forEach(nb => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = '#';
        link.className = `notebook-item flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 hover:bg-slate-700 ${_activeNotebookId === nb.id ? 'active' : ''}`;
        link.innerHTML = `<i class="fas fa-book w-5 mr-3"></i><span>${nb.name}</span>`;
        link.onclick = (e) => {
            e.preventDefault();
            setActiveNotebook(nb.id);
        };
        li.appendChild(link);
        notebooksListEl.appendChild(li);
    });
}

function renderNotesList() {
    if (!notesListEl) return;

    const notes = _activeNotebookId === 'all' ? NoteService.getNotes() : NoteService.getNotes(_activeNotebookId);
    notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); // Sort by most recently updated

    notesListEl.innerHTML = ''; // Clear existing list

    if (notes.length === 0) {
        notesListEl.innerHTML = `<p class="text-sm text-slate-400 text-center p-4">No notes in this notebook.</p>`;
    } else {
        notes.forEach(note => {
            const noteDiv = document.createElement('div');
            noteDiv.className = `note-item block p-4 rounded-lg bg-slate-800 hover:bg-slate-700 border-l-4 border-transparent cursor-pointer ${note.id === _activeNoteId ? 'active' : ''}`;
            noteDiv.onclick = () => {
                setActiveNote(note.id);
            };

            const title = document.createElement('h3');
            title.className = 'font-semibold text-slate-100 truncate';
            title.textContent = note.title;

            const snippet = document.createElement('p');
            snippet.className = 'text-sm text-slate-400 truncate mt-1';
            snippet.textContent = note.content ? note.content.substring(0, 100) : 'No content';

            const time = document.createElement('time');
            time.className = 'text-xs text-slate-500 mt-2 block';
            time.textContent = `Edited: ${new Date(note.updatedAt).toLocaleDateString()}`;

            noteDiv.appendChild(title);
            noteDiv.appendChild(snippet);
            noteDiv.appendChild(time);
            notesListEl.appendChild(noteDiv);
        });
    }

    if (currentNotebookTitleEl) {
        if (_activeNotebookId === 'all') {
            currentNotebookTitleEl.textContent = 'All Notes';
        } else {
            const notebook = NoteService.getNotebooks().find(nb => nb.id === _activeNotebookId);
            currentNotebookTitleEl.textContent = notebook ? notebook.name : 'Notes';
        }
    }

    if (notesCountEl) {
        notesCountEl.textContent = `${notes.length} note${notes.length !== 1 ? 's' : ''}`;
    }
}

function renderNoteDetail() {
    if (!noteEditorEl) return;

    if (!_activeNoteId) {
        noteEditorEl.classList.add('hidden');
        return;
    }

    noteEditorEl.classList.remove('hidden');
    const note = NoteService.getNoteById(_activeNoteId);

    if (!note) {
        noteEditorEl.classList.add('hidden');
        _activeNoteId = null;
        return;
    }

    if (noteTitleInput) noteTitleInput.value = note.title;
    if (noteContentTextarea) noteContentTextarea.value = note.content;
}

// --- State Management Functions ---

function setActiveNotebook(notebookId) {
    if (_activeNotebookId === notebookId) return;
    _activeNotebookId = notebookId;
    _activeNoteId = null; // Deselect active note when changing notebooks
    LoggingService.info(`[NotesFeature] Active notebook set to: ${notebookId}`, { functionName: 'setActiveNotebook' });
    renderAll();
}

function setActiveNote(noteId) {
    if (_activeNoteId === noteId) return;
    _activeNoteId = noteId;
    LoggingService.info(`[NotesFeature] Active note set to: ${noteId}`, { functionName: 'setActiveNote' });
    renderNotesList(); // Re-render list to highlight the new active note
    renderNoteDetail();
}


// --- Main UI Logic ---

function renderAll() {
    renderNotebooks();
    renderNotesList();
    renderNoteDetail();
}

function handleNewNote() {
    const newNote = NoteService.addNote({ title: 'New Note', content: '', notebookId: _activeNotebookId === 'all' ? null : _activeNotebookId });
    if (newNote) {
        setActiveNote(newNote.id);
        renderAll();
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
    if (!_activeNoteId) return;
    const title = noteTitleInput ? noteTitleInput.value : '';
    const content = noteContentTextarea ? noteContentTextarea.value : '';

    NoteService.updateNote(_activeNoteId, { title, content, notebookId: _activeNotebookId === 'all' ? null : _activeNotebookId });
    // No need to re-render everything, just the notes list to update the timestamp/snippet
    renderNotesList();
}

function handleDeleteNote() {
    if (!_activeNoteId) return;
    if (confirm(`Are you sure you want to delete this note?`)) {
        NoteService.deleteNote(_activeNoteId);
        _activeNoteId = null;
        renderAll();
    }
}

function initialize() {
    const functionName = 'initialize (NotesFeature)';
    LoggingService.info('[NotesFeature] Initializing...', { functionName });

    // Only run if we are on the notes.html page
    if (!document.querySelector('body#notesPage')) { // Assuming we add id="notesPage" to the body of notes.html
         LoggingService.debug('[NotesFeature] Not on notes page. Skipping initialization.', { functionName });
        return;
    }

    notebooksListEl = document.getElementById('notebooksList');
    notesListEl = document.getElementById('notesList');
    noteEditorEl = document.getElementById('noteEditor');
    newNoteBtn = document.getElementById('newNoteBtn');
    newNotebookBtn = document.getElementById('newNotebookBtn');
    noteTitleInput = document.getElementById('noteTitleInput');
    noteContentTextarea = document.getElementById('noteContentTextarea');
    currentNotebookTitleEl = document.getElementById('currentNotebookTitle');
    notesCountEl = document.getElementById('notesCount');
    deleteNoteBtn = document.getElementById('deleteNoteBtn');

    if (newNoteBtn) newNoteBtn.addEventListener('click', handleNewNote);
    if (newNotebookBtn) newNotebookBtn.addEventListener('click', handleNewNotebook);
    if (noteTitleInput) noteTitleInput.addEventListener('blur', handleNoteUpdate);
    if (noteContentTextarea) noteContentTextarea.addEventListener('blur', handleNoteUpdate);
    if (deleteNoteBtn) deleteNoteBtn.addEventListener('click', handleDeleteNote);

    // Initial render
    renderAll();
    
    LoggingService.info('[NotesFeature] Initialized.', { functionName });
}

function updateUIVisibility() {
    // This could be used to show/hide the "Notes" link in the main app's sidebar/navigation
    // For now, we assume if the user is on notes.html, the feature is enabled.
    const isActuallyEnabled = isFeatureEnabled('notesFeature'); // Assuming we add this flag
    // Example: document.getElementById('notes-link-in-main-app').classList.toggle('hidden', !isActuallyEnabled);
}

export const NotesFeature = {
    initialize,
    updateUIVisibility
};

LoggingService.debug("feature_notes.js loaded as ES6 module.", { module: 'feature_notes' });