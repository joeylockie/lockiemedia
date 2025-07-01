Lockie Media Platform
Project Overview
The Lockie Media Platform is a modern, feature-rich management platform designed to provide users with a flexible and powerful tool for managing their tasks, projects, and other aspects of their personal and professional lives.

The platform is built on a microservice architecture, where independent backend services for each application (e.g., Tasks, Notes) are managed by a central API Gateway. This architecture ensures the application is robust, scalable, and easy to maintain, and **supports separate development and production environments for safe feature development.**

Features
The platform is designed with a range of features, with a focus on core productivity tools.

Platform Apps & Core Features
Task Management: Create, Edit, Delete Tasks, Due Dates & Times, Priority Levels, Labels, Detailed Notes, Task Completion tracking, and Smart Date Parsing.

Notes App: A dedicated module for note-taking.

Markdown Editor: A full-featured, side-by-side Markdown editor with live preview and different view modes (editor-only, preview-only, split view).

Notebooks: Organize notes into separate notebooks, which can be created and deleted.

Project Organization: Organize tasks into projects.

Advanced Recurrence: For tasks that repeat on complex schedules.

Habit Tracker App: A tool for building and tracking daily habits.

Time Tracker App: A separate app to track time spent on various activities.

Shopping List: A smart view within the Task Manager dedicated to shopping items.

Search & Filtering: Predefined Smart Views, search by title, label, etc., and sorting options.

Theme Management: Light and Dark mode support.

Desktop Notifications: For task reminders and application alerts.

Planned Apps & Features
Reminders: Set reminders for tasks.

Bulk Task Actions: Perform actions on multiple tasks at once.

Technology Stack & Architecture
System Architecture
Microservice Architecture: The backend is composed of several independent Node.js services managed by PM2.

API Gateway: A central Express.js application that acts as the single entry point for the frontend. It routes requests to the appropriate microservice and uses an API Composition pattern to aggregate data.

Backend Services
Runtime: Node.js

Web Framework: Express.js

Database: SQLite (via better-sqlite3), shared across services, with **database file path configurable via environment variables.**

Process Manager: PM2

Frontend
HTML5

CSS3 (including Tailwind CSS for utility-first styling)

JavaScript (ES6 Modules) - Vanilla JS, no frameworks.

Markdown Parsing: Marked.js and DOMPurify.

Setup and Installation
This is a self-hosted application designed to run on a local server or container.

Prerequisites:

* Node.js (v20.x or later recommended).
    * **For Ubuntu/Debian, the recommended way to install Node.js and npm is via NodeSource PPA:**
        ```bash
        sudo apt-get update
        sudo apt-get install -y curl # Install curl if you don't have it
        curl -fsSL [https://deb.nodesource.com/setup_20.x](https://deb.nodesource.com/setup_20.x) | sudo -E bash -
        sudo apt-get install -y nodejs
        ```
* A local machine or server (like a Proxmox LXC container running Ubuntu) to host the application.
* PM2 installed globally: `npm install pm2 -g`

Clone the Repository:

Clone your repository from GitHub.
* **For your Development Environment**: Clone the `dev` branch.
    ```bash
    git clone -b dev <repository-url.git> <local-dev-folder-name>
    cd <local-dev-folder-name>
    ```
    * Example: `git clone -b dev https://github.com/joeylockie/lockiemedia.git /root/lockiemedia-dev`
* **For your Production Environment**: Clone the `main` branch.
    ```bash
    git clone -b main <repository-url.git> <local-prod-folder-name>
    cd <local-prod-folder-name>
    ```
    * Example: `git clone -b main https://github.com/joeylockie/lockiemedia.git /root/lockiemedia`

**Important**: Your environment-specific configuration files (`ecosystem.dev.json`, `ecosystem.prod.json`) are not tracked by Git. Your frontend's `API_URL` and favicon link are also environment-specific. When merging changes from `dev` to `main`, you must resolve conflicts for `public/store.js` and HTML files by **keeping the `main` branch's version.**

Install Dependencies:

Dependencies must be installed for the root project AND for each individual service.

```bash
# From your project's root directory (e.g., /root/lockiemedia-dev or /root/lockiemedia)
npm install

# For each service:
cd services/api-gateway && npm install && cd ../..
cd services/notes-service && npm install && cd ../..
cd services/task-service && npm install && cd ../..
cd services/time-tracker-service && npm install && cd ../..
cd services/dev-tracker-service && npm install && cd ../..
cd services/calendar-service && npm install && cd ../..