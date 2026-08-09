export const fetchSection = async (section: string, lat?: number, lng?: number) => {
  const queryParams = new URLSearchParams();
  if (lat) queryParams.append('lat', lat.toString());
  if (lng) queryParams.append('lng', lng.toString());
  
  const queryString = queryParams.toString();
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/api/customer/sections/${section}${queryString ? `?${queryString}` : ''}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Network response was not ok');
  }
  if (!data.success && data.errorCode === "OUT_OF_SERVICE_AREA") {
    throw new Error(data.message || "Sorry, we don't provide service in your area");
  }
  return data;
};

export const fetchTopPicks = (lat?: number, lng?: number) => fetchSection('top-picks', lat, lng);
export const fetchFreshHealthy = (lat?: number, lng?: number) => fetchSection('fresh-healthy', lat, lng);
export const fetchWeeklyDeals = (lat?: number, lng?: number) => fetchSection('weekly-deals', lat, lng);
export const fetchBestSellers = (lat?: number, lng?: number) => fetchSection('best-sellers', lat, lng);
export const fetchNewArrivals = (lat?: number, lng?: number) => fetchSection('new-arrivals', lat, lng);
