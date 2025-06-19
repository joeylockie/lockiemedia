// modalEventHandlers.js
// Handles event listeners specifically for opening and closing modals,
// including the global Escape key listener for modals.

import LoggingService from './loggingService.js';
import {
    openAddModal, closeAddModal,
    closeViewEditModal,
    closeSettingsModal, openManageLabelsModal,
    openSettingsModal,
    closeManageLabelsModal,
    closeViewTaskDetailsModal,
    openDesktopNotificationsSettingsModal, closeDesktopNotificationsSettingsModal,
    openProfileModal, closeProfileModal
} from './modal_interactions.js';
import { ProjectsFeature } from './feature_projects.js';

// Helper function to attach listeners
function attachListener(elementId, eventType, handler, handlerName) {
    const element = document.getElementById(elementId);
    if (element) {
        element.addEventListener(eventType, handler);
    } else {
        LoggingService.warn(`[ModalEventHandlers] Element #${elementId} not found. Cannot attach ${eventType} listener for ${handlerName || handler.name || 'anonymous function'}.`, { functionName: 'attachListener', elementId, eventType });
    }
}

export function setupModalEventListeners() {
    const functionName = 'setupModalEventListeners';
    LoggingService.info('[ModalEventHandlers] Setting up modal event listeners.', { functionName });

    // Modal Openers
    attachListener('openAddModalButton', 'click', openAddModal, 'openAddModal');
    attachListener('settingsManageLabelsBtn', 'click', openManageLabelsModal, 'openManageLabelsModal');
    attachListener('openSettingsModalButton', 'click', openSettingsModal, 'openSettingsModal');
    attachListener('settingsManageNotificationsBtn', 'click', openDesktopNotificationsSettingsModal, 'openDesktopNotificationsSettingsModal');
    attachListener('settingsManageProfileBtn', 'click', openProfileModal, 'openProfileModal');

    // Special handling for Manage Projects Modal opener
    if (window.isFeatureEnabled('projectFeature')) { 
        const settingsManageProjectsBtnEl = document.getElementById('settingsManageProjectsBtn');
        if (settingsManageProjectsBtnEl && ProjectsFeature?.openManageProjectsModal) {
            settingsManageProjectsBtnEl.addEventListener('click', ProjectsFeature.openManageProjectsModal);
        }
    }

    // Modal Closers
    const modalCloserListeners = [
        { id: 'closeAddModalBtn', handler: closeAddModal, name: 'closeAddModal (primary)' },
        { id: 'cancelAddModalBtn', handler: closeAddModal, name: 'closeAddModal (cancel)' },
        { id: 'addTaskModal', handler: (event) => { if (event.target.id === 'addTaskModal') closeAddModal(); }, name: 'closeAddModal (backdrop)'},
        { id: 'closeViewEditModalBtn', handler: closeViewEditModal, name: 'closeViewEditModal (primary)' },
        { id: 'cancelViewEditModalBtn', handler: closeViewEditModal, name: 'closeViewEditModal (cancel)' },
        { id: 'viewEditTaskModal', handler: (event) => { if(event.target.id === 'viewEditTaskModal') closeViewEditModal(); }, name: 'closeViewEditModal (backdrop)'},
        { id: 'closeViewDetailsModalBtn', handler: closeViewTaskDetailsModal, name: 'closeViewTaskDetailsModal (primary)' },
        { id: 'closeViewDetailsSecondaryBtn', handler: closeViewTaskDetailsModal, name: 'closeViewTaskDetailsModal (secondary)' },
        { id: 'viewTaskDetailsModal', handler: (event) => { if(event.target.id === 'viewTaskDetailsModal') closeViewTaskDetailsModal(); }, name: 'closeViewTaskDetailsModal (backdrop)'},
        { id: 'closeSettingsModalBtn', handler: closeSettingsModal, name: 'closeSettingsModal (primary)' },
        { id: 'closeSettingsSecondaryBtn', handler: closeSettingsModal, name: 'closeSettingsModal (secondary)' },
        { id: 'settingsModal', handler: (event) => { if(event.target.id === 'settingsModal') closeSettingsModal(); }, name: 'closeSettingsModal (backdrop)'},
        { id: 'closeManageLabelsModalBtn', handler: closeManageLabelsModal, name: 'closeManageLabelsModal (primary)' },
        { id: 'closeManageLabelsSecondaryBtn', handler: closeManageLabelsModal, name: 'closeManageLabelsModal (secondary)' },
        { id: 'manageLabelsModal', handler: (event) => { if(event.target.id === 'manageLabelsModal') closeManageLabelsModal(); }, name: 'closeManageLabelsModal (backdrop)'},
        { id: 'closeProfileModalBtn', handler: closeProfileModal, name: 'closeProfileModal (primary)' },
        { id: 'closeProfileSecondaryBtn', handler: closeProfileModal, name: 'closeProfileModal (secondary)' },
        { id: 'profileModal', handler: (event) => { if (event.target.id === 'profileModal') closeProfileModal(); }, name: 'closeProfileModal (backdrop)' }
    ];
    modalCloserListeners.forEach(listener => attachListener(listener.id, 'click', listener.handler, listener.name));

    // Keydown listener for Escape to close modals
    document.addEventListener('keydown', (event) => {
        const keydownHandlerName = 'documentKeydownHandler (ModalEventHandlers)';
        if (event.key === 'Escape') {
            LoggingService.debug('[ModalEventHandlers] Escape key pressed, attempting to close modals.', { functionName: keydownHandlerName, key: event.key });
            const profileModalEl = document.getElementById('profileModal');
            const projModal = document.getElementById('manageProjectsModal');

            if (profileModalEl && !profileModalEl.classList.contains('hidden')) closeProfileModal();
            else if (document.getElementById('addTaskModal') && !document.getElementById('addTaskModal').classList.contains('hidden')) closeAddModal();
            else if (document.getElementById('viewEditTaskModal') && !document.getElementById('viewEditTaskModal').classList.contains('hidden')) closeViewEditModal();
            else if (document.getElementById('viewTaskDetailsModal') && !document.getElementById('viewTaskDetailsModal').classList.contains('hidden')) closeViewTaskDetailsModal();
            else if (document.getElementById('settingsModal') && !document.getElementById('settingsModal').classList.contains('hidden')) closeSettingsModal();
            else if (document.getElementById('manageLabelsModal') && !document.getElementById('manageLabelsModal').classList.contains('hidden')) closeManageLabelsModal();
            else if (projModal && !projModal.classList.contains('hidden') && window.AppFeatures?.ProjectsFeature?.closeManageProjectsModal) {
                 window.AppFeatures.ProjectsFeature.closeManageProjectsModal();
            } else if (projModal && !projModal.classList.contains('hidden')) { 
                const projDialog = document.getElementById('modalDialogManageProjects');
                if (projDialog) projDialog.classList.add('scale-95', 'opacity-0');
                setTimeout(() => { projModal.classList.add('hidden'); }, 200);
            }
        }
    });
    LoggingService.debug(`[ModalEventHandlers] Document keydown listener for modals attached.`, { functionName });

    LoggingService.info("[ModalEventHandlers] Modal event listeners setup process completed.", { functionName });
}

console.log("modalEventHandlers.js loaded.");