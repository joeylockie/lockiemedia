// admin_main.js - Main entry point for the Admin Panel
// REFACTORED FOR SELF-HOSTED BACKEND (STATIC)

import LoggingService from './loggingService.js';
import AdminUI from './adminUI.js';

// --- DOM Elements ---
let adminContent;
let adminUserDisplay;

// --- Sidebar Navigation Logic ---
function initializeSidebarNavigation() {
    const sidebarLinks = document.querySelectorAll('.admin-sidebar-link');
    const contentSections = document.querySelectorAll('.admin-content-section');
    const currentSectionTitleEl = document.getElementById('currentSectionTitle');

    function setActiveAdminSection(sectionId, sectionTitle) {
        sidebarLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === sectionId);
        });
        contentSections.forEach(section => {
            section.classList.toggle('active', section.id === `${sectionId}Section`);
        });
        if (currentSectionTitleEl) {
            currentSectionTitleEl.textContent = sectionTitle;
        }
    }

    sidebarLinks.forEach(link => {
        // Only add listeners to internal navigation links
        if(link.getAttribute('href') === '#') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.dataset.section;
                const sectionTitle = link.querySelector('span')?.textContent || 'Admin Section';
                setActiveAdminSection(sectionId, sectionTitle);
            });
        }
    });
    
    // Set the initial section on load
    setActiveAdminSection('overview', 'Overview');
}


// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    const functionName = 'DOMContentLoaded (AdminMain)';
    LoggingService.info('[AdminMain] DOMContentLoaded. Initializing static Admin Panel...', { functionName });

    adminContent = document.getElementById('adminContent');
    adminUserDisplay = document.getElementById('adminUserDisplay');

    if (!adminContent) {
        LoggingService.critical('[AdminMain] Essential admin content container is missing.', new Error("DOMElementMissing"), { functionName });
        return;
    }
    
    // No more login, show the content immediately.
    adminContent.classList.remove('hidden');
    if (adminUserDisplay) adminUserDisplay.textContent = `Admin`;

    initializeSidebarNavigation();

    // Since we have no backend for this, we will display placeholder messages.
    const featureFlagsListDiv = document.getElementById('featureFlagsList');
    if(featureFlagsListDiv) featureFlagsListDiv.innerHTML = '<p class="text-slate-400">Feature Flag management is not available in self-hosted mode.</p>';
    
    const errorLogsListDiv = document.getElementById('errorLogsList');
    if(errorLogsListDiv) errorLogsListDiv.innerHTML = '<p class="text-slate-400">Error Log viewing is not available in self-hosted mode.</p>';

    const userListDiv = document.getElementById('userList');
    if(userListDiv) userListDiv.innerHTML = '<p class="text-slate-400">User Management is not available in self-hosted mode.</p>';

    // Update stats with placeholder text
    AdminUI.updateOverviewStats({ 
        totalUsers: "N/A", 
        errorsToday: "N/A", 
        activeFeatures: "N/A",
        dau: "N/A",
        newSignups: "N/A",
        avgLoadTime: "N/A",
        totalItems: "N/A",
        apiErrorRate: "N/A"
    });

    LoggingService.info('[AdminMain] Static Admin Panel Initialization Complete.', { functionName });
});