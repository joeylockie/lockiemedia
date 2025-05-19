// feature_projects.js

// Self-invoking function to encapsulate the Project feature's code
(function() {
    let manageProjectsModal, modalDialogManageProjects, closeManageProjectsModalBtn, closeManageProjectsSecondaryBtn;
    let addNewProjectForm, newProjectInput, existingProjectsList;
    let projectFilterContainer;
    let modalProjectSelectAdd, modalProjectSelectViewEdit;

    // Dependencies: FeatureFlagService, ViewManager, ProjectService, showMessage, refreshTaskView,
    // global state: uniqueProjects (from store.js, updated by events from ProjectService)

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

        console.log('[ProjectsFeature] Initialized.');
        // Subscribe to project-related events if this module needs to react directly
        // For example, to re-populate lists when projects change from another source (less likely in current setup)
        if (typeof EventBus !== 'undefined') {
            EventBus.subscribe('projectsChanged', () => {
                console.log("[ProjectsFeature] Detected 'projectsChanged' event. Repopulating lists.");
                populateManageProjectsList();
                populateProjectDropdowns();
                populateProjectFilterList();
            });
             EventBus.subscribe('uniqueProjectsChanged', () => { // This is more specific for UI elements using uniqueProjects
                console.log("[ProjectsFeature] Detected 'uniqueProjectsChanged' event. Repopulating UI elements.");
                populateProjectDropdowns();
                populateProjectFilterList();
            });
        }
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
        populateProjectFilterList(); // Re-populate/clear based on feature state
        console.log(`[ProjectsFeature] UI Visibility set to: ${isActuallyEnabled}`);
    }

    function openManageProjectsModal() {
        if (!manageProjectsModal || !modalDialogManageProjects) return;
        populateManageProjectsList();
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
        if (!existingProjectsList || typeof ProjectService === 'undefined') return;
        existingProjectsList.innerHTML = '';
        const displayProjects = ProjectService.getAllProjects(); // Get projects from service

        if (displayProjects.length === 0) {
            existingProjectsList.innerHTML = '<li class="text-slate-500 dark:text-slate-400 text-center">No projects created yet.</li>';
            return;
        }
        displayProjects.forEach(project => { /* ... (list item creation as before) ... */ 
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
        if (!newProjectInput || typeof ProjectService === 'undefined' || typeof showMessage !== 'function') return;
        const projectName = newProjectInput.value.trim();
        const newProject = ProjectService.addProject(projectName); // Use service
        if (newProject) {
            showMessage(`Project "${newProject.name}" added.`, 'success');
            newProjectInput.value = '';
            // UI lists (manage projects, dropdowns, filters) will be updated via 'projectsChanged' / 'uniqueProjectsChanged' events
        }
        // No need to call populate functions here if they subscribe to events
    }

    function handleEditProject(projectId) {
        if (typeof ProjectService === 'undefined' || typeof showMessage !== 'function') return;
        const project = ProjectService.getProjectById(projectId); // Use service
        if (!project || project.id === 0) {
            showMessage('Project not found or cannot be edited.', 'error');
            return;
        }
        const newName = prompt(`Edit project name for "${project.name}":`, project.name);
        if (newName === null) return;
        const updatedProject = ProjectService.updateProjectName(projectId, newName); // Use service
        if (updatedProject) {
            showMessage(`Project updated to "${updatedProject.name}".`, 'success');
            // UI lists will update via events.
            // If current view is this project, refreshTaskView might be needed if project name is displayed in heading.
            // This is handled by the 'projectsChanged' event triggering refreshTaskView in ui_rendering.js.
        }
    }

    function handleDeleteProject(projectId) {
        if (typeof ProjectService === 'undefined' || typeof showMessage !== 'function' || typeof ViewManager === 'undefined') return;
        const project = ProjectService.getProjectById(projectId);
        if (!project) {
            showMessage('Project not found.', 'error');
            return;
        }
        if (!confirm(`Are you sure you want to delete the project "${project.name}"? Tasks in this project will be moved to "No Project".`)) {
            return;
        }
        if (ProjectService.deleteProjectById(projectId)) { // Use service
            showMessage(`Project "${project.name}" deleted. Associated tasks moved.`, 'success');
            // 'projectsChanged' and 'tasksChanged' events will trigger UI updates.
            if (ViewManager.getCurrentFilter() === `project_${projectId}`) {
                ViewManager.setCurrentFilter('inbox'); // This publishes 'filterChanged'
            }
        } else {
            showMessage('Failed to delete project.', 'error');
        }
    }

    function populateProjectDropdowns() {
        if (typeof uniqueProjects === 'undefined') { // uniqueProjects from store.js
             console.warn("[ProjectsFeature] 'uniqueProjects' array not available for dropdowns."); return;
        }
        const dropdowns = [];
        if (modalProjectSelectAdd) dropdowns.push(modalProjectSelectAdd);
        if (modalProjectSelectViewEdit) dropdowns.push(modalProjectSelectViewEdit);
        dropdowns.forEach(dropdown => { /* ... (implementation as before, using global uniqueProjects) ... */ 
            if (!dropdown) return; const currentVal = dropdown.value; dropdown.innerHTML = '';
            const noProjectOption = document.createElement('option'); noProjectOption.value = "0"; noProjectOption.textContent = "No Project"; dropdown.appendChild(noProjectOption);
            uniqueProjects.forEach(project => { const option = document.createElement('option'); option.value = project.id; option.textContent = project.name; dropdown.appendChild(option); });
            if (currentVal) dropdown.value = currentVal;
        });
    }

    function populateProjectFilterList() {
        if (!projectFilterContainer || typeof uniqueProjects === 'undefined' || typeof FeatureFlagService === 'undefined' || typeof ViewManager === 'undefined') { if (projectFilterContainer) projectFilterContainer.innerHTML = ''; return; }
        projectFilterContainer.innerHTML = '';
        if (!FeatureFlagService.isFeatureEnabled('projectFeature') || uniqueProjects.length === 0) { projectFilterContainer.classList.add('hidden'); return; }
        projectFilterContainer.classList.remove('hidden');
        const heading = document.createElement('h2'); heading.className = 'sidebar-text-content sidebar-section-title text-lg md:text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2 md:mb-3 mt-4'; heading.textContent = 'Projects'; projectFilterContainer.appendChild(heading);
        const projectListUl = document.createElement('div'); projectListUl.className = 'flex flex-col gap-2';
        uniqueProjects.forEach(project => { /* ... (button creation as before, using ViewManager.getCurrentFilter()) ... */ 
            const button = document.createElement('button'); const isActive = ViewManager.getCurrentFilter() === `project_${project.id}`; const baseClasses = 'smart-view-btn w-full text-left px-3 py-2 md:px-4 md:py-2.5 rounded-lg transition-colors duration-300 flex items-center sidebar-button-icon-only justify-center'; const activeColorClasses = 'bg-purple-500 text-white font-semibold dark:bg-purple-600 dark:text-purple-50'; const inactiveColorClasses = 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'; button.className = `${baseClasses} ${isActive ? activeColorClasses : inactiveColorClasses}`; button.dataset.filter = `project_${project.id}`; button.title = project.name;
            const icon = document.createElement('i'); const iconActiveColor = 'text-purple-100 dark:text-purple-200'; const iconInactiveColor = 'text-slate-500 dark:text-slate-400'; icon.className = `fas fa-folder w-5 mr-0 ${isActive ? iconActiveColor : iconInactiveColor}`;
            const textSpan = document.createElement('span'); textSpan.className = 'sidebar-text-content ml-2 md:ml-2.5 truncate'; textSpan.textContent = project.name;
            button.appendChild(icon); button.appendChild(textSpan);
            button.addEventListener('click', () => { if (typeof setFilter === 'function') setFilter(`project_${project.id}`); }); projectListUl.appendChild(button);
        });
        projectFilterContainer.appendChild(projectListUl);
        if (taskSidebar && taskSidebar.classList.contains('sidebar-minimized')) { if(heading) heading.classList.add('hidden'); projectListUl.querySelectorAll('.sidebar-button-icon-only').forEach(btn => { btn.classList.add('justify-center'); btn.querySelector('i')?.classList.remove('md:mr-2', 'md:mr-2.5', 'ml-2'); btn.querySelector('.sidebar-text-content')?.classList.add('hidden'); });}
    }

    if (typeof window.AppFeatures === 'undefined') window.AppFeatures = {};
    window.AppFeatures.Projects = {
        initialize: initializeProjectFeature,
        updateUIVisibility: updateProjectUIVisibility,
        openManageProjectsModal: openManageProjectsModal,
        populateProjectDropdowns: populateProjectDropdowns, // Still needed by Add/Edit task modals
        populateProjectFilterList: populateProjectFilterList // Still needed for sidebar
    };
})();
