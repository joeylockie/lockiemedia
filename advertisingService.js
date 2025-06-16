// advertisingService.js
// This service manages the logic for triggering and displaying ads, now backed by Firestore.

import LoggingService from './loggingService.js';

let firestoreDB; 

const AD_TRIGGER_KEY = 'lockiemedia_ad_trigger_v1';
const ADS_COLLECTION = 'ads';
const AD_ANALYTICS_COLLECTION = 'ad_analytics';

function initialize(db) {
    if (!db) {
        LoggingService.error('[AdService] Initialization failed: Firestore instance is required.');
        return;
    }
    firestoreDB = db;
    LoggingService.info('[AdService] Initialized with Firestore instance.');
}

async function seedInitialAds() {
    const functionName = 'seedInitialAds (AdvertisingService)';
    if (!firestoreDB) {
        LoggingService.error('[AdService] Firestore not initialized. Cannot seed ads.', new Error('DBInstanceMissing'), { functionName });
        return;
    }

    const adsRef = firestoreDB.collection(ADS_COLLECTION);
    const snapshot = await adsRef.limit(1).get();

    if (!snapshot.empty) {
        LoggingService.info('[AdService] Ads collection is not empty. Skipping seed operation.', { functionName });
        return;
    }

    LoggingService.info('[AdService] Ads collection is empty. Seeding initial ads...', { functionName });
    const placeholderAds = [
        { id: 'promo_save25', title: 'Special Offer!', content: 'Get 25% off your next purchase. Use code: SAVE25', imageUrl: 'https://placehold.co/300x150/0ea5e9/ffffff?text=Awesome+Product&font=inter', adUrl: '#', color: 'sky', startDate: '', endDate: '' },
        { id: 'event_webinar', title: 'Live Webinar Next Week', content: 'Join our free webinar on productivity hacks and boost your efficiency.', imageUrl: 'https://placehold.co/300x150/16a34a/ffffff?text=Live+Webinar&font=inter', adUrl: '#', color: 'green', startDate: '', endDate: '' },
        { id: 'alert_maintenance', title: 'Scheduled Maintenance', content: 'Our services will be briefly unavailable this Sunday for scheduled maintenance.', imageUrl: 'https://placehold.co/300x150/f97316/ffffff?text=System+Update&font=inter', adUrl: '#', color: 'orange', startDate: '', endDate: '' }
    ];

    const batch = firestoreDB.batch();
    placeholderAds.forEach(ad => {
        const docRef = adsRef.doc(ad.id);
        batch.set(docRef, ad);
    });

    try {
        await batch.commit();
        LoggingService.info(`[AdService] Successfully seeded ${placeholderAds.length} ads.`, { functionName });
    } catch (error) {
        LoggingService.error('[AdService] Error committing seed batch for ads.', error, { functionName });
    }
}


async function getAds() {
    const functionName = 'getAds (AdvertisingService)';
    if (!firestoreDB) return [];
    
    try {
        const snapshot = await firestoreDB.collection(ADS_COLLECTION).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        LoggingService.error('[AdService] Error fetching ads from Firestore.', error, { functionName });
        return [];
    }
}

async function logAdEvent(eventData) {
    const functionName = 'logAdEvent (AdvertisingService)';
    if (!firestoreDB) return;

    const logPayload = {
        ...eventData,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await firestoreDB.collection(AD_ANALYTICS_COLLECTION).add(logPayload);
        LoggingService.info(`[AdService] Logged ad event: ${eventData.eventType}`, { functionName, eventData });
    } catch (error) {
        LoggingService.error('[AdService] Error logging ad event.', error, { functionName, eventData });
    }
}

async function triggerAd(adId, adminUserEmail = 'unknown') {
    const functionName = 'triggerAd (AdvertisingService)';
    if (!adId || !firestoreDB) return;

    try {
        const adRef = firestoreDB.collection(ADS_COLLECTION).doc(adId);
        const adDoc = await adRef.get();

        if (!adDoc.exists) {
            LoggingService.error(`[AdService] Ad with ID "${adId}" not found in Firestore.`, new Error('AdNotFound'), { functionName, adId });
            return;
        }

        const adPayload = { id: adDoc.id, ...adDoc.data(), timestamp: Date.now() };
        localStorage.setItem(AD_TRIGGER_KEY, JSON.stringify(adPayload));
        await logAdEvent({ adId: adId, eventType: 'trigger', triggeredBy: adminUserEmail });
    } catch (error) {
        LoggingService.error(`[AdService] Error triggering ad with ID ${adId}.`, error, { functionName });
    }
}

function getAdToShow() {
    const functionName = 'getAdToShow (AdvertisingService)';
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

/**
 * NEW: Sets up a real-time listener for ad analytics.
 * @param {function} callback - The function to call with the aggregated stats object.
 * @returns {function} The unsubscribe function for the listener.
 */
function streamAnalytics(callback) {
    const functionName = 'streamAnalytics (AdvertisingService)';
    if (!firestoreDB) {
        LoggingService.error('[AdService] Firestore not initialized. Cannot stream analytics.', new Error('DBInstanceMissing'), { functionName });
        return () => {}; // Return a no-op unsubscribe function
    }

    const analyticsRef = firestoreDB.collection(AD_ANALYTICS_COLLECTION);
    
    const unsubscribe = analyticsRef.onSnapshot(snapshot => {
        const events = snapshot.docs.map(doc => doc.data());
        const stats = events.reduce((acc, event) => {
            const adId = event.adId;
            if (!acc[adId]) {
                acc[adId] = { triggers: 0, views: 0, clicks: 0 };
            }
            if (event.eventType === 'trigger') acc[adId].triggers++;
            if (event.eventType === 'view') acc[adId].views++;
            if (event.eventType === 'click') acc[adId].clicks++;
            return acc;
        }, {});
        
        // Call the callback with the freshly aggregated stats
        callback(stats);

    }, error => {
        LoggingService.error('[AdService] Error in analytics stream.', error, { functionName });
        callback({}); // Send empty stats on error
    });

    return unsubscribe;
}

const AdvertisingService = {
    initialize,
    seedInitialAds,
    getAds,
    triggerAd,
    getAdToShow,
    clearAdTrigger,
    logAdEvent,
    streamAnalytics // <-- EXPOSE NEW FUNCTION
};

export default AdvertisingService;

LoggingService.info("advertisingService.js loaded.", { module: 'advertisingService' });