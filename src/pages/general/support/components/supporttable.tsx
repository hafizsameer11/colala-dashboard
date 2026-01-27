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
  ticketsData?: any;
  isLoading?: boolean;
  error?: any;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

const SupportTable: React.FC<SupportTableProps> = ({
  title = "Latest Store Chats",
  onRowSelect,
  filterStatus = "All",
  issueType = "All Types",
  searchTerm = "",
  ticketsData,
  isLoading = false,
  error,
  currentPage = 1,
  onPageChange,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSupport, setSelectedSupport] = useState<Support | null>(null);

  // Transform API data to component format
  const supports: Support[] = useMemo(() => {
    if (!ticketsData?.data?.tickets) return [];
    
    return ticketsData.data.tickets.map((ticket: any) => ({
      id: ticket.id.toString(),
      storeName: ticket.user_name || "Unknown User",
      issueType: ticket.category || "General",
      lastMessage: ticket.description || "No description",
      date: ticket.formatted_date || ticket.created_at,
      status: ticket.status === "open" ? "Pending" : "Resolved",
      other: "View Ticket",
    }));
  }, [ticketsData]);

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

  if (isLoading) {
    return (
      <div className="border border-[#989898] rounded-2xl w-full mt-1 mb-4">
        <div className="bg-white p-5 rounded-t-2xl font-semibold text-[16px] border-b border-[#989898]">
          {title}
        </div>
        <div className="bg-white rounded-b-2xl p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-[#989898] rounded-2xl w-full mt-1 mb-4">
        <div className="bg-white p-5 rounded-t-2xl font-semibold text-[16px] border-b border-[#989898]">
          {title}
        </div>
        <div className="bg-white rounded-b-2xl p-8">
          <div className="text-center text-red-500">
            <p className="text-sm">Error loading support tickets</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[#989898] rounded-2xl w-full mt-1 mb-4">
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
                    onClick={() => handleShowDetails(support)}
                    className="px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer bg-[#E53E3E] text-white hover:bg-[#D32F2F]"
                  >
                    View Ticket
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
        
        {/* Pagination */}
        {ticketsData?.data?.pagination && (
          <div className="flex justify-between items-center p-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * (ticketsData.data.pagination.per_page || 20)) + 1} to{" "}
              {Math.min(currentPage * (ticketsData.data.pagination.per_page || 20), ticketsData.data.pagination.total || 0)} of{" "}
              {ticketsData.data.pagination.total || 0} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {ticketsData.data.pagination.last_page > 1 && Array.from({ length: Math.min(5, ticketsData.data.pagination.last_page || 1) }, (_, i) => {
                const pageNum = Math.max(1, Math.min((ticketsData.data.pagination.last_page || 1) - 4, currentPage - 2)) + i;
                if (pageNum > (ticketsData.data.pagination.last_page || 1)) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange?.(pageNum)}
                    className={`px-3 py-1 text-sm border border-gray-300 rounded ${
                      currentPage === pageNum
                        ? 'bg-[#E53E3E] text-white border-[#E53E3E]'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage >= (ticketsData.data.pagination.last_page || 1)}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Support Modal */}
      <SupportModel 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        ticketData={selectedSupport}
      />
    </div>
  );
};

export default SupportTable;
