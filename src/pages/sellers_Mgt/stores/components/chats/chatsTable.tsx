import React, { useMemo, useState } from "react";
import ChatsModel from "../../../Modals/chatsModel";

interface ChatUi {
  id: string;
  storeName: string;
  userName: string;
  lastMessage: string;
  chatDate: string;
}

export interface OrdersTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  chats?: any[];
  isLoading?: boolean;
  error?: any;
  pagination?: any;
  onPageChange?: (page: number) => void;
  userId?: string;
}

const ChatsTable: React.FC<OrdersTableProps> = ({
  title = "Latest Chats",
  onRowSelect,
  chats = [],
  isLoading = false,
  error,
  pagination,
  onPageChange,
  userId,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedChat, setSelectedChat] = useState<ChatUi | null>(null);

  const normalizedChats: ChatUi[] = useMemo(() => {
    return (chats || []).map((c: any) => ({
      id: String(c.id),
      storeName: c.store_name || 'N/A',
      userName: c.customer_name || 'N/A',
      lastMessage: typeof c.last_message === 'object' ? (c.last_message?.message || 'N/A') : (c.last_message || 'N/A'),
      chatDate: c.updated_at || c.created_at || 'N/A',
    }));
  }, [chats]);

  const handleShowDetails = (chat: Chat) => {
    setSelectedChat(chat);
    setShowModal(true);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(normalizedChats.map((chat) => chat.id));
    }
    setSelectAll(!selectAll);

    if (onRowSelect) {
      onRowSelect(selectAll ? [] : normalizedChats.map((chat) => chat.id));
    }
  };

  const handleRowSelect = (chatId: string) => {
    let newSelectedRows;
    if (selectedRows.includes(chatId)) {
      newSelectedRows = selectedRows.filter((id) => id !== chatId);
    } else {
      newSelectedRows = [...selectedRows, chatId];
    }

    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.length === normalizedChats.length);

    if (onRowSelect) {
      onRowSelect(newSelectedRows);
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
              <tr><td colSpan={6} className="p-6 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E] mx-auto"></div></td></tr>
            ) : error ? (
              <tr><td colSpan={6} className="p-6 text-center text-red-500">
                {(error as any)?.data?.message || (error as any)?.message || 'Failed to load chats'}
              </td></tr>
            ) : normalizedChats.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">No chats</td></tr>
            ) : normalizedChats.map((chat, index) => (
              <tr
                key={chat.id}
                className={`border-t border-[#E5E5E5] transition-colors ${
                  index === normalizedChats.length - 1 ? "" : "border-b"
                }`}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(chat.id)}
                    onChange={() => handleRowSelect(chat.id)}
                    className="w-5 h-5 border border-gray-300 rounded cursor-pointer text-center"
                  />
                </td>
                <td className="p-4 text-[14px] text-black text-left">
                  {chat.storeName}
                </td>
                <td className="p-4 text-[14px] text-black text-left">
                  {chat.userName}
                </td>
                <td className="p-4 text-[14px] text-black text-left">
                  {chat.lastMessage}
                </td>
                <td className="p-4 text-[14px] font-semibold text-black text-left">
                  {chat.chatDate}
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
            ))}
          </tbody>
        </table>
      </div>
      {/* chats Model */}
      <ChatsModel 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        userId={userId}
        chatId={selectedChat?.id}
      />

      {pagination && pagination.last_page > 1 && (
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => onPageChange?.(pagination.current_page - 1)} disabled={pagination.current_page <= 1} className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(pagination.last_page - 4, pagination.current_page - 2)) + i;
              if (pageNum > pagination.last_page) return null;
              return (
                <button key={pageNum} onClick={() => onPageChange?.(pageNum)} className={`px-3 py-2 text-sm font-medium rounded-md ${pagination.current_page === pageNum ? 'bg-[#E53E3E] text-white' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'}`}>{pageNum}</button>
              );
            })}
            <button onClick={() => onPageChange?.(pagination.current_page + 1)} disabled={pagination.current_page >= pagination.last_page} className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatsTable;
