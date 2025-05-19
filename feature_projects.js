// feature_projects.js

import AppStore from './store.js'; // For getUniqueProjects (transitional)
import EventBus from './eventBus.js';
import { isFeatureEnabled } from './featureFlagService.js';
import { getCurrentFilter, setCurrentFilter as setViewManagerCurrentFilter } from './viewManager.js'; // Renamed to avoid conflict
import { addProject, updateProjectName, deleteProjectById, getProjectById, getAllProjects } from './projectService.js';

// DOM Element References (populated in initializeProjectFeature)
let manageProjectsModal, modalDialogManageProjects, closeManageProjectsModalBtn, closeManageProjectsSecondaryBtn;
let addNewProjectForm, newProjectInput, existingProjectsList;
let projectFilterContainer;
let modalProjectSelectAdd, modalProjectSelectViewEdit;

// Still relying on some globals during transition (will be imported or passed later)
// showMessage (from ui_rendering.js)
// refreshTaskView (from ui_rendering.js)
// setFilter (from ui_event_handlers.js - this one is tricky as it's a UI action)
// taskSidebar (from ui_rendering.js, for minimized check)

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

    if (EventBus) {
        EventBus.subscribe('projectsChanged', () => {
            console.log("[ProjectsFeature] Detected 'projectsChanged' event. Repopulating manage projects list.");
            populateManageProjectsList();
        });
        EventBus.subscribe('uniqueProjectsChanged', () => {
            console.log("[ProjectsFeature] Detected 'uniqueProjectsChanged' event. Repopulating dropdowns and filter list.");
            populateProjectDropdowns();
            populateProjectFilterList();
        });
    }
    console.log('[ProjectsFeature] Initialized and event listeners set up.');
}

function updateProjectUIVisibility() { // isEnabledParam removed, uses imported isFeatureEnabled
    if (typeof isFeatureEnabled !== 'function' || typeof getCurrentFilter !== 'function' || typeof setViewManagerCurrentFilter !== 'function') {
        console.error("[ProjectsFeature] Core service functions not available for UI visibility update.");
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('projectFeature');
    const projectElements = document.querySelectorAll('.project-feature-element');
    projectElements.forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));

    if (!isActuallyEnabled && getCurrentFilter().startsWith('project_')) {
        setViewManagerCurrentFilter('inbox'); 
    }
    populateProjectFilterList();
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
    if (!newProjectInput || typeof addProject !== 'function' || typeof showMessage !== 'function') return;
    const projectName = newProjectInput.value.trim();
    const newProjectAdded = addProject(projectName); // Uses imported ProjectService.addProject
    if (newProjectAdded) {
        if(typeof showMessage === 'function') showMessage(`Project "${newProjectAdded.name}" added.`, 'success');
        newProjectInput.value = '';
        // UI lists update via events published by AppStore (triggered by ProjectService)
    }
}

function handleEditProject(projectId) {
    if (typeof getProjectById !== 'function' || typeof updateProjectName !== 'function' || typeof showMessage !== 'function') return;
    const project = getProjectById(projectId); // Uses imported ProjectService.getProjectById
    if (!project || project.id === 0) {
        if(typeof showMessage === 'function') showMessage('Project not found or "No Project" cannot be edited.', 'error');
        return;
    }
    const newName = prompt(`Edit project name for "${project.name}":`, project.name);
    if (newName === null) return; 
    const updatedProject = updateProjectName(projectId, newName); // Uses imported ProjectService.updateProjectName
    if (updatedProject) {
        if(typeof showMessage === 'function') showMessage(`Project updated to "${updatedProject.name}".`, 'success');
    }
}

function handleDeleteProject(projectId) {
    if (typeof getProjectById !== 'function' || typeof deleteProjectById !== 'function' || typeof showMessage !== 'function' || typeof getCurrentFilter !== 'function' || typeof setViewManagerCurrentFilter !== 'function') return;
    const project = getProjectById(projectId); // Uses imported ProjectService.getProjectById
    if (!project || project.id === 0) {
        if(typeof showMessage === 'function') showMessage('Project not found or "No Project" cannot be deleted.', 'error');
        return;
    }
    if (!confirm(`Are you sure you want to delete the project "${project.name}"? Tasks in this project will be moved to "No Project".`)) {
        return;
    }
    if (deleteProjectById(projectId)) { // Uses imported ProjectService.deleteProjectById
        if(typeof showMessage === 'function') showMessage(`Project "${project.name}" deleted. Associated tasks moved.`, 'success');
        if (getCurrentFilter() === `project_${projectId}`) {
            setViewManagerCurrentFilter('inbox');
        }
    } else {
        if(typeof showMessage === 'function') showMessage('Failed to delete project.', 'error');
    }
}

function populateProjectDropdowns() {
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
        if (currentVal && currentUniqueProjects.some(p => p.id.toString() === currentVal) || currentVal === "0") { dropdown.value = currentVal; } else if (dropdown.options.length > 0) { dropdown.value = "0"; }
    });
}

function populateProjectFilterList() {
    if (!projectFilterContainer || typeof AppStore === 'undefined' || typeof AppStore.getUniqueProjects !== 'function' || typeof isFeatureEnabled !== 'function' || typeof getCurrentFilter !== 'function') {
        if (projectFilterContainer) projectFilterContainer.innerHTML = ''; return;
    }
    projectFilterContainer.innerHTML = '';
    const currentUniqueProjects = AppStore.getUniqueProjects();

    if (!isFeatureEnabled('projectFeature') || currentUniqueProjects.length === 0) {
        projectFilterContainer.classList.add('hidden');
        return;
    }
    projectFilterContainer.classList.remove('hidden');
    const heading = document.createElement('h2'); heading.className = 'sidebar-text-content sidebar-section-title text-lg md:text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2 md:mb-3 mt-4'; heading.textContent = 'Projects'; projectFilterContainer.appendChild(heading);
    const projectListUl = document.createElement('div'); projectListUl.className = 'flex flex-col gap-2';
    currentUniqueProjects.forEach(project => { 
        const button = document.createElement('button'); const isActive = getCurrentFilter() === `project_${project.id}`; const baseClasses = 'smart-view-btn w-full text-left px-3 py-2 md:px-4 md:py-2.5 rounded-lg transition-colors duration-300 flex items-center sidebar-button-icon-only justify-center'; const activeColorClasses = 'bg-purple-500 text-white font-semibold dark:bg-purple-600 dark:text-purple-50'; const inactiveColorClasses = 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'; button.className = `${baseClasses} ${isActive ? activeColorClasses : inactiveColorClasses}`; button.dataset.filter = `project_${project.id}`; button.title = project.name;
        const icon = document.createElement('i'); const iconActiveColor = 'text-purple-100 dark:text-purple-200'; const iconInactiveColor = 'text-slate-500 dark:text-slate-400'; icon.className = `fas fa-folder w-5 mr-0 ${isActive ? iconActiveColor : iconInactiveColor}`;
        const textSpan = document.createElement('span'); textSpan.className = 'sidebar-text-content ml-2 md:ml-2.5 truncate'; textSpan.textContent = project.name;
        button.appendChild(icon); button.appendChild(textSpan);
        // The global `setFilter` function (from ui_event_handlers.js) will be used here.
        // This will be refactored when ui_event_handlers.js becomes a module.
        button.addEventListener('click', () => { if (typeof window.setFilter === 'function') window.setFilter(`project_${project.id}`); }); 
        projectListUl.appendChild(button);
    });
    projectFilterContainer.appendChild(projectListUl);
    // taskSidebar is still global from ui_rendering.js for now
    if (window.taskSidebar && window.taskSidebar.classList.contains('sidebar-minimized')) {
        if(heading) heading.classList.add('hidden');
        projectListUl.querySelectorAll('.sidebar-button-icon-only').forEach(btn => { btn.classList.add('justify-center'); btn.querySelector('i')?.classList.remove('md:mr-2', 'md:mr-2.5', 'ml-2'); btn.querySelector('.sidebar-text-content')?.classList.add('hidden'); });
    }
}

// Export the feature object for main.js to use
export const ProjectsFeature = {
    initialize: initializeProjectFeature,
    updateUIVisibility: updateProjectUIVisibility,
    openManageProjectsModal: openManageProjectsModal,
    populateProjectDropdowns: populateProjectDropdowns,
    populateProjectFilterList: populateProjectFilterList
};

console.log("feature_projects.js loaded as ES6 module.");
