'use client';

import { BottomNavigation } from '@/components/bottom-navigation';
import { AppHeader } from '@/components/app-header';
import { useCart } from '@/lib/cart-context';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleBooking = () => {
    setBookingConfirmed(true);
    setTimeout(() => {
      clearCart();
      setBookingConfirmed(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader />

      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-16">
        {bookingConfirmed && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-8 max-w-md text-center space-y-4 shadow-2xl">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <ShoppingCart size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Booking Confirmed!
              </h2>
              <p className="text-muted-foreground">
                Your products have been booked successfully. You&apos;ll receive a confirmation email shortly.
              </p>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart size={64} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground mb-6">
              Start adding products to your cart to see them here
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
            >
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold text-foreground mb-6">
                Shopping Cart ({cartCount} items)
              </h1>

              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-white rounded-lg border border-border hover:shadow-md transition-all duration-300"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-grow">
                      <h3 className="font-bold text-lg text-foreground line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-sm text-primary font-semibold">
                        {item.category}
                      </p>
                      <p className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mt-2">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end justify-between">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, Math.max(1, item.quantity - 1))
                          }
                          className="p-2 rounded hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={18} className="text-primary" />
                        </button>
                        <span className="w-8 text-center font-semibold text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-2 rounded hover:bg-gray-100 transition-colors"
                        >
                          <Plus size={18} className="text-primary" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 rounded hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={20} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border rounded-lg p-6 sticky top-28 space-y-4">
                <h2 className="text-xl font-bold text-foreground">
                  Order Summary
                </h2>

                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-semibold text-foreground">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span className="font-semibold text-foreground">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax:</span>
                    <span className="font-semibold text-foreground">
                      ${(total * 0.1).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 flex justify-between items-center">
                  <span className="font-bold text-lg text-foreground">
                    Total:
                  </span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    ${(total * 1.1).toFixed(2)}
                  </span>
                </div>

                <Button
                  onClick={handleBooking}
                  disabled={items.length === 0}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold h-12 mt-6"
                >
                  Complete Booking
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full border-2 border-primary text-primary hover:bg-primary/5"
                >
                  <Link href="/">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation cartCount={cartCount} />
    </div>
  );
}
