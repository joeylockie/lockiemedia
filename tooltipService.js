// tooltipService.js
// Manages the state for the sidebar icon tooltip timeout.

(function() {
    // --- Internal State (scoped to this IIFE) ---
    let _tooltipTimeoutId = null;

    /**
     * Sets the tooltip timeout ID.
     * @param {number} timeoutId - The ID returned by setTimeout.
     */
    function setTooltipTimeout(timeoutId) {
        // Clear any existing timeout before setting a new one
        if (_tooltipTimeoutId !== null) {
            clearTimeout(_tooltipTimeoutId);
        }
        _tooltipTimeoutId = timeoutId;
    }

    /**
     * Gets the current tooltip timeout ID.
     * @returns {number|null}
     */
    function getTooltipTimeout() {
        return _tooltipTimeoutId;
    }

    /**
     * Clears the currently active tooltip timeout and resets the stored ID.
     */
    function clearTooltipTimeout() {
        if (_tooltipTimeoutId !== null) {
            clearTimeout(_tooltipTimeoutId);
            _tooltipTimeoutId = null;
            // console.log("[TooltipService] Tooltip timeout cleared.");
        }
    }

    // Expose public interface
    window.TooltipService = {
        setTooltipTimeout,
        getTooltipTimeout,
        clearTooltipTimeout
    };

    console.log("tooltipService.js loaded.");
})();
