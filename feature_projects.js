// feature_projects.js

// Self-invoking function to encapsulate the Project feature's code
(function() {
    // --- DOM Element References (initialized in initializeProjectFeature) ---
    let manageProjectsModal, modalDialogManageProjects, closeManageProjectsModalBtn, closeManageProjectsSecondaryBtn;
    let addNewProjectForm, newProjectInput, existingProjectsList;
    let projectFilterContainer; // For sidebar project filters
    let modalProjectSelectAdd, modalProjectSelectViewEdit; // Add/Edit Task Modal Project Selectors

    // Dependencies (assumed to be globally available for now):
    // - From store.js: projects, tasks, uniqueProjects, saveProjects, saveTasks, featureFlags (via FeatureFlagService)
    // - From utils.js: (none directly used in this file by default, but could be)
    // - From ui_rendering.js: showMessage (if not passed), refreshTaskView
    // - From modal_interactions.js: (none directly called, this module provides functions for modals)
    // - Services: FeatureFlagService, ViewManager

    /**
     * Initializes the Project Feature.
     * Sets up event listeners for project-related UI elements.
     */
    function initializeProjectFeature() {
        manageProjectsModal = document.getElementById('manageProjectsModal');
        modalDialogManageProjects = document.getElementById('modalDialogManageProjects');
        closeManageProjectsModalBtn = document.getElementById('closeManageProjectsModalBtn');
        closeManageProjectsSecondaryBtn = document.getElementById('closeManageProjectsSecondaryBtn');
        addNewProjectForm = document.getElementById('addNewProjectForm');
        newProjectInput = document.getElementById('newProjectInput');
        existingProjectsList = document.getElementById('existingProjectsList');
        projectFilterContainer = document.getElementById('projectFilterContainer');
        modalProjectSelectAdd = document.getElementById('modalProjectSelectAdd');
        modalProjectSelectViewEdit = document.getElementById('modalProjectSelectViewEdit');

        if (closeManageProjectsModalBtn) {
            closeManageProjectsModalBtn.addEventListener('click', closeManageProjectsModal);
        }
        if (closeManageProjectsSecondaryBtn) {
            closeManageProjectsSecondaryBtn.addEventListener('click', closeManageProjectsModal);
        }
        if (addNewProjectForm) {
            addNewProjectForm.addEventListener('submit', handleAddNewProject);
        }
        if (manageProjectsModal) {
            manageProjectsModal.addEventListener('click', (event) => {
                if (event.target === manageProjectsModal) closeManageProjectsModal();
            });
        }

        console.log('[ProjectsFeature] Initialized.');
        // Initial population of filters and dropdowns will be triggered by ui_event_handlers.js
        // after all services and features are initialized.
    }

    /**
     * Updates the visibility of all Project UI elements based on the feature flag.
     * @param {boolean} isEnabled - True if the feature is enabled, false otherwise.
     * This parameter is for consistency, actual check uses FeatureFlagService.
     */
    function updateProjectUIVisibility(isEnabledParam) { // Parameter kept for consistency, but service is source of truth
        if (typeof FeatureFlagService === 'undefined' || typeof ViewManager === 'undefined') {
            console.error("[ProjectsFeature] FeatureFlagService or ViewManager not available.");
            return;
        }
        const isActuallyEnabled = FeatureFlagService.isFeatureEnabled('projectFeature');

        const projectElements = document.querySelectorAll('.project-feature-element');
        projectElements.forEach(el => {
            el.classList.toggle('hidden', !isActuallyEnabled);
        });

        if (!isActuallyEnabled && ViewManager.getCurrentFilter().startsWith('project_')) {
            ViewManager.setCurrentFilter('inbox'); // Reset filter if project view was active
             if (typeof refreshTaskView === 'function') refreshTaskView(); // Refresh to show inbox
        }
        
        populateProjectFilterList(); // Always re-populate/clear based on feature state

        console.log(`[ProjectsFeature] UI Visibility set to: ${isActuallyEnabled}`);
    }

    // --- Manage Projects Modal UI Functions ---
    function openManageProjectsModal() {
        if (!manageProjectsModal || !modalDialogManageProjects) {
            console.error("[ProjectsFeature] Manage Projects Modal elements not found.");
            return;
        }
        populateManageProjectsList();
        manageProjectsModal.classList.remove('hidden');
        setTimeout(() => {
            modalDialogManageProjects.classList.remove('scale-95', 'opacity-0');
            modalDialogManageProjects.classList.add('scale-100', 'opacity-100');
        }, 10);
        if (newProjectInput) newProjectInput.focus();
    }

    function closeManageProjectsModal() {
        if (!manageProjectsModal || !modalDialogManageProjects) return;
        modalDialogManageProjects.classList.add('scale-95', 'opacity-0');
        modalDialogManageProjects.classList.remove('scale-100', 'opacity-100');
        setTimeout(() => {
            manageProjectsModal.classList.add('hidden');
        }, 200);
    }

    function populateManageProjectsList() {
        if (!existingProjectsList || typeof projects === 'undefined') { // projects from store.js
             console.warn("[ProjectsFeature] Existing projects list element or 'projects' array not available.");
            return;
        }
        existingProjectsList.innerHTML = '';

        const displayProjects = projects.filter(p => p.id !== 0) // Exclude "No Project"
                                     .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

        if (displayProjects.length === 0) {
            existingProjectsList.innerHTML = '<li class="text-slate-500 dark:text-slate-400 text-center">No projects created yet.</li>';
            return;
        }

        displayProjects.forEach(project => {
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700 rounded-md group';
            const nameSpan = document.createElement('span');
            nameSpan.textContent = project.name;
            nameSpan.className = 'text-slate-700 dark:text-slate-200';
            li.appendChild(nameSpan);

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'opacity-0 group-hover:opacity-100 transition-opacity';
            const editBtn = document.createElement('button');
            editBtn.innerHTML = '<i class="fas fa-pencil-alt text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"></i>';
            editBtn.className = 'p-1 mx-1';
            editBtn.title = `Edit project "${project.name}"`;
            editBtn.addEventListener('click', () => handleEditProject(project.id));
            actionsDiv.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"></i>';
            deleteBtn.className = 'p-1';
            deleteBtn.title = `Delete project "${project.name}"`;
            deleteBtn.addEventListener('click', () => handleDeleteProject(project.id));
            actionsDiv.appendChild(deleteBtn);

            li.appendChild(actionsDiv);
            existingProjectsList.appendChild(li);
        });
    }

    // --- Project Logic Functions ---
    function handleAddNewProject(event) {
        event.preventDefault();
        if (!newProjectInput || typeof projects === 'undefined' || typeof saveProjects !== 'function' || typeof showMessage !== 'function') return;

        const projectName = newProjectInput.value.trim();
        if (projectName === '') {
            showMessage('Project name cannot be empty.', 'error');
            return;
        }
        if (projects.some(p => p.name.toLowerCase() === projectName.toLowerCase() && p.id !== 0)) {
            showMessage(`Project "${projectName}" already exists.`, 'error');
            return;
        }

        const newProject = { id: Date.now(), name: projectName, creationDate: Date.now() };
        projects.push(newProject); // Modifies global 'projects' from store.js
        saveProjects(); // Calls global 'saveProjects' from store.js (which also updates uniqueProjects)

        showMessage(`Project "${projectName}" added.`, 'success');
        newProjectInput.value = '';
        populateManageProjectsList();
        populateProjectDropdowns();
        populateProjectFilterList();
    }

    function handleEditProject(projectId) {
        if (typeof projects === 'undefined' || typeof saveProjects !== 'function' || typeof showMessage !== 'function') return;
        const project = projects.find(p => p.id === projectId);
        if (!project || project.id === 0) {
            showMessage('Project not found or cannot be edited.', 'error');
            return;
        }

        const newName = prompt(`Edit project name for "${project.name}":`, project.name);
        if (newName === null) return;

        const trimmedNewName = newName.trim();
        if (trimmedNewName === '') {
            showMessage('Project name cannot be empty.', 'error');
            return;
        }
        if (projects.some(p => p.name.toLowerCase() === trimmedNewName.toLowerCase() && p.id !== projectId && p.id !== 0)) {
            showMessage(`Another project with the name "${trimmedNewName}" already exists.`, 'error');
            return;
        }

        project.name = trimmedNewName; // Modifies global 'projects'
        saveProjects();

        showMessage(`Project updated to "${trimmedNewName}".`, 'success');
        populateManageProjectsList();
        populateProjectDropdowns();
        populateProjectFilterList();
        if (typeof refreshTaskView === 'function') refreshTaskView();
    }

    function handleDeleteProject(projectId) {
        if (typeof projects === 'undefined' || typeof tasks === 'undefined' ||
            typeof saveProjects !== 'function' || typeof saveTasks !== 'function' ||
            typeof showMessage !== 'function' || typeof ViewManager === 'undefined') return;

        const projectIndex = projects.findIndex(p => p.id === projectId);
        if (projectIndex === -1 || projectId === 0) {
            showMessage('Project not found or cannot be deleted.', 'error');
            return;
        }

        const projectName = projects[projectIndex].name;
        if (!confirm(`Are you sure you want to delete the project "${projectName}"? Tasks in this project will be moved to "No Project".`)) {
            return;
        }

        projects.splice(projectIndex, 1); // Modifies global 'projects'
        tasks.forEach(task => { // Modifies global 'tasks'
            if (task.projectId === projectId) {
                task.projectId = 0;
            }
        });
        saveTasks();
        saveProjects();

        showMessage(`Project "${projectName}" deleted. Associated tasks moved to "No Project".`, 'success');
        populateManageProjectsList();
        populateProjectDropdowns();
        populateProjectFilterList();

        if (ViewManager.getCurrentFilter() === `project_${projectId}`) {
            ViewManager.setCurrentFilter('inbox');
            if (typeof refreshTaskView === 'function') refreshTaskView();
        } else {
            if (typeof refreshTaskView === 'function') refreshTaskView();
        }
    }

    function populateProjectDropdowns() {
        // Assumes modalProjectSelectAdd, modalProjectSelectViewEdit are initialized DOM elements
        // Assumes uniqueProjects is global from store.js
        if (typeof uniqueProjects === 'undefined') {
            console.warn("[ProjectsFeature] 'uniqueProjects' array not available for dropdowns.");
            return;
        }
        const dropdowns = [];
        if (modalProjectSelectAdd) dropdowns.push(modalProjectSelectAdd);
        if (modalProjectSelectViewEdit) dropdowns.push(modalProjectSelectViewEdit);

        dropdowns.forEach(dropdown => {
            if (!dropdown) return;
            const currentVal = dropdown.value;
            dropdown.innerHTML = '';
            const noProjectOption = document.createElement('option');
            noProjectOption.value = "0";
            noProjectOption.textContent = "No Project";
            dropdown.appendChild(noProjectOption);

            uniqueProjects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = project.name;
                dropdown.appendChild(option);
            });
            if (currentVal) dropdown.value = currentVal;
        });
    }

    function populateProjectFilterList() {
        if (!projectFilterContainer || typeof uniqueProjects === 'undefined' || typeof FeatureFlagService === 'undefined' || typeof ViewManager === 'undefined') {
            if (projectFilterContainer) projectFilterContainer.innerHTML = ''; // Clear if dependencies missing
            return;
        }
        projectFilterContainer.innerHTML = '';

        if (!FeatureFlagService.isFeatureEnabled('projectFeature') || uniqueProjects.length === 0) {
            projectFilterContainer.classList.add('hidden');
            return;
        }
        projectFilterContainer.classList.remove('hidden');

        const heading = document.createElement('h2');
        heading.className = 'sidebar-text-content sidebar-section-title text-lg md:text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2 md:mb-3 mt-4';
        heading.textContent = 'Projects';
        projectFilterContainer.appendChild(heading);

        const projectListUl = document.createElement('div');
        projectListUl.className = 'flex flex-col gap-2';

        uniqueProjects.forEach(project => {
            const button = document.createElement('button');
            // Apply active styles based on ViewManager.getCurrentFilter()
            const isActive = ViewManager.getCurrentFilter() === `project_${project.id}`;
            const baseClasses = 'smart-view-btn w-full text-left px-3 py-2 md:px-4 md:py-2.5 rounded-lg transition-colors duration-300 flex items-center sidebar-button-icon-only justify-center';
            const activeColorClasses = 'bg-purple-500 text-white font-semibold dark:bg-purple-600 dark:text-purple-50';
            const inactiveColorClasses = 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600';
            button.className = `${baseClasses} ${isActive ? activeColorClasses : inactiveColorClasses}`;
            
            button.dataset.filter = `project_${project.id}`;
            button.title = project.name;

            const icon = document.createElement('i');
            const iconActiveColor = 'text-purple-100 dark:text-purple-200';
            const iconInactiveColor = 'text-slate-500 dark:text-slate-400';
            icon.className = `fas fa-folder w-5 mr-0 ${isActive ? iconActiveColor : iconInactiveColor}`;

            const textSpan = document.createElement('span');
            textSpan.className = 'sidebar-text-content ml-2 md:ml-2.5 truncate';
            textSpan.textContent = project.name;

            button.appendChild(icon);
            button.appendChild(textSpan);

            button.addEventListener('click', () => {
                // Call setFilter (global from ui_event_handlers.js which uses ViewManager)
                if (typeof setFilter === 'function') setFilter(`project_${project.id}`);
            });
            projectListUl.appendChild(button);
        });
        projectFilterContainer.appendChild(projectListUl);

        // Apply minimized styles if sidebar is minimized (taskSidebar is global from ui_rendering.js)
        if (taskSidebar && taskSidebar.classList.contains('sidebar-minimized')) {
            if(heading) heading.classList.add('hidden');
            projectListUl.querySelectorAll('.sidebar-button-icon-only').forEach(btn => {
                 btn.classList.add('justify-center');
                 btn.querySelector('i')?.classList.remove('md:mr-2', 'md:mr-2.5', 'ml-2'); // Standardize
                 btn.querySelector('.sidebar-text-content')?.classList.add('hidden');
            });
        }
    }

    // Expose public interface
    if (typeof window.AppFeatures === 'undefined') {
        window.AppFeatures = {};
    }
    window.AppFeatures.Projects = {
        initialize: initializeProjectFeature,
        updateUIVisibility: updateProjectUIVisibility,
        openManageProjectsModal: openManageProjectsModal,
        populateProjectDropdowns: populateProjectDropdowns,
        populateProjectFilterList: populateProjectFilterList
    };

    // console.log("feature_projects.js loaded");
})();
