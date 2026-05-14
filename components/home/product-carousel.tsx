'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '../product-card';
import { Button } from '@/components/ui/button';

interface ProductCarouselProps {
  title: string;
  products: any[];
  onAddToCart: (product: any) => void;
}

export function ProductCarousel({
  title,
  products,
  onAddToCart,
}: ProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="py-6 px-4">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-base font-black text-foreground">{title}</h3>
        <button className="text-xs text-primary hover:text-accent transition-colors font-black uppercase tracking-widest">
          See All
        </button>
      </div>

      <div className="relative">
        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-2 scroll-smooth hide-scrollbar"
          style={{ scrollBehavior: 'smooth', scrollSnapType: 'x mandatory' }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-44 sm:w-48"
              style={{ scrollSnapAlign: 'start' }}
            >
              <ProductCard
                {...product}
                onAddToCart={onAddToCart}
              />
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full shadow-md border-border hover:bg-primary hover:text-white"
        >
          <ChevronLeft size={20} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full shadow-md border-border hover:bg-primary hover:text-white"
        >
          <ChevronRight size={20} />
        </Button>
      </div>
    </div>
  );
}
