import React, { useMemo, useState, useEffect } from "react";
import ChatsModel from "./chatmodel";

interface Chat {
  id: string;
  storeName: string;
  userName: string;
  lastMessage: string;
  chatDate: string;
  type: "General" | "Support" | "Dispute";
  other: string;
  isUnread?: boolean; // 👈 added to support Unread tab
}

interface ChatsTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  filterType?: "General" | "Unread" | "Support" | "Dispute";
  searchTerm?: string; // debounced
  chatsData?: any;
  isLoading?: boolean;
  error?: any;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  selectedOrderId?: string | number | null;
  onChatOpened?: () => void;
}

const ChatsTable: React.FC<ChatsTableProps> = ({
  title = "Latest chats",
  onRowSelect,
  filterType = "General",
  searchTerm = "",
  chatsData,
  isLoading = false,
  error,
  currentPage = 1,
  onPageChange,
  selectedOrderId,
  onChatOpened,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  // Transform API data to component format
  const chats: Chat[] = useMemo(() => {
    if (!chatsData?.data?.chats) return [];
    
    return chatsData.data.chats.map((chat: any) => ({
      id: chat.id.toString(),
      storeName: chat.store_info?.store_name || "Unknown Store",
      userName: chat.customer_info?.customer_name || "Unknown User",
      lastMessage: chat.last_message || "No messages yet",
      chatDate: chat.formatted_date || chat.created_at,
      type: chat.type === "general" ? "General" : chat.type === "order" ? "Support" : "Dispute",
      other: "View Chat",
      isUnread: !chat.is_read,
    }));
  }, [chatsData]);

  // Filtering by tab + searching
  const filteredChats = useMemo(() => {
    const term = (searchTerm || "").toLowerCase();

    const byTab = chats.filter((c) => {
      if (filterType === "Unread") return !!c.isUnread;
      if (filterType === "General") return c.type === "General";
      if (filterType === "Support") return c.type === "Support";
      if (filterType === "Dispute") return c.type === "Dispute";
      return true;
    });

    if (!term) return byTab;

    return byTab.filter((c) => {
      const haystack = [c.storeName, c.userName, c.lastMessage, c.chatDate, c.type].join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }, [chats, filterType, searchTerm]);

  const handleShowDetails = (chat: Chat) => {
    setSelectedChat(chat);
    setShowModal(true);
    onChatOpened?.();
  };

  // Handle automatic chat opening when selectedOrderId is provided
  useEffect(() => {
    if (selectedOrderId && filteredChats.length > 0 && !showModal) {
      console.log("Looking for chat with order ID:", selectedOrderId);
      console.log("Available chats:", filteredChats.map(chat => ({ id: chat.id, storeName: chat.storeName })));
      
      // Try to find a chat that matches the order ID
      // This might need to be adjusted based on how the API links orders to chats
      const targetChat = filteredChats.find(chat => 
        String(chat.id) === String(selectedOrderId) || 
        chat.storeName.toLowerCase().includes(String(selectedOrderId).toLowerCase())
      );
      
      if (targetChat) {
        console.log("Found target chat:", targetChat);
        setSelectedChat(targetChat);
        // Add a small delay to ensure the component is fully rendered
        setTimeout(() => {
          setShowModal(true);
          onChatOpened?.();
        }, 100);
      } else {
        console.log("Chat not found for order ID:", selectedOrderId);
        console.log("Available chats:", filteredChats);
      }
    }
  }, [selectedOrderId, filteredChats, showModal, onChatOpened]);

  // keep selection in sync with the current filtered view
  useEffect(() => {
    setSelectAll(false);
    setSelectedRows((prev) => prev.filter((id) => filteredChats.some((c) => c.id === id)));
  }, [filterType, searchTerm]); // eslint-disable-line

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
      onRowSelect?.([]);
    } else {
      const visibleIds = filteredChats.map((c) => c.id);
      setSelectedRows(visibleIds);
      onRowSelect?.(visibleIds);
    }
    setSelectAll(!selectAll);
  };

  const handleRowSelect = (chatId: string) => {
    const newSelectedRows = selectedRows.includes(chatId)
      ? selectedRows.filter((id) => id !== chatId)
      : [...selectedRows, chatId];

    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.length > 0 && newSelectedRows.length === filteredChats.length);
    onRowSelect?.(newSelectedRows);
  };

  if (isLoading) {
    return (
      <div className="border border-[#989898] rounded-2xl w-full mt-1 mb-4">
        <div className="bg-white p-5 rounded-t-2xl font-semibold text-[16px] border-b border-[#989898]">
          {title}
        </div>
        <div className="bg-white rounded-b-2xl p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-[#989898] rounded-2xl w-full mt-1 mb-4">
        <div className="bg-white p-5 rounded-t-2xl font-semibold text-[16px] border-b border-[#989898]">
          {title}
        </div>
        <div className="bg-white rounded-b-2xl p-8">
          <div className="text-center text-red-500">
            <p className="text-sm">Error loading chats</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[#989898] rounded-2xl w-full mt-1 mb-4">
      <div className="bg-white p-5 rounded-t-2xl font-semibold text-[16px] border-b border-[#989898]">
        {title}
      </div>
      <div className="bg-white rounded-b-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F2F2F2]">
            <tr>
              <th className="text-center p-3 font-semibold text-[14px] w-12">
                <input
                  type="checkbox"
                  checked={selectAll && filteredChats.length > 0 && selectedRows.length === filteredChats.length}
                  onChange={handleSelectAll}
                  className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                />
              </th>
              <th className="text-left p-3 font-normal">Store Name</th>
              <th className="text-left p-3 font-normal">User Name</th>
              <th className="text-left p-3 font-normal">Last Message</th>
              <th className="text-left p-3 font-normal">Chat Date</th>
              <th className="text-center p-3 font-normal">Type</th>
              <th className="text-center p-3 font-normal">Other</th>
            </tr>
          </thead>
          <tbody>
            {filteredChats.map((chat, index) => (
              <tr
                key={chat.id}
                className={`border-t border-[#E5E5E5] transition-colors ${index === filteredChats.length - 1 ? "" : "border-b"}`}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(chat.id)}
                    onChange={() => handleRowSelect(chat.id)}
                    className="w-5 h-5 border border-gray-300 rounded cursor-pointer text-center"
                  />
                </td>
                <td className="p-4 text-black text-left">{chat.storeName}</td>
                <td className="p-4 text-black text-left">
                  {chat.userName}
                  {chat.isUnread && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-red-500 align-middle" title="Unread" />}
                </td>
                <td className="p-4 text-black text-left">{chat.lastMessage}</td>
                <td className="p-4 text-black text-left">{chat.chatDate}</td>
                <td className="p-4 text-left">
                  <span
                    className={`px-2 py-1 rounded-md font-medium ${
                      chat.type === "Dispute"
                        ? "text-[#E53E3E]"
                        : chat.type === "Support"
                        ? "text-[#0000FF]"
                        : "text-black"
                    }`}
                  >
                    {chat.type}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleShowDetails(chat)}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                      chat.type === "Dispute"
                        ? "bg-[#F8B4B4] text-white opacity-50 cursor-not-allowed "
                        : "bg-[#E53E3E] text-white hover:bg-[#D32F2F]"
                    }`}
                    disabled={chat.type === "Dispute"}
                  >
                    View Chat
                  </button>
                </td>
              </tr>
            ))}

            {filteredChats.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-sm text-gray-500">
                  No chats found{searchTerm ? ` for “${searchTerm}”` : ""}{filterType ? ` in ${filterType}` : ""}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        {chatsData?.data?.pagination && (
          <div className="flex justify-between items-center p-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * (chatsData.data.pagination.per_page || 20)) + 1} to{" "}
              {Math.min(currentPage * (chatsData.data.pagination.per_page || 20), chatsData.data.pagination.total || 0)} of{" "}
              {chatsData.data.pagination.total || 0} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {currentPage} of {chatsData.data.pagination.last_page || 1}
              </span>
              <button
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage >= (chatsData.data.pagination.last_page || 1)}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Chat Modal */}
      <ChatsModel 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        chatData={selectedChat}
      />
    </div>
  );
};

export default ChatsTable;
