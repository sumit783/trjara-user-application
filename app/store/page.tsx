'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { StoreClient } from './store-client';

function StorePageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  if (!id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Store ID is missing.</p>
        </div>
      </div>
    );
  }

  return <StoreClient storeId={id} />;
}

export default function StorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading store details...</p>
        </div>
      </div>
    }>
      <StorePageContent />
    </Suspense>
  );
}
