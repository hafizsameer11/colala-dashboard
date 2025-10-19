import React, { useMemo, useState, useEffect } from "react";
import DisputesModal from "./DisputesModal";
import { getDisputesList, getDisputeDetails, resolveDispute, closeDispute } from "../../../../utils/queries/disputes";

export interface Dispute {
  id: string | number;
  store_name?: string;
  user_name?: string;
  last_message?: string;
  chat_date?: string;
  won_by?: string;
  status: "pending" | "resolved" | "on_hold";
  created_at?: string;
  updated_at?: string;
  // Legacy fields for backward compatibility
  storeName?: string;
  userName?: string;
  lastMessage?: string;
  chatDate?: string;
  wonBy?: string;
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
  
  // Real dispute data state
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch disputes data
  const fetchDisputes = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        per_page: 20
      };

      // Add status filter based on active tab
      if (activeTab !== "All") {
        const statusMap: Record<string, string> = {
          "Pending": "pending",
          "On Hold": "on_hold", 
          "Resolved": "resolved"
        };
        params.status = statusMap[activeTab];
      }

      // Add search parameter
      if (search) {
        params.search = search;
      }

      const response = await getDisputesList(params);
      if (response.status === 'success') {
        setDisputes(response.data.disputes || []);
        setPagination(response.data.pagination || pagination);
      }
    } catch (error: unknown) {
      console.error('Error fetching disputes:', error);
      console.error('Failed to load disputes');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch disputes when component mounts or dependencies change
  useEffect(() => {
    fetchDisputes();
  }, [activeTab, search, currentPage]);

  // Helper function to get display values from dispute object
  const getDisputeDisplayValues = (dispute: Dispute) => {
    return {
      storeName: dispute.store_name || dispute.storeName || 'N/A',
      userName: dispute.user_name || dispute.userName || 'N/A',
      lastMessage: dispute.last_message || dispute.lastMessage || 'N/A',
      chatDate: dispute.chat_date || dispute.chatDate || 'N/A',
      wonBy: dispute.won_by || dispute.wonBy || '-'
    };
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "resolved":
        return <div className="w-4 h-4 bg-[#008000] rounded-full"></div>;
      case "pending":
        return <div className="w-4 h-4 bg-[#FFA500] rounded-full"></div>;
      case "on_hold":
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
      const ids = disputes.map((d) => d.id.toString());
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
    setSelectAll(newSelectedRows.length === disputes.length && disputes.length > 0);
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
                  checked={selectAll && disputes.length > 0}
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
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-sm text-[#555]">
                  <div className="flex justify-center items-center">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mr-2"></div>
                    Loading disputes...
                  </div>
                </td>
              </tr>
            ) : (
              disputes.map((dispute, index) => {
                const displayValues = getDisputeDisplayValues(dispute);
                return (
                  <tr
                    key={dispute.id}
                    className={`border-t border-[#E5E5E5] transition-colors ${
                      index === disputes.length - 1 ? "" : "border-b"
                    }`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(dispute.id.toString())}
                        onChange={() => handleRowSelect(dispute.id.toString())}
                        className="w-5 h-5 border border-gray-300 rounded cursor-pointer text-center"
                      />
                    </td>
                    <td className="p-4 text-black text-left">
                      {displayValues.storeName}
                    </td>
                    <td className="p-4 text-black text-left">{displayValues.userName}</td>
                    <td className="p-4 text-black text-left">
                      {displayValues.lastMessage}
                    </td>
                    <td className="p-4 text-black text-left">{displayValues.chatDate}</td>
                    <td className="p-4 text-black text-left">{displayValues.wonBy}</td>
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
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}

            {!isLoading && disputes.length === 0 && (
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
        onDisputeUpdate={fetchDisputes}
      />
    </div>
  );
};

export default DisputesTable;
