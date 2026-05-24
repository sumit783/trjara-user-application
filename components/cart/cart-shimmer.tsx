'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function CartShimmer() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="h-8 w-48 rounded-md mb-6" />
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex gap-4 p-4 border border-border rounded-2xl bg-white shadow-xs">
            <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/3 rounded-md" />
              <Skeleton className="h-4 w-1/4 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-md pt-1" />
            </div>
          </div>
        ))}
      </div>
      <div className="lg:col-span-1">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}
