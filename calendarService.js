// public/calendarService.js
// Manages all logic for the calendar feature, using IndexedDB.

import AppStore from './store.js';
import LoggingService from './loggingService.js';
import db from './database.js'; // Import the database connection

/**
 * Gets all calendar events from the AppStore cache.
 * @returns {Array<Object>} An array of event objects.
 */
function getEvents() {
    if (!AppStore) return [];
    return AppStore.getCalendarEvents ? AppStore.getCalendarEvents() : [];
}

/**
 * Adds a new event to the database.
 * @param {object} eventData - The data for the new event.
 * @returns {Promise<object>} The newly created event object.
 */
async function addEvent(eventData) {
    const functionName = 'addEvent (CalendarService)';
    try {
        const newEvent = {
            createdAt: Date.now(),
            updatedAt: Date.now(),
            color: 'blue', // Default color
            location: '', // Add location field
            recurrence: 'none', // Add recurrence field
            ...eventData,
        };

        const newId = await db.calendar_events.add(newEvent);
        const allEvents = await db.calendar_events.toArray();
        await AppStore.setCalendarEvents(allEvents, functionName); // Refresh store

        LoggingService.info(`[CalendarService] Event added: "${newEvent.title}"`, { newEvent });
        return { ...newEvent, id: newId };
    } catch (error) {
        LoggingService.error(`[${functionName}] Error adding event`, error);
        return null;
    }
}

/**
 * Updates an existing event in the database.
 * @param {number} eventId - The ID of the event to update.
 * @param {object} updateData - The data to update.
 */
async function updateEvent(eventId, updateData) {
    const functionName = 'updateEvent (CalendarService)';
    try {
        const payload = {
            ...updateData,
            updatedAt: Date.now(),
        };
        await db.calendar_events.update(eventId, payload);
        const allEvents = await db.calendar_events.toArray();
        await AppStore.setCalendarEvents(allEvents, functionName); // Refresh store
        LoggingService.info(`[CalendarService] Event updated: ${eventId}`);
    } catch (error) {
        LoggingService.error(`[${functionName}] Error updating event ${eventId}`, error);
    }
}

/**
 * Deletes an event by its ID from the database.
 * @param {number} eventId - The ID of the event to delete.
 */
async function deleteEvent(eventId) {
    const functionName = 'deleteEvent (CalendarService)';
    try {
        await db.calendar_events.delete(eventId);
        const allEvents = await db.calendar_events.toArray();
        await AppStore.setCalendarEvents(allEvents, functionName); // Refresh store
        LoggingService.info(`[CalendarService] Event ${eventId} deleted.`);
    } catch (error) {
        LoggingService.error(`[${functionName}] Error deleting event ${eventId}`, error);
    }
}

/**
 * Retrieves an event by its ID from the AppStore cache.
 * @param {number} eventId - The ID of the event.
 * @returns {object|undefined} The event object or undefined if not found.
 */
function getEventById(eventId) {
    return getEvents().find(event => event.id === eventId);
}

const CalendarService = {
    getEvents,
    getEventById,
    addEvent,
    updateEvent,
    deleteEvent,
};

export default CalendarService;