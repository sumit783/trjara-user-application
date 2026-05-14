import { getCategoryById, categories } from '@/lib/products';
import Link from 'next/link';
import { CategoryClient } from './category-client';

export function generateStaticParams() {
  return categories.map((category) => ({
    id: category.id,
  }));
}

interface CategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params;
  const category = getCategoryById(id);

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Category not found
          </h1>
          <Link href="/" className="text-primary hover:text-accent">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return <CategoryClient categoryId={id} />;
}
