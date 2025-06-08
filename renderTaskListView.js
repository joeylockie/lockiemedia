// renderTaskListView.js
// Handles rendering the main task list view and its associated bulk action controls.

import AppStore from './store.js';
import ViewManager from './viewManager.js';
import { isFeatureEnabled } from './featureFlagService.js';
import * as TaskService from './taskService.js';
import * as BulkActionService from './bulkActionService.js';
import EventBus from './eventBus.js';
import { formatDate, formatTime } from './utils.js';
import { openViewTaskDetailsModal } from './modal_interactions.js'; // Assuming this is where it is
import { ProjectsFeature } from './feature_projects.js'; // Assuming this is where it is

// DOM elements will be imported from ui_rendering.js or a new domElements.js
// For now, this module assumes these elements are made available to it.
// To make this work, ui_rendering.js will need to export these elements
// or they need to be passed as arguments, or imported from a dedicated domElements.js.
// We'll assume ui_rendering.js exports them for this step.
import {
    taskList,
    emptyState,
    noMatchingTasks,
    bulkActionControlsContainer,
    selectAllTasksCheckbox,
    bulkCompleteBtn,
    bulkDeleteBtn,
    bulkAssignProjectDropdown,
    bulkChangePriorityDropdown,
    bulkChangeLabelInput,
    populateDatalist // Assuming populateDatalist is also exported or moved
} from './ui_rendering.js'; // This import path might change if ui_rendering is refactored further

/**
 * Renders the main list of tasks based on current filters, sort order, and search term.
 */
export function renderTaskListView() {
    if (!taskList || !ViewManager || !AppStore || !isFeatureEnabled || !TaskService || !BulkActionService) {
        console.error("renderTaskListView: Core dependencies not found.");
        return;
    }

    // This part ensures other views are hidden, which might be better handled by the orchestrator (refreshTaskView)
    // For now, keeping it to ensure functional parity with the original ui_rendering.js
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
    const currentProjects = AppStore.getProjects ? AppStore.getProjects() : []; // Handle if getProjects isn't there

    let filteredTasks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const shoppingLabels = ['shopping', 'buy', 'store'];

    if (currentFilterVal === 'inbox') {
        filteredTasks = currentTasks.filter(task => !task.completed);
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
        } else { // This might handle a "No Project" filter if its value is project_0 or similar
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
            (isFeatureEnabled('projectFeature') && task.projectId && currentProjects.find(p => p.id === task.projectId)?.name.toLowerCase().includes(searchTermLower))
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

        const hasOpenPrerequisites = isFeatureEnabled('taskDependenciesFeature') && task.dependsOn && task.dependsOn.some(depId => {
            const dependentTask = AppStore.getTasks().find(t => t.id === depId);
            return dependentTask && !dependentTask.completed;
        });

        if (hasOpenPrerequisites) {
            li.classList.add('border-l-4', 'border-amber-500');
        }

        const mainContentClickableArea = document.createElement('div');
        mainContentClickableArea.className = 'task-item-clickable-area flex items-start flex-grow min-w-0 mr-2 rounded-l-lg';
        mainContentClickableArea.addEventListener('click', (event) => {
            if (event.target.type === 'checkbox' || event.target.closest('.task-actions') || event.target.closest('.bulk-select-checkbox-container')) return;
            openViewTaskDetailsModal(task.id);
        });

        const bulkSelectCheckboxContainer = document.createElement('div');
        bulkSelectCheckboxContainer.className = 'bulk-select-checkbox-container flex-shrink-0 mr-2 sm:mr-3 bulk-actions-feature-element';
        if (isFeatureEnabled('bulkActionsFeature')) {
            const bulkCheckbox = document.createElement('input');
            bulkCheckbox.type = 'checkbox';
            bulkCheckbox.className = 'form-checkbox h-5 w-5 text-blue-500 rounded border-slate-400 dark:border-slate-500 focus:ring-blue-400 dark:focus:ring-blue-500 mt-0.5 cursor-pointer';
            bulkCheckbox.checked = BulkActionService.getSelectedIds().includes(task.id);
            bulkCheckbox.title = "Select for bulk action";
            bulkCheckbox.addEventListener('change', () => {
                BulkActionService.toggleTaskSelection(task.id);
            });
            bulkSelectCheckboxContainer.appendChild(bulkCheckbox);
        } else {
            bulkSelectCheckboxContainer.classList.add('hidden');
        }

        const completeCheckbox = document.createElement('input');
        completeCheckbox.type = 'checkbox';
        completeCheckbox.checked = task.completed;
        completeCheckbox.className = 'form-checkbox h-5 w-5 text-sky-500 rounded border-slate-400 dark:border-slate-500 focus:ring-sky-400 dark:focus:ring-sky-500 mt-0.5 mr-2 sm:mr-3 cursor-pointer flex-shrink-0';
        completeCheckbox.addEventListener('change', () => EventBus.publish('uiRequestToggleComplete', { taskId: task.id }));
        if (hasOpenPrerequisites) {
            completeCheckbox.disabled = true;
            completeCheckbox.title = "This task is blocked by incomplete prerequisites.";
            completeCheckbox.classList.add('opacity-50', 'cursor-not-allowed');
        }

        const textDetailsDiv = document.createElement('div');
        textDetailsDiv.className = 'flex flex-col flex-grow min-w-0';
        const span = document.createElement('span');
        span.textContent = task.text;
        let textColorClass = task.completed ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200';
        span.className = `text-sm sm:text-base break-words ${textColorClass} ${task.completed ? 'completed-text' : ''}`;
        textDetailsDiv.appendChild(span);

        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'flex items-center flex-wrap gap-x-2 gap-y-1 mt-1 sm:mt-1.5 text-xs';

        if (isFeatureEnabled('projectFeature') && task.projectId && task.projectId !== 0) {
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
        if (isFeatureEnabled('advancedRecurrence') && task.recurrence && task.recurrence.frequency && task.recurrence.frequency !== 'none') {
            const recurrenceIcon = document.createElement('span');
            recurrenceIcon.className = 'text-slate-400 dark:text-slate-500 flex items-center advanced-recurrence-element';
            recurrenceIcon.innerHTML = `<i class="fas fa-sync-alt" title="This task repeats"></i>`;
            detailsContainer.appendChild(recurrenceIcon);
        }
        if (isFeatureEnabled('fileAttachments') && task.attachments && task.attachments.length > 0) {
            const aS = document.createElement('span');
            aS.className = 'text-slate-500 dark:text-slate-400 flex items-center file-attachments-element';
            aS.innerHTML = `<i class="fas fa-paperclip mr-1"></i> ${task.attachments.length}`;
            detailsContainer.appendChild(aS);
        }
        if (isFeatureEnabled('subTasksFeature') && task.subTasks && task.subTasks.length > 0) {
            const subTaskIcon = document.createElement('span');
            subTaskIcon.className = 'text-slate-400 dark:text-slate-500 flex items-center sub-tasks-feature-element';
            const completedSubTasks = task.subTasks.filter(st => st.completed).length;
            subTaskIcon.innerHTML = `<i class="fas fa-tasks mr-1" title="${completedSubTasks}/${task.subTasks.length} sub-tasks completed"></i>`;
            detailsContainer.appendChild(subTaskIcon);
        }
        if (isFeatureEnabled('taskDependenciesFeature') && ((task.dependsOn && task.dependsOn.length > 0) || (task.blocksTasks && task.blocksTasks.length > 0))) {
            const depIcon = document.createElement('span');
            depIcon.className = 'text-slate-400 dark:text-slate-500 flex items-center task-dependencies-feature-element';
            let depTitle = '';
            if (task.dependsOn && task.dependsOn.length > 0) depTitle += `Depends on ${task.dependsOn.length} task(s). `;
            if (task.blocksTasks && task.blocksTasks.length > 0) depTitle += `Blocks ${task.blocksTasks.length} task(s).`;
            depIcon.innerHTML = `<i class="fas fa-link mr-1" title="${depTitle.trim()}"></i>`;
            detailsContainer.appendChild(depIcon);
        }

        if (detailsContainer.hasChildNodes()) {
            textDetailsDiv.appendChild(detailsContainer);
        }

        mainContentClickableArea.appendChild(bulkSelectCheckboxContainer);
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
    if (!bulkActionControlsContainer || !BulkActionService || !AppStore || !ViewManager) return;

    const selectedIds = BulkActionService.getSelectedIds();
    const isEnabled = isFeatureEnabled('bulkActionsFeature') && selectedIds.length > 0;
    bulkActionControlsContainer.classList.toggle('hidden', !isEnabled);

    if (!isEnabled) return;

    const selectionCountEl = document.getElementById('bulkActionSelectionCount');
    if (selectionCountEl) selectionCountEl.textContent = `${selectedIds.length} selected`;

    if (bulkCompleteBtn) bulkCompleteBtn.disabled = selectedIds.length === 0;
    if (bulkDeleteBtn) bulkDeleteBtn.disabled = selectedIds.length === 0;

    if (isFeatureEnabled('projectFeature')) {
        if (bulkAssignProjectDropdown) {
            bulkAssignProjectDropdown.disabled = selectedIds.length === 0;
            if (ProjectsFeature?.populateProjectDropdowns && typeof bulkAssignProjectDropdown.dataset.populated === 'undefined') {
                // Populate project dropdown for bulk actions
                const currentProjects = AppStore.getProjects().filter(p=>p.id !==0); // Exclude "No Project"
                bulkAssignProjectDropdown.innerHTML = '<option value="">Assign Project...</option>'; // Reset
                currentProjects.forEach(project => {
                    const option = document.createElement('option');
                    option.value = project.id;
                    option.textContent = project.name;
                    bulkAssignProjectDropdown.appendChild(option);
                });
                bulkAssignProjectDropdown.dataset.populated = "true"; // Mark as populated to avoid re-populating unnecessarily
            }
        }
    } else {
        if (bulkAssignProjectDropdown) bulkAssignProjectDropdown.closest('div.relative.project-feature-element')?.classList.add('hidden');
    }


    if (bulkChangePriorityDropdown) bulkChangePriorityDropdown.disabled = selectedIds.length === 0;
    if (bulkChangeLabelInput) {
        bulkChangeLabelInput.disabled = selectedIds.length === 0;
        const datalistEl = document.getElementById('existingLabelsBulkAction');
        if (datalistEl && typeof populateDatalist === 'function') populateDatalist(datalistEl); // Ensure populateDatalist is available
    }

    if (selectAllTasksCheckbox) {
        const currentTasksInView = ViewManager.getFilteredTasksForBulkAction ?
                                   ViewManager.getFilteredTasksForBulkAction() :
                                   [];

        const allInViewSelected = currentTasksInView.length > 0 && currentTasksInView.every(task => selectedIds.includes(task.id));
        selectAllTasksCheckbox.checked = allInViewSelected;
    }
}

console.log("renderTaskListView.js loaded.");