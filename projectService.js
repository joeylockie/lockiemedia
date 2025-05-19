// projectService.js
// This file contains services related to project data and operations.
// It relies on state from store.js (projects, tasks, saveProjects, saveTasks)
// and utility functions/services if needed.

/**
 * Adds a new project.
 * @param {string} projectName - The name for the new project.
 * @returns {object|null} The new project object or null if failed (e.g., name conflict).
 */
function addProject(projectName) {
    // Assumes projects array and saveProjects function are global from store.js
    // Assumes showMessage is global from ui_rendering.js (or passed as dependency later)
    if (typeof projects === 'undefined' || typeof saveProjects !== 'function' || typeof showMessage !== 'function') {
        console.error("[ProjectService] Core dependencies (projects, saveProjects, showMessage) not available for addProject.");
        return null;
    }

    const trimmedProjectName = projectName.trim();
    if (trimmedProjectName === '') {
        showMessage('Project name cannot be empty.', 'error');
        return null;
    }
    if (projects.some(p => p.name.toLowerCase() === trimmedProjectName.toLowerCase() && p.id !== 0)) {
        showMessage(`Project "${trimmedProjectName}" already exists.`, 'error');
        return null;
    }

    const newProject = {
        id: Date.now(), // Simple ID generation
        name: trimmedProjectName,
        creationDate: Date.now()
    };
    projects.push(newProject);
    saveProjects(); // This will publish 'projectsChanged' and 'uniqueProjectsChanged' via store.js
    console.log("[ProjectService] Project added:", newProject);
    return newProject;
}

/**
 * Updates the name of an existing project.
 * @param {number} projectId - The ID of the project to update.
 * @param {string} newName - The new name for the project.
 * @returns {object|null} The updated project object or null if not found/failed.
 */
function updateProjectName(projectId, newName) {
    if (typeof projects === 'undefined' || typeof saveProjects !== 'function' || typeof showMessage !== 'function') {
        console.error("[ProjectService] Core dependencies not available for updateProjectName.");
        return null;
    }

    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1 || projectId === 0) { // Cannot edit "No Project"
        showMessage('Project not found or "No Project" cannot be edited.', 'error');
        return null;
    }

    const trimmedNewName = newName.trim();
    if (trimmedNewName === '') {
        showMessage('Project name cannot be empty.', 'error');
        return null;
    }
    // Check if new name conflicts with another existing project (excluding itself)
    if (projects.some(p => p.name.toLowerCase() === trimmedNewName.toLowerCase() && p.id !== projectId && p.id !== 0)) {
        showMessage(`Another project with the name "${trimmedNewName}" already exists.`, 'error');
        return null;
    }

    projects[projectIndex].name = trimmedNewName;
    saveProjects(); // Publishes 'projectsChanged' and 'uniqueProjectsChanged'
    console.log(`[ProjectService] Project ${projectId} updated to name: "${trimmedNewName}".`);
    return projects[projectIndex];
}

/**
 * Deletes a project by its ID and reassigns its tasks.
 * @param {number} projectId - The ID of the project to delete.
 * @returns {boolean} True if deletion was successful, false otherwise.
 */
function deleteProjectById(projectId) {
    if (typeof projects === 'undefined' || typeof tasks === 'undefined' ||
        typeof saveProjects !== 'function' || typeof saveTasks !== 'function' ||
        typeof showMessage !== 'function') {
        console.error("[ProjectService] Core dependencies not available for deleteProjectById.");
        return false;
    }

    if (projectId === 0) { // Cannot delete "No Project"
        showMessage('"No Project" cannot be deleted.', 'error');
        return false;
    }

    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) {
        showMessage('Project not found for deletion.', 'error');
        return false;
    }

    const projectName = projects[projectIndex].name;
    // Confirmation should ideally be handled by the UI layer before calling this service method.
    // For now, we'll assume confirmation happened.

    projects.splice(projectIndex, 1);

    let tasksReassigned = false;
    tasks.forEach(task => {
        if (task.projectId === projectId) {
            task.projectId = 0; // Assign to "No Project"
            tasksReassigned = true;
        }
    });

    saveProjects(); // Publishes 'projectsChanged' and 'uniqueProjectsChanged'
    if (tasksReassigned) {
        saveTasks(); // Publishes 'tasksChanged'
    }

    console.log(`[ProjectService] Project "${projectName}" (ID: ${projectId}) deleted. Associated tasks reassigned.`);
    return true;
}

/**
 * Retrieves a project by its ID.
 * @param {number} projectId - The ID of the project.
 * @returns {object|undefined} The project object or undefined if not found.
 */
function getProjectById(projectId) {
    if (typeof projects === 'undefined') {
        console.error("[ProjectService] 'projects' array not available.");
        return undefined;
    }
    return projects.find(p => p.id === projectId);
}

/**
 * Retrieves all projects (excluding "No Project" by default if needed for UI lists).
 * @param {boolean} includeNoProject - Whether to include the "No Project" entry.
 * @returns {Array<object>} An array of project objects.
 */
function getAllProjects(includeNoProject = false) {
     if (typeof projects === 'undefined') {
        console.error("[ProjectService] 'projects' array not available.");
        return [];
    }
    if (includeNoProject) {
        return [...projects].sort((a,b) => a.id === 0 ? -1 : b.id === 0 ? 1 : a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    }
    return projects.filter(p => p.id !== 0).sort((a,b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
}


// Expose public interface
window.ProjectService = {
    addProject,
    updateProjectName,
    deleteProjectById,
    getProjectById,
    getAllProjects
};

// console.log("projectService.js loaded");
