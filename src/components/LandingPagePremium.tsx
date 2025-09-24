import React from 'react';
import NavBar from './NavBar';
import DiagonalHero from './DiagonalHero';
import DecorativeBackdrop from './DecorativeBackdrop';

interface LandingPagePremiumProps {
  onChooseMidLets?: () => void;
  onChooseLastMinute?: () => void;
}

const LandingPagePremium: React.FC<LandingPagePremiumProps> = ({ 
  onChooseMidLets,
  onChooseLastMinute
}) => {
  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // TODO: Add routing to search results page
  };

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      {/* Fixed Top Nav */}
      <NavBar onSearch={handleSearch} />

      {/* Hero Section with Diagonal Split */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Decorative Background */}
        <DecorativeBackdrop />

        {/* Diagonal Hero Content */}
        <DiagonalHero 
          onChooseMidLets={onChooseMidLets}
          onChooseLastMinute={onChooseLastMinute}
        />
      </section>
    </div>
  );
};

export default LandingPagePremium;
