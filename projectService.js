// projectService.js
// This file contains services related to project data and operations using IndexedDB.

import AppStore from './store.js';
import EventBus from './eventBus.js';
import LoggingService from './loggingService.js';
import db from './database.js'; // Import the database connection

/**
 * Adds a new project to the database.
 * @param {string} projectName - The name for the new project.
 * @returns {Promise<object|null>} The new project object or null if failed.
 */
export async function addProject(projectName) {
    const functionName = 'addProject';
    const trimmedProjectName = projectName.trim();

    if (trimmedProjectName === '') {
        EventBus.publish('displayUserMessage', { text: 'Project name cannot be empty.', type: 'error' });
        return null;
    }

    // Check for duplicates directly in the database (case-insensitive)
    const existing = await db.projects.where('name').equalsIgnoreCase(trimmedProjectName).first();
    if (existing) {
        EventBus.publish('displayUserMessage', { text: `Project "${trimmedProjectName}" already exists.`, type: 'error' });
        return null;
    }

    const newProject = {
        name: trimmedProjectName,
        creationDate: Date.now()
    };

    try {
        const newId = await db.projects.add(newProject);
        const allProjects = await db.projects.toArray();
        await AppStore.setProjects(allProjects); // Refresh store
        LoggingService.info(`[ProjectService] Project added: "${newProject.name}"`, { functionName });
        return { ...newProject, id: newId };
    } catch (error) {
        LoggingService.error('[ProjectService] Error adding project.', error, { functionName });
        EventBus.publish('displayUserMessage', { text: 'Error adding project.', type: 'error' });
        return null;
    }
}

/**
 * Updates the name of an existing project in the database.
 * @param {number} projectId - The ID of the project to update.
 * @param {string} newName - The new name for the project.
 */
export async function updateProjectName(projectId, newName) {
    const functionName = 'updateProjectName';
    const trimmedNewName = newName.trim();

    if (projectId === 0 || trimmedNewName === '') {
        EventBus.publish('displayUserMessage', { text: 'Project name cannot be empty and "No Project" cannot be edited.', type: 'error' });
        return;
    }

    // Check for duplicates
    const existing = await db.projects.where('name').equalsIgnoreCase(trimmedNewName).first();
    if (existing && existing.id !== projectId) {
        EventBus.publish('displayUserMessage', { text: `Another project with the name "${trimmedNewName}" already exists.`, type: 'error' });
        return;
    }

    try {
        await db.projects.update(projectId, { name: trimmedNewName });
        const allProjects = await db.projects.toArray();
        await AppStore.setProjects(allProjects);
        LoggingService.info(`[ProjectService] Project ${projectId} updated.`, { functionName });
    } catch (error) {
        LoggingService.error(`[ProjectService] Error updating project ${projectId}.`, error, { functionName });
    }
}

/**
 * Deletes a project and reassigns its tasks to "No Project" in a transaction.
 * @param {number} projectId - The ID of the project to delete.
 */
export async function deleteProjectById(projectId) {
    const functionName = 'deleteProjectById';
    if (projectId === 0) {
        EventBus.publish('displayUserMessage', { text: '"No Project" cannot be deleted.', type: 'error' });
        return;
    }

    try {
        // Use a transaction to ensure both operations succeed or fail together
        await db.transaction('rw', db.projects, db.tasks, async () => {
            // 1. Delete the project
            await db.projects.delete(projectId);

            // 2. Find all tasks with this project ID and update them
            const tasksToUpdate = await db.tasks.where('projectId').equals(projectId).primaryKeys();
            if (tasksToUpdate.length > 0) {
                await db.tasks.bulkUpdate(tasksToUpdate.map(id => ({ key: id, changes: { projectId: 0 } })));
            }
        });

        // Refresh the store with updated data
        const allProjects = await db.projects.toArray();
        const allTasks = await db.tasks.toArray();
        await AppStore.setProjects(allProjects);
        await AppStore.setTasks(allTasks);

        LoggingService.info(`[ProjectService] Project ${projectId} deleted and tasks reassigned.`, { functionName });
    } catch (error) {
        LoggingService.error(`[ProjectService] Error deleting project ${projectId}.`, error, { functionName });
    }
}

/**
 * Retrieves a project by its ID from the AppStore cache.
 * @param {number} projectId - The ID of the project.
 * @returns {object|undefined} The project object or undefined if not found.
 */
export function getProjectById(projectId) {
    if (!AppStore) return undefined;
    const project = AppStore.getProjects().find(p => p.id === projectId);
    return project ? { ...project } : undefined;
}

/**
 * Retrieves all projects from the AppStore cache.
 * @param {boolean} [includeNoProject=false] - Whether to include the "No Project" entry.
 * @returns {Array<object>} An array of project objects.
 */
export function getAllProjects(includeNoProject = false) {
    if (!AppStore) return [];
    const projectsFromStore = AppStore.getProjects();
    const sortedProjects = projectsFromStore.sort((a,b) => a.id === 0 ? -1 : b.id === 0 ? 1 : a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    if (includeNoProject) {
        return sortedProjects;
    }
    return sortedProjects.filter(p => p.id !== 0);
}