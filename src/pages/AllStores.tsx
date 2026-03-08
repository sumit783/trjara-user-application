import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, BadgeCheck, MapPin } from "lucide-react";
import { stores } from "@/lib/store";

const AllStores = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl py-4 flex items-center gap-3 border-b border-border/50 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="font-display text-2xl font-bold">All Stores</h1>
                </div>

                {/* Stores Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stores.map((store) => (
                        <div
                            key={store.id}
                            onClick={() => navigate(`/store/${store.id}`)}
                            className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-primary/50 active:scale-[0.99] transition-all group"
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl overflow-hidden shrink-0 shadow-sm"
                                    style={{ backgroundColor: store.color + "15" }}
                                >
                                    {typeof store.icon === "string" ? (
                                        <img src={store.icon} alt={store.name} className="w-full h-full object-cover" />
                                    ) : (
                                        store.icon
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <h2 className="font-display font-bold text-lg truncate group-hover:text-primary transition-colors">
                                            {store.name}
                                        </h2>
                                        {store.verified && <BadgeCheck size={18} className="text-primary shrink-0" />}
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                        {store.description}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs">
                                        <div className="flex items-center gap-1 font-semibold">
                                            <Star size={14} className="fill-primary text-primary" />
                                            <span>{store.rating}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <MapPin size={14} />
                                            <span className="truncate">{store.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs">
                                <div className="flex gap-3">
                                    <span className="text-muted-foreground">
                                        <strong className="text-foreground">{store.productsCount}</strong> Products
                                    </span>
                                    <span className="text-muted-foreground">
                                        <strong className="text-foreground">{store.categoriesCount}</strong> Categories
                                    </span>
                                </div>
                                <span className="text-primary font-bold">Visit Store</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AllStores;
