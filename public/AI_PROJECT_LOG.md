# AI Project Curation Log: Lockie Media Platform
**Last Updated: 2025-06-25 16:04 (EDT)**

## 1. Instructions for AI (Gemini)
**Purpose of this Document:** This document is your primary source of truth for the Lockie Media Platform project. It provides context, tracks progress, outlines current tasks, and lists future goals. Please refer to it to understand:

* The overall project scope.
* What has already been completed.
* What the user (Joey) is currently working on with your assistance.
* The specific sub-tasks and files involved in the current session.
* Any known issues or important decisions made.

**How to Use & Update This Document:**

* **Prioritize this Document:** When the user provides this document or refers to it at the start of a session, consider its content as the most up-to-date information, potentially overriding previous chat history if there are discrepancies regarding project state.
* **Understand Current Focus:** Pay close attention to Section 5: "Current Focus / Next Steps" from the previous version of this log to understand the immediate objectives for the current session.
* **Track Session Progress:** During our development session, keep track of:
    * Tasks completed and files modified/created.
    * New issues or bugs identified.
    * Key decisions made.
    * The next logical steps or remaining sub-tasks.
* **Generate Updated Log Content (End of Session):**
    * When the user asks you to "update the AI Project Log" (or similar), your task is to regenerate the entire Markdown content for this document.
    * You will use the previous version of this log as your base.
    * Update all relevant sections based on the work done during the session, including the "Last Updated" timestamp, "Work Completed," "Current Focus," and "Known Issues."
* **Maintain Format:** Preserve the existing Markdown structure and formatting.
* **Provide Complete Output:** Present the entire, fully updated Markdown content back to the user so they can replace the content of their `AI_PROJECT_LOG.md` file.

## 2. Project Overview & Goals:
* **Platform:** "Lockie Media Platform", which includes user-facing "apps" and administrative "services".
* **Vision:** To become an all-in-one platform for personal and business management, comprised of modular apps.
* **Technology:** Self-hosted application with a microservice architecture. Backend services are built with Node.js/Express.js and a shared SQLite database. Services are managed by PM2 and fronted by a central API Gateway secured with API Keys.
* **Core Platform Apps (Initial Focus):** Task Manager, Notes, Habit Tracker, Time Tracker, Pomodoro, Calendar, and Dev Tracker.
* **Overall Goal:** Develop a robust, feature-complete management platform with a suite of integrated apps.

## 3. Work Completed (Overall Project - High Level):
* Core Task Management: Functionalities implemented as a foundational module.
* Backend Refactor: Migrated from a Firebase backend to a self-hosted Node.js/Express stack.
* Database Migration: Successfully migrated the core application's database from lowdb (JSON file) to a robust SQLite database using `better-sqlite3`.
* Backend Architecture Refactor: Migrated the backend from a single monolith to a microservice architecture.
* API Security: Implemented an API Key authentication layer on the API Gateway.
* Notes App Enhancements: Added notebook deletion and a full-featured Markdown editor.
* Time Tracker UI/UX Enhancements: Fixed critical dark mode UI bugs and implemented a fully-featured custom reminder system.
* Dev Tracker App: Implemented a full-featured development ticket tracking system for epics and tickets.

## 4. Work Completed (Specific to Current Major Task):

**Date: 2025-06-25**
* **Task:** Dev Tracker Backend & Database Debugging
* **Summary:** Successfully debugged and resolved a series of critical backend errors that were preventing the new Dev Tracker application from saving data correctly. The session involved diagnosing 500 Internal Server Errors and 404 Not Found errors, culminating in a fully functional application.
* **Details:**
    * **Database Schema Error:** Fixed an initial `SqliteError: table dev_epics has no column named releaseVersion` by guiding the user to rebuild the database schema with the correct `database-setup.js` file and `npm run setup` command.
    * **Foreign Key Constraint Error:** Resolved a `FOREIGN KEY constraint failed` error by modifying the `dev-tracker-service` to correctly handle empty string values for foreign key fields, ensuring they are saved as `NULL` to the database.
    * **API Gateway Routing Errors:** Fixed multiple `404 Not Found` errors for ticket-specific actions (like adding comments and changing status) by adding the necessary `POST` and `PATCH` routes to the `api-gateway` service, ensuring requests were correctly forwarded to the `dev-tracker-service`.
    * **Real-time UI Updates:** Fixed an issue where new comments would not appear in the UI until a page refresh by correcting the frontend state management logic in `dev_tracker_service.js` and `store.js` to properly trigger UI updates after an action is completed.

**Date: 2025-06-23**
* **Task:** Time Tracker UI Bug Fixing & Custom Reminders Feature
* **Summary:** Successfully resolved a persistent UI bug where input field text appeared black in dark mode. After fixing the bug, implemented a major feature enhancement: a fully customizable reminder system for the Time Tracker.

## 5. Current Focus / Next Steps (Specific to Current Major Task):
* **Current Major Task/Feature Being Worked On:**
    * **Name:** None / Awaiting next user directive.
    * **Goal for this Task:** N/A
    * **Status:** **IDLE**
* **Current Sub-Task / Immediate Next Action:**
    * All outstanding tasks from the last session are complete. The platform is in a stable state.
* **Specific questions for AI (if any):**
    * None.
* **Blockers (if any):**
    * None.

## 6. Known Issues / Bugs (Related to current work or recently discovered):
* **None.** All known critical issues have been resolved.

## 7. Future/Pending Work (Overall Project - High Level):
* Security: Further enhancements could include JWT for user-level authentication in the future.
* Frontend Decoupling: Complete for Tasks and Notes apps.
* Core Features: Refine and enhance core features based on usage.
* UI/UX: Continuously improve the user interface and experience across all apps.

## 8. Important Notes / Decisions Made:
* **Microservice Architecture Adopted:** Pivoted from a simple data centralization task to a full backend refactor. Adopted a microservice architecture with an API Gateway to ensure true decoupling, improve stability, and provide a secure foundation for third-party integrations. Implemented API Key security as the first layer of protection.
* **Frontend Decoupling Initiated:** A decision was made to refactor the frontend. The first phase isolated the Task Manager app. The second phase deepened this decoupling by namespacing all of its UI, event, and modal handling files with a `tasks_` prefix for better code isolation and clarity.
* **Notes App Architecture:** To prepare for new features, the Notes app's frontend code was refactored into a modular structure (`notes_rendering.js`, `notes_event_handlers.js`), separating concerns and improving maintainability.
* **Editor Choice:** A side-by-side Markdown editor (using Marked.js and DOMPurify) with toggleable view modes was chosen for the Notes app over a more complex Rich Text/WYSIWYG editor. This decision prioritized implementation speed, maintainability, and data portability (plain text) while still providing a powerful user experience.
* **Sidebar UI Pattern:** Decided to move from a "disappearing" sidebar (`width: 0`) to a more robust "shrinking" sidebar pattern to prevent UI lockouts.