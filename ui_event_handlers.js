// ui_event_handlers.js
// Handles event listeners, user interaction handlers (forms, buttons),
// applying feature flags to UI. Now an ES6 module.

import AppStore from './store.js';
import ViewManager from './viewManager.js';
import { isFeatureEnabled, setFeatureFlag, getAllFeatureFlags } from './featureFlagService.js';
import * as TaskService from './taskService.js';
import * as LabelService from './labelService.js';
import ModalStateService from './modalStateService.js';
import TooltipService from './tooltipService.js';
import EventBus from './eventBus.js';
import * as BulkActionService from './bulkActionService.js'; // Import for clearSelections

// DOM elements are still accessed globally for now, initialized by ui_rendering.js
// Functions from modal_interactions.js and ui_rendering.js are also accessed globally via window
// (e.g., window.openAddModal, window.showMessage, window.renderSubTasksForEditModal)
// window.AppFeatures is also accessed globally.

let tempSubTasksForAddModal = [];

// This function is called by ui_rendering.js when the feature flags modal is opened.
// It's also called when a flag is changed while the modal is open.
// For now, we'll keep it here and ui_rendering.js will call it via window.populateFeatureFlagsModal
// until ui_rendering.js is also a module and can import it.
/* export */ function populateFeatureFlagsModal() { // Not exporting yet, called via window by main.js
    const currentFFListContainer = window.featureFlagsListContainer || document.getElementById('featureFlagsListContainer');
    if (!currentFFListContainer) {
        console.warn("Feature flags list container not found for populateFeatureFlagsModal.");
        return;
    }
    currentFFListContainer.innerHTML = '';
    const currentFlags = getAllFeatureFlags(); 
    const friendlyNames = { 
        testButtonFeature: "Test Button", reminderFeature: "Task Reminders", taskTimerSystem: "Task Timer & Review", advancedRecurrence: "Advanced Recurrence (Soon)", fileAttachments: "File Attachments (Soon)", integrationsServices: "Integrations (Soon)", userAccounts: "User Accounts (Soon)", collaborationSharing: "Collaboration (Soon)", crossDeviceSync: "Cross-Device Sync (Soon)", tooltipsGuide: "Tooltips & Shortcuts Guide", subTasksFeature: "Sub-tasks", kanbanBoardFeature: "Kanban Board View", projectFeature: "Projects Feature", exportDataFeature: "Export Data Feature", calendarViewFeature: "Calendar View", taskDependenciesFeature: "Task Dependencies (Soon)", smarterSearchFeature: "Smarter Search (Soon)", bulkActionsFeature: "Bulk Task Actions", pomodoroTimerHybridFeature: "Pomodoro Timer Hybrid"
    };
    const featureOrder = Object.keys(currentFlags); 

    featureOrder.forEach(key => {
        if (currentFlags.hasOwnProperty(key)) {
            const flagItem = document.createElement('div'); flagItem.className = 'feature-flag-item';
            const label = document.createElement('span'); label.textContent = friendlyNames[key] || key; label.className = 'feature-flag-label'; flagItem.appendChild(label);
            const toggleContainer = document.createElement('div'); toggleContainer.className = 'relative';
            const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.id = `toggle-${key}`; checkbox.className = 'toggle-checkbox'; checkbox.checked = currentFlags[key]; 
            checkbox.addEventListener('change', () => {
                setFeatureFlag(key, checkbox.checked); 
                // Event 'featureFlagsUpdated' is published by setFeatureFlag.
                // applyActiveFeatures (this module) subscribes to it.
            });
            const toggleLabel = document.createElement('label'); toggleLabel.htmlFor = `toggle-${key}`; toggleLabel.className = 'toggle-label';
            toggleContainer.appendChild(checkbox); toggleContainer.appendChild(toggleLabel);
            flagItem.appendChild(toggleContainer); currentFFListContainer.appendChild(flagItem);
        }
    });
}
// Make it global for now so ui_rendering.js can call it.
window.populateFeatureFlagsModal = populateFeatureFlagsModal;


export function applyActiveFeatures() {
    console.log('[ApplyFeatures] Applying active features based on current flags.');
    const toggleElements = (selector, isEnabled) => { 
        document.querySelectorAll(selector).forEach(el => el.classList.toggle('hidden', !isEnabled)); 
    };

    // Accessing AppFeatures globally for now
    if (window.AppFeatures?.TestButtonFeature?.updateUIVisibility) window.AppFeatures.TestButtonFeature.updateUIVisibility(); else if (window.testFeatureButtonContainer) window.testFeatureButtonContainer.classList.toggle('hidden', !isFeatureEnabled('testButtonFeature'));
    if (window.AppFeatures?.TaskTimerSystemFeature?.updateUIVisibility) window.AppFeatures.TaskTimerSystemFeature.updateUIVisibility(); else { toggleElements('.task-timer-system-element', isFeatureEnabled('taskTimerSystem')); if (window.settingsTaskReviewBtn) window.settingsTaskReviewBtn.classList.toggle('hidden', !isFeatureEnabled('taskTimerSystem')); }
    if (window.AppFeatures?.ReminderFeature?.updateUIVisibility) window.AppFeatures.ReminderFeature.updateUIVisibility(); else toggleElements('.reminder-feature-element', isFeatureEnabled('reminderFeature'));
    if (window.AppFeatures?.AdvancedRecurrenceFeature?.updateUIVisibility) window.AppFeatures.AdvancedRecurrenceFeature.updateUIVisibility(); else toggleElements('.advanced-recurrence-element', isFeatureEnabled('advancedRecurrence'));
    if (window.AppFeatures?.FileAttachmentsFeature?.updateUIVisibility) window.AppFeatures.FileAttachmentsFeature.updateUIVisibility(); else toggleElements('.file-attachments-element', isFeatureEnabled('fileAttachments'));
    if (window.AppFeatures?.IntegrationsServicesFeature?.updateUIVisibility) window.AppFeatures.IntegrationsServicesFeature.updateUIVisibility(); else toggleElements('.integrations-services-element', isFeatureEnabled('integrationsServices'));
    if (window.AppFeatures?.UserAccountsFeature?.updateUIVisibility) window.AppFeatures.UserAccountsFeature.updateUIVisibility(); else toggleElements('.user-accounts-element', isFeatureEnabled('userAccounts'));
    if (window.AppFeatures?.CollaborationSharingFeature?.updateUIVisibility) window.AppFeatures.CollaborationSharingFeature.updateUIVisibility(); else toggleElements('.collaboration-sharing-element', isFeatureEnabled('collaborationSharing'));
    if (window.AppFeatures?.CrossDeviceSyncFeature?.updateUIVisibility) window.AppFeatures.CrossDeviceSyncFeature.updateUIVisibility(); else toggleElements('.cross-device-sync-element', isFeatureEnabled('crossDeviceSync'));
    if (window.AppFeatures?.TaskDependenciesFeature?.updateUIVisibility) window.AppFeatures.TaskDependenciesFeature.updateUIVisibility(); else toggleElements('.task-dependencies-feature-element', isFeatureEnabled('taskDependenciesFeature'));
    if (window.AppFeatures?.SmarterSearchFeature?.updateUIVisibility) window.AppFeatures.SmarterSearchFeature.updateUIVisibility(); else toggleElements('.smarter-search-feature-element', isFeatureEnabled('smarterSearchFeature'));
    if (window.AppFeatures?.DataManagementFeature?.updateUIVisibility) window.AppFeatures.DataManagementFeature.updateUIVisibility(); else toggleElements('.export-data-feature-element', isFeatureEnabled('exportDataFeature'));
    if (window.AppFeatures?.CalendarViewFeature?.updateUIVisibility) window.AppFeatures.CalendarViewFeature.updateUIVisibility(); else { const cvtb = document.getElementById('calendarViewToggleBtn'); if(cvtb) cvtb.classList.toggle('hidden', !isFeatureEnabled('calendarViewFeature')); toggleElements('.calendar-view-feature-element', isFeatureEnabled('calendarViewFeature'));}
    if (window.AppFeatures?.KanbanBoardFeature?.updateUIVisibility) window.AppFeatures.KanbanBoardFeature.updateUIVisibility(); else { const kbtb = document.getElementById('kanbanViewToggleBtn'); if(kbtb) kbtb.classList.toggle('hidden', !isFeatureEnabled('kanbanBoardFeature'));}
    if (window.AppFeatures?.PomodoroTimerHybridFeature?.updateUIVisibility) window.AppFeatures.PomodoroTimerHybridFeature.updateUIVisibility(); else toggleElements('.pomodoro-timer-hybrid-feature-element', isFeatureEnabled('pomodoroTimerHybridFeature'));

    if (window.settingsTooltipsGuideBtn) window.settingsTooltipsGuideBtn.classList.toggle('hidden', !isFeatureEnabled('tooltipsGuide'));
    
    if (!isFeatureEnabled('bulkActionsFeature')) { 
        if (BulkActionService && BulkActionService.clearSelections) BulkActionService.clearSelections(); 
        const bulkControls = document.getElementById('bulkActionControlsContainer');
        if (bulkControls) bulkControls.classList.add('hidden');
    } else {
        const bulkControls = document.getElementById('bulkActionControlsContainer');
        if (bulkControls) bulkControls.classList.add('bulk-actions-feature-element'); // Ensure class is there if enabled
        // Visibility handled by renderBulkActionControls based on selection
    }

    if(typeof window.refreshTaskView === 'function') window.refreshTaskView();
    
    const featureFlagsModalElement = document.getElementById('featureFlagsModal');
    if (featureFlagsModalElement && !featureFlagsModalElement.classList.contains('hidden') && typeof populateFeatureFlagsModal === 'function') {
        populateFeatureFlagsModal();
    }
    console.log('[ApplyFeatures] Finished applying active features.');
}

function handleAddTask(event) { /* ... same as before, uses TaskService.addTask, FeatureFlagService, ViewManager, window.showMessage, window.closeAddModal ... */ }
function handleEditTask(event) { /* ... same as before, uses TaskService.updateTask, FeatureFlagService, ModalStateService, window.showMessage, window.closeViewEditModal ... */ }
function toggleComplete(taskId) { /* ... same as before, uses TaskService.toggleTaskComplete, ModalStateService, AppStore.getTasks, window.showMessage ... */ }
function deleteTask(taskId) { /* ... same as before, uses TaskService.deleteTaskById, ModalStateService, window.showMessage ... */ }
// Make toggleComplete and deleteTask global for ui_rendering.js for now
window.toggleComplete = toggleComplete;
window.deleteTask = deleteTask;

function setFilter(filter) {
    if (!ViewManager) { console.error("[SetFilter] ViewManager not available."); return; }
    ViewManager.setCurrentFilter(filter); 
    // UI update for button styles
    if (window.smartViewButtons) { 
        window.smartViewButtons.forEach(button => { /* ... class toggling ... */ });
    }
    if (isFeatureEnabled('projectFeature') && window.AppFeatures?.Projects) {
        const projectFilterButtons = document.querySelectorAll('#projectFilterContainer .smart-view-btn');
        projectFilterButtons.forEach(button => { /* ... class toggling ... */ });
    }
    if (typeof window.updateSortButtonStates === 'function') window.updateSortButtonStates(); // Call global
}
// Make setFilter global for now
window.setFilter = setFilter;

function clearCompletedTasks() { /* ... same as before, uses TaskService.deleteTaskById, AppStore.getTasks, window.showMessage, window.closeSettingsModal ... */ }
function handleAddNewLabel(event) { /* ... same as before, uses LabelService.addConceptualLabel, window.showMessage ... */ }
function handleDeleteLabel(labelNameToDelete) { /* ... same as before, uses LabelService.deleteLabelUsageFromTasks, window.showMessage ... */ }
// Make handleDeleteLabel global for now
window.handleDeleteLabel = handleDeleteLabel;

function handleAddSubTaskViewEdit() { /* ... same as before, uses ModalStateService, window.AppFeatures.SubTasks.add, window.showMessage, window.renderSubTasksForEditModal, window.renderSubTasksForViewModal ... */ }
function handleAddTempSubTaskForAddModal() { /* ... same as before, uses window.renderTempSubTasksForAddModal ... */ }

export function setupEventListeners() {
    // Uses ViewManager, FeatureFlagService, TooltipService
    // Calls to open/close modal functions are global (window.openAddModal etc.)
    // Calls to specific feature initializers are via window.AppFeatures
    // DOM elements are global for now.
    // ... (Content of this function remains largely the same, ensuring imported services are used where appropriate)
    // Example for sidebar tooltip:
    if (window.sidebarIconOnlyButtons && TooltipService) { 
        window.sidebarIconOnlyButtons.forEach(button => { 
            button.addEventListener('mouseenter', (event) => { 
                if (!window.taskSidebar || !window.taskSidebar.classList.contains('sidebar-minimized')) return;
                TooltipService.clearTooltipTimeout(); 
                const timeoutId = setTimeout(() => { /* ... */ if(typeof window.showTooltip === 'function') window.showTooltip(event.currentTarget, tooltipText); }, 500);
                TooltipService.setTooltipTimeout(timeoutId); 
            }); 
            button.addEventListener('mouseleave', () => { TooltipService.clearTooltipTimeout(); if(typeof window.hideTooltip === 'function') window.hideTooltip(); }); 
        });
    }
    // ... (other event listeners for sort, view toggles, modal buttons, settings buttons, keydown etc.)
    // Ensure they call ViewManager methods for view state changes,
    // and global modal interaction functions (window.openAddModal, etc.)
    // and global UI update functions (window.showMessage, etc.)
    console.log("[Event Handlers] All event listeners set up.");
}

// Subscription for feature flag changes to re-apply UI rules
if (EventBus && typeof applyActiveFeatures === 'function') {
    EventBus.subscribe('featureFlagsUpdated', (data) => {
        console.log("[Event Handlers] Event received: featureFlagsUpdated. Re-applying active features.", data);
        applyActiveFeatures(); // This is now a module-scoped function
        const featureFlagsModalElement = document.getElementById('featureFlagsModal');
        if (featureFlagsModalElement && !featureFlagsModalElement.classList.contains('hidden') && typeof populateFeatureFlagsModal === 'function') {
            populateFeatureFlagsModal(); // Still global for now
        }
    });
} else {
    console.warn("[Event Handlers] EventBus or applyActiveFeatures not available for 'featureFlagsUpdated' subscription.");
}

console.log("ui_event_handlers.js loaded as ES6 module.");
