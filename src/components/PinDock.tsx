import React, { useState } from 'react';
import { Plus, MapPin, X, Settings } from 'lucide-react';
import { Pin } from '@/types/map';

interface PinDockProps {
  pins: Pin[];
  onAddPin: (pin: Pin) => void;
  onRemovePin: (pinId: string) => void;
  onUpdatePin: (pinId: string, updates: Partial<Pin>) => void;
  onDropPin: () => void;
  maxPins?: number;
}

const PinDock: React.FC<PinDockProps> = ({
  pins,
  onAddPin,
  onRemovePin,
  onUpdatePin,
  onDropPin,
  maxPins = 3
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newPinName, setNewPinName] = useState('');

  const availableSlots = ['A', 'B', 'C'].filter(
    slot => !pins.find(pin => pin.id === slot)
  );

  const handleAddPlace = () => {
    if (availableSlots.length === 0 || !newPinName.trim()) return;
    
    const newPin: Pin = {
      id: availableSlots[0] as 'A' | 'B' | 'C',
      name: newPinName.trim(),
      lat: 51.5074, // Default to London
      lng: -0.1278,
      weight: 1
    };
    
    onAddPin(newPin);
    setNewPinName('');
  };

  const handleRemovePin = (pinId: string) => {
    onRemovePin(pinId);
  };

  const handleUpdatePinWeight = (pinId: string, weight: number) => {
    onUpdatePin(pinId, { weight });
  };

  const handleUpdatePinRadius = (pinId: string, radius: number) => {
    onUpdatePin(pinId, { radius });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Plan around a place</h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
          title="Advanced settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Pin Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter up to 3 places or drop pins"
          value={newPinName}
          onChange={(e) => setNewPinName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddPlace()}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-petrol/20 focus:border-petrol"
          disabled={availableSlots.length === 0}
        />
        <button
          onClick={handleAddPlace}
          disabled={availableSlots.length === 0 || !newPinName.trim()}
          className="px-3 py-2 bg-petrol text-white rounded-lg hover:bg-petrol/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={onDropPin}
          disabled={availableSlots.length === 0}
          className="px-3 py-2 border border-petrol text-petrol rounded-lg hover:bg-petrol/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          <MapPin className="w-4 h-4" />
        </button>
      </div>

      {/* Active Pins */}
      {pins.length > 0 && (
        <div className="space-y-2 mb-4">
          {pins.map((pin) => (
            <div
              key={pin.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    pin.id === 'A' ? 'bg-red-500' :
                    pin.id === 'B' ? 'bg-blue-500' :
                    'bg-green-500'
                  }`}
                >
                  {pin.id}
                </div>
                <div>
                  <div className="font-medium text-sm">{pin.name}</div>
                  <div className="text-xs text-gray-500">
                    {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRemovePin(pin.id)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Advanced Settings */}
      {showAdvanced && pins.length > 0 && (
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Advanced Settings</h4>
          {pins.map((pin) => (
            <div key={pin.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full ${
                    pin.id === 'A' ? 'bg-red-500' :
                    pin.id === 'B' ? 'bg-blue-500' :
                    'bg-green-500'
                  }`}
                />
                <span className="text-sm font-medium">{pin.name}</span>
              </div>
              
              {/* Weight Slider */}
              <div className="ml-6">
                <label className="text-xs text-gray-600">Priority Weight</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={pin.weight || 1}
                  onChange={(e) => handleUpdatePinWeight(pin.id, parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-xs text-gray-500">
                  Weight: {(pin.weight || 1).toFixed(1)}
                </div>
              </div>

              {/* Radius Slider */}
              <div className="ml-6">
                <label className="text-xs text-gray-600">Search Radius (miles)</label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={pin.radius || 2}
                  onChange={(e) => handleUpdatePinRadius(pin.id, parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-xs text-gray-500">
                  Radius: {(pin.radius || 2).toFixed(1)} mi
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 mt-3">
        {pins.length === 0 && "Add places to see listings ranked by distance"}
        {pins.length > 0 && pins.length < maxPins && `${maxPins - pins.length} more pin${maxPins - pins.length > 1 ? 's' : ''} available`}
        {pins.length === maxPins && "Maximum pins reached"}
      </div>
    </div>
  );
};

export default PinDock;
