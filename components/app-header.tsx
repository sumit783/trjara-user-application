'use client';

import { Search, MapPin, Bell } from 'lucide-react';
import { useState } from 'react';

export function AppHeader() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="sticky top-0 z-30 bg-gradient-to-b from-primary via-primary to-accent shadow-lg">
      {/* Top Header with Location and Bell */}
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-white flex-shrink-0" />
          <div>
            <p className="text-xs text-white/80">Delivery to</p>
            <p className="text-sm font-bold text-white">New York, NY</p>
          </div>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <Bell size={20} className="text-white" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-4">
        <div className="relative flex items-center">
          <Search
            size={20}
            className="absolute left-3 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all shadow-md"
          />
        </div>
      </div>
    </div>
  );
}
