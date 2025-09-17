import React, { useState, useEffect } from 'react';
import { ExternalLink, List, X, Search, ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { Property } from '../utils/types';
import { getAllListings } from '@/lib/listings';
import { listingToProperty } from '@/lib/compare-utils';

interface ExploreNearbyProps {
  currentProperty: Property;
  selectedDates?: { start: Date | null; end: Date | null };
  onPropertyClick: (property: Property) => void;
  onDateSelection?: (range: { start: Date | null; end: Date | null }) => void;
}

interface NearbyProperty extends Property {
  distance: number;
  distanceText: string;
}

const ExploreNearby: React.FC<ExploreNearbyProps> = ({ 
  currentProperty, 
  selectedDates,
  onPropertyClick,
  onDateSelection
}) => {
  const [nearbyProperties, setNearbyProperties] = useState<NearbyProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchDates, setMatchDates] = useState(true);
  const [searchRadius, setSearchRadius] = useState(2); // km
  const [showList, setShowList] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState<'optimized' | 'closest' | 'price'>('optimized');

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Format distance for display
  const formatDistance = (distanceKm: number): string => {
    if (distanceKm < 0.2) {
      return `${Math.round(distanceKm * 1000 / 50) * 50}m from here`;
    }
    return `${distanceKm.toFixed(1)} mi from here`;
  };

  // Check if selected dates are available for current property
  const isSelectedDatesAvailable = (): boolean => {
    if (!selectedDates?.start || !selectedDates?.end) return false;
    
    const start = selectedDates.start;
    const end = selectedDates.end;
    
    // Check if the range is available in the property's availability
    return currentProperty.availability?.some(avail => {
      const availDate = new Date(avail.date);
      return start <= availDate && availDate <= end && avail.available;
    }) || false;
  };

  // Get next available dates for current property with nearest-available scan
  const getNextAvailableDates = (duration: number): { start: Date; end: Date; total: number } | null => {
    if (!currentProperty.availability || !selectedDates?.start || !selectedDates?.end) return null;
    
    const selectedStart = selectedDates.start;
    
    // Scan ±14 days for same duration
    const scanRange = 14;
    const candidates: { start: Date; end: Date; total: number; distance: number }[] = [];
    
    for (let dayOffset = -scanRange; dayOffset <= scanRange; dayOffset++) {
      const testStart = new Date(selectedStart);
      testStart.setDate(testStart.getDate() + dayOffset);
      const testEnd = new Date(testStart);
      testEnd.setDate(testEnd.getDate() + duration - 1);
      
      // Check if this range is available
      const isAvailable = currentProperty.availability.some(avail => {
        const availDate = new Date(avail.date);
        return testStart <= availDate && availDate <= testEnd && avail.available;
      });
      
      if (isAvailable) {
        const total = Math.round((currentProperty.monthlyRate / 30) * duration);
        const distance = Math.abs(dayOffset);
        candidates.push({ start: testStart, end: testEnd, total, distance });
      }
    }
    
    if (candidates.length === 0) return null;
    
    // Sort by distance, then by cheapest total
    candidates.sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      return a.total - b.total;
    });
    
    return candidates[0];
  };

  // Shift dates by specified days (only when valid)
  const shiftDates = (days: number): void => {
    if (!selectedDates?.start || !selectedDates?.end || !onDateSelection) return;
    
    const newStart = new Date(selectedDates.start);
    newStart.setDate(newStart.getDate() + days);
    
    const duration = Math.ceil((selectedDates.end.getTime() - selectedDates.start.getTime()) / (1000 * 60 * 60 * 24));
    const newEnd = new Date(newStart);
    newEnd.setDate(newEnd.getDate() + duration - 1);
    
    // Check if the shifted dates are available
    const isShiftedAvailable = currentProperty.availability?.some(avail => {
      const availDate = new Date(avail.date);
      return newStart <= availDate && availDate <= newEnd && avail.available;
    });
    
    if (isShiftedAvailable) {
      onDateSelection({ start: newStart, end: newEnd });
    }
  };

  // Check if shift is valid
  const isShiftValid = (days: number): boolean => {
    if (!selectedDates?.start || !selectedDates?.end) return false;
    
    const newStart = new Date(selectedDates.start);
    newStart.setDate(newStart.getDate() + days);
    
    const duration = Math.ceil((selectedDates.end.getTime() - selectedDates.start.getTime()) / (1000 * 60 * 60 * 24));
    const newEnd = new Date(newStart);
    newEnd.setDate(newEnd.getDate() + duration - 1);
    
    return currentProperty.availability?.some(avail => {
      const availDate = new Date(avail.date);
      return newStart <= availDate && availDate <= newEnd && avail.available;
    }) || false;
  };

  // Get duration of selected dates
  const getDuration = (): number => {
    if (!selectedDates?.start || !selectedDates?.end) return 0;
    return Math.ceil((selectedDates.end.getTime() - selectedDates.start.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Format date range
  const formatDateRange = (start: Date, end: Date): string => {
    return `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  // Load nearby properties with progressive radius expansion
  useEffect(() => {
    const loadNearbyProperties = async () => {
      try {
        setLoading(true);
        const allListings = await getAllListings();
        
        // Filter out current property and calculate distances
        let nearby = allListings
          .filter(listing => listing.id !== currentProperty.id)
          .map(listing => {
            const property = listingToProperty(listing);
            const distance = calculateDistance(
              currentProperty.coordinates?.lat || 51.5074,
              currentProperty.coordinates?.lng || -0.1278,
              property.coordinates?.lat || 51.5074,
              property.coordinates?.lng || -0.1278
            );
            return {
              ...property,
              distance,
              distanceText: formatDistance(distance)
            };
          })
          .filter(property => property.distance <= searchRadius)
          .sort((a, b) => a.distance - b.distance);

        // If matchDates is enabled and we have selected dates, filter by availability
        if (matchDates && selectedDates?.start && selectedDates?.end) {
          nearby = nearby.filter(property => {
            return property.availability?.some(avail => {
              const availStart = new Date(avail.date);
              const availEnd = new Date(avail.date);
              return selectedDates.start! >= availStart && selectedDates.end! <= availEnd && avail.available;
            });
          });
        }

        // Progressive radius expansion if <3 results
        if (nearby.length < 3 && searchRadius < 10) {
          setSearchRadius(prev => Math.min(prev + 3, 10));
        }

        // Sort properties based on selected sort option
        let sortedNearby = nearby;
        if (sortBy === 'closest') {
          sortedNearby = nearby.sort((a, b) => a.distance - b.distance);
        } else if (sortBy === 'price') {
          sortedNearby = nearby.sort((a, b) => a.monthlyRate - b.monthlyRate);
        } else {
          // Optimized sort: 0.5×distance + 0.3×price percentile + 0.2×(5−rating)/5
          const maxDistance = Math.max(...nearby.map(p => p.distance));
          const maxPrice = Math.max(...nearby.map(p => p.monthlyRate));
          const minPrice = Math.min(...nearby.map(p => p.monthlyRate));
          
          sortedNearby = nearby.sort((a, b) => {
            const scoreA = (0.5 * (a.distance / maxDistance)) + 
                          (0.3 * ((a.monthlyRate - minPrice) / (maxPrice - minPrice))) + 
                          (0.2 * ((5 - a.rating) / 5));
            const scoreB = (0.5 * (b.distance / maxDistance)) + 
                          (0.3 * ((b.monthlyRate - minPrice) / (maxPrice - minPrice))) + 
                          (0.2 * ((5 - b.rating) / 5));
            return scoreA - scoreB;
          });
        }

        setNearbyProperties(sortedNearby.slice(0, 6));
      } catch (error) {
        console.error('Failed to load nearby properties:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNearbyProperties();
  }, [currentProperty.id, searchRadius, matchDates, selectedDates, sortBy]);

  // Generate static map URL (using Mapbox Static API)
  const generateMapUrl = (): string => {
    const centerLat = currentProperty.coordinates?.lat || 51.5074;
    const centerLng = currentProperty.coordinates?.lng || -0.1278;
    const zoom = searchRadius > 5 ? 12 : 13;
    
    // Create markers for current property and nearby properties
    const markers = [
      `pin-s-current+petrol(${centerLng},${centerLat})`, // Current property
      ...nearbyProperties.slice(0, 6).map(prop => 
        `pin-s-price+orange(${prop.coordinates?.lng || centerLng},${prop.coordinates?.lat || centerLat})`
      )
    ].join(',');

    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${markers}/${centerLng},${centerLat},${zoom},0/400x280@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;
  };

  const handleOpenFullMap = () => {
    // Deep-link to search results with map enabled
    const params = new URLSearchParams();
    if (selectedDates?.start && selectedDates?.end) {
      params.set('checkin', selectedDates.start.toISOString().split('T')[0]);
      params.set('checkout', selectedDates.end.toISOString().split('T')[0]);
    }
    params.set('map', 'true');
    params.set('lat', (currentProperty.coordinates?.lat || 51.5074).toString());
    params.set('lng', (currentProperty.coordinates?.lng || -0.1278).toString());
    
    window.open(`/search?${params.toString()}`, '_blank');
  };

  const handleSearchThisArea = () => {
    setHasSearched(true);
    // Trigger a new search with current bounds
    // This would typically fetch new results based on map bounds
    console.log('Search this area triggered');
  };

  return (
    <div className="space-y-6">
      {/* Blocked dates banner (only when dates are selected and unavailable) */}
      {selectedDates?.start && selectedDates?.end && !isSelectedDatesAvailable() && (
        <div className="bg-orange/10 border border-orange/20 rounded-lg p-4">
          <p className="text-ink font-medium mb-3">Those dates aren't available for this home.</p>
          
          <div className="flex flex-wrap gap-2">
            {/* Nearest available with same duration */}
            {(() => {
              const duration = getDuration();
              const nextAvailable = getNextAvailableDates(duration);
              if (nextAvailable) {
                return (
                  <button
                    onClick={() => onDateSelection?.({ start: nextAvailable.start, end: nextAvailable.end })}
                    className="px-3 py-2 bg-white border border-petrol text-petrol rounded-lg text-sm font-medium hover:bg-petrol hover:text-white transition-colors"
                    aria-label={`Nearest available ${duration} nights: ${formatDateRange(nextAvailable.start, nextAvailable.end)}`}
                  >
                    Nearest available {duration} nights
                  </button>
                );
              }
              return null;
            })()}

            {/* Shift date options (only when valid) */}
            <button
              onClick={() => shiftDates(-1)}
              disabled={!isShiftValid(-1)}
              className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                isShiftValid(-1)
                  ? 'bg-white border-petrol text-petrol hover:bg-petrol hover:text-white'
                  : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
              }`}
              aria-label="Shift dates back by 1 day"
            >
              <ArrowLeft className="w-3 h-3" />
              Shift −1 day
            </button>
            
            <button
              onClick={() => shiftDates(1)}
              disabled={!isShiftValid(1)}
              className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                isShiftValid(1)
                  ? 'bg-white border-petrol text-petrol hover:bg-petrol hover:text-white'
                  : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
              }`}
              aria-label="Shift dates forward by 1 day"
            >
              Shift +1 day
              <ArrowRight className="w-3 h-3" />
            </button>

            {/* Mid-let options */}
            {[30, 60, 90].map(nights => {
              const nextAvailable = getNextAvailableDates(nights);
              if (nextAvailable) {
                return (
                  <button
                    key={nights}
                    onClick={() => onDateSelection?.({ start: nextAvailable.start, end: nextAvailable.end })}
                    className="px-3 py-2 bg-white border border-petrol text-petrol rounded-lg text-sm font-medium hover:bg-petrol hover:text-white transition-colors"
                    aria-label={`${nights} nights from ${formatDateRange(nextAvailable.start, nextAvailable.end)}`}
                  >
                    {nights} nights — next available
                  </button>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}

      {/* Main Explore Nearby Module */}
      <div className="bg-card rounded-2xl shadow-custom p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-ink">Explore nearby</h3>
          <div className="flex items-center gap-3">
            {hasSearched && (
              <button
                onClick={handleSearchThisArea}
                className="flex items-center gap-1 text-petrol hover:text-petrol/80 transition-colors text-sm font-medium"
              >
                <Search className="w-4 h-4" />
                Search this area
              </button>
            )}
            <button
              onClick={() => setShowList(!showList)}
              className="flex items-center gap-1 text-petrol hover:text-petrol/80 transition-colors text-sm font-medium"
            >
              {showList ? <X className="w-4 h-4" /> : <List className="w-4 h-4" />}
              {showList ? 'Hide list' : 'Show list'}
            </button>
            <button
              onClick={handleOpenFullMap}
              className="flex items-center gap-1 text-petrol hover:text-petrol/80 transition-colors text-sm font-medium"
            >
              Open full map
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex items-center gap-2 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={matchDates}
              onChange={(e) => setMatchDates(e.target.checked)}
              className="w-4 h-4 text-petrol border-gray-300 rounded focus:ring-petrol"
            />
            <span className="text-sm text-ink">Match my dates</span>
          </label>
        </div>

      {/* Map and List Container */}
      <div className="relative">
        {/* Map */}
        <div className="mb-4">
          {loading ? (
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-muted">Loading map...</div>
            </div>
          ) : (
            <div className="relative">
              <img
                src={generateMapUrl()}
                alt="Nearby properties map"
                className="w-full h-64 object-cover rounded-lg"
              />
              {nearbyProperties.length === 0 && (
                <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-sm text-muted mb-2">No properties found</p>
                    <button
                      onClick={() => setSearchRadius(prev => Math.min(prev + 3, 10))}
                      className="text-petrol text-sm font-medium hover:underline"
                    >
                      Widen search area
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search radius note */}
        {searchRadius > 2 && (
          <div className="text-xs text-muted mb-4 text-center">
            Widened to {searchRadius} km
          </div>
        )}

        {/* Right-hand drawer for list */}
        {showList && (
          <div className="absolute top-0 right-0 w-80 h-80 bg-white border border-border rounded-lg shadow-lg overflow-hidden z-10">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-ink text-sm">
                  {matchDates ? 'Nearby on your dates' : 'Nearby'}
                </h4>
                <button
                  onClick={() => setShowList(false)}
                  className="text-muted hover:text-ink transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Sort options */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('optimized')}
                  className={`px-2 py-1 text-xs rounded ${
                    sortBy === 'optimized' 
                      ? 'bg-petrol text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Optimised
                </button>
                <button
                  onClick={() => setSortBy('closest')}
                  className={`px-2 py-1 text-xs rounded ${
                    sortBy === 'closest' 
                      ? 'bg-petrol text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Closest
                </button>
                <button
                  onClick={() => setSortBy('price')}
                  className={`px-2 py-1 text-xs rounded ${
                    sortBy === 'price' 
                      ? 'bg-petrol text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Lowest price
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto h-56">
              {nearbyProperties.length > 0 ? (
                nearbyProperties.map((property) => {
                  // Check if property is available for selected dates
                  const isAvailableForDates = !matchDates || !selectedDates?.start || !selectedDates?.end || 
                    property.availability?.some(avail => {
                      const availDate = new Date(avail.date);
                      return selectedDates.start! <= availDate && availDate <= selectedDates.end! && avail.available;
                    });
                  
                  return (
                    <div
                      key={property.id}
                      onClick={() => onPropertyClick(property)}
                      className="flex gap-3 p-3 border-b border-border hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-ink text-sm truncate">{property.title}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-petrol font-semibold text-sm">
                            £{Math.round(property.monthlyRate / 30)}/night
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-muted">{property.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted">{property.distanceText}</span>
                          {!isAvailableForDates && (
                            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                              Not available on your dates
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-muted">
                  <p className="text-sm mb-2">No matches in {searchRadius} km</p>
                  {searchRadius < 10 && (
                    <button
                      onClick={() => setSearchRadius(prev => Math.min(prev + 3, 10))}
                      className="text-petrol text-sm font-medium hover:underline"
                    >
                      Widen search area
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default ExploreNearby;
