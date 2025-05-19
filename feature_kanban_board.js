// feature_kanban_board.js

// Self-invoking function to encapsulate the Kanban Board feature's code.
(function() {
    console.log('[KanbanFeatureFile] feature_kanban_board.js script STARTING to execute.');

    let draggedTask = null; // Holds the DOM element of the task being dragged

    /**
     * Initializes the Kanban board feature.
     * Note: loadKanbanColumns is now called directly in store.js on initial load.
     */
    function initializeKanbanBoardFeature() {
        console.log('[KanbanFeatureFile] Kanban Board Feature Initialized.');
        // Any specific event listeners unique to Kanban board elements not handled by
        // dynamic rendering (like setupDragAndDropListeners) could be added here.
    }

    /**
     * Updates the UI visibility of elements specifically managed by this module,
     * if any, based on whether the Kanban feature is enabled.
     * @param {boolean} isEnabledParam - Parameter for consistency, actual check uses FeatureFlagService.
     */
    function updateKanbanBoardUIVisibility(isEnabledParam) {
        if (typeof FeatureFlagService === 'undefined') {
            console.error("[KanbanBoard] FeatureFlagService not available for UI visibility update.");
            return;
        }
        const isActuallyEnabled = FeatureFlagService.isFeatureEnabled('kanbanBoardFeature');
        console.log(`[KanbanFeatureFile] updateKanbanBoardUIVisibility called. Feature enabled: ${isActuallyEnabled}`);
        // Most UI toggling (like the main board container and toggle button) is handled by
        // refreshTaskView and applyActiveFeatures. This function is for any *additional*
        // specific UI elements this module might control directly.
    }

    /**
     * Updates the title of a specific Kanban column and saves the changes.
     * @param {string} columnId - The ID of the column to update.
     * @param {string} newTitle - The new title for the column.
     */
    function updateKanbanColumnTitle(columnId, newTitle) {
        // Assumes kanbanColumns, saveKanbanColumns, currentTaskViewMode, featureFlags are global from store.js
        // (featureFlags in store.js is populated by FeatureFlagService)
        if (typeof kanbanColumns === 'undefined' || typeof saveKanbanColumns !== 'function' ||
            typeof currentTaskViewMode === 'undefined' || typeof featureFlags === 'undefined') {
            console.error("[KanbanBoard] Core dependencies (kanbanColumns, saveKanbanColumns, currentTaskViewMode, featureFlags) not found.");
            return;
        }

        const columnIndex = kanbanColumns.findIndex(col => col.id === columnId);
        if (columnIndex !== -1) {
            const trimmedNewTitle = newTitle.trim();
            if (kanbanColumns[columnIndex].title !== trimmedNewTitle) {
                kanbanColumns[columnIndex].title = trimmedNewTitle;
                saveKanbanColumns(); // From store.js
                console.log(`[KanbanBoard] Column "${columnId}" title updated to "${trimmedNewTitle}".`);

                if (currentTaskViewMode === 'kanban' && featureFlags.kanbanBoardFeature) { // Check global flag from store.js
                    renderKanbanBoardInternal(); // Re-render the board
                }
            }
        } else {
            console.warn(`[KanbanBoard] Column with ID "${columnId}" not found for title update.`);
        }
    }

    /**
     * Internal function to render the entire Kanban board view.
     * This is called by the public renderKanbanView and by updateKanbanColumnTitle.
     */
    function renderKanbanBoardInternal() {
        console.log('[KanbanFeatureFile] renderKanbanBoardInternal function START.');
        // Assumes DOM elements like 'mainContentArea', 'yourTasksHeading', 'kanbanViewToggleBtn', etc.
        // are initialized and available globally or via ui_rendering.js.
        // Assumes state (tasks, kanbanColumns) from store.js.
        // Assumes helper functions (createKanbanColumnElement, etc.) are defined below.

        const currentMainContentArea = mainContentArea || document.querySelector('main');
        if (!currentMainContentArea) {
            console.error("[KanbanFeatureFile] Main content area not found to render board.");
            return;
        }
        currentMainContentArea.innerHTML = ''; // Clear previous content

        // --- Re-create the header structure ---
        const headerDiv = document.createElement('div');
        headerDiv.className = 'flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6';

        // Use existing 'yourTasksHeading' if available, otherwise create it.
        const headingEl = yourTasksHeading || document.createElement('h2');
        headingEl.id = 'yourTasksHeading'; // Ensure ID for other functions
        headingEl.className = 'text-xl sm:text-2xl md:text-3xl font-semibold text-slate-800 dark:text-slate-100';
        headerDiv.appendChild(headingEl);
        if (!yourTasksHeading) yourTasksHeading = headingEl; // Update global ref if newly created

        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'flex gap-2 mt-3 sm:mt-0 flex-wrap items-center';
        // Append existing toggle buttons (their visibility is managed by updateViewToggleButtonsState)
        if (pomodoroViewToggleBtn) buttonsDiv.appendChild(pomodoroViewToggleBtn);
        if (calendarViewToggleBtn) buttonsDiv.appendChild(calendarViewToggleBtn);
        if (kanbanViewToggleBtn) buttonsDiv.appendChild(kanbanViewToggleBtn);
        headerDiv.appendChild(buttonsDiv);
        currentMainContentArea.appendChild(headerDiv);
        // --- End Header Structure ---

        // The global kanbanBoardContainer (from ui_rendering.js) is the one to populate or ensure exists.
        // If it's not guaranteed to be a direct child of main, we might need to recreate it.
        // For now, assuming it's correctly handled/re-created by refreshTaskView if needed.
        // If this function completely rebuilds 'main', then kanbanBoardContainer needs to be re-created.
        const boardContainer = document.getElementById('kanbanBoardContainer') || document.createElement('div');
        boardContainer.id = 'kanbanBoardContainer';
        boardContainer.className = 'flex flex-col sm:flex-row gap-4 p-0 overflow-x-auto min-h-[calc(100vh-250px)]';
        boardContainer.innerHTML = ''; // Clear previous columns
        boardContainer.classList.remove('hidden');
        if (!document.getElementById('kanbanBoardContainer')) { // If it wasn't in DOM, append it
            currentMainContentArea.appendChild(boardContainer);
            kanbanBoardContainer = boardContainer; // Update global reference
        }


        if (typeof kanbanColumns === 'undefined' || !Array.isArray(kanbanColumns)) {
            console.error("[KanbanBoard] 'kanbanColumns' is not defined (expected from store.js).");
            return;
        }
        kanbanColumns.forEach(column => {
            const columnEl = createKanbanColumnElement(column);
            boardContainer.appendChild(columnEl);
        });

        setupDragAndDropListeners();

        if (typeof updateYourTasksHeading === 'function') updateYourTasksHeading();
        if (typeof updateViewToggleButtonsState === 'function') updateViewToggleButtonsState();
        console.log('[KanbanFeatureFile] Kanban board rendered internally.');
    }

    function createKanbanColumnElement(column) {
        // ... (implementation remains largely the same, ensure it uses global 'tasks' from store.js)
        // ... and calls the local 'updateKanbanColumnTitle' for edits.
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
            updateKanbanColumnTitle(column.id, e.target.value); // Call local function
        });
        titleInput.addEventListener('blur', (e) => {
             if (e.target.value.trim() !== column.title) { // Only update if changed
                updateKanbanColumnTitle(column.id, e.target.value);
             }
        });
        header.appendChild(titleInput);

        const taskListUl = document.createElement('ul');
        taskListUl.className = 'kanban-task-list p-3 space-y-3 overflow-y-auto flex-grow min-h-[150px]';
        taskListUl.dataset.columnId = column.id;

        if (typeof tasks === 'undefined' || !Array.isArray(tasks)) {
            console.error("[KanbanBoard] 'tasks' array not found (expected from store.js).");
        } else {
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
        }
        columnWrapper.appendChild(header);
        columnWrapper.appendChild(taskListUl);
        return columnWrapper;
    }

    function createKanbanTaskElement(task) {
        // ... (implementation remains largely the same)
        // Ensure it uses global FeatureFlagService, taskService.getPriorityClass, utils.formatDate/formatTime
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

        if (task.priority && typeof getPriorityClass === 'function') { // getPriorityClass from taskService.js
            const pB = document.createElement('span');
            pB.textContent = task.priority;
            pB.className = `priority-badge ${getPriorityClass(task.priority)}`;
            detailsContainer.appendChild(pB);
        }
        // ... (other details like label, due date, sub-tasks using FeatureFlagService)
        if (task.label) {
            const lB = document.createElement('span');
            lB.textContent = task.label;
            lB.className = 'label-badge';
            detailsContainer.appendChild(lB);
        }
        if (task.dueDate && typeof formatDate === 'function') { // formatDate from utils.js
            const dDS = document.createElement('span');
            dDS.className = 'text-slate-500 dark:text-slate-400 flex items-center';
            let dD = formatDate(task.dueDate);
            if (task.time && typeof formatTime === 'function') { dD += ` ${formatTime(task.time)}`; } // formatTime from utils.js
            dDS.innerHTML = `<i class="far fa-calendar-alt mr-1"></i> ${dD}`;
            detailsContainer.appendChild(dDS);
        }
        if (typeof FeatureFlagService !== 'undefined' && FeatureFlagService.isFeatureEnabled('subTasksFeature') && task.subTasks && task.subTasks.length > 0) {
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
            if (typeof openViewTaskDetailsModal === 'function') openViewTaskDetailsModal(task.id); // global from modal_interactions.js
        });
        return taskCard;
    }

    function setupDragAndDropListeners() {
        // ... (implementation remains the same)
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
        // ... (implementation remains the same)
        draggedTask = event.target;
        event.dataTransfer.setData('text/plain', event.target.dataset.taskId);
        event.dataTransfer.effectAllowed = 'move';
        setTimeout(() => {
            event.target.classList.add('opacity-50', 'border-dashed', 'border-sky-500');
        }, 0);
    }

    function handleDragEnd(event) {
        // ... (implementation remains the same)
        if(event.target) event.target.classList.remove('opacity-50', 'border-dashed', 'border-sky-500');
        draggedTask = null;
        document.querySelectorAll('.kanban-task-list').forEach(col => col.classList.remove('bg-slate-300', 'dark:bg-slate-700/70'));
    }

    function handleDragOver(event) {
        // ... (implementation remains the same)
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
        // ... (implementation remains the same)
        const columnUl = event.target.closest('.kanban-task-list');
        if (columnUl) {
            columnUl.classList.remove('bg-slate-300', 'dark:bg-slate-700/70');
        }
    }

    function handleDrop(event) {
        event.preventDefault();
        const targetColumnUl = event.target.closest('.kanban-task-list');

        if (!targetColumnUl || !draggedTask) {
            if(draggedTask) handleDragEnd({target: draggedTask}); // Clean up style
            return;
        }

        const targetColumnId = targetColumnUl.dataset.columnId;
        const taskId = parseInt(draggedTask.dataset.taskId);
        // tasks, saveTasks are global from store.js
        // featureFlags is global from store.js (populated by FeatureFlagService)
        // showMessage is global from ui_rendering.js
        // kanbanColumns is global from store.js
        if (typeof tasks === 'undefined' || typeof saveTasks !== 'function' || typeof featureFlags === 'undefined' || typeof kanbanColumns === 'undefined') {
            console.error("[KanbanDrop] Core dependencies (tasks, saveTasks, featureFlags, kanbanColumns) not available.");
            handleDragEnd({target: draggedTask}); // Clean up style
            return;
        }

        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
            console.error("[Kanban D&D] Dropped task not found in tasks array.");
            handleDragEnd({target: draggedTask}); // Clean up style
            return;
        }

        const originalColumnId = tasks[taskIndex].kanbanColumnId;
        targetColumnUl.classList.remove('bg-slate-300', 'dark:bg-slate-700/70');

        if (originalColumnId === targetColumnId && targetColumnId !== 'done') {
             // No actual change needed if dropped in the same non-done column
             handleDragEnd({target: draggedTask}); // Just clean up style
             return;
        }
        
        tasks[taskIndex].kanbanColumnId = targetColumnId;

        if (targetColumnId === 'done') {
            if (!tasks[taskIndex].completed) {
                tasks[taskIndex].completed = true;
                tasks[taskIndex].completedDate = Date.now();
                if (featureFlags.taskTimerSystem && window.AppFeatures?.TaskTimerSystem?.handleTaskCompletion) {
                    window.AppFeatures.TaskTimerSystem.handleTaskCompletion(taskId, true);
                }
            }
        } else { // Moved to a non-done column
            if (tasks[taskIndex].completed) {
                tasks[taskIndex].completed = false;
                tasks[taskIndex].completedDate = null;
                 // If timer was running and task uncompleted, it should continue or be paused based on its previous state.
                 // For simplicity, taskTimerSystem.handleTaskCompletion(taskId, false) might not be needed
                 // unless it specifically resets timers for uncompleted tasks.
            }
        }
        saveTasks();
        renderKanbanBoardInternal(); // Re-render the board

        if (typeof showMessage === 'function') {
            const targetCol = kanbanColumns.find(c => c.id === targetColumnId);
            showMessage(`Task moved to "${targetCol?.title || targetColumnId}"`, 'success');
        }
        // handleDragEnd is implicitly called by the browser after 'drop', but explicit call ensures cleanup
        // No, dragend fires on the source element naturally.
    }

    /**
     * Public function to trigger rendering the Kanban view.
     * Called by refreshTaskView when mode is 'kanban'.
     */
    function publicRenderKanbanView() {
        console.log('[KanbanFeatureFile] publicRenderKanbanView called.');
        if (typeof FeatureFlagService === 'undefined' || !FeatureFlagService.isFeatureEnabled('kanbanBoardFeature')) {
             console.warn("[KanbanFeatureFile] publicRenderKanbanView called but feature flag is off or FeatureFlagService not available.");
             // Optionally, switch to list view if Kanban is disabled but attempted to render
             // if (typeof ViewManager !== 'undefined' && typeof renderTaskListView === 'function') {
             //     ViewManager.setTaskViewMode('list');
             //     renderTaskListView();
             // }
             return;
        }
        renderKanbanBoardInternal();
    }

    // Expose public interface
    if (typeof window.AppFeatures === 'undefined') {
        window.AppFeatures = {};
    }
    window.AppFeatures.KanbanBoard = {
        initialize: initializeKanbanBoardFeature,
        updateUIVisibility: updateKanbanBoardUIVisibility,
        renderKanbanView: publicRenderKanbanView
        // updateKanbanColumnTitle is internal, called by event listeners within this module
    };

    console.log('[KanbanFeatureFile] window.AppFeatures.KanbanBoard DEFINED.');
    console.log('[KanbanFeatureFile] feature_kanban_board.js script FINISHED executing.');
})();
