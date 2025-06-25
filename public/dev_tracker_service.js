// public/dev_tracker_service.js
// Service for handling all data logic for the Dev Tracker feature.

import AppStore from './store.js';
import LoggingService from './loggingService.js';

const API_URL = 'http://192.168.2.200:3000/api';
const API_KEY = "THeYYjPRRvQ6CjJFPL0T6cpAyfWbIMFm9U0Lo4d+saQ=";
const API_HEADERS = {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
};


/**
 * Adds a new epic to the store.
 * @param {object} epicData - The data for the new epic (title, key, priority, status, description, releaseVersion).
 * @returns {object} The newly created epic object.
 */
export async function addEpic(epicData) {
    const functionName = 'addEpic (DevTrackerService)';
    const epics = AppStore.getDevEpics();
    
    // Check if key already exists
    if (epics.some(e => e.key.toUpperCase() === epicData.key.toUpperCase())) {
        alert(`Error: Epic Key "${epicData.key}" already exists. Please choose a unique key.`);
        LoggingService.warn(`[DevTrackerService] Attempted to add epic with duplicate key: ${epicData.key}`);
        return null;
    }

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
    await AppStore.setDevEpics(epics, functionName);
    LoggingService.info(`[DevTrackerService] Epic added: "${newEpic.title}"`, { newEpic });
    return newEpic;
}

/**
 * Updates an existing epic.
 * @param {number} epicId - The ID of the epic to update.
 * @param {object} updateData - The data to update.
 * @returns {object|null} The updated epic object or null if not found.
 */
export async function updateEpic(epicId, updateData) {
    const functionName = 'updateEpic (DevTrackerService)';
    const epics = AppStore.getDevEpics();
    const epicIndex = epics.findIndex(e => e.id === epicId);

    if (epicIndex === -1) {
        LoggingService.error(`[DevTrackerService] Epic with ID ${epicId} not found for update.`, new Error("EpicNotFound"), { epicId });
        return null;
    }

    if (updateData.key && epics.some(e => e.key.toUpperCase() === updateData.key.toUpperCase() && e.id !== epicId)) {
        alert(`Error: Epic Key "${updateData.key}" already exists. Please choose a unique key.`);
        LoggingService.warn(`[DevTrackerService] Attempted to update epic with duplicate key: ${updateData.key}`);
        return null;
    }

    if(updateData.key) {
        updateData.key = updateData.key.toUpperCase();
    }

    const originalEpic = epics[epicIndex];
    epics[epicIndex] = { ...originalEpic, ...updateData };

    // If the epic's release version changes, update all its tickets
    if (updateData.releaseVersion && updateData.releaseVersion !== originalEpic.releaseVersion) {
        let tickets = AppStore.getDevTickets();
        tickets.forEach(ticket => {
            if (ticket.epicId === epicId) {
                ticket.releaseVersion = updateData.releaseVersion;
            }
        });
        await AppStore.setDevTickets(tickets, `${functionName}:tickets`);
    }

    await AppStore.setDevEpics(epics, functionName);
    LoggingService.info(`[DevTrackerService] Epic updated: ${epicId}`, { updatedData: epics[epicIndex] });
    return epics[epicIndex];
}

/**
 * Deletes an epic and all of its associated tickets.
 * @param {number} epicId - The ID of the epic to delete.
 */
export async function deleteEpic(epicId) {
    const functionName = 'deleteEpic (DevTrackerService)';
    let epics = AppStore.getDevEpics();
    let tickets = AppStore.getDevTickets();

    const initialEpicCount = epics.length;
    epics = epics.filter(e => e.id !== epicId);

    if (epics.length < initialEpicCount) {
        tickets = tickets.filter(t => t.epicId !== epicId);
        await AppStore.setDevTickets(tickets, `${functionName}:tickets`);
        await AppStore.setDevEpics(epics, `${functionName}:epics`);
        LoggingService.info(`[DevTrackerService] Epic ${epicId} and its tickets deleted.`, { epicId });
    }
}

/**
 * Adds a new ticket to the store, inheriting the release version from its epic.
 * @param {object} ticketData - The data for the new ticket.
 * @returns {object|null} The newly created ticket object or null on error.
 */
export async function addTicket(ticketData) {
    const functionName = 'addTicket (DevTrackerService)';
    let tickets = AppStore.getDevTickets();
    let epics = AppStore.getDevEpics();
    
    const parentEpicIndex = epics.findIndex(e => e.id === ticketData.epicId);
    if (parentEpicIndex === -1) {
        LoggingService.error(`[DevTrackerService] Cannot add ticket. Parent epic with ID ${ticketData.epicId} not found.`);
        return null;
    }

    const parentEpic = epics[parentEpicIndex];
    const newTicketNumber = (parentEpic.ticketCounter || 0) + 1;
    parentEpic.ticketCounter = newTicketNumber;
    const fullKey = `${parentEpic.key}-${newTicketNumber}`;

    const newTicket = {
        id: Date.now(),
        createdAt: Date.now(),
        fullKey: fullKey,
        epicId: ticketData.epicId,
        title: ticketData.title,
        description: ticketData.description,
        status: ticketData.status,
        priority: ticketData.priority,
        type: ticketData.type,
        component: ticketData.component,
        affectedVersion: ticketData.affectedVersion,
        releaseVersion: parentEpic.releaseVersion, // Inherit from epic
    };
    
    tickets.unshift(newTicket);

    await AppStore.setDevEpics(epics, `${functionName}:epics`);
    await AppStore.setDevTickets(tickets, `${functionName}:tickets`);
    
    LoggingService.info(`[DevTrackerService] Ticket added: "${newTicket.title}" with key ${newTicket.fullKey}`, { newTicket });
    return newTicket;
}

/**
 * Updates an existing ticket and logs changes to history.
 * @param {number} ticketId - The ID of the ticket to update.
 * @param {object} updateData - The data to update.
 * @returns {object|null} The updated ticket object or null if not found.
 */
export async function updateTicket(ticketId, updateData) {
    const functionName = 'updateTicket (DevTrackerService)';
    const tickets = AppStore.getDevTickets();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);

    if (ticketIndex === -1) {
        LoggingService.error(`[DevTrackerService] Ticket with ID ${ticketId} not found for update.`, new Error("TicketNotFound"), { ticketId });
        return null;
    }

    const originalTicket = { ...tickets[ticketIndex] };
    const updatedTicket = { ...originalTicket, ...updateData };

    // Check for changes and record history
    const fieldsToTrack = ['title', 'description', 'status', 'priority', 'type', 'component', 'affectedVersion', 'releaseVersion'];
    fieldsToTrack.forEach(field => {
        if (originalTicket[field] !== updatedTicket[field]) {
            // This would call the new API endpoint in a real scenario
            console.log(`HISTORY: Field '${field}' changed from '${originalTicket[field]}' to '${updatedTicket[field]}'`);
            // We'll manage history in the store for now for simplicity, but an API call is better
            const history = AppStore.getDevTicketHistory();
            history.push({
                id: Date.now(),
                ticketId: ticketId,
                field: field,
                oldValue: originalTicket[field],
                newValue: updatedTicket[field],
                changedAt: Date.now()
            });
            AppStore.setDevTicketHistory(history);
        }
    });
    
    tickets[ticketIndex] = updatedTicket;
    await AppStore.setDevTickets(tickets, functionName);
    LoggingService.info(`[DevTrackerService] Ticket updated: ${ticketId}`, { updatedData: tickets[ticketIndex] });
    return tickets[ticketIndex];
}


/**
 * Deletes a ticket by its ID.
 * @param {number} ticketId - The ID of the ticket to delete.
 */
export async function deleteTicket(ticketId) {
    const functionName = 'deleteTicket (DevTrackerService)';
    let tickets = AppStore.getDevTickets();
    tickets = tickets.filter(t => t.id !== ticketId);
    await AppStore.setDevTickets(tickets, functionName);
    LoggingService.info(`[DevTrackerService] Ticket ${ticketId} deleted.`, { ticketId });
}

/**
 * Adds a new release version via API.
 * @param {string} version - The version string.
 */
export async function addReleaseVersion(version) {
    const functionName = 'addReleaseVersion (DevTrackerService)';
    try {
        const response = await fetch(`${API_URL}/dev-release-versions`, {
            method: 'POST',
            headers: API_HEADERS,
            body: JSON.stringify({ version }),
        });
        if (!response.ok) throw new Error(await response.text());
        const newVersion = await response.json();

        const versions = AppStore.getDevReleaseVersions();
        versions.unshift(newVersion);
        await AppStore.setDevReleaseVersions(versions, functionName);
        return newVersion;
    } catch (error) {
        LoggingService.error(`[DevTrackerService] Failed to add release version: ${version}`, error, { functionName });
        alert(`Error adding version: ${error.message}`);
        return null;
    }
}

/**
 * Adds a comment to a ticket via API.
 * @param {number} ticketId
 * @param {string} comment
 */
export async function addComment(ticketId, comment) {
    const functionName = 'addComment (DevTrackerService)';
    try {
        const response = await fetch(`${API_URL}/tickets/${ticketId}/comments`, {
            method: 'POST',
            headers: API_HEADERS,
            body: JSON.stringify({ comment, author: AppStore.getUserProfile().displayName }),
        });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        const newComment = await response.json();

        // --- THIS IS THE FIX ---
        // After successfully saving to the server, update the local AppStore state.
        const comments = AppStore.getDevTicketComments();
        comments.push(newComment);
        // We use setDevTicketComments to trigger a UI update.
        await AppStore.setDevTicketComments(comments, functionName);
        
        return newComment;

    } catch (error) {
        LoggingService.error(`[DevTrackerService] Failed to add comment to ticket ${ticketId}`, error, { functionName });
        alert(`Error adding comment: ${error.message}`);
        return null;
    }
}


/**
 * Updates a ticket's status via API.
 * @param {number} ticketId
 * @param {string} newStatus
 */
export async function updateTicketStatus(ticketId, newStatus) {
    const functionName = 'updateTicketStatus (DevTrackerService)';
    try {
        const response = await fetch(`${API_URL}/tickets/${ticketId}/status`, {
            method: 'PATCH',
            headers: API_HEADERS,
            body: JSON.stringify({ status: newStatus, author: AppStore.getUserProfile().displayName }),
        });
        if (!response.ok) throw new Error(await response.text());

        // Refresh local data to get history and status update
        await AppStore.initializeStore();
        
    } catch (error) {
        LoggingService.error(`[DevTrackerService] Failed to update status for ticket ${ticketId}`, error, { functionName });
        alert(`Error updating status: ${error.message}`);
    }
}