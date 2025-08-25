import React, { useState } from "react";

interface BulkActionDropdownProps {
  onActionSelect?: (action: string) => void;
}

const BulkActionDropdown: React.FC<BulkActionDropdownProps> = ({
  onActionSelect,
}) => {
  const [isBulkDropdownOpen, setIsBulkDropdownOpen] = useState(false);
  const [selectedBulkAction, setSelectedBulkAction] = useState("Bulk Action");

  const bulkActions = ["Export as CSV", "Export as PDF", "Delete"];

  const handleBulkDropdownToggle = () => {
    setIsBulkDropdownOpen(!isBulkDropdownOpen);
  };

  const handleBulkOptionSelect = (action: string) => {
    setSelectedBulkAction(action);
    setIsBulkDropdownOpen(false);

    // Call the parent callback if provided
    if (onActionSelect) {
      onActionSelect(action);
    }

    // Add your logic for each action here
    console.log("Selected bulk action:", action);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={handleBulkDropdownToggle}
        className="inline-flex justify-center items-center px-6 py-3.5 border border-[#989898] text-black bg-white rounded-lg cursor-pointer"
      >
        {selectedBulkAction}
      </button>

      {isBulkDropdownOpen && (
        <div className="absolute z-10 mt-2 w-38 bg-white border border-gray-200 font-semibold rounded-2xl shadow-lg">
          {bulkActions.map((action) => (
            <button
              key={action}
              onClick={() => handleBulkOptionSelect(action)}
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

export default BulkActionDropdown;
