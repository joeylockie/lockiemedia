// public/calendarService.js
// Manages all logic for the calendar feature, using AppStore for data.

import AppStore from './store.js';
import LoggingService from './loggingService.js';

/**
 * Gets all calendar events.
 * @returns {Array<Object>} An array of event objects.
 */
function getEvents() {
    if (!AppStore) return [];
    return AppStore.getCalendarEvents ? AppStore.getCalendarEvents() : [];
}

/**
 * Adds a new event.
 * @param {object} eventData - The data for the new event.
 * @returns {object} The newly created event object.
 */
async function addEvent(eventData) {
    const functionName = 'addEvent (CalendarService)';
    const events = getEvents();
    
    const newEvent = {
        id: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        color: 'blue', // Default color
        isAllDay: !eventData.startTime || !eventData.endTime,
        ...eventData,
    };

    events.push(newEvent);
    
    if (AppStore && AppStore.setCalendarEvents) {
        await AppStore.setCalendarEvents(events, functionName);
    }
    
    LoggingService.info(`[CalendarService] Event added: "${newEvent.title}"`, { newEvent });
    return newEvent;
}

/**
 * Updates an existing event.
 * @param {number} eventId - The ID of the event to update.
 * @param {object} updateData - The data to update.
 * @returns {object|null} The updated event object or null if not found.
 */
async function updateEvent(eventId, updateData) {
    const functionName = 'updateEvent (CalendarService)';
    const events = getEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);

    if (eventIndex === -1) {
        LoggingService.error(`[CalendarService] Event with ID ${eventId} not found for update.`, new Error("EventNotFound"));
        return null;
    }

    events[eventIndex] = {
        ...events[eventIndex],
        ...updateData,
        isAllDay: !updateData.startTime || !updateData.endTime,
        updatedAt: Date.now(),
    };

    if (AppStore && AppStore.setCalendarEvents) {
        await AppStore.setCalendarEvents(events, functionName);
    }
    
    LoggingService.info(`[CalendarService] Event updated: ${eventId}`, { updatedData: events[eventIndex] });
    return events[eventIndex];
}

/**
 * Deletes an event by its ID.
 * @param {number} eventId - The ID of the event to delete.
 */
async function deleteEvent(eventId) {
    const functionName = 'deleteEvent (CalendarService)';
    let events = getEvents();
    const initialLength = events.length;
    events = events.filter(e => e.id !== eventId);

    if (events.length < initialLength) {
        if (AppStore && AppStore.setCalendarEvents) {
            await AppStore.setCalendarEvents(events, functionName);
        }
        LoggingService.info(`[CalendarService] Event ${eventId} deleted.`, { eventId });
    }
}

/**
 * Retrieves an event by its ID.
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