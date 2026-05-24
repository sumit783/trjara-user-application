'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
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
        }
      }
    };
    saveToIndexedDB();
  }, [items, mounted]);

  // Monitor token and trigger sync upon login transition
  useEffect(() => {
    const checkAndSync = async () => {
      const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (localToken) {
        const dbItems = await getIndexedDBCart();
        if (dbItems.length > 0) {
          try {
            console.log('Detected login token and IndexedDB guest items, triggering synchronization...');
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
              await clearIndexedDBCart();
              setItems([]);
            } else {
              console.error('Failed to sync guest items to backend cart:', await response.text());
            }
          } catch (error) {
            console.error('Failed to sync guest items to backend cart:', error);
          }
        }
      } else {
        // Load cart from IndexedDB if not logged in
        const dbItems = await getIndexedDBCart();
        setItems(dbItems);
      }
      setMounted(true);
    };

    checkAndSync();

    // Listen for custom login events or storage updates
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', checkAndSync);
      window.addEventListener('login-success', checkAndSync);
      
      return () => {
        window.removeEventListener('storage', checkAndSync);
        window.removeEventListener('login-success', checkAndSync);
      };
    }
  }, []);

  const addItem = async (item: Omit<CartItem, 'quantity'>, quantityToAdd: number = 1) => {
    // 1. Update local storage cart
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantityToAdd } : i
        );
      }
      return [...prevItems, { ...item, quantity: quantityToAdd }];
    });

    // 2. Sync with backend if logged in
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
        if (!response.ok) {
          console.error('Failed to sync item to backend cart:', await response.text());
        }
      } catch (error) {
        console.error('Failed to sync item to backend cart:', error);
      }
    }
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
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
