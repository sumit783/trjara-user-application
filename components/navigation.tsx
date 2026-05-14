'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, X, WifiOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/components/pwa-provider';

interface NavigationProps {
  cartCount: number;
}

export function Navigation({ cartCount }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isOffline } = usePWA();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-gradient-to-r from-primary to-accent">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="hidden sm:inline font-bold text-lg text-white">StyleHub</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-white hover:text-white/80 transition-colors font-medium"
          >
            Home
          </Link>
          <Link
            href="/#categories"
            className="text-white hover:text-white/80 transition-colors font-medium"
          >
            Browse
          </Link>
          {isOffline && (
            <div className="flex items-center gap-1 text-red-300 text-xs font-semibold">
              <WifiOff size={14} />
              <span>Offline</span>
            </div>
          )}
        </div>

        {/* Right Section: Mobile Menu, Cart */}
        <div className="flex items-center gap-2 md:gap-4">
          {isOffline && (
            <div className="md:hidden flex items-center gap-1 text-red-300 text-xs font-semibold">
              <WifiOff size={14} />
            </div>
          )}

          {/* Cart Button */}
          <Link href="/cart" className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 relative"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border/20 bg-gradient-to-b from-primary to-primary/80 px-4 py-3">
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="text-white hover:text-white/80 transition-colors font-medium py-2"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/#categories"
              className="text-white hover:text-white/80 transition-colors font-medium py-2"
              onClick={() => setIsOpen(false)}
            >
              Browse
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}


