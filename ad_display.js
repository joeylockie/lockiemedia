// ad_display.js
// This script runs on public-facing pages to check for and display ads from localStorage.

import LoggingService from './loggingService.js';
import AdvertisingService from './advertisingService.js';

const AD_POPUP_ID = 'adPopup';
const AD_TITLE_ID = 'adPopupTitle';
const AD_CONTENT_ID = 'adPopupContent';
const AD_IMAGE_ID = 'adPopupImage';
const AD_CLOSE_BTN_ID = 'adPopupCloseBtn';

function getUserId() {
    // This function will now only be called after Firebase is initialized.
    if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
        return firebase.auth().currentUser.uid;
    }
    return 'anonymous';
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
 * This should only be called after Firebase has been initialized.
 */
export function initialize() {
    const functionName = 'initialize (AdDisplay)';
    LoggingService.info('[AdDisplay] Initializing ad display check and listeners.', { functionName });
    
    // Check for an ad immediately on initialization
    checkForAd();

    // Listen for storage changes from other tabs
    window.addEventListener('storage', (event) => {
        if (event.key === 'lockiemedia_ad_trigger_v1') {
            LoggingService.info('[AdDisplay] Storage event detected for ad trigger.', { functionName: 'storageListener' });
            checkForAd();
        }
    });
}