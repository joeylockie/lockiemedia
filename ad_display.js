// ad_display.js
// This script runs on public-facing pages to check for and display ads from localStorage.

import LoggingService from './loggingService.js';
import AdvertisingService from './advertisingService.js';

const AD_POPUP_ID = 'adPopup';
const AD_TITLE_ID = 'adPopupTitle';
const AD_CONTENT_ID = 'adPopupContent';
const AD_IMAGE_ID = 'adPopupImage';
const AD_CLOSE_BTN_ID = 'adPopupCloseBtn';

function showAdPopup(adData) {
    const functionName = 'showAdPopup (AdDisplay)';
    const popup = document.getElementById(AD_POPUP_ID);
    const titleEl = document.getElementById(AD_TITLE_ID);
    const contentEl = document.getElementById(AD_CONTENT_ID);
    const imageEl = document.getElementById(AD_IMAGE_ID);
    const closeBtn = document.getElementById(AD_CLOSE_BTN_ID);

    if (!popup || !titleEl || !contentEl || !imageEl || !closeBtn) {
        LoggingService.error('[AdDisplay] One or more ad popup elements not found.', new Error('DOMElementMissing'), { functionName });
        return;
    }

    // Populate the popup with ad data
    titleEl.textContent = adData.title || 'Advertisement';
    contentEl.textContent = adData.content || '';
    if (adData.imageUrl) {
        imageEl.src = adData.imageUrl;
        imageEl.style.display = 'block';
    } else {
        imageEl.style.display = 'none';
    }

    // Show the popup
    popup.classList.remove('hidden');
    requestAnimationFrame(() => {
        popup.classList.remove('translate-y-full', 'opacity-0');
    });
    LoggingService.info('[AdDisplay] Ad popup displayed.', { functionName, adId: adData.id });

    // Attach listener to the close button
    closeBtn.onclick = () => {
        hideAdPopup();
    };

    // Clear the trigger so it doesn't show again
    AdvertisingService.clearAdTrigger();
}

function hideAdPopup() {
    const functionName = 'hideAdPopup (AdDisplay)';
    const popup = document.getElementById(AD_POPUP_ID);
    if (!popup) return;

    popup.classList.add('opacity-0');
    setTimeout(() => {
        popup.classList.add('hidden');
        popup.classList.add('translate-y-full'); // Reset for next time
    }, 300); // Match transition duration
    LoggingService.info('[AdDisplay] Ad popup hidden.', { functionName });
}


function checkForAd() {
    const functionName = 'checkForAd (AdDisplay)';
    LoggingService.debug('[AdDisplay] Checking for ad trigger.', { functionName });
    const adData = AdvertisingService.getAdToShow();
    if (adData) {
        showAdPopup(adData);
    }
}

// --- Event Listeners ---

// 1. Check for ad when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const functionName = 'DOMContentLoaded (AdDisplay)';
    LoggingService.info('[AdDisplay] Initializing ad display check.', { functionName });
    checkForAd();
});

// 2. Listen for storage changes from other tabs (e.g., the admin panel)
// This allows the ad to appear instantly without a page refresh.
window.addEventListener('storage', (event) => {
    const functionName = 'storageEventListener (AdDisplay)';
    if (event.key === 'lockiemedia_ad_trigger_v1') { // Use the actual key from the service
        LoggingService.info('[AdDisplay] Storage event detected for ad trigger.', { functionName });
        checkForAd();
    }
});
