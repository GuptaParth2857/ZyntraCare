// distance.ts - Haversine Distance Calculation
// Calculate distance between two coordinates in km

/**
 * Calculate the distance between two points using the Haversine formula
 * @param lat1 - Latitude of point 1
 * @param lng1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lng2 - Longitude of point 2
 * @returns Distance in kilometers
 */
export function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 */
function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Format distance for display
 * @param km - Distance in kilometers
 * @returns Formatted string (e.g., "1.2 km" or "500 m")
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Check if a point is within a given radius
 * @param userLat - User's latitude
 * @param userLng - User's longitude
 * @param pointLat - Point's latitude
 * @param pointLng - Point's longitude
 * @param radiusKm - Radius in kilometers
 * @returns Boolean
 */
export function isWithinRadius(
  userLat: number,
  userLng: number,
  pointLat: number,
  pointLng: number,
  radiusKm: number
): boolean {
  const distance = getDistanceKm(userLat, userLng, pointLat, pointLng);
  return distance <= radiusKm;
}

/**
 * Sort places by distance from user
 */
export function sortByDistance<T extends { lat: number; lng: number }>(
  places: T[],
  userLat: number,
  userLng: number
): T[] {
  return [...places].sort((a, b) => {
    const distA = getDistanceKm(userLat, userLng, a.lat, a.lng);
    const distB = getDistanceKm(userLat, userLng, b.lat, b.lng);
    return distA - distB;
  });
}

export default {
  getDistanceKm,
  formatDistance,
  isWithinRadius,
  sortByDistance,
};