// utils.js
// This file contains general utility functions for date and time formatting,
// and other helper functions that can be used across the application.

/**
 * Returns the current date as a string in YYYY-MM-DD format.
 * @returns {string} Today's date.
 */
function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Converts a Date object to a string in YYYY-MM-DD format.
 * @param {Date} date - The date object to format.
 * @returns {string} The formatted date string.
 */
function getDateString(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        console.warn("[Utils] getDateString: Invalid date object provided.", date);
        return new Date().toISOString().split('T')[0]; // Fallback to today
    }
    return date.toISOString().split('T')[0];
}

/**
 * Formats a date string or Date object into a more readable format (e.g., "May 19, 2025").
 * Handles both Date objects and ISO string dates (timestamps).
 * @param {string|Date} dateInput - The date string (YYYY-MM-DD or full ISO) or Date object.
 * @returns {string} The formatted date string, or 'Invalid Date'/'Not set'.
 */
function formatDate(dateInput) {
    if (!dateInput) return 'Not set';

    const date = new Date(dateInput);

    // Check if the date is valid. Note: new Date('invalid-string') doesn't throw but results in Invalid Date.
    // new Date(null) results in epoch, which is valid.
    if (isNaN(date.getTime())) {
        // If it's an invalid date, and the input was a string, try to parse YYYY-MM-DD specifically
        // because JS `new Date()` can be inconsistent with timezone interpretation for YYYY-MM-DD.
        if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
            const parts = dateInput.split('-');
            // Construct date as UTC to avoid timezone issues with YYYY-MM-DD strings
            const utcDate = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
            if (!isNaN(utcDate.getTime())) {
                return utcDate.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    timeZone: 'UTC' // Specify timezone for consistent output
                });
            }
        }
        return 'Invalid Date';
    }

    // For valid dates, proceed with formatting.
    // If the input was just YYYY-MM-DD, it might be interpreted as local time.
    // To ensure consistency, especially if the date was intended as UTC:
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
         const parts = dateInput.split('-');
         const utcDate = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
         return utcDate.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC'
        });
    }

    // For full ISO strings or Date objects, use default toLocaleDateString behavior
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
        // timeZone: 'UTC' // Consider if all dates should be treated as UTC for display
    });
}

/**
 * Formats a time string (HH:MM) into a 12-hour format with AM/PM.
 * @param {string} timeString - The time string in HH:MM format.
 * @returns {string} The formatted time string, or 'Not set'.
 */
function formatTime(timeString) {
    if (!timeString) return 'Not set';
    const [hours, minutes] = timeString.split(':');
    if (isNaN(parseInt(hours)) || isNaN(parseInt(minutes))) return 'Invalid Time';

    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHours = h % 12 || 12; // Converts 0 or 12 to 12

    return `${String(formattedHours).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

/**
 * Formats estimated hours and minutes into a readable string.
 * @param {number|string} hours - The number of hours.
 * @param {number|string} minutes - The number of minutes.
 * @returns {string} The formatted duration string (e.g., "1 hr 30 mins", "2 hrs", "45 mins", "Not set").
 */
function formatDuration(hours, minutes) {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;

    if (h === 0 && m === 0) {
        return 'Not set';
    }

    let parts = [];
    if (h > 0) {
        parts.push(`${h} hr${h > 1 ? 's' : ''}`);
    }
    if (m > 0) {
        parts.push(`${m} min${m > 1 ? 's' : ''}`);
    }
    return parts.join(' ');
}

/**
 * Converts milliseconds into a HMS (Hours:Minutes:Seconds) string format.
 * @param {number} ms - The duration in milliseconds.
 * @returns {string} The formatted HMS string (e.g., "01:30:45"), or "00:00:00" if input is invalid.
 */
function formatMillisecondsToHMS(ms) {
    if (ms === null || typeof ms === 'undefined' || ms < 0 || isNaN(ms)) {
        return "00:00:00";
    }
    let totalSeconds = Math.floor(ms / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// If we adopt ES6 modules later, we would use:
// export { getTodayDateString, getDateString, formatDate, formatTime, formatDuration, formatMillisecondsToHMS };
