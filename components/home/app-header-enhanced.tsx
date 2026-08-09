'use client';

import { Search, MapPin, Bell, Heart, WifiOff, ChevronDown, Home as HomeIcon, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { CategoryGrid } from './category-grid';
import { useApp } from '@/components/pwa-provider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPrimaryAddressLabel, fetchAddresses, updateAddress } from '@/lib/api/user';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Link from 'next/link';
import { toast } from 'sonner';
import { useLocation } from '@/lib/location-context';

interface AppHeaderEnhancedProps {
  categories: any[];
}

export function AppHeaderEnhanced({ categories }: AppHeaderEnhancedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { isOffline } = useApp();
  const queryClient = useQueryClient();
  const { refreshAddressLocation } = useLocation();

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

  const handleSetDefault = async (addressId: string) => {
    try {
      await updateAddress(addressId, { isDefault: true });
      toast.success('Default delivery address updated');
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      queryClient.invalidateQueries({ queryKey: ['primary-address-label'] });
      refreshAddressLocation();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update delivery address');
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
              suppressHydrationWarning
            />
          </div>
          {isOffline && (
            <div className="flex items-center gap-1 bg-red-500/20 border border-red-500 text-red-400 px-2.5 py-1.5 rounded-full text-xs font-semibold animate-pulse">
              <WifiOff size={14} />
              <span className="hidden sm:inline">Offline Mode</span>
            </div>
          )}
          <button suppressHydrationWarning className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
            <Heart size={22} className="text-white" />
          </button>
          <button suppressHydrationWarning className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
            <Bell size={22} className="text-white" />
          </button>
        </div>

        {/* Address Row */}
        <div className="px-5 pb-2 flex items-center justify-between">
          <Dialog>
            <DialogTrigger asChild>
              <button suppressHydrationWarning className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 -ml-3 rounded-xl transition-all duration-200 text-left focus:outline-none focus:ring-1 focus:ring-primary/40 group cursor-pointer animate-fade-in">
                <MapPin size={18} className="text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-200 animate-bounce" />
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
              <DialogHeader className="pt-4 pb-2 text-center space-y-1">
                <DialogTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent flex items-center justify-center gap-2">
                  <MapPin className="h-6 w-6 text-primary animate-pulse" />
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
                    <p className="text-xs text-white/50">Please add your address in your profile details to proceed with order delivery.</p>
                    <Link href="/profile" className="inline-flex items-center justify-center h-9 px-4 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer">
                      Go to Profile
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {addresses.map((addr: any) => {
                      const isHome = addr.label?.toLowerCase() === 'home';
                      const isOffice = addr.label?.toLowerCase() === 'office' || addr.label?.toLowerCase() === 'work';

                      return (
                        <div
                          key={addr._id}
                          onClick={() => !addr.isDefault && handleSetDefault(addr._id)}
                          className={`flex gap-3 p-4 rounded-2xl transition-all duration-300 ${addr.isDefault
                            ? 'bg-primary/10 border border-primary/50 shadow-[0_0_15px_rgba(255,107,0,0.1)]'
                            : 'bg-white/5 hover:bg-white/10 cursor-pointer border border-transparent'
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

                    <Link href="/profile/addresses" className="mt-4 flex items-center justify-center h-10 w-full rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white transition-all">
                      Manage Addresses
                    </Link>
                  </div>
                )}
              </div>
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
