import type { Property } from '@/utils/types';
import type { Listing } from '@/lib/schemas/listing';
import { getBadges } from '@/lib/badges';
import { findEarliestValidWindow } from '@/lib/calendar';

type CompareItem = Property | Listing;

export function isListing(item: CompareItem): item is Listing {
  return 'monthly_rent' in item && 'platform' in item;
}

export function getItemTitle(item: CompareItem): string {
  return item.title;
}

export function getItemImages(item: CompareItem): string[] {
  return item.images;
}

export function getItemLocation(item: CompareItem): string {
  if (isListing(item)) {
    return `${item.city}, ${item.country}`;
  }
  return item.location;
}

export function getItemPrice(item: CompareItem): { monthly: number; nightly?: number } {
  if (isListing(item)) {
    return {
      monthly: item.monthly_rent,
      nightly: item.base_nightly
    };
  }
  return {
    monthly: item.monthlyRate,
    nightly: item.nightlyRate
  };
}

export function getItemRating(item: CompareItem): { rating: number; count: number } {
  if (isListing(item)) {
    return {
      rating: item.reviews.rating_avg,
      count: item.reviews.review_count
    };
  }
  return {
    rating: item.rating,
    count: item.reviews
  };
}

export function getItemBedrooms(item: CompareItem): number {
  return item.bedrooms;
}

export function getItemBathrooms(item: CompareItem): number {
  return item.bathrooms;
}

export function getItemAmenities(item: CompareItem): string[] {
  return item.amenities;
}

export function getItemBadges(item: CompareItem): string[] {
  if (isListing(item)) {
    return getBadges(item);
  }
  // For legacy Property, create basic badges
  const badges: string[] = [];
  if (item.minStay >= 30) {
    badges.push('Mid-let');
  }
  return badges;
}

export function getItemStayType(item: CompareItem): string {
  if (isListing(item)) {
    // Use the new stay_type_availability field
    switch (item.ui_flags.stay_type_availability) {
      case 'mtl_only':
        return 'Mid-let only';
      case 'short_stay_only':
        return 'Short-stay only';
      case 'both':
        return 'Flexible';
      default:
        return 'Mid-let only';
    }
  }
  // For legacy Property, determine based on minStay
  return item.minStay >= 30 ? 'Mid-let only' : 'Short-stay only';
}

export function getItemDeposits(item: CompareItem): { holding: number; security: number } | null {
  if (isListing(item)) {
    return {
      holding: Math.round(item.monthly_rent * item.deposits.holding_deposit.percentage / 100),
      security: item.deposits.security_deposit.amount
    };
  }
  return null;
}

export function getItemEarliestWindow(item: CompareItem): { start: Date; end: Date } | null {
  if (isListing(item)) {
    return findEarliestValidWindow(item, 30);
  }
  return null;
}

export function getItemAvailability(item: CompareItem): Array<{ date: string; available: boolean }> {
  if (isListing(item)) {
    return item.availability.map(d => ({
      date: d.date,
      available: !d.is_blocked
    }));
  }
  return item.availability;
}

export function getItemHostName(item: CompareItem): string {
  if (isListing(item)) {
    return 'Houst Direct'; // All MTL listings are from Houst Direct
  }
  return item.hostName;
}

export function getItemMinStay(item: CompareItem): number {
  if (isListing(item)) {
    return item.minimum_stay_nights;
  }
  return item.minStay;
}

export function getItemMaxStay(item: CompareItem): number {
  if (isListing(item)) {
    return 365; // MTL listings typically allow up to 1 year
  }
  return item.maxStay;
}

// Convert Listing to Property for compatibility with existing components
export function listingToProperty(listing: Listing): Property {
  return {
    id: listing.id,
    title: listing.title,
    location: `${listing.city}, ${listing.country}`,
    monthlyRate: listing.monthly_rent,
    nightlyRate: listing.base_nightly,
    images: listing.images,
    amenities: listing.amenities,
    availableDates: listing.availability.filter(day => !day.is_blocked).map(day => day.date),
    travelerType: 'Mid-term let',
    discountType: 'none',
    rating: listing.reviews.rating_avg,
    reviews: listing.reviews.review_count,
    description: listing.description,
    localTips: [], // MTL listings don't have local tips in the schema
    minStay: listing.minimum_stay_nights,
    maxStay: 365,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    hostName: 'Houst Direct', // MTL listings don't have host info in schema
    availability: listing.availability.map(day => ({
      date: day.date,
      available: !day.is_blocked
    })),
    allowsShortStay: listing.ui_flags.stay_type_availability === 'both' || listing.ui_flags.stay_type_availability === 'short_stay_only',
    tags: [],
    coordinates: listing.coordinates
  };
}
