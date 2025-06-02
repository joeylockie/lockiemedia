// projectService.js
// This file contains services related to project data and operations.
// It relies on AppStore for state management.

import AppStore from './store.js';
import EventBus from './eventBus.js'; // MODIFIED: Added EventBus import
// NEW: Import LoggingService
import LoggingService from './loggingService.js';
// MODIFIED: showMessage is no longer assumed to be global.

/**
 * Adds a new project.
 * @param {string} projectName - The name for the new project.
 * @returns {object|null} The new project object or null if failed.
 */
export function addProject(projectName) {
    const functionName = 'addProject'; // For logging context
    if (!AppStore || typeof AppStore.getProjects !== 'function' || typeof AppStore.setProjects !== 'function') {
        LoggingService.error("[ProjectService] AppStore API not available.", new Error("AppStoreMissing"), { functionName, projectName });
        // MODIFIED: Publish event instead of direct call
        EventBus.publish('displayUserMessage', { text: 'Error adding project: Service unavailable.', type: 'error' });
        return null;
    }

    const currentProjects = AppStore.getProjects();
    const trimmedProjectName = projectName.trim();

    if (trimmedProjectName === '') {
        LoggingService.info("[ProjectService] Attempted to add project with empty name.", { functionName });
        // MODIFIED: Publish event instead of direct call
        EventBus.publish('displayUserMessage', { text: 'Project name cannot be empty.', type: 'error' });
        return null;
    }
    if (currentProjects.some(p => p.name.toLowerCase() === trimmedProjectName.toLowerCase() && p.id !== 0)) {
        LoggingService.info(`[ProjectService] Attempted to add duplicate project name: "${trimmedProjectName}".`, { functionName, projectName: trimmedProjectName });
        // MODIFIED: Publish event instead of direct call
        EventBus.publish('displayUserMessage', { text: `Project "${trimmedProjectName}" already exists.`, type: 'error' });
        return null;
    }

    const newProject = {
        id: Date.now(),
        name: trimmedProjectName,
        creationDate: Date.now()
    };

    const updatedProjects = [...currentProjects, newProject];
    AppStore.setProjects(updatedProjects);

    LoggingService.info(`[ProjectService] Project added: "${newProject.name}" (ID: ${newProject.id})`, { functionName, newProject });
    // Note: The success message is usually handled by the calling UI handler (e.g., in feature_projects.js)
    return { ...newProject };
}

/**
 * Updates the name of an existing project.
 * @param {number} projectId - The ID of the project to update.
 * @param {string} newName - The new name for the project.
 * @returns {object|null} The updated project object or null if not found/failed.
 */
export function updateProjectName(projectId, newName) {
    const functionName = 'updateProjectName';
    if (!AppStore || typeof AppStore.getProjects !== 'function' || typeof AppStore.setProjects !== 'function') {
        LoggingService.error("[ProjectService] AppStore API not available.", new Error("AppStoreMissing"), { functionName, projectId });
        // MODIFIED: Publish event instead of direct call
        EventBus.publish('displayUserMessage', { text: 'Error updating project: Service unavailable.', type: 'error' });
        return null;
    }

    let currentProjects = AppStore.getProjects();
    const projectIndex = currentProjects.findIndex(p => p.id === projectId);

    if (projectIndex === -1 || projectId === 0) {
        LoggingService.warn(`[ProjectService] Project not found or "No Project" cannot be edited.`, { functionName, projectId });
        // MODIFIED: Publish event instead of direct call
        EventBus.publish('displayUserMessage', { text: 'Project not found or "No Project" cannot be edited.', type: 'error' });
        return null;
    }

    const trimmedNewName = newName.trim();
    if (trimmedNewName === '') {
        LoggingService.info(`[ProjectService] Attempted to update project ID ${projectId} with empty name.`, { functionName, projectId });
        // MODIFIED: Publish event instead of direct call
        EventBus.publish('displayUserMessage', { text: 'Project name cannot be empty.', type: 'error' });
        return null;
    }
    if (currentProjects.some(p => p.name.toLowerCase() === trimmedNewName.toLowerCase() && p.id !== projectId && p.id !== 0)) {
        LoggingService.info(`[ProjectService] Attempted to update project ID ${projectId} to a duplicate name: "${trimmedNewName}".`, { functionName, projectId, newName: trimmedNewName });
        // MODIFIED: Publish event instead of direct call
        EventBus.publish('displayUserMessage', { text: `Another project with the name "${trimmedNewName}" already exists.`, type: 'error' });
        return null;
    }

    currentProjects[projectIndex].name = trimmedNewName;
    AppStore.setProjects(currentProjects);

    LoggingService.info(`[ProjectService] Project ${projectId} updated to name: "${trimmedNewName}".`, { functionName, projectId, newName: trimmedNewName });
    // Note: The success message is usually handled by the calling UI handler (e.g., in feature_projects.js)
    return { ...currentProjects[projectIndex] };
}

/**
 * Deletes a project by its ID and reassigns its tasks to "No Project".
 * @param {number} projectId - The ID of the project to delete.
 * @returns {boolean} True if deletion was successful, false otherwise.
 */
export function deleteProjectById(projectId) {
    const functionName = 'deleteProjectById';
    if (!AppStore || typeof AppStore.getProjects !== 'function' || typeof AppStore.setProjects !== 'function' ||
        typeof AppStore.getTasks !== 'function' || typeof AppStore.setTasks !== 'function') {
        LoggingService.error("[ProjectService] AppStore API not available.", new Error("AppStoreMissing"), { functionName, projectId });
        // MODIFIED: Publish event instead of direct call
        EventBus.publish('displayUserMessage', { text: 'Error deleting project: Service unavailable.', type: 'error' });
        return false;
    }

    if (projectId === 0) {
        LoggingService.warn('[ProjectService] "No Project" cannot be deleted.', { functionName, projectId });
        // MODIFIED: Publish event instead of direct call
        EventBus.publish('displayUserMessage', { text: '"No Project" cannot be deleted.', type: 'error' });
        return false;
    }

    let currentProjects = AppStore.getProjects();
    const projectIndex = currentProjects.findIndex(p => p.id === projectId);

    if (projectIndex === -1) {
        LoggingService.warn(`[ProjectService] Project not found for deletion.`, { functionName, projectId });
        // MODIFIED: Publish event instead of direct call
        EventBus.publish('displayUserMessage', { text: 'Project not found for deletion.', type: 'error' });
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

    LoggingService.info(`[ProjectService] Project "${projectName}" (ID: ${projectId}) deleted. Associated tasks reassigned.`, { functionName, projectId, projectName, tasksModified });
    // Note: The success message is usually handled by the calling UI handler (e.g., in feature_projects.js)
    return true;
}

/**
 * Retrieves a project by its ID.
 * @param {number} projectId - The ID of the project.
 * @returns {object|undefined} The project object (a copy) or undefined if not found.
 */
export function getProjectById(projectId) {
    const functionName = 'getProjectById';
    if (!AppStore || typeof AppStore.getProjects !== 'function') {
        LoggingService.error("[ProjectService] AppStore API not available.", new Error("AppStoreMissing"), { functionName, projectId });
        return undefined;
    }
    const project = AppStore.getProjects().find(p => p.id === projectId);
    if (!project) {
        LoggingService.debug(`[ProjectService] Project with ID ${projectId} not found.`, { functionName, projectId });
    }
    return project ? { ...project } : undefined;
}

/**
 * Retrieves all projects.
 * @param {boolean} [includeNoProject=false] - Whether to include the "No Project" entry.
 * @returns {Array<object>} An array of project objects (copies).
 */
export function getAllProjects(includeNoProject = false) {
    const functionName = 'getAllProjects';
     if (!AppStore || typeof AppStore.getProjects !== 'function') {
        LoggingService.error("[ProjectService] AppStore API not available.", new Error("AppStoreMissing"), { functionName });
        return [];
    }
    const projectsFromStore = AppStore.getProjects();
    if (includeNoProject) {
        return projectsFromStore.sort((a,b) => a.id === 0 ? -1 : b.id === 0 ? 1 : a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    }
    return projectsFromStore.filter(p => p.id !== 0).sort((a,b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
}

// REMOVED: LoggingService.debug("projectService.js loaded as ES6 module.", { module: 'projectService' });
// console.log("projectService.js module parsed and functions defined."); // Optional