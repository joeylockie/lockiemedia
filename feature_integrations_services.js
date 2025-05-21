// feature_integrations_services.js
// Placeholder for Integrations with other Services Feature.
// Now an ES6 module.

import { isFeatureEnabled } from './featureFlagService.js';
// DOM elements with '.integrations-services-element' are handled by applyActiveFeatures

/**
 * Initializes the Integrations Services Feature.
 * Placeholder for future initialization logic.
 */
function initialize() {
    console.log('[IntegrationsServicesFeature] Initialized (Placeholder).');
    // Future: Setup for API connections, authentication flows, etc.
}

/**
 * Updates the visibility of UI elements related to the Integrations Services feature.
 * @param {boolean} isEnabledParam - (Not used directly, uses imported isFeatureEnabled)
 */
function updateUIVisibility(isEnabledParam) {
    if (typeof isFeatureEnabled !== 'function') {
        console.error("[IntegrationsServicesFeature] isFeatureEnabled function not available from FeatureFlagService.");
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('integrationsServices');
    document.querySelectorAll('.integrations-services-element').forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));
    console.log(`[IntegrationsServicesFeature] UI Visibility set based on flag: ${isActuallyEnabled}`);
}

export const IntegrationsServicesFeature = {
    initialize,
    updateUIVisibility
};

console.log("feature_integrations_services.js loaded as ES6 module.");