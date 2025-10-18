import React, { useMemo, useState, useEffect } from "react";
import ChatsModel from "../../../../../components/chatsModel";

interface Chat {
  id: string | number;
  store_name: string;
  store_image?: string;
  user_name: string;
  last_message: string;
  last_message_time?: string;
  is_read: boolean;
  is_dispute: boolean;
  chat_date: string;
  unread_count: number;
  // Legacy fields for backward compatibility
  storeName?: string;
  userName?: string;
  lastMessage?: string;
  chatDate?: string;
  other?: string;
}

interface ChatsTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  onSelectedChatsChange?: (selectedChats: Chat[]) => void;
  searchQuery?: string;
  chats?: Chat[];
  pagination?: any;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  error?: any;
  userId?: string | number;
  selectedChatId?: string | number | null;
  onChatOpened?: () => void;
}

const ChatsTable: React.FC<ChatsTableProps> = ({
  title = "Latest Chats",
  onRowSelect,
  onSelectedChatsChange,
  searchQuery = "",
  chats = [],
  pagination = null,
  onPageChange,
  isLoading = false,
  error = null,
  userId,
  selectedChatId,
  onChatOpened,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  // Helper function to normalize chat data from API
  const normalizeChat = (chat: Chat): Chat => ({
    id: chat.id,
    store_name: chat.store_name || 'Unknown Store',
    store_image: chat.store_image,
    user_name: chat.user_name || 'Unknown User',
    last_message: chat.last_message || 'No messages',
    last_message_time: chat.last_message_time,
    is_read: chat.is_read || false,
    is_dispute: chat.is_dispute || false,
    chat_date: chat.chat_date || 'Unknown Date',
    unread_count: chat.unread_count || 0,
    // Legacy fields for backward compatibility
    storeName: chat.store_name || 'Unknown Store',
    userName: chat.user_name || 'Unknown User',
    lastMessage: chat.last_message || 'No messages',
    chatDate: chat.chat_date || 'Unknown Date',
    other: 'View Chat',
  });

  // Use real chats data or fallback to empty array
  const normalizedChats = chats.map(normalizeChat);

  // Case-insensitive filtering on multiple fields
  const filteredChats = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return normalizedChats;
    return normalizedChats.filter((c) =>
      [c.store_name, c.user_name, c.last_message, c.chat_date].some((field) =>
        field.toLowerCase().includes(q)
      )
    );
  }, [normalizedChats, searchQuery]);

  // Reset selection when the visible list changes
  useEffect(() => {
    setSelectedRows([]);
    setSelectAll(false);
  }, [searchQuery]);

  // Handle selected chat from order navigation
  useEffect(() => {
    if (selectedChatId && filteredChats.length > 0 && !showModal) {
      console.log("Looking for chat with ID:", selectedChatId);
      console.log("Available chat IDs:", filteredChats.map(chat => chat.id));
      const targetChat = filteredChats.find(chat => 
        String(chat.id) === String(selectedChatId)
      );
      
      if (targetChat) {
        console.log("Found target chat:", targetChat);
        setSelectedChat(targetChat);
        // Add a small delay to ensure the component is fully rendered
        setTimeout(() => {
          setShowModal(true);
          // Notify parent that chat was opened
          onChatOpened?.();
        }, 100);
      } else {
        console.log("Chat not found in current filtered results");
        console.log("Available chats:", filteredChats);
      }
    }
  }, [selectedChatId, filteredChats, showModal]);

  const handleShowDetails = (chat: Chat) => {
    setSelectedChat(chat);
    setShowModal(true);
  };

  const handleSelectAll = () => {
    const visibleIds = filteredChats.map((chat) => String(chat.id));
    const allSelected = visibleIds.every((id) => selectedRows.includes(id));
    const newSelection = allSelected
      ? selectedRows.filter((id) => !visibleIds.includes(id)) // unselect visible
      : Array.from(new Set([...selectedRows, ...visibleIds])); // add visible

    setSelectedRows(newSelection);
    setSelectAll(!allSelected);
    onRowSelect?.(newSelection);
    
    // Call onSelectedChatsChange with actual chat objects
    if (onSelectedChatsChange) {
      const selectedChats = filteredChats.filter(chat => 
        newSelection.includes(String(chat.id))
      );
      onSelectedChatsChange(selectedChats);
    }
  };

  const handleRowSelect = (chatId: string) => {
    const isSelected = selectedRows.includes(chatId);
    const newSelection = isSelected
      ? selectedRows.filter((id) => id !== chatId)
      : [...selectedRows, chatId];

    setSelectedRows(newSelection);
    setSelectAll(
      filteredChats.length > 0 &&
        filteredChats.every((c) => newSelection.includes(String(c.id)))
    );
    onRowSelect?.(newSelection);
    
    // Call onSelectedChatsChange with actual chat objects
    if (onSelectedChatsChange) {
      const selectedChats = filteredChats.filter(chat => 
        newSelection.includes(String(chat.id))
      );
      onSelectedChatsChange(selectedChats);
    }
  };

  return (
    <div className="border border-[#989898] rounded-2xl mt-5">
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
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                />
              </th>
              <th className="text-left p-3 font-semibold text-[14px]">
                Store Name
              </th>
              <th className="text-left p-3 font-semibold text-[14px]">
                User Name
              </th>
              <th className="text-left p-3 font-semibold text-[14px]">
                Last Message
              </th>
              <th className="text-left p-3 font-semibold text-[14px]">
                Chat Date
              </th>
              <th className="text-center p-3 font-semibold text-[14px]">
                Other
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-red-500">
                  <p className="text-sm">Error loading chats</p>
                </td>
              </tr>
            ) : (
              filteredChats.map((chat, index) => {
                const isSelected = selectedChatId && String(chat.id) === String(selectedChatId);
                return (
                <tr
                  key={chat.id}
                  className={`border-t border-[#E5E5E5] transition-colors ${
                    index === filteredChats.length - 1 ? "" : "border-b"
                  } ${isSelected ? "bg-blue-50 border-blue-200" : ""}`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(String(chat.id))}
                      onChange={() => handleRowSelect(String(chat.id))}
                      className="w-5 h-5 border border-gray-300 rounded cursor-pointer text-center"
                    />
                  </td>
                  <td className="p-4 text-[14px] text-black text-left">
                    {chat.store_name}
                  </td>
                  <td className="p-4 text-[14px] text-black text-left">
                    {chat.user_name}
                  </td>
                  <td className="p-4 text-[14px] text-black text-left">
                    {chat.last_message}
                  </td>
                  <td className="p-4 text-[14px] font-semibold text-black text-left">
                    {chat.chat_date}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleShowDetails(chat)}
                      className="bg-[#E53E3E] text-white px-6 py-2.5 rounded-lg text-[15px] font-medium hover:bg-[#D32F2F] transition-colors cursor-pointer"
                    >
                      View Chat
                    </button>
                  </td>
                </tr>
                );
              })
            )}
            {!isLoading && !error && filteredChats.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No chats found for "{searchQuery}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex justify-center items-center py-4 border-t border-[#E5E5E5]">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange?.(pagination.current_page - 1)}
              disabled={pagination.current_page <= 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-600">
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            
            <button
              onClick={() => onPageChange?.(pagination.current_page + 1)}
              disabled={pagination.current_page >= pagination.last_page}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ChatsModel 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        chatId={selectedChat?.id}
        userId={userId}
      />
    </div>
  );
};

export default ChatsTable;
