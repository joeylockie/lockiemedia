// feature_kanban_board.js

// Self-invoking function to encapsulate the Kanban Board feature's code.
(function() {
    // --- DOM Element References (to be obtained when needed) ---
    let taskListContainer; // The main container where tasks or kanban board will be rendered (e.g., the parent of 'taskList' ul)
    let kanbanBoardViewToggleBtn; // The button to switch to Kanban view / list view

    // --- Feature-Specific State ---
    let draggedTask = null; // To keep track of the task being dragged

    /**
     * Initializes the Kanban Board Feature.
     * This function should be called if the 'kanbanBoardFeature' flag is true.
     */
    function initializeKanbanBoardFeature() {
        // Get references to main DOM elements
        // taskListContainer will be the 'main' element or a specific div inside it.
        // For now, we'll assume 'taskList' is the UL for list view, and we'll replace its content
        // or hide it when Kanban is active.
        const mainContentArea = document.querySelector('main'); // Or a more specific selector
        if (mainContentArea) {
            // We will create a new div for the kanban board and append it to the mainContentArea
            // or replace the existing taskList ul. For now, let's assume we clear the mainContentArea
            // and then render either the list or the board.
        } else {
            console.error("Kanban Board: Main content area not found for initialization.");
            return;
        }

        // The view toggle button will be created dynamically or needs a specific ID in todo.html
        // For now, its setup will be handled in ui_event_handlers.js where other buttons are managed.

        loadKanbanColumns(); // Load custom column titles from app_logic.js

        console.log('Kanban Board Feature Initialized.');
    }

    /**
     * Updates the visibility of UI elements specific to the Kanban Board feature.
     * This includes the toggle button.
     * @param {boolean} isEnabled - True if the feature is enabled, false otherwise.
     */
    function updateKanbanBoardUIVisibility(isEnabled) {
        // The view toggle button's visibility will be managed in ui_event_handlers.js
        // based on this flag.
        if (isEnabled) {
            console.log("Kanban board UI elements should be made visible if feature is on.");
            // If currentTaskViewMode is 'kanban', render the board.
            if (currentTaskViewMode === 'kanban') {
                renderKanbanView();
            }
        } else {
            // If feature is turned off, ensure we switch back to list view if kanban was active.
            if (currentTaskViewMode === 'kanban') {
                setTaskViewMode('list'); // from app_logic.js
                renderListView(); // This will call the original renderTasks()
            }
            console.log("Kanban board UI elements should be hidden if feature is off.");
        }
    }

    /**
     * Renders the entire Kanban board structure into the main content area.
     * This function will replace the existing task list.
     */
    function renderKanbanBoard() {
        const mainContentArea = document.querySelector('main'); // Or your specific task display area
        if (!mainContentArea) {
            console.error("Kanban: Main content area not found to render board.");
            return;
        }

        // Clear existing content (e.g., the task list or previous kanban board)
        mainContentArea.innerHTML = ''; // This is a simple way; more robust might involve removing specific children

        const kanbanContainer = document.createElement('div');
        kanbanContainer.id = 'kanbanBoardContainer';
        kanbanContainer.className = 'flex flex-col sm:flex-row gap-4 p-0 overflow-x-auto'; // Adjusted padding for internal scrolling

        kanbanColumns.forEach(column => {
            const columnEl = createKanbanColumnElement(column);
            kanbanContainer.appendChild(columnEl);
        });

        mainContentArea.appendChild(kanbanContainer);
        setupDragAndDropListeners();
    }

    /**
     * Creates a single Kanban column element.
     * @param {object} column - The column data (e.g., { id: 'todo', title: 'To Do' }).
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
            updateKanbanColumnTitle(column.id, e.target.value); // from app_logic.js
            // No need to re-render the whole board, just the title in app_logic state is updated.
            // If visual update is needed here, it would be direct DOM manipulation or a targeted re-render.
        });
        titleInput.addEventListener('blur', (e) => { // Save on blur as well
             if (e.target.value !== column.title) {
                updateKanbanColumnTitle(column.id, e.target.value);
             }
        });


        header.appendChild(titleInput);
        // Placeholder for a menu or add task button per column if desired later
        // const menuButton = document.createElement('button');
        // menuButton.innerHTML = '<i class="fas fa-ellipsis-v text-slate-500 dark:text-slate-400"></i>';
        // menuButton.className = 'p-1 rounded hover:bg-slate-300 dark:hover:bg-slate-700';
        // header.appendChild(menuButton);

        const taskListUl = document.createElement('ul');
        taskListUl.className = 'kanban-task-list p-3 space-y-3 overflow-y-auto flex-grow min-h-[150px]'; // Added min-h
        taskListUl.dataset.columnId = column.id; // For drop target identification

        // Filter tasks for this column (excluding completed tasks, unless it's the "Done" column)
        const tasksInColumn = tasks.filter(task => {
            if (column.id === 'done') { // 'done' column specifically shows completed tasks
                return task.kanbanColumnId === column.id || (task.completed && task.kanbanColumnId !== 'done');
            }
            return task.kanbanColumnId === column.id && !task.completed;
        });


        tasksInColumn.forEach(task => {
            const taskEl = createKanbanTaskElement(task);
            taskListUl.appendChild(taskEl);
        });

        columnWrapper.appendChild(header);
        columnWrapper.appendChild(taskListUl);
        return columnWrapper;
    }

    /**
     * Creates a single Kanban task card element.
     * @param {object} task - The task data.
     * @returns {HTMLElement} The created task card element.
     */
    function createKanbanTaskElement(task) {
        const taskCard = document.createElement('li');
        taskCard.className = `kanban-task-card bg-white dark:bg-slate-700 p-3 rounded-md shadow hover:shadow-lg transition-shadow cursor-grab active:cursor-grabbing ${task.completed ? 'opacity-70' : ''}`;
        taskCard.draggable = true;
        taskCard.dataset.taskId = task.id;

        // Task Text
        const taskText = document.createElement('p');
        taskText.textContent = task.text;
        taskText.className = `text-sm font-medium text-slate-800 dark:text-slate-100 mb-2 break-words ${task.completed ? 'line-through' : ''}`;
        taskCard.appendChild(taskText);

        // Details (Priority, Label, Due Date)
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'flex flex-wrap items-center gap-x-2 gap-y-1 text-xs mt-1';

        if (task.priority) {
            const pB = document.createElement('span');
            pB.textContent = task.priority;
            pB.className = `priority-badge ${getPriorityClass(task.priority)}`; // from app_logic.js
            detailsContainer.appendChild(pB);
        }
        if (task.label) {
            const lB = document.createElement('span');
            lB.textContent = task.label;
            lB.className = 'label-badge'; // Assumes styles are defined in style.css
            detailsContainer.appendChild(lB);
        }
        if (task.dueDate) {
            const dDS = document.createElement('span');
            dDS.className = 'text-slate-500 dark:text-slate-400 flex items-center';
            let dD = formatDate(task.dueDate); // from app_logic.js
            if (task.time) { dD += ` ${formatTime(task.time)}`; } // from app_logic.js
            dDS.innerHTML = `<i class="far fa-calendar-alt mr-1"></i> ${dD}`;
            detailsContainer.appendChild(dDS);
        }
        if (detailsContainer.hasChildNodes()) {
            taskCard.appendChild(detailsContainer);
        }

        // Click to open View/Edit Modal (similar to list view)
        taskCard.addEventListener('click', (event) => {
            // Prevent modal opening if a button inside the card was clicked (if any added later)
            if (event.target.closest('button')) return;
            openViewTaskDetailsModal(task.id); // from modal_interactions.js
        });

        return taskCard;
    }

    /**
     * Sets up drag and drop event listeners for tasks and columns.
     */
    function setupDragAndDropListeners() {
        const taskCards = document.querySelectorAll('.kanban-task-card');
        const columns = document.querySelectorAll('.kanban-task-list'); // The ul elements

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
        draggedTask = event.target; // The task card li element
        event.dataTransfer.setData('text/plain', event.target.dataset.taskId);
        setTimeout(() => {
            event.target.classList.add('opacity-50', 'border-dashed', 'border-sky-500');
        }, 0);
        console.log('Drag Start:', event.target.dataset.taskId);
    }

    function handleDragEnd(event) {
        event.target.classList.remove('opacity-50', 'border-dashed', 'border-sky-500');
        draggedTask = null;
        // Clear any visual cues from columns
        document.querySelectorAll('.kanban-task-list').forEach(col => col.classList.remove('bg-slate-300', 'dark:bg-slate-700/70'));
        console.log('Drag End');
    }

    function handleDragOver(event) {
        event.preventDefault(); // Necessary to allow dropping
        const columnUl = event.target.closest('.kanban-task-list');
        if (columnUl) {
            columnUl.classList.add('bg-slate-300', 'dark:bg-slate-700/70'); // Highlight drop target
        }
    }
    
    function handleDragLeave(event) {
        const columnUl = event.target.closest('.kanban-task-list');
        if (columnUl) {
            columnUl.classList.remove('bg-slate-300', 'dark:bg-slate-700/70');
        }
    }

    function handleDrop(event) {
        event.preventDefault();
        const targetColumnUl = event.target.closest('.kanban-task-list');
        if (!targetColumnUl || !draggedTask) return;

        const targetColumnId = targetColumnUl.dataset.columnId;
        const taskId = parseInt(draggedTask.dataset.taskId);

        targetColumnUl.classList.remove('bg-slate-300', 'dark:bg-slate-700/70');

        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
            console.error("Dropped task not found in tasks array.");
            return;
        }

        // Update task's column and potentially completion status
        tasks[taskIndex].kanbanColumnId = targetColumnId;
        if (targetColumnId === 'done') {
            if (!tasks[taskIndex].completed) {
                tasks[taskIndex].completed = true;
                tasks[taskIndex].completedDate = Date.now();
                // If Task Timer System is active, handle timer stop on completion
                if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem) {
                    window.AppFeatures.TaskTimerSystem.handleTaskCompletion(taskId, true);
                }
            }
        } else {
            // If moved out of 'done' column, mark as not completed
            if (tasks[taskIndex].completed) {
                tasks[taskIndex].completed = false;
                tasks[taskIndex].completedDate = null;
                 // If Task Timer System is active, handle timer restart/uncompletion if needed (less common)
                if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem) {
                    // Potentially reset timer or allow re-timing.
                    // For now, handleTaskCompletion(taskId, false) might not do much if timer was already stopped.
                    // This aspect might need more thought if timers are to be "revived".
                }
            }
        }

        saveTasks(); // from app_logic.js
        renderKanbanBoard(); // Re-render the entire board to reflect the change
        // Also, if the main task list is visible elsewhere or needs update:
        // renderTasks(); // from ui_rendering.js - if you want to keep both views in sync
        showMessage(`Task moved to "${kanbanColumns.find(c=>c.id === targetColumnId)?.title || targetColumnId}"`, 'success');
    }


    /**
     * Switches the main task display to Kanban view.
     * Called by UI event handlers.
     */
    function renderKanbanView() {
        if (!featureFlags.kanbanBoardFeature) return;
        setTaskViewMode('kanban'); // from app_logic.js
        // Hide sort buttons typically used for list view
        if(sortByDueDateBtn) sortByDueDateBtn.classList.add('hidden');
        if(sortByPriorityBtn) sortByPriorityBtn.classList.add('hidden');
        if(sortByLabelBtn) sortByLabelBtn.classList.add('hidden');
        // Hide label filter if active, or adjust its behavior for Kanban
        // For now, let's assume filters apply to the tasks shown within Kanban columns.
        // The global currentFilter will still apply.

        renderKanbanBoard();
        // Update the toggle button icon/text (will be handled in ui_event_handlers.js)
    }

    /**
     * Switches the main task display to List view.
     * Called by UI event handlers.
     */
    function renderListView() {
        setTaskViewMode('list'); // from app_logic.js
        // Show sort buttons
        if(sortByDueDateBtn) sortByDueDateBtn.classList.remove('hidden');
        if(sortByPriorityBtn) sortByPriorityBtn.classList.remove('hidden');
        if(sortByLabelBtn) sortByLabelBtn.classList.remove('hidden');

        const mainContentArea = document.querySelector('main');
        if (mainContentArea) {
            mainContentArea.innerHTML = ''; // Clear Kanban board
            const taskListUl = document.createElement('ul');
            taskListUl.id = 'taskList';
            taskListUl.className = 'space-y-3 sm:space-y-3.5';
            mainContentArea.appendChild(taskListUl);

            const emptyP = document.createElement('p');
            emptyP.id = 'emptyState';
            emptyP.className = 'text-center text-slate-500 dark:text-slate-400 mt-8 py-5 hidden';
            emptyP.textContent = 'No tasks yet. Add some!';
            mainContentArea.appendChild(emptyP);

            const noMatchP = document.createElement('p');
            noMatchP.id = 'noMatchingTasks';
            noMatchP.className = 'text-center text-slate-500 dark:text-slate-400 mt-8 py-5 hidden';
            noMatchP.textContent = 'No tasks match the current filter or search.';
            mainContentArea.appendChild(noMatchP);
        }
        renderTasks(); // This is the original function from ui_rendering.js
        // Update the toggle button icon/text (will be handled in ui_event_handlers.js)
    }


    // --- Expose Public Interface ---
    if (typeof window.AppFeatures === 'undefined') {
        window.AppFeatures = {};
    }

    window.AppFeatures.KanbanBoard = {
        initialize: initializeKanbanBoardFeature,
        updateUIVisibility: updateKanbanBoardUIVisibility,
        renderKanbanView: renderKanbanView,
        renderListView: renderListView,
        renderKanbanBoard: renderKanbanBoard // Expose for direct calls if needed (e.g. after column title change)
    };

})();
