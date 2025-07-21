// noteService.js
// This service handles all logic related to managing notes and notebooks using IndexedDB.

import LoggingService from './loggingService.js';
import AppStore from './store.js';
import db from './database.js'; // Import the database connection

// --- Notebook Functions ---

export function getNotebooks() {
    // This getter still reads from the AppStore's cache for UI speed.
    if (!AppStore) return [];
    return AppStore.getNotebooks();
}

export async function addNotebook(name) {
    const functionName = 'addNotebook (NoteService)';
    if (!name || !name.trim()) {
        LoggingService.warn('[NoteService] Attempted to add a notebook with an empty name.', { functionName });
        return null;
    }
    const existing = await db.notebooks.where('name').equalsIgnoreCase(name.trim()).first();
    if (existing) {
        LoggingService.warn(`[NoteService] Notebook with name "${name.trim()}" already exists.`, { functionName });
        return null;
    }

    const newNotebook = {
        name: name.trim(),
        createdAt: new Date().toISOString()
    };

    try {
        const newId = await db.notebooks.add(newNotebook);
        LoggingService.info(`[NoteService] Notebook added to DB: "${newNotebook.name}"`, { functionName });
        // Refresh the central store
        const allNotebooks = await db.notebooks.toArray();
        await AppStore.setNotebooks(allNotebooks);
        return { ...newNotebook, id: newId };
    } catch (error) {
        LoggingService.error('[NoteService] Error adding notebook.', error, { functionName });
        return null;
    }
}

export async function deleteNotebook(notebookId) {
    const functionName = 'deleteNotebook (NoteService)';
    if (!notebookId || notebookId === 'all') {
        LoggingService.warn('[NoteService] Invalid notebook ID provided for deletion.', { functionName, notebookId });
        return false;
    }

    try {
        // Use a transaction to safely delete a notebook and all its notes.
        await db.transaction('rw', db.notebooks, db.notes, async () => {
            // 1. Delete the notebook itself
            await db.notebooks.delete(notebookId);
            // 2. Delete all notes that belong to this notebook
            await db.notes.where('notebookId').equals(notebookId).delete();
        });

        LoggingService.info(`[NoteService] Notebook ID ${notebookId} and its notes deleted from DB.`, { functionName });

        // Refresh the central store
        const allNotebooks = await db.notebooks.toArray();
        const allNotes = await db.notes.toArray();
        await AppStore.setNotebooks(allNotebooks);
        await AppStore.setNotes(allNotes);
        return true;
    } catch (error) {
        LoggingService.error(`[NoteService] Error deleting notebook ${notebookId}.`, error, { functionName });
        return false;
    }
}


// --- Note Functions ---

export function getNotes(notebookId = null) {
    // This getter still reads from the AppStore's cache for UI speed.
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

export async function addNote({ title, content, notebookId, isMarkdown = false }) {
    const functionName = 'addNote (NoteService)';
    if (!title || !title.trim()) {
        LoggingService.warn('[NoteService] Attempted to add a note with an empty title.', { functionName });
        return null;
    }
    const newNote = {
        title: title.trim(),
        content: content || '',
        notebookId: notebookId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isMarkdown: isMarkdown,
    };

    try {
        const newId = await db.notes.add(newNote);
        LoggingService.info(`[NoteService] Note added to DB: "${newNote.title}"`, { functionName });
        // Refresh the central store
        const allNotes = await db.notes.toArray();
        await AppStore.setNotes(allNotes);
        return { ...newNote, id: newId };
    } catch (error) {
        LoggingService.error('[NoteService] Error adding note.', error, { functionName });
        return null;
    }
}

export async function updateNote(noteId, updateData) {
    const functionName = 'updateNote (NoteService)';
    const updatePayload = {
        ...updateData,
        updatedAt: new Date().toISOString()
    };
     if (updateData.title) {
        updatePayload.title = updateData.title.trim();
    }

    try {
        await db.notes.update(noteId, updatePayload);
        LoggingService.info(`[NoteService] Note updated in DB: ${noteId}`, { functionName });
        // Refresh the central store
        const allNotes = await db.notes.toArray();
        await AppStore.setNotes(allNotes);
    } catch (error) {
        LoggingService.error(`[NoteService] Error updating note ${noteId}.`, error, { functionName });
    }
}

export async function deleteNote(noteId) {
    const functionName = 'deleteNote (NoteService)';
    try {
        await db.notes.delete(noteId);
        LoggingService.info(`[NoteService] Note ${noteId} deleted from DB.`, { functionName });
        // Refresh the central store
        const allNotes = await db.notes.toArray();
        await AppStore.setNotes(allNotes);
        return true;
    } catch (error) {
        LoggingService.error(`[NoteService] Error deleting note ${noteId}.`, error, { functionName });
        return false;
    }
}