// advertisingService.js
// This service manages the logic for triggering and displaying ads via localStorage.

import LoggingService from './loggingService.js';

const AD_TRIGGER_KEY = 'lockiemedia_ad_trigger_v1';

/**
 * Sets an ad to be displayed on the public-facing pages.
 * @param {object} adData - An object containing the ad details.
 * Example: { id: 'test01', type: 'popup', content: '...'}
 */
function triggerAd(adData) {
    const functionName = 'triggerAd (AdvertisingService)';
    if (!adData) {
        LoggingService.warn('[AdvertisingService] No ad data provided to trigger.', { functionName });
        return;
    }
    try {
        const adPayload = {
            ...adData,
            timestamp: Date.now()
        };
        localStorage.setItem(AD_TRIGGER_KEY, JSON.stringify(adPayload));
        LoggingService.info('[AdvertisingService] Ad trigger has been set in localStorage.', { functionName, adData });
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
    triggerAd,
    getAdToShow,
    clearAdTrigger
};

export default AdvertisingService;

LoggingService.info("advertisingService.js loaded.", { module: 'advertisingService' });