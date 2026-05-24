'use client';

import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartItemRowProps {
  item: {
    id: string;
    cartItemId?: string;
    inventoryId: string;
    name: string;
    category: string;
    price: number;
    mrp?: number;
    image: string;
    quantity: number;
  };
  isPending: boolean;
  onIncrement: (itemId: string, inventoryId: string, cartItemId?: string, currentQuantity?: number) => void;
  onDecrement: (itemId: string, inventoryId: string, currentQuantity: number, cartItemId?: string) => void;
  onRemove: (itemId: string, inventoryId: string, currentQuantity: number, cartItemId?: string) => void;
  mutatingInventoryId?: string;
  mutatingCartItemId?: string;
}

export function CartItemRow({
  item,
  isPending,
  onIncrement,
  onDecrement,
  onRemove,
  mutatingInventoryId,
  mutatingCartItemId,
}: CartItemRowProps) {
  const isItemMutating = isPending && 
    (mutatingInventoryId === item.inventoryId || mutatingCartItemId === item.cartItemId);

  return (
    <div className="flex gap-4 p-4 bg-white rounded-2xl border border-border hover:shadow-sm transition-all duration-300 relative group">
      {/* Product Image */}
      <div className="flex-shrink-0 w-24 h-24 bg-gray-50 rounded-xl overflow-hidden border border-black/5">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="flex-grow min-w-0 pr-8">
        <h3 className="font-extrabold text-base text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {item.name}
        </h3>
        <span className="text-[10px] font-extrabold text-primary bg-primary/5 px-2.5 py-0.5 rounded-full inline-block mt-1.5 uppercase tracking-wider">
          {item.category}
        </span>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ₹{item.price.toFixed(2)}
          </span>
          {item.mrp && item.mrp > item.price && (
            <span className="text-xs text-muted-foreground line-through font-medium">
              ₹{item.mrp.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-end justify-between">
        <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl p-1 border border-border">
          <button
            onClick={() => onDecrement(item.id, item.inventoryId, item.quantity, item.cartItemId)}
            disabled={isPending}
            className="p-1.5 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
          >
            <Minus size={14} className="text-primary" />
          </button>
          {isItemMutating ? (
            <span className="w-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-primary border-t-transparent" />
            </span>
          ) : (
            <span className="w-6 text-center font-black text-xs text-foreground">
              {item.quantity}
            </span>
          )}
          <button
            onClick={() => onIncrement(item.id, item.inventoryId, item.cartItemId, item.quantity)}
            disabled={isPending}
            className="p-1.5 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
          >
            <Plus size={14} className="text-primary" />
          </button>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(item.id, item.inventoryId, item.quantity, item.cartItemId)}
          disabled={isPending}
          className="p-2 rounded-xl hover:bg-destructive/5 text-muted-foreground hover:text-destructive transition-colors -mb-1 disabled:opacity-50"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
