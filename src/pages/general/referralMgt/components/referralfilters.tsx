import React, { useState } from "react";
import SettingsModal from "./settingsmodal";
import images from "../../../../constants/images";
import BulkActionDropdown from "../../../../components/BulkActionDropdown";
import useDebouncedValue from "../../../../hooks/useDebouncedValue";

interface ReferralFiltersProps {
  onBulkActionSelect?: (action: string) => void;
  onSearchChange?: (term: string) => void; // <- NEW
}

const ReferralFilters: React.FC<ReferralFiltersProps> = ({
  onBulkActionSelect,
  onSearchChange,
}) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState(""); // <- NEW
  const debouncedSearch = useDebouncedValue(search, 450); // <- delay (ms)

  // push debounced value up
  React.useEffect(() => {
    onSearchChange?.(debouncedSearch.trim());
  }, [debouncedSearch, onSearchChange]);

  const tabs = ["All", "Pending", "Resolved"];

  const TabButtons = () => (
    <div className="flex items-center space-x-0.5 border border-[#989898] rounded-lg p-2 w-fit bg-white">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer ${
              isActive ? "px-8 bg-[#E53E3E] text-white" : "px-4 text-black"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );

  const handleBulkActionSelect = (action: string) => {
    onBulkActionSelect?.(action);
    console.log("Bulk action selected in Referrals:", action);
  };

  return (
    <div>
      <div className="mt-5 flex flex-row justify-between items-center">
        <div className="flex flex-row gap-3">
          {/* Left side - Tab buttons */}
          <div className="flex items-center">
            <TabButtons />
          </div>

          {/* Right side - Today dropdown + Bulk Action */}
          <div className="flex flex-row items-center gap-3">
            <div className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-3.5 bg-white cursor-pointer">
              <div>Today</div>
              <div>
                <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
              </div>
            </div>

            <div>
              <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
            </div>
          </div>
        </div>

        <div className="flex flex-row gap-3">
          {/* Settings Button */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="bg-[#E53E3E] text-white px-6 py-3.5 rounded-lg  hover:bg-[#d32f2f] transition-colors font-medium cursor-pointer"
          >
            Settings
          </button>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)} // <- wire it
              className="pl-12 pr-6 py-3.5 border border-[#00000080] rounded-lg text-[15px] w-[363px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-[#00000080]"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      </div>
    </div>
  );
};

export default ReferralFilters;
