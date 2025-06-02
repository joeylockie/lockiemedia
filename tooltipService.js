// tooltipService.js
// Manages the state for the sidebar icon tooltip timeout.
// Now an ES6 module.

// NEW: Import LoggingService
import LoggingService from './loggingService.js';

// --- Internal State (scoped to this module) ---
let _tooltipTimeoutId = null; //

function setTooltipTimeout(timeoutId) {
    const functionName = 'setTooltipTimeout (TooltipService)';
    if (_tooltipTimeoutId !== null) { //
        // MODIFIED: Log clearing of existing timeout
        LoggingService.debug(`[TooltipService] Clearing existing tooltip timeout ID: ${_tooltipTimeoutId}`, { functionName, existingTimeoutId: _tooltipTimeoutId });
        clearTimeout(_tooltipTimeoutId); //
    }
    _tooltipTimeoutId = timeoutId; //
    // MODIFIED: Log setting of new timeout
    LoggingService.debug(`[TooltipService] Tooltip timeout set with ID: ${timeoutId}`, { functionName, newTimeoutId: timeoutId });
}

function getTooltipTimeout() { //
    return _tooltipTimeoutId; //
}

function clearTooltipTimeout() {
    const functionName = 'clearTooltipTimeout (TooltipService)';
    if (_tooltipTimeoutId !== null) { //
        // MODIFIED: Log clearing of timeout
        LoggingService.debug(`[TooltipService] Clearing tooltip timeout ID: ${_tooltipTimeoutId}`, { functionName, timeoutIdToClear: _tooltipTimeoutId });
        clearTimeout(_tooltipTimeoutId); //
        _tooltipTimeoutId = null; //
    } else {
        // MODIFIED: Log if no timeout to clear (debug level)
        LoggingService.debug('[TooltipService] Attempted to clear tooltip timeout, but no active timeout found.', { functionName });
    }
}

const TooltipService = { //
    setTooltipTimeout, //
    getTooltipTimeout, //
    clearTooltipTimeout //
};

export default TooltipService; //

// REMOVED: LoggingService.debug("tooltipService.js loaded as ES6 module.", { module: 'tooltipService' });
// console.log("tooltipService.js module parsed and TooltipService object is now defined."); // Optional