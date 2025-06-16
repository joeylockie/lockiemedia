import protectPage from './authGuard.js';
import LoggingService from './loggingService.js';
import EventBus from './eventBus.js';
import AppStore from './store.js';
import * as TaskService from './taskService.js';
import * as NoteService from './noteService.js';
import HabitTrackerService from './habitTrackerService.js';
import TimeTrackerService from './timeTrackerService.js';
import { UserAccountsFeature } from './feature_user_accounts.js';
import { formatDate, formatMillisecondsToHMS } from './utils.js';

// --- DOM Element References ---
let greetingHeader, myDayContent, habitContent, timeTrackerContent, upcomingContent, notesContent, quickLinksContent;
let timeTrackerInterval = null; // To hold the interval for the live timer

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
        li.onclick = () => window.location.href = 'notes.html'; // Simple navigation
        list.appendChild(li);
    });
    notesContent.appendChild(list);
}

function renderHabitWidget() {
    if (!habitContent) return;
    
    const habits = HabitTrackerService.getHabits();
    const completions = HabitTrackerService.getCompletionsForYear(new Date().getFullYear());
    const todayString = new Date().toISOString().split('T')[0];

    habitContent.innerHTML = '';
    if (habits.length === 0) {
        habitContent.innerHTML = '<p class="text-slate-400 text-sm">No habits configured.</p>';
        return;
    }

    habits.forEach(habit => {
        const isCompletedToday = completions.some(c => c.habitId === habit.id && c.date === todayString);
        habitContent.appendChild(createHabitRow(habit, isCompletedToday));
    });
}

function renderTimeTrackerWidget() {
    if (!timeTrackerContent) return;
    if (timeTrackerInterval) clearInterval(timeTrackerInterval); // Clear previous interval

    const activeTimer = TimeTrackerService.getActiveTimer();

    if (activeTimer) {
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
        const totalMs = TimeTrackerService.getTodaysTotalTrackedMs();
        timeTrackerContent.innerHTML = `
            <p class="text-sm text-slate-400">Time Tracked Today:</p>
            <p class="text-3xl font-bold text-slate-100 mt-2">${formatMillisecondsToHMS(totalMs)}</p>
        `;
    }
}

function renderQuickLinksWidget() {
    if (!quickLinksContent) return;

    const links = [
        { href: 'todo.html', icon: 'fa-check-double', title: 'Task Manager', color: 'text-sky-400' },
        { href: 'notes.html', icon: 'fa-sticky-note', title: 'Notes', color: 'text-amber-400' },
        { href: 'habits.html', icon: 'fa-calendar-check', title: 'Habit Tracker', color: 'text-green-400' },
        { href: 'time-tracker.html', icon: 'fa-clock', title: 'Time Tracker', color: 'text-indigo-400' },
        { href: 'pomodoro.html', icon: 'fa-stopwatch-20', title: 'Pomodoro', color: 'text-red-400' },
        { href: 'calendar.html', icon: 'fa-calendar-alt', title: 'Calendar', color: 'text-teal-400' },
        { href: 'budget.html', icon: 'fa-wallet', title: 'Budget Planner', color: 'text-lime-400' },
        { href: 'admin.html', icon: 'fa-user-shield', title: 'Admin Panel', color: 'text-slate-400' },
        // ADDED a new object for the advertising admin page
        { href: 'advertising_admin.html', icon: 'fa-bullhorn', title: 'Ad Admin', color: 'text-orange-400' }
    ];

    quickLinksContent.innerHTML = ''; // Clear content

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


// --- Helper for Creating UI Elements ---
function createTaskRow(task) {
    const taskRow = document.createElement('div');
    taskRow.className = 'flex items-center p-2 rounded-md hover:bg-slate-700 transition-colors';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'form-checkbox h-5 w-5 text-sky-500 rounded border-slate-500 focus:ring-sky-400 mr-3 cursor-pointer flex-shrink-0';
    checkbox.onchange = () => {
        TaskService.toggleTaskComplete(task.id);
        // The event bus will trigger a re-render
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
        const todayString = new Date().toISOString().split('T')[0];
        HabitTrackerService.toggleCompletion(habit.id, todayString);
        renderHabitWidget(); // Re-render this specific widget
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


// --- Main Initialization Logic ---

function renderAllWidgets() {
    renderGreeting();
    renderMyDayWidget();
    renderUpcomingWidget();
    renderNotesWidget();
    renderHabitWidget();
    renderTimeTrackerWidget();
    renderQuickLinksWidget(); // Add this to the main render function
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // ADDED: Initialize Firebase before protecting the page
        if (UserAccountsFeature && UserAccountsFeature.initialize) {
            UserAccountsFeature.initialize();
        } else {
            throw new Error("UserAccountsFeature is not available to initialize Firebase.");
        }

        await protectPage();
        
        // --- Initialize Services that load data ---
        // These are local storage based, so they are fast.
        await AppStore.initializeStore(); // Initialize the main store first
        NoteService.getNotes(); // Ensure notes are loaded
        HabitTrackerService.initialize();
        TimeTrackerService.initialize();

        // --- Get DOM elements ---
        greetingHeader = document.getElementById('greetingHeader');
        myDayContent = document.getElementById('myDayContent');
        habitContent = document.getElementById('habitContent');
        timeTrackerContent = document.getElementById('timeTrackerContent');
        upcomingContent = document.getElementById('upcomingContent');
        notesContent = document.getElementById('notesContent');
        quickLinksContent = document.getElementById('quickLinksContent'); // Get the new element

        // Make the body visible now that we are authenticated and ready
        document.body.style.visibility = 'visible';
        
        // Initial Render
        renderAllWidgets();

        // Setup event listeners
        const signOutBtn = document.getElementById('signOutBtn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', () => UserAccountsFeature.handleSignOut());
        }

        // Subscribe to data changes to keep dashboard live
        EventBus.subscribe('tasksChanged', () => {
            renderMyDayWidget();
            renderUpcomingWidget();
        });
        // A simple subscription to re-render the time tracker when ANY time log entry changes
        EventBus.subscribe('timeLogChanged', renderTimeTrackerWidget); // You would need to publish this event from the service
        EventBus.subscribe('storeDataUpdatedFromFirebase', renderAllWidgets);
        EventBus.subscribe('userProfileChanged', renderGreeting);

    } catch (error) {
        LoggingService.critical('[Dashboard] Auth guard failed or critical error during init.', error);
        document.body.innerHTML = '<p class="text-white text-center p-8">Could not load dashboard. Please try logging in again.</p>';
        document.body.style.visibility = 'visible';
    }
});