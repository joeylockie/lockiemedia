// feature_file_attachments.js
// Placeholder for File Attachments Feature.
// Now an ES6 module.

import { isFeatureEnabled } from './featureFlagService.js';
// DOM elements with '.file-attachments-element' are handled by applyActiveFeatures

/**
 * Initializes the File Attachments Feature.
 * Placeholder for future initialization logic.
 */
function initialize() {
    console.log('[FileAttachmentsFeature] Initialized (Placeholder).');
    // Future: Setup event listeners for file input/drop zones,
    // handle file uploads/linking, display attached files.
}

/**
 * Updates the visibility of File Attachments UI elements based on the feature flag.
 * @param {boolean} isEnabledParam - (Not used directly, uses imported isFeatureEnabled)
 */
function updateUIVisibility(isEnabledParam) {
    if (typeof isFeatureEnabled !== 'function') {
        console.error("[FileAttachmentsFeature] isFeatureEnabled function not available from FeatureFlagService.");
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('fileAttachments');
    document.querySelectorAll('.file-attachments-element').forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));
    console.log(`[FileAttachmentsFeature] UI Visibility set based on flag: ${isActuallyEnabled}`);
}

export const FileAttachmentsFeature = {
    initialize,
    updateUIVisibility
};

console.log("feature_file_attachments.js loaded as ES6 module.");