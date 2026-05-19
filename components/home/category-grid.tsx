'use client';

import Link from 'next/link';
import { Sofa, Shirt, Watch, ShoppingBag, Laptop, LayoutDashboard, Apple, Book } from 'lucide-react';

interface CategoryGridProps {
  categories: any[];
}

const getCategoryIcon = (name: string) => {
  const searchStr = name.toLowerCase();
  if (searchStr.includes('furniture')) return <Sofa size={28} className="text-black" />;
  if (searchStr.includes('cloth') || searchStr.includes('wear')) return <Shirt size={28} className="text-black" />;
  if (searchStr.includes('accessor')) return <Watch size={28} className="text-black" />;
  if (searchStr.includes('electron')) return <Laptop size={28} className="text-black" />;
  if (searchStr.includes('grocer') || searchStr.includes('food')) return <Apple size={28} className="text-black" />;
  if (searchStr.includes('book')) return <Book size={28} className="text-black" />;
  return <ShoppingBag size={28} className="text-black" />;
};

export function CategoryGrid({ categories }: CategoryGridProps) {
  // Show up to 5 categories on mobile, more on larger screens
  const displayCategories = categories.slice(0, 5);

  return (
    <div className="w-full">
      {/* Grid of Categories (6 columns so 5 items + View All fit perfectly across full width) */}
      <div className="grid grid-cols-6 md:grid-cols-14 lg:grid-cols-16 gap-2 sm:gap-3 w-full">
        {displayCategories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.id}`}
            className="group flex flex-col items-center gap-1 bg-white rounded-md shadow-md border-2 border-[#FFB600]"
          >
            {/* Category Icon Box */}
            <div className="w-6 h-6 flex items-center justify-center group-hover:bg-primary/5 transition-all duration-300">
              {getCategoryIcon(category.name)}
            </div>

            {/* Content */}
            <div className="text-center w-full px-0.5">
              <h3 className="text-gray-800 font-semibold text-[12px] leading-tight truncate group-hover:text-primary transition-colors">{category.name}</h3>
            </div>
          </Link>
        ))}

        {/* View All Categories */}
        <Link
          href="/categories"
          className="group flex flex-col items-center gap-1 bg-white rounded-md shadow-md border-2 border-[#FFB600]"
        >
          <div className="w-6 h-6 rounded-2xl flex items-center justify-center transition-all duration-300">
            <LayoutDashboard size={28} />
          </div>
          <div className="text-center w-full px-0.5">
            <h3 className="text-gray-800 font-medium text-[10px] leading-tight truncate group-hover:text-primary transition-colors">View All</h3>
          </div>
        </Link>
      </div>
    </div>
  );
}
