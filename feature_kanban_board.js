// feature_kanban_board.js
// Manages the Kanban Board feature, including its state, logic, and UI rendering.
// Now an ES6 module.

import { isFeatureEnabled } from './featureFlagService.js';
import AppStore from './store.js';
import { getPriorityClass } from './taskService.js'; 
import { formatDate, formatTime } from './utils.js'; 
import { openViewTaskDetailsModal } from './modal_interactions.js'; 
// MODIFIED: showMessage import removed
import { 
    updateYourTasksHeading, 
    updateViewToggleButtonsState
    // showMessage // Removed
} from './ui_rendering.js';
import EventBus from './eventBus.js'; // MODIFIED: Added EventBus import
import LoggingService from './loggingService.js'; // MODIFIED: Added LoggingService import

// MODIFIED: Replaced console.log with LoggingService.debug or .info
LoggingService.debug('[KanbanFeatureFile] feature_kanban_board.js script STARTING to execute as ES6 module.', {module: 'feature_kanban_board'});

let draggedTask = null; 

/**
 * Initializes the Kanban board feature.
 */
function initializeKanbanBoardFeature() {
    const functionName = "initializeKanbanBoardFeature";
    LoggingService.info('[KanbanFeature] Kanban Board Feature Initialized.', {functionName, module: 'feature_kanban_board'});
}

/**
 * Updates the UI visibility of elements specifically managed by this module,
 * if any, based on whether the Kanban feature is enabled.
 */
function updateKanbanBoardUIVisibility() { 
    const functionName = "updateKanbanBoardUIVisibility";
    if (typeof isFeatureEnabled !== 'function') {
        LoggingService.error("[KanbanBoardFeature] isFeatureEnabled function not available.", new Error("DependencyMissing"), {functionName, module: 'feature_kanban_board'});
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('kanbanBoardFeature');
    LoggingService.debug(`[KanbanFeature] updateKanbanBoardUIVisibility called. Feature enabled: ${isActuallyEnabled}`, {functionName, isEnabled: isActuallyEnabled, module: 'feature_kanban_board'});

    document.querySelectorAll('.kanban-board-feature-element').forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));

    const kanbanViewToggleBtn = document.getElementById('kanbanViewToggleBtn');
    if (kanbanViewToggleBtn) {
        kanbanViewToggleBtn.classList.toggle('hidden', !isActuallyEnabled);
    }
}

/**
 * Updates the title of a specific Kanban column and saves the changes.
 * @param {string} columnId - The ID of the column to update.
 * @param {string} newTitle - The new title for the column.
 */
function updateKanbanColumnTitle(columnId, newTitle) {
    const functionName = "updateKanbanColumnTitle";
    let currentKanbanColumns = AppStore.getKanbanColumns();
    const currentTaskViewMode = window.ViewManager ? window.ViewManager.getCurrentTaskViewMode() : 'list'; 

    const columnIndex = currentKanbanColumns.findIndex(col => col.id === columnId);
    if (columnIndex !== -1) {
        const trimmedNewTitle = newTitle.trim();
        if (currentKanbanColumns[columnIndex].title !== trimmedNewTitle && trimmedNewTitle !== "") {
            currentKanbanColumns[columnIndex].title = trimmedNewTitle;
            AppStore.setKanbanColumns(currentKanbanColumns); 
            LoggingService.info(`[KanbanFeature] Column "${columnId}" title updated to "${trimmedNewTitle}".`, {functionName, columnId, newTitle: trimmedNewTitle, module: 'feature_kanban_board'});

            if (currentTaskViewMode === 'kanban' && isFeatureEnabled('kanbanBoardFeature')) {
                renderKanbanBoardInternal();
            }
        } else if (trimmedNewTitle === "") {
            const titleInputElement = document.querySelector(`.kanban-column[data-column-id="${columnId}"] .kanban-column-title-input`);
            if(titleInputElement) titleInputElement.value = currentKanbanColumns[columnIndex].title; 
            // MODIFIED: Publish event instead of direct call
            EventBus.publish('displayUserMessage', {text: "Column title cannot be empty.", type: "error"});
            LoggingService.warn(`[KanbanFeature] Attempt to set empty title for column "${columnId}".`, {functionName, columnId, module: 'feature_kanban_board'});
        }
    } else {
        LoggingService.warn(`[KanbanFeature] Column with ID "${columnId}" not found for title update.`, {functionName, columnId, module: 'feature_kanban_board'});
    }
}

/**
 * Internal function to render the entire Kanban board view.
 */
function renderKanbanBoardInternal() {
    const functionName = "renderKanbanBoardInternal";
    LoggingService.debug('[KanbanFeature] renderKanbanBoardInternal function START.', {functionName, module: 'feature_kanban_board'});
    
    const currentMainContentArea = window.mainContentArea || document.querySelector('main');
    if (!currentMainContentArea) {
        LoggingService.error("[KanbanFeature] Main content area not found to render board.", new Error("DOMElementMissing"), {functionName, module: 'feature_kanban_board'});
        return;
    }
    currentMainContentArea.innerHTML = ''; 

    const headerDiv = document.createElement('div');
    headerDiv.className = 'flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6';

    const headingEl = window.yourTasksHeading || document.createElement('h2');
    headingEl.id = 'yourTasksHeading';
    headingEl.className = 'text-xl sm:text-2xl md:text-3xl font-semibold text-slate-800 dark:text-slate-100';
    headerDiv.appendChild(headingEl);
    if (!window.yourTasksHeading) window.yourTasksHeading = headingEl;

    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'flex gap-2 mt-3 sm:mt-0 flex-wrap items-center';
    if (window.pomodoroViewToggleBtn) buttonsDiv.appendChild(window.pomodoroViewToggleBtn);
    if (window.calendarViewToggleBtn) buttonsDiv.appendChild(window.calendarViewToggleBtn);
    if (window.kanbanViewToggleBtn) buttonsDiv.appendChild(window.kanbanViewToggleBtn);
    headerDiv.appendChild(buttonsDiv);
    currentMainContentArea.appendChild(headerDiv);

    const boardContainer = window.kanbanBoardContainer || document.createElement('div');
    boardContainer.id = 'kanbanBoardContainer';
    boardContainer.className = 'flex flex-col sm:flex-row gap-4 p-0 overflow-x-auto min-h-[calc(100vh-250px)]';
    boardContainer.innerHTML = ''; 
    boardContainer.classList.remove('hidden');
    if (!document.getElementById('kanbanBoardContainer')) {
        currentMainContentArea.appendChild(boardContainer);
        window.kanbanBoardContainer = boardContainer; 
    }

    const currentKanbanColumns = AppStore.getKanbanColumns();
    if (!Array.isArray(currentKanbanColumns)) {
        LoggingService.error("[KanbanFeature] 'kanbanColumns' is not defined or not an array.", new Error("DataError"), {functionName, module: 'feature_kanban_board'});
        return;
    }
    currentKanbanColumns.forEach(column => {
        const columnEl = createKanbanColumnElement(column);
        boardContainer.appendChild(columnEl);
    });

    setupDragAndDropListeners();

    if (typeof updateYourTasksHeading === 'function') updateYourTasksHeading();
    if (typeof updateViewToggleButtonsState === 'function') updateViewToggleButtonsState();
    LoggingService.info('[KanbanFeature] Kanban board rendered internally.', {functionName, module: 'feature_kanban_board'});
}

/**
 * Creates a DOM element for a Kanban column.
 * @param {object} column - The column data object.
 * @returns {HTMLElement} The created column element.
 */
function createKanbanColumnElement(column) {
    const columnWrapper = document.createElement('div');
    columnWrapper.className = 'kanban-column flex-shrink-0 w-full sm:w-72 md:w-80 bg-slate-200 dark:bg-slate-800 rounded-lg shadow-md flex flex-col';
    columnWrapper.dataset.columnId = column.id;

    const header = document.createElement('div');
    header.className = 'p-3 border-b border-slate-300 dark:border-slate-700 flex justify-between items-center';
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = column.title;
    titleInput.className = 'kanban-column-title-input text-lg font-semibold text-slate-700 dark:text-slate-200 bg-transparent border-none focus:ring-2 focus:ring-sky-500 rounded p-1 w-full';
    titleInput.addEventListener('change', (e) => {
        updateKanbanColumnTitle(column.id, e.target.value);
    });
    titleInput.addEventListener('blur', (e) => {
         const currentColumns = AppStore.getKanbanColumns();
         const currentColData = currentColumns.find(c => c.id === column.id);
         if (e.target.value.trim() !== currentColData?.title) {
            updateKanbanColumnTitle(column.id, e.target.value);
         }
    });
    header.appendChild(titleInput);

    const taskListUl = document.createElement('ul');
    taskListUl.className = 'kanban-task-list p-3 space-y-3 overflow-y-auto flex-grow min-h-[150px]';
    taskListUl.dataset.columnId = column.id;

    const currentTasks = AppStore.getTasks();
    if (!Array.isArray(currentTasks)) {
        LoggingService.error("[KanbanFeature] 'tasks' array not found from AppStore.", new Error("DataError"), {functionName: 'createKanbanColumnElement', module: 'feature_kanban_board'});
    } else {
        const tasksInColumn = currentTasks.filter(task => {
            if (column.id === 'done') {
                 return task.completed || task.kanbanColumnId === 'done';
            }
            return task.kanbanColumnId === column.id && !task.completed;
        });

        tasksInColumn.forEach(task => {
            const taskEl = createKanbanTaskElement(task);
            taskListUl.appendChild(taskEl);
        });
    }
    columnWrapper.appendChild(header);
    columnWrapper.appendChild(taskListUl);
    return columnWrapper;
}

/**
 * Creates a DOM element for a Kanban task card.
 * @param {object} task - The task data object.
 * @returns {HTMLElement} The created task card element.
 */
function createKanbanTaskElement(task) {
    const taskCard = document.createElement('li');
    taskCard.className = `kanban-task-card bg-white dark:bg-slate-700 p-3 rounded-md shadow hover:shadow-lg transition-shadow cursor-grab active:cursor-grabbing ${task.completed ? 'opacity-70' : ''}`;
    taskCard.draggable = true;
    taskCard.dataset.taskId = task.id;

    const taskText = document.createElement('p');
    taskText.textContent = task.text;
    taskText.className = `text-sm font-medium text-slate-800 dark:text-slate-100 mb-2 break-words ${task.completed ? 'line-through' : ''}`;
    taskCard.appendChild(taskText);

    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'flex flex-wrap items-center gap-x-2 gap-y-1 text-xs mt-1';

    if (task.priority) {
        const pB = document.createElement('span');
        pB.textContent = task.priority;
        pB.className = `priority-badge ${getPriorityClass(task.priority)}`;
        detailsContainer.appendChild(pB);
    }
    if (task.label) {
        const lB = document.createElement('span');
        lB.textContent = task.label;
        lB.className = 'label-badge';
        detailsContainer.appendChild(lB);
    }
    if (task.dueDate) {
        const dDS = document.createElement('span');
        dDS.className = 'text-slate-500 dark:text-slate-400 flex items-center';
        let dD = formatDate(task.dueDate);
        if (task.time) { dD += ` ${formatTime(task.time)}`; }
        dDS.innerHTML = `<i class="far fa-calendar-alt mr-1"></i> ${dD}`;
        detailsContainer.appendChild(dDS);
    }
    if (isFeatureEnabled('subTasksFeature') && task.subTasks && task.subTasks.length > 0) {
        const subTaskIcon = document.createElement('span');
        subTaskIcon.className = 'text-slate-400 dark:text-slate-500 flex items-center sub-tasks-feature-element';
        const completedSubTasks = task.subTasks.filter(st => st.completed).length;
        subTaskIcon.innerHTML = `<i class="fas fa-tasks mr-1" title="${completedSubTasks}/${task.subTasks.length} sub-tasks completed"></i>`;
        detailsContainer.appendChild(subTaskIcon);
    }

    if (detailsContainer.hasChildNodes()) {
        taskCard.appendChild(detailsContainer);
    }

    taskCard.addEventListener('click', (event) => {
        if (event.target.closest('button, input, select, textarea, a')) return;
        openViewTaskDetailsModal(task.id);
    });
    return taskCard;
}

/**
 * Sets up drag and drop event listeners for task cards and columns.
 */
function setupDragAndDropListeners() {
    const taskCards = document.querySelectorAll('.kanban-task-card');
    const columns = document.querySelectorAll('.kanban-task-list');

    taskCards.forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });

    columns.forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('dragleave', handleDragLeave);
        column.addEventListener('drop', handleDrop);
    });
}

// --- Drag and Drop Event Handlers ---
function handleDragStart(event) {
    draggedTask = event.target;
    event.dataTransfer.setData('text/plain', event.target.dataset.taskId);
    event.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
        event.target.classList.add('opacity-50', 'border-dashed', 'border-sky-500');
    }, 0);
}

function handleDragEnd(event) {
    if(event.target) event.target.classList.remove('opacity-50', 'border-dashed', 'border-sky-500');
    draggedTask = null;
    document.querySelectorAll('.kanban-task-list').forEach(col => col.classList.remove('bg-slate-300', 'dark:bg-slate-700/70'));
}

function handleDragOver(event) {
    event.preventDefault();
    const columnUl = event.target.closest('.kanban-task-list');
    if (columnUl) {
        columnUl.classList.add('bg-slate-300', 'dark:bg-slate-700/70');
        event.dataTransfer.dropEffect = 'move';
    } else {
         event.dataTransfer.dropEffect = 'none';
    }
}

function handleDragLeave(event) {
    const columnUl = event.target.closest('.kanban-task-list');
    if (columnUl) {
        columnUl.classList.remove('bg-slate-300', 'dark:bg-slate-700/70');
    }
}

function handleDrop(event) {
    const functionName = "handleDrop (KanbanFeature)";
    event.preventDefault();
    const targetColumnUl = event.target.closest('.kanban-task-list');

    if (!targetColumnUl || !draggedTask) {
        if(draggedTask) handleDragEnd({target: draggedTask});
        return;
    }

    const targetColumnId = targetColumnUl.dataset.columnId;
    const taskId = parseInt(draggedTask.dataset.taskId);
    
    let currentTasks = AppStore.getTasks();
    const currentFeatureFlags = AppStore.getFeatureFlags();
    const currentKanbanColumns = AppStore.getKanbanColumns();

    const taskIndex = currentTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
        LoggingService.error("[Kanban D&D] Dropped task not found in tasks array.", new Error("TaskNotFound"), {functionName, taskId, module: 'feature_kanban_board'});
        handleDragEnd({target: draggedTask});
        return;
    }

    const originalColumnId = currentTasks[taskIndex].kanbanColumnId;
    targetColumnUl.classList.remove('bg-slate-300', 'dark:bg-slate-700/70');

    if (originalColumnId === targetColumnId && targetColumnId !== 'done' && !currentTasks[taskIndex].completed) {
         handleDragEnd({target: draggedTask});
         return;
    }
    
    currentTasks[taskIndex].kanbanColumnId = targetColumnId;

    if (targetColumnId === 'done') {
        if (!currentTasks[taskIndex].completed) {
            currentTasks[taskIndex].completed = true;
            currentTasks[taskIndex].completedDate = Date.now();
            if (currentFeatureFlags.taskTimerSystem && window.AppFeatures?.TaskTimerSystemFeature?.handleTaskCompletion) {
                window.AppFeatures.TaskTimerSystemFeature.handleTaskCompletion(taskId, true);
            }
        }
    } else { 
        if (currentTasks[taskIndex].completed) {
            currentTasks[taskIndex].completed = false;
            currentTasks[taskIndex].completedDate = null;
            if (currentFeatureFlags.taskTimerSystem && window.AppFeatures?.TaskTimerSystemFeature?.handleTaskCompletion) {
                 window.AppFeatures.TaskTimerSystemFeature.handleTaskCompletion(taskId, false);
            }
        }
    }
    AppStore.setTasks(currentTasks); 

    // MODIFIED: Publish event instead of direct call
    const targetCol = currentKanbanColumns.find(c => c.id === targetColumnId);
    EventBus.publish('displayUserMessage', { text: `Task moved to "${targetCol?.title || targetColumnId}"`, type: 'success' });
    LoggingService.info(`[KanbanFeature] Task ${taskId} moved to column ${targetColumnId}.`, {functionName, taskId, targetColumnId, module: 'feature_kanban_board'});
}

/**
 * Public function to trigger rendering the Kanban view.
 * Called by refreshTaskView (in ui_rendering.js) when mode is 'kanban'.
 */
function publicRenderKanbanView() {
    const functionName = "publicRenderKanbanView";
    LoggingService.debug('[KanbanFeature] publicRenderKanbanView called.', {functionName, module: 'feature_kanban_board'});
    if (!isFeatureEnabled('kanbanBoardFeature')) {
         LoggingService.warn("[KanbanFeature] publicRenderKanbanView called but feature flag is off.", {functionName, module: 'feature_kanban_board'});
         return;
    }
    renderKanbanBoardInternal();
}

export const KanbanBoardFeature = {
    initialize: initializeKanbanBoardFeature,
    updateUIVisibility: updateKanbanBoardUIVisibility,
    renderKanbanView: publicRenderKanbanView
};

// MODIFIED: Replaced console.log
LoggingService.debug('[KanbanFeatureFile] KanbanBoardFeature object EXPORTED.', {module: 'feature_kanban_board'});
LoggingService.debug('[KanbanFeatureFile] feature_kanban_board.js script FINISHED executing as ES6 module.', {module: 'feature_kanban_board'});