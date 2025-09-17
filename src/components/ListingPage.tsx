import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, MapPin, Wifi, Car, Users, Heart, Share2, Plus, Check, Bed, Bath } from 'lucide-react';
import AvailabilitySlider from './AvailabilitySlider';
import LegacyPropertyCard from './LegacyPropertyCard';
import { Property as LegacyProperty } from '../utils/types';
import CompareBar from './CompareBar';
import { Property } from '../utils/types';
import { getAllListings } from '@/lib/listings';
import { listingToProperty } from '@/lib/compare-utils';
import { useCompareStore } from '../store/compareStore';
import ExploreNearby from './ExploreNearby';
import MiniMap from './MiniMap';
import { MapSessionState } from '@/utils/sessionState';
import { MapURLState } from '@/utils/urlState';
import { Pin, DistanceResult } from '@/types/map';
import { calculateListingDistances } from '@/utils/distance';

interface ListingPageProps {
  property: Property;
  onBackToLanding: () => void;
  onPropertyClick: (property: Property) => void;
  onNavigateToCompare: () => void;
}

const ListingPage: React.FC<ListingPageProps> = ({ 
  property, 
  onBackToLanding, 
  onPropertyClick,
  onNavigateToCompare
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const { addToCompare, removeFromCompare, isInCompare } = useCompareStore();
  
  // Map state for MiniMap
  const [pins, setPins] = useState<Pin[]>([]);
  const [distanceResults, setDistanceResults] = useState<DistanceResult[]>([]);
  
  const inCompare = isInCompare(property.id);

  // Load pins from session/URL state
  useEffect(() => {
    const urlState = MapURLState.getCurrentMapState();
    const sessionPins = MapSessionState.loadPins();
    const activePins = urlState.pins || sessionPins;
    setPins(activePins);

    // Calculate distances if pins exist
    if (activePins.length > 0 && property.coordinates) {
      const result = calculateListingDistances(property, activePins);
      setDistanceResults([result]);
    }
  }, [property]);

  // Handle "Open on map" click
  const handleOpenFullMap = () => {
    const searchParams = MapURLState.getCurrentSearchParams();
    const mapState = {
      mode: 'browse' as const,
      pins: pins,
      bounds: pins.length > 0 ? undefined : { 
        north: property.coordinates?.lat + 0.01 || 51.5174,
        south: property.coordinates?.lat - 0.01 || 51.4974,
        east: property.coordinates?.lng + 0.01 || -0.1178,
        west: property.coordinates?.lng - 0.01 || -0.1378
      }
    };
    
    const deepLink = MapURLState.generateSearchDeepLink(mapState, searchParams);
    window.location.href = deepLink;
  };

  const amenityIcons = {
    'WiFi': Wifi,
    'Kitchen': Users,
    'Parking': Car,
    'Garden': MapPin,
    'Fireplace': Heart,
    'Gym': Users,
    'Pool': Users,
    'Balcony': MapPin,
    'Concierge': Users,
    'Rooftop': MapPin,
    'Beach Access': MapPin,
    'Terrace': MapPin,
    'Washer': Users
  };

  const [relatedListings, setRelatedListings] = useState<LegacyProperty[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  useEffect(() => {
    const loadRelatedListings = async () => {
      try {
        console.log('🔄 ListingPage: Loading related listings...');
        const allListings = await getAllListings();
        console.log('✅ ListingPage: Loaded', allListings.length, 'listings');
        const related = allListings
          .filter(l => l.id !== property.id)
          .slice(0, 3)
          .map(listingToProperty);
        console.log('✅ ListingPage: Converted', related.length, 'related listings');
        setRelatedListings(related);
        setRelatedLoading(false);
      } catch (error) {
        console.error('❌ ListingPage: Failed to load related listings:', error);
        setRelatedLoading(false);
      }
    };
    loadRelatedListings();
  }, [property.id]);

  const handleDateSelection = (range: { start: Date | null; end: Date | null }) => {
    setSelectedRange(range);
  };

  const handleCompareToggle = () => {
    if (inCompare) {
      removeFromCompare(property.id);
    } else {
      addToCompare(property);
    }
  };

  const calculateTotal = () => {
    if (selectedRange.start && selectedRange.end) {
      const days = Math.ceil((selectedRange.end.getTime() - selectedRange.start.getTime()) / (1000 * 60 * 60 * 24));
      const months = days / 30;
      return Math.round(property.monthlyRate * months);
    }
    return 0;
  };

  const isSelectedDatesAvailable = () => {
    if (!selectedRange.start || !selectedRange.end) return false;
    
    const start = selectedRange.start;
    const end = selectedRange.end;
    
    // Check if all dates in the range are available
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateString = currentDate.toISOString().split('T')[0];
      const availability = property.availability?.find(avail => avail.date === dateString);
      
      if (!availability || !availability.available) {
        return false;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return true;
  };

  return (
    <div className="min-h-screen bg-brand-oat">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-2 text-ink hover:text-petrol transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to search
          </button>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-ink hover:text-petrol transition-colors">
              <Share2 className="w-5 h-5" />
              Share
            </button>
            <button className="flex items-center gap-2 text-ink hover:text-petrol transition-colors">
              <Heart className="w-5 h-5" />
              Save
            </button>
          </div>
        </div>
      </header>

      {/* Image Gallery */}
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-96 lg:h-[500px]">
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={property.images[currentImageIndex]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              {property.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {property.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {property.images.slice(1, 5).map((image, index) => (
                <div key={index} className="rounded-xl overflow-hidden">
                  <img
                    src={image}
                    alt={`${property.title} - ${index + 2}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => setCurrentImageIndex(index + 1)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and Basic Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-ink mb-2">{property.title}</h1>
                  <div className="flex items-center gap-4 text-muted mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-5 h-5" />
                      <span>{property.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-petrol fill-current" />
                      <span className="font-semibold">{property.rating}</span>
                      <span>({property.reviews} reviews)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-fig/10 text-fig px-3 py-1 rounded-full text-sm font-medium">
                      {property.travelerType}
                    </span>
                    <span className="bg-ember/10 text-ember px-3 py-1 rounded-full text-sm font-medium">
                      {property.minStay}-{property.maxStay} day stays
                    </span>
                    <div className="flex items-center gap-2 text-muted">
                      <Bed className="w-4 h-4" />
                      <span>{property.bedrooms}</span>
                      <Bath className="w-4 h-4" />
                      <span>{property.bathrooms}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCompareToggle}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                    inCompare 
                      ? 'bg-petrol text-white hover:bg-petrol/90' 
                      : 'bg-petrol text-white hover:bg-petrol/90'
                  }`}
                >
                  {inCompare ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {inCompare ? 'In Compare' : 'Compare'}
                </button>
              </div>
              <p className="text-muted leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-2xl font-bold text-ink mb-6">What this place offers</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities.slice(0, showAllAmenities ? undefined : 6).map((amenity) => {
                  const IconComponent = amenityIcons[amenity as keyof typeof amenityIcons] || MapPin;
                  return (
                    <div key={amenity} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                      <IconComponent className="w-5 h-5 text-petrol" />
                      <span className="text-ink">{amenity}</span>
                    </div>
                  );
                })}
              </div>
              {property.amenities.length > 6 && (
                <button
                  onClick={() => setShowAllAmenities(!showAllAmenities)}
                  className="mt-4 text-petrol font-semibold hover:underline"
                >
                  {showAllAmenities ? 'Show less' : `Show all ${property.amenities.length} amenities`}
                </button>
              )}
            </div>

            {/* Availability Slider */}
            <div>
              <h2 className="text-2xl font-bold text-ink mb-6">Availability Calendar</h2>
              <AvailabilitySlider
                property={property}
                onDateSelection={handleDateSelection}
              />
            </div>

            {/* MiniMap */}
            <div>
              <MiniMap
                listing={{
                  id: property.id,
                  title: property.title,
                  coordinates: property.coordinates,
                  city: property.location.split(',')[0] || 'London',
                  country: property.location.split(',')[1]?.trim() || 'UK'
                }}
                pins={pins}
                distanceResults={distanceResults}
                onOpenFullMap={handleOpenFullMap}
              />
            </div>

            {/* Explore Nearby (always visible) */}
            <div>
              <h2 className="text-2xl font-bold text-ink mb-6">Explore nearby</h2>
              <ExploreNearby
                currentProperty={property}
                selectedDates={selectedRange}
                onPropertyClick={onPropertyClick}
                onDateSelection={handleDateSelection}
              />
            </div>

            {/* Local Tips */}
            {property.localTips.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-ink mb-6">Local Tips & Things to Do</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.localTips.map((tip) => (
                    <div key={tip.id} className="bg-card rounded-xl p-4 shadow-md">
                      <img
                        src={tip.image}
                        alt={tip.title}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                      <h3 className="font-semibold text-ink mb-2">{tip.title}</h3>
                      <p className="text-sm text-muted">{tip.description}</p>
                      <span className="inline-block mt-2 bg-petrol/10 text-petrol px-2 py-1 rounded text-xs">
                        {tip.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="bg-card rounded-2xl shadow-custom p-6 mb-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-ink">
                  £{property.monthlyRate.toLocaleString()}
                  <span className="text-lg font-normal text-muted">/month</span>
                </div>
                <p className="text-sm text-fern font-medium mt-1">No booking fees • Direct booking</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-3 border border-border rounded-lg">
                  <label className="block text-sm font-medium text-ink mb-1">Check-in</label>
                  <input
                    type="date"
                    className="w-full border-0 outline-none text-ink"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <label className="block text-sm font-medium text-ink mb-1">Duration</label>
                  <select className="w-full border-0 outline-none text-ink">
                    <option>1 month (30 days)</option>
                    <option>2 months (60 days)</option>
                    <option>3 months (90 days)</option>
                    <option>6 months (180 days)</option>
                  </select>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <label className="block text-sm font-medium text-ink mb-1">Guests</label>
                  <select className="w-full border-0 outline-none text-ink">
                    <option>1 guest</option>
                    <option>2 guests</option>
                    <option>3 guests</option>
                    <option>4 guests</option>
                  </select>
                </div>
              </div>

              <button 
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors mb-4 ${
                  isSelectedDatesAvailable() 
                    ? 'bg-petrol text-white hover:bg-petrol/90' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!isSelectedDatesAvailable()}
                title={!isSelectedDatesAvailable() ? 'Unavailable on selected dates' : ''}
              >
                Reserve Now
              </button>

              <div className="text-center text-sm text-muted">
                <p>You won't be charged yet</p>
              </div>

              {selectedRange.start && selectedRange.end && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-ink">Total for stay</span>
                    <span className="text-xl font-bold text-ink">£{calculateTotal().toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-muted mt-1">
                    Taxes/fees (placeholder)
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Related Properties */}
      <section className="py-16 mt-16 bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-ink mb-8">Other places you might like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedLoading ? (
              <div className="col-span-full text-center py-8 text-muted">Loading related properties...</div>
            ) : (
              relatedListings.map((listing) => (
                <LegacyPropertyCard
                  key={listing.id}
                  property={listing}
                  onClick={() => onPropertyClick(listing)}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Compare Bar */}
      <CompareBar onNavigateToCompare={onNavigateToCompare} />
    </div>
  );
};

export default ListingPage;