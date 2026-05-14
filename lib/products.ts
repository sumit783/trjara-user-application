export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  rating: number;
  description: string;
  specs: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

export const categories: Category[] = [
  {
    id: 'furniture',
    name: 'Furniture',
    description: 'Modern and stylish furniture pieces',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80',
    productCount: 12,
  },
  {
    id: 'clothing',
    name: 'Clothing',
    description: 'Premium fashion and casual wear',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&q=80',
    productCount: 24,
  },
  {
    id: 'accessories',
    name: 'Accessories',
    description: 'Elegant accessories and décor',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80',
    productCount: 18,
  },
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Latest gadgets and tech innovation',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80',
    productCount: 15,
  },
  {
    id: 'groceries',
    name: 'Groceries',
    description: 'Fresh organic produce and daily essentials',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80',
    productCount: 30,
  },
];

export const products: Product[] = [
  // Furniture
  {
    id: 'furn-001',
    name: 'Modern Sectional Sofa',
    category: 'Furniture',
    price: 1299.99,
    image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=500&q=80',
    rating: 4.8,
    description: 'Comfortable modern sectional sofa perfect for contemporary homes',
    specs: ['Length: 120"', 'Microfiber Fabric', 'Color: Charcoal Gray'],
  },
  {
    id: 'furn-002',
    name: 'Wooden Dining Table',
    category: 'Furniture',
    price: 599.99,
    image: 'https://images.unsplash.com/photo-1537696357512-f64f84b56cea?w=500&q=80',
    rating: 4.6,
    description: 'Elegant wooden dining table with natural finishes',
    specs: ['Seats: 6', 'Solid Oak Wood', 'Dimensions: 60"x36"'],
  },
  {
    id: 'furn-003',
    name: 'Minimalist Coffee Table',
    category: 'Furniture',
    price: 349.99,
    image: 'https://images.unsplash.com/photo-1532372320572-cda59dfffa12?w=500&q=80',
    rating: 4.5,
    description: 'Sleek minimalist coffee table in matte black',
    specs: ['Material: Steel & Glass', 'Height: 18"', 'Color: Matte Black'],
  },
  {
    id: 'furn-004',
    name: 'Contemporary Bed Frame',
    category: 'Furniture',
    price: 799.99,
    image: 'https://images.unsplash.com/photo-1540932549986-b8a874ad74e7?w=500&q=80',
    rating: 4.7,
    description: 'Modern bed frame with upholstered headboard',
    specs: ['Size: Queen', 'Upholstered Headboard', 'Color: Cream'],
  },
  // Clothing
  {
    id: 'clth-001',
    name: 'Premium Cotton T-Shirt',
    category: 'Clothing',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80',
    rating: 4.7,
    description: 'High-quality 100% organic cotton T-shirt',
    specs: ['Material: Organic Cotton', 'Available Sizes: XS-XXL', 'Care: Machine Wash'],
  },
  {
    id: 'clth-002',
    name: 'Classic Blue Jeans',
    category: 'Clothing',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500&q=80',
    rating: 4.8,
    description: 'Timeless blue denim with perfect fit',
    specs: ['Material: 99% Cotton, 1% Elastane', 'Inseam: 32"', 'Fit: Slim Fit'],
  },
  {
    id: 'clth-003',
    name: 'Elegant Blazer',
    category: 'Clothing',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1591047990508-29577b8e263c?w=500&q=80',
    rating: 4.9,
    description: 'Professional blazer for every occasion',
    specs: ['Material: 100% Wool', 'Lining: Polyester', 'Color: Navy'],
  },
  {
    id: 'clth-004',
    name: 'Summer Floral Dress',
    category: 'Clothing',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=500&q=80',
    rating: 4.6,
    description: 'Lightweight floral dress perfect for summer',
    specs: ['Material: Cotton Linen Blend', 'Style: Maxi', 'Color: Floral Print'],
  },
  // Accessories
  {
    id: 'acc-001',
    name: 'Leather Crossbody Bag',
    category: 'Accessories',
    price: 189.99,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80',
    rating: 4.7,
    description: 'Premium leather crossbody bag with adjustable strap',
    specs: ['Material: Genuine Leather', 'Capacity: 10L', 'Color: Cognac'],
  },
  {
    id: 'acc-002',
    name: 'Silk Scarf Set',
    category: 'Accessories',
    price: 69.99,
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80',
    rating: 4.5,
    description: 'Set of 3 premium silk scarves in versatile colors',
    specs: ['Material: 100% Silk', 'Size: 36"x36"', 'Includes: 3 pieces'],
  },
  {
    id: 'acc-003',
    name: 'Classic Wrist Watch',
    category: 'Accessories',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&q=80',
    rating: 4.8,
    description: 'Timeless wrist watch with leather strap',
    specs: ['Movement: Quartz', 'Case: Stainless Steel', 'Water Resistant: 50M'],
  },
  {
    id: 'acc-004',
    name: 'Designer Sunglasses',
    category: 'Accessories',
    price: 179.99,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80',
    rating: 4.6,
    description: 'UV-protected designer sunglasses with premium frames',
    specs: ['Lens: Polycarbonate', 'Frame: Metal', 'UV Protection: 100%'],
  },
  // Electronics
  {
    id: 'elec-001',
    name: 'Pro Wireless Headphones',
    category: 'Electronics',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    rating: 4.9,
    description: 'Noise-canceling premium wireless headphones with studio-quality sound',
    specs: ['Battery: 30 Hours', 'Bluetooth 5.3', 'Active Noise Canceling'],
  },
  {
    id: 'elec-002',
    name: 'Ultra HD Smartwatch',
    category: 'Electronics',
    price: 329.99,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80',
    rating: 4.7,
    description: 'Feature-rich health and fitness smartwatch with OLED screen',
    specs: ['Display: OLED', 'Water Resistance: 50m', 'Heart Rate Monitor'],
  },
  // Groceries
  {
    id: 'groc-001',
    name: 'Organic Avocados',
    category: 'Groceries',
    price: 6.99,
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&q=80',
    rating: 4.8,
    description: 'Pack of 4 fresh organic Hass avocados ripe and ready to eat',
    specs: ['Origin: California', 'Organic Certified', 'Pack of 4'],
  },
  {
    id: 'groc-002',
    name: 'Artisan Sourdough Bread',
    category: 'Groceries',
    price: 5.49,
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=500&q=80',
    rating: 4.9,
    description: 'Freshly baked artisan sourdough loaf with a crispy crust',
    specs: ['Weight: 500g', 'Bakery Fresh', '100% Sourdough'],
  },
];

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter((p) => p.category.toLowerCase() === categoryId.toLowerCase());
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}
