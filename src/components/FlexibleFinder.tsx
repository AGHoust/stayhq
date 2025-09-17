import React, { useState } from 'react';
import { X, Search, Zap, MapPin, Calendar, Users } from 'lucide-react';
import PropertyCard from './PropertyCard';
import { Property } from '../utils/types';
import { allProperties } from '../utils/dummyData';

interface FlexibleFinderProps {
  onClose: () => void;
  onPropertyClick: (property: Property) => void;
}

const FlexibleFinder: React.FC<FlexibleFinderProps> = ({ onClose, onPropertyClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Property[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const sampleQueries = [
    "I want a 2-month stay in London under £4000",
    "Looking for a romantic spot in Brighton for 6 weeks",
    "Need a family-friendly place in UK for 3 months",
    "Business traveler needs luxury accommodation for 2 months",
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Mock search logic - in real app this would call an AI service
    setTimeout(() => {
      // Filter properties based on mock search
      let results = allProperties;
      
      if (searchQuery.toLowerCase().includes('london')) {
        results = results.filter(p => p.location.includes('London'));
      }
      if (searchQuery.toLowerCase().includes('brighton')) {
        results = results.filter(p => p.location.includes('Brighton'));
      }
      if (searchQuery.toLowerCase().includes('romantic')) {
        results = results.filter(p => p.travelerType.includes('Couples'));
      }
      if (searchQuery.toLowerCase().includes('family')) {
        results = results.filter(p => p.travelerType.includes('Families'));
      }
      if (searchQuery.toLowerCase().includes('business')) {
        results = results.filter(p => p.travelerType.includes('Business'));
      }
      
      setSuggestions(results.slice(0, 4));
      setIsSearching(false);
    }, 1500);
  };

  const handleSampleQuery = (query: string) => {
    setSearchQuery(query);
    setTimeout(() => handleSearch(), 100);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold to-sage rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-charcoal">Flexible Finder</h2>
              <p className="text-sm text-charcoal/60">Tell us what you need, we'll find it</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-charcoal" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search Input */}
          <div className="mb-6">
            <div className="relative">
              <textarea
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Describe your ideal stay... e.g., 'I want a 2-month stay in London under £4000 for remote work'"
                className="w-full h-24 p-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-sage outline-none resize-none"
              />
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isSearching}
                className="absolute top-4 right-4 bg-sage text-white p-2 rounded-lg hover:bg-sage/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Sample Queries */}
          {!suggestions.length && (
            <div className="mb-6">
              <h3 className="font-semibold text-charcoal mb-3">Try these examples:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sampleQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleSampleQuery(query)}
                    className="text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 hover:border-sage"
                  >
                    <p className="text-sm text-charcoal">{query}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isSearching && (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-sage/20 border-t-sage rounded-full animate-spin mx-auto mb-4" />
              <h3 className="font-semibold text-charcoal mb-2">Searching for your perfect stay...</h3>
              <p className="text-charcoal/60">Using AI to match your preferences</p>
            </div>
          )}

          {/* Results */}
          {suggestions.length > 0 && !isSearching && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-5 h-5 text-gold" />
                <h3 className="font-bold text-charcoal">Perfect matches for you</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions.map((property) => (
                  <div key={property.id} onClick={() => onPropertyClick(property)}>
                    <PropertyCard
                      property={property}
                      onClick={() => onPropertyClick(property)}
                      onAddToCompare={() => {}}
                    />
                  </div>
                ))}
              </div>
              
              {/* Additional Options */}
              <div className="mt-8 p-6 bg-gradient-to-br from-sage/5 to-gold/5 rounded-xl">
                <h4 className="font-semibold text-charcoal mb-4">Want to refine your search?</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <MapPin className="w-5 h-5 text-sage" />
                    <span className="text-charcoal">Change location</span>
                  </button>
                  <button className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <Calendar className="w-5 h-5 text-sage" />
                    <span className="text-charcoal">Adjust dates</span>
                  </button>
                  <button className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <Users className="w-5 h-5 text-sage" />
                    <span className="text-charcoal">Change guests</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlexibleFinder;