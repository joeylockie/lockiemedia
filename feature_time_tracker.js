// feature_time_tracker.js
// Manages the UI and logic for the Time Tracker feature page (REDESIGNED).

import LoggingService from './loggingService.js';
import TimeTrackerService from './timeTrackerService.js';
import { formatMillisecondsToHMS } from './utils.js';
import EventBus from './eventBus.js';

// --- Internal State ---
let _updateIntervals = {}; // Use an object to manage multiple timer intervals

// --- DOM Element References ---
let trackingCardsContainer, activityGrid;
let floatingAddBtn, manageActivitiesLink;

// --- Modal DOM Element References ---
let manageActivitiesModal, manageActivitiesDialog, closeManageActivitiesModalBtn;
let addActivityForm, activityNameInput, activityIconSelect, activityIconInput, activityColorInput;
let existingActivitiesList;
let timeEntryModal, timeEntryDialog, timeEntryModalTitle, closeTimeEntryModalBtn, cancelTimeEntryBtn;
let timeEntryForm, timeEntryLogId, timeEntryActivitySelect, timeEntryDate, timeEntryStartTime, timeEntryEndTime, timeEntryNotes, saveTimeEntryBtn;


// --- Color and Icon Mappings ---
const colorMap = {
    sky: 'text-sky-400',
    purple: 'text-purple-400',
    yellow: 'text-yellow-400',
    green: 'text-green-400',
    red: 'text-red-400',
    pink: 'text-pink-400',
    indigo: 'text-indigo-400',
    blue: 'text-blue-400',
};

const iconSuggestions = [
    { name: 'Default Stop Watch', class: 'fas fa-stopwatch' },
    { name: 'Code / Development', class: 'fas fa-code' },
    { name: 'Briefcase / Work', class: 'fas fa-briefcase' },
    { name: 'Meeting / Team', class: 'fas fa-users' },
    { name: 'Design / Art', class: 'fas fa-paint-brush' },
    { name: 'Learning / Studying', class: 'fas fa-book-open' },
    { name: 'Phone / Calls', class: 'fas fa-phone' },
    { name: 'Email / Inbox', class: 'fas fa-envelope' },
    { name: 'Coffee Break', class: 'fas fa-coffee' },
    { name: 'Lunch / Food', class: 'fas fa-utensils' },
    { name: 'Exercise / Gym', class: 'fas fa-dumbbell' },
    { name: 'Gaming / Hobby', class: 'fas fa-gamepad' },
    { name: 'Music / Listening', class: 'fas fa-music' },
    { name: 'Shopping / Errands', class: 'fas fa-shopping-cart' },
    { name: 'Home / Chores', class: 'fas fa-home' },
];

// --- Rendering Functions ---

function populateIconSelect() {
    if (!activityIconSelect) return;
    activityIconSelect.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '--- Select a preset icon ---';
    activityIconSelect.appendChild(defaultOption);
    iconSuggestions.forEach(icon => {
        const option = document.createElement('option');
        option.value = icon.class;
        option.textContent = `► ${icon.name}`;
        activityIconSelect.appendChild(option);
    });
}

function renderTrackingCards() {
    if (!trackingCardsContainer) return;

    Object.values(_updateIntervals).forEach(clearInterval);
    _updateIntervals = {};
    trackingCardsContainer.innerHTML = '<h2 class="text-2xl font-bold text-white mb-4">Currently Tracking</h2>';

    const activeTimers = TimeTrackerService.getActiveTimers(); // Get the array of timers

    if (activeTimers.length > 0) {
        activeTimers.forEach(timer => {
            const activity = TimeTrackerService.getActivities().find(a => a.id === timer.activityId);
            if (activity) {
                trackingCardsContainer.appendChild(createTrackingCard(activity, timer));
            }
        });
    } else {
        trackingCardsContainer.innerHTML += '<p class="text-gray-400 text-sm">No active timers. Select an activity from the right to start tracking!</p>';
    }
}

function createTrackingCard(activity, timerData) {
    const card = document.createElement('section');
    card.className = 'bg-gray-800 rounded-xl shadow-lg p-6 mb-6';
    const timerId = `timer-${activity.id}`;
    const isPaused = timerData.isPaused;

    let actionButtonsHTML = '';
    if (isPaused) {
        actionButtonsHTML = `
            <button data-activity-id="${activity.id}" class="resume-btn p-3 rounded-full text-green-400 hover:text-green-300 transition duration-200" title="Resume">
                <i class="fas fa-play text-lg"></i>
            </button>
            <button data-activity-id="${activity.id}" class="stop-btn p-3 rounded-full text-red-400 hover:text-red-300 transition duration-200" title="Stop">
                <i class="fas fa-stop text-lg"></i>
            </button>
        `;
    } else {
         actionButtonsHTML = `
            <button data-activity-id="${activity.id}" class="pause-btn p-3 rounded-full text-blue-400 hover:text-blue-300 transition duration-200" title="Pause">
                <i class="fas fa-pause text-lg"></i>
            </button>
            <button data-activity-id="${activity.id}" class="stop-btn p-3 rounded-full text-red-400 hover:text-red-300 transition duration-200" title="Stop">
                <i class="fas fa-stop text-lg"></i>
            </button>
        `;
    }

    card.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
                <div class="mr-4">
                    <i class="${activity.icon || 'fas fa-stopwatch'} ${colorMap[activity.color] || 'text-gray-400'} text-xl"></i>
                </div>
                <div>
                    <p class="text-lg font-semibold text-white">${activity.name}</p>
                    <p class="text-sm text-gray-400">${activity.description || 'Tracked activity'}</p>
                </div>
            </div>
            <div class="flex space-x-2">${actionButtonsHTML}</div>
        </div>
        <div id="${timerId}" class="text-right text-3xl font-mono font-bold ${isPaused ? 'text-gray-500' : 'text-blue-400'}">
            ...
        </div>
    `;

    const timerDisplay = card.querySelector(`#${timerId}`);

    function updateTimerDisplay() {
        let elapsedMs;
        if (isPaused) {
            elapsedMs = timerData.pauseTime.getTime() - timerData.startTime.getTime();
        } else {
            elapsedMs = new Date().getTime() - timerData.startTime.getTime();
        }
        if (timerDisplay) timerDisplay.textContent = formatMillisecondsToHMS(elapsedMs);
    }

    if (!isPaused) {
        _updateIntervals[activity.id] = setInterval(updateTimerDisplay, 1000);
    }
    
    updateTimerDisplay(); // Initial display

    card.querySelector('.stop-btn')?.addEventListener('click', (e) => TimeTrackerService.stopTracking(parseInt(e.currentTarget.dataset.activityId)));
    card.querySelector('.pause-btn')?.addEventListener('click', (e) => TimeTrackerService.pauseTracking(parseInt(e.currentTarget.dataset.activityId)));
    card.querySelector('.resume-btn')?.addEventListener('click', (e) => TimeTrackerService.resumeTracking(parseInt(e.currentTarget.dataset.activityId)));
    
    return card;
}


function renderActivityGrid() {
    if (!activityGrid) return;
    const activities = TimeTrackerService.getActivities();
    activityGrid.innerHTML = '';

    if (!activities || activities.length === 0) {
        activityGrid.innerHTML = `<p class="text-gray-400 col-span-full">No activities created yet. Click on "Activities" in the sidebar to add some.</p>`;
        return;
    }

    activities.forEach(activity => {
        const card = document.createElement('div');
        card.className = 'flex flex-col items-center justify-center bg-gray-800 p-4 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition duration-200 h-full';
        card.title = `Start tracking ${activity.name}`;
        card.innerHTML = `
            <div class="mb-2">
                <i class="${activity.icon || 'fas fa-stopwatch'} ${colorMap[activity.color] || 'text-gray-400'} text-2xl"></i>
            </div>
            <p class="text-sm font-medium text-gray-200 break-words text-center">${activity.name}</p>
        `;
        card.addEventListener('click', () => {
            TimeTrackerService.startTracking(activity.id);
        });
        activityGrid.appendChild(card);
    });
}


// --- Modal Management Functions ---

function renderManageActivitiesList() {
    if (!existingActivitiesList) return;
    const activities = TimeTrackerService.getActivities();
    existingActivitiesList.innerHTML = '';
    if (!activities || activities.length === 0) {
        existingActivitiesList.innerHTML = `<p class="text-slate-400 text-sm italic text-center p-2">No activities yet.</p>`;
        return;
    }
    activities.forEach(activity => {
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between p-2 bg-slate-700 rounded-md';
        const nameSpan = document.createElement('span');
        nameSpan.className = 'text-slate-200';
        nameSpan.innerHTML = `<i class="${activity.icon || 'fas fa-stopwatch'} ${colorMap[activity.color] || 'text-slate-400'} w-5 mr-2"></i> ${activity.name}`;
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = `<i class="fas fa-trash-alt text-red-500 hover:text-red-400"></i>`;
        deleteBtn.title = `Delete "${activity.name}"`;
        deleteBtn.onclick = async () => {
            if (confirm(`Are you sure you want to delete the activity "${activity.name}"? This cannot be undone.`)) {
                await TimeTrackerService.deleteActivity(activity.id);
            }
        };
        li.appendChild(nameSpan);
        li.appendChild(deleteBtn);
        existingActivitiesList.appendChild(li);
    });
}

export function openManageActivitiesModal() {
    if (!manageActivitiesModal || !manageActivitiesDialog) return;
    renderManageActivitiesList();
    populateIconSelect();
    manageActivitiesModal.classList.remove('hidden');
    requestAnimationFrame(() => {
        manageActivitiesModal.classList.remove('opacity-0');
        manageActivitiesDialog.classList.remove('scale-95', 'opacity-0');
    });
}

function closeManageActivitiesModal() {
    if (!manageActivitiesModal || !manageActivitiesDialog) return;
    manageActivitiesModal.classList.add('opacity-0');
    manageActivitiesDialog.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        manageActivitiesModal.classList.add('hidden');
    }, 300);
}

async function handleAddActivityFormSubmit(event) {
    event.preventDefault();
    const activityData = {
        name: activityNameInput.value.trim(),
        icon: activityIconInput.value.trim() || 'fas fa-stopwatch',
        color: activityColorInput.value
    };
    if (!activityData.name) return;
    await TimeTrackerService.addActivity(activityData);
    addActivityForm.reset();
    activityIconSelect.value = '';
    activityNameInput.focus();
}

// --- Time Entry Modal Functions ---

export function openTimeEntryModal(logId = null) {
    timeEntryForm.reset();
    const activities = TimeTrackerService.getActivities();
    timeEntryActivitySelect.innerHTML = '';
    activities.forEach(act => {
        const option = document.createElement('option');
        option.value = act.id;
        option.textContent = act.name;
        timeEntryActivitySelect.appendChild(option);
    });

    if (logId) {
        timeEntryModalTitle.textContent = 'Edit Time Entry';
        const logEntry = TimeTrackerService.getLogEntries().find(log => log.id === logId);
        if (logEntry) {
            timeEntryLogId.value = logEntry.id;
            timeEntryActivitySelect.value = logEntry.activityId;
            const entryDate = new Date(logEntry.startTime);
            timeEntryDate.value = entryDate.toISOString().split('T')[0];
            timeEntryStartTime.value = entryDate.toTimeString().substring(0, 5);
            timeEntryEndTime.value = new Date(logEntry.endTime).toTimeString().substring(0, 5);
            timeEntryNotes.value = logEntry.notes || '';
        }
    } else {
        timeEntryModalTitle.textContent = 'Add Manual Entry';
        timeEntryLogId.value = '';
        const now = new Date();
        timeEntryDate.value = now.toISOString().split('T')[0];
    }

    timeEntryModal.classList.remove('hidden');
    requestAnimationFrame(() => {
        timeEntryModal.classList.remove('opacity-0');
        timeEntryDialog.classList.remove('scale-95', 'opacity-0');
    });
}

function closeTimeEntryModal() {
    timeEntryModal.classList.add('opacity-0');
    timeEntryDialog.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        timeEntryModal.classList.add('hidden');
    }, 300);
}

async function handleTimeEntryFormSubmit(event) {
    event.preventDefault();
    const logId = parseInt(timeEntryLogId.value, 10);
    const startTime = new Date(`${timeEntryDate.value}T${timeEntryStartTime.value}`);
    const endTime = new Date(`${timeEntryDate.value}T${timeEntryEndTime.value}`);

    if (endTime <= startTime) {
        alert('End time must be after start time.');
        return;
    }

    const logData = {
        activityId: timeEntryActivitySelect.value,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        notes: timeEntryNotes.value.trim()
    };

    if (logId) {
        await TimeTrackerService.updateLogEntry(logId, logData);
    } else {
        await TimeTrackerService.addLogEntry(logData);
    }
    closeTimeEntryModal();
}


function initialize() {
    const functionName = 'initialize (TimeTrackerFeature)';
    if (!document.getElementById('activityGrid')) {
        LoggingService.debug('[TimeTrackerFeature] Not on the redesigned time-tracker page. Skipping initialization.', { functionName });
        return;
    }
    LoggingService.info('[TimeTrackerFeature] Initializing...', { functionName });
    TimeTrackerService.initialize();

    // Get all DOM element references
    trackingCardsContainer = document.getElementById('trackingCardsContainer');
    activityGrid = document.getElementById('activityGrid');
    floatingAddBtn = document.getElementById('floatingAddBtn');
    manageActivitiesLink = document.getElementById('manageActivitiesLink');

    // Modal elements
    manageActivitiesModal = document.getElementById('manageActivitiesModal');
    manageActivitiesDialog = document.getElementById('manageActivitiesDialog');
    closeManageActivitiesModalBtn = document.getElementById('closeManageActivitiesModalBtn');
    addActivityForm = document.getElementById('addActivityForm');
    activityNameInput = document.getElementById('activityNameInput');
    activityIconSelect = document.getElementById('activityIconSelect');
    activityIconInput = document.getElementById('activityIconInput');
    activityColorInput = document.getElementById('activityColorInput');
    existingActivitiesList = document.getElementById('existingActivitiesList');
    timeEntryModal = document.getElementById('timeEntryModal');
    timeEntryDialog = document.getElementById('timeEntryDialog');
    timeEntryModalTitle = document.getElementById('timeEntryModalTitle');
    closeTimeEntryModalBtn = document.getElementById('closeTimeEntryModalBtn');
    cancelTimeEntryBtn = document.getElementById('cancelTimeEntryBtn');
    timeEntryForm = document.getElementById('timeEntryForm');
    timeEntryLogId = document.getElementById('timeEntryLogId');
    timeEntryActivitySelect = document.getElementById('timeEntryActivitySelect');
    timeEntryDate = document.getElementById('timeEntryDate');
    timeEntryStartTime = document.getElementById('timeEntryStartTime');
    timeEntryEndTime = document.getElementById('timeEntryEndTime');
    timeEntryNotes = document.getElementById('timeEntryNotes');
    saveTimeEntryBtn = document.getElementById('saveTimeEntryBtn');

    // Attach listeners
    if (manageActivitiesLink) manageActivitiesLink.addEventListener('click', openManageActivitiesModal);
    if (closeManageActivitiesModalBtn) closeManageActivitiesModalBtn.addEventListener('click', closeManageActivitiesModal);
    if (addActivityForm) addActivityForm.addEventListener('submit', handleAddActivityFormSubmit);
    if (floatingAddBtn) floatingAddBtn.addEventListener('click', () => openTimeEntryModal());
    if (timeEntryForm) timeEntryForm.addEventListener('submit', handleTimeEntryFormSubmit);
    if (closeTimeEntryModalBtn) closeTimeEntryModalBtn.addEventListener('click', closeTimeEntryModal);
    if (cancelTimeEntryBtn) cancelTimeEntryBtn.addEventListener('click', closeTimeEntryModal);

    if (activityIconSelect) {
        activityIconSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                activityIconInput.value = e.target.value;
            }
        });
    }
    
    // Subscribe to AppStore events for reactive UI updates
    EventBus.subscribe('timeActivitiesChanged', () => {
        renderActivityGrid();
        renderTrackingCards();
        if (manageActivitiesModal && !manageActivitiesModal.classList.contains('hidden')) {
            renderManageActivitiesList();
        }
    });

    EventBus.subscribe('timeLogEntriesChanged', renderTrackingCards);
    EventBus.subscribe('activeTimerChanged', renderTrackingCards);

    // Initial Render
    renderActivityGrid();
    renderTrackingCards();
    
    LoggingService.info('[TimeTrackerFeature] Initialized and event bus subscriptions are active.', { functionName });
}

export const TimeTrackerFeature = {
    initialize,
    openTimeEntryModal,
    openManageActivitiesModal,
    updateUIVisibility: () => {} 
};