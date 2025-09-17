import { Pin, DistanceResult } from '@/types/map';

// Haversine formula to calculate distance between two points
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Format distance for display
export function formatDistance(distance: number): string {
  if (distance < 0.2) {
    // Show in meters if less than 0.2 miles
    const meters = Math.round(distance * 1609.34 / 50) * 50; // Round to nearest 50m
    return `${meters}m`;
  }
  return `${distance.toFixed(1)} mi`;
}

// Calculate distances from a listing to all active pins
export function calculateListingDistances(
  listing: { id: string; coordinates?: { lat: number; lng: number } },
  pins: Pin[]
): DistanceResult {
  if (!listing.coordinates) {
    return {
      listingId: listing.id,
      distances: {}
    };
  }

  const distances: { [pinId: string]: number } = {};
  
  pins.forEach(pin => {
    distances[pin.id] = calculateDistance(
      listing.coordinates!.lat,
      listing.coordinates!.lng,
      pin.lat,
      pin.lng
    );
  });

  return {
    listingId: listing.id,
    distances
  };
}

// Calculate optimized score (weighted average distance)
export function calculateOptimizedScore(
  distances: { [pinId: string]: number },
  pins: Pin[]
): number {
  if (pins.length === 0) return 0;
  
  const totalWeight = pins.reduce((sum, pin) => sum + (pin.weight || 1), 0);
  if (totalWeight === 0) return 0;
  
  const weightedSum = pins.reduce((sum, pin) => {
    const weight = pin.weight || 1;
    const distance = distances[pin.id] || 0;
    return sum + (distance * weight);
  }, 0);
  
  return weightedSum / totalWeight;
}

// Sort listings by distance to specific pin
export function sortByDistanceToPin(
  listings: any[],
  pinId: string,
  distanceResults: DistanceResult[]
): any[] {
  const distanceMap = new Map(
    distanceResults.map(result => [result.listingId, result.distances[pinId] || Infinity])
  );
  
  return [...listings].sort((a, b) => {
    const distanceA = distanceMap.get(a.id) || Infinity;
    const distanceB = distanceMap.get(b.id) || Infinity;
    return distanceA - distanceB;
  });
}

// Sort listings by optimized score
export function sortByOptimizedScore(
  listings: any[],
  distanceResults: DistanceResult[]
): any[] {
  const scoreMap = new Map(
    distanceResults.map(result => [result.listingId, result.optimizedScore || Infinity])
  );
  
  return [...listings].sort((a, b) => {
    const scoreA = scoreMap.get(a.id) || Infinity;
    const scoreB = scoreMap.get(b.id) || Infinity;
    return scoreA - scoreB;
  });
}
