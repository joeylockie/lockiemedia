// advertising_admin_main.js
// Main entry point for the Advertising Admin Panel.

import LoggingService from './loggingService.js';
import AdvertisingService from './advertisingService.js';

function showAdminMessage(message, type = 'info', duration = 3000) {
    const adminMessageBox = document.getElementById('adminMessageBox');
    if (!adminMessageBox) {
        LoggingService.warn('[AdAdmin] Admin message box not found, cannot display message.', { message });
        console.warn(`Admin message (no UI element): ${type} - ${message}`);
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

function handleTriggerTestAd() {
    const functionName = 'handleTriggerTestAd (AdAdminMain)';
    LoggingService.info('[AdAdmin] Trigger Test Ad button clicked.', { functionName });

    const testAdData = {
        id: `test_${Date.now()}`,
        type: 'popup',
        title: 'Special Offer!',
        content: 'Get 25% off your next purchase. Use code: SAVE25',
        imageUrl: 'https://placehold.co/300x150/0ea5e9/ffffff?text=Awesome+Product&font=inter'
    };

    AdvertisingService.triggerAd(testAdData);
    showAdminMessage('Test ad trigger has been sent!', 'success');
}


document.addEventListener('DOMContentLoaded', () => {
    const functionName = 'DOMContentLoaded (AdAdminMain)';
    LoggingService.info('[AdAdmin] DOMContentLoaded. Initializing Advertising Admin Panel...', { functionName });

    const triggerBtn = document.getElementById('triggerTestAdBtn');

    if (triggerBtn) {
        triggerBtn.addEventListener('click', handleTriggerTestAd);
        LoggingService.debug('[AdAdmin] Event listener attached to triggerTestAdBtn.', { functionName });
    } else {
        LoggingService.error('[AdAdmin] Trigger Test Ad button not found.', new Error('DOMElementMissing'), { functionName });
    }

    LoggingService.info('[AdAdmin] Advertising Admin Panel Initialized.', { functionName });
});
