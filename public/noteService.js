// noteService.js
// This service handles all logic related to managing notes and notebooks,
// including local storage persistence.

import LoggingService from './loggingService.js';
import AppStore from './store.js';

const NOTES_KEY = 'notes_v1';
const NOTEBOOKS_KEY = 'notebooks_v1';

// --- Private Helper Functions ---

function _loadData(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        LoggingService.error(`[NoteService] Error loading data from localStorage for key: ${key}`, error, { functionName: '_loadData' });
        return [];
    }
}

function _saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        LoggingService.error(`[NoteService] Error saving data to localStorage for key: ${key}`, error, { functionName: '_saveData' });
    }
}


// --- Notebook Functions ---

export function getNotebooks() {
    return _loadData(NOTEBOOKS_KEY);
}

export function addNotebook(name) {
    if (!name || !name.trim()) {
        LoggingService.warn('[NoteService] Attempted to add a notebook with an empty name.', { functionName: 'addNotebook' });
        return null;
    }
    const notebooks = getNotebooks();
    const newNotebook = {
        id: `nb_${Date.now()}`,
        name: name.trim(),
        createdAt: new Date().toISOString()
    };
    notebooks.push(newNotebook);
    _saveData(NOTEBOOKS_KEY, notebooks);
    LoggingService.info(`[NoteService] Notebook added: "${newNotebook.name}"`, { functionName: 'addNotebook', newNotebook });
    return newNotebook;
}


// --- Note Functions ---

export function getNotes(notebookId = null) {
    const allNotes = _loadData(NOTES_KEY);
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
    if (!title || !title.trim()) {
        LoggingService.warn('[NoteService] Attempted to add a note with an empty title.', { functionName: 'addNote' });
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
    _saveData(NOTES_KEY, notes);
    LoggingService.info(`[NoteService] Note added: "${newNote.title}"`, { functionName: 'addNote', newNote });
    return newNote;
}

export function updateNote(noteId, { title, content, notebookId }) {
    const notes = getNotes();
    const noteIndex = notes.findIndex(note => note.id === noteId);
    if (noteIndex === -1) {
        LoggingService.error(`[NoteService] Note with ID ${noteId} not found for update.`, new Error("NoteNotFound"), { functionName: 'updateNote', noteId });
        return null;
    }
    const updatedNote = {
        ...notes[noteIndex],
        title: title.trim(),
        content: content,
        notebookId: notebookId,
        updatedAt: new Date().toISOString()
    };
    notes[noteIndex] = updatedNote;
    _saveData(NOTES_KEY, notes);
    LoggingService.info(`[NoteService] Note updated: "${updatedNote.title}"`, { functionName: 'updateNote', updatedNote });
    return updatedNote;
}

export function deleteNote(noteId) {
    let notes = getNotes();
    const initialLength = notes.length;
    notes = notes.filter(note => note.id !== noteId);
    if (notes.length < initialLength) {
        _saveData(NOTES_KEY, notes);
        LoggingService.info(`[NoteService] Note with ID ${noteId} deleted.`, { functionName: 'deleteNote', noteId });
        return true;
    }
    LoggingService.warn(`[NoteService] Note with ID ${noteId} not found for deletion.`, { functionName: 'deleteNote', noteId });
    return false;
}

LoggingService.info("noteService.js loaded.", { module: 'noteService' });