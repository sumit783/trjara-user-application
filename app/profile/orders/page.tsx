'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCart } from '@/lib/cart-context';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, ChevronDown, ChevronUp, MapPin, CreditCard, Store, Clock, ArrowRight, AlertCircle, Calendar, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { fetchProfile } from '@/lib/api/user';
import { toast } from 'sonner';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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

const getStoreInfo = (store: any) => {
  if (typeof store === 'object' && store !== null) {
    return {
      id: store._id || '',
      name: store.name || 'Local Shop',
      logo: store.logo || null,
      phone: store.phone || '',
      address: store.address || '',
      city: store.city || '',
    };
  }
  return {
    id: typeof store === 'string' ? store : '',
    name: 'Local Shop',
    logo: null,
    phone: '',
    address: '',
    city: '',
  };
};

export default function MyOrdersPage() {
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [token, setToken] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  const { data: profileResponse } = useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchProfile,
    enabled: !!token,
  });
  const profile = profileResponse?.data;

  const handleRepayment = async (orderId: string, orderNumber: string) => {
    let loadingToastId = toast.loading('Initiating repayment...');
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.dismiss(loadingToastId);
        toast.error('Razorpay SDK failed to load. Please check your internet connection.');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/orders/${orderId}/repay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to initiate repayment');
      }

      toast.dismiss(loadingToastId);

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      const options = {
        key: keyId,
        amount: resData.razorpayOrder.amount,
        currency: resData.razorpayOrder.currency,
        name: 'Trjara',
        description: `Repayment for Order ${orderNumber}`,
        order_id: resData.razorpayOrder.id,
        prefill: {
          name: profile?.name || '',
          contact: profile?.phone || '',
          email: profile?.email || '',
        },
        theme: {
          color: '#4F46E5',
        },
        handler: async function (payResponse: any) {
          let verifyToastId = toast.loading('Verifying repayment...');
          try {
            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/orders/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify({
                orderId: orderId,
                razorpayOrderId: payResponse.razorpay_order_id,
                razorpayPaymentId: payResponse.razorpay_payment_id,
                razorpaySignature: payResponse.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.message || 'Payment verification failed');
            }

            toast.dismiss(verifyToastId);
            toast.success('Repayment completed successfully!');
            queryClient.invalidateQueries({ queryKey: ['user-orders'] });
            queryClient.invalidateQueries({ queryKey: ['order-details', orderId] });
          } catch (err: any) {
            toast.dismiss(verifyToastId);
            toast.error(err.message || 'Verification failed');
          }
        },
        modal: {
          ondismiss: function () {
            toast.dismiss(loadingToastId);
            toast.error('Payment cancelled.');
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.dismiss(loadingToastId);
      toast.error(err.message || 'Failed to start payment');
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token'));
    }
  }, []);

  const { data: ordersData, isLoading, error } = useQuery({
    queryKey: ['user-orders'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/orders`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch orders');
      }
      return res.json();
    },
    enabled: !!token,
  });

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'order_placed':
      case 'placed':
        return (
          <span className="bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-blue-500/20 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Order Placed
          </span>
        );
      case 'order_packing':
        return (
          <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
            <Package className="h-3 w-3 animate-pulse" /> Packing
          </span>
        );
      case 'rider_assigned':
        return (
          <span className="bg-sky-500/10 text-sky-500 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-sky-500/20 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Rider Assigned
          </span>
        );
      case 'order_ready_for_pickup':
        return (
          <span className="bg-violet-500/10 text-violet-500 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-violet-500/20 flex items-center gap-1">
            <Store className="h-3 w-3" /> Ready for Pickup
          </span>
        );
      case 'order_out_for_delivery':
      case 'out_for_delivery':
        return (
          <span className="bg-indigo-500/10 text-indigo-500 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-indigo-500/20 flex items-center gap-1">
            <MapPin className="h-3 w-3 animate-bounce" /> Out for Delivery
          </span>
        );
      case 'order_delivered':
      case 'delivered':
        return (
          <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Delivered
          </span>
        );
      case 'order_cancelled':
      case 'cancelled':
      case 'canceled':
        return (
          <span className="bg-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-destructive/20 flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-border flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> {status || 'Processing'}
          </span>
        );
    }
  };

  const renderOrdersList = () => {
    if (!token) {
      return (
        <div className="text-center py-12 px-4 bg-muted/20 border border-border/30 rounded-3xl space-y-4">
          <AlertCircle className="h-10 w-10 text-primary mx-auto animate-bounce" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">Verification Required</h3>
            <p className="text-xs text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
              Please sign in to your customer account profile to view your purchase order history.
            </p>
          </div>
          <Button asChild className="rounded-xl font-bold h-10 px-6 cursor-pointer">
            <Link href="/profile">Go to Login</Link>
          </Button>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border/30 rounded-3xl p-4.5 bg-card space-y-4 shadow-sm animate-pulse">
              <div className="flex items-center justify-between pb-3 border-b border-border/10">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12 px-4 bg-destructive/5 rounded-3xl border border-destructive/10 space-y-3">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
          <h3 className="text-lg font-bold text-foreground">Could not load orders</h3>
          <p className="text-xs text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
            There was an error querying the database. Please try reloading the page.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl font-bold h-9.5 px-5 cursor-pointer">
            Retry Connection
          </Button>
        </div>
      );
    }

    const orders = ordersData?.orders || [];

    if (orders.length === 0) {
      return (
        <div className="text-center py-16 px-4 space-y-4 bg-muted/20 border border-border/30 rounded-3xl">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Package className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">No Orders Placed</h3>
            <p className="text-xs text-muted-foreground max-w-[260px] mx-auto leading-relaxed">
              You haven't bought anything yet! Start adding dynamic products to your cart.
            </p>
          </div>
          <Button asChild className="rounded-xl font-bold h-10 px-6 cursor-pointer">
            <Link href="/">Shop Products</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {orders.map((order: any) => {
          const isExpanded = !!expandedOrders[order._id];
          const placedDate = new Date(order.placedAt || order.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          const orderStores = order.stores || [];
          const storesInfo = orderStores.map((s: any) => getStoreInfo(s.store));
          const totalItemsCount = orderStores.reduce((sum: number, s: any) => sum + (s.items?.length || 0), 0);

          return (
            <div
              key={order._id}
              className="border border-border/30 rounded-3xl overflow-hidden bg-card/60 backdrop-blur-md hover:border-border/60 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {/* Order Header / Summary card */}
              <div className="p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/20 bg-muted/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">Order #</span>
                    <span className="text-sm font-black text-foreground tracking-wide font-mono uppercase">
                      {order.orderNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Placed on {placedDate}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2.5 flex-wrap">
                  {order.deliveryTime !== undefined && order.deliveryTime !== null && order.deliveryTime > 0 && (
                    <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-primary/20 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {formatDeliveryTime(order.deliveryTime)}
                    </span>
                  )}
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Store & Price Overview */}
              <div className="p-4.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {storesInfo.length > 1 ? (
                    <div className="flex items-center">
                      <div className="flex -space-x-3 overflow-hidden">
                        {storesInfo.slice(0, 3).map((store: any, idx: number) => (
                          <div key={idx} className="inline-block h-10 w-10 rounded-xl bg-white border border-border/30 shadow-sm overflow-hidden p-0.5 relative z-[10] hover:z-20 transition-all duration-200">
                            {store.logo ? (
                              <img src={store.logo} alt={store.name} className="h-full w-full object-contain" />
                            ) : (
                              <Store className="h-5 w-5 text-muted-foreground m-auto" />
                            )}
                          </div>
                        ))}
                        {storesInfo.length > 3 && (
                          <div className="inline-block h-10 w-10 rounded-xl bg-muted border border-border/30 shadow-sm flex items-center justify-center text-[10px] font-black text-muted-foreground z-0">
                            +{storesInfo.length - 3}
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Shops</p>
                        <p className="text-sm font-bold text-foreground/90 leading-tight line-clamp-1 max-w-[200px]">
                          {storesInfo.map((s: any) => s.name).join(', ')}
                        </p>
                      </div>
                    </div>
                  ) : storesInfo.length === 1 ? (
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center border border-border/30 shadow-sm overflow-hidden p-0.5">
                        {storesInfo[0].logo ? (
                          <img src={storesInfo[0].logo} alt={storesInfo[0].name} className="h-full w-full object-contain" />
                        ) : (
                          <Store className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Shop</p>
                        <p className="text-sm font-bold text-foreground/90">{storesInfo[0].name}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center border border-border/30 shadow-sm overflow-hidden p-0.5">
                        <Store className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Shop</p>
                        <p className="text-sm font-bold text-foreground/90">Local Shop</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Total Amount</p>
                  <p className="text-base font-black text-foreground">₹{order.pricing?.total?.toFixed(2)}</p>
                </div>
              </div>

              {/* Items Expanded Toggle Button */}
              <div className="px-4.5 pb-4.5">
                <button
                  onClick={() => toggleOrderExpand(order._id)}
                  className="w-full flex items-center justify-between py-2.5 px-4 bg-muted/40 hover:bg-muted/65 border border-border/10 rounded-2xl text-xs font-bold text-muted-foreground hover:text-foreground transition-all focus:outline-none cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-primary animate-pulse" />
                    <span>{totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} in order</span>
                  </span>
                  <span className="flex items-center gap-1">
                    {isExpanded ? (
                      <>
                        <span>Hide Details</span>
                        <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <span>View Details</span>
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </span>
                </button>
              </div>

              {/* Expanded Detail Panel */}
              {isExpanded && (
                <div className="px-4.5 pb-4.5 pt-1 border-t border-border/10 bg-muted/5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* Grouped Items List by Store */}
                  <div className="space-y-4 pt-2">
                    {orderStores.map((storeEntry: any, storeIdx: number) => {
                      const storeInfo = getStoreInfo(storeEntry.store);
                      return (
                        <div key={storeIdx} className="space-y-2 border-b border-border/10 pb-3 last:border-b-0 last:pb-0">
                          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                            <Store className="h-3.5 w-3.5 text-primary" />
                            <span>{storeInfo.name}</span>
                          </div>
                          <div className="space-y-3 pl-1.5">
                            {storeEntry.items?.map((item: any) => {
                              const variantDetails: { label: string; value: string }[] = [];
                              
                              if (item.variant) {
                                Object.entries(item.variant).forEach(([key, val]) => {
                                  if (val && typeof val === 'string' && val.trim() !== '') {
                                    const label = key.charAt(0).toUpperCase() + key.slice(1);
                                    variantDetails.push({ label, value: val });
                                  }
                                });
                              }

                              if (item.inventoryId?.variant?.options) {
                                const opts = item.inventoryId.variant.options;
                                const optsEntries = opts instanceof Map 
                                  ? Array.from(opts.entries()) 
                                  : Object.entries(opts);
                                
                                optsEntries.forEach(([key, val]) => {
                                  if (val && typeof val === 'string' && val.trim() !== '') {
                                    const label = key.charAt(0).toUpperCase() + key.slice(1);
                                    if (!variantDetails.some(detail => detail.label.toLowerCase() === key.toLowerCase())) {
                                      variantDetails.push({ label, value: val });
                                    }
                                  }
                                });
                              }

                              return (
                                <div key={item._id} className="flex gap-3 py-1 last:border-b-0">
                                  <div className="h-12 w-12 rounded-xl border border-border/20 overflow-hidden flex-shrink-0 bg-white">
                                    <img src={item.image || 'https://images.unsplash.com/photo-1441984904556-0ac8d9c98337?w=80&h=80&fit=crop'} alt={item.name} className="h-full w-full object-cover" />
                                  </div>
                                  <div className="flex-1 space-y-0.5">
                                    <h4 className="font-bold text-xs text-foreground/90 line-clamp-1 leading-normal">{item.name}</h4>
                                    
                                    {variantDetails.length > 0 && (
                                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                        {variantDetails.map((detail, index) => (
                                          <span key={index} className="bg-muted px-2 py-0.5 rounded text-[10px] text-muted-foreground font-semibold">
                                            {detail.label}: {detail.value}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    <div className="flex items-center justify-between pt-0.5">
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
                      );
                    })}
                  </div>

                  {/* Summary Breakdown */}
                  <div className="bg-white/40 border border-border/20 rounded-2xl p-4 space-y-2.5 text-xs font-medium shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">₹{order.pricing?.subtotal?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Delivery Charge</span>
                      <span className="text-foreground">₹{order.pricing?.deliveryFee?.toFixed(2) || '0.00'}</span>
                    </div>
                    {order.deliveryTime !== undefined && order.deliveryTime !== null && order.deliveryTime > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Est. Delivery Time</span>
                        <span className="text-foreground font-semibold flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{formatDeliveryTime(order.deliveryTime)}</span>
                        </span>
                      </div>
                    )}
                    {order.pricing?.discount > 0 && (
                      <div className="flex items-center justify-between text-emerald-500">
                        <span>Discount</span>
                        <span>-₹{order.pricing.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-border/20 pt-2.5 flex items-center justify-between text-sm font-black">
                      <span className="text-foreground/90">Total</span>
                      <span className="text-primary">₹{order.pricing?.total?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="flex items-center justify-between gap-4 px-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-muted-foreground/80" />
                      <span>Paid via {order.payment?.method || 'COD'}</span>
                    </div>
                    <div className={`${
                      order.payment?.status?.toLowerCase() === 'paid'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    } px-2.5 py-0.5 rounded-md text-[9px]`}>
                      {order.payment?.status || 'pending'}
                    </div>
                  </div>

                  {order.payment?.method === 'ONLINE' && order.payment?.status?.toLowerCase() !== 'paid' && (
                    <div className="pt-2">
                      <Button 
                        onClick={() => handleRepayment(order._id, order.orderNumber)}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-11 rounded-xl shadow-sm text-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CreditCard size={14} />
                        <span>Failed or Pending Payment - Repay Now</span>
                      </Button>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button asChild className="w-full bg-black text-white hover:bg-black/90 font-bold h-11 rounded-xl shadow-sm text-xs cursor-pointer">
                      <Link href={`/profile/orders/track?id=${order._id}`} className="flex items-center justify-center gap-1.5">
                        <span>Track Order & Delivery Details</span>
                        <ArrowRight size={14} />
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden animate-in fade-in duration-300">
      {/* Dynamic Sleek Black Header Section */}
      <div className="bg-black rounded-b-3xl shadow-lg pb-6 pt-5 flex-shrink-0">
        <div className="px-4 flex items-center gap-4">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 rounded-full cursor-pointer h-10 w-10"
          >
            <Link href="/profile">
              <ArrowLeft size={20} />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-black text-white">My Purchase Orders</h1>
            <p className="text-white/60 text-xs font-medium mt-0.5">Track your items, payments, and statuses</p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto max-w-xl mx-auto w-full px-4 py-6 pb-28">
        {renderOrdersList()}
      </div>

      {/* Bottom Nav Bar */}
      <BottomNavigation cartCount={cartCount} />
    </div>
  );
}
