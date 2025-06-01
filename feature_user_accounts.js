// feature_user_accounts.js
// Manages User Accounts Feature using Firebase Authentication.

import { isFeatureEnabled } from './featureFlagService.js';
import LoggingService from './loggingService.js';
import AppStore from './store.js';
import EventBus from './eventBus.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3jBnP7geSJOUbZxKZ1_1GpsQrR0fLEns", // Keep your actual API key
  authDomain: "to-do-app-c4545.firebaseapp.com",
  projectId: "to-do-app-c4545",
  storageBucket: "to-do-app-c4545.firebasestorage.app",
  messagingSenderId: "307995096020",
  appId: "1:307995096020:web:d03c5a96a74d27c9781c41",
  measurementId: "G-CY6V47WSNK"
};

let firebaseApp;
let firebaseAuth;
let firestoreDB;

// DOM Elements
let authModal;
let authModalDialog;
// ... (other DOM elements remain the same)
let settingsSignOutBtn;
let signUpForm, signInForm;
let signUpEmailInput, signUpPasswordInput, signInEmailInput, signInPasswordInput;


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

function initialize() {
    const functionName = 'initialize (UserAccountsFeature)';
    LoggingService.info('[UserAccountsFeature] Initializing...', { functionName });

    if (typeof firebase === 'undefined' || typeof firebase.initializeApp !== 'function') {
        LoggingService.critical('[UserAccountsFeature] CRITICAL: Firebase SDK not loaded.', new Error('FirebaseNotLoaded'), { functionName });
        EventBus.publish('displayUserMessage', { text: 'Core authentication system failed to load. Please refresh.', type: 'error' });
        return;
    }

    try {
        if (!firebase.apps.length) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
            LoggingService.info('[UserAccountsFeature] Firebase app initialized.', { functionName });
        } else {
            firebaseApp = firebase.app();
            LoggingService.info('[UserAccountsFeature] Firebase app already initialized. Using existing instance.', { functionName });
        }
        
        if (typeof firebase.auth !== 'function') {
            LoggingService.critical('[UserAccountsFeature] CRITICAL: Firebase Auth SDK not loaded.', new Error('FirebaseAuthNotLoaded'), { functionName });
            return;
        }
        firebaseAuth = firebase.auth();
        LoggingService.info('[UserAccountsFeature] Firebase Auth instance obtained.', { functionName });

        if (typeof firebase.firestore !== 'function') {
            LoggingService.critical('[UserAccountsFeature] CRITICAL: Firebase Firestore SDK not loaded.', new Error('FirebaseFirestoreNotLoaded'), { functionName });
            return;
        }
        firestoreDB = firebase.firestore();
        LoggingService.info('[UserAccountsFeature] Firebase Firestore instance obtained.', { functionName });

        authModal = document.getElementById('authModal');
        authModalDialog = document.getElementById('authModalDialog');
        // authFormsContainer = document.getElementById('authFormsContainer'); // Not directly used in this logic
        settingsSignOutBtn = document.getElementById('settingsSignOutBtn');
        // signUpForm = document.getElementById('signUpForm'); // Referenced in ui_event_handlers.js
        // signInForm = document.getElementById('signInForm'); // Referenced in ui_event_handlers.js
        signUpEmailInput = document.getElementById('signUpEmail');
        // signUpPasswordInput = document.getElementById('signUpPassword'); // Only used in handleSignUp
        signInEmailInput = document.getElementById('signInEmail');
        // signInPasswordInput = document.getElementById('signInPassword'); // Only used in handleSignIn

        firebaseAuth.onAuthStateChanged(async user => {
            const authStateFunctionName = 'onAuthStateChanged_callback';
            if (user) {
                LoggingService.info(`[UserAccountsFeature] User signed in: ${user.email}`, { functionName: authStateFunctionName, userEmail: user.email, userId: user.uid });
                closeAuthModal();
                // MODIFIED: Start streaming user data instead of one-time load
                if (AppStore.startStreamingUserData) {
                    LoggingService.info(`[UserAccountsFeature] Attempting to START streaming data for user: ${user.uid}`, { functionName: authStateFunctionName });
                    AppStore.startStreamingUserData(user.uid);
                } else {
                    LoggingService.warn('[UserAccountsFeature] AppStore.startStreamingUserData not available.', { functionName: authStateFunctionName });
                }
            } else {
                LoggingService.info('[UserAccountsFeature] User signed out or no user.', { functionName: authStateFunctionName });
                // MODIFIED: Stop streaming user data
                if (AppStore.stopStreamingUserData) {
                    LoggingService.info(`[UserAccountsFeature] User signed out. Stopping data stream.`, { functionName: authStateFunctionName });
                    AppStore.stopStreamingUserData();
                } else {
                     LoggingService.warn('[UserAccountsFeature] AppStore.stopStreamingUserData not available.', { functionName: authStateFunctionName });
                }

                // Clear local store and reload defaults after stopping stream
                if (AppStore.clearLocalStoreAndReloadDefaults) {
                     LoggingService.info(`[UserAccountsFeature] Clearing local store and reloading defaults.`, { functionName: authStateFunctionName });
                    await AppStore.clearLocalStoreAndReloadDefaults(); // Ensure it completes if async
                } else {
                    LoggingService.warn('[UserAccountsFeature] AppStore.clearLocalStoreAndReloadDefaults not available.', { functionName: authStateFunctionName });
                }

                if (isFeatureEnabled('userAccounts')) {
                    openAuthModal();
                } else {
                    closeAuthModal();
                }
            }
            updateUIVisibility(); // Update UI based on new auth state
        });
        LoggingService.info('[UserAccountsFeature] Auth state change listener set up.', { functionName });

    } catch (error) {
        LoggingService.critical('[UserAccountsFeature] CRITICAL: Error initializing Firebase or Auth listeners:', error, { functionName });
        EventBus.publish('displayUserMessage', { text: 'Error initializing user accounts system. Please try refreshing.', type: 'error' });
    }
    LoggingService.info('[UserAccountsFeature] Initialized.', { functionName });
}

function updateUIVisibility() {
    const functionName = 'updateUIVisibility (UserAccountsFeature)';
    if (typeof isFeatureEnabled !== 'function' || !firebaseAuth) { 
        LoggingService.warn("[UserAccountsFeature] Dependencies missing for UI visibility update.", { functionName });
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('userAccounts');
    const currentUser = firebaseAuth.currentUser;

    LoggingService.debug(`[UserAccountsFeature] Updating UI visibility. Feature: ${isActuallyEnabled}, User: ${currentUser ? currentUser.email : 'None'}.`, { functionName });

    if (authModal) {
        if (!isActuallyEnabled && !authModal.classList.contains('hidden')) { // If feature disabled, ensure modal is hidden
            closeAuthModal();
        }
        // If feature enabled AND no user, onAuthStateChanged will call openAuthModal
    }
    
    if (settingsSignOutBtn) {
        settingsSignOutBtn.classList.toggle('hidden', !(isActuallyEnabled && currentUser));
    }
    
    document.querySelectorAll('.user-accounts-feature-element').forEach(el => {
        if (el.id === 'authModal' && !isActuallyEnabled) {
            el.classList.add('hidden');
        } else if (el.id !== 'authModal') { // For other elements, just toggle based on feature flag
            el.classList.toggle('hidden', !isActuallyEnabled);
        }
    });
    // Note: The authModal visibility is primarily controlled by openAuthModal/closeAuthModal
    // which are called from onAuthStateChanged based on user status and feature flag.

    LoggingService.info(`[UserAccountsFeature] UI Visibility updated. Feature: ${isActuallyEnabled}, User: ${currentUser ? currentUser.email : 'None'}`, { functionName });
}

async function handleSignUp(email, password) {
    const functionName = 'handleSignUp';
    const signUpPasswordInputEl = document.getElementById('signUpPassword'); // Get it locally as it's not needed globally

    if (!firebaseAuth) {
        LoggingService.error("[UserAccountsFeature] Firebase Auth not initialized for sign up.", new Error("FirebaseAuthMissing"), { functionName });
        EventBus.publish('displayUserMessage', { text: 'User account system not ready. Please try again.', type: 'error' });
        return;
    }
    LoggingService.info(`[UserAccountsFeature] Attempting sign up for email: ${email}`, { functionName, email });
    try {
        const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
        LoggingService.info(`[UserAccountsFeature] User signed up successfully: ${userCredential.user.email}`, { functionName, userEmail: userCredential.user.email });
        EventBus.publish('displayUserMessage', { text: 'Account created successfully! You are now signed in.', type: 'success' });
        if(signUpEmailInput) signUpEmailInput.value = '';
        if(signUpPasswordInputEl) signUpPasswordInputEl.value = '';
    } catch (error) {
        LoggingService.error('[UserAccountsFeature] Error signing up:', error, { functionName, email });
        EventBus.publish('displayUserMessage', { text: `Error creating account: ${error.message}`, type: 'error' });
    }
}

async function handleSignIn(email, password) {
    const functionName = 'handleSignIn';
    const signInPasswordInputEl = document.getElementById('signInPassword'); // Get it locally

     if (!firebaseAuth) {
        LoggingService.error("[UserAccountsFeature] Firebase Auth not initialized for sign in.", new Error("FirebaseAuthMissing"), { functionName });
        EventBus.publish('displayUserMessage', { text: 'User account system not ready. Please try again.', type: 'error' });
        return;
    }
    LoggingService.info(`[UserAccountsFeature] Attempting sign in for email: ${email}`, { functionName, email });
    try {
        const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
        LoggingService.info(`[UserAccountsFeature] User signed in successfully: ${userCredential.user.email}`, { functionName, userEmail: userCredential.user.email });
        EventBus.publish('displayUserMessage', { text: 'Signed in successfully!', type: 'success' });
        if(signInEmailInput) signInEmailInput.value = '';
        if(signInPasswordInputEl) signInPasswordInputEl.value = '';
    } catch (error) {
        LoggingService.error('[UserAccountsFeature] Error signing in:', error, { functionName, email });
        EventBus.publish('displayUserMessage', { text: `Error signing in: ${error.message}`, type: 'error' });
    }
}

async function handleSignOut() {
    const functionName = 'handleSignOut';
    if (!firebaseAuth) {
        LoggingService.error("[UserAccountsFeature] Firebase Auth not initialized for sign out.", new Error("FirebaseAuthMissing"), { functionName });
        EventBus.publish('displayUserMessage', { text: 'User account system not ready. Please try again.', type: 'error' });
        return;
    }
    LoggingService.info('[UserAccountsFeature] Attempting sign out.', { functionName });
    try {
        await firebaseAuth.signOut(); // This will trigger onAuthStateChanged
        LoggingService.info('[UserAccountsFeature] User signed out successfully (via firebaseAuth.signOut).', { functionName });
        EventBus.publish('displayUserMessage', { text: 'Signed out successfully.', type: 'success' });
        
        const settingsModalEl = document.getElementById('settingsModal');
        // Attempt to get closeSettingsModal from where it might be defined (window.ModalInteractions or global)
        const closeSettingsModalFn = (typeof window !== 'undefined' && window.ModalInteractions?.closeSettingsModal) || 
                                     (typeof closeSettingsModal === 'function' ? closeSettingsModal : null);

        if (settingsModalEl && !settingsModalEl.classList.contains('hidden') && closeSettingsModalFn) {
            closeSettingsModalFn();
        }
    } catch (error) {
        LoggingService.error('[UserAccountsFeature] Error signing out:', error, { functionName });
        EventBus.publish('displayUserMessage', { text: `Error signing out: ${error.message}`, type: 'error' });
    }
}

export function getFirestoreInstance() {
    if (!firestoreDB) {
        LoggingService.warn('[UserAccountsFeature] Firestore instance requested before proper initialization or if init failed.', { functionName: 'getFirestoreInstance' });
        if (typeof firebase !== 'undefined' && typeof firebase.firestore === 'function') {
            LoggingService.info('[UserAccountsFeature] Attempting to get Firestore instance on-demand in getFirestoreInstance.', { functionName: 'getFirestoreInstance' });
            return firebase.firestore(); 
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
    getFirestoreInstance
};

LoggingService.debug("feature_user_accounts.js loaded as ES6 module.", { module: 'feature_user_accounts' });