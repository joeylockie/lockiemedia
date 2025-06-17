// advertising_admin_main.js
// Main entry point for the Advertising Admin Panel.

import LoggingService from './loggingService.js';
import AdvertisingService from './advertisingService.js';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyC3jBnP7geSJOUbZxKZ1_1GpsQrR0fLEns",
  authDomain: "to-do-app-c4545.firebaseapp.com",
  projectId: "to-do-app-c4545",
  storageBucket: "to-do-app-c4545.firebasestorage.app",
  messagingSenderId: "307995096020",
  appId: "1:307995096020:web:d03c5a96a74d27c9781c41",
  measurementId: "G-CY6V47WSNK"
};

// --- Module-level Firebase variables ---
let firebaseAuth;
let firestoreDB;

// --- DOM Element References ---
let adListContainer, adManagementForm, adFormTitle, adFormId, adFormSubmitBtn, adFormCancelBtn;
let adIdInput, adTitleInput, adContentInput, adImageUrlInput, adUrlInput, adStartDateInput, adEndDateInput;
let statsTotalAds, statsTotalViews, statsTotalClicks, statsOverallCtr;
let refreshAdListBtn;
let currentUser;

// --- Page State ---
let allAds = []; // Cache the list of ads to avoid re-fetching constantly

// --- Core Initialization ---
async function initializeApp() {
    const functionName = 'initializeApp (AdAdminMain)';
    try {
        if (typeof firebase === 'undefined' || typeof firebase.initializeApp !== 'function') {
            throw new Error("Firebase SDK not loaded. Ensure firebase/*-compat.js scripts are loaded with 'defer'.");
        }
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        
        firebaseAuth = firebase.auth();
        firestoreDB = firebase.firestore();
        
        AdvertisingService.initialize(firestoreDB);
        
        return true;
    } catch (error) {
        LoggingService.critical('[AdAdmin] Critical error during Firebase initialization.', error, { functionName });
        showAdminMessage('CRITICAL: Could not initialize Firebase. App will not function.', 'error', 10000);
        return false;
    }
}


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
    }, duration);
}

function renderAdList(stats) {
    if (!adListContainer) return;

    adListContainer.innerHTML = ''; 
    if (!allAds || allAds.length === 0) {
        adListContainer.innerHTML = '<p class="text-slate-400 p-4">No ads found in Firestore. The initial ads may need to be seeded.</p>';
        return;
    }
    
    const table = document.createElement('table');
    table.className = 'admin-table';
    table.innerHTML = `<thead><tr><th>Ad Title</th><th>ID</th><th>Views</th><th>Clicks</th><th>CTR</th><th>Actions</th></tr></thead><tbody></tbody>`;
    const tbody = table.querySelector('tbody');

    allAds.forEach(ad => {
        const adStats = stats[ad.id] || { views: 0, clicks: 0 };
        const ctr = adStats.views > 0 ? (adStats.clicks / adStats.views) * 100 : 0;
        const row = tbody.insertRow();
        row.innerHTML = `<td>${ad.title}</td><td class="font-mono text-xs">${ad.id}</td><td>${adStats.views}</td><td>${adStats.clicks}</td><td>${ctr.toFixed(2)}%</td>`;
        const actionsCell = row.insertCell();
        actionsCell.className = 'space-x-2';
        
        const triggerBtn = document.createElement('button');
        triggerBtn.innerHTML = '<i class="fas fa-bullhorn"></i>';
        triggerBtn.title = 'Trigger Ad';
        triggerBtn.className = 'text-sky-400 hover:text-sky-300 transition-colors';
        triggerBtn.onclick = () => handleTriggerAd(ad.id);
        
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
        editBtn.title = 'Edit Ad';
        editBtn.className = 'text-amber-400 hover:text-amber-300 transition-colors';
        editBtn.onclick = () => handleEditAd(ad);

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.title = 'Delete Ad';
        deleteBtn.className = 'text-red-500 hover:text-red-400 transition-colors';
        deleteBtn.onclick = () => handleDeleteAd(ad.id, ad.title);

        actionsCell.appendChild(triggerBtn);
        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(deleteBtn);
    });
    adListContainer.appendChild(table);
}

function renderAnalyticsDashboard(stats) {
    let totalViews = 0, totalClicks = 0;
    for (const adId in stats) {
        totalViews += stats[adId].views || 0;
        totalClicks += stats[adId].clicks || 0;
    }
    const overallCtr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
    if(statsTotalAds) statsTotalAds.textContent = allAds.length;
    if(statsTotalViews) statsTotalViews.textContent = totalViews;
    if(statsTotalClicks) statsTotalClicks.textContent = totalClicks;
    if(statsOverallCtr) statsOverallCtr.textContent = `${overallCtr.toFixed(2)}%`;
}

// --- NEW REFRESH FUNCTION ---
// Refreshes only the list of ads, not the stats (which are now live).
async function handleManualRefresh() {
    showAdminMessage('Refreshing ad list...', 'info', 1500);
    allAds = await AdvertisingService.getAds();
    // After getting new ads, we need to re-render, but we don't have the latest stats here.
    // The live listener will handle the next stats update, but to make the refresh feel instant,
    // we can re-render with the last known stats, or do a one-time fetch if we implement it.
    // For now, let's just wait for the live listener to re-render.
    // A better way is to trigger a re-render using the last known stats from the stream.
    // This part of the logic can be improved later if needed. For now, the live stream is the main source of truth.
}

async function handleAdFormSubmit(event) {
    event.preventDefault();
    showAdminMessage('Save/Update functionality is not yet implemented in this service.', 'info');
    resetAdForm();
}

function handleEditAd(ad) {
    adFormTitle.textContent = 'Edit Ad';
    adFormId.value = ad.id; 
    adIdInput.value = ad.id;
    adIdInput.readOnly = true; 
    adTitleInput.value = ad.title;
    adContentInput.value = ad.content;
    adImageUrlInput.value = ad.imageUrl;
    adUrlInput.value = ad.adUrl;
    adStartDateInput.value = ad.startDate || '';
    adEndDateInput.value = ad.endDate || '';
    adFormSubmitBtn.textContent = 'Update Ad';
    adFormCancelBtn.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function handleDeleteAd(adId, adTitle) {
    if (confirm(`Are you sure you want to delete the ad "${adTitle}"? This cannot be undone.`)) {
        showAdminMessage(`Delete functionality for "${adTitle}" is not yet implemented.`, 'info');
    }
}

function resetAdForm() {
    adManagementForm.reset();
    adFormId.value = '';
    adIdInput.readOnly = false;
    adFormTitle.textContent = 'Create New Ad';
    adFormSubmitBtn.textContent = 'Save Ad';
    adFormCancelBtn.classList.add('hidden');
}

function handleTriggerAd(adId) {
    if (!adId) {
        showAdminMessage('Could not trigger ad, ID is missing.', 'error');
        return;
    }
    const adminEmail = currentUser ? currentUser.email : 'unknown_admin';
    AdvertisingService.triggerAd(adId, adminEmail); 
    showAdminMessage(`Ad trigger for ID "${adId}" has been sent!`, 'success');
}


document.addEventListener('DOMContentLoaded', async () => {
    const functionName = 'DOMContentLoaded (AdAdminMain)';
    
    // --- Get DOM Elements ---
    adListContainer = document.getElementById('adListContainer');
    adManagementForm = document.getElementById('adManagementForm');
    adFormTitle = document.getElementById('adFormTitle');
    adFormId = document.getElementById('adFormId');
    adFormSubmitBtn = document.getElementById('adFormSubmitBtn');
    adFormCancelBtn = document.getElementById('adFormCancelBtn');
    adIdInput = document.getElementById('adIdInput');
    adTitleInput = document.getElementById('adTitleInput');
    adContentInput = document.getElementById('adContentInput');
    adImageUrlInput = document.getElementById('adImageUrlInput');
    adUrlInput = document.getElementById('adUrlInput');
    adStartDateInput = document.getElementById('adStartDateInput');
    adEndDateInput = document.getElementById('adEndDateInput');
    statsTotalAds = document.getElementById('statsTotalAds');
    statsTotalViews = document.getElementById('statsTotalViews');
    statsTotalClicks = document.getElementById('statsTotalClicks');
    statsOverallCtr = document.getElementById('statsOverallCtr');
    refreshAdListBtn = document.getElementById('refreshAdListBtn');

    // --- Initialize Firebase and then check Auth ---
    const firebaseReady = await initializeApp();
    if (!firebaseReady) return;

    firebaseAuth.onAuthStateChanged(async user => {
        if (user) {
            currentUser = user;
            LoggingService.info('[AdAdmin] Admin user authenticated.', { functionName: 'onAuthStateChanged', email: user.email });
            
            await AdvertisingService.seedInitialAds();
            
            // Fetch the static list of ads once
            allAds = await AdvertisingService.getAds();

            // --- Set up the LIVE analytics stream ---
            AdvertisingService.streamAnalytics((stats) => {
                LoggingService.debug('[AdAdmin] Live analytics update received.', { stats });
                renderAnalyticsDashboard(stats); // Pass ads from the cached variable
                renderAdList(stats);
            });

        } else {
            currentUser = null;
            LoggingService.warn('[AdAdmin] No user authenticated. Redirecting to main admin login.', { functionName: 'onAuthStateChanged' });
            window.location.href = 'admin.html';
        }
    });

    if (adManagementForm) adManagementForm.addEventListener('submit', handleAdFormSubmit);
    if (adFormCancelBtn) adFormCancelBtn.addEventListener('click', resetAdForm);
    if (refreshAdListBtn) refreshAdListBtn.addEventListener('click', handleManualRefresh);

    LoggingService.info('[AdAdmin] Advertising Admin Panel Initialized.', { functionName });
});