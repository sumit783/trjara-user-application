export const fetchProductDetails = async (id: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/customer/products/${id}`);
    if (!response.ok) {
      return { success: false, error: 'Product not found', status: response.status };
    }
    return response.json();
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Network error' };
  }
};
