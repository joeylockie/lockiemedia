// advertisingService.js
// This service manages the logic for triggering and displaying ads.
// REFACTORED for self-hosted mode (uses localStorage and a hardcoded ad list).

import LoggingService from './loggingService.js';

const AD_TRIGGER_KEY = 'lockiemedia_ad_trigger_v1';

// In self-hosted mode, we'll use a hardcoded list of ads instead of a database.
const placeholderAds = [
    { id: 'promo_save25', title: 'Special Offer!', content: 'Get 25% off your next purchase. Use code: SAVE25', imageUrl: 'https://placehold.co/300x150/0ea5e9/ffffff?text=Awesome+Product&font=inter', adUrl: '#', color: 'sky', startDate: '', endDate: '' },
    { id: 'event_webinar', title: 'Live Webinar Next Week', content: 'Join our free webinar on productivity hacks and boost your efficiency.', imageUrl: 'https://placehold.co/300x150/16a34a/ffffff?text=Live+Webinar&font=inter', adUrl: '#', color: 'green', startDate: '', endDate: '' },
    { id: 'alert_maintenance', title: 'Scheduled Maintenance', content: 'Our services will be briefly unavailable this Sunday for scheduled maintenance.', imageUrl: 'https://placehold.co/300x150/f97316/ffffff?text=System+Update&font=inter', adUrl: '#', color: 'orange', startDate: '', endDate: '' }
];

// No database initialization is needed anymore.
function initialize() {
    LoggingService.info('[AdService] Initialized for self-hosted mode.');
}

// Fetches the hardcoded list of ads.
async function getAds() {
    return Promise.resolve(placeholderAds);
}

// Analytics functions are disabled in self-hosted mode.
async function logAdEvent(eventData) {
    const functionName = 'logAdEvent (AdService)';
    LoggingService.debug('[AdService] Analytics logging is disabled in self-hosted mode.', { functionName, eventData });
}

function streamAnalytics(callback) {
    const functionName = 'streamAnalytics (AdService)';
    LoggingService.debug('[AdService] Analytics streaming is disabled in self-hosted mode.', { functionName });
    // Call the callback with empty stats so the UI doesn't break
    if (typeof callback === 'function') {
        callback({});
    }
    // Return an empty unsubscribe function
    return () => {};
}


function triggerAd(adId) {
    const functionName = 'triggerAd (AdService)';
    if (!adId) return;

    const adToTrigger = placeholderAds.find(ad => ad.id === adId);

    if (!adToTrigger) {
        LoggingService.error(`[AdService] Ad with ID "${adId}" not found in hardcoded list.`, { functionName, adId });
        return;
    }

    const adPayload = { ...adToTrigger, timestamp: Date.now() };
    localStorage.setItem(AD_TRIGGER_KEY, JSON.stringify(adPayload));
    LoggingService.info(`[AdService] Ad "${adId}" triggered via localStorage.`, { functionName, adId });
}

function getAdToShow() {
    const functionName = 'getAdToShow (AdService)';
    try {
        const adString = localStorage.getItem(AD_TRIGGER_KEY);
        if (!adString) return null;

        const adData = JSON.parse(adString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (adData.startDate && new Date(adData.startDate + 'T00:00:00') > today) return null;
        if (adData.endDate && new Date(adData.endDate + 'T00:00:00') < today) return null;
        
        return adData;
    } catch (error) {
        LoggingService.error('[AdService] Error retrieving ad data from localStorage.', error, { functionName });
        return null;
    }
}

function clearAdTrigger() {
    localStorage.removeItem(AD_TRIGGER_KEY);
}


const AdvertisingService = {
    initialize,
    getAds,
    triggerAd,
    getAdToShow,
    clearAdTrigger,
    logAdEvent,
    streamAnalytics
};

export default AdvertisingService;

LoggingService.info("advertisingService.js loaded.", { module: 'advertisingService' });