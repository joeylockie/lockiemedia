# AI Project Curation Log: Lockie Media Platform

**Last Updated:** 2025-07-18 16:52 (EDT)


## 1. Instructions for AI (Gemini)

**Purpose of this Document:**  A Note to AI Assistants: This document is your primary source of truth for the Lockie Media Platform project. It provides context, tracks progress, outlines current tasks, and lists future goals. Please refer to it to understand:

* The overall project scope.
* What has already been completed.
* What the user (Joey) is currently working on with your assistance.
* The specific sub-tasks and files involved in the current session.
* Any known issues or important decisions made.

**How to Use & Update This Document:**

* **Prioritize this Document:** When the user provides this document or refers to it at the start of a session, consider its content as the most up-to-date information, potentially overriding previous chat history if there are discrepancies regarding project state.
* **Understand Current Focus:** Pay close attention to Section 6: "Current Focus / Next Steps" from the previous version of this log to understand the immediate objectives for the current session.
* **Track Session Progress:** During our development session, keep track of:
    * Tasks completed and files modified/created.
    * New issues or bugs identified.
    * Key decisions made.
    * The next logical steps or remaining sub-tasks.
* **Generate Updated Log Content (End of Session):**
    * When the user asks you to "update the AI Project Log" (or similar), your task is to regenerate the entire Markdown content for this document.
    * You will use the previous version of this log as your base.
    * Update all relevant sections based on the work done during the session, including the "Last Updated" timestamp, "Work Completed," "Current Focus," and "Known Issues."
    * Maintain Format: Preserve the existing Markdown structure and formatting.
    * Provide Complete Output: Present the entire, fully updated Markdown content back to the user so they can replace the content of their `AI_PROJECT_LOG.md` file.

---

## 2. Project Overview & Goals

* **Platform:** "Lockie Media Platform", which includes user-facing "apps" and administrative "services".
* **Vision:** To become an all-in-one platform for personal and business management, comprised of modular apps.
* **Technology:** Self-hosted application with a microservice architecture. Backend services are built with Node.js/Express.js and a shared SQLite database. Services are managed by PM2 and fronted by a central API Gateway secured with API Keys.
* **Core Platform Apps (Initial Focus):** Task Manager, Notes, Habit Tracker, Time Tracker, Pomodoro, Calendar, and Dev Tracker.
* **Overall Goal:** Develop a robust, feature-complete management platform with a suite of integrated apps.

---

## 3. Verified File Structure

This is the definitive file tree for the project. **Do not assume other files or paths exist.**


lockiemedia-dev/
├── .gitignore             # Specifies files for Git to ignore.
├── database-setup.js      # Node.js script to initialize the SQLite database and create tables.
├── db.json                # Legacy file, likely for a mock API. Not used by the live application.
├── ecosystem.dev.json     # PM2 config for DEVELOPMENT.
├── ecosystem.prod.json    # PM2 config for PRODUCTION.
├── package-lock.json      # Exact dependency tree for the root npm packages.
├── package.json           # Root npm dependencies and project scripts.
│
├── public/                # All client-facing frontend files.
│   ├── AI_PROJECT_LOG.md    # THIS FILE. The primary source of truth for AI assistants.
│   ├── README.md            # The public-facing project README file.
│   ├── favicon.ico          # Browser tab icon.
│   ├── icon-32x32.png       # App icon for manifests.
│   ├── index.html           # Main application entry point (Dashboard).
│   ├── style.css            # Global CSS styles.
│   │
│   ├── app_logic.js         # Core application logic, likely for initialization.
│   ├── dashboard_main.js    # Main JS for the dashboard view.
│   ├── eventBus.js          # Frontend module communication (Pub/Sub).
│   ├── loggingService.js    # Handles client-side logging.
│   ├── modalStateService.js # Manages the state of modals.
│   ├── notificationService.js # Handles desktop notifications.
│   ├── service-worker.js    # PWA service worker for offline capabilities.
│   ├── store.js             # CRITICAL: Frontend state management. Fetches and holds all app data.
│   ├── utils.js             # Shared utility functions.
│   ├── viewManager.js       # Handles loading different HTML views into the main content area.
│   │
│   ├── automation.html      # Placeholder/Future view for Automation.
│   ├── budget.html          # Placeholder/Future view for Budgeting.
│   │
│   ├── tasks.html                   # HTML view for the Task Manager app.
│   ├── taskService.js               # Business logic for tasks.
│   ├── projectService.js            # Business logic for projects.
│   ├── labelService.js              # Business logic for labels.
│   ├── tasks_main.js                # Main JS controller for the Task Manager view.
│   ├── tasks_form_handlers.js       # Handles task form submissions.
│   ├── tasks_list_view.js           # Logic for rendering the task list.
│   ├── tasks_modal_events.js        # Event handling for task modals.
│   ├── tasks_modal_interactions.js  # UI interactions for task modals.
│   ├── tasks_ui_event_handlers.js   # General UI event handling for the tasks view.
│   ├── tasks_ui_rendering.js        # General UI rendering for the tasks view.
│   │
│   ├── notes.html                   # HTML view for the Notes app.
│   ├── noteService.js               # Business logic for notes.
│   ├── notes_main.js                # Main JS controller for the Notes view.
│   ├── notes_event_handlers.js      # Event handling for the Notes view.
│   ├── notes_rendering.js           # UI rendering for the Notes view.
│   │
│   ├── time-tracker.html            # HTML view for the Time Tracker app.
│   ├── time-history.html            # HTML view for the Time Tracker history.
│   ├── timeTrackerService.js        # Business logic for the Time Tracker.
│   ├── time_tracker_main.js         # Main JS controller for the Time Tracker view.
│   ├── time_history_main.js         # Main JS controller for the Time Tracker history view.
│   │
│   ├── dev-tracker.html             # HTML view for the Dev Tracker app.
│   ├── dev_tracker_service.js       # Business logic for the Dev Tracker.
│   ├── dev_tracker_main.js          # Main JS controller for the Dev Tracker view.
│   ├── dev_tracker_ui.js            # UI rendering and interactions for the Dev Tracker.
│   │
│   ├── calendar.html                # HTML view for the Calendar app.
│   ├── calendarService.js           # Business logic for the Calendar.
│   ├── calendar_main.js             # Main JS controller for the Calendar view.
│   │
│   ├── habits.html                  # HTML view for the Habit Tracker app.
│   ├── habitTrackerService.js       # Business logic for the Habit Tracker.
│   ├── habit_tracker_main.js        # Main JS controller for the Habit Tracker view.
│   │
│   ├── pomodoro.html                # HTML view for the Pomodoro Timer app.
│   ├── pomodoro-history.html        # HTML view for the Pomodoro session history.
│   ├── pomodoroService.js           # Business logic for the Pomodoro Timer.
│   ├── pomodoro_main.js             # Main JS controller for the Pomodoro Timer view.
│   ├── pomodoro_history_main.js     # Main JS controller for the Pomodoro history view.
│   │
│   ├── feature_advanced_recurrence.js   # Feature module for advanced recurrence.
│   ├── feature_desktop_notifications.js # Feature module for desktop notifications.
│   ├── feature_habit_tracker.js         # Feature module for habit tracker integration.
│   ├── feature_notes.js                 # Feature module for notes integration.
│   ├── feature_projects.js              # Feature module for projects integration.
│   ├── feature_reminder.js              # Feature module for reminders.
│   ├── feature_shopping_list.js         # Feature module for a shopping list.
│   ├── feature_time_tracker.js          # Feature module for time tracker integration.
│   └── feature_time_tracker_reminders.js# Feature module for time tracker reminders.
│
└── services/                # Contains all backend microservices.
    ├── api-gateway/         # The API Gateway service.
    │   ├── index.js           # Main logic for the gateway (routing, auth, API composition).
    │   └── package.json       # Dependencies for the gateway.
    │
    ├── calendar-service/      # Microservice for Calendar features.
    │   ├── index.js           # Express server and API endpoints for the service.
    │   └── package.json       # Dependencies for the service.
    │
    ├── dev-tracker-service/   # Microservice for Dev Tracker features.
    │   ├── index.js
    │   └── package.json
    │
    ├── habit-tracker-service/ # Microservice for Habit Tracker features.
    │   ├── index.js           # Express server and API endpoints for the service.
    │   └── package.json       # Dependencies for the service.
    │
    ├── notes-service/         # Microservice for Notes features.
    │   ├── index.js
    │   └── package.json
    │
    ├── pomodoro-service/      # Microservice for Pomodoro features.
    │   ├── index.js           # Express server and API endpoints for the service.
    │   └── package.json       # Dependencies for the service.
    │
    ├── task-service/          # Microservice for Task Management features.
    │   ├── index.js
    │   └── package.json
    │
    └── time-tracker-service/  # Microservice for Time Tracker features.
        ├── index.js
        └── package.json


---

## 4. Work Completed (Overall Project - High Level)

* **Core Task Management:** Functionalities implemented as a foundational module.
* **Backend Refactor:** Migrated from a Firebase backend to a self-hosted Node.js/Express stack.
* **Database Migration:** Successfully migrated the core application's database from lowdb (JSON file) to a robust SQLite database using `better-sqlite3`.
* **Backend Architecture Refactor:** Migrated the backend from a single monolith to a microservice architecture.
* **API Security:** Implemented an API Key authentication layer on the API Gateway.
* **Notes App Enhancements:** Added notebook deletion and a full-featured Markdown editor.
* **Time Tracker UI/UX Enhancements:** Fixed critical dark mode UI bugs and implemented a fully-featured custom reminder system.
* **Dev Tracker App:** Implemented a full-featured development ticket tracking system for epics and tickets.
* **Dev Tracker Backend & Database Debugging:** Resolved critical backend errors preventing the Dev Tracker app from saving data correctly.
* **Isolated Development Environment:** Set up a complete, isolated development environment on a separate container, managed by PM2 and a separate Git branch.
* **Habit Tracker & Pomodoro Timer:** Implemented full-stack Habit Tracker and Pomodoro Timer applications with dedicated microservices and interactive frontends.
* **(NEW) UI/UX Bug Squashing & Habit Tracker Enhancement:** Fixed multiple UI bugs, removed unused features, and implemented a multi-click completion feature for the Habit Tracker. Resolved complex server deployment and caching issues. Implemented a robust automated database backup system, and added a full-featured Week View with drag-and-drop and a live time indicator to the Calendar app.

---

## 5. Work Completed (Specific to Current Major Task)

* **Date:** 2025-07-14
* **Task:** Improve and standardize project documentation for AI collaboration.
* **Sub-tasks Completed:**
    * Restructured and merged the `AI_PROJECT_LOG.md` with a more detailed curation format.
    * Restored the detailed file tree to the `AI_PROJECT_LOG.md` to ensure complete context for AI assistants.

* **Date:** 2025-07-17
* **Task:** Implement full-stack Habit Tracker and Pomodoro Timer features.
* **Sub-tasks Completed:**
    * Backend:
        * Updated database-setup.js with new tables for habits, habit_completions, and pomodoro_sessions.
        * Created a new habit-tracker-service microservice to manage all habit-related data.
        * Created a new pomodoro-service microservice to manage all pomodoro session data.
        * Updated the api-gateway to recognize and route requests to the two new microservices.
        * Updated ecosystem.dev.json and ecosystem.prod.json to include the new services for PM2 management.
    * Frontend (Habit Tracker):
        * Built a new, dynamic frontend for the Habit Tracker, matching a modern, card-based UI design.
        * Implemented a yearly "commit grid" visualization for habit completions.
        * Added functionality to create, edit, and delete habits.
    * Frontend (Pomodoro):
        * Built a full-featured Pomodoro timer frontend with start, pause, and reset controls.
        * Implemented a settings modal to allow user-configurable timer durations, saved to local storage.
        * Created a session history page to log and display all completed Pomodoro sessions.
    * Debugging:
        * Resolved numerous complex server-side issues, including port conflicts, module dependency errors, and data persistence bugs related to stale server caches and incorrect file versions.

* **Date:** 2025-07-18
* **Task:** UI Bug Fixes, Feature Cleanup, and Multi-Click Habit Tracker Implementation.
* **Sub-tasks Completed:**
    * UI Bug Fixes & Cleanup:
        * Fixed CSS bug causing the Notes sidebar to render incorrectly when minimized.
        * Fixed z-index bug causing the "Manage Projects" modal to open behind the "Settings" modal in the Task app.
        * Removed the unused "Profile" feature, including the modal, buttons, and all associated JavaScript functions and event listeners.
    * Habit Tracker - Multi-Click Feature:
        * Database: Modified database-setup.js to add a target_count to the habits table and a completion_count to the habit_completions table.
        * Backend: Refactored the habit-tracker-service to use specific RESTful endpoints (POST, PUT, DELETE, and a new "upsert" endpoint for    completions) instead of a general sync.
    * Frontend:
        * Updated habits.html to include a "Target Per Day" input in the add/edit modal.
        * Updated habitTrackerService.js to communicate with the new backend API endpoints.
        * Rewrote logic in habit_tracker_main.js to handle multi-click completions, cycling through color levels based on the target count.
        * Added new color levels to style.css for the completion squares.
    * Server Deployment & Debugging:
        * Diagnosed and fixed multiple EADDRINUSE (port in use) errors by identifying and correcting hardcoded ports in service files (calendar-service, api-gateway).
        * Diagnosed and fixed a persistent no such column database error by correcting a faulty fallback database path in the habit-tracker-service.
        * Guided a full server reset process, including reinstalling PM2 and clearing its cache, to resolve stubborn process management issues.
    * Dashboard Fix:
        * Removed an obsolete call to HabitTrackerService.initialize() in dashboard_main.js that was causing a critical error on the main page.
    * Automated Backup System:
        * Created a new /api/database/backup endpoint in the API gateway to allow direct download of the entire lockiedb.sqlite file.
        * Replaced the old, manual JSON export function on the frontend with a simple link to the new, automated backup endpoint.
    * Calendar App Enhancements:
        * Implemented a full-featured Week View with a 24-hour timeline and correct event placement.
        * Implemented Drag-and-Drop rescheduling for events in the Month View.
        * Added a "Today" Button for quick navigation.
        * Added a real-time Current Time Indicator line to the Week View.

---

## 6. Current Focus / Next Steps

* **Current Major Task/Feature Being Worked On:**
    * **Name:** None. Project documentation is up to date.
    * **Goal for this Task:** Awaiting next development objective.
* **Specific questions for AI (if any):**
    * None.
* **Blockers (if any):**
    * None.

---

## 7. Known Issues / Bugs

* None. All known critical issues have been resolved.

---

## 8. Future/Pending Work (Overall Project - High Level)

* **Security:** Further enhancements could include JWT for user-level authentication in the future.
* **Frontend Decoupling:** Continue refactoring to fully decouple all apps.
* **Core Features:** Refine and enhance core features based on usage.
* **UI/UX:** Continuously improve the user interface and experience across all apps.
* **Pomodoro:** Add optional desktop notifications for completed sessions.
* **Pomodoro:** Move saved from local storage to database.
* **automation.html** To be built out at a future date.
* **budget.html** To be built out at a future date.

---

## 9. Important Notes / Decisions Made

* **Microservice Architecture Adopted:** Pivoted from a simple data centralization task to a full backend refactor. Adopted a microservice architecture with an API Gateway to ensure true decoupling, improve stability, and provide a secure foundation for third-party integrations. Implemented API Key security as the first layer of protection.
* **Frontend Decoupling Initiated:** A decision was made to refactor the frontend. The first phase isolated the Task Manager app. The second phase deepened this decoupling by namespacing all of its UI, event, and modal handling files with a `tasks_` prefix for better code isolation and clarity.
* **Notes App Architecture:** To prepare for new features, the Notes app's frontend code was refactored into a modular structure (`notes_rendering.js`, `notes_event_handlers.js`), separating concerns and improving maintainability.
* **Editor Choice:** A side-by-side Markdown editor (using Marked.js and DOMPurify) with toggleable view modes was chosen for the Notes app over a more complex Rich Text/WYSIWYG editor. This decision prioritized implementation speed, maintainability, and data portability (plain text) while still providing a powerful user experience.
* **Sidebar UI Pattern:** Decided to move from a "disappearing" sidebar (width: 0) to a more robust "shrinking" sidebar pattern to prevent UI lockouts.
* **(NEW) Service Configuration:** Discovered and fixed hardcoded port numbers and database paths in several microservices. The standard moving forward will be to ensure all services pull their configuration exclusively from environment variables provided by the ecosystem.dev.json file.
* **(NEW) Backup Strategy:** Moved from a manual, frontend-driven JSON export to a robust, backend-driven direct database file download. This is a future-proof solution that guarantees a complete backup without needing future code changes.







