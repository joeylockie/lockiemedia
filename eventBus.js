// eventBus.js
// A simple event bus (publish/subscribe) system for decoupling modules.

// NEW: Import LoggingService
import LoggingService from './loggingService.js';

const events = {}; // Store events and their listeners

/**
 * Subscribes a callback function to a specific event.
 * @param {string} eventName - The name of the event to subscribe to.
 * @param {Function} callback - The function to call when the event is published.
 */
function subscribe(eventName, callback) {
    const functionName = 'subscribe (EventBus)';
    if (typeof eventName !== 'string' || typeof callback !== 'function') { //
        // MODIFIED: Use LoggingService
        LoggingService.error('[EventBus] Invalid arguments for subscribe. Event name must be a string and callback must be a function.',
            new TypeError("Invalid arguments for subscribe"),
            { functionName, eventName, callbackType: typeof callback }
        );
        return; //
    }
    if (!events[eventName]) { //
        events[eventName] = []; //
    }
    if (events[eventName].includes(callback)) { //
        // MODIFIED: Use LoggingService
        LoggingService.warn(`[EventBus] Callback already subscribed to event: ${eventName}`, { functionName, eventName, callbackName: callback.name || 'anonymous' });
        return; //
    }
    events[eventName].push(callback); //
    // MODIFIED: Use LoggingService (debug level for potentially frequent operations)
    LoggingService.debug(`[EventBus] Subscribed to event: ${eventName}`, { functionName, eventName, callbackName: callback.name || 'anonymous' });
}

/**
 * Unsubscribes a callback function from a specific event.
 * @param {string} eventName - The name of the event to unsubscribe from.
 * @param {Function} callback - The callback function to remove.
 */
function unsubscribe(eventName, callback) {
    const functionName = 'unsubscribe (EventBus)';
    if (typeof eventName !== 'string' || typeof callback !== 'function') { //
        // MODIFIED: Use LoggingService
        LoggingService.error('[EventBus] Invalid arguments for unsubscribe.',
            new TypeError("Invalid arguments for unsubscribe"),
            { functionName, eventName, callbackType: typeof callback }
        );
        return; //
    }
    if (events[eventName]) { //
        const initialLength = events[eventName].length;
        events[eventName] = events[eventName].filter(cb => cb !== callback); //
        if (events[eventName].length < initialLength) {
            // MODIFIED: Use LoggingService (debug level)
            LoggingService.debug(`[EventBus] Unsubscribed from event: ${eventName}`, { functionName, eventName, callbackName: callback.name || 'anonymous' });
        } else {
            LoggingService.warn(`[EventBus] Callback not found for event to unsubscribe: ${eventName}`, { functionName, eventName, callbackName: callback.name || 'anonymous' });
        }
        if (events[eventName].length === 0) { //
            delete events[eventName]; // Clean up if no listeners left //
            LoggingService.debug(`[EventBus] Event '${eventName}' removed as no listeners left.`, { functionName, eventName });
        }
    } else {
        // MODIFIED: Use LoggingService
        LoggingService.warn(`[EventBus] No event found to unsubscribe from: ${eventName}`, { functionName, eventName });
    }
}

/**
 * Publishes (emits) an event, calling all subscribed callbacks with the provided data.
 * @param {string} eventName - The name of the event to publish.
 * @param {*} [data] - Optional data to pass to the event listeners.
 */
function publish(eventName, data) {
    const functionName = 'publish (EventBus)';
    if (typeof eventName !== 'string') { //
        // MODIFIED: Use LoggingService
        LoggingService.error('[EventBus] Invalid eventName for publish. Must be a string.',
            new TypeError("Invalid eventName for publish"),
            { functionName, eventName }
        );
        return; //
    }
    if (events[eventName]) { //
        // MODIFIED: Use LoggingService (debug level for potentially frequent operations)
        // For event data, consider if it's too large or contains sensitive info for general logging.
        // Here, we'll log a summary or type of data if possible, or just acknowledge data presence.
        const dataSummary = data === undefined ? 'No data' : (typeof data === 'object' ? `Object (keys: ${Object.keys(data || {}).join(', ') || 'empty'})` : `Type: ${typeof data}`);
        LoggingService.debug(`[EventBus] Publishing event: ${eventName}`, { functionName, eventName, dataSummary, listenerCount: events[eventName].length });

        const listeners = [...events[eventName]]; // Create a copy of the listeners array
        listeners.forEach(callback => { //
            try {
                callback(data); //
            } catch (error) {
                // MODIFIED: Use LoggingService
                LoggingService.error(`[EventBus] Error in callback for event ${eventName}:`, error, {
                    functionName,
                    eventName,
                    callbackName: callback.name || 'anonymous'
                });
            }
        });
    } else {
        // MODIFIED: Log if publishing to an event with no listeners (debug level)
        LoggingService.debug(`[EventBus] Publishing event: ${eventName} (No listeners currently subscribed)`, { functionName, eventName });
    }
}

// Export the public methods as an object
const EventBus = { //
    subscribe, //
    unsubscribe, //
    publish //
};

export default EventBus;

// MODIFIED: Use LoggingService
LoggingService.debug("eventBus.js loaded as ES6 module.", { module: 'eventBus' });