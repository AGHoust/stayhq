import { useState } from 'react';
import LandingPage from './components/LandingPage';
import ListingPage from './components/ListingPage';
import ComparePage from './components/ComparePage';
import SearchResultsPage from './components/SearchResultsPage';
import SmartSearchResultsPage from './components/SmartSearchResultsPage';
import { Property } from './utils/types';
import MTLListingsPage from './components/MTLListingsPage';
import MTLListingDetail from './components/MTLListingDetail';
import type { Listing } from '@/lib/schemas/listing';
import LastMinuteListingsPage from './components/LastMinuteListingsPage';

type CompareItem = Property | Listing;

function isListing(item: CompareItem): item is Listing {
  return 'monthly_rent' in item && 'platform' in item;
}

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'listing' | 'compare' | 'mtl_list' | 'mtl_detail' | 'last_minute' | 'search_results' | 'smart_search_results'>('landing');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [searchParams, setSearchParams] = useState<any>(null);
  const [smartSearchParams, setSmartSearchParams] = useState<any>(null);

  console.log('🔄 App: Rendering with currentView:', currentView);

  const navigateToListing = (property: Property) => {
    setSelectedProperty(property);
    setCurrentView('listing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToLanding = () => {
    setCurrentView('landing');
    setSelectedProperty(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCompare = () => {
    setCurrentView('compare');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromCompare = () => {
    if (selectedProperty) {
      setCurrentView('listing');
    } else {
      setCurrentView('landing');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompareItemClick = (item: CompareItem) => {
    if (isListing(item)) {
      setSelectedListing(item);
      setCurrentView('mtl_detail');
    } else {
      setSelectedProperty(item);
      setCurrentView('listing');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openMTLList = () => {
    setCurrentView('mtl_list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const openLastMinute = () => {
    setCurrentView('last_minute');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const backFromMTLDetail = () => {
    setCurrentView('mtl_list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (params: any) => {
    setSearchParams(params);
    setCurrentView('search_results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSmartSearch = (params: any) => {
    console.log('🧠 App: Smart Search triggered with params:', params);
    setSmartSearchParams(params);
    setCurrentView('smart_search_results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const backFromSearchResults = () => {
    setCurrentView('landing');
    setSearchParams(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const backFromSmartSearchResults = () => {
    setCurrentView('landing');
    setSmartSearchParams(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-surface">
      {(() => { (window as any).openMTLList = openMTLList; (window as any).openLastMinute = openLastMinute; return null; })()}
      {currentView === 'landing' && (
        <LandingPage 
          onPropertyClick={navigateToListing}
          onNavigateToCompare={navigateToCompare}
          onSearch={handleSearch}
          onSmartSearch={handleSmartSearch}
        />
      )}
      {/* No floating Explore button per design */}
      
      {currentView === 'listing' && selectedProperty && (
        <ListingPage 
          property={selectedProperty}
          onBackToLanding={navigateToLanding}
          onPropertyClick={navigateToListing}
          onNavigateToCompare={navigateToCompare}
        />
      )}
      
      {currentView === 'compare' && (
        <ComparePage
          onBack={handleBackFromCompare}
          onPropertyClick={handleCompareItemClick}
        />
      )}

      {currentView === 'mtl_list' && (
        <MTLListingsPage />
      )}

      {currentView === 'last_minute' && (
        <LastMinuteListingsPage />
      )}

      {currentView === 'mtl_detail' && selectedListing && (
        <MTLListingDetail listing={selectedListing} onBack={backFromMTLDetail} />
      )}

      {currentView === 'search_results' && searchParams && (
        <SearchResultsPage
          searchParams={searchParams}
          onBackToLanding={backFromSearchResults}
          onPropertyClick={navigateToListing}
        />
      )}

      {currentView === 'smart_search_results' && smartSearchParams && (
        <SmartSearchResultsPage
          searchParams={smartSearchParams}
          onBackToLanding={backFromSmartSearchResults}
          onPropertyClick={navigateToListing}
        />
      )}
    </div>
  );
}

export default App;