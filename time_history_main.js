// public/time_history_main.js

import LoggingService from './loggingService.js';
import AppStore from './store.js';
import TimeTrackerService from './timeTrackerService.js';
import { formatMillisecondsToHMS, getDateString, formatDate, formatTime } from './utils.js';
import { TimeTrackerFeature } from './feature_time_tracker.js';
import EventBus from './eventBus.js'; // This line is the fix

// --- DOM Element References ---
let startDateEl, endDateEl, runReportBtnEl, reportContainerEl, manageActivitiesBtn;

// --- Rendering Functions ---

/**
 * Renders the full report as a list of individual time log entries.
 * @param {Array<Object>} logEntries - A sorted array of log entries to display.
 */
function renderReport(logEntries) {
    reportContainerEl.innerHTML = '';
    const activities = TimeTrackerService.getActivities();

    if (logEntries.length === 0) {
        reportContainerEl.innerHTML = `
            <div class="text-center py-10 report-card">
                <i class="fas fa-search-minus text-5xl text-slate-500"></i>
                <h3 class="mt-4 text-xl font-semibold text-slate-300">No Data Found</h3>
                <p class="text-slate-400">There are no time entries for the selected date range.</p>
            </div>`;
        return;
    }

    const list = document.createElement('ul');
    list.className = 'space-y-3';

    logEntries.forEach(entry => {
        const activity = activities.find(a => a.id === entry.activityId);
        const li = document.createElement('li');
        li.className = 'report-card flex items-center justify-between gap-4';

        const activityName = activity ? activity.name : 'Unknown Activity';
        const startTime = new Date(entry.startTime);
        const endTime = new Date(entry.endTime);

        li.innerHTML = `
            <div class="flex-grow">
                <div class="flex items-center justify-between">
                    <p class="font-bold text-lg text-white">${activityName}</p>
                    <p class="font-mono text-xl text-sky-300">${formatMillisecondsToHMS(entry.durationMs)}</p>
                </div>
                <p class="text-sm text-slate-400">${formatDate(startTime)} from ${formatTime(startTime)} to ${formatTime(endTime)}</p>
                ${entry.notes ? `<p class="mt-2 text-sm text-slate-300 bg-slate-800 p-2 rounded-md">${entry.notes}</p>` : ''}
            </div>
            <div class="flex flex-col gap-2">
                <button class="edit-log-btn p-2 rounded-md hover:bg-slate-600 transition-colors" data-log-id="${entry.id}" title="Edit Entry">
                    <i class="fas fa-pencil-alt text-sky-400"></i>
                </button>
                <button class="delete-log-btn p-2 rounded-md hover:bg-slate-600 transition-colors" data-log-id="${entry.id}" title="Delete Entry">
                    <i class="fas fa-trash-alt text-red-500"></i>
                </button>
            </div>
        `;
        list.appendChild(li);
    });

    reportContainerEl.appendChild(list);
}


/**
 * Main function to generate and display the report based on date inputs.
 */
async function generateReport() {
    const functionName = 'generateReport';
    LoggingService.info('[TimeHistory] Generating report...', { functionName });

    const startDate = new Date(startDateEl.value + 'T00:00:00');
    const endDate = new Date(endDateEl.value + 'T23:59:59');

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        alert('Please select valid start and end dates.');
        return;
    }
    
    const allEntries = TimeTrackerService.getLogEntries();

    const filteredEntries = allEntries.filter(entry => {
        const entryDate = new Date(entry.startTime);
        return entryDate >= startDate && entryDate <= endDate;
    }).sort((a, b) => new Date(b.startTime) - new Date(a.startTime)); // Sort by most recent first
    
    renderReport(filteredEntries);
}

// --- Event Handlers ---
function setupEventListeners() {
    runReportBtnEl.addEventListener('click', generateReport);
    
    if (manageActivitiesBtn) {
        manageActivitiesBtn.addEventListener('click', () => {
             if (TimeTrackerFeature && TimeTrackerFeature.openManageActivitiesModal) {
                TimeTrackerFeature.openManageActivitiesModal();
            }
        });
    }

    reportContainerEl.addEventListener('click', async (e) => {
        const editBtn = e.target.closest('.edit-log-btn');
        const deleteBtn = e.target.closest('.delete-log-btn');

        if (editBtn) {
            const logId = parseInt(editBtn.dataset.logId, 10);
            if (TimeTrackerFeature && TimeTrackerFeature.openTimeEntryModal) {
                TimeTrackerFeature.openTimeEntryModal(logId);
            }
        }

        if (deleteBtn) {
            const logId = parseInt(deleteBtn.dataset.logId, 10);
            if (confirm('Are you sure you want to delete this time entry?')) {
                await TimeTrackerService.deleteLogEntry(logId);
                // The AppStore will publish an event, and the UI will auto-refresh
            }
        }
    });
}

// --- Initialization ---

document.addEventListener('DOMContentLoaded', async () => {
    const functionName = 'DOMContentLoaded (TimeHistoryMain)';
    document.body.style.visibility = 'visible';
    
    startDateEl = document.getElementById('startDate');
    endDateEl = document.getElementById('endDate');
    runReportBtnEl = document.getElementById('runReportBtn');
    reportContainerEl = document.getElementById('reportContainer');
    manageActivitiesBtn = document.getElementById('manageActivitiesBtn');

    try {
        LoggingService.info('[TimeHistory] Initializing Time History page...', { functionName });
        
        await AppStore.initializeStore();
        TimeTrackerService.initialize();
        // The TimeTrackerFeature is initialized on its own page, but we can still call its public functions
        // TimeTrackerFeature.initialize(); 

        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 6);

        endDateEl.value = getDateString(today);
        startDateEl.value = getDateString(sevenDaysAgo);

        setupEventListeners();
        
        // Listen for data changes to auto-refresh the report
        EventBus.subscribe('timeLogEntriesChanged', generateReport);
        
        LoggingService.info('[TimeHistory] Page initialized.', { functionName });
        
        await generateReport();

    } catch (error) {
        LoggingService.critical('[TimeHistory] A critical error occurred during initialization.', error, { functionName });
        if (reportContainerEl) {
            reportContainerEl.innerHTML = '<p class="text-red-500 text-center p-8 report-card">Could not load time tracking history. Please check the console for errors and try refreshing the page.</p>';
        }
    }
});