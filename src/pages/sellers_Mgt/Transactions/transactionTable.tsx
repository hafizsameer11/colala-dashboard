import React, { useMemo, useState, useEffect } from "react";
import TransactionsModel from "../Modals/transactionsModel";

interface Transaction {
  id: string | number;
  tx_id?: string;
  reference?: string;
  amount: string | number;
  amount_formatted?: string;
  type: string;
  date?: string;
  created_at?: string;
  formatted_date?: string;
  status: string;
  status_color?: string;
  user_name?: string;
  user_email?: string;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface TransactionTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  /** Status filter from tabs */
  statusFilter?: "All" | "pending" | "success" | "completed" | "failed";
  /** Type filter from DepositDropdown */
  typeFilter?: "All" | "Deposit" | "Withdrawals" | "Payments";
  /** Debounced search string */
  searchTerm?: string;
  /** Real transaction data from API */
  transactions?: Transaction[];
  /** Pagination data */
  pagination?: Pagination;
  /** Page change handler */
  onPageChange?: (page: number) => void;
  /** Loading state */
  isLoading?: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  title = "Latest Transactions",
  onRowSelect,
  statusFilter = "All",
  typeFilter = "All",
  searchTerm = "",
  transactions = [],
  pagination,
  onPageChange,
  isLoading = false,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransactionTable, setSelectedTransactionTable] =
    useState<Transaction | null>(null);

  // Transform API data to match expected format
  const transformedTransactions = useMemo(() => {
    return transactions.map((tx) => ({
      id: tx.id,
      reference: tx.tx_id || tx.reference || 'N/A',
      amount: tx.amount_formatted || (typeof tx.amount === 'number' ? `₦${tx.amount.toLocaleString()}` : tx.amount),
      type: tx.type || 'Unknown',
      date: tx.formatted_date || tx.created_at || tx.date || 'N/A',
      status: tx.status || 'Unknown',
      status_color: tx.status_color || 'gray',
      user_name: tx.user_name || 'N/A',
      user_email: tx.user_email || 'N/A',
    }));
  }, [transactions]);

  // Use transformed data instead of hardcoded data
  const transactionsData: Transaction[] = transformedTransactions;

  const visibleTxs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    const statusOk = (t: Transaction) => {
      if (statusFilter === "All") return true;
      const txStatus = t.status?.toLowerCase() || "";
      const filterStatus = statusFilter.toLowerCase();
      
      // Handle status variations from API
      if (filterStatus === "success") {
        return txStatus === "success" || txStatus === "successful";
      }
      return txStatus === filterStatus;
    };

    const typeOk = (t: Transaction) =>
      typeFilter === "All" ? true : t.type === typeFilter;

    const searchOk = (t: Transaction) => {
      if (!q) return true;
      return [t.reference, t.amount, t.type, t.date, t.status]
        .join(" ")
        .toLowerCase()
        .includes(q);
    };

    return transactionsData.filter((t) => statusOk(t) && typeOk(t) && searchOk(t));
  }, [transactionsData, statusFilter, typeFilter, searchTerm]);

  // keep the header checkbox in sync with visible rows
  useEffect(() => {
    const visIds = new Set(visibleTxs.map((t) => t.id));
    const visibleSelected = selectedRows.filter((id) => visIds.has(id));
    setSelectAll(
      visibleTxs.length > 0 && visibleSelected.length === visibleTxs.length
    );
  }, [visibleTxs, selectedRows]);

  const handleShowDetails = (transaction: Transaction) => {
    setSelectedTransactionTable(transaction);
    setShowModal(true);
  };

  // Select-all only for visible rows, preserving selections from other filters
  const handleSelectAll = () => {
    const visIds = visibleTxs.map((t) => t.id);
    if (selectAll) {
      const remaining = selectedRows.filter((id) => !visIds.includes(id));
      setSelectedRows(remaining);
      onRowSelect?.(remaining);
      setSelectAll(false);
    } else {
      const union = Array.from(new Set([...selectedRows, ...visIds]));
      setSelectedRows(union);
      onRowSelect?.(union);
      setSelectAll(true);
    }
  };

  const handleRowSelect = (transactionId: string) => {
    setSelectedRows((prev) => {
      const next = prev.includes(transactionId)
        ? prev.filter((id) => id !== transactionId)
        : [...prev, transactionId];
      onRowSelect?.(next);
      return next;
    });
  };

  const getStatusStyle = (statusColor?: string) => {
    switch (statusColor?.toLowerCase()) {
      case "yellow":
        return "bg-yellow-50 text-yellow-700 border border-yellow-300";
      case "green":
        return "bg-green-50 text-green-700 border border-green-300";
      case "blue":
        return "bg-blue-50 text-blue-700 border border-blue-300";
      case "red":
        return "bg-red-50 text-red-700 border border-red-300";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-300";
    }
  };

  const getStatusDisplayText = (status: string) => {
    // Normalize status text for display
    const normalized = status.toLowerCase();
    if (normalized === "successful" || normalized === "success") {
      return "Successful";
    }
    if (normalized === "pending") {
      return "Pending";
    }
    if (normalized === "completed") {
      return "Completed";
    }
    if (normalized === "failed") {
      return "Failed";
    }
    // Capitalize first letter for other statuses
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="border border-[#989898] rounded-2xl mt-5">
        <div className="bg-white p-5 rounded-t-2xl font-semibold text-[16px] border-b border-[#989898]">
          {title}
        </div>
        <div className="bg-white rounded-b-2xl p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
            <span className="ml-3 text-gray-600">Loading transactions...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[#989898] rounded-2xl mt-5">
      <div className="bg-white p-5 rounded-t-2xl font-semibold text-[16px] border-b border-[#989898]">
        {title}
      </div>
      <div className="bg-white rounded-b-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F2F2F2]">
            <tr>
              <th className="text-center p-3 font-normal text-[14px] w-12">
                <input
                  type="checkbox"
                  checked={selectAll && visibleTxs.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                />
              </th>
              <th className="text-left p-3 font-normal text-[14px]">TX id</th>
              <th className="text-center p-3 font-normal text-[14px]">
                Amount
              </th>
              <th className="text-center p-3 font-normal text-[14px]">Type</th>
              <th className="text-center p-3 font-normal text-[14px]">
                Tx Date
              </th>
              <th className="text-center p-3 font-normal text-[14px]">
                Status
              </th>
              <th className="text-center p-3 font-normal text-[14px]">Other</th>
            </tr>
          </thead>
          <tbody>
            {visibleTxs.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  No transactions found.
                </td>
              </tr>
            ) : (
              visibleTxs.map((transaction, index) => (
                <tr
                  key={transaction.id}
                  className={`border-t border-[#E5E5E5] transition-colors ${
                    index === visibleTxs.length - 1 ? "" : "border-b"
                  }`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(transaction.id)}
                      onChange={() => handleRowSelect(transaction.id)}
                      className="w-5 h-5 border border-gray-300 rounded cursor-pointer text-center"
                    />
                  </td>
                  <td className="p-4 text-[14px] text-black text-left">
                    {transaction.reference}
                  </td>
                  <td className="p-4 text-[14px] text-black font-semibold text-center">
                    {transaction.amount}
                  </td>
                  <td className="p-4 text-[14px] text-black text-center">
                    {transaction.type}
                  </td>
                  <td className="p-4 text-[14px] font-semibold text-black text-center">
                    {transaction.date}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-md text-[12px] font-medium ${getStatusStyle(
                        transaction.status_color
                      )}`}
                    >
                      {getStatusDisplayText(transaction.status)}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleShowDetails(transaction)}
                      className="bg-[#E53E3E] text-white px-6 py-2.5 rounded-lg text-[15px] font-medium hover:bg-[#D32F2F] transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TransactionsModel
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        transaction={selectedTransactionTable}
      />
    </div>
  );
};

export default TransactionTable;
