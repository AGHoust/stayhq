import React, { useState } from 'react';
import { Star, Plus, MapPin, Calendar, Check, Bed, Eye } from 'lucide-react';
import type { Listing } from '@/lib/schemas/listing';
import { getBadges } from '@/lib/badges';
import { useCompareStore } from '../store/compareStore';
import ListingQuickPreview from './ListingQuickPreview';
// import DistanceChips from './DistanceChips'; // COMMENTED OUT: Plan mode feature
// import { Pin, DistanceResult } from '@/types/map'; // COMMENTED OUT: Plan mode types

interface PropertyCardProps {
  property: Listing;
  onClick: () => void;
  showShortStayMode?: boolean;
  onPreview?: (listing: Listing) => void;
  onViewDetail?: (listing: Listing) => void;
  // COMMENTED OUT: Plan mode props - keeping for future use
  // pins?: Pin[];
  // distanceResults?: DistanceResult[];
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  onClick,
  showShortStayMode = false,
  onViewDetail,
  // COMMENTED OUT: Plan mode props - keeping for future use
  // pins = [],
  // distanceResults = []
}) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [showQuickPreview, setShowQuickPreview] = useState(false);
  const { addToCompare, removeFromCompare, isInCompare } = useCompareStore();
  
  const inCompare = isInCompare(property.id);
  // Get badges and separate them into hero vs body categories
  const allBadges = getBadges(property);
  
  // Hero image pills (max 2, gradient, time-sensitive/special)
  const heroPills = [];
  if (allBadges.includes('Last-minute')) heroPills.push('Last-minute');
  if (allBadges.includes('Short Stay Available')) heroPills.push('Short Stay Available');
  if (allBadges.includes('Limited dates')) heroPills.push('Limited dates');
  
  // Body pills (flat, availability/metadata)
  const bodyPills = [];
  if (property.availability.filter(day => !day.is_blocked).length > 30) {
    bodyPills.push('Available 30+ days');
  }
  if (property.availability.filter(day => !day.is_blocked).length > 60) {
    bodyPills.push('Available 60+ days');
  }

  const handleImageCycle = () => {
    if (property.images.length > 1) {
      setImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(property.id);
    } else {
      addToCompare(property as any);
    }
  };

  const handleQuickPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowQuickPreview(true);
  };

  const handleViewDetail = (listing: Listing) => {
    if (onViewDetail) {
      onViewDetail(listing);
    } else {
      onClick();
    }
  };

  const displayRate = showShortStayMode && property.base_nightly 
    ? `£${property.base_nightly}/night`
    : `£${property.monthly_rent.toLocaleString()}/month`;

  const secondaryRate = showShortStayMode && property.base_nightly
    ? `£${property.monthly_rent.toLocaleString()}/month`
    : property.base_nightly ? `£${property.base_nightly}/night` : null;

  return (
    <div 
      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-petrol/10 hover:border-petrol/20 hover:-translate-y-1 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        <img
          src={property.images[imageIndex]}
          alt={property.title}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
          onMouseEnter={handleImageCycle}
        />
        
        {/* Hero Image Pills - Max 2, gradient, time-sensitive only */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {heroPills.slice(0, 2).map((pill) => (
            <span key={pill} className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${
              pill === 'Last-minute' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' : 
              pill === 'Short Stay Available' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' :
              pill === 'Limited dates' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white' :
              'bg-gradient-to-r from-petrol to-petrol/90 text-white'
            }`}>
              {pill}
            </span>
          ))}
        </div>

        {/* Premium Compare Button */}
        <button
          onClick={handleCompareToggle}
          className={`absolute top-4 right-4 p-2.5 rounded-full shadow-lg transition-all duration-200 ${
            inCompare 
              ? 'bg-petrol text-white' 
              : 'bg-white/95 hover:bg-white text-petrol hover:text-white hover:bg-petrol'
          }`}
          aria-label={inCompare ? 'Remove from compare' : 'Add to compare'}
        >
          {inCompare ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>

        {/* Image Dots */}
        {property.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {property.images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === imageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-5">
        {/* Title and Rating */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{property.city}, {property.country}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-4">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="font-medium text-sm text-gray-900">{property.reviews.rating_avg.toFixed(1)}</span>
            <span className="text-sm text-gray-500">({property.reviews.review_count})</span>
          </div>
        </div>

        {/* Body Pills - Flat style, availability/metadata */}
        {bodyPills.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {bodyPills.map((pill) => (
              <span key={pill} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">
                {pill}
              </span>
            ))}
          </div>
        )}

        {/* Key Info */}
        <div className="flex items-center gap-4 text-sm text-petrol/70 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span>{property.minimum_stay_nights}+ nights</span>
          </div>
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4 text-fern" />
            <span>{property.bedrooms} bed, {property.bathrooms} bath</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-petrol">
              {displayRate}
            </span>
            {secondaryRate && (
              <div className="text-sm text-petrol/60">
                {secondaryRate}
              </div>
            )}
          </div>
          <div className="text-right">
            <button
              onClick={handleQuickPreview}
              className="bg-fern text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-fern/90 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <Eye className="w-4 h-4" />
              Quick preview
            </button>
          </div>
        </div>

        {/* COMMENTED OUT: Distance Chips for Plan Mode */}
        {/* {pins.length > 0 && (
          <DistanceChips
            listingId={property.id}
            pins={pins}
            distanceResults={distanceResults}
          />
        )} */}
      </div>


      {/* Quick Preview Modal */}
      <ListingQuickPreview
        listing={showQuickPreview ? property : null}
        onClose={() => setShowQuickPreview(false)}
        onViewDetail={handleViewDetail}
      />
    </div>
  );
};

export default PropertyCard;