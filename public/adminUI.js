// adminUI.js - Handles UI rendering for the Admin Panel
// REFACTORED FOR SELF-HOSTED BACKEND (STATIC)

import LoggingService from './public/loggingService.js';

/**
 * Displays a temporary message to the admin.
 * @param {string} message - The message to display.
 * @param {'info' | 'success' | 'error'} type - The type of message.
 * @param {number} duration - How long to display the message in milliseconds.
 */
export function showAdminMessage(message, type = 'info', duration = 4000) {
    const adminMessageBox = document.getElementById('adminMessageBox');
    if (!adminMessageBox) {
        LoggingService.warn('[AdminUI] Admin message box not found, cannot display message.', { message });
        return;
    }
    const messageEl = document.createElement('div');
    messageEl.className = `admin-message ${type}`; 
    messageEl.textContent = message;
    
    adminMessageBox.appendChild(messageEl);

    requestAnimationFrame(() => {
        messageEl.classList.add('show');
    });

    setTimeout(() => {
        messageEl.classList.remove('show');
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 500);
    }, duration);
}

/**
 * Updates the statistic cards in the overview section with placeholder text.
 * @param {object} stats - An object containing the statistics to display.
 */
export function updateOverviewStats(stats) {
    const statMapping = {
        totalUsers: 'totalUsersStat',
        errorsToday: 'errorsTodayStat',
        activeFeatures: 'activeFeaturesStat',
        dau: 'dauStat',
        newSignups: 'newSignupsStat',
        avgLoadTime: 'avgLoadTimeStat',
        totalItems: 'totalItemsStat',
        apiErrorRate: 'apiErrorRateStat'
    };

    for (const key in statMapping) {
        const el = document.getElementById(statMapping[key]);
        if (el && stats[key] !== undefined) {
            el.textContent = stats[key].toString();
        }
    }
}

const AdminUI = {
    showAdminMessage,
    updateOverviewStats
};

export default AdminUI;