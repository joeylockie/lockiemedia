// feature_user_accounts.js
// Manages User Accounts Feature using Firebase Authentication.

import { isFeatureEnabled } from './featureFlagService.js';
import LoggingService from './loggingService.js';
import { showMessage } from './ui_rendering.js'; // Assuming showMessage is available
// NEW: Import AppStore to trigger data load/save operations
import AppStore from './store.js';

// Firebase configuration (from user input)
const firebaseConfig = {
  apiKey: "AIzaSyC3jBnP7geSJOUbZxKZ1_1GpsQrR0fLEns",
  authDomain: "to-do-app-c4545.firebaseapp.com",
  projectId: "to-do-app-c4545",
  storageBucket: "to-do-app-c4545.firebasestorage.app",
  messagingSenderId: "307995096020",
  appId: "1:307995096020:web:d03c5a96a74d27c9781c41",
  measurementId: "G-CY6V47WSNK"
};

// Firebase app, auth, and db instances
let firebaseApp;
let firebaseAuth;
let firestoreDB; // <<< ADD THIS LINE >>>

// DOM Elements for auth UI
let authModal;
let authModalDialog;
let authFormsContainer; // Inside authModal
let settingsSignOutBtn; 
let signUpForm, signInForm;
let signUpEmailInput, signUpPasswordInput, signInEmailInput, signInPasswordInput;


/**
 * Opens the Authentication Modal.
 */
function openAuthModal() {
    const functionName = 'openAuthModal (UserAccountsFeature)';
    if (!authModal || !authModalDialog) {
        LoggingService.warn('[UserAccountsFeature] Auth modal elements not found for opening.', { functionName });
        return;
    }
    if (!isFeatureEnabled('userAccounts')) {
        LoggingService.debug('[UserAccountsFeature] User accounts feature disabled, not opening auth modal.', { functionName });
        return;
    }
    authModal.classList.remove('hidden');
    setTimeout(() => {
        authModalDialog.classList.remove('scale-95', 'opacity-0');
        authModalDialog.classList.add('scale-100', 'opacity-100');
        if (signInEmailInput && !signInEmailInput.value) {
            signInEmailInput.focus();
        } else if (signUpEmailInput) {
            signUpEmailInput.focus();
        }
    }, 10);
    LoggingService.info('[UserAccountsFeature] Auth modal opened.', { functionName });
}

/**
 * Closes the Authentication Modal.
 */
function closeAuthModal() {
    const functionName = 'closeAuthModal (UserAccountsFeature)';
    if (!authModal || !authModalDialog) {
        LoggingService.warn('[UserAccountsFeature] Auth modal elements not found for closing.', { functionName });
        return;
    }
    authModalDialog.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        authModal.classList.add('hidden');
        LoggingService.info('[UserAccountsFeature] Auth modal closed.', { functionName });
    }, 200);
}


/**
 * Initializes the User Accounts Feature and Firebase.
 */
function initialize() {
    const functionName = 'initialize (UserAccountsFeature)';
    LoggingService.info('[UserAccountsFeature] Initializing...', { functionName });

    try {
        if (!firebase.apps.length) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
            LoggingService.info('[UserAccountsFeature] Firebase app initialized.', { functionName });
        } else {
            firebaseApp = firebase.app();
            LoggingService.info('[UserAccountsFeature] Firebase app already initialized. Using existing instance.', { functionName });
        }
        firebaseAuth = firebase.auth();
        LoggingService.info('[UserAccountsFeature] Firebase Auth instance obtained.', { functionName });

        // <<< ADD THIS SECTION TO INITIALIZE FIRESTORE >>>
        firestoreDB = firebase.firestore();
        LoggingService.info('[UserAccountsFeature] Firebase Firestore instance obtained.', { functionName });
        // <<< END OF FIRESTORE INITIALIZATION >>>

        // Get DOM elements
        authModal = document.getElementById('authModal');
        authModalDialog = document.getElementById('authModalDialog');
        authFormsContainer = document.getElementById('authFormsContainer'); 
        settingsSignOutBtn = document.getElementById('settingsSignOutBtn'); 
        signUpForm = document.getElementById('signUpForm');
        signInForm = document.getElementById('signInForm');
        signUpEmailInput = document.getElementById('signUpEmail');
        signUpPasswordInput = document.getElementById('signUpPassword');
        signInEmailInput = document.getElementById('signInEmail');
        signInPasswordInput = document.getElementById('signInPassword');

        firebaseAuth.onAuthStateChanged(async user => { // <<< MAKE THIS ASYNC >>>
            const authStateFunctionName = 'onAuthStateChanged_callback';
            if (user) {
                LoggingService.info(`[UserAccountsFeature] User signed in: ${user.email}`, { functionName: authStateFunctionName, userEmail: user.email, userId: user.uid });
                closeAuthModal();
                // <<< ADD THIS: Trigger data loading from Firestore >>>
                if (AppStore.loadDataFromFirestore) {
                    LoggingService.info(`[UserAccountsFeature] Attempting to load data for user: ${user.uid}`, { functionName: authStateFunctionName });
                    await AppStore.loadDataFromFirestore(user.uid);
                } else {
                    LoggingService.warn('[UserAccountsFeature] AppStore.loadDataFromFirestore not available.', { functionName: authStateFunctionName });
                }
                // <<< END OF DATA LOADING TRIGGER >>>
            } else {
                LoggingService.info('[UserAccountsFeature] User signed out or no user.', { functionName: authStateFunctionName });
                // <<< ADD THIS: Handle data saving/clearing on sign out >>>
                // For now, we'll just clear local store. Actual saving before sign-out can be more complex.
                if (AppStore.clearLocalStoreAndReloadDefaults) {
                     LoggingService.info(`[UserAccountsFeature] User signed out. Clearing local store and reloading defaults.`, { functionName: authStateFunctionName });
                    AppStore.clearLocalStoreAndReloadDefaults();
                } else {
                    LoggingService.warn('[UserAccountsFeature] AppStore.clearLocalStoreAndReloadDefaults not available.', { functionName: authStateFunctionName });
                }
                // <<< END OF SIGN OUT DATA HANDLING >>>
                if (isFeatureEnabled('userAccounts')) {
                    openAuthModal();
                } else {
                    closeAuthModal();
                }
            }
            updateUIVisibility(); 
        });
        LoggingService.info('[UserAccountsFeature] Auth state change listener set up.', { functionName });

    } catch (error) {
        LoggingService.critical('[UserAccountsFeature] CRITICAL: Error initializing Firebase or Auth listeners:', error, { functionName });
        if (typeof showMessage === 'function') showMessage('Error initializing user accounts system. Please try refreshing.', 'error');
    }
    LoggingService.info('[UserAccountsFeature] Initialized.', { functionName });
}

/**
 * Updates the visibility of User Accounts UI elements based on the feature flag and auth state.
 */
function updateUIVisibility() {
    const functionName = 'updateUIVisibility (UserAccountsFeature)';
    if (typeof isFeatureEnabled !== 'function' || !firebaseAuth) {
        LoggingService.error("[UserAccountsFeature] Dependencies missing for UI visibility update.", new Error("DependencyMissing"), { functionName });
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('userAccounts');
    const currentUser = firebaseAuth.currentUser;

    LoggingService.debug(`[UserAccountsFeature] Updating UI visibility. Feature: ${isActuallyEnabled}, User: ${currentUser ? currentUser.email : 'None'}.`, { functionName });

    if (authModal) {
        if (!isActuallyEnabled) {
            authModal.classList.add('hidden'); 
        }
    }
    
    if (settingsSignOutBtn) {
        settingsSignOutBtn.classList.toggle('hidden', !(isActuallyEnabled && currentUser));
    }
    
    document.querySelectorAll('.user-accounts-feature-element').forEach(el => {
        if (el.id === 'authModal' && !isActuallyEnabled) {
            el.classList.add('hidden');
        } else if (el.id !== 'authModal') { 
            el.classList.toggle('hidden', !isActuallyEnabled);
        }
    });

    LoggingService.info(`[UserAccountsFeature] UI Visibility updated. Feature: ${isActuallyEnabled}, User: ${currentUser ? currentUser.email : 'None'}`, { functionName });
}


/**
 * Handles user sign-up.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 */
async function handleSignUp(email, password) {
    const functionName = 'handleSignUp';
    if (!firebaseAuth) {
        LoggingService.error("[UserAccountsFeature] Firebase Auth not initialized for sign up.", new Error("FirebaseAuthMissing"), { functionName });
        if (typeof showMessage === 'function') showMessage('User account system not ready. Please try again.', 'error');
        return;
    }
    LoggingService.info(`[UserAccountsFeature] Attempting sign up for email: ${email}`, { functionName, email });
    try {
        const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
        LoggingService.info(`[UserAccountsFeature] User signed up successfully: ${userCredential.user.email}`, { functionName, userEmail: userCredential.user.email });
        // onAuthStateChanged will handle data loading and closing the modal.
        if (typeof showMessage === 'function') showMessage('Account created successfully! You are now signed in.', 'success');
        if(signUpEmailInput) signUpEmailInput.value = '';
        if(signUpPasswordInput) signUpPasswordInput.value = '';

    } catch (error) {
        LoggingService.error('[UserAccountsFeature] Error signing up:', error, { functionName, email });
        if (typeof showMessage === 'function') showMessage(`Error creating account: ${error.message}`, 'error');
    }
}

/**
 * Handles user sign-in.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 */
async function handleSignIn(email, password) {
    const functionName = 'handleSignIn';
     if (!firebaseAuth) {
        LoggingService.error("[UserAccountsFeature] Firebase Auth not initialized for sign in.", new Error("FirebaseAuthMissing"), { functionName });
        if (typeof showMessage === 'function') showMessage('User account system not ready. Please try again.', 'error');
        return;
    }
    LoggingService.info(`[UserAccountsFeature] Attempting sign in for email: ${email}`, { functionName, email });
    try {
        const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
        LoggingService.info(`[UserAccountsFeature] User signed in successfully: ${userCredential.user.email}`, { functionName, userEmail: userCredential.user.email });
        // onAuthStateChanged will handle data loading and closing the modal.
        if (typeof showMessage === 'function') showMessage('Signed in successfully!', 'success');
        if(signInEmailInput) signInEmailInput.value = '';
        if(signInPasswordInput) signInPasswordInput.value = '';
    } catch (error) {
        LoggingService.error('[UserAccountsFeature] Error signing in:', error, { functionName, email });
        if (typeof showMessage === 'function') showMessage(`Error signing in: ${error.message}`, 'error');
    }
}

/**
 * Handles user sign-out.
 */
async function handleSignOut() {
    const functionName = 'handleSignOut';
    if (!firebaseAuth) {
        LoggingService.error("[UserAccountsFeature] Firebase Auth not initialized for sign out.", new Error("FirebaseAuthMissing"), { functionName });
        if (typeof showMessage === 'function') showMessage('User account system not ready. Please try again.', 'error');
        return;
    }
    LoggingService.info('[UserAccountsFeature] Attempting sign out.', { functionName });
    try {
        // Optionally, save current local data to Firestore *before* signing out if it's dirty.
        // This is a more complex step we can add later if needed.
        // For now, onAuthStateChanged handles clearing local data after sign-out.

        await firebaseAuth.signOut(); 
        LoggingService.info('[UserAccountsFeature] User signed out successfully.', { functionName });
        if (typeof showMessage === 'function') showMessage('Signed out successfully.', 'success');
        
        const settingsModalEl = document.getElementById('settingsModal');
        const closeSettingsModalFn = window.ModalInteractions?.closeSettingsModal || (typeof closeSettingsModal === 'function' ? closeSettingsModal : null); 
        if (settingsModalEl && !settingsModalEl.classList.contains('hidden') && closeSettingsModalFn) {
            closeSettingsModalFn();
        }

    } catch (error) {
        LoggingService.error('[UserAccountsFeature] Error signing out:', error, { functionName });
        if (typeof showMessage === 'function') showMessage(`Error signing out: ${error.message}`, 'error');
    }
}


// Getter for the Firestore DB instance, to be used by other services
export function getFirestoreInstance() {
    if (!firestoreDB) {
        LoggingService.warn('[UserAccountsFeature] Firestore instance requested before initialization.', { functionName: 'getFirestoreInstance' });
        // Attempt to initialize it if firebase is available, though this is not ideal
        if (firebase && typeof firebase.firestore === 'function') {
            firestoreDB = firebase.firestore();
            LoggingService.info('[UserAccountsFeature] Firestore instance obtained on-demand in getFirestoreInstance.', { functionName: 'getFirestoreInstance' });
            return firestoreDB;
        }
        return null;
    }
    return firestoreDB;
}

export const UserAccountsFeature = {
    initialize,
    updateUIVisibility,
    handleSignUp,
    handleSignIn,
    handleSignOut,
    openAuthModal,
    closeAuthModal,
    getFirestoreInstance // <<< EXPORT THIS FUNCTION >>>
};

LoggingService.debug("feature_user_accounts.js loaded as ES6 module.", { module: 'feature_user_accounts' });