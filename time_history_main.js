// public/time_history_main.js

import LoggingService from './loggingService.js';
import AppStore from './store.js';
import TimeTrackerService from './timeTrackerService.js';
import { formatMillisecondsToHMS } from './utils.js';

// --- DOM Element References ---
let startDateEl, endDateEl, runReportBtnEl, reportContainerEl;

// --- Helper Functions ---

/**
 * Groups log entries by week (starting on Monday) and then by day.
 * @param {Array<Object>} logEntries - The array of log entries to group.
 * @returns {Object} - An object where keys are "year-week" and values are objects of days.
 */
function groupEntriesByWeek(logEntries) {
    const getWeekNumber = (d) => {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        // Set to nearest Thursday: current date + 4 - current day number
        // Make Monday day 1, Sunday day 7
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        // Calculate full weeks to nearest Thursday
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    };

    const grouped = {};

    logEntries.forEach(entry => {
        const date = new Date(entry.startTime);
        const year = date.getUTCFullYear();
        const week = getWeekNumber(date);
        const day = date.toISOString().split('T')[0];

        const weekKey = `${year}-W${String(week).padStart(2, '0')}`;
        if (!grouped[weekKey]) {
            grouped[weekKey] = { entries: {}, totalMs: 0, startDate: null, endDate: null };
        }

        if (!grouped[weekKey].entries[day]) {
            grouped[weekKey].entries[day] = [];
        }

        grouped[weekKey].entries[day].push(entry);
    });

    // Calculate totals and date ranges for each week
    for (const weekKey in grouped) {
        let weekTotalMs = 0;
        const days = Object.keys(grouped[weekKey].entries).sort();
        grouped[weekKey].startDate = new Date(days[0] + 'T00:00:00');
        grouped[weekKey].endDate = new Date(days[days.length - 1] + 'T00:00:00');
        
        for(const day in grouped[weekKey].entries) {
             weekTotalMs += grouped[weekKey].entries[day].reduce((sum, entry) => sum + entry.durationMs, 0);
        }
        grouped[weekKey].totalMs = weekTotalMs;
    }

    return grouped;
}

/**
 * Renders the full report from the grouped data.
 * @param {Object} groupedData - Data grouped by week from groupEntriesByWeek.
 */
function renderReport(groupedData) {
    reportContainerEl.innerHTML = '';
    const activities = TimeTrackerService.getActivities();

    const sortedWeeks = Object.keys(groupedData).sort().reverse();

    if (sortedWeeks.length === 0) {
        reportContainerEl.innerHTML = `
            <div class="text-center py-10 report-card">
                <i class="fas fa-search-minus text-5xl text-slate-500"></i>
                <h3 class="mt-4 text-xl font-semibold text-slate-300">No Data Found</h3>
                <p class="text-slate-400">There are no time entries for the selected date range.</p>
            </div>
        `;
        return;
    }

    sortedWeeks.forEach(weekKey => {
        const weekData = groupedData[weekKey];
        const weekCard = document.createElement('div');
        weekCard.className = 'report-card space-y-4';

        const weekHeader = document.createElement('div');
        weekHeader.className = 'flex justify-between items-baseline pb-2 border-b border-slate-700';
        
        const weekTitle = document.createElement('h3');
        weekTitle.className = 'text-xl font-bold text-sky-400';
        const start = weekData.startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const end = weekData.endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        weekTitle.textContent = `Week of ${start} - ${end}`;
        
        const weekTotal = document.createElement('p');
        weekTotal.className = 'text-lg font-semibold text-slate-200';
        weekTotal.textContent = `Total: ${formatMillisecondsToHMS(weekData.totalMs)}`;

        weekHeader.appendChild(weekTitle);
        weekHeader.appendChild(weekTotal);
        weekCard.appendChild(weekHeader);
        
        const sortedDays = Object.keys(weekData.entries).sort().reverse();
        sortedDays.forEach(dayKey => {
            const dayEntries = weekData.entries[dayKey];
            const dayDate = new Date(dayKey + 'T00:00:00');
            const dayTotalMs = dayEntries.reduce((sum, entry) => sum + entry.durationMs, 0);
            
            const dayContainer = document.createElement('div');

            const dayTitle = document.createElement('h4');
            dayTitle.className = 'text-lg font-semibold text-slate-300 mb-2 flex justify-between items-baseline';
            dayTitle.innerHTML = `
                <span>${dayDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                <span class="text-base font-mono">${formatMillisecondsToHMS(dayTotalMs)}</span>
            `;
            dayContainer.appendChild(dayTitle);

            const entriesByActivity = dayEntries.reduce((acc, entry) => {
                if (!acc[entry.activityId]) acc[entry.activityId] = [];
                acc[entry.activityId].push(entry);
                return acc;
            }, {});

            const activityList = document.createElement('div');
            activityList.className = 'space-y-2 pl-4 border-l-2 border-slate-600';
            
            for (const activityId in entriesByActivity) {
                const activity = activities.find(a => a.id === activityId);
                const activityEntries = entriesByActivity[activityId];
                const activityTotalMs = activityEntries.reduce((sum, e) => sum + e.durationMs, 0);

                const activityRow = document.createElement('div');
                activityRow.className = 'flex justify-between items-center bg-slate-800 p-3 rounded-md';
                
                const activityName = document.createElement('span');
                activityName.className = 'font-medium text-slate-200';
                activityName.textContent = activity ? activity.name : 'Unknown Activity';
                
                const activityDuration = document.createElement('span');
                activityDuration.className = 'font-mono text-slate-300';
                activityDuration.textContent = formatMillisecondsToHMS(activityTotalMs);

                activityRow.appendChild(activityName);
                activityRow.appendChild(activityDuration);
                activityList.appendChild(activityRow);
            }

            dayContainer.appendChild(activityList);
            weekCard.appendChild(dayContainer);
        });

        reportContainerEl.appendChild(weekCard);
    });
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
    
    // Fetch all entries from the service.
    // In a larger app, you'd pass the date range to the service/backend.
    const allEntries = TimeTrackerService.getLogEntries();

    const filteredEntries = allEntries.filter(entry => {
        const entryDate = new Date(entry.startTime);
        return entryDate >= startDate && entryDate <= endDate;
    });
    
    const groupedData = groupEntriesByWeek(filteredEntries);
    renderReport(groupedData);
}


// --- Initialization ---

document.addEventListener('DOMContentLoaded', async () => {
    const functionName = 'DOMContentLoaded (TimeHistoryMain)';
    document.body.style.visibility = 'visible';
    
    startDateEl = document.getElementById('startDate');
    endDateEl = document.getElementById('endDate');
    runReportBtnEl = document.getElementById('runReportBtn');
    reportContainerEl = document.getElementById('reportContainer');

    try {
        LoggingService.info('[TimeHistory] Initializing Time History page...', { functionName });
        
        // Load all app data
        await AppStore.initializeStore();
        
        // Initialize the service which loads transient state
        TimeTrackerService.initialize();

        // Set default dates: today and 7 days ago
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 6); // -6 to make a 7-day period inclusive of today

        endDateEl.value = today.toISOString().split('T')[0];
        startDateEl.value = sevenDaysAgo.toISOString().split('T')[0];

        // Attach event listeners
        runReportBtnEl.addEventListener('click', generateReport);
        
        LoggingService.info('[TimeHistory] Page initialized.', { functionName });
        
        // Automatically run the report for the default range
        await generateReport();

    } catch (error) {
        LoggingService.critical('[TimeHistory] A critical error occurred during initialization.', error, { functionName });
        if (reportContainerEl) {
            reportContainerEl.innerHTML = '<p class="text-red-500 text-center p-8 report-card">Could not load time tracking history. Please check the console for errors and try refreshing the page.</p>';
        }
    }
});