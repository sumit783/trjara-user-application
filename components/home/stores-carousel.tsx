'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface Store {
  id: string;
  name: string;
  image: string;
  rating?: number;
  category?: string;
}

export const stores: Store[] = [
  {
    id: '1',
    name: 'Fashion Hub',
    image: 'https://images.unsplash.com/photo-1441984904556-0ac8d9c98337?w=120&h=120&fit=crop',
    rating: 4.8,
    category: 'Clothing',
  },
  {
    id: '2',
    name: 'Tech Zone',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=120&h=120&fit=crop',
    rating: 4.9,
    category: 'Electronics',
  },
  {
    id: '3',
    name: 'Home Decor',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=120&h=120&fit=crop',
    rating: 4.7,
    category: 'Furniture',
  },
  {
    id: '4',
    name: 'Beauty Shop',
    image: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=120&h=120&fit=crop',
    rating: 4.6,
    category: 'Cosmetics',
  },
  {
    id: '5',
    name: 'Sports Arena',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=120&h=120&fit=crop',
    rating: 4.5,
    category: 'Sports',
  },
];

export function StoresCarousel({ apiStores }: { apiStores?: Store[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const displayStores = apiStores && apiStores.length > 0 ? apiStores : stores;

  return (
    <div className="px-4">
      <div className="relative">
        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto pb-2 scroll-smooth hide-scrollbar items-center"
          style={{ scrollBehavior: 'smooth', scrollSnapType: 'x mandatory' }}
        >
          {displayStores.map((store) => (
            <Link
              key={store.id}
              href={`/store?id=${store.id}`}
              className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer group"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Store Image */}
              <div className="w-18 h-18 rounded-full overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300 border border-black">
                <img
                  src={store.image}
                  alt={store.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            </Link>
          ))}

          {/* View All Stores Button */}
          <Link
            href="/stores"
            className="flex-shrink-0 flex flex-col items-center gap-1 group"
            style={{ scrollSnapAlign: 'start' }}
          >
            <div className="w-18 h-18 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 group-hover:bg-primary/20 transition-all duration-300 shadow-md">
              <ChevronRight size={28} className="text-primary" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
