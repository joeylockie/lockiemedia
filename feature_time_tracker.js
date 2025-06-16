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
let startStopBtn, pauseBtn; 
let activityButtonsContainer;
let addManualEntryBtn;

// --- Modal DOM Element References ---
let manageActivitiesModal, manageActivitiesDialog, closeManageActivitiesModalBtn;
let addActivityForm, activityNameInput, activityIconInput, activityColorInput;
let existingActivitiesList, manageActivitiesBtn;

// --- NEW: Time Entry Modal DOM Element References ---
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

// --- Rendering Functions ---

function renderTrackedItems(logEntries) {
    if (!trackedItemsContainer) {
        LoggingService.error("[TimeTrackerFeature] Tracked items container not found! Cannot render list.", null, { functionName: 'renderTrackedItems' });
        return;
    }

    const activities = TimeTrackerService.getActivities();
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
        const startTime = log.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const endTime = log.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timeP.textContent = `${startTime} - ${endTime}`;

        const notesP = document.createElement('p');
        notesP.className = 'text-sm text-slate-300 mt-1 italic';
        notesP.textContent = log.notes || ''; // Display notes
        if (!log.notes) notesP.classList.add('hidden'); // Hide if no notes

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
                try {
                    await TimeTrackerService.deleteLogEntry(log.id);
                } catch (error) {
                    LoggingService.error('Failed to delete time entry.', error, { logId: log.id });
                }
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
            const elapsedMs = new Date().getTime() - activeTimer.startTime.getTime();
            currentTrackingTime.textContent = formatMillisecondsToHMS(elapsedMs);
        }
    };
    if (_updateInterval) clearInterval(_updateInterval);
    _updateInterval = setInterval(updateTime, 1000);
    updateTime(); 
}

function renderActivityButtons(activities) {
    if (!activityButtonsContainer) return;
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
            <p class="text-xs mt-1">${activity.name}</p>
        `;
        card.onclick = () => {
            TimeTrackerService.startTracking(activity.id);
            updateCurrentlyTrackingUI();
        };
        activityButtonsContainer.appendChild(card);
    });
}

// --- Modal Management Functions ---

function renderManageActivitiesList(activities) {
    if (!existingActivitiesList) return;
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
                try {
                    await TimeTrackerService.deleteActivity(activity.id);
                } catch (error) {
                    LoggingService.error('Failed to delete activity via button.', error, { functionName: 'deleteBtn.onclick' });
                }
            }
        };
        li.appendChild(nameSpan);
        li.appendChild(deleteBtn);
        existingActivitiesList.appendChild(li);
    });
}

function openManageActivitiesModal() {
    if (!manageActivitiesModal || !manageActivitiesDialog) return;
    renderManageActivitiesList(TimeTrackerService.getActivities());
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
    const functionName = 'handleAddActivityFormSubmit';
    const activityData = {
        name: activityNameInput.value.trim(),
        icon: activityIconInput.value.trim() || 'fas fa-stopwatch',
        color: activityColorInput.value
    };
    if (!activityData.name) {
        LoggingService.warn('[TimeTrackerFeature] Activity name is required.', { functionName });
        return;
    }
    try {
        await TimeTrackerService.addActivity(activityData);
        addActivityForm.reset();
        activityNameInput.focus();
    } catch (error) {
        LoggingService.error('Failed to add activity via form.', error, { functionName });
    }
}

// --- NEW: Time Entry Modal Functions ---

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
        // Editing existing entry
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
        // Adding new entry
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

    try {
        if (logId) {
            // Update existing log
            await TimeTrackerService.updateLogEntry(logId, logData);
        } else {
            // Add new log
            await TimeTrackerService.addLogEntry(logData);
        }
        closeTimeEntryModal();
    } catch (error) {
        LoggingService.error('Failed to save time entry.', error);
        alert('Error saving time entry. Please check the console.');
    }
}


function initialize() {
    const functionName = 'initialize (TimeTrackerFeature)';
    if (!document.getElementById('timeTrackerHeader')) {
        LoggingService.debug('[TimeTrackerFeature] Not on time-tracker page. Skipping initialization.', { functionName });
        return;
    }
    LoggingService.info('[TimeTrackerFeature] Initializing...', { functionName });
    TimeTrackerService.initialize();

    trackedItemsContainer = document.getElementById('trackedItemsContainer');
    activityButtonsContainer = document.querySelector('.flex.gap-4.overflow-x-auto');
    currentTrackingSection = document.querySelector('.bg-slate-800.p-4.rounded-lg');
    currentTrackingName = currentTrackingSection ? currentTrackingSection.querySelector('span.font-medium') : null;
    currentTrackingTime = currentTrackingSection ? currentTrackingSection.querySelector('span.text-2xl') : null;
    startStopBtn = currentTrackingSection ? currentTrackingSection.querySelector('button.text-slate-400:nth-of-type(2)') : null;
    manageActivitiesModal = document.getElementById('manageActivitiesModal');
    manageActivitiesDialog = document.getElementById('manageActivitiesDialog');
    closeManageActivitiesModalBtn = document.getElementById('closeManageActivitiesModalBtn');
    addActivityForm = document.getElementById('addActivityForm');
    activityNameInput = document.getElementById('activityNameInput');
    activityIconInput = document.getElementById('activityIconInput');
    activityColorInput = document.getElementById('activityColorInput');
    existingActivitiesList = document.getElementById('existingActivitiesList');
    manageActivitiesBtn = document.getElementById('manageActivitiesBtn');
    addManualEntryBtn = document.getElementById('addManualEntryBtn');

    // Time Entry Modal elements
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
    
    if (startStopBtn) {
        startStopBtn.innerHTML = '<i class="fas fa-stop"></i>';
        startStopBtn.onclick = async () => {
            await TimeTrackerService.stopTracking();
            updateCurrentlyTrackingUI();
        };
    }
    
    TimeTrackerService.streamActivities((activities) => {
        renderActivityButtons(activities);
        if (manageActivitiesModal && !manageActivitiesModal.classList.contains('hidden')) {
            renderManageActivitiesList(activities);
        }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    TimeTrackerService.streamLogEntries(today, (logEntries) => {
        renderTrackedItems(logEntries);
    });
    
    updateCurrentlyTrackingUI();
    LoggingService.info('[TimeTrackerFeature] Initialized and data streams started.', { functionName });
}

export const TimeTrackerFeature = {
    initialize,
    updateUIVisibility: () => {} 
};