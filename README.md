# Lockie Media Platform

## Project Overview

The Lockie Media Platform is a modern, feature-rich **management platform** designed to provide users with a flexible and powerful tool for managing their tasks, projects, and other aspects of their personal and professional lives. The platform emphasizes a modular design, comprised of distinct "apps" (user-facing tools like the Task Manager) and "services" (administrative tools like the Admin Panel). This architecture allows for incremental feature rollouts and A/B testing.

The platform is built as a client-side web application, leveraging Firebase for backend services like authentication and data storage, ensuring data can be accessed and synced across devices for authenticated users, while also providing local fallbacks.

## Features

The platform is designed with a wide range of features, managed via a central feature flag system. It is composed of several core apps and services.

### Platform Apps

#### Core App: Task Manager
* **Task Management**:
    * Create, Edit, Delete Tasks.
    * Due Dates & Times.
    * Priority Levels (High, Medium, Low).
    * Labels for categorization.
    * Detailed Notes.
    * Task Completion tracking.
    * Smart Date Parsing (e.g., "Buy milk tomorrow").
* **Project Organization**:
    * Organize tasks into projects.
* **Sub-Tasks**: Break down complex tasks into smaller, manageable sub-tasks.
* **Advanced Recurrence**: For tasks and events that repeat on complex schedules.

#### Other Apps & Core Platform Features:
* **Notes App**: A dedicated module for richer note-taking and document organization.
* **Habit Tracker App**: A tool for building and tracking daily habits.
* **Time Tracker App**: Estimate and track time spent on tasks and activities.
* **Shopping List**: A smart view within the Task Manager dedicated to shopping items.
* **Feature Flag System**: Dynamically enable or disable features for testing and phased rollouts.
* **Multiple View Modes**:
    * **List View**: Traditional list display of tasks.
    * **Kanban Board**: Visualize tasks in columns (e.g., To Do, In Progress, Done) with drag-and-drop functionality.
* **Search & Filtering**:
    * **Smart Views**: Predefined filters like Inbox, Today, Upcoming, Completed.
    * **Search**: Search tasks by title, label, notes, or project name.
    * **Sorting**: Sort tasks by due date, priority, or label.
* **User Accounts & Cloud Sync**: Firebase authentication for user accounts and Firestore for cloud-based data storage and synchronization.
* **Theme Management**: Light and Dark mode support.
* **Desktop Notifications**: For reminders and application alerts.
* **Data Versioning**: To track changes and potentially restore previous states of user data.

#### Planned Apps & Features:
* **Calendar App**: View tasks and events on a full calendar.
* **Pomodoro App**: Integrated Pomodoro timer to help users focus on tasks.
* **Budget Planner App**: Simple tools for tracking income, expenses, or budgets.
* **Reminders**: Set reminders for tasks.
* **Bulk Task Actions**: Perform actions on multiple tasks at once.
* **Data Export/Import**: Export application data to a JSON file.
* **File Attachments**: Attach files to tasks, projects, or notes.
* **Integrations with other Services**: (e.g., Calendar, Cloud Storage).
* **Collaboration & Sharing**: Share tasks, projects, or other data modules with others.
* **Task Dependencies**: Define prerequisites for tasks.

### Platform Services
* **Admin Panel**: A separate interface for application monitoring, error log viewing, and feature flag management.
* **Advertising Admin**: A service for creating and managing internal ad campaigns displayed within the platform's apps.
* **Automation Service**: (Planned) A service for creating automated workflows to streamline tasks.

## Technology Stack

* **Frontend**:
    * HTML5
    * CSS3 (including Tailwind CSS for utility-first styling and custom styles in `style.css`)
    * JavaScript (ES6 Modules)
* **Backend & Data Storage**:
    * **Firebase Authentication**: For user sign-up, sign-in, and management.
    * **Firebase Firestore**: As the primary cloud database for storing user data (tasks, projects, preferences, profiles, etc.) and application configuration (feature flags, error logs).
    * **Browser LocalStorage**: Used as a fallback or for caching user preferences and non-sensitive data.
* **Key Architectural Patterns & Libraries/Techniques**:
    * **Modular Design**: The platform is broken down into various services and feature modules (e.g., `taskService.js`, `projectService.js`, `advertisingService.js`, `firebaseService.js`).
    * **EventBus**: A simple publish/subscribe system (`eventBus.js`) is used for decoupled communication between modules.
    * **Feature Flag System**: Managed by `featureFlagService.js` and configured via `features.json` (with Firestore override) to enable/disable features dynamically.
    * **Single Page Application (SPA)**: Implied by the structure, with UI updates handled dynamically via JavaScript.
    * **Tailwind CSS**: For rapid UI development with utility classes.
    * **FontAwesome**: For icons.

## Setup and Installation

As this is a client-side application leveraging Firebase for its backend:

1.  **Firebase Project Setup**:
    * Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
    * Enable Authentication (Email/Password provider).
    * Set up Firestore database.
    * Obtain your Firebase project configuration (apiKey, authDomain, etc.).
    * Update the `firebaseConfig` objects in `feature_user_accounts.js` and `admin_main.js` with your project's credentials.
    * Configure Firestore security rules appropriately (see project files or `AI_PROJECT_LOG.md` for examples related to `users` and `app_errors` collections).

2.  **Clone the Repository (if applicable)**:
    ```bash
    git clone <repository-url>
    cd lockiemedia-management-platform # Or your chosen directory name
    ```
    (If you've downloaded the files directly, navigate to the directory containing `todo.html` and `admin.html`.)

3.  **Open in Browser**:
    * No compilation or build step is explicitly required for the client-side code.
    * It is **highly recommended** to serve the files from a local web server to avoid issues with `file:///` protocol, especially for ES6 module loading and API interactions.
    * Example using Python's built-in server (ensure you are in the project's root directory):
      ```bash
      # If you have Python 3.x
      python -m http.server
      ```
    * Then, navigate to `http://localhost:8000/todo.html` (or the appropriate port) in your browser for the main Task Manager app, and `http://localhost:8000/admin.html` for the Admin Panel service.

4.  **Usage**:
    * The application should load, and you can start using its features. For cloud storage and full functionality, user sign-up/sign-in will be required.
    * Feature flags can be managed via the Admin Panel service (if an admin user is logged in) or by directly modifying the Firestore document at `app_config/feature_flags`, the `features.json` file (as a fallback), and `localStorage` (under `userFeatureFlags` for local overrides).

## Running Locally

Ensure you are serving the files from a local web server. Many simple HTTP servers are available. Using Python (as shown above) is one common method. Visual Studio Code's "Live Server" extension is another popular option for development.