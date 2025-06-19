# Lockie Media Platform

## Project Overview

The Lockie Media Platform is a modern, feature-rich **management platform** designed to provide users with a flexible and powerful tool for managing their tasks, projects, and other aspects of their personal and professional lives. The platform emphasizes a modular design, comprised of distinct "apps" (user-facing tools like the Task Manager) and "services" (administrative tools like the Admin Panel).

The platform has been refactored to be a self-hosted, single-user application using a Node.js backend with a robust SQLite database.

## Features

The platform is designed with a range of features, with a focus on core productivity tools.

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
* **Time Tracker App**: A separate app to track time spent on various activities.
* **Shopping List**: A smart view within the Task Manager dedicated to shopping items.
* **Search & Filtering**:
    * **Smart Views**: Predefined filters like Inbox, Today, Upcoming, Completed.
    * **Search**: Search tasks by title, label, notes, or project name.
    * **Sorting**: Sort tasks by due date, priority, or label.
* **Theme Management**: Light and Dark mode support.
* **Desktop Notifications**: For reminders and application alerts.
* **Data Versioning**: To track changes and potentially restore previous states of user data.

#### Planned Apps & Features:
* **Reminders**: Set reminders for tasks.
* **Bulk Task Actions**: Perform actions on multiple tasks at once.
* **Data Export/Import**: Export application data to a JSON file.
* **File Attachments**: Attach files to tasks, projects, or notes.
* **Task Dependencies**: Define prerequisites for tasks.

### Platform Services
* **Admin Panel**: A separate interface for application monitoring.
* **Advertising Admin**: A service for creating and managing internal ad campaigns displayed within the platform's apps.
* **Automation Service**: (Planned) A service for creating automated workflows to streamline tasks.

## Technology Stack

* **Backend**:
    * **Runtime**: Node.js
    * **Web Framework**: Express.js
    * **Database**: **SQLite** (via `better-sqlite3`)
* **Frontend**:
    * HTML5
    * CSS3 (including Tailwind CSS for utility-first styling and custom styles in `style.css`)
    * JavaScript (ES6 Modules)
* **Key Architectural Patterns & Libraries/Techniques**:
    * **Modular Design**: The platform is broken down into various services and feature modules (e.g., `taskService.js`, `projectService.js`, `advertisingService.js`).
    * **EventBus**: A simple publish/subscribe system (`eventBus.js`) is used for decoupled communication between modules.
    * **Single Page Application (SPA)**: Implied by the structure, with UI updates handled dynamically via JavaScript.
    * **Tailwind CSS**: For rapid UI development with utility classes.
    * **FontAwesome**: For icons.

## Setup and Installation

This is a self-hosted application.

1.  **Prerequisites**:
    * Node.js (v20.x or later recommended).
    * A local machine or server (like a Proxmox LXC container running Ubuntu) to host the application.

2.  **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd <repository-folder>
    ```

3.  **Install Dependencies**:
    * Navigate to the project's root directory (where `package.json` is located).
    * Run the following command to install required Node.js packages:
      ```bash
      npm install
      ```

4.  **Initialize the Database**:
    * Run the setup script to create the `lockiedb.sqlite` file and its tables. This only needs to be done once.
      ```bash
      npm run setup
      ```

5.  **Running the Server**:
    * From the root directory, start the server:
      ```bash
      node server.js
      ```
    * The server will typically be accessible at `http://<your-server-ip>:3000`.

6.  **Usage**:
    * Navigate to `http://<your-server-ip>:3000/dashboard.html` to access the main dashboard.