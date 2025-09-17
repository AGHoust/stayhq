import React from 'react';
import L from 'leaflet';
import { Pin } from '@/types/map';

interface PinMarkerProps {
  pin: Pin;
  isHighlighted?: boolean;
}

const PinMarker: React.FC<PinMarkerProps> = ({ pin, isHighlighted = false }) => {
  const getPinColor = (pinId: string) => {
    switch (pinId) {
      case 'A': return '#ef4444'; // red-500
      case 'B': return '#3b82f6'; // blue-500
      case 'C': return '#10b981'; // green-500
      default: return '#6b7280'; // gray-500
    }
  };

  const color = getPinColor(pin.id);
  
  const markerHtml = `
    <div class="pin-marker ${isHighlighted ? 'highlighted' : ''}" style="--pin-color: ${color}">
      <div class="pin-content">
        <div class="pin-label">${pin.id}</div>
        <div class="pin-name">${pin.name}</div>
      </div>
    </div>
  `;

  const markerIcon = L.divIcon({
    html: markerHtml,
    className: 'custom-pin-marker',
    iconSize: [80, 40],
    iconAnchor: [40, 20],
  });

  return null; // This component is used to create the icon, not render directly
};

// CSS styles for the pin marker (to be added to your CSS file)
export const pinMarkerStyles = `
  .pin-marker {
    background: white;
    border: 3px solid var(--pin-color);
    border-radius: 20px;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--pin-color);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 60px;
    text-align: center;
    position: relative;
  }

  .pin-marker:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }

  .pin-marker.highlighted {
    background: var(--pin-color);
    color: white;
    transform: scale(1.15);
    z-index: 1000;
  }

  .pin-label {
    font-size: 14px;
    font-weight: bold;
    line-height: 1;
  }

  .pin-name {
    font-size: 10px;
    font-weight: 500;
    line-height: 1;
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 60px;
  }

  .custom-pin-marker {
    background: transparent !important;
    border: none !important;
  }
`;

export default PinMarker;
