// projectService.js
// This file contains services related to project data and operations.
// It relies on AppStore for state management and ui_rendering.js for showMessage.

(function() {

    /**
     * Adds a new project.
     * @param {string} projectName - The name for the new project.
     * @returns {object|null} The new project object or null if failed.
     */
    function addProject(projectName) {
        if (typeof AppStore === 'undefined' || typeof AppStore.getProjects !== 'function' || typeof AppStore.setProjects !== 'function' || typeof showMessage !== 'function') {
            console.error("[ProjectService] Core dependencies (AppStore API, showMessage) not available for addProject.");
            return null;
        }

        const currentProjects = AppStore.getProjects();
        const trimmedProjectName = projectName.trim();

        if (trimmedProjectName === '') {
            showMessage('Project name cannot be empty.', 'error');
            return null;
        }
        if (currentProjects.some(p => p.name.toLowerCase() === trimmedProjectName.toLowerCase() && p.id !== 0)) {
            showMessage(`Project "${trimmedProjectName}" already exists.`, 'error');
            return null;
        }

        const newProject = {
            id: Date.now(),
            name: trimmedProjectName,
            creationDate: Date.now()
        };
        
        const updatedProjects = [...currentProjects, newProject];
        AppStore.setProjects(updatedProjects); // This will save and publish events via AppStore
        
        console.log("[ProjectService] Project added:", newProject);
        return newProject; // Return a copy
    }

    /**
     * Updates the name of an existing project.
     * @param {number} projectId - The ID of the project to update.
     * @param {string} newName - The new name for the project.
     * @returns {object|null} The updated project object or null if not found/failed.
     */
    function updateProjectName(projectId, newName) {
        if (typeof AppStore === 'undefined' || typeof AppStore.getProjects !== 'function' || typeof AppStore.setProjects !== 'function' || typeof showMessage !== 'function') {
            console.error("[ProjectService] Core dependencies not available for updateProjectName.");
            return null;
        }

        let currentProjects = AppStore.getProjects();
        const projectIndex = currentProjects.findIndex(p => p.id === projectId);

        if (projectIndex === -1 || projectId === 0) {
            showMessage('Project not found or "No Project" cannot be edited.', 'error');
            return null;
        }

        const trimmedNewName = newName.trim();
        if (trimmedNewName === '') {
            showMessage('Project name cannot be empty.', 'error');
            return null;
        }
        if (currentProjects.some(p => p.name.toLowerCase() === trimmedNewName.toLowerCase() && p.id !== projectId && p.id !== 0)) {
            showMessage(`Another project with the name "${trimmedNewName}" already exists.`, 'error');
            return null;
        }

        currentProjects[projectIndex].name = trimmedNewName;
        AppStore.setProjects(currentProjects); // This will save and publish events
        
        console.log(`[ProjectService] Project ${projectId} updated to name: "${trimmedNewName}".`);
        return { ...currentProjects[projectIndex] }; // Return a copy
    }

    /**
     * Deletes a project by its ID and reassigns its tasks to "No Project".
     * @param {number} projectId - The ID of the project to delete.
     * @returns {boolean} True if deletion was successful, false otherwise.
     */
    function deleteProjectById(projectId) {
        if (typeof AppStore === 'undefined' || typeof AppStore.getProjects !== 'function' || typeof AppStore.setProjects !== 'function' ||
            typeof AppStore.getTasks !== 'function' || typeof AppStore.setTasks !== 'function' || typeof showMessage !== 'function') {
            console.error("[ProjectService] Core dependencies not available for deleteProjectById.");
            return false;
        }

        if (projectId === 0) {
            showMessage('"No Project" cannot be deleted.', 'error');
            return false;
        }

        let currentProjects = AppStore.getProjects();
        const projectIndex = currentProjects.findIndex(p => p.id === projectId);

        if (projectIndex === -1) {
            showMessage('Project not found for deletion.', 'error');
            return false;
        }

        const projectName = currentProjects[projectIndex].name;
        // Confirmation should be handled in the UI layer (e.g., feature_projects.js) before calling this.

        const updatedProjects = currentProjects.filter(p => p.id !== projectId);
        AppStore.setProjects(updatedProjects); // Save and publish project changes

        let currentTasks = AppStore.getTasks();
        let tasksModified = false;
        const updatedTasks = currentTasks.map(task => {
            if (task.projectId === projectId) {
                tasksModified = true;
                return { ...task, projectId: 0 }; // Assign to "No Project"
            }
            return task;
        });

        if (tasksModified) {
            AppStore.setTasks(updatedTasks); // Save and publish task changes
        }

        console.log(`[ProjectService] Project "${projectName}" (ID: ${projectId}) deleted. Associated tasks reassigned.`);
        return true;
    }

    /**
     * Retrieves a project by its ID.
     * @param {number} projectId - The ID of the project.
     * @returns {object|undefined} The project object (a copy) or undefined if not found.
     */
    function getProjectById(projectId) {
        if (typeof AppStore === 'undefined' || typeof AppStore.getProjects !== 'function') {
            console.error("[ProjectService] AppStore API not available for getProjectById.");
            return undefined;
        }
        const project = AppStore.getProjects().find(p => p.id === projectId);
        return project ? { ...project } : undefined; // Return a copy
    }

    /**
     * Retrieves all projects.
     * @param {boolean} [includeNoProject=false] - Whether to include the "No Project" entry.
     * @returns {Array<object>} An array of project objects (copies).
     */
    function getAllProjects(includeNoProject = false) {
        if (typeof AppStore === 'undefined' || typeof AppStore.getProjects !== 'function') {
            console.error("[ProjectService] AppStore API not available for getAllProjects.");
            return [];
        }
        const projectsFromStore = AppStore.getProjects(); // This is already a deep copy from AppStore
        if (includeNoProject) {
            return projectsFromStore.sort((a,b) => a.id === 0 ? -1 : b.id === 0 ? 1 : a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
        }
        return projectsFromStore.filter(p => p.id !== 0).sort((a,b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    }

    // Expose public interface
    window.ProjectService = {
        addProject,
        updateProjectName,
        deleteProjectById,
        getProjectById,
        getAllProjects
    };

    // console.log("projectService.js loaded, now using AppStore API.");
})();
