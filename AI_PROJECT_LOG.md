# AI Project Curation Log: Lockie Media Platform
Last Updated: 2025-08-02 12:00 (EDT)

## 1. Instructions for AI (Gemini)
**Purpose of this Document:** A Note to AI Assistants: This document is your primary source of truth for the Lockie Media Platform project. It provides context, tracks progress, outlines current tasks, and lists future goals. Please refer to it to understand:

* The overall project scope.
* What has already been completed.
* What the user is currently working on with your assistance.
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

## 2. Project Overview & Goals
* **Platform:** "Lockie Media Platform", a suite of user-facing productivity "apps".
* **Vision:** To be an all-in-one platform for personal management, comprised of modular apps that run entirely in the browser.
* **Technology:** A purely client-side application.
    * **Core:** Vanilla JavaScript (ES6 Modules), HTML5
    * **Styling:** Tailwind CSS
    * **Data Storage:** IndexedDB via the Dexie.js library.
* **Core Platform Apps:** Task Manager, Habit Tracker, Time Tracker, Calendar.
* **Overall Goal:** Develop a robust, feature-complete, and easily deployable management platform.

## 3. Verified File Structure
This is the definitive file tree for the project. Do not assume other files or paths exist.

lockiemedia-dev/
├── AI_PROJECT_LOG.md               # Your primary source of truth for the project's status, progress, and goals.
├── README.md                       # Provides a high-level overview of the project, its features, and how to run it.
├── database.js                     # Defines the IndexedDB database schema, including all tables and their indexes, using Dexie.js.
├── dexie.mjs                       # The local copy of the Dexie.js library, which simplifies IndexedDB operations.
├── favicon.ico                     # The small icon displayed in the browser tab.
├── icon-32x32.png                  # A 32x32 pixel icon for the application.
├── index.html                      # The main dashboard/homepage of the application, displaying widgets for various apps.
├── style.css                       # Contains all the custom CSS rules for the entire platform, supplementing Tailwind CSS.
├── version.json                    # Stores the application's current version number.
│
├── app_logic.js                    # Manages the application's light/dark theme based on user preference or system settings.
├── centralNotificationService.js   # New service to manage all app notifications from a single, efficient service.
├── dashboard_main.js               # Handles all logic for the main dashboard, including rendering widgets and data import/export functionality.
├── eventBus.js                     # A simple publish/subscribe system for decoupled communication between different modules.
├── loggingService.js               # A centralized service for logging debug, info, warning, and error messages to the console.
├── modalStateService.js            # Manages the state of which task is currently being viewed or edited in a modal.
├── notificationService.js          # Manages browser desktop notifications, including permission requests and display logic.
├── service-worker.js               # Handles caching of application shell files for offline capabilities.
├── store.js                        # Manages the in-memory state (cache) of the application's data, syncing it from IndexedDB.
├── utils.js                        # Contains common utility functions, primarily for date and time formatting, used across the application.
├── versionService.js               # Fetches the app version, displays it in the UI, and periodically checks for updates.
├── viewManager.js                  # Manages the presentation state of the Task app, such as current filters, sorting, and search terms.
│
├── automation.html                 # A placeholder page for a future "Automation Workflows" feature.
│
├── tasks.html                      # The main HTML structure for the Task Manager application, including all its modals and UI elements.
├── taskService.js                  # Contains all business logic for creating, reading, updating, and deleting tasks in the database.
├── projectService.js               # Handles all logic related to managing projects, including adding, updating, and deleting them.
├── labelService.js                 # Manages logic for labels, such as removing a label's usage from all associated tasks.
├── tasks_main.js                   # The main entry point for the Task Manager, initializing all its features and services.
├── tasks_form_handlers.js          # Manages the form submission logic for adding and editing tasks.
├── tasks_list_view.js              # Handles the specific logic for rendering the main task list based on current filters and sorting.
├── tasks_modal_events.js           # Sets up event listeners specifically for opening and closing the various modals in the Task Manager.
├── tasks_modal_interactions.js     # Contains functions to control the state and content of modals (open, close, populate data).
├── tasks_ui_event_handlers.js      # Manages general UI event listeners for the Task Manager, like clicks on sort buttons or search input.
├── tasks_ui_rendering.js           # Contains all functions that directly manipulate the DOM to render the Task Manager's UI components.
│
├── time-tracker.html               # The main HTML structure for the Time Tracker application, showing daily activities and logs.
├── time-history.html               # The HTML page for viewing and generating reports on past time log entries.
├── timeTrackerService.js           # Manages all business logic for the time tracker, including starting/stopping timers and logging entries.
├── time_tracker_main.js            # The main entry point for the Time Tracker application, initializing its features.
├── time_history_main.js            # Handles the logic for the time history and reporting page, including fetching and displaying data for date ranges.
│
├── calendar.html                   # The main HTML structure for the Calendar application.
├── calendarService.js              # Handles all business logic for creating, reading, updating, and deleting calendar events.
├── calendar_main.js                # The main entry point for the Calendar application, responsible for initializing the UI.
│
├── habits.html                     # The main HTML structure for the Habit Tracker application.
├── habitTrackerService.js          # Manages all business logic for habits, including creating habits and logging completions.
├── habit_tracker_main.js           # The main entry point for the Habit Tracker, handling UI rendering and event listeners.
│
├── feature_advanced_recurrence.js  # Manages the UI and logic for setting up recurring tasks.
├── feature_desktop_notifications.js# Manages the logic for browser desktop notifications for task reminders.
├── feature_habit_tracker.js        # Contains older, deprecated UI logic for the habit tracker.
├── feature_projects.js             # Manages all UI interactions for the projects feature within the Task Manager.
├── feature_reminder.js             # Handles UI logic for the simple reminder toggle in the task modals.
├── feature_shopping_list.js        # Manages the visibility and logic for the "Shopping List" smart view in the Task Manager.
├── feature_time_tracker.js         # Contains the UI logic and event handlers for the main Time Tracker page.
└── feature_time_tracker_reminders.js # Manages the UI and logic for setting up automated reminders within the Time Tracker.


## 4. Work Completed (Overall Project - High Level)
* **Data Management:** Implemented a full client-side data backup (export) and restore (import) feature using .json files.
* **Application Versioning:** Implemented a version display and a periodic background check that notifies the user when a new version of the application is available.
* **Architecture Migration:** Migrated the entire platform from a self-hosted Node.js microservice architecture to a purely client-side application.
* **Data Layer Migration:** Upgraded the data storage from localStorage to a robust IndexedDB database using the Dexie.js library, including a seamless, one-time data migration for existing users.
* **File Structure Simplification:** Flattened the project structure by moving all files from the `/public` directory to the root, preparing it for simple static hosting.
* **Core Task Management:** Functionalities implemented as a foundational module.
* **Calendar App Enhancements:** Implemented a full-featured Week View with drag-and-drop and a live time indicator.
* **Centralized Notifications:** Created a single, smart notification system that handles alerts for all platform apps.

## 5. Work Completed (Specific to Current Major Task)
**Date:** 2025-08-02

**Task:** Calendar Sidebar Enhancements.

**Goal:** To improve the user experience of the Calendar app by adding key features and navigation controls to the sidebar.

**Sub-tasks Completed:**

1.  **"Create" Button:**
    * Added a prominent "Create" button to the sidebar in `calendar.html`.
    * Hooked up the button in `calendar_main.js` to open the event creation modal, pre-filling it with the currently selected date.
2.  **Inline Mini-Calendar:**
    * Moved the date-picking functionality from the main header into a permanently visible mini-calendar in the sidebar.
    * Added a placeholder `div` in `calendar.html` for the new mini-calendar.
    * Modified `calendar_main.js` to initialize the `flatpickr` library as an inline calendar within the new `div`.
    * Linked the mini-calendar's selection to update the main calendar view.
3.  **Search Bar:**
    * Added a disabled, placeholder search bar to the sidebar in `calendar.html` for future implementation.
4.  **Styling and Bug Fixes:**
    * Added a new stylesheet link in `calendar.html` to use the official `flatpickr` dark theme.
    * Removed extensive custom CSS from `style.css` in favor of the library's theme, simplifying maintenance.
    * Widened the sidebar in `calendar.html` to prevent the mini-calendar's days from being cut off.
    * Updated the `flatpickr` configuration in `calendar_main.js` to correctly display the month name (e.g., "August") instead of just the year.

## 6. Current Focus / Next Steps
**Current Major Task/Feature Being Worked On:**

* **Name:** None. Project is awaiting the next development objective.
* **Goal for this Task:** N/A

**Specific questions for AI (if any):**

* None.

**Blockers (if any):**

* None.

## 7. Known Issues / Bugs
* None.

## 8. Future/Pending Work (Overall Project - High Level)
* **Security:** Future enhancements could include adding an optional encryption layer before saving to IndexedDB.
* **UI/UX:** Continuously improve the user interface and experience across all apps.
* **automation.html:** To be built out at a future date.
* **Calendar Search:** The new search bar in the calendar sidebar needs to be implemented.

## 9. Important Notes / Decisions Made
* **Versioning Scheme:** Adopted the Semantic Versioning (MAJOR.MINOR.PATCH) standard for the application. The current version is now **1.9.0**.
* **Data Layer Upgrade to IndexedDB:** The application's data persistence layer has been upgraded from localStorage to IndexedDB (via the Dexie.js library). This was done to provide a more scalable, performant, and resilient data storage solution capable of handling larger amounts of data and more complex queries.
* **PIVOTAL DECISION: Migration to Client-Side Architecture:** The project has been fundamentally changed from a complex, self-hosted Node.js microservice application to a pure client-side application.
* **File Structure:** The project's file structure has been flattened, with all necessary files moved to the root directory to simplify deployment on static hosting services.
* **Data Backup Strategy:** The backup strategy is a client-side .json file export and import.
* **Time Log Optimization:** The `time_log_entries` table in the database has been optimized to save space by removing redundant data and shortening property names. A database migration handles the conversion for existing users.
* **Calendar Date Picker:** Decided to use the official `flatpickr` dark theme for the new inline calendar instead of maintaining extensive custom CSS for better reliability and easier maintenance.
* **User Profile Storage:** The user's display name is stored locally in the app_state table within IndexedDB, ensuring it remains private and is not sent over the network.

