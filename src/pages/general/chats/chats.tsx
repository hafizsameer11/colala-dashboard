import ChatsTable from "./components/chattable";
import PageHeader from "../../../components/PageHeader";
import images from "../../../constants/images";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import { useEffect, useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getChats } from "../../../utils/queries/chats";
import StatCard from "../../../components/StatCard";
import StatCardGrid from "../../../components/StatCardGrid";
import { useLocation } from "react-router-dom";
import { filterByPeriod } from "../../../utils/periodFilter";

type Tab = "General" | "Unread" | "Support" | "Dispute";

const Chats = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("General");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All time");
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const dateDropdownRef = useRef<HTMLDivElement>(null);
  const tabs: Tab[] = ["General", "Unread", "Support", "Dispute"];
  
  // Date period options
  const datePeriodOptions = [
    "Today",
    "This Week",
    "Last Month",
    "Last 6 Months",
    "Last Year",
    "All time",
  ];

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Handle navigation from orders page
  useEffect(() => {
    if (location.state?.selectedOrderId && location.state?.fromOrders) {
      console.log("Navigated from orders with order ID:", location.state.selectedOrderId);
      setSelectedOrderId(location.state.selectedOrderId);
      // Clear the state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Fetch chats data
  const { data: chatsData, isLoading: isLoadingChats, error: chatsError } = useQuery({
    queryKey: ['chats', currentPage, debouncedSearch, activeTab],
    queryFn: () => getChats(currentPage, debouncedSearch || undefined, activeTab.toLowerCase() === 'general' ? undefined : activeTab.toLowerCase()),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use statistics from the main chats API response
  const statsData = chatsData;

  const TabButtons = () => (
    <div className="flex items-center space-x-0.5 border border-[#989898] rounded-lg p-1.5 sm:p-2 w-fit bg-white overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-normal transition-all duration-200 cursor-pointer whitespace-nowrap ${
              isActive ? "px-4 sm:px-6 md:px-8 bg-[#E53E3E] text-white" : "px-2 sm:px-3 md:px-4 text-black"
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

  const handleChatOpened = () => {
    console.log("Chat opened, clearing selectedOrderId");
    setSelectedOrderId(null);
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setCurrentPage(1);
  };
  
  // Handle local date dropdown toggle
  const handleDateDropdownToggle = () => {
    setIsDateDropdownOpen(!isDateDropdownOpen);
  };
  
  // Handle local date period selection
  const handleDatePeriodSelect = (period: string) => {
    setSelectedPeriod(period);
    setIsDateDropdownOpen(false);
    setCurrentPage(1);
  };
  
  // Close date dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setIsDateDropdownOpen(false);
      }
    };

    if (isDateDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDateDropdownOpen]);

  // Transform and filter chats by period
  const allChatsRaw = chatsData?.data?.chats || [];
  
  // Transform chat data to match BulkActionDropdown interface
  const allChats = useMemo(() => {
    return allChatsRaw.map((chat: any) => ({
      id: chat.id?.toString() || '',
      store_name: chat.store_info?.store_name || 'Unknown Store',
      storeName: chat.store_info?.store_name || 'Unknown Store',
      user_name: chat.customer_info?.customer_name || 'Unknown User',
      userName: chat.customer_info?.customer_name || 'Unknown User',
      last_message: chat.last_message || 'No messages yet',
      lastMessage: chat.last_message || 'No messages yet',
      chat_date: chat.formatted_date || chat.created_at || chat.last_message_at || null,
      chatDate: chat.formatted_date || chat.created_at || chat.last_message_at || null,
      is_read: chat.is_read !== undefined ? chat.is_read : true,
      isRead: chat.is_read !== undefined ? chat.is_read : true,
      is_dispute: chat.type === 'dispute' || chat.is_dispute || false,
      isDispute: chat.type === 'dispute' || chat.is_dispute || false,
      unread_count: chat.unread_count || 0,
      unreadCount: chat.unread_count || 0,
      created_at: chat.created_at || chat.formatted_date || null,
      last_message_at: chat.last_message_at || chat.created_at || null,
    }));
  }, [allChatsRaw]);
  
  const filteredChats = useMemo(() => {
    return filterByPeriod(allChats, selectedPeriod, ['last_message_at', 'created_at', 'chat_date', 'chatDate']);
  }, [allChats, selectedPeriod]);

  return (
    <>
      <PageHeader 
        title="All Chats" 
        onPeriodChange={handlePeriodChange} 
        defaultPeriod={selectedPeriod}
        timeOptions={datePeriodOptions}
      />
      <div className="p-3 sm:p-4 md:p-5">
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

        <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
            <div className="overflow-x-auto w-full sm:w-auto"><TabButtons /></div>

            <div className="relative" ref={dateDropdownRef}>
              <div 
                className="flex flex-row items-center gap-3 sm:gap-5 border border-[#989898] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3.5 bg-white cursor-pointer text-xs sm:text-sm hover:bg-gray-50 transition-colors"
                onClick={handleDateDropdownToggle}
              >
                <div>{selectedPeriod}</div>
                <img 
                  className={`w-3 h-3 mt-1 transition-transform ${isDateDropdownOpen ? 'rotate-180' : ''}`} 
                  src={images.dropdown} 
                  alt="" 
                />
              </div>
              {isDateDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg border border-[#989898] py-2 w-44 z-50 shadow-lg">
                  {datePeriodOptions.map((option) => (
                    <div
                      key={option}
                      onClick={() => handleDatePeriodSelect(option)}
                      className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer transition-colors ${
                        selectedPeriod === option ? "bg-gray-100 font-semibold" : ""
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <BulkActionDropdown 
                onActionSelect={handleBulkActionSelect}
                orders={filteredChats}
                dataType="chats"
              />
            </div>
          </div>

          {/* Debounced search */}
          <div className="w-full sm:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-12 pr-6 py-2.5 sm:py-3.5 border border-[#00000080] rounded-lg text-sm sm:text-[15px] w-full sm:w-[280px] md:w-[363px] focus:outline-none bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] placeholder-[#00000080]"
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
        selectedOrderId={selectedOrderId}
        onChatOpened={handleChatOpened}
      />
    </>
  );
};

export default Chats;
