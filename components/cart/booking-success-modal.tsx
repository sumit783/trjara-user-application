'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface BookingSuccessModalProps {
  isOpen: boolean;
}

export function BookingSuccessModal({ isOpen }: BookingSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-md text-center space-y-4 shadow-2xl border border-border">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
          <ShoppingCart size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-black text-foreground">
          Booking Confirmed!
        </h2>
        <p className="text-muted-foreground font-medium text-sm">
          Your products have been booked successfully. You&apos;ll receive a confirmation email shortly.
        </p>
      </div>
    </div>
  );
}
