export const fetchSection = async (section: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/customer/sections/${section}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const fetchTopPicks = () => fetchSection('top-picks');
export const fetchFreshHealthy = () => fetchSection('fresh-healthy');
export const fetchWeeklyDeals = () => fetchSection('weekly-deals');
export const fetchBestSellers = () => fetchSection('best-sellers');
export const fetchNewArrivals = () => fetchSection('new-arrivals');
