// public/dev_tracker_ui.js

import AppStore from './store.js';
import EventBus from './eventBus.js';
import LoggingService from './loggingService.js';
import * as DevTrackerService from './dev_tracker_service.js';

const DevTrackerUI = (() => {
    // ... (keep all the module-level state and DOM element references the same)
    let _activeEpicId = 'all_issues';
    let _activeTicketFilter = 'all';
    let _activeSearchTerm = '';
    let _activeSettingsCategory = 'statuses';
    let _activeTicketIdForDetailModal = null;
    const el = {};

    // ... (keep the _getDOMElements function exactly as it was in the last version I gave you)
    function _getDOMElements() {
        el.epicsList = document.getElementById('epicsList');
        el.ticketsList = document.getElementById('ticketsList');
        el.newEpicBtn = document.getElementById('newEpicBtn');
        el.newTicketBtn = document.getElementById('newTicketBtn');
        el.settingsBtn = document.getElementById('settingsBtn');
        el.currentEpicTitle = document.getElementById('currentEpicTitle');
        el.currentEpicDescription = document.getElementById('currentEpicDescription');
        el.ticketSearchInput = document.getElementById('ticketSearchInput');
        el.allIssuesFilterBtn = document.getElementById('allIssuesFilter');
        el.ticketFilterControls = document.getElementById('ticketFilterControls');
        el.epicModal = document.getElementById('epicModal');
        el.ticketModal = document.getElementById('ticketModal');
        el.settingsModal = document.getElementById('settingsModal');
        el.ticketDetailModal = document.getElementById('ticketDetailModal');
        el.epicDetailModal = document.getElementById('epicDetailModal');
        el.epicForm = document.getElementById('epicForm');
        el.epicIdInput = document.getElementById('epicId');
        el.epicKeyInput = document.getElementById('epicKey');
        el.epicTitleInput = document.getElementById('epicTitle');
        el.epicStatusSelect = document.getElementById('epicStatus');
        el.epicPrioritySelect = document.getElementById('epicPriority');
        el.epicDescriptionInput = document.getElementById('epicDescription');
        el.epicReleaseVersionInput = document.getElementById('epicReleaseVersion');
        el.cancelEpicBtn = document.getElementById('cancelEpicBtn');
        el.epicModalTitle = document.getElementById('epicModalTitle');
        el.ticketForm = document.getElementById('ticketForm');
        el.ticketIdInput = document.getElementById('ticketId');
        el.ticketEpicIdInput = document.getElementById('ticketEpicId');
        el.ticketTitleInput = document.getElementById('ticketTitle');
        el.ticketStatusSelect = document.getElementById('ticketStatus');
        el.ticketPrioritySelect = document.getElementById('ticketPriority');
        el.ticketTypeSelect = document.getElementById('ticketType');
        el.ticketComponentSelect = document.getElementById('ticketComponent');
        el.ticketDescriptionInput = document.getElementById('ticketDescription');
        el.ticketAffectedVersionSelect = document.getElementById('ticketAffectedVersion');
        el.cancelTicketBtn = document.getElementById('cancelTicketBtn');
        el.ticketModalTitle = document.getElementById('ticketModalTitle');
        el.closeSettingsBtn = document.getElementById('closeSettingsBtn');
        el.settingsNav = document.getElementById('settingsNav');
        el.settingsContentTitle = document.getElementById('settingsContentTitle');
        el.optionsList = document.getElementById('optionsList');
        el.addOptionForm = document.getElementById('addOptionForm');
        el.closeTicketDetailBtn = document.getElementById('closeTicketDetailBtn');
        el.ticketDetailKey = document.getElementById('ticketDetailKey');
        el.ticketDetailTitle = document.getElementById('ticketDetailTitle');
        el.ticketDetailStatusSelect = document.getElementById('ticketDetailStatus');
        el.toggleHistoryLink = document.getElementById('toggleHistoryLink');
        el.ticketHistoryContainer = document.getElementById('ticketHistoryContainer');
        el.commentsList = document.getElementById('commentsList');
        el.addCommentForm = document.getElementById('addCommentForm');
        el.newCommentInput = document.getElementById('newCommentInput');
        el.closeEpicDetailBtn = document.getElementById('closeEpicDetailBtn');
        el.epicDetailKey = document.getElementById('epicDetailKey');
        el.epicDetailTitle = document.getElementById('epicDetailTitle');
        el.epicDetailStatus = document.getElementById('epicDetailStatus');
        el.epicDetailPriority = document.getElementById('epicDetailPriority');
        el.epicDetailDescription = document.getElementById('epicDetailDescription');
        el.epicDetailReleaseVersion = document.getElementById('epicDetailReleaseVersion');
        el.editTicketBtn = document.getElementById('editTicketBtn');
        el.ticketReporterInput = document.getElementById('ticketReporter');
        el.ticketAssigneeInput = document.getElementById('ticketAssignee');
        el.ticketStoryPointsInput = document.getElementById('ticketStoryPoints');
        el.ticketDueDateInput = document.getElementById('ticketDueDate');
        el.ticketFixVersionInput = document.getElementById('ticketFixVersion');
        el.ticketResolutionContainer = document.getElementById('ticketResolutionContainer');
        el.ticketResolutionInput = document.getElementById('ticketResolution');
        el.ticketDetailDescription = document.getElementById('ticketDetailDescription');
        el.ticketDetailAssignee = document.getElementById('ticketDetailAssignee');
        el.ticketDetailReporter = document.getElementById('ticketDetailReporter');
        el.ticketDetailPriority = document.getElementById('ticketDetailPriority');
        el.ticketDetailDueDate = document.getElementById('ticketDetailDueDate');
        el.ticketDetailStoryPoints = document.getElementById('ticketDetailStoryPoints');
        el.ticketDetailType = document.getElementById('ticketDetailType');
        el.ticketDetailComponent = document.getElementById('ticketDetailComponent');
        el.ticketDetailFixVersion = document.getElementById('ticketDetailFixVersion');
        el.ticketDetailAffectedVersion = document.getElementById('ticketDetailAffectedVersion');
        el.ticketDetailResolution = document.getElementById('ticketDetailResolution');
        el.subtasksList = document.getElementById('subtasksList');
        el.addSubtaskForm = document.getElementById('addSubtaskForm');
        el.newSubtaskInput = document.getElementById('newSubtaskInput');
    }

    // ... (All other functions like getOptions, populateDropdown, openEpicModal, openTicketModal, _renderSubtasks, etc. remain exactly the same) ...
    // --- THIS IS A BIG SECTION OF UNCHANGED CODE. ALL THE RENDERING AND MODAL FUNCTIONS ARE THE SAME. ---
    // SCROLL PAST THIS TO THE `_setupEventListeners` AND `initialize` FUNCTIONS AT THE END.

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

    const closeEpicModal = () => el.epicModal.classList.add('hidden');
    const closeTicketModal = () => el.ticketModal.classList.add('hidden');
    const closeSettingsModal = () => el.settingsModal.classList.add('hidden');
    const closeTicketDetailModal = () => { _activeTicketIdForDetailModal = null; el.ticketDetailModal.classList.add('hidden'); }
    const closeEpicDetailModal = () => el.epicDetailModal.classList.add('hidden');
    
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
        populateDropdown(el.epicStatusSelect, ['To Do', 'In Progress', 'Done']);
        populateDropdown(el.epicPrioritySelect, options.priorities);
        populateDropdown(el.ticketStatusSelect, options.statuses);
        populateDropdown(el.ticketPrioritySelect, options.priorities);
        populateDropdown(el.ticketTypeSelect, options.types);
        populateDropdown(el.ticketComponentSelect, options.components, true);
        populateDropdown(el.ticketAffectedVersionSelect, releaseVersions, true);
        populateDropdown(el.ticketDetailStatusSelect, options.statuses);
    };

    const openEpicModal = (epicId = null) => {
        el.epicForm.reset();
        populateAllDropdowns();
        if (epicId) {
            const epic = AppStore.getDevEpics().find(e => e.id === epicId);
            if (!epic) return;
            el.epicModalTitle.textContent = 'Edit Epic';
            el.epicIdInput.value = epic.id;
            el.epicKeyInput.value = epic.key;
            el.epicKeyInput.disabled = true;
            el.epicTitleInput.value = epic.title;
            el.epicStatusSelect.value = epic.status;
            el.epicPrioritySelect.value = epic.priority;
            el.epicDescriptionInput.value = epic.description;
            el.epicReleaseVersionInput.value = epic.releaseVersion || '';
        } else {
            el.epicModalTitle.textContent = 'Create New Epic';
            el.epicIdInput.value = '';
            el.epicKeyInput.disabled = false;
        }
        el.epicModal.classList.remove('hidden');
    };

    const openTicketModal = (ticketId = null) => {
        el.ticketForm.reset();
        populateAllDropdowns();
        if (ticketId) {
            const ticket = AppStore.getDevTickets().find(t => t.id === ticketId);
            if (!ticket) return;
            el.ticketModalTitle.textContent = 'Edit Ticket';
            el.ticketIdInput.value = ticket.id;
            el.ticketEpicIdInput.value = ticket.epicId;
            el.ticketTitleInput.value = ticket.title;
            el.ticketStatusSelect.value = ticket.status;
            el.ticketPrioritySelect.value = ticket.priority;
            el.ticketTypeSelect.value = ticket.type;
            el.ticketComponentSelect.value = ticket.component;
            el.ticketDescriptionInput.value = ticket.description;
            el.ticketAffectedVersionSelect.value = ticket.affectedVersion || '';
            el.ticketReporterInput.value = ticket.reporter || '';
            el.ticketAssigneeInput.value = ticket.assignee || '';
            el.ticketStoryPointsInput.value = ticket.story_points || '';
            el.ticketDueDateInput.value = ticket.due_date || '';
            el.ticketFixVersionInput.value = ticket.fix_version || '';
            el.ticketResolutionInput.value = ticket.resolution || '';
        } else {
            el.ticketModalTitle.textContent = 'Create New Ticket';
            el.ticketIdInput.value = '';
            el.ticketEpicIdInput.value = _activeEpicId;
            el.ticketReporterInput.value = AppStore.getUserProfile().displayName || 'User';
        }
        const isDone = el.ticketStatusSelect.value === 'Done';
        el.ticketResolutionContainer.classList.toggle('hidden', !isDone);
        el.ticketModal.classList.remove('hidden');
    };
    
    const _renderTicketComments = (ticketId) => {
        el.commentsList.innerHTML = '';
        const comments = AppStore.getDevTicketComments().filter(c => c.ticketId === ticketId);
        if (comments.length === 0) {
            el.commentsList.innerHTML = '<p class="text-sm text-slate-500 italic">No comments yet.</p>';
            return;
        }
        comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'bg-slate-700/50 p-3 rounded-md group relative';
            commentDiv.innerHTML = `
                <div class="flex justify-between items-center text-xs text-slate-400 mb-1">
                    <strong>${comment.author || 'User'}</strong>
                    <span>${new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                <p class="text-slate-200 whitespace-pre-wrap">${comment.comment}</p>
                <button data-comment-id="${comment.id}" class="delete-comment-btn absolute top-1 right-1 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
            `;
            el.commentsList.appendChild(commentDiv);
        });
    }

    const _renderTicketHistory = (ticketId) => {
        el.ticketHistoryContainer.innerHTML = '';
        const history = AppStore.getDevTicketHistory().filter(h => h.ticketId === ticketId);
        if (history.length === 0) {
            el.ticketHistoryContainer.innerHTML = '<p class="italic">No history recorded.</p>';
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
            el.ticketHistoryContainer.appendChild(historyDiv);
        });
    }

    const _renderSubtasks = (ticketId) => {
        el.subtasksList.innerHTML = '';
        const subtasks = AppStore.getDevSubtasks().filter(s => s.ticketId === ticketId);
        
        const completedCount = subtasks.filter(s => s.completed).length;
        const totalCount = subtasks.length;
        
        const oldProgressBar = el.subtasksList.previousElementSibling;
        if(oldProgressBar && oldProgressBar.querySelector('.w-full.bg-slate-700')) {
             oldProgressBar.remove();
        }

        if (totalCount > 0) {
            const percentage = Math.round((completedCount / totalCount) * 100);
            const progressHtml = `
                <div class="mb-2">
                    <div class="flex justify-between text-xs text-slate-400">
                        <span>Progress</span>
                        <span>${completedCount} / ${totalCount}</span>
                    </div>
                    <div class="w-full bg-slate-700 rounded-full h-1.5">
                        <div class="bg-sky-500 h-1.5 rounded-full" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
            el.subtasksList.insertAdjacentHTML('beforebegin', progressHtml);
        }

        if (subtasks.length === 0) return;

        subtasks.forEach(subtask => {
            const subtaskDiv = document.createElement('div');
            subtaskDiv.className = 'flex items-center gap-3 group';
            subtaskDiv.innerHTML = `
                <input type="checkbox" data-subtask-id="${subtask.id}" ${subtask.completed ? 'checked' : ''} class="subtask-checkbox h-4 w-4 bg-slate-600 border-slate-500 text-sky-500 focus:ring-sky-500 rounded">
                <span class="flex-grow ${subtask.completed ? 'text-slate-500 line-through' : 'text-slate-200'}">${subtask.text}</span>
                <button data-subtask-id="${subtask.id}" class="delete-subtask-btn text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
            `;
            el.subtasksList.appendChild(subtaskDiv);
        });
    }

    const openTicketDetailModal = (ticketId) => {
        const ticket = AppStore.getDevTickets().find(t => t.id === ticketId);
        if (!ticket) return;

        _activeTicketIdForDetailModal = ticketId;
        populateAllDropdowns();

        el.ticketDetailKey.textContent = ticket.fullKey;
        el.ticketDetailTitle.textContent = ticket.title;
        el.ticketDetailStatusSelect.value = ticket.status;
        el.ticketDetailDescription.textContent = ticket.description || 'No description provided.';
        el.ticketDetailAssignee.textContent = ticket.assignee || 'Unassigned';
        el.ticketDetailReporter.textContent = ticket.reporter || 'N/A';
        el.ticketDetailPriority.textContent = ticket.priority;
        el.ticketDetailDueDate.textContent = ticket.due_date ? new Date(ticket.due_date).toLocaleDateString() : 'No Due Date';
        el.ticketDetailStoryPoints.textContent = ticket.story_points || 'Not Estimated';
        el.ticketDetailType.textContent = ticket.type;
        el.ticketDetailComponent.textContent = ticket.component || 'N/A';
        el.ticketDetailFixVersion.textContent = ticket.fix_version || 'Unscheduled';
        el.ticketDetailAffectedVersion.textContent = ticket.affectedVersion || 'N/A';
        el.ticketDetailResolution.textContent = ticket.resolution || 'Unresolved';

        _renderSubtasks(ticketId);
        _renderTicketComments(ticketId);
        _renderTicketHistory(ticketId);
        
        el.ticketHistoryContainer.classList.add('hidden');
        el.toggleHistoryLink.textContent = 'Show History';

        el.ticketDetailModal.classList.remove('hidden');
    };

    const openEpicDetailModal = (epicId) => {
        const epic = AppStore.getDevEpics().find(e => e.id === epicId);
        if (!epic) return;
        el.epicDetailKey.textContent = epic.key;
        el.epicDetailTitle.textContent = epic.title;
        el.epicDetailStatus.textContent = epic.status;
        el.epicDetailPriority.textContent = epic.priority;
        el.epicDetailReleaseVersion.textContent = epic.releaseVersion || 'Unscheduled';
        el.epicDetailDescription.textContent = epic.description || 'No description provided.';
        el.epicDetailModal.classList.remove('hidden');
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
        
        el.settingsContentTitle.textContent = `Manage ${title}`;
        el.optionsList.innerHTML = '';
        currentOptions.forEach(option => {
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center p-2 bg-slate-700 rounded-md';
            li.innerHTML = `<span>${option}</span><button data-option="${option}" class="delete-option-btn text-slate-400 hover:text-red-500">&times;</button>`;
            el.optionsList.appendChild(li);
        });
        const placeholderText = title.endsWith('s') ? `New ${title.slice(0, -1)}` : `New ${title}`;
        el.addOptionForm.querySelector('input').placeholder = placeholderText;
    };

    const setActiveSettingsCategory = (category) => {
        _activeSettingsCategory = category;
        el.settingsNav.querySelectorAll('.settings-nav-item').forEach(btn => {
            btn.classList.toggle('bg-slate-700', btn.dataset.type === category);
        });
        renderActiveSettingsContent();
    };

    const openSettingsModal = () => {
        setActiveSettingsCategory('statuses');
        el.settingsModal.classList.remove('hidden');
    };
    
    const renderTicketsList = () => {
        if (!el.ticketsList) return;
        el.ticketsList.innerHTML = '';
        
        let allTickets = AppStore.getDevTickets();
        let filteredTickets = [];

        if (_activeEpicId === 'all_issues') {
            el.currentEpicTitle.textContent = 'All Issues';
            el.currentEpicDescription.textContent = `Showing all tickets across all epics.`;
            el.newTicketBtn.disabled = true; // This is the bug fix
            filteredTickets = allTickets;
        } else if (_activeEpicId) {
            const activeEpic = AppStore.getDevEpics().find(e => e.id === _activeEpicId);
            if (!activeEpic) {
                _activeEpicId = 'all_issues';
                renderAll();
                return;
            }
            el.currentEpicTitle.textContent = activeEpic.title;
            el.currentEpicDescription.textContent = activeEpic.description || 'No description for this epic.';
            el.newTicketBtn.disabled = false; // This is the bug fix
            filteredTickets = allTickets.filter(t => t.epicId === _activeEpicId);
        } else {
            // This case handles the absolute initial state before any selection
            el.currentEpicTitle.textContent = 'Select an Epic';
            el.currentEpicDescription.textContent = 'Choose an epic from the left to view its tickets.';
            el.newTicketBtn.disabled = true; // This is the bug fix
            el.ticketsList.innerHTML = '<p class="text-center text-slate-500 pt-10">No epic selected.</p>';
            return;
        }

        if (_activeTicketFilter === 'open') {
            filteredTickets = filteredTickets.filter(t => t.status !== 'Done');
        } else if (_activeTicketFilter === 'done') {
            filteredTickets = filteredTickets.filter(t => t.status === 'Done');
        }
        
        if (_activeSearchTerm) {
            filteredTickets = filteredTickets.filter(t => t.title.toLowerCase().includes(_activeSearchTerm));
        }

        el.ticketFilterControls.querySelectorAll('.ticket-filter-btn').forEach(btn => {
            btn.classList.toggle('bg-sky-600', btn.dataset.filter === _activeTicketFilter);
            btn.classList.toggle('text-white', btn.dataset.filter === _activeTicketFilter);
        });
        
        filteredTickets.sort((a, b) => b.createdAt - a.createdAt);

        if (filteredTickets.length === 0) {
            el.ticketsList.innerHTML = `<p class="text-center text-slate-500 pt-10">${_activeSearchTerm ? 'No tickets match your search.' : 'No tickets match the current filter.'}</p>`;
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
            el.ticketsList.appendChild(ticketDiv);
        });
    };
    
    const renderEpicsList = () => {
        if (!el.epicsList) return;
        const epics = AppStore.getDevEpics().sort((a, b) => a.title.localeCompare(b.title));
        el.epicsList.innerHTML = '';
        
        el.allIssuesFilterBtn.classList.toggle('bg-purple-600/30', _activeEpicId === 'all_issues');

        epics.forEach(epic => {
            const epicDiv = document.createElement('div');
            const isActive = epic.id === _activeEpicId;
            epicDiv.className = `p-3 rounded-lg cursor-pointer group relative hover:bg-slate-700/70 ${isActive ? 'bg-purple-600/30 ring-1 ring-purple-500' : 'bg-slate-700/30'}`;
            
            const mainContent = document.createElement('div');
            mainContent.onclick = () => { _activeEpicId = epic.id; renderTicketsList(); renderEpicsList(); };

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
            controlsDiv.innerHTML = `<button data-epic-id="${epic.id}" class="view-epic-btn text-slate-400 hover:text-green-400 text-xs"><i class="fas fa-eye"></i></button><button data-epic-id="${epic.id}" class="edit-epic-btn text-slate-400 hover:text-sky-400 text-xs"><i class="fas fa-pencil-alt"></i></button>`;

            epicDiv.appendChild(mainContent);
            epicDiv.appendChild(controlsDiv);
            el.epicsList.appendChild(epicDiv);
        });

        el.epicsList.querySelectorAll('.view-epic-btn').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); openEpicDetailModal(Number(e.currentTarget.dataset.epicId)); }));
        el.epicsList.querySelectorAll('.edit-epic-btn').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); openEpicModal(Number(e.currentTarget.dataset.epicId)); }));
    };

    const renderAll = () => {
        renderEpicsList();
        renderTicketsList();
        populateAllDropdowns();
    };
    
    // ... (All event handler functions like handleEpicFormSubmit, handleTicketFormSubmit, etc. remain exactly the same) ...
    const handleEpicFormSubmit = async (e) => { e.preventDefault(); const epicData = { key: el.epicKeyInput.value, title: el.epicTitleInput.value, status: el.epicStatusSelect.value, priority: el.epicPrioritySelect.value, description: el.epicDescriptionInput.value, releaseVersion: el.epicReleaseVersionInput.value.trim() }; const id = Number(el.epicIdInput.value); let result; if (id) { result = await DevTrackerService.updateEpic(id, epicData); } else { result = await DevTrackerService.addEpic(epicData); } if (result) closeEpicModal(); };
    const handleTicketFormSubmit = async (e) => { 
        e.preventDefault(); 
        const ticketData = { 
            epicId: _activeEpicId,
            title: el.ticketTitleInput.value, 
            status: el.ticketStatusSelect.value,
            priority: el.ticketPrioritySelect.value, 
            type: el.ticketTypeSelect.value, 
            component: el.ticketComponentSelect.value, 
            description: el.ticketDescriptionInput.value, 
            affectedVersion: el.ticketAffectedVersionSelect.value,
            reporter: el.ticketReporterInput.value.trim(),
            assignee: el.ticketAssigneeInput.value.trim(),
            story_points: el.ticketStoryPointsInput.value ? Number(el.ticketStoryPointsInput.value) : null,
            due_date: el.ticketDueDateInput.value || null,
            fix_version: el.ticketFixVersionInput.value.trim(),
            resolution: el.ticketResolutionInput.value.trim(),
        }; 
        const id = Number(el.ticketIdInput.value); 
        if (id) { 
            await DevTrackerService.updateTicket(id, ticketData); 
        } else { 
            await DevTrackerService.addTicket(ticketData); 
        } 
        closeTicketModal(); 
    };
    const handleAddOption = async (e) => { e.preventDefault(); const input = e.target.querySelector('input'); const value = input.value.trim(); if (!value) return; if (_activeSettingsCategory === 'release_versions') { await DevTrackerService.addReleaseVersion(value); } else { const options = getOptions(); const currentCategoryOptions = options[_activeSettingsCategory]; if (!currentCategoryOptions.includes(value)) { currentCategoryOptions.push(value); await AppStore.setUserPreferences({ dev_tracker_options: options }); } } input.value = ''; };
    const handleAddComment = async (e) => { e.preventDefault(); const commentText = el.newCommentInput.value.trim(); if (commentText && _activeTicketIdForDetailModal) { await DevTrackerService.addComment(_activeTicketIdForDetailModal, commentText); el.newCommentInput.value = ''; } };
    const handleDeleteComment = async (e) => { const button = e.target.closest('.delete-comment-btn'); if (!button) return; const commentId = Number(button.dataset.commentId); if (confirm('Are you sure you want to delete this comment?')) { await DevTrackerService.deleteComment(_activeTicketIdForDetailModal, commentId); }};
    const handleStatusChange = async (e) => { const newStatus = e.target.value; if (newStatus && _activeTicketIdForDetailModal) { await DevTrackerService.updateTicketStatus(_activeTicketIdForDetailModal, newStatus); } };
    const handleToggleHistory = (e) => { e.preventDefault(); el.ticketHistoryContainer.classList.toggle('hidden'); e.target.textContent = el.ticketHistoryContainer.classList.contains('hidden') ? 'Show History' : 'Hide History'; };
    const handleAddSubtask = async (e) => {
        e.preventDefault();
        const text = el.newSubtaskInput.value.trim();
        if (text && _activeTicketIdForDetailModal) {
            await DevTrackerService.addSubtask(_activeTicketIdForDetailModal, text);
            el.newSubtaskInput.value = '';
        }
    };
    const handleSubtaskCheckboxChange = async (e) => {
        const checkbox = e.target;
        const subtaskId = Number(checkbox.dataset.subtaskId);
        const isChecked = checkbox.checked;
        await DevTrackerService.updateSubtask(subtaskId, { completed: isChecked });
    };
    const handleDeleteSubtask = async (e) => {
        const button = e.target.closest('.delete-subtask-btn');
        if (!button) return;
        const subtaskId = Number(button.dataset.subtaskId);
        if (confirm('Are you sure you want to delete this sub-task?')) {
            await DevTrackerService.deleteSubtask(subtaskId);
        }
    };
    
    // --- MODIFICATION: Simplified event listeners ---
    const _setupEventListeners = () => {
        el.newEpicBtn.addEventListener('click', () => openEpicModal());
        el.newTicketBtn.addEventListener('click', () => openTicketModal());
        el.settingsBtn.addEventListener('click', openSettingsModal);
        el.allIssuesFilterBtn.addEventListener('click', () => { _activeEpicId = 'all_issues'; renderAll(); });
        el.ticketFilterControls.addEventListener('click', (e) => { const button = e.target.closest('.ticket-filter-btn'); if (button) { _activeTicketFilter = button.dataset.filter; renderTicketsList(); }});
        el.ticketSearchInput.addEventListener('input', (e) => { _activeSearchTerm = e.target.value.toLowerCase(); renderTicketsList(); });
        el.cancelEpicBtn.addEventListener('click', closeEpicModal);
        el.epicForm.addEventListener('submit', handleEpicFormSubmit);
        el.cancelTicketBtn.addEventListener('click', closeTicketModal);
        el.ticketForm.addEventListener('submit', handleTicketFormSubmit);
        el.closeSettingsBtn.addEventListener('click', closeSettingsModal);
        el.closeTicketDetailBtn.addEventListener('click', closeTicketDetailModal);
        el.closeEpicDetailBtn.addEventListener('click', closeEpicDetailModal);
        el.settingsNav.addEventListener('click', (e) => { if (e.target.matches('.settings-nav-item')) setActiveSettingsCategory(e.target.dataset.type); });
        el.addOptionForm.addEventListener('submit', handleAddOption);
        el.addCommentForm.addEventListener('submit', handleAddComment);
        el.commentsList.addEventListener('click', handleDeleteComment);
        el.ticketDetailStatusSelect.addEventListener('change', handleStatusChange);
        el.toggleHistoryLink.addEventListener('click', handleToggleHistory);
        el.editTicketBtn.addEventListener('click', () => { if (_activeTicketIdForDetailModal) openTicketModal(_activeTicketIdForDetailModal) });
        el.ticketStatusSelect.addEventListener('change', () => { const isDone = el.ticketStatusSelect.value === 'Done'; el.ticketResolutionContainer.classList.toggle('hidden', !isDone); });
        el.addSubtaskForm.addEventListener('submit', handleAddSubtask);
        el.subtasksList.addEventListener('change', (e) => { if (e.target.matches('.subtask-checkbox')) handleSubtaskCheckboxChange(e); });
        el.subtasksList.addEventListener('click', (e) => { if(e.target.closest('.delete-subtask-btn')) handleDeleteSubtask(e); });

        // These listeners handle changes AFTER initial load
        EventBus.subscribe('devEpicsChanged', renderEpicsList);
        EventBus.subscribe('devTicketsChanged', renderTicketsList);
        EventBus.subscribe('devSubtasksChanged', () => { if (_activeTicketIdForDetailModal) _renderSubtasks(_activeTicketIdForDetailModal); });
        EventBus.subscribe('userPreferencesChanged', () => { renderActiveSettingsContent(); populateAllDropdowns(); });
        EventBus.subscribe('devReleaseVersionsChanged', () => { renderActiveSettingsContent(); populateAllDropdowns(); });
        EventBus.subscribe('devTicketCommentsChanged', () => { if(_activeTicketIdForDetailModal) _renderTicketComments(_activeTicketIdForDetailModal); });
        EventBus.subscribe('devTicketHistoryChanged', () => { if(_activeTicketIdForDetailModal) _renderTicketHistory(_activeTicketIdForDetailModal); });
    };

    // --- MODIFICATION: The 'initialize' function is now responsible for the first render ---
    return {
        initialize: () => {
            _getDOMElements();
            _setupEventListeners();
            // This is the critical fix: renderAll() is called here, AFTER the UI is initialized
            // and the data is confirmed to be loaded by the main script.
            renderAll(); 
            LoggingService.info('[DevTrackerUI] Initialized.');
        }
    };
})();

export { DevTrackerUI };