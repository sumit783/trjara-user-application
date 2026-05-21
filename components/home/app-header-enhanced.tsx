'use client';

import { Search, MapPin, Bell, Heart, WifiOff, ChevronDown, Home as HomeIcon, Briefcase, Plus } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { CategoryGrid } from './category-grid';
import { usePWA } from '@/components/pwa-provider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPrimaryAddressLabel, fetchAddresses, addAddress } from '@/lib/api/user';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AppHeaderEnhancedProps {
  categories: any[];
}

export function AppHeaderEnhanced({ categories }: AppHeaderEnhancedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { isOffline } = usePWA();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Dialog & Add Address States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [label, setLabel] = useState('home');
  const [customLabel, setCustomLabel] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [coordinates, setCoordinates] = useState<[number, number]>([18.463266, 73.773752]);
  const [isDefault, setIsDefault] = useState(true);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);

  // Map states
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const { data: primaryLabelResponse } = useQuery({
    queryKey: ['primary-address-label'],
    queryFn: fetchPrimaryAddressLabel,
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('token'),
  });

  const { data: addressesResponse } = useQuery({
    queryKey: ['addresses'],
    queryFn: fetchAddresses,
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('token'),
  });

  const primaryLabel = primaryLabelResponse?.data?.label;
  const addresses = addressesResponse?.data || [];

  const displayLabel = primaryLabel 
    ? primaryLabel.charAt(0).toUpperCase() + primaryLabel.slice(1) 
    : 'Add your address';

  // Dynamic Leaflet Map setup
  useEffect(() => {
    if (typeof window === 'undefined' || !showMap) return;

    let timeoutId: any;

    const initMap = () => {
      const L = (window as any).L;
      if (!L) return;

      const mapEl = document.getElementById('address-picker-map');
      if (!mapEl) {
        // If element is not in DOM yet, retry in 50ms
        timeoutId = setTimeout(initMap, 50);
        return;
      }

      const initialLat = coordinates[0] || 18.463266;
      const initialLng = coordinates[1] || 73.773752;

      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.error(e);
        }
      }

      const map = L.map('address-picker-map').setView([initialLat, initialLng], 14);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Custom icon to prevent Leaflet default icon path issues in Next.js
      const DefaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      L.Marker.prototype.options.icon = DefaultIcon;

      const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        setCoordinates([position.lat, position.lng]);
      });

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCoordinates([lat, lng]);
      });
    };

    const loadLeaflet = () => {
      if ((window as any).L) {
        initMap();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initMap();
      document.body.appendChild(script);
    };

    loadLeaflet();

    return () => {
      clearTimeout(timeoutId);
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.error(e);
        }
        mapRef.current = null;
      }
    };
  }, [showMap]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates([latitude, longitude]);
        toast.success('Location updated to current coordinates!');
        
        const L = (window as any).L;
        if (L && mapRef.current && markerRef.current) {
          mapRef.current.setView([latitude, longitude], 15);
          markerRef.current.setLatLng([latitude, longitude]);
        }
      },
      (error) => {
        console.error(error);
        toast.error('Unable to retrieve your location');
      }
    );
  };

  const handleStartAddAddress = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      toast.error('Please login to add a delivery address.');
      router.push('/profile');
      setDialogOpen(false);
      return;
    }
    setIsAdding(true);
  };

  const handleSubmitAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      toast.error('Please login to add an address.');
      router.push('/profile');
      setDialogOpen(false);
      return;
    }

    if (!addressLine1.trim()) {
      toast.error('Address Line 1 is required');
      return;
    }
    if (!city.trim()) {
      toast.error('City is required');
      return;
    }
    if (!state.trim()) {
      toast.error('State is required');
      return;
    }
    if (!pincode.trim()) {
      toast.error('Pincode is required');
      return;
    }

    setIsSubmittingAddress(true);
    try {
      const res = await addAddress({
        label: label,
        addressLine1: addressLine1.trim(),
        landmark: landmark.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        coordinates: coordinates,
        isDefault: isDefault
      });

      toast.success(res.message || 'Address added successfully!');
      
      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['primary-address-label'] });
      queryClient.invalidateQueries({ queryKey: ['addresses'] });

      // Reset Form States
      setIsAdding(false);
      setShowMap(false);
      setAddressLine1('');
      setLandmark('');
      setCity('');
      setState('');
      setPincode('');
      setLabel('home');
      setCustomLabel('');
      setCoordinates([18.463266, 73.773752]);
    } catch (err: any) {
      toast.error(err.message || 'Failed to add address');
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  return (
    <div className="relative">
      {/* Black Header Section */}
      <div className="bg-black rounded-b-3xl shadow-lg pb-8">
        {/* Top Header: Search Box, Wishlist, Bell */}
        <div className="px-4 pt-4 pb-3 flex items-center gap-3">
          <div className="relative flex-1 flex items-center">
            <Search
              size={18}
              className="absolute left-3 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 text-white placeholder-white/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
            />
          </div>
          {isOffline && (
            <div className="flex items-center gap-1 bg-red-500/20 border border-red-500 text-red-400 px-2.5 py-1.5 rounded-full text-xs font-semibold animate-pulse">
              <WifiOff size={14} />
              <span className="hidden sm:inline">Offline Mode</span>
            </div>
          )}
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
            <Heart size={22} className="text-white" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
            <Bell size={22} className="text-white" />
          </button>
        </div>

        {/* Address Row */}
        <div className="px-5 pb-2 flex items-center justify-between">
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setIsAdding(false);
              setShowMap(false);
            }
          }}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 -ml-3 rounded-xl transition-all duration-200 text-left focus:outline-none focus:ring-1 focus:ring-primary/40 group cursor-pointer">
                <MapPin size={18} className="text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/60 font-semibold mb-0.5">Delivery to</p>
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-bold text-white max-w-[180px] truncate">
                      {displayLabel}
                    </p>
                    <ChevronDown size={14} className="text-white/60 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </button>
            </DialogTrigger>

            <DialogContent className="max-w-md border border-white/10 backdrop-blur-xl bg-black/95 text-white shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95">
              {isAdding ? (
                // Add Address Form View
                <form onSubmit={handleSubmitAddress} className="space-y-4">
                  <DialogHeader className="pt-4 pb-2 text-center space-y-1">
                    <DialogTitle className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent flex items-center justify-center gap-2">
                      <Plus className="h-5 w-5 text-primary" />
                      Add New Address
                    </DialogTitle>
                    <DialogDescription className="text-white/60 text-xs font-medium">
                      Fill in details to save your delivery location.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 my-2 custom-scrollbar">
                    {/* Label Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider pl-1">
                        Address Label
                      </label>
                      <select
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white/80 placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer capitalize appearance-none pr-8 relative bg-no-repeat bg-[right_12px_center] bg-[length:16px_16px]"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.6)' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`
                        }}
                      >
                        <option value="home" className="bg-neutral-900 text-white font-medium">Home</option>
                        <option value="work" className="bg-neutral-900 text-white font-medium">Work</option>
                        <option value="other" className="bg-neutral-900 text-white font-medium">Other</option>
                      </select>
                    </div>

                    {/* Address Line 1 */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider pl-1">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        placeholder="House No, Building, Street Name"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>

                    {/* Landmark */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider pl-1">
                        Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Near Famous Shop/Mall"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {/* City and State */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider pl-1">
                          City
                        </label>
                        <input
                          type="text"
                          placeholder="Pune"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider pl-1">
                          State
                        </label>
                        <input
                          type="text"
                          placeholder="Maharashtra"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary"
                          required
                        />
                      </div>
                    </div>

                    {/* Pincode & Default Toggle */}
                    <div className="grid grid-cols-2 gap-3 items-center">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider pl-1">
                          Pincode
                        </label>
                        <input
                          type="text"
                          placeholder="411052"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary"
                          required
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-5">
                        <input
                          type="checkbox"
                          id="address-default-toggle"
                          checked={isDefault}
                          onChange={(e) => setIsDefault(e.target.checked)}
                          className="w-4 h-4 accent-primary rounded cursor-pointer"
                        />
                        <label htmlFor="address-default-toggle" className="text-xs text-white/70 font-semibold cursor-pointer select-none">
                          Set Default
                        </label>
                      </div>
                    </div>

                    {/* Interactive Leaflet Map Selection */}
                    <div className="pt-2">
                      {!showMap ? (
                        <button
                          type="button"
                          onClick={() => setShowMap(true)}
                          className="w-full h-10 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-xs font-bold text-primary flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <MapPin size={14} />
                          Select Location on Map
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider pl-1">
                              Pin Location on Map
                            </label>
                            <button 
                              type="button" 
                              onClick={handleGetCurrentLocation}
                              className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                            >
                              Use Current Location 📍
                            </button>
                          </div>
                          <div 
                            id="address-picker-map" 
                            className="h-44 w-full rounded-2xl border border-white/10 overflow-hidden z-10" 
                            style={{ minHeight: '176px' }}
                          />
                          <p className="text-[10px] text-white/40 text-center font-medium">
                            Coordinates: {coordinates[0].toFixed(6)}, {coordinates[1].toFixed(6)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdding(false);
                        setShowMap(false);
                      }}
                      className="flex-1 h-11 text-xs font-bold border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingAddress}
                      className="flex-1 h-11 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingAddress ? 'Saving Address...' : 'Save Address'}
                    </button>
                  </div>
                </form>
              ) : (
                // Addresses List View
                <>
                  <DialogHeader className="pt-4 pb-2 text-center space-y-1">
                    <DialogTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent flex items-center justify-center gap-2">
                      <MapPin className="h-6 w-6 text-primary" />
                      Your Addresses
                    </DialogTitle>
                    <DialogDescription className="text-white/60 text-sm font-medium">
                      Select or view your saved delivery locations.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 my-4 custom-scrollbar">
                    {addresses.length === 0 ? (
                      <div className="text-center py-8 px-4 bg-white/5 rounded-2xl border border-white/10 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <MapPin className="h-10 w-10 text-white/20 mx-auto" />
                        <p className="text-white/70 font-semibold">No addresses found</p>
                        <p className="text-xs text-white/50">Please add your address details to proceed with order delivery.</p>
                        <button
                          onClick={handleStartAddAddress}
                          className="inline-flex items-center justify-center h-9 px-4 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
                        >
                          Add New Address
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {addresses.map((addr: any) => {
                          const isHome = addr.label?.toLowerCase() === 'home';
                          const isOffice = addr.label?.toLowerCase() === 'office' || addr.label?.toLowerCase() === 'work';

                          return (
                            <div
                              key={addr._id}
                              className={`flex gap-3 p-4 rounded-2xl transition-all duration-300 ${addr.isDefault
                                  ? 'bg-primary/10'
                                  : 'bg-white/5'
                                }`}
                            >
                              <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-primary mt-0.5">
                                {isHome ? (
                                  <HomeIcon size={20} />
                                ) : isOffice ? (
                                  <Briefcase size={20} />
                                ) : (
                                  <MapPin size={20} />
                                )}
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-bold text-sm text-white uppercase tracking-wider">
                                    {addr.label}
                                  </h4>
                                  {addr.isDefault && (
                                    <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-white/80 leading-relaxed font-medium">
                                  {addr.addressLine1}
                                  {addr.landmark && `, ${addr.landmark}`}
                                </p>
                                <p className="text-[11px] text-white/50 font-semibold">
                                  {addr.city}, {addr.state} - {addr.pincode}
                                </p>
                              </div>
                            </div>
                          );
                        })}

                        <button
                          onClick={handleStartAddAddress}
                          className="w-full py-3 border border-dashed border-white/20 hover:border-primary/50 hover:bg-white/5 text-primary text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 mt-4 cursor-pointer"
                        >
                          <Plus size={16} />
                          Add New Address
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Categories Grid Section */}
      <div className="relative z-10 px-3 -mt-[30px]">
        <CategoryGrid categories={categories} />
      </div>
    </div>
  );
}
