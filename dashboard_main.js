import LoggingService from './loggingService.js';
import EventBus from './eventBus.js';
import AppStore from './store.js';
import * as TaskService from './taskService.js';
import * as NoteService from './noteService.js';
import HabitTrackerService from './habitTrackerService.js';
import TimeTrackerService from './timeTrackerService.js';
import { formatDate, formatMillisecondsToHMS } from './utils.js';
import db from './database.js';
import Dexie from './dexie.mjs';
import { initializeVersionChecker } from './versionService.js';
import { CentralNotificationService } from './centralNotificationService.js';

// --- DOM Element References ---
let greetingHeader, myDayContent, habitContent, timeTrackerContent, upcomingContent, notesContent, quickLinksContent, exportDataBtn, importDataBtn, importFileInput;
let testNotificationsBtn;
let timeTrackerInterval = null;

// --- Helper Functions to Get Data ---

function getDashboardData() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allTasks = AppStore.getTasks() || [];

    const overdueTasks = allTasks.filter(task => {
        if (task.completed || !task.dueDate) return false;
        const taskDueDate = new Date(task.dueDate + 'T00:00:00');
        return taskDueDate < today;
    });

    const todayTasks = allTasks.filter(task => {
        if (task.completed || !task.dueDate) return false;
        const taskDueDate = new Date(task.dueDate + 'T00:00:00');
        return taskDueDate.getTime() === today.getTime();
    });

    const upcomingTasks = allTasks.filter(task => {
        if(task.completed || !task.dueDate) return false;
        const taskDueDate = new Date(task.dueDate + 'T00:00:00');
        const sevenDaysFromToday = new Date(today);
        sevenDaysFromToday.setDate(today.getDate() + 7);
        return taskDueDate > today && taskDueDate <= sevenDaysFromToday;
    }).sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));

    const recentNotes = (NoteService.getNotes() || [])
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 3);

    return { overdueTasks, todayTasks, upcomingTasks, recentNotes };
}

/**
 * Handles exporting all user data from the IndexedDB into a downloadable JSON file.
 */
async function handleExportDataClientSide() {
    LoggingService.info('[Dashboard] Database export initiated by user.');

    try {
        const allData = {};
        await db.transaction('r', db.tables, async () => {
            for (const table of db.tables) {
                allData[table.name] = await table.toArray();
            }
        });

        const jsonString = JSON.stringify(allData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;

        const date = new Date();
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        a.download = `lockiemedia_backup_${dateString}.json`;

        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        EventBus.publish('displayUserMessage', { text: 'Backup downloaded successfully!', type: 'success' });

    } catch (err) {
        LoggingService.error('Could not export database data.', err, { functionName: 'handleExportDataClientSide' });
        alert('Could not export your data. Please check the console for errors.');
    }
}


/**
 * Handles importing data from a JSON file and restoring it to the IndexedDB.
 */
async function handleImportData(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!confirm('Warning: Importing a backup will completely overwrite all current data. This action cannot be undone. Are you sure you want to continue?')) {
        importFileInput.value = ''; // Reset the file input
        return;
    }

    LoggingService.info('[Dashboard] Database import initiated by user.');
    const reader = new FileReader();

    reader.onload = async (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            
            await db.transaction('rw', db.tables, async () => {
                const clearPromises = db.tables.map(table => table.clear());
                await Promise.all(clearPromises);
                LoggingService.info('[Dashboard] All tables cleared for import.');

                const importPromises = [];
                for (const tableName in importedData) {
                    if (db.table(tableName)) {
                        importPromises.push(db.table(tableName).bulkAdd(importedData[tableName]));
                    }
                }
                await Promise.all(importPromises);
                LoggingService.info('[Dashboard] Bulk data import complete.');
            });

            await AppStore.initializeStore();
            
            alert('Data imported successfully! The application will now reload.');
            location.reload();

        } catch (err) {
            LoggingService.error('Could not import data.', err, { functionName: 'handleImportData' });
            alert('Could not import your data. The file may be corrupted or in the wrong format. Please check the console for errors.');
        } finally {
            importFileInput.value = '';
        }
    };

    reader.readAsText(file);
}


// --- Rendering Functions ---

function renderGreeting() {
    const profile = AppStore.getUserProfile();
    const displayName = profile?.displayName?.split(' ')[0] || 'there';
    const hour = new Date().getHours();
    let greeting = "Welcome";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    else greeting = "Good evening";

    if (greetingHeader) {
        greetingHeader.textContent = `${greeting}, ${displayName}!`;
    }
}

function renderMyDayWidget() {
    if (!myDayContent) return;
    const { overdueTasks, todayTasks } = getDashboardData();

    myDayContent.innerHTML = '';

    if (overdueTasks.length === 0 && todayTasks.length === 0) {
        myDayContent.innerHTML = '<p class="text-slate-400">Nothing due today. You\'re all caught up!</p>';
        return;
    }

    if (overdueTasks.length > 0) {
        const overdueHeader = document.createElement('h3');
        overdueHeader.className = 'text-sm font-semibold text-red-400 mb-1';
        overdueHeader.textContent = 'Overdue';
        myDayContent.appendChild(overdueHeader);
        overdueTasks.forEach(task => myDayContent.appendChild(createTaskRow(task)));
    }

    if (todayTasks.length > 0) {
        const todayHeader = document.createElement('h3');
        todayHeader.className = 'text-sm font-semibold text-sky-400 mt-3 mb-1';
        todayHeader.textContent = 'Today';
        myDayContent.appendChild(todayHeader);
        todayTasks.forEach(task => myDayContent.appendChild(createTaskRow(task)));
    }
}

function renderUpcomingWidget() {
    if (!upcomingContent) return;
    const { upcomingTasks } = getDashboardData();
    upcomingContent.innerHTML = '';

    if (upcomingTasks.length === 0) {
        upcomingContent.innerHTML = '<p class="text-slate-400">No tasks due in the next 7 days.</p>';
        return;
    }

    const list = document.createElement('ul');
    list.className = 'space-y-2';
    upcomingTasks.forEach(task => {
          const li = document.createElement('li');
          li.className = 'text-sm text-slate-300 flex justify-between items-center';
          li.innerHTML = `
                <span>${task.text}</span>
                <span class="text-xs text-slate-400">${formatDate(task.dueDate)}</span>
          `;
          list.appendChild(li);
    });
    upcomingContent.appendChild(list);
}

function renderNotesWidget() {
    if (!notesContent) return;
    const { recentNotes } = getDashboardData();
    notesContent.innerHTML = '';

      if (recentNotes.length === 0) {
        notesContent.innerHTML = '<p class="text-slate-400 text-sm">No recent notes.</p>';
        return;
    }

    const list = document.createElement('ul');
    list.className = 'space-y-3';
    recentNotes.forEach(note => {
        const li = document.createElement('li');
        li.className = 'text-sm text-slate-300 hover:text-sky-400 transition-colors cursor-pointer';
        li.textContent = note.title;
        li.onclick = () => window.location.href = 'notes.html';
        list.appendChild(li);
    });
    notesContent.appendChild(list);
}

function renderHabitWidget() {
    if (!habitContent) return;

    const habits = AppStore.getHabits();
    const completions = AppStore.getHabitCompletions();
    const todayString = new Date().toISOString().split('T')[0];

    habitContent.innerHTML = '';
    if (habits.length === 0) {
        habitContent.innerHTML = '<p class="text-slate-400 text-sm">No habits configured.</p>';
        return;
    }

    habits.forEach(habit => {
        const todaysCompletion = completions.find(c => c.habit_id === habit.id && c.completedAt === todayString);
        const isCompletedToday = todaysCompletion && todaysCompletion.completion_count >= (habit.target_count || 1);
        habitContent.appendChild(createHabitRow(habit, isCompletedToday));
    });
}

async function renderTimeTrackerWidget() {
    if (!timeTrackerContent) return;
    if (timeTrackerInterval) clearInterval(timeTrackerInterval);

    const activeTimers = TimeTrackerService.getActiveTimers();

    if (activeTimers.length > 0) {
        const activeTimer = activeTimers[0]; // Display the first active timer on dashboard
        const activity = (TimeTrackerService.getActivities() || []).find(a => a.id === activeTimer.activityId);
        timeTrackerContent.innerHTML = `
              <p class="text-sm text-slate-400">Currently Tracking:</p>
              <p class="font-semibold text-slate-100 truncate">${activity ? activity.name : '...'}</p>
              <p id="dashboardLiveTimer" class="text-2xl font-mono font-bold text-sky-300 mt-2">00:00:00</p>
        `;
        const timerDisplay = document.getElementById('dashboardLiveTimer');
        const updateTime = () => {
            const elapsedMs = Date.now() - new Date(activeTimer.startTime).getTime();
            if (timerDisplay) timerDisplay.textContent = formatMillisecondsToHMS(elapsedMs);
        };
        timeTrackerInterval = setInterval(updateTime, 1000);
        updateTime();
    } else {
        const totalMs = await TimeTrackerService.getTodaysTotalTrackedMs();
        timeTrackerContent.innerHTML = `
              <p class="text-sm text-slate-400">Time Tracked Today:</p>
              <p class="text-3xl font-bold text-slate-100 mt-2">${formatMillisecondsToHMS(totalMs)}</p>
        `;
    }
}


function renderQuickLinksWidget() {
    if (!quickLinksContent) return;

    const links = [
        { href: 'tasks.html', icon: 'fa-check-double', title: 'Task Manager', color: 'text-sky-400' },
        { href: 'notes.html', icon: 'fa-sticky-note', title: 'Notes', color: 'text-amber-400' },
        { href: 'habits.html', icon: 'fa-calendar-check', title: 'Habit Tracker', color: 'text-green-400' },
        { href: 'time-tracker.html', icon: 'fa-clock', title: 'Time Tracker', color: 'text-indigo-400' },
        { href: 'calendar.html', icon: 'fa-calendar-alt', title: 'Calendar', color: 'text-teal-400' }
    ];

    quickLinksContent.innerHTML = '';

    links.forEach(link => {
        const linkEl = document.createElement('a');
        linkEl.href = link.href;
        linkEl.className = 'block p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 hover:ring-2 hover:ring-purple-500 transition-all duration-200';
        linkEl.innerHTML = `
              <div class="flex items-center">
                  <i class="fas ${link.icon} w-6 mr-3 ${link.color}" style="font-size: 1.25rem;"></i>
                  <h3 class="font-semibold text-slate-100">${link.title}</h3>
              </div>
        `;
        quickLinksContent.appendChild(linkEl);
    });
}


function createTaskRow(task) {
    const taskRow = document.createElement('div');
    taskRow.className = 'flex items-center p-2 rounded-md hover:bg-slate-700 transition-colors';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'form-checkbox h-5 w-5 text-sky-500 rounded border-slate-500 focus:ring-sky-400 mr-3 cursor-pointer flex-shrink-0';
    checkbox.onchange = () => {
        TaskService.toggleTaskComplete(task.id);
    };

    const taskText = document.createElement('span');
    taskText.className = 'text-slate-300 flex-grow';
    taskText.textContent = task.text;

    taskRow.appendChild(checkbox);
    taskRow.appendChild(taskText);
    return taskRow;
}

function createHabitRow(habit, isCompleted) {
    const habitRow = document.createElement('div');
    habitRow.className = 'flex items-center p-1.5 rounded-md';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isCompleted;
    checkbox.className = 'form-checkbox h-5 w-5 text-green-500 rounded border-slate-500 focus:ring-green-400 mr-3 cursor-pointer flex-shrink-0';
    checkbox.onchange = () => {
        const todayString = HabitTrackerService.getYYYYMMDD(new Date());
        const completions = AppStore.getHabitCompletions();
        const todaysCompletion = completions.find(c => c.habit_id === habit.id && c.completedAt === todayString);
        const nextCount = todaysCompletion ? 0 : 1;
        HabitTrackerService.logCompletion(habit.id, todayString, nextCount);
    };

    const habitText = document.createElement('span');
    habitText.className = 'text-slate-300';
    if (isCompleted) {
        habitText.classList.add('line-through', 'text-slate-500');
    }
    habitText.textContent = habit.name;

    habitRow.appendChild(checkbox);
    habitRow.appendChild(habitText);
    return habitRow;
}


async function renderAllWidgets() {
    renderGreeting();
    renderMyDayWidget();
    renderUpcomingWidget();
    renderNotesWidget();
    renderHabitWidget();
    await renderTimeTrackerWidget();
    renderQuickLinksWidget();
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await AppStore.initializeStore();
        NoteService.getNotes();
        TimeTrackerService.initialize();
        initializeVersionChecker();
        // START OF MODIFICATIONS
        CentralNotificationService.initialize();
        // END OF MODIFICATIONS

        greetingHeader = document.getElementById('greetingHeader');
        myDayContent = document.getElementById('myDayContent');
        habitContent = document.getElementById('habitContent');
        timeTrackerContent = document.getElementById('timeTrackerContent');
        upcomingContent = document.getElementById('upcomingContent');
        notesContent = document.getElementById('notesContent');
        quickLinksContent = document.getElementById('quickLinksContent');
        exportDataBtn = document.getElementById('exportDataBtn');
        importDataBtn = document.getElementById('importDataBtn');
        importFileInput = document.getElementById('importFileInput');
        // START OF MODIFICATIONS
        testNotificationsBtn = document.getElementById('testNotificationsBtn');
        // END OF MODIFICATIONS

        document.body.style.visibility = 'visible';

        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', handleExportDataClientSide);
        }

        if (importDataBtn) {
            importDataBtn.addEventListener('click', () => importFileInput.click());
        }
        if (importFileInput) {
            importFileInput.addEventListener('change', handleImportData);
        }
        // START OF MODIFICATIONS
        if (testNotificationsBtn) {
            testNotificationsBtn.addEventListener('click', () => {
                CentralNotificationService.fireTestNotification();
            });
        }
        // END OF MODIFICATIONS

        await renderAllWidgets();

        EventBus.subscribe('tasksChanged', () => {
            renderMyDayWidget();
            renderUpcomingWidget();
        });
        EventBus.subscribe('storeDataUpdatedFromServer', renderAllWidgets);
        EventBus.subscribe('userProfileChanged', renderGreeting);

    } catch (error) {
        LoggingService.critical('[Dashboard] Critical error during init.', error);
        document.body.innerHTML = '<p class="text-white text-center p-8">Could not load dashboard. Please check the server connection and refresh.</p>';
        document.body.style.visibility = 'visible';
    }
});