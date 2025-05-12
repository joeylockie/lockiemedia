// feature_kanban_board.js
console.log('[KanbanFeatureFile] feature_kanban_board.js TOP LEVEL START.');

// Ensure AppFeatures namespace exists on the window object
if (typeof window.AppFeatures === 'undefined') {
    console.log('[KanbanFeatureFile] window.AppFeatures was UNDEFINED. Creating it now.');
    window.AppFeatures = {};
} else {
    console.log('[KanbanFeatureFile] window.AppFeatures ALREADY EXISTS.');
}

// Self-invoking function to encapsulate the Kanban Board feature's code.
(function(AppFeaturesObject) {
    console.log('[KanbanFeatureFile] IIFE STARTING. Passed AppFeaturesObject:', AppFeaturesObject);

    let draggedTask = null; 

    function initializeKanbanBoardFeature() {
        loadKanbanColumns(); // Assumes this is globally available from app_logic.js
        console.log('[KanbanFeatureFile] Kanban Board Feature Initialized (from initializeKanbanBoardFeature within IIFE).');
    }

    function updateKanbanBoardUIVisibility(isEnabled) {
        // This function is called by applyActiveFeatures in ui_event_handlers.js
        // It can trigger a re-render if the view mode needs to change based on the flag.
        console.log(`[KanbanFeatureFile] updateKanbanBoardUIVisibility called with isEnabled: ${isEnabled}`);
        if (isEnabled) {
            if (currentTaskViewMode === 'kanban') { // currentTaskViewMode from app_logic.js
                renderKanbanView();
            }
        } else {
            // If feature is turned off, ensure we switch back to list view if kanban was active.
            if (currentTaskViewMode === 'kanban') {
                setTaskViewMode('list'); // from app_logic.js
                // The main refreshTaskView in ui_rendering.js will handle calling renderListView
            }
        }
    }

    function renderKanbanBoard() {
        console.log('[KanbanFeatureFile] renderKanbanBoard CALLED.');
        const mainContentArea = document.querySelector('main'); 
        if (!mainContentArea) {
            console.error("[KanbanFeatureFile] Kanban: Main content area not found to render board.");
            return;
        }
        mainContentArea.innerHTML = ''; 
        const kanbanContainer = document.createElement('div');
        kanbanContainer.id = 'kanbanBoardContainer';
        kanbanContainer.className = 'flex flex-col sm:flex-row gap-4 p-0 overflow-x-auto'; 
        
        // Ensure kanbanColumns is available (from app_logic.js)
        if (!window.kanbanColumns || !Array.isArray(window.kanbanColumns)) {
            console.error("[KanbanFeatureFile] kanbanColumns not available or not an array.");
            return;
        }

        window.kanbanColumns.forEach(column => {
            const columnEl = createKanbanColumnElement(column);
            kanbanContainer.appendChild(columnEl);
        });
        mainContentArea.appendChild(kanbanContainer);
        setupDragAndDropListeners();
        console.log('[KanbanFeatureFile] Kanban board rendered.');
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
            updateKanbanColumnTitle(column.id, e.target.value); 
        });
        titleInput.addEventListener('blur', (e) => { 
             if (e.target.value !== column.title) {
                updateKanbanColumnTitle(column.id, e.target.value);
             }
        });
        header.appendChild(titleInput);
        const taskListUl = document.createElement('ul');
        taskListUl.className = 'kanban-task-list p-3 space-y-3 overflow-y-auto flex-grow min-h-[150px]'; 
        taskListUl.dataset.columnId = column.id; 
        
        // Ensure tasks is available (from app_logic.js)
        if (!window.tasks || !Array.isArray(window.tasks)) {
            console.error("[KanbanFeatureFile] tasks array not available for filtering.");
            return columnWrapper; // Return partially built column to avoid further errors
        }

        const tasksInColumn = window.tasks.filter(task => {
            if (column.id === 'done') { 
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

    function createKanbanTaskElement(task) {
        const taskCard = document.createElement('li');
        taskCard.className = `kanban-task-card bg-white dark:bg-slate-700 p-3 rounded-md shadow hover:shadow-lg transition-shadow cursor-grab active:cursor-grabbing ${task.completed ? 'opacity-70' : ''}`;
        taskCard.draggable = true;
        taskCard.dataset.taskId = task.id;
        const taskTextEl = document.createElement('p'); // Renamed to avoid conflict
        taskTextEl.textContent = task.text;
        taskTextEl.className = `text-sm font-medium text-slate-800 dark:text-slate-100 mb-2 break-words ${task.completed ? 'line-through' : ''}`;
        taskCard.appendChild(taskTextEl);
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
        if (detailsContainer.hasChildNodes()) {
            taskCard.appendChild(detailsContainer);
        }
        taskCard.addEventListener('click', (event) => {
            if (event.target.closest('button')) return;
            openViewTaskDetailsModal(task.id); 
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
    }

    function handleDragStart(event) {
        draggedTask = event.target; 
        event.dataTransfer.setData('text/plain', event.target.dataset.taskId);
        setTimeout(() => {
            event.target.classList.add('opacity-50', 'border-dashed', 'border-sky-500');
        }, 0);
    }

    function handleDragEnd(event) {
        event.target.classList.remove('opacity-50', 'border-dashed', 'border-sky-500');
        draggedTask = null;
        document.querySelectorAll('.kanban-task-list').forEach(col => col.classList.remove('bg-slate-300', 'dark:bg-slate-700/70'));
    }

    function handleDragOver(event) {
        event.preventDefault(); 
        const columnUl = event.target.closest('.kanban-task-list');
        if (columnUl) {
            columnUl.classList.add('bg-slate-300', 'dark:bg-slate-700/70'); 
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
        const taskIndex = tasks.findIndex(t => t.id === taskId); // `tasks` from app_logic.js
        if (taskIndex === -1) {
            console.error("Dropped task not found in tasks array.");
            return;
        }
        tasks[taskIndex].kanbanColumnId = targetColumnId;
        if (targetColumnId === 'done') {
            if (!tasks[taskIndex].completed) {
                tasks[taskIndex].completed = true;
                tasks[taskIndex].completedDate = Date.now();
                if (featureFlags.taskTimerSystem && window.AppFeatures && window.AppFeatures.TaskTimerSystem) {
                    window.AppFeatures.TaskTimerSystem.handleTaskCompletion(taskId, true);
                }
            }
        } else {
            if (tasks[taskIndex].completed) {
                tasks[taskIndex].completed = false;
                tasks[taskIndex].completedDate = null;
            }
        }
        saveTasks(); 
        renderKanbanBoard(); 
        showMessage(`Task moved to "${kanbanColumns.find(c=>c.id === targetColumnId)?.title || targetColumnId}"`, 'success');
    }

    function renderKanbanView() {
        console.log("[KanbanFeatureFile] renderKanbanView CALLED.");
        if (!featureFlags.kanbanBoardFeature) return; // featureFlags from app_logic.js
        setTaskViewMode('kanban'); // from app_logic.js
        
        // Ensure sort buttons are hidden (these are global vars from ui_rendering.js)
        if(typeof sortByDueDateBtn !== 'undefined' && sortByDueDateBtn) sortByDueDateBtn.classList.add('hidden');
        if(typeof sortByPriorityBtn !== 'undefined' && sortByPriorityBtn) sortByPriorityBtn.classList.add('hidden');
        if(typeof sortByLabelBtn !== 'undefined' && sortByLabelBtn) sortByLabelBtn.classList.add('hidden');
        
        renderKanbanBoard();
        // The button state (icon/text) is handled by updateKanbanViewToggleButtonState in ui_rendering.js,
        // which is called by refreshTaskView.
    }

    function renderListView() {
        console.log("[KanbanFeatureFile] renderListView CALLED.");
        setTaskViewMode('list'); 
        
        // Ensure sort buttons are visible (these are global vars from ui_rendering.js)
        if(typeof sortByDueDateBtn !== 'undefined' && sortByDueDateBtn) sortByDueDateBtn.classList.remove('hidden');
        if(typeof sortByPriorityBtn !== 'undefined' && sortByPriorityBtn) sortByPriorityBtn.classList.remove('hidden');
        if(typeof sortByLabelBtn !== 'undefined' && sortByLabelBtn) sortByLabelBtn.classList.remove('hidden');
        
        // The actual rendering of the list view is handled by renderTaskListView in ui_rendering.js,
        // which is called by refreshTaskView. This function primarily sets the mode.
        // However, to be safe, we can call it if needed, but refreshTaskView should handle it.
        if (typeof renderTaskListView === 'function') { // renderTaskListView from ui_rendering.js
             renderTaskListView();
        } else {
            console.error("[KanbanFeatureFile] renderTaskListView function not found globally.");
        }
    }

    // --- Expose Public Interface ---
    const kanbanModuleAPI = {
        initialize: initializeKanbanBoardFeature,
        updateUIVisibility: updateKanbanBoardUIVisibility,
        renderKanbanView: renderKanbanView,
        renderListView: renderListView, 
        renderKanbanBoard: renderKanbanBoard
    };
    
    AppFeaturesObject.KanbanBoard = kanbanModuleAPI;
    
    console.log('[KanbanFeatureFile] AppFeatures.KanbanBoard assigned:', AppFeaturesObject.KanbanBoard);
    if(AppFeaturesObject.KanbanBoard) {
        console.log('[KanbanFeatureFile] typeof AppFeatures.KanbanBoard.renderKanbanView is:', typeof AppFeaturesObject.KanbanBoard.renderKanbanView);
        console.log('[KanbanFeatureFile] typeof AppFeatures.KanbanBoard.initialize is:', typeof AppFeaturesObject.KanbanBoard.initialize);
    }
    console.log('[KanbanFeatureFile] IIFE FINISHED executing.');

})(window.AppFeatures); // Pass the global AppFeatures object

console.log('[KanbanFeatureFile] feature_kanban_board.js script FINISHED executing. window.AppFeatures.KanbanBoard is now:', window.AppFeatures.KanbanBoard);
