import React, { useState, useEffect } from 'react';
import { Star, Zap, ChevronRight, MapPin } from 'lucide-react';
import PropertyCard from './PropertyCard';
import FlexibleFinder from './FlexibleFinder';
import CompareBar from './CompareBar';
import AdvancedSearchBar from './AdvancedSearchBar';
import InspirationMode from './InspirationMode';
import { Property } from '../utils/types';
import { useListings, getStandard, getLastMinute, getFeatured } from '@/lib/listings';
import type { Listing } from '@/lib/schemas/listing';
import { listingToProperty } from '@/lib/compare-utils';
import ListingQuickPreview from './ListingQuickPreview';

interface LandingPageProps {
  onPropertyClick: (property: Property) => void;
  onNavigateToCompare: () => void;
  onSearch: (searchParams: any) => void;
  onSmartSearch: (searchParams: any) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  onPropertyClick, 
  onNavigateToCompare,
  onSearch,
  onSmartSearch
}) => {
  const [showFlexibleFinder, setShowFlexibleFinder] = useState(false);
  const [preview, setPreview] = useState<Listing | null>(null);
  const [showInspirationMode, setShowInspirationMode] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [lastMinuteListings, setLastMinuteListings] = useState<Listing[]>([]);
  const [standardListings, setStandardListings] = useState<Listing[]>([]);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 LandingPage: Starting to load data...');
        const [lastMinute, standard, featured] = await Promise.all([
          getLastMinute(9),
          getStandard('London', 9),
          getFeatured(9)
        ]);
        console.log('✅ LandingPage: Loaded data:', { lastMinute: lastMinute.length, standard: standard.length, featured: featured.length });
        setLastMinuteListings(lastMinute);
        setStandardListings(standard);
        setFeaturedListings(featured);
        setLoading(false);
      } catch (error) {
        console.error('❌ LandingPage: Failed to load data:', error);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSearch = (searchParams: any) => {
    console.log('Searching for:', searchParams);
    onSearch(searchParams);
  };

  const handleInspirationMode = () => {
    setShowInspirationMode(true);
    setSearchResults(null);
  };

  // MTL dataset integration
  const [q] = useState('');
  const [cityFilters] = useState<string[]>(['London']);
  useListings({ q, cities: cityFilters, page: 1, pageSize: 24 });

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-petrol to-ember rounded-lg"></div>
            <span className="font-bold text-xl text-ink">StayHQ</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => (window as any).openMTLList?.()} className="text-ink hover:text-petrol transition-colors">Mid-lets</button>
            <button onClick={() => (window as any).openLastMinute?.()} className="text-ink hover:text-petrol transition-colors">Last Minute</button>
            <a href="#" className="text-ink hover:text-petrol transition-colors">Experiences</a>
            <button className="bg-petrol text-white px-4 py-2 rounded-lg hover:bg-petrol/90 transition-colors">
              List Property
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section - Mid-let Spotlight */}
      <section className="relative min-h-[60vh] bg-gradient-to-br from-petrol/5 via-ember/5 to-fern/5 flex items-center">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg')] bg-cover bg-center opacity-15"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-ink mb-4 leading-tight">
              Find your next
              <span className="text-petrol block">stay</span>
            </h1>
            <p className="text-lg text-muted mb-6 leading-relaxed">
              Beautifully managed homes optimised for 30–180 nights — with shorter options when needed.
            </p>
            
            {/* Advanced Search Bar */}
            <AdvancedSearchBar 
              onSearch={onSearch}
              onSmartSearch={onSmartSearch}
              onInspirationMode={handleInspirationMode}
            />

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted">
                <Star className="w-4 h-4 text-petrol fill-current" />
                <span>No booking fees</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <Star className="w-4 h-4 text-petrol fill-current" />
                <span>Instant confirmation</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <Star className="w-4 h-4 text-petrol fill-current" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Inspiration Mode */}
      {showInspirationMode && (
        <InspirationMode 
          searchParams={searchResults}
          onPropertyClick={onPropertyClick}
        />
      )}

      {/* Last-Minute Bargains (first) */}
      <section className="py-16 bg-gradient-to-r from-lastminute/5 to-petrol/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-ink mb-2">
                <Zap className="inline-block w-8 h-8 text-lastminute mr-2" />
                Last-Minute Bargains
              </h2>
              <p className="text-muted">Bookable within next 7 days for 30+ nights</p>
            </div>
            <button onClick={() => (window as any).openLastMinute?.()} className="bg-ember text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-ember/90 transition-colors inline-flex items-center gap-2">
              See more
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8 text-muted">Loading...</div>
            ) : (
              lastMinuteListings.map((listing) => (
                <PropertyCard
                  key={listing.id}
                  property={listing as any}
                  onClick={() => onPropertyClick(listingToProperty(listing))}
                  onPreview={(l) => setPreview(l)}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Mid-let Properties */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-ink mb-2">Mid-let Properties</h2>
              <p className="text-muted">Direct-bookable homes for 30+ nights</p>
            </div>
            <button onClick={() => (window as any).openMTLList?.()} className="bg-ember text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-ember/90 transition-colors inline-flex items-center gap-2">
              See more
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8 text-muted">Loading...</div>
            ) : (
              standardListings.map((listing) => (
                <PropertyCard
                  key={listing.id}
                  property={listing as any}
                  onClick={() => onPropertyClick(listingToProperty(listing))}
                  onPreview={(l) => setPreview(l)}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-ink mb-2">Featured Properties</h2>
              <p className="text-muted">Handpicked homes for the perfect mid-let experience</p>
            </div>
            <button onClick={() => (window as any).openMTLList?.()} className="bg-ember text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-ember/90 transition-colors inline-flex items-center gap-2">
              See more
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8 text-muted">Loading...</div>
            ) : (
              featuredListings.map((listing) => (
                <PropertyCard
                  key={listing.id}
                  property={listing as any}
                  onClick={() => onPropertyClick(listingToProperty(listing))}
                  onPreview={(l) => setPreview(l)}
                />
              ))
            )}
          </div>
      {/* Quick Preview Modal */}
      <ListingQuickPreview listing={preview} onClose={() => setPreview(null)} onViewDetail={(l) => { setPreview(null); onPropertyClick(listingToProperty(l)); }} />
        </div>
      </section>

      {/* Drag & Discover Map Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ink mb-4">Drag & Discover</h2>
            <p className="text-muted max-w-2xl mx-auto">
              Explore neighborhoods by dragging the map. See live availability and pricing as you browse.
            </p>
          </div>
          <div className="bg-surface rounded-2xl h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-petrol mx-auto mb-4" />
              <p className="text-muted">Interactive map integration will be implemented here</p>
              <button className="mt-4 bg-petrol text-white px-6 py-2 rounded-lg hover:bg-petrol/90 transition-colors">
                Enable Map View
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Rebook Rewards Banner */}
          <div className="bg-gradient-to-r from-petrol to-ember rounded-2xl p-8 mb-12 text-center">
            <h3 className="text-2xl font-bold mb-2">Book Direct & Earn Rewards</h3>
            <p className="text-white/90 mb-4">Earn £50 credit for your next stay when you book directly with us</p>
            <button className="bg-white text-ink px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Learn More
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-petrol to-ember rounded-lg"></div>
                <span className="font-bold text-xl">StayHQ</span>
              </div>
              <p className="text-white/70 mb-4">
                Premium mid-let accommodation platform connecting travelers with exceptional stays.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Guests</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">How it works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guest guarantee</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Hosts</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">List your property</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Host resources</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">About us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/50 text-sm">© 2025 StayHQ. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-white/50 hover:text-white text-sm transition-colors">Privacy</a>
              <a href="#" className="text-white/50 hover:text-white text-sm transition-colors">Terms</a>
              <a href="#" className="text-white/50 hover:text-white text-sm transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Flexible Finder Modal */}
      {showFlexibleFinder && (
        <FlexibleFinder
          onClose={() => setShowFlexibleFinder(false)}
          onPropertyClick={onPropertyClick}
        />
      )}

      {/* Compare Bar */}
      <CompareBar onNavigateToCompare={onNavigateToCompare} />
    </div>
  );
};

export default LandingPage;