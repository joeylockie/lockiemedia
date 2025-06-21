AI Project Curation Log: Lockie Media Platform
Last Updated: 2025-06-21 17:44 (EDT)

1. Instructions for AI (Gemini)
Purpose of this Document: This document is your primary source of truth for the Lockie Media Platform project. It provides context, tracks progress, outlines current tasks, and lists future goals. Please refer to it to understand:

The overall project scope.

What has already been completed.

What the user (Joey) is currently working on with your assistance.

The specific sub-tasks and files involved in the current session.

Any known issues or important decisions made.

How to Use & Update This Document:

Prioritize this Document: When the user provides this document or refers to it at the start of a session, consider its content as the most up-to-date information, potentially overriding previous chat history if there are discrepancies regarding project state.

Understand Current Focus: Pay close attention to Section 5: Current Focus / Next Steps from the previous version of this log to understand the immediate objectives for the current session.

Track Session Progress: During our development session, keep track of:

Tasks completed and files modified/created.

New issues or bugs identified.

Key decisions made.

The next logical steps or remaining sub-tasks.

Generate Updated Log Content (End of Session):

When the user asks you to "update the AI Project Log" (or similar), your task is to regenerate the entire Markdown content for this document.

You will use the previous version of this log (provided by the user at the start of the session or from the current context if it's the same session) as your base.

Update all relevant sections based on the work done during the session, including:

The "Last Updated" timestamp at the top (use the current date and time).

Section 4: Work Completed (Specific to Current Major Task): Add a new dated entry summarizing the session's accomplishments.

Section 5: Current Focus / Next Steps: Update this to reflect what the next immediate actions should be. If the current sub-task is complete, define the next one. Clear out old "Specific questions for AI" if answered, or add new ones.

Section 6: Known Issues / Bugs: Add any new issues identified.

Section 8: Important Notes / Decisions Made: Add any significant decisions.

If a major feature part of Section 2 is completed, update its status and summarize in Section 3.

Maintain Format: Preserve the existing Markdown structure and formatting.

Provide Complete Output: Present the entire, fully updated Markdown content back to the user so they can replace the content of their AI_PROJECT_LOG.md file.

Avoid Redundancy: Use the "Work Completed" sections (3 and 4) from the previous log version to avoid re-suggesting solutions or code for tasks already finished before the current session began.

2. Project Overview & Goals:
Platform: "Lockie Media Platform", which includes user-facing "apps" and administrative "services".

Vision: To become an all-in-one platform for personal and business management, comprised of modular apps.

Technology: Self-hosted application with a microservice architecture. Backend services are built with Node.js/Express.js and a shared SQLite database. Services are managed by PM2 and fronted by a central API Gateway secured with API Keys.

Core Platform Apps (Initial Focus): Task Manager, Notes, Habit Tracker, Time Tracker, Pomodoro, and Calendar.

Overall Goal: Develop a robust, feature-complete management platform with a suite of integrated apps.

3. Work Completed (Overall Project - High Level):
Core Task Management: Functionalities implemented as a foundational module.

Backend Refactor: Migrated from a Firebase backend to a self-hosted Node.js/Express stack.

Database Migration: Successfully migrated the core application's database from lowdb (JSON file) to a robust SQLite database using better-sqlite3.

Feature Streamlining: Removed several non-core features to simplify the codebase.

Client-side Services: Implemented services for logging, events, view management, etc.

Backend Architecture Refactor: Migrated the backend from a single monolith to a microservice architecture, creating an API Gateway and independent services for Notes, Tasks, and Time Tracking. Implemented PM2 for process management.

API Security: Implemented an API Key authentication layer (X-API-Key header) on the API Gateway to protect all backend services.

Monolith Decommission: The original server.js monolith has been fully decommissioned and removed from the project, completing the backend refactor.

Notes App Enhancements: Added notebook deletion and a full-featured Markdown editor.

4. Work Completed (Specific to Current Major Task):
Date: 2025-06-21

Task: Feature Removal & Notes App Upgrade

Summary: Removed several unnecessary features from the Task Manager app to streamline the codebase. Then, executed a major refactor and feature implementation for the Notes app.

Details:

Feature Removal: Successfully removed the Performance Service, Version Service, and Bulk Actions features from the Task Manager application, including all related UI elements and JavaScript files.

Notes App Refactoring: Broke the monolithic feature_notes.js file into a modular structure (notes_rendering.js, notes_event_handlers.js) to mirror the architecture of the Tasks app, improving maintainability.

Notebook Deletion: Implemented the functionality to delete notebooks and their associated notes.

Markdown Editor: Added a full-featured, side-by-side Markdown editor to the Notes app, complete with live preview and toggleable view modes (editor, split-screen, and preview-only).

5. Current Focus / Next Steps (Specific to Current Major Task):
Current Major Task/Feature Being Worked On:

Name: Platform Refinement

Goal for this Task: The major feature work for the Notes app is complete. The next phase is to refine the existing applications and address any minor bugs or UI/UX improvements before moving on to a new large feature.

Status: Complete

Current Sub-Task / Immediate Next Action:

Decision Point: With the Notes app upgraded, it's a good time to decide on the next steps for the platform. Potential options include:

UI/UX Polish: Review the existing apps (Tasks, Notes) for any minor UI inconsistencies, layout issues, or small improvements that would enhance the user experience.

Habit Tracker Enhancements: The Habit Tracker is functional but could be improved with features like editing habits or viewing more detailed statistics.

New Feature - Calendar: Begin scaffolding the Calendar application (calendar.html), which is currently a placeholder page.

Specific questions for AI (if any):

None.

Blockers (if any):

None.

6. Known Issues / Bugs (Related to current work or recently discovered):
None.

7. Future/Pending Work (Overall Project - High Level):
Security: Further enhancements could include JWT for user-level authentication in the future.

Frontend Decoupling: Complete for Tasks and Notes apps.

Core Features: Refine and enhance core features based on usage.

UI/UX: Continuously improve the user interface and experience across all apps.

8. Important Notes / Decisions Made:
Microservice Architecture Adopted: Pivoted from a simple data centralization task to a full backend refactor. Adopted a microservice architecture with an API Gateway to ensure true decoupling, improve stability, and provide a secure foundation for third-party integrations. Implemented API Key security as the first layer of protection.

Frontend Decoupling Initiated: A decision was made to refactor the frontend. The first phase isolated the Task Manager app. The second phase deepened this decoupling by namespacing all of its UI, event, and modal handling files with a tasks_ prefix for better code isolation and clarity.

Notes App Architecture: To prepare for new features, the Notes app's frontend code was refactored into a modular structure (notes_rendering.js, notes_event_handlers.js), separating concerns and improving maintainability.

Editor Choice: A side-by-side Markdown editor (using Marked.js and DOMPurify) with toggleable view modes was chosen for the Notes app over a more complex Rich Text/WYSIWYG editor. This decision prioritized implementation speed, maintainability, and data portability (plain text) while still providing a powerful user experience.