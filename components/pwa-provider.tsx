'use client';
 
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
 
interface AppContextType {
  isInstallable: boolean;
  isOffline: boolean;
  installApp: () => Promise<void>;
}
 
const AppContext = createContext<AppContextType>({
  isInstallable: false,
  isOffline: false,
  installApp: async () => {},
});
 
export const useApp = () => useContext(AppContext);
 
export function AppProvider({ children }: { children: React.ReactNode }) {
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
        toast.error('You are offline. Running in offline mode.', {
          duration: 5000,
        });
      };
 
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
 
      // Handle App install prompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
      };
 
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
 
      // Register Service Worker in production only, and unregister in development to prevent HMR caching errors
      if ('serviceWorker' in navigator) {
        if (process.env.NODE_ENV === 'production') {
          navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
              console.log('App Service Worker registered successfully:', registration.scope);
            })
            .catch((error) => {
              console.error('App Service Worker registration failed:', error);
            });
        } else {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (const registration of registrations) {
              registration.unregister().then((success) => {
                if (success) {
                  console.log('Dev Service Worker unregistered successfully to allow fresh HMR chunks.');
                }
              });
            }
          });
        }
      }
 
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);
 
  const installApp = async () => {
    if (!deferredPrompt) {
      toast.info('App is already installed or not supported on this browser.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      toast.success('App installation accepted! Enjoy StyleHub app.');
    }
    setDeferredPrompt(null);
  };
 
  return (
    <AppContext.Provider value={{ isInstallable, isOffline, installApp }}>
      {children}
    </AppContext.Provider>
  );
}
