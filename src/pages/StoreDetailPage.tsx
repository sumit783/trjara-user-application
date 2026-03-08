import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, BadgeCheck, MapPin } from "lucide-react";
import { stores, products } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import PageTransition from "@/components/PageTransition";

const StoreDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const store = stores.find((s) => s.id === id);
  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Store not found</p>
      </div>
    );
  }

  const storeProducts = products.filter((p) => p.storeId === store.id);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto">
          {/* Top bar */}
          <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl px-4 py-3 flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-product">
              <ArrowLeft size={20} />
            </button>
            <span className="font-semibold">{store.name}</span>
          </div>

          {/* Store header */}
          <div className="px-4 pb-6">
            <div className="bg-card rounded-2xl p-6 border border-border text-center space-y-4">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mx-auto overflow-hidden"
                style={{ backgroundColor: store.color + "20" }}
              >
                {typeof store.icon === "string" ? (
                  <img src={store.icon} alt={store.name} className="w-full h-full object-cover" />
                ) : (
                  store.icon
                )}
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5">
                  <h1 className="font-display text-2xl font-bold">{store.name}</h1>
                  {store.verified && <BadgeCheck size={20} className="text-primary" />}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{store.description}</p>
              </div>

              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="fill-primary text-primary" />
                  <span className="font-semibold">{store.rating}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin size={14} />
                  <span>{store.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="px-4 pb-8">
            <h2 className="font-display text-xl font-bold mb-4">Products ({storeProducts.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {storeProducts.map((p) => (
                <ProductCard key={p.id} product={p} onSelect={() => navigate(`/product/${p.id}`)} />
              ))}
            </div>
            {storeProducts.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No products from this store yet</p>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default StoreDetailPage;
