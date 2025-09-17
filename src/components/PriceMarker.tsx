import React from 'react';
import L from 'leaflet';

interface PriceMarkerProps {
  price: number;
  isHighlighted?: boolean;
  isOutOfBudget?: boolean;
}

const PriceMarker: React.FC<PriceMarkerProps> = ({ 
  price, 
  isHighlighted = false, 
  isOutOfBudget = false 
}) => {
  const markerHtml = `
    <div class="price-marker ${isHighlighted ? 'highlighted' : ''} ${isOutOfBudget ? 'out-of-budget' : ''}">
      <div class="price-content">
        £${price}
      </div>
    </div>
  `;

  const markerIcon = L.divIcon({
    html: markerHtml,
    className: 'custom-price-marker',
    iconSize: [60, 30],
    iconAnchor: [30, 15],
  });

  return null; // This component is used to create the icon, not render directly
};

// CSS styles for the price marker (to be added to your CSS file)
export const priceMarkerStyles = `
  .price-marker {
    background: white;
    border: 2px solid #1e40af;
    border-radius: 20px;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: 600;
    color: #1e40af;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 50px;
    text-align: center;
  }

  .price-marker:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .price-marker.highlighted {
    background: #1e40af;
    color: white;
    border-color: #1e40af;
    transform: scale(1.1);
    z-index: 1000;
  }

  .price-marker.out-of-budget {
    background: #f3f4f6;
    color: #6b7280;
    border-color: #d1d5db;
  }

  .price-marker.out-of-budget.highlighted {
    background: #6b7280;
    color: white;
    border-color: #6b7280;
  }

  .custom-price-marker {
    background: transparent !important;
    border: none !important;
  }
`;

export default PriceMarker;
