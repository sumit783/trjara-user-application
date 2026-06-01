'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { BottomNavigation } from '@/components/bottom-navigation';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, Clock, MapPin, Store, CreditCard, Package, Calendar, 
  Phone, Navigation, CheckCircle, ShieldCheck, Info
} from 'lucide-react';

// Time Formatter Helper
const formatDeliveryTime = (mins?: number) => {
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

export function OrderDetailsClient({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { items: cartItems } = useCart();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token'));
    }
  }, []);

  // Fetch individual order details
  const { data: orderResponse, isLoading, error } = useQuery({
    queryKey: ['order-details', orderId],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/orders/${orderId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch order details');
      }
      return res.json();
    },
    enabled: !!token && !!orderId,
  });

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-sm space-y-4 p-8 bg-card border border-border/40 rounded-3xl shadow-xl">
          <ShieldCheck className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-foreground">Authentication Required</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Please sign in to view tracking details for this purchase order.
          </p>
          <Button asChild className="w-full rounded-xl font-bold h-11">
            <Link href="/profile">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-28">
        <div className="bg-black rounded-b-3xl pb-6 pt-5 px-4 flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32 bg-white/10" />
            <Skeleton className="h-3.5 w-48 bg-white/10" />
          </div>
        </div>
        <div className="max-w-xl mx-auto w-full px-4 py-6 space-y-6">
          <Skeleton className="h-32 rounded-3xl bg-muted" />
          <Skeleton className="h-44 rounded-3xl bg-muted" />
          <Skeleton className="h-32 rounded-3xl bg-muted" />
        </div>
      </div>
    );
  }

  if (error || !orderResponse?.success || !orderResponse?.order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-sm space-y-4 p-8 bg-destructive/5 border border-destructive/10 rounded-3xl shadow-xl">
          <Info className="h-12 w-12 text-destructive mx-auto" />
          <h3 className="text-lg font-bold text-foreground">Order Not Found</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We could not fetch this order's tracking information. It may have been deleted or doesn't belong to your account.
          </p>
          <Button onClick={() => router.push('/profile/orders')} className="w-full rounded-xl font-bold h-11">
            Back to My Orders
          </Button>
        </div>
      </div>
    );
  }

  const order = orderResponse.order;

  // Extract variables
  const placedDate = new Date(order.placedAt || order.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const shopCoords = order.shopId?.location?.coordinates || null;
  const customerCoords = order.addressId?.location?.coordinates || null;

  // Google Maps direction link helper
  const getGoogleMapsLink = () => {
    if (shopCoords && customerCoords) {
      return `https://www.google.com/maps/dir/?api=1&origin=${shopCoords[1]},${shopCoords[0]}&destination=${customerCoords[1]},${customerCoords[0]}`;
    }
    return null;
  };

  // Status mapping
  const statusSteps = [
    { key: 'placed', label: 'Order Placed', desc: 'Awaiting shop confirmation' },
    { key: 'shipped', label: 'Shipped', desc: 'Item handoff completed' },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Rider is on the way' },
    { key: 'delivered', label: 'Delivered', desc: 'Package received safely' }
  ];

  const getActiveStatusIndex = (currentStatus: string) => {
    const status = currentStatus?.toLowerCase();
    if (status === 'order_placed' || status === 'placed') return 0;
    if (status === 'shipped') return 1;
    if (status === 'out_for_delivery') return 2;
    if (status === 'delivered') return 3;
    return -1;
  };

  const activeIndex = getActiveStatusIndex(order.status);
  const isCancelled = order.status?.toLowerCase() === 'cancelled' || order.status?.toLowerCase() === 'canceled';

  return (
    <div className="min-h-screen bg-background pb-28 animate-in fade-in duration-300">
      {/* Dynamic Header */}
      <div className="bg-black rounded-b-3xl shadow-lg pb-6 pt-5 flex-shrink-0 text-white">
        <div className="px-4 flex items-center gap-4">
          <Button
            onClick={() => router.push('/profile/orders')}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 rounded-full cursor-pointer h-10 w-10"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-white/50">Tracking</span>
              <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-md font-mono font-black uppercase">
                {order.orderNumber}
              </span>
            </div>
            <h1 className="text-lg font-black text-white mt-0.5">Order Delivery Status</h1>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Placed Date Alert Bar */}
        <div className="bg-muted/30 border border-border/30 rounded-2xl p-3.5 flex items-center gap-3 text-xs font-semibold text-muted-foreground shadow-sm">
          <Calendar className="h-4.5 w-4.5 text-primary" />
          <span>Placed on {placedDate}</span>
        </div>

        {/* Estimated Delivery Timing Card */}
        {order.deliveryTime !== undefined && order.deliveryTime !== null && order.deliveryTime > 0 && !isCancelled && (
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 border border-primary/20 rounded-3xl p-6 shadow-md flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Estimated Time</span>
              <h2 className="text-3xl font-black text-foreground tracking-tight">
                {formatDeliveryTime(order.deliveryTime)}
              </h2>
              <p className="text-xs font-medium text-emerald-600">On-time Delivery Guaranteed</p>
            </div>
            <div className="h-16 w-16 bg-white rounded-full border border-primary/15 flex items-center justify-center shadow-lg relative animate-pulse">
              <Clock className="h-8 w-8 text-primary" />
              <div className="absolute inset-0 rounded-full border border-dashed border-primary/30 animate-spin duration-[8s]" />
            </div>
          </div>
        )}

        {/* Cancelled State Card */}
        {isCancelled && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-3xl p-6 shadow-md flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-destructive uppercase font-bold tracking-wider">Cancelled</span>
              <h2 className="text-2xl font-black text-destructive tracking-tight">Order Cancelled</h2>
              <p className="text-xs font-medium text-muted-foreground">This purchase order was canceled.</p>
            </div>
            <div className="h-16 w-16 bg-white rounded-full border border-destructive/15 flex items-center justify-center shadow-lg">
              <Info className="h-8 w-8 text-destructive" />
            </div>
          </div>
        )}

        {/* Progress Tracker Timeline */}
        {!isCancelled && (
          <div className="bg-white border border-border/40 rounded-3xl p-6 shadow-lg space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Delivery Journey</h3>
            
            <div className="relative pl-7 space-y-6 border-l-2 border-border/40 ml-2.5">
              {statusSteps.map((step, idx) => {
                const isPassed = idx <= activeIndex;
                const isCurrent = idx === activeIndex;

                return (
                  <div key={step.key} className="relative">
                    {/* Visual dot indicator */}
                    <div className={`absolute -left-[39px] top-1.5 h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                      isPassed 
                        ? 'bg-primary border-primary text-white scale-110 shadow-md shadow-primary/20' 
                        : 'bg-white border-border/60 text-muted-foreground'
                    }`}>
                      {isPassed ? (
                        <CheckCircle className="h-4.5 w-4.5 stroke-[2.5]" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <h4 className={`text-sm font-black leading-tight ${isCurrent ? 'text-primary' : isPassed ? 'text-foreground' : 'text-muted-foreground/70'}`}>
                        {step.label}
                      </h4>
                      <p className="text-xs text-muted-foreground font-semibold opacity-90">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Route Details Card */}
        {order.addressId && (
          <div className="bg-white border border-border/40 rounded-3xl p-6 shadow-lg space-y-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Route & Geolocation</h3>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Store className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div className="w-0.5 h-12 border-dashed border-border/80 border-l-2 my-1" />
                </div>
                <div className="pt-0.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Pickup Point</span>
                  <h4 className="text-xs font-black text-foreground mt-0.5">{order.shopId?.name || 'Local Shop'}</h4>
                  <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                    {order.shopId?.address}, {order.shopId?.city}, {order.shopId?.state} {order.shopId?.pincode}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 flex-shrink-0">
                  <MapPin className="h-4.5 w-4.5 text-emerald-600" />
                </div>
                <div className="pt-0.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Drop Point ({order.addressId.label})</span>
                  <h4 className="text-xs font-black text-foreground mt-0.5">{order.addressId.addressLine1}</h4>
                  <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                    {order.addressId.city}, {order.addressId.state} {order.addressId.pincode}
                  </p>
                </div>
              </div>
            </div>

            {/* Google Maps Route Direct Action */}
            {getGoogleMapsLink() && (
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl shadow-md text-xs mt-2 cursor-pointer">
                <a href={getGoogleMapsLink()!} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                  <Navigation size={14} className="animate-pulse" />
                  <span>Open live route directions in Google Maps</span>
                </a>
              </Button>
            )}
          </div>
        )}

        {/* Shop details overview */}
        {order.shopId && (
          <div className="bg-white border border-border/40 rounded-3xl overflow-hidden shadow-lg">
            {order.shopId.banner && (
              <div className="h-28 w-full overflow-hidden relative border-b border-border/10">
                <img src={order.shopId.banner} alt={order.shopId.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            )}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white border border-border/20 shadow-sm flex items-center justify-center overflow-hidden p-0.5 flex-shrink-0">
                  {order.shopId.logo ? (
                    <img src={order.shopId.logo} alt={order.shopId.name} className="h-full w-full object-contain" />
                  ) : (
                    <Store className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Fulfillment Partner</span>
                  <h4 className="text-sm font-black text-foreground mt-0.5">{order.shopId.name}</h4>
                </div>
              </div>

              {order.shopId.phone && (
                <div className="flex gap-2">
                  <Button asChild variant="outline" className="flex-1 border-border/40 hover:bg-muted text-foreground font-bold h-10 rounded-xl text-xs cursor-pointer">
                    <a href={`tel:${order.shopId.phone}`} className="flex items-center justify-center gap-1.5">
                      <Phone size={13} />
                      <span>Call Partner Shop</span>
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detailed Items list */}
        <div className="bg-white border border-border/40 rounded-3xl p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Items Ordered</h3>
          <div className="space-y-3.5 pt-1">
            {order.items?.map((item: any) => {
              const variantDetails: string[] = [];
              if (item.variant) {
                Object.entries(item.variant).forEach(([key, val]) => {
                  if (val && typeof val === 'string' && val.trim() !== '') {
                    variantDetails.push(`${key}: ${val}`);
                  }
                });
              }

              return (
                <div key={item._id} className="flex gap-3 py-2 border-b border-border/10 last:border-b-0">
                  <div className="h-12 w-12 rounded-xl border border-border/20 overflow-hidden flex-shrink-0 bg-white">
                    <img src={item.image || 'https://images.unsplash.com/photo-1441984904556-0ac8d9c98337?w=80&h=80&fit=crop'} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-foreground/90 truncate leading-normal">{item.name}</h4>
                    {variantDetails.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {variantDetails.map((detail, idx) => (
                          <span key={idx} className="bg-muted px-1.5 py-0.5 rounded text-[9px] text-muted-foreground font-bold">
                            {detail}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] font-bold text-muted-foreground/95">
                        ₹{item.price} × {item.quantity}
                      </span>
                      <span className="text-xs font-black text-foreground">
                        ₹{item.total || (item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cost and Payment Breakdown */}
        <div className="bg-white border border-border/40 rounded-3xl p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Payment Summary</h3>
          
          <div className="space-y-2.5 text-xs font-semibold text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Items Subtotal</span>
              <span className="text-foreground">₹{order.pricing?.subtotal?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery Charges</span>
              <span className="text-foreground">₹{order.pricing?.deliveryFee?.toFixed(2) || '0.00'}</span>
            </div>
            {order.pricing?.discount > 0 && (
              <div className="flex items-center justify-between text-emerald-500">
                <span>Promotional Discount</span>
                <span>-₹{order.pricing.discount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="border-t border-border/30 pt-3 flex items-center justify-between text-sm font-black">
              <span className="text-foreground">Grand Total</span>
              <span className="text-primary text-base">₹{order.pricing?.total?.toFixed(2) || '0.00'}</span>
            </div>
          </div>

          <div className="border-t border-border/30 pt-4 flex flex-col xs:flex-row xs:items-center justify-between gap-3 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CreditCard className="h-4 w-4 text-muted-foreground/80 flex-shrink-0" />
              <span>PAID VIA {order.payment?.method || 'COD'}</span>
            </div>
            <div className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/25 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide self-start xs:self-center">
              Payment Status: {order.payment?.status || 'Paid'}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation cartCount={cartCount} />
    </div>
  );
}
