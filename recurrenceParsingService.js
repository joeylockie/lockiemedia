// recurrenceParsingService.js
// This service handles parsing natural language recurrence rules from task text.

import LoggingService from './loggingService.js';

/**
 * Defines the patterns and handlers for parsing recurrence rules from text.
 * Each pattern defines a regex, the type of rule it corresponds to, 
 * and a handler to create the rule object.
 */
const RECURRENCE_PATTERNS = [
    // --- Daily & Fuzzy Time ---
    {
        regex: /\b(every|each)\s+(day|morning|afternoon|evening)\b/i,
        type: 'frequency',
        handler: (match) => {
            const rule = { frequency: 'daily', interval: 1, fuzziness: null };
            const timeOfDay = match[2].toLowerCase();
            if (timeOfDay !== 'day') {
                rule.fuzziness = { time: { type: 'period', value: timeOfDay } };
            }
            return rule;
        }
    },
    {
        regex: /\b(daily)\b/i,
        type: 'frequency',
        handler: () => ({ frequency: 'daily', interval: 1, fuzziness: null })
    },

    // --- Weekly ---
    {
        regex: /\b(every|each)\s+(week|weekend|weekday)\b/i,
        type: 'frequency',
        handler: (match) => {
            const rule = { frequency: 'weekly', interval: 1 };
            const weekPart = match[2].toLowerCase();
            if (weekPart === 'weekend') {
                rule.daysOfWeek = ['SA', 'SU'];
            } else if (weekPart === 'weekday') {
                rule.daysOfWeek = ['MO', 'TU', 'WE', 'TH', 'FR'];
            }
            return rule;
        }
    },
    {
        regex: /\b(weekly)\b/i,
        type: 'frequency',
        handler: () => ({ frequency: 'weekly', interval: 1 })
    },
    {
        regex: /\b(every|each)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/i,
        type: 'frequency',
        handler: (match) => {
            const dayMap = {
                mon: 'MO', monday: 'MO', tue: 'TU', tuesday: 'TU', wed: 'WE', wednesday: 'WE',
                thu: 'TH', thursday: 'TH', fri: 'FR', friday: 'FR', sat: 'SA', saturday: 'SA',
                sun: 'SU', sunday: 'SU'
            };
            const day = match[2].toLowerCase();
            return { frequency: 'weekly', interval: 1, daysOfWeek: [dayMap[day]] };
        }
    },
    
    // --- Monthly ---
    {
        regex: /\b(every|each)\s+month\b/i,
        type: 'frequency',
        handler: () => ({ frequency: 'monthly', interval: 1 })
    },
    {
        regex: /\bmonthly\b/i,
        type: 'frequency',
        handler: () => ({ frequency: 'monthly', interval: 1 })
    },

    // --- Positional ---
    {
        regex: /\b(at the )?end of the (week|month)\b/i,
        type: 'positional',
        handler: (match) => {
            const period = match[2].toLowerCase();
            if (period === 'week') {
                // Interprets "end of the week" as Friday
                return { frequency: 'weekly', interval: 1, daysOfWeek: ['FR'] };
            }
            if (period === 'month') {
                // Uses rrule's "last day of the month" feature
                return { frequency: 'monthly', interval: 1, byMonthDay: -1 };
            }
            return null;
        }
    }
];

/**
 * Parses a task's text to find the first matching recurrence rule.
 * @param {string} text - The text of the task.
 * @returns {{rule: object|null, remainingText: string}} An object containing the found rule and the text with the rule phrase removed.
 */
export function parseRecurrenceFromText(text) {
    let remainingText = text;
    let foundRule = null;

    for (const pattern of RECURRENCE_PATTERNS) {
        const match = pattern.regex.exec(remainingText);
        if (match) {
            foundRule = pattern.handler(match);
            if (foundRule) {
                // Remove the matched phrase from the text
                remainingText = remainingText.replace(pattern.regex, '').replace(/\s\s+/g, ' ').trim();
                LoggingService.info(`[RecurrenceParsingService] Parsed rule from text.`, { foundRule, originalText: text });
                // Return after finding the first, most specific match
                return { rule: foundRule, remainingText };
            }
        }
    }

    // No rule found
    return { rule: null, remainingText: text };
}
