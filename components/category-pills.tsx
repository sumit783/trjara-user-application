'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

interface CategoryPillsProps {
  categories: Array<{
    id: string;
    name: string;
  }>;
}

export function CategoryPills({ categories }: CategoryPillsProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || '');
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="px-4 py-4 border-b border-gray-100 bg-white">
      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto pb-2 hide-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* All Categories Pill */}
        <button
          onClick={() => setActiveCategory('')}
          className={`flex-shrink-0 px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
            activeCategory === ''
              ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
              activeCategory === category.id
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
