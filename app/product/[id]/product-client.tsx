'use client';

import { BottomNavigation } from '@/components/bottom-navigation';
import { useCart } from '@/lib/cart-context';
import { getProductById, products } from '@/lib/products';
import Link from 'next/link';
import { ChevronRight, Plus, Minus, Search, Share2, Star, Store as StoreIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ProductCarousel } from '@/components/home/product-carousel';
import { stores } from '@/components/home/stores-carousel';

const mockReviews = [
  { id: 1, name: 'Alex M.', rating: 5, date: '2 days ago', comment: 'Absolutely amazing quality! Exceeded all my expectations. Will definitely buy again.' },
  { id: 2, name: 'Sarah T.', rating: 5, date: '1 week ago', comment: 'Fast shipping and fantastic customer service. The product is exactly as described.' },
  { id: 3, name: 'David K.', rating: 4, date: '2 weeks ago', comment: 'Very satisfied with the purchase. Beautiful design and very sturdy.' },
  { id: 4, name: 'Emily R.', rating: 5, date: '1 month ago', comment: 'Highly recommended! Premium packaging and feels incredibly luxurious.' },
  { id: 5, name: 'Michael B.', rating: 5, date: '1 month ago', comment: 'Best purchase I made this year. 10/10.' },
];

const variants = ['Standard Edition', 'Premium Edition', 'Deluxe Bundle'];
const colors = ['#1a1a1a', '#c0c0c0', '#e6c280', '#e0a0a0'];

export function ProductClient({ productId }: { productId: string }) {
  const { items, addItem } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const product = getProductById(productId);
  
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [imageCarouselRef, imageCarouselApi] = useEmblaCarousel({ loop: true });
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const onSelectImage = useCallback(() => {
    if (!imageCarouselApi) return;
    setSelectedImageIndex(imageCarouselApi.selectedScrollSnap());
  }, [imageCarouselApi]);

  useEffect(() => {
    if (!imageCarouselApi) return;
    onSelectImage();
    imageCarouselApi.on('select', onSelectImage);
    imageCarouselApi.on('reInit', onSelectImage);
    return () => {
      imageCarouselApi.off('select', onSelectImage);
      imageCarouselApi.off('reInit', onSelectImage);
    };
  }, [imageCarouselApi, onSelectImage]);

  if (!product) {
    return null;
  }

  const productImages = [
    product.image,
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
  ];

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Link copied to clipboard!');
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const displayedReviews = showAllReviews ? mockReviews : mockReviews.slice(0, 3);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Sleek Gradient Header with Search Bar Only */}
      <div className="bg-gradient-to-b from-black via-black/80 to-transparent pb-2 pt-4 px-4 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto relative flex items-center">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white backdrop-blur-md border border-white rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image Carousel with Share Button */}
          <div className="relative aspect-square w-full overflow-hidden shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200 border border-black/5 group">
            <div className="overflow-hidden w-full h-full" ref={imageCarouselRef}>
              <div className="flex w-full h-full touch-pan-y">
                {productImages.map((img, index) => (
                  <div key={index} className="flex-none w-full h-full relative flex items-center justify-center">
                    <img
                      src={img}
                      alt={`${product.name} - View ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg hover:bg-white text-gray-800 hover:text-primary transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="Share product"
            >
              <Share2 size={20} />
            </button>

            {/* Category Badge */}
            <span className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full tracking-wider">
              {product.category}
            </span>

            {/* Carousel Indicator Dots */}
            <div className="absolute bottom-4 right-4 z-10 flex gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full items-center">
              {productImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => imageCarouselApi?.scrollTo(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    selectedImageIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Product Details & Selection */}
          <div className="flex flex-col justify-between space-y-6 px-4">
            <div className="space-y-3">
              {/* Brand & Name */}
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Brand: Trjara Studio</p>
                <h1 className="text-2xl sm:text-4xl font-black text-foreground leading-tight">{product.name}</h1>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-muted-foreground">({product.rating} / 5.0 • 128 Reviews)</span>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pt-2">
                {product.description}
              </p>
            </div>

            {/* Variants Selector */}
            <div className="space-y-4 pt-2">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground mb-2">Select Variant:</h3>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 ${
                        selectedVariant === v
                          ? 'border-primary bg-primary text-white shadow-md'
                          : 'border-border bg-white text-foreground hover:border-gray-400'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Swatches */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground mb-2">Select Color:</h3>
                <div className="flex items-center gap-3">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                        selectedColor === c ? 'border-primary scale-110 shadow-md ring-2 ring-primary/30' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Store Info Card */}
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20 flex items-center justify-between my-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md text-primary font-black border border-primary/20 flex-shrink-0">
                  <StoreIcon size={22} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-foreground">Sold by: Premium Storehouse</h4>
                  <p className="text-[11px] font-semibold text-muted-foreground">99.4% Positive Feedback • Official Merchant</p>
                </div>
              </div>
              <span className="bg-white text-primary text-[10px] font-black px-2.5 py-1 rounded-lg border border-primary/20 shadow-sm">Verified</span>
            </div>

            {/* Pricing, Add to Cart, Buy Now row */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                {/* Pricing */}
              <div className="flex-shrink-0 pr-2 border-r border-gray-200">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Price</p>
                <p className="text-lg sm:text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  ${(product.price * quantity).toFixed(2)}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 border border-gray-200">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 hover:bg-white rounded-lg transition-colors"
                >
                  <Minus size={14} className="text-primary" />
                </button>
                <span className="w-5 sm:w-6 text-center text-xs sm:text-sm font-black text-foreground">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 hover:bg-white rounded-lg transition-colors"
                >
                  <Plus size={14} className="text-primary" />
                </button>
              </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white h-11 text-xs sm:text-sm font-black relative overflow-hidden shadow-md px-2 sm:px-4"
              >
                {addedToCart ? 'Added!' : 'Add to Cart'}
              </Button>

              {/* Buy Now Button */}
              <Button
                asChild
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white h-11 text-xs sm:text-sm font-black transition-all duration-300 px-2 sm:px-4"
              >
                <Link href="/cart">Buy Now</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Similar Stores Horizontal Carousel */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-foreground">Similar Stores</h3>
            <Link href="/stores" className="text-xs font-black uppercase text-primary hover:underline">View All Stores</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto scroll-smooth hide-scrollbar items-center">
            {stores.map((store) => (
              <Link
                key={store.id}
                href="/stores"
                className="flex-shrink-0 w-32 bg-white rounded-2xl p-3 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden mb-2 border-2 border-primary group-hover:scale-105 transition-transform duration-300">
                  <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-xs font-bold text-foreground truncate w-full">{store.name}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">★ {store.rating || 4.8}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Similar Products Horizontal Carousel */}
        <div>
          <ProductCarousel
            title="Similar Products"
            products={relatedProducts}
            onAddToCart={addItem}
          />
        </div>

        {/* Reviews Section */}
        <div className="border-t border-gray-200 px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-foreground leading-tight">Customer Reviews</h3>
              <p className="text-xs font-semibold text-muted-foreground">Based on 128 verified ratings</p>
            </div>
            <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-black">
              ★ 4.8 / 5.0
            </div>
          </div>

          <div className="space-y-4">
            {displayedReviews.map((rev) => (
              <div key={rev.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                      {rev.name[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-foreground">{rev.name}</h4>
                      <p className="text-[10px] text-muted-foreground">{rev.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>

          {/* Add More / See More Button */}
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="border-2 border-border text-xs font-black px-6 py-2 h-auto rounded-xl hover:bg-gray-50"
            >
              {showAllReviews ? 'Show Less' : 'See More Reviews (125+)'}
            </Button>
          </div>
        </div>
      </div>

      <BottomNavigation cartCount={cartCount} />
    </div>
  );
}
