import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Calendar, Users, ChevronDown } from 'lucide-react';
import { useListings } from '@/lib/listings';

interface SearchState {
  destination: string;
  dateMode: 'exact' | 'flexible';
  exactDates: {
    checkIn: string;
    checkOut: string;
  };
  flexibleDates: {
    duration: string;
    month: string;
    isWorkStay: boolean;
  };
  guests: {
    adults: number;
    children: number;
    infants: number;
    pets: number;
  };
  showMoreFilters: boolean;
  filters: {
    priceRange: [number, number];
    propertyType: string[];
    petFriendly: boolean;
    workspace: boolean;
    pool: boolean;
  };
}

interface AdvancedSearchBarProps {
  onSearch: (searchParams: any) => void;
  onSmartSearch: (searchParams: any) => void;
  onInspirationMode: () => void;
}

const AdvancedSearchBar: React.FC<AdvancedSearchBarProps> = ({ onSearch, onSmartSearch, onInspirationMode }) => {
  const [searchMode, setSearchMode] = useState<'standard' | 'smart'>('standard');
  const [searchState, setSearchState] = useState<SearchState>({
    destination: '',
    dateMode: 'exact',
    exactDates: {
      checkIn: '',
      checkOut: ''
    },
    flexibleDates: {
      duration: '',
      month: '',
      isWorkStay: false
    },
    guests: {
      adults: 2,
      children: 0,
      infants: 0,
      pets: 0
    },
    showMoreFilters: false,
    filters: {
      priceRange: [0, 5000],
      propertyType: [],
      petFriendly: false,
      workspace: false,
      pool: false
    }
  });
  const [smartSearchPhrase, setSmartSearchPhrase] = useState('');
  const [parsedChips, setParsedChips] = useState<Array<{type: string, value: string, label: string}>>([]);

  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [showGuestPopover, setShowGuestPopover] = useState(false);
  const [showFlexibleOptions, setShowFlexibleOptions] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const destinationRef = useRef<HTMLInputElement>(null);
  const guestRef = useRef<HTMLDivElement>(null);
  const flexibleRef = useRef<HTMLDivElement>(null);

  // Duration options for flexible dates
  const durationOptions = [
    { value: 'weekend', label: 'Weekend Break', nights: 2 },
    { value: '3-4', label: '3–4 nights', nights: 3 },
    { value: '7', label: '1 week', nights: 7 },
    { value: '14', label: '2 weeks', nights: 14 },
    { value: '30', label: '1 month', nights: 30 }
  ];

  const monthOptions = [
    { value: 'anytime', label: 'Anytime' },
    { value: 'jan', label: 'Jan' },
    { value: 'feb', label: 'Feb' },
    { value: 'mar', label: 'Mar' },
    { value: 'apr', label: 'Apr' },
    { value: 'may', label: 'May' },
    { value: 'jun', label: 'Jun' },
    { value: 'jul', label: 'Jul' },
    { value: 'aug', label: 'Aug' },
    { value: 'sep', label: 'Sep' },
    { value: 'oct', label: 'Oct' },
    { value: 'nov', label: 'Nov' },
    { value: 'dec', label: 'Dec' }
  ];

  // Debounced destination search
  const [destinationQuery, setDestinationQuery] = useState('');
  const [destinationResults, setDestinationResults] = useState<string[]>([]);

  // Get available cities from listings
  const { items: allListings } = useListings({ page: 1, pageSize: 1000 });
  const availableCities = Array.from(new Set(allListings.map(listing => listing.city)));

  // Load saved search mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('searchMode') as 'standard' | 'smart' | null;
    if (savedMode) {
      setSearchMode(savedMode);
    }
  }, []);

  // Debounced destination search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (destinationQuery.length > 0) {
        const results = availableCities
          .filter(city => city.toLowerCase().includes(destinationQuery.toLowerCase()))
          .slice(0, 10); // Show more results
        setDestinationResults(results);
        // Only show dropdown if input is focused
        if (showDestinationDropdown) {
          setShowDestinationDropdown(true);
        }
      } else {
        // Show all available cities when input is empty
        setDestinationResults(availableCities);
        // Only show dropdown if input is focused
        if (showDestinationDropdown) {
          setShowDestinationDropdown(true);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [destinationQuery, availableCities, showDestinationDropdown]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (guestRef.current && !guestRef.current.contains(event.target as Node)) {
        setShowGuestPopover(false);
      }
      if (flexibleRef.current && !flexibleRef.current.contains(event.target as Node)) {
        setShowFlexibleOptions(false);
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDestinationChange = (value: string) => {
    setSearchState(prev => ({ ...prev, destination: value }));
    setDestinationQuery(value);
    setErrorMessage('');
  };

  const handleDestinationSelect = (city: string) => {
    setSearchState(prev => ({ ...prev, destination: city }));
    setDestinationQuery(city);
    setShowDestinationDropdown(false);
  };

  const handleFlexibleToggle = () => {
    setShowFlexibleOptions(!showFlexibleOptions);
    if (!showFlexibleOptions) {
      setSearchState(prev => ({ ...prev, dateMode: 'flexible' }));
    } else {
      setSearchState(prev => ({ ...prev, dateMode: 'exact' }));
    }
  };

  const handleModeSwitch = (mode: 'standard' | 'smart') => {
    setSearchMode(mode);
    setErrorMessage('');
    // Persist mode in localStorage
    localStorage.setItem('searchMode', mode);
  };

  const parseSmartSearch = (phrase: string) => {
    const chips: Array<{type: string, value: string, label: string}> = [];
    
    // Simple parsing logic - in real app this would be more sophisticated
    const lowerPhrase = phrase.toLowerCase();
    
    // Extract destination (cities)
    const cities = ['london', 'paris', 'dublin', 'edinburgh', 'lisbon', 'sydney', 'auckland'];
    const foundCity = cities.find(city => lowerPhrase.includes(city));
    if (foundCity) {
      chips.push({
        type: 'destination',
        value: foundCity,
        label: foundCity.charAt(0).toUpperCase() + foundCity.slice(1)
      });
    }
    
    // Extract duration
    if (lowerPhrase.includes('weekend')) {
      chips.push({ type: 'duration', value: 'weekend', label: 'Weekend' });
    } else if (lowerPhrase.includes('week')) {
      chips.push({ type: 'duration', value: '7', label: '1 week' });
    } else if (lowerPhrase.includes('month')) {
      chips.push({ type: 'duration', value: '30', label: '1 month' });
    }
    
    // Extract price
    const priceMatch = phrase.match(/under £?(\d+)|≤ £?(\d+)|less than £?(\d+)/i);
    if (priceMatch) {
      const price = priceMatch[1] || priceMatch[2] || priceMatch[3];
      chips.push({ type: 'price', value: price, label: `≤ £${price}/night` });
    }
    
    // Extract POI
    if (lowerPhrase.includes('big ben')) {
      chips.push({ type: 'poi', value: 'big ben', label: 'Near Big Ben' });
    }
    
    // Default guests
    chips.push({ type: 'guests', value: '2', label: '2 guests' });
    
    return chips;
  };

  const handleSmartSearchSubmit = () => {
    if (!smartSearchPhrase.trim()) {
      setErrorMessage('Describe your ideal stay...');
      return;
    }
    
    const chips = parseSmartSearch(smartSearchPhrase);
    setParsedChips(chips);
    
    // Convert chips back to search params
    const searchParams = {
      phrase: smartSearchPhrase,
      chips: chips,
      destination: chips.find(c => c.type === 'destination')?.value || '',
      dateMode: 'flexible',
      exactDates: { checkIn: '', checkOut: '' },
      flexibleDates: {
        duration: chips.find(c => c.type === 'duration')?.value || '',
        month: 'anytime'
      },
      guests: {
        adults: parseInt(chips.find(c => c.type === 'guests')?.value || '2'),
        children: 0,
        infants: 0,
        pets: 0
      },
      filters: {
        priceRange: chips.find(c => c.type === 'price') ? [0, parseInt(chips.find(c => c.type === 'price')?.value || '5000')] : [0, 5000],
        propertyType: [],
        petFriendly: false,
        workspace: false,
        pool: false
      }
    };
    
    onSmartSearch(searchParams);
  };

  const handleDurationSelect = (duration: string) => {
    setSearchState(prev => ({
      ...prev,
      flexibleDates: { ...prev.flexibleDates, duration }
    }));
  };

  const handleMonthSelect = (month: string) => {
    setSearchState(prev => ({
      ...prev,
      flexibleDates: { ...prev.flexibleDates, month }
    }));
  };


  const handleGuestChange = (type: keyof SearchState['guests'], delta: number) => {
    setSearchState(prev => ({
      ...prev,
      guests: {
        ...prev.guests,
        [type]: Math.max(0, Math.min(prev.guests[type] + delta, type === 'adults' ? 12 : 5))
      }
    }));
  };

  const getGuestSummary = () => {
    const { adults, children, infants, pets } = searchState.guests;
    const totalGuests = adults + children + infants;
    let summary = `${totalGuests} guest${totalGuests !== 1 ? 's' : ''}`;
    if (pets > 0) {
      summary += `, ${pets} pet${pets !== 1 ? 's' : ''}`;
    }
    return summary;
  };

  const validateSearch = () => {
    if (searchState.dateMode === 'exact') {
      if (!searchState.exactDates.checkIn || !searchState.exactDates.checkOut) {
        setErrorMessage('Add dates or choose Flexible');
        return false;
      }
    } else {
      if (!searchState.flexibleDates.duration) {
        setErrorMessage('Choose a stay length');
        return false;
      }
      if (!searchState.flexibleDates.month) {
        setErrorMessage('Pick a month or select Anytime');
        return false;
      }
    }
    return true;
  };

  const handleSearch = () => {
    if (!validateSearch()) return;

    const searchParams = {
      destination: searchState.destination,
      dateMode: searchState.dateMode,
      exactDates: searchState.exactDates,
      flexibleDates: searchState.flexibleDates,
      guests: searchState.guests,
      filters: searchState.filters
    };

    console.log('🔍 Search Bar: Sending search params:', searchParams);


    // If no destination, trigger inspiration mode
    if (!searchState.destination.trim()) {
      onInspirationMode();
    } else {
      onSearch(searchParams);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 max-w-4xl mx-auto">
      {/* Header with mode toggle */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-ink">Search</h2>
        {searchMode === 'standard' ? (
          <button
            onClick={() => handleModeSwitch('smart')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-petrol hover:bg-petrol/10 rounded-lg transition-colors border border-petrol/30"
          >
            <span className="text-lg">✨</span>
            Try Smart Search
          </button>
        ) : (
          <button
            onClick={() => handleModeSwitch('standard')}
            className="text-sm font-medium text-petrol hover:underline transition-colors"
          >
            Switch to Standard
          </button>
        )}
      </div>

      {/* Search Controls */}
      {searchMode === 'standard' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Destination */}
          <div className="relative">
            <label className="block text-xs font-medium text-ink mb-2">Where to?</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-petrol w-4 h-4" />
              <input
                ref={destinationRef}
                type="text"
                value={searchState.destination}
                onChange={(e) => handleDestinationChange(e.target.value)}
                onKeyPress={handleKeyPress}
                onClick={() => setShowDestinationDropdown(true)}
                onFocus={() => setShowDestinationDropdown(true)}
                placeholder="Search destinations"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-1 focus:ring-petrol/20 focus:border-petrol transition-all duration-200 bg-white text-sm"
              />
            </div>
            
            {/* Destination Dropdown */}
            {showDestinationDropdown && destinationResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-0.5 bg-white border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                {destinationResults.map((city) => (
                  <button
                    key={city}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDestinationSelect(city);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-petrol/5 transition-colors flex items-center text-sm"
                  >
                    <MapPin className="w-3 h-3 mr-2 text-petrol" />
                    <span className="text-ink">{city}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Check-in */}
          <div className="relative">
            <label className="block text-xs font-medium text-ink mb-2">Check-in</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-petrol w-4 h-4" />
              <input
                type="date"
                value={searchState.exactDates.checkIn}
                onChange={(e) => setSearchState(prev => ({
                  ...prev,
                  exactDates: { ...prev.exactDates, checkIn: e.target.value }
                }))}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-1 focus:ring-petrol/20 focus:border-petrol transition-all duration-200 bg-white text-sm cursor-pointer"
              />
            </div>
          </div>

          {/* Check-out */}
          <div className="relative">
            <label className="block text-xs font-medium text-ink mb-2">Check-out</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-petrol w-4 h-4" />
              <input
                type="date"
                value={searchState.exactDates.checkOut}
                onChange={(e) => setSearchState(prev => ({
                  ...prev,
                  exactDates: { ...prev.exactDates, checkOut: e.target.value }
                }))}
                min={searchState.exactDates.checkIn}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-1 focus:ring-petrol/20 focus:border-petrol transition-all duration-200 bg-white text-sm cursor-pointer"
              />
            </div>
            {/* I'm flexible button under dates */}
            <button
              onClick={handleFlexibleToggle}
              className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                showFlexibleOptions 
                  ? 'bg-petrol text-white shadow-lg' 
                  : 'bg-petrol/10 text-petrol hover:bg-petrol/20 border border-petrol/30'
              }`}
            >
              {showFlexibleOptions ? '✓ Flexible dates' : 'I\'m flexible'}
            </button>
            
            {/* Flexible Options Dropdown */}
            {showFlexibleOptions && (
              <div ref={flexibleRef} className="absolute top-full left-0 mt-2 bg-white border border-petrol/20 rounded-xl shadow-2xl z-[100] p-4 w-80 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {/* Duration Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-2">How long?</label>
                    <div className="grid grid-cols-1 gap-1">
                      {durationOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleDurationSelect(option.value)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            searchState.flexibleDates.duration === option.value
                              ? 'bg-petrol text-white shadow-lg'
                              : 'bg-gray-50 text-ink hover:bg-petrol/10 hover:border-petrol/30 border border-transparent'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Month Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-2">When?</label>
                    <div className="grid grid-cols-3 gap-1">
                      {monthOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleMonthSelect(option.value)}
                          className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                            searchState.flexibleDates.month === option.value
                              ? 'bg-petrol text-white shadow-lg'
                              : 'bg-gray-50 text-ink hover:bg-petrol/10 hover:border-petrol/30 border border-transparent'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Close button */}
                  <div className="pt-2 border-t border-gray-100">
                    <button
                      onClick={() => setShowFlexibleOptions(false)}
                      className="w-full px-3 py-2 text-sm font-medium text-petrol hover:bg-petrol/5 rounded-lg transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Guests */}
          <div className="relative" ref={guestRef}>
            <label className="block text-xs font-medium text-ink mb-2">Who?</label>
            <button
              onClick={() => setShowGuestPopover(!showGuestPopover)}
              className="w-full flex items-center justify-between px-3 py-3 border border-border rounded-lg hover:border-petrol transition-all duration-200 bg-white text-sm"
            >
              <div className="flex items-center">
                <Users className="w-4 h-4 text-petrol mr-2" />
                <span className="text-ink font-medium">{getGuestSummary()}</span>
              </div>
              <ChevronDown className="w-3 h-3 text-petrol" />
            </button>

            {/* Guest Popover */}
            {showGuestPopover && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg p-4 z-50">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-ink text-sm">Adults</div>
                      <div className="text-xs text-muted">Ages 13+</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleGuestChange('adults', -1)}
                        disabled={searchState.guests.adults <= 1}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-petrol transition-colors text-sm"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-medium text-ink text-sm">{searchState.guests.adults}</span>
                      <button
                        onClick={() => handleGuestChange('adults', 1)}
                        disabled={searchState.guests.adults >= 12}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-petrol transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-ink text-sm">Children</div>
                      <div className="text-xs text-muted">Ages 2-12</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleGuestChange('children', -1)}
                        disabled={searchState.guests.children <= 0}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-petrol transition-colors text-sm"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-medium text-ink text-sm">{searchState.guests.children}</span>
                      <button
                        onClick={() => handleGuestChange('children', 1)}
                        disabled={searchState.guests.children >= 5}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-petrol transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-ink text-sm">Infants</div>
                      <div className="text-xs text-muted">Under 2</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleGuestChange('infants', -1)}
                        disabled={searchState.guests.infants <= 0}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-petrol transition-colors text-sm"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-medium text-ink text-sm">{searchState.guests.infants}</span>
                      <button
                        onClick={() => handleGuestChange('infants', 1)}
                        disabled={searchState.guests.infants >= 5}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-petrol transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-ink text-sm">Pets</div>
                      <div className="text-xs text-muted">Bringing a service animal?</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleGuestChange('pets', -1)}
                        disabled={searchState.guests.pets <= 0}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-petrol transition-colors text-sm"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-medium text-ink text-sm">{searchState.guests.pets}</span>
                      <button
                        onClick={() => handleGuestChange('pets', 1)}
                        disabled={searchState.guests.pets >= 2}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-petrol transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Smart Search Mode */
        <div className="mb-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-ink mb-2">Smart Search</label>
            <div className="relative">
              <textarea
                value={smartSearchPhrase}
                onChange={(e) => setSmartSearchPhrase(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSmartSearchSubmit();
                  }
                }}
                placeholder="Describe your stay… e.g. 'Weekend in London near Big Ben under £150'"
                className="w-full h-24 p-4 border border-border rounded-xl focus:ring-2 focus:ring-petrol/20 focus:border-petrol transition-all duration-200 bg-white text-sm resize-none"
              />
            </div>
            <p className="mt-2 text-xs text-muted">
              We'll turn your phrase into destination, dates and budget.
            </p>
          </div>
          
          {/* Parsed Chips */}
          {parsedChips.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-ink mb-2">We set:</p>
              <div className="flex flex-wrap gap-2">
                {parsedChips.map((chip, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-petrol/10 text-petrol rounded-full text-sm font-medium"
                  >
                    <span>{chip.label}</span>
                    <button
                      onClick={() => {
                        // Remove chip
                        setParsedChips(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="ml-1 hover:bg-petrol/20 rounded-full p-0.5"
                    >
                      <span className="text-xs">✎</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Search Button and Helper Text */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {!searchState.destination && (searchState.exactDates.checkIn || searchState.exactDates.checkOut) && (
            <button
              onClick={onInspirationMode}
              className="text-petrol text-xs font-medium hover:underline transition-colors"
            >
              Skip destination – show top rated for these dates
            </button>
          )}
        </div>
        
        <button
          onClick={searchMode === 'standard' ? handleSearch : handleSmartSearchSubmit}
          className="bg-petrol text-white px-8 py-3 rounded-lg font-semibold hover:bg-petrol/90 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>

      {/* More Filters (Collapsed) - Only show in Standard mode */}
      {searchMode === 'standard' && (
        <div className="mt-4 pt-4 border-t border-border/30">
        <button
          onClick={() => setSearchState(prev => ({ ...prev, showMoreFilters: !prev.showMoreFilters }))}
          className="text-muted text-xs font-medium hover:text-ink transition-colors"
        >
          More filters
        </button>
        
        {searchState.showMoreFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink mb-2">Price range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-petrol/20 focus:border-petrol transition-all duration-200 text-sm"
                />
                <span className="text-muted text-sm">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-petrol/20 focus:border-petrol transition-all duration-200 text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-ink mb-2">Property type</label>
              <select className="w-full px-3 py-2 border border-border rounded-lg focus:ring-1 focus:ring-petrol/20 focus:border-petrol transition-all duration-200 text-sm">
                <option>Any type</option>
                <option>Apartment</option>
                <option>House</option>
                <option>Studio</option>
              </select>
            </div>
          </div>
        )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchBar;
