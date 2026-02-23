import images from "../../../../../constants/images";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import BulkActionDropdown from "../../../../../components/BulkActionDropdown";
import ChatsTable from "./chatsTable";
import useDebouncedValue from "../../../../../hooks/useDebouncedValue";
import { getUserChats } from "../../../../../utils/queries/users";
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ChatsProps {
  userId?: string;
  selectedChatId?: string | number | null;
  onChatOpened?: () => void;
  selectedPeriod?: string;
}

const Chats: React.FC<ChatsProps> = ({ userId, selectedChatId, onChatOpened, selectedPeriod = "All time" }) => {
  const [activeTab, setActiveTab] = useState("All");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedChats, setSelectedChats] = useState<unknown[]>([]);
  const debouncedQuery = useDebouncedValue(query, 400);

  const tabs = ["All", "Unread", "Dispute"];

  // Fetch user chats data from API
  const { data: chatsData, isLoading, error } = useQuery({
    queryKey: ['userChats', userId, currentPage, selectedPeriod],
    queryFn: () => getUserChats(userId!, currentPage, selectedPeriod),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

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

  // Filter chats based on active tab
  const filteredChats = chatsData?.data?.chats?.data?.filter((chat: unknown) => {
    const chatObj = chat as { is_read?: boolean; is_dispute?: boolean };
    switch (activeTab) {
      case "Unread": {
        return !chatObj.is_read;
      }
      case "Dispute": {
        return chatObj.is_dispute;
      }
      case "All":
      default: {
        return true;
      }
    }
  }) || [];

  const handleBulkActionSelect = (action: string) => {
    console.log("Bulk action selected in Chats:", action);
    
    if (selectedChats.length === 0) {
      alert("Please select chats to perform this action");
      return;
    }

    switch (action) {
      case "Export as CSV": {
        // Export selected chats to CSV
        const csvData = selectedChats.map((chat: unknown) => {
          const chatObj = chat as {
            id: string | number;
            store_name?: string;
            user_name?: string;
            last_message?: string;
            chat_date?: string;
            is_read?: boolean;
            is_dispute?: boolean;
            unread_count?: number;
          };
          return {
            'Chat ID': chatObj.id,
            'Store Name': chatObj.store_name || 'N/A',
            'User Name': chatObj.user_name || 'N/A',
            'Last Message': chatObj.last_message || 'N/A',
            'Chat Date': chatObj.chat_date || 'N/A',
            'Is Read': chatObj.is_read ? 'Yes' : 'No',
            'Is Dispute': chatObj.is_dispute ? 'Yes' : 'No',
            'Unread Count': chatObj.unread_count || 0
          };
        });
        
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `chats_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        break;
      }
        
      case "Export as PDF": {
        // Export selected chats to PDF
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Chats Report', 14, 22);
        
        const headers = ['Chat ID', 'Store Name', 'User Name', 'Last Message', 'Chat Date', 'Is Read', 'Is Dispute'];
        const tableData = selectedChats.map((chat: unknown) => {
          const chatObj = chat as {
            id: string | number;
            store_name?: string;
            user_name?: string;
            last_message?: string;
            chat_date?: string;
            is_read?: boolean;
            is_dispute?: boolean;
          };
          return [
            chatObj.id,
            chatObj.store_name || 'N/A',
            chatObj.user_name || 'N/A',
            chatObj.last_message || 'N/A',
            chatObj.chat_date || 'N/A',
            chatObj.is_read ? 'Yes' : 'No',
            chatObj.is_dispute ? 'Yes' : 'No'
          ];
        });
        
        (doc as unknown as { autoTable: (options: unknown) => void }).autoTable({
          head: [headers],
          body: tableData,
          startY: 30,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [229, 62, 62] }
        });
        
        doc.save(`chats_${new Date().toISOString().split('T')[0]}.pdf`);
        break;
      }
        
      case "Delete": {
        if (confirm(`Are you sure you want to delete ${selectedChats.length} chat(s)?`)) {
          console.log("Deleting chats:", selectedChats);
          // Add delete logic here
        }
        break;
      }
        
      default: {
        console.log("Unknown action:", action);
      }
    }
  };

  const handleSelectedChatsChange = (chats: unknown[]) => {
    setSelectedChats(chats);
  };

  // Handle selected chat from order navigation
  useEffect(() => {
    if (selectedChatId) {
      console.log("Selected chat ID from order:", selectedChatId);
      // You can add logic here to scroll to or highlight the specific chat
      // For now, we'll just log it and the ChatsTable can handle the highlighting
    }
  }, [selectedChatId]);

  return (
    <div>
      {/* Statistics Cards */}
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-32">
          <div className="text-red-500 text-center">
            <p className="text-sm">Error loading chat statistics</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-row justify-between items-center">
          {/* Total Chats Card */}
          <div
            className="flex flex-row rounded-2xl w-90"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center">
              <img className="w-9 h-9" src={images.cycle} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">
                {chatsData?.data?.statistics?.total_chats?.label || 'Total Chats'}
              </span>
              <span className="font-semibold text-2xl">
                {chatsData?.data?.statistics?.total_chats?.value || 0}
              </span>
              <span className="text-[#00000080] text-[13px]">
                <span className="text-[#1DB61D]">
                  +{chatsData?.data?.statistics?.total_chats?.increase || 0}%
                </span>{" "}
                increase from last month
              </span>
            </div>
          </div>

          {/* Unread Chats Card */}
          <div
            className="flex flex-row rounded-2xl w-90"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center">
              <img className="w-9 h-9" src={images.cycle} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">
                {chatsData?.data?.statistics?.unread_chats?.label || 'Unread Chats'}
              </span>
              <span className="font-semibold text-2xl">
                {chatsData?.data?.statistics?.unread_chats?.value || 0}
              </span>
              <span className="text-[#00000080] text-[13px]">
                <span className="text-[#1DB61D]">
                  +{chatsData?.data?.statistics?.unread_chats?.increase || 0}%
                </span>{" "}
                increase from last month
              </span>
            </div>
          </div>

          {/* Dispute Chats Card */}
          <div
            className="flex flex-row rounded-2xl w-90"
            style={{ boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="bg-[#E53E3E] rounded-l-2xl p-7 flex justify-center items-center">
              <img className="w-9 h-9" src={images.cycle} alt="" />
            </div>
            <div className="flex flex-col bg-[#FFF1F1] rounded-r-2xl p-3 pr-11 gap-1">
              <span className="font-semibold text-[15px]">
                {chatsData?.data?.statistics?.dispute_chats?.label || 'Dispute'}
              </span>
              <span className="font-semibold text-2xl">
                {chatsData?.data?.statistics?.dispute_chats?.value || 0}
              </span>
              <span className="text-[#00000080] text-[13px]">
                <span className="text-[#1DB61D]">
                  +{chatsData?.data?.statistics?.dispute_chats?.increase || 0}%
                </span>{" "}
                increase from last month
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Buttons */}

      <div className="flex flex-row mt-5 justify-between">
        <div className="flex flex-row gap-5">
          <div>
            <TabButtons />
          </div>
          <div>
            <BulkActionDropdown 
              onActionSelect={handleBulkActionSelect}
              selectedOrders={selectedChats}
              orders={filteredChats}
              dataType="chats"
              exportConfig={{
                dataType: "chats",
                userId: userId,
                status: activeTab !== "All" ? activeTab : undefined,
                period: selectedPeriod !== "All time" ? selectedPeriod : undefined,
                search: debouncedQuery?.trim() || undefined,
              }}
            />
          </div>
        </div>

        <div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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

      <div className="mt-5">
        <ChatsTable 
          searchQuery={debouncedQuery}
          chats={filteredChats}
          pagination={chatsData?.data?.pagination || null}
          onPageChange={setCurrentPage}
          isLoading={isLoading}
          error={error}
          userId={userId}
          onSelectedChatsChange={handleSelectedChatsChange}
          selectedChatId={selectedChatId}
          onChatOpened={onChatOpened}
        />
      </div>
    </div>
  );
};

export default Chats;
