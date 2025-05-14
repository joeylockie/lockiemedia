// feature_data_management.js

// Self-invoking function to encapsulate the Data Management (Export/Import) feature's code
(function() {
    // --- DOM Element References ---
    // The button for exporting data will be in the settings modal.
    // We'll get its reference in the initialize function or when it's needed.
    let settingsExportDataBtn;

    /**
     * Initializes the Data Management Feature.
     * For now, this mainly involves getting a reference to the export button.
     */
    function initializeDataManagementFeature() {
        settingsExportDataBtn = document.getElementById('settingsExportDataBtn'); // This ID will be added to todo.html

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
    function updateUIVisibility(isExportEnabled, isImportEnabled = false) { // Added isImportEnabled for future
        if (settingsExportDataBtn) {
            settingsExportDataBtn.classList.toggle('hidden', !isExportEnabled);
        }
        // Example for future import button:
        // const settingsImportDataBtn = document.getElementById('settingsImportDataBtn');
        // if (settingsImportDataBtn) {
        //     settingsImportDataBtn.classList.toggle('hidden', !isImportEnabled);
        // }
        console.log(`Data Management UI Visibility - Export: ${isExportEnabled}`);
    }

    /**
     * Handles the data export process.
     * Gathers data, converts to JSON, and triggers a download.
     */
    function handleExportData() {
        if (!featureFlags.exportDataFeature) {
            if (typeof showMessage === 'function') {
                showMessage('Export feature is not enabled.', 'error');
            }
            return;
        }

        if (typeof prepareDataForExport !== 'function') {
            console.error('[DataManagement] prepareDataForExport function is not defined in app_logic.js.');
            if (typeof showMessage === 'function') {
                showMessage('Error preparing data for export. Function missing.', 'error');
            }
            return;
        }

        try {
            const allData = prepareDataForExport(); // Get data from app_logic.js
            const jsonData = JSON.stringify(allData, null, 2); // Pretty print JSON with 2 spaces

            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;

            // Generate filename with current date
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
            if (typeof closeSettingsModal === 'function' && settingsModal && !settingsModal.classList.contains('hidden')) {
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
    // Ensure a specific namespace for this feature if it doesn't exist
    if (typeof window.AppFeatures.DataManagement === 'undefined') {
        window.AppFeatures.DataManagement = {};
    }

    window.AppFeatures.DataManagement.initialize = initializeDataManagementFeature;
    window.AppFeatures.DataManagement.updateUIVisibility = updateUIVisibility;
    window.AppFeatures.DataManagement.handleExportData = handleExportData; // Expose if needed directly, though usually called by event listener

})();
