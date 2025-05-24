// versionService.js
// Manages the application version information.

import LoggingService from './loggingService.js';

// Default version, used if version.json is not found or is invalid
const DEFAULT_VERSION = {
  major: 0,
  minor: 1,
  feature: 0,
  patch: 0
};

let _currentVersion = { ...DEFAULT_VERSION };
let _versionString = formatVersion(DEFAULT_VERSION);

/**
 * Formats the version object into a string.
 * @param {object} versionObj - The version object.
 * @returns {string} The formatted version string (e.g., "1.0.0.0").
 */
function formatVersion(versionObj) {
  return `${versionObj.major}.${versionObj.minor}.${versionObj.feature}.${versionObj.patch}`;
}

/**
 * Asynchronously loads the application version from version.json.
 * If loading fails, it falls back to DEFAULT_VERSION.
 * This should be called once during application startup.
 * @async
 */
export async function loadAppVersion() {
  const functionName = 'loadAppVersion (VersionService)';
  LoggingService.info('[VersionService] Initializing application version...', { functionName });
  try {
    const response = await fetch('version.json?cachebust=' + new Date().getTime());
    if (!response.ok) {
      LoggingService.warn(`[VersionService] Failed to load version.json (status: ${response.status}). Using default version: ${_versionString}`, { functionName, status: response.status });
      _currentVersion = { ...DEFAULT_VERSION }; // Ensure it's a copy
    } else {
      const versionData = await response.json();
      if (typeof versionData.major === 'number' &&
          typeof versionData.minor === 'number' &&
          typeof versionData.feature === 'number' &&
          typeof versionData.patch === 'number') {
        _currentVersion = versionData;
        _versionString = formatVersion(_currentVersion);
        LoggingService.info(`[VersionService] Application version loaded from version.json: ${_versionString}`, { functionName, loadedVersion: _currentVersion });
      } else {
        LoggingService.warn('[VersionService] version.json has invalid format. Using default version.', { functionName, fileContent: versionData, defaultVersion: DEFAULT_VERSION });
        _currentVersion = { ...DEFAULT_VERSION };
        _versionString = formatVersion(DEFAULT_VERSION);
      }
    }
  } catch (error) {
    LoggingService.error('[VersionService] Error loading or parsing version.json. Using default version.', error, { functionName, defaultVersion: DEFAULT_VERSION });
    _currentVersion = { ...DEFAULT_VERSION };
    _versionString = formatVersion(DEFAULT_VERSION);
  }
  // Publish an event if other modules need to react to version loading
  // EventBus.publish('appVersionLoaded', { ..._currentVersion });
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