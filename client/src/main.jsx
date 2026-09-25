import React from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import './lib/i18n';
import App from './App';

const registerInstallPrompt = () => {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Service worker registration failed:', error);
    });
  });

  let deferredPrompt = null;
  const installButton = document.getElementById('pwa-install-btn');

  const handleBeforeInstallPrompt = (event) => {
    event.preventDefault();
    deferredPrompt = event;

    if (installButton) {
      installButton.style.display = 'inline-flex';
      installButton.style.alignItems = 'center';
      installButton.style.justifyContent = 'center';
      installButton.onclick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const result = await deferredPrompt.userChoice;
        if (result.outcome === 'accepted') {
          console.info('PWA install accepted');
        }
        deferredPrompt = null;
        installButton.style.display = 'none';
      };
    }
  };

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', () => {
    if (installButton) installButton.style.display = 'none';
  });
};

registerInstallPrompt();

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
