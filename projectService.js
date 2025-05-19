// projectService.js
// This file contains services related to project data and operations.
// It relies on AppStore for state management. showMessage is currently global.

import AppStore from './store.js';
// showMessage is currently a global function from ui_rendering.js.
// It will be properly imported when ui_rendering.js becomes a module.

/**
 * Adds a new project.
 * @param {string} projectName - The name for the new project.
 * @returns {object|null} The new project object or null if failed.
 */
export function addProject(projectName) {
    if (!AppStore || typeof AppStore.getProjects !== 'function' || typeof AppStore.setProjects !== 'function') {
        console.error("[ProjectService] AppStore API not available for addProject.");
        if (typeof showMessage === 'function') showMessage('Error adding project: Service unavailable.', 'error');
        return null;
    }

    const currentProjects = AppStore.getProjects();
    const trimmedProjectName = projectName.trim();

    if (trimmedProjectName === '') {
        if (typeof showMessage === 'function') showMessage('Project name cannot be empty.', 'error');
        return null;
    }
    if (currentProjects.some(p => p.name.toLowerCase() === trimmedProjectName.toLowerCase() && p.id !== 0)) {
        if (typeof showMessage === 'function') showMessage(`Project "${trimmedProjectName}" already exists.`, 'error');
        return null;
    }

    const newProject = {
        id: Date.now(),
        name: trimmedProjectName,
        creationDate: Date.now()
    };
    
    const updatedProjects = [...currentProjects, newProject];
    AppStore.setProjects(updatedProjects); 
    
    console.log("[ProjectService] Project added:", newProject);
    return { ...newProject }; // Return a copy
}

/**
 * Updates the name of an existing project.
 * @param {number} projectId - The ID of the project to update.
 * @param {string} newName - The new name for the project.
 * @returns {object|null} The updated project object or null if not found/failed.
 */
export function updateProjectName(projectId, newName) {
    if (!AppStore || typeof AppStore.getProjects !== 'function' || typeof AppStore.setProjects !== 'function') {
        console.error("[ProjectService] AppStore API not available for updateProjectName.");
        if (typeof showMessage === 'function') showMessage('Error updating project: Service unavailable.', 'error');
        return null;
    }

    let currentProjects = AppStore.getProjects();
    const projectIndex = currentProjects.findIndex(p => p.id === projectId);

    if (projectIndex === -1 || projectId === 0) {
        if (typeof showMessage === 'function') showMessage('Project not found or "No Project" cannot be edited.', 'error');
        return null;
    }

    const trimmedNewName = newName.trim();
    if (trimmedNewName === '') {
        if (typeof showMessage === 'function') showMessage('Project name cannot be empty.', 'error');
        return null;
    }
    if (currentProjects.some(p => p.name.toLowerCase() === trimmedNewName.toLowerCase() && p.id !== projectId && p.id !== 0)) {
        if (typeof showMessage === 'function') showMessage(`Another project with the name "${trimmedNewName}" already exists.`, 'error');
        return null;
    }

    currentProjects[projectIndex].name = trimmedNewName;
    AppStore.setProjects(currentProjects);
    
    console.log(`[ProjectService] Project ${projectId} updated to name: "${trimmedNewName}".`);
    return { ...currentProjects[projectIndex] }; // Return a copy
}

/**
 * Deletes a project by its ID and reassigns its tasks to "No Project".
 * @param {number} projectId - The ID of the project to delete.
 * @returns {boolean} True if deletion was successful, false otherwise.
 */
export function deleteProjectById(projectId) {
    if (!AppStore || typeof AppStore.getProjects !== 'function' || typeof AppStore.setProjects !== 'function' ||
        typeof AppStore.getTasks !== 'function' || typeof AppStore.setTasks !== 'function') {
        console.error("[ProjectService] AppStore API not available for deleteProjectById.");
        if (typeof showMessage === 'function') showMessage('Error deleting project: Service unavailable.', 'error');
        return false;
    }

    if (projectId === 0) {
        if (typeof showMessage === 'function') showMessage('"No Project" cannot be deleted.', 'error');
        return false;
    }

    let currentProjects = AppStore.getProjects();
    const projectIndex = currentProjects.findIndex(p => p.id === projectId);

    if (projectIndex === -1) {
        if (typeof showMessage === 'function') showMessage('Project not found for deletion.', 'error');
        return false;
    }

    const projectName = currentProjects[projectIndex].name;

    const updatedProjects = currentProjects.filter(p => p.id !== projectId);
    AppStore.setProjects(updatedProjects);

    let currentTasks = AppStore.getTasks();
    let tasksModified = false;
    const updatedTasks = currentTasks.map(task => {
        if (task.projectId === projectId) {
            tasksModified = true;
            return { ...task, projectId: 0 }; 
        }
        return task;
    });

    if (tasksModified) {
        AppStore.setTasks(updatedTasks);
    }

    console.log(`[ProjectService] Project "${projectName}" (ID: ${projectId}) deleted. Associated tasks reassigned.`);
    return true;
}

/**
 * Retrieves a project by its ID.
 * @param {number} projectId - The ID of the project.
 * @returns {object|undefined} The project object (a copy) or undefined if not found.
 */
export function getProjectById(projectId) {
    if (!AppStore || typeof AppStore.getProjects !== 'function') {
        console.error("[ProjectService] AppStore API not available for getProjectById.");
        return undefined;
    }
    const project = AppStore.getProjects().find(p => p.id === projectId);
    return project ? { ...project } : undefined; 
}

/**
 * Retrieves all projects.
 * @param {boolean} [includeNoProject=false] - Whether to include the "No Project" entry.
 * @returns {Array<object>} An array of project objects (copies).
 */
export function getAllProjects(includeNoProject = false) {
     if (!AppStore || typeof AppStore.getProjects !== 'function') {
        console.error("[ProjectService] AppStore API not available for getAllProjects.");
        return [];
    }
    const projectsFromStore = AppStore.getProjects(); 
    if (includeNoProject) {
        return projectsFromStore.sort((a,b) => a.id === 0 ? -1 : b.id === 0 ? 1 : a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    }
    return projectsFromStore.filter(p => p.id !== 0).sort((a,b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
}

console.log("projectService.js loaded as ES6 module.");
