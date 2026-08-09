'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface LocationContextType {
  location: { lat: number; lng: number } | null;
  error: string | null;
  loading: boolean;
  requestLocation: () => void;
  refreshAddressLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const requestLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setError(null);
        setLoading(false);
      },
      (err) => {
        let errorMessage = 'An unknown error occurred while getting location';
        if (err.code === 1) errorMessage = 'Location access denied by user';
        else if (err.code === 2) errorMessage = 'Location position unavailable';
        else if (err.code === 3) errorMessage = 'Location request timed out';
        else if (err.message) errorMessage = err.message;
        
        console.warn('Error getting location:', err.code, err.message);
        setError(errorMessage);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const refreshAddressLocation = async () => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      try {
        const { fetchAddresses } = await import('@/lib/api/user');
        const response = await fetchAddresses();
        if (response.success && response.data && response.data.length > 0) {
          const defaultAddress = response.data.find((addr: any) => addr.isDefault) || response.data[0];
          if (defaultAddress?.location?.coordinates?.length === 2) {
            // MongoDB stores coordinates as [longitude, latitude]
            setLocation({
              lng: defaultAddress.location.coordinates[0],
              lat: defaultAddress.location.coordinates[1]
            });
            setError(null);
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('Failed to fetch addresses for location context:', error);
      }
    }
    // Fallback to GPS
    requestLocation();
  };

  useEffect(() => {
    refreshAddressLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ location, error, loading, requestLocation, refreshAddressLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
