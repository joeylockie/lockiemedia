// feature_user_accounts.js
// Manages User Accounts Feature using Firebase Authentication.

import { isFeatureEnabled } from './featureFlagService.js';
import LoggingService from './loggingService.js'; // Ensure LoggingService is imported
import { showMessage } from './ui_rendering.js'; // Assuming showMessage is globally available or correctly imported elsewhere

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
let authContainer;
let userStatusContainer;
let authFormsContainer;
let userEmailDisplay;
let signOutBtn;
let signUpForm;
let signInForm;
// Variables to store input fields for sign up and sign in
let signUpEmailInput, signUpPasswordInput, signInEmailInput, signInPasswordInput;


/**
 * Initializes the User Accounts Feature and Firebase.
 */
function initialize() {
    const functionName = 'initialize (UserAccountsFeature)';
    LoggingService.info('[UserAccountsFeature] Initializing...', { functionName });

    try {
        // Initialize Firebase
        if (!firebase.apps.length) { // Check if Firebase is already initialized
            firebaseApp = firebase.initializeApp(firebaseConfig);
            LoggingService.info('[UserAccountsFeature] Firebase app initialized.', { functionName });
        } else {
            firebaseApp = firebase.app(); // Get the default app if already initialized
            LoggingService.info('[UserAccountsFeature] Firebase app already initialized. Using existing instance.', { functionName });
        }
        firebaseAuth = firebase.auth();
        LoggingService.info('[UserAccountsFeature] Firebase Auth instance obtained.', { functionName });

        // Get DOM elements
        authContainer = document.getElementById('authContainer');
        userStatusContainer = document.getElementById('userStatusContainer');
        authFormsContainer = document.getElementById('authFormsContainer');
        userEmailDisplay = document.getElementById('userEmailDisplay');
        signOutBtn = document.getElementById('signOutBtn');
        signUpForm = document.getElementById('signUpForm');
        signInForm = document.getElementById('signInForm');

        // Get form input fields
        signUpEmailInput = document.getElementById('signUpEmail');
        signUpPasswordInput = document.getElementById('signUpPassword');
        signInEmailInput = document.getElementById('signInEmail');
        signInPasswordInput = document.getElementById('signInPassword');


        // Add event listeners (these will be added in ui_event_handlers.js later,
        // but it's good to know which elements they'll attach to)
        // signUpForm.addEventListener('submit', handleSignUp);
        // signInForm.addEventListener('submit', handleSignIn);
        // signOutBtn.addEventListener('click', handleSignOut);

        // Listen for auth state changes
        firebaseAuth.onAuthStateChanged(user => {
            const authStateFunctionName = 'onAuthStateChanged_callback';
            if (user) {
                // User is signed in
                LoggingService.info(`[UserAccountsFeature] User signed in: ${user.email}`, { functionName: authStateFunctionName, userEmail: user.email });
                if (userStatusContainer) userStatusContainer.classList.remove('hidden');
                if (authFormsContainer) authFormsContainer.classList.add('hidden');
                if (userEmailDisplay) userEmailDisplay.textContent = user.email;
                // Potentially hide the entire authContainer if feature flag is on and user is logged in,
                // or just show the status. For now, we show status.
                // Example: if (authContainer) authContainer.classList.add('hidden');
            } else {
                // User is signed out
                LoggingService.info('[UserAccountsFeature] User signed out.', { functionName: authStateFunctionName });
                if (userStatusContainer) userStatusContainer.classList.add('hidden');
                if (authFormsContainer && isFeatureEnabled('userAccounts')) { // Only show forms if feature is on
                     authFormsContainer.classList.remove('hidden');
                } else if (authFormsContainer) {
                    authFormsContainer.classList.add('hidden');
                }
                if (userEmailDisplay) userEmailDisplay.textContent = '';
                // Example: if (authContainer) authContainer.classList.remove('hidden'); // Show forms container
            }
            updateUIVisibility(); // Ensure general visibility rules are applied
        });
        LoggingService.info('[UserAccountsFeature] Auth state change listener set up.', { functionName });

    } catch (error) {
        LoggingService.critical('[UserAccountsFeature] CRITICAL: Error initializing Firebase or Auth listeners:', error, { functionName });
        if (typeof showMessage === 'function') showMessage('Error initializing user accounts system. Please try refreshing.', 'error');
    }
    LoggingService.info('[UserAccountsFeature] Initialized.', { functionName });
}

/**
 * Updates the visibility of User Accounts UI elements based on the feature flag.
 */
function updateUIVisibility() {
    const functionName = 'updateUIVisibility (UserAccountsFeature)';
    if (typeof isFeatureEnabled !== 'function') {
        LoggingService.error("[UserAccountsFeature] isFeatureEnabled function not available from FeatureFlagService.", new Error("DependencyMissing"), { functionName });
        return;
    }
    const isActuallyEnabled = isFeatureEnabled('userAccounts');
    LoggingService.debug(`[UserAccountsFeature] Updating UI visibility. Feature enabled: ${isActuallyEnabled}.`, { functionName, isActuallyEnabled });

    const currentUser = firebaseAuth ? firebaseAuth.currentUser : null;

    if (authContainer) {
        authContainer.classList.toggle('hidden', !isActuallyEnabled);
    }

    if (isActuallyEnabled) {
        if (currentUser) {
            if (userStatusContainer) userStatusContainer.classList.remove('hidden');
            if (authFormsContainer) authFormsContainer.classList.add('hidden');
        } else {
            if (userStatusContainer) userStatusContainer.classList.add('hidden');
            if (authFormsContainer) authFormsContainer.classList.remove('hidden');
        }
    } else {
        // If feature is disabled, hide both status and forms
        if (userStatusContainer) userStatusContainer.classList.add('hidden');
        if (authFormsContainer) authFormsContainer.classList.add('hidden');
        if (authContainer) authContainer.classList.add('hidden'); // Ensure main container is also hidden
    }
    // Generic class for other elements controlled by this feature can be handled here or by a global applyActiveFeatures
    document.querySelectorAll('.user-accounts-feature-element').forEach(el => el.classList.toggle('hidden', !isActuallyEnabled));
    LoggingService.info(`[UserAccountsFeature] UI Visibility updated. Feature: ${isActuallyEnabled}, User: ${currentUser ? currentUser.email : 'None'}`, { functionName, isEnabled: isActuallyEnabled, user: currentUser ? currentUser.email : 'None' });
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
        // The onAuthStateChanged listener will handle UI updates.
        // Clear form fields
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
        // The onAuthStateChanged listener will handle UI updates.
        // Clear form fields
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
        await firebaseAuth.signOut();
        LoggingService.info('[UserAccountsFeature] User signed out successfully.', { functionName });
        if (typeof showMessage === 'function') showMessage('Signed out successfully.', 'success');
        // The onAuthStateChanged listener will handle UI updates.
    } catch (error) {
        LoggingService.error('[UserAccountsFeature] Error signing out:', error, { functionName });
        if (typeof showMessage === 'function') showMessage(`Error signing out: ${error.message}`, 'error');
    }
}

export const UserAccountsFeature = {
    initialize,
    updateUIVisibility,
    handleSignUp, // Exporting for ui_event_handlers
    handleSignIn, // Exporting for ui_event_handlers
    handleSignOut // Exporting for ui_event_handlers
};

LoggingService.debug("feature_user_accounts.js loaded as ES6 module.", { module: 'feature_user_accounts' });