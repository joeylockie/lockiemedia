// public/dev_tracker_service.js
// Service for handling all data logic for the Dev Tracker feature.

import AppStore from './store.js';
import LoggingService from './loggingService.js';

/**
 * Adds a new epic to the store.
 * @param {object} epicData - The data for the new epic (title, priority, status, description).
 * @returns {object} The newly created epic object.
 */
export async function addEpic(epicData) {
    const functionName = 'addEpic (DevTrackerService)';
    const epics = AppStore.getDevEpics();
    const newEpic = {
        id: Date.now(),
        createdAt: Date.now(),
        title: epicData.title,
        description: epicData.description,
        status: epicData.status,
        priority: epicData.priority,
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
        // Also delete all tickets associated with this epic
        tickets = tickets.filter(t => t.epicId !== epicId);
        await AppStore.setDevTickets(tickets, `${functionName}:tickets`);
        await AppStore.setDevEpics(epics, `${functionName}:epics`);
        LoggingService.info(`[DevTrackerService] Epic ${epicId} and its tickets deleted.`, { epicId });
    }
}

/**
 * Adds a new ticket to the store.
 * @param {object} ticketData - The data for the new ticket.
 * @returns {object} The newly created ticket object.
 */
export async function addTicket(ticketData) {
    const functionName = 'addTicket (DevTrackerService)';
    const tickets = AppStore.getDevTickets();
    const newTicket = {
        id: Date.now(),
        createdAt: Date.now(),
        epicId: ticketData.epicId,
        title: ticketData.title,
        description: ticketData.description,
        status: ticketData.status,
        priority: ticketData.priority,
        type: ticketData.type,
    };
    tickets.unshift(newTicket);
    await AppStore.setDevTickets(tickets, functionName);
    LoggingService.info(`[DevTrackerService] Ticket added: "${newTicket.title}"`, { newTicket });
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