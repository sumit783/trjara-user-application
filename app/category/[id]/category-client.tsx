'use client';

import { BottomNavigation } from '@/components/bottom-navigation';
import { ProductCard } from '@/components/product-card';
import { useCart } from '@/lib/cart-context';
import { getProductsByCategory, getCategoryById } from '@/lib/products';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function CategoryClient({ categoryId }: { categoryId: string }) {
  const { items, addItem } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const category = getCategoryById(categoryId);
  const categoryProducts = getProductsByCategory(category?.name || '');

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="px-4 py-4 flex items-center gap-3 border-b border-gray-100">
          <Link href="/categories" className="p-2 hover:bg-gray-100 rounded-lg transition-colors -ml-2">
            <ChevronRight size={24} className="text-foreground rotate-180" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">{category?.name}</h1>
            <p className="text-xs text-muted-foreground">{categoryProducts.length} products</p>
          </div>
        </div>
      </div>

      {/* Category Description Banner */}
      <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-muted-foreground">
            {category?.description}
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="px-4 py-6">
        {categoryProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              No products found in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {categoryProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={addItem}
              />
            ))}
          </div>
        )}
      </section>

      <BottomNavigation cartCount={cartCount} />
    </div>
  );
}
