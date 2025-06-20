# Lockie Media Platform

## Project Overview

The Lockie Media Platform is a modern, feature-rich **management platform** designed to provide users with a flexible and powerful tool for managing their tasks, projects, and other aspects of their personal and professional lives.

The platform is built on a **microservice architecture**, where independent backend services for each application (e.g., Tasks, Notes) are managed by a central API Gateway. This architecture ensures the application is robust, scalable, and easy to maintain.

## Features

The platform is designed with a range of features, with a focus on core productivity tools.

### Platform Apps & Core Features

* **Task Management**: Create, Edit, Delete Tasks, Due Dates & Times, Priority Levels, Labels, Detailed Notes, Task Completion tracking, and Smart Date Parsing.
* **Project Organization**: Organize tasks into projects.
* **Advanced Recurrence**: For tasks and events that repeat on complex schedules.
* **Notes App**: A dedicated module for richer note-taking and document organization.
* **Habit Tracker App**: A tool for building and tracking daily habits.
* **Time Tracker App**: A separate app to track time spent on various activities.
* **Shopping List**: A smart view within the Task Manager dedicated to shopping items.
* **Search & Filtering**: Predefined Smart Views, search by title, label, etc., and sorting options.
* **Theme Management**: Light and Dark mode support.
* **Desktop Notifications**: For reminders and application alerts.

### Planned Apps & Features

* **Reminders**: Set reminders for tasks.
* **Bulk Task Actions**: Perform actions on multiple tasks at once.

## Technology Stack & Architecture

### System Architecture

* **Microservice Architecture**: The backend is composed of several independent Node.js services managed by **PM2**.
* **API Gateway**: A central Express.js application that acts as the single entry point for the frontend. It routes requests to the appropriate microservice and uses an **API Composition** pattern to aggregate data.

### Backend Services

* **Runtime**: Node.js
* **Web Framework**: Express.js
* **Database**: **SQLite** (via `better-sqlite3`), shared across services.
* **Process Manager**: **PM2**

### Frontend

* HTML5
* CSS3 (including Tailwind CSS for utility-first styling)
* JavaScript (ES6 Modules) - Vanilla JS, no frameworks.

## Setup and Installation

This is a self-hosted application designed to run on a local server or container.

1.  **Prerequisites**:
    * Node.js (v20.x or later recommended).
    * A local machine or server (like a Proxmox LXC container running Ubuntu) to host the application.
    * **PM2** installed globally: `npm install pm2 -g`

2.  **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd <repository-folder>
    ```

3.  **Install Dependencies**:
    * Dependencies must be installed for the root project AND for each individual service.
    * **Root:** `npm install`
    * **API Gateway:** `cd services/api-gateway && npm install && cd ../..`
    * **Notes Service:** `cd services/notes-service && npm install && cd ../..`
    * **Task Service:** `cd services/task-service && npm install && cd ../..`
    * **Time Tracker Service:** `cd services/time-tracker-service && npm install && cd ../..`

4.  **Initialize the Database**:
    * Run the setup script from the root directory to create the `lockiedb.sqlite` file and its tables. This only needs to be done once.
        ```bash
        npm run setup
        ```

5.  **Running the Platform**:
    * The entire suite of backend services is managed by the `ecosystem.json` file.
    * From the project's root directory, start all services with:
        ```bash
        pm2 start ecosystem.json
        ```
    * To ensure the apps restart automatically after a server reboot, run:
        ```bash
        pm2 save
        ```

6.  **Usage & Monitoring**:
    * **Access**: The application is accessible via the API Gateway's port, typically `http://<your-server-ip>:3000/dashboard.html`.
    * **Check Status**: To see the status of all running services: `pm2 status`
    * **View Logs**: To view the combined logs for all services: `pm2 logs`
    * **Restart All**: To apply changes after a `git pull`: `pm2 restart all`