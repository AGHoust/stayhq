import React from 'react';
import { X, List, Filter, Search } from 'lucide-react';
import MapShell from './MapShell';
import { Pin, DistanceResult } from '@/types/map';

interface MobileMapViewProps {
  listings: Array<{
    id: string;
    title: string;
    pricePerNight: number;
    coordinates?: { lat: number; lng: number };
  }>;
  mode: 'browse' | 'plan';
  onModeChange: (mode: 'browse' | 'plan') => void;
  onSearchThisArea: (bounds: any) => void;
  onShowList: () => void;
  onClose: () => void;
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

const MobileMapView: React.FC<MobileMapViewProps> = ({
  listings,
  mode,
  onModeChange,
  onSearchThisArea,
  onShowList,
  onClose,
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
  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <button
          onClick={onClose}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2">
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
              Plan
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative" style={{ height: 'calc(100vh - 80px)' }}>
        <MapShell
          listings={listings}
          mode={mode}
          onModeChange={onModeChange}
          onSearchThisArea={onSearchThisArea}
          onShowList={onShowList}
          onOpenFullMap={() => {}}
          highlightedListingId={highlightedListingId}
          onListingHover={onListingHover}
          pins={pins}
          onAddPin={onAddPin}
          onRemovePin={onRemovePin}
          onUpdatePin={onUpdatePin}
          onDropPin={onDropPin}
          onMapClick={onMapClick}
          isDropPinMode={isDropPinMode}
          distanceResults={distanceResults}
        />
      </div>

      {/* Mobile Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onShowList}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-petrol text-white rounded-lg font-medium hover:bg-petrol/90 transition-colors"
          >
            <List className="w-5 h-5" />
            Show List
          </button>
          
          <button
            onClick={() => {/* TODO: Show filters */}}
            className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => {/* TODO: Show search */}}
            className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileMapView;
