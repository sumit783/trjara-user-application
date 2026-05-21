'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function CapacitorHandler() {
  const pathname = usePathname();

  useEffect(() => {
    let activeListener: any = null;

    const initCapacitor = async () => {
      if (typeof window === 'undefined') return;

      try {
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) return;

        const { App } = await import('@capacitor/app');

        const handleBackButton = () => {
          if (pathname === '/' || pathname === '/home') {
            App.exitApp();
          } else {
            window.history.back();
          }
        };

        activeListener = await App.addListener('backButton', handleBackButton);
      } catch (err) {
        console.error('Failed to initialize Capacitor App listeners:', err);
      }
    };

    initCapacitor();

    return () => {
      if (activeListener) {
        activeListener.remove();
      }
    };
  }, [pathname]);

  return null;
}
