import { Star, Plus } from "lucide-react";
import { Product } from "@/lib/store";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

const ProductCard = ({ product, onSelect }: ProductCardProps) => {
  const { addToCart } = useCart();

  return (
    <div
      className="bg-card border border-border rounded-xl overflow-hidden shadow-product animate-fade-in cursor-pointer active:scale-[0.98] transition-transform"
      onClick={() => onSelect(product)}
    >
      <div className="relative aspect-square overflow-hidden">
        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        {product.badge && (
          <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            {product.badge}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-display text-sm font-semibold truncate">{product.name}</h3>
        <div className="flex items-center gap-1 mt-1">
          <Star size={12} className="fill-primary text-primary" />
          <span className="text-[11px] text-muted-foreground">{product.rating}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold">₹{product.price.toLocaleString("en-IN")}</span>
            {product.originalPrice && (
              <span className="text-[11px] text-muted-foreground line-through">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
            className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          >
            <Plus size={14} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
