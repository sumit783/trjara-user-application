'use client';

import Link from 'next/link';
import { BottomNavigation } from '@/components/bottom-navigation';
import { AppHeader } from '@/components/app-header';
import { ChevronLeft } from 'lucide-react';
import { categories } from '@/lib/products';
import { useCart } from '@/lib/cart-context';

export default function CategoriesPage() {
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="px-4 py-4 flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft size={24} className="text-foreground" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">All Categories</h1>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 h-48"
            >
              {/* Category Background Image */}
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-4">
                <h3 className="text-white font-bold text-lg">{category.name}</h3>
                <p className="text-white/80 text-sm">{category.productCount} products</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation cartCount={cartCount} />
    </div>
  );
}
