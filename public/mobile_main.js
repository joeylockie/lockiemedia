// mobile_main.js
// Entry point for the lightweight PWA mobile application.

import AppStore from './store.js';
import EventBus from './eventBus.js';
import LoggingService from './loggingService.js';

// --- PWA Service Worker Registration ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered: ', registration);
        LoggingService.info('[MobileMain] Service Worker registered successfully.', { scope: registration.scope });
      })
      .catch(error => {
        console.error('Service Worker registration failed: ', error);
        LoggingService.error('[MobileMain] Service Worker registration failed.', error);
      });
  });
}


// --- DOM Elements ---
let inboxTaskList;
let syncStatus;
let syncStatusIcon;
let syncStatusText;

/**
 * Renders the list of inbox tasks.
 */
function renderInboxTasks() {
    if (!inboxTaskList) return;

    const allTasks = AppStore.getTasks() || [];
    const shoppingLabels = ['shopping', 'buy', 'store'];

    // Filter for inbox tasks: not completed and not a shopping list item.
    const inboxTasks = allTasks.filter(task => 
        !task.completed && 
        (!task.label || !shoppingLabels.includes(task.label.toLowerCase()))
    );

    // Sort by creation date, newest first
    inboxTasks.sort((a, b) => (b.creationDate || 0) - (a.creationDate || 0));

    inboxTaskList.innerHTML = ''; // Clear the list

    if (inboxTasks.length === 0) {
        inboxTaskList.innerHTML = `<li class="text-center text-slate-400 p-8">Inbox is empty!</li>`;
        return;
    }

    inboxTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item p-4 rounded-lg flex items-center justify-between shadow-md priority-${task.priority || 'medium'}`;
        
        const textSpan = document.createElement('span');
        textSpan.className = 'text-slate-100';
        textSpan.textContent = task.text;

        li.appendChild(textSpan);
        inboxTaskList.appendChild(li);
    });
}

/**
 * Updates the visual sync status indicator.
 * @param {boolean} isOnline - Whether the application is connected to the server.
 * @param {string} [message] - An optional message to display.
 */
function updateSyncStatus(isOnline, message) {
    if (!syncStatus || !syncStatusIcon || !syncStatusText) return;

    if (isOnline) {
        syncStatusIcon.className = 'fas fa-circle text-green-400';
        syncStatusText.textContent = message || 'Online';
    } else {
        syncStatusIcon.className = 'fas fa-circle text-red-400';
        syncStatusText.textContent = message || 'Offline';
    }
}


/**
 * Main initialization function for the mobile app.
 */
async function initializeMobileApp() {
    LoggingService.info('[MobileMain] Initializing mobile application...');

    // Get DOM elements
    inboxTaskList = document.getElementById('inboxTaskList');
    syncStatus = document.getElementById('syncStatus');
    if (syncStatus) {
        syncStatusIcon = syncStatus.querySelector('i');
        syncStatusText = syncStatus.querySelector('span');
    }

    try {
        // Initialize the store to get data from the backend
        await AppStore.initializeStore();
        LoggingService.info('[MobileMain] Data successfully loaded from server.');
        
        // Initial render
        renderInboxTasks();
        updateSyncStatus(true, 'Synced');

        // Subscribe to future task changes
        EventBus.subscribe('tasksChanged', renderInboxTasks);

    } catch (error) {
        LoggingService.critical('[MobileMain] Could not initialize app data.', error);
        if (inboxTaskList) {
            inboxTaskList.innerHTML = `<li class="text-center text-red-400 p-8">Could not load data. Check server connection.</li>`;
        }
        updateSyncStatus(false, 'No Connection');
    }
}

// --- App Start ---
document.addEventListener('DOMContentLoaded', initializeMobileApp);