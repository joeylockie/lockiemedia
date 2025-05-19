// store.js
// Manages application state internally and exposes an API (AppStore) for access and modification.
// Publishes events via EventBus when state changes.

(function() {
    // --- Internal State Variables (scoped to this IIFE) ---
    let _tasks = [];
    let _projects = [];
    let _currentFilter = 'inbox'; // UI state, will move to ViewManager
    let _currentSort = 'default'; // UI state, will move to ViewManager
    let _currentSearchTerm = '';  // UI state, will move to ViewManager
    let _editingTaskId = null;    // UI state, managed by modal interactions
    let _currentViewTaskId = null;// UI state, managed by modal interactions
    let _uniqueLabels = [];
    let _uniqueProjects = [];
    let _tooltipTimeout = null; 
    let _currentTaskViewMode = 'list'; // UI state, will move to ViewManager
    let _selectedTaskIdsForBulkAction = []; // UI state, managed by BulkActionService

    let _isPomodoroActive = false; // Pomodoro state
    let _currentPomodoroState = 'work'; // Pomodoro state
    let _pomodoroTimeRemaining = 0; // Pomodoro state
    let _pomodoroCurrentTaskId = null; // Pomodoro state

    let _kanbanColumns = [
        { id: 'todo', title: 'To Do' },
        { id: 'inprogress', title: 'In Progress' },
        { id: 'done', title: 'Done' }
    ];

    let _featureFlags = {}; // Populated by FeatureFlagService

    // --- Private Helper Functions ---
    function _publish(eventName, data) {
        if (window.EventBus && typeof window.EventBus.publish === 'function') {
            EventBus.publish(eventName, data);
        } else {
            console.warn(`[Store] EventBus not available to publish event: ${eventName}`);
        }
    }

    // --- Internal Data Update and Persistence Functions ---
    function _updateUniqueLabelsInternal() {
        const labels = new Set();
        _tasks.forEach(task => {
            if (task.label && task.label.trim() !== '') {
                labels.add(task.label.trim());
            }
        });
        const oldLabelsJSON = JSON.stringify(_uniqueLabels);
        _uniqueLabels = Array.from(labels).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        if (JSON.stringify(_uniqueLabels) !== oldLabelsJSON) {
            console.log('[Store] Unique labels updated:', _uniqueLabels);
            _publish('labelsChanged', [..._uniqueLabels]);
        }
    }

    function _updateUniqueProjectsInternal() {
        const oldUniqueProjectsJSON = JSON.stringify(_uniqueProjects);
        _uniqueProjects = _projects
            .filter(project => project.id !== 0)
            .map(project => ({ id: project.id, name: project.name }))
            .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
        if (JSON.stringify(_uniqueProjects) !== oldUniqueProjectsJSON) {
            console.log('[Store] Unique projects updated for UI:', _uniqueProjects);
            _publish('uniqueProjectsChanged', [..._uniqueProjects]);
        }
    }

    function _saveTasksInternal() {
        localStorage.setItem('todos_v3', JSON.stringify(_tasks));
        _updateUniqueLabelsInternal(); // This also publishes 'labelsChanged' if needed
        console.log('[Store] Tasks saved to localStorage.');
        _publish('tasksChanged', [..._tasks]); 
    }

    function _saveProjectsInternal() {
        localStorage.setItem('projects_v1', JSON.stringify(_projects));
        _updateUniqueProjectsInternal(); // This also publishes 'uniqueProjectsChanged' if needed
        console.log('[Store] Projects saved to localStorage.');
        _publish('projectsChanged', [..._projects]); 
    }

    function _saveKanbanColumnsInternal() {
        localStorage.setItem('kanbanColumns_v1', JSON.stringify(_kanbanColumns));
        console.log('[Store] Kanban columns saved to localStorage.');
        _publish('kanbanColumnsChanged', [..._kanbanColumns]);
    }

    // --- Public API for AppStore ---
    const AppStore = {
        // --- Getters for State ---
        getTasks: () => JSON.parse(JSON.stringify(_tasks)), // Deep copy for arrays of objects
        getProjects: () => JSON.parse(JSON.stringify(_projects)), // Deep copy
        getKanbanColumns: () => JSON.parse(JSON.stringify(_kanbanColumns)),
        getFeatureFlags: () => ({ ..._featureFlags }),
        getUniqueLabels: () => [..._uniqueLabels],
        getUniqueProjects: () => [..._uniqueProjects],
        
        // UI State Getters (to be fully managed by ViewManager/other UI services later)
        getCurrentFilter: () => _currentFilter,
        getCurrentSort: () => _currentSort,
        getCurrentSearchTerm: () => _currentSearchTerm,
        getCurrentTaskViewMode: () => _currentTaskViewMode,
        getEditingTaskId: () => _editingTaskId,
        setCurrentViewTaskId: (id) => _currentViewTaskId = id, 
        getCurrentViewTaskId: () => _currentViewTaskId,
        getSelectedTaskIdsForBulkAction: () => [..._selectedTaskIdsForBulkAction],

        isPomodoroActive: () => _isPomodoroActive,
        setPomodoroActive: (isActive) => _isPomodoroActive = isActive, // Direct mutation, PomodoroService will manage
        getCurrentPomodoroState: () => _currentPomodoroState,
        setCurrentPomodoroState: (state) => _currentPomodoroState = state, // Direct mutation
        getPomodoroTimeRemaining: () => _pomodoroTimeRemaining,
        setPomodoroTimeRemaining: (time) => _pomodoroTimeRemaining = time, // Direct mutation
        getPomodoroCurrentTaskId: () => _pomodoroCurrentTaskId,
        setPomodoroCurrentTaskId: (id) => _pomodoroCurrentTaskId = id, // Direct mutation
        
        // --- Actions / Mutators ---
        setTasks: (newTasksArray) => {
            _tasks = JSON.parse(JSON.stringify(newTasksArray)); // Store a deep copy
            _saveTasksInternal(); // This now saves and publishes
        },
        setProjects: (newProjectsArray) => {
            _projects = JSON.parse(JSON.stringify(newProjectsArray)); // Store a deep copy
            _saveProjectsInternal(); // This now saves and publishes
        },
        setKanbanColumns: (newColumnsArray) => {
            _kanbanColumns = JSON.parse(JSON.stringify(newColumnsArray)); // Store a deep copy
            _saveKanbanColumnsInternal(); // This now saves and publishes
        },
        
        // saveTasks, saveProjects, saveKanbanColumns are now effectively internal,
        // triggered by their respective setters (setTasks, setProjects, setKanbanColumns).
        // They are kept here if any legacy part still calls them, but services should use setters.

        setFeatureFlags: (loadedFlags) => {
            if (loadedFlags && typeof loadedFlags === 'object') {
                _featureFlags = { ..._featureFlags, ...loadedFlags };
                window.featureFlags = _featureFlags; // Keep global for now
                console.log('[Store API] Feature flags updated in store:', _featureFlags);
                _publish('featureFlagsInitialized', { ..._featureFlags });
            } else {
                console.error('[Store API] Invalid flags received.');
            }
        },

        // UI State Setters (ViewManager/other UI services will use these, or own state directly)
        setCurrentFilterInStore: (filter) => { _currentFilter = filter; /* Event published by ViewManager */ },
        setCurrentSortInStore: (sort) => { _currentSort = sort; /* Event published by ViewManager */ },
        setCurrentSearchTermInStore: (term) => { _currentSearchTerm = term; /* Event published by ViewManager */ },
        setCurrentTaskViewModeInStore: (mode) => { _currentTaskViewMode = mode; /* Event published by ViewManager */ },
        setEditingTaskIdInStore: (id) => { _editingTaskId = id; },
        
        setSelectedTaskIdsForBulkAction: (ids) => { // Called by BulkActionService
            _selectedTaskIdsForBulkAction = [...ids];
            // Event 'bulkSelectionChanged' is published by BulkActionService itself
        },
        
        getTooltipTimeout: () => _tooltipTimeout,
        setTooltipTimeout: (timeoutId) => { _tooltipTimeout = timeoutId; },
        clearTooltipTimeout: () => { if(_tooltipTimeout) clearTimeout(_tooltipTimeout); _tooltipTimeout = null; },

        initializeStore: async () => {
            // FeatureFlagService.loadFeatureFlags() is called by main.js before this.
            // It then calls AppStore.setFeatureFlags.

            const storedKanbanCols = localStorage.getItem('kanbanColumns_v1');
            const defaultKanbanCols = [ { id: 'todo', title: 'To Do' }, { id: 'inprogress', title: 'In Progress' }, { id: 'done', title: 'Done' }];
            if (storedKanbanCols) { try { const parsed = JSON.parse(storedKanbanCols); if(Array.isArray(parsed) && parsed.length === 3 && parsed.every(col => col.id && col.title)) _kanbanColumns = parsed; else _kanbanColumns = defaultKanbanCols;} catch(e){ _kanbanColumns = defaultKanbanCols;} } else { _kanbanColumns = defaultKanbanCols; }
            _saveKanbanColumnsInternal(); 

            const storedProjects = localStorage.getItem('projects_v1');
            let tempProjects = [];
            if (storedProjects) { try { const parsed = JSON.parse(storedProjects); if (Array.isArray(parsed)) tempProjects = parsed.filter(p => p && typeof p.id === 'number' && typeof p.name === 'string'); } catch (e) { console.error("[Store Init] Error parsing stored projects.", e);}}
            const noProjectEntry = { id: 0, name: "No Project", creationDate: Date.now() - 100000 };
            _projects = [noProjectEntry, ...tempProjects.filter(p => p.id !== 0)];
            _saveProjectsInternal(); 

            const storedTasks = JSON.parse(localStorage.getItem('todos_v3')) || [];
            const defaultKanbanColId = _kanbanColumns[0]?.id || 'todo';
            _tasks = storedTasks.map(task => ({
                id: task.id || Date.now() + Math.random(), text: task.text || '', completed: task.completed || false, creationDate: task.creationDate || task.id, dueDate: task.dueDate || null, time: task.time || null, priority: task.priority || 'medium', label: task.label || '', notes: task.notes || '', isReminderSet: task.isReminderSet || false, reminderDate: task.reminderDate || null, reminderTime: task.reminderTime || null, reminderEmail: task.reminderEmail || null, estimatedHours: task.estimatedHours || 0, estimatedMinutes: task.estimatedMinutes || 0, timerStartTime: null, timerAccumulatedTime: 0, timerIsRunning: false, timerIsPaused: false, actualDurationMs: 0, attachments: task.attachments || [], completedDate: null, subTasks: task.subTasks || [], recurrenceRule: null, recurrenceEndDate: null, nextDueDate: task.nextDueDate || task.dueDate, sharedWith: task.sharedWith || [], owner: null, lastSynced: null, syncVersion: 0, kanbanColumnId: task.kanbanColumnId || defaultKanbanColId, projectId: typeof task.projectId === 'number' ? task.projectId : 0, dependsOn: task.dependsOn || [], blocksTasks: task.blocksTasks || []
            }));
            _saveTasksInternal(); 
            
            console.log("[Store API] Store initialized with persisted or default data.");
            _publish('storeInitialized');
        }
    };

    window.AppStore = AppStore;
    // Global variables for legacy access during transition (these will be removed eventually)
    // Services will now use AppStore.getX() or AppStore.setX()
    // window.tasks = _tasks; // NO! Services must use AppStore.getTasks() / AppStore.setTasks()
    // window.projects = _projects; // NO!
    // window.kanbanColumns = _kanbanColumns; // NO!
    // window.uniqueLabels = _uniqueLabels; // NO!
    // window.uniqueProjects = _uniqueProjects; // NO!
    // UI state variables will be accessed via AppStore.get...() or ViewManager
    // window.currentFilter = _currentFilter; // NO!
    // ... and so on for other globals previously defined here.

    console.log("store.js loaded, AppStore API created.");
})();
