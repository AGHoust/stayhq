import React, { useState } from 'react';
import { Star, Plus, MapPin, Calendar, Users, Zap, Check, Bed, Bath } from 'lucide-react';
import { Property } from '../utils/types';
import { useCompareStore } from '../store/compareStore';

interface LegacyPropertyCardProps {
  property: Property;
  onClick: () => void;
  showShortStayMode?: boolean;
}

const LegacyPropertyCard: React.FC<LegacyPropertyCardProps> = ({ 
  property, 
  onClick,
  showShortStayMode = false
}) => {
  const [imageIndex, setImageIndex] = useState(0);
  const { addToCompare, removeFromCompare, isInCompare } = useCompareStore();
  
  const inCompare = isInCompare(property.id);

  const handleImageClick = () => {
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

  const displayRate = showShortStayMode && property.nightlyRate 
    ? `£${property.nightlyRate}/night`
    : `£${property.monthlyRate.toLocaleString()}/month`;

  const secondaryRate = showShortStayMode && property.nightlyRate
    ? `£${property.monthlyRate.toLocaleString()}/month`
    : property.nightlyRate ? `£${property.nightlyRate}/night` : null;

  return (
    <div 
      className="bg-card rounded-2xl shadow-custom hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={property.images[imageIndex]}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onClick={handleImageClick}
        />
        
        {/* Compare Button */}
        <button
          onClick={handleCompareToggle}
          className={`absolute top-4 right-4 p-3 rounded-full shadow-xl transition-all duration-200 ${
            inCompare 
              ? 'bg-petrol text-white border-2 border-white' 
              : 'bg-orange-500 text-white border-2 border-white'
          }`}
          aria-label={inCompare ? 'Remove from compare' : 'Add to compare'}
        >
          {inCompare ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>

        {/* Image dots */}
        {property.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {property.images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === imageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-ink mb-1 line-clamp-2">
              {property.title}
            </h3>
            <div className="flex items-center text-muted text-sm mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{property.location}</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
          <span className="font-semibold text-sm">{property.rating.toFixed(1)}</span>
          <span className="text-sm text-muted ml-1">({property.reviews})</span>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {property.travelerType === 'Mid-term let' && (
            <span className="px-2 py-1 bg-petrol text-white text-xs font-medium rounded-full">
              Mid-let
            </span>
          )}
          {property.discountType === 'last_minute' && (
            <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
              Last-minute
            </span>
          )}
          <span className="px-2 py-1 bg-fern text-white text-xs font-medium rounded-full">
            {property.minStay}+ nights
          </span>
        </div>

        {/* Property Details */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-muted text-sm">
            <Bed className="w-4 h-4 mr-1" />
            <span>{property.bedrooms} bed, {property.bathrooms} bath</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-xl text-ink">
              {displayRate}
            </div>
            {secondaryRate && (
              <div className="text-sm text-muted">
                {secondaryRate}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegacyPropertyCard;
