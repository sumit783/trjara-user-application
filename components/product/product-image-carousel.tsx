'use client';

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Share2 } from 'lucide-react';

interface ProductImageCarouselProps {
  images: string[];
  productName: string;
  category: string;
  onShare: () => void;
}

export function ProductImageCarousel({
  images,
  productName,
  category,
  onShare,
}: ProductImageCarouselProps) {
  const [imageCarouselRef, imageCarouselApi] = useEmblaCarousel({ loop: true });
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const onSelectImage = useCallback(() => {
    if (!imageCarouselApi) return;
    setSelectedImageIndex(imageCarouselApi.selectedScrollSnap());
  }, [imageCarouselApi]);

  useEffect(() => {
    if (!imageCarouselApi) return;
    onSelectImage();
    imageCarouselApi.on('select', onSelectImage);
    imageCarouselApi.on('reInit', onSelectImage);
    return () => {
      imageCarouselApi.off('select', onSelectImage);
      imageCarouselApi.off('reInit', onSelectImage);
    };
  }, [imageCarouselApi, onSelectImage]);

  const productImages = images && images.length > 0 ? images : ['https://via.placeholder.com/600'];

  return (
    <div className="relative aspect-square w-full overflow-hidden shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200 border border-black/5 group">
      <div className="overflow-hidden w-full h-full" ref={imageCarouselRef}>
        <div className="flex w-full h-full touch-pan-y">
          {productImages.map((img, index) => (
            <div key={index} className="flex-none w-full h-full relative flex items-center justify-center">
              <img
                src={img}
                alt={`${productName} - View ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Share Button */}
      <button
        onClick={onShare}
        className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg hover:bg-white text-gray-800 hover:text-primary transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Share product"
      >
        <Share2 size={20} />
      </button>

      {/* Category Badge */}
      <span className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full tracking-wider">
        {category}
      </span>

      {/* Carousel Indicator Dots */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full items-center">
        {productImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => imageCarouselApi?.scrollTo(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              selectedImageIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
