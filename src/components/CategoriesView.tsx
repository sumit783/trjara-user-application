import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { products, categories } from "@/lib/store";
import ProductCard from "./ProductCard";

const CategoriesView = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();

  const filtered = selectedCategory === "All" ? products : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="px-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-2xl font-bold mb-4">Shop</h1>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-medium px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-secondary-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={() => navigate(`/product/${product.id}`)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesView;
