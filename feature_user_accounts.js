// feature_user_accounts.js
// Placeholder for User Accounts Feature.
// Now an ES6 module.

import { isFeatureEnabled } from './featureFlagService.js';
// DOM elements with '.user-accounts-element' are handled by applyActiveFeatures

/**
 * Initializes the User Accounts Feature.
 * Placeholder for future initialization logic.
 */
function initialize() {
    console.log('[UserAccountsFeature] Initialized (Placeholder).');
    // Future: Setup UI for login/logout, profile management,
    // check for existing sessions, etc.
}

/**
 * Updates the visibility of User Accounts UI elements based on the feature flag.
 * @param {boolean} isEnabledParam - (Not used directly, uses imported isFeatureEnabled)
 */
function updateUIVisibility(isEnabledParam) {
    if (typeof isFeatureEnabled !== 'function') {
        console.error("[UserAccountsFeature] isFeatureEnabled function not available from FeatureFlagService.");
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('userAccounts');
    document.querySelectorAll('.user-accounts-element').forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));
    console.log(`[UserAccountsFeature] UI Visibility set based on flag: ${isActuallyEnabled}`);
}

export const UserAccountsFeature = {
    initialize,
    updateUIVisibility
};

console.log("feature_user_accounts.js loaded as ES6 module.");