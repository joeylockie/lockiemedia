// eventBus.js
// A simple event bus (publish/subscribe) system for decoupling modules.

import LoggingService from './loggingService.js';

const events = {}; // Store events and their listeners

// Helper to safely log, checking if LoggingService is available
function safeLog(level, message, context, error = null) {
    if (LoggingService && typeof LoggingService[level] === 'function') {
        if (error) {
            LoggingService[level](message, error, context);
        } else {
            LoggingService[level](message, context);
        }
    } else {
        // Fallback to console if LoggingService is not ready
        const levelName = level.toUpperCase();
        const ts = new Date().toISOString();
        if (console[level]) {
            console[level](`[${ts}] [EventBusSAFE:${levelName}] ${message}`, context || '', error || '');
        } else {
            console.log(`[${ts}] [EventBusSAFE:${levelName}] ${message}`, context || '', error || '');
        }
    }
}


/**
 * Subscribes a callback function to a specific event.
 * @param {string} eventName - The name of the event to subscribe to.
 * @param {Function} callback - The function to call when the event is published.
 */
function subscribe(eventName, callback) {
    const functionName = 'subscribe (EventBus)';
    if (typeof eventName !== 'string' || typeof callback !== 'function') {
        safeLog('error', '[EventBus] Invalid arguments for subscribe. Event name must be a string and callback must be a function.',
            { functionName, eventName, callbackType: typeof callback },
            new TypeError("Invalid arguments for subscribe")
        );
        return;
    }
    if (!events[eventName]) {
        events[eventName] = [];
    }
    if (events[eventName].includes(callback)) {
        safeLog('warn', `[EventBus] Callback already subscribed to event: ${eventName}`, { functionName, eventName, callbackName: callback.name || 'anonymous' });
        return;
    }
    events[eventName].push(callback);
    safeLog('debug', `[EventBus] Subscribed to event: ${eventName}`, { functionName, eventName, callbackName: callback.name || 'anonymous' });
}

/**
 * Unsubscribes a callback function from a specific event.
 * @param {string} eventName - The name of the event to unsubscribe from.
 * @param {Function} callback - The callback function to remove.
 */
function unsubscribe(eventName, callback) {
    const functionName = 'unsubscribe (EventBus)';
    if (typeof eventName !== 'string' || typeof callback !== 'function') {
        safeLog('error', '[EventBus] Invalid arguments for unsubscribe.',
            { functionName, eventName, callbackType: typeof callback },
            new TypeError("Invalid arguments for unsubscribe")
        );
        return;
    }
    if (events[eventName]) {
        const initialLength = events[eventName].length;
        events[eventName] = events[eventName].filter(cb => cb !== callback);
        if (events[eventName].length < initialLength) {
            safeLog('debug', `[EventBus] Unsubscribed from event: ${eventName}`, { functionName, eventName, callbackName: callback.name || 'anonymous' });
        } else {
            safeLog('warn', `[EventBus] Callback not found for event to unsubscribe: ${eventName}`, { functionName, eventName, callbackName: callback.name || 'anonymous' });
        }
        if (events[eventName].length === 0) {
            delete events[eventName];
            safeLog('debug', `[EventBus] Event '${eventName}' removed as no listeners left.`, { functionName, eventName });
        }
    } else {
        safeLog('warn', `[EventBus] No event found to unsubscribe from: ${eventName}`, { functionName, eventName });
    }
}

/**
 * Publishes (emits) an event, calling all subscribed callbacks with the provided data.
 * @param {string} eventName - The name of the event to publish.
 * @param {*} [data] - Optional data to pass to the event listeners.
 */
function publish(eventName, data) {
    const functionName = 'publish (EventBus)';
    if (typeof eventName !== 'string') {
        safeLog('error', '[EventBus] Invalid eventName for publish. Must be a string.',
            { functionName, eventName },
            new TypeError("Invalid eventName for publish")
        );
        return;
    }
    if (events[eventName]) {
        const dataSummary = data === undefined ? 'No data' : (typeof data === 'object' && data !== null ? `Object (keys: ${Object.keys(data || {}).join(', ') || 'empty'})` : `Type: ${typeof data}`);
        safeLog('debug', `[EventBus] Publishing event: ${eventName}`, { functionName, eventName, dataSummary, listenerCount: events[eventName].length });

        const listeners = [...events[eventName]];
        listeners.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                safeLog('error', `[EventBus] Error in callback for event ${eventName}:`, {
                    functionName,
                    eventName,
                    callbackName: callback.name || 'anonymous'
                }, error);
            }
        });
    } else {
        safeLog('debug', `[EventBus] Publishing event: ${eventName} (No listeners currently subscribed)`, { functionName, eventName });
    }
}

const EventBus = {
    subscribe,
    unsubscribe,
    publish
};

export default EventBus;