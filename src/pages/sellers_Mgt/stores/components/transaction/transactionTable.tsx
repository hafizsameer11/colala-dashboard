import React, { useState, useMemo } from "react";
import TransactionsModel from "../../../Modals/transactionsModel";

interface Transaction {
  id: string;
  reference: string;
  amount: string;
  type: string;
  date: string;
  status: "Successful" | "Pending" | "Failed";
}

interface TransactionTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  transactions?: any[];
  isLoading?: boolean;
  error?: any;
  pagination?: any;
  onPageChange?: (page: number) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  title = "Latest Transactions",
  onRowSelect,
  transactions = [],
  isLoading = false,
  error,
  pagination,
  onPageChange,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransactionTable, setSelectedTransactionTable] =
    useState<Transaction | null>(null);

  // Normalize API data to match our interface
  const normalizedTransactions: Transaction[] = useMemo(() => {
    return transactions.map((tx: any) => ({
      id: String(tx.id),
      reference: tx.tx_id || 'N/A',
      amount: tx.amount || 'N0',
      type: tx.type || 'N/A',
      date: tx.created_at || 'N/A',
      status: tx.status === 'Completed' ? 'Successful' : tx.status === 'Pending' ? 'Pending' : 'Failed',
    }));
  }, [transactions]);

  const handleShowDetails = (transaction: Transaction) => {
    setSelectedTransactionTable(transaction);
    setShowModal(true);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(normalizedTransactions.map((transaction) => transaction.id));
    }
    setSelectAll(!selectAll);

    if (onRowSelect) {
      onRowSelect(
        selectAll ? [] : normalizedTransactions.map((transaction) => transaction.id)
      );
    }
  };

  const handleRowSelect = (transactionId: string) => {
    let newSelectedRows;
    if (selectedRows.includes(transactionId)) {
      newSelectedRows = selectedRows.filter((id) => id !== transactionId);
    } else {
      newSelectedRows = [...selectedRows, transactionId];
    }

    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.length === normalizedTransactions.length);

    if (onRowSelect) {
      onRowSelect(newSelectedRows);
    }
  };

  const getStatusStyle = (status: Transaction["status"]) => {
    switch (status) {
      case "Successful":
        return "bg-[#0080001A] text-[#008000] border border-[#008000]";
      case "Pending":
        return "bg-[#AAAAAA1A] text-[#FFA500] border border-[#FFA500]";
      case "Failed":
        return "bg-[#FF00001A] text-[#FF0000] border border-[#FF0000]";
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
                  checked={selectAll}
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
              <tr><td colSpan={7} className="p-6 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E53E3E] mx-auto"></div></td></tr>
            ) : error ? (
              <tr><td colSpan={7} className="p-6 text-center text-red-500">Failed to load transactions</td></tr>
            ) : normalizedTransactions.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-gray-500">No transactions</td></tr>
            ) : normalizedTransactions.map((transaction, index) => (
              <tr
                key={transaction.id}
                className={`border-t border-[#E5E5E5] transition-colors ${
                  index === normalizedTransactions.length - 1 ? "" : "border-b"
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
                      transaction.status
                    )}`}
                  >
                    {transaction.status}
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
            ))}
          </tbody>
        </table>
      </div>
      <TransactionsModel
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        transaction={selectedTransactionTable}
      />

      {pagination && pagination.last_page > 1 && (
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => onPageChange?.(pagination.current_page - 1)} disabled={pagination.current_page <= 1} className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(pagination.last_page - 4, pagination.current_page - 2)) + i;
              if (pageNum > pagination.last_page) return null;
              return (
                <button key={pageNum} onClick={() => onPageChange?.(pageNum)} className={`px-3 py-2 text-sm font-medium rounded-md ${pagination.current_page === pageNum ? 'bg-[#E53E3E] text-white' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'}`}>{pageNum}</button>
              );
            })}
            <button onClick={() => onPageChange?.(pagination.current_page + 1)} disabled={pagination.current_page >= pagination.last_page} className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
