// public/dev_tracker_ui.js
// Manages all UI rendering and event handling for the Dev Tracker.

import AppStore from './store.js';
import EventBus from './eventBus.js';
import LoggingService from './loggingService.js';
import * as DevTrackerService from './dev_tracker_service.js';

const DevTrackerUI = (() => {
    // --- Module-level State ---
    let _activeEpicId = 'all_issues';
    let _activeSearchTerm = '';
    let _activeSettingsCategory = 'statuses';

    // --- DOM Element References ---
    let epicsListEl, ticketsListEl, newEpicBtn, newTicketBtn, settingsBtn, ticketSearchInput, allIssuesFilterBtn;
    let currentEpicTitleEl, currentEpicDescriptionEl;
    let epicModalEl, ticketModalEl, settingsModalEl, ticketDetailModal, epicDetailModal;
    let epicFormEl, epicIdInput, epicKeyInput, epicTitleInput, epicStatusSelect, epicPrioritySelect, epicDescriptionInput, cancelEpicBtn;
    let ticketFormEl, ticketIdInput, ticketEpicIdInput, ticketTitleInput, ticketStatusSelect, ticketPrioritySelect,
        ticketTypeSelect, ticketComponentSelect, ticketDescriptionInput, cancelTicketBtn;
    let closeSettingsBtn, settingsNav, settingsContentTitle, optionsList, addOptionForm;
    let closeTicketDetailBtn, ticketDetailKey, ticketDetailTitle, ticketDetailStatus, ticketDetailPriority, ticketDetailType, ticketDetailComponent, ticketDetailDescription;
    let closeEpicDetailBtn, epicDetailKey, epicDetailTitle, epicDetailStatus, epicDetailPriority, epicDetailDescription;

    // --- Private Functions (Helpers, Renderers, Handlers) ---
    
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
        epicModalEl = document.getElementById('epicModal');
        ticketModalEl = document.getElementById('ticketModal');
        settingsModalEl = document.getElementById('settingsModal');
        ticketDetailModal = document.getElementById('ticketDetailModal');
        epicDetailModal = document.getElementById('epicDetailModal');
        epicFormEl = document.getElementById('epicForm');
        epicIdInput = document.getElementById('epicId');
        epicKeyInput = document.getElementById('epicKey');
        epicTitleInput = document.getElementById('epicTitle');
        epicStatusSelect = document.getElementById('epicStatus');
        epicPrioritySelect = document.getElementById('epicPriority');
        epicDescriptionInput = document.getElementById('epicDescription');
        cancelEpicBtn = document.getElementById('cancelEpicBtn');
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
        closeSettingsBtn = document.getElementById('closeSettingsBtn');
        settingsNav = document.getElementById('settingsNav');
        settingsContentTitle = document.getElementById('settingsContentTitle');
        optionsList = document.getElementById('optionsList');
        addOptionForm = document.getElementById('addOptionForm');
        closeTicketDetailBtn = document.getElementById('closeTicketDetailBtn');
        ticketDetailKey = document.getElementById('ticketDetailKey');
        ticketDetailTitle = document.getElementById('ticketDetailTitle');
        ticketDetailStatus = document.getElementById('ticketDetailStatus');
        ticketDetailPriority = document.getElementById('ticketDetailPriority');
        ticketDetailType = document.getElementById('ticketDetailType');
        ticketDetailComponent = document.getElementById('ticketDetailComponent');
        ticketDetailDescription = document.getElementById('ticketDetailDescription');
        closeEpicDetailBtn = document.getElementById('closeEpicDetailBtn');
        epicDetailKey = document.getElementById('epicDetailKey');
        epicDetailTitle = document.getElementById('epicDetailTitle');
        epicDetailStatus = document.getElementById('epicDetailStatus');
        epicDetailPriority = document.getElementById('epicDetailPriority');
        epicDetailDescription = document.getElementById('epicDetailDescription');
    }

    const getOptions = () => AppStore.getUserPreferences().dev_tracker_options || { statuses: [], priorities: [], types: [], components: [] };
    const getStatusBadgeClass = status => ({'To Do': 'bg-slate-600 text-slate-200', 'Open': 'bg-slate-600 text-slate-200', 'In Progress': 'bg-sky-600 text-sky-100', 'In Review': 'bg-amber-600 text-amber-100', 'Done': 'bg-green-600 text-green-100'}[status] || 'bg-slate-600 text-slate-200');
    const getPriorityBadgeClass = priority => ({'Low': 'bg-gray-500 text-gray-100', 'Medium': 'bg-yellow-500 text-yellow-100', 'High': 'bg-red-500 text-red-100'}[priority] || 'bg-gray-500 text-gray-100');
    const getTypeBadgeClass = type => ({'Feature': 'bg-blue-600 text-blue-100', 'Bug': 'bg-pink-600 text-pink-100', 'Chore': 'bg-indigo-600 text-indigo-100'}[type] || 'bg-blue-600 text-blue-100');
    const getComponentBadgeClass = component => {
        let hash = 0;
        if(component) for (let i = 0; i < component.length; i++) hash = component.charCodeAt(i) + ((hash << 5) - hash);
        const colors = ['teal', 'cyan', 'fuchsia', 'rose', 'lime'];
        return `bg-${colors[Math.abs(hash) % colors.length]}-600 text-${colors[Math.abs(hash) % colors.length]}-100`;
    };

    const closeEpicModal = () => epicModalEl.classList.add('hidden');
    const closeTicketModal = () => ticketModalEl.classList.add('hidden');
    const closeSettingsModal = () => settingsModalEl.classList.add('hidden');
    const closeTicketDetailModal = () => ticketDetailModal.classList.add('hidden');
    const closeEpicDetailModal = () => epicDetailModal.classList.add('hidden');
    
    const populateDropdown = (selectEl, optionsArray) => {
        const currentValue = selectEl.value;
        selectEl.innerHTML = '';
        optionsArray.forEach(opt => {
            const optionEl = document.createElement('option');
            optionEl.value = opt;
            optionEl.textContent = opt;
            selectEl.appendChild(optionEl);
        });
        if (optionsArray.includes(currentValue)) selectEl.value = currentValue;
    };
    
    const populateAllDropdowns = () => {
        const options = getOptions();
        populateDropdown(epicStatusSelect, ['To Do', 'In Progress', 'Done']);
        populateDropdown(epicPrioritySelect, options.priorities);
        populateDropdown(ticketStatusSelect, options.statuses);
        populateDropdown(ticketPrioritySelect, options.priorities);
        populateDropdown(ticketTypeSelect, options.types);
        populateDropdown(ticketComponentSelect, options.components);
    };

    const openEpicModal = (epicId = null) => {
        epicFormEl.reset();
        populateAllDropdowns();
        if (epicId) {
            const epic = AppStore.getDevEpics().find(e => e.id === epicId);
            if (!epic) return;
            epicModalTitleEl.textContent = 'Edit Epic';
            epicIdInput.value = epic.id;
            epicKeyInput.value = epic.key;
            epicKeyInput.disabled = true;
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
    };

    const openTicketModal = (ticketId = null) => {
        ticketFormEl.reset();
        populateAllDropdowns();
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
            ticketComponentSelect.value = ticket.component;
            ticketDescriptionInput.value = ticket.description;
        } else {
            ticketModalTitleEl.textContent = 'Create New Ticket';
            ticketIdInput.value = '';
            ticketEpicIdInput.value = _activeEpicId;
        }
        ticketModalEl.classList.remove('hidden');
    };

    const openTicketDetailModal = (ticketId) => {
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
    };

    const openEpicDetailModal = (epicId) => {
        const epic = AppStore.getDevEpics().find(e => e.id === epicId);
        if (!epic) return;
        epicDetailKey.textContent = epic.key;
        epicDetailTitle.textContent = epic.title;
        epicDetailStatus.textContent = epic.status;
        epicDetailPriority.textContent = epic.priority;
        epicDetailDescription.textContent = epic.description || 'No description provided.';
        epicDetailModal.classList.remove('hidden');
    };
    
    const renderActiveSettingsContent = () => {
        const options = getOptions();
        const currentOptions = options[_activeSettingsCategory] || [];
        const title = _activeSettingsCategory.charAt(0).toUpperCase() + _activeSettingsCategory.slice(1);
        settingsContentTitle.textContent = `Manage ${title}`;
        optionsList.innerHTML = '';
        currentOptions.forEach(option => {
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center p-2 bg-slate-700 rounded-md';
            li.innerHTML = `<span>${option}</span><button data-option="${option}" class="delete-option-btn text-slate-400 hover:text-red-500">&times;</button>`;
            optionsList.appendChild(li);
        });
        addOptionForm.querySelector('input').placeholder = `New ${title.slice(0, -1)}`;
    };

    const setActiveSettingsCategory = (category) => {
        _activeSettingsCategory = category;
        settingsNav.querySelectorAll('.settings-nav-item').forEach(btn => {
            btn.classList.toggle('bg-slate-700', btn.dataset.type === category);
        });
        renderActiveSettingsContent();
    };

    const openSettingsModal = () => {
        setActiveSettingsCategory('statuses');
        settingsModalEl.classList.remove('hidden');
    };
    
    const renderTicketsList = () => {
        if (!ticketsListEl) return;
        ticketsListEl.innerHTML = '';
        
        let allTickets = AppStore.getDevTickets();
        let filteredTickets = [];

        if (_activeEpicId === 'all_issues') {
            currentEpicTitleEl.textContent = 'All Issues';
            currentEpicDescriptionEl.textContent = `Showing all tickets across all epics.`;
            newTicketBtn.disabled = true;
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

        ticketsListEl.querySelectorAll('.edit-ticket-btn').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); openTicketModal(Number(e.currentTarget.dataset.ticketId)); }));
        ticketsListEl.querySelectorAll('.delete-ticket-btn').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); handleDeleteTicket(Number(e.currentTarget.dataset.ticketId)); }));
    };
    
    const renderEpicsList = () => {
        if (!epicsListEl) return;
        const epics = AppStore.getDevEpics().sort((a, b) => a.title.localeCompare(b.title));
        epicsListEl.innerHTML = '';
        
        allIssuesFilterBtn.classList.toggle('bg-purple-600/30', _activeEpicId === 'all_issues');

        epics.forEach(epic => {
            const epicDiv = document.createElement('div');
            const isActive = epic.id === _activeEpicId;
            epicDiv.className = `p-3 rounded-lg cursor-pointer group relative hover:bg-slate-700/70 ${isActive ? 'bg-purple-600/30 ring-1 ring-purple-500' : 'bg-slate-700/30'}`;
            
            const mainContent = document.createElement('div');
            mainContent.onclick = () => { _activeEpicId = epic.id; renderAll(); };

            mainContent.innerHTML = `<div class="flex justify-between items-center"><h4 class="font-semibold text-slate-100 truncate pr-10">${epic.title}</h4><span class="text-xs font-mono px-2 py-0.5 rounded-full ${getPriorityBadgeClass(epic.priority)}">${epic.priority}</span></div><p class="text-xs text-slate-400 mt-1">${epic.status}</p>`;
            
            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity';
            controlsDiv.innerHTML = `<button data-epic-id="${epic.id}" class="view-epic-btn text-slate-400 hover:text-green-400 text-xs"><i class="fas fa-eye"></i></button><button data-epic-id="${epic.id}" class="edit-epic-btn text-slate-400 hover:text-sky-400 text-xs"><i class="fas fa-pencil-alt"></i></button><button data-epic-id="${epic.id}" class="delete-epic-btn text-slate-400 hover:text-red-500 text-xs"><i class="fas fa-trash-alt"></i></button>`;

            epicDiv.appendChild(mainContent);
            epicDiv.appendChild(controlsDiv);
            epicsListEl.appendChild(epicDiv);
        });

        epicsListEl.querySelectorAll('.view-epic-btn').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); openEpicDetailModal(Number(e.currentTarget.dataset.epicId)); }));
        epicsListEl.querySelectorAll('.edit-epic-btn').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); openEpicModal(Number(e.currentTarget.dataset.epicId)); }));
        epicsListEl.querySelectorAll('.delete-epic-btn').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); handleDeleteEpic(Number(e.currentTarget.dataset.epicId)); }));
    };

    const renderAll = () => {
        renderEpicsList();
        renderTicketsList();
        populateAllDropdowns();
    };
    
    // --- Event Handlers ---
    const handleEpicFormSubmit = async (e) => { e.preventDefault(); const epicData = { key: epicKeyInput.value, title: epicTitleInput.value, status: epicStatusSelect.value, priority: epicPrioritySelect.value, description: epicDescriptionInput.value }; const id = Number(epicIdInput.value); let result; if (id) { result = await DevTrackerService.updateEpic(id, epicData); } else { result = await DevTrackerService.addEpic(epicData); } if (result) closeEpicModal(); };
    const handleTicketFormSubmit = async (e) => { e.preventDefault(); const ticketData = { epicId: Number(ticketEpicIdInput.value), title: ticketTitleInput.value, status: ticketStatusSelect.value, priority: ticketPrioritySelect.value, type: ticketTypeSelect.value, component: ticketComponentSelect.value, description: ticketDescriptionInput.value, }; const id = Number(ticketIdInput.value); if (id) { await DevTrackerService.updateTicket(id, ticketData); } else { await DevTrackerService.addTicket(ticketData); } closeTicketModal(); };
    const handleDeleteEpic = async (epicId) => { if (confirm('Are you sure you want to delete this epic and all its tickets? This action cannot be undone.')) { await DevTrackerService.deleteEpic(epicId); if (_activeEpicId === epicId) { _activeEpicId = 'all_issues'; renderAll(); } } };
    const handleDeleteTicket = async (ticketId) => { if (confirm('Are you sure you want to delete this ticket?')) await DevTrackerService.deleteTicket(ticketId); };
    const handleAddOption = async (e) => { e.preventDefault(); const input = e.target.querySelector('input'); const value = input.value.trim(); if (value) { const options = getOptions(); const currentCategoryOptions = options[_activeSettingsCategory]; if (!currentCategoryOptions.includes(value)) { currentCategoryOptions.push(value); await AppStore.setUserPreferences({ dev_tracker_options: options }); input.value = ''; } } };
    const handleDeleteOption = async (e) => { if (!e.target.classList.contains('delete-option-btn')) return; const optionToDelete = e.target.dataset.option; if (confirm(`Are you sure you want to delete "${optionToDelete}"? This will not affect existing tickets.`)) { const options = getOptions(); options[_activeSettingsCategory] = options[_activeSettingsCategory].filter(o => o !== optionToDelete); await AppStore.setUserPreferences({ dev_tracker_options: options }); } };
    
    const _setupEventListeners = () => {
        newEpicBtn.addEventListener('click', () => openEpicModal());
        newTicketBtn.addEventListener('click', () => openTicketModal());
        settingsBtn.addEventListener('click', openSettingsModal);
        allIssuesFilterBtn.addEventListener('click', () => { _activeEpicId = 'all_issues'; renderAll(); });
        ticketSearchInput.addEventListener('input', (e) => { _activeSearchTerm = e.target.value.toLowerCase(); renderTicketsList(); });
        cancelEpicBtn.addEventListener('click', closeEpicModal);
        epicFormEl.addEventListener('submit', handleEpicFormSubmit);
        cancelTicketBtn.addEventListener('click', closeTicketModal);
        ticketFormEl.addEventListener('submit', handleTicketFormSubmit);
        closeSettingsBtn.addEventListener('click', closeSettingsModal);
        closeTicketDetailBtn.addEventListener('click', closeTicketDetailModal);
        closeEpicDetailBtn.addEventListener('click', closeEpicDetailModal);
        settingsNav.addEventListener('click', (e) => { if (e.target.matches('.settings-nav-item')) setActiveSettingsCategory(e.target.dataset.type); });
        addOptionForm.addEventListener('submit', handleAddOption);
        optionsList.addEventListener('click', handleDeleteOption);
        EventBus.subscribe('devEpicsChanged', renderAll);
        EventBus.subscribe('devTicketsChanged', renderTicketsList);
        EventBus.subscribe('userPreferencesChanged', () => { renderActiveSettingsContent(); populateAllDropdowns(); });
    };

    // --- Public API ---
    return {
        initialize: () => {
            _getDOMElements();
            _setupEventListeners();
            renderAll();
            LoggingService.info('[DevTrackerUI] Initialized.');
        }
    };
})();

export { DevTrackerUI };