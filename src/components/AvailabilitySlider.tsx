import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import CalendarModal from './CalendarModal';
import { Property } from '../utils/types';

interface AvailabilitySliderProps {
  property: Property;
  onDateSelection: (range: { start: Date | null; end: Date | null }) => void;
}

const AvailabilitySlider: React.FC<AvailabilitySliderProps> = ({
  property,
  onDateSelection,
}) => {
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [currentMonthLabel, setCurrentMonthLabel] = useState('');
  const [hoveredChip, setHoveredChip] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null);

  // Generate 365 days of slider data for better availability
  const generateCalendarData = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const availabilityDay = property.availability.find(a => a.date === dateString);
      const isAvailable = availabilityDay?.available ?? false;
      const isSelected = selectedRange.start && selectedRange.end && 
        date >= selectedRange.start && date <= selectedRange.end;
      const isStartDate = selectedRange.start && date.toDateString() === selectedRange.start.toDateString();
      const isEndDate = selectedRange.end && date.toDateString() === selectedRange.end.toDateString();
      const isToday = date.toDateString() === today.toDateString();
      
      days.push({
        date,
        day: date.getDate(),
        month: date.toLocaleString('default', { month: 'short' }),
        dayOfWeek: date.toLocaleString('default', { weekday: 'short' }),
        isAvailable,
        isSelected,
        isStartDate,
        isEndDate,
        isToday,
        isPast: date < today
      });
    }
    
    return days;
  };

  const [calendarData, setCalendarData] = useState(generateCalendarData());

  useEffect(() => {
    setCalendarData(generateCalendarData());
  }, [property.availability, selectedRange]);


  const handleDateClick = (date: Date) => {
    if (date < new Date()) return; // Can't select past dates
    
    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      // Start new selection
      const newRange = { start: date, end: null };
      setSelectedRange(newRange);
    } else if (selectedRange.start && !selectedRange.end) {
      // Complete selection
      const start = selectedRange.start;
      const end = date;
      
      let finalRange;
      if (end < start) {
        finalRange = { start: end, end: start };
      } else {
        // Check minimum stay requirement
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff >= property.minStay) {
          finalRange = { start, end };
        } else {
          // Show error for minimum stay not met
          finalRange = { start: date, end: null };
        }
      }
      setSelectedRange(finalRange);
      onDateSelection(finalRange);
      
      // Auto-select matching chip if it's a common duration
      if (finalRange.end) {
        const daysDiff = Math.ceil((finalRange.end.getTime() - finalRange.start.getTime()) / (1000 * 60 * 60 * 24));
        if ([30, 60, 90, 120, 150].includes(daysDiff)) {
          // The matching chip will automatically show as selected due to the isSelected logic
          console.log('auto_select_chip', { nights: daysDiff });
        }
      }
    }
  };

  // Calculate price based on selected dates
  const calculatePrice = () => {
    if (selectedRange.start && selectedRange.end) {
      const days = Math.ceil((selectedRange.end.getTime() - selectedRange.start.getTime()) / (1000 * 60 * 60 * 24));
      const months = days / 30;
      
      // Use monthly rate for longer stays, nightly rate for shorter stays
      if (days >= 30) {
        return Math.round(property.monthlyRate * months);
      } else if (property.nightlyRate) {
        return Math.round(property.nightlyRate * days);
      } else {
        // Fallback to monthly rate calculation
        return Math.round(property.monthlyRate * months);
      }
    }
    return 0;
  };

  // Calculate price for a specific date range
  const calculatePriceForRange = (start: Date, end: Date) => {
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const months = days / 30;
    
    if (days >= 30) {
      return Math.round(property.monthlyRate * months);
    } else if (property.nightlyRate) {
      return Math.round(property.nightlyRate * days);
    } else {
      return Math.round(property.monthlyRate * months);
    }
  };

  // Check if a date range is available
  const isDateRangeAvailable = (start: Date, end: Date) => {
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      const availabilityDay = property.availability.find(a => a.date === dateString);
      if (!availabilityDay?.available) {
        return false;
      }
    }
    return true;
  };

  // Generate smart chips
  const generateSmartChips = () => {
    const isMidLetOnly = property.minStay >= 30;
    
    // Helper function to format date range in human-friendly format
    const formatDateRange = (start: Date, end: Date) => {
      const startStr = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      const endStr = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      const year = end.getFullYear();
      const startYear = start.getFullYear();
      
      if (startYear === year) {
        return `${startStr} – ${endStr} ${year}`;
      } else {
        return `${startStr} ${startYear} – ${endStr} ${year}`;
      }
    };

    // 1. Next Weekend / This Weekend
    const getNextWeekend = () => {
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 5 = Friday
      
      let friday, sunday;
      
      if (dayOfWeek <= 5) { // Monday to Friday
        friday = new Date(today);
        friday.setDate(today.getDate() + (5 - dayOfWeek));
      } else { // Weekend
        friday = new Date(today);
        friday.setDate(today.getDate() + (5 - dayOfWeek + 7));
      }
      
      sunday = new Date(friday);
      sunday.setDate(friday.getDate() + 2);
      
      // Check if this weekend is still available
      const isThisWeekend = dayOfWeek >= 5 && dayOfWeek <= 6;
      const label = isThisWeekend ? 'This Weekend' : 'Next Weekend';
      
      if (isDateRangeAvailable(friday, sunday)) {
        const price = calculatePriceForRange(friday, sunday);
        return {
          label,
          subtext: `${formatDateRange(friday, sunday)} (£${price.toLocaleString()})`,
          start: friday,
          end: sunday,
          available: true
        };
      }
      
      return { label, subtext: 'Not available', available: false };
    };


    // 3. 7 Nights
    const get7Nights = () => {
      const start = selectedRange.start || new Date();
      const end = new Date(start);
      end.setDate(start.getDate() + 6); // 7 nights total
      
      if (isDateRangeAvailable(start, end)) {
        const price = calculatePriceForRange(start, end);
        return {
          label: '7 Nights',
          subtext: `${formatDateRange(start, end)} (£${price.toLocaleString()})`,
          start,
          end,
          available: true
        };
      }
      
      return { label: '7 Nights', subtext: 'Not available', available: false };
    };

    // 4. Mid-let chips (30, 60, 90, 120, 150 nights)
    const getMidLetChip = (nights: number) => {
      // Always use the selected start date as base, or find next available
      let start: Date;
      let shifted = false;
      
      if (selectedRange.start) {
        start = new Date(selectedRange.start);
      } else {
        // Find next available date that can accommodate this duration
        start = new Date();
        let found = false;
        let attempts = 0;
        
        while (!found && attempts < 365) {
          const end = new Date(start);
          end.setDate(start.getDate() + nights - 1);
          
          if (isDateRangeAvailable(start, end)) {
            found = true;
          } else {
            start.setDate(start.getDate() + 1);
            attempts++;
          }
        }
        
        if (!found) {
          return { label: `${nights} Nights`, subtext: 'Not available', available: false, start: null, end: null };
        }
      }
      
      // Check if the original start date works
      const end = new Date(start);
      end.setDate(start.getDate() + nights - 1);
      
      if (!isDateRangeAvailable(start, end)) {
        // Need to find next available date
        shifted = true;
        let found = false;
        let attempts = 0;
        
        while (!found && attempts < 365) {
          const testEnd = new Date(start);
          testEnd.setDate(start.getDate() + nights - 1);
          
          if (isDateRangeAvailable(start, testEnd)) {
            found = true;
            end.setTime(testEnd.getTime());
          } else {
            start.setDate(start.getDate() + 1);
            attempts++;
          }
        }
        
        if (!found) {
          return { label: `${nights} Nights`, subtext: 'Not available', available: false, start: null, end: null };
        }
      }
      
      let subtext;
      if (shifted) {
        subtext = `Next available: ${formatDateRange(start, end)}`;
      } else {
        subtext = formatDateRange(start, end);
      }
      
      return {
        label: `${nights} Nights`,
        subtext,
        start,
        end,
        available: true,
        shifted
      };
    };

    // Generate chips conditionally based on property type and current selection
    const allChips = [];
    
    // If we have a selection, show relevant duration chips based on current selection
    if (selectedRange.start && selectedRange.end) {
      const currentDays = Math.ceil((selectedRange.end.getTime() - selectedRange.start.getTime()) / (1000 * 60 * 60 * 24));
      
      // Show chips for common durations around the current selection
      const relevantDurations = [];
      
      if (currentDays < 30) {
        relevantDurations.push(30, 60, 90);
      } else if (currentDays < 60) {
        relevantDurations.push(60, 90, 120);
      } else if (currentDays < 90) {
        relevantDurations.push(90, 120, 150);
      } else if (currentDays < 120) {
        relevantDurations.push(120, 150);
      } else if (currentDays < 150) {
        relevantDurations.push(150);
      }
      
      // Add the current duration if it's a common one
      if ([30, 60, 90, 120, 150].includes(currentDays)) {
        relevantDurations.unshift(currentDays);
      }
      
      relevantDurations.forEach(nights => {
        const chip = getMidLetChip(nights);
        if (chip.available && chip.start && chip.end && chip.subtext) {
          allChips.push(chip);
          // Analytics: log chip_shown
          console.log('chip_shown', { nights, shifted: chip.shifted });
        }
      });
    } else {
      // No selection yet - show default chips
      if (!isMidLetOnly) {
        // For properties that allow short stays, show max 2 high-value chips
        const nextWeekend = getNextWeekend();
        const sevenNights = get7Nights();
        
        if (nextWeekend.available && nextWeekend.start && nextWeekend.end && nextWeekend.subtext) allChips.push(nextWeekend);
        if (sevenNights.available && sevenNights.start && sevenNights.end && sevenNights.subtext) allChips.push(sevenNights);
      }
      
      // Always show relevant mid-let chips when available
      const midLetChips = [30, 60, 90].map(nights => getMidLetChip(nights));
      midLetChips.forEach(chip => {
        if (chip.available && chip.start && chip.end && chip.subtext) {
          allChips.push(chip);
          // Analytics: log chip_shown
          console.log('chip_shown', { nights: parseInt(chip.label), shifted: chip.shifted });
        }
      });
    }

    return allChips;
  };

  const smartChips = useMemo(() => generateSmartChips(), [selectedRange, property.availability]);

  // Update month label based on scroll position
  const updateMonthLabel = useCallback(() => {
    if (sliderRef.current) {
      const scrollLeft = sliderRef.current.scrollLeft;
      const dayWidth = 48 + 4; // 48px width + 4px gap
      const visibleDayIndex = Math.floor(scrollLeft / dayWidth);
      
      if (visibleDayIndex >= 0 && visibleDayIndex < calendarData.length) {
        const visibleDate = calendarData[visibleDayIndex].date;
        const monthLabel = visibleDate.toLocaleDateString('en-GB', { 
          month: 'long', 
          year: 'numeric' 
        });
        setCurrentMonthLabel(monthLabel);
      }
    }
  }, [calendarData]);

  // Handle chip selection
  const handleChipClick = (chip: any) => {
    if (chip.available && chip.start && chip.end) {
      const newRange = { start: chip.start, end: chip.end };
      setSelectedRange(newRange);
      onDateSelection(newRange);
      
      // Analytics: log chip_click
      const nights = parseInt(chip.label);
      console.log('chip_click', { 
        nights, 
        shifted: chip.shifted,
        startDate: chip.start.toISOString().split('T')[0],
        endDate: chip.end.toISOString().split('T')[0]
      });
      
      if (chip.shifted) {
        // Analytics: log chip_shifted_next_available
        console.log('chip_shifted_next_available', { 
          nights, 
          originalStart: selectedRange.start?.toISOString().split('T')[0],
          newStart: chip.start.toISOString().split('T')[0]
        });
      }
    }
  };

  // Handle chip hover for preview
  const handleChipHover = (chipIndex: number | null) => {
    setHoveredChip(chipIndex);
  };

  // Handle drag-to-select functionality
  const handleMouseDown = (date: Date) => {
    setIsDragging(true);
    setDragStartDate(date);
  };

  const handleMouseEnter = (date: Date) => {
    if (isDragging && dragStartDate) {
      const start = dragStartDate < date ? dragStartDate : date;
      const end = dragStartDate < date ? date : dragStartDate;
      setSelectedRange({ start, end });
    }
  };

  const handleMouseUp = () => {
    if (isDragging && selectedRange.start && selectedRange.end) {
      onDateSelection(selectedRange);
    }
    setIsDragging(false);
    setDragStartDate(null);
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    if (sliderRef.current && !isScrolling) {
      e.preventDefault();
      setIsScrolling(true);
      sliderRef.current.scrollBy({
        left: e.deltaY > 0 ? 120 : -120,
        behavior: 'smooth'
      });
      setTimeout(() => {
        setIsScrolling(false);
        updateMonthLabel();
      }, 150);
    }
  }, [isScrolling, updateMonthLabel]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('wheel', handleWheel, { passive: false });
      return () => slider.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  const scrollCalendar = (direction: 'left' | 'right') => {
    if (sliderRef.current && !isScrolling) {
      setIsScrolling(true);
      const scrollAmount = 240; // Scroll by 3 days worth
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(() => {
        setIsScrolling(false);
        updateMonthLabel();
      }, 200);
    }
  };

  // Add scroll event listener for month label updates
  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      const handleScroll = () => updateMonthLabel();
      slider.addEventListener('scroll', handleScroll);
      return () => slider.removeEventListener('scroll', handleScroll);
    }
  }, [updateMonthLabel]);

  // Initialize month label
  useEffect(() => {
    updateMonthLabel();
  }, [updateMonthLabel]);

  // Add global mouse up event listener for drag functionality
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging]);

  const formatDateRange = () => {
    if (selectedRange.start && selectedRange.end) {
      const startStr = selectedRange.start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      const endStr = selectedRange.end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      const year = selectedRange.end.getFullYear();
      const startYear = selectedRange.start.getFullYear();
      const days = Math.ceil((selectedRange.end.getTime() - selectedRange.start.getTime()) / (1000 * 60 * 60 * 24));
      
      let dateRange;
      if (startYear === year) {
        dateRange = `${startStr} – ${endStr} ${year}`;
      } else {
        dateRange = `${startStr} ${startYear} – ${endStr} ${year}`;
      }
      
      return `${dateRange} (${days} nights)`;
    }
    return 'Select your dates';
  };

  const handleCalendarModalSelection = (range: { start: Date | null; end: Date | null }) => {
    setSelectedRange(range);
    onDateSelection(range);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-petrol/10 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Availability</h3>
            {currentMonthLabel && (
              <span className="text-sm text-gray-600 font-medium">{currentMonthLabel}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollCalendar('left')}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={isScrolling}
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => scrollCalendar('right')}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={isScrolling}
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setShowCalendarModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-petrol text-white rounded-lg hover:bg-petrol/90 transition-colors text-sm font-medium"
            >
              <Calendar className="w-4 h-4" />
              Monthly view
            </button>
          </div>
        </div>

        {/* Quick Picks Section - Single Row */}
        {smartChips.length > 0 && (
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ maxHeight: '64px' }}>
              {smartChips.map((chip, index) => {
                const isSelected = selectedRange.start && selectedRange.end && 
                  chip.start && chip.end &&
                  chip.start.getTime() === selectedRange.start.getTime() && 
                  chip.end.getTime() === selectedRange.end.getTime();
                
                const isUrgent = chip.label.includes('Weekend');
                
                return (
                  <button
                    key={index}
                    onClick={() => handleChipClick(chip)}
                    onMouseEnter={() => handleChipHover(index)}
                    onMouseLeave={() => handleChipHover(null)}
                    disabled={!chip.available}
                    className={`
                      flex-shrink-0 px-3 py-2 rounded-lg text-left transition-all duration-200 min-w-[120px] hover:scale-105
                      ${!chip.available
                        ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                        : isSelected
                        ? 'bg-petrol text-white border-petrol shadow-md'
                        : isUrgent
                        ? 'bg-orange text-white border-orange hover:bg-orange/90 cursor-pointer shadow-sm hover:shadow-md'
                        : 'bg-white border border-petrol hover:bg-petrol hover:text-white cursor-pointer shadow-sm hover:shadow-md'
                      }
                    `}
                    title={chip.subtext}
                  >
                    <div className="font-semibold text-sm leading-tight truncate">{chip.label}</div>
                    <div className={`text-xs mt-0.5 truncate ${
                      !chip.available
                        ? 'text-gray-400'
                        : isSelected || isUrgent
                        ? 'text-white/80'
                        : 'text-gray-600'
                    }`}>
                      {chip.subtext}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Range & Price Display */}
        {selectedRange.start && selectedRange.end && (
          <div className="bg-petrol/5 rounded-lg p-3 mb-4 border border-petrol/20">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-gray-900 text-sm">{formatDateRange()}</div>
              <div className="text-right">
                <div className="text-lg font-bold text-petrol">£{calculatePrice().toLocaleString()}</div>
                <div className="text-xs text-gray-600">
                  £{(calculatePrice() / Math.ceil((selectedRange.end.getTime() - selectedRange.start.getTime()) / (1000 * 60 * 60 * 24))).toFixed(1)}/night
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Date Strip */}
        <div className="relative">
          {/* Month Label */}
          {currentMonthLabel && (
            <div className="absolute top-0 left-0 z-10 bg-white px-3 py-1 rounded-b-lg border border-gray-200 shadow-sm">
              <span className="text-sm font-semibold text-gray-700">{currentMonthLabel}</span>
        </div>
          )}

        <div 
          ref={sliderRef}
            className="flex gap-1 overflow-x-auto pb-4 scrollbar-hide pt-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            {calendarData.map((dayData, dayIndex) => {
              // Determine week grouping for alternating background
              const weekNumber = Math.floor(dayIndex / 7);
              const isEvenWeek = weekNumber % 2 === 0;
              
              return (
                <div key={dayIndex} className="flex-shrink-0 relative group">
              <button
                onClick={() => handleDateClick(dayData.date)}
                    onMouseDown={() => handleMouseDown(dayData.date)}
                    onMouseEnter={() => handleMouseEnter(dayData.date)}
                    onMouseUp={handleMouseUp}
                disabled={dayData.isPast || !dayData.isAvailable}
                className={`
                      w-12 h-12 rounded-lg text-sm font-bold transition-all duration-200 flex flex-col items-center justify-center relative
                  ${dayData.isPast || !dayData.isAvailable
                        ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                        : 'cursor-pointer hover:scale-105'
                      }
                      ${dayData.isStartDate || dayData.isEndDate
                        ? 'bg-petrol text-white border-2 border-petrol shadow-lg'
                        : dayData.isSelected
                        ? 'bg-petrol text-white border-2 border-petrol'
                    : dayData.isToday
                        ? 'bg-fern text-white border-2 border-fern shadow-md'
                    : dayData.isAvailable
                        ? 'bg-green-100 text-gray-900 border border-green-300 hover:bg-green-200'
                        : 'bg-gray-200 text-gray-400'
                      }
                      ${isEvenWeek ? 'bg-opacity-50' : ''}
                      ${(() => {
                        if (hoveredChip === null) return '';
                        const chip = smartChips[hoveredChip];
                        if (chip?.start && chip?.end && dayData.date >= chip.start && dayData.date <= chip.end) {
                          return 'ring-2 ring-orange ring-opacity-50';
                        }
                        return '';
                      })()}
                    `}
                    title={`${dayData.date.toLocaleDateString('en-GB', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long' 
                    })} ${dayData.isAvailable ? `(Available, £${property.nightlyRate || Math.round(property.monthlyRate / 30)}/night)` : '(Unavailable)'}`}
                  >
                    <span className="text-xs leading-none">{dayData.day}</span>
                    {/* Selection indicator for start/end dates */}
                    {(dayData.isStartDate || dayData.isEndDate) && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border border-orange"></div>
                    )}
                    {/* Today indicator dot */}
                    {dayData.isToday && !dayData.isSelected && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange rounded-full"></div>
                    )}
              </button>
                  
                  {/* Week separator line */}
                  {dayIndex % 7 === 6 && dayIndex < calendarData.length - 1 && (
                    <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-200"></div>
                  )}
                </div>
              );
            })}
          </div>
            </div>

        {/* Scroll indicator */}
        <div className="w-full h-1 bg-gray-200 rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-petrol/30 rounded-full transition-all duration-300" style={{ width: '30%' }}></div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-petrol rounded border border-petrol"></div>
            <span className="text-xs text-gray-600">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-fern rounded border border-fern"></div>
            <span className="text-xs text-gray-600">Today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-green-100 rounded border border-green-300"></div>
            <span className="text-xs text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-gray-200 rounded"></div>
            <span className="text-xs text-gray-600">Unavailable</span>
          </div>
        </div>
      </div>

      <CalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        property={property}
        selectedRange={selectedRange}
        onDateSelection={handleCalendarModalSelection}
      />
    </>
  );
};

export default AvailabilitySlider;