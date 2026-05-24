export const fetchTopStoreLogos = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/customer/top-store-logos`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export interface FetchStoresParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface StoreResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    logo: string;
    categories: {
      id: string;
      name: string;
      image: string;
    }[];
    productCount: number;
  }[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const fetchStores = async (params: FetchStoresParams = {}): Promise<StoreResponse> => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.category) queryParams.append('category', params.category);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const url = `${process.env.NEXT_PUBLIC_BASE_URI}/api/customer/stores${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export interface StoreDetailsResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    logo: string;
    banner?: string;
    phone?: string;
    email?: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    categories: {
      id: string;
      name: string;
      image: string;
    }[];
    subcategories?: {
      id: string;
      name: string;
      slug: string;
      image: string;
      parent: string;
    }[];
    productCount: number;
    products: {
      id: string;
      name: string;
      images: string[];
      price: number;
      mrp: number;
      discount: number;
      rating?: number;
      category: string;
    }[];
  };
}

export const fetchStoreDetails = async (id: string): Promise<StoreDetailsResponse> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/customer/stores/${id}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};


