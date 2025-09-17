import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, MapPin, Edit3, ChevronDown, X, Star, Users, Calendar, Home, Wifi, Car, PawPrint, Coffee, Waves, Map } from 'lucide-react';
import { useListings } from '@/lib/listings';
import { listingToProperty } from '@/lib/compare-utils';
import PropertyCard from './PropertyCard';
import MapShell from './MapShell';
import MobileMapView from './MobileMapView';
import { Pin } from '@/types/map';
import { calculateListingDistances, calculateOptimizedScore, sortByDistanceToPin, sortByOptimizedScore, formatDistance } from '@/utils/distance';
import { MapURLState } from '@/utils/urlState';
import { MapSessionState } from '@/utils/sessionState';

interface SearchParams {
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

interface SearchResultsPageProps {
  searchParams: SearchParams;
  onBackToLanding: () => void;
  onPropertyClick: (property: any) => void;
}

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
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

  // Map-related state with URL/session persistence
  const [showMap, setShowMap] = useState(() => {
    // Check URL first, then session storage
    const urlState = MapURLState.getCurrentMapState();
    return urlState.mode ? MapSessionState.loadMapToggle() : false;
  });
  const [mapMode, setMapMode] = useState<'browse' | 'plan'>(() => {
    const urlState = MapURLState.getCurrentMapState();
    return urlState.mode || MapSessionState.loadMapMode();
  });
  const [highlightedListingId, setHighlightedListingId] = useState<string | null>(null);
  const [mapBounds, setMapBounds] = useState<any>(null);
  
  // Plan mode state with URL/session persistence
  const [pins, setPins] = useState<Pin[]>(() => {
    const urlState = MapURLState.getCurrentMapState();
    return urlState.pins || MapSessionState.loadPins();
  });
  const [planSortBy, setPlanSortBy] = useState<'optimized' | 'closest_to_A' | 'closest_to_B' | 'closest_to_C'>('optimized');
  const [isDropPinMode, setIsDropPinMode] = useState(false);
  
  // Mobile state
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);

  // Initialize from URL state and detect mobile
  useEffect(() => {
    const urlState = MapURLState.getCurrentMapState();
    if (urlState.mode) {
      setMapMode(urlState.mode);
    }
    if (urlState.pins) {
      setPins(urlState.pins);
    }
    if (urlState.bounds) {
      setMapBounds(urlState.bounds);
    }

    // Detect mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Persist state changes
  useEffect(() => {
    MapSessionState.saveMapToggle(showMap);
  }, [showMap]);

  useEffect(() => {
    MapSessionState.saveMapMode(mapMode);
    MapURLState.updateURL({ mode: mapMode }, searchParams, true);
  }, [mapMode]);

  useEffect(() => {
    MapSessionState.savePins(pins);
    MapURLState.updateURL({ pins }, searchParams, true);
  }, [pins]);

  const pageSize = 12;

  // Get filtered and sorted listings
  const { items: allListings, loading } = useListings({ page: 1, pageSize: 2000 });

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
    // TODO: Implement map click handler for dropping pins
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
  
  const filteredListings = useMemo(() => {
    if (loading) return [];
    
    let filtered = allListings;

    // Filter by destination
    if (searchParams.destination) {
      filtered = filtered.filter(listing => 
        listing.city.toLowerCase().includes(searchParams.destination.toLowerCase()) ||
        listing.title.toLowerCase().includes(searchParams.destination.toLowerCase())
      );
    }

    // Filter by map bounds if set
    if (mapBounds) {
      filtered = filterListingsByBounds(filtered, mapBounds);
    }

    // Calculate number of nights from search parameters
    let searchNights = 0;
    if (searchParams.exactDates.checkIn && searchParams.exactDates.checkOut) {
      const checkIn = new Date(searchParams.exactDates.checkIn);
      const checkOut = new Date(searchParams.exactDates.checkOut);
      searchNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    } else if (searchParams.flexibleDates.duration) {
      const durationMap: { [key: string]: number } = {
        'weekend': 2,
        '3-4': 3,
        '7': 7,
        '14': 14,
        '30': 30
      };
      searchNights = durationMap[searchParams.flexibleDates.duration] || 0;
    }

    // Filter by minimum stay nights
    if (searchNights > 0) {
      filtered = filtered.filter(listing => listing.minimum_stay_nights <= searchNights);
    }

    // Filter by guest count
    if (searchParams.guests && searchParams.guests.adults) {
      const totalGuests = searchParams.guests.adults + (searchParams.guests.children || 0) + (searchParams.guests.infants || 0);
      filtered = filtered.filter(listing => listing.max_guests >= totalGuests);
    }

    // Apply additional filters
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000) {
      filtered = filtered.filter(listing => 
        listing.monthly_rent >= filters.priceRange[0] && 
        listing.monthly_rent <= filters.priceRange[1]
      );
    }

    if (filters.propertyType.length > 0) {
      // For now, just show all properties when property type filter is applied
      // This can be enhanced when property_type field is available in the schema
    }

    if (filters.bedrooms.length > 0) {
      filtered = filtered.filter(listing => 
        filters.bedrooms.includes(listing.bedrooms.toString())
      );
    }

    if (filters.rating > 0) {
      filtered = filtered.filter(listing => 
        listing.reviews.rating_avg >= filters.rating
      );
    }

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

  // Sort listings
  const sortedListings = useMemo(() => {
    const sorted = [...filteredListings];
    
    // Plan mode sorting
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
    
    // Browse mode sorting
    switch (sortBy) {
      case 'price_low':
        sorted.sort((a, b) => a.monthly_rent - b.monthly_rent);
        break;
      case 'price_high':
        sorted.sort((a, b) => b.monthly_rent - a.monthly_rent);
        break;
      case 'rating':
        sorted.sort((a, b) => b.reviews.rating_avg - a.reviews.rating_avg);
        break;
      case 'newest':
        // Sort by ID as a proxy for newest (higher ID = newer)
        sorted.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'closest':
        // For now, just sort by availability (closest to center would need coordinates)
        sorted.sort((a, b) => {
          const aAvailable = a.availability.filter(day => !day.is_blocked).length;
          const bAvailable = b.availability.filter(day => !day.is_blocked).length;
          return bAvailable - aAvailable;
        });
        break;
      case 'recommended':
      default:
        // Sort by availability (most available first)
        sorted.sort((a, b) => {
          const aAvailable = a.availability.filter(day => !day.is_blocked).length;
          const bAvailable = b.availability.filter(day => !day.is_blocked).length;
          return bAvailable - aAvailable;
        });
        break;
    }

    return sorted;
  }, [filteredListings, sortBy, mapMode, pins, planSortBy, distanceResults]);

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

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000) count++;
    if (filters.propertyType.length > 0) count++;
    if (filters.stayLength.length > 0) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.bedrooms.length > 0) count++;
    if (filters.rating > 0) count++;
    if (filters.bookingType.length > 0) count++;
    return count;
  };

  const clearAllFilters = () => {
    setFilters({
      priceRange: [0, 5000],
      propertyType: [],
      stayLength: [],
      amenities: [],
      bedrooms: [],
      rating: 0,
      bookingType: []
    });
    setCurrentPage(1);
  };

  const FilterDrawer = ({ type, title, children }: { type: string; title: string; children: React.ReactNode }) => (
    <div className={`fixed inset-0 z-50 ${activeFilter === type ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black/20" onClick={() => setActiveFilter(null)} />
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-ink">{title}</h3>
            <button
              onClick={() => setActiveFilter(null)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );

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

      {/* Search Parameters Chips */}
      <div className="bg-gradient-to-r from-white via-petrol/5 to-orange-500/5 border-b border-petrol/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-petrol/10 hover:bg-petrol/20 border border-petrol/20 rounded-full transition-all duration-200 group shadow-sm">
              <MapPin className="w-4 h-4 text-petrol" />
              <span className="font-medium text-petrol">{searchParams.destination || 'Where to?'}</span>
              <Edit3 className="w-3 h-3 text-petrol/70 group-hover:text-petrol" />
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-full transition-all duration-200 group shadow-sm">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-orange-700">{formatDateRange()}</span>
              <Edit3 className="w-3 h-3 text-orange-500/70 group-hover:text-orange-600" />
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-fern/10 hover:bg-fern/20 border border-fern/20 rounded-full transition-all duration-200 group shadow-sm">
              <Users className="w-4 h-4 text-fern" />
              <span className="font-medium text-fern">{formatGuests()}</span>
              <Edit3 className="w-3 h-3 text-fern/70 group-hover:text-fern" />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-petrol/80 font-medium">
              {sortedListings.length} properties available
            </p>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-petrol/70 font-medium">Sort by:</span>
              {mapMode === 'plan' && pins.length > 0 ? (
                <select
                  value={planSortBy}
                  onChange={(e) => setPlanSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-petrol/20 rounded-lg focus:ring-2 focus:ring-petrol/20 focus:border-petrol text-sm font-medium bg-white/80 backdrop-blur-sm shadow-sm"
                >
                  <option value="optimized">Optimised</option>
                  {pins.find(pin => pin.id === 'A') && <option value="closest_to_A">Closest to A</option>}
                  {pins.find(pin => pin.id === 'B') && <option value="closest_to_B">Closest to B</option>}
                  {pins.find(pin => pin.id === 'C') && <option value="closest_to_C">Closest to C</option>}
                </select>
              ) : (
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-petrol/20 rounded-lg focus:ring-2 focus:ring-petrol/20 focus:border-petrol text-sm font-medium bg-white/80 backdrop-blur-sm shadow-sm"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_low">Price: Low → High</option>
                  <option value="price_high">Price: High → Low</option>
                  <option value="closest">Closest to center</option>
                  <option value="rating">Highest rated</option>
                  <option value="newest">Newest listings</option>
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-petrol/10 sticky top-[140px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 overflow-x-auto">
            <button
              onClick={() => setActiveFilter('price')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 whitespace-nowrap shadow-sm ${
                filters.priceRange[0] > 0 || filters.priceRange[1] < 5000
                  ? 'bg-gradient-to-r from-petrol to-petrol/90 text-white border-petrol shadow-petrol/20'
                  : 'bg-white/80 text-petrol border-petrol/20 hover:border-petrol/40 hover:bg-petrol/5'
              }`}
            >
              <span className="font-medium">Price</span>
              {(filters.priceRange[0] > 0 || filters.priceRange[1] < 5000) && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">£{filters.priceRange[0]}–£{filters.priceRange[1]}</span>
              )}
              <ChevronDown className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveFilter('property')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 whitespace-nowrap shadow-sm ${
                filters.propertyType.length > 0
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-500 shadow-orange-500/20'
                  : 'bg-white/80 text-orange-600 border-orange-500/20 hover:border-orange-500/40 hover:bg-orange-500/5'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">Property type</span>
              {filters.propertyType.length > 0 && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{filters.propertyType.length}</span>
              )}
              <ChevronDown className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveFilter('stay')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 whitespace-nowrap shadow-sm ${
                filters.stayLength.length > 0
                  ? 'bg-gradient-to-r from-fern to-fern/90 text-white border-fern shadow-fern/20'
                  : 'bg-white/80 text-fern border-fern/20 hover:border-fern/40 hover:bg-fern/5'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Stay length</span>
              {filters.stayLength.length > 0 && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{filters.stayLength.length}</span>
              )}
              <ChevronDown className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveFilter('amenities')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 whitespace-nowrap shadow-sm ${
                filters.amenities.length > 0
                  ? 'bg-gradient-to-r from-fig to-fig/90 text-white border-fig shadow-fig/20'
                  : 'bg-white/80 text-fig border-fig/20 hover:border-fig/40 hover:bg-fig/5'
              }`}
            >
              <Wifi className="w-4 h-4" />
              <span className="font-medium">Amenities</span>
              {filters.amenities.length > 0 && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{filters.amenities.length}</span>
              )}
              <ChevronDown className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveFilter('more')}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-ink/20 hover:border-ink/40 transition-all duration-200 whitespace-nowrap bg-white/80 text-ink shadow-sm hover:bg-ink/5"
            >
              <span className="font-medium">More</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {getActiveFiltersCount() > 0 && (
              <button
                onClick={clearAllFilters}
                className="ml-auto px-4 py-2 text-sm text-petrol hover:text-petrol/80 font-medium transition-colors bg-petrol/5 hover:bg-petrol/10 rounded-lg"
              >
                Clear all ({getActiveFiltersCount()})
              </button>
            )}
          </div>
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
                </div>
              </div>
              
              <button
                onClick={() => {
                  if (isMobile) {
                    setShowMobileMap(true);
                  } else {
                    setShowMap(!showMap);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                  showMap || showMobileMap
                    ? 'bg-petrol text-white border-petrol shadow-sm'
                    : 'bg-white text-petrol border-petrol/20 hover:border-petrol/40 hover:bg-petrol/5'
                }`}
              >
                <Map className="w-4 h-4" />
                <span className="font-medium">
                  {isMobile ? 'Show map' : (showMap ? 'Hide map' : 'Show map')}
                </span>
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
              onClick={clearAllFilters}
              className="bg-petrol text-white px-8 py-3 rounded-lg font-semibold hover:bg-petrol/90 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Filter Drawers */}
      <FilterDrawer type="price" title="Price range">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Min price</label>
              <input
                type="number"
                value={filters.priceRange[0]}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  priceRange: [Number(e.target.value), prev.priceRange[1]]
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrol/20 focus:border-petrol"
                placeholder="0"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Max price</label>
              <input
                type="number"
                value={filters.priceRange[1]}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  priceRange: [prev.priceRange[0], Number(e.target.value)]
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrol/20 focus:border-petrol"
                placeholder="5000"
              />
            </div>
          </div>
        </div>
      </FilterDrawer>

      <FilterDrawer type="property" title="Property type">
        <div className="space-y-3">
          {['Apartment', 'House', 'Studio', 'Loft', 'Townhouse'].map((type) => (
            <label key={type} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.propertyType.includes(type.toLowerCase())}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFilters(prev => ({
                      ...prev,
                      propertyType: [...prev.propertyType, type.toLowerCase()]
                    }));
                  } else {
                    setFilters(prev => ({
                      ...prev,
                      propertyType: prev.propertyType.filter(t => t !== type.toLowerCase())
                    }));
                  }
                }}
                className="w-4 h-4 text-petrol border-gray-300 rounded focus:ring-petrol/20"
              />
              <span className="text-gray-900">{type}</span>
            </label>
          ))}
        </div>
      </FilterDrawer>

      <FilterDrawer type="stay" title="Stay length">
        <div className="space-y-3">
          {[
            { value: 'short', label: 'Short stay (2+ nights)' },
            { value: '30', label: '30+ nights' },
            { value: '60', label: '60+ nights' },
            { value: '90', label: '90+ nights' }
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.stayLength.includes(option.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFilters(prev => ({
                      ...prev,
                      stayLength: [...prev.stayLength, option.value]
                    }));
                  } else {
                    setFilters(prev => ({
                      ...prev,
                      stayLength: prev.stayLength.filter(s => s !== option.value)
                    }));
                  }
                }}
                className="w-4 h-4 text-petrol border-gray-300 rounded focus:ring-petrol/20"
              />
              <span className="text-gray-900">{option.label}</span>
            </label>
          ))}
        </div>
      </FilterDrawer>

      <FilterDrawer type="amenities" title="Amenities">
        <div className="space-y-3">
          {[
            { value: 'wifi', label: 'Wi-Fi', icon: Wifi },
            { value: 'workspace', label: 'Workspace', icon: Coffee },
            { value: 'parking', label: 'Parking', icon: Car },
            { value: 'pet_friendly', label: 'Pet-friendly', icon: PawPrint },
            { value: 'pool', label: 'Pool', icon: Waves }
          ].map((amenity) => (
            <label key={amenity.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.amenities.includes(amenity.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFilters(prev => ({
                      ...prev,
                      amenities: [...prev.amenities, amenity.value]
                    }));
                  } else {
                    setFilters(prev => ({
                      ...prev,
                      amenities: prev.amenities.filter(a => a !== amenity.value)
                    }));
                  }
                }}
                className="w-4 h-4 text-petrol border-gray-300 rounded focus:ring-petrol/20"
              />
              <amenity.icon className="w-4 h-4 text-gray-600" />
              <span className="text-gray-900">{amenity.label}</span>
            </label>
          ))}
        </div>
      </FilterDrawer>

      <FilterDrawer type="more" title="More filters">
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Bedrooms</h4>
            <div className="space-y-2">
              {['1', '2', '3', '4+'].map((bedrooms) => (
                <label key={bedrooms} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.bedrooms.includes(bedrooms)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters(prev => ({
                          ...prev,
                          bedrooms: [...prev.bedrooms, bedrooms]
                        }));
                      } else {
                        setFilters(prev => ({
                          ...prev,
                          bedrooms: prev.bedrooms.filter(b => b !== bedrooms)
                        }));
                      }
                    }}
                    className="w-4 h-4 text-petrol border-gray-300 rounded focus:ring-petrol/20"
                  />
                  <span className="text-gray-900">{bedrooms} bedroom{bedrooms !== '1' ? 's' : ''}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Minimum rating</h4>
            <div className="space-y-2">
              {[4.0, 4.5, 5.0].map((rating) => (
                <label key={rating} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.rating === rating}
                    onChange={() => setFilters(prev => ({ ...prev, rating }))}
                    className="w-4 h-4 text-petrol border-gray-300 focus:ring-petrol/20"
                  />
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-gray-900">{rating}+</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </FilterDrawer>

      {/* Mobile Map View */}
      {isMobile && showMobileMap && (
        <MobileMapView
          listings={paginatedListings.map(listing => ({
            id: listing.id,
            title: listing.title,
            pricePerNight: listing.monthly_rent,
            coordinates: listing.coordinates
          }))}
          mode={mapMode}
          onModeChange={setMapMode}
          onSearchThisArea={handleSearchThisArea}
          onShowList={() => setShowMobileMap(false)}
          onClose={() => setShowMobileMap(false)}
          highlightedListingId={highlightedListingId}
          onListingHover={setHighlightedListingId}
          pins={pins}
          onAddPin={handleAddPin}
          onRemovePin={handleRemovePin}
          onUpdatePin={handleUpdatePin}
          onDropPin={handleDropPin}
          onMapClick={handleMapClick}
          isDropPinMode={isDropPinMode}
          distanceResults={distanceResults}
        />
      )}
    </div>
  );
};

export default SearchResultsPage;