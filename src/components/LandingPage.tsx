import React from 'react';
import LandingPagePremium from './LandingPagePremium';

interface LandingPageProps {
  onChooseMidLets?: () => void;
  onChooseLastMinute?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  onChooseMidLets,
  onChooseLastMinute
}) => {
  return (
    <LandingPagePremium 
      onChooseMidLets={onChooseMidLets}
      onChooseLastMinute={onChooseLastMinute}
    />
  );
};

export default LandingPage;