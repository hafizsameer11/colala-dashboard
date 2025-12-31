import React, { useState, useEffect, useRef } from "react";
import images from "../constants/images";

interface PageHeaderProps {
  title: React.ReactNode; 
  showDropdown?: boolean;
  defaultPeriod?: string;
  timeOptions?: string[];
  onPeriodChange?: (period: string) => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  showDropdown = true,
  defaultPeriod = "All time",
  timeOptions = [
    "Today",
    "This Week",
    "Last Month",
    "Last 6 Months",
    "Last Year",
    "All time",
  ],
  onPeriodChange,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(defaultPeriod);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync selectedPeriod with defaultPeriod when it changes
  useEffect(() => {
    setSelectedPeriod(defaultPeriod);
  }, [defaultPeriod]);

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleOptionSelect = (option: string) => {
    setSelectedPeriod(option);
    setIsDropdownOpen(false);

    // Call the parent callback if provided
    if (onPeriodChange) {
      onPeriodChange(option);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="pr-3 sm:pr-4 md:pr-5 pl-3 sm:pl-4 md:pl-5 bg-white border-t-1 border-b-1 border-[#787878]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 sm:pt-4 md:pt-5 pb-3 sm:pb-4 md:pb-5 gap-3 sm:gap-4">
        <div className="flex items-center w-full sm:w-auto">
          <h1 className="font-semibold text-base sm:text-lg md:text-xl lg:text-2xl w-full">{title}</h1>
        </div>

        {showDropdown && (
          <div className="relative w-full sm:w-auto flex-shrink-0" ref={dropdownRef}>
            <div
              className="flex flex-row items-center justify-between border border-[#989898] rounded-lg p-2 sm:p-3 cursor-pointer w-full sm:w-auto min-w-[140px] hover:bg-gray-50 transition-colors"
              onClick={handleDropdownToggle}
            >
              <div className="flex items-center">
                <button className="cursor-pointer text-xs sm:text-sm md:text-base">{selectedPeriod}</button>
              </div>
              <div className="flex items-center ml-2 sm:ml-5">
                <img 
                  src={images.dropdown} 
                  alt="" 
                  className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                />
              </div>
            </div>

            {isDropdownOpen && (
              <div className="absolute top-full right-0 sm:right-auto sm:left-0 mt-1 w-full sm:w-[140px] bg-white border border-[#989898] rounded-lg shadow-lg z-10">
                {timeOptions.map((option) => (
                  <div
                    key={option}
                    className={`px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-100 cursor-pointer text-left text-xs sm:text-sm md:text-base first:rounded-t-lg last:rounded-b-lg transition-colors ${
                      selectedPeriod === option ? 'bg-gray-50 font-medium' : ''
                    }`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
