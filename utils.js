// utils.js
// This file contains general utility functions for date and time formatting,
// and other helper functions that can be used across the application.

import LoggingService from './loggingService.js';

/**
 * Returns the current date as a string in YYYY-MM-DD format, respecting the user's local timezone.
 * @returns {string} Today's date.
 */
export function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Converts a Date object to a string in YYYY-MM-DD format, respecting the user's local timezone.
 * @param {Date} date - The date object to format.
 * @returns {string} The formatted date string.
 */
export function getDateString(date) {
    const functionName = 'getDateString'; // For logging context
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        LoggingService.warn(`[Utils] ${functionName}: Invalid date object provided. Falling back to today.`, { functionName, providedDate: date });
        return getTodayDateString(); // Fallback to today's local date
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


/**
 * Formats a date string or Date object into a more readable format (e.g., "Jul 30, 2025").
 * This function now correctly handles timezone offsets for YYYY-MM-DD strings.
 * @param {string|Date} dateInput - The date string (YYYY-MM-DD or full ISO) or Date object.
 * @returns {string} The formatted date string, or 'Invalid Date'/'Not set'.
 */
export function formatDate(dateInput) {
    const functionName = 'formatDate';
    if (!dateInput) return 'Not set';

    // To prevent timezone issues where "2025-07-30" might be interpreted as UTC midnight
    // and display as July 29th in some timezones, we add a neutral time component.
    const dateString = typeof dateInput === 'string' ? dateInput.split('T')[0] : dateInput;
    const date = new Date(`${dateString}T12:00:00`); // Use noon to avoid timezone shifts

    if (isNaN(date.getTime())) {
        LoggingService.debug(`[Utils] ${functionName}: Received invalid dateInput.`, { functionName, dateInput });
        return 'Invalid Date';
    }

    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC' // Since we set the time to noon UTC, this will correctly display the YYYY-MM-DD date
    });
}


/**
 * Formats a time string (HH:MM) into a 12-hour format with AM/PM.
 * @param {string} timeString - The time string in HH:MM format.
 * @returns {string} The formatted time string, or 'Not set'.
 */
export function formatTime(timeString) {
    const functionName = 'formatTime'; // For logging context
    if (!timeString) return 'Not set';

    // Handle full ISO strings (like from calendar events)
    if (timeString.includes('T')) {
        try {
            return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            // Fallback to original logic if parsing fails
        }
    }

    const [hours, minutes] = timeString.split(':');
    if (isNaN(parseInt(hours)) || isNaN(parseInt(minutes))) {
        LoggingService.debug(`[Utils] ${functionName}: Received invalid timeString.`, { functionName, timeString });
        return 'Invalid Time';
    }
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHours = h % 12 || 12;
    return `${String(formattedHours)}:${String(m).padStart(2, '0')} ${ampm}`;
}

/**
 * Formats estimated hours and minutes into a readable string.
 * @param {number|string} hours - The number of hours.
 * @param {number|string} minutes - The number of minutes.
 * @returns {string} The formatted duration string.
 */
export function formatDuration(hours, minutes) {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    if (h === 0 && m === 0) return 'Not set';
    let parts = [];
    if (h > 0) parts.push(`${h} hr${h > 1 ? 's' : ''}`);
    if (m > 0) parts.push(`${m} min${m > 1 ? 's' : ''}`);
    return parts.join(' ');
}

/**
 * Converts milliseconds into a HMS (Hours:Minutes:Seconds) string format.
 * @param {number} ms - The duration in milliseconds.
 * @returns {string} The formatted HMS string.
 */
export function formatMillisecondsToHMS(ms) {
    const functionName = 'formatMillisecondsToHMS'; // For logging context
    if (ms === null || typeof ms === 'undefined' || ms < 0 || isNaN(ms)) {
        LoggingService.debug(`[Utils] ${functionName}: Invalid milliseconds value. Returning "00:00:00".`, { functionName, ms });
        return "00:00:00";
    }
    let totalSeconds = Math.floor(ms / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
