import React, { useMemo, useState, useEffect } from "react";
import TransactionsModel from "../Modals/transactionsModel";

interface Transaction {
  id: string;
  reference: string;
  amount: string;
  type: "Withdrawals" | "Payments" | "Deposit";
  date: string;
  status: "Successful" | "Pending" | "Failed";
}

interface TransactionTableProps {
  title?: string;
  onRowSelect?: (selectedIds: string[]) => void;
  /** Status filter from tabs */
  statusFilter?: "All" | "Pending" | "Successful" | "Failed";
  /** Type filter from DepositDropdown */
  typeFilter?: "All" | "Deposit" | "Withdrawals" | "Payments";
  /** Debounced search string */
  searchTerm?: string;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  title = "Latest Transactions",
  onRowSelect,
  statusFilter = "All",
  typeFilter = "All",
  searchTerm = "",
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransactionTable, setSelectedTransactionTable] =
    useState<Transaction | null>(null);

  const transactions: Transaction[] = [
    {
      id: "1",
      reference: "zxcvbnmkljhgfdsA",
      amount: "₦1,000",
      type: "Withdrawals",
      date: "18-07-2025/11:30AM",
      status: "Successful",
    },
    {
      id: "2",
      reference: "poiuytrewqasdfgh",
      amount: "₦12,750",
      type: "Payments",
      date: "18-07-2025/09:05AM",
      status: "Pending",
    },
    {
      id: "3",
      reference: "mnbvcxzlkjhgfdrp",
      amount: "₦50,000",
      type: "Withdrawals",
      date: "17-07-2025/01:45PM",
      status: "Successful",
    },
    {
      id: "4",
      reference: "asdfghzxcvbnqwe",
      amount: "₦5,500",
      type: "Deposit",
      date: "19-07-2025/02:15PM",
      status: "Failed",
    },
    {
      id: "5",
      reference: "qwaszxedcrfvtgby",
      amount: "₦20,000",
      type: "Payments",
      date: "20-07-2025/07:58PM",
      status: "Successful",
    },
    {
      id: "6",
      reference: "qwertyuiopasdfgh",
      amount: "₦2,500",
      type: "Deposit",
      date: "16-07-2025/08:22PM",
      status: "Failed",
    },
    {
      id: "7",
      reference: "jhgfdsapoiuytrew",
      amount: "₦10,000",
      type: "Deposit",
      date: "17-07-2025/10:00AM",
      status: "Successful",
    },
  ];

  const visibleTxs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    const statusOk = (t: Transaction) =>
      statusFilter === "All" ? true : t.status === statusFilter;

    const typeOk = (t: Transaction) =>
      typeFilter === "All" ? true : t.type === typeFilter;

    const searchOk = (t: Transaction) => {
      if (!q) return true;
      return [t.reference, t.amount, t.type, t.date, t.status]
        .join(" ")
        .toLowerCase()
        .includes(q);
    };

    return transactions.filter((t) => statusOk(t) && typeOk(t) && searchOk(t));
  }, [transactions, statusFilter, typeFilter, searchTerm]);

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
