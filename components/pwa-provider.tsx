'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PWAContextType {
  isInstallable: boolean;
  isOffline: boolean;
  installPWA: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType>({
  isInstallable: false,
  isOffline: false,
  installPWA: async () => {},
});

export const usePWA = () => useContext(PWAContext);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOffline(!window.navigator.onLine);

      const handleOnline = () => {
        setIsOffline(false);
        toast.success('Back online! Connection restored.', {
          duration: 3000,
        });
      };

      const handleOffline = () => {
        setIsOffline(true);
        toast.error('You are offline. Running in PWA offline mode.', {
          duration: 5000,
        });
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Handle PWA install prompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Register Service Worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('PWA Service Worker registered successfully:', registration.scope);
          })
          .catch((error) => {
            console.error('PWA Service Worker registration failed:', error);
          });
      }

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) {
      toast.info('PWA is already installed or not supported on this browser.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      toast.success('PWA installation accepted! Enjoy StyleHub app.');
    }
    setDeferredPrompt(null);
  };

  return (
    <PWAContext.Provider value={{ isInstallable, isOffline, installPWA }}>
      {children}
    </PWAContext.Provider>
  );
}
