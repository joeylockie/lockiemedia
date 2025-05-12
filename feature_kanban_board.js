// feature_kanban_board.js

// Self-invoking function to encapsulate the Kanban Board feature's code.
(function() {
    console.log('[KanbanFeatureFile] feature_kanban_board.js script executing.');

    // --- DOM Element References (to be obtained when needed) ---
    // ... (rest of the existing Kanban code: initializeKanbanBoardFeature, updateKanbanBoardUIVisibility, etc.)
    let draggedTask = null; 

    function initializeKanbanBoardFeature() {
        loadKanbanColumns(); 
        console.log('Kanban Board Feature Initialized (from feature_kanban_board.js).');
    }

    function updateKanbanBoardUIVisibility(isEnabled) {
        if (isEnabled) {
            if (currentTaskViewMode === 'kanban') {
                renderKanbanView();
            }
        } else {
            if (currentTaskViewMode === 'kanban') {
                setTaskViewMode('list'); 
                renderListView(); 
            }
        }
    }

    function renderKanbanBoard() {
        const mainContentArea = document.querySelector('main'); 
        if (!mainContentArea) {
            console.error("Kanban: Main content area not found to render board.");
            return;
        }
        mainContentArea.innerHTML = ''; 
        const kanbanContainer = document.createElement('div');
        kanbanContainer.id = 'kanbanBoardContainer';
        kanbanContainer.className = 'flex flex-col sm:flex-row gap-4 p-0 overflow-x-auto'; 
        kanbanColumns.forEach(column => {
            const columnEl = createKanbanColumnElement(column);
            kanbanContainer.appendChild(columnEl);
        });
        mainContentArea.appendChild(kanbanContainer);
        setupDragAndDropListeners();
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
        const tasksInColumn = tasks.filter(task => {
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
        const taskIndex = tasks.findIndex(t => t.id === taskId);
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
        if (!featureFlags.kanbanBoardFeature) return;
        setTaskViewMode('kanban'); 
        if(sortByDueDateBtn) sortByDueDateBtn.classList.add('hidden');
        if(sortByPriorityBtn) sortByPriorityBtn.classList.add('hidden');
        if(sortByLabelBtn) sortByLabelBtn.classList.add('hidden');
        renderKanbanBoard();
    }

    function renderListView() {
        setTaskViewMode('list'); 
        if(sortByDueDateBtn) sortByDueDateBtn.classList.remove('hidden');
        if(sortByPriorityBtn) sortByPriorityBtn.classList.remove('hidden');
        if(sortByLabelBtn) sortByLabelBtn.classList.remove('hidden');
        const mainContentArea = document.querySelector('main');
        if (mainContentArea) {
            mainContentArea.innerHTML = ''; 
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
        renderTaskListView(); // Call the function from ui_rendering.js
    }

    // --- Expose Public Interface ---
    if (typeof window.AppFeatures === 'undefined') {
        window.AppFeatures = {};
        console.log('[KanbanFeatureFile] window.AppFeatures object created by KanbanBoard.');
    }

    window.AppFeatures.KanbanBoard = {
        initialize: initializeKanbanBoardFeature,
        updateUIVisibility: updateKanbanBoardUIVisibility,
        renderKanbanView: renderKanbanView,
        renderListView: renderListView, // Note: This was also exposed, might be for internal use by Kanban module
        renderKanbanBoard: renderKanbanBoard
    };
    // ADDED LOG
    console.log('[KanbanFeatureFile] window.AppFeatures.KanbanBoard object CREATED:', window.AppFeatures.KanbanBoard);
    if(window.AppFeatures.KanbanBoard) {
        console.log('[KanbanFeatureFile] typeof window.AppFeatures.KanbanBoard.renderKanbanView is:', typeof window.AppFeatures.KanbanBoard.renderKanbanView);
    }

})();
