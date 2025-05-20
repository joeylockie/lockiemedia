// feature_data_management.js
// Manages data export functionality.
// Now an ES6 module.

import { isFeatureEnabled } from './featureFlagService.js';
import AppStore from './store.js'; // To get data for export

// DOM elements are accessed by ID within initialize.
// showMessage, closeSettingsModal are currently global functions.

// --- DOM Element References (initialized in initialize) ---
let settingsExportDataBtnEl; // Renamed to avoid conflict if other modules use similar names

/**
 * Prepares all application data for export.
 * @returns {object} An object containing all data to be exported.
 */
function prepareDataForExport() {
    if (!AppStore || typeof AppStore.getTasks !== 'function' || 
        typeof AppStore.getProjects !== 'function' || 
        typeof AppStore.getKanbanColumns !== 'function' ||
        typeof AppStore.getFeatureFlags !== 'function') {
        console.error("[DataManagement] AppStore API not available for prepareDataForExport.");
        return {
            error: "Missing core data access for export.",
            version: "1.0.0",
            exportDate: new Date().toISOString(),
            data: {}
        };
    }

    return {
        version: "1.0.0",
        exportDate: new Date().toISOString(),
        data: {
            tasks: AppStore.getTasks(),
            projects: AppStore.getProjects(),
            kanbanColumns: AppStore.getKanbanColumns(),
            featureFlags: AppStore.getFeatureFlags() // Get current flags from AppStore (which got them from FeatureFlagService)
        }
    };
}

/**
 * Handles the data export process.
 */
function handleExportData() {
    if (!isFeatureEnabled('exportDataFeature')) {
        if (typeof showMessage === 'function') {
            showMessage('Export feature is not enabled.', 'error');
        }
        return;
    }

    try {
        const allData = prepareDataForExport();
        if (allData.error) {
            console.error('[DataManagement] Error preparing data for export:', allData.error);
            if (typeof showMessage === 'function') showMessage(allData.error, 'error');
            return;
        }

        const jsonData = JSON.stringify(allData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const timeStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
        a.download = `todo_app_backup_${dateStr}_${timeStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (typeof showMessage === 'function') showMessage('Data exported successfully!', 'success');
        
        // Close settings modal if open (modal_interactions.js functions are global for now)
        const settingsModalEl = document.getElementById('settingsModal'); // Direct DOM access
        if (typeof closeSettingsModal === 'function' && settingsModalEl && !settingsModalEl.classList.contains('hidden')) {
            closeSettingsModal();
        }

    } catch (error) {
        console.error('[DataManagement] Error during data export:', error);
        if (typeof showMessage === 'function') showMessage('An error occurred during export.', 'error');
    }
}

/**
 * Initializes the Data Management Feature.
 */
function initialize() {
    settingsExportDataBtnEl = document.getElementById('settingsExportDataBtn');
    if (settingsExportDataBtnEl) {
        settingsExportDataBtnEl.addEventListener('click', handleExportData);
    } else {
        console.warn('[DataManagement] Export data button not found during initialization.');
    }
    console.log('[DataManagementFeature] Initialized.');
}

/**
 * Updates the visibility of Data Management UI elements based on feature flags.
 * @param {boolean} isEnabledParam - (Not used directly, uses imported isFeatureEnabled)
 */
function updateUIVisibility(isEnabledParam) {
    if (typeof isFeatureEnabled !== 'function') {
        console.error("[DataManagementFeature] isFeatureEnabled function not available.");
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('exportDataFeature');

    // The .export-data-feature-element class on UI parts (e.g., button in settings)
    // is toggled by applyActiveFeatures in ui_event_handlers.js.
    if (settingsExportDataBtnEl) { // Direct toggle if element reference is available
        settingsExportDataBtnEl.classList.toggle('hidden', !isActuallyEnabled);
    }
    console.log(`[DataManagementFeature] UI Visibility (partially handled by applyActiveFeatures) set based on flag: ${isActuallyEnabled}`);
}

export const DataManagementFeature = {
    initialize,
    updateUIVisibility
    // prepareDataForExport and handleExportData are internal to this module
};

console.log("feature_data_management.js loaded as ES6 module.");
