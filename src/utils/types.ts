export interface Property {
  id: string;
  title: string;
  location: string;
  monthlyRate: number;
  nightlyRate?: number;
  images: string[];
  amenities: string[];
  availableDates: string[];
  travelerType: string;
  discountType?: 'last_minute' | 'none';
  rating: number;
  reviews: number;
  description: string;
  localTips: LocalTip[];
  minStay: number;
  maxStay: number;
  bedrooms: number;
  bathrooms: number;
  hostName: string;
  availability: AvailabilityDay[];
  allowsShortStay?: boolean;
  tags?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface AvailabilityDay {
  date: string;
  available: boolean;
}

export interface LocalTip {
  id: string;
  title: string;
  description: string;
  category: 'restaurant' | 'activity' | 'transport' | 'shopping';
  image: string;
}