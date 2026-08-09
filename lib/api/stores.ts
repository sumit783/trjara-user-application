export const fetchTopStoreLogos = async (lat?: number, lng?: number) => {
  const queryParams = new URLSearchParams();
  if (lat) queryParams.append('lat', lat.toString());
  if (lng) queryParams.append('lng', lng.toString());
  
  const queryString = queryParams.toString();
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/customer/top-store-logos${queryString ? `?${queryString}` : ''}`);
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Network response was not ok');
  }
  if (!data.success && data.errorCode === "OUT_OF_SERVICE_AREA") {
    throw new Error(data.message || "Sorry, we don't provide service in your area");
  }
  return data;
};

export interface FetchStoresParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  lat?: number;
  lng?: number;
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
  if (params.lat) queryParams.append('lat', params.lat.toString());
  if (params.lng) queryParams.append('lng', params.lng.toString());

  const queryString = queryParams.toString();
  const url = `${process.env.NEXT_PUBLIC_BASE_URI}/api/customer/stores${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Network response was not ok');
  }
  if (!data.success && data.errorCode === "OUT_OF_SERVICE_AREA") {
    throw new Error(data.message || "Sorry, we don't provide service in your area");
  }
  return data;
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


