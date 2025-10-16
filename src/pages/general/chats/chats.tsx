import ChatsTable from "./components/chattable";
import PageHeader from "../../../components/PageHeader";
import images from "../../../constants/images";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getChats } from "../../../utils/queries/chats";
import StatCard from "../../../components/StatCard";
import StatCardGrid from "../../../components/StatCardGrid";

type Tab = "General" | "Unread" | "Support" | "Dispute";

const Chats = () => {
  const [activeTab, setActiveTab] = useState<Tab>("General");
  const [currentPage, setCurrentPage] = useState(1);
  const tabs: Tab[] = ["General", "Unread", "Support", "Dispute"];

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch chats data
  const { data: chatsData, isLoading: isLoadingChats, error: chatsError } = useQuery({
    queryKey: ['chats', currentPage, debouncedSearch, activeTab],
    queryFn: () => getChats(currentPage, debouncedSearch || undefined, activeTab.toLowerCase() === 'general' ? undefined : activeTab.toLowerCase()),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use statistics from the main chats API response
  const statsData = chatsData;

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
    console.log("Bulk action selected in Orders:", action);
  };

  return (
    <>
      <PageHeader title="All Chats" />
      <div className="p-5">
        {isLoadingChats ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
          </div>
        ) : statsData?.data ? (
          <StatCardGrid columns={3}>
            <StatCard
              icon={images.chats}
              title="Total Chats"
              value={statsData.data.statistics?.total_chats || 0}
              subtitle="All chat conversations"
              iconBgColor="#E53E3E"
            />
            <StatCard
              icon={images.chats}
              title="Unread Chats"
              value={statsData.data.statistics?.unread_chats || 0}
              subtitle="Unread conversations"
              iconBgColor="#E53E3E"
            />
            <StatCard
              icon={images.chats}
              title="Dispute Chats"
              value={statsData.data.statistics?.dispute_chats || 0}
              subtitle="Dispute conversations"
              iconBgColor="#E53E3E"
            />
          </StatCardGrid>
        ) : (
          <div className="text-center text-red-500">
            <p className="text-sm">Error loading chat statistics</p>
          </div>
        )}

        <div className="mt-5 flex flex-row justify-between">
          <div className="flex flex-row items-center gap-2">
            <div><TabButtons /></div>

            <div className="flex flex-row items-center gap-5 border border-[#989898] rounded-lg px-4 py-3.5 bg-white cursor-pointer">
              <div>Today</div>
              <div><img className="w-3 h-3 mt-1" src={images.dropdown} alt="" /></div>
            </div>

            <div><BulkActionDropdown onActionSelect={handleBulkActionSelect} /></div>
          </div>

          {/* Debounced search */}
          <div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-12 pr-6 py-3.5 border border-[#00000080] rounded-lg text-[15px] w-[363px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-[#00000080]"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChatsTable
        title="All Chats"
        filterType={activeTab}
        searchTerm={debouncedSearch}
        chatsData={chatsData}
        isLoading={isLoadingChats}
        error={chatsError}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onRowSelect={(selectedIds) => {
          console.log("Selected chat IDs:", selectedIds);
        }}
      />
    </>
  );
};

export default Chats;
