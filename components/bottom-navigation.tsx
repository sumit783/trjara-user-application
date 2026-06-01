'use client';

import Link from 'next/link';
import { Home, Grid3x3, ShoppingCart, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { useCart } from '@/lib/cart-context';

interface BottomNavigationProps {
  cartCount?: number;
}

export function BottomNavigation({ cartCount }: BottomNavigationProps) {
  const pathname = usePathname();
  const { items } = useCart();
  const displayCount = items.length;

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-around h-20 px-4">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-lg transition-all duration-200 ${
            isActive('/') && pathname !== '/cart'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Home size={24} />
          <span className="text-xs font-medium">Home</span>
        </Link>

        {/* Brands/Categories */}
        <Link
          href="/stores"
          className={`flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-lg transition-all duration-200 ${
            isActive('/stores')
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Grid3x3 size={24} />
          <span className="text-xs font-medium">Brands</span>
        </Link>

        {/* Cart */}
        <Link
          href="/cart"
          className={`flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-lg transition-all duration-200 relative ${
            isActive('/cart')
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShoppingCart size={24} />
          {displayCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {displayCount > 99 ? '99+' : displayCount}
            </span>
          )}
          <span className="text-xs font-medium">Cart</span>
        </Link>

        {/* Profile */}
        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-lg transition-all duration-200 ${
            pathname === '/profile'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <User size={24} />
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
