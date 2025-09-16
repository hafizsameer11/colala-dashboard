import React, { useState } from "react";
import SupportModel from "./supportmodel";

interface Support {
  id: string;
  storeName: string;
  issueType: string;
  lastMessage: string;
  date: string;
  status: string;
  other: string;
}

interface SupportTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
}

const SupportTable: React.FC<SupportTableProps> = ({
  
  onRowSelect,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSupport, setSelectedSupport] = useState<Support | null>(null);

  // Sample data based on the image
  const supports: Support[] = [
    {
      id: "1",
      storeName: "Pet Paradise",
      issueType: "Order Dispute",
      lastMessage: "What are the ingredients in your gr...",
      date: "20-07-2025/07:58PM",
      status: "Pending",
      other: "View Chat",
    },
    {
      id: "2",
      storeName: "Pet Paradise",
      issueType: "Order Dispute",
      lastMessage: "What are the ingredients in your gr...",
      date: "20-07-2025/07:55PM",
      status: "Pending",
      other: "View Chat",
    },
    {
      id: "3",
      storeName: "Pet Paradise",
      issueType: "Order Dispute",
      lastMessage: "What are the ingredients in your gr...",
      date: "20-07-2025/07:58PM",
      status: "Resolved",
      other: "View Chat",
    },
    {
      id: "4",
      storeName: "Pet Paradise",
      issueType: "Order Dispute",
      lastMessage: "What are the ingredients in your gr...",
      date: "20-07-2025/07:58PM",
      status: "Pending",
      other: "View Chat",
    },
    {
      id: "5",
      storeName: "Pet Paradise",
      issueType: "Order Dispute",
      lastMessage: "What are the ingredients in your gr...",
      date: "20-07-2025/07:58PM",
      status: "Pending",
      other: "View Chat",
    },
    {
      id: "6",
      storeName: "Pet Paradise",
      issueType: "Order Dispute",
      lastMessage: "What are the ingredients in your gr...",
      date: "20-07-2025/07:58PM",
      status: "Pending",
      other: "View Chat",
    },
    {
      id: "7",
      storeName: "Pet Paradise",
      issueType: "Order Dispute",
      lastMessage: "What are the ingredients in your gr...",
      date: "20-07-2025/07:58PM",
      status: "Pending",
      other: "View Chat",
    },
  ];

  const handleShowDetails = (support: Support) => {
    setSelectedSupport(support);
    setShowModal(true);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(supports.map((support) => support.id));
    }
    setSelectAll(!selectAll);

    if (onRowSelect) {
      onRowSelect(selectAll ? [] : supports.map((support) => support.id));
    }
  };

  const handleRowSelect = (supportId: string) => {
    let newSelectedRows;
    if (selectedRows.includes(supportId)) {
      newSelectedRows = selectedRows.filter((id) => id !== supportId);
    } else {
      newSelectedRows = [...selectedRows, supportId];
    }

    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.length === supports.length);

    if (onRowSelect) {
      onRowSelect(newSelectedRows);
    }
  };

  return (
    <div className="border border-[#989898] rounded-2xl w-[1160px] ml-6 mt-1 mb-4">
      <div className="bg-white p-5 rounded-t-2xl font-semibold text-[16px] border-b border-[#989898]">
        Latest Store Chats
      </div>
      <div className="bg-white rounded-b-2xl  overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F2F2F2]">
            <tr>
              <th className="text-center p-3 font-normal w-12">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                />
              </th>
              <th className="text-left p-3 font-normal">
                Store Name
              </th>
              <th className="text-left p-3 font-normal">
                Issue type
              </th>
              <th className="text-left p-3 font-normal">
                Last Message
              </th>
              <th className="text-left p-3 font-normal">
                Date
              </th>
              <th className="text-left p-3 font-normal">
                Status
              </th>
              <th className="text-center p-3 font-normal">
                Other
              </th>
            </tr>
          </thead>
          <tbody>
            {supports.map((support, index) => (
              <tr
                key={support.id}
                className={`border-t border-[#E5E5E5] transition-colors ${
                  index === supports.length - 1 ? "" : "border-b"
                }`}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(support.id)}
                    onChange={() => handleRowSelect(support.id)}
                    className="w-5 h-5 border border-gray-300 rounded cursor-pointer text-center"
                  />
                </td>
                <td className="p-4  text-black text-left">
                  {support.storeName}
                </td>
                <td className="p-4  text-black text-left">
                  {support.issueType}
                </td>
                <td className="p-4  text-black text-left">
                  {support.lastMessage}
                </td>
                <td className="p-4  text-black text-left">
                  {support.date}
                </td>
                <td className="p-4 text-left">
                  <span
                    className={`px-3 py-1 rounded-lg text-[10px] font-medium ${
                      support.status === "Pending"
                        ? "bg-[#FFA5001A] text-[#FFA500] border border-[#FFA500]"
                        : support.status === "Resolved"
                        ? "bg-[#0080001A] text-[#008000] border border-[#008000]"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {support.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleShowDetails(support)}
                    className="px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer bg-[#E53E3E] text-white hover:bg-[#D32F2F]"
                  >
                    View Chat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Support Model */}
      <SupportModel isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default SupportTable;
