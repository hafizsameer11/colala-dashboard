import React, { useState } from "react";
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
  defaultPeriod = "This Week",
  timeOptions = [
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

  return (
    <div className="pr-5 pl-5 bg-white border-t-1 border-b-1 border-[#787878]">
      <div className="flex flex-row justify-between pt-5 pb-5">
        <div className="flex items-center">
          <h1 className="font-semibold text-2xl">{title}</h1>
        </div>

        {showDropdown && (
          <div className="relative">
            <div
              className="flex flex-row border border-[#989898] rounded-lg p-3 cursor-pointer"
              onClick={handleDropdownToggle}
            >
              <div className="flex items-center">
                <button className="cursor-pointer">{selectedPeriod}</button>
              </div>
              <div className="flex items-center ml-5">
                <img src={images.dropdown} alt="" />
              </div>
            </div>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-[140px] bg-white border border-[#989898] rounded-lg shadow-lg z-10">
                {timeOptions.map((option) => (
                  <div
                    key={option}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-left"
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
