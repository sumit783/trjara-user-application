import React from "react";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";

import storeLogo1 from "@/assets/✦ Order ✦ ✦ No ✦ ✦ For ✦ ✦ Custom ✦ ✦ Work ✦.jpeg";
import storeLogo2 from "@/assets/🔥 Get Your Custom Logo Designed Today! 🔥.jpeg";
import storeLogo3 from "@/assets/Aura Cafe Logo Design _ Elegant & Modern Coffee Brand Identity.jpeg";
import storeLogo4 from "@/assets/coffee shop business logo.jpeg";
import storeLogo5 from "@/assets/contact us for logo design cpixlr (1).jpeg";
export { storeLogo3 as appLogo };

export interface ProductVariant {
  id: string;
  name: string; // e.g., "Color", "Storage"
  options: {
    id: string;
    value: string; // e.g., "Space Gray", "128GB"
    priceModifier?: number;
  }[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  rating: number;
  description: string;
  badge?: string;
  storeId: string;
  variants?: ProductVariant[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants?: Record<string, string>; // variant name -> option value
}

export interface Store {
  id: string;
  name: string;
  icon: string | React.ReactNode;
  color: string;
  description: string;
  rating: number;
  productsCount: number;
  categoriesCount: number;
  location: string;
  verified: boolean;
}

export const categories = ["All", "Audio", "Wearables", "Cases", "Power", "Cables"];

export const stores: Store[] = [
  {
    id: "s1",
    name: "TechZone",
    icon: storeLogo1,
    color: "hsl(30 90% 41%)",
    description: "Premium tech accessories and gadgets. Authorized dealer for top brands worldwide.",
    rating: 4.9,
    productsCount: 156,
    categoriesCount: 8,
    location: "San Francisco, CA",
    verified: true,
  },
  {
    id: "s2",
    name: "AudioHub",
    icon: storeLogo2,
    color: "hsl(250 70% 55%)",
    description: "Your go-to destination for high-fidelity audio equipment and accessories.",
    rating: 4.8,
    productsCount: 89,
    categoriesCount: 5,
    location: "Austin, TX",
    verified: true,
  },
  {
    id: "s3",
    name: "CaseCraft",
    icon: storeLogo3,
    color: "hsl(160 60% 40%)",
    description: "Handcrafted premium cases and covers for all your devices.",
    rating: 4.7,
    productsCount: 234,
    categoriesCount: 12,
    location: "New York, NY",
    verified: true,
  },
  {
    id: "s4",
    name: "PowerUp",
    icon: storeLogo4,
    color: "hsl(45 90% 50%)",
    description: "Fast charging solutions and portable power for the modern lifestyle.",
    rating: 4.6,
    productsCount: 67,
    categoriesCount: 4,
    location: "Seattle, WA",
    verified: false,
  },
  {
    id: "s5",
    name: "WearTech",
    icon: storeLogo5,
    color: "hsl(340 70% 50%)",
    description: "Smart wearables and fitness tech that seamlessly blend with your style.",
    rating: 4.9,
    productsCount: 112,
    categoriesCount: 6,
    location: "Los Angeles, CA",
    verified: true,
  },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Aura Pro Buds",
    price: 149,
    originalPrice: 199,
    images: [product1, product2, product3],
    category: "Audio",
    rating: 4.8,
    description: "Immersive sound with active noise cancellation. 36-hour battery life in a sleek matte finish.",
    badge: "Best Seller",
    storeId: "s2",
    variants: [
      {
        id: "v1",
        name: "Color",
        options: [
          { id: "o1", value: "Matte Black" },
          { id: "o2", value: "Arctic White" },
          { id: "o3", value: "Ocean Blue" }
        ]
      }
    ]
  },
  {
    id: "2",
    name: "Noir Chronograph",
    price: 329,
    images: [product2, product1, product4],
    category: "Wearables",
    rating: 4.9,
    description: "Premium smartwatch with sapphire crystal display. Track fitness, calls, and notifications with elegance.",
    badge: "New",
    storeId: "s5",
    variants: [
      {
        id: "v2",
        name: "Strap",
        options: [
          { id: "o4", value: "Leather" },
          { id: "o5", value: "Silicone" },
          { id: "o6", value: "Stainless Steel", priceModifier: 50 }
        ]
      }
    ]
  },
  {
    id: "3",
    name: "Vega Leather Case",
    price: 59,
    originalPrice: 79,
    images: [product3, product2, product6],
    category: "Cases",
    rating: 4.7,
    description: "Hand-stitched Italian leather case. Slim profile with card slot and magnetic closure.",
    storeId: "s3",
    variants: [
      {
        id: "v3",
        name: "Model",
        options: [
          { id: "o7", value: "iPhone 15" },
          { id: "o8", value: "iPhone 15 Pro" },
          { id: "o9", value: "iPhone 15 Pro Max", priceModifier: 10 }
        ]
      }
    ]
  },
  {
    id: "4",
    name: "Flux Power Bank",
    price: 89,
    images: [product4, product1, product5],
    category: "Power",
    rating: 4.6,
    description: "20,000mAh with 65W fast charging. Charges your phone 5x over in a pocket-sized design.",
    storeId: "s4",
  },
  {
    id: "5",
    name: "Onyx Speaker",
    price: 199,
    originalPrice: 249,
    images: [product5, product1, product2],
    category: "Audio",
    rating: 4.8,
    description: "360° spatial audio in a premium woven fabric enclosure. 20-hour playtime with deep bass.",
    badge: "Hot",
    storeId: "s2",
  },
  {
    id: "6",
    name: "Titan USB-C Cable",
    price: 29,
    images: [product6, product1, product4],
    category: "Cables",
    rating: 4.5,
    description: "Braided nylon with gold-plated connectors. 240W charging, 40Gbps data transfer. Built to last.",
    storeId: "s1",
  },
];
