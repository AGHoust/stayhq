import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import CornerBadge from './CornerBadge';

interface DiagonalHeroProps {
  onChooseMidLets?: () => void;
  onChooseLastMinute?: () => void;
}

const DiagonalHero: React.FC<DiagonalHeroProps> = ({ 
  onChooseMidLets,
  onChooseLastMinute
}) => {
  const [active, setActive] = useState<'midlets' | 'lastminute' | null>(null);

  const handleChooseMidLets = () => {
    console.log('Chose Mid-Lets');
    onChooseMidLets?.();
    // TODO: Add routing to /mid-lets
  };

  const handleChooseLastMinute = () => {
    console.log('Chose Last-Minute');
    onChooseLastMinute?.();
    // TODO: Add routing to /last-minute
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <h1 className="sr-only">Find mid-lets and last-minute stays</h1>
      
      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[80vh]">
            
            {/* Mid-Lets Panel */}
            <div 
              className={`group relative flex items-center justify-center p-8 lg:p-12 cursor-pointer transition-all duration-300 ${
                active === 'midlets' ? 'scale-105' : active === 'lastminute' ? 'scale-95 opacity-70' : ''
              }`}
              onClick={handleChooseMidLets}
              onMouseEnter={() => setActive('midlets')}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive('midlets')}
              onBlur={() => setActive(null)}
              tabIndex={0}
              role="button"
              aria-label="Explore Mid-Lets - Flexible mid-term lets with hotel-level care"
            >
              {/* Panel Background */}
              <div className="absolute inset-0 bg-[var(--card)]/60 backdrop-blur-sm border border-[var(--border)] rounded-3xl shadow-[var(--shadow)]"></div>
              
              {/* Glow Accent */}
              <div 
                className="absolute inset-0 blur-2xl opacity-30 mix-blend-multiply soft-pulse" 
                style={{ 
                  background: 'radial-gradient(60% 60% at 30% 30%, var(--ember), transparent 60%), radial-gradient(60% 60% at 70% 70%, var(--fig), transparent 60%)' 
                }}
              ></div>

              {/* Corner Badge */}
              <CornerBadge variant="midlets">Mid-Lets</CornerBadge>

              <div className="relative z-10 text-center max-w-md">
                <h2 className="text-4xl lg:text-5xl font-bold text-[var(--ink)] mb-4 leading-tight">
                  Stay a little longer
                </h2>
                <p className="text-lg text-[var(--muted)] mb-8 leading-relaxed">
                  Flexible mid-term lets with hotel-level care.
                </p>
                <button className="bg-[var(--card)]/80 backdrop-blur-sm border border-[var(--border)] text-[var(--ink)] px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-[var(--card)] transition-all duration-300 shadow-[var(--shadow)] focus:outline-none focus:ring-4 focus:ring-[var(--ember)] group-hover:shadow-xl">
                  Explore Mid-Lets
                  <ArrowRight className="w-5 h-5 inline ml-2" />
                </button>
              </div>
            </div>

            {/* Last-Minute Panel */}
            <div 
              className={`group relative flex items-center justify-center p-8 lg:p-12 cursor-pointer transition-all duration-300 ${
                active === 'lastminute' ? 'scale-105' : active === 'midlets' ? 'scale-95 opacity-70' : ''
              }`}
              onClick={handleChooseLastMinute}
              onMouseEnter={() => setActive('lastminute')}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive('lastminute')}
              onBlur={() => setActive(null)}
              tabIndex={0}
              role="button"
              aria-label="See Last-Minute Bargains - Last-minute stays at irresistible rates"
            >
              {/* Panel Background */}
              <div className="absolute inset-0 bg-[var(--card)]/60 backdrop-blur-sm border border-[var(--border)] rounded-3xl shadow-[var(--shadow)]"></div>
              
              {/* Glow Accent */}
              <div 
                className="absolute inset-0 blur-2xl opacity-30 mix-blend-multiply soft-pulse" 
                style={{ 
                  background: 'radial-gradient(60% 60% at 30% 30%, var(--petrol), transparent 60%), radial-gradient(60% 60% at 70% 70%, var(--lastminute), transparent 60%)' 
                }}
              ></div>

              {/* Corner Badge */}
              <CornerBadge variant="lastminute">Last-Minute</CornerBadge>

              <div className="relative z-10 text-center max-w-md">
                <h2 className="text-4xl lg:text-5xl font-bold text-[var(--ink)] mb-4 leading-tight">
                  Booked by sunset
                </h2>
                <p className="text-lg text-[var(--muted)] mb-8 leading-relaxed">
                  Last-minute stays at irresistible rates.
                </p>
                <button className="bg-[var(--card)]/80 backdrop-blur-sm border border-[var(--border)] text-[var(--ink)] px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-[var(--card)] transition-all duration-300 shadow-[var(--shadow)] focus:outline-none focus:ring-4 focus:ring-[var(--ember)] group-hover:shadow-xl">
                  See Bargains
                  <ArrowRight className="w-5 h-5 inline ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DiagonalHero;
