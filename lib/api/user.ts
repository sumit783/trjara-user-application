export const fetchProfile = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/customer/profile`, {
    credentials: 'include',
    headers: {
      // Assuming token is stored in localStorage or cookies
      // We might need to add Authorization header if required
      // For now, let's assume it sends cookies or we need to pass token
      // Let's check if there is a token in localStorage in the component
    }
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
