// adminUI.js - Handles UI rendering for the Admin Panel

import LoggingService from './loggingService.js';

// DOM Element References - these will be passed or assumed to be globally queryable
// For now, we assume they are queryable as needed.

export function displayFeatureFlagsInTable(flags, containerElementId) {
    const functionName = 'displayFeatureFlagsInTable (AdminUI)';
    const container = document.getElementById(containerElementId);

    if (!container) {
        LoggingService.warn(`[AdminUI] Container element '${containerElementId}' not found for feature flags.`, { functionName });
        return;
    }

    try {
        LoggingService.debug('[AdminUI] Displaying feature flags in table:', { functionName, flagsCount: Object.keys(flags).length });

        if (Object.keys(flags).length === 0) {
            container.innerHTML = '<p class="text-gray-500">No feature flags loaded or defined.</p>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'admin-table min-w-full'; // Uses styles from admin.html
        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        ['Feature Key', 'Status'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });

        const tbody = table.createTBody();
        let enabledCount = 0;
        Object.entries(flags).sort((a, b) => a[0].localeCompare(b[0])).forEach(([key, value]) => {
            const row = tbody.insertRow();
            row.insertCell().textContent = key;
            const statusCell = row.insertCell();
            statusCell.textContent = value ? '✅ Enabled' : '❌ Disabled';
            statusCell.className = value ? 'text-green-600 font-semibold' : 'text-red-600';
            if (value) enabledCount++;
        });

        container.innerHTML = ''; // Clear "Loading..." or previous table
        container.appendChild(table);
        
        // Optionally update a summary stat if an element ID is provided
        const activeFeaturesStatEl = document.getElementById('activeFeaturesStat');
        if(activeFeaturesStatEl) activeFeaturesStatEl.textContent = `${enabledCount} / ${Object.keys(flags).length}`;

    } catch (error) {
        LoggingService.error('[AdminUI] Error displaying feature flags in table.', error, { functionName });
        container.innerHTML = '<p class="text-red-500">Error loading feature flags display.</p>';
        const activeFeaturesStatEl = document.getElementById('activeFeaturesStat');
        if(activeFeaturesStatEl) activeFeaturesStatEl.textContent = "Error";
    }
}

export function displayErrorLogsInTable(logs, containerElementId) {
    const functionName = 'displayErrorLogsInTable (AdminUI)';
    const container = document.getElementById(containerElementId);
     const errorsTodayStatEl = document.getElementById('errorsTodayStat');


    if (!container) {
        LoggingService.warn(`[AdminUI] Container element '${containerElementId}' not found for error logs.`, { functionName });
        if (errorsTodayStatEl) errorsTodayStatEl.textContent = "N/A";
        return;
    }

    try {
        if (!logs || logs.length === 0) {
            container.innerHTML = '<p class="text-gray-500">No error logs found.</p>';
            if (errorsTodayStatEl) errorsTodayStatEl.textContent = "0";
            return;
        }
        LoggingService.debug(`[AdminUI] Displaying ${logs.length} error logs.`, { functionName, count: logs.length });

        const table = document.createElement('table');
        table.className = 'admin-table min-w-full';
        const thead = table.createTHead();
        const hr = thead.insertRow();
        ['Timestamp', 'Level', 'Message', 'User', 'URL', 'Details'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            hr.appendChild(th);
        });

        const tbody = table.createTBody();
        let errorsInLast24h = 0;
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        logs.forEach(logData => { // doc.data() is already done before this function now
            const log = logData; // log is the direct data object
            const row = tbody.insertRow();
            
            const displayTimestamp = log.clientTimestamp ? 
                (log.clientTimestamp.toDate ? log.clientTimestamp.toDate().toLocaleString() : new Date(log.clientTimestamp.seconds * 1000).toLocaleString()) : 
                new Date(log.timestamp).toLocaleString();

            row.insertCell().textContent = displayTimestamp;
            row.insertCell().textContent = log.level;
            row.insertCell().textContent = log.message.substring(0, 100) + (log.message.length > 100 ? '...' : '');
            row.insertCell().textContent = log.userEmail || log.userId || 'N/A';
            row.insertCell().textContent = log.url ? log.url.substring(0,50) + (log.url.length > 50 ? '...' : '') : 'N/A';

            const detailsCell = row.insertCell();
            const detailsButton = document.createElement('button');
            detailsButton.textContent = 'View';
            detailsButton.className = 'text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded';
            detailsButton.onclick = () => {
                // Create a readable version of the log for the alert
                const readableLog = { ...log };
                if (readableLog.clientTimestamp && readableLog.clientTimestamp.toDate) {
                    readableLog.clientTimestamp = readableLog.clientTimestamp.toDate().toISOString();
                }
                if (readableLog.timestamp) {
                    readableLog.timestamp = new Date(readableLog.timestamp).toISOString();
                }
                alert(JSON.stringify(readableLog, null, 2));
            };
            detailsCell.appendChild(detailsButton);

            const logDate = log.clientTimestamp && log.clientTimestamp.toDate ? log.clientTimestamp.toDate() : new Date(log.timestamp);
            if (logDate > twentyFourHoursAgo) {
                errorsInLast24h++;
            }
        });

        container.innerHTML = ''; // Clear "Loading..." or previous table
        container.appendChild(table);
        if (errorsTodayStatEl) errorsTodayStatEl.textContent = errorsInLast24h.toString();

    } catch (error) {
        LoggingService.error('[AdminUI] Error displaying error logs in table.', error, { functionName });
        container.innerHTML = `<p class="text-red-500">Error loading error logs display: ${error.message}</p>`;
        if (errorsTodayStatEl) errorsTodayStatEl.textContent = "Error";
    }
}

export function showAdminMessage(message, type = 'info', duration = 4000) {
    const adminMessageBox = document.getElementById('adminMessageBox');
    if (!adminMessageBox) {
        LoggingService.warn('[AdminUI] Admin message box not found, cannot display message.', { message });
        console.warn(`Admin message (no UI element): ${type} - ${message}`);
        return;
    }
    const messageEl = document.createElement('div');
    messageEl.className = `admin-message ${type} transition-all duration-500 ease-in-out opacity-0 transform translate-y-2`;
    messageEl.textContent = message;
    adminMessageBox.appendChild(messageEl);

    // Trigger reflow for transition
    setTimeout(() => {
        messageEl.classList.remove('opacity-0', 'translate-y-2');
        messageEl.classList.add('opacity-100', 'translate-y-0');
    }, 10);


    setTimeout(() => {
        messageEl.classList.remove('opacity-100', 'translate-y-0');
        messageEl.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => {
            messageEl.remove();
        }, 500); // Allow time for fade out transition
    }, duration);
}


// Placeholder for other UI rendering functions
export function displayUserList(users, containerElementId) {
    const container = document.getElementById(containerElementId);
    if (!container) return;
    container.innerHTML = '<p class="text-gray-500">User list display (coming soon).</p>';
    // TODO: Implement user list rendering
}

export function updateOverviewStats(stats) {
    const { totalUsers, errorsToday, activeFeatures } = stats;
    const totalUsersStatEl = document.getElementById('totalUsersStat');
    const errorsTodayStatEl = document.getElementById('errorsTodayStat'); // Already updated by error log display
    const activeFeaturesStatEl = document.getElementById('activeFeaturesStat'); // Already updated by feature flag display

    if (totalUsersStatEl && totalUsers !== undefined) totalUsersStatEl.textContent = totalUsers.toString();
    // errorsTodayStatEl and activeFeaturesStatEl are updated by their respective display functions
}


LoggingService.info("adminUI.js loaded.", { module: 'adminUI' });

// Export an object if you prefer a namespace, or individual functions
const AdminUI = {
    displayFeatureFlagsInTable,
    displayErrorLogsInTable,
    showAdminMessage,
    displayUserList,
    updateOverviewStats
};

export default AdminUI;