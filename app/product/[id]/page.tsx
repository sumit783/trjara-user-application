import { getProductById, products } from '@/lib/products';
import Link from 'next/link';
import { ProductClient } from './product-client';

export function generateStaticParams() {
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
  const product = getProductById(id);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Product not found
          </h1>
          <Link href="/" className="text-primary hover:text-accent">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return <ProductClient productId={id} />;
}
