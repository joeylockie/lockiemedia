// admin_main.js - Main entry point for the Admin Panel

import LoggingService, { initializeFirestoreLogging } from './loggingService.js'; // Import the initializer
import EventBus from './eventBus.js';
import { loadFeatureFlags, getAllFeatureFlags, isFeatureEnabled } from './featureFlagService.js';
import AdminUI from './adminUI.js';
import AdminDataService from './adminDataService.js'; // Import AdminDataService

// Firebase SDKs are loaded via <script> tags in admin.html

const firebaseConfig = {
    apiKey: "AIzaSyC3jBnP7geSJOUbZxKZ1_1GpsQrR0fLEns",
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


// --- Firebase Initialization and Auth State ---
let firebaseApp;
let firebaseAuth;
let firestoreDB;

async function initializeFirebase() {
    const functionName = 'initializeFirebase (AdminMain)';
    try {
        if (typeof firebase === 'undefined' || typeof firebase.initializeApp !== 'function') {
            LoggingService.critical('[AdminMain] Firebase SDK not loaded. Admin panel cannot function.', new Error('Firebase SDK missing'));
            AdminUI.showAdminMessage('Critical: Firebase SDK not loaded!', 'error', 10000);
            return false;
        }
        if (!firebase.apps.length) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
            LoggingService.info('[AdminMain] Firebase app initialized for Admin Panel.', { functionName });
        } else {
            firebaseApp = firebase.app();
            LoggingService.info('[AdminMain] Using existing Firebase app instance for Admin Panel.', { functionName });
        }

        if (typeof firebase.auth !== 'function' || typeof firebase.firestore !== 'function') {
            LoggingService.critical('[AdminMain] Firebase Auth or Firestore SDK not loaded.', new Error('Firebase Auth/Firestore SDK missing'));
            AdminUI.showAdminMessage('Critical: Firebase services missing!', 'error', 10000);
            return false;
        }
        firebaseAuth = firebase.auth();
        firestoreDB = firebase.firestore();
        AdminDataService.initializeAdminDataService(firestoreDB); // Initialize AdminDataService with DB instance
        initializeFirestoreLogging(firestoreDB); // Also initialize for admin panel's logging context
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
        // **** MODIFY THIS LINE ****
        if (docSnap.exists) { // Use .exists as a property for compat SDK
        // **** END OF MODIFICATION ****
            const userData = docSnap.data();
            if (userData && userData.profile && userData.profile.role === 'admin') {
                LoggingService.info(`[AdminMain] User ${user.email} has 'admin' role.`, { functionName, email: user.email });
                return true;
            } else {
                LoggingService.warn(`[AdminMain] User ${user.email} does not have 'admin' role. Profile data:`, { functionName, email: user.email, profile: userData ? userData.profile : 'No profile field' });
                return false;
            }
        } else {
            LoggingService.warn(`[AdminMain] User profile document not found for ${user.email}. Cannot verify admin role.`, { functionName, email: user.email });
            return false;
        }
    } catch (error) {
        LoggingService.error(`[AdminMain] Error checking user role for ${user.email}.`, error, { functionName, email: user.email });
        return false;
    }
}

function handleAuthStateChanged(user) {
    const functionName = 'handleAuthStateChanged (AdminMain)';
    if (user) {
        LoggingService.info(`[AdminMain] User signed in: ${user.email}`, { functionName, email: user.email });
        checkUserRole(user).then(isAdmin => {
            if (isAdmin) {
                adminAuthModal.classList.add('hidden');
                adminContent.classList.remove('hidden');
                if (adminUserDisplay) adminUserDisplay.textContent = `Admin: ${user.email}`;
                loadAdminDashboardData();
            } else {
                LoggingService.warn(`[AdminMain] User ${user.email} is not an admin. Signing out.`, { functionName, email: user.email });
                AdminUI.showAdminMessage('Access Denied: You do not have admin privileges.', 'error');
                if (firebaseAuth) firebaseAuth.signOut();
            }
        });
    } else {
        LoggingService.info('[AdminMain] No user signed in. Displaying login modal.', { functionName });
        adminAuthModal.classList.remove('hidden');
        adminContent.classList.add('hidden');
        if (adminUserDisplay) adminUserDisplay.textContent = '';
    }
}

function handleAdminLogin(event) {
    event.preventDefault();
    const functionName = 'handleAdminLogin (AdminMain)';
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    LoggingService.info(`[AdminMain] Admin login attempt for: ${email}`, { functionName });
    if (!firebaseAuth) {
        LoggingService.error('[AdminMain] Firebase Auth not initialized. Cannot log in.', new Error("FirebaseAuthMissing"));
        AdminUI.showAdminMessage('Login service not ready. Please refresh.', 'error');
        return;
    }
    firebaseAuth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            LoggingService.info(`[AdminMain] Admin sign-in successful for: ${userCredential.user.email}`, { functionName });
        })
        .catch((error) => {
            LoggingService.error('[AdminMain] Admin login failed.', error, { functionName, email: email });
            AdminUI.showAdminMessage(`Login Failed: ${error.message}`, 'error');
        });
}

function handleAdminSignOut() {
    const functionName = 'handleAdminSignOut (AdminMain)';
    LoggingService.info('[AdminMain] Admin sign-out initiated.', { functionName });
    if (!firebaseAuth) {
        LoggingService.error('[AdminMain] Firebase Auth not initialized. Cannot sign out.', new Error("FirebaseAuthMissing"));
        AdminUI.showAdminMessage('Sign out service not ready.', 'error');
        return;
    }
    firebaseAuth.signOut()
        .then(() => {
            LoggingService.info('[AdminMain] Admin signed out successfully.', { functionName });
        })
        .catch((error) => {
            LoggingService.error('[AdminMain] Error during admin sign-out.', error, { functionName });
            AdminUI.showAdminMessage(`Sign Out Failed: ${error.message}`, 'error');
        });
}

// --- Data Loading and Display Functions ---
async function loadAdminDashboardData() {
    LoggingService.info('[AdminMain] Loading admin dashboard data...', { functionName: 'loadAdminDashboardData' });
    callDisplayFeatureFlags();
    await callFetchAndDisplayErrorLogs();
    await callFetchAndDisplayUserList(); // Placeholder for user list
    await callFetchAndDisplayOverviewStats(); // Placeholder for overview stats
}

function callDisplayFeatureFlags() {
    const functionName = 'callDisplayFeatureFlags (AdminMain)';
    try {
        const flags = getAllFeatureFlags();
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

    if (errorLogsListDiv) errorLogsListDiv.innerHTML = '<p class="text-gray-500">Fetching error logs...</p>';
    else LoggingService.warn("[AdminMain] errorLogsListDiv not found for displaying logs.", {functionName});


    try {
        const logsData = await AdminDataService.fetchErrorLogs(); // Use the service
        AdminUI.displayErrorLogsInTable(logsData, 'errorLogsList');
        LoggingService.info(`[AdminMain] Fetched and displayed ${logsData.length} error logs via AdminDataService.`, { functionName });
    } catch (error) {
        LoggingService.error('[AdminMain] Error fetching/displaying error logs via AdminDataService.', error, { functionName });
        if (errorLogsListDiv) errorLogsListDiv.innerHTML = `<p class="text-red-500">Failed to load error logs: ${error.message}</p>`;
        if (errorsTodayStatEl) errorsTodayStatEl.textContent = "Error";
    }
}

async function callFetchAndDisplayUserList() {
    const functionName = 'callFetchAndDisplayUserList (AdminMain)';
    try {
        const users = await AdminDataService.fetchUserList();
        AdminUI.displayUserList(users, 'userList');
        // Update totalUsersStat here once implemented in AdminDataService
    } catch (error) {
        LoggingService.error('[AdminMain] Error fetching/displaying user list.', error, {functionName});
        AdminUI.displayUserList([], 'userList'); // Show empty or error state
    }
}

async function callFetchAndDisplayOverviewStats() {
    const functionName = 'callFetchAndDisplayOverviewStats (AdminMain)';
    try {
        const stats = await AdminDataService.fetchOverviewStats(); // This is a placeholder
        AdminUI.updateOverviewStats(stats); // Update relevant parts of the overview
    } catch (error) {
        LoggingService.error('[AdminMain] Error fetching/displaying overview stats.', error, {functionName});
        AdminUI.updateOverviewStats({ totalUsers: "Error" }); // Show error state
    }
}


// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    LoggingService.info('[AdminMain] DOMContentLoaded. Initializing Admin Panel...');

    adminAuthModal = document.getElementById('adminAuthModal');
    adminLoginForm = document.getElementById('adminLoginForm');
    adminContent = document.getElementById('adminContent');
    adminSignOutButton = document.getElementById('adminSignOutButton');
    adminUserDisplay = document.getElementById('adminUserDisplay');
    refreshErrorLogsButton = document.getElementById('refreshErrorLogsButton');

    if (!adminAuthModal || !adminLoginForm || !adminContent || !adminSignOutButton) {
        LoggingService.critical('[AdminMain] Essential admin panel DOM elements are missing. Panel may not function.', new Error('Admin DOM elements missing'));
        AdminUI.showAdminMessage('Critical error: Admin panel UI is broken.', 'error', 10000);
        return;
    }

    const firebaseReady = await initializeFirebase(); // This now also initializes AdminDataService
    if (!firebaseReady) {
        LoggingService.critical('[AdminMain] Firebase initialization failed. Admin panel will not load further.');
        return;
    }

    try {
        await loadFeatureFlags();
        LoggingService.initializeLogLevel();
        LoggingService.info('[AdminMain] Feature flags loaded and log level set for admin panel.');
    } catch (error) {
        LoggingService.error('[AdminMain] Failed to load feature flags for admin panel.', error);
    }

    adminLoginForm.addEventListener('submit', handleAdminLogin);
    adminSignOutButton.addEventListener('click', handleAdminSignOut);
    if (refreshErrorLogsButton) refreshErrorLogsButton.addEventListener('click', callFetchAndDisplayErrorLogs);

    if (firebaseAuth) {
        firebaseAuth.onAuthStateChanged(handleAuthStateChanged);
    } else {
        LoggingService.critical('[AdminMain] Firebase Auth service not available after init. Cannot monitor auth state.');
        AdminUI.showAdminMessage('Authentication service failed. Please refresh.', 'error', 10000);
    }

    LoggingService.info('[AdminMain] Admin Panel Initialized.');
});