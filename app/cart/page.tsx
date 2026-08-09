'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BottomNavigation } from '@/components/bottom-navigation';
import { AppHeader } from '@/components/app-header';
import { useCart, clearIndexedDBCart, saveIndexedDBCartItem } from '@/lib/cart-context';
import { fetchAddresses, addAddress, fetchProfile } from '@/lib/api/user';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Subcomponents import
import { CartItemRow } from '@/components/cart/cart-item-row';
import { OrderSummary } from '@/components/cart/order-summary';
import { AddressModal } from '@/components/cart/address-modal';
import { BookingSuccessModal } from '@/components/cart/booking-success-modal';
import { CartShimmer } from '@/components/cart/cart-shimmer';

// Fetch backend cart helper
const fetchBackendCart = async () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) return null;

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/cart`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch backend cart');
  }

  return response.json();
};

// Update backend cart item quantity helper
const updateBackendCartItemQuantity = async (
  quantity: number,
  cartItemId?: string,
  inventoryId?: string
) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) return null;

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/cart/update-quantity`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      cartItemId,
      inventoryId,
      quantity,
    }),
  });
  if (!response.ok) {
    let errorMessage = `Failed to update backend cart. Status: ${response.status} ${response.statusText}`;
    try {
      const errorText = await response.text();
      console.error('Backend cart update error response:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // Not JSON
      }
    } catch (e) {
      console.error('Failed to read error response text');
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

// Delete backend cart item helper
const deleteBackendCartItem = async (cartItemId: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) return null;

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/cart/item/${cartItemId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete backend cart item');
  }

  return response.json();
};

// Dynamically load Razorpay SDK
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

export default function CartPage() {
  const { items: localItems, removeItem, updateQuantity, clearCart, total: localTotal } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const [useWallet, setUseWallet] = useState(false);

  // Address check states
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: 'home',
    addressLine1: '',
    landmark: '',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411046',
  });
  const [coords, setCoords] = useState<[number, number]>([73.8567, 18.5204]); // Default Pune coords
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  // Check login token & set mounted state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token'));
    }
    setIsMounted(true);
  }, []);

  // Fetch addresses via React Query
  const { data: addressesResponse, isLoading: isLoadingAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: fetchAddresses,
    enabled: !!token,
  });

  // Fetch user profile for payment prefill
  const { data: profileResponse } = useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchProfile,
    enabled: !!token,
  });
  const profile = profileResponse?.data;

  // Fetch Wallet Balance
  const { data: walletResponse } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) return null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/customer/wallet`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      return res.json();
    },
    enabled: !!token,
  });
  const walletBalance = walletResponse?.data?.wallet?.balance || 0;

  // Auto-open Address modal if logged-in user has 0 addresses
  useEffect(() => {
    if (token && addressesResponse?.success && (!addressesResponse.data || addressesResponse.data.length === 0)) {
      setAddressModalOpen(true);
    } else {
      setAddressModalOpen(false);
    }
  }, [addressesResponse, token]);

  // Fetch backend cart
  const { data: backendCartResponse, isLoading: isLoadingCart } = useQuery({
    queryKey: ['backend-cart', localItems],
    queryFn: fetchBackendCart,
    enabled: !!token,
  });



  // Mutation for updating cart item quantity
  const updateCartItemMutation = useMutation({
    mutationFn: ({ quantity, cartItemId, inventoryId }: { quantity: number; cartItemId?: string; inventoryId?: string }) =>
      updateBackendCartItemQuantity(quantity, cartItemId, inventoryId),
    onSuccess: (responseData) => {
      if (responseData && responseData.success) {
        queryClient.setQueryData(['backend-cart'], responseData);
      }
      queryClient.invalidateQueries({ queryKey: ['backend-cart'] });
    },
  });

  // Mutation for deleting cart item completely
  const deleteCartItemMutation = useMutation({
    mutationFn: (cartItemId: string) => deleteBackendCartItem(cartItemId),
    onSuccess: (responseData) => {
      if (responseData && responseData.success) {
        queryClient.setQueryData(['backend-cart'], responseData);
      }
      queryClient.invalidateQueries({ queryKey: ['backend-cart'] });
    },
  });

  // Mutation for adding address
  const addAddressMutation = useMutation({
    mutationFn: addAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      queryClient.invalidateQueries({ queryKey: ['backend-cart'] });
    },
  });

  const isBackendCartActive = !!token && backendCartResponse?.success && backendCartResponse?.data?.cart;
  
  // Dynamic mapped list of items
  const items = isBackendCartActive 
    ? backendCartResponse.data.items.map((item: any) => ({
        id: typeof item.productId === 'object' && item.productId ? item.productId._id : item.productId,
        productId: typeof item.productId === 'object' && item.productId ? item.productId._id : item.productId,
        cartItemId: item._id,
        inventoryId: typeof item.inventoryId === 'object' && item.inventoryId ? item.inventoryId._id : item.inventoryId,
        name: item.name,
        category: item.category || 'Product',
        price: item.price,
        mrp: item.mrp || item.price,
        image: item.imageUrl || 'https://images.unsplash.com/photo-1441984904556-0ac8d9c98337?w=120&h=120&fit=crop',
        quantity: item.quantity,
        variantOptions: item.inventoryId?.variantOptions || item.inventoryId?.variant?.options || null,
      }))
    : localItems;

  const cartCount = items.reduce((sum: number, item: any) => sum + item.quantity, 0);

  // Cost summary parameters
  const itemsTotal = isBackendCartActive ? backendCartResponse.data.cart.itemsTotal : localTotal;
  const deliveryCharge = isBackendCartActive ? backendCartResponse.data.cart.deliveryCharge : 0;
  const platformCharge = isBackendCartActive ? backendCartResponse.data.cart.platformCharge : 0;
  const smallCartCharge = isBackendCartActive ? backendCartResponse.data.cart.smallCartCharge : 0;
  const discountAmount = isBackendCartActive ? backendCartResponse.data.cart.discountAmount : 0;
  
  const totalAmount = isBackendCartActive 
    ? backendCartResponse.data.cart.totalAmount
    : localTotal + (localTotal > 0 ? (localTotal * 0.1) : 0);

  const distanceInfo = isBackendCartActive ? backendCartResponse.data.distanceInfo : null;
  const codInfo = isBackendCartActive ? backendCartResponse.data.codInfo : null;

  const handleBooking = async (paymentMethod: 'ONLINE' | 'COD' | 'WALLET') => {
    if (!token) {
      toast.error('Please login to place an order.');
      router.push('/profile');
      return;
    }

    const defaultAddress = addressesResponse?.data?.find((a: any) => a.isDefault) || addressesResponse?.data?.[0];
    const addressId = defaultAddress?._id;
    if (!addressId) {
      toast.error('Shipping address is required. Please add an address to continue.');
      setAddressModalOpen(true);
      return;
    }

    setIsSubmittingCheckout(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/orders/checkout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentMethod,
          addressId,
          useWallet,
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Checkout failed');
      }

      if (paymentMethod === 'ONLINE') {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          toast.error('Razorpay SDK failed to load. Please check your internet connection.');
          setIsSubmittingCheckout(false);
          return;
        }

        const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_SDgwHZdeZvhHnl';
        
        const options = {
          key: keyId,
          amount: resData.razorpayOrder.amount,
          currency: resData.razorpayOrder.currency,
          name: 'Trjara',
          description: `Order ${resData.order.orderNumber}`,
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
            try {
              setIsSubmittingCheckout(true);
              const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/orders/verify`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  orderId: resData.order._id,
                  razorpayOrderId: payResponse.razorpay_order_id,
                  razorpayPaymentId: payResponse.razorpay_payment_id,
                  razorpaySignature: payResponse.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok || !verifyData.success) {
                throw new Error(verifyData.message || 'Payment verification failed');
              }

              toast.success('Payment verified and order placed successfully!');
              
              setBookingConfirmed(true);
              clearCart();
              await clearIndexedDBCart();
              queryClient.invalidateQueries({ queryKey: ['backend-cart'] });

              setTimeout(() => {
                setBookingConfirmed(false);
                router.push('/profile/orders');
              }, 3000);

            } catch (error: any) {
              console.error('Error during signature verification:', error);
              toast.error(error.message || 'Payment verification failed.');
            } finally {
              setIsSubmittingCheckout(false);
            }
          },
          modal: {
            ondismiss: function () {
              toast.error('Payment cancelled by user.');
              setIsSubmittingCheckout(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // COD Success
        toast.success('Order placed successfully (Cash on Delivery)!');
        setBookingConfirmed(true);
        clearCart();
        await clearIndexedDBCart();
        queryClient.invalidateQueries({ queryKey: ['backend-cart'] });

        setTimeout(() => {
          setBookingConfirmed(false);
          router.push('/profile/orders');
        }, 3000);
      }

    } catch (error: any) {
      console.error('Checkout failed:', error);
      toast.error(error.message || 'Checkout failed. Please try again.');
      setIsSubmittingCheckout(false);
    }
  };

  const handleIncrement = async (itemId: string, inventoryId: string, cartItemId?: string, currentQuantity?: number) => {
    if (token) {
      try {
        const qty = (currentQuantity ?? 0) + 1;
        await updateCartItemMutation.mutateAsync({ quantity: qty, cartItemId, inventoryId });
      } catch (error) {
        console.error('Failed to increment backend item:', error);
      }
    } else {
      const existing = localItems.find((i) => i.id === itemId);
      if (existing) {
        updateQuantity(itemId, existing.quantity + 1);
      }
    }
  };

  const handleDecrement = async (itemId: string, inventoryId: string, currentQuantity: number, cartItemId?: string) => {
    const qty = currentQuantity - 1;
    if (qty <= 0) {
      if (token && cartItemId) {
        try {
          await deleteCartItemMutation.mutateAsync(cartItemId);
          removeItem(itemId);
        } catch (error) {
          console.error('Failed to remove backend item via decrement:', error);
        }
      } else {
        removeItem(itemId);
      }
    } else {
      if (token) {
        try {
          await updateCartItemMutation.mutateAsync({ quantity: qty, cartItemId, inventoryId });
        } catch (error) {
          console.error('Failed to decrement backend item:', error);
        }
      } else {
        updateQuantity(itemId, qty);
      }
    }
  };

  const handleRemove = async (itemId: string, inventoryId: string, currentQuantity: number, cartItemId?: string) => {
    if (token) {
      try {
        if (cartItemId) {
          await deleteCartItemMutation.mutateAsync(cartItemId);
        } else {
          await updateCartItemMutation.mutateAsync({ quantity: 0, cartItemId, inventoryId });
        }
        removeItem(itemId);
      } catch (error) {
        console.error('Failed to remove backend item:', error);
      }
    } else {
      removeItem(itemId);
    }
  };

  const detectLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Native geolocation is not supported by your device or browser.');
      return;
    }

    setIsDetectingLocation(true);
    setLocationSuccess(false);

    // Ask explicitly for browser/webview native geolocation access
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setCoords([lon, lat]);

        try {
          // Reverse geocode dynamically via OpenStreetMap Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
            {
              headers: {
                'Accept-Language': 'en',
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data && data.address) {
              const road = data.address.road || '';
              const suburb = data.address.suburb || data.address.neighbourhood || '';
              const city = data.address.city || data.address.town || data.address.village || 'Pune';
              const state = data.address.state || 'Maharashtra';
              const pincode = data.address.postcode || '411046';
              const attraction = data.address.attraction || data.address.hospital || data.address.shop || '';

              setAddressForm({
                label: addressForm.label,
                addressLine1: [road, suburb].filter(Boolean).join(', ') || data.display_name,
                landmark: attraction,
                city,
                state,
                pincode,
              });
              setLocationSuccess(true);
            } else {
              setLocationSuccess(true);
            }
          } else {
            setLocationSuccess(true);
          }
        } catch (error) {
          console.error('Failed to reverse geocode coords:', error);
          setLocationSuccess(true);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        console.error('Location detection permission denied or failed:', error);
        setIsDetectingLocation(false);
        alert(
          error.code === error.PERMISSION_DENIED
            ? 'Native Location Access Denied. Please enable location permissions in your browser or app settings.'
            : 'Failed to acquire location. Please fill details manually.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.addressLine1 || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      await addAddressMutation.mutateAsync({
        label: addressForm.label,
        addressLine1: addressForm.addressLine1,
        landmark: addressForm.landmark || undefined,
        city: addressForm.city,
        state: addressForm.state,
        pincode: addressForm.pincode,
        coordinates: coords,
        isDefault: true,
      });
    } catch (error) {
      console.error('Failed to add address:', error);
      alert(error instanceof Error ? error.message : 'Failed to add address');
    }
  };

  const isLoading = !isMounted || isLoadingCart || (!!token && isLoadingAddresses);

  return (
    <div className="min-h-screen bg-background pb-24">
      {isSubmittingCheckout && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
          <div className="flex flex-col items-center space-y-4 p-8 rounded-3xl bg-white/50 border border-border/50 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-black text-foreground">Processing Secure Checkout</h3>
              <p className="text-xs font-semibold text-muted-foreground mt-1">Please do not refresh or close this window...</p>
            </div>
          </div>
        </div>
      )}
      <AppHeader />

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-12">
        {/* Success Modal */}
        <BookingSuccessModal isOpen={bookingConfirmed} />

        {/* Address Modal */}
        <AddressModal
          isOpen={addressModalOpen}
          isPending={addAddressMutation.isPending}
          addressForm={addressForm}
          setAddressForm={setAddressForm}
          onDetectLocation={detectLocation}
          locationSuccess={locationSuccess}
          isDetectingLocation={isDetectingLocation}
          onSubmit={handleAddAddressSubmit}
        />

        {/* Loading Skeleton */}
        {isLoading ? (
          <CartShimmer />
        ) : items.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20 max-w-sm mx-auto">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart size={30} className="text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-1">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground text-sm font-medium mb-6">
              Start adding products to your cart to see them here
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold rounded-xl h-11 px-6 shadow-sm"
            >
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          /* Cart items and order summary */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-2xl md:text-3xl font-black text-foreground mb-6">
                Shopping Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
              </h1>

              <div className="space-y-4">
                {items.map((item: any) => (
                  <CartItemRow
                    key={item.cartItemId || item.inventoryId || item.id}
                    item={item}
                    isPending={updateCartItemMutation.isPending || deleteCartItemMutation.isPending}
                    onIncrement={handleIncrement}
                    onDecrement={handleDecrement}
                    onRemove={handleRemove}
                    mutatingInventoryId={updateCartItemMutation.variables?.inventoryId}
                    mutatingCartItemId={updateCartItemMutation.variables?.cartItemId || deleteCartItemMutation.variables}
                  />
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <OrderSummary
                itemsTotal={itemsTotal}
                deliveryCharge={deliveryCharge}
                platformCharge={platformCharge}
                smallCartCharge={smallCartCharge}
                discountAmount={discountAmount}
                totalAmount={totalAmount}
                isBackendCartActive={isBackendCartActive}
                distanceInfo={distanceInfo}
                onCompleteBooking={handleBooking}
                itemsCount={items.length}
                codInfo={codInfo}
                useWallet={useWallet}
                setUseWallet={setUseWallet}
                walletBalance={walletBalance}
              />
            </div>
          </div>
        )}
      </div>

      <BottomNavigation cartCount={cartCount} />
    </div>
  );
}
