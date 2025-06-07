# LockieMedia Personal and Business Management Service

## Project Overview

LockieMedia is envisioned as a modern, feature-rich **Personal and Business Management Service** designed to provide users with a flexible and powerful tool for managing their tasks, projects, and potentially other aspects of their personal and professional lives. The application emphasizes a modular design, utilizing a feature flag system that allows for incremental feature rollouts and A/B testing. It aims to offer a comprehensive suite of tools to enhance productivity, starting with robust task and project tracking, and expanding to include time management, reminders, and more advanced organizational capabilities.

The application is built as a client-side web application, leveraging Firebase for backend services like authentication and data storage, ensuring data can be accessed and synced across devices for authenticated users, while also providing local fallbacks.

## Features

The application is designed with a wide range of features, managed via a feature flag system. The initial focus is on task and project management, with plans to expand into broader personal and business management capabilities.

### Core Foundational Modules (Currently Task & Project Focused):
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

### Advanced Features & Modules (Existing or In Progress):

* **Feature Flag System**: Dynamically enable or disable features for testing and phased rollouts.
* **Multiple View Modes**:
    * **List View**: Traditional list display of tasks.
    * **Kanban Board**: Visualize tasks in columns (e.g., To Do, In Progress, Done) with drag-and-drop functionality.
    * **Calendar View**: (Planned/In-progress) View tasks on a calendar.
    * **Pomodoro Timer Hybrid**: (Planned/In-progress) Integrated Pomodoro timer to help users focus on tasks.
* **Reminders**: (Planned/In-progress) Set reminders for tasks.
* **Task Time Tracking / Timer System**: (Planned/In-progress) Estimate and track time spent on tasks.
* **Bulk Task Actions**: (Planned/In-progress) Perform actions (complete, delete, assign project, change priority, set label) on multiple tasks at once.
* **Data Export/Import**: (Planned/In-progress) Export application data (tasks, projects, etc.) to a JSON file, and potentially import.
* **Theme Management**: Light and Dark mode support, respecting system preference and allowing user override.
* **Tooltips & Guide**: In-app guidance and tooltips for better usability.
* **Custom Backgrounds**: (Planned/In-progress) Allow users to customize the application background.
* **Search & Filtering**:
    * **Smart Views**: Predefined filters like Inbox, Today, Upcoming, Completed.
    * **Search**: Search tasks by title, label, notes, or project name.
    * **Sorting**: Sort tasks by due date, priority, or label.
* **Sidebar Navigation**: Collapsible sidebar for easy navigation between views and features.
* **User Accounts & Cloud Sync**: Firebase authentication for user accounts and Firestore for cloud-based data storage and synchronization.
* **Desktop Notifications**: For reminders and application alerts.
* **Data Versioning**: To track changes and potentially restore previous states of user data.
* **Admin Panel**: A separate interface for application monitoring, error log viewing, and feature flag management.

### Planned Expansion for Personal & Business Management:
As the service evolves, features will be expanded to cover more aspects of personal and business organization, potentially including:
* **Advanced Recurrence**: For tasks and events that repeat on complex schedules.
* **File Attachments**: Attach files to tasks, projects, or notes.
* **Integrations with other Services**: (e.g., Calendar, Cloud Storage).
* **Collaboration & Sharing**: Share tasks, projects, or other data modules with others.
* **Task Dependencies**: Define prerequisites for tasks.
* **Smarter Search**: More advanced search capabilities across all modules.
* **CRM Features**: Basic contact and client management.
* **Notes & Document Management**: A dedicated module for richer note-taking and document organization.
* **Financial Tracking**: Simple tools for tracking income, expenses, or budgets.
* **Goal Setting & Habit Tracking**.

*(Note: The status "Planned/In-progress" for some features is inferred from the `features.json` file where their flags might be set to `false`, alongside the presence of dedicated JavaScript modules for them.)*

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
    * **Modular Design**: The application is broken down into various services and feature modules (e.g., `taskService.js`, `projectService.js`, `feature_*.js`, `firebaseService.js`).
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
    cd lockiemedia-management-service # Or your chosen directory name
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
    * Then, navigate to `http://localhost:8000/todo.html` (or the appropriate port) in your browser for the main service, and `http://localhost:8000/admin.html` for the admin panel.

4.  **Usage**:
    * The application should load, and you can start using its features. For cloud storage and full functionality, user sign-up/sign-in will be required.
    * Feature flags can be managed via the Admin Panel (if an admin user is logged in) or by directly modifying the Firestore document at `app_config/feature_flags`, the `features.json` file (as a fallback), and `localStorage` (under `userFeatureFlags` for local overrides).

## Running Locally

Ensure you are serving the files from a local web server. Many simple HTTP servers are available. Using Python (as shown above) is one common method. Visual Studio Code's "Live Server" extension is another popular option for development.