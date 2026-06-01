'use client';

import React from 'react';
import { ChevronLeft, Search } from 'lucide-react';

interface ProductHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function ProductHeader({ searchQuery, setSearchQuery }: ProductHeaderProps) {
  return (
    <div className="bg-gradient-to-b from-black via-black/80 to-transparent pb-2 pt-4 px-4 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto relative flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft size={24} className="text-foreground" />
        </button>
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white backdrop-blur-md border border-white rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
          />
        </div>
      </div>
    </div>
  );
}
