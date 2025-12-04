import React, { useMemo, useState, useEffect } from "react";
import BuyerTransactionDetails from "../../../../../components/buyerTransactionDetails";
import { formatCurrency } from "../../../../../utils/formatCurrency";

interface ApiTransaction {
  id: number;
  tx_id: string;
  amount: number;
  amount_formatted: string;
  status: string;
  type: string;
  user_name: string;
  user_email: string;
  created_at: string;
  formatted_date: string;
  status_color: string;
}

interface Transaction {
  id: string;
  reference: string;
  amount: string;
  type: string;
  date: string;
  status: string;
  userName: string;
  userEmail: string;
  statusColor: string;
}

interface TransactionTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  onSelectedTransactionsChange?: (selectedTransactions: any[]) => void;
  /** Status filter from tabs */
  statusFilter?: "All" | "pending" | "success" | "completed" | "failed";
  /** Type filter from DepositDropdown */
  typeFilter?: "All" | "Deposit" | "Withdrawals" | "Payments";
  /** Debounced search string */
  searchTerm?: string;
  transactions?: ApiTransaction[];
  pagination?: any;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  error?: any;
  userId?: string | number;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  title = "Latest Transactions",
  onRowSelect,
  onSelectedTransactionsChange,
  statusFilter = "All",
  typeFilter = "All",
  searchTerm = "",
  transactions = [],
  pagination = null,
  currentPage = 1,
  onPageChange,
  isLoading = false,
  error = null,
  userId,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransactionTable, setSelectedTransactionTable] =
    useState<Transaction | null>(null);

  // Normalize API data to UI format
  const normalizedTransactions: Transaction[] = useMemo(() => {
    return transactions.map((tx: ApiTransaction) => ({
      id: tx.id.toString(),
      reference: tx.tx_id,
      amount: tx.amount_formatted,
      type: tx.type,
      date: tx.formatted_date,
      status: tx.status,
      userName: tx.user_name,
      userEmail: tx.user_email,
      statusColor: tx.status_color,
    }));
  }, [transactions]);

  const visibleTxs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    const statusOk = (t: Transaction) =>
      statusFilter === "All" ? true : t.status === statusFilter;

    const typeOk = (t: Transaction) => {
      if (typeFilter === "All") return true;
      const normalizedType = t.type.toLowerCase();
      if (typeFilter === "Deposit") return normalizedType.includes("deposit");
      if (typeFilter === "Withdrawals") return normalizedType.includes("withdraw");
      if (typeFilter === "Payments") return normalizedType.includes("payment") || normalizedType.includes("order");
      return true;
    };

    const searchOk = (t: Transaction) => {
      if (!q) return true;
      return [t.reference, t.amount, t.type, t.date, t.status, t.userName, t.userEmail]
        .join(" ")
        .toLowerCase()
        .includes(q);
    };

    return normalizedTransactions.filter((t) => statusOk(t) && typeOk(t) && searchOk(t));
  }, [normalizedTransactions, statusFilter, typeFilter, searchTerm]);

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

      // Call onSelectedTransactionsChange with actual transaction objects
      if (onSelectedTransactionsChange) {
        const selectedTransactions = normalizedTransactions.filter(transaction =>
          remaining.includes(transaction.id)
        );
        onSelectedTransactionsChange(selectedTransactions);
      }
    } else {
      const union = Array.from(new Set([...selectedRows, ...visIds]));
      setSelectedRows(union);
      onRowSelect?.(union);
      setSelectAll(true);

      // Call onSelectedTransactionsChange with actual transaction objects
      if (onSelectedTransactionsChange) {
        const selectedTransactions = normalizedTransactions.filter(transaction =>
          union.includes(transaction.id)
        );
        onSelectedTransactionsChange(selectedTransactions);
      }
    }
  };

  const handleRowSelect = (transactionId: string) => {
    setSelectedRows((prev) => {
      const next = prev.includes(transactionId)
        ? prev.filter((id) => id !== transactionId)
        : [...prev, transactionId];
      onRowSelect?.(next);

      // Call onSelectedTransactionsChange with actual transaction objects
      if (onSelectedTransactionsChange) {
        const selectedTransactions = normalizedTransactions.filter(transaction =>
          next.includes(transaction.id)
        );
        onSelectedTransactionsChange(selectedTransactions);
      }

      return next;
    });
  };

  const getStatusStyle = (status: string, color?: string) => {
    // If we have a color from the API, use it
    if (color) {
      switch (color.toLowerCase()) {
        case "green":
          return "bg-[#0080001A] text-[#008000] border border-[#008000]";
        case "yellow":
          return "bg-[#AAAAAA1A] text-[#FFA500] border border-[#FFA500]";
        case "blue":
          return "bg-[#0000FF1A] text-[#0000FF] border border-[#0000FF]";
        case "red":
          return "bg-[#FF00001A] text-[#FF0000] border border-[#FF0000]";
      }
    }

    // Fallback to status string matching (case-insensitive)
    switch (status.toLowerCase()) {
      case "successful":
      case "success":
        return "bg-[#0080001A] text-[#008000] border border-[#008000]";
      case "pending":
        return "bg-[#AAAAAA1A] text-[#FFA500] border border-[#FFA500]";
      case "failed":
        return "bg-[#FF00001A] text-[#FF0000] border border-[#FF0000]";
      case "order_payment":
        return "bg-[#0000FF1A] text-[#0000FF] border border-[#0000FF]";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-300";
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
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E]"></div>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-red-500">
                  <p className="text-sm">Error loading transactions</p>
                </td>
              </tr>
            ) : visibleTxs.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  No transactions found.
                </td>
              </tr>
            ) : (
              visibleTxs.map((transaction, index) => (
                <tr
                  key={transaction.id}
                  className={`border-t border-[#E5E5E5] transition-colors ${index === visibleTxs.length - 1 ? "" : "border-b"
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
                  <td className="p-4 text-[14px] font-semibold text-black text-center">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="p-4 text-[14px] text-black text-center">
                    <span className="text-sm">
                      {transaction.type.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-[14px] font-semibold text-black text-center">
                    {transaction.date}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-md text-[12px] font-medium ${getStatusStyle(
                        transaction.status,
                        transaction.statusColor
                      )}`}
                    >
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
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

      {/* Pagination */}
      {
        pagination && pagination.last_page > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {currentPage} of {pagination.last_page}
            </span>
            <button
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              disabled={currentPage === pagination.last_page}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )
      }

      <BuyerTransactionDetails
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        transaction={selectedTransactionTable}
        transactionId={selectedTransactionTable?.id}
      />
    </div >
  );
};

export default TransactionTable;
