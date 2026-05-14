'use client';

import Link from 'next/link';
import { ChevronRight, Star, Store as StoreIcon } from 'lucide-react';
import { stores } from '@/components/home/stores-carousel';
import { BottomNavigation } from '@/components/bottom-navigation';
import { useCart } from '@/lib/cart-context';

export default function StoresPage() {
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-100">
        <div className="px-4 py-4 flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors -ml-2">
            <ChevronRight size={24} className="text-foreground rotate-180" />
          </Link>
          <div className="flex items-center gap-2">
            <StoreIcon className="text-primary" size={22} />
            <h1 className="text-xl font-black text-foreground">Explore Stores</h1>
          </div>
        </div>
      </div>

      {/* Description Banner */}
      <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 py-6 px-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-muted-foreground font-medium">
            Discover top-rated boutique shops, electronics hubs, and premium lifestyle outlets available for instant shopping.
          </p>
        </div>
      </section>

      {/* Stores Grid */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 flex items-center gap-4 border border-border"
            >
              {/* Store Avatar */}
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 shadow-md border-2 border-primary/20">
                <img
                  src={store.image}
                  alt={store.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Store Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h3 className="font-bold text-foreground text-base truncate">
                    {store.name}
                  </h3>
                  {store.rating && (
                    <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-bold">
                      <Star size={12} className="fill-yellow-500 text-yellow-500" />
                      {store.rating}
                    </div>
                  )}
                </div>

                {store.category && (
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md inline-block uppercase tracking-wider mb-2">
                    {store.category}
                  </span>
                )}

                <p className="text-xs text-muted-foreground">
                  Same-day delivery available
                </p>
              </div>

              {/* Action */}
              <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      <BottomNavigation cartCount={cartCount} />
    </div>
  );
}
