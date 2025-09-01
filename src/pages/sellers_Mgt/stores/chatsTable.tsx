import React, { useState } from "react";
import ChatsModel from "../Modals/chatsModel";

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
}

const ChatsTable: React.FC<OrdersTableProps> = ({
  title = "Latest Chats",
  onRowSelect,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  // Sample data based on the image
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

  const handleShowDetails = (chat: Chat) => {
    setSelectedChat(chat);
    setShowModal(true);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(chats.map((chat) => chat.id));
    }
    setSelectAll(!selectAll);

    if (onRowSelect) {
      onRowSelect(selectAll ? [] : chats.map((chat) => chat.id));
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
    setSelectAll(newSelectedRows.length === chats.length);

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
            {chats.map((chat, index) => (
              <tr
                key={chat.id}
                className={`border-t border-[#E5E5E5] transition-colors ${
                  index === chats.length - 1 ? "" : "border-b"
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
      <ChatsModel isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default ChatsTable;
