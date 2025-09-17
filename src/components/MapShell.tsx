import React, { useState } from 'react';
import { Map, Search, List, Maximize2 } from 'lucide-react';
import ResultsMap from './ResultsMap';
import PinDock from './PinDock';
import { Pin, DistanceResult } from '@/types/map';

interface Listing {
  id: string;
  title: string;
  pricePerNight: number;
  coordinates?: { lat: number; lng: number };
  // Add other listing properties as needed
}

interface MapShellProps {
  listings: Listing[];
  mode: 'browse' | 'plan';
  onModeChange: (mode: 'browse' | 'plan') => void;
  onSearchThisArea: (bounds: any) => void;
  onShowList: () => void;
  onOpenFullMap: () => void;
  highlightedListingId?: string;
  onListingHover: (listingId: string | null) => void;
  pins?: Pin[];
  onAddPin?: (pin: Pin) => void;
  onRemovePin?: (pinId: string) => void;
  onUpdatePin?: (pinId: string, updates: Partial<Pin>) => void;
  onDropPin?: () => void;
  onMapClick?: (lat: number, lng: number) => void;
  isDropPinMode?: boolean;
  distanceResults?: DistanceResult[];
}

const MapShell: React.FC<MapShellProps> = ({
  listings,
  mode,
  onModeChange,
  onSearchThisArea,
  onShowList,
  onOpenFullMap,
  highlightedListingId,
  onListingHover,
  pins = [],
  onAddPin,
  onRemovePin,
  onUpdatePin,
  onDropPin,
  onMapClick,
  isDropPinMode = false,
  distanceResults = []
}) => {
  const [showSearchArea, setShowSearchArea] = useState(false);
  const [mapBounds, setMapBounds] = useState<any>(null);

  const handleMapMove = (bounds: any) => {
    setMapBounds(bounds);
    setShowSearchArea(true);
  };

  const handleSearchThisArea = () => {
    if (mapBounds) {
      onSearchThisArea(mapBounds);
      setShowSearchArea(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Map Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-4">
          {/* Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onModeChange('browse')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                mode === 'browse'
                  ? 'bg-white text-petrol shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Map className="w-4 h-4 inline mr-1.5" />
              Browse
            </button>
            <button
              onClick={() => onModeChange('plan')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                mode === 'plan'
                  ? 'bg-white text-petrol shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Search className="w-4 h-4 inline mr-1.5" />
              Plan around a place
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search this area button */}
          {showSearchArea && (
            <button
              onClick={handleSearchThisArea}
              className="px-4 py-2 bg-petrol text-white text-sm font-medium rounded-lg hover:bg-petrol/90 transition-colors"
            >
              <Search className="w-4 h-4 inline mr-1.5" />
              Search this area
            </button>
          )}

          {/* Show list button */}
          <button
            onClick={onShowList}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Show list"
          >
            <List className="w-5 h-5" />
          </button>

          {/* Open full map button */}
          <button
            onClick={onOpenFullMap}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Open full map"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <ResultsMap
          listings={listings}
          mode={mode}
          onMapMove={handleMapMove}
          highlightedListingId={highlightedListingId}
          onListingHover={onListingHover}
          pins={pins}
          onMapClick={onMapClick}
          isDropPinMode={isDropPinMode}
          distanceResults={distanceResults}
        />
        
        {/* PinDock for Plan mode */}
        {mode === 'plan' && onAddPin && onRemovePin && onUpdatePin && onDropPin && (
          <div className="absolute top-4 left-4 z-10 max-w-sm">
            <PinDock
              pins={pins}
              onAddPin={onAddPin}
              onRemovePin={onRemovePin}
              onUpdatePin={onUpdatePin}
              onDropPin={onDropPin}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MapShell;
