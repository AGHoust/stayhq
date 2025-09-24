import { useState, useEffect } from 'react';

export interface SearchState {
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

export const useSearch = () => {
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

  const [searchMode, setSearchMode] = useState<'standard' | 'smart'>('standard');

  // Load saved search mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('searchMode') as 'standard' | 'smart' | null;
    if (savedMode) {
      setSearchMode(savedMode);
    }
  }, []);

  const updateSearchState = (updates: Partial<SearchState>) => {
    setSearchState(prev => ({ ...prev, ...updates }));
  };

  const updateSearchMode = (mode: 'standard' | 'smart') => {
    setSearchMode(mode);
    localStorage.setItem('searchMode', mode);
  };

  const validateSearch = () => {
    if (searchState.dateMode === 'exact') {
      if (!searchState.exactDates.checkIn || !searchState.exactDates.checkOut) {
        return { isValid: false, error: 'Add dates or choose Flexible' };
      }
    } else {
      if (!searchState.flexibleDates.duration) {
        return { isValid: false, error: 'Choose a stay length' };
      }
      if (!searchState.flexibleDates.month) {
        return { isValid: false, error: 'Pick a month or select Anytime' };
      }
    }
    return { isValid: true };
  };

  const getSearchParams = () => {
    return {
      destination: searchState.destination,
      dateMode: searchState.dateMode,
      exactDates: searchState.exactDates,
      flexibleDates: searchState.flexibleDates,
      guests: searchState.guests,
      filters: searchState.filters
    };
  };

  return {
    searchState,
    searchMode,
    updateSearchState,
    updateSearchMode,
    validateSearch,
    getSearchParams
  };
};
