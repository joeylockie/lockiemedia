// utils.js
// This file contains general utility functions for date and time formatting,
// and other helper functions that can be used across the application.

// NEW: Import LoggingService
import LoggingService from './loggingService.js';

/**
 * Returns the current date as a string in YYYY-MM-DD format.
 * @returns {string} Today's date.
 */
export function getTodayDateString() { //
    return new Date().toISOString().split('T')[0]; //
}

/**
 * Converts a Date object to a string in YYYY-MM-DD format.
 * @param {Date} date - The date object to format.
 * @returns {string} The formatted date string.
 */
export function getDateString(date) {
    const functionName = 'getDateString'; // For logging context
    if (!(date instanceof Date) || isNaN(date.getTime())) { //
        // MODIFIED: Use LoggingService
        LoggingService.warn(`[Utils] ${functionName}: Invalid date object provided. Falling back to today.`, { functionName, providedDate: date });
        return new Date().toISOString().split('T')[0]; // Fallback to today //
    }
    return date.toISOString().split('T')[0]; //
}

/**
 * Formats a date string or Date object into a more readable format (e.g., "May 19, 2025").
 * @param {string|Date} dateInput - The date string (YYYY-MM-DD or full ISO) or Date object.
 * @returns {string} The formatted date string, or 'Invalid Date'/'Not set'.
 */
export function formatDate(dateInput) {
    const functionName = 'formatDate'; // For logging context
    if (!dateInput) return 'Not set'; //
    const date = new Date(dateInput); //
    if (isNaN(date.getTime())) { //
        if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) { //
            const parts = dateInput.split('-'); //
            const utcDate = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))); //
            if (!isNaN(utcDate.getTime())) { //
                return utcDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }); //
            }
        }
        // MODIFIED: Log invalid date input if it's not just empty
        LoggingService.debug(`[Utils] ${functionName}: Received invalid dateInput.`, { functionName, dateInput });
        return 'Invalid Date'; //
    }
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) { //
         const parts = dateInput.split('-'); //
         const utcDate = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))); //
         return utcDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }); //
    }
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); //
}

/**
 * Formats a time string (HH:MM) into a 12-hour format with AM/PM.
 * @param {string} timeString - The time string in HH:MM format.
 * @returns {string} The formatted time string, or 'Not set'.
 */
export function formatTime(timeString) {
    const functionName = 'formatTime'; // For logging context
    if (!timeString) return 'Not set'; //
    const [hours, minutes] = timeString.split(':'); //
    if (isNaN(parseInt(hours)) || isNaN(parseInt(minutes))) { //
        // MODIFIED: Log invalid time string
        LoggingService.debug(`[Utils] ${functionName}: Received invalid timeString.`, { functionName, timeString });
        return 'Invalid Time';
    }
    const h = parseInt(hours, 10); //
    const m = parseInt(minutes, 10); //
    const ampm = h >= 12 ? 'PM' : 'AM'; //
    const formattedHours = h % 12 || 12; //
    return `${String(formattedHours).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`; //
}

/**
 * Formats estimated hours and minutes into a readable string.
 * @param {number|string} hours - The number of hours.
 * @param {number|string} minutes - The number of minutes.
 * @returns {string} The formatted duration string.
 */
export function formatDuration(hours, minutes) {
    // No console logs here in original, so no changes needed for LoggingService unless desired for new logging.
    const h = parseInt(hours) || 0; //
    const m = parseInt(minutes) || 0; //
    if (h === 0 && m === 0) return 'Not set'; //
    let parts = []; //
    if (h > 0) parts.push(`${h} hr${h > 1 ? 's' : ''}`); //
    if (m > 0) parts.push(`${m} min${m > 1 ? 's' : ''}`); //
    return parts.join(' '); //
}

/**
 * Converts milliseconds into a HMS (Hours:Minutes:Seconds) string format.
 * @param {number} ms - The duration in milliseconds.
 * @returns {string} The formatted HMS string.
 */
export function formatMillisecondsToHMS(ms) {
    const functionName = 'formatMillisecondsToHMS'; // For logging context
    if (ms === null || typeof ms === 'undefined' || ms < 0 || isNaN(ms)) { //
        // MODIFIED: Log invalid input at debug level as this might be a common case for "00:00:00"
        LoggingService.debug(`[Utils] ${functionName}: Invalid milliseconds value. Returning "00:00:00".`, { functionName, ms });
        return "00:00:00"; //
    }
    let totalSeconds = Math.floor(ms / 1000); //
    let hours = Math.floor(totalSeconds / 3600); //
    totalSeconds %= 3600; //
    let minutes = Math.floor(totalSeconds / 60); //
    let seconds = totalSeconds % 60; //
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`; //
}

// MODIFIED: Use LoggingService
LoggingService.debug("utils.js loaded as ES6 module.", { module: 'utils' });