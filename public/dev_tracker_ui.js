// public/dev_tracker_ui.js

import AppStore from './store.js';
import EventBus from './eventBus.js';
import LoggingService from './loggingService.js';
import * as DevTrackerService from './dev_tracker_service.js';

const DevTrackerUI = (() => {
    // --- Module-level State ---
    let _activeEpicId = 'all_issues';
    let _activeSearchTerm = '';
    let _activeSettingsCategory = 'statuses';
    let _activeTicketIdForDetailModal = null;

    // --- DOM Element References ---
    let epicsListEl, ticketsListEl, newEpicBtn, newTicketBtn, settingsBtn, ticketSearchInput, allIssuesFilterBtn;
    let currentEpicTitleEl, currentEpicDescriptionEl;
    let epicModalEl, ticketModalEl, settingsModalEl, ticketDetailModal, epicDetailModal;
    let epicFormEl, epicIdInput, epicKeyInput, epicTitleInput, epicStatusSelect, epicPrioritySelect, epicDescriptionInput, epicReleaseVersionInput, cancelEpicBtn, epicModalTitleEl;
    let ticketFormEl, ticketIdInput, ticketEpicIdInput, ticketTitleInput, ticketStatusSelect, ticketPrioritySelect,
        ticketTypeSelect, ticketComponentSelect, ticketDescriptionInput, ticketAffectedVersionSelect, cancelTicketBtn, ticketModalTitleEl;
    let closeSettingsBtn, settingsNav, settingsContentTitle, optionsList, addOptionForm;
    let closeTicketDetailBtn, ticketDetailKey, ticketDetailTitle, ticketDetailStatusSelect, ticketDetailPriority, 
        ticketDetailType, ticketDetailComponent, ticketDetailDescription, ticketDetailReleaseVersion, ticketDetailAffectedVersion;
    let toggleHistoryLink, ticketHistoryContainer;
    let commentsList, addCommentForm, newCommentInput;
    let closeEpicDetailBtn, epicDetailKey, epicDetailTitle, epicDetailStatus, epicDetailPriority, epicDetailDescription, epicDetailReleaseVersion;

    
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
        epicReleaseVersionInput = document.getElementById('epicReleaseVersion');
        cancelEpicBtn = document.getElementById('cancelEpicBtn');
        epicModalTitleEl = document.getElementById('epicModalTitle');
        ticketFormEl = document.getElementById('ticketForm');
        ticketIdInput = document.getElementById('ticketId');
        ticketEpicIdInput = document.getElementById('ticketEpicId');
        ticketTitleInput = document.getElementById('ticketTitle');
        ticketStatusSelect = document.getElementById('ticketStatus');
        ticketPrioritySelect = document.getElementById('ticketPriority');
        ticketTypeSelect = document.getElementById('ticketType');
        ticketComponentSelect = document.getElementById('ticketComponent');
        ticketDescriptionInput = document.getElementById('ticketDescription');
        ticketAffectedVersionSelect = document.getElementById('ticketAffectedVersion');
        cancelTicketBtn = document.getElementById('cancelTicketBtn');
        ticketModalTitleEl = document.getElementById('ticketModalTitle');
        closeSettingsBtn = document.getElementById('closeSettingsBtn');
        settingsNav = document.getElementById('settingsNav');
        settingsContentTitle = document.getElementById('settingsContentTitle');
        optionsList = document.getElementById('optionsList');
        addOptionForm = document.getElementById('addOptionForm');
        closeTicketDetailBtn = document.getElementById('closeTicketDetailBtn');
        ticketDetailKey = document.getElementById('ticketDetailKey');
        ticketDetailTitle = document.getElementById('ticketDetailTitle');
        ticketDetailStatusSelect = document.getElementById('ticketDetailStatus');
        ticketDetailPriority = document.getElementById('ticketDetailPriority');
        ticketDetailType = document.getElementById('ticketDetailType');
        ticketDetailComponent = document.getElementById('ticketDetailComponent');
        ticketDetailDescription = document.getElementById('ticketDetailDescription');
        ticketDetailReleaseVersion = document.getElementById('ticketDetailReleaseVersion');
        ticketDetailAffectedVersion = document.getElementById('ticketDetailAffectedVersion');
        toggleHistoryLink = document.getElementById('toggleHistoryLink');
        ticketHistoryContainer = document.getElementById('ticketHistoryContainer');
        commentsList = document.getElementById('commentsList');
        addCommentForm = document.getElementById('addCommentForm');
        newCommentInput = document.getElementById('newCommentInput');
        closeEpicDetailBtn = document.getElementById('closeEpicDetailBtn');
        epicDetailKey = document.getElementById('epicDetailKey');
        epicDetailTitle = document.getElementById('epicDetailTitle');
        epicDetailStatus = document.getElementById('epicDetailStatus');
        epicDetailPriority = document.getElementById('epicDetailPriority');
        epicDetailDescription = document.getElementById('epicDetailDescription');
        epicDetailReleaseVersion = document.getElementById('epicDetailReleaseVersion');
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
    const closeTicketDetailModal = () => { _activeTicketIdForDetailModal = null; ticketDetailModal.classList.add('hidden'); }
    const closeEpicDetailModal = () => epicDetailModal.classList.add('hidden');
    
    const populateDropdown = (selectEl, optionsArray, addEmpty = false) => {
        if (!selectEl) return;
        const currentValue = selectEl.value;
        selectEl.innerHTML = '';
        if (addEmpty) {
            const emptyOpt = document.createElement('option');
            emptyOpt.value = '';
            emptyOpt.textContent = 'None';
            selectEl.appendChild(emptyOpt);
        }
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
        const releaseVersions = AppStore.getDevReleaseVersions().map(v => v.version);
        populateDropdown(epicStatusSelect, ['To Do', 'In Progress', 'Done']);
        populateDropdown(epicPrioritySelect, options.priorities);
        populateDropdown(ticketStatusSelect, options.statuses);
        populateDropdown(ticketPrioritySelect, options.priorities);
        populateDropdown(ticketTypeSelect, options.types);
        populateDropdown(ticketComponentSelect, options.components);
        populateDropdown(ticketAffectedVersionSelect, releaseVersions, true);
        populateDropdown(ticketDetailStatusSelect, options.statuses);
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
            epicReleaseVersionInput.value = epic.releaseVersion || '';
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
            ticketAffectedVersionSelect.value = ticket.affectedVersion || '';
        } else {
            ticketModalTitleEl.textContent = 'Create New Ticket';
            ticketIdInput.value = '';
            ticketEpicIdInput.value = _activeEpicId;
        }
        ticketModalEl.classList.remove('hidden');
    };
    
    const _renderTicketComments = (ticketId) => {
        commentsList.innerHTML = '';
        const comments = AppStore.getDevTicketComments().filter(c => c.ticketId === ticketId);
        if (comments.length === 0) {
            commentsList.innerHTML = '<p class="text-sm text-slate-500 italic">No comments yet.</p>';
            return;
        }
        comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'bg-slate-700/50 p-3 rounded-md';
            commentDiv.innerHTML = `
                <div class="flex justify-between items-center text-xs text-slate-400 mb-1">
                    <strong>${comment.author || 'User'}</strong>
                    <span>${new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                <p class="text-slate-200 whitespace-pre-wrap">${comment.comment}</p>
            `;
            commentsList.appendChild(commentDiv);
        });
    }

    const _renderTicketHistory = (ticketId) => {
        ticketHistoryContainer.innerHTML = '';
        const history = AppStore.getDevTicketHistory().filter(h => h.ticketId === ticketId);
        if (history.length === 0) {
            ticketHistoryContainer.innerHTML = '<p class="italic">No history recorded.</p>';
            return;
        }
        history.forEach(item => {
            const historyDiv = document.createElement('div');
            historyDiv.className = 'border-t border-slate-700 pt-1 mt-1';
            historyDiv.innerHTML = `
                <p><strong>${item.field}</strong> changed</p>
                <p class="text-slate-500">From: "${item.oldValue || 'none'}"</p>
                <p class="text-slate-300">To: "${item.newValue || 'none'}"</p>
                <p class="text-xs text-slate-500">${new Date(item.changedAt).toLocaleString()}</p>
            `;
            ticketHistoryContainer.appendChild(historyDiv);
        });
    }

    const openTicketDetailModal = (ticketId) => {
        const ticket = AppStore.getDevTickets().find(t => t.id === ticketId);
        if (!ticket) return;

        _activeTicketIdForDetailModal = ticketId;
        populateAllDropdowns();

        ticketDetailKey.textContent = ticket.fullKey;
        ticketDetailTitle.textContent = ticket.title;
        ticketDetailStatusSelect.value = ticket.status;
        ticketDetailPriority.textContent = ticket.priority;
        ticketDetailType.textContent = ticket.type;
        ticketDetailComponent.textContent = ticket.component || 'N/A';
        ticketDetailDescription.textContent = ticket.description || 'No description provided.';
        ticketDetailReleaseVersion.textContent = ticket.releaseVersion || 'Unscheduled';
        ticketDetailAffectedVersion.textContent = ticket.affectedVersion || 'N/A';

        _renderTicketComments(ticketId);
        _renderTicketHistory(ticketId);
        
        ticketHistoryContainer.classList.add('hidden');
        toggleHistoryLink.textContent = 'Show History';

        ticketDetailModal.classList.remove('hidden');
    };

    const openEpicDetailModal = (epicId) => {
        const epic = AppStore.getDevEpics().find(e => e.id === epicId);
        if (!epic) return;
        epicDetailKey.textContent = epic.key;
        epicDetailTitle.textContent = epic.title;
        epicDetailStatus.textContent = epic.status;
        epicDetailPriority.textContent = epic.priority;
        epicDetailReleaseVersion.textContent = epic.releaseVersion || 'Unscheduled';
        epicDetailDescription.textContent = epic.description || 'No description provided.';
        epicDetailModal.classList.remove('hidden');
    };
    
    const renderActiveSettingsContent = () => {
        const options = getOptions();
        let currentOptions;
        let title;
        
        if (_activeSettingsCategory === 'release_versions') {
            currentOptions = AppStore.getDevReleaseVersions().map(v => v.version);
            title = 'Release Versions';
        } else {
            currentOptions = options[_activeSettingsCategory] || [];
            title = _activeSettingsCategory.charAt(0).toUpperCase() + _activeSettingsCategory.slice(1);
        }
        
        settingsContentTitle.textContent = `Manage ${title}`;
        optionsList.innerHTML = '';
        currentOptions.forEach(option => {
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center p-2 bg-slate-700 rounded-md';
            li.innerHTML = `<span>${option}</span><button data-option="${option}" class="delete-option-btn text-slate-400 hover:text-red-500">&times;</button>`;
            optionsList.appendChild(li);
        });
        const placeholderText = title.endsWith('s') ? `New ${title.slice(0, -1)}` : `New ${title}`;
        addOptionForm.querySelector('input').placeholder = placeholderText;
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
                    <div>
                        <p class="font-semibold text-slate-100"><span class="font-normal text-slate-400">${ticket.fullKey}</span> ${ticket.title}</p>
                        ${ticket.releaseVersion ? `<span class="text-xs font-mono text-purple-400">${ticket.releaseVersion}</span>` : ''}
                    </div>
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

            mainContent.innerHTML = `
                <div class="flex justify-between items-center">
                    <h4 class="font-semibold text-slate-100 truncate pr-10">${epic.title}</h4>
                    <span class="text-xs font-mono px-2 py-0.5 rounded-full ${getPriorityBadgeClass(epic.priority)}">${epic.priority}</span>
                </div>
                <div class="flex justify-between items-center text-xs mt-1">
                    <p class="text-slate-400">${epic.status}</p>
                    ${epic.releaseVersion ? `<span class="font-mono text-purple-400">${epic.releaseVersion}</span>` : ''}
                </div>
            `;
            
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
    const handleEpicFormSubmit = async (e) => { e.preventDefault(); const epicData = { key: epicKeyInput.value, title: epicTitleInput.value, status: epicStatusSelect.value, priority: epicPrioritySelect.value, description: epicDescriptionInput.value, releaseVersion: epicReleaseVersionInput.value.trim() }; const id = Number(epicIdInput.value); let result; if (id) { result = await DevTrackerService.updateEpic(id, epicData); } else { result = await DevTrackerService.addEpic(epicData); } if (result) closeEpicModal(); };
    const handleTicketFormSubmit = async (e) => { e.preventDefault(); const ticketData = { epicId: Number(ticketEpicIdInput.value), title: ticketTitleInput.value, status: ticketStatusSelect.value, priority: ticketPrioritySelect.value, type: ticketTypeSelect.value, component: ticketComponentSelect.value, description: ticketDescriptionInput.value, affectedVersion: ticketAffectedVersionSelect.value }; const id = Number(ticketIdInput.value); if (id) { await DevTrackerService.updateTicket(id, ticketData); } else { await DevTrackerService.addTicket(ticketData); } closeTicketModal(); };
    const handleDeleteEpic = async (epicId) => { if (confirm('Are you sure you want to delete this epic and all its tickets? This action cannot be undone.')) { await DevTrackerService.deleteEpic(epicId); if (_activeEpicId === epicId) { _activeEpicId = 'all_issues'; renderAll(); } } };
    const handleDeleteTicket = async (ticketId) => { if (confirm('Are you sure you want to delete this ticket?')) await DevTrackerService.deleteTicket(ticketId); };
    const handleAddOption = async (e) => { e.preventDefault(); const input = e.target.querySelector('input'); const value = input.value.trim(); if (!value) return; if (_activeSettingsCategory === 'release_versions') { await DevTrackerService.addReleaseVersion(value); } else { const options = getOptions(); const currentCategoryOptions = options[_activeSettingsCategory]; if (!currentCategoryOptions.includes(value)) { currentCategoryOptions.push(value); await AppStore.setUserPreferences({ dev_tracker_options: options }); } } input.value = ''; };
    const handleAddComment = async (e) => { e.preventDefault(); const commentText = newCommentInput.value.trim(); if (commentText && _activeTicketIdForDetailModal) { await DevTrackerService.addComment(_activeTicketIdForDetailModal, commentText); newCommentInput.value = ''; } };
    const handleStatusChange = async (e) => { const newStatus = e.target.value; if (newStatus && _activeTicketIdForDetailModal) { await DevTrackerService.updateTicketStatus(_activeTicketIdForDetailModal, newStatus); } };
    const handleToggleHistory = (e) => { e.preventDefault(); ticketHistoryContainer.classList.toggle('hidden'); e.target.textContent = ticketHistoryContainer.classList.contains('hidden') ? 'Show History' : 'Hide History'; };
    
    const handleDeleteOption = async (e) => {
        if (!e.target.classList.contains('delete-option-btn')) return;
        const optionToDelete = e.target.dataset.option;
        if (confirm(`Are you sure you want to delete "${optionToDelete}"?`)) {
            if (_activeSettingsCategory === 'release_versions') {
                // To delete a version, we need its ID. We find it in the store.
                const versionToDelete = AppStore.getDevReleaseVersions().find(v => v.version === optionToDelete);
                if (versionToDelete) {
                    // This assumes a delete service function exists. If not, this part needs implementation.
                    // For now, let's just remove from the store for UI demonstration.
                    let versions = AppStore.getDevReleaseVersions().filter(v => v.id !== versionToDelete.id);
                    await AppStore.setDevReleaseVersions(versions);
                }
            } else {
                const options = getOptions();
                options[_activeSettingsCategory] = options[_activeSettingsCategory].filter(o => o !== optionToDelete);
                await AppStore.setUserPreferences({ dev_tracker_options: options });
            }
        }
    };
    
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
        addCommentForm.addEventListener('submit', handleAddComment);
        ticketDetailStatusSelect.addEventListener('change', handleStatusChange);
        toggleHistoryLink.addEventListener('click', handleToggleHistory);

        EventBus.subscribe('devEpicsChanged', renderAll);
        EventBus.subscribe('devTicketsChanged', renderTicketsList);
        EventBus.subscribe('userPreferencesChanged', () => { renderActiveSettingsContent(); populateAllDropdowns(); });
        EventBus.subscribe('devReleaseVersionsChanged', () => { renderActiveSettingsContent(); populateAllDropdowns(); });
        EventBus.subscribe('devTicketCommentsChanged', () => { if(_activeTicketIdForDetailModal) _renderTicketComments(_activeTicketIdForDetailModal); });
        EventBus.subscribe('devTicketHistoryChanged', () => { if(_activeTicketIdForDetailModal) _renderTicketHistory(_activeTicketIdForDetailModal); });
    };

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