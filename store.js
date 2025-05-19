// store.js
// Manages application state internally and exposes an API (AppStore) for access and modification.
// Publishes events via EventBus when state changes.

(function() {
    // --- Internal State Variables (scoped to this IIFE) ---
    let _tasks = [];
    let _projects = [];
    let _currentFilter = 'inbox';
    let _currentSort = 'default';
    let _currentSearchTerm = '';
    let _editingTaskId = null;
    let _currentViewTaskId = null;
    let _uniqueLabels = [];
    let _uniqueProjects = [];
    let _tooltipTimeout = null; // This might better belong in a UI state manager
    let _currentTaskViewMode = 'list';
    let _selectedTaskIdsForBulkAction = [];

    let _isPomodoroActive = false;
    let _currentPomodoroState = 'work';
    let _pomodoroTimeRemaining = 0;
    let _pomodoroCurrentTaskId = null;

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
        _updateUniqueLabelsInternal();
        console.log('[Store] Tasks saved to localStorage.');
        _publish('tasksChanged', [..._tasks]); // Publish with a copy
    }

    function _saveProjectsInternal() {
        localStorage.setItem('projects_v1', JSON.stringify(_projects));
        _updateUniqueProjectsInternal();
        console.log('[Store] Projects saved to localStorage.');
        _publish('projectsChanged', [..._projects]); // Publish with a copy
    }

    function _saveKanbanColumnsInternal() {
        localStorage.setItem('kanbanColumns_v1', JSON.stringify(_kanbanColumns));
        console.log('[Store] Kanban columns saved to localStorage.');
        _publish('kanbanColumnsChanged', [..._kanbanColumns]); // Publish with a copy
    }


    // --- Public API for AppStore ---
    const AppStore = {
        // --- Getters for State (return copies to prevent direct modification) ---
        getTasks: () => [..._tasks], // Return a shallow copy
        getProjects: () => [..._projects], // Return a shallow copy
        getKanbanColumns: () => JSON.parse(JSON.stringify(_kanbanColumns)), // Deep copy for objects
        getFeatureFlags: () => ({ ..._featureFlags }), // Shallow copy
        getUniqueLabels: () => [..._uniqueLabels],
        getUniqueProjects: () => [..._uniqueProjects],
        
        // UI State Getters (will be fully moved to ViewManager later)
        getCurrentFilter: () => _currentFilter,
        getCurrentSort: () => _currentSort,
        getCurrentSearchTerm: () => _currentSearchTerm,
        getCurrentTaskViewMode: () => _currentTaskViewMode,
        getEditingTaskId: () => _editingTaskId,
        setCurrentViewTaskId: (id) => _currentViewTaskId = id, // Setter needed by modals
        getCurrentViewTaskId: () => _currentViewTaskId,
        getSelectedTaskIdsForBulkAction: () => [..._selectedTaskIdsForBulkAction],

        // Pomodoro State Getters/Setters (will move to PomodoroService later)
        isPomodoroActive: () => _isPomodoroActive,
        setPomodoroActive: (isActive) => _isPomodoroActive = isActive,
        getCurrentPomodoroState: () => _currentPomodoroState,
        setCurrentPomodoroState: (state) => _currentPomodoroState = state,
        getPomodoroTimeRemaining: () => _pomodoroTimeRemaining,
        setPomodoroTimeRemaining: (time) => _pomodoroTimeRemaining = time,
        getPomodoroCurrentTaskId: () => _pomodoroCurrentTaskId,
        setPomodoroCurrentTaskId: (id) => _pomodoroCurrentTaskId = id,
        
        // --- Actions / Mutators (that also handle persistence and events) ---
        // These will be called by services (TaskService, ProjectService, etc.)
        
        // For Tasks (TaskService will call these)
        setTasks: (newTasksArray) => { // Used by services to update the whole array
            _tasks = newTasksArray;
            _saveTasksInternal();
        },
        // saveTasks is effectively the public method to persist current _tasks state
        saveTasks: _saveTasksInternal,

        // For Projects (ProjectService will call these)
        setProjects: (newProjectsArray) => {
            _projects = newProjectsArray;
            _saveProjectsInternal();
        },
        saveProjects: _saveProjectsInternal,

        // For Kanban Columns (Kanban feature module will call this)
        setKanbanColumns: (newColumnsArray) => {
            _kanbanColumns = newColumnsArray;
            _saveKanbanColumnsInternal();
        },
        saveKanbanColumns: _saveKanbanColumnsInternal,

        // For Feature Flags (called by FeatureFlagService)
        setFeatureFlags: (loadedFlags) => {
            if (loadedFlags && typeof loadedFlags === 'object') {
                _featureFlags = { ..._featureFlags, ...loadedFlags }; // Merge carefully
                 // Ensure window.featureFlags (legacy global) is also updated for now
                window.featureFlags = _featureFlags;
                console.log('[Store API] Feature flags updated in store:', _featureFlags);
                _publish('featureFlagsInitialized', { ..._featureFlags });
            } else {
                console.error('[Store API] Invalid flags received.');
            }
        },

        // For UI State (ViewManager will call these)
        // These setters will eventually be removed as ViewManager takes ownership
        setCurrentFilterInStore: (filter) => { _currentFilter = filter; /* Event published by ViewManager */ },
        setCurrentSortInStore: (sort) => { _currentSort = sort; /* Event published by ViewManager */ },
        setCurrentSearchTermInStore: (term) => { _currentSearchTerm = term; /* Event published by ViewManager */ },
        setCurrentTaskViewModeInStore: (mode) => { _currentTaskViewMode = mode; /* Event published by ViewManager */ },
        setEditingTaskIdInStore: (id) => { _editingTaskId = id; }, // Modals might still use this directly
        
        // For Bulk Actions (BulkActionService will call this)
        setSelectedTaskIdsForBulkAction: (ids) => {
            _selectedTaskIdsForBulkAction = [...ids];
            // Event 'bulkSelectionChanged' is published by BulkActionService
        },
        
        // Tooltip timeout (still a bit of an outlier, might move to a UI service)
        getTooltipTimeout: () => _tooltipTimeout,
        setTooltipTimeout: (timeoutId) => { _tooltipTimeout = timeoutId; },
        clearTooltipTimeout: () => { if(_tooltipTimeout) clearTimeout(_tooltipTimeout); _tooltipTimeout = null; },


        // --- Initialization Logic (called once at the bottom) ---
        initializeStore: async () => {
            // FeatureFlagService.loadFeatureFlags() is called by its own IIFE or by main.js
            // It then calls AppStore.setFeatureFlags.

            // Load Kanban Columns
            const storedKanbanCols = localStorage.getItem('kanbanColumns_v1');
            const defaultKanbanCols = [ { id: 'todo', title: 'To Do' }, { id: 'inprogress', title: 'In Progress' }, { id: 'done', title: 'Done' }];
            if (storedKanbanCols) { try { /* ... parsing logic as before ... */ const parsed = JSON.parse(storedKanbanCols); if(Array.isArray(parsed) && parsed.length === 3) _kanbanColumns = parsed; else _kanbanColumns = defaultKanbanCols;} catch(e){ _kanbanColumns = defaultKanbanCols;} } else { _kanbanColumns = defaultKanbanCols; }
            _saveKanbanColumnsInternal(); // Save and publish initial state

            // Load Projects
            const storedProjects = localStorage.getItem('projects_v1');
            let tempProjects = [];
            if (storedProjects) { try { const parsed = JSON.parse(storedProjects); if (Array.isArray(parsed)) tempProjects = parsed.filter(p => p && typeof p.id === 'number' && typeof p.name === 'string'); } catch (e) { console.error("[Store Init] Error parsing stored projects.", e);}}
            const noProjectEntry = { id: 0, name: "No Project", creationDate: Date.now() - 100000 };
            _projects = [noProjectEntry, ...tempProjects.filter(p => p.id !== 0)];
            _saveProjectsInternal(); // Save and publish initial state (calls _updateUniqueProjectsInternal)

            // Initialize Tasks
            const storedTasks = JSON.parse(localStorage.getItem('todos_v3')) || [];
            const defaultKanbanColId = _kanbanColumns[0]?.id || 'todo';
            _tasks = storedTasks.map(task => ({ /* ... mapping logic as before, using defaultKanbanColId ... */
                id: task.id || Date.now() + Math.random(), text: task.text || '', completed: task.completed || false, creationDate: task.creationDate || task.id, dueDate: task.dueDate || null, time: task.time || null, priority: task.priority || 'medium', label: task.label || '', notes: task.notes || '', isReminderSet: task.isReminderSet || false, reminderDate: task.reminderDate || null, reminderTime: task.reminderTime || null, reminderEmail: task.reminderEmail || null, estimatedHours: task.estimatedHours || 0, estimatedMinutes: task.estimatedMinutes || 0, timerStartTime: null, timerAccumulatedTime: 0, timerIsRunning: false, timerIsPaused: false, actualDurationMs: 0, attachments: task.attachments || [], completedDate: null, subTasks: task.subTasks || [], recurrenceRule: null, recurrenceEndDate: null, nextDueDate: task.nextDueDate || task.dueDate, sharedWith: task.sharedWith || [], owner: null, lastSynced: null, syncVersion: 0, kanbanColumnId: task.kanbanColumnId || defaultKanbanColId, projectId: typeof task.projectId === 'number' ? task.projectId : 0, dependsOn: task.dependsOn || [], blocksTasks: task.blocksTasks || []
            }));
            _saveTasksInternal(); // Save and publish initial state (calls _updateUniqueLabelsInternal)
            
            console.log("[Store API] Store initialized with persisted or default data.");
            _publish('storeInitialized');
        }
    };

    window.AppStore = AppStore;

    // The IIFE in featureFlagService.js calls loadFeatureFlags, which then calls AppStore.setFeatureFlags.
    // The main.js orchestrates the call to AppStore.initializeStore() after DOMContentLoaded.
    // No automatic initialization here to give main.js control.
    console.log("store.js loaded, AppStore API created.");

})();
