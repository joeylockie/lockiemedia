// feature_projects.js

import AppStore from './store.js';
import EventBus from './eventBus.js';
import { addProject, updateProjectName, deleteProjectById, getProjectById, getAllProjects } from './projectService.js';
import LoggingService from './loggingService.js';
import { setFilter } from './tasks_ui_event_handlers.js';
import ViewManager from './viewManager.js';

// DOM Element References
let manageProjectsModal, modalDialogManageProjects, closeManageProjectsModalBtn, closeManageProjectsSecondaryBtn;
let addNewProjectForm, newProjectInput, existingProjectsList;
let projectFilterContainer;
let modalProjectSelectAdd, modalProjectSelectViewEdit;

function initializeProjectFeature() {
    const functionName = 'initializeProjectFeature';
    if (!document.getElementById('taskSidebar')) {
        return; // Not on the main task page
    }

    LoggingService.info('[ProjectsFeature] Initializing...', { functionName });

    // Get all DOM elements
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

    // Attach Event Listeners
    addNewProjectForm?.addEventListener('submit', handleAddNewProject);
    closeManageProjectsModalBtn?.addEventListener('click', closeManageProjectsModal);
    closeManageProjectsSecondaryBtn?.addEventListener('click', closeManageProjectsModal);
    manageProjectsModal?.addEventListener('click', (event) => {
        if (event.target === manageProjectsModal) closeManageProjectsModal();
    });

    // Subscribe to data changes
    EventBus.subscribe('projectsChanged', () => {
        populateManageProjectsList();
        populateProjectDropdowns();
        populateProjectFilterList();
    });

    LoggingService.info('[ProjectsFeature] Initialized.', { functionName });
}

function openManageProjectsModal() {
    if (!manageProjectsModal || !modalDialogManageProjects) return;
    populateManageProjectsList();
    manageProjectsModal.classList.remove('hidden');
    setTimeout(() => { modalDialogManageProjects.classList.remove('scale-95', 'opacity-0'); }, 10);
    newProjectInput?.focus();
}

function closeManageProjectsModal() {
    if (!manageProjectsModal || !modalDialogManageProjects) return;
    modalDialogManageProjects.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { manageProjectsModal.classList.add('hidden'); }, 200);
}

function populateManageProjectsList() {
    if (!existingProjectsList) return;
    existingProjectsList.innerHTML = '';
    const displayProjects = getAllProjects();

    if (displayProjects.length === 0) {
        existingProjectsList.innerHTML = '<li class="text-slate-500 dark:text-slate-400 text-center">No projects created yet.</li>';
        return;
    }
    displayProjects.forEach(project => {
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700 rounded-md group';
        li.innerHTML = `
            <span class="text-slate-700 dark:text-slate-200">${project.name}</span>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                <button title="Edit project" class="p-1 mx-1 edit-project-btn" data-project-id="${project.id}">
                    <i class="fas fa-pencil-alt text-sky-500 hover:text-sky-700"></i>
                </button>
                <button title="Delete project" class="p-1 delete-project-btn" data-project-id="${project.id}">
                    <i class="fas fa-trash-alt text-red-500 hover:text-red-700"></i>
                </button>
            </div>
        `;
        existingProjectsList.appendChild(li);
    });

    // Add event listeners after creating the buttons
    existingProjectsList.querySelectorAll('.edit-project-btn').forEach(btn => {
        btn.addEventListener('click', () => handleEditProject(Number(btn.dataset.projectId)));
    });
    existingProjectsList.querySelectorAll('.delete-project-btn').forEach(btn => {
        btn.addEventListener('click', () => handleDeleteProject(Number(btn.dataset.projectId)));
    });
}

// Handlers are now async to await the service functions
async function handleAddNewProject(event) {
    event.preventDefault();
    if (!newProjectInput) return;
    const projectName = newProjectInput.value.trim();
    const newProject = await addProject(projectName);
    if (newProject) {
        EventBus.publish('displayUserMessage', { text: `Project "${newProject.name}" added.`, type: 'success' });
        newProjectInput.value = '';
    }
}

async function handleEditProject(projectId) {
    const project = getProjectById(projectId);
    if (!project) return;
    const newName = prompt(`Edit project name for "${project.name}":`, project.name);
    if (newName !== null) {
        await updateProjectName(projectId, newName);
        EventBus.publish('displayUserMessage', { text: `Project updated.`, type: 'success' });
    }
}

async function handleDeleteProject(projectId) {
    const project = getProjectById(projectId);
    if (!project) return;
    if (confirm(`Are you sure you want to delete "${project.name}"? Tasks will be moved to "No Project".`)) {
        const currentFilter = ViewManager.getCurrentFilter();
        await deleteProjectById(projectId);
        EventBus.publish('displayUserMessage', { text: `Project "${project.name}" deleted.`, type: 'success' });
        if (currentFilter === `project_${projectId}`) {
            setFilter('inbox');
        }
    }
}

function populateProjectDropdowns() {
    const projects = getAllProjects();
    const dropdowns = [modalProjectSelectAdd, modalProjectSelectViewEdit].filter(Boolean);

    dropdowns.forEach(dropdown => {
        const currentVal = dropdown.value;
        dropdown.innerHTML = '<option value="0">No Project</option>'; // Start fresh
        projects.forEach(project => {
            dropdown.innerHTML += `<option value="${project.id}">${project.name}</option>`;
        });
        dropdown.value = currentVal || "0";
    });
}

function populateProjectFilterList() {
    if (!projectFilterContainer) return; // Exit if the container isn't on the page
    
    projectFilterContainer.innerHTML = ''; // Clear previous list
    const projects = getAllProjects();

    if (projects.length === 0) {
        projectFilterContainer.classList.add('hidden');
        return;
    }

    projectFilterContainer.classList.remove('hidden');
    let listHtml = `<h2 class="sidebar-text-content sidebar-section-title text-lg md:text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2 md:mb-3 mt-4">Projects</h2><div class="flex flex-col gap-2">`;
    projects.forEach(project => {
        listHtml += `
            <button class="smart-view-btn w-full px-3 py-2 md:px-4 md:py-2.5 rounded-lg transition-colors duration-300 flex items-center sidebar-button-icon-only bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600" data-filter="project_${project.id}" title="${project.name}">
                <i class="fas fa-folder w-5 mr-0 text-slate-500 dark:text-slate-400"></i>
                <span class="sidebar-text-content ml-2 md:ml-2.5 truncate">${project.name}</span>
            </button>
        `;
    });
    listHtml += `</div>`;
    projectFilterContainer.innerHTML = listHtml;

    // Add event listeners to the new buttons
    projectFilterContainer.querySelectorAll('.smart-view-btn').forEach(btn => {
        btn.addEventListener('click', () => setFilter(btn.dataset.filter));
    });
}

export const ProjectsFeature = {
    initialize: initializeProjectFeature,
    openManageProjectsModal: openManageProjectsModal,
};

LoggingService.debug("feature_projects.js loaded as ES6 module.", { module: 'feature_projects' });