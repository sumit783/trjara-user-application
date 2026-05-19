import { products } from '@/lib/products';
import { ProductClient } from './product-client';

export async function generateStaticParams() {
  try {
    const catResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/customer/primary-categories`);
    const catResult = await catResponse.json();
    
    if (catResult.success) {
      const allProductIds = new Set<string>();
      
      for (const category of catResult.data) {
        try {
          const prodResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/customer/category/${category.id}/products`);
          const prodResult = await prodResponse.json();
          if (prodResult.success) {
            prodResult.data.forEach((product: any) => {
              allProductIds.add(product.id);
            });
          }
        } catch (err) {
          console.error(`Failed to fetch products for category ${category.id}:`, err);
        }
      }
      
      return Array.from(allProductIds).map((id) => ({
        id: id,
      }));
    }
  } catch (error) {
    console.error('Failed to fetch categories for static params:', error);
  }

  return products.map((product) => ({
    id: product.id,
  }));
}

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  return <ProductClient productId={id} />;
}
