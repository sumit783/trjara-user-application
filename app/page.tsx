'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchTopStoreLogos } from '@/lib/api/stores';
import { fetchTopPicks, fetchFreshHealthy, fetchWeeklyDeals, fetchBestSellers, fetchNewArrivals } from '@/lib/api/sections';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { AppHeaderEnhanced } from '@/components/home/app-header-enhanced';
import { StoresCarousel } from '@/components/home/stores-carousel';
import { ProductCarousel } from '@/components/home/product-carousel';
import { PromoCarousel } from '@/components/home/promo-carousel';
import { useCart } from '@/lib/cart-context';
import { categories, products } from '@/lib/products';
import { fetchPrimaryCategories } from '@/lib/api/categories';
import { useLocation } from '@/lib/location-context';

export default function Home() {
  const { items, addItem } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const { location } = useLocation();
  const lat = location?.lat;
  const lng = location?.lng;

  const { data: storeLogosResponse, isLoading: isLoadingStores, error: storesError } = useQuery({
    queryKey: ['top-store-logos', lat, lng],
    queryFn: () => fetchTopStoreLogos(lat, lng)
  });

  const apiStores = storeLogosResponse?.data?.map((store: any, index: number) => ({
    id: store._id,
    name: `Store ${index + 1}`,
    image: store.logo,
  })) || [];

  const { data: topPicksResponse, isLoading: isLoadingTopPicks, error: topPicksError } = useQuery({
    queryKey: ['top-picks', lat, lng],
    queryFn: () => fetchTopPicks(lat, lng)
  });

  const { data: freshHealthyResponse, isLoading: isLoadingFreshHealthy } = useQuery({
    queryKey: ['fresh-healthy', lat, lng],
    queryFn: () => fetchFreshHealthy(lat, lng)
  });

  const { data: weeklyDealsResponse, isLoading: isLoadingWeeklyDeals } = useQuery({
    queryKey: ['weekly-deals', lat, lng],
    queryFn: () => fetchWeeklyDeals(lat, lng)
  });

  const { data: bestSellersResponse, isLoading: isLoadingBestSellers } = useQuery({
    queryKey: ['best-sellers', lat, lng],
    queryFn: () => fetchBestSellers(lat, lng)
  });

  const { data: categoriesResponse, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['primary-categories'],
    queryFn: fetchPrimaryCategories
  });

  const apiCategories = categoriesResponse?.data || [];

  const { data: newArrivalsResponse, isLoading: isLoadingNewArrivals } = useQuery({
    queryKey: ['new-arrivals', lat, lng],
    queryFn: () => fetchNewArrivals(lat, lng)
  });

  // Group products by category for carousels (fallbacks)
  const fallbackTopPicks = products.slice(0, 4);
  const fallbackFreshHealthy = products.slice(4, 8);
  const fallbackWeeklyDeals = products.slice(8, 12);

  const mapItems = (response: any, fallback: any[]) => {
    return response?.data?.items?.map((item: any) => ({
      id: item.id,
      inventoryId: item.inventoryId || item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      images: item.images,
      image: item.images?.[0] || '',
      mrp: item.mrp,
      discount: item.discount,
      rating: item.rating,
    })) || fallback;
  };

  const apiTopPicks = mapItems(topPicksResponse, fallbackTopPicks);
  const apiFreshHealthy = mapItems(freshHealthyResponse, fallbackFreshHealthy);
  const apiWeeklyDeals = mapItems(weeklyDealsResponse, fallbackWeeklyDeals);
  const apiBestSellers = mapItems(bestSellersResponse, []);
  const apiNewArrivals = mapItems(newArrivalsResponse, []);

  const topPicksTitle = topPicksResponse?.data?.title || "Top Picks For You";
  const freshHealthyTitle = freshHealthyResponse?.data?.title || "Fresh & Healthy";
  const weeklyDealsTitle = weeklyDealsResponse?.data?.title || "Weekly Deals";
  const bestSellersTitle = bestSellersResponse?.data?.title || "Best Sellers";
  const newArrivalsTitle = newArrivalsResponse?.data?.title || "New Arrivals";

  const renderCarousel = (title: string, sectionProducts: any[], isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="py-6 px-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="flex-shrink-0 w-44 sm:w-48 h-64 rounded-2xl" />
            ))}
          </div>
        </div>
      );
    }
    if (sectionProducts.length === 0) return null;
    return (
      <ProductCarousel
        title={title}
        products={sectionProducts}
        onAddToCart={addItem}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Enhanced Header with Search, Location, and Overlapping Categories */}
      <AppHeaderEnhanced categories={apiCategories.length > 0 ? apiCategories : categories} />

      {/* Promotional Image Slider */}
      <PromoCarousel />

      {(storesError || topPicksError) ? (
        <div className="flex flex-col items-center justify-center p-8 mt-12 text-center animate-in fade-in duration-500">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Not Available</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            {storesError?.message || topPicksError?.message || "Sorry, we don't provide service in your selected area yet. We are expanding rapidly, please check back soon!"}
          </p>
        </div>
      ) : (
        <>
          {/* All Stores Carousel */}
          {isLoadingStores ? (
            <div className="px-4 py-2 flex gap-2 overflow-x-auto">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="w-18 h-18 rounded-full flex-shrink-0" />
              ))}
            </div>
          ) : (
            <StoresCarousel apiStores={apiStores} />
          )}

          {/* Product Carousels */}
          {renderCarousel(topPicksTitle, apiTopPicks, isLoadingTopPicks)}
          {renderCarousel(freshHealthyTitle, apiFreshHealthy, isLoadingFreshHealthy)}
          {renderCarousel(weeklyDealsTitle, apiWeeklyDeals, isLoadingWeeklyDeals)}
          {renderCarousel(bestSellersTitle, apiBestSellers, isLoadingBestSellers)}
          {renderCarousel(newArrivalsTitle, apiNewArrivals, isLoadingNewArrivals)}
        </>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation cartCount={cartCount} />
    </div>
  );
}
