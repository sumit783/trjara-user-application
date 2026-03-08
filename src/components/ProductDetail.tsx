import { X, Star, Minus, Plus, ShoppingBag } from "lucide-react";
import { Product } from "@/lib/store";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

const ProductDetail = ({ product, onClose }: ProductDetailProps) => {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mt-auto max-h-[90vh] bg-card rounded-t-3xl animate-slide-up overflow-auto">
        <div className="sticky top-0 z-10 flex justify-end p-4">
          <button
            onClick={onClose}
            className="bg-secondary w-8 h-8 rounded-full flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <div className="aspect-square -mt-12 mx-4 rounded-2xl overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div className="p-5 pb-8 space-y-4">
          <div>
            {product.badge && (
              <span className="text-primary text-xs font-bold uppercase tracking-wider">
                {product.badge}
              </span>
            )}
            <h2 className="font-display text-2xl font-bold mt-1">{product.name}</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <Star size={14} className="fill-primary text-primary" />
              <span className="text-sm text-muted-foreground">{product.rating} rating</span>
            </div>
          </div>

          <p className="text-sm text-secondary-foreground leading-relaxed">{product.description}</p>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold">${product.price}</span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through ml-2">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 bg-secondary rounded-full px-3 py-1.5">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-muted-foreground">
                <Minus size={16} />
              </button>
              <span className="text-sm font-bold w-4 text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="text-foreground">
                <Plus size={16} />
              </button>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <ShoppingBag size={18} />
            Add to Cart — ${product.price * qty}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
