import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { stores } from "@/lib/store";

const CartView = () => {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center">
          <ShoppingBag size={32} className="text-muted-foreground" />
        </div>
        <h2 className="font-display text-xl font-bold">Your cart is empty</h2>
        <p className="text-sm text-muted-foreground text-center">
          Explore our collection and add items you love
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-40">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-2xl font-bold mb-4">Your Cart</h1>
        <div className="space-y-3">
          {items.map(({ product, quantity }) => {
            const store = stores.find((s) => s.id === product.storeId);
            return (
              <div key={product.id} className="bg-card border border-border rounded-xl p-3 flex gap-3 animate-fade-in">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">{product.name}</h3>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <div className="w-4 h-4 rounded-sm overflow-hidden flex items-center justify-center">
                        {typeof store.icon === "string" ? (
                          <img src={store.icon} alt={store.name} className="w-full h-full object-cover" />
                        ) : (
                          store.icon
                        )}
                      </div>
                      {store.name}
                    </p>
                    <p className="text-sm font-bold text-primary">₹{product.price.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-secondary rounded-full px-2 py-1">
                      <button onClick={() => updateQuantity(product.id, quantity - 1)}>
                        <Minus size={14} className="text-muted-foreground" />
                      </button>
                      <span className="text-xs font-bold w-3 text-center">{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, quantity + 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-destructive p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Checkout bar */}
        <div className="fixed bottom-16 md:bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 pb-4">
          <div className="bg-primary text-primary-foreground rounded-2xl p-4 flex items-center justify-between shadow-glow">
            <div>
              <p className="text-xs opacity-80">Total</p>
              <p className="text-xl font-bold">₹{totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
            </div>
            <button className="bg-primary-foreground text-primary font-bold px-6 py-3 rounded-xl active:scale-95 transition-transform">
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartView;
