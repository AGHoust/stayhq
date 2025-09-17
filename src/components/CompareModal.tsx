import React from 'react';
import { X, Star, MapPin, Calendar, Users } from 'lucide-react';
import { Property } from '../utils/types';

interface CompareModalProps {
  properties: Property[];
  onClose: () => void;
  onRemove: (propertyId: string) => void;
  onPropertyClick: (property: Property) => void;
}

const CompareModal: React.FC<CompareModalProps> = ({
  properties,
  onClose,
  onRemove,
  onPropertyClick
}) => {
  if (properties.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-charcoal">Compare Properties</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-charcoal" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid gap-6">
            {/* Property Cards Row */}
            <div className={`grid gap-6 ${
              properties.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
              properties.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="bg-gray-50 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => onPropertyClick(property)}
                >
                  <div className="relative">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(property.id);
                      }}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white p-1 rounded-full shadow-lg transition-all"
                    >
                      <X className="w-4 h-4 text-charcoal" />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-charcoal mb-2 line-clamp-2">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1 text-charcoal/60 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{property.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-gold fill-current" />
                        <span className="font-semibold text-sm">{property.rating}</span>
                        <span className="text-sm text-charcoal/60">({property.reviews})</span>
                      </div>
                      <span className="text-sage text-sm font-medium">{property.travelerType}</span>
                    </div>
                    
                    <div className="text-center">
                      <span className="text-xl font-bold text-charcoal">
                        £{property.monthlyRate.toLocaleString()}
                      </span>
                      <span className="text-sm text-charcoal/60">/month</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add More Card */}
              {properties.length < 3 && (
                <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center min-h-[300px] cursor-pointer hover:border-sage transition-colors">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">Add another property</p>
                    <p className="text-sm text-gray-400 mt-1">Compare up to 3 properties</p>
                  </div>
                </div>
              )}
            </div>

            {/* Comparison Table */}
            {properties.length > 1 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-bold text-charcoal">Detailed Comparison</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left p-4 font-semibold text-charcoal">Features</th>
                        {properties.map((property) => (
                          <th key={property.id} className="text-left p-4 font-semibold text-charcoal min-w-[200px]">
                            {property.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="p-4 font-medium text-charcoal">Monthly Rate</td>
                        {properties.map((property) => (
                          <td key={property.id} className="p-4 text-charcoal">
                            £{property.monthlyRate.toLocaleString()}/month
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="p-4 font-medium text-charcoal">Rating</td>
                        {properties.map((property) => (
                          <td key={property.id} className="p-4 text-charcoal">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-gold fill-current" />
                              {property.rating} ({property.reviews} reviews)
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="p-4 font-medium text-charcoal">Stay Duration</td>
                        {properties.map((property) => (
                          <td key={property.id} className="p-4 text-charcoal">
                            {property.minStay}-{property.maxStay} days
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="p-4 font-medium text-charcoal">Amenities</td>
                        {properties.map((property) => (
                          <td key={property.id} className="p-4 text-charcoal">
                            <div className="space-y-1">
                              {property.amenities.slice(0, 3).map((amenity) => (
                                <div key={amenity} className="text-sm">{amenity}</div>
                              ))}
                              {property.amenities.length > 3 && (
                                <div className="text-sm text-sage">
                                  +{property.amenities.length - 3} more
                                </div>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-medium text-charcoal">Best For</td>
                        {properties.map((property) => (
                          <td key={property.id} className="p-4 text-charcoal">
                            <span className="bg-sage/10 text-sage px-2 py-1 rounded-full text-sm">
                              {property.travelerType}
                            </span>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-charcoal rounded-lg hover:bg-gray-100 transition-colors"
            >
              Close Comparison
            </button>
            {properties.length > 0 && (
              <button
                onClick={() => onPropertyClick(properties[0])}
                className="px-6 py-2 bg-sage text-white rounded-lg hover:bg-sage/90 transition-colors"
              >
                View First Property
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareModal;