'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Search,
  Store as StoreIcon,
  Phone,
  Mail,
  MapPin,
  Package,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchStoreDetails } from '@/lib/api/stores';
import { useCart } from '@/lib/cart-context';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BottomNavigation } from '@/components/bottom-navigation';

interface StoreClientProps {
  storeId: string;
}

export function StoreClient({ storeId }: StoreClientProps) {
  const { items, addItem } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['store-details', storeId],
    queryFn: () => fetchStoreDetails(storeId),
  });

  const store = data?.data;

  // Filter products locally based on search query and subcategory
  const filteredProducts = store?.products?.filter((product) => {
    const matchesSearch = searchQuery
      ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesSubcategory = selectedSubcategory
      ? product.category.toLowerCase() === selectedSubcategory.toLowerCase()
      : true;

    return matchesSearch && matchesSubcategory;
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Header Shimmer */}
        <div className="bg-white border-b border-border py-4 px-4 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="h-6 w-48 rounded-md" />
          </div>
        </div>

        {/* Hero Banner Shimmer */}
        <div className="w-full h-48 md:h-64 bg-accent animate-pulse relative" />

        {/* Store Detail Content Shimmer */}
        <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-10 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-border shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
            <Skeleton className="w-24 h-24 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-3 w-full">
              <Skeleton className="h-7 w-1/3 mx-auto md:mx-0 rounded-md" />
              <Skeleton className="h-4 w-2/3 mx-auto md:mx-0 rounded-md" />
              <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </div>
          </div>

          {/* Grid skeleton */}
          <div className="space-y-4 pt-4">
            <Skeleton className="h-6 w-32 rounded-md" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2 border border-border p-3 rounded-2xl">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-1/2 rounded-md" />
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <BottomNavigation cartCount={cartCount} />
      </div>
    );
  }

  if (isError || !store) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 pb-24 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="text-destructive" size={28} />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1">Store Not Found</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          The store details could not be retrieved. It may have been disabled or deleted.
        </p>
        <div className="flex gap-3">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/stores">Back to Stores</Link>
          </Button>
          <Button onClick={() => refetch()} className="gap-2 rounded-xl">
            <RefreshCw size={16} />
            Retry
          </Button>
        </div>
        <BottomNavigation cartCount={cartCount} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sticky Premium Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 py-3 px-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/stores" className="p-2 hover:bg-gray-100 rounded-lg transition-colors -ml-2">
              <ChevronLeft size={24} className="text-foreground" />
            </Link>
            <div className="flex items-center gap-2">
              <StoreIcon className="text-primary" size={20} />
              <h1 className="text-base font-extrabold text-foreground truncate max-w-[180px] sm:max-w-xs">
                {store.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner Section */}
      <div className="w-full h-48 md:h-64 relative overflow-hidden bg-gradient-to-br from-primary/80 via-accent/80 to-purple-800 flex items-center justify-center">
        {store.banner ? (
          <img
            src={store.banner}
            alt={`${store.name} Banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-10 space-y-8">
        {/* Profile Details Card */}
        <div className="bg-white rounded-3xl p-6 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Logo */}
          <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 shadow-md border-4 border-white -mt-16 md:-mt-20 bg-white">
            <img
              src={store.logo || 'https://images.unsplash.com/photo-1441984904556-0ac8d9c98337?w=120&h=120&fit=crop'}
              alt={store.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1441984904556-0ac8d9c98337?w=120&h=120&fit=crop';
              }}
            />
          </div>

          {/* Details */}
          <div className="flex-1 text-center md:text-left min-w-0 space-y-3">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-foreground mb-1">
                {store.name}
              </h2>
              {store.description && (
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl font-medium">
                  {store.description}
                </p>
              )}
            </div>

            {/* Address & Contacts */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-xs text-muted-foreground font-semibold">
              {(store.address || store.city) && (
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-primary/70" />
                  {[store.address, store.city, store.state, store.pincode].filter(Boolean).join(', ')}
                </span>
              )}
              {store.phone && (
                <span className="flex items-center gap-1">
                  <Phone size={14} className="text-primary/70" />
                  {store.phone}
                </span>
              )}
              {store.email && (
                <span className="flex items-center gap-1">
                  <Mail size={14} className="text-primary/70" />
                  {store.email}
                </span>
              )}
            </div>

            {/* Category Badges */}
            <div className="flex flex-wrap gap-1.5 justify-center md:justify-start pt-1.5">
              {store.categories && store.categories.length > 0 ? (
                store.categories.map((cat: any) => (
                  <span
                    key={cat.id}
                    className="text-[10px] font-extrabold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                  >
                    {cat.name}
                  </span>
                ))
              ) : (
                <span className="text-[10px] font-extrabold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Boutique Shop
                </span>
              )}

              {/* Product Count Badge */}
              <span className="text-[10px] font-extrabold text-accent bg-accent/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Package size={10} />
                {store.productCount ?? 0} {store.productCount === 1 ? 'Product' : 'Products'}
              </span>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="space-y-6">
          <div className="flex flex-col gap-4 border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-foreground tracking-tight">
                {selectedSubcategory ? selectedSubcategory : (searchQuery ? 'Search Results' : 'Products Available')}
              </h3>
              <span className="text-xs text-muted-foreground font-semibold">
                Showing {filteredProducts.length} of {store.products?.length || 0} items
              </span>
            </div>

            {/* Horizontal Subcategory Filter Bar */}
            {store.subcategories && store.subcategories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none items-center scroll-smooth -mx-4 px-4 sm:-mx-0 sm:px-0">
                <button
                  onClick={() => setSelectedSubcategory(null)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all duration-300 border ${
                    selectedSubcategory === null
                      ? 'border-primary bg-primary text-white shadow-md scale-105 hover:scale-105'
                      : 'border-border bg-white text-muted-foreground hover:text-foreground hover:border-gray-300'
                  }`}
                >
                  All Products
                </button>

                {store.subcategories.map((subcat: any) => (
                  <button
                    key={subcat.id}
                    onClick={() => setSelectedSubcategory(subcat.name)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all duration-300 border ${
                      selectedSubcategory?.toLowerCase() === subcat.name.toLowerCase()
                        ? 'border-primary bg-primary text-white shadow-md scale-105 hover:scale-105'
                        : 'border-border bg-white text-muted-foreground hover:text-foreground hover:border-gray-300'
                    }`}
                  >
                    {subcat.image && (
                      <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 border border-black/10">
                        <img
                          src={subcat.image}
                          alt={subcat.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <span>{subcat.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center max-w-sm mx-auto">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Search className="text-muted-foreground" size={20} />
              </div>
              <h4 className="text-sm font-bold text-foreground mb-0.5">No Products Found</h4>
              <p className="text-xs text-muted-foreground">
                We couldn't find any products in this store matching "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  id={prod.id}
                  name={prod.name}
                  category={prod.category}
                  price={prod.price}
                  images={prod.images}
                  image={prod.images?.[0]}
                  mrp={prod.mrp}
                  discount={prod.discount}
                  rating={prod.rating || 4.2}
                  onAddToCart={addItem}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation cartCount={cartCount} />
    </div>
  );
}
