// notes_rendering.js
// This file is responsible for all direct DOM manipulation to render the Notes UI.

import * as NoteService from './noteService.js';
import LoggingService from './loggingService.js';

// --- DOM Element References ---
let notebooksListEl, notesListEl, noteEditorEl, noteTitleInput;
let plainTextEditor, markdownEditorContainer, markdownEditorArea, markdownPreviewArea;
let markdownToggle, markdownViewToggles, currentNotebookTitleEl, notesCountEl;

/**
 * Initializes and caches the core DOM elements for the notes feature.
 */
export function initializeDOMElements() {
    notebooksListEl = document.getElementById('notebooksList');
    notesListEl = document.getElementById('notesList');
    noteEditorEl = document.getElementById('noteEditor');
    noteTitleInput = document.getElementById('noteTitleInput');
    currentNotebookTitleEl = document.getElementById('currentNotebookTitle');
    notesCountEl = document.getElementById('notesCount');

    // Editor-specific elements
    plainTextEditor = document.getElementById('noteContentTextarea');
    markdownEditorContainer = document.getElementById('markdownEditorContainer');
    markdownEditorArea = document.getElementById('markdownEditorArea');
    markdownPreviewArea = document.getElementById('markdownPreviewArea');
    markdownToggle = document.getElementById('markdownToggle');
    markdownViewToggles = document.getElementById('markdownViewToggles');
    
    LoggingService.debug('[NotesRendering] DOM elements initialized.', { module: 'notes_rendering' });
}

/**
 * Renders the list of notebooks in the sidebar.
 * @param {string} activeNotebookId - The ID of the currently selected notebook.
 * @param {function} onNotebookSelect - Callback function for when a notebook is clicked.
 * @param {function} onNotebookDelete - Callback function for when a notebook's delete button is clicked.
 */
export function renderNotebooks(activeNotebookId, onNotebookSelect, onNotebookDelete) {
    if (!notebooksListEl) return;

    const notebooks = NoteService.getNotebooks();
    notebooksListEl.innerHTML = '';

    const allNotesItem = document.createElement('li');
    const allNotesLink = document.createElement('a');
    allNotesLink.href = '#';
    allNotesLink.className = `notebook-item flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 hover:bg-slate-700 ${activeNotebookId === 'all' ? 'active' : ''}`;
    allNotesLink.innerHTML = `<i class="fas fa-book-open w-5 mr-3"></i><span>All Notes</span>`;
    allNotesLink.onclick = (e) => {
        e.preventDefault();
        onNotebookSelect('all');
    };
    allNotesItem.appendChild(allNotesLink);
    notebooksListEl.appendChild(allNotesItem);

    notebooks.forEach(nb => {
        const li = document.createElement('li');
        li.className = 'group';

        const link = document.createElement('a');
        link.href = '#';
        link.className = `relative notebook-item flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors duration-200 hover:bg-slate-700 ${activeNotebookId === nb.id ? 'active' : ''}`;
        
        const contentSpan = document.createElement('span');
        contentSpan.className = 'flex items-center truncate';
        contentSpan.innerHTML = `<i class="fas fa-book w-5 mr-3"></i><span class="truncate">${nb.name}</span>`;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt fa-xs"></i>';
        deleteBtn.title = `Delete notebook "${nb.name}"`;
        deleteBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            onNotebookDelete(nb.id, nb.name);
        };

        link.appendChild(contentSpan);
        link.appendChild(deleteBtn);
        
        link.onclick = (e) => {
            e.preventDefault();
            onNotebookSelect(nb.id);
        };

        li.appendChild(link);
        notebooksListEl.appendChild(li);
    });
}

/**
 * Renders the list of notes for the active notebook.
 * @param {string} activeNotebookId - The ID of the currently selected notebook.
 * @param {string} activeNoteId - The ID of the currently selected note.
 * @param {function} onNoteSelect - Callback function for when a note is clicked.
 */
export function renderNotesList(activeNotebookId, activeNoteId, onNoteSelect) {
    if (!notesListEl) return;

    const notes = activeNotebookId === 'all' ? NoteService.getNotes() : NoteService.getNotes(activeNotebookId);
    notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    notesListEl.innerHTML = '';

    if (notes.length === 0) {
        notesListEl.innerHTML = `<p class="text-sm text-slate-400 text-center p-4">No notes in this notebook.</p>`;
    } else {
        notes.forEach(note => {
            const noteDiv = document.createElement('div');
            noteDiv.className = `note-item block p-4 rounded-lg bg-slate-800 hover:bg-slate-700 border-l-4 border-transparent cursor-pointer ${note.id === activeNoteId ? 'active' : ''}`;
            noteDiv.onclick = () => onNoteSelect(note.id);

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
        if (activeNotebookId === 'all') {
            currentNotebookTitleEl.textContent = 'All Notes';
        } else {
            const notebook = NoteService.getNotebooks().find(nb => nb.id === activeNotebookId);
            currentNotebookTitleEl.textContent = notebook ? notebook.name : 'Notes';
        }
    }

    if (notesCountEl) {
        notesCountEl.textContent = `${notes.length} note${notes.length !== 1 ? 's' : ''}`;
    }
}

/**
 * Renders the details of the active note, showing the correct editor.
 * @param {string} activeNoteId - The ID of the currently selected note.
 */
export function renderNoteDetail(activeNoteId) {
    if (!noteEditorEl) return;

    if (!activeNoteId) {
        noteEditorEl.classList.add('hidden');
        return;
    }

    const note = NoteService.getNoteById(activeNoteId);
    if (!note) {
        noteEditorEl.classList.add('hidden');
        return;
    }

    // Show the main editor pane
    noteEditorEl.classList.remove('hidden');

    // Set the title and the Markdown toggle state
    if (noteTitleInput) noteTitleInput.value = note.title;
    if (markdownToggle) markdownToggle.checked = note.isMarkdown;

    // Show or hide the correct editor based on the note's state
    if (note.isMarkdown) {
        plainTextEditor.classList.add('hidden');
        markdownEditorContainer.classList.remove('hidden');
        markdownViewToggles.classList.remove('hidden');
        
        // Populate the markdown editor and trigger the initial render
        markdownEditorArea.value = note.content || '';
        const dirtyHtml = marked.parse(note.content || '');
        markdownPreviewArea.innerHTML = DOMPurify.sanitize(dirtyHtml);
    } else {
        plainTextEditor.classList.remove('hidden');
        markdownEditorContainer.classList.add('hidden');
        markdownViewToggles.classList.add('hidden');

        // Populate the plain text editor
        plainTextEditor.value = note.content || '';
    }
}