// feature_kanban_board.js

// Self-invoking function to encapsulate the Kanban Board feature's code.
(function() {
    console.log('[KanbanFeatureFile] feature_kanban_board.js script STARTING to execute.');

    let draggedTask = null;

    /**
     * Initializes the Kanban board feature, primarily by loading column data.
     * Note: loadKanbanColumns is now called directly in store.js on initial load.
     */
    function initializeKanbanBoardFeature() {
        // loadKanbanColumns(); // This is now handled by store.js
        console.log('[KanbanFeatureFile] Kanban Board Feature Initialized (from initializeKanbanBoardFeature).');
    }

    /**
     * Updates the UI visibility based on whether the Kanban feature is enabled.
     * @param {boolean} isEnabled - Whether the Kanban feature flag is true.
     */
    function updateKanbanBoardUIVisibility(isEnabled) {
        console.log(`[KanbanFeatureFile] updateKanbanBoardUIVisibility called with isEnabled: ${isEnabled}`);
        // Actual rendering and visibility of the board itself is handled by refreshTaskView
        // based on currentTaskViewMode and featureFlags.
        // This function could handle other specific UI elements if any.
    }

    /**
     * Updates the title of a specific Kanban column and saves the changes.
     * @param {string} columnId - The ID of the column to update.
     * @param {string} newTitle - The new title for the column.
     */
    function updateKanbanColumnTitle(columnId, newTitle) {
        // Assumes kanbanColumns and saveKanbanColumns are globally available from store.js
        // Assumes featureFlags and currentTaskViewMode are also global from store.js (or ViewManager)
        if (typeof kanbanColumns === 'undefined' || typeof saveKanbanColumns !== 'function') {
            console.error("[KanbanBoard] 'kanbanColumns' or 'saveKanbanColumns' not found in global scope (expected from store.js).");
            return;
        }
        if (typeof featureFlags === 'undefined' || typeof currentTaskViewMode === 'undefined') {
            console.error("[KanbanBoard] 'featureFlags' or 'currentTaskViewMode' not found in global scope.");
            return;
        }


        const columnIndex = kanbanColumns.findIndex(col => col.id === columnId);
        if (columnIndex !== -1) {
            if (kanbanColumns[columnIndex].title !== newTitle.trim()) {
                kanbanColumns[columnIndex].title = newTitle.trim();
                saveKanbanColumns(); // Save to localStorage via store.js
                console.log(`[KanbanBoard] Column "${columnId}" title updated to "${newTitle.trim()}".`);

                // If the Kanban board is currently visible, re-render it to show the new title.
                // This check ensures we only re-render if necessary.
                if (currentTaskViewMode === 'kanban' && featureFlags.kanbanBoardFeature) {
                    renderKanbanBoard(); // Re-render the board
                }
            }
        } else {
            console.warn(`[KanbanBoard] Column with ID "${columnId}" not found for title update.`);
        }
    }


    /**
     * Renders the entire Kanban board view into the main content area.
     */
    function renderKanbanBoard() {
        console.log('[KanbanFeatureFile] renderKanbanBoard function START.');
        // Assumes DOM elements like 'mainContentArea', 'yourTasksHeading', 'kanbanViewToggleBtn'
        // and state like 'kanbanColumns', 'tasks', 'featureFlags' are available (from store.js or ui_rendering.js for DOM elements).
        // Assumes helper functions like 'createKanbanColumnElement', 'setupDragAndDropListeners',
        // 'updateYourTasksHeading', 'updateViewToggleButtonsState' (renamed from updateKanbanViewToggleButtonState) are available.

        const mainContentArea = document.querySelector('main'); // Consider getting this from ui_rendering.js if it's initialized there
        if (!mainContentArea) {
            console.error("[KanbanFeatureFile] Kanban: Main content area not found to render board.");
            return;
        }
        mainContentArea.innerHTML = ''; // Clear previous content (list view, calendar, etc.)
        console.log('[KanbanFeatureFile] Main content area cleared for Kanban board.');

        // --- Re-create the header structure (Heading + Buttons) ---
        const headerDiv = document.createElement('div');
        headerDiv.className = 'flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6';

        const headingEl = document.getElementById('yourTasksHeading') || document.createElement('h2');
        headingEl.id = 'yourTasksHeading';
        headingEl.className = 'text-xl sm:text-2xl md:text-3xl font-semibold text-slate-800 dark:text-slate-100';
        // Text content will be set by updateYourTasksHeading (from ui_rendering.js)
        headerDiv.appendChild(headingEl);
        if (!document.getElementById('yourTasksHeading')) yourTasksHeading = headingEl; // Ensure global reference if created new

        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'flex gap-2 mt-3 sm:mt-0 flex-wrap items-center';

        // View toggle buttons (Pomodoro, Calendar, Kanban/List)
        // These buttons should be created/managed by ui_rendering.js and ui_event_handlers.js
        // For now, we append existing ones if they are found globally.
        const pomodoroBtn = document.getElementById('pomodoroViewToggleBtn');
        if (pomodoroBtn) buttonsDiv.appendChild(pomodoroBtn);

        const calendarBtn = document.getElementById('calendarViewToggleBtn');
        if (calendarBtn) buttonsDiv.appendChild(calendarBtn);

        const kanbanBtn = document.getElementById('kanbanViewToggleBtn'); // This is the Kanban/List toggle
        if (kanbanBtn) buttonsDiv.appendChild(kanbanBtn);

        headerDiv.appendChild(buttonsDiv);
        mainContentArea.appendChild(headerDiv);
        console.log('[KanbanFeatureFile] Header structure added to main content area.');
        // --- End Header Structure ---

        const kanbanContainer = document.createElement('div');
        kanbanContainer.id = 'kanbanBoardContainer'; // This ID is used by ui_rendering to hide/show
        kanbanContainer.className = 'flex flex-col sm:flex-row gap-4 p-0 overflow-x-auto min-h-[calc(100vh-250px)]';
        kanbanContainer.classList.remove('hidden'); // Ensure it's visible

        if (typeof kanbanColumns === 'undefined' || !Array.isArray(kanbanColumns)) {
            console.error("[KanbanBoard] 'kanbanColumns' is not defined or not an array (expected from store.js). Cannot render columns.");
            return;
        }

        kanbanColumns.forEach(column => {
            const columnEl = createKanbanColumnElement(column);
            kanbanContainer.appendChild(columnEl);
        });
        mainContentArea.appendChild(kanbanContainer);
        console.log('[KanbanFeatureFile] Kanban container and columns added.');

        setupDragAndDropListeners();
        console.log('[KanbanFeatureFile] Drag and drop listeners set up.');

        // Update heading and button states after rendering
        if (typeof updateYourTasksHeading === 'function') updateYourTasksHeading();
        if (typeof updateViewToggleButtonsState === 'function') updateViewToggleButtonsState(); // General function for all view toggles
        console.log('[KanbanFeatureFile] Heading and toggle button state updated.');
    }


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
            updateKanbanColumnTitle(column.id, e.target.value); // Call the moved function
        });
        titleInput.addEventListener('blur', (e) => {
             if (e.target.value !== column.title) {
                updateKanbanColumnTitle(column.id, e.target.value); // Call the moved function
             }
        });
        header.appendChild(titleInput);

        const taskListUl = document.createElement('ul');
        taskListUl.className = 'kanban-task-list p-3 space-y-3 overflow-y-auto flex-grow min-h-[150px]';
        taskListUl.dataset.columnId = column.id;

        if (typeof tasks === 'undefined' || !Array.isArray(tasks)) {
            console.error("[KanbanBoard] 'tasks' is not defined or not an array (expected from store.js). Cannot render tasks in columns.");
            columnWrapper.appendChild(header);
            columnWrapper.appendChild(taskListUl);
            return columnWrapper; // Return column even if tasks are missing
        }

        const tasksInColumn = tasks.filter(task => {
            if (column.id === 'done') {
                 return task.completed || task.kanbanColumnId === 'done';
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

        // Assumes getPriorityClass, formatDate, formatTime are available (from taskService.js or utils.js)
        if (task.priority && typeof getPriorityClass === 'function') {
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
        if (task.dueDate && typeof formatDate === 'function') {
            const dDS = document.createElement('span');
            dDS.className = 'text-slate-500 dark:text-slate-400 flex items-center';
            let dD = formatDate(task.dueDate);
            if (task.time && typeof formatTime === 'function') { dD += ` ${formatTime(task.time)}`; }
            dDS.innerHTML = `<i class="far fa-calendar-alt mr-1"></i> ${dD}`;
            detailsContainer.appendChild(dDS);
        }
        if (typeof featureFlags !== 'undefined' && featureFlags.subTasksFeature && task.subTasks && task.subTasks.length > 0) {
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
            if (typeof openViewTaskDetailsModal === 'function') openViewTaskDetailsModal(task.id);
        });
        return taskCard;
    }

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
        console.log(`[KanbanFeatureFile] Added D&D listeners to ${taskCards.length} cards and ${columns.length} columns.`);
    }

    function handleDragStart(event) {
        draggedTask = event.target;
        event.dataTransfer.setData('text/plain', event.target.dataset.taskId);
        event.dataTransfer.effectAllowed = 'move';
        setTimeout(() => {
            event.target.classList.add('opacity-50', 'border-dashed', 'border-sky-500');
        }, 0);
        console.log(`[Kanban D&D] Drag Start: Task ID ${event.target.dataset.taskId}`);
    }

    function handleDragEnd(event) {
        event.target.classList.remove('opacity-50', 'border-dashed', 'border-sky-500');
        draggedTask = null;
        document.querySelectorAll('.kanban-task-list').forEach(col => col.classList.remove('bg-slate-300', 'dark:bg-slate-700/70'));
        console.log(`[Kanban D&D] Drag End: Task ID ${event.target.dataset.taskId}`);
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
        event.preventDefault();
        const targetColumnUl = event.target.closest('.kanban-task-list');

        if (!targetColumnUl || !draggedTask) {
            console.warn("[Kanban D&D] Drop failed: No target column or dragged task.");
            if(draggedTask) handleDragEnd({target: draggedTask});
            return;
        }

        const targetColumnId = targetColumnUl.dataset.columnId;
        const taskId = parseInt(draggedTask.dataset.taskId);
        const taskIndex = tasks.findIndex(t => t.id === taskId);

        if (taskIndex === -1) {
            console.error("[Kanban D&D] Dropped task not found in tasks array.");
            return;
        }

        const originalColumnId = tasks[taskIndex].kanbanColumnId;
        targetColumnUl.classList.remove('bg-slate-300', 'dark:bg-slate-700/70');

        if (originalColumnId === targetColumnId && targetColumnId !== 'done') {
             console.log(`[Kanban D&D] Task ${taskId} dropped in the same column (${targetColumnId}). No change.`);
             return;
        }

        console.log(`[Kanban D&D] Drop: Task ID ${taskId} onto Column ID ${targetColumnId}`);
        tasks[taskIndex].kanbanColumnId = targetColumnId;

        if (targetColumnId === 'done') {
            if (!tasks[taskIndex].completed) {
                tasks[taskIndex].completed = true;
                tasks[taskIndex].completedDate = Date.now();
                console.log(`[Kanban D&D] Task ${taskId} marked as completed.`);
                if (typeof featureFlags !== 'undefined' && featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem) {
                    window.AppFeatures.TaskTimerSystem.handleTaskCompletion(taskId, true);
                }
            }
        } else {
            if (tasks[taskIndex].completed) {
                tasks[taskIndex].completed = false;
                tasks[taskIndex].completedDate = null;
                console.log(`[Kanban D&D] Task ${taskId} marked as not completed.`);
            }
        }

        if (typeof saveTasks === 'function') saveTasks();
        else console.error("[KanbanBoard] 'saveTasks' function not found (expected from store.js).");

        renderKanbanBoard(); // Re-render the entire board

        if (typeof showMessage === 'function') {
            const targetCol = (typeof kanbanColumns !== 'undefined') ? kanbanColumns.find(c => c.id === targetColumnId) : null;
            showMessage(`Task moved to "${targetCol?.title || targetColumnId}"`, 'success');
        }
    }

    // Public function to trigger rendering the Kanban view.
    function publicRenderKanbanView() {
        console.log('[KanbanFeatureFile] publicRenderKanbanView called. Rendering board...');
        if (typeof featureFlags === 'undefined' || !featureFlags.kanbanBoardFeature) {
             console.warn("[KanbanFeatureFile] publicRenderKanbanView called but feature flag is off or featureFlags not defined.");
             return;
        }
        renderKanbanBoard();
    }

    if (typeof window.AppFeatures === 'undefined') {
        window.AppFeatures = {};
    }

    window.AppFeatures.KanbanBoard = {
        initialize: initializeKanbanBoardFeature,
        updateUIVisibility: updateKanbanBoardUIVisibility,
        renderKanbanView: publicRenderKanbanView, // Expose the main render function
        // updateKanbanColumnTitle is now internal to this module, called by event listeners
        // No need to expose renderKanbanBoard directly if publicRenderKanbanView calls it.
    };

    console.log('[KanbanFeatureFile] window.AppFeatures.KanbanBoard DEFINED:', window.AppFeatures.KanbanBoard);
    console.log('[KanbanFeatureFile] feature_kanban_board.js script FINISHED executing.');
})();
