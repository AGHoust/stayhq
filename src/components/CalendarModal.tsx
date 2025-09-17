import React, { useState, useEffect } from 'react';
import { X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Property } from '../utils/types';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  selectedRange: { start: Date | null; end: Date | null };
  onDateSelection: (range: { start: Date | null; end: Date | null }) => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  property,
  selectedRange,
  onDateSelection
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempRange, setTempRange] = useState(selectedRange);

  useEffect(() => {
    setTempRange(selectedRange);
  }, [selectedRange]);

  if (!isOpen) return null;

  const generateCalendarData = (monthOffset: number = 0) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, 1);
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfWeek = date.getDay();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let j = 0; j < firstDayOfWeek; j++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(date.getFullYear(), date.getMonth(), day);
      const dateString = dayDate.toISOString().split('T')[0];
      const availabilityDay = property.availability.find(a => a.date === dateString);
      const isAvailable = availabilityDay?.available ?? false;
      const isSelected = tempRange.start && tempRange.end && 
        dayDate >= tempRange.start && dayDate <= tempRange.end;
      const isStartDate = tempRange.start && dayDate.toDateString() === tempRange.start.toDateString();
      const isEndDate = tempRange.end && dayDate.toDateString() === tempRange.end.toDateString();
      const isToday = dayDate.toDateString() === new Date().toDateString();
      const isPast = dayDate < new Date();
      
      days.push({
        date: dayDate,
        day,
        isAvailable,
        isSelected,
        isStartDate,
        isEndDate,
        isToday,
        isPast
      });
    }
    
    return {
      month: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
      days
    };
  };

  const handleDateClick = (date: Date) => {
    if (date < new Date()) return;
    
    if (!tempRange.start || (tempRange.start && tempRange.end)) {
      setTempRange({ start: date, end: null });
    } else if (tempRange.start && !tempRange.end) {
      const start = tempRange.start;
      const end = date;
      
      if (end < start) {
        setTempRange({ start: end, end: start });
      } else {
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff >= property.minStay) {
          setTempRange({ start, end });
        } else {
          setTempRange({ start: date, end: null });
        }
      }
    }
  };

  const handleUseTheseDates = () => {
    onDateSelection(tempRange);
    onClose();
  };

  const formatDateRange = () => {
    if (tempRange.start && tempRange.end) {
      const start = tempRange.start.toLocaleDateString();
      const end = tempRange.end.toLocaleDateString();
      const days = Math.ceil((tempRange.end.getTime() - tempRange.start.getTime()) / (1000 * 60 * 60 * 24));
      return `${start} → ${end} (${days} nights)`;
    }
    return 'Select your dates';
  };

  // Calculate price based on selected dates
  const calculatePrice = () => {
    if (tempRange.start && tempRange.end) {
      const days = Math.ceil((tempRange.end.getTime() - tempRange.start.getTime()) / (1000 * 60 * 60 * 24));
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

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const currentMonthData = generateCalendarData(0);
  const nextMonthData = generateCalendarData(1);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-custom max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-petrol" />
            <div>
              <h2 className="text-xl font-bold text-ink">Select Your Dates</h2>
              <p className="text-sm text-muted">Minimum {property.minStay} nights</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-ink" />
          </button>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-ink" />
          </button>
          <div className="flex gap-8">
            <h3 className="font-semibold text-ink">{currentMonthData.month}</h3>
            <h3 className="font-semibold text-ink">{nextMonthData.month}</h3>
          </div>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-ink" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <div className="grid grid-cols-2 gap-8">
            {[currentMonthData, nextMonthData].map((monthData, monthIndex) => (
              <div key={monthIndex}>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted">
                      {day}
                    </div>
                  ))}
                  
                  {monthData.days.map((dayData, dayIndex) => (
                    <div key={dayIndex} className="p-1">
                      {dayData ? (
                        <button
                          onClick={() => handleDateClick(dayData.date)}
                          disabled={dayData.isPast || !dayData.isAvailable}
                          className={`
                            w-full h-10 rounded-lg text-sm font-bold transition-all duration-200 relative
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
                              ? 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200'
                              : 'bg-gray-200 text-gray-400'
                            }
                          `}
                        >
                          {dayData.day}
                          {/* Selection indicator for start/end dates */}
                          {(dayData.isStartDate || dayData.isEndDate) && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border border-petrol"></div>
                          )}
                        </button>
                      ) : (
                        <div className="w-full h-10"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-petrol" />
                <span className="font-semibold text-gray-900">{formatDateRange()}</span>
              </div>
              {tempRange.start && tempRange.end && (
                <div className="text-right">
                  <div className="text-xl font-bold text-petrol">£{calculatePrice().toLocaleString()}</div>
                  <div className="text-sm text-gray-600">
                    {Math.ceil((tempRange.end.getTime() - tempRange.start.getTime()) / (1000 * 60 * 60 * 24))} nights
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUseTheseDates}
                disabled={!tempRange.start || !tempRange.end}
                className="px-6 py-2 bg-petrol text-white rounded-lg font-semibold hover:bg-petrol/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                Use These Dates
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;