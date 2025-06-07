// performanceService.js
// This service captures and logs application performance metrics.

import LoggingService from './loggingService.js';
import { getFirestoreInstance } from './feature_user_accounts.js';
import { isFeatureEnabled } from './featureFlagService.js';

// Using a general feature flag for now, could be its own later.
const PERFORMANCE_METRICS_FEATURE_FLAG = 'userAccounts';
const METRICS_COLLECTION = 'performance_metrics';

/**
 * Captures key performance metrics from the browser's Performance API
 * and sends them to Firestore for aggregation.
 */
export function logPerformanceMetrics() {
    const functionName = 'logPerformanceMetrics (PerformanceService)';

    if (!isFeatureEnabled(PERFORMANCE_METRICS_FEATURE_FLAG)) {
        LoggingService.debug('[PerformanceService] Performance metric logging is disabled via flag.', { functionName, flag: PERFORMANCE_METRICS_FEATURE_FLAG });
        return;
    }

    // Use a timeout to ensure the call happens after the main rendering thread is less busy
    setTimeout(() => {
        try {
            if (typeof performance === 'undefined' || typeof performance.getEntriesByType !== 'function') {
                LoggingService.warn('[PerformanceService] Performance API not available. Cannot log metrics.', { functionName });
                return;
            }

            const navEntries = performance.getEntriesByType('navigation');
            if (!navEntries || navEntries.length === 0) {
                LoggingService.warn('[PerformanceService] No navigation timing entries found.', { functionName });
                return;
            }

            const timing = navEntries[0];
            // Using domContentLoadedEventEnd as a good metric for when the app becomes interactive.
            const loadTime = timing.domContentLoadedEventEnd;

            // A loadTime of 0 often indicates a prerendered page or a scenario where the metric isn't meaningful.
            if (loadTime <= 0) {
                LoggingService.debug('[PerformanceService] Load time is 0, likely a prerendered page or reload. Skipping metric logging.', { functionName, loadTime });
                return;
            }

            const metric = {
                loadTimeMS: loadTime,
                url: window.location.pathname, // Log path instead of full URL for privacy
            };

            _sendMetricToFirestore(metric);

        } catch (error) {
            LoggingService.error('[PerformanceService] Error capturing performance metrics.', error, { functionName });
        }
    }, 2000); // 2-second delay
}

/**
 * Sends the captured performance metric to a dedicated Firestore collection.
 * @param {object} metric - The performance metric object to send.
 * @private
 */
async function _sendMetricToFirestore(metric) {
    const functionName = '_sendMetricToFirestore (PerformanceService)';
    const db = getFirestoreInstance();

    if (!db) {
        LoggingService.error('[PerformanceService] Firestore instance not available. Cannot send metric.', new Error('FirestoreUnavailable'), { functionName });
        return;
    }

    // We can get the firebase global object to access FieldValue
    if (typeof firebase === 'undefined' || typeof firebase.firestore === 'undefined' || typeof firebase.firestore.FieldValue === 'undefined') {
        LoggingService.error('[PerformanceService] firebase.firestore.FieldValue is not available for server timestamp.', new Error('FirebaseGlobalMissing'), { functionName });
        return;
    }

    const metricToSend = {
        ...metric,
        serverTimestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        // No need to await if we don't need to block on this. "Fire and forget".
        db.collection(METRICS_COLLECTION).add(metricToSend);
        LoggingService.info(`[PerformanceService] Performance metric logged. Load time: ${metric.loadTimeMS.toFixed(2)}ms`, { functionName, metric: metricToSend });
    } catch (error) {
        LoggingService.error('[PerformanceService] Failed to send performance metric to Firestore.', error, { functionName });
    }
}