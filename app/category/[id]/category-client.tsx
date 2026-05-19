'use client';

import { BottomNavigation } from '@/components/bottom-navigation';
import { ProductCard } from '@/components/product-card';
import { useCart } from '@/lib/cart-context';
import { getCategoryById } from '@/lib/products';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchProductsByCategory } from '@/lib/api/categories';
import { Skeleton } from '@/components/ui/skeleton';

export function CategoryClient({ categoryId }: { categoryId: string }) {
  const { items, addItem } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const category = getCategoryById(categoryId);

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const result = await fetchProductsByCategory(categoryId);
        if (result.success) {
          setProducts(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    getProducts();
  }, [categoryId]);

  const categoryName = category?.name || products[0]?.category || 'Category';

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="px-4 py-4 flex items-center gap-3 border-b border-gray-100">
          <Link href="/categories" className="p-2 hover:bg-gray-100 rounded-lg transition-colors -ml-2">
            <ChevronRight size={24} className="text-foreground rotate-180" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">{categoryName}</h1>
            <p className="text-xs text-muted-foreground">{products.length} products</p>
          </div>
        </div>
      </div>
      {/* Products Grid */}
      <section className="px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              No products found in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {products.map((product) => (
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
