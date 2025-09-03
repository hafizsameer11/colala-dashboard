import images from "../../../constants/images";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import { useState } from "react";
import NewBanner from "../Modals/newBanner";
import NewAnnouncement from "../Modals/newAnnouncement";
import AnnouncementsTable from "./announcementTable";

const Announcements = () => {
  const [activeTab, setActiveTab] = useState("All");
  const tabs = ["All", "Text", "Banner"];
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  const handleBulkActionSelect = (action: string) => {
    // Handle the bulk action selection from the parent component
    console.log("Bulk action selected in Orders:", action);
    // Add your custom logic here
  };

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

  return (
    <>
      <div>
        <div className="mt-5 flex flex-row justify-between">
          <div className="flex flex-row items-center gap-2">
            <div>
              <TabButtons />
            </div>
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
          <div className="flex gap-2">
            <div>
              <button
                className="bg-[#000] text-white px-8 py-3.5 cursor-pointer rounded-xl"
                onClick={() => setShowBannerModal(true)}
              >
                New Banner
              </button>
            </div>
            <div>
              <button
                className="bg-[#E53E3E] text-white px-4 py-3.5 cursor-pointer rounded-xl"
                onClick={() => setShowAnnouncementModal(true)}
              >
                New Announcement
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="pl-12 pr-6 py-3.5 border border-[#00000080] rounded-lg text-[15px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-[#00000080]"
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
        <div className="mt-5">
          <AnnouncementsTable />
        </div>

        <NewBanner
          isOpen={showBannerModal}
          onClose={() => setShowBannerModal(false)}
        />
        <NewAnnouncement
          isOpen={showAnnouncementModal}
          onClose={() => setShowAnnouncementModal(false)}
        />
      </div>
    </>
  );
};

export default Announcements;
