// feature_time_tracker.js
// Manages the UI and logic for the Time Tracker feature page.

import LoggingService from './loggingService.js';
import TimeTrackerService from './timeTrackerService.js';
import { formatMillisecondsToHMS } from './utils.js';
import EventBus from './eventBus.js';

// --- Internal State ---
let _updateInterval = null;

// --- DOM Element References ---
let trackedItemsContainer;
let activityButtonsContainer;
let addManualEntryBtn;

// --- Tracking Display References ---
let trackingDisplayContainer, trackingStatusText, trackingTimeDisplay, stopBtn;

// --- Modal DOM Element References ---
let manageActivitiesModal, manageActivitiesDialog, closeManageActivitiesModalBtn;
let addActivityForm, activityNameInput, activityIconSelect, activityIconInput, activityColorInput;
let existingActivitiesList, manageActivitiesBtn;

// --- Time Entry Modal DOM Element References ---
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
    { name: 'Building / Office', class: 'fas fa-building' },
    { name: 'Terminal / Command Line', class: 'fas fa-terminal' },
    { name: 'Meeting / Team', class: 'fas fa-users' },
    { name: 'Handshake / Client', class: 'fas fa-handshake' },
    { name: 'Presentation / Teaching', class: 'fas fa-person-chalkboard' },
    { name: 'Design / Art', class: 'fas fa-paint-brush' },
    { name: 'Palette / Graphics', class: 'fas fa-palette' },
    { name: 'Drafting / Planning', class: 'fas fa-drafting-compass' },
    { name: 'Magic Wand / Creative', class: 'fas fa-wand-magic-sparkles' },
    { name: 'Learning / Studying', class: 'fas fa-book-open' },
    { name: 'Graduation / School', class: 'fas fa-graduation-cap' },
    { name: 'Brain / Thinking', class: 'fas fa-brain' },
    { name: 'Lightbulb / Ideas', class: 'fas fa-lightbulb' },
    { name: 'Phone / Calls', class: 'fas fa-phone' },
    { name: 'Email / Inbox', class: 'fas fa-envelope' },
    { name: 'Comments / Communication', class: 'fas fa-comments' },
    { name: 'Bullhorn / Marketing', class: 'fas fa-bullhorn' },
    { name: 'Coffee Break', class: 'fas fa-coffee' },
    { name: 'Lunch / Food', class: 'fas fa-utensils' },
    { name: 'Tea Break', class: 'fas fa-mug-hot' },
    { name: 'Exercise / Gym', class: 'fas fa-dumbbell' },
    { name: 'Heartbeat / Health', class: 'fas fa-heart-pulse' },
    { name: 'Running / Jogging', class: 'fas fa-running' },
    { name: 'Biking / Cycling', class: 'fas fa-bicycle' },
    { name: 'Gaming / Hobby', class: 'fas fa-gamepad' },
    { name: 'Music / Listening', class: 'fas fa-music' },
    { name: 'Film / Movies', class: 'fas fa-film' },
    { name: 'Book / Reading', class: 'fas fa-book' },
    { name: 'Shopping / Errands', class: 'fas fa-shopping-cart' },
    { name: 'Finance / Budgeting', class: 'fas fa-piggy-bank' },
    { name: 'Chart / Analytics', class: 'fas fa-chart-line' },
    { name: 'Calculator / Accounting', class: 'fas fa-calculator' },
    { name: 'Home / Chores', class: 'fas fa-home' },
    { name: 'Wrench / DIY', class: 'fas fa-wrench' },
    { name: 'Broom / Cleaning', class: 'fas fa-broom' },
    { name: 'Bed / Rest', class: 'fas fa-bed' },
    { name: 'Travel / Commute', class: 'fas fa-plane' },
    { name: 'Car / Driving', class: 'fas fa-car' },
    { name: 'Suitcase / Packing', class: 'fas fa-suitcase-rolling' },
    { name: 'Map / Navigation', class: 'fas fa-map-location-dot' },
    { name: 'Admin / Settings', class: 'fas fa-cog' },
    { name: 'Checkmark / Done', class: 'fas fa-check' },
    { name: 'Flag / Goals', class: 'fas fa-flag' },
    { name: 'Fire / Urgent', class: 'fas fa-fire' },
    { name: 'Atom / Science', class: 'fas fa-atom' },
    { name: 'Globe / World', class: 'fas fa-globe' },
    { name: 'Meditation / Mindfulness', class: 'fas fa-om' },
    { name: 'Writing / Journaling', class: 'fas fa-pen-nib' },
    { name: 'Podcast / Audio', class: 'fas fa-podcast' },
    { name: 'Video / Recording', class: 'fas fa-video' },
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
        // Prepending a simple character to prevent rendering issues
        option.textContent = `► ${icon.name}`;
        activityIconSelect.appendChild(option);
    });
}

function renderTrackedItems() {
    if (!trackedItemsContainer) {
        LoggingService.error("[TimeTrackerFeature] Tracked items container not found! Cannot render list.", null, { functionName: 'renderTrackedItems' });
        return;
    }

    const activities = TimeTrackerService.getActivities();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const logEntries = TimeTrackerService.getLogEntries().filter(entry => new Date(entry.startTime) >= today);

    trackedItemsContainer.innerHTML = ''; 

    if (logEntries.length === 0) {
        trackedItemsContainer.innerHTML = '<p class="text-slate-400 italic">No time tracked yet today.</p>';
        return;
    }

    logEntries.forEach(log => {
        const activity = activities.find(a => a.id === log.activityId);
        if (!activity) return; 

        const itemDiv = document.createElement('div');
        itemDiv.className = 'tracked-item flex items-center p-4 rounded-lg bg-slate-800 border-l-4 border-transparent';

        const icon = document.createElement('i');
        icon.className = `${activity.icon || 'fas fa-stopwatch'} text-xl ${colorMap[activity.color] || 'text-slate-400'} w-8 text-center mr-4`;

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

        const notesP = document.createElement('p');
        notesP.className = 'text-sm text-slate-300 mt-1 italic';
        notesP.textContent = log.notes || '';
        if (!log.notes) notesP.classList.add('hidden');

        infoDiv.appendChild(nameP);
        infoDiv.appendChild(timeP);
        infoDiv.appendChild(notesP);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'tracked-item-actions flex items-center gap-2 ml-4';

        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
        editBtn.className = 'text-slate-400 hover:text-sky-400 transition-colors';
        editBtn.title = 'Edit Entry';
        editBtn.onclick = () => openTimeEntryModal(log.id);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.className = 'text-slate-400 hover:text-red-500 transition-colors';
        deleteBtn.title = 'Delete Entry';
        deleteBtn.onclick = async () => {
            if (confirm('Are you sure you want to delete this time entry?')) {
                await TimeTrackerService.deleteLogEntry(log.id);
            }
        };

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        const durationSpan = document.createElement('span');
        durationSpan.className = 'font-mono text-lg text-white';
        durationSpan.textContent = formatMillisecondsToHMS(log.durationMs);

        itemDiv.appendChild(icon);
        itemDiv.appendChild(infoDiv);
        itemDiv.appendChild(durationSpan);
        itemDiv.appendChild(actionsDiv);

        trackedItemsContainer.appendChild(itemDiv);
    });
}

function updateCurrentlyTrackingUI() {
    if (!trackingDisplayContainer) return;

    if (_updateInterval) clearInterval(_updateInterval);

    const activeTimer = TimeTrackerService.getActiveTimer();
    trackingDisplayContainer.classList.remove('hidden');

    if (activeTimer) {
        const activity = TimeTrackerService.getActivities().find(a => a.id === activeTimer.activityId);
        if(trackingStatusText) trackingStatusText.textContent = `Currently tracking: ${activity ? activity.name : '...'}`;
        
        const updateTime = () => {
            if (trackingTimeDisplay) {
                const elapsedMs = new Date().getTime() - new Date(activeTimer.startTime).getTime();
                trackingTimeDisplay.textContent = formatMillisecondsToHMS(elapsedMs);
            }
        };
        _updateInterval = setInterval(updateTime, 1000);
        updateTime();
        if(stopBtn) stopBtn.classList.remove('hidden');

    } else {
        if(trackingStatusText) trackingStatusText.textContent = 'Time Tracked Today';
        const totalMs = TimeTrackerService.getTodaysTotalTrackedMs();
        if(trackingTimeDisplay) trackingTimeDisplay.textContent = formatMillisecondsToHMS(totalMs);
        if(stopBtn) stopBtn.classList.add('hidden');
    }
}

function renderActivityButtons() {
    if (!activityButtonsContainer) return;
    const activities = TimeTrackerService.getActivities();
    activityButtonsContainer.innerHTML = ''; 
    if (!activities || activities.length === 0) {
        activityButtonsContainer.innerHTML = `<p class="text-slate-400 italic text-sm p-4">No activities created. Click "Manage Activities" to add some.</p>`;
        return;
    }
    activities.forEach(activity => {
        const card = document.createElement('div');
        card.className = 'text-center p-2 cursor-pointer';
        card.title = `Start tracking ${activity.name}`;
        card.innerHTML = `
            <div class="w-16 h-16 flex items-center justify-center">
                 <i class="${activity.icon || 'fas fa-stopwatch'} ${colorMap[activity.color] || 'text-slate-400'} text-3xl"></i>
            </div>
            <p class="text-xs mt-1 text-slate-300">${activity.name}</p>
        `;
        card.onclick = () => {
            TimeTrackerService.startTracking(activity.id);
            updateCurrentlyTrackingUI();
        };
        activityButtonsContainer.appendChild(card);
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

function openManageActivitiesModal() {
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

function openTimeEntryModal(logId = null) {
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
    const logId = timeEntryLogId.value;
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
    if (!document.getElementById('timeTrackerHeader')) {
        LoggingService.debug('[TimeTrackerFeature] Not on time-tracker page. Skipping initialization.', { functionName });
        return;
    }
    LoggingService.info('[TimeTrackerFeature] Initializing...', { functionName });
    TimeTrackerService.initialize();

    // Get all DOM element references
    trackedItemsContainer = document.getElementById('trackedItemsContainer');
    activityButtonsContainer = document.getElementById('activityButtonsContainer');
    trackingDisplayContainer = document.getElementById('trackingDisplayContainer');
    if (trackingDisplayContainer) {
        trackingStatusText = trackingDisplayContainer.querySelector('#trackingStatusText');
        trackingTimeDisplay = trackingDisplayContainer.querySelector('#trackingTimeDisplay');
        stopBtn = trackingDisplayContainer.querySelector('#stopBtn');
    }
    manageActivitiesModal = document.getElementById('manageActivitiesModal');
    manageActivitiesDialog = document.getElementById('manageActivitiesDialog');
    closeManageActivitiesModalBtn = document.getElementById('closeManageActivitiesModalBtn');
    addActivityForm = document.getElementById('addActivityForm');
    activityNameInput = document.getElementById('activityNameInput');
    activityIconSelect = document.getElementById('activityIconSelect');
    activityIconInput = document.getElementById('activityIconInput');
    activityColorInput = document.getElementById('activityColorInput');
    existingActivitiesList = document.getElementById('existingActivitiesList');
    manageActivitiesBtn = document.getElementById('manageActivitiesBtn');
    addManualEntryBtn = document.getElementById('addManualEntryBtn');
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
    if (manageActivitiesBtn) manageActivitiesBtn.addEventListener('click', openManageActivitiesModal);
    if (closeManageActivitiesModalBtn) closeManageActivitiesModalBtn.addEventListener('click', closeManageActivitiesModal);
    if (addActivityForm) addActivityForm.addEventListener('submit', handleAddActivityFormSubmit);
    if (addManualEntryBtn) addManualEntryBtn.addEventListener('click', () => openTimeEntryModal());
    if (timeEntryForm) timeEntryForm.addEventListener('submit', handleTimeEntryFormSubmit);
    if (closeTimeEntryModalBtn) closeTimeEntryModalBtn.addEventListener('click', closeTimeEntryModal);
    if (cancelTimeEntryBtn) cancelTimeEntryBtn.addEventListener('click', closeTimeEntryModal);
    
    if (stopBtn) {
        stopBtn.onclick = async () => {
            await TimeTrackerService.stopTracking();
            updateCurrentlyTrackingUI();
        };
    }
    
    if (activityIconSelect) {
        activityIconSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                activityIconInput.value = e.target.value;
            }
        });
    }
    
    // Subscribe to AppStore events for reactive UI updates
    EventBus.subscribe('timeActivitiesChanged', () => {
        renderActivityButtons();
        if (manageActivitiesModal && !manageActivitiesModal.classList.contains('hidden')) {
            renderManageActivitiesList();
        }
    });

    EventBus.subscribe('timeLogEntriesChanged', () => {
        renderTrackedItems();
        updateCurrentlyTrackingUI(); // Also update total when entries change
    });

    // Initial Render
    renderActivityButtons();
    renderTrackedItems();
    updateCurrentlyTrackingUI();
    
    LoggingService.info('[TimeTrackerFeature] Initialized and event bus subscriptions are active.', { functionName });
}

export const TimeTrackerFeature = {
    initialize,
    updateUIVisibility: () => {} 
};