import React from 'react';
import { Pin, DistanceResult } from '@/types/map';
import { formatDistance } from '@/utils/distance';

interface DistanceChipsProps {
  listingId: string;
  pins: Pin[];
  distanceResults: DistanceResult[];
  maxChips?: number;
}

const DistanceChips: React.FC<DistanceChipsProps> = ({
  listingId,
  pins,
  distanceResults,
  maxChips = 3
}) => {
  const distanceResult = distanceResults.find(result => result.listingId === listingId);
  
  if (!distanceResult || pins.length === 0) {
    return null;
  }

  const distances = Object.entries(distanceResult.distances)
    .map(([pinId, distance]) => {
      const pin = pins.find(p => p.id === pinId);
      return pin ? { pin, distance } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a!.distance - b!.distance)
    .slice(0, maxChips);

  if (distances.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {distances.map(({ pin, distance }) => (
        <span
          key={pin.id}
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            pin.id === 'A' ? 'bg-red-100 text-red-700' :
            pin.id === 'B' ? 'bg-blue-100 text-blue-700' :
            'bg-green-100 text-green-700'
          }`}
        >
          {formatDistance(distance)} from {pin.id}
        </span>
      ))}
    </div>
  );
};

export default DistanceChips;
