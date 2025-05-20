// feature_projects.js

import AppStore from './store.js';
import EventBus from './eventBus.js';
import { isFeatureEnabled } from './featureFlagService.js';
// Removed ViewManager import as setFilter from ui_event_handlers will handle it.
// import { getCurrentFilter, setCurrentFilter as setViewManagerCurrentFilter } from './viewManager.js';
import { addProject, updateProjectName, deleteProjectById, getProjectById, getAllProjects } from './projectService.js';

// Import functions from other modules
import { showMessage } from './ui_rendering.js'; // Import showMessage
import { setFilter } from './ui_event_handlers.js'; // Import setFilter

// DOM Element References (populated in initializeProjectFeature via getElementById)
let manageProjectsModal, modalDialogManageProjects, closeManageProjectsModalBtn, closeManageProjectsSecondaryBtn;
let addNewProjectForm, newProjectInput, existingProjectsList;
let projectFilterContainer;
let modalProjectSelectAdd, modalProjectSelectViewEdit; // These are used by populateProjectDropdowns

// Note: showMessage is now imported.
// refreshTaskView is not directly called here; changes trigger events that ui_rendering handles.
// taskSidebar will be fetched directly.

function initializeProjectFeature() {
    manageProjectsModal = document.getElementById('manageProjectsModal');
    modalDialogManageProjects = document.getElementById('modalDialogManageProjects');
    closeManageProjectsModalBtn = document.getElementById('closeManageProjectsModalBtn');
    closeManageProjectsSecondaryBtn = document.getElementById('closeManageProjectsSecondaryBtn');
    addNewProjectForm = document.getElementById('addNewProjectForm');
    newProjectInput = document.getElementById('newProjectInput');
    existingProjectsList = document.getElementById('existingProjectsList');
    projectFilterContainer = document.getElementById('projectFilterContainer'); // Used by populateProjectFilterList
    modalProjectSelectAdd = document.getElementById('modalProjectSelectAdd'); // Used by populateProjectDropdowns
    modalProjectSelectViewEdit = document.getElementById('modalProjectSelectViewEdit'); // Used by populateProjectDropdowns


    if (closeManageProjectsModalBtn) closeManageProjectsModalBtn.addEventListener('click', closeManageProjectsModal);
    if (closeManageProjectsSecondaryBtn) closeManageProjectsSecondaryBtn.addEventListener('click', closeManageProjectsModal);
    if (addNewProjectForm) addNewProjectForm.addEventListener('submit', handleAddNewProject);
    if (manageProjectsModal) manageProjectsModal.addEventListener('click', (event) => { if (event.target === manageProjectsModal) closeManageProjectsModal(); });

    if (EventBus) {
        EventBus.subscribe('projectsChanged', () => {
            console.log("[ProjectsFeature] Detected 'projectsChanged' event. Repopulating manage projects list.");
            populateManageProjectsList(); // This function is local to this module
        });
        EventBus.subscribe('uniqueProjectsChanged', () => {
            console.log("[ProjectsFeature] Detected 'uniqueProjectsChanged' event. Repopulating dropdowns and filter list.");
            populateProjectDropdowns(); // Local to this module
            populateProjectFilterList(); // Local to this module
        });
    }
    console.log('[ProjectsFeature] Initialized and event listeners set up.');
}

function updateProjectUIVisibility() {
    if (typeof isFeatureEnabled !== 'function' || typeof AppStore.getStore === 'function' /* Should be AppStore itself */) {
        // console.error("[ProjectsFeature] Core service functions not available for UI visibility update.");
        // Corrected the check above, ViewManager is not directly needed here if setFilter handles it
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('projectFeature');
    const projectElements = document.querySelectorAll('.project-feature-element');
    projectElements.forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));

    // If feature is disabled and a project filter was active, reset to inbox.
    // This logic is now primarily handled by setFilter in ui_event_handlers when it gets the current filter.
    // However, a direct check might be useful if this function is called independently.
    // For now, let's rely on ui_event_handlers.setFilter or ViewManager events to manage this.
    // The original code checked getCurrentFilter().startsWith('project_')
    // and then called setViewManagerCurrentFilter('inbox').
    // If the feature is disabled, ui_event_handlers.applyActiveFeatures would call refreshTaskView,
    // which might reset the view if the current filter is invalid.

    populateProjectFilterList(); // Refresh the list based on visibility
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
    if (!existingProjectsList || typeof getAllProjects !== 'function') {
        if(existingProjectsList) existingProjectsList.innerHTML = '<li class="text-slate-500 dark:text-slate-400 text-center">Error loading projects.</li>';
        return;
    }
    existingProjectsList.innerHTML = '';
    const displayProjects = getAllProjects();

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
    if (!newProjectInput || typeof addProject !== 'function') return;
    const projectName = newProjectInput.value.trim();
    const newProjectAdded = addProject(projectName);
    if (newProjectAdded) {
        showMessage(`Project "${newProjectAdded.name}" added.`, 'success'); // Use imported showMessage
        newProjectInput.value = '';
    }
}

function handleEditProject(projectId) {
    if (typeof getProjectById !== 'function' || typeof updateProjectName !== 'function') return;
    const project = getProjectById(projectId);
    if (!project || project.id === 0) {
        showMessage('Project not found or "No Project" cannot be edited.', 'error'); // Use imported showMessage
        return;
    }
    const newName = prompt(`Edit project name for "${project.name}":`, project.name);
    if (newName === null) return;
    const updatedProject = updateProjectName(projectId, newName);
    if (updatedProject) {
        showMessage(`Project updated to "${updatedProject.name}".`, 'success'); // Use imported showMessage
    }
}

function handleDeleteProject(projectId) {
    // Need to import ViewManager for getCurrentFilter, setCurrentFilter if we want to reset filter here
    // For now, setFilter from ui_event_handlers does that.
    if (typeof getProjectById !== 'function' || typeof deleteProjectById !== 'function') return;
    const project = getProjectById(projectId);
    if (!project || project.id === 0) {
        showMessage('Project not found or "No Project" cannot be deleted.', 'error'); // Use imported showMessage
        return;
    }
    if (!confirm(`Are you sure you want to delete the project "${project.name}"? Tasks in this project will be moved to "No Project".`)) {
        return;
    }
    const currentFilterBeforeDelete = ViewManager.getCurrentFilter(); // Get ViewManager from import
    if (deleteProjectById(projectId)) {
        showMessage(`Project "${project.name}" deleted. Associated tasks moved.`, 'success'); // Use imported showMessage
        if (currentFilterBeforeDelete === `project_${projectId}`) {
            setFilter('inbox'); // Use imported setFilter to reset and restyle
        }
    } else {
        showMessage('Failed to delete project.', 'error'); // Use imported showMessage
    }
}

function populateProjectDropdowns() {
    // modalProjectSelectAdd and modalProjectSelectViewEdit are module-level variables,
    // initialized in initializeProjectFeature via getElementById.
    if (typeof AppStore === 'undefined' || typeof AppStore.getUniqueProjects !== 'function') {
         console.warn("[ProjectsFeature] AppStore.getUniqueProjects not available for dropdowns."); return;
    }
    const currentUniqueProjects = AppStore.getUniqueProjects();
    const dropdowns = [];
    if (modalProjectSelectAdd) dropdowns.push(modalProjectSelectAdd);
    if (modalProjectSelectViewEdit) dropdowns.push(modalProjectSelectViewEdit);

    dropdowns.forEach(dropdown => {
        if (!dropdown) return; const currentVal = dropdown.value; dropdown.innerHTML = '';
        const noProjectOption = document.createElement('option'); noProjectOption.value = "0"; noProjectOption.textContent = "No Project"; dropdown.appendChild(noProjectOption);
        currentUniqueProjects.forEach(project => { const option = document.createElement('option'); option.value = project.id; option.textContent = project.name; dropdown.appendChild(option); });
        if (currentVal && (currentUniqueProjects.some(p => p.id.toString() === currentVal) || currentVal === "0")) { dropdown.value = currentVal; } else if (dropdown.options.length > 0) { dropdown.value = "0"; }
    });
}

function populateProjectFilterList() {
    // projectFilterContainer is a module-level variable, initialized via getElementById.
    // ViewManager should be imported if we need getCurrentFilter. setFilter (from ui_event_handlers) uses ViewManager.
    if (!projectFilterContainer || typeof AppStore === 'undefined' || typeof AppStore.getUniqueProjects !== 'function' || typeof isFeatureEnabled !== 'function') {
        if (projectFilterContainer) projectFilterContainer.innerHTML = ''; return;
    }
    projectFilterContainer.innerHTML = ''; // Clear previous
    const currentUniqueProjects = AppStore.getUniqueProjects(); // From AppStore import

    if (!isFeatureEnabled('projectFeature') || currentUniqueProjects.length === 0) {
        projectFilterContainer.classList.add('hidden');
        return;
    }
    projectFilterContainer.classList.remove('hidden');
    const heading = document.createElement('h2'); heading.className = 'sidebar-text-content sidebar-section-title text-lg md:text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2 md:mb-3 mt-4'; heading.textContent = 'Projects'; projectFilterContainer.appendChild(heading);
    const projectListUl = document.createElement('div'); projectListUl.className = 'flex flex-col gap-2';

    currentUniqueProjects.forEach(project => {
        // const isActive = ViewManager.getCurrentFilter() === `project_${project.id}`; // Requires ViewManager import
        // setFilter handles the active state styling, so we don't need to check isActive here directly for styling
        const button = document.createElement('button');
        // Styling will be applied by setFilter from ui_event_handlers.js
        // We need to ensure the initial state is also styled correctly.
        // The setFilter function in ui_event_handlers applies styles based on ViewManager.getCurrentFilter().
        // So, calling populateProjectFilterList and then ui_event_handlers.setFilter(ViewManager.getCurrentFilter())
        // during initialization (e.g., in main.js or when projects change) should ensure correct styling.
        // For now, rely on setFilter in ui_event_handlers to style appropriately.
        // The initial styling is handled by main.js calling setFilter(ViewManager.getCurrentFilter()) after setup.
        button.className = 'smart-view-btn w-full text-left px-3 py-2 md:px-4 md:py-2.5 rounded-lg transition-colors duration-300 flex items-center sidebar-button-icon-only justify-center bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'; // Default inactive style
        button.dataset.filter = `project_${project.id}`;
        button.title = project.name;

        const icon = document.createElement('i');
        icon.className = `fas fa-folder w-5 mr-0 text-slate-500 dark:text-slate-400`; // Default inactive icon color
        const textSpan = document.createElement('span');
        textSpan.className = 'sidebar-text-content ml-2 md:ml-2.5 truncate';
        textSpan.textContent = project.name;
        button.appendChild(icon);
        button.appendChild(textSpan);

        button.addEventListener('click', () => setFilter(`project_${project.id}`)); // Use imported setFilter
        projectListUl.appendChild(button);
    });
    projectFilterContainer.appendChild(projectListUl);

    const taskSidebarEl = document.getElementById('taskSidebar'); // Get taskSidebar directly
    if (taskSidebarEl && taskSidebarEl.classList.contains('sidebar-minimized')) {
        if(heading) heading.classList.add('hidden');
        projectListUl.querySelectorAll('.sidebar-button-icon-only').forEach(btn => {
            btn.classList.add('justify-center');
            btn.querySelector('i')?.classList.remove('md:mr-2', 'md:mr-2.5', 'ml-2'); // Ensure correct classes
            btn.querySelector('.sidebar-text-content')?.classList.add('hidden');
        });
    }
    // After populating, ensure the correct button is styled as active by calling setFilter
    // This should ideally be handled by an event or a more central styling update mechanism.
    // For now, the `setFilter` call on click will handle it. Initial call from main.js handles load.
}


export const ProjectsFeature = {
    initialize: initializeProjectFeature,
    updateUIVisibility: updateProjectUIVisibility,
    openManageProjectsModal: openManageProjectsModal, // This function is local
    // closeManageProjectsModal is local and attached to buttons
    populateProjectDropdowns: populateProjectDropdowns, // This function is local
    populateProjectFilterList: populateProjectFilterList // This function is local
};

// This console log was already present
console.log("feature_projects.js loaded as ES6 module.");