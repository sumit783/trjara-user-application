'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, AlertCircle, Clock } from 'lucide-react';
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
    deliveryTime?: number;
  } | null;
  onCompleteBooking: (paymentMethod: 'ONLINE' | 'COD' | 'WALLET') => void;
  itemsCount: number;
  codInfo?: {
    isCodAvailable: boolean;
    codCharge: number;
    codDisableReason?: string;
  } | null;
  useWallet?: boolean;
  setUseWallet?: (val: boolean) => void;
  walletBalance?: number;
}

const formatDeliveryTime = (mins: number) => {
  if (mins === undefined || mins === null) return '';
  const roundedMins = Math.round(mins);
  if (roundedMins <= 0) return '';
  if (roundedMins < 60) {
    return `${roundedMins} mins`;
  }
  const hrs = Math.floor(roundedMins / 60);
  const remainingMins = roundedMins % 60;
  const hh = String(hrs).padStart(2, '0');
  const mm = String(remainingMins).padStart(2, '0');
  return `${hh}:${mm}`;
};

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
  useWallet = false,
  setUseWallet,
  walletBalance = 0,
}: OrderSummaryProps) {
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod' | 'wallet'>('online');

  const finalTotal = totalAmount + (paymentMethod === 'cod' && codInfo?.isCodAvailable ? codInfo.codCharge : 0);
  const amountToPay = useWallet ? Math.max(0, finalTotal - walletBalance) : finalTotal;
  const walletDeducted = useWallet ? Math.min(finalTotal, walletBalance) : 0;

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
              <div className="flex-1">
                <p className="font-extrabold">Delivery Address Verified</p>
                <p className="opacity-90">Calculated delivery path covers {distanceInfo.totalDistance.toFixed(2)} km.</p>
                {distanceInfo.deliveryTime !== undefined && distanceInfo.deliveryTime !== null && distanceInfo.deliveryTime > 0 && (
                  <p className="mt-1 font-black text-emerald-700 flex items-center gap-1 text-[10px]">
                    <Clock size={12} className="text-emerald-600 flex-shrink-0" />
                    <span>Estimated Delivery: {formatDeliveryTime(distanceInfo.deliveryTime)}</span>
                  </p>
                )}
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

        {isBackendCartActive && distanceInfo && distanceInfo.deliveryTime !== undefined && distanceInfo.deliveryTime !== null && distanceInfo.deliveryTime > 0 && (
          <div className="flex justify-between border-t border-dashed border-border pt-3 text-foreground">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
              <Clock size={14} className="text-primary flex-shrink-0" />
              <span>Est. Delivery Time:</span>
            </span>
            <span className="font-black text-xs text-primary">
              {formatDeliveryTime(distanceInfo.deliveryTime)}
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
              onClick={() => {
                setPaymentMethod('online');
                if (setUseWallet) setUseWallet(false);
              }}
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
              onClick={() => {
                setPaymentMethod('cod');
                if (setUseWallet) setUseWallet(false);
              }}
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

            {walletBalance > 0 && (
              <button
                type="button"
                disabled={walletBalance < finalTotal}
                onClick={() => {
                  setPaymentMethod('wallet');
                  if (setUseWallet) setUseWallet(true);
                }}
                className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all duration-300 col-span-2 relative ${walletBalance < finalTotal
                  ? 'border-gray-100 bg-gray-50/50 opacity-60 cursor-not-allowed text-muted-foreground/60'
                  : paymentMethod === 'wallet'
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border bg-white text-muted-foreground hover:bg-gray-50'
                  }`}
              >
                <span className="text-[11px] font-black uppercase tracking-wide">Pay via Wallet</span>
                <span className="text-[10px] opacity-80 mt-0.5 w-full">
                  {walletBalance < finalTotal
                    ? `Insufficient Balance (₹${walletBalance.toFixed(2)} Available)`
                    : `₹${walletBalance.toFixed(2)} Available`}
                </span>
              </button>
            )}
          </div>

          {/* COD Disabled Warning */}
          {!codInfo.isCodAvailable && codInfo.codDisableReason && (
            <p className="text-[10px] font-bold text-amber-600 leading-tight pt-1">
              ⚠️ {codInfo.codDisableReason}
            </p>
          )}
        </div>
      )}

      {/* Wallet Toggle */}
      {isBackendCartActive && walletBalance > 0 && setUseWallet && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">Use Wallet Balance</span>
            <span className="text-xs text-emerald-600 font-semibold">Available: ₹{walletBalance.toFixed(2)}</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={useWallet}
            onClick={() => setUseWallet(!useWallet)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${useWallet ? 'bg-primary' : 'bg-muted'}`}
          >
            <span className="sr-only">Use wallet balance</span>
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${useWallet ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        </div>
      )}

      {/* Grand Total */}
      <div className="border-t border-border pt-4 flex flex-col gap-1">
        {useWallet && walletDeducted > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-muted-foreground">Wallet Deduction:</span>
            <span className="font-bold text-destructive">-₹{walletDeducted.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="font-black text-base text-foreground">
            {useWallet && walletDeducted >= finalTotal ? 'Total Amount' : 'Amount to Pay'}:
          </span>
          <span className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ₹{amountToPay.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="space-y-2 pt-4">
        <Button
          onClick={() => onCompleteBooking(paymentMethod.toUpperCase() as 'ONLINE' | 'COD' | 'WALLET')}
          disabled={itemsCount === 0}
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold h-12 rounded-xl shadow-sm text-sm"
        >
          Proceed to Checkout
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
