export interface Pin {
  id: 'A' | 'B' | 'C';
  name: string;
  lat: number;
  lng: number;
  radius?: number; // in miles, optional filter
  weight?: number; // 0-1, for optimized sorting
}

export interface MapState {
  mode: 'browse' | 'plan';
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  pins: Pin[];
  poi?: {
    name: string;
    lat: number;
    lng: number;
  };
}

export interface DistanceResult {
  listingId: string;
  distances: {
    [pinId: string]: number; // distance in miles
  };
  optimizedScore?: number; // weighted average distance
}
