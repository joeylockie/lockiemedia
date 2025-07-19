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

// --- A helper function for handling API calls and errors ---
async function _fetchApi(url, options, functionName) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ error: 'Failed to parse error response.' }));
            LoggingService.error(`[DevTrackerService] API call failed in ${functionName}`, { url, status: response.status, body: errorBody });
            throw new Error(errorBody.error || `Request failed with status ${response.status}`);
        }
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return null;
        }
        return await response.json();
    } catch (error) {
        LoggingService.error(`[DevTrackerService] Network or parsing error in ${functionName}`, error, { url });
        EventBus.publish('displayUserMessage', { text: `API Error: ${error.message}`, type: 'error' });
        throw error;
    }
}

// --- NEW: Epic functions now use the new API endpoints ---
export async function addEpic(epicData) {
    const functionName = 'addEpic (DevTrackerService)';
    try {
        const newEpic = await _fetchApi(`${API_URL}/epics`, {
            method: 'POST',
            headers: API_HEADERS,
            body: JSON.stringify(epicData),
        }, functionName);
        await AppStore.initializeStore(); // Refresh all data to get the new state
        return newEpic;
    } catch (error) {
        return null; // Error is already logged and displayed by _fetchApi
    }
}

export async function updateEpic(epicId, updateData) {
    const functionName = 'updateEpic (DevTrackerService)';
    try {
        const updatedEpic = await _fetchApi(`${API_URL}/epics/${epicId}`, {
            method: 'PUT',
            headers: API_HEADERS,
            body: JSON.stringify(updateData),
        }, functionName);
        await AppStore.initializeStore(); // Refresh all data
        return updatedEpic;
    } catch (error) {
        return null;
    }
}

export async function deleteEpic(epicId) {
    const functionName = 'deleteEpic (DevTrackerService)';
    try {
        await _fetchApi(`${API_URL}/epics/${epicId}`, {
            method: 'DELETE',
            headers: API_HEADERS,
        }, functionName);
        await AppStore.initializeStore(); // Refresh all data
        return true;
    } catch (error) {
        return false;
    }
}

// --- Ticket functions call the dedicated API endpoints ---
export async function addTicket(ticketData) {
    const functionName = 'addTicket (DevTrackerService)';
    try {
        const newTicket = await _fetchApi(`${API_URL}/tickets`, {
            method: 'POST',
            headers: API_HEADERS,
            body: JSON.stringify({ ...ticketData, author: AppStore.getUserProfile().displayName }),
        }, functionName);
        await AppStore.initializeStore();
        return newTicket;
    } catch (error) {
        return null;
    }
}

export async function updateTicket(ticketId, updateData) {
    const functionName = 'updateTicket (DevTrackerService)';
    try {
        const updatedTicket = await _fetchApi(`${API_URL}/tickets/${ticketId}`, {
            method: 'PUT',
            headers: API_HEADERS,
            body: JSON.stringify({ ...updateData, author: AppStore.getUserProfile().displayName }),
        }, functionName);
        await AppStore.initializeStore();
        return updatedTicket;
    } catch (error) {
        return null;
    }
}

// --- Subtask Management ---
export async function addSubtask(ticketId, text) {
    const functionName = 'addSubtask (DevTrackerService)';
    try {
        const newSubtask = await _fetchApi(`${API_URL}/tickets/${ticketId}/subtasks`, {
            method: 'POST',
            headers: API_HEADERS,
            body: JSON.stringify({ text }),
        }, functionName);
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
        const subtasks = AppStore.getDevSubtasks();
        const index = subtasks.findIndex(s => s.id === subtaskId);
        if (index !== -1) {
            subtasks[index] = updatedSubtask;
            AppStore.setDevSubtasks(subtasks, functionName);
        }
        return updatedSubtask;
    } catch (error) {
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
        const subtasks = AppStore.getDevSubtasks().filter(s => s.id !== subtaskId);
        AppStore.setDevSubtasks(subtasks, functionName);
        return true;
    } catch (error) {
        return false;
    }
}

// --- Other API-driven functions ---
export async function addComment(ticketId, comment) {
    const functionName = 'addComment (DevTrackerService)';
    try {
        await _fetchApi(`${API_URL}/tickets/${ticketId}/comments`, {
            method: 'POST',
            headers: API_HEADERS,
            body: JSON.stringify({ comment, author: AppStore.getUserProfile().displayName }),
        }, functionName);
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
        await AppStore.initializeStore();
        return newVersion;
    } catch (error) {
        return null;
    }
}