# AI Project Curation Log: Lockie Media Platform

**Last Updated:** 2025-07-14 10:27 (EDT)

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
│   ├── AI_PROJECT_LOG.md  # THIS FILE. The primary source of truth for AI assistants.
│   ├── README.md          # The public-facing project README file.
│   ├── index.html         # Main application entry point.
│   ├── style.css          # Global CSS styles.
│   ├── store.js           # CRITICAL: Frontend state management. Fetches and holds all app data.
│   ├── viewManager.js     # Handles loading different HTML views into the main content area.
│   ├── eventBus.js        # Frontend module communication (Pub/Sub).
│   ├── utils.js           # Shared utility functions.
│   ├── service-worker.js  # PWA service worker for offline capabilities.
│   │
│   ├── *.html             # HTML templates for each app view (e.g., tasks.html).
│   ├── main.js          # Main JavaScript entry point for each app view (e.g., tasks_main.js).
│   ├── *Service.js        # Business logic and data manipulation for each feature (e.g., taskService.js).
│   └── feature.js       # Specific, isolated feature logic (e.g., feature_projects.js).
│
└── services/              # Contains all backend microservices.
├── api-gateway/       # The API Gateway service.
│   ├── index.js       # Main logic for the gateway (routing, auth, API composition).
│   └── package.json   # Dependencies for the gateway.
│
├── calendar-service/      # Microservice for Calendar features.
│   ├── index.js           # Express server and API endpoints for the service.
│   └── package.json       # Dependencies for the service.
├── dev-tracker-service/ # Microservice for Dev Tracker features.
│   ├── index.js
│   └── package.json
├── notes-service/     # Microservice for Notes features.
│   ├── index.js
│   └── package.json
├── task-service/      # Microservice for Task Management features.
│   ├── index.js
│   └── package.json
└── time-tracker-service/ # Microservice for Time Tracker features.
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

---

## 5. Work Completed (Specific to Current Major Task)

* **Date:** 2025-07-14
* **Task:** Improve and standardize project documentation for AI collaboration.
* **Sub-tasks Completed:**
    * Restructured and merged the `AI_PROJECT_LOG.md` with a more detailed curation format.
    * Restored the detailed file tree to the `AI_PROJECT_LOG.md` to ensure complete context for AI assistants.

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

---

## 9. Important Notes / Decisions Made

* **Microservice Architecture Adopted:** Pivoted from a simple data centralization task to a full backend refactor. Adopted a microservice architecture with an API Gateway to ensure true decoupling, improve stability, and provide a secure foundation for third-party integrations. Implemented API Key security as the first layer of protection.
* **Frontend Decoupling Initiated:** A decision was made to refactor the frontend. The first phase isolated the Task Manager app. The second phase deepened this decoupling by namespacing all of its UI, event, and modal handling files with a `tasks_` prefix for better code isolation and clarity.
* **Notes App Architecture:** To prepare for new features, the Notes app's frontend code was refactored into a modular structure (`notes_rendering.js`, `notes_event_handlers.js`), separating concerns and improving maintainability.
* **Editor Choice:** A side-by-side Markdown editor (using Marked.js and DOMPurify) with toggleable view modes was chosen for the Notes app over a more complex Rich Text/WYSIWYG editor. This decision prioritized implementation speed, maintainability, and data portability (plain text) while still providing a powerful user experience.
* **Sidebar UI Pattern:** Decided to move from a "disappearing" sidebar (width: 0) to a more robust "shrinking" sidebar pattern to prevent UI lockouts.
