import LoggingService from './loggingService.js';

// --- Module State ---
let currentAppVersion = '0.0.0';
let updateCheckInterval = null;
const CHECK_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Fetches the version from the version.json file.
 * @returns {Promise<string|null>} The version string or null if an error occurs.
 */
async function fetchVersion() {
    try {
        const response = await fetch('version.json', { cache: 'no-store' }); // 'no-store' prevents the browser from caching the version file
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.version;
    } catch (error) {
        LoggingService.error('Could not fetch version.json', error, { functionName: 'fetchVersion' });
        return null;
    }
}

/**
 * Updates the UI to display the current application version in the footer.
 */
function displayAppVersion() {
    const appVersionFooterEl = document.getElementById('appVersionFooter');
    if (appVersionFooterEl) {
        appVersionFooterEl.textContent = `Version ${currentAppVersion}`;
    }
}

/**
 * Shows the update notification bar at the top of the page.
 * @param {string} newVersion - The new version string to display.
 */
function showUpdateNotificationBar(newVersion) {
    let notificationBar = document.getElementById('updateNotificationBar');
    if (!notificationBar) return;

    const messageEl = notificationBar.querySelector('#updateMessage');
    const reloadBtn = notificationBar.querySelector('#reloadPageBtn');

    if (messageEl) {
        messageEl.textContent = `A new version (${newVersion}) is available. Please reload the page to get the latest updates.`;
    }
    if (reloadBtn) {
        reloadBtn.onclick = () => window.location.reload();
    }

    notificationBar.classList.remove('hidden');
}

/**
 * Checks for a new version and shows the notification if one is found.
 */
async function checkForUpdates() {
    LoggingService.debug('Checking for application updates...', { functionName: 'checkForUpdates' });
    const latestVersion = await fetchVersion();

    if (latestVersion && latestVersion !== currentAppVersion) {
        LoggingService.info(`New version detected. Old: ${currentAppVersion}, New: ${latestVersion}`, { functionName: 'checkForUpdates' });
        showUpdateNotificationBar(latestVersion);
        clearInterval(updateCheckInterval); // Stop checking once an update is found
    }
}

/**
 * Initializes the version service.
 * Fetches the initial version, displays it, and starts the update checker.
 */
export async function initializeVersionChecker() {
    currentAppVersion = await fetchVersion() || '0.0.0';
    displayAppVersion();

    // Start the periodic check for updates
    if (updateCheckInterval) clearInterval(updateCheckInterval);
    updateCheckInterval = setInterval(checkForUpdates, CHECK_INTERVAL_MS);
    LoggingService.info(`Version checker initialized. Current version: ${currentAppVersion}. Checking every ${CHECK_INTERVAL_MS / 60000} minutes.`, { functionName: 'initializeVersionChecker' });
}