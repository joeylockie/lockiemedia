// advertisingService.js
// This service manages the logic for triggering and displaying ads via localStorage.

import LoggingService from './loggingService.js';

const AD_TRIGGER_KEY = 'lockiemedia_ad_trigger_v1';

// 1. Create 3 placeholder ads with unique IDs and different colors.
const placeholderAds = [
    {
        id: 'promo_save25',
        type: 'popup',
        title: 'Special Offer!',
        content: 'Get 25% off your next purchase. Use code: SAVE25',
        imageUrl: 'https://placehold.co/300x150/0ea5e9/ffffff?text=Awesome+Product&font=inter',
        color: 'sky'
    },
    {
        id: 'event_webinar',
        type: 'popup',
        title: 'Live Webinar Next Week',
        content: 'Join our free webinar on productivity hacks and boost your efficiency.',
        imageUrl: 'https://placehold.co/300x150/16a34a/ffffff?text=Live+Webinar&font=inter',
        color: 'green'
    },
    {
        id: 'alert_maintenance',
        type: 'popup',
        title: 'Scheduled Maintenance',
        content: 'Our services will be briefly unavailable this Sunday for scheduled maintenance.',
        imageUrl: 'https://placehold.co/300x150/f97316/ffffff?text=System+Update&font=inter',
        color: 'orange'
    }
];

/**
 * Gets the list of available placeholder ads.
 * @returns {Array<object>} A copy of the ads array.
 */
function getAds() {
    return [...placeholderAds];
}

/**
 * Sets an ad to be displayed by its ID.
 * @param {string} adId - The unique ID of the ad to trigger.
 */
function triggerAd(adId) {
    const functionName = 'triggerAd (AdvertisingService)';
    if (!adId) {
        LoggingService.warn('[AdvertisingService] No ad ID provided to trigger.', { functionName });
        return;
    }

    const adToTrigger = placeholderAds.find(ad => ad.id === adId);

    if (!adToTrigger) {
        LoggingService.error(`[AdvertisingService] Ad with ID "${adId}" not found.`, new Error('AdNotFound'), { functionName, adId });
        return;
    }

    try {
        const adPayload = {
            ...adToTrigger,
            timestamp: Date.now()
        };
        localStorage.setItem(AD_TRIGGER_KEY, JSON.stringify(adPayload));
        LoggingService.info('[AdvertisingService] Ad trigger has been set in localStorage.', { functionName, adData: adPayload });
    } catch (error) {
        LoggingService.error('[AdvertisingService] Error setting ad trigger in localStorage.', error, { functionName });
    }
}

/**
 * Retrieves the ad data from localStorage if it exists.
 * @returns {object|null} The ad data object or null if not found.
 */
function getAdToShow() {
    const functionName = 'getAdToShow (AdvertisingService)';
    try {
        const adString = localStorage.getItem(AD_TRIGGER_KEY);
        if (adString) {
            const adData = JSON.parse(adString);
            LoggingService.debug('[AdvertisingService] Ad data retrieved from localStorage.', { functionName, adData });
            return adData;
        }
        return null;
    } catch (error) {
        LoggingService.error('[AdvertisingService] Error retrieving ad data from localStorage.', error, { functionName });
        return null;
    }
}

/**
 * Clears the ad trigger from localStorage after it has been displayed.
 */
function clearAdTrigger() {
    const functionName = 'clearAdTrigger (AdvertisingService)';
    try {
        localStorage.removeItem(AD_TRIGGER_KEY);
        LoggingService.info('[AdvertisingService] Ad trigger cleared from localStorage.', { functionName });
    } catch (error) {
        LoggingService.error('[AdvertisingService] Error clearing ad trigger from localStorage.', error, { functionName });
    }
}

const AdvertisingService = {
    getAds,
    triggerAd,
    getAdToShow,
    clearAdTrigger
};

export default AdvertisingService;

LoggingService.info("advertisingService.js loaded.", { module: 'advertisingService' });