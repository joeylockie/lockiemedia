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

/**
 * Renders the list of available ads into the container.
 */
function renderAdList() {
    const functionName = 'renderAdList (AdAdminMain)';
    const container = document.getElementById('adListContainer');
    if (!container) {
        LoggingService.error('[AdAdmin] Ad list container not found.', new Error('DOMElementMissing'), { functionName });
        return;
    }

    const ads = AdvertisingService.getAds();
    container.innerHTML = ''; // Clear previous content

    if (!ads || ads.length === 0) {
        container.innerHTML = '<p class="text-slate-400">No ads defined in the service.</p>';
        return;
    }

    ads.forEach(ad => {
        const card = document.createElement('div');
        // Added a map for border colors based on ad.color
        const colorClasses = {
            sky: 'border-sky-500',
            green: 'border-green-500',
            orange: 'border-orange-500'
        };
        card.className = `ad-card p-4 rounded-lg shadow-md flex items-center gap-4 ${colorClasses[ad.color] || 'border-slate-600'}`;

        const img = document.createElement('img');
        img.src = ad.imageUrl;
        img.alt = ad.title;
        img.className = 'w-24 h-auto rounded-md flex-shrink-0';
        img.onerror = "this.style.display='none'";

        const contentDiv = document.createElement('div');
        
        const title = document.createElement('h4');
        title.className = 'font-bold text-white';
        title.textContent = ad.title;

        const idText = document.createElement('p');
        idText.className = 'text-xs text-slate-400 font-mono';
        idText.textContent = `ID: ${ad.id}`;
        
        const contentText = document.createElement('p');
        contentText.className = 'text-sm text-slate-300 mt-1';
        contentText.textContent = ad.content;

        contentDiv.appendChild(title);
        contentDiv.appendChild(idText);
        contentDiv.appendChild(contentText);
        
        card.appendChild(img);
        card.appendChild(contentDiv);
        container.appendChild(card);
    });
    LoggingService.debug(`[AdAdmin] Rendered ${ads.length} ads into the list.`, { functionName });
}


/**
 * Handles the click event for the "Trigger Ad by ID" button.
 */
function handleTriggerAdById() {
    const functionName = 'handleTriggerAdById (AdAdminMain)';
    const inputEl = document.getElementById('adIdInput');
    if (!inputEl) {
        LoggingService.error('[AdAdmin] Ad ID input element not found.', new Error('DOMElementMissing'), { functionName });
        return;
    }

    const adId = inputEl.value.trim();
    if (!adId) {
        showAdminMessage('Please enter an Ad ID to trigger.', 'error');
        LoggingService.warn('[AdAdmin] Trigger button clicked with no Ad ID.', { functionName });
        return;
    }

    LoggingService.info(`[AdAdmin] Triggering ad with ID: ${adId}`, { functionName, adId });
    // This now looks up the ad by ID in the service and sets it in localStorage
    AdvertisingService.triggerAd(adId); 
    showAdminMessage(`Ad trigger for ID "${adId}" has been sent!`, 'success');
    inputEl.value = '';
}


document.addEventListener('DOMContentLoaded', () => {
    const functionName = 'DOMContentLoaded (AdAdminMain)';
    LoggingService.info('[AdAdmin] DOMContentLoaded. Initializing Advertising Admin Panel...', { functionName });

    // New button for triggering by ID
    const triggerByIdBtn = document.getElementById('triggerAdByIdBtn');

    if (triggerByIdBtn) {
        triggerByIdBtn.addEventListener('click', handleTriggerAdById);
        LoggingService.debug('[AdAdmin] Event listener attached to triggerAdByIdBtn.', { functionName });
    } else {
        LoggingService.error('[AdAdmin] Trigger Ad by ID button not found.', new Error('DOMElementMissing'), { functionName });
    }

    // Render the list of ads on load
    renderAdList();

    LoggingService.info('[AdAdmin] Advertising Admin Panel Initialized.', { functionName });
});