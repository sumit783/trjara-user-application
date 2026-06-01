'use client';

import Link from 'next/link';
import { Heart, Plus, Star, ShoppingCart, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '@/lib/cart-context';

interface ProductCardProps {
  id: string;
  inventoryId?: string;
  name: string;
  category: string;
  price: number;
  image?: string;
  images?: string[];
  mrp?: number;
  discount?: number;
  rating: number;
  onAddToCart: (product: any) => void;
}

export function ProductCard({
  id,
  inventoryId,
  name,
  category,
  price,
  image,
  images,
  mrp,
  discount: apiDiscount,
  rating,
  onAddToCart,
}: ProductCardProps) {
  const { items } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isInCart = items.some((item) => item.id === id || (inventoryId && item.inventoryId === inventoryId));

  // Generate a stable pseudo-random discount based on the product id string
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const fallbackDiscount = (hash % 30) + 10; // Stable discount 10-39%
  const discount = apiDiscount !== undefined ? apiDiscount : fallbackDiscount;

  const displayImages = images?.length ? images : (image ? [image] : []);

  const originalPrice = mrp !== undefined ? mrp : price;
  const sellingPrice = mrp !== undefined ? price : (price * (1 - discount / 100));

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden h-full shadow-[0_4px_20px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.14)] transition-all duration-300 group flex flex-col border border-gray-100 relative">
      {/* Discount Tag */}
      <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] sm:text-[10px] font-black px-2 py-1 rounded-full shadow-md">
        {discount}% OFF
      </div>

      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          setIsFavorite(!isFavorite);
        }}
        className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 p-1.5 sm:p-2 rounded-full bg-white/80 backdrop-blur-md shadow-sm hover:bg-white transition-all duration-300"
      >
        <Heart
          size={16}
          className={`transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
        />
      </button>

      {/* Image Container */}
      <Link href={`/product?id=${id}`} className="block overflow-hidden relative flex-shrink-0">
        <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
          <img
            src={displayImages[0] || ''}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Rating Badge */}
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Star size={10} className="fill-yellow-400 text-yellow-400 sm:w-3 sm:h-3" />
            <span className="text-[10px] sm:text-[11px] font-black text-gray-800">{rating}</span>
          </div>
        </div>
      </Link>

      {/* Content Container */}
      <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[9px] sm:text-[10px] font-black tracking-wider text-primary uppercase bg-primary/5 px-2 py-0.5 rounded-full inline-block mb-0.5">
            {category}
          </span>
          <Link href={`/product?id=${id}`}>
            <h3 className="font-bold text-gray-900 line-clamp-2 text-sm sm:text-xs leading-snug group-hover:text-primary transition-colors">
              {name}
            </h3>
          </Link>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-1.5 flex items-end justify-between gap-1 pt-1.5 border-t border-gray-50">
          <div>
            <p className="text-[9px] sm:text-[10px] text-gray-400 line-through leading-none">
              ₹{originalPrice.toFixed(2)}
            </p>
            <p className="text-xs sm:text-sm font-black text-gray-900 leading-none mt-0.5">
              ₹{sellingPrice.toFixed(2)}
            </p>
          </div>

          <button
            onClick={async () => {
              if (isLoading) return;
              setIsLoading(true);
              try {
                await onAddToCart({ id, inventoryId, name, price, category, image, rating });
              } catch (error) {
                console.error(error);
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            className={`h-8 w-8 sm:h-9 sm:w-9 rounded-xl sm:rounded-2xl flex items-center justify-center transition-colors duration-300 shadow-md group-hover:scale-105 active:scale-95 flex-shrink-0 ${isLoading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : isInCart
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-black hover:bg-primary text-white'
              }`}
          >
            {isLoading ? (
              <Loader2 className="animate-spin sm:w-4 sm:h-4 text-white" size={16} />
            ) : isInCart ? (
              <ShoppingCart size={16} className="sm:w-4 sm:h-4 animate-pulse" />
            ) : (
              <Plus size={16} className="sm:w-4 sm:h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
