'use client';

import { Search, MapPin, Bell, Heart, WifiOff } from 'lucide-react';
import { useState } from 'react';
import { CategoryGrid } from './category-grid';
import { usePWA } from '@/components/pwa-provider';

interface AppHeaderEnhancedProps {
  categories: any[];
}

export function AppHeaderEnhanced({ categories }: AppHeaderEnhancedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { isOffline } = usePWA();

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
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-primary flex-shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/60 font-semibold mb-0.5">Delivery to</p>
              <p className="text-sm font-bold text-white">New York, NY</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid Section */}
      <div className="relative z-10 px-3 -mt-[30px]">
        <CategoryGrid categories={categories} />
      </div>
    </div>
  );
}


