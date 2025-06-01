// versionService.js
// Manages the application version information and checks for updates.

import LoggingService from './loggingService.js';
import EventBus from './eventBus.js';
import { isFeatureEnabled } from './featureFlagService.js'; // For feature flag check

// Default version, used if version.json is not found or is invalid
const DEFAULT_VERSION = {
  major: 0,
  minor: 1,
  feature: 0,
  patch: 0
};

let _currentVersion = { ...DEFAULT_VERSION };
let _versionString = formatVersion(DEFAULT_VERSION);

let _updateCheckIntervalId = null;
const UPDATE_CHECK_INTERVAL_MS = 15 * 60 * 1000; // Check every 15 minutes
const INITIAL_CHECK_DELAY_MS = 10 * 1000; // Delay for the first check after app load

/**
 * Formats the version object into a string.
 * @param {object} versionObj - The version object.
 * @returns {string} The formatted version string (e.g., "1.0.0.0").
 */
function formatVersion(versionObj) {
  if (!versionObj || typeof versionObj.major !== 'number') { // Basic check
    return "0.0.0.0";
  }
  return `${versionObj.major}.${versionObj.minor}.${versionObj.feature}.${versionObj.patch}`;
}

/**
 * Asynchronously loads the application version from version.json.
 * This should be called once during application startup.
 * @async
 */
export async function loadAppVersion() {
  const functionName = 'loadAppVersion (VersionService)';
  LoggingService.info('[VersionService] Initializing application version...', { functionName });
  try {
    // Cache bust to ensure we get the latest version.json for the initial load as well
    const response = await fetch('version.json?cachebust=' + new Date().getTime());
    if (!response.ok) {
      LoggingService.warn(`[VersionService] Failed to load version.json (status: ${response.status}). Using default version: ${formatVersion(DEFAULT_VERSION)}`, { functionName, status: response.status });
      _currentVersion = { ...DEFAULT_VERSION };
    } else {
      const versionData = await response.json();
      if (typeof versionData.major === 'number' &&
          typeof versionData.minor === 'number' &&
          typeof versionData.feature === 'number' &&
          typeof versionData.patch === 'number') {
        _currentVersion = versionData;
      } else {
        LoggingService.warn('[VersionService] version.json has invalid format. Using default version.', { functionName, fileContent: versionData, defaultVersion: DEFAULT_VERSION });
        _currentVersion = { ...DEFAULT_VERSION };
      }
    }
  } catch (error) {
    LoggingService.error('[VersionService] Error loading or parsing version.json. Using default version.', error, { functionName, defaultVersion: DEFAULT_VERSION });
    _currentVersion = { ...DEFAULT_VERSION };
  }
  _versionString = formatVersion(_currentVersion); // Update string after setting _currentVersion
  LoggingService.info(`[VersionService] Application version loaded: ${_versionString}`, { functionName, loadedVersion: _currentVersion });

  // Publish an event if other modules need to react to version loading
  if (EventBus && typeof EventBus.publish === 'function') {
    EventBus.publish('appVersionLoaded', { ..._currentVersion });
  }
}

/**
 * Fetches the remote version.json file.
 * @async
 * @returns {Promise<object|null>} The remote version object or null if fetching fails.
 */
async function fetchRemoteVersion() {
    const functionName = 'fetchRemoteVersion (VersionService)';
    try {
        const response = await fetch('version.json?cachebust=' + new Date().getTime());
        if (!response.ok) {
            LoggingService.warn(`[VersionService] Failed to fetch remote version.json for update check (status: ${response.status}).`, { functionName, status: response.status });
            return null;
        }
        const versionData = await response.json();
        if (typeof versionData.major === 'number' &&
            typeof versionData.minor === 'number' &&
            typeof versionData.feature === 'number' &&
            typeof versionData.patch === 'number') {
            return versionData;
        } else {
            LoggingService.warn('[VersionService] Remote version.json (for update check) has invalid format.', { functionName, fileContent: versionData });
            return null;
        }
    } catch (error) {
        LoggingService.error('[VersionService] Error fetching or parsing remote version.json for update check.', error, { functionName });
        return null;
    }
}

/**
 * Checks if a new version of the application is available.
 * Publishes 'newVersionAvailable' event if an update is found.
 * @async
 */
export async function checkForUpdates() {
    const functionName = 'checkForUpdates (VersionService)';

    if (!isFeatureEnabled('appUpdateNotificationFeature')) {
        LoggingService.debug('[VersionService] Update check skipped: appUpdateNotificationFeature is disabled.', { functionName });
        return;
    }

    LoggingService.debug('[VersionService] Checking for application updates...', { functionName });

    const remoteVersion = await fetchRemoteVersion();
    if (!remoteVersion) {
        LoggingService.debug('[VersionService] Could not fetch remote version for update check.', { functionName });
        return;
    }

    const localVersionObject = getAppVersionObject(); // Current version in memory
    const remoteVersionString = formatVersion(remoteVersion);
    const localVersionString = formatVersion(localVersionObject);

    LoggingService.debug(`[VersionService] Comparing versions. Local: ${localVersionString}, Remote: ${remoteVersionString}`, { functionName, localVersionString, remoteVersionString });

    // Semantic version comparison
    if (remoteVersion.major > localVersionObject.major ||
       (remoteVersion.major === localVersionObject.major && remoteVersion.minor > localVersionObject.minor) ||
       (remoteVersion.major === localVersionObject.major && remoteVersion.minor === localVersionObject.minor && remoteVersion.feature > localVersionObject.feature) ||
       (remoteVersion.major === localVersionObject.major && remoteVersion.minor === localVersionObject.minor && remoteVersion.feature === localVersionObject.feature && remoteVersion.patch > localVersionObject.patch)) {

        LoggingService.info(`[VersionService] New version detected! Local: ${localVersionString}, New: ${remoteVersionString}`, { functionName, localVersion: localVersionString, newVersion: remoteVersionString });
        if (EventBus && typeof EventBus.publish === 'function') {
            EventBus.publish('newVersionAvailable', {
                currentVersion: localVersionString,
                newVersion: remoteVersionString,
                newVersionObject: { ...remoteVersion } // Send a copy
            });
        } else {
            LoggingService.warn('[VersionService] EventBus not available to publish newVersionAvailable event.', { functionName });
        }
    } else {
        LoggingService.debug('[VersionService] Application is up to date.', { functionName, currentVersion: localVersionString });
    }
}

/**
 * Starts the periodic update checker if the feature is enabled.
 */
export function startUpdateChecker() {
    const functionName = 'startUpdateChecker (VersionService)';

    if (!isFeatureEnabled('appUpdateNotificationFeature')) {
        LoggingService.info('[VersionService] App update checker not started: feature is disabled.', { functionName });
        return;
    }

    if (_updateCheckIntervalId) {
        clearInterval(_updateCheckIntervalId);
        LoggingService.debug('[VersionService] Cleared existing update check interval before starting a new one.', { functionName });
    }
    // Perform an initial check shortly after startup, then set interval
    setTimeout(checkForUpdates, INITIAL_CHECK_DELAY_MS);
    _updateCheckIntervalId = setInterval(checkForUpdates, UPDATE_CHECK_INTERVAL_MS);
    LoggingService.info(`[VersionService] Application update checker started. Interval: ${UPDATE_CHECK_INTERVAL_MS / 60000} minutes.`, { functionName });
}

/**
 * Stops the periodic update checker.
 */
export function stopUpdateChecker() {
    const functionName = 'stopUpdateChecker (VersionService)';
    if (_updateCheckIntervalId) {
        clearInterval(_updateCheckIntervalId);
        _updateCheckIntervalId = null;
        LoggingService.info('[VersionService] Application update checker stopped.', { functionName });
    }
}

/**
 * Gets the current application version as a string.
 * @returns {string} The version string (e.g., "1.0.0.0").
 */
export function getAppVersionString() {
  return _versionString;
}

/**
 * Gets the current application version as an object.
 * @returns {object} The version object (e.g., { major: 1, minor: 0, feature: 0, patch: 0 }).
 */
export function getAppVersionObject() {
  return { ..._currentVersion }; // Return a copy to prevent modification
}

// Initialize LoggingService message
LoggingService.debug("versionService.js loaded as ES6 module.", { module: 'versionService' });