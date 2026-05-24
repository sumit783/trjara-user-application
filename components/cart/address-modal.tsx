'use client';

import React from 'react';
import { MapPin, Check, Compass, Home, Briefcase, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddressModalProps {
  isOpen: boolean;
  isPending: boolean;
  addressForm: {
    label: string;
    addressLine1: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
  };
  setAddressForm: React.Dispatch<React.SetStateAction<{
    label: string;
    addressLine1: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
  }>>;
  onDetectLocation: () => void;
  locationSuccess: boolean;
  isDetectingLocation: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddressModal({
  isOpen,
  isPending,
  addressForm,
  setAddressForm,
  onDetectLocation,
  locationSuccess,
  isDetectingLocation,
  onSubmit,
}: AddressModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-border flex flex-col gap-5 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <MapPin size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-foreground">Add Delivery Address</h2>
            <p className="text-xs text-muted-foreground font-medium">Add your address to view delivery parameters</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs font-semibold text-muted-foreground">
          {/* Geolocation Native Permission Request Trigger */}
          <div className="pt-1">
            <button
              type="button"
              onClick={onDetectLocation}
              disabled={isDetectingLocation}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary/5 hover:bg-primary/10 border border-primary/25 hover:border-primary/45 rounded-xl text-primary text-[11px] font-extrabold transition-all duration-300 shadow-inner"
            >
              {isDetectingLocation ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-primary border-t-transparent" />
                  <span>Detecting Location...</span>
                </>
              ) : locationSuccess ? (
                <>
                  <Check size={14} className="text-emerald-600 font-bold" />
                  <span>Location Detected & Auto-Filled!</span>
                </>
              ) : (
                <>
                  <Compass size={14} className="animate-pulse" />
                  <span>Detect Current GPS Location</span>
                </>
              )}
            </button>
          </div>

          {/* Custom Label Pill Selection */}
          <div>
            <label className="block mb-2 text-[11px] font-extrabold uppercase tracking-wide text-foreground">Address Label</label>
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
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-[11px] font-extrabold transition-all duration-300 ${
                    addressForm.label === pill.value
                      ? 'border-primary bg-primary text-white shadow-xs'
                      : 'border-border bg-white text-muted-foreground hover:bg-gray-50'
                  }`}
                >
                  <pill.icon size={12} />
                  {pill.name}
                </button>
              ))}
            </div>
          </div>

          {/* Street Address */}
          <div>
            <label className="block mb-1 text-[11px] font-extrabold uppercase tracking-wide text-foreground">Street Address / House No *</label>
            <textarea
              placeholder="Enter street details, apartment, villa number..."
              required
              value={addressForm.addressLine1}
              onChange={(e) => setAddressForm(prev => ({ ...prev, addressLine1: e.target.value }))}
              className="w-full p-3 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground text-xs h-16 resize-none"
            />
          </div>

          {/* Landmark */}
          <div>
            <label className="block mb-1 text-[11px] font-extrabold uppercase tracking-wide text-foreground">Landmark (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Near Big Bazaar, Opposite Subway"
              value={addressForm.landmark}
              onChange={(e) => setAddressForm(prev => ({ ...prev, landmark: e.target.value }))}
              className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground text-xs"
            />
          </div>

          {/* City, State, Pincode in Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-[11px] font-extrabold uppercase tracking-wide text-foreground">City *</label>
              <input
                type="text"
                required
                value={addressForm.city}
                onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground text-xs"
              />
            </div>
            <div>
              <label className="block mb-1 text-[11px] font-extrabold uppercase tracking-wide text-foreground">State *</label>
              <input
                type="text"
                required
                value={addressForm.state}
                onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-[11px] font-extrabold uppercase tracking-wide text-foreground">Pincode *</label>
            <input
              type="text"
              required
              value={addressForm.pincode}
              onChange={(e) => setAddressForm(prev => ({ ...prev, pincode: e.target.value }))}
              className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground text-xs"
            />
          </div>

          {/* Submit Action */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold h-11 rounded-xl shadow-xs text-xs mt-2"
          >
            {isPending ? 'Saving Address...' : 'Save & Confirm Address'}
          </Button>
        </form>
      </div>
    </div>
  );
}
