import React, { useState } from "react";
import NewNotification from "./newnotification";
import NewBanner from "./newbanner";
import BulkActionDropdown from "../../../../components/BulkActionDropdown";
import images from "../../../../constants/images";

interface NotificationsFiltersProps {
  onBulkActionSelect?: (action: string) => void;
  onTabChange?: (tab: string) => void;
  activeTab?: string;
}

const NotificationsFilters: React.FC<NotificationsFiltersProps> = ({
  onBulkActionSelect,
  onTabChange,
  activeTab: externalActiveTab,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState("Notification");
  const [isNewNotificationModalOpen, setIsNewNotificationModalOpen] =
    useState(false);
  const [isNewBannerModalOpen, setIsNewBannerModalOpen] = useState(false);

  const activeTab = externalActiveTab || internalActiveTab;
  const tabs = ["Notification", "Banner"];

  const handleTabChange = (tab: string) => {
    if (!externalActiveTab) {
      setInternalActiveTab(tab);
    }
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
              isActive
                ? "bg-[#E53E3E] text-white"
                : "text-black hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );

  const handleBulkActionSelect = (action: string) => {
    // Call the parent component's handler if provided
    if (onBulkActionSelect) {
      onBulkActionSelect(action);
    }
    console.log("Bulk action selected in Referrals:", action);
  };

  const handleOpenNewNotificationModal = () => {
    setIsNewNotificationModalOpen(true);
  };

  const handleCloseNewNotificationModal = () => {
    setIsNewNotificationModalOpen(false);
  };

  const handleNewNotificationSubmit = (data: any) => {
    console.log("New notification data:", data);
    // Handle the notification submission logic here
    // You can add API calls or state updates as needed
  };

  const handleOpenNewBannerModal = () => {
    setIsNewBannerModalOpen(true);
  };

  const handleCloseNewBannerModal = () => {
    setIsNewBannerModalOpen(false);
  };

  const handleNewBannerSubmit = (data: any) => {
    console.log("New banner data:", data);
    // Handle the banner submission logic here
    // You can add API calls or state updates as needed
  };

  return (
    <>
      <div className=" flex flex-row justify-between">
        <div className="flex flex-row gap-2">
          {/* Left side - Tab buttons */}
          <div className="flex items-center">
            <TabButtons />
          </div>

          {/* Middle section - Today dropdown and Bulk Action */}

          {/* Today Dropdown */}
          <div className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-3.5 bg-white cursor-pointer">
            <div>Today</div>
            <div>
              <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
            </div>
          </div>

          {/* Bulk Action Dropdown */}
          <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
        </div>

        <div className="flex flex-row gap-2">
          <div>
            <button
              onClick={handleOpenNewNotificationModal}
              className="bg-[#E53E3E]  text-white px-5 py-3.5 rounded-lg hover:bg-[#d32f2f] transition-colors font-medium cursor-pointer"
            >
              Notification
            </button>
          </div>
          <div>
            <button
              onClick={handleOpenNewBannerModal}
              className="bg-[#E53E3E] text-white px-5 py-3.5 rounded-lg hover:bg-[#d32f2f] transition-colors font-medium cursor-pointer"
            >
              Banner
            </button>
          </div>
          <div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
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
      </div>

      {/* New Notification Modal */}
      <NewNotification
        isOpen={isNewNotificationModalOpen}
        onClose={handleCloseNewNotificationModal}
        onSubmit={handleNewNotificationSubmit}
      />

      {/* New Banner Modal */}
      <NewBanner
        isOpen={isNewBannerModalOpen}
        onClose={handleCloseNewBannerModal}
        onSubmit={handleNewBannerSubmit}
      />
    </>
  );
};

export default NotificationsFilters;
