// authGuard.js
// This module protects a page by ensuring a user is authenticated.
// If not authenticated, it redirects to the login page (index.html).

import LoggingService from './loggingService.js';

/**
 * Checks for a logged-in Firebase user.
 * @returns {Promise<firebase.User>} A promise that resolves with the user object if logged in.
 * If not logged in, it redirects and the promise never resolves.
 */
function protectPage() {
    return new Promise((resolve, reject) => {
        // Hide the body to prevent content flashing before auth check completes.
        // Using 'visibility' instead of 'display' prevents layout shifts.
        if (document.body) {
            document.body.style.visibility = 'hidden';
        }

        const functionName = 'protectPage (authGuard)';
        if (typeof firebase === 'undefined' || typeof firebase.auth !== 'function') {
            LoggingService.critical('[AuthGuard] Firebase Auth is not available. Cannot protect page.', new Error('FirebaseNotLoaded'), { functionName });
            // If firebase isn't even loaded, we can't check auth state. Redirect immediately.
            window.location.href = 'index.html';
            reject(new Error('Firebase not loaded'));
            return;
        }

        const auth = firebase.auth();

        const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe(); // Unsubscribe after the first check to avoid multiple triggers

            if (user) {
                // User is signed in.
                LoggingService.info(`[AuthGuard] Access granted for user: ${user.email}`, { functionName, userId: user.uid });
                // The calling page is now responsible for making the body visible.
                resolve(user);
            } else {
                // No user is signed in. Redirect to the login page.
                LoggingService.warn('[AuthGuard] No user authenticated. Redirecting to index.html.', { functionName, currentPage: window.location.pathname });
                window.location.href = 'index.html';
                // The promise is never resolved as the page will be redirected.
            }
        });
    });
}

export default protectPage;