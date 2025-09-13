import React, { useState } from "react";
import ChatsModel from "./chatmodel";

interface Chat {
  id: string;
  storeName: string;
  userName: string;
  lastMessage: string;
  chatDate: string;
  type: string;
  other: string;
}

interface OrdersTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
}

const ChatsTable: React.FC<OrdersTableProps> = ({ onRowSelect }) => {
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
      type: "Dispute",
      other: "View Chat",
    },
    {
      id: "2",
      storeName: "Fitness Forward",
      userName: "Sofia Rossi",
      lastMessage: "I'd like to return the yoga mat I...",
      chatDate: "20-07-2025/07:21PM",
      type: "General",
      other: "View Chat",
    },
    {
      id: "3",
      storeName: "Fresh Blooms Co.",
      userName: "Elena Petrova",
      lastMessage: "Can I change the delivery address for...",
      chatDate: "20-07-2025/08:50PM",
      type: "Dispute",
      other: "View Chat",
    },
    {
      id: "4",
      storeName: "AutoPro Parts",
      userName: "Kenji Tanaka",
      lastMessage: "Is this compatible with a 2023 Hon...",
      chatDate: "20-07-2025/08:45PM",
      type: "General",
      other: "View Chat",
    },
    {
      id: "5",
      storeName: "Gadget Haven",
      userName: "Qamar Malik",
      lastMessage: "I need this delivered to my location...",
      chatDate: "20-07-2025/09:15PM",
      type: "General",
      other: "View Chat",
    },
    {
      id: "6",
      storeName: "Artisan Coffee Roasters",
      userName: "Liam O'Connell",
      lastMessage: "Do you offer a subscription servi...",
      chatDate: "20-07-2025/06:45PM",
      type: "General",
      other: "View Chat",
    },
    {
      id: "7",
      storeName: "The Book Nook",
      userName: "Fatima Al-Sayed",
      lastMessage: "My order seems to be delayed, any...",
      chatDate: "20-07-2025/08:32PM",
      type: "Support",
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
    <div className="border border-[#989898] rounded-2xl w-[1160px] ml-6 mt-1 mb-4">
      <div className="bg-white p-5 rounded-t-2xl font-semibold text-[16px] border-b border-[#989898]">
        Latest chats
      </div>
      <div className="bg-white rounded-b-2xl  overflow-hidden">
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
              <th className="text-left p-3 font-normal">Store Name</th>
              <th className="text-left p-3 font-normal">User Name</th>
              <th className="text-left p-3 font-normal">Last Message</th>
              <th className="text-left p-3 font-normal">Chat Date</th>
              <th className="text-center p-3 font-normal">Type</th>
              <th className="text-center p-3 font-normal">Other</th>
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
                <td className="p-4  text-black text-left">{chat.storeName}</td>
                <td className="p-4  text-black text-left">{chat.userName}</td>
                <td className="p-4  text-black text-left">
                  {chat.lastMessage}
                </td>
                <td className="p-4  text-black text-left">{chat.chatDate}</td>
                <td className="p-4 text-left">
                  <span
                    className={`px-2 py-1 rounded-md  font-medium ${
                      chat.type === "Dispute"
                        ? "text-[#E53E3E] "
                        : chat.type === "Support"
                        ? "text-[#0000FF] "
                        : "text-black "
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
          </tbody>
        </table>
      </div>
      {/* chats Model */}
      <ChatsModel isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default ChatsTable;
