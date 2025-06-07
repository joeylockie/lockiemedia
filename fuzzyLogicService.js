// fuzzyLogicService.js
// This service handles the application of "fuzzy" logic to task scheduling.

import LoggingService from './loggingService.js';

/**
 * Applies fuzzy logic to a new task's data based on a recurrence rule.
 * Currently supports fuzzy time of day.
 * @param {object} newTaskData - The data for the new task being created.
 * @param {object} recurrenceRule - The recurrence rule from the parent task.
 * @returns {object} The task data, potentially modified with a fuzzy time.
 */
export function applyFuzziness(newTaskData, recurrenceRule) {
    if (!recurrenceRule.fuzziness || !recurrenceRule.fuzziness.time) {
        // No fuzziness rule to apply, return the data as-is.
        return newTaskData;
    }

    const fuzz = recurrenceRule.fuzziness.time;
    let minHour, maxHour;

    // Define time periods. This could be moved to a configuration object later.
    switch (fuzz.value) {
        case 'morning':
            minHour = 7; maxHour = 11; // 7:00 AM to 11:59 AM
            break;
        case 'afternoon':
            minHour = 13; maxHour = 17; // 1:00 PM to 5:59 PM
            break;
        case 'evening':
            minHour = 18; maxHour = 21; // 6:00 PM to 9:59 PM
            break;
        default:
            // If it's not a defined period, don't apply fuzzy time.
            LoggingService.warn(`[FuzzyLogicService] Unknown fuzzy time value: '${fuzz.value}'.`, { functionName: 'applyFuzziness' });
            return newTaskData;
    }

    // Generate a random hour and minute within the specified period.
    const randomHour = Math.floor(Math.random() * (maxHour - minHour)) + minHour; // Generates a number from minHour up to (but not including) maxHour
    const randomMinute = Math.floor(Math.random() * 60);

    const formattedHour = String(randomHour).padStart(2, '0');
    const formattedMinute = String(randomMinute).padStart(2, '0');

    // Create a copy of the task data to avoid side effects and apply the new time.
    const modifiedTaskData = { ...newTaskData };
    modifiedTaskData.time = `${formattedHour}:${formattedMinute}`;

    LoggingService.info(`[FuzzyLogicService] Applied fuzzy time '${fuzz.value}', generated new time: ${modifiedTaskData.time}`, { functionName: 'applyFuzziness' });
    
    return modifiedTaskData;
}

LoggingService.debug("fuzzyLogicService.js loaded as ES6 module.", { module: 'fuzzyLogicService' });
