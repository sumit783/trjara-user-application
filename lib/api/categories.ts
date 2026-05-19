export const fetchPrimaryCategories = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/customer/primary-categories`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const fetchProductsByCategory = async (categoryId: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/customer/category/${categoryId}/products`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};
