export const fetchPrimaryCategories = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/customer/primary-categories`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const fetchProductsByCategory = async (categoryId: string, lat?: number, lng?: number) => {
  const queryParams = new URLSearchParams();
  if (lat) queryParams.append('lat', lat.toString());
  if (lng) queryParams.append('lng', lng.toString());
  
  const queryString = queryParams.toString();
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/customer/category/${categoryId}/products${queryString ? `?${queryString}` : ''}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};
