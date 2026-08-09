'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAddresses, updateAddress, deleteAddress, addAddress } from '@/lib/api/user';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowLeft, Home, Briefcase, Landmark, CheckCircle, Trash2, Plus, Compass, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/lib/cart-context';
import { useLocation } from '@/lib/location-context';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const AddressMap = dynamic(() => import('@/components/address-map'), { ssr: false, loading: () => <div className="h-[250px] w-full bg-muted animate-pulse rounded-xl" /> });

export default function AddressesPage() {
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const queryClient = useQueryClient();
  const { refreshAddressLocation } = useLocation();

  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const [addressForm, setAddressForm] = useState({
    label: 'home',
    addressLine1: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    coordinates: [] as number[],
  });

  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // Default to India center

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.address) {
        setAddressForm(prev => ({
          ...prev,
          addressLine1: data.address.road || data.address.suburb || data.display_name?.split(',')[0] || '',
          city: data.address.city || data.address.town || data.address.county || data.address.state_district || '',
          state: data.address.state || '',
          pincode: data.address.postcode || '',
        }));
        toast.success('Address details auto-filled from map');
      }
    } catch (error) {
      console.error('Reverse geocoding failed', error);
    }
  };

  const { data: addressesResponse, isLoading, error } = useQuery({
    queryKey: ['addresses'],
    queryFn: fetchAddresses,
  });

  const addresses = addressesResponse?.data || [];

  const handleSetDefault = async (addressId: string) => {
    try {
      await updateAddress(addressId, { isDefault: true });
      toast.success('Default address updated');
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      // Re-initialize global location context
      refreshAddressLocation();
    } catch (err: any) {
      toast.error(err.message || 'Failed to set default address');
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await deleteAddress(addressId);
      toast.success('Address deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete address');
    }
  };

  const onDetectLocation = () => {
    setIsDetectingLocation(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setIsDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setAddressForm(prev => ({
          ...prev,
          coordinates: [position.coords.longitude, position.coords.latitude],
        }));
        setMapCenter([position.coords.latitude, position.coords.longitude]);
        setLocationSuccess(true);
        setIsDetectingLocation(false);
        toast.success('Location detected!');
        reverseGeocode(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        toast.error('Could not detect location. Please enable location services.');
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.coordinates.length) {
      toast.error('Please detect your location first to set exact coordinates.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addAddress({
        ...addressForm,
        isDefault: addresses.length === 0, // Make default if it's the first one
        coordinates: [addressForm.coordinates[0], addressForm.coordinates[1]],
      });
      toast.success('Address added successfully');
      setIsAdding(false);
      setAddressForm({
        label: 'home',
        addressLine1: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        coordinates: [],
      });
      setLocationSuccess(false);
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      refreshAddressLocation();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLabelIcon = (label: string) => {
    if (label === 'home') return <Home size={16} />;
    if (label === 'work') return <Briefcase size={16} />;
    return <Landmark size={16} />;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-lg transition-colors -ml-2">
              <ArrowLeft size={24} className="text-foreground" />
            </Link>
            <h1 className="text-xl font-bold text-foreground">My Addresses</h1>
          </div>
          {!isAdding && (
            <Button size="sm" onClick={() => setIsAdding(true)} className="rounded-xl gap-1">
              <Plus size={16} /> Add
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4 mt-2">
        {isAdding ? (
          <div className="bg-white rounded-2xl p-6 border border-border shadow-sm animate-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-lg font-bold mb-4">Add New Address</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              
              <div className="mb-4 rounded-xl overflow-hidden shadow-sm border border-border">
                <AddressMap 
                  center={mapCenter} 
                  onLocationSelect={(lat, lng) => {
                    setAddressForm(prev => ({ ...prev, coordinates: [lng, lat] }));
                    setMapCenter([lat, lng]);
                    setLocationSuccess(true);
                    reverseGeocode(lat, lng);
                  }} 
                />
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={onDetectLocation}
                  disabled={isDetectingLocation}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary/5 hover:bg-primary/10 border border-primary/25 hover:border-primary/45 rounded-xl text-primary text-sm font-bold transition-all"
                >
                  {isDetectingLocation ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                      <span>Detecting Location...</span>
                    </>
                  ) : locationSuccess ? (
                    <>
                      <Check size={16} className="text-emerald-600" />
                      <span>Location Detected!</span>
                    </>
                  ) : (
                    <>
                      <Compass size={16} />
                      <span>Detect Current GPS Location</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <label className="block mb-2 text-xs font-bold uppercase tracking-wide">Label</label>
                <div className="flex gap-2">
                  {[
                    { name: 'Home', value: 'home', icon: Home },
                    { name: 'Work', value: 'work', icon: Briefcase },
                    { name: 'Other', value: 'other', icon: Landmark }
                  ].map((pill) => (
                    <button
                      key={pill.value}
                      type="button"
                      onClick={() => setAddressForm(prev => ({ ...prev, label: pill.value }))}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                        addressForm.label === pill.value
                          ? 'border-primary bg-primary text-white shadow-sm'
                          : 'border-border bg-white text-muted-foreground hover:bg-gray-50'
                      }`}
                    >
                      <pill.icon size={14} />
                      {pill.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-1 text-xs font-bold uppercase">Street Address / House No *</label>
                <textarea
                  required
                  value={addressForm.addressLine1}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, addressLine1: e.target.value }))}
                  className="w-full p-3 bg-muted/40 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 text-sm h-16 resize-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-bold uppercase">Landmark (Optional)</label>
                <input
                  type="text"
                  value={addressForm.landmark}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, landmark: e.target.value }))}
                  className="w-full p-3 bg-muted/40 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-xs font-bold uppercase">City *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full p-3 bg-muted/40 border border-border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-bold uppercase">State *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full p-3 bg-muted/40 border border-border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-xs font-bold uppercase">Pincode *</label>
                <input
                  type="text"
                  required
                  value={addressForm.pincode}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, pincode: e.target.value }))}
                  className="w-full p-3 bg-muted/40 border border-border rounded-xl text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl"
                >
                  {isSubmitting ? 'Saving...' : 'Save Address'}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-border space-y-3">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))
            ) : error ? (
              <div className="text-center py-10 text-muted-foreground">Failed to load addresses</div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-muted/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="text-muted-foreground" size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">No Saved Addresses</h3>
                <p className="text-sm text-muted-foreground mb-6">You haven't added any delivery addresses yet.</p>
                <Button onClick={() => setIsAdding(true)} className="rounded-xl">Add Your First Address</Button>
              </div>
            ) : (
              addresses.map((address: any) => (
                <div key={address._id || address.id} className={`bg-white p-5 rounded-2xl border transition-all ${address.isDefault ? 'border-primary shadow-sm ring-1 ring-primary/20' : 'border-border'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded-lg text-primary">
                        {getLabelIcon(address.label)}
                      </div>
                      <h3 className="font-bold capitalize">{address.label}</h3>
                      {address.isDefault && (
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle size={10} /> Default
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1 mb-4">
                    <p className="font-medium text-foreground">{address.addressLine1}</p>
                    {address.landmark && <p>Near: {address.landmark}</p>}
                    <p>{address.city}, {address.state} {address.pincode}</p>
                  </div>

                  <div className="flex gap-2 border-t pt-4">
                    {!address.isDefault && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleSetDefault(address._id || address.id)}
                        className="flex-1 rounded-lg text-xs"
                      >
                        Set as Default
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(address._id || address.id)}
                      className={`rounded-lg text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors ${address.isDefault ? 'w-full' : 'w-auto px-4'}`}
                    >
                      <Trash2 size={14} className={address.isDefault ? "mr-2" : ""} /> {address.isDefault ? 'Delete Address' : ''}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      <BottomNavigation cartCount={cartCount} />
    </div>
  );
}
