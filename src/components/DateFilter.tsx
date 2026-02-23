import React, { useState, useEffect, useRef } from "react";
import images from "../constants/images";

export type DateFilterType = 'none' | 'period' | 'custom';

export type DateFilterState = {
  filterType: DateFilterType;
  period: string | null;
  dateFrom: string | null;
  dateTo: string | null;
};

interface DateFilterProps {
  defaultFilterType?: DateFilterType;
  defaultPeriod?: string;
  defaultDateFrom?: string | null;
  defaultDateTo?: string | null;
  timeOptions?: string[];
  onFilterChange?: (filter: DateFilterState) => void;
  className?: string;
}

const DateFilter: React.FC<DateFilterProps> = ({
  defaultFilterType = 'period',
  defaultPeriod = "All time",
  defaultDateFrom = null,
  defaultDateTo = null,
  timeOptions = [
    "Today",
    "This Week",
    "This Month",
    "Last Month",
    "This Year",
    "All time",
  ],
  onFilterChange,
  className = "",
}) => {
  const [filterType, setFilterType] = useState<DateFilterType>(defaultFilterType);
  const [period, setPeriod] = useState<string>(defaultPeriod);
  const [dateFrom, setDateFrom] = useState<string>(defaultDateFrom || '');
  const [dateTo, setDateTo] = useState<string>(defaultDateTo || '');
  const [isFilterTypeDropdownOpen, setIsFilterTypeDropdownOpen] = useState(false);
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const filterTypeDropdownRef = useRef<HTMLDivElement>(null);
  const periodDropdownRef = useRef<HTMLDivElement>(null);

  // Notify parent of filter changes
  useEffect(() => {
    if (onFilterChange) {
      const filterState: DateFilterState = {
        filterType,
        period: filterType === 'period' ? period : null,
        dateFrom: filterType === 'custom' && dateFrom ? dateFrom : null,
        dateTo: filterType === 'custom' && dateTo ? dateTo : null,
      };
      onFilterChange(filterState);
    }
  }, [filterType, period, dateFrom, dateTo, onFilterChange]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterTypeDropdownRef.current &&
        !filterTypeDropdownRef.current.contains(event.target as Node) &&
        periodDropdownRef.current &&
        !periodDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterTypeDropdownOpen(false);
        setIsPeriodDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFilterTypeChange = (type: DateFilterType) => {
    setFilterType(type);
    setIsFilterTypeDropdownOpen(false);
    // Reset values when switching filter types
    if (type === 'period') {
      setDateFrom('');
      setDateTo('');
    } else if (type === 'custom') {
      setPeriod('All time');
    }
  };

  const handlePeriodSelect = (selectedPeriod: string) => {
    setPeriod(selectedPeriod);
    setIsPeriodDropdownOpen(false);
  };

  const clearCustomDateRange = () => {
    setDateFrom('');
    setDateTo('');
  };

  // Format date for display
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    // Use flex-wrap so the filter controls stay nicely aligned and can wrap instead of breaking the layout
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Filter Type Selector */}
      <div className="relative" ref={filterTypeDropdownRef}>
        <div
          className="flex flex-row items-center justify-between border border-[#989898] rounded-lg p-2 sm:p-3 cursor-pointer w-full sm:w-auto min-w-[140px] hover:bg-gray-50 transition-colors bg-white"
          onClick={() => setIsFilterTypeDropdownOpen(!isFilterTypeDropdownOpen)}
        >
          <div className="flex items-center">
            <span className="text-xs sm:text-sm md:text-base">
              {filterType === 'none' ? 'No Filter' : filterType === 'period' ? 'Quick Period' : 'Custom Range'}
            </span>
          </div>
          <div className="flex items-center ml-2 sm:ml-5">
            <img
              src={images.dropdown}
              alt=""
              className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isFilterTypeDropdownOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>

        {isFilterTypeDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-full sm:w-[160px] bg-white border border-[#989898] rounded-lg shadow-lg z-20">
            <div
              className={`px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-100 cursor-pointer text-left text-xs sm:text-sm md:text-base first:rounded-t-lg transition-colors ${
                filterType === 'none' ? 'bg-gray-50 font-medium' : ''
              }`}
              onClick={() => handleFilterTypeChange('none')}
            >
              No Filter
            </div>
            <div
              className={`px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-100 cursor-pointer text-left text-xs sm:text-sm md:text-base transition-colors ${
                filterType === 'period' ? 'bg-gray-50 font-medium' : ''
              }`}
              onClick={() => handleFilterTypeChange('period')}
            >
              Quick Period
            </div>
            <div
              className={`px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-100 cursor-pointer text-left text-xs sm:text-sm md:text-base last:rounded-b-lg transition-colors ${
                filterType === 'custom' ? 'bg-gray-50 font-medium' : ''
              }`}
              onClick={() => handleFilterTypeChange('custom')}
            >
              Custom Range
            </div>
          </div>
        )}
      </div>

      {/* Period Selector (shown when filterType is 'period') */}
      {filterType === 'period' && (
        <div className="relative" ref={periodDropdownRef}>
          <div
            className="flex flex-row items-center justify-between border border-[#989898] rounded-lg p-2 sm:p-3 cursor-pointer w-full sm:w-auto min-w-[140px] hover:bg-gray-50 transition-colors bg-white"
            onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
          >
            <div className="flex items-center">
              <span className="text-xs sm:text-sm md:text-base">{period}</span>
            </div>
            <div className="flex items-center ml-2 sm:ml-5">
              <img
                src={images.dropdown}
                alt=""
                className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isPeriodDropdownOpen ? 'rotate-180' : ''}`}
              />
            </div>
          </div>

          {isPeriodDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-full sm:w-[140px] bg-white border border-[#989898] rounded-lg shadow-lg z-20">
              {timeOptions.map((option) => (
                <div
                  key={option}
                  className={`px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-100 cursor-pointer text-left text-xs sm:text-sm md:text-base first:rounded-t-lg last:rounded-b-lg transition-colors ${
                    period === option ? 'bg-gray-50 font-medium' : ''
                  }`}
                  onClick={() => handlePeriodSelect(option)}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Custom Date Range (shown when filterType is 'custom') */}
      {filterType === 'custom' && (
        <div className="flex flex-wrap items-end gap-2">
          <div className="relative">
            <label className="block text-xs sm:text-sm text-gray-700 mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              max={dateTo || undefined}
              className="w-[150px] sm:w-[180px] border border-[#989898] rounded-lg p-2 sm:p-3 text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent"
            />
          </div>
          <div className="relative">
            <label className="block text-xs sm:text-sm text-gray-700 mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min={dateFrom || undefined}
              className="w-[150px] sm:w-[180px] border border-[#989898] rounded-lg p-2 sm:p-3 text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#E53E3E] focus:border-transparent"
            />
          </div>
          {(dateFrom || dateTo) && (
            <div className="flex items-end">
              <button
                onClick={clearCustomDateRange}
                className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateFilter;

