// feature_user_accounts.js
// Manages User Accounts Feature using Firebase Authentication.

import { isFeatureEnabled } from './featureFlagService.js';
import LoggingService from './loggingService.js';
// MODIFIED: showMessage import removed
// import { showMessage } from './ui_rendering.js'; 
import AppStore from './store.js';
import EventBus from './eventBus.js'; // MODIFIED: Added EventBus import

// Firebase configuration is still needed
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
// These will be assigned from the global 'firebase' object
let firebaseApp;
let firebaseAuth;
let firestoreDB;

// DOM Elements for auth UI
let authModal;
let authModalDialog;
let authFormsContainer;
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
        LoggingService.critical('[UserAccountsFeature] CRITICAL: Firebase SDK not loaded. Ensure firebase-app-compat.js is included in todo.html.', new Error('FirebaseNotLoaded'), { functionName });
        // MODIFIED: Publish event instead of direct call
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
            LoggingService.critical('[UserAccountsFeature] CRITICAL: Firebase Auth SDK not loaded. Ensure firebase-auth-compat.js is included.', new Error('FirebaseAuthNotLoaded'), { functionName });
            return;
        }
        firebaseAuth = firebase.auth(); 
        LoggingService.info('[UserAccountsFeature] Firebase Auth instance obtained.', { functionName });

        if (typeof firebase.firestore !== 'function') {
            LoggingService.critical('[UserAccountsFeature] CRITICAL: Firebase Firestore SDK not loaded. Ensure firebase-firestore-compat.js is included.', new Error('FirebaseFirestoreNotLoaded'), { functionName });
            return;
        }
        firestoreDB = firebase.firestore(); 
        LoggingService.info('[UserAccountsFeature] Firebase Firestore instance obtained.', { functionName });

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

        firebaseAuth.onAuthStateChanged(async user => {
            const authStateFunctionName = 'onAuthStateChanged_callback';
            if (user) {
                LoggingService.info(`[UserAccountsFeature] User signed in: ${user.email}`, { functionName: authStateFunctionName, userEmail: user.email, userId: user.uid });
                closeAuthModal();
                if (AppStore.loadDataFromFirestore) {
                    LoggingService.info(`[UserAccountsFeature] Attempting to load data for user: ${user.uid}`, { functionName: authStateFunctionName });
                    await AppStore.loadDataFromFirestore(user.uid);
                } else {
                    LoggingService.warn('[UserAccountsFeature] AppStore.loadDataFromFirestore not available.', { functionName: authStateFunctionName });
                }
            } else {
                LoggingService.info('[UserAccountsFeature] User signed out or no user.', { functionName: authStateFunctionName });
                if (AppStore.clearLocalStoreAndReloadDefaults) {
                     LoggingService.info(`[UserAccountsFeature] User signed out. Clearing local store and reloading defaults.`, { functionName: authStateFunctionName });
                    AppStore.clearLocalStoreAndReloadDefaults();
                } else {
                    LoggingService.warn('[UserAccountsFeature] AppStore.clearLocalStoreAndReloadDefaults not available.', { functionName: authStateFunctionName });
                }
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
        // MODIFIED: Publish event instead of direct call
        EventBus.publish('displayUserMessage', { text: 'Error initializing user accounts system. Please try refreshing.', type: 'error' });
    }
    LoggingService.info('[UserAccountsFeature] Initialized.', { functionName });
}

function updateUIVisibility() {
    const functionName = 'updateUIVisibility (UserAccountsFeature)';
    if (typeof isFeatureEnabled !== 'function' || !firebaseAuth) { 
        LoggingService.warn("[UserAccountsFeature] Dependencies missing for UI visibility update (isFeatureEnabled or firebaseAuth).", { functionName });
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

async function handleSignUp(email, password) {
    const functionName = 'handleSignUp';
    if (!firebaseAuth) {
        LoggingService.error("[UserAccountsFeature] Firebase Auth not initialized for sign up.", new Error("FirebaseAuthMissing"), { functionName });
        // MODIFIED: Publish event instead of direct call
        EventBus.publish('displayUserMessage', { text: 'User account system not ready. Please try again.', type: 'error' });
        return;
    }
    LoggingService.info(`[UserAccountsFeature] Attempting sign up for email: ${email}`, { functionName, email });
    try {
        const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
        LoggingService.info(`[UserAccountsFeature] User signed up successfully: ${userCredential.user.email}`, { functionName, userEmail: userCredential.user.email });
        // MODIFIED: Publish event instead of direct call
        EventBus.publish('displayUserMessage', { text: 'Account created successfully! You are now signed in.', type: 'success' });
        if(signUpEmailInput) signUpEmailInput.value = '';
        if(signUpPasswordInput) signUpPasswordInput.value = '';
    } catch (error) {
        LoggingService.error('[UserAccountsFeature] Error signing up:', error, { functionName, email });
        // MODIFIED: Publish event instead of direct call
        EventBus.publish('displayUserMessage', { text: `Error creating account: ${error.message}`, type: 'error' });
    }
}

async function handleSignIn(email, password) {
    const functionName = 'handleSignIn';
     if (!firebaseAuth) {
        LoggingService.error("[UserAccountsFeature] Firebase Auth not initialized for sign in.", new Error("FirebaseAuthMissing"), { functionName });
        // MODIFIED: Publish event instead of direct call
        EventBus.publish('displayUserMessage', { text: 'User account system not ready. Please try again.', type: 'error' });
        return;
    }
    LoggingService.info(`[UserAccountsFeature] Attempting sign in for email: ${email}`, { functionName, email });
    try {
        const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
        LoggingService.info(`[UserAccountsFeature] User signed in successfully: ${userCredential.user.email}`, { functionName, userEmail: userCredential.user.email });
        // MODIFIED: Publish event instead of direct call
        EventBus.publish('displayUserMessage', { text: 'Signed in successfully!', type: 'success' });
        if(signInEmailInput) signInEmailInput.value = '';
        if(signInPasswordInput) signInPasswordInput.value = '';
    } catch (error) {
        LoggingService.error('[UserAccountsFeature] Error signing in:', error, { functionName, email });
        // MODIFIED: Publish event instead of direct call
        EventBus.publish('displayUserMessage', { text: `Error signing in: ${error.message}`, type: 'error' });
    }
}

async function handleSignOut() {
    const functionName = 'handleSignOut';
    if (!firebaseAuth) {
        LoggingService.error("[UserAccountsFeature] Firebase Auth not initialized for sign out.", new Error("FirebaseAuthMissing"), { functionName });
        // MODIFIED: Publish event instead of direct call
        EventBus.publish('displayUserMessage', { text: 'User account system not ready. Please try again.', type: 'error' });
        return;
    }
    LoggingService.info('[UserAccountsFeature] Attempting sign out.', { functionName });
    try {
        await firebaseAuth.signOut();
        LoggingService.info('[UserAccountsFeature] User signed out successfully.', { functionName });
        // MODIFIED: Publish event instead of direct call
        EventBus.publish('displayUserMessage', { text: 'Signed out successfully.', type: 'success' });
        
        const settingsModalEl = document.getElementById('settingsModal');
        const closeSettingsModalFn = window.ModalInteractions?.closeSettingsModal || (typeof closeSettingsModal === 'function' ? closeSettingsModal : null);
        if (settingsModalEl && !settingsModalEl.classList.contains('hidden') && closeSettingsModalFn) {
            closeSettingsModalFn();
        }
    } catch (error) {
        LoggingService.error('[UserAccountsFeature] Error signing out:', error, { functionName });
        // MODIFIED: Publish event instead of direct call
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