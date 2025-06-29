AI Project Curation Log: Lockie Media Platform
Last Updated: 2025-06-28 20:56 (EDT)

1. Instructions for AI (Gemini)
Purpose of this Document: This document is your primary source of truth for the dev branch of the Lockie Media Platform project. It provides context, tracks progress, outlines current tasks, and lists future goals. Please refer to it to understand:

The overall project scope.

What has already been completed.

What the user (Joey) is currently working on with your assistance.

The specific sub-tasks and files involved in the current session.

Any known issues or important decisions made.

How to Use & Update This Document:

Prioritize this Document: When the user provides this document or refers to it at the start of a session, consider its content as the most up-to-date information, potentially overriding previous chat history if there are discrepancies regarding project state.

Understand Current Focus: Pay close attention to Section 5: "Current Focus / Next Steps" from the previous version of this log to understand the immediate objectives for the current session.

Track Session Progress: During our development session, keep track of:

Tasks completed and files modified/created.

New issues or bugs identified.

Key decisions made.

The next logical steps or remaining sub-tasks.

Generate Updated Log Content (End of Session):

When the user asks you to "update the AI Project Log" (or similar), your task is to regenerate the entire Markdown content for this document.

You will use the previous version of this log as your base.

Update all relevant sections based on the work done during the session, including the "Last Updated" timestamp, "Work Completed," "Current Focus," and "Known Issues."

Maintain Format: Preserve the existing Markdown structure and formatting.

Provide Complete Output: Present the entire, fully updated Markdown content back to the user so they can replace the content of their AI_PROJECT_LOG.md file.

2. Project Overview & Goals:
Platform: "Lockie Media Platform", which includes user-facing "apps" and administrative "services".

Vision: To become an all-in-one platform for personal and business management, comprised of modular apps.

Technology: Self-hosted application with a microservice architecture. Backend services are built with Node.js/Express.js and a shared SQLite database. Services are managed by PM2 and fronted by a central API Gateway secured with API Keys.

Core Platform Apps (Initial Focus): Task Manager, Notes, Habit Tracker, Time Tracker, Pomodoro, Calendar, and Dev Tracker.

Overall Goal: Develop a robust, feature-complete management platform with a suite of integrated apps.

3. Work Completed (Overall Project - High Level):
Core Task Management: Functionalities implemented as a foundational module.

Backend Refactor: Migrated from a Firebase backend to a self-hosted Node.js/Express stack.

Database Migration: Successfully migrated the core application's database from lowdb (JSON file) to a robust SQLite database using better-sqlite3.

Backend Architecture Refactor: Migrated the backend from a single monolith to a microservice architecture.

API Security: Implemented an API Key authentication layer on the API Gateway.

Notes App Enhancements: Added notebook deletion and a full-featured Markdown editor.

Time Tracker UI/UX Enhancements: Fixed critical dark mode UI bugs and implemented a fully-featured custom reminder system.

Dev Tracker App: Implemented a full-featured development ticket tracking system for epics and tickets.

Dev Tracker Backend & Database Debugging: Resolved critical backend errors preventing the Dev Tracker app from saving data correctly.

4. Work Completed (Specific to Current Major Task):
Date: 2025-06-28

Task: Full Development Environment Setup

Summary: Successfully created a complete, isolated development environment to enable safe testing and feature development without impacting the live production application. This involved container cloning, database isolation, and correcting a critical configuration issue to ensure true separation.

Details:

Proxmox Containerization: Cloned the production LXC container (`lockiemedia-prod`) to create a new, fully isolated container (`lockiemedia-dev`) for all development work.

Database Isolation: Created a separate SQLite database file (`lockiedb.sqlite`) within the `lockiemedia-dev` container, ensuring that development data is completely separate from production data.

Git Branching Strategy: Established a new `develop` branch in the git repository as the base for all new feature work, separating development code from the stable `main` branch.

Environment Configuration Fix: Identified and resolved a critical issue where the frontend application had a hardcoded IP address. Modified `public/store.js` in the development environment to point to the development API gateway, ensuring the dev frontend communicates only with the dev backend.

GitHub Authentication: Successfully authenticated with GitHub's command-line interface using a Personal Access Token (PAT) instead of a password, in line with modern security practices.

5. Current Focus / Next Steps (Specific to Current Major Task):
Current Major Task/Feature Being Worked On:

Name: Google Calendar Integration

Goal for this Task: To add two-way synchronization between the platform's calendar app and a user's Google Calendar.

Status: Ready to Start

Current Sub-Task / Immediate Next Action:

Begin coding the feature on the `feature/google-calendar` branch within the `lockiemedia-dev` container.

Run the updated `database-setup.js` script to apply the new schema changes to the development database.

Begin building the backend logic for the Google OAuth 2.0 authentication flow within the `calendar-service`.

Specific questions for AI (if any):

None.

Blockers (if any):

None.

6. Known Issues / Bugs (Related to current work or recently discovered):
None. The critical issue of the development and production environments sharing the same backend has been resolved.

7. Future/Pending Work (Overall Project - High Level):
Security: Further enhancements could include JWT for user-level authentication in the future.

Frontend Decoupling: Complete for Tasks and Notes apps.

Core Features: Refine and enhance core features based on usage.

UI/UX: Continuously improve the user interface and experience across all apps.

8. Important Notes / Decisions Made:
Cloned Container for Dev Environment: Decided to use a fully cloned LXC container for development instead of running dev services alongside production services in the same container. This provides maximum isolation and safety.

Microservice Architecture Adopted: Pivoted from a simple data centralization task to a full backend refactor. Adopted a microservice architecture with an API Gateway to ensure true decoupling, improve stability, and provide a secure foundation for third-party integrations. Implemented API Key security as the first layer of protection.

Frontend Decoupling Initiated: A decision was made to refactor the frontend. The first phase isolated the Task Manager app. The second phase deepened this decoupling by namespacing all of its UI, event, and modal handling files with a tasks_ prefix for better code isolation and clarity.

Editor Choice: A side-by-side Markdown editor (using Marked.js and DOMPurify) with toggleable view modes was chosen for the Notes app over a more complex Rich Text/WYSIWYG editor. This decision prioritized implementation speed, maintainability, and data portability (plain text) while still providing a powerful user experience.

Sidebar UI Pattern: Decided to move from a "disappearing" sidebar (width: 0) to a more robust "shrinking" sidebar pattern to prevent UI lockouts.