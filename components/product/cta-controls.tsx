'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CTAControlsProps {
  price: number;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  isInCart: boolean;
  addedToCart: boolean;
  onAddToCart: () => void;
}

export function CTAControls({
  price,
  quantity,
  setQuantity,
  isInCart,
  addedToCart,
  onAddToCart,
}: CTAControlsProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between">
        {/* Pricing */}
        <div className="flex-shrink-0 pr-2 border-r border-gray-200">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Total Price
          </p>
          <p className="text-lg sm:text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ₹{(price * quantity).toFixed(2)}
          </p>
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 border border-gray-200">
          <button
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            className="p-1 hover:bg-white rounded-lg transition-colors"
          >
            <Minus size={14} className="text-primary" />
          </button>
          <span className="w-5 sm:w-6 text-center text-xs sm:text-sm font-black text-foreground">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((prev) => prev + 1)}
            className="p-1 hover:bg-white rounded-lg transition-colors"
          >
            <Plus size={14} className="text-primary" />
          </button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={onAddToCart}
        disabled={isInCart}
        className={`flex-1 text-white h-11 text-xs sm:text-sm font-black relative overflow-hidden shadow-md px-2 sm:px-4 ${
          isInCart
            ? 'bg-emerald-600 cursor-not-allowed opacity-90'
            : 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90'
        }`}
      >
        {isInCart ? 'Already in Cart' : addedToCart ? 'Added!' : 'Add to Cart'}
      </Button>

      {/* Buy Now Button */}
      <Button
        asChild
        variant="outline"
        className="border-2 border-primary text-primary hover:bg-primary hover:text-white h-11 text-xs sm:text-sm font-black transition-all duration-300 px-2 sm:px-4"
      >
        <Link href="/cart">Buy Now</Link>
      </Button>
    </div>
  );
}
