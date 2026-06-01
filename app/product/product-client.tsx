'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { BottomNavigation } from '@/components/bottom-navigation';
import { useCart } from '@/lib/cart-context';
import { getProductById, products } from '@/lib/products';
import { ProductCarousel } from '@/components/home/product-carousel';
import { stores } from '@/components/home/stores-carousel';
import { fetchProductDetails } from '@/lib/api/products';

// Subcomponents imports
import { ProductHeader } from '@/components/product/product-header';
import { ProductImageCarousel } from '@/components/product/product-image-carousel';
import { ProductInfo } from '@/components/product/product-info';
import { StoreCard } from '@/components/product/store-card';
import { VariantSelector } from '@/components/product/variant-selector';
import { CTAControls } from '@/components/product/cta-controls';
import { ProductReviews } from '@/components/product/product-reviews';

const mockReviews = [
  { id: 1, name: 'Alex M.', rating: 5, date: '2 days ago', comment: 'Absolutely amazing quality! Exceeded all my expectations. Will definitely buy again.' },
  { id: 2, name: 'Sarah T.', rating: 5, date: '1 week ago', comment: 'Fast shipping and fantastic customer service. The product is exactly as described.' },
  { id: 3, name: 'David K.', rating: 4, date: '2 weeks ago', comment: 'Very satisfied with the purchase. Beautiful design and very sturdy.' },
  { id: 4, name: 'Emily R.', rating: 5, date: '1 month ago', comment: 'Highly recommended! Premium packaging and feels incredibly luxurious.' },
  { id: 5, name: 'Michael B.', rating: 5, date: '1 month ago', comment: 'Best purchase I made this year. 10/10.' },
];

export function ProductClient({ productId }: { productId: string }) {
  const { items, addItem } = useCart();
  const cartCount = items.length; // Decoupled to display unique products count
  
  const [productData, setProductData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const getProduct = async () => {
      try {
        const result = await fetchProductDetails(productId);
        if (result && result.success) {
          setProductData(result.data);
          if (result.data.variants && result.data.variants.length > 0) {
            setSelectedOptions(result.data.variants[0].options);
          }
        } else {
          // Trigger local fallback if fetch returned failure status
          const fallbackProduct = getProductById(productId);
          if (fallbackProduct) {
            setProductData({
              id: fallbackProduct.id,
              name: fallbackProduct.name,
              category: fallbackProduct.category,
              price: fallbackProduct.price,
              images: [fallbackProduct.image],
              rating: fallbackProduct.rating,
              description: fallbackProduct.description,
              specs: fallbackProduct.specs,
              variants: []
            });
          }
        }
      } catch (error) {
        console.warn('Unexpected error during product fetch, trying local fallback:', error);
        const fallbackProduct = getProductById(productId);
        if (fallbackProduct) {
          setProductData({
            id: fallbackProduct.id,
            name: fallbackProduct.name,
            category: fallbackProduct.category,
            price: fallbackProduct.price,
            images: [fallbackProduct.image],
            rating: fallbackProduct.rating,
            description: fallbackProduct.description,
            specs: fallbackProduct.specs,
            variants: []
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    getProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Product not found.</p>
      </div>
    );
  }

  const product = productData;

  const isInCart = items.some(
    (item) =>
      item.inventoryId === productId ||
      item.id === productId ||
      item.productId === productId ||
      (product && (item.id === product.id || item.productId === product.id))
  );

  const currentVariant = productData.variants?.find((v: any) =>
    Object.entries(selectedOptions).every(([key, value]) => v.options[key] === value)
  ) || productData;

  const currentPrice = currentVariant?.price || productData.price;
  const currentImages = currentVariant?.images?.length > 0 ? currentVariant.images : productData.images || [];
  const productImages = currentImages.length > 0 ? currentImages : ['https://via.placeholder.com/600'];

  const optionsMap: { [key: string]: Set<string> } = {};
  productData.variants?.forEach((v: any) => {
    Object.entries(v.options).forEach(([key, value]) => {
      if (!optionsMap[key]) optionsMap[key] = new Set();
      optionsMap[key].add(value as string);
    });
  });

  const relatedProducts = products
    .filter((p) => p.category === productData.category && p.id !== productData.id);

  const handleAddToCart = () => {
    const inventoryId = currentVariant._id || currentVariant.id || productId;
    const itemToSubmit = {
      id: productData.id,
      productId: productData.id,
      name: productData.name,
      price: currentPrice,
      category: productData.category || 'Product',
      image: productImages[0] || 'https://images.unsplash.com/photo-1441984904556-0ac8d9c98337?w=120&h=120&fit=crop',
      rating: productData.rating || 5.0,
      inventoryId: inventoryId,
    };

    addItem(itemToSubmit, quantity);
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

  return (
    <div className="min-h-screen bg-background pb-32 animate-fade-in">
      {/* Sleek Gradient Header with Search Bar and Back Button */}
      <ProductHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="max-w-7xl mx-auto space-y-8 mt-4">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image Carousel with Share Button */}
          <ProductImageCarousel
            images={productImages}
            productName={product.name}
            category={product.category}
            onShare={handleShare}
          />

          {/* Product Details & Selection */}
          <div className="flex flex-col justify-between space-y-6 px-4">
            <ProductInfo
              name={product.name}
              description={product.description}
              rating={product.rating}
              brand={product.brand}
            />

            {/* Store Info Card */}
            <StoreCard storeName={product.store?.name} />
              
            {/* Variants Selector */}
            <VariantSelector
              optionsMap={optionsMap}
              selectedOptions={selectedOptions}
              onSelectOption={(key, value) =>
                setSelectedOptions((prev) => ({ ...prev, [key]: value }))
              }
            />

            {/* Pricing, Add to Cart, Buy Now row */}
            <CTAControls
              price={currentPrice}
              quantity={quantity}
              setQuantity={setQuantity}
              isInCart={isInCart}
              addedToCart={addedToCart}
              onAddToCart={handleAddToCart}
            />
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
        <ProductReviews
          rating={product.rating}
          reviews={mockReviews}
          showAllReviews={showAllReviews}
          setShowAllReviews={setShowAllReviews}
        />
      </div>

      <BottomNavigation cartCount={cartCount} />
    </div>
  );
}
