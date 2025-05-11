// feature_test_button.js

// Self-invoking function to encapsulate the feature's code and avoid polluting the global scope,
// while still allowing access to necessary global variables and functions.
(function() {
    /**
     * Initializes the Test Button Feature.
     * This function should be called if the 'testButtonFeature' flag is true.
     * It finds the test button and its container in the DOM and sets up its event listener.
     */
    function initializeTestButtonFeature() {
        // DOM elements related to this feature are still expected to be defined globally
        // or passed as arguments if we were to make this more isolated.
        // For now, we'll rely on them being available from ui_interactions.js
        // (e.g., testFeatureButton, testFeatureButtonContainer).

        if (testFeatureButton) {
            testFeatureButton.addEventListener('click', () => {
                console.log('Test Button Clicked! (From feature_test_button.js)');
                // Assuming showMessage is a globally available function from ui_interactions.js
                if (typeof showMessage === 'function') {
                    showMessage('Test Button Clicked! (From feature_test_button.js)', 'success');
                } else {
                    alert('Test Button Clicked! (From feature_test_button.js)'); // Fallback
                }
            });
            console.log('Test Button Feature Initialized.');
        } else {
            console.warn('Test Button element not found for initialization.');
        }
    }

    /**
     * Updates the visibility of the Test Button UI elements based on the feature flag.
     * This function can be called by a more general applyActiveFeatures function.
     * @param {boolean} isEnabled - True if the feature is enabled, false otherwise.
     */
    function updateTestButtonUIVisibility(isEnabled) {
        // Assuming testFeatureButtonContainer is a globally available DOM element reference
        if (testFeatureButtonContainer) {
            testFeatureButtonContainer.classList.toggle('hidden', !isEnabled);
        }
    }

    // Expose the initialization and UI update functions to the global scope (or a specific namespace)
    // so they can be called from the main scripts.
    // We'll attach them to a global object, e.g., `AppFeatures`, to keep the global scope clean.
    if (typeof window.AppFeatures === 'undefined') {
        window.AppFeatures = {};
    }
    window.AppFeatures.initializeTestButtonFeature = initializeTestButtonFeature;
    window.AppFeatures.updateTestButtonUIVisibility = updateTestButtonUIVisibility;

})();
