// eventBus.js
// A simple event bus (publish/subscribe) system for decoupling modules.

const events = {}; // Store events and their listeners

/**
 * Subscribes a callback function to a specific event.
 * @param {string} eventName - The name of the event to subscribe to.
 * @param {Function} callback - The function to call when the event is published.
 */
function subscribe(eventName, callback) {
    if (typeof eventName !== 'string' || typeof callback !== 'function') {
        console.error('[EventBus] Invalid arguments for subscribe. Event name must be a string and callback must be a function.');
        return;
    }
    if (!events[eventName]) {
        events[eventName] = [];
    }
    if (events[eventName].includes(callback)) {
        console.warn(`[EventBus] Callback already subscribed to event: ${eventName}`);
        return;
    }
    events[eventName].push(callback);
    console.log(`[EventBus] Subscribed to event: ${eventName}`);
}

/**
 * Unsubscribes a callback function from a specific event.
 * @param {string} eventName - The name of the event to unsubscribe from.
 * @param {Function} callback - The callback function to remove.
 */
function unsubscribe(eventName, callback) {
    if (typeof eventName !== 'string' || typeof callback !== 'function') {
        console.error('[EventBus] Invalid arguments for unsubscribe.');
        return;
    }
    if (events[eventName]) {
        events[eventName] = events[eventName].filter(cb => cb !== callback);
        console.log(`[EventBus] Unsubscribed from event: ${eventName}`);
        if (events[eventName].length === 0) {
            delete events[eventName]; // Clean up if no listeners left
        }
    } else {
        console.warn(`[EventBus] No event found to unsubscribe from: ${eventName}`);
    }
}

/**
 * Publishes (emits) an event, calling all subscribed callbacks with the provided data.
 * @param {string} eventName - The name of the event to publish.
 * @param {*} [data] - Optional data to pass to the event listeners.
 */
function publish(eventName, data) {
    if (typeof eventName !== 'string') {
        console.error('[EventBus] Invalid eventName for publish. Must be a string.');
        return;
    }
    if (events[eventName]) {
        console.log(`[EventBus] Publishing event: ${eventName} with data:`, data);
        // Create a copy of the listeners array in case a listener unsubscribes itself during iteration
        const listeners = [...events[eventName]];
        listeners.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`[EventBus] Error in callback for event ${eventName}:`, error);
            }
        });
    }
}

// Export the public methods as an object
const EventBus = {
    subscribe,
    unsubscribe,
    publish
};

export default EventBus; // Export the EventBus object as the default export

console.log("eventBus.js loaded as ES6 module.");
