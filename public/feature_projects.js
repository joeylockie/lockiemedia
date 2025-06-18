// feature_projects.js

import AppStore from './store.js';
import EventBus from './eventBus.js'; // Already imported
import { isFeatureEnabled } from './featureFlagService.js';
import { addProject, updateProjectName, deleteProjectById, getProjectById, getAllProjects } from './projectService.js';

// NEW: Import LoggingService
import LoggingService from './loggingService.js';

// MODIFIED: showMessage import removed
// import { showMessage } from './ui_rendering.js'; 
import { setFilter } from './ui_event_handlers.js';
import ViewManager from './viewManager.js'; 


// DOM Element References (populated in initializeProjectFeature via getElementById)
let manageProjectsModal, modalDialogManageProjects, closeManageProjectsModalBtn, closeManageProjectsSecondaryBtn; 
let addNewProjectForm, newProjectInput, existingProjectsList; 
let projectFilterContainer; 
let modalProjectSelectAdd, modalProjectSelectViewEdit; 

function initializeProjectFeature() {
    const functionName = 'initializeProjectFeature';
    
    // --- Page-Specific Guard ---
    // This feature's DOM elements are only on the main todo.html page.
    if (!document.getElementById('taskSidebar')) {
        LoggingService.debug('[ProjectsFeature] Not on the main task page. Skipping initialization.', { functionName });
        return;
    }
    // --- End Page-Specific Guard ---

    LoggingService.info('[ProjectsFeature] Initializing...', { functionName });

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

    const attachListener = (element, eventType, handler, handlerName) => {
        if (element) {
            element.addEventListener(eventType, handler);
            LoggingService.debug(`[ProjectsFeature] Attached '${eventType}' listener for ${handlerName || handler.name}.`, { functionName: 'attachListener', elementId: element.id, eventType });
        } else {
            LoggingService.warn(`[ProjectsFeature] Element not found for listener attachment: ${handlerName}.`, { functionName: 'attachListener', handlerName, eventType });
        }
    };

    attachListener(closeManageProjectsModalBtn, 'click', closeManageProjectsModal, 'closeManageProjectsModal (primary)'); 
    attachListener(closeManageProjectsSecondaryBtn, 'click', closeManageProjectsModal, 'closeManageProjectsModal (secondary)'); 
    attachListener(addNewProjectForm, 'submit', handleAddNewProject, 'handleAddNewProject'); 
    if (manageProjectsModal) { 
        manageProjectsModal.addEventListener('click', (event) => { if (event.target === manageProjectsModal) closeManageProjectsModal(); }); 
        LoggingService.debug(`[ProjectsFeature] Attached backdrop click listener for Manage Projects Modal.`, { functionName, elementId: 'manageProjectsModal' });
    }


    if (EventBus) { 
        EventBus.subscribe('projectsChanged', () => { 
            LoggingService.debug("[ProjectsFeature] Event received: projectsChanged. Repopulating manage projects list.", { functionName, event: 'projectsChanged' });
            populateManageProjectsList(); 
        });
        EventBus.subscribe('uniqueProjectsChanged', () => { 
            LoggingService.debug("[ProjectsFeature] Event received: uniqueProjectsChanged. Repopulating dropdowns and filter list.", { functionName, event: 'uniqueProjectsChanged' });
            populateProjectDropdowns(); 
            populateProjectFilterList(); 
        });
         LoggingService.debug("[ProjectsFeature] EventBus subscriptions for project changes set up.", { functionName });
    } else {
        LoggingService.warn("[ProjectsFeature] EventBus not available for setting up project change subscriptions.", { functionName });
    }
    LoggingService.info('[ProjectsFeature] Initialized and event listeners set up.', { functionName });
}

function updateProjectUIVisibility() {
    const functionName = 'updateProjectUIVisibility';
    if (typeof isFeatureEnabled !== 'function') { 
        LoggingService.error("[ProjectsFeature] isFeatureEnabled function not available.", new Error("isFeatureEnabledMissing"), { functionName });
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('projectFeature'); 
    LoggingService.debug(`[ProjectsFeature] Updating UI visibility. Project feature enabled: ${isActuallyEnabled}.`, { functionName, isActuallyEnabled });
    const projectElements = document.querySelectorAll('.project-feature-element'); 
    projectElements.forEach(el => el.classList.toggle('hidden', !isActuallyEnabled)); 

    populateProjectFilterList(); 
    LoggingService.info(`[ProjectsFeature] UI Visibility set to: ${isActuallyEnabled}`, { functionName, isEnabled: isActuallyEnabled });
}

function openManageProjectsModal() {
    const functionName = 'openManageProjectsModal';
    LoggingService.debug('[ProjectsFeature] Attempting to open Manage Projects Modal.', { functionName });
    if (!manageProjectsModal || !modalDialogManageProjects) { 
        LoggingService.error("[ProjectsFeature] Manage Projects Modal DOM elements not found.", new Error("DOMElementMissing"), { functionName });
        return;
    }
    populateManageProjectsList(); 
    manageProjectsModal.classList.remove('hidden'); 
    setTimeout(() => { modalDialogManageProjects.classList.remove('scale-95', 'opacity-0'); modalDialogManageProjects.classList.add('scale-100', 'opacity-100'); }, 10); 
    if (newProjectInput) newProjectInput.focus(); 
    LoggingService.info('[ProjectsFeature] Manage Projects Modal opened.', { functionName });
}

function closeManageProjectsModal() {
    const functionName = 'closeManageProjectsModal';
    LoggingService.debug('[ProjectsFeature] Attempting to close Manage Projects Modal.', { functionName });
    if (!manageProjectsModal || !modalDialogManageProjects) { 
        LoggingService.warn("[ProjectsFeature] Manage Projects Modal DOM elements not found for closing.", { functionName });
        return;
    }
    modalDialogManageProjects.classList.add('scale-95', 'opacity-0'); 
    setTimeout(() => { manageProjectsModal.classList.add('hidden'); LoggingService.info('[ProjectsFeature] Manage Projects Modal closed.', { functionName }); }, 200); 
}

function populateManageProjectsList() {
    const functionName = 'populateManageProjectsList';
    if (!existingProjectsList || typeof getAllProjects !== 'function') { 
        LoggingService.error("[ProjectsFeature] Cannot populate manage projects list. Dependencies missing.", new Error("DependenciesMissing"), { functionName, existingProjectsListFound:!!existingProjectsList, getAllProjectsAvailable: typeof getAllProjects === 'function'});
        if(existingProjectsList) existingProjectsList.innerHTML = '<li class="text-slate-500 dark:text-slate-400 text-center">Error loading projects.</li>'; 
        return; 
    }
    existingProjectsList.innerHTML = ''; 
    const displayProjects = getAllProjects(); 
    LoggingService.debug(`[ProjectsFeature] Populating manage projects list with ${displayProjects.length} projects.`, { functionName, projectCount: displayProjects.length });

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
    const functionName = 'handleAddNewProject';
    event.preventDefault(); 
    if (!newProjectInput || typeof addProject !== 'function') { 
        LoggingService.error("[ProjectsFeature] New project input or addProject service function not available.", new Error("DependenciesMissing"), { functionName, newProjectInputFound: !!newProjectInput, addProjectAvailable: typeof addProject === 'function'});
        return;
    }
    const projectName = newProjectInput.value.trim(); 
    LoggingService.info(`[ProjectsFeature] Attempting to add new project: "${projectName}".`, { functionName, projectName });
    const newProjectAdded = addProject(projectName); 
    if (newProjectAdded) { 
        // MODIFIED: Publish event instead of direct call
        EventBus.publish('displayUserMessage', { text: `Project "${newProjectAdded.name}" added.`, type: 'success' });
        newProjectInput.value = ''; 
    }
}

function handleEditProject(projectId) {
    const functionName = 'handleEditProject';
    LoggingService.info(`[ProjectsFeature] User initiated edit for project ID: ${projectId}.`, { functionName, projectId });
    if (typeof getProjectById !== 'function' || typeof updateProjectName !== 'function') { 
        LoggingService.error("[ProjectsFeature] Project service functions (getProjectById or updateProjectName) not available.", new Error("ServiceFunctionMissing"), { functionName, projectId });
        return;
    }
    const project = getProjectById(projectId); 
    if (!project || project.id === 0) { 
        LoggingService.warn(`[ProjectsFeature] Edit cancelled: Project ID ${projectId} not found or is "No Project".`, { functionName, projectId });
        // projectService now handles its own error messages/logging for this
        return; 
    }
    const newName = prompt(`Edit project name for "${project.name}":`, project.name); 
    if (newName === null) { 
        LoggingService.debug(`[ProjectsFeature] Project edit cancelled by user for project ID: ${projectId}.`, { functionName, projectId });
        return;
    }
    const updatedProject = updateProjectName(projectId, newName); 
    if (updatedProject) { 
        // MODIFIED: Publish event instead of direct call
        EventBus.publish('displayUserMessage', { text: `Project updated to "${updatedProject.name}".`, type: 'success' });
    }
}

function handleDeleteProject(projectId) {
    const functionName = 'handleDeleteProject';
    LoggingService.info(`[ProjectsFeature] User initiated delete for project ID: ${projectId}.`, { functionName, projectId });
    if (typeof getProjectById !== 'function' || typeof deleteProjectById !== 'function' || !ViewManager) { 
        LoggingService.error("[ProjectsFeature] Core dependencies missing for project deletion.", new Error("DependenciesMissing"), {
            functionName,
            projectId,
            getProjectByIdAvailable: typeof getProjectById === 'function',
            deleteProjectByIdAvailable: typeof deleteProjectById === 'function',
            viewManagerAvailable: !!ViewManager
        });
        return;
    }
    const project = getProjectById(projectId); 
    if (!project || project.id === 0) { 
        LoggingService.warn(`[ProjectsFeature] Delete cancelled: Project ID ${projectId} not found or is "No Project".`, { functionName, projectId });
        // projectService now handles its own error messages/logging
        return; 
    }
    if (!confirm(`Are you sure you want to delete the project "${project.name}"? Tasks in this project will be moved to "No Project".`)) { 
        LoggingService.debug(`[ProjectsFeature] Project deletion cancelled by user for project ID: ${projectId}.`, { functionName, projectId });
        return; 
    }
    const currentFilterBeforeDelete = ViewManager.getCurrentFilter(); 
    if (deleteProjectById(projectId)) { 
        // MODIFIED: Publish event instead of direct call
        EventBus.publish('displayUserMessage', { text: `Project "${project.name}" deleted. Associated tasks moved.`, type: 'success' });
        if (currentFilterBeforeDelete === `project_${projectId}`) { 
            LoggingService.info(`[ProjectsFeature] Current filter was for deleted project ${projectId}. Resetting filter to inbox.`, { functionName, projectId });
            setFilter('inbox'); 
        }
    } else {
        LoggingService.warn(`[ProjectsFeature] Deletion failed for project ID: ${projectId} (see projectService logs).`, { functionName, projectId });
        // Error message handled by projectService if needed
    }
}

function populateProjectDropdowns() {
    const functionName = 'populateProjectDropdowns';
    if (typeof AppStore === 'undefined' || typeof AppStore.getUniqueProjects !== 'function') { 
         LoggingService.warn("[ProjectsFeature] AppStore.getUniqueProjects not available for dropdowns.", { functionName }); return; 
    }
    const currentUniqueProjects = AppStore.getUniqueProjects(); 
    const dropdowns = []; 
    if (modalProjectSelectAdd) dropdowns.push(modalProjectSelectAdd); 
    if (modalProjectSelectViewEdit) dropdowns.push(modalProjectSelectViewEdit); 

    if (dropdowns.length === 0) {
        LoggingService.debug("[ProjectsFeature] No project dropdowns found to populate.", { functionName });
        return;
    }
    LoggingService.debug(`[ProjectsFeature] Populating ${dropdowns.length} project dropdowns with ${currentUniqueProjects.length} projects.`, { functionName, dropdownCount: dropdowns.length, projectCount: currentUniqueProjects.length });

    dropdowns.forEach(dropdown => { 
        if (!dropdown) return; const currentVal = dropdown.value; dropdown.innerHTML = ''; 
        const noProjectOption = document.createElement('option'); noProjectOption.value = "0"; noProjectOption.textContent = "No Project"; dropdown.appendChild(noProjectOption); 
        currentUniqueProjects.forEach(project => { const option = document.createElement('option'); option.value = project.id; option.textContent = project.name; dropdown.appendChild(option); }); 
        if (currentVal && (currentUniqueProjects.some(p => p.id.toString() === currentVal) || currentVal === "0")) { dropdown.value = currentVal; } else if (dropdown.options.length > 0) { dropdown.value = "0"; } 
    });
}

function populateProjectFilterList() {
    const functionName = 'populateProjectFilterList';
    if (!projectFilterContainer || typeof AppStore === 'undefined' || typeof AppStore.getUniqueProjects !== 'function' || typeof isFeatureEnabled !== 'function' || !ViewManager) { 
        LoggingService.warn("[ProjectsFeature] Cannot populate project filter list. Dependencies missing.", {
            functionName,
            projectFilterContainerFound: !!projectFilterContainer,
            appStoreAvailable: !!AppStore,
            isFeatureEnabledAvailable: typeof isFeatureEnabled === 'function',
            viewManagerAvailable: !!ViewManager
        });
        if (projectFilterContainer) projectFilterContainer.innerHTML = ''; return; 
    }
    projectFilterContainer.innerHTML = ''; 
    const currentUniqueProjects = AppStore.getUniqueProjects(); 

    if (!isFeatureEnabled('projectFeature') || currentUniqueProjects.length === 0) { 
        projectFilterContainer.classList.add('hidden'); 
        LoggingService.debug("[ProjectsFeature] Project filter list hidden (feature disabled or no projects).", { functionName, projectFeatureEnabled: isFeatureEnabled('projectFeature'), projectCount: currentUniqueProjects.length });
        return; 
    }
    projectFilterContainer.classList.remove('hidden'); 
    LoggingService.debug(`[ProjectsFeature] Populating project filter list with ${currentUniqueProjects.length} projects.`, { functionName, projectCount: currentUniqueProjects.length });

    const heading = document.createElement('h2'); heading.className = 'sidebar-text-content sidebar-section-title text-lg md:text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2 md:mb-3 mt-4'; heading.textContent = 'Projects'; projectFilterContainer.appendChild(heading); 
    const projectListUl = document.createElement('div'); projectListUl.className = 'flex flex-col gap-2'; 

    currentUniqueProjects.forEach(project => { 
        const button = document.createElement('button'); 
        button.className = 'smart-view-btn w-full text-left px-3 py-2 md:px-4 md:py-2.5 rounded-lg transition-colors duration-300 flex items-center sidebar-button-icon-only justify-center bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'; 
        button.dataset.filter = `project_${project.id}`; 
        button.title = project.name; 

        const icon = document.createElement('i'); 
        icon.className = `fas fa-folder w-5 mr-0 text-slate-500 dark:text-slate-400`; 
        const textSpan = document.createElement('span'); 
        textSpan.className = 'sidebar-text-content ml-2 md:ml-2.5 truncate'; 
        textSpan.textContent = project.name; 
        button.appendChild(icon); 
        button.appendChild(textSpan); 

        button.addEventListener('click', () => { 
            LoggingService.debug(`[ProjectsFeature] Project filter button clicked: project_${project.id}`, { functionName: 'projectFilterButtonHandler', filter: `project_${project.id}` });
            setFilter(`project_${project.id}`) 
        });
        projectListUl.appendChild(button); 
    });
    projectFilterContainer.appendChild(projectListUl); 

    const taskSidebarEl = document.getElementById('taskSidebar'); 
    if (taskSidebarEl && taskSidebarEl.classList.contains('sidebar-minimized')) { 
        if(heading) heading.classList.add('hidden'); 
        projectListUl.querySelectorAll('.sidebar-button-icon-only').forEach(btn => { 
            btn.classList.add('justify-center'); 
            btn.querySelector('i')?.classList.remove('md:mr-2', 'md:mr-2.5', 'ml-2'); 
            btn.querySelector('.sidebar-text-content')?.classList.add('hidden'); 
        });
    }
}


export const ProjectsFeature = { 
    initialize: initializeProjectFeature, 
    updateUIVisibility: updateProjectUIVisibility, 
    openManageProjectsModal: openManageProjectsModal, 
    populateProjectDropdowns: populateProjectDropdowns, 
    populateProjectFilterList: populateProjectFilterList 
};

LoggingService.debug("feature_projects.js loaded as ES6 module.", { module: 'feature_projects' });