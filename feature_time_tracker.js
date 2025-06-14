// feature_time_tracker.js
// Manages the UI and logic for the Time Tracker feature page.

import LoggingService from './loggingService.js';
import TimeTrackerService from './timeTrackerService.js';
import { formatMillisecondsToHMS } from './utils.js';

// --- Internal State ---
let _updateInterval = null;

// --- DOM Element References ---
let trackedItemsContainer;
let currentTrackingSection, currentTrackingName, currentTrackingTime;
let startStopBtn, pauseBtn; // Assuming pause is for future use

// --- Color and Icon Mappings ---
const colorMap = {
    sky: 'text-sky-400',
    purple: 'text-purple-400',
    yellow: 'text-yellow-400',
    green: 'text-green-400',
    red: 'text-red-400',
    pink: 'text-pink-400',
    indigo: 'text-indigo-400',
};

// --- Rendering Functions ---

function renderTrackedItems() {
    if (!trackedItemsContainer) return;

    const logEntries = TimeTrackerService.getLogEntries('today');
    const activities = TimeTrackerService.getActivities();

    trackedItemsContainer.innerHTML = ''; // Clear existing items

    if (logEntries.length === 0) {
        trackedItemsContainer.innerHTML = '<p class="text-slate-400 italic">No time tracked yet today.</p>';
        return;
    }

    logEntries.forEach(log => {
        const activity = activities.find(a => a.id === log.activityId);
        if (!activity) return; // Skip logs with no matching activity

        const itemDiv = document.createElement('div');
        itemDiv.className = 'tracked-item flex items-center p-4 rounded-lg bg-slate-800 border-l-4 border-transparent';

        const icon = document.createElement('i');
        icon.className = `${activity.icon} text-xl ${colorMap[activity.color] || 'text-slate-400'} w-8 text-center mr-4`;

        const infoDiv = document.createElement('div');
        infoDiv.className = 'flex-grow';

        const nameP = document.createElement('p');
        nameP.className = 'font-semibold text-white';
        nameP.textContent = activity.name;

        const timeP = document.createElement('p');
        timeP.className = 'text-xs text-slate-400';
        const startTime = new Date(log.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const endTime = new Date(log.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timeP.textContent = `${startTime} - ${endTime}`;

        infoDiv.appendChild(nameP);
        infoDiv.appendChild(timeP);

        const durationSpan = document.createElement('span');
        durationSpan.className = 'font-mono text-lg text-white';
        durationSpan.textContent = formatMillisecondsToHMS(log.durationMs).substring(0, 5); // Show HH:MM

        itemDiv.appendChild(icon);
        itemDiv.appendChild(infoDiv);
        itemDiv.appendChild(durationSpan);

        trackedItemsContainer.appendChild(itemDiv);
    });
}

function updateCurrentlyTrackingUI() {
    if (!currentTrackingSection) return;

    const activeTimer = TimeTrackerService.getActiveTimer();

    if (!activeTimer) {
        currentTrackingSection.classList.add('hidden');
        if (_updateInterval) {
            clearInterval(_updateInterval);
            _updateInterval = null;
        }
        return;
    }

    currentTrackingSection.classList.remove('hidden');
    const activity = TimeTrackerService.getActivities().find(a => a.id === activeTimer.activityId);

    if (currentTrackingName) {
        currentTrackingName.textContent = `Currently tracking: ${activity ? activity.name : '...'}`;
    }

    const updateTime = () => {
        if (currentTrackingTime) {
            const elapsedMs = new Date().getTime() - new Date(activeTimer.startTime).getTime();
            currentTrackingTime.textContent = formatMillisecondsToHMS(elapsedMs);
        }
    };

    if (_updateInterval) clearInterval(_updateInterval);
    _updateInterval = setInterval(updateTime, 1000);
    updateTime(); // Initial call
}


function renderActivityButtons() {
    // This function will render the clickable activity "cards" that start the timers.
    // For now, the placeholder HTML has static cards. We'll make them dynamic.
    const goalsContainer = document.querySelector('.flex.gap-4.overflow-x-auto');
    if (!goalsContainer) return;

    goalsContainer.innerHTML = ''; // Clear static items
    const activities = TimeTrackerService.getActivities();

    activities.forEach(activity => {
        const card = document.createElement('div');
        card.className = 'text-center p-2 cursor-pointer';
        card.title = `Start tracking ${activity.name}`;
        card.innerHTML = `
            <div class="w-16 h-16 flex items-center justify-center">
                 <i class="${activity.icon} ${colorMap[activity.color] || 'text-slate-400'} text-3xl"></i>
            </div>
            <p class="text-xs mt-1">${activity.name}</p>
        `;
        card.onclick = () => {
            TimeTrackerService.startTracking(activity.id);
            updateCurrentlyTrackingUI();
            // Re-rendering the log can wait until it's stopped
        };
        goalsContainer.appendChild(card);
    });
}


function renderAll() {
    renderActivityButtons();
    renderTrackedItems();
    updateCurrentlyTrackingUI();
}

function initialize() {
    const functionName = 'initialize (TimeTrackerFeature)';

    if (!document.querySelector('body.bg-gradient-to-br')) { // Simple check for time-tracker.html
        LoggingService.debug('[TimeTrackerFeature] Not on time-tracker page. Skipping initialization.', { functionName });
        return;
    }
    LoggingService.info('[TimeTrackerFeature] Initializing...', { functionName });

    // Initialize the service first
    TimeTrackerService.initialize();

    // Get DOM elements
    trackedItemsContainer = document.querySelector('.space-y-2');
    currentTrackingSection = document.querySelector('.bg-slate-800.p-4.rounded-lg');
    currentTrackingName = currentTrackingSection ? currentTrackingSection.querySelector('span.font-medium') : null;
    currentTrackingTime = currentTrackingSection ? currentTrackingSection.querySelector('span.text-2xl') : null;
    
    // Buttons in the "currently tracking" bar
    pauseBtn = currentTrackingSection ? currentTrackingSection.querySelector('button.text-slate-400:nth-of-type(1)') : null;
    startStopBtn = currentTrackingSection ? currentTrackingSection.querySelector('button.text-slate-400:nth-of-type(2)') : null;


    if (startStopBtn) {
        startStopBtn.innerHTML = '<i class="fas fa-stop"></i>'; // Change to stop icon
        startStopBtn.onclick = () => {
            TimeTrackerService.stopTracking();
            updateCurrentlyTrackingUI();
            renderTrackedItems(); // Re-render log to show the new entry
        };
    }

    if (pauseBtn) {
        // Pause functionality can be added later
        pauseBtn.classList.add('hidden');
    }
    
    // Initial render
    renderAll();
    
    LoggingService.info('[TimeTrackerFeature] Initialized.', { functionName });
}

// Although not part of a feature flag system yet, we maintain the structure
export const TimeTrackerFeature = {
    initialize,
    updateUIVisibility: () => {} // Placeholder
};