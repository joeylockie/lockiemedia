// feature_data_versioning.js
// Manages the Data Versioning Feature.

// import { isFeatureEnabled } from './featureFlagService.js'; // REMOVED
import AppStore from './store.js';
import EventBus from './eventBus.js'; // Already imported
import LoggingService from './loggingService.js'; // Already imported
// MODIFIED: showMessage is no longer assumed to be global or directly called.

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
        // MODIFIED: Publish event instead of direct/conditional call
        EventBus.publish('displayUserMessage', { text: 'Warning: Could not save data version history. Storage might be full.', type: 'warn' });
    }
}

/**
 * Captures a snapshot of the current application data.
 * @param {string} changeDescription - A brief description of what changed.
 */
export function captureSnapshot(changeDescription = "Data changed") {
    const functionName = 'captureSnapshot (DataVersioningFeature)';
    if (!window.isFeatureEnabled('dataVersioningFeature')) { // MODIFIED to use window
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
        tasks: AppStore.getTasks(), 
        projects: AppStore.getProjects(), 
        kanbanColumns: AppStore.getKanbanColumns() 
    };

    if (_dataVersions.length > 0) {
        const lastVersion = _dataVersions[_dataVersions.length - 1];
        if (JSON.stringify(lastVersion.tasks) === JSON.stringify(currentSnapshot.tasks) &&
            JSON.stringify(lastVersion.projects) === JSON.stringify(currentSnapshot.projects) &&
            JSON.stringify(lastVersion.kanbanColumns) === JSON.stringify(currentSnapshot.kanbanColumns)) {
            LoggingService.debug('[DataVersioningFeature] Snapshot identical to previous one. Skipping.', { functionName });
            return;
        }
    }


    _dataVersions.push(currentSnapshot);

    if (_dataVersions.length > MAX_VERSIONS) {
        _dataVersions.splice(0, _dataVersions.length - MAX_VERSIONS); 
        LoggingService.info(`[DataVersioningFeature] Pruned old versions. Now at ${MAX_VERSIONS} versions.`, { functionName });
    }

    _saveVersions();
    LoggingService.info(`[DataVersioningFeature] Snapshot captured: "${changeDescription}". Total versions: ${_dataVersions.length}`, { functionName, description: changeDescription, versionCount: _dataVersions.length });

    if (EventBus && EventBus.publish) {
        EventBus.publish('dataVersionCaptured', { newVersion: currentSnapshot, versionsCount: _dataVersions.length });
    }
}

/**
 * Retrieves the history of data versions.
 * @returns {Array<Object>} An array of version snapshots.
 */
export function getVersionHistory() {
    return JSON.parse(JSON.stringify(_dataVersions)).sort((a, b) => b.timestamp - a.timestamp); 
}

/**
 * Restores the application state to a specific version.
 * @param {number} timestamp - The timestamp of the version to restore.
 * @returns {boolean} True if restoration was successful, false otherwise.
 */
export function restoreVersion(timestamp) {
    const functionName = 'restoreVersion (DataVersioningFeature)';
    if (!window.isFeatureEnabled('dataVersioningFeature')) { // MODIFIED to use window
        LoggingService.warn('[DataVersioningFeature] Attempted to restore version while feature is disabled.', { functionName });
        // MODIFIED: Publish event instead of direct/conditional call
        EventBus.publish('displayUserMessage', { text: 'Data versioning feature is not enabled.', type: 'error' });
        return false;
    }

    const versionToRestore = _dataVersions.find(v => v.timestamp === timestamp);
    if (!versionToRestore) {
        LoggingService.error(`[DataVersioningFeature] Version with timestamp ${timestamp} not found for restoration.`, new Error('VersionNotFound'), { functionName, timestamp });
        // MODIFIED: Publish event instead of direct/conditional call
        EventBus.publish('displayUserMessage', { text: 'Selected version not found for restoration.', type: 'error' });
        return false;
    }

    if (!AppStore || typeof AppStore.setTasks !== 'function' || typeof AppStore.setProjects !== 'function' || typeof AppStore.setKanbanColumns !== 'function') {
        LoggingService.error('[DataVersioningFeature] AppStore not available or missing required setters for restoration.', new Error('AppStoreUnavailable'), { functionName });
        // MODIFIED: Publish event instead of direct/conditional call
        EventBus.publish('displayUserMessage', { text: 'Error restoring data: Application store is unavailable.', type: 'error' });
        return false;
    }

    try {
        AppStore.setTasks(versionToRestore.tasks); 
        AppStore.setProjects(versionToRestore.projects); 
        AppStore.setKanbanColumns(versionToRestore.kanbanColumns); 

        LoggingService.info(`[DataVersioningFeature] Application state restored to version from ${new Date(timestamp).toLocaleString()}.`, { functionName, timestamp });
        // MODIFIED: Publish event instead of direct/conditional call
        EventBus.publish('displayUserMessage', { text: 'Data restored successfully to the selected version!', type: 'success' });
        
        if (EventBus && EventBus.publish) {
            EventBus.publish('dataRestoredFromVersion', { restoredVersion: versionToRestore });
        }

        return true;
    } catch (error) {
        LoggingService.critical('[DataVersioningFeature] Critical error during data restoration process.', error, { functionName, timestamp });
        // MODIFIED: Publish event instead of direct/conditional call
        EventBus.publish('displayUserMessage', { text: 'A critical error occurred while restoring data.', type: 'error' });
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

    _loadVersions(); 

    if (EventBus) {
        EventBus.subscribe('tasksChanged', () => captureSnapshot('Tasks changed'));
        EventBus.subscribe('projectsChanged', () => captureSnapshot('Projects changed'));
        EventBus.subscribe('kanbanColumnsChanged', () => captureSnapshot('Kanban columns changed'));
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
    if (typeof window.isFeatureEnabled !== 'function') { // MODIFIED to use window
        LoggingService.error("[DataVersioningFeature] isFeatureEnabled function not available from FeatureFlagService.", new Error("DependencyMissing"), { functionName });
        return;
    }
    const isActuallyEnabled = window.isFeatureEnabled('dataVersioningFeature'); // MODIFIED to use window
    LoggingService.debug(`[DataVersioningFeature] Updating UI visibility. Feature enabled: ${isActuallyEnabled}.`, { functionName, isActuallyEnabled });

    const settingsVersionHistoryBtnEl = document.getElementById('settingsVersionHistoryBtn'); 
    if (settingsVersionHistoryBtnEl) {
        settingsVersionHistoryBtnEl.classList.toggle('hidden', !isActuallyEnabled);
    }

    document.querySelectorAll('.data-versioning-feature-element').forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));

    LoggingService.info(`[DataVersioningFeature] UI Visibility set based on flag: ${isActuallyEnabled}`, { functionName, isEnabled: isActuallyEnabled });
}


export const DataVersioningFeature = {
    initialize,
    updateUIVisibility,
    captureSnapshot, 
    getVersionHistory,
    restoreVersion
};

LoggingService.debug("feature_data_versioning.js created and loaded as ES6 module.", { module: 'feature_data_versioning' });