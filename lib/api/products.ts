export const fetchProductDetails = async (id: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/customer/products/${id}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};
