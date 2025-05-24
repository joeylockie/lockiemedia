// projectService.js
// This file contains services related to project data and operations.
// It relies on AppStore for state management. showMessage is currently global.

import AppStore from './store.js';
// NEW: Import LoggingService
import LoggingService from './loggingService.js';
// showMessage is currently a global function from ui_rendering.js.
// It will be properly imported when ui_rendering.js becomes a module.

/**
 * Adds a new project.
 * @param {string} projectName - The name for the new project.
 * @returns {object|null} The new project object or null if failed.
 */
export function addProject(projectName) {
    const functionName = 'addProject'; // For logging context
    if (!AppStore || typeof AppStore.getProjects !== 'function' || typeof AppStore.setProjects !== 'function') {
        // MODIFIED: Use LoggingService
        LoggingService.error("[ProjectService] AppStore API not available.", new Error("AppStoreMissing"), { functionName, projectName });
        if (typeof showMessage === 'function') showMessage('Error adding project: Service unavailable.', 'error'); //
        return null; //
    }

    const currentProjects = AppStore.getProjects(); //
    const trimmedProjectName = projectName.trim(); //

    if (trimmedProjectName === '') { //
        // MODIFIED: Log this info as well
        LoggingService.info("[ProjectService] Attempted to add project with empty name.", { functionName });
        if (typeof showMessage === 'function') showMessage('Project name cannot be empty.', 'error'); //
        return null; //
    }
    if (currentProjects.some(p => p.name.toLowerCase() === trimmedProjectName.toLowerCase() && p.id !== 0)) { //
        // MODIFIED: Log this info
        LoggingService.info(`[ProjectService] Attempted to add duplicate project name: "${trimmedProjectName}".`, { functionName, projectName: trimmedProjectName });
        if (typeof showMessage === 'function') showMessage(`Project "${trimmedProjectName}" already exists.`, 'error'); //
        return null; //
    }

    const newProject = { //
        id: Date.now(), //
        name: trimmedProjectName, //
        creationDate: Date.now() //
    };
    
    const updatedProjects = [...currentProjects, newProject]; //
    AppStore.setProjects(updatedProjects);  //
    
    // MODIFIED: Use LoggingService
    LoggingService.info(`[ProjectService] Project added: "${newProject.name}" (ID: ${newProject.id})`, { functionName, newProject });
    return { ...newProject }; // Return a copy
}

/**
 * Updates the name of an existing project.
 * @param {number} projectId - The ID of the project to update.
 * @param {string} newName - The new name for the project.
 * @returns {object|null} The updated project object or null if not found/failed.
 */
export function updateProjectName(projectId, newName) {
    const functionName = 'updateProjectName'; // For logging context
    if (!AppStore || typeof AppStore.getProjects !== 'function' || typeof AppStore.setProjects !== 'function') { //
        // MODIFIED: Use LoggingService
        LoggingService.error("[ProjectService] AppStore API not available.", new Error("AppStoreMissing"), { functionName, projectId });
        if (typeof showMessage === 'function') showMessage('Error updating project: Service unavailable.', 'error'); //
        return null; //
    }

    let currentProjects = AppStore.getProjects(); //
    const projectIndex = currentProjects.findIndex(p => p.id === projectId); //

    if (projectIndex === -1 || projectId === 0) { //
        LoggingService.warn(`[ProjectService] Project not found or "No Project" cannot be edited.`, { functionName, projectId });
        if (typeof showMessage === 'function') showMessage('Project not found or "No Project" cannot be edited.', 'error'); //
        return null; //
    }

    const trimmedNewName = newName.trim(); //
    if (trimmedNewName === '') { //
        LoggingService.info(`[ProjectService] Attempted to update project ID ${projectId} with empty name.`, { functionName, projectId });
        if (typeof showMessage === 'function') showMessage('Project name cannot be empty.', 'error'); //
        return null; //
    }
    if (currentProjects.some(p => p.name.toLowerCase() === trimmedNewName.toLowerCase() && p.id !== projectId && p.id !== 0)) { //
        LoggingService.info(`[ProjectService] Attempted to update project ID ${projectId} to a duplicate name: "${trimmedNewName}".`, { functionName, projectId, newName: trimmedNewName });
        if (typeof showMessage === 'function') showMessage(`Another project with the name "${trimmedNewName}" already exists.`, 'error'); //
        return null; //
    }

    currentProjects[projectIndex].name = trimmedNewName; //
    AppStore.setProjects(currentProjects); //
    
    // MODIFIED: Use LoggingService
    LoggingService.info(`[ProjectService] Project ${projectId} updated to name: "${trimmedNewName}".`, { functionName, projectId, newName: trimmedNewName });
    return { ...currentProjects[projectIndex] }; // Return a copy
}

/**
 * Deletes a project by its ID and reassigns its tasks to "No Project".
 * @param {number} projectId - The ID of the project to delete.
 * @returns {boolean} True if deletion was successful, false otherwise.
 */
export function deleteProjectById(projectId) {
    const functionName = 'deleteProjectById'; // For logging context
    if (!AppStore || typeof AppStore.getProjects !== 'function' || typeof AppStore.setProjects !== 'function' ||
        typeof AppStore.getTasks !== 'function' || typeof AppStore.setTasks !== 'function') { //
        // MODIFIED: Use LoggingService
        LoggingService.error("[ProjectService] AppStore API not available.", new Error("AppStoreMissing"), { functionName, projectId });
        if (typeof showMessage === 'function') showMessage('Error deleting project: Service unavailable.', 'error'); //
        return false; //
    }

    if (projectId === 0) { //
        LoggingService.warn('[ProjectService] "No Project" cannot be deleted.', { functionName, projectId });
        if (typeof showMessage === 'function') showMessage('"No Project" cannot be deleted.', 'error'); //
        return false; //
    }

    let currentProjects = AppStore.getProjects(); //
    const projectIndex = currentProjects.findIndex(p => p.id === projectId); //

    if (projectIndex === -1) { //
        LoggingService.warn(`[ProjectService] Project not found for deletion.`, { functionName, projectId });
        if (typeof showMessage === 'function') showMessage('Project not found for deletion.', 'error'); //
        return false; //
    }

    const projectName = currentProjects[projectIndex].name; //

    const updatedProjects = currentProjects.filter(p => p.id !== projectId); //
    AppStore.setProjects(updatedProjects); //

    let currentTasks = AppStore.getTasks(); //
    let tasksModified = false; //
    const updatedTasks = currentTasks.map(task => { //
        if (task.projectId === projectId) { //
            tasksModified = true; //
            return { ...task, projectId: 0 };  //
        }
        return task; //
    });

    if (tasksModified) { //
        AppStore.setTasks(updatedTasks); //
    }

    // MODIFIED: Use LoggingService
    LoggingService.info(`[ProjectService] Project "${projectName}" (ID: ${projectId}) deleted. Associated tasks reassigned.`, { functionName, projectId, projectName, tasksModified });
    return true; //
}

/**
 * Retrieves a project by its ID.
 * @param {number} projectId - The ID of the project.
 * @returns {object|undefined} The project object (a copy) or undefined if not found.
 */
export function getProjectById(projectId) {
    const functionName = 'getProjectById'; // For logging context
    if (!AppStore || typeof AppStore.getProjects !== 'function') { //
        // MODIFIED: Use LoggingService
        LoggingService.error("[ProjectService] AppStore API not available.", new Error("AppStoreMissing"), { functionName, projectId });
        return undefined; //
    }
    const project = AppStore.getProjects().find(p => p.id === projectId); //
    // MODIFIED: Log if project not found (debug level, as this can be a normal check)
    if (!project) {
        LoggingService.debug(`[ProjectService] Project with ID ${projectId} not found.`, { functionName, projectId });
    }
    return project ? { ...project } : undefined;  //
}

/**
 * Retrieves all projects.
 * @param {boolean} [includeNoProject=false] - Whether to include the "No Project" entry.
 * @returns {Array<object>} An array of project objects (copies).
 */
export function getAllProjects(includeNoProject = false) { //
    const functionName = 'getAllProjects'; // For logging context
     if (!AppStore || typeof AppStore.getProjects !== 'function') { //
        // MODIFIED: Use LoggingService
        LoggingService.error("[ProjectService] AppStore API not available.", new Error("AppStoreMissing"), { functionName });
        return []; //
    }
    const projectsFromStore = AppStore.getProjects();  //
    if (includeNoProject) { //
        return projectsFromStore.sort((a,b) => a.id === 0 ? -1 : b.id === 0 ? 1 : a.name.toLowerCase().localeCompare(b.name.toLowerCase())); //
    }
    return projectsFromStore.filter(p => p.id !== 0).sort((a,b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())); //
}

// MODIFIED: Use LoggingService
LoggingService.debug("projectService.js loaded as ES6 module.", { module: 'projectService' });