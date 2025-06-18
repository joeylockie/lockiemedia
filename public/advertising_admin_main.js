// advertising_admin_main.js
// Main entry point for the Advertising Admin Panel.
// REFACTORED FOR SELF-HOSTED BACKEND (STATIC)

import LoggingService from './loggingService.js';
import AdvertisingService from './advertisingService.js';

// --- DOM Element References ---
let adListContainer, adManagementForm, adFormTitle, adFormId, adFormSubmitBtn, adFormCancelBtn;
let adIdInput, adTitleInput, adContentInput, adImageUrlInput, adUrlInput, adStartDateInput, adEndDateInput;
let statsTotalAds;

// --- Page State ---
let allAds = [];

// --- UI Rendering ---

function showAdminMessage(message, type = 'info', duration = 3000) {
    const adminMessageBox = document.getElementById('adminMessageBox');
    if (!adminMessageBox) return;
    const messageEl = document.createElement('div');
    messageEl.className = `admin-message ${type}`;
    messageEl.textContent = message;
    adminMessageBox.appendChild(messageEl);
    requestAnimationFrame(() => messageEl.classList.add('show'));
    setTimeout(() => {
        messageEl.classList.remove('show');
        setTimeout(() => { if (messageEl.parentNode) messageEl.remove(); }, 500);
    }, 500);
}

function renderAdList() {
    if (!adListContainer) return;

    adListContainer.innerHTML = ''; 
    if (!allAds || allAds.length === 0) {
        adListContainer.innerHTML = '<p class="text-slate-400 p-4">No ads found.</p>';
        return;
    }
    
    statsTotalAds.textContent = allAds.length;
    
    const table = document.createElement('table');
    table.className = 'admin-table';
    table.innerHTML = `<thead><tr><th>Ad Title</th><th>ID</th><th>Actions</th></tr></thead><tbody></tbody>`;
    const tbody = table.querySelector('tbody');

    allAds.forEach(ad => {
        const row = tbody.insertRow();
        row.innerHTML = `<td>${ad.title}</td><td class="font-mono text-xs">${ad.id}</td>`;
        const actionsCell = row.insertCell();
        actionsCell.className = 'space-x-2';
        
        const triggerBtn = document.createElement('button');
        triggerBtn.innerHTML = '<i class="fas fa-bullhorn"></i>';
        triggerBtn.title = 'Trigger Ad';
        triggerBtn.className = 'text-sky-400 hover:text-sky-300 transition-colors';
        triggerBtn.onclick = () => handleTriggerAd(ad.id);
        
        actionsCell.appendChild(triggerBtn);
    });
    adListContainer.appendChild(table);
}

// --- Event Handlers ---

function handleAdFormSubmit(event) {
    event.preventDefault();
    showAdminMessage('Saving/updating ads is disabled in this version.', 'info');
}

function handleTriggerAd(adId) {
    if (!adId) {
        showAdminMessage('Could not trigger ad, ID is missing.', 'error');
        return;
    }
    AdvertisingService.triggerAd(adId); 
    showAdminMessage(`Ad trigger for ID "${adId}" has been sent! Check another page like the Dashboard.`, 'success');
}


// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    const functionName = 'DOMContentLoaded (AdAdminMain)';
    
    // Get DOM Elements
    adListContainer = document.getElementById('adListContainer');
    adManagementForm = document.getElementById('adManagementForm');
    adFormTitle = document.getElementById('adFormTitle');
    adFormSubmitBtn = document.getElementById('adFormSubmitBtn');
    statsTotalAds = document.getElementById('statsTotalAds');

    // No auth check needed, just initialize the service and render.
    AdvertisingService.initialize();

    allAds = await AdvertisingService.getAds();
    renderAdList();

    if (adManagementForm) adManagementForm.addEventListener('submit', handleAdFormSubmit);

    LoggingService.info('[AdAdmin] Static Advertising Admin Panel Initialized.', { functionName });
});