// feature_calendar_view.js
// Placeholder for Calendar View Feature.
// Now an ES6 module.

import { isFeatureEnabled } from './featureFlagService.js';
import AppStore from './store.js'; // To get tasks if renderFullCalendar is implemented

// DOM elements (e.g., calendarViewContainer) are assumed to be global, initialized by ui_rendering.js

/**
 * Initializes the Calendar View feature.
 */
function initialize() {
    console.log('[CalendarViewFeature] Initialized (Placeholder).');
    // Future: Initialize calendar library instance here.
}

/**
 * Renders the full calendar display.
 * @param {HTMLElement} containerElement - The HTML element for the calendar.
 * @param {Array<Object>} tasksToDisplay - Tasks to display (typically from AppStore.getTasks()).
 */
function renderFullCalendar(containerElement, tasksToDisplay) {
    if (!isFeatureEnabled('calendarViewFeature')) {
        if(containerElement) containerElement.classList.add('hidden');
        return;
    }

    if (!containerElement) {
        console.error("[CalendarViewFeature] Container element not provided for rendering calendar.");
        return;
    }
    console.log('[CalendarViewFeature] Attempting to render full calendar (Placeholder)...');
    
    // The "Coming Soon!" message is in the HTML. This function would clear and render.
    // Example:
    // containerElement.innerHTML = ''; // Clear placeholder
    // const calendarEl = document.createElement('div');
    // calendarEl.textContent = 'Actual Calendar Would Be Here';
    // containerElement.appendChild(calendarEl);
    // containerElement.classList.remove('hidden'); 
    // (Visibility is actually handled by refreshTaskView in ui_rendering.js)
}

/**
 * Updates the visibility of UI elements specifically controlled by the Calendar View feature.
 * @param {boolean} isEnabledParam - (Not used directly, uses imported isFeatureEnabled)
 */
function updateUIVisibility(isEnabledParam) {
    if (typeof isFeatureEnabled !== 'function') {
        console.error("[CalendarViewFeature] isFeatureEnabled function not available.");
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('calendarViewFeature');
    
    // Handle generic elements with the class
    document.querySelectorAll('.calendar-view-feature-element').forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));
    
    // Specifically handle the toggle button if it doesn't have the generic class or needs special handling
    const calendarViewToggleBtn = document.getElementById('calendarViewToggleBtn');
    if (calendarViewToggleBtn) {
        calendarViewToggleBtn.classList.toggle('hidden', !isActuallyEnabled);
    }
    
    console.log(`[CalendarViewFeature] UI Visibility set based on flag: ${isActuallyEnabled}`);
}

export const CalendarViewFeature = {
    initialize,
    renderFullCalendar, // This is called by ui_rendering.js
    updateUIVisibility
};

console.log("feature_calendar_view.js loaded as ES6 module.");