export const fetchTopStoreLogos = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/customer/top-store-logos`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};
