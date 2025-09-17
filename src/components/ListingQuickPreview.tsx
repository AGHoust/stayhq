import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, Users, Bed, Bath, Star, Heart, Plus, Check } from 'lucide-react';
import type { Listing } from '@/lib/schemas/listing';
import { useCompareStore } from '../store/compareStore';

interface ListingQuickPreviewProps {
  listing: Listing | null;
  origin?: 'results' | 'favourites' | 'compare';
  onClose: () => void;
  onViewDetail: (l: Listing) => void;
  context?: {
    pins?: Array<{ id: 'A' | 'B' | 'C'; name: string; lat: number; lon: number }>;
    distancesByPinMi?: Record<string, number>;
  };
}

const PreviewGallery: React.FC<{ 
  images: string[]; 
  title: string; 
}> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => (prev + 1) % images.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length]);

  const nextImage = () => setCurrentIndex(prev => (prev + 1) % images.length);
  const prevImage = () => setCurrentIndex(prev => (prev - 1 + images.length) % images.length);

  return (
    <div className="relative">
      <div className="relative aspect-[16/10] bg-gray-100 rounded-t-2xl overflow-hidden">
        <img
          src={images[currentIndex]}
          alt={`${title} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          onLoad={() => setIsLoading(false)}
          loading={currentIndex === 0 ? 'eager' : 'lazy'}
        />
        
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-petrol border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
              aria-label="Next image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
            Image {currentIndex + 1} of {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 p-4 overflow-x-auto">
          {images.slice(0, 6).map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                index === currentIndex ? 'border-petrol' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const PreviewMeta: React.FC<{ 
  listing: Listing; 
}> = ({ listing }) => {
  const displayRate = listing.base_nightly 
    ? `£${listing.base_nightly}/night`
    : `£${listing.monthly_rent.toLocaleString()}/month`;

  const secondaryRate = listing.base_nightly
    ? `£${listing.monthly_rent.toLocaleString()}/month`
    : null;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-petrol">{displayRate}</span>
        {secondaryRate && (
          <span className="text-sm text-petrol/60">{secondaryRate}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Star className="w-4 h-4 text-yellow-400 fill-current" />
        <span className="font-semibold text-gray-900">{listing.reviews.rating_avg.toFixed(1)}</span>
        <span className="text-sm text-gray-500">({listing.reviews.review_count} reviews)</span>
      </div>
    </div>
  );
};

const PreviewFacts: React.FC<{ 
  listing: Listing; 
}> = ({ listing }) => (
  <div className="flex items-center gap-6 text-sm text-gray-600">
    <div className="flex items-center gap-1">
      <Users className="w-4 h-4 text-fern" />
      <span>{listing.max_guests} guests</span>
    </div>
    <div className="flex items-center gap-1">
      <Bed className="w-4 h-4 text-orange-500" />
      <span>{listing.bedrooms} bed{listing.bedrooms !== 1 ? 's' : ''}</span>
    </div>
    <div className="flex items-center gap-1">
      <Bath className="w-4 h-4 text-petrol" />
      <span>{listing.bathrooms} bath{listing.bathrooms !== 1 ? 's' : ''}</span>
    </div>
  </div>
);

const PreviewBadges: React.FC<{ 
  listing: Listing; 
}> = ({ listing }) => {
  const badges = [];
  
  // Only show time-sensitive or special-case badges (no "Mid-let" - it's platform-wide)
  if (listing.minimum_stay_nights <= 7) badges.push('Short Stay Available');
  // Check for last-minute availability (simplified check)
  if (listing.availability.filter(day => !day.is_blocked).length < 7) badges.push('Last-minute');
  if (listing.availability.filter(day => !day.is_blocked).length > 30) badges.push('Available 30+ days');

  const visibleBadges = badges.slice(0, 2);
  const hiddenCount = badges.length - 2;

  return (
    <div className="flex items-center gap-2">
      {visibleBadges.map((badge) => (
        <span
          key={badge}
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            badge === 'Last-minute' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
            badge === 'Short Stay Available' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' :
            'bg-gray-100 text-gray-700'
          }`}
        >
          {badge}
        </span>
      ))}
      {hiddenCount > 0 && (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
          +{hiddenCount} more
        </span>
      )}
    </div>
  );
};

const PreviewMapThumb: React.FC<{ 
  listing: Listing;
  context?: ListingQuickPreviewProps['context'];
}> = ({ listing, context }) => {
  // Use default London coordinates for now (can be enhanced with actual coordinates later)
  const lat = 51.5074; // London latitude
  const lng = -0.1278; // London longitude
  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+petrol(${lng},${lat})/${lng},${lat},14,0/400x200@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <MapPin className="w-4 h-4 text-petrol" />
        <span>{listing.city}, {listing.country}</span>
      </div>
      <div className="relative rounded-lg overflow-hidden border border-gray-200">
        <img
          src={mapUrl}
          alt={`Map showing ${listing.title}`}
          className="w-full h-32 object-cover"
          loading="lazy"
        />
        {context?.pins && (
          <div className="absolute top-2 right-2 flex gap-1">
            {context.pins.map((pin) => (
              <div
                key={pin.id}
                className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
                title={pin.name}
              >
                {pin.id}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PreviewDistances: React.FC<{ 
  context?: ListingQuickPreviewProps['context'];
}> = ({ context }) => {
  if (!context?.pins || !context?.distancesByPinMi) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {context.pins.map((pin) => {
        const distance = context.distancesByPinMi?.[pin.id];
        if (!distance) return null;

        const displayDistance = distance < 0.2 
          ? `${Math.round(distance * 1609.34 / 50) * 50}m`
          : `${distance.toFixed(1)} mi`;

        return (
          <span
            key={pin.id}
            className="px-2 py-1 bg-petrol/10 text-petrol text-xs rounded-full"
          >
            {displayDistance} from {pin.name}
          </span>
        );
      })}
    </div>
  );
};

const PreviewAmenities: React.FC<{ 
  listing: Listing; 
}> = ({ listing }) => {
  const amenityIcons: Record<string, React.ReactNode> = {
    'wifi': <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" /></svg>,
    'workspace': <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" /></svg>,
    'parking': <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" /></svg>,
    'pet_friendly': <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" /></svg>,
  };

  const topAmenities = listing.amenities.slice(0, 6);

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-900">Amenities</h4>
      <div className="flex flex-wrap gap-2">
        {topAmenities.map((amenity) => (
          <div
            key={amenity}
            className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600"
          >
            {amenityIcons[amenity] || <div className="w-4 h-4 bg-gray-300 rounded" />}
            <span className="capitalize">{amenity.replace('_', ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PreviewActions: React.FC<{ 
  listing: Listing;
  onViewDetail: (listing: Listing) => void;
  onClose: () => void;
}> = ({ listing, onViewDetail, onClose }) => {
  const { addToCompare, removeFromCompare, isInCompare } = useCompareStore();
  const inCompare = isInCompare(listing.id);
  const [isSaved, setIsSaved] = useState(false);

  const handleCompareToggle = () => {
    if (inCompare) {
      removeFromCompare(listing.id);
    } else {
      addToCompare(listing as any);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    // TODO: Integrate with favourites store
  };

  const handleViewDetail = () => {
    onViewDetail(listing);
    onClose();
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleViewDetail}
        className="w-full bg-petrol text-white py-3 px-4 rounded-lg font-semibold hover:bg-petrol/90 transition-all duration-200 shadow-lg"
      >
        View details
      </button>
      
      <div className="flex gap-2">
        <button
          onClick={handleCompareToggle}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium transition-all duration-200 ${
            inCompare
              ? 'bg-petrol/10 text-petrol border border-petrol/20'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {inCompare ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {inCompare ? 'Remove from compare' : 'Add to compare'}
        </button>
        
        <button
          onClick={handleSave}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium transition-all duration-200 ${
            isSaved
              ? 'bg-red-100 text-red-600 border border-red-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          Save
        </button>
      </div>

      {listing.ui_flags.stay_type_availability === 'both' && (
        <button className="w-full bg-fern text-white py-2 px-4 rounded-lg font-semibold hover:bg-fern/90 transition-all duration-200">
          Book now
        </button>
      )}
    </div>
  );
};

const ListingQuickPreview: React.FC<ListingQuickPreviewProps> = ({
  listing,
  onClose,
  onViewDetail,
  context
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (listing) {
      setIsOpen(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsOpen(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [listing]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!listing || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden mx-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-title"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
          aria-label="Close preview"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col lg:flex-row">
          {/* Left side - Gallery */}
          <div className="lg:w-3/5">
            <PreviewGallery images={listing.images} title={listing.title} />
          </div>

          {/* Right side - Info */}
          <div className="lg:w-2/5 p-4 lg:p-6 space-y-4 lg:space-y-6 overflow-y-auto max-h-[90vh]">
            {/* Title and location */}
            <div>
              <h2 id="preview-title" className="text-xl font-semibold text-gray-900 mb-1">
                {listing.title}
              </h2>
              <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{listing.city}, {listing.country}</span>
              </div>
            </div>

            {/* Meta */}
            <PreviewMeta listing={listing} />

            {/* Facts */}
            <PreviewFacts listing={listing} />

            {/* Badges */}
            <PreviewBadges listing={listing} />

            {/* Distances */}
            <PreviewDistances context={context} />

            {/* Map */}
            <PreviewMapThumb listing={listing} context={context} />

            {/* Amenities */}
            <PreviewAmenities listing={listing} />

            {/* Actions */}
            <PreviewActions 
              listing={listing} 
              onViewDetail={onViewDetail}
              onClose={onClose}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ListingQuickPreview;