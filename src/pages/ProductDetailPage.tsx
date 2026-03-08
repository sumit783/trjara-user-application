import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Star, Minus, Plus, ShoppingBag, Heart, Share2, BadgeCheck } from "lucide-react";
import { products, stores } from "@/lib/store";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import PageTransition from "@/components/PageTransition";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const product = products.find((p) => p.id === id);
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    );
  }

  const store = stores.find((s) => s.id === product.storeId);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id);

  const calculateTotalPrice = () => {
    let price = product.price;
    if (product.variants) {
      product.variants.forEach(variant => {
        const selectedValue = selectedVariants[variant.name];
        if (selectedValue) {
          const option = variant.options.find(o => o.value === selectedValue);
          if (option?.priceModifier) price += option.priceModifier;
        }
      });
    }
    return price;
  };

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      // Create a copy of the product with the updated price if variants selected
      const cartProduct = { ...product, price: calculateTotalPrice() };
      addToCart(cartProduct);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto">
          {/* Top bar */}
          <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-product">
              <ArrowLeft size={20} />
            </button>
            <div className="flex gap-2">
              <button onClick={() => setLiked(!liked)} className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-product">
                <Heart size={20} className={liked ? "fill-destructive text-destructive" : ""} />
              </button>
              <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-product">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="px-4 space-y-3">
            <div className="aspect-square md:aspect-[16/9] max-h-[500px] rounded-2xl overflow-hidden shadow-sm">
              <img src={product.images[activeImg]} alt={product.name} className="w-full h-full object-cover transition-all duration-300" />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${activeImg === idx ? "border-primary" : "border-transparent opacity-60"
                      }`}
                  >
                    <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="md:grid md:grid-cols-2 md:gap-8 md:px-4">
            {/* Info */}
            <div className="p-4 md:p-0 md:pt-6 space-y-6">
              <div className="space-y-3">
                {product.badge && (
                  <span className="inline-block bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    {product.badge}
                  </span>
                )}
                <h1 className="font-display text-2xl md:text-3xl font-bold">{product.name}</h1>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="fill-primary text-primary" />
                    <span className="text-sm font-semibold">{product.rating}</span>
                  </div>
                  <span className="text-muted-foreground text-sm">• {product.category}</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>

              {/* Variants */}
              {product.variants?.map((variant) => (
                <div key={variant.id} className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{variant.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.name]: opt.value }))}
                        className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${selectedVariants[variant.name] === opt.value
                          ? "bg-primary border-primary text-primary-foreground shadow-md"
                          : "bg-card border-border hover:border-primary/50"
                          }`}
                      >
                        {opt.value}
                        {opt.priceModifier ? ` (+₹${opt.priceModifier})` : ""}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Store info */}
              {store && (
                <Link
                  to={`/store/${store.id}`}
                  className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border active:scale-[0.99] transition-transform"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg overflow-hidden" style={{ backgroundColor: store.color + "20" }}>
                    {typeof store.icon === "string" ? (
                      <img src={store.icon} alt={store.name} className="w-full h-full object-cover" />
                    ) : (
                      store.icon
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold">{store.name}</span>
                      {store.verified && <BadgeCheck size={14} className="text-primary" />}
                    </div>
                    <span className="text-xs text-muted-foreground">{store.productsCount} products</span>
                  </div>
                  <span className="text-xs text-primary font-semibold">Visit</span>
                </Link>
              )}
            </div>

            {/* Purchase section */}
            <div className="p-4 md:p-0 md:pt-6 space-y-4">
              <div className="bg-card rounded-2xl p-5 border border-border space-y-4 sticky top-[80px]">
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold">₹{calculateTotalPrice().toLocaleString("en-IN")}</span>
                  {product.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
                  )}
                  {product.originalPrice && (
                    <span className="text-sm font-bold text-primary ml-auto">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Quantity</span>
                  <div className="flex items-center gap-3 bg-secondary rounded-full px-4 py-2">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-muted-foreground">
                      <Minus size={16} />
                    </button>
                    <span className="text-sm font-bold w-6 text-center">{qty}</span>
                    <button onClick={() => setQty(qty + 1)}>
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={product.variants && Object.keys(selectedVariants).length < product.variants.length}
                  className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:grayscale"
                >
                  <ShoppingBag size={18} />
                  {product.variants && Object.keys(selectedVariants).length < product.variants.length
                    ? "Select options"
                    : `Add to Cart — ₹${(calculateTotalPrice() * qty).toLocaleString("en-IN")}`}
                </button>
              </div>
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="px-4 pb-8 mt-6">
              <h2 className="font-display text-xl font-bold mb-4">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} onSelect={() => navigate(`/product/${p.id}`)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ProductDetailPage;
