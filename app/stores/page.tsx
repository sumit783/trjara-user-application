'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Store as StoreIcon,
  Search,
  X,
  Package,
  AlertCircle,
  ChevronLeft,
  RefreshCw
} from 'lucide-react';
import { BottomNavigation } from '@/components/bottom-navigation';
import { useCart } from '@/lib/cart-context';
import { useQuery } from '@tanstack/react-query';
import { fetchStores } from '@/lib/api/stores';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function StoresPage() {
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['stores', activeSearch, currentPage],
    queryFn: () => fetchStores({ search: activeSearch, page: currentPage, limit: itemsPerPage }),
  });

  const handleSearchSubmit = () => {
    setActiveSearch(searchQuery);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
    setCurrentPage(1);
  };

  const stores = data?.data || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors -ml-2">
              <ChevronRight size={24} className="text-foreground rotate-180" />
            </Link>
            <div className="flex items-center gap-2">
              <StoreIcon className="text-primary" size={22} />
              <h1 className="text-xl font-black text-foreground">Explore Stores</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Hero & Search Banner */}
      <section className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-b border-border py-8 px-4 mb-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight mb-2">
              Boutique Stores
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Discover top-rated boutique shops, electronics hubs, and premium lifestyle outlets available for instant shopping.
            </p>
          </div>

          {/* Search Field and Search Button */}
          <div className="flex gap-2 w-full md:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Search for stores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearchSubmit();
                }}
                className="w-full pl-10 pr-9 py-2 bg-white dark:bg-input/30 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm h-10 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <Button onClick={handleSearchSubmit} className="h-10 px-5 rounded-xl gap-2 font-bold shadow-sm">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Stores List Container */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-border flex items-center gap-4 shadow-sm animate-pulse">
                <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-1/2 rounded-md" />
                  <div className="flex gap-1.5 pt-1">
                    <Skeleton className="h-4 w-16 rounded-md" />
                    <Skeleton className="h-4 w-12 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="text-destructive" size={28} />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">Failed to Load Stores</h3>
            <p className="text-sm text-muted-foreground mb-6">
              There was an issue fetching the store list. Please check your connection and try again.
            </p>
            <Button onClick={() => refetch()} variant="outline" className="gap-2 rounded-xl">
              <RefreshCw size={16} />
              Retry Fetch
            </Button>
          </div>
        )}

        {/* Loaded List */}
        {!isLoading && !isError && (
          <>
            {stores.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mb-4">
                  <Search className="text-muted-foreground" size={24} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">No Stores Found</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {activeSearch ? (
                    <>We couldn't find any stores matching "<span className="font-semibold text-foreground">{activeSearch}</span>"</>
                  ) : (
                    'No stores are currently active.'
                  )}
                </p>
                {activeSearch && (
                  <Button onClick={handleClearSearch} variant="outline" className="rounded-xl">
                    Clear Search Query
                  </Button>
                )}
              </div>
            ) : (
              /* Stores Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {stores.map((store) => (
                  <Link
                    key={store.id}
                    href={`/store?id=${store.id}`}
                    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-border hover:border-primary/20 transition-all duration-300 flex items-center gap-4 relative group cursor-pointer"
                  >
                    {/* Store Avatar */}
                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 shadow-sm border-2 border-primary/10 group-hover:border-primary/20 transition-colors">
                      <img
                        src={store.logo || 'https://images.unsplash.com/photo-1441984904556-0ac8d9c98337?w=120&h=120&fit=crop'}
                        alt={store.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1441984904556-0ac8d9c98337?w=120&h=120&fit=crop';
                        }}
                      />
                    </div>

                    {/* Store Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h3 className="font-extrabold text-foreground text-base truncate group-hover:text-primary transition-colors">
                          {store.name}
                        </h3>
                      </div>

                      {/* Display Categories */}
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {store.categories && store.categories.length > 0 ? (
                          store.categories.map((cat: any) => (
                            <span
                              key={cat.id}
                              className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase tracking-wider"
                            >
                              {cat.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] font-extrabold text-muted-foreground bg-muted px-2 py-0.5 rounded-md uppercase tracking-wider">
                            General Shop
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                          <Package size={13} className="text-primary/60" />
                          {store.productCount ?? 0} {store.productCount === 1 ? 'Product' : 'Products'}
                        </span>
                      </div>
                    </div>

                    {/* Action Arrow */}
                    <ChevronRight
                      size={20}
                      className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-300 flex-shrink-0"
                    />
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="rounded-lg"
                >
                  <ChevronLeft size={16} />
                </Button>

                <span className="text-sm font-semibold text-muted-foreground px-2">
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="rounded-lg"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNavigation cartCount={cartCount} />
    </div>
  );
}
