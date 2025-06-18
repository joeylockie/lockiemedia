// performanceService.js
// This service captures and logs application performance metrics.

import LoggingService from './loggingService.js';
// import { getFirestoreInstance } from './feature_user_accounts.js'; // REMOVED
// import { isFeatureEnabled } from './featureFlagService.js'; // REMOVED

// Using a general feature flag for now, could be its own later.
const PERFORMANCE_METRICS_FEATURE_FLAG = 'userRoleFeature'; // Changed to a flag that exists in main.js
const METRICS_COLLECTION = 'performance_metrics';

/**
 * Captures key performance metrics from the browser's Performance API.
 * In this version, it only logs to the console as Firestore is removed.
 */
export function logPerformanceMetrics() {
    const functionName = 'logPerformanceMetrics (PerformanceService)';

    if (!window.isFeatureEnabled(PERFORMANCE_METRICS_FEATURE_FLAG)) { // MODIFIED to use window
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
            const loadTime = timing.domContentLoadedEventEnd;

            if (loadTime <= 0) {
                LoggingService.debug('[PerformanceService] Load time is 0, likely a prerendered page or reload. Skipping metric logging.', { functionName, loadTime });
                return;
            }

            const metric = {
                loadTimeMS: loadTime,
                url: window.location.pathname,
            };

            // Since Firestore is removed, we'll just log it locally.
            LoggingService.info(`[PerformanceService] App Load Time: ${metric.loadTimeMS.toFixed(2)}ms for page: ${metric.url}`, { functionName, metric });

        } catch (error) {
            LoggingService.error('[PerformanceService] Error capturing performance metrics.', error, { functionName });
        }
    }, 2000); // 2-second delay
}

/**
 * (No-op) Sends the captured performance metric to a dedicated Firestore collection.
 * This function is now a placeholder.
 * @param {object} metric - The performance metric object.
 * @private
 */
async function _sendMetricToFirestore(metric) {
    const functionName = '_sendMetricToFirestore (PerformanceService)';
    LoggingService.debug('[PerformanceService] Firestore logging is disabled in this version. Metric not sent.', { functionName, metric });
    return;
}