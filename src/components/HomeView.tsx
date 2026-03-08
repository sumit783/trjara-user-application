import { Search, ArrowRight, Flame, TrendingUp, Clock, Star, Zap, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { products, categories, stores } from "@/lib/store";
import ProductCard from "./ProductCard";
import StoreCard from "./StoreCard";
import heroBanner from "@/assets/hero-banner.jpg";
import heroBanner2 from "@/assets/hero-banner-2.png";
import heroBanner3 from "@/assets/hero-banner-3.png";
import { motion, AnimatePresence } from "framer-motion";

interface HomeViewProps {
  onNavigate: (tab: string) => void;
}

const slides = [
  {
    image: heroBanner,
    title: "Premium\nTech Gear",
    subtitle: "New Arrivals",
    cta: "Shop Now",
    color: "from-gray-950/80 via-gray-900/40 to-transparent"
  },
  {
    image: heroBanner2,
    title: "Futuristic\nAccessories",
    subtitle: "Exclusive Range",
    cta: "Explore",
    color: "from-blue-950/80 via-blue-900/40 to-transparent"
  },
  {
    image: heroBanner3,
    title: "Minimalist\nWorkspace",
    subtitle: "Productivity First",
    cta: "View Collection",
    color: "from-neutral-900/80 via-neutral-800/40 to-transparent"
  }
];

const HomeView = ({ onNavigate }: HomeViewProps) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  const filtered = products.filter((p) => {
    const matchCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const deals = products.filter((p) => p.originalPrice);
  const newArrivals = products.filter((p) => p.badge === "New" || p.badge === "Hot");
  const bestSellers = products.filter((p) => p.rating >= 4.8);

  return (
    <div className="pb-24 text-foreground">
      {/* Header - mobile only */}
      <div className="px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 md:hidden">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Welcome to</p>
            <h1 className="font-display text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Trjara</h1>
          </div>
          <div className="w-10 h-10 bg-card border border-border rounded-full flex items-center justify-center shadow-sm">
            <Bell size={18} className="text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Search */}
        <div className="px-4 mb-6 md:mt-8">
          <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl flex items-center gap-3 px-4 py-3 max-w-xl shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Search size={18} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm md:text-base outline-none w-full placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Hero Slider */}
        <div className="px-4 mb-8">
          <div className="relative rounded-3xl overflow-hidden h-52 md:h-80 group shadow-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <img src={slides[currentSlide].image} alt={slides[currentSlide].title} className="w-full h-full object-cover scale-105" />
                <div className={`absolute inset-0 bg-gradient-to-r ${slides[currentSlide].color}`} />
                <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12">
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-primary text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-2"
                  >
                    {slides[currentSlide].subtitle}
                  </motion.p>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="font-display text-3xl md:text-5xl font-black leading-[1.1] text-white whitespace-pre-line"
                  >
                    {slides[currentSlide].title}
                  </motion.h2>
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onClick={() => onNavigate("categories")}
                    className="mt-5 bg-primary text-primary-foreground text-xs md:text-sm font-bold px-6 py-2.5 rounded-full w-fit hover:shadow-xl hover:shadow-primary/30 active:scale-95 transition-all"
                  >
                    {slides[currentSlide].cta}
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 transition-all rounded-full ${currentSlide === idx ? "w-6 bg-primary" : "w-1.5 bg-white/40"}`}
                />
              ))}
            </div>

            {/* Navigation arrows (desktop) */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Featured Stores */}
        <div className="mb-6">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="font-display text-lg font-bold flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              Featured Stores
            </h2>
            <button
              onClick={() => navigate("/stores")}
              className="text-xs text-primary font-semibold flex items-center gap-1 active:opacity-70 transition-opacity"
            >
              See All <ArrowRight size={12} />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-4">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="px-4 mb-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-medium px-4 py-2 rounded-full whitespace-nowrap transition-colors ${selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-secondary-foreground"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Flash Deals */}
        {deals.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between px-4 mb-3">
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <Flame size={18} className="text-destructive" />
                Flash Deals
              </h2>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock size={12} />
                <span>Ends in 12:34:56</span>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
              {deals.map((product) => (
                <div key={product.id} className="min-w-[160px] md:min-w-[200px]">
                  <ProductCard product={product} onSelect={() => navigate(`/product/${product.id}`)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products grid */}
        <div className="px-4 mb-6">
          <h2 className="font-display text-lg font-bold mb-3">All Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} onSelect={() => navigate(`/product/${product.id}`)} />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground text-sm mt-8">No products found</p>
          )}
        </div>

        {/* New Arrivals - horizontal large cards */}
        {newArrivals.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between px-4 mb-3">
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <Zap size={18} className="text-primary" />
                New Arrivals
              </h2>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar px-4">
              {newArrivals.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="min-w-[260px] md:min-w-[320px] bg-card border border-border rounded-2xl overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
                >
                  <div className="h-36 md:h-48 overflow-hidden">
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{product.badge}</span>
                    <h3 className="font-display font-semibold mt-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{product.description}</p>
                    <p className="text-lg font-bold text-primary mt-2">₹{product.price.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best Sellers horizontal */}
        {bestSellers.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between px-4 mb-3">
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <Star size={18} className="fill-primary text-primary" />
                Best Sellers
              </h2>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
              {bestSellers.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 min-w-[280px] md:min-w-[320px] cursor-pointer active:scale-[0.99] transition-transform"
                >
                  <img src={product.images[0]} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-primary">₹{product.price.toLocaleString("en-IN")}</span>
                      <span className="text-xs text-muted-foreground">⭐ {product.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Banner CTA */}
        <div className="px-4 mb-6">
          <div className="bg-primary rounded-2xl p-6 md:p-8 text-center">
            <h2 className="font-display text-xl md:text-2xl font-bold text-primary-foreground mb-2">Free Shipping</h2>
            <p className="text-primary-foreground/80 text-sm mb-4">On all orders over ₹500. Limited time offer!</p>
            <button
              onClick={() => onNavigate("categories")}
              className="bg-primary-foreground text-primary font-bold px-6 py-2.5 rounded-xl text-sm active:scale-95 transition-transform"
            >
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
