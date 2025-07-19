// public/dev_tracker_service.js
// Service for handling all data logic for the Dev Tracker feature.

import AppStore from './store.js';
import LoggingService from './loggingService.js';
import EventBus from './eventBus.js';

const API_URL = 'http://192.168.2.201:3000/api';
const API_KEY = "THeYYjPRRvQ6CjJFPL0T6cpAyfWbIMFm9U0Lo4d+saQ="; // Ensure this is correct
const API_HEADERS = {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
};

// --- NEW: A helper function for handling API calls and errors ---
async function _fetchApi(url, options, functionName) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ error: 'Failed to parse error response.' }));
            LoggingService.error(`[DevTrackerService] API call failed in ${functionName}`, { url, status: response.status, body: errorBody });
            throw new Error(errorBody.error || `Request failed with status ${response.status}`);
        }
        // For DELETE requests with no content
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return null;
        }
        return await response.json();
    } catch (error) {
        LoggingService.error(`[DevTrackerService] Network or parsing error in ${functionName}`, error, { url });
        EventBus.publish('displayUserMessage', { text: `API Error: ${error.message}`, type: 'error' });
        throw error; // Re-throw the error to be caught by the calling function
    }
}


// --- MODIFIED: addEpic now uses the full AppStore refresh ---
export async function addEpic(epicData) {
    const functionName = 'addEpic (DevTrackerService)';
    const epics = AppStore.getDevEpics();
    
    // Simple client-side validation
    if (epics.some(e => e.key.toUpperCase() === epicData.key.toUpperCase())) {
        alert(`Error: Epic Key "${epicData.key}" already exists.`);
        return null;
    }
    // A more complete implementation would have a dedicated POST /api/epics endpoint.
    // For now, we continue with the local update and full sync model for epics.
    const newEpic = {
        id: Date.now(),
        createdAt: Date.now(),
        key: epicData.key.toUpperCase(),
        title: epicData.title,
        description: epicData.description,
        status: epicData.status,
        priority: epicData.priority,
        releaseVersion: epicData.releaseVersion,
        ticketCounter: 0,
    };
    epics.unshift(newEpic);
    await AppStore.setDevEpics(epics, functionName); // This still uses the old save model
    return newEpic;
}

// --- MODIFIED: updateEpic now uses the full AppStore refresh ---
export async function updateEpic(epicId, updateData) {
    const functionName = 'updateEpic (DevTrackerService)';
    const epics = AppStore.getDevEpics();
    const epicIndex = epics.findIndex(e => e.id === epicId);

    if (epicIndex === -1) return null;

    if (updateData.key && epics.some(e => e.key.toUpperCase() === updateData.key.toUpperCase() && e.id !== epicId)) {
        alert(`Error: Epic Key "${updateData.key}" already exists.`);
        return null;
    }
    if(updateData.key) updateData.key = updateData.key.toUpperCase();

    epics[epicIndex] = { ...epics[epicIndex], ...updateData };
    await AppStore.setDevEpics(epics, functionName);
    return epics[epicIndex];
}

// --- NEW: addTicket now calls the dedicated API endpoint ---
export async function addTicket(ticketData) {
    const functionName = 'addTicket (DevTrackerService)';
    try {
        const newTicket = await _fetchApi(`${API_URL}/tickets`, {
            method: 'POST',
            headers: API_HEADERS,
            body: JSON.stringify({ ...ticketData, author: AppStore.getUserProfile().displayName }),
        }, functionName);

        // Refresh all data to ensure store is in sync
        await AppStore.initializeStore();
        return newTicket;
    } catch (error) {
        // Error is already logged and displayed by _fetchApi
        return null;
    }
}

// --- NEW: updateTicket now calls the dedicated API endpoint ---
export async function updateTicket(ticketId, updateData) {
    const functionName = 'updateTicket (DevTrackerService)';
    try {
        const updatedTicket = await _fetchApi(`${API_URL}/tickets/${ticketId}`, {
            method: 'PUT',
            headers: API_HEADERS,
            body: JSON.stringify({ ...updateData, author: AppStore.getUserProfile().displayName }),
        }, functionName);

        // Refresh all data to ensure store is in sync with changes and new history
        await AppStore.initializeStore();
        return updatedTicket;
    } catch (error) {
        return null;
    }
}

// --- NEW: Subtask Management ---

export async function addSubtask(ticketId, text) {
    const functionName = 'addSubtask (DevTrackerService)';
    try {
        const newSubtask = await _fetchApi(`${API_URL}/tickets/${ticketId}/subtasks`, {
            method: 'POST',
            headers: API_HEADERS,
            body: JSON.stringify({ text }),
        }, functionName);

        // Add to local store immediately for faster UI response
        const subtasks = AppStore.getDevSubtasks();
        subtasks.push(newSubtask);
        AppStore.setDevSubtasks(subtasks, functionName);
        return newSubtask;
    } catch (error) {
        return null;
    }
}

export async function updateSubtask(subtaskId, updateData) {
    const functionName = 'updateSubtask (DevTrackerService)';
    try {
        const updatedSubtask = await _fetchApi(`${API_URL}/subtasks/${subtaskId}`, {
            method: 'PUT',
            headers: API_HEADERS,
            body: JSON.stringify(updateData),
        }, functionName);

        // Update local store for faster UI response
        const subtasks = AppStore.getDevSubtasks();
        const index = subtasks.findIndex(s => s.id === subtaskId);
        if (index !== -1) {
            subtasks[index] = updatedSubtask;
            AppStore.setDevSubtasks(subtasks, functionName);
        }
        return updatedSubtask;
    } catch (error) {
        // If the API call fails, refresh the store to revert optimistic update
        await AppStore.initializeStore();
        return null;
    }
}

export async function deleteSubtask(subtaskId) {
    const functionName = 'deleteSubtask (DevTrackerService)';
    try {
        await _fetchApi(`${API_URL}/subtasks/${subtaskId}`, {
            method: 'DELETE',
            headers: API_HEADERS,
        }, functionName);

        // Remove from local store for faster UI response
        const subtasks = AppStore.getDevSubtasks().filter(s => s.id !== subtaskId);
        AppStore.setDevSubtasks(subtasks, functionName);
        return true;
    } catch (error) {
        return false;
    }
}


// --- Existing API-driven functions (comments, versions, etc.) ---

export async function addComment(ticketId, comment) {
    const functionName = 'addComment (DevTrackerService)';
    try {
        await _fetchApi(`${API_URL}/tickets/${ticketId}/comments`, {
            method: 'POST',
            headers: API_HEADERS,
            body: JSON.stringify({ comment, author: AppStore.getUserProfile().displayName }),
        }, functionName);
        // Refresh to get new comment and history
        await AppStore.initializeStore();
    } catch (error) {
        // Error already handled
    }
}

export async function deleteComment(ticketId, commentId) {
    const functionName = 'deleteComment (DevTrackerService)';
    try {
        await _fetchApi(`${API_URL}/tickets/${ticketId}/comments/${commentId}`, {
            method: 'DELETE',
            headers: API_HEADERS,
        }, functionName);
        // Efficiently remove from local store
        const comments = AppStore.getDevTicketComments().filter(c => c.id !== commentId);
        AppStore.setDevTicketComments(comments, functionName);
    } catch (error) {
        // Error already handled
    }
}

export async function updateTicketStatus(ticketId, newStatus) {
    const functionName = 'updateTicketStatus (DevTrackerService)';
    try {
        await _fetchApi(`${API_URL}/tickets/${ticketId}/status`, {
            method: 'PATCH',
            headers: API_HEADERS,
            body: JSON.stringify({ status: newStatus, author: AppStore.getUserProfile().displayName }),
        }, functionName);
        // Refresh to get new status and history
        await AppStore.initializeStore();
    } catch (error) {
        // Error already handled
    }
}

export async function addReleaseVersion(version) {
    const functionName = 'addReleaseVersion (DevTrackerService)';
    try {
        const newVersion = await _fetchApi(`${API_URL}/dev-release-versions`, {
            method: 'POST',
            headers: API_HEADERS,
            body: JSON.stringify({ version }),
        }, functionName);
        // Refresh to get the new version list
        await AppStore.initializeStore();
        return newVersion;
    } catch (error) {
        return null;
    }
}