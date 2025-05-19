// tooltipService.js
// Manages the state for the sidebar icon tooltip timeout.
// Now an ES6 module.

// --- Internal State (scoped to this module) ---
let _tooltipTimeoutId = null;

function setTooltipTimeout(timeoutId) {
    if (_tooltipTimeoutId !== null) {
        clearTimeout(_tooltipTimeoutId);
    }
    _tooltipTimeoutId = timeoutId;
}

function getTooltipTimeout() {
    return _tooltipTimeoutId;
}

function clearTooltipTimeout() {
    if (_tooltipTimeoutId !== null) {
        clearTimeout(_tooltipTimeoutId);
        _tooltipTimeoutId = null;
    }
}

const TooltipService = {
    setTooltipTimeout,
    getTooltipTimeout,
    clearTooltipTimeout
};

export default TooltipService;

console.log("tooltipService.js loaded as ES6 module.");
