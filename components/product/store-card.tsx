'use client';

import React from 'react';
import { Store as StoreIcon } from 'lucide-react';

interface StoreCardProps {
  storeName: string;
}

export function StoreCard({ storeName }: StoreCardProps) {
  return (
    <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20 flex items-center justify-between my-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md text-primary font-black border border-primary/20 flex-shrink-0">
          <StoreIcon size={22} />
        </div>
        <div>
          <h4 className="text-xs font-black text-foreground">
            Sold by: {storeName || 'Premium Storehouse'}
          </h4>
          <p className="text-[11px] font-semibold text-muted-foreground">
            99.4% Positive Feedback • Official Merchant
          </p>
        </div>
      </div>
      <span className="bg-white text-primary text-[10px] font-black px-2.5 py-1 rounded-lg border border-primary/20 shadow-sm">
        Verified
      </span>
    </div>
  );
}
