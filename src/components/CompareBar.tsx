import React from 'react';
import { X, ArrowRight, AlertCircle } from 'lucide-react';
import { useCompareStore } from '../store/compareStore';

interface CompareBarProps {
  onNavigateToCompare: () => void;
}

const CompareBar: React.FC<CompareBarProps> = ({ onNavigateToCompare }) => {
  const { compareList, removeFromCompare, clearCompare, clearStorage, canAddMore, maxCompareItems } = useCompareStore();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-custom z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Compare label and items */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-shrink-0">
              <h3 className="font-semibold text-ink text-sm">
                Compare ({compareList.length}/{maxCompareItems})
              </h3>
              {!canAddMore() && (
                <div className="flex items-center gap-1 text-orange-600 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>Full</span>
                </div>
              )}
            </div>
            
            {/* Property cards - optimized layout to use full bar width */}
            <div className="flex gap-3 min-w-0 flex-1">
              {compareList.map((property) => (
                <div
                  key={property.id}
                  className={`flex items-center gap-3 bg-surface rounded-lg p-3 min-w-0 shadow-sm border border-border/50 ${
                    compareList.length === 2 ? 'flex-1' : 'flex-1'
                  }`}
                >
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-ink truncate">
                      {property.title}
                    </p>
                    <p className="text-sm text-muted truncate">
                      {(() => {
                        const anyP: any = property as any;
                        const value = anyP.monthly_rent ?? anyP.monthlyRate;
                        return `£${Number(value).toLocaleString()}/mo`;
                      })()}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCompare(property.id)}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                    aria-label={`Remove ${property.title} from compare`}
                  >
                    <X className="w-4 h-4 text-muted" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right side - Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={clearStorage}
              className="text-muted hover:text-ink transition-colors text-sm px-2 py-1 rounded hover:bg-gray-100"
              title="Clear cached data (fixes 28-day issue)"
            >
              Clear Cache
            </button>
            <button
              onClick={clearCompare}
              className="text-muted hover:text-ink transition-colors text-sm px-2 py-1 rounded hover:bg-gray-100"
            >
              Clear All
            </button>
            <button
              onClick={onNavigateToCompare}
              disabled={compareList.length < 2}
              className="bg-petrol text-white px-4 py-2 rounded-lg font-semibold hover:bg-petrol/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
            >
              Compare
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareBar;