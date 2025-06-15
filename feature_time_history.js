// feature_time_history.js
// Manages the UI and logic for the Time Tracker History & Reports page.

import LoggingService from './loggingService.js';
import TimeTrackerService from './timeTrackerService.js';
import { formatMillisecondsToHMS } from './utils.js';

// --- DOM Element References ---
let dateRangeSelector, customDateInputs, startDateInput, endDateInput, dateRangeText;
let totalTimeStat, mostTrackedStat, totalEntriesStat, avgDailyTimeStat;
let detailedLogContainer;
let activityPieChartCanvas, dailyBarChartCanvas;

// --- Chart Instances ---
let pieChartInstance = null;
let barChartInstance = null;

// --- Color Map ---
const chartColorMap = {
    sky: 'rgba(56, 189, 248, 0.7)',
    purple: 'rgba(168, 85, 247, 0.7)',
    yellow: 'rgba(251, 191, 36, 0.7)',
    green: 'rgba(52, 211, 153, 0.7)',
    red: 'rgba(248, 113, 113, 0.7)',
    pink: 'rgba(236, 72, 153, 0.7)',
    indigo: 'rgba(129, 140, 248, 0.7)',
    blue: 'rgba(96, 165, 250, 0.7)',
};

/**
 * Calculates date ranges based on the selector's value.
 * @returns {{startDate: Date, endDate: Date}}
 */
function getDateRange() {
    const selectorValue = dateRangeSelector.value;
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0); // Start of today

    switch (selectorValue) {
        case 'this_week':
            const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
            startDate.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Adjust for Sun start
            break;
        case 'last_7_days':
            startDate.setDate(today.getDate() - 6);
            break;
        case 'this_month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
        case 'last_30_days':
            startDate.setDate(today.getDate() - 29);
            break;
        case 'custom':
            startDate = new Date(startDateInput.value + 'T00:00:00');
            const endDate = new Date(endDateInput.value + 'T23:59:59');
            return { startDate, endDate };
    }
    return { startDate, endDate: today };
}

/**
 * Main function to fetch data and update the entire report UI.
 */
async function loadAndDisplayReport() {
    const functionName = 'loadAndDisplayReport';
    LoggingService.info('[TimeHistoryFeature] Loading and displaying report...', { functionName });

    const { startDate, endDate } = getDateRange();
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        LoggingService.warn('[TimeHistoryFeature] Invalid date range selected.', { functionName, startDate, endDate });
        return;
    }

    try {
        const [logEntries, activities] = await Promise.all([
            TimeTrackerService.fetchLogEntriesForDateRange(startDate, endDate),
            TimeTrackerService.getActivities() // Activities are already streamed, just get current state
        ]);

        updateSummaryMetrics(logEntries, activities, startDate, endDate);
        renderDetailedLog(logEntries, activities);
        renderCharts(logEntries, activities);

    } catch (error) {
        LoggingService.error('[TimeHistoryFeature] Failed to load report data.', error, { functionName });
    }
}

/**
 * Updates the summary statistic cards.
 * @param {Array} logEntries - The log entries for the period.
 * @param {Array} activities - The available activities.
 * @param {Date} startDate - The start date of the range.
 * @param {Date} endDate - The end date of the range.
 */
function updateSummaryMetrics(logEntries, activities, startDate, endDate) {
    let totalMs = 0;
    const activityTotals = {};

    logEntries.forEach(log => {
        totalMs += log.durationMs;
        if (!activityTotals[log.activityId]) {
            activityTotals[log.activityId] = 0;
        }
        activityTotals[log.activityId] += log.durationMs;
    });

    totalTimeStat.textContent = formatMillisecondsToHMS(totalMs);
    totalEntriesStat.textContent = logEntries.length;

    let mostTrackedName = '-';
    if (Object.keys(activityTotals).length > 0) {
        const mostTrackedId = Object.keys(activityTotals).reduce((a, b) => activityTotals[a] > activityTotals[b] ? a : b);
        const mostTrackedActivity = activities.find(a => a.id === mostTrackedId);
        if(mostTrackedActivity) {
            mostTrackedName = `${mostTrackedActivity.name} (${formatMillisecondsToHMS(activityTotals[mostTrackedId])})`;
        }
    }
    mostTrackedStat.textContent = mostTrackedName;
    
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const avgMsPerDay = totalMs / (diffDays || 1);
    avgDailyTimeStat.textContent = formatMillisecondsToHMS(avgMsPerDay);
}

/**
 * Renders the detailed log entries, grouped by day.
 * @param {Array} logEntries - The log entries for the period.
 * @param {Array} activities - The available activities.
 */
function renderDetailedLog(logEntries, activities) {
    detailedLogContainer.innerHTML = '';
    if (logEntries.length === 0) {
        detailedLogContainer.innerHTML = '<p class="text-slate-400 italic">No time logged in this period.</p>';
        return;
    }

    const groupedByDay = logEntries.reduce((acc, log) => {
        const dateKey = new Date(log.startTime).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(log);
        return acc;
    }, {});

    for (const date in groupedByDay) {
        const dayHeader = document.createElement('h4');
        dayHeader.className = 'text-lg font-semibold text-slate-200 mt-4 first:mt-0';
        dayHeader.textContent = date;
        detailedLogContainer.appendChild(dayHeader);

        const dayList = document.createElement('ul');
        dayList.className = 'space-y-2 mt-2';
        groupedByDay[date].forEach(log => {
            const activity = activities.find(a => a.id === log.activityId);
            const li = document.createElement('li');
            li.className = 'flex items-center justify-between p-3 bg-slate-700 rounded-md';
            
            const activityName = document.createElement('span');
            activityName.innerHTML = `<i class="${activity?.icon || 'fas fa-question-circle'} ${colorMap[activity?.color] || 'text-slate-400'} w-5 mr-2"></i> ${activity?.name || 'Deleted Activity'}`;
            
            const times = document.createElement('span');
            times.className = 'text-sm text-slate-400';
            const startTime = new Date(log.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const endTime = new Date(log.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            times.textContent = `${startTime} - ${endTime}`;

            const duration = document.createElement('span');
            duration.className = 'font-mono font-semibold';
            duration.textContent = formatMillisecondsToHMS(log.durationMs);

            const leftDiv = document.createElement('div');
            leftDiv.appendChild(activityName);
            leftDiv.appendChild(times);
            leftDiv.className = "flex flex-col";
            
            li.appendChild(leftDiv);
            li.appendChild(duration);
            dayList.appendChild(li);
        });
        detailedLogContainer.appendChild(dayList);
    }
}

/**
 * Renders the charts based on the log entries.
 * @param {Array} logEntries - The log entries for the period.
 * @param {Array} activities - The available activities.
 */
function renderCharts(logEntries, activities) {
    if (pieChartInstance) pieChartInstance.destroy();
    if (barChartInstance) barChartInstance.destroy();

    const activityTotals = {};
    logEntries.forEach(log => {
        activityTotals[log.activityId] = (activityTotals[log.activityId] || 0) + log.durationMs;
    });

    const chartLabels = [];
    const chartData = [];
    const chartColors = [];

    for (const activityId in activityTotals) {
        const activity = activities.find(a => a.id === activityId);
        chartLabels.push(activity?.name || 'Deleted Activity');
        chartData.push(activityTotals[activityId] / (1000 * 60 * 60)); // Convert to hours
        chartColors.push(chartColorMap[activity?.color] || 'rgba(100, 116, 139, 0.7)');
    }
    
    // Pie Chart
    pieChartInstance = new Chart(activityPieChartCanvas, {
        type: 'pie',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Hours',
                data: chartData,
                backgroundColor: chartColors,
                borderColor: '#1f2937',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#d1d5db' } }
            }
        }
    });

    // Bar Chart Data Prep
    const dailyTotals = {};
    logEntries.forEach(log => {
        const dateKey = new Date(log.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' });
        dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + log.durationMs;
    });

    const barChartLabels = Object.keys(dailyTotals).reverse();
    const barChartData = barChartLabels.map(label => dailyTotals[label] / (1000 * 60 * 60)); // Convert to hours
    
    barChartInstance = new Chart(dailyBarChartCanvas, {
        type: 'bar',
        data: {
            labels: barChartLabels,
            datasets: [{
                label: 'Total Hours Tracked',
                data: barChartData,
                backgroundColor: 'rgba(56, 189, 248, 0.7)',
                borderColor: 'rgba(56, 189, 248, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, ticks: { color: '#9ca3af' }, grid: { color: '#374151'} },
                x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151'} }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}


function initialize() {
    const functionName = 'initialize (TimeHistoryFeature)';
    LoggingService.info('[TimeHistoryFeature] Initializing...', { functionName });
    
    // Get DOM Elements
    dateRangeSelector = document.getElementById('dateRangeSelector');
    customDateInputs = document.getElementById('customDateInputs');
    startDateInput = document.getElementById('startDateInput');
    endDateInput = document.getElementById('endDateInput');
    dateRangeText = document.getElementById('dateRangeText');
    totalTimeStat = document.getElementById('totalTimeStat');
    mostTrackedStat = document.getElementById('mostTrackedStat');
    totalEntriesStat = document.getElementById('totalEntriesStat');
    avgDailyTimeStat = document.getElementById('avgDailyTimeStat');
    detailedLogContainer = document.getElementById('detailedLogContainer');
    activityPieChartCanvas = document.getElementById('activityPieChart');
    dailyBarChartCanvas = document.getElementById('dailyBarChart');
    
    // Attach Event Listeners
    dateRangeSelector.addEventListener('change', () => {
        customDateInputs.classList.toggle('hidden', dateRangeSelector.value !== 'custom');
        if (dateRangeSelector.value !== 'custom') {
            loadAndDisplayReport();
            dateRangeText.textContent = `Showing data for ${dateRangeSelector.options[dateRangeSelector.selectedIndex].text}`;
        }
    });
    
    startDateInput.addEventListener('change', () => {
        endDateInput.min = startDateInput.value;
        loadAndDisplayReport();
        dateRangeText.textContent = `Showing data for Custom Range`;
    });
    endDateInput.addEventListener('change', loadAndDisplayReport);
    
    // Initial data load for default range
    loadAndDisplayReport();
    
    LoggingService.info('[TimeHistoryFeature] Initialized and event listeners attached.', { functionName });
}

export const TimeHistoryFeature = {
    initialize
};