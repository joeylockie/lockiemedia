// feature_user_accounts.js
// Manages User Accounts Feature using Firebase Authentication.

import { isFeatureEnabled } from './featureFlagService.js';
import LoggingService from './loggingService.js';
import { showMessage } from './ui_rendering.js'; // Assuming showMessage is available

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

// Firebase app and auth instances
let firebaseApp;
let firebaseAuth;

// DOM Elements for auth UI
let authModal;
let authModalDialog;
// let userStatusContainer; // REMOVED - No longer a separate container in the header
// let userEmailDisplay; // REMOVED - No longer a separate display in the header
let authFormsContainer; // Inside authModal
let settingsSignOutBtn; // MODIFIED: Reference to the sign out button in settings
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

        // Get DOM elements
        authModal = document.getElementById('authModal');
        authModalDialog = document.getElementById('authModalDialog');
        authFormsContainer = document.getElementById('authFormsContainer'); // Inside authModal
        settingsSignOutBtn = document.getElementById('settingsSignOutBtn'); // MODIFIED: Get the new button
        signUpForm = document.getElementById('signUpForm');
        signInForm = document.getElementById('signInForm');
        signUpEmailInput = document.getElementById('signUpEmail');
        signUpPasswordInput = document.getElementById('signUpPassword');
        signInEmailInput = document.getElementById('signInEmail');
        signInPasswordInput = document.getElementById('signInPassword');

        firebaseAuth.onAuthStateChanged(user => {
            const authStateFunctionName = 'onAuthStateChanged_callback';
            if (user) {
                LoggingService.info(`[UserAccountsFeature] User signed in: ${user.email}`, { functionName: authStateFunctionName, userEmail: user.email });
                closeAuthModal(); 
            } else {
                LoggingService.info('[UserAccountsFeature] User signed out or no user.', { functionName: authStateFunctionName });
                if (isFeatureEnabled('userAccounts')) {
                    openAuthModal();
                } else {
                    closeAuthModal();
                }
            }
            updateUIVisibility(); // Update UI based on new state
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

    // Auth Modal visibility (main container)
    if (authModal) {
        if (!isActuallyEnabled) {
            authModal.classList.add('hidden'); // Ensure modal is hidden if feature is off
        } else {
            // If feature is ON, modal visibility is controlled by onAuthStateChanged (open if no user, close if user)
            // This function doesn't need to directly toggle authModal here based on currentUser
            // as onAuthStateChanged handles that primary logic.
        }
    }
    
    // Sign Out button in Settings Modal
    if (settingsSignOutBtn) {
        settingsSignOutBtn.classList.toggle('hidden', !(isActuallyEnabled && currentUser));
    }
    
    // Generic class for other elements specifically tagged for this feature.
    // This ensures that if the feature is globally turned off, all related elements are hidden.
    document.querySelectorAll('.user-accounts-feature-element').forEach(el => {
         // If the element is the authModal itself, its visibility is primarily handled by open/closeAuthModal.
         // However, if the feature is disabled, it should definitely be hidden.
        if (el.id === 'authModal' && !isActuallyEnabled) {
            el.classList.add('hidden');
        } else if (el.id !== 'authModal') { // For other elements like the settingsSignOutBtn
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
        if (typeof showMessage === 'function') showMessage('Account created successfully! You are now signed in.', 'success');
        // onAuthStateChanged will call closeAuthModal.
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
        if (typeof showMessage === 'function') showMessage('Signed in successfully!', 'success');
        // onAuthStateChanged will call closeAuthModal.
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
        await firebaseAuth.signOut(); // This will trigger onAuthStateChanged
        LoggingService.info('[UserAccountsFeature] User signed out successfully.', { functionName });
        if (typeof showMessage === 'function') showMessage('Signed out successfully.', 'success');
        // onAuthStateChanged will call openAuthModal if feature is enabled.
        // Ensure settings modal is closed if it was open
        const settingsModalEl = document.getElementById('settingsModal');
        const closeSettingsModalFn = window.ModalInteractions?.closeSettingsModal || (typeof closeSettingsModal === 'function' ? closeSettingsModal : null); // Access through ModalInteractions if modularized
        if (settingsModalEl && !settingsModalEl.classList.contains('hidden') && closeSettingsModalFn) {
            closeSettingsModalFn();
        }

    } catch (error) {
        LoggingService.error('[UserAccountsFeature] Error signing out:', error, { functionName });
        if (typeof showMessage === 'function') showMessage(`Error signing out: ${error.message}`, 'error');
    }
}


export const UserAccountsFeature = {
    initialize,
    updateUIVisibility,
    handleSignUp,
    handleSignIn,
    handleSignOut,
    openAuthModal,
    closeAuthModal
};

LoggingService.debug("feature_user_accounts.js loaded as ES6 module.", { module: 'feature_user_accounts' });