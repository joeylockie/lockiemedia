// recurrenceParsingService.js
// This service handles parsing natural language recurrence rules from task text.

import LoggingService from './loggingService.js';

const dayMap = {
    mon: 'MO', monday: 'MO',
    tue: 'TU', tuesday: 'TU',
    wed: 'WE', wednesday: 'WE',
    thu: 'TH', thursday: 'TH',
    fri: 'FR', friday: 'FR',
    sat: 'SA', saturday: 'SA',
    sun: 'SU', sunday: 'SU'
};
const allDayNames = Object.keys(dayMap).join('|');

/**
 * Defines the patterns and handlers for parsing recurrence rules from text.
 * Each pattern defines a regex, the type of rule it corresponds to, 
 * and a handler to create or modify the rule object.
 * The order is important: more specific patterns should come first.
 */
const RECURRENCE_PATTERNS = [
    // --- End Date ---
    {
        regex: /\b(until|through|ending on)\s+(\d{4}-\d{2}-\d{2})\b/i,
        type: 'endDate',
        handler: (match, rule) => { rule.endDate = match[2]; }
    },

    // --- Specific Day of Month ---
    {
        regex: /\b(on the|every)\s+(last|\d{1,2}(st|nd|rd|th)?)\s+(day )?of the month\b/i,
        type: 'dayOfMonth',
        handler: (match, rule) => {
            rule.frequency = 'monthly';
            if (match[2].toLowerCase() === 'last') {
                rule.byMonthDay = -1;
            } else {
                rule.byMonthDay = parseInt(match[2]);
            }
        }
    },
    {
        regex: /\b(on the|every)\s+(\d{1,2}(st|nd|rd|th)?)\b/i,
        type: 'dayOfMonth',
        handler: (match, rule) => {
            rule.frequency = 'monthly';
            rule.byMonthDay = parseInt(match[2]);
        }
    },
    
    // --- Weekly on specific days ---
    {
        regex: new RegExp(`\\b(on|every)\\s+((?:${allDayNames})(?:s|\\b|,)((?:\\s*(?:and|or|,)?\\s*(?:${allDayNames})(?:s|\\b))*))`, 'ig'),
        type: 'daysOfWeek',
        handler: (match, rule) => {
            rule.frequency = 'weekly';
            rule.interval = 1;
            const daysString = match[2].replace(/s\b/g, ' ').replace(/,|\s+and\s+|\s+or\s+/g, ' ');
            const dayTokens = daysString.split(/\s+/).filter(Boolean);
            rule.daysOfWeek = [...new Set(dayTokens.map(day => dayMap[day.toLowerCase()]).filter(Boolean))];
        }
    },
    {
        regex: /\b(every|each)\s+(weekend|weekday)\b/i,
        type: 'frequency',
        handler: (match, rule) => {
            rule.frequency = 'weekly';
            rule.interval = 1;
            if (match[2].toLowerCase() === 'weekend') {
                rule.daysOfWeek = ['SA', 'SU'];
            } else {
                rule.daysOfWeek = ['MO', 'TU', 'WE', 'TH', 'FR'];
            }
        }
    },

    // --- Frequencies (daily, weekly, monthly, yearly) with intervals ---
    {
        regex: /\b(every|each)\s+(other|\d+)\s+(days?|weeks?|months?|years?)\b/i,
        type: 'interval',
        handler: (match, rule) => {
            const unit = match[3].toLowerCase().replace(/s$/, '');
            rule.frequency = unit === 'day' ? 'daily' : `${unit}ly`;
            rule.interval = match[2].toLowerCase() === 'other' ? 2 : parseInt(match[2]);
        }
    },
    {
        regex: /\b(bi-weekly|bi-monthly)\b/i,
        type: 'interval',
        handler: (match, rule) => {
            const term = match[1].toLowerCase();
            if (term === 'bi-weekly') {
                rule.frequency = 'weekly';
                rule.interval = 2;
            } else { // bi-monthly
                rule.frequency = 'monthly';
                rule.interval = 2;
            }
        }
    },
    {
        regex: /\b(every|each)\s+(day|week|month|year)\b/i,
        type: 'frequency',
        handler: (match, rule) => {
            const unit = match[2].toLowerCase();
            rule.frequency = unit === 'day' ? 'daily' : `${unit}ly`;
            rule.interval = 1;
        }
    },
    
    // --- Simple Frequencies & Fuzzy Time ---
    {
        regex: /\b(daily|weekly|monthly|yearly)\b/i,
        type: 'frequency',
        handler: (match, rule) => {
            rule.frequency = `${match[1].toLowerCase()}`;
            rule.interval = 1;
        }
    },
    {
        regex: /\b(every|each)\s+(morning|afternoon|evening)\b/i,
        type: 'frequency',
        handler: (match, rule) => {
            rule.frequency = 'daily';
            rule.interval = 1;
            rule.fuzziness = { time: { type: 'period', value: match[2].toLowerCase() } };
        }
    }
];

/**
 * Parses a task's text to find and combine all matching recurrence rules.
 * @param {string} text - The text of the task.
 * @returns {{rule: object|null, remainingText: string}} An object containing the combined rule and the text with all rule phrases removed.
 */
export function parseRecurrenceFromText(text) {
    let remainingText = text;
    let finalRule = {};
    let matched = false;

    // Create a copy of patterns to avoid issues with regex state if 'g' flag is used
    const patterns = RECURRENCE_PATTERNS.map(p => ({ ...p, regex: new RegExp(p.regex.source, p.regex.flags)}));

    for (const pattern of patterns) {
        // Use a loop for global regexes to find all matches
        let match;
        while ((match = pattern.regex.exec(remainingText)) !== null) {
            // Apply the handler to modify the rule object
            pattern.handler(match, finalRule);
            // Invalidate the matched text by replacing it with placeholders
            // This prevents it from being matched by other, less specific patterns
            remainingText = remainingText.substring(0, match.index) + ' '.repeat(match[0].length) + remainingText.substring(match.index + match[0].length);
            matched = true;
        }
    }

    // Clean up the text by removing the placeholder spaces
    remainingText = remainingText.replace(/\s\s+/g, ' ').trim();

    if (matched) {
        // Post-processing and validation
        if (!finalRule.frequency) {
            // If we have days of the week, but no other frequency, default to weekly.
            if(finalRule.daysOfWeek && finalRule.daysOfWeek.length > 0) {
                finalRule.frequency = 'weekly';
            } else {
                 // Not enough info to form a valid rule
                 return { rule: null, remainingText: text };
            }
        }
        if (!finalRule.interval) {
            finalRule.interval = 1;
        }

        LoggingService.info(`[RecurrenceParsingService] Parsed rule from text.`, { finalRule, originalText: text, remainingText });
        return { rule: finalRule, remainingText };
    }

    // No rule found
    return { rule: null, remainingText: text };
}