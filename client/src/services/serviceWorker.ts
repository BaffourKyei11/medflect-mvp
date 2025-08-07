import { Workbox } from 'workbox-window';

let wb: Workbox | null = null;

export const initializeServiceWorker = async () => {
  if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    try {
      wb = new Workbox('/sw.js');

      // Add event listeners for service worker updates
      wb.addEventListener('installed', (event) => {
        console.log('Service Worker installed:', event);
      });

      wb.addEventListener('waiting', (event) => {
        console.log('Service Worker waiting:', event);
        // Show update available notification
        if (window.confirm('New version available! Reload to update?')) {
          wb?.messageSkipWaiting();
        }
      });

      wb.addEventListener('controlling', (event) => {
        console.log('Service Worker controlling:', event);
        window.location.reload();
      });

      wb.addEventListener('activated', (event) => {
        console.log('Service Worker activated:', event);
      });

      // Register the service worker
      await wb.register();
      console.log('Service Worker registered successfully');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  } else {
    console.log('Service Worker not supported or in development mode');
  }
};

export const updateServiceWorker = () => {
  if (wb) {
    wb.messageSkipWaiting();
  }
};

export const getServiceWorkerRegistration = () => {
  return wb?.getSW();
};
