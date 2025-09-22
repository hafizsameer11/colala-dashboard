import React, { useMemo, useState } from "react";
import DisputesModal from "./DisputesModal";

export interface Dispute {
  id: string;
  storeName: string;
  userName: string;
  lastMessage: string;
  chatDate: string;
  wonBy: string;
  status: "pending" | "resolved" | "onhold";
}

type Tab = "All" | "Pending" | "On Hold" | "Resolved";

interface DisputesTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  activeTab: Tab; // ⬅️ new
  search: string; // ⬅️ new (debounced)
}

const DisputesTable: React.FC<DisputesTableProps> = ({
  onRowSelect,
  activeTab,
  search,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  // Sample data (source)
  const disputes: Dispute[] = [
    {
      id: "1",
      storeName: "Pet Paradise",
      userName: "David Chen",
      lastMessage: "What are the ingredients in your gr...",
      chatDate: "20-07-2025/07:58PM",
      wonBy: "Store",
      status: "resolved",
    },
    {
      id: "2",
      storeName: "Fitness Forward",
      userName: "Sofia Rossi",
      lastMessage: "I'd like to return the yoga mat I...",
      chatDate: "20-07-2025/07:58PM",
      wonBy: "-",
      status: "pending",
    },
    {
      id: "3",
      storeName: "Fresh Blooms Co.",
      userName: "Elena Petrova",
      lastMessage: "Can I change the delivery address for...",
      chatDate: "20-07-2025/07:58PM",
      wonBy: "Store",
      status: "resolved",
    },
    {
      id: "4",
      storeName: "AutoPro Parts",
      userName: "Kenji Tanaka",
      lastMessage: "Is this compatible with a 2023 Hon...",
      chatDate: "20-07-2025/07:58PM",
      wonBy: "-",
      status: "pending",
    },
    {
      id: "5",
      storeName: "Gadget Haven",
      userName: "Qamar Malik",
      lastMessage: "I need this delivered to my location...",
      chatDate: "20-07-2025/07:58PM",
      wonBy: "Store",
      status: "onhold",
    },
    {
      id: "6",
      storeName: "Artisan Coffee Roasters",
      userName: "Liam O'Connell",
      lastMessage: "Do you offer a subscription servi...",
      chatDate: "20-07-2025/07:58PM",
      wonBy: "Store",
      status: "resolved",
    },
    {
      id: "7",
      storeName: "The Book Nook",
      userName: "Fatima Al-Sayed",
      lastMessage: "My order seems to be delayed, any...",
      chatDate: "20-07-2025/07:58PM",
      wonBy: "Store",
      status: "resolved",
    },
  ];

  // Map tab → status value in data
  const statusForTab: Record<Exclude<Tab, "All">, Dispute["status"]> = {
    Pending: "pending",
    "On Hold": "onhold",
    Resolved: "resolved",
  };

  // Filter by tab + search (case-insensitive)
  const filteredDisputes = useMemo(() => {
    let rows = disputes;

    if (activeTab !== "All") {
      rows = rows.filter(
        (d) => d.status === statusForTab[activeTab as Exclude<Tab, "All">]
      );
    }

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (d) =>
          d.storeName.toLowerCase().includes(q) ||
          d.userName.toLowerCase().includes(q) ||
          d.lastMessage.toLowerCase().includes(q) ||
          d.chatDate.toLowerCase().includes(q) ||
          d.wonBy.toLowerCase().includes(q)
      );
    }

    return rows;
  }, [disputes, activeTab, search]);

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "resolved":
        return <div className="w-4 h-4 bg-[#008000] rounded-full"></div>;
      case "pending":
        return <div className="w-4 h-4 bg-[#FFA500] rounded-full"></div>;
      case "onhold":
        return <div className="w-4 h-4 bg-[#000000] rounded-full"></div>;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full"></div>;
    }
  };

  const handleShowDetails = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setShowModal(true);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
      onRowSelect?.([]);
    } else {
      const ids = filteredDisputes.map((d) => d.id);
      setSelectedRows(ids);
      onRowSelect?.(ids);
    }
    setSelectAll(!selectAll);
  };

  const handleRowSelect = (disputeId: string) => {
    let newSelectedRows: string[];
    if (selectedRows.includes(disputeId)) {
      newSelectedRows = selectedRows.filter((id) => id !== disputeId);
    } else {
      newSelectedRows = [...selectedRows, disputeId];
    }
    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.length === filteredDisputes.length);
    onRowSelect?.(newSelectedRows);
  };

  return (
    <div className="border border-[#989898] rounded-2xl w-[1160px] ml-6 mt-1 mb-4">
      <div className="bg-white p-5 rounded-t-2xl font-semibold text-[16px] border-b border-[#989898]">
        Latest Chats
      </div>
      <div className="bg-white rounded-b-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F2F2F2]">
            <tr>
              <th className="text-center p-3 font-normal w-12">
                <input
                  type="checkbox"
                  checked={selectAll && filteredDisputes.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                />
              </th>
              <th className="text-left p-3 font-normal ">Store Name</th>
              <th className="text-left p-3 font-normal ">User Name</th>
              <th className="text-left p-3 font-normal ">Last Message</th>
              <th className="text-left p-3 font-normal ">Chat Date</th>
              <th className="text-left p-3 font-normal ">Won by</th>
              <th className="text-left p-3 font-normal ">Status</th>
              <th className="text-center p-3 font-normal ">Other</th>
            </tr>
          </thead>

          <tbody>
            {filteredDisputes.map((dispute, index) => (
              <tr
                key={dispute.id}
                className={`border-t border-[#E5E5E5] transition-colors ${
                  index === filteredDisputes.length - 1 ? "" : "border-b"
                }`}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(dispute.id)}
                    onChange={() => handleRowSelect(dispute.id)}
                    className="w-5 h-5 border border-gray-300 rounded cursor-pointer text-center"
                  />
                </td>
                <td className="p-4 text-black text-left">
                  {dispute.storeName}
                </td>
                <td className="p-4 text-black text-left">{dispute.userName}</td>
                <td className="p-4 text-black text-left">
                  {dispute.lastMessage}
                </td>
                <td className="p-4 text-black text-left">{dispute.chatDate}</td>
                <td className="p-4 text-black text-left">{dispute.wonBy}</td>
                <td className="p-4 text-left">
                  <div className="flex items-center">
                    {getStatusIndicator(dispute.status)}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleShowDetails(dispute)}
                    className="bg-[#E53E3E] text-white px-6 py-2 rounded-lg text-[12px] font-medium hover:bg-[#D32F2F] cursor-pointer"
                  >
                    View Chat
                  </button>
                </td>
              </tr>
            ))}

            {filteredDisputes.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-sm text-[#555]">
                  No disputes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Disputes Modal */}
      <DisputesModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        disputeData={selectedDispute}
      />
    </div>
  );
};

export default DisputesTable;
