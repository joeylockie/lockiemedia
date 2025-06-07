// feature_advanced_recurrence.js
// Manages UI interactions for the Advanced Recurrence feature in modals.

import { isFeatureEnabled } from './featureFlagService.js';
import LoggingService from './loggingService.js';
import { formatDate } from './utils.js';
import { parseRecurrenceFromText } from './recurrenceParsingService.js';


/**
 * Populates the recurrence input field in a modal when it opens.
 * @param {string} modalType - 'Add' or 'ViewEdit'.
 * @param {object|null} task - The task object, if editing.
 */
function populateRecurrenceUI(modalType, task = null) {
    if (!isFeatureEnabled('advancedRecurrence')) return;

    const recurrenceInput = document.getElementById(`modalRecurrenceInput${modalType}`);
    if (!recurrenceInput) return;

    if (task && task.recurrenceRule) {
        recurrenceInput.value = ruleToString(task.recurrenceRule);
    } else {
        recurrenceInput.value = '';
    }
}

/**
 * Converts a rule object into a human-readable string.
 * @param {object} rule - The recurrence rule object.
 * @returns {string} A string representation of the rule.
 */
export function ruleToString(rule) {
    if (!rule) return "Doesn't repeat";

    let parts = [];
    parts.push(`Every ${rule.interval > 1 ? rule.interval : ''} ${rule.frequency.replace('ly', '')}${rule.interval > 1 ? 's' : ''}`.trim());

    if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
        parts.push(`on ${rule.daysOfWeek.join(', ')}`);
    }

    if (rule.fuzziness && rule.fuzziness.time) {
        parts.push(`in the ${rule.fuzziness.time.value}`);
    }

    if (rule.endDate) {
        parts.push(`until ${formatDate(rule.endDate)}`);
    }

    return parts.join(' ');
}

/**
 * Initializes the Advanced Recurrence Feature.
 * This function will set up listeners for the new text-based input.
 */
function initialize() {
    const functionName = 'initialize (AdvancedRecurrenceFeature)';
    LoggingService.info('[AdvancedRecurrenceFeature] Initializing with minimalist UI logic...', { functionName });

    const taskInputAdd = document.getElementById('modalTaskInputAdd');
    const recurrenceInputAdd = document.getElementById('modalRecurrenceInputAdd');
    
    if (taskInputAdd && recurrenceInputAdd) {
        taskInputAdd.addEventListener('input', () => {
            const { rule, remainingText } = parseRecurrenceFromText(taskInputAdd.value);
            if (rule) {
                taskInputAdd.value = remainingText;
                recurrenceInputAdd.value = ruleToString(rule);
                // Manually trigger change event to notify any other listeners
                recurrenceInputAdd.dispatchEvent(new Event('change'));
            }
        });
    }
}

/**
 * Updates the visibility of UI elements based on the feature flag.
 */
function updateUIVisibility() {
    const functionName = 'updateUIVisibility (AdvancedRecurrenceFeature)';
    if (typeof isFeatureEnabled !== 'function') {
        LoggingService.error(`[${functionName}] isFeatureEnabled function not available.`);
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('advancedRecurrence');
    document.querySelectorAll('.advanced-recurrence-element').forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));
    LoggingService.info(`[AdvancedRecurrenceFeature] UI Visibility set to: ${isActuallyEnabled}`, { functionName, isEnabled: isActuallyEnabled });
}


export const AdvancedRecurrenceFeature = {
    initialize,
    updateUIVisibility,
    populateRecurrenceUI,
    ruleToString
};

LoggingService.debug("feature_advanced_recurrence.js loaded as ES6 module.", { module: 'feature_advanced_recurrence' });
