# LockieMedia Todo Application

## Project Overview

LockieMedia is a modern, feature-rich todo list application designed to provide users with a flexible and powerful tool for managing their tasks and projects. The application emphasizes a modular design, utilizing a feature flag system that allows for incremental feature rollouts and A/B testing. It aims to offer a comprehensive suite of tools to enhance productivity, from basic task tracking to more advanced features like different view modes (list, Kanban, calendar), project organization, and time management with a Pomodoro timer.

The application is built as a client-side web application, storing data locally in the user's browser, making it easy to get started without requiring a backend setup.

## Features

The application is designed with a wide range of features, managed via a feature flag system.

### Core Task Management:
* **Create, Edit, Delete Tasks**: Standard task management functionalities.
* **Due Dates & Times**: Assign due dates and specific times to tasks.
* **Priority Levels**: Categorize tasks by priority (High, Medium, Low).
* **Labels**: Add custom labels to tasks for better organization (e.g., Work, Personal).
* **Notes**: Add detailed notes to tasks.
* **Task Completion**: Mark tasks as complete or incomplete.
* **Smart Date Parsing**: Automatically parse dates from task descriptions (e.g., "Buy milk tomorrow").

### Advanced Features & Modules:

* **Feature Flag System**: Dynamically enable or disable features for testing and phased rollouts.
* **Projects**: Organize tasks into projects.
* **Sub-Tasks**: Break down complex tasks into smaller, manageable sub-tasks.
* **Multiple View Modes**:
    * **List View**: Traditional list display of tasks.
    * **Kanban Board**: Visualize tasks in columns (e.g., To Do, In Progress, Done) with drag-and-drop functionality.
    * **Calendar View**: (Planned/In-progress) View tasks on a calendar.
    * **Pomodoro Timer Hybrid**: (Planned/In-progress) Integrated Pomodoro timer to help users focus on tasks.
* **Reminders**: (Planned/In-progress) Set reminders for tasks.
* **Task Time Tracking / Timer System**: (Planned/In-progress) Estimate and track time spent on tasks.
* **Bulk Task Actions**: (Planned/In-progress) Perform actions (complete, delete, assign project, change priority, set label) on multiple tasks at once.
* **Data Export**: (Planned/In-progress) Export application data (tasks, projects, etc.) to a JSON file.
* **Theme Management**: Light and Dark mode support, respecting system preference and allowing user override.
* **Tooltips & Guide**: In-app guidance and tooltips for better usability.
* **Custom Backgrounds**: (Planned/In-progress) Allow users to customize the application background.
* **Search & Filtering**:
    * **Smart Views**: Predefined filters like Inbox, Today, Upcoming, Completed.
    * **Search**: Search tasks by title, label, notes, or project name.
    * **Sorting**: Sort tasks by due date, priority, or label.
* **Sidebar Navigation**: Collapsible sidebar for easy navigation between views and features.

### Planned Features (Potentially):
Based on the presence of feature flags and placeholder modules, the following features are likely planned or in early stages of development:
* **Advanced Recurrence**: For tasks that repeat on complex schedules.
* **File Attachments**: Attach files to tasks.
* **Integrations with other Services**: (e.g., Calendar).
* **User Accounts & Login**: For storing data in the cloud.
* **Collaboration & Sharing**: Share tasks and projects with others.
* **Cross-Device Sync**: Sync data across multiple devices.
* **Task Dependencies**: Define prerequisites for tasks.
* **Smarter Search**: More advanced search capabilities.

*(Note: The status "Planned/In-progress" for some features is inferred from the `features.json` file where their flags might be set to `false`, alongside the presence of dedicated JavaScript modules for them.)*

## Technology Stack

* **Frontend**:
    * HTML5
    * CSS3 (including Tailwind CSS for utility-first styling and custom styles in `style.css`)
    * JavaScript (ES6 Modules)
* **Data Storage**:
    * Browser LocalStorage is used for persisting application data (tasks, projects, feature flags, etc.).
* **Key Architectural Patterns & Libraries/Techniques**:
    * **Modular Design**: The application is broken down into various services and feature modules (e.g., `taskService.js`, `projectService.js`, `feature_*.js`).
    * **EventBus**: A simple publish/subscribe system (`eventBus.js`) is used for decoupled communication between modules.
    * **Feature Flag System**: Managed by `featureFlagService.js` and configured via `features.json` to enable/disable features dynamically.
    * **Single Page Application (SPA)**: Implied by the structure, with UI updates handled dynamically via JavaScript.
    * **Tailwind CSS**: For rapid UI development with utility classes.
    * **FontAwesome**: For icons.

## Setup and Installation

As this is a client-side application, setup is straightforward:

1.  **Clone the Repository (if applicable)**:
    ```bash
    git clone <repository-url>
    cd lockiemedia-background
    ```
    (If you've downloaded the files directly, navigate to the directory containing `todo.html`.)

2.  **Open in Browser**:
    * No compilation or build step is explicitly mentioned in the files.
    * Simply open the `todo.html` file in a modern web browser that supports ES6 modules (e.g., Chrome, Firefox, Edge, Safari).

    ```
    file:///path/to/your/lockiemedia-background/todo.html
    ```
    Or, if you are using a local web server (recommended for avoiding potential issues with file:// protocol and for features like `Workspace` for `features.json`):
    ```
    http://localhost:PORT/todo.html
    ```

3.  **Usage**:
    * The application should load, and you can start adding and managing your tasks.
    * Feature flags can be managed via the settings interface (if enabled) or by directly modifying the `features.json` file and `localStorage` (under `userFeatureFlags`).

## Running Locally

Ensure you are serving the files from a local web server if you encounter any issues with `Workspace` requests (e.g., for `features.json`). Many simple HTTP servers are available, for example, using Python:

```bash
# If you have Python 3.x
python -m http.server