// feature_data_management.js
// Manages data export functionality.
// Now an ES6 module.

import { isFeatureEnabled } from './featureFlagService.js';
import AppStore from './store.js'; // To get data for export
import EventBus from './eventBus.js'; // MODIFIED: Added EventBus import
import LoggingService from './loggingService.js'; // MODIFIED: Added LoggingService import (was missing)

// MODIFIED: showMessage and closeSettingsModal are no longer assumed to be global or directly called.
// These will be handled via EventBus or specific imports if other interactions are needed.

// --- DOM Element References (initialized in initialize) ---
let settingsExportDataBtnEl; 

/**
 * Prepares all application data for export.
 * @returns {object} An object containing all data to be exported.
 */
function prepareDataForExport() {
    const functionName = "prepareDataForExport (DataManagement)"; // For logging
    if (!AppStore || typeof AppStore.getTasks !== 'function' || 
        typeof AppStore.getProjects !== 'function' || 
        typeof AppStore.getKanbanColumns !== 'function' ||
        typeof AppStore.getFeatureFlags !== 'function') {
        LoggingService.error("[DataManagement] AppStore API not available for prepareDataForExport.", new Error("AppStoreMissing"), { functionName });
        return {
            error: "Missing core data access for export.",
            version: "1.0.0", // Consider getting from versionService
            exportDate: new Date().toISOString(),
            data: {}
        };
    }

    return {
        version: "1.0.0", // Consider getting from versionService
        exportDate: new Date().toISOString(),
        data: {
            tasks: AppStore.getTasks(),
            projects: AppStore.getProjects(),
            kanbanColumns: AppStore.getKanbanColumns(),
            featureFlags: AppStore.getFeatureFlags() 
        }
    };
}

/**
 * Handles the data export process.
 */
function handleExportData() {
    const functionName = "handleExportData (DataManagement)"; // For logging
    if (!isFeatureEnabled('exportDataFeature')) {
        // MODIFIED: Publish event instead of direct/conditional call
        EventBus.publish('displayUserMessage', { text: 'Export feature is not enabled.', type: 'error' });
        LoggingService.warn("[DataManagement] Export attempt while feature is disabled.", { functionName });
        return;
    }

    try {
        const allData = prepareDataForExport();
        if (allData.error) {
            LoggingService.error('[DataManagement] Error preparing data for export:', new Error(allData.error), { functionName });
            // MODIFIED: Publish event instead of direct call
            EventBus.publish('displayUserMessage', { text: allData.error, type: 'error' });
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

        // MODIFIED: Publish event instead of direct call
        EventBus.publish('displayUserMessage', { text: 'Data exported successfully!', type: 'success' });
        LoggingService.info("[DataManagement] Data exported successfully.", { functionName, fileName: a.download });
        
        // Closing settings modal is best handled by an event or a more direct call if this module
        // has a reference to the modal closing function from modal_interactions.js
        // For now, if settings modal needs to close, that logic should be in ui_event_handlers.js
        // or modal_interactions.js listening to a 'dataExportedSuccessfully' event if needed.
        // Direct DOM manipulation or global calls from here are avoided.
        const settingsModalEl = document.getElementById('settingsModal'); 
        if (settingsModalEl && !settingsModalEl.classList.contains('hidden') && window.ModalInteractions && window.ModalInteractions.closeSettingsModal) {
             // This relies on ModalInteractions being exposed globally, which we are trying to move away from.
             // Ideally, this module shouldn't be responsible for closing a generic settings modal.
             // The event handler that calls handleExportData could be responsible.
            LoggingService.debug("[DataManagement] Attempting to close settings modal via global call (consider refactoring).", {functionName});
            window.ModalInteractions.closeSettingsModal();
        }


    } catch (error) {
        LoggingService.error('[DataManagement] Error during data export:', error, { functionName });
        // MODIFIED: Publish event instead of direct call
        EventBus.publish('displayUserMessage', { text: 'An error occurred during export.', type: 'error' });
    }
}

/**
 * Initializes the Data Management Feature.
 */
function initialize() {
    const functionName = "initialize (DataManagement)"; // For logging
    settingsExportDataBtnEl = document.getElementById('settingsExportDataBtn');
    if (settingsExportDataBtnEl) {
        settingsExportDataBtnEl.addEventListener('click', handleExportData);
        LoggingService.debug("[DataManagement] Event listener attached to export data button.", {functionName});
    } else {
        LoggingService.warn('[DataManagement] Export data button not found during initialization.', {functionName});
    }
    LoggingService.info('[DataManagementFeature] Initialized.', {functionName});
}

/**
 * Updates the visibility of Data Management UI elements based on feature flags.
 */
function updateUIVisibility() { // Removed isEnabledParam
    const functionName = "updateUIVisibility (DataManagement)"; // For logging
    if (typeof isFeatureEnabled !== 'function') {
        LoggingService.error("[DataManagementFeature] isFeatureEnabled function not available.", new Error("DependencyMissing"), { functionName });
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('exportDataFeature');
    LoggingService.debug(`[DataManagement] Updating UI visibility. Feature 'exportDataFeature' enabled: ${isActuallyEnabled}.`, {functionName});

    if (settingsExportDataBtnEl) { 
        settingsExportDataBtnEl.classList.toggle('hidden', !isActuallyEnabled);
    }
    // The generic '.export-data-feature-element' class handling is in ui_event_handlers.js applyActiveFeatures
    LoggingService.info(`[DataManagementFeature] UI Visibility updated based on flag: ${isActuallyEnabled}`, { functionName, isEnabled: isActuallyEnabled });
}

export const DataManagementFeature = {
    initialize,
    updateUIVisibility
};

LoggingService.debug("feature_data_management.js loaded as ES6 module.", { module: 'feature_data_management' });