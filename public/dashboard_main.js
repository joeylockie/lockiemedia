import LoggingService from './loggingService.js';
import EventBus from './eventBus.js';
import AppStore from './store.js';
import * as TaskService from './taskService.js';
import * as NoteService from './noteService.js';
import HabitTrackerService from './habitTrackerService.js';
import TimeTrackerService from './timeTrackerService.js';
import { formatDate, formatMillisecondsToHMS } from './utils.js';

// --- DOM Element References ---
let greetingHeader, myDayContent, habitContent, timeTrackerContent, upcomingContent, notesContent, quickLinksContent, exportDataBtn;
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

// --- Data Export Function ---
async function handleExportData() {
    LoggingService.info('[Dashboard] Data export initiated by user.', { functionName: 'handleExportData' });
    
    try {
        const allData = {
            tasks: AppStore.getTasks(),
            projects: AppStore.getProjects(),
            userProfile: AppStore.getUserProfile(),
            userPreferences: AppStore.getUserPreferences(),
            notebooks: AppStore.getNotebooks(),
            notes: AppStore.getNotes(),
            time_activities: AppStore.getTimeActivities(),
            time_log_entries: AppStore.getTimeLogEntries(),
            dev_epics: AppStore.getDevEpics(),
            dev_tickets: AppStore.getDevTickets()
        };

        const dataStr = JSON.stringify(allData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        const date = new Date();
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        a.download = `lockiemedia_backup_${dateString}.json`;
        a.href = url;
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            LoggingService.info('[Dashboard] Data export successful.', { functionName: 'handleExportData' });
        }, 100);

    } catch (error) {
        LoggingService.error('[Dashboard] Failed to export data.', error, { functionName: 'handleExportData' });
        alert('An error occurred while preparing the data for download. Please check the console for details.');
    }
}


// --- Rendering Functions ---

function renderGreeting() {
    // ... (same as before)
}

function renderMyDayWidget() {
    // ... (same as before)
}

function renderUpcomingWidget() {
    // ... (same as before)
}

function renderNotesWidget() {
    // ... (same as before)
}

function renderHabitWidget() {
    // ... (same as before)
}

function renderTimeTrackerWidget() {
    // ... (same as before)
}

function renderQuickLinksWidget() {
    if (!quickLinksContent) return;

    const links = [
        { href: 'tasks.html', icon: 'fa-check-double', title: 'Task Manager', color: 'text-sky-400' },
        { href: 'dev-tracker.html', icon: 'fa-tasks', title: 'Dev Tracker', color: 'text-purple-400' },
        { href: 'notes.html', icon: 'fa-sticky-note', title: 'Notes', color: 'text-amber-400' },
        { href: 'habits.html', icon: 'fa-calendar-check', title: 'Habit Tracker', color: 'text-green-400' },
        { href: 'time-tracker.html', icon: 'fa-clock', title: 'Time Tracker', color: 'text-indigo-400' },
        { href: 'pomodoro.html', icon: 'fa-stopwatch-20', title: 'Pomodoro', color: 'text-red-400' },
        { href: 'calendar.html', icon: 'fa-calendar-alt', title: 'Calendar', color: 'text-teal-400' },
        { href: 'budget.html', icon: 'fa-wallet', title: 'Budget Planner', color: 'text-lime-400' }
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
    // ... (same as before)
}

function createHabitRow(habit, isCompleted) {
    // ... (same as before)
}


function renderAllWidgets() {
    renderGreeting();
    renderMyDayWidget();
    renderUpcomingWidget();
    renderNotesWidget();
    renderHabitWidget();
    renderTimeTrackerWidget();
    renderQuickLinksWidget();
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await AppStore.initializeStore(); 
        NoteService.getNotes(); 
        HabitTrackerService.initialize();
        TimeTrackerService.initialize();

        greetingHeader = document.getElementById('greetingHeader');
        myDayContent = document.getElementById('myDayContent');
        habitContent = document.getElementById('habitContent');
        timeTrackerContent = document.getElementById('timeTrackerContent');
        upcomingContent = document.getElementById('upcomingContent');
        notesContent = document.getElementById('notesContent');
        quickLinksContent = document.getElementById('quickLinksContent');
        exportDataBtn = document.getElementById('exportDataBtn');

        document.body.style.visibility = 'visible';
        
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', handleExportData);
        }

        renderAllWidgets();

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