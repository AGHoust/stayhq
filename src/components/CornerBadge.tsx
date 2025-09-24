import React from 'react';

interface CornerBadgeProps {
  children: React.ReactNode;
  variant?: 'midlets' | 'lastminute';
  className?: string;
}

const CornerBadge: React.FC<CornerBadgeProps> = ({ 
  children, 
  variant = 'midlets',
  className = ""
}) => {
  const variantClasses = {
    midlets: 'bg-[var(--fig)]/20 text-[var(--fig)]',
    lastminute: 'bg-[var(--petrol)]/20 text-[var(--petrol)]'
  };

  return (
    <div className={`absolute top-6 left-6 px-3 py-1 rounded-full text-sm font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

export default CornerBadge;
