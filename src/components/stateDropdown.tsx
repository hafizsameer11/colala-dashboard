import React, { useState, useEffect, useRef } from "react";
import images from "../constants/images";

interface StateDropdownProps {
  onStateSelect?: (state: string) => void;
}

const StateDropdown: React.FC<StateDropdownProps> = ({ onStateSelect }) => {
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<string>("All");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const states = ["All", "Lagos", "Abuja", "Kano", "Rivers"];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsStateDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleStateDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Dropdown toggle clicked, current state:", isStateDropdownOpen);
    setIsStateDropdownOpen(!isStateDropdownOpen);
  };

  const handleStateOptionSelect = (state: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("State option selected:", state);
    setSelectedState(state);
    setIsStateDropdownOpen(false);

    if (onStateSelect) {
      onStateSelect(state);
    }

    console.log("Selected state:", state);
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <div
        onClick={(e) => handleStateDropdownToggle(e)}
        className="flex flex-row justify-center items-center px-2.5 py-3.5 border border-[#989898] text-black bg-white rounded-lg cursor-pointer"
      >
        <span className="cursor-pointer">State</span>
        <div>
          <img className="w-4 h-4 ml-10" src={images.dropdown} alt="" />
        </div>
      </div>

      {isStateDropdownOpen && (
        <div className="absolute z-[60] mt-2 w-full min-w-[120px] bg-white border border-gray-200 font-semibold rounded-lg shadow-lg">
          {states.map((state) => (
            <button
              key={state}
              onClick={(e) => handleStateOptionSelect(state, e)}
              className={`block w-full text-left px-4 py-2 text-sm ${
                state === "Kano" ? "text-[#000]" : "text-black"
              } hover:bg-gray-100 cursor-pointer first:rounded-t-lg last:rounded-b-lg`}
            >
              {state}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StateDropdown;
