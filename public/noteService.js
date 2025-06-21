// noteService.js
// This service handles all logic related to managing notes and notebooks,
// including local storage persistence.

import LoggingService from './loggingService.js';
import AppStore from './store.js';

// --- Private Helper Functions ---

// The _loadData and _saveData functions are no longer needed as AppStore handles persistence.

// --- Notebook Functions ---

export function getNotebooks() {
    if (!AppStore) return [];
    return AppStore.getNotebooks();
}

export function addNotebook(name) {
    const functionName = 'addNotebook (NoteService)';
    if (!name || !name.trim()) {
        LoggingService.warn('[NoteService] Attempted to add a notebook with an empty name.', { functionName });
        return null;
    }
    const notebooks = getNotebooks();
    if (notebooks.some(nb => nb.name.toLowerCase() === name.trim().toLowerCase())) {
        LoggingService.warn(`[NoteService] Notebook with name "${name.trim()}" already exists.`, { functionName });
        // Optionally publish a user message via EventBus if desired
        return null;
    }

    const newNotebook = {
        id: `nb_${Date.now()}`,
        name: name.trim(),
        createdAt: new Date().toISOString()
    };
    const updatedNotebooks = [...notebooks, newNotebook];
    AppStore.setNotebooks(updatedNotebooks, functionName);
    LoggingService.info(`[NoteService] Notebook added: "${newNotebook.name}"`, { functionName, newNotebook });
    return newNotebook;
}

export function deleteNotebook(notebookId) {
    const functionName = 'deleteNotebook (NoteService)';
    if (!notebookId || notebookId === 'all') {
        LoggingService.warn('[NoteService] Invalid notebook ID provided for deletion.', { functionName, notebookId });
        return false;
    }

    let notebooks = getNotebooks();
    let notes = getNotes(); // Get all notes

    const notebookExists = notebooks.some(nb => nb.id === notebookId);
    if (!notebookExists) {
        LoggingService.warn(`[NoteService] Notebook with ID ${notebookId} not found for deletion.`, { functionName, notebookId });
        return false;
    }

    const updatedNotebooks = notebooks.filter(nb => nb.id !== notebookId);
    const updatedNotes = notes.filter(note => note.notebookId !== notebookId);

    // Persist both changes. The AppStore's save method persists the entire state,
    // so we update both stores locally before the final save is triggered by the second call.
    AppStore.setNotebooks(updatedNotebooks, `${functionName}:notebooks`);
    AppStore.setNotes(updatedNotes, `${functionName}:notes`);

    LoggingService.info(`[NoteService] Notebook with ID ${notebookId} and its associated notes have been deleted.`, { functionName, notebookId });
    return true;
}


// --- Note Functions ---

export function getNotes(notebookId = null) {
    if (!AppStore) return [];
    const allNotes = AppStore.getNotes();
    if (notebookId) {
        return allNotes.filter(note => note.notebookId === notebookId);
    }
    return allNotes;
}

export function getNoteById(noteId) {
    const notes = getNotes();
    return notes.find(note => note.id === noteId);
}

export function addNote({ title, content, notebookId }) {
    const functionName = 'addNote (NoteService)';
    if (!title || !title.trim()) {
        LoggingService.warn('[NoteService] Attempted to add a note with an empty title.', { functionName });
        return null;
    }
    const notes = getNotes();
    const newNote = {
        id: `note_${Date.now()}`,
        title: title.trim(),
        content: content || '',
        notebookId: notebookId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    notes.unshift(newNote); // Add to the beginning of the array
    AppStore.setNotes(notes, functionName);
    LoggingService.info(`[NoteService] Note added: "${newNote.title}"`, { functionName, newNote });
    return newNote;
}

export function updateNote(noteId, { title, content, notebookId }) {
    const functionName = 'updateNote (NoteService)';
    const notes = getNotes();
    const noteIndex = notes.findIndex(note => note.id === noteId);
    if (noteIndex === -1) {
        LoggingService.error(`[NoteService] Note with ID ${noteId} not found for update.`, new Error("NoteNotFound"), { functionName, noteId });
        return null;
    }
    const updatedNote = {
        ...notes[noteIndex],
        title: title.trim(),
        content: content,
        // The notebookId is not typically updated from the note editor itself,
        // but we include it for completeness.
        notebookId: notebookId, 
        updatedAt: new Date().toISOString()
    };
    notes[noteIndex] = updatedNote;
    AppStore.setNotes(notes, functionName);
    LoggingService.info(`[NoteService] Note updated: "${updatedNote.title}"`, { functionName, updatedNote });
    return updatedNote;
}

export function deleteNote(noteId) {
    const functionName = 'deleteNote (NoteService)';
    let notes = getNotes();
    const initialLength = notes.length;
    notes = notes.filter(note => note.id !== noteId);
    if (notes.length < initialLength) {
        AppStore.setNotes(notes, functionName);
        LoggingService.info(`[NoteService] Note with ID ${noteId} deleted.`, { functionName, noteId });
        return true;
    }
    LoggingService.warn(`[NoteService] Note with ID ${noteId} not found for deletion.`, { functionName, noteId });
    return false;
}

LoggingService.info("noteService.js loaded and refactored to use AppStore.", { module: 'noteService' });