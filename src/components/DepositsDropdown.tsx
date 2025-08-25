import React, { useState } from "react";
import images from "../constants/images";

interface DepositDropdownProps {
  onActionSelect?: (action: string) => void;
}

const DepositDropdown: React.FC<DepositDropdownProps> = ({
  onActionSelect,
}) => {
  const [isDepositDropdownOpen, setIsDepositDropdownOpen] = useState(false);
  const [selectedDepositAction, setSelectedDepositAction] =
    useState("Deposit Action");

  const depositActions = ["All", "Deposits", "Withdrawals", "Payments"];

  const handleDepositDropdownToggle = () => {
    setIsDepositDropdownOpen(!isDepositDropdownOpen);
  };

  const handleDepositOptionSelect = (action: string) => {
    setSelectedDepositAction(action);
    setIsDepositDropdownOpen(false);

    // Call the parent callback if provided
    if (onActionSelect) {
      onActionSelect(action);
    }

    // Add your logic for each action here
    console.log("Selected bulk action:", action);
  };

  return (
    <div className="relative inline-block text-left">
      <div className="flex flex-row  justify-center items-center px-2.5 py-3.5 border border-[#989898] text-black bg-white rounded-lg cursor-pointer">
        <button
          onClick={handleDepositDropdownToggle}
          className="cursor-pointer"
        >
          {selectedDepositAction}
        </button>
        <div>
          <img className="ml-5" src={images.dropdown} alt="" />
        </div>
      </div>

      {isDepositDropdownOpen && (
        <div className="absolute z-10 mt-2 w-44 bg-white border border-gray-200 rounded-2xl shadow-lg">
          {depositActions.map((action) => (
            <button
              key={action}
              onClick={() => handleDepositOptionSelect(action)}
              className={`block w-full text-left px-4 py-2 text-sm ${
                action === "Delete" ? "text-[#FF0000]" : "text-black"
              } cursor-pointer `}
            >
              {action}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DepositDropdown;
