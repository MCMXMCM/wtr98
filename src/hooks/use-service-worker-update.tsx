import { useEffect, useState, useRef } from 'react';

export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Only run in production - service workers interfere with Vite HMR in development
    if (!('serviceWorker' in navigator) || import.meta.env.DEV) {
      return;
    }

    let updateInterval: NodeJS.Timeout | null = null;

    // Check for existing registration
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;
      
      registrationRef.current = reg;

      // Check if there's already a waiting service worker
      if (reg.waiting) {
        setUpdateAvailable(true);
      }

      // Listen for new service worker installing
      const handleUpdateFound = () => {
        if (!reg) return;
        
        const installingWorker = reg.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed') {
            // New service worker is installed and waiting
            if (navigator.serviceWorker.controller) {
              // There's a controller, so this is an update
              setUpdateAvailable(true);
            }
          }
        });
      };

      reg.addEventListener('updatefound', handleUpdateFound);

      // Periodically check for updates (every hour)
      updateInterval = setInterval(() => {
        reg.update().catch((err) => {
          console.warn('Service Worker update check failed:', err);
        });
      }, 60 * 60 * 1000);
    });

    // Listen for controller change (service worker activated)
    const handleControllerChange = () => {
      setUpdateAvailable(false);
      // Small delay to ensure service worker is fully activated
      // Then reload with cache bypass to get fresh JavaScript files
      setTimeout(() => {
        // Force a hard reload to bypass any cached JavaScript
        window.location.reload();
      }, 100);
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    };
  }, []);

  const updateServiceWorker = () => {
    const reg = registrationRef.current;
    if (!reg || !reg.waiting) {
      return;
    }

    // Tell the waiting service worker to skip waiting and activate
    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
  };

  return {
    updateAvailable,
    updateServiceWorker,
  };
}
