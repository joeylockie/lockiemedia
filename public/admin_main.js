// admin_main.js - Main entry point for the Admin Panel

import LoggingService, { initializeFirestoreLogging, LOG_LEVELS } from './loggingService.js'; // Import the initializer and LOG_LEVELS
import EventBus from '../eventBus.js';
import { loadFeatureFlags, getAllFeatureFlags, isFeatureEnabled } from '../featureFlagService.js';
import AdminUI from './adminUI.js';
import AdminDataService from '../adminDataService.js';

// Firebase SDKs are loaded via <script> tags in admin.html

const firebaseConfig = {
    apiKey: "AIzaSyC3jBnP7geSJOUbZxKZ1_1GpsQrR0fLEns", // Replace with your actual API key if different or use environment variables
    authDomain: "to-do-app-c4545.firebaseapp.com",
    projectId: "to-do-app-c4545",
    storageBucket: "to-do-app-c4545.firebasestorage.app",
    messagingSenderId: "307995096020",
    appId: "1:307995096020:web:d03c5a96a74d27c9781c41",
    measurementId: "G-CY6V47WSNK"
};

// DOM Elements
let adminAuthModal;
let adminLoginForm;
let adminContent;
let adminSignOutButton;
let adminUserDisplay;
let refreshErrorLogsButton;
let sendTestErrorButton; // New button

// --- Firebase Initialization and Auth State ---
let firebaseApp;
let firebaseAuth;
let firestoreDB;

async function initializeFirebase() {
    const functionName = 'initializeFirebase (AdminMain)';
    try {
        if (typeof firebase === 'undefined' || typeof firebase.initializeApp !== 'function') {
            LoggingService.critical('[AdminMain] Firebase SDK not loaded. Admin panel cannot function.', new Error('Firebase SDK missing'), { functionName });
            AdminUI.showAdminMessage('Critical: Firebase SDK not loaded!', 'error', 10000);
            return false;
        }
        if (!firebase.apps.length) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
            LoggingService.info('[AdminMain] Firebase app initialized for Admin Panel.', { functionName, projectId: firebaseConfig.projectId });
        } else {
            firebaseApp = firebase.app();
            LoggingService.info('[AdminMain] Using existing Firebase app instance for Admin Panel.', { functionName, projectId: firebase.app().options.projectId });
        }

        if (typeof firebase.auth !== 'function' || typeof firebase.firestore !== 'function') {
            LoggingService.critical('[AdminMain] Firebase Auth or Firestore SDK not loaded.', new Error('Firebase Auth/Firestore SDK missing'), { functionName });
            AdminUI.showAdminMessage('Critical: Firebase services missing!', 'error', 10000);
            return false;
        }
        firebaseAuth = firebase.auth();
        firestoreDB = firebase.firestore();
        
        // Initialize LoggingService with Firestore instance *before* other services that might use it
        initializeFirestoreLogging(firestoreDB); 
        LoggingService.info('[AdminMain] Firestore logging for LoggingService initialized.', { functionName });

        AdminDataService.initializeAdminDataService(firestoreDB); // Initialize AdminDataService with DB instance
        LoggingService.info('[AdminMain] Firebase Auth, Firestore, and AdminDataService initialized.', { functionName });
        return true;
    } catch (error) {
        LoggingService.critical('[AdminMain] Error initializing Firebase for Admin Panel.', error, { functionName });
        AdminUI.showAdminMessage(`Error initializing Firebase: ${error.message}`, 'error', 10000);
        return false;
    }
}

async function checkUserRole(user) {
    const functionName = 'checkUserRole (AdminMain)';
    if (!user || !firestoreDB) {
        LoggingService.warn('[AdminMain] User or FirestoreDB not available for role check.', { functionName, hasUser: !!user, hasFirestore: !!firestoreDB });
        return false;
    }

    try {
        const userProfileDocRef = firestoreDB.collection('users').doc(user.uid).collection('appData').doc('userSpecificData');
        const docSnap = await userProfileDocRef.get();

        if (docSnap.exists) { 
            const userData = docSnap.data();
            if (userData && userData.profile && userData.profile.role === 'admin') {
                LoggingService.info(`[AdminMain] User ${user.email} has 'admin' role. Access granted.`, { functionName, email: user.email, userId: user.uid });
                return true;
            } else {
                LoggingService.warn(`[AdminMain] User ${user.email} does not have 'admin' role. Access denied. Profile data:`, { functionName, email: user.email, userId: user.uid, profileData: (userData && userData.profile) ? userData.profile : 'Profile field missing or no admin role' });
                return false;
            }
        } else {
            LoggingService.warn(`[AdminMain] User profile document not found for ${user.email} (UID: ${user.uid}). Cannot verify admin role.`, { functionName, email: user.email, userId: user.uid });
            return false;
        }
    } catch (error) {
        LoggingService.error(`[AdminMain] Error checking user role for ${user.email} (UID: ${user.uid}).`, error, { functionName, email: user.email, userId: user.uid });
        return false;
    }
}

function handleAuthStateChanged(user) {
    const functionName = 'handleAuthStateChanged (AdminMain)';
    if (user) {
        LoggingService.info(`[AdminMain] Auth state changed: User signed in. Email: ${user.email}, UID: ${user.uid}`, { functionName, email: user.email, userId: user.uid });
        checkUserRole(user).then(isAdmin => {
            if (isAdmin) {
                adminAuthModal.classList.add('hidden');
                adminContent.classList.remove('hidden');
                if (adminUserDisplay) adminUserDisplay.textContent = `Admin: ${user.email}`;
                LoggingService.info(`[AdminMain] Admin access confirmed for ${user.email}. Loading dashboard.`, { functionName, email: user.email });
                loadAdminDashboardData(); // This function loads data into the sections
                 // Restore active section after data is loaded and UI is ready
                const lastSection = localStorage.getItem('adminActiveSection') || 'overview';
                const lastTitle = localStorage.getItem('adminActiveSectionTitle') || 'Overview';
                // Call the global setActiveSection if it's defined by the inline script
                if (typeof window.setActiveAdminSection === 'function') {
                    window.setActiveAdminSection(lastSection, lastTitle);
                } else {
                    // Fallback or initial setup if inline script hasn't run or function isn't global
                    // This part might be redundant if the inline script in admin.html handles it robustly on its own.
                    const sidebarLinks = document.querySelectorAll('.admin-sidebar-link');
                    const contentSections = document.querySelectorAll('.admin-content-section');
                    const currentSectionTitleEl = document.getElementById('currentSectionTitle');
                    sidebarLinks.forEach(link => {
                        link.classList.toggle('active', link.dataset.section === lastSection);
                    });
                    contentSections.forEach(section => {
                        section.classList.toggle('active', section.id === `${lastSection}Section`);
                    });
                    if (currentSectionTitleEl) {
                        currentSectionTitleEl.textContent = lastTitle;
                    }
                }


            } else {
                LoggingService.warn(`[AdminMain] User ${user.email} is NOT an admin. Forcing sign out from admin panel.`, { functionName, email: user.email });
                AdminUI.showAdminMessage('Access Denied: You do not have admin privileges for this panel.', 'error', 6000);
                if (firebaseAuth) firebaseAuth.signOut(); 
            }
        });
    } else {
        LoggingService.info('[AdminMain] Auth state changed: No user signed in. Displaying login modal.', { functionName });
        adminAuthModal.classList.remove('hidden');
        adminContent.classList.add('hidden');
        if (adminUserDisplay) adminUserDisplay.textContent = '';
    }
}

function handleAdminLogin(event) {
    event.preventDefault();
    const functionName = 'handleAdminLogin (AdminMain)';
    const emailInput = document.getElementById('adminEmail');
    const passwordInput = document.getElementById('adminPassword');
    const email = emailInput ? emailInput.value : '';
    const password = passwordInput ? passwordInput.value : '';

    LoggingService.info(`[AdminMain] Admin login attempt initiated for email: ${email}`, { functionName, email });
    if (!firebaseAuth) {
        LoggingService.error('[AdminMain] Firebase Auth not initialized. Cannot process login.', new Error("FirebaseAuthMissing"), { functionName });
        AdminUI.showAdminMessage('Login service not ready. Please refresh the page.', 'error');
        return;
    }
    firebaseAuth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            LoggingService.info(`[AdminMain] Admin sign-in successful via form for: ${userCredential.user.email}, UID: ${userCredential.user.uid}`, { functionName, email: userCredential.user.email, userId: userCredential.user.uid });
            // AuthStateChanged will handle UI update and role check
        })
        .catch((error) => {
            LoggingService.error('[AdminMain] Admin login failed.', error, { functionName, email: email, errorCode: error.code, errorMessage: error.message });
            AdminUI.showAdminMessage(`Login Failed: ${error.message}`, 'error');
        });
}

function handleAdminSignOut() {
    const functionName = 'handleAdminSignOut (AdminMain)';
    LoggingService.info('[AdminMain] Admin sign-out initiated.', { functionName });
    if (!firebaseAuth) {
        LoggingService.error('[AdminMain] Firebase Auth not initialized. Cannot process sign out.', new Error("FirebaseAuthMissing"),{ functionName });
        AdminUI.showAdminMessage('Sign out service not ready.', 'error');
        return;
    }
    firebaseAuth.signOut()
        .then(() => {
            LoggingService.info('[AdminMain] Admin signed out successfully through button click.', { functionName });
            // Redirect to the index page upon successful sign-out.
            window.location.href = 'index.html';
        })
        .catch((error) => {
            LoggingService.error('[AdminMain] Error during admin sign-out.', error, { functionName, errorCode: error.code, errorMessage: error.message });
            AdminUI.showAdminMessage(`Sign Out Failed: ${error.message}`, 'error');
        });
}

// --- Test Error Logging Function ---
function handleSendTestError() {
    const functionName = 'handleSendTestError (AdminMain)';
    LoggingService.info('[AdminMain] "Send Test Error" button clicked.', { functionName });
    AdminUI.showAdminMessage('Sending test error & critical logs to Firestore...', 'info', 3000);

    try {
        // Test ERROR log
        LoggingService.error(
            'This is a test ERROR log from the Admin Panel.',
            new Error('SimulatedErrorObject: Something went slightly wrong!'),
            {
                functionName: 'handleSendTestError',
                testCategory: 'AdminPanelErrorTest',
                errorCode: 'ADMIN_TEST_E_001',
                additionalInfo: {
                    timestampClient: new Date().toISOString(),
                    trigger: 'TestErrorButton'
                }
            }
        );

        // Test CRITICAL log
        LoggingService.critical(
            'This is a test CRITICAL log from the Admin Panel.',
            new RangeError('SimulatedCriticalError: A critical parameter was out of range!'),
            {
                functionName: 'handleSendTestError',
                testCategory: 'AdminPanelCriticalTest',
                errorCode: 'ADMIN_TEST_C_002',
                severity: 'High',
                component: 'AdminTestModule',
                recoveryAttempted: false,
                details: {
                    clientInfo: {
                        browser: navigator.userAgentData ? navigator.userAgentData.brands.map(b => `${b.brand} v${b.version}`).join(', ') : 'N/A',
                        platform: navigator.userAgentData ? navigator.userAgentData.platform : 'N/A',
                        language: navigator.language
                    },
                    simulatedPayload: { value1: 123, value2: "test_string" }
                }
            }
        );
        AdminUI.showAdminMessage('Test logs sent. Check Firestore `app_errors` collection.', 'success', 5000);
    } catch (e) {
        LoggingService.critical('[AdminMain] Unexpected error WHILE trying to send test logs.', e, { functionName });
        AdminUI.showAdminMessage('Failed to send test logs. Check console.', 'error', 5000);
    }
}


// --- Data Loading and Display Functions ---
async function loadAdminDashboardData() {
    const functionName = 'loadAdminDashboardData (AdminMain)';
    LoggingService.info('[AdminMain] Loading admin dashboard data...', { functionName });
    callDisplayFeatureFlags(); 
    await callFetchAndDisplayErrorLogs();
    await callFetchAndDisplayUserList(); 
    await callFetchAndDisplayOverviewStats();
    await callFetchAndDisplayApiErrorCount();
    LoggingService.info('[AdminMain] Admin dashboard data loading process completed.', { functionName });
}

function callDisplayFeatureFlags() {
    const functionName = 'callDisplayFeatureFlags (AdminMain)';
    try {
        const flags = getAllFeatureFlags(); 
        LoggingService.debug(`[AdminMain] Displaying ${Object.keys(flags).length} feature flags.`, { functionName, flagCount: Object.keys(flags).length });
        AdminUI.displayFeatureFlagsInTable(flags, 'featureFlagsList');
    } catch (error) {
        LoggingService.error('[AdminMain] Error preparing or displaying feature flags.', error, { functionName });
        const featureFlagsListDiv = document.getElementById('featureFlagsList');
        if (featureFlagsListDiv) featureFlagsListDiv.innerHTML = '<p class="text-red-500">Error loading feature flags data.</p>';
        const activeFeaturesStatEl = document.getElementById('activeFeaturesStat');
        if(activeFeaturesStatEl) activeFeaturesStatEl.textContent = "Error";
    }
}

async function callFetchAndDisplayErrorLogs() {
    const functionName = 'callFetchAndDisplayErrorLogs (AdminMain)';
    const errorLogsListDiv = document.getElementById('errorLogsList');
    const errorsTodayStatEl = document.getElementById('errorsTodayStat');

    if (errorLogsListDiv) errorLogsListDiv.innerHTML = '<p class="text-gray-500 text-sm italic">Fetching error logs from Firestore...</p>';
    else LoggingService.warn("[AdminMain] errorLogsListDiv not found for displaying logs.", {functionName});

    try {
        const logsData = await AdminDataService.fetchErrorLogs(); 
        AdminUI.displayErrorLogsInTable(logsData, 'errorLogsList');
        LoggingService.info(`[AdminMain] Fetched and displayed ${logsData.length} error logs.`, { functionName, count: logsData.length });
    } catch (error) {
        LoggingService.error('[AdminMain] Error fetching/displaying error logs.', error, { functionName });
        if (errorLogsListDiv) errorLogsListDiv.innerHTML = `<p class="text-red-500">Failed to load error logs: ${error.message}</p>`;
        if (errorsTodayStatEl) errorsTodayStatEl.textContent = "Error";
    }
}

async function callFetchAndDisplayUserList() {
    const functionName = 'callFetchAndDisplayUserList (AdminMain)';
    LoggingService.debug('[AdminMain] Fetching and displaying user list (placeholder).', { functionName });
    try {
        const users = await AdminDataService.fetchUserList(); 
        AdminUI.displayUserList(users, 'userList');
        const totalUsersStatEl = document.getElementById('totalUsersStat');
        if(totalUsersStatEl && users.length === 0) totalUsersStatEl.textContent = users.length.toString() + (AdminDataService.fetchUserList.toString().includes("Placeholder") ? " (Dev)" : "");

    } catch (error) {
        LoggingService.error('[AdminMain] Error fetching/displaying user list (placeholder).', error, {functionName});
        AdminUI.displayUserList([], 'userList'); 
    }
}

async function callFetchAndDisplayOverviewStats() {
    const functionName = 'callFetchAndDisplayOverviewStats (AdminMain)';
    LoggingService.debug('[AdminMain] Fetching and displaying overview stats (placeholder).', { functionName });
    try {
        const stats = await AdminDataService.fetchOverviewStats(); 
        AdminUI.updateOverviewStats(stats); 
    } catch (error) {
        LoggingService.error('[AdminMain] Error fetching/displaying overview stats (placeholder).', error, {functionName});
        AdminUI.updateOverviewStats({ totalUsers: "Error" }); 
    }
}

async function callFetchAndDisplayApiErrorCount() {
    const functionName = 'callFetchAndDisplayApiErrorCount (AdminMain)';
    LoggingService.debug('[AdminMain] Fetching and displaying API error count.', { functionName });
    const apiErrorRateStatEl = document.getElementById('apiErrorRateStat');

    try {
        const errorCount = await AdminDataService.fetchErrorCountLastHour();
        if (apiErrorRateStatEl) {
            apiErrorRateStatEl.textContent = errorCount.toString();
        } else {
             LoggingService.warn('[AdminMain] apiErrorRateStat element not found.', { functionName });
        }
    } catch (error) {
        LoggingService.error('[AdminMain] Error fetching or displaying API error count.', error, { functionName });
        if (apiErrorRateStatEl) {
            apiErrorRateStatEl.textContent = "Error";
        }
        AdminUI.showAdminMessage('Failed to load API Error count. Check console.', 'error');
    }
}


// --- Sidebar Navigation Logic (moved from inline script for better organization) ---
function initializeSidebarNavigation() {
    const sidebarLinks = document.querySelectorAll('.admin-sidebar-link');
    const contentSections = document.querySelectorAll('.admin-content-section');
    const currentSectionTitleEl = document.getElementById('currentSectionTitle');

    function setActiveAdminSection(sectionId, sectionTitle) { // Renamed to avoid conflict if inline script is still there
        sidebarLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === sectionId);
        });
        contentSections.forEach(section => {
            section.classList.toggle('active', section.id === `${sectionId}Section`);
        });
        if (currentSectionTitleEl) {
            currentSectionTitleEl.textContent = sectionTitle;
        }
        localStorage.setItem('adminActiveSection', sectionId);
        localStorage.setItem('adminActiveSectionTitle', sectionTitle);
    }
    // Make it globally accessible IF NEEDED by onAuthStateChanged, or pass as callback
    window.setActiveAdminSection = setActiveAdminSection;


    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.dataset.section;
            // Ensure span exists and has text content before trying to access it
            const spanElement = link.querySelector('span');
            const sectionTitle = spanElement ? spanElement.textContent : 'Admin Section'; // Default title
            setActiveAdminSection(sectionId, sectionTitle);
        });
    });
}


// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    const functionName = 'DOMContentLoaded (AdminMain)';
    LoggingService.info('[AdminMain] DOMContentLoaded. Initializing Admin Panel...', { functionName });

    adminAuthModal = document.getElementById('adminAuthModal');
    adminLoginForm = document.getElementById('adminLoginForm');
    adminContent = document.getElementById('adminContent');
    adminSignOutButton = document.getElementById('adminSignOutButton');
    adminUserDisplay = document.getElementById('adminUserDisplay');
    refreshErrorLogsButton = document.getElementById('refreshErrorLogsButton');
    sendTestErrorButton = document.getElementById('sendTestErrorButton'); 

    if (!adminAuthModal || !adminLoginForm || !adminContent || !adminSignOutButton) {
        const errorMsg = 'Essential admin panel DOM elements for auth/content are missing.';
        LoggingService.critical(`[AdminMain] ${errorMsg}`, new Error(errorMsg),{ functionName, missingElements: { adminAuthModal: !!adminAuthModal, adminLoginForm: !!adminLoginForm, adminContent: !!adminContent, adminSignOutButton: !!adminSignOutButton }});
        // AdminUI might not be ready here if this critical part fails.
        // A simple alert might be necessary or a pre-UI error display div.
        alert('Critical error: Admin panel UI is broken. Please check console.');
        return;
    }
    if (!refreshErrorLogsButton) LoggingService.warn('[AdminMain] Refresh error logs button not found.', {functionName});
    if (!sendTestErrorButton) LoggingService.warn('[AdminMain] Send test error button not found.', {functionName});


    const firebaseReady = await initializeFirebase(); 
    if (!firebaseReady) {
        LoggingService.critical('[AdminMain] Firebase initialization failed. Admin panel will not load further.', new Error("FirebaseInitFailed"), { functionName });
        return;
    }

    try {
        await loadFeatureFlags(); 
        LoggingService.info('[AdminMain] Feature flags loaded for admin panel.', { functionName });
        LoggingService.initializeLogLevel(); 
        LoggingService.info(`[AdminMain] Admin panel log level set to: ${LoggingService.getCurrentLevelName()} based on feature flags.`, { functionName });

    } catch (error) {
        LoggingService.error('[AdminMain] Failed to load feature flags for admin panel. Using defaults.', error, { functionName });
    }
    
    initializeSidebarNavigation(); // Initialize sidebar click listeners

    adminLoginForm.addEventListener('submit', handleAdminLogin);
    adminSignOutButton.addEventListener('click', handleAdminSignOut);
    if (refreshErrorLogsButton) refreshErrorLogsButton.addEventListener('click', callFetchAndDisplayErrorLogs);
    if (sendTestErrorButton) sendTestErrorButton.addEventListener('click', handleSendTestError); 

    if (firebaseAuth) {
        firebaseAuth.onAuthStateChanged(handleAuthStateChanged);
        LoggingService.info('[AdminMain] Firebase onAuthStateChanged listener attached.', { functionName });
    } else {
        LoggingService.critical('[AdminMain] Firebase Auth service not available after init. Cannot monitor auth state.', new Error("FirebaseAuthMissingPostInit"), { functionName });
        AdminUI.showAdminMessage('Authentication service failed. Please refresh.', 'error', 10000);
    }

    LoggingService.info('[AdminMain] Admin Panel Initialization Sequence Complete.', { functionName });
});