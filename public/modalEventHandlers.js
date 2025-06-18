// modalEventHandlers.js
// Handles event listeners specifically for opening and closing modals,
// including the global Escape key listener for modals.

import LoggingService from './loggingService.js';
import {
    openAddModal, closeAddModal,
    openViewEditModal, closeViewEditModal,
    populateManageLabelsList, // Needed if a modal action triggers it directly
    closeSettingsModal, openManageLabelsModal,
    openSettingsModal, openTaskReviewModal,
    openTooltipsGuideModal, closeManageLabelsModal,
    closeTaskReviewModal, closeTooltipsGuideModal,
    closeViewTaskDetailsModal, openContactUsModal,
    closeContactUsModal, openAboutUsModal,
    closeAboutUsModal, openDataVersionHistoryModal,
    closeDataVersionHistoryModal,
    openDesktopNotificationsSettingsModal, closeDesktopNotificationsSettingsModal,
    openProfileModal, closeProfileModal
} from './modal_interactions.js';
// import { UserAccountsFeature } from './feature_user_accounts.js'; // REMOVED
import { ProjectsFeature } from './feature_projects.js'; // For closing manage projects modal
// import { isFeatureEnabled, getAllFeatureFlags, setFeatureFlag } from './featureFlagService.js'; // REMOVED

// Helper function to attach listeners (can be localized or imported if made generic)
function attachListener(elementId, eventType, handler, handlerName) {
    const element = document.getElementById(elementId);
    if (element) {
        element.addEventListener(eventType, handler);
        LoggingService.debug(`[ModalEventHandlers] Attached '${eventType}' listener to #${elementId} for ${handlerName || handler.name || 'anonymous function'}.`, { functionName: 'attachListener', elementId, eventType });
    } else {
        LoggingService.warn(`[ModalEventHandlers] Element #${elementId} not found. Cannot attach ${eventType} listener for ${handlerName || handler.name || 'anonymous function'}.`, { functionName: 'attachListener', elementId, eventType });
    }
}

// Feature Flags Modal specific close handler
function ffModalCloseHandler() {
    LoggingService.debug('[ModalEventHandlers] Closing Feature Flags Modal.', {functionName: 'ffModalCloseHandler'});
    const ffModal = document.getElementById('featureFlagsModal');
    const ffDialog = document.getElementById('modalDialogFeatureFlags');
    if (ffDialog) ffDialog.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { if (ffModal) ffModal.classList.add('hidden'); }, 200);
}

// Feature Flags Modal specific open handler (includes populating it)
function openFeatureFlagsModal() {
    const functionName = 'openFeatureFlagsModalHandler (ModalEventHandlers)';
    LoggingService.debug('[ModalEventHandlers] Open Feature Flags Modal button clicked.', {functionName});
    const ffModal = document.getElementById('featureFlagsModal');
    const ffDialog = document.getElementById('modalDialogFeatureFlags');
    const currentFFListContainer = document.getElementById('featureFlagsListContainer');

    if (ffModal && ffDialog && currentFFListContainer) {
        // Populate feature flags modal content
        currentFFListContainer.innerHTML = ''; // Clear previous content
        
        // Note: getAllFeatureFlags and setFeatureFlag would need to be moved from the non-existent
        // featureFlagService to main.js and exposed on the window object like isFeatureEnabled
        // For now, this part will not fully function. We are just fixing the 404 error.
        LoggingService.warn('[ModalEventHandlers] openFeatureFlagsModal is not fully functional without feature flag management service.', { functionName });
        currentFFListContainer.innerHTML = '<p class="text-slate-400">Feature flag management is not available in this version.</p>';


        ffModal.classList.remove('hidden');
        setTimeout(() => { ffDialog.classList.remove('scale-95', 'opacity-0'); ffDialog.classList.add('scale-100', 'opacity-100'); }, 10);
    } else {
        LoggingService.warn('[ModalEventHandlers] Feature flags modal elements not found for opening.', {functionName});
    }
}


export function setupModalEventListeners() {
    const functionName = 'setupModalEventListeners';
    LoggingService.info('[ModalEventHandlers] Setting up modal event listeners.', { functionName });

    // Modal Openers
    attachListener('openAddModalButton', 'click', openAddModal, 'openAddModal');
    attachListener('settingsManageLabelsBtn', 'click', openManageLabelsModal, 'openManageLabelsModal');
    attachListener('openSettingsModalButton', 'click', openSettingsModal, 'openSettingsModal');
    attachListener('settingsTaskReviewBtn', 'click', openTaskReviewModal, 'openTaskReviewModal');
    attachListener('settingsTooltipsGuideBtn', 'click', openTooltipsGuideModal, 'openTooltipsGuideModal');
    attachListener('settingsAboutUsBtn', 'click', openAboutUsModal, 'openAboutUsModal');
    attachListener('settingsVersionHistoryBtn', 'click', openDataVersionHistoryModal, 'openDataVersionHistoryModal');
    attachListener('settingsManageNotificationsBtn', 'click', openDesktopNotificationsSettingsModal, 'openDesktopNotificationsSettingsModal');
    attachListener('settingsManageProfileBtn', 'click', openProfileModal, 'openProfileModal');
    attachListener('openFeatureFlagsModalBtn', 'click', openFeatureFlagsModal, 'openFeatureFlagsModal'); // Use the combined open and populate

    // Special handling for Manage Projects Modal opener (it's part of ProjectsFeature)
    if (window.isFeatureEnabled('projectFeature')) { // MODIFIED to use window
        const settingsManageProjectsBtnEl = document.getElementById('settingsManageProjectsBtn');
        if (settingsManageProjectsBtnEl && ProjectsFeature?.openManageProjectsModal) {
            settingsManageProjectsBtnEl.addEventListener('click', ProjectsFeature.openManageProjectsModal);
            LoggingService.debug(`[ModalEventHandlers] Attached listener for Manage Projects modal opener.`, { functionName, elementId: 'settingsManageProjectsBtn' });
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
        { id: 'closeTooltipsGuideModalBtn', handler: closeTooltipsGuideModal, name: 'closeTooltipsGuideModal (primary)' },
        { id: 'closeTooltipsGuideSecondaryBtn', handler: closeTooltipsGuideModal, name: 'closeTooltipsGuideModal (secondary)' },
        { id: 'tooltipsGuideModal', handler: (event) => { if (event.target.id === 'tooltipsGuideModal') closeTooltipsGuideModal(); }, name: 'closeTooltipsGuideModal (backdrop)'},
        { id: 'closeTaskReviewModalBtn', handler: closeTaskReviewModal, name: 'closeTaskReviewModal (primary)' },
        { id: 'closeTaskReviewSecondaryBtn', handler: closeTaskReviewModal, name: 'closeTaskReviewModal (secondary)' },
        { id: 'taskReviewModal', handler: (event) => { if(event.target.id === 'taskReviewModal') closeTaskReviewModal(); }, name: 'closeTaskReviewModal (backdrop)'},
        { id: 'closeContactUsModalBtn', handler: closeContactUsModal, name: 'closeContactUsModal (primary)' },
        { id: 'closeContactUsSecondaryBtn', handler: closeContactUsModal, name: 'closeContactUsModal (secondary)' },
        { id: 'contactUsModal', handler: (event) => { if (event.target.id === 'contactUsModal') closeContactUsModal(); }, name: 'closeContactUsModal (backdrop)' },
        { id: 'closeAboutUsModalBtn', handler: closeAboutUsModal, name: 'closeAboutUsModal (primary)' },
        { id: 'closeAboutUsSecondaryBtn', handler: closeAboutUsModal, name: 'closeAboutUsModal (secondary)' },
        { id: 'aboutUsModal', handler: (event) => { if (event.target.id === 'aboutUsModal') closeAboutUsModal(); }, name: 'closeAboutUsModal (backdrop)' },
        { id: 'closeDataVersionHistoryModalBtn', handler: closeDataVersionHistoryModal, name: 'closeDataVersionHistoryModal (primary)' },
        { id: 'closeDataVersionHistorySecondaryBtn', handler: closeDataVersionHistoryModal, name: 'closeDataVersionHistoryModal (secondary)' },
        { id: 'dataVersionHistoryModal', handler: (event) => { if (event.target.id === 'dataVersionHistoryModal') closeDataVersionHistoryModal(); }, name: 'closeDataVersionHistoryModal (backdrop)' },
        { id: 'closeDesktopNotificationsSettingsModalBtn', handler: closeDesktopNotificationsSettingsModal, name: 'closeDesktopNotificationsSettingsModal (primary)'},
        { id: 'closeDesktopNotificationsSettingsSecondaryBtn', handler: closeDesktopNotificationsSettingsModal, name: 'closeDesktopNotificationsSettingsModal (secondary)'},
        { id: 'desktopNotificationsSettingsModal', handler: (event) => { if (event.target.id === 'desktopNotificationsSettingsModal') closeDesktopNotificationsSettingsModal(); }, name: 'closeDesktopNotificationsSettingsModal (backdrop)'},
        { id: 'closeProfileModalBtn', handler: closeProfileModal, name: 'closeProfileModal (primary)' },
        { id: 'closeProfileSecondaryBtn', handler: closeProfileModal, name: 'closeProfileModal (secondary)' },
        { id: 'profileModal', handler: (event) => { if (event.target.id === 'profileModal') closeProfileModal(); }, name: 'closeProfileModal (backdrop)' }
    ];
    modalCloserListeners.forEach(listener => attachListener(listener.id, 'click', listener.handler, listener.name));

    // Feature Flags Modal Closers
    attachListener('closeFeatureFlagsModalBtn', 'click', ffModalCloseHandler, 'ffModalCloseHandler (primary)');
    attachListener('closeFeatureFlagsSecondaryBtn', 'click', ffModalCloseHandler, 'ffModalCloseHandler (secondary)');
    attachListener('featureFlagsModal', 'click', (event) => { if(event.target.id === 'featureFlagsModal') ffModalCloseHandler(); }, 'ffModalCloseHandler (backdrop)');


    // Keydown listener for Escape to close modals
    document.addEventListener('keydown', (event) => {
        const keydownHandlerName = 'documentKeydownHandler (ModalEventHandlers)';
        if (event.key === 'Escape') {
            LoggingService.debug('[ModalEventHandlers] Escape key pressed, attempting to close modals.', { functionName: keydownHandlerName, key: event.key });
            const contactUsModalEl = document.getElementById('contactUsModal');
            const aboutUsModalEl = document.getElementById('aboutUsModal');
            const dataVersionHistoryModalEl = document.getElementById('dataVersionHistoryModal');
            const desktopNotificationsSettingsModalEl = document.getElementById('desktopNotificationsSettingsModal');
            const profileModalEl = document.getElementById('profileModal');
            const ffModal = document.getElementById('featureFlagsModal');
            const projModal = document.getElementById('manageProjectsModal');


            if (profileModalEl && !profileModalEl.classList.contains('hidden')) closeProfileModal();
            else if (document.getElementById('addTaskModal') && !document.getElementById('addTaskModal').classList.contains('hidden')) closeAddModal();
            else if (document.getElementById('viewEditTaskModal') && !document.getElementById('viewEditTaskModal').classList.contains('hidden')) closeViewEditModal();
            else if (document.getElementById('viewTaskDetailsModal') && !document.getElementById('viewTaskDetailsModal').classList.contains('hidden')) closeViewTaskDetailsModal();
            else if (desktopNotificationsSettingsModalEl && !desktopNotificationsSettingsModalEl.classList.contains('hidden')) closeDesktopNotificationsSettingsModal();
            else if (document.getElementById('settingsModal') && !document.getElementById('settingsModal').classList.contains('hidden')) closeSettingsModal();
            else if (document.getElementById('manageLabelsModal') && !document.getElementById('manageLabelsModal').classList.contains('hidden')) closeManageLabelsModal();
            else if (document.getElementById('taskReviewModal') && !document.getElementById('taskReviewModal').classList.contains('hidden')) closeTaskReviewModal();
            else if (document.getElementById('tooltipsGuideModal') && !document.getElementById('tooltipsGuideModal').classList.contains('hidden')) closeTooltipsGuideModal();
            else if (contactUsModalEl && !contactUsModalEl.classList.contains('hidden')) closeContactUsModal();
            else if (aboutUsModalEl && !aboutUsModalEl.classList.contains('hidden')) closeAboutUsModal();
            else if (dataVersionHistoryModalEl && !dataVersionHistoryModalEl.classList.contains('hidden')) closeDataVersionHistoryModal();
            else if (ffModal && !ffModal.classList.contains('hidden')) {
                ffModalCloseHandler();
            }
            else if (projModal && !projModal.classList.contains('hidden') && window.AppFeatures?.ProjectsFeature?.closeManageProjectsModal) {
                 window.AppFeatures.ProjectsFeature.closeManageProjectsModal();
            } else if (projModal && !projModal.classList.contains('hidden')) { // Fallback if feature module way fails
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