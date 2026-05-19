import { categories } from '@/lib/products';
import { CategoryClient } from './category-client';

export async function generateStaticParams() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/customer/primary-categories`);
    const result = await response.json();
    if (result.success) {
      return result.data.map((category: any) => ({
        id: category.id,
      }));
    }
  } catch (error) {
    console.error('Failed to fetch categories for static params:', error);
  }

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
  return <CategoryClient categoryId={id} />;
}
