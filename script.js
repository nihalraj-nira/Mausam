// script.js

// PWA Pipeline Registration Hooks
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then((registration) => {
                console.log('MausamAI Cache Core Linked Scope Verified: ', registration.scope);
            })
            .catch((err) => {
                console.error('MausamAI Cache registration sequence failed:', err);
            });
    });
}

// App Installation Event Intercept Layer Manager
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredInstallPrompt = e;

    // Update UI notify the user they can install the PWA
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.style.display = 'inline-block';
        installBtn.addEventListener('click', () => {
            // Show the install prompt
            deferredInstallPrompt.prompt();
            // Wait for the user to respond to the prompt
            deferredInstallPrompt.userChoice.then((choice) => {
                if (choice.outcome === 'accepted') {
                    installBtn.style.display = 'none';
                }
                deferredInstallPrompt = null;
            });
        });
    }
});
