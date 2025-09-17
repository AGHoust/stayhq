import React from 'react';
import { ArrowLeft, Star, MapPin, Calendar, Users, Check, X, Bed, Bath, CreditCard, Shield } from 'lucide-react';
import { useCompareStore } from '../store/compareStore';
import { Property } from '../utils/types';
import type { Listing } from '@/lib/schemas/listing';
import { 
  getItemTitle, 
  getItemImages, 
  getItemLocation, 
  getItemPrice, 
  getItemRating, 
  getItemBedrooms, 
  getItemBathrooms, 
  getItemAmenities, 
  getItemBadges, 
  getItemDeposits, 
  getItemEarliestWindow, 
  getItemAvailability, 
  getItemHostName, 
  getItemMinStay, 
  getItemMaxStay,
  getItemStayType
} from '@/lib/compare-utils';

type CompareItem = Property | Listing;

interface ComparePageProps {
  onBack: () => void;
  onPropertyClick: (item: CompareItem) => void;
}

const ComparePage: React.FC<ComparePageProps> = ({ onBack, onPropertyClick }) => {
  const { compareList, removeFromCompare } = useCompareStore();

  if (compareList.length === 0) {
    return (
      <div className="min-h-screen bg-surface">
        <header className="bg-card border-b border-border sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-ink hover:text-petrol transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
        </header>
        
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="bg-card rounded-2xl p-12 shadow-custom">
            <div className="w-16 h-16 bg-petrol/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-petrol" />
            </div>
            <h1 className="text-3xl font-bold text-ink mb-4">No Properties to Compare</h1>
            <p className="text-muted mb-8">
              Add at least 2 properties to your compare list to see a side-by-side comparison.
            </p>
            <button
              onClick={onBack}
              className="bg-petrol text-white px-6 py-3 rounded-lg font-semibold hover:bg-petrol/90 transition-colors"
            >
              Browse Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  const generateAvailabilitySparkline = (item: CompareItem) => {
    const availability = getItemAvailability(item);
    const next30Days = availability.slice(0, 30);
    return next30Days.map((day, index) => (
      <div
        key={index}
        className={`w-2 h-4 rounded-sm ${
          day.available ? 'bg-fern' : 'bg-gray-300'
        }`}
        title={`${day.date}: ${day.available ? 'Available' : 'Blocked'}`}
      />
    ));
  };

  const allAmenities = Array.from(
    new Set(compareList.flatMap(item => getItemAmenities(item)))
  ).sort();

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-ink hover:text-petrol transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to search
          </button>
          <h1 className="text-xl font-bold text-ink">
            Compare Properties ({compareList.length})
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-card rounded-2xl shadow-custom overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-6 font-semibold text-ink bg-surface/50 min-w-[200px]">
                    Property Details
                  </th>
                  {compareList.map((item) => (
                    <th key={item.id} className="text-left p-6 min-w-[300px] relative">
                      <button
                        onClick={() => removeFromCompare(item.id)}
                        className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label={`Remove ${getItemTitle(item)}`}
                      >
                        <X className="w-4 h-4 text-muted" />
                      </button>
                      <div 
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => onPropertyClick(item)}
                      >
                        <img
                          src={getItemImages(item)[0]}
                          alt={getItemTitle(item)}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <h3 className="font-bold text-ink mb-1 pr-8">
                          {getItemTitle(item)}
                        </h3>
                        <div className="flex items-center gap-1 text-muted">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{getItemLocation(item)}</span>
                        </div>
                        {/* Badges */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {getItemBadges(item).map((badge) => (
                            <span
                              key={badge}
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                badge === 'Mid-let' 
                                  ? 'bg-petrol text-white' 
                                  : badge === 'Last-minute'
                                  ? 'bg-orange-500 text-white'
                                  : badge === 'Featured'
                                  ? 'bg-gold text-white'
                                  : 'bg-muted text-white'
                              }`}
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Rating */}
                <tr className="border-b border-border">
                  <td className="p-6 font-medium text-ink bg-surface/30">Rating</td>
                  {compareList.map((item) => {
                    const rating = getItemRating(item);
                    return (
                      <td key={item.id} className="p-6">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-petrol fill-current" />
                          <span className="font-semibold">{rating.rating.toFixed(1)}</span>
                          <span className="text-muted">({rating.count} reviews)</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Stay Type Availability */}
                <tr className="border-b border-border">
                  <td className="p-6 font-medium text-ink bg-surface/30">
                    Stay Type
                    <div className="text-sm text-muted font-normal">Booking availability</div>
                  </td>
                  {compareList.map((item) => {
                    const stayType = getItemStayType(item);
                    const minStay = getItemMinStay(item);
                    return (
                      <td key={item.id} className="p-6">
                        <div className="space-y-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            stayType === 'Mid-let only' 
                              ? 'bg-petrol text-white' 
                              : stayType === 'Short-stay only'
                              ? 'bg-orange-500 text-white'
                              : 'bg-fern text-white'
                          }`}>
                            {stayType}
                          </span>
                          <div className="text-xs text-muted">
                            Min: {minStay} nights
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Monthly Rate */}
                <tr className="border-b border-border">
                  <td className="p-6 font-medium text-ink bg-surface/30">Monthly Rate</td>
                  {compareList.map((item) => {
                    const price = getItemPrice(item);
                    return (
                      <td key={item.id} className="p-6">
                        <div>
                          <span className="text-xl font-bold text-ink">
                            £{price.monthly.toLocaleString()}
                          </span>
                          <span className="text-sm text-muted ml-1">/month</span>
                          {price.nightly && (
                            <div className="text-sm text-muted mt-1">
                              £{price.nightly}/night equivalent
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Bedrooms & Bathrooms */}
                <tr className="border-b border-border">
                  <td className="p-6 font-medium text-ink bg-surface/30">Beds & Baths</td>
                  {compareList.map((item) => {
                    const bedrooms = getItemBedrooms(item);
                    const bathrooms = getItemBathrooms(item);
                    return (
                      <td key={item.id} className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4 text-petrol" />
                            <span>{bedrooms} bed{bedrooms !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bath className="w-4 h-4 text-petrol" />
                            <span>{bathrooms} bath{bathrooms !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Stay Duration */}
                <tr className="border-b border-border">
                  <td className="p-6 font-medium text-ink bg-surface/30">Stay Duration</td>
                  {compareList.map((item) => {
                    const minStay = getItemMinStay(item);
                    const maxStay = getItemMaxStay(item);
                    return (
                      <td key={item.id} className="p-6">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-petrol" />
                          <span>{minStay}-{maxStay} days</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Host */}
                <tr className="border-b border-border">
                  <td className="p-6 font-medium text-ink bg-surface/30">Host</td>
                  {compareList.map((item) => (
                    <td key={item.id} className="p-6">
                      <span className="text-ink">{getItemHostName(item)}</span>
                    </td>
                  ))}
                </tr>

                {/* Availability (Next 30 Days) */}
                <tr className="border-b border-border">
                  <td className="p-6 font-medium text-ink bg-surface/30">
                    Availability
                    <div className="text-sm text-muted font-normal">Next 30 days</div>
                  </td>
                  {compareList.map((item) => {
                    const availability = getItemAvailability(item);
                    return (
                      <td key={item.id} className="p-6">
                        <div className="flex gap-1 flex-wrap">
                          {generateAvailabilitySparkline(item)}
                        </div>
                        <div className="text-sm text-muted mt-2">
                          {availability.slice(0, 30).filter(d => d.available).length}/30 days available
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Amenities */}
                <tr className="border-b border-border">
                  <td className="p-6 font-medium text-ink bg-surface/30">Amenities</td>
                  {compareList.map((item) => {
                    const amenities = getItemAmenities(item);
                    return (
                      <td key={item.id} className="p-6">
                        <div className="space-y-2">
                          {allAmenities.map((amenity) => (
                            <div key={amenity} className="flex items-center gap-2">
                              {amenities.includes(amenity) ? (
                                <Check className="w-4 h-4 text-fern" />
                              ) : (
                                <X className="w-4 h-4 text-gray-300" />
                              )}
                              <span className={`text-sm ${
                                amenities.includes(amenity) 
                                  ? 'text-ink' 
                                  : 'text-gray-400'
                              }`}>
                                {amenity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Deposits Summary */}
                <tr className="border-b border-border">
                  <td className="p-6 font-medium text-ink bg-surface/30">
                    Deposits
                    <div className="text-sm text-muted font-normal">Holding + Security</div>
                  </td>
                  {compareList.map((item) => {
                    const deposits = getItemDeposits(item);
                    return (
                      <td key={item.id} className="p-6">
                        {deposits ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-petrol" />
                              <span className="text-sm">
                                £{deposits.holding} holding
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-petrol" />
                              <span className="text-sm">
                                £{deposits.security} security
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Earliest Valid 30-Day Window */}
                <tr>
                  <td className="p-6 font-medium text-ink bg-surface/30">
                    Earliest 30-Day Window
                    <div className="text-sm text-muted font-normal">Next available</div>
                  </td>
                  {compareList.map((item) => {
                    const window = getItemEarliestWindow(item);
                    return (
                      <td key={item.id} className="p-6">
                        {window ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-petrol" />
                            <span className="text-sm">
                              {window.start.toLocaleDateString()} – {window.end.toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted">No 30-day window found</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          {compareList.map((item) => (
            <button
              key={item.id}
              onClick={() => onPropertyClick(item)}
              className="bg-petrol text-white px-6 py-3 rounded-lg font-semibold hover:bg-petrol/90 transition-colors"
            >
              View {getItemTitle(item)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComparePage;