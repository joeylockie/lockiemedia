AI Project Curation Log: LockieMedia Personal and Business Management Service
Last Updated: 2025-06-14 08:29 (EDT) ##

Instructions for AI (Gemini)
Purpose of this Document: This document is your primary source of truth for the LockieMedia Personal and Business Management Service project. It provides context, tracks progress, outlines current tasks, and lists future goals. Please refer to it to understand:

The overall project scope.

What has already been completed.

What the user (Joey) is currently working on with your assistance.

The specific sub-tasks and files involved in the current session.

Any known issues or important decisions made.

How to Use & Update This Document: * Prioritize this Document: When the user provides this document or refers to it at the start of a session, consider its content as the most up-to-date information, potentially overriding previous chat history if there are discrepancies regarding project state.

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

Project Overview & Goals:
Application: "LockieMedia Personal and Business Management Service" and an accompanying "Admin Panel".
Vision: To become an all-in-one personal and business management service.
Technology: Client-side HTML, CSS (Tailwind), JavaScript (ES6 Modules), Firebase (Auth & Firestore - Compat SDK v8 style) for backend.
Core Service Features (Initial Focus): Task management (CRUD, due dates, priority, labels, notes), project organization, time management tools, feature flag system, modular services. Data stored in Firebase for authenticated users, with local fallbacks.
Admin Panel Core: Separate HTML page (admin.html) using the same Firebase backend. Provides insights and monitoring for the Service. Includes admin authentication, display of error logs from Firestore, and read-only view of feature flags.
Overall Goal: Develop a robust, feature-complete Personal and Business Management Service with a functional Admin Panel for application monitoring and management insights.

Current Major Task/Feature Being Worked On:
Name: Main Service - New Feature Scaffolding
Goal for this Task: Create placeholder pages for upcoming features to expand the application's scope.
Status: In Progress

Work Completed (Overall Project - High Level):
LockieMedia Service (Main Application):
Core task management functionalities implemented as a foundational module.
Feature flag system (featureFlagService.js, features.json) established.
Modular architecture with services for logging, events, view management, tasks, projects, labels, etc.
Firebase integration for user authentication and data persistence (tasks, projects, preferences, profile with roles) via firebaseService.js and store.js.
Client-side error logging to console and Firestore via loggingService.js.
Critical bug fixes related to feature flag interpretation, UI rendering timing (version display, smart button styling), and module exports implemented.
Performance logging implemented to capture and send app load times to Firestore.
Advanced Recurrence Feature: Fully implemented with custom intervals, specific day selection for weeks, and end dates.
Shopping List Feature: Fully implemented as a new Smart View.
Admin Panel:
Initial setup and core features, including enhanced logging and testing capabilities.
Key metric widgets are now functional, including Avg. Load Time and API Errors (1hr).

Work Completed (Specific to Current Major Task):
Date: 2025-06-02
Created admin.html and foundational Admin Panel JavaScript files.
Enhanced loggingService.js to send ERROR and CRITICAL logs to Firestore.
Implemented functional Admin login and display of Feature Flags and Error Logs.
Date: 2025-06-03
Resolved multiple bugs related to UI rendering and feature flag interpretation in the main service.
Updated AI_PROJECT_LOG.md to reflect the project's rebranding.
Date: 2025-06-07
Implemented "Avg. Load Time" and "API Errors (1hr)" widgets in the Admin Panel.
Date: 2025-06-08
Implemented the Advanced Recurrence feature and the new "Shopping List" feature.
Date: 2025-06-14 (Current Session)
Scaffolded placeholder pages for new features to expand the application's scope.
Created habits.html with a visual layout inspired by the provided reference image.
Created notes.html with a three-column layout for notebooks, note lists, and a note editor.
Created time-tracker.html styled similarly to the main to-do application.
Updated index.html to include links to the new notes.html, habits.html, and time-tracker.html pages.

Current Focus / Next Steps (Specific to Current Major Task):
Current Sub-Task: The placeholder pages for Notes, Habit Tracking, and Time Tracking are complete.
Immediate Next Action: Begin the backend and logical integration for one of the new features. A good starting point would be the Notes Feature. This would involve:
Creating noteService.js and feature_notes.js modules.
Updating store.js to manage a _notes array and a _notebooks array.
Integrating the new view/logic into main.js.
Creating new feature flags for these features in features.json.
Specific questions for AI (if any):
None.
Blockers (if any):
None.

Known Issues / Bugs (Related to current work or recently discovered):
Potential Setup Step: The queries for performance metrics and error counts in the admin panel rely on a composite index in Firestore. The first time the admin panel is loaded, an error message may appear in the browser console with a link to create the necessary index in the Firebase Console. This is expected behavior.
Minor Warning (Understood/Expected): [ProjectsFeature] Cannot populate project filter list. Dependencies missing. - This occurs because the projectFeature is currently disabled in features.json.
Minor Warning (Understood/Expected): [ModalEventHandlers] Element #openFeatureFlagsModalBtn not found. - This button ID is not present in the todo.html markup.

Future/Pending Work (Overall Project - High Level):
Admin Panel:
Flesh out User Management (view details, potentially disable users - requires careful rule changes).
Implement all Overview Stats.
Implement A/B Testing stats display section.
Improve the "Details" view for individual error logs beyond a simple alert().
LockieMedia Service (Main Application):
Complete and refine other foundational features like Calendar View, Pomodoro Timer, Sub-tasks, Task Dependencies, Reminders, File Attachments, etc. (as per features.json and README).
Expand Scope: Plan and implement new modules appropriate for a Personal and Business Management Service. This could include areas like:
Basic CRM (contact management).
Enhanced Notes/Document Management.
Simple Finance Tracking (income/expense logging).
Goal Setting and Tracking.
Habit Tracking.
Address any UI/UX improvements.

Important Notes / Decisions Made:
Recurrence Logic: Decided to use the "template" model for recurring tasks. When a recurring task is completed, it is not archived but instead has its due date advanced and its completed status reset to false, unless an endDate is set and has been surpassed.
"API Error Rate" Re-scoped: The widget was changed to "API Errors (1hr)" to show a raw count of recent errors. This was more feasible than calculating a true "rate," which would require logging every successful API call.
Performance Metrics: A new performance_metrics collection has been introduced in Firestore to store application load time data.
Admin-Only UI Elements: A new class, admin-only-feature-element, has been established to control the visibility of UI components that should only be seen by administrators.
Project Rebranding: The project is now known as the "LockieMedia Personal and Business Management Service" to reflect a broader scope beyond a simple todo list.
Admin role is defined in Firestore at users/{uid}/appData/userSpecificData within a profile map, as profile: { role: "admin" }.
Feature flags are intended to be read-only in the current iteration of the admin panel (manual changes to Firestore app_config/feature_flags or features.json still needed for modification by admin, unless setFeatureFlag in featureFlagService.js is enhanced for admin writes to Firestore, which it now does).
Error logs are stored in the app_errors Firestore collection.
The project uses the Firebase JavaScript SDK (Compat version - v8 style syntax).
The Admin Panel is a separate HTML page (admin.html) but shares Firebase configuration and some services (logging, feature flags) with the main Service.
loggingService.js has been enhanced to send more detailed logs to Firestore for ERROR and CRITICAL levels.
A "Send Test Error" button was added to admin.html and corresponding logic to admin_main.js to test the error logging pipeline.
Corrected Firestore security rule for app_errors to allow admins to read based on the correct path: get(/databases/(database)/documents/users/(request.auth.uid)/appData/userSpecificData).data.profile.role == 'admin'.