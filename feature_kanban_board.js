// feature_kanban_board.js

// Self-invoking function to encapsulate the Kanban Board feature's code.
(function() {
    console.log('[KanbanFeatureFile] feature_kanban_board.js script STARTING to execute.');

    let draggedTask = null;

    /**
     * Initializes the Kanban board feature, primarily by loading column data.
     */
    function initializeKanbanBoardFeature() {
        loadKanbanColumns(); // Load column titles/structure from localStorage or defaults
        console.log('[KanbanFeatureFile] Kanban Board Feature Initialized (from initializeKanbanBoardFeature).');
    }

    /**
     * Updates the UI visibility based on whether the Kanban feature is enabled.
     * If enabled and in Kanban mode, it renders the board.
     * If disabled and in Kanban mode, it switches back to list view.
     * @param {boolean} isEnabled - Whether the Kanban feature flag is true.
     */
    function updateKanbanBoardUIVisibility(isEnabled) {
        // This function is primarily handled by applyActiveFeatures in ui_event_handlers.js
        // which hides/shows the toggle button. refreshTaskView handles the rendering.
        console.log(`[KanbanFeatureFile] updateKanbanBoardUIVisibility called with isEnabled: ${isEnabled}`);
        // No direct rendering here, refreshTaskView handles it based on currentTaskViewMode
    }

    /**
     * Renders the entire Kanban board view into the main content area.
     * Clears the existing content and adds the header (heading, buttons) and the Kanban columns.
     */
    function renderKanbanBoard() {
        console.log('[KanbanFeatureFile] renderKanbanBoard function START.'); // Added log
        const mainContentArea = document.querySelector('main');
        if (!mainContentArea) {
            console.error("[KanbanFeatureFile] Kanban: Main content area not found to render board.");
            return;
        }
        // Clear the main content area completely
        mainContentArea.innerHTML = '';
        console.log('[KanbanFeatureFile] Main content area cleared.');

        // --- Re-create the header structure (Heading + Buttons) ---
        const headerDiv = document.createElement('div');
        headerDiv.className = 'flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6';

        // Create and append the heading (reuse global reference if possible, or recreate)
        const heading = document.createElement('h2');
        heading.id = 'yourTasksHeading'; // Ensure the ID is present
        heading.className = 'text-xl sm:text-2xl md:text-3xl font-semibold text-slate-800 dark:text-slate-100';
        // The text content will be set by updateYourTasksHeading called within refreshTaskView
        headerDiv.appendChild(heading);
        yourTasksHeading = heading; // Update global reference

        // Create and append the buttons container
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'flex gap-2 mt-3 sm:mt-0 flex-wrap items-center';

        // Re-append the Kanban toggle button (it should exist)
        // We rely on initializeDOMElements having run and the global `kanbanViewToggleBtn` being available.
        if (kanbanViewToggleBtn) {
            buttonsDiv.appendChild(kanbanViewToggleBtn);
            console.log('[KanbanFeatureFile] Kanban toggle button re-appended.');
        } else {
            console.warn('[KanbanFeatureFile] Kanban toggle button reference missing during board render.');
        }
        // Note: Sort buttons are intentionally NOT added here as they are hidden in Kanban view
        // by updateKanbanViewToggleButtonState.

        headerDiv.appendChild(buttonsDiv);
        mainContentArea.appendChild(headerDiv);
        console.log('[KanbanFeatureFile] Header structure (heading, button div) added to main content area.');
        // --- End Header Structure ---

        // Create the Kanban container for columns
        const kanbanContainer = document.createElement('div');
        kanbanContainer.id = 'kanbanBoardContainer';
        // Added min-h-[calc(100vh-200px)] or similar to ensure it takes up space
        kanbanContainer.className = 'flex flex-col sm:flex-row gap-4 p-0 overflow-x-auto min-h-[calc(100vh-200px)]'; // Adjust min-height as needed

        // Create and append each column
        kanbanColumns.forEach(column => {
            const columnEl = createKanbanColumnElement(column);
            kanbanContainer.appendChild(columnEl);
        });
        mainContentArea.appendChild(kanbanContainer);
        console.log('[KanbanFeatureFile] Kanban container and columns added.');

        // Set up drag and drop listeners for the newly created elements
        setupDragAndDropListeners();
        console.log('[KanbanFeatureFile] Drag and drop listeners set up.');

        // Ensure the heading and button state are correct *after* adding them to the DOM
        updateYourTasksHeading();
        updateKanbanViewToggleButtonState();
        console.log('[KanbanFeatureFile] Heading and toggle button state updated.');
    }


    /**
     * Creates the HTML structure for a single Kanban column.
     * @param {object} column - The column data object {id: string, title: string}.
     * @returns {HTMLElement} - The div element representing the column.
     */
    function createKanbanColumnElement(column) {
        const columnWrapper = document.createElement('div');
        columnWrapper.className = 'kanban-column flex-shrink-0 w-full sm:w-72 md:w-80 bg-slate-200 dark:bg-slate-800 rounded-lg shadow-md flex flex-col';
        columnWrapper.dataset.columnId = column.id;

        // Column Header
        const header = document.createElement('div');
        header.className = 'p-3 border-b border-slate-300 dark:border-slate-700 flex justify-between items-center';
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.value = column.title;
        titleInput.className = 'kanban-column-title-input text-lg font-semibold text-slate-700 dark:text-slate-200 bg-transparent border-none focus:ring-2 focus:ring-sky-500 rounded p-1 w-full';
        // Event listeners for editing column title
        titleInput.addEventListener('change', (e) => {
            updateKanbanColumnTitle(column.id, e.target.value);
        });
        titleInput.addEventListener('blur', (e) => {
             if (e.target.value !== column.title) {
                updateKanbanColumnTitle(column.id, e.target.value);
             }
        });
        header.appendChild(titleInput);

        // Task List Area
        const taskListUl = document.createElement('ul');
        taskListUl.className = 'kanban-task-list p-3 space-y-3 overflow-y-auto flex-grow min-h-[150px]'; // Added min-h
        taskListUl.dataset.columnId = column.id; // Important for drop handling

        // Filter and append tasks for this column
        const tasksInColumn = tasks.filter(task => {
            // Special handling for 'Done' column to include completed tasks regardless of their last column
            if (column.id === 'done') {
                // If a task is marked completed AND its kanbanColumnId is NOT already 'done',
                // OR if its kanbanColumnId IS 'done', show it here.
                 return task.completed || task.kanbanColumnId === 'done';
                 // Simpler: return task.kanbanColumnId === column.id || (task.completed && task.kanbanColumnId !== 'done');
            }
            // For other columns, show only non-completed tasks belonging to this column
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
     * Creates the HTML structure for a single task card within a Kanban column.
     * @param {object} task - The task data object.
     * @returns {HTMLElement} - The li element representing the task card.
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
            pB.className = `priority-badge ${getPriorityClass(task.priority)}`; // Assumes getPriorityClass is global
            detailsContainer.appendChild(pB);
        }
        if (task.label) {
            const lB = document.createElement('span');
            lB.textContent = task.label;
            lB.className = 'label-badge'; // Assumes styles are defined globally
            detailsContainer.appendChild(lB);
        }
        if (task.dueDate) {
            const dDS = document.createElement('span');
            dDS.className = 'text-slate-500 dark:text-slate-400 flex items-center';
            let dD = formatDate(task.dueDate); // Assumes formatDate is global
            if (task.time) { dD += ` ${formatTime(task.time)}`; } // Assumes formatTime is global
            dDS.innerHTML = `<i class="far fa-calendar-alt mr-1"></i> ${dD}`;
            detailsContainer.appendChild(dDS);
        }
         // Add Sub-task icon if applicable
        if (featureFlags.subTasksFeature && task.subTasks && task.subTasks.length > 0) {
            const subTaskIcon = document.createElement('span');
            subTaskIcon.className = 'text-slate-400 dark:text-slate-500 flex items-center sub-tasks-feature-element';
            const completedSubTasks = task.subTasks.filter(st => st.completed).length;
            subTaskIcon.innerHTML = `<i class="fas fa-tasks mr-1" title="${completedSubTasks}/${task.subTasks.length} sub-tasks completed"></i>`;
            detailsContainer.appendChild(subTaskIcon);
        }


        if (detailsContainer.hasChildNodes()) {
            taskCard.appendChild(detailsContainer);
        }

        // Click listener to open view details modal
        taskCard.addEventListener('click', (event) => {
            // Prevent modal opening if clicking on interactive elements within the card (if any added later)
            if (event.target.closest('button, input, select, textarea, a')) return;
            openViewTaskDetailsModal(task.id); // Assumes openViewTaskDetailsModal is global
        });

        return taskCard;
    }

    /**
     * Sets up drag and drop event listeners for task cards and columns.
     */
    function setupDragAndDropListeners() {
        const taskCards = document.querySelectorAll('.kanban-task-card');
        const columns = document.querySelectorAll('.kanban-task-list'); // Target the UL elements

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

    // --- Drag and Drop Event Handlers ---

    function handleDragStart(event) {
        draggedTask = event.target; // The element being dragged (the task card li)
        event.dataTransfer.setData('text/plain', event.target.dataset.taskId);
        event.dataTransfer.effectAllowed = 'move';
        // Add visual indication that dragging has started
        setTimeout(() => { // Timeout ensures style applies after drag starts
            event.target.classList.add('opacity-50', 'border-dashed', 'border-sky-500');
        }, 0);
        console.log(`[Kanban D&D] Drag Start: Task ID ${event.target.dataset.taskId}`);
    }

    function handleDragEnd(event) {
         // Remove visual indication when dragging stops
        event.target.classList.remove('opacity-50', 'border-dashed', 'border-sky-500');
        // Clear the reference to the dragged task
        draggedTask = null;
        // Remove highlight from all columns
        document.querySelectorAll('.kanban-task-list').forEach(col => col.classList.remove('bg-slate-300', 'dark:bg-slate-700/70'));
        console.log(`[Kanban D&D] Drag End: Task ID ${event.target.dataset.taskId}`);
    }

    function handleDragOver(event) {
        event.preventDefault(); // Necessary to allow dropping
        const columnUl = event.target.closest('.kanban-task-list');
        if (columnUl) {
            // Add highlight to the column being hovered over
            columnUl.classList.add('bg-slate-300', 'dark:bg-slate-700/70');
            event.dataTransfer.dropEffect = 'move';
        } else {
             event.dataTransfer.dropEffect = 'none';
        }
    }

    function handleDragLeave(event) {
        const columnUl = event.target.closest('.kanban-task-list');
        if (columnUl) {
             // Remove highlight when dragging leaves the column
            columnUl.classList.remove('bg-slate-300', 'dark:bg-slate-700/70');
        }
    }

    function handleDrop(event) {
        event.preventDefault(); // Prevent default drop behavior (like opening link)
        const targetColumnUl = event.target.closest('.kanban-task-list');

        if (!targetColumnUl || !draggedTask) {
            console.warn("[Kanban D&D] Drop failed: No target column or dragged task.");
            if(draggedTask) handleDragEnd({target: draggedTask}); // Clean up dragged task style if drop failed
            return;
        }

        const targetColumnId = targetColumnUl.dataset.columnId;
        const taskId = parseInt(draggedTask.dataset.taskId);
        const originalColumnId = tasks.find(t => t.id === taskId)?.kanbanColumnId;

        // Remove highlight from the target column
        targetColumnUl.classList.remove('bg-slate-300', 'dark:bg-slate-700/70');

        // Don't re-render if dropped in the same column (unless it's the 'Done' column state change)
        if (originalColumnId === targetColumnId && targetColumnId !== 'done') {
             console.log(`[Kanban D&D] Task ${taskId} dropped in the same column (${targetColumnId}). No change.`);
             // handleDragEnd will clean up the style
             return;
        }


        console.log(`[Kanban D&D] Drop: Task ID ${taskId} dropped onto Column ID ${targetColumnId}`);

        // Find the task in the main tasks array
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
            console.error("[Kanban D&D] Dropped task not found in tasks array.");
            return;
        }

        // Update the task's column ID
        tasks[taskIndex].kanbanColumnId = targetColumnId;

        // Handle completion status based on dropping into 'Done' column
        if (targetColumnId === 'done') {
            // If task is not already completed, mark it as completed
            if (!tasks[taskIndex].completed) {
                tasks[taskIndex].completed = true;
                tasks[taskIndex].completedDate = Date.now();
                console.log(`[Kanban D&D] Task ${taskId} marked as completed.`);
                // Trigger timer stop if Task Timer System is active
                if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem) {
                    window.AppFeatures.TaskTimerSystem.handleTaskCompletion(taskId, true);
                }
            }
        } else {
            // If task was moved out of 'Done', mark it as not completed
            if (tasks[taskIndex].completed) {
                tasks[taskIndex].completed = false;
                tasks[taskIndex].completedDate = null;
                console.log(`[Kanban D&D] Task ${taskId} marked as not completed.`);
            }
        }

        // Save the updated tasks array
        saveTasks(); // Assumes saveTasks is global

        // Re-render the entire Kanban board to reflect the change
        renderKanbanBoard(); // Re-render the board which includes setupDragAndDropListeners

        // Provide user feedback
        showMessage(`Task moved to "${kanbanColumns.find(c=>c.id === targetColumnId)?.title || targetColumnId}"`, 'success'); // Assumes showMessage is global
    }

    /**
     * Public function to trigger rendering the Kanban view.
     * Called by refreshTaskView when mode is 'kanban'.
     */
    function renderKanbanView() {
        console.log('[KanbanFeatureFile] renderKanbanView called. Rendering board...'); // Added log
        if (!featureFlags.kanbanBoardFeature) {
             console.warn("[KanbanFeatureFile] renderKanbanView called but feature flag is off.");
             return; // Should not happen if refreshTaskView logic is correct, but safe check
        }
        // The main logic is now inside renderKanbanBoard
        renderKanbanBoard();
    }

    /**
     * Public function to trigger rendering the List view.
     * Called by refreshTaskView when mode is 'list'.
     */
    function renderListView() {
        console.log('[KanbanFeatureFile] renderListView called. Calling global renderTaskListView...'); // Added log
        // This function is primarily handled by the global renderTaskListView in ui_rendering.js
        // We ensure the global function is called if needed for consistency, though refreshTaskView handles the switch.
        if (typeof renderTaskListView === 'function') {
            renderTaskListView(); // Call the function from ui_rendering.js
        } else {
            console.error("[KanbanFeatureFile] Global renderTaskListView function not found.");
        }
    }

    // --- Expose Public Interface ---
    console.log('[KanbanFeatureFile] Attempting to define window.AppFeatures.KanbanBoard...');
    if (typeof window.AppFeatures === 'undefined') {
        window.AppFeatures = {};
        console.log('[KanbanFeatureFile] window.AppFeatures object created by KanbanBoard.');
    } else {
        console.log('[KanbanFeatureFile] window.AppFeatures object already exists.');
    }

    // Define the public methods for the KanbanBoard feature
    window.AppFeatures.KanbanBoard = {
        initialize: initializeKanbanBoardFeature,
        updateUIVisibility: updateKanbanBoardUIVisibility, // May not be strictly needed if applyActiveFeatures handles button visibility
        renderKanbanView: renderKanbanView, // Called by refreshTaskView
        renderListView: renderListView, // May not be strictly needed if refreshTaskView handles it
        renderKanbanBoard: renderKanbanBoard // Internally used by renderKanbanView
    };

    console.log('[KanbanFeatureFile] window.AppFeatures.KanbanBoard DEFINED:', window.AppFeatures.KanbanBoard);
    if(window.AppFeatures.KanbanBoard) {
        console.log('[KanbanFeatureFile] typeof window.AppFeatures.KanbanBoard.renderKanbanView is:', typeof window.AppFeatures.KanbanBoard.renderKanbanView);
        console.log('[KanbanFeatureFile] typeof window.AppFeatures.KanbanBoard.initialize is:', typeof window.AppFeatures.KanbanBoard.initialize);
    }
    console.log('[KanbanFeatureFile] feature_kanban_board.js script FINISHED executing.');
})(); // Immediately invoke the function expression
