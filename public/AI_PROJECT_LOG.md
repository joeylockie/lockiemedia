AI Project Curation Log: Lockie Media Platform
Last Updated: 2025-06-21 20:39 (EDT)

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

Task: Notes App UI/UX Enhancements & Bug Fixing

Summary: Attempted to fix several bugs and add new UI features to the Notes App. While initial bugs with the Markdown editor view modes were resolved, subsequent feature additions (collapsible sidebars) introduced critical regressions that left the Notes App in a non-functional state.

Details:

Initial Bug Fixes: Corrected logic in `notes_event_handlers.js` to fix Markdown editor view modes (editor-only, split-view, preview-only) and prevent text from disappearing when switching between them.

Resizable Split View: Successfully added a draggable resizer to the Markdown editor's split view.

Feature Implementation Attempt (Collapsible Sidebars): Modified `notes.html`, `style.css`, and `notes_event_handlers.js` to implement collapsible sidebars. This effort led to several regressions. The final state at the end of the session is non-working.

5. Current Focus / Next Steps (Specific to Current Major Task):
Current Major Task/Feature Being Worked On:

Name: Notes App - Critical Bug Fixes

Goal for this Task: Stabilize the Notes App by fixing the critical regressions introduced in the last session. The app is currently unusable.

Status: **INCOMPLETE / BLOCKED**

Current Sub-Task / Immediate Next Action:

Fix the `notes_event_handlers.js` file. The primary goal for the next session is to create a clean, working version of this file that correctly handles both the sidebar toggling and the Markdown features without conflict.

Proposed Plan for Next Session:
1. Re-implement the sidebar logic in `notes_event_handlers.js` using a simple, robust class-toggling mechanism that works with the latest CSS.
2. Verify and re-implement the Markdown toggle listener to ensure it was not removed and is functioning correctly.
3. Perform a full-system test of the Notes App (sidebar collapse/expand, Markdown toggle, view modes, resizer) to confirm all features work together.

Specific questions for AI (if any):

None.

Blockers (if any):

The current JavaScript logic in `public/notes_event_handlers.js` is flawed and has broken the application.

6. Known Issues / Bugs (Related to current work or recently discovered):
**CRITICAL:** none

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

Sidebar UI Pattern: Decided to move from a "disappearing" sidebar (`width: 0`) to a more robust "shrinking" sidebar pattern to prevent UI lockouts. The implementation of this pattern is currently the source of the critical bugs.