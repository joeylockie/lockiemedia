# AI Project Curation Log: LockieMedia Todo App & Admin Panel

**Last Updated:** 2025-06-02 18:47 (EDT) ## 

0. Instructions for AI (Gemini)

**Purpose of this Document:** This document is your primary source of truth for the LockieMedia Todo App & Admin Panel project. It provides context, tracks progress, outlines current tasks, and lists future goals. Please refer to it to understand:
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
    * Maintain Format: Preserve the existing Markdown structure and formatting.
    * Provide Complete Output: Present the entire, fully updated Markdown content back to the user so they can replace the content of their AI_PROJECT_LOG.md file.
* **Avoid Redundancy:** Use the "Work Completed" sections (3 and 4) from the previous log version to avoid re-suggesting solutions or code for tasks already finished before the current session began.


## 1. Project Overview & Goals:

* **Application:** A feature-rich "LockieMedia Todo App" and an accompanying "Admin Panel".
* **Technology:** Client-side HTML, CSS (Tailwind), JavaScript (ES6 Modules), Firebase (Auth & Firestore - Compat SDK v8 style) for backend.
* **Todo App Core:** Task management (CRUD, due dates, priority, labels, notes), feature flag system, modular services. Data stored in Firebase for authenticated users, with local fallbacks.
* **Admin Panel Core:** Separate HTML page (`admin.html`) using the same Firebase backend. Provides insights and monitoring for the Todo App. Includes admin authentication, display of error logs from Firestore, and read-only view of feature flags.
* **Overall Goal:** Develop a robust, feature-complete Todo application with a functional Admin Panel for application monitoring and management insights.

## 2. Current Major Task/Feature Being Worked On:

* **Name:** Admin Panel - Initial Setup & Core Features
* **Goal for this Task:** Establish a functional Admin Panel with admin authentication, display of critical application data (error logs, feature flags), and lay the groundwork for user management and overview statistics.
* **Status:** In Progress (Admin login, error log display, and feature flag display are functional).

## 3. Work Completed (Overall Project - High Level):

* **Todo App (Main Application):**
    * Core task management functionalities implemented.
    * Feature flag system (`featureFlagService.js`, `features.json`) established.
    * Modular architecture with services for logging, events, view management, tasks, projects, labels, etc.
    * Firebase integration for user authentication and data persistence (tasks, projects, preferences, profile with roles) via `firebaseService.js` and `store.js`.
    * Client-side error logging to console via `loggingService.js`.
    * Basic UI rendering and event handling structures in place.
* **Admin Panel (as part of the current major task):**
    * Initial setup and core features (see Section 4 for details).

## 4. Work Completed (Specific to Current Major Task - "Admin Panel - Initial Setup & Core Features"):

* **Date: 2025-06-02**
    * Created `admin.html` with a basic layout, sections, and an admin login modal.
    * Enhanced `loggingService.js` (in the main app) to send `ERROR` and `CRITICAL` level logs to a new Firestore collection: `app_errors`. User context (UID, email) and client-side info (URL, userAgent) are included in these logs.
    * Modified `featureFlagService.js` to prioritize loading flags from Firestore (`app_config/feature_flags`), with fallbacks to `features.json` and `localStorage`. Added a check to ensure an authenticated user exists before attempting Firestore read for flags.
    * Updated `main.js` (Todo app) to correctly initialize `LoggingService` (log level based on `debugMode` flag) and to ensure proper initialization order with `featureFlagService.js`.
    * Created initial Admin Panel JavaScript files:
        * `admin_main.js`: Handles Firebase initialization (using the same config as the main app), admin authentication flow (including checking for `profile.role === 'admin'` in the user's Firestore document at `users/{uid}/appData/userSpecificData`), orchestration of data loading, and basic event listeners.
        * `adminUI.js`: Manages DOM manipulation for displaying data in the admin panel (e.g., feature flags table, error logs table) and showing admin messages.
        * `adminDataService.js`: Encapsulates data fetching logic for the admin panel. Currently implements `fetchErrorLogs()` and placeholders for user lists/stats. Initialized with the Firestore instance by `admin_main.js`.
    * Systematically resolved numerous "Cannot access 'LoggingService' before initialization" errors across various modules by:
        * Removing top-level "module loaded" logging calls from individual JS files (`eventBus.js`, `firebaseService.js`, `store.js`, `featureFlagService.js`, `modalStateService.js`, `utils.js`, `viewManager.js`, `versionService.js`, `tooltipService.js`, `projectService.js`, `taskService.js`, `labelService.js`, `bulkActionService.js`, `task_timer_system.js`, `pomodoro_timer.js`).
        * Refactoring `loggingService.js` to receive its Firestore instance via an initializer function (`initializeFirestoreLogging`) called by `feature_user_accounts.js` (for the main app) and `admin_main.js` (for the admin panel), breaking a circular dependency.
    * Fixed a `TypeError: docSnap.exists is not a function` in `admin_main.js` by changing `docSnap.exists()` to the property `docSnap.exists` (correct for Firebase Compat SDK v8).
    * Admin login to `admin.html` is now functional.
    * The admin dashboard displays a read-only list of Feature Flags.
    * The admin dashboard displays a list of Error Logs fetched from the `app_errors` Firestore collection.

## 5. Current Focus / Next Steps (Specific to Current Major Task):

* **Current Sub-Task:** You (Joey) just asked to create this AI Project Curation Log.
* **Immediate Next File/Action (after this log is created):** Decide on the next feature/section for the Admin Panel. Suggestions:
    1.  **User Management (Basic Info):**
        * Discuss and define Firestore security rule changes needed for admins to read user data (e.g., list UIDs, emails, displayNames, roles from `/users/{uid}/appData/userSpecificData.profile`).
        * Implement `fetchUserList()` in `adminDataService.js`.
        * Implement `displayUserList()` in `adminUI.js`.
        * Update `admin_main.js` to call these and display the list.
    2.  **Overview Stats:**
        * Implement "Total Users" stat (depends on user list fetching capability).
* **Specific questions for AI (if any):**
    * [User: Add your questions here]
* **Blockers (if any):**
    * Implementing User Management requires careful changes to Firestore security rules.

## 6. Known Issues / Bugs (Related to current work or recently discovered):


## 7. Future/Pending Work (Overall Project - High Level):

* **Admin Panel:**
    * Flesh out User Management (view details, potentially disable users - requires careful rule changes).
    * Implement all Overview Stats.
    * Implement A/B Testing stats display section.
    * Add more sophisticated filtering/pagination for Error Logs.
    * Improve the "Details" view for individual error logs beyond a simple `alert()`.
* **Todo App (Main Application):**
    * Complete and refine planned features like Calendar View, Pomodoro Timer, Sub-tasks, Task Dependencies, Reminders, File Attachments, etc. (as per `features.json` and README).
    * Address any UI/UX improvements.

## 8. Important Notes / Decisions Made:

* Admin role is defined in Firestore at `users/{uid}/appData/userSpecificData` within a `profile` map, as `profile: { role: "admin" }`.
* Feature flags are intended to be read-only in the current iteration of the admin panel.
* Error logs are stored in the `app_errors` Firestore collection.
* The project uses the Firebase JavaScript SDK (Compat version - v8 style syntax).
* The Admin Panel is a separate HTML page (`admin.html`) but shares Firebase configuration and some services (logging, feature flags) with the main Todo app.
* Module loading initialization errors related to `LoggingService` were resolved by removing top-level "module loaded" logs and fixing a circular dependency with `feature_user_accounts.js` via an explicit initializer for Firestore logging in `LoggingService`.
