'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  productId?: string;
  cartItemId?: string;
  name: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  quantity: number;
  inventoryId?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const DB_NAME = 'trjara-cart-db';
const DB_VERSION = 1;
const STORE_NAME = 'cart-items';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB is not available on server-side'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const getIndexedDBCart = async (): Promise<any[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to get cart from IndexedDB:', error);
    return [];
  }
};

export const saveIndexedDBCartItem = async (item: any): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to save cart item to IndexedDB:', error);
  }
};

export const clearIndexedDBCart = async (): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to clear IndexedDB cart:', error);
  }
};

export const deleteIndexedDBCartItem = async (id: string): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to delete cart item from IndexedDB:', error);
  }
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Save cart to IndexedDB whenever it changes and user is NOT logged in
  useEffect(() => {
    const saveToIndexedDB = async () => {
      if (mounted) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          // Clear and save the entire list to keep it perfectly in sync!
          await clearIndexedDBCart();
          for (const item of items) {
            await saveIndexedDBCartItem(item);
          }
          if (typeof window !== 'undefined') {
            if (items.length > 0) {
              localStorage.setItem('cart_needs_sync', 'true');
            } else {
              localStorage.removeItem('cart_needs_sync');
            }
          }
        }
      }
    };
    saveToIndexedDB();
  }, [items, mounted]);

  // Monitor token and trigger sync upon login transition
  useEffect(() => {
    const fetchAndSetBackendCart = async (authToken: string) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/cart`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.success && resData.data?.items) {
            const mappedItems = resData.data.items.map((item: any) => ({
              id: typeof item.productId === 'object' && item.productId ? item.productId._id : item.productId,
              productId: typeof item.productId === 'object' && item.productId ? item.productId._id : item.productId,
              cartItemId: item._id,
              name: item.name,
              price: item.price,
              category: item.category || 'Product',
              image: item.imageUrl || 'https://images.unsplash.com/photo-1441984904556-0ac8d9c98337?w=120&h=120&fit=crop',
              quantity: item.quantity,
              inventoryId: typeof item.inventoryId === 'object' && item.inventoryId ? item.inventoryId._id : item.inventoryId,
            }));
            setItems(mappedItems);
            

          }
        }
      } catch (error) {
        console.error('Failed to fetch backend cart:', error);
      }
    };

    const loadFromIndexedDB = async () => {
      const dbItems = await getIndexedDBCart();
      setItems(dbItems);
    };

    const checkAndSync = async () => {
      const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const needsSync = typeof window !== 'undefined' ? localStorage.getItem('cart_needs_sync') === 'true' : false;

      if (localToken) {
        const dbItems = await getIndexedDBCart();
        if (needsSync && dbItems.length > 0) {
          try {
            console.log('Detected login token and guest items needing sync, triggering synchronization...');
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/cart/add`, {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localToken}`,
              },
              body: JSON.stringify({
                items: dbItems.map((item) => ({
                  inventoryId: item.inventoryId || item.id,
                  quantity: item.quantity,
                })),
              }),
            });

            if (response.ok) {
              console.log('Successfully synced guest items from IndexedDB to backend cart!');
              if (typeof window !== 'undefined') {
                localStorage.removeItem('cart_needs_sync');
              }
              await clearIndexedDBCart();
              await fetchAndSetBackendCart(localToken);
            } else {
              console.error('Failed to sync guest items to backend cart:', await response.text());
              await loadFromIndexedDB();
            }
          } catch (error) {
            console.error('Failed to sync guest items to backend cart:', error);
            await loadFromIndexedDB();
          }
        } else {
          // No guest items to sync (cached items only or empty cart), fetch backend cart directly
          await fetchAndSetBackendCart(localToken);
        }
      } else {
        // Load cart from IndexedDB if not logged in
        await loadFromIndexedDB();
      }
      setMounted(true);
    };

    checkAndSync();

    // Listen for custom login events or storage updates
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', checkAndSync);
      window.addEventListener('login-success', checkAndSync);
      window.addEventListener('cart-updated', loadFromIndexedDB);
      
      return () => {
        window.removeEventListener('storage', checkAndSync);
        window.removeEventListener('login-success', checkAndSync);
        window.removeEventListener('cart-updated', loadFromIndexedDB);
      };
    }
  }, []);

  const addItem = async (item: Omit<CartItem, 'quantity'>, quantityToAdd: number = 1) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      try {
        const inventoryId = item.inventoryId || item.id;
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/cart/add`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: [
              {
                inventoryId,
                quantity: quantityToAdd
              }
            ]
          }),
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.success && resData.data?.items) {
            const mappedItems = resData.data.items.map((it: any) => ({
              id: typeof it.productId === 'object' && it.productId ? it.productId._id : it.productId,
              productId: typeof it.productId === 'object' && it.productId ? it.productId._id : it.productId,
              cartItemId: it._id,
              name: it.name,
              price: it.price,
              category: it.category || 'Product',
              image: it.imageUrl || 'https://images.unsplash.com/photo-1441984904556-0ac8d9c98337?w=120&h=120&fit=crop',
              quantity: it.quantity,
              inventoryId: typeof it.inventoryId === 'object' && it.inventoryId ? it.inventoryId._id : it.inventoryId,
            }));
            setItems(mappedItems);
            
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('cart-updated'));
            }
          }
        } else {
          console.error('Failed to sync item to backend cart:', await response.text());
        }
      } catch (error) {
        console.error('Failed to sync item to backend cart:', error);
      }
    } else {
      // Guest Mode
      setItems((prevItems) => {
        const existingItem = prevItems.find((i) => i.id === item.id);
        if (existingItem) {
          return prevItems.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + quantityToAdd } : i
          );
        }
        return [...prevItems, { ...item, quantity: quantityToAdd }];
      });
    }
  };

  const removeItem = async (id: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const targetItem = items.find((i) => i.id === id);
    
    if (token && targetItem && targetItem.cartItemId) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/cart/item/${targetItem.cartItemId}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.success && resData.data?.items) {
            const mappedItems = resData.data.items.map((it: any) => ({
              id: typeof it.productId === 'object' && it.productId ? it.productId._id : it.productId,
              productId: typeof it.productId === 'object' && it.productId ? it.productId._id : it.productId,
              cartItemId: it._id,
              name: it.name,
              price: it.price,
              category: it.category || 'Product',
              image: it.imageUrl || 'https://images.unsplash.com/photo-1441984904556-0ac8d9c98337?w=120&h=120&fit=crop',
              quantity: it.quantity,
              inventoryId: typeof it.inventoryId === 'object' && it.inventoryId ? it.inventoryId._id : it.inventoryId,
            }));
            setItems(mappedItems);
            
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('cart-updated'));
            }
          }
        } else {
          console.error('Failed to remove item from backend cart:', await response.text());
        }
      } catch (error) {
        console.error('Failed to remove item from backend cart:', error);
      }
    } else {
      setItems((prevItems) => prevItems.filter((i) => i.id !== id));
      deleteIndexedDBCartItem(id);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const targetItem = items.find((i) => i.id === id);

    if (token && targetItem && targetItem.cartItemId) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/cart/update-quantity`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            cartItemId: targetItem.cartItemId,
            inventoryId: targetItem.inventoryId,
            quantity,
          }),
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.success && resData.data?.items) {
            const mappedItems = resData.data.items.map((it: any) => ({
              id: typeof it.productId === 'object' && it.productId ? it.productId._id : it.productId,
              productId: typeof it.productId === 'object' && it.productId ? it.productId._id : it.productId,
              cartItemId: it._id,
              name: it.name,
              price: it.price,
              category: it.category || 'Product',
              image: it.imageUrl || 'https://images.unsplash.com/photo-1441984904556-0ac8d9c98337?w=120&h=120&fit=crop',
              quantity: it.quantity,
              inventoryId: typeof it.inventoryId === 'object' && it.inventoryId ? it.inventoryId._id : it.inventoryId,
            }));
            setItems(mappedItems);
            
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('cart-updated'));
            }
          }
        } else {
          console.error('Failed to update quantity in backend cart:', await response.text());
        }
      } catch (error) {
        console.error('Failed to update quantity in backend cart:', error);
      }
    } else {
      setItems((prevItems) =>
        prevItems.map((i) => (i.id === id ? { ...i, quantity } : i))
      );
    }
  };

  const clearCart = async () => {
    setItems([]);
    await clearIndexedDBCart();
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (undefined === context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
