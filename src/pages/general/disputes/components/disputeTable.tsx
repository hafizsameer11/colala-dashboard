import React, { useState, useEffect, useCallback, useMemo } from "react";
import DisputesModal from "./DisputesModal";
import { getDisputesList } from "../../../../utils/queries/disputes";
import { filterByPeriod } from "../../../../utils/periodFilter";

export interface Dispute {
  id: string | number;
  category?: string;
  details?: string;
  images?: string[];
  status: "open" | "pending" | "on_hold" | "resolved" | "closed";
  won_by?: string | null;
  resolution_notes?: string | null;
  created_at?: string;
  updated_at?: string;
  resolved_at?: string | null;
  closed_at?: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    profile_picture?: string;
  };
  dispute_chat?: {
    id: number;
    buyer?: {
      id: number;
      name: string;
      email: string;
    };
    seller?: {
      id: number;
      name: string;
      email: string;
    };
    store?: {
      id: number;
      name: string;
    };
    messages?: Array<{
      id: number;
      sender_id: number;
      sender_type: "buyer" | "seller" | "admin";
      sender_name: string;
      message: string;
      image: string | null;
      is_read: boolean;
      created_at: string;
    }>;
  };
  chat?: {
    id: number;
    store_name: string;
    user_name: string;
    last_message: string;
    created_at: string;
  };
  store_order?: {
    id: number;
    order_id: number;
    status: string;
    items_subtotal: string;
    shipping_fee: string;
    subtotal_with_shipping: string;
    created_at: string;
    items?: Array<{
      id: number;
      name: string;
      sku: string;
      unit_price: string;
      qty: number;
      line_total: string;
    }>;
  };
  // Legacy fields for backward compatibility
  store_name?: string;
  user_name?: string;
  last_message?: string;
  chat_date?: string;
  wonBy?: string;
  storeName?: string;
  userName?: string;
  lastMessage?: string;
  chatDate?: string;
}

type Tab = "All" | "Pending" | "On Hold" | "Resolved";

interface DisputesTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  activeTab: Tab; // ⬅️ new
  search: string; // ⬅️ new (debounced)
  selectedPeriod?: string; // ⬅️ new (date period filter)
}

const DisputesTable: React.FC<DisputesTableProps> = ({
  onRowSelect,
  activeTab,
  search,
  selectedPeriod = "All time",
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
  const fetchDisputes = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: {
        page: number;
        per_page: number;
        status?: string;
        search?: string;
      } = {
        page: currentPage,
        per_page: 20
      };

      // Add status filter based on active tab
      if (activeTab !== "All") {
        const statusMap: Record<string, string> = {
          "Pending": "open",
          "On Hold": "on_hold", // Map "On Hold" to "on_hold" status from API
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
        setPagination(response.data.pagination || {
          current_page: 1,
          last_page: 1,
          per_page: 20,
          total: 0
        });
      }
    } catch (error: unknown) {
      console.error('Error fetching disputes:', error);
      console.error('Failed to load disputes');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, search, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);

  // Fetch disputes when component mounts or dependencies change
  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);
  
  // Filter disputes by selected period
  const filteredDisputes = useMemo(() => {
    if (selectedPeriod === "All time") {
      return disputes;
    }
    return filterByPeriod(disputes, selectedPeriod, ['created_at', 'updated_at', 'resolved_at', 'closed_at', 'date', 'formatted_date']);
  }, [disputes, selectedPeriod]);

  // Helper function to get display values from dispute object
  const getDisputeDisplayValues = (dispute: Dispute) => {
    // Handle new API structure with dispute_chat
    const disputeChat = dispute.dispute_chat;
    const legacyChat = dispute.chat;
    
    // Check if it's the new structure (dispute_chat)
    if (disputeChat) {
      const lastMessage = disputeChat.messages && disputeChat.messages.length > 0 
        ? disputeChat.messages[disputeChat.messages.length - 1]
        : null;
      
      return {
        storeName: disputeChat.store?.name || dispute.store_name || dispute.storeName || 'N/A',
        userName: disputeChat.buyer?.name || dispute.user?.name || dispute.user_name || dispute.userName || 'N/A',
        lastMessage: lastMessage?.message || dispute.last_message || dispute.lastMessage || 'N/A',
        chatDate: lastMessage?.created_at 
          ? new Date(lastMessage.created_at).toLocaleDateString()
          : dispute.chat_date || dispute.chatDate || 'N/A',
        wonBy: dispute.won_by || dispute.wonBy || '-'
      };
    }
    
    // Fallback to legacy chat structure
    return {
      storeName: legacyChat?.store_name || dispute.store_name || dispute.storeName || 'N/A',
      userName: legacyChat?.user_name || dispute.user?.name || dispute.user_name || dispute.userName || 'N/A',
      lastMessage: legacyChat?.last_message || dispute.last_message || dispute.lastMessage || 'N/A',
      chatDate: legacyChat?.created_at 
        ? new Date(legacyChat.created_at).toLocaleDateString()
        : dispute.chat_date || dispute.chatDate || 'N/A',
      wonBy: dispute.won_by || dispute.wonBy || '-'
    };
  };

  const getStatusIndicator = (status: string) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return <div className="w-4 h-4 bg-[#008000] rounded-full"></div>;
      case "open":
        return <div className="w-4 h-4 bg-[#FFA500] rounded-full"></div>;
      case "pending":
        return <div className="w-4 h-4 bg-[#FFA500] rounded-full"></div>;
      case "on_hold":
        return <div className="w-4 h-4 bg-[#000000] rounded-full"></div>;
      case "closed":
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
    setSelectAll(newSelectedRows.length === filteredDisputes.length && filteredDisputes.length > 0);
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
              filteredDisputes.map((dispute, index) => {
                const displayValues = getDisputeDisplayValues(dispute);
                return (
                  <tr
                    key={dispute.id}
                    className={`border-t border-[#E5E5E5] transition-colors ${
                      index === filteredDisputes.length - 1 ? "" : "border-b"
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

            {!isLoading && filteredDisputes.length === 0 && (
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
        disputeData={selectedDispute as Dispute | null | undefined}
        onDisputeUpdate={fetchDisputes}
      />
    </div>
  );
};

export default DisputesTable;
