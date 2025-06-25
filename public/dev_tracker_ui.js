// public/dev_tracker_ui.js
// Manages all UI rendering and event handling for the Dev Tracker.

import AppStore from './store.js';
import EventBus from './eventBus.js';
import LoggingService from './loggingService.js';
import * as DevTrackerService from './dev_tracker_service.js';

// --- Internal State ---
let _activeEpicId = 'all_issues'; // Default to "All Issues"
let _activeSearchTerm = '';

// --- DOM Element References ---
let epicsListEl, ticketsListEl, newEpicBtn, newTicketBtn, settingsBtn, ticketSearchInput, allIssuesFilterBtn;
let currentEpicTitleEl, currentEpicDescriptionEl;
// Modals
let epicModalEl, ticketModalEl, settingsModalEl, ticketDetailModal, epicDetailModal;
// Epic Create/Edit
let epicFormEl, epicIdInput, epicKeyInput, epicTitleInput, epicStatusSelect, epicPrioritySelect, epicDescriptionInput, cancelEpicBtn;
// Ticket Create/Edit
let ticketFormEl, ticketIdInput, ticketEpicIdInput, ticketTitleInput, ticketStatusSelect, ticketPrioritySelect,
    ticketTypeSelect, ticketComponentSelect, ticketDescriptionInput, cancelTicketBtn;
// Settings
let closeSettingsBtn, settingsNav, settingsContentTitle, optionsList, addOptionForm;
// Ticket Detail
let closeTicketDetailBtn, ticketDetailKey, ticketDetailTitle, ticketDetailStatus, ticketDetailPriority, ticketDetailType, ticketDetailComponent, ticketDetailDescription;
// Epic Detail
let closeEpicDetailBtn, epicDetailKey, epicDetailTitle, epicDetailStatus, epicDetailPriority, epicDetailDescription;


/**
 * Caches all necessary DOM elements for the feature.
 */
function _getDOMElements() {
    epicsListEl = document.getElementById('epicsList');
    ticketsListEl = document.getElementById('ticketsList');
    newEpicBtn = document.getElementById('newEpicBtn');
    newTicketBtn = document.getElementById('newTicketBtn');
    settingsBtn = document.getElementById('settingsBtn');
    currentEpicTitleEl = document.getElementById('currentEpicTitle');
    currentEpicDescriptionEl = document.getElementById('currentEpicDescription');
    ticketSearchInput = document.getElementById('ticketSearchInput');
    allIssuesFilterBtn = document.getElementById('allIssuesFilter');

    // Modals
    epicModalEl = document.getElementById('epicModal');
    ticketModalEl = document.getElementById('ticketModal');
    settingsModalEl = document.getElementById('settingsModal');
    ticketDetailModal = document.getElementById('ticketDetailModal');
    epicDetailModal = document.getElementById('epicDetailModal');

    // Epic Create/Edit
    epicFormEl = document.getElementById('epicForm');
    epicIdInput = document.getElementById('epicId');
    epicKeyInput = document.getElementById('epicKey');
    epicTitleInput = document.getElementById('epicTitle');
    epicStatusSelect = document.getElementById('epicStatus');
    epicPrioritySelect = document.getElementById('epicPriority');
    epicDescriptionInput = document.getElementById('epicDescription');
    cancelEpicBtn = document.getElementById('cancelEpicBtn');

    // Ticket Create/Edit
    ticketFormEl = document.getElementById('ticketForm');
    ticketIdInput = document.getElementById('ticketId');
    ticketEpicIdInput = document.getElementById('ticketEpicId');
    ticketTitleInput = document.getElementById('ticketTitle');
    ticketStatusSelect = document.getElementById('ticketStatus');
    ticketPrioritySelect = document.getElementById('ticketPriority');
    ticketTypeSelect = document.getElementById('ticketType');
    ticketComponentSelect = document.getElementById('ticketComponent');
    ticketDescriptionInput = document.getElementById('ticketDescription');
    cancelTicketBtn = document.getElementById('cancelTicketBtn');

    // Settings
    closeSettingsBtn = document.getElementById('closeSettingsBtn');
    settingsNav = document.getElementById('settingsNav');
    settingsContentTitle = document.getElementById('settingsContentTitle');
    optionsList = document.getElementById('optionsList');
    addOptionForm = document.getElementById('addOptionForm');

    // Ticket Detail
    closeTicketDetailBtn = document.getElementById('closeTicketDetailBtn');
    ticketDetailKey = document.getElementById('ticketDetailKey');
    ticketDetailTitle = document.getElementById('ticketDetailTitle');
    ticketDetailStatus = document.getElementById('ticketDetailStatus');
    ticketDetailPriority = document.getElementById('ticketDetailPriority');
    ticketDetailType = document.getElementById('ticketDetailType');
    ticketDetailComponent = document.getElementById('ticketDetailComponent');
    ticketDetailDescription = document.getElementById('ticketDetailDescription');
    
    // Epic Detail
    closeEpicDetailBtn = document.getElementById('closeEpicDetailBtn');
    epicDetailKey = document.getElementById('epicDetailKey');
    epicDetailTitle = document.getElementById('epicDetailTitle');
    epicDetailStatus = document.getElementById('epicDetailStatus');
    epicDetailPriority = document.getElementById('epicDetailPriority');
    epicDetailDescription = document.getElementById('epicDetailDescription');
}

// --- Rendering Functions ---

function renderAll() {
    renderEpicsList();
    renderTicketsList();
    populateAllDropdowns();
}

function renderEpicsList() {
    if (!epicsListEl) return;
    const epics = AppStore.getDevEpics().sort((a, b) => a.title.localeCompare(b.title));
    epicsListEl.innerHTML = '';
    
    allIssuesFilterBtn.classList.toggle('bg-purple-600/30', _activeEpicId === 'all_issues');

    epics.forEach(epic => {
        const epicDiv = document.createElement('div');
        const isActive = epic.id === _activeEpicId;
        epicDiv.className = `p-3 rounded-lg cursor-pointer group relative hover:bg-slate-700/70 ${isActive ? 'bg-purple-600/30 ring-1 ring-purple-500' : 'bg-slate-700/30'}`;
        
        const mainContent = document.createElement('div');
        mainContent.onclick = () => {
            _activeEpicId = epic.id;
            renderAll();
        };

        mainContent.innerHTML = `
            <div class="flex justify-between items-center">
                <h4 class="font-semibold text-slate-100 truncate pr-10">${epic.title}</h4>
                <span class="text-xs font-mono px-2 py-0.5 rounded-full ${getPriorityBadgeClass(epic.priority)}">${epic.priority}</span>
            </div>
            <p class="text-xs text-slate-400 mt-1">${epic.status}</p>
        `;
        
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity';
        controlsDiv.innerHTML = `
            <button data-epic-id="${epic.id}" class="view-epic-btn text-slate-400 hover:text-green-400 text-xs"><i class="fas fa-eye"></i></button>
            <button data-epic-id="${epic.id}" class="edit-epic-btn text-slate-400 hover:text-sky-400 text-xs"><i class="fas fa-pencil-alt"></i></button>
            <button data-epic-id="${epic.id}" class="delete-epic-btn text-slate-400 hover:text-red-500 text-xs"><i class="fas fa-trash-alt"></i></button>
        `;

        epicDiv.appendChild(mainContent);
        epicDiv.appendChild(controlsDiv);
        epicsListEl.appendChild(epicDiv);
    });

    epicsListEl.querySelectorAll('.view-epic-btn').forEach(btn => btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEpicDetailModal(Number(e.currentTarget.dataset.epicId));
    }));
    epicsListEl.querySelectorAll('.edit-epic-btn').forEach(btn => btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEpicModal(Number(e.currentTarget.dataset.epicId));
    }));
    epicsListEl.querySelectorAll('.delete-epic-btn').forEach(btn => btn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleDeleteEpic(Number(e.currentTarget.dataset.epicId));
    }));
}

function renderTicketsList() {
    if (!ticketsListEl) return;
    ticketsListEl.innerHTML = '';
    
    let allTickets = AppStore.getDevTickets();
    let filteredTickets = [];

    if (_activeEpicId === 'all_issues') {
        currentEpicTitleEl.textContent = 'All Issues';
        currentEpicDescriptionEl.textContent = `Showing all tickets across all epics.`;
        newTicketBtn.disabled = true; // Can't add a ticket without an epic context
        filteredTickets = allTickets;
    } else if (_activeEpicId) {
        const activeEpic = AppStore.getDevEpics().find(e => e.id === _activeEpicId);
        if (!activeEpic) {
            _activeEpicId = 'all_issues';
            renderAll();
            return;
        }
        currentEpicTitleEl.textContent = activeEpic.title;
        currentEpicDescriptionEl.textContent = activeEpic.description || 'No description for this epic.';
        newTicketBtn.disabled = false;
        filteredTickets = allTickets.filter(t => t.epicId === _activeEpicId);
    } else {
         currentEpicTitleEl.textContent = 'Select an Epic';
        currentEpicDescriptionEl.textContent = 'Choose an epic from the left to view its tickets.';
        newTicketBtn.disabled = true;
        ticketsListEl.innerHTML = '<p class="text-center text-slate-500 pt-10">No epic selected.</p>';
        return;
    }

    // Apply search filter
    if (_activeSearchTerm) {
        filteredTickets = filteredTickets.filter(t => t.title.toLowerCase().includes(_activeSearchTerm));
    }
    
    filteredTickets.sort((a, b) => b.createdAt - a.createdAt);


    if (filteredTickets.length === 0) {
        ticketsListEl.innerHTML = `<p class="text-center text-slate-500 pt-10">${_activeSearchTerm ? 'No tickets match your search.' : 'This epic has no tickets.'}</p>`;
        return;
    }

    filteredTickets.forEach(ticket => {
        const ticketDiv = document.createElement('div');
        ticketDiv.className = 'bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-sky-500 transition-colors group cursor-pointer';
        ticketDiv.onclick = () => openTicketDetailModal(ticket.id);
        ticketDiv.innerHTML = `
            <div class="flex justify-between items-start">
                <p class="font-semibold text-slate-100"><span class="font-normal text-slate-400">${ticket.fullKey}</span> ${ticket.title}</p>
                <div class="flex items-center gap-2 flex-shrink-0 ml-4">
                    <button data-ticket-id="${ticket.id}" class="edit-ticket-btn opacity-0 group-hover:opacity-100 text-slate-400 hover:text-sky-400 text-sm"><i class="fas fa-pencil-alt"></i></button>
                    <button data-ticket-id="${ticket.id}" class="delete-ticket-btn opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 text-sm"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
            <div class="mt-3 pt-3 border-t border-slate-700 flex justify-between items-center text-xs">
                <div class="flex items-center gap-3 flex-wrap">
                    <span class="font-mono px-2 py-0.5 rounded-full ${getStatusBadgeClass(ticket.status)}">${ticket.status}</span>
                    <span class="font-mono px-2 py-0.5 rounded-full ${getPriorityBadgeClass(ticket.priority)}">${ticket.priority}</span>
                    <span class="font-mono px-2 py-0.5 rounded-full ${getTypeBadgeClass(ticket.type)}">${ticket.type}</span>
                    ${ticket.component ? `<span class="font-mono px-2 py-0.5 rounded-full ${getComponentBadgeClass(ticket.component)}">${ticket.component}</span>` : ''}
                </div>
            </div>
        `;
        ticketsListEl.appendChild(ticketDiv);
    });

    ticketsListEl.querySelectorAll('.edit-ticket-btn').forEach(btn => btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openTicketModal(Number(e.currentTarget.dataset.ticketId));
    }));
    ticketsListEl.querySelectorAll('.delete-ticket-btn').forEach(btn => btn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleDeleteTicket(Number(e.currentTarget.dataset.ticketId));
    }));
}


// --- Badge Coloring Helper Functions ---
function getStatusBadgeClass(status) {
    // ... (same as before)
}
function getPriorityBadgeClass(priority) {
    // ... (same as before)
}
function getTypeBadgeClass(type) {
    // ... (same as before)
}
function getComponentBadgeClass(component) {
    // ... (same as before)
}


// --- Modal & Settings Functions ---

function openEpicModal(epicId = null) {
    epicFormEl.reset();
    populateAllDropdowns(); // Populate epic dropdowns too
    if (epicId) {
        const epic = AppStore.getDevEpics().find(e => e.id === epicId);
        if (!epic) return;
        epicModalTitleEl.textContent = 'Edit Epic';
        epicIdInput.value = epic.id;
        epicKeyInput.value = epic.key;
        epicKeyInput.disabled = true; // Don't allow key to be edited
        epicTitleInput.value = epic.title;
        epicStatusSelect.value = epic.status;
        epicPrioritySelect.value = epic.priority;
        epicDescriptionInput.value = epic.description;
    } else {
        epicModalTitleEl.textContent = 'Create New Epic';
        epicIdInput.value = '';
        epicKeyInput.disabled = false;
    }
    epicModalEl.classList.remove('hidden');
}
function closeEpicModal() { epicModalEl.classList.add('hidden'); }

function openTicketModal(ticketId = null) {
    // ... (same as before)
}
function closeTicketModal() { ticketModalEl.classList.add('hidden'); }

function openSettingsModal() {
    // ... (same as before)
}
function closeSettingsModal() { settingsModalEl.classList.add('hidden'); }

function openTicketDetailModal(ticketId) {
    const ticket = AppStore.getDevTickets().find(t => t.id === ticketId);
    if (!ticket) return;

    ticketDetailKey.textContent = ticket.fullKey;
    ticketDetailTitle.textContent = ticket.title;
    ticketDetailStatus.textContent = ticket.status;
    ticketDetailPriority.textContent = ticket.priority;
    ticketDetailType.textContent = ticket.type;
    ticketDetailComponent.textContent = ticket.component || 'N/A';
    ticketDetailDescription.textContent = ticket.description || 'No description provided.';
    
    ticketDetailModal.classList.remove('hidden');
}
function closeTicketDetailModal() { ticketDetailModal.classList.add('hidden'); }

function openEpicDetailModal(epicId) {
    const epic = AppStore.getDevEpics().find(e => e.id === epicId);
    if (!epic) return;

    epicDetailKey.textContent = epic.key;
    epicDetailTitle.textContent = epic.title;
    epicDetailStatus.textContent = epic.status;
    epicDetailPriority.textContent = epic.priority;
    epicDetailDescription.textContent = epic.description || 'No description provided.';

    epicDetailModal.classList.remove('hidden');
}
function closeEpicDetailModal() { epicDetailModal.classList.add('hidden'); }


// --- Settings Management ---
// ... (All settings functions remain the same)


// --- Dropdown Population ---
function populateAllDropdowns() {
    const options = getOptions();
    // Epic Modals
    populateDropdown(epicStatusSelect, ['To Do', 'In Progress', 'Done']);
    populateDropdown(epicPrioritySelect, options.priorities);
    // Ticket Modals
    populateDropdown(ticketStatusSelect, options.statuses);
    populateDropdown(ticketPrioritySelect, options.priorities);
    populateDropdown(ticketTypeSelect, options.types);
    populateDropdown(ticketComponentSelect, options.components);
}


// --- Event Handlers ---
async function handleEpicFormSubmit(e) {
    e.preventDefault();
    const epicData = {
        key: epicKeyInput.value,
        title: epicTitleInput.value,
        status: epicStatusSelect.value,
        priority: epicPrioritySelect.value,
        description: epicDescriptionInput.value
    };
    const id = Number(epicIdInput.value);
    let result;
    if (id) {
        result = await DevTrackerService.updateEpic(id, epicData);
    } else {
        result = await DevTrackerService.addEpic(epicData);
    }
    if (result) { // Only close if service call was successful (not duplicate key)
        closeEpicModal();
    }
}

// ... (handleTicketFormSubmit, handleDeleteEpic, handleDeleteTicket remain the same)


function _setupEventListeners() {
    // Main buttons
    newEpicBtn.addEventListener('click', () => openEpicModal());
    newTicketBtn.addEventListener('click', () => openTicketModal());
    settingsBtn.addEventListener('click', openSettingsModal);
    allIssuesFilterBtn.addEventListener('click', () => {
        _activeEpicId = 'all_issues';
        renderAll();
    });

    // Search
    ticketSearchInput.addEventListener('input', (e) => {
        _activeSearchTerm = e.target.value.toLowerCase();
        renderTicketsList();
    });
    
    // Modals
    cancelEpicBtn.addEventListener('click', closeEpicModal);
    epicFormEl.addEventListener('submit', handleEpicFormSubmit);
    cancelTicketBtn.addEventListener('click', closeTicketModal);
    ticketFormEl.addEventListener('submit', handleTicketFormSubmit);
    closeSettingsBtn.addEventListener('click', closeSettingsModal);
    closeTicketDetailBtn.addEventListener('click', closeTicketDetailModal);
    closeEpicDetailBtn.addEventListener('click', closeEpicDetailModal);

    // Settings
    settingsNav.addEventListener('click', (e) => {
        if (e.target.matches('.settings-nav-item')) {
            setActiveSettingsCategory(e.target.dataset.type);
        }
    });
    addOptionForm.addEventListener('submit', handleAddOption);
    optionsList.addEventListener('click', handleDeleteOption);


    // Event Bus Subscriptions
    EventBus.subscribe('devEpicsChanged', renderAll);
    EventBus.subscribe('devTicketsChanged', renderTicketsList);
    EventBus.subscribe('userPreferencesChanged', () => {
        renderActiveSettingsContent();
        populateAllDropdowns();
    });
}


// --- Public API for DevTrackerUI ---
export const DevTrackerUI = {
    initialize: () => {
        _getDOMElements();
        _setupEventListeners();
        renderAll();
        LoggingService.info('[DevTrackerUI] Initialized.');
    }
};