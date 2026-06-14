'use client';

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

interface PromoBanner {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  image: string;
  bgGradient: string;
}

const banners: PromoBanner[] = [
  {
    id: 'banner-1',
    tag: 'Limited Time',
    title: 'Summer\nSale',
    subtitle: 'Get up to 50% OFF',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=250&h=250&fit=crop',
    bgGradient: 'from-primary via-accent to-orange-500',
  },
  {
    id: 'banner-2',
    tag: 'New Collection',
    title: 'Modern\nLiving',
    subtitle: 'Premium Furniture 30% OFF',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=250&h=250&fit=crop',
    bgGradient: 'from-blue-600 via-indigo-600 to-purple-600',
  },
  {
    id: 'banner-3',
    tag: 'Exclusive Deal',
    title: 'Designer\nFashion',
    subtitle: 'Free Shipping Across Orders',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=250&h=250&fit=crop',
    bgGradient: 'from-pink-600 via-rose-500 to-red-600',
  },
];

export function PromoCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    // Auto scroll every 4 seconds
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);

    return () => {
      clearInterval(interval);
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="max-w-7xl w-full mx-auto px-3 mt-6 mb-7 flex flex-col items-center">
      <div className="overflow-hidden w-full rounded-3xl shadow-xl" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="flex-none w-full relative aspect-[16/6] md:aspect-[21/7] lg:aspect-[21/5] flex items-end justify-between p-4 sm:p-6 md:p-8 overflow-hidden"
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${banner.bgGradient}`} />
              
              {/* Content */}
              <div className="relative z-10 text-white max-w-[60%] sm:max-w-xs pointer-events-none">
                <p className="text-[9px] sm:text-xs font-bold uppercase opacity-90 tracking-wide">
                  {banner.tag}
                </p>
                <h2 className="text-sm sm:text-xl md:text-3xl lg:text-4xl font-black leading-tight mt-0.5 sm:mt-1 whitespace-pre-line">
                  {banner.title}
                </h2>
                <p className="text-[10px] sm:text-xs md:text-sm font-semibold opacity-95 mt-0.5 sm:mt-2 line-clamp-1">
                  {banner.subtitle}
                </p>
              </div>

              {/* Product Image */}
              <div className="absolute right-0 bottom-0 h-[85%] aspect-square -mr-2 -mb-2 pointer-events-none">
                <img
                  src={banner.image}
                  alt={banner.title.replace('\n', ' ')}
                  className="w-full h-full object-cover drop-shadow-md"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-3 items-center">
        {banners.map((_, index) => (
          <button
            key={index}
            suppressHydrationWarning
            onClick={() => emblaApi?.scrollTo(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              selectedIndex === index ? 'w-6 bg-primary' : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
