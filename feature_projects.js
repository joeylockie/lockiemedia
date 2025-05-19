// feature_projects.js

// Self-invoking function to encapsulate the Project feature's code
(function() {
    // DOM Element References (populated in initializeProjectFeature)
    let manageProjectsModal, modalDialogManageProjects, closeManageProjectsModalBtn, closeManageProjectsSecondaryBtn;
    let addNewProjectForm, newProjectInput, existingProjectsList;
    let projectFilterContainer;
    let modalProjectSelectAdd, modalProjectSelectViewEdit;

    // Dependencies: FeatureFlagService, ViewManager, ProjectService, EventBus,
    // ui_rendering.js: showMessage
    // AppStore: getUniqueProjects (for initial population, then event-driven updates)

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

        if (closeManageProjectsModalBtn) closeManageProjectsModalBtn.addEventListener('click', closeManageProjectsModal);
        if (closeManageProjectsSecondaryBtn) closeManageProjectsSecondaryBtn.addEventListener('click', closeManageProjectsModal);
        if (addNewProjectForm) addNewProjectForm.addEventListener('submit', handleAddNewProject);
        if (manageProjectsModal) manageProjectsModal.addEventListener('click', (event) => { if (event.target === manageProjectsModal) closeManageProjectsModal(); });

        // Subscribe to events to keep UI consistent
        if (typeof EventBus !== 'undefined') {
            EventBus.subscribe('projectsChanged', () => {
                console.log("[ProjectsFeature] Event 'projectsChanged' received. Repopulating manage projects list.");
                populateManageProjectsList(); // For the manage projects modal
                // uniqueProjectsChanged will handle dropdowns and filter list
            });
            EventBus.subscribe('uniqueProjectsChanged', () => {
                console.log("[ProjectsFeature] Event 'uniqueProjectsChanged' received. Repopulating dropdowns and filter list.");
                populateProjectDropdowns();
                populateProjectFilterList();
            });
        }
        console.log('[ProjectsFeature] Initialized and event listeners set up.');
    }

    function updateProjectUIVisibility(isEnabledParam) {
        if (typeof FeatureFlagService === 'undefined' || typeof ViewManager === 'undefined') {
            console.error("[ProjectsFeature] FeatureFlagService or ViewManager not available.");
            return;
        }
        const isActuallyEnabled = FeatureFlagService.isFeatureEnabled('projectFeature');
        const projectElements = document.querySelectorAll('.project-feature-element');
        projectElements.forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));

        if (!isActuallyEnabled && ViewManager.getCurrentFilter().startsWith('project_')) {
            ViewManager.setCurrentFilter('inbox'); // Event will trigger refreshTaskView
        }
        populateProjectFilterList(); // Always re-populate/clear based on feature state
        console.log(`[ProjectsFeature] UI Visibility set to: ${isActuallyEnabled}`);
    }

    function openManageProjectsModal() {
        if (!manageProjectsModal || !modalDialogManageProjects) return;
        populateManageProjectsList(); // Ensure list is up-to-date when opening
        manageProjectsModal.classList.remove('hidden');
        setTimeout(() => { modalDialogManageProjects.classList.remove('scale-95', 'opacity-0'); modalDialogManageProjects.classList.add('scale-100', 'opacity-100'); }, 10);
        if (newProjectInput) newProjectInput.focus();
    }

    function closeManageProjectsModal() {
        if (!manageProjectsModal || !modalDialogManageProjects) return;
        modalDialogManageProjects.classList.add('scale-95', 'opacity-0');
        setTimeout(() => { manageProjectsModal.classList.add('hidden'); }, 200);
    }

    function populateManageProjectsList() {
        if (!existingProjectsList || typeof ProjectService === 'undefined' || typeof ProjectService.getAllProjects !== 'function') {
            console.warn("[ProjectsFeature] Dependencies for populateManageProjectsList not met.");
            if(existingProjectsList) existingProjectsList.innerHTML = '<li class="text-slate-500 dark:text-slate-400 text-center">Error loading projects.</li>';
            return;
        }
        existingProjectsList.innerHTML = '';
        const displayProjects = ProjectService.getAllProjects(); // Excludes "No Project" by default

        if (displayProjects.length === 0) {
            existingProjectsList.innerHTML = '<li class="text-slate-500 dark:text-slate-400 text-center">No projects created yet.</li>';
            return;
        }
        displayProjects.forEach(project => {
            const li = document.createElement('li'); li.className = 'flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700 rounded-md group';
            const nameSpan = document.createElement('span'); nameSpan.textContent = project.name; nameSpan.className = 'text-slate-700 dark:text-slate-200'; li.appendChild(nameSpan);
            const actionsDiv = document.createElement('div'); actionsDiv.className = 'opacity-0 group-hover:opacity-100 transition-opacity';
            const editBtn = document.createElement('button'); editBtn.innerHTML = '<i class="fas fa-pencil-alt text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"></i>'; editBtn.className = 'p-1 mx-1'; editBtn.title = `Edit project "${project.name}"`; editBtn.addEventListener('click', () => handleEditProject(project.id)); actionsDiv.appendChild(editBtn);
            const deleteBtn = document.createElement('button'); deleteBtn.innerHTML = '<i class="fas fa-trash-alt text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"></i>'; deleteBtn.className = 'p-1'; deleteBtn.title = `Delete project "${project.name}"`; deleteBtn.addEventListener('click', () => handleDeleteProject(project.id)); actionsDiv.appendChild(deleteBtn);
            li.appendChild(actionsDiv); existingProjectsList.appendChild(li);
        });
    }

    function handleAddNewProject(event) {
        event.preventDefault();
        if (!newProjectInput || typeof ProjectService === 'undefined' || typeof ProjectService.addProject !== 'function' || typeof showMessage !== 'function') {
            console.error("[ProjectsFeature] Dependencies for handleAddNewProject not met.");
            return;
        }
        const projectName = newProjectInput.value.trim();
        const newProject = ProjectService.addProject(projectName); // ProjectService handles saving and publishing events
        if (newProject) {
            showMessage(`Project "${newProject.name}" added.`, 'success');
            newProjectInput.value = '';
            // UI lists (manage projects, dropdowns, filters) will update via events.
        }
        // If newProject is null, ProjectService.addProject already showed an error message.
    }

    function handleEditProject(projectId) {
        if (typeof ProjectService === 'undefined' || typeof ProjectService.getProjectById !== 'function' || typeof ProjectService.updateProjectName !== 'function' || typeof showMessage !== 'function') {
            console.error("[ProjectsFeature] Dependencies for handleEditProject not met.");
            return;
        }
        const project = ProjectService.getProjectById(projectId);
        if (!project || project.id === 0) {
            showMessage('Project not found or "No Project" cannot be edited.', 'error');
            return;
        }
        const newName = prompt(`Edit project name for "${project.name}":`, project.name);
        if (newName === null) return; // User cancelled prompt

        const updatedProject = ProjectService.updateProjectName(projectId, newName); // ProjectService handles saving and events
        if (updatedProject) {
            showMessage(`Project updated to "${updatedProject.name}".`, 'success');
            // UI lists will update via events.
        }
        // If updatedProject is null, ProjectService.updateProjectName already showed an error.
    }

    function handleDeleteProject(projectId) {
        if (typeof ProjectService === 'undefined' || typeof ProjectService.getProjectById !== 'function' || typeof ProjectService.deleteProjectById !== 'function' || typeof showMessage !== 'function' || typeof ViewManager === 'undefined') {
            console.error("[ProjectsFeature] Dependencies for handleDeleteProject not met.");
            return;
        }
        const project = ProjectService.getProjectById(projectId);
        if (!project || project.id === 0) { // project.id === 0 check is also in service, but good here too.
            showMessage('Project not found or "No Project" cannot be deleted.', 'error');
            return;
        }
        if (!confirm(`Are you sure you want to delete the project "${project.name}"? Tasks in this project will be moved to "No Project".`)) {
            return;
        }
        if (ProjectService.deleteProjectById(projectId)) { // Service handles saving and events
            showMessage(`Project "${project.name}" deleted. Associated tasks moved.`, 'success');
            // If current filter was this project, reset it. Event 'filterChanged' will trigger UI update.
            if (ViewManager.getCurrentFilter() === `project_${projectId}`) {
                ViewManager.setCurrentFilter('inbox');
            }
        } else {
            showMessage('Failed to delete project.', 'error'); // Should be rare if checks pass
        }
    }

    function populateProjectDropdowns() {
        if (typeof AppStore === 'undefined' || typeof AppStore.getUniqueProjects !== 'function') {
             console.warn("[ProjectsFeature] AppStore.getUniqueProjects not available for dropdowns."); return;
        }
        const currentUniqueProjects = AppStore.getUniqueProjects(); // Get from AppStore, which is updated by events

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

            currentUniqueProjects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = project.name;
                dropdown.appendChild(option);
            });
            if (currentVal && currentUniqueProjects.some(p => p.id.toString() === currentVal) || currentVal === "0") {
                 dropdown.value = currentVal;
            } else if (dropdown.options.length > 0) {
                 dropdown.value = "0"; // Default to "No Project" if previous value is no longer valid
            }
        });
    }

    function populateProjectFilterList() {
        if (!projectFilterContainer || typeof AppStore === 'undefined' || typeof AppStore.getUniqueProjects !== 'function' || typeof FeatureFlagService === 'undefined' || typeof ViewManager === 'undefined') {
            if (projectFilterContainer) projectFilterContainer.innerHTML = ''; return;
        }
        projectFilterContainer.innerHTML = '';
        const currentUniqueProjects = AppStore.getUniqueProjects();

        if (!FeatureFlagService.isFeatureEnabled('projectFeature') || currentUniqueProjects.length === 0) {
            projectFilterContainer.classList.add('hidden');
            return;
        }
        projectFilterContainer.classList.remove('hidden');

        const heading = document.createElement('h2'); heading.className = 'sidebar-text-content sidebar-section-title text-lg md:text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2 md:mb-3 mt-4'; heading.textContent = 'Projects'; projectFilterContainer.appendChild(heading);
        const projectListUl = document.createElement('div'); projectListUl.className = 'flex flex-col gap-2';

        currentUniqueProjects.forEach(project => {
            const button = document.createElement('button');
            const isActive = ViewManager.getCurrentFilter() === `project_${project.id}`;
            const baseClasses = 'smart-view-btn w-full text-left px-3 py-2 md:px-4 md:py-2.5 rounded-lg transition-colors duration-300 flex items-center sidebar-button-icon-only justify-center';
            const activeColorClasses = 'bg-purple-500 text-white font-semibold dark:bg-purple-600 dark:text-purple-50';
            const inactiveColorClasses = 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600';
            button.className = `${baseClasses} ${isActive ? activeColorClasses : inactiveColorClasses}`;
            button.dataset.filter = `project_${project.id}`; button.title = project.name;
            const icon = document.createElement('i'); const iconActiveColor = 'text-purple-100 dark:text-purple-200'; const iconInactiveColor = 'text-slate-500 dark:text-slate-400'; icon.className = `fas fa-folder w-5 mr-0 ${isActive ? iconActiveColor : iconInactiveColor}`;
            const textSpan = document.createElement('span'); textSpan.className = 'sidebar-text-content ml-2 md:ml-2.5 truncate'; textSpan.textContent = project.name;
            button.appendChild(icon); button.appendChild(textSpan);
            button.addEventListener('click', () => { if (typeof setFilter === 'function') setFilter(`project_${project.id}`); }); // setFilter is global from ui_event_handlers.js
            projectListUl.appendChild(button);
        });
        projectFilterContainer.appendChild(projectListUl);

        if (taskSidebar && taskSidebar.classList.contains('sidebar-minimized')) {
            if(heading) heading.classList.add('hidden');
            projectListUl.querySelectorAll('.sidebar-button-icon-only').forEach(btn => {
                 btn.classList.add('justify-center');
                 btn.querySelector('i')?.classList.remove('md:mr-2', 'md:mr-2.5', 'ml-2');
                 btn.querySelector('.sidebar-text-content')?.classList.add('hidden');
            });
        }
    }

    if (typeof window.AppFeatures === 'undefined') window.AppFeatures = {};
    window.AppFeatures.Projects = {
        initialize: initializeProjectFeature,
        updateUIVisibility: updateProjectUIVisibility,
        openManageProjectsModal: openManageProjectsModal,
        // populate functions are still exposed for main.js to call on initial load,
        // and they now subscribe to events for subsequent updates.
        populateProjectDropdowns: populateProjectDropdowns,
        populateProjectFilterList: populateProjectFilterList
    };
})();
