// public/dev_tracker_service.js
// Service for handling all data logic for the Dev Tracker feature.

import AppStore from './store.js';
import LoggingService from './loggingService.js';

/**
 * Adds a new epic to the store.
 * @param {object} epicData - The data for the new epic (title, key, priority, status, description).
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
        ticketCounter: 0, // Initialize counter
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

    // Check for duplicate key if the key is being changed
    if (updateData.key && epics.some(e => e.key.toUpperCase() === updateData.key.toUpperCase() && e.id !== epicId)) {
        alert(`Error: Epic Key "${updateData.key}" already exists. Please choose a unique key.`);
        LoggingService.warn(`[DevTrackerService] Attempted to update epic with duplicate key: ${updateData.key}`);
        return null;
    }

    if(updateData.key) {
        updateData.key = updateData.key.toUpperCase();
    }

    epics[epicIndex] = { ...epics[epicIndex], ...updateData };
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
        // Save both datasets
        await AppStore.setDevTickets(tickets, `${functionName}:tickets`);
        await AppStore.setDevEpics(epics, `${functionName}:epics`);
        LoggingService.info(`[DevTrackerService] Epic ${epicId} and its tickets deleted.`, { epicId });
    }
}

/**
 * Adds a new ticket to the store, generating a unique key.
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

    // Atomically update the counter and generate the key
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
    };
    
    tickets.unshift(newTicket);

    // Save both the updated epics array (with the new counter) and the new tickets array
    await AppStore.setDevEpics(epics, `${functionName}:epics`);
    await AppStore.setDevTickets(tickets, `${functionName}:tickets`);
    
    LoggingService.info(`[DevTrackerService] Ticket added: "${newTicket.title}" with key ${newTicket.fullKey}`, { newTicket });
    return newTicket;
}

/**
 * Updates an existing ticket.
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

    tickets[ticketIndex] = { ...tickets[ticketIndex], ...updateData };
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
    const initialTicketCount = tickets.length;
    tickets = tickets.filter(t => t.id !== ticketId);

    if (tickets.length < initialTicketCount) {
        await AppStore.setDevTickets(tickets, functionName);
        LoggingService.info(`[DevTrackerService] Ticket ${ticketId} deleted.`, { ticketId });
    }
}