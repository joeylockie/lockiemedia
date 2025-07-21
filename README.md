# LockieMedia Productivity Hub

A comprehensive, client-side productivity application designed to help you organize your life. This application runs entirely in your web browser, using the powerful IndexedDB database to save all your data securely and efficiently on your own computer.

## Features

* **Dashboard**: A central hub providing an at-a-glance overview of your day, including tasks, upcoming events, and tracked time.
* **Task Manager**: A powerful to-do list with support for due dates, projects, labels, and priorities.
* **Notes**: A simple and effective note-taking application.
* **Habit Tracker**: A tool to build and maintain good habits with visual tracking.
* **Time Tracker**: Log time spent on different activities to understand your workflow.
* **Calendar**: Visualize your tasks and events in a monthly calendar view.

## Tech Stack

This project is built with a focus on simplicity and performance, using fundamental web technologies:

* **Vanilla JavaScript (ES6 Modules)**: No frameworks, just modern JavaScript for all application logic.
* **HTML5**: For structuring the content and application views.
* **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
* **IndexedDB**: A powerful, scalable, browser-based database for all user data persistence.
* **Dexie.js**: A minimalist wrapper library that makes IndexedDB easy and enjoyable to use.

## Getting Started

Getting started is as simple as possible.

### Option 1: Run Locally

1.  Clone or download this repository to your local machine.
2.  Open the `index.html` file in a modern web browser (like Chrome, Firefox, or Edge).

That's it! The application will run, and your data will be saved automatically to that browser's IndexedDB database.

### Option 2: Deploy to a Static Host

You can deploy the project files to any static web hosting service, such as:

* GitHub Pages
* Netlify
* Vercel
* AWS S3

No special configuration is needed.

## Data Management

* **Backup**: You can back up all your data by clicking the "Download Backup" button on the dashboard. This will save a `.json` file containing all your information.
* **Restore**: A restore feature has not yet been implemented. To restore from a backup, you would need to manually import the data using your browser's developer tools.