import React, { useMemo, useState, useEffect } from "react";
import ChatsModel from "../../../../../components/chatsModel";

interface Chat {
  id: string;
  storeName: string;
  userName: string;
  lastMessage: string;
  chatDate: string;
  other: string;
}

interface OrdersTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  searchQuery?: string; // <-- NEW
}

const ChatsTable: React.FC<OrdersTableProps> = ({
  title = "Latest Chats",
  onRowSelect,
  searchQuery = "",
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const chats: Chat[] = [
    {
      id: "1",
      storeName: "Pet Paradise",
      userName: "David Chen",
      lastMessage: "What are the ingredients in your gr...",
      chatDate: "20-07-2025/07:58PM",
      other: "View Chat",
    },
    {
      id: "2",
      storeName: "Fitness Forward",
      userName: "Sofia Rossi",
      lastMessage: "I'd like to return the yoga mat I...",
      chatDate: "20-07-2025/07:21PM",
      other: "View Chat",
    },
    {
      id: "3",
      storeName: "Fresh Blooms Co.",
      userName: "Elena Petrova",
      lastMessage: "Can I change the delivery address for...",
      chatDate: "20-07-2025/08:50PM",
      other: "View Chat",
    },
    {
      id: "4",
      storeName: "AutoPro Parts",
      userName: "Kenji Tanaka",
      lastMessage: "Is this compatible with a 2023 Hon...",
      chatDate: "20-07-2025/08:45PM",
      other: "View Chat",
    },
    {
      id: "5",
      storeName: "Gadget Haven",
      userName: "Qamar Malik",
      lastMessage: "I need this delivered to my location...",
      chatDate: "20-07-2025/09:15PM",
      other: "View Chat",
    },
    {
      id: "6",
      storeName: "Artisan Coffee Roasters",
      userName: "Liam O'Connell",
      lastMessage: "Do you offer a subscription servi...",
      chatDate: "20-07-2025/06:45PM",
      other: "View Chat",
    },
    {
      id: "7",
      storeName: "The Book Nook",
      userName: "Fatima Al-Sayed",
      lastMessage: "My order seems to be delayed, any...",
      chatDate: "20-07-2025/08:32PM",
      other: "View Chat",
    },
  ];

  // Case-insensitive filtering on multiple fields
  const filteredChats = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((c) =>
      [c.storeName, c.userName, c.lastMessage, c.chatDate].some((field) =>
        field.toLowerCase().includes(q)
      )
    );
  }, [searchQuery]);

  // Reset selection when the visible list changes
  useEffect(() => {
    setSelectedRows([]);
    setSelectAll(false);
  }, [searchQuery]);

  const handleShowDetails = (chat: Chat) => {
    setSelectedChat(chat);
    setShowModal(true);
  };

  const handleSelectAll = () => {
    const visibleIds = filteredChats.map((chat) => chat.id);
    const allSelected = visibleIds.every((id) => selectedRows.includes(id));
    const newSelection = allSelected
      ? selectedRows.filter((id) => !visibleIds.includes(id)) // unselect visible
      : Array.from(new Set([...selectedRows, ...visibleIds])); // add visible

    setSelectedRows(newSelection);
    setSelectAll(!allSelected);
    onRowSelect?.(newSelection);
  };

  const handleRowSelect = (chatId: string) => {
    const isSelected = selectedRows.includes(chatId);
    const newSelection = isSelected
      ? selectedRows.filter((id) => id !== chatId)
      : [...selectedRows, chatId];

    setSelectedRows(newSelection);
    setSelectAll(
      filteredChats.length > 0 &&
        filteredChats.every((c) => newSelection.includes(c.id))
    );
    onRowSelect?.(newSelection);
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
            {filteredChats.map((chat, index) => (
              <tr
                key={chat.id}
                className={`border-t border-[#E5E5E5] transition-colors ${
                  index === filteredChats.length - 1 ? "" : "border-b"
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
            {filteredChats.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No chats found for “{searchQuery}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ChatsModel isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default ChatsTable;
