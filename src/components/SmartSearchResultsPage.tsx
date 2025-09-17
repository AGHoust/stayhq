import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, MapPin, Edit3, ChevronDown, X, Star, Users, Calendar, Home, Wifi, Car, PawPrint, Coffee, Waves, Map } from 'lucide-react';
import { useListings } from '@/lib/listings';
import { listingToProperty } from '@/lib/compare-utils';
import PropertyCard from './PropertyCard';
import MapShell from './MapShell';
import { Pin } from '@/types/map';
import { calculateListingDistances, calculateOptimizedScore, sortByDistanceToPin, sortByOptimizedScore, formatDistance } from '@/utils/distance';

interface SmartSearchParams {
  phrase: string;
  chips: Array<{type: string, value: string, label: string}>;
  destination: string;
  dateMode: 'exact' | 'flexible';
  exactDates: {
    checkIn: string;
    checkOut: string;
  };
  flexibleDates: {
    duration: string;
    month: string;
  };
  guests: {
    adults: number;
    children: number;
    infants: number;
    pets: number;
  };
  filters: {
    priceRange?: [number, number];
    propertyType?: string[];
    petFriendly?: boolean;
    workspace?: boolean;
    pool?: boolean;
  };
}

interface SmartSearchResultsPageProps {
  searchParams: SmartSearchParams;
  onBackToLanding: () => void;
  onPropertyClick: (property: any) => void;
}

const SmartSearchResultsPage: React.FC<SmartSearchResultsPageProps> = ({
  searchParams,
  onBackToLanding,
  onPropertyClick
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'recommended' | 'price_low' | 'price_high' | 'closest' | 'rating' | 'newest'>('recommended');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    priceRange: searchParams.filters?.priceRange || [0, 5000],
    propertyType: searchParams.filters?.propertyType || [],
    stayLength: [] as string[],
    amenities: [] as string[],
    bedrooms: [] as string[],
    rating: 0,
    bookingType: [] as string[]
  });

  // Map-related state - Smart Search defaults to map ON
  const [showMap, setShowMap] = useState(true);
  const [mapMode, setMapMode] = useState<'browse' | 'plan'>('browse');
  const [highlightedListingId, setHighlightedListingId] = useState<string | null>(null);
  const [mapBounds, setMapBounds] = useState<any>(null);
  
  // Plan mode state
  const [pins, setPins] = useState<Pin[]>([]);
  const [planSortBy, setPlanSortBy] = useState<'optimized' | 'closest_to_A' | 'closest_to_B' | 'closest_to_C'>('optimized');
  const [isDropPinMode, setIsDropPinMode] = useState(false);

  const pageSize = 12;

  // Get filtered and sorted listings
  const { items: allListings, loading } = useListings({ page: 1, pageSize: 2000 });
  
  console.log('SmartSearchResultsPage - loading:', loading, 'listings count:', allListings?.length);
  console.log('SmartSearchResultsPage - searchParams:', searchParams);
  console.log('SmartSearchResultsPage - allListings sample:', allListings?.slice(0, 2));

  // Enhanced POI detection and smart parsing
  useEffect(() => {
    const lowerPhrase = searchParams.phrase.toLowerCase();
    
    // Expanded POI database with better matching
    const poiDatabase = {
      // London landmarks
      'big ben': { lat: 51.4994, lng: -0.1245, name: 'Big Ben', city: 'london' },
      'tower bridge': { lat: 51.5055, lng: -0.0754, name: 'Tower Bridge', city: 'london' },
      'london eye': { lat: 51.5033, lng: -0.1196, name: 'London Eye', city: 'london' },
      'westminster': { lat: 51.4994, lng: -0.1245, name: 'Westminster', city: 'london' },
      'hyde park': { lat: 51.5074, lng: -0.1637, name: 'Hyde Park', city: 'london' },
      'covent garden': { lat: 51.5118, lng: -0.1230, name: 'Covent Garden', city: 'london' },
      'camden': { lat: 51.5390, lng: -0.1426, name: 'Camden', city: 'london' },
      'shoreditch': { lat: 51.5250, lng: -0.0754, name: 'Shoreditch', city: 'london' },
      'soho': { lat: 51.5154, lng: -0.1320, name: 'Soho', city: 'london' },
      'notting hill': { lat: 51.5151, lng: -0.1967, name: 'Notting Hill', city: 'london' },
      'greenwich': { lat: 51.4769, lng: -0.0005, name: 'Greenwich', city: 'london' },
      'canary wharf': { lat: 51.5054, lng: -0.0235, name: 'Canary Wharf', city: 'london' },
      'kings cross': { lat: 51.5308, lng: -0.1238, name: 'Kings Cross', city: 'london' },
      'piccadilly': { lat: 51.5098, lng: -0.1340, name: 'Piccadilly Circus', city: 'london' },
      'oxford street': { lat: 51.5154, lng: -0.1440, name: 'Oxford Street', city: 'london' },
      'regent street': { lat: 51.5120, lng: -0.1390, name: 'Regent Street', city: 'london' },
      'brick lane': { lat: 51.5200, lng: -0.0719, name: 'Brick Lane', city: 'london' },
      'borough market': { lat: 51.5055, lng: -0.0907, name: 'Borough Market', city: 'london' },
      'spitalfields': { lat: 51.5194, lng: -0.0750, name: 'Spitalfields', city: 'london' },
      'marylebone': { lat: 51.5186, lng: -0.1586, name: 'Marylebone', city: 'london' },
      'chelsea': { lat: 51.4875, lng: -0.1687, name: 'Chelsea', city: 'london' },
      'kensington': { lat: 51.5007, lng: -0.1920, name: 'Kensington', city: 'london' },
      'hampstead': { lat: 51.5555, lng: -0.1750, name: 'Hampstead', city: 'london' },
      'richmond': { lat: 51.4613, lng: -0.3037, name: 'Richmond', city: 'london' },
      'wimbledon': { lat: 51.4223, lng: -0.2081, name: 'Wimbledon', city: 'london' }
    };
    
    // Find POIs in the search phrase
    const foundPOIs = Object.keys(poiDatabase).filter(poi => lowerPhrase.includes(poi));
    
    if (foundPOIs.length > 0) {
      setMapMode('plan');
      
      const prefilledPins: Pin[] = foundPOIs.slice(0, 3).map((poi, index) => ({
        id: ['A', 'B', 'C'][index] as 'A' | 'B' | 'C',
        name: poiDatabase[poi as keyof typeof poiDatabase].name,
        lat: poiDatabase[poi as keyof typeof poiDatabase].lat,
        lng: poiDatabase[poi as keyof typeof poiDatabase].lng,
        weight: 1
      }));
      
      setPins(prefilledPins);
    }
  }, [searchParams.phrase]);

  // Function to filter listings by map bounds
  const filterListingsByBounds = (listings: any[], bounds: any) => {
    if (!bounds) return listings;
    
    return listings.filter(listing => {
      if (!listing.coordinates) return false;
      
      const lat = listing.coordinates.lat;
      const lng = listing.coordinates.lng;
      
      return lat >= bounds.getSouth() && 
             lat <= bounds.getNorth() && 
             lng >= bounds.getWest() && 
             lng <= bounds.getEast();
    });
  };

  // Function to handle search this area
  const handleSearchThisArea = (bounds: any) => {
    setMapBounds(bounds);
    setCurrentPage(1); // Reset to first page
    console.log('Searching in bounds:', bounds.toString());
  };

  // Plan mode functions
  const handleAddPin = (pin: Pin) => {
    setPins(prev => [...prev, pin]);
  };

  const handleRemovePin = (pinId: string) => {
    setPins(prev => prev.filter(pin => pin.id !== pinId));
  };

  const handleUpdatePin = (pinId: string, updates: Partial<Pin>) => {
    setPins(prev => prev.map(pin => 
      pin.id === pinId ? { ...pin, ...updates } : pin
    ));
  };

  const handleDropPin = () => {
    setIsDropPinMode(true);
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (isDropPinMode && pins.length < 3) {
      const availableSlots = ['A', 'B', 'C'].filter(
        slot => !pins.find(pin => pin.id === slot)
      );
      
      if (availableSlots.length > 0) {
        const newPin: Pin = {
          id: availableSlots[0] as 'A' | 'B' | 'C',
          name: `Pin ${availableSlots[0]}`,
          lat,
          lng,
          weight: 1
        };
        
        handleAddPin(newPin);
        setIsDropPinMode(false);
      }
    }
  };
  
  // Smart duration and pricing parsing
  const parseSmartSearchContext = (phrase: string) => {
    const lowerPhrase = phrase.toLowerCase();
    
    // Parse duration context
    let durationNights = 0;
    let isShortStay = false;
    
    if (lowerPhrase.includes('weekend')) {
      durationNights = 2;
      isShortStay = true;
    } else if (lowerPhrase.includes('week') && !lowerPhrase.includes('weekend')) {
      durationNights = 7;
      isShortStay = true;
    } else if (lowerPhrase.includes('month')) {
      durationNights = 30;
      isShortStay = false;
    } else if (lowerPhrase.includes('night')) {
      const nightMatch = lowerPhrase.match(/(\d+)\s*night/);
      if (nightMatch) {
        durationNights = parseInt(nightMatch[1]);
        isShortStay = durationNights < 30;
      }
    }
    
    // Parse pricing context
    let isNightlyRate = false;
    let maxPrice = 0;
    
    // Look for "per night" or "nightly" indicators
    if (lowerPhrase.includes('per night') || lowerPhrase.includes('nightly') || 
        lowerPhrase.includes('/night') || isShortStay) {
      isNightlyRate = true;
    }
    
    // Extract price from phrase
    const priceMatch = lowerPhrase.match(/less than (\d+)|under (\d+)|below (\d+)|max (\d+)|maximum (\d+)|up to (\d+)/);
    if (priceMatch) {
      maxPrice = parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3] || priceMatch[4] || priceMatch[5] || priceMatch[6]);
    }
    
    return {
      durationNights,
      isShortStay,
      isNightlyRate,
      maxPrice
    };
  };

  const filteredListings = useMemo(() => {
    if (loading || !allListings || allListings.length === 0) {
      console.log('SmartSearchResultsPage - No listings to filter, loading:', loading, 'allListings length:', allListings?.length);
      return [];
    }
    
    let filtered = [...allListings];
    console.log('SmartSearchResultsPage - Starting with', filtered.length, 'listings');

    // Parse smart search context
    const searchContext = parseSmartSearchContext(searchParams.phrase);
    console.log('SmartSearchResultsPage - Parsed context:', searchContext);

    // Smart minimum stay filtering
    if (searchContext.durationNights > 0) {
      filtered = filtered.filter(listing => 
        listing.minimum_stay_nights <= searchContext.durationNights
      );
      console.log('SmartSearchResultsPage - After minimum stay filter:', filtered.length);
    }

    // Smart pricing filtering
    if (searchContext.maxPrice > 0) {
      if (searchContext.isNightlyRate) {
        // For nightly rates, convert to monthly equivalent for comparison
        const monthlyEquivalent = searchContext.maxPrice * 30;
        filtered = filtered.filter(listing => 
          listing.monthly_rent <= monthlyEquivalent
        );
        console.log('SmartSearchResultsPage - After nightly rate filter (converted to monthly):', filtered.length);
      } else {
        // For monthly rates, use directly
        filtered = filtered.filter(listing => 
          listing.monthly_rent <= searchContext.maxPrice
        );
        console.log('SmartSearchResultsPage - After monthly rate filter:', filtered.length);
      }
    }

    // Filter by destination (be very lenient - only filter if we have many results)
    if (searchParams.destination && searchParams.destination.trim() && filtered.length > 100) {
      const destination = searchParams.destination.toLowerCase();
      const destinationFiltered = filtered.filter(listing => 
        listing.city.toLowerCase().includes(destination) ||
        listing.title.toLowerCase().includes(destination) ||
        listing.description.toLowerCase().includes(destination) ||
        listing.summary.toLowerCase().includes(destination)
      );
      
      // Only apply destination filter if it doesn't eliminate too many results
      if (destinationFiltered.length > 10) {
        filtered = destinationFiltered;
        console.log('SmartSearchResultsPage - After destination filter:', filtered.length);
      } else {
        console.log('SmartSearchResultsPage - Skipping destination filter to preserve results');
      }
    }

    // Filter by map bounds if set
    if (mapBounds) {
      filtered = filterListingsByBounds(filtered, mapBounds);
      console.log('SmartSearchResultsPage - After bounds filter:', filtered.length);
    }

    // If no results after filtering, show some listings anyway (fallback)
    if (filtered.length === 0 && allListings.length > 0) {
      console.log('SmartSearchResultsPage - No results after filtering, showing first 20 listings as fallback');
      filtered = allListings.slice(0, 20);
    }

    console.log('SmartSearchResultsPage - Final filtered count:', filtered.length);
    return filtered;
  }, [allListings, searchParams, filters, loading, mapBounds]);

  // Calculate distances for Plan mode
  const distanceResults = useMemo(() => {
    if (mapMode !== 'plan' || pins.length === 0) return [];
    
    return filteredListings.map(listing => {
      const result = calculateListingDistances(listing, pins);
      result.optimizedScore = calculateOptimizedScore(result.distances, pins);
      return result;
    });
  }, [filteredListings, pins, mapMode]);

  // Smart sorting based on search context
  const sortedListings = useMemo(() => {
    const sorted = [...filteredListings];
    const searchContext = parseSmartSearchContext(searchParams.phrase);
    
    // Plan mode sorting (when POIs are detected)
    if (mapMode === 'plan' && pins.length > 0) {
      switch (planSortBy) {
        case 'optimized':
          return sortByOptimizedScore(sorted, distanceResults);
        case 'closest_to_A':
          return sortByDistanceToPin(sorted, 'A', distanceResults);
        case 'closest_to_B':
          return sortByDistanceToPin(sorted, 'B', distanceResults);
        case 'closest_to_C':
          return sortByDistanceToPin(sorted, 'C', distanceResults);
        default:
          return sortByOptimizedScore(sorted, distanceResults);
      }
    }
    
    // Smart sorting based on search context
    if (searchContext.isShortStay) {
      // For short stays, prioritize properties with good availability and short minimum stays
      sorted.sort((a, b) => {
        const aMinStay = a.minimum_stay_nights;
        const bMinStay = b.minimum_stay_nights;
        const aAvailable = a.availability.filter(day => !day.is_blocked).length;
        const bAvailable = b.availability.filter(day => !day.is_blocked).length;
        
        // First, sort by minimum stay (lower is better for short stays)
        if (aMinStay !== bMinStay) {
          return aMinStay - bMinStay;
        }
        
        // Then by availability
        return bAvailable - aAvailable;
      });
    } else if (searchContext.maxPrice > 0) {
      // For budget searches, prioritize by price
      if (searchContext.isNightlyRate) {
        // For nightly rates, show properties that are good value
        sorted.sort((a, b) => {
          const aNightlyRate = a.monthly_rent / 30;
          const bNightlyRate = b.monthly_rent / 30;
          return aNightlyRate - bNightlyRate;
        });
      } else {
        // For monthly rates, sort by monthly rent
        sorted.sort((a, b) => a.monthly_rent - b.monthly_rent);
      }
    } else {
      // Default smart sorting
      sorted.sort((a, b) => {
        const aAvailable = a.availability.filter(day => !day.is_blocked).length;
        const bAvailable = b.availability.filter(day => !day.is_blocked).length;
        const aRating = a.reviews.rating_avg;
        const bRating = b.reviews.rating_avg;
        
        // Combine availability and rating for smart ranking
        const aScore = aAvailable * 0.7 + aRating * 0.3;
        const bScore = bAvailable * 0.7 + bRating * 0.3;
        
        return bScore - aScore;
      });
    }

    return sorted;
  }, [filteredListings, sortBy, mapMode, pins, planSortBy, distanceResults, searchParams.phrase]);

  // Pagination
  const totalPages = Math.ceil(sortedListings.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedListings = sortedListings.slice(startIndex, startIndex + pageSize);

  const formatDateRange = () => {
    if (searchParams.dateMode === 'exact' && searchParams.exactDates.checkIn) {
      const checkIn = new Date(searchParams.exactDates.checkIn);
      const checkOut = new Date(searchParams.exactDates.checkOut);
      const startDay = checkIn.getDate();
      const endDay = checkOut.getDate();
      const month = checkIn.toLocaleDateString('en-GB', { month: 'short' });
      return `${startDay}–${endDay} ${month}`;
    } else if (searchParams.dateMode === 'flexible' && searchParams.flexibleDates.duration) {
      const durationMap: { [key: string]: string } = {
        'weekend': 'Weekend',
        '3-4': '3–4 nights',
        '7': '1 week',
        '14': '2 weeks',
        '30': '1 month'
      };
      return durationMap[searchParams.flexibleDates.duration] || searchParams.flexibleDates.duration;
    }
    return 'Select dates';
  };

  const formatGuests = () => {
    const total = searchParams.guests.adults + searchParams.guests.children + searchParams.guests.infants;
    const pets = searchParams.guests.pets;
    if (total === 0) return 'Add guests';
    if (pets > 0) return `${total} guest${total > 1 ? 's' : ''}, ${pets} pet${pets > 1 ? 's' : ''}`;
    return `${total} guest${total > 1 ? 's' : ''}`;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-petrol/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-petrol mx-auto mb-4"></div>
          <p className="text-gray-600">Loading smart search results...</p>
        </div>
      </div>
    );
  }

  // Show fallback if no listings loaded
  if (!allListings || allListings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-petrol/5 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🏠</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">No listings available</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Unable to load property listings. Please try again later.
          </p>
          <button
            onClick={onBackToLanding}
            className="bg-petrol text-white px-8 py-3 rounded-lg font-semibold hover:bg-petrol/90 transition-colors"
          >
            Back to search
          </button>
        </div>
      </div>
    );
  }

  // Emergency fallback - if we get here but still have issues, show debug info
  console.log('SmartSearchResultsPage - About to render, filteredListings:', filteredListings.length, 'paginatedListings:', paginatedListings.length);


  // Emergency fallback - show simple page if anything goes wrong
  if (!filteredListings || filteredListings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-petrol/5">
        <header className="bg-white/95 backdrop-blur-sm border-b border-petrol/10 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={onBackToLanding}
                className="flex items-center gap-2 text-petrol hover:text-petrol/80 transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to search</span>
              </button>
            </div>
          </div>
        </header>
        
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Smart Search Results</h1>
            <p className="text-gray-600 mb-4">Search phrase: "{searchParams.phrase}"</p>
            <p className="text-gray-600 mb-4">Destination: "{searchParams.destination}"</p>
            <p className="text-gray-600 mb-8">Loading listings... Please wait.</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-petrol mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-petrol/5">
      {/* Premium Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-petrol/10 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-2 text-petrol hover:text-petrol/80 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to search</span>
            </button>
          </div>
        </div>
      </header>

      {/* Smart Search Chips */}
      <div className="bg-gradient-to-r from-white via-petrol/5 to-orange-500/5 border-b border-petrol/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Smart Search Results</h1>
            <p className="text-gray-600 mb-3">"{searchParams.phrase}"</p>
            
            {/* Smart Search Context Display */}
            {(() => {
              const context = parseSmartSearchContext(searchParams.phrase);
              const contextItems = [];
              
              if (context.durationNights > 0) {
                contextItems.push(`${context.durationNights} night${context.durationNights > 1 ? 's' : ''} stay`);
              }
              
              if (context.maxPrice > 0) {
                const priceText = context.isNightlyRate 
                  ? `≤ £${context.maxPrice}/night` 
                  : `≤ £${context.maxPrice}/month`;
                contextItems.push(priceText);
              }
              
              if (pins.length > 0) {
                contextItems.push(`Near ${pins.map(pin => pin.name).join(', ')}`);
              }
              
              if (contextItems.length > 0) {
                return (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-sm text-gray-500">Smart filters:</span>
                    {contextItems.map((item, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-petrol/10 text-petrol text-xs font-medium rounded-full"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                );
              }
              return null;
            })()}
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-petrol/10 hover:bg-petrol/20 border border-petrol/20 rounded-full transition-all duration-200 group shadow-sm">
              <MapPin className="w-4 h-4 text-petrol" />
              <span className="font-medium text-petrol">{searchParams.destination || 'Where to?'}</span>
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-fern/10 hover:bg-fern/20 border border-fern/20 rounded-full transition-all duration-200 group shadow-sm">
              <Calendar className="w-4 h-4 text-fern" />
              <span className="font-medium text-fern">{formatDateRange()}</span>
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-fig/10 hover:bg-fig/20 border border-fig/20 rounded-full transition-all duration-200 group shadow-sm">
              <Users className="w-4 h-4 text-fig" />
              <span className="font-medium text-fig">{formatGuests()}</span>
            </button>
          </div>

          {/* Parsed Chips */}
          {searchParams.chips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {searchParams.chips.map((chip, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/80 border border-gray-200 rounded-full text-sm font-medium text-gray-700 shadow-sm"
                >
                  {chip.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-petrol mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading properties...</h3>
            <p className="text-gray-600">Please wait while we fetch the latest listings.</p>
          </div>
        ) : paginatedListings.length > 0 ? (
          <>
            {/* Results Header with Map Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {sortedListings.length} properties found
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>in {searchParams.destination}</span>
                  {mapBounds && (
                    <span className="px-2 py-1 bg-petrol/10 text-petrol rounded-full text-xs font-medium">
                      Map area
                    </span>
                  )}
                  {(() => {
                    const context = parseSmartSearchContext(searchParams.phrase);
                    if (context.isShortStay) {
                      return (
                        <span className="px-2 py-1 bg-fern/10 text-fern rounded-full text-xs font-medium">
                          Short stay friendly
                        </span>
                      );
                    }
                    return null;
                  })()}
                  {pins.length > 0 && (
                    <span className="px-2 py-1 bg-fig/10 text-fig rounded-full text-xs font-medium">
                      Near {pins.length} landmark{pins.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => setShowMap(!showMap)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                  showMap
                    ? 'bg-petrol text-white border-petrol shadow-sm'
                    : 'bg-white text-petrol border-petrol/20 hover:border-petrol/40 hover:bg-petrol/5'
                }`}
              >
                <Map className="w-4 h-4" />
                <span className="font-medium">{showMap ? 'Hide map' : 'Show map'}</span>
              </button>
            </div>

            {/* Content Layout */}
            <div className={`${showMap ? 'flex gap-6' : ''}`}>
              {/* Results List */}
              <div className={`${showMap ? 'w-1/2' : 'w-full'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {paginatedListings.map((listing) => (
                    <div
                      key={listing.id}
                      className={`group ${highlightedListingId === listing.id ? 'ring-2 ring-petrol ring-opacity-50 rounded-lg' : ''}`}
                      onMouseEnter={() => setHighlightedListingId(listing.id)}
                      onMouseLeave={() => setHighlightedListingId(null)}
                    >
                      <PropertyCard
                        property={listing}
                        onClick={() => onPropertyClick(listingToProperty(listing))}
                        onPreview={() => onPropertyClick(listingToProperty(listing))}
                        onViewDetail={(listing) => onPropertyClick(listingToProperty(listing))}
                        pins={mapMode === 'plan' ? pins : undefined}
                        distanceResults={mapMode === 'plan' ? distanceResults : undefined}
                      />
                    </div>
                  ))}
                </div>

                {/* Premium Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 border rounded-lg transition-colors font-medium ${
                            page === currentPage
                              ? 'bg-petrol text-white border-petrol'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>

              {/* Map Component - Temporarily disabled due to React-Leaflet issues */}
              {showMap && (
                <div className="w-1/2 h-[600px] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🗺️</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Map Coming Soon</h3>
                    <p className="text-gray-500 text-sm">Map functionality is being updated</p>
                    <button
                      onClick={() => setShowMap(false)}
                      className="mt-4 px-4 py-2 bg-petrol text-white rounded-lg text-sm hover:bg-petrol/90 transition-colors"
                    >
                      Hide Map
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🏠</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No properties found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Try adjusting your search criteria or filters to find more properties that match your needs.
            </p>
            <button
              onClick={onBackToLanding}
              className="bg-petrol text-white px-8 py-3 rounded-lg font-semibold hover:bg-petrol/90 transition-colors"
            >
              Back to search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartSearchResultsPage;
