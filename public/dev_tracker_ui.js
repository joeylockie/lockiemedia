// public/dev_tracker_ui.js
// Manages all UI rendering and event handling for the Dev Tracker.

import AppStore from './store.js';
import EventBus from './eventBus.js';
import LoggingService from './loggingService.js';
import * as DevTrackerService from './dev_tracker_service.js';

// --- Internal State ---
let _activeEpicId = null;

// --- DOM Element References ---
let epicsListEl, ticketsListEl, newEpicBtn, newTicketBtn;
let currentEpicTitleEl, currentEpicDescriptionEl;
// Epic Modal
let epicModalEl, epicModalDialogEl, epicModalTitleEl, epicFormEl, epicIdInput,
    epicTitleInput, epicStatusSelect, epicPrioritySelect, epicDescriptionInput,
    cancelEpicBtn;
// Ticket Modal
let ticketModalEl, ticketModalDialogEl, ticketModalTitleEl, ticketFormEl, ticketIdInput,
    ticketEpicIdInput, ticketTitleInput, ticketStatusSelect, ticketPrioritySelect,
    ticketTypeSelect, ticketDescriptionInput, cancelTicketBtn;

/**
 * Caches all necessary DOM elements for the feature.
 */
function _getDOMElements() {
    epicsListEl = document.getElementById('epicsList');
    ticketsListEl = document.getElementById('ticketsList');
    newEpicBtn = document.getElementById('newEpicBtn');
    newTicketBtn = document.getElementById('newTicketBtn');
    currentEpicTitleEl = document.getElementById('currentEpicTitle');
    currentEpicDescriptionEl = document.getElementById('currentEpicDescription');

    // Epic Modal
    epicModalEl = document.getElementById('epicModal');
    epicModalDialogEl = document.getElementById('epicModalDialog');
    epicModalTitleEl = document.getElementById('epicModalTitle');
    epicFormEl = document.getElementById('epicForm');
    epicIdInput = document.getElementById('epicId');
    epicTitleInput = document.getElementById('epicTitle');
    epicStatusSelect = document.getElementById('epicStatus');
    epicPrioritySelect = document.getElementById('epicPriority');
    epicDescriptionInput = document.getElementById('epicDescription');
    cancelEpicBtn = document.getElementById('cancelEpicBtn');

    // Ticket Modal
    ticketModalEl = document.getElementById('ticketModal');
    ticketModalDialogEl = document.getElementById('ticketModalDialog');
    ticketModalTitleEl = document.getElementById('ticketModalTitle');
    ticketFormEl = document.getElementById('ticketForm');
    ticketIdInput = document.getElementById('ticketId');
    ticketEpicIdInput = document.getElementById('ticketEpicId');
    ticketTitleInput = document.getElementById('ticketTitle');
    ticketStatusSelect = document.getElementById('ticketStatus');
    ticketPrioritySelect = document.getElementById('ticketPriority');
    ticketTypeSelect = document.getElementById('ticketType');
    ticketDescriptionInput = document.getElementById('ticketDescription');
    cancelTicketBtn = document.getElementById('cancelTicketBtn');
}

// --- Rendering Functions ---

/**
 * Renders the list of epics in the sidebar.
 */
function renderEpicsList() {
    if (!epicsListEl) return;
    const epics = AppStore.getDevEpics().sort((a, b) => b.createdAt - a.createdAt);
    epicsListEl.innerHTML = '';

    if (epics.length === 0) {
        epicsListEl.innerHTML = '<p class="text-sm text-slate-400 text-center p-4">No epics created yet.</p>';
        return;
    }

    epics.forEach(epic => {
        const epicDiv = document.createElement('div');
        const isActive = epic.id === _activeEpicId;
        epicDiv.className = `p-3 rounded-lg cursor-pointer group relative hover:bg-slate-700/70 ${isActive ? 'bg-purple-600/30 ring-1 ring-purple-500' : 'bg-slate-700/30'}`;
        epicDiv.onclick = () => {
            _activeEpicId = epic.id;
            renderAll();
        };

        epicDiv.innerHTML = `
            <div class="flex justify-between items-center">
                <h4 class="font-semibold text-slate-100 truncate pr-10">${epic.title}</h4>
                <span class="text-xs font-mono px-2 py-0.5 rounded-full ${getPriorityBadgeClass(epic.priority)}">${epic.priority}</span>
            </div>
            <p class="text-xs text-slate-400 mt-1">${epic.status}</p>
            <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button data-epic-id="${epic.id}" class="edit-epic-btn text-slate-400 hover:text-sky-400 text-xs"><i class="fas fa-pencil-alt"></i></button>
                <button data-epic-id="${epic.id}" class="delete-epic-btn text-slate-400 hover:text-red-500 text-xs"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        epicsListEl.appendChild(epicDiv);
    });

    // Attach event listeners after rendering
    epicsListEl.querySelectorAll('.edit-epic-btn').forEach(btn => btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEpicModal(Number(e.currentTarget.dataset.epicId));
    }));
    epicsListEl.querySelectorAll('.delete-epic-btn').forEach(btn => btn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleDeleteEpic(Number(e.currentTarget.dataset.epicId));
    }));
}

/**
 * Renders the list of tickets for the currently active epic.
 */
function renderTicketsList() {
    if (!ticketsListEl) return;
    ticketsListEl.innerHTML = '';
    
    if (!_activeEpicId) {
        currentEpicTitleEl.textContent = 'Select an Epic';
        currentEpicDescriptionEl.textContent = 'Choose an epic from the left to view its tickets.';
        newTicketBtn.disabled = true;
        ticketsListEl.innerHTML = '<p class="text-center text-slate-500 pt-10">No epic selected.</p>';
        return;
    }

    const activeEpic = AppStore.getDevEpics().find(e => e.id === _activeEpicId);
    if (!activeEpic) {
        _activeEpicId = null; // Reset if the active epic was deleted
        renderAll();
        return;
    }
    
    currentEpicTitleEl.textContent = activeEpic.title;
    currentEpicDescriptionEl.textContent = activeEpic.description || 'No description for this epic.';
    newTicketBtn.disabled = false;

    const tickets = AppStore.getDevTickets()
        .filter(t => t.epicId === _activeEpicId)
        .sort((a, b) => b.createdAt - a.createdAt);

    if (tickets.length === 0) {
        ticketsListEl.innerHTML = '<p class="text-center text-slate-500 pt-10">This epic has no tickets. Click "New Ticket" to add one.</p>';
        return;
    }

    tickets.forEach(ticket => {
        const ticketDiv = document.createElement('div');
        ticketDiv.className = 'bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-sky-500 transition-colors group';
        ticketDiv.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-grow">
                    <p class="font-semibold text-slate-100">${ticket.title}</p>
                    <p class="text-sm text-slate-400 mt-1">${ticket.description || 'No description.'}</p>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0 ml-4">
                    <button data-ticket-id="${ticket.id}" class="edit-ticket-btn opacity-0 group-hover:opacity-100 text-slate-400 hover:text-sky-400 text-sm"><i class="fas fa-pencil-alt"></i></button>
                    <button data-ticket-id="${ticket.id}" class="delete-ticket-btn opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 text-sm"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
            <div class="mt-3 pt-3 border-t border-slate-700 flex justify-between items-center text-xs">
                <div class="flex items-center gap-4">
                    <span class="font-mono px-2 py-0.5 rounded-full ${getStatusBadgeClass(ticket.status)}">${ticket.status}</span>
                    <span class="font-mono px-2 py-0.5 rounded-full ${getPriorityBadgeClass(ticket.priority)}">${ticket.priority}</span>
                    <span class="font-mono px-2 py-0.5 rounded-full ${getTypeBadgeClass(ticket.type)}">${ticket.type}</span>
                </div>
                <span class="text-slate-500">ID: T-${ticket.id}</span>
            </div>
        `;
        ticketsListEl.appendChild(ticketDiv);
    });

    // Attach event listeners
    ticketsListEl.querySelectorAll('.edit-ticket-btn').forEach(btn => btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openTicketModal(Number(e.currentTarget.dataset.ticketId));
    }));
    ticketsListEl.querySelectorAll('.delete-ticket-btn').forEach(btn => btn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleDeleteTicket(Number(e.currentTarget.dataset.ticketId));
    }));
}

function renderAll() {
    renderEpicsList();
    renderTicketsList();
}

// --- Badge Coloring Helper Functions ---
function getStatusBadgeClass(status) {
    switch (status) {
        case 'To Do': case 'Open': return 'bg-slate-600 text-slate-200';
        case 'In Progress': return 'bg-sky-600 text-sky-100';
        case 'In Review': return 'bg-amber-600 text-amber-100';
        case 'Done': return 'bg-green-600 text-green-100';
        default: return 'bg-slate-600 text-slate-200';
    }
}
function getPriorityBadgeClass(priority) {
    switch (priority) {
        case 'Low': return 'bg-gray-500 text-gray-100';
        case 'Medium': return 'bg-yellow-500 text-yellow-100';
        case 'High': return 'bg-red-500 text-red-100';
        default: return 'bg-gray-500 text-gray-100';
    }
}
function getTypeBadgeClass(type) {
    switch (type) {
        case 'Feature': return 'bg-blue-600 text-blue-100';
        case 'Bug': return 'bg-pink-600 text-pink-100';
        case 'Chore': return 'bg-indigo-600 text-indigo-100';
        default: return 'bg-blue-600 text-blue-100';
    }
}


// --- Modal Functions ---
function openEpicModal(epicId = null) {
    epicFormEl.reset();
    if (epicId) {
        const epic = AppStore.getDevEpics().find(e => e.id === epicId);
        if (!epic) return;
        epicModalTitleEl.textContent = 'Edit Epic';
        epicIdInput.value = epic.id;
        epicTitleInput.value = epic.title;
        epicStatusSelect.value = epic.status;
        epicPrioritySelect.value = epic.priority;
        epicDescriptionInput.value = epic.description;
    } else {
        epicModalTitleEl.textContent = 'Create New Epic';
        epicIdInput.value = '';
    }
    epicModalEl.classList.remove('hidden');
}
function closeEpicModal() { epicModalEl.classList.add('hidden'); }

function openTicketModal(ticketId = null) {
    ticketFormEl.reset();
    if (ticketId) {
        const ticket = AppStore.getDevTickets().find(t => t.id === ticketId);
        if (!ticket) return;
        ticketModalTitleEl.textContent = 'Edit Ticket';
        ticketIdInput.value = ticket.id;
        ticketEpicIdInput.value = ticket.epicId;
        ticketTitleInput.value = ticket.title;
        ticketStatusSelect.value = ticket.status;
        ticketPrioritySelect.value = ticket.priority;
        ticketTypeSelect.value = ticket.type;
        ticketDescriptionInput.value = ticket.description;
    } else {
        ticketModalTitleEl.textContent = 'Create New Ticket';
        ticketIdInput.value = '';
        ticketEpicIdInput.value = _activeEpicId;
    }
    ticketModalEl.classList.remove('hidden');
}
function closeTicketModal() { ticketModalEl.classList.add('hidden'); }

// --- Event Handlers ---
async function handleEpicFormSubmit(e) {
    e.preventDefault();
    const epicData = {
        title: epicTitleInput.value,
        status: epicStatusSelect.value,
        priority: epicPrioritySelect.value,
        description: epicDescriptionInput.value
    };
    const id = Number(epicIdInput.value);
    if (id) {
        await DevTrackerService.updateEpic(id, epicData);
    } else {
        await DevTrackerService.addEpic(epicData);
    }
    closeEpicModal();
}

async function handleTicketFormSubmit(e) {
    e.preventDefault();
    const ticketData = {
        epicId: Number(ticketEpicIdInput.value),
        title: ticketTitleInput.value,
        status: ticketStatusSelect.value,
        priority: ticketPrioritySelect.value,
        type: ticketTypeSelect.value,
        description: ticketDescriptionInput.value,
    };
    const id = Number(ticketIdInput.value);
    if (id) {
        await DevTrackerService.updateTicket(id, ticketData);
    } else {
        await DevTrackerService.addTicket(ticketData);
    }
    closeTicketModal();
}

async function handleDeleteEpic(epicId) {
    if (confirm('Are you sure you want to delete this epic and all its tickets? This action cannot be undone.')) {
        await DevTrackerService.deleteEpic(epicId);
        if (_activeEpicId === epicId) {
            _activeEpicId = null;
        }
    }
}

async function handleDeleteTicket(ticketId) {
    if (confirm('Are you sure you want to delete this ticket?')) {
        await DevTrackerService.deleteTicket(ticketId);
    }
}

/**
 * Attaches all primary event listeners for the page.
 */
function _setupEventListeners() {
    newEpicBtn.addEventListener('click', () => openEpicModal());
    newTicketBtn.addEventListener('click', () => openTicketModal());
    
    // Modals
    cancelEpicBtn.addEventListener('click', closeEpicModal);
    epicFormEl.addEventListener('submit', handleEpicFormSubmit);
    cancelTicketBtn.addEventListener('click', closeTicketModal);
    ticketFormEl.addEventListener('submit', handleTicketFormSubmit);

    // Event Bus Subscriptions
    EventBus.subscribe('devEpicsChanged', renderAll);
    EventBus.subscribe('devTicketsChanged', renderTicketsList);
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