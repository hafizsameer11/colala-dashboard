import React, { useState } from "react";
import images from "../constants/images";

interface LevelDropdownProps {
  onLevelSelect?: (level: string) => void;
}

const LevelDropdown: React.FC<LevelDropdownProps> = ({ onLevelSelect }) => {
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const levels = ["All", "Level 1", "Level 2", "Level 3"];

  const handleLevelDropdownToggle = () => {
    setIsLevelDropdownOpen(!isLevelDropdownOpen);
  };

  const handleLevelOptionSelect = (level: string) => {
    setSelectedLevel(level);
    setIsLevelDropdownOpen(false);

    if (onLevelSelect) {
      onLevelSelect(level);
    }

    console.log("Selected level:", level);
  };

  return (
    <div className="relative inline-block text-left">
      <div className="flex flex-row  justify-center items-center px-2.5 py-3.5 border border-[#989898] text-black bg-white rounded-lg cursor-pointer">
        <button onClick={handleLevelDropdownToggle} className="cursor-pointer">
          {selectedLevel || "Select Level"}
        </button>
        <div>
          <img className="w-4 h-4 ml-5" src={images.dropdown} alt="" />
        </div>
      </div>

      {isLevelDropdownOpen && (
        <div className="absolute z-10 mt-2 w-35 bg-white border border-gray-200 font-semibold rounded-2xl shadow-lg">
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => handleLevelOptionSelect(level)}
              className={`block w-full text-left px-4 py-2 text-sm ${
                level === "Level 3" ? "text-[#000]" : "text-black"
              } cursor-pointer `}
            >
              {level}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LevelDropdown;
