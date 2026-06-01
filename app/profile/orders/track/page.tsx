'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { OrderDetailsClient } from './order-details-client';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || '';

  if (!orderId) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-sm space-y-4 p-8 bg-destructive/5 border border-destructive/10 rounded-3xl shadow-xl">
          <h3 className="text-lg font-bold text-foreground">Invalid Order</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            No order ID was provided for tracking. Please select a valid order from your history.
          </p>
        </div>
      </div>
    );
  }

  return <OrderDetailsClient orderId={orderId} />;
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
