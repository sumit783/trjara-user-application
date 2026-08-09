export const fetchProfile = async () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  if (typeof window !== 'undefined' && !token) {
    return { success: false, message: 'No token found' };
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/customer/profile`, {
    credentials: 'include',
    headers,
  });
  
  // If the response is 401 or similar, we might want to return a specific structure
  // or let the component handle the error.
  // The user request implies checking if "user not found" (maybe success: false or 404/401)
  
  if (!response.ok) {
    // If it's 401, we can return a specific object or throw
    if (response.status === 401) {
      return { success: false, message: 'Unauthorized' };
    }
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const updateProfile = async (body: FormData) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/customer/profile`, {
    method: 'PUT',
    credentials: 'include',
    headers,
    body: body,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Failed to update profile');
  }

  return response.json();
};

export const fetchPrimaryAddressLabel = async () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    return { success: false, message: 'No token found' };
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/customer/address/primary-label`, {
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    return { success: false, message: 'Failed to fetch primary address label' };
  }
  return response.json();
};

export const fetchAddresses = async () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    return { success: false, message: 'No token found' };
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/customer/address`, {
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    return { success: false, message: 'Failed to fetch addresses' };
  }
  return response.json();
};

export const addAddress = async (body: {
  label: string;
  addressLine1: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  coordinates: [number, number];
  isDefault: boolean;
}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    throw new Error('No token found. Please login to add an address.');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/customer/address`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to add address');
  }
  return response.json();
};

export const updateAddress = async (addressId: string, body: any) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    throw new Error('No token found. Please login to update address.');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/customer/address/${addressId}`, {
    method: 'PUT',
    credentials: 'include',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update address');
  }
  return response.json();
};

export const deleteAddress = async (addressId: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    throw new Error('No token found. Please login to delete address.');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/customer/address/${addressId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete address');
  }
  return response.json();
};

