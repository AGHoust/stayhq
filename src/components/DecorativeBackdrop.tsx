import React from 'react';

interface DecorativeBackdropProps {
  className?: string;
}

const DecorativeBackdrop: React.FC<DecorativeBackdropProps> = ({ className = "" }) => {
  return (
    <div className={`absolute inset-0 ${className}`}>
      {/* Main background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface)] via-[var(--card)] to-[var(--surface)]"></div>
      
      {/* Blurred Color Blobs */}
      <div 
        className="absolute inset-0 blur-3xl opacity-40 mix-blend-multiply soft-pulse" 
        style={{ 
          background: 'radial-gradient(60% 60% at 20% 20%, var(--ember), transparent 60%), radial-gradient(60% 60% at 80% 80%, var(--fig), transparent 60%)' 
        }}
      ></div>
      
      <div 
        className="absolute inset-0 blur-3xl opacity-30 mix-blend-overlay soft-pulse" 
        style={{ 
          background: 'radial-gradient(60% 60% at 60% 40%, var(--petrol), transparent 60%), radial-gradient(60% 60% at 40% 60%, var(--lastminute), transparent 60%)' 
        }}
      ></div>

      {/* Organic Seam Overlay */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="seamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--petrol)" />
              <stop offset="50%" stopColor="var(--ember)" />
              <stop offset="100%" stopColor="var(--fig)" />
            </linearGradient>
          </defs>
          <path
            d="M0,100 Q30,60 50,50 T100,0 L100,100 Z"
            fill="url(#seamGradient)"
            opacity="0.1"
          />
        </svg>
      </div>
    </div>
  );
};

export default DecorativeBackdrop;
