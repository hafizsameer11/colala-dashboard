import React, { useState, useEffect } from "react";
import NewNotification from "./newnotification";
import NewBanner from "./newbanner";
import BulkActionDropdown from "../../../../components/BulkActionDropdown";
import images from "../../../../constants/images";
import useDebouncedValue from "../../../../hooks/useDebouncedValue";

interface NotificationsFiltersProps {
  onBulkActionSelect?: (action: string) => void;
  onTabChange?: (tab: string) => void;
  activeTab?: string;
  onSearchChange?: (term: string) => void; // <- NEW
}

const NotificationsFilters: React.FC<NotificationsFiltersProps> = ({
  onBulkActionSelect,
  onTabChange,
  activeTab: externalActiveTab,
  onSearchChange, // <- NEW
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState("Notification");
  const [isNewNotificationModalOpen, setIsNewNotificationModalOpen] =
    useState(false);
  const [isNewBannerModalOpen, setIsNewBannerModalOpen] = useState(false);
  const [search, setSearch] = useState(""); // <- NEW
  const debounced = useDebouncedValue(search, 450); // <- debounce delay

  useEffect(() => {
    onSearchChange?.(debounced.trim());
  }, [debounced, onSearchChange]);

  const activeTab = externalActiveTab || internalActiveTab;
  const tabs = ["Notification", "Banner"];

  const handleTabChange = (tab: string) => {
    if (!externalActiveTab) setInternalActiveTab(tab);
    onTabChange?.(tab);
  };

  const TabButtons = () => (
    <div className="flex items-center space-x-0.5 border border-[#989898] rounded-lg p-1.5 w-fit bg-white">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`py-2 px-6  rounded-lg font-normal transition-all duration-200 cursor-pointer ${
              isActive ? "bg-[#E53E3E] text-white" : "text-black"
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
    <>
      <div className=" flex flex-row justify-between">
        <div className="flex flex-row gap-2">
          <div className="flex items-center">
            <TabButtons />
          </div>

          <div className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-3.5 bg-white cursor-pointer">
            <div>Today</div>
            <div>
              <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
            </div>
          </div>

          <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
        </div>

        <div className="flex flex-row gap-2">
          <button
            onClick={() => setIsNewNotificationModalOpen(true)}
            className="bg-[#E53E3E]  text-white px-5 py-3.5 rounded-lg hover:bg-[#d32f2f] transition-colors font-medium cursor-pointer"
          >
            Notification
          </button>

          <button
            onClick={() => setIsNewBannerModalOpen(true)}
            className="bg-[#E53E3E] text-white px-5 py-3.5 rounded-lg hover:bg-[#d32f2f] transition-colors font-medium cursor-pointer"
          >
            Banner
          </button>

          {/* Search (debounced) */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
      </div>

      <NewNotification
        isOpen={isNewNotificationModalOpen}
        onClose={() => setIsNewNotificationModalOpen(false)}
        onSubmit={(data) => console.log("New notification data:", data)}
      />

      <NewBanner
        isOpen={isNewBannerModalOpen}
        onClose={() => setIsNewBannerModalOpen(false)}
        onSubmit={(data) => console.log("New banner data:", data)}
      />
    </>
  );
};

export default NotificationsFilters;
