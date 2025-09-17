import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Pin, DistanceResult } from '@/types/map';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Listing {
  id: string;
  title: string;
  pricePerNight: number;
  coordinates?: { lat: number; lng: number };
  // Add other listing properties as needed
}

interface ResultsMapProps {
  listings: Listing[];
  mode: 'browse' | 'plan';
  onMapMove: (bounds: any) => void;
  highlightedListingId?: string;
  onListingHover: (listingId: string | null) => void;
  pins?: Pin[];
  onMapClick?: (lat: number, lng: number) => void;
  isDropPinMode?: boolean;
  distanceResults?: DistanceResult[];
}

// Component to handle map events
const MapEventHandler: React.FC<{
  onMapMove: (bounds: any) => void;
}> = ({ onMapMove }) => {
  const map = useMap();

  useEffect(() => {
    const handleMoveEnd = () => {
      const bounds = map.getBounds();
      onMapMove(bounds);
    };

    map.on('moveend', handleMoveEnd);
    map.on('zoomend', handleMoveEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
      map.off('zoomend', handleMoveEnd);
    };
  }, [map, onMapMove]);

  return null;
};

const ResultsMap: React.FC<ResultsMapProps> = ({
  listings,
  mode,
  onMapMove,
  highlightedListingId,
  onListingHover,
  pins = [],
  onMapClick,
  isDropPinMode = false,
  distanceResults = []
}) => {
  const mapRef = useRef<L.Map>(null);

  // Calculate center point from listings
  const getMapCenter = (): [number, number] => {
    if (listings.length === 0) {
      return [51.5074, -0.1278]; // Default to London
    }

    const validListings = listings.filter(listing => listing.coordinates);
    if (validListings.length === 0) {
      return [51.5074, -0.1278]; // Default to London
    }

    const avgLat = validListings.reduce((sum, listing) => sum + (listing.coordinates?.lat || 0), 0) / validListings.length;
    const avgLng = validListings.reduce((sum, listing) => sum + (listing.coordinates?.lng || 0), 0) / validListings.length;

    return [avgLat, avgLng];
  };

  const center = getMapCenter();

  return (
    <div className="w-full h-full">
      <MapContainer
        center={center}
        zoom={12}
        className="w-full h-full"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEventHandler onMapMove={onMapMove} />

        {/* Render markers for listings */}
        {listings
          .filter(listing => listing.coordinates)
          .map((listing) => {
            const isHighlighted = highlightedListingId === listing.id;
            const priceMarkerHtml = `
              <div class="price-marker ${isHighlighted ? 'highlighted' : ''}">
                <div class="price-content">
                  £${listing.pricePerNight}
                </div>
              </div>
            `;

            const priceIcon = L.divIcon({
              html: priceMarkerHtml,
              className: 'custom-price-marker',
              iconSize: [60, 30],
              iconAnchor: [30, 15],
            });

            return (
              <Marker
                key={listing.id}
                position={[listing.coordinates!.lat, listing.coordinates!.lng]}
                icon={priceIcon}
                eventHandlers={{
                  mouseover: () => onListingHover(listing.id),
                  mouseout: () => onListingHover(null),
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-sm mb-1">{listing.title}</h3>
                    <p className="text-petrol font-medium">£{listing.pricePerNight}/night</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Render pin markers for Plan mode */}
        {mode === 'plan' && pins.map((pin) => {
          const pinMarkerHtml = `
            <div class="pin-marker" style="--pin-color: ${
              pin.id === 'A' ? '#ef4444' :
              pin.id === 'B' ? '#3b82f6' :
              '#10b981'
            }">
              <div class="pin-content">
                <div class="pin-label">${pin.id}</div>
                <div class="pin-name">${pin.name}</div>
              </div>
            </div>
          `;

          const pinIcon = L.divIcon({
            html: pinMarkerHtml,
            className: 'custom-pin-marker',
            iconSize: [80, 40],
            iconAnchor: [40, 20],
          });

          return (
            <Marker
              key={pin.id}
              position={[pin.lat, pin.lng]}
              icon={pinIcon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-sm mb-1">Pin {pin.id}</h3>
                  <p className="text-gray-600 text-sm">{pin.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default ResultsMap;
