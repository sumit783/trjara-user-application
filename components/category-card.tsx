'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CategoryCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

export function CategoryCard({
  id,
  name,
  description,
  image,
  productCount,
}: CategoryCardProps) {
  return (
    <Link href={`/category/${id}`}>
      <div className="relative h-48 sm:h-56 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer">
        {/* Background Image */}
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-primary/60 group-hover:from-primary/50 group-hover:to-primary/70 transition-all duration-300" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6 text-white">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold drop-shadow-lg">
              {name}
            </h3>
            <p className="text-sm sm:text-base text-white/90 mt-1 drop-shadow">
              {description}
            </p>
          </div>

          {/* Bottom Info */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              {productCount} items
            </span>
            <ArrowRight
              size={24}
              className="group-hover:translate-x-2 transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
