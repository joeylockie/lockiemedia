-- Down Migration: Initial Schema Setup

-- Drop tables in reverse order of creation to respect foreign key constraints.

DROP TABLE IF EXISTS calendar_events;
DROP TABLE IF EXISTS dev_ticket_comments;
DROP TABLE IF EXISTS dev_ticket_history;
DROP TABLE IF EXISTS dev_tickets;
DROP TABLE IF EXISTS dev_epics;
DROP TABLE IF EXISTS dev_release_versions;
DROP TABLE IF EXISTS time_log_entries;
DROP TABLE IF EXISTS time_activities;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS notebooks;
DROP TABLE IF EXISTS user_preferences;
DROP TABLE IF EXISTS user_profile;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS projects;
