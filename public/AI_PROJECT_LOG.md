# AI Project Curation Log: Lockie Media Platform
Last Updated: 2025-06-20 03:43 (EDT) ##

## 1. Instructions for AI (Gemini)
**Purpose of this Document:** This document is your primary source of truth for the Lockie Media Platform project. It provides context, tracks progress, outlines current tasks, and lists future goals. Please refer to it to understand:

* The overall project scope.
* What has already been completed.
* What the user (Joey) is currently working on with your assistance.
* The specific sub-tasks and files involved in the current session.
* Any known issues or important decisions made.

**How to Use & Update This Document:**
* **Prioritize this Document:** When the user provides this document or refers to it at the start of a session, consider its content as the most up-to-date information, potentially overriding previous chat history if there are discrepancies regarding project state.
* **Understand Current Focus:** Pay close attention to Section 5: Current Focus / Next Steps from the previous version of this log to understand the immediate objectives for the current session.
* **Track Session Progress:** During our development session, keep track of:
    * Tasks completed and files modified/created.
    * New issues or bugs identified.
    * Key decisions made.
    * The next logical steps or remaining sub-tasks.
* **Generate Updated Log Content (End of Session):**
    * When the user asks you to "update the AI Project Log" (or similar), your task is to regenerate the entire Markdown content for this document.
    * You will use the previous version of this log (provided by the user at the start of the session or from the current context if it's the same session) as your base.
    * Update all relevant sections based on the work done during the session, including:
        * The "Last Updated" timestamp at the top (use the current date and time).
        * Section 4: Work Completed (Specific to Current Major Task): Add a new dated entry summarizing the session's accomplishments.
        * Section 5: Current Focus / Next Steps: Update this to reflect what the next immediate actions should be. If the current sub-task is complete, define the next one. Clear out old "Specific questions for AI" if answered, or add new ones.
        * Section 6: Known Issues / Bugs: Add any new issues identified.
        * Section 8: Important Notes / Decisions Made: Add any significant decisions.
    * If a major feature part of Section 2 is completed, update its status and summarize in Section 3.
* **Maintain Format:** Preserve the existing Markdown structure and formatting.
* **Provide Complete Output:** Present the entire, fully updated Markdown content back to the user so they can replace the content of their AI_PROJECT_LOG.md file.
* **Avoid Redundancy:** Use the "Work Completed" sections (3 and 4) from the previous log version to avoid re-suggesting solutions or code for tasks already finished before the current session began.

## 2. Project Overview & Goals:
**Platform:** "Lockie Media Platform", which includes user-facing "apps" and administrative "services".

**Vision:** To become an all-in-one platform for personal and business management, comprised of modular apps.

**Technology:** Self-hosted application with a **microservice architecture**. Backend services are built with Node.js/Express.js and a shared SQLite database. Services are managed by **PM2** and fronted by a central **API Gateway**.

**Core Platform Apps (Initial Focus):** Task Manager, Notes, Habit Tracker, Time Tracker, Pomodoro, and Calendar.

**Overall Goal:** Develop a robust, feature-complete management platform with a suite of integrated apps.

## 3. Work Completed (Overall Project - High Level):
* **Core Task Management:** Functionalities implemented as a foundational module.
* **Backend Refactor:** Migrated from a Firebase backend to a self-hosted Node.js/Express stack.
* **Database Migration:** Successfully migrated the core application's database from `lowdb` (JSON file) to a robust SQLite database using `better-sqlite3`.
* **Feature Streamlining:** Removed several non-core features to simplify the codebase.
* **Client-side Services:** Implemented services for logging, events, view management, etc.
* **Backend Architecture Refactor:** Migrated the backend from a single monolith to a microservice architecture, creating an API Gateway and independent services for Notes and Tasks. Implemented PM2 for process management.

## 4. Work Completed (Specific to Current Major Task):
**Date: 2025-06-20**
* **Task**: Decouple Backend into Microservices (Notes & Tasks)
* **Summary**: Successfully refactored the monolithic backend into a microservice architecture. The Notes and Task applications now run as independent backend services, with a new API Gateway managing all incoming requests. This resolves the core problem of a tightly coupled codebase.
* **Details**:
    * Installed and configured **PM2** to manage all backend processes, providing auto-restarts and centralized logging.
    * Created an `ecosystem.json` configuration file to define and manage all services from a single point.
    * Created a new, independent **`notes-service`** and moved all database logic for notes and notebooks into it.
    * Created a new, independent **`task-service`** and moved all remaining core data logic (tasks, projects, user profile, time tracking) into it.
    * Created a central **`api-gateway`** service to act as the single, secure entry point for the frontend.
    * Implemented an **API Composition** pattern in the gateway, where it fetches data from the `notes-service` and `task-service`, combines it, and returns a single response. This was done to avoid requiring any frontend code changes.
    * Reduced the original `server.js` monolith to an empty shell, with all its data-handling responsibilities successfully migrated.
    * Troubleshot and resolved several configuration issues related to PM2, module systems (`module.exports` vs. `export default`), and port conflicts (`EADDRINUSE`).
    * Fixed a `RangeError` bug in the new `task-service` related to database updates.

## 5. Current Focus / Next Steps (Specific to Current Major Task):
**Current Major Task/Feature Being Worked On:**
* **Name:** Continue Backend Decoupling & Solidify Architecture
* **Goal for this Task:** Finish migrating all remaining backend logic to microservices and then begin implementing new features on the new, stable architecture.
* **Status:** In Progress

**Current Sub-Task:**
* Decouple the **Time Tracker App**. The remaining time tracking logic currently resides in the `task-service` and should be moved to its own service to be truly independent.

**Immediate Next Action:**
1.  Create a new `time-tracker-service` directory and its `package.json`.
2.  Create the shell `index.js` for the service on a new port (e.g., 3005).
3.  Update `ecosystem.json` to include the new service.
4.  Move the time tracking logic (for `time_activities` and `time_log_entries`) from the `task-service` into the new `time-tracker-service`.
5.  Update the `api-gateway` to fetch time tracking data from this new service, further distributing the data composition logic.

* **Specific questions for AI (if any):**
    * None.
* **Blockers (if any):**
    * None.

## 6. Known Issues / Bugs (Related to current work or recently discovered):
* None. All known bugs from the refactoring session (`EADDRINUSE` and `RangeError`) were resolved.

## 7. Future/Pending Work (Overall Project - High Level):
* **Backend Migration**: Complete the migration for the Time Tracker app.
* **Security**: Implement API Key or JWT security on the API Gateway.
* **Frontend Decoupling**: Begin the process of decoupling the monolithic frontend into independent applications per feature.
* **Core Features**: Refine and enhance core features based on usage.
* **UI/UX**: Continuously improve the user interface and experience across all apps.

## 8. Important Notes / Decisions Made:
* **Feature Streamlining**: A decision was made to remove several complex or non-core features to simplify the application's focus and codebase.
* **Database Migration Complete & Successful:** The decision to move to SQLite was made to support the user's goal of heavy, 24/7 data logging.
* **Microservice Architecture Adopted**: A decision was made to proceed with a full microservice refactor over a modular monolith to ensure true decoupling and provide a stable foundation for third-party API integrations. The refactor uses an API Gateway with an API Composition pattern to avoid initial frontend code changes.