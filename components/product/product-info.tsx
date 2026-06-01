'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface ProductInfoProps {
  name: string;
  description: string;
  rating: number;
  brand?: string;
}

export function ProductInfo({
  name,
  description,
  rating,
  brand = 'Trjara Studio',
}: ProductInfoProps) {
  return (
    <div className="space-y-3">
      {/* Brand & Name */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">
          Brand: {brand || 'Trjara Studio'}
        </p>
        <h1 className="text-2xl sm:text-4xl font-black text-foreground leading-tight">
          {name}
        </h1>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={18}
              className={
                i < Math.floor(rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }
            />
          ))}
        </div>
        <span className="text-xs font-bold text-muted-foreground">
          ({rating} / 5.0 • 128 Reviews)
        </span>
      </div>

      {/* Description */}
      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pt-2">
        {description}
      </p>
    </div>
  );
}
