import images from "../../../../../constants/images";
import { useState } from "react";
import BulkActionDropdown from "../../../../../components/BulkActionDropdown";
import ChatsTable from "./chatsTable";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSellerChats } from "../../../../../utils/queries/users";

const Chats = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const { storeId } = useParams<{ storeId: string }>();

  const { data: chatsPage, isLoading, error } = useQuery({
    queryKey: ['sellerChats', storeId, currentPage],
    queryFn: () => getSellerChats(storeId!, currentPage),
    enabled: !!storeId,
    staleTime: 2 * 60 * 1000,
  });

  const stats = chatsPage?.data?.statistics;
  const chats = chatsPage?.data?.chats?.data || [];
  const pagination = chatsPage?.data?.chats;

  const tabs = ["All", "Unread", "Dispute"];

  const TabButtons = () => {
    return (
      <div className="flex items-center border border-[#989898] rounded-lg p-2 w-fit bg-white">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer ${
                isActive ? "px-8 bg-[#E53E3E] text-white" : "px-8 text-black"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>
    );
  };

  const handleBulkActionSelect = (action: string) => {
    // Handle the bulk action selection from the parent component
    console.log("Bulk action selected in Orders:", action);
    // Add your custom logic here
  };

  return (
    <div>
      <div className="flex flex-row justify-between items-center">
        {/* Card 1 */}
        <div
          className="flex flex-row rounded-2xl  w-90"
          style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
        >
          <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
            <img className="w-9 h-9" src={images.cycle} alt="" />
          </div>
          <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
            <span className="font-semibold text-[15px]">{stats?.total_chats?.label || 'Total Chats'}</span>
            <span className="font-semibold text-2xl">{stats?.total_chats?.value ?? 0}</span>
            <span className="text-[#00000080] text-[13px] ">
              <span className="text-[#1DB61D]">+{stats?.total_chats?.increase ?? 0}%</span> increase from last
              month
            </span>
          </div>
        </div>

        {/* Card 2 */}

        <div
          className="flex flex-row rounded-2xl w-90"
          style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
        >
          <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
            <img className="w-9 h-9" src={images.cycle} alt="" />
          </div>
          <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
            <span className="font-semibold text-[15px]">{stats?.unread_chats?.label || 'Unread Chats'}</span>
            <span className="font-semibold text-2xl">{stats?.unread_chats?.value ?? 0}</span>
            <span className="text-[#00000080] text-[13px] ">
              <span className="text-[#1DB61D]">+{stats?.unread_chats?.increase ?? 0}%</span> increase from last
              month
            </span>
          </div>
        </div>

        {/* Card 3 */}

        <div
          className="flex flex-row rounded-2xl w-90"
          style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
        >
          <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center ">
            <img className="w-9 h-9" src={images.cycle} alt="" />
          </div>
          <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
            <span className="font-semibold text-[15px]">{stats?.dispute_chats?.label || 'Dispute'}</span>
            <span className="font-semibold text-2xl">{stats?.dispute_chats?.value ?? 0}</span>
            <span className="text-[#00000080] text-[13px] ">
              <span className="text-[#1DB61D]">+{stats?.dispute_chats?.increase ?? 0}%</span> increase from last
              month
            </span>
          </div>
        </div>
      </div>

      {/* Tab Buttons */}

      <div className="flex flex-row mt-5 justify-between">
        <div className="flex flex-row gap-5">
          <div >
            <TabButtons />
          </div>
          <div className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-2 bg-white cursor-pointer">
            <div>Today</div>
            <div>
              <img className="w-3 h-3 mt-1" src={images.dropdown} alt="" />
            </div>
          </div>
          <div>
            <BulkActionDropdown onActionSelect={handleBulkActionSelect} />
          </div>
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

<div className="mt-5" >
  <ChatsTable 
    chats={chats as any}
    isLoading={isLoading}
    error={error as any}
    pagination={pagination as any}
    onPageChange={setCurrentPage}
    userId={storeId as string}
  />
</div>

    </div>
  );
};

export default Chats;
