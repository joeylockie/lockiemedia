// tasks_list_view.js
// Handles rendering the main task list view and its associated bulk action controls.

import AppStore from './store.js';
import ViewManager from './viewManager.js';
import * as TaskService from './taskService.js';
// import * as BulkActionService from './bulkActionService.js'; // REMOVED
import EventBus from './eventBus.js';
import { formatDate, formatTime } from './utils.js';
import { openViewTaskDetailsModal } from './tasks_modal_interactions.js';
import { ProjectsFeature } from './feature_projects.js';

// DOM elements are now imported from the tasks-specific rendering module.
import {
    taskList,
    emptyState,
    noMatchingTasks,
    // REMOVED bulk action imports
    populateDatalist
} from './tasks_ui_rendering.js';

/**
 * Renders the main list of tasks based on current filters, sort order, and search term.
 */
export function renderTaskListView() {
    if (!taskList || !ViewManager || !AppStore || typeof window.isFeatureEnabled !== 'function' || !TaskService) { // REMOVED BulkActionService check
        console.error("renderTaskListView: Core dependencies not found.");
        return;
    }

    const kanbanBoardContainer = document.getElementById('kanbanBoardContainer');
    const calendarViewContainer = document.getElementById('calendarViewContainer');
    const pomodoroTimerPageContainer = document.getElementById('pomodoroTimerPageContainer');

    if(taskList) taskList.classList.remove('hidden');
    if (kanbanBoardContainer) kanbanBoardContainer.classList.add('hidden');
    if (calendarViewContainer) calendarViewContainer.classList.add('hidden');
    if (pomodoroTimerPageContainer) pomodoroTimerPageContainer.classList.add('hidden');

    taskList.innerHTML = '';
    const currentFilterVal = ViewManager.getCurrentFilter();
    const currentSortVal = ViewManager.getCurrentSort();
    const currentSearchTermVal = ViewManager.getCurrentSearchTerm();
    const currentTasks = AppStore.getTasks();
    const currentProjects = AppStore.getProjects ? AppStore.getProjects() : [];

    let filteredTasks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const shoppingLabels = ['shopping', 'buy', 'store'];

    if (currentFilterVal === 'inbox') {
        filteredTasks = currentTasks.filter(task => 
            !task.completed && 
            (!task.label || !shoppingLabels.includes(task.label.toLowerCase()))
        );
    } else if (currentFilterVal === 'shopping_list') {
        filteredTasks = currentTasks.filter(task =>
            !task.completed &&
            task.label &&
            shoppingLabels.includes(task.label.toLowerCase())
        );
    } else if (currentFilterVal === 'today') {
        filteredTasks = currentTasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const taskDueDate = new Date(task.dueDate + 'T00:00:00'); // Ensure time part doesn't affect date comparison
            return taskDueDate.getTime() === today.getTime();
        });
    } else if (currentFilterVal === 'upcoming') {
        filteredTasks = currentTasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const taskDueDate = new Date(task.dueDate + 'T00:00:00');
            return taskDueDate.getTime() > today.getTime();
        });
    } else if (currentFilterVal === 'completed') {
        filteredTasks = currentTasks.filter(task => task.completed);
    } else if (currentFilterVal.startsWith('project_')) {
        const projectId = parseInt(currentFilterVal.split('_')[1]);
        if (!isNaN(projectId)) {
            filteredTasks = currentTasks.filter(task => task.projectId === projectId && !task.completed);
        } else {
            filteredTasks = currentTasks.filter(task => (task.projectId === 0 || !task.projectId) && !task.completed);
        }
    } else { // Assume label filter
        filteredTasks = currentTasks.filter(task => task.label && task.label.toLowerCase() === currentFilterVal.toLowerCase() && !task.completed);
    }

    if (currentSearchTermVal) {
        const searchTermLower = currentSearchTermVal.toLowerCase();
        filteredTasks = filteredTasks.filter(task =>
            task.text.toLowerCase().includes(searchTermLower) ||
            (task.label && task.label.toLowerCase().includes(searchTermLower)) ||
            (task.notes && task.notes.toLowerCase().includes(searchTermLower)) ||
            (window.isFeatureEnabled('projectFeature') && task.projectId && currentProjects.find(p => p.id === task.projectId)?.name.toLowerCase().includes(searchTermLower))
        );
    }

    const priorityOrder = { high: 1, medium: 2, low: 3, default: 4 };
    if (currentSortVal === 'dueDate') {
        filteredTasks.sort((a, b) => {
            const dA = a.dueDate ? new Date(a.dueDate + (a.time ? `T${a.time}` : 'T00:00:00Z')) : null;
            const dB = b.dueDate ? new Date(b.dueDate + (b.time ? `T${b.time}` : 'T00:00:00Z')) : null;
            if (dA === null && dB === null) return 0;
            if (dA === null) return 1;
            if (dB === null) return -1;
            return dA - dB;
        });
    } else if (currentSortVal === 'priority') {
        filteredTasks.sort((a, b) => (priorityOrder[a.priority] || priorityOrder.default) - (priorityOrder[b.priority] || priorityOrder.default) || (a.dueDate && b.dueDate ? new Date(a.dueDate) - new Date(b.dueDate) : 0));
    } else if (currentSortVal === 'label') {
        filteredTasks.sort((a,b) => {
            const lA = (a.label || '').toLowerCase();
            const lB = (b.label || '').toLowerCase();
            if (lA < lB) return -1;
            if (lA > lB) return 1;
            const dA = a.dueDate ? new Date(a.dueDate + (a.time ? `T${a.time}` : 'T00:00:00Z')) : null;
            const dB = b.dueDate ? new Date(b.dueDate + (b.time ? `T${b.time}` : 'T00:00:00Z')) : null;
            if (dA === null && dB === null) return 0;
            if (dA === null) return 1;
            if (dB === null) return -1;
            return dA - dB;
        });
    } else if (currentFilterVal === 'inbox' && currentSortVal === 'default') {
        // Sort by creation date descending (newest first) for inbox default
        filteredTasks.sort((a, b) => (b.creationDate || b.id) - (a.creationDate || a.id));
    }


    if (emptyState) emptyState.classList.toggle('hidden', currentTasks.length !== 0);
    if (noMatchingTasks) noMatchingTasks.classList.toggle('hidden', !(currentTasks.length > 0 && filteredTasks.length === 0));
    if (taskList) taskList.classList.toggle('hidden', filteredTasks.length === 0 && currentTasks.length > 0);


    filteredTasks.forEach((task) => {
        const li = document.createElement('li');
        li.className = `task-item flex items-start justify-between bg-slate-100 dark:bg-slate-700 p-3 sm:p-3.5 rounded-lg shadow hover:shadow-md transition-shadow duration-300 ${task.completed ? 'opacity-60' : ''} overflow-hidden`;
        li.dataset.taskId = task.id;

        const mainContentClickableArea = document.createElement('div');
        mainContentClickableArea.className = 'task-item-clickable-area flex items-start flex-grow min-w-0 mr-2 rounded-l-lg';
        mainContentClickableArea.addEventListener('click', (event) => {
            if (event.target.type === 'checkbox' || event.target.closest('.task-actions')) return; // REMOVED bulk-select-checkbox-container check
            openViewTaskDetailsModal(task.id);
        });

        // REMOVED bulk select checkbox container

        const completeCheckbox = document.createElement('input');
        completeCheckbox.type = 'checkbox';
        completeCheckbox.checked = task.completed;
        completeCheckbox.className = 'form-checkbox h-5 w-5 text-sky-500 rounded border-slate-400 dark:border-slate-500 focus:ring-sky-400 dark:focus:ring-sky-500 mt-0.5 mr-2 sm:mr-3 cursor-pointer flex-shrink-0';
        completeCheckbox.addEventListener('change', () => EventBus.publish('uiRequestToggleComplete', { taskId: task.id }));
        
        const textDetailsDiv = document.createElement('div');
        textDetailsDiv.className = 'flex flex-col flex-grow min-w-0';
        const span = document.createElement('span');
        span.textContent = task.text;
        let textColorClass = task.completed ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200';
        span.className = `text-sm sm:text-base break-words ${textColorClass} ${task.completed ? 'completed-text' : ''}`;
        textDetailsDiv.appendChild(span);

        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'flex items-center flex-wrap gap-x-2 gap-y-1 mt-1 sm:mt-1.5 text-xs';

        if (window.isFeatureEnabled('projectFeature') && task.projectId && task.projectId !== 0) {
            const project = AppStore.getProjects().find(p => p.id === task.projectId);
            if (project) {
                const projSpan = document.createElement('span');
                projSpan.className = 'text-purple-600 dark:text-purple-400 flex items-center project-feature-element';
                projSpan.innerHTML = `<i class="fas fa-folder mr-1"></i> ${project.name}`;
                detailsContainer.appendChild(projSpan);
            }
        }

        if (task.priority && typeof TaskService.getPriorityClass === 'function') {
            const pB = document.createElement('span');
            pB.textContent = task.priority;
            pB.className = `priority-badge ${TaskService.getPriorityClass(task.priority)}`;
            detailsContainer.appendChild(pB);
        }
        if (task.label) {
            const lB = document.createElement('span');
            lB.textContent = task.label;
            lB.className = 'label-badge';
            detailsContainer.appendChild(lB);
        }
        if (task.dueDate && typeof formatDate === 'function') {
            const dDS = document.createElement('span');
            dDS.className = 'text-slate-500 dark:text-slate-400 flex items-center';
            let dD = formatDate(task.dueDate);
            if (task.time && typeof formatTime === 'function') {
                dD += ` ${formatTime(task.time)}`;
            }
            dDS.innerHTML = `<i class="far fa-calendar-alt mr-1"></i> ${dD}`;
            detailsContainer.appendChild(dDS);
        }
        if (window.isFeatureEnabled('advancedRecurrence') && task.recurrence && task.recurrence.frequency && task.recurrence.frequency !== 'none') {
            const recurrenceIcon = document.createElement('span');
            recurrenceIcon.className = 'text-slate-400 dark:text-slate-500 flex items-center advanced-recurrence-element';
            recurrenceIcon.innerHTML = `<i class="fas fa-sync-alt" title="This task repeats"></i>`;
            detailsContainer.appendChild(recurrenceIcon);
        }

        if (detailsContainer.hasChildNodes()) {
            textDetailsDiv.appendChild(detailsContainer);
        }

        // mainContentClickableArea.appendChild(bulkSelectCheckboxContainer); // REMOVED
        mainContentClickableArea.appendChild(completeCheckbox);
        mainContentClickableArea.appendChild(textDetailsDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions flex-shrink-0 self-start';
        const editButton = document.createElement('button');
        editButton.className = 'task-action-btn text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-500';
        editButton.innerHTML = '<i class="fas fa-pencil-alt"></i>';
        editButton.setAttribute('aria-label', 'Edit task');
        editButton.title = 'Edit task';
        editButton.addEventListener('click', () => {
            openViewTaskDetailsModal(task.id);
        });
        actionsDiv.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'task-action-btn text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500';
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteButton.setAttribute('aria-label', 'Delete task');
        deleteButton.title = 'Delete task';
        deleteButton.addEventListener('click', () => EventBus.publish('uiRequestDeleteTask', { taskId: task.id }));
        actionsDiv.appendChild(deleteButton);

        li.appendChild(mainContentClickableArea);
        li.appendChild(actionsDiv);

        if (taskList) {
            taskList.appendChild(li);
        }
    });
}

/**
 * Renders the bulk action controls based on current selections and feature flags.
 */
export function renderBulkActionControls() {
    // This function is now empty as the feature is removed.
}

console.log("tasks_list_view.js loaded.");