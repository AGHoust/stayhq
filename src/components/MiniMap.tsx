import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import DistanceChips from './DistanceChips';
import { Pin, DistanceResult } from '@/types/map';
import { formatDistance } from '@/utils/distance';

interface MiniMapProps {
  listing: {
    id: string;
    title: string;
    coordinates?: { lat: number; lng: number };
    city: string;
    country: string;
  };
  pins?: Pin[];
  distanceResults?: DistanceResult[];
  onOpenFullMap?: () => void;
}

const MiniMap: React.FC<MiniMapProps> = ({
  listing,
  pins = [],
  distanceResults = [],
  onOpenFullMap
}) => {
  // Generate static map URL using Mapbox Static API
  const generateMapUrl = () => {
    if (!listing.coordinates) {
      // Default to London if no coordinates
      return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-marker+ff0000(51.5074,-0.1278)/51.5074,-0.1278,12,0/280x200@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;
    }

    const { lat, lng } = listing.coordinates;
    const pinMarkers = pins.map((pin, index) => {
      const colors = ['ff0000', '0000ff', '00ff00']; // Red, Blue, Green for A, B, C
      return `pin-s-marker+${colors[index]}(${pin.lng},${pin.lat})`;
    }).join(',');

    const listingMarker = `pin-s-home+ff6b35(${lng},${lat})`;
    const allMarkers = pins.length > 0 ? `${pinMarkers},${listingMarker}` : listingMarker;

    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${allMarkers}/${lng},${lat},14,0/280x200@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;
  };

  const hasActivePins = pins.length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-petrol" />
          Location
        </h3>
        {onOpenFullMap && (
          <button
            onClick={onOpenFullMap}
            className="flex items-center gap-1 text-sm text-petrol hover:text-petrol/80 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Open on map
          </button>
        )}
      </div>

      {/* Static Map */}
      <div className="relative mb-3">
        <img
          src={generateMapUrl()}
          alt={`Map showing ${listing.title} location`}
          className="w-full h-48 object-cover rounded-lg border border-gray-200"
        />
        
        {/* Map overlay with location info */}
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
          <div className="text-sm font-medium text-gray-900">{listing.city}, {listing.country}</div>
          {listing.coordinates && (
            <div className="text-xs text-gray-500">
              {listing.coordinates.lat.toFixed(4)}, {listing.coordinates.lng.toFixed(4)}
            </div>
          )}
        </div>
      </div>

      {/* Distance Chips */}
      {hasActivePins && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Distances from your places:</div>
          <DistanceChips
            listingId={listing.id}
            pins={pins}
            distanceResults={distanceResults}
            maxChips={3}
          />
        </div>
      )}

      {/* No pins message */}
      {!hasActivePins && (
        <div className="text-sm text-gray-500 text-center py-2">
          Add places to see distances
        </div>
      )}
    </div>
  );
};

export default MiniMap;
