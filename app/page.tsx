'use client';

import { BottomNavigation } from '@/components/bottom-navigation';
import { AppHeaderEnhanced } from '@/components/home/app-header-enhanced';
import { StoresCarousel } from '@/components/home/stores-carousel';
import { ProductCarousel } from '@/components/home/product-carousel';
import { PromoCarousel } from '@/components/home/promo-carousel';
import { useCart } from '@/lib/cart-context';
import { categories, products } from '@/lib/products';

export default function Home() {
  const { items, addItem } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Group products by category for carousels
  const topPicks = products.slice(0, 4);
  const freshHealthy = products.slice(4, 8);
  const weeklyDeals = products.slice(8, 12);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Enhanced Header with Search, Location, and Overlapping Categories */}
      <AppHeaderEnhanced categories={categories} />

      {/* Promotional Image Slider */}
      <PromoCarousel />

      {/* All Stores Carousel */}
      <StoresCarousel />

      {/* Product Carousels */}
      <ProductCarousel
        title="Top Picks For You"
        products={topPicks}
        onAddToCart={addItem}
      />

      <ProductCarousel
        title="Fresh & Healthy"
        products={freshHealthy}
        onAddToCart={addItem}
      />

      <ProductCarousel
        title="Weekly Deals"
        products={weeklyDeals}
        onAddToCart={addItem}
      />

      {/* Bottom Navigation */}
      <BottomNavigation cartCount={cartCount} />
    </div>
  );
}
