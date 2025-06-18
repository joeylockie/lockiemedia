// ad_display.js
// This script runs on public-facing pages to check for and display ads from localStorage.
// REFACTORED FOR SELF-HOSTED BACKEND

import LoggingService from './loggingService.js';
import AdvertisingService from './advertisingService.js';

const AD_POPUP_ID = 'adPopup';
const AD_TITLE_ID = 'adPopupTitle';
const AD_CONTENT_ID = 'adPopupContent';
const AD_IMAGE_ID = 'adPopupImage';
const AD_CLOSE_BTN_ID = 'adPopupCloseBtn';

function getUserId() {
    // In self-hosted mode, there is no user authentication.
    // We can return a static placeholder.
    return 'local_user';
}

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

    // Logging analytics is disabled in the refactored service, but we'll leave the call here for future use.
    AdvertisingService.logAdEvent({
        adId: adData.id,
        eventType: 'view',
        viewedByUserId: getUserId()
    });

    titleEl.textContent = adData.title || 'Advertisement';
    contentEl.textContent = adData.content || '';
    if (adData.imageUrl) {
        imageEl.src = adData.imageUrl;
        imageEl.style.display = 'block';
    } else {
        imageEl.style.display = 'none';
    }

    if (adData.adUrl && adData.adUrl !== '#') {
        popup.style.cursor = 'pointer';
        popup.onclick = (e) => {
            if (e.target.closest(`#${AD_CLOSE_BTN_ID}`)) return;
            AdvertisingService.logAdEvent({
                adId: adData.id,
                eventType: 'click',
                viewedByUserId: getUserId()
            });
            window.open(adData.adUrl, '_blank');
        };
    } else {
        popup.style.cursor = 'default';
        popup.onclick = null;
    }

    popup.classList.remove('hidden');
    requestAnimationFrame(() => {
        popup.classList.remove('translate-y-full', 'opacity-0');
    });

    closeBtn.onclick = (e) => {
        e.stopPropagation();
        hideAdPopup();
    };

    AdvertisingService.clearAdTrigger();
}

function hideAdPopup() {
    const popup = document.getElementById(AD_POPUP_ID);
    if (!popup) return;
    popup.classList.add('opacity-0');
    setTimeout(() => {
        popup.classList.add('hidden');
        popup.classList.add('translate-y-full');
    }, 300);
}

function checkForAd() {
    const adData = AdvertisingService.getAdToShow();
    if (adData) {
        showAdPopup(adData);
    }
}

/**
 * Initializes the ad display logic and sets up listeners.
 */
export function initialize() {
    const functionName = 'initialize (AdDisplay)';
    LoggingService.info('[AdDisplay] Initializing ad display check and listeners.', { functionName });
    
    checkForAd();

    window.addEventListener('storage', (event) => {
        if (event.key === 'lockiemedia_ad_trigger_v1') {
            LoggingService.info('[AdDisplay] Storage event detected for ad trigger.', { functionName: 'storageListener' });
            checkForAd();
        }
    });
}