import React, { useEffect, useMemo, useState } from "react";
import SupportModel from "./supportmodel";

interface Support {
  id: string;
  storeName: string;
  issueType: string; // e.g., "Order Dispute", "Payment", etc.
  lastMessage: string;
  date: string;
  status: "Pending" | "Resolved";
  other: string;
}

interface SupportTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  filterStatus?: "All" | "Pending" | "Resolved";
  issueType?:
    | "All Types"
    | "Order Dispute"
    | "Payment"
    | "Delivery"
    | "Account";
  searchTerm?: string; // debounced
}

const SupportTable: React.FC<SupportTableProps> = ({
  title = "Latest Store Chats",
  onRowSelect,
  filterStatus = "All",
  issueType = "All Types",
  searchTerm = "",
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSupport, setSelectedSupport] = useState<Support | null>(null);

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
      issueType: "Payment",
      lastMessage: "Card failed — need help updating...",
      date: "20-07-2025/07:55PM",
      status: "Pending",
      other: "View Chat",
    },
    {
      id: "3",
      storeName: "Pet Paradise",
      issueType: "Delivery",
      lastMessage: "Change delivery address to...",
      date: "20-07-2025/07:58PM",
      status: "Resolved",
      other: "View Chat",
    },
    {
      id: "4",
      storeName: "Pet Paradise",
      issueType: "Order Dispute",
      lastMessage: "Still waiting for a refund...",
      date: "20-07-2025/07:58PM",
      status: "Pending",
      other: "View Chat",
    },
    {
      id: "5",
      storeName: "Pet Paradise",
      issueType: "Account",
      lastMessage: "Can't log in to my account...",
      date: "20-07-2025/07:58PM",
      status: "Pending",
      other: "View Chat",
    },
    {
      id: "6",
      storeName: "Pet Paradise",
      issueType: "Payment",
      lastMessage: "Payment reversed, please verify...",
      date: "20-07-2025/07:58PM",
      status: "Pending",
      other: "View Chat",
    },
    {
      id: "7",
      storeName: "Pet Paradise",
      issueType: "Order Dispute",
      lastMessage: "Item received is different...",
      date: "20-07-2025/07:58PM",
      status: "Pending",
      other: "View Chat",
    },
  ];

  const handleShowDetails = (support: Support) => {
    setSelectedSupport(support);
    setShowModal(true);
  };

  // ---- FILTER + SEARCH ----
  const filteredSupports = useMemo(() => {
    const q = (searchTerm || "").toLowerCase();

    return (
      supports
        // by tab (status)
        .filter((s) =>
          filterStatus === "All" ? true : s.status === filterStatus
        )
        // by issue type
        .filter((s) =>
          issueType === "All Types" ? true : s.issueType === issueType
        )
        // by search term (store, issueType, message, date, status)
        .filter((s) => {
          if (!q) return true;
          const haystack = [
            s.storeName,
            s.issueType,
            s.lastMessage,
            s.date,
            s.status,
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(q);
        })
    );
  }, [supports, filterStatus, issueType, searchTerm]);

  // keep selection consistent with current view
  useEffect(() => {
    setSelectAll(false);
    setSelectedRows((prev) =>
      prev.filter((id) => filteredSupports.some((s) => s.id === id))
    );
  }, [filterStatus, issueType, searchTerm]); // eslint-disable-line

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
      onRowSelect?.([]);
    } else {
      const visibleIds = filteredSupports.map((s) => s.id);
      setSelectedRows(visibleIds);
      onRowSelect?.(visibleIds);
    }
    setSelectAll(!selectAll);
  };

  const handleRowSelect = (supportId: string) => {
    const newSelectedRows = selectedRows.includes(supportId)
      ? selectedRows.filter((id) => id !== supportId)
      : [...selectedRows, supportId];

    setSelectedRows(newSelectedRows);
    setSelectAll(
      newSelectedRows.length > 0 &&
        newSelectedRows.length === filteredSupports.length
    );
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
              <th className="text-center p-3 font-normal w-12">
                <input
                  type="checkbox"
                  checked={
                    selectAll &&
                    filteredSupports.length > 0 &&
                    selectedRows.length === filteredSupports.length
                  }
                  onChange={handleSelectAll}
                  className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                />
              </th>
              <th className="text-left p-3 font-normal">Store Name</th>
              <th className="text-left p-3 font-normal">Issue type</th>
              <th className="text-left p-3 font-normal">Last Message</th>
              <th className="text-left p-3 font-normal">Date</th>
              <th className="text-left p-3 font-normal">Status</th>
              <th className="text-center p-3 font-normal">Other</th>
            </tr>
          </thead>
          <tbody>
            {filteredSupports.map((support, index) => (
              <tr
                key={support.id}
                className={`border-t border-[#E5E5E5] transition-colors ${
                  index === filteredSupports.length - 1 ? "" : "border-b"
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
                <td className="p-4 text-black text-left">
                  {support.storeName}
                </td>
                <td className="p-4 text-black text-left">
                  {support.issueType}
                </td>
                <td className="p-4 text-black text-left">
                  {support.lastMessage}
                </td>
                <td className="p-4 text-black text-left">{support.date}</td>
                <td className="p-4 text-left">
                  <span
                    className={`px-3 py-1 rounded-lg text-[10px] font-medium ${
                      support.status === "Pending"
                        ? "bg-[#FFA5001A] text-[#FFA500] border border-[#FFA500]"
                        : "bg-[#0080001A] text-[#008000] border border-[#008000]"
                    }`}
                  >
                    {support.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer bg-[#E53E3E] text-white hover:bg-[#D32F2F]"
                  >
                    View Chat
                  </button>
                </td>
              </tr>
            ))}

            {filteredSupports.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="p-6 text-center text-sm text-gray-500"
                >
                  No support items found
                  {searchTerm ? ` for “${searchTerm}”` : ""}
                  {filterStatus !== "All" ? ` in ${filterStatus}` : ""}
                  {issueType !== "All Types" ? ` with ${issueType}` : ""}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Support Modal */}
      <SupportModel isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default SupportTable;
