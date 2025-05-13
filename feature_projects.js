// feature_projects.js

// Self-invoking function to encapsulate the Project feature's code
(function() {
    // --- DOM Element References (to be assigned in initialize or when modals are created) ---
    let manageProjectsModal, modalDialogManageProjects, closeManageProjectsModalBtn, closeManageProjectsSecondaryBtn;
    let addNewProjectForm, newProjectInput, existingProjectsList;
    let projectFilterContainer; // For sidebar project filters
    // Add/Edit Task Modal Project Selectors
    let modalProjectSelectAdd, modalProjectSelectViewEdit;


    /**
     * Initializes the Project Feature.
     * This function will set up event listeners for project-related UI elements
     * once they are added to the HTML.
     */
    function initializeProjectFeature() {
        // Get references to DOM elements that will be added for project management
        manageProjectsModal = document.getElementById('manageProjectsModal');
        modalDialogManageProjects = document.getElementById('modalDialogManageProjects');
        closeManageProjectsModalBtn = document.getElementById('closeManageProjectsModalBtn');
        closeManageProjectsSecondaryBtn = document.getElementById('closeManageProjectsSecondaryBtn');
        addNewProjectForm = document.getElementById('addNewProjectForm');
        newProjectInput = document.getElementById('newProjectInput');
        existingProjectsList = document.getElementById('existingProjectsList');
        projectFilterContainer = document.getElementById('projectFilterContainer'); // Sidebar section for project filters

        // Modals' project selectors
        modalProjectSelectAdd = document.getElementById('modalProjectSelectAdd');
        modalProjectSelectViewEdit = document.getElementById('modalProjectSelectViewEdit');


        // Event listeners for the Manage Projects Modal
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

        console.log('Project Feature Initialized.');
        // populateProjectFilterList(); // Call this to build project filters in sidebar
        // populateProjectDropdowns(); // Populate dropdowns in add/edit task modals
    }

    /**
     * Updates the visibility of all Project UI elements based on the feature flag.
     * @param {boolean} isEnabled - True if the feature is enabled, false otherwise.
     */
    function updateProjectUIVisibility(isEnabled) {
        const projectElements = document.querySelectorAll('.project-feature-element');
        projectElements.forEach(el => {
            el.classList.toggle('hidden', !isEnabled);
        });

        // If the feature is disabled and a project filter is active, switch to inbox
        if (!isEnabled && currentFilter.startsWith('project_')) {
            if (typeof setFilter === 'function') { // Ensure setFilter is available
                setFilter('inbox');
            }
        }
        // Re-populate sidebar filters if the feature is enabled/disabled
        if (typeof populateProjectFilterList === 'function') {
             populateProjectFilterList();
        }


        console.log(`Project Feature UI Visibility set to: ${isEnabled}`);
    }

    // --- Manage Projects Modal UI Functions ---
    function openManageProjectsModal() {
        if (!manageProjectsModal || !modalDialogManageProjects) {
            console.error("Manage Projects Modal elements not found.");
            return;
        }
        populateManageProjectsList();
        manageProjectsModal.classList.remove('hidden');
        setTimeout(() => { // For transition
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
        if (!existingProjectsList) return;
        existingProjectsList.innerHTML = ''; // Clear current list

        // Get projects, excluding the default "No Project" (id 0)
        const displayProjects = projects.filter(p => p.id !== 0).sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

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
        if (!newProjectInput) return;
        const projectName = newProjectInput.value.trim();

        if (projectName === '') {
            if (typeof showMessage === 'function') showMessage('Project name cannot be empty.', 'error');
            return;
        }
        // Check if project name already exists (case-insensitive)
        if (projects.some(p => p.name.toLowerCase() === projectName.toLowerCase() && p.id !== 0)) {
            if (typeof showMessage === 'function') showMessage(`Project "${projectName}" already exists.`, 'error');
            return;
        }

        const newProject = {
            id: Date.now(), // Simple ID generation
            name: projectName,
            creationDate: Date.now()
        };
        projects.push(newProject);
        saveProjects(); // This will also call updateUniqueProjects

        if (typeof showMessage === 'function') showMessage(`Project "${projectName}" added.`, 'success');
        newProjectInput.value = '';
        populateManageProjectsList();
        populateProjectDropdowns(); // Update dropdowns in task modals
        populateProjectFilterList(); // Update sidebar filters
    }

    function handleEditProject(projectId) {
        const project = projects.find(p => p.id === projectId);
        if (!project || project.id === 0) { // Cannot edit "No Project"
            if (typeof showMessage === 'function') showMessage('Project not found or cannot be edited.', 'error');
            return;
        }

        const newName = prompt(`Edit project name for "${project.name}":`, project.name);
        if (newName === null) return; // User cancelled

        const trimmedNewName = newName.trim();
        if (trimmedNewName === '') {
            if (typeof showMessage === 'function') showMessage('Project name cannot be empty.', 'error');
            return;
        }
        // Check if new name conflicts with another existing project (excluding itself)
        if (projects.some(p => p.name.toLowerCase() === trimmedNewName.toLowerCase() && p.id !== projectId && p.id !== 0)) {
            if (typeof showMessage === 'function') showMessage(`Another project with the name "${trimmedNewName}" already exists.`, 'error');
            return;
        }

        project.name = trimmedNewName;
        saveProjects();
        if (typeof showMessage === 'function') showMessage(`Project updated to "${trimmedNewName}".`, 'success');
        populateManageProjectsList();
        populateProjectDropdowns();
        populateProjectFilterList();
        if (typeof refreshTaskView === 'function') refreshTaskView(); // Refresh if tasks display project names
    }

    function handleDeleteProject(projectId) {
        const projectIndex = projects.findIndex(p => p.id === projectId);
        if (projectIndex === -1 || projectId === 0) { // Cannot delete "No Project"
            if (typeof showMessage === 'function') showMessage('Project not found or cannot be deleted.', 'error');
            return;
        }

        const projectName = projects[projectIndex].name;
        if (!confirm(`Are you sure you want to delete the project "${projectName}"? Tasks in this project will be moved to "No Project".`)) {
            return;
        }

        projects.splice(projectIndex, 1);

        // Update tasks that belonged to the deleted project
        tasks.forEach(task => {
            if (task.projectId === projectId) {
                task.projectId = 0; // Assign to "No Project" (or null if you prefer a different default)
            }
        });
        saveTasks(); // Save tasks with updated project IDs
        saveProjects(); // Save the modified projects list

        if (typeof showMessage === 'function') showMessage(`Project "${projectName}" deleted. Associated tasks moved to "No Project".`, 'success');
        populateManageProjectsList();
        populateProjectDropdowns();
        populateProjectFilterList();

        // If current filter was for the deleted project, reset to inbox
        if (currentFilter === `project_${projectId}`) {
            if (typeof setFilter === 'function') setFilter('inbox');
        } else {
            if (typeof refreshTaskView === 'function') refreshTaskView();
        }
    }

    /**
     * Populates project select dropdowns in Add and Edit task modals.
     */
    function populateProjectDropdowns() {
        const dropdowns = [];
        if (modalProjectSelectAdd) dropdowns.push(modalProjectSelectAdd);
        if (modalProjectSelectViewEdit) dropdowns.push(modalProjectSelectViewEdit);

        dropdowns.forEach(dropdown => {
            if (!dropdown) return;
            const currentVal = dropdown.value; // Preserve selection if possible
            dropdown.innerHTML = ''; // Clear existing options

            // Add "No Project" / "None" option (ID 0 or null)
            const noProjectOption = document.createElement('option');
            noProjectOption.value = "0"; // Or "null" string if tasks use null
            noProjectOption.textContent = "No Project";
            dropdown.appendChild(noProjectOption);

            uniqueProjects.forEach(project => { // uniqueProjects is already sorted and excludes "No Project"
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = project.name;
                dropdown.appendChild(option);
            });
            // Try to reselect previous value
            if (currentVal) dropdown.value = currentVal;
        });
    }

    /**
     * Populates the sidebar with project filters.
     */
    function populateProjectFilterList() {
        if (!projectFilterContainer) {
            // console.warn("Project filter container not found in sidebar.");
            return;
        }
        projectFilterContainer.innerHTML = ''; // Clear existing project filters

        if (!featureFlags.projectFeature || uniqueProjects.length === 0) {
            projectFilterContainer.classList.add('hidden'); // Hide container if no projects or feature off
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
            button.className = 'smart-view-btn w-full text-left px-3 py-2 md:px-4 md:py-2.5 rounded-lg transition-colors duration-300 flex items-center sidebar-button-icon-only justify-center';
            button.dataset.filter = `project_${project.id}`; // Custom filter type
            button.title = project.name;

            const icon = document.createElement('i');
            icon.className = 'fas fa-folder w-5 mr-0 text-slate-500 dark:text-slate-400'; // Example icon

            const textSpan = document.createElement('span');
            textSpan.className = 'sidebar-text-content ml-2 md:ml-2.5 truncate';
            textSpan.textContent = project.name;

            button.appendChild(icon);
            button.appendChild(textSpan);

            button.addEventListener('click', () => {
                if (typeof setFilter === 'function') {
                    setFilter(`project_${project.id}`);
                }
            });
            projectListUl.appendChild(button);
        });
        projectFilterContainer.appendChild(projectListUl);

        // Apply minimized styles if sidebar is minimized
        if (taskSidebar && taskSidebar.classList.contains('sidebar-minimized')) {
            if(heading) heading.classList.add('hidden');
            projectListUl.querySelectorAll('.sidebar-button-icon-only').forEach(btn => {
                 btn.classList.add('justify-center');
                 btn.querySelector('i')?.classList.remove('md:mr-2', 'md:mr-2.5', 'ml-2');
                 btn.querySelector('.sidebar-text-content')?.classList.add('hidden');
            });
        }
    }


    // Expose functions to the global scope via AppFeatures
    if (typeof window.AppFeatures === 'undefined') {
        window.AppFeatures = {};
    }
    window.AppFeatures.Projects = {
        initialize: initializeProjectFeature,
        updateUIVisibility: updateProjectUIVisibility,
        openManageProjectsModal: openManageProjectsModal,
        populateProjectDropdowns: populateProjectDropdowns,
        populateProjectFilterList: populateProjectFilterList
        // Internal handlers like handleAddNewProject are not exposed directly but called by event listeners.
    };

})();
