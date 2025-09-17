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
}

const ChatsTable: React.FC<ChatsTableProps> = ({
  title = "Latest chats",
  onRowSelect,
  filterType = "General",
  searchTerm = "",
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  // Sample data (now includes unread flags)
  const chats: Chat[] = [
    { id: "1", storeName: "Pet Paradise", userName: "David Chen",   lastMessage: "What are the ingredients in your gr...",  chatDate: "20-07-2025/07:58PM", type: "Dispute", other: "View Chat", isUnread: true },
    { id: "2", storeName: "Fitness Forward", userName: "Sofia Rossi", lastMessage: "I'd like to return the yoga mat I...",    chatDate: "20-07-2025/07:21PM", type: "General", other: "View Chat", isUnread: true },
    { id: "3", storeName: "Fresh Blooms Co.", userName: "Elena Petrova", lastMessage: "Can I change the delivery address for...", chatDate: "20-07-2025/08:50PM", type: "Dispute", other: "View Chat" },
    { id: "4", storeName: "AutoPro Parts",   userName: "Kenji Tanaka", lastMessage: "Is this compatible with a 2023 Hon...", chatDate: "20-07-2025/08:45PM", type: "General", other: "View Chat" },
    { id: "5", storeName: "Gadget Haven",    userName: "Qamar Malik",  lastMessage: "I need this delivered to my location...", chatDate: "20-07-2025/09:15PM", type: "General", other: "View Chat" },
    { id: "6", storeName: "Artisan Coffee Roasters", userName: "Liam O'Connell", lastMessage: "Do you offer a subscription servi...", chatDate: "20-07-2025/06:45PM", type: "General", other: "View Chat" },
    { id: "7", storeName: "The Book Nook",   userName: "Fatima Al-Sayed", lastMessage: "My order seems to be delayed, any...", chatDate: "20-07-2025/08:32PM", type: "Support", other: "View Chat" },
  ];

  const handleShowDetails = (chat: Chat) => {
    setSelectedChat(chat);
    setShowModal(true);
  };

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

  return (
    <div className="border border-[#989898] rounded-2xl w-[1160px] ml-6 mt-1 mb-4">
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
      </div>

      {/* Chat Modal */}
      <ChatsModel isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default ChatsTable;
