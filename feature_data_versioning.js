// feature_data_versioning.js
// Manages the Data Versioning Feature.

import { isFeatureEnabled } from './featureFlagService.js';
import AppStore from './store.js';
import EventBus from './eventBus.js';
import LoggingService from './loggingService.js';
// showMessage might be needed later from ui_rendering.js

// --- Constants ---
const MAX_VERSIONS = 50; // Maximum number of versions to keep
const VERSION_STORAGE_KEY = 'dataVersions_v1';

// --- Internal State ---
let _dataVersions = []; // Array to store data snapshots

// --- Private Helper Functions ---

/**
 * Loads existing versions from localStorage.
 */
function _loadVersions() {
    const functionName = '_loadVersions (DataVersioningFeature)';
    try {
        const storedVersions = localStorage.getItem(VERSION_STORAGE_KEY);
        if (storedVersions) {
            _dataVersions = JSON.parse(storedVersions);
            LoggingService.info(`[DataVersioningFeature] Loaded ${_dataVersions.length} versions from localStorage.`, { functionName });
        } else {
            _dataVersions = [];
            LoggingService.info('[DataVersioningFeature] No versions found in localStorage. Initializing empty.', { functionName });
        }
    } catch (error) {
        _dataVersions = [];
        LoggingService.error('[DataVersioningFeature] Error loading versions from localStorage. Initializing empty.', error, { functionName });
    }
}

/**
 * Saves the current versions to localStorage.
 */
function _saveVersions() {
    const functionName = '_saveVersions (DataVersioningFeature)';
    try {
        localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(_dataVersions));
        LoggingService.debug(`[DataVersioningFeature] Saved ${_dataVersions.length} versions to localStorage.`, { functionName });
    } catch (error) {
        LoggingService.error('[DataVersioningFeature] Error saving versions to localStorage.', error, { functionName });
        // Potentially show a message to the user if localStorage is full
        if (typeof showMessage === 'function') {
            showMessage('Warning: Could not save data version history. Storage might be full.', 'warn');
        }
    }
}

/**
 * Captures a snapshot of the current application data.
 * @param {string} changeDescription - A brief description of what changed.
 */
export function captureSnapshot(changeDescription = "Data changed") {
    const functionName = 'captureSnapshot (DataVersioningFeature)';
    if (!isFeatureEnabled('dataVersioningFeature')) {
        return;
    }

    if (!AppStore || typeof AppStore.getTasks !== 'function' || typeof AppStore.getProjects !== 'function' || typeof AppStore.getKanbanColumns !== 'function') {
        LoggingService.error('[DataVersioningFeature] AppStore not available or missing required methods to capture snapshot.', new Error('AppStoreUnavailable'), { functionName });
        return;
    }

    LoggingService.debug(`[DataVersioningFeature] Attempting to capture snapshot: ${changeDescription}`, { functionName });

    const currentSnapshot = {
        timestamp: Date.now(),
        description: changeDescription,
        tasks: AppStore.getTasks(), // Gets a deep copy
        projects: AppStore.getProjects(), // Gets a deep copy
        kanbanColumns: AppStore.getKanbanColumns() // Gets a deep copy
        // Add other relevant parts of AppStore state if needed, e.g., uniqueLabels, uniqueProjects
    };

    // Prevent identical consecutive snapshots (optional, based on need)
    if (_dataVersions.length > 0) {
        const lastVersion = _dataVersions[_dataVersions.length - 1];
        // Simple check; for complex objects, a deep compare might be too slow.
        // This checks if the stringified core data parts are the same.
        if (JSON.stringify(lastVersion.tasks) === JSON.stringify(currentSnapshot.tasks) &&
            JSON.stringify(lastVersion.projects) === JSON.stringify(currentSnapshot.projects) &&
            JSON.stringify(lastVersion.kanbanColumns) === JSON.stringify(currentSnapshot.kanbanColumns)) {
            LoggingService.debug('[DataVersioningFeature] Snapshot identical to previous one. Skipping.', { functionName });
            return;
        }
    }


    _dataVersions.push(currentSnapshot);

    // Limit the number of versions stored
    if (_dataVersions.length > MAX_VERSIONS) {
        _dataVersions.splice(0, _dataVersions.length - MAX_VERSIONS); // Remove oldest versions
        LoggingService.info(`[DataVersioningFeature] Pruned old versions. Now at ${MAX_VERSIONS} versions.`, { functionName });
    }

    _saveVersions();
    LoggingService.info(`[DataVersioningFeature] Snapshot captured: "${changeDescription}". Total versions: ${_dataVersions.length}`, { functionName, description: changeDescription, versionCount: _dataVersions.length });

    // Optionally publish an event
    if (EventBus && EventBus.publish) {
        EventBus.publish('dataVersionCaptured', { newVersion: currentSnapshot, versionsCount: _dataVersions.length });
    }
}

/**
 * Retrieves the history of data versions.
 * @returns {Array<Object>} An array of version snapshots.
 */
export function getVersionHistory() {
    // Return a copy to prevent external modification
    return JSON.parse(JSON.stringify(_dataVersions)).sort((a, b) => b.timestamp - a.timestamp); // Show newest first
}

/**
 * Restores the application state to a specific version.
 * @param {number} timestamp - The timestamp of the version to restore.
 * @returns {boolean} True if restoration was successful, false otherwise.
 */
export function restoreVersion(timestamp) {
    const functionName = 'restoreVersion (DataVersioningFeature)';
    if (!isFeatureEnabled('dataVersioningFeature')) {
        LoggingService.warn('[DataVersioningFeature] Attempted to restore version while feature is disabled.', { functionName });
        if (typeof showMessage === 'function') showMessage('Data versioning feature is not enabled.', 'error');
        return false;
    }

    const versionToRestore = _dataVersions.find(v => v.timestamp === timestamp);
    if (!versionToRestore) {
        LoggingService.error(`[DataVersioningFeature] Version with timestamp ${timestamp} not found for restoration.`, new Error('VersionNotFound'), { functionName, timestamp });
        if (typeof showMessage === 'function') showMessage('Selected version not found for restoration.', 'error');
        return false;
    }

    if (!AppStore || typeof AppStore.setTasks !== 'function' || typeof AppStore.setProjects !== 'function' || typeof AppStore.setKanbanColumns !== 'function') {
        LoggingService.error('[DataVersioningFeature] AppStore not available or missing required setters for restoration.', new Error('AppStoreUnavailable'), { functionName });
        if (typeof showMessage === 'function') showMessage('Error restoring data: Application store is unavailable.', 'error');
        return false;
    }

    try {
        // Capture a "Before Restore" snapshot for safety, if desired
        // captureSnapshot(`Before restoring to version from ${new Date(timestamp).toLocaleString()}`);

        AppStore.setTasks(versionToRestore.tasks); // This will trigger 'tasksChanged'
        AppStore.setProjects(versionToRestore.projects); // This will trigger 'projectsChanged'
        AppStore.setKanbanColumns(versionToRestore.kanbanColumns); // This will trigger 'kanbanColumnsChanged'

        LoggingService.info(`[DataVersioningFeature] Application state restored to version from ${new Date(timestamp).toLocaleString()}.`, { functionName, timestamp });
        if (typeof showMessage === 'function') showMessage('Data restored successfully to the selected version!', 'success');

        // It's crucial that other parts of the app (UI rendering) react to the
        // 'tasksChanged', 'projectsChanged', etc., events published by AppStore.setX methods.
        // This ensures the UI refreshes to reflect the restored state.
        // A general 'dataRestored' event might also be useful.
        if (EventBus && EventBus.publish) {
            EventBus.publish('dataRestoredFromVersion', { restoredVersion: versionToRestore });
        }

        return true;
    } catch (error) {
        LoggingService.critical('[DataVersioningFeature] Critical error during data restoration process.', error, { functionName, timestamp });
        if (typeof showMessage === 'function') showMessage('A critical error occurred while restoring data.', 'error');
        return false;
    }
}


// --- Feature Module Standard Functions ---

/**
 * Initializes the Data Versioning Feature.
 */
function initialize() {
    const functionName = 'initialize (DataVersioningFeature)';
    LoggingService.info('[DataVersioningFeature] Initializing...', { functionName });

    _loadVersions(); // Load existing versions from storage

    // Listen to AppStore events to capture snapshots automatically
    // Note: This means AppStore must publish these events *after* data is fully updated and saved by AppStore itself.
    // We are adding a snapshot *after* the primary data persistence.
    if (EventBus) {
        EventBus.subscribe('tasksChanged', () => captureSnapshot('Tasks changed'));
        EventBus.subscribe('projectsChanged', () => captureSnapshot('Projects changed'));
        EventBus.subscribe('kanbanColumnsChanged', () => captureSnapshot('Kanban columns changed'));
        // Add subscriptions to other relevant data change events if AppStore emits them
    } else {
        LoggingService.warn('[DataVersioningFeature] EventBus not available. Automatic snapshot capture on data changes will not occur.', { functionName });
    }

    LoggingService.info('[DataVersioningFeature] Initialized and event listeners (if any) set up.', { functionName });
}

/**
 * Updates the visibility of UI elements related to the Data Versioning feature
 * based on the feature flag.
 */
function updateUIVisibility() {
    const functionName = 'updateUIVisibility (DataVersioningFeature)';
    if (typeof isFeatureEnabled !== 'function') {
        LoggingService.error("[DataVersioningFeature] isFeatureEnabled function not available from FeatureFlagService.", new Error("DependencyMissing"), { functionName });
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('dataVersioningFeature');
    LoggingService.debug(`[DataVersioningFeature] Updating UI visibility. Feature enabled: ${isActuallyEnabled}.`, { functionName, isActuallyEnabled });

    // Example: Toggle visibility of a settings button for version history
    const settingsVersionHistoryBtnEl = document.getElementById('settingsVersionHistoryBtn'); // We'll add this ID to todo.html later
    if (settingsVersionHistoryBtnEl) {
        settingsVersionHistoryBtnEl.classList.toggle('hidden', !isActuallyEnabled);
    }

    // Generic class for other elements related to this feature
    document.querySelectorAll('.data-versioning-feature-element').forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));

    LoggingService.info(`[DataVersioningFeature] UI Visibility set based on flag: ${isActuallyEnabled}`, { functionName, isEnabled: isActuallyEnabled });
}


export const DataVersioningFeature = {
    initialize,
    updateUIVisibility,
    captureSnapshot, // Expose for manual snapshotting if needed elsewhere
    getVersionHistory,
    restoreVersion
};

LoggingService.debug("feature_data_versioning.js created and loaded as ES6 module.", { module: 'feature_data_versioning' });