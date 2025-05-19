// feature_data_management.js

// Self-invoking function to encapsulate the Data Management (Export/Import) feature's code
(function() {
    // --- DOM Element References ---
    let settingsExportDataBtn;

    /**
     * Initializes the Data Management Feature.
     * Sets up event listener for the export button.
     */
    function initializeDataManagementFeature() {
        settingsExportDataBtn = document.getElementById('settingsExportDataBtn');

        if (settingsExportDataBtn) {
            settingsExportDataBtn.addEventListener('click', handleExportData);
        } else {
            console.warn('[DataManagement] Export data button not found during initialization.');
        }
        console.log('Data Management Feature (Export) Initialized.');
    }

    /**
     * Updates the visibility of Data Management UI elements based on feature flags.
     * @param {boolean} isExportEnabled - True if the export feature is enabled.
     * @param {boolean} isImportEnabled - True if the import feature is enabled (for future use).
     */
    function updateUIVisibility(isExportEnabled, isImportEnabled = false) {
        // Assumes featureFlags is globally available from store.js or FeatureFlagService
        if (typeof featureFlags === 'undefined') {
            console.error("[DataManagement] 'featureFlags' not available globally.");
            return;
        }

        if (settingsExportDataBtn) {
            settingsExportDataBtn.classList.toggle('hidden', !featureFlags.exportDataFeature); // Use the actual flag
        }
        // Example for future import button:
        // const settingsImportDataBtn = document.getElementById('settingsImportDataBtn');
        // if (settingsImportDataBtn) {
        //     settingsImportDataBtn.classList.toggle('hidden', !isImportEnabled); // Or !featureFlags.importDataFeature
        // }
        console.log(`[DataManagement] UI Visibility - Export: ${featureFlags.exportDataFeature}`);
    }

    /**
     * Prepares all application data for export.
     * This function itself doesn't trigger download but returns the data object.
     * Relies on global state variables from store.js.
     * @returns {object} An object containing all data to be exported.
     */
    function prepareDataForExport() {
        // Access global state variables (tasks, projects, etc.) defined in store.js
        if (typeof tasks === 'undefined' || typeof projects === 'undefined' ||
            typeof kanbanColumns === 'undefined' || typeof featureFlags === 'undefined') {
            console.error("[DataManagement] Global state variables (tasks, projects, kanbanColumns, featureFlags) are not defined. Ensure store.js is loaded and initialized.");
            return {
                error: "Missing core data for export.",
                version: "1.0.0",
                exportDate: new Date().toISOString(),
                data: {}
            };
        }

        return {
            version: "1.0.0", // Version of the export format
            exportDate: new Date().toISOString(),
            data: {
                tasks: tasks,
                projects: projects,
                kanbanColumns: kanbanColumns,
                // Use a snapshot of feature flags from FeatureFlagService if available, otherwise global
                featureFlags: (window.FeatureFlagService && typeof window.FeatureFlagService.getAllFeatureFlags === 'function')
                                ? window.FeatureFlagService.getAllFeatureFlags()
                                : featureFlags
            }
        };
    }


    /**
     * Handles the data export process.
     * Gathers data, converts to JSON, and triggers a download.
     */
    function handleExportData() {
        // Assumes featureFlags is globally available from store.js or FeatureFlagService
        if (typeof featureFlags === 'undefined' || !featureFlags.exportDataFeature) {
            if (typeof showMessage === 'function') {
                showMessage('Export feature is not enabled.', 'error');
            }
            return;
        }

        try {
            const allData = prepareDataForExport(); // Get data using the local function
            if (allData.error) {
                console.error('[DataManagement] Error preparing data for export:', allData.error);
                if (typeof showMessage === 'function') showMessage(allData.error, 'error');
                return;
            }

            const jsonData = JSON.stringify(allData, null, 2); // Pretty print JSON with 2 spaces

            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;

            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            a.download = `todo_app_backup_${year}-${month}-${day}_${hours}-${minutes}.json`;

            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            if (typeof showMessage === 'function') {
                showMessage('Data exported successfully!', 'success');
            }
            // Close settings modal if open
            // Assumes settingsModal and closeSettingsModal are globally available (from modal_interactions.js or ui_event_handlers.js)
            if (typeof closeSettingsModal === 'function' && typeof settingsModal !== 'undefined' && settingsModal && !settingsModal.classList.contains('hidden')) {
                closeSettingsModal();
            }

        } catch (error) {
            console.error('[DataManagement] Error during data export:', error);
            if (typeof showMessage === 'function') {
                showMessage('An error occurred during export. Check console for details.', 'error');
            }
        }
    }

    // Expose functions to the global scope via AppFeatures
    if (typeof window.AppFeatures === 'undefined') {
        window.AppFeatures = {};
    }
    if (typeof window.AppFeatures.DataManagement === 'undefined') {
        window.AppFeatures.DataManagement = {};
    }

    window.AppFeatures.DataManagement.initialize = initializeDataManagementFeature;
    window.AppFeatures.DataManagement.updateUIVisibility = updateUIVisibility;
    // prepareDataForExport is now internal to this module, used by handleExportData.
    // handleExportData is called by the event listener set up in initialize.
    // No need to expose them further unless other modules need to call them directly.

    // console.log("feature_data_management.js loaded");
})();
