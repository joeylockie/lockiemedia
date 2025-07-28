// notes_rendering.js
// This file is responsible for all direct DOM manipulation to render the Notes UI.

import * as NoteService from './noteService.js';
import LoggingService from './loggingService.js';

// --- DOM Element References ---
let notebooksListEl, notesListEl, noteEditorEl, noteTitleInput;
let richTextEditorContainer, noteContentEditable, richTextToolbar;
let currentNotebookTitleEl, notesCountEl;

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
    richTextEditorContainer = document.getElementById('richTextEditorContainer');
    noteContentEditable = document.getElementById('noteContentEditable');
    richTextToolbar = document.getElementById('richTextToolbar');
    
    LoggingService.debug('[NotesRendering] DOM elements initialized.', { module: 'notes_rendering' });
}

/**
 * Renders the list of notebooks in the sidebar.
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
 */
export function renderNotesList(activeNotebookId, activeNoteId, onNoteSelect) {
    if (!notesListEl) return;

    const notes = activeNotebookId === 'all' ? NoteService.getNotes() : NoteService.getNotes(activeNotebookId);
    
    // New sorting logic: pinned notes first, then by most recently updated
    notes.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    notesListEl.innerHTML = '';

    if (notes.length === 0) {
        notesListEl.innerHTML = `<p class="text-sm text-slate-400 text-center p-4">No notes in this notebook.</p>`;
    } else {
        notes.forEach(note => {
            const noteDiv = document.createElement('div');
            const colorClass = note.color && note.color !== 'default' ? `note-color-border-${note.color}` : 'border-transparent';
            noteDiv.className = `note-item block p-4 rounded-lg bg-slate-800 hover:bg-slate-700 border-l-4 cursor-pointer group relative ${note.id === activeNoteId ? 'active' : ''} ${colorClass}`;
            noteDiv.onclick = () => onNoteSelect(note.id);

            // Add Pin button
            const pinBtn = document.createElement('button');
            pinBtn.className = 'note-pin-btn';
            pinBtn.innerHTML = `<i class="fas fa-thumbtack"></i>`;
            pinBtn.title = note.isPinned ? 'Unpin note' : 'Pin note';
            if (note.isPinned) {
                pinBtn.classList.add('pinned');
            }
            pinBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent note selection when pinning
                NoteService.updateNote(note.id, { isPinned: !note.isPinned });
            });
            noteDiv.appendChild(pinBtn);

            const title = document.createElement('h3');
            title.className = 'font-semibold text-slate-100 truncate';
            title.textContent = note.title;

            const snippet = document.createElement('p');
            snippet.className = 'text-sm text-slate-400 truncate mt-1';
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = note.content || '';
            snippet.textContent = (tempDiv.textContent || tempDiv.innerText || 'No content').substring(0, 100);

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
 * Renders the details of the active note.
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

    noteEditorEl.classList.remove('hidden');
    if (noteTitleInput) noteTitleInput.value = note.title;

    // Always show rich text editor
    richTextEditorContainer.classList.remove('hidden');
    noteContentEditable.innerHTML = note.content || '';
}