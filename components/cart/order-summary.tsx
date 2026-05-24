'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderSummaryProps {
  itemsTotal: number;
  deliveryCharge: number;
  platformCharge: number;
  smallCartCharge: number;
  discountAmount: number;
  totalAmount: number;
  isBackendCartActive: boolean;
  distanceInfo: {
    totalDistance: number;
    message?: string;
  } | null;
  onCompleteBooking: () => void;
  itemsCount: number;
  codInfo: {
    isCodAvailable: boolean;
    codCharge: number;
    codDisableReason: string;
  } | null;
}

export function OrderSummary({
  itemsTotal,
  deliveryCharge,
  platformCharge,
  smallCartCharge,
  discountAmount,
  totalAmount,
  isBackendCartActive,
  distanceInfo,
  onCompleteBooking,
  itemsCount,
  codInfo,
}: OrderSummaryProps) {
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');

  return (
    <div className="bg-white border border-border rounded-3xl p-6 sticky top-24 space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
      <h2 className="text-lg font-black text-foreground tracking-tight border-b border-border pb-3">
        Order Summary
      </h2>

      {/* Dynamic Distance / Address warning bar */}
      {isBackendCartActive && distanceInfo && (
        <div className={`p-3 rounded-2xl flex gap-2.5 text-[11px] font-semibold leading-relaxed border ${distanceInfo.totalDistance > 0
          ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
          : 'bg-amber-50 text-amber-800 border-amber-100'
          }`}>
          {distanceInfo.totalDistance > 0 ? (
            <>
              <MapPin size={16} className="text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-extrabold">Delivery Address Verified</p>
                <p className="opacity-90">Calculated delivery path covers {distanceInfo.totalDistance.toFixed(2)} km.</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-extrabold">Address Context Alert</p>
                <p className="opacity-90">{distanceInfo.message || 'Verification pending address settings.'}</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Detailed Fee Pricing Block */}
      <div className="space-y-3 pt-2 text-xs font-semibold text-muted-foreground">
        <div className="flex justify-between">
          <span>Items Total:</span>
          <span className="text-foreground font-extrabold">
            ₹{itemsTotal.toFixed(2)}
          </span>
        </div>

        {deliveryCharge > 0 ? (
          <div className="flex justify-between">
            <span>Delivery Charge:</span>
            <span className="text-foreground font-extrabold">
              ₹{deliveryCharge.toFixed(2)}
            </span>
          </div>
        ) : (
          isBackendCartActive && (
            <div className="flex justify-between">
              <span>Delivery Charge:</span>
              <span className="text-emerald-600 font-extrabold">FREE</span>
            </div>
          )
        )}

        {platformCharge > 0 && (
          <div className="flex justify-between">
            <span>Platform Fee:</span>
            <span className="text-foreground font-extrabold">
              ₹{platformCharge.toFixed(2)}
            </span>
          </div>
        )}

        {smallCartCharge > 0 && (
          <div className="flex justify-between">
            <span>Small Cart Fee:</span>
            <span className="text-foreground font-extrabold">
              ₹{smallCartCharge.toFixed(2)}
            </span>
          </div>
        )}

        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Discount Applied:</span>
            <span className="font-extrabold">
              -₹{discountAmount.toFixed(2)}
            </span>
          </div>
        )}

        {!isBackendCartActive && (
          <div className="flex justify-between">
            <span>Simulated Tax (10%):</span>
            <span className="text-foreground font-extrabold">
              ₹{(itemsTotal * 0.1).toFixed(2)}
            </span>
          </div>
        )}

        {paymentMethod === 'cod' && codInfo && codInfo.isCodAvailable && codInfo.codCharge > 0 && (
          <div className="flex justify-between text-foreground">
            <span>Cash On Delivery Fee:</span>
            <span className="font-extrabold text-foreground">
              ₹{codInfo.codCharge.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Payment Method Selector */}
      {isBackendCartActive && codInfo && (
        <div className="space-y-2 border-t border-border pt-4">
          <span className="block text-xs font-black uppercase tracking-wider text-foreground">
            Payment Method
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setPaymentMethod('online')}
              className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all duration-300 ${paymentMethod === 'online'
                ? 'border-primary bg-primary/5 text-foreground'
                : 'border-border bg-white text-muted-foreground hover:bg-gray-50'
                }`}
            >
              <span className="text-[11px] font-black uppercase tracking-wide">Pay Online</span>
              <span className="text-[10px] opacity-80 mt-0.5">UPI, Cards</span>
            </button>

            <button
              type="button"
              disabled={!codInfo.isCodAvailable}
              onClick={() => setPaymentMethod('cod')}
              className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all duration-300 relative ${!codInfo.isCodAvailable
                ? 'border-gray-100 bg-gray-50/50 opacity-60 cursor-not-allowed text-muted-foreground/60'
                : paymentMethod === 'cod'
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border bg-white text-muted-foreground hover:bg-gray-50'
                }`}
            >
              <span className="text-[11px] font-black uppercase tracking-wide">Cash On Delivery</span>
              <span className="text-[10px] opacity-80 mt-0.5 truncate w-full">
                {codInfo.isCodAvailable
                  ? `Extra ₹${codInfo.codCharge}`
                  : 'Unavailable'}
              </span>
            </button>
          </div>

          {/* COD Disabled Warning */}
          {!codInfo.isCodAvailable && codInfo.codDisableReason && (
            <p className="text-[10px] font-bold text-amber-600 leading-tight pt-1">
              ⚠️ {codInfo.codDisableReason}
            </p>
          )}
        </div>
      )}

      {/* Grand Total */}
      <div className="border-t border-border pt-4 flex justify-between items-center">
        <span className="font-black text-base text-foreground">
          Total Amount:
        </span>
        <span className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          ₹{(totalAmount + (paymentMethod === 'cod' && codInfo?.isCodAvailable ? codInfo.codCharge : 0)).toFixed(2)}
        </span>
      </div>

      <div className="space-y-2 pt-4">
        <Button
          onClick={onCompleteBooking}
          disabled={itemsCount === 0}
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold h-12 rounded-xl shadow-sm text-sm"
        >
          Complete Booking
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full border-2 border-primary/20 text-primary hover:bg-primary/5 font-bold h-12 rounded-xl text-sm"
        >
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
