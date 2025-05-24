// feature_social_media_links.js
// Manages the Social Media Links Feature.

import { isFeatureEnabled } from './featureFlagService.js';
import LoggingService from './loggingService.js';

// DOM Element References (will be populated in initialize if needed, or managed by settings modal structure)
let socialMediaLinksContainerEl;

/**
 * Initializes the Social Media Links Feature.
 * Sets up event listeners if needed (e.g., if links were dynamic or had complex interactions).
 */
function initialize() {
    const functionName = 'initialize (SocialMediaLinksFeature)';
    LoggingService.info('[SocialMediaLinksFeature] Initializing...', { functionName });

    socialMediaLinksContainerEl = document.getElementById('settingsSocialMediaLinksContainer');

    if (socialMediaLinksContainerEl) {
        // For now, links are static HTML controlled by visibility.
        // If links were dynamic or needed event listeners, they'd be set up here.
        LoggingService.debug('[SocialMediaLinksFeature] Social media links container found.', { functionName });
    } else {
        LoggingService.warn('[SocialMediaLinksFeature] settingsSocialMediaLinksContainer not found during initialization. This is expected if the feature is disabled and the HTML is not rendered.', { functionName });
    }

    LoggingService.info('[SocialMediaLinksFeature] Initialized.', { functionName });
}

/**
 * Updates the visibility of UI elements related to the Social Media Links feature
 * based on the feature flag.
 */
function updateUIVisibility() {
    const functionName = 'updateUIVisibility (SocialMediaLinksFeature)';
    if (typeof isFeatureEnabled !== 'function') {
        LoggingService.error("[SocialMediaLinksFeature] isFeatureEnabled function not available from FeatureFlagService.", new Error("DependencyMissing"), { functionName });
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('socialMediaLinksFeature');
    LoggingService.debug(`[SocialMediaLinksFeature] Updating UI visibility. Feature enabled: ${isActuallyEnabled}.`, { functionName, isActuallyEnabled });

    if (!socialMediaLinksContainerEl) { // Try to get it again if not found during init
        socialMediaLinksContainerEl = document.getElementById('settingsSocialMediaLinksContainer');
    }

    if (socialMediaLinksContainerEl) {
        socialMediaLinksContainerEl.classList.toggle('hidden', !isActuallyEnabled);
    }
    
    // Generic class toggling for any other elements if needed
    document.querySelectorAll('.social-media-links-feature-element').forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));
    LoggingService.info(`[SocialMediaLinksFeature] UI Visibility set based on flag: ${isActuallyEnabled}`, { functionName, isEnabled: isActuallyEnabled });
}


export const SocialMediaLinksFeature = {
    initialize,
    updateUIVisibility
};

LoggingService.debug("feature_social_media_links.js loaded as ES6 module.", { module: 'feature_social_media_links' });